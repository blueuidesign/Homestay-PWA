import React from "react";
import {
  CHU_CAN_NAY,
  CHU_CHI_BAN_THAY,
  CHU_CHUA_CO_DAT_PHONG,
  CHU_CHUA_DUNG_APP,
  CHU_DAT_PHONG_DA_GHI,
  CHU_GHI_CHU_DAT_PHONG,
  CHU_GOI_HOI_LICH,
  CHU_GUI_CHO_KHACH,
  CHU_GUI_CHO_KHACH_PHU,
  CHU_HUONG_DAN_DAT_PHONG,
  CHU_KHONG_XOA,
  CHU_MOI_DUNG_APP_PHU,
  CHU_NUT_DAT_PHONG,
  CHU_SUA_THONG_TIN,
  CHU_SUA_THONG_TIN_PHU,
  CHU_XOA_CAN_TU_NHAP,
  CHU_XOA_GHI_CHU,
  chuCaiDau,
  chuKhoangDem,
  chuKhongCoLich,
  chuMoiDungApp,
  chuSdtChe,
  chuTienChenh,
  chuXacNhanXoa,
  dongPhuCanSale,
} from "../components/can-sale-hien-thi";
import { Icon } from "../components/icon";
import type { CanChiTiet } from "../services/kieu";
import { chuDong } from "../services/mau-tin";
import { cacDem } from "../services/ngay";

