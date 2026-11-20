// P11 · Mẫu tin gửi khách (YC8.2 bước 1 đến 5, US49). YC8 "Mẫu tin gửi khách", YC8-H8, H9, PQ11.SALE.
// Ô "Mẫu tin", hàng "Chạm để chèn" chèn ô vào chỗ con trỏ, "Dùng lại mẫu mặc định", bản xem trước 3 căn 10/10 → 12/10 ghép
// bằng tinCaNCan của S5 (src/lib/guiKhach.ts), dòng căn giống khối ở S5. Mẫu rỗng, thiếu [Danh sách căn], quá 2.000 ký tự
// thì nút Lưu mờ. HV1 khung xám, HV2 Thử lại và giữ mẫu khi lưu lỗi, HV3 quay lại từ nền đọc lại khi chưa đổi gì, HV8 toast.
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { KhungXam, NutGhi } from '../chung/dangTai';
import { cauBaoLoi, DaiMatKetNoi, ManChuaTai } from '../chung/matKetNoi';
import { useQuayLaiTuNen } from '../chung/nhap';
import { useToast } from '../chung/Toast';
import { chenO, loiMauTin, O_CHEN, type DichVuMauTin } from '../lib/dichVuMauTin';
import { MAU_TIN_MAC_DINH, tinCaNCan, type CanGuiKhach, type TinGuiKhach } from '../lib/guiKhach';
import { Icon } from './TabChu';
import './P11MauTin.css';

/** HV8, YC8.2 bước 5. */
export const CAU_DA_LUU_MAU_TIN = 'Đã lưu mẫu tin';

const ICON_QUAY_LAI = <path d="m15 18-6-6 6-6" />;

/** YC8.2 bước 3, YC8-H8: ba căn ví dụ, chữ khối đúng dạng S5 soạn (giá bán đã cộng). */
const CAN_VI_DU: CanGuiKhach[] = [
  { canId: 'vd1', maCan: '1509', tenToa: 'ICON40', soPhongNgu: 2, soGiuong: 3, soAnh: 0, anh: [], tongGiaBan: 2_600_000,
    chu: 'ICON40 1509 · 2PN · 3 giường, view biển Bãi Cháy\n10/10 → 12/10 (2 đêm): 2.600.000đ' },
  { canId: 'vd2', maCan: '1103', tenToa: 'Sapphire', soPhongNgu: 3, soGiuong: 2, soAnh: 0, anh: [], tongGiaBan: 1_600_000,
    chu: 'Sapphire 1103 · 3PN · 2 giường, view thành phố\n10/10 → 12/10 (2 đêm): 1.600.000đ' },
  { canId: 'vd3', maCan: '2208', tenToa: 'À La Carte', soPhongNgu: 1, soGiuong: 1, soAnh: 0, anh: [], tongGiaBan: 3_600_000,
    chu: 'À La Carte 2208 · 1PN · 1 giường, view biển\n10/10 → 12/10 (2 đêm): 3.600.000đ' },
];

function tinViDu(mau: string, tenSale: string): TinGuiKhach {
  return { tu: '2026-10-10', den: '2026-10-12', soDem: 2, mauTin: mau, tenSale, can: CAN_VI_DU };
}

