import React from "react";
import { CHU_TIEN, chuKetNoiTu, chuSoDienThoai } from "../components/sale-hien-thi";
import type { ChiTietKetNoi } from "../services/kieu";
import { chuNgayNgan, chuTien, thangCua } from "../services/ngay";

// CN7-04 · Chi tiết một sale (mục "Chủ nhà quản lý danh sách sale" (US5) bước 5, 6; US5-NT13). Phần vẽ, tách khỏi cn7-chi-tiet-sale.tsx để test.
// Canvas chưa có khối quyền (CH-053) nên không có công tắc quyền. Số liệu canvas ("8", "14.2tr") chưa theo DLM, chờ Tùng:
// ở đây tính từ danh sách đặt phòng của sale có ngày nhận trong tháng này.

export const chuHopNgung = (ten: string) => `Xác nhận ngừng cho ${ten} xem? Đặt phòng cũ vẫn giữ. Sale không thấy lịch của bạn nữa.`;

export const soThang = (ct: ChiTietKetNoi, hom: string) => {
  const ds = ct.dat_phong.filter((d) => thangCua(d.ngay_nhan) === thangCua(hom));
  return { so: ds.length, tien: ds.reduce((t, d) => t + d.tien_phong, 0) };
};

export const HopXacNhanNgung = ({
  ten,
  dangLam,
  loi,
  onXacNhan,
  onHuy,
}: {
  ten: string;
  dangLam: boolean;
  loi: string | null;
  onXacNhan: () => void;
  onHuy: () => void;
}) => (
  <div className="hh-scrim" role="alertdialog" aria-modal="true" aria-label="Ngừng cho xem lịch">
    <div className="hh-sheet">
      <div className="hh-sheet__body" style={{ paddingTop: 24 }}>
        <span style={{ font: "var(--text-input)", color: "var(--ink)" }}>{chuHopNgung(ten)}</span>
        {loi && (
          <span className="chu-loi" role="alert">
            {loi}
          </span>
        )}
        <button type="button" className="hh-btn hh-btn--danger hh-btn--block" disabled={dangLam} onClick={onXacNhan}>
          {dangLam ? "Đang lưu…" : "Ngừng cho xem"}
        </button>
        <button type="button" className="hh-btn hh-btn--secondary hh-btn--block" disabled={dangLam} onClick={onHuy}>
          Giữ nguyên
        </button>
      </div>
    </div>
  </div>
);

export const NoiDungCN704 = ({
  ct,
  hom,
  onGoi,
  onNgung,
}: {
  ct: ChiTietKetNoi;
  hom: string;
  onGoi: () => void;
  onNgung: () => void;
}) => {
  const t = soThang(ct, hom);
  const so = ct.so_dien_thoai ? chuSoDienThoai(ct.so_dien_thoai) : null;
  const kn = chuKetNoiTu(ct.ket_noi_luc);
  const thang = hom.slice(5, 7).replace(/^0/, "");
  return (
    <>
      <div className="khoi">
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ flex: "1 1 0%", minWidth: 0, display: "flex", flexDirection: "column" }}>
            <span style={{ font: "var(--text-stat-md)", color: "var(--ink)" }}>{ct.ten_hien_thi}</span>
            <span className="chu-phu">{[so ?? "Chưa có số điện thoại", kn].filter(Boolean).join(" · ")}</span>
          </span>
          {so && (
            <button type="button" className="hh-btn hh-btn--secondary hh-btn--pill" onClick={onGoi}>
              Gọi
            </button>
          )}
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div className="hh-stat">
          <div className="hh-stat__label">Đặt phòng tháng {thang}</div>
          <div className="hh-stat__value">{t.so}</div>
        </div>
        <div className="hh-stat">
          <div className="hh-stat__label">Tiền phòng tháng {thang}</div>
          <div className="hh-stat__value">{chuTien(t.tien)}đ</div>
        </div>
      </div>
      <div className="khoi" style={{ gap: 4 }}>
        <span className="nhan-muc">Đặt phòng của sale này</span>
        {ct.dat_phong.length === 0 && <span className="chu-phu">Chưa có đặt phòng</span>}
        {ct.dat_phong.map((d) => (
          <div key={d.id} className="gia-dong" data-dat-phong={d.id}>
            <span style={{ font: "var(--text-body)", color: "var(--ink-body)" }}>
              {d.ma_can} · {chuNgayNgan(d.ngay_nhan)} → {chuNgayNgan(d.ngay_tra)} · {CHU_TIEN[d.trang_thai_tien]}
            </span>
            <span style={{ font: "var(--text-body-strong)", color: "var(--ink)", whiteSpace: "nowrap" }}>{chuTien(d.tien_phong)}đ</span>
          </div>
        ))}
      </div>
      <button type="button" className="hh-btn hh-btn--secondary hh-btn--block" style={{ color: "var(--danger)" }} onClick={onNgung}>
        Ngừng cho xem lịch
      </button>
    </>
  );
};

