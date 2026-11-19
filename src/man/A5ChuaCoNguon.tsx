// A5 · Sale mới, chưa có nguồn phòng (YC6.4 bước 1, canvas A5). "Thêm căn thủ công" là chỗ chờ của US56.
import type { ReactNode } from 'react';
import { Icon, ICON_THEM } from './TabChu';
import './A5ChuaCoNguon.css';

/** Khung tab Lịch của sale chưa có nguồn: tiêu đề "Lịch phòng", thân cuộn, phần chân (bản tạm: vai, đăng xuất). */
export function KhungLichSale(props: { children: ReactNode; chan?: ReactNode }) {
  return (
    <div className="man man-chu">
      <header className="chu-dau"><h1 className="chu-tieu-de">Lịch phòng</h1></header>
      <div className="chu-than xl-than">{props.children}{props.chan}</div>
    </div>
  );
}

export function A5ChuaCoNguon(props: { onXinLich: () => void; onThemCan: () => void; chan?: ReactNode }) {
  return (
    <KhungLichSale chan={props.chan}>
      <section className="xl-the" aria-label="Chưa có nguồn phòng">
        <h2 className="xl-tieu-de">Chưa có nguồn phòng</h2>
        <p className="xl-cau">Xin chủ nhà gửi link mời để thấy lịch phòng trống. Chủ chưa dùng app thì tự nhập căn.</p>
        <button type="button" className="hh-btn hh-btn--primary hh-btn--block" onClick={props.onXinLich}>
          Gửi tin nhắn xin lịch đến chủ nhà
        </button>
      </section>
      <button type="button" className="xl-the xl-the-nut" onClick={props.onThemCan}>
        <span className="xl-tron" aria-hidden="true"><Icon co={20}>{ICON_THEM}</Icon></span>
        <span className="xl-chu">
          <span className="xl-dong-dam">Thêm căn thủ công</span>
          <span className="xl-phu">Căn của chủ nhà chưa dùng app, hoặc căn của chính bạn. Căn tự nhập không có lịch trống: hỏi chủ nhà mỗi lần khách hỏi.</span>
        </span>
      </button>
      <p className="xl-goi-y">
        <b>Chủ nhà đã gửi link?</b> <span>Mở link trong tin nhắn Zalo của chủ nhà, lịch sẽ hiện ở đây.</span>
      </p>
    </KhungLichSale>
  );
}
