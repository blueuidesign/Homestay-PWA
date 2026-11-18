// Phép tính phía app của màn Thống kê chủ nhà (US18-TA3, CN8). Server trả số gốc (api/thong-bao-thong-ke-xuat.md GET /thong-ke/chu).
// Hàm thuần, không gọi server. Tiền là số nguyên đồng.

// Phần trăm so với tháng trước làm tròn một số lẻ (YC7.1-NT3, YC7 quy tắc So với tháng trước): (nay - trước) / trước × 100.
// Tháng trước bằng 0 thì chia không được: trả null, màn không có dòng phần trăm [MỞ: YC7-H4].
// Làm tròn nửa lên theo độ lớn (âm cũng vậy) để +x và −x đối xứng.
export const phanTramSoVoiThangTruoc = (nay: number, truoc: number): number | null => {
  if (truoc <= 0) return null;
  const x = ((nay - truoc) / truoc) * 100;
  const tron = Math.round(Math.abs(x) * 10 + 1e-9) / 10;
  return x < 0 ? -tron : tron;
};

// "+22.9%", "−93.2%" (dấu trừ U+2212 như kịch bản KB4), "0.0%" khi không đổi
export const chuPhanTram = (p: number): string => {
  const so = Math.abs(p).toFixed(1);
  return p > 0 ? `+${so}%` : p < 0 ? `−${so}%` : `${so}%`;
};

// Công suất = số đêm có khách chia (số căn × số đêm trong tháng) (YC7.1-NT2, YC7 quy tắc Công suất). Mẫu số 0 thì 0.
// Trả phần trăm làm tròn một số lẻ: 13 / 62 = 21.0. Mẫu số khi giữa tháng thêm hay ẩn căn: [MỞ: YC7-H7], app theo `so_can_cong_suat` của server.
export const congSuat = (demCoKhach: number, soCan: number, soDemTrongThang: number): number => {
  const mau = soCan * soDemTrongThang;
  if (mau <= 0 || demCoKhach <= 0) return 0;
  return Math.round((demCoKhach / mau) * 1000 + 1e-9) / 10;
};

// "21.0%"; công suất 0 ghi "0%" (CN8-00)
export const chuCongSuat = (p: number): string => (p === 0 ? "0%" : `${p.toFixed(1)}%`);

// Số rút gọn trên đầu cột biểu đồ (YC7.2-NT1): 13.400.000 thành "13.4tr", 7.200.000 thành "7.2tr", 800.000 thành "800k".
// Cột 0đ không có số (YC7.2, trạng thái rỗng): trả chuỗi rỗng.
export const chuSoRutGon = (n: number): string => {
  if (n <= 0) return "";
  if (n < 1_000_000) return `${Math.round(n / 1000)}k`;
  return `${(Math.round(n / 100_000) / 10).toFixed(1)}tr`;
};
