import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, test } from "vitest";
import { LoiApi, LoiMang, type DatPhongTrongNgay, type KiemTrung, type LichNgay } from "../services/kieu";
import { ChiTietNgay } from "./cn1-lich-thang";
import {
  chuToastDatPhong,
  docTien,
  dongKiemTrung,
  formMoi,
  loiKhiLuu,
  ngayTraTheoChip,
  NoiDungCN4,
  type FormCN4,
} from "./cn4-dat-phong";

// US3 · Test render CN4 (form đặt phòng) và CN3 (chi tiết ngày có nút Đặt phòng, thẻ có khách). Số theo DLM.
const khong = () => {};
const html = (el: React.ReactElement) => renderToStaticMarkup(el);
const chu = (s: string) => s.replace(/<[^>]+>/g, "|").replace(/&quot;/g, '"');
const CAN = [
  { can_id: "can-1", ma_can: "1509" },
  { can_id: "can-2", ma_can: "3402" },
];
const SALE = ["Sale Hùng", "Sale Lan", "Sale Nga", "Sale Minh"].map((ten, i) => ({ sale_id: `s${i}`, ten }));
const KT: KiemTrung = {
  khong_trung: true, dem_trung: [], so_dem: 2,
  dem: [{ ngay: "2026-10-15", gia_chu: 900000 }, { ngay: "2026-10-16", gia_chu: 1300000 }],
  tong_gia_chu: 2200000,
};

const form = (them: Partial<FormCN4> = {}): FormCN4 => ({ ...formMoi("can-1", "2026-10-15"), chipDem: 2, tienPhong: "2200000", ...them });

const cn4 = (p: Partial<React.ComponentProps<typeof NoiDungCN4>> = {}) =>
  html(
    <NoiDungCN4
      can={CAN}
      sale={SALE}
      khachLe={[]}
      form={form()}
      kiemTra={KT}
      daSuaTien={false}
      dangLuu={false}
      loiChung={null}
      onDoi={khong}
      onLuu={khong}
      onChuaLam={khong}
      {...p}
    />,
  );

