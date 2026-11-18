import { beforeEach, expect, test } from "vitest";
import { chuCacThuCuoiTuan, chuCacThuNgayThuong, CHIP_LOAI_VIEW, dongThongTin } from "../components/can-hien-thi";
import { docSoGiuong } from "../components/khoi-mo-rong";
import { BoAnhForm } from "../stores/anh-form";
import {
  banThu,
  getBooking,
  getCan,
  getCanChiTiet,
  getKiemTrung,
  getGiaCan,
  getToaNha,
  getToi,
  patchCan,
  patchToi,
  postAnh,
  postBooking,
  postCan,
  postPhien,
  postToaNha,
} from "./api";
import { LoiApi, LoiMang, type TepAnh } from "./kieu";

// US11 · Server giả của sửa căn, tòa nhà dùng chung, ngày tính giá cuối tuần (api/can-anh.md, api/phien-ho-so.md).
// Dữ liệu DLM: hôm nay 07/10/2026, máy là Chị Hoa (1509: 2PN, 3 giường, view biển, ICON40, 12 ảnh).
const maLoi = (p: Promise<unknown>) =>
  p.then(
    () => null,
    (e) => (e instanceof LoiApi ? `${e.loi}:${e.o ?? ""}` : e instanceof LoiMang ? "MAT_MANG" : String(e)),
  );
let lan = 0;
const khoa = () => `khoa-us11-${++lan}-xxxxxxxxxxxxxxxx`;
const tep = (n: number): TepAnh => ({ ten: `anh-${n}.jpg`, duong_dan: `file://anh-${n}.jpg`, dung_luong: 1_000_000 });
const dung = async (zaloId: string, ten?: string) => {
  banThu.dungZaloId(zaloId, ten);
  return postPhien();
};
const the = async (ma: string) => (await getCan()).find((c) => c.ma_can === ma)!;

beforeEach(() => {
  banThu.xoaSach();
  banThu.datDoTre(0);
  banThu.datMatMang(false);
  banThu.napDuLieuMau(false, true);
});

// ---- US11-NT1, mục "Tòa nhà, loại view, số giường, mô tả" (US11) ----

test("test_YC3_1_NT5_the_can_1509_ghi_2PN_3_giuong_view_bien_ICON40", async () => {
  expect(dongThongTin(await the("1509"))).toBe("2PN · 3 giường · view biển · ICON40");
  expect(dongThongTin(await the("1509"))).not.toMatch(/khách|người lớn|trẻ em/);
});

test("test_YC3_2_2_NT1_khong_mo_phan_them_van_them_can_chi_can_ma_va_phong_ngu", async () => {
  const c = await postCan({ ma_can: "2105", so_phong_ngu: 2 });
  expect(c).toMatchObject({ ma_can: "2105", so_phong_ngu: 2, so_giuong: null, loai_view: null, toa_nha: null });
  expect(dongThongTin(c)).toBe("2PN");
});

test("test_YC3_2_2_NT2_go_Green_thay_toa_co_chu_Green_va_dong_them_toa_moi", async () => {
  await postToaNha({ ten: "Green Hạ Long Test" }, khoa());
  await postToaNha({ ten: "Mường Thanh" }, khoa());
  const kq = await getToaNha({ q: "Green" });
  expect(kq.map((t) => t.ten)).toEqual(["Green Hạ Long Test"]);
  // Không phân biệt hoa thường, dấu tiếng Việt
  expect((await getToaNha({ q: "ha long" })).map((t) => t.ten)).toEqual(["Green Hạ Long Test"]);
  expect((await getToaNha({ q: "LA CARTE" })).map((t) => t.ten)).toEqual(["À La Carte"]);
});

test("test_YC3_2_2_NT3_loai_view_dung_ba_chip_Bien_Thanh_pho_Nui_khong_Vinh", async () => {
  expect(CHIP_LOAI_VIEW.map((v) => v.chu)).toEqual(["Biển", "Thành phố", "Núi"]);
  await expect(maLoi(postCan({ ma_can: "2106", so_phong_ngu: 1, loai_view: "vinh" }))).resolves.toBe("DU_LIEU_SAI:loai_view");
  const c = await postCan({ ma_can: "2106", so_phong_ngu: 1, loai_view: "nui" });
  expect(dongThongTin(c)).toBe("1PN · view núi");
});

