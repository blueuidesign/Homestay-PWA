// Test unit dịch vụ tab Căn của sale (YC10.1, US54): đọc fn_tab_can_sale, chi tiết căn của tôi, bỏ dòng chủ đã xóa tài khoản.
import type { SupabaseClient } from '@supabase/supabase-js';
import { describe, expect, it, vi } from 'vitest';
import { LoiNguoiDung } from '../chung/matKetNoi';
import { docChiTietCanCuaToi, docDong, taoDichVuTabCanSaleSupabase } from './dichVuTabCanSale';

const DONG = [
  { nhom: 'cua_toi', can_id: 'g0812', ma_can: '0812', ten_toa: 'Green Bay', so_phong_ngu: 2, so_giuong: null, loai_view: 'bien',
    khach_den: null, ket_noi_id: null, chu_id: null, ten_chu: null, chu_da_xoa_tai_khoan: null, cap_nhat_luc: null, chu_can_ten: null },
  { nhom: 'nguon', can_id: 'c1509', ma_can: '1509', ten_toa: 'ICON40', so_phong_ngu: 2, so_giuong: 3, loai_view: 'bien',
    khach_den: null, ket_noi_id: 'kTuan', chu_id: 'tuan', ten_chu: 'Anh Tuấn', chu_da_xoa_tai_khoan: false,
    cap_nhat_luc: '2026-10-07T08:00:00+07:00', chu_can_ten: null },
  { nhom: 'nguon', can_id: null, ma_can: null, ten_toa: null, so_phong_ngu: null, so_giuong: null, loai_view: null, khach_den: null,
    ket_noi_id: 'kHoa', chu_id: 'hoa', ten_chu: 'Chị Hoa', chu_da_xoa_tai_khoan: true, cap_nhat_luc: null, chu_can_ten: null },
  { nhom: 'la' },
];

function sbGia(rpcKq: Record<string, { data: unknown; error?: unknown }>) {
  const rpc = vi.fn(async (ten: string) => ({ data: rpcKq[ten]?.data ?? null, error: rpcKq[ten]?.error ?? null }));
  const order = vi.fn(async () => ({ data: [{ can_id: 'g0812', duong_dan: 'hung/a.jpg' }] }));
  const bang: Record<string, unknown> = {
    anh_can: { select: () => ({ in: () => ({ order }) }) },
    v_nguoi_ket_noi: { select: async () => ({ data: [{ id: 'tuan', so_dien_thoai: '0900000002' }, { id: 'hoa', so_dien_thoai: null }] }) },
  };
  const createSignedUrls = vi.fn(async (ds: string[]) => ({ data: ds.map((p) => ({ path: p, signedUrl: `https://kho/${p}` })) }));
  const sb = { rpc, from: (t: string) => bang[t], storage: { from: () => ({ createSignedUrls }) } } as unknown as SupabaseClient;
  return { sb, rpc, createSignedUrls };
}

describe('YC10.1 · dịch vụ tab Căn', () => {
  it('YC10.1-NT1 đọc fn_tab_can_sale, chia nhóm, ảnh có hạn, số chủ nhà đã kết nối; nhóm lạ bỏ đi', async () => {
    const g = sbGia({ fn_tab_can_sale: { data: DONG } });
    const t = await taoDichVuTabCanSaleSupabase(g.sb).doc();
    expect(g.rpc).toHaveBeenCalledWith('fn_tab_can_sale');
    expect(t.cuaToi.map((c) => [c.ten, c.anh])).toEqual([['Green Bay 0812', 'https://kho/hung/a.jpg']]);
    expect(t.chuNha.map((n) => [n.ten, n.daXoa, n.soDienThoai])).toEqual([['Chị Hoa', true, null], ['Anh Tuấn', false, '0900000002']]);
    expect(docDong({ nhom: 'la' })).toBeNull();
  });

  it('YC10.1-NT7 dòng chủ đã xóa tài khoản không có số điện thoại, căn', async () => {
    const g = sbGia({ fn_tab_can_sale: { data: DONG } });
    const hoa = (await taoDichVuTabCanSaleSupabase(g.sb).doc()).chuNha.find((n) => n.chuId === 'hoa')!;
    expect(hoa.can).toEqual([]);
    expect(hoa.soDienThoai).toBeNull();
  });

  it('YC10.1-NT8 bỏ dòng gọi fn_sale_bo_dong_chu; database từ chối thì ném câu cho người dùng', async () => {
    const g = sbGia({});
    await taoDichVuTabCanSaleSupabase(g.sb).boDongChu('kHoa');
    expect(g.rpc).toHaveBeenCalledWith('fn_sale_bo_dong_chu', { p_ket_noi_id: 'kHoa' });
    const h = sbGia({ fn_sale_bo_dong_chu: { data: null, error: { code: '42501', message: 'Không tìm thấy chủ nhà' } } });
    await expect(taoDichVuTabCanSaleSupabase(h.sb).boDongChu('x')).rejects.toBeInstanceOf(LoiNguoiDung);
  });

  it('YC10.1-NT5 chi tiết căn của tôi: 7 đêm, ảnh có hạn; ô lạ bỏ đi', async () => {
    const d = { can_id: 'g0812', ma_can: '0812', ten_toa: 'Green Bay', so_phong_ngu: 2, so_giuong: null, loai_view: 'bien',
      anh: ['hung/a.jpg'], dem: [{ ngay: '2026-10-07', o: 'trong', gia: '750000' }, { ngay: '2026-10-08', o: 'kin', gia: 750000 }, { ngay: 'x', o: 'la' }] };
    expect(docChiTietCanCuaToi(d).dem).toEqual([{ ngay: '2026-10-07', o: 'trong', gia: 750000 }, { ngay: '2026-10-08', o: 'kin', gia: 750000 }]);
    const g = sbGia({ fn_chi_tiet_can_cua_toi: { data: d } });
    const ct = await taoDichVuTabCanSaleSupabase(g.sb).docCanCuaToi('g0812', '2026-10-07');
    expect(g.rpc).toHaveBeenCalledWith('fn_chi_tiet_can_cua_toi', { p_can_id: 'g0812', p_tu: '2026-10-07' });
    expect(ct.anh).toEqual(['https://kho/hung/a.jpg']);
  });

  it('YC10.1-NT6 căn không phải của mình: database từ chối 42501 thì ném LoiNguoiDung', async () => {
    const g = sbGia({ fn_chi_tiet_can_cua_toi: { data: null, error: { code: '42501', message: 'Không tìm thấy căn' } } });
    await expect(taoDichVuTabCanSaleSupabase(g.sb).docCanCuaToi('g0812', '2026-10-07')).rejects.toThrow('Không tìm thấy căn');
  });
});
