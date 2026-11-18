import { beforeEach, expect, test } from "vitest";
import { DieuKhienXinSo } from "../components/xin-so";
import { boNhoHoSo } from "../stores/ho-so";
import { layVai } from "../stores/vai";
import {
  banThu,
  getKetNoi,
  getLink,
  getSaleLich,
  getToi,
  postBooking,
  postCan,
  postKetNoiNgung,
  postLinkThemLich,
  postPhien,
} from "./api";
import { LoiApi, LoiMang, type LichSale } from "./kieu";
import { batDauTuLink, moLink, themLich } from "./mo-link";
import { datCongZalo, type CongZalo } from "./zalo";

// US6 · Test chức năng trên server giả: mở link mời (mục "Mở app từ link mời của chủ nhà" (US6)), chọn vai sale (mục "Chọn vai trò" (US1)), lịch 7 ngày (mục "Lịch phòng 7 ngày" (US16)), quyền của sale.
// Dữ liệu DLM: hôm nay 07/10/2026. Hùng kết nối Chị Hoa và Anh Tuấn; Lan chỉ Chị Hoa; Zalo thử B là người mới.
const maLoi = (p: Promise<unknown>) => p.then(() => null, (e) => (e instanceof LoiApi ? e.loi : String(e)));
let n = 0;
const khoa = () => `khoa-us6-${++n}-xxxxxxxxxxxxxxxx`;
let ma = { anh_tuan: "", chi_hoa: "" };

// Đổi người dùng Zalo trên máy rồi mở phiên mới, như mở app bằng Zalo khác
const dung = async (zaloId: string, ten?: string) => {
  banThu.dungZaloId(zaloId, ten);
  return postPhien();
};

beforeEach(() => {
  banThu.xoaSach();
  banThu.datDoTre(0);
  banThu.datMatMang(false);
  boNhoHoSo.xoa();
  ma = banThu.napDuLieuSale("moi");
});

const o = (l: LichSale, canMa: string) => l.can.find((c) => c.ma_can === canMa)!.o;
const trangThai = (l: LichSale, canMa: string, ngay: string) => o(l, canMa).find((x) => x.ngay === ngay)!;

test("test_YC1_3_NT2_US6_KB4_xem_truoc_link_co_ten_chu_nha_so_can_anh_va_khong_co_gia_nao", async () => {
  const x = await getLink(ma.anh_tuan); // không cần phiên (PQ3.LINK)
  expect(x.chu_nha).toEqual({ ten_hien_thi: "Anh Tuấn" });
  expect(x.so_can).toBe(2);
  expect(x.can.map((c) => [c.toa_nha, c.ma_can, c.so_phong_ngu, c.so_giuong, c.loai_view])).toEqual([
    ["Sapphire", "1103", 3, 2, "view thành phố"],
    ["À La Carte", "2208", 1, 1, "view biển"],
  ]);
  expect(x.can.every((c) => !!c.anh_dai_dien)).toBe(true);
  const json = JSON.stringify(x);
  expect(json).not.toMatch(/gia|tien|700000|1500000|so_dien_thoai|"id"|0903555123/);
  expect("da_them" in x).toBe(false); // không phiên thì không có da_them
});

test("test_YC1_3_NT1_NT8_US6_KB1_KB2_nguoi_moi_bat_dau_ngay_tao_tai_khoan_sale_sang_A10_khong_qua_A3", async () => {
  const r = await moLink(ma.anh_tuan);
  expect(r.man).toBe("a1_link"); // chưa có tài khoản: A1-link
  if (r.man !== "a1_link") throw new Error();
  expect(r.xem.chu_nha.ten_hien_thi).toBe("Anh Tuấn");
  expect(r.xem.so_can).toBe(2);
  expect(layVai()).toBeNull();
  expect(await batDauTuLink(ma.anh_tuan)).toEqual({ man: "a10" });
  expect(layVai()).toBe("sale");
  expect((await getToi()).vai_chon).toBe("sale");
  expect((await getToi()).so_dien_thoai).toBeNull(); // không xin số lúc này (QD2)
  expect((await moLink(ma.anh_tuan)).man).toBe("a10");
});

