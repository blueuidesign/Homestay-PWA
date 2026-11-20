// CN6-05 · Đặt giá nhiều căn (YC4.4): CN6-05 chọn căn, CN6-05-00 chưa chọn căn, CN6-06 chọn tháng và nhập giá như YC4.2.
// Trạng thái: HV1 khung xám khi chưa có danh sách căn, HV2 mất mạng thì toast "Chưa lưu được" và giữ giá đang nhập,
// HV5 có căn bị xóa hay mất quyền thì câu "Không tìm thấy căn" của database, HV8 toast.
// Đặt giá ngày lễ, dịp cho nhiều căn chưa làm ([MỞ: YC4-H3]).
import { useEffect, useState } from 'react';
import { KhungXam, NutGhi } from '../chung/dangTai';
import { cauBaoLoi, DaiMatKetNoi } from '../chung/matKetNoi';
import { useToast } from '../chung/Toast';
import { tenCan } from '../lib/can';
import type { DichVuGia } from '../lib/dichVuGia';
import {
  DEM_CUOI_TUAN_MAC_DINH_ISO, chuThang, dauThang, dinhDangOGia, docSoTien, dongDangChon, kiemGia, tenOGia,
} from '../lib/gia';
import { homNay as homNayVN, type Ngay } from '../lib/ngay';
import { ChonNam } from './CN6GiaCan';
import { Icon } from './TabChu';

const ICON_QUAY_LAI = <path d="m15 18-6-6 6-6" />;
const ICON_TOI = <path d="m9 18 6-6-6-6" />;
const ICON_DAU = <path d="M20 6 9 17l-5-5" />;

/** YC4.4 bước 2: chữ nút dưới đáy CN6-05. */
export function chuNutChonCan(soChon: number): string {
  return soChon === 0 ? 'Chọn ít nhất một căn' : `Đặt giá cho ${soChon} căn`;
}

