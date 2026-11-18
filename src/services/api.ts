// Lớp gọi API. Chưa có server (EN11 đến EN13) nên đây là server giả trong bộ nhớ (QD22).
// Tên hàm theo API trong docs/architecture/server.md: postPhien là POST /phien, getCan là GET /can...
// Có server thì thay thân các hàm bằng lời gọi HTTP, màn không phải sửa.
// Không dùng localStorage (Zalo không có): tải lại app là mất dữ liệu, dùng menu Bản thử để nạp lại.
import {
  ANH_TUAN,
  BOOKING_ANH_TUAN_MAU,
  BOOKING_MAU,
  CAN_CUA_ANH_TUAN,
  CAN_CUA_CHI_HOA,
  CAN_THU_BA_CHI_HOA,
  CHI_HOA,
  DOANH_THU_CU_MAU,
  GIA_DIP_MAU,
  GIA_THANG_MAU,
  HOM_NAY_MAU,
  NGAY_LE_MAU,
  SALE_CUA_CHI_HOA,
  SALE_MAU,
  THANG_CO_GIA_MAU,
} from "./du-lieu-mau";
import {
  LoiApi,
  LoiMang,
  type BangGia,
  type Anh,
  type Can,
  type CanChiTiet,
  type CanLichSale,
  type CanNguonPhong,
  type CanTim,
  type ChiTietNguonPhong,
  type DatPhongDaGhi,
  type DongNguonPhong,
  type KetQuaBoNguon,
  type KetQuaXoaCan,
  type NguonPhong,
  type SapXepLich,
  type ThanPostCan,
  type TinhTrangHomNay,
  type ChiTietCanSale,
  type DemCanSale,
  type KetQuaMucCong,
  type ThanSuaToi,
  type DieuKienTim,
  type GoiYTim,
  type KetQuaTim,
  type LichTuanTim,
  type MucTimGanDay,
  type ChiTietKetNoi,
  type KetQuaThemLich,
  type LichSale,
  type XemTruocLink,
  type DanhSachKetNoi,
  type DatPhong,
  type DatPhongSale,
  type ThanSuaDatPhong,
  type ThongBaoChuSua,
  type DanhSachThongBao,
  type KetQuaDongYXinLich,
  type MucThongBao,
  type ThanDaDoc,
  type ThongKeXinLich,
  type XemTruocLinkXin,
  type DemGia,
  type DongKetNoi,
  type GiaDem,
  type HoSo,
  type KetQuaGiaDip,
  type KetQuaGiaNhieuCan,
  type KetQuaNgayLe,
  type MucNgayLe,
  type ThanGiaDip,
  type KetQuaGiaThang,
  type KetQuaSaoChepGia,
  type KetQuaPostAnh,
  type KiemTrung,
  type LichNgay,
  type LichThang,
  type LichTuan,
  type LinkMoi,
  type NguoiDat,
  type NguonKetNoi,
  type SaleKetNoi,
  type SapToi,
  type SoPhongNgu,
  type TaiKhoan,
  type ThanSuaCan,
  type TepAnh,
  type KetQuaDaGui,
  type KetQuaGuiKhachXem,
  type ToaNha,
  type TomTatThang,
  type ThongKeChu,
  type ThongKeTheoNguoiBan,
  type ThanDatPhong,
  type ThanSaoChepGia,
  type DipGiuGiaCu,
  type ThangGiuGiaCu,
  type ThanThongTinZalo,
  type TrangThaiKetNoi,
  type TrangThaiTien,
  type VaiChon,
} from "./kieu";
import type { BenKiaYeuCau, KetQuaChapNhan, LyDoTuChoi, ThanYeuCau, TrangThaiYeuCau, YeuCauChu, YeuCauSale, YeuCauTrung } from "./yeu-cau";
import { CAC_LY_DO_TU_CHOI, HAN_TRA_LOI_NGAY, TOI_DA_LOI_NHAN } from "./yeu-cau";
import { chuMotCan, dongMoTa, dungChuTheoMau, TOI_DA_KY_TU_MAU, type CanDeDungChu } from "./mau-tin";
import { cacDem, chuNgayNgan, congNgay, congThang, DEM_CUOI_TUAN_MAC_DINH, laNgay, laThang, laCuoiTuan, laThuHai, luoiThang, ngayVN, thangCua } from "./ngay";

// ID Zalo của người đang dùng máy này. Server thật lấy từ access token (server.md 1.2).
const ZALO_ID_MAY_NAY = "zalo-may-nay";
const MOI_THEM_TRONG_MS = 24 * 60 * 60 * 1000; // [GIẢ ĐỊNH: GD14] nhãn "Mới thêm" trong 24 giờ

// Giá của căn (bảng gia_thang, gia_dip). Căn chủ nhà tự thêm chưa có giá (US4).
type GiaCan = {
  thang: Record<string, { thuong: number; cuoi_tuan: number }>;
  dip: { id: string; ten: string; la_ngay_le: boolean; tu_ngay: string; den_ngay: string; gia_moi_dem: number; ngay_le_id?: string | null }[];
};
type CanLuu = Omit<Can, "moi_them" | "anh_dai_dien" | "loai" | "ten_chu_can" | "tinh_trang_hom_nay"> & {
  tai_khoan_id: string;
  an_luc: string | null;
  gia?: GiaCan;
  mo_ta_gui_khach?: string | null;
  // US16 (bảng can): không có `loai` là căn có lịch. Căn tự nhập của sale có tên, số chủ căn và giá chủ báo (QD11).
  loai?: "tu_nhap";
  ten_chu_can?: string;
  sdt_chu_can?: string | null;
  gia_chu_thuong?: number | null;
  gia_chu_cuoi_tuan?: number | null;
};
const laTuNhap = (c: CanLuu) => c.loai === "tu_nhap";
// Hồ sơ nằm cùng dòng tài khoản (bảng tai_khoan). so_dien_thoai chỉ ghi qua POST /toi/thong-tin-zalo (mục "Số điện thoại hiện trong hồ sơ" (US5)).
type TaiKhoanLuu = TaiKhoan & {
  zalo_id: string;
  ho_ten?: string | null;
  ten_hien_thi?: string | null;
  anh_dai_dien?: string | null;
  so_dien_thoai?: string | null;
  // Chỉ vai sale (phien-ho-so.md): mức cộng mặc định và làm tròn 50k. Mới tạo thì 0 và tắt.
  muc_cong_mac_dinh?: number;
  lam_tron_50k?: boolean;
  // mục "Mẫu tin gửi khách" (US14): mẫu tin gửi khách của sale, null hay không có là mẫu mặc định
  mau_tin_gui_khach?: string | null;
  // mục "Ngày tính giá cuối tuần" (US11): các thứ tính giá cuối tuần của chủ nhà (1 là T2 đến 7 là CN), mặc định T6, T7. Không có thì [5, 6].
  dem_cuoi_tuan?: number[];
  // Giờ nhận, trả mặc định của chủ nhà (mục "Giờ nhận, trả phòng mặc định" (US21)). Không có thì 14:00 và 12:00.
  gio_nhan?: string;
  gio_tra?: string;
  // US17 (QD18 r5): đã rút quyền tên và số trong Zalo; chủ nhà không chia lịch cho sale đó (QD18 r9)
  rut_quyen_luc?: string | null;
};
// Bảng ket_noi phía chủ nhà (data-model). Sale không dùng app (thêm tay) thì sale_id trống, tên và số do chủ nhà nhập.
type KetNoiLuu = {
  id: string;
  chu_nha_id: string;
  sale_id: string | null; // tai_khoan.id của sale; trống với sale chủ nhà thêm tay
  ten: string;
  so_dien_thoai: string | null;
  trang_thai: TrangThaiKetNoi;
  nguon: NguonKetNoi;
  ket_noi_luc: string | null;
  // Phạm vi căn sale được xem (US26): trống hay tat_ca_can thì mọi căn chưa ẩn, kể cả căn thêm sau (US6-NT10);
  // chon_can thì chỉ các căn trong can_ids (bảng ket_noi_can), căn thêm sau không tự vào (US26-NT4)
  pham_vi?: "tat_ca_can" | "chon_can";
  can_ids?: string[];
  // US16: tên chủ nhà lúc rút quyền, để sale vẫn thấy dòng "Chị Hoa đã xóa tài khoản" (QD18 r6)
  ten_chu_cu?: string;
  // US17 (A8): quyền Tình trạng cọc chủ nhà chọn khi đồng ý; không có thì bật (QD20 điểm 6). Giá không còn là quyền (QD20 r2).
  quyen_tinh_trang_coc?: boolean;
};
// Bảng link_chia_se, loại moi_sale, gui_lich hoặc xin_lich (US17, mỗi sale một link, không hạn)
type LinkLuu = LinkMoi & { tai_khoan_id: string };
// Bảng booking (data-model), phần chủ nhà thấy. ten_sale có là đặt phòng của sale (dữ liệu mẫu DLM.4).
type BookingLuu = {
  id: string;
  can_id: string;
  ngay_nhan: string;
  ngay_tra: string;
  trang_thai: "hieu_luc" | "cho_huy" | "da_huy";
  ten_sale?: string | null;
  sale_id?: string | null; // id dòng ket_noi của sale đặt phòng (booking.sale_id)
  ten_khach?: string | null;
  tien_phong?: number;
  trang_thai_tien?: TrangThaiTien;
  tien_coc?: number | null;
  so_khach?: number | null;
  gio_nhan?: string;
  gio_tra?: string;
  ghi_chu?: string | null;
  dem?: { ngay: string; gia_chu: number }[];
  // US10: trạng thái tiền trước khi thu đủ (hoàn tác đúng, kể cả "Chưa cọc"), giá bán của sale (bảng gia_ban_booking,
  // tách riêng: API của chủ nhà không có đường đọc, PQ11.CHU), lần sửa cuối
  trang_thai_tien_truoc?: TrangThaiTien | null;
  gia_ban?: number | null;
  tao_luc?: string;
  cap_nhat_luc?: string;
  // US16: đặt phòng sale tự ghi cho căn tự nhập (mục "Ghi booking đã chốt cho căn tự nhập" (US16)): không sale_id, không trạng thái tiền; tien_phong là tiền trả chủ, gia_ban là tiền thu khách
  nguon?: "sale_tu_ghi";
};
// Bảng thong_bao, phần loại chu_sua_booking (mục "Sửa booking" (US10) bước 4). Đọc qua getThongBaoChuSua cho tới khi US17 làm GET /thong-bao.
type ThongBaoLuu = ThongBaoChuSua & { nguoi_nhan_id: string };
// Bảng thong_bao, các loại khác (US17): chu_dong_y_ket_noi, chu_ngung_ket_noi. khoa_gom gom các lần đồng ý trong 10 phút [GIẢ ĐỊNH: GD15].
type ThongBaoMoiLuu = {
  id: string;
  nguoi_nhan_id: string;
  loai: string;
  du_lieu: Record<string, unknown>;
  khoa_gom: string | null;
  tao_luc: string;
  da_doc_luc: string | null;
};

// Bảng anh_can (data-model): can_id và thu_tu trống là ảnh tạm chưa gắn căn. nguon là đường dẫn tệp trên máy (server giả).
type AnhLuu = {
  id: string;
  tai_khoan_id: string;
  can_id: string | null;
  thu_tu: number | null;
  nguon: string;
  tao_luc: string;
};

// Bảng toa_nha (data-model): tao_boi trống là tòa Home247 đặt sẵn. Server giả dùng tên làm id tòa (như getLichTuan, GET /sale/lich).
type ToaLuu = { id: string; ten: string; khu_vuc: string | null; tao_boi: string | null };

// Bảng yeu_cau_dat_phong (data-model). Chưa chiếm đêm nào; chỉ khi chủ nhà chấp nhận mới thành booking (nhóm Booking quy tắc Yêu cầu chưa phải booking).
type YeuCauLuu = {
  id: string;
  can_id: string;
  chu_nha_id: string;
  sale_id: string; // tai_khoan.id của sale
  trang_thai: TrangThaiYeuCau;
  ngay_nhan: string;
  ngay_tra: string;
  gia_chu: number;
  gia_ban: number;
  loi_nhan: string | null;
  ly_do: LyDoTuChoi | "chu_nhan_dat_khac" | null;
  gui_luc: string;
  het_han_luc: string;
  tra_loi_luc: string | null;
  booking_id: string | null;
};

type Db = {
  tai_khoan: TaiKhoanLuu[];
  toa_nha: ToaLuu[];
  can: CanLuu[];
  anh: AnhLuu[];
  booking: BookingLuu[];
  phien: Map<string, { zalo_id: string }>;
  // Khóa lặp (server.md 1.6): (tài khoản, Idempotency-Key) -> kết quả
  khoa_lap: Map<string, DatPhong>;
  // Khóa lặp của PUT /can/:id/gia-thang (US4)
  khoa_lap_gia: Map<string, KetQuaGiaThang>;
  // Bảng ngay_le (US8): dải ngày lễ Home247 đặt sẵn, người dùng không sửa được
  ngay_le: MucNgayLe[];
  // Bảng ket_noi (US5): sale đã kết nối, chưa kết nối, đã ngừng của chủ nhà
  ket_noi: KetNoiLuu[];
  link: LinkLuu[];
  // Mức cộng riêng của sale cho từng căn (bảng muc_cong)
  muc_cong: { sale_id: string; can_id: string; so_tien: number }[];
  // Khóa lặp của các API ghi US5, khóa là "tài khoản:API:Idempotency-Key" (server.md 1.6)
  khoa_lap_chung: Map<string, unknown>;
  // Token số điện thoại đã đổi (dùng một lần) hoặc đã quá 2 phút (zalo-rang-buoc 2.4)
  token_da_dung: Set<string>;
  token_het_han: Set<string>;
  // DLM.5: tháng cũ chỉ có tổng, không có đặt phòng (tháng 9: 9.600.000đ). Chỉ dữ liệu mẫu có.
  doanh_thu_cu: Record<string, number>;
  thong_bao: ThongBaoLuu[];
  thong_bao_moi: ThongBaoMoiLuu[];
  // Bảng tim_gan_day (US12): 5 lần tìm gần nhất của từng sale, mới trước [GIẢ ĐỊNH: GD17]
  tim_gan_day: (MucTimGanDay & { sale_id: string })[];
  // Bảng lan_gui_khach (US14): căn, các đêm, lúc gửi. Không ghi khách (QD11)
  lan_gui_khach: { id: string; sale_id: string; can_id: string; ngay_nhan: string; ngay_tra: string; gui_luc: string; ngay_gui: string }[];
  // Bảng yeu_cau_dat_phong (US15)
  yeu_cau: YeuCauLuu[];
  dem: number;
};

// Ba tòa Home247 đặt sẵn (mục "Tòa nhà, loại view, số giường, mô tả" (US11) bước 1, mục "Quản trị danh sách tòa nhà" (US29)). DLM chưa có khu vực của À La Carte, Sapphire.
const toaDatSan = (): ToaLuu[] => [
  { id: "ICON40", ten: "ICON40", khu_vuc: "Bãi Cháy", tao_boi: null },
  { id: "À La Carte", ten: "À La Carte", khu_vuc: null, tao_boi: null },
  { id: "Sapphire", ten: "Sapphire", khu_vuc: null, tao_boi: null },
];
const dbMoi = (): Db => ({
  tai_khoan: [], toa_nha: toaDatSan(), can: [], anh: [], booking: [], phien: new Map(), khoa_lap: new Map(), khoa_lap_gia: new Map(), ngay_le: [],
  ket_noi: [], link: [], muc_cong: [], khoa_lap_chung: new Map(), token_da_dung: new Set(), token_het_han: new Set(), doanh_thu_cu: {}, thong_bao: [], thong_bao_moi: [], tim_gan_day: [], lan_gui_khach: [], yeu_cau: [], dem: 0,
});
let db = dbMoi();
let zaloIdHienTai = ZALO_ID_MAY_NAY;
// Tên Zalo của từng ID (server thật lấy từ Zalo qua access token): dùng làm ten_hien_thi lúc tạo tài khoản
const tenZalo = new Map<string, string>();

// Phiên phía app (server.md 1.2: app giữ phiên, gửi lại ở header Authorization)
let phienCuaApp: string | null = null;

// Server giả trả lời sau một chút để thấy trạng thái đang lưu (HV1 bước 3)
let doTre = 300;
// Máy mất mạng thì lời gọi hỏng như gọi server thật (HV2): thử trên điện thoại bằng chế độ máy bay
let giaMatMang = false;
const matMang = () => giaMatMang || (typeof navigator !== "undefined" && navigator.onLine === false);
const cho = async () => {
  if (doTre > 0) await new Promise((r) => setTimeout(r, doTre));
  if (matMang()) throw new LoiMang();
};

// "Hôm nay" theo giờ Việt Nam của server. Dữ liệu mẫu đặt hôm nay là 07/10/2026 (DLM.1).
let homNayGia: string | null = null;
export const homNay = () => homNayGia ?? ngayVN();

const idMoi = (loai: string) => `${loai}-${++db.dem}`;

const nguoiGoi = (): TaiKhoanLuu => {
  const phien = phienCuaApp ? db.phien.get(phienCuaApp) : undefined;
  const tk = phien && db.tai_khoan.find((t) => t.zalo_id === phien.zalo_id);
  if (!tk) throw new LoiApi("CHUA_DANG_NHAP");
  return tk;
};

const MOT_GIO_MS = 3600_000;
// Ảnh thu_tu 1 của căn, null khi chưa có ảnh nào gắn vào căn (căn mẫu DLM chỉ có số ảnh)
const anhDaiDien = (canId: string): Anh | null => {
  const a = db.anh.find((x) => x.can_id === canId && x.thu_tu === 1);
  return a ? { id: a.id, thu_tu: 1, duong_dan_xem: a.nguon, het_han_luc: new Date(Date.now() + MOT_GIO_MS).toISOString() } : null;
};

const raCan = (c: CanLuu, bayGio = Date.now()): Can => ({
  id: c.id,
  ma_can: c.ma_can,
  so_phong_ngu: c.so_phong_ngu,
  so_giuong: c.so_giuong,
  loai_view: c.loai_view,
  toa_nha: c.toa_nha,
  so_anh: c.so_anh,
  anh_dai_dien: anhDaiDien(c.id),
  tao_luc: c.tao_luc,
  moi_them: bayGio - Date.parse(c.tao_luc) < MOI_THEM_TRONG_MS,
});

// POST /anh (api/can-anh.md, server.md 1.9): tải một ảnh, nhận anh_id tạm chưa gắn căn.
// Server giả không đổi ảnh, chỉ kiểm tệp và lưu thông tin. onTienDo cho chữ "Đang tải 60%" (mục "Ảnh khi thêm căn" (US25) bước 2).
// Bấm "Thử lại" giữ nguyên khoa nên không tạo ảnh thứ hai (Chống bấm hai lần).
export const MAX_ANH_CAN = 12;
const MAX_BYTE_ANH = 15 * 1024 * 1024;
const MAX_ANH_TAM = 50;
const DUOI_ANH = ["jpg", "jpeg", "png", "heic", "heif"];
export async function postAnh(tep: TepAnh, khoa: string, onTienDo?: (phanTram: number) => void): Promise<KetQuaPostAnh> {
  onTienDo?.(30);
  await cho();
  const tk = nguoiGoi();
  const duoi = /\.([a-z0-9]+)$/i.exec(tep.ten)?.[1]?.toLowerCase();
  // Server thật xét theo nội dung tệp; tệp không có đuôi thì server giả cho qua
  if (!tep.duong_dan || tep.dung_luong > MAX_BYTE_ANH || (duoi && !DUOI_ANH.includes(duoi))) {
    throw new LoiApi("DU_LIEU_SAI", "", "tep");
  }
  if (khoa.length < 16 || khoa.length > 64) throw new LoiApi("DU_LIEU_SAI", "", "Idempotency-Key");
  return motLan(tk, "POST /anh", khoa, () => {
    if (db.anh.filter((a) => a.tai_khoan_id === tk.id && a.can_id === null).length >= MAX_ANH_TAM) {
      throw new LoiApi("QUA_NHIEU");
    }
    onTienDo?.(60);
    const a: AnhLuu = { id: idMoi("anh"), tai_khoan_id: tk.id, can_id: null, thu_tu: null, nguon: tep.duong_dan, tao_luc: new Date().toISOString() };
    db.anh.push(a);
    onTienDo?.(100);
    const bay = Date.now();
    return {
      anh_id: a.id,
      duong_dan_xem: a.nguon,
      het_han_luc: new Date(bay + MOT_GIO_MS).toISOString(),
      xoa_neu_chua_gan_luc: new Date(bay + 24 * MOT_GIO_MS).toISOString(),
    };
  });
}

// POST /phien (server.md 1.2, 2.1): chưa có tài khoản thì trả tai_khoan null
export async function postPhien(): Promise<{ tai_khoan: TaiKhoan | null }> {
  await cho();
  const phien = idMoi("phien");
  db.phien.set(phien, { zalo_id: zaloIdHienTai });
  phienCuaApp = phien;
  const tk = db.tai_khoan.find((t) => t.zalo_id === zaloIdHienTai);
  return { tai_khoan: tk ? raTaiKhoan(tk) : null };
}

const raTaiKhoan = ({ id, vai_chon, dong_y_dieu_khoan_luc }: TaiKhoanLuu): TaiKhoan => ({
  id,
  vai_chon,
  dong_y_dieu_khoan_luc,
});

// POST /tai-khoan { vai_chon } (server.md 2.1): đã có tài khoản với ID Zalo đó thì trả tài khoản cũ
// ma_link: mở từ link mời thì tạo tài khoản vai sale, bỏ qua A3 (mục "Mở app từ link mời của chủ nhà" (US6) bước 2, server.md 2.2 bước 2)
export async function postTaiKhoan(body: {
  vai_chon: VaiChon;
  dong_y_dieu_khoan_luc: string;
  ma_link?: string;
}): Promise<TaiKhoan> {
  await cho();
  const phien = phienCuaApp ? db.phien.get(phienCuaApp) : undefined;
  if (!phien) throw new LoiApi("CHUA_DANG_NHAP");
  if (body.vai_chon !== "chu_nha" && body.vai_chon !== "sale") throw new LoiApi("DU_LIEU_SAI", "", "vai_chon");
  const cu = db.tai_khoan.find((t) => t.zalo_id === phien.zalo_id);
  if (cu) return raTaiKhoan(cu);
  const { ma_link, ...goc } = body;
  if (ma_link !== undefined) {
    // Vai sale: link mời hay link gửi lịch (mục "Mở app từ link mời của chủ nhà" (US6) bước 2). Vai chủ nhà: link xin lịch của sale (mục "Chủ nhà duyệt lời mời xem lịch" (US17) bước 3, A8); server chỉ kiểm dạng mã
    if (body.vai_chon === "chu_nha") {
      if (!laMaLink(ma_link)) throw new LoiApi("DU_LIEU_SAI", "", "ma_link");
    } else linkDungDuoc(ma_link);
  }
  const tk: TaiKhoanLuu = { id: idMoi("tk"), zalo_id: phien.zalo_id, ...goc, ten_hien_thi: tenZalo.get(phien.zalo_id) ?? null };
  db.tai_khoan.push(tk);
  return raTaiKhoan(tk);
}

// Khoảng giá tuần này của thẻ căn (US4-NT2, server.md 2.4): thấp nhất đến cao nhất của gia_dem 7 đêm từ hôm nay,
// đêm không có giá thì bỏ qua. chua_dat_gia: căn không có giá tháng nào và không có dịp nào (api/can-anh.md, đề xuất tạm).
const giaTuanNay = (c: CanLuu): Pick<Can, "gia_tuan_nay" | "chua_dat_gia"> => {
  const gia: number[] = [];
  for (let i = 0, d = homNay(); i < 7; i++, d = congNgay(d, 1)) {
    const g = giaDem(c, d);
    if (g !== null) gia.push(g);
  }
  return {
    gia_tuan_nay: gia.length ? { thap_nhat: Math.min(...gia), cao_nhat: Math.max(...gia) } : null,
    chua_dat_gia: !c.gia || (Object.keys(c.gia.thang).length === 0 && c.gia.dip.length === 0),
  };
};

// GET /can (server.md 2.4): căn chưa ẩn của người gọi, căn mới thêm lên đầu
export async function getCan(): Promise<Can[]> {
  await cho();
  const tk = nguoiGoi();
  const bayGio = Date.now();
  return db.can
    .filter((c) => c.tai_khoan_id === tk.id && c.an_luc === null && !laTuNhap(c))
    .sort((a, b) => b.tao_luc.localeCompare(a.tao_luc) || b.id.localeCompare(a.id))
    .map((c) => ({ ...raCan(c, bayGio), ...giaTuanNay(c) }));
}

// Tình trạng hôm nay của căn có lịch (api/can-anh.md GET /can): có khách đang ở thì co_khach kèm ngày trả, khách nhận hôm nay thì khach_den.
const tinhTrangHomNay = (c: CanLuu): TinhTrangHomNay => {
  const hom = homNay();
  const o = db.booking.find((b) => b.can_id === c.id && b.trang_thai !== "da_huy" && b.ngay_nhan <= hom && hom < b.ngay_tra);
  if (!o) return { loai: "trong", ngay_tra: null };
  return o.ngay_nhan === hom ? { loai: "khach_den", ngay_tra: null } : { loai: "co_khach", ngay_tra: o.ngay_tra };
};

// GET /can của sale (api/can-anh.md, mục "Danh sách căn và nguồn phòng" (US16) bước 1, 3): cả căn của tôi (co_lich) và căn tự nhập, theo thứ tự tạo (cũ trước).
// Căn có lịch có tinh_trang_hom_nay; căn tự nhập luôn null, không bao giờ `trong` (US16-NT5) và có ten_chu_can. Chỉ căn của người gọi (PQ13, PQ14.SALE).
export async function getCanSale(): Promise<Can[]> {
  await cho();
  const tk = nguoiGoi();
  const bayGio = Date.now();
  return db.can
    .filter((c) => c.tai_khoan_id === tk.id && c.an_luc === null)
    .sort((a, b) => a.tao_luc.localeCompare(b.tao_luc) || a.id.localeCompare(b.id, "en", { numeric: true }))
    .map((c) => ({
      ...raCan(c, bayGio),
      ...giaTuanNay(c),
      loai: laTuNhap(c) ? ("tu_nhap" as const) : ("co_lich" as const),
      ...(laTuNhap(c) ? { ten_chu_can: c.ten_chu_can ?? "", tinh_trang_hom_nay: null } : { tinh_trang_hom_nay: tinhTrangHomNay(c) }),
    }));
}

// ---- US11 · Tòa nhà dùng chung, thêm và sửa căn (api/can-anh.md). Server thật: src/server/api/can.js, toa-nha.js ----

const MA_LOAI_VIEW = ["bien", "thanh_pho", "nui"];
// Tìm không phân biệt hoa thường và dấu tiếng Việt (GET /toa-nha q)
const boDau = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase();
const gonTen = (s: string) => s.trim().replace(/\s+/g, " ");

const raToa = (t: ToaLuu, tk: TaiKhoanLuu): ToaNha => ({
  id: t.id,
  ten: t.ten,
  khu_vuc: t.khu_vuc,
  da_dung: db.can.some((c) => c.tai_khoan_id === tk.id && c.an_luc === null && c.toa_nha === t.ten),
});

// GET /toa-nha?q=&gioi_han= (api/can-anh.md). Có q: mọi tòa có tên chứa q, tòa da_dung trước rồi theo tên (US11-NT3, NT6).
// Không có q: tòa người gọi đã dùng, rồi tòa Home247 đặt sẵn (server.md 2.4; CH-063 chưa chốt có cả tòa người khác thêm không).
// Không trả tao_boi: người dùng không cần biết ai thêm tòa.
export async function getToaNha(q: { q?: string; gioi_han?: number } = {}): Promise<ToaNha[]> {
  await cho();
  const tk = nguoiGoi();
  const chu = q.q === undefined ? undefined : q.q.trim();
  if (chu !== undefined && (chu.length < 1 || chu.length > 50)) throw new LoiApi("DU_LIEU_SAI", "", "q");
  if (q.gioi_han !== undefined && (!Number.isInteger(q.gioi_han) || q.gioi_han < 1 || q.gioi_han > 50)) {
    throw new LoiApi("DU_LIEU_SAI", "", "gioi_han");
  }
  let ds = db.toa_nha.map((t) => raToa(t, tk));
  if (chu === undefined) ds = ds.filter((t) => t.da_dung || db.toa_nha.find((x) => x.id === t.id)!.tao_boi === null);
  else ds = ds.filter((t) => boDau(t.ten).includes(boDau(chu)));
  ds.sort((a, b) => Number(b.da_dung) - Number(a.da_dung) || a.ten.localeCompare(b.ten, "vi"));
  return ds.slice(0, q.gioi_han ?? 20);
}

