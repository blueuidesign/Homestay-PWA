// US62 · YC12.2: màn Thông báo P13, P13-00 (unit). Dịch vụ thay bằng bản giả; test lớp database ở tests/db/88_us62_man_thong_bao.sql.
import { act, cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ToastProvider } from '../chung/Toast';
import { diemMoTuThongBao, type ThongBao, type TrangThongBao } from '../lib/thongBao';
import { CAU_CHUA_CO_THONG_BAO, CAU_GOI_Y_CHUA_CO, P13ThongBao } from './P13ThongBao';

const bayGio = () => new Date('2026-10-07T04:00:00Z'); // 11:00 ngày 07/10 giờ Việt Nam
const tb = (id: string, loai: string, taoLuc: string, nd: Record<string, unknown>, docLuc: string | null = null, dt: string | null = null): ThongBao =>
  ({ id, loai, noiDung: nd, doiTuongLoai: null, doiTuongId: dt, taoLuc, docLuc });

const tuChoiY4 = tb('a', 'yeu_cau_bi_tu_choi', '2026-10-07T03:15:00Z', { ten_toa: 'Sapphire', ma_can: '1103', ngay_nhan: '2026-10-05', ngay_tra: '2026-10-06' }, null, 'Y4');
const ngungTuan = tb('b', 'chu_ngung_cho_xem', '2026-10-07T01:00:00Z', { ten_chu: 'Anh Tuấn' });
const cu = tb('c', 'chu_dong_y_ket_noi', '2026-10-04T05:00:00Z', { ten_chu: 'Chị Hoa' }, '2026-10-04T06:00:00Z');

function dvGia(trang: TrangThongBao) {
  return { layDs: vi.fn(async () => trang), danhDauDaDoc: vi.fn(async () => 1) };
}
const xong = () => act(async () => { await Promise.resolve(); await Promise.resolve(); });
const dung = (dv: ReturnType<typeof dvGia>, onCham = vi.fn()) =>
  render(<ToastProvider><P13ThongBao dv={dv} onQuayLai={() => {}} onCham={onCham} bayGio={bayGio} /></ToastProvider>);

