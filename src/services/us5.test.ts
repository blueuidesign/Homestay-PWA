import { beforeEach, expect, test } from "vitest";
import { DieuKhienXinSo, CHU_LOI_MANG } from "../components/xin-so";
import { boNhoHoSo } from "../stores/ho-so";
import {
  banThu,
  getKetNoi,
  getKetNoiChiTiet,
  getLichNgay,
  getLichThang,
  getSaleKetNoi,
  getToi,
  postBooking,
  postKetNoi,
  postKetNoiNgung,
  postLink,
  postLinkDaGui,
  postPhien,
  postTaiKhoan,
  postToiThongTinZalo,
} from "./api";
import { LoiApi } from "./kieu";
import { guiLinkQuaZalo, saoChepLink } from "./link-moi";
import { datCongZalo, type CongZalo, type KetQuaXinSo } from "./zalo";

// US5 · Test chức năng trên server giả: xin số (YC1.5.x), link mời và danh sách sale (YC1.9), đặt phòng cho sale (YC4.1.2-NT3).
// Dữ liệu DLM: Chị Hoa có 1509, 3402, 4 sale đã kết nối, hôm nay 07/10/2026, hồ sơ đã có số 0904 118 772.
const maLoi = (p: Promise<unknown>) => p.then(() => null, (e) => (e instanceof LoiApi ? e.loi : String(e)));
let n = 0;
const khoa = () => `khoa-${++n}-xxxxxxxxxxxxxxxxxxxx`;

// Cổng Zalo giả: đếm số lần gọi, trả kết quả đặt trước
const zaloGia = (kq: KetQuaXinSo = { kq: "co", access_token: "at", token_sdt: "sdt:0904118772", ho_ten: "Nguyễn Hoa", anh_zalo: null }) => {
  const dem = { xin: 0, caiDat: 0, chiaSe: [] as string[], saoChep: [] as string[] };
  const cong: CongZalo & { kq: KetQuaXinSo; chiaSeKq: "da_gui" | "huy" | "loi" } = {
    kq,
    chiaSeKq: "da_gui",
    async xinTenVaSo() {
      dem.xin++;
      return cong.kq;
    },
    async daTuChoiSo() {
      return false;
    },
    async moCaiDatQuyen() {
      dem.caiDat++;
    },
    async chiaSeChu(c) {
      dem.chiaSe.push(c);
      return cong.chiaSeKq;
    },
    async saoChep(c) {
      dem.saoChep.push(c);
      return true;
    },
    async goiDien() {
      return true;
    },
  };
  datCongZalo(cong);
  return { dem, cong };
};

let c1509 = "";
let c3402 = "";
beforeEach(async () => {
  banThu.xoaSach();
  banThu.datDoTre(0);
  banThu.datMatMang(false);
  banThu.napDuLieuMau(false, true);
  boNhoHoSo.xoa();
  datCongZalo(null);
  [c1509, c3402] = (await getLichThang({ thang: "2026-10" })).can.map((c) => c.can_id);
});

// ---- Popup giải thích và luồng "Để sau" (YC1.5.1) ----

test("test_YC1_5_1_NT1_US5_KB2_chua_co_so_bam_gui_link_thi_hien_popup_truoc_zalo", async () => {
  banThu.xoaSoDienThoai();
  const { dem } = zaloGia();
  const dk = new DieuKhienXinSo();
  let viec = 0;
  await dk.chay(() => void viec++);
  expect(dk.mo).not.toBeNull();
  expect(viec).toBe(0); // việc gốc chưa chạy
  expect(dem.xin).toBe(0); // chưa có hộp thoại Zalo
});

test("test_YC1_5_1_NT2_US5_KB9_da_co_so_thi_khong_hien_popup_va_chay_tiep", async () => {
  const { dem } = zaloGia();
  const dk = new DieuKhienXinSo();
  let viec = 0;
  await dk.chay(() => void viec++);
  expect(dk.mo).toBeNull();
  expect(viec).toBe(1);
  expect(dem.xin).toBe(0);
});

