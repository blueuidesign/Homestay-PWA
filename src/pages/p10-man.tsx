import React from "react";
import { ChipMucCong } from "../components/chip-muc-cong";
import { CHU_GHI_CHU_P10_CUOI, CHU_GHI_CHU_P10_DAU, chuDong, viDuP10 } from "../components/muc-cong-hien-thi";

// P10 · Mức cộng giá mặc định (YC5.6). Phần vẽ, không gọi server. Ví dụ "PHÒNG 1509, 2 ĐÊM" tính theo chip và công tắc đang chọn.
export const NoiDungP10 = ({
  muc,
  lamTron,
  moTuyChon,
  chuNhap,
  dangLuu,
  loiChung,
  onChonMuc,
  onMoTuyChon,
  onNhap,
  onLamTron,
  onLuu,
}: {
  muc: number;
  lamTron: boolean;
  moTuyChon: boolean;
  chuNhap: string;
  dangLuu: boolean;
  loiChung: string | null;
  onChonMuc: (soTien: number) => void;
  onMoTuyChon: () => void;
  onNhap: (chu: string) => void;
  onLamTron: (bat: boolean) => void;
  onLuu: () => void;
}) => {
  const vd = viDuP10(muc, lamTron);
  const Dong = ({ nhan, so, dam }: { nhan: string; so: number; dam?: boolean }) => (
    <div style={{ display: "flex", justifyContent: "space-between", font: "var(--text-body)", color: "var(--ink)" }}>
      <span>{nhan}</span>
      <span style={{ fontWeight: dam ? 700 : 400 }}>{chuDong(so)}</span>
    </div>
  );
  return (
    <>
      <div className="noi-dung" style={{ paddingBottom: 120 }}>
        {loiChung && (
          <div className="hh-banner hh-banner--danger" role="alert">
            <span>⚠️ {loiChung}</span>
          </div>
        )}
        <div className="khoi">
          <span style={{ font: "var(--text-body)", color: "var(--ink-secondary)" }}>{CHU_GHI_CHU_P10_DAU}</span>
          <ChipMucCong soTien={muc} moTuyChon={moTuyChon} chuNhap={chuNhap} onChon={onChonMuc} onMoTuyChon={onMoTuyChon} onNhap={onNhap} />
        </div>
        <div className="khoi">
          <button
            type="button"
            role="switch"
            aria-checked={lamTron}
            data-lam-tron
            className="hh-btn hh-btn--secondary hh-btn--block"
            style={{ justifyContent: "space-between", minHeight: 44 }}
            onClick={() => onLamTron(!lamTron)}
          >
            <span>Làm tròn lên 50.000đ</span>
            <span className="chu-phu">{lamTron ? "Bật" : "Tắt"}</span>
          </button>
        </div>
        <div className="khoi" data-vi-du>
          <span className="nhan-muc">VÍ DỤ: PHÒNG 1509, 2 ĐÊM</span>
          <Dong nhan="Giá chủ nhà" so={vd.gia_chu} />
          <Dong nhan="Giá gửi khách" so={vd.gia_khach} dam />
          <Dong nhan="Bạn được" so={vd.ban_duoc} dam />
        </div>
      </div>
      <div className="thanh-duoi">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span className="chu-phu" style={{ textAlign: "center" }}>
            {CHU_GHI_CHU_P10_CUOI}
          </span>
          <button type="button" className="hh-btn hh-btn--primary hh-btn--block" disabled={dangLuu} onClick={onLuu}>
            {dangLuu ? "Đang lưu…" : "Lưu thay đổi"}
          </button>
        </div>
      </div>
    </>
  );
};
