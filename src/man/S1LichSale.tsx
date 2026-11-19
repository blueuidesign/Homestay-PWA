// S1 · Lịch phòng của sale (YC7.1 bước 2 đến 10, US43), S1-04 Sắp xếp, S1-05 xoay ngang. PQ4.SALE, PQ11.SALE, QT2.1, QT6.4.
// Mỗi căn một hàng, bảy cột ngày từ ngày đầu; ô trống ghi giá bán rút gọn, kín ghi "Kín", căn tự nhập ghi "?" hay "Bạn".
// Nhóm "Căn của tôi" luôn trên "Nguồn phòng" (YC7 Quy tắc). Xoay ngang là xoay giả bằng CSS, không theo cảm biến (YC7.1-NT8).
// HV1 khung xám và "Đang cập nhật…", HV2 Thử lại, HV8 toast đọc theo chiều ngang khi xoay (HV8-NT3, qua thuộc tính data-xoay).
// Chạm căn (S3, S6-07, S6-03) và ô tìm (YC7.2) chưa có màn đích: chưa làm gì (Ngoài phạm vi của US43).
import { useEffect, useMemo, useState } from 'react';
import { DongDangCapNhat } from '../chung/dangTai';
import { DaiMatKetNoi } from '../chung/matKetNoi';
import {
  bayNgay, CACH_XEP, chiaNhom, cotNgay, dungHang, tenKhoang, type CachXep, type DongLichSale, type OLichSale,
} from '../lib/lichSale';
import type { Ngay } from '../lib/ngay';
import { Icon, ICON_LICH } from './TabChu';
import './S1LichSale.css';

const ICON_TRUOC = <path d="m15 18-6-6 6-6" />;
const ICON_SAU = <path d="m9 18 6-6-6-6" />;
const ICON_XOAY = <><rect x="3" y="7" width="18" height="10" rx="2" /><path d="M8 3h8" /><path d="M12 21v-4" /></>;
const ICON_DONG = <><path d="M18 6 6 18" /><path d="m6 6 12 12" /></>;

/** HV8-NT3: thuộc tính trên thẻ html để toast (src/chung/Toast) xoay theo khung ngang. */
export const THUOC_TINH_XOAY = 'data-xoay';

function O(props: { o: OLichSale; homNay: boolean }) {
  const lop = `s1-o s1-o--${props.o.loai}` + (props.homNay && props.o.loai === 'trong' ? ' s1-o--nay' : '');
  return <div role="cell" className={lop} data-dem={props.o.dem}>{props.o.chu}</div>;
}

