// Kiểu dữ liệu theo API trong docs/architecture/server.md và data-model.md (EN11).
// Có server thì giữ các kiểu này, chỉ thay phần gọi trong services/api.ts.

export type VaiChon = "chu_nha" | "sale";

export type TaiKhoan = {
  id: string;
  vai_chon: VaiChon;
  // Server thật không trả trường này trong hồ sơ (EN54): POST /phien không có, POST /tai-khoan chỉ khi vừa tạo
  dong_y_dieu_khoan_luc?: string;
};

// 0 là Studio, 4 là 4PN+ (data-model, bảng can)
export type SoPhongNgu = 0 | 1 | 2 | 3 | 4;

// Một dòng của GET /can (server.md 2.4). Phần giá, tình trạng hôm nay làm ở US4, US2.
// Ảnh căn trong GET /can (api/can-anh.md, kiểu `anh`). Server giả trả đường dẫn tạm của máy thay cho đường dẫn có chữ ký.
export type Anh = { id: string; thu_tu: number; duong_dan_xem: string; het_han_luc: string };
// Tệp ảnh người dùng chọn qua Zalo (chooseImage). Server thật nhận multipart; server giả chỉ cần thông tin tệp.
export type TepAnh = { ten: string; duong_dan: string; dung_luong: number };
// Đầu ra POST /anh (api/can-anh.md)
export type KetQuaPostAnh = { anh_id: string; duong_dan_xem: string; het_han_luc: string; xoa_neu_chua_gan_luc: string };

export type Can = {
  id: string;
  ma_can: string;
  so_phong_ngu: SoPhongNgu;
  so_giuong: number | null;
  loai_view: string | null;
  toa_nha: string | null;
  so_anh: number;
  // US1: ảnh thu_tu 1, null khi chưa có ảnh. Căn mẫu của DLM chỉ có so_anh, không có ảnh thật.
  anh_dai_dien?: Anh | null;
  moi_them: boolean;
  tao_luc: string;
  // US4 (api/can-anh.md GET /can): khoảng giá tuần này, null khi 7 đêm tới chưa có giá nào; cờ "Chưa đặt giá"
  gia_tuan_nay?: { thap_nhat: number; cao_nhat: number } | null;
  chua_dat_gia?: boolean;
  // US16 (GET /can của sale, api/can-anh.md): loại căn, tên chủ căn tự nhập, tình trạng hôm nay. Chỉ có ở getCanSale.
  loai?: "co_lich" | "tu_nhap";
  ten_chu_can?: string;
  tinh_trang_hom_nay?: TinhTrangHomNay | null;
};
// Tình trạng hôm nay của căn có lịch (api/can-anh.md GET /can). Căn tự nhập luôn null, không bao giờ `trong` (US16-NT5).
export type TinhTrangHomNay = { loai: "co_khach" | "khach_den" | "trong"; ngay_tra: string | null };

// US1 · Tòa nhà dùng chung (api/can-anh.md GET /toa-nha, POST /toa-nha). da_dung: căn chưa ẩn của người gọi đang gắn tòa này.
export type ToaNha = { id: string; ten: string; khu_vuc: string | null; da_dung: boolean };
// Chi tiết một căn của mình (api/can-anh.md GET /can/:id, PATCH /can/:id), phần căn có lịch.
// loai_view là mã `bien`, `thanh_pho`, `nui` (server thật). Căn mẫu DLM còn ghi "view biển", màn đọc qua components/can-hien-thi.
export type CanChiTiet = {
  id: string;
  ma_can: string;
  so_phong_ngu: SoPhongNgu;
  so_giuong: number | null;
  loai_view: string | null;
  toa_nha: { id: string; ten: string; khu_vuc: string | null } | null;
  mo_ta_gui_khach: string | null;
  anh: Anh[];
  tao_luc: string;
  // US16 (GET /can/:id, căn tự nhập): chỉ sale tạo đọc được (PQ14.SALE). Căn có lịch không có các trường này.
  loai?: "tu_nhap";
  ten_chu_can?: string;
  sdt_chu_can?: string | null;
  gia_chu_thuong?: number | null;
  gia_chu_cuoi_tuan?: number | null;
  dat_phong_da_ghi?: DatPhongDaGhi[];
};
// Một đặt phòng sale đã ghi cho căn tự nhập (mục "Chi tiết căn tự nhập" (US16) bước 2). tien_chenh = gia_ban trừ tien_phong (QT3).
export type DatPhongDaGhi = { id: string; ngay_nhan: string; ngay_tra: string; tien_phong: number; gia_ban: number; tien_chenh: number };
// Thân PATCH /can/:id: chỉ gửi trường muốn đổi; so_giuong null là xóa trống (US1-NT33); anh_ids là danh sách đầy đủ theo thứ tự
export type ThanSuaCan = {
  ma_can?: string;
  so_phong_ngu?: SoPhongNgu;
  so_giuong?: number | null;
  loai_view?: string | null;
  toa_nha_id?: string | null;
  mo_ta_gui_khach?: string | null;
  anh_ids?: string[];
  // US16: chỉ căn tự nhập. sdt_chu_can null là xóa số (QD11, US16-NT27)
  ten_chu_can?: string;
  sdt_chu_can?: string | null;
  gia_chu_thuong?: number | null;
  gia_chu_cuoi_tuan?: number | null;
};
// Thân POST /can của sale (loai tu_nhap, mục "Thêm căn tự nhập" (US16) bước 7) hoặc của chủ nhà, sale với căn của mình
export type ThanPostCan = {
  loai?: "co_lich" | "tu_nhap";
  ma_can: string;
  so_phong_ngu: SoPhongNgu | null;
  anh_ids?: string[];
  so_giuong?: number | null;
  loai_view?: string | null;
  toa_nha_id?: string | null;
  mo_ta_gui_khach?: string | null;
  ten_chu_can?: string;
  sdt_chu_can?: string;
  gia_chu_thuong?: number | null;
  gia_chu_cuoi_tuan?: number | null;
};