// POST /toa-nha { ten, khu_vuc? } (api/can-anh.md): thêm một dòng vào danh sách chung, không cần duyệt (quy tắc Tòa nhà dùng chung).
// Chỉ thêm, không có đường sửa tòa có sẵn: gửi id, tao_boi hay trường lạ thì DU_LIEU_SAI. Tên trùng tòa đã có (không phân biệt
// hoa thường, dấu) vẫn tạo tòa mới (US11, Tùng quyết 04/11/2026: màn tìm tòa chỉ gợi ý tòa có sẵn, người dùng vẫn được tạo mới).
// Server giả lấy tên làm id nên tòa trùng đúng tên nhận id có hậu tố "#n"; căn vẫn ghi theo tên, nên hai tòa trùng đúng tên
// còn lẫn nhau ở phía căn. Server thật dùng id riêng (EN52).
export async function postToaNha(than: { ten: string; khu_vuc?: string | null }, khoa: string): Promise<ToaNha> {
  await cho();
  const tk = nguoiGoi();
  const la = than as Record<string, unknown>;
  for (const k of Object.keys(la)) if (k !== "ten" && k !== "khu_vuc") throw new LoiApi("DU_LIEU_SAI", "", k);
  const ten = typeof la.ten === "string" ? gonTen(la.ten) : "";
  if (ten.length < 1 || ten.length > 100) throw new LoiApi("DU_LIEU_SAI", "", "ten");
  const kv = la.khu_vuc === undefined || la.khu_vuc === null ? null : typeof la.khu_vuc === "string" ? gonTen(la.khu_vuc) : undefined;
  if (kv === undefined || (kv !== null && (kv.length < 1 || kv.length > 100))) throw new LoiApi("DU_LIEU_SAI", "", "khu_vuc");
  if (khoa.length < 16 || khoa.length > 64) throw new LoiApi("DU_LIEU_SAI", "", "Idempotency-Key");
  return motLan(tk, "POST /toa-nha", khoa, () => {
    let id = ten;
    for (let n = 2; db.toa_nha.some((x) => x.id === id); n++) id = `${ten}#${n}`;
    const t: ToaLuu = { id, ten, khu_vuc: kv, tao_boi: tk.id };
    db.toa_nha.push(t);
    return raToa(t, tk);
  });
}

// Kiểm phần thông tin thêm của POST /can và PATCH /can/:id. Chỉ trả trường có trong thân; toa_nha là tên tòa (server giả).
const kiemPhanMoRong = (than: {
  so_giuong?: unknown;
  loai_view?: unknown;
  toa_nha_id?: unknown;
  mo_ta_gui_khach?: unknown;
}): { so_giuong?: number | null; loai_view?: string | null; toa_nha?: string | null; mo_ta_gui_khach?: string | null } => {
  const kq: ReturnType<typeof kiemPhanMoRong> = {};
  if (than.so_giuong !== undefined) {
    const v = than.so_giuong;
    if (v !== null && !(Number.isInteger(v) && (v as number) >= 1 && (v as number) <= 50)) throw new LoiApi("DU_LIEU_SAI", "", "so_giuong");
    kq.so_giuong = v as number | null;
  }
  if (than.loai_view !== undefined) {
    const v = than.loai_view;
    if (v !== null && !MA_LOAI_VIEW.includes(v as string)) throw new LoiApi("DU_LIEU_SAI", "", "loai_view");
    kq.loai_view = v as string | null;
  }
  if (than.toa_nha_id !== undefined) {
    const v = than.toa_nha_id;
    if (v === null) kq.toa_nha = null;
    else {
      const t = db.toa_nha.find((x) => x.id === v);
      if (!t) throw new LoiApi("DU_LIEU_SAI", "", "toa_nha_id");
      kq.toa_nha = t.ten;
    }
  }
  if (than.mo_ta_gui_khach !== undefined) {
    const v = than.mo_ta_gui_khach;
    if (v !== null && (typeof v !== "string" || v.length > 2000)) throw new LoiApi("DU_LIEU_SAI", "", "mo_ta_gui_khach");
    kq.mo_ta_gui_khach = v as string | null;
  }
  return kq;
};

// Căn mẫu DLM chỉ có số ảnh, chưa có dòng ảnh. Lần đầu mở chi tiết thì dựng ảnh giả đúng số đó để CN5-02 có ảnh thật mà sửa.
const MAU_ANH_GIA = ["#0ea5e9", "#f59e0b", "#10b981", "#8b5cf6", "#ef4444", "#14b8a6"];
const dungAnhMau = (c: CanLuu) => {
  if (c.so_anh === 0 || db.anh.some((a) => a.can_id === c.id)) return;
  for (let i = 1; i <= c.so_anh; i++) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><rect width="160" height="160" fill="${MAU_ANH_GIA[i % MAU_ANH_GIA.length]}"/><text x="80" y="95" font-size="48" text-anchor="middle" fill="#fff">${i}</text></svg>`;
    db.anh.push({
      id: idMoi("anh"),
      tai_khoan_id: c.tai_khoan_id,
      can_id: c.id,
      thu_tu: i,
      nguon: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`,
      tao_luc: c.tao_luc,
    });
  }
};

const raCanChiTiet = (c: CanLuu): CanChiTiet => {
  const toa = c.toa_nha ? db.toa_nha.find((t) => t.ten === c.toa_nha) : undefined;
  const bay = Date.now();
  return {
    id: c.id,
    ma_can: c.ma_can,
    so_phong_ngu: c.so_phong_ngu,
    so_giuong: c.so_giuong,
    loai_view: c.loai_view,
    toa_nha: c.toa_nha ? { id: toa?.id ?? c.toa_nha, ten: c.toa_nha, khu_vuc: toa?.khu_vuc ?? null } : null,
    mo_ta_gui_khach: c.mo_ta_gui_khach ?? null,
    anh: db.anh
      .filter((a) => a.can_id === c.id)
      .sort((a, b) => (a.thu_tu ?? 0) - (b.thu_tu ?? 0))
      .map((a) => ({ id: a.id, thu_tu: a.thu_tu ?? 0, duong_dan_xem: a.nguon, het_han_luc: new Date(bay + MOT_GIO_MS).toISOString() })),
    tao_luc: c.tao_luc,
    ...(laTuNhap(c)
      ? {
          loai: "tu_nhap" as const,
          ten_chu_can: c.ten_chu_can ?? "",
          sdt_chu_can: c.sdt_chu_can ?? null,
          gia_chu_thuong: c.gia_chu_thuong ?? null,
          gia_chu_cuoi_tuan: c.gia_chu_cuoi_tuan ?? null,
          dat_phong_da_ghi: datPhongDaGhi(c),
        }
      : {}),
  };
};

// Đặt phòng sale đã ghi cho căn tự nhập, mới trước (api/can-anh.md GET /can/:id). tien_chenh = thu khách trừ trả chủ (QT3).
const datPhongDaGhi = (c: CanLuu): DatPhongDaGhi[] =>
  db.booking
    .filter((b) => b.can_id === c.id && b.nguon === "sale_tu_ghi")
    .sort((a, b) => b.ngay_nhan.localeCompare(a.ngay_nhan) || b.id.localeCompare(a.id, "en", { numeric: true }))
    .map((b) => ({
      id: b.id,
      ngay_nhan: b.ngay_nhan,
      ngay_tra: b.ngay_tra,
      tien_phong: b.tien_phong ?? 0,
      gia_ban: b.gia_ban ?? 0,
      tien_chenh: (b.gia_ban ?? 0) - (b.tien_phong ?? 0),
    }));

// Căn có lịch của người gọi, chưa ẩn; căn người khác hay không có thì KHONG_TIM_THAY (PQ3.CHU, PQ3.SALE)
const canCuaToiTheoId = (canId: string): CanLuu => {
  const tk = nguoiGoi();
  const c = db.can.find((x) => x.id === canId && x.tai_khoan_id === tk.id && x.an_luc === null);
  if (!c) throw new LoiApi("KHONG_TIM_THAY");
  return c;
};

// GET /can/:id (api/can-anh.md): mọi trường và ảnh theo thứ tự (mục "Sửa thông tin căn" (US11) bước 1)
export async function getCanChiTiet(canId: string): Promise<CanChiTiet> {
  await cho();
  const c = canCuaToiTheoId(canId);
  dungAnhMau(c);
  return raCanChiTiet(c);
}

// Bốn trường chỉ căn tự nhập có (api/can-anh.md). Căn có lịch gửi các trường này thì DU_LIEU_SAI kèm `o`.
const TRUONG_TU_NHAP = ["ten_chu_can", "sdt_chu_can", "gia_chu_thuong", "gia_chu_cuoi_tuan"];
const chuanSdtChuCan = (v: unknown): string | null => {
  const so = typeof v === "string" ? v.replace(/[\s.\-]/g, "") : "";
  return /^\+?\d{9,15}$/.test(so) ? so : null;
};
// Kiểm bốn trường theo api/can-anh.md; chỉ trả trường có trong thân. sdt_chu_can null là xóa số (QD11, US16-NT27).
const kiemTruongTuNhap = (la: Record<string, unknown>, laCanTuNhap: boolean): Partial<Pick<CanLuu, "ten_chu_can" | "sdt_chu_can" | "gia_chu_thuong" | "gia_chu_cuoi_tuan">> => {
  const co = TRUONG_TU_NHAP.filter((k) => la[k] !== undefined);
  if (!laCanTuNhap) {
    if (co.length) throw new LoiApi("DU_LIEU_SAI", "", co[0]);
    return {};
  }
  const kq: Partial<Pick<CanLuu, "ten_chu_can" | "sdt_chu_can" | "gia_chu_thuong" | "gia_chu_cuoi_tuan">> = {};
  if (la.ten_chu_can !== undefined) {
    const ten = typeof la.ten_chu_can === "string" ? la.ten_chu_can.trim() : "";
    if (ten.length < 1 || ten.length > 100) throw new LoiApi("DU_LIEU_SAI", "", "ten_chu_can");
    kq.ten_chu_can = ten;
  }
  if (la.sdt_chu_can !== undefined) {
    if (la.sdt_chu_can === null) kq.sdt_chu_can = null;
    else {
      const so = chuanSdtChuCan(la.sdt_chu_can);
      if (!so) throw new LoiApi("DU_LIEU_SAI", "", "sdt_chu_can");
      kq.sdt_chu_can = so;
    }
  }
  for (const k of ["gia_chu_thuong", "gia_chu_cuoi_tuan"] as const) {
    if (la[k] === undefined) continue;
    if (la[k] !== null && !laTien(la[k])) throw new LoiApi("DU_LIEU_SAI", "", k);
    kq[k] = la[k] as number | null;
  }
  return kq;
};

// PATCH /can/:id (api/can-anh.md): chỉ gửi trường muốn đổi. anh_ids là danh sách ảnh đầy đủ theo thứ tự, ảnh số 1 là ảnh đại diện
// (US11-NT9); ảnh cũ không còn trong mảng thì bị xóa; so_giuong null là xóa trống (US11-NT11); mã trùng căn khác của cùng chủ
// thì MA_CAN_TRUNG (US11-NT10). Một giao dịch: lỗi thì không đổi gì. Cùng Idempotency-Key thì trả kết quả cũ.
export async function patchCan(canId: string, than: ThanSuaCan, khoa: string): Promise<CanChiTiet> {
  await cho();
  const tk = nguoiGoi();
  const c = canCuaToiTheoId(canId);
  const la = than as Record<string, unknown>;
  for (const k of Object.keys(la)) {
    if (!["ma_can", "so_phong_ngu", "so_giuong", "loai_view", "toa_nha_id", "mo_ta_gui_khach", "anh_ids", ...TRUONG_TU_NHAP].includes(k)) {
      throw new LoiApi("DU_LIEU_SAI", "", k);
    }
  }
  if (khoa.length < 16 || khoa.length > 64) throw new LoiApi("DU_LIEU_SAI", "", "Idempotency-Key");
  const tuNhap = kiemTruongTuNhap(than as Record<string, unknown>, laTuNhap(c));
  const rong = kiemPhanMoRong(than);
  let ma: string | undefined;
  if (than.ma_can !== undefined) {
    ma = typeof than.ma_can === "string" ? than.ma_can.trim() : "";
    if (ma.length < 1 || ma.length > 50) throw new LoiApi("DU_LIEU_SAI", "", "ma_can");
  }
  if (than.so_phong_ngu !== undefined && ![0, 1, 2, 3, 4].includes(than.so_phong_ngu as number)) {
    throw new LoiApi("DU_LIEU_SAI", "", "so_phong_ngu");
  }
  return motLan(tk, `PATCH /can/${canId}`, khoa, () => {
    dungAnhMau(c);
    let anhGiu: AnhLuu[] | undefined;
    if (than.anh_ids !== undefined) {
      const ids = than.anh_ids;
      if (!Array.isArray(ids) || ids.length > MAX_ANH_CAN || new Set(ids).size !== ids.length) throw new LoiApi("DU_LIEU_SAI", "", "anh_ids");
      // Mỗi id là ảnh đang gắn căn này hoặc ảnh tạm của chính người gọi chưa gắn căn nào
      const tim = ids.map((id) => db.anh.find((a) => a.id === id && (a.can_id === c.id || (a.can_id === null && a.tai_khoan_id === tk.id))));
      if (tim.some((a) => !a)) throw new LoiApi("DU_LIEU_SAI", "", "anh_ids");
      anhGiu = tim as AnhLuu[];
    }
    if (ma !== undefined && db.can.some((x) => x.id !== c.id && x.tai_khoan_id === tk.id && x.an_luc === null && x.ma_can === ma)) {
      throw new LoiApi("MA_CAN_TRUNG", `Đã có căn ${ma}`, "ma_can");
    }
    // Qua hết kiểm tra mới ghi
    if (ma !== undefined) c.ma_can = ma;
    if (than.so_phong_ngu !== undefined) c.so_phong_ngu = than.so_phong_ngu;
    if (rong.so_giuong !== undefined) c.so_giuong = rong.so_giuong;
    if (rong.loai_view !== undefined) c.loai_view = rong.loai_view;
    if (rong.toa_nha !== undefined) c.toa_nha = rong.toa_nha;
    if (rong.mo_ta_gui_khach !== undefined) c.mo_ta_gui_khach = rong.mo_ta_gui_khach;
    Object.assign(c, tuNhap);
    if (anhGiu) {
      const giu = new Set(anhGiu.map((a) => a.id));
      db.anh = db.anh.filter((a) => a.can_id !== c.id || giu.has(a.id));
      anhGiu.forEach((a, i) => {
        a.can_id = c.id;
        a.thu_tu = i + 1;
      });
      c.so_anh = anhGiu.length;
    }
    return raCanChiTiet(c);
  });
}

// POST /can (server.md 2.4): cần mã căn và số phòng ngủ (nhóm Căn và giá quy tắc Căn tối thiểu);
// mã trùng căn chưa ẩn của cùng chủ thì MA_CAN_TRUNG (nhóm Căn và giá quy tắc Mã căn không trùng)
// US16 (mục "Thêm căn tự nhập" (US16) bước 7): loai "tu_nhap" chỉ sale; cần ten_chu_can, sdt_chu_can; giá chủ không bắt buộc (US16-NT17).
export async function postCan(body: ThanPostCan, khoa?: string): Promise<Can> {
  await cho();
  const tk = nguoiGoi();
  const loai = body.loai ?? "co_lich";
  if (loai !== "co_lich" && loai !== "tu_nhap") throw new LoiApi("DU_LIEU_SAI", "", "loai");
  if (loai === "tu_nhap" && tk.vai_chon !== "sale") throw new LoiApi("DU_LIEU_SAI", "", "loai"); // PQ14.CHU
  const ma = (body.ma_can ?? "").trim();
  if (!ma) throw new LoiApi("DU_LIEU_SAI", "", "ma_can");
  if (body.so_phong_ngu === null || ![0, 1, 2, 3, 4].includes(body.so_phong_ngu)) {
    throw new LoiApi("DU_LIEU_SAI", "", "so_phong_ngu");
  }
  const rong = kiemPhanMoRong(body);
  const anhIds = body.anh_ids ?? [];
  if (anhIds.length > MAX_ANH_CAN) throw new LoiApi("DU_LIEU_SAI", "", "anh_ids");
  // Mỗi id là ảnh tạm của chính người gọi, chưa gắn căn, không trùng nhau (api/can-anh.md POST /can)
  const anhGan = anhIds.map((id) => db.anh.find((a) => a.id === id && a.tai_khoan_id === tk.id && a.can_id === null));
  if (new Set(anhIds).size !== anhIds.length || anhGan.some((a) => !a)) throw new LoiApi("DU_LIEU_SAI", "", "anh_ids");
  const tuNhap = kiemTruongTuNhap(body as Record<string, unknown>, loai === "tu_nhap");
  if (loai === "tu_nhap") {
    if (tuNhap.ten_chu_can === undefined) throw new LoiApi("DU_LIEU_SAI", "", "ten_chu_can");
    if (!tuNhap.sdt_chu_can) throw new LoiApi("DU_LIEU_SAI", "", "sdt_chu_can");
  }
  const trung = db.can.some((c) => c.tai_khoan_id === tk.id && c.an_luc === null && c.ma_can === ma);
  if (trung) throw new LoiApi("MA_CAN_TRUNG", `Đã có căn ${ma}`, "ma_can");
  const can: CanLuu = {
    id: idMoi("can"),
    tai_khoan_id: tk.id,
    ma_can: ma,
    so_phong_ngu: body.so_phong_ngu,
    so_giuong: rong.so_giuong ?? null,
    loai_view: rong.loai_view ?? null,
    toa_nha: rong.toa_nha ?? null,
    mo_ta_gui_khach: rong.mo_ta_gui_khach ?? null,
    so_anh: anhIds.length,
    tao_luc: new Date().toISOString(),
    an_luc: null,
    ...(loai === "tu_nhap" ? { loai: "tu_nhap" as const, gia_chu_thuong: null, gia_chu_cuoi_tuan: null, ...tuNhap } : {}),
  };
  db.can.push(can);
  // Thứ tự mảng anh_ids là thu_tu, phần tử đầu là ảnh đại diện (mục "Ảnh khi thêm căn" (US25) bước 3)
  anhGan.forEach((a, i) => {
    a!.can_id = can.id;
    a!.thu_tu = i + 1;
  });
  return loai === "tu_nhap" ? { ...raCan(can), loai: "tu_nhap", ten_chu_can: can.ten_chu_can } : raCan(can);
}

// DELETE /can/:id (api/can-anh.md). Căn tự nhập: xóa thật căn và mọi đặt phòng sale_tu_ghi, ảnh, mức cộng, lần gửi khách (mục "Chi tiết căn tự nhập" (US16) bước 7),
// chỉ sale tạo (PQ14.SALE). Căn có lịch: ẩn căn (mục "Xóa căn" (US27)), chỉ chủ nhà của căn (PQ3.CHU); còn đặt phòng có ngày trả sau hôm nay (giờ VN)
// hoặc yêu cầu đang chờ chủ chưa quá hạn thì CAN_CON_DAT_PHONG, căn giữ nguyên; đặt phòng đã hủy không tính (QD21).
// Ẩn xong chỉ đặt an_luc: đặt phòng, tiền, ảnh, giá giữ nguyên, căn biến khỏi getCan, lịch, tìm phòng (các hàm đọc đã lọc an_luc).
// Căn của người khác, căn đã ẩn, sale xóa căn của chủ nhà: KHONG_TIM_THAY (PQ3.SALE).
export async function deleteCan(canId: string, khoa: string): Promise<KetQuaXoaCan> {
  await cho();
  const tk = nguoiGoi();
  if (khoa.length < 16 || khoa.length > 64) throw new LoiApi("DU_LIEU_SAI", "", "Idempotency-Key");
  return motLan(tk, `DELETE /can/${canId}`, khoa, () => {
    const c = db.can.find((x) => x.id === canId && x.tai_khoan_id === tk.id && x.an_luc === null);
    if (!c) throw new LoiApi("KHONG_TIM_THAY");
    if (!laTuNhap(c)) {
      const hom = homNay();
      const conBooking = db.booking.some((b) => b.can_id === c.id && b.trang_thai !== "da_huy" && b.ngay_tra > hom);
      const conYeuCau = db.yeu_cau.some((y) => y.can_id === c.id && trangThaiYC(y) === "cho_chu");
      if (conBooking || conYeuCau) throw new LoiApi("CAN_CON_DAT_PHONG", "Căn còn đặt phòng sắp tới");
      c.an_luc = new Date().toISOString();
      return { id: c.id, ket_qua: "an" as const, an_luc: c.an_luc };
    }
    db.can = db.can.filter((x) => x.id !== c.id);
    db.anh = db.anh.filter((a) => a.can_id !== c.id);
    db.booking = db.booking.filter((b) => b.can_id !== c.id);
    db.muc_cong = db.muc_cong.filter((m) => m.can_id !== c.id);
    db.lan_gui_khach = db.lan_gui_khach.filter((l) => l.can_id !== c.id);
    return { id: c.id, ket_qua: "xoa" as const, an_luc: null };
  });
}

// Căn có lịch của người gọi theo thứ tự tạo căn (api/lich-dat-phong.md). Căn tự nhập của sale chưa có (US6).
const canCoLichCua = (tk: TaiKhoanLuu) =>
  db.can
    .filter((c) => c.tai_khoan_id === tk.id && c.an_luc === null && !laTuNhap(c))
    .sort((a, b) => a.tao_luc.localeCompare(b.tao_luc) || a.id.localeCompare(b.id, "en", { numeric: true }));

const chiemDem = (b: BookingLuu) => b.trang_thai !== "da_huy"; // QD21: đã hủy không chiếm đêm

// GET /lich/thang?thang=&can_id= (server.md 2.5, PQ4.CHU): căn nào có khách đêm nào trong tháng
export async function getLichThang(q: { thang: string; can_id?: string }): Promise<LichThang> {
  await cho();
  const tk = nguoiGoi();
  if (!laThang(q.thang ?? "")) throw new LoiApi("DU_LIEU_SAI", "", "thang");
  const cuaToi = canCoLichCua(tk);
  const ds = q.can_id === undefined ? cuaToi : cuaToi.filter((c) => c.id === q.can_id);
  if (ds.length === 0 && q.can_id !== undefined) throw new LoiApi("KHONG_TIM_THAY");
  const theoNgay = new Map<string, string[]>();
  for (const c of ds) {
    for (const b of db.booking) {
      if (b.can_id !== c.id || !chiemDem(b)) continue;
      for (const d of cacDem(b.ngay_nhan, b.ngay_tra)) {
        if (thangCua(d) === q.thang) theoNgay.set(d, [...(theoNgay.get(d) ?? []), c.id]);
      }
    }
  }
  const idCuaToi = new Set(cuaToi.map((c) => c.id));
  return {
    thang: q.thang,
    can: ds.map((c) => ({ can_id: c.id, ma_can: c.ma_can })),
    ngay: [...theoNgay.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([ngay, can_ids]) => ({ ngay, can_ids })),
    co_dat_phong_nao: db.booking.some((b) => idCuaToi.has(b.can_id) && chiemDem(b)),
  };
}

// GET /lich/ngay?ngay= (server.md 2.5, PQ4.CHU): từng căn của người gọi trong ngày đó, trống hay có đặt phòng
export async function getLichNgay(q: { ngay: string }): Promise<LichNgay> {
  await cho();
  const tk = nguoiGoi();
  if (!laNgay(q.ngay ?? "")) throw new LoiApi("DU_LIEU_SAI", "", "ngay");
  return {
    ngay: q.ngay,
    can: canCoLichCua(tk).map((c) => {
      // QT2.1: có khách đêm ngay khi ngày nhận <= ngay < ngày trả
      const b = db.booking.find((b) => b.can_id === c.id && chiemDem(b) && b.ngay_nhan <= q.ngay && q.ngay < b.ngay_tra);
      return {
        can_id: c.id,
        ma_can: c.ma_can,
        trong: !b,
        dat_phong: b
          ? {
              id: b.id,
              nguoi_dat: nguoiDat(b),
              ngay_nhan: b.ngay_nhan,
              ngay_tra: b.ngay_tra,
              so_dem: cacDem(b.ngay_nhan, b.ngay_tra).length,
              tien_phong: b.tien_phong ?? 0,
              trang_thai_tien: b.trang_thai_tien ?? null,
              tien_coc: b.trang_thai_tien === "da_coc_con_thu" ? b.tien_coc ?? null : null,
              ghi_chu: b.ghi_chu ?? null,
              trang_thai: b.trang_thai === "cho_huy" ? "cho_huy" : "hieu_luc",
            }
          : null,
      };
    }),
  };
}

// Giá từng đêm của một đặt phòng (booking_dem). Đặt phòng ghi trực tiếp chưa có thì chia đều tiền phòng (QT4.2).
const demCuaBooking = (b: BookingLuu) =>
  b.dem ?? chiaTienTheoDem(cacDem(b.ngay_nhan, b.ngay_tra).map((ngay) => ({ ngay, gia_chu: null })), b.tien_phong ?? 0);

// GET /lich/tom-tat?thang=&can_id= (api/lich-dat-phong.md, PQ16.CHU): doanh thu và số đêm theo tháng của đêm (QD14, QT2.2),
// bỏ đặt phòng đã hủy (QD21). Tính theo chủ nhà là người gọi, kể cả căn đã ẩn [MỞ: DC53 câu hỏi mở 14].
export async function getLichTomTat(q: { thang: string; can_id?: string }): Promise<TomTatThang> {
  await cho();
  const tk = nguoiGoi();
  if (!laThang(q.thang ?? "")) throw new LoiApi("DU_LIEU_SAI", "", "thang");
  const cuaToi = canCoLichCua(tk);
  if (q.can_id !== undefined && !cuaToi.some((c) => c.id === q.can_id)) throw new LoiApi("KHONG_TIM_THAY");
  const idTinh = new Set(db.can.filter((c) => c.tai_khoan_id === tk.id && !laTuNhap(c) && (q.can_id === undefined || c.id === q.can_id)).map((c) => c.id));
  const truoc = congThang(q.thang, -1);
  let doanhThu = 0;
  let doanhThuTruoc = 0;
  let soDem = 0;
  for (const b of db.booking) {
    if (!idTinh.has(b.can_id) || !chiemDem(b)) continue;
    for (const d of demCuaBooking(b)) {
      if (thangCua(d.ngay) === q.thang) {
        doanhThu += d.gia_chu;
        soDem++;
      } else if (thangCua(d.ngay) === truoc) doanhThuTruoc += d.gia_chu;
    }
  }
  if (q.can_id === undefined) doanhThuTruoc += db.doanh_thu_cu[truoc] ?? 0;
  return {
    thang: q.thang,
    doanh_thu: doanhThu,
    doanh_thu_thang_truoc: doanhThuTruoc,
    so_dem_co_khach: soDem,
    so_can: cuaToi.filter((c) => q.can_id === undefined || c.id === q.can_id).length,
  };
}

