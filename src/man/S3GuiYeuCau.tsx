// S3-02 Gửi yêu cầu đặt phòng, S3-03 Chờ chủ nhà trả lời, S3-07 Lỗi khi gửi: căn đã được đặt, S3-08 Sale đã hủy yêu cầu
// (YC9.1 bước 1 đến 4, US50). YC9-H7, H8, QT1.4, QT5.6, PQ10.SALE, QD7, pwa.md P5, HV1, HV2, HV3, HV8.
// YC9.4 (US53): S3-03 đọc lại ra Đã chốt, Bị từ chối, Hết hạn thì sang S3-04, S3-05, S3-09 (S3KetQuaYeuCau).
// Mở từ nút "Gửi yêu cầu đặt phòng" ở S3 với căn và ngày đang xem; giá do database tính lúc gửi (không gửi giá).
import { useCallback, useEffect, useRef, useState } from 'react';
import { cauBaoLoi, DaiMatKetNoi, LoiNguoiDung } from '../chung/matKetNoi';
import { useQuayLaiTuNen } from '../chung/nhap';
import { useToast } from '../chung/Toast';
import { chuKhoang, duongDanGoi, tieuDeCan, type ChiTietCanSale } from '../lib/chiTietCanSale';
import type { DichVuChiTietCanSale } from '../lib/dichVuChiTietCanSale';
import { LoiDaDat, type DichVuYeuCau } from '../lib/dichVuYeuCau';
import { congNgay, type Ngay } from '../lib/ngay';
import { vietTien } from '../lib/tien';
import {
  CAU_DA_DAT, CAU_GHI_S302, chuChoChu, chuChuNhaGia, chuDaGuiLuc, chuDaHuy, chuDemKin, chuTomTat, duongDanZalo, kiemLoiNhan,
  oQuanhKhoang, type OQuanh, type TrangThaiYeuCau, type YeuCauCuaToi,
} from '../lib/yeuCau';
import { ICON_QUAY_LAI } from './CN704ChiTietSale';
import { S3KetQuaYeuCau } from './S3KetQuaYeuCau';
import { Icon } from './TabChu';
import './S3GuiYeuCau.css';

