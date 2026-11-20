// US58 · CN8 Thống kê tháng, CN8-00 tháng chưa có đặt phòng (YC11.1, canvas home247-canvas.html).
// Tháng mở đầu là tháng của hôm nay (giờ Việt Nam). ‹ › hay T09, T11 đổi tháng (bước 8); mọi số đọc lại theo tháng đó.
// HV1: lần đầu khung xám; tháng đã xem giữ trong phiên, hiện ngay kèm "Đang cập nhật…". HV2: chưa tải được thì Thử lại;
// có số cũ thì giữ số cũ. HV3: quay lại từ nền thì đọc lại tháng đang xem.
import { useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { ManChuaTai } from '../chung/matKetNoi';
import { DongDangCapNhat, KhungXam } from '../chung/dangTai';
import { useQuayLaiTuNen } from '../chung/nhap';
import { congThang, tenThangNgan } from '../lib/gia';
import { homNay } from '../lib/ngay';
import type { DichVuThongKeChu } from '../lib/dichVuThongKeChu';
import {
  CAU_CHUA_CO_DAT_PHONG_THANG, CAU_KHONG_CO_CHUA_THU, chuaThuGap, chuCongSuat, chuDemCoKhach, cotBieuDo, doDaiThanh,
  dongChinhChuaThu, dongDuoiDoanhThu, dongPhuChuaThu, tenNguoiBan, tenThangThongKe, tieuDeDoanhThuThang, type ThongKeThang,
} from '../lib/thongKeChu';
import { vietTien } from '../lib/tien';
import { Icon, KhungTabChu } from './TabChu';
import './CN8ThongKe.css';

const ICON_TRUOC = <path d="m15 18-6-6 6-6" />;
const ICON_SAU = <path d="m9 18 6-6-6-6" />;

/** YC11.1: nội dung một tháng đã tải (CN8, CN8-00). mau: màu căn theo thứ tự tab Lịch (YC2 "Màu theo căn"). */
export function NoiDungThongKe(props: { tk: ThongKeThang; thang: number; mau?: (canId: string) => string | undefined }) {
  const { tk } = props;
  const duoi = dongDuoiDoanhThu(tk, props.thang);
  const cot = cotBieuDo(tk.cacThang, tk.thang);
  return (
    <>
      <div className="cn8-luoi">
        {/* YC11.1 bước 2 */}
        <section className="hh-stat hh-stat--lg hh-stat--action cn8-toan" aria-label={tieuDeDoanhThuThang(props.thang)}>
          <div className="hh-stat__label">{tieuDeDoanhThuThang(props.thang)}</div>
          <div className="hh-stat__value">{vietTien(tk.doanhThu)}</div>
          {duoi && <div className="hh-stat__hint">{duoi}</div>}
        </section>
        {/* YC11.1 bước 3 */}
        {tk.can.map((c) => (
          <section key={c.canId} className="hh-stat hh-stat--sm cn8-can" aria-label={`Phòng ${c.maCan}`}
                   style={{ '--mau-can': props.mau?.(c.canId) } as CSSProperties}>
            <div className="hh-stat__label">Phòng {c.maCan}</div>
            <div className="hh-stat__value">{vietTien(c.doanhThu)}</div>
          </section>
        ))}
        {/* YC11.1 bước 4 */}
        <section className="hh-stat hh-stat--sm hh-stat--neutral" aria-label="Đêm có khách">
          <div className="hh-stat__label">Đêm có khách</div>
          <div className="hh-stat__value">{chuDemCoKhach(tk.soDem, tk.mauSo)}</div>
        </section>
        <section className="hh-stat hh-stat--sm hh-stat--neutral" aria-label="Công suất">
          <div className="hh-stat__label">Công suất</div>
          <div className="hh-stat__value">{chuCongSuat(tk.soDem, tk.congSuat)}</div>
        </section>
      </div>

      {/* YC11.1 bước 5 */}
      <section className="cn8-the" aria-label="Doanh thu 6 tháng">
        <h2 className="cn8-muc">Doanh thu {tk.cacThang.length} tháng</h2>
        <div className="hh-bars" role="img" aria-label={cot.map((c) => `${c.nhan}: ${c.so ?? '0'}`).join(', ')}>
          {cot.map((c) => (
            <div key={c.nhan} className="hh-bars__col" data-cot={c.nhan} data-dang-xem={c.dangXem ? 'co' : undefined}>
              <div className="hh-bars__val">{c.so ?? ''}</div>
              {c.cao > 0 && <div className={'hh-bars__bar' + (c.dangXem ? ' hh-bars__bar--current' : '')} style={{ height: `${c.cao}%` }} />}
              <div className="hh-bars__label">{c.nhan}</div>
            </div>
          ))}
        </div>
      </section>

      {/* YC11.1 bước 6, YC11 "Khách lẻ" */}
      <section className="cn8-the" aria-label="Doanh thu theo người bán">
        <h2 className="cn8-muc">Doanh thu theo người bán</h2>
        {tk.nguoiBan.length === 0 ? <p className="cn8-trong">{CAU_CHUA_CO_DAT_PHONG_THANG}</p> : (
          <ul className="cn8-ds-ban">
            {tk.nguoiBan.map((n, i) => (
              <li key={n.saleId ?? 'khach-le'} className="cn8-ban">
                <span className="cn8-ban-ten">{tenNguoiBan(n)}</span>
                <span className="cn8-ban-ray" aria-hidden="true">
                  <span className={'cn8-ban-thanh' + (i === 0 ? ' cn8-ban-thanh--dau' : '')} style={{ width: `${doDaiThanh(tk.nguoiBan, n.doanhThu)}%` }} />
                </span>
                <span className="cn8-ban-tien">{vietTien(n.doanhThu)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* YC11.1 bước 7, YC11 "Chưa thu tiền" */}
      <section className="cn8-the cn8-the--chua-thu" aria-label="Chưa thu tiền">
        <div className="cn8-chua-thu-dau">
          <h2 className="cn8-muc">Chưa thu tiền</h2>
          <span className="cn8-chua-thu-tong">{vietTien(tk.tongChuaThu)}</span>
        </div>
        {tk.chuaThu.length === 0 ? <p className="cn8-trong cn8-trong--chua-thu">{CAU_KHONG_CO_CHUA_THU}</p> : tk.chuaThu.map((d) => (
          <div key={d.bookingId} className="cn8-chua-thu-dong">
            <span className="cn8-cham" style={{ background: props.mau?.(d.canId) }} aria-hidden="true" />
            <div className="cn8-chua-thu-giua">
              <span className="cn8-chua-thu-chinh">{dongChinhChuaThu(d)}</span>
              <span className="cn8-chua-thu-phu" data-gap={chuaThuGap(d) ? 'co' : undefined}>{dongPhuChuaThu(d)}</span>
            </div>
            <span className="cn8-chua-thu-tien">{vietTien(d.soTien)}</span>
          </div>
        ))}
      </section>
    </>
  );
}

/** YC11.1: tab Thống kê của chủ nhà. boNho giữ tháng đã xem trong phiên (HV1-NT2). */
export function CN8ThongKe(props: {
  dv: DichVuThongKeChu | undefined; mau?: (canId: string) => string | undefined; thanhTab?: ReactNode;
  /** Tháng mở đầu [năm, tháng]; mặc định tháng của hôm nay giờ Việt Nam. */
  thangDau?: [number, number];
  boNho?: Map<string, ThongKeThang>;
}) {
  const [[nam, thang], datThang] = useState<[number, number]>(() => {
    if (props.thangDau) return props.thangDau;
    const h = homNay();
    return [Number(h.slice(0, 4)), Number(h.slice(5, 7))];
  });
  const boNhoRieng = useRef(new Map<string, ThongKeThang>());
  const boNho = props.boNho ?? boNhoRieng.current;
  const khoa = `${nam}-${thang}`;
  const [tk, datTk] = useState<ThongKeThang | undefined>(() => boNho.get(khoa));
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

  const doi = (buoc: number) => datThang(congThang(nam, thang, buoc));
  const [, thTruoc] = congThang(nam, thang, -1);
  const [, thSau] = congThang(nam, thang, 1);

  const dai = (
    <div className="cn8-thang">
      <button type="button" className="cn8-chuyen" aria-label={`Tháng trước ${tenThangNgan(thTruoc)}`} onClick={() => doi(-1)}>
        <Icon co={20}>{ICON_TRUOC}</Icon><span aria-hidden="true">{tenThangNgan(thTruoc)}</span>
      </button>
      <h2 className="cn8-ten-thang">{tenThangThongKe(nam, thang)}</h2>
      <button type="button" className="cn8-chuyen" aria-label={`Tháng sau ${tenThangNgan(thSau)}`} onClick={() => doi(1)}>
        <span aria-hidden="true">{tenThangNgan(thSau)}</span><Icon co={20}>{ICON_SAU}</Icon>
      </button>
    </div>
  );

  return (
    <>
      <KhungTabChu tieuDe="Thống kê" dai={dai}>
        <div className="cn8-than">
          {tk && dangTai && <DongDangCapNhat />}
          {tk ? <NoiDungThongKe tk={tk} thang={thang} mau={props.mau} />
            : loi ? <ManChuaTai onThuLai={() => void tai()} /> : <KhungXam soDong={4} />}
        </div>
      </KhungTabChu>
      {props.thanhTab}
    </>
  );
}
