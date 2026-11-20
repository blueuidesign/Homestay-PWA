// CN9 Yêu cầu đặt phòng, bước chọn lý do từ chối, CN9-02 Đã chấp nhận, CN9-03 Đã từ chối (YC9.2 bước 2 đến 5, US51).
// YC9-H4, H5, H6, H10, PQ10.CHU, PQ11.CHU, PQ2.CHU, HV1, HV2, HV3, HV5. Mở từ "Xem và trả lời" ở CN1-03 hay từ thông báo.
// Chỉ có giá của chủ nhà; dữ liệu không mang giá bán (database không trả).
import { useCallback, useEffect, useState } from 'react';
import { KhungXam } from '../chung/dangTai';
import { cauBaoLoi, DaiMatKetNoi, LoiNguoiDung, ManChuaTai } from '../chung/matKetNoi';
import { useQuayLaiTuNen } from '../chung/nhap';
import { useToast } from '../chung/Toast';
import { duongDanGoi } from '../lib/chiTietCanSale';
import type { DichVuTraLoiYeuCau } from '../lib/dichVuTraLoiYeuCau';
import { vietTien } from '../lib/tien';
import {
  CAU_DA_DOI_TRANG_THAI, CHU_TRANG_THAI_CN9, LY_DO_TU_CHOI, cauDaNhan, cauDaTuChoi, cauDaVaoLich, cauTuChoiPhu, chuCaiDau, chuNgayO,
  dongSaleCN9, type LyDoTuChoi, type YeuCauChoChu,
} from '../lib/traLoiYeuCau';
import { ICON_QUAY_LAI } from './CN704ChiTietSale';
import { Icon } from './TabChu';
import './CN9TraLoiYeuCau.css';

const ICON_GOI = <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />;

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

function Hang(props: { nhan: string; testId: string; children: string }) {
  return (
    <div className="cn9-hang" data-testid={props.testId}>
      <span>{props.nhan}</span><span className="cn9-hang-gia-tri">{props.children}</span>
    </div>
  );
}

/** Phòng, Ngày ở, Giá của bạn (CN9, CN9-02, CN9-03); kèm Sale ở CN9-02, CN9-03. */
function CacHang(props: { y: YeuCauChoChu; coSale?: boolean }) {
  const { y } = props;
  return (
    <div className="cn9-cac-hang">
      <Hang nhan="Phòng" testId="cn9-phong">{y.maCan}</Hang>
      <Hang nhan="Ngày ở" testId="cn9-ngay">{chuNgayO(y.ngayNhan, y.ngayTra)}</Hang>
      {y.tongGiaChu != null && <Hang nhan="Giá của bạn" testId="cn9-gia">{vietTien(y.tongGiaChu)}</Hang>}
      {props.coSale && <Hang nhan="Sale" testId="cn9-sale">{y.tenSale}</Hang>}
    </div>
  );
}

type Buoc = 'xem' | 'tu-choi' | 'da-chot' | 'da-tu-choi';

const buocTheo = (y: YeuCauChoChu): Buoc => (y.trangThai === 'da_chot' ? 'da-chot' : y.trangThai === 'bi_tu_choi' ? 'da-tu-choi' : 'xem');

