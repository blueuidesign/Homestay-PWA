// P9 · Hướng dẫn sử dụng (YC1.7, US7): nhóm theo vai, các mục thu gọn, chạm mở các bước; cuối màn nút "Nhắn Zalo cho Home247".
// Chỉ chữ có sẵn trong app, không gọi database (YC1.7 bước 1 đến 4), nên không có trạng thái đang tải hay mất mạng.
import { useState } from 'react';
import { CAU_CON_THAC_MAC, huongDanCuaVai } from '../lib/huongDan';
import type { Vai } from '../lib/dieuHuong';
import { LINK_ZALO_HOME247, moLinkNgoai } from '../lib/home247';
import { Icon } from './TabChu';
import './P9HuongDan.css';

const ICON_QUAY_LAI = <path d="m15 18-6-6 6-6" />;
const ICON_XUONG = <path d="m6 9 6 6 6-6" />;

export function P9HuongDan(props: { vai: Vai; onQuayLai: () => void; moZalo?: (url: string) => void }) {
  const nhom = huongDanCuaVai(props.vai);
  const [mo, datMo] = useState<string | null>(null);
  const moZalo = props.moZalo ?? moLinkNgoai;
  return (
    <div className="man p9" data-man="P9">
      <header className="p9-dau">
        <button type="button" className="hh-iconbtn man-quay-lai" aria-label="Quay lại" onClick={props.onQuayLai}><Icon co={22}>{ICON_QUAY_LAI}</Icon></button>
        <h1 className="p9-tieu-de">Hướng dẫn sử dụng</h1>
      </header>
      <div className="p9-than">
        <section aria-labelledby="p9-nhom">
          <h2 className="p9-nhom" id="p9-nhom">{nhom.tieuDe}</h2>
          <ul className="p9-ds">
            {nhom.muc.map((m) => {
              const dang = mo === m.khoa;
              return (
                <li key={m.khoa}>
                  <button type="button" className="p9-muc" aria-expanded={dang} aria-controls={`p9-${m.khoa}`} onClick={() => datMo(dang ? null : m.khoa)}>
                    <span className="p9-muc-ten">{m.tieuDe}</span>
                    <span className={'p9-mui' + (dang ? ' p9-mui--mo' : '')} aria-hidden="true"><Icon>{ICON_XUONG}</Icon></span>
                  </button>
                  {dang && (
                    <ol className="p9-buoc" id={`p9-${m.khoa}`}>
                      {m.buoc.map((b) => <li key={b}>{b}</li>)}
                    </ol>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
        <section className="p9-zalo">
          <p className="p9-zalo-cau">{CAU_CON_THAC_MAC}</p>
          <button type="button" className="hh-btn hh-btn--primary hh-btn--block" onClick={() => moZalo(LINK_ZALO_HOME247)}>Nhắn Zalo cho Home247</button>
        </section>
      </div>
    </div>
  );
}
