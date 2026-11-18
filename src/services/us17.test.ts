import { beforeEach, expect, test } from "vitest";
import { chonToastMoi, toastDongY, CHU_PHU_CHUA_CO_CAN } from "../components/thong-bao-hien-thi";
import { boNhoHoSo } from "../stores/ho-so";
import { layVai } from "../stores/vai";
import {
  banThu,
  getKetNoi,
  getKetNoiChiTiet,
  getLink,
  getLinkXemTruoc,
  getSaleLich,
  getThongBao,
  getXinLichThongKe,
  postKetNoiNgung,
  postLink,
  postLinkDaGui,
  postLinkDongY,
  postLinkThemLich,
  postPhien,
  postTaiKhoan,
  postThongBaoDaDoc,
  postToiThongTinZalo,
} from "./api";
import { LoiApi, type MucThongBao } from "./kieu";
import { dongYXinLich, moLink } from "./mo-link";
import { guiXinLichQuaZalo, saoChepXinLich, tinXinLich } from "./xin-lich";
import { datCongZalo, type CongZalo } from "./zalo";

// US17 · Test chức năng trên server giả: sale xin lịch (mục "Sale xin chủ nhà cho xem lịch" (US17)), chủ nhà duyệt (mục "Chủ nhà duyệt lời mời xem lịch" (US17)), toast và thông báo (mục "Thông báo kết quả kết nối cho sale" (US17)), ngừng (US17-NT9).
// Dữ liệu DLM: hôm nay 07/10/2026. Chị Hoa có ICON40 1509 và 3402; Anh Tuấn có Sapphire 1103 và À La Carte 2208; Hùng đã kết nối cả hai.
// "Zalo thử B" là sale mới chưa kết nối ai, nhập tên Zalo, số điện thoại cho khi cần.
const maLoi = (p: Promise<unknown>) => p.then(() => null, (e) => (e instanceof LoiApi ? e.loi : String(e)));
let n = 0;
const khoa = () => `khoa-us17-${++n}-xxxxxxxxxxxxxxxx`;
const DONG_Y = "2026-10-07T01:00:00.000Z";

