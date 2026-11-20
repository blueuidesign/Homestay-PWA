// Sửa, xóa đặt phòng tự ghi (YC10.4-NT8, NT9, QT1.3, QD11, PQ14.SALE). Mở khi chạm một dòng "ĐẶT PHÒNG BẠN ĐÃ GHI" ở S6-03.
// Cùng form với S6-05, điền sẵn ngày và tiền đã lưu; "Lưu thay đổi" gọi fn_sua_dat_phong_tu_ghi. "Xóa đặt phòng" bấm hai lần
// (YC10 "Bấm hai lần" áp như xóa căn tự nhập): lần một đổi chữ nút, lần hai gọi fn_xoa_dat_phong_tu_ghi.
// Trạng thái: HV1 nút khóa khi đang ghi, HV2 mất mạng thì báo và giữ form, HV8 toast.
import { useState } from 'react';
import { CAU_CHUA_LUU, cauBaoLoi } from '../chung/matKetNoi';
import { useToast } from '../chung/Toast';
import type { DatPhongTuGhi } from '../lib/canTuNhap';
import { cauXacNhanXoaDatPhong, NUT_XOA } from '../lib/datPhongTuGhi';
import type { DichVuDatPhongTuGhi } from '../lib/dichVuDatPhongTuGhi';
import type { Ngay } from '../lib/ngay';
import { FormDatPhongTuGhi, type GiaTriDatPhong } from './S605GhiDatPhong';

export function S606SuaDatPhong(props: {
  canId: string;
  tenCan: string;
  tenChu: string | null;
  homNay: Ngay;
  datPhong: DatPhongTuGhi;
  dv: Pick<DichVuDatPhongTuGhi, 'dienSan' | 'sua' | 'xoa'>;
  onDong: () => void;
  onDaLuu: (g: GiaTriDatPhong) => void;
  onDaXoa: (d: DatPhongTuGhi) => void;
}) {
  const d = props.datPhong;
  const hienToast = useToast();
  const [hoiXoa, datHoiXoa] = useState(false);
  const [dangXoa, datDangXoa] = useState(false);

  // YC10.4-NT9: lần một chưa xóa; lần hai mới xóa.
  const xoa = async () => {
    if (!hoiXoa) { datHoiXoa(true); return; }
    if (dangXoa) return;
    if (typeof navigator !== 'undefined' && navigator.onLine === false) { hienToast(CAU_CHUA_LUU, 'loi'); return; }
    datDangXoa(true);
    try {
      await props.dv.xoa(d.id);
      props.onDaXoa(d);
    } catch (e) {
      hienToast(cauBaoLoi(e), 'loi');
      datDangXoa(false);
    }
  };

  return (
    <FormDatPhongTuGhi tieuDe="Sửa đặt phòng" tenCan={props.tenCan} tenChu={props.tenChu} canId={props.canId} homNay={props.homNay}
                       dv={props.dv} nut="Lưu thay đổi" manCon="S6-05-sua" onDong={props.onDong}
                       dau={{ ngayNhan: d.ngayNhan, ngayTra: d.ngayTra, traChu: d.traChu, thuKhach: d.thuKhach }}
                       onLuu={async (g) => {
                         await props.dv.sua(d.id, g);
                         props.onDaLuu(g);
                       }}
                       duoi={
                         <button type="button" className="hh-btn hh-btn--text s605-xoa" disabled={dangXoa} onClick={() => void xoa()}>
                           {hoiXoa ? cauXacNhanXoaDatPhong(d.ngayNhan, d.ngayTra) : NUT_XOA}
                         </button>
                       } />
  );
}
