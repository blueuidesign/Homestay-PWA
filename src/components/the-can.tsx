import React from "react";
import type { Can } from "../services/kieu";
import { NEN_TOI_THIEU_ANH } from "../stores/anh-form";
import { dongThongTin, tenThe } from "./can-hien-thi";
import { chuKhoangTuan } from "./gia-hien-thi";
import { Icon } from "./icon";

// Thẻ căn bản gọn của US1 (CN5). Giá tuần này, tình trạng hôm nay, nút đặt giá: US4, US2.
// Ảnh đại diện và gợi ý thêm ảnh (YC3.1-NT2): US25. Chạm thẻ mở sửa căn: US11.
export const TheCan = ({
  can,
  vuaThem,
  onCham,
  onDatGia,
}: {
  can: Can;
  vuaThem?: boolean;
  onCham?: () => void;
  onDatGia?: () => void;
}) => (
  <div className={"the-can" + (vuaThem ? " the-can--moi" : "")} data-can={can.ma_can} onClick={onCham}>
    <div className="the-can__anh">
      {can.anh_dai_dien && <img className="the-can__anh-hinh" src={can.anh_dai_dien.duong_dan_xem} alt="" />}
      {can.so_anh > 0 ? <span className="the-can__so-anh">{can.so_anh} ảnh</span> : "Chưa có ảnh"}
    </div>
    <div className="the-can__than">
      <div className="the-can__dong-ten">
        {vuaThem && <span className="the-can__cham" />}
        <span className="the-can__ten">{tenThe(can.ma_can)}</span>
        <span className="the-can__mui-ten">
          <Icon ten="mui-phai" co={16} />
        </span>
      </div>
      <span className="the-can__thong-tin">{dongThongTin(can)}</span>
      {can.chua_dat_gia ? (
        <div className="the-can__gia-chua">
          <span style={{ font: "var(--text-body)", color: "var(--warning-ink)" }}>Chưa đặt giá</span>
          <button
            type="button"
            className="hh-btn hh-btn--text hh-btn--inline"
            onClick={(e) => {
              e.stopPropagation();
              onDatGia?.();
            }}
          >
            Đặt giá cho căn này
          </button>
        </div>
      ) : (
        can.gia_tuan_nay && (
          <span style={{ font: "var(--text-body)", color: "var(--ink-muted)" }}>
            Giá tuần này <b style={{ color: "var(--ink)" }}>{chuKhoangTuan(can.gia_tuan_nay)}</b>
          </span>
        )
      )}
      {can.so_anh < NEN_TOI_THIEU_ANH && <span className="the-can__goi-y">💡 Nên thêm ảnh: sale cần ít nhất 6 ảnh</span>}
      {can.moi_them && <span className="chu-phu">Mới thêm</span>}
    </div>
  </div>
);
