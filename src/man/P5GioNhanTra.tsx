// P5 · Giờ nhận, trả phòng mặc định (YC1.5, US5): hai ô chọn giờ, tóm tắt đổi theo, "Lưu thay đổi" rồi về Cá nhân.
// Chỉ chủ nhà có dòng này (YC1.3). Không đổi đặt phòng đã có (YC1.5-NT2, database giữ giờ đã chép).
// HV1 khung xám, HV2 Thử lại và giữ lựa chọn khi lưu lỗi, HV3 quay lại từ nền đọc lại khi chưa đổi, HV8 toast, QT5.5.
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { KhungXam, NutGhi } from '../chung/dangTai';
import { cauBaoLoi, DaiMatKetNoi, ManChuaTai } from '../chung/matKetNoi';
import { useQuayLaiTuNen } from '../chung/nhap';
import { useToast } from '../chung/Toast';
import { CAC_GIO, tomTatGio, type DichVuGio } from '../lib/dichVuGio';
import { Icon } from './TabChu';
import './P2HoSo.css';

/** HV8, YC1.5 bước 3. */
export const CAU_DA_LUU_GIO = 'Đã lưu giờ nhận, trả phòng';
const ICON_QUAY_LAI = <path d="m15 18-6-6 6-6" />;

export function P5GioNhanTra(props: { dv?: DichVuGio; onQuayLai: () => void; onDaLuu: () => void }) {
  const hienToast = useToast();
  const [gio, datGio] = useState<{ nhan: string; tra: string } | undefined>(undefined);
  const [daDoi, datDaDoi] = useState(false);
  const [hong, datHong] = useState(false);
  const dv = props.dv;

  const tai = useCallback(async () => {
    datHong(false);
    try {
      if (!dv) throw new TypeError('chưa nối database');
      const d = await dv.doc();
      datGio({ nhan: d.gioNhan, tra: d.gioTra });
      datDaDoi(false);
    } catch {
      datHong(true);
    }
  }, [dv]);
  useEffect(() => { void tai(); }, [tai]);
  useQuayLaiTuNen(() => { if (gio && !daDoi) void tai(); });

  const khung = (than: ReactNode, chan?: ReactNode) => (
    <div className="man p2" data-man="P5">
      <DaiMatKetNoi />
      <header className="p2-dau">
        <button type="button" className="hh-iconbtn man-quay-lai" aria-label="Quay lại" onClick={props.onQuayLai}><Icon co={22}>{ICON_QUAY_LAI}</Icon></button>
        <h1 className="p2-tieu-de">Giờ nhận, trả phòng</h1>
      </header>
      <div className="p2-than">{than}</div>
      {chan}
    </div>
  );

  if (!gio) return khung(hong ? <ManChuaTai onThuLai={() => void tai()} /> : <KhungXam soDong={3} />);

  const luu = async () => {
    try {
      await dv!.luu(gio.nhan, gio.tra);
    } catch (e) {
      hienToast(cauBaoLoi(e), 'loi'); // HV2, QT5.5: giữ lựa chọn
      return;
    }
    hienToast(CAU_DA_LUU_GIO);
    props.onDaLuu();
  };
  const chon = (k: 'nhan' | 'tra', nhan: string) => (
    <div className="hh-field">
      <label className="hh-field__label" htmlFor={`p5-${k}`}>{nhan}</label>
      <select id={`p5-${k}`} className="hh-input" value={gio[k]} onChange={(e) => { datGio({ ...gio, [k]: e.target.value }); datDaDoi(true); }}>
        {(CAC_GIO.includes(gio[k]) ? CAC_GIO : [...CAC_GIO, gio[k]].sort()).map((g) => <option key={g} value={g}>{g}</option>)}
      </select>
    </div>
  );

  return khung(
    <>
      <p className="hh-field__hint">Áp dụng cho tất cả căn. Sale gửi giờ này cho khách cùng thông tin căn.</p>
      {chon('nhan', 'Giờ nhận phòng')}
      {chon('tra', 'Giờ trả phòng')}
      <p className="p2-email" data-testid="tom-tat-gio">{tomTatGio(gio.nhan, gio.tra)}</p>
    </>,
    <div className="p2-chan"><NutGhi chu="Lưu thay đổi" onGhi={luu} /></div>,
  );
}
