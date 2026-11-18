import React from "react";
import { CHIP_PHONG_NGU } from "../components/can-hien-thi";
import { dongBaoAnh, KhoiAnh } from "../components/khoi-anh";
import { KhoiMoRong, type PropsMoRong } from "../components/khoi-mo-rong";
import { LoiApi, LoiMang, type SoPhongNgu } from "../services/kieu";
import { demTheo, type AnhForm } from "../stores/anh-form";
import { dongConThieu, type LoiForm } from "./cn5-a1-them-can";

// CN5-02 · Sửa thông tin căn, tab "Thông tin" (YC3.3). Phần vẽ, không gọi server, để test render. Phần tải và lưu ở cn5-02-sua-can.tsx; tab "Giá" ở cn6-gia.tsx.

export const CHU_CHUA_LUU = "Chưa lưu được, bấm lại khi có mạng";
export const chuToastLuuCan = (ma: string) => `Đã lưu phòng ${ma}`; // chữ tạm: canvas chưa vẽ kết quả lưu

// Lỗi từ PATCH /can/:id thành lỗi dưới từng ô (YC3.3-NT3, HV2 bước 3)
export const loiSuaCan = (e: unknown, ma: string): LoiForm => {
  if (e instanceof LoiApi && e.loi === "MA_CAN_TRUNG") return { ma_can: `Đã có căn ${ma.trim()}` };
  if (e instanceof LoiApi && e.loi === "DU_LIEU_SAI" && e.o === "ma_can") return { ma_can: "Nhập mã căn" };
  if (e instanceof LoiApi && e.loi === "DU_LIEU_SAI" && e.o === "so_giuong") return { so_giuong: "Số giường từ 1 đến 50" };
  if (e instanceof LoiApi && e.loi === "DU_LIEU_SAI" && e.o === "anh_ids") return { anh: "Tối đa 12 ảnh. Bỏ bớt ảnh rồi lưu." };
  if (e instanceof LoiApi && e.loi === "KHONG_TIM_THAY") return { chung: "Không còn căn này" };
  if (e instanceof LoiMang || !(e instanceof LoiApi)) return { chung: CHU_CHUA_LUU };
  return { chung: "Có lỗi, chưa làm được. Bấm lại" };
};

export type PropsCN5_02 = {
  ma: string;
  phongNgu: SoPhongNgu;
  loi: LoiForm;
  dangLuu: boolean;
  anh: AnhForm[];
  coTheQuyen: boolean;
  cheDoDoi: boolean;
  moRong: PropsMoRong;
  onMa: (v: string) => void;
  onPhongNgu: (v: SoPhongNgu) => void;
  onLuu: () => void;
  onThemAnh: () => void;
  onThuLai: (khoa: string) => void;
  onXoaAnh: (khoa: string) => void;
  onMoCaiDat: () => void;
  onBatDoi: () => void;
  onDoiViTri: (khoa: string, huong: -1 | 1) => void;
};

export const NoiDungCN5_02 = (p: PropsCN5_02) => {
  const conThieu = dongConThieu(p.ma, p.phongNgu);
  return (
    <>
      <div className="noi-dung" style={{ paddingBottom: 140 }}>
        {p.loi.chung && (
          <div className="hh-banner hh-banner--danger" role="alert">
            <span>⚠️ {p.loi.chung}</span>
          </div>
        )}
        <div className="khoi">
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ font: "var(--text-body-strong)", color: "var(--ink-secondary)" }}>
              Mã căn (tên căn hộ) <span style={{ color: "var(--danger)", fontWeight: 700 }}>*</span>
            </span>
            <label className="hh-field">
              <input className="hh-input" type="text" name="ma_can" value={p.ma} onChange={(e) => p.onMa(e.target.value)} />
            </label>
            {p.loi.ma_can && <span className="chu-loi">⚠️ {p.loi.ma_can}</span>}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ font: "var(--text-body-strong)", color: "var(--ink-secondary)" }}>
              Số phòng ngủ <span style={{ color: "var(--danger)", fontWeight: 700 }}>*</span>
            </span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {CHIP_PHONG_NGU.map((c) => (
                <button
                  key={c.gia_tri}
                  type="button"
                  className={"hh-chip hh-chip--sale" + (p.phongNgu === c.gia_tri ? " hh-chip--on" : "")}
                  aria-pressed={p.phongNgu === c.gia_tri}
                  onClick={() => p.onPhongNgu(c.gia_tri)}
                >
                  {c.chu}
                </button>
              ))}
            </div>
          </div>
        </div>
        <KhoiAnh
          anh={p.anh}
          loiAnh={p.loi.anh}
          coTheQuyen={p.coTheQuyen}
          onThemAnh={p.onThemAnh}
          onThuLai={p.onThuLai}
          onXoa={p.onXoaAnh}
          onMoCaiDat={p.onMoCaiDat}
          cheDoDoi={p.cheDoDoi}
          onBatDoi={p.onBatDoi}
          onDoiViTri={p.onDoiViTri}
        />
        <KhoiMoRong {...p.moRong} coThuGon={false} />
      </div>
      <div className="thanh-duoi">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {dongBaoAnh(p.anh) && (
            <span className="chu-phu" role="status" style={{ textAlign: "center" }}>
              {dongBaoAnh(p.anh)}
            </span>
          )}
          {conThieu && (
            <span className="chu-phu" style={{ textAlign: "center" }}>
              {conThieu}
            </span>
          )}
          <button
            type="button"
            className="hh-btn hh-btn--primary hh-btn--block"
            disabled={!!conThieu || p.dangLuu || demTheo(p.anh, "dang_tai") > 0}
            onClick={p.onLuu}
          >
            {p.dangLuu ? "Đang lưu…" : "Lưu thay đổi"}
          </button>
        </div>
      </div>
    </>
  );
};

