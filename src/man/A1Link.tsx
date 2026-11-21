// A1-link · Mở từ link mời, A1-link-01 · Link hỏng (YC6.3 bước 2, YC6-H5, H10, QD8, PQ1.LINK, PQ18.LINK).
// Như A1 (YC1.1) thêm thẻ mời; chỉ có "Bắt đầu ngay", không có chữ "Đăng nhập". Không có giá (database không trả).
import type { ReactNode } from 'react';
import { CAU_CHUA_TAI } from '../chung/matKetNoi';
import { chuDau } from './CN704ChiTietSale';
import { CAU_NHO_CHU_GUI, cauLinkHong, type XemTruocLink } from '../lib/dichVuLinkMoi';
import './A10ThemLich.css';

function IconTron(props: { children: ReactNode }) {
  return (
    <span className="a1-icon" aria-hidden="true">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
           strokeLinecap="round" strokeLinejoin="round">{props.children}</svg>
    </span>
  );
}

/** YC6.3 bước 2: thẻ mời; YC6-H10: thẻ link hỏng. */
export function TheMoi(props: { xemTruoc: XemTruocLink }) {
  const x = props.xemTruoc;
  if (x.trangThai !== 'hop_le') {
    return (
      <section className="a1l-the a1l-the--hong" role="alert">
        <span className="a1l-chu">
          <b className="a1l-tieu-de">{cauLinkHong(x.trangThai)}</b>
          <span className="a1l-phu">{CAU_NHO_CHU_GUI}</span>
        </span>
      </section>
    );
  }
  return (
    <section className="a1l-the" aria-label="Lời mời">
      <span className="a10-tron" aria-hidden="true">{chuDau(x.tenChu)}</span>
      <span className="a1l-chu">
        <b className="a1l-tieu-de">{`${x.tenChu} mời bạn xem lịch ${x.soCan} căn`}</b>
        <span className="a1l-phu">Bấm Bắt đầu ngay để xem lịch và giá mới nhất</span>
      </span>
    </section>
  );
}

/**
 * xemTruoc undefined: đang tải (chưa có thẻ, màn chào vẫn dùng được). onThuLai có: không tải được (HV2), thẻ có "Thử lại".
 */
export function A1Link(props: { xemTruoc?: XemTruocLink; onBatDau: () => void; onThuLai?: () => void }) {
  return (
    <main className="man man-a1">
      <div className="a1-dau">
        <h1 className="a1-logo" aria-label="Home247"><span aria-hidden="true">🏠</span></h1>
        <p className="a1-ten">Lịch phòng Hạ Long</p>
        <p className="a1-gioi-thieu">Lịch phòng và giá homestay, chia sẻ cho sale trong một chạm.</p>
      </div>
      {props.xemTruoc
        ? <TheMoi xemTruoc={props.xemTruoc} />
        : props.onThuLai && (
          <section className="a1l-the" role="alert">
            <span className="a1l-chu">
              <span className="a1l-phu">{CAU_CHUA_TAI}</span>
              <button type="button" className="hh-btn hh-btn--text" onClick={props.onThuLai}>Thử lại</button>
            </span>
          </section>
        )}
      <ul className="a1-ds">
        <li>
          <IconTron><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4" /><path d="M8 2v4" /><path d="M3 10h18" /></IconTron>
          <span>Ghi lịch các phòng nhanh hơn sổ tay</span>
        </li>
        <li>
          <IconTron><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /></IconTron>
          <span>Sale tự xem phòng trống, không cần gọi hỏi</span>
        </li>
        <li>
          <IconTron><path d="M22 2 11 13" /><path d="M22 2 15 22l-4-9-9-4 20-7z" /></IconTron>
          <span>Gửi ảnh và giá phòng cho khách trong vài giây</span>
        </li>
      </ul>
      <div className="man-chan a1-chan">
        <button type="button" className="hh-btn hh-btn--primary hh-btn--block" onClick={props.onBatDau}>Bắt đầu ngay</button>
        <span className="dong-dieu-khoan">
          Bằng việc tiếp tục, bạn đồng ý với <a href="/dieu-khoan">Điều khoản</a> và{' '}
          <a href="/chinh-sach-rieng-tu">Chính sách quyền riêng tư</a>.
        </span>
      </div>
    </main>
  );
}