// Phần vẽ của S6-03 và S6-03-00 (mục "Chi tiết căn tự nhập" (US16)). Không gọi server. Màn: s6-can-tu-nhap.tsx.
const Hang = ({ ten, phu, viec, onCham }: { ten: string; phu: string; viec: string; onCham: () => void }) => (
  <button type="button" className="dong-sale" data-viec={viec} onClick={onCham}>
    <div style={{ flex: "1 1 0%", minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
      <span style={{ font: "var(--text-body-strong)", color: "var(--ink)" }}>{ten}</span>
      <span style={{ font: "var(--text-body)", color: "var(--ink-muted)" }}>{phu}</span>
    </div>
    <Icon ten="mui-phai" co={16} />
  </button>
);

export const NoiDungS6CanTuNhap = ({
  can,
  xacNhanXoa,
  dangXoa,
  loiXoa,
  loiMoi,
  onGoi,
  onGuiKhach,
  onSua,
  onMoi,
  onXoa,
  onXacNhanXoa,
  onKhongXoa,
  onDatPhong,
}: {
  can: CanChiTiet;
  xacNhanXoa: boolean;
  dangXoa: boolean;
  loiXoa: string | null;
  loiMoi: string | null;
  onGoi: () => void;
  onGuiKhach: () => void;
  onSua: () => void;
  onMoi: () => void;
  onXoa: () => void;
  onXacNhanXoa: () => void;
  onKhongXoa: () => void;
  onDatPhong: () => void;
}) => {
  const tenChu = can.ten_chu_can || "chủ căn";
  const ds = can.dat_phong_da_ghi ?? [];
  const coSo = !!can.sdt_chu_can;
  return (
    <>
      <div className="noi-dung" style={{ paddingBottom: 100 }}>
        <div className="khoi" data-khoi="chu-can">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span className="o-chu-cai">{chuCaiDau(tenChu)}</span>
            <div style={{ flex: "1 1 0%", minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{ font: "var(--text-body-strong)", color: "var(--ink)" }}>
                {tenChu} · {CHU_CHUA_DUNG_APP}
              </span>
              <span style={{ font: "var(--text-body)", color: "var(--ink-secondary)" }}>
                {coSo ? chuSdtChe(can.sdt_chu_can) : "Chưa có số điện thoại"}
              </span>
            </div>
            <button type="button" className="hh-btn hh-btn--secondary hh-btn--inline" style={{ minHeight: 44 }} disabled={!coSo} onClick={onGoi}>
              {CHU_GOI_HOI_LICH}
            </button>
          </div>
          <span className="chu-phu">{chuKhongCoLich(tenChu)}</span>
          <span className="chu-phu">{dongPhuCanSale(can)}</span>
        </div>

        <div className="khoi" data-khoi="dat-phong-da-ghi" data-man={ds.length === 0 ? "S6-03-00" : "S6-03"}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
            <span className="nhan-muc">
              {CHU_DAT_PHONG_DA_GHI} · {ds.length}
            </span>
            <span className="chu-phu">{CHU_CHI_BAN_THAY}</span>
          </div>
          {ds.length === 0 ? (
            <>
              <span style={{ font: "var(--text-body-strong)", color: "var(--ink)" }}>{CHU_CHUA_CO_DAT_PHONG}</span>
              <span className="chu-phu">{CHU_HUONG_DAN_DAT_PHONG}</span>
            </>
          ) : (
            <>
              {ds.map((d) => (
                <div key={d.id} data-dat-phong={d.id} style={{ display: "flex", flexDirection: "column", gap: 2, minHeight: 44, justifyContent: "center" }}>
                  <span style={{ font: "var(--text-body-strong)", color: "var(--ink)" }}>{chuKhoangDem(d.ngay_nhan, d.ngay_tra, cacDem(d.ngay_nhan, d.ngay_tra).length)}</span>
                  <span style={{ font: "var(--text-body)", color: "var(--ink-secondary)" }}>
                    Trả chủ {chuDong(d.tien_phong)} · Thu khách {chuDong(d.gia_ban)}{" "}
                    <b style={{ color: d.tien_chenh >= 0 ? "var(--action-ink)" : "var(--danger)" }}>{chuTienChenh(d.tien_chenh)}</b>
                  </span>
                </div>
              ))}
              <span className="chu-phu">{CHU_GHI_CHU_DAT_PHONG}</span>
            </>
          )}
        </div>

        <div className="khoi" style={{ padding: "0 16px", gap: 0 }} data-khoi="can-nay">
          <span className="nhan-muc" style={{ padding: "12px 0 4px" }}>{CHU_CAN_NAY}</span>
          <Hang ten={CHU_GUI_CHO_KHACH} phu={CHU_GUI_CHO_KHACH_PHU} viec="gui_khach" onCham={onGuiKhach} />
          <Hang ten={CHU_SUA_THONG_TIN} phu={CHU_SUA_THONG_TIN_PHU} viec="sua" onCham={onSua} />
          <Hang ten={chuMoiDungApp(tenChu)} phu={CHU_MOI_DUNG_APP_PHU} viec="moi" onCham={onMoi} />
        </div>
        {loiMoi && <span className="chu-loi" role="alert">⚠️ {loiMoi}</span>}

        {xacNhanXoa ? (
          <div className="khoi" data-khoi="xac-nhan-xoa" style={{ borderColor: "var(--danger)" }}>
            <span style={{ font: "var(--text-body-strong)", color: "var(--ink)" }}>{chuXacNhanXoa(can.ma_can)}</span>
            <span style={{ font: "var(--text-body)", color: "var(--ink-secondary)" }}>{CHU_XOA_GHI_CHU}</span>
            {loiXoa && <span className="chu-loi" role="alert">⚠️ {loiXoa}</span>}
            <button type="button" className="hh-btn hh-btn--danger hh-btn--block" disabled={dangXoa} onClick={onXacNhanXoa}>
              {dangXoa ? "Đang xóa…" : chuXacNhanXoa(can.ma_can)}
            </button>
            <button type="button" className="hh-btn hh-btn--text hh-btn--block" disabled={dangXoa} onClick={onKhongXoa}>
              {CHU_KHONG_XOA}
            </button>
          </div>
        ) : (
          <button type="button" className="hh-btn hh-btn--secondary hh-btn--block" style={{ color: "var(--danger)" }} onClick={onXoa}>
            {CHU_XOA_CAN_TU_NHAP}
          </button>
        )}
      </div>
      <div className="thanh-duoi">
        <button type="button" className="hh-btn hh-btn--primary hh-btn--block" onClick={onDatPhong}>
          {CHU_NUT_DAT_PHONG}
        </button>
      </div>
    </>
  );
};
