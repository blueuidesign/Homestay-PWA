// Test unit S1 Lịch phòng của sale, S1-04 Sắp xếp, S1-05 xoay ngang (YC7.1, US43), HV8-NT3. Số theo DLM: Sale Hùng 07/10 → 13/10.
import { readFileSync } from 'node:fs';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider, useToast } from '../chung/Toast';
import type { DongLichSale } from '../lib/lichSale';
import { S1LichSale, THUOC_TINH_XOAY } from './S1LichSale';

afterEach(cleanup);

// Vitest không nạp CSS (chữ ?raw cũng rỗng), nên đọc thẳng file CSS của màn để kiểm luật xoay.
const cssS1 = readFileSync('src/man/S1LichSale.css', 'utf8');

// Hàng: mã, tòa, nhóm, chủ, số PN, view, số bán, 7 ô ('k' kín kèm giá, số là giá trống, '?' chưa biết, 'b' bạn).
type MauHang = [string, string | null, DongLichSale['nhom'], string | null, number | null, string | null, number, (string | number)[]];
const MAU_HUNG: MauHang[] = [
  ['0812', 'Green Bay', 'cua_toi', null, 2, 'bien', 1, [750000, 'k750000', 'k900000', 900000, 750000, 750000, 750000]],
  ['1605', 'Mường Thanh', 'cua_toi', null, 1, 'bien', 0, [600000, 600000, 700000, 700000, 600000, 'k600000', 'k600000']],
  ['3402', null, 'nguon', 'Chị Hoa', 1, null, 1, [1200000, 1200000, 1500000, 1500000, 1200000, 1200000, 1200000]],
  ['2208', 'À La Carte', 'nguon', 'Anh Tuấn', 1, null, 0, ['k700000', 700000, 800000, 800000, 700000, 'k700000', 700000]],
  ['1509', 'ICON40', 'nguon', 'Chị Hoa', 2, null, 2, [1100000, 'k1100000', 'k1500000', 1300000, 1100000, 1100000, 1100000]],
  ['1103', 'Sapphire', 'nguon', 'Anh Tuấn', 3, null, 3, [1500000, 1500000, 1800000, 'k1800000', 'k1500000', 'k1500000', 1500000]],
  ['Villa Tuần Châu', null, 'tu_nhap', 'Chú Bình', null, null, 0, ['?', 'b', '?', '?', '?', '?', '?']],
];

function mauLichHung(tu = '2026-10-07', mau: MauHang[] = MAU_HUNG): DongLichSale[] {
  return mau.flatMap(([ma, toa, nhom, chu, pn, view, ban, o]) => o.map((x, i): DongLichSale => {
    const d = new Date(Date.parse(tu + 'T00:00:00Z') + i * 86_400_000).toISOString().slice(0, 10);
    const s = String(x);
    const loai = s === '?' ? 'chua_biet' : s === 'b' ? 'ban' : s.startsWith('k') ? 'kin' : 'trong';
    const gia = loai === 'kin' ? Number(s.slice(1)) : loai === 'trong' ? Number(s) : null;
    return { canId: 'can-' + ma, nhom, maCan: ma, tenToa: toa, tenChu: chu, soPhongNgu: pn, loaiView: view,
             lichDoiLuc: nhom === 'nguon' ? '2026-10-07T03:00:00Z' : null, soBan: ban, dem: d, o: loai, giaBan: gia };
  }));
}

function veS1(p: Partial<Parameters<typeof S1LichSale>[0]> = {}) {
  const onDoiNgay = vi.fn();
  const onXoay = vi.fn();
  render(<S1LichSale tu="2026-10-07" homNay="2026-10-07" dong={mauLichHung()} onDoiNgay={onDoiNgay} onXoay={onXoay} {...p} />);
  return { onDoiNgay, onXoay };
}

const nhom = () => screen.getAllByRole('rowgroup').map((g) => g.getAttribute('aria-label'));
const tenTrong = (tieuDe: string) => within(screen.getByRole('rowgroup', { name: tieuDe }))
  .getAllByRole('row').slice(1).map((r) => r.querySelector('.s1-ten-chinh')!.textContent);
const hang = (ten: string) => screen.getAllByRole('row').find((r) => r.querySelector('.s1-ten-chinh')?.textContent === ten)!;
const oCua = (ten: string) => within(hang(ten)).getAllByRole('cell').map((c) => c.textContent);

