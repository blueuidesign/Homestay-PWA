import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, test } from "vitest";
import { CHU_CAN_VAN_LUU, CHU_THE_QUYEN } from "../components/khoi-anh";
import { TheCan } from "../components/the-can";
import type { Can } from "../services/kieu";
import { LoiApi } from "../services/kieu";
import { chuDangTai, chuLoiAnh, type AnhForm } from "../stores/anh-form";
import { loiTuApi, NoiDungCN5A1 } from "./cn5-a1-them-can";

// US25 · Test render CN5-A1 phần ảnh (canvas CN5-A2, CN5-A3) và thẻ căn (CN5).
const khong = () => {};
const html = (el: React.ReactElement) => renderToStaticMarkup(el);
const chu = (s: string) => s.replace(/<[^>]+>/g, "|").replace(/&quot;/g, '"');

const a = (n: number, trang_thai: AnhForm["trang_thai"], tien_do = 100): AnhForm => ({
  khoa: `k${n}`,
  tep: { ten: `a${n}.jpg`, duong_dan: `file://a${n}.jpg`, dung_luong: 1 },
  trang_thai,
  tien_do,
  anh_id: trang_thai === "xong" ? `a${n}` : null,
  idem: `idem-${n}-xxxxxxxxxxxx`,
});
const nhieu = (n: number, ...doi: [number, AnhForm["trang_thai"], number?][]) =>
  Array.from({ length: n }, (_, i) => {
    const d = doi.find((x) => x[0] === i + 1);
    return a(i + 1, d ? d[1] : "xong", d?.[2]);
  });

const form = (p: Partial<React.ComponentProps<typeof NoiDungCN5A1>>) =>
  html(<NoiDungCN5A1 ma="Greenbay" phongNgu={2} loi={{}} dangLuu={false} onMa={khong} onPhongNgu={khong} onThem={khong} onChuaLam={khong} {...p} />);
// Nút "Thêm căn" ở thanh dưới là nút cuối của form
const nutThemCan = (h: string) => h.slice(h.lastIndexOf("<button"));

const can = (ma: string, them: Partial<Can> = {}): Can => ({
  id: `can-${ma}`,
  ma_can: ma,
  so_phong_ngu: 2,
  so_giuong: null,
  loai_view: null,
  toa_nha: null,
  so_anh: 0,
  moi_them: false,
  tao_luc: "2026-09-01T02:00:00.000Z",
  ...them,
});

test("test_YC3_2_1_NT1_dang_tai_nut_them_can_mo_va_co_dong_cho", () => {
  const h = form({ anh: nhieu(5, [5, "dang_tai", 60]) });
  const c = chu(h);
  expect(c).toContain("Ảnh (5)");
  expect(c).toContain("Đang tải 1 ảnh…");
  expect(c).toContain("Đang tải 60%");
  expect(c).toContain(chuDangTai(1));
  expect(c).toContain("Ảnh đại diện");
  expect(c).toContain("Ảnh đầu tiên là ảnh đại diện · Tối đa 12 ảnh");
  expect(nutThemCan(h)).toContain('disabled=""');
  // Hết tải thì nút dùng được, không còn dòng chờ
  const xong = form({ anh: nhieu(5) });
  expect(nutThemCan(xong)).not.toContain("disabled");
  expect(chu(xong)).not.toContain("Chờ tải xong");
});

test("test_YC3_2_1_NT2_anh_loi_co_thu_lai_va_nut_xoa_va_dong_bao_khi_bam_them_can", () => {
  const h = form({ anh: nhieu(3, [3, "loi"]), loi: { anh: chuLoiAnh(1) } });
  const c = chu(h);
  expect(c).toContain("⚠️ Tải lỗi");
  expect(c).toContain("1 ảnh tải lỗi");
  expect(c).toContain("1 ảnh chưa tải được. Bấm Thử lại hoặc xóa ảnh đó rồi thêm căn.");
  expect(c).toContain("Chưa thêm được căn. Sửa 1 chỗ bên dưới.");
  expect(h).toContain(">Thử lại</button>");
  expect(h.match(/aria-label="Xóa ảnh"/g)).toHaveLength(3);
});

test("test_YC3_2_1_NT3_du_12_anh_nut_them_anh_khong_dung_duoc", () => {
  const h = form({ anh: nhieu(12) });
  expect(chu(h)).toContain("Ảnh (12)");
  expect(h).toMatch(/<button[^>]*class="o-them-anh"[^>]*disabled=""/);
  expect(form({ anh: nhieu(11) })).not.toMatch(/<button[^>]*class="o-them-anh"[^>]*disabled=""/);
  expect(loiTuApi(new LoiApi("DU_LIEU_SAI", "", "anh_ids"), "x").anh).toContain("Tối đa 12 ảnh");
});

test("test_YC3_2_1_trang_thai_rong_va_anh_dau_tien", () => {
  const c = chu(form({}));
  expect(c).toContain("Bạn có thể thêm sau");
  expect(c).toContain("chọn nhiều ảnh cùng lúc");
  expect(c).not.toContain("Ảnh đại diện");
  expect(c).toContain("Đủ thông tin. Ảnh, giá thêm sau cũng được.");
});

test("test_HV4_da_tu_choi_quyen_anh_co_the_giai_thich_nut_cai_dat_va_can_van_luu", () => {
  const h = form({ coTheQuyen: true });
  const c = chu(h);
  expect(c).toContain(CHU_THE_QUYEN);
  expect(c).toContain(CHU_CAN_VAN_LUU);
  expect(h).toContain(">Mở cài đặt quyền</button>");
  expect(nutThemCan(h)).not.toContain("disabled");
  expect(chu(form({}))).not.toContain(CHU_THE_QUYEN);
});

test("test_YC3_1_NT2_duoi_6_anh_thi_the_goi_y_them_anh", () => {
  const goiY = "Nên thêm ảnh: sale cần ít nhất 6 ảnh";
  const the = (c: Can) => html(<TheCan can={c} />);
  expect(the(can("2105", { so_anh: 5 }))).toContain(goiY);
  expect(the(can("1509"))).toContain(goiY);
  expect(the(can("1509"))).toContain("Chưa có ảnh");
  expect(the(can("2501", { so_anh: 6 }))).not.toContain(goiY);
  expect(the(can("2208", { so_anh: 12 }))).not.toContain(goiY);
  const h = the(can("2105", { so_anh: 5, anh_dai_dien: { id: "a1", thu_tu: 1, duong_dan_xem: "file://a1.jpg", het_han_luc: "" } }));
  expect(h).toContain("5 ảnh");
  expect(h).toContain('src="file://a1.jpg"');
});