// Lỗi trả JSON { loi, ly_do, o } (server.md 1.5)
export type MaLoi =
  | "CHUA_DANG_NHAP"
  | "KHONG_TIM_THAY"
  | "DU_LIEU_SAI"
  | "MA_CAN_TRUNG"
  | "TRUNG_LICH"
  | "TOKEN_SDT_HET_HAN"
  | "ZALO_TU_CHOI"
  | "KHONG_CON_QUYEN"
  | "TRANG_THAI_DA_DOI"
  | "LINK_KHONG_DUNG_DUOC"
  | "QUA_NHIEU"
  | "DIP_CHONG_NGAY"
  | "KHONG_DUOC_PHEP"
  | "CAN_CON_DAT_PHONG"
  | "LOI_SERVER";

export class LoiApi extends Error {
  // dem_trung: các đêm trùng khi loi là TRUNG_LICH (api/lich-dat-phong.md POST /booking)
  // dai_chong: dải đã có khi loi là DIP_CHONG_NGAY (api/gia.md POST /can/:id/gia-dip)
  constructor(public loi: MaLoi, public ly_do = "", public o?: string, public dem_trung?: string[], public dai_chong?: DaiChong) {
    super(loi);
  }
}

// Gọi server không được: mất mạng, hết thời gian chờ (HV2). Khác LoiApi là server đã trả lời.
export class LoiMang extends Error {
  constructor() {
    super("MAT_MANG");
  }
}

// GET /lich/thang (api/lich-dat-phong.md): căn theo thứ tự tạo, ngày có ít nhất một căn có khách
export type CanTrenLich = { can_id: string; ma_can: string };
export type LichThang = {
  thang: string;
  can: CanTrenLich[];
  ngay: { ngay: string; can_ids: string[] }[];
  co_dat_phong_nao: boolean;
};

// Người bán phía chủ nhà thấy (nguoi_dat của GET /lich/ngay, GET /booking/:id)
export type NguoiDat = {
  loai: "sale" | "khach_le";
  sale_id: string | null;
  ten: string | null;
  so_dien_thoai?: string;
  da_xoa_tai_khoan: boolean;
};

export type TrangThaiTien = "chua_coc" | "da_coc_con_thu" | "da_thanh_toan";

// GET /lich/ngay: mỗi căn một khối (api/lich-dat-phong.md, US2-NT8)
export type DatPhongTrongNgay = {
  id: string;
  nguoi_dat: NguoiDat;
  ngay_nhan: string;
  ngay_tra: string;
  so_dem: number;
  tien_phong: number;
  trang_thai_tien: TrangThaiTien | null;
  tien_coc: number | null;
  ghi_chu: string | null;
  trang_thai: "hieu_luc" | "cho_huy";
};
export type LichNgay = {
  ngay: string;
  can: (CanTrenLich & { trong: boolean; dat_phong: DatPhongTrongNgay | null })[];
};

// GET /lich/tom-tat (api/lich-dat-phong.md, mục "Tóm tắt tháng" (US2)): doanh thu theo đêm của tháng (QD14, QT2.2), số đêm có khách
export type TomTatThang = {
  thang: string;
  doanh_thu: number;
  doanh_thu_thang_truoc: number;
  so_dem_co_khach: number;
  so_can: number;
};

