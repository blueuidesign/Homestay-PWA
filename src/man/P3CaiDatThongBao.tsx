// P3 · Cài đặt thông báo của chủ nhà, P12 · của sale (YC12.4, US64): mỗi loại một công tắc, mặc định bật; Lưu thay đổi rồi về Cá nhân.
// Thông báo chỉ hiện trong app (không có chữ gửi qua Zalo, YC12.4-NT1). Tắt một loại thì thông báo đã ghi trước vẫn còn (YC12-H4, GD29).
// HV1 khung xám, HV2 Thử lại và giữ công tắc khi lưu lỗi, HV3 quay lại từ nền đọc lại khi chưa đổi, HV8 toast, QT5.5.
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { KhungXam, NutGhi } from '../chung/dangTai';
import { cauBaoLoi, DaiMatKetNoi, ManChuaTai } from '../chung/matKetNoi';
import { useQuayLaiTuNen } from '../chung/nhap';
import { useToast } from '../chung/Toast';
import { congTacCuaVai, doiCongTac } from '../lib/caiDatThongBao';
import type { DichVuCaiDatThongBao } from '../lib/dichVuCaiDatThongBao';
import type { Vai } from '../lib/dieuHuong';
import { Icon } from './TabChu';
import './P3CaiDatThongBao.css';

/** HV8, YC12.4 bước 4. */
export const CAU_DA_LUU_CAI_DAT_TB = 'Đã lưu cài đặt thông báo';
const ICON_QUAY_LAI = <path d="m15 18-6-6 6-6" />;

export function P3CaiDatThongBao(props: { vai: Vai; dv?: DichVuCaiDatThongBao; onQuayLai: () => void; onDaLuu: () => void }) {
  const hienToast = useToast();
  const [tat, datTat] = useState<string[] | undefined>(undefined);
  const [daDoi, datDaDoi] = useState(false);
  const [hong, datHong] = useState(false);
  const dv = props.dv;

  const tai = useCallback(async () => {
    datHong(false);
    try {
      if (!dv) throw new TypeError('chưa nối database');
      datTat(await dv.doc());
      datDaDoi(false);
    } catch {
      datHong(true);
    }
  }, [dv]);
  useEffect(() => { void tai(); }, [tai]);
  useQuayLaiTuNen(() => { if (tat && !daDoi) void tai(); });

  const khung = (than: ReactNode, chan?: ReactNode) => (
    <div className="man p3" data-man={props.vai === 'chu_nha' ? 'P3' : 'P12'}>
      <DaiMatKetNoi />
      <header className="p3-dau">
        <button type="button" className="hh-iconbtn man-quay-lai" aria-label="Quay lại" onClick={props.onQuayLai}><Icon co={22}>{ICON_QUAY_LAI}</Icon></button>
        <h1 className="p3-tieu-de">Cài đặt thông báo</h1>
      </header>
      <div className="p3-than">{than}</div>
      {chan}
    </div>
  );

  if (!tat) return khung(hong ? <ManChuaTai onThuLai={() => void tai()} /> : <KhungXam soDong={4} />);

  const luu = async () => {
    try {
      // Chỉ gửi loại của vai đang xem; loại của vai kia (nếu có) giữ nguyên.
      await dv!.luu(tat);
    } catch (e) {
      hienToast(cauBaoLoi(e), 'loi'); // HV2, QT5.5: giữ công tắc
      return;
    }
    hienToast(CAU_DA_LUU_CAI_DAT_TB);
    props.onDaLuu();
  };

  return khung(
    <>
      <p className="p3-gioi-thieu">Thông báo hiện ngay trong app, ở mục Thông báo trên trang Cá nhân.</p>
      <section className="p3-nhom" aria-labelledby="p3-nhom">
        <h2 className="p3-nhom-ten" id="p3-nhom">Báo cho tôi khi</h2>
        <ul className="p3-ds">
          {congTacCuaVai(props.vai).map((c) => {
            const bat = !tat.includes(c.loai);
            return (
              <li key={c.loai}>
                <button type="button" role="switch" aria-checked={bat} className="p3-dong" data-loai={c.loai}
                        onClick={() => { datTat(doiCongTac(tat, c.loai)); datDaDoi(true); }}>
                  <span className="p3-chu">
                    <span className="p3-ten">{c.ten}</span>
                    <span className="p3-phu">{c.phu}</span>
                  </span>
                  <span className={'p3-gat' + (bat ? ' p3-gat--bat' : '')} aria-hidden="true"><span className="p3-nut" /></span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </>,
    <div className="p3-chan"><NutGhi chu="Lưu thay đổi" onGhi={luu} /></div>,
  );
}
