// S6-07, S6-03 bản tạm (YC7 Quy tắc "Chạm căn mở đâu", GD22, YC7.3-NT6; màn thật ở YC10). Ghi tên màn và tên căn, nút Quay lại.
import { DaiMatKetNoi } from '../chung/matKetNoi';
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
