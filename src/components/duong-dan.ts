// Đường dẫn các màn. Mã màn theo docs/design/screens.
export const DUONG = {
  BAN_THU: "/ban-thu",
  A1: "/",
  A3: "/chon-vai",
  DIEU_KHOAN: "/dieu-khoan",
  CHINH_SACH: "/chinh-sach",
  LICH_SALE: "/lich-sale", // Tab Lịch của sale: S1, hoặc A5 khi chưa có nguồn phòng (US6)
  TIM_PHONG: "/lich-sale/tim", // S1-02, S1-03 (US12), state { dk, ten_toa }
  KET_QUA_TIM: "/lich-sale/ket-qua", // S2, S2-00, S4 (US12), state { dk, ten_toa }
  CAN_SALE_CHI_TIET: "/lich-sale/can", // S3 (US13), state { can_id, ngay_nhan, ngay_tra }
  YEU_CAU_DAT_PHONG: "/lich-sale/can/yeu-cau", // S3-02, S3-07 (US15), state { can_id, ngay_nhan, ngay_tra }
  YEU_CAU_SALE: "/lich-sale/yeu-cau", // S3-03, S3-04, S3-04-01, S3-05, S3-08, S3-09 (US15), state { id }; mở từ thông báo cũng vào đây
  YEU_CAU_CHU: "/lich/yeu-cau", // CN9, CN9-02, CN9-03 (US15), state { id }
  GUI_KHACH: "/lich-sale/gui-khach", // S5 (US14), state { can_ids | can_id, ngay_nhan, ngay_tra } (TrangThaiGuiKhach)
  CAN_SALE: "/can-sale", // Tab Căn của sale: S6, S6-00, S6-08 (US16)
  CHU_NHA_NGUON: "/can-sale/chu-nha", // S6-04 (US16), state { id }
  CAN_CUA_TOI: "/can-sale/can-cua-toi", // S6-07 (US16), state { can_id }
  THEM_CAN_TU_NHAP: "/can-sale/them-tu-nhap", // S6-02 (US16)
  CAN_TU_NHAP: "/can-sale/tu-nhap", // S6-03, S6-03-00 (US16), state { can_id }
  GHI_DAT_PHONG: "/can-sale/tu-nhap/dat-phong", // S6-05, S6-06 (US16), state { can_id }
  LINK: "/mo-link", // A1-link, A1-link-01, A10, A10-01 khi mở app từ link mời (US6)
  LICH: "/lich",
  LICH_TUAN: "/lich/tuan", // CN2, CN2-00 (US9); lối vào tạm từ tab Lịch [MỞ: CH-015]
  GUI_LICH: "/lich/gui-cho-sale", // CN10, CN10-00, CN10-01 (US26)
  CAN: "/can",
  THEM_CAN: "/can/them", // CN5-A1
  DAT_PHONG: "/dat-phong", // CN4
  CHI_TIET_DAT_PHONG: "/dat-phong/chi-tiet", // CN3-02 (US10), state { id }
  SUA_DAT_PHONG: "/dat-phong/sua", // CN4-02 (US10), state { id }
  DAT_PHONG_SALE: "/dat-phong/sale", // S3-10 (US10), state { id }
  CHI_TIET_CAN: "/can/chi-tiet", // CN5-02 (tab Thông tin: US11) và CN6 (tab Giá: US4)
  GIA_CHON_CAN: "/can/gia-nhieu-can", // CN6-05, CN6-05-00 (US7)
  GIA_NHIEU_CAN: "/can/gia-nhieu-can/dat-gia", // CN6-06 (US7)
  SAO_CHEP_GIA: "/can/sao-chep-gia", // CN6-07, CN6-08 (US7)
  GIA_LE: "/can/gia-le", // CN6-02, CN6-03, CN6-03-01 (US8)
  SALE: "/sale", // CN7
  SALE_CHI_TIET: "/sale/chi-tiet", // CN7-04
  SALE_THEM: "/sale/them", // CN7-05
  THONG_KE: "/thong-ke",
  CA_NHAN: "/ca-nhan",
  THONG_TIN_CA_NHAN: "/ca-nhan/thong-tin", // P2
  DEM_CUOI_TUAN: "/ca-nhan/dem-cuoi-tuan", // P6 (US11)
  MUC_CONG_MAC_DINH: "/ca-nhan/muc-cong", // P10 (US13)
  MAU_TIN: "/ca-nhan/mau-tin", // P11 (US14)
  THONG_BAO: "/ca-nhan/thong-bao", // P13, P13-00 (US17)
  XIN_LICH: "/lich-sale/xin-lich", // A6, A6-P1, A6-P2 (US17)
  XIN_LICH_DA_GUI: "/lich-sale/xin-lich/da-gui", // A7, A7-00, A7-01 (US17), state { vuaGui }
} as const;
