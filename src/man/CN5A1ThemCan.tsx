// CN5-A1 Thêm căn, CN5-A3 lỗi khi lưu (YC3.2 bước 15 đến 21, QT5.5, QT5.6, HV1, HV2, HV3, HV8).
// Ảnh (YC3.3, US16) và phần thêm tòa nhà, mô tả, view (YC3.4, US17) chỉ hiện chỗ theo canvas, chưa mở được.
// Kiểu chip, dải lỗi, thanh dưới viết tại chỗ bằng biến màu chung (styles.css ngoài phạm vi US15).
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { NutGhi, THOI_GIAN_CHO_LOI_MS } from '../chung/dangTai';
import { CAU_KHOI_PHUC } from '../chung/nhap';
import { CAU_LOI_CHUNG, DaiMatKetNoi, LoiNguoiDung } from '../chung/matKetNoi';
import { useToast } from '../chung/Toast';
import type { CanMoi } from '../lib/dichVuCan';
import { CAU_MAT_MANG, CHIP_PHONG_NGU, cauDauLoi, dongTrangThai, kiemFormCan, oCuaCau, type LoiCan } from '../lib/kiemCan';
import { docBanNhapThemCan, ghiBanNhapThemCan, xoaBanNhapThemCan } from './banNhap';
import { Icon, ICON_THEM } from './TabChu';

const S: Record<string, CSSProperties> = {
  the: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg, 16px)', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 },
  nhan: { fontSize: 14, lineHeight: '20px', fontWeight: 600, color: 'var(--ink-secondary)' },
  sao: { color: 'var(--danger)', fontWeight: 700 },
  hangChip: { display: 'flex', flexWrap: 'wrap', gap: 6 },
  chip: { minHeight: 44, minWidth: 56, padding: '0 14px', borderRadius: 999, border: '1px solid var(--border-input)', background: 'var(--surface)', color: 'var(--ink-body)', fontSize: 14, fontWeight: 600, font: 'inherit', cursor: 'pointer' },
  chipChon: { background: 'var(--action-tint)', borderColor: 'var(--action)', color: 'var(--action-ink, var(--action))' },
  loi: { margin: 0, fontSize: 13, lineHeight: '18px', color: 'var(--danger-text)' },
  dauAnh: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, minHeight: 32 },
  nhanAnh: { fontSize: 13, fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase' },
  phu: { fontSize: 13, lineHeight: '18px', color: 'var(--ink-muted)' },
  oAnh: { minHeight: 72, borderRadius: 12, border: '2px dashed var(--border-input)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 8, color: 'var(--ink)' },
  dai: { display: 'flex', gap: 8, alignItems: 'flex-start', padding: '10px 12px', borderRadius: 12, background: 'var(--danger-tint, #fef2f2)', color: 'var(--danger-text)', fontSize: 14, lineHeight: '20px' },
  khoiPhuc: { margin: 0, padding: '10px 12px', borderRadius: 12, background: 'var(--action-tint)', color: 'var(--action-ink, var(--ink))', fontSize: 14, lineHeight: '20px' },
  thanhDuoi: { position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 20, background: 'var(--surface)', borderTop: '1px solid var(--border)', padding: '12px 16px calc(16px + env(safe-area-inset-bottom))', display: 'flex', flexDirection: 'column', gap: 8 },
  dongTT: { fontSize: 13, lineHeight: '18px', color: 'var(--ink-muted)', textAlign: 'center' },
};

class LoiHetGio extends Error {}

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
function choToiDa<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((xong, hong) => {
    const hen = setTimeout(() => hong(new LoiHetGio('quá giờ')), ms);
    p.then((v) => { clearTimeout(hen); xong(v); }, (e) => { clearTimeout(hen); hong(e); });
  });
}

/** Lỗi không có mã của database (fetch hỏng, mất mạng) thì là lỗi mạng. */
function laLoiMang(e: unknown): boolean {
  if (e instanceof LoiHetGio || e instanceof TypeError) return true;
  if (typeof navigator !== 'undefined' && navigator.onLine === false) return true;
  const ma = (e as { code?: unknown } | null)?.code;
  return ma === undefined || ma === null || ma === '';
}

