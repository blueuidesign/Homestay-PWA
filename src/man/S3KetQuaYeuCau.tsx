// S3-04 Chủ nhà đã chấp nhận, S3-04-01 mở từ thông báo, S3-05 Yêu cầu bị từ chối, S3-09 Yêu cầu hết hạn (YC9.4, US53).
// YC9-H5, QD7, PQ10.SALE, PQ11.SALE, HV1, HV2, HV3 (HV3-NT3: quay lại từ nền thì đọc lại trạng thái), HV5.
// Đọc qua fn_ket_qua_yeu_cau; S3-05, S3-09 có mục căn tương tự (fn_can_tuong_tu, chỉ giá bán). Chạm căn mở S3 của căn đó
// (MoCanTuongTu do ManSale cấp); "Xem tất cả căn trống" mở tìm phòng (YC7.3 cùng ngày).
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { KhungXam } from '../chung/dangTai';
import { DaiMatKetNoi, LoiNguoiDung, ManChuaTai } from '../chung/matKetNoi';
import { useQuayLaiTuNen } from '../chung/nhap';
import { chuKhoang, tieuDeCan } from '../lib/chiTietCanSale';
import type { DichVuYeuCau } from '../lib/dichVuYeuCau';
import {
  chuBiTuChoi, chuDaChapNhan, chuHetHan, manKetQua, theTuongTu, TIEU_DE_TUONG_TU, type CanTuongTu, type KetQuaYeuCau,
} from '../lib/ketQuaYeuCau';
import type { Ngay } from '../lib/ngay';
import { vietTien } from '../lib/tien';
import { chuChoChu, type YeuCauCuaToi } from '../lib/yeuCau';
import { ICON_QUAY_LAI } from './CN704ChiTietSale';
import { Icon } from './TabChu';
import './S3GuiYeuCau.css';
import './S3KetQuaYeuCau.css';

/** YC9.4 "Chạm một căn mở S3 của căn đó": ManSale cấp; thiếu thì thẻ căn tương tự không bấm được. */
export const MoCanTuongTu = createContext<((c: CanTuongTu) => void) | undefined>(undefined);

/** Số căn tương tự hiện trên màn; còn lại xem ở "Xem tất cả căn trống". */
export const SO_CAN_TUONG_TU = 3;

function tuBan(y: YeuCauCuaToi): KetQuaYeuCau {
  return { ...y, lyDoTuChoi: null, hetHanVi: null, conXemCan: true };
}

function TheYeuCau(props: { y: KetQuaYeuCau }) {
  const { y } = props;
  return (
    <>
      <section className="s3yc-the" aria-label="Căn">
        <span className="s3yc-ten" data-testid="kq-can">{tieuDeCan(y)}</span>
        <span className="s3yc-dong">{y.chu.ten} · <span data-testid="kq-khoang">{chuKhoang(y.ngayNhan, y.ngayTra)}</span></span>
      </section>
      <section className="s3yc-the" aria-label="Giá">
        <div className="s3yc-hang" data-testid="kq-gia-ban">
          <span className="s3yc-nhan">Giá bán cho khách</span>
          <span className="s3yc-gia-ban">{y.tongGiaBan == null ? '–' : vietTien(y.tongGiaBan)}</span>
        </div>
        <div className="s3yc-hang" data-testid="kq-gia-chu">
          <span className="s3yc-nhan">Giá chủ nhà</span>
          <span className="s3yc-gia-chu">{y.tongGiaChu == null ? '–' : vietTien(y.tongGiaChu)}</span>
        </div>
      </section>
    </>
  );
}

