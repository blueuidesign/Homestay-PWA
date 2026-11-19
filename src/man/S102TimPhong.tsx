// S1-02, S1-03 · Tìm phòng của sale (YC7.2 bước 1 đến 5, US44). PQ4.SALE, PQ11.SALE, QT2.1, QT6.4, HV1, HV2, HV8.
// Ngày nhận, chip số đêm (ngày trả tự tính, "Tùy chọn" mở ô ngày trả), "Tìm gần đây" (5 lần của chính sale, chạm thì điền
// sẵn), "Lọc thêm" không bắt buộc. Nút đáy mờ khi chưa có ngày nhận. Không chọn được ngày trước hôm nay (YC7-H1).
// Không có chip tòa "Khác" (YC7-H2), không có lọc "Giá mỗi đêm" (YC7-H3). ManTimPhong nối form với S2-00 và kết quả S2, S4
// (YC7.3, US45).
import { useCallback, useEffect, useMemo, useState } from 'react';
import { DaiMatKetNoi, cauBaoLoi } from '../chung/matKetNoi';
import { useToast } from '../chung/Toast';
import type { DichVuTimPhong, ToaTim } from '../lib/dichVuTimPhong';
import { laNgay, type Ngay } from '../lib/ngay';
import {
  batTat, CHIP_PHONG_NGU_TIM, CHIP_SO_DEM, CHIP_VIEW_TIM, CHU_NUT_TIM, CHU_TUY_CHON, chipToaTim, DIEU_KIEN_TRONG,
  dieuKienTuGanDay, dongGanDay, ngayTra, soDemCua, trangThaiNutTim, type DieuKienTim, type KetQuaTim,
} from '../lib/timPhong';
import { ICON_QUAY_LAI } from './CN704ChiTietSale';
import { ManKetQua } from './S2KetQua';
import { S200KhongCoCan } from './S200KhongCoCan';
import { Icon, ICON_LICH } from './TabChu';
import './S102TimPhong.css';

const ICON_SAU = <path d="m9 18 6-6-6-6" />;
const ICON_TICH = <path d="M20 6 9 17l-5-5" />;

function Chip(props: { on: boolean; chu: string; onBam: () => void; nhan?: string }) {
  return (
    <button type="button" className={'tp-chip' + (props.on ? ' tp-chip--on' : '')} aria-pressed={props.on}
            aria-label={props.nhan} onClick={props.onBam}>
      {props.on && <Icon co={13}>{ICON_TICH}</Icon>}{props.chu}
    </button>
  );
}

