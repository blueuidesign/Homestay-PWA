import React from "react";
import { dongThongTin } from "../components/can-hien-thi";
import { chuCaiDau } from "../components/sale-hien-thi";
import type { CanTrongLink, XemTruocLink } from "../services/kieu";

// A10 · Thêm lịch (YC1.3 bước 3, 4), A10-01 · Đã có lịch của chủ nhà này (bước 6). Phần vẽ, không gọi server.
// Không có giá nào trên màn, kể cả khi chủ nhà cho sale xem giá (QD9, PQ5.LINK).

export const CHU_DONG_DUOI_NUT = "Chưa bấm thì chưa có gì vào lịch của bạn.";
export const CHU_DE_SAU_A10 = "Để sau vẫn thêm được lịch. Chủ nhà chỉ thấy tên Zalo của bạn.";
export const chuNutThem = (ten: string | null) => `Thêm lịch của ${ten ?? "chủ nhà"}`;
export const chuGiaiThich = (ten: string | null) =>
  `${ten ?? "Chủ nhà"} mời bạn thêm lịch các căn dưới đây. Bấm "Thêm lịch" thì các căn mới vào lịch của bạn.`;
export const chuTenCanTrongLink = (c: Pick<CanTrongLink, "toa_nha" | "ma_can">) => [c.toa_nha, c.ma_can].filter(Boolean).join(" ");

const TheChuNha = ({ ten, soCan }: { ten: string | null; soCan: number }) => (
  <div className="khoi" style={{ flexDirection: "row", alignItems: "center", gap: 14 }} data-the="chu-nha">
    <span className="o-chu-cai" style={{ width: 48, height: 48, fontSize: 16 }}>
      {chuCaiDau(ten ?? "Chủ nhà")}
    </span>
    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <span style={{ font: "var(--text-nav)", color: "var(--ink)" }}>{ten ?? "Chủ nhà"}</span>
      <span style={{ font: "var(--text-body)", color: "var(--ink-secondary)" }}>Chủ nhà · {soCan} căn</span>
    </div>
  </div>
);

const TheCanTrongLink = ({ can }: { can: CanTrongLink }) => (
  <div className="khoi" style={{ flexDirection: "row", alignItems: "center", gap: 12, padding: 10 }} data-can={can.ma_can}>
    {can.anh_dai_dien ? (
      <img src={can.anh_dai_dien} alt="" style={{ flex: "0 0 auto", width: 72, height: 72, borderRadius: "var(--radius-md)", objectFit: "cover" }} />
    ) : (
      <span
        style={{
          flex: "0 0 auto",
          width: 72,
          height: 72,
          borderRadius: "var(--radius-md)",
          background: "var(--border-subtle)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          font: "var(--text-caption)",
          color: "var(--ink-muted)",
          textAlign: "center",
        }}
      >
        Chưa có ảnh
      </span>
    )}
    <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
      <span style={{ font: "var(--text-body-strong)", color: "var(--ink)" }}>{chuTenCanTrongLink(can)}</span>
      <span style={{ font: "var(--text-body)", color: "var(--ink-secondary)" }}>
        {dongThongTin({ so_phong_ngu: can.so_phong_ngu, so_giuong: can.so_giuong, loai_view: can.loai_view, toa_nha: null })}
      </span>
    </div>
  </div>
);

export const NoiDungA10 = ({
  xem,
  dangLuu,
  loi,
  onThem,
}: {
  xem: XemTruocLink;
  dangLuu: boolean;
  loi: string | null;
  onThem: () => void;
}) => {
  const ten = xem.chu_nha.ten_hien_thi;
  return (
    <>
      <div className="noi-dung" style={{ paddingBottom: 150 }}>
        <TheChuNha ten={ten} soCan={xem.so_can} />
        <span style={{ font: "var(--text-body)", color: "var(--ink-secondary)", padding: "0 4px" }}>{chuGiaiThich(ten)}</span>
        <span className="nhan-muc" style={{ padding: "0 4px" }}>
          {xem.so_can} căn
        </span>
        {xem.can.map((c) => (
          <TheCanTrongLink key={c.ma_can + (c.toa_nha ?? "")} can={c} />
        ))}
      </div>
      <div className="thanh-duoi" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {loi && (
          <span className="chu-loi" role="alert">
            ⚠️ {loi}
          </span>
        )}
        <button type="button" className="hh-btn hh-btn--primary hh-btn--block" disabled={dangLuu} onClick={onThem}>
          {dangLuu ? "Đang lưu…" : chuNutThem(ten)}
        </button>
        <span style={{ font: "var(--text-body)", color: "var(--ink-muted)", textAlign: "center" }}>{CHU_DONG_DUOI_NUT}</span>
      </div>
    </>
  );
};

export const chuDaCoLich = (ten: string | null) => `Bạn đã có lịch của ${ten ?? "chủ nhà"}`;
export const chuDaCoLichPhu = (soCan: number, ten: string | null) =>
  `${soCan} căn của ${ten ?? "chủ nhà"} đã có trong lịch của bạn. Mở lại link không thêm lần nữa.`;

export const NoiDungA1001 = ({ xem, onXemLich }: { xem: XemTruocLink; onXemLich: () => void }) => {
  const ten = xem.chu_nha.ten_hien_thi;
  return (
    <>
      <div className="noi-dung" style={{ paddingBottom: 110 }}>
        <TheChuNha ten={ten} soCan={xem.so_can} />
        <div
          className="khoi"
          role="status"
          data-the="da-co"
          style={{ background: "var(--warning-tint)", borderColor: "var(--warning-border)", flexDirection: "row", gap: 12, alignItems: "flex-start" }}
        >
          <span style={{ font: "var(--text-nav)", color: "var(--warning-ink)" }} aria-hidden="true">
            ✓
          </span>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ font: "var(--text-body-strong)", color: "var(--warning-ink)" }}>{chuDaCoLich(ten)}</span>
            <span style={{ font: "var(--text-body)", color: "var(--warning-ink)" }}>{chuDaCoLichPhu(xem.so_can, ten)}</span>
          </div>
        </div>
      </div>
      <div className="thanh-duoi">
        <button type="button" className="hh-btn hh-btn--primary hh-btn--block" onClick={onXemLich}>
          Xem lịch
        </button>
      </div>
    </>
  );
};

