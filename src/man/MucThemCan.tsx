// CN5-A1 phần mở rộng (YC3.4 bước 29 đến 34, QT6.3, YC3-H5, YC3-H7, HV1, HV2): tòa nhà, loại view, số giường, mô tả gửi khách.
// Giá trị do form Thêm căn giữ (để lưu nháp và gửi cùng căn qua fn_tao_can); mục này chỉ hiện và báo thay đổi.
import { useCallback, useEffect, useState, type CSSProperties } from 'react';
import { KhungXam } from '../chung/dangTai';
import { CAU_CHUA_TAI } from '../chung/matKetNoi';
import { CHIP_VIEW, type LoiCan } from '../lib/kiemCan';
import { CHIP_TOA_KHAC, xepChipToa, type DanhSachToa } from '../lib/toaNha';
import { CN5A1bChonToa } from './CN5A1bChonToa';

const S: Record<string, CSSProperties> = {
  the: { background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg, 16px)', padding: 16, display: 'flex', flexDirection: 'column', gap: 12 },
  nhom: { display: 'flex', flexDirection: 'column', gap: 6 },
  nhan: { fontSize: 14, lineHeight: '20px', fontWeight: 600, color: 'var(--ink-secondary)' },
  hangChip: { display: 'flex', flexWrap: 'wrap', gap: 6 },
  chip: { minHeight: 44, minWidth: 56, padding: '0 14px', borderRadius: 999, border: '1px solid var(--border-input)', background: 'var(--surface)', color: 'var(--ink-body)', fontSize: 14, fontWeight: 600, font: 'inherit', cursor: 'pointer' },
  chipChon: { background: 'var(--action-tint)', borderColor: 'var(--action)', color: 'var(--action-ink, var(--action))' },
  loi: { margin: 0, fontSize: 13, lineHeight: '18px', color: 'var(--danger-text)' },
  phu: { fontSize: 14, lineHeight: '20px', color: 'var(--ink-muted)' },
};

/** YC3.4 bước 29: đọc danh sách tòa một lần khi mở phần thêm. HV1 khung xám, HV2 Thử lại. */
export function useDanhSachToa(layToa: (() => Promise<DanhSachToa>) | undefined, can: boolean) {
  const [toa, datToa] = useState<DanhSachToa | undefined>(undefined);
  const [dangTai, datDangTai] = useState(false);
  const [loi, datLoi] = useState(false);
  const tai = useCallback(async () => {
    if (!layToa) { datLoi(true); return; }
    datDangTai(true);
    datLoi(false);
    try { datToa(await layToa()); } catch { datLoi(true); } finally { datDangTai(false); }
  }, [layToa]);
  useEffect(() => { if (can && toa === undefined && !dangTai && !loi) void tai(); }, [can, toa, dangTai, loi, tai]);
  return { toa, datToa, dangTai, loi, tai };
}