export function S102TimPhong(props: {
  homNay: Ngay;
  /** Điều kiện ban đầu (bấm "Sửa" từ S2-00 thì giữ điều kiện cũ). */
  batDau?: DieuKienTim;
  ganDay: readonly DieuKienTim[];
  toa: readonly ToaTim[];
  dangTim?: boolean;
  onQuayLai: () => void;
  onTim: (dk: DieuKienTim) => void;
}) {
  const [dk, datDk] = useState<DieuKienTim>(() => props.batDau ?? DIEU_KIEN_TRONG);
  const [tuyChon, datTuyChon] = useState(() => {
    const n = props.batDau ? soDemCua(props.batDau) : null;
    return n !== null && !(CHIP_SO_DEM as readonly number[]).includes(n);
  });
  const [demChip, datDemChip] = useState(() => (props.batDau ? soDemCua(props.batDau) : null) ?? 1);
  const nut = trangThaiNutTim(dk, props.homNay);
  const tenToa = useMemo(() => new Map(props.toa.map((t) => [t.id, t.ten])), [props.toa]);
  const chipToa = useMemo(() => chipToaTim(props.toa, props.ganDay), [props.toa, props.ganDay]);

  // YC7.2 bước 2, NT2: ngày trả = ngày nhận + số đêm đang chọn (mặc định 1 đêm, chọn chip trước hay sau ngày nhận đều được).
  const doiNhan = (v: string) => {
    if (!laNgay(v)) { datDk((d) => ({ ...d, nhan: null, tra: null })); return; }
    datDk((d) => ({ ...d, nhan: v, tra: tuyChon && d.tra && d.tra > v ? d.tra : ngayTra(v, demChip) }));
  };
  const chonSoDem = (n: number) => {
    datTuyChon(false);
    datDemChip(n);
    datDk((d) => ({ ...d, tra: d.nhan ? ngayTra(d.nhan, n) : null }));
  };

  return (
    <div className="man man-chu tp">
      <DaiMatKetNoi />
      <header className="chu-dau">
        <button type="button" className="hh-iconbtn man-quay-lai" aria-label="Quay lại" onClick={props.onQuayLai}>
          <Icon co={22}>{ICON_QUAY_LAI}</Icon>
        </button>
        <h1 className="chu-tieu-de">Tìm phòng</h1>
      </header>
      <div className="tp-than">
        <section className="tp-the tp-ngay" aria-label="Ngày">
          <div className="tp-hai-o">
            <label className="hh-field">
              <span className="hh-field__label">Ngày nhận</span>
              <input type="date" className="hh-input" value={dk.nhan ?? ''} min={props.homNay} placeholder="Chọn ngày"
                     onChange={(e) => doiNhan(e.target.value)} />
            </label>
            <label className="hh-field">
              <span className="hh-field__label">Ngày trả</span>
              <input type="date" className="hh-input" value={dk.tra ?? ''} placeholder="Tự tính" disabled={!tuyChon || !dk.nhan}
                     min={dk.nhan ? ngayTra(dk.nhan, 1) : undefined}
                     onChange={(e) => datDk((d) => ({ ...d, tra: laNgay(e.target.value) ? e.target.value : d.tra }))} />
            </label>
          </div>
          <div className="tp-hang" role="group" aria-label="Số đêm">
            <span className="tp-nhan">Số đêm:</span>
            {CHIP_SO_DEM.map((n) => (
              <Chip key={n} on={!tuyChon && demChip === n} chu={String(n)} nhan={`${n} đêm`} onBam={() => chonSoDem(n)} />
            ))}
            <Chip on={tuyChon} chu={CHU_TUY_CHON} onBam={() => datTuyChon(true)} />
          </div>
        </section>

        {!dk.nhan && props.ganDay.length > 0 && (
          <section className="tp-the tp-gan-day" aria-label="Tìm gần đây">
            <h2 className="tp-muc">Tìm gần đây</h2>
            {props.ganDay.map((g, i) => (
              <button key={i} type="button" className="tp-dong-gan-day"
                      onClick={() => {
                        const moi = dieuKienTuGanDay(g);
                        const n = soDemCua(moi);
                        datTuyChon(n !== null && !(CHIP_SO_DEM as readonly number[]).includes(n));
                        if (n !== null) datDemChip(n);
                        datDk(moi);
                      }}>
                <span className="tp-icon-phu"><Icon co={16}>{ICON_LICH}</Icon></span>
                <span className="tp-dong-chu">{dongGanDay(g, tenToa)}</span>
                <span className="tp-icon-phu"><Icon co={16}>{ICON_SAU}</Icon></span>
              </button>
            ))}
          </section>
        )}

        <section className="tp-the tp-loc" aria-label="Lọc thêm">
          <div className="tp-loc-dau">
            <h2 className="tp-muc">Lọc thêm</h2>
            <span className="tp-phu">Không bắt buộc</span>
          </div>
          <div className="tp-nhom-loc" role="group" aria-label="Số phòng ngủ">
            <span className="tp-nhan">Số phòng ngủ</span>
            <div className="tp-hang">
              {CHIP_PHONG_NGU_TIM.map((c) => (
                <Chip key={c.so} on={dk.soPhongNgu.includes(c.so)} chu={c.chu}
                      onBam={() => datDk((d) => ({ ...d, soPhongNgu: batTat(d.soPhongNgu, c.so) }))} />
              ))}
            </div>
          </div>
          {chipToa.length > 0 && (
            <div className="tp-nhom-loc" role="group" aria-label="Tòa nhà">
              <span className="tp-nhan">Tòa nhà</span>
              <div className="tp-hang">
                {chipToa.map((t) => (
                  <Chip key={t.id} on={dk.toaNha.includes(t.id)} chu={t.ten}
                        onBam={() => datDk((d) => ({ ...d, toaNha: batTat(d.toaNha, t.id) }))} />
                ))}
              </div>
            </div>
          )}
          <div className="tp-nhom-loc" role="group" aria-label="Loại view">
            <span className="tp-nhan">Loại view</span>
            <div className="tp-hang">
              {CHIP_VIEW_TIM.map((c) => (
                <Chip key={c.ma} on={dk.view.includes(c.ma)} chu={c.chu}
                      onBam={() => datDk((d) => ({ ...d, view: batTat(d.view, c.ma) }))} />
              ))}
            </div>
          </div>
        </section>
      </div>
      <div className="tp-chan">
        {nut.ghiChu && <span className="tp-ghi-chu">{nut.ghiChu}</span>}
        <button type="button" className="hh-btn hh-btn--primary hh-btn--block" disabled={!nut.sang || props.dangTim}
                aria-disabled={!nut.sang || props.dangTim} onClick={() => props.onTim(dk)}>
          {props.dangTim ? 'Đang tìm…' : CHU_NUT_TIM}
        </button>
      </div>
    </div>
  );
}

