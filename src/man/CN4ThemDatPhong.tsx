// CN4 · Thêm đặt phòng (YC5.1): chọn căn, ngày, số đêm, kiểm trùng sớm. PQ7.CHU, QT1.1, QT2.1.
// Trạng thái (YC5 Trạng thái màn): HV1 khung xám tại chỗ khi đọc căn, đặt phòng; HV2 dải mất mạng, vẫn nhập được;
// HV3 nháp trên máy, quay lại từ nền đọc lại đặt phòng và chạy lại dòng kiểm.
// Hàng chip người đặt, tiền phòng, phần thêm chi tiết (YC5.2) và lưu (YC5.3) làm ở US27, US28: nút "Thêm đặt phòng"
// luôn hiện nhưng chưa bấm được (YC5.2: chưa chọn người đặt thì không bấm được).
import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { KhungXam, NutGhi } from '../chung/dangTai';
import { DaiMatKetNoi, ManChuaTai } from '../chung/matKetNoi';
import { CAU_KHOI_PHUC, useQuayLaiTuNen } from '../chung/nhap';
import {
  chipCuaSoDem, demTrongDauTien, docBanNhapDatPhong, ghiBanNhapDatPhong, kiemNgay, ngayTraTheoSoDem, soDemGiua,
  xoaBanNhapDatPhong, type ChipDem,
} from '../lib/datPhong';
import type { DichVuDatPhong } from '../lib/dichVuDatPhong';
import { mauCan, type CanLich, type DatPhongLich } from '../lib/lich';
import { homNay as homNayVN, laNgay, type Ngay } from '../lib/ngay';
import { Icon } from './TabChu';
import './CN1LichThang.css';
import './CN4ThemDatPhong.css';

const ICON_DONG = <><path d="M18 6 6 18" /><path d="m6 6 12 12" /></>;
const CHIP_DEM: { gt: ChipDem; chu: string }[] = [
  { gt: 1, chu: '1 đêm' }, { gt: 2, chu: '2 đêm' }, { gt: 3, chu: '3 đêm' }, { gt: 'tuy-chon', chu: 'Tùy chọn' },
];

