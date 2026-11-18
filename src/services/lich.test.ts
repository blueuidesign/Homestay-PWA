import { beforeEach, expect, test } from "vitest";
import { banThu, getLichNgay, getLichThang, homNay, postCan, postPhien, postTaiKhoan } from "./api";
import { LoiApi, LoiMang } from "./kieu";
import { cacDem, luoiThang, ngayVN } from "./ngay";

// API lịch của chủ nhà (api/lich-dat-phong.md: GET /lich/thang, GET /lich/ngay), dữ liệu theo DLM.

const maLoi = (p: Promise<unknown>) =>
  p.then(
    () => null,
    (e) => (e instanceof LoiApi ? e.loi : e instanceof LoiMang ? "MAT_MANG" : String(e)),
  );

const chuNhaMoi = async (zaloId: string) => {
  banThu.dungZaloId(zaloId);
  await postPhien();
  await postTaiKhoan({ vai_chon: "chu_nha", dong_y_dieu_khoan_luc: "2026-11-03T02:00:00.000Z" });
};

beforeEach(() => {
  banThu.xoaSach();
  banThu.datDoTre(0);
  banThu.datMatMang(false);
});

test("test_YC2_1_NT1_hai_can_lich_thang_tra_ca_hai_can_theo_thu_tu_tao", async () => {
  banThu.napDuLieuMau();
  const lich = await getLichThang({ thang: "2026-10" });
  expect(lich.thang).toBe("2026-10");
  expect(lich.can.map((c) => c.ma_can)).toEqual(["1509", "3402"]);
});

test("test_YC2_1_NT2_ba_can_lich_thang_tra_ba_can_theo_thu_tu_tao", async () => {
  banThu.napDuLieuMau();
  // US2-KB7: Chị Hoa thêm 2501 ở tab Căn, căn mới đứng cuối hàng chip
  await postCan({ ma_can: "2501", so_phong_ngu: 1 });
  expect((await getLichThang({ thang: "2026-10" })).can.map((c) => c.ma_can)).toEqual(["1509", "3402", "2501"]);
  // Bản thử "3 căn" cho cùng thứ tự
  banThu.napDuLieuMau(true);
  expect((await getLichThang({ thang: "2026-10" })).can.map((c) => c.ma_can)).toEqual(["1509", "3402", "2501"]);
});

test("test_YC2_1_NT5_chua_co_dat_phong_nao", async () => {
  banThu.napDuLieuMau();
  const lich = await getLichThang({ thang: "2026-10" });
  expect(lich.co_dat_phong_nao).toBe(false);
  expect(lich.ngay).toEqual([]);
});

test("test_YC2_1_NT5_co_dat_phong_o_thang_khac_van_khong_phai_CN1_00", async () => {
  banThu.napDuLieuMau();
  const [c1509] = (await getLichThang({ thang: "2026-10" })).can;
  banThu.themBooking({ can_id: c1509.can_id, ngay_nhan: "2026-12-01", ngay_tra: "2026-12-02", trang_thai: "hieu_luc" });
  const lich = await getLichThang({ thang: "2026-10" });
  expect(lich.co_dat_phong_nao).toBe(true);
  expect(lich.ngay).toEqual([]);
  // Đặt phòng đã hủy không tính (QD21)
  banThu.napDuLieuMau();
  const [c] = (await getLichThang({ thang: "2026-10" })).can;
  banThu.themBooking({ can_id: c.can_id, ngay_nhan: "2026-10-10", ngay_tra: "2026-10-12", trang_thai: "da_huy" });
  expect((await getLichThang({ thang: "2026-10" })).co_dat_phong_nao).toBe(false);
});

test("test_YC2_4_NT1_chi_tiet_ngay_moi_can_mot_khoi", async () => {
  banThu.napDuLieuMau();
  const ngay = await getLichNgay({ ngay: "2026-10-10" });
  expect(ngay.ngay).toBe("2026-10-10");
  expect(ngay.can.map((c) => [c.ma_can, c.trong, c.dat_phong])).toEqual([
    ["1509", true, null],
    ["3402", true, null],
  ]);
  // US2-KB5: ngày đầu và ngày cuối tháng
  expect((await getLichNgay({ ngay: "2026-10-01" })).ngay).toBe("2026-10-01");
  expect((await getLichNgay({ ngay: "2026-10-31" })).ngay).toBe("2026-10-31");
});

test("test_YC2_4_NT1_ba_can_ba_khoi", async () => {
  banThu.napDuLieuMau(true);
  expect((await getLichNgay({ ngay: "2026-10-10" })).can.map((c) => c.ma_can)).toEqual(["1509", "3402", "2501"]);
});

