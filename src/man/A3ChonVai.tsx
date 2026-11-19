// A3, A3-00 · Chọn vai (YC1.1 bước 3 đến 5, QD5). Vai chỉ chọn màn mở đầu; ghi bằng fn_chon_vai.
import { useState } from 'react';
import { cauBaoLoi } from '../chung/matKetNoi';
import type { Vai } from '../lib/dieuHuong';

const THE: { vai: Vai; ten: string; mo: string }[] = [
  { vai: 'chu_nha', ten: 'Tôi là chủ nhà', mo: 'Ghi lịch phòng, đặt giá, mời sale xem lịch.' },
  { vai: 'sale', ten: 'Tôi là sale', mo: 'Tìm phòng trống, gửi ảnh và giá cho khách.' },
];

function IconLich() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4" /><path d="M8 2v4" /><path d="M3 10h18" />
    </svg>
  );
}

function IconNguoi() {
  return (
    <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export function A3ChonVai(props: { onChon: (vai: Vai) => Promise<void> }) {
  const [chon, datChon] = useState<Vai | null>(null);
  const [dangGui, datDangGui] = useState(false);
  const [loi, datLoi] = useState<string | null>(null);

  const tiepTuc = async () => {
    if (!chon || dangGui) return;
    datDangGui(true);
    datLoi(null);
    try {
      await props.onChon(chon);
    } catch (e) {
      datLoi(cauBaoLoi(e));
      datDangGui(false);
    }
  };

  return (
    <main className="man man-a3">
      <div className="a3-than">
        <h1 className="a3-hoi" id="a3-hoi">Bạn dùng app để làm gì?</h1>
        <div className="a3-ds" role="radiogroup" aria-labelledby="a3-hoi">
          {THE.map((t) => {
            const dangChon = chon === t.vai;
            return (
              <button key={t.vai} type="button" role="radio" aria-checked={dangChon}
                      className={dangChon ? 'a3-the a3-the--chon' : 'a3-the'}
                      onClick={() => { datChon(t.vai); datLoi(null); }}>
                <span className="a3-dau-chon" aria-hidden="true">✓</span>
                <span className="a3-icon">{t.vai === 'chu_nha' ? <IconLich /> : <IconNguoi />}</span>
                <span className="a3-ten">{t.ten}</span>
                <span className="a3-mo">{t.mo}</span>
              </button>
            );
          })}
        </div>
        {loi && <p className="cau-loi" role="alert">{loi}</p>}
        <button type="button" className="hh-btn hh-btn--primary hh-btn--block" disabled={!chon || dangGui}
                onClick={() => void tiepTuc()}>
          Tiếp tục
        </button>
        {!chon && <p className="dong-mo a3-nhac">Chọn một mục để tiếp tục</p>}
      </div>
    </main>
  );
}