test("test_YC1_5_1_NT3_US5_KB2_KB3_de_sau_viec_goc_van_xong_ho_so_van_chua_co_so", async () => {
  banThu.xoaSoDienThoai();
  const { dem } = zaloGia();
  const dk = new DieuKhienXinSo();
  let viec = 0;
  await dk.chay(() => void viec++);
  await dk.deSau();
  expect(viec).toBe(1);
  expect(dk.mo).toBeNull();
  expect(dem.xin).toBe(0); // không có hộp thoại xin quyền
  expect((await getToi()).so_dien_thoai).toBeNull(); // P2 ghi "Chưa có" (YC1.5.3-NT2)
});

// ---- Hộp thoại Zalo (YC1.5.2) ----

test("test_YC1_5_2_NT1_HV4_NT4_US5_KB8_dong_y_mot_lan_co_ca_ten_va_so_roi_lam_tiep", async () => {
  banThu.xoaSoDienThoai();
  const { dem } = zaloGia();
  const dk = new DieuKhienXinSo();
  let viec = 0;
  await dk.chay(() => void viec++);
  await dk.dongY();
  expect(dem.xin).toBe(1); // một lần bấm "Đồng ý, tiếp tục" xin cả tên và số
  expect(viec).toBe(1);
  const h = await getToi();
  expect(h.so_dien_thoai).toBe("0904118772");
  expect(h.ho_ten).toBe("Nguyễn Hoa");
});

test("test_YC1_5_2_NT2_US5_KB9_da_cho_phep_mot_lan_thi_lan_sau_khong_hien_lai_popup", async () => {
  banThu.xoaSoDienThoai();
  zaloGia();
  const dk = new DieuKhienXinSo();
  await dk.chay(() => {});
  await dk.dongY();
  boNhoHoSo.xoa(); // mở app lại: hồ sơ đọc từ server
  const dk2 = new DieuKhienXinSo();
  let viec = 0;
  await dk2.chay(() => void viec++);
  expect(dk2.mo).toBeNull();
  expect(viec).toBe(1);
});

test("test_HV4_NT2_US5_KB5_KB6_tu_choi_khong_loi_bam_lai_hien_popup_co_nut_cai_dat_roi_moi_goi_zalo", async () => {
  banThu.xoaSoDienThoai();
  const { dem, cong } = zaloGia({ kq: "tu_choi" });
  const dk = new DieuKhienXinSo();
  let viec = 0;
  await dk.chay(() => void viec++);
  expect(dk.mo!.daTuChoi).toBe(false); // lần đầu chưa có nút "Mở cài đặt quyền"
  await dk.dongY();
  expect(dk.mo).toBeNull(); // về màn cũ, không báo lỗi
  expect(dk.loi).toBeNull();
  expect(viec).toBe(0);
  expect((await getToi()).so_dien_thoai).toBeNull();
  // Bấm lại: popup giải thích hiện trước, có nút "Mở cài đặt quyền", chưa gọi Zalo lần hai
  await dk.chay(() => void viec++);
  expect(dk.mo!.daTuChoi).toBe(true);
  expect(dem.xin).toBe(1);
  // Chỉ khi bấm "Đồng ý, tiếp tục" mới gọi hộp thoại Zalo lại
  cong.kq = { kq: "co", access_token: "at", token_sdt: "sdt:0911222333", ho_ten: null, anh_zalo: null };
  await dk.dongY();
  expect(dem.xin).toBe(2);
  expect(viec).toBe(1);
  expect((await getToi()).so_dien_thoai).toBe("0911222333");
});

test("test_HV4_buoc4_US5_KB7_nut_mo_cai_dat_quyen_goi_openPermissionSetting", async () => {
  const { dem, cong } = zaloGia();
  await cong.moCaiDatQuyen();
  expect(dem.caiDat).toBe(1);
});

test("test_YC1_5_2_server_1_5_token_het_han_lam_tiep_nhu_de_sau_ho_so_khong_doi", async () => {
  banThu.xoaSoDienThoai();
  banThu.hetHanToken("sdt:0904118772");
  zaloGia();
  const dk = new DieuKhienXinSo();
  let viec = 0;
  await dk.chay(() => void viec++);
  await dk.dongY();
  expect(viec).toBe(1);
  const h = await getToi();
  expect(h.so_dien_thoai).toBeNull();
  expect(h.ho_ten).toBeNull(); // lỗi token thì không ghi cả tên (server.md 1.3)
});

