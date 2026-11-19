// YC6.8, A9, A9-02, HV8, pwa.md P7, P10: toast báo sale khi chủ nhà đồng ý kết nối. Lấy thông báo khi mở app, khi quay
// lại từ nền và mỗi 60 giây. Mỗi dòng hiện một lần trên một máy; tự tắt sau 6 giây hoặc khi bấm "Xem". Không đánh dấu đã đọc.
import { useCallback, useEffect, useRef, useState } from 'react';
import { useQuayLaiTuNen } from '../chung/nhap';
import type { DichVuThongBao } from '../lib/dichVuThongBao';
import { chonToastMoi, chuToast, daHienToast, khoaToast, nhoDaHien, type ThongBaoKetNoi } from '../lib/toastKetNoi';
import './A9ToastKetNoi.css';

/** YC6.8 r11: tự tắt sau 6 giây. */
export const THOI_GIAN_TOAST_KET_NOI_MS = 6000;
/** YC6.8 bước 1, pwa.md P7: hiện chậm nhất 60 giây sau khi chủ nhà đồng ý. */
export const CHU_KY_LAY_MS = 60_000;

export function A9ToastKetNoi(props: { dv: DichVuThongBao; onXem: () => void }) {
  const { dv } = props;
  const [tb, datTb] = useState<ThongBaoKetNoi | null>(null);
  const hen = useRef<ReturnType<typeof setTimeout> | null>(null);
  const conGan = useRef(true);

  const tat = useCallback(() => {
    if (hen.current) clearTimeout(hen.current);
    hen.current = null;
    datTb(null);
  }, []);

  const lay = useCallback(async () => {
    let ds: ThongBaoKetNoi[];
    try {
      ds = await dv.layKetNoiChuaDoc();
    } catch {
      return; // HV2: mất mạng thì thôi, lần sau lấy lại.
    }
    if (!conGan.current) return;
    const daHien = daHienToast();
    const moi = chonToastMoi(ds, daHien);
    if (!moi) return;
    // Nhiều dòng chưa hiện cùng lúc: hiện dòng mới nhất, các dòng cũ hơn coi như đã hiện (không nối đuôi toast).
    nhoDaHien(ds.map(khoaToast).filter((k) => !daHien.has(k)).reverse());
    if (hen.current) clearTimeout(hen.current);
    datTb(moi);
    hen.current = setTimeout(() => { hen.current = null; datTb(null); }, THOI_GIAN_TOAST_KET_NOI_MS);
  }, [dv]);

  useEffect(() => {
    conGan.current = true;
    void lay();
    const lap = setInterval(() => { void lay(); }, CHU_KY_LAY_MS);
    return () => {
      conGan.current = false;
      clearInterval(lap);
      if (hen.current) clearTimeout(hen.current);
    };
  }, [lay]);
  useQuayLaiTuNen(() => { void lay(); });

  if (!tb) return null;
  const chu = chuToast(tb);
  return (
    <div className="a9-toast" role="status" aria-live="polite">
      <span className="a9-dau" aria-hidden="true">✓</span>
      <div className="a9-chu">
        {chu.dong1}
        <span className="a9-dong2">{chu.dong2}</span>
      </div>
      <button type="button" className="a9-xem" onClick={() => { tat(); props.onXem(); }}>Xem</button>
    </div>
  );
}
