// YC12 (US61, US62): dòng thông báo và chữ hiện ra ở popup, màn Thông báo. Nội dung do database chép lúc ghi theo quyền người nhận (PQ19),
// nên ở đây chỉ ghép chữ, không tự tính thêm dữ liệu.
import { vietTien } from './tien';

export type ThongBao = {
  id: string;
  loai: string;
  noiDung: Record<string, unknown>;
  doiTuongLoai: string | null;
  doiTuongId: string | null;
  taoLuc: string;
  docLuc: string | null;
};

/** Dòng trả từ database (cột snake_case). */
export type DongThongBaoDb = {
  id: string; loai: string; noi_dung: Record<string, unknown> | null;
  doi_tuong_loai: string | null; doi_tuong_id: string | null; tao_luc: string; doc_luc: string | null;
};

/** YC12.2: một trang danh sách thông báo. */
export type TrangThongBao = { chuaDoc: number; conNua: boolean; dong: ThongBao[] };

export function docDongThongBao(d: DongThongBaoDb): ThongBao {
  return {
    id: d.id, loai: d.loai, noiDung: d.noi_dung ?? {}, doiTuongLoai: d.doi_tuong_loai, doiTuongId: d.doi_tuong_id,
    taoLuc: d.tao_luc, docLuc: d.doc_luc,
  };
}

const chu = (v: unknown): string => (typeof v === 'string' ? v : v == null ? '' : String(v));
const so = (v: unknown): number | null => (typeof v === 'number' ? v : typeof v === 'string' && v !== '' && !Number.isNaN(Number(v)) ? Number(v) : null);

/** "2026-10-10" thành "10/10". */
export function ngayNgan(iso: unknown): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(chu(iso));
  return m ? `${m[3]}/${m[2]}` : '';
}

function canText(nd: Record<string, unknown>, hau = ''): string {
  const toa = chu(nd['ten_toa' + hau]);
  const ma = chu(nd['ma_can' + hau]);
  return [toa, ma].filter(Boolean).join(' ');
}
const khoangNgay = (nd: Record<string, unknown>, hau = '') => `${ngayNgan(nd['ngay_nhan' + hau])} → ${ngayNgan(nd['ngay_tra' + hau])}`;

export type ChuThongBao = { chinh: string; phu: string };

/**
 * YC12 "Các loại thông báo", cột "Dòng chính · dòng phụ". Chữ của loại chưa có trên hình là giả định GD27.
 * Loại lạ (bản sau thêm) vẫn hiện được bằng chữ chung, không làm hỏng danh sách.
 */
