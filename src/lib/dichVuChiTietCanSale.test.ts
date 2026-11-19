// Test unit dịch vụ chi tiết căn cho sale (YC7.4, US46): đọc jsonb, ảnh có hạn 1 giờ, lệnh ghi mức cộng.
import type { SupabaseClient } from '@supabase/supabase-js';
import { describe, expect, it, vi } from 'vitest';
import { LoiNguoiDung } from '../chung/matKetNoi';
import { docChiTiet, HAN_ANH_SALE_GIAY, KHO_ANH_CAN, taoDichVuChiTietCanSaleSupabase } from './dichVuChiTietCanSale';

const JSON_1509 = {
  khong_con_quyen: false, can_id: 'c1509', ma_can: '1509', ten_toa: 'ICON40', khu_vuc: 'Bãi Cháy', so_phong_ngu: 2, so_giuong: 3,
  loai_view: 'bien', lich_doi_luc: '2026-10-06T08:00:00+07:00', anh: ['hoa/1509-a.jpg', 'hoa/1509-b.jpg'],
  chu: { ten: 'Chị Hoa', so_dien_thoai: '0900000001', so_can: 2 }, gio_nhan: '14:00', gio_tra: '12:00',
  tu: '2026-10-10', den: '2026-10-12',
  dem: [{ ngay: '2026-10-10', gia_chu: 1300000, gia_ban: 1500000 }, { ngay: '2026-10-11', gia_chu: 900000, gia_ban: 1100000 }],
  tong_gia_chu: 2200000, tong_gia_ban: '2600000', muc_cong: 200000, muc_cong_rieng: 200000, muc_cong_mac_dinh: 400000,
  lam_tron_50k: false, lich: [{ ngay: '2026-10-05', o: 'kin' }, { ngay: '2026-10-06', o: 'la' }],
};

function sbGia(data: unknown, error: unknown = null) {
  const rpc = vi.fn(async () => ({ data, error }));
  const createSignedUrls = vi.fn(async (ds: string[]) => ({ data: ds.map((p) => ({ path: p, signedUrl: `https://kho/${p}?token=x` })) }));
  const from = vi.fn(() => ({ createSignedUrls }));
  return { sb: { rpc, storage: { from } } as unknown as SupabaseClient, rpc, from, createSignedUrls };
}

describe('YC7.4 · dịch vụ chi tiết căn', () => {
  it('YC7.4-NT2 đọc cả giá chủ và giá bán; tiền bigint dạng chuỗi đổi ra số; ô lịch lạ bỏ đi', () => {
    const kq = docChiTiet(JSON_1509);
    expect(kq.khongConQuyen).toBe(false);
    if (kq.khongConQuyen) return;
    expect([kq.tongGiaChu, kq.tongGiaBan, kq.mucCongRieng, kq.mucCongMacDinh]).toEqual([2_200_000, 2_600_000, 200_000, 400_000]);
    expect(kq.chu).toEqual({ ten: 'Chị Hoa', soDienThoai: '0900000001', soCan: 2 });
    expect(kq.lich).toEqual([{ ngay: '2026-10-05', o: 'kin' }]);
  });
  it('HV5-NT1 HV5-NT2 không còn quyền: chỉ có lý do', () => {
    expect(docChiTiet({ khong_con_quyen: true, ly_do: 'Chủ nhà đã xóa tài khoản' })).toEqual({ khongConQuyen: true, lyDo: 'Chủ nhà đã xóa tài khoản' });
    expect(docChiTiet(null)).toEqual({ khongConQuyen: true, lyDo: null });
  });
  it('YC7.4-NT6 ảnh xin đường dẫn có hạn 1 giờ từ kho anh-can', async () => {
    const g = sbGia(JSON_1509);
    const kq = await taoDichVuChiTietCanSaleSupabase(g.sb).doc('c1509', '2026-10-10', '2026-10-12');
    expect(g.rpc).toHaveBeenCalledWith('fn_sale_chi_tiet_can', { p_can_id: 'c1509', p_tu: '2026-10-10', p_den: '2026-10-12' });
    expect(HAN_ANH_SALE_GIAY).toBe(3600);
    expect(g.from).toHaveBeenCalledWith(KHO_ANH_CAN);
    expect(g.createSignedUrls).toHaveBeenCalledWith(['hoa/1509-a.jpg', 'hoa/1509-b.jpg'], 3600);
    expect(!kq.khongConQuyen && kq.anh).toEqual(['https://kho/hoa/1509-a.jpg?token=x', 'https://kho/hoa/1509-b.jpg?token=x']);
  });
  it('YC7.4 bước 4 chip mức riêng gọi fn_dat_muc_cong; chip "Mặc định" gọi fn_bo_muc_cong (YC7.4-NT7)', async () => {
    const g = sbGia(null);
    const d = taoDichVuChiTietCanSaleSupabase(g.sb);
    await d.datMuc('c1509', { loai: 'rieng', muc: 200_000 });
    expect(g.rpc).toHaveBeenLastCalledWith('fn_dat_muc_cong', { p_can_id: 'c1509', p_muc: 200_000 });
    await d.datMuc('c1509', { loai: 'mac-dinh' });
    expect(g.rpc).toHaveBeenLastCalledWith('fn_bo_muc_cong', { p_can_id: 'c1509' });
  });
  it('YC7.4-NT5 database từ chối (42501) thì báo câu của database', async () => {
    const g = sbGia(null, { code: '42501', message: 'Bạn không còn xem được mục này' });
    await expect(taoDichVuChiTietCanSaleSupabase(g.sb).datMuc('c1509', { loai: 'rieng', muc: 1 })).rejects.toBeInstanceOf(LoiNguoiDung);
  });
});
