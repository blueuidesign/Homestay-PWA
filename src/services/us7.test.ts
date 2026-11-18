import { beforeEach, expect, test } from "vitest";
import { banThu, getCan, getGiaCan, getLichThang, postCan, postGiaNhieuCan, postGiaSaoChep, putGiaThang } from "./api";
import { LoiApi, LoiMang, type BangGia } from "./kieu";

// US7 · Server giả của đặt giá nhiều căn và sao chép giá (QD22), cùng đường API với api/gia.md:
// POST /gia/nhieu-can và POST /can/:id/gia/sao-chep. Số theo ví dụ của YC3: 800.000đ, 1.100.000đ, Tháng 11 – 12.

const maLoi = (p: Promise<unknown>) =>
  p.then(
    () => null,
    (e) => (e instanceof LoiApi ? `${e.loi}:${e.o ?? ""}` : e instanceof LoiMang ? "MAT_MANG" : String(e)),
  );

let lan = 0;
const khoa = () => `khoa-us7-${++lan}`;
let c1509 = "";
let c3402 = "";
let cGreenbay = "";
let c2208 = "";

beforeEach(async () => {
  banThu.xoaSach();
  banThu.datDoTre(0);
  banThu.datMatMang(false);
  banThu.napDuLieuMau(false, true);
  [c1509, c3402] = (await getLichThang({ thang: "2026-10" })).can.map((c) => c.can_id);
  // Canvas CN6-05 có 4 căn (DLM.9): Chị Hoa thêm "Greenbay" (2PN) và "2208" (1PN) chưa đặt giá
  cGreenbay = (await postCan({ ma_can: "Greenbay", so_phong_ngu: 2 })).id;
  c2208 = (await postCan({ ma_can: "2208", so_phong_ngu: 1 })).id;
});

const thang = (b: BangGia, t: string) => b.thang.find((x) => x.thang === t)!;
const dem = (b: BangGia, ngay: string) => b.dem!.find((d) => d.ngay === ngay)!.gia;
const ap = (ids: string[], ds: string[], thuong = 800000, cuoi = 1100000) =>
  postGiaNhieuCan({ can_ids: ids, thang: ds, gia_ngay_thuong: thuong, gia_cuoi_tuan: cuoi }, khoa());
const saoChep = (tu: string, den: string[], p: { thang?: boolean; le?: boolean; dip?: boolean } = {}) =>
  postGiaSaoChep(tu, { den_can_ids: den, gia_thang: p.thang ?? true, gia_le: p.le ?? true, gia_dip_dac_biet: p.dip ?? true }, khoa());

test("test_YC3_6_NT1_NT2_US7_KB1_KB2_danh_sach_co_4_can_de_chon", async () => {
  const ds = (await getCan()).map((c) => c.ma_can).sort();
  expect(ds).toEqual(["1509", "2208", "3402", "Greenbay"]);
  expect((await getCan()).filter((c) => c.chua_dat_gia).map((c) => c.ma_can).sort()).toEqual(["2208", "Greenbay"]);
});

test("test_YC3_6_NT3_US7_KB4_dat_gia_thang_11_12_cho_greenbay_va_2208", async () => {
  const kq = await ap([cGreenbay, c2208], ["2026-12", "2026-11"]);
  expect(kq).toEqual({ can_ids: [cGreenbay, c2208], so_can: 2, thang: ["2026-11", "2026-12"], gia_dip_ids: null });
  for (const id of [cGreenbay, c2208]) {
    const b = await getGiaCan(id, { nam: 2026, thang: "2026-11" });
    for (const t of ["2026-11", "2026-12"]) {
      expect(thang(b, t)).toMatchObject({ gia_ngay_thuong: 800000, gia_cuoi_tuan: 1100000, gia_thap_nhat: 800000, gia_cao_nhat: 1100000 });
    }
    expect(thang(b, "2026-10")).toMatchObject({ gia_ngay_thuong: null, gia_thap_nhat: null });
    // 05/11 (T5) 800k, 06/11 (T6) 1,1tr, 07/11 (T7) 1,1tr, 08/11 (CN) 800k
    expect([dem(b, "2026-11-05"), dem(b, "2026-11-06"), dem(b, "2026-11-07"), dem(b, "2026-11-08")]).toEqual([800000, 1100000, 1100000, 800000]);
  }
  // 1509 và 3402 không đổi
  expect(thang(await getGiaCan(c1509, { nam: 2026 }), "2026-11")).toMatchObject({ gia_thap_nhat: 900000, gia_cao_nhat: 1300000 });
  expect(thang(await getGiaCan(c3402, { nam: 2026 }), "2026-11").gia_ngay_thuong).toBeNull();
});