test("test_YC1_5_2_token_dung_mot_lan_va_cung_khoa_khong_doi_token_lan_hai", async () => {
  banThu.xoaSoDienThoai();
  const k = khoa();
  const a = await postToiThongTinZalo({ token_sdt: "sdt:0904118772", ho_ten: "Nguyễn Hoa" }, k, "at");
  const b = await postToiThongTinZalo({ token_sdt: "sdt:0904118772", ho_ten: "Nguyễn Hoa" }, k, "at");
  expect(b).toEqual(a);
  expect(await maLoi(postToiThongTinZalo({ token_sdt: "sdt:0904118772" }, khoa(), "at"))).toBe("TOKEN_SDT_HET_HAN");
  // Thân không có trường nào, hay số điện thoại gõ thẳng: từ chối
  expect(await maLoi(postToiThongTinZalo({}, khoa(), "at"))).toBe("DU_LIEU_SAI");
  expect(await maLoi(postToiThongTinZalo({ so_dien_thoai: "0900000000" } as never, khoa(), "at"))).toBe("DU_LIEU_SAI");
});

test("test_HV2_US5_mat_mang_khi_gui_token_bao_chua_luu_giu_popup_gui_lai_khong_xin_zalo_lan_hai", async () => {
  banThu.xoaSoDienThoai();
  const { dem } = zaloGia();
  const dk = new DieuKhienXinSo();
  let viec = 0;
  await dk.chay(() => void viec++);
  banThu.datMatMang(true);
  await dk.dongY();
  expect(dk.loi).toBe(CHU_LOI_MANG);
  expect(dk.mo).not.toBeNull();
  expect(viec).toBe(0);
  banThu.datMatMang(false);
  await dk.dongY();
  expect(dem.xin).toBe(1); // dùng lại kết quả Zalo đã có, token một lần
  expect(viec).toBe(1);
  expect((await getToi()).so_dien_thoai).toBe("0904118772");
});

// ---- Số điện thoại trong hồ sơ (YC1.5.3) ----

test("test_YC1_5_3_NT1_NT2_ho_so_co_so_va_chua_co_so", async () => {
  expect((await getToi()).so_dien_thoai).toBe("0904118772");
  banThu.xoaSoDienThoai();
  expect((await getToi()).so_dien_thoai).toBeNull();
});

// ---- Link mời (YC1.9 bước 1a) ----

test("test_YC1_9_NT5_US5_KB2_gui_link_de_sau_van_mo_cua_so_zalo_co_link_moi", async () => {
  banThu.xoaSoDienThoai();
  const { dem } = zaloGia();
  const dk = new DieuKhienXinSo();
  await dk.chay(async () => void (await guiLinkQuaZalo()));
  expect(dem.chiaSe).toHaveLength(0); // popup trước, chưa có cửa sổ Zalo
  await dk.deSau();
  expect(dem.chiaSe).toHaveLength(1);
  expect(dem.chiaSe[0]).toMatch(/https:\/\/zalo\.me\/s\/\d+\/\?ma=[A-Za-z0-9_-]{22}/);
});

test("test_YC1_9_buoc_1a_US5_KB4_sao_chep_link_va_dem_moi_lan_gui", async () => {
  const { dem } = zaloGia();
  expect(await saoChepLink()).toBe(true);
  expect(dem.saoChep[0]).toMatch(/^https:\/\/zalo\.me\/s\/\d+\/\?ma=[A-Za-z0-9_-]{22}$/);
  await guiLinkQuaZalo();
  const link = await postLink({ loai: "moi_sale" }, khoa());
  expect(link.so_lan_gui).toBe(2); // sao chép tính một lần, mở cửa sổ gửi tính một lần
  expect(link.gui_cuoi_luc).not.toBeNull();
});

test("test_YC1_9_buoc_1a_cua_so_zalo_loi_thi_khong_dem_lan_gui", async () => {
  const { cong } = zaloGia();
  cong.chiaSeKq = "loi";
  expect(await guiLinkQuaZalo()).toBe("loi");
  expect((await postLink({ loai: "moi_sale" }, khoa())).so_lan_gui).toBe(0);
});

