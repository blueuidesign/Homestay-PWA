// Luồng chưa đăng nhập: A2 (Tạo tài khoản), A11 (Đăng nhập), nhập mã (A2-02..A2-04, A11-02). YC1.2, QD22.
import { useState } from 'react';
import { NutGhi } from '../chung/dangTai';
import { cauBaoLoi } from '../chung/matKetNoi';
import { kiemEmail, kiemFormDangKy, type LoiForm } from '../lib/kiemDangKy';
import type { DichVuXacThuc } from '../lib/xacThuc';
import { DongDieuKhoan, KhungMan, O } from './khung';
import { NhapMa } from './NhapMa';
import { docBanNhapDangKy, ghiBanNhapDangKy } from './banNhap';

type Buoc =
  | { man: 'A2' }
  | { man: 'A11'; chuaCo: boolean }
  | { man: 'ma'; luong: 'dang-ky' | 'dang-nhap'; guiLuc: number };

export function LuongDangNhap(props: {
  dichVu: DichVuXacThuc;
  batDau: 'A2' | 'A11';
  onVeA1: () => void;
  /** Gọi khi đã có phiên (và với luồng tạo tài khoản: đã gọi lệnh đăng ký, kể cả khi bị từ chối). */
  onDaDangNhap: (loiDangKy?: unknown) => void;
}) {
  const nhap = docBanNhapDangKy();
  const [buoc, datBuoc] = useState<Buoc>(props.batDau === 'A2' ? { man: 'A2' } : { man: 'A11', chuaCo: false });
  const [ten, datTen] = useState(nhap?.ten ?? '');
  const [so, datSo] = useState(nhap?.so ?? '');
  const [email, datEmail] = useState(nhap?.email ?? '');
  const [loi, datLoi] = useState<LoiForm>({});
  const [loiChung, datLoiChung] = useState<string | null>(null);
  // A2-01: email đã có tài khoản; mã đăng nhập đã gửi lúc kiểm (giờ gửi), nút "Đăng nhập bằng email này" dùng luôn.
  const [emailDaCo, datEmailDaCo] = useState<number | null>(null);

  const doiEmail = (v: string) => { datEmail(v); datEmailDaCo(null); datLoi((l) => ({ ...l, email: undefined })); };

  // YC1.2 bước 2, 3.
  const guiMaTaoTaiKhoan = async () => {
    datLoiChung(null);
    const l = kiemFormDangKy({ ten, so, email });
    datLoi(l);
    datEmailDaCo(null);
    if (Object.keys(l).length) return; // YC1.2-NT13: ô sai thì không gửi mã
    try {
      // Hỏi Supabase Auth gửi mã mà không tạo tài khoản: gửi được nghĩa là email đã có tài khoản (A2-01).
      if ((await props.dichVu.guiMa(email, false)) === 'da-gui') {
        datEmailDaCo(Date.now());
        return;
      }
      await props.dichVu.guiMa(email, true);
      ghiBanNhapDangKy({ ten, so, email });
      datBuoc({ man: 'ma', luong: 'dang-ky', guiLuc: Date.now() });
    } catch (e) {
      datLoiChung(cauBaoLoi(e));
    }
  };

  const guiMaDangNhap = async () => {
    datLoiChung(null);
    const le = kiemEmail(email);
    datLoi(le ? { email: le } : {});
    if (le) return;
    try {
      if ((await props.dichVu.guiMa(email, false)) === 'chua-co-tai-khoan') {
        datBuoc({ man: 'A11', chuaCo: true }); // YC1.2-NT12: không tạo tài khoản
        return;
      }
      datBuoc({ man: 'ma', luong: 'dang-nhap', guiLuc: Date.now() });
    } catch (e) {
      datLoiChung(cauBaoLoi(e));
    }
  };

  if (buoc.man === 'ma') {
    const luong = buoc.luong;
    return (
      <NhapMa
        luong={luong}
        email={email.trim()}
        guiLuc={buoc.guiLuc}
        onXacNhan={async (ma) => {
          const kq = await props.dichVu.xacNhanMa(email, ma);
          if (kq === 'sai') return kq;
          if (luong === 'dang-ky') {
            // YC1.2 bước 4: ghi tên và số. Bị từ chối (bước 5) thì App về màn nhập số với lỗi dưới ô.
            let loiDk: unknown;
            try { await props.dichVu.dangKy(ten, so); } catch (e) { loiDk = e; }
            props.onDaDangNhap(loiDk);
          } else {
            props.onDaDangNhap();
          }
          return kq;
        }}
        onGuiLai={async () => {
          await props.dichVu.guiMa(email, luong === 'dang-ky');
          datBuoc({ man: 'ma', luong, guiLuc: Date.now() });
        }}
        onDoiEmail={() => datBuoc(luong === 'dang-ky' ? { man: 'A2' } : { man: 'A11', chuaCo: false })}
      />
    );
  }

  if (buoc.man === 'A11') {
    return (
      <KhungMan tieuDe="Đăng nhập" onQuayLai={props.onVeA1}>
        <p className="dong-phu">Nhập email bạn đã dùng khi tạo tài khoản. App gửi mã 6 số về email đó.</p>
        <O nhan="Email" kieu="email" tuDien="email" viDu="Ví dụ: tenban@gmail.com" giaTri={email}
           onDoi={(v) => { doiEmail(v); if (buoc.chuaCo) datBuoc({ man: 'A11', chuaCo: false }); }}
           loi={buoc.chuaCo ? 'Email này chưa có tài khoản. Kiểm tra lại chính tả, hoặc tạo tài khoản mới.' : loi.email} />
        {buoc.chuaCo && (
          <button type="button" className="hh-btn hh-btn--secondary hh-btn--block"
                  onClick={() => { datLoi({}); datBuoc({ man: 'A2' }); }}>Tạo tài khoản với email này</button>
        )}
        {loiChung && <p className="cau-loi" role="alert">{loiChung}</p>}
        <div className="man-chan">
          <NutGhi chu="Gửi mã đăng nhập" chuDangGhi="Đang gửi…" onGhi={guiMaDangNhap} />
          <button type="button" className="hh-btn hh-btn--text"
                  onClick={() => { datLoi({}); datBuoc({ man: 'A2' }); }}>Chưa có tài khoản? Tạo tài khoản</button>
        </div>
      </KhungMan>
    );
  }

  return (
    <KhungMan tieuDe="Tạo tài khoản" onQuayLai={props.onVeA1}>
      <p className="dong-phu">Sale và chủ nhà sẽ thấy tên và số điện thoại này khi kết nối với bạn.</p>
      <O nhan="Họ và tên" tuDien="name" viDu="Ví dụ: Nguyễn Thị Hoa" giaTri={ten} loi={loi.ten}
         onDoi={(v) => { datTen(v); datLoi((l) => ({ ...l, ten: undefined })); }} />
      <O nhan="Số điện thoại" kieu="tel" tuDien="tel" viDu="Ví dụ: 0912 345 678" giaTri={so} loi={loi.so}
         onDoi={(v) => { datSo(v); datLoi((l) => ({ ...l, so: undefined })); }} />
      <O nhan="Email" kieu="email" tuDien="email" viDu="Ví dụ: tenban@gmail.com" giaTri={email}
         loi={emailDaCo !== null ? 'Email này đã có tài khoản.' : loi.email}
         goiY="Mỗi lần đăng nhập, app gửi mã về email này. Không cần mật khẩu." onDoi={doiEmail} />
      {emailDaCo !== null && (
        <button type="button" className="hh-btn hh-btn--secondary hh-btn--block"
                onClick={() => datBuoc({ man: 'ma', luong: 'dang-nhap', guiLuc: emailDaCo })}>Đăng nhập bằng email này</button>
      )}
      {loiChung && <p className="cau-loi" role="alert">{loiChung}</p>}
      <div className="man-chan">
        <NutGhi chu="Gửi mã xác nhận" chuDangGhi="Đang gửi…" onGhi={guiMaTaoTaiKhoan} />
        <DongDieuKhoan />
        <button type="button" className="hh-btn hh-btn--text"
                onClick={() => { datLoi({}); datEmailDaCo(null); datBuoc({ man: 'A11', chuaCo: false }); }}>Đã có tài khoản? Đăng nhập</button>
      </div>
    </KhungMan>
  );
}
