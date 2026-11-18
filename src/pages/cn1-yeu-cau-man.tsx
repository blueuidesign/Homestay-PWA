import React from "react";
import { CHU_NUT_XEM_TRA_LOI, NHAN_CHO_BAN, chuDongKhoi, chuKhoiYeuCau, tenCanYC, tenSale } from "../components/yeu-cau-hien-thi";
import type { YeuCauChu } from "../services/yeu-cau";

// CN1-03 · Lịch có yêu cầu từ sale (YC4.6 bước 2, YC4.8 bước 1). Khối "YÊU CẦU ĐẶT PHÒNG · N" phía trên lưới tháng, chỉ hiện khi có yêu cầu chờ
// (trạng thái rỗng: không có khối). Mỗi dòng: tên sale, phòng, ngày, "gửi 10 phút trước", nhãn "Chờ bạn", nút "Xem và trả lời";
// dòng trùng ngày ghi "trùng ngày với Sale Hùng". Giá bán của sale không có trong dữ liệu (PQ11.CHU).
export const KhoiYeuCauCN1 = ({ ds, onMo, bayGio }: { ds: YeuCauChu[]; onMo: (y: YeuCauChu) => void; bayGio?: number }) => {
  if (ds.length === 0) return null;
  return (
    <div className="khoi" data-khoi-yeu-cau style={{ margin: "0 12px 12px" }}>
      <span className="nhan-muc">{chuKhoiYeuCau(ds.length)}</span>
      {ds.map((y) => (
        <div key={y.id} data-dong-yeu-cau={y.id} style={{ display: "flex", flexDirection: "column", gap: 4, paddingTop: 8, borderTop: "1px solid var(--border-subtle)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
            <span style={{ font: "var(--text-body-strong)", color: "var(--ink)" }}>
              {tenSale(y)} đặt phòng {tenCanYC({ ten_toa_nha: null, ma_can: y.can.ma_can })}
            </span>
            <span className="hh-badge">{NHAN_CHO_BAN}</span>
          </div>
          <span style={{ font: "var(--text-body)", color: "var(--ink-secondary)" }}>{chuDongKhoi(y, bayGio)}</span>
          <button type="button" className="hh-btn hh-btn--secondary hh-btn--block" style={{ minHeight: 44 }} onClick={() => onMo(y)}>
            {CHU_NUT_XEM_TRA_LOI}
          </button>
        </div>
      ))}
    </div>
  );
};