describe('YC12.2 · màn Thông báo', () => {
  afterEach(cleanup);

  it('YC12.2-NT1 Hùng có 2 chưa đọc: nhãn "2 chưa đọc" và đúng 2 dòng nền chưa đọc, nhóm Hôm nay, Trước đó, giờ đúng dạng', async () => {
    dung(dvGia({ chuaDoc: 2, conNua: false, dong: [tuChoiY4, ngungTuan, cu] }));
    await xong();
    expect(screen.getByText('2 chưa đọc')).toBeInTheDocument();
    const chua = document.querySelectorAll('[data-chua-doc="co"]');
    expect(chua).toHaveLength(2);
    expect(within(screen.getByRole('region', { name: 'Hôm nay' })).getAllByRole('button')).toHaveLength(2);
    expect(within(screen.getByRole('region', { name: 'Trước đó' })).getAllByRole('button')).toHaveLength(1);
    expect(screen.getByText('10:15')).toBeInTheDocument();
    expect(screen.getByText('04/10')).toBeInTheDocument();
  });

  it('YC12.2-NT2 chạm dòng "Yêu cầu đặt phòng bị từ chối" của Y4: mở S3-05 của Y4 và dòng thành đã đọc', async () => {
    const dv = dvGia({ chuaDoc: 2, conNua: false, dong: [tuChoiY4, ngungTuan, cu] });
    const onCham = vi.fn();
    dung(dv, onCham);
    await xong();
    fireEvent.click(screen.getByRole('button', { name: /Yêu cầu đặt phòng bị từ chối/ }));
    expect(onCham).toHaveBeenCalledWith(tuChoiY4);
    expect(diemMoTuThongBao(tuChoiY4, 'sale')).toEqual({ kieu: 's3-ket-qua', yeuCauId: 'Y4' });
    expect(dv.danhDauDaDoc).toHaveBeenCalledWith(['a']);
    expect(screen.getByText('1 chưa đọc')).toBeInTheDocument();
    expect(document.querySelectorAll('[data-chua-doc="co"]')).toHaveLength(1);
  });

  it('YC12.2-NT4 chạm "Anh Tuấn đã ngừng cho bạn xem lịch": mở S7-03, không mở lịch của Anh Tuấn', async () => {
    expect(diemMoTuThongBao(ngungTuan, 'sale')).toEqual({ kieu: 's7-03' });
    dung(dvGia({ chuaDoc: 2, conNua: false, dong: [tuChoiY4, ngungTuan, cu] }));
    await xong();
    expect(screen.getByRole('button', { name: /Anh Tuấn đã ngừng cho bạn xem lịch/ })).toBeInTheDocument();
  });

  it('YC12.2 bước 4 "Đánh dấu đã đọc": mọi dòng thành đã đọc, "0 chưa đọc", nút tắt', async () => {
    const dv = dvGia({ chuaDoc: 2, conNua: false, dong: [tuChoiY4, ngungTuan, cu] });
    dung(dv);
    await xong();
    fireEvent.click(screen.getByRole('button', { name: 'Đánh dấu đã đọc' }));
    await xong();
    expect(dv.danhDauDaDoc).toHaveBeenCalledWith();
    expect(screen.getByText('0 chưa đọc')).toBeInTheDocument();
    expect(document.querySelectorAll('[data-chua-doc="co"]')).toHaveLength(0);
    expect(screen.getByRole('button', { name: 'Đánh dấu đã đọc' })).toBeDisabled();
  });

  it('YC12.2-NT6 chưa có thông báo thì thấy P13-00', async () => {
    dung(dvGia({ chuaDoc: 0, conNua: false, dong: [] }));
    await xong();
    expect(screen.getByText(CAU_CHUA_CO_THONG_BAO)).toBeInTheDocument();
    expect(screen.getByText(CAU_GOI_Y_CHUA_CO)).toBeInTheDocument();
    expect(document.querySelector('[data-man="P13-00"]')).not.toBeNull();
  });

  it('YC12.2 bước 2 "Xem thêm" tải trang sau từ dòng cuối trang trước, không lặp dòng', async () => {
    const trang1: TrangThongBao = { chuaDoc: 2, conNua: true, dong: [tuChoiY4, ngungTuan] };
    const layDs = vi.fn().mockResolvedValueOnce(trang1).mockResolvedValueOnce({ chuaDoc: 2, conNua: false, dong: [ngungTuan, cu] });
    render(<ToastProvider><P13ThongBao dv={{ layDs, danhDauDaDoc: vi.fn() }} onQuayLai={() => {}} onCham={() => {}} bayGio={bayGio} /></ToastProvider>);
    await xong();
    fireEvent.click(screen.getByRole('button', { name: 'Xem thêm' }));
    await xong();
    expect(layDs).toHaveBeenLastCalledWith({ taoLuc: ngungTuan.taoLuc, id: 'b' });
    expect(screen.getAllByRole('button', { name: /thông báo|Yêu cầu|ngừng|đồng ý/i }).length).toBeGreaterThan(0);
    expect(document.querySelectorAll('.p13-dong')).toHaveLength(3);
    expect(screen.queryByRole('button', { name: 'Xem thêm' })).toBeNull();
  });

  it('YC12.2 HV2 mất mạng lúc tải thì có Thử lại, bấm thì tải lại được', async () => {
    const layDs = vi.fn().mockRejectedValueOnce(new TypeError('mất mạng')).mockResolvedValue({ chuaDoc: 0, conNua: false, dong: [] });
    render(<ToastProvider><P13ThongBao dv={{ layDs }} onQuayLai={() => {}} onCham={() => {}} bayGio={bayGio} /></ToastProvider>);
    await xong();
    fireEvent.click(screen.getByRole('button', { name: /Thử lại/ }));
    await xong();
    expect(screen.getByText(CAU_CHUA_CO_THONG_BAO)).toBeInTheDocument();
  });
});
