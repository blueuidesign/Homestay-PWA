// YC13.3 · Q4 Mục "Tòa nhà", Q4-01 thêm, sửa tòa, Q4-02 gộp tòa trùng (bấm hai lần). QT6.3, PQ21.ADMIN.
// Luật kiểm ở database (fn_quan_tri_luu_toa, fn_quan_tri_gop_toa); màn hiện nguyên câu báo (QT5.5).
import { useCallback, useEffect, useState } from 'react';
import { KhungXam, NutGhi } from '../chung/dangTai';
import { cauBaoLoi } from '../chung/matKetNoi';
import { useToast } from '../chung/Toast';
import type { DichVuQuanTri, ToaQuanTri } from '../lib/dichVuQuanTri';
import { O } from './khung';

export const NHAN_DAT_SAN = 'Home247 đặt sẵn';
export const NHAN_NGUOI_DUNG = 'Người dùng thêm';

type Mo = { loai: 'form'; toa: ToaQuanTri | null } | { loai: 'gop'; toa: ToaQuanTri };

export function Q4ToaNha(props: { dichVu: DichVuQuanTri; onLoi: (e: unknown) => void }) {
  const { dichVu: dv, onLoi } = props;
  const [ds, datDs] = useState<ToaQuanTri[] | undefined>();
  const [loiTai, datLoiTai] = useState<string | undefined>();
  const [mo, datMo] = useState<Mo | null>(null);

  const tai = useCallback(async () => {
    try { datDs(await dv.toa()); datLoiTai(undefined); } catch (e) { onLoi(e); datLoiTai(cauBaoLoi(e)); }
  }, [dv, onLoi]);
  useEffect(() => { void tai(); }, [tai]);
  const xong = () => { datMo(null); void tai(); };

  if (mo?.loai === 'form') return <Q401Form toa={mo.toa} dichVu={dv} onLoi={onLoi} onXong={xong} onGop={(t) => datMo({ loai: 'gop', toa: t })} />;
  if (mo?.loai === 'gop') return <Q402Gop toa={mo.toa} ds={ds ?? []} dichVu={dv} onLoi={onLoi} onXong={xong} />;

  if (ds === undefined) {
    return loiTai
      ? <div className="qt-loi-tai"><p>{loiTai}</p><button type="button" className="hh-btn hh-btn--secondary" onClick={() => void tai()}>Thử lại</button></div>
      : <KhungXam />;
  }
  return (
    <section data-man="Q4" className="qt-muc">
      {ds.length === 0 ? <p className="qt-trong">Chưa có tòa nào.</p> : (
        <ul className="qt-ds">
          {ds.map((t) => (
            <li key={t.id}>
              <button type="button" className="qt-dong qt-dong--nut" onClick={() => datMo({ loai: 'form', toa: t })}>
                <span className="qt-dong__chu">
                  <span className="qt-dong__ten">{t.ten}</span>
                  <span className="qt-dong__phu">{t.khuVuc ? t.khuVuc + ' · ' : ''}{t.home247 ? NHAN_DAT_SAN : NHAN_NGUOI_DUNG}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <button type="button" className="hh-btn hh-btn--secondary hh-btn--block" onClick={() => datMo({ loai: 'form', toa: null })}>Thêm tòa</button>
    </section>
  );
}

function Q401Form(props: { toa: ToaQuanTri | null; dichVu: DichVuQuanTri; onLoi: (e: unknown) => void; onXong: () => void; onGop: (t: ToaQuanTri) => void }) {
  const [ten, datTen] = useState(props.toa?.ten ?? '');
  const [khuVuc, datKhuVuc] = useState(props.toa?.khuVuc ?? '');
  const [loi, datLoi] = useState<string | undefined>();
  const toast = useToast();
  const luu = async () => {
    datLoi(undefined);
    try { await props.dichVu.luuToa({ id: props.toa?.id ?? null, ten, khuVuc }); toast('Đã lưu tòa'); props.onXong(); }
    catch (e) { props.onLoi(e); datLoi(cauBaoLoi(e)); }
  };
  return (
    <section data-man="Q4-01" className="qt-muc">
      <h2 className="qt-muc__tieu-de">{props.toa ? 'Sửa tòa' : 'Thêm tòa'}</h2>
      {props.toa && <p className="dong-mo">{props.toa.home247 ? NHAN_DAT_SAN : NHAN_NGUOI_DUNG}</p>}
      <O nhan="Tên tòa" giaTri={ten} onDoi={datTen} viDu="ICON40" />
      <O nhan="Khu vực" giaTri={khuVuc} onDoi={datKhuVuc} viDu="Bãi Cháy" />
      {loi && <p className="cau-loi" role="alert">{loi}</p>}
      <NutGhi chu="Lưu" disabled={!ten.trim()} onGhi={luu} />
      {props.toa && (
        <button type="button" className="hh-btn hh-btn--text hh-btn--block" onClick={() => props.onGop(props.toa!)}>Gộp tòa này vào tòa khác</button>
      )}
      <button type="button" className="hh-btn hh-btn--text hh-btn--block" onClick={props.onXong}>Quay lại</button>
    </section>
  );
}

function Q402Gop(props: { toa: ToaQuanTri; ds: ToaQuanTri[]; dichVu: DichVuQuanTri; onLoi: (e: unknown) => void; onXong: () => void }) {
  const [giu, datGiu] = useState<string | null>(null);
  const [choGop, datChoGop] = useState(false);
  const [loi, datLoi] = useState<string | undefined>();
  const toast = useToast();
  const khac = props.ds.filter((t) => t.id !== props.toa.id);
  const tenGiu = khac.find((t) => t.id === giu)?.ten;
  const gop = async () => {
    if (!giu) return;
    if (!choGop) { datChoGop(true); return; }
    try { await props.dichVu.gopToa(giu, props.toa.id); toast(`Đã gộp ${props.toa.ten} vào ${tenGiu}`); props.onXong(); }
    catch (e) { props.onLoi(e); datLoi(cauBaoLoi(e)); datChoGop(false); }
  };
  return (
    <section data-man="Q4-02" className="qt-muc">
      <h2 className="qt-muc__tieu-de">Gộp {props.toa.ten} vào</h2>
      <p className="dong-mo">Mọi căn của {props.toa.ten} chuyển sang tòa bạn chọn, rồi {props.toa.ten} bị xóa khỏi danh sách.</p>
      <ul className="qt-ds" role="radiogroup" aria-label="Tòa giữ lại">
        {khac.map((t) => (
          <li key={t.id}>
            <button type="button" role="radio" aria-checked={giu === t.id}
                    className={'qt-dong qt-dong--nut' + (giu === t.id ? ' qt-dong--chon' : '')}
                    onClick={() => { datGiu(t.id); datChoGop(false); }}>
              <span className="qt-dong__chu">
                <span className="qt-dong__ten">{t.ten}</span>
                <span className="qt-dong__phu">{t.home247 ? NHAN_DAT_SAN : NHAN_NGUOI_DUNG}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      {loi && <p className="cau-loi" role="alert">{loi}</p>}
      <button type="button" disabled={!giu} className={'hh-btn hh-btn--block ' + (choGop ? 'hh-btn--primary qt-nut-do' : 'hh-btn--primary')} onClick={() => void gop()}>
        {choGop ? `Bấm lần nữa để gộp vào ${tenGiu}` : 'Gộp'}
      </button>
      <button type="button" className="hh-btn hh-btn--text hh-btn--block" onClick={props.onXong}>Quay lại</button>
    </section>
  );
}
