// S3 · Chi tiết căn của chủ nhà cho sale (YC7.4 bước 1 đến 8, US46). PQ2.SALE, PQ5.SALE, PQ11.SALE, QD7, QT2.1, QT5.4, GD13.
// Bộ ảnh "1/N", tên căn, dòng phòng ngủ · giường · view · khu vực (không số khách, không tiện ích: YC7.4-NT4), độ tươi lịch,
// chủ nhà và nút "Gọi" (tel:, chỉ khi có số), giá chủ, chip mức cộng ("Mặc định" đầu hàng, YC7-H7) và giá bán đổi ngay,
// "Lịch 2 tuần tới" tô ngày khách hỏi (YC7-H6), giờ nhận trả, "Gửi yêu cầu đặt phòng" mở S3-02 (YC9.1, US50),
// "Gửi cho khách" mở S5 (YC8.1, US48). HV1 khung xám, HV2 Thử lại, HV3 đọc lại khi quay lại, HV5 không còn quyền, HV8 toast.
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { KhungXam, DongDangCapNhat } from '../chung/dangTai';
import { cauBaoLoi, DaiMatKetNoi, LoiNguoiDung, ManChuaTai } from '../chung/matKetNoi';
import { useQuayLaiTuNen } from '../chung/nhap';
import { KhongConQuyen } from '../chung/quyen';
import { useToast } from '../chung/Toast';
import {
  CAU_CHI_BAN_THAY, chonHienTai, chuChuNha, chuGio, chuKhoang, dongThongTinCan, duongDanGoi, giaBanTheoChon, hangChip,
  oHaiTuan, THU_LUOI, tieuDeCan, type ChiTietCanSale, type ChonMuc, type KetQuaChiTiet,
} from '../lib/chiTietCanSale';
import type { DichVuChiTietCanSale } from '../lib/dichVuChiTietCanSale';
import type { DichVuYeuCau } from '../lib/dichVuYeuCau';
import { CAU_GUI_KHACH_SE_CO, chuDoTuoi } from '../lib/ketQuaTim';
import type { Ngay } from '../lib/ngay';
import { docSoTienGo, vietSo, vietTien } from '../lib/tien';
import { ICON_QUAY_LAI } from './CN704ChiTietSale';
import { NutGuiKhach } from './S5GuiKhach';
import { S3GuiYeuCau } from './S3GuiYeuCau';
import { Icon } from './TabChu';
import './S3ChiTietCan.css';

const ICON_GOI = <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />;

/** HV5 "Về Lịch": khung tab của sale (ManSale) cho cách về S1 từ bất cứ đâu S3 được mở. */
export const VeLichSale = createContext<(() => void) | undefined>(undefined);

/** Căn và khoảng ngày mở S3. khachHoi: tô "Ngày khách hỏi" (mở từ kết quả tìm); mở từ lịch 7 ngày thì không (YC7-H6). */
export type MoS3 = { canId: string; tenTam: string; tu: Ngay; den: Ngay; khachHoi: boolean };

/** YC7.4 bước 1: bộ ảnh cuộn ngang, nhãn "1/6". */
function BoAnh(props: { anh: string[] }) {
  const [dang, datDang] = useState(0);
  const n = props.anh.length;
  return (
    <div className="s3-anh">
      {n > 0 && (
        <div className="s3-anh-cuon" onScroll={(e) => {
          const el = e.currentTarget;
          if (el.clientWidth > 0) datDang(Math.min(n - 1, Math.max(0, Math.round(el.scrollLeft / el.clientWidth))));
        }}>
          {props.anh.map((u, i) => <img key={u} src={u} alt={`Ảnh ${i + 1}`} className="s3-anh-mot" loading={i ? 'lazy' : 'eager'} />)}
        </div>
      )}
      {n > 0 && <span className="s3-anh-so" data-testid="so-anh">{`${dang + 1}/${n}`}</span>}
    </div>
  );
}

/** YC7.4 bước 4: hàng chip và ô "Tùy chọn". */
function MucCong(props: { ct: ChiTietCanSale; chon: ChonMuc; dangGhi: boolean; onChon: (c: ChonMuc) => void }) {
  const [moTuy, datMoTuy] = useState(false);
  const [chuTuy, datChuTuy] = useState('');
  const chips = hangChip({
    mucCongMacDinh: props.ct.mucCongMacDinh,
    mucCongRieng: props.chon.loai === 'mac-dinh' ? null : props.chon.muc,
  });
  const tuy = docSoTienGo(chuTuy);
  return (
    <>
      <span className="s3-nhan">Cộng thêm cho bạn</span>
      <div className="s3-chips" role="group" aria-label="Cộng thêm cho bạn">
        {chips.map((c) => (
          <button key={c.khoa} type="button" aria-pressed={c.dangChon} disabled={props.dangGhi}
                  className={'s3-chip' + (c.dangChon ? ' s3-chip--on' : '')}
                  onClick={() => {
                    if (c.chon === 'tuy-chon') { datMoTuy(true); return; }
                    datMoTuy(false);
                    props.onChon(c.chon);
                  }}>
            {c.dangChon && <span aria-hidden="true">✓</span>}{c.chu}
          </button>
        ))}
      </div>
      {moTuy && (
        <div className="s3-tuy">
          <label className="s3-tuy-o">
            <span className="s3-an">Mức cộng mỗi đêm</span>
            <input inputMode="numeric" placeholder="Mỗi đêm, ví dụ 250.000" value={chuTuy}
                   onChange={(e) => { const v = docSoTienGo(e.target.value); if (v !== undefined) datChuTuy(v == null ? '' : vietSo(v)); }} />
          </label>
          <button type="button" className="hh-btn hh-btn--secondary s3-tuy-nut" disabled={tuy == null || props.dangGhi}
                  onClick={() => { if (tuy != null) { props.onChon({ loai: 'rieng', muc: tuy }); datMoTuy(false); datChuTuy(''); } }}>
            Áp dụng
          </button>
        </div>
      )}
    </>
  );
}

