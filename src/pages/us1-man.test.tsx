import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, test } from "vitest";
import { NoiDungBanThu } from "../components/ban-thu";
import { dongThongTin } from "../components/can-hien-thi";
import { DUONG } from "../components/duong-dan";
import { TheCan } from "../components/the-can";
import { HopToast } from "../components/toast";
import type { Can, TaiKhoan } from "../services/kieu";
import { LoiApi } from "../services/kieu";
import { manSauPhien, NoiDungA1 } from "./a1-chao-mung";
import { manSauChonVai, NoiDungA3 } from "./a3-chon-vai";
import { NoiDungA4 } from "./a4-chu-nha-moi";
import { chuToastThemCan, dongConThieu, loiTuApi, NoiDungCN5A1 } from "./cn5-a1-them-can";
import { NoiDungCN5 } from "./cn5-danh-sach-can";

// Test render trong Node bằng các phần "NoiDung..." (không cần router, window).
const khong = () => {};
const html = (el: React.ReactElement) => renderToStaticMarkup(el);

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

const formCN5A1 = (p: Partial<React.ComponentProps<typeof NoiDungCN5A1>>) =>
  html(
    <NoiDungCN5A1
      ma=""
      phongNgu={null}
      loi={{}}
      dangLuu={false}
      onMa={khong}
      onPhongNgu={khong}
      onThem={khong}
      onChuaLam={khong}
      {...p}
    />,
  );

// Nút "Thêm căn" ở thanh dưới là nút cuối của form
const nutThemCan = (h: string) => h.slice(h.lastIndexOf("<button"));

test("test_YC1_1_NT1_bat_dau_ngay_sang_A3_khong_hoi_ten_so_dien_thoai", () => {
  expect(manSauPhien(null)).toBe(DUONG.A3);
  const h = html(<NoiDungA1 dangVao={false} onBatDau={khong} onMo={khong} />);
  expect(h).toContain("Bắt đầu ngay");
  expect(h).not.toContain("<input");
  expect(h).not.toMatch(/số điện thoại|Số điện thoại/);
});

test("test_YC1_1_NT2_dong_dieu_khoan_co_hai_link", () => {
  const h = html(<NoiDungA1 dangVao={false} onBatDau={khong} onMo={khong} />);
  expect(h).toContain("Bằng việc tiếp tục, bạn đồng ý với");
  const link = [...h.matchAll(/<a [^>]*>([^<]*)<\/a>/g)].map((m) => m[1]);
  expect(link).toEqual(["Điều khoản", "Chính sách quyền riêng tư"]);
});

test("test_YC1_2_NT1_chu_nha_tiep_tuc_mo_A4", () => {
  expect(manSauChonVai("chu_nha")).toBe(DUONG.LICH);
  // Tài khoản chủ nhà mở app lại cũng vào tab Lịch
  const tk: TaiKhoan = { id: "tk-1", vai_chon: "chu_nha", dong_y_dieu_khoan_luc: "" };
  expect(manSauPhien(tk)).toBe(DUONG.LICH);
  // Tab Lịch khi chưa có căn là A4: xem test_YC1_4_NT1
});

test("test_YC1_2_NT3_cham_the_chi_the_do_duoc_chon", () => {
  const chon = (h: string) => [...h.matchAll(/class="the-vai([^"]*)"[^>]*data-vai="([a-z_]+)"/g)].map((m) => [m[2], m[1].includes("the-vai--chon")]);
  const chuNha = html(<NoiDungA3 vai="chu_nha" dangLuu={false} onChon={khong} onTiepTuc={khong} />);
  expect(chon(chuNha)).toEqual([
    ["chu_nha", true],
    ["sale", false],
  ]);
  const sale = html(<NoiDungA3 vai="sale" dangLuu={false} onChon={khong} onTiepTuc={khong} />);
  expect(chon(sale)).toEqual([
    ["chu_nha", false],
    ["sale", true],
  ]);
});

test("test_YC1_2_A3_00_chua_chon_thi_tiep_tuc_mo", () => {
  const h = html(<NoiDungA3 vai={null} dangLuu={false} onChon={khong} onTiepTuc={khong} />);
  expect(h).toMatch(/<button[^>]*disabled=""[^>]*>Tiếp tục<\/button>/);
  expect(h).toContain("Chọn một mục để tiếp tục");
  const daChon = html(<NoiDungA3 vai="chu_nha" dangLuu={false} onChon={khong} onTiepTuc={khong} />);
  expect(daChon).not.toContain("Chọn một mục để tiếp tục");
  expect(daChon).toMatch(/<button type="button" class="hh-btn hh-btn--primary hh-btn--block">Tiếp tục<\/button>/);
});

test("test_YC1_4_NT1_A4_co_nut_them_can_dau_tien", () => {
  const h = html(<NoiDungA4 onThemCan={khong} />);
  expect(h).toContain("Chưa có căn nào");
  expect(h).toContain("Thêm căn đầu tiên");
  expect(h).toContain("3 bước để bắt đầu");
});

