// Test unit màn CN5-02 Sửa căn, tab Thông tin (YC3.5 bước 35 đến 41, YC3-H4, QT5.5, HV5).
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LoiNguoiDung } from '../chung/matKetNoi';
import { ToastProvider } from '../chung/Toast';
import { dongThongTin } from '../lib/can';
import { LoiKhongConCan, type CanSua, type SuaCan } from '../lib/dichVuCan';
import { thayDoiCan } from '../lib/kiemCan';
import type { DanhSachToa } from '../lib/toaNha';
import { CN502SuaCan } from './CN502SuaCan';
import { CN5DanhSachCan } from './CN5DanhSachCan';

beforeEach(() => localStorage.clear());
afterEach(() => cleanup());

const TOA: DanhSachToa = {
  ds: [{ id: 'toa-icon40', ten: 'ICON40', khuVuc: null, home247: true }, { id: 'toa-sapphire', ten: 'Sapphire', khuVuc: null, home247: true }],
  daDung: ['toa-icon40'],
};

const CAN_1509: CanSua = {
  id: 'can-1509', maCan: '1509', soPhongNgu: 2, soGiuong: 3, loaiView: 'bien', toaNhaId: 'toa-icon40',
  moTa: 'Căn góc tầng 15, view biển Bãi Cháy.',
  anh: [{ id: 'anh-1', url: 'https://anh.test/1.jpg' }, { id: 'anh-2', url: 'https://anh.test/2.jpg' }, { id: 'anh-3', url: 'https://anh.test/3.jpg' }],
};

function ve(o: { can?: CanSua | null; suaCan?: (id: string, s: SuaCan) => Promise<void> } = {}) {
  const suaCan = vi.fn(o.suaCan ?? (async (_id: string, _s: SuaCan) => {}));
  const layCan = vi.fn(async (_id: string) => (o.can === undefined ? CAN_1509 : o.can));
  const onDaLuu = vi.fn();
  const onQuayLai = vi.fn();
  const onChonGia = vi.fn();
  render(
    <ToastProvider>
      <CN502SuaCan canId="can-1509" layCan={layCan} suaCan={suaCan} layToa={async () => TOA}
                   onDaLuu={onDaLuu} onQuayLai={onQuayLai} onChonGia={onChonGia} onVeLich={vi.fn()} />
    </ToastProvider>,
  );
  return { suaCan, layCan, onDaLuu, onQuayLai, onChonGia };
}

const oMa = () => screen.getByLabelText(/Mã căn \(tên căn hộ\)/) as HTMLInputElement;
const oSoGiuong = () => screen.getByLabelText('Số giường') as HTMLInputElement;
const oMoTa = () => screen.getByLabelText(/Mô tả gửi khách/) as HTMLTextAreaElement;
const nutLuu = () => screen.getByRole('button', { name: /^(Lưu thay đổi|Đang lưu…)$/ });
const oAnh = () => within(screen.getByRole('list', { name: 'Ảnh căn' })).getAllByRole('listitem').filter((li) => li.hasAttribute('data-tt'));
const nguonAnh = () => oAnh().map((li) => li.querySelector('img')?.getAttribute('src'));
const moXong = async () => { await screen.findByDisplayValue('1509'); };

