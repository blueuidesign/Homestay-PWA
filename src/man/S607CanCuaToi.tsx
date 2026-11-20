// S6-07 · Chi tiết căn của tôi (YC10.1 bước 7, YC10.1-NT5, QD5, PQ13, PQ3.CHU, PQ5.CHU). Đọc qua fn_chi_tiet_can_cua_toi:
// ảnh, "Căn của tôi", "2PN · view biển", 7 ngày tới với giá đêm của sale, ba việc Đặt phòng (YC5), Sửa căn và giá (YC3.5,
// YC4.2), Gửi cho khách (YC8). Trạng thái: HV1 khung xám, HV2 Thử lại, HV3 quay lại từ nền đọc lại, HV5 không còn căn.
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { KhungXam } from '../chung/dangTai';
import { DaiMatKetNoi, LoiNguoiDung, ManChuaTai } from '../chung/matKetNoi';
import { useQuayLaiTuNen } from '../chung/nhap';
import type { DichVuTabCanSale } from '../lib/dichVuTabCanSale';
import type { Ngay } from '../lib/ngay';
import { oBayNgay, phuCanCuaToi, tenCanCuaToi, type ChiTietCanCuaToi } from '../lib/tabCanSale';
import { ICON_QUAY_LAI } from './CN704ChiTietSale';
import { Icon, ICON_THEM, ICON_TOI } from './TabChu';
import './S607CanCuaToi.css';

export const CAU_CAN_CUA_TOI = 'Bạn tự ghi lịch và giá cho căn này, như chủ nhà.';
const ICON_SUA = <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />;
const ICON_KHACH = <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>;

function Viec(props: { icon: ReactNode; chu: string; phu: string; onBam: () => void }) {
  return (
    <li>
      <button type="button" className="s607-viec" onClick={props.onBam}>
        <span className="s607-viec-icon"><Icon co={20}>{props.icon}</Icon></span>
        <span className="s607-viec-chu"><span className="s607-viec-ten">{props.chu}</span><span className="s607-viec-phu">{props.phu}</span></span>
        <span className="s607-toi"><Icon co={16}>{ICON_TOI}</Icon></span>
      </button>
    </li>
  );
}

export function S607CanCuaToi(props: {
  canId: string;
  /** Tiêu đề khi chưa đọc xong (HV1): tên căn từ danh sách, như "Green Bay 0812". */
  tenTam: string;
  dv: Pick<DichVuTabCanSale, 'docCanCuaToi'>;
  homNay: Ngay;
  onQuayLai: () => void;
  onDatPhong: (c: ChiTietCanCuaToi) => void;
  onSuaCan: (c: ChiTietCanCuaToi) => void;
  onGuiKhach: (c: ChiTietCanCuaToi) => void;
}) {
  const { dv, canId, homNay } = props;
  const [ct, datCt] = useState<ChiTietCanCuaToi | undefined>(undefined);
  const [loi, datLoi] = useState<string | true | null>(null);
  const tai = useCallback(async () => {
    datLoi(null);
    try {
      datCt(await dv.docCanCuaToi(canId, homNay));
    } catch (e) {
      datLoi(e instanceof LoiNguoiDung ? e.message : true);
    }
  }, [dv, canId, homNay]);
  useEffect(() => { void tai(); }, [tai]);
  useQuayLaiTuNen(() => { void tai(); });

  let than: ReactNode;
  if (!ct) {
    than = loi === null ? <KhungXam /> : typeof loi === 'string'
      ? <p className="s607-cau-loi" role="alert">{loi}</p>
      : <ManChuaTai onThuLai={() => void tai()} />;
  } else {
    const ten = tenCanCuaToi(ct);
    const phu = phuCanCuaToi(ct);
    than = (
      <>
        {ct.anh[0] ? <img className="s607-anh" src={ct.anh[0]} alt={`Ảnh ${ten}`} /> : <div className="s607-anh s607-anh--trong" aria-hidden="true" />}
        <section className="s607-the">
          <div className="s607-ten-dong"><span className="s607-ten">{ten}</span><span className="s607-nhan">Căn của tôi</span></div>
          {phu && <span className="s607-phu">{phu}</span>}
          <span className="s607-cau">{CAU_CAN_CUA_TOI}</span>
        </section>
        <section className="s607-the" aria-label="7 ngày tới · giá đêm của bạn">
          <h2 className="s607-muc">7 ngày tới · giá đêm của bạn</h2>
          <ol className="s607-luoi">
            {ct.dem.map((d) => {
              const o = oBayNgay(d, homNay);
              return (
                <li key={d.ngay} className={'s607-o' + (o.kin ? ' s607-o--kin' : '')} data-testid="o-ngay">
                  <span className="s607-o-thu">{o.thu}</span><span className="s607-o-ngay">{o.ngay}</span><span className="s607-o-gia">{o.chu}</span>
                </li>
              );
            })}
          </ol>
        </section>
        <ul className="s607-ds" aria-label="Việc với căn này">
          <Viec icon={ICON_THEM} chu="Đặt phòng" phu="Khách đã chốt cho căn này" onBam={() => props.onDatPhong(ct)} />
          <Viec icon={ICON_SUA} chu="Sửa căn và giá" phu="Ảnh, thông tin, giá theo tháng" onBam={() => props.onSuaCan(ct)} />
          <Viec icon={ICON_KHACH} chu="Gửi cho khách" phu="Ảnh, thông tin và giá bán" onBam={() => props.onGuiKhach(ct)} />
        </ul>
      </>
    );
  }
  return (
    <div className="man man-chu s607" data-man="S6-07">
      <DaiMatKetNoi />
      <header className="chu-dau">
        <button type="button" className="hh-iconbtn man-quay-lai" aria-label="Quay lại" onClick={props.onQuayLai}>
          <Icon co={22}>{ICON_QUAY_LAI}</Icon>
        </button>
        <h1 className="chu-tieu-de">{ct ? tenCanCuaToi(ct) : props.tenTam}</h1>
      </header>
      <div className="chu-than s607-than">{than}</div>
    </div>
  );
}
