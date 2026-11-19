// CN7-04 · Chi tiết một sale (YC6.2 bước 5, 6, YC6-H4, YC6-H16, PQ2.CHU, PQ7.CHU, PQ8.CHU, PQ17.CHU, QD7).
// Đã kết nối: tên, số (nếu sale đã cho), ngày kết nối, "Gọi" (tel:), đặt phòng của sale với chủ nhà này, công tắc "Tình trạng cọc",
// nút "Ngừng cho xem lịch" (hỏi lại). Đã ngừng: số, ngày ngừng, đặt phòng cũ; không công tắc, không ngừng, không xóa.
// Thêm tay (chưa kết nối): tên, số chủ nhà nhập, "Gọi", "Xóa sale này" (hỏi lại một lần).
// Trạng thái: HV1 khung xám, HV2 Thử lại, HV3 quay lại từ nền đọc lại, HV5 mất quyền giữa chừng thì về danh sách, HV8 toast.
import { useCallback, useEffect, useState } from 'react';
import { KhungXam, NutGhi } from '../chung/dangTai';
import { cauBaoLoi, DaiMatKetNoi, ManChuaTai } from '../chung/matKetNoi';
import { useQuayLaiTuNen } from '../chung/nhap';
import { useToast } from '../chung/Toast';
import { ngayThang } from '../lib/can';
import { nhanTrangThaiTien } from '../lib/datPhong';
import { cauHoiNgung, dongPhuSale, ngayVN, type DatPhongCuaSale, type DichVuSale, type DongSale } from '../lib/dichVuSale';
import { vietSoDienThoai } from '../lib/lich';
import { vietTien } from '../lib/tien';
import { Icon } from './TabChu';
import './CN7DanhSachSale.css';

export const ICON_QUAY_LAI = <path d="m15 18-6-6 6-6" />;
const ICON_GOI = <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />;

/** HV5: dòng vừa đổi ở máy khác. */
export const CAU_SALE_KHONG_CON = 'Sale này không còn trong danh sách';

/** Chữ đầu trong ô tròn: "Sale Hùng" → "H". */
export function chuDau(ten: string): string {
  return (ten.replace(/^Sale\s+/i, '').trim()[0] ?? '?').toUpperCase();
}

/** YC6.2 bước 6, YC6-H4: hộp hỏi lại với nút "Không" và nút làm. */
export function HoiLai(props: { cau: string; chuLam: string; chuDangLam: string; nhan: string; onLam: () => Promise<unknown>; onKhong: () => void }) {
  return (
    <>
      <div className="cn7-man-toi" onClick={props.onKhong} aria-hidden="true" />
      <div className="cn7-hoi" role="alertdialog" aria-modal="true" aria-label={props.nhan}>
        <p className="cn7-hoi-cau">{props.cau}</p>
        <div className="cn7-hoi-nut">
          <button type="button" className="hh-btn hh-btn--secondary hh-btn--block" onClick={props.onKhong}>Không</button>
          <NutGhi chu={props.chuLam} chuDangGhi={props.chuDangLam} lop="hh-btn hh-btn--primary hh-btn--block cn7-nut-nguy" onGhi={props.onLam} />
        </div>
      </div>
    </>
  );
}

/** YC6.2 bước 5: nhãn trạng thái một đặt phòng (đã hủy, hay trạng thái tiền). */
function nhanDatPhong(d: DatPhongCuaSale): string {
  if (d.trangThai === 'da_huy') return 'Đã hủy';
  return nhanTrangThaiTien(d.trangThaiTien) ?? 'Đã chốt';
}

function laMatQuyen(e: unknown): boolean {
  return (e as { code?: string } | null)?.code === '42501';
}

