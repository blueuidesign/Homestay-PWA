// A10 · Thêm lịch, A10-01 · Đã có lịch của chủ nhà này, và màn của link mời /l/<mã> (YC6.3 bước 2 đến 7, YC6-H5, H10, H14, H15,
// QD8, PQ17.LINK, PQ18.LINK). Xem trước qua fn_xem_link_moi (không giá); "Thêm lịch" qua fn_them_lich_link_moi rồi về lịch với
// toast A10-02. Rời màn không bấm thì không đổi gì (bước 6). Trạng thái: HV1 khung xám, HV2 Thử lại, HV5 link hỏng, HV8 toast.
import { useCallback, useEffect, useState } from 'react';
import { KhungXam, NutGhi } from '../chung/dangTai';
import { cauBaoLoi, LoiNguoiDung, ManChuaTai } from '../chung/matKetNoi';
import { useToast } from '../chung/Toast';
import {
  CAU_LINK_CHO_SALE, CAU_LINK_CUA_MINH, moTaCanXemTruoc, tenCanXemTruoc,
  type DichVuLinkMoi, type XemTruocHopLe, type XemTruocLink,
} from '../lib/dichVuLinkMoi';
import { A1Link, TheMoi } from './A1Link';
import { chuDau } from './CN704ChiTietSale';
import './A10ThemLich.css';

function DauA10() {
  return (
    <header className="a10-dau">
      <h1 className="a10-tieu-de">Thêm lịch</h1>
    </header>
  );
}

/** YC6.3 bước 4: tên chủ nhà, số căn. */
function TheChu(props: { x: XemTruocHopLe; loiMoi: boolean }) {
  const { x } = props;
  return (
    <section className="a10-the" aria-label="Chủ nhà">
      <div className="a10-chu">
        <span className="a10-tron a10-tron--lon" aria-hidden="true">{chuDau(x.tenChu)}</span>
        <span className="a10-chu-chu">
          <b className="a10-ten">{x.tenChu}</b>
          <span className="a10-phu">{`Chủ nhà · ${x.soCan} căn`}</span>
        </span>
      </div>
      {props.loiMoi && (
        <p className="a10-cau">{`${x.tenChu} mời bạn thêm lịch các căn dưới đây. Bấm "Thêm lịch" thì các căn mới vào lịch của bạn.`}</p>
      )}
    </section>
  );
}

function DanhSachCan(props: { x: XemTruocHopLe }) {
  const { x } = props;
  return (
    <>
      <h2 className="a10-muc">{`${x.soCan} căn`}</h2>
      <ul className="a10-ds">
        {x.can.map((c) => {
          const ten = tenCanXemTruoc(c);
          return (
            <li key={ten} className="a10-can">
              {c.anh
                ? <img className="a10-anh" src={c.anh} alt={`Ảnh ${ten}`} loading="lazy" />
                : <span className="a10-anh a10-anh--trong" aria-hidden="true" />}
              <span className="a10-can-chu">
                <b className="a10-can-ten">{ten}</b>
                <span className="a10-phu">{moTaCanXemTruoc(c)}</span>
              </span>
            </li>
          );
        })}
      </ul>
    </>
  );
}

