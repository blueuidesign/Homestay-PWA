// P14, P14-01 · Xóa tài khoản (YC1.8, US8). Liệt kê điều gì mất, điều gì còn; bấm "Xóa tài khoản" lần một thành P14-01,
// bấm lần hai mới gọi lệnh xóa rồi về A1 (onDaXoa). "Giữ tài khoản" về P2, không gì đổi (YC1.8-NT2).
// HV2: lệnh xóa lỗi thì báo và ở lại màn, database không ghi gì (YC1.8-NT3).
import { useState } from 'react';
import { NutGhi } from '../chung/dangTai';
import { cauBaoLoi, DaiMatKetNoi } from '../chung/matKetNoi';
import { useToast } from '../chung/Toast';
import { Icon } from './TabChu';
import './P2HoSo.css';
import './P14XoaTaiKhoan.css';

/** P14-01. */
export const CAU_XAC_NHAN_XOA = 'Xác nhận xóa? Bấm lần nữa để xóa. Xóa xong app về màn đầu.';
export const SE_XOA = ['Số điện thoại của bạn.', 'Bạn bị đăng xuất khỏi máy này.', 'Sale và chủ nhà đã kết nối không gọi, nhắn cho bạn từ app được nữa.'];
export const VAN_GIU = [
  'Căn, ảnh, lịch, giá, đặt phòng và thống kê của bạn.',
  'Đặt phòng đã có vẫn chiếm đêm trong lịch của chủ nhà.',
  'Người khác vẫn thấy tên bạn, kèm dòng "Đã xoá tài khoản".',
  'Đăng nhập lại bằng email này và nhập lại số là dùng tiếp như cũ.',
];
const ICON_QUAY_LAI = <path d="m15 18-6-6 6-6" />;

export function P14XoaTaiKhoan(props: { email: string; xoa?: () => Promise<void>; onGiu: () => void; onDaXoa: () => void }) {
  const hienToast = useToast();
  const [lanHai, datLanHai] = useState(false);

  const bam = async () => {
    if (!lanHai) { datLanHai(true); return; }
    try {
      if (!props.xoa) throw new TypeError('chưa nối database');
      await props.xoa();
    } catch (e) {
      hienToast(cauBaoLoi(e), 'loi');
      return;
    }
    props.onDaXoa();
  };

  return (
    <div className="man p2 p14" data-man={lanHai ? 'P14-01' : 'P14'}>
      <DaiMatKetNoi />
      <header className="p2-dau">
        <button type="button" className="hh-iconbtn man-quay-lai" aria-label="Quay lại" onClick={props.onGiu}><Icon co={22}>{ICON_QUAY_LAI}</Icon></button>
        <h1 className="p2-tieu-de">Xóa tài khoản</h1>
      </header>
      <div className="p2-than">
        <p className="p14-mo-dau">Xóa tài khoản {props.email}. Đọc kỹ điều gì mất, điều gì còn.</p>
        <section className="p14-khoi p14-khoi--xoa" aria-labelledby="p14-xoa">
          <h2 id="p14-xoa" className="p14-tieu-de">Sẽ xóa</h2>
          <ul>{SE_XOA.map((c) => <li key={c}>{c}</li>)}</ul>
        </section>
        <section className="p14-khoi" aria-labelledby="p14-giu">
          <h2 id="p14-giu" className="p14-tieu-de">Vẫn giữ</h2>
          <ul>{VAN_GIU.map((c) => <li key={c}>{c}</li>)}</ul>
        </section>
      </div>
      <div className="p2-chan p14-chan">
        <NutGhi chu={lanHai ? CAU_XAC_NHAN_XOA : 'Xóa tài khoản'} chuDangGhi="Đang xóa…" onGhi={bam} lop="hh-btn hh-btn--danger hh-btn--block p14-nut-xoa" />
        <button type="button" className="hh-btn hh-btn--secondary hh-btn--block" onClick={props.onGiu}>Giữ tài khoản</button>
      </div>
    </div>
  );
}
