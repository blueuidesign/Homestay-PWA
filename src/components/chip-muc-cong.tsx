import React from "react";
import { CHIP_MUC_CONG, CHU_LOI_MUC_CONG, CHU_TUY_CHON, chipDangChon, docSoTienMucCong } from "./muc-cong-hien-thi";

// Bộ chip Mức cộng của sale, dùng chung cho S3 (mục "Chi tiết căn và giá bán" (US13) bước 4) và P10 (mục "Mức cộng giá mặc định" (US13) bước 2): đúng 7 chip theo glossary.
// moTuyChon: người dùng đã chạm "Tùy chọn" (hoặc mức hiện tại không nằm trong bộ chip). chuNhap: chữ trong ô nhập.
export const ChipMucCong = ({
  soTien,
  moTuyChon,
  chuNhap,
  tat,
  onChon,
  onMoTuyChon,
  onNhap,
}: {
  soTien: number;
  moTuyChon: boolean;
  chuNhap: string;
  tat?: boolean;
  onChon: (soTien: number) => void;
  onMoTuyChon: () => void;
  onNhap: (chu: string) => void;
}) => {
  const dang = moTuyChon ? "tuy_chon" : chipDangChon(soTien);
  const loi = moTuyChon && chuNhap.trim() !== "" && docSoTienMucCong(chuNhap) === null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div role="group" aria-label="Mức cộng" data-chip-muc-cong style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4 }}>
        {CHIP_MUC_CONG.map((c) => (
          <button
            key={c.gia_tri}
            type="button"
            className={"hh-chip hh-chip--sale" + (dang === c.gia_tri ? " hh-chip--on" : "")}
            aria-pressed={dang === c.gia_tri}
            disabled={tat}
            onClick={() => onChon(c.gia_tri)}
          >
            {c.chu}
          </button>
        ))}
        <button
          type="button"
          className={"hh-chip hh-chip--sale" + (dang === "tuy_chon" ? " hh-chip--on" : "")}
          aria-pressed={dang === "tuy_chon"}
          disabled={tat}
          onClick={onMoTuyChon}
        >
          {CHU_TUY_CHON}
        </button>
      </div>
      {dang === "tuy_chon" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <input
            name="muc_cong_tuy_chon"
            className="hh-input"
            inputMode="numeric"
            aria-label="Mức cộng mỗi đêm (đồng)"
            placeholder="Số tiền cộng mỗi đêm, ví dụ 250.000"
            value={chuNhap}
            style={{ minHeight: 44, fontSize: 16, padding: "0 12px", boxSizing: "border-box" }}
            onChange={(e) => onNhap(e.target.value)}
          />
          {loi && (
            <span role="alert" className="chu-phu" style={{ color: "var(--danger)" }}>
              {CHU_LOI_MUC_CONG}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
