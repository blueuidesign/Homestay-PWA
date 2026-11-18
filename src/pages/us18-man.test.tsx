import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, expect, test } from "vitest";
import { banThu, getThongKeChu, postPhien } from "../services/api";
import type { ThongKeChu } from "../services/kieu";
import { BieuDo6Thang, chuDemCoKhach, HangChonThang, KhoiNguoiBan, KhungThongKeDangTai, NoiDungThongKe, TheCan, TheDoanhThu, TheKin } from "./cn8-man";

// US18 · Test render màn Thống kê chủ nhà (CN8, CN8-00) với số của server giả theo DLM.5. Hôm nay 07/10/2026 (DLM.1).
// Mỗi test lấy số từ server giả (getThongKeChu) rồi vẽ phần giao diện và đọc chữ ra. Khối chưa thu (mục "Chưa thu tiền" (US18)) chưa làm: [MỞ: mục "Chưa thu tiền" (US18) bước 1, DC53 US18-Q1].
const khong = () => {};
const html = (el: React.ReactElement) => renderToStaticMarkup(el);
const chu = (s: string) => s.replace(/<[^>]+>/g, "|").replace(/\|+/g, "|").replace(/&quot;/g, '"');
const lien = (s: string) => chu(s).replace(/\|/g, " ").replace(/\s+/g, " ").trim();

beforeEach(async () => {
  banThu.xoaSach();
  banThu.datDoTre(0);
  banThu.datMatMang(false);
  banThu.napDuLieuMau(false, true); // Chị Hoa, 1509 và 3402, B1 đến B9, hôm nay 07/10/2026
  await postPhien();
});

