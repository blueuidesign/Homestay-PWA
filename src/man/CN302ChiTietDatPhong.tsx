// CN3-02 · Chi tiết đặt phòng và thu tiền (YC5.5), CN3-02-01 · sale đã xóa tài khoản (YC5.5 bước 22, QD13).
// Đọc qua fn_chi_tiet_dat_phong (PQ7.CHU, PQ8.CHU, PQ9.CHU): khách do sale nhập không bao giờ có (QD11, QT6.2).
// Ghi qua fn_da_thu_du, fn_hoan_tac_thu_du (QT6.1). Trạng thái: HV1 khung xám, HV2 chưa tải được thì Thử lại, HV3 quay lại từ
// nền đọc lại, HV5 đặt phòng không còn thì về màn trước với toast, HV8 toast. Nút Sửa mở CN4-02 (YC5.6 bước 24, US31).
// Xóa đặt phòng khách lẻ (YC5.7, US32): hỏi lại rồi gọi fn_xoa_booking (quy tắc "Xóa phải bấm hai lần", PQ7.CHU); đặt phòng
// có sale không có nút Xóa, chỉ Sửa và Xin hủy (quy tắc "Không xóa đặt phòng của sale", QD12). Xin hủy (YC5.8): US sau.
import { useCallback, useEffect, useState, type CSSProperties } from 'react';
import { KhungXam, NutGhi } from '../chung/dangTai';
import { cauBaoLoi, DaiMatKetNoi, ManChuaTai } from '../chung/matKetNoi';
import { useQuayLaiTuNen } from '../chung/nhap';
import { useToast } from '../chung/Toast';
import { ngayThang, tenCan } from '../lib/can';
import {
  cauKhachCuaSale, cauSaleDaXoa, dongGioNhanTra, nhanTrangThaiTien, tienConLai, tieuDeChiTiet, type ChiTietDatPhong,
} from '../lib/datPhong';
import type { DichVuDatPhong } from '../lib/dichVuDatPhong';
import { khoangNgay, vietSoDienThoai } from '../lib/lich';
import { vietTien } from '../lib/tien';
import { Icon } from './TabChu';
import './CN302ChiTietDatPhong.css';

/** YC5.5 HV5: đặt phòng vừa bị xóa hay hủy ở máy khác. */
export const CAU_KHONG_CON = 'Đặt phòng này không còn';
export const CAU_SE_CO = 'Sẽ có ở bản sau';
/** YC5.7 bước 31. */
export const CAU_DA_XOA = 'Đã xóa đặt phòng';

/** YC5.7 bước 30: "Xác nhận xóa đặt phòng? Ngày 13/10 → 15/10 của 1509 trống lại." */
export function cauHoiXoa(d: Pick<ChiTietDatPhong, 'ngayNhan' | 'ngayTra' | 'maCan'>): string {
  return `Xác nhận xóa đặt phòng? Ngày ${ngayThang(d.ngayNhan)} → ${ngayThang(d.ngayTra)} của ${d.maCan.trim()} trống lại.`;
}

/** YC5.7 bước 30, quy tắc "Xóa phải bấm hai lần": hộp hỏi lại với hai nút "Xóa" và "Không". */
function HoiXoa(props: { cau: string; onXoa: () => Promise<unknown>; onKhong: () => void }) {
  return (
    <>
      <div className="cn302-man-toi" onClick={props.onKhong} aria-hidden="true" />
      <div className="cn302-hoi" role="alertdialog" aria-modal="true" aria-label="Xác nhận xóa đặt phòng">
        <p className="cn302-hoi-cau">{props.cau}</p>
        <div className="cn302-hoi-nut">
          <button type="button" className="hh-btn hh-btn--secondary hh-btn--block" onClick={props.onKhong}>Không</button>
          <NutGhi chu="Xóa" chuDangGhi="Đang xóa…" lop="hh-btn hh-btn--primary hh-btn--block cn302-nut-xoa" onGhi={props.onXoa} />
        </div>
      </div>
    </>
  );
}

const ICON_QUAY_LAI = <path d="m15 18-6-6 6-6" />;
const ICON_SUA = <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />;
const ICON_GOI = <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />;

/** Chữ đầu trong ô tròn: "Sale Hùng" → "H", "Bà Lan" → "B". */
function chuDau(ten: string): string {
  return (ten.replace(/^Sale\s+/i, '').trim()[0] ?? '?').toUpperCase();
}

