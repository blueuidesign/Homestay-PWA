// CN5-A1 Thêm căn, CN5-A2 đang tải ảnh, CN5-A3 lỗi khi lưu (YC3.2 bước 15 đến 21, YC3.3, QT5.5, QT5.6, QT5.7, HV1, HV2, HV3, HV8).
// Phần thêm tòa nhà, view, số giường, mô tả (CN5-A1 phần mở rộng, CN5-A1b; YC3.4 bước 29 đến 34) ở MucThemCan.
// Kiểu chip, dải lỗi, thanh dưới viết tại chỗ bằng biến màu chung (styles.css ngoài phạm vi US15).
import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { NutGhi, THOI_GIAN_CHO_LOI_MS } from '../chung/dangTai';
import { CAU_KHOI_PHUC } from '../chung/nhap';
import { CAU_LOI_CHUNG, DaiMatKetNoi, LoiNguoiDung } from '../chung/matKetNoi';
import { useToast } from '../chung/Toast';
import { cauBoAnh } from '../lib/anh';
import type { CanMoi, TaiAnh } from '../lib/dichVuCan';
import { CAU_MAT_MANG, CHIP_PHONG_NGU, cauDauLoi, docSoGiuong, dongTrangThai, kiemFormCan, oCuaCau, type LoiCan, type OCan } from '../lib/kiemCan';
import type { DanhSachToa } from '../lib/toaNha';
import { docBanNhapThemCan, ghiBanNhapThemCan, xoaBanNhapThemCan } from './banNhap';
import { MucAnhCan, useAnhCan } from './MucAnhCan';
import { MucThemCan, useDanhSachToa } from './MucThemCan';
import { Icon, ICON_THEM } from './TabChu';

export const S_FORM_CAN: Record<string, CSSProperties> = {
  the: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg, 16px)', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 },
  nhan: { fontSize: 14, lineHeight: '20px', fontWeight: 600, color: 'var(--ink-secondary)' },
  sao: { color: 'var(--danger)', fontWeight: 700 },
  hangChip: { display: 'flex', flexWrap: 'wrap', gap: 6 },
  chip: { minHeight: 44, minWidth: 56, padding: '0 14px', borderRadius: 999, border: '1px solid var(--border-input)', background: 'var(--surface)', color: 'var(--ink-body)', fontSize: 14, fontWeight: 600, font: 'inherit', cursor: 'pointer' },
  chipChon: { background: 'var(--action-tint)', borderColor: 'var(--action)', color: 'var(--action-ink, var(--action))' },
  loi: { margin: 0, fontSize: 13, lineHeight: '18px', color: 'var(--danger-text)' },
  phu: { fontSize: 13, lineHeight: '18px', color: 'var(--ink-muted)' },
  dai: { display: 'flex', gap: 8, alignItems: 'flex-start', padding: '10px 12px', borderRadius: 12, background: 'var(--danger-tint, #fef2f2)', color: 'var(--danger-text)', fontSize: 14, lineHeight: '20px' },
  khoiPhuc: { margin: 0, padding: '10px 12px', borderRadius: 12, background: 'var(--action-tint)', color: 'var(--action-ink, var(--ink))', fontSize: 14, lineHeight: '20px' },
  thanhDuoi: { position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 20, background: 'var(--surface)', borderTop: '1px solid var(--border)', padding: '12px 16px calc(16px + env(safe-area-inset-bottom))', display: 'flex', flexDirection: 'column', gap: 8 },
  dongTT: { fontSize: 13, lineHeight: '18px', color: 'var(--ink-muted)', textAlign: 'center' },
};
const S = S_FORM_CAN;

/** YC3.2 bước 15, YC3.5 bước 35, 38: thẻ ô mã căn và hàng chip số phòng ngủ (dùng chung form thêm và form sửa). */
export function TheMaVaPhongNgu(props: {
  maCan: string; onDoiMa: (v: string) => void; soPhongNgu: number | null; onChonPhong: (so: number) => void; loi: LoiCan;
}) {
  const { loi } = props;
  return (
    <div style={S.the}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label htmlFor="cn5a1-ma" style={S.nhan}>Mã căn (tên căn hộ)<span style={S.sao} aria-hidden="true"> *</span></label>
        <input id="cn5a1-ma" type="text" className={'hh-input' + (loi.maCan ? ' hh-input--loi' : '')} placeholder="VD: 1509 hoặc Greenbay"
               value={props.maCan} onChange={(e) => props.onDoiMa(e.target.value)} aria-invalid={loi.maCan ? true : undefined}
               aria-describedby={loi.maCan ? 'cn5a1-ma-loi' : undefined} autoComplete="off" />
        {loi.maCan && <p id="cn5a1-ma-loi" style={S.loi} role="alert">⚠️ {loi.maCan}</p>}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }} role="group" aria-labelledby="cn5a1-pn">
        <span id="cn5a1-pn" style={S.nhan}>Số phòng ngủ<span style={S.sao} aria-hidden="true"> *</span></span>
        <div style={S.hangChip}>
          {CHIP_PHONG_NGU.map((c) => (
            <button key={c.so} type="button" aria-pressed={props.soPhongNgu === c.so}
                    style={props.soPhongNgu === c.so ? { ...S.chip, ...S.chipChon } : S.chip} onClick={() => props.onChonPhong(c.so)}>
              {c.chu}
            </button>
          ))}
        </div>
        {loi.soPhongNgu && <p style={S.loi} role="alert">⚠️ {loi.soPhongNgu}</p>}
      </div>
    </div>
  );
}

