// S6-02 · Thêm căn tự nhập (YC10.3 bước 1 đến 7, YC10.3-NT1, NT2, NT4, NT5, QT6.3, QT5.5, QT5.6, PQ14.SALE, HV1, HV2, HV8).
// Cũng là form sửa căn tự nhập (YC10.3 bước 12, YC10-H7, giả định GD23): điền sẵn, nút "Lưu thay đổi", xóa được số chủ căn (QD11).
// Tòa nhà: chip tòa, "+ Tòa khác" như YC3.4 (CN5A1bChonToa). Ảnh: như YC3.3 (MucAnhCan, tối đa 12). Kiểu ô dùng S_FORM_CAN.
import { useCallback, useState } from 'react';
import { NutGhi, THOI_GIAN_CHO_LOI_MS } from '../chung/dangTai';
import { CAU_CHUA_TAI, CAU_LOI_CHUNG, DaiMatKetNoi, LoiNguoiDung } from '../chung/matKetNoi';
import { useToast } from '../chung/Toast';
import { cauBoAnh } from '../lib/anh';
import { CAU_GIA_CHU, CAU_GIAI_THICH, CAU_SO_GIUONG, dongConThieu } from '../lib/canTuNhap';
import type { ChiTietCanTuNhap, DichVuCanTuNhap, SuaCanTuNhap } from '../lib/dichVuCanTuNhap';
import { CAU_MAT_MANG, CHIP_PHONG_NGU, CHIP_VIEW, docSoGiuong } from '../lib/kiemCan';
import { docSoTienGo, vietSo } from '../lib/tien';
import { CHIP_TOA_KHAC, xepChipToa } from '../lib/toaNha';
import { KhungXam } from '../chung/dangTai';
import { CN5A1bChonToa } from './CN5A1bChonToa';
import { choToiDa, laLoiMang, LoiHetGio, S_FORM_CAN as S } from './CN5A1ThemCan';
import { MucAnhCan, useAnhCan } from './MucAnhCan';
import { useDanhSachToa } from './MucThemCan';

function taoMaLanGui(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  } catch { /* máy cũ */ }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (k) => {
    const r = (Math.random() * 16) | 0;
    return (k === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

const giaChu = (g: number | null | undefined) => (g == null ? '' : vietSo(g));

function Sao() { return <span style={S.sao} aria-hidden="true"> *</span>; }

function HangChip<T extends string | number>(props: {
  id: string; nhan: string; batBuoc?: boolean; ds: { ma: T; chu: string }[]; chon: T | null; onChon: (v: T | null) => void; boChon?: boolean;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }} role="group" aria-labelledby={props.id}>
      <span id={props.id} style={S.nhan}>{props.nhan}{props.batBuoc && <Sao />}</span>
      <div style={S.hangChip}>
        {props.ds.map((c) => (
          <button key={String(c.ma)} type="button" aria-pressed={props.chon === c.ma}
                  style={props.chon === c.ma ? { ...S.chip, ...S.chipChon } : S.chip}
                  onClick={() => props.onChon(props.boChon && props.chon === c.ma ? null : c.ma)}>
            {c.chu}
          </button>
        ))}
      </div>
    </div>
  );
}

function OChu(props: { id: string; nhan: string; batBuoc?: boolean; giaTri: string; onDoi: (v: string) => void; kieu?: 'tel' | 'text'; so?: boolean; goiY?: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label htmlFor={props.id} style={S.nhan}>{props.nhan}{props.batBuoc && <Sao />}</label>
      <input id={props.id} type={props.kieu ?? 'text'} inputMode={props.so ? 'numeric' : undefined} className="hh-input"
             value={props.giaTri} onChange={(e) => props.onDoi(e.target.value)} autoComplete="off" placeholder={props.goiY} />
    </div>
  );
}