export function CN6DatGiaNhieu(props: {
  /** Căn chưa xóa của chủ nhà (YC4.4 bước 1). */
  ds: { id: string; maCan: string }[] | undefined;
  dv: DichVuGia | undefined;
  onQuayLai: () => void;
  onDaApDung: (soCan: number) => void;
  homNay?: Ngay;
}) {
  const homNay = props.homNay ?? homNayVN();
  const namNay = Number(homNay.slice(0, 4));
  const hienToast = useToast();
  const [buoc, datBuoc] = useState<'chon-can' | 'dat-gia'>('chon-can');
  const [canChon, datCanChon] = useState<string[]>([]);
  const [nam, datNam] = useState(namNay);
  const [moNam, datMoNam] = useState(false);
  const [thang, datThang] = useState<number[]>([]);
  const [thuong, datThuong] = useState('');
  const [cuoiTuan, datCuoiTuan] = useState('');
  const [loiO, datLoiO] = useState<string | null>(null);
  const [demCuoiTuan, datDemCuoiTuan] = useState<number[]>([...DEM_CUOI_TUAN_MAC_DINH_ISO]);

  useEffect(() => {
    let con = true;
    props.dv?.layDemCuoiTuan?.().then((d) => { if (con) datDemCuoiTuan(d); }).catch(() => {});
    return () => { con = false; };
  }, [props.dv]);

  const ds = props.ds;
  const tongCan = ds?.length ?? 0;
  const doiCan = (id: string) => datCanChon((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));
  const chonTatCa = () => datCanChon(ds ? ds.map((c) => c.id) : []);

  const dau = (tieuDe: string, quayLai: () => void) => (
    <header className="cn6-dau">
      <button type="button" className="hh-iconbtn man-quay-lai" aria-label="Quay lại" onClick={quayLai}><Icon co={22}>{ICON_QUAY_LAI}</Icon></button>
      <h1 className="cn6-tieu-de">{tieuDe}</h1>
    </header>
  );

  if (buoc === 'chon-can') {
    return (
      <div className="man cn6">
        <DaiMatKetNoi />
        {dau('Đặt giá nhiều căn', props.onQuayLai)}
        <div className="cn6-than cn6-dip">
          <section className="cn6-the" aria-label="Chọn căn">
            <div className="cn6-the-dau">
              <h2 className="cn6-nhan">Chọn căn · đã chọn {canChon.length}/{tongCan}</h2>
              <button type="button" className="hh-btn hh-btn--text" onClick={chonTatCa}>Chọn tất cả</button>
            </div>
            {!ds ? <KhungXam soDong={3} /> : ds.map((c) => {
              const chon = canChon.includes(c.id);
              return (
                <button key={c.id} type="button" role="checkbox" aria-checked={chon} className={chon ? 'hh-check hh-check--on cn6-dong-can' : 'hh-check cn6-dong-can'}
                        onClick={() => doiCan(c.id)}>
                  <span className="hh-check__box" aria-hidden="true">{chon && <Icon co={13}>{ICON_DAU}</Icon>}</span>
                  <span>{tenCan(c.maCan)}</span>
                </button>
              );
            })}
          </section>
        </div>
        <div className="cn6-day">
          <button type="button" className="hh-btn hh-btn--primary hh-btn--block" disabled={canChon.length === 0}
                  onClick={() => datBuoc('dat-gia')}>{chuNutChonCan(canChon.length)}</button>
        </div>
      </div>
    );
  }

  // CN6-06
  const ten = tenOGia(demCuoiTuan);
  const doiThang = (t: number) => { datLoiO(null); datThang((c) => (c.includes(t) ? c.filter((x) => x !== t) : [...c, t])); };
  const apDung = async () => {
    const loiKiem = kiemGia(thuong, cuoiTuan);
    if (loiKiem) { datLoiO(loiKiem); return; }
    datLoiO(null);
    const ts = [...thang].sort((a, b) => a - b);
    try {
      if (!props.dv?.datGiaThangNhieu) throw new TypeError('chưa nối database');
      await props.dv.datGiaThangNhieu(canChon, ts.map((t) => dauThang(nam, t)), docSoTien(thuong)!, docSoTien(cuoiTuan)!);
    } catch (e) {
      hienToast(cauBaoLoi(e), 'loi'); // HV2, HV5, QT5.5: giữ giá đang nhập
      return;
    }
    props.onDaApDung(canChon.length); // YC4.4 bước 4
  };
  const tenChon = (ds ?? []).filter((c) => canChon.includes(c.id));

  return (
    <div className="man cn6">
      <DaiMatKetNoi />
      {dau(`Đặt giá · ${canChon.length} căn`, () => datBuoc('chon-can'))}
      <div className="cn6-than">
        <section className="cn6-the" aria-label="Căn áp dụng">
          <div className="cn6-the-dau">
            <h2 className="cn6-nhan">Căn áp dụng</h2>
            <button type="button" className="hh-btn hh-btn--text" onClick={() => datBuoc('chon-can')}>Đổi căn</button>
          </div>
          <p className="cn6-dip-dong">{tenChon.map((c) => tenCan(c.maCan)).join(', ')}</p>
        </section>
        <section className="cn6-the" aria-label="Giá theo tháng">
          <div className="cn6-the-dau">
            <h2 className="cn6-nhan">Giá theo tháng</h2>
            <button type="button" className="cn6-chon-nam" onClick={() => datMoNam(true)} aria-haspopup="dialog">
              Năm {nam}<span className="cn6-xuong"><Icon>{ICON_TOI}</Icon></span>
            </button>
          </div>
          <div className="cn6-thang">
            {Array.from({ length: 12 }, (_, i) => i + 1).map((t) => {
              const daChon = thang.includes(t);
              return (
                <button key={t} type="button" aria-pressed={daChon} className={'cn6-o-thang' + (daChon ? ' cn6-o-thang--chon' : '')}
                        onClick={() => doiThang(t)}>
                  <span className="cn6-o-thang-ten">Tháng {t}</span>
                </button>
              );
            })}
          </div>
          <p className={thang.length ? 'cn6-dang-chon' : 'cn6-dang-chon cn6-dang-chon--chua'}>{dongDangChon(thang)}</p>
          <div className="cn6-hai-o">
            <label className="hh-field">
              <span className="hh-field__label">{ten.thuong}</span>
              <input className={'hh-input' + (loiO ? ' hh-input--loi' : '')} type="text" inputMode="numeric" placeholder="VD: 800.000"
                     value={thuong} onChange={(e) => { datLoiO(null); datThuong(dinhDangOGia(e.target.value)); }} />
            </label>
            <label className="hh-field">
              <span className="hh-field__label">{ten.cuoiTuan}</span>
              <input className={'hh-input' + (loiO ? ' hh-input--loi' : '')} type="text" inputMode="numeric" placeholder="VD: 1.100.000"
                     value={cuoiTuan} onChange={(e) => { datLoiO(null); datCuoiTuan(dinhDangOGia(e.target.value)); }} />
            </label>
          </div>
          {loiO && <p className="hh-field__loi" role="alert">{loiO}</p>}
          <NutGhi chu={thang.length ? `Áp dụng cho ${chuThang(thang)}` : 'Áp dụng cho tháng đã chọn'} onGhi={apDung}
                  disabled={thang.length === 0 || !props.dv} />
        </section>
      </div>
      {moNam && <ChonNam namNay={namNay} dangChon={nam} onChon={(n) => { datMoNam(false); if (n !== nam) { datNam(n); datThang([]); } }}
                         onDong={() => datMoNam(false)} />}
    </div>
  );
}