test("test_PQ18_CHU_link_moi_dung_lai_khi_con_han_ma_moi_khi_het_han_va_khong_dem_cua_nguoi_khac", async () => {
  const a = await postLink({ loai: "moi_sale" }, khoa());
  expect(a.ma).toMatch(/^[A-Za-z0-9_-]{22}$/);
  expect(a.duong_dan).toBe(`https://zalo.me/s/0000000000000000000/?ma=${a.ma}`);
  expect((await postLink({ loai: "moi_sale" }, khoa())).ma).toBe(a.ma);
  expect(await maLoi(postLink({ loai: "gui_lich" }, khoa()))).toBe("DU_LIEU_SAI");
  const k = khoa();
  expect((await postLinkDaGui(a.ma, k)).so_lan_gui).toBe(1);
  expect((await postLinkDaGui(a.ma, k)).so_lan_gui).toBe(1); // cùng khóa không đếm lần hai
  banThu.hetHanLink();
  expect((await postLink({ loai: "moi_sale" }, khoa())).ma).not.toBe(a.ma);
  // Chủ nhà khác đếm link của chủ nhà này: KHONG_TIM_THAY
  banThu.dungZaloId("zalo-anh-tuan");
  await postPhien();
  await postTaiKhoan({ vai_chon: "chu_nha", dong_y_dieu_khoan_luc: "2026-11-03T02:00:00.000Z" });
  expect(await maLoi(postLinkDaGui(a.ma, khoa()))).toBe("KHONG_TIM_THAY");
});

// ---- Danh sách sale (YC1.9) ----

test("test_YC1_9_buoc_1_US5_CN7_hai_nhom_ten_va_so_tien_thang_nay_theo_DLM", async () => {
  const ds = await getKetNoi();
  expect(ds.da_ket_noi.map((d) => d.ten_hien_thi)).toEqual(["Sale Hùng", "Sale Lan", "Sale Minh", "Sale Nga"]);
  expect(ds.chua_ket_noi).toEqual([]);
  expect(ds.da_ket_noi.map((d) => d.tong_tien_dat_phong)).toEqual([4000000, 3500000, 1700000, 0]);
  expect(ds.da_ket_noi.map((d) => d.tom_tat)).toEqual([
    { so_dat_phong: 2, so_dem: 4, so_chua_coc: 0, da_thanh_toan_het: false },
    { so_dat_phong: 2, so_dem: 4, so_chua_coc: 1, da_thanh_toan_het: false },
    { so_dat_phong: 2, so_dem: 2, so_chua_coc: 0, da_thanh_toan_het: true },
    { so_dat_phong: 0, so_dem: 0, so_chua_coc: 0, da_thanh_toan_het: false },
  ]);
  // Không có số điện thoại trong danh sách (api/ket-noi-link.md)
  expect(JSON.stringify(ds)).not.toContain("0912");
});

test("test_YC1_9_NT3_US5_KB1_chu_nha_moi_chua_co_sale_thi_hai_nhom_rong", async () => {
  banThu.xoaSach();
  banThu.dungZaloId("zalo-moi");
  await postPhien();
  await postTaiKhoan({ vai_chon: "chu_nha", dong_y_dieu_khoan_luc: "2026-11-03T02:00:00.000Z" });
  const ds = await getKetNoi();
  expect(ds.da_ket_noi).toEqual([]);
  expect(ds.chua_ket_noi).toEqual([]);
});

test("test_YC1_9_NT1_US5_KB14_them_sale_vao_nhom_chua_ket_noi_nhom_da_ket_noi_giu_nguyen", async () => {
  const k = await postKetNoi({ ten: "Sale Quân", so_dien_thoai: "0987 000 222" }, khoa());
  expect(k).toMatchObject({ ten_hien_thi: "Sale Quân", so_dien_thoai: "0987000222", trang_thai: "chua_ket_noi", nguon: "chu_them_tay" });
  const ds = await getKetNoi();
  expect(ds.chua_ket_noi.map((d) => d.ten_hien_thi)).toEqual(["Sale Quân"]);
  expect(ds.da_ket_noi).toHaveLength(4);
});

test("test_YC1_9_buoc_4_US5_KB12_them_sale_thieu_so_hoac_ten_khong_luu", async () => {
  expect(await maLoi(postKetNoi({ ten: "Sale Quân", so_dien_thoai: "" }, khoa()))).toBe("DU_LIEU_SAI");
  expect(await maLoi(postKetNoi({ ten: "Sale Quân", so_dien_thoai: "12345" }, khoa()))).toBe("DU_LIEU_SAI");
  expect(await maLoi(postKetNoi({ ten: "  ", so_dien_thoai: "0987000222" }, khoa()))).toBe("DU_LIEU_SAI");
  expect((await getKetNoi()).chua_ket_noi).toEqual([]);
});

