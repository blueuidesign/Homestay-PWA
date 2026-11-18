import React from "react";
import {
  CAC_DONG_SALE_THAY,
  chuA8SaleSeThay,
  CHU_A8_XIN,
  CHU_A8_01_NUT,
  CHU_A8_01_PHU,
  CHU_A8_01_TIEU_DE,
  CHU_A8_CHUA_TK,
  CHU_A8_COC,
  CHU_A8_KHONG_THAY,
  CHU_A8_NUT_DONG_Y,
  CHU_A8_NUT_TU_CHOI,
} from "../components/xin-lich-hien-thi";
import { chuCaiDau, chuSoDienThoai } from "../components/sale-hien-thi";
import type { XemTruocLinkXin } from "../services/kieu";

// A8 · Chủ nhà mở link của sale (YC1.7 bước 2): sale là ai, sale sẽ thấy gì, rồi đồng ý hoặc từ chối.
// A8-01 · link hết hạn, sale đã xóa tài khoản hoặc đã bị ngừng: không có tên, số, nút đồng ý (HV5, YC1.7-NT4).
// Giá từng đêm không còn công tắc: căn đã chia sẻ thì sale luôn thấy giá (QD20 r2 điểm 3). Còn một công tắc: Tình trạng cọc.
// "Đổi được trong mục Sale" của canvas bỏ: chưa có màn đổi quyền ở CN7-04 ([MỞ: YC1-H5]).
export type PropsA8 = {
  xin: XemTruocLinkXin;
  coTaiKhoan: boolean;
  coc: boolean;
  dangLam: boolean;
  loi: string | null;
  onDoiCoc: (v: boolean) => void;
  onDongY: () => void;
  onTuChoi: () => void;
};

export const NoiDungA8 = ({ xin, coTaiKhoan, coc, dangLam, loi, onDoiCoc, onDongY, onTuChoi }: PropsA8) => {
  const ten = xin.sale.ten_hien_thi;
  return (
    <>
      <div className="noi-dung" style={{ paddingBottom: 160 }}>
        {loi && (
          <div className="hh-banner hh-banner--danger" role="alert">
            <span>⚠️ {loi}</span>
          </div>
        )}
        <div className="khoi" style={{ flexDirection: "row", alignItems: "center", gap: 14 }} data-the="sale">
          <span className="o-chu-cai" style={{ width: 48, height: 48 }}>
            {chuCaiDau(ten ?? "Sale")}
          </span>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ font: "var(--text-nav)", color: "var(--ink)" }}>{ten ?? "Sale chưa có tên"}</span>
            {xin.sale.so_dien_thoai && (
              <span data-so-dien-thoai style={{ font: "var(--text-body)", color: "var(--ink-secondary)" }}>
                {chuSoDienThoai(xin.sale.so_dien_thoai)}
              </span>
            )}
            <span style={{ font: "var(--text-body)", color: "var(--ink-secondary)" }}>{CHU_A8_XIN}</span>
          </div>
        </div>
        <div className="khoi">
          <span className="nhan-muc">{chuA8SaleSeThay(ten)}</span>
          {CAC_DONG_SALE_THAY.map((d) => (
            <span key={d} style={{ font: "var(--text-body)", color: "var(--ink-body)" }}>
              • {d}
            </span>
          ))}
          <button
            type="button"
            role="switch"
            aria-checked={coc}
            data-coc
            className="hh-btn hh-btn--secondary hh-btn--block"
            style={{ justifyContent: "space-between", minHeight: 44 }}
            onClick={() => onDoiCoc(!coc)}
          >
            <span>{CHU_A8_COC}</span>
            <span className="chu-phu">{coc ? "Bật" : "Tắt"}</span>
          </button>
          <span className="chu-phu">{CHU_A8_KHONG_THAY}</span>
        </div>
        {!coTaiKhoan && (
          <div className="khoi" style={{ background: "var(--action-tint)", borderColor: "var(--action-ring)" }}>
            <span style={{ font: "var(--text-body)", color: "var(--ink-body)" }}>{CHU_A8_CHUA_TK}</span>
          </div>
        )}
      </div>
      <div className="thanh-duoi" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <button type="button" className="hh-btn hh-btn--primary hh-btn--block" disabled={dangLam} onClick={onDongY}>
          {dangLam ? "Đang xử lý…" : CHU_A8_NUT_DONG_Y}
        </button>
        <button type="button" className="hh-btn hh-btn--secondary hh-btn--block" disabled={dangLam} onClick={onTuChoi}>
          {CHU_A8_NUT_TU_CHOI}
        </button>
      </div>
    </>
  );
};

export const NoiDungA801 = ({ onVeLich }: { onVeLich: () => void }) => (
  <div className="noi-dung">
    <div className="khoi" role="alert" data-the="loi" style={{ padding: "32px 20px", alignItems: "center", textAlign: "center" }}>
      <span style={{ fontSize: 32 }} aria-hidden="true">
        🔗
      </span>
      <span style={{ font: "var(--text-stat-md)", color: "var(--ink)" }}>{CHU_A8_01_TIEU_DE}</span>
      <span style={{ font: "var(--text-body)", color: "var(--ink-secondary)" }}>{CHU_A8_01_PHU}</span>
      <button type="button" className="hh-btn hh-btn--primary hh-btn--block" onClick={onVeLich}>
        {CHU_A8_01_NUT}
      </button>
    </div>
  </div>
);
