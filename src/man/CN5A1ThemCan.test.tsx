// Test unit màn CN5-A1 Thêm căn, CN5-A3 lỗi khi lưu (YC3.2 bước 15 đến 21, QT5.6, HV3), phần mở rộng (YC3.4).
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LoiNguoiDung } from '../chung/matKetNoi';
import { CAU_KHOI_PHUC } from '../chung/nhap';
import { ToastProvider } from '../chung/Toast';
import type { CanMoi } from '../lib/dichVuCan';
import type { DanhSachToa } from '../lib/toaNha';
import { docBanNhapThemCan, ghiBanNhapThemCan, GIU_NHAP_THEM_CAN_MS } from './banNhap';
import { CN5A1ThemCan } from './CN5A1ThemCan';

beforeEach(() => localStorage.clear());
afterEach(() => { cleanup(); vi.useRealTimers(); });

function ve(taoCan?: (c: CanMoi) => Promise<string>) {
  const onXong = vi.fn();
  const onQuayLai = vi.fn();
  render(<ToastProvider><CN5A1ThemCan taoCan={taoCan} onXong={onXong} onQuayLai={onQuayLai} /></ToastProvider>);
  return { onXong, onQuayLai };
}

const oMa = () => screen.getByLabelText(/Mã căn \(tên căn hộ\)/);
const nut = () => screen.getByRole('button', { name: /^(Thêm căn|Đang lưu…)$/ });
const chip = (chu: string) => screen.getByRole('button', { name: chu });

