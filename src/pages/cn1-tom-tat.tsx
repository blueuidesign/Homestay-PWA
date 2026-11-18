import React from "react";
import { Icon } from "../components/icon";
import type { DatPhongSapToi, NguoiDat, SapToi, TomTatThang, TrangThaiTien } from "../services/kieu";
import { chuNgayNgan, chuTien, congThang } from "../services/ngay";
import { ChuaCoDatPhong, ChuaTaiDuoc } from "./cn1-lich-thang";

// CN1, CN1-02: khối "DOANH THU THÁNG" (mục "Tóm tắt tháng" (US9)) và mục "ĐẶT PHÒNG SẮP TỚI" (mục "Booking sắp tới" (US9)), CN1-01 khi chưa có đặt phòng sắp tới.
// Phần vẽ, không gọi server, để test render được. Phần tải dữ liệu ở tab-lich.tsx. Màn này là của chủ nhà, tiền là giá chủ nhà.

export const chuTienDong = (n: number) => `${chuTien(n)}đ`;

// Dòng nhỏ dưới số tiền. CN1 (2 căn): "13 đêm có khách · tháng 9: 9.600.000đ". CN1-02 (từ 3 căn): "20 đêm có khách · 3 căn",
// không có số tháng trước. Tháng trước không có đồng nào thì bỏ phần "tháng 9" (canvas chưa vẽ ca này, chữ tạm).
export const chuDongNhoDoanhThu = (t: TomTatThang) => {
  const dem = `${t.so_dem_co_khach} đêm có khách`;
  if (t.so_can >= 3) return `${dem} · ${t.so_can} căn`;
  if (t.doanh_thu_thang_truoc > 0) {
    return `${dem} · tháng ${Number(congThang(t.thang, -1).slice(5, 7))}: ${chuTienDong(t.doanh_thu_thang_truoc)}`;
  }
  return dem;
};

// Khối doanh thu (US9-NT1). Không vẽ khi chủ nhà chưa có đặt phòng nào (US9-NT2, CN1-00): chỗ gọi quyết định.
export const KhoiDoanhThu = ({ tom }: { tom: TomTatThang }) => (
  <div className="khoi" style={{ gap: 4 }}>
    <span className="nhan-muc">DOANH THU THÁNG {Number(tom.thang.slice(5, 7))}</span>
    <span className="doanh-thu__so">{chuTienDong(tom.doanh_thu)}</span>
    <span className="chu-phu">{chuDongNhoDoanhThu(tom)}</span>
  </div>
);

// Người đặt: tên sale, tên khách lẻ chủ nhà nhập, hoặc "Khách lẻ" (US2-NT7)
export const chuTenNguoiDat = (n: NguoiDat) => n.ten ?? (n.loai === "sale" ? "Sale" : "Khách lẻ");

// Trạng thái tiền (nhóm Lịch chủ nhà quy tắc Trạng thái tiền booking): "Chưa cọc", "Cọc 1.000.000đ", "Đã cọc · còn thu", "Đã thanh toán"
export const chuTrangThaiTien = (trang_thai_tien: TrangThaiTien | null, tien_coc: number | null) => {
  if (trang_thai_tien === "chua_coc") return "Chưa cọc";
  if (trang_thai_tien === "da_thanh_toan") return "Đã thanh toán";
  if (trang_thai_tien === "da_coc_con_thu") return tien_coc !== null ? `Cọc ${chuTienDong(tien_coc)}` : "Đã cọc · còn thu";
  return "";
};

export const chuDongPhong = (dp: Pick<DatPhongSapToi, "ma_can" | "ngay_nhan" | "ngay_tra" | "so_dem">) =>
  `Phòng ${dp.ma_can} · ${chuNgayNgan(dp.ngay_nhan)} → ${chuNgayNgan(dp.ngay_tra)} (${dp.so_dem} đêm)`;

// Mục "ĐẶT PHÒNG SẮP TỚI" (US9-NT3, US9-NT2). Chưa có dòng nào thì CN1-01. Chạm một dòng mở chi tiết đặt phòng
// (CN3-02, US10): chỗ gọi quyết định.
export const MucSapToi = ({
  muc,
  onChamDong,
  onThemDatPhong,
}: {
  muc: DatPhongSapToi[];
  onChamDong: (dp: DatPhongSapToi) => void;
  onThemDatPhong: () => void;
}) => (
  <div className="khoi" style={{ gap: 0 }}>
    <span className="nhan-muc" style={{ paddingBottom: 8 }}>
      ĐẶT PHÒNG SẮP TỚI
    </span>
    {muc.length === 0 ? (
      <div style={{ display: "flex", flexDirection: "column", gap: 12, paddingTop: 4 }}>
        <span style={{ font: "var(--text-nav)", color: "var(--ink)" }}>Chưa có đặt phòng sắp tới</span>
        <span style={{ font: "var(--text-body)", color: "var(--ink-secondary)" }}>Bấm "Thêm đặt phòng" để ghi khách đầu tiên.</span>
        <button type="button" className="hh-btn hh-btn--secondary hh-btn--block" onClick={onThemDatPhong}>
          <Icon ten="cong" co={16} />
          Thêm đặt phòng
        </button>
      </div>
    ) : (
      muc.map((dp) => (
        <button key={dp.id} type="button" className="sap-toi__dong" data-dat-phong={dp.id} onClick={() => onChamDong(dp)}>
          <span className="sap-toi__ten">{chuTenNguoiDat(dp.nguoi_dat)}</span>
          <span className="sap-toi__phu">{chuDongPhong(dp)}</span>
          <span className="sap-toi__tien">
            {chuTienDong(dp.tien_phong)} ·{" "}
            <span className={dp.trang_thai_tien === "chua_coc" ? "sap-toi__chua-coc" : undefined}>
              {chuTrangThaiTien(dp.trang_thai_tien, dp.tien_coc)}
            </span>
          </span>
        </button>
      ))
    )}
  </div>
);

// Phần dưới lưới tháng. Chưa có đặt phòng nào thì CN1-00, không có khối doanh thu và không có mục sắp tới (US9-NT2, mục "Booking sắp tới" (US9)).
// Chưa có số thì khung xám (HV1); hỏng mà chưa có số thì báo lỗi, có nút Thử lại (HV2).
export const PhanDuoiLichThang = ({
  coDatPhong,
  tom,
  sapToi,
  loi,
  matMang,
  onThuLai,
  onChamDong,
  onDatPhong,
}: {
  coDatPhong: boolean;
  tom: TomTatThang | null;
  sapToi: SapToi | null;
  loi: "mang" | "khac" | null;
  matMang: boolean;
  onThuLai: () => void;
  onChamDong: (dp: DatPhongSapToi) => void;
  onDatPhong: () => void;
}) => {
  if (!coDatPhong) return <ChuaCoDatPhong onDatPhong={onDatPhong} />;
  return (
    <>
      {tom ? <KhoiDoanhThu tom={tom} /> : !loi && <div className="khung-xam" style={{ height: 88 }} aria-busy="true" />}
      {sapToi ? (
        <MucSapToi muc={sapToi.muc} onChamDong={onChamDong} onThemDatPhong={onDatPhong} />
      ) : (
        !loi && <div className="khung-xam" style={{ height: 160 }} aria-busy="true" />
      )}
      {loi && (!tom || !sapToi) && <ChuaTaiDuoc matMang={matMang || loi === "mang"} onThuLai={onThuLai} />}
    </>
  );
};
