// P10 · Mức cộng giá mặc định (YC7.5 bước 1 đến 5, US47). QT5.4, GD13, PQ11.SALE, YC7-H10, YC7-H11.
// Bộ chip chung với S3 (src/lib/mucCong.ts, YC7.5-NT5), công tắc làm tròn 50.000đ, ví dụ 1.100.000đ một đêm 2 đêm, Lưu.
// Chưa lưu mà rời màn thì mất thay đổi, không hỏi lại (YC7.5). HV1 khung xám, HV2 Thử lại và giữ lựa chọn khi lưu lỗi,
// HV3 quay lại từ nền đọc lại khi chưa đổi gì, HV8 toast. Lưu xong về Cá nhân.
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { KhungXam, NutGhi } from '../chung/dangTai';
import { cauBaoLoi, DaiMatKetNoi, ManChuaTai } from '../chung/matKetNoi';
import { useQuayLaiTuNen } from '../chung/nhap';
import { useToast } from '../chung/Toast';
import type { DichVuMucCong, MucCongMacDinh } from '../lib/dichVuMucCong';
import { boChipMucCong, CAU_NGOAI_KHOANG, docMucNghin, laMucCoSan, mucHopLe, TIEU_DE_VI_DU, viDu } from '../lib/mucCong';
import { vietTien } from '../lib/tien';
import { Icon } from './TabChu';
import './P10MucCong.css';

/** HV8, YC7.5 bước 5. */
export const CAU_DA_LUU_MUC_CONG = 'Đã lưu mức cộng';

const ICON_QUAY_LAI = <path d="m15 18-6-6 6-6" />;
const ICON_TICK = <path d="M20 6 9 17l-5-5" />;

/** Lựa chọn trên màn: một chip có sẵn, hay "Tùy chọn" với chữ đang gõ (nghìn đồng). */
type Chon = { loai: 'chip'; muc: number } | { loai: 'tuy'; chu: string };

function chonTu(d: MucCongMacDinh): Chon {
  if (laMucCoSan(d.muc)) return { loai: 'chip', muc: d.muc };
  return { loai: 'tuy', chu: d.muc % 1000 === 0 ? String(d.muc / 1000) : '' };
}

