// S2 · Kết quả tìm phòng, danh sách (YC7.3 bước 1 đến 4, 6, US45). PQ4.SALE, PQ11.SALE, QT5.4, QT6.4, HV1, HV2, HV3, HV8.
// Dòng điều kiện kèm "Sửa", "N căn trống", chế độ "Danh sách" / "Lịch tuần", sắp xếp (S1-04). Nhóm "Của tôi", "Nguồn phòng",
// "Tự nhập · chưa biết lịch". Thẻ: tên, chủ nhà, view, giá chủ · bạn bán, độ tươi; dấu tích chọn căn; thanh đáy "Đã chọn N căn"
// và "Gửi cho khách" (YC8 ở US48, báo tạm). Chạm căn: của tôi mở S6-07, tự nhập mở S6-03 (bản tạm), căn chủ nhà mở S3 (US46,
// chưa làm gì). ManKetQua giữ điều kiện, tập căn, căn đã chọn khi đổi chế độ (YC7.3-NT4) và đọc lịch tuần cho S4.
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { DaiMatKetNoi } from '../chung/matKetNoi';
import { useQuayLaiTuNen } from '../chung/nhap';
import { useToast } from '../chung/Toast';
import type { DichVuTimPhong } from '../lib/dichVuTimPhong';
import {
  CAU_CUA_TOI_DAU, CAU_GUI_KHACH_SE_CO, CHU_CHE_DO, CHU_GUI_KHACH, chiaNhomKetQua, chuDaChon, chuSoCanTrong, khoangTuan,
  manKhiCham, ngayDauTuan, theCan, thongTinXep, type CheDoKetQua, type NhomKetQua,
} from '../lib/ketQuaTim';
import { CACH_XEP, tenHang, type CachXep, type DongLichSale } from '../lib/lichSale';
import { congNgay, type Ngay } from '../lib/ngay';
import { tieuDeKetQua, type CanTim, type DieuKienTim, type KetQuaTim } from '../lib/timPhong';
import { ICON_QUAY_LAI } from './CN704ChiTietSale';
import { S4LichTuanKetQua } from './S4LichTuanKetQua';
import { S6Tam } from './S6Tam';
import { Icon } from './TabChu';
import './S1LichSale.css';
import './S2KetQua.css';

const ICON_SAU = <path d="m9 18 6-6-6-6" />;
const ICON_DONG = <><path d="M18 6 6 18" /><path d="m6 6 12 12" /></>;

/** Dấu tích chọn căn (YC7.3 bước 4), vùng bấm 44 px. */
export function DauTich(props: { chon: boolean; ten: string; onBam: () => void }) {
  return (
    <button type="button" role="checkbox" aria-checked={props.chon} aria-label={`Chọn ${props.ten}`}
            className={'kq-tich' + (props.chon ? ' kq-tich--on' : '')} onClick={props.onBam}>
      <span className="kq-tich-hop" aria-hidden="true">{props.chon ? '✓' : ''}</span>
    </button>
  );
}

