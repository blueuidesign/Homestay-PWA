// Test unit Q4 Tòa nhà, Q4-01, Q4-02 (YC13.3). Dịch vụ giả. Quyền và gộp thật ở tests/db/96_us67_toa_nha_quan_tri.sql.
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider } from '../chung/Toast';
import type { DichVuQuanTri } from '../lib/dichVuQuanTri';
import { Q4ToaNha } from './Q4ToaNha';

afterEach(cleanup);
const TOA = [
  { id: 'i40', ten: 'ICON40', khuVuc: 'Bãi Cháy', home247: true },
  { id: 'i40b', ten: 'Icon 40', khuVuc: null, home247: false },
];
const dv = (g: Partial<DichVuQuanTri> = {}) => ({
  toa: vi.fn(async () => TOA), luuToa: vi.fn(async () => undefined), gopToa: vi.fn(async () => undefined), ...g,
}) as unknown as DichVuQuanTri;
const mo = (d: DichVuQuanTri) => render(<ToastProvider><Q4ToaNha dichVu={d} onLoi={() => undefined} /></ToastProvider>);

describe('YC13.3 · Q4 Tòa nhà', () => {
  it('YC13.3-NT3 tòa chủ nhà thêm ghi "Người dùng thêm", tòa đặt sẵn ghi "Home247 đặt sẵn"', async () => {
    mo(dv());
    expect(await screen.findByText('Bãi Cháy · Home247 đặt sẵn')).toBeTruthy();
    expect(screen.getByText('Người dùng thêm')).toBeTruthy();
  });

  it('YC13.3 bước 2 thêm tòa gửi tên và khu vực', async () => {
    const d = dv();
    mo(d);
    fireEvent.click(await screen.findByRole('button', { name: 'Thêm tòa' }));
    fireEvent.change(screen.getByLabelText('Tên tòa'), { target: { value: 'Sapphire' } });
    fireEvent.change(screen.getByLabelText('Khu vực'), { target: { value: 'Hùng Thắng' } });
    fireEvent.click(screen.getByRole('button', { name: 'Lưu' }));
    await waitFor(() => expect(d.luuToa).toHaveBeenCalledWith({ id: null, ten: 'Sapphire', khuVuc: 'Hùng Thắng' }));
  });

  it('YC13.3 bước 4 gộp "Icon 40" vào ICON40 phải bấm hai lần', async () => {
    const d = dv();
    mo(d);
    fireEvent.click(await screen.findByText('Icon 40'));
    fireEvent.click(screen.getByRole('button', { name: 'Gộp tòa này vào tòa khác' }));
    fireEvent.click(screen.getByRole('radio', { name: /ICON40/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Gộp' }));
    expect(d.gopToa).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Bấm lần nữa để gộp vào ICON40' }));
    await waitFor(() => expect(d.gopToa).toHaveBeenCalledWith('i40', 'i40b'));
  });
});
