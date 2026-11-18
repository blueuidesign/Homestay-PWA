import { beforeEach, expect, test } from "vitest";
import {
  banThu,
  getCan,
  getGiaCan,
  getLichNgay,
  getLichThang,
  postCan,
  postPhien,
  postTaiKhoan,
  putGiaThang,
} from "./api";
import { LoiApi, LoiMang, type BangGia } from "./kieu";

// US4 · Server giả của giá theo tháng (QD22), cùng đường API với api/gia.md:
// GET /can/:id/gia, PUT /can/:id/gia-thang và khoảng giá tuần này của GET /can. Số theo DLM.3 (800.000đ và 1.100.000đ).

const maLoi = (p: Promise<unknown>) =>
  p.then(
    () => null,
    (e) => (e instanceof LoiApi ? `${e.loi}:${e.o ?? ""}` : e instanceof LoiMang ? "MAT_MANG" : String(e)),
  );

let lan = 0;
const khoa = () => `khoa-gia-${++lan}`;
let c1509 = "";
let c3402 = "";

beforeEach(async () => {
  banThu.xoaSach();
  banThu.datDoTre(0);
  banThu.datMatMang(false);
  banThu.napDuLieuMau(false, true);
  [c1509, c3402] = (await getLichThang({ thang: "2026-10" })).can.map((c) => c.can_id);
});

const thang = (b: BangGia, t: string) => b.thang.find((x) => x.thang === t)!;
const dem = (b: BangGia, ngay: string) => b.dem!.find((d) => d.ngay === ngay)!;
const ap = (canId: string, ds: string[], thuong = 800000, cuoi = 1100000) =>
  putGiaThang(canId, { thang: ds, gia_ngay_thuong: thuong, gia_cuoi_tuan: cuoi }, khoa());

test("test_YC3_4_NT1_US4_KB1_ap_dung_thang_11_12_cho_3402", async () => {
  const truoc = await getGiaCan(c3402, { nam: 2026 });
  expect(thang(truoc, "2026-10")).toMatchObject({ gia_thap_nhat: 800000, gia_cao_nhat: 1300000 });
  expect(thang(truoc, "2026-11")).toMatchObject({ gia_ngay_thuong: null, gia_thap_nhat: null });
  expect(thang(truoc, "2026-12")).toMatchObject({ gia_ngay_thuong: null, gia_thap_nhat: null });
  const kq = await ap(c3402, ["2026-12", "2026-11"]);
  expect(kq.thang).toEqual([
    { thang: "2026-11", gia_ngay_thuong: 800000, gia_cuoi_tuan: 1100000 },
    { thang: "2026-12", gia_ngay_thuong: 800000, gia_cuoi_tuan: 1100000 },
  ]);
  const sau = await getGiaCan(c3402, { nam: 2026 });
  for (const t of ["2026-11", "2026-12"]) {
    expect(thang(sau, t)).toMatchObject({ gia_ngay_thuong: 800000, gia_cuoi_tuan: 1100000, gia_thap_nhat: 800000, gia_cao_nhat: 1100000 });
  }
  expect(thang(sau, "2026-10")).toMatchObject({ gia_thap_nhat: 800000, gia_cao_nhat: 1300000 });
});

test("test_YC3_4_NT2_US4_KB6_chua_chon_thang_bao_loi_khong_luu", async () => {
  const loi = await putGiaThang(c3402, { thang: [], gia_ngay_thuong: 800000, gia_cuoi_tuan: 1100000 }, khoa()).catch((e) => e);
  expect(loi).toBeInstanceOf(LoiApi);
  expect([loi.loi, loi.o, loi.ly_do]).toEqual(["DU_LIEU_SAI", "thang", "Chưa chọn tháng nào. Chọn một tháng bên trên sau đó nhập giá."]);
  const b = await getGiaCan(c3402, { nam: 2026 });
  expect(thang(b, "2026-11").gia_ngay_thuong).toBeNull();
});

test("test_YC3_4_NT3_YC3_1_NT3_US4_KB5_can_chua_co_gia", async () => {
  const moi = await postCan({ ma_can: "2105", so_phong_ngu: 1 });
  const b = await getGiaCan(moi.id, { nam: 2026 });
  expect(b.ma_can).toBe("2105");
  expect(b.thang).toHaveLength(12);
  expect(b.thang.every((t) => t.gia_ngay_thuong === null && t.gia_cuoi_tuan === null && t.gia_thap_nhat === null)).toBe(true);
  expect(b.dai_dip).toEqual([]);
  const the = (await getCan()).find((c) => c.ma_can === "2105")!;
  expect(the.chua_dat_gia).toBe(true);
  expect(the.gia_tuan_nay).toBeNull();
});

