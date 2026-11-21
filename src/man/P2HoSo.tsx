// P2 · Thông tin cá nhân (YC1.4, US4): ảnh đại diện, họ và tên, tên hiển thị, số điện thoại, email đăng nhập (chỉ xem),
// "Xóa tài khoản" mở P14 (YC1.8), "Lưu thay đổi". Sai luật kiểm thì báo dưới ô (YC1.2 Luật kiểm), lưu xong ở lại màn (YC1.4 bước 3).
// HV1 khung xám, HV2 Thử lại và giữ chữ đang gõ khi lưu lỗi, HV3 nháp, HV8 toast, QT5.5 câu của database.
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { KhungXam, NutGhi } from '../chung/dangTai';
import { cauBaoLoi, DaiMatKetNoi, LoiNguoiDung, ManChuaTai } from '../chung/matKetNoi';
import { luuNhap, docNhap, xoaNhap } from '../chung/nhap';
import { useToast } from '../chung/Toast';
import { ACCEPT_ANH, kiemFileAnh } from '../lib/anh';
import { chuCaiDau } from '../lib/caNhan';
import { CAU_LOI_TEN_HIEN_THI, type DichVuHoSo, type HoSoForm } from '../lib/dichVuHoSo';
import { CAU_LOI_SO, CAU_LOI_TEN, TEN_TOI_DA, chuanHoaSo } from '../lib/kiemDangKy';
import { P14XoaTaiKhoan } from './P14XoaTaiKhoan';
import { Icon } from './TabChu';
import './P2HoSo.css';

/** HV8, YC1.4 bước 3: toast sau khi lưu. */
export const CAU_DA_LUU_HO_SO = 'Đã lưu thông tin cá nhân';
const KHOA_NHAP = 'ho-so';
const ICON_QUAY_LAI = <path d="m15 18-6-6 6-6" />;

type Gia = { ten: string; tenHienThi: string; so: string };
type Loi = Partial<Record<keyof Gia, string>>;

/** YC1.4 Luật kiểm: câu báo dưới từng ô. */
export function kiemHoSo(g: Gia): Loi {
  const l: Loi = {};
  const ten = g.ten.trim();
  if (ten === '' || ten.length > TEN_TOI_DA) l.ten = CAU_LOI_TEN;
  const hien = g.tenHienThi.trim();
  if (hien === '' || hien.length > TEN_TOI_DA) l.tenHienThi = CAU_LOI_TEN_HIEN_THI;
  if (chuanHoaSo(g.so) === null) l.so = CAU_LOI_SO;
  return l;
}

/** QT5.5: câu của database về ô nào thì hiện dưới ô đó; câu khác hiện toast. */
function oCuaCau(cau: string): keyof Gia | null {
  if (cau === CAU_LOI_TEN) return 'ten';
  if (cau === CAU_LOI_TEN_HIEN_THI) return 'tenHienThi';
  if (cau.startsWith('Số ')) return 'so';
  return null;
}

