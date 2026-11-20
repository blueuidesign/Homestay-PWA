// CN6-02 · Giá ngày lễ, dịp đặc biệt (YC4.3): CN6-02 chọn nhanh ngày lễ, CN6-03 chọn quá 10 ngày, CN6-03-01 bỏ trống tên.
// Trạng thái: HV2 mất mạng thì toast "Chưa lưu được", giữ dải đang nhập; HV5 căn mất quyền thì câu "Không tìm thấy căn" của database;
// HV8 toast. Sửa, xóa dải đã lưu chưa làm ([MỞ: YC4-H2]).
import { useEffect, useState } from 'react';
import { NutGhi } from '../chung/dangTai';
import { cauBaoLoi, DaiMatKetNoi, LoiNguoiDung } from '../chung/matKetNoi';
import { useToast } from '../chung/Toast';
import type { DichVuGia } from '../lib/dichVuGia';
import {
  DIP_CHON_NHANH, cauTrungDip, dinhDangOGia, docSoTien, dongDaiNgay, kiemDip, luoiTuanDai, noiDai, soNgayDai,
  SO_NGAY_DIP_TOI_DA, tenTuDat, type DipGia, type NgayLeChung,
} from '../lib/gia';
import type { Ngay } from '../lib/ngay';
import { Icon } from './TabChu';

const ICON_QUAY_LAI = <path d="m15 18-6-6 6-6" />;
const ICON_DAU = <path d="M20 6 9 17l-5-5" />;