describe('YC3.2 · CN5-A1 Thêm căn', () => {
  it('YC3.2 bước 15 form có tiêu đề "Thêm căn", ô mã căn, hàng chip số phòng ngủ, mục Ảnh, dòng thu gọn', () => {
    ve(vi.fn());
    expect(screen.getByRole('heading', { name: 'Thêm căn' })).toBeInTheDocument();
    expect(oMa()).toHaveAttribute('placeholder', 'VD: 1509 hoặc Greenbay');
    for (const c of ['Studio', '1PN', '2PN', '3PN', '4PN+']) expect(chip(c)).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByText('Ảnh')).toBeInTheDocument();
    expect(screen.getByText('Bạn có thể thêm sau')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Thêm tòa nhà, mô tả gửi khách, view\.\.\./ })).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByText('Không bắt buộc. Chỉ cần mã căn và số phòng ngủ là dùng được lịch.')).toBeInTheDocument();
  });

  it('YC3.2-NT1 chưa có mã căn hay số phòng ngủ thì nút "Thêm căn" không bấm được, dòng "Còn thiếu" nêu đúng ô thiếu', () => {
    const tao = vi.fn();
    ve(tao);
    expect(nut()).toBeDisabled();
    expect(screen.getByText('Còn thiếu: mã căn, số phòng ngủ')).toBeInTheDocument();
    fireEvent.change(oMa(), { target: { value: '1509' } });
    expect(screen.getByText('Còn thiếu: số phòng ngủ')).toBeInTheDocument();
    expect(nut()).toBeDisabled();
    fireEvent.change(oMa(), { target: { value: '' } });
    fireEvent.click(chip('2PN'));
    expect(screen.getByText('Còn thiếu: mã căn')).toBeInTheDocument();
    expect(nut()).toBeDisabled();
    fireEvent.click(nut());
    expect(tao).not.toHaveBeenCalled();
  });

  it('YC3.2-NT2 chỉ nhập "2105" và chọn "1PN", không mở phần thêm, không ảnh, thì thêm được', async () => {
    const tao = vi.fn(async (_c: CanMoi) => 'id-2105');
    const { onXong } = ve(tao);
    fireEvent.change(oMa(), { target: { value: ' 2105 ' } });
    fireEvent.click(chip('1PN'));
    expect(chip('1PN')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByText('Đủ thông tin. Ảnh, giá thêm sau cũng được.')).toBeInTheDocument();
    expect(nut()).toBeEnabled();
    fireEvent.click(nut());
    await waitFor(() => expect(onXong).toHaveBeenCalledWith('2105', 'id-2105'));
    expect(tao).toHaveBeenCalledTimes(1);
    expect(tao.mock.calls[0]![0]).toMatchObject({ maCan: '2105', soPhongNgu: 1 });
    expect(tao.mock.calls[0]![0].clientId).toMatch(/^[0-9a-f-]{36}$/);
  });

  it('YC3.2-NT3 bỏ trống số giường thì dòng "Còn thiếu" không nhắc số giường và vẫn thêm được', async () => {
    const tao = vi.fn(async (_c: CanMoi) => 'id');
    const { onXong } = ve(tao);
    fireEvent.change(oMa(), { target: { value: 'Greenbay' } });
    fireEvent.click(chip('Studio'));
    expect(screen.queryByText(/giường/)).toBeNull();
    fireEvent.click(nut());
    await waitFor(() => expect(onXong).toHaveBeenCalled());
    expect(tao.mock.calls[0]![0]).toMatchObject({ maCan: 'Greenbay', soPhongNgu: 0 });
    expect(tao.mock.calls[0]![0].soGiuong ?? null).toBeNull();
  });

  it('YC3.2 bước 18 đang lưu thì nút đổi chữ, không bấm lại được', async () => {
    let xong!: (v: string) => void;
    const tao = vi.fn(() => new Promise<string>((r) => { xong = r; }));
    ve(tao);
    fireEvent.change(oMa(), { target: { value: '2105' } });
    fireEvent.click(chip('1PN'));
    fireEvent.click(nut());
    expect(await screen.findByRole('button', { name: 'Đang lưu…' })).toBeDisabled();
    fireEvent.click(nut());
    expect(tao).toHaveBeenCalledTimes(1);
    await act(async () => { xong('id'); });
  });

  it('YC3.2-NT4 database từ chối mã trùng thì câu "Đã có căn 1509. Kiểm tra lại mã căn." hiện dưới ô mã căn, giữ mọi ô (CN5-A3)', async () => {
    const tao = vi.fn(async () => { throw new LoiNguoiDung('Đã có căn 1509. Kiểm tra lại mã căn.'); });
    const { onXong } = ve(tao);
    fireEvent.change(oMa(), { target: { value: '1509' } });
    fireEvent.click(chip('2PN'));
    fireEvent.click(nut());
    const loi = await screen.findByText(/Đã có căn 1509\. Kiểm tra lại mã căn\./);
    expect(oMa()).toHaveAttribute('aria-describedby', loi.id);
    expect(oMa()).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('Chưa thêm được căn. Sửa 1 chỗ bên dưới.')).toBeInTheDocument();
    expect(oMa()).toHaveValue('1509');
    expect(chip('2PN')).toHaveAttribute('aria-pressed', 'true');
    expect(onXong).not.toHaveBeenCalled();
    // Sửa mã thì câu dưới ô mất.
    fireEvent.change(oMa(), { target: { value: '1510' } });
    expect(screen.queryByText(/Đã có căn 1509/)).toBeNull();
  });

  it('YC3.2 bước 21 mất mạng thì ở lại form, giữ dữ liệu, toast "Chưa lưu được vì mất mạng. Kiểm tra mạng rồi bấm lại."', async () => {
    const tao = vi.fn(async () => { throw new TypeError('Failed to fetch'); });
    const { onXong } = ve(tao);
    fireEvent.change(oMa(), { target: { value: '2105' } });
    fireEvent.click(chip('1PN'));
    fireEvent.click(nut());
    expect(await screen.findByText('Chưa lưu được vì mất mạng. Kiểm tra mạng rồi bấm lại.')).toBeInTheDocument();
    expect(oMa()).toHaveValue('2105');
    expect(onXong).not.toHaveBeenCalled();
  });

  it('YC3.2 bước 21 quá 15 giây không có trả lời thì toast mất mạng; YC3.2-NT9 bấm lại gửi cùng mã lần gửi', async () => {
    vi.useFakeTimers();
    const tao = vi.fn<(c: CanMoi) => Promise<string>>(() => new Promise<string>(() => {}));
    const { onXong } = ve(tao);
    fireEvent.change(oMa(), { target: { value: '2105' } });
    fireEvent.click(chip('1PN'));
    fireEvent.click(nut());
    await act(async () => { await vi.advanceTimersByTimeAsync(15_000); });
    expect(screen.getByText('Chưa lưu được vì mất mạng. Kiểm tra mạng rồi bấm lại.')).toBeInTheDocument();
    tao.mockImplementation(async () => 'id-2105');
    fireEvent.click(nut());
    await act(async () => { await vi.advanceTimersByTimeAsync(0); });
    expect(onXong).toHaveBeenCalledWith('2105', 'id-2105');
    expect(tao).toHaveBeenCalledTimes(2);
    expect(tao.mock.calls[1]![0].clientId).toBe(tao.mock.calls[0]![0].clientId);
  });

  it('HV3-NT2 nháp lưu mỗi lần sửa; mở lại form thì điền lại và báo "Đã khôi phục nội dung bạn đang nhập"', () => {
    ve(vi.fn());
    expect(screen.queryByText(CAU_KHOI_PHUC)).toBeNull();
    fireEvent.change(oMa(), { target: { value: '2105' } });
    fireEvent.click(chip('3PN'));
    const nhap = docBanNhapThemCan();
    expect(nhap).toMatchObject({ maCan: '2105', soPhongNgu: 3 });
    cleanup();
    ve(vi.fn());
    expect(screen.getByText('Đã khôi phục nội dung bạn đang nhập')).toBeInTheDocument();
    expect(oMa()).toHaveValue('2105');
    expect(chip('3PN')).toHaveAttribute('aria-pressed', 'true');
  });

  it('HV3-NT2 HV3-H1 nháp giữ 7 ngày kể từ lần sửa cuối, quá thì bỏ', () => {
    const bay = Date.now();
    ghiBanNhapThemCan({ maCan: '2105', soPhongNgu: 1, clientId: 'x' }, bay - GIU_NHAP_THEM_CAN_MS + 60_000);
    expect(docBanNhapThemCan(bay)).not.toBeNull();
    ghiBanNhapThemCan({ maCan: '2105', soPhongNgu: 1, clientId: 'x' }, bay - GIU_NHAP_THEM_CAN_MS - 60_000);
    expect(docBanNhapThemCan(bay)).toBeNull();
    expect(GIU_NHAP_THEM_CAN_MS).toBe(7 * 24 * 60 * 60 * 1000);
  });

  it('HV3 bước 5 lưu xong thì xóa nháp; bấm quay lại (bỏ form) cũng xóa nháp', async () => {
    const tao = vi.fn(async (_c: CanMoi) => 'id');
    const { onXong } = ve(tao);
    fireEvent.change(oMa(), { target: { value: '2105' } });
    fireEvent.click(chip('1PN'));
    fireEvent.click(nut());
    await waitFor(() => expect(onXong).toHaveBeenCalled());
    expect(docBanNhapThemCan()).toBeNull();
    cleanup();
    const { onQuayLai } = ve(tao);
    fireEvent.change(oMa(), { target: { value: '9' } });
    fireEvent.click(screen.getByRole('button', { name: 'Quay lại' }));
    expect(onQuayLai).toHaveBeenCalled();
    expect(docBanNhapThemCan()).toBeNull();
  });

  it('QT5.6 mở lại form có nháp thì dùng lại mã lần gửi của nháp', async () => {
    ghiBanNhapThemCan({ maCan: '2105', soPhongNgu: 1, clientId: '11111111-1111-4111-8111-111111111111' });
    const tao = vi.fn(async (_c: CanMoi) => 'id');
    ve(tao);
    fireEvent.click(nut());
    await waitFor(() => expect(tao).toHaveBeenCalled());
    expect(tao.mock.calls[0]![0].clientId).toBe('11111111-1111-4111-8111-111111111111');
  });
});