test("test_YC3_4_NT4_US4_KB2_lich_gia_thang_10_cua_3402_tach_hai_loai_dem", async () => {
  const b = await getGiaCan(c3402, { nam: 2026, thang: "2026-10" });
  expect(b.dem).toHaveLength(31);
  expect(b.dem_cuoi_tuan).toEqual([5, 6]);
  expect(dem(b, "2026-10-08")).toMatchObject({ gia: 800000, loai_dem: "thuong" }); // T5
  expect(dem(b, "2026-10-09")).toMatchObject({ gia: 1100000, loai_dem: "cuoi_tuan" }); // T6
  expect(dem(b, "2026-10-10")).toMatchObject({ gia: 1100000, loai_dem: "cuoi_tuan" }); // T7
  expect(dem(b, "2026-10-11")).toMatchObject({ gia: 800000, loai_dem: "thuong" }); // CN
  expect(dem(b, "2026-10-30").gia).toBe(1100000);
  expect(dem(b, "2026-10-31").gia).toBe(1100000);
  expect(dem(b, "2026-10-01").gia).toBe(800000);
  // Dịp đặc biệt thay giá tháng (YC3.5-NT3)
  expect(dem(b, "2026-10-24")).toMatchObject({ gia: 1300000, loai_dem: "dip" });
  expect(dem(b, "2026-10-25")).toMatchObject({ gia: 1300000, loai_dem: "dip" });
  expect(b.dai_dip).toEqual([
    expect.objectContaining({ ten: "Dịp đặc biệt 24/10 – 25/10", tu_ngay: "2026-10-24", den_ngay: "2026-10-25", la_ngay_le: false, gia_moi_dem: 1300000 }),
  ]);
  // Có khách: 05, 06, 14, 17, 18, 21/10 (DLM.4, CN6.md)
  expect(b.dem!.filter((d) => d.co_khach).map((d) => Number(d.ngay.slice(8)))).toEqual([5, 6, 14, 17, 18, 21]);
});

test("test_YC3_4_NT4_US4_KB3_lich_gia_thang_10_cua_1509_dung_gia_cua_can", async () => {
  const b = await getGiaCan(c1509, { nam: 2026, thang: "2026-10" });
  expect(thang(b, "2026-10")).toMatchObject({ gia_thap_nhat: 900000, gia_cao_nhat: 1300000 });
  expect(dem(b, "2026-10-09").gia).toBe(1300000);
  expect(dem(b, "2026-10-10").gia).toBe(1300000);
  expect(dem(b, "2026-10-08").gia).toBe(900000);
  expect(dem(b, "2026-10-11").gia).toBe(900000);
  expect(b.dem!.filter((d) => d.co_khach).map((d) => Number(d.ngay.slice(8)))).toEqual([4, 5, 10, 11, 13, 14, 19]);
});

test("test_YC3_4_NT1_NT4_US4_KB4_lich_gia_thang_11_12_sau_khi_ap_dung", async () => {
  await ap(c3402, ["2026-11", "2026-12"]);
  const t11 = await getGiaCan(c3402, { nam: 2026, thang: "2026-11" });
  expect(dem(t11, "2026-11-01").gia).toBe(800000); // CN
  expect(dem(t11, "2026-11-05").gia).toBe(800000); // T5
  expect(dem(t11, "2026-11-06").gia).toBe(1100000); // T6
  expect(dem(t11, "2026-11-07").gia).toBe(1100000); // T7
  expect(dem(t11, "2026-11-08").gia).toBe(800000);
  expect(dem(t11, "2026-11-27").gia).toBe(1100000);
  expect(dem(t11, "2026-11-28").gia).toBe(1100000);
  expect(dem(t11, "2026-11-30").gia).toBe(800000); // T2
  const t12 = await getGiaCan(c3402, { nam: 2026, thang: "2026-12" });
  expect(dem(t12, "2026-12-01").gia).toBe(800000);
  expect(dem(t12, "2026-12-25").gia).toBe(1100000);
  expect(dem(t12, "2026-12-26").gia).toBe(1100000);
  expect(dem(t12, "2026-12-31").gia).toBe(800000);
});

