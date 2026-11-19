// Test unit mục Ảnh trên form Thêm căn: CN5-A1, CN5-A2, CN5-A3 (YC3.3 bước 22 đến 28, HV4-NT6, HV3 bước 7).
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LoiNguoiDung } from '../chung/matKetNoi';
import { ToastProvider } from '../chung/Toast';
import { CAU_LOI_FILE } from '../lib/anh';
import type { CanMoi, TaiAnh } from '../lib/dichVuCan';
import { CN5A1ThemCan } from './CN5A1ThemCan';

beforeEach(() => localStorage.clear());
afterEach(() => cleanup());

/** Lệnh tải giả: mỗi lần gọi giữ lại để test tự cho xong, lỗi, hay báo tiến độ. */
function taiGia() {
  const lan: { file: File; tienDo: (p: number) => void; tinHieu: AbortSignal; xong: (id: string) => void; hong: (e: unknown) => void }[] = [];
  const fn = vi.fn<TaiAnh>((file, tienDo, tinHieu) => new Promise<string>((xong, hong) => {
    lan.push({ file, tienDo, tinHieu, xong, hong });
    tinHieu.addEventListener('abort', () => hong(new DOMException('đã hủy', 'AbortError')));
  }));
  return { fn, lan };
}

function ve(taiAnh: TaiAnh, taoCan = vi.fn(async (_c: CanMoi) => 'id-can')) {
  const onXong = vi.fn();
  render(<ToastProvider><CN5A1ThemCan taoCan={taoCan} taiAnh={taiAnh} onXong={onXong} onQuayLai={vi.fn()} /></ToastProvider>);
  return { taoCan, onXong };
}

const anh = (ten: string, loai = 'image/jpeg', co = 300_000) => {
  const f = new File([new Uint8Array(8)], ten, { type: loai });
  Object.defineProperty(f, 'size', { value: co });
  return f;
};
const chon = (files: File[]) => fireEvent.change(screen.getByTestId('o-chon-anh'), { target: { files } });
const nutThemCan = () => screen.getByRole('button', { name: /^(Thêm căn|Đang lưu…)$/ });
const dienDu = () => {
  fireEvent.change(screen.getByLabelText(/Mã căn \(tên căn hộ\)/), { target: { value: '2105' } });
  fireEvent.click(screen.getByRole('button', { name: '2PN' }));
};
const oAnh = () => within(screen.getByRole('list', { name: 'Ảnh căn' })).getAllByRole('listitem').filter((li) => li.hasAttribute('data-tt'));

