// CN6-07 · Sao chép giá sang căn khác (YC4.5): chọn phần sao chép, chọn căn đích, popup "Tôi đã hiểu" liệt kê chỗ giữ lại,
// rồi về tab Giá với toast (CN6-08). Chép năm đang xem ở tab Giá (YC4-H1, Claude tự chốt QD25).
// Trạng thái: HV2 mất mạng thì toast "Chưa lưu được", giữ lựa chọn; HV5 căn mất quyền thì câu "Không tìm thấy căn"; HV8 toast.
import { useState } from 'react';
import { NutGhi } from '../chung/dangTai';
import { cauBaoLoi, DaiMatKetNoi } from '../chung/matKetNoi';
import { useToast } from '../chung/Toast';
import { tenCan } from '../lib/can';
import type { DichVuGia, PhanSaoChep } from '../lib/dichVuGia';
import { chuNutSaoChep, dongGiuLai, tomTatGiaNguon, type DipGia, type GiaThang } from '../lib/gia';
import { Icon } from './TabChu';

const ICON_QUAY_LAI = <path d="m15 18-6-6 6-6" />;
const ICON_DAU = <path d="M20 6 9 17l-5-5" />;

export function CN6SaoChepGia(props: {
  canId: string;
  tieuDe: string;
  nam: number;
  /** Giá của căn nguồn trong năm đang xem, cho dòng tóm tắt (YC4.5 bước 1). */
  thang: readonly (GiaThang | null)[];
  dip: readonly DipGia[];
  /** Căn khác chưa xóa của chủ nhà (YC4.5 bước 3). */
  dsCan: { id: string; maCan: string }[];
  dv: DichVuGia | undefined;
  onQuayLai: () => void;
  onDaChep: (soCan: number) => void;
}) {
  const hienToast = useToast();
  const [phan, datPhan] = useState<PhanSaoChep>({ thang: true, ngayLe: true, dip: true });
  const [chon, datChon] = useState<string[]>([]);
  const [giuLai, datGiuLai] = useState<string[] | null>(null);

  const ds = props.dsCan.filter((c) => c.id !== props.canId);
  const doiCan = (id: string) => datChon((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));
  const coPhan = phan.thang || phan.ngayLe || phan.dip;

  const chep = async () => {
    try {
      if (!props.dv?.saoChepGia) throw new TypeError('chưa nối database');
      const kq = await props.dv.saoChepGia(props.canId, chon, phan, props.nam);
      const dong = dongGiuLai(kq);
      if (dong.length) { datGiuLai(dong); return; } // YC4.5 bước 5: có chỗ giữ lại thì popup trước
    } catch (e) {
      hienToast(cauBaoLoi(e), 'loi');
      return;
    }
    props.onDaChep(chon.length);
  };

  const congTac = (khoa: keyof PhanSaoChep, chu: string) => (
    <button key={khoa} type="button" role="checkbox" aria-checked={phan[khoa]} className={phan[khoa] ? 'hh-check hh-check--on cn6-dong-can' : 'hh-check cn6-dong-can'}
            onClick={() => datPhan((p) => ({ ...p, [khoa]: !p[khoa] }))}>
      <span className="hh-check__box" aria-hidden="true">{phan[khoa] && <Icon co={13}>{ICON_DAU}</Icon>}</span>
      <span>{chu}</span>
    </button>
  );

  return (
    <div className="man cn6">
      <DaiMatKetNoi />
      <header className="cn6-dau">
        <button type="button" className="hh-iconbtn man-quay-lai" aria-label="Quay lại" onClick={props.onQuayLai}><Icon co={22}>{ICON_QUAY_LAI}</Icon></button>
        <h1 className="cn6-tieu-de">Sao chép giá</h1>
      </header>
      <div className="cn6-than cn6-dip">
        <section className="cn6-the" aria-label="Từ căn">
          <h2 className="cn6-nhan">Từ căn</h2>
          <p className="cn6-dip-dong">{props.tieuDe}</p>
          <span className="cn6-meo-nho">{tomTatGiaNguon(props.thang, props.dip)} · năm {props.nam}</span>
        </section>
        <section className="cn6-the" aria-label="Sao chép gì">
          <h2 className="cn6-nhan">Sao chép gì</h2>
          {congTac('thang', 'Giá theo tháng')}
          {congTac('ngayLe', 'Giá ngày lễ')}
          {congTac('dip', 'Dịp đặc biệt')}
        </section>
        <section className="cn6-the" aria-label="Sang căn">
          <div className="cn6-the-dau">
            <h2 className="cn6-nhan">Sang căn · đã chọn {chon.length}</h2>
            <button type="button" className="hh-btn hh-btn--text" onClick={() => datChon(ds.map((c) => c.id))}>Chọn tất cả</button>
          </div>
          {ds.length === 0 && <p className="cn6-trong">Chưa có căn khác để sao chép sang.</p>}
          {ds.map((c) => {
            const daChon = chon.includes(c.id);
            return (
              <button key={c.id} type="button" role="checkbox" aria-checked={daChon} className={daChon ? 'hh-check hh-check--on cn6-dong-can' : 'hh-check cn6-dong-can'}
                      onClick={() => doiCan(c.id)}>
                <span className="hh-check__box" aria-hidden="true">{daChon && <Icon co={13}>{ICON_DAU}</Icon>}</span>
                <span>{tenCan(c.maCan)}</span>
              </button>
            );
          })}
          <p className="cn6-canh-bao">⚠️ Giá đang có của căn được chọn sẽ được thay bằng giá của {props.tieuDe}.</p>
        </section>
      </div>
      <div className="cn6-day">
        <NutGhi chu={chuNutSaoChep(chon.length)} onGhi={chep} disabled={chon.length === 0 || !coPhan || !props.dv} />
      </div>
      {giuLai && (
        <>
          <div className="cn6-man-toi" aria-hidden="true" />
          <div className="cn6-tam" role="dialog" aria-modal="true" aria-label="Chỗ giữ giá cũ">
            <div className="cn6-tam-dau"><h2 className="cn6-tam-ten">Một số chỗ giữ giá cũ</h2></div>
            <div className="cn6-tam-than">
              <ul className="cn6-giu-lai">{giuLai.map((d) => <li key={d}>{d}</li>)}</ul>
              <button type="button" className="hh-btn hh-btn--primary hh-btn--block" onClick={() => props.onDaChep(chon.length)}>Tôi đã hiểu</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