// GET /thong-ke/chu?thang=&so_thang= (api/thong-bao-thong-ke-xuat.md, PQ16.CHU, PQ11.CHU): số liệu một tháng của chủ nhà gọi.
// Theo tháng của đêm (QD14, QT2.2, QT4.2), bỏ đặt phòng đã hủy (QD21), kể cả căn đã ẩn (mục "Xóa căn" (US27)). Sale (vai đã chọn): KHONG_DUOC_PHEP (PQ16.SALE).
// theo_can chỉ căn có lịch chưa ẩn, kể cả căn 0đ; theo_nguoi_ban giảm dần, không giá bán, tiền chênh. Chưa có khối chua_thu
// (US18-TA2, còn [MỞ: mục "Chưa thu tiền" (US18) bước 1, DC53 US18-Q1]). Tháng cũ của dữ liệu mẫu chỉ có tổng (doanh_thu_cu) cộng vào doanh thu tháng đó.
export async function getThongKeChu(q: { thang: string; so_thang?: number }): Promise<ThongKeChu> {
  await cho();
  const tk = nguoiGoi();
  if (tk.vai_chon === "sale") throw new LoiApi("KHONG_DUOC_PHEP");
  if (!laThang(q.thang ?? "") || q.thang < "2020-01" || q.thang > "2100-12") throw new LoiApi("DU_LIEU_SAI", "", "thang");
  const soThang = q.so_thang ?? 1;
  if (!Number.isInteger(soThang) || soThang < 1 || soThang > 12) throw new LoiApi("DU_LIEU_SAI", "", "so_thang");
  const truoc = congThang(q.thang, -1);
  const chuoi = Array.from({ length: soThang }, (_, i) => congThang(q.thang, i - soThang + 1));
  const cuaToi = new Set(db.can.filter((c) => c.tai_khoan_id === tk.id && !laTuNhap(c)).map((c) => c.id));
  const tienThang = new Map<string, number>();
  const demThang = new Map<string, number>();
  const tienCan = new Map<string, number>();
  const nguoiBan = new Map<string, ThongKeTheoNguoiBan>();
  for (const b of db.booking) {
    if (!cuaToi.has(b.can_id) || !chiemDem(b)) continue;
    for (const d of demCuaBooking(b)) {
      const t = thangCua(d.ngay);
      tienThang.set(t, (tienThang.get(t) ?? 0) + d.gia_chu);
      demThang.set(t, (demThang.get(t) ?? 0) + 1);
      if (t !== q.thang) continue;
      tienCan.set(b.can_id, (tienCan.get(b.can_id) ?? 0) + d.gia_chu);
      const khoa = b.ten_sale ? `s|${b.sale_id ?? b.ten_sale}` : "khach_le";
      const dong = nguoiBan.get(khoa) ?? {
        sale_id: b.ten_sale ? b.sale_id ?? null : null,
        ten: b.ten_sale ?? "Khách lẻ",
        la_khach_le: !b.ten_sale,
        da_xoa_tai_khoan: false,
        doanh_thu: 0,
      };
      dong.doanh_thu += d.gia_chu;
      nguoiBan.set(khoa, dong);
    }
  }
  const tien = (t: string) => (tienThang.get(t) ?? 0) + (db.doanh_thu_cu[t] ?? 0);
  const can = canCoLichCua(tk);
  const [nam, thangSo] = q.thang.split("-").map(Number);
  return {
    thang: q.thang,
    doanh_thu: tien(q.thang),
    doanh_thu_thang_truoc: tien(truoc),
    theo_can: can.map((c) => ({ can_id: c.id, ma_can: c.ma_can, ten_toa_nha: c.toa_nha ?? null, doanh_thu: tienCan.get(c.id) ?? 0 })),
    dem_co_khach: demThang.get(q.thang) ?? 0,
    dem_co_khach_thang_truoc: demThang.get(truoc) ?? 0,
    so_dem_trong_thang: new Date(Date.UTC(nam, thangSo, 0)).getUTCDate(),
    so_can_cong_suat: can.length,
    // Bằng tiền thì sale trước khách lẻ, rồi theo tên (như server) để thứ tự không đổi giữa hai lần gọi
    theo_nguoi_ban: [...nguoiBan.values()].sort(
      (a, b) => b.doanh_thu - a.doanh_thu || Number(a.la_khach_le) - Number(b.la_khach_le) || a.ten.localeCompare(b.ten, "vi"),
    ),
    chuoi_thang: chuoi.map((t) => ({ thang: t, doanh_thu: tien(t) })),
  };
}

// GET /booking/sap-toi (PQ7.CHU, PQ9.CHU): đặt phòng có ngày trả sau hôm nay giờ Việt Nam, xếp theo ngày nhận rồi id.
// Bỏ đã hủy, không giới hạn tháng [MỞ: DC53 câu hỏi mở 12, 13]. Server giả chỉ có một trang nên truoc_tiep luôn null.
export async function getBookingSapToi(q: { gioi_han?: number } = {}): Promise<SapToi> {
  await cho();
  const tk = nguoiGoi();
  const gh = q.gioi_han ?? 50;
  if (!Number.isInteger(gh) || gh < 1 || gh > 100) throw new LoiApi("DU_LIEU_SAI", "", "gioi_han");
  const can = new Map(canCoLichCua(tk).map((c) => [c.id, c]));
  const muc = db.booking
    .filter((b) => can.has(b.can_id) && chiemDem(b) && b.ngay_tra > homNay())
    .sort((a, b) => a.ngay_nhan.localeCompare(b.ngay_nhan) || a.id.localeCompare(b.id, "en", { numeric: true }))
    .slice(0, gh)
    .map((b) => ({
      id: b.id,
      can_id: b.can_id,
      ma_can: can.get(b.can_id)!.ma_can,
      nguoi_dat: nguoiDat(b),
      ngay_nhan: b.ngay_nhan,
      ngay_tra: b.ngay_tra,
      so_dem: cacDem(b.ngay_nhan, b.ngay_tra).length,
      tien_phong: b.tien_phong ?? 0,
      trang_thai_tien: b.trang_thai_tien ?? ("chua_coc" as TrangThaiTien),
      tien_coc: b.trang_thai_tien === "da_coc_con_thu" ? b.tien_coc ?? null : null,
      trang_thai: b.trang_thai === "cho_huy" ? ("cho_huy" as const) : ("hieu_luc" as const),
    }));
  return { muc, truoc_tiep: null };
}

// GET /lich/tuan?tu=&toa_nha_id=&so_phong_ngu= (PQ4.CHU, PQ5.CHU): bảng căn x 7 ngày từ thứ hai. Ô trống có gia_dem theo
// server.md 1.8 (null khi chưa đặt giá), ô có khách có booking_id. Ba số tóm tắt tính theo tuần đang xem [MỞ: CH-016].
// Server giả dùng tên tòa làm id tòa.
export async function getLichTuan(q: { tu: string; toa_nha_id?: string; so_phong_ngu?: number }): Promise<LichTuan> {
  await cho();
  const tk = nguoiGoi();
  if (!laNgay(q.tu ?? "") || !laThuHai(q.tu)) throw new LoiApi("DU_LIEU_SAI", "", "tu");
  if (q.so_phong_ngu !== undefined && !(Number.isInteger(q.so_phong_ngu) && q.so_phong_ngu >= 0 && q.so_phong_ngu <= 4)) {
    throw new LoiApi("DU_LIEU_SAI", "", "so_phong_ngu");
  }
  const ds = canCoLichCua(tk).filter(
    (c) => (q.toa_nha_id === undefined || c.toa_nha === q.toa_nha_id) && (q.so_phong_ngu === undefined || c.so_phong_ngu === q.so_phong_ngu),
  );
  const ngay = Array.from({ length: 7 }, (_, i) => congNgay(q.tu, i));
  const den = ngay[6];
  const idCan = new Set(ds.map((c) => c.id));
  const trongTuan = db.booking.filter((b) => idCan.has(b.can_id) && chiemDem(b) && b.ngay_nhan <= den && q.tu < b.ngay_tra);
  const can = ds.map((c) => ({
    can_id: c.id,
    ma_can: c.ma_can,
    so_phong_ngu: c.so_phong_ngu,
    toa_nha: c.toa_nha ? { id: c.toa_nha, ten: c.toa_nha } : null,
    o: ngay.map((n) => {
      const b = trongTuan.find((x) => x.can_id === c.id && x.ngay_nhan <= n && n < x.ngay_tra);
      return { ngay: n, booking_id: b ? b.id : null, gia_dem: b ? null : giaDem(c, n) };
    }),
  }));
  const datPhong = [...trongTuan]
    .sort((a, b) => a.ngay_nhan.localeCompare(b.ngay_nhan) || a.id.localeCompare(b.id, "en", { numeric: true }))
    .map((b) => ({
      id: b.id,
      can_id: b.can_id,
      ngay_nhan: b.ngay_nhan,
      ngay_tra: b.ngay_tra,
      nguoi_dat: nguoiDat(b),
      trang_thai_tien: b.trang_thai_tien ?? ("chua_coc" as TrangThaiTien),
    }));
  const oTatCa = can.flatMap((c) => c.o);
  return {
    tu: q.tu,
    den,
    can,
    dat_phong: datPhong,
    tom_tat: {
      dem_co_khach: oTatCa.filter((o) => o.booking_id !== null).length,
      dat_phong_chua_coc: datPhong.filter((d) => d.trang_thai_tien === "chua_coc").length,
      dem_trong: oTatCa.filter((o) => o.booking_id === null).length,
    },
  };
}

// ---- Ghi đặt phòng (US3, api/lich-dat-phong.md). Server thật: src/server/api/booking.js ----

const nguoiDat = (b: BookingLuu): NguoiDat =>
  b.ten_sale
    ? { loai: "sale", sale_id: b.sale_id ?? null, ten: b.ten_sale, da_xoa_tai_khoan: false }
    : { loai: "khach_le", sale_id: null, ten: b.ten_khach ?? null, da_xoa_tai_khoan: false };

// Căn có lịch của người gọi; căn người khác hay không có thì KHONG_TIM_THAY (PQ7.CHU, PQ4.CHU)
const canCuaToi = (canId: string) => {
  const c = canCoLichCua(nguoiGoi()).find((c) => c.id === canId);
  if (!c) throw new LoiApi("KHONG_TIM_THAY");
  return c;
};

// gia_dem(can, ngay) của server.md 1.8: giá dịp, không thì giá tháng theo đêm T6, T7; không có thì null
// Đêm cuối tuần tính lúc đọc, theo cài đặt hiện tại của người giữ căn (mục "Ngày tính giá cuối tuần" (US11)); đặt phòng đã có giữ tiền riêng
const demCuoiTuanCua = (c: CanLuu) => db.tai_khoan.find((t) => t.id === c.tai_khoan_id)?.dem_cuoi_tuan ?? DEM_CUOI_TUAN_MAC_DINH;
const giaDem = (c: CanLuu, ngay: string): number | null => {
  // Căn tự nhập: giá chủ báo, thường hay cuối tuần theo đêm cuối tuần của sale (server.md 1.8); chưa nhập thì chưa có giá
  if (laTuNhap(c)) return (laCuoiTuan(ngay, demCuoiTuanCua(c)) ? c.gia_chu_cuoi_tuan : c.gia_chu_thuong) ?? null;
  const dip = c.gia?.dip.find((d) => d.tu_ngay <= ngay && ngay <= d.den_ngay);
  if (dip) return dip.gia_moi_dem;
  const t = c.gia?.thang[thangCua(ngay)];
  if (!t) return null;
  return laCuoiTuan(ngay, demCuoiTuanCua(c)) ? t.cuoi_tuan : t.thuong;
};

// boQuaId: đặt phòng đang sửa không tính là trùng với chính nó (QT1.2)
const demTrung = (canId: string, nhan: string, tra: string, boQuaId?: string) =>
  db.booking
    .filter((b) => b.id !== boQuaId && b.can_id === canId && chiemDem(b) && b.ngay_nhan < tra && nhan < b.ngay_tra)
    .flatMap((b) => cacDem(b.ngay_nhan, b.ngay_tra).filter((d) => nhan <= d && d < tra))
    .sort();

const kiemNgay = (nhan: string, tra: string) => {
  if (!laNgay(nhan ?? "")) throw new LoiApi("DU_LIEU_SAI", "", "ngay_nhan");
  if (!laNgay(tra ?? "") || tra <= nhan || cacDem(nhan, tra).length > 365) throw new LoiApi("DU_LIEU_SAI", "", "ngay_tra");
};

// Chia tiền phòng cho các đêm (QT4.2): đúng tổng bảng giá thì giữ giá từng đêm, không thì chia đều, lẻ dồn đêm cuối
export const chiaTienTheoDem = (gia: GiaDem[], tienPhong: number) => {
  const tong = gia.every((d) => d.gia_chu !== null) ? gia.reduce((t, d) => t + (d.gia_chu ?? 0), 0) : null;
  if (tong === tienPhong) return gia.map((d) => ({ ngay: d.ngay, gia_chu: d.gia_chu as number }));
  const phan = Math.floor(tienPhong / gia.length);
  return gia.map((d, i) => ({ ngay: d.ngay, gia_chu: i === gia.length - 1 ? tienPhong - phan * (gia.length - 1) : phan }));
};

// GET /booking/kiem-trung (server.md 2.6): chỉ để hiện sớm, lúc lưu vẫn kiểm lại
// bo_qua_id: id đặt phòng đang sửa, bỏ qua chính nó (QT1.2, mục "Sửa booking" (US10) bước 2). Đặt phòng của người khác thì KHONG_TIM_THAY.
export async function getKiemTrung(q: { can_id: string; ngay_nhan: string; ngay_tra: string; bo_qua_id?: string }): Promise<KiemTrung> {
  await cho();
  kiemNgay(q.ngay_nhan, q.ngay_tra);
  // Người giữ căn: chủ nhà (hay sale với căn của mình) với căn có lịch, sale với căn tự nhập (PQ14.SALE)
  const tk = nguoiGoi();
  const tn = db.can.find((x) => x.id === q.can_id && x.tai_khoan_id === tk.id && x.an_luc === null && laTuNhap(x));
  const c = tn ?? canCuaToi(q.can_id);
  if (q.bo_qua_id !== undefined) bookingCuaChu(q.bo_qua_id);
  const dem = cacDem(q.ngay_nhan, q.ngay_tra).map((ngay) => ({ ngay, gia_chu: giaDem(c, ngay) }));
  const trung = [...new Set(demTrung(c.id, q.ngay_nhan, q.ngay_tra, q.bo_qua_id))];
  const tongGiaChu = dem.every((d) => d.gia_chu !== null) ? dem.reduce((t, d) => t + (d.gia_chu ?? 0), 0) : null;
  const ban = tn ? cacDem(q.ngay_nhan, q.ngay_tra).map((ngay) => giaBanDem(tk, c, ngay)) : [];
  return {
    khong_trung: trung.length === 0,
    dem_trung: trung,
    so_dem: dem.length,
    dem,
    tong_gia_chu: tongGiaChu,
    // Chỉ căn tự nhập: giá chủ cộng mức cộng của sale (mục "Ghi booking đã chốt cho căn tự nhập" (US16) bước 4). null khi có đêm chưa có giá.
    ...(tn ? { tong_gia_ban: ban.some((g) => g === null) ? null : ban.reduce((t: number, g) => t + (g as number), 0) } : {}),
  };
}

// GET /booking/goi-y (server.md 2.6): đêm trống đầu tiên từ hôm nay, một đêm
export async function getGoiY(q: { can_id: string }): Promise<{ ngay_nhan: string | null; ngay_tra: string | null }> {
  await cho();
  const c = canCuaToi(q.can_id);
  for (let i = 0, d = homNay(); i < 365; i++, d = congNgay(d, 1)) {
    if (demTrung(c.id, d, congNgay(d, 1)).length === 0) return { ngay_nhan: d, ngay_tra: congNgay(d, 1) };
  }
  return { ngay_nhan: null, ngay_tra: null };
}

// GET /khach-le: tên khách lẻ chủ nhà đã nhập, mới trước, không trùng, tối đa 10
export async function getKhachLe(): Promise<{ muc: { ten_khach: string }[] }> {
  await cho();
  const ids = new Set(canCoLichCua(nguoiGoi()).map((c) => c.id));
  const ten: string[] = [];
  for (const b of [...db.booking].reverse()) {
    if (ids.has(b.can_id) && !b.ten_sale && b.ten_khach && !ten.includes(b.ten_khach)) ten.push(b.ten_khach);
  }
  return { muc: ten.slice(0, 10).map((ten_khach) => ({ ten_khach })) };
}

// GET /ket-noi, phần app dùng ở CN4: sale đã kết nối (ket-noi-link.md), theo thứ tự kết nối. Dữ liệu mẫu DLM.2.
// Sale chưa kết nối (thêm tay) và sale đã bị ngừng không có chip (US5-NT13, quy tắc Nhóm kết nối).
export async function getSaleKetNoi(): Promise<SaleKetNoi[]> {
  await cho();
  const tk = nguoiGoi();
  return db.ket_noi.filter((k) => k.chu_nha_id === tk.id && k.trang_thai === "da_ket_noi").map((k) => ({ sale_id: k.id, ten: tenKetNoi(k) }));
}

const LUC_MAU = "2026-10-06T15:05:00+07:00"; // DLM.6: B1 thành lúc 15:05 ngày 06/10 (đặt phòng nạp sẵn chưa có tao_luc)

// Người bán phía chủ nhà thấy, kèm số điện thoại sale nếu sale đã cho (PQ2.CHU). Dạng GET /booking/:id.
const nguoiDatChiTiet = (b: BookingLuu): NguoiDat => {
  const nd = nguoiDat(b);
  const so = b.ten_sale ? db.ket_noi.find((k) => k.id === b.sale_id)?.so_dien_thoai : null;
  return so ? { ...nd, so_dien_thoai: so } : nd;
};

// Dạng CHU của GET /booking/:id: tien_coc chỉ khi da_coc_con_thu, tien_con_lai tính lúc đọc (nhóm Booking quy tắc Tiền còn lại),
// không có gia_ban, tien_chenh, khách của sale (QD11, PQ11.CHU). Khách lẻ chủ nhà nhập thì có ten_khach.
const raDatPhong = (b: BookingLuu, c: CanLuu): DatPhong => {
  const tt = b.trang_thai_tien ?? "chua_coc";
  const coc = tt === "da_coc_con_thu" ? b.tien_coc ?? null : null;
  const laSale = !!b.ten_sale || !!b.sale_id;
  return {
    id: b.id,
    can_id: c.id,
    ma_can: c.ma_can,
    trang_thai: b.trang_thai,
    ngay_nhan: b.ngay_nhan,
    ngay_tra: b.ngay_tra,
    so_dem: cacDem(b.ngay_nhan, b.ngay_tra).length,
    nguoi_dat: nguoiDatChiTiet(b),
    tien_phong: b.tien_phong ?? 0,
    trang_thai_tien: tt,
    tien_coc: coc,
    tien_con_lai: tt === "da_thanh_toan" ? 0 : (b.tien_phong ?? 0) - (coc ?? 0),
    co_the_hoan_tac_thu_du: tt === "da_thanh_toan" && !!b.trang_thai_tien_truoc,
    dem: b.dem ?? [],
    khach: !laSale && b.ten_khach ? { ten_khach: b.ten_khach, sdt_khach: null } : null,
    so_khach: b.so_khach ?? null,
    gio_nhan: b.gio_nhan ?? "14:00",
    gio_tra: b.gio_tra ?? "12:00",
    ghi_chu: b.ghi_chu ?? null,
    co_the_sua: b.trang_thai === "hieu_luc",
    co_the_xoa: !laSale,
    tao_luc: b.tao_luc ?? LUC_MAU,
    cap_nhat_luc: b.cap_nhat_luc ?? b.tao_luc ?? LUC_MAU,
  };
};

// Giá bán của sale cho đặt phòng (bảng gia_ban_booking): tiền phòng cộng mức cộng mỗi đêm của căn, làm tròn 50k nếu sale bật.
// Chỉ tính một lần lúc ghi; chủ nhà sửa sau không tính lại (mục "Sửa booking" (US10) bước 5, QT3.1).
const giaBanLucGhi = (sale: TaiKhoanLuu, c: CanLuu, tienPhong: number, soDem: number) => {
  const cong = db.muc_cong.find((m) => m.sale_id === sale.id && m.can_id === c.id)?.so_tien ?? sale.muc_cong_mac_dinh ?? 0;
  const tong = tienPhong + cong * soDem;
  return sale.lam_tron_50k ? Math.ceil(tong / 50000) * 50000 : tong;
};

// Đặt phòng của người gọi với vai CHU của căn. Người khác, căn người khác, không có: KHONG_TIM_THAY (PQ7.CHU, PQ7.SALE).
const bookingCuaChu = (id: string) => {
  const b = db.booking.find((x) => x.id === id);
  const c = b && canCoLichCua(nguoiGoi()).find((x) => x.id === b.can_id);
  if (!b || !c) throw new LoiApi("KHONG_TIM_THAY");
  return { b, c };
};

// Mốc cap_nhat_luc luôn tăng, để hai lần sửa liền nhau không trùng mốc
const lucMoi = (cu: string) => new Date(Math.max(Date.now(), Date.parse(cu) + 1)).toISOString();
const lucCuaBooking = (b: BookingLuu) => b.cap_nhat_luc ?? b.tao_luc ?? LUC_MAU;

// GET /booking/:id, dạng CHU (api/lich-dat-phong.md). Sale mở thì KHONG_TIM_THAY: sale dùng getBookingSale.
export async function getBooking(id: string): Promise<DatPhong> {
  await cho();
  const { b, c } = bookingCuaChu(id);
  return raDatPhong(b, c);
}

// GET /booking/:id, dạng SALE (S3-10): chỉ sale của đặt phòng (booking.sale_id là dòng ket_noi của người gọi). Chủ nhà, sale khác,
// sale không phải người đặt: KHONG_TIM_THAY (PQ7.SALE). Có giá chủ nhà (tien_phong) và giá bán của chính sale; không tiền cọc,
// không trạng thái tiền, không khách của chủ nhà (QD20 điểm 2, QD11). Mở được cả khi sale đã bị ngừng (QD20 điểm 4).
export async function getBookingSale(id: string): Promise<DatPhongSale> {
  await cho();
  const tk = nguoiGoi();
  const b = db.booking.find((x) => x.id === id);
  const kn = b?.sale_id ? db.ket_noi.find((k) => k.id === b.sale_id && k.sale_id === tk.id) : undefined;
  if (!b || !kn) throw new LoiApi("KHONG_TIM_THAY");
  const c = db.can.find((x) => x.id === b.can_id);
  const chu = db.tai_khoan.find((t) => t.id === kn.chu_nha_id);
  const tien = b.tien_phong ?? 0;
  const gia = b.gia_ban ?? tien;
  return {
    id: b.id,
    can_id: c?.id ?? null,
    ma_can: c?.ma_can ?? "",
    toa_nha: c?.toa_nha ?? null,
    so_phong_ngu: c?.so_phong_ngu ?? null,
    trang_thai: b.trang_thai,
    ngay_nhan: b.ngay_nhan,
    ngay_tra: b.ngay_tra,
    so_dem: cacDem(b.ngay_nhan, b.ngay_tra).length,
    chu_nha: {
      ten: chu?.ten_hien_thi ?? chu?.ho_ten ?? null,
      ...(chu?.so_dien_thoai ? { so_dien_thoai: chu.so_dien_thoai } : {}),
      da_xoa_tai_khoan: !chu,
    },
    tien_phong: tien,
    gia_ban: gia,
    tien_chenh: gia - tien,
    khach: null,
    gio_nhan: b.gio_nhan ?? "14:00",
    gio_tra: b.gio_tra ?? "12:00",
    tao_luc: b.tao_luc ?? LUC_MAU,
    cap_nhat_luc: lucCuaBooking(b),
  };
}

// Thông báo "chủ sửa booking" gần nhất của một đặt phòng cho sale đang gọi (mục "Sửa booking" (US10) bước 4, 5). Tạm cho tới khi US17 làm GET /thong-bao.
export async function getThongBaoChuSua(bookingId: string): Promise<ThongBaoChuSua | null> {
  await cho();
  const tk = nguoiGoi();
  const ds = db.thong_bao.filter((t) => t.nguoi_nhan_id === tk.id && t.booking_id === bookingId);
  if (ds.length === 0) return null;
  const { nguoi_nhan_id: _bo, ...t } = ds[ds.length - 1];
  return t;
}

// POST /booking/:id/thu-du (mục "Chi tiết booking và đánh dấu đã thu đủ" (US10) bước 4): giữ trạng thái trước để hoàn tác đúng, giữ tien_coc. Đã thanh toán rồi: TRANG_THAI_DA_DOI.
// Cùng Idempotency-Key thì trả kết quả cũ (bấm hai lần chỉ ghi một lần, HV1-NT1).
export async function postBookingThuDu(id: string, khoa: string): Promise<DatPhong> {
  await cho();
  const tk = nguoiGoi();
  return motLan(tk, `POST /booking/${id}/thu-du`, khoa, () => {
    const { b, c } = bookingCuaChu(id);
    if (b.trang_thai !== "hieu_luc" || (b.trang_thai_tien ?? "chua_coc") === "da_thanh_toan") throw new LoiApi("TRANG_THAI_DA_DOI");
    b.trang_thai_tien_truoc = b.trang_thai_tien ?? "chua_coc";
    b.trang_thai_tien = "da_thanh_toan";
    b.cap_nhat_luc = lucMoi(lucCuaBooking(b));
    return raDatPhong(b, c);
  });
}

// POST /booking/:id/hoan-tac-thu-du (mục "Chi tiết booking và đánh dấu đã thu đủ" (US10) bước 5): về đúng trạng thái trước khi thu đủ
export async function postBookingHoanTacThuDu(id: string, khoa: string): Promise<DatPhong> {
  await cho();
  const tk = nguoiGoi();
  return motLan(tk, `POST /booking/${id}/hoan-tac-thu-du`, khoa, () => {
    const { b, c } = bookingCuaChu(id);
    if (b.trang_thai_tien !== "da_thanh_toan" || !b.trang_thai_tien_truoc) throw new LoiApi("TRANG_THAI_DA_DOI");
    b.trang_thai_tien = b.trang_thai_tien_truoc;
    b.trang_thai_tien_truoc = null;
    b.cap_nhat_luc = lucMoi(lucCuaBooking(b));
    return raDatPhong(b, c);
  });
}

// DELETE /booking/:id (mục "Xóa booking" (US10) bước 2, 3): chỉ đặt phòng chủ nhà tự ghi cho khách lẻ. Đặt phòng có sale: KHONG_DUOC_PHEP
// (server chặn, không chỉ ẩn nút; ở server thật còn trigger database). Xóa thật: các đêm trống lại.
export async function deleteBooking(id: string, khoa: string): Promise<{ id: string; da_xoa: true }> {
  await cho();
  const tk = nguoiGoi();
  return motLan(tk, `DELETE /booking/${id}`, khoa, () => {
    const { b } = bookingCuaChu(id);
    if (b.ten_sale || b.sale_id) throw new LoiApi("KHONG_DUOC_PHEP", "Đặt phòng của sale không xóa được, chỉ sửa được");
    db.booking = db.booking.filter((x) => x !== b);
    return { id, da_xoa: true as const };
  });
}

