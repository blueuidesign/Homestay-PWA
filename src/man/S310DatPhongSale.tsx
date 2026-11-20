// US34 · Chi tiết đặt phòng phía sale (YC5.9); S3-10 khi chủ nhà vừa sửa đặt phòng (YC5.6, canvas S3-10).
// Màn phía sale khác chưa có hình (YC5-H11): dựng theo khung S3-10 (Claude tự chốt US34). Không tiền cọc, khách chủ nhập (QD7,
// QD11). Sửa giá bán của mình (YC5.9 bước 39, PQ11.SALE). HV1 khung xám, HV2 Thử lại, HV3 đọc lại khi quay lại, HV5 lỗi quyền.
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { KhungXam } from '../chung/dangTai';
import { CAU_CHUA_LUU, cauBaoLoi, DaiMatKetNoi, LoiNguoiDung, ManChuaTai } from '../chung/matKetNoi';
import { useQuayLaiTuNen } from '../chung/nhap';
import { useToast } from '../chung/Toast';
import { tieuDeCan } from '../lib/chiTietCanSale';
import {
  CAU_DA_HUY, CAU_DA_LUU_GIA, CAU_GHI_GIUP, chenhTam, chuCoc, dongChuVaNgay, theChuSua, vietChenh, type DatPhongSale,
} from '../lib/datPhongSale';
import type { DichVuDatPhongSale } from '../lib/dichVuDatPhongSale';
import { homNay as layHomNay, type Ngay } from '../lib/ngay';
import { docSoTienGo, vietSo, vietTien } from '../lib/tien';
import { ICON_QUAY_LAI } from './CN704ChiTietSale';
import { Icon } from './TabChu';
import './S3GuiYeuCau.css';
import './S3KetQuaYeuCau.css';

