// CN6 · Tab Giá của một căn (YC4.2): CN6 giá theo tháng, CN6-00 chưa đặt giá, CN6-04 áp dụng giá xong, CN6-09 chọn năm.
// Trạng thái: HV1 khung xám, HV2 chưa tải được thì Thử lại và giữ giá đang nhập, HV3 quay lại từ nền đọc lại giá, HV5 căn mất quyền
// thì câu "Không tìm thấy căn" của database, HV8 toast. Đặt giá dịp (YC4.3) mở CN6-02 (CN6GiaDip). Sao chép giá (YC4.5) làm ở US sau.
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { DongDangCapNhat, KhungXam, NutGhi } from '../chung/dangTai';
import { cauBaoLoi, DaiMatKetNoi, ManChuaTai } from '../chung/matKetNoi';
import { useQuayLaiTuNen } from '../chung/nhap';
import { useToast } from '../chung/Toast';
import type { BangGiaNam, DichVuGia } from '../lib/dichVuGia';
import {
  CAU_CHUA_CO_GIA, cacDemCuaThang, chuDai, chuOThang, chuThang, congThang, dauThang, dinhDangOGia, docSoTien,
  dongDangChon, kiemGia, sangThu, soOTrongDau, tenDip, tenOGia, tenThangNgan, type DemGia,
} from '../lib/gia';
import { homNay as homNayVN, laDemCuoiTuan, type Ngay } from '../lib/ngay';
import { vietTien, vietTienGon } from '../lib/tien';
import { Icon } from './TabChu';
import { CN6GiaDip } from './CN6GiaDip';
import './CN6GiaCan.css';

/** Nút của YC4.5 (US sau) bấm thì báo câu này. */
export const CAU_SE_CO = 'Sẽ có ở bản sau';

const ICON_QUAY_LAI = <path d="m15 18-6-6 6-6" />;
const ICON_TOI = <path d="m9 18 6-6-6-6" />;
const ICON_DONG = <><path d="M18 6 6 18" /><path d="m6 6 12 12" /></>;
const ICON_LICH_SAO = <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4" /><path d="M8 2v4" /><path d="M3 10h18" /><path d="M12 14v4" /><path d="M10 16h4" /></>;
const ICON_SAO_CHEP = <><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>;

/** Khung chung của màn căn: tiêu đề "Phòng 3402", hai tab "Thông tin" / "Giá" (YC4.2 bước 1). */
export function KhungCan(props: { tieuDe: string; tab: 'thong-tin' | 'gia'; onQuayLai: () => void; onChonTab: (t: 'thong-tin' | 'gia') => void; children: ReactNode }) {
  return (
    <div className="man cn6">
      <DaiMatKetNoi />
      <header className="cn6-dau">
        <button type="button" className="hh-iconbtn man-quay-lai" aria-label="Quay lại" onClick={props.onQuayLai}><Icon co={22}>{ICON_QUAY_LAI}</Icon></button>
        <h1 className="cn6-tieu-de">{props.tieuDe}</h1>
      </header>
      <nav className="cn6-tabs" aria-label="Tab căn">
        {(['thong-tin', 'gia'] as const).map((t) => (
          <button key={t} type="button" className={t === props.tab ? 'cn6-tab cn6-tab--on' : 'cn6-tab'}
                  aria-current={t === props.tab ? 'page' : undefined} onClick={() => props.onChonTab(t)}>
            {t === 'gia' ? 'Giá' : 'Thông tin'}
          </button>
        ))}
      </nav>
      <div className="cn6-than">{props.children}</div>
    </div>
  );
}

function useBangGia(dv: DichVuGia | undefined, canId: string, nam: number) {
  const [bang, datBang] = useState<BangGiaNam | undefined>(undefined);
  const [dangTai, datDangTai] = useState(false);
  const [loi, datLoi] = useState(false);
  const tai = useCallback(async () => {
    datDangTai(true);
    datLoi(false);
    try {
      if (!dv) throw new TypeError('chưa nối database');
      const b = await dv.layBangGia(canId, nam);
      datBang(b);
    } catch {
      datLoi(true);
    } finally {
      datDangTai(false);
    }
  }, [dv, canId, nam]);
  useEffect(() => { datBang((b) => (b && b.nam === nam ? b : undefined)); void tai(); }, [tai, nam]);
  return { bang, dangTai, loi, tai };
}

function useLichGia(dv: DichVuGia | undefined, canId: string, thang: Ngay) {
  const [lich, datLich] = useState<{ thang: Ngay; dem: DemGia[] } | undefined>(undefined);
  const [loi, datLoi] = useState(false);
  const tai = useCallback(async () => {
    datLoi(false);
    try {
      if (!dv) throw new TypeError('chưa nối database');
      datLich({ thang, dem: await dv.layLichGia(canId, thang) });
    } catch {
      datLoi(true);
    }
  }, [dv, canId, thang]);
  useEffect(() => { void tai(); }, [tai]);
  return { lich: lich && lich.thang === thang ? lich.dem : undefined, loi, tai };
}