/** S1-04: tấm chọn cách sắp xếp. */
function TamSapXep(props: { dangChon: CachXep; onChon: (c: CachXep) => void; onDong: () => void }) {
  return (
    <>
      <div className="s1-man-toi" onClick={props.onDong} />
      <div className="s1-tam" role="dialog" aria-modal="true" aria-labelledby="s1-tam-tieu-de">
        <div className="s1-tam-dau">
          <h2 id="s1-tam-tieu-de" className="s1-tam-tieu-de">Sắp xếp</h2>
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

export function S1LichSale(props: {
  /** Ngày đầu của bảy ngày đang xem. */
  tu: Ngay;
  homNay: Ngay;
  /** Dòng fn_sale_lich của khoảng đang hiện (có thể là khoảng cũ khi đang đọc khoảng mới, HV1). */
  dong: readonly DongLichSale[];
  dangTai?: boolean;
  /** YC7.1 bước 6: lùi (-7) hay tiến (+7). */
  onDoiNgay: (soNgay: number) => void;
  /** YC7.1 bước 8: báo khung tab ẩn, hiện thanh tab. */
  onXoay?: (ngang: boolean) => void;
  /** YC7.1 bước 10: mở YC7.2 (US44). Chưa có thì chạm không làm gì. */
  onTim?: () => void;
}) {
  const [cach, datCach] = useState<CachXep>('ten');
  const [moXep, datMoXep] = useState(false);
  const [ngang, datNgang] = useState(false);
  const ngay = useMemo(() => bayNgay(props.tu), [props.tu]);
  const nhom = useMemo(() => chiaNhom(dungHang(props.dong), cach), [props.dong, cach]);
  const chuCach = CACH_XEP.find((c) => c.ma === cach)!.chu;

  const { onXoay } = props;
  useEffect(() => {
    onXoay?.(ngang);
    const goc = document.documentElement;
    if (ngang) goc.setAttribute(THUOC_TINH_XOAY, 'ngang');
    else goc.removeAttribute(THUOC_TINH_XOAY);
  }, [ngang, onXoay]);
  useEffect(() => () => { document.documentElement.removeAttribute(THUOC_TINH_XOAY); }, []);

  const tim = (
    <button type="button" className="s1-tim" onClick={props.onTim}>
      <Icon co={20}>{ICON_LICH}</Icon><span>Tìm phòng trống theo ngày</span>
    </button>
  );
  const khoang = (
    <div className="s1-khoang">
      <button type="button" className="hh-iconbtn" aria-label="7 ngày trước" title="7 ngày trước" onClick={() => props.onDoiNgay(-7)}>
        <Icon co={20}>{ICON_TRUOC}</Icon>
      </button>
      <span className="s1-khoang-chu">{tenKhoang(props.tu, props.homNay)}</span>
      <button type="button" className="hh-iconbtn" aria-label="7 ngày sau" title="7 ngày sau" onClick={() => props.onDoiNgay(7)}>
        <Icon co={20}>{ICON_SAU}</Icon>
      </button>
    </div>
  );
  const nutXep = (
    <button type="button" className="s1-nut-xep" aria-haspopup="dialog" onClick={() => datMoXep(true)}>
      <span>{chuCach}</span>
      <span className="s1-mui" aria-hidden="true"><Icon co={16}>{ICON_SAU}</Icon></span>
    </button>
  );
  const nutXoay = (
    <button type="button" className={'s1-nut-xoay' + (ngang ? ' s1-nut-xoay--on' : '')} onClick={() => datNgang((x) => !x)}>
      <Icon co={18}>{ICON_XOAY}</Icon><span>{ngang ? 'Xoay dọc' : 'Xoay ngang'}</span>
    </button>
  );

  const bang = (
    <div className="s1-bang" role="table" aria-label="Lịch phòng 7 ngày">
      <div className="s1-hang s1-hang--dau" role="row">
        <div className="s1-cot-can" role="columnheader">Căn</div>
        {ngay.map((n) => {
          const c = cotNgay(n, props.homNay);
          return (
            <div key={n} role="columnheader" className={'s1-cot' + (c.laHomNay ? ' s1-cot--nay' : '')} aria-label={`${c.thu} ${c.ngay}`}>
              <span>{c.thu}</span><span>{c.ngay}</span>
            </div>
          );
        })}
      </div>
      {nhom.map((g) => (
        <div key={g.ma} role="rowgroup" aria-label={g.tieuDe}>
          <div className="s1-nhom" role="row"><span role="rowheader">{g.tieuDe}</span></div>
          {g.hang.map((h) => (
            <div key={h.canId} className="s1-hang" role="row" data-can={h.canId}>
              <div className="s1-ten" role="rowheader">
                <span className="s1-ten-chinh">{h.ten}</span>
                {h.phu && <span className="s1-ten-phu">{h.phu}</span>}
              </div>
              {h.o.map((o) => <O key={o.dem} o={o} homNay={o.dem === props.homNay} />)}
            </div>
          ))}
        </div>
      ))}
    </div>
  );

  const chuThich = (
    <div className="s1-chu-thich">
      <span><i className="s1-mau s1-mau--nay" />Hôm nay</span>
      <span><i className="s1-mau s1-mau--kin" />Kín</span>
      <span><i className="s1-mau s1-mau--hoi">?</i>Căn tự nhập: gọi chủ hỏi</span>
      <span><i className="s1-mau s1-mau--ban" />Đặt phòng bạn đã ghi</span>
      <span>Số là giá đêm của bạn · chạm căn để xem</span>
    </div>
  );

  const tam = moXep && (
    <TamSapXep dangChon={cach} onChon={(c) => { datCach(c); datMoXep(false); }} onDong={() => datMoXep(false)} />
  );

  if (ngang) {
    // S1-05: cả khung quay 90 độ, cột tên căn rộng hơn, không có thanh tab.
    return (
      <div className="s1-xoay" data-man="S1-05">
        <header className="s1-xoay-dau">
          <h1 className="chu-tieu-de s1-xoay-tieu-de">Lịch phòng</h1>
          {tim}{khoang}{nutXep}{nutXoay}
        </header>
        <div className="s1-xoay-than">
          {props.dangTai && <DongDangCapNhat />}
          {bang}
        </div>
        {tam}
      </div>
    );
  }

  return (
    <div className="man man-chu" data-man="S1">
      <DaiMatKetNoi />
      <header className="chu-dau s1-dau"><h1 className="chu-tieu-de">Lịch phòng</h1></header>
      <div className="s1-o-tim">{tim}</div>
      <div className="chu-than s1-than">
        <div className="s1-thanh">
          {khoang}
          <div className="s1-thanh-duoi">{nutXep}{nutXoay}</div>
        </div>
        {props.dangTai && <DongDangCapNhat />}
        {bang}
        {chuThich}
      </div>
      {tam}
    </div>
  );
}