test("test_YC3_1_NT3_NT4_US4_KB7_KB8_the_can_khoang_gia_tuan_nay_va_chua_dat_gia", async () => {
  const ds = await getCan();
  expect(ds.find((c) => c.ma_can === "1509")).toMatchObject({ gia_tuan_nay: { thap_nhat: 900000, cao_nhat: 1300000 }, chua_dat_gia: false });
  expect(ds.find((c) => c.ma_can === "3402")).toMatchObject({ gia_tuan_nay: { thap_nhat: 800000, cao_nhat: 1100000 }, chua_dat_gia: false });
  // KB8: căn 2105 chưa có giá, đặt Tháng 10 thì thẻ ghi khoảng giá tuần này
  const moi = await postCan({ ma_can: "2105", so_phong_ngu: 1 });
  expect((await getCan()).find((c) => c.id === moi.id)).toMatchObject({ chua_dat_gia: true, gia_tuan_nay: null });
  await ap(moi.id, ["2026-10"]);
  const b = await getGiaCan(moi.id, { nam: 2026 });
  expect(thang(b, "2026-10")).toMatchObject({ gia_thap_nhat: 800000, gia_cao_nhat: 1100000 });
  expect(thang(b, "2026-11").gia_ngay_thuong).toBeNull();
  expect((await getCan()).find((c) => c.id === moi.id)).toMatchObject({ chua_dat_gia: false, gia_tuan_nay: { thap_nhat: 800000, cao_nhat: 1100000 } });
});

test("test_YC3_4_NT5_US4_KB9_nam_2027_khong_lan_nam_2026", async () => {
  const b27 = await getGiaCan(c3402, { nam: 2027 });
  expect(b27.nam).toBe(2027);
  expect(b27.thang.map((t) => t.thang)).toEqual(Array.from({ length: 12 }, (_, i) => `2027-${String(i + 1).padStart(2, "0")}`));
  expect(b27.thang.every((t) => t.gia_thap_nhat === null)).toBe(true);
  await ap(c3402, ["2027-01"]);
  expect(thang(await getGiaCan(c3402, { nam: 2027 }), "2027-01")).toMatchObject({ gia_thap_nhat: 800000, gia_cao_nhat: 1100000 });
  const b26 = await getGiaCan(c3402, { nam: 2026 });
  expect(thang(b26, "2026-01").gia_ngay_thuong).toBeNull();
  expect(thang(b26, "2026-10")).toMatchObject({ gia_thap_nhat: 800000, gia_cao_nhat: 1300000 });
});

test("test_YC3_4_NT1_NT4_NT5_US4_KB10_ca_12_thang_2027_lich_qua_nam", async () => {
  await ap(c3402, ["2026-11", "2026-12"]);
  await ap(c3402, Array.from({ length: 12 }, (_, i) => `2027-${String(i + 1).padStart(2, "0")}`));
  const b27 = await getGiaCan(c3402, { nam: 2027 });
  expect(b27.thang.every((t) => t.gia_thap_nhat === 800000 && t.gia_cao_nhat === 1100000)).toBe(true);
  // Lịch giá chuyển từ T12/2026 sang T01/2027: thang không bắt buộc nằm trong nam
  const b = await getGiaCan(c3402, { nam: 2026, thang: "2027-01" });
  expect(b.nam).toBe(2026);
  expect(dem(b, "2027-01-01")).toMatchObject({ gia: 1100000, loai_dem: "cuoi_tuan" }); // T6
  expect(dem(b, "2027-01-02").gia).toBe(1100000); // T7
  expect(dem(b, "2027-01-03").gia).toBe(800000); // CN
});