test("test_YC1_3_NT3_US6_KB3_KB6_roi_A10_khong_them_thi_chua_co_gi_them_lich_thi_vao_nhom_da_ket_noi", async () => {
  await moLink(ma.anh_tuan);
  await batDauTuLink(ma.anh_tuan);
  await moLink(ma.anh_tuan);
  expect((await getSaleLich()).can).toHaveLength(0); // A5: "Chưa có nguồn phòng"
  await dung("zalo-anh-tuan");
  const truoc = await getKetNoi();
  expect(truoc.da_ket_noi.map((d) => d.ten_hien_thi)).toEqual(["Sale Hùng"]);
  // Sale bấm "Thêm lịch"
  await dung("zalo-thu-b");
  const kq = await themLich(ma.anh_tuan, khoa());
  expect(kq).toMatchObject({ loai: "da_them", ket_qua: { da_co_tu_truoc: false, ten_hien_thi_chu_nha: "Anh Tuấn", so_can: 2 } });
  const lich = await getSaleLich();
  expect(lich.can.map((c) => c.ma_can)).toEqual(["1103", "2208"]);
  expect(lich.so_can).toEqual({ cua_toi: 0, nguon_phong: 2, tu_nhap: 0 });
  await dung("zalo-anh-tuan");
  expect((await getKetNoi()).da_ket_noi.map((d) => d.ten_hien_thi)).toEqual(["Sale Hùng", "Zalo thử B"]);
});

test("test_YC1_3_NT5_US6_KB7_mo_link_lan_hai_thay_A10_01_khong_nhan_doi", async () => {
  await moLink(ma.anh_tuan);
  await batDauTuLink(ma.anh_tuan);
  const k = khoa();
  const mot = await themLich(ma.anh_tuan, k);
  expect(await themLich(ma.anh_tuan, k)).toEqual(mot); // cùng khóa: không chạy lại (HV1-NT1)
  const hai = await themLich(ma.anh_tuan, khoa());
  expect(hai.loai).toBe("da_co");
  const r = await moLink(ma.anh_tuan);
  expect(r.man).toBe("a10_01");
  expect((await getSaleLich()).can).toHaveLength(2);
  await dung("zalo-anh-tuan");
  expect((await getKetNoi()).da_ket_noi.filter((d) => d.ten_hien_thi === "Zalo thử B")).toHaveLength(1);
});

test("test_YC1_3_NT6_US6_KB11_link_sai_het_han_hoac_chu_nha_da_xoa_thi_khong_lo_ten_can_anh_va_khong_tao_ket_noi", async () => {
  const sai = ma.anh_tuan.slice(0, -3) + (ma.anh_tuan.endsWith("aaa") ? "bbb" : "aaa");
  expect(await moLink(sai)).toEqual({ man: "loi_link", coTaiKhoan: false });
  expect(await maLoi(getLink(sai))).toBe("LINK_KHONG_DUNG_DUOC");
  expect(await maLoi(getLink("ngan"))).toBe("LINK_KHONG_DUNG_DUOC"); // sai định dạng như không có
  // Chủ nhà đã xóa tài khoản
  banThu.chuNhaXoaTaiKhoan("zalo-anh-tuan");
  const e = await getLink(ma.anh_tuan).catch((x) => x);
  expect(e).toBeInstanceOf(LoiApi);
  expect(JSON.stringify({ loi: e.loi, ly_do: e.ly_do })).not.toMatch(/Tuấn|1103|2208|Sapphire/);
  expect(await moLink(ma.anh_tuan)).toEqual({ man: "loi_link", coTaiKhoan: false });
  expect((await batDauTuLink(ma.anh_tuan)).man).toBe("loi_link");
  // Không tạo tài khoản, không tạo kết nối
  expect(await maLoi(getToi())).toBe("CHUA_DANG_NHAP");
  // Link hết hạn (ngày 22): như link sai
  await dung("zalo-chi-hoa");
  banThu.hetHanLink();
  expect(await maLoi(getLink(ma.chi_hoa))).toBe("LINK_KHONG_DUNG_DUOC");
});

