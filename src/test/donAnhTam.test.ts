// Test unit EN10 · việc định kỳ xóa file ảnh trong kho anh-can (scripts/don-anh-tam.mjs). Client Supabase giả, không gọi mạng.
import { describe, expect, it, vi } from 'vitest';
import { donAnhTam } from '../../scripts/don-anh-tam.mjs';

function client(ds: string[], khongXoaDuoc: string[] = []) {
  const goi: string[] = [];
  const rpc = vi.fn(async (ten: string, thamSo?: Record<string, unknown>) => {
    goi.push(ten);
    if (ten === 'fn_file_cho_xoa') return { data: ds.slice(0, thamSo!.p_so as number), error: null };
    return { data: null, error: null };
  });
  const remove = vi.fn(async (p: string[]) => ({ data: p.filter((x) => !khongXoaDuoc.includes(x)).map((name) => ({ name })), error: null }));
  return { sb: { rpc, storage: { from: vi.fn(() => ({ remove })) } }, rpc, remove, goi };
}

describe('EN10 · dọn file ảnh', () => {
  it('EN10 YC3 Dữ liệu dọn ảnh tạm, xóa file trong danh sách qua dịch vụ kho, rồi bỏ khỏi hàng đợi', async () => {
    const c = client(['u/a.jpg', 'u/c.jpg']);
    expect(await donAnhTam(c.sb)).toBe(2);
    expect(c.goi).toEqual(['fn_don_anh_tam', 'fn_file_cho_xoa', 'fn_da_xoa_file']);
    expect(c.sb.storage.from).toHaveBeenCalledWith('anh-can');
    expect(c.remove).toHaveBeenCalledWith(['u/a.jpg', 'u/c.jpg']);
    expect(c.rpc).toHaveBeenLastCalledWith('fn_da_xoa_file', { p_duong_dan: ['u/a.jpg', 'u/c.jpg'] });
  });

  it('EN10 file dịch vụ kho chưa xóa được thì giữ trong hàng đợi cho lượt sau', async () => {
    const c = client(['u/a.jpg', 'u/c.jpg'], ['u/c.jpg']);
    expect(await donAnhTam(c.sb)).toBe(1);
    expect(c.rpc).toHaveBeenLastCalledWith('fn_da_xoa_file', { p_duong_dan: ['u/a.jpg'] });
  });

  it('EN10 không có file cần xóa thì không gọi dịch vụ kho', async () => {
    const c = client([]);
    expect(await donAnhTam(c.sb)).toBe(0);
    expect(c.remove).not.toHaveBeenCalled();
  });
});
