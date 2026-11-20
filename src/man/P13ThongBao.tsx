// P13, P13-00 · Màn Thông báo (YC12.2, US62): danh sách thông báo của chính mình, mới trước, nhóm "Hôm nay" và "Trước đó", 50 dòng mỗi lần.
// Chạm một dòng: mở màn ở cột "Chạm mở" (shell lo, onCham) và dòng thành đã đọc. "Đánh dấu đã đọc": mọi dòng thành đã đọc.
// HV1 khung xám, HV2 Thử lại, HV3 quay lại từ nền đọc lại trang đầu khi chưa tải thêm, HV8 toast.
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { KhungXam } from '../chung/dangTai';
import { cauBaoLoi, DaiMatKetNoi, ManChuaTai } from '../chung/matKetNoi';
import { useQuayLaiTuNen } from '../chung/nhap';
import { useToast } from '../chung/Toast';
import type { DichVuThongBao } from '../lib/dichVuThongBao';
import { chuCuaThongBao, gioThongBao, laHomNay, mauChamThongBao, type ThongBao } from '../lib/thongBao';
import { Icon } from './TabChu';
import './P13ThongBao.css';

const ICON_QUAY_LAI = <path d="m15 18-6-6 6-6" />;

/** YC12.2 bước 5: P13-00. */
export const CAU_CHUA_CO_THONG_BAO = 'Chưa có thông báo nào';
export const CAU_GOI_Y_CHUA_CO = 'Khi chủ nhà đồng ý cho xem lịch hay có yêu cầu đặt phòng, thông báo hiện ở đây.';

