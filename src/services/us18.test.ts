import { beforeEach, expect, test } from "vitest";
import { banThu, deleteCan, getThongKeChu, postBooking, postCan, postPhien } from "./api";
import { LoiApi, type ThanDatPhong } from "./kieu";
import { chuCongSuat, chuPhanTram, chuSoRutGon, congSuat, phanTramSoVoiThangTruoc } from "./thong-ke";

// US18 · Thống kê tháng của chủ nhà (YC7.1 đến YC7.3) trên server giả, máy là Chị Hoa (DLM). Hôm nay 07/10/2026 (DLM.1).
// Phép tính phía app (TA3): phần trăm, công suất, số rút gọn. Server thật có test riêng (src/server/api/us18-nt.test.js);
// test ghép: services/that/us18.ghep.ts. Khối chưa thu (YC7.4, TA2) chưa làm: [MỞ: YC7.4 bước 1, DC53 US18-Q1].
const maLoi = (p: Promise<unknown>) => p.then(() => null, (e) => (e instanceof LoiApi ? e.loi : String(e)));
const HOA = "zalo-chi-hoa";
const HUNG = "zalo-sale-hung";
const TUAN = "zalo-anh-tuan";
let n = 0;
const khoa = () => `khoa-thu-us18-${String(++n).padStart(6, "0")}`;
const dung = async (zaloId: string) => {
  banThu.dungZaloId(zaloId);
  await postPhien();
};

beforeEach(async () => {
  banThu.xoaSach();
  banThu.datDoTre(0);
  banThu.datMatMang(false);
  banThu.datHomNay("2026-10-07");
  banThu.napDuLieuSale("moi");
  await dung(HOA);
});

const tien = (...a: number[]) => a.reduce((x, y) => x + y, 0);
const idCan = async (ma: string) => (await getThongKeChu({ thang: "2026-10" })).theo_can.find((c) => c.ma_can === ma)!.can_id;
const ghi = (can_id: string, nhan: string, tra: string, tien_phong: number | null = null) =>
  postBooking({ can_id, ngay_nhan: nhan, ngay_tra: tra, ten_khach: "Khách thử", tien_phong, trang_thai_tien: "da_thanh_toan", tien_coc: null } as ThanDatPhong, khoa());

// ---- Phép tính phía app (US18-TA3) ----

test("test_YC7_1_NT3_phan_tram_so_voi_thang_truoc_lam_tron_mot_so_le_9_6tr_len_11_8tr_la_cong_22_9", () => {
  expect(phanTramSoVoiThangTruoc(11_800_000, 9_600_000)).toBe(22.9);
  expect(chuPhanTram(22.9)).toBe("+22.9%");
});

test("test_YC7_1_NT3_KB4_KB6_KB7_KB13_phan_tram_giam_va_tang_theo_so_cua_kich_ban", () => {
  // KB4: tháng 11 800.000đ so với tháng 10 11.800.000đ
  expect(phanTramSoVoiThangTruoc(800_000, 11_800_000)).toBe(-93.2);
  expect(chuPhanTram(-93.2)).toBe("−93.2%");
  // KB6: 13.100.000đ so với 9.6tr (+36.5%); tháng 11 1.700.000đ so với 13.1tr (−87.0%)
  expect(chuPhanTram(phanTramSoVoiThangTruoc(13_100_000, 9_600_000)!)).toBe("+36.5%");
  expect(chuPhanTram(phanTramSoVoiThangTruoc(1_700_000, 13_100_000)!)).toBe("−87.0%");
  // KB7: 12.800.000đ (+33.3%). KB13: 12.900.000đ (+34.4%)
  expect(chuPhanTram(phanTramSoVoiThangTruoc(12_800_000, 9_600_000)!)).toBe("+33.3%");
  expect(chuPhanTram(phanTramSoVoiThangTruoc(12_900_000, 9_600_000)!)).toBe("+34.4%");
});

