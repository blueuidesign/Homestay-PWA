// P8 · Xuất file Excel (CSV) (YC1.6, US6). Chip thời gian, chip căn, các cột của file, số đặt phòng đổi theo chip, nút xuất.
// Không có đặt phòng trong khoảng thì P8-00 (YC1.6-NT6). Chỉ chủ nhà có dòng này (YC1.3, PQ20); database kiểm quyền.
// HV1 khung xám, HV2 Thử lại, HV3 quay lại từ nền đếm lại, HV6 không gửi được file thì báo, HV8 toast.
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { guiFile } from '../chung/chiaSe';
import { KhungXam, NutGhi } from '../chung/dangTai';
import { cauBaoLoi, DaiMatKetNoi, ManChuaTai } from '../chung/matKetNoi';
import { useQuayLaiTuNen } from '../chung/nhap';
import { useToast } from '../chung/Toast';
import type { CanChip, DichVuXuatCsv } from '../lib/dichVuXuatCsv';
import { homNay } from '../lib/ngay';
import { COT_CSV, kiemKhoang, khoangChip, taoCsv, tenFileCsv, type ChipThoiGian, type Khoang } from '../lib/xuatCsv';
import { Icon } from './TabChu';
import './CN1LichThang.css';
import './P2HoSo.css';
import './P8XuatCsv.css';

/** YC1.6 bước 1. */
export const CAU_GIOI_THIEU_CSV = 'Danh sách đặt phòng để xem hoặc tính toán trên Excel, Google Sheets.';
/** P8-00. */
export const CAU_KHONG_CO_DAT_PHONG = 'Khoảng thời gian này chưa có đặt phòng. Chọn khoảng khác.';
const ICON_QUAY_LAI = <path d="m15 18-6-6 6-6" />;

