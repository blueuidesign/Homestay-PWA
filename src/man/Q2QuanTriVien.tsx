// YC13.1 bước 3 đến 5 · Q2 Quản trị viên: danh sách email, lúc thêm; ô thêm và nút gỡ chỉ quản trị viên đầu tiên thấy.
// Gỡ bấm hai lần (HV chung). Lỗi mất quyền đẩy lên trang (Q1-02, YC13-H6); lỗi khác báo dưới ô (QT5.5).
import { useCallback, useEffect, useState } from 'react';
import { KhungXam, NutGhi } from '../chung/dangTai';
import { cauBaoLoi } from '../chung/matKetNoi';
import { useToast } from '../chung/Toast';
import type { DichVuQuanTri, QuanTriVien } from '../lib/dichVuQuanTri';
import { O } from './khung';

export function ngayGio(iso: string): string {
  const d = new Date(iso);
  const p = new Intl.DateTimeFormat('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh', day: '2-digit', month: '2-digit', year: 'numeric' });
  return p.format(d);
}

export function Q2QuanTriVien(props: { dichVu: DichVuQuanTri; laGoc: boolean; onLoi: (e: unknown) => void }) {
  const { dichVu: dv, onLoi } = props;
  const [ds, datDs] = useState<QuanTriVien[] | undefined>();
  const [loiTai, datLoiTai] = useState<string | undefined>();
  const [email, datEmail] = useState('');
  const [loi, datLoi] = useState<string | undefined>();
  const [choGo, datChoGo] = useState<string | null>(null);
  const toast = useToast();

  const tai = useCallback(async () => {
    try { datDs(await dv.danhSach()); datLoiTai(undefined); } catch (e) { onLoi(e); datLoiTai(cauBaoLoi(e)); }
  }, [dv, onLoi]);
  useEffect(() => { void tai(); }, [tai]);

  if (ds === undefined) {
    return loiTai
      ? <div className="qt-loi-tai"><p>{loiTai}</p><button type="button" className="hh-btn hh-btn--secondary" onClick={() => void tai()}>Thử lại</button></div>
      : <KhungXam />;
  }

  const them = async () => {
    datLoi(undefined);
    try { await dv.them(email); datEmail(''); toast('Đã thêm quản trị viên'); await tai(); }
    catch (e) { onLoi(e); datLoi(cauBaoLoi(e)); }
  };
  const go = async (e: string) => {
    if (choGo !== e) { datChoGo(e); return; }
    try { await dv.go(e); datChoGo(null); toast('Đã gỡ quản trị viên'); await tai(); }
    catch (x) { onLoi(x); toast(cauBaoLoi(x)); }
  };

  return (
    <section data-man="Q2" className="qt-muc">
      <ul className="qt-ds">
        {ds.map((q) => (
          <li key={q.email} className="qt-dong">
            <div className="qt-dong__chu">
              <span className="qt-dong__ten">{q.email}</span>
              <span className="qt-dong__phu">{q.laGoc ? 'Quản trị viên đầu tiên' : 'Đồng quản trị'} · thêm {ngayGio(q.themLuc)}</span>
            </div>
            {props.laGoc && !q.laGoc && (
              <button type="button" className={'hh-btn ' + (choGo === q.email ? 'hh-btn--primary qt-nut-do' : 'hh-btn--text')}
                      onClick={() => void go(q.email)}>
                {choGo === q.email ? 'Bấm lần nữa để gỡ' : 'Gỡ'}
              </button>
            )}
          </li>
        ))}
      </ul>
      {props.laGoc && (
        <div className="qt-them">
          <O nhan="Email người đồng quản trị" kieu="email" giaTri={email} onDoi={datEmail} loi={loi} viDu="ten@vidu.vn" />
          <NutGhi chu="Thêm" chuDangGhi="Đang thêm…" disabled={!email.trim()} onGhi={them} lop="hh-btn hh-btn--secondary hh-btn--block" />
        </div>
      )}
    </section>
  );
}
