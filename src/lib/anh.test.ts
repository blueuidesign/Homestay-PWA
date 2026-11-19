// Test unit luật ảnh căn phía app (YC3.3 Luật kiểm "File ảnh", bước 23, 26).
import { describe, expect, it } from 'vitest';
import { CAU_LOI_FILE, cauBoAnh, chiaChoTrong, CO_TOI_DA, coMoi, kiemFileAnh, loaiFile } from './anh';

const MB = 1024 * 1024;

describe('YC3.3 · luật file ảnh', () => {
  it('YC3.3-NT6 file 20 MB hay file PDF thì báo "Ảnh phải là JPEG, PNG hoặc HEIC, tối đa 15 MB"', () => {
    expect(kiemFileAnh({ type: 'image/jpeg', name: 'a.jpg', size: 20 * MB })).toBe(CAU_LOI_FILE);
    expect(kiemFileAnh({ type: 'application/pdf', name: 'a.pdf', size: 100_000 })).toBe(CAU_LOI_FILE);
    expect(CAU_LOI_FILE).toBe('Ảnh phải là JPEG, PNG hoặc HEIC, tối đa 15 MB');
  });

  it('YC3.3-NT6 JPEG, PNG, HEIC tới 15 MB thì nhận; HEIC không ghi loại thì nhận theo đuôi', () => {
    expect(kiemFileAnh({ type: 'image/jpeg', name: 'a.jpg', size: CO_TOI_DA })).toBeNull();
    expect(kiemFileAnh({ type: 'image/png', name: 'a.png', size: 1 })).toBeNull();
    expect(kiemFileAnh({ type: 'image/heic', name: 'a.heic', size: 1 })).toBeNull();
    expect(kiemFileAnh({ type: '', name: 'IMG_1.HEIC', size: 1 })).toBeNull();
    expect(loaiFile({ type: '', name: 'x.pdf' })).toBe('');
    expect(kiemFileAnh({ type: 'image/gif', name: 'a.gif', size: 1 })).toBe(CAU_LOI_FILE);
    expect(kiemFileAnh({ type: 'image/jpeg', name: 'a.jpg', size: CO_TOI_DA + 1 })).toBe(CAU_LOI_FILE);
  });

  it('YC3.3-NT3 chọn 15 ảnh khi chưa có ảnh nào thì chỉ nhận 12, bỏ 3', () => {
    const r = chiaChoTrong(0, Array.from({ length: 15 }, (_, i) => i));
    expect(r.nhan).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]);
    expect(r.bo).toBe(3);
    expect(chiaChoTrong(10, [1, 2, 3])).toEqual({ nhan: [1, 2], bo: 1 });
    expect(chiaChoTrong(12, [1])).toEqual({ nhan: [], bo: 1 });
    expect(cauBoAnh(3)).toBe('Mỗi căn tối đa 12 ảnh. Đã bỏ 3 ảnh.');
  });

  it('YC3.3 bước 23 thu ảnh về cạnh dài 1600 px, giữ tỉ lệ; ảnh nhỏ giữ nguyên', () => {
    expect(coMoi(4032, 3024)).toEqual({ rong: 1600, cao: 1200 });
    expect(coMoi(3024, 4032)).toEqual({ rong: 1200, cao: 1600 });
    expect(coMoi(800, 600)).toEqual({ rong: 800, cao: 600 });
  });
});
