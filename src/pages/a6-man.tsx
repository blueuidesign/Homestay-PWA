import React from "react";
import {
  CAC_BUOC_SAU_KHI_GUI,
  CHU_A6_MO_TA,
  CHU_A6_MOT_LINK,
  CHU_A6_SAU_KHI_GUI,
  CHU_A6_TIN_SE_GUI,
} from "../components/xin-lich-hien-thi";

// A6 · Soạn tin xin link (mục "Sale xin chủ nhà cho xem lịch" (US17) bước 1). Phần vẽ, tách khỏi a6-xin-lich.tsx để test.
// Hai nút ở thanh dưới: "Gửi qua Zalo" (A6-P1 nếu chưa có số) và "Sao chép tin nhắn" (chạy mục "Xin tên và số điện thoại khi bắt đầu kết nối" (US5) rồi sao chép, sang A7).
export type PropsA6 = {
  tin: string;
  dangLam: boolean;
  loi: string | null;
  onGui: () => void;
  onSaoChep: () => void;
};

export const NoiDungA6 = ({ tin, dangLam, loi, onGui, onSaoChep }: PropsA6) => (
  <>
    <div className="noi-dung" style={{ paddingBottom: 140 }}>
      {loi && (
        <div className="hh-banner hh-banner--danger" role="alert">
          <span>⚠️ {loi}</span>
        </div>
      )}
      <span style={{ font: "var(--text-body)", color: "var(--ink-secondary)", padding: "0 4px" }}>{CHU_A6_MO_TA}</span>
      <div className="khoi">
        <span className="nhan-muc">{CHU_A6_TIN_SE_GUI}</span>
        <span data-tin style={{ font: "var(--text-body)", color: "var(--ink-body)", wordBreak: "break-word" }}>
          {tin}
        </span>
        <span className="chu-phu">{CHU_A6_MOT_LINK}</span>
      </div>
      <div className="khoi">
        <span className="nhan-muc">{CHU_A6_SAU_KHI_GUI}</span>
        {CAC_BUOC_SAU_KHI_GUI.map((b, i) => (
          <div key={b.ten} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
            <span
              style={{ flex: "0 0 auto", width: 28, height: 28, borderRadius: "var(--radius-full)", background: "var(--action-tint)", color: "var(--action-ink)", font: "var(--text-label)", display: "flex", alignItems: "center", justifyContent: "center" }}
            >
              {i + 1}
            </span>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{ font: "var(--text-body-strong)", color: "var(--ink)" }}>{b.ten}</span>
              <span className="chu-phu">{b.phu}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
    <div className="thanh-duoi" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <button type="button" className="hh-btn hh-btn--primary hh-btn--block" disabled={dangLam} onClick={onGui}>
        {dangLam ? "Đang xử lý…" : "Gửi qua Zalo"}
      </button>
      <button type="button" className="hh-btn hh-btn--secondary hh-btn--block" disabled={dangLam} onClick={onSaoChep}>
        Sao chép tin nhắn
      </button>
    </div>
  </>
);
