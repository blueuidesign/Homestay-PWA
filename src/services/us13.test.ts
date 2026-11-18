import { beforeEach, expect, test } from "vitest";
import { banThu, getSaleCan, getSaleTim, getToi, patchToi, postPhien, putSaleCanMucCong, postKetNoiNgung, getKetNoi } from "./api";
import { LoiApi } from "./kieu";

// US13 · Test server giả của chi tiết căn, mức cộng, mức cộng mặc định (mục "Chi tiết căn và giá bán" (US13), mục "Mức cộng giá mặc định" (US13)). Dữ liệu DLM: hôm nay 07/10/2026,
// kịch bản 24/10 → 26/10 (đêm T7, CN): 1509 giá chủ 1.300.000 + 900.000 = 2.200.000đ.
const maLoi = (p: Promise<unknown>) => p.then(() => null, (e) => (e instanceof LoiApi ? e.loi : String(e)));
let n = 0;
const khoa = () => `khoa-us13-${++n}-xxxxxxxxxxxxxxxx`;
const dung = async (zaloId: string) => {
  banThu.dungZaloId(zaloId);
  return postPhien();
};
const NGAY = { ngay_nhan: "2026-10-24", ngay_tra: "2026-10-26" };

const idCan = async (ma: string) => (await getSaleTim(NGAY)).can.find((c) => c.ma_can === ma)!.id;

beforeEach(async () => {
  banThu.xoaSach();
  banThu.datDoTre(0);
  banThu.datMatMang(false);
  banThu.napDuLieuSale("moi");
  await dung("zalo-sale-hung");
});

test("test_YC5_4_NT2_US13_KB1_Hung_mo_1509_thay_gia_chu_2_200_000_va_gia_ban_2_600_000_voi_muc_cong_rieng_200k", async () => {
  const c = await getSaleCan(await idCan("1509"), NGAY);
  expect(c.tong_gia_chu).toBe(2200000);
  expect(c.tong_gia_ban).toBe(2600000);
  expect(c.muc_cong).toEqual({ so_tien: 200000, rieng: true });
  expect(c.dem?.map((d) => [d.ngay, d.gia_chu, d.gia_ban])).toEqual([
    ["2026-10-24", 1300000, 1500000],
    ["2026-10-25", 900000, 1100000],
  ]);
  expect(c.chu_nha).toMatchObject({ ten_hien_thi: "Chị Hoa", so_can_chia_se: 2 });
  expect(c.chu_nha.so_dien_thoai).toBeTruthy();
});

test("test_YC5_4_NT5_US13_KB1_KB7_1509_2PN_3_giuong_3402_chua_co_so_giuong_khong_co_so_khach", async () => {
  const a = await getSaleCan(await idCan("1509"), NGAY);
  expect([a.so_phong_ngu, a.so_giuong]).toEqual([2, 3]);
  const b = await getSaleCan(await idCan("3402"), NGAY);
  expect([b.so_phong_ngu, b.so_giuong]).toEqual([1, null]);
  // Mức mặc định +400k áp cho căn chưa có mức riêng
  expect(b.muc_cong).toEqual({ so_tien: 400000, rieng: false });
  expect(Object.keys(a).filter((k) => /^(so_khach|.*nguoi_lon.*|.*tre_em.*|tien_ich.*)$/.test(k))).toEqual([]);
});

test("test_YC5_4_NT6_US13_KB1_co_gio_nhan_tra_va_khong_co_tien_ich", async () => {
  const c = await getSaleCan(await idCan("1509"), NGAY);
  expect([c.gio_nhan, c.gio_tra]).toEqual(["14:00", "12:00"]);
  expect(JSON.stringify(c)).not.toMatch(/tien_ich|may_giat|\bbep\b/i);
});

test("test_YC5_4_NT1_US13_KB2_chon_300k_roi_500k_roi_200k_thi_gia_ban_theo_so_dem", async () => {
  const id = await idCan("1509");
  const tong = async (so: number) => (await putSaleCanMucCong(id, { so_tien: so, ...NGAY }, khoa())).tong_gia_ban;
  expect(await tong(400000)).toBe(3000000);
  expect(await tong(200000)).toBe(2600000);
  const kq = await putSaleCanMucCong(id, { so_tien: 200000, ...NGAY }, khoa());
  expect(kq.tong_gia_chu).toBe(2200000); // giá chủ nhà không đổi
});