export function P11MauTin(props: { dv?: DichVuMauTin; tenSale?: string | null; onQuayLai: () => void; onDaLuu: () => void }) {
  const hienToast = useToast();
  const [mau, datMau] = useState<string | undefined>(undefined);
  const [daDoi, datDaDoi] = useState(false);
  const [loi, datLoi] = useState(false);
  const o = useRef<HTMLTextAreaElement>(null);
  // Chỗ con trỏ lần cuối trong ô mẫu (bấm chip làm ô mất focus). Chưa chạm ô thì chèn vào cuối.
  const conTro = useRef<{ dau: number; cuoi: number } | null>(null);
  const dv = props.dv;

  const tai = useCallback(async () => {
    datLoi(false);
    try {
      if (!dv) throw new TypeError('chưa nối database');
      datMau(await dv.doc());
      datDaDoi(false);
      conTro.current = null;
    } catch {
      datLoi(true);
    }
  }, [dv]);
  useEffect(() => { void tai(); }, [tai]);
  useQuayLaiTuNen(() => { if (mau !== undefined && !daDoi) void tai(); });

  const khung = (than: ReactNode, chan?: ReactNode) => (
    <div className="man p11" data-man="P11">
      <DaiMatKetNoi />
      <header className="p11-dau">
        <button type="button" className="hh-iconbtn man-quay-lai" aria-label="Quay lại" onClick={props.onQuayLai}><Icon co={22}>{ICON_QUAY_LAI}</Icon></button>
        <h1 className="p11-tieu-de">Mẫu tin gửi khách</h1>
      </header>
      <div className="p11-than">{than}</div>
      {chan}
    </div>
  );

  if (mau === undefined) return khung(loi ? <ManChuaTai onThuLai={() => void tai()} /> : <KhungXam soDong={4} />);

  const cauLoi = loiMauTin(mau);
  const doi = (m: string) => { datMau(m); datDaDoi(true); };
  const nhoConTro = () => {
    const t = o.current;
    if (t) conTro.current = { dau: t.selectionStart ?? mau.length, cuoi: t.selectionEnd ?? mau.length };
  };

  const chen = (oChen: string) => {
    const ct = conTro.current ?? { dau: mau.length, cuoi: mau.length };
    const kq = chenO(mau, oChen, ct.dau, ct.cuoi);
    doi(kq.mau);
    conTro.current = { dau: kq.conTro, cuoi: kq.conTro };
    requestAnimationFrame(() => {
      const t = o.current;
      if (t) { try { t.focus(); t.setSelectionRange(kq.conTro, kq.conTro); } catch { /* máy cũ */ } }
    });
  };

  const luu = async () => {
    if (cauLoi) return;
    try {
      await dv!.luu(mau);
    } catch (e) {
      hienToast(cauBaoLoi(e), 'loi'); // HV2, QT5.5: giữ mẫu đang sửa
      return;
    }
    hienToast(CAU_DA_LUU_MAU_TIN);
    props.onDaLuu();
  };

  return khung(
    <>
      <section className="p11-the" aria-label="Mẫu tin">
        <label className="hh-field">
          <span className="hh-field__label">Mẫu tin</span>
          <textarea ref={o} className={'hh-input' + (cauLoi ? ' hh-input--loi' : '')} rows={6} value={mau}
                    aria-invalid={cauLoi ? true : undefined} aria-describedby={cauLoi ? 'p11-loi' : undefined}
                    onChange={(e) => { doi(e.target.value); nhoConTro(); }} onSelect={nhoConTro} onKeyUp={nhoConTro} onClick={nhoConTro} />
        </label>
        {cauLoi && <p className="p11-loi" id="p11-loi" role="alert">{cauLoi}</p>}
        <div className="p11-chen">
          <h2 className="p11-nhan" id="p11-chen">Chạm để chèn</h2>
          <div className="p11-chips" role="group" aria-labelledby="p11-chen">
            {O_CHEN.map((x) => (
              <button key={x} type="button" className="p11-chip" onMouseDown={(e) => e.preventDefault()} onClick={() => chen(x)}>{x}</button>
            ))}
          </div>
        </div>
        <button type="button" className="hh-btn hh-btn--text p11-mac-dinh"
                onClick={() => { doi(MAU_TIN_MAC_DINH); conTro.current = null; }}>Dùng lại mẫu mặc định</button>
      </section>
      <section className="p11-the" aria-labelledby="p11-xem">
        <h2 className="p11-nhan p11-nhan--hoa" id="p11-xem">Khách sẽ nhận được</h2>
        <pre className="p11-xem" data-testid="xem-truoc">{tinCaNCan(tinViDu(mau, props.tenSale ?? ''))}</pre>
        <p className="p11-ghi-chu">Ví dụ với 3 căn trống 10/10 → 12/10, đã cộng giá.</p>
      </section>
    </>,
    <div className="p11-chan">
      <NutGhi chu="Lưu thay đổi" onGhi={luu} disabled={!!cauLoi} />
    </div>,
  );
}