test("test_YC7_1_NT3_phan_tram_khong_doi_ghi_0_0_va_thang_truoc_bang_0_khong_co_phan_tram", () => {
  expect(chuPhanTram(phanTramSoVoiThangTruoc(5_000_000, 5_000_000)!)).toBe("0.0%");
  // YC7-H4: tháng trước 0 thì không chia được; app tạm không có dòng phần trăm
  expect(phanTramSoVoiThangTruoc(800_000, 0)).toBeNull();
  expect(phanTramSoVoiThangTruoc(0, 0)).toBeNull();
});

test("test_YC7_1_NT3_lam_tron_nua_len_theo_do_lon_hai_phia_doi_xung", () => {
  // 1,25% và −1,25%: nửa lên theo độ lớn thì ra 1.3 và −1.3
  expect(phanTramSoVoiThangTruoc(10_125_000, 10_000_000)).toBe(1.3);
  expect(phanTramSoVoiThangTruoc(9_875_000, 10_000_000)).toBe(-1.3);
});

test("test_YC7_1_NT2_cong_suat_13_dem_tren_2_can_31_dem_la_21_0", () => {
  expect(congSuat(13, 2, 31)).toBe(21);
  expect(chuCongSuat(congSuat(13, 2, 31))).toBe("21.0%");
  // KB6, KB13: 14/62 = 22.6%
  expect(chuCongSuat(congSuat(14, 2, 31))).toBe("22.6%");
});

test("test_YC7_1_NT5_cong_suat_thang_khong_co_dem_ghi_0_phan_tram_va_mau_so_0_khong_chia", () => {
  expect(chuCongSuat(congSuat(0, 2, 31))).toBe("0%");
  expect(congSuat(5, 0, 31)).toBe(0);
});

test("test_YC7_2_NT1_so_rut_gon_13_4tr_7_2tr_11_8tr_9_6tr", () => {
  expect(chuSoRutGon(13_400_000)).toBe("13.4tr");
  expect(chuSoRutGon(7_200_000)).toBe("7.2tr");
  expect(chuSoRutGon(11_800_000)).toBe("11.8tr");
  expect(chuSoRutGon(9_600_000)).toBe("9.6tr");
  expect(chuSoRutGon(12_000_000)).toBe("12.0tr");
  expect(chuSoRutGon(800_000)).toBe("800k");
});

test("test_YC7_2_rong_cot_0d_khong_co_so", () => {
  expect(chuSoRutGon(0)).toBe("");
});

// ---- Server giả (US18-TA4 dùng) ----

test("test_YC7_1_NT1_thang_10_doanh_thu_11_8tr_hai_can_6_7tr_va_5_1tr_theo_DLM_5", async () => {
  const tk = await getThongKeChu({ thang: "2026-10" });
  expect(tk.doanh_thu).toBe(11_800_000);
  expect(tk.theo_can.map((c) => [c.ma_can, c.doanh_thu])).toEqual([
    ["1509", 6_700_000],
    ["3402", 5_100_000],
  ]);
  expect(tien(...tk.theo_can.map((c) => c.doanh_thu))).toBe(tk.doanh_thu);
});

test("test_YC7_1_NT2_13_dem_co_khach_mau_so_2_can_31_dem_cong_suat_21_0", async () => {
  const tk = await getThongKeChu({ thang: "2026-10" });
  expect(tk).toMatchObject({ dem_co_khach: 13, so_can_cong_suat: 2, so_dem_trong_thang: 31 });
  expect(chuCongSuat(congSuat(tk.dem_co_khach, tk.so_can_cong_suat, tk.so_dem_trong_thang))).toBe("21.0%");
});

test("test_YC7_1_NT3_thang_truoc_9_6tr_cho_dong_so_sanh_cong_22_9", async () => {
  const tk = await getThongKeChu({ thang: "2026-10" });
  expect(tk.doanh_thu_thang_truoc).toBe(9_600_000);
  expect(chuPhanTram(phanTramSoVoiThangTruoc(tk.doanh_thu, tk.doanh_thu_thang_truoc)!)).toBe("+22.9%");
});