/** YC4.2 bước 6: lịch giá một tháng, tuần bắt đầu thứ Hai, chuyển tháng bằng "T09", "T11". */
function LichGia(props: { nam: number; thang: number; dem: DemGia[] | undefined; loi: boolean; homNay: Ngay; demCuoiTuan: number[];
                          onDoiThang: (buoc: number) => void; onThuLai: () => void; onChamNgay: (ngay: Ngay) => void }) {
  const [, thangTruoc] = congThang(props.nam, props.thang, -1);
  const [, thangSau] = congThang(props.nam, props.thang, 1);
  const cuoiTuan = sangThu(props.demCuoiTuan);
  const trong = soOTrongDau(props.nam, props.thang);
  const theoNgay = new Map((props.dem ?? []).map((d) => [d.dem, d]));
  return (
    <section className="cn6-the cn6-lich" aria-label={`Lịch giá tháng ${props.thang}`}>
      <div className="cn6-lich-dau">
        <button type="button" className="cn6-chuyen" onClick={() => props.onDoiThang(-1)} aria-label={tenThangNgan(thangTruoc)}>
          <Icon>{ICON_QUAY_LAI}</Icon><span>{tenThangNgan(thangTruoc)}</span>
        </button>
        <h2 className="cn6-lich-ten">Lịch giá tháng {props.thang}</h2>
        <button type="button" className="cn6-chuyen" onClick={() => props.onDoiThang(1)} aria-label={tenThangNgan(thangSau)}>
          <span>{tenThangNgan(thangSau)}</span><Icon>{ICON_TOI}</Icon>
        </button>
      </div>
      {props.loi ? <ManChuaTai onThuLai={props.onThuLai} /> : !props.dem ? <KhungXam soDong={4} /> : (
        <div className="cn6-luoi" role="grid">
          {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((t) => <div key={t} className="cn6-thu" role="columnheader">{t}</div>)}
          {Array.from({ length: trong }, (_, i) => <div key={'t' + i} className="cn6-ngay cn6-ngay--trong" />)}
          {cacDemCuaThang(props.nam, props.thang).map((ngay) => {
            const d = theoNgay.get(ngay);
            const lop = ['cn6-ngay'];
            if (d?.loai === 'dip') lop.push('cn6-ngay--dip');
            else if (d?.loai === 'ngay_le') lop.push('cn6-ngay--le');
            else if (d?.coKhach) lop.push('cn6-ngay--khach');
            if (ngay < props.homNay) lop.push('cn6-ngay--qua');
            if (ngay === props.homNay) lop.push('cn6-ngay--nay');
            if (laDemCuoiTuan(ngay, cuoiTuan)) lop.push('cn6-ngay--cuoi');
            const gia = d && d.gia !== null ? vietTienGon(d.gia) : '';
            return (
              <button key={ngay} type="button" role="gridcell" className={lop.join(' ')} data-ngay={ngay} onClick={() => props.onChamNgay(ngay)}
                      aria-label={`Ngày ${Number(ngay.slice(8))}: ${gia || 'chưa có giá'}${d?.coKhach ? ', có khách' : ''}`}>
                <span className="cn6-ngay-so">{Number(ngay.slice(8))}</span>
                <span className="cn6-ngay-gia">{gia}</span>
              </button>
            );
          })}
        </div>
      )}
      <div className="cn6-chu-thich">
        <span><i className="cn6-mau cn6-mau--dip" />Dịp đặc biệt</span>
        <span><i className="cn6-mau cn6-mau--le" />Ngày lễ</span>
        <span><i className="cn6-mau cn6-mau--khach" />Có khách</span>
      </div>
      <span className="cn6-meo-nho">💡 Chạm một ngày để đặt giá ngày lễ, dịp đặc biệt.</span>
    </section>
  );
}

