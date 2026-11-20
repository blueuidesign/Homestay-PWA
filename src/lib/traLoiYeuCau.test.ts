// Test unit US51 · chữ và dữ liệu CN1-03, CN9, CN9-02, CN9-03 (YC9.2).
import type { SupabaseClient } from '@supabase/supabase-js';
import { describe, expect, it, vi } from 'vitest';
import { LoiNguoiDung } from '../chung/matKetNoi';
import { manTuThongBao } from './dichVuThongBao';
import { taoDichVuTraLoiYeuCauSupabase } from './dichVuTraLoiYeuCau';
import {
  cauDaNhan, cauDaTuChoi, cauDaVaoLich, cauLyDoChoSale, cauTuChoiPhu, chuCaiDau, chuGuiTruoc, docDongYeuCauCho, docKetQuaTraLoi,
  docYeuCauChoChu, dongChinhYeuCau, dongPhuYeuCau, dongSaleCN9, tieuDeKhoiYeuCau,
} from './traLoiYeuCau';

const CN9_RPC = {
  id: 'y1', can_id: 'c1509', ma_can: '1509', ten_toa: 'ICON40', sale_id: 'hung', ten_sale: 'Sale Hùng', sdt_sale: '0912345678',
  so_dat_phong: 12, con_ket_noi: true, ngay_nhan: '2026-10-10', ngay_tra: '2026-10-12', so_dem: 2, gia_chu_dem: [1300000, 900000],
  tong_gia_chu: 2200000, loi_nhan: 'Khách gia đình 4 người', trang_thai: 'cho', ly_do_tu_choi: null,
  gui_luc: '2026-10-06T07:20:00+00:00', han_luc: '2026-10-20T07:20:00+00:00', booking_id: null, trung_voi: [],
};

describe('YC9.2 · dữ liệu của chủ nhà', () => {
  it('YC9.2-NT2 dữ liệu CN9 chỉ có "Giá của bạn": trường giá bán, tiền chênh, mức cộng lọt vào cũng không được chép', () => {
    const y = docYeuCauChoChu({ ...CN9_RPC, tong_gia_ban: 2600000, gia_ban_dem: [1500000, 1100000], muc_cong: 200000, tien_chenh: 400000 });
    expect(y.tongGiaChu).toBe(2_200_000);
    expect(JSON.stringify(y)).not.toMatch(/\b(2600000|1500000|400000|200000)\b|gia_ban|muc_cong|tien_chenh|giaBan|mucCong|tienChenh/);
    expect(y).toMatchObject({ tenSale: 'Sale Hùng', maCan: '1509', loiNhan: 'Khách gia đình 4 người', conKetNoi: true });
  });

  it('YC9.2-NT2 dòng khối CN1-03 chỉ có giá chủ nhà', () => {
    const d = docDongYeuCauCho({ id: 'y1', can_id: 'c1509', ma_can: '1509', ten_sale: 'Sale Hùng', ngay_nhan: '2026-10-17',
      ngay_tra: '2026-10-19', tong_gia_chu: 2200000, gui_luc: '2026-10-06T07:20:00Z', trung_voi: [], tong_gia_ban: 2600000 });
    expect(JSON.stringify(d)).not.toMatch(/2600000|gia_ban/);
    expect(d.tongGiaChu).toBe(2_200_000);
  });

  it('YC9.2-NT5 HV3 kết quả có doi_trang_thai thì app biết yêu cầu đã đổi', () => {
    expect(docKetQuaTraLoi({ id: 'y1', trang_thai: 'da_huy', doi_trang_thai: true })).toMatchObject({ doiTrangThai: true, y: { trangThai: 'da_huy' } });
    expect(docKetQuaTraLoi({ ...CN9_RPC, trang_thai: 'da_chot', doi_trang_thai: false }).doiTrangThai).toBe(false);
  });
});

