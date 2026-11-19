// A8 · Lời mời xem lịch, A8-01 · link không dùng được, và màn của link xin lịch /x/<mã> khi đã đăng nhập (YC6.5 bước 1 đến 4,
// YC6-H12, H17, H18, QD7, PQ1.CHU, PQ2.CHU, PQ18.CHU, HV5). Xem trước qua fn_xem_link_xin_lich; "Đồng ý cho xem lịch" qua
// fn_dong_y_xin_lich; "Từ chối" không ghi gì. Trạng thái: HV1 khung xám, HV2 Thử lại, HV5 A8-01, HV8 toast.
import { useCallback, useEffect, useState } from 'react';
import { KhungXam, NutGhi } from '../chung/dangTai';
import { cauBaoLoi, LoiNguoiDung, ManChuaTai } from '../chung/matKetNoi';
import { useToast } from '../chung/Toast';
import type { DichVuXinLich, KetQuaDongY, LoiXin } from '../lib/dichVuXinLich';
import { vietSoDienThoai } from '../lib/lich';
import { chuDau } from './CN704ChiTietSale';
import './CN7DanhSachSale.css'; // .cn7-switch
import './A8LoiMoiXemLich.css';

/** HV5, canvas A8-01: câu báo không có tên, số của sale. */
export const CAU_A801 = 'Link xin lịch đã hết hạn, sale đã xóa tài khoản, hoặc bạn đã ngừng cho sale này xem lịch.';

function DauA8() {
  return (
    <header className="a8-dau">
      <h1 className="a8-tieu-de">Lời mời xem lịch</h1>
    </header>
  );
}

/** Dấu tích trước mỗi dòng "sale sẽ thấy" (canvas A8). */
function Tich() {
  return (
    <svg className="a8-tich" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"
         strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

/** YC6.5 bước 1, YC6.5-NT1, NT2, QD7: tên, số sale (nếu sale đã cho), công tắc "Tình trạng cọc" bật sẵn, hai nút. */
export function A8LoiMoiXemLich(props: {
  loiXin: Extract<LoiXin, { trangThai: 'hop_le' }>;
  onDongY: (xemCoc: boolean) => Promise<unknown>;
  onTuChoi: () => void;
}) {
  const x = props.loiXin;
  const [xemCoc, datXemCoc] = useState(true);
  return (
    <main className="man a8">
      <DauA8 />
      <div className="a8-than">
        <section className="a8-the a8-sale" aria-label="Sale xin xem lịch">
          <span className="a8-tron" aria-hidden="true">{chuDau(x.tenSale)}</span>
          <b className="a8-ten">{x.tenSale}</b>
          {x.soDienThoai && <span className="a8-so">{vietSoDienThoai(x.soDienThoai)}</span>}
          <span className="a8-cau">xin xem lịch phòng trống của bạn để gửi khách.</span>
        </section>
        <section className="a8-the" aria-label="Sale sẽ thấy">
          <h2 className="a8-muc">{`Nếu đồng ý, ${x.tenSale} sẽ thấy`}</h2>
          <ul className="a8-thay">
            <li><Tich /><span>Phòng trống hay đã có người đặt, không thấy tên người đặt</span></li>
            <li><Tich /><span>Giá từng đêm</span></li>
          </ul>
          <div className="a8-cong-tac">
            <span className="a8-cong-tac-chu">
              <span className="a8-cong-tac-ten" id="a8-coc">Tình trạng cọc</span>
              <span className="a8-phu">Đã cọc hay chưa (không thấy số tiền)</span>
            </span>
            <button type="button" role="switch" aria-checked={xemCoc} aria-labelledby="a8-coc"
                    className={'cn7-switch' + (xemCoc ? ' cn7-switch--bat' : '')} onClick={() => datXemCoc((v) => !v)}>
              <span className="cn7-switch-nut" aria-hidden="true" />
            </button>
          </div>
          <span className="a8-phu">Không bao giờ thấy tên, số điện thoại khách và doanh thu. Đổi được trong mục Sale.</span>
        </section>
      </div>
      <div className="a8-chan">
        <NutGhi chu="Đồng ý cho xem lịch" chuDangGhi="Đang lưu…" lop="hh-btn hh-btn--primary hh-btn--block"
                onGhi={() => props.onDongY(xemCoc)} />
        <button type="button" className="hh-btn hh-btn--secondary hh-btn--block" onClick={props.onTuChoi}>Từ chối</button>
      </div>
    </main>
  );
}

/** YC6.5 bước 4, YC6.5-NT4, NT7, HV5: A8-01. */
export function A801KhongDungDuoc(props: { onVeLich: () => void }) {
  return (
    <main className="man a8">
      <DauA8 />
      <div className="a8-than">
        <section className="a8-the a8-sale" role="alert">
          <b className="a8-ten-nho">Bạn không còn xem được mục này</b>
          <span className="a8-cau">{CAU_A801}</span>
        </section>
        <button type="button" className="hh-btn hh-btn--secondary hh-btn--block" onClick={props.onVeLich}>Về Lịch</button>
      </div>
    </main>
  );
}

/** Màn của /x/<mã> khi đã đăng nhập: A8, hay A8-01 khi link không dùng được. */
export function ManLinkXinLich(props: {
  ma: string;
  dv: DichVuXinLich | null | undefined;
  onVeLich: () => void;
  /** YC6.5 bước 3: về tab Sale, không ghi gì. */
  onTuChoi: () => void;
  /** YC6.5 bước 2: nơi gọi về tab Sale với toast, hay A4-01 khi chưa có căn. */
  onDaDongY: (kq: KetQuaDongY) => unknown;
}) {
  const { dv, ma } = props;
  const hienToast = useToast();
  const [lx, datLx] = useState<LoiXin | undefined>(undefined);
  const [loi, datLoi] = useState(false);

  const tai = useCallback(async () => {
    if (!dv?.xemLoiXin) { datLoi(true); return; }
    datLoi(false);
    try {
      datLx(await dv.xemLoiXin(ma));
    } catch {
      datLoi(true);
    }
  }, [dv, ma]);
  useEffect(() => { void tai(); }, [tai]);

  if (lx === undefined) return loi ? <main className="man"><ManChuaTai onThuLai={() => void tai()} /></main> : <KhungXam />;
  if (lx.trangThai !== 'hop_le') return <A801KhongDungDuoc onVeLich={props.onVeLich} />;

  const dongY = async (xemCoc: boolean) => {
    if (!dv?.dongY) return;
    try {
      await props.onDaDongY(await dv.dongY(ma, xemCoc));
    } catch (e) {
      if (e instanceof LoiNguoiDung) { await tai(); return; } // link vừa hỏng: đọc lại để hiện A8-01
      hienToast(cauBaoLoi(e), 'loi');
    }
  };
  return <A8LoiMoiXemLich loiXin={lx} onDongY={dongY} onTuChoi={props.onTuChoi} />;
}