test("test_PQ18_LINK_US6_KB11_sale_da_co_tai_khoan_mo_link_sai_thi_Vao_app_ve_lich_cua_sale", async () => {
  await dung("zalo-sale-hung");
  const r = await moLink("khongcolinknaoMaSai0000");
  expect(r).toEqual({ man: "loi_link", coTaiKhoan: true });
  expect(layVai()).toBe("sale");
});

test("test_PQ17_LINK_them_lich_can_tai_khoan_va_link_dung_duoc", async () => {
  // Phiên tạm (chưa có tài khoản) chưa thêm lịch được
  await postPhien();
  expect(await maLoi(postLinkThemLich(ma.anh_tuan, khoa()))).toBe("CHUA_DANG_NHAP");
  await moLink(ma.anh_tuan);
  await batDauTuLink(ma.anh_tuan);
  expect(await maLoi(postLinkThemLich("MaKhongTonTai0000000000", khoa()))).toBe("LINK_KHONG_DUNG_DUOC");
  banThu.hetHanLink();
  expect(await themLich(ma.anh_tuan, khoa())).toEqual({ loai: "loi_link" });
  await dung("zalo-anh-tuan");
  expect((await getKetNoi()).da_ket_noi.map((d) => d.ten_hien_thi)).toEqual(["Sale Hùng"]); // không có dòng ket_noi
});

test("test_YC1_3_buoc_4_HV2_mat_mang_khi_them_lich_thi_chua_them_va_co_mang_lai_khong_tu_them", async () => {
  await moLink(ma.anh_tuan);
  await batDauTuLink(ma.anh_tuan);
  banThu.datMatMang(true);
  await expect(themLich(ma.anh_tuan, khoa())).rejects.toBeInstanceOf(LoiMang);
  banThu.datMatMang(false);
  expect((await getSaleLich()).can).toHaveLength(0);
});

// Cổng Zalo giả cho test popup xin số
const cong = (): CongZalo & { dem: { xin: number } } => {
  const dem = { xin: 0 };
  return {
    dem,
    async xinTenVaSo() {
      dem.xin++;
      return { kq: "co", access_token: "at", token_sdt: "sdt:0911222333", ho_ten: "Thử B", anh_zalo: null };
    },
    async daTuChoiSo() {
      return false;
    },
    async moCaiDatQuyen() {},
    async chiaSeChu() {
      return "da_gui";
    },
    async saoChep() {
      return true;
    },
    async goiDien() {
      return true;
    },
  };
};

test("test_YC1_3_NT7_US6_KB5_chua_co_so_thi_hien_popup_truoc_va_De_sau_van_them_duoc_lich", async () => {
  const zalo = cong();
  datCongZalo(zalo);
  try {
    await moLink(ma.anh_tuan);
    await batDauTuLink(ma.anh_tuan);
    let xong = 0;
    const dk = new DieuKhienXinSo();
    await dk.chay(async () => {
      await themLich(ma.anh_tuan, khoa());
      xong++;
    });
    expect(dk.mo).not.toBeNull(); // popup hiện trước hộp thoại Zalo
    expect(zalo.dem.xin).toBe(0);
    expect(xong).toBe(0);
    await dk.deSau();
    expect(xong).toBe(1);
    expect(zalo.dem.xin).toBe(0);
    expect((await getToi()).so_dien_thoai).toBeNull(); // vẫn chưa có số
    expect((await getSaleLich()).can).toHaveLength(2);
  } finally {
    datCongZalo(null);
  }
});