test("test_YC3_6_NT3_US7_KB5_doi_gia_thang_10_cua_1509_va_3402_dip_van_thay_gia_thang", async () => {
  await ap([c1509, c3402], ["2026-10"], 1000000, 1500000);
  const b1509 = await getGiaCan(c1509, { nam: 2026, thang: "2026-10" });
  expect([dem(b1509, "2026-10-08"), dem(b1509, "2026-10-09"), dem(b1509, "2026-10-16"), dem(b1509, "2026-10-22")]).toEqual([1000000, 1500000, 1500000, 1000000]);
  const b3402 = await getGiaCan(c3402, { nam: 2026, thang: "2026-10" });
  expect([dem(b3402, "2026-10-22"), dem(b3402, "2026-10-23"), dem(b3402, "2026-10-24"), dem(b3402, "2026-10-25")]).toEqual([1000000, 1500000, 1300000, 1300000]);
});

test("test_YC3_6_NT3_US7_KB8_gia_nam_2027_khong_de_len_nam_2026", async () => {
  await ap([cGreenbay, c2208], ["2027-01"], 700000, 1000000);
  for (const id of [cGreenbay, c2208]) {
    expect(thang(await getGiaCan(id, { nam: 2027 }), "2027-01")).toMatchObject({ gia_thap_nhat: 700000, gia_cao_nhat: 1000000 });
    expect(thang(await getGiaCan(id, { nam: 2026 }), "2026-01").gia_ngay_thuong).toBeNull();
  }
});

test("test_YC3_6_NT3_US7_KB6_chua_chon_thang_khong_luu_gi", async () => {
  const loi = await ap([cGreenbay, c2208], []).catch((e) => e);
  expect([loi.loi, loi.o, loi.ly_do]).toEqual(["DU_LIEU_SAI", "thang", "Chưa chọn tháng nào. Chọn một tháng bên trên sau đó nhập giá."]);
  expect((await getCan()).filter((c) => c.chua_dat_gia)).toHaveLength(2);
});

test("test_YC3_6_US7_chua_chon_can_hoac_gia_dip_nhieu_can_chua_nhan", async () => {
  expect(await maLoi(ap([], ["2026-11"]))).toBe("DU_LIEU_SAI:can_ids");
  const dip = postGiaNhieuCan({ can_ids: [cGreenbay], thang: ["2026-11"], gia_ngay_thuong: 1, gia_cuoi_tuan: 1, gia_dip: null }, khoa());
  expect(await maLoi(dip)).toBeNull();
});

test("test_HV1_US7_KB10_bam_hai_lan_cung_khoa_chi_ghi_mot_lan", async () => {
  const k = khoa();
  const than = { can_ids: [cGreenbay, c2208], thang: ["2026-11"], gia_ngay_thuong: 800000, gia_cuoi_tuan: 1100000 };
  const a = await postGiaNhieuCan(than, k);
  // Lần hai cùng khóa nhưng đã có người đổi giá ở giữa: không ghi lại
  await putGiaThang(cGreenbay, { thang: ["2026-11"], gia_ngay_thuong: 500000, gia_cuoi_tuan: 600000 }, khoa());
  const b = await postGiaNhieuCan(than, k);
  expect(b).toEqual(a);
  expect(thang(await getGiaCan(cGreenbay, { nam: 2026 }), "2026-11").gia_ngay_thuong).toBe(500000);
});

test("test_HV2_US7_KB9_mat_mang_khong_ghi_gia", async () => {
  banThu.datMatMang(true);
  expect(await maLoi(ap([cGreenbay, c2208], ["2026-11"]))).toBe("MAT_MANG");
  banThu.datMatMang(false);
  expect((await getCan()).filter((c) => c.chua_dat_gia)).toHaveLength(2);
});

