// Yêu cầu đặt phòng (US15, api/yeu-cau.md). Kiểu dữ liệu theo "Đối tượng yeu_cau": trường vai không thấy thì không có trong JSON
// (PQ Luật chung 2). Chủ nhà không có gia_ban, tien_chenh; sale không có sale, trung_yeu_cau.
export type TrangThaiYeuCau = "cho_chu" | "da_chot" | "bi_tu_choi" | "het_han" | "da_huy";
export type LyDoTuChoi = "da_co_khach" | "dang_sua_phong" | "ly_do_khac";
// chu_nhan_dat_khac chỉ server đặt (chủ nhận yêu cầu khác hoặc tự ghi đặt phòng trùng đêm)
export type LyDoYeuCau = LyDoTuChoi | "chu_nhan_dat_khac";
export const CAC_LY_DO_TU_CHOI: LyDoTuChoi[] = ["da_co_khach", "dang_sua_phong", "ly_do_khac"];

export type BenKiaYeuCau = { id: string; ten_hien_thi: string | null; so_dien_thoai: string | null; da_xoa_tai_khoan: boolean };

export type YeuCauChung = {
  id: string;
  trang_thai: TrangThaiYeuCau;
  can: { id: string; ma_can: string; ten_toa_nha: string | null };
  ngay_nhan: string;
  ngay_tra: string;
  so_dem: number;
  gia_chu: number;
  loi_nhan: string | null;
  ly_do: LyDoYeuCau | null;
  gui_luc: string;
  het_han_luc: string;
  tra_loi_luc: string | null;
  booking_id: string | null;
};

// Phía sale: có giá bán và chủ nhà. zalo_id của chủ nhà để mở khung chat (zalo-hanh-vi 5.2); api/yeu-cau.md chưa có trường này
export type YeuCauSale = YeuCauChung & {
  gia_ban: number;
  tien_chenh?: number;
  chu_nha: BenKiaYeuCau & { zalo_id?: string };
};

export type YeuCauTrung = { id: string; ten_sale: string | null; ngay_nhan: string; ngay_tra: string };

// Phía chủ nhà: chỉ một giá (gia_chu), có sale và cờ trùng đêm
export type YeuCauChu = YeuCauChung & {
  sale: BenKiaYeuCau;
  trung_yeu_cau?: YeuCauTrung[];
};

export type KetQuaChapNhan = {
  yeu_cau: YeuCauChu;
  booking: {
    id: string;
    can_id: string;
    ngay_nhan: string;
    ngay_tra: string;
    so_dem: number;
    tien_phong: number;
    trang_thai_tien: string;
    gio_nhan: string;
    gio_tra: string;
  };
  yeu_cau_bi_tu_choi: YeuCauTrung[];
};

export type ThanYeuCau = { can_id: string; ngay_nhan: string; ngay_tra: string; loi_nhan?: string | null };
export const TOI_DA_LOI_NHAN = 500;
export const HAN_TRA_LOI_NGAY = 14;

// State mở màn kết quả của sale (S3-03, S3-04, S3-04-01, S3-05, S3-08, S3-09) và CN9
export type TrangThaiYeuCauMo = { id: string };
