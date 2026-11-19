// CN3 · Chi tiết một ngày (YC2.2), mở ngay dưới lưới CN1. PQ4.CHU, PQ7.CHU, PQ8.CHU, PQ9.CHU, QT2.1, QT6.1.
// Dùng dữ liệu tháng đã đọc (YC2.2 bước 7), không đọc thêm: trạng thái tải, mất mạng theo CN1 (HV1, HV2, HV3).
// Ngày đã qua hiện như ngày khác, nút "Đặt phòng" vẫn có để ghi bù (QD25, YC2-H6).
import type { CSSProperties } from 'react';
import { tenCan } from '../lib/can';
import {
  chuNguoiDat, chuTien, dongCuaNgay, khoangNgay, tieuDeNgay, vietSoDienThoai, type CanLich, type DatPhongLich,
} from '../lib/lich';
import type { Ngay } from '../lib/ngay';
import { Icon, ICON_LICH, ICON_THEM } from './TabChu';
import './CN3ChiTietNgay.css';

const ICON_NGUOI = <><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>;
const ICON_DIEN_THOAI = <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />;
const ICON_VI = <><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" /><path d="M3 5v14a2 2 0 0 0 2 2h16v-5" /><path d="M18 12a2 2 0 0 0 0 4h4v-4Z" /></>;
const ICON_GHI_CHU = <><path d="M15.5 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h14a2 2 0 0 0 2-2V8.5L15.5 3Z" /><path d="M15 3v6h6" /></>;

function DongCoKhach(props: { can: CanLich; b: DatPhongLich; mau?: string; onMo: () => void }) {
  const { b } = props;
  const sdt = b.nguoiDat?.loai === 'sale' ? b.nguoiDat.sdt : null; // YC2.2 bước 8: số của sale đang kết nối
  return (
    <li className="cn3-dong cn3-dong--co" aria-label={tenCan(props.can.maCan)} style={{ '--mau-can': props.mau } as CSSProperties}>
      {/* YC2.2 bước 9: chạm dòng mở chi tiết đặt phòng; nút phủ cả dòng, số điện thoại nằm trên nút. */}
      <button type="button" className="cn3-mo" onClick={props.onMo}>{tenCan(props.can.maCan)}</button>
      <div className="cn3-hang"><Icon co={14}>{ICON_NGUOI}</Icon><span className="cn3-nguoi">{chuNguoiDat(b.nguoiDat)}</span></div>
      {sdt && (
        <div className="cn3-hang"><Icon co={14}>{ICON_DIEN_THOAI}</Icon>
          <a className="cn3-so" href={`tel:${sdt}`}>{vietSoDienThoai(sdt)}</a>
        </div>
      )}
      <div className="cn3-hang"><Icon co={14}>{ICON_LICH}</Icon><span>{khoangNgay(b.ngayNhan, b.ngayTra)}</span></div>
      {b.tienPhong !== undefined && (
        <div className="cn3-hang"><Icon co={14}>{ICON_VI}</Icon><span>{chuTien(b.tienPhong, b.trangThaiTien, b.tienCoc)}</span></div>
      )}
      {b.ghiChu && <div className="cn3-hang"><Icon co={14}>{ICON_GHI_CHU}</Icon><span className="cn3-ghi-chu">{b.ghiChu}</span></div>}
    </li>
  );
}

export function CN3ChiTietNgay(props: {
  ngay: Ngay;
  /** Căn đang hiện theo chip (YC2.2 bước 7). */
  ds: CanLich[];
  /** Booking chưa hủy của tháng đã đọc ở CN1. */
  datPhong: readonly DatPhongLich[];
  mau: Map<string, string>;
  /** YC2.2 bước 9: mở chi tiết đặt phòng CN3-02 (YC5). */
  onMoDatPhong: (id: string) => void;
  /** YC2.2 bước 10: form ghi đặt phòng (YC5). */
  onDatPhong: () => void;
}) {
  const tieuDe = tieuDeNgay(props.ngay);
  return (
    <section className="cn3" aria-label={tieuDe}>
      <h2 className="cn3-tieu-de">{tieuDe}</h2>
      <ul className="cn3-ds">
        {dongCuaNgay(props.datPhong, props.ds, props.ngay).map(({ can, datPhong }) =>
          datPhong ? (
            <DongCoKhach key={can.id} can={can} b={datPhong} mau={props.mau.get(can.id)} onMo={() => props.onMoDatPhong(datPhong.id)} />
          ) : (
            <li key={can.id} className="cn3-dong cn3-dong--trong" aria-label={tenCan(can.maCan)}>
              <span className="cn3-ten">{tenCan(can.maCan)}<span className="cn3-trong"> · Trống ✓</span></span>
              <button type="button" className="hh-btn hh-btn--text cn3-dat" onClick={props.onDatPhong}>
                <Icon>{ICON_THEM}</Icon>Đặt phòng
              </button>
            </li>
          ),
        )}
      </ul>
    </section>
  );
}