export function CN704ChiTietSale(props: {
  dong: DongSale;
  dv?: DichVuSale;
  onQuayLai: () => void;
  /** Đã ngừng, đã xóa, hay dòng không còn (HV5): về CN7 và đọc lại danh sách. */
  onDaDoi: () => void;
}) {
  const d = props.dong;
  const hienToast = useToast();
  const coDatPhong = d.loai === 'ket_noi' && !!d.saleId;
  const [ds, datDs] = useState<DatPhongCuaSale[] | undefined>(undefined);
  const [loiTai, datLoiTai] = useState(false);
  const [xemCoc, datXemCoc] = useState(d.xemCoc);
  const [hoi, datHoi] = useState<'ngung' | 'xoa' | null>(null);
  const { dv, onDaDoi } = props;

  const tai = useCallback(async () => {
    if (!coDatPhong || !dv) return;
    datLoiTai(false);
    try {
      datDs(await dv.layDatPhong(d.saleId!));
    } catch {
      datLoiTai(true);
    }
  }, [coDatPhong, dv, d.saleId]);
  useEffect(() => { void tai(); }, [tai]);
  useQuayLaiTuNen(() => { void tai(); });

  const matQuyen = () => { hienToast(CAU_SALE_KHONG_CON, 'loi'); onDaDoi(); };

  // YC6.2-NT5, QD7: công tắc đổi ngay, database trả lỗi thì về như cũ.
  const doiCoc = async () => {
    if (xemCoc === null || !dv) return;
    const moi = !xemCoc;
    datXemCoc(moi);
    try {
      datXemCoc(await dv.datXemCoc(d.id, moi));
    } catch (e) {
      datXemCoc(!moi);
      if (laMatQuyen(e)) matQuyen();
      else hienToast(cauBaoLoi(e), 'loi');
    }
  };

  const ngung = async () => {
    if (!dv) return;
    try {
      await dv.ngungChoXem(d.id);
      hienToast(`Đã ngừng cho ${d.ten} xem lịch`);
      onDaDoi();
    } catch (e) {
      datHoi(null);
      if (laMatQuyen(e)) matQuyen();
      else hienToast(cauBaoLoi(e), 'loi');
    }
  };

  const xoa = async () => {
    if (!dv) return;
    try {
      await dv.xoaSaleTay(d.id);
      hienToast(`Đã xóa ${d.ten}`);
      onDaDoi();
    } catch (e) {
      datHoi(null);
      if (laMatQuyen(e)) matQuyen();
      else hienToast(cauBaoLoi(e), 'loi');
    }
  };

  const so = d.soDienThoai && !d.daXoaTaiKhoan ? d.soDienThoai : null;
  let phu: string;
  if (d.loai === 'them_tay') phu = dongPhuSale(d);
  else {
    const moc = d.nhom === 'da_ngung' ? (d.ngungLuc ? `ngừng từ ${ngayVN(d.ngungLuc)}` : 'đã ngừng')
      : d.nhom === 'da_ket_noi' && d.ketNoiLuc ? `kết nối từ ${ngayVN(d.ketNoiLuc)}` : 'chưa kết nối';
    phu = [so ? vietSoDienThoai(so) : null, moc].filter(Boolean).join(' · ');
  }

  let datPhong = null;
  if (coDatPhong) {
    datPhong = (
      <section className="cn7-the" aria-label="Đặt phòng của sale này">
        <h2 className="cn7-muc">Đặt phòng của sale này</h2>
        {ds === undefined ? (loiTai ? <ManChuaTai onThuLai={() => void tai()} /> : <KhungXam soDong={2} />)
          : ds.length === 0 ? <p className="cn7-phu-chu">Chưa có đặt phòng</p> : (
            <ul className="cn7-ds-dat">
              {ds.map((b) => (
                <li key={b.id} className={'cn7-dat' + (b.trangThai === 'da_huy' ? ' cn7-dat--huy' : '')}>
                  <div className="cn7-dat-chu">
                    <span className="cn7-dat-can">{`${b.maCan.trim()} · ${ngayThang(b.ngayNhan)} → ${ngayThang(b.ngayTra)}`}</span>
                    <span className="cn7-phu-chu">{nhanDatPhong(b)}</span>
                  </div>
                  <b className="cn7-tien">{vietTien(b.tienPhong)}</b>
                </li>
              ))}
            </ul>
          )}
      </section>
    );
  }

  return (
    <div className="man cn7-phu">
      <DaiMatKetNoi />
      <header className="cn7-dau">
        <button type="button" className="hh-iconbtn man-quay-lai" aria-label="Quay lại" onClick={props.onQuayLai}><Icon co={22}>{ICON_QUAY_LAI}</Icon></button>
        <h1 className="cn7-tieu-de">{d.ten}</h1>
      </header>
      <div className="cn7-than">
        <section className="cn7-the" aria-label="Sale">
          <div className="cn7-nguoi">
            <span className="cn7-tron" aria-hidden="true">{chuDau(d.ten)}</span>
            <div className="cn7-nguoi-chu">
              <span className="cn7-ten">{d.ten}</span>
              <span className="cn7-phu-chu">{phu}</span>
            </div>
            {so && <a className="hh-btn hh-btn--secondary hh-btn--pill cn7-goi" href={`tel:${so}`}><Icon>{ICON_GOI}</Icon>Gọi</a>}
          </div>
        </section>
        {datPhong}
        {d.nhom === 'da_ket_noi' && xemCoc !== null && (
          <section className="cn7-the" aria-label="Quyền xem">
            <div className="cn7-cong-tac">
              <div className="cn7-nguoi-chu">
                <span className="cn7-ten" id="cn7-coc">Tình trạng cọc</span>
                <span className="cn7-phu-chu">Sale thấy đặt phòng của mình đã cọc hay chưa, không thấy số tiền cọc.</span>
              </div>
              <button type="button" role="switch" aria-checked={xemCoc} aria-labelledby="cn7-coc"
                      className={'cn7-switch' + (xemCoc ? ' cn7-switch--bat' : '')} onClick={() => void doiCoc()}>
                <span className="cn7-switch-nut" aria-hidden="true" />
              </button>
            </div>
          </section>
        )}
        {d.nhom === 'da_ket_noi' && (
          <button type="button" className="hh-btn hh-btn--text cn7-nut-phu cn7-nut-phu--nguy" onClick={() => datHoi('ngung')}>Ngừng cho xem lịch</button>
        )}
        {d.loai === 'them_tay' && (
          <button type="button" className="hh-btn hh-btn--text cn7-nut-phu cn7-nut-phu--nguy" onClick={() => datHoi('xoa')}>Xóa sale này</button>
        )}
      </div>
      {hoi === 'ngung' && (
        <HoiLai cau={cauHoiNgung(d.ten)} chuLam="Ngừng cho xem" chuDangLam="Đang ngừng…" nhan="Xác nhận ngừng cho xem lịch"
                onLam={ngung} onKhong={() => datHoi(null)} />
      )}
      {hoi === 'xoa' && (
        <HoiLai cau={`Xóa ${d.ten} khỏi danh sách sale?`} chuLam="Xóa" chuDangLam="Đang xóa…" nhan="Xác nhận xóa sale"
                onLam={xoa} onKhong={() => datHoi(null)} />
      )}
    </div>
  );
}
