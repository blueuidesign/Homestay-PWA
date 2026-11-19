// Test unit dịch vụ đặt phòng (US28): lệnh ghi fn_tao_booking khi phiên hết hạn (HV7 bước 1). Supabase giả, không gọi mạng.
import type { SupabaseClient } from '@supabase/supabase-js';
import { describe, expect, it, vi } from 'vitest';
import { LoiNguoiDung } from '../chung/matKetNoi';
import { laLoiHetPhien, taoDichVuDatPhongSupabase, type DatPhongMoi } from './dichVuDatPhong';

const DON: DatPhongMoi = {
  canId: 'c1509', ngayNhan: '2026-10-31', ngayTra: '2026-11-02', tienPhong: 2200000, clientId: '11111111-1111-4111-8111-111111111111',
  saleId: null, tenKhach: null, sdtKhach: null, trangThaiTien: 'chua_coc', tienCoc: null, soKhach: null, gioNhan: null, gioTra: null, ghiChu: null,
};

function sbGia(traLoi: { data: unknown; error: { code?: string; message?: string } | null }[], lamMoi = { error: null as unknown }) {
  const rpc = vi.fn(async () => traLoi.shift()!);
  const refreshSession = vi.fn(async () => lamMoi);
  return { sb: { rpc, auth: { refreshSession } } as unknown as SupabaseClient, rpc, refreshSession };
}

describe('HV7 · CN4 lưu khi phiên hết hạn', () => {
  it('HV7-NT1 phiên hết hạn lúc bấm "Thêm đặt phòng" thì làm mới phiên, gửi lại một lần cùng mã lần gửi, đặt phòng được lưu', async () => {
    const { sb, rpc, refreshSession } = sbGia([
      { data: null, error: { code: 'PGRST303', message: 'JWT expired' } },
      { data: 'b-moi', error: null },
    ]);
    const id = await taoDichVuDatPhongSupabase(sb).taoDatPhong!(DON);
    expect(id).toBe('b-moi');
    expect(refreshSession).toHaveBeenCalledTimes(1);
    expect(rpc).toHaveBeenCalledTimes(2);
    const calls = rpc.mock.calls as unknown as [string, { p_client_id: string }][];
    expect(calls[1]![1].p_client_id).toBe(DON.clientId);
    expect(calls[0]![0]).toBe('fn_tao_booking');
  });

  it('HV7 bước 2 làm mới phiên không được thì không gửi lại, báo lỗi (không phải câu cho người dùng)', async () => {
    const { sb, rpc } = sbGia([{ data: null, error: { code: 'PGRST303', message: 'JWT expired' } }], { error: new Error('hết') });
    await expect(taoDichVuDatPhongSupabase(sb).taoDatPhong!(DON)).rejects.not.toBeInstanceOf(LoiNguoiDung);
    expect(rpc).toHaveBeenCalledTimes(1);
  });

  it('YC5.3 bước 11 QT5.5 lỗi P0001 trùng đêm thì không làm mới phiên, trả câu cho người dùng', async () => {
    const { sb, refreshSession } = sbGia([{ data: null, error: { code: 'P0001', message: 'Căn đã có đặt phòng trong những đêm này' } }]);
    await expect(taoDichVuDatPhongSupabase(sb).taoDatPhong!(DON)).rejects.toThrow(new LoiNguoiDung('Căn đã có đặt phòng trong những đêm này'));
    expect(refreshSession).not.toHaveBeenCalled();
  });

  it('HV7 nhận ra lỗi phiên hết hạn của PostgREST', () => {
    expect(laLoiHetPhien({ code: 'PGRST301' })).toBe(true);
    expect(laLoiHetPhien({ message: 'JWT expired' })).toBe(true);
    expect(laLoiHetPhien({ code: 'P0001', message: 'Ngày trả phải sau ngày nhận' })).toBe(false);
    expect(laLoiHetPhien(null)).toBe(false);
  });
});
