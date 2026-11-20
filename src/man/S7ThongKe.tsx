// US59 · S7 Thống kê của sale, S7-00 tháng chưa chốt đặt phòng nào (YC11.2, canvas home247-canvas.html).
// Bản 1 sale chỉ xem tháng của hôm nay (giờ Việt Nam, YC11-H8): nhãn "Tháng 10/2026" không bấm được.
// HV1: lần đầu khung xám; số đã xem giữ trong phiên, hiện ngay kèm "Đang cập nhật…". HV2: chưa tải được thì Thử lại;
// có số cũ thì giữ số cũ. HV3: quay lại từ nền thì đọc lại.
// YC11.2 bước 6: chạm dòng chờ chủ (S3-03) và "Xem tất cả đặt phòng và yêu cầu" (S7-03) làm ở US60; ở đây gọi onChoChu,
// onXemTatCa (ManSale báo tạm).
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { ManChuaTai } from '../chung/matKetNoi';
import { DongDangCapNhat, KhungXam } from '../chung/dangTai';
import { useQuayLaiTuNen } from '../chung/nhap';
import { homNay as layHomNay, type Ngay } from '../lib/ngay';
import { tenThangThongKe } from '../lib/thongKeChu';
import type { DichVuThongKeSale } from '../lib/dichVuThongKeSale';
import {
  CAU_THANG_TRONG, CAU_THANG_TRONG_PHU, CHU_CHO_CHU, CHU_GHI_CHU_CHENH, CHU_THEO_CHU, CHU_TIM_PHONG, CHU_XEM_TAT_CA,
  dongChinhChoChu, dongDatPhongThangTruoc, dongDoanhSoThangTruoc, dongPhuChoChu, dongSoSanhChenh, dongTienTheoChu,
  laThangTrong, thanhTheoChu, tieuDeTienChenh, type ThongKeSale, type YeuCauChoChu,
} from '../lib/thongKeSale';
import { vietTien } from '../lib/tien';
import { Icon, KhungTabChu } from './TabChu';
import './CN8ThongKe.css';
import './S7ThongKe.css';

const ICON_SAU = <path d="m9 18 6-6-6-6" />;

/** YC11.2 bước 5, 6: thẻ chờ chủ nhà chấp nhận. */
function TheChoChu(props: { tk: ThongKeSale; homNay: Ngay; onCham?: (y: YeuCauChoChu) => void; onXemTatCa?: () => void }) {
  return (
    <section className="s7-the s7-the--cho" aria-label={CHU_CHO_CHU}>
      <div className="s7-cho-dau">
        <h2 className="cn8-muc">{CHU_CHO_CHU}</h2>
        <span className="s7-cho-so">{props.tk.soChoChu}</span>
      </div>
      {props.tk.choChu.map((y) => (
        <button key={y.yeuCauId} type="button" className="s7-dong" onClick={() => props.onCham?.(y)}>
          <span className="s7-dong-giua">
            <span className="s7-dong-chinh">{dongChinhChoChu(y)}</span>
            <span className="s7-dong-phu">{dongPhuChoChu(y, props.homNay)}</span>
          </span>
          <Icon co={16}>{ICON_SAU}</Icon>
        </button>
      ))}
      {/* YC11-H5: dòng cuối thẻ hiện cả khi không có yêu cầu chờ. */}
      <button type="button" className="s7-dong s7-dong--cuoi" onClick={props.onXemTatCa}>
        <span className="s7-dong-giua"><span className="s7-dong-chinh">{CHU_XEM_TAT_CA}</span></span>
        <Icon co={16}>{ICON_SAU}</Icon>
      </button>
    </section>
  );
}