test("test_PQ5_CHU_US7_mot_can_khong_phai_cua_nguoi_goi_thi_khong_can_nao_doi", async () => {
  expect(await maLoi(ap([cGreenbay, "can-khong-co"], ["2026-11"]))).toBe("KHONG_TIM_THAY:");
  expect(thang(await getGiaCan(cGreenbay, { nam: 2026 }), "2026-11").gia_ngay_thuong).toBeNull();
  expect(await maLoi(saoChep(c3402, ["can-khong-co"]))).toBe("KHONG_TIM_THAY:");
  expect(await maLoi(saoChep("can-khong-co", [cGreenbay]))).toBe("KHONG_TIM_THAY:");
});

test("test_YC3_7_NT1_US7_KB13_chua_chon_can_dich_khong_sao_chep_duoc", async () => {
  const loi = await saoChep(c3402, []).catch((e) => e);
  expect([loi.loi, loi.o, loi.ly_do]).toEqual(["DU_LIEU_SAI", "den_can_ids", "Chọn căn để sao chép"]);
  expect(await maLoi(saoChep(c3402, [c3402]))).toBe("DU_LIEU_SAI:den_can_ids");
  expect(await maLoi(saoChep(c3402, [cGreenbay], { thang: false, le: false, dip: false }))).toBe("DU_LIEU_SAI:gia_thang");
});

test("test_YC3_7_NT2_US7_KB14_chi_chep_gia_thang_dip_cua_can_dich_khong_doi", async () => {
  // Chuẩn bị: 3402 có giá T6 đến T12 (sau khi áp dụng Tháng 11 – 12, US4-KB1); 1509 có dịp thử 28/10 – 29/10 1.500.000đ
  await putGiaThang(c3402, { thang: ["2026-11", "2026-12"], gia_ngay_thuong: 800000, gia_cuoi_tuan: 1100000 }, khoa());
  banThu.themDipGia("1509", { ten: "Dịp thử", tu_ngay: "2026-10-28", den_ngay: "2026-10-29", la_ngay_le: false, gia_moi_dem: 1500000 });
  const kq = await saoChep(c3402, [c1509], { thang: true, le: false, dip: false });
  expect(kq).toEqual({ tu_can_id: c3402, den_can_ids: [c1509], so_can: 1, thang_giu_gia_cu: [], dip_giu_cu: [], dip_bo_qua: [] });
  const b = await getGiaCan(c1509, { nam: 2026, thang: "2026-10" });
  expect([dem(b, "2026-10-22"), dem(b, "2026-10-23"), dem(b, "2026-10-24")]).toEqual([800000, 1100000, 1100000]); // không lấy dịp 24/10 – 25/10 của 3402
  expect([dem(b, "2026-10-28"), dem(b, "2026-10-29")]).toEqual([1500000, 1500000]);
  expect(b.dai_dip.map((d) => [d.ten, d.tu_ngay, d.den_ngay, d.gia_moi_dem])).toEqual([["Dịp thử", "2026-10-28", "2026-10-29", 1500000]]);
});

test("test_YC3_7_NT3_US7_KB15_chep_ca_ba_phan_sang_2_can_so_can_la_2", async () => {
  await putGiaThang(c3402, { thang: ["2026-11", "2026-12"], gia_ngay_thuong: 800000, gia_cuoi_tuan: 1100000 }, khoa());
  const kq = await saoChep(c3402, [cGreenbay, c2208]);
  expect(kq.so_can).toBe(2); // cho toast "Đã sao chép giá sang 2 căn"
  for (const id of [cGreenbay, c2208]) {
    const b = await getGiaCan(id, { nam: 2026, thang: "2026-10" });
    expect(thang(b, "2026-10")).toMatchObject({ gia_thap_nhat: 800000, gia_cao_nhat: 1300000 });
    expect(thang(b, "2026-11")).toMatchObject({ gia_thap_nhat: 800000, gia_cao_nhat: 1100000 });
    expect(thang(b, "2026-12")).toMatchObject({ gia_thap_nhat: 800000, gia_cao_nhat: 1100000 });
    expect(b.dai_dip.map((d) => [d.tu_ngay, d.den_ngay, d.gia_moi_dem])).toEqual([["2026-10-24", "2026-10-25", 1300000]]);
    expect(dem(b, "2026-10-24")).toBe(1300000);
  }
});

