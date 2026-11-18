import React from "react";
import {
  CHU_BO_KHOI_DANH_SACH,
  CHU_DA_XOA_PHU,
  CHU_DA_XOA_TAI_KHOAN,
  CHU_GUI_LOI_MOI,
  CHU_S6_00_MO_TA,
  CHU_S6_00_THEM_CAN,
  CHU_S6_00_TIEU_DE,
  CHU_S6_00_XIN_LICH,
  CHU_THEM_CAN,
  CHU_THEM_CAN_TU_NHAP,
  TEN_NHOM_S6,
  chuCaiDau,
  chuGoiYMoi,
  chuTinhTrangHomNay,
  demChuNhaConKetNoi,
  dongCanTuNhap,
  dongPhuCanSale,
  tenCanSale,
} from "../components/can-sale-hien-thi";
import { Icon } from "../components/icon";
import type { Can, DongNguonPhong, NguonPhong } from "../services/kieu";

// Phần vẽ của S6, S6-00, S6-08 (YC6.1). Không gọi server. Màn: s6-can-sale.tsx.
const NhanNhom = ({ ten, so, nut }: { ten: string; so: number; nut?: React.ReactNode }) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, minHeight: 44, padding: "0 4px" }}>
    <span className="nhan-muc">
      {ten} · {so}
    </span>
    {nut}
  </div>
);

const HangCan = ({
  ten,
  dong1,
  dong2,
  dongPhuCon,
  nhan,
  onCham,
  dataCan,
}: {
  ten: string;
  dong1: string;
  dong2?: string | null;
  dongPhuCon?: boolean;
  nhan?: string;
  onCham: () => void;
  dataCan?: string;
}) => (
  <button type="button" className="dong-sale" data-can={dataCan ?? ten} onClick={onCham} style={dongPhuCon ? { paddingLeft: 52 } : undefined}>
    <div style={{ flex: "1 1 0%", minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
      <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ font: "var(--text-body-strong)", color: "var(--ink)" }}>{ten}</span>
        {nhan && <span className="hh-badge">{nhan}</span>}
      </span>
      <span style={{ font: "var(--text-body)", color: "var(--ink-muted)" }}>{dong1}</span>
      {dong2 && <span style={{ font: "var(--text-body-strong)", color: "var(--action-ink)" }}>{dong2}</span>}
    </div>
    <Icon ten="mui-phai" co={16} />
  </button>
);