const chips = (s: string) => [...s.matchAll(/<button[^>]*class="hh-chip[^"]*"[^>]*>(.*?)<\/button>/g)].map((m) => chu(m[1]).replace(/\|/g, ""));
const nutLuu = (s: string) => s.match(/<button[^>]*class="hh-btn hh-btn--primary hh-btn--block"[^>]*>(.*?)<\/button>/)!;

test("test_YC4_1_NT1_US3_KB14_form_them_dat_phong_du_phan_va_chip", () => {
  const s = cn4();
  expect(chips(s)).toEqual([
    "1509", "3402", "1 đêm", "2 đêm", "3 đêm", "Tùy chọn",
    "+ Sale mới", "Khách lẻ", "Sale Hùng", "Sale Lan", "Sale Nga", "Sale Minh",
    "Chưa cọc", "Đã cọc · còn thu", "Đã thanh toán",
  ]);
  for (const phan of ["Phòng", "Ngày nhận phòng", "Ngày trả phòng", "Khách / Sale", "Tiền phòng (đ)", "Thêm chi tiết"]) {
    expect(chu(s)).toContain(phan);
  }
  expect(nutLuu(s)[1]).toBe("Thêm đặt phòng");
  // Chọn sẵn: 1509, 2 đêm, Khách lẻ, Chưa cọc
  expect(s).toMatch(/class="hh-chip hh-chip--r1509 hh-chip--on"/);
  expect(s).toMatch(/hh-chip--on"[^>]*>Khách lẻ</);
  expect(s).toMatch(/hh-chip--on"[^>]*>Chưa cọc</);
});

test("test_YC4_1_1_NT1_US3_KB1_dong_khong_trung_va_tien_tach_theo_dem", () => {
  const s = chu(cn4());
  expect(s).toContain("✓ 15/10 → 17/10 (2 đêm) · không trùng lịch");
  expect(s).toContain("15/10: 900.000đ");
  expect(s).toContain("16/10: 1.300.000đ");
  expect(cn4()).toContain('value="2.200.000"');
  expect(dongKiemTrung("2026-10-15", "2026-10-17", KT).loai).toBe("ok");
});

test("test_YC4_1_1_NT2_US3_KB3_dong_bao_trung_khong_co_dau_tich", () => {
  const trung: KiemTrung = { ...KT, khong_trung: false, dem_trung: ["2026-10-11"] };
  const s = chu(cn4({ form: form({ ngayNhan: "2026-10-11" }), kiemTra: trung }));
  expect(s).toContain("Trùng lịch: 11/10 đã có khách");
  expect(s).not.toContain("không trùng lịch");
  expect(s).not.toContain("✓");
  // Lưu bị server từ chối: báo trùng, form giữ nguyên
  expect(loiKhiLuu(new LoiApi("TRUNG_LICH", "", "ngay_nhan", ["2026-10-11"]))).toBe("Trùng lịch: 11/10 đã có khách. Chọn ngày khác.");
});

test("test_YC4_1_1_NT3_chip_so_dem_doi_ngay_tra", () => {
  expect(ngayTraTheoChip("2026-10-15", 1, "")).toBe("2026-10-16");
  expect(ngayTraTheoChip("2026-10-15", 2, "")).toBe("2026-10-17");
  expect(ngayTraTheoChip("2026-10-15", 3, "")).toBe("2026-10-18");
  expect(ngayTraTheoChip("2026-10-15", "tuy_chon", "2026-10-19")).toBe("2026-10-19");
  // Qua tháng (US3-KB8)
  expect(ngayTraTheoChip("2026-10-31", 2, "")).toBe("2026-11-02");
  // Ngày trả chỉ sửa được khi chọn Tùy chọn
  expect(cn4()).toMatch(/name="ngay_tra"[^>]*disabled=""/);
  expect(cn4({ form: form({ chipDem: "tuy_chon", traTuyChon: "2026-10-19" }) })).not.toMatch(/name="ngay_tra"[^>]*disabled/);
});

test("test_YC4_1_2_NT1_US3_KB12_o_tien_coc_chi_khi_da_coc_con_thu", () => {
  expect(chu(cn4())).not.toContain("Số tiền cọc (đ)");
  expect(chu(cn4({ form: form({ trangThaiTien: "da_thanh_toan" }) }))).not.toContain("Số tiền cọc (đ)");
  expect(chu(cn4({ form: form({ trangThaiTien: "da_coc_con_thu" }) }))).toContain("Số tiền cọc (đ)");
});

test("test_YC4_1_2_NT2_US3_KB13_them_chi_tiet_so_khach_gio_ghi_chu", () => {
  expect(chu(cn4())).not.toContain("Ghi chú");
  const s = chu(cn4({ form: form({ moChiTiet: true, soKhach: 3 }) }));
  expect(s).toContain("Số khách");
  expect(s).toContain("|−|");
  expect(s).toContain("|+|");
  expect(s).toContain("|3|");
  expect(s).toContain("14:00 → 12:00");
  expect(s).toContain("Ghi chú");
});

test("test_YC4_1_2_NT4_QT4_1_VD3_US3_KB15_tien_trong_nut_khong_dung_duoc", () => {
  const s = cn4({ form: form({ tienPhong: "" }), daSuaTien: true });
  expect(chu(s)).toContain("Nhập tiền phòng trước khi lưu");
  expect(s).toContain('aria-invalid="true"');
  expect(nutLuu(s)[0]).toContain('disabled=""');
  expect(docTien("")).toBeNull();
  expect(docTien("1.800.000")).toBe(1800000);
});

test("test_HV1_US3_KB16_dang_luu_nut_doi_chu_va_khoa", () => {
  const s = cn4({ dangLuu: true });
  expect(nutLuu(s)[1]).toBe("Đang lưu…");
  expect(nutLuu(s)[0]).toContain('disabled=""');
});

test("test_HV2_NT1_US3_KB17_mat_mang_bao_chua_luu", () => {
  const loi = loiKhiLuu(new LoiMang());
  expect(loi).toBe("Chưa lưu được, bấm lại khi có mạng");
  const s = chu(cn4({ loiChung: loi }));
  expect(s).toContain(loi);
  // Form giữ nguyên căn, ngày, tiền
  expect(cn4({ loiChung: loi })).toContain('value="2.200.000"');
});

test("test_YC4_1_NT1_HV8_toast_nguoi_dat_va_can", () => {
  expect(chuToastDatPhong(null, "1509")).toBe("Đã thêm đặt phòng Khách lẻ · 1509");
  expect(chuToastDatPhong("Anh Nam", "3402")).toBe("Đã thêm đặt phòng Anh Nam · 3402");
});

const dp = (them: Partial<DatPhongTrongNgay> = {}): DatPhongTrongNgay => ({
  id: "b1", nguoi_dat: { loai: "sale", sale_id: null, ten: "Sale Hùng", da_xoa_tai_khoan: false },
  ngay_nhan: "2026-10-10", ngay_tra: "2026-10-12", so_dem: 2, tien_phong: 2200000,
  trang_thai_tien: "da_coc_con_thu", tien_coc: 1000000, ghi_chu: null, trang_thai: "hieu_luc", ...them,
});

test("test_YC2_4_NT2_YC2_4_NT3_US3_KB10_chi_tiet_ngay_the_co_khach_va_nut_dat_phong", () => {
  const ngay: LichNgay = {
    ngay: "2026-10-10",
    can: [
      { can_id: "can-1", ma_can: "1509", trong: false, dat_phong: dp() },
      { can_id: "can-2", ma_can: "3402", trong: true, dat_phong: null },
    ],
  };
  const s = chu(html(<ChiTietNgay ngay="2026-10-10" lich={ngay} canTheoThuTu={CAN} loi={false} onThuLai={khong} onDatPhong={khong} />));
  expect(s).toContain("Sale Hùng");
  expect(s).toContain("10/10 → 12/10 (2 đêm)");
  expect(s).toContain("2.200.000đ · Cọc: 1.000.000đ");
  expect(s).toContain("Phòng 3402 |· Trống ✓");
  expect(s.match(/\|Đặt phòng\|/g)).toHaveLength(1);
  // Khách lẻ không tên, đã thanh toán: không có phần cọc
  const kl = chu(html(
    <ChiTietNgay
      ngay="2026-10-14"
      lich={{ ngay: "2026-10-14", can: [{ can_id: "can-2", ma_can: "3402", trong: false, dat_phong: dp({ nguoi_dat: { loai: "khach_le", sale_id: null, ten: null, da_xoa_tai_khoan: false }, ngay_nhan: "2026-10-14", ngay_tra: "2026-10-15", so_dem: 1, tien_phong: 800000, trang_thai_tien: "da_thanh_toan", tien_coc: null }) }] }}
      canTheoThuTu={CAN}
      loi={false}
      onThuLai={khong}
    />,
  ));
  expect(kl).toContain("Khách lẻ");
  expect(kl).toContain("14/10 → 15/10 (1 đêm)");
  expect(kl).toContain("|800.000đ|");
  expect(kl).not.toContain("Cọc");
});
