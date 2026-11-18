import React from "react";
import { TEN_THU } from "../components/can-hien-thi";
import { chuTien } from "../services/ngay";

// P6 · Ngày tính giá cuối tuần (mục "Ngày tính giá cuối tuần" (US4)). Phần vẽ, tách khỏi p6-dem-cuoi-tuan.tsx để test.
export const CHU_P6_DAU = "Chọn những đêm tính giá cuối tuần. Các đêm còn lại tính giá ngày thường.";
export const CHU_P6_GHI_CHU = "Tính theo đêm ở. VD: nhận phòng T6, trả phòng CN là 2 đêm cuối tuần.";
export const CHU_P6_TEN_GIA = "Tên ô giá ở mục Giá của căn đổi theo lựa chọn này.";
export const CHU_P6_CHON_IT_NHAT = "Chọn ít nhất một đêm"; // chữ tạm: bỏ chọn hết còn [MỞ: DC53 phien-ho-so.md câu hỏi mở 12]
export const CHU_P6_CHUA_CO_GIA = "Đặt giá cho một căn để xem tuần mẫu."; // chữ tạm: canvas chỉ vẽ phòng 1509 có giá

// Giá viết "900k", "1.300k" như canvas P6
export const chuGiaP6 = (n: number) => `${chuTien(Math.round(n / 1000))}k`;

export type MauTuan = { ma_can: string; thuong: number; cuoi_tuan: number };

// Giá từng thứ T2 đến CN của tuần mẫu theo các đêm đang chọn; ô cuối tuần là ô xanh
export const tuanMau = (m: MauTuan, dem: number[]) =>
  TEN_THU.map((thu, i) => {
    const cuoi = dem.includes(i + 1);
    return { thu, cuoi, gia: cuoi ? m.cuoi_tuan : m.thuong };
  });

export const NoiDungP6 = ({
  dem,
  mau,
  dangLuu,
  loiChung,
  onChon,
  onLuu,
}: {
  dem: number[];
  mau: MauTuan | null;
  dangLuu: boolean;
  loiChung: string | null;
  onChon: (thu: number) => void;
  onLuu: () => void;
}) => (
  <>
    <div className="noi-dung" style={{ paddingBottom: 120 }}>
      {loiChung && (
        <div className="hh-banner hh-banner--danger" role="alert">
          <span>⚠️ {loiChung}</span>
        </div>
      )}
      <div className="khoi">
        <span style={{ font: "var(--text-body)", color: "var(--ink-secondary)" }}>{CHU_P6_DAU}</span>
        <span className="nhan-muc">Đêm cuối tuần</span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {TEN_THU.map((ten, i) => {
            const on = dem.includes(i + 1);
            return (
              <button
                key={ten}
                type="button"
                className={"hh-chip hh-chip--sale" + (on ? " hh-chip--on" : "")}
                aria-pressed={on}
                onClick={() => onChon(i + 1)}
              >
                {ten}
              </button>
            );
          })}
        </div>
        <span className="chu-phu">{CHU_P6_GHI_CHU}</span>
      </div>
      <div className="khoi">
        <span className="nhan-muc">{mau ? `Một tuần của phòng ${mau.ma_can}` : "Một tuần mẫu"}</span>
        {mau ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: 4 }} data-tuan-mau>
            {tuanMau(mau, dem).map((o) => (
              <div
                key={o.thu}
                data-cuoi-tuan={o.cuoi}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 52,
                  borderRadius: "var(--radius-sm)",
                  border: "1px solid " + (o.cuoi ? "var(--action)" : "var(--border)"),
                  background: o.cuoi ? "var(--action-soft)" : "var(--surface)",
                  color: o.cuoi ? "var(--action-ink)" : "var(--ink-body)",
                }}
              >
                <span style={{ font: "var(--text-body-strong)" }}>{o.thu}</span>
                <span style={{ font: "var(--text-micro)" }}>{chuGiaP6(o.gia)}</span>
              </div>
            ))}
          </div>
        ) : (
          <span className="chu-phu">{CHU_P6_CHUA_CO_GIA}</span>
        )}
        <span className="chu-phu">{CHU_P6_TEN_GIA}</span>
      </div>
    </div>
    <div className="thanh-duoi">
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {dem.length === 0 && (
          <span className="chu-phu" style={{ textAlign: "center" }}>
            {CHU_P6_CHON_IT_NHAT}
          </span>
        )}
        <button type="button" className="hh-btn hh-btn--primary hh-btn--block" disabled={dem.length === 0 || dangLuu} onClick={onLuu}>
          {dangLuu ? "Đang lưu…" : "Lưu thay đổi"}
        </button>
      </div>
    </div>
  </>
);
