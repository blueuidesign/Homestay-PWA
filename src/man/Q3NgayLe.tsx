// YC13.2 · Q3 Mục "Ngày lễ" (chọn năm, danh sách dải) và Q3-01 thêm, sửa dải. Xóa bấm hai lần.
// Luật kiểm chạy ở database (fn_quan_tri_luu_ngay_le), màn hiện nguyên câu báo (QT5.5). PQ21.ADMIN.
import { useCallback, useEffect, useState } from 'react';
import { KhungXam, NutGhi } from '../chung/dangTai';
import { cauBaoLoi } from '../chung/matKetNoi';
import { useToast } from '../chung/Toast';
import type { DaiNgayLe, DichVuQuanTri } from '../lib/dichVuQuanTri';
import { O } from './khung';

/** 2027-02-05 → 05/02/2027 */
export function ngayVn(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}
/** Số ngày của dải, tính cả ngày đầu và ngày cuối. */
export function soNgay(tu: string, den: string): number {
  return Math.round((Date.parse(den + 'T00:00:00Z') - Date.parse(tu + 'T00:00:00Z')) / 86_400_000) + 1;
}
function namNay(): number {
  return Number(new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric' }).format(new Date()));
}

type Form = { id: string | null; ten: string; tuNgay: string; denNgay: string };

export function Q3NgayLe(props: { dichVu: DichVuQuanTri; onLoi: (e: unknown) => void; namDau?: number }) {
  const { dichVu: dv, onLoi } = props;
  const [nam, datNam] = useState(props.namDau ?? namNay());
  const [ds, datDs] = useState<DaiNgayLe[] | undefined>();
  const [loiTai, datLoiTai] = useState<string | undefined>();
  const [form, datForm] = useState<Form | null>(null);

  const tai = useCallback(async () => {
    try { datDs(await dv.ngayLe(nam)); datLoiTai(undefined); } catch (e) { onLoi(e); datLoiTai(cauBaoLoi(e)); }
  }, [dv, nam, onLoi]);
  useEffect(() => { datDs(undefined); void tai(); }, [tai]);

  if (form) return <Q301Form nam={nam} form={form} dichVu={dv} onLoi={onLoi} onXong={() => { datForm(null); void tai(); }} />;

  return (
    <section data-man="Q3" className="qt-muc">
      <div className="qt-nam">
        <button type="button" className="hh-iconbtn" aria-label="Năm trước" onClick={() => datNam(nam - 1)}>‹</button>
        <span className="qt-nam__chu" aria-live="polite">Năm {nam}</span>
        <button type="button" className="hh-iconbtn" aria-label="Năm sau" onClick={() => datNam(nam + 1)}>›</button>
      </div>
      {ds === undefined ? (loiTai
        ? <div className="qt-loi-tai"><p>{loiTai}</p><button type="button" className="hh-btn hh-btn--secondary" onClick={() => void tai()}>Thử lại</button></div>
        : <KhungXam />)
        : ds.length === 0 ? <p className="qt-trong">Năm {nam} chưa có dải ngày lễ nào.</p>
        : (
          <ul className="qt-ds">
            {ds.map((d) => (
              <li key={d.id}>
                <button type="button" className="qt-dong qt-dong--nut" onClick={() => datForm({ id: d.id, ten: d.ten, tuNgay: d.tuNgay, denNgay: d.denNgay })}>
                  <span className="qt-dong__chu">
                    <span className="qt-dong__ten">{d.ten}</span>
                    <span className="qt-dong__phu">{ngayVn(d.tuNgay)} → {ngayVn(d.denNgay)} · {soNgay(d.tuNgay, d.denNgay)} ngày</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      <button type="button" className="hh-btn hh-btn--secondary hh-btn--block" onClick={() => datForm({ id: null, ten: '', tuNgay: '', denNgay: '' })}>
        Thêm dải ngày lễ
      </button>
    </section>
  );
}

function Q301Form(props: { nam: number; form: Form; dichVu: DichVuQuanTri; onLoi: (e: unknown) => void; onXong: () => void }) {
  const [f, datF] = useState(props.form);
  const [loi, datLoi] = useState<string | undefined>();
  const [choXoa, datChoXoa] = useState(false);
  const toast = useToast();
  const luu = async () => {
    datLoi(undefined);
    try { await props.dichVu.luuNgayLe({ ...f, nam: props.nam }); toast('Đã lưu dải ngày lễ'); props.onXong(); }
    catch (e) { props.onLoi(e); datLoi(cauBaoLoi(e)); }
  };
  const xoa = async () => {
    if (!choXoa) { datChoXoa(true); return; }
    try { await props.dichVu.xoaNgayLe(f.id!); toast('Đã xóa dải ngày lễ'); props.onXong(); }
    catch (e) { props.onLoi(e); datLoi(cauBaoLoi(e)); }
  };
  return (
    <section data-man="Q3-01" className="qt-muc">
      <h2 className="qt-muc__tieu-de">{f.id ? 'Sửa dải ngày lễ' : 'Thêm dải ngày lễ'} · năm {props.nam}</h2>
      <O nhan="Tên dịp" giaTri={f.ten} onDoi={(v) => datF({ ...f, ten: v })} viDu="Tết Nguyên đán" />
      <div className="hh-field">
        <label className="hh-field__label" htmlFor="qt-tu">Ngày đầu</label>
        <input id="qt-tu" className="hh-input" type="date" value={f.tuNgay} onChange={(e) => datF({ ...f, tuNgay: e.target.value })} />
      </div>
      <div className="hh-field">
        <label className="hh-field__label" htmlFor="qt-den">Ngày cuối</label>
        <input id="qt-den" className="hh-input" type="date" value={f.denNgay} onChange={(e) => datF({ ...f, denNgay: e.target.value })} />
      </div>
      {loi && <p className="cau-loi" role="alert">{loi}</p>}
      <NutGhi chu="Lưu" disabled={!f.ten.trim() || !f.tuNgay || !f.denNgay} onGhi={luu} />
      {f.id && (
        <button type="button" className={'hh-btn hh-btn--block ' + (choXoa ? 'hh-btn--primary qt-nut-do' : 'hh-btn--text')} onClick={() => void xoa()}>
          {choXoa ? 'Bấm lần nữa để xóa' : 'Xóa dải'}
        </button>
      )}
      <button type="button" className="hh-btn hh-btn--text hh-btn--block" onClick={props.onXong}>Quay lại</button>
    </section>
  );
}
