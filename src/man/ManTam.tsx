// Tab Lịch bản tạm (US1: tiêu đề "Lịch" và vai đang dùng; A4, A5 làm ở YC3.1, YC7.1) và màn link (US37), đủ để luồng YC1 chạy.
// US38, YC6.4: sale chưa có nguồn phòng thấy A5, A6, A7, A7-00, A7-01.
// US43, YC7.1 bước 1, 2 (YC7-H8): có dịch vụ lịch của sale thì đọc lịch 7 ngày; có ít nhất một căn thì S1, không thì A5, A7.
import { useCallback, useEffect, useRef, useState } from 'react';
import { KhungXam } from '../chung/dangTai';
import { CAU_CHUA_TAI, ManChuaTai } from '../chung/matKetNoi';
import { useQuayLaiTuNen } from '../chung/nhap';
import { useToast } from '../chung/Toast';
import type { Vai } from '../lib/dieuHuong';
import { chonManXinLich, type DichVuXinLich, type SoDemXinLich } from '../lib/dichVuXinLich';
import type { DichVuLichSale } from '../lib/dichVuLichSale';
import type { DongLichSale } from '../lib/lichSale';
import { congNgay, homNay as homNayVN, type Ngay } from '../lib/ngay';
import { A5ChuaCoNguon, KhungLichSale } from './A5ChuaCoNguon';
import { A6XinLich } from './A6XinLich';
import { A7ChoChuNha } from './A7ChoChuNha';
import { S1LichSale } from './S1LichSale';

export const TEN_VAI: Record<Vai, string> = { chu_nha: 'Chủ nhà', sale: 'Sale' };

/** US56 chưa làm: "Thêm căn thủ công", "Thêm căn tự nhập" báo tạm. */
export const CAU_THEM_CAN_SE_CO = 'Thêm căn tự nhập sẽ có ở bản sau';

/** YC1.1 bước 5, 6: tab Lịch của vai đã chọn. Sale có dịch vụ link xin lịch thì qua ManXinLich (YC6.4). */
export function ManLich(props: {
  vai: Vai | null; onDangXuat: () => void; ten?: string | null; dv?: DichVuXinLich;
  /** YC7.1: lịch 7 ngày của sale (src/lib/dichVuLichSale.ts). Thiếu thì sale đã có nguồn thấy bản tạm. */
  dvLich?: DichVuLichSale;
  /** YC7.1 bước 8: S1-05 báo khung tab ẩn thanh tab. */
  onXoay?: (ngang: boolean) => void;
}) {
  if (props.vai === 'sale' && props.dv) {
    return <ManXinLich dv={props.dv} dvLich={props.dvLich} ten={props.ten} onDangXuat={props.onDangXuat} onXoay={props.onXoay} />;
  }
  return <LichTam vai={props.vai} onDangXuat={props.onDangXuat} />;
}

function LichTam(props: { vai: Vai | null; onDangXuat: () => void }) {
  return (
    <main className="man man-tam">
      <h1 className="man-tieu-de">Lịch</h1>
      {props.vai && <p className="dong-phu">{TEN_VAI[props.vai]}</p>}
      <button type="button" className="hh-btn hh-btn--text" onClick={props.onDangXuat}>Đăng xuất</button>
    </main>
  );
}

/** YC7.1 bước 2, 6, HV1, HV3: lịch 7 ngày từ `tu`. Đọc lỗi khi đã có dữ liệu thì giữ dữ liệu cũ (HV2). */
function useLichSale(dv: DichVuLichSale | undefined, tu: Ngay) {
  const [kq, datKq] = useState<{ tu: Ngay; dong: DongLichSale[] } | undefined>(undefined);
  const [dangTai, datDangTai] = useState(false);
  const [loi, datLoi] = useState(false);
  const lan = useRef(0);
  const tai = useCallback(async () => {
    if (!dv) return;
    const so = ++lan.current;
    datDangTai(true);
    datLoi(false);
    try {
      const dong = await dv.doc(tu, congNgay(tu, 7));
      if (so === lan.current) datKq({ tu, dong });
    } catch {
      if (so === lan.current) datLoi(true);
    } finally {
      if (so === lan.current) datDangTai(false);
    }
  }, [dv, tu]);
  useEffect(() => { void tai(); }, [tai]);
  return { kq, dangTai, loi, tai };
}

/**
 * YC6.4 bước 1 đến 5, YC7.1 bước 1, 2, HV1, HV2, HV3: đọc lịch của sale và số đếm xin lịch; có căn thì S1. Chưa có căn:
 * A5 khi chưa mở A6 lần nào, A7-00 khi chưa gửi, A7 khi đã gửi, A7-01 ngay sau khi chia sẻ. Quay lại từ nền thì đọc lại.
 */
