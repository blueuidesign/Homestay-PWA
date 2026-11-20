// US61 · YC12.1: popup thông báo mới S1-06 (unit). Lệnh mở app thay bằng bản giả; test lớp database ở tests/db/87_us61_popup_thong_bao.sql.
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { ThongBao } from '../lib/thongBao';
import { S106PopupThongBao } from './S106PopupThongBao';

const suaB1: ThongBao = {
  id: 'tb1', loai: 'chu_sua_dat_phong', doiTuongLoai: 'booking', doiTuongId: 'b1', taoLuc: '2026-10-07T03:15:00Z', docLuc: null,
  noiDung: { ten_chu: 'Chị Hoa', ten_toa: 'ICON40', ma_can: '1509', ngay_nhan_cu: '2026-10-10', ngay_tra_cu: '2026-10-12', ngay_nhan: '2026-10-11', ngay_tra: '2026-10-13', tien_phong_cu: 2200000, tien_phong: 1800000 },
};
const bayGio = () => new Date('2026-10-07T03:30:00Z'); // 10:30 ngày 07/10 giờ Việt Nam
const xong = () => act(async () => { await Promise.resolve(); await Promise.resolve(); });

describe('YC12.1 · popup thông báo mới', () => {
  afterEach(cleanup);

  it('YC12.1-NT1 có thông báo mới: popup có dòng sửa B1, lớp tối phía sau, popup không phủ toàn màn', async () => {
    render(<S106PopupThongBao dv={{ moApp: vi.fn(async () => [suaB1]) }} bayGio={bayGio} />);
    await xong();
    const hop = screen.getByRole('dialog', { name: '1 thông báo mới' });
    expect(hop).toHaveTextContent('1 thông báo mới');
    expect(hop).toHaveTextContent('Chị Hoa đã sửa đặt phòng của bạn');
    expect(hop).toHaveTextContent('10:15');
    expect(screen.getByTestId('s106-nen')).toBeInTheDocument();
    // Không phủ toàn màn: hộp cách hai mép 16 px và cách đỉnh 112 px (css), không dùng inset: 0.
    expect(hop.className).toBe('s106-hop');
    expect(screen.getByRole('button', { name: 'Xem tất cả thông báo' })).toBeInTheDocument();
  });

  it('YC12.1-NT3 không có thông báo mới thì không có popup, và lệnh mở app được gọi một lần', async () => {
    const moApp = vi.fn(async () => []);
    render(<S106PopupThongBao dv={{ moApp }} />);
    await xong();
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(moApp).toHaveBeenCalledTimes(1);
  });

  it('YC12.1 HV2 mất mạng thì không có popup, quay lại từ nền lấy lại được', async () => {
    const moApp = vi.fn().mockRejectedValueOnce(new TypeError('mất mạng')).mockResolvedValue([suaB1]);
    render(<S106PopupThongBao dv={{ moApp }} bayGio={bayGio} />);
    await xong();
    expect(screen.queryByRole('dialog')).toBeNull();
    await act(async () => { document.dispatchEvent(new Event('visibilitychange')); });
    await xong();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('YC12.1-NT4 đã xem, rời app, Chị Hoa sửa B1, quay lại từ nền thì popup hiện lại với dòng mới', async () => {
    const moApp = vi.fn().mockResolvedValueOnce([]).mockResolvedValue([suaB1]);
    render(<S106PopupThongBao dv={{ moApp }} bayGio={bayGio} />);
    await xong();
    expect(screen.queryByRole('dialog')).toBeNull();
    await act(async () => { document.dispatchEvent(new Event('visibilitychange')); });
    await xong();
    expect(screen.getByRole('dialog')).toHaveTextContent('Chị Hoa đã sửa đặt phòng của bạn');
    expect(moApp).toHaveBeenCalledTimes(2);
  });

  it('YC12.1-NT5 bấm ✕ hay lớp tối thì đóng, không gọi đánh dấu đã đọc, và không tự hiện lại', async () => {
    const moApp = vi.fn().mockResolvedValueOnce([suaB1]).mockResolvedValue([]);
    const onChamDong = vi.fn();
    render(<S106PopupThongBao dv={{ moApp }} onChamDong={onChamDong} bayGio={bayGio} />);
    await xong();
    fireEvent.click(screen.getByRole('button', { name: 'Đóng' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(onChamDong).not.toHaveBeenCalled();
    await act(async () => { document.dispatchEvent(new Event('visibilitychange')); });
    await xong();
    expect(screen.queryByRole('dialog')).toBeNull(); // mở lại mà không có gì mới: không có popup
  });

  it('YC12.1 bước 4 chạm lớp tối đóng popup', async () => {
    render(<S106PopupThongBao dv={{ moApp: vi.fn(async () => [suaB1]) }} bayGio={bayGio} />);
    await xong();
    fireEvent.click(screen.getByTestId('s106-nen'));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('YC12.1 bước 3, 5 chạm một dòng gọi onChamDong, "Xem tất cả thông báo" gọi onXemTatCa, cả hai đóng popup', async () => {
    const onChamDong = vi.fn();
    const onXemTatCa = vi.fn();
    const { unmount } = render(<S106PopupThongBao dv={{ moApp: vi.fn(async () => [suaB1]) }} onChamDong={onChamDong} onXemTatCa={onXemTatCa} bayGio={bayGio} />);
    await xong();
    fireEvent.click(screen.getByRole('button', { name: /Chị Hoa đã sửa đặt phòng của bạn/ }));
    expect(onChamDong).toHaveBeenCalledWith(suaB1);
    expect(screen.queryByRole('dialog')).toBeNull();
    unmount();
    render(<S106PopupThongBao dv={{ moApp: vi.fn(async () => [suaB1]) }} onXemTatCa={onXemTatCa} bayGio={bayGio} />);
    await xong();
    fireEvent.click(screen.getByRole('button', { name: 'Xem tất cả thông báo' }));
    expect(onXemTatCa).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('YC12.1 chưa có dịch vụ mở app (chưa nối database) thì không có popup', async () => {
    render(<S106PopupThongBao dv={{}} />);
    await xong();
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
