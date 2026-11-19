// Test unit màn CN5 Danh sách căn (YC3.1 bước 9 đến 14).
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { CanTomTat } from '../lib/can';
import { CN5DanhSachCan } from './CN5DanhSachCan';

afterEach(cleanup);

const can = (ghiDe: Partial<CanTomTat> = {}): CanTomTat => ({
  id: 'c1509', maCan: '1509', soPhongNgu: 2, soGiuong: 3, loaiView: 'bien', tenToa: 'ICON40',
  soAnh: 12, anhDaiDien: 'https://anh.vidu.test/1509.jpg', moiThem: false, khachDen: null, ...ghiDe,
});

// Bộ của Chị Hoa (DLM): 1509 và 3402.
const CUA_HOA = [can(), can({ id: 'c3402', maCan: '3402', soPhongNgu: 1, soGiuong: null, tenToa: 'Sapphire', soAnh: 3 })];

function ve(ds: CanTomTat[], mo = vi.fn(), them = vi.fn()) {
  render(<CN5DanhSachCan ds={ds} onMoCan={mo} onThemCan={them} />);
  return { mo, them };
}

describe('YC3.1 · CN5 Danh sách căn', () => {
  it('YC3.1-NT2 Chị Hoa có 2 căn thì tab Căn ghi "2 căn" và có đúng 2 thẻ', () => {
    ve(CUA_HOA);
    expect(screen.getByRole('heading', { name: 'Căn của tôi' })).toBeInTheDocument();
    expect(screen.getByText('2 căn')).toBeInTheDocument();
    const the = screen.getAllByRole('button', { name: /^Phòng / });
    expect(the).toHaveLength(2);
    expect(screen.queryByText(/1103/)).toBeNull();
  });

  it('YC3.1-NT3 thẻ 1509 có 3 giường ghi "2PN · 3 giường"; căn 2PN chưa nhập số giường ghi "2PN" không có "giường"', () => {
    ve([can(), can({ id: 'c2', maCan: '2208', soGiuong: null, loaiView: null, tenToa: null })]);
    expect(screen.getByText('2PN · 3 giường · view biển · ICON40')).toBeInTheDocument();
    const the2208 = screen.getByRole('button', { name: /Phòng 2208/ });
    expect(within(the2208).getByText('2PN')).toBeInTheDocument();
    expect(the2208.textContent).not.toContain('giường');
  });

  it('YC3.1-NT4 không thẻ nào có "x khách", "x người lớn", "y trẻ em"', () => {
    ve([...CUA_HOA, can({ id: 'c0', maCan: 'Greenbay', soPhongNgu: 3, soGiuong: 4, soAnh: 0, anhDaiDien: null, khachDen: '2026-10-14' })]);
    for (const t of screen.getAllByRole('listitem')) {
      expect(t.textContent).not.toMatch(/\d+\s*khách|người lớn|trẻ em/);
    }
  });

  it('YC3.1-NT5 căn có 5 ảnh thì có gợi ý thêm ảnh; có 6 ảnh thì không', () => {
    ve([can({ id: 'a', maCan: '1001', soAnh: 5 }), can({ id: 'b', maCan: '1002', soAnh: 6 })]);
    const nam = screen.getByRole('button', { name: /Phòng 1001/ });
    const sau = screen.getByRole('button', { name: /Phòng 1002/ });
    expect(within(nam).getByText(/Nên thêm ảnh: sale cần ít nhất 6 ảnh/)).toBeInTheDocument();
    expect(within(sau).queryByText(/Nên thêm ảnh/)).toBeNull();
    expect(within(nam).getByText('5 ảnh')).toBeInTheDocument();
  });

  it('YC3.1 bước 11 căn không có ảnh thì chỗ ảnh ghi "Chưa có ảnh"', () => {
    ve([can({ maCan: 'Greenbay', soAnh: 0, anhDaiDien: null })]);
    expect(screen.getByText('Chưa có ảnh')).toBeInTheDocument();
  });

  it('YC3.1 bước 10 tình trạng hôm nay', () => {
    ve([can({ khachDen: '2026-10-12' }), can({ id: 'x', maCan: '3402', khachDen: null })]);
    expect(screen.getByText('Có khách đến 12/10')).toBeInTheDocument();
    expect(screen.getByText('Trống hôm nay ✓')).toBeInTheDocument();
  });

  it('YC3.1 bước 12 GD14 căn mới thêm có nhãn "Mới thêm"', () => {
    ve([can({ moiThem: true }), can({ id: 'x', maCan: '3402' })]);
    expect(screen.getAllByText('Mới thêm')).toHaveLength(1);
    expect(within(screen.getByRole('button', { name: /Phòng 1509/ })).getByText('Mới thêm')).toBeInTheDocument();
  });

  it('YC3.1 bước 13, 14 chạm thẻ mở căn đó; bấm "Thêm căn" mở form thêm căn', () => {
    const { mo, them } = ve(CUA_HOA);
    fireEvent.click(screen.getByRole('button', { name: /Phòng 3402/ }));
    expect(mo).toHaveBeenCalledWith('c3402');
    fireEvent.click(screen.getByRole('button', { name: 'Thêm căn' }));
    expect(them).toHaveBeenCalledTimes(1);
  });

  it('YC3.1 bước 9 vùng bấm thẻ và nút đủ lớn: nút "Thêm căn" là nút khối', () => {
    ve(CUA_HOA);
    expect(screen.getByRole('button', { name: 'Thêm căn' }).className).toContain('hh-btn--block');
  });
});