// PATCH /booking/:id (mục "Sửa booking" (US10) bước 3 đến 5): chỉ trường gửi lên mới đổi. Kiểm trùng bỏ qua chính nó (QT1.2); tính lại booking_dem
// khi đổi căn, ngày hay tiền phòng, tổng các đêm bằng tiền phòng (QT4.2, theo bảng giá hiện tại [MỞ: api câu hỏi mở 4]);
// không đổi giá bán (QT3.1); đặt phòng có sale thì ghi thông báo chu_sua_booking cho sale mỗi lần lưu.
// Chưa làm vì còn [MỞ]: đổi người đặt (sale_id khác thì DU_LIEU_SAI), sửa đặt phòng cho_huy, da_huy (TRANG_THAI_DA_DOI).
export async function patchBooking(id: string, than: ThanSuaDatPhong, khoa: string): Promise<DatPhong> {
  await cho();
  const tk = nguoiGoi();
  return motLan(tk, `PATCH /booking/${id}`, khoa, () => {
    const { b, c: canCu } = bookingCuaChu(id);
    if ("gia_ban" in than || "tien_chenh" in than) throw new LoiApi("DU_LIEU_SAI", "", "gia_ban");
    if (b.trang_thai !== "hieu_luc") throw new LoiApi("TRANG_THAI_DA_DOI");
    if (than.cap_nhat_luc !== lucCuaBooking(b)) throw new LoiApi("TRANG_THAI_DA_DOI");
    const laSale = !!b.ten_sale || !!b.sale_id;
    if ("sale_id" in than && (than.sale_id ?? null) !== (b.sale_id ?? null)) throw new LoiApi("DU_LIEU_SAI", "", "sale_id");
    if (laSale && than.ten_khach?.trim()) throw new LoiApi("DU_LIEU_SAI", "", "ten_khach");
    const c = than.can_id !== undefined && than.can_id !== canCu.id ? canCuaToi(than.can_id) : canCu;
    const nhan = than.ngay_nhan ?? b.ngay_nhan;
    const tra = than.ngay_tra ?? b.ngay_tra;
    kiemNgay(nhan, tra);
    const tien = than.tien_phong ?? b.tien_phong ?? 0;
    if (!laTien(tien)) throw new LoiApi("DU_LIEU_SAI", "", "tien_phong");
    const ttCu = b.trang_thai_tien ?? "chua_coc";
    const tt = than.trang_thai_tien ?? ttCu;
    if (!["chua_coc", "da_coc_con_thu", "da_thanh_toan"].includes(tt)) throw new LoiApi("DU_LIEU_SAI", "", "trang_thai_tien");
    const coc = "tien_coc" in than ? than.tien_coc ?? null : tt === ttCu ? b.tien_coc ?? null : null;
    if (coc !== null && (!laTien(coc) || tt !== "da_coc_con_thu")) throw new LoiApi("DU_LIEU_SAI", "", "tien_coc");
    const trung = [...new Set(demTrung(c.id, nhan, tra, b.id))];
    if (trung.length) throw new LoiApi("TRUNG_LICH", `Ngày ${chuNgayNgan(trung[0])} đã có đặt phòng`, "ngay_nhan", trung);

    const cu = { nhan: b.ngay_nhan, tra: b.ngay_tra, tien: b.tien_phong ?? 0 };
    const doiDem = c.id !== b.can_id || nhan !== b.ngay_nhan || tra !== b.ngay_tra;
    b.can_id = c.id;
    b.ngay_nhan = nhan;
    b.ngay_tra = tra;
    b.tien_phong = tien;
    b.trang_thai_tien = tt;
    b.tien_coc = coc;
    if (tt !== ttCu) b.trang_thai_tien_truoc = null; // đổi trạng thái tiền: như ghi mới [MỞ: api câu hỏi mở 18]
    if ("so_khach" in than) b.so_khach = than.so_khach ?? null;
    if ("gio_nhan" in than) b.gio_nhan = than.gio_nhan ?? "14:00";
    if ("gio_tra" in than) b.gio_tra = than.gio_tra ?? "12:00";
    if ("ghi_chu" in than) b.ghi_chu = than.ghi_chu?.trim() || null;
    if ("ten_khach" in than && !laSale) b.ten_khach = than.ten_khach?.trim() || null;
    if (doiDem || tien !== cu.tien) {
      b.dem = chiaTienTheoDem(cacDem(nhan, tra).map((ngay) => ({ ngay, gia_chu: giaDem(c, ngay) })), tien);
    }
    b.cap_nhat_luc = lucMoi(than.cap_nhat_luc);
    tuChoiYeuCauTrung(c.id, nhan, tra); // GD11: đổi ngày, căn trùng yêu cầu chờ thì yêu cầu bị từ chối
    // Báo sale của đặt phòng mỗi lần lưu (mục "Sửa booking" (US10) bước 4). Không tên khách, ghi chú, cọc, giá bán (PQ19).
    const sale = laSale ? db.ket_noi.find((k) => k.id === b.sale_id) : undefined;
    if (sale?.sale_id) {
      const chu = db.tai_khoan.find((t) => t.id === tk.id);
      const nhanCan = (x: CanLuu) => ({ ma_can: x.ma_can, ten_toa_nha: x.toa_nha });
      db.thong_bao.push({
        id: idMoi("tb"),
        nguoi_nhan_id: sale.sale_id,
        booking_id: b.id,
        tao_luc: b.cap_nhat_luc,
        da_doc: false,
        du_lieu: {
          ten_chu_nha: chu?.ten_hien_thi ?? chu?.ho_ten ?? null,
          can: nhanCan(c),
          can_cu: c.id !== canCu.id ? nhanCan(canCu) : null,
          ngay_nhan_cu: cu.nhan,
          ngay_tra_cu: cu.tra,
          ngay_nhan: nhan,
          ngay_tra: tra,
          tien_phong_cu: cu.tien,
          tien_phong: tien,
        },
      });
    }
    return raDatPhong(b, c);
  });
}

const laTien = (v: unknown): v is number => Number.isSafeInteger(v) && (v as number) >= 0;

// POST /booking (server.md 2.6), bản US3: chủ nhà ghi khách lẻ. Cùng khóa thì trả đặt phòng đã ghi (HV1-NT1).
// Server thật chặn trùng bằng exclude của database; ở đây kiểm trong bộ nhớ.
export async function postBooking(than: ThanDatPhong, khoa: string): Promise<DatPhong> {
  await cho();
  const tk = nguoiGoi();
  const cu = db.khoa_lap.get(`${tk.id}:${khoa}`);
  if (cu) return cu;
  // Căn tự nhập của chính sale: ghi sale_tu_ghi (mục "Ghi booking đã chốt cho căn tự nhập" (US16)). Căn tự nhập của người khác rơi xuống dưới và nhận KHONG_TIM_THAY (PQ14.SALE).
  const canTuNhap = db.can.find((x) => x.id === than.can_id && x.tai_khoan_id === tk.id && x.an_luc === null && laTuNhap(x));
  if (canTuNhap) return ghiBookingTuNhap(tk, canTuNhap, than, khoa);
  if (db.can.some((x) => x.id === than.can_id && laTuNhap(x))) throw new LoiApi("KHONG_TIM_THAY"); // căn tự nhập của sale khác (PQ14.SALE)
  kiemNgay(than.ngay_nhan, than.ngay_tra);
  if (!laTien(than.tien_phong)) throw new LoiApi("DU_LIEU_SAI", "", "tien_phong");
  if (!["chua_coc", "da_coc_con_thu", "da_thanh_toan"].includes(than.trang_thai_tien as string)) {
    throw new LoiApi("DU_LIEU_SAI", "", "trang_thai_tien");
  }
  if (than.tien_coc !== null && (!laTien(than.tien_coc) || than.trang_thai_tien !== "da_coc_con_thu")) {
    throw new LoiApi("DU_LIEU_SAI", "", "tien_coc");
  }
  const c = canCuaToi(than.can_id);
  // Người đặt là sale: phải là sale đã kết nối với người gọi (api/lich-dat-phong.md, US5-NT13). Không kèm tên khách.
  const sale = than.sale_id ? db.ket_noi.find((k) => k.id === than.sale_id && k.chu_nha_id === tk.id && k.trang_thai === "da_ket_noi") : undefined;
  if (than.sale_id && !sale) throw new LoiApi("DU_LIEU_SAI", "", "sale_id");
  if (sale && than.ten_khach?.trim()) throw new LoiApi("DU_LIEU_SAI", "", "ten_khach");
  const trung = [...new Set(demTrung(c.id, than.ngay_nhan, than.ngay_tra))];
  if (trung.length) {
    throw new LoiApi("TRUNG_LICH", `Ngày ${chuNgayNgan(trung[0])} đã có đặt phòng`, "ngay_nhan", trung);
  }
  const gia = cacDem(than.ngay_nhan, than.ngay_tra).map((ngay) => ({ ngay, gia_chu: giaDem(c, ngay) }));
  const b: BookingLuu = {
    id: idMoi("booking"),
    can_id: c.id,
    ngay_nhan: than.ngay_nhan,
    ngay_tra: than.ngay_tra,
    trang_thai: "hieu_luc",
    ten_sale: sale?.ten ?? null,
    sale_id: sale?.id ?? null,
    ten_khach: than.ten_khach?.trim() || null,
    tien_phong: than.tien_phong,
    trang_thai_tien: than.trang_thai_tien as TrangThaiTien, // đã kiểm ở trên: một trong ba giá trị
    tien_coc: than.tien_coc,
    so_khach: than.so_khach,
    gio_nhan: than.gio_nhan ?? "14:00",
    gio_tra: than.gio_tra ?? "12:00",
    ghi_chu: than.ghi_chu?.trim() || null,
    dem: chiaTienTheoDem(gia, than.tien_phong),
    tao_luc: new Date().toISOString(),
  };
  b.cap_nhat_luc = b.tao_luc;
  const tkSale = sale?.sale_id ? db.tai_khoan.find((t) => t.id === sale.sale_id) : undefined;
  if (tkSale) b.gia_ban = giaBanLucGhi(tkSale, c, than.tien_phong, gia.length);
  db.booking.push(b);
  tuChoiYeuCauTrung(c.id, b.ngay_nhan, b.ngay_tra); // GD11, US15-NT19
  const kq = raDatPhong(b, c);
  db.khoa_lap.set(`${tk.id}:${khoa}`, kq);
  return kq;
}

// POST /booking với căn tự nhập (api/lich-dat-phong.md, mục "Ghi booking đã chốt cho căn tự nhập" (US16) bước 5): nguon sale_tu_ghi, tien_phong là tiền trả chủ, gia_ban là tiền thu khách,
// không trạng thái tiền; chặn trùng chỉ trong chính căn đó (QT1.3, TRUNG_LICH); không so với căn tự nhập của sale khác.
const ghiBookingTuNhap = (tk: TaiKhoanLuu, c: CanLuu, than: ThanDatPhong, khoa: string): DatPhong => {
  kiemNgay(than.ngay_nhan, than.ngay_tra);
  if (!laTien(than.tien_phong)) throw new LoiApi("DU_LIEU_SAI", "", "tien_phong");
  if (!laTien(than.gia_ban)) throw new LoiApi("DU_LIEU_SAI", "", "gia_ban");
  if ((than.trang_thai_tien ?? null) !== null) throw new LoiApi("DU_LIEU_SAI", "", "trang_thai_tien");
  if ((than.tien_coc ?? null) !== null) throw new LoiApi("DU_LIEU_SAI", "", "tien_coc");
  const trung = [...new Set(demTrung(c.id, than.ngay_nhan, than.ngay_tra))];
  if (trung.length) throw new LoiApi("TRUNG_LICH", `Ngày ${chuNgayNgan(trung[0])} đã có đặt phòng`, "ngay_nhan", trung);
  const gia = cacDem(than.ngay_nhan, than.ngay_tra).map((ngay) => ({ ngay, gia_chu: giaDem(c, ngay) }));
  const b: BookingLuu = {
    id: idMoi("booking"),
    can_id: c.id,
    ngay_nhan: than.ngay_nhan,
    ngay_tra: than.ngay_tra,
    trang_thai: "hieu_luc",
    ten_sale: null,
    sale_id: null,
    ten_khach: null,
    tien_phong: than.tien_phong,
    gia_ban: than.gia_ban,
    so_khach: than.so_khach ?? null,
    ghi_chu: than.ghi_chu?.trim() || null,
    dem: chiaTienTheoDem(gia, than.tien_phong),
    tao_luc: new Date().toISOString(),
    nguon: "sale_tu_ghi",
  };
  b.cap_nhat_luc = b.tao_luc;
  db.booking.push(b);
  const kq: DatPhong = { ...raDatPhong(b, c), gia_ban: than.gia_ban };
  db.khoa_lap.set(`${tk.id}:${khoa}`, kq);
  return kq;
};

// ---- Giá theo tháng (US4, api/gia.md). Server thật: src/server/api/gia.js ----

const NAM_NHO_NHAT = 2000;
const NAM_LON_NHAT = 2100;
const GIA_TOI_DA = 1_000_000_000;

// Căn có lịch của người gọi, CHU (PQ5.CHU). Căn người khác, đã ẩn, không có: KHONG_TIM_THAY.
const canCuaToiGia = (canId: string) => {
  const tk = nguoiGoi();
  const c = db.can.find((x) => x.id === canId && x.tai_khoan_id === tk.id && x.an_luc === null);
  if (!c) throw new LoiApi("KHONG_TIM_THAY");
  return c;
};

const ngayTrongThang = (thang: string) => luoiThang(thang).filter((n): n is string => n !== null);

// Loại đêm theo gia_dem (api/gia.md): dịp, không thì thứ của đêm. Đêm không giá vẫn có loại thường hoặc cuối tuần.
const loaiDem = (c: CanLuu, ngay: string): Pick<DemGia, "loai_dem" | "gia_dip_id"> => {
  const dip = c.gia?.dip.find((d) => d.tu_ngay <= ngay && ngay <= d.den_ngay);
  if (dip) return { loai_dem: "dip", gia_dip_id: dip.id };
  return { loai_dem: laCuoiTuan(ngay, demCuoiTuanCua(c)) ? "cuoi_tuan" : "thuong", gia_dip_id: null };
};

// GET /can/:id/gia?nam=&thang= (api/gia.md): 12 tháng của năm, các dải dịp, và giá từng đêm của một tháng nếu xin.
// thang không bắt buộc nằm trong nam, để lịch giá chuyển được từ T12 sang T01.
export async function getGiaCan(canId: string, q: { nam: number; thang?: string }): Promise<BangGia> {
  await cho();
  const c = canCuaToiGia(canId);
  if (!Number.isInteger(q.nam) || q.nam < NAM_NHO_NHAT || q.nam > NAM_LON_NHAT) throw new LoiApi("DU_LIEU_SAI", "", "nam");
  if (q.thang !== undefined && !laThang(q.thang)) throw new LoiApi("DU_LIEU_SAI", "", "thang");
  const ngayCoKhach = new Set(
    db.booking.filter((b) => b.can_id === c.id && chiemDem(b)).flatMap((b) => cacDem(b.ngay_nhan, b.ngay_tra)),
  );
  const mucThang = Array.from({ length: 12 }, (_, i) => {
    const thang = `${q.nam}-${String(i + 1).padStart(2, "0")}`;
    const g = c.gia?.thang[thang];
    // Tháng chưa có giá tháng thì "Chưa đặt", kể cả khi có dải dịp ([MỞ] api/gia.md: ô tháng có dịp mà chưa có giá tháng)
    const gia = g ? ngayTrongThang(thang).map((n) => giaDem(c, n) as number) : [];
    return {
      thang,
      gia_ngay_thuong: g?.thuong ?? null,
      gia_cuoi_tuan: g?.cuoi_tuan ?? null,
      gia_thap_nhat: gia.length ? Math.min(...gia) : null,
      gia_cao_nhat: gia.length ? Math.max(...gia) : null,
    };
  });
  const daiDip = (c.gia?.dip ?? [])
    .filter((d) => d.tu_ngay.slice(0, 4) <= String(q.nam) && String(q.nam) <= d.den_ngay.slice(0, 4))
    .sort((a, b) => a.tu_ngay.localeCompare(b.tu_ngay))
    .map((d) => ({
      id: d.id,
      ten: d.ten,
      tu_ngay: d.tu_ngay,
      den_ngay: d.den_ngay,
      la_ngay_le: d.la_ngay_le,
      gia_moi_dem: d.gia_moi_dem,
      ngay_le_id: d.ngay_le_id ?? null,
    }));
  return {
    can_id: c.id,
    ma_can: c.ma_can,
    nam: q.nam,
    dem_cuoi_tuan: [...demCuoiTuanCua(c)],
    thang: mucThang,
    dai_dip: daiDip,
    dem: q.thang
      ? ngayTrongThang(q.thang).map((ngay) => ({ ngay, gia: giaDem(c, ngay), ...loaiDem(c, ngay), co_khach: ngayCoKhach.has(ngay) }))
      : null,
  };
}

const laGia = (v: unknown): v is number => Number.isSafeInteger(v) && (v as number) >= 1 && (v as number) <= GIA_TOI_DA;

// Kiểm tháng và hai giá, dùng chung cho PUT /can/:id/gia-thang và POST /gia/nhieu-can (api/gia.md). Trả các tháng đã bỏ lặp.
const kiemThangVaGia = (than: { thang: string[]; gia_ngay_thuong: number; gia_cuoi_tuan: number }): string[] => {
  const ds = [...new Set(than.thang ?? [])];
  if (ds.length === 0) {
    throw new LoiApi("DU_LIEU_SAI", "Chưa chọn tháng nào. Chọn một tháng bên trên sau đó nhập giá.", "thang");
  }
  const namNay = Number(homNay().slice(0, 4));
  if (ds.length > 24 || ds.some((t) => !laThang(t) || ![namNay, namNay + 1].includes(Number(t.slice(0, 4))))) {
    throw new LoiApi("DU_LIEU_SAI", "", "thang");
  }
  if (!laGia(than.gia_ngay_thuong)) throw new LoiApi("DU_LIEU_SAI", "", "gia_ngay_thuong");
  if (!laGia(than.gia_cuoi_tuan)) throw new LoiApi("DU_LIEU_SAI", "", "gia_cuoi_tuan");
  return ds;
};

// PUT /can/:id/gia-thang (api/gia.md): ghi đè giá ngày thường, cuối tuần cho các tháng đã chọn. Không đổi booking (US7-NT1).
// Cùng khóa thì trả kết quả đã ghi (server.md 1.6). Tháng đã qua của năm nay: [MỞ] nên cho đặt.
export async function putGiaThang(
  canId: string,
  than: { thang: string[]; gia_ngay_thuong: number; gia_cuoi_tuan: number },
  khoa: string,
): Promise<KetQuaGiaThang> {
  await cho();
  const tk = nguoiGoi();
  const c = canCuaToiGia(canId);
  const cu = db.khoa_lap_gia.get(`${tk.id}:${khoa}`);
  if (cu) return cu;
  const ds = kiemThangVaGia(than);
  c.gia ??= { thang: {}, dip: [] };
  for (const t of ds) c.gia.thang[t] = { thuong: than.gia_ngay_thuong, cuoi_tuan: than.gia_cuoi_tuan };
  const kq: KetQuaGiaThang = {
    can_id: c.id,
    thang: ds.sort().map((thang) => ({ thang, gia_ngay_thuong: than.gia_ngay_thuong, gia_cuoi_tuan: than.gia_cuoi_tuan })),
    lich_cap_nhat_luc: new Date().toISOString(),
  };
  db.khoa_lap_gia.set(`${tk.id}:${khoa}`, kq);
  return kq;
}

// POST /gia/nhieu-can (api/gia.md, mục "Đặt giá nhiều căn" (US7) bước 3): cùng giá tháng cho nhiều căn, một lần. Một căn không phải của người gọi
// thì KHONG_TIM_THAY và không căn nào đổi. Không đổi đặt phòng đã có. gia_dip (mục "Đặt giá nhiều căn" (US7) bước 4) còn [MỞ] nên chưa nhận.
// Cùng Idempotency-Key thì trả kết quả cũ, không ghi lại (server.md 1.6).
export async function postGiaNhieuCan(
  than: { can_ids: string[]; thang: string[]; gia_ngay_thuong: number; gia_cuoi_tuan: number; gia_dip?: null },
  khoa: string,
): Promise<KetQuaGiaNhieuCan> {
  await cho();
  const tk = nguoiGoi();
  return motLan(tk, "POST /gia/nhieu-can", khoa, () => {
    const ids = [...new Set(than.can_ids ?? [])];
    if (ids.length === 0 || ids.length > 200) throw new LoiApi("DU_LIEU_SAI", "", "can_ids");
    if (than.gia_dip != null) throw new LoiApi("DU_LIEU_SAI", "Chưa đặt được giá ngày lễ, dịp đặc biệt cho nhiều căn", "gia_dip");
    const dsCan = ids.map(canCuaToiGia); // một căn không phải của người gọi: hỏng ở đây, chưa ghi gì
    const ds = kiemThangVaGia(than);
    for (const c of dsCan) {
      c.gia ??= { thang: {}, dip: [] };
      for (const t of ds) c.gia.thang[t] = { thuong: than.gia_ngay_thuong, cuoi_tuan: than.gia_cuoi_tuan };
    }
    return { can_ids: dsCan.map((c) => c.id), so_can: dsCan.length, thang: ds.sort(), gia_dip_ids: null };
  });
}

// GET /ngay-le?nam= (api/gia.md): dải ngày lễ Home247 đặt sẵn của một năm, cho "Chọn nhanh ngày lễ" (mục "Giá ngày lễ và dịp đặc biệt" (US8) bước 1).
// Người gọi phải giữ ít nhất một căn có lịch, không thì KHONG_TIM_THAY. Năm chưa có dải thì muc rỗng (EN16 nạp dữ liệu sau).
export async function getNgayLe(q: { nam: number }): Promise<KetQuaNgayLe> {
  await cho();
  if (canCoLichCua(nguoiGoi()).length === 0) throw new LoiApi("KHONG_TIM_THAY");
  if (!Number.isInteger(q.nam) || q.nam < NAM_NHO_NHAT || q.nam > NAM_LON_NHAT) throw new LoiApi("DU_LIEU_SAI", "", "nam");
  const muc = db.ngay_le.filter((m) => m.tu_ngay.slice(0, 4) === String(q.nam)).sort((a, b) => a.tu_ngay.localeCompare(b.tu_ngay));
  return { nam: q.nam, muc: muc.map((m) => ({ ...m })) };
}

const DIP_TOI_DA_NGAY = 10;
const soNgayDai = (tu: string, den: string) => cacDem(tu, den).length + 1;

// POST /can/:id/gia-dip (api/gia.md, mục "Giá ngày lễ và dịp đặc biệt" (US8) bước 4 đến 8): thêm một dải giá ngày lễ hoặc dịp đặc biệt cho căn của người gọi.
// Tối đa 10 ngày; tên trống thì đặt "Dịp đặc biệt dd/mm – dd/mm"; chồng ngày với dải khác của căn (tính cả hai đầu) thì
// DIP_CHONG_NGAY kèm dai_chong và không ghi gì; hai dải liền nhau thì lưu được. Không đổi đặt phòng đã có, không sửa dải ngay_le.
// Cùng Idempotency-Key thì trả kết quả cũ. Tên trống khi bật "Là ngày lễ" còn [MỞ: CH-020] nên DU_LIEU_SAI ở ten.
export async function postGiaDip(canId: string, than: ThanGiaDip, khoa: string): Promise<KetQuaGiaDip> {
  await cho();
  const tk = nguoiGoi();
  const c = canCuaToiGia(canId);
  return motLan(tk, `POST /can/${canId}/gia-dip`, khoa, () => {
    if (!laNgay(than.tu_ngay)) throw new LoiApi("DU_LIEU_SAI", "", "tu_ngay");
    if (!laNgay(than.den_ngay) || than.den_ngay < than.tu_ngay) throw new LoiApi("DU_LIEU_SAI", "", "den_ngay");
    if (soNgayDai(than.tu_ngay, than.den_ngay) > DIP_TOI_DA_NGAY) {
      throw new LoiApi(
        "DU_LIEU_SAI",
        `Tối đa ${DIP_TOI_DA_NGAY} ngày. Đang chọn ${soNgayDai(than.tu_ngay, than.den_ngay)} ngày, hãy rút ngắn ngày kết thúc.`,
        "den_ngay",
      );
    }
    if (!laGia(than.gia_moi_dem)) throw new LoiApi("DU_LIEU_SAI", "", "gia_moi_dem");
    if (typeof than.la_ngay_le !== "boolean") throw new LoiApi("DU_LIEU_SAI", "", "la_ngay_le");
    let ten = (than.ten ?? "").trim();
    if (ten.length > 80) throw new LoiApi("DU_LIEU_SAI", "", "ten");
    if (ten === "") {
      if (than.la_ngay_le) throw new LoiApi("DU_LIEU_SAI", "", "ten");
      ten = `Dịp đặc biệt ${chuNgayNgan(than.tu_ngay)} – ${chuNgayNgan(than.den_ngay)}`;
    }
    if (than.ngay_le_id != null && !db.ngay_le.some((m) => m.id === than.ngay_le_id)) {
      throw new LoiApi("KHONG_TIM_THAY", "", "ngay_le_id");
    }
    const chong = c.gia?.dip.find((d) => chongDai(d, { ...than, la_ngay_le: false, id: "", ten: "", gia_moi_dem: 0 }));
    if (chong) {
      throw new LoiApi(
        "DIP_CHONG_NGAY",
        `Trùng ngày với ${chong.ten}`,
        "tu_ngay",
        undefined,
        { id: chong.id, ten: chong.ten, tu_ngay: chong.tu_ngay, den_ngay: chong.den_ngay },
      );
    }
    c.gia ??= { thang: {}, dip: [] };
    const dip = {
      id: idMoi("dip"),
      ten,
      la_ngay_le: than.la_ngay_le,
      tu_ngay: than.tu_ngay,
      den_ngay: than.den_ngay,
      gia_moi_dem: than.gia_moi_dem,
      ngay_le_id: than.ngay_le_id ?? null,
    };
    c.gia.dip.push(dip);
    return { ...dip, ngay_le_id: dip.ngay_le_id, can_id: c.id, lich_cap_nhat_luc: new Date().toISOString() };
  });
}

const cungDai = (a: GiaCan["dip"][number], b: GiaCan["dip"][number]) =>
  a.la_ngay_le === b.la_ngay_le && a.tu_ngay === b.tu_ngay && a.den_ngay === b.den_ngay;
const chongDai = (a: GiaCan["dip"][number], b: GiaCan["dip"][number]) => a.tu_ngay <= b.den_ngay && b.tu_ngay <= a.den_ngay;

// POST /can/:id/gia/sao-chep (api/gia.md, mục "Sao chép giá sang căn khác" (US7) bước 5): thay giá có sẵn của căn đích theo từng phần đã chọn, một lần.
// Tháng căn nguồn chưa có giá mà căn đích đã có giá: giữ giá đích, các tháng khác chép bình thường, không báo lỗi; trả
// thang_giu_gia_cu để app hiện popup (US7, Tùng quyết 04/11/2026). Tháng nguồn trống và đích trống thì để trống.
// Ngày lễ, dịp đặc biệt (loại đã chọn): căn đích có dải mà căn nguồn không có thì giữ dải của đích, trả dip_giu_cu để app hiện
// trong cùng popup (Tùng quyết 04/11/2026 điểm 12, "PA B"); căn nguồn có mà đích không thì chép sang.
// Dịp nguồn chồng ngày một dải khác (không giống hệt) của căn đích: giữ dải đích, bỏ dịp nguồn ở căn đó, chép phần còn lại, không báo
// lỗi; trả dip_bo_qua để app hiện trong cùng popup (Tùng quyết 04/11/2026 điểm 13, "Phương án B").
// Còn [MỞ: api/gia.md câu hỏi mở 11]: giá căn nguồn của phần đã chọn nằm trong một năm. Ca khác: DU_LIEU_SAI ở den_can_ids, không căn nào đổi.
export async function postGiaSaoChep(tuCanId: string, than: ThanSaoChepGia, khoa: string): Promise<KetQuaSaoChepGia> {
  await cho();
  const tk = nguoiGoi();
  return motLan(tk, `POST /can/${tuCanId}/gia/sao-chep`, khoa, () => {
    const nguon = canCuaToiGia(tuCanId);
    const ids = [...new Set(than.den_can_ids ?? [])];
    if (ids.length === 0) throw new LoiApi("DU_LIEU_SAI", "Chọn căn để sao chép", "den_can_ids"); // US7-NT5
    if (ids.length > 200 || ids.includes(tuCanId)) throw new LoiApi("DU_LIEU_SAI", "", "den_can_ids");
    for (const k of ["gia_thang", "gia_le", "gia_dip_dac_biet"] as const) {
      if (typeof than[k] !== "boolean") throw new LoiApi("DU_LIEU_SAI", "", k);
    }
    if (!than.gia_thang && !than.gia_le && !than.gia_dip_dac_biet) throw new LoiApi("DU_LIEU_SAI", "", "gia_thang");
    const dsDich = ids.map(canCuaToiGia);

    const chonDai = (d: GiaCan["dip"][number]) => (d.la_ngay_le ? than.gia_le : than.gia_dip_dac_biet);
    const thangNguon = than.gia_thang ? Object.entries(nguon.gia?.thang ?? {}) : [];
    const daiNguon = (nguon.gia?.dip ?? []).filter(chonDai);
    const chuaRo = (c: CanLuu) =>
      new LoiApi("DU_LIEU_SAI", `Chưa sao chép được giá sang căn ${c.ma_can}: trường hợp này chưa có cách làm`, "den_can_ids");
    const nam = new Set([...thangNguon.map(([t]) => t.slice(0, 4)), ...daiNguon.flatMap((d) => [d.tu_ngay.slice(0, 4), d.den_ngay.slice(0, 4)])]);
    if (nam.size > 1) throw chuaRo(dsDich[0]);
    const giuGiaCu: ThangGiuGiaCu[] = [];
    const giuDip: DipGiuGiaCu[] = [];
    const boQua: DipGiuGiaCu[] = [];
    for (const c of dsDich) {
      const daiDich = c.gia?.dip ?? [];
      const duocChep = daiNguon.filter((d) => !daiDich.some((x) => chongDai(x, d) && !cungDai(x, d)));
      const biBo = daiNguon.filter((d) => !duocChep.includes(d)).sort((a, b) => a.tu_ngay.localeCompare(b.tu_ngay));
      if (biBo.length > 0) boQua.push({ can_id: c.id, ma_can: c.ma_can, dip: biBo.map((d) => ({ ten: d.ten, tu: d.tu_ngay, den: d.den_ngay })) });
      const dipGiu = (c.gia?.dip ?? []).filter((d) => chonDai(d) && !daiNguon.some((x) => cungDai(x, d))).sort((a, b) => a.tu_ngay.localeCompare(b.tu_ngay));
      if (dipGiu.length > 0) giuDip.push({ can_id: c.id, ma_can: c.ma_can, dip: dipGiu.map((d) => ({ ten: d.ten, tu: d.tu_ngay, den: d.den_ngay })) });
      const giu = than.gia_thang ? Object.keys(c.gia?.thang ?? {}).filter((t) => !(t in (nguon.gia?.thang ?? {}))).sort() : [];
      if (giu.length > 0) giuGiaCu.push({ can_id: c.id, ma_can: c.ma_can, thang: giu });
      c.gia ??= { thang: {}, dip: [] };
      for (const [t, g] of thangNguon) c.gia.thang[t] = { ...g };
      for (const d of duocChep) {
        const cu = c.gia.dip.find((x) => cungDai(x, d));
        if (cu) Object.assign(cu, { ten: d.ten, gia_moi_dem: d.gia_moi_dem });
        else c.gia.dip.push({ ...d, id: idMoi("dip") });
      }
    }
    return { tu_can_id: tuCanId, den_can_ids: dsDich.map((c) => c.id), so_can: dsDich.length, thang_giu_gia_cu: giuGiaCu, dip_giu_cu: giuDip, dip_bo_qua: boQua };
  });
}

