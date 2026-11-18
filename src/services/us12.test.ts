import { beforeEach, expect, test } from "vitest";
import { banThu, getKetNoi, getSaleTim, getSaleTimGanDay, getSaleTimLichTuan, getToaNha, postKetNoiNgung, postPhien } from "./api";
import { LoiApi, type CanTim } from "./kieu";

// US12 · Test server giả của tìm phòng trống (mục "Tìm phòng trống theo ngày" (US12), mục "Kết quả tìm phòng" (US12)). Dữ liệu DLM: hôm nay 07/10/2026.
// Hùng kết nối Chị Hoa và Anh Tuấn; Lan chỉ Chị Hoa. Lần tìm 24/10 → 26/10 (đêm T7, CN) ra 4 căn (item US12, mục Test case).
const maLoi = (p: Promise<unknown>) => p.then(() => null, (e) => (e instanceof LoiApi ? e.loi : String(e)));
let n = 0;
const khoa = () => `khoa-us12-${++n}-xxxxxxxxxxxxxxxx`;
const dung = async (zaloId: string) => {
  banThu.dungZaloId(zaloId);
  return postPhien();
};
const dk = (nhan: string, tra: string, them: object = {}) => ({ ngay_nhan: nhan, ngay_tra: tra, ...them });
const ma = (ds: CanTim[]) => ds.map((c) => c.ma_can).sort();

beforeEach(async () => {
  banThu.xoaSach();
  banThu.datDoTre(0);
  banThu.datMatMang(false);
  banThu.napDuLieuSale("moi");
  await dung("zalo-sale-hung");
});

test("test_YC5_3_NT1_US12_tim_24_10_den_26_10_ra_4_can_trong_giai_theo_ten_gia_chu_va_gia_ban_cua_Hung", async () => {
  const kq = await getSaleTim(dk("2026-10-24", "2026-10-26"));
  expect(kq.so_dem).toBe(2);
  expect(kq.so_can_trong).toBe(4);
  expect(ma(kq.can)).toEqual(["1103", "1509", "2208", "3402"]);
  const c1509 = kq.can.find((c) => c.ma_can === "1509")!;
  expect(c1509.tong_gia_chu).toBe(2200000); // T7 1.300.000 + CN 900.000
  expect(c1509.tong_gia_ban).toBe(2600000); // cộng 200.000 × 2 đêm
  expect(c1509.nhom).toBe("nguon_phong");
  expect(c1509.chu_nha?.ten_hien_thi).toBe("Chị Hoa");
  expect(c1509.khong_co_lich).toBe(false);
  expect(kq.goi_y).toEqual([]);
});

test("test_YC5_2_NT3_US12_10_10_den_12_10_1509_da_kin_nen_khong_co_trong_ket_qua", async () => {
  const kq = await getSaleTim(dk("2026-10-10", "2026-10-12"));
  expect(ma(kq.can)).toEqual(["1103", "2208", "3402"]); // 1509 kín 10/10, 11/10 (B1, QT2.1)
  // Đêm trả phòng không chiếm: 12/10 → 13/10 thì 1509 trống
  expect(ma((await getSaleTim(dk("2026-10-12", "2026-10-13"))).can)).toContain("1509");
});

test("test_YC5_2_NT3_US12_khong_co_can_trong_thi_co_goi_y_kem_so_can_trong", async () => {
  // Sapphire 1103 kín 18/10 → 20/10 (H3); lọc 3PN thì không còn căn.
  // Với tòa Sapphire cộng 3PN, DLM không có gợi ý nào có căn trống (bất ngờ đã ghi ở item, KB8)
  const kq = await getSaleTim(dk("2026-10-18", "2026-10-20", { so_phong_ngu: [3] }));
  expect(kq.can).toEqual([]);
  expect(kq.so_can_trong).toBe(0);
  expect(kq.goi_y.length).toBeGreaterThan(0);
  expect(kq.goi_y.every((g) => g.so_can_trong > 0)).toBe(true);
  const boLoc = kq.goi_y.find((g) => g.loai === "bo_loc" && g.dieu_kien.so_phong_ngu.length === 0);
  expect(boLoc).toBeTruthy();
  // Làm theo gợi ý thì đúng số căn đã báo
  const theo = await getSaleTim({ ...boLoc!.dieu_kien, ghi_lich_su: false });
  expect(theo.so_can_trong).toBe(boLoc!.so_can_trong);
});

test("test_YC5_2_NT5_US12_loai_view_vinh_bi_tu_choi_bien_thanh_pho_nui_hop_le", async () => {
  expect(await maLoi(getSaleTim(dk("2026-10-24", "2026-10-26", { loai_view: ["vinh"] })))).toBe("DU_LIEU_SAI");
  const bien = await getSaleTim(dk("2026-10-24", "2026-10-26", { loai_view: ["bien"] }));
  expect(ma(bien.can)).toEqual(["1509", "2208", "3402"]);
  const phong1 = await getSaleTim(dk("2026-10-24", "2026-10-26", { so_phong_ngu: [1] }));
  expect(ma(phong1.can)).toEqual(["2208", "3402"]);
  const toa = await getToaNha();
  const ala = toa.find((t) => t.ten === "À La Carte")!;
  expect(ma((await getSaleTim(dk("2026-10-24", "2026-10-26", { toa_nha_id: [ala.id] }))).can)).toEqual(["2208"]);
});

