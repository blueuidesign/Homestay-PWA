import { LoiApi, type DatPhong, type ThanSuaDatPhong } from "../services/kieu";
import { docTien, loiKhiLuu, ngayTraTheoChip, type FormCN4, type SoDemChip } from "./cn4-dat-phong";

// CN4-02 · Sửa đặt phòng (mục "Sửa booking" (US10), US3-NT14/NT5 qua CN4-01). Cùng form với CN4, điền sẵn giá trị hiện có.
// Kiểm trùng bỏ qua chính đặt phòng đang sửa (QT1.2). Rời app rồi quay lại: form giữ nguyên, không tải đè (HV3 bước 2).
// Chưa làm: giữ nháp khi app bị đóng hẳn (HV3 bước 3) vì cần Native Storage, như CN4 (US3).
// Chữ tạm: "Đặt phòng đã đổi ở máy khác..." khi cap_nhat_luc khác.

// Điền sẵn form từ đặt phòng (US10-NT5)
export const formTuDatPhong = (dp: DatPhong): FormCN4 => ({
  canId: dp.can_id,
  ngayNhan: dp.ngay_nhan,
  chipDem: ([1, 2, 3] as number[]).includes(dp.so_dem) ? (dp.so_dem as SoDemChip) : "tuy_chon",
  traTuyChon: dp.ngay_tra,
  tenKhach: dp.nguoi_dat.loai === "khach_le" ? dp.khach?.ten_khach ?? null : null,
  saleId: dp.nguoi_dat.sale_id,
  tienPhong: String(dp.tien_phong),
  trangThaiTien: dp.trang_thai_tien,
  tienCoc: dp.tien_coc === null ? "" : String(dp.tien_coc),
  moChiTiet: true,
  soKhach: dp.so_khach ?? 2,
  ghiChu: dp.ghi_chu ?? "",
});

// Thân PATCH: chỉ trường đã đổi (api/lich-dat-phong.md PATCH). Không bao giờ có gia_ban (PQ11.CHU).
export const thanSua = (dp: DatPhong, form: FormCN4): ThanSuaDatPhong => {
  const tra = ngayTraTheoChip(form.ngayNhan, form.chipDem, form.traTuyChon);
  const than: ThanSuaDatPhong = { cap_nhat_luc: dp.cap_nhat_luc };
  if (form.canId && form.canId !== dp.can_id) than.can_id = form.canId;
  if (form.ngayNhan !== dp.ngay_nhan) than.ngay_nhan = form.ngayNhan;
  if (tra !== dp.ngay_tra) than.ngay_tra = tra;
  const tien = docTien(form.tienPhong);
  if (tien !== null && tien !== dp.tien_phong) than.tien_phong = tien;
  if (form.trangThaiTien !== dp.trang_thai_tien) than.trang_thai_tien = form.trangThaiTien;
  const coc = form.trangThaiTien === "da_coc_con_thu" ? docTien(form.tienCoc) : null;
  if (coc !== dp.tien_coc) than.tien_coc = coc;
  if (dp.nguoi_dat.loai === "khach_le" && form.tenKhach !== (dp.khach?.ten_khach ?? null)) than.ten_khach = form.tenKhach;
  if (form.moChiTiet) {
    if (form.soKhach !== (dp.so_khach ?? 2)) than.so_khach = form.soKhach;
    if (form.ghiChu.trim() !== (dp.ghi_chu ?? "")) than.ghi_chu = form.ghiChu.trim() || null;
  }
  return than;
};

export const chuToastDaSua = "Đã lưu thay đổi";

export const loiKhiSua = (e: unknown) => {
  if (e instanceof LoiApi && e.loi === "TRANG_THAI_DA_DOI") return "Đặt phòng đã đổi ở máy khác. Quay lại xem rồi sửa lại";
  return loiKhiLuu(e);
};