// GET /thong-ke/chu (api/thong-bao-thong-ke-xuat.md, mục "Thống kê tháng của chủ nhà" (US18) đến mục "Doanh thu theo người bán" (US18), CN8): số liệu một tháng của chủ nhà. Giá chủ nhà, không giá bán
// và tiền chênh (PQ11.CHU, PQ15.CHU). Server trả số gốc; phần trăm, công suất, số rút gọn tính phía app (services/thong-ke.ts).
// Khối `chua_thu` (mục "Chưa thu tiền" (US18)) chưa có: còn [MỞ: mục "Chưa thu tiền" (US18) bước 1, DC53 US18-Q1], app không đọc và không vẽ.
export type ThongKeTheoCan = { can_id: string; ma_can: string; ten_toa_nha: string | null; doanh_thu: number };
export type ThongKeTheoNguoiBan = { sale_id: string | null; ten: string; la_khach_le: boolean; da_xoa_tai_khoan: boolean; doanh_thu: number };
export type ThongKeChu = {
  thang: string;
  doanh_thu: number;
  doanh_thu_thang_truoc: number;
  theo_can: ThongKeTheoCan[];
  dem_co_khach: number;
  dem_co_khach_thang_truoc: number;
  so_dem_trong_thang: number;
  so_can_cong_suat: number;
  theo_nguoi_ban: ThongKeTheoNguoiBan[];
  chuoi_thang: { thang: string; doanh_thu: number }[];
};

// GET /booking/sap-toi (mục "Booking sắp tới" (US2)): ngày trả sau hôm nay, xếp theo ngày nhận. Không có giá bán, không khách của sale (PQ9, PQ11).
export type DatPhongSapToi = {
  id: string;
  can_id: string;
  ma_can: string;
  nguoi_dat: NguoiDat;
  ngay_nhan: string;
  ngay_tra: string;
  so_dem: number;
  tien_phong: number;
  trang_thai_tien: TrangThaiTien;
  tien_coc: number | null;
  trang_thai: "hieu_luc" | "cho_huy";
};
export type SapToi = { muc: DatPhongSapToi[]; truoc_tiep: string | null };

// GET /lich/tuan (mục "Lịch tuần khi có nhiều căn" (US2)): bảng căn x 7 ngày từ thứ hai
export type OLichTuan = { ngay: string; booking_id: string | null; gia_dem: number | null };
export type CanLichTuan = {
  can_id: string;
  ma_can: string;
  so_phong_ngu: SoPhongNgu;
  toa_nha: { id: string; ten: string } | null;
  o: OLichTuan[];
};
export type DatPhongLichTuan = {
  id: string;
  can_id: string;
  ngay_nhan: string;
  ngay_tra: string;
  nguoi_dat: NguoiDat;
  trang_thai_tien: TrangThaiTien;
};
export type LichTuan = {
  tu: string;
  den: string;
  can: CanLichTuan[];
  dat_phong: DatPhongLichTuan[];
  tom_tat: { dem_co_khach: number; dat_phong_chua_coc: number; dem_trong: number };
};

// Giá chủ một đêm, null là "Chưa đặt" (server.md 1.8)
export type GiaDem = { ngay: string; gia_chu: number | null };

// GET /booking/kiem-trung: báo sớm trùng lịch, giá điền sẵn
export type KiemTrung = {
  khong_trung: boolean;
  dem_trung: string[];
  so_dem: number;
  dem: GiaDem[];
  tong_gia_chu: number | null;
  // Chỉ căn tự nhập của sale (mục "Ghi booking đã chốt cho căn tự nhập" (US16) bước 4): tong_gia_chu cộng mức cộng. Không có trong JSON của chủ nhà (PQ11.CHU).
  tong_gia_ban?: number | null;
};

// POST /booking: chủ nhà ghi khách lẻ (US3) hoặc ghi cho một sale đã kết nối bằng sale_id (US5, US5-NT13).
// Có sale_id thì ten_khach phải null: server.md 2.6 ghi sale_id hoặc ten_khach_le, [MỞ: US3-NT27]
export type ThanDatPhong = {
  can_id: string;
  sale_id?: string | null;
  ngay_nhan: string;
  ngay_tra: string;
  ten_khach: string | null;
  tien_phong: number;
  // Căn tự nhập (mục "Ghi booking đã chốt cho căn tự nhập" (US16)): không có trạng thái tiền, tiền cọc
  trang_thai_tien?: TrangThaiTien | null;
  tien_coc?: number | null;
  so_khach: number | null;
  gio_nhan: string | null;
  gio_tra: string | null;
  ghi_chu: string | null;
  // Chỉ căn tự nhập (mục "Ghi booking đã chốt cho căn tự nhập" (US16)): tiền thu khách. tien_phong là tiền trả chủ.
  gia_ban?: number;
};

// Dạng CHU của GET /booking/:id (api/lich-dat-phong.md), đầu ra của POST /booking, PATCH, thu-du, hoan-tac-thu-du.
// Không có gia_ban, tien_chenh, khách của sale (PQ11.CHU, PQ9.CHU). tien_coc chỉ có khi da_coc_con_thu.
export type KhachBooking = { ten_khach: string | null; sdt_khach: string | null };
export type DatPhong = {
  id: string;
  can_id: string;
  ma_can: string;
  trang_thai: "hieu_luc" | "cho_huy" | "da_huy";
  ngay_nhan: string;
  ngay_tra: string;
  so_dem: number;
  nguoi_dat: NguoiDat;
  tien_phong: number;
  trang_thai_tien: TrangThaiTien;
  tien_coc: number | null;
  tien_con_lai: number;
  co_the_hoan_tac_thu_du: boolean;
  dem: { ngay: string; gia_chu: number }[];
  khach: KhachBooking | null;
  so_khach: number | null;
  gio_nhan: string;
  gio_tra: string;
  ghi_chu: string | null;
  co_the_sua: boolean;
  co_the_xoa: boolean;
  tao_luc: string;
  cap_nhat_luc: string;
  // Chỉ đặt phòng sale tự ghi cho căn tự nhập (tien_phong là tiền trả chủ)
  gia_ban?: number;
};