export function S602ThemCanTuNhap(props: {
  dv?: Pick<DichVuCanTuNhap, 'tao' | 'sua' | 'taiAnh' | 'layToa' | 'themToa'>;
  /** YC10.3 bước 12: có thì là form sửa, điền sẵn dữ liệu căn. */
  dau?: ChiTietCanTuNhap;
  /** YC10.3 bước 7: thêm xong (về S6); sửa xong (về S6-03). */
  onXong: (canId: string) => void;
  onQuayLai: () => void;
}) {
  const { dv, dau } = props;
  const laSua = !!dau;
  const hienToast = useToast();
  const [clientId] = useState(taoMaLanGui);
  const [tenChu, datTenChu] = useState(dau?.tenChu ?? '');
  const [soDienThoai, datSo] = useState(dau?.soDienThoai ?? '');
  const [maCan, datMaCan] = useState(dau?.maCan ?? '');
  const [toaNhaId, datToa] = useState<string | null>(dau?.toaNhaId ?? null);
  const [soPhongNgu, datSoPhongNgu] = useState<number | null>(dau?.soPhongNgu ?? null);
  const [loaiView, datView] = useState<string | null>(dau?.loaiView ?? null);
  const [soGiuongChu, datSoGiuong] = useState(dau?.soGiuong != null ? String(dau.soGiuong) : '');
  const [giaThuongChu, datGiaThuong] = useState(giaChu(dau?.giaThuong));
  const [giaCuoiTuanChu, datGiaCuoiTuan] = useState(giaChu(dau?.giaCuoiTuan));
  const [khac, datKhac] = useState(false);
  const [chuToa, datChuToa] = useState('');
  const [dangThemToa, datDangThemToa] = useState(false);
  const [loiToa, datLoiToa] = useState<string | null>(null);
  const [cauLoi, datCauLoi] = useState<string | null>(null);
  const dsToa = useDanhSachToa(dv?.layToa, true);
  const baoLoi = useCallback((cau: string) => hienToast(cau, 'loi'), [hienToast]);
  const anh = useAnhCan(dv?.taiAnh, baoLoi, dau?.anh);
  // YC10.3 bước 5, YC10.3-NT4: nhận tới đủ 12 ảnh, phần thừa bỏ và báo.
  const chonAnh = (files: File[]) => { const bo = anh.them(files); if (bo > 0) hienToast(cauBoAnh(bo)); };

  const doiGia = (dat: (v: string) => void) => (v: string) => {
    const n = docSoTienGo(v);
    if (n === undefined) return; // ô giữ số cũ khi gõ chữ không nhận (QT5.2)
    dat(n == null ? '' : vietSo(n));
  };

  const soGiuong = docSoGiuong(soGiuongChu);
  const loiSoGiuong = soGiuong != null && (!Number.isInteger(soGiuong) || soGiuong < 1 || soGiuong > 50) ? 'Số giường từ 1 đến 50' : null;
  const conThieu = dongConThieu({ tenChu, soDienThoai, maCan, soPhongNgu }, !laSua);
  const dongDuoi = anh.soDangTai > 0 ? `Đang tải ${anh.soDangTai} ảnh. Chờ tải xong mới lưu được.` : conThieu;
  const chip = dsToa.toa ? xepChipToa(dsToa.toa.ds, dsToa.toa.daDung, toaNhaId) : [];

  const themToa = async (ten: string) => {
    datDangThemToa(true);
    datLoiToa(null);
    try {
      if (!dv?.themToa) throw new LoiHetGio('chưa nối database');
      const id = await choToiDa(dv.themToa(ten), THOI_GIAN_CHO_LOI_MS);
      const cu = dsToa.toa;
      if (cu && !cu.ds.some((t) => t.id === id)) dsToa.datToa({ ...cu, ds: [...cu.ds, { id, ten, khuVuc: null, home247: false }] });
      datToa(id);
      datKhac(false);
      datChuToa('');
    } catch (e) {
      if (e instanceof LoiNguoiDung) datLoiToa(e.message);
      else hienToast(laLoiMang(e) ? CAU_MAT_MANG : CAU_LOI_CHUNG, 'loi');
    } finally {
      datDangThemToa(false);
    }
  };

  const giaThuong = docSoTienGo(giaThuongChu) ?? null;
  const giaCuoiTuan = docSoTienGo(giaCuoiTuanChu) ?? null;

  const ghi = async () => {
    if (conThieu || loiSoGiuong || anh.soDangTai > 0) return;
    if (anh.soLoi > 0) { datCauLoi(`${anh.soLoi} ảnh chưa tải được. Bấm Thử lại hoặc bỏ ảnh đó.`); return; }
    datCauLoi(null);
    try {
      if (!dv) throw new LoiHetGio('chưa nối database');
      if (dau) {
        // YC10.3 bước 12: chỉ gửi ô đã đổi; xóa trống số là xóa số (QD11).
        const s: SuaCanTuNhap = {};
        if (tenChu.trim() !== (dau.tenChu ?? '')) s.tenChu = tenChu.trim();
        const so = soDienThoai.trim() || null;
        if (so !== (dau.soDienThoai ?? null)) s.soDienThoai = so;
        if (maCan.trim() !== dau.maCan) s.maCan = maCan.trim();
        if (toaNhaId !== dau.toaNhaId) s.toaNhaId = toaNhaId;
        if (soPhongNgu !== dau.soPhongNgu && soPhongNgu != null) s.soPhongNgu = soPhongNgu;
        if (loaiView !== dau.loaiView) s.loaiView = loaiView;
        if (soGiuong !== dau.soGiuong) s.soGiuong = soGiuong;
        if (giaThuong !== dau.giaThuong) s.giaThuong = giaThuong;
        if (giaCuoiTuan !== dau.giaCuoiTuan) s.giaCuoiTuan = giaCuoiTuan;
        const idAnh = anh.idDaTai;
        if (idAnh.length !== dau.anh.length || idAnh.some((id, i) => id !== dau.anh[i]?.id)) s.anh = idAnh;
        await choToiDa(dv.sua(dau.canId, s), THOI_GIAN_CHO_LOI_MS);
        props.onXong(dau.canId);
      } else {
        const id = await choToiDa(dv.tao({
          tenChu: tenChu.trim(), soDienThoai: soDienThoai.trim(), maCan: maCan.trim(), soPhongNgu: soPhongNgu!, clientId,
          toaNhaId, loaiView, soGiuong, giaThuong, giaCuoiTuan, anh: anh.idDaTai,
        }), THOI_GIAN_CHO_LOI_MS);
        props.onXong(id);
      }
    } catch (e) {
      if (e instanceof LoiNguoiDung) datCauLoi(e.message); // QT5.5: câu của database, giữ mọi ô
      else hienToast(laLoiMang(e) ? CAU_MAT_MANG : CAU_LOI_CHUNG, 'loi'); // HV2, HV8
    }
  };

  return (
    <div className="man" data-man={laSua ? 'S6-02-sua' : 'S6-02'}>
      <DaiMatKetNoi />
      <header className="man-dau">
        <button type="button" className="hh-iconbtn man-quay-lai" aria-label="Quay lại" onClick={props.onQuayLai}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
               strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
        </button>
        <h1 className="man-tieu-de">{laSua ? 'Sửa thông tin căn' : 'Thêm căn tự nhập'}</h1>
      </header>
      <div className="man-than" style={{ padding: '12px 12px calc(160px + env(safe-area-inset-bottom))', gap: 12 }}>
        {!laSua && <p style={{ ...S.phu, fontSize: 14, lineHeight: '20px', margin: 0 }}>{CAU_GIAI_THICH}</p>}
        {cauLoi && <div style={S.dai} role="alert"><span aria-hidden="true">⚠️</span><span>{cauLoi}</span></div>}

        <section style={S.the} aria-label="Chủ nhà">
          <h2 style={{ ...S.nhan, margin: 0, color: 'var(--ink)' }}>Chủ nhà</h2>
          <OChu id="s602-ten" nhan="Tên chủ nhà" batBuoc giaTri={tenChu} onDoi={datTenChu} goiY="VD: Chú Bình" />
          <OChu id="s602-so" nhan="Số điện thoại" batBuoc={!laSua} giaTri={soDienThoai} onDoi={datSo} kieu="tel" />
          <span style={S.phu}>Chỉ bạn thấy tên và số chủ căn.</span>
        </section>

        <section style={S.the} aria-label="Căn">
          <h2 style={{ ...S.nhan, margin: 0, color: 'var(--ink)' }}>Căn</h2>
          <OChu id="s602-ma" nhan="Mã căn" batBuoc giaTri={maCan} onDoi={datMaCan} goiY="VD: 1509 hoặc Villa Tuần Châu" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }} role="group" aria-labelledby="s602-toa">
            <span id="s602-toa" style={S.nhan}>Tòa nhà</span>
            {dsToa.toa ? (
              <div style={S.hangChip}>
                {chip.map((t) => (
                  <button key={t.id} type="button" aria-pressed={toaNhaId === t.id}
                          style={toaNhaId === t.id ? { ...S.chip, ...S.chipChon } : S.chip}
                          onClick={() => { datKhac(false); datToa(toaNhaId === t.id ? null : t.id); }}>
                    {t.ten}
                  </button>
                ))}
                <button type="button" aria-pressed={khac} style={khac ? { ...S.chip, ...S.chipChon } : S.chip} onClick={() => datKhac((k) => !k)}>
                  {CHIP_TOA_KHAC}
                </button>
              </div>
            ) : dsToa.loi ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }} role="alert">
                <span style={S.phu}>{CAU_CHUA_TAI}</span>
                <button type="button" className="hh-btn hh-btn--text hh-btn--inline" onClick={() => void dsToa.tai()}>Thử lại</button>
              </div>
            ) : <KhungXam soDong={1} />}
          </div>
          {khac && dsToa.toa && (
            <CN5A1bChonToa ds={dsToa.toa.ds} chu={chuToa} onDoiChu={(v) => { datChuToa(v); datLoiToa(null); }}
                           onChon={(id) => { datToa(id); datKhac(false); datChuToa(''); }} onThemMoi={(ten) => void themToa(ten)}
                           dangThem={dangThemToa} loi={loiToa} />
          )}
          <HangChip id="s602-pn" nhan="Số phòng ngủ" batBuoc ds={CHIP_PHONG_NGU.map((c) => ({ ma: c.so, chu: c.chu }))}
                    chon={soPhongNgu} onChon={(v) => { if (v != null) datSoPhongNgu(v); }} />
          <HangChip id="s602-view" nhan="Loại view" ds={CHIP_VIEW.map((c) => ({ ma: c.ma as string, chu: c.chu }))}
                    chon={loaiView} onChon={datView} boChon />
          <OChu id="s602-giuong" nhan="Số giường" giaTri={soGiuongChu} onDoi={datSoGiuong} so goiY="VD: 3" />
          {loiSoGiuong ? <p style={S.loi} role="alert">⚠️ {loiSoGiuong}</p> : <span style={S.phu}>{CAU_SO_GIUONG}</span>}
        </section>

        <section style={S.the} aria-label="Giá chủ nhà mỗi đêm">
          <h2 style={{ ...S.nhan, margin: 0, color: 'var(--ink)' }}>Giá chủ nhà mỗi đêm</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            <OChu id="s602-gia-thuong" nhan="Ngày thường" giaTri={giaThuongChu} onDoi={doiGia(datGiaThuong)} so goiY="VD: 1.400.000" />
            <OChu id="s602-gia-cuoi" nhan="Cuối tuần" giaTri={giaCuoiTuanChu} onDoi={doiGia(datGiaCuoiTuan)} so goiY="VD: 1.600.000" />
          </div>
          <span style={S.phu}>{CAU_GIA_CHU}</span>
        </section>

        <MucAnhCan ds={anh.ds} soDangTai={anh.soDangTai} soLoi={anh.soLoi} onChon={chonAnh} onThuLai={anh.thuLai} onBo={anh.bo}
                   onDoiCho={laSua ? anh.doiCho : undefined} />
        {anh.ds.length === 0 && <span style={{ ...S.phu, padding: '0 4px' }}>Ảnh (0) · Tối đa 12 ảnh</span>}
      </div>

      <div style={S.thanhDuoi}>
        {dongDuoi && <span style={S.dongTT} role="status">{dongDuoi}</span>}
        <NutGhi chu={laSua ? 'Lưu thay đổi' : 'Thêm căn'} chuDangGhi="Đang lưu…" onGhi={ghi}
                disabled={!!conThieu || !!loiSoGiuong || anh.soDangTai > 0} />
      </div>
    </div>
  );
}
