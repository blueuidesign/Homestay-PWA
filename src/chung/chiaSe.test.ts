// Test unit HV6 · Trình duyệt thiếu tính năng.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { CAU_DA_SAO_CHEP, CAU_THIEU_TINH_NANG, guiChu } from './chiaSe';

function datNav(v: object) {
  Object.defineProperty(globalThis, 'navigator', { value: v, configurable: true });
}
const gocNav = globalThis.navigator;
afterEach(() => datNav(gocNav));

describe('HV6 · Trình duyệt thiếu tính năng', () => {
  it('HV6-NT2: không có bảng chia sẻ thì sao chép chữ và báo toast', async () => {
    const viet = vi.fn().mockResolvedValue(undefined);
    datNav({ clipboard: { writeText: viet } });
    const toast = vi.fn();
    expect(await guiChu('Căn 1509', toast)).toBe('da-sao-chep');
    expect(viet).toHaveBeenCalledWith('Căn 1509');
    expect(toast).toHaveBeenCalledWith(CAU_DA_SAO_CHEP);
    expect(CAU_DA_SAO_CHEP).toBe('Đã sao chép, dán vào Zalo để gửi');
  });

  it('HV6: có bảng chia sẻ thì dùng nó', async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    datNav({ share });
    expect(await guiChu('x', vi.fn())).toBe('da-chia-se');
    expect(share).toHaveBeenCalled();
  });

  it('HV6: không có cách nào thì báo, không đứng im', async () => {
    datNav({});
    const toast = vi.fn();
    expect(await guiChu('x', toast)).toBe('khong-lam-duoc');
    expect(toast).toHaveBeenCalledWith(CAU_THIEU_TINH_NANG);
  });
});
