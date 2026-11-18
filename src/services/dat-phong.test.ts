import { beforeEach, expect, test } from "vitest";
import {
  banThu,
  getGoiY,
  getKhachLe,
  getKiemTrung,
  getLichNgay,
  getLichThang,
  getSaleKetNoi,
  postBooking,
  postCan,
  postPhien,
  postTaiKhoan,
} from "./api";
import { LoiApi, LoiMang, type ThanDatPhong } from "./kieu";

// US3 · Server giả của ghi đặt phòng (QD22), cùng luật với src/server/api/booking.js. Số theo DLM, QT1, QT2, QT4.

const maLoi = (p: Promise<unknown>) =>
  p.then(
    () => null,
    (e) => (e instanceof LoiApi ? e.loi : e instanceof LoiMang ? "MAT_MANG" : String(e)),
  );

let lan = 0;
const khoa = () => `khoa-${++lan}`;

let c1509 = "";
let c3402 = "";

beforeEach(async () => {
  banThu.xoaSach();
  banThu.datDoTre(0);
  banThu.datMatMang(false);
  banThu.napDuLieuMau(false, true);
  [c1509, c3402] = (await getLichThang({ thang: "2026-10" })).can.map((c) => c.can_id);
});

const than = (can_id: string, ngay_nhan: string, ngay_tra: string, tien_phong: number, them: Partial<ThanDatPhong> = {}): ThanDatPhong => ({
  can_id, ngay_nhan, ngay_tra, tien_phong, ten_khach: null, trang_thai_tien: "chua_coc", tien_coc: null,
  so_khach: null, gio_nhan: null, gio_tra: null, ghi_chu: null, ...them,
});

const demCua = async (canId: string, thang = "2026-10") =>
  (await getLichThang({ thang, can_id: canId })).ngay.map((n) => n.ngay);

test("test_YC4_1_NT1_US3_KB1_ghi_khach_le_1509_15_10_hai_dem", async () => {
  const k = await getKiemTrung({ can_id: c1509, ngay_nhan: "2026-10-15", ngay_tra: "2026-10-17" });
  expect(k).toEqual({
    khong_trung: true, dem_trung: [], so_dem: 2,
    dem: [{ ngay: "2026-10-15", gia_chu: 900000 }, { ngay: "2026-10-16", gia_chu: 1300000 }],
    tong_gia_chu: 2200000,
  });
  const dp = await postBooking(than(c1509, "2026-10-15", "2026-10-17", 2200000), khoa());
  expect(dp).toMatchObject({ ma_can: "1509", so_dem: 2, tien_phong: 2200000, nguoi_dat: { loai: "khach_le", ten: null } });
  const d = await demCua(c1509);
  expect(d).toContain("2026-10-15");
  expect(d).toContain("2026-10-16");
  expect(d).not.toContain("2026-10-17");
  const ngay = await getLichNgay({ ngay: "2026-10-15" });
  expect(ngay.can[0].dat_phong).toMatchObject({ ngay_nhan: "2026-10-15", ngay_tra: "2026-10-17", tien_phong: 2200000 });
});

test("test_YC4_1_1_NT2_QT1_1_VD1_trung_dem_11_10_cua_B1", async () => {
  const k = await getKiemTrung({ can_id: c1509, ngay_nhan: "2026-10-11", ngay_tra: "2026-10-13" });
  expect([k.khong_trung, k.dem_trung]).toEqual([false, ["2026-10-11"]]);
  const loi = await postBooking(than(c1509, "2026-10-11", "2026-10-13", 2200000), khoa()).catch((e) => e);
  expect(loi).toBeInstanceOf(LoiApi);
  expect([loi.loi, loi.dem_trung]).toEqual(["TRUNG_LICH", ["2026-10-11"]]);
  expect((await getLichNgay({ ngay: "2026-10-12" })).can[0].trong).toBe(true);
  // US3-KB4: 08/10 ba đêm trùng đêm 10/10 của B1
  expect((await getKiemTrung({ can_id: c1509, ngay_nhan: "2026-10-08", ngay_tra: "2026-10-11" })).dem_trung).toEqual(["2026-10-10"]);
});

