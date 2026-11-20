// S6-04 · Chi tiết chủ nhà (YC10.2 bước 1 đến 6, YC10.2-NT1 đến NT4, NT7, YC10-H6, YC10 "Bấm hai lần", QD7, QT3.1, PQ2.SALE,
// PQ3.SALE, PQ8.SALE, PQ15.SALE, PQ17.SALE, HV5). Đọc qua fn_chi_tiet_chu_nha: tên, số, ngày kết nối, "Gọi" (tel:, pwa.md P5),
// lần cập nhật, quyền chủ cho xem, căn với giá chủ đêm hôm nay, kết quả bán. "Bỏ nguồn phòng này" bấm hai lần.
// Trạng thái: HV1 khung xám, HV2 Thử lại, HV3 quay lại từ nền đọc lại, HV5 "Bạn không còn xem được mục này", HV8 toast.
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { KhungXam, NutGhi } from '../chung/dangTai';
import { cauBaoLoi, DaiMatKetNoi, ManChuaTai } from '../chung/matKetNoi';
import { useQuayLaiTuNen } from '../chung/nhap';
import { useToast } from '../chung/Toast';
import {
  cauGiaiThichBo, chuDaBan, chuDaBo, chuLyDo, chuTienChenh, chuTuCapNhat, chuXacNhanBo, dongPhuChuNha, dongQuyen,
  phuCanChuNha, tenCanChuNha, tieuDeQuyen, type CanCuaChuNha, type ChiTietChuNha,
} from '../lib/chiTietChuNha';
import type { DichVuChiTietChuNha } from '../lib/dichVuChiTietChuNha';
import { chuCaiDau } from '../lib/tabCanSale';
import { ICON_QUAY_LAI } from './CN704ChiTietSale';
import { Icon, ICON_TOI } from './TabChu';
import './S604ChiTietChuNha.css';

const ICON_GOI = <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />;
const ICON_CO = <path d="M20 6 9 17l-5-5" />;
const ICON_X = <><path d="M18 6 6 18" /><path d="m6 6 12 12" /></>;

export const CAU_KHONG_CON_XEM = 'Bạn không còn xem được mục này';

/** HV5, YC10.2-NT7: không còn quyền thì chỉ câu, lý do và nút về tab Căn. */
function KhongConXem(props: { lyDo: string; onVe: () => void }) {
  return (
    <section className="s604-the s604-mat" role="alert">
      <p className="s604-mat-cau">{CAU_KHONG_CON_XEM}</p>
      <p className="s604-phu">{props.lyDo}</p>
      <button type="button" className="hh-btn hh-btn--secondary hh-btn--block" onClick={props.onVe}>Về tab Căn</button>
    </section>
  );
}

function DongCan(props: { c: CanCuaChuNha; onCham?: () => void }) {
  const phu = phuCanChuNha(props.c);
  return (
    <li>
      <button type="button" className="s604-can" onClick={props.onCham}>
        <span className="s604-cham" aria-hidden="true" />
        <span className="s604-can-chu">
          <span className="s604-can-ten">{tenCanChuNha(props.c)}</span>
          {phu && <span className="s604-phu">{phu}</span>}
        </span>
        <span className="s604-toi"><Icon co={16}>{ICON_TOI}</Icon></span>
      </button>
    </li>
  );
}

