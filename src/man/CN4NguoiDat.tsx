// CN4 · hàng chip "Khách / Sale" (YC5.2 bước 5, 6, 6b, 6c; QD11, PQ9.CHU, PQ17.CHU). Chọn khách lẻ thì hiện ô tên, số khách;
// chọn sale thì không có ô khách, chỉ dòng nhỏ báo sale được báo. Chip "+ Sale mới" mở luồng của YC6.
import { KhungXam } from '../chung/dangTai';
import { cauChonSale, type ChipNguoiDat } from '../lib/datPhong';

export function CN4NguoiDat(props: {
  /** undefined khi đang đọc (HV1). */
  chips: ChipNguoiDat[] | undefined;
  chon: string | null;
  onChon: (c: ChipNguoiDat) => void;
  ten: string;
  sdt: string;
  onTen: (v: string) => void;
  onSdt: (v: string) => void;
}) {
  const dangChon = props.chips?.find((c) => c.khoa === props.chon);
  const laKhachLe = dangChon?.loai === 'le' || dangChon?.loai === 'khach';
  return (
    <div className="cn4-muc">
      <span className="cn4-nhan" id="cn4-nguoi-dat">Khách / Sale</span>
      {props.chips === undefined ? <KhungXam soDong={1} /> : (
        <div className="cn4-chips cn4-chips--nguoi" role="group" aria-labelledby="cn4-nguoi-dat">
          {props.chips.map((c) => (
            <button key={c.khoa} type="button" aria-pressed={c.khoa === props.chon}
                    className={'hh-chip hh-chip--sale' + (c.khoa === props.chon ? ' hh-chip--on' : '')} onClick={() => props.onChon(c)}>
              {c.chu}
            </button>
          ))}
        </div>
      )}
      {laKhachLe && (
        <div className="cn4-khach">
          <input type="text" className="hh-input" aria-label="Tên khách (không bắt buộc)" placeholder="Tên khách (không bắt buộc)"
                 maxLength={100} value={props.ten} onChange={(e) => props.onTen(e.target.value)} />
          <input type="text" className="hh-input" inputMode="tel" aria-label="Số điện thoại khách (không bắt buộc)"
                 placeholder="Số điện thoại khách (không bắt buộc)" value={props.sdt} onChange={(e) => props.onSdt(e.target.value)} />
        </div>
      )}
      {dangChon?.loai === 'sale' && <p className="cn4-ghi-nho">{cauChonSale(dangChon.chu)}</p>}
    </div>
  );
}