/** QT5.6: mã lần gửi, một mã cho mỗi lần mở S3-02 để bấm lại sau lỗi mạng không tạo yêu cầu thứ hai. */
function taoMaLanGui(): string {
  try {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  } catch { /* máy cũ */ }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (k) => {
    const r = (Math.random() * 16) | 0;
    return (k === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

// Trạng thái không còn chờ đọc lại ở S3-03 (màn riêng của từng trạng thái ở YC9.4).
const CHU_TRANG_THAI: Partial<Record<TrangThaiYeuCau, string>> = {
  da_chot: 'Chủ nhà đã chấp nhận', bi_tu_choi: 'Yêu cầu bị từ chối', het_han: 'Yêu cầu đã hết hạn', da_huy: 'Đã hủy yêu cầu',
};

/** Thẻ căn đầu màn: tên, "Chị Hoa · 10/10 → 12/10 (2 đêm)", giá bán cho khách, giá chủ nhà (YC9.1-NT3, QD7). */
function TheCan(props: { ten: string; tenChu: string; tu: Ngay; den: Ngay; giaBan: number | null; giaChu: number | null }) {
  return (
    <section className="s3yc-the" aria-label="Căn">
      <span className="s3yc-ten" data-testid="s302-can">{props.ten}</span>
      <span className="s3yc-dong" data-testid="dong-chu">
        {props.tenChu} · <span data-testid="s302-khoang">{chuKhoang(props.tu, props.den)}</span>
      </span>
      <div className="s3yc-hang" data-testid="gia-ban-yc">
        <span className="s3yc-nhan">Giá bán cho khách</span>
        <span className="s3yc-gia-ban">{props.giaBan == null ? '–' : vietTien(props.giaBan)}</span>
      </div>
      <div className="s3yc-hang" data-testid="gia-chu-yc">
        <span className="s3yc-nhan">Giá chủ nhà</span>
        <span className="s3yc-gia-chu">{props.giaChu == null ? '–' : vietTien(props.giaChu)}</span>
      </div>
    </section>
  );
}

function DauMan(props: { tieuDe: string; onQuayLai?: () => void }) {
  return (
    <header className="chu-dau">
      {props.onQuayLai && (
        <button type="button" className="hh-iconbtn man-quay-lai" aria-label="Quay lại" onClick={props.onQuayLai}>
          <Icon co={22}>{ICON_QUAY_LAI}</Icon>
        </button>
      )}
      <h1 className="chu-tieu-de">{props.tieuDe}</h1>
    </header>
  );
}

type Buoc = { loai: 'soan' } | { loai: 'cho'; y: YeuCauCuaToi } | { loai: 'da-huy'; y: YeuCauCuaToi } | { loai: 'da-dat'; dem: Ngay[] }
  | { loai: 'ket-qua'; y: YeuCauCuaToi };

/** YC9.4: trạng thái đọc lại quyết định màn kế tiếp. */
function buocTheo(y: YeuCauCuaToi): Buoc {
  return y.trangThai === 'cho' ? { loai: 'cho', y } : y.trangThai === 'da_huy' ? { loai: 'da-huy', y } : { loai: 'ket-qua', y };
}

/** S3-03 (YC9.1 bước 3, 4): chờ chủ nhà; "Hủy yêu cầu" bấm hai lần. HV3: quay lại từ nền thì đọc lại trạng thái. */
function ManCho(props: { y: YeuCauCuaToi; dv?: DichVuYeuCau; onDaHuy: (y: YeuCauCuaToi) => void; onDoi: (y: YeuCauCuaToi) => void;
                        onQuayLai: () => void }) {
  const { y, dv } = props;
  const hienToast = useToast();
  const [xacNhan, datXacNhan] = useState(false);
  const [dangHuy, datDangHuy] = useState(false);
  const docLai = useCallback(async () => {
    if (!dv) return;
    try { props.onDoi(await dv.doc(y.id)); } catch { /* giữ màn đang có */ }
  }, [dv, y.id, props]);
  useQuayLaiTuNen(() => { void docLai(); });

  const huy = async () => {
    if (!dv) return;
    if (!xacNhan) { datXacNhan(true); return; }
    datDangHuy(true);
    try {
      props.onDaHuy(await dv.huy(y.id));
    } catch (e) {
      datXacNhan(false);
      hienToast(cauBaoLoi(e), 'loi');
      if (e instanceof LoiNguoiDung) await docLai(); // YC9 Trạng thái màn: yêu cầu vừa đổi ở máy khác
    } finally {
      datDangHuy(false);
    }
  };

  const daXoa = y.chu.daXoa;
  const zalo = daXoa ? null : duongDanZalo(y.chu.soDienThoai);
  const goi = daXoa ? null : duongDanGoi(y.chu.soDienThoai);
  const cho = y.trangThai === 'cho';
  return (
    <div className="man man-chu s3yc" data-man="S3-03">
      <DaiMatKetNoi />
      <DauMan tieuDe="Chờ chủ nhà trả lời" onQuayLai={props.onQuayLai} />
      <div className="chu-than s3yc-than">
        <TheCan ten={tieuDeCan(y)} tenChu={y.chu.ten} tu={y.ngayNhan} den={y.ngayTra} giaBan={y.tongGiaBan} giaChu={y.tongGiaChu} />
        {cho ? (
          <section className="s3yc-bao s3yc-bao--cho">
            <span className="s3yc-bao-tieu-de">{chuChoChu(y.chu.ten)}</span>
            <span className="s3yc-bao-chu">{chuDaGuiLuc(y.guiLuc)}</span>
          </section>
        ) : (
          <section className="s3yc-bao" role="status"><span className="s3yc-bao-tieu-de">{CHU_TRANG_THAI[y.trangThai]}</span></section>
        )}
        {zalo && <a className="hh-btn hh-btn--primary hh-btn--block s3yc-nut" href={zalo} target="_blank" rel="noopener noreferrer">Nhắn chủ nhà qua Zalo</a>}
        {goi && <a className="hh-btn hh-btn--secondary hh-btn--block s3yc-nut" href={goi}>Gọi chủ nhà</a>}
        {cho && dv && (
          <button type="button" className={'hh-btn hh-btn--text hh-btn--block s3yc-huy' + (xacNhan ? ' s3yc-huy--xac-nhan' : '')}
                  disabled={dangHuy} onClick={() => void huy()}>
            {xacNhan ? 'Xác nhận hủy yêu cầu?' : 'Hủy yêu cầu'}
          </button>
        )}
      </div>
    </div>
  );
}

/** S3-08 (YC9.1 bước 4, YC9.1-NT7). */
function ManDaHuy(props: { y: YeuCauCuaToi; onVeLich: () => void }) {
  const { y } = props;
  return (
    <div className="man man-chu s3yc" data-man="S3-08">
      <DaiMatKetNoi />
      <DauMan tieuDe="Yêu cầu đặt phòng" />
      <div className="chu-than s3yc-than">
        <TheCan ten={tieuDeCan(y)} tenChu={y.chu.ten} tu={y.ngayNhan} den={y.ngayTra} giaBan={y.tongGiaBan} giaChu={y.tongGiaChu} />
        <section className="s3yc-bao" role="status">
          <span className="s3yc-bao-tieu-de">Đã hủy yêu cầu</span>
          <span className="s3yc-bao-chu">{chuDaHuy(y.chu.ten, y.ngayNhan, y.ngayTra)}</span>
        </section>
        <button type="button" className="hh-btn hh-btn--secondary hh-btn--block s3yc-nut" onClick={props.onVeLich}>Về lịch phòng</button>
      </div>
    </div>
  );
}

/** S3-07 (YC9.1 bước 3a, YC9.1-NT5): lịch tải lại từ ngày trước ngày nhận tới ngày trả. */
function BaoDaDat(props: { ct: ChiTietCanSale; dem: Ngay[]; dvCt?: DichVuChiTietCanSale; onTimCanKhac: () => void }) {
  const { ct, dvCt } = props;
  const [o, datO] = useState<OQuanh[] | null>(null);
  useEffect(() => {
    if (!dvCt) return;
    let con = true;
    dvCt.doc(ct.canId, congNgay(ct.tu, -1), congNgay(ct.den, 1)).then((kq) => {
      if (con && !kq.khongConQuyen) datO(oQuanhKhoang(kq.lich, kq.dem, ct.tu, ct.den));
    }, () => undefined);
    return () => { con = false; };
  }, [dvCt, ct.canId, ct.tu, ct.den]);
  return (
    <section className="s3yc-bao s3yc-bao--loi" role="alert">
      <span className="s3yc-bao-tieu-de"><span aria-hidden="true">⚠️ </span><span>{CAU_DA_DAT}</span></span>
      <span className="s3yc-bao-chu">{chuDemKin(props.dem)}{o ? ' Lịch của căn đã tải lại:' : ''}</span>
      {o && (
        <div className="s3yc-o-hang">
          {o.map((x) => (
            <div key={x.ngay} data-testid="o-moi" className={'s3yc-o' + (x.kin ? ' s3yc-o--kin' : '')}>
              <span className="s3yc-o-thu">{x.thu}</span><span className="s3yc-o-so">{x.so}</span>
              <span className="s3yc-o-chu">{x.chu}</span>
            </div>
          ))}
        </div>
      )}
      <button type="button" className="hh-btn hh-btn--secondary hh-btn--block s3yc-nut" onClick={props.onTimCanKhac}>Tìm căn khác cùng ngày</button>
    </section>
  );
}

/** YC9.1 bước 1 đến 4: S3-02 rồi S3-03, S3-07, S3-08. dv thiếu (chưa nối dịch vụ) thì nút gửi báo câu tạm. */
export function S3GuiYeuCau(props: {
  ct: ChiTietCanSale; dv?: DichVuYeuCau; dvCt?: DichVuChiTietCanSale;
  onQuayLai: () => void; onVeLich: () => void; onTimCanKhac: (tu: Ngay, den: Ngay) => void;
}) {
  const { ct, dv } = props;
  const [buoc, datBuoc] = useState<Buoc>({ loai: 'soan' });
  const [loiNhan, datLoiNhan] = useState('');
  const [loi, datLoi] = useState<string | null>(null);
  const [dangGui, datDangGui] = useState(false);
  const ma = useRef(taoMaLanGui());

  if (buoc.loai === 'cho') {
    return <ManCho y={buoc.y} dv={dv} onQuayLai={props.onQuayLai}
                   onDaHuy={(y) => datBuoc({ loai: 'da-huy', y })} onDoi={(y) => datBuoc(buocTheo(y))} />;
  }
  if (buoc.loai === 'ket-qua') {
    return <S3KetQuaYeuCau id={buoc.y.id} dv={dv} ban={buoc.y} onQuayLai={props.onQuayLai} onVeLich={props.onVeLich}
                           onXemTatCa={props.onTimCanKhac} />;
  }
  if (buoc.loai === 'da-huy') return <ManDaHuy y={buoc.y} onVeLich={props.onVeLich} />;

  const gui = async () => {
    const sai = kiemLoiNhan(loiNhan);
    if (sai) { datLoi(sai); return; }
    if (!dv) { datLoi('Gửi yêu cầu sẽ có ở bản sau'); return; }
    datLoi(null);
    datDangGui(true);
    try {
      const y = await dv.gui({ canId: ct.canId, tu: ct.tu, den: ct.den, loiNhan, clientId: ma.current });
      datBuoc(buocTheo(y));
    } catch (e) {
      if (e instanceof LoiDaDat) datBuoc({ loai: 'da-dat', dem: e.dem });
      else datLoi(cauBaoLoi(e));
    } finally {
      datDangGui(false);
    }
  };

  const daDat = buoc.loai === 'da-dat';
  return (
    <div className="man man-chu s3yc" data-man={daDat ? 'S3-07' : 'S3-02'} data-can={ct.canId} data-tu={ct.tu} data-den={ct.den}>
      <DaiMatKetNoi />
      <DauMan tieuDe="Gửi yêu cầu đặt phòng" onQuayLai={props.onQuayLai} />
      <div className="chu-than s3yc-than">
        <TheCan ten={tieuDeCan(ct)} tenChu={ct.chu.ten} tu={ct.tu} den={ct.den} giaBan={ct.tongGiaBan} giaChu={ct.tongGiaChu} />
        <section className="s3yc-the" aria-label="Yêu cầu">
          <span className="s3yc-dong-dam">{chuTomTat(ct, ct.tu, ct.den)}</span>
          <span className="s3yc-dong">{chuChuNhaGia(ct.chu.ten, ct.tongGiaChu)}</span>
          <label className="s3yc-o-nhap">
            <span className="s3yc-nhan">Nhắn chủ nhà (không bắt buộc)</span>
            <textarea rows={3} value={loiNhan} disabled={daDat} onChange={(e) => { datLoiNhan(e.target.value); datLoi(null); }} />
          </label>
          {loi && <p className="s3yc-loi" role="alert">{loi}</p>}
        </section>
        {daDat && buoc.loai === 'da-dat' && (
          <BaoDaDat ct={ct} dem={buoc.dem} dvCt={props.dvCt} onTimCanKhac={() => props.onTimCanKhac(ct.tu, ct.den)} />
        )}
      </div>
      {!daDat && (
        <div className="s3yc-chan">
          <button type="button" className="hh-btn hh-btn--primary hh-btn--block" disabled={dangGui} onClick={() => void gui()}>
            Gửi yêu cầu đặt phòng
          </button>
          <span className="s3yc-ghi">{CAU_GHI_S302}</span>
        </div>
      )}
    </div>
  );
}
