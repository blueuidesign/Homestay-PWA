// Test unit trang Điều khoản, Chính sách quyền riêng tư (YC15.3-NT2).
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { A1Chao } from './A1Chao';
import { CHINH_SACH, DIEU_KHOAN, DUONG_CHINH_SACH, DUONG_DIEU_KHOAN, TrangPhapLy } from './TrangPhapLy';

afterEach(cleanup);

const GIU_CHO = /lorem|giữ chỗ|đang soạn|TODO|sắp có|\.\.\./i;

describe('YC15.3 · Điều khoản và Chính sách', () => {
  it('YC15.3-NT2 link ở A1 trỏ đúng hai trang pháp lý', () => {
    render(<A1Chao onTaoTaiKhoan={() => {}} onDangNhap={() => {}} />);
    expect(screen.getByRole('link', { name: 'Điều khoản' })).toHaveAttribute('href', DUONG_DIEU_KHOAN);
    expect(screen.getByRole('link', { name: 'Chính sách quyền riêng tư' })).toHaveAttribute('href', DUONG_CHINH_SACH);
  });

  it('YC15.3-NT2 trang mở ra có nội dung thật, không phải chữ giữ chỗ', () => {
    for (const [loai, noiDung, tieuDe] of [['dieu-khoan', DIEU_KHOAN, 'Điều khoản sử dụng'], ['chinh-sach', CHINH_SACH, 'Chính sách quyền riêng tư']] as const) {
      render(<TrangPhapLy loai={loai} onQuayLai={() => {}} />);
      expect(screen.getByRole('heading', { level: 1, name: tieuDe })).toBeInTheDocument();
      expect(noiDung.length).toBeGreaterThanOrEqual(4);
      for (const m of noiDung) {
        expect(screen.getByRole('heading', { name: m.tieuDe })).toBeInTheDocument();
        for (const d of m.doan) { expect(d.length).toBeGreaterThan(30); expect(d).not.toMatch(GIU_CHO); }
      }
      cleanup();
    }
  });

  it('YC15.3-NT2 chính sách nói rõ giữ gì sau khi xóa tài khoản (YC1-H7, QD13)', () => {
    const chu = CHINH_SACH.flatMap(m => m.doan).join(' ');
    expect(chu).toMatch(/xóa tài khoản/i);
    expect(chu).toMatch(/số điện thoại/i);
  });

  it('YC15.3 nút Quay lại gọi đúng hàm', () => {
    const quay = vi.fn();
    render(<TrangPhapLy loai="dieu-khoan" onQuayLai={quay} />);
    fireEvent.click(screen.getByRole('button', { name: 'Quay lại' }));
    expect(quay).toHaveBeenCalledOnce();
  });
});
