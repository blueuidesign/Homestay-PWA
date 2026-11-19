// S4 · Kết quả tìm phòng, lịch tuần (YC7.3 bước 5, 6, YC7.3-NT4, YC7-H4, US45). PQ4.SALE, PQ11.SALE, QT2.1, QT5.4, QT6.4,
// HV1, HV2. Cùng điều kiện, cùng tập căn với S2; bảng căn × 7 ngày từ ngày nhận, ‹ › như S1. Ô: giá bán rút gọn, "Kín", "?".
// Đêm khách hỏi được tô. Không ghi số khách. Dấu tích chọn căn dùng chung với S2; chạm tên căn theo quy tắc "Chạm căn mở đâu".
import { DongDangCapNhat } from '../chung/dangTai';
import { CAU_CHUA_TAI } from '../chung/matKetNoi';
import { hangTuan, laDemKhachHoi, type CheDoKetQua, type NhomKetQua } from '../lib/ketQuaTim';
import { bayNgay, cotNgay, type DongLichSale } from '../lib/lichSale';
import type { Ngay } from '../lib/ngay';
import { khoangNgan, type CanTim, type DieuKienTim, type KetQuaTim } from '../lib/timPhong';
import { ChanKetQua, DauKetQua, DauTich } from './S2KetQua';
import { Icon } from './TabChu';

const ICON_TRUOC = <path d="m15 18-6-6 6-6" />;
const ICON_SAU = <path d="m9 18 6-6-6-6" />;

export function S4LichTuanKetQua(props: {
  dieuKien: DieuKienTim;
  kq: KetQuaTim;
  nhom: readonly NhomKetQua[];
  /** Ngày đầu của bảy ngày đang xem (mặc định ngày nhận, YC7-H4). */
  tu: Ngay;
  homNay: Ngay;
  dong: readonly DongLichSale[];
  dangTai?: boolean;
  loi?: boolean;
  daChon: ReadonlySet<string>;
  onDoiNgay: (soNgay: number) => void;
  onThuLai: () => void;
  onChon: (canId: string) => void;
  onCham: (c: CanTim) => void;
  onCheDo: (c: CheDoKetQua) => void;
  onSua: () => void;
  onQuayLai: () => void;
  onGui: () => void;
}) {
  const ngay = bayNgay(props.tu);
  const hang = hangTuan(props.nhom, props.dong, ngay);
  const theoId = new Map(props.kq.can.map((c) => [c.canId, c]));
  const dk = props.dieuKien;
  const chuDk = dk.nhan && dk.tra ? khoangNgan(dk.nhan, dk.tra) : '';
  const dm = (n: Ngay) => `${n.slice(8, 10)}/${n.slice(5, 7)}`;
  return (
    <div className="man man-chu kq" data-man="S4">
      <DauKetQua dieuKienChu={chuDk} kq={props.kq} cheDo="lich-tuan" onQuayLai={props.onQuayLai} onSua={props.onSua}
                 onCheDo={props.onCheDo} />
      <div className="kq-than">
        <div className="s1-khoang kq-khoang">
          <button type="button" className="hh-iconbtn" aria-label="7 ngày trước" title="7 ngày trước" onClick={() => props.onDoiNgay(-7)}>
            <Icon co={20}>{ICON_TRUOC}</Icon>
          </button>
          <span className="s1-khoang-chu">{dm(props.tu)} → {dm(ngay[6]!)}</span>
          <button type="button" className="hh-iconbtn" aria-label="7 ngày sau" title="7 ngày sau" onClick={() => props.onDoiNgay(7)}>
            <Icon co={20}>{ICON_SAU}</Icon>
          </button>
        </div>
        {props.dangTai && <DongDangCapNhat />}
        {props.loi && (
          <div className="man-loi" role="alert">
            <p>{CAU_CHUA_TAI}</p>
            <button type="button" onClick={props.onThuLai}>Thử lại</button>
          </div>
        )}
        <div className="s1-bang kq-bang" role="table" aria-label="Lịch tuần kết quả tìm">
          <div className="s1-hang s1-hang--dau kq-hang" role="row">
            <div className="s1-cot-can" role="columnheader">Căn</div>
            {ngay.map((n) => {
              const c = cotNgay(n, '');
              const hoi = laDemKhachHoi(n, dk);
              return (
                <div key={n} role="columnheader" className={'s1-cot' + (hoi ? ' s1-cot--nay' : '')} data-hoi={hoi || undefined}
                     aria-label={`${c.thu} ${c.ngay}`}>
                  <span>{c.thu}</span><span>{c.ngay}</span>
                </div>
              );
            })}
          </div>
          {hang.map((h) => {
            const c = theoId.get(h.canId)!;
            return (
              <div key={h.canId} className="s1-hang kq-hang" role="row" data-can={h.canId}>
                <div className="kq-ten" role="rowheader">
                  <DauTich chon={props.daChon.has(h.canId)} ten={h.ten} onBam={() => props.onChon(h.canId)} />
                  <button type="button" className="kq-ten-mo" onClick={() => props.onCham(c)}>
                    <span className="s1-ten-chinh">{h.ten}</span>
                    {h.phu && <span className="s1-ten-phu">{h.phu}</span>}
                  </button>
                </div>
                {h.o.map((o) => (
                  <div key={o.dem} role="cell" data-dem={o.dem}
                       className={`s1-o s1-o--${o.loai}` + (laDemKhachHoi(o.dem, dk) && o.loai === 'trong' ? ' s1-o--nay' : '')}>
                    {o.chu}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
        <div className="s1-chu-thich">
          <span><i className="s1-mau s1-mau--nay" />Đêm khách hỏi</span>
          <span><i className="s1-mau s1-mau--kin" />Kín</span>
          <span><i className="s1-mau s1-mau--hoi">?</i>Căn tự nhập: gọi chủ hỏi</span>
          <span>Số là giá đêm của bạn</span>
        </div>
      </div>
      <ChanKetQua soChon={props.daChon.size} onGui={props.onGui} />
    </div>
  );
}