test("test_YC3_2_2_NT4_nhap_so_giuong_roi_them_can_thi_the_ghi_2PN_2_giuong", async () => {
  const c = await postCan({ ma_can: "2107", so_phong_ngu: 2, so_giuong: 2 });
  expect(dongThongTin(await the("2107"))).toBe("2PN · 2 giường");
  expect(c.so_giuong).toBe(2);
  await expect(maLoi(postCan({ ma_can: "2110", so_phong_ngu: 2, so_giuong: 0 }))).resolves.toBe("DU_LIEU_SAI:so_giuong");
});

test("test_YC3_2_2_NT5_bo_trong_so_giuong_van_them_duoc_va_the_chi_ghi_2PN", async () => {
  expect(docSoGiuong("")).toEqual({ gia_tri: null });
  expect(docSoGiuong("  ")).toEqual({ gia_tri: null });
  expect(docSoGiuong("3")).toEqual({ gia_tri: 3 });
  expect(docSoGiuong("0").loi).toBeTruthy();
  expect(docSoGiuong("51").loi).toBeTruthy();
  await postCan({ ma_can: "2108", so_phong_ngu: 2, so_giuong: null });
  expect(dongThongTin(await the("2108"))).toBe("2PN");
});

test("test_YC3_2_2_NT6_nguoi_dung_khac_them_toa_moi_thi_nguoi_khac_thay_trong_danh_sach", async () => {
  banThu.napDuLieuSale("hung");
  const moi = await postToaNha({ ten: "Green Hạ Long Test" }, khoa());
  expect(moi).toMatchObject({ ten: "Green Hạ Long Test" });
  expect(moi).not.toHaveProperty("da_co");
  await dung("zalo-anh-tuan");
  const kq = await getToaNha({ q: "Green Hạ" });
  expect(kq.map((t) => t.ten)).toEqual(["Green Hạ Long Test"]);
  // Tòa gắn vào căn đang thêm
  const c = await postCan({ ma_can: "3001", so_phong_ngu: 1, toa_nha_id: kq[0].id });
  expect(c.toa_nha).toBe("Green Hạ Long Test");
});

// Đổi theo quyết định của Tùng 04/11/2026 (US11, điểm 4): trước đây POST /toa-nha trùng tên trả tòa đã có (da_co true), không tạo dòng mới
test("test_YC3_2_2_toa_dat_san_hien_khi_chua_go_chu_nao_va_toa_trung_ten_van_tao_toa_moi", async () => {
  expect((await getToaNha()).map((t) => t.ten)).toEqual(["ICON40", "À La Carte", "Sapphire"]);
  const lai = await postToaNha({ ten: "  icon40 " }, khoa());
  expect(lai).toMatchObject({ ten: "icon40" });
  expect(lai.id).not.toBe("ICON40");
  // Gõ "icon" thấy cả tòa có sẵn lẫn tòa vừa tạo, để màn tìm tòa gợi ý tòa có sẵn
  expect((await getToaNha({ q: "icon" })).map((t) => t.ten).sort()).toEqual(["ICON40", "icon40"]);
  // Trùng đúng từng chữ cũng tạo tòa mới, id khác nhau
  const lai2 = await postToaNha({ ten: "ICON40" }, khoa());
  expect(lai2.id).not.toBe("ICON40");
  expect(lai2.id).not.toBe(lai.id);
});

test("test_YC3_2_2_post_toa_nha_khong_sua_duoc_toa_co_san_hay_dat_tao_boi", async () => {
  await expect(maLoi(postToaNha({ ten: "X", id: "ICON40" } as never, khoa()))).resolves.toBe("DU_LIEU_SAI:id");
  await expect(maLoi(postToaNha({ ten: "X", tao_boi: null } as never, khoa()))).resolves.toBe("DU_LIEU_SAI:tao_boi");
  await expect(maLoi(postToaNha({ ten: "   " }, khoa()))).resolves.toBe("DU_LIEU_SAI:ten");
});

// ---- mục "Sửa thông tin căn" (US11) ----