/**
 * YC7.2 bước 1 đến 6, HV1, HV2, HV8: mở form (đọc tìm gần đây và tòa), bấm tìm thì gọi fn_sale_tim; không có căn trống thì
 * S2-00, có thì S2 (ManKetQua, YC7.3). Chạm gợi ý thì tìm lại theo gợi ý đó. Đọc tìm gần đây lỗi vẫn tìm được (chỉ không có mục đó).
 */
export function ManTimPhong(props: { dv: DichVuTimPhong; homNay: Ngay; onQuayLai: () => void }) {
  const { dv } = props;
  const hienToast = useToast();
  const [ganDay, datGanDay] = useState<DieuKienTim[]>([]);
  const [toa, datToa] = useState<ToaTim[]>([]);
  const [dk, datDk] = useState<DieuKienTim | undefined>(undefined);
  const [kq, datKq] = useState<KetQuaTim | undefined>(undefined);
  const [dangTim, datDangTim] = useState(false);
  const [lanForm, datLanForm] = useState(0);

  const docPhu = useCallback(() => {
    dv.docGanDay().then(datGanDay, () => undefined);
    dv.docToa().then(datToa, () => undefined);
  }, [dv]);
  useEffect(() => { docPhu(); }, [docPhu]);

  const tim = async (d: DieuKienTim) => {
    if (dangTim) return;
    datDangTim(true);
    try {
      const r = await dv.tim(d);
      datDk(d);
      datKq(r);
    } catch (e) {
      hienToast(cauBaoLoi(e), 'loi');
    } finally {
      datDangTim(false);
    }
  };
  const sua = () => { datKq(undefined); datLanForm((n) => n + 1); docPhu(); };
  const tenToa = useMemo(() => new Map(toa.map((t) => [t.id, t.ten])), [toa]);

  if (kq && dk) {
    if (kq.soCanTrong === 0) {
      return <S200KhongCoCan dieuKien={dk} kq={kq} tenToa={tenToa} dangTim={dangTim}
                             onQuayLai={sua} onSua={sua} onGoiY={(g) => void tim(g)} />;
    }
    return <ManKetQua dv={dv} dieuKien={dk} kq={kq} homNay={props.homNay} onSua={sua} onQuayLai={sua} />;
  }
  return <S102TimPhong key={lanForm} homNay={props.homNay} batDau={dk} ganDay={ganDay} toa={toa} dangTim={dangTim}
                       onQuayLai={props.onQuayLai} onTim={(d) => void tim(d)} />;
}