// ===== YC3.4 · CN5-A1 phần mở rộng, CN5-A1b =====
const TOA: DanhSachToa = {
  ds: [
    { id: 't1', ten: 'ICON40', khuVuc: null, home247: true },
    { id: 't2', ten: 'Sapphire', khuVuc: null, home247: true },
    { id: 't3', ten: 'À La Carte', khuVuc: null, home247: true },
    { id: 't4', ten: 'Green Bay', khuVuc: 'Bãi Cháy', home247: true },
    { id: 't5', ten: 'Mường Thanh', khuVuc: null, home247: true },
    { id: 't6', ten: 'Bim Hạ Long', khuVuc: null, home247: false },
  ],
  daDung: [],
};

function veDu(p: { taoCan?: (c: CanMoi) => Promise<string>; layToa?: () => Promise<DanhSachToa>; themToa?: (t: string) => Promise<string> } = {}) {
  const onXong = vi.fn();
  const layToa = p.layToa ?? vi.fn(async () => TOA);
  render(<ToastProvider><CN5A1ThemCan taoCan={p.taoCan} layToa={layToa} themToa={p.themToa} onXong={onXong} onQuayLai={vi.fn()} /></ToastProvider>);
  return { onXong, layToa };
}
const moPhanThem = () => fireEvent.click(screen.getByRole('button', { name: /Thêm tòa nhà, mô tả gửi khách, view\.\.\./ }));
const nhom = (ten: string) => screen.getByRole('group', { name: ten });

