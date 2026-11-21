// Test unit trang quản trị (YC13.1, Q1, Q1-02, Q2). Dịch vụ giả, không gọi mạng. Quyền thật kiểm ở tests/db/94_us65_quan_tri.sql.
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider } from '../chung/Toast';
import { LoiKhongQuyenQuanTri, type DichVuQuanTri } from '../lib/dichVuQuanTri';
import { CAU_KHONG_QUYEN, QuanTri } from './QuanTri';

afterEach(cleanup);

const dv = (g: Partial<DichVuQuanTri> = {}): DichVuQuanTri => ({
  layPhien: vi.fn(async () => ({ email: 'qt@vidu.test' })),
  guiMa: vi.fn(async () => true),
  xacNhanMa: vi.fn(async () => 'dung' as const),
  dangXuat: vi.fn(async () => undefined),
  vao: vi.fn(async () => ({ email: 'qt@vidu.test', laGoc: true })),
  danhSach: vi.fn(async () => [
    { email: 'qt@vidu.test', laGoc: true, themLuc: '2026-11-21T03:00:00Z' },
    { email: 'dong@vidu.test', laGoc: false, themLuc: '2026-11-21T04:00:00Z' },
  ]),
  them: vi.fn(async () => undefined),
  go: vi.fn(async () => undefined),
  ngayLe: vi.fn(async () => []),
  luuNgayLe: vi.fn(async () => undefined),
  xoaNgayLe: vi.fn(async () => undefined),
  ...g,
});
const mo = (d: DichVuQuanTri) => render(<ToastProvider><QuanTri dichVu={d} /></ToastProvider>);
// US66 thêm mục Ngày lễ đứng trước: mở mục Quản trị viên.
const moQtv = async () => fireEvent.click(await screen.findByRole('tab', { name: 'Quản trị viên' }));

describe('YC13.1 · Trang quản trị', () => {
  it('YC13.1-NT3 email không trong danh sách: không sang màn nhập mã, báo dưới ô', async () => {
    const d = dv({ layPhien: vi.fn(async () => null), guiMa: vi.fn(async () => false) });
    mo(d);
    fireEvent.change(await screen.findByLabelText('Email'), { target: { value: 'hoa@vidu.test' } });
    fireEvent.click(screen.getByRole('button', { name: 'Gửi mã' }));
    expect(await screen.findByText(CAU_KHONG_QUYEN)).toBeTruthy();
    expect(document.querySelector('[data-man="Q1-01"]')).toBeNull();
  });

  it('YC13.1 bước 6 có phiên mà không có quyền thì thấy Q1-02 và nút Đăng xuất', async () => {
    const d = dv({ vao: vi.fn(async () => { throw new LoiKhongQuyenQuanTri(); }) });
    mo(d);
    await screen.findByText(CAU_KHONG_QUYEN);
    expect(document.querySelector('[data-man="Q1-02"]')).not.toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Đăng xuất' }));
    await waitFor(() => expect(d.dangXuat).toHaveBeenCalled());
  });

  it('YC13.1 bước 3 đến 5 quản trị viên đầu tiên thấy ô thêm và nút gỡ bấm hai lần', async () => {
    const d = dv();
    mo(d);
    await moQtv();
    await screen.findByText('dong@vidu.test');
    fireEvent.click(screen.getByRole('button', { name: 'Gỡ' }));
    expect(d.go).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Bấm lần nữa để gỡ' }));
    await waitFor(() => expect(d.go).toHaveBeenCalledWith('dong@vidu.test'));
    fireEvent.change(screen.getByLabelText('Email người đồng quản trị'), { target: { value: 'moi@vidu.test' } });
    fireEvent.click(screen.getByRole('button', { name: 'Thêm' }));
    await waitFor(() => expect(d.them).toHaveBeenCalledWith('moi@vidu.test'));
  });

  it('YC13.1-NT4 đồng quản trị không thấy ô thêm, nút gỡ', async () => {
    mo(dv({ vao: vi.fn(async () => ({ email: 'dong@vidu.test', laGoc: false })) }));
    await moQtv();
    await screen.findByText('dong@vidu.test', { selector: '.qt-dong__ten' });
    expect(screen.queryByRole('button', { name: 'Gỡ' })).toBeNull();
    expect(screen.queryByLabelText('Email người đồng quản trị')).toBeNull();
  });

  it('YC13-H6 lệnh báo mất quyền thì chuyển sang Q1-02', async () => {
    mo(dv({ danhSach: vi.fn(async () => { throw new LoiKhongQuyenQuanTri(); }) }));
    await moQtv();
    await screen.findByText(CAU_KHONG_QUYEN);
    expect(document.querySelector('[data-man="Q1-02"]')).not.toBeNull();
  });
});