describe('YC3.5 · CN5-02 Sửa căn, tab Thông tin', () => {
  it('YC3.5-NT1 mở sửa 1509 thì các ô hiện đúng mã căn, số phòng ngủ, ảnh theo thứ tự, tòa, loại view, số giường, mô tả', async () => {
    const { layCan } = ve();
    await moXong();
    expect(layCan).toHaveBeenCalledWith('can-1509');
    expect(screen.getByRole('heading', { name: 'Sửa phòng 1509' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Thông tin' })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('button', { name: 'Giá' })).toBeInTheDocument();
    expect(oMa().value).toBe('1509');
    expect(screen.getByRole('button', { name: '2PN' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('Ảnh (3)')).toBeInTheDocument();
    expect(nguonAnh()).toEqual(['https://anh.test/1.jpg', 'https://anh.test/2.jpg', 'https://anh.test/3.jpg']);
    expect(oAnh()[0]).toHaveTextContent('Ảnh đại diện');
    expect(await screen.findByRole('button', { name: 'ICON40' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: 'Biển' })).toHaveAttribute('aria-pressed', 'true');
    expect(oSoGiuong().value).toBe('3');
    expect(oMoTa().value).toBe('Căn góc tầng 15, view biển Bãi Cháy.');
    expect(nutLuu()).toBeInTheDocument();
  });

  it('YC3.5-NT1 căn chưa có phần thêm thì các ô đó để trống, mục Ảnh trống', async () => {
    ve({ can: { id: 'can-1509', maCan: '1509', soPhongNgu: 0, soGiuong: null, loaiView: null, toaNhaId: null, moTa: null, anh: [] } });
    await moXong();
    expect(screen.getByRole('button', { name: 'Studio' })).toHaveAttribute('aria-pressed', 'true');
    expect(oSoGiuong().value).toBe('');
    expect(oMoTa().value).toBe('');
    expect(screen.getByRole('button', { name: 'Biển' })).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByText('Bạn có thể thêm sau')).toBeInTheDocument();
  });

  it('YC3.5-NT2 bấm "Đổi thứ tự", đưa ảnh thứ 2 lên đầu rồi lưu thì ảnh đó thành ảnh đại diện', async () => {
    const { suaCan, onDaLuu } = ve();
    await moXong();
    fireEvent.click(screen.getByRole('button', { name: 'Đổi thứ tự' }));
    expect(screen.getByRole('button', { name: 'Đưa ảnh 1 lên trước' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Đưa ảnh 3 ra sau' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Đưa ảnh 2 lên trước' }));
    expect(nguonAnh()).toEqual(['https://anh.test/2.jpg', 'https://anh.test/1.jpg', 'https://anh.test/3.jpg']);
    expect(oAnh()[0]).toHaveTextContent('Ảnh đại diện');
    expect(oAnh()[1]).not.toHaveTextContent('Ảnh đại diện');
    fireEvent.click(nutLuu());
    await waitFor(() => expect(onDaLuu).toHaveBeenCalledWith('1509'));
    expect(suaCan).toHaveBeenCalledTimes(1);
    expect(suaCan.mock.calls[0]![0]).toBe('can-1509');
    // YC3.5 bước 39: chỉ gửi ô đã đổi; danh sách ảnh là danh sách mới đầy đủ theo thứ tự.
    expect(suaCan.mock.calls[0]![1]).toEqual({ anh: ['anh-2', 'anh-1', 'anh-3'] });
  });

  it('YC3.5-NT2 đưa ảnh ra sau cũng đổi thứ tự; thêm, bỏ ảnh thì danh sách gửi lên là danh sách mới đầy đủ', async () => {
    const { suaCan } = ve();
    await moXong();
    fireEvent.click(screen.getByRole('button', { name: 'Đổi thứ tự' }));
    fireEvent.click(screen.getByRole('button', { name: 'Đưa ảnh 1 ra sau' }));
    fireEvent.click(screen.getByRole('button', { name: 'Bỏ ảnh 3' }));
    expect(nguonAnh()).toEqual(['https://anh.test/2.jpg', 'https://anh.test/1.jpg']);
    fireEvent.click(nutLuu());
    await waitFor(() => expect(suaCan).toHaveBeenCalled());
    expect(suaCan.mock.calls[0]![1]).toEqual({ anh: ['anh-2', 'anh-1'] });
  });

  it('YC3.5-NT4 sửa số giường 1509 từ 3 thành 2 rồi lưu thì chỉ gửi số giường 2; thẻ ghi "2PN · 2 giường"', async () => {
    const { suaCan, onDaLuu } = ve();
    await moXong();
    fireEvent.change(oSoGiuong(), { target: { value: '2' } });
    fireEvent.click(nutLuu());
    await waitFor(() => expect(onDaLuu).toHaveBeenCalled());
    expect(suaCan.mock.calls[0]![1]).toEqual({ soGiuong: 2 });
    expect(dongThongTin({ soPhongNgu: 2, soGiuong: 2, loaiView: null, tenToa: null })).toBe('2PN · 2 giường');
  });

  it('YC3.5-NT4 xóa trống ô số giường rồi lưu thì gửi bỏ số giường; thẻ ghi "2PN"', async () => {
    const { suaCan, onDaLuu } = ve();
    await moXong();
    fireEvent.change(oSoGiuong(), { target: { value: '' } });
    fireEvent.click(nutLuu());
    await waitFor(() => expect(onDaLuu).toHaveBeenCalled());
    expect(suaCan.mock.calls[0]![1]).toEqual({ soGiuong: null });
    expect(dongThongTin({ soPhongNgu: 2, soGiuong: null, loaiView: null, tenToa: null })).toBe('2PN');
  });

  it('YC3.5-NT4 thayDoiCan chỉ trả ô đã đổi; ô trống là null; mã bỏ khoảng trắng', () => {
    const dau = { maCan: '1509', soPhongNgu: 2, soGiuong: 3, loaiView: 'bien', toaNhaId: 't1', moTa: 'Mô tả', anh: ['a', 'b'] };
    expect(thayDoiCan(dau, { ...dau })).toEqual({});
    expect(thayDoiCan(dau, { ...dau, soGiuong: null })).toEqual({ soGiuong: null });
    expect(thayDoiCan(dau, { ...dau, maCan: ' 1510 ', moTa: '  ' })).toEqual({ maCan: '1510', moTa: null });
    expect(thayDoiCan(dau, { ...dau, maCan: ' 1509 ' })).toEqual({});
    expect(thayDoiCan(dau, { ...dau, anh: ['b', 'a'] })).toEqual({ anh: ['b', 'a'] });
    expect(thayDoiCan(dau, { ...dau, loaiView: null, toaNhaId: null, soPhongNgu: 3 })).toEqual({ loaiView: null, toaNhaId: null, soPhongNgu: 3 });
  });

  it('YC3.5 bước 40 database từ chối mã trùng thì ở lại, giữ dữ liệu, câu lỗi dưới ô mã căn', async () => {
    const { onDaLuu } = ve({ suaCan: async () => { throw new LoiNguoiDung('Đã có căn 3402. Kiểm tra lại mã căn.'); } });
    await moXong();
    fireEvent.change(oMa(), { target: { value: '3402' } });
    fireEvent.change(oSoGiuong(), { target: { value: '2' } });
    fireEvent.click(nutLuu());
    expect(await screen.findByText('⚠️ Đã có căn 3402. Kiểm tra lại mã căn.')).toBeInTheDocument();
    expect(oMa()).toHaveAttribute('aria-invalid', 'true');
    expect(oMa().value).toBe('3402');
    expect(oSoGiuong().value).toBe('2');
    expect(onDaLuu).not.toHaveBeenCalled();
  });

  it('YC3.5 bước 39 HV5 căn đã bị xóa hay mất quyền thì lưu bị từ chối, báo không còn xem được', async () => {
    const { onDaLuu } = ve({ suaCan: async () => { throw new LoiKhongConCan(); } });
    await moXong();
    fireEvent.change(oSoGiuong(), { target: { value: '2' } });
    fireEvent.click(nutLuu());
    expect(await screen.findByText('Bạn không còn xem được mục này')).toBeInTheDocument();
    expect(onDaLuu).not.toHaveBeenCalled();
  });

  it('HV5 căn không còn (đã xóa, không phải căn của mình) thì không hiện form', async () => {
    ve({ can: null });
    expect(await screen.findByText('Bạn không còn xem được mục này')).toBeInTheDocument();
    expect(screen.queryByLabelText(/Mã căn \(tên căn hộ\)/)).toBeNull();
  });

  it('YC3.5 bước 41 bấm quay lại khi đã sửa mà chưa lưu thì hỏi "Bỏ thay đổi chưa lưu?"; "Ở lại" giữ dữ liệu', async () => {
    const { onQuayLai, suaCan } = ve();
    await moXong();
    fireEvent.change(oMoTa(), { target: { value: 'Mô tả mới' } });
    fireEvent.click(screen.getByRole('button', { name: 'Quay lại' }));
    const hoi = screen.getByRole('alertdialog');
    expect(within(hoi).getByText('Bỏ thay đổi chưa lưu?')).toBeInTheDocument();
    fireEvent.click(within(hoi).getByRole('button', { name: 'Ở lại' }));
    expect(screen.queryByRole('alertdialog')).toBeNull();
    expect(oMoTa().value).toBe('Mô tả mới');
    expect(onQuayLai).not.toHaveBeenCalled();
    expect(suaCan).not.toHaveBeenCalled();
  });

  it('YC3.5 bước 41 YC3-H4 bỏ một ảnh không hỏi lại, không gọi database; quay lại chọn "Bỏ thay đổi" thì rời màn, không lưu', async () => {
    const { onQuayLai, suaCan } = ve();
    await moXong();
    fireEvent.click(screen.getByRole('button', { name: 'Bỏ ảnh 2' }));
    expect(screen.queryByRole('alertdialog')).toBeNull();
    expect(oAnh()).toHaveLength(2);
    expect(suaCan).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Quay lại' }));
    fireEvent.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Bỏ thay đổi' }));
    expect(onQuayLai).toHaveBeenCalledTimes(1);
    expect(suaCan).not.toHaveBeenCalled();
  });

  it('YC3.5 bước 41 chưa sửa gì thì quay lại không hỏi', async () => {
    const { onQuayLai } = ve();
    await moXong();
    fireEvent.click(screen.getByRole('button', { name: 'Quay lại' }));
    expect(screen.queryByRole('alertdialog')).toBeNull();
    expect(onQuayLai).toHaveBeenCalledTimes(1);
  });

  it('YC3.5 bước 35 chạm tab "Giá" khi chưa sửa gì thì sang tab Giá', async () => {
    const { onChonGia } = ve();
    await moXong();
    fireEvent.click(screen.getByRole('button', { name: 'Giá' }));
    expect(onChonGia).toHaveBeenCalledTimes(1);
  });
});

// ===== US19 · YC3.6 Xóa căn: nút "Xóa phòng" và hộp hỏi lại ở cuối tab Thông tin (YC3-H3, YC3-H8, QT5.5, HV8) =====
const CAN_2105: CanSua = { id: 'can-2105', maCan: '2105', soPhongNgu: 1, soGiuong: null, loaiView: null, toaNhaId: null, moTa: null, anh: [] };
const CAN_3402: CanSua = { id: 'can-3402', maCan: '3402', soPhongNgu: null, soGiuong: null, loaiView: null, toaNhaId: null, moTa: null, anh: [] };

function veXoa(can: CanSua, xoaCan?: (id: string) => Promise<void>) {
  const xoa = vi.fn(xoaCan ?? (async (_id: string) => {}));
  const onDaXoa = vi.fn();
  const onQuayLai = vi.fn();
  render(
    <ToastProvider>
      <CN502SuaCan canId={can.id} layCan={async () => can} suaCan={vi.fn(async () => {})} xoaCan={xoa} layToa={async () => TOA}
                   onDaLuu={vi.fn()} onDaXoa={onDaXoa} onQuayLai={onQuayLai} onChonGia={vi.fn()} onVeLich={vi.fn()} />
    </ToastProvider>,
  );
  return { xoa, onDaXoa, onQuayLai };
}
const nutXoaPhong = () => screen.getByRole('button', { name: 'Xóa phòng' });

describe('YC3.6 · CN5-02 Xóa căn', () => {
  it('YC3.6-NT12 bấm "Xóa phòng" ở CN5-02 của 2105 thì hiện hộp "Xóa phòng 2105?" với "Xóa" và "Không"; "Không" thì 2105 còn nguyên', async () => {
    const { xoa, onDaXoa } = veXoa(CAN_2105);
    await screen.findByDisplayValue('2105');
    // Nút chữ "Xóa phòng" nằm dưới "Lưu thay đổi" (YC3-H3).
    const luu = nutLuu();
    const nut = nutXoaPhong();
    expect(luu.compareDocumentPosition(nut) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    fireEvent.click(nut);
    const hoi = screen.getByRole('alertdialog', { name: 'Xóa phòng 2105?' });
    expect(within(hoi).getByText('Xóa phòng 2105?')).toBeInTheDocument();
    expect(within(hoi).getByText('Căn sẽ không còn ở lịch và với sale. Đặt phòng cũ và doanh thu vẫn giữ.')).toBeInTheDocument();
    expect(within(hoi).getByRole('button', { name: 'Xóa' })).toBeInTheDocument();
    fireEvent.click(within(hoi).getByRole('button', { name: 'Không' }));
    expect(screen.queryByRole('alertdialog')).toBeNull();
    expect(xoa).not.toHaveBeenCalled();
    expect(onDaXoa).not.toHaveBeenCalled();
    expect(screen.getByDisplayValue('2105')).toBeInTheDocument();
  });

  it('YC3.6-NT12 bấm "Xóa" ở hộp hỏi lại thì gọi lệnh xóa 2105, về tab Căn với toast "Đã xóa phòng 2105"', async () => {
    const { xoa, onDaXoa } = veXoa(CAN_2105);
    await screen.findByDisplayValue('2105');
    fireEvent.click(nutXoaPhong());
    fireEvent.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Xóa' }));
    await waitFor(() => expect(onDaXoa).toHaveBeenCalledTimes(1));
    expect(xoa).toHaveBeenCalledWith('can-2105');
    expect(screen.getByRole('status')).toHaveTextContent('Đã xóa phòng 2105');
  });

  it('YC3.6-NT1 xóa 3402 lúc còn B2 thì app báo "Căn còn đặt phòng sắp tới" bằng toast lỗi và ở lại CN5-02, 3402 không bị xóa', async () => {
    const { xoa, onDaXoa } = veXoa(CAN_3402, async () => { throw new LoiNguoiDung('Căn còn đặt phòng sắp tới'); });
    await screen.findByDisplayValue('3402');
    fireEvent.click(nutXoaPhong());
    fireEvent.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Xóa' }));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Căn còn đặt phòng sắp tới'));
    expect(screen.getByRole('status').textContent).not.toContain('✓');
    expect(xoa).toHaveBeenCalledWith('can-3402');
    expect(onDaXoa).not.toHaveBeenCalled();
    expect(screen.queryByRole('alertdialog')).toBeNull();
    expect(screen.getByRole('heading', { name: 'Sửa phòng 3402' })).toBeInTheDocument();
  });

  it('YC3.6 QT5.5 căn không có, đã xóa hay của người khác (42501) thì báo "Có lỗi xảy ra. Bạn thử lại sau ít phút." và ở lại', async () => {
    const { onDaXoa } = veXoa(CAN_3402, async () => { throw new LoiKhongConCan(); });
    await screen.findByDisplayValue('3402');
    fireEvent.click(nutXoaPhong());
    fireEvent.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Xóa' }));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Có lỗi xảy ra. Bạn thử lại sau ít phút.'));
    expect(onDaXoa).not.toHaveBeenCalled();
  });

  it('YC3.6 HV2 mất mạng khi xóa thì báo mất mạng, ở lại CN5-02', async () => {
    const { onDaXoa } = veXoa(CAN_3402, async () => { throw new TypeError('Failed to fetch'); });
    await screen.findByDisplayValue('3402');
    fireEvent.click(nutXoaPhong());
    fireEvent.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: 'Xóa' }));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(/mất mạng|thử lại/i));
    expect(onDaXoa).not.toHaveBeenCalled();
  });

  it('YC3.6-NT9 CN5-02 và tab Căn không có nút nào cho hiện lại căn đã xóa', async () => {
    veXoa(CAN_2105);
    await screen.findByDisplayValue('2105');
    const nutHienLai = /hiện lại|khôi phục|bỏ xóa|phục hồi|hoàn tác/i;
    expect(screen.queryAllByRole('button', { name: nutHienLai })).toHaveLength(0);
    cleanup();
    render(<CN5DanhSachCan ds={[]} onMoCan={vi.fn()} onThemCan={vi.fn()} />);
    expect(screen.queryAllByRole('button', { name: nutHienLai })).toHaveLength(0);
    expect(screen.queryByText(/đã xóa/i)).toBeNull();
  });
});