test("test_YC1_5_2_NT1_US6_KB10_dong_y_thi_lay_so_roi_them_lich", async () => {
  const zalo = cong();
  datCongZalo(zalo);
  try {
    await moLink(ma.anh_tuan);
    await batDauTuLink(ma.anh_tuan);
    const dk = new DieuKhienXinSo();
    await dk.chay(async () => void (await themLich(ma.anh_tuan, khoa())));
    await dk.dongY();
    expect(zalo.dem.xin).toBe(1);
    expect((await getToi()).so_dien_thoai).toBe("0911222333");
    expect((await getSaleLich()).can).toHaveLength(2);
  } finally {
    datCongZalo(null);
  }
});

test("test_HV4_US6_KB9_tu_choi_hop_thoai_zalo_thi_ve_man_Them_lich_chua_them_gi", async () => {
  const zalo = { ...cong(), async xinTenVaSo() { return { kq: "tu_choi" } as const; } };
  datCongZalo(zalo);
  try {
    await moLink(ma.anh_tuan);
    await batDauTuLink(ma.anh_tuan);
    const dk = new DieuKhienXinSo();
    await dk.chay(async () => void (await themLich(ma.anh_tuan, khoa())));
    await dk.dongY();
    expect(dk.mo).toBeNull();
    expect(dk.loi).toBeNull(); // không báo lỗi
    expect((await getSaleLich()).can).toHaveLength(0);
    expect((await moLink(ma.anh_tuan)).man).toBe("a10"); // vẫn ở màn Thêm lịch, bấm lại được
  } finally {
    datCongZalo(null);
  }
});

test("test_YC5_1_NT2_US6_KB12_lich_7_ngay_ghi_Kin_dung_dem_ngay_tra_va_ngay_khac_co_gia", async () => {
  await dung("zalo-sale-hung");
  const l = await getSaleLich({ tu: "2026-10-07", so_ngay: 7 });
  expect(l.ngay[0]).toBe("2026-10-07");
  expect(l.ngay[6]).toBe("2026-10-13");
  const c = (d: string) => trangThai(l, "1509", `2026-10-${d}`);
  for (const d of ["10", "11", "13"]) {
    expect(c(d).trang_thai).toBe("kin");
    expect("gia_ban" in c(d)).toBe(false);
  }
  for (const d of ["07", "08", "09", "12"]) {
    expect(c(d).trang_thai).toBe("trong"); // 12/10 là ngày trả của B1: không kín (QT2.1)
    expect(typeof c(d).gia_ban).toBe("number");
  }
});

test("test_YC5_1_buoc_2_US6_cac_can_cua_hung_theo_ten_va_so_can_nhom_nguon_phong", async () => {
  await dung("zalo-sale-hung");
  const l = await getSaleLich();
  expect(l.so_can).toEqual({ cua_toi: 0, nguon_phong: 4, tu_nhap: 0 });
  expect(l.can.map((c) => `${c.toa_nha?.ten ?? ""} ${c.ma_can}`.trim())).toEqual(["Sapphire 1103", "ICON40 1509", "À La Carte 2208", "3402"]);
  expect(l.can.map((c) => c.chu_nha?.ten_hien_thi)).toEqual(["Anh Tuấn", "Chị Hoa", "Anh Tuấn", "Chị Hoa"]);
  expect(l.can.every((c) => c.nhom === "nguon_phong" && c.loai === "co_lich")).toBe(true);
  expect(await maLoi(getSaleLich({ so_ngay: 10 }))).toBe("DU_LIEU_SAI");
  expect(await maLoi(getSaleLich({ tu: "07/10" }))).toBe("DU_LIEU_SAI");
  expect((await getSaleLich({ tu: "2026-10-14", so_ngay: 14 })).ngay).toHaveLength(14);
});

