// Test unit cho bộ chọn màn theo địa chỉ và phiên (YC1.2, YC1 Quy tắc của nhóm, QD8).
import { describe, expect, it } from 'vitest';
import { chonMan, chonManChu, laDuongDanLink } from './dieuHuong';

const daDangKy = { ten: 'Chị Hoa', soDienThoai: '0900000001', vaiChon: 'chu_nha' as const };

describe('YC1.2 · chọn màn', () => {
  it('YC1.2-NT1 chưa đăng nhập mở địa chỉ nào của app thì về A1', () => {
    for (const d of ['/', '/lich', '/ca-nhan', '/can/1509', '/dang-ky', '/l/', '/x', '/abc?x=1']) {
      expect(chonMan({ duongDan: d, phien: 'chua', hoSo: null }), d).toBe('A1');
    }
  });

  it('YC1.2-NT1 trừ link mời và link xin lịch: xem trước không cần đăng nhập (QD8)', () => {
    expect(chonMan({ duongDan: '/l/Ab3xYz9k', phien: 'chua', hoSo: null })).toBe('xem-truoc-link');
    expect(chonMan({ duongDan: '/x/Ab3xYz9k', phien: 'chua', hoSo: null })).toBe('xem-truoc-link');
    expect(laDuongDanLink('/l/Ab3xYz9k')).toBe(true);
    expect(laDuongDanLink('/l/')).toBe(false);
    expect(laDuongDanLink('/lich')).toBe(false);
  });

  it('YC1.2 đang đọc phiên thì chưa chọn màn', () => {
    expect(chonMan({ duongDan: '/', phien: 'dang-doc', hoSo: null })).toBe('dang-tai');
  });

  it('YC1 Quy tắc: đã đăng nhập mà hồ sơ chưa có tên hoặc số thì mọi màn về màn nhập số', () => {
    for (const d of ['/', '/lich', '/l/Ab3xYz9k']) {
      expect(chonMan({ duongDan: d, phien: 'co', hoSo: { ten: null, soDienThoai: null, vaiChon: null } }), d).toBe('hoan-tat');
      expect(chonMan({ duongDan: d, phien: 'co', hoSo: { ...daDangKy, soDienThoai: null } }), d).toBe('hoan-tat');
    }
  });

  it('YC1.2 đăng nhập xong: chưa chọn vai thì A3, đã chọn thì tab Lịch, đến từ link thì màn của link', () => {
    expect(chonMan({ duongDan: '/', phien: 'co', hoSo: { ...daDangKy, vaiChon: null } })).toBe('A3');
    expect(chonMan({ duongDan: '/', phien: 'co', hoSo: daDangKy })).toBe('lich');
    expect(chonMan({ duongDan: '/l/Ab3xYz9k', phien: 'co', hoSo: { ...daDangKy, vaiChon: null } })).toBe('xem-truoc-link');
  });

  it('YC1.2 đã đăng nhập mà chưa đọc được hồ sơ thì đang tải', () => {
    expect(chonMan({ duongDan: '/', phien: 'co', hoSo: undefined })).toBe('dang-tai');
  });
});

describe('YC4.2 bước 1 · đường dẫn tab Giá của căn', () => {
  it('YC4.2 bước 1 /can/<mã>/gia là CN6 tab Giá; /can/<mã> vẫn là tab Thông tin', () => {
    expect(chonManChu('/can/00000000-0000-4000-8000-000000000102/gia')).toEqual({ tab: 'can-gia', id: '00000000-0000-4000-8000-000000000102' });
    expect(chonManChu('/can/c3402/gia/')).toEqual({ tab: 'can-gia', id: 'c3402' });
    expect(chonManChu('/can/c3402')).toEqual({ tab: 'can-chi-tiet', id: 'c3402' });
    expect(chonManChu('/can/moi/gia')).toEqual({ tab: 'lich' });
  });
});

describe('YC4.6 bước 1 · đường dẫn P6', () => {
  it('YC4.6 bước 1 /ca-nhan/dem-cuoi-tuan là P6; /ca-nhan vẫn là tab Cá nhân', () => {
    expect(chonManChu('/ca-nhan/dem-cuoi-tuan')).toEqual({ tab: 'dem-cuoi-tuan' });
    expect(chonManChu('/ca-nhan/dem-cuoi-tuan/')).toEqual({ tab: 'dem-cuoi-tuan' });
    expect(chonManChu('/ca-nhan')).toEqual({ tab: 'ca-nhan' });
  });
});

describe('YC6.3 · địa chỉ link mời', () => {
  it('YC6.3 pwa.md P4 /l/<mã> là link mời; /x/<mã> và địa chỉ khác không phải', async () => {
    const { maLinkMoi } = await import('./dieuHuong');
    expect(maLinkMoi('/l/Ab3xYz9k')).toBe('Ab3xYz9k');
    expect(maLinkMoi('/l/Ab3xYz9k/')).toBe('Ab3xYz9k');
    expect(maLinkMoi('/x/Ab3xYz9k')).toBeNull();
    expect(maLinkMoi('/l/')).toBeNull();
    expect(maLinkMoi('/lich')).toBeNull();
  });
});

describe('YC6.5 · mã link xin lịch', () => {
  it('YC6.5 pwa.md P4 /x/<mã> là link xin lịch; /l/<mã> và địa chỉ khác không phải', async () => {
    const { maLinkXinLich } = await import('./dieuHuong');
    expect(maLinkXinLich('/x/kQmZpRtw')).toBe('kQmZpRtw');
    expect(maLinkXinLich('/x/kQmZpRtw/')).toBe('kQmZpRtw');
    expect(maLinkXinLich('/l/kQmZpRtw')).toBeNull();
    expect(maLinkXinLich('/x/')).toBeNull();
    expect(maLinkXinLich('/sale')).toBeNull();
  });
});

describe('YC1.4 · đường dẫn P2', () => {
  it('YC1.4 bước 1 /ca-nhan/ho-so là P2 Thông tin cá nhân', () => {
    expect(chonManChu('/ca-nhan/ho-so')).toEqual({ tab: 'ho-so' });
    expect(chonManChu('/ca-nhan/ho-so/')).toEqual({ tab: 'ho-so' });
  });
});

describe('YC1.5 · đường dẫn P5', () => {
  it('YC1.5 bước 1 /ca-nhan/gio là P5 Giờ nhận, trả phòng', () => {
    expect(chonManChu('/ca-nhan/gio')).toEqual({ tab: 'gio' });
  });
});

describe('YC1.7 · đường dẫn P9', () => {
  it('YC1.7 bước 1 /ca-nhan/huong-dan là P9 Hướng dẫn sử dụng', () => {
    expect(chonManChu('/ca-nhan/huong-dan')).toEqual({ tab: 'huong-dan' });
  });
});