export class LoiHetGio extends Error {}

function taoMaLanGui(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  } catch { /* máy cũ */ }
  // Máy không có randomUUID: uuid v4 từ Math.random (mã lần gửi không cần bí mật).
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (k) => {
    const r = (Math.random() * 16) | 0;
    return (k === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

/** HV1-H1: quá 15 giây không có trả lời thì coi như mất mạng (YC3.2 bước 21). */
export function choToiDa<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((xong, hong) => {
    const hen = setTimeout(() => hong(new LoiHetGio('quá giờ')), ms);
    p.then((v) => { clearTimeout(hen); xong(v); }, (e) => { clearTimeout(hen); hong(e); });
  });
}

/** Lỗi không có mã của database (fetch hỏng, mất mạng) thì là lỗi mạng. */
export function laLoiMang(e: unknown): boolean {
  if (e instanceof LoiHetGio || e instanceof TypeError) return true;
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return true;
  const ma = (e as { code?: unknown } | null)?.code;
  return ma === undefined || ma === null || ma === '';
}

export function CN5A1ThemCan(props: {
  /** YC3.2 bước 18. Thiếu (chưa nối database) thì bấm "Thêm căn" báo như mất mạng. */
  taoCan?: (c: CanMoi) => Promise<string>;
  /** YC3.3 bước 23. Thiếu (chưa nối database) thì ảnh chọn xong thành "Tải lỗi". */
  taiAnh?: TaiAnh;
  /** YC3.4 bước 29. Thiếu (chưa nối database) thì hàng chip tòa báo chưa tải được. */
  layToa?: () => Promise<DanhSachToa>;
  /** YC3.4 bước 33. Thiếu (chưa nối database) thì thêm tòa báo như mất mạng. */
  themToa?: (ten: string) => Promise<string>;
  /** YC3.2 bước 19: lưu được, mã căn đã bỏ khoảng trắng. */
  onXong: (maCan: string, id: string) => void;
  onQuayLai: () => void;
}) {
  const hienToast = useToast();
  // HV3 bước 3: mở lại form có nháp thì điền lại; mã lần gửi giữ theo nháp (QT5.6), không có thì sinh mới.
  const [dau] = useState(() => {
    const n = docBanNhapThemCan();
    const coNoiDung = !!n && (n.maCan.trim() !== '' || n.soPhongNgu != null || !!n.toaNhaId || !!n.loaiView
                              || !!n.soGiuong?.trim() || !!n.moTa?.trim());
    const g = coNoiDung ? n! : null;
    return { maCan: g?.maCan ?? '', soPhongNgu: g?.soPhongNgu ?? null,
             clientId: g?.clientId || taoMaLanGui(), khoiPhuc: coNoiDung,
             toaNhaId: g?.toaNhaId ?? null, loaiView: g?.loaiView ?? null, soGiuong: g?.soGiuong ?? '',
             moTa: g?.moTa ?? '', moRong: !!g?.moRong };
  });
  const [maCan, datMaCan] = useState(dau.maCan);
  const [soPhongNgu, datSoPhongNgu] = useState<number | null>(dau.soPhongNgu);
  // YC3.4: phần thêm. Thu gọn chỉ ẩn, giữ giá trị (bước 34).
  const [moRong, datMoRong] = useState(dau.moRong);
  const [toaNhaId, datToaNhaId] = useState<string | null>(dau.toaNhaId);
  const [loaiView, datLoaiView] = useState<string | null>(dau.loaiView);
  const [soGiuongChu, datSoGiuongChu] = useState(dau.soGiuong);
  const [moTa, datMoTa] = useState(dau.moTa);
  const dsToa = useDanhSachToa(props.layToa, moRong);
  const [loi, datLoi] = useState<LoiCan>({});
  const [cauDau, datCauDau] = useState<string | null>(null);
  const daSua = useRef(false);
  const clientId = dau.clientId;
  const baoLoi = useCallback((cau: string) => hienToast(cau, 'loi'), [hienToast]); // HV8-NT4
  const anh = useAnhCan(props.taiAnh, baoLoi);
  // YC3.3 bước 26: nhận tới đủ 12 ảnh, bỏ phần thừa; toast báo (kiểu thường).
  const chonAnh = (files: File[]) => { const bo = anh.them(files); if (bo > 0) hienToast(cauBoAnh(bo)); };

  // HV3 bước 1: lưu nháp mỗi lần sửa.
  useEffect(() => {
    if (!daSua.current) return;
    ghiBanNhapThemCan({ maCan, soPhongNgu, clientId, toaNhaId, loaiView, soGiuong: soGiuongChu, moTa, moRong });
  }, [maCan, soPhongNgu, clientId, toaNhaId, loaiView, soGiuongChu, moTa, moRong]);

  const doiMa = (v: string) => { daSua.current = true; datMaCan(v); datLoi((l) => ({ ...l, maCan: undefined })); };
  const chonPhong = (so: number) => { daSua.current = true; datSoPhongNgu(so); datLoi((l) => ({ ...l, soPhongNgu: undefined })); };
  // YC3.4: mỗi ô phần thêm sửa thì bỏ câu lỗi database của ô đó.
  const sua = <T,>(o: OCan, dat: (v: T) => void) => (v: T) => { daSua.current = true; dat(v); datLoi((l) => ({ ...l, [o]: undefined })); };
  const moPhanThem = (mo: boolean) => { daSua.current = true; datMoRong(mo); };

  /** YC3.4 bước 33: thêm tòa (trùng tên thì database trả tòa đã có, GD21), rồi chọn cho căn. */
  const themToa = async (ten: string): Promise<string | null> => {
    try {
      if (!props.themToa) throw new LoiHetGio('chưa nối database');
      const id = await choToiDa(props.themToa(ten), THOI_GIAN_CHO_LOI_MS);
      const cu = dsToa.toa;
      if (cu && !cu.ds.some((t) => t.id === id)) {
        dsToa.datToa({ ...cu, ds: [...cu.ds, { id, ten, khuVuc: null, home247: false }] });
      }
      sua<string | null>('toaNha', datToaNhaId)(id);
      return null;
    } catch (e) {
      if (e instanceof LoiNguoiDung) return e.message; // QT5.5
      hienToast(laLoiMang(e) ? CAU_MAT_MANG : CAU_LOI_CHUNG, 'loi'); // HV2, HV8-NT4
      return null;
    }
  };

  const soGiuong = docSoGiuong(soGiuongChu);
  // YC3.4: số giường, mô tả sai thì câu dưới ô ngay khi gõ, chưa bấm được "Thêm căn".
  const loiPhanThem = kiemFormCan({ maCan: 'x', soPhongNgu: 0, soGiuong, moTa });
  const loiHien: LoiCan = { ...loi, soGiuong: loi.soGiuong ?? loiPhanThem.soGiuong, moTa: loi.moTa ?? loiPhanThem.moTa };
  const phanThemSai = !!(loiPhanThem.soGiuong || loiPhanThem.moTa);

  const tt = dongTrangThai({ maCan, soPhongNgu });
  // YC3.3 bước 23, YC3.3-NT1: còn ảnh đang tải thì chưa thêm được căn.
  const dongDuoi = anh.soDangTai > 0
    ? { chu: `Đang tải ${anh.soDangTai} ảnh. Chờ tải xong mới thêm được căn.`, mau: 'var(--warning-ink, var(--ink-muted))' }
    : { chu: tt.chu, mau: undefined };

  const ghi = async () => {
    const l = kiemFormCan({ maCan, soPhongNgu, soGiuong, loaiView, moTa });
    // YC3.3-NT2, CN5-A3: ảnh tải lỗi là một chỗ phải sửa; căn chưa thêm được tới khi ảnh đó tải lại được hay bị bỏ.
    const soCho = Object.keys(l).length + (anh.soLoi > 0 ? 1 : 0);
    if (soCho) { datLoi(l); datCauDau(cauDauLoi(soCho)); return; }
    if (anh.soDangTai > 0) return; // YC3.3-NT1
    const ma = maCan.trim();
    try {
      if (!props.taoCan) throw new LoiHetGio('chưa nối database');
      // YC3.4 bước 32: tòa, view, số giường, mô tả lưu cùng căn.
      const id = await choToiDa(props.taoCan({ maCan: ma, soPhongNgu: soPhongNgu!, clientId, anh: anh.idDaTai,
                                               toaNhaId, loaiView, soGiuong, moTa: moTa.trim() || null }), THOI_GIAN_CHO_LOI_MS);
      xoaBanNhapThemCan(); // HV3 bước 5
      props.onXong(ma, id);
    } catch (e) {
      if (e instanceof LoiNguoiDung) {
        // YC3.2 bước 20, CN5-A3: ở lại form, giữ mọi ô, câu lỗi dưới ô sai.
        const o = oCuaCau(e.message);
        if (o) {
          if (o !== 'maCan' && o !== 'soPhongNgu') datMoRong(true); // câu thuộc phần thêm: mở ra cho thấy ô sai
          const moi = { ...loi, [o]: e.message };
          const so = Object.values(moi).filter(Boolean).length;
          datLoi(moi);
          datCauDau(cauDauLoi(so));
        } else {
          datCauDau(e.message);
        }
      } else if (laLoiMang(e)) {
        hienToast(CAU_MAT_MANG, 'loi'); // YC3.2 bước 21, HV8-NT4
      } else {
        hienToast(CAU_LOI_CHUNG, 'loi'); // HV2, QT5.5: lỗi không lường trước, HV8-NT4
      }
    }
  };

  const quayLai = () => { xoaBanNhapThemCan(); props.onQuayLai(); }; // HV3 bước 5: bỏ form thì xóa nháp

  return (
    <div className="man">
      <DaiMatKetNoi />
      <header className="man-dau">
        <button type="button" className="hh-iconbtn man-quay-lai" aria-label="Quay lại" onClick={quayLai}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
               strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6" /></svg>
        </button>
        <h1 className="man-tieu-de">Thêm căn</h1>
      </header>
      <div className="man-than" style={{ padding: '12px 12px calc(160px + env(safe-area-inset-bottom))', gap: 12 }}>
        {dau.khoiPhuc && <p style={S.khoiPhuc} role="status">{CAU_KHOI_PHUC}</p>}
        {cauDau && <div style={S.dai} role="alert"><span aria-hidden="true">⚠️</span><span>{cauDau}</span></div>}

        <TheMaVaPhongNgu maCan={maCan} onDoiMa={doiMa} soPhongNgu={soPhongNgu} onChonPhong={chonPhong} loi={loi} />

        <MucAnhCan ds={anh.ds} soDangTai={anh.soDangTai} soLoi={anh.soLoi}
                   onChon={chonAnh} onThuLai={anh.thuLai} onBo={anh.bo} />

        {moRong ? (
          <MucThemCan toa={dsToa.toa} dangTaiToa={dsToa.dangTai} loiTaiToa={dsToa.loi} onTaiLaiToa={() => void dsToa.tai()}
                      toaNhaId={toaNhaId} onChonToa={sua('toaNha', datToaNhaId)} onThemToa={themToa}
                      loaiView={loaiView} onChonView={sua('loaiView', datLoaiView)}
                      soGiuong={soGiuongChu} onDoiSoGiuong={sua('soGiuong', datSoGiuongChu)}
                      moTa={moTa} onDoiMoTa={sua('moTa', datMoTa)} loi={loiHien} onThuGon={() => moPhanThem(false)} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '0 4px' }}>
            <button type="button" className="hh-btn hh-btn--text" style={{ justifyContent: 'flex-start', padding: 0 }}
                    aria-expanded={false} onClick={() => moPhanThem(true)}>
              <Icon>{ICON_THEM}</Icon>Thêm tòa nhà, mô tả gửi khách, view...
            </button>
            <span style={S.phu}>Không bắt buộc. Chỉ cần mã căn và số phòng ngủ là dùng được lịch.</span>
            {/* Thu gọn khi số giường, mô tả đang sai: vẫn nói vì sao chưa bấm được "Thêm căn". */}
            {phanThemSai && <p style={S.loi} role="alert">⚠️ {loiPhanThem.soGiuong ?? loiPhanThem.moTa}</p>}
          </div>
        )}
      </div>

      <div style={S.thanhDuoi}>
        <span style={dongDuoi.mau ? { ...S.dongTT, color: dongDuoi.mau } : S.dongTT} role="status">{dongDuoi.chu}</span>
        <NutGhi chu="Thêm căn" chuDangGhi="Đang lưu…" onGhi={ghi} disabled={!tt.du || anh.soDangTai > 0 || phanThemSai} />
      </div>
    </div>
  );
}
