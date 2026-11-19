// Test unit màn CN5-A1b chọn tòa khác (YC3.4 bước 30 đến 33, YC3.4-NT1).
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ToaNha } from '../lib/toaNha';
import { CN5A1bChonToa } from './CN5A1bChonToa';

afterEach(cleanup);

// DLM: 5 tòa Home247 đặt sẵn (supabase/seed/dlm.sql); Green Bay có khu vực Bãi Cháy.
const DLM: ToaNha[] = [
  { id: 't1', ten: 'ICON40', khuVuc: null, home247: true },
  { id: 't2', ten: 'Sapphire', khuVuc: null, home247: true },
  { id: 't3', ten: 'À La Carte', khuVuc: null, home247: true },
  { id: 't4', ten: 'Green Bay', khuVuc: 'Bãi Cháy', home247: true },
  { id: 't5', ten: 'Mường Thanh', khuVuc: null, home247: true },
];

/** Vẽ màn có ô nhập thật (giữ chữ đã gõ như form cha). */
function ve(ds = DLM) {
  const onChon = vi.fn();
  const onThemMoi = vi.fn();
  function Khung() {
    const [chu, datChu] = useState('');
    return <CN5A1bChonToa ds={ds} chu={chu} onDoiChu={datChu} onChon={onChon} onThemMoi={onThemMoi} />;
  }
  render(<Khung />);
  return { onChon, onThemMoi };
}

const danhSach = () => screen.getByRole('list', { name: 'Danh sách tòa' });
const oTen = () => screen.getByLabelText('Tên tòa nhà');

describe('YC3.4 · CN5-A1b chọn tòa khác', () => {
  it('YC3.4 bước 30 có ô "Tên tòa nhà", danh sách tòa (tên và khu vực nếu có), ghi chú', () => {
    ve();
    expect(oTen()).toHaveAttribute('placeholder', 'Gõ tên tòa, VD: Green Bay');
    const ds = within(danhSach()).getAllByRole('button');
    expect(ds.map((b) => b.textContent)).toEqual(['ICON40', 'Sapphire', 'À La Carte', 'Green BayBãi Cháy', 'Mường Thanh']);
    expect(screen.getByText('Chọn tòa có sẵn để sale lọc đúng tòa. Không thấy thì thêm tòa mới.')).toBeInTheDocument();
    expect(screen.queryByText(/Thêm tòa mới/)).toBeNull();
  });

  it('YC3.4-NT1 gõ "green" vào ô tên tòa thì danh sách chỉ còn "Green Bay" và có dòng "+ Thêm tòa mới "green""', () => {
    ve();
    fireEvent.change(oTen(), { target: { value: 'green' } });
    const ds = within(danhSach()).getAllByRole('button');
    expect(ds).toHaveLength(2);
    expect(ds[0]).toHaveTextContent('Green Bay');
    expect(ds[1]).toHaveTextContent('+ Thêm tòa mới "green"');
    for (const t of ['ICON40', 'Sapphire', 'À La Carte', 'Mường Thanh']) expect(screen.queryByText(t)).toBeNull();
  });

  it('YC3.4 bước 31 lọc không phân biệt hoa thường, dấu', () => {
    ve();
    fireEvent.change(oTen(), { target: { value: 'MUONG' } });
    expect(within(danhSach()).getAllByRole('button').map((b) => b.textContent)).toEqual(['Mường Thanh', '+ Thêm tòa mới "MUONG"']);
  });

  it('YC3.4 bước 32 chọn một tòa thì báo tòa đó', () => {
    const { onChon } = ve();
    fireEvent.change(oTen(), { target: { value: 'green' } });
    fireEvent.click(screen.getByRole('button', { name: /Green Bay/ }));
    expect(onChon).toHaveBeenCalledWith('t4');
  });

  it('YC3.4 bước 33 chạm "+ Thêm tòa mới …" thì thêm với tên đã bỏ khoảng trắng đầu cuối', () => {
    const { onThemMoi } = ve();
    fireEvent.change(oTen(), { target: { value: '  Bim Hạ Long ' } });
    fireEvent.click(screen.getByRole('button', { name: '+ Thêm tòa mới "Bim Hạ Long"' }));
    expect(onThemMoi).toHaveBeenCalledWith('Bim Hạ Long');
  });

  it('YC3.4 bước 33 câu database từ chối tên tòa hiện dưới ô tên tòa (QT5.5)', () => {
    render(<CN5A1bChonToa ds={DLM} chu={'x'} onDoiChu={vi.fn()} onChon={vi.fn()} onThemMoi={vi.fn()}
                          loi="Tên tòa từ 1 đến 100 ký tự" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Tên tòa từ 1 đến 100 ký tự');
    expect(oTen()).toHaveAttribute('aria-invalid', 'true');
  });
});