test("test_YC5_1_buoc_5_US6_chuyen_tuan_lui_tien_7_ngay", async () => {
  await dung("zalo-sale-hung");
  const tuanSau = await getSaleLich({ tu: "2026-10-14" });
  expect(tuanSau.ngay[0]).toBe("2026-10-14");
  expect(trangThai(tuanSau, "1509", "2026-10-14").trang_thai).toBe("kin"); // B5 13/10 → 15/10
  expect(trangThai(tuanSau, "1509", "2026-10-15").trang_thai).toBe("trong");
  const tuanTruoc = await getSaleLich({ tu: "2026-09-30" });
  expect(tuanTruoc.ngay[6]).toBe("2026-10-06");
});

test("test_YC4_1_NT2_US6_KB13_chu_nha_ghi_dat_phong_thi_sale_khac_thay_Kin_khong_lo_nguoi_dat", async () => {
  await dung("zalo-sale-lan");
  const truoc = await getSaleLich();
  expect(trangThai(truoc, "3402", "2026-10-08").trang_thai).toBe("trong");
  await dung("zalo-chi-hoa");
  const lichChu = await (await import("./api")).getLichThang({ thang: "2026-10" });
  const c3402 = lichChu.can.find((c) => c.ma_can === "3402")!.can_id;
  await postBooking(
    { can_id: c3402, ngay_nhan: "2026-10-08", ngay_tra: "2026-10-09", sale_id: null, ten_khach: "Khách lẻ", tien_phong: 800000, trang_thai_tien: "chua_coc", tien_coc: null, so_khach: null, gio_nhan: "14:00", gio_tra: "12:00", ghi_chu: null },
    khoa(),
  );
  await dung("zalo-sale-lan");
  const sau = await getSaleLich();
  expect(trangThai(sau, "3402", "2026-10-08").trang_thai).toBe("kin");
  expect(trangThai(sau, "3402", "2026-10-09").trang_thai).toBe("trong");
  expect(JSON.stringify(sau)).not.toMatch(/Khách lẻ|ten_khach|nguoi_dat/);
});

test("test_PQ3_SALE_PQ4_SALE_US6_KB14_sale_chi_thay_can_cua_chu_nha_da_ket_noi_va_kin_khong_lo_ten_sale_khac", async () => {
  await dung("zalo-sale-lan");
  const l = await getSaleLich({ tu: "2026-10-14" });
  expect(l.can.map((c) => c.ma_can).sort()).toEqual(["1509", "3402"]);
  expect(JSON.stringify(l)).not.toMatch(/Sapphire|1103|2208|Green Bay|Villa/);
  expect(trangThai(l, "3402", "2026-10-17").trang_thai).toBe("kin"); // B2 của chính Lan
  expect(trangThai(l, "3402", "2026-10-18").trang_thai).toBe("kin");
  expect(trangThai(l, "1509", "2026-10-19").trang_thai).toBe("kin"); // B7 của Sale Minh
  expect(JSON.stringify(l)).not.toMatch(/Minh|Lan|Hùng|sale_id|ten_sale/);
});

test("test_YC1_12_NT1_US6_KB15_chu_nha_them_can_moi_thi_sale_thay_ngay_khong_mo_lai_link", async () => {
  await dung("zalo-sale-hung");
  expect((await getSaleLich()).can).toHaveLength(4);
  await dung("zalo-anh-tuan");
  await postCan({ ma_can: "3305", so_phong_ngu: 2 });
  await dung("zalo-sale-hung");
  const l = await getSaleLich();
  expect(l.can).toHaveLength(5);
  expect(l.can.map((c) => c.ma_can)).toContain("3305");
  // Căn mới chưa đặt giá: ô trống có gia_ban null, không đoán giá
  expect(trangThai(l, "3305", "2026-10-08")).toEqual({ ngay: "2026-10-08", trang_thai: "trong", gia_ban: null });
});

