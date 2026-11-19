// Mục Ảnh của form căn: CN5-A1 (trống), CN5-A2 (đang tải), CN5-A3 (tải lỗi). YC3.3 bước 22 đến 28, QT5.7,
// HV4-NT6 (ô chọn file, không xin quyền, pwa.md P6), HV3 bước 7 (rời app hay mất mạng khi đang tải thì "Tải lỗi").
// Form sửa căn CN5-02 (YC3.5 bước 35 đến 37): ảnh đã gắn căn điền sẵn, "Đổi thứ tự" đưa ảnh lên trước, ra sau.
// Kiểu ô ảnh viết tại chỗ bằng biến màu chung, như CN5A1ThemCan (styles.css ngoài phạm vi).
import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react';
import { LoiNguoiDung } from '../chung/matKetNoi';
import { ACCEPT_ANH, CAU_LOI_FILE, chiaChoTrong, kiemFileAnh, TOI_DA_ANH } from '../lib/anh';
import type { AnhCoSan, TaiAnh } from '../lib/dichVuCan';
import { Icon, ICON_THEM } from './TabChu';

/** cho: chờ lượt tải; dang: đang tải; xong: đã tải, có id ảnh tạm; loi: tải lỗi (Thử lại); sai: file sai loại, quá cỡ. */
export type TrangThaiAnh = 'cho' | 'dang' | 'xong' | 'loi' | 'sai';
/** file null là ảnh đã gắn căn từ trước (form sửa căn), xem là đường dẫn có hạn của ảnh đó. */
export type OAnh = { khoa: string; file: File | null; xem: string | null; tt: TrangThaiAnh; phanTram: number; id?: string };

/** Mạng yếu: tải tối đa 2 ảnh cùng lúc, ảnh còn lại chờ lượt theo thứ tự chọn. */
const TAI_CUNG_LUC = 2;

function taoXem(f: File): string | null {
  try { return typeof URL.createObjectURL === 'function' ? URL.createObjectURL(f) : null; } catch { return null; }
}
function boXem(u: string | null) {
  try { if (u && u.startsWith('blob:')) URL.revokeObjectURL(u); } catch { /* bỏ qua */ }
}

let dem = 0;

