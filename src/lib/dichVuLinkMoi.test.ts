// Test unit dịch vụ link mời (YC6.3, QD8): đọc dữ liệu xem trước, chữ của căn, link và tin mời.
import { describe, expect, it, vi } from 'vitest';
import {
  cauDaThemLich, cauLinkHong, docXemTruoc, duongDanLinkMoi, moTaCanXemTruoc, taoDichVuLinkMoiSupabase, tenCanXemTruoc, tinMoi,
} from './dichVuLinkMoi';
import { LoiNguoiDung } from '../chung/matKetNoi';

describe('YC6.3 · dịch vụ link mời', () => {
  it('YC6.3-NT2 đọc xem trước hợp lệ: tên chủ nhà, số căn, sơ lược căn, cờ', () => {
    const x = docXemTruoc({
      trang_thai: 'hop_le', ten_chu: 'Anh Tuấn', so_can: 2, da_them: false, cua_minh: false, sai_vai: false,
      can: [{ ma_can: '1103', so_phong_ngu: 3, so_giuong: 2, loai_view: 'view thành phố', ten_toa: 'Sapphire', anh: 'u/1.jpg' }],
    });
    expect(x).toMatchObject({ trangThai: 'hop_le', tenChu: 'Anh Tuấn', soCan: 2, daThem: false });
    if (x.trangThai !== 'hop_le') throw new Error('sai');
    expect(tenCanXemTruoc(x.can[0]!)).toBe('Sapphire 1103');
    expect(moTaCanXemTruoc(x.can[0]!)).toBe('3PN · 2 giường · view thành phố');
  });

  it('YC6.3 YC6-H10 link hỏng: chỉ có trạng thái và câu A1-link-01', () => {
    expect(docXemTruoc({ trang_thai: 'het_han' })).toEqual({ trangThai: 'het_han' });
    expect(docXemTruoc({ trang_thai: 'khong_dung_duoc' })).toEqual({ trangThai: 'khong_dung_duoc' });
    expect(docXemTruoc(null)).toEqual({ trangThai: 'khong_dung_duoc' });
    expect(cauLinkHong('het_han')).toBe('Link mời đã hết hạn.');
    expect(cauLinkHong('khong_dung_duoc')).toBe('Link mời không còn dùng được.');
  });

  it('YC6.3 bước 1, A10-02: link, tin mời, câu toast', () => {
    expect(duongDanLinkMoi('https://home247.vidu.test/', 'Ma01')).toBe('https://home247.vidu.test/l/Ma01');
    expect(tinMoi('https://x.test/l/Ma01')).toContain('https://x.test/l/Ma01');
    expect(cauDaThemLich(2, 'Anh Tuấn')).toBe('Đã thêm lịch 2 căn của Anh Tuấn');
  });

  it('YC6.3-NT6 "Thêm lịch" bị database từ chối thì ném câu cho người dùng', async () => {
    const sb = { rpc: vi.fn(async () => ({ data: null, error: { code: 'P0001', message: 'Link mời đã hết hạn.' } })) };
    const dv = taoDichVuLinkMoiSupabase(sb as never);
    await expect(dv.themLich('x')).rejects.toBeInstanceOf(LoiNguoiDung);
    await expect(dv.themLich('x')).rejects.toThrow('Link mời đã hết hạn.');
  });

  it('YC6.3-NT2 ảnh xem trước xin đường dẫn có hạn kèm mã link; kho không trả thì không có ảnh', async () => {
    const sb = { rpc: vi.fn(async () => ({ data: { trang_thai: 'hop_le', ten_chu: 'Anh Tuấn', so_can: 1,
      can: [{ ma_can: '1103', so_phong_ngu: 3, so_giuong: 2, loai_view: null, ten_toa: 'Sapphire', anh: 'u/1.jpg' }] }, error: null })) };
    const fetchGia = vi.fn(async () => new Response(JSON.stringify([{ path: 'u/1.jpg', signedURL: '/object/sign/anh-can/u/1.jpg?token=t' }])));
    vi.stubGlobal('fetch', fetchGia);
    const dv = taoDichVuLinkMoiSupabase(sb as never, { url: 'http://sb.vidu.test', khoa: 'khoa-anon' });
    const x = await dv.xemTruoc('MaLink');
    if (x.trangThai !== 'hop_le') throw new Error('sai');
    expect(x.can[0]!.anh).toBe('http://sb.vidu.test/storage/v1/object/sign/anh-can/u/1.jpg?token=t');
    const [, init] = fetchGia.mock.calls[0] as unknown as [string, RequestInit];
    expect((init.headers as Record<string, string>)['x-link-moi']).toBe('MaLink');
    fetchGia.mockImplementation(async () => new Response('x', { status: 400 }));
    const y = await dv.xemTruoc('MaLink');
    if (y.trangThai !== 'hop_le') throw new Error('sai');
    expect(y.can[0]!.anh).toBeNull();
    vi.unstubAllGlobals();
  });
});
