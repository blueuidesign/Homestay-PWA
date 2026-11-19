// Test unit màn kết quả tìm phòng S2, S4 (YC7.3, US45), qua ManTimPhong như khi sale bấm "Tìm phòng trống".
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider } from '../chung/Toast';
import type { DichVuTimPhong } from '../lib/dichVuTimPhong';
import type { DongLichSale } from '../lib/lichSale';
import { bayNgay } from '../lib/lichSale';
import type { CanTim, KetQuaTim } from '../lib/timPhong';
import { ManTimPhong } from './S102TimPhong';

afterEach(cleanup);

const HOM_NAY = '2026-10-06';
const can = (x: Partial<CanTim> & Pick<CanTim, 'canId' | 'nhom' | 'maCan'>): CanTim => ({
  tenToa: null, tenChu: null, soPhongNgu: null, loaiView: null, lichDoiLuc: null, tongGiaChu: null, tongGiaBan: null,
  khongCoLich: x.nhom === 'tu_nhap', ...x,
});
const KQ: KetQuaTim = {
  soCanTrong: 5, goiY: [],
  can: [
    can({ canId: 'gb', nhom: 'cua_toi', maCan: '0812', tenToa: 'Green Bay', soPhongNgu: 2, loaiView: 'bien', tongGiaChu: 1500000, tongGiaBan: 1500000 }),
    can({ canId: '3402', nhom: 'nguon', maCan: '3402', tenChu: 'Chị Hoa', soPhongNgu: 1, loaiView: 'bien', tongGiaChu: 1900000, tongGiaBan: 2700000 }),
    can({ canId: '2208', nhom: 'nguon', maCan: '2208', tenToa: 'À La Carte', tenChu: 'Anh Tuấn', soPhongNgu: 1, loaiView: 'bien', tongGiaChu: 3000000, tongGiaBan: 3600000 }),
    can({ canId: '1509', nhom: 'nguon', maCan: '1509', tenToa: 'ICON40', tenChu: 'Chị Hoa', soPhongNgu: 2, loaiView: 'bien', tongGiaChu: 2200000, tongGiaBan: 3000000 }),
    can({ canId: '1103', nhom: 'nguon', maCan: '1103', tenToa: 'Sapphire', tenChu: 'Anh Tuấn', soPhongNgu: 3, loaiView: 'thanh_pho', tongGiaChu: 1400000, tongGiaBan: 1600000 }),
    can({ canId: 'villa', nhom: 'tu_nhap', maCan: 'Villa Tuần Châu', tenChu: 'Chú Bình' }),
  ],
};

function dongLich(tu: string): DongLichSale[] {
  return KQ.can.flatMap((c) => bayNgay(tu).map((n): DongLichSale => ({
    canId: c.canId, nhom: c.nhom, maCan: c.maCan, tenToa: c.tenToa, tenChu: c.tenChu, soPhongNgu: c.soPhongNgu, loaiView: c.loaiView,
    lichDoiLuc: null, soBan: 0, dem: n, o: c.nhom === 'tu_nhap' ? 'chua_biet' : n === '2026-10-13' ? 'kin' : 'trong',
    giaBan: c.nhom === 'tu_nhap' ? null : 1100000,
  })));
}

function dv(): DichVuTimPhong & { tim: ReturnType<typeof vi.fn>; docLich: ReturnType<typeof vi.fn> } {
  return {
    tim: vi.fn(async () => KQ),
    docGanDay: vi.fn(async () => []),
    docToa: vi.fn(async () => []),
    docLich: vi.fn(async (tu: string) => dongLich(tu)),
  };
}

async function moKetQua(d = dv()) {
  render(<ToastProvider><ManTimPhong dv={d} homNay={HOM_NAY} onQuayLai={() => undefined} /></ToastProvider>);
  fireEvent.change(screen.getByLabelText('Ngày nhận'), { target: { value: '2026-10-10' } });
  fireEvent.click(screen.getByRole('button', { name: '2 đêm' }));
  fireEvent.click(screen.getByRole('button', { name: '2PN' }));
  fireEvent.click(screen.getByRole('button', { name: '3PN' }));
  fireEvent.click(screen.getByRole('button', { name: /Tìm phòng trống/ }));
  await screen.findByText('5 căn trống');
  return d;
}

const nhom = (ten: string) => screen.getByRole('region', { name: ten });
const tenThe = (ten: string) => within(nhom(ten)).getAllByRole('button').filter((b) => b.getAttribute('role') !== 'checkbox')
  .map((b) => b.getAttribute('aria-label'));