export function P2HoSo(props: { dv?: DichVuHoSo; onQuayLai: () => void; onDaXoa?: () => void }) {
  const [moXoa, datMoXoa] = useState(false);
  const hienToast = useToast();
  const [goc, datGoc] = useState<HoSoForm | undefined>(undefined);
  const [g, datG] = useState<Gia | undefined>(undefined);
  const [loi, datLoi] = useState<Loi>({});
  const [hong, datHong] = useState(false);
  const [anhMoi, datAnhMoi] = useState<{ duongDan: string; xem: string | null } | null>(null);
  const [dangTaiAnh, datDangTaiAnh] = useState(false);
  const oFile = useRef<HTMLInputElement>(null);
  const dv = props.dv;

  const tai = useCallback(async () => {
    datHong(false);
    try {
      if (!dv) throw new TypeError('chưa nối database');
      const h = await dv.doc();
      datGoc(h);
      const nhap = docNhap<Gia>(KHOA_NHAP); // HV3: khôi phục chữ đang gõ
      datG(nhap ?? { ten: h.ten, tenHienThi: h.tenHienThi, so: h.soDienThoai });
    } catch {
      datHong(true);
    }
  }, [dv]);
  useEffect(() => { void tai(); }, [tai]);

  const sua = (k: keyof Gia, v: string) => {
    if (!g) return;
    const moi = { ...g, [k]: v };
    datG(moi);
    datLoi((l) => ({ ...l, [k]: undefined }));
    luuNhap(KHOA_NHAP, moi);
  };

  const khung = (than: ReactNode, chan?: ReactNode) => (
    <div className="man p2" data-man="P2">
      <DaiMatKetNoi />
      <header className="p2-dau">
        <button type="button" className="hh-iconbtn man-quay-lai" aria-label="Quay lại" onClick={props.onQuayLai}><Icon co={22}>{ICON_QUAY_LAI}</Icon></button>
        <h1 className="p2-tieu-de">Thông tin cá nhân</h1>
      </header>
      <div className="p2-than">{than}</div>
      {chan}
    </div>
  );

  if (!goc || !g) return khung(hong ? <ManChuaTai onThuLai={() => void tai()} /> : <KhungXam soDong={4} />);

  // YC1.8 bước 1 đến 4: P14, P14-01. "Giữ tài khoản" về P2 với chữ đang gõ còn nguyên.
  if (moXoa) {
    return <P14XoaTaiKhoan email={goc.email} xoa={dv?.xoaTaiKhoan ? () => dv.xoaTaiKhoan!() : undefined}
                           onGiu={() => datMoXoa(false)} onDaXoa={() => props.onDaXoa?.()} />;
  }

  const chonAnh = async (f: File | undefined) => {
    if (!f || !dv) return;
    const l = kiemFileAnh(f);
    if (l) { hienToast(l, 'loi'); return; }
    datDangTaiAnh(true);
    try {
      const duongDan = await dv.taiAnh(f);
      let xem: string | null = null;
      try { xem = typeof URL.createObjectURL === 'function' ? URL.createObjectURL(f) : null; } catch { /* không xem trước được thì thôi */ }
      datAnhMoi({ duongDan, xem });
    } catch (e) {
      hienToast(cauBaoLoi(e), 'loi');
    } finally {
      datDangTaiAnh(false);
    }
  };

  const luu = async () => {
    const l = kiemHoSo(g);
    datLoi(l);
    if (Object.keys(l).length > 0) return;
    try {
      await dv!.luu({ ten: g.ten.trim(), tenHienThi: g.tenHienThi.trim(), soDienThoai: g.so, anh: anhMoi?.duongDan });
    } catch (e) {
      const cau = e instanceof LoiNguoiDung ? e.message : '';
      const o = oCuaCau(cau);
      if (o) datLoi({ [o]: cau });
      else hienToast(cauBaoLoi(e), 'loi'); // HV2: giữ chữ đang gõ
      return;
    }
    xoaNhap(KHOA_NHAP);
    hienToast(CAU_DA_LUU_HO_SO); // YC1.4 bước 3: ở lại màn
    void tai();
  };

  const anhHienTai = anhMoi?.xem ?? goc.anhUrl;
  const o = (k: keyof Gia, nhan: string, goiY: string | null, kieu: { inputMode?: 'tel'; autoComplete?: string }) => (
    <div className="hh-field">
      <label className="hh-field__label" htmlFor={`p2-${k}`}>{nhan}</label>
      <input id={`p2-${k}`} className={'hh-input' + (loi[k] ? ' hh-input--loi' : '')} value={g[k]} aria-invalid={!!loi[k]}
             aria-describedby={`p2-${k}-ct`} onChange={(e) => sua(k, e.target.value)} {...kieu} />
      {loi[k] ? <p className="hh-field__loi" id={`p2-${k}-ct`} role="alert">{loi[k]}</p>
        : goiY ? <p className="hh-field__hint" id={`p2-${k}-ct`}>{goiY}</p> : null}
    </div>
  );

  return khung(
    <>
      <div className="p2-anh-khoi">
        {anhHienTai ? <img className="p2-anh" src={anhHienTai} alt="Ảnh đại diện" /> : <span className="p2-anh p2-anh--chu" aria-hidden="true">{chuCaiDau(g.tenHienThi || g.ten)}</span>}
        <input ref={oFile} type="file" accept={ACCEPT_ANH} className="p2-file" aria-label="Chọn ảnh đại diện" onChange={(e) => { void chonAnh(e.target.files?.[0]); e.target.value = ''; }} />
        <button type="button" className="hh-btn hh-btn--secondary" disabled={dangTaiAnh} onClick={() => oFile.current?.click()}>
          {dangTaiAnh ? 'Đang tải ảnh…' : 'Đổi ảnh đại diện'}
        </button>
      </div>
      {o('ten', 'Họ và tên', null, { autoComplete: 'name' })}
      {o('tenHienThi', 'Tên hiển thị', 'Sale thấy tên này trong Nguồn phòng.', {})}
      {o('so', 'Số điện thoại', 'Sale và chủ nhà đã kết nối thấy số này để gọi cho bạn. Cần từ 9 đến 15 chữ số.', { inputMode: 'tel', autoComplete: 'tel' })}
      <section className="p2-dang-nhap" aria-labelledby="p2-dn">
        <h2 className="hh-field__label" id="p2-dn">Đăng nhập</h2>
        <p className="p2-email">{goc.email}</p>
        <p className="hh-field__hint">Mã đăng nhập gửi về email này. Không đổi email ở đây được.</p>
      </section>
      <button type="button" className="hh-btn hh-btn--text p2-xoa" onClick={() => datMoXoa(true)}>Xóa tài khoản</button>
    </>,
    <div className="p2-chan"><NutGhi chu="Lưu thay đổi" onGhi={luu} /></div>,
  );
}