test("test_HV2_US7_KB19_mat_mang_khi_sao_chep_khong_doi_gia", async () => {
  banThu.datMatMang(true);
  expect(await maLoi(saoChep(c3402, [cGreenbay, c2208]))).toBe("MAT_MANG");
  banThu.datMatMang(false);
  expect(thang(await getGiaCan(cGreenbay, { nam: 2026 }), "2026-10").gia_ngay_thuong).toBeNull();
});

// Đổi theo quyết định của Tùng 04/11/2026 (US7, điểm 6): trước đây ca này báo DU_LIEU_SAI và không căn nào đổi
test("test_YC3_7_US7_KB14_thang_nguon_chua_co_gia_ma_dich_co_thi_giu_gia_dich_khong_bao_loi", async () => {
  // 3402 có giá T6 đến T10; 1509 có T10 đến T12; Greenbay chưa có giá nào
  const kq = await saoChep(c3402, [cGreenbay, c1509]);
  expect(kq.so_can).toBe(2);
  expect(kq.thang_giu_gia_cu).toEqual([{ can_id: c1509, ma_can: "1509", thang: ["2026-11", "2026-12"] }]);
  // 1509 giữ nguyên T11, T12; T10 lấy giá 3402
  const b = await getGiaCan(c1509, { nam: 2026 });
  expect(thang(b, "2026-11")).toMatchObject({ gia_ngay_thuong: 900000, gia_cuoi_tuan: 1300000 });
  expect(thang(b, "2026-12")).toMatchObject({ gia_ngay_thuong: 900000, gia_cuoi_tuan: 1300000 });
  expect(thang(b, "2026-10")).toMatchObject({ gia_ngay_thuong: 800000, gia_cuoi_tuan: 1100000 });
  expect(thang(b, "2026-06")).toMatchObject({ gia_ngay_thuong: 800000 });
  // Greenbay: tháng nguồn có thì chép, tháng nguồn trống và đích trống thì để trống
  const g = await getGiaCan(cGreenbay, { nam: 2026 });
  expect(thang(g, "2026-10")).toMatchObject({ gia_ngay_thuong: 800000, gia_cuoi_tuan: 1100000 });
  expect(thang(g, "2026-11").gia_ngay_thuong).toBeNull();
  expect(thang(g, "2026-12").gia_ngay_thuong).toBeNull();
});

test("test_YC3_7_US7_KB14_khong_chon_gia_thang_thi_khong_co_thang_giu_gia_cu", async () => {
  const kq = await saoChep(c3402, [c1509], { thang: false, le: false, dip: true });
  expect(kq.thang_giu_gia_cu).toEqual([]);
  expect(kq.dip_giu_cu).toEqual([]);
});

// Tùng quyết 04/11/2026 (US7, điểm 12, "PA B"): dịp của đích mà nguồn không có thì giữ. Trước đây ca này báo DU_LIEU_SAI "chưa có cách làm"
test("test_YC3_7_US7_KB14_dich_co_dip_nguon_khong_co_thi_giu_dip_dich_chep_phan_con_lai_bao_dip_giu_cu", async () => {
  banThu.themDipGia("1509", { ten: "Pháo hoa 30/4", tu_ngay: "2026-04-30", den_ngay: "2026-05-02", la_ngay_le: false, gia_moi_dem: 3000000 });
  const kq = await saoChep(c3402, [cGreenbay, c1509]);
  expect(kq.so_can).toBe(2);
  expect(kq.dip_giu_cu).toEqual([{ can_id: c1509, ma_can: "1509", dip: [{ ten: "Pháo hoa 30/4", tu: "2026-04-30", den: "2026-05-02" }] }]);
  const b = await getGiaCan(c1509, { nam: 2026, thang: "2026-04" });
  expect(dem(b, "2026-04-30")).toBe(3000000);
  expect(b.dai_dip.map((d) => [d.ten, d.gia_moi_dem])).toContainEqual(["Pháo hoa 30/4", 3000000]);
  // Dịp 24/10 – 25/10 của 3402 được chép sang 1509 cùng lúc
  const t10 = await getGiaCan(c1509, { nam: 2026, thang: "2026-10" });
  expect(t10.dai_dip.map((d) => [d.tu_ngay, d.den_ngay, d.gia_moi_dem])).toContainEqual(["2026-10-24", "2026-10-25", 1300000]);
  // Phần giá tháng vẫn chép
  expect(thang(await getGiaCan(c1509, { nam: 2026 }), "2026-10")).toMatchObject({ gia_ngay_thuong: 800000, gia_cuoi_tuan: 1100000 });
  // Greenbay không có dịp nào để giữ, dịp của 3402 chép sang
  expect((await getGiaCan(cGreenbay, { nam: 2026, thang: "2026-10" })).dai_dip).toHaveLength(1);
});