// EN53: không còn công tắc giá (QD20 r2 điểm 3). Thay test cũ "chủ nhà tắt giá thì JSON không có khóa giá nào".
test("test_PQ5_SALE_PQ11_SALE_EN53_can_cua_moi_chu_nha_co_gia_ban_khong_co_gia_chu", async () => {
  await dung("zalo-sale-hung");
  const l = await getSaleLich();
  const chiHoa = l.can.filter((c) => c.chu_nha?.ten_hien_thi === "Chị Hoa");
  expect(chiHoa).toHaveLength(2);
  const json = JSON.stringify(chiHoa);
  expect(json).toContain("gia_ban");
  expect(json).not.toMatch(/gia_chu|"gia"|muc_cong|quyen_gia_tung_dem/); // kiểm trên chuỗi JSON, không chỉ trên giao diện
  // Ô kín vẫn Kín, ô trống có giá bán
  expect(trangThai(l, "1509", "2026-10-10").trang_thai).toBe("kin");
  expect(typeof trangThai(l, "1509", "2026-10-08").gia_ban).toBe("number");
  expect(JSON.stringify(l.can.filter((c) => c.chu_nha?.ten_hien_thi === "Anh Tuấn"))).toContain("gia_ban");
});

test("test_PQ11_SALE_hai_lop_gia_moi_sale_nhan_gia_ban_theo_muc_cong_cua_chinh_minh_khong_lo_gia_chu", async () => {
  await dung("zalo-sale-hung");
  const hung = trangThai(await getSaleLich(), "1509", "2026-10-08").gia_ban; // 900k + 200k (mức cộng riêng 1509)
  expect(hung).toBe(1100000);
  const hungT6 = trangThai(await getSaleLich(), "1509", "2026-10-09").gia_ban; // T6: 1.300k + 200k
  expect(hungT6).toBe(1500000);
  expect(trangThai(await getSaleLich(), "3402", "2026-10-08").gia_ban).toBe(1200000); // 800k + mặc định 400k
  expect(trangThai(await getSaleLich(), "1103", "2026-10-08").gia_ban).toBe(800000); // 700k + 100k
  await dung("zalo-sale-lan");
  const lan = await getSaleLich();
  expect(trangThai(lan, "1509", "2026-10-08").gia_ban).toBe(900000); // Lan chưa cộng gì
  expect(JSON.stringify(lan)).not.toMatch(/gia_chu|muc_cong/);
});

test("test_PQ4_SALE_chu_nha_ngung_sale_thi_lich_khong_con_can_cua_chu_nha_do", async () => {
  await dung("zalo-chi-hoa");
  const hung = (await getKetNoi()).da_ket_noi.find((d) => d.ten_hien_thi === "Sale Hùng")!;
  await postKetNoiNgung(hung.id, khoa());
  await dung("zalo-sale-hung");
  const l = await getSaleLich();
  expect(l.can.map((c) => c.ma_can).sort()).toEqual(["1103", "2208"]); // chỉ còn Anh Tuấn
  // Mở lại link của Chị Hoa không đưa lại quyền (chưa quyết, tạm KHONG_CON_QUYEN)
  expect(await themLich(ma.chi_hoa, khoa())).toEqual({ loai: "loi_link" });
});

test("test_Luat_chung_4_US6_khong_phien_hoac_phien_tam_goi_lich_sale_thi_CHUA_DANG_NHAP", async () => {
  expect(await maLoi(getSaleLich())).toBe("CHUA_DANG_NHAP"); // không phiên
  await dung("zalo-thu-b");
  expect(await maLoi(getSaleLich())).toBe("CHUA_DANG_NHAP"); // phiên tạm, chưa có tài khoản
});

test("test_QD13_US6_chu_nha_mo_link_cua_chinh_minh_khong_tao_ket_noi_voi_chinh_minh", async () => {
  await dung("zalo-anh-tuan");
  expect(await maLoi(postLinkThemLich(ma.anh_tuan, khoa()))).toBe("DU_LIEU_SAI");
  expect((await getKetNoi()).da_ket_noi.map((d) => d.ten_hien_thi)).toEqual(["Sale Hùng"]);
});