describe('YC3.3 · ảnh căn trên form Thêm căn', () => {
  it('HV4-NT6 bấm "Thêm ảnh" thì mở ô chọn file (nhiều ảnh, chỉ loại ảnh), không có hộp thoại xin quyền', () => {
    const { fn } = taiGia();
    ve(fn);
    const o = screen.getByTestId('o-chon-anh') as HTMLInputElement;
    expect(o.type).toBe('file');
    expect(o.multiple).toBe(true);
    expect(o.accept).toContain('image/jpeg');
    expect(o.accept).toContain('image/png');
    expect(o.accept).toContain('image/heic');
    const moO = vi.spyOn(o, 'click');
    const xinQuyen = vi.fn();
    Object.defineProperty(navigator, 'permissions', { value: { query: xinQuyen }, configurable: true });
    fireEvent.click(screen.getByRole('button', { name: /Thêm ảnh\s*· chọn nhiều ảnh cùng lúc/ }));
    expect(moO).toHaveBeenCalledTimes(1);
    expect(xinQuyen).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('YC3.3-NT1 còn ảnh đang tải thì nút "Thêm căn" không bấm được và có dòng "Đang tải 1 ảnh. Chờ tải xong mới thêm được căn."', async () => {
    const { fn, lan } = taiGia();
    const { taoCan, onXong } = ve(fn);
    dienDu();
    chon([anh('a.jpg')]);
    expect(fn).toHaveBeenCalledTimes(1); // YC3.3 bước 23: tải lên ngay khi chọn
    expect(screen.getByText('Đang tải 1 ảnh. Chờ tải xong mới thêm được căn.')).toBeInTheDocument();
    expect(screen.getByText('Ảnh (1)')).toBeInTheDocument();
    expect(screen.getByText('Đang tải 1 ảnh…')).toBeInTheDocument();
    expect(nutThemCan()).toBeDisabled();
    act(() => lan[0]!.tienDo(60));
    expect(screen.getByText('Đang tải 60%')).toBeInTheDocument();
    fireEvent.click(nutThemCan());
    expect(taoCan).not.toHaveBeenCalled();

    await act(async () => lan[0]!.xong('anh-1'));
    expect(screen.queryByText(/Chờ tải xong/)).toBeNull();
    expect(nutThemCan()).toBeEnabled();
    fireEvent.click(nutThemCan());
    await waitFor(() => expect(onXong).toHaveBeenCalled());
    expect(taoCan.mock.calls[0]![0]).toMatchObject({ maCan: '2105', soPhongNgu: 2, anh: ['anh-1'] });
  });

  it('YC3.3-NT2 ảnh tải lỗi thì ô có "Thử lại" và ✕; căn không thêm được tới khi ảnh tải lại được', async () => {
    const { fn, lan } = taiGia();
    const { taoCan, onXong } = ve(fn);
    dienDu();
    chon([anh('a.jpg'), anh('b.jpg')]);
    await act(async () => lan[0]!.xong('anh-a'));
    await act(async () => lan[1]!.hong(new TypeError('mất mạng')));
    const o2 = oAnh()[1]!;
    expect(within(o2).getByText('⚠️ Tải lỗi')).toBeInTheDocument();
    expect(within(o2).getByRole('button', { name: 'Thử lại' })).toBeInTheDocument();
    expect(within(o2).getByRole('button', { name: 'Bỏ ảnh 2' })).toHaveTextContent('✕');
    expect(screen.getByText('1 ảnh tải lỗi')).toBeInTheDocument();
    expect(screen.getByText('⚠️ 1 ảnh chưa tải được. Bấm Thử lại hoặc xóa ảnh đó rồi thêm căn.')).toBeInTheDocument();

    await act(async () => { fireEvent.click(nutThemCan()); });
    expect(taoCan).not.toHaveBeenCalled();
    expect(screen.getByText('Chưa thêm được căn. Sửa 1 chỗ bên dưới.')).toBeInTheDocument();

    // Thử lại tải lại đúng ảnh đó.
    fireEvent.click(within(o2).getByRole('button', { name: 'Thử lại' }));
    expect(fn).toHaveBeenCalledTimes(3);
    expect(lan[2]!.file.name).toBe('b.jpg');
    await act(async () => lan[2]!.xong('anh-b'));
    fireEvent.click(nutThemCan());
    await waitFor(() => expect(onXong).toHaveBeenCalled());
    expect(taoCan.mock.calls[0]![0].anh).toEqual(['anh-a', 'anh-b']);
  });

  it('YC3.3-NT2 ảnh tải lỗi bị bỏ bằng ✕ thì thêm được căn, không kèm ảnh đó', async () => {
    const { fn, lan } = taiGia();
    const { taoCan, onXong } = ve(fn);
    dienDu();
    chon([anh('a.jpg')]);
    await act(async () => lan[0]!.hong(new TypeError('mất mạng')));
    await act(async () => { fireEvent.click(nutThemCan()); });
    expect(taoCan).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Bỏ ảnh 1' }));
    expect(screen.getByText('Ảnh')).toBeInTheDocument();
    expect(screen.getByText('Bạn có thể thêm sau')).toBeInTheDocument();
    fireEvent.click(nutThemCan());
    await waitFor(() => expect(onXong).toHaveBeenCalled());
    expect(taoCan.mock.calls[0]![0].anh).toEqual([]);
  });

  it('YC3.3-NT3 chọn 15 ảnh khi chưa có ảnh nào thì chỉ nhận 12, toast báo bỏ 3; đủ 12 ảnh thì nút "Thêm ảnh" không bấm được', async () => {
    const { fn, lan } = taiGia();
    ve(fn);
    chon(Array.from({ length: 15 }, (_, i) => anh(`a${i + 1}.jpg`)));
    expect(oAnh()).toHaveLength(12);
    expect(screen.getByText('Ảnh (12)')).toBeInTheDocument();
    const toast = document.querySelector('[data-kieu="toast"]');
    expect(toast).toHaveTextContent('Mỗi căn tối đa 12 ảnh. Đã bỏ 3 ảnh.');
    const nutThemAnh = screen.getByRole('button', { name: 'Thêm ảnh' });
    expect(nutThemAnh).toBeDisabled();
    const moO = vi.spyOn(screen.getByTestId('o-chon-anh') as HTMLInputElement, 'click');
    fireEvent.click(nutThemAnh);
    expect(moO).not.toHaveBeenCalled();
    // Tải lần lượt, mỗi lượt 2 ảnh; đủ 12 lệnh tải, không ảnh thừa nào được tải.
    for (let i = 0; i < 12; i++) await act(async () => lan[i]!.xong(`id-${i + 1}`));
    expect(fn).toHaveBeenCalledTimes(12);
    expect(lan.map((l) => l.file.name)).toEqual(Array.from({ length: 12 }, (_, i) => `a${i + 1}.jpg`));
    expect(screen.getByRole('button', { name: 'Thêm ảnh' })).toBeDisabled();
  });

  it('YC3.3-NT3 đã có 10 ảnh chọn thêm 3 thì nhận 2, toast "Mỗi căn tối đa 12 ảnh. Đã bỏ 1 ảnh."', () => {
    const { fn } = taiGia();
    ve(fn);
    chon(Array.from({ length: 10 }, (_, i) => anh(`a${i}.jpg`)));
    chon([anh('x.jpg'), anh('y.jpg'), anh('z.jpg')]);
    expect(oAnh()).toHaveLength(12);
    expect(document.querySelector('[data-kieu="toast"]')).toHaveTextContent('Mỗi căn tối đa 12 ảnh. Đã bỏ 1 ảnh.');
  });

  it('YC3.3-NT4 chọn 3 ảnh thì ảnh chọn đầu tiên có nhãn "Ảnh đại diện" và lưu căn với ảnh đó đứng đầu', async () => {
    const { fn, lan } = taiGia();
    const { taoCan, onXong } = ve(fn);
    dienDu();
    chon([anh('dau.jpg'), anh('hai.jpg'), anh('ba.jpg')]);
    const ds = oAnh();
    expect(within(ds[0]!).getByText('Ảnh đại diện')).toBeInTheDocument();
    expect(within(ds[1]!).queryByText('Ảnh đại diện')).toBeNull();
    expect(within(ds[2]!).queryByText('Ảnh đại diện')).toBeNull();
    expect(screen.getAllByText('Ảnh đại diện')).toHaveLength(1);
    expect(screen.getByText('Ảnh đầu tiên là ảnh đại diện · Tối đa 12 ảnh')).toBeInTheDocument();
    // Tải xong không theo thứ tự chọn: thứ tự gửi vẫn theo thứ tự chọn.
    await act(async () => lan[1]!.xong('id-hai'));
    await act(async () => lan[0]!.xong('id-dau'));
    await act(async () => lan[2]!.xong('id-ba'));
    fireEvent.click(nutThemCan());
    await waitFor(() => expect(onXong).toHaveBeenCalled());
    expect(taoCan.mock.calls[0]![0].anh).toEqual(['id-dau', 'id-hai', 'id-ba']);
  });

  it('YC3.3-NT6 chọn file 20 MB hay file PDF thì ô đó báo "Ảnh phải là JPEG, PNG hoặc HEIC, tối đa 15 MB" và không tải lên', () => {
    const { fn } = taiGia();
    ve(fn);
    chon([anh('to.jpg', 'image/jpeg', 20 * 1024 * 1024), anh('hop-dong.pdf', 'application/pdf', 200_000)]);
    const ds = oAnh();
    expect(ds).toHaveLength(2);
    expect(within(ds[0]!).getByText(`⚠️ ${CAU_LOI_FILE}`)).toBeInTheDocument();
    expect(within(ds[1]!).getByText(`⚠️ ${CAU_LOI_FILE}`)).toBeInTheDocument();
    expect(fn).not.toHaveBeenCalled();
    expect(screen.queryByText(/Chờ tải xong/)).toBeNull();
  });

  it('YC3.3-NT6 ảnh quá 40 triệu điểm ảnh (lệnh tải báo câu file sai) thì ô đó báo câu file sai, không có "Thử lại"', async () => {
    const { fn, lan } = taiGia();
    ve(fn);
    chon([anh('rat-to.jpg')]);
    await act(async () => lan[0]!.hong(new LoiNguoiDung(CAU_LOI_FILE)));
    expect(screen.getByText(`⚠️ ${CAU_LOI_FILE}`)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Thử lại' })).toBeNull();
  });

  it('YC3.3 bước 28 bấm ✕ trên ảnh đã tải thì bỏ khỏi danh sách, lưu căn không kèm ảnh đó', async () => {
    const { fn, lan } = taiGia();
    const { taoCan, onXong } = ve(fn);
    dienDu();
    chon([anh('a.jpg'), anh('b.jpg')]);
    await act(async () => lan[0]!.xong('id-a'));
    await act(async () => lan[1]!.xong('id-b'));
    fireEvent.click(screen.getByRole('button', { name: 'Bỏ ảnh 1' }));
    expect(oAnh()).toHaveLength(1);
    expect(within(oAnh()[0]!).getByText('Ảnh đại diện')).toBeInTheDocument();
    fireEvent.click(nutThemCan());
    await waitFor(() => expect(onXong).toHaveBeenCalled());
    expect(taoCan.mock.calls[0]![0].anh).toEqual(['id-b']);
  });

  it('HV3 bước 7 rời app khi đang tải thì ảnh chưa tải xong thành "Tải lỗi"', async () => {
    const { fn, lan } = taiGia();
    ve(fn);
    chon([anh('a.jpg')]);
    Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
    await act(async () => { document.dispatchEvent(new Event('visibilitychange')); });
    Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
    expect(lan[0]!.tinHieu.aborted).toBe(true);
    await waitFor(() => expect(screen.getByText('⚠️ Tải lỗi')).toBeInTheDocument());
    expect(screen.getByRole('button', { name: 'Thử lại' })).toBeInTheDocument();
  });

  it('HV8-NT4 database từ chối ảnh tạm bằng câu thì toast lỗi hiện nguyên câu, không có dấu ✓', async () => {
    const { fn, lan } = taiGia();
    ve(fn);
    chon([anh('a.jpg')]);
    const cau = 'Bạn đang có quá nhiều ảnh chưa gắn vào căn. Thêm căn hoặc bỏ bớt ảnh rồi thử lại.';
    await act(async () => lan[0]!.hong(new LoiNguoiDung(cau)));
    const toast = document.querySelector('[data-kieu="toast"]');
    expect(toast).toHaveTextContent(cau);
    expect(toast?.textContent).not.toContain('✓');
    expect(screen.getByText('⚠️ Tải lỗi')).toBeInTheDocument();
  });
});
