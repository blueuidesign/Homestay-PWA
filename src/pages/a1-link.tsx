import React from "react";
import { DUONG } from "../components/duong-dan";
import { Icon } from "../components/icon";
import { chuCaiDau } from "../components/sale-hien-thi";
import { GIA_TRI } from "./a1-chao-mung";

// A1-link · Mở từ link mời của chủ nhà, khi chưa có tài khoản (mục "Mở app từ link mời của chủ nhà" (US6) bước 1, 2). Như A1, thêm thẻ lời mời.
// Canvas ghi "Đăng nhập để xem lịch và giá mới nhất" và nút "Bắt đầu với Zalo"; mục "Mở app từ link mời của chủ nhà" (US6) r15 (NT8) bỏ chữ "Đăng nhập"
// và đổi nút thành "Bắt đầu ngay" (QD2, RV2-F14): làm theo YC.
export const chuTheMoi = (ten: string | null, soCan: number) => `${ten ?? "Chủ nhà"} mời bạn xem lịch ${soCan} căn`;
export const CHU_DONG_THE_MOI = "Bấm Bắt đầu ngay để xem lịch và giá mới nhất";

const KhungDau = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
    <span style={{ font: "var(--text-stat-xl)", color: "var(--ink)" }}>🏠 Lịch phòng Hạ Long</span>
    <span style={{ font: "var(--text-input)", color: "var(--ink-secondary)" }}>
      Lịch phòng và giá homestay, chia sẻ cho sale trong một chạm.
    </span>
  </div>
);

const BaDongLoiIch = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
    {GIA_TRI.map((g) => (
      <div key={g.chu} style={{ display: "flex", gap: 14, alignItems: "center" }}>
        <span
          style={{
            flex: "0 0 auto",
            width: 44,
            height: 44,
            borderRadius: "var(--radius-full)",
            background: "var(--border-subtle)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--ink-secondary)",
          }}
        >
          <Icon ten={g.icon} />
        </span>
        <span style={{ font: "var(--text-input)", color: "var(--ink-body)" }}>{g.chu}</span>
      </div>
    ))}
  </div>
);

export const NoiDungA1Link = ({
  tenChuNha,
  soCan,
  dangVao,
  loi,
  onBatDau,
  onMo,
}: {
  tenChuNha: string | null;
  soCan: number;
  dangVao: boolean;
  loi: string | null;
  onBatDau: () => void;
  onMo: (duong: string) => void;
}) => (
  <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "56px 24px 24px", gap: 24 }}>
    <KhungDau />
    <div
      className="khoi"
      style={{ flexDirection: "row", alignItems: "center", gap: 14, background: "var(--surface)" }}
      data-the="moi"
    >
      <span
        style={{
          flex: "0 0 auto",
          width: 48,
          height: 48,
          borderRadius: "var(--radius-full)",
          background: "var(--action-soft)",
          color: "var(--action-ink)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 16,
          fontWeight: 700,
        }}
      >
        {chuCaiDau(tenChuNha ?? "Chủ nhà")}
      </span>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <span style={{ font: "var(--text-nav)", color: "var(--ink)" }}>{chuTheMoi(tenChuNha, soCan)}</span>
        <span style={{ font: "var(--text-body)", color: "var(--ink-secondary)" }}>{CHU_DONG_THE_MOI}</span>
      </div>
    </div>
    <BaDongLoiIch />
    <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 14 }}>
      {loi && (
        <span className="chu-loi" role="alert">
          ⚠️ {loi}
        </span>
      )}
      <button type="button" className="hh-btn hh-btn--primary hh-btn--block" disabled={dangVao} onClick={onBatDau}>
        {dangVao ? "Đang vào…" : "Bắt đầu ngay"}
      </button>
      <span style={{ font: "var(--text-caption)", color: "var(--ink-muted)", textAlign: "center" }}>
        Bằng việc tiếp tục, bạn đồng ý với{" "}
        <a className="hh-link" onClick={() => onMo(DUONG.DIEU_KHOAN)}>
          Điều khoản
        </a>{" "}
        và{" "}
        <a className="hh-link" onClick={() => onMo(DUONG.CHINH_SACH)}>
          Chính sách quyền riêng tư
        </a>
        .
      </span>
    </div>
  </div>
);

// A1-link-01 · Link sai, hết hạn hoặc chủ nhà đã xóa tài khoản (US22-NT1, HV5). Không có tên chủ nhà, tên căn, ảnh căn (PQ18.LINK).
export const CHU_LINK_KHONG_MO_DUOC = "Link này không mở được";
export const CHU_LINK_KHONG_MO_DUOC_PHU = "Chủ nhà đã xóa tài khoản hoặc link không đúng. Xin chủ nhà gửi lại link mới.";

export const NoiDungA1LinkLoi = ({ onVaoApp, dangVao }: { onVaoApp: () => void; dangVao: boolean }) => (
  <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "56px 24px 24px", gap: 24 }}>
    <KhungDau />
    <div
      className="khoi"
      role="alert"
      data-the="loi"
      style={{ background: "var(--warning-tint)", borderColor: "var(--warning-border)", flexDirection: "row", gap: 14, alignItems: "center" }}
    >
      <span style={{ fontSize: 24 }} aria-hidden="true">
        🔗
      </span>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <span style={{ font: "var(--text-nav)", color: "var(--warning-ink)" }}>{CHU_LINK_KHONG_MO_DUOC}</span>
        <span style={{ font: "var(--text-body)", color: "var(--warning-ink)" }}>{CHU_LINK_KHONG_MO_DUOC_PHU}</span>
      </div>
    </div>
    <div style={{ marginTop: "auto" }}>
      <button type="button" className="hh-btn hh-btn--primary hh-btn--block" disabled={dangVao} onClick={onVaoApp}>
        {dangVao ? "Đang vào…" : "Vào app"}
      </button>
    </div>
  </div>
);
