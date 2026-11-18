import React from "react";
import { Icon } from "../components/icon";
import { chuCaiDau, chuTomTat } from "../components/sale-hien-thi";
import type { DanhSachKetNoi, DongKetNoi } from "../services/kieu";
import { chuTien } from "../services/ngay";

// CN7 · Sale của tôi (mục "Chủ nhà quản lý danh sách sale" (US5) bước 1), CN7-00 khi chưa có sale nào (bước 2). Phần vẽ, tách khỏi cn7-sale.tsx để test.
// "Nhắc lại" ở sale chưa kết nối chưa thiết kế (mục "Chủ nhà quản lý danh sách sale" (US5) bước 3, [MỞ: CH-011]) nên không có nút.

export const CHU_DE_SAU_CN7 = "Để sau vẫn gửi được link. Sale chưa thấy tên và số của bạn.";

export const NutGuiLink = ({ dangLam, onGuiLink, onSaoChep }: { dangLam: boolean; onGuiLink: () => void; onSaoChep: () => void }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
    <button type="button" className="hh-btn hh-btn--primary hh-btn--block" disabled={dangLam} onClick={onGuiLink}>
      Gửi link mời qua Zalo
    </button>
    <button type="button" className="hh-btn hh-btn--secondary hh-btn--block" disabled={dangLam} onClick={onSaoChep}>
      Sao chép link
    </button>
  </div>
);

// CN7-00
export const NoiDungCN700 = (p: { dangLam: boolean; onGuiLink: () => void; onSaoChep: () => void }) => (
  <>
    <div className="khoi">
      <span style={{ font: "var(--text-stat-md)", color: "var(--ink)" }}>Chưa có sale nào xem lịch</span>
      <span style={{ font: "var(--text-body)", color: "var(--ink-secondary)" }}>
        Gửi link cho sale qua Zalo. Sale mở link là thấy ngày trống, không cần gọi hỏi bạn.
      </span>
      <NutGuiLink {...p} />
    </div>
    <div className="khoi" style={{ gap: 6 }}>
      <span className="nhan-muc">Sale sẽ thấy</span>
      <span style={{ font: "var(--text-body)", color: "var(--ink-body)" }}>Phòng trống hay đã đặt</span>
      <span style={{ font: "var(--text-body)", color: "var(--ink-body)" }}>Giá từng đêm</span>
      <span style={{ font: "var(--text-body)", color: "var(--ink-body)" }}>Không thấy tên, số điện thoại khách và doanh thu</span>
    </div>
  </>
);

const DongSale = ({ d, onMo }: { d: DongKetNoi; onMo?: () => void }) => {
  const noiDung = (
    <>
      <span className="o-chu-cai">{chuCaiDau(d.ten_hien_thi ?? "?")}</span>
      <span style={{ flex: "1 1 0%", minWidth: 0, display: "flex", flexDirection: "column" }}>
        <span style={{ font: "var(--text-body-strong)", color: "var(--ink)" }}>{d.ten_hien_thi}</span>
        <span className="chu-phu">{d.trang_thai === "da_ket_noi" ? chuTomTat(d) : "Chưa mở link"}</span>
      </span>
      {d.trang_thai === "da_ket_noi" && (
        <>
          <span style={{ font: "var(--text-body-strong)", color: "var(--ink)", whiteSpace: "nowrap" }}>{chuTien(d.tong_tien_dat_phong)}đ</span>
          <Icon ten="mui-phai" co={16} />
        </>
      )}
    </>
  );
  return onMo ? (
    <button type="button" className="dong-sale" data-sale={d.ten_hien_thi ?? ""} onClick={onMo}>
      {noiDung}
    </button>
  ) : (
    <div className="dong-sale dong-sale--tinh" data-sale={d.ten_hien_thi ?? ""}>
      {noiDung}
    </div>
  );
};

// CN7
export const NoiDungCN7 = ({
  ds,
  dangLam,
  onGuiLink,
  onSaoChep,
  onThemSale,
  onMoSale,
}: {
  ds: DanhSachKetNoi;
  dangLam: boolean;
  onGuiLink: () => void;
  onSaoChep: () => void;
  onThemSale: () => void;
  onMoSale: (id: string) => void;
}) => {
  if (ds.da_ket_noi.length === 0 && ds.chua_ket_noi.length === 0) {
    return <NoiDungCN700 dangLam={dangLam} onGuiLink={onGuiLink} onSaoChep={onSaoChep} />;
  }
  return (
    <>
      <div className="khoi">
        <span style={{ font: "var(--text-stat-md)", color: "var(--ink)" }}>Mời sale xem lịch</span>
        <span style={{ font: "var(--text-body)", color: "var(--ink-secondary)" }}>
          Sale mở link là thấy phòng trống và giá của bạn, không cần gọi hỏi.
        </span>
        <NutGuiLink dangLam={dangLam} onGuiLink={onGuiLink} onSaoChep={onSaoChep} />
      </div>
      <div className="khoi" style={{ gap: 4 }}>
        <span className="nhan-muc">Đã kết nối · {ds.da_ket_noi.length}</span>
        {ds.da_ket_noi.map((d) => (
          <DongSale key={d.id} d={d} onMo={() => onMoSale(d.id)} />
        ))}
      </div>
      <div className="khoi" style={{ gap: 4 }}>
        <span className="nhan-muc">Chưa kết nối · {ds.chua_ket_noi.length}</span>
        {ds.chua_ket_noi.map((d) => (
          <DongSale key={d.id} d={d} />
        ))}
        <button type="button" className="hh-btn hh-btn--secondary hh-btn--block" onClick={onThemSale}>
          <Icon ten="cong" co={16} />
          Thêm sale
        </button>
        <span className="chu-phu">
          Thêm tên và số điện thoại của sale chưa dùng app. Sale vào nhóm Chưa kết nối cho tới khi mở link.
        </span>
      </div>
    </>
  );
};

