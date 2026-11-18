import React from "react";
import { CHU_NHAN_CUA_TOI, dongPhuCanSale, tenCanSale } from "../components/can-sale-hien-thi";
import { chuGiaNgan } from "../components/gia-hien-thi";
import { Icon } from "../components/icon";
import type { CanChiTiet, OLichSale } from "../services/kieu";
import { chuThu, soCuaNgay } from "../services/ngay";

// Phần vẽ của S6-07 (mục "Danh sách căn và nguồn phòng" (US16) bước 9). Không gọi server. Màn: s6-can-cua-toi.tsx.
export const chuOLich = (o: OLichSale) => (o.trang_thai === "kin" ? "Kín" : o.gia_chu === null || o.gia_chu === undefined ? "—" : chuGiaNgan(o.gia_chu));

export const VIEC = [
  { ma: "dat_phong", ten: "Đặt phòng", phu: "Khách đã chốt cho căn này" },
  { ma: "sua", ten: "Sửa căn và giá", phu: "Ảnh, thông tin, giá theo tháng" },
  { ma: "gui_khach", ten: "Gửi cho khách", phu: "Ảnh, thông tin và giá bán" },
] as const;

export const NoiDungS6CanCuaToi = ({
  can,
  o,
  hom,
  onViec,
}: {
  can: CanChiTiet;
  o: OLichSale[] | null;
  hom: string;
  onViec: (ma: (typeof VIEC)[number]["ma"]) => void;
}) => (
  <>
    <div className="the-can" style={{ cursor: "default" }} data-can={can.ma_can}>
      <div className="the-can__anh">
        {can.anh[0] && <img className="the-can__anh-hinh" src={can.anh[0].duong_dan_xem} alt="" />}
        {can.anh.length === 0 && "Chưa có ảnh"}
      </div>
      <div className="the-can__than">
        <div className="the-can__dong-ten">
          <span className="the-can__ten">{tenCanSale(can)}</span>
          <span className="hh-badge">{CHU_NHAN_CUA_TOI}</span>
        </div>
        <span className="the-can__thong-tin">{dongPhuCanSale(can)}</span>
        <span className="chu-phu">Bạn tự ghi lịch và giá cho căn này, như chủ nhà.</span>
      </div>
    </div>

    {o && (
      <div className="khoi" data-khoi="lich-7-ngay">
        <span className="nhan-muc">7 ngày tới · giá đêm của bạn</span>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: 4 }}>
          {o.map((x) => (
            <div
              key={x.ngay}
              className={"s1-o" + (x.trang_thai === "kin" ? " s1-o--kin" : "") + (x.ngay === hom ? " s1-o--nay" : "")}
              data-trang-thai={x.trang_thai}
              style={{ flexDirection: "column", minHeight: 56, borderLeft: 0, borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)", gap: 0 }}
            >
              <span style={{ fontSize: 12, lineHeight: "16px", fontWeight: 400, color: "var(--ink-muted)" }}>{x.ngay === hom ? "Nay" : chuThu(x.ngay)}</span>
              <span style={{ fontSize: 12, lineHeight: "16px", fontWeight: 600 }}>{String(soCuaNgay(x.ngay)).padStart(2, "0")}</span>
              <span style={{ fontSize: 12, lineHeight: "16px", fontWeight: 600 }}>{chuOLich(x)}</span>
            </div>
          ))}
        </div>
      </div>
    )}

    <div className="khoi" style={{ padding: "0 16px", gap: 0 }} data-khoi="viec">
      {VIEC.map((v) => (
        <button key={v.ma} type="button" className="dong-sale" data-viec={v.ma} onClick={() => onViec(v.ma)}>
          <div style={{ flex: "1 1 0%", minWidth: 0, display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ font: "var(--text-body-strong)", color: "var(--ink)" }}>{v.ten}</span>
            <span style={{ font: "var(--text-body)", color: "var(--ink-muted)" }}>{v.phu}</span>
          </div>
          <Icon ten="mui-phai" co={16} />
        </button>
      ))}
    </div>
  </>
);
