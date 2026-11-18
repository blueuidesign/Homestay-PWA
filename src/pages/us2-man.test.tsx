import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, test } from "vitest";
import type { LichNgay, LichThang } from "../services/kieu";
import { ChiTietNgay, ChuaCoDatPhong, ChuaTaiDuoc, LuoiLichThang } from "./cn1-lich-thang";

// Test render CN1, CN1-00, CN1-02, CN3 bằng các phần vẽ (không router, không window). Số theo DLM.
const khong = () => {};
const html = (el: React.ReactElement) => renderToStaticMarkup(el);
const chu = (s: string) => s.replace(/<[^>]+>/g, "|").replace(/&quot;/g, '"');

const lich = (maCan: string[], them: Partial<LichThang> = {}): LichThang => ({
  thang: "2026-10",
  can: maCan.map((ma, i) => ({ can_id: `can-${i + 1}`, ma_can: ma })),
  ngay: [],
  co_dat_phong_nao: false,
  ...them,
});

const luoi = (l: LichThang, p: Partial<React.ComponentProps<typeof LuoiLichThang>> = {}) =>
  html(
    <LuoiLichThang
      lich={l}
      homNay="2026-10-07"
      ngayChon={null}
      canChon={null}
      onChonNgay={khong}
      onDoiThang={khong}
      onChonCan={khong}
      {...p}
    />,
  );

const chips = (s: string) => [...s.matchAll(/<button[^>]*class="hh-chip[^"]*"[^>]*>(.*?)<\/button>/g)].map((m) => chu(m[1]).replace(/\|/g, ""));

test("test_YC2_1_NT1_hai_can_chip_ca_2_phong", () => {
  const s = luoi(lich(["1509", "3402"]));
  expect(chips(s)).toEqual(["Cả 2 phòng", "1509", "3402"]);
  // Chip đầu đang chọn; chip căn mang màu căn thứ nhất, thứ hai
  expect(s).toContain('class="hh-chip hh-chip--neutral hh-chip--on"');
  expect(s).toContain("hh-chip--r1509");
  expect(s).toContain("hh-chip--r3402");
  // US2-KB1: thanh tháng
  expect(chu(s)).toContain("|T09|");
  expect(chu(s)).toContain("|Tháng 10/2026|");
  expect(chu(s)).toContain("|T11|");
});

test("test_YC2_1_NT2_ba_can_chip_tat_ca", () => {
  const s = luoi(lich(["1509", "3402", "2501"]));
  expect(chips(s)).toEqual(["Tất cả", "1509", "3402", "2501"]);
  expect(s).not.toContain("Cả 2 phòng");
  expect(s).toContain("hh-chip--r2501");
});

test("test_YC2_1_NT5_chua_co_dat_phong_khong_to_ngay_nao", () => {
  const s = luoi(lich(["1509", "3402"]));
  expect(s).not.toMatch(/hh-bar--r\d/);
  // Không có chú thích "đã đặt" khi chưa có đặt phòng (CN1-00)
  expect(s).not.toContain("đã đặt");
  const rong = chu(html(<ChuaCoDatPhong onDatPhong={khong} />));
  expect(rong).toContain("Chưa có đặt phòng nào");
  expect(rong).toContain('Bấm "Đặt phòng" để thêm khách đầu tiên. Ngày có khách sẽ tô màu theo phòng.');
  expect(rong).toContain("|Đặt phòng|");
  expect(rong).toContain("Mời sale xem lịch để sale tự biết ngày trống, không phải gọi hỏi. Vào tab Sale.");
});

test("test_YC2_tuan_bat_dau_thu_hai_luoi_thang", () => {
  const s = luoi(lich(["1509", "3402"]));
  const thu = [...s.matchAll(/class="lich-thang__thu">(.*?)</g)].map((m) => m[1]);
  expect(thu).toEqual(["T2", "T3", "T4", "T5", "T6", "T7", "CN"]);
  // Ba ô trống trước ngày 1 (T5)
  expect(s).toContain('CN</div><div></div><div></div><div></div><button');
  // Mỗi ô ngày có một vạch cho mỗi căn; hôm nay 07/10 được đánh dấu
  expect(s.match(/class="hh-cell__bar /g)).toHaveLength(31 * 2);
  expect(s).toMatch(/class="hh-cell hh-cell--today"[^>]*aria-label="Ngày 07\/10\/2026"/);
});

test("test_YC2_4_NT1_ngay_chon_va_chi_tiet_ngay", () => {
  const s = luoi(lich(["1509", "3402"]), { ngayChon: "2026-10-10" });
  expect(s).toMatch(/class="hh-cell hh-cell--selected"[^>]*aria-label="Ngày 10\/10\/2026"/);
  expect(s.match(/hh-cell--selected/g)).toHaveLength(1);
  const ngay: LichNgay = {
    ngay: "2026-10-10",
    can: [
      { can_id: "can-1", ma_can: "1509", trong: true, dat_phong: null },
      { can_id: "can-2", ma_can: "3402", trong: true, dat_phong: null },
    ],
  };
  const ct = chu(html(<ChiTietNgay ngay="2026-10-10" lich={ngay} canTheoThuTu={lich(["1509", "3402"]).can} loi={false} onThuLai={khong} />));
  expect(ct).toContain("|Ngày 10/10/2026|");
  expect(ct).toContain("Phòng 1509");
  expect(ct).toContain("Phòng 3402");
  // US2-KB5: ngày đầu, cuối tháng
  for (const [n, chuNgay] of [["2026-10-01", "Ngày 01/10/2026"], ["2026-10-31", "Ngày 31/10/2026"]]) {
    expect(chu(html(<ChiTietNgay ngay={n} lich={null} canTheoThuTu={[]} loi={false} onThuLai={khong} />))).toContain(chuNgay);
  }
});

test("test_YC2_4_NT1_tieu_de_ngay_hien_ngay_truoc_khi_co_ket_qua", () => {
  // Chạm là hiện ngay ngày đã chạm, khối từng căn là khung xám tới khi server trả
  const s = html(<ChiTietNgay ngay="2026-10-11" lich={null} canTheoThuTu={lich(["1509", "3402"]).can} loi={false} onThuLai={khong} />);
  expect(chu(s)).toContain("|Ngày 11/10/2026|");
  expect(s.match(/khung-xam/g)).toHaveLength(2);
});

test("test_HV2_chua_tai_duoc_co_nut_thu_lai", () => {
  expect(chu(html(<ChuaTaiDuoc matMang onThuLai={khong} />))).toContain("Chưa tải được. Kiểm tra mạng rồi bấm Thử lại|");
  expect(chu(html(<ChuaTaiDuoc matMang={false} onThuLai={khong} />))).toContain("Có lỗi, chưa làm được. Bấm Thử lại");
});
