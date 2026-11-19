// Dịch vụ giả cho test unit màn đăng nhập (không gọi mạng).
import { vi } from 'vitest';
import type { DichVuXacThuc } from '../lib/xacThuc';

export function dichVuGia(ghiDe: Partial<DichVuXacThuc> = {}): DichVuXacThuc {
  return {
    layPhien: vi.fn(async () => null),
    guiMa: vi.fn(async () => 'da-gui' as const),
    xacNhanMa: vi.fn(async () => 'dung' as const),
    layHoSo: vi.fn(async () => null),
    dangKy: vi.fn(async () => {}),
    chonVai: vi.fn(async () => {}),
    dangXuat: vi.fn(async () => {}),
    theoDoiPhien: vi.fn(() => () => {}),
    ...ghiDe,
  };
}
