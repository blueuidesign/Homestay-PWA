// Test unit HV7 · Phiên hết hạn.
import { describe, expect, it, vi } from 'vitest';
import { LoiHetPhien, chayVoiPhien } from './phien';

describe('HV7 · Phiên hết hạn', () => {
  it('HV7-NT1: hết phiên thì làm mới rồi gửi lại một lần, việc vẫn được lưu', async () => {
    const viec = vi.fn().mockRejectedValueOnce(new LoiHetPhien()).mockResolvedValueOnce('đã lưu');
    const lamMoi = vi.fn().mockResolvedValue(true);
    expect(await chayVoiPhien(viec, lamMoi)).toEqual({ ok: true, giaTri: 'đã lưu' });
    expect(viec).toHaveBeenCalledTimes(2);
    expect(lamMoi).toHaveBeenCalledTimes(1);
  });

  it('HV7-NT2: làm mới không được thì báo cần đăng nhập, không gửi lại', async () => {
    const viec = vi.fn().mockRejectedValue(new LoiHetPhien());
    expect(await chayVoiPhien(viec, async () => false)).toEqual({ ok: false, canDangNhap: true });
    expect(viec).toHaveBeenCalledTimes(1);
  });

  it('HV7: lỗi khác được ném tiếp, không làm mới phiên', async () => {
    const lamMoi = vi.fn();
    await expect(chayVoiPhien(async () => { throw new Error('khác'); }, lamMoi)).rejects.toThrow('khác');
    expect(lamMoi).not.toHaveBeenCalled();
  });
});
