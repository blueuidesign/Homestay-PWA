// S6-05 · Đặt phòng nhanh cho căn tự nhập (YC10.4 bước 1 đến 6, YC10.4-NT1 đến NT4, YC10 "Giá điền sẵn", QT1.3, QT3.1, PQ14.SALE).
// Tấm dưới phủ trên S6-03. Điền sẵn qua fn_gia_dien_san_tu_ghi (chưa sửa ô nào thì đổi ngày, số đêm là điền lại); ghi qua
// fn_ghi_dat_phong_tu_ghi. Form dùng chung cho sửa đặt phòng (S606SuaDatPhong).
// Trạng thái: HV1 nút ghi khóa khi đang lưu, cùng mã lần gửi khi bấm lại (HV1-NT1); HV2 mất mạng thì báo, giữ form, không tự
// gửi lại (HV2-NT1, NT2); HV8 toast; lỗi của database (trùng đêm, luật kiểm) hiện ngay dưới nút.
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { NutGhi } from '../chung/dangTai';
import { CAU_CHUA_LUU, cauBaoLoi, LoiNguoiDung } from '../chung/matKetNoi';
import { useToast } from '../chung/Toast';
import {
  CAU_THEM_SAU, cauGiaDienSan, chipNgayNhan, dongLoi, dongSoDem, kiemDatPhongTuGhi, phuDeDatPhong, SO_DEM_TOI_DA,
} from '../lib/datPhongTuGhi';
import type { DichVuDatPhongTuGhi } from '../lib/dichVuDatPhongTuGhi';
import { congNgay, laNgay, soDem as demGiua, type Ngay } from '../lib/ngay';
import { docSoTienGo, vietSo } from '../lib/tien';
import { Icon } from './TabChu';
import './S605GhiDatPhong.css';

const ICON_DONG = <><path d="M18 6 6 18" /><path d="m6 6 12 12" /></>;

