import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, expect, test } from "vitest";
import {
  banThu,
  deleteBooking,
  getBooking,
  getBookingSale,
  getBookingSapToi,
  getKiemTrung,
  getLichNgay,
  getLichThang,
  getLichTomTat,
  getThongBaoChuSua,
  patchBooking,
  postBooking,
  postBookingHoanTacThuDu,
  postBookingThuDu,
  postPhien,
  getSaleKetNoi,
  getCan,
} from "../services/api";
import { LoiApi, LoiMang, type DatPhong, type DatPhongSale } from "../services/kieu";
import { CHU_CHUA_LUU, chuHoiXoa, loiKhiGhi, NoiDungCN3, tieuDeCN3 } from "./cn3-man";
import { dongKiemTrung, NoiDungCN4 } from "./cn4-dat-phong";
import { formTuDatPhong, loiKhiSua, thanSua } from "./cn4-sua-man";
import { chuLucSua, NoiDungS310 } from "./s3-man";

// US3 · Test màn chi tiết (CN3-02), sửa (CN4-02), S3-10 trên server giả với dữ liệu DLM.4, DLM.6.
// Mỗi test lấy số từ server giả rồi vẽ phần giao diện và đọc chữ ra. Server thật đã có test riêng (src/server/api/us10.test.js).
const khong = () => {};
const html = (el: React.ReactElement) => renderToStaticMarkup(el);
const chu = (s: string) => s.replace(/<[^>]+>/g, "|").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
const van = (s: string) => chu(s).replace(/\|+/g, " ").replace(/\s+/g, " ");
const nut = (s: string) => [...s.matchAll(/<button[^>]*>(.*?)<\/button>/g)].map((m) => chu(m[1]).replace(/\|/g, ""));

const dung = async (zaloId: string) => {
  banThu.dungZaloId(zaloId);
  return postPhien();
};
const HOA = "zalo-chi-hoa";

const idDat = async (maCan: string, nhan: string) => {
  const kq = await getBookingSapToi();
  return kq.muc.find((m) => m.ma_can === maCan && m.ngay_nhan === nhan)!.id;
};
const B1 = () => idDat("1509", "2026-10-10");
const B5 = () => idDat("1509", "2026-10-13");

const cn3 = (dp: DatPhong, them: Partial<React.ComponentProps<typeof NoiDungCN3>> = {}) =>
  html(
    <NoiDungCN3
      dp={dp}
      dangLam={null}
      hoiXoa={false}
      loi={null}
      onThuDu={khong}
      onHoanTac={khong}
      onSua={khong}
      onXoa={khong}
      onXacNhanXoa={khong}
      onHuyXoa={khong}
      onGoi={khong}
      {...them}
    />,
  );

const cn402 = (dp: DatPhong, kt = null as Awaited<ReturnType<typeof getKiemTrung>> | null, them: Partial<React.ComponentProps<typeof NoiDungCN4>> = {}) =>
  html(
    <NoiDungCN4
      can={[{ can_id: dp.can_id, ma_can: dp.ma_can }]}
      sale={[]}
      khachLe={[]}
      form={formTuDatPhong(dp)}
      kiemTra={kt}
      daSuaTien={false}
      dangLuu={false}
      loiChung={null}
      onDoi={khong}
      onLuu={khong}
      onChuaLam={khong}
      sua={{ laSale: dp.nguoi_dat.loai === "sale", tenNguoiDat: dp.nguoi_dat.ten }}
      {...them}
    />,
  );

beforeEach(async () => {
  banThu.xoaSach();
  banThu.datDoTre(0);
  banThu.datMatMang(false);
  banThu.napDuLieuSale("hung");
  await dung(HOA);
});