// ---- Hồ sơ, xin số điện thoại (US5, api/phien-ho-so.md). Server thật: src/server/api/ ----

const raHoSo = (t: TaiKhoanLuu): HoSo => ({
  id: t.id,
  vai_chon: t.vai_chon,
  ho_ten: t.ho_ten ?? null,
  ten_hien_thi: t.ten_hien_thi ?? null,
  anh_dai_dien: t.anh_dai_dien ?? null,
  so_dien_thoai: t.so_dien_thoai ?? null,
  dem_cuoi_tuan: [...(t.dem_cuoi_tuan ?? DEM_CUOI_TUAN_MAC_DINH)],
  // Chỉ vai sale có mức cộng mặc định và làm tròn (PQ11.CHU: chủ nhà không có khóa này)
  ...(t.vai_chon === "sale" ? { muc_cong_mac_dinh: t.muc_cong_mac_dinh ?? 0, lam_tron_50k: t.lam_tron_50k ?? false, mau_tin_gui_khach: t.mau_tin_gui_khach ?? null } : {}),
});

// GET /toi (api/phien-ho-so.md): hồ sơ của chính người gọi. Không có tham số chọn người khác (PQ1.CHU, PQ1.SALE).
export async function getToi(): Promise<HoSo> {
  await cho();
  return raHoSo(nguoiGoi());
}

// PATCH /toi (api/phien-ho-so.md): chỉ đổi của chính người gọi. Mỗi lần gửi ít nhất một trong ba trường.
// dem_cuoi_tuan (mục "Ngày tính giá cuối tuần" (US11) bước 4, PQ6.CHU): mỗi số 1 đến 7, không trùng, server xếp tăng dần. Mảng rỗng chưa nhận [MỞ: DC53 phien-ho-so.md câu hỏi mở 12].
// muc_cong_mac_dinh (0 đến 10.000.000), lam_tron_50k (mục "Mức cộng giá mặc định" (US13) bước 5, PQ11.SALE): chỉ vai sale; chủ nhà gửi thì DU_LIEU_SAI (PQ11.CHU).
// Giá bán tính lúc đọc nên đổi theo cho căn không có mức cộng riêng; không đổi đặt phòng đã có (tiền ở booking_dem, gia_ban_booking).
const MAX_MUC_CONG = 10_000_000;
export async function patchToi(than: ThanSuaToi, khoa: string): Promise<HoSo> {
  await cho();
  const tk = nguoiGoi();
  const b = than as Record<string, unknown>;
  const khoaGui = Object.keys(b);
  if (khoaGui.length === 0 || khoaGui.some((k) => !["dem_cuoi_tuan", "muc_cong_mac_dinh", "lam_tron_50k", "mau_tin_gui_khach"].includes(k))) {
    throw new LoiApi("DU_LIEU_SAI", "", "dem_cuoi_tuan");
  }
  const ds = b.dem_cuoi_tuan;
  if ("dem_cuoi_tuan" in b && (!Array.isArray(ds) || ds.length === 0 || ds.some((t) => !Number.isInteger(t) || t < 1 || t > 7) || new Set(ds).size !== ds.length)) {
    throw new LoiApi("DU_LIEU_SAI", "", "dem_cuoi_tuan");
  }
  if ("muc_cong_mac_dinh" in b || "lam_tron_50k" in b || "mau_tin_gui_khach" in b) {
    if (tk.vai_chon !== "sale") throw new LoiApi("DU_LIEU_SAI", "", "muc_cong_mac_dinh");
    const m = b.muc_cong_mac_dinh;
    if ("muc_cong_mac_dinh" in b && (!Number.isInteger(m) || (m as number) < 0 || (m as number) > MAX_MUC_CONG)) throw new LoiApi("DU_LIEU_SAI", "", "muc_cong_mac_dinh");
    if ("lam_tron_50k" in b && typeof b.lam_tron_50k !== "boolean") throw new LoiApi("DU_LIEU_SAI", "", "lam_tron_50k");
    const m2 = b.mau_tin_gui_khach;
    if ("mau_tin_gui_khach" in b && m2 !== null && (typeof m2 !== "string" || m2.length > TOI_DA_KY_TU_MAU)) throw new LoiApi("DU_LIEU_SAI", "", "mau_tin_gui_khach");
  }
  if (khoa.length < 16 || khoa.length > 64) throw new LoiApi("DU_LIEU_SAI", "", "Idempotency-Key");
  return motLan(tk, "PATCH /toi", khoa, () => {
    if ("dem_cuoi_tuan" in b) tk.dem_cuoi_tuan = [...(ds as number[])].sort((a, c) => a - c);
    if ("muc_cong_mac_dinh" in b) tk.muc_cong_mac_dinh = b.muc_cong_mac_dinh as number;
    if ("lam_tron_50k" in b) tk.lam_tron_50k = b.lam_tron_50k as boolean;
    if ("mau_tin_gui_khach" in b) tk.mau_tin_gui_khach = b.mau_tin_gui_khach as string | null;
    return raHoSo(tk);
  });
}

// Chạy một lần theo Idempotency-Key (server.md 1.6): cùng khóa thì trả kết quả cũ, không chạy lại
const motLan = async <T>(tk: TaiKhoanLuu, api: string, khoa: string, chay: () => T | Promise<T>): Promise<T> => {
  const k = `${tk.id}:${api}:${khoa}`;
  if (db.khoa_lap_chung.has(k)) return db.khoa_lap_chung.get(k) as T;
  // Giữ cả lệnh đang chạy: hai lệnh cùng khóa gửi sát nhau chỉ chạy một lần (HV1-NT1)
  const dangChay = Promise.resolve().then(chay);
  db.khoa_lap_chung.set(k, dangChay);
  try {
    const kq = await dangChay;
    db.khoa_lap_chung.set(k, kq);
    return kq;
  } catch (e) {
    db.khoa_lap_chung.delete(k);
    throw e;
  }
};

// Số giả của bản thử: server giả không có App Secret nên không đổi được token thật. Token dạng "sdt:0912345678"
// (test dùng) ra đúng số đó, token khác ra số giả này. Số hiện ở P2 trong bản thử là số giả, ghi rõ trong PR.
export const SO_GIA_BAN_THU = "0900000101";
const soTuToken = (token: string) => (/^sdt:0\d{9}$/.test(token) ? token.slice(4) : SO_GIA_BAN_THU);

// POST /toi/thong-tin-zalo (api/phien-ho-so.md): ghi tên, ảnh và đổi token số điện thoại ra số cho hồ sơ người gọi.
// App chỉ gửi token (không gửi số, không có App Secret). Token đã dùng hoặc quá 2 phút thì TOKEN_SDT_HET_HAN và không ghi gì,
// kể cả tên; app làm tiếp việc gốc như "Để sau" (server.md 1.5). Cùng khóa thì không đổi token lần hai.
export async function postToiThongTinZalo(than: ThanThongTinZalo, khoa: string, accessToken: string): Promise<HoSo> {
  await cho();
  const tk = nguoiGoi();
  return motLan(tk, "toi/thong-tin-zalo", khoa, () => {
    if (typeof accessToken !== "string" || accessToken === "") throw new LoiApi("ZALO_TU_CHOI");
    const { token_sdt, ho_ten, anh_zalo } = than ?? {};
    if (token_sdt === undefined && ho_ten === undefined && anh_zalo === undefined) throw new LoiApi("DU_LIEU_SAI");
    if (token_sdt !== undefined && (typeof token_sdt !== "string" || token_sdt.length < 1 || token_sdt.length > 2000)) {
      throw new LoiApi("DU_LIEU_SAI", "", "token_sdt");
    }
    const ten = ho_ten === undefined ? undefined : typeof ho_ten === "string" ? ho_ten.trim() : "";
    if (ten !== undefined && (ten.length < 1 || ten.length > 100)) throw new LoiApi("DU_LIEU_SAI", "", "ho_ten");
    if (anh_zalo !== undefined && (typeof anh_zalo !== "string" || !/^https:\/\/[^\s]{1,990}$/.test(anh_zalo))) {
      throw new LoiApi("DU_LIEU_SAI", "", "anh_zalo");
    }
    // Đổi số trước khi ghi gì: lỗi thì không ghi tên, ảnh (server.md 1.3)
    if (token_sdt !== undefined) {
      if (db.token_da_dung.has(token_sdt) || db.token_het_han.has(token_sdt)) throw new LoiApi("TOKEN_SDT_HET_HAN", "", "token_sdt");
      db.token_da_dung.add(token_sdt);
      tk.so_dien_thoai = soTuToken(token_sdt);
    }
    if (ten !== undefined) tk.ho_ten = ten;
    if (anh_zalo !== undefined) tk.anh_dai_dien = anh_zalo;
    return raHoSo(tk);
  });
}

// ---- Link mời và kết nối (US5, api/ket-noi-link.md). Server thật: src/server/api/ ----

const MA_LINK_CHU = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
const maLinkMoi = () => Array.from({ length: 22 }, () => MA_LINK_CHU[Math.floor(Math.random() * MA_LINK_CHU.length)]).join("");
const MINI_APP_ID_GIA = "0000000000000000000"; // Mini App ID thật lấy ở developers.zalo.me, server thật điền
const LINK_HET_HAN_NGAY = 21; // QD9 r5

const chuNhaGoi = () => {
  const tk = nguoiGoi();
  if (tk.vai_chon !== "chu_nha") throw new LoiApi("KHONG_TIM_THAY"); // PQ17.CHU, PQ18.CHU: sale gọi thì như không có
  return tk;
};

const raLink = ({ tai_khoan_id: _bo, ...l }: LinkLuu): LinkMoi => ({ ...l, ...(l.can_ids ? { can_ids: [...l.can_ids] } : {}) });

// POST /link (api/ket-noi-link.md). moi_sale: trả link mời đang dùng nếu còn hạn, không thì tạo mới.
// gui_lich (US26, mục "Chủ nhà chủ động gửi lịch cho sale" (US26) bước 4): luôn tạo link mới cho các căn trong can_ids; cùng Idempotency-Key trả cùng một link.
// xin_lich (US17, A6): tài khoản vai sale; mỗi sale một link, không hạn, có thì trả link đó (nhóm Đăng nhập, vai trò, kết nối chủ nhà và sale quy tắc Một link xin lịch nhiều chủ nhà).
export async function postLink(than: { loai: string; can_ids?: string[] }, khoa: string): Promise<LinkMoi> {
  await cho();
  if (than?.loai === "xin_lich") {
    const sale = nguoiGoi();
    if (sale.vai_chon !== "sale") throw new LoiApi("KHONG_TIM_THAY"); // PQ18.SALE: chủ nhà gọi thì như không có
    if (than.can_ids !== undefined) throw new LoiApi("DU_LIEU_SAI", "", "can_ids");
    return raLink(db.link.find((l) => l.tai_khoan_id === sale.id && l.loai === "xin_lich") ?? taoLink(sale, "xin_lich"));
  }
  const tk = chuNhaGoi();
  if (than?.loai === "gui_lich") {
    return motLan(tk, "link", khoa, () => {
      const ids = than.can_ids;
      if (!Array.isArray(ids) || ids.length < 1 || ids.length > 100 || new Set(ids).size !== ids.length) {
        throw new LoiApi("DU_LIEU_SAI", "", "can_ids");
      }
      // Căn không phải của người gọi hoặc đã ẩn: KHONG_TIM_THAY, không tạo link (PQ18.CHU)
      const cua = new Set(canChuaAn(tk.id).map((c) => c.id));
      if (ids.some((id) => !cua.has(id))) throw new LoiApi("KHONG_TIM_THAY");
      const moi = taoLink(tk, "gui_lich", ids);
      return raLink(moi);
    });
  }
  if (than?.loai !== "moi_sale" || than.can_ids !== undefined) throw new LoiApi("DU_LIEU_SAI", "", "loai");
  const bayGio = Date.now();
  const cu = db.link.find((l) => l.tai_khoan_id === tk.id && l.loai === "moi_sale" && Date.parse(l.het_han_luc ?? "") > bayGio);
  if (cu) return raLink(cu);
  return raLink(taoLink(tk, "moi_sale"));
}

const taoLink = (tk: TaiKhoanLuu, loai: "moi_sale" | "gui_lich" | "xin_lich", canIds?: string[]): LinkLuu => {
  const bayGio = Date.now();
  const ma = maLinkMoi();
  const moi: LinkLuu = {
    tai_khoan_id: tk.id,
    ma,
    duong_dan: `https://zalo.me/s/${MINI_APP_ID_GIA}/?ma=${ma}`,
    loai,
    tao_luc: new Date(bayGio).toISOString(),
    // Link xin lịch không hạn tới khi DC49 quyết [MỞ: DC49]; đường dẫn chỉ có mã ngẫu nhiên, không số điện thoại (US17-NT5)
    het_han_luc: loai === "xin_lich" ? null : new Date(bayGio + LINK_HET_HAN_NGAY * 24 * 60 * 60 * 1000).toISOString(),
    so_lan_gui: 0,
    gui_cuoi_luc: null,
    ...(canIds ? { can_ids: [...canIds] } : {}),
  };
  db.link.push(moi);
  return moi;
};

// POST /link/:ma/da-gui (api/ket-noi-link.md): đếm một lần mở cửa sổ gửi hoặc sao chép. Link của người khác: KHONG_TIM_THAY.
// Người tạo link gọi: chủ nhà với link mời, link gửi lịch; sale với link xin lịch (PQ18.CHU, PQ18.SALE).
export async function postLinkDaGui(ma: string, khoa: string): Promise<{ ma: string; so_lan_gui: number; gui_cuoi_luc: string }> {
  await cho();
  const tk = nguoiGoi();
  return motLan(tk, `link/${ma}/da-gui`, khoa, () => {
    const l = db.link.find((x) => x.ma === ma && x.tai_khoan_id === tk.id);
    if (!l) throw new LoiApi("KHONG_TIM_THAY");
    if (Date.parse(l.het_han_luc ?? "") <= Date.now()) throw new LoiApi("LINK_KHONG_DUNG_DUOC");
    l.so_lan_gui += 1;
    l.gui_cuoi_luc = new Date().toISOString();
    return { ma: l.ma, so_lan_gui: l.so_lan_gui, gui_cuoi_luc: l.gui_cuoi_luc };
  });
}

// Đặt phòng của một sale trên căn của người gọi (không tính đã hủy, QD21)
const datPhongCuaSale = (tk: TaiKhoanLuu, k: KetNoiLuu) => {
  const cua = new Set(db.can.filter((c) => c.tai_khoan_id === tk.id && !laTuNhap(c)).map((c) => c.id));
  return db.booking.filter((b) => b.sale_id === k.id && cua.has(b.can_id) && chiemDem(b));
};

// Tên sale chủ nhà thấy: sale có tài khoản thì lấy tên hiển thị của tài khoản (PQ1.CHU), sale thêm tay thì tên chủ nhà nhập.
// Tài khoản chưa có tên: [MỞ: mục "Hồ sơ (Thông tin cá nhân)" (US21) chưa có quy tắc khi tên hiển thị trống], tạm ghi "Sale chưa có tên".
const tenKetNoi = (k: KetNoiLuu) => {
  if (!k.sale_id) return k.ten;
  const t = db.tai_khoan.find((x) => x.id === k.sale_id);
  return t?.ten_hien_thi || t?.ho_ten || "Sale chưa có tên";
};

const raDongKetNoi = (tk: TaiKhoanLuu, k: KetNoiLuu): DongKetNoi => {
  // [MỞ: mục "Chủ nhà quản lý danh sách sale" (US5) bước 1 không nói kỳ tính] Tạm theo canvas CN7 ("tháng này"): đặt phòng có ngày nhận trong tháng của hôm nay.
  const thang = thangCua(homNay());
  const ds = datPhongCuaSale(tk, k).filter((b) => thangCua(b.ngay_nhan) === thang);
  return {
    id: k.id,
    ten_hien_thi: tenKetNoi(k),
    trang_thai: k.trang_thai,
    nguon: k.nguon,
    tong_tien_dat_phong: ds.reduce((t, b) => t + (b.tien_phong ?? 0), 0),
    tom_tat: {
      so_dat_phong: ds.length,
      so_dem: ds.reduce((t, b) => t + cacDem(b.ngay_nhan, b.ngay_tra).length, 0),
      so_chua_coc: ds.filter((b) => b.trang_thai_tien === "chua_coc").length,
      da_thanh_toan_het: ds.length > 0 && ds.every((b) => b.trang_thai_tien === "da_thanh_toan"),
    },
  };
};

// GET /ket-noi, bản chủ nhà (api/ket-noi-link.md): nhóm Đã kết nối (theo tên), Chưa kết nối (theo thứ tự thêm).
// Không trả dòng chu_ngung, sale_bo (tới khi có quyết định) và không trả số điện thoại.
export async function getKetNoi(): Promise<DanhSachKetNoi> {
  await cho();
  const tk = chuNhaGoi();
  const cua = db.ket_noi.filter((k) => k.chu_nha_id === tk.id);
  return {
    vai: "chu_nha",
    da_ket_noi: cua
      .filter((k) => k.trang_thai === "da_ket_noi")
      .map((k) => raDongKetNoi(tk, k))
      .sort((a, b) => (a.ten_hien_thi ?? "").localeCompare(b.ten_hien_thi ?? "", "vi")),
    chua_ket_noi: cua.filter((k) => k.trang_thai === "chua_ket_noi").map((k) => raDongKetNoi(tk, k)),
  };
}

const chuanSoDienThoai = (so: unknown) => {
  const s = typeof so === "string" ? so.replace(/[\s.\-]/g, "") : "";
  return /^0\d{9}$/.test(s) ? s : null;
};

// POST /ket-noi { ten, so_dien_thoai } (api/ket-noi-link.md): chủ nhà thêm tay một sale, vào nhóm Chưa kết nối
export async function postKetNoi(than: { ten: string; so_dien_thoai: string }, khoa: string): Promise<DongKetNoi & { so_dien_thoai: string }> {
  await cho();
  const tk = chuNhaGoi();
  return motLan(tk, "ket-noi", khoa, () => {
    const ten = typeof than?.ten === "string" ? than.ten.trim() : "";
    if (ten.length < 1 || ten.length > 100) throw new LoiApi("DU_LIEU_SAI", "", "ten");
    const so = chuanSoDienThoai(than?.so_dien_thoai);
    if (!so) throw new LoiApi("DU_LIEU_SAI", "", "so_dien_thoai");
    const k: KetNoiLuu = { id: idMoi("kn"), chu_nha_id: tk.id, sale_id: null, ten, so_dien_thoai: so, trang_thai: "chua_ket_noi", nguon: "chu_them_tay", ket_noi_luc: null };
    db.ket_noi.push(k);
    return { ...raDongKetNoi(tk, k), so_dien_thoai: so };
  });
}

// Dòng ket_noi của người gọi; dòng của chủ nhà khác hay không có: KHONG_TIM_THAY (PQ17.CHU)
const ketNoiCuaToi = (tk: TaiKhoanLuu, id: string) => {
  const k = db.ket_noi.find((x) => x.id === id && x.chu_nha_id === tk.id);
  if (!k) throw new LoiApi("KHONG_TIM_THAY");
  return k;
};

// GET /ket-noi/:id, bản chủ nhà (api/ket-noi-link.md): chi tiết một sale và đặt phòng của sale trên căn của người gọi.
// Dòng đã xóa tài khoản không mở được (PQ23.CHU).
export async function getKetNoiChiTiet(id: string): Promise<ChiTietKetNoi> {
  await cho();
  const tk = chuNhaGoi();
  const k = ketNoiCuaToi(tk, id);
  if (k.trang_thai === "da_xoa_tai_khoan") throw new LoiApi("KHONG_CON_QUYEN", "Sale đã xóa tài khoản");
  const tenCan = new Map(db.can.map((c) => [c.id, c.ma_can]));
  return {
    vai: "chu_nha",
    id: k.id,
    trang_thai: k.trang_thai,
    nguon: k.nguon,
    ten_hien_thi: tenKetNoi(k),
    so_dien_thoai: k.sale_id ? db.tai_khoan.find((x) => x.id === k.sale_id)?.so_dien_thoai ?? null : k.so_dien_thoai,
    ket_noi_luc: k.ket_noi_luc,
    quyen_tinh_trang_coc: k.quyen_tinh_trang_coc ?? true,
    pham_vi: k.pham_vi ?? "tat_ca_can",
    dat_phong: datPhongCuaSale(tk, k)
      .sort((a, b) => b.ngay_nhan.localeCompare(a.ngay_nhan))
      .map((b) => ({
        id: b.id,
        can_id: b.can_id,
        ma_can: tenCan.get(b.can_id) ?? "",
        ngay_nhan: b.ngay_nhan,
        ngay_tra: b.ngay_tra,
        tien_phong: b.tien_phong ?? 0,
        trang_thai_tien: b.trang_thai_tien ?? "chua_coc",
      })),
  };
}

// POST /ket-noi/:id/ngung (api/ket-noi-link.md): sale mất quyền xem lịch, căn, giá của người gọi; đặt phòng cũ giữ nguyên
// (US5-NT10). Đã ngừng rồi thì trả như lần đầu. Dòng không phải da_ket_noi: TRANG_THAI_DA_DOI.
export async function postKetNoiNgung(id: string, khoa: string): Promise<{ id: string; trang_thai: TrangThaiKetNoi }> {
  await cho();
  const tk = chuNhaGoi();
  return motLan(tk, `ket-noi/${id}/ngung`, khoa, () => {
    const k = ketNoiCuaToi(tk, id);
    if (k.trang_thai !== "da_ket_noi" && k.trang_thai !== "chu_ngung") throw new LoiApi("TRANG_THAI_DA_DOI");
    // Báo sale bị ngừng một lần (QD17 dòng 13, US17-NT9): gọi lại khi đã ngừng thì không ghi lần hai. Không giá, không tên khách (PQ19.SALE).
    if (k.trang_thai === "da_ket_noi" && k.sale_id) {
      db.thong_bao_moi.push({
        id: idMoi("tb"),
        nguoi_nhan_id: k.sale_id,
        loai: "chu_ngung_ket_noi",
        du_lieu: { ket_noi_id: k.id, ten_chu_nha: tk.ten_hien_thi ?? tk.ho_ten ?? null },
        khoa_gom: null,
        tao_luc: new Date().toISOString(),
        da_doc_luc: null,
      });
    }
    k.trang_thai = "chu_ngung";
    return { id: k.id, trang_thai: k.trang_thai };
  });
}

// ---- Sale mở link, thêm lịch, xem lịch 7 ngày (US6, api/ket-noi-link.md, api/sale.md) ----

const laMaLink = (ma: unknown): ma is string => typeof ma === "string" && /^[A-Za-z0-9_-]{22}$/.test(ma);

// "Link dùng được": có dòng link, chưa quá hạn, người tạo còn tài khoản. Sai định dạng trả lỗi như không có,
// không lộ mã nào có thật. ly_do để trống: chữ cho từng trường hợp [MỞ: DC49]; màn dùng câu riêng của A1-link-01.
const linkDungDuoc = (ma: unknown) => {
  const l = laMaLink(ma) ? db.link.find((x) => x.ma === ma) : undefined;
  const chu = l && db.tai_khoan.find((t) => t.id === l.tai_khoan_id);
  // Link xin lịch (US17) có đường riêng ở getLinkXemTruoc, postLinkDongY: ở đây, như server, là link không dùng được
  if (!l || l.loai === "xin_lich" || !chu || !(Date.parse(l.het_han_luc ?? "") > Date.now())) throw new LoiApi("LINK_KHONG_DUNG_DUOC");
  return { l, chu };
};

const canChuaAn = (chuId: string) =>
  db.can
    .filter((c) => c.tai_khoan_id === chuId && c.an_luc === null && !laTuNhap(c))
    .sort((a, b) => a.tao_luc.localeCompare(b.tao_luc) || a.id.localeCompare(b.id, "en", { numeric: true }));

// Căn chưa ẩn của chủ nhà mà sale của dòng ket_noi này được xem (server.md 1.4): tat_ca_can tính lúc đọc nên căn thêm sau tự vào
const canTrongPhamVi = (chuId: string, k: KetNoiLuu) =>
  canChuaAn(chuId).filter((c) => k.pham_vi !== "chon_can" || (k.can_ids ?? []).includes(c.id));

// GET /link/:ma (api/ket-noi-link.md): công khai, không cần phiên. Chỉ tên chủ nhà, số căn và thông tin sơ lược từng căn:
// không giá, không id căn, không số điện thoại (PQ3.LINK, PQ5.LINK, PQ2.LINK, QD9). Có tài khoản thì thêm da_them.
export async function getLink(ma: string): Promise<XemTruocLink> {
  await cho();
  return xemTruocLinkMoi(ma);
}

const xemTruocLinkMoi = (ma: string): XemTruocLink => {
  const { l, chu } = linkDungDuoc(ma);
  // Link gửi lịch chỉ có các căn đã chọn còn chưa ẩn; link mời có mọi căn chưa ẩn (PQ3.LINK, PQ5.LINK)
  const can = canChuaAn(chu.id).filter((c) => !l.can_ids || l.can_ids.includes(c.id));
  const kq: XemTruocLink = {
    loai: l.loai as XemTruocLink["loai"],
    het_han_luc: l.het_han_luc,
    chu_nha: { ten_hien_thi: chu.ten_hien_thi ?? chu.ho_ten ?? null },
    so_can: can.length,
    can: can.map((c) => ({
      ma_can: c.ma_can,
      toa_nha: c.toa_nha,
      so_phong_ngu: c.so_phong_ngu,
      so_giuong: c.so_giuong,
      loai_view: c.loai_view,
      anh_dai_dien: anhDaiDien(c.id)?.duong_dan_xem ?? null,
    })),
  };
  const phien = phienCuaApp ? db.phien.get(phienCuaApp) : undefined;
  const tk = phien && db.tai_khoan.find((t) => t.zalo_id === phien.zalo_id);
  if (tk) {
    kq.vai_nguoi_mo = tk.vai_chon;
    kq.da_them = db.ket_noi.some((k) => k.chu_nha_id === chu.id && k.sale_id === tk.id && k.trang_thai === "da_ket_noi");
  }
  return kq;
};

// ---- Sale xin lịch, chủ nhà đồng ý (US17, api/ket-noi-link.md, api/thong-bao-thong-ke-xuat.md) ----

