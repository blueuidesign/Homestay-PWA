import { beforeEach, expect, test } from "vitest";
import { banThu, getCan, postCan, postPhien, postTaiKhoan } from "./api";
import { LoiApi } from "./kieu";

const DONG_Y = "2026-11-03T02:00:00.000Z";

const chuNhaMoi = async (zaloId = "zalo-may-nay") => {
  banThu.dungZaloId(zaloId);
  await postPhien();
  return postTaiKhoan({ vai_chon: "chu_nha", dong_y_dieu_khoan_luc: DONG_Y });
};

const maLoi = (p: Promise<unknown>) => p.then(() => null, (e) => (e instanceof LoiApi ? e.loi : String(e)));

beforeEach(() => {
  banThu.xoaSach();
  banThu.datDoTre(0);
});

test("test_YC1_1_NT1_phien_nguoi_moi_khong_co_tai_khoan", async () => {
  // Người dùng mới bấm "Bắt đầu ngay": POST /phien trả tai_khoan null, app sang A3 không hỏi gì
  expect(await postPhien()).toEqual({ tai_khoan: null });
});

test("test_YC1_2_NT1_chon_chu_nha_tao_tai_khoan", async () => {
  const tk = await chuNhaMoi();
  expect(tk.vai_chon).toBe("chu_nha");
  expect(tk.dong_y_dieu_khoan_luc).toBe(DONG_Y);
  // Gọi lại thì trả tài khoản cũ, không tạo lần hai (server.md 2.1)
  const lai = await postTaiKhoan({ vai_chon: "sale", dong_y_dieu_khoan_luc: DONG_Y });
  expect(lai).toEqual(tk);
  // Mở app lần sau: POST /phien trả tài khoản đã có
  expect((await postPhien()).tai_khoan).toEqual(tk);
});

test("test_YC1_4_NT1_chu_nha_moi_chua_co_can", async () => {
  await chuNhaMoi();
  expect(await getCan()).toEqual([]);
});

test("test_YC3_1_NT1_bon_can", async () => {
  await chuNhaMoi();
  for (const ma of ["1509", "3402", "Greenbay", "2208"]) await postCan({ ma_can: ma, so_phong_ngu: 2 });
  expect(await getCan()).toHaveLength(4);
});

test("test_YC3_2_NT2_chi_ma_can_va_so_phong_ngu_van_them_duoc", async () => {
  await chuNhaMoi();
  const can = await postCan({ ma_can: " 2105 ", so_phong_ngu: 0 });
  expect(can).toMatchObject({ ma_can: "2105", so_phong_ngu: 0, so_anh: 0, so_giuong: null, toa_nha: null });
});

test("test_YC3_2_NT1_server_tu_choi_khi_thieu", async () => {
  await chuNhaMoi();
  await expect(postCan({ ma_can: "  ", so_phong_ngu: 2 })).rejects.toMatchObject({ loi: "DU_LIEU_SAI", o: "ma_can" });
  await expect(postCan({ ma_can: "2105", so_phong_ngu: null })).rejects.toMatchObject({
    loi: "DU_LIEU_SAI",
    o: "so_phong_ngu",
  });
  expect(await getCan()).toEqual([]);
});

test("test_YC3_2_NT3_ma_can_trung", async () => {
  await chuNhaMoi();
  await postCan({ ma_can: "1509", so_phong_ngu: 2 });
  await expect(postCan({ ma_can: "1509", so_phong_ngu: 1 })).rejects.toMatchObject({
    loi: "MA_CAN_TRUNG",
    ly_do: "Đã có căn 1509",
  });
  expect(await getCan()).toHaveLength(1);
});

test("test_YC3_2_NT6_chu_nha_khac_trung_ma_van_them_duoc", async () => {
  await chuNhaMoi("zalo-chu-a");
  await postCan({ ma_can: "1509", so_phong_ngu: 2 });
  await chuNhaMoi("zalo-chu-b");
  expect((await postCan({ ma_can: "1509", so_phong_ngu: 2 })).ma_can).toBe("1509");
});

test("test_YC3_2_NT4_can_moi_trong_danh_sach_co_nhan_moi_them", async () => {
  banThu.napDuLieuMau();
  const can = await postCan({ ma_can: "2105", so_phong_ngu: 2 });
  const ds = await getCan();
  expect(ds[0]).toMatchObject({ id: can.id, ma_can: "2105", moi_them: true });
  // Căn mẫu tạo từ tháng 9 không còn "Mới thêm" [GIẢ ĐỊNH: GD14]
  expect(ds.slice(1).every((c) => !c.moi_them)).toBe(true);
});

// Quyền (US1 mục Quyền, PQ3.CHU): chưa đăng nhập không tạo được căn; chủ nhà A không đọc được căn của B
test("test_US1_PQ3_CHU_chua_dang_nhap_khong_tao_duoc_can", async () => {
  expect(await maLoi(postCan({ ma_can: "1509", so_phong_ngu: 2 }))).toBe("CHUA_DANG_NHAP");
  expect(await maLoi(getCan())).toBe("CHUA_DANG_NHAP");
  // Có phiên tạm nhưng chưa chọn vai (chưa có tài khoản) cũng không được
  await postPhien();
  expect(await maLoi(postCan({ ma_can: "1509", so_phong_ngu: 2 }))).toBe("CHUA_DANG_NHAP");
});

test("test_US1_PQ3_CHU_chu_nha_khong_thay_can_cua_nguoi_khac", async () => {
  await chuNhaMoi("zalo-chu-a");
  await postCan({ ma_can: "1509", so_phong_ngu: 2 });
  await chuNhaMoi("zalo-chu-b");
  expect(await getCan()).toEqual([]);
});

test("test_DC21_ban_thu_nap_du_lieu_mau_va_xoa_sach", async () => {
  banThu.napDuLieuMau();
  expect((await getCan()).map((c) => c.ma_can).sort()).toEqual(["1509", "3402"]);
  banThu.xoaSach();
  expect(await maLoi(getCan())).toBe("CHUA_DANG_NHAP");
  expect(await postPhien()).toEqual({ tai_khoan: null });
});
