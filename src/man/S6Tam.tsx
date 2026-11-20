// S6-07, S6-03 bản tạm (YC7 Quy tắc "Chạm căn mở đâu", GD22, YC7.3-NT6). Ghi tên màn và tên căn, nút Quay lại.
// US54 (YC10.1 bước 7): S6-07 thật (S607CanCuaToi) khi biết id căn và ManSale cho cách mở (KhungCanCuaToi); không thì bản tạm.
// S6-03 vẫn tạm (US56).
import { createContext, useContext, type ReactNode } from 'react';
import { DaiMatKetNoi } from '../chung/matKetNoi';
import { ICON_QUAY_LAI } from './CN704ChiTietSale';
import { Icon } from './TabChu';

export const TEN_MAN_S6: Record<'S6-07' | 'S6-03', string> = { 'S6-07': 'Căn của tôi', 'S6-03': 'Căn tự nhập' };

/** YC10.1 bước 7: ManSale cho hàm vẽ S6-07 thật của một căn. */
export const KhungCanCuaToi = createContext<((m: { canId: string; ten: string; onQuayLai: () => void }) => ReactNode) | undefined>(undefined);

export function S6Tam(props: { man: 'S6-07' | 'S6-03'; tenCan: string; canId?: string; onQuayLai: () => void }) {
  const ve = useContext(KhungCanCuaToi);
  if (props.man === 'S6-07' && props.canId && ve) return <>{ve({ canId: props.canId, ten: props.tenCan, onQuayLai: props.onQuayLai })}</>;
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

/** YC10.1 bước 5 (US55 làm S6-04): bản tạm khi chạm tên chủ nhà ở tab Căn. */
export function S604Tam(props: { tenChu: string; onQuayLai: () => void }) {
  return (
    <div className="man man-chu" data-man="S6-04">
      <DaiMatKetNoi />
      <header className="chu-dau">
        <button type="button" className="hh-iconbtn man-quay-lai" aria-label="Quay lại" onClick={props.onQuayLai}>
          <Icon co={22}>{ICON_QUAY_LAI}</Icon>
        </button>
        <h1 className="chu-tieu-de">{props.tenChu}</h1>
      </header>
      <div className="chu-than">
        <p className="dong-phu">S6-04 · Sẽ có ở bản sau</p>
      </div>
    </div>
  );
}
