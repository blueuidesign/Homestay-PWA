import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, expect, test } from "vitest";
import { chuCaiDau, chuKetNoiTu, chuSoDienThoai, chuTomTat } from "../components/sale-hien-thi";
import { CHU_BUOC_ZALO, CHU_DA_TU_CHOI, PopupXinSo, tieuDePopup } from "../components/xin-so";
import { banThu, getKetNoi, getKetNoiChiTiet, getSaleKetNoi, getToi, homNay } from "../services/api";
import type { DanhSachKetNoi } from "../services/kieu";
import { NoiDungCN704, chuHopNgung, HopXacNhanNgung } from "./cn7-man-chi-tiet";
import { NoiDungCN705, CHU_LOI_THIEU_SO, CHU_LOI_THIEU_TEN } from "./cn7-man-them";
import { NoiDungCN7, NoiDungCN700 } from "./cn7-man";
import { CHU_CHUA_CO_SO, NoiDungP2 } from "./p2-man";
import { formMoi, NoiDungCN4 } from "./cn4-dat-phong";

// US5 · Test render CN7, CN7-00, CN7-04, CN7-05, popup xin số, P2 và chip sale ở CN4, dùng dữ liệu của server giả. Số theo DLM.
const khong = () => {};
const html = (el: React.ReactElement) => renderToStaticMarkup(el);
const chu = (s: string) => s.replace(/<[^>]+>/g, "|").replace(/&quot;/g, '"').replace(/&amp;/g, "&");
const nut = (s: string) => [...s.matchAll(/<button[^>]*>(.*?)<\/button>/g)].map((m) => chu(m[1]).replace(/\|/g, ""));

let ds: DanhSachKetNoi;
beforeEach(async () => {
  banThu.xoaSach();
  banThu.datDoTre(0);
  banThu.napDuLieuMau(false, true);
  ds = await getKetNoi();
});

const cn7 = (d: DanhSachKetNoi = ds) =>
  html(<NoiDungCN7 ds={d} dangLam={false} onGuiLink={khong} onSaoChep={khong} onThemSale={khong} onMoSale={khong} />);

test("test_YC1_9_buoc_1_US5_CN7_nhom_da_ket_noi_4_dong_theo_canvas_va_nut_gui_link", () => {
  const s = cn7();
  const c = chu(s);
  expect(c).toContain("Mời sale xem lịch");
  expect(nut(s)).toEqual(expect.arrayContaining(["Gửi link mời qua Zalo", "Sao chép link", "Thêm sale"]));
  expect(c).toContain("Đã kết nối · 4");
  expect(c).toContain("Chưa kết nối · 0");
  const dong = [...s.matchAll(/<button[^>]*class="dong-sale"[^>]*>(.*?)<\/button>/g)].map((m) => chu(m[1]).replace(/^\|+/, "").replace(/\|+/g, " | ").trim());
  expect(dong).toEqual([
    "H | Sale Hùng | 2 đặt phòng tháng này · 4 đêm | 4.000.000đ |",
    "L | Sale Lan | 2 đặt phòng · 1 chưa cọc | 3.500.000đ |",
    "M | Sale Minh | 2 đặt phòng · đã thanh toán | 1.700.000đ |",
    "N | Sale Nga | Chưa có đặt phòng tháng này | 0đ |",
  ]);
  // Không có nút "Nhắc lại" (chưa thiết kế, YC1.9 bước 3 còn [MỞ])
  expect(c).not.toContain("Nhắc lại");
});

test("test_YC1_9_NT3_US5_KB1_chua_co_sale_thi_hien_CN7_00_hai_nut_va_khung_sale_se_thay", () => {
  const s = cn7({ vai: "chu_nha", da_ket_noi: [], chua_ket_noi: [] });
  const c = chu(s);
  expect(c).toContain("Chưa có sale nào xem lịch");
  expect(nut(s)).toEqual(["Gửi link mời qua Zalo", "Sao chép link"]);
  expect(c).toContain("Sale sẽ thấy");
  expect(c).toContain("Phòng trống hay đã đặt");
  // EN53: không còn công tắc giá (QD20 r2 điểm 3), bỏ "(bạn tắt được)"
  expect(c).toContain("Giá từng đêm");
  expect(c).not.toContain("tắt được");
  expect(c).toContain("Không thấy tên, số điện thoại khách và doanh thu");
  expect(html(<NoiDungCN700 dangLam={false} onGuiLink={khong} onSaoChep={khong} />)).toContain("Chưa có sale nào xem lịch");
});

