import React from "react";
import { CHU_TIEN, chuSoDienThoai } from "../components/sale-hien-thi";
import { LoiApi, LoiMang, type DatPhong } from "../services/kieu";
import { chuNgayNgan, chuTien, chuThu } from "../services/ngay";

// CN3-02 · Chi tiết đặt phòng (YC4.2, YC4.4). Chủ nhà thấy đủ ngày, giờ, người bán, tiền; ghi đã thu đủ và hoàn tác; sửa; xóa
// đặt phòng mình tự ghi cho khách lẻ (bấm hai lần). Không có giá bán, không có khách của sale (QD11, PQ11.CHU).
// Chữ tạm (canvas chưa vẽ): nút "Sửa đặt phòng", nút "Hủy" và "Xóa đặt phòng" của hộp hỏi, dòng "Khách: ..." của khách lẻ chủ nhà nhập.

export const tenNguoiDat = (dp: Pick<DatPhong, "nguoi_dat">) =>
  dp.nguoi_dat.ten ?? (dp.nguoi_dat.loai === "sale" ? "Sale" : "Khách lẻ");

export const tieuDeCN3 = (dp: Pick<DatPhong, "nguoi_dat">) => `Đặt phòng · ${tenNguoiDat(dp)}`;

export const chuNhanTien = (dp: Pick<DatPhong, "trang_thai_tien">) => CHU_TIEN[dp.trang_thai_tien];

// "thứ 7", "thứ 2", "chủ nhật"
const chuThuDai = (ngay: string) => {
  const t = chuThu(ngay);
  return t === "CN" ? "chủ nhật" : `thứ ${t.slice(1)}`;
};
export const chuGioNhanTra = (dp: Pick<DatPhong, "gio_nhan" | "gio_tra" | "ngay_nhan" | "ngay_tra">) =>
  `Nhận ${dp.gio_nhan} ${chuThuDai(dp.ngay_nhan)} · trả ${dp.gio_tra} ${chuThuDai(dp.ngay_tra)}`;

export const chuDongNgay = (dp: Pick<DatPhong, "ngay_nhan" | "ngay_tra" | "so_dem">) =>
  `${chuNgayNgan(dp.ngay_nhan)} → ${chuNgayNgan(dp.ngay_tra)} (${dp.so_dem} đêm)`;

export const chuNutThuDu = (dp: Pick<DatPhong, "tien_con_lai">) => `Đã thu đủ ${chuTien(dp.tien_con_lai)}đ`;
export const CHU_NUT_HOAN_TAC = "Hoàn tác: chưa thu đủ";
export const chuHoiXoa = (dp: Pick<DatPhong, "ngay_nhan" | "ngay_tra" | "ma_can">) =>
  `Xác nhận xóa đặt phòng? Ngày ${chuNgayNgan(dp.ngay_nhan)} → ${chuNgayNgan(dp.ngay_tra)} của ${dp.ma_can} trống lại.`;
export const CHU_CHUA_LUU = "Chưa lưu được, bấm lại khi có mạng";
export const CHU_LOI_CHUNG = "Có lỗi, chưa làm được. Bấm lại";

export const loiKhiGhi = (e: unknown) => {
  if (e instanceof LoiMang) return CHU_CHUA_LUU;
  if (e instanceof LoiApi && e.loi === "KHONG_DUOC_PHEP") return "Đặt phòng của sale không xóa được, chỉ sửa được";
  if (e instanceof LoiApi && e.loi === "TRANG_THAI_DA_DOI") return "Đặt phòng vừa đổi. Đã tải lại, bấm lại nếu cần";
  return CHU_LOI_CHUNG;
};

export type ViecDangLam = "thu_du" | "hoan_tac" | "xoa" | null;

type Props = {
  dp: DatPhong;
  dangLam: ViecDangLam;
  hoiXoa: boolean;
  loi: string | null;
  onThuDu: () => void;
  onHoanTac: () => void;
  onSua: () => void;
  onXoa: () => void;
  onXacNhanXoa: () => void;
  onHuyXoa: () => void;
  onGoi: () => void;
};

const Dong = ({ nhan, gia_tri }: { nhan: string; gia_tri: string }) => (
  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, font: "var(--text-body)", color: "var(--ink)" }}>
    <span style={{ color: "var(--ink-secondary)" }}>{nhan}</span>
    <span style={{ fontWeight: 600 }}>{gia_tri}</span>
  </div>
);

