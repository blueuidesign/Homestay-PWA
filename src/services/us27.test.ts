import { beforeEach, expect, test } from "vitest";
import { banThu, deleteCan, getBookingSale, getCan, getCanChiTiet, getLichNgay, getLichThang, getSaleCan, getSaleKetNoi, getSaleLich, getSaleTim, postBooking, postCan, postPhien, postYeuCau, putGiaThang } from "./api";
import { LoiApi, type ThanDatPhong } from "./kieu";

// US27 · Chủ nhà xóa căn (ẩn căn, mục "Xóa căn" (US27), US27-NT1) trên server giả, máy là Chị Hoa (DLM). Hôm nay 07/10/2026 (DLM.1).
// DLM: 1509 và 3402 đều còn đặt phòng trả sau 07/10 (không xóa được), nên các ca xóa được dùng căn thêm mới (9001...).
// Server thật có test riêng (src/server/api/us27-nt.test.js, us27-pq.test.js); test ghép: services/that/us27.ghep.ts.
const maLoi = (p: Promise<unknown>) => p.then(() => null, (e) => (e instanceof LoiApi ? e.loi : String(e)));
const HOA = "zalo-chi-hoa";
const HUNG = "zalo-sale-hung";
const LAN = "zalo-sale-lan";
const TUAN = "zalo-anh-tuan";
let n = 0;
const khoa = () => `khoa-thu-us27-${String(++n).padStart(6, "0")}`;
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

const maCan = async () => (await getCan()).map((c) => c.ma_can);
const idCan = async (ma: string) => (await getCan()).find((c) => c.ma_can === ma)!.id;
/** Thêm căn có giá 1.000.000đ cả tháng 10 để ghi đặt phòng, gửi yêu cầu. */
const themCan = async (ma: string) => {
  const c = await postCan({ ma_can: ma, so_phong_ngu: 2 }, khoa());
  await putGiaThang(c.id, { thang: ["2026-10"], gia_ngay_thuong: 1_000_000, gia_cuoi_tuan: 1_000_000 }, khoa());
  return c;
};
const themBk = (canId: string, nhan: string, tra: string, trang_thai: "hieu_luc" | "da_huy" = "hieu_luc", them: Record<string, unknown> = {}) =>
  banThu.themBooking({ can_id: canId, ngay_nhan: nhan, ngay_tra: tra, trang_thai, tien_phong: 2_000_000, trang_thai_tien: "da_thanh_toan", ...them });
const ghi = (canId: string, nhan: string, tra: string) =>
  postBooking({ can_id: canId, ngay_nhan: nhan, ngay_tra: tra, ten_khach: "Khách A", tien_phong: 1_000_000, trang_thai_tien: "chua_coc", tien_coc: null } as ThanDatPhong, khoa());

test("test_YC3_9_NT1_US27_xoa_can_con_dat_phong_tra_sau_hom_nay_thi_CAN_CON_DAT_PHONG_va_can_giu_nguyen", async () => {
  // DLM.4: 3402 còn B2 17/10 → 19/10, B8, B9
  const id = await idCan("3402");
  expect(await maLoi(deleteCan(id, khoa()))).toBe("CAN_CON_DAT_PHONG");
  expect(await maCan()).toContain("3402");
  expect((await getCanChiTiet(id)).ma_can).toBe("3402");
  expect(JSON.stringify(await getLichThang({ thang: "2026-10", can_id: id }))).toContain("2026-10-17");
});

test("test_YC3_9_NT1_US27_ly_do_loi_la_Can_con_dat_phong_sap_toi", async () => {
  const id = await idCan("1509");
  const loi = await deleteCan(id, khoa()).then(() => null, (e) => e as LoiApi);
  expect(loi).toMatchObject({ loi: "CAN_CON_DAT_PHONG", ly_do: "Căn còn đặt phòng sắp tới" });
});

test("test_YC3_9_NT2_US27_con_yeu_cau_cho_chu_thi_khong_xoa_duoc_yeu_cau_het_han_thi_xoa_duoc", async () => {
  const c = await themCan("9001");
  await dung(HUNG);
  const y = await postYeuCau({ can_id: c.id, ngay_nhan: "2026-10-20", ngay_tra: "2026-10-22", loi_nhan: null }, khoa());
  expect(y.trang_thai).toBe("cho_chu");
  await dung(HOA);
  expect(await maLoi(deleteCan(c.id, khoa()))).toBe("CAN_CON_DAT_PHONG");
  expect(await maCan()).toContain("9001");
  // Yêu cầu quá hạn 14 ngày thì không tính (api/can-anh.md: chưa quá het_han_luc)
  banThu.tienGioYeuCau(15 * 24 * 60 * 60 * 1000);
  expect((await deleteCan(c.id, khoa())).ket_qua).toBe("an");
});

