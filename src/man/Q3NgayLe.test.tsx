// Test unit Q3 Ngày lễ, Q3-01 (YC13.2). Dịch vụ giả. Luật kiểm và quyền thật ở tests/db/95_us66_dai_ngay_le.sql.
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LoiNguoiDung } from '../chung/matKetNoi';
import { ToastProvider } from '../chung/Toast';
import type { DichVuQuanTri } from '../lib/dichVuQuanTri';
import { Q3NgayLe, soNgay } from './Q3NgayLe';

afterEach(cleanup);
const DAI = [
  { id: 'a', nam: 2027, ten: 'Tết Nguyên đán', tuNgay: '2027-02-05', denNgay: '2027-02-10' },
  { id: 'b', nam: 2027, ten: 'Giỗ Tổ Hùng Vương', tuNgay: '2027-04-16', denNgay: '2027-04-18' },
];
const dv = (g: Partial<DichVuQuanTri> = {}) => ({
  ngayLe: vi.fn(async (nam: number) => (nam === 2027 ? DAI : [])),
  luuNgayLe: vi.fn(async () => undefined),
  xoaNgayLe: vi.fn(async () => undefined),
  ...g,
}) as unknown as DichVuQuanTri;
const mo = (d: DichVuQuanTri) => render(<ToastProvider><Q3NgayLe dichVu={d} onLoi={() => undefined} namDau={2027} /></ToastProvider>);

describe('YC13.2 · Q3 Ngày lễ', () => {
  it('YC13.2-NT1 chọn năm 2027 thấy mọi dải với tên, ngày đầu, ngày cuối', async () => {
    mo(dv());
    expect(await screen.findByText('Tết Nguyên đán')).toBeTruthy();
    expect(screen.getByText('05/02/2027 → 10/02/2027 · 6 ngày')).toBeTruthy();
    expect(screen.getByText('Giỗ Tổ Hùng Vương')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Năm sau' }));
    expect(await screen.findByText('Năm 2028 chưa có dải ngày lễ nào.')).toBeTruthy();
  });

  it('YC13.2 bước 2 thêm dải: sai luật kiểm thì hiện câu của database', async () => {
    const d = dv({ luuNgayLe: vi.fn(async () => { throw new LoiNguoiDung('Một dải tối đa 10 ngày'); }) });
    mo(d);
    fireEvent.click(await screen.findByRole('button', { name: 'Thêm dải ngày lễ' }));
    fireEvent.change(screen.getByLabelText('Tên dịp'), { target: { value: 'Lễ dài' } });
    fireEvent.change(screen.getByLabelText('Ngày đầu'), { target: { value: '2027-05-01' } });
    fireEvent.change(screen.getByLabelText('Ngày cuối'), { target: { value: '2027-05-15' } });
    fireEvent.click(screen.getByRole('button', { name: 'Lưu' }));
    expect(await screen.findByText('Một dải tối đa 10 ngày')).toBeTruthy();
    expect(d.luuNgayLe).toHaveBeenCalledWith({ id: null, nam: 2027, ten: 'Lễ dài', tuNgay: '2027-05-01', denNgay: '2027-05-15' });
  });

  it('YC13.2 bước 3 xóa dải bấm hai lần', async () => {
    const d = dv();
    mo(d);
    fireEvent.click(await screen.findByText('Tết Nguyên đán'));
    fireEvent.click(screen.getByRole('button', { name: 'Xóa dải' }));
    expect(d.xoaNgayLe).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Bấm lần nữa để xóa' }));
    await waitFor(() => expect(d.xoaNgayLe).toHaveBeenCalledWith('a'));
  });

  it('YC13.2 số ngày tính cả hai đầu', () => {
    expect(soNgay('2027-02-05', '2027-02-10')).toBe(6);
  });
});
