// A2-02, A2-03, A2-04 (luồng tạo tài khoản) và A11-02 (luồng đăng nhập): nhập mã 6 số gửi về email (YC1.2, YC1-H12).
import { useEffect, useRef, useState } from 'react';
import { NutGhi } from '../chung/dangTai';
import { cauBaoLoi } from '../chung/matKetNoi';
import { useToast } from '../chung/Toast';
import { kiemMa } from '../lib/kiemDangKy';
import { CHO_GUI_LAI_MS, HAN_MA_MS } from '../lib/xacThuc';
import { KhungMan } from './khung';

export const CAU_MA_SAI = 'Mã chưa đúng. Kiểm tra lại thư mới nhất, hoặc bấm "Gửi lại mã".';
export const CAU_MA_HET_HAN = 'Mã này đã hết hạn hoặc đã dùng rồi. Bấm "Gửi lại mã" để nhận mã mới.';

export function NhapMa(props: {
  luong: 'dang-ky' | 'dang-nhap';
  email: string;
  guiLuc: number;
  onXacNhan: (ma: string) => Promise<'dung' | 'sai'>;
  onGuiLai: () => Promise<void>;
  onDoiEmail: () => void;
}) {
  const [so, datSo] = useState<string[]>(['', '', '', '', '', '']);
  const [trangThai, datTrangThai] = useState<'nhap' | 'sai' | 'het-han'>('nhap');
  const [loi, datLoi] = useState<string | null>(null);
  const [bay, datBay] = useState(() => Date.now());
  const o = useRef<(HTMLInputElement | null)[]>([]);
  const toast = useToast();

  useEffect(() => {
    const h = setInterval(() => datBay(Date.now()), 1000);
    return () => clearInterval(h);
  }, []);

  const ma = so.join('');
  const conLai = Math.max(0, Math.ceil((props.guiLuc + CHO_GUI_LAI_MS - Math.max(bay, Date.now())) / 1000));

  const go = (i: number, v: string) => {
    const chu = v.replace(/\D/g, '');
    const moi = [...so];
    if (chu.length > 1) {
      // Dán cả mã, hay trình duyệt tự điền mã từ thư: rải ra các ô từ ô đang gõ.
      for (let k = 0; k < chu.length && i + k < 6; k++) moi[i + k] = chu[k]!;
      datSo(moi);
      o.current[Math.min(5, i + chu.length)]?.focus();
      return;
    }
    moi[i] = chu;
    datSo(moi);
    if (chu && i < 5) o.current[i + 1]?.focus();
  };

  const xacNhan = async () => {
    datLoi(null);
    try {
      const kq = await props.onXacNhan(ma);
      if (kq === 'sai') datTrangThai(Date.now() - props.guiLuc > HAN_MA_MS ? 'het-han' : 'sai');
    } catch (e) {
      datLoi(cauBaoLoi(e));
    }
  };

  const guiLai = async () => {
    datLoi(null);
    try {
      await props.onGuiLai();
      datSo(['', '', '', '', '', '']);
      datTrangThai('nhap');
      toast('Đã gửi mã mới');
    } catch (e) {
      datLoi(cauBaoLoi(e));
    }
  };

  const tieuDe = props.luong === 'dang-ky' ? 'Nhập mã xác nhận' : 'Nhập mã đăng nhập';
  return (
    <KhungMan tieuDe={tieuDe} onQuayLai={props.onDoiEmail}>
      <p className="dong-phu">Mã 6 số đã gửi tới {props.email}</p>
      <p className="dong-mo">Không thấy thư? Xem thêm trong mục Thư rác hoặc Quảng cáo.</p>
      <div className="o-ma">
        {so.map((s, i) => (
          <input
            key={i}
            ref={(el) => { o.current[i] = el; }}
            className={'hh-input otp' + (trangThai !== 'nhap' ? ' hh-input--loi' : '')}
            inputMode="numeric"
            autoComplete={i === 0 ? 'one-time-code' : 'off'}
            aria-label={`Số thứ ${i + 1}`}
            value={s}
            onChange={(e) => go(i, e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Backspace' && !so[i] && i > 0) o.current[i - 1]?.focus(); }}
          />
        ))}
      </div>
      {trangThai === 'sai' && <p className="cau-loi" role="alert">{CAU_MA_SAI}</p>}
      {trangThai === 'het-han' && <p className="cau-loi" role="alert">{CAU_MA_HET_HAN}</p>}
      {loi && <p className="cau-loi" role="alert">{loi}</p>}
      <div className="man-chan">
        {trangThai === 'het-han' ? (
          <NutGhi chu="Gửi lại mã" chuDangGhi="Đang gửi…" onGhi={guiLai} />
        ) : (
          <>
            <NutGhi chu={props.luong === 'dang-ky' ? 'Xác nhận' : 'Đăng nhập'} chuDangGhi="Đang kiểm tra…"
                    disabled={!kiemMa(ma)} onGhi={xacNhan} />
            {conLai > 0
              ? <p className="dong-mo dong-giua">Gửi lại mã sau {conLai} giây</p>
              : <NutGhi chu="Gửi lại mã" chuDangGhi="Đang gửi…" onGhi={guiLai} lop="hh-btn hh-btn--text" />}
          </>
        )}
        <button type="button" className="hh-btn hh-btn--text" onClick={props.onDoiEmail}>Đổi email</button>
      </div>
    </KhungMan>
  );
}
