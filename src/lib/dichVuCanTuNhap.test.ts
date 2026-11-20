// Test unit dịch vụ căn tự nhập (YC10.3, US56): tham số lệnh tạo, sửa, đọc chi tiết, lỗi của database.
import type { SupabaseClient } from '@supabase/supabase-js';
import { describe, expect, it, vi } from 'vitest';
import { LoiNguoiDung } from '../chung/matKetNoi';
import { taoDichVuCanTuNhapSupabase, thamSoSua } from './dichVuCanTuNhap';

const CT = {
  can_id: 'villa', ma_can: 'Villa Tuần Châu', toa_nha_id: null, ten_toa: null, so_phong_ngu: 4, so_giuong: 3, loai_view: 'bien',
  chu_can_ten: 'Chú Bình', chu_can_sdt: '0904123330', gia_chu_thuong: 1400000, gia_chu_cuoi_tuan: null,
  anh: [{ id: 'a1', duong_dan: 'hung/a.jpg' }],
  dat_phong: [{ id: 'V1', ngay_nhan: '2026-09-20', ngay_tra: '2026-09-22', tra_chu: 2800000, thu_khach: 3400000 }],
};

function sbGia(kq: Record<string, { data?: unknown; error?: unknown }>) {
  const rpc = vi.fn(async (ten: string, _p?: unknown) => ({ data: kq[ten]?.data ?? null, error: kq[ten]?.error ?? null }));
  const createSignedUrls = vi.fn(async (ds: string[]) => ({ data: ds.map((p) => ({ path: p, signedUrl: `https://kho/${p}` })) }));
  const sb = { rpc, storage: { from: () => ({ createSignedUrls }) } } as unknown as SupabaseClient;
  return { sb, rpc };
}

describe('YC10.3 · dịch vụ căn tự nhập', () => {
  it('YC10.3-NT2 tạo căn không giá chủ, không số giường: gửi null; không ảnh thì p_anh null', async () => {
    const g = sbGia({ fn_tao_can_tu_nhap: { data: 'id-moi' } });
    const id = await taoDichVuCanTuNhapSupabase(g.sb).tao({
      tenChu: 'Chú Bình', soDienThoai: '0904123330', maCan: 'Villa', soPhongNgu: 2, clientId: 'c1', toaNhaId: null, loaiView: null,
      soGiuong: null, giaThuong: null, giaCuoiTuan: null, anh: [],
    });
    expect(id).toBe('id-moi');
    expect(g.rpc).toHaveBeenCalledWith('fn_tao_can_tu_nhap', expect.objectContaining({
      p_chu_can_ten: 'Chú Bình', p_so_phong_ngu: 2, p_gia_chu_thuong: null, p_so_giuong: null, p_anh: null, p_client_id: 'c1',
    }));
  });

  it('YC10.3-NT1 database từ chối bằng câu (P0001) thì LoiNguoiDung giữ câu đó', async () => {
    const g = sbGia({ fn_tao_can_tu_nhap: { error: { code: 'P0001', message: 'Còn thiếu: mã căn' } } });
    await expect(taoDichVuCanTuNhapSupabase(g.sb).tao({
      tenChu: 'a', soDienThoai: '1', maCan: '', soPhongNgu: 1, clientId: 'c', toaNhaId: null, loaiView: null, soGiuong: null,
      giaThuong: null, giaCuoiTuan: null, anh: [],
    })).rejects.toEqual(new LoiNguoiDung('Còn thiếu: mã căn'));
  });

  it('YC10.3-NT6 đọc chi tiết: đặt phòng trả chủ, thu khách; ảnh có hạn', async () => {
    const g = sbGia({ fn_can_tu_nhap: { data: CT } });
    const ct = await taoDichVuCanTuNhapSupabase(g.sb).doc('villa');
    expect(g.rpc).toHaveBeenCalledWith('fn_can_tu_nhap', { p_can_id: 'villa' });
    expect(ct.datPhong).toEqual([{ id: 'V1', ngayNhan: '2026-09-20', ngayTra: '2026-09-22', traChu: 2_800_000, thuKhach: 3_400_000 }]);
    expect(ct.anh).toEqual([{ id: 'a1', url: 'https://kho/hung/a.jpg' }]);
    expect([ct.tenChu, ct.soDienThoai, ct.giaThuong, ct.giaCuoiTuan]).toEqual(['Chú Bình', '0904123330', 1_400_000, null]);
  });

  it('YC10.3-NT8 xóa số chủ căn: p_sua có chu_can_sdt null; chỉ gửi ô đã đổi', async () => {
    expect(thamSoSua({ soDienThoai: null, giaThuong: 1_500_000 })).toEqual({ chu_can_sdt: null, gia_chu_thuong: 1_500_000 });
    const g = sbGia({});
    await taoDichVuCanTuNhapSupabase(g.sb).sua('villa', { soDienThoai: null });
    expect(g.rpc).toHaveBeenCalledWith('fn_sua_can_tu_nhap', { p_can_id: 'villa', p_sua: { chu_can_sdt: null } });
  });

  it('YC10.3-NT9 xóa gọi fn_xoa_can_tu_nhap; không còn quyền (42501) thì LoiNguoiDung', async () => {
    const g = sbGia({ fn_xoa_can_tu_nhap: { error: { code: '42501', message: 'Không tìm thấy căn' } } });
    await expect(taoDichVuCanTuNhapSupabase(g.sb).xoa('villa')).rejects.toBeInstanceOf(LoiNguoiDung);
    expect(g.rpc).toHaveBeenCalledWith('fn_xoa_can_tu_nhap', { p_can_id: 'villa' });
  });
});