function taoMaLanGui(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  } catch { /* máy cũ */ }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (k) => {
    const r = (Math.random() * 16) | 0;
    return (k === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

/** YC5.1 bước 1a: đặt phòng chưa hủy các căn của chủ nhà. HV1 khung xám, HV2 lỗi thì Thử lại, HV3 đọc lại khi quay lại. */
function useDatPhong(dv: DichVuDatPhong | undefined, canIds: string[]) {
  const [ds, datDs] = useState<DatPhongLich[] | undefined>(undefined);
  const [loi, datLoi] = useState(false);
  const lan = useRef(0);
  const khoa = canIds.join(',');
  const tai = useCallback(async () => {
    if (!khoa) return;
    const so = ++lan.current;
    datLoi(false);
    try {
      if (!dv) throw new TypeError('chưa nối database');
      const d = await dv.layDatPhong(khoa.split(','));
      if (so === lan.current) datDs(d);
    } catch {
      if (so === lan.current) datLoi(true);
    }
  }, [dv, khoa]);
  useEffect(() => { void tai(); }, [tai]);
  useQuayLaiTuNen(() => { void tai(); });
  useEffect(() => {
    const lai = () => { void tai(); };
    window.addEventListener('online', lai);
    return () => window.removeEventListener('online', lai);
  }, [tai]);
  return { ds, loi, tai };
}

export function CN4ThemDatPhong(props: {
  /** Căn có lịch, chưa ẩn của chủ nhà, theo thứ tự ở tab Lịch; undefined khi đang đọc. */
  ds: CanLich[] | undefined;
  dv: DichVuDatPhong | undefined;
  /** YC5.1 bước 1b: căn và ngày nhận khi mở từ dòng căn trống ở chi tiết ngày CN3. */
  canIdBanDau?: string;
  ngayBanDau?: Ngay;
  /** Hôm nay theo giờ Việt Nam; test truyền ngày cố định. */
  homNay?: Ngay;
  onDong: () => void;
}) {
  const homNay = props.homNay ?? homNayVN();
  // HV3 bước 3: mở lại form (không kèm căn, ngày từ CN3) có nháp thì điền lại. Mở từ CN3 thì theo căn, ngày đã chọn.
  const [dau] = useState(() => {
    const tuCN3 = !!props.canIdBanDau && !!props.ngayBanDau && laNgay(props.ngayBanDau);
    const nhap = tuCN3 ? null : docBanNhapDatPhong();
    if (nhap) return { ...nhap, khoiPhuc: true };
    return {
      canId: tuCN3 ? props.canIdBanDau! : '',
      ngayNhan: tuCN3 ? props.ngayBanDau! : '',
      ngayTra: tuCN3 ? ngayTraTheoSoDem(props.ngayBanDau!, 1) : '',
      tuyChon: false, clientId: taoMaLanGui(), khoiPhuc: false,
    };
  });
  const [canId, datCanId] = useState(dau.canId);
  const [ngayNhan, datNgayNhan] = useState<string>(dau.ngayNhan);
  const [ngayTra, datNgayTra] = useState<string>(dau.ngayTra);
  const [tuyChon, datTuyChon] = useState(dau.tuyChon);
  const [moTra, datMoTra] = useState(dau.tuyChon);
  const [clientId] = useState(dau.clientId || taoMaLanGui());
  const daSua = useRef(dau.khoiPhuc);

  const canIds = (props.ds ?? []).map((c) => c.id);
  const { ds: datPhong, loi, tai } = useDatPhong(props.dv, canIds);

  // YC5.1 bước 1a: căn chọn sẵn là căn đầu tiên; căn trong nháp hay đường dẫn không còn (đã ẩn) thì cũng về căn đầu.
  const canDau = props.ds?.[0]?.id ?? '';
  const canHopLe = !!props.ds?.some((c) => c.id === canId);
  useEffect(() => { if (props.ds && !canHopLe && canDau) datCanId(canDau); }, [props.ds, canHopLe, canDau]);

  // YC5.1 bước 1a, YC5.1-NT4: ngày nhận điền sẵn là đêm trống đầu tiên của căn từ hôm nay, số đêm 1.
  // Chưa đọc được đặt phòng (HV2) thì điền hôm nay; dòng kiểm báo chưa tải được.
  useEffect(() => {
    if (ngayNhan || !canHopLe || (datPhong === undefined && !loi)) return;
    const nhan = datPhong ? demTrongDauTien(datPhong, canId, homNay) : homNay;
    datNgayNhan(nhan);
    datNgayTra(ngayTraTheoSoDem(nhan, 1));
  }, [ngayNhan, canHopLe, datPhong, loi, canId, homNay]);

  // HV3 bước 1: lưu nháp mỗi lần người dùng sửa.
  useEffect(() => {
    if (!daSua.current || !canId || !laNgay(ngayNhan) || !laNgay(ngayTra)) return;
    ghiBanNhapDatPhong({ canId, ngayNhan, ngayTra, tuyChon, clientId });
  }, [canId, ngayNhan, ngayTra, tuyChon, clientId]);

  const soDem = laNgay(ngayNhan) && laNgay(ngayTra) ? soDemGiua(ngayNhan, ngayTra) : null;
  const chipSang: ChipDem = tuyChon ? 'tuy-chon' : chipCuaSoDem(soDem);

  // YC5.1 bước 2: đổi căn giữ ngày; dòng kiểm tự chạy lại.
  const chonCan = (id: string) => { daSua.current = true; datCanId(id); };
  // YC5.1 bước 3: chip số đêm đặt ngày trả; "Tùy chọn" mở ô ngày trả.
  const chonDem = (c: ChipDem) => {
    daSua.current = true;
    if (c === 'tuy-chon') { datTuyChon(true); datMoTra(true); return; }
    datTuyChon(false);
    datMoTra(false);
    if (laNgay(ngayNhan)) datNgayTra(ngayTraTheoSoDem(ngayNhan, c));
  };
  // YC5.1 bước 3b: đổi ngày nhận giữ số đêm đang chọn, dời ngày trả theo.
  const doiNhan = (v: string) => {
    daSua.current = true;
    datNgayNhan(v);
    if (laNgay(v)) datNgayTra(ngayTraTheoSoDem(v, soDem && soDem > 0 ? soDem : 1));
  };
  // YC5.1 bước 3: đổi ngày trả bằng tay thì chip tương ứng tự sáng.
  const doiTra = (v: string) => { daSua.current = true; datTuyChon(false); datNgayTra(v); };
  // HV3 bước 5: bỏ form thì xóa nháp.
  const dong = () => { xoaBanNhapDatPhong(); props.onDong(); };

  const kiem = canHopLe && datPhong ? kiemNgay(datPhong, canId, ngayNhan, ngayTra) : null;

  let dongKiem;
  if (loi) dongKiem = <ManChuaTai onThuLai={() => void tai()} />;
  else if (!kiem) dongKiem = <KhungXam soDong={1} />;
  else if (kiem.loai === 'khong-trung') dongKiem = <p className="cn4-kiem">{kiem.chu}</p>;
  else if (kiem.loai !== 'chua-du') dongKiem = <p className="cn4-kiem cn4-kiem--do" role="alert">{kiem.chu}</p>;

  return (
    <div className="man cn4">
      <header className="cn4-dau">
        <h1 className="cn4-tieu-de">Thêm đặt phòng</h1>
        <button type="button" className="cn4-dong" aria-label="Đóng" onClick={dong}><Icon co={24}>{ICON_DONG}</Icon></button>
      </header>
      <DaiMatKetNoi />
      <div className="cn4-than">
        {dau.khoiPhuc && <p className="cn4-khoi-phuc" role="status">{CAU_KHOI_PHUC}</p>}

        <div className="cn4-muc">
          <span className="cn4-nhan" id="cn4-phong">Phòng</span>
          {props.ds === undefined ? <KhungXam soDong={1} /> : (
            <div className="cn4-chips" role="group" aria-labelledby="cn4-phong">
              {props.ds.map((c, i) => (
                <button key={c.id} type="button" aria-pressed={c.id === canId} style={{ '--mau-can': mauCan(i) } as CSSProperties}
                        className={'hh-chip cn1-chip' + (c.id === canId ? ' hh-chip--on' : '')} onClick={() => chonCan(c.id)}>
                  <span className="hh-chip__dot" aria-hidden="true" />{c.maCan}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="cn4-dem" role="group" aria-label="Số đêm">
          {CHIP_DEM.map((c) => (
            <button key={c.chu} type="button" role="checkbox" aria-checked={chipSang === c.gt}
                    className={'hh-check' + (chipSang === c.gt ? ' hh-check--on' : '')} onClick={() => chonDem(c.gt)}>
              <span className="hh-check__box" aria-hidden="true" /><span>{c.chu}</span>
            </button>
          ))}
        </div>

        <div className="cn4-ngay">
          <label className="hh-field">
            <span className="hh-field__label">Ngày nhận phòng</span>
            <input type="date" className="hh-input" value={ngayNhan} onChange={(e) => doiNhan(e.target.value)} />
          </label>
          <label className="hh-field">
            <span className="hh-field__label">Ngày trả phòng</span>
            <input type="date" className="hh-input" value={ngayTra} disabled={!moTra}
                   min={laNgay(ngayNhan) ? ngayTraTheoSoDem(ngayNhan, 1) : undefined} onChange={(e) => doiTra(e.target.value)} />
          </label>
        </div>
        {/* YC5.1 bước 4: báo sớm; chặn thật ở database (QD6). */}
        <div className="cn4-dong-kiem">{dongKiem}</div>
      </div>

      <div className="cn4-thanh-duoi">
        {/* YC5.2, YC5.3: chưa chọn người đặt (US27) thì chưa bấm được; trùng đêm cũng không bấm được (YC5.1 bước 4). */}
        <NutGhi chu="Thêm đặt phòng" disabled onGhi={() => undefined} />
      </div>
    </div>
  );
}
