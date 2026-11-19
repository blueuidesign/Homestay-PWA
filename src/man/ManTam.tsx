// Bản tối thiểu của A3 (YC1.1, US1 làm đầy đủ), tab Lịch (US1 và các US lịch) và màn link (US37), đủ để luồng YC1.2 chạy.
export function A3ChonVai(props: { onDangXuat: () => void }) {
  return (
    <main className="man man-tam">
      <h1 className="man-tieu-de">Bạn dùng app để làm gì?</h1>
      <button type="button" className="hh-btn hh-btn--text" onClick={props.onDangXuat}>Đăng xuất</button>
    </main>
  );
}

export function ManLich(props: { onDangXuat: () => void }) {
  return (
    <main className="man man-tam">
      <h1 className="man-tieu-de">Lịch</h1>
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