/** YC3.3 bước 23 đến 28: danh sách ảnh của form, tải lên ngay khi chọn. */
/** YC3.5 bước 35: coSan là ảnh đã gắn căn theo thứ tự (form sửa căn), điền sẵn là ảnh đã tải xong. */
export function useAnhCan(taiAnh: TaiAnh | undefined, baoLoi: (cau: string) => void, coSan?: AnhCoSan[]) {
  const [ds, datDs] = useState<OAnh[]>(() => (coSan ?? []).map((a) => ({
    khoa: `anh-${++dem}`, file: null, xem: a.url, tt: 'xong' as const, phanTram: 100, id: a.id,
  })));
  const dieuKhien = useRef(new Map<string, AbortController>());
  const dsRef = useRef(ds);
  dsRef.current = ds;

  const sua = useCallback((khoa: string, f: (o: OAnh) => OAnh) => {
    datDs((cu) => cu.map((o) => (o.khoa === khoa ? f(o) : o)));
  }, []);

  const batDau = useCallback((o: OAnh) => {
    if (dieuKhien.current.has(o.khoa)) return;
    const dk = new AbortController();
    dieuKhien.current.set(o.khoa, dk);
    sua(o.khoa, (x) => ({ ...x, tt: 'dang', phanTram: 0 }));
    const chay = taiAnh && o.file
      ? taiAnh(o.file, (p) => sua(o.khoa, (x) => (x.tt === 'dang' ? { ...x, phanTram: p } : x)), dk.signal)
      : Promise.reject(new TypeError('chưa nối database'));
    chay.then(
      (id) => sua(o.khoa, (x) => ({ ...x, tt: 'xong', phanTram: 100, id })),
      (e: unknown) => {
        if (e instanceof LoiNguoiDung && e.message === CAU_LOI_FILE) { sua(o.khoa, (x) => ({ ...x, tt: 'sai' })); return; }
        // Database từ chối bằng câu (ví dụ quá nhiều ảnh tạm): báo câu đó, ô thành "Tải lỗi" để thử lại sau.
        if (e instanceof LoiNguoiDung && dsRef.current.some((x) => x.khoa === o.khoa)) baoLoi(e.message);
        sua(o.khoa, (x) => ({ ...x, tt: 'loi' }));
      },
    ).finally(() => { if (dieuKhien.current.get(o.khoa) === dk) dieuKhien.current.delete(o.khoa); });
  }, [taiAnh, sua, baoLoi]);

  // Chạy lượt tải kế tiếp khi có chỗ.
  useEffect(() => {
    const dang = ds.filter((o) => o.tt === 'dang').length;
    ds.filter((o) => o.tt === 'cho').slice(0, Math.max(0, TAI_CUNG_LUC - dang)).forEach(batDau);
  }, [ds, batDau]);

  // HV3 bước 7, YC3 Trạng thái màn: rời app hay mất mạng khi đang tải thì ảnh chưa xong thành "Tải lỗi".
  useEffect(() => {
    const dung = () => {
      const cho = dsRef.current.filter((o) => o.tt === 'cho').map((o) => o.khoa);
      if (cho.length) datDs((cu) => cu.map((o) => (cho.includes(o.khoa) ? { ...o, tt: 'loi' } : o)));
      for (const dk of dieuKhien.current.values()) dk.abort();
    };
    const anDi = () => { if (document.visibilityState === 'hidden') dung(); };
    document.addEventListener('visibilitychange', anDi);
    window.addEventListener('offline', dung);
    return () => { document.removeEventListener('visibilitychange', anDi); window.removeEventListener('offline', dung); };
  }, []);

  useEffect(() => () => {
    for (const dk of dieuKhien.current.values()) dk.abort();
    for (const o of dsRef.current) boXem(o.xem);
  }, []);

  /** YC3.3 bước 23, 26: thêm theo thứ tự chọn, nhận tới đủ 12; trả số ảnh bị bỏ. */
  const them = useCallback((files: File[]): number => {
    const { nhan, bo } = chiaChoTrong(dsRef.current.length, files);
    const moi: OAnh[] = nhan.map((f) => ({
      khoa: `anh-${++dem}`, file: f, xem: taoXem(f), phanTram: 0,
      tt: kiemFileAnh(f) ? 'sai' : 'cho', // YC3.3-NT6: file sai thì không tải
    }));
    if (moi.length) {
      dsRef.current = [...dsRef.current, ...moi];
      datDs((cu) => [...cu, ...moi]);
    }
    return bo;
  }, []);

  /** YC3.3 bước 25: tải lại đúng ảnh đó. */
  const thuLai = useCallback((khoa: string) => sua(khoa, (x) => (x.tt === 'loi' ? { ...x, tt: 'cho', phanTram: 0 } : x)), [sua]);

  /** YC3.3 bước 25, 28: bỏ ảnh khỏi danh sách, không gọi database. */
  const bo = useCallback((khoa: string) => {
    dieuKhien.current.get(khoa)?.abort();
    dieuKhien.current.delete(khoa);
    const o = dsRef.current.find((x) => x.khoa === khoa);
    boXem(o?.xem ?? null);
    dsRef.current = dsRef.current.filter((x) => x.khoa !== khoa);
    datDs((cu) => cu.filter((x) => x.khoa !== khoa));
  }, []);

  /** YC3.5 bước 36: đưa ảnh lên trước (buoc -1) hay ra sau (buoc 1); ảnh số 1 là ảnh đại diện. */
  const doiCho = useCallback((khoa: string, buoc: -1 | 1) => {
    const cu = dsRef.current;
    const i = cu.findIndex((x) => x.khoa === khoa);
    const j = i + buoc;
    if (i < 0 || j < 0 || j >= cu.length) return;
    const moi = [...cu];
    [moi[i], moi[j]] = [moi[j]!, moi[i]!];
    dsRef.current = moi;
    datDs(moi);
  }, []);

  const soDangTai = ds.filter((o) => o.tt === 'cho' || o.tt === 'dang').length;
  const soLoi = ds.filter((o) => o.tt === 'loi').length;
  /** YC3.3 bước 24: id ảnh đã tải theo thứ tự chọn. */
  const idDaTai = ds.filter((o) => o.tt === 'xong' && o.id).map((o) => o.id!);
  return { ds, them, thuLai, bo, doiCho, soDangTai, soLoi, idDaTai };
}

