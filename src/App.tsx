// Vỏ app (EN1) và bộ chọn màn theo phiên, hồ sơ (YC1.2, YC1 Quy tắc của nhóm, QD22).
import { useCallback, useEffect, useRef, useState } from 'react';
import { KhungXam } from './chung/dangTai';
import { ToastProvider } from './chung/Toast';
import { useToast } from './chung/Toast';
import { chonMan, maLinkMoi, type HoSo, type TrangThaiPhien } from './lib/dieuHuong';
import { cauDaThemLich } from './lib/dichVuLinkMoi';
import type { DichVuCan } from './lib/dichVuCan';
import { dichVuCanMacDinh, dichVuMacDinh } from './lib/supabase';
import type { DichVuXacThuc } from './lib/xacThuc';
import { A1Chao } from './man/A1Chao';
import { HoanTatDangKy } from './man/HoanTatDangKy';
import { LuongDangNhap } from './man/LuongDangNhap';
import { A3ChonVai } from './man/A3ChonVai';
import { ManLinkMoi } from './man/A10ThemLich';
import { ManChu } from './man/ManChu';
import { ManLich, XemTruocLink } from './man/ManTam';

type TrangThai = { phien: TrangThaiPhien; email: string; hoSo: HoSo | null | undefined };

export function App(props: { dichVu?: DichVuXacThuc | null; dichVuCan?: DichVuCan | null }) {
  const dichVu = props.dichVu === undefined ? dichVuMacDinh() : props.dichVu;
  const dichVuCan = props.dichVuCan === undefined ? dichVuCanMacDinh() : props.dichVuCan;
  return (
    <ToastProvider>
      <Goc dichVu={dichVu} dichVuCan={dichVuCan} />
    </ToastProvider>
  );
}