export function A10ThemLich(props: { xemTruoc: XemTruocHopLe; onThem: () => Promise<unknown>; onVeLich: () => void }) {
  const x = props.xemTruoc;
  if (x.daThem) {
    // A10-01, YC6.3 bước 7, YC6.3-NT5.
    return (
      <main className="man a10">
        <DauA10 />
        <div className="a10-than">
          <TheChu x={x} loiMoi={false} />
          <section className="a10-the a10-da-co" aria-label="Đã có lịch">
            <span className="a10-dau-xong" aria-hidden="true">✓</span>
            <b className="a10-ten">{`Bạn đã có lịch của ${x.tenChu}`}</b>
            <p className="a10-cau">{`${x.soCan} căn của ${x.tenChu} đã có trong lịch của bạn. Mở lại link không thêm lần nữa.`}</p>
            <button type="button" className="hh-btn hh-btn--primary hh-btn--block" onClick={props.onVeLich}>Xem lịch</button>
          </section>
        </div>
      </main>
    );
  }
  let chan;
  if (x.cuaMinh) {
    // YC6-H15, YC6.3-NT10.
    chan = (
      <>
        <p className="a10-cau a10-cau--giua">{CAU_LINK_CUA_MINH}</p>
        <button type="button" className="hh-btn hh-btn--secondary hh-btn--block" onClick={props.onVeLich}>Về lịch của tôi</button>
      </>
    );
  } else if (x.saiVai) {
    // YC6-H14, YC6.3-NT10.
    chan = (
      <>
        <p className="a10-cau a10-cau--giua">{CAU_LINK_CHO_SALE}</p>
        <button type="button" className="hh-btn hh-btn--secondary hh-btn--block" onClick={props.onVeLich}>Về lịch của tôi</button>
      </>
    );
  } else {
    chan = (
      <>
        <NutGhi chu={`Thêm lịch của ${x.tenChu}`} chuDangGhi="Đang thêm…" lop="hh-btn hh-btn--primary hh-btn--block" onGhi={props.onThem} />
        <span className="a10-phu a10-cau--giua">Chưa bấm thì chưa có gì vào lịch của bạn.</span>
      </>
    );
  }
  return (
    <main className="man a10">
      <DauA10 />
      <div className="a10-than">
        <TheChu x={x} loiMoi={!x.cuaMinh && !x.saiVai} />
        <DanhSachCan x={x} />
      </div>
      <div className="a10-chan">{chan}</div>
    </main>
  );
}

/** YC6-H10 khi đã đăng nhập: báo link hỏng, về lịch. */
function A10Hong(props: { xemTruoc: XemTruocLink; onVeLich: () => void }) {
  return (
    <main className="man a10">
      <DauA10 />
      <div className="a10-than">
        <TheMoi xemTruoc={props.xemTruoc} />
        <button type="button" className="hh-btn hh-btn--secondary hh-btn--block" onClick={props.onVeLich}>Về lịch của tôi</button>
      </div>
    </main>
  );
}

/** Màn của /l/<mã>: chưa đăng nhập thì A1-link (A1-link-01), đã đăng nhập thì A10 (A10-01). */
export function ManLinkMoi(props: {
  ma: string;
  daDangNhap: boolean;
  dv: DichVuLinkMoi | null | undefined;
  onBatDau: () => void;
  onVeLich: () => void;
  /** YC6.3 bước 5, A10-02: đã thêm; nơi gọi về lịch và hiện toast. */
  onDaThem: (soCan: number, tenChu: string) => void;
}) {
  const { dv, ma } = props;
  const hienToast = useToast();
  const [xt, datXt] = useState<XemTruocLink | undefined>(undefined);
  const [loi, datLoi] = useState(false);

  const tai = useCallback(async () => {
    if (!dv) { datLoi(true); return; }
    datLoi(false);
    try {
      datXt(await dv.xemTruoc(ma));
    } catch (e) {
      if (e instanceof LoiNguoiDung) hienToast(e.message, 'loi');
      datLoi(true);
    }
  }, [dv, ma, hienToast]);
  useEffect(() => { void tai(); }, [tai]);

  // Chưa đăng nhập: màn chào dùng được cả khi chưa tải được thẻ mời (HV2: thẻ có "Thử lại").
  if (!props.daDangNhap) return <A1Link xemTruoc={xt} onBatDau={props.onBatDau} onThuLai={loi ? () => void tai() : undefined} />;
  if (xt === undefined) return loi ? <main className="man"><ManChuaTai onThuLai={() => void tai()} /></main> : <KhungXam />;
  if (xt.trangThai !== 'hop_le') return <A10Hong xemTruoc={xt} onVeLich={props.onVeLich} />;

  const them = async () => {
    if (!dv) return;
    try {
      const kq = await dv.themLich(ma);
      if (kq === 'da_them') { props.onDaThem(xt.soCan, xt.tenChu); return; }
      await tai(); // 'da_co': hiện A10-01
    } catch (e) {
      hienToast(cauBaoLoi(e), 'loi');
      if (e instanceof LoiNguoiDung) await tai(); // link vừa hỏng hay đổi: đọc lại để hiện đúng màn
    }
  };
  return <A10ThemLich xemTruoc={xt} onThem={them} onVeLich={props.onVeLich} />;
}