test("test_YC4_2_NT1_US3_KB1_KB3_chi_tiet_B1_tien_con_lai_1_200_000", async () => {
  const dp = await getBooking(await B1());
  expect(dp.tien_con_lai).toBe(1200000);
  const s = cn3(dp);
  const v = van(s);
  expect(van(tieuDeCN3(dp))).toBe("Đặt phòng · Sale Hùng");
  expect(v).toContain("Phòng 1509");
  expect(v).toContain("Đã cọc · còn thu");
  expect(v).toContain("10/10 → 12/10 (2 đêm)");
  expect(v).toContain("Nhận 14:00 thứ 7 · trả 12:00 thứ 2");
  expect(v).toContain("Sale Hùng 0912 345 678");
  expect(v).toContain("Tiền phòng 2.200.000đ");
  expect(v).toContain("Đã cọc 1.000.000đ");
  expect(v).toContain("Còn lại 1.200.000đ");
  expect(v).toContain("Khách do Sale Hùng bán. Tên và số điện thoại khách chỉ sale giữ; cần gì về khách thì gọi sale.");
  expect(nut(s)).toEqual(["Gọi sale", "Đã thu đủ 1.200.000đ", "Sửa đặt phòng"]);
});

test("test_YC4_2_NT2_US3_KB4_thu_du_nhan_Da_thanh_toan_nut_Hoan_tac", async () => {
  const id = await B1();
  const dp = await postBookingThuDu(id, "khoa-thu-du-0001");
  expect(dp.trang_thai_tien).toBe("da_thanh_toan");
  const s = cn3(dp);
  expect(van(s)).toContain("Đã thanh toán");
  expect(van(s)).toContain("Còn lại 0đ");
  expect(nut(s)).toContain("Hoàn tác: chưa thu đủ");
  expect(nut(s).join()).not.toContain("Đã thu đủ 1");
  // Dòng B1 ở "Đặt phòng sắp tới" ghi đã thanh toán
  const sapToi = await getBookingSapToi();
  expect(sapToi.muc.find((m) => m.id === id)!.trang_thai_tien).toBe("da_thanh_toan");
});

test("test_YC4_2_NT3_US3_KB5_hoan_tac_ve_Da_coc_con_thu", async () => {
  const id = await B1();
  await postBookingThuDu(id, "khoa-thu-du-0002");
  const dp = await postBookingHoanTacThuDu(id, "khoa-hoan-tac-0002");
  expect(dp.trang_thai_tien).toBe("da_coc_con_thu");
  const v = van(cn3(dp));
  expect(v).toContain("Đã cọc · còn thu");
  expect(v).toContain("Đã cọc 1.000.000đ");
  expect(v).toContain("Còn lại 1.200.000đ");
  expect(nut(cn3(dp))).toContain("Đã thu đủ 1.200.000đ");
});

test("test_YC4_2_NT3_US3_KB6_thu_du_hoan_tac_dat_phong_chua_coc_ve_Chua_coc", async () => {
  const id = await B5();
  const truoc = await getBooking(id);
  expect(van(cn3(truoc))).toContain("Còn lại 1.800.000đ");
  expect(van(tieuDeCN3(truoc))).toBe("Đặt phòng · Khách lẻ");
  await postBookingThuDu(id, "khoa-thu-du-0003");
  const dp = await postBookingHoanTacThuDu(id, "khoa-hoan-tac-0003");
  expect(dp.trang_thai_tien).toBe("chua_coc");
  expect(van(cn3(dp))).toContain("Chưa cọc");
  expect(van(cn3(dp))).not.toContain("Đã cọc");
});

test("test_HV1_NT1_US3_KB25_bam_thu_du_hai_lan_cung_khoa_chi_ghi_mot_lan_hoan_tac_ve_dung", async () => {
  const id = await B1();
  const [a, b] = await Promise.all([postBookingThuDu(id, "khoa-thu-du-0004"), postBookingThuDu(id, "khoa-thu-du-0004")]);
  expect(a.trang_thai_tien).toBe("da_thanh_toan");
  expect(b.trang_thai_tien).toBe("da_thanh_toan");
  const dp = await postBookingHoanTacThuDu(id, "khoa-hoan-tac-0004");
  expect(dp.trang_thai_tien).toBe("da_coc_con_thu");
  expect(dp.tien_con_lai).toBe(1200000);
  // Giao diện: đang lưu thì nút khóa
  const s = cn3(dp, { dangLam: "thu_du" });
  expect(s).toMatch(/disabled=""[^>]*>Đang lưu…/);
});