describe('YC9.2 · chữ trên màn', () => {
  const bay = Date.parse('2026-10-06T07:30:00Z');
  it('YC9.2 bước 1 CN1-03: tiêu đề khối, dòng chính, dòng phụ "gửi 10 phút trước", cờ trùng', () => {
    expect(tieuDeKhoiYeuCau(2)).toBe('Yêu cầu đặt phòng · 2');
    expect(dongChinhYeuCau({ tenSale: 'Sale Hùng', maCan: '1509' })).toBe('Sale Hùng đặt phòng 1509');
    expect(dongPhuYeuCau({ ngayNhan: '2026-10-17', ngayTra: '2026-10-19', guiLuc: '2026-10-06T07:20:00Z', trungVoi: [] }, bay))
      .toBe('17/10 → 19/10 · gửi 10 phút trước');
    expect(dongPhuYeuCau({ ngayNhan: '2026-10-18', ngayTra: '2026-10-19', guiLuc: '2026-10-06T07:25:00Z', trungVoi: ['Sale Hùng'] }, bay))
      .toBe('18/10 → 19/10 · trùng ngày với Sale Hùng');
    expect(chuGuiTruoc('2026-10-06T07:29:40Z', bay)).toBe('vừa xong');
    expect(chuGuiTruoc('2026-10-06T04:30:00Z', bay)).toBe('3 giờ trước');
    expect(chuGuiTruoc('2026-10-04T07:30:00Z', bay)).toBe('2 ngày trước');
  });

  it('YC9.2 bước 2 CN9: chữ đầu, số sale, số đặt phòng đã bán', () => {
    expect(chuCaiDau('Sale Hùng')).toBe('H');
    expect(dongSaleCN9({ sdtSale: '0912345678', soDatPhong: 12 })).toBe('0912 345 678 · đã bán 12 đặt phòng của bạn');
    expect(dongSaleCN9({ sdtSale: null, soDatPhong: 0 })).toBe('đã bán 0 đặt phòng của bạn');
  });

  it('YC9.2 bước 3, 5 CN9-02, CN9-03', () => {
    expect(cauDaNhan('1509')).toBe('Đã nhận đặt phòng 1509');
    expect(cauDaVaoLich('Sale Hùng')).toBe('Đặt phòng đã vào lịch. Sale Hùng được báo.');
    expect(cauDaTuChoi('Sale Hùng')).toBe('Đã từ chối yêu cầu của Sale Hùng');
    expect(cauTuChoiPhu('Sale Hùng', 'Đã có khách đặt', '2026-10-17', '2026-10-19'))
      .toBe('Sale Hùng được báo kèm lý do "Đã có khách đặt". Ngày 17/10 → 19/10 vẫn trống trong lịch.');
  });

  it('YC9.2-NT4 sale thấy lý do "Đã có khách đặt"', () => {
    expect(cauLyDoChoSale('Chị Hoa', 'Đã có khách đặt')).toBe('Lý do: Chị Hoa không nhận đặt phòng · Đã có khách đặt.');
  });

  it('YC9.2-NT11 không chọn lý do: sale thấy "Lý do: Chị Hoa không nhận đặt phòng."', () => {
    expect(cauLyDoChoSale('Chị Hoa', null)).toBe('Lý do: Chị Hoa không nhận đặt phòng.');
    expect(cauTuChoiPhu('Sale Hùng', null, '2026-10-17', '2026-10-19')).toBe('Sale Hùng được báo. Ngày 17/10 → 19/10 vẫn trống trong lịch.');
  });
});

describe('YC9.2 · mở từ thông báo, dịch vụ', () => {
  it('YC9.2-NT1 chạm thông báo "yêu cầu mới" mở đúng yêu cầu đó ở CN9', () => {
    expect(manTuThongBao({ loai: 'yeu_cau_moi', doi_tuong_loai: 'yeu_cau', doi_tuong_id: 'y7' })).toEqual({ man: 'CN9', yeuCauId: 'y7' });
    expect(manTuThongBao({ loai: 'chu_dong_y_ket_noi', doi_tuong_id: 'k1' })).toBeNull();
  });

  it('YC9.2 gọi đúng lệnh; không chọn lý do gửi null; câu lỗi của database thành LoiNguoiDung', async () => {
    const rpc = vi.fn(async (ten: string) => {
      if (ten === 'fn_chap_nhan_yeu_cau') {
        return { data: null, error: { code: 'P0001', message: 'Sale này không còn kết nối với bạn, không nhận được đặt phòng.' } };
      }
      if (ten === 'fn_yeu_cau_dang_cho') return { data: [], error: null };
      return { data: { ...CN9_RPC, trang_thai: 'bi_tu_choi', doi_trang_thai: false }, error: null };
    });
    const dv = taoDichVuTraLoiYeuCauSupabase({ rpc } as unknown as SupabaseClient);
    expect(await dv.layDangCho()).toEqual([]);
    expect((await dv.tuChoi('y1', null)).y.trangThai).toBe('bi_tu_choi');
    expect(rpc).toHaveBeenCalledWith('fn_tu_choi_yeu_cau', { p_yeu_cau_id: 'y1', p_ly_do: null });
    await expect(dv.chapNhan('y1')).rejects.toBeInstanceOf(LoiNguoiDung);
    expect(rpc).toHaveBeenCalledWith('fn_chap_nhan_yeu_cau', { p_yeu_cau_id: 'y1' });
  });
});