describe('YC7.3 · S2 kết quả danh sách', () => {
  it('YC7.3-NT1 "5 căn trống": 1 căn ở "Của tôi", 4 ở "Nguồn phòng", Villa Tuần Châu ở "Tự nhập · chưa biết lịch"', async () => {
    await moKetQua();
    expect(screen.getByTestId('dieu-kien')).toHaveTextContent('10/10 → 12/10 · 2PN, 3PN · 2 đêm');
    expect(screen.getByRole('button', { name: 'Sửa tìm kiếm' })).toHaveTextContent('Sửa');
    expect(screen.getByText('Căn của tôi luôn ở đầu')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Theo tên' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Danh sách' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Lịch tuần' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent))
      .toEqual(['Của tôi · 1', 'Nguồn phòng · 4', 'Tự nhập · chưa biết lịch']);
    expect(tenThe('Của tôi · 1')).toEqual(['Green Bay 0812']);
    expect(tenThe('Nguồn phòng · 4')).toEqual(['3402 · 1PN', 'À La Carte 2208 · 1PN', 'ICON40 1509 · 2PN', 'Sapphire 1103 · 3PN']);
    expect(tenThe('Tự nhập · chưa biết lịch')).toEqual(['Villa Tuần Châu']);
  });

  it('YC7.3-NT2 thẻ 1509 ghi "2.200.000đ · bạn bán 3.000.000đ"', async () => {
    await moKetQua();
    const the = screen.getByRole('button', { name: 'ICON40 1509 · 2PN' });
    expect(within(the).getByTestId('gia')).toHaveTextContent('2.200.000đ · bạn bán 3.000.000đ');
    expect(within(the).getByText('Chị Hoa · view biển')).toBeInTheDocument();
    expect(within(screen.getByRole('button', { name: 'Green Bay 0812' })).getByText('✓ Lịch của bạn, luôn đúng')).toBeInTheDocument();
  });

  it('YC7.3-NT3 tích 3 căn: thanh đáy "Đã chọn 3 căn", nút "Gửi cho khách" bấm được', async () => {
    await moKetQua();
    const gui = screen.getByRole('button', { name: 'Gửi cho khách' });
    expect(gui).toBeDisabled();
    for (const ten of ['Green Bay 0812', 'À La Carte 2208 · 1PN', 'ICON40 1509 · 2PN']) {
      fireEvent.click(screen.getByRole('checkbox', { name: `Chọn ${ten}` }));
    }
    expect(screen.getByRole('checkbox', { name: 'Chọn ICON40 1509 · 2PN' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByText('Đã chọn 3 căn')).toBeInTheDocument();
    expect(gui).toBeEnabled();
    fireEvent.click(gui);
    expect(await screen.findByText('Gửi cho khách sẽ có ở bản sau')).toBeInTheDocument();
    // Bỏ tích một căn thì còn 2.
    fireEvent.click(screen.getByRole('checkbox', { name: 'Chọn Green Bay 0812' }));
    expect(screen.getByText('Đã chọn 2 căn')).toBeInTheDocument();
  });

  it('YC7.3-NT4 chuyển "Lịch tuần" rồi về "Danh sách": tập căn, điều kiện, căn đã chọn không đổi, không tìm lại', async () => {
    const d = await moKetQua();
    fireEvent.click(screen.getByRole('checkbox', { name: 'Chọn ICON40 1509 · 2PN' }));
    fireEvent.click(screen.getByRole('button', { name: 'Lịch tuần' }));
    // S4: "10/10 → 12/10", "5 căn trống", bảng căn × 7 ngày từ ngày nhận.
    expect(screen.getByTestId('dieu-kien')).toHaveTextContent('10/10 → 12/10');
    expect(screen.getByText('5 căn trống')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Lịch tuần' })).toHaveAttribute('aria-pressed', 'true');
    const bang = screen.getByRole('table', { name: 'Lịch tuần kết quả tìm' });
    await waitFor(() => expect(within(bang).getAllByRole('row')).toHaveLength(7));
    const hang = within(bang).getAllByRole('row').slice(1);
    expect(hang.map((h) => h.getAttribute('data-can'))).toEqual(['gb', '3402', '2208', '1509', '1103', 'villa']);
    expect(within(bang).getAllByRole('columnheader').slice(1).map((c) => c.getAttribute('aria-label')))
      .toEqual(['T7 10', 'CN 11', 'T2 12', 'T3 13', 'T4 14', 'T5 15', 'T6 16']);
    expect(within(bang).getAllByRole('columnheader').filter((c) => c.getAttribute('data-hoi')).map((c) => c.getAttribute('aria-label')))
      .toEqual(['T7 10', 'CN 11']);
    const villa = hang[5]!;
    expect(within(villa).getAllByRole('cell').map((c) => c.textContent)).toEqual(Array(7).fill('?'));
    expect(within(hang[3]!).getAllByRole('cell').map((c) => c.textContent)).toEqual(['1,1tr', '1,1tr', '1,1tr', 'Kín', '1,1tr', '1,1tr', '1,1tr']);
    expect(screen.getByRole('checkbox', { name: 'Chọn ICON40 1509' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByText('Đã chọn 1 căn')).toBeInTheDocument();
    // ‹ › như S1: tiến 7 ngày đọc lịch tuần sau, vẫn cùng tập căn.
    fireEvent.click(screen.getByRole('button', { name: '7 ngày sau' }));
    await waitFor(() => expect(d.docLich).toHaveBeenLastCalledWith('2026-10-17', '2026-10-24'));
    expect(within(bang).getAllByRole('row').slice(1).map((h) => h.getAttribute('data-can'))).toEqual(['gb', '3402', '2208', '1509', '1103', 'villa']);
    fireEvent.click(screen.getByRole('button', { name: 'Danh sách' }));
    expect(screen.getByTestId('dieu-kien')).toHaveTextContent('10/10 → 12/10 · 2PN, 3PN · 2 đêm');
    expect(screen.getByText('5 căn trống')).toBeInTheDocument();
    expect(tenThe('Nguồn phòng · 4')).toEqual(['3402 · 1PN', 'À La Carte 2208 · 1PN', 'ICON40 1509 · 2PN', 'Sapphire 1103 · 3PN']);
    expect(screen.getByText('Đã chọn 1 căn')).toBeInTheDocument();
    expect(d.tim).toHaveBeenCalledTimes(1);
    expect(d.docLich).toHaveBeenCalledWith('2026-10-10', '2026-10-17');
  });

  it('YC7.3-NT5 căn tự nhập: thẻ ghi không có lịch, gợi ý gọi chủ căn, không có giá', async () => {
    await moKetQua();
    const the = screen.getByRole('button', { name: 'Villa Tuần Châu' });
    expect(within(the).getByText('Tự nhập · không có lịch, gọi chú Bình hỏi')).toBeInTheDocument();
    expect(within(the).queryByTestId('gia')).toBeNull();
    expect(within(the).queryByText(/trống/)).toBeNull();
  });

  it('YC7.3-NT6 chạm Green Bay 0812 mở S6-07, Villa Tuần Châu mở S6-03, không mở S3', async () => {
    await moKetQua();
    fireEvent.click(screen.getByRole('button', { name: 'Green Bay 0812' }));
    expect(screen.getByRole('heading', { name: 'Green Bay 0812' }).closest('[data-man]')).toHaveAttribute('data-man', 'S6-07');
    expect(document.querySelector('[data-man="S3"]')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Quay lại' }));
    await screen.findByText('5 căn trống');
    fireEvent.click(screen.getByRole('button', { name: 'Villa Tuần Châu' }));
    expect(screen.getByRole('heading', { name: 'Villa Tuần Châu' }).closest('[data-man]')).toHaveAttribute('data-man', 'S6-03');
    fireEvent.click(screen.getByRole('button', { name: 'Quay lại' }));
    // Căn của chủ nhà: S3 làm ở US46, chạm chưa mở màn nào.
    fireEvent.click(await screen.findByRole('button', { name: 'ICON40 1509 · 2PN' }));
    expect(document.querySelector('[data-man="S2"]')).not.toBeNull();
    expect(document.querySelector('[data-man="S3"]')).toBeNull();
    // Từ S4 chạm tên căn cũng theo cùng quy tắc.
    fireEvent.click(screen.getByRole('button', { name: 'Lịch tuần' }));
    fireEvent.click(await screen.findByRole('button', { name: /^Villa Tuần Châu/ }));
    expect(document.querySelector('[data-man="S6-03"]')).not.toBeNull();
  });

  it('YC7 Quy tắc "Sắp xếp": chọn "Giá tăng dần" ở S2, căn của tôi vẫn ở trên', async () => {
    await moKetQua();
    fireEvent.click(screen.getByRole('button', { name: 'Theo tên' }));
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: /Giá tăng dần/ }));
    expect(screen.getByRole('button', { name: 'Giá tăng dần' })).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { level: 2 })[0]).toHaveTextContent('Của tôi · 1');
  });

  it('HV2 lịch tuần không đọc được: "Thử lại" đọc lại', async () => {
    const d = dv();
    d.docLich.mockRejectedValueOnce(new Error('mạng'));
    await moKetQua(d);
    fireEvent.click(screen.getByRole('button', { name: 'Lịch tuần' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Thử lại' }));
    await waitFor(() => expect(d.docLich).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(screen.queryByRole('button', { name: 'Thử lại' })).toBeNull());
  });
});