test("test_HV2_NT1_US3_KB7_mat_mang_khi_thu_du_bao_chua_luu_nhan_van_cu", async () => {
  const id = await B1();
  banThu.datMatMang(true);
  let loi: unknown;
  await postBookingThuDu(id, "khoa-thu-du-0005").catch((e) => (loi = e));
  expect(loi).toBeInstanceOf(LoiMang);
  expect(loiKhiGhi(loi)).toBe("Chưa lưu được, bấm lại khi có mạng");
  expect(CHU_CHUA_LUU).toBe(loiKhiGhi(loi));
  banThu.datMatMang(false);
  const dp = await getBooking(id);
  expect(dp.trang_thai_tien).toBe("da_coc_con_thu");
  const v = van(cn3(dp, { loi: loiKhiGhi(loi) }));
  expect(v).toContain("Chưa lưu được, bấm lại khi có mạng");
  expect(v).toContain("Đã cọc · còn thu");
});

test("test_YC4_3_NT1_US3_KB8_mo_sua_dien_san_dung_gia_tri", async () => {
  const dp = await getBooking(await B1());
  const f = formTuDatPhong(dp);
  expect(f).toMatchObject({ ngayNhan: "2026-10-10", chipDem: 2, tienPhong: "2200000", trangThaiTien: "da_coc_con_thu", tienCoc: "1000000" });
  const s = cn402(dp, null);
  const v = van(s);
  expect(s).toMatch(/hh-chip--r1509 hh-chip--on/);
  expect(s).toMatch(/hh-chip--on"[^>]*>2 đêm</);
  expect(s).toContain('name="ngay_nhan" value="2026-10-10"');
  expect(s).toContain('value="2.200.000"');
  expect(s).toContain('value="1.000.000"');
  expect(s).toMatch(/hh-chip--on"[^>]*>Đã cọc · còn thu</);
  expect(v).toContain("Sale Hùng");
  expect(v).toContain("14:00 → 12:00");
  expect(nut(s)).toContain("Lưu thay đổi");
  // Chủ nhà không thấy giá bán và khách của sale (US3-KB27)
  expect(v).not.toContain("2.600.000");
  expect(v.toLowerCase()).not.toContain("giá bán");
  expect(van(cn3(dp)).toLowerCase()).not.toContain("giá bán");
  expect(cn3(dp)).not.toContain("2.600.000");
});

test("test_YC4_3_NT2_US3_KB9_QT1_2_VD2_sua_sang_dem_co_khach_bi_chan", async () => {
  const dp = await getBooking(await B1());
  // Đổi ngày trả thành 14/10: trùng đêm 13/10 của Khách lẻ
  const kt = await getKiemTrung({ can_id: dp.can_id, ngay_nhan: "2026-10-10", ngay_tra: "2026-10-14", bo_qua_id: dp.id });
  expect(kt.khong_trung).toBe(false);
  expect(kt.dem_trung).toEqual(["2026-10-13"]);
  expect(dongKiemTrung("2026-10-10", "2026-10-14", kt).chu).toContain("Trùng lịch: 13/10 đã có khách");
  const f = { ...formTuDatPhong(dp), chipDem: "tuy_chon" as const, traTuyChon: "2026-10-14" };
  const than = thanSua(dp, f);
  expect(than).toMatchObject({ ngay_tra: "2026-10-14" });
  let loi: unknown;
  await patchBooking(dp.id, than, "khoa-sua-0001").catch((e) => (loi = e));
  expect(loi).toBeInstanceOf(LoiApi);
  expect((loi as LoiApi).loi).toBe("TRUNG_LICH");
  expect(loiKhiSua(loi)).toBe("Trùng lịch: 13/10 đã có khách. Chọn ngày khác.");
  // B1 vẫn 10/10 → 12/10, ô 12/10 của 1509 không tô
  const sau = await getBooking(dp.id);
  expect([sau.ngay_nhan, sau.ngay_tra]).toEqual(["2026-10-10", "2026-10-12"]);
  const ngay12 = await getLichNgay({ ngay: "2026-10-12" });
  expect(ngay12.can.find((c) => c.ma_can === "1509")!.trong).toBe(true);
});

test("test_YC4_3_NT3_US3_KB10_QT1_2_VD1_sua_tien_giu_ngay_khong_bao_trung_voi_chinh_no", async () => {
  const dp = await getBooking(await B5());
  const kt = await getKiemTrung({ can_id: dp.can_id, ngay_nhan: dp.ngay_nhan, ngay_tra: dp.ngay_tra, bo_qua_id: dp.id });
  expect(kt.khong_trung).toBe(true);
  expect(dongKiemTrung(dp.ngay_nhan, dp.ngay_tra, kt).chu).toBe("✓ 13/10 → 15/10 (2 đêm) · không trùng lịch");
  // Không bỏ qua chính nó thì báo trùng: kiểm trùng thật sự bỏ qua theo bo_qua_id
  const khongBoQua = await getKiemTrung({ can_id: dp.can_id, ngay_nhan: dp.ngay_nhan, ngay_tra: dp.ngay_tra });
  expect(khongBoQua.khong_trung).toBe(false);
  const f = { ...formTuDatPhong(dp), tienPhong: "1700000" };
  const than = thanSua(dp, f);
  expect(than).toEqual({ cap_nhat_luc: dp.cap_nhat_luc, tien_phong: 1700000 });
  const moi = await patchBooking(dp.id, than, "khoa-sua-0002");
  expect(moi).toMatchObject({ tien_phong: 1700000, tien_con_lai: 1700000 });
  expect(van(cn3(moi))).toContain("Tiền phòng 1.700.000đ Còn lại 1.700.000đ");
  // Tổng các đêm bằng tiền phòng; doanh thu 11.800.000đ - 100.000đ, vẫn 13 đêm (QT4.2, QD14)
  expect(moi.dem.reduce((t, d) => t + d.gia_chu, 0)).toBe(1700000);
  expect(await getLichTomTat({ thang: "2026-10" })).toMatchObject({ doanh_thu: 11700000, so_dem_co_khach: 13 });
});

test("test_QT1_1_VD2_US3_KB11_sua_sat_ngay_tra_cua_dat_phong_khac_khong_trung", async () => {
  const dp = await getBooking(await B5());
  const kt = await getKiemTrung({ can_id: dp.can_id, ngay_nhan: "2026-10-12", ngay_tra: "2026-10-15", bo_qua_id: dp.id });
  expect(kt.khong_trung).toBe(true);
  expect(dongKiemTrung("2026-10-12", "2026-10-15", kt).chu).toContain("không trùng lịch");
});

test("test_YC4_3_NT5_DLM_6_US3_KB12_sua_B1_sang_11_10_den_13_10_gia_1_800_000", async () => {
  const dp = await getBooking(await B1());
  const f = { ...formTuDatPhong(dp), ngayNhan: "2026-10-11", tienPhong: "1800000" };
  const than = thanSua(dp, f);
  expect(than).toEqual({ cap_nhat_luc: dp.cap_nhat_luc, ngay_nhan: "2026-10-11", ngay_tra: "2026-10-13", tien_phong: 1800000 });
  expect("gia_ban" in than).toBe(false);
  const moi = await patchBooking(dp.id, than, "khoa-sua-0003");
  expect(moi.dem).toEqual([
    { ngay: "2026-10-11", gia_chu: 900000 },
    { ngay: "2026-10-12", gia_chu: 900000 },
  ]);
  const v = van(cn3(moi));
  expect(v).toContain("11/10 → 13/10 (2 đêm)");
  expect(v).toContain("Tiền phòng 1.800.000đ");
  expect(v).toContain("Đã cọc 1.000.000đ");
  expect(v).toContain("Còn lại 800.000đ");
  // Lịch: 1509 kín 11/10, 12/10; 10/10 không còn
  const lich = await getLichThang({ thang: "2026-10" });
  const c1509 = lich.can.find((c) => c.ma_can === "1509")!.can_id;
  const kin = (n: string) => lich.ngay.find((x) => x.ngay === n)?.can_ids.includes(c1509) ?? false;
  expect([kin("2026-10-10"), kin("2026-10-11"), kin("2026-10-12")]).toEqual([false, true, true]);
  expect(await getLichTomTat({ thang: "2026-10" })).toMatchObject({ doanh_thu: 11400000, so_dem_co_khach: 13 });
});

test("test_YC4_3_NT4_NT5_US3_KB13_KB14_sale_Hung_thay_ngay_cu_moi_gia_ban_giu_2_600_000", async () => {
  const dp = await getBooking(await B1());
  await patchBooking(dp.id, thanSua(dp, { ...formTuDatPhong(dp), ngayNhan: "2026-10-11", tienPhong: "1800000" }), "khoa-sua-0004");
  await dung("zalo-sale-hung");
  const tb = await getThongBaoChuSua(dp.id);
  expect(tb).not.toBeNull();
  expect(tb!.du_lieu).toMatchObject({
    ten_chu_nha: "Chị Hoa",
    ngay_nhan_cu: "2026-10-10",
    ngay_tra_cu: "2026-10-12",
    ngay_nhan: "2026-10-11",
    ngay_tra: "2026-10-13",
    tien_phong_cu: 2200000,
    tien_phong: 1800000,
  });
  const bk = await getBookingSale(dp.id);
  expect(bk).toMatchObject({ gia_ban: 2600000, tien_phong: 1800000, tien_chenh: 800000 });
  const s = html(<NoiDungS310 bk={bk} tb={tb} hom="2026-10-07" onGoi={khong} onVe={khong} />);
  const v = van(s);
  expect(v).toContain("ICON40 1509 · 2PN");
  expect(v).toContain("Chị Hoa · 11/10 → 13/10 (2 đêm)");
  expect(v).toContain("Giá bán cho khách 2.600.000đ");
  expect(v).toContain("Giá chủ nhà 1.800.000đ");
  expect(v).toContain("Chị Hoa đã sửa đặt phòng này lúc");
  expect(s).toContain("<s>10/10 → 12/10</s>");
  expect(s).toContain("<s>2.200.000đ</s>");
  expect(v).toContain("Ngày: 10/10 → 12/10 → 11/10 → 13/10 (2 đêm)");
  expect(v).toContain("Giá chủ nhà: 2.200.000đ → 1.800.000đ");
  expect(v).toContain("Giá bán cho khách của bạn giữ nguyên");
  expect(v).not.toContain("tính lại");
  expect(nut(s)).toEqual(["Gọi Chị Hoa", "Về lịch phòng"]);
  // Giờ Việt Nam: 03:15 UTC là 10:15 hôm nay (DLM.6)
  expect(chuLucSua("2026-10-07T03:15:00Z", "2026-10-07")).toBe("10:15 hôm nay");
  expect(chuLucSua("2026-10-05T03:15:00Z", "2026-10-07")).toBe("10:15 ngày 05/10");
});

test("test_PQ8_SALE_PQ9_QD11_US3_KB2_sale_khong_thay_tien_coc_trang_thai_tien_khach", async () => {
  await dung("zalo-sale-hung");
  const bk = (await getBookingSale(await idHungB1())) as DatPhongSale & Record<string, unknown>;
  for (const khoa of ["tien_coc", "trang_thai_tien", "dem", "nguoi_dat", "ghi_chu", "so_khach"]) expect(khoa in bk).toBe(false);
  expect(bk.khach).toBeNull();
  expect(bk.gia_ban).toBe(2600000);
});
const idHungB1 = async () => {
  await dung(HOA);
  const id = await B1();
  await dung("zalo-sale-hung");
  return id;
};

test("test_PQ11_CHU_PQ7_US3_chu_nha_khong_co_gia_ban_patch_gia_ban_bi_tu_choi_nguoi_khac_khong_tim_thay", async () => {
  const id = await B1();
  const dp = (await getBooking(id)) as DatPhong & Record<string, unknown>;
  expect("gia_ban" in dp).toBe(false);
  expect("tien_chenh" in dp).toBe(false);
  expect(dp.khach).toBeNull(); // không khách của sale (QD11)
  let loi: unknown;
  await patchBooking(id, { cap_nhat_luc: dp.cap_nhat_luc, gia_ban: 1 } as never, "khoa-sua-0005").catch((e) => (loi = e));
  expect((loi as LoiApi).loi).toBe("DU_LIEU_SAI");
  // Chủ nhà khác: KHONG_TIM_THAY cho xem, sửa, xóa, thu đủ
  await dung("zalo-anh-tuan");
  for (const lam of [
    () => getBooking(id),
    () => patchBooking(id, { cap_nhat_luc: dp.cap_nhat_luc, tien_phong: 1 }, "k-tuan-0001"),
    () => deleteBooking(id, "k-tuan-0002"),
    () => postBookingThuDu(id, "k-tuan-0003"),
    () => postBookingHoanTacThuDu(id, "k-tuan-0004"),
  ]) {
    await expect(lam()).rejects.toMatchObject({ loi: "KHONG_TIM_THAY" });
  }
  // Sale chỉ xem: sửa, xóa, thu đủ đều KHONG_TIM_THAY (PQ7.SALE); sale khác không mở được (Sale Lan)
  await dung("zalo-sale-hung");
  await expect(patchBooking(id, { cap_nhat_luc: dp.cap_nhat_luc, tien_phong: 1 }, "k-hung-0001")).rejects.toMatchObject({ loi: "KHONG_TIM_THAY" });
  await expect(deleteBooking(id, "k-hung-0002")).rejects.toMatchObject({ loi: "KHONG_TIM_THAY" });
  await expect(postBookingThuDu(id, "k-hung-0003")).rejects.toMatchObject({ loi: "KHONG_TIM_THAY" });
  await expect(getBooking(id)).rejects.toMatchObject({ loi: "KHONG_TIM_THAY" });
  await dung("zalo-sale-lan");
  await expect(getBookingSale(id)).rejects.toMatchObject({ loi: "KHONG_TIM_THAY" });
});

test("test_YC4_3_US3_sua_cap_nhat_luc_cu_bi_TRANG_THAI_DA_DOI", async () => {
  const dp = await getBooking(await B5());
  await patchBooking(dp.id, { cap_nhat_luc: dp.cap_nhat_luc, tien_phong: 1700000 }, "khoa-sua-0006");
  await expect(patchBooking(dp.id, { cap_nhat_luc: dp.cap_nhat_luc, tien_phong: 1600000 }, "khoa-sua-0007")).rejects.toMatchObject({
    loi: "TRANG_THAI_DA_DOI",
  });
  expect(loiKhiSua(new LoiApi("TRANG_THAI_DA_DOI"))).toContain("đã đổi ở máy khác");
});

test("test_HV2_NT1_US3_KB15_mat_mang_khi_luu_sua_form_giu_nguyen_B5_khong_doi", async () => {
  const dp = await getBooking(await B5());
  banThu.datMatMang(true);
  let loi: unknown;
  await patchBooking(dp.id, thanSua(dp, { ...formTuDatPhong(dp), tienPhong: "1700000" }), "khoa-sua-0008").catch((e) => (loi = e));
  expect(loi).toBeInstanceOf(LoiMang);
  expect(loiKhiSua(loi)).toBe("Chưa lưu được, bấm lại khi có mạng");
  banThu.datMatMang(false);
  expect((await getBooking(dp.id)).tien_phong).toBe(1800000);
  // Form vẫn ghi 1.700.000 và hiện lỗi
  const s = cn402(dp, null, { form: { ...formTuDatPhong(dp), tienPhong: "1700000" }, loiChung: loiKhiSua(loi) });
  expect(s).toContain('value="1.700.000"');
  expect(van(s)).toContain("Chưa lưu được, bấm lại khi có mạng");
});

test("test_YC4_1_2_NT4_US3_CN4_01_xoa_trong_tien_phong_nut_luu_khong_dung_duoc", async () => {
  const dp = await getBooking(await B5());
  const s = cn402(dp, null, { form: { ...formTuDatPhong(dp), tienPhong: "" }, daSuaTien: true });
  expect(van(s)).toContain("Nhập tiền phòng trước khi lưu");
  expect(s).toMatch(/hh-btn--block"[^>]*disabled=""[^>]*>Lưu thay đổi/);
});

test("test_YC4_1_2_NT6_US3_KB24_sua_tien_luc_ghi_2_000_000_chia_1_000_000_thang_10_va_11", async () => {
  const [c1509] = (await getCan()).filter((c) => c.ma_can === "1509");
  const kt = await getKiemTrung({ can_id: c1509.id, ngay_nhan: "2026-10-31", ngay_tra: "2026-11-02" });
  expect(kt.tong_gia_chu).toBe(2200000); // NT5, QT4.1-VD1
  expect(kt.dem).toEqual([
    { ngay: "2026-10-31", gia_chu: 1300000 },
    { ngay: "2026-11-01", gia_chu: 900000 },
  ]);
  const dp = await postBooking(
    {
      can_id: c1509.id, ngay_nhan: "2026-10-31", ngay_tra: "2026-11-02", ten_khach: null, tien_phong: 2200000,
      trang_thai_tien: "chua_coc", tien_coc: null, so_khach: null, gio_nhan: null, gio_tra: null, ghi_chu: null,
    },
    "khoa-ghi-0001",
  );
  const moi = await patchBooking(dp.id, thanSua(dp, { ...formTuDatPhong(dp), tienPhong: "2000000" }), "khoa-sua-0009");
  expect(moi.tien_phong).toBe(2000000);
  expect(van(cn3(moi))).toContain("Tiền phòng 2.000.000đ Còn lại 2.000.000đ");
  expect(await getLichTomTat({ thang: "2026-10" })).toMatchObject({ doanh_thu: 12800000, so_dem_co_khach: 14 });
  expect(await getLichTomTat({ thang: "2026-11" })).toMatchObject({ doanh_thu: 1000000 + 800000 });
});

test("test_YC4_4_NT1_US3_KB17_xoa_lan_dau_chi_hoi_lai_chua_xoa", async () => {
  const dp = await getBooking(await B5());
  expect(dp.co_the_xoa).toBe(true);
  expect(nut(cn3(dp))).toContain("Xóa đặt phòng");
  expect(cn3(dp)).not.toContain("alertdialog");
  const hoi = cn3(dp, { hoiXoa: true });
  expect(van(hoi)).toContain("Xác nhận xóa đặt phòng? Ngày 13/10 → 15/10 của 1509 trống lại.");
  expect(chuHoiXoa(dp)).toBe("Xác nhận xóa đặt phòng? Ngày 13/10 → 15/10 của 1509 trống lại.");
  expect(nut(hoi).slice(-2)).toEqual(["Xóa đặt phòng", "Hủy"]);
  // Bấm lần đầu không gọi server: B5 vẫn còn, 13/10, 14/10 vẫn tô
  expect((await getBooking(dp.id)).id).toBe(dp.id);
  const ngay13 = await getLichNgay({ ngay: "2026-10-13" });
  expect(ngay13.can.find((c) => c.ma_can === "1509")!.trong).toBe(false);
});

test("test_YC4_4_NT2_US3_KB18_KB19_xac_nhan_xoa_dem_trong_lai_doanh_thu_bot", async () => {
  const dp = await getBooking(await B5());
  expect(await deleteBooking(dp.id, "khoa-xoa-0001")).toEqual({ id: dp.id, da_xoa: true });
  for (const n of ["2026-10-13", "2026-10-14"]) {
    expect((await getLichNgay({ ngay: n })).can.find((c) => c.ma_can === "1509")!.trong).toBe(true);
  }
  expect((await getBookingSapToi()).muc.some((m) => m.id === dp.id)).toBe(false);
  expect(await getLichTomTat({ thang: "2026-10" })).toMatchObject({ doanh_thu: 10000000, so_dem_co_khach: 11 });
  await expect(getBooking(dp.id)).rejects.toMatchObject({ loi: "KHONG_TIM_THAY" });
  // Đêm đã xóa ghi lại được (KB19): không trùng, điền sẵn 1.800.000đ
  const kt = await getKiemTrung({ can_id: dp.can_id, ngay_nhan: "2026-10-13", ngay_tra: "2026-10-15" });
  expect(dongKiemTrung("2026-10-13", "2026-10-15", kt).chu).toBe("✓ 13/10 → 15/10 (2 đêm) · không trùng lịch");
  expect(kt.tong_gia_chu).toBe(1800000);
});

test("test_HV2_NT1_US3_KB23_mat_mang_khi_xac_nhan_xoa_B5_van_con", async () => {
  const dp = await getBooking(await B5());
  banThu.datMatMang(true);
  await expect(deleteBooking(dp.id, "khoa-xoa-0002")).rejects.toBeInstanceOf(LoiMang);
  banThu.datMatMang(false);
  expect((await getBooking(dp.id)).id).toBe(dp.id);
  expect((await getLichNgay({ ngay: "2026-10-13" })).can.find((c) => c.ma_can === "1509")!.trong).toBe(false);
});

test("test_YC4_4_NT4_NT5_US3_KB20_B1_khong_co_nut_xoa_van_sua_duoc_lenh_xoa_bi_tu_choi", async () => {
  const id = await B1();
  const dp = await getBooking(id);
  expect(dp.co_the_xoa).toBe(false);
  expect(dp.co_the_sua).toBe(true);
  const s = cn3(dp);
  expect(nut(s)).not.toContain("Xóa đặt phòng");
  expect(s).not.toContain("alertdialog");
  expect(nut(s)).toContain("Sửa đặt phòng");
  expect(van(cn402(dp))).toContain("Sale Hùng");
  await expect(deleteBooking(id, "khoa-xoa-0003")).rejects.toMatchObject({ loi: "KHONG_DUOC_PHEP" });
  expect(loiKhiGhi(new LoiApi("KHONG_DUOC_PHEP"))).toBe("Đặt phòng của sale không xóa được, chỉ sửa được");
  // B1 còn, đêm 10/10 và 11/10 của 1509 vẫn kín
  for (const n of ["2026-10-10", "2026-10-11"]) {
    expect((await getLichNgay({ ngay: n })).can.find((c) => c.ma_can === "1509")!.trong).toBe(false);
  }
});

test("test_YC4_4_NT6_US3_KB21_dat_phong_chu_ghi_cho_sale_khong_co_nut_xoa_van_sua_duoc", async () => {
  const sale = (await getSaleKetNoi()).find((s) => s.ten === "Sale Hùng")!;
  const can = (await getCan()).find((c) => c.ma_can === "1509")!;
  const dp = await postBooking(
    {
      can_id: can.id, sale_id: sale.sale_id, ngay_nhan: "2026-10-22", ngay_tra: "2026-10-23", ten_khach: null, tien_phong: 900000,
      trang_thai_tien: "chua_coc", tien_coc: null, so_khach: null, gio_nhan: null, gio_tra: null, ghi_chu: null,
    },
    "khoa-ghi-0002",
  );
  const ct = await getBooking(dp.id);
  expect(ct.co_the_xoa).toBe(false);
  expect(ct.co_the_sua).toBe(true);
  expect(nut(cn3(ct))).not.toContain("Xóa đặt phòng");
  expect(nut(cn3(ct))).toContain("Sửa đặt phòng");
  await expect(deleteBooking(dp.id, "khoa-xoa-0004")).rejects.toMatchObject({ loi: "KHONG_DUOC_PHEP" });
  // Sale được báo khi chủ sửa, giá bán giữ nguyên theo mức cộng lúc ghi (900.000đ + 200k = 1.100.000đ)
  await patchBooking(dp.id, { cap_nhat_luc: ct.cap_nhat_luc, tien_phong: 800000 }, "khoa-sua-0010");
  await dung("zalo-sale-hung");
  const bk = await getBookingSale(dp.id);
  expect(bk).toMatchObject({ gia_ban: 1100000, tien_phong: 800000 });
  expect((await getThongBaoChuSua(dp.id))!.du_lieu).toMatchObject({ tien_phong_cu: 900000, tien_phong: 800000 });
});

test("test_PQ7_CHU_PQ9_CHU_US3_KB27_chu_nha_khac_khong_thay_dat_phong_cua_Chi_Hoa", async () => {
  await dung("zalo-anh-tuan");
  const sapToi = await getBookingSapToi();
  expect(sapToi.muc.every((m) => ["1103", "2208"].includes(m.ma_can))).toBe(true);
  const ngay = await getLichNgay({ ngay: "2026-10-10" });
  expect(ngay.can.map((c) => c.ma_can).sort()).toEqual(["1103", "2208"]);
});