export function chuCuaThongBao(tb: Pick<ThongBao, 'loai' | 'noiDung'>): ChuThongBao {
  const nd = tb.noiDung;
  const chuNha = chu(nd['ten_chu']) || 'Chủ nhà';
  switch (tb.loai) {
    case 'chu_dong_y_ket_noi':
      return { chinh: `${chuNha} đồng ý cho bạn xem lịch`, phu: 'Căn mới đã vào Nguồn phòng' };
    case 'chu_ngung_cho_xem':
      return { chinh: `${chuNha} đã ngừng cho bạn xem lịch`, phu: 'Các căn của chủ nhà không còn trong Nguồn phòng. Đặt phòng cũ của bạn với chủ nhà vẫn xem được trong Thống kê.' };
    case 'yeu_cau_da_chot': {
      const gia = so(nd['tong_gia_chu']);
      return { chinh: `${chuNha} đã chấp nhận đặt phòng`, phu: [`${canText(nd)} · ${khoangNgay(nd)}`, gia == null ? '' : `giá chủ nhà ${vietTien(gia)}`].filter(Boolean).join(' · ') };
    }
    case 'yeu_cau_bi_tu_choi':
      return { chinh: 'Yêu cầu đặt phòng bị từ chối', phu: `${canText(nd)} · ${khoangNgay(nd)}` };
    case 'yeu_cau_het_han':
      return { chinh: 'Yêu cầu đặt phòng đã hết hạn', phu: `${canText(nd)} · ${khoangNgay(nd)}` };
    case 'chu_ghi_dat_phong_cho_sale':
      return { chinh: `${chuNha} ghi đặt phòng cho bạn`, phu: `${canText(nd)} · ${khoangNgay(nd)}` };
    case 'chu_sua_dat_phong': {
      const cu = so(nd['tien_phong_cu']);
      const moi = so(nd['tien_phong']);
      const doiTien = cu != null && moi != null && cu !== moi ? `. Giá chủ nhà ${vietTien(cu)} đổi thành ${vietTien(moi)}` : '';
      const canCu = canText(nd, '_cu') || canText(nd);
      const doiCan = canCu !== canText(nd) ? `${canCu} → ${canText(nd)} · ` : `${canText(nd)} · `;
      return { chinh: `${chuNha} đã sửa đặt phòng của bạn`, phu: `${doiCan}${khoangNgay(nd, '_cu')} đổi thành ${khoangNgay(nd)}${doiTien}` };
    }
    case 'can_da_gui_co_nguoi_dat':
      return { chinh: `${canText(nd)} · ${khoangNgay(nd)} vừa có người đặt`, phu: 'Báo khách chọn căn khác' };
    case 'chu_them_can':
      return { chinh: `${chuNha} vừa thêm căn ${chu(nd['ma_can'])}`, phu: 'Căn đã vào Nguồn phòng của bạn' };
    case 'chu_xoa_tai_khoan':
      return { chinh: `${chuNha} đã xóa tài khoản`, phu: 'Các căn của chủ nhà không còn trong lịch. Đặt phòng đã chốt vẫn giữ.' };
    case 'yeu_cau_moi': {
      const gia = so(nd['tong_gia_chu']);
      const dem = so(nd['so_dem']);
      return {
        chinh: `${chu(nd['ten_sale']) || 'Sale'} đặt phòng ${chu(nd['ma_can'])}`.trim(),
        phu: `${khoangNgay(nd)}${dem == null ? '' : ` (${dem} đêm)`}${gia == null ? '' : ` · giá của bạn ${vietTien(gia)}`}`,
      };
    }
    case 'dat_phong_chua_coc':
      return { chinh: 'Đặt phòng chưa cọc', phu: `${chu(nd['ten_sale']) || 'Khách lẻ'} · ${khoangNgay(nd)} · nhận phòng sau ${so(nd['con_ngay']) ?? 3} ngày` };
    case 'xin_huy':
      return { chinh: `${chu(nd['ten_nguoi_xin']) || 'Người đặt'} xin hủy đặt phòng`, phu: `${canText(nd)} · ${khoangNgay(nd)}` };
    case 'tra_loi_huy':
      return { chinh: `${chu(nd['ten_nguoi_tra_loi']) || 'Bên kia'} ${nd['dong_y'] === true ? 'đã đồng ý hủy' : 'không đồng ý hủy'}`, phu: `${canText(nd)} · ${khoangNgay(nd)}` };
    case 'loi_app_hang_ngay': // YC15.3-NT1: chỉ quản trị viên nhận
      return { chinh: `App có ${so(nd['so_loi']) ?? 0} lỗi trong 24 giờ qua`, phu: `${so(nd['so_nguoi']) ?? 0} người gặp · hay gặp: ${chu(nd['hay_gap'])}` };
    default:
      return { chinh: 'Thông báo mới', phu: '' };
  }
}

/** Chấm màu đầu dòng: xanh cho tin tốt, đỏ cho từ chối, hết hạn, xin hủy, xám cho còn lại (canvas S1-06). */
export function mauChamThongBao(loai: string): 'xanh' | 'do' | 'cam' | 'xam' {
  if (['chu_dong_y_ket_noi', 'yeu_cau_da_chot', 'chu_ghi_dat_phong_cho_sale', 'chu_them_can'].includes(loai)) return 'xanh';
  if (['yeu_cau_bi_tu_choi', 'yeu_cau_het_han', 'xin_huy'].includes(loai)) return 'do';
  if (['dat_phong_chua_coc', 'chu_sua_dat_phong', 'can_da_gui_co_nguoi_dat', 'yeu_cau_moi'].includes(loai)) return 'cam';
  return 'xam';
}