export function P10MucCong(props: { dv?: DichVuMucCong; onQuayLai: () => void; onDaLuu: () => void }) {
  const hienToast = useToast();
  const [chon, datChon] = useState<Chon | undefined>(undefined);
  const [lamTron, datLamTron] = useState(false);
  const [daDoi, datDaDoi] = useState(false);
  const [loi, datLoi] = useState(false);
  const dv = props.dv;

  const tai = useCallback(async () => {
    datLoi(false);
    try {
      if (!dv) throw new TypeError('chưa nối database');
      const d = await dv.doc();
      datChon(chonTu(d));
      datLamTron(d.lamTron);
      datDaDoi(false);
    } catch {
      datLoi(true);
    }
  }, [dv]);
  useEffect(() => { void tai(); }, [tai]);
  useQuayLaiTuNen(() => { if (chon && !daDoi) void tai(); });

  const khung = (than: ReactNode, chan?: ReactNode) => (
    <div className="man p10" data-man="P10">
      <DaiMatKetNoi />
      <header className="p10-dau">
        <button type="button" className="hh-iconbtn man-quay-lai" aria-label="Quay lại" onClick={props.onQuayLai}><Icon co={22}>{ICON_QUAY_LAI}</Icon></button>
        <h1 className="p10-tieu-de">Mức cộng giá mặc định</h1>
      </header>
      <div className="p10-than">{than}</div>
      {chan}
    </div>
  );

  if (!chon) return khung(loi ? <ManChuaTai onThuLai={() => void tai()} /> : <KhungXam soDong={4} />);

  const muc = chon.loai === 'chip' ? chon.muc : docMucNghin(chon.chu) ?? null;
  const hopLe = mucHopLe(muc);
  const ngoaiKhoang = chon.loai === 'tuy' && muc != null && !hopLe;
  const vd = hopLe ? viDu(muc, lamTron) : null;
  const doi = (c: Chon) => { datChon(c); datDaDoi(true); };

  const luu = async () => {
    if (!hopLe) return;
    try {
      await dv!.luu(muc, lamTron);
    } catch (e) {
      hienToast(cauBaoLoi(e), 'loi'); // HV2, QT5.5: giữ lựa chọn
      return;
    }
    hienToast(CAU_DA_LUU_MUC_CONG);
    props.onDaLuu();
  };

  const chips = boChipMucCong(chon.loai === 'chip' ? chon.muc : null).map((c) =>
    c.muc === 'tuy-chon' ? { ...c, chu: 'Tùy chọn', dangChon: chon.loai === 'tuy' } : c);

  return khung(
    <>
      <p className="p10-gioi-thieu">Cộng thêm vào giá chủ nhà mỗi đêm khi soạn tin gửi khách. Khách chỉ thấy giá đã cộng.</p>
      <section className="p10-the" aria-labelledby="p10-cong">
        <h2 className="p10-nhan" id="p10-cong">Cộng mỗi đêm</h2>
        <div className="p10-chips" role="group" aria-labelledby="p10-cong">
          {chips.map((c) => (
            <button key={c.khoa} type="button" aria-pressed={c.dangChon} className={'p10-chip' + (c.dangChon ? ' p10-chip--on' : '')}
                    onClick={() => {
                      if (c.muc === 'tuy-chon') { if (chon.loai !== 'tuy') doi({ loai: 'tuy', chu: '' }); return; }
                      doi({ loai: 'chip', muc: c.muc });
                    }}>
              {c.dangChon && <Icon co={13}>{ICON_TICK}</Icon>}{c.chu}
            </button>
          ))}
        </div>
        {chon.loai === 'tuy' && (
          <div className="p10-tuy">
            <div className="p10-tuy-o">
              <label className="p10-an" htmlFor="p10-tuy">Mức cộng mỗi đêm, nghìn đồng</label>
              <input id="p10-tuy" inputMode="numeric" placeholder="Ví dụ 250" value={chon.chu} autoFocus
                     onChange={(e) => { const v = docMucNghin(e.target.value); if (v !== undefined) doi({ loai: 'tuy', chu: v == null ? '' : String(v / 1000) }); }} />
              <span className="p10-tuy-duoi" aria-hidden="true">.000đ</span>
            </div>
            {ngoaiKhoang && <p className="p10-loi" role="alert">{CAU_NGOAI_KHOANG}</p>}
          </div>
        )}
        <button type="button" role="checkbox" aria-checked={lamTron} className={'p10-check' + (lamTron ? ' p10-check--on' : '')}
                onClick={() => { datLamTron((x) => !x); datDaDoi(true); }}>
          <span className="p10-check-hop" aria-hidden="true">{lamTron && <Icon co={13}>{ICON_TICK}</Icon>}</span>
          <span>Làm tròn lên 50.000đ</span>
        </button>
      </section>
      <section className="p10-the" aria-labelledby="p10-vd">
        <h2 className="p10-nhan p10-nhan--hoa" id="p10-vd">{TIEU_DE_VI_DU}</h2>
        <dl className="p10-vd">
          <div><dt>Giá chủ nhà</dt><dd data-testid="vd-gia-chu">{vietTien(viDu(0, false).giaChu)}</dd></div>
          <div><dt>Giá gửi khách</dt><dd data-testid="vd-gui-khach">{vd ? vietTien(vd.giaGuiKhach) : '–'}</dd></div>
          <div className="p10-vd-duoc"><dt>Bạn được</dt><dd data-testid="vd-ban-duoc">{vd ? vietTien(vd.banDuoc) : '–'}</dd></div>
        </dl>
        <p className="p10-ghi-chu">Khi soạn tin (S3) vẫn sửa được mức cộng cho từng căn.</p>
      </section>
    </>,
    <div className="p10-chan">
      <NutGhi chu="Lưu thay đổi" onGhi={luu} disabled={!hopLe} />
    </div>,
  );
}