const lay = (thang: string) => getThongKeChu({ thang, so_thang: 6 });
// Số trên đầu và nhãn dưới chân của từng cột biểu đồ, theo thứ tự cột
const soTrenCot = (s: string) => [...s.matchAll(/<span class="tk-bd__so">(.*?)<\/span>/g)].map((m) => m[1]);
const nhanCot = (s: string) => [...s.matchAll(/<span class="tk-bd__nhan[^"]*">(.*?)<\/span>/g)].map((m) => m[1]);
const manDayDu = (tk: ThongKeChu) => html(<NoiDungThongKe tk={tk} />);

test("test_YC7_1_NT1_KB1_KB2_KB3_thang_10_doanh_thu_hai_phong_dem_co_khach_va_cong_suat", async () => {
  const v = lien(manDayDu(await lay("2026-10")));
  expect(v).toContain("DOANH THU THÁNG 10 11.800.000đ +22.9% so với tháng 9");
  expect(v).toContain("PHÒNG 1509 6.700.000đ");
  expect(v).toContain("PHÒNG 3402 5.100.000đ");
  expect(v).toContain("ĐÊM CÓ KHÁCH 13/62");
  expect(v).toContain("CÔNG SUẤT 21.0%");
});

test("test_YC7_1_NT4_KB4_thang_11_nhan_va_so_doi_theo_thang_chon_dong_so_sanh_giam_93_2", async () => {
  const tk = await lay("2026-11");
  const v = lien(manDayDu(tk));
  expect(v).toContain("DOANH THU THÁNG 11 800.000đ −93.2% so với tháng 10");
  expect(v).toContain("PHÒNG 1509 0đ");
  expect(v).toContain("PHÒNG 3402 800.000đ");
  expect(v).toContain("ĐÊM CÓ KHÁCH 1/60");
  // Tiêu đề tháng và hai chip ở hàng chọn tháng
  const hang = lien(html(<HangChonThang thang="2026-11" onDoi={khong} />));
  expect(hang).toContain("T10");
  expect(hang).toContain("Tháng 11/2026");
  expect(hang).toContain("T12");
});

test("test_YC7_1_NT4_KB4_hang_chon_thang_thang_10_la_T09_Thang_10_2026_T11_va_nut_mui_ten_cao_44", () => {
  const s = html(<HangChonThang thang="2026-10" onDoi={khong} />);
  expect(lien(s)).toBe("T09 Tháng 10/2026 T11");
  expect(s).toContain('aria-label="Tháng trước"');
  expect(s).toContain('aria-label="Tháng sau"');
  expect(s.match(/<button/g)).toHaveLength(4);
  // Cuối năm, đầu năm vẫn đúng: T12 sang T01
  expect(lien(html(<HangChonThang thang="2026-12" onDoi={khong} />))).toBe("T11 Tháng 12/2026 T01");
});

test("test_YC7_1_NT5_KB9_CN8_00_thang_chua_co_dat_phong_moi_so_0_khong_co_dong_phan_tram", async () => {
  const tk = await lay("2027-01");
  const v = lien(manDayDu(tk));
  expect(v).toContain("DOANH THU THÁNG 1 0đ Chưa có đặt phòng");
  expect(v).not.toMatch(/so với tháng/);
  expect(v).not.toContain("%  so");
  expect(v).toContain("PHÒNG 1509 0đ");
  expect(v).toContain("PHÒNG 3402 0đ");
  expect(v).toContain("ĐÊM CÓ KHÁCH 0 ");
  expect(v).toContain("CÔNG SUẤT 0%");
  expect(v).toContain("DOANH THU THEO NGƯỜI BÁN Chưa có đặt phòng trong tháng.");
  expect(chuDemCoKhach(tk)).toBe("0");
  // Tháng 12 của CN8-00 trên canvas có doanh thu 800.000đ (B9) nên đây là tháng 1/2027
});

test("test_YC7_1_NT3_tien_thang_truoc_bang_0_thi_khong_co_dong_phan_tram_YC7_H4", async () => {
  // Tháng 12/2026 có 800.000đ (B9) còn tháng 11 cũng 800.000đ: có phần trăm. Tháng 8/2026 chưa có số nào: kiểm bằng số tự dựng
  const tk: ThongKeChu = { ...(await lay("2026-10")), doanh_thu_thang_truoc: 0 };
  const v = lien(html(<TheDoanhThu tk={tk} />));
  expect(v).toBe("DOANH THU THÁNG 10 11.800.000đ");
});

test("test_YC7_2_NT1_NT2_KB10_bieu_do_6_cot_T5_den_T10_so_rut_gon_va_chi_cot_T10_dam", async () => {
  const s = html(<BieuDo6Thang tk={await lay("2026-10")} />);
  const cot = [...s.matchAll(/data-cot="([\d-]+)" data-dam="(\d)"/g)].map((m) => [m[1], m[2]]);
  expect(cot).toEqual([
    ["2026-05", "0"],
    ["2026-06", "0"],
    ["2026-07", "0"],
    ["2026-08", "0"],
    ["2026-09", "0"],
    ["2026-10", "1"],
  ]);
  const v = lien(s);
  expect(v).toContain("DOANH THU 6 THÁNG");
  expect(v).toContain("9.6tr");
  expect(v).toContain("11.8tr");
  expect(nhanCot(s)).toEqual(["T5", "T6", "T7", "T8", "T9", "T10"]);
  expect(soTrenCot(s)).toEqual(["", "", "", "", "9.6tr", "11.8tr"]);
  // Cột T10 là cột đậm duy nhất (US18-NT7)
  expect(s.match(/tk-bd__thanh--dam/g)).toHaveLength(1);
  expect(s.match(/tk-bd__nhan--dam/g)).toHaveLength(1);
});

test("test_YC7_2_NT1_cot_13_4tr_va_7_2tr_ghi_so_rut_gon_cua_so_dua_vao", () => {
  // DLM.5 giữ số canvas cho T5 đến T8 nhưng dlm.sql và server giả chưa có: dựng số để kiểm cách ghi
  const tk: ThongKeChu = {
    thang: "2026-10",
    doanh_thu: 11_800_000,
    doanh_thu_thang_truoc: 9_600_000,
    theo_can: [],
    dem_co_khach: 13,
    dem_co_khach_thang_truoc: 11,
    so_dem_trong_thang: 31,
    so_can_cong_suat: 2,
    theo_nguoi_ban: [],
    chuoi_thang: [
      { thang: "2026-05", doanh_thu: 7_200_000 },
      { thang: "2026-06", doanh_thu: 13_400_000 },
      { thang: "2026-07", doanh_thu: 0 },
      { thang: "2026-08", doanh_thu: 800_000 },
      { thang: "2026-09", doanh_thu: 9_600_000 },
      { thang: "2026-10", doanh_thu: 11_800_000 },
    ],
  };
  const s = html(<BieuDo6Thang tk={tk} />);
  expect(soTrenCot(s)).toEqual(["7.2tr", "13.4tr", "", "800k", "9.6tr", "11.8tr"]);
  // Cột 0đ không có thanh, không có số (mục "Doanh thu 6 tháng" (US18) trạng thái rỗng): 5 thanh cho 5 cột có tiền
  expect(s.match(/class="tk-bd__thanh/g)).toHaveLength(5);
  expect(s).toMatch(/data-cot="2026-07" data-dam="0" data-so="0"><span class="tk-bd__so"><\/span>/);
});

test("test_YC7_2_NT3_KB11_thang_12_bieu_do_T7_den_T12_cot_T12_dam_va_thang_11_la_T6_den_T11", async () => {
  const v12 = html(<BieuDo6Thang tk={await lay("2026-12")} />);
  expect([...v12.matchAll(/data-cot="([\d-]+)"/g)].map((m) => m[1])).toEqual(["2026-07", "2026-08", "2026-09", "2026-10", "2026-11", "2026-12"]);
  expect(v12).toMatch(/data-cot="2026-12" data-dam="1"/);
  const v11 = html(<BieuDo6Thang tk={await lay("2026-11")} />);
  expect([...v11.matchAll(/data-cot="([\d-]+)"/g)].map((m) => m[1])).toEqual(["2026-06", "2026-07", "2026-08", "2026-09", "2026-10", "2026-11"]);
  expect(nhanCot(v11)).toEqual(["T6", "T7", "T8", "T9", "T10", "T11"]);
});

test("test_YC7_3_NT1_KB12_bon_dong_nguoi_ban_giam_dan_khong_co_Sale_Nga", async () => {
  const s = html(<KhoiNguoiBan tk={await lay("2026-10")} />);
  expect(lien(s)).toBe("DOANH THU THEO NGƯỜI BÁN Sale Hùng 4.000.000đ Sale Lan 3.500.000đ Khách lẻ 2.600.000đ Sale Minh 1.700.000đ");
  expect(s).not.toContain("Sale Nga");
});

test("test_YC7_3_NT2_KB5_thang_11_chi_co_dong_Sale_Minh_800_000d_thang_nay_khong_co_Khach_le", async () => {
  expect(lien(html(<KhoiNguoiBan tk={await lay("2026-11")} />))).toBe("DOANH THU THEO NGƯỜI BÁN Sale Minh 800.000đ");
});

test("test_YC7_3_NT4_sale_da_rut_quyen_van_co_dong_kem_ghi_chu_do_Da_xoa_tai_khoan", async () => {
  const tk: ThongKeChu = {
    ...(await lay("2026-10")),
    theo_nguoi_ban: [
      { sale_id: "41", ten: "Sale Hùng", la_khach_le: false, da_xoa_tai_khoan: true, doanh_thu: 4_000_000 },
      { sale_id: null, ten: "Khách lẻ", la_khach_le: true, da_xoa_tai_khoan: false, doanh_thu: 2_600_000 },
    ],
  };
  const s = html(<KhoiNguoiBan tk={tk} />);
  expect(lien(s)).toBe("DOANH THU THEO NGƯỜI BÁN Sale Hùng Đã xoá tài khoản 4.000.000đ Khách lẻ 2.600.000đ");
  expect(s.match(/tk-ban__xoa/g)).toHaveLength(1);
});

test("test_YC7_3_NT3_KB15_man_cua_chu_nha_khong_co_gia_ban_chenh_va_dong_Hung_la_4_000_000d", async () => {
  const s = manDayDu(await lay("2026-10"));
  expect(lien(s)).toContain("Sale Hùng 4.000.000đ");
  expect(lien(s)).not.toContain("4.800.000đ");
  expect(lien(s).toLowerCase()).not.toMatch(/giá bán|chênh/);
});

test("test_YC7_4_chua_thu_chua_ve_khoi_CHUA_THU_TIEN_cho_Tung_chot_YC7_4_buoc_1", async () => {
  expect(lien(manDayDu(await lay("2026-10")))).not.toContain("CHƯA THU TIỀN");
});

test("test_HV1_khung_xam_dung_bo_cuc_cac_the_khong_co_so_0_gia", () => {
  const s = html(<KhungThongKeDangTai />);
  expect(s).toContain('aria-busy="true"');
  expect(s).toContain("khung-xam");
  expect(lien(s)).toBe("");
});

test("test_YC7_1_ba_can_moi_can_mot_the_theo_thu_tu_server_the_can_0d_van_co", async () => {
  const tk: ThongKeChu = {
    ...(await lay("2026-10")),
    theo_can: [
      { can_id: "1", ma_can: "1509", ten_toa_nha: "ICON40", doanh_thu: 6_700_000 },
      { can_id: "2", ma_can: "3402", ten_toa_nha: null, doanh_thu: 0 },
      { can_id: "3", ma_can: "0812", ten_toa_nha: "Green Bay", doanh_thu: 100_000 },
    ],
    so_can_cong_suat: 3,
  };
  expect(lien(html(<TheCan tk={tk} />))).toBe("PHÒNG 1509 6.700.000đ PHÒNG 3402 0đ PHÒNG 0812 100.000đ");
  expect(lien(html(<TheKin tk={tk} />))).toBe("ĐÊM CÓ KHÁCH 13/93 CÔNG SUẤT 14.0%");
});
