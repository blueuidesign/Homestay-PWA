// Test unit A8, A8-01 và màn link xin lịch khi đã đăng nhập (YC6.5 bước 1 đến 4, YC6.5-NT1, NT2, NT4, NT7, HV5).
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { LoiNguoiDung } from '../chung/matKetNoi';
import { ToastProvider } from '../chung/Toast';
import type { DichVuXinLich, KetQuaDongY, LoiXin } from '../lib/dichVuXinLich';
import { A8LoiMoiXemLich, A801KhongDungDuoc, ManLinkXinLich } from './A8LoiMoiXemLich';

afterEach(cleanup);

const LAN: LoiXin = { trangThai: 'hop_le', tenSale: 'Sale Lan', soDienThoai: '0900000004', daKetNoi: false };

function dv(xem: LoiXin, dongY?: DichVuXinLich['dongY']): DichVuXinLich {
  return {
    doc: vi.fn(), layLink: vi.fn(), ghiLanGui: vi.fn(),
    xemLoiXin: vi.fn(async () => xem),
    dongY: dongY ?? vi.fn(async (): Promise<KetQuaDongY> => ({ ketQua: 'da_ket_noi', tenSale: 'Sale Lan', coCan: true })),
  };
}

describe('YC6.5 · A8 Lời mời xem lịch', () => {
  it('YC6.5-NT1 A8 có tên và số của Lan, các dòng sale sẽ thấy, công tắc cọc bật sẵn, hai nút', () => {
    render(<A8LoiMoiXemLich loiXin={LAN} onDongY={async () => {}} onTuChoi={() => {}} />);
    expect(screen.getByRole('heading', { name: 'Lời mời xem lịch' })).toBeInTheDocument();
    expect(screen.getByText('Sale Lan')).toBeInTheDocument();
    expect(screen.getByText('0900 000 004')).toBeInTheDocument();
    expect(screen.getByText('xin xem lịch phòng trống của bạn để gửi khách.')).toBeInTheDocument();
    expect(screen.getByText('Nếu đồng ý, Sale Lan sẽ thấy')).toBeInTheDocument();
    expect(screen.getByText('Phòng trống hay đã có người đặt, không thấy tên người đặt')).toBeInTheDocument();
    expect(screen.getByText('Giá từng đêm')).toBeInTheDocument();
    expect(screen.getByText('Không bao giờ thấy tên, số điện thoại khách và doanh thu. Đổi được trong mục Sale.')).toBeInTheDocument();
    const coc = screen.getByRole('switch', { name: 'Tình trạng cọc' });
    expect(coc).toHaveAttribute('aria-checked', 'true');
    // QD7: chỉ một công tắc; giá và lịch không có công tắc.
    expect(screen.getAllByRole('switch')).toHaveLength(1);
    expect(screen.getByRole('button', { name: 'Đồng ý cho xem lịch' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Từ chối' })).toBeInTheDocument();
  });

  it('YC6.5-NT1 PQ2.CHU sale chưa cho số thì A8 chỉ có tên', () => {
    render(<A8LoiMoiXemLich loiXin={{ ...LAN, soDienThoai: null }} onDongY={async () => {}} onTuChoi={() => {}} />);
    expect(screen.getByText('Sale Lan')).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/\d{3}/);
  });

  it('YC6.5-NT2 tắt "Tình trạng cọc" rồi đồng ý thì gửi quyền cọc tắt', async () => {
    const onDongY = vi.fn(async () => {});
    render(<A8LoiMoiXemLich loiXin={LAN} onDongY={onDongY} onTuChoi={() => {}} />);
    fireEvent.click(screen.getByRole('switch', { name: 'Tình trạng cọc' }));
    expect(screen.getByRole('switch', { name: 'Tình trạng cọc' })).toHaveAttribute('aria-checked', 'false');
    fireEvent.click(screen.getByRole('button', { name: 'Đồng ý cho xem lịch' }));
    await waitFor(() => expect(onDongY).toHaveBeenCalledWith(false));
  });

  it('YC6.5 bước 3 "Từ chối" không gọi đồng ý', () => {
    const onDongY = vi.fn(async () => {});
    const onTuChoi = vi.fn();
    render(<A8LoiMoiXemLich loiXin={LAN} onDongY={onDongY} onTuChoi={onTuChoi} />);
    fireEvent.click(screen.getByRole('button', { name: 'Từ chối' }));
    expect(onTuChoi).toHaveBeenCalledOnce();
    expect(onDongY).not.toHaveBeenCalled();
  });

  it('YC6.5-NT4 HV5 A8-01: câu báo, không tên, số nào, nút "Về Lịch"', () => {
    const onVe = vi.fn();
    render(<A801KhongDungDuoc onVeLich={onVe} />);
    expect(screen.getByText('Bạn không còn xem được mục này')).toBeInTheDocument();
    expect(screen.getByText('Link xin lịch đã hết hạn, sale đã xóa tài khoản, hoặc bạn đã ngừng cho sale này xem lịch.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Về Lịch' }));
    expect(onVe).toHaveBeenCalledOnce();
  });
});

describe('YC6.5 · màn link xin lịch /x/<mã>', () => {
  it('YC6.5-NT1 đọc xem trước theo mã rồi hiện A8 với tên và số của Lan', async () => {
    const d = dv(LAN);
    render(<ToastProvider><ManLinkXinLich ma="xinLan" dv={d} onVeLich={() => {}} onTuChoi={() => {}} onDaDongY={() => {}} /></ToastProvider>);
    expect(await screen.findByText('Sale Lan')).toBeInTheDocument();
    expect(screen.getByText('0900 000 004')).toBeInTheDocument();
    expect(d.xemLoiXin).toHaveBeenCalledWith('xinLan');
  });

  it('YC6.5-NT4 NT7 link không dùng được thì A8-01', async () => {
    render(<ToastProvider><ManLinkXinLich ma="hong" dv={dv({ trangThai: 'khong_dung_duoc' })} onVeLich={() => {}} onTuChoi={() => {}}
                                          onDaDongY={() => {}} /></ToastProvider>);
    expect(await screen.findByText('Bạn không còn xem được mục này')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Đồng ý cho xem lịch' })).toBeNull();
  });

  it('YC6.5 bước 2 đồng ý xong báo nơi gọi kết quả', async () => {
    const onDaDongY = vi.fn();
    const d = dv(LAN);
    render(<ToastProvider><ManLinkXinLich ma="xinLan" dv={d} onVeLich={() => {}} onTuChoi={() => {}} onDaDongY={onDaDongY} /></ToastProvider>);
    fireEvent.click(await screen.findByRole('button', { name: 'Đồng ý cho xem lịch' }));
    await waitFor(() => expect(onDaDongY).toHaveBeenCalledWith({ ketQua: 'da_ket_noi', tenSale: 'Sale Lan', coCan: true }));
    expect(d.dongY).toHaveBeenCalledWith('xinLan', true);
  });

  it('YC6.5 bước 4 link vừa hỏng lúc bấm đồng ý thì đọc lại và hiện A8-01', async () => {
    let lan = 0;
    const d: DichVuXinLich = {
      ...dv(LAN),
      xemLoiXin: vi.fn(async () => (lan++ === 0 ? LAN : { trangThai: 'khong_dung_duoc' as const })),
      dongY: vi.fn(async () => { throw new LoiNguoiDung('Bạn không còn xem được mục này'); }),
    };
    render(<ToastProvider><ManLinkXinLich ma="xinLan" dv={d} onVeLich={() => {}} onTuChoi={() => {}} onDaDongY={() => {}} /></ToastProvider>);
    fireEvent.click(await screen.findByRole('button', { name: 'Đồng ý cho xem lịch' }));
    expect(await screen.findByText('Link xin lịch đã hết hạn, sale đã xóa tài khoản, hoặc bạn đã ngừng cho sale này xem lịch.'))
      .toBeInTheDocument();
  });

  it('HV2 tải không được thì có "Thử lại"', async () => {
    const d: DichVuXinLich = { ...dv(LAN), xemLoiXin: vi.fn(async () => { throw new Error('mạng'); }) };
    render(<ToastProvider><ManLinkXinLich ma="xinLan" dv={d} onVeLich={() => {}} onTuChoi={() => {}} onDaDongY={() => {}} /></ToastProvider>);
    expect(await screen.findByRole('button', { name: 'Thử lại' })).toBeInTheDocument();
  });
});
