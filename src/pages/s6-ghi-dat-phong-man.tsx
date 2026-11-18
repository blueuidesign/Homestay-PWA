import React from "react";
import {
  CHU_DANG_LUU,
  CHU_GHI_CHU_GIA_DIEN_SAN,
  CHU_GHI_CHU_THEM_SAU,
  CHU_NUT_DAT_PHONG,
  CHU_S6_05_TIEU_DE,
  TOI_DA_DEM_GHI,
  chuBanLoi,
  chuBaoTrung,
  chuDaChot,
  chuKhoangDem,
  docTien,
  tenCanSale,
} from "../components/can-sale-hien-thi";
import type { CanChiTiet } from "../services/kieu";
import { chuNgayNgan, congNgay } from "../services/ngay";

// Phần vẽ của S6-05 (mục "Ghi booking đã chốt cho căn tự nhập" (US16)). Không gọi server. Màn: s6-ghi-dat-phong.tsx.
export type FormGhi = { chip: "hom" | "mai" | "khac"; ngayNhan: string; soDem: number; tra: string; thu: string };

export const NoiDungS6GhiDatPhong = ({
  can,
  hom,
  form,
  trung,
  loi,
  dangLuu,
  onChip,
  onNgayKhac,
  onSoDem,
  onTra,
  onThu,
  onLuu,
}: {
  can: CanChiTiet;
  hom: string;
  form: FormGhi;
  trung: string | null;
  loi: string | null;
  dangLuu: boolean;
  onChip: (c: FormGhi["chip"]) => void;
  onNgayKhac: (ngay: string) => void;
  onSoDem: (n: number) => void;
  onTra: (chu: string) => void;
  onThu: (chu: string) => void;
  onLuu: () => void;
}) => {
  const ngayTra = congNgay(form.ngayNhan, form.soDem);
  const tra = docTien(form.tra);
  const thu = docTien(form.thu);
  const dongLoi = chuBanLoi(tra, thu);
  const thieu = tra === null || thu === null;
  const mai = congNgay(hom, 1);
  return (
    <>
      <div className="noi-dung" style={{ paddingBottom: 130 }}>
        <div className="khoi" data-khoi="can">
          <span style={{ font: "var(--text-body-strong)", color: "var(--ink)" }}>
            {chuDaChot(`${CHU_S6_05_TIEU_DE} ${tenCanSale(can)}`, can.ten_chu_can || "chủ căn")}
          </span>
        </div>

        <div className="khoi" data-khoi="ngay">
          <span className="nhan-muc">Ngày nhận</span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {(
              [
                ["hom", `Hôm nay ${chuNgayNgan(hom)}`],
                ["mai", `Mai ${chuNgayNgan(mai)}`],
                ["khac", "Ngày khác"],
              ] as const
            ).map(([ma, chu]) => (
              <button
                key={ma}
                type="button"
                className={"hh-chip hh-chip--sale" + (form.chip === ma ? " hh-chip--on" : "")}
                aria-pressed={form.chip === ma}
                onClick={() => onChip(ma)}
              >
                {chu}
              </button>
            ))}
          </div>
          {form.chip === "khac" && (
            <label className="hh-field">
              <span className="hh-field__label">Ngày nhận phòng</span>
              <input className="hh-input" type="date" name="ngay_nhan" value={form.ngayNhan} min={hom} onChange={(e) => e.target.value && onNgayKhac(e.target.value)} />
            </label>
          )}
          <span className="nhan-muc">Số đêm</span>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button type="button" className="hh-iconbtn hh-iconbtn--round" style={{ width: 44, height: 44 }} aria-label="Bớt một đêm" disabled={form.soDem <= 1} onClick={() => onSoDem(form.soDem - 1)}>
              −
            </button>
            <span data-khoang style={{ flex: "1 1 0%", textAlign: "center", font: "var(--text-body-strong)", color: "var(--ink)" }}>
              {chuKhoangDem(form.ngayNhan, ngayTra, form.soDem)}
            </span>
            <button type="button" className="hh-iconbtn hh-iconbtn--round" style={{ width: 44, height: 44 }} aria-label="Thêm một đêm" disabled={form.soDem >= TOI_DA_DEM_GHI} onClick={() => onSoDem(form.soDem + 1)}>
              +
            </button>
          </div>
          {trung && (
            <span className="chu-loi" role="status" data-bao-trung>
              ⚠️ {chuBaoTrung(trung)}
            </span>
          )}
        </div>

        <div className="khoi" data-khoi="tien">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <label className="hh-field">
              <span className="hh-field__label">Trả chủ (đ)</span>
              <input className="hh-input" type="text" inputMode="numeric" name="tien_phong" placeholder="0" value={form.tra} onChange={(e) => onTra(e.target.value)} />
            </label>
            <label className="hh-field">
              <span className="hh-field__label">Thu khách (đ)</span>
              <input className="hh-input" type="text" inputMode="numeric" name="gia_ban" placeholder="0" value={form.thu} onChange={(e) => onThu(e.target.value)} />
            </label>
          </div>
          {dongLoi && (
            <span data-ban-loi style={{ font: "var(--text-body-strong)", color: tra !== null && thu !== null && thu < tra ? "var(--danger)" : "var(--action)" }} role="status">
              {dongLoi}
            </span>
          )}
          <span className="chu-phu">{CHU_GHI_CHU_GIA_DIEN_SAN}</span>
        </div>
      </div>
      <div className="thanh-duoi">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {loi && (
            <span className="chu-loi" role="alert" style={{ textAlign: "center" }}>
              ⚠️ {loi}
            </span>
          )}
          {thieu && !loi && (
            <span className="chu-phu" style={{ textAlign: "center" }}>
              Nhập số tiền trả chủ và thu khách
            </span>
          )}
          <button type="button" className="hh-btn hh-btn--primary hh-btn--block" disabled={thieu || dangLuu} onClick={onLuu}>
            {dangLuu ? CHU_DANG_LUU : CHU_NUT_DAT_PHONG}
          </button>
          <span className="chu-phu" style={{ textAlign: "center" }}>
            {CHU_GHI_CHU_THEM_SAU}
          </span>
        </div>
      </div>
    </>
  );
};
