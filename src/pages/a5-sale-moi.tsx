import React from "react";
import { Icon } from "../components/icon";

// A5 · Sale mới, chưa có nguồn phòng (mục "Màn đầu tiên khi chưa có dữ liệu" (US1) bước 3). Hai nút chưa nối: "Gửi tin nhắn xin lịch đến chủ nhà" mở A6 (mục "Sale xin chủ nhà cho xem lịch" (US17), US17),
// "Thêm căn thủ công" mở S6-02 (nhóm Nguồn phòng và căn tự nhập, US16). Thanh tab không có "Tìm phòng" (US6-NT9).
export const CHU_A5_TIEU_DE = "Chưa có nguồn phòng";
export const CHU_A5_MO_TA = "Xin chủ nhà gửi link mời để thấy lịch phòng trống. Chủ chưa dùng app thì tự nhập căn.";
export const CHU_A5_GHI_CHU =
  "Căn của chủ nhà chưa dùng app, hoặc căn của chính bạn. Căn tự nhập không có lịch trống: hỏi chủ nhà mỗi lần khách hỏi.";
export const CHU_A5_DA_GUI_LINK = "Chủ nhà đã gửi link?";
export const CHU_A5_DA_GUI_LINK_PHU = "Mở link trong tin nhắn Zalo của chủ nhà, lịch sẽ hiện ở đây.";

export const NoiDungA5 = ({ onXinLich, onThemThuCong }: { onXinLich: () => void; onThemThuCong: () => void }) => (
  <>
    <div className="khoi" style={{ padding: "32px 20px", alignItems: "center", textAlign: "center" }}>
      <span
        style={{
          width: 72,
          height: 72,
          borderRadius: "var(--radius-full)",
          background: "var(--border-subtle)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--ink-secondary)",
        }}
      >
        <Icon ten="lich" co={32} />
      </span>
      <span style={{ font: "var(--text-stat-md)", color: "var(--ink)" }}>{CHU_A5_TIEU_DE}</span>
      <span style={{ font: "var(--text-body)", color: "var(--ink-secondary)" }}>{CHU_A5_MO_TA}</span>
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8, paddingTop: 4 }}>
        <button type="button" className="hh-btn hh-btn--primary hh-btn--block" onClick={onXinLich}>
          Gửi tin nhắn xin lịch đến chủ nhà
        </button>
        <button type="button" className="hh-btn hh-btn--secondary hh-btn--block" onClick={onThemThuCong}>
          <Icon ten="cong" co={16} />
          Thêm căn thủ công
        </button>
        <span style={{ font: "var(--text-caption)", color: "var(--ink-muted)" }}>{CHU_A5_GHI_CHU}</span>
      </div>
    </div>
    <div className="khoi" style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
      <span style={{ display: "flex", color: "var(--ink-faint)" }}>
        <Icon ten="nhom-nguoi" />
      </span>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <span style={{ font: "var(--text-body-strong)", color: "var(--ink)" }}>{CHU_A5_DA_GUI_LINK}</span>
        <span style={{ font: "var(--text-body)", color: "var(--ink-secondary)" }}>{CHU_A5_DA_GUI_LINK_PHU}</span>
      </div>
    </div>
  </>
);
