// Màn nhập số (YC1 Quy tắc "Chưa đăng ký xong thì chưa vào app"). Hai trường hợp:
// - Hồ sơ chưa có tên (lệnh đăng ký bị từ chối ở YC1.2 bước 5): như A2, đủ tên và số, lỗi dưới ô.
// - Hồ sơ có tên mà chưa có số (đã xóa tài khoản, YC1.2 luồng đăng nhập bước 5, QD25): khối số của A2 kèm nút Lưu.
import { useState } from 'react';
import { NutGhi } from '../chung/dangTai';
import { cauBaoLoi } from '../chung/matKetNoi';
import { kiemFormDangKy, type LoiForm } from '../lib/kiemDangKy';
import { LoiDangKy, type DichVuXacThuc } from '../lib/xacThuc';
import type { HoSo } from '../lib/dieuHuong';
import { docBanNhapDangKy, xoaBanNhapDangKy } from './banNhap';
import { DongDieuKhoan, KhungMan, O } from './khung';

export function HoanTatDangKy(props: {
  dichVu: DichVuXacThuc;
  hoSo: HoSo | null;
  email: string;
  loiBanDau?: unknown;
  onXong: () => void;
  onDungEmailKhac: () => void;
}) {
  const coTen = !!props.hoSo?.ten;
  const nhap = docBanNhapDangKy();
  const [ten, datTen] = useState(props.hoSo?.ten ?? nhap?.ten ?? '');
  const [so, datSo] = useState(nhap?.so ?? '');
  const [loi, datLoi] = useState<LoiForm>(() => {
    const e = props.loiBanDau;
    if (e instanceof LoiDangKy && (e.o === 'ten' || e.o === 'so')) return { [e.o]: e.message };
    return {};
  });
  const [loiChung, datLoiChung] = useState<string | null>(() =>
    props.loiBanDau && !(props.loiBanDau instanceof LoiDangKy && e2o(props.loiBanDau)) ? cauBaoLoi(props.loiBanDau) : null);

  const luu = async () => {
    datLoiChung(null);
    const l = kiemFormDangKy({ ten: coTen ? undefined : ten, so });
    datLoi(l);
    if (Object.keys(l).length) return;
    try {
      await props.dichVu.dangKy(coTen ? props.hoSo!.ten! : ten, so);
      xoaBanNhapDangKy();
      props.onXong();
    } catch (e) {
      if (e instanceof LoiDangKy && (e.o === 'ten' || e.o === 'so')) datLoi({ [e.o]: e.message });
      else datLoiChung(cauBaoLoi(e));
    }
  };

  return (
    <KhungMan tieuDe={coTen ? 'Nhập lại số điện thoại' : 'Tạo tài khoản'}>
      <p className="dong-phu">Sale và chủ nhà sẽ thấy tên và số điện thoại này khi kết nối với bạn.</p>
      {!coTen && (
        <O nhan="Họ và tên" tuDien="name" viDu="Ví dụ: Nguyễn Thị Hoa" giaTri={ten} loi={loi.ten}
           onDoi={(v) => { datTen(v); datLoi((x) => ({ ...x, ten: undefined })); }} />
      )}
      <O nhan="Số điện thoại" kieu="tel" tuDien="tel" viDu="Ví dụ: 0912 345 678" giaTri={so} loi={loi.so}
         onDoi={(v) => { datSo(v); datLoi((x) => ({ ...x, so: undefined })); }} />
      <O nhan="Email" kieu="email" giaTri={props.email} khoa onDoi={() => {}} />
      {loiChung && <p className="cau-loi" role="alert">{loiChung}</p>}
      <div className="man-chan">
        <NutGhi chu="Lưu" onGhi={luu} />
        {!coTen && <DongDieuKhoan />}
        <button type="button" className="hh-btn hh-btn--text" onClick={props.onDungEmailKhac}>Dùng email khác</button>
      </div>
    </KhungMan>
  );
}

function e2o(e: LoiDangKy): boolean {
  return e.o === 'ten' || e.o === 'so';
}