// Đổi người dùng Zalo trên máy rồi mở phiên mới, như mở app bằng Zalo khác
const dung = async (zaloId: string, ten?: string) => {
  banThu.dungZaloId(zaloId, ten);
  return postPhien();
};
// Sale mới: Zalo thử B vào app, chọn vai sale. coSo: đã cho số điện thoại (token thử "sdt:…")
const saleMoi = async (coSo = true) => {
  await dung("zalo-thu-b", "Sale Bình");
  await postTaiKhoan({ vai_chon: "sale", dong_y_dieu_khoan_luc: DONG_Y });
  if (coSo) await postToiThongTinZalo({ token_sdt: "sdt:0987654321" }, khoa(), "at");
};
const linkXin = async () => (await postLink({ loai: "xin_lich" }, khoa())).ma;
const zaloGia = () => {
  const dem = { chiaSe: [] as string[], saoChep: [] as string[] };
  const cong: CongZalo & { chiaSeKq: "da_gui" | "huy" | "loi" } = {
    chiaSeKq: "da_gui",
    async xinTenVaSo() {
      return { kq: "tu_choi" as const };
    },
    async daTuChoiSo() {
      return false;
    },
    async moCaiDatQuyen() {},
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

beforeEach(() => {
  banThu.xoaSach();
  banThu.datDoTre(0);
  banThu.datMatMang(false);
  boNhoHoSo.xoa();
  datCongZalo(null);
  banThu.napDuLieuSale("moi");
});

// ---- A6: link xin lịch (mục "Sale xin chủ nhà cho xem lịch" (US17) bước 1, NT4) ----

test("test_YC1_6_NT4_US17_KB3_link_xin_lich_dang_zalo_me_s_khong_home247_khong_so_dien_thoai_va_mot_link_cho_moi_sale", async () => {
  await saleMoi();
  const l = await postLink({ loai: "xin_lich" }, khoa());
  expect(l.loai).toBe("xin_lich");
  expect(l.duong_dan.startsWith("https://zalo.me/s/")).toBe(true);
  expect(l.duong_dan).not.toContain("home247.vn");
  expect(l.duong_dan).not.toMatch(/0987654321|987654321|87654321|4321/); // không có chữ số nào của số điện thoại sale (hai đầu, bốn số cuối)
  expect(l.het_han_luc).toBeNull();
  // Mỗi sale một link: lần sau trả lại đúng link đó (quy tắc Một link xin lịch nhiều chủ nhà)
  expect((await postLink({ loai: "xin_lich" }, khoa())).ma).toBe(l.ma);
  expect(tinXinLich("Sale Bình", l.duong_dan)).toContain("Chào anh/chị, em là Sale Bình, sale phòng ở Hạ Long.");
  expect(tinXinLich("Sale Bình", l.duong_dan)).toContain(l.duong_dan);
  expect(tinXinLich(null, l.duong_dan)).toContain("Chào anh/chị, em là sale phòng ở Hạ Long.");
});

test("test_PQ18_SALE_US17_chu_nha_hoac_nguoi_chua_dang_nhap_khong_lay_duoc_link_xin_lich_va_sale_khac_khong_dem_link_cua_sale_a", async () => {
  await dung("zalo-chi-hoa");
  expect(await maLoi(postLink({ loai: "xin_lich" }, khoa()))).toBe("KHONG_TIM_THAY");
  expect(await maLoi(getXinLichThongKe())).toBe("KHONG_TIM_THAY");
  await dung("zalo-thu-c"); // phiên tạm, chưa có tài khoản
  expect(await maLoi(postLink({ loai: "xin_lich" }, khoa()))).toBe("CHUA_DANG_NHAP");
  await saleMoi();
  const ma = await linkXin();
  await dung("zalo-sale-lan");
  expect(await maLoi(postLinkDaGui(ma, khoa()))).toBe("KHONG_TIM_THAY");
  await dung("zalo-thu-b");
  expect((await getXinLichThongKe()).so_lan_gui).toBe(0); // Lan không tăng số của Bình
});

// ---- A6 gửi, sao chép và A7 (mục "Sale xin chủ nhà cho xem lịch" (US17) bước 2, 3, 4, NT2, NT3) ----

test("test_YC1_6_NT1_buoc_2_4_US17_KB4_KB6_gui_qua_zalo_va_sao_chep_deu_dem_mot_lan_dong_cua_so_khong_gui_thi_khong_dem", async () => {
  await saleMoi();
  const { dem, cong } = zaloGia();
  const link = await postLink({ loai: "xin_lich" }, khoa());
  const tin = tinXinLich("Sale Bình", link.duong_dan);
  expect(await guiXinLichQuaZalo(link, tin)).toBe("da_gui");
  expect(dem.chiaSe).toEqual([tin]); // cửa sổ gửi mở với đúng nội dung và link
  expect((await getXinLichThongKe()).so_lan_gui).toBe(1);
  cong.chiaSeKq = "huy";
  expect(await guiXinLichQuaZalo(link, tin)).toBe("huy");
  expect((await getXinLichThongKe()).so_lan_gui).toBe(1); // đóng cửa sổ mà chưa gửi: không đếm
  expect(await saoChepXinLich(link, tin)).toBe(true); // sao chép cũng tính một lần
  expect(dem.saoChep).toEqual([tin]);
  expect((await getXinLichThongKe()).so_lan_gui).toBe(2);
});

test("test_YC1_6_NT2_NT3_US17_KB5_KB9_A7_chi_co_hai_con_so_khong_ten_chu_nha_va_tang_khi_chu_nha_dong_y", async () => {
  await saleMoi();
  const ma = await linkXin();
  for (let i = 0; i < 3; i++) await postLinkDaGui(ma, khoa());
  const tk = await getXinLichThongKe();
  expect(Object.keys(tk).sort()).toEqual(["gui_cuoi_luc", "so_chu_nha_dong_y", "so_lan_gui"]); // chỉ hai số và lần gửi gần nhất
  expect(tk.so_lan_gui).toBe(3);
  expect(tk.so_chu_nha_dong_y).toBe(0);
  expect(typeof tk.gui_cuoi_luc).toBe("string");
  expect(JSON.stringify(tk)).not.toMatch(/Hoa|Tuấn|chu_nha_id/);
  await dung("zalo-chi-hoa");
  await postLinkDongY(ma, { quyen_tinh_trang_coc: true }, khoa());
  await dung("zalo-thu-b");
  expect((await getXinLichThongKe()).so_chu_nha_dong_y).toBe(1);
});

// ---- A8: chủ nhà mở link xin lịch (mục "Chủ nhà duyệt lời mời xem lịch" (US17) bước 2, NT1, NT4) ----

test("test_YC1_7_NT1_US17_KB7_chu_nha_mo_link_thay_dung_ten_va_so_dien_thoai_sale_dang_xin", async () => {
  await saleMoi();
  const ma = await linkXin();
  await dung("zalo-chi-hoa");
  const x = await getLinkXemTruoc(ma);
  expect(x).toEqual({ loai: "xin_lich", het_han_luc: null, sale: { ten_hien_thi: "Sale Bình", so_dien_thoai: "0987654321" } });
  expect(await moLink(ma)).toMatchObject({ man: "a8", coTaiKhoan: true, xin: { sale: { ten_hien_thi: "Sale Bình" } } });
  // Link xin lịch không phải link mời: getLink, them-lich coi như không dùng được (PQ3.LINK)
  expect(await maLoi(getLink(ma))).toBe("LINK_KHONG_DUNG_DUOC");
  expect(await maLoi(postLinkThemLich(ma, khoa()))).toBe("LINK_KHONG_DUNG_DUOC");
});

test("test_YC1_5_1_US17_KB14_sale_chua_cho_so_thi_A8_chi_co_ten_khong_co_so_dien_thoai", async () => {
  await saleMoi(false);
  const ma = await linkXin();
  await dung("zalo-chi-hoa");
  const x = await getLinkXemTruoc(ma);
  expect("sale" in x && x.sale).toEqual({ ten_hien_thi: "Sale Bình", so_dien_thoai: null });
});

test("test_PQ18_CHU_US17_KB20_link_xin_lich_can_phien_nguoi_chua_co_tai_khoan_mo_duoc_bang_phien_tam_con_sale_thi_khong", async () => {
  await saleMoi();
  const ma = await linkXin();
  await dung("zalo-thu-c", "Zalo thử C"); // phiên tạm: người chưa có tài khoản xem được tên và số sale (server.md 1.4)
  expect(await getLinkXemTruoc(ma)).toMatchObject({ loai: "xin_lich", sale: { ten_hien_thi: "Sale Bình" } });
  expect(await moLink(ma)).toMatchObject({ man: "a8", coTaiKhoan: false });
  await dung("zalo-sale-lan");
  expect(await maLoi(getLinkXemTruoc(ma))).toBe("KHONG_DUOC_PHEP"); // sale không duyệt link xin lịch (PQ18.SALE)
  expect(await moLink(ma)).toEqual({ man: "a8_01" });
});

// ---- A8: đồng ý (mục "Chủ nhà duyệt lời mời xem lịch" (US17) bước 3, 5, NT3), thông báo (US17-NT10, PQ19.SALE) ----

test("test_YC1_7_NT3_YC1_10_NT1_US17_KB8_chu_nha_dong_y_thi_sale_vao_CN7_va_sale_nhan_mot_thong_bao_khong_gia", async () => {
  await saleMoi();
  const ma = await linkXin();
  await dung("zalo-chi-hoa");
  const kq = await postLinkDongY(ma, { quyen_tinh_trang_coc: true }, khoa());
  expect(kq).toMatchObject({ trang_thai: "da_ket_noi", ten_hien_thi_sale: "Sale Bình", quyen_tinh_trang_coc: true });
  expect((await getKetNoi()).da_ket_noi.map((d) => d.ten_hien_thi)).toContain("Sale Bình"); // CN7
  // Sale: lịch có hai căn của Chị Hoa, một thông báo, toast theo A9
  await dung("zalo-thu-b");
  expect((await getSaleLich()).can.map((c) => c.ma_can).sort()).toEqual(["1509", "3402"]);
  const ds = await getThongBao({ gioi_han: 20 });
  expect(ds.so_chua_doc).toBe(1);
  expect(ds.muc).toHaveLength(1);
  const m = ds.muc[0];
  expect(m).toMatchObject({ loai: "chu_dong_y_ket_noi", da_doc_luc: null });
  expect(m.du_lieu_gom).toHaveLength(1); // như server thật: dòng có khoa_gom luôn có du_lieu_gom, kể cả nhóm một dòng
  expect(m.du_lieu).toMatchObject({ ten_chu_nha: "Chị Hoa", so_can: 2 });
  expect(JSON.stringify(m)).not.toMatch(/gia|tien|khach|so_dien_thoai/); // PQ19.SALE
  expect(toastDongY([m.du_lieu])).toEqual({ chu: "Chị Hoa đã đồng ý cho bạn xem lịch", phu: "ICON40 1509 và 3402 đã vào Nguồn phòng" });
  // Chị Hoa không nhận thông báo này (PQ19.CHU)
  await dung("zalo-chi-hoa");
  expect((await getThongBao()).muc.some((x) => x.loai === "chu_dong_y_ket_noi")).toBe(false);
});

test("test_HV1_US17_chu_nha_bam_dong_y_hai_lan_cung_khoa_thi_chi_mot_ket_noi_va_mot_thong_bao", async () => {
  await saleMoi();
  const ma = await linkXin();
  await dung("zalo-chi-hoa");
  const k = khoa();
  const a = await postLinkDongY(ma, { quyen_tinh_trang_coc: true }, k);
  const b = await postLinkDongY(ma, { quyen_tinh_trang_coc: true }, k);
  expect(b).toEqual(a);
  // Khóa khác, đã kết nối rồi: trả dòng cũ, không đổi quyền, không thông báo lần hai
  const c = await postLinkDongY(ma, { quyen_tinh_trang_coc: false }, khoa());
  expect(c).toMatchObject({ ket_noi_id: a.ket_noi_id, quyen_tinh_trang_coc: true });
  expect((await getKetNoi()).da_ket_noi.filter((d) => d.ten_hien_thi === "Sale Bình")).toHaveLength(1);
  await dung("zalo-thu-b");
  expect((await getThongBao()).muc).toHaveLength(1);
});

test("test_YC1_7_NT2_QD20_r2_US17_A8_chi_con_quyen_coc_gia_luon_hien_va_quyen_coc_luu_dung", async () => {
  await saleMoi();
  const ma = await linkXin();
  await dung("zalo-chi-hoa");
  const kq = await dongYXinLich(ma, { coc: false, coTaiKhoan: true }, khoa());
  expect(kq).toEqual({ loai: "da_dong_y", ten: "Sale Bình", chuNhaMoi: false });
  const id = (await getKetNoi()).da_ket_noi.find((d) => d.ten_hien_thi === "Sale Bình")!.id;
  expect((await getKetNoiChiTiet(id)).quyen_tinh_trang_coc).toBe(false);
  // Thân gửi lên chỉ có quyền cọc: sai kiểu thì DU_LIEU_SAI
  expect(await maLoi(postLinkDongY(ma, { quyen_tinh_trang_coc: "co" as unknown as boolean }, khoa()))).toBe("DU_LIEU_SAI");
  // Sale vẫn thấy giá bán ở ô trống của căn chia sẻ (giá không còn là quyền)
  await dung("zalo-thu-b");
  const l = await getSaleLich();
  const o = l.can.find((c) => c.ma_can === "1509")!.o;
  expect(o.some((x) => x.trang_thai === "trong" && typeof x.gia_ban === "number")).toBe(true);
});

test("test_YC1_7_buoc_3_US17_chu_nha_chua_co_tai_khoan_dong_y_thi_tao_tai_khoan_chu_nha_roi_ket_noi_A4_01", async () => {
  await saleMoi();
  const ma = await linkXin();
  await dung("zalo-chu-moi", "Chú Bình");
  const man = await moLink(ma);
  expect(man).toMatchObject({ man: "a8", coTaiKhoan: false });
  const kq = await dongYXinLich(ma, { coc: true, coTaiKhoan: false }, khoa());
  expect(kq).toEqual({ loai: "da_dong_y", ten: "Sale Bình", chuNhaMoi: true });
  expect(layVai()).toBe("chu_nha");
  expect((await getKetNoi()).da_ket_noi.map((d) => d.ten_hien_thi)).toEqual(["Sale Bình"]);
  // Chủ nhà mới chưa có căn: sale nhận thông báo với 0 căn, toast nói căn sẽ vào khi chủ nhà thêm căn
  await dung("zalo-thu-b");
  const m = (await getThongBao()).muc[0];
  expect(m.du_lieu).toMatchObject({ ten_chu_nha: "Chú Bình", so_can: 0, can: [] });
  expect(toastDongY([m.du_lieu])).toEqual({ chu: "Chú Bình đã đồng ý cho bạn xem lịch", phu: CHU_PHU_CHUA_CO_CAN });
});

test("test_YC1_7_NT4_US17_KB15_A8_01_link_cua_sale_da_bi_ngung_hoac_da_rut_quyen_khong_ten_khong_so_khong_tao_ket_noi", async () => {
  await saleMoi();
  const ma = await linkXin();
  await dung("zalo-chi-hoa");
  await dongYXinLich(ma, { coc: true, coTaiKhoan: true }, khoa());
  const id = (await getKetNoi()).da_ket_noi.find((d) => d.ten_hien_thi === "Sale Bình")!.id;
  await postKetNoiNgung(id, khoa());
  // Mở lại thẻ cũ: A8-01, không có tên, số, không kết nối lại (PQ17.CHU, PQ18.CHU)
  const e = await getLinkXemTruoc(ma).catch((x) => x);
  expect(e).toBeInstanceOf(LoiApi);
  expect(e.loi).toBe("LINK_KHONG_DUNG_DUOC");
  expect(JSON.stringify({ loi: e.loi, ly_do: e.ly_do })).not.toMatch(/Bình|0987/);
  expect(await moLink(ma)).toEqual({ man: "a8_01" });
  expect(await dongYXinLich(ma, { coc: true, coTaiKhoan: true }, khoa())).toEqual({ loai: "loi_link" });
  expect((await getKetNoi()).da_ket_noi.find((d) => d.ten_hien_thi === "Sale Bình")).toBeUndefined();
  // Sale đã rút quyền: chủ nhà khác không đồng ý được (QD18 r9), không tạo kết nối
  await dung("zalo-anh-tuan");
  banThu.saleRutQuyen("zalo-thu-b");
  expect(await maLoi(postLinkDongY(ma, { quyen_tinh_trang_coc: true }, khoa()))).toBe("KHONG_CON_QUYEN");
  expect(await dongYXinLich(ma, { coc: true, coTaiKhoan: true }, khoa())).toEqual({ loai: "loi_link" });
  expect((await getKetNoi()).da_ket_noi.map((d) => d.ten_hien_thi)).not.toContain("Sale Bình");
  // Tên cũ vẫn hiện ở A8 (QD18 r10), số điện thoại đã xóa
  const x = await getLinkXemTruoc(ma);
  expect("sale" in x && x.sale).toEqual({ ten_hien_thi: "Sale Bình", so_dien_thoai: null });
});

// ---- Thông báo: gom, đã đọc, ngừng (US17-NT11, US17-NT3, US17-NT9) ----

test("test_YC1_10_NT2_US17_KB11_hai_chu_nha_dong_y_trong_10_phut_thi_mot_muc_gom_va_mot_toast", async () => {
  await saleMoi();
  const ma = await linkXin();
  await dung("zalo-chi-hoa");
  await postLinkDongY(ma, { quyen_tinh_trang_coc: true }, khoa());
  await dung("zalo-anh-tuan");
  await postLinkDongY(ma, { quyen_tinh_trang_coc: true }, khoa());
  await dung("zalo-thu-b");
  const ds = await getThongBao();
  expect(ds.muc).toHaveLength(1);
  expect(ds.so_chua_doc).toBe(1); // nhóm gom tính một (US17-NT12)
  expect(ds.muc[0].ids).toHaveLength(2);
  expect(ds.muc[0].du_lieu_gom).toHaveLength(2);
  const st = { daThay: new Set<string>() };
  expect(chonToastMoi(ds.muc, st)).toEqual({ chu: "2 chủ nhà đã đồng ý cho bạn xem lịch", phu: "Chị Hoa và Anh Tuấn · 4 căn mới trong Nguồn phòng" });
});

test("test_YC1_10_NT2_US17_hai_lan_dong_y_cach_nhau_qua_10_phut_thi_hai_muc_rieng", async () => {
  await saleMoi();
  const ma = await linkXin();
  await dung("zalo-chi-hoa");
  await postLinkDongY(ma, { quyen_tinh_trang_coc: true }, khoa());
  banThu.luiGioThongBao(11 * 60 * 1000);
  await dung("zalo-anh-tuan");
  await postLinkDongY(ma, { quyen_tinh_trang_coc: true }, khoa());
  await dung("zalo-thu-b");
  const ds = await getThongBao();
  expect(ds.muc).toHaveLength(2);
  expect(ds.so_chua_doc).toBe(2);
  expect(ds.muc[0].du_lieu.ten_chu_nha).toBe("Anh Tuấn"); // mới trước
});

test("test_YC1_10_buoc_1_US17_KB8_chon_toast_lan_hoi_dau_chi_ghi_nho_lan_sau_co_dong_y_moi_thi_toast_mot_lan", async () => {
  await saleMoi();
  const ma = await linkXin();
  const st = { daThay: null as Set<string> | null };
  expect(chonToastMoi((await getThongBao({ gioi_han: 20 })).muc, st)).toBeNull(); // lần đầu: chưa có gì
  await dung("zalo-chi-hoa");
  await postLinkDongY(ma, { quyen_tinh_trang_coc: true }, khoa());
  await dung("zalo-thu-b");
  const t = chonToastMoi((await getThongBao({ gioi_han: 20 })).muc, st);
  expect(t?.chu).toBe("Chị Hoa đã đồng ý cho bạn xem lịch");
  expect(chonToastMoi((await getThongBao({ gioi_han: 20 })).muc, st)).toBeNull(); // đã toast rồi
  // Thông báo cũ có từ trước lần hỏi đầu không toast
  const st2 = { daThay: null as Set<string> | null };
  expect(chonToastMoi((await getThongBao({ gioi_han: 20 })).muc, st2)).toBeNull();
});

test("test_YC1_10_NT3_US17_KB16_so_chua_doc_khop_so_muc_chua_doc_va_danh_dau_da_doc_ve_0", async () => {
  await saleMoi();
  const ma = await linkXin();
  await dung("zalo-chi-hoa");
  await postLinkDongY(ma, { quyen_tinh_trang_coc: true }, khoa());
  await dung("zalo-anh-tuan");
  await postLinkDongY(ma, { quyen_tinh_trang_coc: true }, khoa());
  banThu.luiGioThongBao(0);
  await dung("zalo-thu-b");
  let ds = await getThongBao();
  expect(ds.so_chua_doc).toBe(ds.muc.filter((m) => m.da_doc_luc === null).length);
  // Chạm một dòng gom: mọi id của mục thành đã đọc
  expect(await postThongBaoDaDoc({ ids: ds.muc[0].ids })).toEqual({ so_chua_doc: 0 });
  ds = await getThongBao();
  expect(ds.muc[0].da_doc_luc).not.toBeNull();
  // "Đánh dấu đã đọc" (tat_ca)
  expect(await postThongBaoDaDoc({ tat_ca: true })).toEqual({ so_chua_doc: 0 });
});

test("test_PQ19_SALE_US17_sale_danh_dau_thong_bao_cua_nguoi_khac_bi_tu_choi_va_tat_ca_chi_doi_cua_minh", async () => {
  await saleMoi();
  const ma = await linkXin();
  await dung("zalo-chi-hoa");
  await postLinkDongY(ma, { quyen_tinh_trang_coc: true }, khoa());
  await dung("zalo-thu-b");
  const id = (await getThongBao()).muc[0].id;
  await dung("zalo-sale-lan");
  expect(await maLoi(postThongBaoDaDoc({ ids: [id] }))).toBe("KHONG_TIM_THAY");
  expect((await getThongBao()).muc.some((m) => m.id === id)).toBe(false); // không thấy thông báo của người khác
  await postThongBaoDaDoc({ tat_ca: true });
  await dung("zalo-thu-b");
  expect((await getThongBao()).so_chua_doc).toBe(1); // thông báo của Bình không đổi
  expect(await maLoi(postThongBaoDaDoc({} as never))).toBe("DU_LIEU_SAI");
  expect(await maLoi(getThongBao({ gioi_han: 101 }))).toBe("DU_LIEU_SAI");
});

test("test_YC1_9_NT6_QD20_diem_4_US17_KB18_chu_nha_ngung_thi_sale_nhan_mot_thong_bao_khong_gia_va_lich_khong_con_can", async () => {
  await dung("zalo-chi-hoa");
  const hung = (await getKetNoi()).da_ket_noi.find((d) => d.ten_hien_thi === "Sale Hùng")!;
  await postKetNoiNgung(hung.id, khoa());
  await postKetNoiNgung(hung.id, khoa()); // gọi lại: không thêm thông báo
  await dung("zalo-sale-hung");
  const ds = await getThongBao();
  const ngung = ds.muc.filter((m) => m.loai === "chu_ngung_ket_noi");
  expect(ngung).toHaveLength(1);
  expect(ngung[0].du_lieu).toEqual({ ket_noi_id: hung.id, ten_chu_nha: "Chị Hoa" });
  expect(JSON.stringify(ngung[0])).not.toMatch(/gia|tien|khach|so_dien_thoai/);
  expect((await getSaleLich()).can.map((c) => c.ma_can).sort()).toEqual(["1103", "2208"]); // không còn căn của Chị Hoa
});

test("test_HV2_US17_mat_mang_thi_cac_ham_moi_bao_LoiMang_va_khong_ghi_gi", async () => {
  await saleMoi();
  const ma = await linkXin();
  await dung("zalo-chi-hoa");
  banThu.datMatMang(true);
  expect(await maLoi(postLinkDongY(ma, { quyen_tinh_trang_coc: true }, khoa()))).toMatch(/Error|LoiMang/);
  expect(await maLoi(getThongBao())).toMatch(/Error|LoiMang/);
  banThu.datMatMang(false);
  expect((await getKetNoi()).da_ket_noi.map((d) => d.ten_hien_thi)).not.toContain("Sale Bình");
});
