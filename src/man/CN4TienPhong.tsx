// CN4 · tiền phòng, giá từng đêm, trạng thái tiền, tiền cọc (YC5.2 bước 7 tới 8b; CN4-01; QT4.1, QT5.2, QT6.1, giả định GD19, GD20).
// Ô tiền nhận số nguyên đồng, hiện dấu chấm ngăn nghìn. Chặn thật ở database (fn_tao_booking).
import { KhungXam } from '../chung/dangTai';
import { CHIP_TRANG_THAI_TIEN, dongGiaDem, type GiaDem, type TrangThaiTienForm } from '../lib/datPhong';
import { docSoTienGo, vietSo } from '../lib/tien';

/** Ô tiền: gõ chữ, đổi thành số nguyên đồng; chữ không nhận (âm, lẻ) thì giữ số cũ. */
function OTien(props: { nhan: string; gt: number | null; loi: string | null; idLoi: string; placeholder?: string; onDoi: (v: number | null) => void }) {
  return (
    <div className="hh-field">
      <label htmlFor={props.idLoi + '-o'}>
        <span className="hh-field__label">{props.nhan}</span>
      </label>
      <input id={props.idLoi + '-o'} type="text" inputMode="numeric" className={'hh-input' + (props.loi ? ' hh-input--loi' : '')} placeholder={props.placeholder}
             aria-invalid={props.loi ? true : undefined} aria-describedby={props.loi ? props.idLoi : undefined}
             value={props.gt === null ? '' : vietSo(props.gt)}
             onChange={(e) => { const v = docSoTienGo(e.target.value); if (v !== undefined) props.onDoi(v); }} />
      {props.loi && <span className="hh-field__loi" id={props.idLoi} role="alert">{props.loi}</span>}
    </div>
  );
}

export function CN4TienPhong(props: {
  tien: number | null;
  loiTien: string | null;
  /** undefined khi đang đọc giá (HV1); [] khi không đọc được. */
  giaDem: GiaDem[] | undefined;
  onTien: (v: number | null) => void;
  trangThai: TrangThaiTienForm;
  onTrangThai: (v: TrangThaiTienForm) => void;
  coc: number | null;
  loiCoc: string | null;
  onCoc: (v: number | null) => void;
}) {
  return (
    <div className="cn4-muc">
      <OTien nhan="Tiền phòng (đ)" gt={props.tien} loi={props.loiTien} idLoi="cn4-loi-tien" placeholder="Nhập tiền phòng" onDoi={props.onTien} />
      {props.giaDem === undefined ? <KhungXam soDong={1} /> : props.giaDem.length > 0 && (
        <ul className="cn4-gia-dem" aria-label="Giá từng đêm">
          {props.giaDem.map((d) => <li key={d.dem}>{dongGiaDem(d)}</li>)}
        </ul>
      )}
      <div className="cn4-trang-thai" role="group" aria-label="Trạng thái tiền">
        {CHIP_TRANG_THAI_TIEN.map((c) => (
          <button key={c.gt} type="button" aria-pressed={props.trangThai === c.gt}
                  className={'cn4-tt' + (props.trangThai === c.gt ? ' cn4-tt--on' : '')} onClick={() => props.onTrangThai(c.gt)}>
            {c.chu}
          </button>
        ))}
      </div>
      {props.trangThai === 'da_coc_con_thu' && (
        <OTien nhan="Số tiền cọc (đ)" gt={props.coc} loi={props.loiCoc} idLoi="cn4-loi-coc" onDoi={props.onCoc} />
      )}
    </div>
  );
}