test("test_YC3_1_NT1_bon_can_bon_the", () => {
  const ds = ["1509", "3402", "Greenbay", "2208"].map((m) => can(m));
  const h = html(<NoiDungCN5 dsCan={ds} onThemCan={khong} />);
  expect(h.match(/class="the-can[ "]/g)).toHaveLength(4);
  expect(`${ds.length} căn`).toBe("4 căn");
  expect(h).toContain("Phòng 1509");
  expect(h).toContain("Greenbay");
});

test("test_YC3_1_NT6_chua_nhap_so_giuong_chi_ghi_so_phong_ngu", () => {
  expect(dongThongTin(can("1509"))).toBe("2PN");
  const h = html(<TheCan can={can("1509")} />);
  expect(h).toContain(">2PN<");
  expect(h).not.toContain("giường");
  // Có số giường thì ghi theo glossary (US1-NT9 thuộc US1)
  expect(dongThongTin(can("1509", { so_giuong: 3, loai_view: "view biển", toa_nha: "ICON40" }))).toBe(
    "2PN · 3 giường · view biển · ICON40",
  );
});

test("test_YC3_1_NT7_the_can_khong_ghi_so_khach", () => {
  const ds = [can("1509", { so_giuong: 3, so_anh: 12 }), can("3402", { so_phong_ngu: 0 }), can("2105", { moi_them: true })];
  const h = html(<NoiDungCN5 dsCan={ds} vuaThemId="can-2105" onThemCan={khong} />);
  expect(h).not.toMatch(/khách|người lớn|trẻ em/);
});

test("test_YC3_2_NT1_thieu_thi_nut_them_can_khong_dung_duoc", () => {
  expect(dongConThieu("", null)).toBe("Còn thiếu: mã căn, số phòng ngủ");
  expect(dongConThieu("2105", null)).toBe("Còn thiếu: số phòng ngủ");
  expect(dongConThieu("  ", 2)).toBe("Còn thiếu: mã căn");
  const trong = formCN5A1({});
  expect(trong).toContain("Còn thiếu: mã căn, số phòng ngủ");
  expect(nutThemCan(trong)).toContain('disabled=""');
  expect(nutThemCan(formCN5A1({ ma: "2105" }))).toContain('disabled=""');
});

test("test_YC3_2_NT2_du_ma_can_va_so_phong_ngu_thi_them_duoc", () => {
  const h = formCN5A1({ ma: "2105", phongNgu: 2 });
  expect(dongConThieu("2105", 2)).toBeNull();
  expect(h).toContain("Đủ thông tin. Ảnh, giá thêm sau cũng được.");
  expect(nutThemCan(h)).not.toContain("disabled");
});

test("test_YC3_2_NT3_ma_can_trung_hien_loi_duoi_o_ma_can", () => {
  const loi = loiTuApi(new LoiApi("MA_CAN_TRUNG", "Đã có căn 1509", "ma_can"), "1509");
  expect(loi).toEqual({ ma_can: "Đã có căn 1509. Kiểm tra lại mã căn." });
  const h = formCN5A1({ ma: "1509", phongNgu: 2, loi });
  expect(h).toContain("Chưa thêm được căn. Sửa 1 chỗ bên dưới.");
  // Lỗi nằm ngay sau ô mã căn
  expect(h).toMatch(/name="ma_can"[^>]*\/><\/label><span class="chu-loi">⚠️ Đã có căn 1509\. Kiểm tra lại mã căn\.<\/span>/);
});

test("test_DC21_ban_thu_o_man_sale_khong_nap_mau_chu_nha", () => {
  const sale = html(<NoiDungBanThu vaiSale onNapMau={khong} onXoaSach={khong} />);
  expect(sale).not.toContain("Nạp dữ liệu mẫu");
  expect(sale).toContain("Xóa sạch, về người dùng mới");
  const chuNha = html(<NoiDungBanThu onNapMau={khong} onXoaSach={khong} />);
  expect(chuNha).toContain("Nạp dữ liệu mẫu chủ nhà (Chị Hoa, 2 căn)");
});

test("test_YC3_2_NT4_toast_va_nhan_moi_them", () => {
  expect(chuToastThemCan("2105")).toBe("Đã thêm phòng 2105");
  expect(html(<HopToast chu={chuToastThemCan("2105")} onDong={khong} />)).toContain("Đã thêm phòng 2105");
  const ds = [can("2105", { moi_them: true }), can("1509", { so_giuong: 3 })];
  const h = html(<NoiDungCN5 dsCan={ds} vuaThemId="can-2105" onThemCan={khong} />);
  expect(h).toContain("Mới thêm");
  expect(h.match(/Mới thêm/g)).toHaveLength(1);
  expect(h).toContain('class="the-can the-can--moi" data-can="2105"');
  expect(h).toContain("Thêm căn khác");
});
