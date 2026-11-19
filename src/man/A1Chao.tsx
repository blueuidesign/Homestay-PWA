// A1 · Chào mừng (YC1.1 bước 1, 2). Không hỏi gì, không xin quyền gì (HV4, QD22). Điều khoản, chính sách ở YC15 (chưa làm: link để #).
import type { ReactNode } from 'react';

function IconTron(props: { children: ReactNode }) {
  return (
    <span className="a1-icon" aria-hidden="true">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
           strokeLinecap="round" strokeLinejoin="round">{props.children}</svg>
    </span>
  );
}

export function A1Chao(props: { onTaoTaiKhoan: () => void; onDangNhap: () => void }) {
  return (
    <main className="man man-a1">
      <div className="a1-dau">
        <h1 className="a1-logo" aria-label="Home247"><span aria-hidden="true">🏠</span></h1>
        <p className="a1-ten">Lịch phòng Hạ Long</p>
        <p className="a1-gioi-thieu">Lịch phòng và giá homestay, chia sẻ cho sale trong một chạm.</p>
      </div>
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
        <button type="button" className="hh-btn hh-btn--primary hh-btn--block" onClick={props.onTaoTaiKhoan}>Tạo tài khoản</button>
        <button type="button" className="hh-btn hh-btn--secondary hh-btn--block" onClick={props.onDangNhap}>Tôi đã có tài khoản · Đăng nhập</button>
        <span className="dong-dieu-khoan">
          Bằng việc tiếp tục, bạn đồng ý với <a href="#">Điều khoản</a> và{' '}
          <a href="#">Chính sách quyền riêng tư</a>.
        </span>
      </div>
    </main>
  );
}