describe('YC3.4 · CN5-A1 phần mở rộng', () => {
  it('YC3.4-NT2 mở hàng chip "Loại view" thì thấy đúng "Biển", "Thành phố", "Núi", không có "Vịnh"', async () => {
    veDu();
    moPhanThem();
    const chipView = within(nhom('Loại view')).getAllByRole('button');
    expect(chipView.map((b) => b.textContent)).toEqual(['Biển', 'Thành phố', 'Núi']);
    expect(screen.queryByRole('button', { name: 'Vịnh' })).toBeNull();
    expect(screen.queryByText('Vịnh')).toBeNull();
    await screen.findByRole('button', { name: 'ICON40' });
  });

  it('YC3.4 bước 29 mở phần thêm: chip tòa (tối đa 6 gồm "+ Tòa khác"), view, số giường, mô tả gửi khách, nút "Thu gọn"', async () => {
    const { layToa } = veDu();
    expect(layToa).not.toHaveBeenCalled();
    moPhanThem();
    await screen.findByRole('button', { name: 'ICON40' });
    expect(layToa).toHaveBeenCalledTimes(1);
    const chipToa = within(nhom('Tòa nhà')).getAllByRole('button').map((b) => b.textContent);
    expect(chipToa).toEqual(['ICON40', 'Sapphire', 'À La Carte', 'Green Bay', 'Mường Thanh', '+ Tòa khác']);
    expect(screen.getByLabelText('Số giường')).toHaveAttribute('placeholder', 'VD: 3');
    expect(screen.getByText('Không bắt buộc. Thẻ căn ghi "2PN · 3 giường".')).toBeInTheDocument();
    expect(screen.getByLabelText(/Mô tả gửi khách/)).toBeInTheDocument();
    expect(screen.getByText('Sale dùng đoạn này khi gửi thông tin căn cho khách.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Thu gọn' })).toBeInTheDocument();
  });

  it('YC3.4 bước 29 tòa mình đã dùng đứng trước tòa Home247 đặt sẵn', async () => {
    veDu({ layToa: async () => ({ ...TOA, daDung: ['t6'] }) });
    moPhanThem();
    await screen.findByRole('button', { name: 'Bim Hạ Long' });
    expect(within(nhom('Tòa nhà')).getAllByRole('button').map((b) => b.textContent))
      .toEqual(['Bim Hạ Long', 'ICON40', 'Sapphire', 'À La Carte', 'Green Bay', '+ Tòa khác']);
  });

  it('YC3.4 HV1 HV2 đang tải danh sách tòa thì khung xám; tải lỗi thì "Thử lại" tải lại', async () => {
    const layToa = vi.fn<() => Promise<DanhSachToa>>().mockRejectedValueOnce(new TypeError('mất mạng')).mockResolvedValue(TOA);
    veDu({ layToa });
    moPhanThem();
    expect(screen.getByLabelText('Đang tải')).toBeInTheDocument();
    fireEvent.click(await screen.findByRole('button', { name: 'Thử lại' }));
    await screen.findByRole('button', { name: 'ICON40' });
    expect(layToa).toHaveBeenCalledTimes(2);
  });

  it('YC3-H7 chọn một loại view; chạm chip đang chọn thì bỏ chọn', () => {
    veDu();
    moPhanThem();
    fireEvent.click(chip('Biển'));
    expect(chip('Biển')).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(chip('Núi'));
    expect(chip('Biển')).toHaveAttribute('aria-pressed', 'false');
    expect(chip('Núi')).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(chip('Núi'));
    expect(chip('Núi')).toHaveAttribute('aria-pressed', 'false');
  });

  it('YC3.4 bước 30, 32 chạm "+ Tòa khác" mở CN5-A1b; chọn một tòa thì tòa đó được chọn, lưu cùng căn với view, số giường, mô tả', async () => {
    const tao = vi.fn(async (_c: CanMoi) => 'id');
    const { onXong } = veDu({ taoCan: tao });
    fireEvent.change(oMa(), { target: { value: '0808' } });
    fireEvent.click(chip('2PN'));
    moPhanThem();
    fireEvent.click(await screen.findByRole('button', { name: '+ Tòa khác' }));
    expect(chip('+ Tòa khác')).toHaveAttribute('aria-pressed', 'true');
    fireEvent.change(screen.getByLabelText('Tên tòa nhà'), { target: { value: 'bim' } });
    fireEvent.click(within(screen.getByRole('list', { name: 'Danh sách tòa' })).getByRole('button', { name: 'Bim Hạ Long' }));
    expect(screen.queryByLabelText('Tên tòa nhà')).toBeNull();
    expect(chip('Bim Hạ Long')).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(chip('Biển'));
    fireEvent.change(screen.getByLabelText('Số giường'), { target: { value: ' 3 ' } });
    fireEvent.change(screen.getByLabelText(/Mô tả gửi khách/), { target: { value: '  Căn góc  ' } });
    fireEvent.click(nut());
    await waitFor(() => expect(onXong).toHaveBeenCalled());
    expect(tao.mock.calls[0]![0]).toMatchObject({ maCan: '0808', soPhongNgu: 2, toaNhaId: 't6', loaiView: 'bien', soGiuong: 3, moTa: 'Căn góc' });
  });

  it('YC3.4 bước 33 chạm "+ Thêm tòa mới …" thì gọi lệnh thêm tòa và tòa mới được chọn cho căn', async () => {
    const tao = vi.fn(async (_c: CanMoi) => 'id');
    const themToa = vi.fn(async (_t: string) => 'moi-1');
    const { onXong } = veDu({ taoCan: tao, themToa });
    fireEvent.change(oMa(), { target: { value: '2105' } });
    fireEvent.click(chip('1PN'));
    moPhanThem();
    fireEvent.click(await screen.findByRole('button', { name: '+ Tòa khác' }));
    fireEvent.change(screen.getByLabelText('Tên tòa nhà'), { target: { value: 'Flamingo ' } });
    fireEvent.click(screen.getByRole('button', { name: '+ Thêm tòa mới "Flamingo"' }));
    await screen.findByRole('button', { name: 'Flamingo', pressed: true });
    expect(themToa).toHaveBeenCalledWith('Flamingo');
    fireEvent.click(nut());
    await waitFor(() => expect(onXong).toHaveBeenCalled());
    expect(tao.mock.calls[0]![0].toaNhaId).toBe('moi-1');
  });

  it('YC3.4-NT4 GD21 thêm "icon40" mà database trả tòa ICON40 đã có thì chip ICON40 được chọn, không có chip thứ hai', async () => {
    veDu({ themToa: async () => 't1' });
    moPhanThem();
    fireEvent.click(await screen.findByRole('button', { name: '+ Tòa khác' }));
    fireEvent.change(screen.getByLabelText('Tên tòa nhà'), { target: { value: 'icon40' } });
    fireEvent.click(screen.getByRole('button', { name: '+ Thêm tòa mới "icon40"' }));
    await screen.findByRole('button', { name: 'ICON40', pressed: true });
    expect(screen.queryByRole('button', { name: 'icon40' })).toBeNull();
  });

  it('YC3.4 bước 33 database từ chối tên tòa thì câu hiện dưới ô tên tòa; mất mạng thì toast mất mạng', async () => {
    const themToa = vi.fn<(t: string) => Promise<string>>()
      .mockRejectedValueOnce(new LoiNguoiDung('Tên tòa từ 1 đến 100 ký tự'))
      .mockRejectedValueOnce(new TypeError('Failed to fetch'));
    veDu({ themToa });
    moPhanThem();
    fireEvent.click(await screen.findByRole('button', { name: '+ Tòa khác' }));
    fireEvent.change(screen.getByLabelText('Tên tòa nhà'), { target: { value: 'x' } });
    fireEvent.click(screen.getByRole('button', { name: '+ Thêm tòa mới "x"' }));
    expect(await screen.findByText(/Tên tòa từ 1 đến 100 ký tự/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '+ Thêm tòa mới "x"' }));
    expect(await screen.findByText('Chưa lưu được vì mất mạng. Kiểm tra mạng rồi bấm lại.')).toBeInTheDocument();
  });

  it('YC3.4 số giường không vào dòng "Còn thiếu"; nhập 0, 51, chữ thì câu "Số giường từ 1 đến 50" và không bấm được "Thêm căn"', () => {
    const tao = vi.fn();
    veDu({ taoCan: tao });
    fireEvent.change(oMa(), { target: { value: '2105' } });
    fireEvent.click(chip('1PN'));
    moPhanThem();
    expect(screen.getByText('Đủ thông tin. Ảnh, giá thêm sau cũng được.')).toBeInTheDocument();
    for (const sai of ['0', '51', 'ba']) {
      fireEvent.change(screen.getByLabelText('Số giường'), { target: { value: sai } });
      expect(screen.getByText(/Số giường từ 1 đến 50/)).toBeInTheDocument();
      expect(nut()).toBeDisabled();
    }
    expect(screen.queryByText(/Còn thiếu/)).toBeNull();
    fireEvent.change(screen.getByLabelText('Số giường'), { target: { value: '50' } });
    expect(screen.queryByText(/Số giường từ 1 đến 50/)).toBeNull();
    expect(nut()).toBeEnabled();
  });

  it('YC3.4 mô tả quá 2.000 ký tự thì câu dưới ô và không bấm được "Thêm căn"', () => {
    veDu({ taoCan: vi.fn() });
    fireEvent.change(oMa(), { target: { value: '2105' } });
    fireEvent.click(chip('1PN'));
    moPhanThem();
    fireEvent.change(screen.getByLabelText(/Mô tả gửi khách/), { target: { value: 'a'.repeat(2001) } });
    expect(screen.getByText(/Mô tả dài tối đa 2\.000 ký tự/)).toBeInTheDocument();
    expect(nut()).toBeDisabled();
  });

  it('YC3.4 bước 34 bấm "Thu gọn" thì ẩn phần thêm, giữ giá trị đã nhập', async () => {
    const tao = vi.fn(async (_c: CanMoi) => 'id');
    const { onXong, layToa } = veDu({ taoCan: tao });
    fireEvent.change(oMa(), { target: { value: '2105' } });
    fireEvent.click(chip('1PN'));
    moPhanThem();
    fireEvent.click(await screen.findByRole('button', { name: 'Sapphire' }));
    fireEvent.click(chip('Thành phố'));
    fireEvent.change(screen.getByLabelText('Số giường'), { target: { value: '2' } });
    fireEvent.click(screen.getByRole('button', { name: 'Thu gọn' }));
    expect(screen.queryByLabelText('Số giường')).toBeNull();
    expect(screen.getByRole('button', { name: /Thêm tòa nhà, mô tả gửi khách, view\.\.\./ })).toHaveAttribute('aria-expanded', 'false');
    moPhanThem();
    expect(chip('Sapphire')).toHaveAttribute('aria-pressed', 'true');
    expect(chip('Thành phố')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByLabelText('Số giường')).toHaveValue('2');
    expect(layToa).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: 'Thu gọn' }));
    fireEvent.click(nut());
    await waitFor(() => expect(onXong).toHaveBeenCalled());
    expect(tao.mock.calls[0]![0]).toMatchObject({ toaNhaId: 't2', loaiView: 'thanh_pho', soGiuong: 2, moTa: null });
  });

  it('YC3.4 database từ chối "Không tìm thấy tòa nhà" khi phần thêm đang thu gọn thì mở ra, câu dưới hàng chip tòa', async () => {
    const tao = vi.fn(async () => { throw new LoiNguoiDung('Không tìm thấy tòa nhà'); });
    ghiBanNhapThemCan({ maCan: '2105', soPhongNgu: 1, clientId: '11111111-1111-4111-8111-111111111111', toaNhaId: 'mat' });
    veDu({ taoCan: tao });
    fireEvent.click(nut());
    expect(await screen.findByText(/Không tìm thấy tòa nhà/)).toBeInTheDocument();
    expect(screen.getByText('Chưa thêm được căn. Sửa 1 chỗ bên dưới.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Thu gọn' })).toBeInTheDocument();
  });

  it('HV3-NT2 YC3.4 nháp giữ cả tòa, view, số giường, mô tả và phần thêm đang mở', async () => {
    veDu();
    fireEvent.change(oMa(), { target: { value: '2105' } });
    moPhanThem();
    fireEvent.click(await screen.findByRole('button', { name: 'Green Bay' }));
    fireEvent.click(chip('Núi'));
    fireEvent.change(screen.getByLabelText('Số giường'), { target: { value: '4' } });
    fireEvent.change(screen.getByLabelText(/Mô tả gửi khách/), { target: { value: 'Gần biển' } });
    expect(docBanNhapThemCan()).toMatchObject({ toaNhaId: 't4', loaiView: 'nui', soGiuong: '4', moTa: 'Gần biển', moRong: true });
    cleanup();
    veDu();
    expect(screen.getByText('Đã khôi phục nội dung bạn đang nhập')).toBeInTheDocument();
    expect(await screen.findByRole('button', { name: 'Green Bay', pressed: true })).toBeInTheDocument();
    expect(chip('Núi')).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByLabelText('Số giường')).toHaveValue('4');
    expect(screen.getByLabelText(/Mô tả gửi khách/)).toHaveValue('Gần biển');
  });

  it('HV3 YC3.4 nháp chỉ có phần thêm (chưa có mã căn) cũng được khôi phục, kể cả đang thu gọn', () => {
    ghiBanNhapThemCan({ maCan: '', soPhongNgu: null, clientId: 'x', loaiView: 'bien', moRong: false });
    veDu();
    expect(screen.getByText('Đã khôi phục nội dung bạn đang nhập')).toBeInTheDocument();
    moPhanThem();
    expect(chip('Biển')).toHaveAttribute('aria-pressed', 'true');
  });
});