test("test_QT1_1_VD2_VD3_ngay_tra_va_khac_can", async () => {
  await postBooking(than(c1509, "2026-10-12", "2026-10-13", 900000), khoa());
  const k = await getKiemTrung({ can_id: c3402, ngay_nhan: "2026-10-10", ngay_tra: "2026-10-12" });
  expect([k.khong_trung, k.tong_gia_chu]).toEqual([true, 1900000]);
  await postBooking(than(c3402, "2026-10-10", "2026-10-12", 1900000), khoa());
  expect(await demCua(c1509)).toEqual(["2026-10-04", "2026-10-05", "2026-10-10", "2026-10-11", "2026-10-12", "2026-10-13", "2026-10-14", "2026-10-19"]);
});

test("test_YC4_1_1_NT3_US3_KB2_so_dem_va_tien_theo_ngay_tra", async () => {
  for (const [tra, soDem, tong] of [["2026-10-16", 1, 900000], ["2026-10-17", 2, 2200000], ["2026-10-18", 3, 3500000], ["2026-10-19", 4, 4400000]] as const) {
    const k = await getKiemTrung({ can_id: c1509, ngay_nhan: "2026-10-15", ngay_tra: tra });
    expect([k.so_dem, k.tong_gia_chu, k.khong_trung]).toEqual([soDem, tong, true]);
  }
});

test("test_YC2_1_NT4_US3_KB7_3402_09_10_den_12_10", async () => {
  const k = await getKiemTrung({ can_id: c3402, ngay_nhan: "2026-10-09", ngay_tra: "2026-10-12" });
  expect(k.dem.map((d) => d.gia_chu)).toEqual([1100000, 1100000, 800000]);
  await postBooking(than(c3402, "2026-10-09", "2026-10-12", 3000000, { trang_thai_tien: "da_thanh_toan" }), khoa());
  const d = await demCua(c3402);
  expect(d).toEqual(expect.arrayContaining(["2026-10-09", "2026-10-10", "2026-10-11"]));
  expect(d).not.toContain("2026-10-12");
});

test("test_QT2_2_US3_KB8_qua_hai_thang_va_QT4_2_chia_tien", async () => {
  const dp = await postBooking(than(c1509, "2026-10-31", "2026-11-02", 2200000), khoa());
  expect(dp.dem).toEqual([{ ngay: "2026-10-31", gia_chu: 1300000 }, { ngay: "2026-11-01", gia_chu: 900000 }]);
  expect(await demCua(c1509, "2026-11")).toEqual(["2026-11-01"]);
  // QT4.2-VD1, VD2
  banThu.napDuLieuMau(false, true);
  [c1509] = (await getLichThang({ thang: "2026-10" })).can.map((c) => c.can_id);
  expect((await postBooking(than(c1509, "2026-10-31", "2026-11-02", 2000000), khoa())).dem.map((d) => d.gia_chu)).toEqual([1000000, 1000000]);
  expect((await postBooking(than(c1509, "2026-10-15", "2026-10-18", 1000000), khoa())).dem.map((d) => d.gia_chu)).toEqual([333333, 333333, 333334]);
});

test("test_YC4_1_2_NT1_US3_KB12_tien_coc_chi_khi_da_coc", async () => {
  const dp = await postBooking(than(c1509, "2026-10-15", "2026-10-17", 2200000, { trang_thai_tien: "da_coc_con_thu", tien_coc: 1000000 }), khoa());
  expect([dp.tien_coc, dp.tien_con_lai]).toEqual([1000000, 1200000]);
  const ngay = await getLichNgay({ ngay: "2026-10-15" });
  expect(ngay.can[0].dat_phong).toMatchObject({ trang_thai_tien: "da_coc_con_thu", tien_coc: 1000000 });
  expect(await maLoi(postBooking(than(c3402, "2026-10-15", "2026-10-16", 800000, { tien_coc: 1 }), khoa()))).toBe("DU_LIEU_SAI");
});

test("test_YC4_1_2_NT7_khong_co_tien_phong_bi_tu_choi", async () => {
  expect(await maLoi(postBooking(than(c1509, "2026-10-15", "2026-10-17", Number.NaN), khoa()))).toBe("DU_LIEU_SAI");
  expect((await getLichNgay({ ngay: "2026-10-15" })).can[0].trong).toBe(true);
});

