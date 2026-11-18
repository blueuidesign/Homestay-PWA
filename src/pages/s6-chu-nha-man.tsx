import React from "react";
import { CHU_BO_NGUON, CHU_GOI, chuCaiDau, chuChoXem, chuKetNoiTu, chuLoiNhacBoNguon, chuXacNhanBoNguon, dongPhuCanSale, tenCanSale } from "../components/can-sale-hien-thi";
import type { ChiTietNguonPhong } from "../services/kieu";

// Phần vẽ của S6-04 (mục "Chi tiết chủ nhà và bỏ nguồn phòng" (US16)). Không gọi server. Màn: s6-chu-nha.tsx.
export const NoiDungS6ChuNha = ({
  ct,
  xacNhan,
  dangBo,
  loi,
  onGoi,
  onBo,
  onXacNhan,
  onKhongBo,
}: {
  ct: ChiTietNguonPhong;
  xacNhan: boolean;
  dangBo: boolean;
  loi: string | null;
  onGoi: () => void;
  onBo: () => void;
  onXacNhan: () => void;
  onKhongBo: () => void;
}) => {
  const ten = ct.ten_hien_thi ?? "Chủ nhà";
  const ketNoi = chuKetNoiTu(ct.ket_noi_luc);
  return (
    <>
      <div className="khoi" data-khoi="chu-nha">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span className="o-chu-cai" style={{ width: 48, height: 48, fontSize: 16 }}>
            {chuCaiDau(ten)}
          </span>
          <div style={{ flex: "1 1 0%", minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ font: "var(--text-body-strong)", color: "var(--ink)" }}>{ten}</span>
            {ct.so_dien_thoai && <span style={{ font: "var(--text-body)", color: "var(--ink-secondary)" }}>{ct.so_dien_thoai}</span>}
            {ketNoi && <span className="chu-phu">{ketNoi}</span>}
          </div>
          {ct.so_dien_thoai && (
            <button type="button" className="hh-btn hh-btn--secondary hh-btn--inline" style={{ minHeight: 44, minWidth: 64 }} onClick={onGoi}>
              {CHU_GOI}
            </button>
          )}
        </div>
      </div>

      <div className="khoi" data-khoi="quyen">
        <span className="nhan-muc">{chuChoXem(ten)}</span>
        <span style={{ font: "var(--text-body)", color: "var(--ink-body)" }}>✓ Phòng trống hay đã đặt</span>
        <span style={{ font: "var(--text-body)", color: "var(--ink-body)" }}>✓ Giá từng đêm</span>
        {ct.quyen_tinh_trang_coc && <span style={{ font: "var(--text-body)", color: "var(--ink-body)" }}>✓ Đã cọc hay chưa</span>}
      </div>

      <div className="khoi" data-khoi="can">
        <span className="nhan-muc">Căn · {ct.can.length}</span>
        {ct.can.map((c) => (
          <div key={c.id} data-can={c.ma_can} style={{ display: "flex", flexDirection: "column", gap: 2, minHeight: 44, justifyContent: "center" }}>
            <span style={{ font: "var(--text-body-strong)", color: "var(--ink)" }}>{tenCanSale(c)}</span>
            <span style={{ font: "var(--text-body)", color: "var(--ink-muted)" }}>{dongPhuCanSale(c)}</span>
          </div>
        ))}
      </div>

      {xacNhan ? (
        <div className="khoi" data-khoi="xac-nhan" style={{ borderColor: "var(--danger)" }}>
          <span style={{ font: "var(--text-body-strong)", color: "var(--ink)" }}>{chuXacNhanBoNguon(ten)}</span>
          <span style={{ font: "var(--text-body)", color: "var(--ink-secondary)" }}>{chuLoiNhacBoNguon(ten)}</span>
          {loi && <span className="chu-loi" role="alert">⚠️ {loi}</span>}
          <button type="button" className="hh-btn hh-btn--danger hh-btn--block" disabled={dangBo} onClick={onXacNhan}>
            {dangBo ? "Đang bỏ…" : chuXacNhanBoNguon(ten)}
          </button>
          <button type="button" className="hh-btn hh-btn--text hh-btn--block" disabled={dangBo} onClick={onKhongBo}>
            Không bỏ
          </button>
        </div>
      ) : (
        <button type="button" className="hh-btn hh-btn--secondary hh-btn--block" onClick={onBo}>
          {CHU_BO_NGUON}
        </button>
      )}
    </>
  );
};