/** Đầu màn chung S2, S4: Quay lại, dòng điều kiện kèm "Sửa", số căn trống, hai chế độ. */
export function DauKetQua(props: {
  dieuKienChu: string; kq: KetQuaTim; cheDo: CheDoKetQua; onQuayLai: () => void; onSua: () => void;
  onCheDo: (c: CheDoKetQua) => void; phuTren?: ReactNode;
}) {
  return (
    <>
      <DaiMatKetNoi />
      <header className="chu-dau kq-dau">
        <h1 className="kq-an">Kết quả tìm phòng</h1>
        <button type="button" className="hh-iconbtn man-quay-lai" aria-label="Quay lại" onClick={props.onQuayLai}>
          <Icon co={22}>{ICON_QUAY_LAI}</Icon>
        </button>
        <div className="kq-dieu-kien">
          <span className="kq-dieu-kien-chu" data-testid="dieu-kien">{props.dieuKienChu}</span>
          <button type="button" className="hh-btn hh-btn--text hh-btn--inline" aria-label="Sửa tìm kiếm" onClick={props.onSua}>Sửa</button>
        </div>
      </header>
      <div className="kq-thanh">
        {props.phuTren}
        <div className="kq-thanh-hang">
          <span className="kq-so">{chuSoCanTrong(props.kq)}</span>
          <div className="kq-che-do" role="group" aria-label="Chế độ xem">
            {CHU_CHE_DO.map((c) => (
              <button key={c.ma} type="button" className={'kq-chip' + (c.ma === props.cheDo ? ' kq-chip--on' : '')}
                      aria-pressed={c.ma === props.cheDo} onClick={() => props.onCheDo(c.ma)}>{c.chu}</button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

/** Thanh đáy chung S2, S4 (YC7.3 bước 4, YC7.3-NT3). */
export function ChanKetQua(props: { soChon: number; onGui: () => void }) {
  return (
    <div className="kq-chan">
      <span className="kq-chan-chu">{chuDaChon(props.soChon)}</span>
      <button type="button" className="hh-btn hh-btn--primary hh-btn--block" disabled={props.soChon === 0} onClick={props.onGui}>
        {CHU_GUI_KHACH}
      </button>
    </div>
  );
}

/** S1-04 dùng lại ở S2: tấm chọn cách sắp xếp. */
function TamSapXep(props: { dangChon: CachXep; onChon: (c: CachXep) => void; onDong: () => void }) {
  return (
    <>
      <div className="s1-man-toi" onClick={props.onDong} />
      <div className="s1-tam" role="dialog" aria-modal="true" aria-labelledby="kq-tam-tieu-de">
        <div className="s1-tam-dau">
          <h2 id="kq-tam-tieu-de" className="s1-tam-tieu-de">Sắp xếp</h2>
          <button type="button" className="hh-iconbtn" aria-label="Đóng" title="Đóng" onClick={props.onDong}><Icon co={20}>{ICON_DONG}</Icon></button>
        </div>
        <div className="s1-tam-than">
          {CACH_XEP.map((c) => (
            <button key={c.ma} type="button" className={'s1-tam-dong' + (c.ma === props.dangChon ? ' s1-tam-dong--on' : '')}
                    aria-pressed={c.ma === props.dangChon} onClick={() => props.onChon(c.ma)}>
              <span className="s1-tam-chu">{c.chu}</span>
              <span className="s1-tam-dau-tich" aria-hidden="true">{c.ma === props.dangChon ? '✓' : ''}</span>
            </button>
          ))}
          <p className="s1-tam-ghi">Căn của tôi luôn hiện đầu danh sách.</p>
        </div>
      </div>
    </>
  );
}

function The(props: { c: CanTim; dk: DieuKienTim; chon: boolean; onChon: () => void; onCham: () => void }) {
  const t = theCan(props.c, props.dk);
  return (
    <div className={'kq-the' + (props.chon ? ' kq-the--chon' : '')} data-can={t.canId} data-nhom={t.nhom}>
      <button type="button" className="kq-the-mo" onClick={props.onCham} aria-label={t.ten}>
        <span className="kq-anh" aria-hidden="true" />
        <span className="kq-the-chu">
          <span className="kq-the-ten">{t.ten}</span>
          {t.phu && <span className="kq-the-phu">{t.phu}</span>}
          {t.gia && (
            <span className="kq-the-gia" data-testid="gia">
              {t.gia.chinh}{t.gia.phu && <span className="kq-the-ban"> · {t.gia.phu}</span>}
            </span>
          )}
          {t.doTuoi && <span className={'kq-the-tuoi' + (t.nhom === 'tu_nhap' ? ' kq-the-tuoi--tu-nhap' : '')}>{t.doTuoi}</span>}
        </span>
      </button>
      <DauTich chon={props.chon} ten={t.ten} onBam={props.onChon} />
    </div>
  );
}

export function S2KetQua(props: {
  dieuKien: DieuKienTim;
  kq: KetQuaTim;
  nhom: readonly NhomKetQua[];
  cach: CachXep;
  daChon: ReadonlySet<string>;
  onCach: (c: CachXep) => void;
  onChon: (canId: string) => void;
  onCham: (c: CanTim) => void;
  onCheDo: (c: CheDoKetQua) => void;
  onSua: () => void;
  onQuayLai: () => void;
  onGui: () => void;
}) {
  const [moXep, datMoXep] = useState(false);
  const chuCach = CACH_XEP.find((c) => c.ma === props.cach)!.chu;
  return (
    <div className="man man-chu kq" data-man="S2">
      <DauKetQua dieuKienChu={tieuDeKetQua(props.dieuKien)} kq={props.kq} cheDo="danh-sach" onQuayLai={props.onQuayLai}
                 onSua={props.onSua} onCheDo={props.onCheDo}
                 phuTren={(
                   <div className="kq-thanh-hang">
                     <span className="kq-ghi">{CAU_CUA_TOI_DAU}</span>
                     <button type="button" className="s1-nut-xep" aria-haspopup="dialog" onClick={() => datMoXep(true)}>
                       <span>{chuCach}</span>
                       <span className="s1-mui" aria-hidden="true"><Icon co={16}>{ICON_SAU}</Icon></span>
                     </button>
                   </div>
                 )} />
      <div className="kq-than">
        {props.nhom.map((g) => (
          <section key={g.ma} className="kq-nhom" aria-label={g.tieuDe}>
            <h2 className="kq-nhom-ten">{g.tieuDe}</h2>
            {g.can.map((c) => (
              <The key={c.canId} c={c} dk={props.dieuKien} chon={props.daChon.has(c.canId)}
                   onChon={() => props.onChon(c.canId)} onCham={() => props.onCham(c)} />
            ))}
          </section>
        ))}
      </div>
      <ChanKetQua soChon={props.daChon.size} onGui={props.onGui} />
      {moXep && <TamSapXep dangChon={props.cach} onChon={(c) => { props.onCach(c); datMoXep(false); }} onDong={() => datMoXep(false)} />}
    </div>
  );
}

/**
 * YC7.3 bước 1 đến 6, YC7.3-NT3, NT4, NT6, HV1, HV2, HV3: một kết quả tìm, hai chế độ dùng chung điều kiện, tập căn, căn đã
 * chọn và cách sắp xếp. Lịch tuần (fn_sale_lich) đọc bảy ngày từ ngày nhận (YC7-H4), ‹ › lùi tiến 7 ngày; quay lại từ nền
 * thì đọc lại lịch (HV3). Chạm căn mở S6-07, S6-03 bản tạm; căn của chủ nhà (S3, US46) chưa làm gì.
 */
export function ManKetQua(props: {
  dv: DichVuTimPhong; dieuKien: DieuKienTim; kq: KetQuaTim; homNay: Ngay; onSua: () => void; onQuayLai: () => void;
}) {
  const { dv, dieuKien, kq } = props;
  const hienToast = useToast();
  const [cheDo, datCheDo] = useState<CheDoKetQua>('danh-sach');
  const [cach, datCach] = useState<CachXep>('ten');
  const [daChon, datDaChon] = useState<ReadonlySet<string>>(() => new Set());
  const [mo, datMo] = useState<{ man: 'S6-07' | 'S6-03'; ten: string } | null>(null);
  const [tu, datTu] = useState<Ngay>(() => ngayDauTuan(dieuKien) ?? props.homNay);
  const [dong, datDong] = useState<DongLichSale[] | undefined>(undefined);
  const [dongDem, datDongDem] = useState<Ngay | null>(null);
  const [dangTai, datDangTai] = useState(false);
  const [loi, datLoi] = useState(false);

  const docLich = useCallback(async (batDau: Ngay) => {
    if (!dv.docLich) { datDong([]); return; }
    datDangTai(true);
    datLoi(false);
    try {
      const k = khoangTuan(batDau);
      const ds = await dv.docLich(k.tu, k.den);
      datDong(ds);
      datDongDem(batDau);
    } catch {
      datLoi(true);
    } finally {
      datDangTai(false);
    }
  }, [dv]);
  useEffect(() => { void docLich(tu); }, [docLich, tu]);
  useQuayLaiTuNen(() => { void docLich(tu); });

  // Sắp xếp "Giá tăng dần" theo giá đêm đầu (đêm nhận), "Bán nhiều nhất" theo số bán: lấy từ lịch tuần khi tuần có đêm nhận.
  const tt = useMemo(() => thongTinXep(dongDem === dieuKien.nhan ? dong ?? [] : [], dieuKien.nhan),
    [dong, dongDem, dieuKien.nhan]);
  const nhom = useMemo(() => chiaNhomKetQua(kq, cach, tt), [kq, cach, tt]);
  const chon = (id: string) => datDaChon((s) => {
    const m = new Set(s);
    if (m.has(id)) m.delete(id); else m.add(id);
    return m;
  });
  const cham = (c: CanTim) => {
    const man = manKhiCham(c);
    if (man === 'S3') return; // US46
    datMo({ man, ten: tenHang(c) });
  };
  const gui = () => hienToast(CAU_GUI_KHACH_SE_CO);

  if (mo) return <S6Tam man={mo.man} tenCan={mo.ten} onQuayLai={() => datMo(null)} />;
  if (cheDo === 'lich-tuan') {
    return (
      <S4LichTuanKetQua dieuKien={dieuKien} kq={kq} nhom={nhom} tu={tu} homNay={props.homNay} dong={dong ?? []}
                        dangTai={dangTai || dong === undefined} loi={loi} daChon={daChon}
                        onDoiNgay={(n) => datTu((x) => congNgay(x, n))} onThuLai={() => void docLich(tu)}
                        onChon={chon} onCham={cham} onCheDo={datCheDo} onSua={props.onSua} onQuayLai={props.onQuayLai} onGui={gui} />
    );
  }
  return (
    <S2KetQua dieuKien={dieuKien} kq={kq} nhom={nhom} cach={cach} daChon={daChon} onCach={datCach} onChon={chon}
              onCham={cham} onCheDo={datCheDo} onSua={props.onSua} onQuayLai={props.onQuayLai} onGui={gui} />
  );
}