test("test_YC1_9_US5_KB13_KB14_mat_mang_khi_luu_sale_roi_luu_lai_cung_khoa_chi_co_mot_dong", async () => {
  const k = khoa();
  banThu.datMatMang(true);
  expect(await postKetNoi({ ten: "Sale Quân", so_dien_thoai: "0987000222" }, k).then(() => "ok", (e) => e.message)).toBe("MAT_MANG");
  expect((await (async () => (banThu.datMatMang(false), getKetNoi()))()).chua_ket_noi).toEqual([]);
  await postKetNoi({ ten: "Sale Quân", so_dien_thoai: "0987000222" }, k);
  await postKetNoi({ ten: "Sale Quân", so_dien_thoai: "0987000222" }, k);
  expect((await getKetNoi()).chua_ket_noi).toHaveLength(1);
});

test("test_PQ17_CHU_sale_goi_danh_sach_sale_va_chu_nha_khac_ngung_sale_cua_chu_nha_nay", async () => {
  const hung = (await getKetNoi()).da_ket_noi[0].id;
  // Chủ nhà B không thấy, không mở, không ngừng sale của chủ nhà A (Chị Hoa)
  banThu.dungZaloId("zalo-anh-tuan");
  await postPhien();
  await postTaiKhoan({ vai_chon: "chu_nha", dong_y_dieu_khoan_luc: "2026-11-03T02:00:00.000Z" });
  expect((await getKetNoi()).da_ket_noi).toEqual([]);
  expect(await maLoi(getKetNoiChiTiet(hung))).toBe("KHONG_TIM_THAY");
  expect(await maLoi(postKetNoiNgung(hung, khoa()))).toBe("KHONG_TIM_THAY");
  // Sale (vai sale) gọi danh sách sale của chủ nhà: như không có
  banThu.dungZaloId("zalo-sale-hung");
  await postPhien();
  await postTaiKhoan({ vai_chon: "sale", dong_y_dieu_khoan_luc: "2026-11-03T02:00:00.000Z" });
  expect(await maLoi(getKetNoi())).toBe("KHONG_TIM_THAY");
  expect(await maLoi(postKetNoi({ ten: "A", so_dien_thoai: "0987000222" }, khoa()))).toBe("KHONG_TIM_THAY");
  // Chị Hoa vẫn nguyên
  banThu.dungZaloId("zalo-chi-hoa");
  await postPhien();
  expect((await getKetNoi()).da_ket_noi).toHaveLength(4);
});

// ---- Chi tiết sale và ngừng cho xem (YC1.9 bước 5, 6) ----

test("test_YC1_9_buoc_5_US5_CN7_04_chi_tiet_sale_so_dien_thoai_ngay_ket_noi_va_dat_phong", async () => {
  const ds = await getKetNoi();
  const ct = await getKetNoiChiTiet(ds.da_ket_noi[0].id);
  expect(ct).toMatchObject({ ten_hien_thi: "Sale Hùng", so_dien_thoai: "0912345678", ket_noi_luc: "2026-08-02T10:00:00+07:00" });
  expect(ct.dat_phong.map((d) => [d.ma_can, d.ngay_nhan, d.ngay_tra, d.tien_phong, d.trang_thai_tien])).toEqual([
    ["1509", "2026-10-10", "2026-10-12", 2200000, "da_coc_con_thu"],
    ["1509", "2026-10-04", "2026-10-06", 1800000, "da_thanh_toan"],
  ]);
  // Sale chưa cho số thì không có số (PQ2.CHU); không có giá bán, không có khách (PQ11.CHU, QD11)
  const nga = await getKetNoiChiTiet(ds.da_ket_noi[3].id);
  expect(nga.so_dien_thoai).toBeNull();
  expect(JSON.stringify(ct)).not.toMatch(/gia_ban|ten_khach/);
});