export function S310DatPhongSale(props: {
  id: string; dv: DichVuDatPhongSale | undefined; homNay?: Ngay; tenTam?: string;
  onQuayLai: () => void; onVeLich?: () => void;
  /** US33: nút xin hủy (đặt phòng còn hiệu lực). */
  chanTrang?: (dp: DatPhongSale, docLai: () => void) => ReactNode;
}) {
  const nay = props.homNay ?? layHomNay();
  const { id, dv } = props;
  const [dp, datDp] = useState<DatPhongSale | null>(null);
  const [loi, datLoi] = useState<'mang' | 'khong-thay' | null>(null);
  const [sua, datSua] = useState<string | null>(null);
  const [dangLuu, datDangLuu] = useState(false);
  const [loiO, datLoiO] = useState<string | null>(null);
  const hienToast = useToast();
  const lan = useRef(0);

  const doc = useCallback(async () => {
    if (!dv) { datLoi('mang'); return; }
    const so = ++lan.current;
    try {
      const r = await dv.xem(id);
      if (so !== lan.current) return;
      datDp(r); datLoi(null);
    } catch (e) {
      if (so === lan.current) datLoi(e instanceof LoiNguoiDung ? 'khong-thay' : 'mang');
    }
  }, [dv, id]);
  useEffect(() => { void doc(); }, [doc]);
  useQuayLaiTuNen(() => { void doc(); });

  const giaGo = sua == null ? undefined : docSoTienGo(sua);
  const luu = async () => {
    if (!dv || !dp) return;
    if (giaGo == null || giaGo <= 0) { datLoiO('Giá bán phải lớn hơn 0'); return; }
    if (typeof navigator !== 'undefined' && navigator.onLine === false) { hienToast(CAU_CHUA_LUU, 'loi'); return; }
    datDangLuu(true);
    try {
      await dv.suaGiaBan(dp.id, giaGo);
      datSua(null); datLoiO(null);
      hienToast(CAU_DA_LUU_GIA);
      await doc();
    } catch (e) {
      hienToast(cauBaoLoi(e), 'loi');
    } finally {
      datDangLuu(false);
    }
  };

  let than: ReactNode;
  if (!dp) {
    than = loi === 'khong-thay' ? <p className="kqyc-trong" role="status">Không tìm thấy đặt phòng</p>
      : loi === 'mang' ? <ManChuaTai onThuLai={() => void doc()} /> : <KhungXam />;
  } else {
    const the = theChuSua(dp, nay);
    const coc = chuCoc(dp.daCoc);
    const chenh = giaGo != null && giaGo > 0 ? chenhTam(giaGo, dp.tienPhong) : dp.tienChenh;
    than = (
      <>
        <section className="s3yc-the" aria-label="Đặt phòng">
          <span className="s3yc-ten">{tieuDeCan(dp)}</span>
          <span className="s3yc-dong" data-testid="dp-chu-ngay">{dongChuVaNgay(dp)}</span>
          {coc && <span className="s3yc-dong" data-testid="dp-coc">{coc}</span>}
        </section>
        <section className="s3yc-the" aria-label="Giá">
          {sua == null ? (
            <div className="s3yc-hang" data-testid="dp-gia-ban">
              <span className="s3yc-nhan">Giá bán cho khách</span>
              <span className="s3yc-gia-ban">{vietTien(dp.giaBan)}</span>
            </div>
          ) : (
            <label className="s3yc-o-nhap">
              <span className="s3yc-nhan">Giá bán cho khách</span>
              <input className={'hh-input' + (loiO ? ' hh-input--loi' : '')} type="text" inputMode="numeric" aria-label="Giá bán cho khách"
                     value={sua} onChange={(e) => { const v = docSoTienGo(e.target.value); if (v !== undefined) { datSua(v == null ? '' : vietSo(v)); datLoiO(null); } }} />
              {loiO && <p className="s3yc-loi" role="alert">{loiO}</p>}
            </label>
          )}
          <div className="s3yc-hang" data-testid="dp-gia-chu">
            <span className="s3yc-nhan">Giá chủ nhà</span>
            <span className="s3yc-gia-chu">{vietTien(dp.tienPhong)}</span>
          </div>
          <div className="s3yc-hang" data-testid="dp-chenh">
            <span className="s3yc-nhan">Tiền chênh</span>
            <span className="s3yc-dong-dam">{vietChenh(chenh)}</span>
          </div>
          {dp.trangThai === 'hieu_luc' && (sua == null ? (
            <button type="button" className="hh-btn hh-btn--secondary hh-btn--block s3yc-nut"
                    onClick={() => { datSua(vietSo(dp.giaBan)); datLoiO(null); }}>Sửa giá bán</button>
          ) : (
            <div className="s3yc-hang">
              <button type="button" className="hh-btn hh-btn--text s3yc-nut" onClick={() => { datSua(null); datLoiO(null); }}>Hủy</button>
              <button type="button" className="hh-btn hh-btn--primary s3yc-nut" disabled={dangLuu} onClick={() => void luu()}>Lưu giá bán</button>
            </div>
          ))}
        </section>
        {dp.trangThai === 'da_huy' ? (
          <section className="s3yc-bao" role="status"><span className="s3yc-bao-tieu-de">{CAU_DA_HUY}</span></section>
        ) : the ? (
          <section className="s3yc-bao s3yc-bao--cho" role="status" data-man-phu="S3-10">
            <span className="s3yc-bao-tieu-de">{the.tieuDe}</span>
            {the.ngay && <span className="s3yc-bao-chu">Ngày: <s>{the.ngay.cu}</s> → <b>{the.ngay.moi}</b></span>}
            {the.gia && <span className="s3yc-bao-chu">Giá chủ nhà: <s>{the.gia.cu}</s> → <b>{the.gia.moi}</b></span>}
            <span className="s3yc-bao-chu">{the.cuoi}</span>
          </section>
        ) : dp.ghiGiup ? (
          <section className="s3yc-bao" role="status"><span className="s3yc-bao-chu">{CAU_GHI_GIUP(dp.tenChu)}</span></section>
        ) : null}
        {props.chanTrang?.(dp, () => void doc())}
        {dp.sdtChu && (
          <a className="hh-btn hh-btn--secondary hh-btn--block s3yc-nut" href={`tel:${dp.sdtChu}`}>Gọi {dp.tenChu}</a>
        )}
        {props.onVeLich && (
          <button type="button" className="hh-btn hh-btn--primary hh-btn--block s3yc-nut" onClick={props.onVeLich}>Về lịch phòng</button>
        )}
      </>
    );
  }
  const man = dp?.suaGanNhat && dp.trangThai === 'hieu_luc' ? 'S3-10' : 'S3-DP';
  return (
    <div className="man man-chu s3yc kqyc" data-man={man}>
      <DaiMatKetNoi />
      <header className="chu-dau">
        <button type="button" className="hh-iconbtn man-quay-lai" aria-label="Quay lại" onClick={props.onQuayLai}>
          <Icon co={22}>{ICON_QUAY_LAI}</Icon>
        </button>
        <h1 className="chu-tieu-de">{dp ? tieuDeCan(dp) : props.tenTam ?? 'Đặt phòng'}</h1>
      </header>
      <div className="chu-than s3yc-than kqyc-than">{than}</div>
    </div>
  );
}
