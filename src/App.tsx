// Vỏ app (EN1) và bộ chọn màn theo phiên, hồ sơ (YC1.2, YC1 Quy tắc của nhóm, QD22).
import { useCallback, useEffect, useRef, useState } from 'react';
import { KhungXam } from './chung/dangTai';
import { ToastProvider } from './chung/Toast';
import { chonMan, type HoSo, type TrangThaiPhien } from './lib/dieuHuong';
import { dichVuMacDinh } from './lib/supabase';
import type { DichVuXacThuc } from './lib/xacThuc';
import { A1Chao } from './man/A1Chao';
import { HoanTatDangKy } from './man/HoanTatDangKy';
import { LuongDangNhap } from './man/LuongDangNhap';
import { A3ChonVai } from './man/A3ChonVai';
import { ManLich, XemTruocLink } from './man/ManTam';

type TrangThai = { phien: TrangThaiPhien; email: string; hoSo: HoSo | null | undefined };

export function App(props: { dichVu?: DichVuXacThuc | null }) {
  const dichVu = props.dichVu === undefined ? dichVuMacDinh() : props.dichVu;
  return (
    <ToastProvider>
      <Goc dichVu={dichVu} />
    </ToastProvider>
  );
}

function Goc({ dichVu }: { dichVu: DichVuXacThuc | null }) {
  // Không có Supabase (biến build trống) thì chạy như chưa đăng nhập: A1 vẫn xem được.
  const [tt, datTt] = useState<TrangThai>({ phien: dichVu ? 'dang-doc' : 'chua', email: '', hoSo: undefined });
  const [luong, datLuong] = useState<'A2' | 'A11' | null>(null);
  const [loiDangKy, datLoiDangKy] = useState<unknown>(undefined);
  const [duongDan, datDuongDan] = useState(() => window.location.pathname);
  // Đang trong lúc xác nhận mã: bỏ qua báo đổi phiên, luồng tự gọi taiLai khi xong (tránh nháy màn nhập số).
  const dangXacNhan = useRef(false);

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

  const man = chonMan({ duongDan, phien: tt.phien, hoSo: tt.hoSo });

  if (man === 'dang-tai') return <KhungXam />;

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
      return <ManLich vai={tt.hoSo?.vaiChon ?? null} onDangXuat={dangXuat} />;
  }
}
