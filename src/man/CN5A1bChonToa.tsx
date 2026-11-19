// CN5-A1b Thêm căn · chọn tòa khác (YC3.4 bước 30 đến 33, QT6.3, YC3-H5). Lọc trên danh sách đã đọc, không gọi database.
import type { CSSProperties } from 'react';
import { dongThemToaMoi, GHI_CHU_CHON_TOA, locToa, type ToaNha } from '../lib/toaNha';

const S: Record<string, CSSProperties> = {
  ds: { display: 'flex', flexDirection: 'column', border: '1px solid var(--border)', borderRadius: 'var(--radius-md, 12px)', overflow: 'hidden' },
  dong: { minHeight: 48, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', padding: '6px 12px', border: 0, borderBottom: '1px solid var(--border-subtle, var(--border))', background: 'var(--surface)', font: 'inherit', textAlign: 'left', cursor: 'pointer', width: '100%' },
  ten: { fontSize: 14, lineHeight: '20px', fontWeight: 600, color: 'var(--ink)' },
  khuVuc: { fontSize: 13, lineHeight: '18px', color: 'var(--ink-muted)' },
  themMoi: { minHeight: 48, display: 'flex', alignItems: 'center', padding: '6px 12px', border: 0, background: 'var(--surface)', font: 'inherit', fontSize: 14, fontWeight: 600, color: 'var(--action)', textAlign: 'left', cursor: 'pointer', width: '100%' },
  ghiChu: { fontSize: 13, lineHeight: '18px', color: 'var(--ink-muted)' },
  loi: { margin: 0, fontSize: 13, lineHeight: '18px', color: 'var(--danger-text)' },
};

export function CN5A1bChonToa(props: {
  /** Danh sách tòa đã đọc (YC3.4 bước 29). */
  ds: ToaNha[];
  chu: string;
  onDoiChu: (chu: string) => void;
  /** YC3.4 bước 32: chọn một tòa có sẵn. */
  onChon: (id: string) => void;
  /** YC3.4 bước 33: thêm tòa mới với tên đã gõ (đã bỏ khoảng trắng đầu cuối). */
  onThemMoi: (ten: string) => void;
  dangThem?: boolean;
  /** Câu database từ chối tên tòa (QT5.5). */
  loi?: string | null;
}) {
  const ds = locToa(props.ds, props.chu);
  const themMoi = dongThemToaMoi(props.chu);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label className="hh-field">
        <span className="hh-field__label">Tên tòa nhà</span>
        <input type="text" className={'hh-input' + (props.loi ? ' hh-input--loi' : '')} placeholder="Gõ tên tòa, VD: Green Bay"
               value={props.chu} onChange={(e) => props.onDoiChu(e.target.value)} autoComplete="off"
               aria-invalid={props.loi ? true : undefined} />
      </label>
      {props.loi && <p style={S.loi} role="alert">⚠️ {props.loi}</p>}
      {(ds.length > 0 || themMoi) && (
        <ul style={{ ...S.ds, listStyle: 'none', margin: 0, padding: 0 }} aria-label="Danh sách tòa">
          {ds.map((t) => (
            <li key={t.id}>
              <button type="button" style={S.dong} onClick={() => props.onChon(t.id)}>
                <span style={S.ten}>{t.ten}</span>
                {t.khuVuc && <span style={S.khuVuc}>{t.khuVuc}</span>}
              </button>
            </li>
          ))}
          {themMoi && (
            <li>
              <button type="button" style={S.themMoi} disabled={props.dangThem}
                      onClick={() => props.onThemMoi(props.chu.trim())}>
                {props.dangThem ? 'Đang thêm…' : themMoi}
              </button>
            </li>
          )}
        </ul>
      )}
      <span style={S.ghiChu}>{GHI_CHU_CHON_TOA}</span>
    </div>
  );
}
