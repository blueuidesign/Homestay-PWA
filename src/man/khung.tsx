// Khung màn dùng chung cho A2, A11 và màn nhập mã (canvas AuthEmail): thanh tiêu đề có nút quay lại, ô nhập có lỗi dưới ô.
import { useId, type ReactNode } from 'react';
import { DaiMatKetNoi } from '../chung/matKetNoi';

export function KhungMan(props: { tieuDe: string; onQuayLai?: () => void; children: ReactNode }) {
  return (
    <div className="man">
      <DaiMatKetNoi />
      <header className="man-dau">
        {props.onQuayLai && (
          <button type="button" className="hh-iconbtn man-quay-lai" aria-label="Quay lại" onClick={props.onQuayLai}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                 strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
          </button>
        )}
        <h1 className="man-tieu-de">{props.tieuDe}</h1>
      </header>
      <div className="man-than">{props.children}</div>
    </div>
  );
}

export function O(props: {
  nhan: string;
  giaTri: string;
  onDoi: (v: string) => void;
  loi?: string;
  goiY?: string;
  kieu?: 'text' | 'tel' | 'email';
  tuDien?: string;
  viDu?: string;
  khoa?: boolean;
  children?: ReactNode;
}) {
  const kieu = props.kieu ?? 'text';
  const id = useId();
  const phu = props.loi ?? props.goiY;
  return (
    <div className="hh-field">
      <label className="hh-field__label" htmlFor={id}>{props.nhan}</label>
      <input
        id={id}
        className={'hh-input' + (props.loi ? ' hh-input--loi' : '')}
        type={kieu}
        inputMode={kieu === 'tel' ? 'tel' : kieu === 'email' ? 'email' : undefined}
        autoComplete={props.tuDien}
        placeholder={props.viDu}
        value={props.giaTri}
        disabled={props.khoa}
        aria-invalid={props.loi ? true : undefined}
        aria-describedby={phu ? id + '-phu' : undefined}
        onChange={(e) => props.onDoi(e.target.value)}
      />
      {props.loi ? <span id={id + '-phu'} className="hh-field__loi" role="alert">{props.loi}</span>
        : props.goiY ? <span id={id + '-phu'} className="hh-field__hint">{props.goiY}</span> : null}
      {props.children}
    </div>
  );
}

export function DongDieuKhoan() {
  return (
    <span className="dong-dieu-khoan">
      Bằng việc tiếp tục, bạn đồng ý với <a href="/dieu-khoan">Điều khoản</a> và <a href="/chinh-sach-rieng-tu">Chính sách quyền riêng tư</a>.
    </span>
  );
}