/** YC7.4 bước 5: "Lịch 2 tuần tới". */
function LichHaiTuan(props: { ct: ChiTietCanSale; homNay: Ngay; khachHoi: boolean }) {
  const o = oHaiTuan(props.ct.lich, props.homNay, props.khachHoi ? { tu: props.ct.tu, den: props.ct.den } : null);
  return (
    <section className="s3-the" aria-label="Lịch 2 tuần tới">
      <h2 className="s3-tieu-de-muc">Lịch 2 tuần tới</h2>
      <div className="s3-luoi" role="grid">
        {THU_LUOI.map((t) => <div key={t} className="s3-luoi-thu" role="columnheader">{t}</div>)}
        {o.map((x) => (
          <div key={x.ngay} role="gridcell" data-ngay={x.ngay} data-khach-hoi={x.khachHoi || undefined}
               className={`s3-o s3-o--${x.loai}` + (x.khachHoi ? ' s3-o--hoi' : '')}>
            <span className="s3-o-so">{x.so}</span><span className="s3-o-chu">{x.chu}</span>
          </div>
        ))}
      </div>
      <div className="s3-chu-thich">
        <span><i className="s3-mau s3-mau--kin" />Kín</span>
        {props.khachHoi && <span><i className="s3-mau s3-mau--hoi" />Ngày khách hỏi</span>}
      </div>
    </section>
  );
}

function ThanS3(props: {
  ct: ChiTietCanSale; homNay: Ngay; khachHoi: boolean; dangTai: boolean; dv: DichVuChiTietCanSale;
  onDocLai: () => void; onYeuCau: () => void; onQuayLai: () => void;
}) {
  const { ct } = props;
  const hienToast = useToast();
  const [chon, datChon] = useState<ChonMuc>(() => chonHienTai(ct));
  const [dangGhi, datDangGhi] = useState(false);
  // Database đọc lại thì theo database (mức đã lưu).
  useEffect(() => { datChon(chonHienTai(ct)); }, [ct]);

  const giaBan = giaBanTheoChon(ct, chon);
  const goi = duongDanGoi(ct.chu.soDienThoai);
  const doTuoi = chuDoTuoi(ct.lichDoiLuc);

  const chonMuc = async (c: ChonMuc) => {
    const cu = chon;
    datChon(c); // YC7.4 bước 4: giá bán đổi ngay
    datDangGhi(true);
    try {
      await props.dv.datMuc(ct.canId, c);
      props.onDocLai();
    } catch (e) {
      datChon(cu);
      hienToast(cauBaoLoi(e), 'loi');
      if (e instanceof LoiNguoiDung) props.onDocLai(); // HV5 bước 2: bị thu hồi quyền thì lần đọc lại đổi sang màn HV5
    } finally {
      datDangGhi(false);
    }
  };

  return (
    <div className="man man-chu s3" data-man="S3">
      <DaiMatKetNoi />
      <div className="s3-cuon">
        <div className="s3-dau-anh">
          <BoAnh anh={ct.anh} />
          <button type="button" className="hh-iconbtn s3-quay-lai" aria-label="Quay lại" onClick={props.onQuayLai}>
            <Icon co={20}>{ICON_QUAY_LAI}</Icon>
          </button>
        </div>
        {props.dangTai && <DongDangCapNhat />}
        <div className="s3-than">
          <section className="s3-the">
            <h1 className="s3-ten">{tieuDeCan(ct)}</h1>
            <span className="s3-thong-tin" data-testid="thong-tin">{dongThongTinCan(ct)}</span>
            {doTuoi && <span className="s3-tuoi">{doTuoi}</span>}
            <div className="s3-chu">
              <span className="s3-chu-chu" aria-hidden="true">{ct.chu.ten.replace(/^(Chị|Anh|Cô|Chú|Bác|Ông|Bà)\s+/i, '').slice(0, 1).toUpperCase()}</span>
              <div className="s3-chu-ten">
                <span className="s3-chu-ten-chinh">{ct.chu.ten}</span>
                <span className="s3-chu-ten-phu">{chuChuNha(ct.chu.soCan)}</span>
              </div>
              {goi && <a className="hh-btn hh-btn--secondary s3-goi" href={goi}><Icon co={16}>{ICON_GOI}</Icon>Gọi</a>}
            </div>
          </section>

          <section className="s3-the" aria-label="Giá">
            <div className="s3-hang">
              <span className="s3-khoang" data-testid="khoang">{chuKhoang(ct.tu, ct.den)}</span>
              <span className="s3-gia-chu" data-testid="gia-chu">
                {ct.tongGiaChu == null ? 'Chưa có giá' : `Giá chủ nhà ${vietTien(ct.tongGiaChu)}`}
              </span>
            </div>
            <MucCong ct={ct} chon={chon} dangGhi={dangGhi} onChon={(c) => void chonMuc(c)} />
            <div className="s3-hang">
              <span className="s3-gia-ban-nhan">Giá bán cho khách</span>
              <span className="s3-gia-ban" data-testid="gia-ban">{giaBan == null ? '–' : vietTien(giaBan)}</span>
            </div>
            <span className="s3-ghi">{CAU_CHI_BAN_THAY}</span>
          </section>

          <LichHaiTuan ct={ct} homNay={props.homNay} khachHoi={props.khachHoi} />

          <section className="s3-the">
            <span className="s3-gio">{chuGio(ct.gioNhan, ct.gioTra)}</span>
          </section>
        </div>
      </div>
      <div className="s3-chan">
        <button type="button" className="hh-btn hh-btn--secondary hh-btn--block" onClick={props.onYeuCau}>Gửi yêu cầu đặt phòng</button>
        <NutGuiKhach canIds={[ct.canId]} tu={ct.tu} den={ct.den} cauTam={CAU_GUI_KHACH_SE_CO} />
      </div>
    </div>
  );
}