test("test_YC3_4_US4_KB11_gia_qua_1_ty_khong_luu", async () => {
  expect(await maLoi(ap(c3402, ["2026-11"], 1_000_000_001, 1100000))).toBe("DU_LIEU_SAI:gia_ngay_thuong");
  expect(await maLoi(ap(c3402, ["2026-11"], 800000, 1_000_000_001))).toBe("DU_LIEU_SAI:gia_cuoi_tuan");
  expect(await maLoi(ap(c3402, ["2026-11"], -1, 1100000))).toBe("DU_LIEU_SAI:gia_ngay_thuong");
  expect(await maLoi(ap(c3402, ["2026-11"], 800000.5, 1100000))).toBe("DU_LIEU_SAI:gia_ngay_thuong");
  expect(thang(await getGiaCan(c3402, { nam: 2026 }), "2026-11").gia_ngay_thuong).toBeNull();
  // 1.000.000.000đ đúng giới hạn thì được (api/gia.md: tối đa 1.000.000.000đ)
  await ap(c3402, ["2026-11"], 1_000_000_000, 1_000_000_000);
  expect(thang(await getGiaCan(c3402, { nam: 2026 }), "2026-11").gia_cao_nhat).toBe(1_000_000_000);
});

test("test_YC3_4_US4_thang_ngoai_nam_nay_nam_sau_la_du_lieu_sai", async () => {
  expect(await maLoi(ap(c3402, ["2028-01"]))).toBe("DU_LIEU_SAI:thang");
  expect(await maLoi(ap(c3402, ["2026-13"]))).toBe("DU_LIEU_SAI:thang");
  expect(await maLoi(getGiaCan(c3402, { nam: 1999 }))).toBe("DU_LIEU_SAI:nam");
});

test("test_HV1_US4_KB12_cung_khoa_ap_dung_hai_lan_chi_ghi_mot_ket_qua", async () => {
  const than = { thang: ["2026-11", "2026-12"], gia_ngay_thuong: 800000, gia_cuoi_tuan: 1100000 };
  const k = khoa();
  const a = await putGiaThang(c3402, than, k);
  // Giữa hai lần bấm, giá bị đổi tay: lần gửi lại cùng khóa trả đúng kết quả cũ, không ghi đè
  await ap(c3402, ["2026-11"], 700000, 900000);
  const b = await putGiaThang(c3402, than, k);
  expect(b).toEqual(a);
  expect(thang(await getGiaCan(c3402, { nam: 2026 }), "2026-11").gia_ngay_thuong).toBe(700000);
});

test("test_HV2_US4_KB13_KB14_mat_mang_khong_luu_va_khong_tai_duoc", async () => {
  banThu.datMatMang(true);
  expect(await maLoi(ap(c3402, ["2026-11", "2026-12"]))).toBe("MAT_MANG");
  expect(await maLoi(getGiaCan(c1509, { nam: 2026 }))).toBe("MAT_MANG");
  banThu.datMatMang(false);
  // Có mạng lại: không có gì tự gửi
  expect(thang(await getGiaCan(c3402, { nam: 2026 }), "2026-11").gia_ngay_thuong).toBeNull();
  expect(thang(await getGiaCan(c1509, { nam: 2026 }), "2026-10")).toMatchObject({ gia_thap_nhat: 900000, gia_cao_nhat: 1300000 });
});

test("test_YC3_4_NT6_US4_doi_gia_thang_10_khong_doi_tien_booking_B1", async () => {
  const b1 = (await getLichThang({ thang: "2026-10", can_id: c1509 })).ngay.map((n) => n.ngay);
  expect(b1).toContain("2026-10-10");
  await ap(c1509, ["2026-10"], 500000, 600000);
  const g = await getGiaCan(c1509, { nam: 2026, thang: "2026-10" });
  expect(dem(g, "2026-10-10").gia).toBe(600000);
  // B1 giữ tiền riêng của booking (quy tắc Booking giữ giá riêng), kiểm qua GET /lich/ngay
  const ngay = await getLichNgay({ ngay: "2026-10-10" });
  expect(ngay.can.find((c) => c.can_id === c1509)!.dat_phong!.tien_phong).toBe(2200000);
});

test("test_PQ5_CHU_US4_chu_nha_khac_khong_thay_va_khong_dat_gia_can_cua_chi_hoa", async () => {
  banThu.dungZaloId("zalo-anh-tuan");
  await postPhien();
  await postTaiKhoan({ vai_chon: "chu_nha", dong_y_dieu_khoan_luc: "2026-11-03T02:00:00.000Z" });
  expect(await getCan()).toEqual([]);
  expect(await maLoi(getGiaCan(c3402, { nam: 2026 }))).toBe("KHONG_TIM_THAY:");
  expect(await maLoi(ap(c3402, ["2026-11"]))).toBe("KHONG_TIM_THAY:");
});