test("test_YC3_3_NT1_mo_sua_can_1509_cac_o_dung_gia_tri_hien_co", async () => {
  const c = await getCanChiTiet((await the("1509")).id);
  expect(c).toMatchObject({ ma_can: "1509", so_phong_ngu: 2, so_giuong: 3, loai_view: "view biển", toa_nha: { ten: "ICON40" } });
  expect(c.anh).toHaveLength(12);
  expect((await the("1509")).so_anh).toBe(12);
  expect(c.anh.map((a) => a.thu_tu)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
});

test("test_YC3_3_NT2_doi_thu_tu_anh_va_luu_thi_anh_so_1_thanh_anh_dai_dien", async () => {
  const id = (await the("1509")).id;
  const truoc = await getCanChiTiet(id);
  const ids = truoc.anh.map((a) => a.id);
  const moi = [ids[2], ...ids.slice(0, 2), ...ids.slice(3)];
  const sau = await patchCan(id, { anh_ids: moi }, khoa());
  expect(sau.anh[0].id).toBe(ids[2]);
  expect((await the("1509")).anh_dai_dien!.id).toBe(ids[2]);
  expect((await the("1509")).anh_dai_dien!.id).not.toBe(ids[0]);
  expect((await getCanChiTiet(id)).anh.map((a) => a.id)).toEqual(moi);
});

test("test_YC3_3_NT2_store_anh_doi_vi_tri_dua_anh_len_truoc_va_ra_sau", async () => {
  const bo = new BoAnhForm();
  bo.nap([1, 2, 3].map((n) => ({ id: `a${n}`, thu_tu: n, duong_dan_xem: `x${n}`, het_han_luc: "" })));
  bo.doiViTri(bo.lay()[2].khoa, -1);
  bo.doiViTri(bo.lay()[1].khoa, -1);
  expect(bo.anhIds()).toEqual(["a3", "a1", "a2"]);
  bo.doiViTri(bo.lay()[0].khoa, -1); // đã ở đầu thì giữ nguyên
  expect(bo.anhIds()).toEqual(["a3", "a1", "a2"]);
  bo.doiViTri(bo.lay()[2].khoa, 1); // đã ở cuối thì giữ nguyên
  expect(bo.anhIds()).toEqual(["a3", "a1", "a2"]);
});

test("test_YC3_3_xoa_mot_anh_va_luu_thi_so_anh_bot_1_va_them_anh_tam_thi_gan_vao_can", async () => {
  const id = (await the("1509")).id;
  const ids = (await getCanChiTiet(id)).anh.map((a) => a.id);
  await patchCan(id, { anh_ids: ids.slice(0, -1) }, khoa());
  expect((await the("1509")).so_anh).toBe(11);
  const tam = await postAnh(tep(1), khoa());
  const sau = await patchCan(id, { anh_ids: [...ids.slice(0, -1), tam.anh_id] }, khoa());
  expect(sau.anh).toHaveLength(12);
  expect(sau.anh[11].id).toBe(tam.anh_id);
  // 13 ảnh bị từ chối
  const tam2 = await postAnh(tep(2), khoa());
  await expect(maLoi(patchCan(id, { anh_ids: [...sau.anh.map((a) => a.id), tam2.anh_id] }, khoa()))).resolves.toBe("DU_LIEU_SAI:anh_ids");
});

test("test_YC3_3_NT3_doi_ma_can_thanh_ma_cua_can_khac_thi_loi_trung_ma_va_khong_luu", async () => {
  const id = (await the("1509")).id;
  await expect(maLoi(patchCan(id, { ma_can: "3402", so_giuong: 5 }, khoa()))).resolves.toBe("MA_CAN_TRUNG:ma_can");
  const c = await getCanChiTiet(id);
  expect(c).toMatchObject({ ma_can: "1509", so_giuong: 3 }); // không lưu gì cả
  expect((await getCan()).map((x) => x.ma_can).sort()).toEqual(["1509", "3402"]);
  // Giữ nguyên mã của chính căn này thì không tính trùng
  await expect(maLoi(patchCan(id, { ma_can: "1509" }, khoa()))).resolves.toBeNull();
});

test("test_YC3_3_NT4_sua_so_giuong_thi_the_ghi_so_moi_xoa_trong_thi_the_chi_ghi_2PN", async () => {
  const id = (await the("1509")).id;
  await patchCan(id, { so_giuong: 4 }, khoa());
  expect(dongThongTin(await the("1509"))).toBe("2PN · 4 giường · view biển · ICON40");
  await patchCan(id, { so_giuong: null }, khoa());
  expect(dongThongTin(await the("1509"))).toBe("2PN · view biển · ICON40");
  expect(dongThongTin(await the("1509"))).not.toContain("giường");
  await patchCan(id, { so_giuong: 3 }, khoa());
  expect(dongThongTin(await the("1509"))).toContain("2PN · 3 giường");
});

test("test_YC3_3_sua_toa_view_mo_ta_va_bam_hai_lan_cung_khoa_chi_luu_mot_lan", async () => {
  const id = (await the("1509")).id;
  const k = khoa();
  const a = await patchCan(id, { loai_view: "thanh_pho", toa_nha_id: "Sapphire", mo_ta_gui_khach: "Gần bãi tắm" }, k);
  const b = await patchCan(id, { loai_view: "nui" }, k); // cùng khóa: trả kết quả lần đầu
  expect(b).toEqual(a);
  expect(await getCanChiTiet(id)).toMatchObject({ loai_view: "thanh_pho", toa_nha: { ten: "Sapphire" }, mo_ta_gui_khach: "Gần bãi tắm" });
  await expect(maLoi(patchCan(id, { toa_nha_id: "khong-co" }, khoa()))).resolves.toBe("DU_LIEU_SAI:toa_nha_id");
  await expect(maLoi(patchCan(id, { loai: "tu_nhap" } as never, khoa()))).resolves.toBe("DU_LIEU_SAI:loai");
});

test("test_YC3_3_mat_mang_khi_luu_thi_bao_loi_mang_va_can_khong_doi", async () => {
  const id = (await the("1509")).id;
  banThu.datMatMang(true);
  await expect(maLoi(patchCan(id, { so_giuong: 4 }, khoa()))).resolves.toBe("MAT_MANG");
  banThu.datMatMang(false);
  expect((await the("1509")).so_giuong).toBe(3);
});

// ---- Quyền (PQ3.CHU, PQ3.SALE, PQ6.CHU) ----

test("test_PQ3_CHU_chu_nha_khac_va_sale_khong_doc_hay_sua_duoc_can_cua_Chi_Hoa", async () => {
  const id1509 = (await the("1509")).id;
  banThu.napDuLieuSale("hung");
  await dung("zalo-sale-hung");
  await expect(maLoi(patchCan(id1509, { so_giuong: 9 }, khoa()))).resolves.toBe("KHONG_TIM_THAY:");
  await expect(maLoi(getCanChiTiet(id1509))).resolves.toBe("KHONG_TIM_THAY:");
  await dung("zalo-anh-tuan");
  await expect(maLoi(patchCan(id1509, { ma_can: "9999" }, khoa()))).resolves.toBe("KHONG_TIM_THAY:");
  // Anh Tuấn gắn ảnh tạm của mình vào căn của Chị Hoa: không được
  const tam = await postAnh(tep(1), khoa());
  await expect(maLoi(patchCan(id1509, { anh_ids: [tam.anh_id] }, khoa()))).resolves.toBe("KHONG_TIM_THAY:");
  await dung("zalo-chi-hoa");
  expect(await getCanChiTiet(id1509)).toMatchObject({ ma_can: "1509", so_giuong: 3 });
  expect((await getCanChiTiet(id1509)).anh).toHaveLength(12);
});

test("test_PQ3_CHU_chu_nha_A_gan_anh_tam_cua_B_vao_can_cua_minh_bi_tu_choi", async () => {
  banThu.napDuLieuSale("hung");
  await dung("zalo-anh-tuan");
  const tamB = await postAnh(tep(1), khoa());
  await dung("zalo-chi-hoa");
  const id = (await the("1509")).id;
  const truoc = (await getCanChiTiet(id)).anh.map((a) => a.id);
  await expect(maLoi(patchCan(id, { anh_ids: [...truoc.slice(0, 11), tamB.anh_id] }, khoa()))).resolves.toBe("DU_LIEU_SAI:anh_ids");
  expect((await getCanChiTiet(id)).anh.map((a) => a.id)).toEqual(truoc);
});

test("test_PQ3_khong_co_phien_thi_CHUA_DANG_NHAP", async () => {
  banThu.xoaSach();
  await expect(maLoi(getCanChiTiet("can-1"))).resolves.toBe("CHUA_DANG_NHAP:");
  await expect(maLoi(getToaNha())).resolves.toBe("CHUA_DANG_NHAP:");
  await expect(maLoi(patchToi({ dem_cuoi_tuan: [5, 6] }, khoa()))).resolves.toBe("CHUA_DANG_NHAP:");
});

// ---- mục "Ngày tính giá cuối tuần" (US11) ----

test("test_YC3_8_NT1_luu_T6_T7_thi_o_gia_ghi_Cuoi_tuan_T6_T7_va_Ngay_thuong_CN_T5", async () => {
  expect((await getToi()).dem_cuoi_tuan).toEqual([5, 6]);
  const h = await patchToi({ dem_cuoi_tuan: [6, 5] }, khoa());
  expect(h.dem_cuoi_tuan).toEqual([5, 6]);
  const bang = await getGiaCan((await the("3402")).id, { nam: 2026 });
  expect(bang.dem_cuoi_tuan).toEqual([5, 6]);
  expect(chuCacThuCuoiTuan(bang.dem_cuoi_tuan)).toBe("T6, T7");
  expect(chuCacThuNgayThuong(bang.dem_cuoi_tuan)).toBe("CN–T5");
});

test("test_YC3_8_NT2_doi_sang_T7_CN_thi_ten_o_gia_gia_lich_gia_va_tien_dien_san_doi_theo", async () => {
  const id = (await the("1509")).id;
  await patchToi({ dem_cuoi_tuan: [6, 7] }, khoa());
  const bang = await getGiaCan(id, { nam: 2026, thang: "2026-10" });
  expect(chuCacThuCuoiTuan(bang.dem_cuoi_tuan)).toBe("T7, CN");
  expect(chuCacThuNgayThuong(bang.dem_cuoi_tuan)).toBe("T2–T6");
  const d = (ngay: string) => bang.dem!.find((x) => x.ngay === ngay)!;
  expect(d("2026-10-16")).toMatchObject({ gia: 900000, loai_dem: "thuong" }); // T6
  expect(d("2026-10-17")).toMatchObject({ gia: 1300000, loai_dem: "cuoi_tuan" }); // T7
  expect(d("2026-10-18")).toMatchObject({ gia: 1300000, loai_dem: "cuoi_tuan" }); // CN
  // Tiền điền sẵn đặt phòng nhận 16/10 trả 18/10: 900.000 + 1.300.000
  const kt = await getKiemTrung({ can_id: id, ngay_nhan: "2026-10-16", ngay_tra: "2026-10-18" });
  expect(kt.tong_gia_chu).toBe(2200000);
});

test("test_YC3_8_NT3_nhan_T6_tra_CN_voi_T6_T7_la_hai_dem_cuoi_tuan_2600000", async () => {
  const bang = await getGiaCan((await the("1509")).id, { nam: 2026, thang: "2026-10" });
  const gia = ["2026-10-16", "2026-10-17"].map((n) => bang.dem!.find((x) => x.ngay === n)!);
  expect(gia.map((x) => x.loai_dem)).toEqual(["cuoi_tuan", "cuoi_tuan"]);
  expect(gia.reduce((t, x) => t + (x.gia ?? 0), 0)).toBe(2600000);
});

test("test_YC3_8_dat_phong_da_co_giu_tien_khi_doi_dem_cuoi_tuan_va_PQ6_CHU_chi_doi_cua_minh", async () => {
  const id = (await the("1509")).id;
  // Đặt phòng đã có giữ tiền: nhận 16/10 trả 18/10 lúc đang T6, T7 là 2.600.000
  const dp = await postBooking(
    { can_id: id, ngay_nhan: "2026-10-16", ngay_tra: "2026-10-18", ten_khach: null, tien_phong: 2600000, trang_thai_tien: "chua_coc", tien_coc: null, so_khach: null, gio_nhan: null, gio_tra: null, ghi_chu: null },
    khoa(),
  );
  await patchToi({ dem_cuoi_tuan: [6, 7] }, khoa());
  const sau = await getBooking(dp.id);
  expect(sau.tien_phong).toBe(2600000);
  expect(sau.dem.map((x) => x.gia_chu)).toEqual([1300000, 1300000]);
  await patchToi({ dem_cuoi_tuan: [5, 6] }, khoa());
  banThu.napDuLieuSale("hung");
  await dung("zalo-anh-tuan");
  await patchToi({ dem_cuoi_tuan: [6, 7] }, khoa());
  expect((await getToi()).dem_cuoi_tuan).toEqual([6, 7]);
  await dung("zalo-chi-hoa");
  expect((await getToi()).dem_cuoi_tuan).toEqual([5, 6]); // Chị Hoa không đổi
  const bang = await getGiaCan(id, { nam: 2026, thang: "2026-10" });
  expect(bang.dem_cuoi_tuan).toEqual([5, 6]);
  await expect(maLoi(patchToi({ dem_cuoi_tuan: [] }, khoa()))).resolves.toBe("DU_LIEU_SAI:dem_cuoi_tuan");
  await expect(maLoi(patchToi({ dem_cuoi_tuan: [5, 5] }, khoa()))).resolves.toBe("DU_LIEU_SAI:dem_cuoi_tuan");
  await expect(maLoi(patchToi({ dem_cuoi_tuan: [8] }, khoa()))).resolves.toBe("DU_LIEU_SAI:dem_cuoi_tuan");
});

test("test_YC3_8_mat_mang_khi_luu_dem_cuoi_tuan_thi_bao_loi_va_khong_doi", async () => {
  banThu.datMatMang(true);
  await expect(maLoi(patchToi({ dem_cuoi_tuan: [6, 7] }, khoa()))).resolves.toBe("MAT_MANG");
  banThu.datMatMang(false);
  expect((await getToi()).dem_cuoi_tuan).toEqual([5, 6]);
});