// Thân PATCH /booking/:id: chỉ trường gửi lên mới đổi; cap_nhat_luc là giá trị app đã đọc (TRANG_THAI_DA_DOI nếu khác).
// Không có gia_ban: gửi lên thì DU_LIEU_SAI (PQ11.CHU).
export type ThanSuaDatPhong = {
  cap_nhat_luc: string;
  can_id?: string;
  sale_id?: string | null;
  ngay_nhan?: string;
  ngay_tra?: string;
  ten_khach?: string | null;
  tien_phong?: number;
  trang_thai_tien?: TrangThaiTien;
  tien_coc?: number | null;
  so_khach?: number | null;
  gio_nhan?: string | null;
  gio_tra?: string | null;
  ghi_chu?: string | null;
};

// Dạng SALE của GET /booking/:id (S3-10): sale của đặt phòng. Không tien_coc, trang_thai_tien, dem, nguoi_dat, ghi_chu, so_khach.
// toa_nha, so_phong_ngu là trường thêm của server giả cho thẻ căn "ICON40 1509 · 2PN" (api chỉ ghi ma_can) [chờ Tùng: api].
export type DatPhongSale = {
  id: string;
  can_id: string | null;
  ma_can: string;
  toa_nha: string | null;
  so_phong_ngu: SoPhongNgu | null;
  trang_thai: "hieu_luc" | "cho_huy" | "da_huy";
  ngay_nhan: string;
  ngay_tra: string;
  so_dem: number;
  chu_nha: { ten: string | null; so_dien_thoai?: string; da_xoa_tai_khoan: boolean };
  tien_phong: number;
  gia_ban: number;
  tien_chenh: number;
  khach: KhachBooking | null;
  gio_nhan: string;
  gio_tra: string;
  tao_luc: string;
  cap_nhat_luc: string;
};

// Thông báo chu_sua_booking của sale (du_lieu theo src/server/domain/booking/index.js). Tạm đọc theo đặt phòng cho tới khi US17
// làm GET /thong-bao: không tên khách, không ghi chú, không cọc, không giá bán (PQ19).
export type ThongBaoChuSua = {
  id: string;
  booking_id: string;
  tao_luc: string;
  da_doc: boolean;
  du_lieu: {
    ten_chu_nha: string | null;
    can: { ma_can: string; ten_toa_nha: string | null };
    can_cu: { ma_can: string; ten_toa_nha: string | null } | null;
    ngay_nhan_cu: string;
    ngay_tra_cu: string;
    ngay_nhan: string;
    ngay_tra: string;
    tien_phong_cu: number;
    tien_phong: number;
  };
};

// Sale đã kết nối cho hàng chip "Khách / Sale" (GET /ket-noi, phần app dùng)
// sale_id là id dòng ket_noi, đúng là id mà POST /booking nhận ở sale_id (api/lich-dat-phong.md)
export type SaleKetNoi = { sale_id: string; ten: string };