test("test_YC3_9_NT4_US27_ngay_tra_la_hom_nay_thi_xoa_duoc_ngay_tra_ngay_mai_thi_khong_va_dat_phong_da_huy_khong_tinh", async () => {
  const a = await themCan("9002");
  themBk(a.id, "2026-10-05", "2026-10-07");
  const b = await themCan("9003");
  themBk(b.id, "2026-10-20", "2026-10-22", "da_huy");
  const c = await themCan("9004");
  themBk(c.id, "2026-10-06", "2026-10-08");
  expect(await deleteCan(a.id, khoa())).toMatchObject({ id: a.id, ket_qua: "an", an_luc: expect.stringMatching(/^\d{4}-/) });
  expect((await deleteCan(b.id, khoa())).ket_qua).toBe("an");
  expect(await maLoi(deleteCan(c.id, khoa()))).toBe("CAN_CON_DAT_PHONG");
  const ma = await maCan();
  expect(ma).toContain("9004");
  expect(ma).not.toContain("9002");
  expect(ma).not.toContain("9003");
});

test("test_YC3_9_NT5_YC3_2_NT5_US27_an_xong_can_bien_khoi_danh_sach_lich_va_ma_can_dung_lai_duoc", async () => {
  const a = await themCan("9005");
  await deleteCan(a.id, khoa());
  expect(await maCan()).not.toContain("9005");
  expect(await maLoi(getCanChiTiet(a.id))).toBe("KHONG_TIM_THAY");
  expect(await maLoi(getLichThang({ thang: "2026-10", can_id: a.id }))).toBe("KHONG_TIM_THAY");
  expect(JSON.stringify(await getLichNgay({ ngay: "2026-10-07" }))).not.toContain("9005");
  expect(await maCan()).toEqual(expect.arrayContaining(["1509", "3402"])); // căn khác không đổi
  // US27-NT1: thêm lại mã 9005 được, là căn mới
  const lai = await postCan({ ma_can: "9005", so_phong_ngu: 2 }, khoa());
  expect(lai.id).not.toBe(a.id);
  expect(await maCan()).toContain("9005");
  // Căn đã ẩn xóa lại, không có khóa cũ: KHONG_TIM_THAY (NT8: không có đường nào hiện lại)
  expect(await maLoi(deleteCan(a.id, khoa()))).toBe("KHONG_TIM_THAY");
});

test("test_YC3_9_buoc_3_US27_ghi_dat_phong_hay_gia_vao_can_da_an_bi_tu_choi", async () => {
  const a = await themCan("9006");
  themBk(a.id, "2026-10-01", "2026-10-03");
  await deleteCan(a.id, khoa());
  expect(await maLoi(ghi(a.id, "2026-10-20", "2026-10-21"))).toBe("KHONG_TIM_THAY");
  expect(await maLoi(putGiaThang(a.id, { thang: ["2026-10"], gia_ngay_thuong: 1, gia_cuoi_tuan: 1 }, khoa()))).toBe("KHONG_TIM_THAY");
});

test("test_YC3_9_NT7_US27_sale_khong_nhan_can_da_an_nhung_dat_phong_cu_cua_sale_van_mo_duoc", async () => {
  const a = await themCan("9007");
  const hung = (await getSaleKetNoi()).find((k) => k.ten === "Sale Hùng")!;
  themBk(a.id, "2026-10-01", "2026-10-03", "hieu_luc", { sale_id: hung.sale_id, gia_ban: 2_400_000 });
  const bkId = (await getLichNgay({ ngay: "2026-10-01" })).can.find((c) => c.ma_can === "9007")!.dat_phong!.id;
  await dung(HUNG);
  expect((await getSaleLich({ tu: "2026-10-07" })).can.map((c) => c.ma_can)).toContain("9007");
  await dung(HOA);
  await deleteCan(a.id, khoa());
  await dung(HUNG);
  expect((await getSaleLich({ tu: "2026-10-07" })).can.map((c) => c.ma_can)).not.toContain("9007");
  expect(await maLoi(getSaleCan(a.id))).toBe("KHONG_TIM_THAY");
  expect(JSON.stringify(await getSaleTim({ ngay_nhan: "2026-10-20", ngay_tra: "2026-10-21" }))).not.toContain("9007");
  expect(await maLoi(postYeuCau({ can_id: a.id, ngay_nhan: "2026-10-20", ngay_tra: "2026-10-21", loi_nhan: null }, khoa()))).toBe("KHONG_TIM_THAY");
  // Đặt phòng cũ vẫn mở được, dòng giá bán giữ nguyên
  expect(await getBookingSale(bkId)).toMatchObject({ ma_can: "9007", tien_phong: 2_000_000, gia_ban: 2_400_000 });
});

test("test_PQ3_CHU_PQ3_SALE_US27_chu_nha_khac_va_sale_xoa_can_cua_chi_hoa_bi_KHONG_TIM_THAY_can_khong_bi_an", async () => {
  const a = await themCan("9008");
  for (const nguoi of [TUAN, HUNG, LAN]) {
    await dung(nguoi);
    expect(await maLoi(deleteCan(a.id, khoa()))).toBe("KHONG_TIM_THAY");
  }
  await dung(HOA);
  expect(await maCan()).toContain("9008");
});

test("test_US27_gui_lai_cung_khoa_tra_ket_qua_cu_khoa_ngan_la_DU_LIEU_SAI", async () => {
  const a = await themCan("9009");
  const k = khoa();
  const r1 = await deleteCan(a.id, k);
  expect(await deleteCan(a.id, k)).toEqual(r1);
  expect(await maLoi(deleteCan(a.id, "ngan"))).toBe("DU_LIEU_SAI");
});
