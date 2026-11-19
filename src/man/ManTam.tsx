// Tab Lịch bản tạm (US1: tiêu đề "Lịch" và vai đang dùng; A4, A5 làm ở YC3.1, YC7.1) và màn link (US37), đủ để luồng YC1 chạy.
import type { Vai } from '../lib/dieuHuong';

export const TEN_VAI: Record<Vai, string> = { chu_nha: 'Chủ nhà', sale: 'Sale' };

/** YC1.1 bước 5, 6: tab Lịch của vai đã chọn. */
export function ManLich(props: { vai: Vai | null; onDangXuat: () => void }) {
  return (
    <main className="man man-tam">
      <h1 className="man-tieu-de">Lịch</h1>
      {props.vai && <p className="dong-phu">{TEN_VAI[props.vai]}</p>}
      <button type="button" className="hh-btn hh-btn--text" onClick={props.onDangXuat}>Đăng xuất</button>
    </main>
  );
}

/** QD8, pwa.md P4: link mời, link xin lịch xem được khi chưa đăng nhập. Nội dung làm ở US37. */
export function XemTruocLink(props: { daDangNhap: boolean; onBatDau: () => void; onVeLich: () => void }) {
  return (
    <main className="man man-tam">
      <h1 className="man-tieu-de">Home247</h1>
      {props.daDangNhap
        ? <button type="button" className="hh-btn hh-btn--primary hh-btn--block" onClick={props.onVeLich}>Về Lịch</button>
        : <button type="button" className="hh-btn hh-btn--primary hh-btn--block" onClick={props.onBatDau}>Bắt đầu ngay</button>}
    </main>
  );
}