test("test_YC1_9_NT2_US5_KB16_ngung_cho_xem_sale_roi_nhom_dat_phong_cu_van_con", async () => {
  const hung = (await getKetNoi()).da_ket_noi[0].id;
  const k = khoa();
  expect(await postKetNoiNgung(hung, k)).toEqual({ id: hung, trang_thai: "chu_ngung" });
  expect(await postKetNoiNgung(hung, k)).toEqual({ id: hung, trang_thai: "chu_ngung" }); // bấm hai lần: như lần đầu
  expect((await postKetNoiNgung(hung, khoa())).trang_thai).toBe("chu_ngung");
  expect((await getKetNoi()).da_ket_noi.map((d) => d.ten_hien_thi)).toEqual(["Sale Lan", "Sale Minh", "Sale Nga"]);
  expect((await getSaleKetNoi()).map((s) => s.ten)).toEqual(["Sale Lan", "Sale Nga", "Sale Minh"]); // chip CN4 bỏ Hùng
  // Đặt phòng cũ của Sale Hùng vẫn còn trong lịch (B1 ngày 10/10)
  const ngay = await getLichlich("2026-10-10");
  expect(ngay).toMatchObject({ trong: false, dat_phong: { nguoi_dat: { loai: "sale", ten: "Sale Hùng" } } });
});

async function getLichlich(ngay: string) {
  const l = await getLichNgay({ ngay });
  return l.can.find((c) => c.ma_can === "1509");
}

test("test_YC1_9_buoc_6_ngung_dong_khong_con_da_ket_noi_thi_trang_thai_da_doi", async () => {
  const k = await postKetNoi({ ten: "Sale Quân", so_dien_thoai: "0987000222" }, khoa());
  expect(await maLoi(postKetNoiNgung(k.id, khoa()))).toBe("TRANG_THAI_DA_DOI");
});

// ---- Đặt phòng chủ nhà ghi cho sale (YC4.1.2-NT3) ----

test("test_YC4_1_2_NT3_US5_KB15_chip_sale_da_ket_noi_va_dat_phong_hien_o_chi_tiet_sale", async () => {
  await postKetNoi({ ten: "Sale Quân", so_dien_thoai: "0987000222" }, khoa());
  const chip = await getSaleKetNoi();
  expect(chip.map((s) => s.ten)).toEqual(["Sale Hùng", "Sale Lan", "Sale Nga", "Sale Minh"]); // không có Sale Quân (chưa kết nối)
  const hung = chip[0];
  const dp = await postBooking(
    {
      can_id: c3402, sale_id: hung.sale_id, ngay_nhan: "2026-10-08", ngay_tra: "2026-10-09", ten_khach: null,
      tien_phong: 800000, trang_thai_tien: "chua_coc", tien_coc: null, so_khach: null, gio_nhan: null, gio_tra: null, ghi_chu: null,
    },
    khoa(),
  );
  expect(dp.nguoi_dat).toMatchObject({ loai: "sale", sale_id: hung.sale_id, ten: "Sale Hùng" });
  const ct = await getKetNoiChiTiet(hung.sale_id);
  expect(ct.dat_phong.find((d) => d.ngay_nhan === "2026-10-08")).toMatchObject({ ma_can: "3402", ngay_tra: "2026-10-09" });
  // Sale Lan không thấy đặt phòng của Hùng ở chi tiết của mình (đặt phòng tính cho đúng sale)
  expect((await getKetNoiChiTiet(chip[1].sale_id)).dat_phong.some((d) => d.ngay_nhan === "2026-10-08")).toBe(false);
});

test("test_YC4_1_3_NT5_US5_dat_phong_cho_sale_chua_ket_noi_hoac_kem_ten_khach_bi_tu_choi", async () => {
  const quan = await postKetNoi({ ten: "Sale Quân", so_dien_thoai: "0987000222" }, khoa());
  const than = (sale_id: string, ten_khach: string | null) => ({
    can_id: c3402, sale_id, ngay_nhan: "2026-10-08", ngay_tra: "2026-10-09", ten_khach,
    tien_phong: 800000, trang_thai_tien: "chua_coc" as const, tien_coc: null, so_khach: null, gio_nhan: null, gio_tra: null, ghi_chu: null,
  });
  expect(await maLoi(postBooking(than(quan.id, null), khoa()))).toBe("DU_LIEU_SAI");
  const hung = (await getSaleKetNoi())[0];
  expect(await maLoi(postBooking(than(hung.sale_id, "Anh Nam"), khoa()))).toBe("DU_LIEU_SAI");
  // Đặt phòng sau khi bị ngừng: DU_LIEU_SAI (sale không còn da_ket_noi)
  await postKetNoiNgung(hung.sale_id, khoa());
  expect(await maLoi(postBooking(than(hung.sale_id, null), khoa()))).toBe("DU_LIEU_SAI");
});