export function CN9TraLoiYeuCau(props: {
  id: string; dv?: DichVuTraLoiYeuCau;
  onQuayLai: () => void; onVeLich: () => void; onXemDatPhong: (bookingId: string) => void;
}) {
  const { dv, id } = props;
  const hienToast = useToast();
  const [y, datY] = useState<YeuCauChoChu | null>(null);
  const [loi, datLoi] = useState(false);
  const [khongCon, datKhongCon] = useState(false);
  const [buoc, datBuoc] = useState<Buoc>('xem');
  const [lyDo, datLyDo] = useState<LyDoTuChoi | null>(null);
  const [dangGui, datDangGui] = useState(false);
  const [bao, datBao] = useState<string | null>(null);

  const tai = useCallback(async () => {
    if (!dv) { datLoi(true); return; }
    datLoi(false);
    try {
      const d = await dv.doc(id);
      datY(d);
      datBuoc((b) => (b === 'tu-choi' && d.trangThai === 'cho' ? b : buocTheo(d)));
    } catch (e) {
      if (e instanceof LoiNguoiDung) datKhongCon(true); // HV5
      else datLoi(true);
    }
  }, [dv, id]);
  useEffect(() => { void tai(); }, [tai]);
  // HV3: quay lại từ nền thì đọc lại trạng thái yêu cầu.
  useQuayLaiTuNen(() => { if (y?.trangThai === 'cho') void tai(); });

  const traLoi = async (lam: () => Promise<{ y: YeuCauChoChu; doiTrangThai: boolean }>) => {
    datDangGui(true);
    datBao(null);
    try {
      const kq = await lam();
      datY(kq.y);
      datBuoc(buocTheo(kq.y));
      datLyDo(null);
      if (kq.doiTrangThai) {
        // YC9 "Trạng thái màn", YC9.2-NT5, NT10: yêu cầu vừa đổi ở máy khác.
        hienToast(CAU_DA_DOI_TRANG_THAI, 'loi');
        datBao(CAU_DA_DOI_TRANG_THAI);
        if (kq.y.trangThai === 'da_chot' || kq.y.trangThai === 'bi_tu_choi') datBuoc('xem');
      }
    } catch (e) {
      // YC9-H4, YC9.2-NT9: câu của database; chủ nhà vẫn từ chối được.
      const cau = cauBaoLoi(e);
      hienToast(cau, 'loi');
      datBao(cau);
    } finally {
      datDangGui(false);
    }
  };

  if (khongCon) {
    return (
      <div className="man man-chu cn9" data-testid="cn9" data-man="CN9">
        <DaiMatKetNoi />
        <DauMan tieuDe="Yêu cầu đặt phòng" onQuayLai={props.onQuayLai} />
        <div className="chu-than cn9-than"><p className="cn9-bao" role="alert">Không tìm thấy yêu cầu</p></div>
      </div>
    );
  }
  if (!y) {
    return (
      <div className="man man-chu cn9" data-testid="cn9" data-man="CN9">
        <DaiMatKetNoi />
        <DauMan tieuDe="Yêu cầu đặt phòng" onQuayLai={props.onQuayLai} />
        <div className="chu-than cn9-than">{loi ? <ManChuaTai onThuLai={() => void tai()} /> : <KhungXam />}</div>
      </div>
    );
  }

  if (buoc === 'da-chot') {
    return (
      <div className="man man-chu cn9" data-testid="cn9" data-man="CN9-02">
        <DaiMatKetNoi />
        <DauMan tieuDe="Đã chấp nhận" />
        <div className="chu-than cn9-than">
          <section className="cn9-xong cn9-xong--nhan" role="status">
            <span className="cn9-xong-tieu-de">✓ {cauDaNhan(y.maCan)}</span>
            <span className="cn9-xong-chu">{cauDaVaoLich(y.tenSale)}</span>
          </section>
          <section className="cn9-the"><CacHang y={y} coSale /></section>
        </div>
        <div className="cn9-chan">
          {y.bookingId && (
            <button type="button" className="hh-btn hh-btn--primary hh-btn--block" onClick={() => props.onXemDatPhong(y.bookingId!)}>Xem đặt phòng</button>
          )}
          <button type="button" className="hh-btn hh-btn--secondary hh-btn--block" onClick={props.onVeLich}>Về lịch</button>
        </div>
      </div>
    );
  }

  if (buoc === 'da-tu-choi') {
    return (
      <div className="man man-chu cn9" data-testid="cn9" data-man="CN9-03">
        <DaiMatKetNoi />
        <DauMan tieuDe="Đã từ chối" />
        <div className="chu-than cn9-than">
          <section className="cn9-xong" role="status">
            <span className="cn9-xong-tieu-de">{cauDaTuChoi(y.tenSale)}</span>
            <span className="cn9-xong-chu">{cauTuChoiPhu(y.tenSale, y.lyDoTuChoi, y.ngayNhan, y.ngayTra)}</span>
          </section>
          <section className="cn9-the"><CacHang y={y} coSale /></section>
        </div>
        <div className="cn9-chan">
          <button type="button" className="hh-btn hh-btn--secondary hh-btn--block" onClick={props.onVeLich}>Về lịch</button>
        </div>
      </div>
    );
  }

  const cho = y.trangThai === 'cho';
  const goi = duongDanGoi(y.sdtSale);
  return (
    <div className="man man-chu cn9" data-testid="cn9" data-man="CN9" data-yeu-cau={y.id}>
      <DaiMatKetNoi />
      <DauMan tieuDe="Yêu cầu đặt phòng" onQuayLai={buoc === 'tu-choi' ? undefined : props.onQuayLai} />
      <div className="chu-than cn9-than">
        {y.trangThai === 'da_huy' ? (
          <section className="cn9-the" role="status"><span className="cn9-chu">{CHU_TRANG_THAI_CN9.da_huy}</span></section>
        ) : (
          <>
            <section className="cn9-the">
              <div className="cn9-sale">
                <span className="cn9-chu-dau" aria-hidden="true">{chuCaiDau(y.tenSale)}</span>
                <div className="cn9-sale-giua">
                  <span className="cn9-sale-ten">{y.tenSale}</span>
                  <span className="cn9-sale-phu">{dongSaleCN9(y)}</span>
                </div>
                {goi && <a className="hh-btn hh-btn--secondary hh-btn--pill cn9-goi" href={goi}><Icon>{ICON_GOI}</Icon>Gọi</a>}
              </div>
              <div className="cn9-ke"><CacHang y={y} /></div>
            </section>
            {y.loiNhan && (
              <section className="cn9-the cn9-nhan">
                <span className="cn9-nhan-tieu-de">Sale nhắn</span>
                <span className="cn9-chu">{y.loiNhan}</span>
              </section>
            )}
            {!cho && <section className="cn9-the" role="status"><span className="cn9-chu">{CHU_TRANG_THAI_CN9[y.trangThai]}</span></section>}
          </>
        )}
        {bao && <p className="cn9-bao" role="alert">{bao}</p>}
        {cho && buoc === 'tu-choi' && (
          <section className="cn9-the" aria-label="Lý do từ chối">
            <span className="cn9-nhan-tieu-de">Lý do (không bắt buộc)</span>
            <div className="cn9-chips" role="group" aria-label="Lý do">
              {LY_DO_TU_CHOI.map((l) => (
                <button key={l} type="button" aria-pressed={lyDo === l} className={'hh-chip hh-chip--neutral' + (lyDo === l ? ' hh-chip--on' : '')}
                        onClick={() => datLyDo(lyDo === l ? null : l)}>{l}</button>
              ))}
            </div>
          </section>
        )}
      </div>
      {cho && dv && (
        <div className="cn9-chan">
          {buoc === 'tu-choi' ? (
            <>
              <button type="button" className="hh-btn hh-btn--primary hh-btn--block" disabled={dangGui}
                      onClick={() => void traLoi(() => dv.tuChoi(y.id, lyDo))}>Gửi từ chối cho sale</button>
              <button type="button" className="hh-btn hh-btn--secondary hh-btn--block" onClick={() => { datBuoc('xem'); datLyDo(null); }}>Quay lại</button>
            </>
          ) : (
            <>
              <button type="button" className="hh-btn hh-btn--primary hh-btn--block" disabled={dangGui}
                      onClick={() => void traLoi(() => dv.chapNhan(y.id))}>Chấp nhận đặt phòng</button>
              <button type="button" className="hh-btn hh-btn--secondary hh-btn--block" disabled={dangGui}
                      onClick={() => { datBao(null); datBuoc('tu-choi'); }}>Từ chối</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