export function S604ChiTietChuNha(props: {
  ketNoiId: string;
  /** Tiêu đề khi chưa đọc xong (HV1): tên chủ nhà từ tab Căn. */
  tenTam: string;
  dv?: DichVuChiTietChuNha;
  onQuayLai: () => void;
  /** YC10.2 bước 6: đã bỏ nguồn, về S6 (đọc lại tab Căn). */
  onDaBo: () => void;
  /** Chạm một căn: mở S3 của căn đó. */
  onChamCan?: (c: CanCuaChuNha) => void;
}) {
  const { dv, ketNoiId, onDaBo } = props;
  const hienToast = useToast();
  const [ct, datCt] = useState<ChiTietChuNha | undefined>(undefined);
  const [loi, datLoi] = useState(false);
  const [xacNhan, datXacNhan] = useState(false);

  const tai = useCallback(async () => {
    if (!dv) { datLoi(true); return; }
    datLoi(false);
    try {
      datCt(await dv.doc(ketNoiId));
    } catch {
      datLoi(true);
    }
  }, [dv, ketNoiId]);
  useEffect(() => { void tai(); }, [tai]);
  useQuayLaiTuNen(() => { void tai(); });

  // YC10.2 bước 6, YC10.2-NT4: lần bấm thứ hai mới bỏ. Lỗi thì báo và đọc lại (HV5 nếu chủ vừa ngừng).
  const boNguon = async () => {
    if (!dv || !ct) return;
    try {
      await dv.boNguon(ketNoiId);
      hienToast(chuDaBo(ct.tenChu));
      onDaBo();
    } catch (e) {
      datXacNhan(false);
      hienToast(cauBaoLoi(e), 'loi');
      await tai();
    }
  };

  let than: ReactNode;
  if (!ct) {
    than = loi ? <ManChuaTai onThuLai={() => void tai()} /> : <KhungXam />;
  } else if (ct.trangThai === 'khong_con_quyen') {
    than = <KhongConXem lyDo={chuLyDo(ct.lyDo)} onVe={props.onQuayLai} />;
  } else {
    const capNhat = chuTuCapNhat(ct.capNhatLuc);
    than = (
      <>
        <section className="s604-the" aria-label="Chủ nhà">
          <div className="s604-nguoi">
            <span className="s604-tron" aria-hidden="true">{chuCaiDau(ct.tenChu)}</span>
            <span className="s604-nguoi-chu">
              <span className="s604-ten">{ct.tenChu}</span>
              <span className="s604-phu">{dongPhuChuNha(ct)}</span>
            </span>
            {ct.soDienThoai && (
              <a className="hh-btn hh-btn--secondary hh-btn--pill s604-goi" href={`tel:${ct.soDienThoai}`}><Icon>{ICON_GOI}</Icon>Gọi</a>
            )}
          </div>
          {capNhat && <span className="s604-cap-nhat">{capNhat}</span>}
        </section>
        <section className="s604-the" aria-label={tieuDeQuyen(ct.tenChu)}>
          <h2 className="s604-muc">{tieuDeQuyen(ct.tenChu)}</h2>
          <ul className="s604-quyen">
            {dongQuyen(ct.xemCoc).map((q) => (
              <li key={q}><span className="s604-co"><Icon co={16}>{ICON_CO}</Icon></span>{q}</li>
            ))}
          </ul>
        </section>
        <section className="s604-nhom" aria-label={`Căn · ${ct.can.length}`}>
          <h2 className="s604-muc s604-muc--ngoai">Căn · {ct.can.length}</h2>
          {ct.can.length > 0 && (
            <ul className="s604-ds">
              {ct.can.map((c) => <DongCan key={c.canId} c={c} onCham={props.onChamCan ? () => props.onChamCan!(c) : undefined} />)}
            </ul>
          )}
        </section>
        <div className="s604-so">
          <div className="hh-stat hh-stat--sm hh-stat--neutral"><div className="hh-stat__label">Bạn đã bán</div><div className="hh-stat__value">{chuDaBan(ct.soDatPhong)}</div></div>
          <div className="hh-stat hh-stat--sm hh-stat--action"><div className="hh-stat__label">Tiền chênh</div><div className="hh-stat__value">{chuTienChenh(ct.tienChenh)}</div></div>
        </div>
        <div className="s604-bo">
          {xacNhan ? (
            <>
              <NutGhi chu={chuXacNhanBo(ct.tenChu)} chuDangGhi="Đang bỏ…" lop="hh-btn hh-btn--primary hh-btn--block s604-nut-nguy" onGhi={boNguon} />
              <p className="s604-phu s604-giai-thich">{cauGiaiThichBo(ct.tenChu)}</p>
            </>
          ) : (
            <button type="button" className="hh-btn hh-btn--secondary hh-btn--block" onClick={() => datXacNhan(true)}>
              <Icon>{ICON_X}</Icon>Bỏ nguồn phòng này
            </button>
          )}
        </div>
      </>
    );
  }
  return (
    <div className="man man-chu s604" data-man="S6-04">
      <DaiMatKetNoi />
      <header className="chu-dau">
        <button type="button" className="hh-iconbtn man-quay-lai" aria-label="Quay lại" onClick={props.onQuayLai}>
          <Icon co={22}>{ICON_QUAY_LAI}</Icon>
        </button>
        <h1 className="chu-tieu-de">{ct ? ct.tenChu : props.tenTam}</h1>
      </header>
      <div className="chu-than s604-than">{than}</div>
    </div>
  );
}