function Goc({ dichVu, dichVuCan }: { dichVu: DichVuXacThuc | null; dichVuCan: DichVuCan | null }) {
  // Không có Supabase (biến build trống) thì chạy như chưa đăng nhập: A1 vẫn xem được.
  const [tt, datTt] = useState<TrangThai>({ phien: dichVu ? 'dang-doc' : 'chua', email: '', hoSo: undefined });
  const [luong, datLuong] = useState<'A2' | 'A11' | null>(null);
  const [loiDangKy, datLoiDangKy] = useState<unknown>(undefined);
  const [duongDan, datDuongDan] = useState(() => window.location.pathname);
  // Đang trong lúc xác nhận mã: bỏ qua báo đổi phiên, luồng tự gọi taiLai khi xong (tránh nháy màn nhập số).
  const dangXacNhan = useRef(false);
  const hienToast = useToast();
  // YC6.3 bước 3, QD8: đã chọn sẵn vai sale cho lần vào từ link mời này (không gọi lại khi lỗi).
  const [daChonVaiLink, datDaChonVaiLink] = useState(false);

  const taiLai = useCallback(async () => {
    if (!dichVu) return;
    try {
      const p = await dichVu.layPhien();
      if (!p) { datTt({ phien: 'chua', email: '', hoSo: undefined }); return; }
      const hoSo = await dichVu.layHoSo().catch(() => null);
      datTt({ phien: 'co', email: p.email, hoSo });
    } catch {
      datTt({ phien: 'chua', email: '', hoSo: undefined });
    }
  }, [dichVu]);

  useEffect(() => {
    if (!dichVu) return;
    void taiLai();
    return dichVu.theoDoiPhien(() => { if (!dangXacNhan.current) void taiLai(); });
  }, [dichVu, taiLai]);

  useEffect(() => {
    const doi = () => datDuongDan(window.location.pathname);
    window.addEventListener('popstate', doi);
    return () => window.removeEventListener('popstate', doi);
  }, []);

  const den = (d: string) => { window.history.pushState(null, '', d); datDuongDan(d); };
  const dangXuat = async () => { await dichVu?.dangXuat(); datLuong(null); await taiLai(); };
  // HV7 bước 2: làm mới phiên không được thì bỏ phiên trên máy, mở thẳng màn đăng nhập (A11, YC1.2). Địa chỉ giữ nguyên
  // nên đăng nhập xong bộ chọn màn quay lại đúng màn cũ; form tự điền lại từ nháp (HV3).
  const hetPhien = async () => { await dichVu?.dangXuat().catch(() => undefined); datLuong('A11'); await taiLai(); };

  const man = chonMan({ duongDan, phien: tt.phien, hoSo: tt.hoSo });
  const maLink = maLinkMoi(duongDan);
  // YC6.3 bước 3, YC6.3-NT1, QD8: đăng ký hay đăng nhập từ link mời mà chưa chọn vai thì chọn sẵn vai sale, sang thẳng A10.
  const canChonVaiSale = man === 'xem-truoc-link' && maLink !== null && tt.phien === 'co' && !!tt.hoSo && tt.hoSo.vaiChon === null
    && !daChonVaiLink && !!dichVu;
  useEffect(() => {
    if (!canChonVaiSale || !dichVu) return;
    datDaChonVaiLink(true);
    void dichVu.chonVai('sale').catch(() => undefined).then(() => taiLai());
  }, [canChonVaiSale, dichVu, taiLai]);

  if (man === 'dang-tai' || canChonVaiSale) return <KhungXam />;

  if (tt.phien === 'chua' && luong && dichVu) {
    return (
      <LuongDangNhap
        dichVu={{
          ...dichVu,
          xacNhanMa: async (e, m) => {
            dangXacNhan.current = true;
            try {
              const kq = await dichVu.xacNhanMa(e, m);
              if (kq === 'sai') dangXacNhan.current = false;
              return kq;
            } catch (loi) {
              dangXacNhan.current = false;
              throw loi;
            }
          },
        }}
        batDau={luong}
        onVeA1={() => datLuong(null)}
        onDaDangNhap={(loi) => {
          datLoiDangKy(loi);
          dangXacNhan.current = false;
          void taiLai();
        }}
      />
    );
  }

  switch (man) {
    case 'A1':
      return <A1Chao onTaoTaiKhoan={() => datLuong('A2')} onDangNhap={() => datLuong('A11')} />;
    case 'xem-truoc-link':
      if (maLink !== null) {
        // YC6.3: A1-link, A1-link-01 khi chưa đăng nhập; A10, A10-01 khi đã đăng nhập. Thêm xong về lịch với toast A10-02.
        return (
          <ManLinkMoi key={maLink} ma={maLink} daDangNhap={tt.phien === 'co'} dv={dichVuCan?.linkMoi}
                      onBatDau={() => datLuong('A2')} onVeLich={() => den('/')}
                      onDaThem={(soCan, tenChu) => { den('/'); hienToast(cauDaThemLich(soCan, tenChu)); }} />
        );
      }
      return <XemTruocLink daDangNhap={tt.phien === 'co'} onBatDau={() => datLuong('A2')} onVeLich={() => den('/')} />;
    case 'hoan-tat':
      return (
        <HoanTatDangKy dichVu={dichVu!} hoSo={tt.hoSo ?? null} email={tt.email} loiBanDau={loiDangKy}
                       onXong={() => { datLoiDangKy(undefined); void taiLai(); }} onDungEmailKhac={dangXuat} />
      );
    case 'A3':
      // YC1.1 bước 5: ghi vai rồi đọc lại hồ sơ, bộ chọn màn sang tab Lịch.
      return <A3ChonVai onChon={async (vai) => { await dichVu!.chonVai(vai); await taiLai(); }} />;
    case 'lich':
      // YC3.1, YC1.1 bước 5: chủ nhà vào các tab của chủ (A4 khi chưa có căn). Sale: tab Lịch tạm tới YC7.1.
      if (tt.hoSo?.vaiChon === 'chu_nha') {
        return <ManChu duongDan={duongDan} den={den} dichVuCan={dichVuCan} onDangXuat={dangXuat} onHetPhien={() => void hetPhien()} />;
      }
      // YC6.4: sale chưa có nguồn phòng thấy A5, A7 (dịch vụ link xin lịch).
      return <ManLich vai={tt.hoSo?.vaiChon ?? null} ten={tt.hoSo?.ten} dv={dichVuCan?.xinLich} onDangXuat={dangXuat} />;
  }
}