test("test_YC1_9_NT1_US5_KB14_sale_them_tay_nam_o_nhom_chua_ket_noi_khong_bam_mo_duoc", async () => {
  const d: DanhSachKetNoi = {
    ...ds,
    chua_ket_noi: [{ id: "x", ten_hien_thi: "Sale Quân", trang_thai: "chua_ket_noi", nguon: "chu_them_tay", tong_tien_dat_phong: 0 }],
  };
  const s = cn7(d);
  expect(chu(s)).toContain("Chưa kết nối · 1");
  expect(chu(s)).toContain("Sale Quân");
  expect(chu(s)).toContain("Chưa mở link");
  expect(s).toContain('class="dong-sale dong-sale--tinh" data-sale="Sale Quân"'); // div, không phải nút
  expect(chu(s)).not.toContain("0987"); // danh sách không có số điện thoại
});

test("test_chu_hien_thi_chu_cai_dau_so_dien_thoai_ngay_ket_noi_va_tom_tat", () => {
  expect(chuCaiDau("Sale Hùng")).toBe("H");
  expect(chuSoDienThoai("0904118772")).toBe("0904 118 772");
  expect(chuSoDienThoai("84904118772")).toBe("0904 118 772");
  expect(chuKetNoiTu("2026-08-02T10:00:00+07:00")).toBe("kết nối từ 02/08/2026");
  expect(chuKetNoiTu(null)).toBeNull();
  expect(chuTomTat({ ...ds.da_ket_noi[3], tom_tat: undefined })).toBe("Chưa có đặt phòng tháng này");
});

test("test_YC1_9_buoc_5_US5_CN7_04_dau_the_gia_tri_thang_danh_sach_dat_phong_va_nut_ngung", async () => {
  const ct = await getKetNoiChiTiet(ds.da_ket_noi[0].id);
  const s = html(<NoiDungCN704 ct={ct} hom={homNay()} onGoi={khong} onNgung={khong} />);
  const c = chu(s);
  expect(c).toContain("Sale Hùng");
  expect(c).toContain("0912 345 678 · kết nối từ 02/08/2026");
  expect(nut(s)).toEqual(["Gọi", "Ngừng cho xem lịch"]);
  expect(c).toContain("Đặt phòng tháng 10");
  expect(c).toContain("4.000.000đ");
  expect(c).toContain("1509 · 10/10 → 12/10 · Đã cọc · còn thu");
  expect(c).toContain("1509 · 04/10 → 06/10 · Đã thanh toán");
  // Sale chưa cho số: không có số và không có nút Gọi
  const nga = await getKetNoiChiTiet(ds.da_ket_noi[3].id);
  const sn = html(<NoiDungCN704 ct={nga} hom={homNay()} onGoi={khong} onNgung={khong} />);
  expect(nut(sn)).toEqual(["Ngừng cho xem lịch"]);
  expect(chu(sn)).toContain("Chưa có đặt phòng");
});

test("test_YC1_9_buoc_6_US5_KB16_hop_xac_nhan_ngung_dung_chu_va_hai_nut", () => {
  expect(chuHopNgung("Sale Hùng")).toBe("Xác nhận ngừng cho Sale Hùng xem? Đặt phòng cũ vẫn giữ. Sale không thấy lịch của bạn nữa.");
  const s = html(<HopXacNhanNgung ten="Sale Hùng" dangLam={false} loi={null} onXacNhan={khong} onHuy={khong} />);
  expect(chu(s)).toContain("Xác nhận ngừng cho Sale Hùng xem?");
  expect(nut(s)).toEqual(["Ngừng cho xem", "Giữ nguyên"]);
  expect(nut(html(<HopXacNhanNgung ten="Sale Hùng" dangLam loi="Chưa lưu được, bấm lại khi có mạng" onXacNhan={khong} onHuy={khong} />))).toEqual(["Đang lưu…", "Giữ nguyên"]);
});

const cn705 = (p: Partial<React.ComponentProps<typeof NoiDungCN705>> = {}) =>
  html(<NoiDungCN705 ten="" so="" daBam={false} dangLuu={false} loi={null} onDoiTen={khong} onDoiSo={khong} onLuu={khong} {...p} />);