export const NoiDungS6 = ({
  can,
  nguon,
  dangBoId,
  loiBo,
  loiMoi,
  onThemCanCuaToi,
  onCanCuaToi,
  onChuNha,
  onCanChuNha,
  onCanTuNhap,
  onThemTuNhap,
  onMoi,
  onBoDong,
  onXinLich,
}: {
  can: Can[];
  nguon: NguonPhong;
  dangBoId?: string | null;
  loiBo?: string | null;
  loiMoi?: string | null;
  onThemCanCuaToi: () => void;
  onCanCuaToi: (c: Can) => void;
  onChuNha: (d: DongNguonPhong) => void;
  onCanChuNha: (d: DongNguonPhong, canId: string) => void;
  onCanTuNhap: (c: Can) => void;
  onThemTuNhap: () => void;
  onMoi: (ten: string) => void;
  onBoDong: (d: DongNguonPhong) => void;
  onXinLich: () => void;
}) => {
  const cuaToi = can.filter((c) => c.loai !== "tu_nhap");
  const tuNhap = can.filter((c) => c.loai === "tu_nhap");
  const chuNha = nguon.nguon_phong;
  // S6-00: chưa có căn nào
  if (cuaToi.length === 0 && tuNhap.length === 0 && chuNha.length === 0) {
    return (
      <div className="khoi" style={{ padding: "32px 20px", alignItems: "center", textAlign: "center" }} data-man="S6-00">
        <span style={{ font: "var(--text-stat-md)", color: "var(--ink)" }}>{CHU_S6_00_TIEU_DE}</span>
        <span style={{ font: "var(--text-body)", color: "var(--ink-secondary)" }}>{CHU_S6_00_MO_TA}</span>
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8, paddingTop: 4 }}>
          <button type="button" className="hh-btn hh-btn--primary hh-btn--block" onClick={onThemCanCuaToi}>
            <Icon ten="cong" co={16} />
            {CHU_S6_00_THEM_CAN}
          </button>
          <button type="button" className="hh-btn hh-btn--secondary hh-btn--block" onClick={onXinLich}>
            {CHU_S6_00_XIN_LICH}
          </button>
          <button type="button" className="hh-btn hh-btn--secondary hh-btn--block" onClick={onThemTuNhap}>
            {CHU_THEM_CAN_TU_NHAP}
          </button>
        </div>
      </div>
    );
  }
  return (
    <>
      <div data-nhom="cua_toi">
        <NhanNhom
          ten={TEN_NHOM_S6.cua_toi}
          so={cuaToi.length}
          nut={
            <button type="button" className="hh-btn hh-btn--text hh-btn--inline" onClick={onThemCanCuaToi}>
              <Icon ten="cong" co={16} />
              {CHU_THEM_CAN}
            </button>
          }
        />
        {cuaToi.length > 0 && (
          <div className="khoi" style={{ padding: "0 16px" }}>
            {cuaToi.map((c) => (
              <HangCan
                key={c.id}
                ten={tenCanSale(c)}
                dataCan={c.ma_can}
                dong1={dongPhuCanSale(c)}
                dong2={chuTinhTrangHomNay(c.tinh_trang_hom_nay)}
                onCham={() => onCanCuaToi(c)}
              />
            ))}
          </div>
        )}
      </div>

      {chuNha.length > 0 && (
        <div data-nhom="chu_nha">
          <NhanNhom ten={TEN_NHOM_S6.chu_nha} so={demChuNhaConKetNoi(chuNha)} />
          <div className="khoi" style={{ padding: "0 16px", gap: 0 }}>
            {chuNha.map((d) =>
              d.da_xoa_tai_khoan ? (
                <div key={d.id} className="dong-sale dong-sale--tinh" data-chu-nha={d.ten_hien_thi ?? ""} data-da-xoa="true" style={{ flexWrap: "wrap" }}>
                  <span className="o-chu-cai" style={{ background: "var(--border-subtle)", color: "var(--ink-muted)" }}>
                    {chuCaiDau(d.ten_hien_thi)}
                  </span>
                  <div style={{ flex: "1 1 0%", minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
                    <span style={{ font: "var(--text-body-strong)", color: "var(--ink-muted)" }}>
                      {d.ten_hien_thi ?? "Chủ nhà"} <span style={{ color: "var(--danger)", font: "var(--text-caption)" }}>{CHU_DA_XOA_TAI_KHOAN}</span>
                    </span>
                    <span style={{ font: "var(--text-body)", color: "var(--ink-muted)" }}>{CHU_DA_XOA_PHU}</span>
                  </div>
                  <button
                    type="button"
                    className="hh-btn hh-btn--secondary hh-btn--inline"
                    style={{ minHeight: 44 }}
                    disabled={dangBoId === d.id}
                    onClick={() => onBoDong(d)}
                  >
                    {CHU_BO_KHOI_DANH_SACH}
                  </button>
                </div>
              ) : (
                <div key={d.id} data-chu-nha={d.ten_hien_thi ?? ""}>
                  <button type="button" className="dong-sale" onClick={() => onChuNha(d)}>
                    <span className="o-chu-cai">{chuCaiDau(d.ten_hien_thi)}</span>
                    <span style={{ flex: "1 1 0%", font: "var(--text-body-strong)", color: "var(--ink)" }}>{d.ten_hien_thi ?? "Chủ nhà"}</span>
                    <Icon ten="mui-phai" co={16} />
                  </button>
                  {(d.can ?? []).map((c) => (
                    <HangCan key={c.id} ten={tenCanSale(c)} dataCan={c.ma_can} dong1={dongPhuCanSale(c)} dongPhuCon onCham={() => onCanChuNha(d, c.id)} />
                  ))}
                </div>
              ),
            )}
          </div>
          {loiBo && <span className="chu-loi" role="alert">⚠️ {loiBo}</span>}
        </div>
      )}

      <div data-nhom="tu_nhap">
        <NhanNhom ten={TEN_NHOM_S6.tu_nhap} so={tuNhap.length} />
        {tuNhap.length > 0 && (
          <div className="khoi" style={{ padding: "0 16px" }}>
            {tuNhap.map((c) => (
              <HangCan key={c.id} ten={tenCanSale(c)} dataCan={c.ma_can} dong1={dongCanTuNhap(c)} onCham={() => onCanTuNhap(c)} />
            ))}
          </div>
        )}
      </div>

      {tuNhap.length > 0 && (
        <div className="khoi" style={{ background: "var(--action-tint)", borderColor: "var(--action-ring)" }} data-goi-y-moi>
          <span style={{ font: "var(--text-body)", color: "var(--ink-body)" }}>{chuGoiYMoi(tuNhap[0].ten_chu_can || "chủ căn")}</span>
          <button type="button" className="hh-btn hh-btn--secondary hh-btn--block" onClick={() => onMoi(tuNhap[0].ten_chu_can || "chủ căn")}>
            {CHU_GUI_LOI_MOI}
          </button>
          {loiMoi && <span className="chu-loi" role="alert">⚠️ {loiMoi}</span>}
        </div>
      )}

      <button type="button" className="hh-btn hh-btn--secondary hh-btn--block" onClick={onThemTuNhap}>
        <Icon ten="cong" co={16} />
        {CHU_THEM_CAN_TU_NHAP}
      </button>
    </>
  );
};