const MUI_VN = 'Asia/Ho_Chi_Minh';
function phanVN(d: Date): { ngay: string; gio: string } {
  const p = new Intl.DateTimeFormat('en-CA', { timeZone: MUI_VN, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
    .formatToParts(d).reduce<Record<string, string>>((a, x) => { a[x.type] = x.value; return a; }, {});
  return { ngay: `${p.year}-${p.month}-${p.day}`, gio: `${p.hour}:${p.minute}` };
}

/** YC12.2 bước 1: "10:15" trong ngày, "Hôm qua", "04/10" (giờ Việt Nam, QT5.1). */
export function gioThongBao(taoLuc: string, bayGio: Date = new Date()): string {
  const t = phanVN(new Date(taoLuc));
  const nay = phanVN(bayGio);
  if (t.ngay === nay.ngay) return t.gio;
  const hq = phanVN(new Date(bayGio.getTime() - 24 * 3600 * 1000));
  if (t.ngay === hq.ngay) return 'Hôm qua';
  return ngayNgan(t.ngay);
}

/** YC12.2 bước 1: nhóm "Hôm nay" và "Trước đó" (giờ Việt Nam). */
export function laHomNay(taoLuc: string, bayGio: Date = new Date()): boolean {
  return phanVN(new Date(taoLuc)).ngay === phanVN(bayGio).ngay;
}

export type Vai = 'chu_nha' | 'sale';

/**
 * Màn mở khi chạm một thông báo (YC12 "Các loại thông báo", cột "Chạm mở"). null: loại chưa có màn, chỉ đánh dấu đã đọc.
 * Đối tượng không còn xem được thì màn đích tự báo theo HV5 (database không trả dữ liệu, chỉ lý do).
 */
export type DiemMo =
  | { kieu: 'cn9'; yeuCauId: string }
  | { kieu: 'dat-phong-chu'; id: string }
  | { kieu: 's3-ket-qua'; yeuCauId: string }
  | { kieu: 's3-dat-phong'; id: string }
  | { kieu: 's3-can'; canId: string; tenTam: string; tu: string | null; den: string | null }
  | { kieu: 's7-03' }
  | { kieu: 'lich' }
  | { kieu: 'can' };

export function diemMoTuThongBao(tb: Pick<ThongBao, 'loai' | 'noiDung' | 'doiTuongId'>, vai: Vai): DiemMo | null {
  const id = tb.doiTuongId;
  const nd = tb.noiDung;
  switch (tb.loai) {
    case 'yeu_cau_moi': return id ? { kieu: 'cn9', yeuCauId: id } : null;
    case 'yeu_cau_da_chot': case 'yeu_cau_bi_tu_choi': case 'yeu_cau_het_han': return id ? { kieu: 's3-ket-qua', yeuCauId: id } : null;
    case 'chu_ghi_dat_phong_cho_sale': case 'chu_sua_dat_phong': return id ? { kieu: 's3-dat-phong', id } : null;
    case 'dat_phong_chua_coc': return id ? { kieu: 'dat-phong-chu', id } : null;
    case 'xin_huy': case 'tra_loi_huy':
      if (!id) return null;
      return vai === 'chu_nha' ? { kieu: 'dat-phong-chu', id } : { kieu: 's3-dat-phong', id };
    case 'can_da_gui_co_nguoi_dat': case 'chu_them_can': {
      if (!id) return null;
      const tu = chu(nd['ngay_nhan']);
      const den = chu(nd['ngay_tra']);
      return { kieu: 's3-can', canId: id, tenTam: canText(nd), tu: tu || null, den: den || null };
    }
    case 'chu_ngung_cho_xem': return { kieu: 's7-03' };
    case 'chu_dong_y_ket_noi': return { kieu: 'lich' };
    case 'chu_xoa_tai_khoan': return { kieu: 'can' };
    default: return null;
  }
}