function MucTuongTu(props: { ds: CanTuongTu[] | null; tu: Ngay; den: Ngay; onXemTatCa?: (tu: Ngay, den: Ngay) => void }) {
  const moCan = useContext(MoCanTuongTu);
  const ds = props.ds;
  return (
    <section className="kqyc-tuong-tu" aria-label={TIEU_DE_TUONG_TU}>
      <h2 className="kqyc-nhom">{TIEU_DE_TUONG_TU}</h2>
      {ds == null ? <KhungXam soDong={2} /> : ds.length === 0 ? (
        <p className="kqyc-trong">Chưa có căn khác trống cùng ngày.</p>
      ) : (
        <ul className="kqyc-ds">
          {ds.slice(0, SO_CAN_TUONG_TU).map((c) => {
            const t = theTuongTu(c);
            return (
              <li key={c.canId} className="kqyc-dong" data-testid="can-tuong-tu">
                <button type="button" className="kqyc-mo" disabled={!moCan} onClick={() => moCan?.(c)}>
                  <span className="kqyc-ten">{t.ten}</span>
                  <span className="kqyc-phu">{t.phu}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
      {props.onXemTatCa && (
        <button type="button" className="hh-btn hh-btn--secondary hh-btn--block s3yc-nut"
                onClick={() => props.onXemTatCa?.(props.tu, props.den)}>Xem tất cả căn trống</button>
      )}
    </section>
  );
}

/**
 * YC9.4 bước 1 đến 4a. ban: dữ liệu đã có (từ S3-03) để hiện ngay khi dịch vụ chưa có ketQua.
 * tuThongBao: S3-04-01, nút quay lại về Thông báo.
 */
export function S3KetQuaYeuCau(props: {
  id: string; dv?: DichVuYeuCau; ban?: YeuCauCuaToi; tuThongBao?: boolean;
  onQuayLai: () => void; onVeLich: () => void; onXemTatCa?: (tu: Ngay, den: Ngay) => void;
}) {
  const { id, dv, ban } = props;
  const [kq, datKq] = useState<KetQuaYeuCau | null>(ban && !dv?.ketQua ? tuBan(ban) : null);
  const [loi, datLoi] = useState<'mang' | 'khong-thay' | null>(null);
  const [tuongTu, datTuongTu] = useState<CanTuongTu[] | null>(null);
  const lan = useRef(0);

  const doc = useCallback(async () => {
    if (!dv) return;
    const so = ++lan.current;
    try {
      const r = dv.ketQua ? await dv.ketQua(id) : tuBan(await dv.doc(id));
      if (so !== lan.current) return;
      datKq(r);
      datLoi(null);
      if ((r.trangThai === 'bi_tu_choi' || r.trangThai === 'het_han') && dv.canTuongTu) {
        dv.canTuongTu(id).then((ds) => { if (so === lan.current) datTuongTu(ds); }, () => { if (so === lan.current) datTuongTu([]); });
      }
    } catch (e) {
      if (so === lan.current) datLoi(e instanceof LoiNguoiDung ? 'khong-thay' : 'mang');
    }
  }, [dv, id]);
  useEffect(() => { void doc(); }, [doc]);
  useQuayLaiTuNen(() => { void doc(); }); // HV3-NT3

  const man = kq ? manKetQua(kq.trangThai, props.tuThongBao) : null;
  const tieuDe = kq ? tieuDeCan(kq) : 'Yêu cầu đặt phòng';
  let than;
  if (!kq) {
    than = loi === 'khong-thay' ? <p className="kqyc-trong" role="status">Không tìm thấy yêu cầu</p>
      : loi === 'mang' ? <ManChuaTai onThuLai={() => void doc()} /> : <KhungXam />;
  } else if (kq.trangThai === 'da_chot') {
    const c = chuDaChapNhan(kq.chu.ten, kq.ngayNhan, kq.ngayTra);
    than = (
      <>
        <TheYeuCau y={kq} />
        <section className="kqyc-bao kqyc-bao--chot" role="status">
          <span className="kqyc-bao-tieu-de"><span aria-hidden="true">✓ </span>{c.tieuDe}</span>
          <span className="kqyc-bao-chu">{c.chu}</span>
        </section>
        <button type="button" className="hh-btn hh-btn--primary hh-btn--block s3yc-nut" onClick={props.onVeLich}>Về lịch phòng</button>
      </>
    );
  } else if (kq.trangThai === 'bi_tu_choi' || kq.trangThai === 'het_han') {
    const tuChoi = kq.trangThai === 'bi_tu_choi';
    than = (
      <>
        <TheYeuCau y={kq} />
        <section className={'kqyc-bao ' + (tuChoi ? 'kqyc-bao--tu-choi' : 'kqyc-bao--het-han')} role="status">
          <span className="kqyc-bao-tieu-de">{tuChoi ? 'Yêu cầu bị từ chối' : 'Yêu cầu đã hết hạn'}</span>
          <span className="kqyc-bao-chu" data-testid="kq-ly-do">
            {tuChoi ? chuBiTuChoi(kq.chu.ten, kq.lyDoTuChoi, kq.ngayNhan, kq.ngayTra)
                    : chuHetHan(kq.chu.ten, kq.hetHanVi, kq.ngayNhan, kq.guiLuc)}
          </span>
        </section>
        {dv?.canTuongTu && <MucTuongTu ds={tuongTu} tu={kq.ngayNhan} den={kq.ngayTra} onXemTatCa={props.onXemTatCa} />}
      </>
    );
  } else {
    than = (
      <>
        <TheYeuCau y={kq} />
        <section className="s3yc-bao" role="status">
          <span className="s3yc-bao-tieu-de">{kq.trangThai === 'da_huy' ? 'Đã hủy yêu cầu' : chuChoChu(kq.chu.ten)}</span>
        </section>
      </>
    );
  }
  return (
    <div className="man man-chu s3yc kqyc" data-man={man ?? 'S3-KQ'} data-trang-thai={kq?.trangThai}>
      <DaiMatKetNoi />
      <header className="chu-dau">
        <button type="button" className="hh-iconbtn man-quay-lai" aria-label={props.tuThongBao ? 'Về Thông báo' : 'Quay lại'}
                onClick={props.onQuayLai}>
          <Icon co={22}>{ICON_QUAY_LAI}</Icon>
        </button>
        <h1 className="chu-tieu-de">{tieuDe}</h1>
      </header>
      <div className="chu-than s3yc-than kqyc-than">{than}</div>
    </div>
  );
}
