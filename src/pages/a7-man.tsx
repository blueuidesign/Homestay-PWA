import React from "react";
import { DaiXanh } from "../components/dai-xanh";
import { Icon } from "../components/icon";
import {
  chuLanGuiCuoi,
  chuSoChuNhaDongY,
  chuSoLanGui,
  CHU_A7_CHUA_GUI,
  CHU_A7_CHUA_GUI_PHU,
  CHU_A7_DA_GUI,
  CHU_A7_DANG_CHO,
  CHU_A7_GHI_CHU,
  CHU_A7_NHAC,
  CHU_A7_NHAN_LINK,
  CHU_A7_NUT_CHUA_GUI,
} from "../components/xin-lich-hien-thi";
import type { ThongKeXinLich } from "../services/kieu";

// A7 · Đã gửi, chờ chủ nhà (mục "Sale xin chủ nhà cho xem lịch" (US17) bước 3), A7-00 khi chưa gửi lần nào, A7-01 khi vừa quay lại từ Zalo (dải xanh, số đã cập nhật).
// Chỉ hai con số và lần gửi gần nhất, không có tên chủ nhà nào (US17-NT3, quy tắc Không biết gửi cho ai). Phần vẽ, tách khỏi trang để test.
export type PropsA7 = {
  tk: ThongKeXinLich;
  vuaGui: boolean; // A7-01: vừa gửi xong qua cửa sổ Zalo
  bayGio?: number;
  onGuiChoChuKhac: () => void;
  onThemCanTuNhap: () => void;
};

export const NoiDungA7 = ({ tk, vuaGui, bayGio, onGuiChoChuKhac, onThemCanTuNhap }: PropsA7) => {
  if (tk.so_lan_gui === 0) {
    // A7-00 (gần giống A5, design ghi có thể gộp): một nút gửi tin
    return (
      <div className="khoi" style={{ padding: "32px 20px", alignItems: "center", textAlign: "center" }}>
        <span style={{ width: 72, height: 72, borderRadius: "var(--radius-full)", background: "var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink-secondary)" }}>
          <Icon ten="lich" co={32} />
        </span>
        <span style={{ font: "var(--text-stat-md)", color: "var(--ink)" }}>{CHU_A7_CHUA_GUI}</span>
        <span style={{ font: "var(--text-body)", color: "var(--ink-secondary)" }}>{CHU_A7_CHUA_GUI_PHU}</span>
        <button type="button" className="hh-btn hh-btn--primary hh-btn--block" onClick={onGuiChoChuKhac}>
          {CHU_A7_NUT_CHUA_GUI}
        </button>
      </div>
    );
  }
  const lanCuoi = chuLanGuiCuoi(tk.gui_cuoi_luc, bayGio);
  return (
    <>
      {vuaGui && (
        <DaiXanh chu={CHU_A7_DA_GUI} />
      )}
      <div className="khoi">
        <span style={{ font: "var(--text-stat-md)", color: "var(--ink)" }}>{CHU_A7_DANG_CHO}</span>
        <span style={{ font: "var(--text-body)", color: "var(--ink-secondary)" }}>
          {lanCuoi ? `${lanCuoi} ` : ""}Chủ nhà nào đồng ý, lịch của họ hiện ở đây và bạn nhận thông báo.
        </span>
      </div>
      <div className="khoi">
        <span className="nhan-muc">{CHU_A7_NHAN_LINK}</span>
        <div style={{ display: "flex", gap: 24 }}>
          <span data-so-lan-gui style={{ font: "var(--text-body-strong)", color: "var(--ink)" }}>{chuSoLanGui(tk.so_lan_gui)}</span>
          <span data-so-dong-y style={{ font: "var(--text-body-strong)", color: "var(--ink)" }}>{chuSoChuNhaDongY(tk.so_chu_nha_dong_y)}</span>
        </div>
        <span className="chu-phu">{CHU_A7_GHI_CHU}</span>
      </div>
      <div className="khoi" style={{ flexDirection: "row", alignItems: "flex-start", gap: 12 }}>
        <span style={{ display: "flex", color: "var(--ink-faint)" }}>
          <Icon ten="nhom-nguoi" />
        </span>
        <span style={{ font: "var(--text-body)", color: "var(--ink-secondary)" }}>{CHU_A7_NHAC}</span>
      </div>
      <button type="button" className="hh-btn hh-btn--primary hh-btn--block" onClick={onGuiChoChuKhac}>
        Gửi link cho chủ nhà khác
      </button>
      <button type="button" className="hh-btn hh-btn--secondary hh-btn--block" onClick={onThemCanTuNhap}>
        <Icon ten="cong" co={16} />
        Thêm căn tự nhập
      </button>
    </>
  );
};