export function CN6GiaDip(props: {
  canId: string;
  tieuDe: string;
  dv: DichVuGia | undefined;
  /** Năm đang chọn ở tab Giá: chọn nhanh lấy dải ngày lễ chung của năm này (YC4.3 bước 1). */
  nam: number;
  /** Dải đã có của căn, để báo trùng ngày trước khi gửi (YC4.3 bước 8). Database vẫn kiểm lại. */
  dip: readonly DipGia[];
  /** Ngày điền sẵn (chạm một ngày trên lịch giá). */
  ngayDau: Ngay;
  onQuayLai: () => void;
  /** Lưu xong: tab Giá hiện toast và đọc lại giá. */
  onDaLuu: (ten: string) => void;
}) {
  const hienToast = useToast();
  const [tu, datTu] = useState<Ngay>(props.ngayDau);
  const [den, datDen] = useState<Ngay>(props.ngayDau);
  const [ten, datTen] = useState('');
  const [gia, datGia] = useState('');
  const [laNgayLe, datLaNgayLe] = useState(false);
  const [chip, datChip] = useState<string | null>(null);
  const [ngayLe, datNgayLe] = useState<NgayLeChung[] | undefined>(undefined);
  const [loi, datLoi] = useState<string | null>(null);

  useEffect(() => {
    let con = true;
    props.dv?.layNgayLe?.(props.nam).then((d) => { if (con) datNgayLe(d); }).catch(() => { if (con) datNgayLe([]); });
    return () => { con = false; };
  }, [props.dv, props.nam]);

  const soNgay = soNgayDai(tu, den);
  const quaMuoi = soNgay > SO_NGAY_DIP_TOI_DA;

  // YC4.3 bước 2, YC4.3-NT1: điền dải Home247 đặt cho năm đang chọn, tên dịp, bật "Là ngày lễ".
  const chonNhanh = (tenDip: string) => {
    datLoi(null);
    datChip(tenDip);
    datTen(tenDip);
    datLaNgayLe(true);
    const d = ngayLe?.find((x) => x.ten === tenDip);
    if (d) { datTu(d.tuNgay); datDen(d.denNgay); }
    else hienToast(`Home247 chưa đặt ngày cho ${tenDip} năm ${props.nam}. Chọn ngày bên dưới.`);
  };

  const doiTu = (v: string) => { datLoi(null); if (!v) return; datTu(v); if (den < v) datDen(v); };
  const doiDen = (v: string) => { datLoi(null); if (v) datDen(v); };

  const luu = async () => {
    const loiKiem = kiemDip(tu, den, ten, gia) ?? cauTrungDip(props.dip, tu, den);
    if (loiKiem) { datLoi(loiKiem); return; }
    datLoi(null);
    const tenLuu = ten.trim();
    try {
      if (!props.dv?.luuGiaDip) throw new TypeError('chưa nối database');
      await props.dv.luuGiaDip(props.canId, { tuNgay: tu, denNgay: den, ten: tenLuu, gia: docSoTien(gia)!, laNgayLe });
    } catch (e) {
      // YC4.3 bước 8: câu trùng ngày của database hiện dòng đỏ, ở lại màn. Lỗi khác: toast, giữ dải đang nhập (HV2, HV5).
      if (e instanceof LoiNguoiDung && e.message.startsWith('Trùng ngày')) datLoi(e.message);
      else hienToast(cauBaoLoi(e), 'loi');
      return;
    }
    props.onDaLuu(tenLuu || tenTuDat(tu, den, laNgayLe));
  };

  return (
    <div className="man cn6">
      <DaiMatKetNoi />
      <header className="cn6-dau">
        <button type="button" className="hh-iconbtn man-quay-lai" aria-label="Quay lại" onClick={props.onQuayLai}><Icon co={22}>{ICON_QUAY_LAI}</Icon></button>
        <h1 className="cn6-tieu-de">Giá ngày lễ, dịp đặc biệt</h1>
      </header>
      <div className="cn6-than cn6-dip">
        <p className="cn6-dip-can">{props.tieuDe}</p>
        <section className="cn6-the" aria-label="Chọn nhanh ngày lễ">
          <h2 className="cn6-nhan">Chọn nhanh ngày lễ</h2>
          <div className="cn6-chips">
            {DIP_CHON_NHANH.map((c) => (
              <button key={c} type="button" aria-pressed={chip === c} className={'hh-chip hh-chip--sale' + (chip === c ? ' hh-chip--on' : '')}
                      onClick={() => chonNhanh(c)}>
                {chip === c && <Icon co={13}>{ICON_DAU}</Icon>}{c}
              </button>
            ))}
          </div>
          <span className="cn6-meo-nho">Home247 đặt sẵn dải ngày nghỉ của từng dịp mỗi năm, gồm nghỉ bù và nối cuối tuần. Chọn xong vẫn sửa được ngày.</span>
        </section>

        <section className="cn6-the" aria-label="Dải ngày">
          <div className="cn6-hai-o">
            <label className="hh-field">
              <span className="hh-field__label">Từ ngày</span>
              <input className="hh-input" type="date" value={tu} onChange={(e) => doiTu(e.target.value)} />
            </label>
            <label className="hh-field">
              <span className="hh-field__label">Đến ngày</span>
              <input className="hh-input" type="date" value={den} min={tu} onChange={(e) => doiDen(e.target.value)} />
            </label>
          </div>
          <span className="cn6-dip-dong">{dongDaiNgay(tu, den)}</span>
          {quaMuoi && <p className="cn6-canh-bao" role="alert">⚠️ Tối đa {SO_NGAY_DIP_TOI_DA} ngày. Đang chọn {soNgay} ngày, hãy rút ngắn ngày kết thúc.</p>}
          <div className="cn6-dip-luoi">
            {luoiTuanDai(tu, den).map((o) => {
              const chon = tu <= o.ngay && o.ngay <= den;
              const cuoi = o.thu === 'T7' || o.thu === 'CN';
              return (
                <button key={o.ngay} type="button" aria-pressed={chon} data-ngay={o.ngay}
                        className={'cn6-dip-o' + (chon ? ' cn6-dip-o--chon' : cuoi ? ' cn6-dip-o--cuoi' : '')}
                        onClick={() => { datLoi(null); const [a, b] = noiDai(tu, den, o.ngay); datTu(a); datDen(b); }}>
                  <span className="cn6-dip-thu">{o.thu}</span><span className="cn6-dip-ngay">{o.nhan}</span>
                </button>
              );
            })}
          </div>
          <div className="cn6-chu-thich">
            <span><i className="cn6-mau cn6-mau--chon" />Ngày đã chọn</span>
            <span><i className="cn6-mau cn6-mau--cuoi" />Thứ 7, Chủ nhật</span>
          </div>
          <span className="cn6-meo-nho">Hiện tròn tuần, từ thứ 2 đến chủ nhật, để thấy dịp lễ có nối với cuối tuần không. Chạm một ô để nới dải ngày.</span>
        </section>

        <section className="cn6-the" aria-label="Tên và giá">
          <label className="hh-field">
            <span className="hh-field__label">Tên dịp</span>
            <input className="hh-input" type="text" maxLength={80} placeholder={tenTuDat(tu, den, laNgayLe)} value={ten}
                   onChange={(e) => { datLoi(null); datTen(e.target.value); }} />
          </label>
          {!ten.trim() && <span className="cn6-meo-nho">Bỏ trống thì app đặt tên theo ngày: "{tenTuDat(tu, den, laNgayLe)}".</span>}
          <label className="hh-field">
            <span className="hh-field__label">Giá mỗi đêm (đ)</span>
            <input className="hh-input" type="text" inputMode="numeric" placeholder="VD: 2.500.000" value={gia}
                   onChange={(e) => { datLoi(null); datGia(dinhDangOGia(e.target.value)); }} />
          </label>
          <button type="button" role="checkbox" aria-checked={laNgayLe} className={laNgayLe ? 'hh-check hh-check--on' : 'hh-check'}
                  onClick={() => datLaNgayLe((x) => !x)}>
            <span className="hh-check__box" aria-hidden="true">{laNgayLe && <Icon co={13}>{ICON_DAU}</Icon>}</span>
            <span>Là ngày lễ (hiện trong mục Giá ngày lễ)</span>
          </button>
          {loi && !quaMuoi && <p className="hh-field__loi" role="alert">{loi}</p>}
        </section>
      </div>
      <div className="cn6-day">
        <NutGhi chu="Lưu giá" onGhi={luu} disabled={quaMuoi || !props.dv} />
      </div>
    </div>
  );
}