// GET /link/:ma cho cả ba loại link (A8 với xin_lich). Link xin lịch cần phiên, kể cả phiên tạm của người chưa có tài khoản
// (server.md 1.4): chỉ tên và số sale (PQ1.CHU, PQ2.CHU). Sale mở: KHONG_DUOC_PHEP (PQ18.SALE). Chủ nhà đã ngừng sale đó:
// LINK_KHONG_DUNG_DUOC, không tên, không số (A8-01). Link mời, gửi lịch: như getLink.
export async function getLinkXemTruoc(ma: string): Promise<XemTruocLink | XemTruocLinkXin> {
  await cho();
  const l = laMaLink(ma) ? db.link.find((x) => x.ma === ma) : undefined;
  if (l?.loai !== "xin_lich") return xemTruocLinkMoi(ma);
  const sale = db.tai_khoan.find((t) => t.id === l.tai_khoan_id);
  if (!sale) throw new LoiApi("LINK_KHONG_DUNG_DUOC"); // sale đã xóa tài khoản: link xóa theo (US22-NT2)
  const phien = phienCuaApp ? db.phien.get(phienCuaApp) : undefined;
  if (!phien) throw new LoiApi("CHUA_DANG_NHAP");
  const tk = db.tai_khoan.find((t) => t.zalo_id === phien.zalo_id);
  if (tk) {
    if (tk.vai_chon === "sale") throw new LoiApi("KHONG_DUOC_PHEP");
    if (db.ket_noi.some((k) => k.chu_nha_id === tk.id && k.sale_id === sale.id && k.trang_thai === "chu_ngung")) {
      throw new LoiApi("LINK_KHONG_DUNG_DUOC");
    }
  }
  return {
    loai: "xin_lich",
    het_han_luc: null,
    sale: { ten_hien_thi: sale.ten_hien_thi ?? sale.ho_ten ?? null, so_dien_thoai: sale.so_dien_thoai ?? null },
  };
}

// GET /xin-lich/thong-ke (A7): chỉ số của chính sale, không tên chủ nhà (PQ18.SALE). Đếm mọi dòng ket_noi nguồn sale_xin còn trong bảng.
export async function getXinLichThongKe(): Promise<ThongKeXinLich> {
  await cho();
  const tk = nguoiGoi();
  if (tk.vai_chon !== "sale") throw new LoiApi("KHONG_TIM_THAY");
  const l = db.link.find((x) => x.tai_khoan_id === tk.id && x.loai === "xin_lich");
  return {
    so_lan_gui: l?.so_lan_gui ?? 0,
    gui_cuoi_luc: l?.gui_cuoi_luc ?? null,
    so_chu_nha_dong_y: db.ket_noi.filter((k) => k.sale_id === tk.id && k.nguon === "sale_xin").length,
  };
}

const MUOI_PHUT_MS = 10 * 60 * 1000;
// Khóa gom [GIẢ ĐỊNH: GD15]: dòng chưa đọc cùng người nhận, cùng loại mà dòng đầu của nhóm tạo trong 10 phút trước thì dùng lại khóa
const khoaGomChoDongY = (nguoiNhanId: string, bayGio: number): string => {
  const dang = db.thong_bao_moi.filter((t) => t.nguoi_nhan_id === nguoiNhanId && t.loai === "chu_dong_y_ket_noi" && t.da_doc_luc === null && t.khoa_gom);
  for (const kg of new Set(dang.map((t) => t.khoa_gom))) {
    const dau = Math.min(...dang.filter((t) => t.khoa_gom === kg).map((t) => Date.parse(t.tao_luc)));
    if (bayGio - dau <= MUOI_PHUT_MS) return kg as string;
  }
  return idMoi("gom");
};

// POST /link/:ma/dong-y { quyen_tinh_trang_coc } (A8): chủ nhà tạo kết nối nguồn sale_xin, ghi thông báo chu_dong_y_ket_noi cho sale
// (không giá, PQ19.SALE). Chủ nhà chưa có tài khoản gọi postTaiKhoan trước. Đã kết nối: không ghi gì, trả dòng cũ.
// Đã ngừng, sale đã bỏ nguồn: LINK_KHONG_DUNG_DUOC. Sale đã rút quyền: KHONG_CON_QUYEN (QD18 r9). Sale bấm: KHONG_DUOC_PHEP.
export async function postLinkDongY(ma: string, than: { quyen_tinh_trang_coc: boolean }, khoa: string): Promise<KetQuaDongYXinLich> {
  await cho();
  const tk = nguoiGoi();
  return motLan(tk, `link/${ma}/dong-y`, khoa, () => {
    if (typeof than?.quyen_tinh_trang_coc !== "boolean") throw new LoiApi("DU_LIEU_SAI", "", "quyen_tinh_trang_coc");
    const l = laMaLink(ma) ? db.link.find((x) => x.ma === ma && x.loai === "xin_lich") : undefined;
    const sale = l && db.tai_khoan.find((t) => t.id === l.tai_khoan_id);
    if (!l || !sale) throw new LoiApi("LINK_KHONG_DUNG_DUOC");
    if (tk.vai_chon !== "chu_nha") throw new LoiApi("KHONG_DUOC_PHEP");
    const cu = db.ket_noi.find((k) => k.chu_nha_id === tk.id && k.sale_id === sale.id);
    if (cu && cu.trang_thai !== "da_ket_noi") throw new LoiApi("LINK_KHONG_DUNG_DUOC");
    if (sale.rut_quyen_luc) throw new LoiApi("KHONG_CON_QUYEN", "Sale đã xóa tài khoản");
    const bay = Date.now();
    let k = cu;
    if (!k) {
      k = {
        id: idMoi("kn"),
        chu_nha_id: tk.id,
        sale_id: sale.id,
        ten: "",
        so_dien_thoai: null,
        trang_thai: "da_ket_noi",
        nguon: "sale_xin",
        ket_noi_luc: new Date(bay).toISOString(),
        pham_vi: "tat_ca_can",
        quyen_tinh_trang_coc: than.quyen_tinh_trang_coc,
      };
      db.ket_noi.push(k);
      const can = canTrongPhamVi(tk.id, k);
      db.thong_bao_moi.push({
        id: idMoi("tb"),
        nguoi_nhan_id: sale.id,
        loai: "chu_dong_y_ket_noi",
        du_lieu: {
          ket_noi_id: k.id,
          chu_nha_id: tk.id,
          ten_chu_nha: tk.ten_hien_thi ?? tk.ho_ten ?? null,
          so_can: can.length,
          can: can.map((c) => ({ can_id: c.id, ma_can: c.ma_can, ten_toa_nha: c.toa_nha })),
        },
        khoa_gom: khoaGomChoDongY(sale.id, bay),
        tao_luc: new Date(bay).toISOString(),
        da_doc_luc: null,
      });
    }
    return {
      ket_noi_id: k.id,
      trang_thai: k.trang_thai,
      ten_hien_thi_sale: sale.ten_hien_thi ?? sale.ho_ten ?? null,
      quyen_tinh_trang_coc: k.quyen_tinh_trang_coc ?? true,
      ket_noi_luc: k.ket_noi_luc ?? new Date(bay).toISOString(),
    };
  });
}

// Mục thông báo của người gọi, mới trước. Dòng chu_sua_booking nằm ở bảng riêng của US10 (db.thong_bao), gộp vào đây.
type DongTb = { id: string; loai: string; du_lieu: Record<string, unknown>; khoa_gom: string | null; booking_id: string | null; tao_luc: string; da_doc_luc: string | null };
const cacDongThongBao = (nguoiId: string): DongTb[] => [
  ...db.thong_bao
    .filter((t) => t.nguoi_nhan_id === nguoiId)
    .map((t): DongTb => ({ id: t.id, loai: "chu_sua_booking", du_lieu: t.du_lieu as unknown as Record<string, unknown>, khoa_gom: null, booking_id: t.booking_id, tao_luc: t.tao_luc, da_doc_luc: t.da_doc ? t.tao_luc : null })),
  ...db.thong_bao_moi.filter((t) => t.nguoi_nhan_id === nguoiId).map((t): DongTb => ({ ...t, booking_id: null })),
];
const soId = (id: string) => Number(id.slice(id.lastIndexOf("-") + 1));
const mucThongBao = (nguoiId: string): MucThongBao[] => {
  const ds = cacDongThongBao(nguoiId).sort((a, b) => Date.parse(b.tao_luc) - Date.parse(a.tao_luc) || soId(b.id) - soId(a.id));
  const muc: MucThongBao[] = [];
  for (const d of ds) {
    const chung = d.khoa_gom ? ds.filter((x) => x.khoa_gom === d.khoa_gom && x.loai === d.loai) : [d];
    if (chung[0] !== d) continue; // dòng mới nhất của nhóm đã đại diện
    const daDocHet = chung.every((x) => x.da_doc_luc !== null);
    muc.push({
      id: d.id,
      ids: chung.map((x) => x.id),
      loai: d.loai,
      du_lieu: d.du_lieu,
      du_lieu_gom: d.khoa_gom ? chung.map((x) => x.du_lieu) : null, // server thật: có khoa_gom thì là mảng, kể cả nhóm một dòng
      booking_id: d.booking_id,
      yeu_cau_id: null,
      tao_luc: d.tao_luc,
      da_doc_luc: daDocHet ? chung.map((x) => x.da_doc_luc as string).sort().pop() ?? null : null,
    });
  }
  return muc;
};

// GET /thong-bao (P13, toast A9): của chính người gọi (PQ19). Gom các lần đồng ý trong 10 phút thành một mục; so_chua_doc đếm mục.
// truoc: con trỏ do server trả (ở đây là số mục đã lấy), gioi_han 1 đến 100, mặc định 50.
export async function getThongBao(q: { truoc?: string; gioi_han?: number } = {}): Promise<DanhSachThongBao> {
  await cho();
  const tk = nguoiGoi();
  const gh = q.gioi_han ?? 50;
  if (!Number.isInteger(gh) || gh < 1 || gh > 100) throw new LoiApi("DU_LIEU_SAI", "", "gioi_han");
  const tu = q.truoc === undefined ? 0 : /^[0-9]+$/.test(q.truoc) ? Number(q.truoc) : -1;
  if (tu < 0) throw new LoiApi("DU_LIEU_SAI", "", "truoc");
  const het = mucThongBao(tk.id);
  return {
    muc: het.slice(tu, tu + gh),
    so_chua_doc: het.filter((m) => m.da_doc_luc === null).length,
    truoc_tiep: tu + gh < het.length ? String(tu + gh) : null,
  };
}

// POST /thong-bao/da-doc { ids | tat_ca: true } (nút "Đánh dấu đã đọc", chạm một dòng): chỉ dòng của mình; id lạ: KHONG_TIM_THAY, không ghi gì.
export async function postThongBaoDaDoc(than: ThanDaDoc): Promise<{ so_chua_doc: number }> {
  await cho();
  const tk = nguoiGoi();
  const coIds = !!than && "ids" in than;
  const coTatCa = !!than && "tat_ca" in than;
  if (coIds === coTatCa) throw new LoiApi("DU_LIEU_SAI", "", coIds ? "tat_ca" : "ids");
  const luc = new Date().toISOString();
  const cua = cacDongThongBao(tk.id);
  let dong: string[];
  if (coTatCa) {
    if ((than as { tat_ca: unknown }).tat_ca !== true) throw new LoiApi("DU_LIEU_SAI", "", "tat_ca");
    dong = cua.map((d) => d.id);
  } else {
    const ids = (than as { ids: unknown }).ids;
    if (!Array.isArray(ids) || ids.length < 1 || ids.length > 100 || new Set(ids).size !== ids.length) throw new LoiApi("DU_LIEU_SAI", "", "ids");
    if (!ids.every((id) => typeof id === "string" && cua.some((d) => d.id === id))) throw new LoiApi("KHONG_TIM_THAY");
    dong = ids as string[];
  }
  for (const t of db.thong_bao) if (t.nguoi_nhan_id === tk.id && dong.includes(t.id)) t.da_doc = true;
  for (const t of db.thong_bao_moi) if (t.nguoi_nhan_id === tk.id && dong.includes(t.id) && t.da_doc_luc === null) t.da_doc_luc = luc;
  return { so_chua_doc: mucThongBao(tk.id).filter((m) => m.da_doc_luc === null).length };
}

// POST /link/:ma/them-lich (api/ket-noi-link.md): chỗ link thành SALE (PQ17.LINK). Không có thân; phạm vi lấy theo loại link
// (link mời: tất cả căn, kể cả căn thêm sau, mục "Căn mới của chủ nhà tự hiện cho sale" (US6)), quyền mặc định giá bật. Đã kết nối rồi thì không tạo thêm (US6-NT6).
export async function postLinkThemLich(ma: string, khoa: string): Promise<KetQuaThemLich> {
  await cho();
  const tk = nguoiGoi();
  return motLan(tk, `link/${ma}/them-lich`, khoa, () => {
    const { l, chu } = linkDungDuoc(ma);
    // Người tạo link tự bấm: [MỞ: nguồn không nói]. Tạm: không tạo kết nối với chính mình.
    if (chu.id === tk.id) throw new LoiApi("DU_LIEU_SAI", "", "ma");
    const dong = db.ket_noi.find((k) => k.chu_nha_id === chu.id && k.sale_id === tk.id);
    // Dòng chu_ngung, sale_bo: [MỞ] nguồn không nói mở lại link thì sao. Tạm theo api/sale.md: KHONG_CON_QUYEN, ly_do trống.
    if (dong && dong.trang_thai !== "da_ket_noi") throw new LoiApi("KHONG_CON_QUYEN");
    const k =
      dong ??
      (() => {
        const moi: KetNoiLuu = {
          id: idMoi("kn"),
          chu_nha_id: chu.id,
          sale_id: tk.id,
          ten: "",
          so_dien_thoai: null,
          trang_thai: "da_ket_noi",
          nguon: l.loai === "gui_lich" ? "chu_gui_lich" : "link_moi",
          ket_noi_luc: new Date().toISOString(),
          // Link gửi lịch: chỉ các căn của link (mục "Chủ nhà chủ động gửi lịch cho sale" (US26)); link mời: tất cả căn (QD9)
          ...(l.can_ids ? { pham_vi: "chon_can" as const, can_ids: [...l.can_ids] } : {}),
        };
        db.ket_noi.push(moi);
        return moi;
      })();
    return {
      ket_noi_id: k.id,
      da_co_tu_truoc: !!dong,
      ten_hien_thi_chu_nha: chu.ten_hien_thi ?? chu.ho_ten ?? null,
      so_can: canTrongPhamVi(chu.id, k).length,
    };
  });
}

// Giá bán một đêm = giá chủ + mức cộng (riêng của căn, không thì mặc định), làm tròn lên 50k từng đêm nếu bật [GIẢ ĐỊNH: GD16, GD13].
// Chỉ gọi khi chủ nhà cho sale xem giá. Đêm chưa có giá thì null.
const giaBanDem = (sale: TaiKhoanLuu, c: CanLuu, ngay: string): number | null => {
  const g = giaDem(c, ngay);
  if (g === null) return null;
  if (c.tai_khoan_id === sale.id && !laTuNhap(c)) return g; // căn của tôi: sale là chủ, giá đêm của chính sale, không cộng thêm (QD20 điểm 7)
  const cong = db.muc_cong.find((m) => m.sale_id === sale.id && m.can_id === c.id)?.so_tien ?? sale.muc_cong_mac_dinh ?? 0;
  return sale.lam_tron_50k ? Math.ceil((g + cong) / 50000) * 50000 : g + cong;
};

// GET /sale/lich?tu=&so_ngay=&sap_xep= (api/sale.md): ba nhóm căn của sale, 7 hoặc 14 ngày từ `tu`.
// cua_toi: căn sale giữ, ô `trong` có gia_chu (giá đêm của chính sale); nguon_phong: căn của chủ nhà đã kết nối, ô kín không có tên người đặt,
// sale_id, nguồn (PQ4.SALE, PQ7.SALE, QT2.1), ô trống luôn có giá bán (QD20 r2 điểm 3, EN53); tu_nhap: không bao giờ `trong` hay `kin`,
// ô là `chua_biet` ("?"), đêm sale đã ghi là `cua_ban` ("Bạn") (US16-NT2, US16-NT32). Căn chỉ của người gọi (PQ13, PQ14.SALE).
// Sắp xếp trong mỗi nhóm: ten (mặc định), gia_tang (giá hôm nay, căn không giá xếp cuối), ban_nhieu (số đặt phòng của sale 90 ngày qua).
const SAP_XEP_LICH: SapXepLich[] = ["ten", "gia_tang", "ban_nhieu"];
export async function getSaleLich(q: { tu?: string; so_ngay?: number; sap_xep?: SapXepLich } = {}): Promise<LichSale> {
  await cho();
  const tk = nguoiGoi();
  const tu = q.tu ?? homNay();
  if (!laNgay(tu)) throw new LoiApi("DU_LIEU_SAI", "", "tu");
  const soNgay = q.so_ngay ?? 7;
  if (soNgay !== 7 && soNgay !== 14) throw new LoiApi("DU_LIEU_SAI", "", "so_ngay");
  const sapXep = q.sap_xep ?? "ten";
  if (!SAP_XEP_LICH.includes(sapXep)) throw new LoiApi("DU_LIEU_SAI", "", "sap_xep");
  const ngay = Array.from({ length: soNgay }, (_, i) => congNgay(tu, i));
  const hom = homNay();
  const kinNgay = (c: CanLuu, n: string) => db.booking.some((b) => b.can_id === c.id && chiemDem(b) && b.ngay_nhan <= n && n < b.ngay_tra);
  type Dong = { can: CanLichSale; giaHomNay: number | null; soBan: number };
  const tuNgay = congNgay(hom, -90);
  const soBanCua = (c: CanLuu, saleDongIds: string[]) =>
    db.booking.filter(
      (b) =>
        b.can_id === c.id &&
        chiemDem(b) &&
        (b.nguon === "sale_tu_ghi" ? true : b.sale_id != null && saleDongIds.includes(b.sale_id)) &&
        (b.tao_luc ?? b.ngay_nhan).slice(0, 10) >= tuNgay,
    ).length;
  const dongCuaToi: Dong[] = [];
  const dongTuNhap: Dong[] = [];
  const dongNguon: Dong[] = [];
  for (const c of db.can.filter((x) => x.tai_khoan_id === tk.id && x.an_luc === null)) {
    const goc = { id: c.id, ma_can: c.ma_can, toa_nha: c.toa_nha ? { id: c.toa_nha, ten: c.toa_nha } : null, so_phong_ngu: c.so_phong_ngu };
    if (laTuNhap(c)) {
      dongTuNhap.push({
        giaHomNay: null,
        soBan: soBanCua(c, []),
        can: {
          ...goc,
          nhom: "tu_nhap",
          loai: "tu_nhap",
          ten_chu_can: c.ten_chu_can ?? "",
          o: ngay.map((n) => ({
            ngay: n,
            trang_thai: db.booking.some((b) => b.can_id === c.id && b.nguon === "sale_tu_ghi" && b.ngay_nhan <= n && n < b.ngay_tra) ? ("cua_ban" as const) : ("chua_biet" as const),
          })),
        },
      });
    } else {
      dongCuaToi.push({
        giaHomNay: kinNgay(c, hom) ? null : giaDem(c, hom), // căn kín hôm nay xếp cuối như căn không giá [MỞ: api/sale.md câu hỏi 4]
        soBan: soBanCua(c, []),
        can: {
          ...goc,
          nhom: "cua_toi",
          loai: "co_lich",
          lich_cap_nhat_luc: null,
          o: ngay.map((n) => (kinNgay(c, n) ? { ngay: n, trang_thai: "kin" as const } : { ngay: n, trang_thai: "trong" as const, gia_chu: giaDem(c, n) })),
        },
      });
    }
  }
  for (const k of db.ket_noi.filter((x) => x.sale_id === tk.id && x.trang_thai === "da_ket_noi")) {
    const chu = db.tai_khoan.find((t) => t.id === k.chu_nha_id);
    if (!chu) continue;
    for (const c of canTrongPhamVi(chu.id, k)) {
      dongNguon.push({
        giaHomNay: !kinNgay(c, hom) ? giaBanDem(tk, c, hom) : null,
        soBan: soBanCua(c, [k.id]),
        can: {
          id: c.id,
          ma_can: c.ma_can,
          toa_nha: c.toa_nha ? { id: c.toa_nha, ten: c.toa_nha } : null,
          nhom: "nguon_phong",
          loai: "co_lich",
          so_phong_ngu: c.so_phong_ngu,
          chu_nha: { id: chu.id, ten_hien_thi: chu.ten_hien_thi ?? chu.ho_ten ?? null },
          lich_cap_nhat_luc: null,
          o: ngay.map((n) => {
            if (kinNgay(c, n)) return { ngay: n, trang_thai: "kin" as const };
            return { ngay: n, trang_thai: "trong" as const, gia_ban: giaBanDem(tk, c, n) };
          }),
        },
      });
    }
  }
  const theoTen = (a: Dong, b: Dong) =>
    a.can.ma_can.localeCompare(b.can.ma_can, "vi") || (a.can.toa_nha?.ten ?? "").localeCompare(b.can.toa_nha?.ten ?? "", "vi");
  const xep = (ds: Dong[]) =>
    [...ds].sort((a, b) => {
      if (sapXep === "gia_tang") {
        if (a.giaHomNay === null && b.giaHomNay !== null) return 1;
        if (a.giaHomNay !== null && b.giaHomNay === null) return -1;
        if (a.giaHomNay !== null && b.giaHomNay !== null && a.giaHomNay !== b.giaHomNay) return a.giaHomNay - b.giaHomNay;
      }
      if (sapXep === "ban_nhieu" && a.soBan !== b.soBan) return b.soBan - a.soBan;
      return theoTen(a, b);
    });
  // Căn tự nhập xếp riêng nhóm `tu_nhap` ở cuối [MỞ: DC53 câu hỏi 7]
  const can = [...xep(dongCuaToi), ...xep(dongNguon), ...xep(dongTuNhap)].map((d) => d.can);
  return { tu, so_ngay: soNgay, ngay, so_can: { cua_toi: dongCuaToi.length, nguon_phong: dongNguon.length, tu_nhap: dongTuNhap.length }, can };
}

// ---- US16 · Nguồn phòng của sale (api/ket-noi-link.md: GET /ket-noi, GET /ket-noi/:id, DELETE /ket-noi/:id, bản sale) ----

const saleGoi = () => {
  const tk = nguoiGoi();
  if (tk.vai_chon !== "sale") throw new LoiApi("KHONG_TIM_THAY"); // PQ17.CHU: chủ nhà gọi bản sale thì như không có
  return tk;
};
// Chủ nhà đã rút quyền: tên cũ giữ ở dòng kết nối (QD18 r6)
const tenChuNha = (chu: TaiKhoanLuu | undefined, k: KetNoiLuu) => (chu ? chu.ten_hien_thi ?? chu.ho_ten ?? null : k.ten_chu_cu ?? null);
const theCanNguon = (c: CanLuu): CanNguonPhong => ({ id: c.id, ma_can: c.ma_can, toa_nha: c.toa_nha ?? null, so_phong_ngu: c.so_phong_ngu, so_giuong: c.so_giuong, loai_view: c.loai_view });

// GET /ket-noi, bản sale (mục "Danh sách căn và nguồn phòng" (US16) bước 2, 10): dòng da_ket_noi kèm căn trong phạm vi chia sẻ; dòng chủ nhà đã rút quyền chỉ có tên cũ và cờ,
// không căn (US22-NT10, PQ23.SALE). Dòng sale_bo, chu_ngung không trả. Giá căn, "Cập nhật … trước" chưa có [MỞ: CH-074, mục "Danh sách căn và nguồn phòng" (US16) bước 2].
export async function getNguonPhong(): Promise<NguonPhong> {
  await cho();
  const tk = saleGoi();
  const dong: DongNguonPhong[] = [];
  for (const k of db.ket_noi.filter((x) => x.sale_id === tk.id && (x.trang_thai === "da_ket_noi" || x.trang_thai === "da_xoa_tai_khoan"))) {
    const chu = db.tai_khoan.find((t) => t.id === k.chu_nha_id);
    if (k.trang_thai === "da_xoa_tai_khoan" || !chu) {
      dong.push({ id: k.id, trang_thai: "da_ket_noi", da_xoa_tai_khoan: true, ten_hien_thi: tenChuNha(chu, k) });
      continue;
    }
    dong.push({ id: k.id, trang_thai: "da_ket_noi", da_xoa_tai_khoan: false, ten_hien_thi: tenChuNha(chu, k), can: canTrongPhamVi(chu.id, k).map(theCanNguon) });
  }
  return { vai: "sale", nguon_phong: dong };
}

// GET /ket-noi/:id, bản sale (S6-04, mục "Chi tiết chủ nhà và bỏ nguồn phòng" (US16) bước 1 đến 3). Chủ nhà đã rút quyền, đã ngừng, sale đã bỏ: KHONG_CON_QUYEN kèm lý do (HV5).
export async function getNguonPhongChiTiet(id: string): Promise<ChiTietNguonPhong> {
  await cho();
  const tk = saleGoi();
  const k = db.ket_noi.find((x) => x.id === id && x.sale_id === tk.id);
  if (!k) throw new LoiApi("KHONG_TIM_THAY");
  const chu = db.tai_khoan.find((t) => t.id === k.chu_nha_id);
  if (k.trang_thai === "da_xoa_tai_khoan" || !chu) throw new LoiApi("KHONG_CON_QUYEN", "Chủ nhà đã xóa tài khoản");
  if (k.trang_thai === "chu_ngung") throw new LoiApi("KHONG_CON_QUYEN", "Chủ nhà đã ngừng chia sẻ lịch");
  if (k.trang_thai !== "da_ket_noi") throw new LoiApi("KHONG_CON_QUYEN");
  return {
    vai: "sale",
    id: k.id,
    ten_hien_thi: tenChuNha(chu, k),
    so_dien_thoai: chu.so_dien_thoai ?? null,
    ket_noi_luc: k.ket_noi_luc,
    lich_cap_nhat_luc: null,
    quyen_tinh_trang_coc: true,
    can: canTrongPhamVi(chu.id, k).map(theCanNguon),
  };
}

// DELETE /ket-noi/:id, bản sale (mục "Chi tiết chủ nhà và bỏ nguồn phòng" (US16) bước 6, mục "Danh sách căn và nguồn phòng" (US16) bước 11): bỏ nguồn thì dòng sang sale_bo, sale không còn thấy lịch của chủ đó (US16-NT15);
// dòng chủ nhà đã rút quyền thì xóa hẳn dòng, không đổi đặt phòng nào (US22-NT11). Gọi lại với dòng đã sale_bo trả như lần đầu.
export async function deleteKetNoi(id: string, khoa: string): Promise<KetQuaBoNguon> {
  await cho();
  const tk = saleGoi();
  if (khoa.length < 16 || khoa.length > 64) throw new LoiApi("DU_LIEU_SAI", "", "Idempotency-Key");
  return motLan(tk, `DELETE /ket-noi/${id}`, khoa, () => {
    const k = db.ket_noi.find((x) => x.id === id && x.sale_id === tk.id);
    if (!k) throw new LoiApi("KHONG_TIM_THAY");
    if (k.trang_thai === "da_xoa_tai_khoan" || (k.trang_thai === "da_ket_noi" && !db.tai_khoan.some((t) => t.id === k.chu_nha_id))) {
      db.ket_noi = db.ket_noi.filter((x) => x.id !== k.id);
      return { id: k.id, ket_qua: "da_xoa_dong" as const };
    }
    if (k.trang_thai === "chu_ngung") throw new LoiApi("KHONG_CON_QUYEN");
    if (k.trang_thai === "da_ket_noi") k.trang_thai = "sale_bo";
    else if (k.trang_thai !== "sale_bo") throw new LoiApi("KHONG_TIM_THAY");
    return { id: k.id, ket_qua: "sale_bo" as const };
  });
}

// ---- US12 · Tìm phòng trống (api/sale.md: GET /sale/tim, /sale/tim/lich-tuan, /sale/tim-gan-day) ----
const TOI_DA_DEM_TIM = 30;
const TOI_DA_TIM_GAN_DAY = 5; // GD17

// Mã Loại view của căn: căn mẫu ghi "view biển", căn US11 ghi mã "bien"
const maViewCua = (v: string | null): string | null => {
  if (!v) return null;
  if (MA_LOAI_VIEW.includes(v)) return v;
  const k = boDau(v.replace(/^view\s+/i, ""));
  return MA_LOAI_VIEW.find((m) => m.replace("_", " ") === k || (m === "bien" && k === "bien")) ?? null;
};

