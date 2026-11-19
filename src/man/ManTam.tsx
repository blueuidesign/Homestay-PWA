// Tab Lịch bản tạm (US1: tiêu đề "Lịch" và vai đang dùng; A4, A5 làm ở YC3.1, YC7.1) và màn link (US37), đủ để luồng YC1 chạy.
// US38, YC6.4: sale chưa có nguồn phòng thấy A5, A6, A7, A7-00, A7-01. Sale đã có nguồn vẫn thấy bản tạm tới YC7.1.
import { useCallback, useEffect, useState } from 'react';
import { KhungXam } from '../chung/dangTai';
import { ManChuaTai } from '../chung/matKetNoi';
import { useQuayLaiTuNen } from '../chung/nhap';
import { useToast } from '../chung/Toast';
import type { Vai } from '../lib/dieuHuong';
import { chonManXinLich, type DichVuXinLich, type SoDemXinLich } from '../lib/dichVuXinLich';
import { A5ChuaCoNguon, KhungLichSale } from './A5ChuaCoNguon';
import { A6XinLich } from './A6XinLich';
import { A7ChoChuNha } from './A7ChoChuNha';

export const TEN_VAI: Record<Vai, string> = { chu_nha: 'Chủ nhà', sale: 'Sale' };

/** US56 chưa làm: "Thêm căn thủ công", "Thêm căn tự nhập" báo tạm. */
export const CAU_THEM_CAN_SE_CO = 'Thêm căn tự nhập sẽ có ở bản sau';

/** YC1.1 bước 5, 6: tab Lịch của vai đã chọn. Sale có dịch vụ link xin lịch thì qua ManXinLich (YC6.4). */
export function ManLich(props: { vai: Vai | null; onDangXuat: () => void; ten?: string | null; dv?: DichVuXinLich }) {
  if (props.vai === 'sale' && props.dv) {
    return <ManXinLich dv={props.dv} ten={props.ten} onDangXuat={props.onDangXuat} />;
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

/**
 * YC6.4 bước 1 đến 5, HV1, HV2, HV3: đọc số đếm của chính sale; A5 khi chưa mở A6 lần nào, A7-00 khi chưa gửi, A7 khi đã
 * gửi, A7-01 ngay sau khi chia sẻ. Quay lại từ bảng chia sẻ hay từ nền thì đọc lại.
 */
function ManXinLich(props: { dv: DichVuXinLich; ten?: string | null; onDangXuat: () => void }) {
  const { dv } = props;
  const hienToast = useToast();
  const [so, datSo] = useState<SoDemXinLich | undefined>(undefined);
  const [loi, datLoi] = useState(false);
  const [moA6, datMoA6] = useState(false);
  const [vuaGui, datVuaGui] = useState(false);

  const tai = useCallback(async () => {
    datLoi(false);
    try {
      datSo(await dv.doc());
    } catch {
      datLoi(true);
    }
  }, [dv]);
  useEffect(() => { void tai(); }, [tai]);
  useQuayLaiTuNen(() => { void tai(); });

  // Bản tạm: sale chưa có tab Cá nhân (YC7), giữ vai và Đăng xuất ở chân màn.
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
  if (!so) {
    return <KhungLichSale chan={chan}>{loi ? <ManChuaTai onThuLai={() => void tai()} /> : <KhungXam />}</KhungLichSale>;
  }
  const man = chonManXinLich(so);
  if (man === 'co-nguon') return <LichTam vai="sale" onDangXuat={props.onDangXuat} />;
  const moXin = () => datMoA6(true);
  const themCan = () => hienToast(CAU_THEM_CAN_SE_CO);
  if (man === 'A5') return <A5ChuaCoNguon onXinLich={moXin} onThemCan={themCan} chan={chan} />;
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