test("test_YC1_9_buoc_4_US5_KB12_CN7_05_hai_o_bat_buoc_bao_thieu_sau_khi_bam_luu", () => {
  const c0 = chu(cn705());
  expect(c0).toContain("Tên sale");
  expect(c0).toContain("Số điện thoại");
  expect(c0).toContain("Sale nằm ở nhóm Chưa kết nối cho tới khi mở link mời.");
  expect(nut(cn705())).toEqual(["Lưu sale"]);
  expect(c0).not.toContain(CHU_LOI_THIEU_SO);
  const c1 = chu(cn705({ ten: "Sale Quân", daBam: true }));
  expect(c1).toContain(CHU_LOI_THIEU_SO);
  expect(c1).not.toContain(CHU_LOI_THIEU_TEN);
  // Mất mạng: báo chưa lưu, hai ô giữ chữ đã gõ (US5-KB13)
  const m = cn705({ ten: "Sale Quân", so: "0987 000 222", loi: "Chưa lưu được, bấm lại khi có mạng" });
  expect(chu(m)).toContain("Chưa lưu được, bấm lại khi có mạng");
  expect(m).toContain('value="Sale Quân"');
  expect(m).toContain('value="0987 000 222"');
});

const popup = (p: Partial<React.ComponentProps<typeof PopupXinSo>> = {}) =>
  html(<PopupXinSo nguoiKia="sale" ghiChuDeSau="Để sau vẫn gửi được link. Sale chưa thấy tên và số của bạn." daTuChoi={false} dangXin={false} loi={null} onDongY={khong} onDeSau={khong} onMoCaiDat={khong} {...p} />);

test("test_YC1_5_1_NT1_US5_KB2_popup_giai_thich_hai_nut_va_khung_zalo_se_hien_hop_thoai", () => {
  const s = popup();
  expect(chu(s)).toContain("Chia sẻ số điện thoại với sale");
  expect(chu(s)).toContain(CHU_BUOC_ZALO);
  expect(chu(s)).toContain("Khách không bao giờ thấy số này.");
  expect(nut(s)).toEqual(["Đồng ý, tiếp tục", "Để sau"]);
  expect(chu(s)).toContain("Để sau vẫn gửi được link.");
  expect(tieuDePopup("chu_nha")).toBe("Chia sẻ số điện thoại với chủ nhà");
});

test("test_HV4_NT2_US5_KB6_popup_sau_khi_tu_choi_co_the_giai_thich_va_nut_mo_cai_dat_quyen", () => {
  const s = popup({ daTuChoi: true });
  expect(nut(s)).toEqual(["Đồng ý, tiếp tục", "Mở cài đặt quyền", "Để sau"]);
  expect(chu(s)).toContain(CHU_DA_TU_CHOI.replace("chủ nhà", "sale"));
  expect(nut(popup({ dangXin: true }))[0]).toBe("Đang xử lý…");
});

test("test_YC1_5_3_NT1_NT2_US5_KB3_KB10_P2_so_chi_xem_nhan_tu_zalo_hoac_chua_co", async () => {
  const co = html(<NoiDungP2 ho_so={await getToi()} />);
  expect(co).toContain('value="0904 118 772"');
  expect(chu(co)).toContain("Từ Zalo ✓");
  expect(co).toMatch(/name="so_dien_thoai"[^>]*readonly=""/);
  expect(co).toContain('value="Nguyễn Hoa"');
  banThu.xoaSoDienThoai();
  const chua = html(<NoiDungP2 ho_so={await getToi()} />);
  expect(chua).toContain(`value="${CHU_CHUA_CO_SO}"`);
  expect(CHU_CHUA_CO_SO).toBe("Chưa có · Zalo sẽ hỏi khi bạn kết nối lần đầu");
  expect(chu(chua)).not.toContain("Từ Zalo ✓");
});

test("test_YC4_1_2_NT3_US5_KB15_CN4_chip_sale_chon_duoc_va_ghi_chu_tinh_cho_sale", async () => {
  const sale = await getSaleKetNoi();
  const cn4 = (saleId: string | null) =>
    html(
      <NoiDungCN4
        can={[{ can_id: "c1", ma_can: "1509" }, { can_id: "c2", ma_can: "3402" }]}
        sale={sale}
        khachLe={[]}
        form={{ ...formMoi("c2", "2026-10-08"), saleId, tienPhong: "800000" }}
        kiemTra={null}
        daSuaTien={false}
        dangLuu={false}
        loiChung={null}
        onDoi={khong}
        onLuu={khong}
        onChuaLam={khong}
      />,
    );
  const macDinh = cn4(null);
  expect(macDinh).toMatch(/hh-chip--on"[^>]*>Khách lẻ</);
  expect(macDinh).not.toMatch(/hh-chip--on"[^>]*>Sale Hùng</);
  expect(macDinh).not.toContain("Sale Quân");
  const hung = cn4(sale[0].sale_id);
  expect(hung).toMatch(/hh-chip--on"[^>]*>Sale Hùng</);
  expect(hung).not.toMatch(/hh-chip--on"[^>]*>Khách lẻ</);
  expect(chu(hung)).toContain("Đặt phòng này tính cho Sale Hùng.");
});