export const NoiDungCN3 = ({ dp, dangLam, hoiXoa, loi, onThuDu, onHoanTac, onSua, onXoa, onXacNhanXoa, onHuyXoa, onGoi }: Props) => {
  const ten = tenNguoiDat(dp);
  const laSale = dp.nguoi_dat.loai === "sale";
  const dangGhi = dangLam !== null;
  return (
    <>
      <div className="noi-dung" style={{ paddingBottom: 24 }}>
        {loi && (
          <div className="hh-banner hh-banner--danger" role="alert">
            <span>⚠️ {loi}</span>
          </div>
        )}
        <div className="khoi">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
            <span style={{ font: "var(--text-stat-md)", color: "var(--ink)" }}>Phòng {dp.ma_can}</span>
            <span className="chu-phu" data-nhan-tien style={{ fontWeight: 700 }}>
              {chuNhanTien(dp)}
            </span>
          </div>
          <span style={{ font: "var(--text-input)", color: "var(--ink)" }}>{chuDongNgay(dp)}</span>
          <span className="chu-phu">{chuGioNhanTra(dp)}</span>
          {dp.trang_thai !== "hieu_luc" && (
            <span className="chu-phu">{dp.trang_thai === "cho_huy" ? "Đang chờ hủy" : "Đã hủy"}</span>
          )}
        </div>
        <div className="khoi">
          <span className="nhan-muc">NGƯỜI ĐẶT</span>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ flex: "1 1 0%", minWidth: 0, display: "flex", flexDirection: "column" }}>
              <span style={{ font: "var(--text-stat-md)", color: "var(--ink)" }}>{ten}</span>
              {laSale && (
                <span className="chu-phu">
                  {[dp.nguoi_dat.so_dien_thoai ? chuSoDienThoai(dp.nguoi_dat.so_dien_thoai) : null, dp.so_khach ? `${dp.so_khach} khách` : null]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              )}
              {!laSale && dp.so_khach ? <span className="chu-phu">{dp.so_khach} khách</span> : null}
            </span>
            {laSale && dp.nguoi_dat.so_dien_thoai && (
              <button type="button" className="hh-btn hh-btn--secondary hh-btn--pill" onClick={onGoi}>
                Gọi sale
              </button>
            )}
          </div>
          {laSale ? (
            <span className="chu-phu">
              Khách do {ten} bán. Tên và số điện thoại khách chỉ sale giữ; cần gì về khách thì gọi sale.
            </span>
          ) : (
            dp.khach?.ten_khach && <span className="chu-phu">Khách: {dp.khach.ten_khach}</span>
          )}
        </div>
        <div className="khoi">
          <span className="nhan-muc">TIỀN</span>
          <Dong nhan="Tiền phòng" gia_tri={`${chuTien(dp.tien_phong)}đ`} />
          {dp.tien_coc !== null && <Dong nhan="Đã cọc" gia_tri={`${chuTien(dp.tien_coc)}đ`} />}
          <Dong nhan="Còn lại" gia_tri={`${chuTien(dp.tien_con_lai)}đ`} />
        </div>
        {dp.ghi_chu && (
          <div className="khoi">
            <span className="nhan-muc">GHI CHÚ</span>
            <span style={{ font: "var(--text-body)", color: "var(--ink)" }}>{dp.ghi_chu}</span>
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {dp.trang_thai_tien !== "da_thanh_toan" && dp.co_the_sua && (
            <button type="button" className="hh-btn hh-btn--primary hh-btn--block" disabled={dangGhi} onClick={onThuDu}>
              {dangLam === "thu_du" ? "Đang lưu…" : chuNutThuDu(dp)}
            </button>
          )}
          {dp.co_the_hoan_tac_thu_du && (
            <button type="button" className="hh-btn hh-btn--secondary hh-btn--block" disabled={dangGhi} onClick={onHoanTac}>
              {dangLam === "hoan_tac" ? "Đang lưu…" : CHU_NUT_HOAN_TAC}
            </button>
          )}
          {dp.co_the_sua && (
            <button type="button" className="hh-btn hh-btn--secondary hh-btn--block" disabled={dangGhi} onClick={onSua}>
              Sửa đặt phòng
            </button>
          )}
          {dp.co_the_xoa && (
            <button type="button" className="hh-btn hh-btn--text hh-btn--block" style={{ color: "var(--danger)" }} disabled={dangGhi} onClick={onXoa}>
              Xóa đặt phòng
            </button>
          )}
        </div>
      </div>
      {hoiXoa && (
        <div className="hh-scrim" role="alertdialog" aria-modal="true" aria-label="Xóa đặt phòng">
          <div className="hh-sheet">
            <div className="hh-sheet__body" style={{ paddingTop: 24 }}>
              <span style={{ font: "var(--text-input)", color: "var(--ink)" }}>{chuHoiXoa(dp)}</span>
              {loi && (
                <span className="chu-loi" role="alert">
                  {loi}
                </span>
              )}
              <button type="button" className="hh-btn hh-btn--danger hh-btn--block" disabled={dangGhi} onClick={onXacNhanXoa}>
                {dangLam === "xoa" ? "Đang lưu…" : "Xóa đặt phòng"}
              </button>
              <button type="button" className="hh-btn hh-btn--secondary hh-btn--block" disabled={dangGhi} onClick={onHuyXoa}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// HV5: đặt phòng không còn mở được
export const KhongConXem = ({ onVe, lyDo }: { onVe: () => void; lyDo?: string }) => (
  <div className="khoi" style={{ margin: 12, padding: "32px 20px", alignItems: "center", textAlign: "center" }}>
    <span style={{ font: "var(--text-body)", color: "var(--ink-secondary)" }}>Bạn không còn xem được mục này</span>
    {lyDo && <span className="chu-phu">{lyDo}</span>}
    <button type="button" className="hh-btn hh-btn--primary hh-btn--block" onClick={onVe}>
      Về Lịch
    </button>
  </div>
);

