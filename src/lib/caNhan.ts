// Tab Cá nhân (YC1.3, P1 chủ nhà, P4 sale): dữ liệu đầu trang và các dòng menu, dựng từ cài đặt của người gọi.
// Hàm thuần, test cạnh file. Câu chữ theo YC1.3 bước 1 đến 6 và canvas P1, P4.
import { tenDemIso, type ThuIso } from './gia';
import { vietTienGon } from './tien';
import type { Vai } from './dieuHuong';

/** YC12.4: loại thông báo có công tắc, theo vai. Khóa là cột `loai` của bảng thong_bao (thong_bao_tat lưu các khóa đã tắt). */
export const LOAI_TB_CHU = ['yeu_cau_moi', 'sale_xin_xem_lich', 'dat_phong_chua_coc'] as const;
export const LOAI_TB_SALE = ['chu_dong_y_ket_noi', 'can_da_gui_co_nguoi_dat', 'yeu_cau_da_chot', 'chu_ghi_dat_phong_cho_sale'] as const;

/** Mọi thứ tab Cá nhân đọc một lần (YC1.3 bước 1 đến 4). */
export type TongQuanCaNhan = {
  ten: string | null;
  tenHienThi: string | null;
  soDienThoai: string | null;
  email: string;
  soChuaDoc: number;
  gioNhan: string;
  gioTra: string;
  demCuoiTuan: number[];
  mucCong: number;
  thongBaoTat: string[];
};

/** Khóa từng dòng: màn cha dùng để mở đúng màn của dòng (YC1.3-NT3). */
export type KhoaDong =
  | 'thong-bao' | 'ho-so' | 'email'
  | 'cai-dat-thong-bao' | 'gio' | 'dem-cuoi-tuan'
  | 'xuat-csv'
  | 'link-xin-lich' | 'muc-cong' | 'mau-tin'
  | 'huong-dan' | 'zalo';

export type DongMenu = {
  khoa: KhoaDong;
  nhan: string;
  /** Chữ phụ bên phải (giá trị đang đặt). */
  phu?: string;
  /** Số chưa đọc ở dòng "Thông báo" (chỉ hiện khi lớn hơn 0). */
  so?: number;
  /** Dòng chỉ để xem, không chạm mở được (Email đăng nhập). */
  tinh?: true;
};
export type NhomMenu = { tieuDe: string; dong: DongMenu[] };

/** Việc ở dòng menu mà US sau mới làm: báo tạm (HV8). */
export const CAU_SE_CO = 'Sẽ có ở bản sau';

/** YC1.3 bước 1: "Chủ nhà" hay "Sale". */
export function chuVai(vai: Vai): string {
  return vai === 'chu_nha' ? 'Chủ nhà' : 'Sale';
}

/** YC1.3 bước 1: chữ cái đầu của tên khi chưa có ảnh. */
export function chuCaiDau(ten: string | null | undefined): string {
  const t = (ten ?? '').trim();
  if (!t) return '?';
  const tu = t.split(/\s+/);
  return (Array.from(tu[tu.length - 1] ?? '')[0] ?? '?').toUpperCase();
}

/** YC1.3 bước 1: tên hiển thị nếu có, không thì họ tên. */
export function tenHienCaNhan(tq: Pick<TongQuanCaNhan, 'ten' | 'tenHienThi'>): string {
  return (tq.tenHienThi ?? '').trim() || (tq.ten ?? '').trim() || 'Bạn';
}

/** YC1.3 bước 3: "14:00 · 12:00". */
export function chuGioMenu(gioNhan: string, gioTra: string): string {
  return `${gioNhan.slice(0, 5)} · ${gioTra.slice(0, 5)}`;
}

/** YC1.3 bước 3: "T6, T7". */
export function chuDemCuoiTuan(dem: readonly number[]): string {
  return [...dem].sort((a, b) => a - b).map((d) => tenDemIso(d as ThuIso)).join(', ');
}

/** YC1.3-NT2: số loại thông báo đang bật của vai (công tắc không nằm trong thong_bao_tat). */
export function soLoaiDangBat(vai: Vai, thongBaoTat: readonly string[]): number {
  const loai: readonly string[] = vai === 'chu_nha' ? LOAI_TB_CHU : LOAI_TB_SALE;
  return loai.filter((l) => !thongBaoTat.includes(l)).length;
}

/** YC1.3 bước 3, 4: "Mức cộng giá mặc định · +400k"; chưa cộng thì "Không cộng". */
export function chuMucCongMenu(muc: number): string {
  return muc > 0 ? `+${vietTienGon(muc)}` : 'Không cộng';
}

/**
 * YC1.3 bước 2 đến 5, YC1.3-NT1: chủ nhà thấy TÀI KHOẢN, CÀI ĐẶT, DỮ LIỆU, HỖ TRỢ; sale thấy TÀI KHOẢN, BÁN PHÒNG, CÀI ĐẶT, HỖ TRỢ.
 * "Đội nhóm" ở P4: bản sau, không hiện (YC1.3).
 */
export function nhomMenu(vai: Vai, tq: TongQuanCaNhan): NhomMenu[] {
  const taiKhoan: NhomMenu = {
    tieuDe: 'Tài khoản',
    dong: [
      { khoa: 'thong-bao', nhan: 'Thông báo', so: tq.soChuaDoc },
      { khoa: 'ho-so', nhan: 'Thông tin cá nhân' },
      { khoa: 'email', nhan: 'Email đăng nhập', phu: tq.email, tinh: true },
    ],
  };
  const loai: DongMenu = { khoa: 'cai-dat-thong-bao', nhan: 'Cài đặt thông báo' };
  const hoTro: NhomMenu = {
    tieuDe: 'Hỗ trợ',
    dong: [{ khoa: 'huong-dan', nhan: 'Hướng dẫn sử dụng' }, { khoa: 'zalo', nhan: 'Nhắn Zalo cho Home247' }],
  };
  if (vai === 'chu_nha') {
    return [
      taiKhoan,
      {
        tieuDe: 'Cài đặt',
        dong: [
          { ...loai, phu: `${soLoaiDangBat(vai, tq.thongBaoTat)} loại đang bật` },
          { khoa: 'gio', nhan: 'Giờ nhận, trả phòng mặc định', phu: chuGioMenu(tq.gioNhan, tq.gioTra) },
          { khoa: 'dem-cuoi-tuan', nhan: 'Ngày tính giá cuối tuần', phu: chuDemCuoiTuan(tq.demCuoiTuan) },
        ],
      },
      { tieuDe: 'Dữ liệu', dong: [{ khoa: 'xuat-csv', nhan: 'Xuất file Excel (CSV)' }] },
      hoTro,
    ];
  }
  return [
    taiKhoan,
    {
      tieuDe: 'Bán phòng',
      dong: [
        { khoa: 'link-xin-lich', nhan: 'Link xin xem lịch', phu: 'Gửi chủ nhà' },
        { khoa: 'muc-cong', nhan: 'Mức cộng giá mặc định', phu: chuMucCongMenu(tq.mucCong) },
        { khoa: 'mau-tin', nhan: 'Mẫu tin gửi khách' },
      ],
    },
    { tieuDe: 'Cài đặt', dong: [{ ...loai, phu: `${soLoaiDangBat(vai, tq.thongBaoTat)} loại đang bật` }] },
    hoTro,
  ];
}