/** YC5.5 bước 17, 22: người đặt là sale. */
function TheSale({ d }: { d: ChiTietDatPhong }) {
  const ten = d.tenSale ?? 'Sale';
  const phu = [d.sdtSale ? vietSoDienThoai(d.sdtSale) : null, d.soKhach ? `${d.soKhach} khách` : null].filter(Boolean).join(' · ');
  return (
    <section className="cn302-the" aria-label="Người đặt">
      <div className="cn302-nguoi">
        <span className="cn302-tron" aria-hidden="true">{chuDau(ten)}</span>
        <div className="cn302-nguoi-chu">
          <span className="cn302-ten">{ten}{d.saleDaXoa && <span className="cn302-da-xoa">đã xóa tài khoản</span>}</span>
          {phu && <span className="cn302-phu">{phu}</span>}
        </div>
        {/* YC5.5 bước 18: gọi sale bằng tel:; sale đã xóa tài khoản hay không còn kết nối thì không có số, không có nút. */}
        {d.sdtSale && !d.saleDaXoa && (
          <a className="hh-btn hh-btn--secondary hh-btn--pill cn302-goi" href={`tel:${d.sdtSale}`}><Icon>{ICON_GOI}</Icon>Gọi sale</a>
        )}
      </div>
      <p className="cn302-cau">{d.saleDaXoa ? cauSaleDaXoa(ten) : cauKhachCuaSale(ten)}</p>
    </section>
  );
}

/** YC5.5 bước 17b, YC5.5-NT6: khách lẻ; tên, số chủ nhà đã nhập (YC5-H2), nút "Gọi khách" khi có số (QD25). */
function TheKhach({ d }: { d: ChiTietDatPhong }) {
  const ten = d.tenKhach?.trim() || 'Khách lẻ';
  const phu = [d.sdtKhach ? vietSoDienThoai(d.sdtKhach) : null, d.soKhach ? `${d.soKhach} khách` : null].filter(Boolean).join(' · ');
  return (
    <section className="cn302-the" aria-label="Người đặt">
      <div className="cn302-nguoi">
        <span className="cn302-tron" aria-hidden="true">{chuDau(ten)}</span>
        <div className="cn302-nguoi-chu">
          <span className="cn302-ten">{ten}</span>
          {phu && <span className="cn302-phu">{phu}</span>}
        </div>
        {d.sdtKhach && (
          <a className="hh-btn hh-btn--secondary hh-btn--pill cn302-goi" href={`tel:${d.sdtKhach}`}><Icon>{ICON_GOI}</Icon>Gọi khách</a>
        )}
      </div>
    </section>
  );
}

function useChiTiet(dv: DichVuDatPhong | undefined, id: string) {
  // undefined: chưa đọc xong; null: không còn (HV5).
  const [ct, datCt] = useState<ChiTietDatPhong | null | undefined>(undefined);
  const [loi, datLoi] = useState(false);
  const tai = useCallback(async () => {
    if (!dv?.layChiTiet) return;
    datLoi(false);
    try {
      datCt(await dv.layChiTiet(id));
    } catch {
      datLoi(true);
    }
  }, [dv, id]);
  useEffect(() => { void tai(); }, [tai]);
  return { ct, datCt, loi, tai };
}

