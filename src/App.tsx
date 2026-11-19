// Vỏ app (EN1, EN3). Màn đầu thật là A1, làm ở US1 (YC1.1).
// Bản thử bật đăng nhập tạm (YC1.2 bảng bước bản thử): chưa đăng nhập thì hiện màn Đăng nhập thử.
import { useEffect, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { DangNhapThu } from './tai-khoan/DangNhapThu';
import { dangNhapThuDuocBat } from './tai-khoan/phien';

const DANG_NHAP_THU = dangNhapThuDuocBat(import.meta.env);

function VoApp() {
  return (
    <main className="vo-app">
      <h1>Home247</h1>
      <p>Lịch phòng Hạ Long</p>
    </main>
  );
}

type TrangThai = { loai: 'dang-tai' } | { loai: 'chua-dang-nhap'; kn: SupabaseClient } | { loai: 'da-dang-nhap' };

// YC1.2 bước 1, 2, 4: đọc phiên đã lưu; có phiên thì vào app, chưa có thì màn Đăng nhập thử.
function VoAppCoDangNhapThu() {
  const [trangThai, setTrangThai] = useState<TrangThai>({ loai: 'dang-tai' });

  useEffect(() => {
    let huy = false;
    let boTheoDoi: (() => void) | undefined;
    void import('./tai-khoan/supabaseThu').then(async ({ taoKetNoi, taoHoSoNeuChuaCo }) => {
      const kn = taoKetNoi(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);
      const capNhat = (coPhien: boolean) => {
        if (huy) return;
        if (coPhien) {
          void taoHoSoNeuChuaCo(kn);
          setTrangThai({ loai: 'da-dang-nhap' });
        } else {
          setTrangThai({ loai: 'chua-dang-nhap', kn });
        }
      };
      const { data } = kn.auth.onAuthStateChange((suKien, phien) => {
        if (suKien === 'SIGNED_IN' || suKien === 'SIGNED_OUT') capNhat(!!phien);
      });
      boTheoDoi = () => data.subscription.unsubscribe();
      const { data: daLuu } = await kn.auth.getSession();
      capNhat(!!daLuu.session);
    });
    return () => {
      huy = true;
      boTheoDoi?.();
    };
  }, []);

  if (trangThai.loai === 'dang-tai') return <main className="vo-app" aria-busy="true" />;
  if (trangThai.loai === 'chua-dang-nhap') {
    const kn = trangThai.kn;
    return (
      <DangNhapThu
        dangNhap={async (email, matKhau) => {
          const { dangNhapBangMatKhau } = await import('./tai-khoan/supabaseThu');
          return dangNhapBangMatKhau(kn, email, matKhau);
        }}
      />
    );
  }
  return <VoApp />;
}

export function App() {
  return DANG_NHAP_THU ? <VoAppCoDangNhapThu /> : <VoApp />;
}