test("test_YC5_4_NT1_US13_KB3_khong_cong_thi_gia_ban_bang_gia_chu", async () => {
  const id = await idCan("1509");
  expect((await putSaleCanMucCong(id, { so_tien: 0, ...NGAY }, khoa())).tong_gia_ban).toBe(2200000);
  expect((await putSaleCanMucCong(id, { so_tien: 200000, ...NGAY }, khoa())).tong_gia_ban).toBe(2600000);
});

test("test_YC5_4_NT1_US13_KB5_muc_cong_rieng_duoc_luu_mo_lai_van_con_2_800_000", async () => {
  const id = await idCan("1509");
  await putSaleCanMucCong(id, { so_tien: 300000, ...NGAY }, khoa());
  const c = await getSaleCan(id, NGAY);
  expect(c.muc_cong).toEqual({ so_tien: 300000, rieng: true });
  expect(c.tong_gia_ban).toBe(2800000);
});

test("test_YC5_4_NT1_US13_KB6_Sapphire_1103_va_ALaCarte_2208_theo_DLM", async () => {
  const s = await getSaleCan(await idCan("1103"), NGAY);
  expect([s.so_phong_ngu, s.so_giuong, s.tong_gia_chu, s.muc_cong.so_tien, s.tong_gia_ban, s.chu_nha.ten_hien_thi]).toEqual([3, 2, 1400000, 100000, 1600000, "Anh Tuấn"]);
  const a = await getSaleCan(await idCan("2208"), NGAY);
  expect([a.so_phong_ngu, a.so_giuong, a.tong_gia_chu, a.muc_cong.so_tien, a.tong_gia_ban]).toEqual([1, 1, 3000000, 300000, 3600000]);
});

test("test_YC5_4_NT1_US13_KB23_muc_tuy_chon_250k_thi_gia_ban_2_700_000", async () => {
  const id = await idCan("1509");
  const kq = await putSaleCanMucCong(id, { so_tien: 250000, ...NGAY }, khoa());
  expect([kq.tong_gia_chu, kq.tong_gia_ban]).toEqual([2200000, 2700000]);
  expect(await maLoi(putSaleCanMucCong(id, { so_tien: 10_000_001 }, khoa()))).toBe("DU_LIEU_SAI");
  expect(await maLoi(putSaleCanMucCong(id, { so_tien: 1.5 }, khoa()))).toBe("DU_LIEU_SAI");
  expect(await maLoi(putSaleCanMucCong(id, { so_tien: -1 }, khoa()))).toBe("DU_LIEU_SAI");
});

test("test_YC5_4_US13_lich_2_tuan_khong_ten_nguoi_dat", async () => {
  const c = await getSaleCan(await idCan("1509"), { ngay_nhan: "2026-10-07", ngay_tra: "2026-10-21" });
  const kin = c.dem!.filter((d) => d.trang_thai === "kin").map((d) => d.ngay.slice(8));
  expect(kin).toEqual(["10", "11", "13", "14", "19"]);
  expect(JSON.stringify(c)).not.toMatch(/Khách lẻ|Sale Minh|ten_sale|ten_khach/);
});

test("test_PQ11_SALE_US13_KB13_Lan_dat_muc_cong_khong_doi_gia_ban_cua_Hung_va_sale_id_trong_than_bi_bo_qua", async () => {
  const id = await idCan("1509");
  const truoc = (await getSaleCan(id, NGAY)).tong_gia_ban;
  await dung("zalo-sale-lan");
  const lan0 = await getSaleCan(id, NGAY);
  expect([lan0.muc_cong.so_tien, lan0.tong_gia_ban]).toEqual([0, 2200000]);
  await putSaleCanMucCong(id, { so_tien: 500000, sale_id: "tk-cua-hung", ...NGAY } as never, khoa());
  await dung("zalo-sale-hung");
  expect((await getSaleCan(id, NGAY)).tong_gia_ban).toBe(truoc);
  await dung("zalo-sale-lan");
  expect((await getSaleCan(id, NGAY)).tong_gia_ban).toBe(3200000);
});

// EN53: không còn công tắc giá (QD20 r2 điểm 3). Thay test cũ "chủ nhà tắt giá thì không có khóa giá kể cả sau khi đặt mức cộng".
test("test_PQ5_SALE_PQ11_SALE_US13_KB14_EN53_luon_co_khoa_gia_ke_ca_sau_khi_dat_muc_cong", async () => {
  const id = await idCan("1103");
  const c = await getSaleCan(id, NGAY);
  const kq = await putSaleCanMucCong(id, { so_tien: 200000, ...NGAY }, khoa());
  for (const o of [c, kq]) {
    expect(typeof o.tong_gia_chu).toBe("number");
    expect(typeof o.tong_gia_ban).toBe("number");
    expect(JSON.stringify(o)).not.toContain("quyen_gia_tung_dem");
  }
  expect(c.dem).toHaveLength(2);
  expect(typeof c.dem![0].gia_chu).toBe("number");
  // Mức cộng 200.000đ mỗi đêm × 2 đêm
  expect(kq.tong_gia_ban! - kq.tong_gia_chu!).toBe(400000);
});

