// Test unit lọc tòa không dấu, xếp chip tòa (YC3.4 bước 29, 31, YC3.4-NT1).
import { describe, expect, it } from 'vitest';
import { boDau, dongThemToaMoi, locToa, xepChipToa, type ToaNha } from './toaNha';

// DLM: 5 tòa Home247 đặt sẵn; Green Bay có khu vực Bãi Cháy (supabase/seed/dlm.sql).
const DLM: ToaNha[] = [
  { id: 't1', ten: 'ICON40', khuVuc: null, home247: true },
  { id: 't2', ten: 'Sapphire', khuVuc: null, home247: true },
  { id: 't3', ten: 'À La Carte', khuVuc: null, home247: true },
  { id: 't4', ten: 'Green Bay', khuVuc: 'Bãi Cháy', home247: true },
  { id: 't5', ten: 'Mường Thanh', khuVuc: null, home247: true },
];
const BIM: ToaNha = { id: 'u1', ten: 'Bim Hạ Long', khuVuc: null, home247: false };
const ten = (ds: ToaNha[]) => ds.map((t) => t.ten);

describe('YC3.4 bước 31 · lọc tòa', () => {
  it('YC3.4-NT1 gõ "green" thì chỉ còn "Green Bay" và có dòng "+ Thêm tòa mới "green""', () => {
    expect(ten(locToa(DLM, 'green'))).toEqual(['Green Bay']);
    expect(dongThemToaMoi('green')).toBe('+ Thêm tòa mới "green"');
  });

  it('YC3.4 bước 31 không phân biệt hoa thường và dấu', () => {
    expect(ten(locToa(DLM, 'GREEN'))).toEqual(['Green Bay']);
    expect(ten(locToa(DLM, 'muong'))).toEqual(['Mường Thanh']);
    expect(ten(locToa(DLM, 'MƯỜNG'))).toEqual(['Mường Thanh']);
    expect(ten(locToa(DLM, 'a la'))).toEqual(['À La Carte']);
    expect(ten(locToa([...DLM, BIM], 'ha long'))).toEqual(['Bim Hạ Long']);
    expect(boDau('Đồi Đá')).toBe('doi da');
  });

  it('YC3.4 bước 30 chưa gõ thì hiện cả danh sách, không có dòng thêm tòa mới', () => {
    expect(locToa(DLM, '')).toEqual(DLM);
    expect(locToa(DLM, '   ')).toEqual(DLM);
    expect(dongThemToaMoi('  ')).toBeNull();
  });

  it('YC3.4 bước 31 dòng thêm tòa mới bỏ khoảng trắng đầu cuối; không khớp tòa nào thì danh sách trống', () => {
    expect(dongThemToaMoi('  Bim Hạ Long ')).toBe('+ Thêm tòa mới "Bim Hạ Long"');
    expect(locToa(DLM, 'xyz')).toEqual([]);
  });
});

describe('YC3.4 bước 29 · chip tòa', () => {
  it('YC3.4 bước 29 chưa dùng tòa nào thì 5 tòa Home247 đặt sẵn theo thứ tự danh sách', () => {
    expect(ten(xepChipToa([...DLM, { id: 't6', ten: 'Vinhomes', khuVuc: null, home247: true }], []))).toEqual(
      ['ICON40', 'Sapphire', 'À La Carte', 'Green Bay', 'Mường Thanh']);
  });

  it('YC3.4 bước 29 tòa mình đã dùng đứng trước (mới dùng trước), kể cả tòa người dùng thêm; tối đa 5 chip tòa', () => {
    const chip = xepChipToa([...DLM, BIM], ['u1', 't4']);
    expect(ten(chip)).toEqual(['Bim Hạ Long', 'Green Bay', 'ICON40', 'Sapphire', 'À La Carte']);
  });

  it('YC3.4 bước 29 tòa người dùng thêm mà mình chưa dùng thì không thành chip', () => {
    expect(ten(xepChipToa([...DLM, BIM], []))).not.toContain('Bim Hạ Long');
  });

  it('YC3.4 bước 32 tòa vừa chọn ở danh sách mà chưa có chip thì đứng đầu hàng chip', () => {
    expect(ten(xepChipToa([...DLM, BIM], [], 'u1'))).toEqual(['Bim Hạ Long', 'ICON40', 'Sapphire', 'À La Carte', 'Green Bay']);
    expect(ten(xepChipToa(DLM, [], 't2'))).toEqual(ten(xepChipToa(DLM, [])));
  });
});
