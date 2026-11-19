// S6-07, S6-03 bản tạm (YC7 Quy tắc "Chạm căn mở đâu", GD22, YC7.3-NT6; màn thật ở YC10). Ghi tên màn và tên căn, nút Quay lại.
// S3-02 bản tạm (YC7.4-NT3, US46; màn thật ở YC9.1).
import { DaiMatKetNoi } from '../chung/matKetNoi';
import { chuKhoang } from '../lib/chiTietCanSale';
import { ICON_QUAY_LAI } from './CN704ChiTietSale';
import { Icon } from './TabChu';

export const TEN_MAN_S6: Record<'S6-07' | 'S6-03', string> = { 'S6-07': 'Căn của tôi', 'S6-03': 'Căn tự nhập' };

export function S6Tam(props: { man: 'S6-07' | 'S6-03'; tenCan: string; onQuayLai: () => void }) {
  return (
    <div className="man man-chu" data-man={props.man}>
      <DaiMatKetNoi />
      <header className="chu-dau">
        <button type="button" className="hh-iconbtn man-quay-lai" aria-label="Quay lại" onClick={props.onQuayLai}>
          <Icon co={22}>{ICON_QUAY_LAI}</Icon>
        </button>
        <h1 className="chu-tieu-de">{props.tenCan}</h1>
      </header>
      <div className="chu-than">
        <p className="dong-phu">{props.man} · {TEN_MAN_S6[props.man]}</p>
        <p className="dong-phu">Sẽ có ở bản sau</p>
      </div>
    </div>
  );
}

/**
 * S3-02 bản tạm (YC7.4 bước 7, YC7.4-NT3; màn thật ở YC9.1, US50): mang đúng căn và ngày đang xem ở S3.
 * Ghi tên màn, tên căn và khoảng ngày, nút Quay lại về S3.
 */
export function S302Tam(props: { tenCan: string; canId: string; tu: string; den: string; onQuayLai: () => void }) {
  return (
    <div className="man man-chu" data-man="S3-02" data-can={props.canId} data-tu={props.tu} data-den={props.den}>
      <DaiMatKetNoi />
      <header className="chu-dau">
        <button type="button" className="hh-iconbtn man-quay-lai" aria-label="Quay lại" onClick={props.onQuayLai}>
          <Icon co={22}>{ICON_QUAY_LAI}</Icon>
        </button>
        <h1 className="chu-tieu-de">Gửi yêu cầu đặt phòng</h1>
      </header>
      <div className="chu-than">
        <p className="dong-phu" data-testid="s302-can">{props.tenCan}</p>
        <p className="dong-phu" data-testid="s302-khoang">{chuKhoang(props.tu, props.den)}</p>
        <p className="dong-phu">Sẽ có ở bản sau</p>
      </div>
    </div>
  );
}