const kiemDieuKienTim = (q: Partial<DieuKienTim>): DieuKienTim => {
  const nhan = q.ngay_nhan ?? "";
  const tra = q.ngay_tra ?? "";
  if (!laNgay(nhan)) throw new LoiApi("DU_LIEU_SAI", "", "ngay_nhan");
  if (!laNgay(tra) || tra <= nhan || cacDem(nhan, tra).length > TOI_DA_DEM_TIM) throw new LoiApi("DU_LIEU_SAI", "", "ngay_tra");
  const phong = q.so_phong_ngu ?? [];
  if (phong.some((n) => !Number.isInteger(n) || n < 0 || n > 4)) throw new LoiApi("DU_LIEU_SAI", "", "so_phong_ngu");
  const view = q.loai_view ?? [];
  if (view.some((v) => !MA_LOAI_VIEW.includes(v))) throw new LoiApi("DU_LIEU_SAI", "", "loai_view");
  const toa = q.toa_nha_id ?? [];
  if (toa.some((t) => !db.toa_nha.some((x) => x.id === t))) throw new LoiApi("DU_LIEU_SAI", "", "toa_nha_id");
  return { ngay_nhan: nhan, ngay_tra: tra, so_phong_ngu: phong, loai_view: view, toa_nha_id: toa };
};

type UngVienTim = { c: CanLuu; chu: TaiKhoanLuu; k: KetNoiLuu };
// Căn sale được xem: căn chưa ẩn của chủ nhà đã kết nối (PQ3.SALE, PQ4.SALE). Bản này chưa có căn của tôi, căn tự nhập (US16).
const canSaleXemDuoc = (tk: TaiKhoanLuu): UngVienTim[] => {
  const ds: UngVienTim[] = [];
  for (const k of db.ket_noi.filter((x) => x.sale_id === tk.id && x.trang_thai === "da_ket_noi")) {
    const chu = db.tai_khoan.find((t) => t.id === k.chu_nha_id);
    if (!chu) continue;
    for (const c of canTrongPhamVi(chu.id, k)) ds.push({ c, chu, k });
  }
  return ds;
};

const quaBoLoc = (u: UngVienTim, dk: DieuKienTim) => {
  const toaTen = dk.toa_nha_id.map((id) => db.toa_nha.find((t) => t.id === id)?.ten);
  return (
    (dk.so_phong_ngu.length === 0 || dk.so_phong_ngu.includes(u.c.so_phong_ngu)) &&
    (dk.loai_view.length === 0 || dk.loai_view.includes(maViewCua(u.c.loai_view) ?? "")) &&
    (dk.toa_nha_id.length === 0 || (u.c.toa_nha !== null && toaTen.includes(u.c.toa_nha)))
  );
};
// Căn có lịch trống khi không có đặt phòng nào chiếm đêm trong [nhận, trả) (QT2.1)
const canTrongTheoDk = (tk: TaiKhoanLuu, dk: DieuKienTim) =>
  canSaleXemDuoc(tk)
    .filter((u) => quaBoLoc(u, dk) && demTrung(u.c.id, dk.ngay_nhan, dk.ngay_tra).length === 0)
    .sort((a, b) => a.c.ma_can.localeCompare(b.c.ma_can, "vi") || (a.c.toa_nha ?? "").localeCompare(b.c.toa_nha ?? "", "vi"));

const tongGiaTim = (tk: TaiKhoanLuu, u: UngVienTim, dk: DieuKienTim) => {
  const dem = cacDem(dk.ngay_nhan, dk.ngay_tra);
  const chu = dem.map((n) => giaDem(u.c, n));
  const ban = dem.map((n) => giaBanDem(tk, u.c, n));
  return {
    tong_gia_chu: chu.some((g) => g === null) ? null : chu.reduce((a: number, g) => a + (g as number), 0),
    tong_gia_ban: ban.some((g) => g === null) ? null : ban.reduce((a: number, g) => a + (g as number), 0),
  };
};

const raCanTim = (tk: TaiKhoanLuu, u: UngVienTim, dk: DieuKienTim): CanTim => ({
  id: u.c.id,
  ma_can: u.c.ma_can,
  toa_nha: u.c.toa_nha ? { id: u.c.toa_nha, ten: u.c.toa_nha } : null,
  nhom: "nguon_phong",
  so_phong_ngu: u.c.so_phong_ngu,
  so_giuong: u.c.so_giuong,
  loai_view: u.c.loai_view,
  chu_nha: { id: u.chu.id, ten_hien_thi: u.chu.ten_hien_thi ?? u.chu.ho_ten ?? null },
  // Server giả chưa theo dõi lúc chủ nhà sửa lịch: lấy 2 giờ trước cho thẻ có chữ "Lịch cập nhật 2 giờ trước"
  lich_cap_nhat_luc: new Date(Date.now() - 2 * MOT_GIO_MS).toISOString(),
  khong_co_lich: false,
  // Căn đã chia sẻ luôn có giá (QD20 r2 điểm 3, EN53)
  ...tongGiaTim(tk, u, dk),
});

const goiYTim = (tk: TaiKhoanLuu, dk: DieuKienTim): GoiYTim[] => {
  const ung: GoiYTim[] = [];
  const them = (loai: GoiYTim["loai"], d: DieuKienTim) => {
    const so = canTrongTheoDk(tk, d).length;
    if (so > 0) ung.push({ loai, dieu_kien: d, so_can_trong: so });
  };
  for (const n of [-1, 1]) them("doi_ngay", { ...dk, ngay_nhan: congNgay(dk.ngay_nhan, n), ngay_tra: congNgay(dk.ngay_tra, n) });
  if (dk.toa_nha_id.length > 0) them("bo_loc", { ...dk, toa_nha_id: [] });
  if (dk.loai_view.length > 0) them("bo_loc", { ...dk, loai_view: [] });
  if (dk.so_phong_ngu.length > 0) them("bo_loc", { ...dk, so_phong_ngu: [] });
  return ung;
};

// GET /sale/tim (api/sale.md): căn trống mọi đêm trong [ngày nhận, ngày trả), tổng giá chủ và giá bán, gợi ý khi không có căn trống.
// ghi_lich_su mặc định true: ghi Tìm gần đây của chính người gọi, giữ 5 dòng (GD17). Sale chưa kết nối, bị ngừng thì không có căn của chủ đó (PQ4.SALE).
// Chưa có sắp xếp khác "theo tên", lọc giá, lọc tòa "Khác", gợi ý đổi số phòng ngủ [MỞ: api/sale.md câu hỏi 4, 5, 6, 9].
export async function getSaleTim(q: Partial<DieuKienTim> & { ghi_lich_su?: boolean; bo_can_ids?: string[] }): Promise<KetQuaTim> {
  await cho();
  const tk = nguoiGoi();
  const dk = kiemDieuKienTim(q);
  const bo = q.bo_can_ids ?? [];
  const can = canTrongTheoDk(tk, dk)
    .filter((u) => !bo.includes(u.c.id))
    .map((u) => raCanTim(tk, u, dk));
  if (q.ghi_lich_su !== false) {
    db.tim_gan_day.unshift({
      sale_id: tk.id,
      id: idMoi("tim"),
      ngay_nhan: dk.ngay_nhan,
      ngay_tra: dk.ngay_tra,
      so_phong_ngu: dk.so_phong_ngu,
      loai_view: dk.loai_view,
      toa_nha: dk.toa_nha_id.map((id) => ({ id, ten: db.toa_nha.find((t) => t.id === id)!.ten })),
      tim_luc: new Date().toISOString(),
    });
    const cua = db.tim_gan_day.filter((m) => m.sale_id === tk.id);
    for (const cu of cua.slice(TOI_DA_TIM_GAN_DAY)) db.tim_gan_day.splice(db.tim_gan_day.indexOf(cu), 1);
  }
  return {
    ngay_nhan: dk.ngay_nhan,
    ngay_tra: dk.ngay_tra,
    so_dem: cacDem(dk.ngay_nhan, dk.ngay_tra).length,
    so_can_trong: can.filter((c) => !c.khong_co_lich).length,
    can,
    goi_y: can.length === 0 ? goiYTim(tk, dk) : [],
  };
}

// GET /sale/tim/lich-tuan: cùng điều kiện và cùng tập căn với GET /sale/tim (US12-NT8), bảng căn × 7 ngày từ ngày nhận. Không ghi Tìm gần đây.
export async function getSaleTimLichTuan(q: Partial<DieuKienTim>): Promise<LichTuanTim> {
  await cho();
  const tk = nguoiGoi();
  const dk = kiemDieuKienTim(q);
  const ngay = Array.from({ length: 7 }, (_, i) => congNgay(dk.ngay_nhan, i));
  const can: CanLichSale[] = canTrongTheoDk(tk, dk).map((u) => ({
    id: u.c.id,
    ma_can: u.c.ma_can,
    toa_nha: u.c.toa_nha ? { id: u.c.toa_nha, ten: u.c.toa_nha } : null,
    nhom: "nguon_phong",
    loai: "co_lich",
    so_phong_ngu: u.c.so_phong_ngu,
    chu_nha: { id: u.chu.id, ten_hien_thi: u.chu.ten_hien_thi ?? u.chu.ho_ten ?? null },
    lich_cap_nhat_luc: null,
    o: ngay.map((n) => {
      if (db.booking.some((b) => b.can_id === u.c.id && chiemDem(b) && b.ngay_nhan <= n && n < b.ngay_tra)) {
        return { ngay: n, trang_thai: "kin" as const };
      }
      return { ngay: n, trang_thai: "trong" as const, gia_ban: giaBanDem(tk, u.c, n) };
    }),
  }));
  return {
    ngay_nhan: dk.ngay_nhan,
    ngay_tra: dk.ngay_tra,
    so_dem: cacDem(dk.ngay_nhan, dk.ngay_tra).length,
    so_can_trong: can.filter((c) => c.loai === "co_lich").length,
    tu: dk.ngay_nhan,
    ngay,
    dem_khach_hoi: cacDem(dk.ngay_nhan, dk.ngay_tra).filter((n) => ngay.includes(n)),
    can,
  };
}

// GET /sale/tim-gan-day: 5 lần tìm gần nhất của chính người gọi, mới trước. Không nhận sale_id (luật chung 3).
export async function getSaleTimGanDay(): Promise<{ muc: MucTimGanDay[] }> {
  await cho();
  const tk = nguoiGoi();
  return {
    muc: db.tim_gan_day
      .filter((m) => m.sale_id === tk.id)
      .slice(0, TOI_DA_TIM_GAN_DAY)
      .map(({ sale_id: _s, ...m }) => ({ ...m })),
  };
}

// ---- US13 · Chi tiết căn, mức cộng (api/sale.md: GET /sale/can/:id, PUT /sale/can/:id/muc-cong) ----
const TOI_DA_DEM_CAN = 30;

// Căn sale được xem (PQ3.SALE, PQ4.SALE, PQ14.SALE): vai sale, kết nối còn hiệu lực, căn chưa ẩn và trong phạm vi chia sẻ.
// Chủ nhà, người chưa kết nối, căn của sale khác, căn đã ẩn: KHONG_TIM_THAY. Chủ nhà đã ngừng: KHONG_CON_QUYEN kèm lý do (HV5).
// Căn của tôi, căn tự nhập: KHONG_TIM_THAY tới khi có câu trả lời [MỞ: DC53 api/sale.md câu hỏi 2].
const canChoSale = (tk: TaiKhoanLuu, canId: string): UngVienTim => {
  if (tk.vai_chon !== "sale") throw new LoiApi("KHONG_TIM_THAY");
  const c = db.can.find((x) => x.id === canId && x.an_luc === null);
  if (!c) throw new LoiApi("KHONG_TIM_THAY");
  const chu = db.tai_khoan.find((t) => t.id === c.tai_khoan_id);
  const dong = db.ket_noi.filter((k) => k.sale_id === tk.id && k.chu_nha_id === c.tai_khoan_id);
  const k = dong.find((x) => x.trang_thai === "da_ket_noi");
  if (!k || !chu) {
    if (dong.some((x) => x.trang_thai === "chu_ngung")) throw new LoiApi("KHONG_CON_QUYEN", "Chủ nhà đã ngừng chia sẻ lịch");
    if (dong.some((x) => x.trang_thai === "da_xoa_tai_khoan")) throw new LoiApi("KHONG_CON_QUYEN", "Chủ nhà đã xóa tài khoản");
    throw new LoiApi("KHONG_TIM_THAY");
  }
  if (!canTrongPhamVi(chu.id, k).some((x) => x.id === c.id)) throw new LoiApi("KHONG_TIM_THAY");
  return { c, chu, k };
};

const kiemNgayCan = (nhan: unknown, tra: unknown): { nhan: string; tra: string } | null => {
  if (nhan === undefined && tra === undefined) return null;
  if (typeof nhan !== "string" || !laNgay(nhan)) throw new LoiApi("DU_LIEU_SAI", "", "ngay_nhan");
  if (typeof tra !== "string" || !laNgay(tra) || tra <= nhan || cacDem(nhan, tra).length > TOI_DA_DEM_CAN) throw new LoiApi("DU_LIEU_SAI", "", "ngay_tra");
  return { nhan, tra };
};

// Giá theo đêm của căn: cùng giaDem, giaBanDem với /sale/lich, /sale/tim nên cùng căn cùng đêm ra cùng giá bán.
// Căn đã chia sẻ luôn có giá chủ, giá bán, tổng (QD20 r2 điểm 3, EN53).
const giaCanTheoNgay = (tk: TaiKhoanLuu, u: UngVienTim, ngay: { nhan: string; tra: string } | null) => {
  if (!ngay) return {};
  const nhan = cacDem(ngay.nhan, ngay.tra);
  const dem: DemCanSale[] = nhan.map((n) => {
    const trang_thai = db.booking.some((b) => b.can_id === u.c.id && chiemDem(b) && b.ngay_nhan <= n && n < b.ngay_tra) ? ("kin" as const) : ("trong" as const);
    return { ngay: n, trang_thai, gia_chu: giaDem(u.c, n), gia_ban: giaBanDem(tk, u.c, n) };
  });
  const tong = (ds: (number | null | undefined)[]) => (ds.some((g) => g === null || g === undefined) ? null : ds.reduce((a: number, g) => a + (g as number), 0));
  return { dem, tong_gia_chu: tong(dem.map((d) => d.gia_chu)), tong_gia_ban: tong(dem.map((d) => d.gia_ban)) };
};

const mucCongCua = (tk: TaiKhoanLuu, canId: string) => {
  const dong = db.muc_cong.find((m) => m.sale_id === tk.id && m.can_id === canId);
  return { so_tien: dong?.so_tien ?? tk.muc_cong_mac_dinh ?? 0, rieng: !!dong };
};

export async function getSaleCan(canId: string, q: { ngay_nhan?: string; ngay_tra?: string } = {}): Promise<ChiTietCanSale> {
  await cho();
  const tk = nguoiGoi();
  const u = canChoSale(tk, canId);
  const ngay = kiemNgayCan(q.ngay_nhan, q.ngay_tra);
  dungAnhMau(u.c);
  const toa = u.c.toa_nha ? db.toa_nha.find((t) => t.ten === u.c.toa_nha) : undefined;
  const het = new Date(Date.now() + MOT_GIO_MS).toISOString();
  return {
    id: u.c.id,
    ma_can: u.c.ma_can,
    toa_nha: u.c.toa_nha ? { id: toa?.id ?? u.c.toa_nha, ten: u.c.toa_nha, khu_vuc: toa?.khu_vuc ?? null } : null,
    so_phong_ngu: u.c.so_phong_ngu,
    so_giuong: u.c.so_giuong,
    loai_view: u.c.loai_view,
    mo_ta_gui_khach: u.c.mo_ta_gui_khach ?? null,
    anh: db.anh
      .filter((a) => a.can_id === u.c.id && a.thu_tu !== null)
      .sort((a, b) => a.thu_tu! - b.thu_tu!)
      .map((a) => ({ thu_tu: a.thu_tu!, duong_dan: a.nguon, het_han_luc: het })),
    // Server giả chưa theo dõi lúc chủ nhà sửa lịch: lấy 2 giờ trước như thẻ ở S2
    lich_cap_nhat_luc: new Date(Date.now() - 2 * MOT_GIO_MS).toISOString(),
    chu_nha: {
      id: u.chu.id,
      ten_hien_thi: u.chu.ten_hien_thi ?? u.chu.ho_ten ?? null,
      so_dien_thoai: u.chu.so_dien_thoai ?? null,
      so_can_chia_se: canTrongPhamVi(u.chu.id, u.k).length,
    },
    gio_nhan: u.chu.gio_nhan ?? "14:00",
    gio_tra: u.chu.gio_tra ?? "12:00",
    muc_cong: mucCongCua(tk, u.c.id),
    lam_tron_50k: tk.lam_tron_50k ?? false,
    ...giaCanTheoNgay(tk, u, ngay),
  };
}

// PUT /sale/can/:id/muc-cong { so_tien, ngay_nhan?, ngay_tra? }: mức cộng riêng của người gọi cho căn này (mục "Chi tiết căn và giá bán" (US13) bước 4, PQ11.SALE).
// Thân có sale_id hay trường lạ thì bỏ qua: dòng luôn ghi cho người gọi. Có ngày thì trả giá theo mức mới.
export async function putSaleCanMucCong(canId: string, than: { so_tien: number; ngay_nhan?: string; ngay_tra?: string }, khoa: string): Promise<KetQuaMucCong> {
  await cho();
  const tk = nguoiGoi();
  const u = canChoSale(tk, canId);
  const so = (than as { so_tien?: unknown }).so_tien;
  if (!Number.isInteger(so) || (so as number) < 0 || (so as number) > MAX_MUC_CONG) throw new LoiApi("DU_LIEU_SAI", "", "so_tien");
  const ngay = kiemNgayCan(than.ngay_nhan, than.ngay_tra);
  if (khoa.length < 16 || khoa.length > 64) throw new LoiApi("DU_LIEU_SAI", "", "Idempotency-Key");
  return motLan(tk, `PUT /sale/can/${canId}/muc-cong`, khoa, () => {
    const dong = db.muc_cong.find((m) => m.sale_id === tk.id && m.can_id === u.c.id);
    if (dong) dong.so_tien = so as number;
    else db.muc_cong.push({ sale_id: tk.id, can_id: u.c.id, so_tien: so as number });
    return { can_id: u.c.id, so_tien: so as number, ...giaCanTheoNgay(tk, u, ngay) };
  });
}

// ---- US14 · Gửi khách (api/sale.md: POST /sale/gui-khach/xem, POST /sale/gui-khach/da-gui) ----
const TOI_DA_CAN_GUI_KHACH = 20; // giới hạn kỹ thuật của api/sale.md; số tối đa theo nghiệp vụ [MỞ: câu hỏi 17]

const canDungChu = (c: CanLuu): CanDeDungChu => ({
  ten: c.toa_nha ? `${c.toa_nha} ${c.ma_can}` : c.ma_can,
  so_phong_ngu: c.so_phong_ngu,
  so_giuong: c.so_giuong,
  loai_view: maViewCua(c.loai_view),
  khu_vuc: (c.toa_nha ? db.toa_nha.find((t) => t.ten === c.toa_nha)?.khu_vuc : null) ?? null,
});

// Tổng giá bán các đêm; đêm nào chưa có giá thì không có số tiền. QD20 r2: căn đã chia sẻ thì luôn có giá, không xét quyen_gia_tung_dem.
const tongGiaBanKhoang = (tk: TaiKhoanLuu, c: CanLuu, nhan: string, tra: string): number | null => {
  const g = cacDem(nhan, tra).map((n) => giaBanDem(tk, c, n));
  return g.some((x) => x === null) ? null : g.reduce((a: number, x) => a + (x as number), 0);
};

const kiemKhoangGuiKhach = (nhan: unknown, tra: unknown) => {
  const k = kiemNgayCan(nhan, tra);
  if (!k) throw new LoiApi("DU_LIEU_SAI", "", "ngay_nhan");
  return k;
};

// POST /sale/gui-khach/xem: chữ theo mẫu của sale, chỉ giá bán, đường dẫn ảnh. Không ghi gì. Một căn không có quyền thì cả lệnh lỗi.
// Chưa có căn của tôi, căn tự nhập (US16): như canChoSale. Không có giá chủ, mức cộng, số khách, tiện ích trong kết quả (PQ5.SALE, PQ11.KHACH).
export async function postSaleGuiKhachXem(than: { can_ids: string[]; ngay_nhan: string; ngay_tra: string }): Promise<KetQuaGuiKhachXem> {
  await cho();
  const tk = nguoiGoi();
  const ids = than.can_ids;
  if (!Array.isArray(ids) || ids.length === 0 || ids.length > TOI_DA_CAN_GUI_KHACH || new Set(ids).size !== ids.length || ids.some((i) => typeof i !== "string")) {
    throw new LoiApi("DU_LIEU_SAI", "", "can_ids");
  }
  const ngay = kiemKhoangGuiKhach(than.ngay_nhan, than.ngay_tra);
  const ung = ids.map((id) => canChoSale(tk, id));
  const soDem = cacDem(ngay.nhan, ngay.tra).length;
  const het = new Date(Date.now() + MOT_GIO_MS).toISOString();
  const can = ung.map((u) => {
    dungAnhMau(u.c);
    const anh = db.anh
      .filter((a) => a.can_id === u.c.id && a.thu_tu !== null)
      .sort((a, b) => a.thu_tu! - b.thu_tu!)
      .map((a) => ({ thu_tu: a.thu_tu!, duong_dan: a.nguon, het_han_luc: het }));
    const d = canDungChu(u.c);
    return {
      u,
      d,
      gia: tongGiaBanKhoang(tk, u.c, ngay.nhan, ngay.tra),
      ra: {
        id: u.c.id,
        ten: d.ten,
        chu: chuMotCan(d, ngay.nhan, ngay.tra, soDem, tongGiaBanKhoang(tk, u.c, ngay.nhan, ngay.tra)),
        so_anh: anh.length,
        anh,
        gio_nhan: u.chu.gio_nhan ?? "14:00",
        gio_tra: u.chu.gio_tra ?? "12:00",
      },
    };
  });
  return {
    ngay_nhan: ngay.nhan,
    ngay_tra: ngay.tra,
    so_dem: soDem,
    chu_tat_ca: dungChuTheoMau(tk.mau_tin_gui_khach ?? null, ngay.nhan, ngay.tra, soDem, can.map((c) => ({ moTa: dongMoTa(c.d), giaBan: c.gia })), tk.ten_hien_thi ?? tk.ho_ten ?? null),
    can: can.map((c) => c.ra),
  };
}

// POST /sale/gui-khach/da-gui: ghi một lần gửi (căn, đêm, lúc gửi), không ghi khách (QD11). sale_id luôn là người gọi (PQ12.SALE).
// Cùng sale, căn, đêm, ngày chỉ một dòng. Báo "căn đã gửi có người đặt" chạy ở server thật; server giả chưa báo (P13: US17).
export async function postSaleGuiKhachDaGui(than: { can_id: string; ngay_nhan: string; ngay_tra: string }, khoa: string): Promise<KetQuaDaGui> {
  await cho();
  const tk = nguoiGoi();
  const u = canChoSale(tk, than.can_id);
  const ngay = kiemKhoangGuiKhach(than.ngay_nhan, than.ngay_tra);
  if (khoa.length < 16 || khoa.length > 64) throw new LoiApi("DU_LIEU_SAI", "", "Idempotency-Key");
  return motLan(tk, "POST /sale/gui-khach/da-gui", khoa, () => {
    const ngayGui = homNay();
    const co = db.lan_gui_khach.find((l) => l.sale_id === tk.id && l.can_id === u.c.id && l.ngay_nhan === ngay.nhan && l.ngay_tra === ngay.tra && l.ngay_gui === ngayGui);
    if (co) return { id: co.id, da_ghi_truoc: true };
    const moi = { id: idMoi("gui"), sale_id: tk.id, can_id: u.c.id, ngay_nhan: ngay.nhan, ngay_tra: ngay.tra, gui_luc: new Date().toISOString(), ngay_gui: ngayGui };
    db.lan_gui_khach.push(moi);
    return { id: moi.id, da_ghi_truoc: false };
  });
}

// ---- US15 · Yêu cầu đặt phòng (api/yeu-cau.md). Server thật: src/server/api/yeu-cau.js ----
// Đồng hồ của yêu cầu: giờ thật cộng độ lệch (test đẩy giờ tới hạn 14 ngày)
let lechGioYeuCau = 0;
const bayGioYC = () => Date.now() + lechGioYeuCau;
const isoYC = (ms: number) => new Date(ms).toISOString();

// Quá het_han_luc thì coi là het_han dù chưa ghi (api/yeu-cau.md Trạng thái và hết hạn lúc đọc)
const trangThaiYC = (y: YeuCauLuu): TrangThaiYeuCau => (y.trang_thai === "cho_chu" && Date.parse(y.het_han_luc) <= bayGioYC() ? "het_han" : y.trang_thai);
const dangCho = (y: YeuCauLuu) => trangThaiYC(y) === "cho_chu";
const tenTk = (t: TaiKhoanLuu | undefined) => t?.ten_hien_thi ?? t?.ho_ten ?? null;
const benKia = (t: TaiKhoanLuu | undefined): BenKiaYeuCau => ({ id: t?.id ?? "", ten_hien_thi: tenTk(t), so_dien_thoai: t?.so_dien_thoai ?? null, da_xoa_tai_khoan: !t });

const raYeuCauChung = (y: YeuCauLuu) => {
  const c = db.can.find((x) => x.id === y.can_id);
  return {
    id: y.id,
    trang_thai: trangThaiYC(y),
    can: { id: y.can_id, ma_can: c?.ma_can ?? "", ten_toa_nha: c?.toa_nha ?? null },
    ngay_nhan: y.ngay_nhan,
    ngay_tra: y.ngay_tra,
    so_dem: cacDem(y.ngay_nhan, y.ngay_tra).length,
    gia_chu: y.gia_chu,
    loi_nhan: y.loi_nhan,
    ly_do: y.ly_do,
    gui_luc: y.gui_luc,
    het_han_luc: y.het_han_luc,
    tra_loi_luc: y.tra_loi_luc,
    booking_id: y.booking_id,
  };
};

// Dạng SALE: có gia_ban, chu_nha; tien_chenh chỉ khi da_chot. Không có sale, trung_yeu_cau.
const raYeuCauSale = (y: YeuCauLuu): YeuCauSale => {
  const chu = db.tai_khoan.find((t) => t.id === y.chu_nha_id);
  return {
    ...raYeuCauChung(y),
    gia_ban: y.gia_ban,
    ...(y.trang_thai === "da_chot" ? { tien_chenh: y.gia_ban - y.gia_chu } : {}),
    chu_nha: { ...benKia(chu), ...(chu ? { zalo_id: chu.zalo_id } : {}) },
  };
};

const chungDem = (a: { ngay_nhan: string; ngay_tra: string }, nhan: string, tra: string) => a.ngay_nhan < tra && nhan < a.ngay_tra;

// Dạng CHU: chỉ gia_chu (không gia_ban, tien_chenh), có sale và cờ trùng đêm với yêu cầu chờ khác (US15-NT17)
const raYeuCauChu = (y: YeuCauLuu): YeuCauChu => {
  const sale = db.tai_khoan.find((t) => t.id === y.sale_id);
  const r: YeuCauChu = { ...raYeuCauChung(y), sale: benKia(sale) };
  if (r.trang_thai === "cho_chu") {
    r.trung_yeu_cau = db.yeu_cau
      .filter((x) => x.id !== y.id && x.can_id === y.can_id && dangCho(x) && chungDem(x, y.ngay_nhan, y.ngay_tra))
      .map((x) => ({ id: x.id, ten_sale: tenTk(db.tai_khoan.find((t) => t.id === x.sale_id)) ?? null, ngay_nhan: x.ngay_nhan, ngay_tra: x.ngay_tra }));
  }
  return r;
};