test("test_YC3_7_US7_KB14_dip_dich_cua_loai_khong_chon_thi_khong_bao_va_khong_doi", async () => {
  banThu.themDipGia("1509", { ten: "Pháo hoa 30/4", tu_ngay: "2026-04-30", den_ngay: "2026-05-02", la_ngay_le: false, gia_moi_dem: 3000000 });
  const kq = await saoChep(c3402, [c1509], { thang: true, le: true, dip: false });
  expect(kq.dip_giu_cu).toEqual([]);
  expect(dem(await getGiaCan(c1509, { nam: 2026, thang: "2026-04" }), "2026-04-30")).toBe(3000000);
});

// Tùng quyết 04/11/2026 (US7, điểm 13, "Phương án B"): thay cho test cũ "dịp chồng ngày vẫn báo lỗi" của PR #127.
// Dịp nguồn chồng dịp khác của đích thì giữ dịp đích, bỏ dịp nguồn ở căn đó, chép phần còn lại, không báo lỗi cả lần
test("test_YC3_7_US7_KB14_dip_nguon_chong_ngay_dip_dich_thi_giu_dich_bo_dip_nguon_khong_bao_loi", async () => {
  banThu.themDipGia("1509", { ten: "Dịp chồng", tu_ngay: "2026-10-25", den_ngay: "2026-10-26", la_ngay_le: false, gia_moi_dem: 2000000 });
  const kq = await saoChep(c3402, [cGreenbay, c1509]);
  expect(kq.so_can).toBe(2);
  expect(kq.dip_bo_qua).toHaveLength(1);
  expect(kq.dip_bo_qua[0].ma_can).toBe("1509");
  expect(kq.dip_bo_qua[0].dip.map((d) => [d.tu, d.den])).toEqual([["2026-10-24", "2026-10-25"]]);
  expect(kq.dip_giu_cu).toEqual([{ can_id: c1509, ma_can: "1509", dip: [{ ten: "Dịp chồng", tu: "2026-10-25", den: "2026-10-26" }] }]);
  // 1509 giữ nguyên dịp 25/10 – 26/10 giá 2.000.000, không có dịp 24/10 của 3402
  const t10 = await getGiaCan(c1509, { nam: 2026, thang: "2026-10" });
  expect(t10.dai_dip.map((d) => [d.tu_ngay, d.den_ngay, d.gia_moi_dem])).toEqual([["2026-10-25", "2026-10-26", 2000000]]);
  expect(dem(t10, "2026-10-25")).toBe(2000000);
  // Phần giá tháng vẫn chép sang 1509
  expect(thang(await getGiaCan(c1509, { nam: 2026 }), "2026-10")).toMatchObject({ gia_ngay_thuong: 800000, gia_cuoi_tuan: 1100000 });
  // Greenbay không chồng nên chép bình thường và không nằm trong danh sách bỏ qua
  expect((await getGiaCan(cGreenbay, { nam: 2026, thang: "2026-10" })).dai_dip.map((d) => [d.tu_ngay, d.den_ngay, d.gia_moi_dem])).toEqual([["2026-10-24", "2026-10-25", 1300000]]);
  expect(kq.dip_bo_qua.some((g) => g.can_id === cGreenbay)).toBe(false);
});