// ---- Giá (US4, api/gia.md) ----
// Một tháng của GET /can/:id/gia. null là "Chưa đặt" (US4-NT5).
export type GiaThangCuaCan = {
  thang: string;
  gia_ngay_thuong: number | null;
  gia_cuoi_tuan: number | null;
  gia_thap_nhat: number | null;
  gia_cao_nhat: number | null;
};
export type DaiDip = {
  id: string;
  ten: string;
  tu_ngay: string;
  den_ngay: string;
  la_ngay_le: boolean;
  gia_moi_dem: number;
  ngay_le_id: string | null;
};
export type LoaiDem = "thuong" | "cuoi_tuan" | "dip";
export type DemGia = { ngay: string; gia: number | null; loai_dem: LoaiDem; gia_dip_id: string | null; co_khach: boolean };
// Đầu ra GET /can/:id/gia?nam=&thang=. dem là null khi không gửi thang.
export type BangGia = {
  can_id: string;
  ma_can: string;
  nam: number;
  dem_cuoi_tuan: number[];
  thang: GiaThangCuaCan[];
  dai_dip: DaiDip[];
  dem: DemGia[] | null;
};
// Đầu ra PUT /can/:id/gia-thang
export type KetQuaGiaThang = {
  can_id: string;
  thang: { thang: string; gia_ngay_thuong: number; gia_cuoi_tuan: number }[];
  lich_cap_nhat_luc: string;
};
// Đầu ra POST /gia/nhieu-can (US7, api/gia.md). Chưa có màn đặt giá dịp cho nhiều căn nên gia_dip_ids luôn null.
export type KetQuaGiaNhieuCan = { can_ids: string[]; so_can: number; thang: string[] | null; gia_dip_ids: string[] | null };
// Thân và đầu ra POST /can/:id/gia/sao-chep (US7, mục "Sao chép giá sang căn khác" (US7))
export type ThanSaoChepGia = { den_can_ids: string[]; gia_thang: boolean; gia_le: boolean; gia_dip_dac_biet: boolean };
// thang_giu_gia_cu (US7, Tùng quyết 04/11/2026; tên trường do app đặt, EN52 làm server khớp): các tháng căn nguồn chưa có giá mà
// căn đích đã có giá thì giữ giá đích. Chỉ liệt kê căn đích có tháng giữ lại, tháng dạng YYYY-MM tăng dần. Không có thì mảng rỗng.
export type ThangGiuGiaCu = { can_id: string; ma_can: string; thang: string[] };
// dip_giu_cu (US7, Tùng quyết 04/11/2026 điểm 12; tên trường do app đặt, EN52 làm server khớp): ngày lễ, dịp đặc biệt của căn đích
// (thuộc loại đã chọn để sao chép) mà căn nguồn không có thì giữ nguyên. Chỉ liệt kê căn đích có dịp giữ lại, dịp xếp theo tu tăng dần.
// tu, den dạng YYYY-MM-DD. Không có thì mảng rỗng.
export type DipGiuGiaCu = { can_id: string; ma_can: string; dip: { ten: string; tu: string; den: string }[] };
export type KetQuaSaoChepGia = {
  tu_can_id: string;
  den_can_ids: string[];
  so_can: number;
  thang_giu_gia_cu: ThangGiuGiaCu[];
  dip_giu_cu: DipGiuGiaCu[];
  // dip_bo_qua (US7, Tùng quyết 04/11/2026 điểm 13, "Phương án B"; tên trường do app đặt, EN52 làm server khớp): dịp của căn nguồn
  // (thuộc loại đã chọn) chồng ngày một dải khác của căn đích nên không chép, căn đích giữ dải của mình. Cùng dạng dip_giu_cu nhưng
  // dip là dịp NGUỒN bị bỏ. Chỉ liệt kê căn đích có dịp bị bỏ, xếp theo tu tăng dần. Không có thì mảng rỗng.
  dip_bo_qua: DipGiuGiaCu[];
};

// ---- Hồ sơ và xin số điện thoại (US5, api/phien-ho-so.md) ----
// GET /toi, phần app dùng. so_dien_thoai null là chưa có (US5-NT8).
export type HoSo = {
  id: string;
  vai_chon: VaiChon;
  ho_ten: string | null;
  ten_hien_thi: string | null;
  anh_dai_dien: string | null;
  so_dien_thoai: string | null;
  // US1 (mục "Ngày tính giá cuối tuần" (US4)): các thứ tính giá cuối tuần, 1 là T2 đến 7 là CN, tăng dần. Mặc định [5, 6] (T6, T7).
  dem_cuoi_tuan?: number[];
  // US13 (mục "Mức cộng giá mặc định" (US13)): chỉ tài khoản vai sale có hai trường này. Chủ nhà không có (PQ11.CHU).
  muc_cong_mac_dinh?: number;
  lam_tron_50k?: boolean;
  // US14 (mục "Mẫu tin gửi khách" (US14)): mẫu tin gửi khách của sale. null là dùng mẫu mặc định.
  mau_tin_gui_khach?: string | null;
};
// Thân PATCH /toi (api/phien-ho-so.md). Chủ nhà gửi muc_cong_mac_dinh, lam_tron_50k thì DU_LIEU_SAI (PQ11.CHU).
export type ThanSuaToi = { dem_cuoi_tuan?: number[]; muc_cong_mac_dinh?: number; lam_tron_50k?: boolean; mau_tin_gui_khach?: string | null };
// Thân POST /toi/thong-tin-zalo: app chỉ gửi token, server mới đổi ra số (zalo-rang-buoc 2.4). Không có trường so_dien_thoai.
export type ThanThongTinZalo = { token_sdt?: string; ho_ten?: string; anh_zalo?: string };