describe('YC7.1 · S1 Lịch phòng của sale', () => {
  it('YC7.1 bước 2 S1 có tiêu đề, ô tìm, thanh "7 ngày tới · 07/10 → 13/10" với ‹ ›, nút "Theo tên", "Xoay ngang"', () => {
    veS1();
    expect(screen.getByRole('heading', { name: 'Lịch phòng' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tìm phòng trống theo ngày' })).toBeInTheDocument();
    expect(screen.getByText('7 ngày tới · 07/10 → 13/10')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '7 ngày trước' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '7 ngày sau' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Theo tên' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Xoay ngang' })).toBeInTheDocument();
    expect(screen.getAllByRole('columnheader').map((c) => c.textContent))
      .toEqual(['Căn', 'Nay07', 'T508', 'T609', 'T710', 'CN11', 'T212', 'T313']);
  });

  it('YC7.1-NT2 Sale Hùng mở tab Lịch: nhóm "Căn của tôi · 2" ở trên nhóm "Nguồn phòng · 5"', () => {
    veS1();
    expect(nhom()).toEqual(['Căn của tôi · 2', 'Nguồn phòng · 5']);
    expect(tenTrong('Căn của tôi · 2')).toEqual(['Green Bay 0812', 'Mường Thanh 1605']);
    expect(tenTrong('Nguồn phòng · 5')).toEqual(['3402', 'À La Carte 2208', 'ICON40 1509', 'Sapphire 1103', 'Villa Tuần Châu']);
    expect(within(hang('3402')).getByText('Chị Hoa · 1PN')).toBeInTheDocument();
    expect(within(hang('Green Bay 0812')).getByText('2PN · view biển')).toBeInTheDocument();
  });

  it('YC7.1-NT3 đêm kín ghi "Kín", đêm trống ghi giá bán: 3402 đêm 08/10 "1,2tr"', () => {
    veS1();
    expect(oCua('3402')[1]).toBe('1,2tr');
    expect(oCua('ICON40 1509')).toEqual(['1,1tr', 'Kín', 'Kín', '1,3tr', '1,1tr', '1,1tr', '1,1tr']);
    expect(oCua('Green Bay 0812')).toEqual(['750k', 'Kín', 'Kín', '900k', '750k', '750k', '750k']);
  });

  it('YC7.1-NT5 căn tự nhập: mọi ô "?" trừ đêm sale đã ghi ("Bạn"); không ô nào ghi giá hay trống', () => {
    veS1();
    expect(within(hang('Villa Tuần Châu')).getByText('Chú Bình · tự nhập')).toBeInTheDocument();
    expect(oCua('Villa Tuần Châu')).toEqual(['?', 'Bạn', '?', '?', '?', '?', '?']);
    expect(oCua('Villa Tuần Châu').some((c) => /\d|trống|Kín/.test(c ?? ''))).toBe(false);
  });

  it('YC7.1 bước 5 chú thích "Hôm nay", "Kín", "?", "Đặt phòng bạn đã ghi", "Số là giá đêm của bạn · chạm căn để xem"', () => {
    veS1();
    for (const c of ['Hôm nay', 'Căn tự nhập: gọi chủ hỏi', 'Đặt phòng bạn đã ghi', 'Số là giá đêm của bạn · chạm căn để xem']) {
      expect(screen.getByText(c)).toBeInTheDocument();
    }
  });

  it('YC7.1 bước 6 bấm ‹ hay › thì lùi, tiến 7 ngày; khoảng khác hôm nay không ghi "7 ngày tới"', () => {
    const { onDoiNgay } = veS1();
    fireEvent.click(screen.getByRole('button', { name: '7 ngày sau' }));
    fireEvent.click(screen.getByRole('button', { name: '7 ngày trước' }));
    expect(onDoiNgay.mock.calls).toEqual([[7], [-7]]);
    cleanup();
    veS1({ tu: '2026-10-14', dong: mauLichHung('2026-10-14') });
    expect(screen.getByText('14/10 → 20/10')).toBeInTheDocument();
  });

  it('YC7.1 bước 7 S1-04: "Theo tên" ✓, "Giá tăng dần", "Bán nhiều nhất", ghi chú "Căn của tôi luôn hiện đầu danh sách."', () => {
    veS1();
    fireEvent.click(screen.getByRole('button', { name: 'Theo tên' }));
    const tam = screen.getByRole('dialog', { name: 'Sắp xếp' });
    expect(within(tam).getAllByRole('button').map((b) => b.textContent)).toEqual(['', 'Theo tên✓', 'Giá tăng dần', 'Bán nhiều nhất']);
    expect(within(tam).getByText('Căn của tôi luôn hiện đầu danh sách.')).toBeInTheDocument();
    fireEvent.click(within(tam).getByRole('button', { name: 'Đóng' }));
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('YC7.1-NT7 sale chọn "Giá tăng dần": mỗi nhóm xếp theo giá, nhóm "Căn của tôi" vẫn ở trên cùng', () => {
    veS1();
    fireEvent.click(screen.getByRole('button', { name: 'Theo tên' }));
    fireEvent.click(screen.getByRole('button', { name: 'Giá tăng dần' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByRole('button', { name: 'Giá tăng dần' })).toBeInTheDocument();
    expect(nhom()).toEqual(['Căn của tôi · 2', 'Nguồn phòng · 5']);
    expect(tenTrong('Căn của tôi · 2')).toEqual(['Mường Thanh 1605', 'Green Bay 0812']);
    expect(tenTrong('Nguồn phòng · 5')).toEqual(['À La Carte 2208', 'ICON40 1509', '3402', 'Sapphire 1103', 'Villa Tuần Châu']);
  });

  it('YC7.1-NT8 sale nghiêng máy sang ngang thì bảng vẫn dọc; chạm "Xoay ngang" thì S1-05 và nút thành "Xoay dọc"', () => {
    const { onXoay } = veS1();
    window.dispatchEvent(new Event('orientationchange'));
    window.dispatchEvent(new Event('resize'));
    expect(document.querySelector('[data-man="S1"]')).not.toBeNull();
    expect(document.querySelector('[data-man="S1-05"]')).toBeNull();
    expect(document.documentElement.getAttribute(THUOC_TINH_XOAY)).toBeNull();
    expect(cssS1).not.toMatch(/orientation\s*:/);

    fireEvent.click(screen.getByRole('button', { name: 'Xoay ngang' }));
    expect(document.querySelector('[data-man="S1-05"]')).not.toBeNull();
    expect(screen.getByRole('button', { name: 'Xoay dọc' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Xoay ngang' })).toBeNull();
    expect(onXoay).toHaveBeenLastCalledWith(true);
    expect(cssS1).toMatch(/\.s1-xoay\s*\{[^}]*rotate\(90deg\)/);

    fireEvent.click(screen.getByRole('button', { name: 'Xoay dọc' }));
    expect(document.querySelector('[data-man="S1"]')).not.toBeNull();
    expect(onXoay).toHaveBeenLastCalledWith(false);
  });

  it('HV8-NT3 đang xoay giả ở S1-05 và có toast thì toast đọc theo chiều ngang', () => {
    function NutToast() {
      const hien = useToast();
      return <button type="button" onClick={() => hien('Đã lưu')}>thử toast</button>;
    }
    render(<ToastProvider><S1LichSale tu="2026-10-07" homNay="2026-10-07" dong={mauLichHung()} onDoiNgay={() => {}} /><NutToast /></ToastProvider>);
    fireEvent.click(screen.getByRole('button', { name: 'Xoay ngang' }));
    fireEvent.click(screen.getByRole('button', { name: 'thử toast' }));
    expect(screen.getByRole('status')).toHaveTextContent('Đã lưu');
    expect(document.documentElement.getAttribute(THUOC_TINH_XOAY)).toBe('ngang');
    // Toast quay cùng khung ngang (cùng phép quay 90 độ của .s1-xoay).
    expect(cssS1).toMatch(/html\[data-xoay="ngang"\] \.toast\s*\{[^}]*rotate\(90deg\)/);
    fireEvent.click(screen.getByRole('button', { name: 'Xoay dọc' }));
    expect(document.documentElement.getAttribute(THUOC_TINH_XOAY)).toBeNull();
  });

  it('HV1 đang đọc khoảng mới thì hiện "Đang cập nhật…" và giữ bảng cũ', () => {
    veS1({ dangTai: true });
    expect(screen.getByText(/Đang cập nhật/)).toBeInTheDocument();
    expect(nhom()).toEqual(['Căn của tôi · 2', 'Nguồn phòng · 5']);
  });
});
