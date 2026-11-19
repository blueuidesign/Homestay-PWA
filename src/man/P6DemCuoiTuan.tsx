// P6 · Ngày tính giá cuối tuần (YC4.6): chọn những đêm tính giá cuối tuần của chủ nhà, xem mẫu một tuần, lưu.
// Trạng thái: HV1 khung xám, HV2 chưa tải được thì Thử lại và giữ lựa chọn đang chọn khi lưu lỗi, HV3 quay lại từ nền đọc lại mẫu giá,
// HV5 và QT5.5 câu của database, HV8 toast. Lưu xong về Cá nhân (YC4-H4).
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { KhungXam, NutGhi } from '../chung/dangTai';
import { cauBaoLoi, DaiMatKetNoi, ManChuaTai } from '../chung/matKetNoi';
import { useQuayLaiTuNen } from '../chung/nhap';
import { useToast } from '../chung/Toast';
import type { DichVuGia, MauTuan } from '../lib/dichVuGia';
import { doiDemCuoiTuan, mauMotTuan, tenDemIso, type ThuIso } from '../lib/gia';
import { homNay as homNayVN, type Ngay } from '../lib/ngay';
import { vietTienGon } from '../lib/tien';
import { Icon } from './TabChu';
import './P6DemCuoiTuan.css';

/** HV8, YC4.6 bước 4 (YC4-H4): toast sau khi lưu. */
export const CAU_DA_LUU_DEM_CUOI_TUAN = 'Đã lưu ngày tính giá cuối tuần';

const ICON_QUAY_LAI = <path d="m15 18-6-6 6-6" />;
const ICON_TICK = <path d="M20 6 9 17l-5-5" />;
const BAY_DEM: ThuIso[] = [1, 2, 3, 4, 5, 6, 7];

type DuLieu = { dem: number[]; mau: MauTuan | null };

export function P6DemCuoiTuan(props: { dv?: DichVuGia; homNay?: Ngay; onQuayLai: () => void; onDaLuu: () => void }) {
  const hienToast = useToast();
  const homNay = props.homNay ?? homNayVN();
  const [goc, datGoc] = useState<DuLieu | undefined>(undefined);
  const [chon, datChon] = useState<number[] | undefined>(undefined);
  const [loi, datLoi] = useState(false);
  const dv = props.dv;

  // HV1, HV2: lần đầu đọc cả đêm cuối tuần và mẫu; quay lại từ nền (HV3) chỉ đọc lại mẫu giá, giữ lựa chọn đang chọn.
  const tai = useCallback(async (dauTien: boolean) => {
    datLoi(false);
    try {
      if (!dv?.layDemCuoiTuan || !dv.layMauTuan) throw new TypeError('chưa nối database');
      const [dem, mau] = await Promise.all([dv.layDemCuoiTuan(), dv.layMauTuan(homNay)]);
      datGoc({ dem, mau });
      if (dauTien) datChon(dem);
    } catch {
      datLoi(true);
    }
  }, [dv, homNay]);
  useEffect(() => { void tai(true); }, [tai]);
  useQuayLaiTuNen(() => { if (goc) void tai(false); });

  const khung = (than: ReactNode, chan?: ReactNode) => (
    <div className="man p6">
      <DaiMatKetNoi />
      <header className="p6-dau">
        <button type="button" className="hh-iconbtn man-quay-lai" aria-label="Quay lại" onClick={props.onQuayLai}><Icon co={22}>{ICON_QUAY_LAI}</Icon></button>
        <h1 className="p6-tieu-de">Ngày tính giá cuối tuần</h1>
      </header>
      <div className="p6-than">{than}</div>
      {chan}
    </div>
  );

  if (!goc || !chon) return khung(loi ? <ManChuaTai onThuLai={() => void tai(true)} /> : <KhungXam soDong={4} />);

  const mau = goc.mau ? mauMotTuan(homNay, goc.mau.giaThang, chon) : null;
  const coGia = !!mau && mau.some((o) => o.gia !== null);
  const luu = async () => {
    try {
      await dv!.datDemCuoiTuan!(chon);
    } catch (e) {
      hienToast(cauBaoLoi(e), 'loi'); // HV2, QT5.5: giữ lựa chọn đang chọn
      return;
    }
    hienToast(CAU_DA_LUU_DEM_CUOI_TUAN); // YC4.6 bước 4
    props.onDaLuu();
  };

  return khung(
    <>
      <p className="p6-gioi-thieu">Chọn những đêm tính giá cuối tuần. Các đêm còn lại tính giá ngày thường.</p>
      <section className="p6-the" aria-labelledby="p6-dem">
        <h2 className="p6-nhan-the" id="p6-dem">Đêm cuối tuần</h2>
        <div className="p6-chips">
          {BAY_DEM.map((d) => {
            const bat = chon.includes(d);
            const duyNhat = bat && chon.length === 1; // YC4.6 bước 2, YC4.6-NT4: chỉ còn một đêm thì không tắt được
            return (
              <button key={d} type="button" className={'p6-chip' + (bat ? ' p6-chip--on' : '')} aria-pressed={bat} aria-disabled={duyNhat || undefined}
                      onClick={() => datChon((c) => doiDemCuoiTuan(c ?? [], d))}>
                {bat && <Icon co={13}>{ICON_TICK}</Icon>}{tenDemIso(d)}
              </button>
            );
          })}
        </div>
        <p className="p6-ghi-chu">Tính theo đêm ở. VD: nhận phòng T6, trả phòng CN là 2 đêm cuối tuần.</p>
      </section>
      {goc.mau && coGia && mau && (
        <section className="p6-the" aria-labelledby="p6-tuan">
          <h2 className="p6-nhan-the p6-nhan-the--hoa" id="p6-tuan">Một tuần của phòng {goc.mau.maCan.trim()}</h2>
          <ul className="p6-tuan">
            {mau.map((o) => (
              <li key={o.thu} aria-label={`${o.ten} ${o.gia === null ? 'chưa có giá' : vietTienGon(o.gia)}`} className={'p6-o' + (o.laCuoiTuan ? ' p6-o--cuoi' : '')} data-thu={o.thu}>
                <span className="p6-o-ten">{o.ten}</span>
                <span className="p6-o-gia">{o.gia === null ? '–' : vietTienGon(o.gia)}</span>
              </li>
            ))}
          </ul>
          <p className="p6-ghi-chu">Ô xanh tính giá cuối tuần. Tên ô giá ở mục Giá của căn đổi theo lựa chọn này.</p>
        </section>
      )}
    </>,
    <div className="p6-chan">
      <NutGhi chu="Lưu thay đổi" onGhi={luu} />
    </div>,
  );
}