test("test_QT2_1_ngay_tra_khong_phai_dem_co_khach", async () => {
  // Đọc đúng đêm theo QT2.1 khi có đặt phòng (ghi đặt phòng thật làm ở US3)
  banThu.napDuLieuMau();
  const [c1509] = (await getLichThang({ thang: "2026-10" })).can;
  banThu.themBooking({ can_id: c1509.can_id, ngay_nhan: "2026-10-10", ngay_tra: "2026-10-12", trang_thai: "hieu_luc" });
  expect((await getLichThang({ thang: "2026-10" })).ngay.map((n) => n.ngay)).toEqual(["2026-10-10", "2026-10-11"]);
  const ngay11 = await getLichNgay({ ngay: "2026-10-11" });
  expect(ngay11.can[0]).toMatchObject({ trong: false, dat_phong: { so_dem: 2, ngay_nhan: "2026-10-10" } });
  expect((await getLichNgay({ ngay: "2026-10-12" })).can[0].trong).toBe(true);
});

test("test_US2_du_lieu_sai", async () => {
  banThu.napDuLieuMau();
  expect(await maLoi(getLichThang({ thang: "2026-13" }))).toBe("DU_LIEU_SAI");
  expect(await maLoi(getLichThang({ thang: "10/2026" }))).toBe("DU_LIEU_SAI");
  expect(await maLoi(getLichNgay({ ngay: "2026-02-30" }))).toBe("DU_LIEU_SAI");
});

// Quyền (US2 mục Quyền, PQ4.CHU): chủ nhà A gọi API lịch của chủ nhà B
test("test_US2_PQ4_CHU_chu_nha_khong_thay_lich_cua_chu_nha_khac", async () => {
  banThu.napDuLieuMau();
  const canHoa = (await getLichThang({ thang: "2026-10" })).can;
  await chuNhaMoi("zalo-anh-tuan");
  await postCan({ ma_can: "Sapphire 1103", so_phong_ngu: 3 });
  await postCan({ ma_can: "À La Carte 2208", so_phong_ngu: 1 });
  const lich = await getLichThang({ thang: "2026-10" });
  expect(lich.can.map((c) => c.ma_can)).toEqual(["Sapphire 1103", "À La Carte 2208"]);
  expect((await getLichNgay({ ngay: "2026-10-10" })).can.map((c) => c.ma_can)).toEqual([
    "Sapphire 1103",
    "À La Carte 2208",
  ]);
  // Gọi với can_id của Chị Hoa: KHONG_TIM_THAY
  expect(await maLoi(getLichThang({ thang: "2026-10", can_id: canHoa[0].can_id }))).toBe("KHONG_TIM_THAY");
});

test("test_US2_PQ4_CHU_chua_dang_nhap", async () => {
  expect(await maLoi(getLichThang({ thang: "2026-10" }))).toBe("CHUA_DANG_NHAP");
  expect(await maLoi(getLichNgay({ ngay: "2026-10-10" }))).toBe("CHUA_DANG_NHAP");
});

test("test_HV2_mat_mang_goi_lich_bao_loi_mang", async () => {
  banThu.napDuLieuMau();
  banThu.datMatMang(true);
  expect(await maLoi(getLichThang({ thang: "2026-10" }))).toBe("MAT_MANG");
});

test("test_DLM_1_hom_nay_mau_va_gio_viet_nam", () => {
  banThu.napDuLieuMau();
  expect(homNay()).toBe("2026-10-07");
  banThu.xoaSach();
  // 17:30 giờ UTC ngày 31/10 là 00:30 ngày 01/11 ở Việt Nam
  expect(ngayVN(Date.parse("2026-10-31T17:30:00Z"))).toBe("2026-11-01");
  expect(ngayVN(Date.parse("2026-10-31T16:59:00Z"))).toBe("2026-10-31");
});

test("test_YC2_tuan_bat_dau_thu_hai_thang_10_2026", () => {
  // US2-KB3: ngày 1 ở cột T5 (ba ô trống trước), ngày 31 ở cột T7
  const o = luoiThang("2026-10");
  expect(o.slice(0, 4)).toEqual([null, null, null, "2026-10-01"]);
  expect(o.indexOf("2026-10-31") % 7).toBe(5);
  expect(o.filter(Boolean)).toHaveLength(31);
  // Tháng bắt đầu đúng thứ hai (06/2026) thì không có ô trống
  expect(luoiThang("2026-06")[0]).toBe("2026-06-01");
});

test("test_QT2_1_cac_dem", () => {
  expect(cacDem("2026-10-09", "2026-10-12")).toEqual(["2026-10-09", "2026-10-10", "2026-10-11"]);
  expect(cacDem("2026-10-31", "2026-11-02")).toEqual(["2026-10-31", "2026-11-01"]);
});
