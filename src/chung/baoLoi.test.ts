// Test unit báo lỗi (YC15.3-NT1). Không gọi mạng.
import { afterEach, describe, expect, it, vi } from 'vitest';
import { banGhiTuLoi, caiBaoLoi, lamSachLoi, type BanGhiLoi } from './baoLoi';

let go: (() => void) | undefined;
afterEach(() => { go?.(); go = undefined; });

describe('YC15.3 · Báo lỗi', () => {
  it('YC15.3-NT1 bản ghi lỗi không có số điện thoại, email', () => {
    const s = lamSachLoi('Không lưu được khách 0912 345 678 (+84912345678, 0900.000.077) mai.nguyen@gmail.com');
    expect(s).not.toMatch(/\d{3}[ .]?\d{3}[ .]?\d{3}/);
    expect(s).not.toContain('@');
    expect(s).toContain('[số]');
    expect(s).toContain('[email]');
    expect(lamSachLoi('Lỗi 2026-11-21 lúc 14:00, tiền 2200000')).toContain('2026-11-21');
  });

  it('YC15.3-NT1 đường dẫn bỏ phần sau dấu ?, ngăn xếp cũng được làm sạch', () => {
    const e = new Error('Số 0912345678 sai'); e.stack = 'Error at x (0912345678)';
    const b = banGhiTuLoi(e, 'https://home247.vn/dat-phong/moi?sdt=0912345678#a', '1.0.0', 'UA');
    expect(b.duongDan).toBe('/dat-phong/moi');
    expect(b.thongDiep).toBe('Error: Số [số] sai');
    expect(b.nganXep).not.toContain('0912345678');
  });

  it('YC15.3-NT1 lỗi không ai bắt thì gửi một lần, cùng thông điệp không gửi lại', async () => {
    const gui = vi.fn(async (_b: BanGhiLoi) => undefined);
    go = caiBaoLoi(gui, 'thu');
    window.dispatchEvent(new ErrorEvent('error', { error: new Error('hỏng') }));
    window.dispatchEvent(new ErrorEvent('error', { error: new Error('hỏng') }));
    const ev = new Event('unhandledrejection') as PromiseRejectionEvent;
    Object.defineProperty(ev, 'reason', { value: new TypeError('mất mạng') });
    window.dispatchEvent(ev);
    expect(gui).toHaveBeenCalledTimes(2);
    expect(gui.mock.calls[0]![0]).toMatchObject({ thongDiep: 'Error: hỏng', phienBan: 'thu' });
  });

  it('YC15.3 gửi lỗi mà lỗi thì không ném ra ngoài; mỗi phiên tối đa 10 lỗi', async () => {
    const gui = vi.fn(async (_b: BanGhiLoi) => { throw new Error('mạng'); });
    go = caiBaoLoi(gui, 'thu');
    for (let i = 0; i < 15; i++) window.dispatchEvent(new ErrorEvent('error', { error: new Error(`lỗi ${i}`) }));
    expect(gui).toHaveBeenCalledTimes(10);
  });
});