export function CN5A1ThemCan(props: {
  /** YC3.2 bước 18. Thiếu (chưa nối database) thì bấm "Thêm căn" báo như mất mạng. */
  taoCan?: (c: CanMoi) => Promise<string>;
  /** YC3.2 bước 19: lưu được, mã căn đã bỏ khoảng trắng. */
  onXong: (maCan: string, id: string) => void;
  onQuayLai: () => void;
}) {
  const hienToast = useToast();
  // HV3 bước 3: mở lại form có nháp thì điền lại; mã lần gửi giữ theo nháp (QT5.6), không có thì sinh mới.
  const [dau] = useState(() => {
    const n = docBanNhapThemCan();
    const coNoiDung = !!n && (n.maCan.trim() !== '' || n.soPhongNgu != null);
    return { maCan: coNoiDung ? n!.maCan : '', soPhongNgu: coNoiDung ? n!.soPhongNgu : null,
             clientId: coNoiDung && n!.clientId ? n!.clientId : taoMaLanGui(), khoiPhuc: coNoiDung };
  });
  const [maCan, datMaCan] = useState(dau.maCan);
  const [soPhongNgu, datSoPhongNgu] = useState<number | null>(dau.soPhongNgu);
  const [loi, datLoi] = useState<LoiCan>({});
  const [cauDau, datCauDau] = useState<string | null>(null);
  const daSua = useRef(false);
  const clientId = dau.clientId;

  // HV3 bước 1: lưu nháp mỗi lần sửa.
  useEffect(() => {
    if (!daSua.current) return;
    ghiBanNhapThemCan({ maCan, soPhongNgu, clientId });
  }, [maCan, soPhongNgu, clientId]);

  const doiMa = (v: string) => { daSua.current = true; datMaCan(v); datLoi((l) => ({ ...l, maCan: undefined })); };
  const chonPhong = (so: number) => { daSua.current = true; datSoPhongNgu(so); datLoi((l) => ({ ...l, soPhongNgu: undefined })); };

  const tt = dongTrangThai({ maCan, soPhongNgu });

  const ghi = async () => {
    const l = kiemFormCan({ maCan, soPhongNgu });
    if (Object.keys(l).length) { datLoi(l); datCauDau(cauDauLoi(Object.keys(l).length)); return; }
    const ma = maCan.trim();
    try {
      if (!props.taoCan) throw new LoiHetGio('chưa nối database');
      const id = await choToiDa(props.taoCan({ maCan: ma, soPhongNgu: soPhongNgu!, clientId }), THOI_GIAN_CHO_LOI_MS);
      xoaBanNhapThemCan(); // HV3 bước 5
      props.onXong(ma, id);
    } catch (e) {
      if (e instanceof LoiNguoiDung) {
        // YC3.2 bước 20, CN5-A3: ở lại form, giữ mọi ô, câu lỗi dưới ô sai.
        const o = oCuaCau(e.message);
        if (o) {
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

        <div style={S.the}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label htmlFor="cn5a1-ma" style={S.nhan}>Mã căn (tên căn hộ)<span style={S.sao} aria-hidden="true"> *</span></label>
            <input id="cn5a1-ma" type="text" className={'hh-input' + (loi.maCan ? ' hh-input--loi' : '')} placeholder="VD: 1509 hoặc Greenbay"
                   value={maCan} onChange={(e) => doiMa(e.target.value)} aria-invalid={loi.maCan ? true : undefined}
                   aria-describedby={loi.maCan ? 'cn5a1-ma-loi' : undefined} autoComplete="off" />
            {loi.maCan && <p id="cn5a1-ma-loi" style={S.loi} role="alert">⚠️ {loi.maCan}</p>}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }} role="group" aria-labelledby="cn5a1-pn">
            <span id="cn5a1-pn" style={S.nhan}>Số phòng ngủ<span style={S.sao} aria-hidden="true"> *</span></span>
            <div style={S.hangChip}>
              {CHIP_PHONG_NGU.map((c) => (
                <button key={c.so} type="button" aria-pressed={soPhongNgu === c.so}
                        style={soPhongNgu === c.so ? { ...S.chip, ...S.chipChon } : S.chip} onClick={() => chonPhong(c.so)}>
                  {c.chu}
                </button>
              ))}
            </div>
            {loi.soPhongNgu && <p style={S.loi} role="alert">⚠️ {loi.soPhongNgu}</p>}
          </div>
        </div>

        <div style={S.the}>
          <div style={S.dauAnh}>
            <span style={S.nhanAnh}>Ảnh</span>
            <span style={S.phu}>Bạn có thể thêm sau</span>
          </div>
          <div style={S.oAnh} aria-disabled="true">
            <Icon>{ICON_THEM}</Icon>
            <span style={{ fontSize: 14, fontWeight: 600 }}>Thêm ảnh</span>
            <span style={S.phu}>· chọn nhiều ảnh cùng lúc</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '0 4px' }}>
          <button type="button" className="hh-btn hh-btn--text" style={{ justifyContent: 'flex-start', padding: 0 }} aria-expanded={false}>
            <Icon>{ICON_THEM}</Icon>Thêm tòa nhà, mô tả gửi khách, view...
          </button>
          <span style={S.phu}>Không bắt buộc. Chỉ cần mã căn và số phòng ngủ là dùng được lịch.</span>
        </div>
      </div>

      <div style={S.thanhDuoi}>
        <span style={S.dongTT} role="status">{tt.chu}</span>
        <NutGhi chu="Thêm căn" chuDangGhi="Đang lưu…" onGhi={ghi} disabled={!tt.du} />
      </div>
    </div>
  );
}