function ManXinLich(props: {
  dv: DichVuXinLich; dvLich?: DichVuLichSale; ten?: string | null; onDangXuat: () => void; onXoay?: (ngang: boolean) => void;
}) {
  const { dv } = props;
  const hienToast = useToast();
  const [so, datSo] = useState<SoDemXinLich | undefined>(undefined);
  const [loi, datLoi] = useState(false);
  const [moA6, datMoA6] = useState(false);
  const [vuaGui, datVuaGui] = useState(false);
  const [homNay] = useState(() => homNayVN());
  const [tu, datTu] = useState<Ngay>(homNay);
  const lich = useLichSale(props.dvLich, tu);

  const tai = useCallback(async () => {
    datLoi(false);
    try {
      datSo(await dv.doc());
    } catch {
      datLoi(true);
    }
  }, [dv]);
  useEffect(() => { void tai(); }, [tai]);
  const taiLich = lich.tai;
  // HV2: lùi, tiến không đọc được thì giữ khoảng đang hiện và báo.
  const kqTu = lich.kq?.tu;
  useEffect(() => {
    if (lich.loi && kqTu && kqTu !== tu) { datTu(kqTu); hienToast(CAU_CHUA_TAI, 'loi'); }
  }, [lich.loi, kqTu, tu, hienToast]);
  useQuayLaiTuNen(() => { void tai(); void taiLich(); });

  // Bản tạm: tab Cá nhân của sale chưa làm (YC9), giữ vai và Đăng xuất ở chân màn chưa có căn.
  const chan = (
    <div className="xl-chan">
      <p className="dong-phu">Sale</p>
      <button type="button" className="hh-btn hh-btn--text" onClick={props.onDangXuat}>Đăng xuất</button>
    </div>
  );

  if (moA6) {
    return (
      <A6XinLich ten={props.ten} dv={dv}
                 onQuayLai={() => { datMoA6(false); datVuaGui(false); void tai(); }}
                 onDaGui={() => { datMoA6(false); datVuaGui(true); void tai(); }} />
    );
  }
  // YC7.1 bước 2, YC7-H8: có ít nhất một căn (căn của tôi, căn tự nhập, căn nguồn) thì S1.
  if (props.dvLich && lich.kq && lich.kq.dong.length > 0) {
    return (
      <S1LichSale tu={lich.kq.tu} homNay={homNay} dong={lich.kq.dong} dangTai={lich.dangTai || lich.kq.tu !== tu}
                  onDoiNgay={(n) => datTu((t) => congNgay(t, n))} onXoay={props.onXoay} />
    );
  }
  const dangDocLich = !!props.dvLich && !lich.kq && !lich.loi;
  const hong = loi || (!!props.dvLich && lich.loi && !lich.kq);
  if (!so || dangDocLich || hong) {
    return (
      <KhungLichSale chan={chan}>
        {hong ? <ManChuaTai onThuLai={() => { void tai(); void taiLich(); }} /> : <KhungXam />}
      </KhungLichSale>
    );
  }
  const man = chonManXinLich(so);
  if (man === 'co-nguon' && !props.dvLich) return <LichTam vai="sale" onDangXuat={props.onDangXuat} />;
  const moXin = () => datMoA6(true);
  const themCan = () => hienToast(CAU_THEM_CAN_SE_CO);
  // Có kết nối mà chưa có căn nào (chủ nhà chưa có căn): vẫn là màn chưa có căn (YC7.1 bước 1).
  if (man === 'A5' || (man === 'co-nguon' && so.ma === null)) return <A5ChuaCoNguon onXinLich={moXin} onThemCan={themCan} chan={chan} />;
  return <A7ChoChuNha so={so} vuaGui={vuaGui} onGuiLink={moXin} onThemCan={themCan} chan={chan} />;
}

/** QD8, pwa.md P4: link mời, link xin lịch xem được khi chưa đăng nhập. Nội dung làm ở US37. */
export function XemTruocLink(props: { daDangNhap: boolean; onBatDau: () => void; onVeLich: () => void }) {
  return (
    <main className="man man-tam">
      <h1 className="man-tieu-de">Home247</h1>
      {props.daDangNhap
        ? <button type="button" className="hh-btn hh-btn--primary hh-btn--block" onClick={props.onVeLich}>Về Lịch</button>
        : <button type="button" className="hh-btn hh-btn--primary hh-btn--block" onClick={props.onBatDau}>Bắt đầu ngay</button>}
    </main>
  );
}
