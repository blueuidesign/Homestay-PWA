import type { Can } from "../services/kieu";
import { chuTien } from "../services/ngay";

// Giá viết ngắn trên ô tháng và lịch giá (CN6): 800k, 1,1tr, 1,3tr, 2,5tr
export const chuGiaNgan = (n: number) => {
  if (n < 1_000_000) return `${Math.round(n / 1000)}k`;
  const tr = Math.round((n / 1_000_000) * 100) / 100;
  return `${String(tr).replace(".", ",")}tr`;
};

// Ô tháng (mục "Đặt giá theo tháng" (US4) bước 1): "800k–1,3tr", một giá thì ghi một giá, chưa có giá thì "Chưa đặt"
export const chuKhoangThang = (thap: number | null, cao: number | null) =>
  thap === null || cao === null ? "Chưa đặt" : thap === cao ? chuGiaNgan(thap) : `${chuGiaNgan(thap)}–${chuGiaNgan(cao)}`;

// Thẻ căn (US4-NT2, quy tắc Giá tuần này): "900.000đ – 1.300.000đ"
export const chuKhoangTuan = (g: NonNullable<Can["gia_tuan_nay"]>) =>
  g.thap_nhat === g.cao_nhat ? `${chuTien(g.thap_nhat)}đ` : `${chuTien(g.thap_nhat)}đ – ${chuTien(g.cao_nhat)}đ`;

// Chọn tháng ở CN6 (CN6.md Hành động): chạm một ô để chọn, chạm tiếp ô khác để chọn cả khoảng.
// Đang chọn một tháng mà chạm lại chính nó thì bỏ chọn. Đã chọn khoảng thì chạm ô nào cũng bắt đầu chọn lại.
// Trả về các số tháng 1 đến 12, tăng dần, liền nhau.
export const chonThang = (dangChon: number[], so: number): number[] => {
  if (dangChon.length === 0) return [so];
  if (dangChon.length === 1) {
    if (dangChon[0] === so) return [];
    const [a, b] = [Math.min(dangChon[0], so), Math.max(dangChon[0], so)];
    return Array.from({ length: b - a + 1 }, (_, i) => a + i);
  }
  return [so];
};

// "Tháng 11 – 12", "Tháng 10"
export const chuCacThang = (so: number[]) =>
  so.length === 0 ? "" : so.length === 1 ? `Tháng ${so[0]}` : `Tháng ${so[0]} – ${so[so.length - 1]}`;
