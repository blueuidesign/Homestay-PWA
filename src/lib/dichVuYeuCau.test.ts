// Test unit dịch vụ yêu cầu đặt phòng phía sale (YC9.1, US50): lệnh gửi, đọc, hủy và cách đổi lỗi database.
import type { SupabaseClient } from '@supabase/supabase-js';
import { describe, expect, it, vi } from 'vitest';
import { LoiNguoiDung } from '../chung/matKetNoi';
import { LoiDaDat, taoDichVuYeuCauSupabase } from './dichVuYeuCau';

const Y1 = {
  id: 'y1', can_id: 'c1509', ma_can: '1509', ten_toa: 'ICON40', so_phong_ngu: 2,
  chu: { ten: 'Chị Hoa', so_dien_thoai: '0900000001', da_xoa: false }, ngay_nhan: '2026-10-10', ngay_tra: '2026-10-12',
  so_dem: 2, dem: [], tong_gia_chu: 2200000, tong_gia_ban: 2600000, loi_nhan: null, trang_thai: 'cho',
  gui_luc: '2026-10-06T07:20:00+00:00',
};

function sbGia(data: unknown, error: unknown = null) {
  const rpc = vi.fn(async () => ({ data, error }));
  return { sb: { rpc } as unknown as SupabaseClient, rpc };
}

describe('YC9.1 · dịch vụ yêu cầu', () => {
  it('YC9.1-NT1 gửi qua fn_gui_yeu_cau với mã lần gửi, không gửi kèm giá (YC9.1-NT4)', async () => {
    const g = sbGia(Y1);
    const y = await taoDichVuYeuCauSupabase(g.sb).gui({ canId: 'c1509', tu: '2026-10-10', den: '2026-10-12', loiNhan: '  ', clientId: 'k1' });
    expect(g.rpc).toHaveBeenCalledWith('fn_gui_yeu_cau', {
      p_can_id: 'c1509', p_ngay_nhan: '2026-10-10', p_ngay_tra: '2026-10-12', p_loi_nhan: null, p_client_id: 'k1',
    });
    expect(y.guiLuc).toBe('2026-10-06T07:20:00+00:00');
  });

  it('YC9.1-NT5 "Căn này đã được đặt rồi" kèm các đêm kín thành LoiDaDat', async () => {
    const g = sbGia(null, { code: 'P0001', message: 'Căn này đã được đặt rồi', details: '2026-10-10,2026-10-11' });
    const p = taoDichVuYeuCauSupabase(g.sb).gui({ canId: 'c1509', tu: '2026-10-10', den: '2026-10-12', loiNhan: '', clientId: 'k1' });
    await expect(p).rejects.toBeInstanceOf(LoiDaDat);
    await p.catch((e: LoiDaDat) => expect(e.dem).toEqual(['2026-10-10', '2026-10-11']));
  });

  it('YC9.1-NT12 câu database "Căn chưa có giá cho đêm 11/10..." hiện nguyên cho người dùng', async () => {
    const cau = 'Căn chưa có giá cho đêm 11/10. Nhắn chủ nhà để hỏi giá.';
    const g = sbGia(null, { code: 'P0001', message: cau });
    const p = taoDichVuYeuCauSupabase(g.sb).gui({ canId: 'c1510', tu: '2026-10-10', den: '2026-10-12', loiNhan: '', clientId: 'k1' });
    await expect(p).rejects.toBeInstanceOf(LoiNguoiDung);
    await expect(p).rejects.toThrow(cau);
  });

  it('YC9.1-NT8 lỗi quyền có câu tiếng Việt hiện cho người dùng; lỗi mạng không', async () => {
    const g = sbGia(null, { code: '42501', message: 'Không gửi được yêu cầu. Chủ nhà đã xóa tài khoản trên Home247.' });
    await expect(taoDichVuYeuCauSupabase(g.sb).doc('y1')).rejects.toBeInstanceOf(LoiNguoiDung);
    const m = sbGia(null, { code: 'PGRST000', message: 'fetch failed' });
    await expect(taoDichVuYeuCauSupabase(m.sb).doc('y1')).rejects.not.toBeInstanceOf(LoiNguoiDung);
  });

  it('YC9.1-NT7 hủy qua fn_huy_yeu_cau, đọc qua fn_yeu_cau_cua_toi', async () => {
    const g = sbGia({ ...Y1, trang_thai: 'da_huy' });
    const dv = taoDichVuYeuCauSupabase(g.sb);
    expect((await dv.huy('y1')).trangThai).toBe('da_huy');
    expect(g.rpc).toHaveBeenCalledWith('fn_huy_yeu_cau', { p_yeu_cau_id: 'y1' });
    await dv.doc('y1');
    expect(g.rpc).toHaveBeenLastCalledWith('fn_yeu_cau_cua_toi', { p_yeu_cau_id: 'y1' });
  });
});

describe('YC9.4 · dịch vụ kết quả yêu cầu', () => {
  it('YC9.4-NT2 đọc kết quả qua fn_ket_qua_yeu_cau kèm lý do từ chối', async () => {
    const g = sbGia({ ...Y1, trang_thai: 'bi_tu_choi', ly_do_tu_choi: 'Đã có khách đặt', het_han_vi: null, con_xem_can: true });
    const kq = await taoDichVuYeuCauSupabase(g.sb).ketQua!('y1');
    expect(g.rpc).toHaveBeenCalledWith('fn_ket_qua_yeu_cau', { p_yeu_cau_id: 'y1' });
    expect(kq).toMatchObject({ trangThai: 'bi_tu_choi', lyDoTuChoi: 'Đã có khách đặt', hetHanVi: null, conXemCan: true });
  });

  it('YC9.4-NT4 kết quả Hết hạn mang lý do hết hạn', async () => {
    const g = sbGia({ ...Y1, trang_thai: 'het_han', het_han_vi: 'qua_14_ngay', con_xem_can: false });
    expect(await taoDichVuYeuCauSupabase(g.sb).ketQua!('y1')).toMatchObject({ trangThai: 'het_han', hetHanVi: 'qua_14_ngay', conXemCan: false });
  });

  it('YC9.4-NT5 căn tương tự qua fn_can_tuong_tu: giá bán của sale, không mang giá chủ nhà', async () => {
    const g = sbGia([{ can_id: 'c1103', ma_can: '1103', ten_toa: 'Sapphire', so_phong_ngu: 3, ten_chu: 'Anh Tuấn',
                       tong_gia_ban: 1600000, tu: '2026-10-10', den: '2026-10-12', tong_gia_chu: 1400000 }]);
    const ds = await taoDichVuYeuCauSupabase(g.sb).canTuongTu!('y1');
    expect(g.rpc).toHaveBeenCalledWith('fn_can_tuong_tu', { p_yeu_cau_id: 'y1' });
    expect(ds).toEqual([{ canId: 'c1103', maCan: '1103', tenToa: 'Sapphire', soPhongNgu: 3, tenChu: 'Anh Tuấn',
                          tongGiaBan: 1600000, tu: '2026-10-10', den: '2026-10-12' }]);
  });

  it('YC9.4 HV5 yêu cầu không phải của mình (42501) là lỗi có câu cho người dùng', async () => {
    const g = sbGia(null, { code: '42501', message: 'Không tìm thấy yêu cầu' });
    await expect(taoDichVuYeuCauSupabase(g.sb).ketQua!('y9')).rejects.toBeInstanceOf(LoiNguoiDung);
  });
});
