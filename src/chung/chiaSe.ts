// HV6 · Trình duyệt thiếu tính năng; pwa.md P3.
export const CAU_DA_SAO_CHEP = 'Đã sao chép, dán vào Zalo để gửi';
export const CAU_THIEU_TINH_NANG = 'Trình duyệt này chưa làm được việc này. Mở app bằng Chrome hay Safari.';

export type KetQuaChiaSe = 'da-chia-se' | 'da-sao-chep' | 'da-tai-ve' | 'khong-lam-duoc';

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

/** YC8.1 bước 6, YC8-H3: chỉ sao chép (không mở bảng chia sẻ), báo câu `cauXong`; không sao chép được thì báo HV6 bước 2. */
export async function saoChepChu(chu: string, cauXong: string, hienToast: (s: string) => void): Promise<KetQuaChiaSe> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(chu);
      hienToast(cauXong);
      return 'da-sao-chep';
    }
  } catch { /* xuống nhánh báo */ }
  hienToast(CAU_THIEU_TINH_NANG);
  return 'khong-lam-duoc';
}

/** YC8.1 bước 5: "Đã lưu 6 ảnh vào máy. Mở Zalo để gửi ảnh." */
export function cauDaLuuAnh(so: number): string {
  return `Đã lưu ${so} ảnh vào máy. Mở Zalo để gửi ảnh.`;
}

/**
 * YC8.1 bước 5, HV6 bước 1, pwa.md P3: gửi ảnh bằng bảng chia sẻ khi trình duyệt cho gửi file; không cho thì tải ảnh về máy
 * và báo; không làm được gì thì báo HV6 bước 2.
 */
export async function guiAnh(files: File[], hienToast: (s: string) => void): Promise<KetQuaChiaSe> {
  try {
    if (typeof navigator.share === 'function' && typeof navigator.canShare === 'function' && navigator.canShare({ files })) {
      await navigator.share({ files });
      return 'da-chia-se';
    }
  } catch (e) {
    if ((e as Error)?.name === 'AbortError') return 'da-chia-se';
  }
  try {
    if (typeof URL.createObjectURL === 'function') {
      for (const f of files) {
        const url = URL.createObjectURL(f);
        const a = document.createElement('a');
        a.href = url;
        a.download = f.name;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 10_000);
      }
      hienToast(cauDaLuuAnh(files.length));
      return 'da-tai-ve';
    }
  } catch { /* xuống nhánh báo */ }
  hienToast(CAU_THIEU_TINH_NANG);
  return 'khong-lam-duoc';
}

/** YC1.6 bước 6: báo sau khi tải file về máy. */
export const CAU_DA_TAI_FILE = 'Đã tải file về máy';

/**
 * YC1.6 bước 6, pwa.md P3: mở bảng chia sẻ với file khi trình duyệt cho gửi file; không cho thì tải file về máy và báo;
 * không làm được gì thì báo HV6 bước 2.
 */
export async function guiFile(file: File, hienToast: (s: string) => void): Promise<KetQuaChiaSe> {
  try {
    if (typeof navigator.share === 'function' && typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file] });
      return 'da-chia-se';
    }
  } catch (e) {
    if ((e as Error)?.name === 'AbortError') return 'da-chia-se';
  }
  try {
    if (typeof URL.createObjectURL === 'function') {
      const url = URL.createObjectURL(file);
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10_000);
      hienToast(CAU_DA_TAI_FILE);
      return 'da-tai-ve';
    }
  } catch { /* xuống nhánh báo */ }
  hienToast(CAU_THIEU_TINH_NANG);
  return 'khong-lam-duoc';
}