/** YC11.2: nội dung tháng đã tải (S7, S7-00). */
export function NoiDungThongKeSale(props: {
  tk: ThongKeSale; thang: number; homNay: Ngay;
  onTimPhong?: () => void; onChoChu?: (y: YeuCauChoChu) => void; onXemTatCa?: () => void;
}) {
  const { tk, thang } = props;
  if (laThangTrong(tk)) {
    // YC11.2 bước 7, S7-00. Vẫn có thẻ chờ chủ với dòng "Xem tất cả đặt phòng và yêu cầu" (YC11-H5: dòng đó hiện cả khi không
    // có yêu cầu chờ; US60 để sale chưa có gì mở được S7-03-00). Claude tự chọn; canvas S7-00 không có thẻ này.
    return (
      <>
        <section className="hh-stat hh-stat--md hh-stat--action s7-o" aria-label={tieuDeTienChenh(thang)}>
          <div className="hh-stat__label">{tieuDeTienChenh(thang)}</div>
          <div className="hh-stat__value">{vietTien(0)}</div>
        </section>
        <section className="s7-the s7-trong" aria-label={CAU_THANG_TRONG}>
          <span className="s7-trong-chinh">{CAU_THANG_TRONG}</span>
          <span className="s7-trong-phu">{CAU_THANG_TRONG_PHU}</span>
          <button type="button" className="hh-btn hh-btn--primary hh-btn--block" onClick={props.onTimPhong}>{CHU_TIM_PHONG}</button>
        </section>
        <TheChoChu tk={tk} homNay={props.homNay} onCham={props.onChoChu} onXemTatCa={props.onXemTatCa} />
      </>
    );
  }
  const soSanh = dongSoSanhChenh(tk, thang);
  return (
    <>
      <div className="cn8-luoi">
        {/* YC11.2 bước 2 */}
        <section className="hh-stat hh-stat--lg hh-stat--action cn8-toan" aria-label={tieuDeTienChenh(thang)}>
          <div className="hh-stat__label">{tieuDeTienChenh(thang)}</div>
          <div className="hh-stat__value">{vietTien(tk.tienChenh)}</div>
          {soSanh && <div className="hh-stat__hint">{soSanh}</div>}
        </section>
        {/* YC11.2 bước 3 */}
        <section className="hh-stat hh-stat--sm hh-stat--neutral" aria-label="Đặt phòng">
          <div className="hh-stat__label">Đặt phòng</div>
          <div className="hh-stat__value">{tk.soDatPhong}</div>
          <div className="hh-stat__hint">{dongDatPhongThangTruoc(tk.soDatPhongThangTruoc, thang)}</div>
        </section>
        <section className="hh-stat hh-stat--sm hh-stat--neutral" aria-label="Doanh số">
          <div className="hh-stat__label">Doanh số</div>
          <div className="hh-stat__value">{vietTien(tk.doanhSo)}</div>
          <div className="hh-stat__hint">{dongDoanhSoThangTruoc(tk.doanhSoThangTruoc, thang)}</div>
        </section>
      </div>

      {/* YC11.2 bước 4 */}
      <section className="s7-the" aria-label={CHU_THEO_CHU}>
        <div className="s7-the-dau">
          <h2 className="cn8-muc">{CHU_THEO_CHU}</h2>
          <span className="s7-ghi-chu">{CHU_GHI_CHU_CHENH}</span>
        </div>
        <ul className="s7-ds-chu">
          {tk.theoChu.map((d) => {
            const th = thanhTheoChu(tk.theoChu, d);
            return (
              <li key={d.chuId ?? `tu-nhap-${d.ten}`} className="s7-chu">
                <div className="s7-chu-dong">
                  <span className="s7-chu-ten">{d.ten}</span>
                  <span className="s7-chu-tien">{dongTienTheoChu(d)}</span>
                </div>
                <span className="s7-ray" aria-hidden="true">
                  <span className="s7-ray-chu" style={{ width: `${th.giaChu}%` }} />
                  <span className="s7-ray-chenh" style={{ width: `${th.chenh}%` }} />
                </span>
              </li>
            );
          })}
        </ul>
        <div className="s7-chu-giai" aria-hidden="true">
          <span><span className="s7-cham s7-cham--chu" />Giá chủ nhà</span>
          <span><span className="s7-cham s7-cham--chenh" />Tiền chênh</span>
        </div>
      </section>

      <TheChoChu tk={tk} homNay={props.homNay} onCham={props.onChoChu} onXemTatCa={props.onXemTatCa} />
    </>
  );
}

/** YC11.2: tab Thống kê của sale. boNho giữ số đã xem trong phiên (HV1-NT2). */
export function S7ThongKe(props: {
  dv: DichVuThongKeSale | undefined; thanhTab?: ReactNode;
  /** Ngày hôm nay giờ Việt Nam; mặc định lấy từ máy. */
  homNay?: Ngay;
  boNho?: Map<string, ThongKeSale>;
  onTimPhong?: () => void; onChoChu?: (y: YeuCauChoChu) => void; onXemTatCa?: () => void;
}) {
  const nay = props.homNay ?? layHomNay();
  const nam = Number(nay.slice(0, 4));
  const thang = Number(nay.slice(5, 7));
  const boNhoRieng = useRef(new Map<string, ThongKeSale>());
  const boNho = props.boNho ?? boNhoRieng.current;
  const khoa = `${nam}-${thang}`;
  const [tk, datTk] = useState<ThongKeSale | undefined>(() => boNho.get(khoa));
  const [dangTai, datDangTai] = useState(false);
  const [loi, datLoi] = useState(false);
  const lan = useRef(0);

  const tai = useCallback(async () => {
    const dv = props.dv;
    const so = ++lan.current;
    datLoi(false);
    if (!dv) { datLoi(true); return; } // HV2: thiếu dịch vụ thì báo như mất mạng
    datDangTai(true);
    try {
      const kq = await dv.layThang(nam, thang);
      if (so !== lan.current) return;
      boNho.set(`${nam}-${thang}`, kq);
      datTk(kq);
    } catch {
      if (so === lan.current) datLoi(true);
    } finally {
      if (so === lan.current) datDangTai(false);
    }
  }, [props.dv, nam, thang, boNho]);

  useEffect(() => { datTk(boNho.get(khoa)); void tai(); }, [khoa, tai, boNho]);
  useQuayLaiTuNen(() => { void tai(); }); // HV3: đọc lại số liệu

  const dau = <span className="hh-chip hh-chip--neutral s7-nhan-thang">{tenThangThongKe(nam, thang)}</span>;

  return (
    <>
      <KhungTabChu tieuDe="Thống kê" phai={dau}>
        <div className="cn8-than">
          {tk && dangTai && <DongDangCapNhat />}
          {tk ? <NoiDungThongKeSale tk={tk} thang={thang} homNay={nay} onTimPhong={props.onTimPhong}
                                    onChoChu={props.onChoChu} onXemTatCa={props.onXemTatCa} />
            : loi ? <ManChuaTai onThuLai={() => void tai()} /> : <KhungXam soDong={4} />}
        </div>
      </KhungTabChu>
      {props.thanhTab}
    </>
  );
}