export function S3ChiTietCan(props: MoS3 & {
  /** yeuCau: YC9.1 gửi yêu cầu (S3-02); thiếu thì nút gửi ở S3-02 báo câu tạm. */
  dv: DichVuChiTietCanSale & { yeuCau?: DichVuYeuCau }; homNay: Ngay; onQuayLai: () => void; onVeLich?: () => void;
  /** YC9.1 bước 3a "Tìm căn khác cùng ngày"; thiếu thì về màn đã mở S3. */
  onTimCanKhac?: (tu: Ngay, den: Ngay) => void;
}) {
  const veLich = useContext(VeLichSale);
  const [kq, datKq] = useState<KetQuaChiTiet | undefined>(undefined);
  const [dangTai, datDangTai] = useState(false);
  const [loi, datLoi] = useState(false);
  const [moYeuCau, datMoYeuCau] = useState(false);
  const lan = useRef(0);
  const { dv, canId, tu, den } = props;

  const doc = useCallback(async () => {
    const so = ++lan.current;
    datDangTai(true);
    datLoi(false);
    try {
      const r = await dv.doc(canId, tu, den);
      if (so === lan.current) datKq(r);
    } catch {
      if (so === lan.current) datLoi(true);
    } finally {
      if (so === lan.current) datDangTai(false);
    }
  }, [dv, canId, tu, den]);
  useEffect(() => { void doc(); }, [doc]);
  useQuayLaiTuNen(() => { void doc(); }); // HV3

  if (kq && !kq.khongConQuyen && moYeuCau) {
    return (
      <S3GuiYeuCau ct={kq} dv={dv.yeuCau} dvCt={dv} onQuayLai={() => { datMoYeuCau(false); void doc(); }}
                   onVeLich={props.onVeLich ?? veLich ?? props.onQuayLai}
                   onTimCanKhac={props.onTimCanKhac ?? (() => props.onQuayLai())} />
    );
  }
  if (kq && !kq.khongConQuyen) {
    return <ThanS3 ct={kq} homNay={props.homNay} khachHoi={props.khachHoi} dangTai={dangTai} dv={dv}
                   onDocLai={() => void doc()} onYeuCau={() => datMoYeuCau(true)} onQuayLai={props.onQuayLai} />;
  }
  return (
    <div className="man man-chu s3" data-man="S3">
      <DaiMatKetNoi />
      <header className="chu-dau">
        <button type="button" className="hh-iconbtn man-quay-lai" aria-label="Quay lại" onClick={props.onQuayLai}>
          <Icon co={22}>{ICON_QUAY_LAI}</Icon>
        </button>
        <h1 className="chu-tieu-de">{kq ? 'Chi tiết căn' : props.tenTam}</h1>
      </header>
      <div className="chu-than">
        {kq?.khongConQuyen
          ? <KhongConQuyen lyDo={kq.lyDo ?? undefined} onVe={props.onVeLich ?? veLich ?? props.onQuayLai} />
          : loi ? <ManChuaTai onThuLai={() => void doc()} /> : <KhungXam />}
      </div>
    </div>
  );
}