test("test_HV1_NT1_US3_KB16_cung_khoa_chi_mot_dat_phong", async () => {
  const k = khoa();
  const [a, b] = await Promise.all([1, 2].map(() => postBooking(than(c1509, "2026-10-15", "2026-10-17", 2200000), k)));
  expect(b.id).toBe(a.id);
  expect((await getLichThang({ thang: "2026-10", can_id: c1509 })).ngay.filter((n) => n.ngay === "2026-10-15")).toHaveLength(1);
});

test("test_HV2_NT1_US3_KB17_mat_mang_khi_luu_khong_ghi", async () => {
  banThu.datMatMang(true);
  expect(await maLoi(postBooking(than(c1509, "2026-10-15", "2026-10-17", 2200000), khoa()))).toBe("MAT_MANG");
  banThu.datMatMang(false);
  expect((await getLichNgay({ ngay: "2026-10-15" })).can[0].trong).toBe(true);
});

test("test_YC2_4_NT3_US3_KB10_chi_tiet_ngay_nguoi_dat_va_tien", async () => {
  const n10 = await getLichNgay({ ngay: "2026-10-10" });
  expect(n10.can[0].dat_phong).toMatchObject({
    nguoi_dat: { loai: "sale", ten: "Sale Hùng" }, ngay_nhan: "2026-10-10", ngay_tra: "2026-10-12", so_dem: 2,
    tien_phong: 2200000, tien_coc: 1000000,
  });
  expect(n10.can[1].trong).toBe(true);
  const n14 = await getLichNgay({ ngay: "2026-10-14" });
  expect(n14.can.map((c) => [c.dat_phong?.nguoi_dat.loai, c.dat_phong?.tien_phong])).toEqual([["khach_le", 1800000], ["khach_le", 800000]]);
  expect((await getLichNgay({ ngay: "2026-10-12" })).can.every((c) => c.trong)).toBe(true);
});

test("test_YC2_1_NT3_US3_KB11_loc_theo_can", async () => {
  expect(await demCua(c1509)).toEqual(["2026-10-04", "2026-10-05", "2026-10-10", "2026-10-11", "2026-10-13", "2026-10-14", "2026-10-19"]);
  expect(await demCua(c3402)).toEqual(["2026-10-05", "2026-10-06", "2026-10-14", "2026-10-17", "2026-10-18", "2026-10-21"]);
});

test("test_US3_goi_y_khach_le_sale_ket_noi", async () => {
  expect(await getGoiY({ can_id: c1509 })).toEqual({ ngay_nhan: "2026-10-07", ngay_tra: "2026-10-08" });
  banThu.datHomNay("2026-10-10");
  expect(await getGoiY({ can_id: c1509 })).toEqual({ ngay_nhan: "2026-10-12", ngay_tra: "2026-10-13" });
  expect((await getSaleKetNoi()).map((s) => s.ten)).toEqual(["Sale Hùng", "Sale Lan", "Sale Nga", "Sale Minh"]);
  expect(await getKhachLe()).toEqual({ muc: [] });
  await postBooking(than(c3402, "2026-10-25", "2026-10-26", 1300000, { ten_khach: "Anh Nam" }), khoa());
  expect(await getKhachLe()).toEqual({ muc: [{ ten_khach: "Anh Nam" }] });
});

test("test_PQ7_CHU_US3_KB23_chu_nha_khac_khong_ghi_duoc_vao_can_cua_Chi_Hoa", async () => {
  const canHoa = c1509;
  banThu.dungZaloId("zalo-anh-tuan");
  await postPhien();
  await postTaiKhoan({ vai_chon: "chu_nha", dong_y_dieu_khoan_luc: "2026-11-03T02:00:00.000Z" });
  await postCan({ ma_can: "Sapphire 1103", so_phong_ngu: 3 });
  await postCan({ ma_can: "À La Carte 2208", so_phong_ngu: 1 });
  expect((await getLichThang({ thang: "2026-10" })).can.map((c) => c.ma_can)).toEqual(["Sapphire 1103", "À La Carte 2208"]);
  expect(await maLoi(postBooking(than(canHoa, "2026-10-15", "2026-10-17", 2200000), khoa()))).toBe("KHONG_TIM_THAY");
  expect(await maLoi(getKiemTrung({ can_id: canHoa, ngay_nhan: "2026-10-11", ngay_tra: "2026-10-13" }))).toBe("KHONG_TIM_THAY");
});