/** CN6-09: chọn năm nay hoặc năm sau (YC4.2 bước 5). */
function ChonNam(props: { namNay: number; dangChon: number; onChon: (n: number) => void; onDong: () => void }) {
  return (
    <>
      <div className="cn6-man-toi" onClick={props.onDong} aria-hidden="true" />
      <div className="cn6-tam" role="dialog" aria-modal="true" aria-label="Đặt giá cho năm">
        <div className="cn6-tam-dau">
          <h2 className="cn6-tam-ten">Đặt giá cho năm</h2>
          <button type="button" className="hh-iconbtn" aria-label="Đóng" onClick={props.onDong}><Icon co={20}>{ICON_DONG}</Icon></button>
        </div>
        <div className="cn6-tam-than">
          {[props.namNay, props.namNay + 1].map((n, i) => (
            <button key={n} type="button" className="cn6-nam" aria-pressed={n === props.dangChon} onClick={() => props.onChon(n)}>
              <span className="cn6-nam-chu">
                <span className={n === props.dangChon ? 'cn6-nam-ten cn6-nam-ten--chon' : 'cn6-nam-ten'}>Năm {n}</span>
                <span className="cn6-nam-phu">{i === 0 ? 'Năm nay' : 'Năm sau'}</span>
              </span>
              <span className="cn6-nam-dau" aria-hidden="true">{n === props.dangChon ? '✓' : ''}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

export function CN6GiaCan(props: {
  canId: string;
  maCan: string | null;
  dv: DichVuGia | undefined;
  onQuayLai: () => void;
  onThongTin: () => void;
  /** Hôm nay theo giờ Việt Nam; test truyền ngày cố định. */
  homNay?: Ngay;
}) {
  const homNay = props.homNay ?? homNayVN();
  const namNay = Number(homNay.slice(0, 4));
  const hienToast = useToast();
  const [nam, datNam] = useState(namNay);
  const [moNam, datMoNam] = useState(false);
  const [chon, datChon] = useState<number[]>([]);
  const [thuong, datThuong] = useState('');
  const [cuoiTuan, datCuoiTuan] = useState('');
  const [loiO, datLoiO] = useState<string | null>(null);
  const [moDip, datMoDip] = useState<Ngay | null>(null); // CN6-02 đang mở, với ngày điền sẵn
  const [lichThang, datLichThang] = useState<[number, number]>([namNay, Number(homNay.slice(5, 7))]);
  const { bang, dangTai, loi, tai } = useBangGia(props.dv, props.canId, nam);
  const lich = useLichGia(props.dv, props.canId, dauThang(lichThang[0], lichThang[1]));

  // HV3: quay lại từ nền thì đọc lại giá; giá đang nhập giữ nguyên.
  useQuayLaiTuNen(() => { void tai(); void lich.tai(); });

  const seCo = () => hienToast(CAU_SE_CO);
  const tieuDe = props.maCan ? (/^\d+$/.test(props.maCan.trim()) ? `Phòng ${props.maCan.trim()}` : props.maCan.trim()) : 'Căn';
  const khung = (than: ReactNode) => (
    <KhungCan tieuDe={tieuDe} tab="gia" onQuayLai={props.onQuayLai} onChonTab={(t) => { if (t === 'thong-tin') props.onThongTin(); }}>{than}</KhungCan>
  );

  // YC4.3: màn CN6-02. Lưu xong về tab Giá, toast "Đã lưu giá <tên>", đọc lại giá (bước 7).
  if (moDip && bang) {
    return (
      <CN6GiaDip canId={props.canId} tieuDe={tieuDe} dv={props.dv} nam={nam} dip={bang.dip} ngayDau={moDip}
                 onQuayLai={() => datMoDip(null)}
                 onDaLuu={(tenDai) => { datMoDip(null); hienToast(`Đã lưu giá ${tenDai}`); void tai(); void lich.tai(); }} />
    );
  }

  if (!bang) return khung(loi ? <ManChuaTai onThuLai={() => void tai()} /> : <KhungXam soDong={6} />);

  const chuaCoGia = bang.thang.every((g) => !g) && bang.dip.length === 0; // CN6-00
  const ten = tenOGia(bang.demCuoiTuan);
  const chuChon = chuThang(chon);
  const doiChon = (t: number) => { datLoiO(null); datChon((c) => (c.includes(t) ? c.filter((x) => x !== t) : [...c, t])); };
  const doiNam = (n: number) => { datMoNam(false); if (n !== nam) { datNam(n); datChon([]); } };

  const apDung = async () => {
    const loiKiem = kiemGia(thuong, cuoiTuan);
    if (loiKiem) { datLoiO(loiKiem); return; }
    datLoiO(null);
    const thang = [...chon].sort((a, b) => a - b);
    try {
      await props.dv!.datGiaThang(props.canId, thang.map((t) => dauThang(nam, t)), docSoTien(thuong)!, docSoTien(cuoiTuan)!);
    } catch (e) {
      hienToast(cauBaoLoi(e), 'loi'); // HV2, HV5, QT5.5: giữ giá đang nhập
      return;
    }
    hienToast(`Đã áp dụng giá cho ${chuThang(thang)}`); // YC4.2 bước 4, CN6-04; ở lại tab Giá (YC4-H5)
    await Promise.all([tai(), lich.tai()]);
  };

  const ngayLe = bang.dip.filter((d) => d.laNgayLe);
  const dipDB = bang.dip.filter((d) => !d.laNgayLe);
  const dongDai = (d: typeof bang.dip[number]) => (
    <button key={d.id} type="button" className="cn6-dai" onClick={seCo}>
      <span className="cn6-dai-chu"><span className="cn6-dai-ngay">{chuDai(d.tuNgay, d.denNgay)}</span><span className="cn6-dai-ten">{tenDip(d)}</span></span>
      <span className="cn6-dai-gia">{vietTien(d.gia)}</span>
    </button>
  );

  return khung(
    <>
      {dangTai && <DongDangCapNhat />}
      {chuaCoGia && <p className="cn6-goi-y">💡 {CAU_CHUA_CO_GIA}</p>}
      <section className="cn6-the" aria-label="Giá theo tháng">
        <div className="cn6-the-dau">
          <h2 className="cn6-nhan">Giá theo tháng</h2>
          <button type="button" className="cn6-chon-nam" onClick={() => datMoNam(true)} aria-haspopup="dialog">
            Năm {nam}<span className="cn6-xuong"><Icon>{ICON_TOI}</Icon></span>
          </button>
        </div>
        <div className="cn6-thang">
          {bang.thang.map((g, i) => {
            const t = i + 1;
            const daChon = chon.includes(t);
            return (
              <button key={t} type="button" aria-pressed={daChon}
                      className={'cn6-o-thang' + (daChon ? ' cn6-o-thang--chon' : g ? '' : ' cn6-o-thang--chua')}
                      onClick={() => doiChon(t)}>
                <span className="cn6-o-thang-ten">Tháng {t}</span>{' '}
                <span className="cn6-o-thang-gia">{chuOThang(nam, t, g, bang.dip, bang.demCuoiTuan)}</span>
              </button>
            );
          })}
        </div>
        <p className={chon.length ? 'cn6-dang-chon' : 'cn6-dang-chon cn6-dang-chon--chua'}>{dongDangChon(chon)}</p>
        <div className="cn6-hai-o">
          <label className="hh-field">
            <span className="hh-field__label">{ten.thuong}</span>
            <input className={'hh-input' + (loiO ? ' hh-input--loi' : '')} type="text" inputMode="numeric" placeholder="VD: 800.000"
                   value={thuong} onChange={(e) => { datLoiO(null); datThuong(dinhDangOGia(e.target.value)); }} aria-invalid={loiO ? true : undefined} />
          </label>
          <label className="hh-field">
            <span className="hh-field__label">{ten.cuoiTuan}</span>
            <input className={'hh-input' + (loiO ? ' hh-input--loi' : '')} type="text" inputMode="numeric" placeholder="VD: 1.100.000"
                   value={cuoiTuan} onChange={(e) => { datLoiO(null); datCuoiTuan(dinhDangOGia(e.target.value)); }} aria-invalid={loiO ? true : undefined} />
          </label>
        </div>
        {loiO && <p className="hh-field__loi" role="alert">{loiO}</p>}
        <NutGhi chu={chon.length ? `Áp dụng cho ${chuChon}` : 'Áp dụng cho tháng đã chọn'} onGhi={apDung}
                disabled={chon.length === 0 || !props.dv} />
      </section>

      <div className="cn6-dat-dip">
        <button type="button" className="hh-btn hh-btn--text" onClick={() => datMoDip(homNay)}><Icon>{ICON_LICH_SAO}</Icon>Đặt giá ngày lễ, dịp đặc biệt</button>
      </div>
      <section className="cn6-the cn6-ds" aria-label="Giá ngày lễ">
        <h2 className="cn6-nhan">Giá ngày lễ</h2>
        {ngayLe.length ? ngayLe.map(dongDai)
          : <p className="cn6-trong">Chưa có giá ngày lễ. Bấm "Đặt giá ngày lễ, dịp đặc biệt" để thêm, VD: Lễ 30/4 – 1/5.</p>}
      </section>
      <section className="cn6-the cn6-ds" aria-label="Dịp đặc biệt">
        <h2 className="cn6-nhan">Dịp đặc biệt</h2>
        {dipDB.length ? dipDB.map(dongDai) : <p className="cn6-trong">Chưa có dịp đặc biệt.</p>}
      </section>

      {!chuaCoGia && (
        <>
          <LichGia nam={lichThang[0]} thang={lichThang[1]} dem={lich.lich} loi={lich.loi} homNay={homNay} demCuoiTuan={bang.demCuoiTuan} onThuLai={() => void lich.tai()}
                   onDoiThang={(b) => datLichThang(congThang(lichThang[0], lichThang[1], b))} onChamNgay={(n) => datMoDip(n)} />
          <div className="cn6-sao-chep">
            <button type="button" className="hh-btn hh-btn--text" onClick={seCo}><Icon>{ICON_SAO_CHEP}</Icon>Sao chép giá sang căn khác</button>
          </div>
        </>
      )}
      {moNam && <ChonNam namNay={namNay} dangChon={nam} onChon={doiNam} onDong={() => datMoNam(false)} />}
    </>,
  );
}
