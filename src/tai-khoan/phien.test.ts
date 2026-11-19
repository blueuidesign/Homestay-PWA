// Test unit cho cách đọc kết quả đăng nhập của Supabase Auth (EN3, YC1.2 bước 3, QT5.5).
import { describe, expect, it } from 'vitest';
import { docKetQuaDangNhap, dangNhapThuDuocBat } from './phien';

describe('EN3 · đọc kết quả đăng nhập', () => {
  it('YC1.2 bước 3: Supabase báo sai email hoặc mật khẩu thì là "sai"', () => {
    expect(docKetQuaDangNhap({ code: 'invalid_credentials', status: 400, message: 'Invalid login credentials' })).toBe('sai');
    expect(docKetQuaDangNhap({ status: 400, message: 'Invalid login credentials' })).toBe('sai');
  });
  it('không có lỗi là "ok"', () => {
    expect(docKetQuaDangNhap(null)).toBe('ok');
  });
  it('QT5.5: lỗi mạng, lỗi máy chủ, lỗi lạ là "loi" (app hiện câu chung)', () => {
    expect(docKetQuaDangNhap({ status: 0, message: 'Failed to fetch' })).toBe('loi');
    expect(docKetQuaDangNhap({ status: 500, message: 'Internal' })).toBe('loi');
    expect(docKetQuaDangNhap({ code: 'over_request_rate_limit', status: 429, message: 'x' })).toBe('loi');
  });
});

describe('EN3 · chỉ bật đăng nhập thử khi cấu hình cho phép', () => {
  const du = { VITE_DANG_NHAP_THU: '1', VITE_SUPABASE_URL: 'https://x.supabase.co', VITE_SUPABASE_ANON_KEY: 'k' };
  it('YC1.2: bật khi có cờ đăng nhập thử và đủ địa chỉ, khóa công khai của Supabase', () => {
    expect(dangNhapThuDuocBat(du)).toBe(true);
  });
  it('YC1.2: thiếu cờ, cờ khác "1", hay thiếu địa chỉ, khóa thì tắt (production không đặt cờ)', () => {
    expect(dangNhapThuDuocBat({ ...du, VITE_DANG_NHAP_THU: undefined })).toBe(false);
    expect(dangNhapThuDuocBat({ ...du, VITE_DANG_NHAP_THU: 'true' })).toBe(false);
    expect(dangNhapThuDuocBat({ ...du, VITE_SUPABASE_URL: '' })).toBe(false);
    expect(dangNhapThuDuocBat({ ...du, VITE_SUPABASE_ANON_KEY: undefined })).toBe(false);
  });
});