// Yêu cầu chờ trùng đêm với đặt phòng vừa ghi thì Bị từ chối, lý do chu_nhan_dat_khac (QT1.4-VD2, US15-NT18, NT3, GD11)
const tuChoiYeuCauTrung = (canId: string, nhan: string, tra: string, boQuaId?: string): YeuCauLuu[] => {
  const lucNay = isoYC(bayGioYC());
  const ds = db.yeu_cau.filter((y) => y.id !== boQuaId && y.can_id === canId && dangCho(y) && chungDem(y, nhan, tra));
  for (const y of ds) {
    y.trang_thai = "bi_tu_choi";
    y.ly_do = "chu_nhan_dat_khac";
    y.tra_loi_luc = lucNay;
  }
  return ds;
};

const kiemKhoa = (khoa: string) => {
  if (khoa.length < 16 || khoa.length > 64) throw new LoiApi("DU_LIEU_SAI", "", "Idempotency-Key");
};
const yeuCauCuaSale = (tk: TaiKhoanLuu, id: string) => {
  const y = db.yeu_cau.find((x) => x.id === id && x.sale_id === tk.id);
  if (!y) throw new LoiApi("KHONG_TIM_THAY");
  return y;
};
const yeuCauCuaChu = (tk: TaiKhoanLuu, id: string) => {
  const y = db.yeu_cau.find((x) => x.id === id && x.chu_nha_id === tk.id);
  if (!y) throw new LoiApi("KHONG_TIM_THAY");
  return y;
};

// POST /yeu-cau: sale gửi. Giá do server tính, thân có gia_chu, gia_ban thì bỏ qua (PQ11.SALE). Đêm đã có đặt phòng: TRUNG_LICH.
// QD20 r2: căn đã chia sẻ thì sale luôn thấy giá, không xét quyen_gia_tung_dem. Có đêm chưa đặt giá: [MỞ: api/yeu-cau.md câu hỏi 2], trả DU_LIEU_SAI.
export async function postYeuCau(than: ThanYeuCau, khoa: string): Promise<YeuCauSale> {
  await cho();
  const tk = nguoiGoi();
  kiemKhoa(khoa);
  return motLan(tk, "POST /yeu-cau", khoa, () => {
    let u: UngVienTim;
    try {
      u = canChoSale(tk, than?.can_id);
    } catch (e) {
      if (e instanceof LoiApi && e.loi === "KHONG_CON_QUYEN" && e.ly_do === "Chủ nhà đã xóa tài khoản") throw new LoiApi("KHONG_CON_QUYEN", "Chủ nhà đã xóa tài khoản trên Home247");
      throw e;
    }
    kiemNgay(than.ngay_nhan, than.ngay_tra);
    const loi = than.loi_nhan;
    if (loi !== undefined && loi !== null && (typeof loi !== "string" || loi.length > TOI_DA_LOI_NHAN)) throw new LoiApi("DU_LIEU_SAI", "", "loi_nhan");
    if (demTrung(u.c.id, than.ngay_nhan, than.ngay_tra).length) throw new LoiApi("TRUNG_LICH", "Căn này đã được đặt rồi", "ngay_nhan");
    const dem = cacDem(than.ngay_nhan, than.ngay_tra);
    const chu = dem.map((n) => giaDem(u.c, n));
    const ban = tongGiaBanKhoang(tk, u.c, than.ngay_nhan, than.ngay_tra);
    if (chu.some((g) => g === null) || ban === null) throw new LoiApi("DU_LIEU_SAI", "Có đêm chưa đặt giá", "ngay_nhan");
    const gui = bayGioYC();
    const y: YeuCauLuu = {
      id: idMoi("yc"),
      can_id: u.c.id,
      chu_nha_id: u.chu.id,
      sale_id: tk.id,
      trang_thai: "cho_chu",
      ngay_nhan: than.ngay_nhan,
      ngay_tra: than.ngay_tra,
      gia_chu: chu.reduce((a: number, g) => a + (g as number), 0),
      gia_ban: ban,
      loi_nhan: typeof loi === "string" && loi.trim() ? loi.trim() : null,
      ly_do: null,
      gui_luc: isoYC(gui),
      het_han_luc: isoYC(gui + HAN_TRA_LOI_NGAY * 24 * MOT_GIO_MS),
      tra_loi_luc: null,
      booking_id: null,
    };
    db.yeu_cau.push(y);
    return raYeuCauSale(y);
  });
}

// GET /yeu-cau?phia=nhan|gui&trang_thai=a,b&can_id=: mỗi phía một dạng, chỉ yêu cầu của người gọi. Mới trước.
export async function getYeuCauDS(q: { phia: "nhan" | "gui"; trang_thai?: TrangThaiYeuCau[]; can_id?: string }): Promise<{ muc: (YeuCauChu | YeuCauSale)[]; truoc_tiep: null }> {
  await cho();
  const tk = nguoiGoi();
  if (q.phia !== "nhan" && q.phia !== "gui") throw new LoiApi("DU_LIEU_SAI", "", "phia");
  if (q.phia === "gui" && q.can_id !== undefined) throw new LoiApi("DU_LIEU_SAI", "", "can_id");
  const hopLe: TrangThaiYeuCau[] = ["cho_chu", "da_chot", "bi_tu_choi", "het_han", "da_huy"];
  if ((q.trang_thai ?? []).some((t) => !hopLe.includes(t))) throw new LoiApi("DU_LIEU_SAI", "", "trang_thai");
  const ds = db.yeu_cau
    .filter((y) => (q.phia === "nhan" ? y.chu_nha_id === tk.id && (q.can_id === undefined || y.can_id === q.can_id) : y.sale_id === tk.id))
    .filter((y) => !q.trang_thai || q.trang_thai.length === 0 || q.trang_thai.includes(trangThaiYC(y)))
    .sort((a, b) => b.gui_luc.localeCompare(a.gui_luc));
  return { muc: ds.map((y) => (q.phia === "nhan" ? raYeuCauChu(y) : raYeuCauSale(y))), truoc_tiep: null };
}

// GET /yeu-cau/:id: dạng theo vai của người gọi với yêu cầu đó. Người khác: KHONG_TIM_THAY, không lộ yêu cầu có tồn tại (PQ10).
export async function getYeuCau(id: string): Promise<YeuCauChu | YeuCauSale> {
  await cho();
  const tk = nguoiGoi();
  const y = db.yeu_cau.find((x) => x.id === id && (x.chu_nha_id === tk.id || x.sale_id === tk.id));
  if (!y) throw new LoiApi("KHONG_TIM_THAY");
  return y.chu_nha_id === tk.id ? raYeuCauChu(y) : raYeuCauSale(y);
}

// POST /yeu-cau/:id/chap-nhan: tạo đặt phòng tu_yeu_cau (giá chủ lấy từ yêu cầu, giá bán giữ như đã báo, quyết định 04/11),
// đổi yêu cầu chờ trùng đêm sang Bị từ chối. Không còn chờ: TRANG_THAI_DA_DOI. Hai lệnh cùng lúc chỉ một lệnh qua.
export async function postYeuCauChapNhan(id: string, khoa: string): Promise<KetQuaChapNhan> {
  await cho();
  const tk = nguoiGoi();
  kiemKhoa(khoa);
  return motLan(tk, `POST /yeu-cau/${id}/chap-nhan`, khoa, () => {
    const y = yeuCauCuaChu(tk, id);
    if (!dangCho(y)) throw new LoiApi("TRANG_THAI_DA_DOI");
    const c = db.can.find((x) => x.id === y.can_id);
    if (!c) throw new LoiApi("KHONG_TIM_THAY");
    if (demTrung(c.id, y.ngay_nhan, y.ngay_tra).length) throw new LoiApi("TRUNG_LICH", "Căn này đã được đặt rồi", "ngay_nhan");
    const kn = db.ket_noi.find((k) => k.chu_nha_id === tk.id && k.sale_id === y.sale_id);
    const luc = isoYC(bayGioYC());
    const b: BookingLuu = {
      id: idMoi("booking"),
      can_id: c.id,
      ngay_nhan: y.ngay_nhan,
      ngay_tra: y.ngay_tra,
      trang_thai: "hieu_luc",
      ten_sale: kn?.ten ?? tenTk(db.tai_khoan.find((t) => t.id === y.sale_id)),
      sale_id: kn?.id ?? null,
      ten_khach: null,
      tien_phong: y.gia_chu,
      trang_thai_tien: "chua_coc",
      tien_coc: null,
      so_khach: null,
      gio_nhan: tk.gio_nhan ?? "14:00",
      gio_tra: tk.gio_tra ?? "12:00",
      ghi_chu: null,
      dem: chiaTienTheoDem(cacDem(y.ngay_nhan, y.ngay_tra).map((ngay) => ({ ngay, gia_chu: giaDem(c, ngay) })), y.gia_chu),
      gia_ban: y.gia_ban,
      tao_luc: luc,
      cap_nhat_luc: luc,
    };
    db.booking.push(b);
    y.trang_thai = "da_chot";
    y.tra_loi_luc = luc;
    y.booking_id = b.id;
    const biTuChoi = tuChoiYeuCauTrung(c.id, y.ngay_nhan, y.ngay_tra, y.id);
    return {
      yeu_cau: raYeuCauChu(y),
      booking: {
        id: b.id,
        can_id: c.id,
        ngay_nhan: b.ngay_nhan,
        ngay_tra: b.ngay_tra,
        so_dem: cacDem(b.ngay_nhan, b.ngay_tra).length,
        tien_phong: y.gia_chu,
        trang_thai_tien: "chua_coc",
        gio_nhan: b.gio_nhan!,
        gio_tra: b.gio_tra!,
      },
      yeu_cau_bi_tu_choi: biTuChoi.map((x): YeuCauTrung => ({ id: x.id, ten_sale: tenTk(db.tai_khoan.find((t) => t.id === x.sale_id)) ?? null, ngay_nhan: x.ngay_nhan, ngay_tra: x.ngay_tra })),
    };
  });
}

// POST /yeu-cau/:id/tu-choi { ly_do }: ba lý do của CN9. Lý do khác (kể cả chu_nhan_dat_khac): DU_LIEU_SAI.
export async function postYeuCauTuChoi(id: string, than: { ly_do: LyDoTuChoi }, khoa: string): Promise<YeuCauChu> {
  await cho();
  const tk = nguoiGoi();
  kiemKhoa(khoa);
  return motLan(tk, `POST /yeu-cau/${id}/tu-choi`, khoa, () => {
    const y = yeuCauCuaChu(tk, id);
    if (!CAC_LY_DO_TU_CHOI.includes(than?.ly_do)) throw new LoiApi("DU_LIEU_SAI", "", "ly_do");
    if (!dangCho(y)) throw new LoiApi("TRANG_THAI_DA_DOI");
    y.trang_thai = "bi_tu_choi";
    y.ly_do = than.ly_do;
    y.tra_loi_luc = isoYC(bayGioYC());
    return raYeuCauChu(y);
  });
}

// POST /yeu-cau/:id/huy: sale hủy yêu cầu chờ của mình. Chủ nhà, sale khác: KHONG_TIM_THAY.
export async function postYeuCauHuy(id: string, khoa: string): Promise<YeuCauSale> {
  await cho();
  const tk = nguoiGoi();
  kiemKhoa(khoa);
  return motLan(tk, `POST /yeu-cau/${id}/huy`, khoa, () => {
    const y = yeuCauCuaSale(tk, id);
    if (!dangCho(y)) throw new LoiApi("TRANG_THAI_DA_DOI");
    y.trang_thai = "da_huy";
    return raYeuCauSale(y);
  });
}

// Phía app: đã có phiên chưa (để màn cần tài khoản đưa về A1)
export const coPhien = () => phienCuaApp !== null && db.phien.has(phienCuaApp);

// ---- Bản thử: chỉ dùng khi chạy dữ liệu giả ----
export const banThu = {
  // Xóa sạch: máy này thành người dùng mới, mở app lại từ A1
  xoaSach() {
    db = dbMoi();
    zaloIdHienTai = ZALO_ID_MAY_NAY;
    tenZalo.clear();
    phienCuaApp = null;
    homNayGia = null;
    lechGioYeuCau = 0;
  },
  // Nạp dữ liệu mẫu DLM: máy này là Chị Hoa, đã chọn vai chủ nhà, có 1509 và 3402,
  // thêm 2501 khi coCanThuBa (canvas CN1-02). Hôm nay là 07/10/2026 (DLM.1). Giá DLM.3, 4 sale DLM.2.
  // coDatPhong: thêm B1 đến B9 của DLM.4 (dữ liệu thử của US3).
  napDuLieuMau(coCanThuBa = false, coDatPhong = false) {
    db = dbMoi();
    db.ngay_le = NGAY_LE_MAU.map((m) => ({ ...m, id: idMoi("ngayle") }));
    zaloIdHienTai = CHI_HOA.zalo_id;
    const tk: TaiKhoanLuu = {
      id: idMoi("tk"),
      zalo_id: CHI_HOA.zalo_id,
      vai_chon: "chu_nha",
      dong_y_dieu_khoan_luc: "2026-09-01T02:00:00.000Z",
      ho_ten: CHI_HOA.ho_ten,
      ten_hien_thi: CHI_HOA.ten,
      so_dien_thoai: CHI_HOA.so_dien_thoai,
    };
    db.tai_khoan.push(tk);
    // Căn đầu danh sách mẫu tạo sau cùng để lên đầu như canvas CN5
    // Tạo theo thứ tự 1509, 3402, 2501 như Chị Hoa tự thêm (US1-KB11, KB13, US2-KB7): lịch xếp chip theo thứ tự tạo
    // (canvas CN1, CN1-02), danh sách căn CN5 xếp căn mới lên đầu.
    const dsMau = coCanThuBa ? [...CAN_CUA_CHI_HOA, CAN_THU_BA_CHI_HOA] : CAN_CUA_CHI_HOA;
    dsMau.forEach((c, i) => {
      const g = GIA_THANG_MAU[c.ma_can];
      const gia: GiaCan | undefined = g && {
        thang: Object.fromEntries((THANG_CO_GIA_MAU[c.ma_can] ?? []).map((t) => [t, g])),
        dip: GIA_DIP_MAU.filter((d) => d.ma_can === c.ma_can).map((d) => ({
          id: idMoi("dip"),
          ten: `Dịp đặc biệt ${chuNgayNgan(d.tu_ngay)} – ${chuNgayNgan(d.den_ngay)}`,
          la_ngay_le: false,
          tu_ngay: d.tu_ngay,
          den_ngay: d.den_ngay,
          gia_moi_dem: d.gia_moi_dem,
        })),
      };
      db.can.push({ ...c, id: idMoi("can"), tai_khoan_id: tk.id, tao_luc: `2026-09-0${i + 1}T02:00:00.000Z`, an_luc: null, gia });
    });
    for (const m of SALE_CUA_CHI_HOA) {
      db.ket_noi.push({
        id: idMoi("kn"),
        chu_nha_id: tk.id,
        sale_id: null,
        ten: m.ten,
        so_dien_thoai: m.so_dien_thoai,
        trang_thai: "da_ket_noi",
        nguon: "link_moi",
        ket_noi_luc: m.ket_noi_luc,
      });
    }
    if (coDatPhong) {
      for (const m of BOOKING_MAU) {
        const c = db.can.find((x) => x.ma_can === m.ma_can)!;
        const dem = cacDem(m.ngay_nhan, m.ngay_tra).map((ngay) => ({ ngay, gia_chu: giaDem(c, ngay) }));
        db.booking.push({
          id: idMoi("booking"),
          can_id: c.id,
          ngay_nhan: m.ngay_nhan,
          ngay_tra: m.ngay_tra,
          trang_thai: "hieu_luc",
          ten_sale: m.sale,
          sale_id: db.ket_noi.find((k) => k.ten === m.sale)?.id ?? null,
          ten_khach: null,
          tien_phong: m.tien_phong,
          trang_thai_tien: m.trang_thai_tien,
          tien_coc: m.tien_coc,
          dem: chiaTienTheoDem(dem, m.tien_phong),
        });
      }
    }
    if (coDatPhong) db.doanh_thu_cu = { ...DOANH_THU_CU_MAU };
    homNayGia = HOM_NAY_MAU;
    phienCuaApp = idMoi("phien");
    db.phien.set(phienCuaApp, { zalo_id: CHI_HOA.zalo_id });
  },
  // Cho test: đổi người dùng Zalo trên máy (gọi postPhien sau đó để có phiên). ten: tên Zalo của ID đó.
  dungZaloId(zaloId: string, ten?: string) {
    zaloIdHienTai = zaloId;
    if (ten) tenZalo.set(zaloId, ten);
  },
  // Dữ liệu mẫu cho sale (US6): thêm vào dữ liệu Chị Hoa (có B1 đến B9) chủ nhà Anh Tuấn với 2 căn và 4 tài khoản sale.
  // Hùng kết nối Chị Hoa và Anh Tuấn; Lan, Nga, Minh chỉ Chị Hoa. nguoi: máy này là ai. "moi" là Zalo thử B, chưa có tài khoản,
  // mở app từ A1. Trả mã link mời của hai chủ nhà (dùng cho US6-KB1 đến KB11).
  napDuLieuSale(nguoi: "hung" | "lan" | "moi" = "hung") {
    banThu.napDuLieuMau(false, true);
    const hoa = db.tai_khoan[0];
    const sale = SALE_MAU.map((m) => {
      const tk: TaiKhoanLuu = {
        id: idMoi("tk"),
        zalo_id: m.zalo_id,
        vai_chon: "sale",
        dong_y_dieu_khoan_luc: "2026-09-01T02:00:00.000Z",
        ten_hien_thi: m.ten,
        so_dien_thoai: m.so_dien_thoai,
        muc_cong_mac_dinh: m.muc_cong_mac_dinh,
        lam_tron_50k: false,
      };
      db.tai_khoan.push(tk);
      // Dòng ket_noi của Chị Hoa với sale này đã có từ napDuLieuMau: gắn tài khoản vào
      const dong = db.ket_noi.find((k) => k.chu_nha_id === hoa.id && k.ten === m.ten)!;
      dong.sale_id = tk.id;
      for (const c of db.can.filter((x) => x.tai_khoan_id === hoa.id && m.muc_cong_can[x.ma_can] !== undefined)) {
        db.muc_cong.push({ sale_id: tk.id, can_id: c.id, so_tien: m.muc_cong_can[c.ma_can] });
      }
      return tk;
    });
    const tuan: TaiKhoanLuu = {
      id: idMoi("tk"),
      zalo_id: ANH_TUAN.zalo_id,
      vai_chon: "chu_nha",
      dong_y_dieu_khoan_luc: "2026-09-01T02:00:00.000Z",
      ho_ten: ANH_TUAN.ho_ten,
      ten_hien_thi: ANH_TUAN.ten,
      so_dien_thoai: ANH_TUAN.so_dien_thoai,
    };
    db.tai_khoan.push(tuan);
    CAN_CUA_ANH_TUAN.forEach((m, i) => {
      const { anh, gia, ...c } = m;
      const can: CanLuu = {
        ...c,
        id: idMoi("can"),
        tai_khoan_id: tuan.id,
        tao_luc: `2026-09-1${i}T02:00:00.000Z`,
        an_luc: null,
        gia: { thang: Object.fromEntries(["2026-09", "2026-10", "2026-11", "2026-12"].map((t) => [t, gia])), dip: [] },
      };
      db.can.push(can);
      const mucCong = SALE_MAU[0].muc_cong_can[can.ma_can];
      if (mucCong !== undefined) db.muc_cong.push({ sale_id: sale[0].id, can_id: can.id, so_tien: mucCong });
      db.anh.push({ id: idMoi("anh"), tai_khoan_id: tuan.id, can_id: can.id, thu_tu: 1, nguon: anh, tao_luc: can.tao_luc });
    });
    const hung = sale[0];
    const ketNoiHung: KetNoiLuu = {
      id: idMoi("kn"),
      chu_nha_id: tuan.id,
      sale_id: hung.id,
      ten: "Sale Hùng",
      so_dien_thoai: null,
      trang_thai: "da_ket_noi",
      nguon: "link_moi",
      ket_noi_luc: "2026-10-01T09:00:00+07:00",
    };
    db.ket_noi.push(ketNoiHung);
    for (const m of BOOKING_ANH_TUAN_MAU) {
      const c = db.can.find((x) => x.tai_khoan_id === tuan.id && x.ma_can === m.ma_can)!;
      const dem = cacDem(m.ngay_nhan, m.ngay_tra).map((ngay) => ({ ngay, gia_chu: giaDem(c, ngay) }));
      db.booking.push({
        id: idMoi("booking"),
        can_id: c.id,
        ngay_nhan: m.ngay_nhan,
        ngay_tra: m.ngay_tra,
        trang_thai: "hieu_luc",
        ten_sale: "Sale Hùng",
        sale_id: ketNoiHung.id,
        tien_phong: m.tien_phong,
        trang_thai_tien: "da_thanh_toan",
        tien_coc: null,
        dem: chiaTienTheoDem(dem, m.tien_phong),
      });
    }
    // Giá bán của sale cho từng đặt phòng của mình (DLM.6: B1 2.600.000đ = 2.200.000đ + 2 đêm x 200k)
    for (const bk of db.booking) {
      const kn = bk.sale_id ? db.ket_noi.find((k) => k.id === bk.sale_id) : undefined;
      const tkSale = kn?.sale_id ? db.tai_khoan.find((t) => t.id === kn.sale_id) : undefined;
      const can = db.can.find((c) => c.id === bk.can_id);
      if (tkSale && can) bk.gia_ban = giaBanLucGhi(tkSale, can, bk.tien_phong ?? 0, cacDem(bk.ngay_nhan, bk.ngay_tra).length);
    }
    // DLM.6: Y1 (Hùng gửi 2208 của Anh Tuấn 10/10 → 12/10, chờ), Y2 (Hùng gửi 1509 27/09 → 28/09, Chị Hoa chưa trả lời, đã hết hạn).
    // Giờ gửi theo giờ thật: Y1 mới gửi 2 giờ trước, Y2 gửi 15 ngày trước. Y2 chưa có giá trong DLM: lấy giá đêm CN 1509 (900.000đ) cộng 200k.
    const canSeed = (ma: string) => db.can.find((c) => c.ma_can === ma)!;
    const gui1 = Date.now() - 2 * MOT_GIO_MS;
    db.yeu_cau.push({
      id: idMoi("yc"),
      can_id: canSeed("2208").id,
      chu_nha_id: tuan.id,
      sale_id: hung.id,
      trang_thai: "cho_chu",
      ngay_nhan: "2026-10-10",
      ngay_tra: "2026-10-12",
      gia_chu: 3_000_000,
      gia_ban: 3_600_000,
      loi_nhan: null,
      ly_do: null,
      gui_luc: new Date(gui1).toISOString(),
      het_han_luc: new Date(gui1 + 14 * 24 * MOT_GIO_MS).toISOString(),
      tra_loi_luc: null,
      booking_id: null,
    });
    const gui2 = Date.now() - 15 * 24 * MOT_GIO_MS;
    db.yeu_cau.push({
      id: idMoi("yc"),
      can_id: canSeed("1509").id,
      chu_nha_id: hoa.id,
      sale_id: hung.id,
      trang_thai: "cho_chu",
      ngay_nhan: "2026-09-27",
      ngay_tra: "2026-09-28",
      gia_chu: 900_000,
      gia_ban: 1_100_000,
      loi_nhan: null,
      ly_do: null,
      gui_luc: new Date(gui2).toISOString(),
      het_han_luc: new Date(gui2 + 14 * 24 * MOT_GIO_MS).toISOString(),
      tra_loi_luc: null,
      booking_id: null,
    });
    const maLink = (chu: TaiKhoanLuu) => {
      const ma = maLinkMoi();
      const bay = Date.now();
      db.link.push({
        tai_khoan_id: chu.id,
        ma,
        duong_dan: `https://zalo.me/s/${MINI_APP_ID_GIA}/?ma=${ma}`,
        loai: "moi_sale",
        tao_luc: new Date(bay).toISOString(),
        het_han_luc: new Date(bay + LINK_HET_HAN_NGAY * 24 * 60 * 60 * 1000).toISOString(),
        so_lan_gui: 1,
        gui_cuoi_luc: new Date(bay).toISOString(),
      });
      return ma;
    };
    const ma = { anh_tuan: maLink(tuan), chi_hoa: maLink(hoa) };
    // Máy này là ai
    phienCuaApp = null;
    if (nguoi === "moi") {
      zaloIdHienTai = "zalo-thu-b";
      tenZalo.set(zaloIdHienTai, "Zalo thử B");
    } else {
      const tk = nguoi === "hung" ? sale[0] : sale[1];
      zaloIdHienTai = tk.zalo_id;
      phienCuaApp = idMoi("phien");
      db.phien.set(phienCuaApp, { zalo_id: tk.zalo_id });
    }
    return ma;
  },
  // Cho test: sale rút quyền tên và số trong Zalo (QD18 r5): số điện thoại xóa, tên cũ giữ, chủ nhà không đồng ý được nữa (QD18 r9)
  saleRutQuyen(zaloId: string) {
    const t = db.tai_khoan.find((x) => x.zalo_id === zaloId);
    if (!t) return;
    t.so_dien_thoai = null;
    t.rut_quyen_luc = new Date().toISOString();
  },
  // Cho test: lùi giờ tạo mọi thông báo mới (ms), để thử gom 10 phút (US17-NT11)
  luiGioThongBao(ms: number) {
    for (const t of db.thong_bao_moi) t.tao_luc = new Date(Date.parse(t.tao_luc) - ms).toISOString();
  },
  // Cho test: chủ nhà xóa tài khoản (US22-NT1). US22 làm phần xóa thật; ở đây chỉ bỏ tài khoản và căn.
  chuNhaXoaTaiKhoan(zaloId: string) {
    const t = db.tai_khoan.find((x) => x.zalo_id === zaloId);
    if (!t) return;
    for (const k of db.ket_noi.filter((x) => x.chu_nha_id === t.id)) k.ten_chu_cu = (t.ten_hien_thi ?? t.ho_ten) as string | undefined;
    db.tai_khoan = db.tai_khoan.filter((x) => x !== t);
    db.can = db.can.filter((c) => c.tai_khoan_id !== t.id);
  },
  datDoTre(ms: number) {
    doTre = ms;
  },
  datMatMang(mat: boolean) {
    giaMatMang = mat;
  },
  datHomNay(ngay: string | null) {
    homNayGia = ngay;
  },
  // Cho test: hồ sơ chưa có tên Zalo và số điện thoại, như Zalo thử A (US5-KB2)
  xoaSoDienThoai() {
    for (const t of db.tai_khoan) {
      t.so_dien_thoai = null;
      t.ho_ten = null;
    }
  },
  // Cho test: token số điện thoại quá 2 phút (zalo-rang-buoc 2.4)
  hetHanToken(token: string) {
    db.token_het_han.add(token);
  },
  // Cho test: link mời đã quá 21 ngày
  hetHanLink() {
    for (const l of db.link) if (l.loai !== "xin_lich") l.het_han_luc = new Date(Date.now() - 1000).toISOString();
  },
  // Cho test: ghi thẳng một dịp đặc biệt của căn Chị Hoa, vì màn đặt dịp (CN6-02, US8) chưa có
  themDipGia(maCan: string, dip: { ten: string; tu_ngay: string; den_ngay: string; la_ngay_le: boolean; gia_moi_dem: number }) {
    const c = db.can.find((x) => x.ma_can === maCan);
    if (!c) throw new Error(`Không có căn ${maCan}`);
    c.gia ??= { thang: {}, dip: [] };
    c.gia.dip.push({ ...dip, id: idMoi("dip") });
  },
  // Cho test: đẩy đồng hồ của yêu cầu tới (ms), để thử hết hạn 14 ngày (US15-NT6) mà không chờ thật
  tienGioYeuCau(ms: number) {
    lechGioYeuCau += ms;
  },
  // Cho test: các dòng yeu_cau_dat_phong đang lưu (kể cả giá), để kiểm giá server tính
  yeuCauDaLuu: () => db.yeu_cau.map((y) => ({ ...y })),
  // Cho test: các lần gửi khách đã ghi (US14)
  lanGuiKhach: () => db.lan_gui_khach.map((l) => ({ ...l })),
  // Cho test: ghi thẳng một đặt phòng, không qua POST /booking
  themBooking(b: Omit<BookingLuu, "id">) {
    db.booking.push({ ...b, id: idMoi("booking") });
  },
};

// Đang chạy server giả: hiện menu Bản thử. Có server thật thì chỉ bật ở bản dev/Development.
export const DU_LIEU_GIA = true;