test("test_YC7_1_NT4_thang_11_chi_con_dem_dau_cua_B9_800_000d", async () => {
  const tk = await getThongKeChu({ thang: "2026-11" });
  expect(tk).toMatchObject({ doanh_thu: 800_000, dem_co_khach: 1, doanh_thu_thang_truoc: 11_800_000, so_dem_trong_thang: 30 });
  expect(tk.theo_can.map((c) => c.doanh_thu)).toEqual([0, 800_000]);
});

test("test_QT2_2_VD1_KB5_B9_30_11_den_02_12_chia_800_000d_cho_thang_11_va_800_000d_cho_thang_12", async () => {
  const t11 = await getThongKeChu({ thang: "2026-11" });
  const t12 = await getThongKeChu({ thang: "2026-12" });
  expect([t11.doanh_thu, t12.doanh_thu]).toEqual([800_000, 800_000]);
  expect(t11.theo_nguoi_ban).toEqual([{ sale_id: expect.anything(), ten: "Sale Minh", la_khach_le: false, da_xoa_tai_khoan: false, doanh_thu: 800_000 }]);
  expect(t12.theo_nguoi_ban.map((d) => [d.ten, d.doanh_thu])).toEqual([["Sale Minh", 800_000]]);
  // Tháng 10 không có B9
  expect((await getThongKeChu({ thang: "2026-10" })).doanh_thu).toBe(11_800_000);
});

test("test_YC7_1_NT5_KB9_thang_1_2027_chua_co_dat_phong_moi_so_la_0_theo_nguoi_ban_rong", async () => {
  const tk = await getThongKeChu({ thang: "2027-01" });
  expect(tk).toMatchObject({ doanh_thu: 0, dem_co_khach: 0, theo_nguoi_ban: [], so_dem_trong_thang: 31 });
  // Tháng 12 còn 800.000đ của B9, nhưng tháng 1 trống thì không có dòng phần trăm (YC7.1-NT5)
  expect(tk.doanh_thu_thang_truoc).toBe(800_000);
  expect(tk.theo_can.map((c) => c.doanh_thu)).toEqual([0, 0]);
});

test("test_YC7_2_NT2_NT3_chuoi_6_thang_ket_thuc_o_thang_dang_xem_T9_9_6tr_T10_11_8tr", async () => {
  const t10 = await getThongKeChu({ thang: "2026-10", so_thang: 6 });
  expect(t10.chuoi_thang.map((t) => t.thang)).toEqual(["2026-05", "2026-06", "2026-07", "2026-08", "2026-09", "2026-10"]);
  expect(t10.chuoi_thang[4].doanh_thu).toBe(9_600_000);
  expect(t10.chuoi_thang[5].doanh_thu).toBe(11_800_000);
  // YC7.2-NT3: tháng 12 thì T7 đến T12
  const t12 = await getThongKeChu({ thang: "2026-12", so_thang: 6 });
  expect(t12.chuoi_thang.map((t) => t.thang)).toEqual(["2026-07", "2026-08", "2026-09", "2026-10", "2026-11", "2026-12"]);
  expect(t12.chuoi_thang.slice(-3).map((t) => t.doanh_thu)).toEqual([11_800_000, 800_000, 800_000]);
});

test("test_YC7_3_NT1_bon_nguoi_ban_giam_dan_Hung_Lan_Khach_le_Minh_tong_bang_doanh_thu", async () => {
  const tk = await getThongKeChu({ thang: "2026-10" });
  expect(tk.theo_nguoi_ban.map((d) => [d.ten, d.doanh_thu])).toEqual([
    ["Sale Hùng", 4_000_000],
    ["Sale Lan", 3_500_000],
    ["Khách lẻ", 2_600_000],
    ["Sale Minh", 1_700_000],
  ]);
  expect(tien(...tk.theo_nguoi_ban.map((d) => d.doanh_thu))).toBe(tk.doanh_thu);
});

test("test_YC7_3_NT2_dat_phong_khong_sale_vao_dong_Khach_le_co_la_khach_le_va_khong_sale_id", async () => {
  const tk = await getThongKeChu({ thang: "2026-10" });
  expect(tk.theo_nguoi_ban.find((d) => d.ten === "Khách lẻ")).toMatchObject({ sale_id: null, la_khach_le: true, da_xoa_tai_khoan: false });
});