export function MucThemCan(props: {
  toa: DanhSachToa | undefined;
  dangTaiToa: boolean;
  loiTaiToa: boolean;
  onTaiLaiToa: () => void;
  toaNhaId: string | null;
  onChonToa: (id: string | null) => void;
  /** YC3.4 bước 33: thêm tòa mới rồi chọn cho căn. Trả câu lỗi để hiện dưới ô tên tòa, null khi xong hay đã báo bằng toast. */
  onThemToa: (ten: string) => Promise<string | null>;
  loaiView: string | null;
  onChonView: (v: string | null) => void;
  soGiuong: string;
  onDoiSoGiuong: (v: string) => void;
  moTa: string;
  onDoiMoTa: (v: string) => void;
  loi: LoiCan;
  onThuGon: () => void;
}) {
  const [khac, datKhac] = useState(false);
  const [chu, datChu] = useState('');
  const [dangThem, datDangThem] = useState(false);
  const [loiToaMoi, datLoiToaMoi] = useState<string | null>(null);

  const chip = props.toa ? xepChipToa(props.toa.ds, props.toa.daDung, props.toaNhaId) : [];
  // YC3-H7: chạm chip đang chọn thì bỏ chọn (cùng cách cho chip tòa).
  const chonChip = (id: string) => { datKhac(false); props.onChonToa(props.toaNhaId === id ? null : id); };
  const chonTuDanhSach = (id: string) => { props.onChonToa(id); datKhac(false); datChu(''); datLoiToaMoi(null); };
  const themMoi = async (ten: string) => {
    datDangThem(true);
    datLoiToaMoi(null);
    try {
      const cau = await props.onThemToa(ten);
      if (cau) { datLoiToaMoi(cau); return; }
      datKhac(false);
      datChu('');
    } finally {
      datDangThem(false);
    }
  };

  return (
    <>
      <div style={S.the}>
        <div style={S.nhom} role="group" aria-labelledby="cn5a1-toa">
          <span id="cn5a1-toa" style={S.nhan}>Tòa nhà</span>
          {props.toa ? (
            <div style={S.hangChip}>
              {chip.map((t) => (
                <button key={t.id} type="button" aria-pressed={props.toaNhaId === t.id}
                        style={props.toaNhaId === t.id ? { ...S.chip, ...S.chipChon } : S.chip} onClick={() => chonChip(t.id)}>
                  {t.ten}
                </button>
              ))}
              <button type="button" aria-pressed={khac} style={khac ? { ...S.chip, ...S.chipChon } : S.chip}
                      onClick={() => datKhac((k) => !k)}>
                {CHIP_TOA_KHAC}
              </button>
            </div>
          ) : props.loiTaiToa ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }} role="alert">
              <span style={S.phu}>{CAU_CHUA_TAI}</span>
              <button type="button" className="hh-btn hh-btn--text hh-btn--inline" onClick={props.onTaiLaiToa}>Thử lại</button>
            </div>
          ) : (
            <KhungXam soDong={1} />
          )}
          {props.loi.toaNha && <p style={S.loi} role="alert">⚠️ {props.loi.toaNha}</p>}
        </div>

        {khac && props.toa && (
          <CN5A1bChonToa ds={props.toa.ds} chu={chu} onDoiChu={(v) => { datChu(v); datLoiToaMoi(null); }}
                         onChon={chonTuDanhSach} onThemMoi={(ten) => void themMoi(ten)} dangThem={dangThem} loi={loiToaMoi} />
        )}

        <div style={S.nhom} role="group" aria-labelledby="cn5a1-view">
          <span id="cn5a1-view" style={S.nhan}>Loại view</span>
          <div style={S.hangChip}>
            {CHIP_VIEW.map((v) => (
              <button key={v.ma} type="button" aria-pressed={props.loaiView === v.ma}
                      style={props.loaiView === v.ma ? { ...S.chip, ...S.chipChon } : S.chip}
                      onClick={() => props.onChonView(props.loaiView === v.ma ? null : v.ma)}>
                {v.chu}
              </button>
            ))}
          </div>
          {props.loi.loaiView && <p style={S.loi} role="alert">⚠️ {props.loi.loaiView}</p>}
        </div>

        <div style={S.nhom}>
          <label className="hh-field">
            <span className="hh-field__label">Số giường</span>
            <input type="text" inputMode="numeric" className={'hh-input' + (props.loi.soGiuong ? ' hh-input--loi' : '')}
                   placeholder="VD: 3" value={props.soGiuong} onChange={(e) => props.onDoiSoGiuong(e.target.value)}
                   aria-invalid={props.loi.soGiuong ? true : undefined} autoComplete="off" />
          </label>
          {props.loi.soGiuong && <p style={S.loi} role="alert">⚠️ {props.loi.soGiuong}</p>}
          <span style={S.phu}>Không bắt buộc. Thẻ căn ghi "2PN · 3 giường".</span>
        </div>
      </div>

      <div style={S.the}>
        <label className="hh-field">
          <span className="hh-field__label">Mô tả gửi khách</span>
          <textarea className={'hh-input' + (props.loi.moTa ? ' hh-input--loi' : '')} rows={4}
                    placeholder="VD: Căn góc tầng 15, view biển. Đi bộ 3 phút ra bãi tắm." value={props.moTa}
                    onChange={(e) => props.onDoiMoTa(e.target.value)} aria-invalid={props.loi.moTa ? true : undefined} />
          <span className="hh-field__hint">Sale dùng đoạn này khi gửi thông tin căn cho khách.</span>
        </label>
        {props.loi.moTa && <p style={S.loi} role="alert">⚠️ {props.loi.moTa}</p>}
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button type="button" className="hh-btn hh-btn--text hh-btn--inline" aria-expanded={true} onClick={props.onThuGon}>Thu gọn</button>
      </div>
    </>
  );
}