export function P13ThongBao(props: {
  dv?: Pick<DichVuThongBao, 'layDs' | 'danhDauDaDoc'>;
  onQuayLai: () => void;
  /** YC12.2 bước 3: mở màn của thông báo (shell dựng, theo diemMoTuThongBao). */
  onCham: (tb: ThongBao) => void;
  bayGio?: () => Date;
}) {
  const { dv } = props;
  const hienToast = useToast();
  const [ds, datDs] = useState<ThongBao[] | undefined>(undefined);
  const [chuaDoc, datChuaDoc] = useState(0);
  const [conNua, datConNua] = useState(false);
  const [hong, datHong] = useState(false);
  const [dangThem, datDangThem] = useState(false);
  const dau = useRef<HTMLDivElement | null>(null);

  const tai = useCallback(async () => {
    datHong(false);
    try {
      if (!dv?.layDs) throw new TypeError('chưa nối database');
      const t = await dv.layDs();
      datDs(t.dong); datChuaDoc(t.chuaDoc); datConNua(t.conNua);
    } catch {
      datHong(true);
    }
  }, [dv]);
  useEffect(() => { void tai(); }, [tai]);
  // HV3: quay lại từ nền thì đọc lại, trừ khi đã kéo xuống tải thêm (khỏi mất chỗ đang xem).
  useQuayLaiTuNen(() => { if (ds && ds.length <= 50) void tai(); });

  const them = useCallback(async () => {
    if (!dv?.layDs || !ds || ds.length === 0 || dangThem) return;
    const cuoi = ds[ds.length - 1]!;
    datDangThem(true);
    try {
      const t = await dv.layDs({ taoLuc: cuoi.taoLuc, id: cuoi.id });
      datDs((cu) => [...(cu ?? []), ...t.dong.filter((x) => !(cu ?? []).some((y) => y.id === x.id))]);
      datChuaDoc(t.chuaDoc); datConNua(t.conNua);
    } catch (e) {
      hienToast(cauBaoLoi(e), 'loi'); // HV2: giữ phần đã tải
    } finally {
      datDangThem(false);
    }
  }, [dv, ds, dangThem, hienToast]);

  // YC12.2 bước 2: kéo xuống cuối thì tải thêm.
  const cuoi = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = cuoi.current;
    if (!el || !conNua || typeof IntersectionObserver === 'undefined') return;
    const qs = new IntersectionObserver((m) => { if (m.some((x) => x.isIntersecting)) void them(); });
    qs.observe(el);
    return () => qs.disconnect();
  }, [conNua, them, ds]);

  const khung = (than: ReactNode) => (
    <div className="man p13" data-man={ds && ds.length === 0 ? 'P13-00' : 'P13'}>
      <DaiMatKetNoi />
      <header className="p13-dau">
        <button type="button" className="hh-iconbtn man-quay-lai" aria-label="Quay lại" onClick={props.onQuayLai}><Icon co={22}>{ICON_QUAY_LAI}</Icon></button>
        <h1 className="p13-tieu-de">Thông báo</h1>
      </header>
      <div ref={dau} className="p13-than">{than}</div>
    </div>
  );

  if (!ds) return khung(hong ? <ManChuaTai onThuLai={() => void tai()} /> : <KhungXam soDong={5} />);
  if (ds.length === 0) {
    return khung(
      <div className="p13-rong">
        <p className="p13-rong-chinh">{CAU_CHUA_CO_THONG_BAO}</p>
        <p className="p13-rong-phu">{CAU_GOI_Y_CHUA_CO}</p>
      </div>,
    );
  }

  const bayGio = (props.bayGio ?? (() => new Date()))();
  const danhDauMot = (tb: ThongBao) => {
    if (tb.docLuc) return;
    datDs((cu) => cu?.map((x) => (x.id === tb.id ? { ...x, docLuc: new Date().toISOString() } : x)));
    datChuaDoc((n) => Math.max(0, n - 1));
    void dv?.danhDauDaDoc?.([tb.id]).catch(() => undefined); // lỗi thì lần mở sau đọc lại đúng trạng thái
  };
  const danhDauTatCa = async () => {
    try {
      await dv!.danhDauDaDoc!();
    } catch (e) {
      hienToast(cauBaoLoi(e), 'loi');
      return;
    }
    const nay = new Date().toISOString();
    datDs((cu) => cu?.map((x) => (x.docLuc ? x : { ...x, docLuc: nay })));
    datChuaDoc(0);
  };

  const homNay = ds.filter((t) => laHomNay(t.taoLuc, bayGio));
  const truoc = ds.filter((t) => !laHomNay(t.taoLuc, bayGio));
  const nhom = (ten: string, dong: ThongBao[]) => dong.length === 0 ? null : (
    <section className="p13-nhom" aria-label={ten}>
      <h2 className="p13-nhom-ten">{ten}</h2>
      <ul className="p13-ds">
        {dong.map((tb) => {
          const c = chuCuaThongBao(tb);
          const chua = !tb.docLuc;
          return (
            <li key={tb.id}>
              <button type="button" className={'p13-dong' + (chua ? ' p13-dong--chua' : '')} data-chua-doc={chua ? 'co' : 'khong'}
                      onClick={() => { danhDauMot(tb); props.onCham(tb); }}>
                <span className={`p13-cham p13-cham--${chua ? 'xanh' : mauChamThongBao(tb.loai)}`} aria-hidden="true" />
                <span className="p13-chu">
                  <span className="p13-chinh">{c.chinh}</span>
                  {c.phu && <span className="p13-phu">{c.phu}</span>}
                </span>
                <span className="p13-gio">{gioThongBao(tb.taoLuc, bayGio)}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );

  return khung(
    <>
      <div className="p13-bang">
        <span className="p13-so" aria-live="polite">{chuaDoc} chưa đọc</span>
        <button type="button" className="hh-btn hh-btn--secondary p13-nut" disabled={chuaDoc === 0} onClick={() => void danhDauTatCa()}>Đánh dấu đã đọc</button>
      </div>
      {nhom('Hôm nay', homNay)}
      {nhom('Trước đó', truoc)}
      {conNua && (
        <div ref={cuoi} className="p13-them">
          <button type="button" className="hh-btn hh-btn--secondary" disabled={dangThem} onClick={() => void them()}>{dangThem ? 'Đang tải...' : 'Xem thêm'}</button>
        </div>
      )}
    </>,
  );
}
