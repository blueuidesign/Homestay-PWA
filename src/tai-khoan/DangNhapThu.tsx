// Màn "Đăng nhập thử" của bản thử (EN3). YC1.2 (bảng bước bản thử), QT5.5, HV2 bước 5
import { useState, type FormEvent } from 'react';
import type { KetQuaDangNhap } from './phien';

const CAU_SAI = 'Email hoặc mật khẩu chưa đúng.';
const CAU_LOI = 'Có lỗi, chưa làm được. Bấm Thử lại';

export function DangNhapThu({ dangNhap }: { dangNhap: (email: string, matKhau: string) => Promise<KetQuaDangNhap> }) {
  const [email, setEmail] = useState('');
  const [matKhau, setMatKhau] = useState('');
  const [dangGui, setDangGui] = useState(false);
  const [ketQua, setKetQua] = useState<KetQuaDangNhap | null>(null);

  async function gui(e: FormEvent) {
    e.preventDefault();
    if (dangGui) return;
    setDangGui(true);
    setKetQua(null);
    let kq: KetQuaDangNhap;
    try {
      kq = await dangNhap(email.trim(), matKhau);
    } catch {
      kq = 'loi';
    }
    setKetQua(kq);
    setDangGui(false);
  }

  return (
    <main className="dang-nhap-thu">
      <h1>Đăng nhập thử</h1>
      <form onSubmit={gui} noValidate>
        <label htmlFor="dn-email">Email</label>
        <input id="dn-email" type="email" autoComplete="username" inputMode="email" value={email}
          onChange={(e) => setEmail(e.target.value)} required />
        <label htmlFor="dn-mat-khau">Mật khẩu</label>
        <input id="dn-mat-khau" type="password" autoComplete="current-password" value={matKhau}
          onChange={(e) => setMatKhau(e.target.value)} required />
        {ketQua === 'sai' && <p role="alert" className="loi">{CAU_SAI}</p>}
        {ketQua === 'loi' && <p role="alert" className="loi">{CAU_LOI}</p>}
        <button type="submit" disabled={dangGui}>{ketQua === 'loi' ? 'Thử lại' : 'Đăng nhập'}</button>
      </form>
      <p className="ghi-chu">Chỉ dùng cho bản thử.</p>
    </main>
  );
}