test("test_YC7_3_NT3_PQ11_CHU_PQ15_CHU_ket_qua_khong_co_khoa_gia_ban_hay_tien_chenh_o_bat_ky_muc_nao", async () => {
  const chu = JSON.stringify(await getThongKeChu({ thang: "2026-10", so_thang: 6 }));
  expect(chu).not.toMatch(/gia_ban|tien_chenh|chenh/);
  // Giá bán B1 2.600.000đ trùng tiền Khách lẻ nên không dò số; dòng Hùng là giá chủ 4.000.000đ chứ không 4.800.000đ (KB15)
  const hung = (await getThongKeChu({ thang: "2026-10" })).theo_nguoi_ban.find((d) => d.ten === "Sale Hùng")!;
  expect(hung.doanh_thu).toBe(4_000_000);
});

test("test_QT4_2_VD3_KB6_ghi_31_10_den_02_11_giu_tien_dien_san_thang_10_them_1_3tr_thang_11_them_900_000d", async () => {
  const c1509 = await idCan("1509");
  await ghi(c1509, "2026-10-31", "2026-11-02", 2_200_000); // tiền điền sẵn của form: 1.300.000đ + 900.000đ
  const t10 = await getThongKeChu({ thang: "2026-10" });
  expect(t10).toMatchObject({ doanh_thu: 13_100_000, dem_co_khach: 14 });
  expect(t10.theo_can[0].doanh_thu).toBe(8_000_000);
  expect(t10.theo_nguoi_ban.map((d) => [d.ten, d.doanh_thu])).toEqual([
    ["Sale Hùng", 4_000_000],
    ["Khách lẻ", 3_900_000],
    ["Sale Lan", 3_500_000],
    ["Sale Minh", 1_700_000],
  ]);
  expect(chuCongSuat(congSuat(t10.dem_co_khach, t10.so_can_cong_suat, t10.so_dem_trong_thang))).toBe("22.6%");
  const t11 = await getThongKeChu({ thang: "2026-11" });
  expect(t11).toMatchObject({ doanh_thu: 1_700_000, dem_co_khach: 2 });
  expect(t11.theo_can.map((c) => c.doanh_thu)).toEqual([900_000, 800_000]);
  expect(t11.theo_nguoi_ban.map((d) => [d.ten, d.doanh_thu])).toEqual([
    ["Khách lẻ", 900_000],
    ["Sale Minh", 800_000],
  ]);
});

test("test_QT4_2_VD1_KB7_go_tien_2_000_000d_chia_deu_1_000_000d_moi_dem_hai_thang", async () => {
  const c1509 = await idCan("1509");
  await ghi(c1509, "2026-10-31", "2026-11-02", 2_000_000);
  expect((await getThongKeChu({ thang: "2026-10" })).doanh_thu).toBe(12_800_000);
  const t11 = await getThongKeChu({ thang: "2026-11" });
  expect(t11.doanh_thu).toBe(1_800_000);
  expect(t11.theo_can.map((c) => c.doanh_thu)).toEqual([1_000_000, 800_000]);
});

test("test_QT4_2_VD2_KB8_1_000_000d_chia_3_dem_phan_le_don_dem_cuoi_thang_11_nhan_1_dem_thang_12_nhan_2_dem", async () => {
  const c1509 = await idCan("1509");
  await ghi(c1509, "2026-11-30", "2026-12-03", 1_000_000);
  const t11 = await getThongKeChu({ thang: "2026-11" });
  expect(t11.theo_can.map((c) => c.doanh_thu)).toEqual([333_333, 800_000]);
  expect(t11.doanh_thu).toBe(1_133_333);
  const t12 = await getThongKeChu({ thang: "2026-12" });
  expect(t12.theo_can.map((c) => c.doanh_thu)).toEqual([666_667, 800_000]);
  expect(t12).toMatchObject({ doanh_thu: 1_466_667, dem_co_khach: 3 });
});