test("test_PQ4_SALE_US13_KB15_chu_nha_ngung_thi_KHONG_CON_QUYEN_kem_ly_do_va_nguoi_chua_ket_noi_KHONG_TIM_THAY", async () => {
  const id = await idCan("1509");
  // Lan chỉ kết nối Chị Hoa: căn Anh Tuấn không tìm thấy
  const sapphire = await idCan("1103");
  await dung("zalo-sale-lan");
  expect(await maLoi(getSaleCan(sapphire))).toBe("KHONG_TIM_THAY");
  expect(await maLoi(putSaleCanMucCong(sapphire, { so_tien: 100000 }, khoa()))).toBe("KHONG_TIM_THAY");
  // Chị Hoa ngừng Hùng
  banThu.dungZaloId("zalo-chi-hoa");
  await postPhien();
  const hung = (await getKetNoi()).da_ket_noi.find((k) => k.ten_hien_thi === "Sale Hùng")!;
  await postKetNoiNgung(hung.id, khoa());
  await dung("zalo-sale-hung");
  const loi = await getSaleCan(id, NGAY).catch((e) => e);
  expect(loi).toBeInstanceOf(LoiApi);
  expect([loi.loi, loi.ly_do]).toEqual(["KHONG_CON_QUYEN", "Chủ nhà đã ngừng chia sẻ lịch"]);
  expect(await maLoi(putSaleCanMucCong(id, { so_tien: 100000 }, khoa()))).toBe("KHONG_CON_QUYEN");
});

test("test_PQ11_CHU_US13_chu_nha_goi_API_sale_nhan_KHONG_TIM_THAY_va_ho_so_khong_co_truong_muc_cong", async () => {
  const id = await idCan("1509");
  banThu.dungZaloId("zalo-chi-hoa");
  await postPhien();
  expect(await maLoi(getSaleCan(id, NGAY))).toBe("KHONG_TIM_THAY");
  expect(await maLoi(putSaleCanMucCong(id, { so_tien: 100000 }, khoa()))).toBe("KHONG_TIM_THAY");
  const h = await getToi();
  expect(h).not.toHaveProperty("muc_cong_mac_dinh");
  expect(h).not.toHaveProperty("lam_tron_50k");
  expect(await maLoi(patchToi({ muc_cong_mac_dinh: 100000 }, khoa()))).toBe("DU_LIEU_SAI");
});

test("test_YC5_6_NT1_US13_KB20_luu_muc_mac_dinh_300k_ap_cho_can_chua_co_muc_rieng_can_da_sua_rieng_giu_nguyen", async () => {
  expect((await getToi()).muc_cong_mac_dinh).toBe(400000);
  const h = await patchToi({ muc_cong_mac_dinh: 300000, lam_tron_50k: false }, khoa());
  expect([h.muc_cong_mac_dinh, h.lam_tron_50k]).toEqual([300000, false]);
  expect((await getSaleCan(await idCan("3402"), NGAY)).muc_cong.so_tien).toBe(300000);
  expect((await getSaleCan(await idCan("1509"), NGAY)).muc_cong.so_tien).toBe(200000);
});

test("test_YC5_6_NT3_US13_KB19_lam_tron_len_50k_tung_dem_roi_cong_cac_dem", async () => {
  const id = await idCan("3402");
  await patchToi({ muc_cong_mac_dinh: 230000 }, khoa());
  const khong = await getSaleCan(id, NGAY);
  expect(khong.tong_gia_ban).toBe(khong.tong_gia_chu! + 460000);
  await patchToi({ lam_tron_50k: true }, khoa());
  const co = await getSaleCan(id, NGAY);
  expect(co.lam_tron_50k).toBe(true);
  for (const d of co.dem!) expect(d.gia_ban! % 50000).toBe(0);
  expect(await maLoi(patchToi({ muc_cong_mac_dinh: 99_999_999 }, khoa()))).toBe("DU_LIEU_SAI");
  expect(await maLoi(patchToi({}, khoa()))).toBe("DU_LIEU_SAI");
});
