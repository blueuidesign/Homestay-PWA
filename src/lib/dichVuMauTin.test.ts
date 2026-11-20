// Test unit dịch vụ và hàm kiểm mẫu tin gửi khách (YC8.2, US49): đọc, lưu qua fn_*, chèn ô, kiểm mẫu như database.
import type { SupabaseClient } from '@supabase/supabase-js';
import { describe, expect, it, vi } from 'vitest';
import { LoiNguoiDung } from '../chung/matKetNoi';
import { MAU_TIN_MAC_DINH } from './guiKhach';
import { CAU_CAN_DANH_SACH, CAU_QUA_DAI, chenO, loiMauTin, O_CHEN, taoDichVuMauTinSupabase } from './dichVuMauTin';

function sbGia(data: unknown, error: unknown = null) {
  const rpc = vi.fn(async () => ({ data, error }));
  return { sb: { rpc } as unknown as SupabaseClient, rpc };
}

describe('YC8.2 · dịch vụ mẫu tin', () => {
  it('YC8.2 bước 1: năm ô chèn theo thứ tự trên màn', () => {
    expect(O_CHEN).toEqual(['[Ngày]', '[Số đêm]', '[Số căn]', '[Danh sách căn]', '[Tên sale]']);
  });

  it('YC8.2 bước 1: đọc mẫu qua fn_mau_tin; database không trả gì thì mẫu mặc định', async () => {
    const g = sbGia('Mẫu riêng [Danh sách căn]');
    expect(await taoDichVuMauTinSupabase(g.sb).doc()).toBe('Mẫu riêng [Danh sách căn]');
    expect(g.rpc).toHaveBeenCalledWith('fn_mau_tin');
    expect(await taoDichVuMauTinSupabase(sbGia(null).sb).doc()).toBe(MAU_TIN_MAC_DINH);
  });

  it('YC8.2-NT3 bước 5: lưu mẫu gọi fn_dat_mau_tin với đúng chữ', async () => {
    const g = sbGia(null);
    await taoDichVuMauTinSupabase(g.sb).luu('Mới [Danh sách căn]');
    expect(g.rpc).toHaveBeenCalledWith('fn_dat_mau_tin', { p_mau: 'Mới [Danh sách căn]' });
  });

  it('YC8.2-NT5: database từ chối (22023) thì báo câu tiếng Việt cho người dùng', async () => {
    const g = sbGia(null, { code: '22023', message: 'Mẫu cần có [Danh sách căn]' });
    await expect(taoDichVuMauTinSupabase(g.sb).luu('x')).rejects.toBeInstanceOf(LoiNguoiDung);
    await expect(taoDichVuMauTinSupabase(g.sb).luu('x')).rejects.toThrow('Mẫu cần có [Danh sách căn]');
  });

  it('YC8.2-NT5: mẫu rỗng, thiếu [Danh sách căn] hay 2.001 ký tự thì có lỗi; đúng 2.000 ký tự thì không', () => {
    expect(loiMauTin('')).toBe(CAU_CAN_DANH_SACH);
    expect(loiMauTin('   ')).toBe(CAU_CAN_DANH_SACH);
    expect(loiMauTin('Em gửi anh chị [Số căn] căn')).toBe(CAU_CAN_DANH_SACH);
    expect(loiMauTin('[danh sách căn]')).toBe(CAU_CAN_DANH_SACH);
    expect(loiMauTin('[Danh sách căn]' + 'a'.repeat(1986))).toBe(CAU_QUA_DAI);
    expect(loiMauTin('[Danh sách căn]' + 'ạ'.repeat(1985))).toBeNull();
    expect(loiMauTin(MAU_TIN_MAC_DINH)).toBeNull();
  });

  it('YC8.2-NT1 bước 2: chèn ô vào chỗ con trỏ, con trỏ đứng sau ô vừa chèn', () => {
    expect(chenO('Em gửi  nhé', '[Ngày]', 7, 7)).toEqual({ mau: 'Em gửi [Ngày] nhé', conTro: 13 });
    expect(chenO('Em gửi XX nhé', '[Ngày]', 7, 9)).toEqual({ mau: 'Em gửi [Ngày] nhé', conTro: 13 });
    expect(chenO('abc', '[Tên sale]', 99, 99)).toEqual({ mau: 'abc[Tên sale]', conTro: 13 });
  });
});
