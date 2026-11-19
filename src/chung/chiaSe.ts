// HV6 · Trình duyệt thiếu tính năng; pwa.md P3.
export const CAU_DA_SAO_CHEP = 'Đã sao chép, dán vào Zalo để gửi';
export const CAU_THIEU_TINH_NANG = 'Trình duyệt này chưa làm được việc này. Mở app bằng Chrome hay Safari.';

export type KetQuaChiaSe = 'da-chia-se' | 'da-sao-chep' | 'khong-lam-duoc';

/** HV6 bước 1 và 2: chia sẻ chữ; không có bảng chia sẻ thì sao chép; không có gì thì báo, không đứng im. */
export async function guiChu(chu: string, hienToast: (s: string) => void): Promise<KetQuaChiaSe> {
  try {
    if (typeof navigator.share === 'function') {
      await navigator.share({ text: chu });
      return 'da-chia-se';
    }
  } catch (e) {
    if ((e as Error)?.name === 'AbortError') return 'da-chia-se'; // người dùng tự đóng bảng chia sẻ
  }
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(chu);
      hienToast(CAU_DA_SAO_CHEP);
      return 'da-sao-chep';
    }
  } catch { /* xuống nhánh báo */ }
  hienToast(CAU_THIEU_TINH_NANG);
  return 'khong-lam-duoc';
}
