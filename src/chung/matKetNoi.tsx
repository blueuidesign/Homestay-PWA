// HV2 · Mất mạng, lỗi kết nối; QT5.5 · Lỗi.
import { useEffect, useState } from 'react';

export const CAU_MAT_KET_NOI = 'Mất kết nối. Lịch có thể chưa mới nhất.';
export const CAU_CHUA_TAI = 'Chưa tải được. Kiểm tra mạng rồi bấm Thử lại';
export const CAU_CHUA_LUU = 'Chưa lưu được, bấm lại khi có mạng';
export const CAU_LOI_CHUNG = 'Có lỗi, chưa làm được. Bấm Thử lại';

/** HV2: biết mạng qua sự kiện online/offline. */
export function useOnline(): boolean {
  const [online, datOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine));
  useEffect(() => {
    const bat = () => datOnline(true);
    const tat = () => datOnline(false);
    window.addEventListener('online', bat);
    window.addEventListener('offline', tat);
    return () => {
      window.removeEventListener('online', bat);
      window.removeEventListener('offline', tat);
    };
  }, []);
  return online;
}

/** HV2 bước 1 và 4: dải đầu màn, tự mất khi có mạng. */
export function DaiMatKetNoi() {
  const online = useOnline();
  if (online) return null;
  return <div className="dai-mat-ket-noi" role="alert">{CAU_MAT_KET_NOI}</div>;
}

/** Lỗi database có câu tiếng Việt cho người dùng (QT5.5) mang cờ này. */
export class LoiNguoiDung extends Error {
  readonly loaiLoi = 'nguoi-dung';
}

/** HV2 bước 3 và 5, QT5.5: câu hiện cho người dùng, không bao giờ chữ kỹ thuật. */
export function cauBaoLoi(loi: unknown, online: boolean = typeof navigator === 'undefined' || navigator.onLine): string {
  if (!online) return CAU_CHUA_LUU;
  if (loi instanceof LoiNguoiDung && loi.message) return loi.message;
  return CAU_LOI_CHUNG;
}

/** HV2 bước 2: màn chưa từng xem mà không tải được. */
export function ManChuaTai({ onThuLai }: { onThuLai: () => void }) {
  return (
    <div className="man-loi" role="alert">
      <p>{CAU_CHUA_TAI}</p>
      <button type="button" onClick={onThuLai}>Thử lại</button>
    </div>
  );
}
