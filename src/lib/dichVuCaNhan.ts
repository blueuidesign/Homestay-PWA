// Tab Cá nhân (YC1.3, QD4): đọc hồ sơ, cài đặt, số thông báo chưa đọc của chính người gọi qua RLS
// (profiles_doc, cai_dat_rieng_doc, thong_bao_doc), email từ phiên. Không ghi gì.
import type { SupabaseClient } from '@supabase/supabase-js';
import type { TongQuanCaNhan } from './caNhan';

export interface DichVuCaNhan {
  /** YC1.3 bước 1 đến 4: đầu trang và giá trị phụ của các dòng. */
  doc(): Promise<TongQuanCaNhan>;
}

function baoLoi(error: { message?: string; code?: string }): Error {
  return Object.assign(new Error(error.message ?? 'Lỗi'), { code: error.code });
}

export function taoDichVuCaNhanSupabase(sb: SupabaseClient): DichVuCaNhan {
  return {
    async doc() {
      const { data: u } = await sb.auth.getUser();
      const id = u.user?.id;
      if (!id) throw new Error('Chưa đăng nhập');
      const [hs, cd, tb] = await Promise.all([
        sb.from('profiles').select('ten, ten_hien_thi, so_dien_thoai, gio_nhan, gio_tra, dem_cuoi_tuan').eq('id', id).maybeSingle(),
        sb.from('cai_dat_rieng').select('muc_cong_mac_dinh, thong_bao_tat').eq('nguoi_id', id).maybeSingle(),
        sb.from('thong_bao').select('id', { count: 'exact', head: true }).eq('nguoi_nhan', id).is('doc_luc', null),
      ]);
      if (hs.error) throw baoLoi(hs.error);
      if (cd.error) throw baoLoi(cd.error);
      if (tb.error) throw baoLoi(tb.error);
      const h = hs.data;
      const c = cd.data;
      return {
        ten: h?.ten ?? null,
        tenHienThi: h?.ten_hien_thi ?? null,
        soDienThoai: h?.so_dien_thoai ?? null,
        email: u.user?.email ?? '',
        soChuaDoc: tb.count ?? 0,
        gioNhan: String(h?.gio_nhan ?? '14:00').slice(0, 5),
        gioTra: String(h?.gio_tra ?? '12:00').slice(0, 5),
        demCuoiTuan: (h?.dem_cuoi_tuan as number[] | undefined) ?? [5, 6],
        mucCong: Number(c?.muc_cong_mac_dinh ?? 0),
        thongBaoTat: (c?.thong_bao_tat as string[] | undefined) ?? [],
      };
    },
  };
}