// ---- Link mời và kết nối (US5, api/ket-noi-link.md) ----
// POST /link { loai: "moi_sale" } hoặc { loai: "gui_lich", can_ids } (US26) hoặc { loai: "xin_lich" } (US17, sale)
export type LinkMoi = {
  ma: string;
  duong_dan: string;
  loai: "moi_sale" | "gui_lich" | "xin_lich";
  tao_luc: string;
  het_han_luc: string | null;
  so_lan_gui: number;
  gui_cuoi_luc: string | null;
  // Chỉ với gui_lich: các căn của link (link_chia_se_can)
  can_ids?: string[];
};
export type TrangThaiKetNoi = "da_ket_noi" | "chua_ket_noi" | "chu_ngung" | "sale_bo" | "da_xoa_tai_khoan";
export type NguonKetNoi = "link_moi" | "sale_xin" | "chu_gui_lich" | "chu_them_tay";
// Một dòng của GET /ket-noi (chủ nhà). Không có số điện thoại trong danh sách (api/ket-noi-link.md).
// tom_tat chưa có trong API: CN7 canvas ghi "2 đặt phòng tháng này · 4 đêm", app cần thêm từ server (ghi vào PR).
export type DongKetNoi = {
  id: string;
  ten_hien_thi: string | null;
  trang_thai: TrangThaiKetNoi;
  nguon: NguonKetNoi;
  tong_tien_dat_phong: number;
  tom_tat?: { so_dat_phong: number; so_dem: number; so_chua_coc: number; da_thanh_toan_het: boolean };
};
export type DanhSachKetNoi = { vai: "chu_nha"; da_ket_noi: DongKetNoi[]; chua_ket_noi: DongKetNoi[] };
// Một đặt phòng trong GET /ket-noi/:id (CN7-04). Không giá bán, không khách (PQ11.CHU, PQ9.CHU).
export type DatPhongCuaSale = {
  id: string;
  can_id: string;
  ma_can: string;
  ngay_nhan: string;
  ngay_tra: string;
  tien_phong: number;
  trang_thai_tien: TrangThaiTien;
};
// GET /ket-noi/:id, bản chủ nhà
export type ChiTietKetNoi = {
  vai: "chu_nha";
  id: string;
  trang_thai: TrangThaiKetNoi;
  nguon: NguonKetNoi;
  ten_hien_thi: string | null;
  so_dien_thoai: string | null;
  ket_noi_luc: string | null;
  quyen_tinh_trang_coc: boolean;
  pham_vi: "tat_ca_can" | "chon_can";
  dat_phong: DatPhongCuaSale[];
};

// ---- Sale mở link và xem lịch 7 ngày (US6, api/ket-noi-link.md, api/sale.md) ----
// Một căn trong xem trước link (GET /link/:ma). Không có id căn, không có giá (PQ3.LINK, PQ5.LINK, QD9).
// toa_nha chưa có trong api/ket-noi-link.md ([MỞ: QD20 điểm 10 không có tòa]); canvas A10 và US6-KB4 ghi "Sapphire 1103" nên server giả gửi thêm.
export type CanTrongLink = {
  ma_can: string;
  toa_nha: string | null;
  so_phong_ngu: SoPhongNgu;
  so_giuong: number | null;
  loai_view: string | null;
  anh_dai_dien: string | null;
};
// GET /link/:ma, link mời (moi_sale). Không có số điện thoại chủ nhà, không ảnh đại diện chủ nhà (PQ1.LINK, PQ2.LINK).
export type XemTruocLink = {
  loai: "moi_sale" | "gui_lich";
  het_han_luc: string | null;
  chu_nha: { ten_hien_thi: string | null };
  so_can: number;
  can: CanTrongLink[];
  // Chỉ có khi người gọi có tài khoản (PQ17.LINK)
  da_them?: boolean;
  vai_nguoi_mo?: VaiChon | null;
};
// GET /link/:ma, link xin lịch (xin_lich, US17, A8): chỉ tên và số của sale; số null khi sale chưa cho (PQ1.CHU, PQ2.CHU).
// Không có chu_nha, so_can, can, da_them.
export type XemTruocLinkXin = {
  loai: "xin_lich";
  het_han_luc: string | null;
  sale: { ten_hien_thi: string | null; so_dien_thoai: string | null };
};
// POST /link/:ma/dong-y { quyen_tinh_trang_coc }: giá không còn là quyền (QD20 r2 điểm 3), app không gửi quyen_gia_tung_dem
export type KetQuaDongYXinLich = {
  ket_noi_id: string;
  trang_thai: TrangThaiKetNoi;
  ten_hien_thi_sale: string | null;
  quyen_tinh_trang_coc: boolean;
  ket_noi_luc: string;
};
// GET /xin-lich/thong-ke (A7): hai số và lần gửi gần nhất, không tên chủ nhà nào (US17-NT3, PQ18.SALE)
export type ThongKeXinLich = { so_lan_gui: number; gui_cuoi_luc: string | null; so_chu_nha_dong_y: number };

// ---- Thông báo (US17, api/thong-bao-thong-ke-xuat.md): GET /thong-bao, POST /thong-bao/da-doc ----
// Mỗi mục là một dòng hoặc một nhóm gom (khoa_gom); du_lieu theo loại, không giá, không tên khách (PQ19).
export type CanThongBao = { can_id: string | null; ma_can: string; ten_toa_nha: string | null };
export type MucThongBao = {
  id: string;
  ids: string[];
  loai: string;
  du_lieu: Record<string, unknown>;
  du_lieu_gom: Record<string, unknown>[] | null;
  booking_id: string | null;
  yeu_cau_id: string | null;
  tao_luc: string;
  da_doc_luc: string | null;
};
export type DanhSachThongBao = { muc: MucThongBao[]; so_chua_doc: number; truoc_tiep: string | null };
export type ThanDaDoc = { ids: string[] } | { tat_ca: true };

