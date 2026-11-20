// US60 · S7-03 Đặt phòng và yêu cầu của sale, S7-03-00 chưa có yêu cầu nào (YC11.3, canvas S7-03).
// Mở từ dòng "Xem tất cả đặt phòng và yêu cầu" ở S7 (YC11-H5). Canvas không có nút quay lại; thêm nút quay lại về S7 vì đây
// là màn con của tab Thống kê (Claude tự chọn). Mỗi lần đọc 50 dòng, "Xem thêm" đọc tiếp (YC11 "Dữ liệu").
// HV1: lần đầu khung xám. HV2: chưa tải được thì Thử lại; đã có dòng thì giữ. HV3: quay lại từ nền thì đọc lại từ đầu.
// YC11.3 bước 4, YC11.3-NT9: chạm dòng gọi onChamYeuCau (màn kết quả) hay onChamDatPhong (chi tiết đặt phòng, YC5.9).
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { DaiMatKetNoi, ManChuaTai } from '../chung/matKetNoi';
import { DongDangCapNhat, KhungXam } from '../chung/dangTai';
import { useQuayLaiTuNen } from '../chung/nhap';
import {
  CAU_CHU_THICH, CAU_TRONG, CAU_TRONG_PHU, CHU_THICH_TIEU_DE, CHU_XEM_THEM, dongChinh, dongPhu, manKhiCham, nhanTrangThai,
  TIEU_DE_DS, type DongDanhSach,
} from '../lib/danhSachSale';
import type { DichVuDanhSachSale } from '../lib/dichVuDanhSachSale';
import { homNay as layHomNay, type Ngay } from '../lib/ngay';
import { CHU_TIM_PHONG } from '../lib/thongKeSale';
import { ICON_QUAY_LAI } from './CN704ChiTietSale';
import { Icon } from './TabChu';
import './S7ThongKe.css';
import './S703DanhSach.css';

const MAU_CHIP: Record<'canh-bao' | 'loi' | 'trung-tinh', string> = {
  'canh-bao': 'hh-chip s703-chip s703-chip--canh-bao', loi: 'hh-chip s703-chip s703-chip--loi',
  'trung-tinh': 'hh-chip s703-chip s703-chip--trung-tinh',
};

/** YC11.3 bước 1, 2, 3: một dòng (căn và ngày ở, câu trạng thái, nhãn). */
function Dong(props: { d: DongDanhSach; homNay: Ngay; onCham?: (d: DongDanhSach) => void }) {
  const n = nhanTrangThai(props.d);
  return (
    <li>
      <button type="button" className="s703-dong" data-loai={props.d.loai} data-trang-thai={props.d.trangThai}
              onClick={() => props.onCham?.(props.d)}>
        <span className={'s703-cham' + (n.sang ? ' s703-cham--sang' : '')} aria-hidden="true" />
        <span className="s703-giua">
          <span className="s703-chinh">{dongChinh(props.d)}</span>
          <span className="s703-phu">{dongPhu(props.d, props.homNay)}</span>
        </span>
        <span className={MAU_CHIP[n.mau]}>{n.chu}</span>
      </button>
    </li>
  );
}

export function S703DanhSach(props: {
  dv: DichVuDanhSachSale | undefined; thanhTab?: ReactNode; homNay?: Ngay;
  onQuayLai: () => void; onTimPhong?: () => void;
  onChamYeuCau?: (d: DongDanhSach) => void; onChamDatPhong?: (d: DongDanhSach) => void;
}) {
  const nay = props.homNay ?? layHomNay();
  const [dong, datDong] = useState<DongDanhSach[] | null>(null);
  const [conNua, datConNua] = useState(false);
  const [dangTai, datDangTai] = useState(false);
  const [loi, datLoi] = useState(false);
  const lan = useRef(0);

  const tai = useCallback(async (them: boolean, boQua: number) => {
    const dv = props.dv;
    const so = ++lan.current;
    datLoi(false);
    if (!dv) { datLoi(true); return; } // HV2: thiếu dịch vụ thì báo như mất mạng
    datDangTai(true);
    try {
      const kq = await dv.lay(boQua);
      if (so !== lan.current) return;
      datDong((cu) => (them && cu ? [...cu, ...kq.dong] : kq.dong));
      datConNua(kq.conNua);
    } catch {
      if (so === lan.current) datLoi(true);
    } finally {
      if (so === lan.current) datDangTai(false);
    }
  }, [props.dv]);

  useEffect(() => { void tai(false, 0); }, [tai]);
  useQuayLaiTuNen(() => { void tai(false, 0); }); // HV3: đọc lại từ đầu

  const cham = (d: DongDanhSach) => {
    if (manKhiCham(d) === 'dat-phong') props.onChamDatPhong?.(d);
    else props.onChamYeuCau?.(d);
  };

  let than: ReactNode;
  if (dong == null) {
    than = loi ? <ManChuaTai onThuLai={() => void tai(false, 0)} /> : <KhungXam soDong={5} />;
  } else if (dong.length === 0) {
    // YC11.3 bước 6, S7-03-00.
    than = (
      <section className="s7-the s7-trong" aria-label={CAU_TRONG} data-man="S7-03-00">
        <span className="s7-trong-chinh">{CAU_TRONG}</span>
        <span className="s7-trong-phu">{CAU_TRONG_PHU}</span>
        <button type="button" className="hh-btn hh-btn--primary hh-btn--block" onClick={props.onTimPhong}>{CHU_TIM_PHONG}</button>
      </section>
    );
  } else {
    than = (
      <>
        <section className="s703-nhom" aria-label={TIEU_DE_DS}>
          <h2 className="s703-muc">{TIEU_DE_DS}</h2>
          <ul className="s703-ds">
            {dong.map((d) => <Dong key={`${d.loai}-${d.id}`} d={d} homNay={nay} onCham={cham} />)}
          </ul>
          {conNua && (
            <button type="button" className="hh-btn hh-btn--secondary hh-btn--block" disabled={dangTai}
                    onClick={() => void tai(true, dong.length)}>{CHU_XEM_THEM}</button>
          )}
          {loi && <p className="s703-loi" role="alert">Chưa tải được. <button type="button" className="hh-btn hh-btn--text"
            onClick={() => void tai(true, dong.length)}>Thử lại</button></p>}
        </section>
        {/* YC11.3 bước 5 */}
        <section className="s7-the s703-chu-thich" aria-label={CHU_THICH_TIEU_DE}>
          <h2 className="s703-muc">{CHU_THICH_TIEU_DE}</h2>
          <p className="s703-chu-thich-cau">{CAU_CHU_THICH}</p>
        </section>
      </>
    );
  }

  return (
    <>
      <div className="man man-chu" data-man={dong && dong.length === 0 ? 'S7-03-00' : 'S7-03'}>
        <DaiMatKetNoi />
        <header className="chu-dau">
          <button type="button" className="hh-iconbtn man-quay-lai" aria-label="Quay lại" onClick={props.onQuayLai}>
            <Icon co={22}>{ICON_QUAY_LAI}</Icon>
          </button>
          <h1 className="chu-tieu-de">Thống kê</h1>
        </header>
        <div className="chu-than">
          <div className="cn8-than">
            {dong && dangTai && <DongDangCapNhat />}
            {than}
          </div>
        </div>
      </div>
      {props.thanhTab}
    </>
  );
}