/** Mã lần gửi (QT5.6): giữ suốt form, bấm lại sau lỗi mạng gửi cùng mã. */
export function taoMaLanGui(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  } catch { /* máy cũ */ }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (k) => {
    const r = (Math.random() * 16) | 0;
    return (k === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

/** HV2: lỗi mạng (mất mạng, fetch hỏng, không có mã lỗi của database). */
function laLoiMang(e: unknown): boolean {
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return true;
  if (e instanceof TypeError) return true;
  if (e instanceof LoiNguoiDung) return false;
  const ma = (e as { code?: unknown } | null)?.code;
  return ma === undefined || ma === null || ma === '';
}

export type GiaTriDatPhong = { ngayNhan: Ngay; ngayTra: Ngay; traChu: number; thuKhach: number };

function OTien(props: { id: string; nhan: string; gt: number | null; loi?: string; onDoi: (v: number | null) => void }) {
  return (
    <div className="hh-field">
      <label htmlFor={props.id}><span className="hh-field__label">{props.nhan}</span></label>
      <input id={props.id} type="text" inputMode="numeric" className={'hh-input' + (props.loi ? ' hh-input--loi' : '')}
             aria-invalid={props.loi ? true : undefined} aria-describedby={props.loi ? props.id + '-loi' : undefined}
             value={props.gt === null ? '' : vietSo(props.gt)}
             onChange={(e) => { const v = docSoTienGo(e.target.value); if (v !== undefined) props.onDoi(v); }} />
      {props.loi && <span className="hh-field__loi" id={props.id + '-loi'} role="alert">{props.loi}</span>}
    </div>
  );
}

/** YC10.4 bước 1 đến 6: form dùng chung cho ghi (S6-05) và sửa. dau có thì là sửa: không điền sẵn, giữ tiền đã lưu. */
export function FormDatPhongTuGhi(props: {
  tieuDe: string;
  tenCan: string;
  tenChu: string | null;
  canId: string;
  homNay: Ngay;
  dv: Pick<DichVuDatPhongTuGhi, 'dienSan'>;
  dau?: Omit<GiaTriDatPhong, 'thuKhach'> & { thuKhach: number | null };
  nut: string;
  onLuu: (g: GiaTriDatPhong) => Promise<unknown>;
  onDong: () => void;
  /** Dưới nút ghi (sửa: nút xóa). */
  duoi?: ReactNode;
  manCon: string;
}) {
  const { dv, canId, dau } = props;
  const hienToast = useToast();
  const chip = chipNgayNhan(props.homNay);
  const [ngayNhan, datNgayNhan] = useState<Ngay>(dau?.ngayNhan ?? props.homNay);
  const [soDem, datSoDem] = useState(dau ? demGiua(dau.ngayNhan, dau.ngayTra) : 1);
  const [ngayKhac, datNgayKhac] = useState(!!dau && !chip.some((c) => c.ngay === dau.ngayNhan));
  const [traChu, datTraChu] = useState<number | null>(dau?.traChu ?? null);
  const [thuKhach, datThuKhach] = useState<number | null>(dau?.thuKhach ?? null);
  // YC10 "Giá điền sẵn": người dùng đã sửa ô thì không điền đè.
  const daSua = useRef({ tra: !!dau, thu: !!dau });
  const [daBam, datDaBam] = useState(false);
  const [loiDb, datLoiDb] = useState<string | null>(null);
  const lanDoc = useRef(0);

  const ngayTra = congNgay(ngayNhan, soDem);
  useEffect(() => {
    if (dau) return;
    const lan = ++lanDoc.current;
    dv.dienSan(canId, ngayNhan, ngayTra).then((g) => {
      if (lan !== lanDoc.current) return;
      if (!daSua.current.tra) datTraChu(g.traChu);
      if (!daSua.current.thu) datThuKhach(g.thuKhach);
    }, () => { /* không điền sẵn được thì để ô như cũ */ });
  }, [dv, canId, ngayNhan, ngayTra, dau]);

  const loi = daBam ? kiemDatPhongTuGhi({ soDem, traChu, thuKhach }) : {};
  const loiDong = dongLoi(traChu, thuKhach);

  const luu = async () => {
    datDaBam(true);
    datLoiDb(null);
    const k = kiemDatPhongTuGhi({ soDem, traChu, thuKhach });
    if (k.soDem || k.traChu || k.thuKhach) return;
    if (typeof navigator !== 'undefined' && navigator.onLine === false) { hienToast(CAU_CHUA_LUU, 'loi'); return; }
    try {
      await props.onLuu({ ngayNhan, ngayTra, traChu: traChu!, thuKhach: thuKhach! });
    } catch (e) {
      if (laLoiMang(e)) hienToast(CAU_CHUA_LUU, 'loi');
      else if (e instanceof LoiNguoiDung) datLoiDb(e.message);
      else hienToast(cauBaoLoi(e), 'loi');
    }
  };
  const doiNgay = (d: Ngay) => { datNgayNhan(d); datLoiDb(null); };
  const doiDem = (n: number) => { datSoDem(Math.min(SO_DEM_TOI_DA, Math.max(1, n))); datLoiDb(null); };

  return (
    <>
      <div className="s605-man-toi" onClick={props.onDong} aria-hidden="true" />
      <div className="s605-tam" role="dialog" aria-modal="true" aria-label={props.tieuDe} data-man={props.manCon}>
        <div className="s605-dau">
          <div className="s605-dau-chu">
            <h2 className="s605-tieu-de">{props.tieuDe}</h2>
            <span className="s605-phu">{phuDeDatPhong(props.tenCan, props.tenChu)}</span>
          </div>
          <button type="button" className="hh-iconbtn" aria-label="Đóng" title="Đóng" onClick={props.onDong}><Icon co={22}>{ICON_DONG}</Icon></button>
        </div>
        <div className="s605-than">
          <div className="s605-muc" role="group" aria-label="Ngày nhận">
            <span className="s605-nhan">Ngày nhận</span>
            <div className="s605-chip">
              {chip.map((c) => {
                const on = !ngayKhac && ngayNhan === c.ngay;
                return (
                  <button key={c.ngay} type="button" aria-pressed={on} className={'hh-chip hh-chip--sale' + (on ? ' hh-chip--on' : '')}
                          onClick={() => { datNgayKhac(false); doiNgay(c.ngay); }}>{c.chu}</button>
                );
              })}
              <button type="button" aria-pressed={ngayKhac} className={'hh-chip hh-chip--sale' + (ngayKhac ? ' hh-chip--on' : '')}
                      onClick={() => datNgayKhac(true)}>Ngày khác</button>
            </div>
            {ngayKhac && (
              <input type="date" className="hh-input" aria-label="Chọn ngày nhận" value={ngayNhan}
                     onChange={(e) => { if (laNgay(e.target.value)) doiNgay(e.target.value); }} />
            )}
          </div>
          <div className="s605-dem">
            <div className="s605-dem-chu">
              <span className="s605-nhan">Số đêm</span>
              <span className="s605-phu" data-testid="dong-so-dem">{dongSoDem(ngayNhan, soDem)}</span>
              {loi.soDem && <span className="hh-field__loi" role="alert">{loi.soDem}</span>}
            </div>
            <div className="s605-dem-nut">
              <button type="button" aria-label="Bớt một đêm" className="hh-btn hh-btn--secondary hh-btn--pill" disabled={soDem <= 1}
                      onClick={() => doiDem(soDem - 1)}>−</button>
              <span className="s605-so" aria-label="Số đêm">{soDem}</span>
              <button type="button" aria-label="Thêm một đêm" className="hh-btn hh-btn--secondary hh-btn--pill" disabled={soDem >= SO_DEM_TOI_DA}
                      onClick={() => doiDem(soDem + 1)}>+</button>
            </div>
          </div>
          <div className="s605-tien">
            <div className="s605-hai-o">
              <OTien id="s605-tra-chu" nhan="Trả chủ (đ)" gt={traChu} loi={loi.traChu}
                     onDoi={(v) => { daSua.current.tra = true; datTraChu(v); }} />
              <OTien id="s605-thu-khach" nhan="Thu khách (đ)" gt={thuKhach} loi={loi.thuKhach}
                     onDoi={(v) => { daSua.current.thu = true; datThuKhach(v); }} />
            </div>
            <span className="s605-phu">
              {loiDong && <span className="s605-loi-tien" data-testid="dong-loi">{loiDong}</span>}
              {loiDong && ' · '}
              {cauGiaDienSan(props.tenChu)}
            </span>
          </div>
          <NutGhi chu={props.nut} onGhi={luu} />
          {loiDb && <p className="s605-loi-db" role="alert">{loiDb}</p>}
          <span className="s605-phu s605-them-sau">{CAU_THEM_SAU}</span>
          {props.duoi}
        </div>
      </div>
    </>
  );
}

/** S6-05: ghi đặt phòng mới. Xong thì onDaLuu (S6-03 đọc lại, toast S6-06). */
export function S605GhiDatPhong(props: {
  canId: string;
  tenCan: string;
  tenChu: string | null;
  homNay: Ngay;
  dv: Pick<DichVuDatPhongTuGhi, 'dienSan' | 'ghi'>;
  onDong: () => void;
  onDaLuu: (g: GiaTriDatPhong) => void;
}) {
  const [clientId] = useState(taoMaLanGui);
  return (
    <FormDatPhongTuGhi tieuDe="Đặt phòng" tenCan={props.tenCan} tenChu={props.tenChu} canId={props.canId} homNay={props.homNay}
                       dv={props.dv} nut="Đặt phòng" manCon="S6-05" onDong={props.onDong}
                       onLuu={async (g) => {
                         await props.dv.ghi({ canId: props.canId, clientId, ...g });
                         props.onDaLuu(g);
                       }} />
  );
}
