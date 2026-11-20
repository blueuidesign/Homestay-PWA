// S1-06, S1-06-01 · Popup thông báo mới (YC12.1, US61). Mở app hay quay lại từ nền thì gọi lệnh mở app: có thông báo mới thì popup nổi
// trên màn đang mở (không phủ toàn màn, phía sau lớp tối), không có thì không có popup. Đóng popup không đánh dấu đã đọc (YC12.1-NT5).
// HV1: chưa có kết quả thì chưa hiện gì. HV2: mất mạng thì không hiện popup (lần quay lại kế tiếp lấy lại). HV3: quay lại từ nền kiểm lại.
import { useCallback, useEffect, useRef, useState } from 'react';
import { useQuayLaiTuNen } from '../chung/nhap';
import { chuCuaThongBao, gioThongBao, mauChamThongBao, ngayNgan, type ThongBao } from '../lib/thongBao';
import './S106PopupThongBao.css';

export function S106PopupThongBao(props: {
  dv: { moApp?: () => Promise<ThongBao[]> };
  /** YC12.1 bước 3: chạm một dòng. Màn mở và việc đánh dấu đã đọc làm ở YC12.2. */
  onChamDong?: (tb: ThongBao) => void;
  /** YC12.1 bước 5: "Xem tất cả thông báo" mở P13 (YC12.2). */
  onXemTatCa?: () => void;
  bayGio?: () => Date;
}) {
  const { dv } = props;
  const [ds, datDs] = useState<ThongBao[]>([]);
  // StrictMode chạy hiệu ứng hai lần lúc dựng: giữ cờ để lệnh mở app chỉ gọi một lần cho một lần mở (lần hai sẽ trả rỗng).
  const daMo = useRef(false);
  const dangGoi = useRef(false);
  const conGan = useRef(true);

  const mo = useCallback(async () => {
    if (!dv.moApp || dangGoi.current) return;
    dangGoi.current = true;
    try {
      const moi = await dv.moApp();
      if (conGan.current && moi.length > 0) datDs(moi); // YC12.1-NT3: rỗng thì không có popup
    } catch {
      // HV2: mất mạng, không hiện popup.
    } finally {
      dangGoi.current = false;
    }
  }, [dv]);

  useEffect(() => {
    conGan.current = true;
    if (!daMo.current) { daMo.current = true; void mo(); }
    return () => { conGan.current = false; };
  }, [mo]);
  // YC12.1-NT4: quay lại từ nền thì hỏi lại.
  useQuayLaiTuNen(() => { void mo(); });

  if (ds.length === 0) return null;
  const dong = () => datDs([]);
  const bayGio = (props.bayGio ?? (() => new Date()))();
  return (
    <>
      <div className="s106-nen" aria-hidden="true" onClick={dong} data-testid="s106-nen" />
      <div className="s106-hop" role="dialog" aria-label={`${ds.length} thông báo mới`}>
        <div className="s106-dau">
          <span className="s106-chuong" aria-hidden="true">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" /><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" /></svg>
          </span>
          <div className="s106-tieu-de">
            <span className="s106-ten">{ds.length} thông báo mới</span>
            <span className="s106-phu">{ds.length} thông báo · {ngayNgan(localNgay(bayGio))}</span>
          </div>
          <button type="button" className="s106-dong" aria-label="Đóng" onClick={dong}>✕</button>
        </div>
        <ul className="s106-ds">
          {ds.map((tb) => {
            const c = chuCuaThongBao(tb);
            return (
              <li key={tb.id}>
                <button type="button" className="s106-dong-tb" onClick={() => { dong(); props.onChamDong?.(tb); }}>
                  <span className={`s106-cham s106-cham--${mauChamThongBao(tb.loai)}`} aria-hidden="true" />
                  <span className="s106-chu">
                    <span className="s106-chinh">{c.chinh}</span>
                    {c.phu && <span className="s106-phu-dong">{c.phu}</span>}
                  </span>
                  <span className="s106-gio">{gioThongBao(tb.taoLuc, bayGio)}</span>
                </button>
              </li>
            );
          })}
        </ul>
        <div className="s106-chan">
          <button type="button" className="hh-btn hh-btn--secondary hh-btn--block" onClick={() => { dong(); props.onXemTatCa?.(); }}>Xem tất cả thông báo</button>
        </div>
      </div>
    </>
  );
}

/** Ngày hôm nay theo giờ Việt Nam, dạng "2026-10-07" (QT5.1). */
function localNgay(d: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
}
