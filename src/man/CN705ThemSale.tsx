// CN7-05 · Thêm sale thủ công (YC6.2 bước 4, Luật kiểm, YC6-H11, PQ17.CHU). Ghi qua fn_them_sale_tay; database là chỗ chặn thật.
// Trạng thái: HV1 nút ghi khóa khi đang lưu, HV2 mất mạng thì toast và giữ chữ đã gõ, QT5.5 câu database hiện dưới ô.
import { useId, useState } from 'react';
import { NutGhi } from '../chung/dangTai';
import { cauBaoLoi, DaiMatKetNoi, LoiNguoiDung } from '../chung/matKetNoi';
import { useToast } from '../chung/Toast';
import { chuanSo, kiemFormSale, oCuaCauSale, type LoiSale } from '../lib/kiemSale';
import { Icon } from './TabChu';
import './CN7DanhSachSale.css';

const ICON_QUAY_LAI = <path d="m15 18-6-6 6-6" />;

export function CN705ThemSale(props: {
  themSaleTay?: (ten: string, so: string) => Promise<string>;
  onQuayLai: () => void;
  /** YC6.2 bước 4: lưu xong thì về CN7, dòng mới ở nhóm "Chưa kết nối". */
  onDaLuu: (ten: string) => void;
}) {
  const [ten, datTen] = useState('');
  const [so, datSo] = useState('');
  const [loi, datLoi] = useState<LoiSale>({});
  const hienToast = useToast();
  const idTen = useId();
  const idSo = useId();

  const luu = async () => {
    const l = kiemFormSale({ ten, so });
    datLoi(l);
    if (l.ten || l.so) return;
    if (!props.themSaleTay) { hienToast(cauBaoLoi(new Error('chưa nối')), 'loi'); return; }
    const tenGon = ten.trim();
    try {
      await props.themSaleTay(tenGon, chuanSo(so));
      props.onDaLuu(tenGon);
    } catch (e) {
      const o = e instanceof LoiNguoiDung ? oCuaCauSale(e.message) : null;
      if (o) datLoi({ [o]: e instanceof Error ? e.message : '' });
      else hienToast(cauBaoLoi(e), 'loi');
    }
  };

  return (
    <div className="man cn7-phu">
      <DaiMatKetNoi />
      <header className="cn7-dau">
        <button type="button" className="hh-iconbtn man-quay-lai" aria-label="Quay lại" onClick={props.onQuayLai}><Icon co={22}>{ICON_QUAY_LAI}</Icon></button>
        <h1 className="cn7-tieu-de">Thêm sale</h1>
      </header>
      <div className="cn7-than cn7-than--form">
        <div className="hh-field">
          <label className="hh-field__label" htmlFor={idTen}>Tên sale *</label>
          <input id={idTen} type="text" className={'hh-input' + (loi.ten ? ' hh-input--loi' : '')} value={ten} autoComplete="off"
                 aria-invalid={loi.ten ? true : undefined} aria-describedby={loi.ten ? idTen + '-loi' : undefined}
                 onChange={(e) => datTen(e.target.value)} />
          {loi.ten && <span className="hh-field__loi" id={idTen + '-loi'}>{loi.ten}</span>}
        </div>
        <div className="hh-field">
          <label className="hh-field__label" htmlFor={idSo}>Số điện thoại *</label>
          <input id={idSo} type="text" className={'hh-input' + (loi.so ? ' hh-input--loi' : '')} inputMode="tel" value={so} autoComplete="off"
                 aria-invalid={loi.so ? true : undefined} aria-describedby={loi.so ? idSo + '-loi' : undefined}
                 onChange={(e) => datSo(e.target.value)} />
          {loi.so && <span className="hh-field__loi" id={idSo + '-loi'}>{loi.so}</span>}
        </div>
        <p className="hh-field__hint">Sale nằm ở nhóm Chưa kết nối cho tới khi mở link mời. Bạn vẫn gửi lịch cho sale qua số điện thoại này được.</p>
        <div className="man-chan">
          <NutGhi chu="Lưu sale" chuDangGhi="Đang lưu…" onGhi={luu} />
        </div>
      </div>
    </div>
  );
}