export function P8XuatCsv(props: { dv?: DichVuXuatCsv; onQuayLai: () => void; homNay?: string }) {
  const hienToast = useToast();
  const dv = props.dv;
  const hom = props.homNay ?? homNay();
  const [dsCan, datDsCan] = useState<CanChip[] | undefined>(undefined);
  const [hong, datHong] = useState(false);
  const [chip, datChip] = useState<ChipThoiGian>('thang-nay');
  const [tuyChon, datTuyChon] = useState<Khoang>(() => khoangChip('thang-nay', hom));
  const [canId, datCanId] = useState<string | null>(null);
  const [so, datSo] = useState<number | undefined>(undefined);
  const [loiDem, datLoiDem] = useState(false);
  const lan = useRef(0);

  const khoang: Khoang = chip === 'tuy-chon' ? tuyChon : khoangChip(chip, hom);
  const loiKhoang = kiemKhoang(khoang.tu, khoang.den);

  const taiCan = useCallback(async () => {
    datHong(false);
    try {
      if (!dv) throw new TypeError('chưa nối database');
      datDsCan(await dv.dsCan());
    } catch {
      datHong(true);
    }
  }, [dv]);
  useEffect(() => { void taiCan(); }, [taiCan]);

  const dem = useCallback(async () => {
    const lanNay = ++lan.current;
    datSo(undefined);
    datLoiDem(false);
    if (!dv || loiKhoang) return;
    try {
      const n = await dv.dem(khoang.tu, khoang.den, canId);
      if (lanNay === lan.current) datSo(n);
    } catch {
      if (lanNay === lan.current) datLoiDem(true);
    }
  }, [dv, khoang.tu, khoang.den, canId, loiKhoang]);
  useEffect(() => { if (dsCan) void dem(); }, [dsCan, dem]);
  useQuayLaiTuNen(() => { if (dsCan) void dem(); });

  const khung = (than: ReactNode, chan?: ReactNode) => (
    <div className="man p2 p8" data-man={so === 0 ? 'P8-00' : 'P8'}>
      <DaiMatKetNoi />
      <header className="p2-dau">
        <button type="button" className="hh-iconbtn man-quay-lai" aria-label="Quay lại" onClick={props.onQuayLai}><Icon co={22}>{ICON_QUAY_LAI}</Icon></button>
        <h1 className="p2-tieu-de">Xuất file Excel (CSV)</h1>
      </header>
      <div className="p2-than">{than}</div>
      {chan}
    </div>
  );

  if (!dsCan) return khung(hong ? <ManChuaTai onThuLai={() => void taiCan()} /> : <KhungXam soDong={4} />);

  const xuat = async () => {
    let dong;
    try {
      dong = await dv!.xuat(khoang.tu, khoang.den, canId);
    } catch (e) {
      hienToast(cauBaoLoi(e), 'loi'); // HV2: giữ lựa chọn
      return;
    }
    const file = new File([taoCsv(dong)], tenFileCsv(khoang.tu, khoang.den), { type: 'text/csv;charset=utf-8' });
    await guiFile(file, hienToast);
  };

  const nutChip = (dang: boolean, chu: string, onChon: () => void, key?: string) => (
    <button key={key} type="button" aria-pressed={dang} className={'hh-chip' + (dang ? ' hh-chip--on' : '')} onClick={onChon}>{chu}</button>
  );
  const chipTg: [ChipThoiGian, string][] = [['thang-nay', 'Tháng này'], ['ba-thang', '3 tháng gần nhất'], ['ca-nam', `Năm ${hom.slice(0, 4)}`], ['tuy-chon', 'Tùy chọn']];

  let dongSo: ReactNode;
  if (loiKhoang) dongSo = <p className="p8-loi" role="alert">{loiKhoang}</p>;
  else if (loiDem) dongSo = <ManChuaTai onThuLai={() => void dem()} />;
  else if (so === undefined) dongSo = <p className="p8-so" aria-busy="true">Đang đếm…</p>;
  else dongSo = (
    <div className="p8-dem" data-testid="so-dat-phong">
      <p className="p8-so">{so} đặt phòng</p>
      {so === 0 && <p className="p8-trong">{CAU_KHONG_CO_DAT_PHONG}</p>}
    </div>
  );

  return khung(
    <>
      <p className="hh-field__hint">{CAU_GIOI_THIEU_CSV}</p>
      <section className="p8-nhom" aria-label="Thời gian">
        <h2 className="p8-nhan">Thời gian</h2>
        <div className="p8-chips">{chipTg.map(([k, chu]) => nutChip(chip === k, chu, () => datChip(k), k))}</div>
        {chip === 'tuy-chon' && (
          <div className="p8-tuy-chon">
            <div className="hh-field">
              <label className="hh-field__label" htmlFor="p8-tu">Từ ngày</label>
              <input id="p8-tu" className="hh-input" type="date" value={tuyChon.tu} onChange={(e) => datTuyChon({ ...tuyChon, tu: e.target.value })} />
            </div>
            <div className="hh-field">
              <label className="hh-field__label" htmlFor="p8-den">Đến ngày</label>
              <input id="p8-den" className="hh-input" type="date" value={tuyChon.den} onChange={(e) => datTuyChon({ ...tuyChon, den: e.target.value })} />
            </div>
          </div>
        )}
      </section>
      <section className="p8-nhom" aria-label="Căn">
        <h2 className="p8-nhan">Căn</h2>
        <div className="p8-chips">
          {nutChip(canId === null, 'Tất cả', () => datCanId(null))}
          {dsCan.map((c) => nutChip(canId === c.id, c.maCan, () => datCanId(c.id), c.id))}
        </div>
      </section>
      <p className="p8-cot">FILE GỒM CÁC CỘT: {COT_CSV.join(' · ')}</p>
      {dongSo}
    </>,
    <div className="p2-chan">
      <NutGhi chu="📊 Xuất file Excel (CSV)" chuDangGhi="Đang xuất…" onGhi={xuat} disabled={!so || !!loiKhoang} />
    </div>,
  );
}