const S: Record<string, CSSProperties> = {
  the: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg, 16px)', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 },
  dau: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, minHeight: 32 },
  nhan: { fontSize: 13, fontWeight: 700, color: 'var(--ink-muted)', textTransform: 'uppercase' },
  phu: { fontSize: 13, lineHeight: '18px', color: 'var(--ink-muted)' },
  oTrong: { minHeight: 72, width: '100%', borderRadius: 12, border: '2px dashed var(--border-input)', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 8, color: 'var(--ink)', font: 'inherit', cursor: 'pointer' },
  luoi: { display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 6 },
  o: { position: 'relative', aspectRatio: '1 / 1', borderRadius: 'var(--radius-sm, 8px)', overflow: 'hidden', background: 'var(--border-subtle)' },
  oLoi: { background: 'var(--danger-tint, #fef2f2)', border: '1px solid var(--danger-border, var(--danger))' },
  hinh: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  // Vùng bấm 44 px, vòng tròn 26 px như canvas.
  nutBo: { position: 'absolute', right: 0, top: 0, width: 44, height: 44, display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end', padding: 4, background: 'transparent', border: 0, cursor: 'pointer', font: 'inherit' },
  vongBo: { width: 26, height: 26, borderRadius: 999, background: 'var(--surface)', color: 'var(--ink-body)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700 },
  daiDien: { position: 'absolute', left: 4, bottom: 4, fontSize: 12, lineHeight: '16px', padding: '2px 6px', borderRadius: 999, background: 'var(--surface)', color: 'var(--ink)' },
  dangTai: { position: 'absolute', left: 8, right: 8, bottom: 8, display: 'flex', flexDirection: 'column', gap: 4 },
  thanh: { height: 4, borderRadius: 999, background: 'var(--surface)' },
  giua: { position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, textAlign: 'center', padding: 4 },
  thuLai: { minHeight: 44, minWidth: 44, background: 'transparent', border: 0, fontSize: 13, fontWeight: 700, color: 'var(--ink)', textDecoration: 'underline', cursor: 'pointer', font: 'inherit' },
  oThem: { aspectRatio: '1 / 1', borderRadius: 'var(--radius-sm, 8px)', border: '2px dashed var(--border-input)', background: 'transparent', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, fontSize: 13, color: 'var(--ink-secondary)', cursor: 'pointer', font: 'inherit' },
  nutDoi: { minHeight: 44, minWidth: 44, padding: '0 8px', background: 'transparent', border: 0, fontSize: 14, fontWeight: 600, color: 'var(--action)', cursor: 'pointer', font: 'inherit' },
  hangDoi: { position: 'absolute', left: 0, right: 0, top: '50%', transform: 'translateY(-50%)', display: 'flex', justifyContent: 'space-between' },
  nutMuiTen: { width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 0, padding: 0, cursor: 'pointer', font: 'inherit' },
  vongMuiTen: { width: 30, height: 30, borderRadius: 999, background: 'var(--surface)', color: 'var(--ink)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700 },
  canhBao: { margin: 0, fontSize: 13, lineHeight: '18px', color: 'var(--danger-text, var(--danger))' },
};

/** YC3.3 bước 22 đến 28: mục Ảnh trên form Thêm căn. */
export function MucAnhCan(props: {
  ds: OAnh[];
  soDangTai: number;
  soLoi: number;
  onChon: (files: File[]) => void;
  onThuLai: (khoa: string) => void;
  onBo: (khoa: string) => void;
  /** YC3.5 bước 36: có thì hiện nút "Đổi thứ tự" (form sửa căn). */
  onDoiCho?: (khoa: string, buoc: -1 | 1) => void;
}) {
  const oChon = useRef<HTMLInputElement>(null);
  const [doiThuTu, datDoiThuTu] = useState(false);
  const { ds, soDangTai, soLoi } = props;
  const day = ds.length >= TOI_DA_ANH;
  // Ảnh đại diện là ảnh đầu tiên sẽ gắn vào căn (bỏ qua ô file sai, ô đó không tải).
  const khoaDaiDien = ds.find((o) => o.tt !== 'sai')?.khoa;
  // HV4-NT6, pwa.md P6: mở ô chọn file của điện thoại, không xin quyền.
  const moChon = () => { if (!day) oChon.current?.click(); };

  return (
    <div style={S.the}>
      <div style={S.dau}>
        <span style={S.nhan}>{ds.length ? `Ảnh (${ds.length})` : 'Ảnh'}</span>
        {!ds.length && <span style={S.phu}>Bạn có thể thêm sau</span>}
        {props.onDoiCho && ds.length > 1 && (
          <button type="button" style={S.nutDoi} aria-pressed={doiThuTu} onClick={() => datDoiThuTu((d) => !d)}>Đổi thứ tự</button>
        )}
        {soDangTai > 0 && <span style={{ ...S.phu, color: 'var(--action)' }}>Đang tải {soDangTai} ảnh…</span>}
        {!soDangTai && soLoi > 0 && <span style={{ ...S.phu, color: 'var(--danger)' }}>{soLoi} ảnh tải lỗi</span>}
      </div>

      <input ref={oChon} type="file" accept={ACCEPT_ANH} multiple hidden data-testid="o-chon-anh"
             onChange={(e) => { const f = Array.from(e.target.files ?? []); e.target.value = ''; if (f.length) props.onChon(f); }} />

      {!ds.length ? (
        <button type="button" style={S.oTrong} onClick={moChon}>
          <Icon>{ICON_THEM}</Icon>
          <span style={{ fontSize: 14, fontWeight: 600 }}>Thêm ảnh</span>
          <span style={S.phu}>· chọn nhiều ảnh cùng lúc</span>
        </button>
      ) : (
        <ul style={{ ...S.luoi, listStyle: 'none', margin: 0, padding: 0 }} aria-label="Ảnh căn">
          {ds.map((o, i) => (
            <li key={o.khoa} style={o.tt === 'loi' || o.tt === 'sai' ? { ...S.o, ...S.oLoi } : S.o} data-tt={o.tt}
                aria-label={`Ảnh ${i + 1}`}>
              {o.xem && <img src={o.xem} alt="" style={{ ...S.hinh, opacity: o.tt === 'xong' ? 1 : o.tt === 'dang' || o.tt === 'cho' ? 0.45 : 0.25 }} />}
              {(o.tt === 'cho' || o.tt === 'dang') && (
                <div style={S.dangTai}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink)' }}>Đang tải {o.phanTram}%</span>
                  <div style={S.thanh}><div style={{ width: `${o.phanTram}%`, height: '100%', borderRadius: 999, background: 'var(--action)' }} /></div>
                </div>
              )}
              {o.tt === 'loi' && (
                <div style={S.giua}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--danger)' }}>⚠️ Tải lỗi</span>
                  <button type="button" style={S.thuLai} onClick={() => props.onThuLai(o.khoa)}>Thử lại</button>
                </div>
              )}
              {o.tt === 'sai' && (
                <div style={S.giua} role="alert">
                  <span style={{ fontSize: 12, lineHeight: '16px', fontWeight: 600, color: 'var(--danger-text, var(--danger))' }}>⚠️ {CAU_LOI_FILE}</span>
                </div>
              )}
              {o.khoa === khoaDaiDien && o.tt !== 'loi' && <span style={S.daiDien}>Ảnh đại diện</span>}
              {doiThuTu && props.onDoiCho && ds.length > 1 && (
                <div style={S.hangDoi}>
                  <button type="button" style={{ ...S.nutMuiTen, opacity: i === 0 ? 0.3 : 1 }} aria-label={`Đưa ảnh ${i + 1} lên trước`}
                          disabled={i === 0} onClick={() => props.onDoiCho!(o.khoa, -1)}>
                    <span style={S.vongMuiTen} aria-hidden="true">‹</span>
                  </button>
                  <button type="button" style={{ ...S.nutMuiTen, opacity: i === ds.length - 1 ? 0.3 : 1 }} aria-label={`Đưa ảnh ${i + 1} ra sau`}
                          disabled={i === ds.length - 1} onClick={() => props.onDoiCho!(o.khoa, 1)}>
                    <span style={S.vongMuiTen} aria-hidden="true">›</span>
                  </button>
                </div>
              )}
              <button type="button" style={S.nutBo} aria-label={`Bỏ ảnh ${i + 1}`} onClick={() => props.onBo(o.khoa)}>
                <span style={S.vongBo} aria-hidden="true">✕</span>
              </button>
            </li>
          ))}
          <li style={{ display: 'contents' }}>
            <button type="button" style={day ? { ...S.oThem, opacity: 0.5, cursor: 'not-allowed' } : S.oThem} onClick={moChon} disabled={day}>
              <Icon>{ICON_THEM}</Icon>Thêm ảnh
            </button>
          </li>
        </ul>
      )}

      {soLoi > 0 && <p style={S.canhBao} role="alert">⚠️ {soLoi} ảnh chưa tải được. Bấm Thử lại hoặc xóa ảnh đó rồi thêm căn.</p>}
      {ds.length > 0 && <span style={S.phu}>Ảnh đầu tiên là ảnh đại diện · Tối đa 12 ảnh</span>}
    </div>
  );
}
