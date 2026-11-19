// A1 · Chào mừng (YC1.1 phần tối thiểu cho US2; US1 làm đầy đủ). Không hỏi gì, không xin quyền gì (HV4).
export function A1Chao(props: { onTaoTaiKhoan: () => void; onDangNhap: () => void }) {
  return (
    <main className="man man-a1">
      <div className="a1-dau">
        <h1>Home247</h1>
        <p className="a1-ten">Lịch phòng Hạ Long</p>
        <p>Lịch phòng và giá homestay, chia sẻ cho sale trong một chạm.</p>
        <ul>
          <li>Ghi lịch các phòng nhanh hơn sổ tay</li>
          <li>Sale tự xem phòng trống, không cần gọi hỏi</li>
          <li>Gửi ảnh và giá phòng cho khách trong vài giây</li>
        </ul>
      </div>
      <div className="man-chan">
        <button type="button" className="hh-btn hh-btn--primary hh-btn--block" onClick={props.onTaoTaiKhoan}>Tạo tài khoản</button>
        <button type="button" className="hh-btn hh-btn--text" onClick={props.onDangNhap}>Tôi đã có tài khoản · Đăng nhập</button>
        <span className="dong-dieu-khoan">
          Bằng việc tiếp tục, bạn đồng ý với <a href="#">Điều khoản</a> và <a href="#">Chính sách quyền riêng tư</a>.
        </span>
      </div>
    </main>
  );
}