// EN53: không còn công tắc giá (QD20 r2 điểm 3). Thay test cũ "chủ nhà tắt giá thì JSON không có khóa giá".
test("test_PQ5_SALE_PQ11_SALE_US12_EN53_moi_can_nguon_phong_co_tong_gia_va_gia_ban_lich_tuan", async () => {
  const kq = await getSaleTim(dk("2026-10-24", "2026-10-26"));
  const tuan = kq.can.filter((c) => c.chu_nha?.ten_hien_thi === "Anh Tuấn");
  expect(tuan).toHaveLength(2);
  for (const c of tuan) {
    expect(typeof c.tong_gia_chu).toBe("number");
    expect(typeof c.tong_gia_ban).toBe("number");
  }
  expect(JSON.stringify(kq)).not.toContain("quyen_gia_tung_dem");
  const lt = await getSaleTimLichTuan(dk("2026-10-24", "2026-10-26"));
  expect(JSON.stringify(lt.can.filter((c) => c.chu_nha?.ten_hien_thi === "Anh Tuấn"))).toContain("gia_ban");
});

test("test_YC5_3_NT3_US12_lich_tuan_cung_tap_can_cung_thu_tu_va_to_dung_dem_khach_hoi", async () => {
  const ds = await getSaleTim(dk("2026-10-24", "2026-10-26", { ghi_lich_su: false }));
  const lt = await getSaleTimLichTuan(dk("2026-10-24", "2026-10-26"));
  expect(lt.can.map((c) => c.id)).toEqual(ds.can.map((c) => c.id));
  expect(lt.so_can_trong).toBe(ds.so_can_trong);
  expect(lt.tu).toBe("2026-10-24");
  expect(lt.ngay).toHaveLength(7);
  expect(lt.dem_khach_hoi).toEqual(["2026-10-24", "2026-10-25"]);
  const o1509 = lt.can.find((c) => c.ma_can === "1509")!.o;
  expect(o1509[0]).toEqual({ ngay: "2026-10-24", trang_thai: "trong", gia_ban: 1500000 });
});

test("test_PQ4_SALE_PQ14_SALE_US12_lan_chi_thay_can_chi_hoa_bi_ngung_thi_khong_con_can_cua_chu_do", async () => {
  await dung("zalo-sale-lan");
  expect(ma((await getSaleTim(dk("2026-10-24", "2026-10-26"))).can)).toEqual(["1509", "3402"]); // không có Sapphire, À La Carte (Anh Tuấn)
  await dung("zalo-chi-hoa");
  const hung = (await getKetNoi()).da_ket_noi.find((d) => d.ten_hien_thi === "Sale Hùng")!;
  await postKetNoiNgung(hung.id, khoa());
  await dung("zalo-sale-hung");
  expect(ma((await getSaleTim(dk("2026-10-24", "2026-10-26"))).can)).toEqual(["1103", "2208"]);
});

test("test_YC5_2_NT4_US12_luat_chung_3_tim_gan_day_ghi_theo_nguoi_goi_giu_5_lan_moi_nhat_truoc", async () => {
  for (const nhan of ["20", "21", "22", "23", "24", "25"]) await getSaleTim(dk(`2026-10-${nhan}`, `2026-10-${Number(nhan) + 1}`));
  const gd = await getSaleTimGanDay();
  expect(gd.muc.map((m) => m.ngay_nhan)).toEqual(["2026-10-25", "2026-10-24", "2026-10-23", "2026-10-22", "2026-10-21"]);
  // Lần tìm có lọc: trả đủ điều kiện để điền sẵn
  await getSaleTim(dk("2026-10-18", "2026-10-20", { so_phong_ngu: [3], toa_nha_id: ["Sapphire"] }));
  const moi = (await getSaleTimGanDay()).muc[0];
  expect(moi).toMatchObject({ ngay_nhan: "2026-10-18", ngay_tra: "2026-10-20", so_phong_ngu: [3], toa_nha: [{ id: "Sapphire", ten: "Sapphire" }] });
  expect(JSON.stringify(moi)).not.toContain("sale_id");
  // ghi_lich_su=false và lịch tuần không ghi
  await getSaleTim(dk("2026-10-30", "2026-10-31", { ghi_lich_su: false }));
  await getSaleTimLichTuan(dk("2026-10-30", "2026-10-31"));
  expect((await getSaleTimGanDay()).muc[0].ngay_nhan).toBe("2026-10-18");
  // Lan không đọc được của Hùng
  await dung("zalo-sale-lan");
  expect((await getSaleTimGanDay()).muc).toEqual([]);
});

test("test_YC5_2_US12_dau_vao_sai_va_khong_phien", async () => {
  expect(await maLoi(getSaleTim(dk("2026-10-12", "2026-10-12")))).toBe("DU_LIEU_SAI");
  expect(await maLoi(getSaleTim(dk("2026-10-01", "2026-11-05")))).toBe("DU_LIEU_SAI"); // hơn 30 đêm
  expect(await maLoi(getSaleTim({ ngay_nhan: "abc", ngay_tra: "2026-10-12" }))).toBe("DU_LIEU_SAI");
  await dung("zalo-thu-b");
  expect(await maLoi(getSaleTim(dk("2026-10-24", "2026-10-26")))).toBe("CHUA_DANG_NHAP");
});