// POST /link/:ma/them-lich
export type KetQuaThemLich = { ket_noi_id: string; da_co_tu_truoc: boolean; ten_hien_thi_chu_nha: string | null; so_can: number };

// GET /sale/lich (api/sale.md). Bản US6 chỉ có nhóm nguon_phong; cua_toi và tu_nhap làm ở US16.
export type NhomCanSale = "cua_toi" | "nguon_phong" | "tu_nhap";
export type TrangThaiO = "trong" | "kin" | "chua_biet" | "cua_ban";
// gia_ban chỉ có ở ô trong của căn nguon_phong mà chủ nhà cho xem giá. Không có khóa nào khác về giá (PQ5.SALE, PQ11.SALE).
// gia_chu chỉ có ở ô `trong` của căn của tôi (api/sale.md): giá đêm của chính sale.
export type OLichSale = { ngay: string; trang_thai: TrangThaiO; gia_ban?: number | null; gia_chu?: number | null };
export type CanLichSale = {
  id: string;
  ma_can: string;
  toa_nha: { id: string; ten: string } | null;
  nhom: NhomCanSale;
  loai: "co_lich" | "tu_nhap";
  so_phong_ngu: SoPhongNgu;
  chu_nha?: { id: string; ten_hien_thi: string | null };
  // Chỉ căn tự nhập của sale đã nhập (QD11, PQ14.SALE)
  ten_chu_can?: string;
  lich_cap_nhat_luc?: string | null;
  o: OLichSale[];
};
// sap_xep của GET /sale/lich (S1-04, mục "Lịch phòng 7 ngày" (US16) bước 6)
export type SapXepLich = "ten" | "gia_tang" | "ban_nhieu";
export type LichSale = {
  tu: string;
  so_ngay: 7 | 14;
  ngay: string[];
  so_can: Record<NhomCanSale, number>;
  can: CanLichSale[];
};

// ---- Chi tiết căn và mức cộng (US13, api/sale.md: GET /sale/can/:id, PUT /sale/can/:id/muc-cong) ----
// Căn đã chia sẻ luôn có giá, không còn công tắc "Giá từng đêm" (QD20 r2 điểm 3, EN53). Đêm chưa đặt giá: null.
export type DemCanSale = { ngay: string; trang_thai: "trong" | "kin"; gia_chu?: number | null; gia_ban?: number | null };
export type ChiTietCanSale = {
  id: string;
  ma_can: string;
  toa_nha: { id: string; ten: string; khu_vuc: string | null } | null;
  so_phong_ngu: SoPhongNgu;
  so_giuong: number | null;
  loai_view: string | null;
  mo_ta_gui_khach: string | null;
  anh: { thu_tu: number; duong_dan: string; het_han_luc: string }[];
  lich_cap_nhat_luc: string | null;
  chu_nha: { id: string; ten_hien_thi: string | null; so_dien_thoai: string | null; so_can_chia_se: number };
  gio_nhan: string;
  gio_tra: string;
  muc_cong: { so_tien: number; rieng: boolean };
  lam_tron_50k: boolean;
  dem?: DemCanSale[];
  tong_gia_chu?: number | null;
  tong_gia_ban?: number | null;
};
export type KetQuaMucCong = { can_id: string; so_tien: number; dem?: DemCanSale[]; tong_gia_chu?: number | null; tong_gia_ban?: number | null };
// Đi từ S2 sang S3 và từ S3 sang S3-02 (US15), S5 (US14) qua state điều hướng. Mở từ lịch 7 ngày S1 không có ngày: US6.
export type TrangThaiCanSale = { can_id: string; ngay_nhan: string | null; ngay_tra: string | null };

// ---- Gửi khách (US14, api/sale.md: POST /sale/gui-khach/xem, POST /sale/gui-khach/da-gui) ----
// State mở S5. Từ S2: nhiều căn theo thứ tự tích. Từ S3: một căn, state của S3 (TrangThaiCanSale) dùng được luôn.
export type TrangThaiGuiKhach = { can_ids?: string[]; can_id?: string; ngay_nhan: string | null; ngay_tra: string | null };
export type AnhGuiKhach = { thu_tu: number; duong_dan: string; het_han_luc: string };
// Chữ và JSON không có giá chủ, không có mức cộng (US14-NT4, PQ5.SALE, PQ11.KHACH)
export type CanGuiKhach = {
  id: string;
  ten: string;
  chu: string;
  so_anh: number;
  anh: AnhGuiKhach[];
  gio_nhan: string;
  gio_tra: string;
};
export type KetQuaGuiKhachXem = {
  ngay_nhan: string;
  ngay_tra: string;
  so_dem: number;
  chu_tat_ca: string;
  can: CanGuiKhach[];
};
export type KetQuaDaGui = { id: string; da_ghi_truoc: boolean };

