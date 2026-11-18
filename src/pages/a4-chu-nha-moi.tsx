import React from "react";
import { Icon } from "../components/icon";

// A4 · Chủ nhà mới, chưa có căn (mục "Màn đầu tiên khi chưa có dữ liệu" (US1) bước 1, 2). Dùng ở tab Lịch và tab Căn khi chưa có căn (mục "Danh sách căn" (US1) trạng thái rỗng).
const BUOC = [
  { so: 1, ten: "Thêm căn và ảnh", mo_ta: "Tòa nhà, số phòng ngủ, ảnh để sale gửi khách" },
  { so: 2, ten: "Đặt giá", mo_ta: "Ngày thường, cuối tuần, ngày lễ" },
  { so: 3, ten: "Mời sale xem lịch", mo_ta: "Gửi link qua Zalo" },
];

export const NoiDungA4 = ({ onThemCan }: { onThemCan: () => void }) => (
  <>
    <div
      className="khoi"
      style={{ padding: "32px 20px", alignItems: "center", textAlign: "center" }}
    >
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
      <span style={{ font: "var(--text-stat-md)", color: "var(--ink)" }}>Chưa có căn nào</span>
      <span style={{ font: "var(--text-body)", color: "var(--ink-secondary)" }}>
        Thêm căn đầu tiên để bắt đầu ghi lịch và mời sale xem phòng trống.
      </span>
      <div style={{ width: "100%", paddingTop: 4 }}>
        <button type="button" className="hh-btn hh-btn--primary hh-btn--block" onClick={onThemCan}>
          <Icon ten="cong" co={16} />
          Thêm căn đầu tiên
        </button>
      </div>
    </div>
    <div className="khoi" style={{ gap: 4 }}>
      <span className="nhan-muc">3 bước để bắt đầu</span>
      {BUOC.map((b) => {
        const dau = b.so === 1;
        const noiDung = (
          <>
            <span
              style={{
                flex: "0 0 auto",
                width: 28,
                height: 28,
                borderRadius: "var(--radius-full)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 14,
                fontWeight: 700,
                ...(dau
                  ? { background: "var(--action)", color: "var(--on-action)" }
                  : { border: "2px solid var(--border-input)", color: "var(--ink-muted)" }),
              }}
            >
              {b.so}
            </span>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ font: "var(--text-body-strong)", color: dau ? "var(--ink)" : "var(--ink-secondary)" }}>
                {b.ten}
              </span>
              <span style={{ font: "var(--text-caption)", color: "var(--ink-muted)" }}>{b.mo_ta}</span>
            </div>
            {dau && (
              <span style={{ marginLeft: "auto", display: "flex", color: "var(--ink-faint)" }}>
                <Icon ten="mui-phai" co={16} />
              </span>
            )}
          </>
        );
        const kieu: React.CSSProperties = {
          minHeight: 52,
          display: "flex",
          alignItems: "center",
          gap: 12,
          borderBottom: b.so < 3 ? "1px solid var(--border-subtle)" : undefined,
        };
        // Dòng "Thêm căn và ảnh" mở CN5-A1 như nút "Thêm căn đầu tiên" (mục "Màn đầu tiên khi chưa có dữ liệu" (US1) bước 2)
        return dau ? (
          <a key={b.so} style={{ ...kieu, cursor: "pointer", color: "inherit" }} onClick={onThemCan}>
            {noiDung}
          </a>
        ) : (
          <div key={b.so} style={kieu}>
            {noiDung}
          </div>
        );
      })}
    </div>
    <div
      style={{
        background: "var(--warning-tint)",
        border: "1px solid var(--warning-border)",
        borderRadius: "var(--radius-md)",
        padding: "12px 16px",
        font: "var(--text-body)",
        color: "var(--warning-ink)",
      }}
    >
      💡 Có sổ lịch cũ? Thêm căn trước, sau đó nhập các đặt phòng sắp tới.
    </div>
  </>
);

// Khung xám khi tải lần đầu (HV1 bước 1)
export const KhungDangTai = () => (
  <>
    {[0, 1].map((i) => (
      <div key={i} className="khoi" style={{ height: 180, background: "var(--border-subtle)", borderColor: "var(--border-subtle)" }} />
    ))}
  </>
);

export const LoiMang = () => (
  <div className="hh-banner hh-banner--danger">Chưa tải được. Kiểm tra mạng rồi mở lại.</div>
);