test("test_QD21_KB14_dat_phong_da_huy_khong_tinh_vao_doanh_thu_dem_co_khach_va_nguoi_ban", async () => {
  const c3402 = await idCan("3402");
  banThu.themBooking({ can_id: c3402, ngay_nhan: "2026-10-10", ngay_tra: "2026-10-11", trang_thai: "da_huy", ten_khach: "Khách hủy", tien_phong: 1_100_000, trang_thai_tien: "chua_coc" });
  const tk = await getThongKeChu({ thang: "2026-10" });
  expect(tk).toMatchObject({ doanh_thu: 11_800_000, dem_co_khach: 13 });
  expect(tk.theo_nguoi_ban.find((d) => d.la_khach_le)!.doanh_thu).toBe(2_600_000);
});

test("test_YC3_9_can_da_an_van_tinh_vao_doanh_thu_va_dem_nhung_khong_co_the_phong_va_khong_vao_mau_so_cong_suat", async () => {
  // Căn thêm mới có một đặt phòng cũ (trả trước hôm nay) trong tháng 10, rồi chủ nhà xóa căn = ẩn căn
  const can = await postCan({ ma_can: "9001", so_phong_ngu: 2 }, khoa());
  banThu.themBooking({ can_id: can.id, ngay_nhan: "2026-10-01", ngay_tra: "2026-10-03", trang_thai: "hieu_luc", ten_khach: "Khách cũ", tien_phong: 1_000_000, trang_thai_tien: "da_thanh_toan" });
  expect((await deleteCan(can.id, khoa())).ket_qua).toBe("an");
  const tk = await getThongKeChu({ thang: "2026-10" });
  expect(tk.theo_can.map((c) => c.ma_can)).toEqual(["1509", "3402"]);
  expect(tk).toMatchObject({ doanh_thu: 12_800_000, dem_co_khach: 15, so_can_cong_suat: 2 });
  expect(tk.theo_nguoi_ban.find((d) => d.la_khach_le)!.doanh_thu).toBe(3_600_000);
});

test("test_PQ16_CHU_Anh_Tuan_chi_thay_1103_2_1tr_va_2208_1_5tr_va_Sale_Hung_3_6tr_khong_co_1509_3402", async () => {
  await dung(TUAN);
  const tk = await getThongKeChu({ thang: "2026-10" });
  expect(tk.theo_can.map((c) => [c.ma_can, c.doanh_thu])).toEqual([
    ["1103", 2_100_000],
    ["2208", 1_500_000],
  ]);
  expect(tk.doanh_thu).toBe(3_600_000);
  expect(tk.theo_nguoi_ban.map((d) => [d.ten, d.doanh_thu])).toEqual([["Sale Hùng", 3_600_000]]);
  expect(JSON.stringify(tk)).not.toMatch(/1509|3402|Sale Lan|Sale Minh|Khách lẻ/);
});

test("test_PQ16_SALE_sale_goi_thong_ke_chu_nha_KHONG_DUOC_PHEP_va_khong_co_so_nao", async () => {
  await dung(HUNG);
  expect(await maLoi(getThongKeChu({ thang: "2026-10" }))).toBe("KHONG_DUOC_PHEP");
});

test("test_PQ_luat_chung_4_khong_phien_tra_CHUA_DANG_NHAP", async () => {
  banThu.xoaSach();
  banThu.datDoTre(0);
  expect(await maLoi(getThongKeChu({ thang: "2026-10" }))).toBe("CHUA_DANG_NHAP");
});

test("test_YC7_1_dau_vao_sai_thang_hay_so_thang_ngoai_khoang_tra_DU_LIEU_SAI", async () => {
  expect(await maLoi(getThongKeChu({ thang: "2026-13" }))).toBe("DU_LIEU_SAI");
  expect(await maLoi(getThongKeChu({ thang: "2026-10", so_thang: 0 }))).toBe("DU_LIEU_SAI");
  expect(await maLoi(getThongKeChu({ thang: "2026-10", so_thang: 13 }))).toBe("DU_LIEU_SAI");
});

test("test_HV2_mat_mang_tra_LoiMang", async () => {
  banThu.datMatMang(true);
  expect(await maLoi(getThongKeChu({ thang: "2026-10" }))).toMatch(/LoiMang|MANG/i);
});