// ---- Tìm phòng trống (US12, api/sale.md: GET /sale/tim, /sale/tim/lich-tuan, /sale/tim-gan-day) ----
// Điều kiện tìm. Danh sách rỗng là không lọc. so_phong_ngu 4 là 4PN+. Chưa có lọc giá, số khách [MỞ: CH-069, 14].
export type DieuKienTim = { ngay_nhan: string; ngay_tra: string; so_phong_ngu: number[]; loai_view: string[]; toa_nha_id: string[] };
// Căn nguồn phòng luôn có tong_gia_chu, tong_gia_ban (QD20 r2 điểm 3, EN53). Căn của tôi không có tong_gia_ban.
export type CanTim = {
  id: string;
  ma_can: string;
  toa_nha: { id: string; ten: string } | null;
  nhom: NhomCanSale;
  so_phong_ngu: SoPhongNgu;
  so_giuong: number | null;
  loai_view: string | null;
  chu_nha?: { id: string; ten_hien_thi: string | null };
  ten_chu_can?: string;
  lich_cap_nhat_luc?: string | null;
  khong_co_lich: boolean;
  tong_gia_chu?: number | null;
  tong_gia_ban?: number | null;
};
export type GoiYTim = { loai: "doi_ngay" | "bo_loc" | "doi_so_phong_ngu"; dieu_kien: DieuKienTim; so_can_trong: number };
export type KetQuaTim = { ngay_nhan: string; ngay_tra: string; so_dem: number; so_can_trong: number; can: CanTim[]; goi_y: GoiYTim[] };
export type LichTuanTim = {
  ngay_nhan: string;
  ngay_tra: string;
  so_dem: number;
  so_can_trong: number;
  tu: string;
  ngay: string[];
  dem_khach_hoi: string[];
  can: CanLichSale[];
};
export type MucTimGanDay = {
  id: string;
  ngay_nhan: string;
  ngay_tra: string;
  so_phong_ngu: number[];
  loai_view: string[];
  toa_nha: { id: string; ten: string }[];
  tim_luc: string;
};

// ---- Giá ngày lễ, dịp đặc biệt (US8, api/gia.md) ----
// Một dải Home247 đặt sẵn, đầu ra GET /ngay-le?nam=
export type MucNgayLe = { id: string; ten: string; tu_ngay: string; den_ngay: string };
export type KetQuaNgayLe = { nam: number; muc: MucNgayLe[] };
// Thân POST /can/:id/gia-dip
export type ThanGiaDip = { ten: string | null; tu_ngay: string; den_ngay: string; la_ngay_le: boolean; gia_moi_dem: number; ngay_le_id: string | null };
// Đầu ra POST /can/:id/gia-dip
export type KetQuaGiaDip = DaiDip & { can_id: string; lich_cap_nhat_luc: string };
// Dải đã có khi báo DIP_CHONG_NGAY
export type DaiChong = { id: string; ten: string; tu_ngay: string; den_ngay: string };

// ---- US16 · Nguồn phòng của sale (api/ket-noi-link.md: GET /ket-noi, GET /ket-noi/:id, DELETE /ket-noi/:id, bản sale) ----
// Căn trong nguồn phòng: không giá, không số khách (US16-NT7).
export type CanNguonPhong = { id: string; ma_can: string; toa_nha: string | null; so_phong_ngu: SoPhongNgu; so_giuong: number | null; loai_view: string | null };
// Dòng chủ nhà đã rút quyền: không `can`, không `lich_cap_nhat_luc` (mục "Danh sách căn và nguồn phòng" (US16) bước 10, PQ23.SALE)
export type DongNguonPhong = {
  id: string;
  trang_thai: "da_ket_noi";
  da_xoa_tai_khoan: boolean;
  ten_hien_thi: string | null;
  lich_cap_nhat_luc?: string | null;
  can?: CanNguonPhong[];
};
export type NguonPhong = { vai: "sale"; nguon_phong: DongNguonPhong[] };
// Căn ở S6-04. Giá căn ("1.800.000đ/đêm") và "Bạn đã bán", "Tiền chênh" còn [MỞ: CH-074, CH-075], server chưa gửi: app không hiện.
export type CanChiTietNguonPhong = CanNguonPhong;
export type ChiTietNguonPhong = {
  vai: "sale";
  id: string;
  ten_hien_thi: string | null;
  so_dien_thoai: string | null;
  ket_noi_luc: string | null;
  lich_cap_nhat_luc: string | null;
  quyen_tinh_trang_coc: boolean;
  can: CanChiTietNguonPhong[];
};
export type KetQuaBoNguon = { id: string; ket_qua: "sale_bo" | "da_xoa_dong" };
export type KetQuaXoaCan = { id: string; ket_qua: "an" | "xoa"; an_luc: string | null };
