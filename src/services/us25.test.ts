import { beforeEach, expect, test } from "vitest";
import { banThu, getCan, postAnh, postCan } from "./api";
import { chonAnh, datCongAnh } from "./chon-anh";
import type { TepAnh } from "./kieu";
import { BoAnhForm, demTheo } from "../stores/anh-form";

// US25 · ảnh khi thêm căn trên server giả: store ảnh của form, POST /anh, POST /can với anh_ids. Máy là Chị Hoa (DLM).
const tep = (n: number, them: Partial<TepAnh> = {}): TepAnh => ({ ten: `anh-${n}.jpg`, duong_dan: `file://anh-${n}.jpg`, dung_luong: 1_000_000, ...them });
const nhieuTep = (n: number) => Array.from({ length: n }, (_, i) => tep(i + 1));

beforeEach(() => {
  banThu.xoaSach();
  banThu.datDoTre(0);
  banThu.datMatMang(false);
  banThu.napDuLieuMau();
  datCongAnh(null);
});

test("test_YC3_2_1_NT1_con_anh_dang_tai_thi_chua_them_can", async () => {
  const bo = new BoAnhForm();
  const { xong } = bo.themTep(nhieuTep(5));
  // Ngay sau khi chọn, cả 5 ảnh đang tải: màn khóa nút "Thêm căn" và ghi "Đang tải 5 ảnh"
  expect(bo.lay()).toHaveLength(5);
  expect(demTheo(bo.lay(), "dang_tai")).toBe(5);
  expect(bo.anhIds()).toEqual([]);
  await xong;
  expect(demTheo(bo.lay(), "dang_tai")).toBe(0);
  expect(bo.anhIds()).toHaveLength(5);
});

test("test_YC3_2_1_NT2_anh_loi_co_thu_lai_va_xoa", async () => {
  const bo = new BoAnhForm();
  banThu.datMatMang(true);
  await bo.themTep(nhieuTep(3)).xong;
  expect(demTheo(bo.lay(), "loi")).toBe(3);
  expect(bo.anhIds()).toEqual([]);
  // Bỏ một ảnh lỗi, thử lại hai ảnh khi có mạng: còn 2 ảnh, hết lỗi
  bo.xoa(bo.lay()[0].khoa);
  banThu.datMatMang(false);
  await Promise.all(bo.lay().map((a) => bo.thuLai(a.khoa)));
  expect(demTheo(bo.lay(), "loi")).toBe(0);
  expect(bo.lay()).toHaveLength(2);
  expect(bo.anhIds()).toHaveLength(2);
});

test("test_YC3_2_1_NT2_thu_lai_giu_Idempotency_Key_nen_khong_tao_anh_hai_lan", async () => {
  const k = "khoa-thu-lai-123456";
  const a = await postAnh(tep(1), k);
  const b = await postAnh(tep(1), k);
  expect(b.anh_id).toBe(a.anh_id);
  const khac = await postAnh(tep(1), "khoa-khac-1234567890");
  expect(khac.anh_id).not.toBe(a.anh_id);
});

test("test_YC3_2_1_NT2_server_tu_choi_tep_qua_15MB_hoac_khong_phai_anh", async () => {
  await expect(postAnh(tep(1, { dung_luong: 16 * 1024 * 1024 }), "khoa-qua-lon-1234567")).rejects.toMatchObject({ loi: "DU_LIEU_SAI", o: "tep" });
  await expect(postAnh(tep(1, { ten: "ghi-chu.pdf" }), "khoa-pdf-12345678901")).rejects.toMatchObject({ loi: "DU_LIEU_SAI", o: "tep" });
  const bo = new BoAnhForm();
  await bo.themTep([tep(1, { dung_luong: 16 * 1024 * 1024 })]).xong;
  expect(demTheo(bo.lay(), "loi")).toBe(1);
});

test("test_YC3_2_1_NT3_co_12_anh_thi_khong_them_duoc_nua", async () => {
  const bo = new BoAnhForm();
  await bo.themTep(nhieuTep(12)).xong;
  expect(bo.lay()).toHaveLength(12);
  expect(bo.themTep(nhieuTep(1))).toMatchObject({ nhan: 0, bo: 1 });
  expect(bo.lay()).toHaveLength(12);
  // Server giả cũng từ chối 13 anh_ids (server thật kiểm lại)
  await expect(postCan({ ma_can: "À La Carte 2208", so_phong_ngu: 1, anh_ids: [...bo.anhIds(), "anh-x"] })).rejects.toMatchObject({ loi: "DU_LIEU_SAI", o: "anh_ids" });
});

test("test_YC3_2_1_NT3_chon_10_roi_3_chi_nhan_them_2", async () => {
  const bo = new BoAnhForm();
  await bo.themTep(nhieuTep(10)).xong;
  const r = bo.themTep(nhieuTep(3));
  expect(r).toMatchObject({ nhan: 2, bo: 1 });
  await r.xong;
  expect(bo.lay()).toHaveLength(12);
});

test("test_YC3_2_1_buoc_3_anh_dau_la_anh_dai_dien_theo_thu_tu_anh_ids", async () => {
  const bo = new BoAnhForm();
  await bo.themTep(nhieuTep(5)).xong;
  const ids = bo.anhIds();
  const can = await postCan({ ma_can: "2105", so_phong_ngu: 2, anh_ids: ids });
  expect(can.so_anh).toBe(5);
  expect(can.anh_dai_dien).toMatchObject({ id: ids[0], thu_tu: 1 });
  const ds = await getCan();
  expect(ds.find((c) => c.ma_can === "2105")?.anh_dai_dien?.id).toBe(ids[0]);
  // Ảnh đã gắn căn không gắn lần hai; id lạ bị từ chối
  await expect(postCan({ ma_can: "2106", so_phong_ngu: 2, anh_ids: [ids[0]] })).rejects.toMatchObject({ loi: "DU_LIEU_SAI", o: "anh_ids" });
  await expect(postCan({ ma_can: "2107", so_phong_ngu: 2, anh_ids: ["anh-khong-co"] })).rejects.toMatchObject({ o: "anh_ids" });
});

test("test_YC3_1_NT2_so_anh_cua_can_vua_them_theo_so_anh_da_tai", async () => {
  const bo = new BoAnhForm();
  await bo.themTep(nhieuTep(6)).xong;
  expect((await postCan({ ma_can: "2501", so_phong_ngu: 1, anh_ids: bo.anhIds() })).so_anh).toBe(6);
  expect((await postCan({ ma_can: "2208", so_phong_ngu: 1 })).so_anh).toBe(0);
});

test("test_YC3_2_1_buoc_1_chon_anh_qua_lop_boc_co_the_thay_bang_ban_gia", async () => {
  let toiDaNhan = 0;
  datCongAnh({
    async chonAnh(n) {
      toiDaNhan = n;
      return { kq: "tu_choi" };
    },
    async moCaiDatQuyen() {},
  });
  expect(await chonAnh.chonAnh(12)).toEqual({ kq: "tu_choi" });
  expect(toiDaNhan).toBe(12);
  datCongAnh(null);
  const mau = await chonAnh.chonAnh(2);
  expect(mau.kq === "co" && mau.tep.length).toBe(2);
});