export function CN302ChiTietDatPhong(props: {
  id: string;
  dv: DichVuDatPhong | undefined;
  /** Màu của căn theo tab Lịch (YC2 Quy tắc "Màu theo căn"). */
  mau?: (canId: string) => string | undefined;
  onQuayLai: () => void;
  /** HV5: đặt phòng không còn thì về màn trước. */
  onKhongCon: () => void;
  /** YC5.6 bước 24: mở form sửa CN4-02. Không có thì báo "Sẽ có ở bản sau". */
  onSua?: () => void;
  /** YC5.7 bước 31, quy tắc "Về màn đã mở": xóa xong thì về đúng màn đã mở chi tiết đặt phòng. */
  onDaXoa?: () => void;
}) {
  const { ct, datCt, loi, tai } = useChiTiet(props.dv, props.id);
  const hienToast = useToast();
  const { onKhongCon } = props;
  useQuayLaiTuNen(() => { void tai(); }); // HV3: quay lại từ nền thì đọc lại
  const [hoiXoa, datHoiXoa] = useState(false);

  useEffect(() => {
    if (ct === null) { hienToast(CAU_KHONG_CON, 'loi'); onKhongCon(); }
  }, [ct, hienToast, onKhongCon]);

  // YC5.5 bước 20, 21: ghi xong thì đổi nhãn và nút theo trạng thái database trả về.
  const ghi = async (lenh: ((id: string) => Promise<ChiTietDatPhong['trangThaiTien']>) | undefined, hoanTac: boolean) => {
    if (!lenh || !ct) return;
    try {
      const tt = await lenh(ct.id);
      datCt({ ...ct, trangThaiTien: tt, coHoanTac: !hoanTac && tt === 'da_thanh_toan' });
    } catch (e) {
      hienToast(cauBaoLoi(e), 'loi');
    }
  };

  // YC5.7 bước 31, 32: xóa được thì toast và về màn đã mở; database từ chối thì toast câu lỗi (QT5.5); không còn thì HV5.
  const xoa = async () => {
    if (!ct) return;
    if (!props.dv?.xoaDatPhong) { datHoiXoa(false); hienToast(CAU_SE_CO); return; }
    try {
      await props.dv.xoaDatPhong(ct.id);
      hienToast(CAU_DA_XOA);
      (props.onDaXoa ?? props.onQuayLai)();
    } catch (e) {
      datHoiXoa(false);
      if ((e as { code?: string }).code === '42501') { datCt(null); return; }
      hienToast(cauBaoLoi(e), 'loi');
    }
  };

  let than;
  if (ct === undefined || ct === null) {
    than = loi ? <ManChuaTai onThuLai={() => void tai()} /> : <KhungXam />;
  } else {
    const nhan = nhanTrangThaiTien(ct.trangThaiTien);
    const conLai = tienConLai(ct.tienPhong, ct.tienCoc, ct.trangThaiTien);
    than = (
      <>
        <section className="cn302-the cn302-the--dau" style={{ '--mau-can': props.mau?.(ct.canId) } as CSSProperties}>
          <div className="cn302-dong-can">
            <span className="cn302-cham" aria-hidden="true" />
            <span className="cn302-can">{tenCan(ct.maCan)}</span>
            {nhan && <span className={`cn302-nhan cn302-nhan--${ct.trangThaiTien}`}>{nhan}</span>}
          </div>
          <span className="cn302-ngay">{khoangNgay(ct.ngayNhan, ct.ngayTra)}</span>
          <span className="cn302-gio">{dongGioNhanTra(ct.ngayNhan, ct.ngayTra, ct.gioNhan, ct.gioTra)}</span>
        </section>
        {ct.saleId ? <TheSale d={ct} /> : <TheKhach d={ct} />}
        <section className="cn302-the" aria-label="Tiền">
          <h2 className="cn302-muc">Tiền</h2>
          <div className="cn302-hang"><span>Tiền phòng</span><b>{vietTien(ct.tienPhong)}</b></div>
          {ct.tienCoc !== null && <div className="cn302-hang"><span>Đã cọc</span><b>{vietTien(ct.tienCoc)}</b></div>}
          <div className="cn302-hang cn302-hang--con"><span>Còn lại</span><b className="cn302-con-lai">{vietTien(conLai)}</b></div>
        </section>
        {ct.ghiChu && (
          <section className="cn302-the" aria-label="Ghi chú">
            <h2 className="cn302-muc">Ghi chú</h2>
            <p className="cn302-ghi-chu">{ct.ghiChu}</p>
          </section>
        )}
        {!ct.daHuy && (ct.saleId ? (
          // YC5.7-NT3, NT5: đặt phòng có sale chỉ Sửa hay Xin hủy. Xin hủy (YC5.8) làm ở US sau.
          <button type="button" className="hh-btn hh-btn--text cn302-nut-phu" onClick={() => hienToast(CAU_SE_CO)}>Xin hủy</button>
        ) : (
          <button type="button" className="hh-btn hh-btn--text cn302-nut-phu cn302-nut-phu--xoa" onClick={() => datHoiXoa(true)}>Xóa đặt phòng</button>
        ))}
      </>
    );
  }

  const chan = ct && !ct.daHuy && ct.trangThaiTien !== null && (ct.trangThaiTien !== 'da_thanh_toan' || ct.coHoanTac);
  return (
    <div className="man cn302">
      <DaiMatKetNoi />
      <header className="cn302-dau">
        <button type="button" className="hh-iconbtn man-quay-lai" aria-label="Quay lại" onClick={props.onQuayLai}><Icon co={22}>{ICON_QUAY_LAI}</Icon></button>
        <h1 className="cn302-tieu-de">{ct ? tieuDeChiTiet(ct) : 'Đặt phòng'}</h1>
        {ct && !ct.daHuy && (
          <button type="button" className="hh-iconbtn" aria-label="Sửa đặt phòng" onClick={() => (props.onSua ? props.onSua() : hienToast(CAU_SE_CO))}><Icon>{ICON_SUA}</Icon></button>
        )}
      </header>
      <div className="cn302-than">{than}</div>
      {hoiXoa && ct && <HoiXoa cau={cauHoiXoa(ct)} onXoa={xoa} onKhong={() => datHoiXoa(false)} />}
      {chan && ct && (
        <div className="cn302-chan">
          {ct.trangThaiTien === 'da_thanh_toan' ? (
            <NutGhi chu="Hoàn tác: chưa thu đủ" chuDangGhi="Đang lưu…" lop="hh-btn hh-btn--secondary hh-btn--block"
                    onGhi={() => ghi(props.dv?.hoanTacThuDu?.bind(props.dv), true)} />
          ) : (
            <NutGhi chu={`Đã thu đủ ${vietTien(tienConLai(ct.tienPhong, ct.tienCoc, ct.trangThaiTien))}`} chuDangGhi="Đang lưu…"
                    onGhi={() => ghi(props.dv?.daThuDu?.bind(props.dv), false)} />
          )}
        </div>
      )}
    </div>
  );
}
