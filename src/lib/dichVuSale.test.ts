// Test unit dịch vụ danh sách sale (YC6.2): đọc fn_ds_sale_cua_toi, chia nhóm, chữ của dòng. Supabase giả, không gọi mạng.
import type { SupabaseClient } from '@supabase/supabase-js';
import { describe, expect, it, vi } from 'vitest';
import { LoiNguoiDung } from '../chung/matKetNoi';
import { cauHoiNgung, chiaNhom, dongPhuSale, ngayVN, taoDichVuSaleSupabase, type DongSale } from './dichVuSale';

function dong(them: Partial<DongSale>): DongSale {
  return {
    id: 'k-' + (them.ten ?? 'x'), loai: 'ket_noi', saleId: 's-' + (them.ten ?? 'x'), ten: 'Sale', soDienThoai: null, nhom: 'da_ket_noi',
    daXoaTaiKhoan: false, xemCoc: true, soDatPhong: 0, tongTienPhong: 0, ketNoiLuc: '2026-08-02T03:00:00Z', ngungLuc: null, ...them,
  };
}

describe('YC6.2 · dịch vụ danh sách sale', () => {
  it('YC6.2-NT1 đọc fn_ds_sale_cua_toi và đổi tên cột', async () => {
    const rpc = vi.fn(async () => ({
      data: [{ id: 'k1', loai: 'ket_noi', sale_id: 's1', ten: 'Sale Hùng', so_dien_thoai: '0900000003', nhom: 'da_ket_noi',
               da_xoa_tai_khoan: false, xem_coc: true, so_dat_phong: 2, tong_tien_phong: 4000000,
               ket_noi_luc: '2026-08-02T03:00:00Z', ngung_luc: null }],
      error: null,
    }));
    const ds = await taoDichVuSaleSupabase({ rpc } as unknown as SupabaseClient).layDanhSach();
    expect(rpc).toHaveBeenCalledWith('fn_ds_sale_cua_toi');
    expect(ds).toEqual([dong({ id: 'k1', saleId: 's1', ten: 'Sale Hùng', soDienThoai: '0900000003', soDatPhong: 2, tongTienPhong: 4000000 })]);
  });

  it('YC6.2-NT3 thêm sale tay gửi tên, số; P0001 thì LoiNguoiDung kèm câu', async () => {
    const rpc = vi.fn()
      .mockResolvedValueOnce({ data: 'id-moi', error: null })
      .mockResolvedValueOnce({ data: null, error: { code: 'P0001', message: 'Số điện thoại chưa đúng (10 chữ số, bắt đầu bằng 0)' } });
    const dv = taoDichVuSaleSupabase({ rpc } as unknown as SupabaseClient);
    expect(await dv.themSaleTay('Sale Phương', '0901234567')).toBe('id-moi');
    expect(rpc).toHaveBeenCalledWith('fn_them_sale_tay', { p_ten: 'Sale Phương', p_so: '0901234567' });
    await expect(dv.themSaleTay('Sale Phương', '090 123')).rejects.toBeInstanceOf(LoiNguoiDung);
  });

  it('YC6.2-NT1 chia nhóm Đã kết nối, Chưa kết nối, Đã ngừng, mỗi nhóm theo tên', () => {
    const n = chiaNhom([
      dong({ ten: 'Sale Nga' }), dong({ ten: 'Sale Hùng', nhom: 'da_ngung' }), dong({ ten: 'Sale Lan' }),
      dong({ ten: 'Sale Phương', loai: 'them_tay', nhom: 'chua_ket_noi', saleId: null }), dong({ ten: 'Sale Minh' }),
    ]);
    expect(n.daKetNoi.map((d) => d.ten)).toEqual(['Sale Lan', 'Sale Minh', 'Sale Nga']);
    expect(n.chuaKetNoi.map((d) => d.ten)).toEqual(['Sale Phương']);
    expect(n.daNgung.map((d) => d.ten)).toEqual(['Sale Hùng']);
  });

  it('YC6.2 bước 1, 4, YC6-H16 chữ phụ của dòng', () => {
    expect(dongPhuSale(dong({ soDatPhong: 2, tongTienPhong: 4000000 }))).toBe('2 đặt phòng');
    expect(dongPhuSale(dong({ soDatPhong: 0 }))).toBe('Chưa có đặt phòng');
    expect(dongPhuSale(dong({ loai: 'them_tay', nhom: 'chua_ket_noi', soDienThoai: '0901234567' }))).toBe('0901 234 567 · chưa mở link mời');
    expect(dongPhuSale(dong({ nhom: 'da_ngung', ngungLuc: '2026-11-18T18:00:00Z', soDatPhong: 2 }))).toBe('Đã ngừng 19/11/2026 · 2 đặt phòng');
  });

  it('YC6.2 bước 6 câu hỏi lại khi ngừng; ngày theo giờ Việt Nam', () => {
    expect(cauHoiNgung('Sale Hùng')).toBe('Xác nhận ngừng cho Sale Hùng xem? Đặt phòng cũ vẫn giữ. Sale không thấy lịch của bạn nữa.');
    expect(ngayVN('2026-08-01T18:30:00Z')).toBe('02/08/2026');
    expect(ngayVN(null)).toBe('');
  });
});
