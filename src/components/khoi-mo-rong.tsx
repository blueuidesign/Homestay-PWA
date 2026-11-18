import React from "react";
import type { ToaNha } from "../services/kieu";
import { CHIP_LOAI_VIEW, maLoaiView } from "./can-hien-thi";
import { Icon } from "./icon";

// Phần mở rộng của form căn (US11): CN5-A1 phần mở rộng, CN5-A1b (tìm tòa), CN5-02 (sửa căn).
// Chữ theo mục "Tòa nhà, loại view, số giường, mô tả" (US11) bước 1, 2 và glossary. Chữ ≥ 14 px, vùng bấm ≥ 44 px.
export const CHU_MO_RONG = "Thêm tòa nhà, mô tả gửi khách, view...";
export const CHU_GHI_CHU_MO_RONG = "Không bắt buộc. Chỉ cần mã căn và số phòng ngủ là dùng được lịch.";
export const CHU_TOA_KHAC = "+ Tòa khác";
export const CHU_GHI_CHU_TIM_TOA = "Chọn tòa có sẵn để sale lọc đúng tòa. Không thấy thì thêm tòa mới.";
export const CHU_GHI_CHU_MO_TA = "Sale dùng đoạn này khi gửi thông tin căn cho khách.";
export const CHU_LOI_SO_GIUONG = "Số giường từ 1 đến 50";
export const chuThemToaMoi = (chu: string) => `+ Thêm tòa mới ${chu.trim()}`;
// Chữ tạm (canvas chưa vẽ): gợi ý khi tên gõ trùng tòa đã có (US11, Tùng quyết 04/11/2026)
export const chuTrungToa = (ten: string) => `Đã có tòa ${ten}. Chọn tòa này, hoặc vẫn thêm tòa mới nếu là tòa khác.`;

// Tên gõ trùng tòa đã có, không phân biệt hoa thường, dấu, khoảng trắng thừa
const gonTen = (s: string) =>
  s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "d").toLowerCase().trim().replace(/\s+/g, " ");
export const timToaTrungTen = (ds: ToaNha[] | null, chu: string): ToaNha | undefined =>
  ds === null || chu.trim() === "" ? undefined : ds.find((t) => gonTen(t.ten) === gonTen(chu));

// Ô "Số giường" (không bắt buộc, không vào dòng "Còn thiếu"): trống là chưa nhập (US11-NT6, US11-NT11)
export const docSoGiuong = (chu: string): { gia_tri: number | null; loi?: string } => {
  const c = chu.trim();
  if (c === "") return { gia_tri: null };
  const n = Number(c);
  return /^\d+$/.test(c) && n >= 1 && n <= 50 ? { gia_tri: n } : { gia_tri: null, loi: CHU_LOI_SO_GIUONG };
};

export type FormMoRong = {
  toa: ToaNha | null;
  view: string | null; // mã chip: bien, thanh_pho, nui
  soGiuong: string;
  moTa: string;
};
export const formMoRongTrong = (): FormMoRong => ({ toa: null, view: null, soGiuong: "", moTa: "" });

export type PropsMoRong = {
  form: FormMoRong;
  dsToa: ToaNha[]; // hàng chip: GET /toa-nha không q
  moTim: boolean;
  chuTim: string;
  ketQuaTim: ToaNha[] | null; // null là đang tìm
  loiSoGiuong?: string;
  loiToa?: string;
  coThuGon: boolean;
  anMoTa?: boolean; // S6-02 (căn tự nhập) không có "Mô tả gửi khách"
  onThuGon: () => void;
  onChonToa: (t: ToaNha | null) => void;
  onMoTim: (mo: boolean) => void;
  onChuTim: (chu: string) => void;
  onThemToaMoi: () => void;
  onView: (ma: string | null) => void;
  onSoGiuong: (chu: string) => void;
  onMoTa: (chu: string) => void;
};

const Nhan = ({ children }: { children: React.ReactNode }) => (
  <span style={{ font: "var(--text-body-strong)", color: "var(--ink-secondary)" }}>{children}</span>
);

export const KhoiMoRong = (p: PropsMoRong) => {
  const { form } = p;
  // Tòa đã chọn từ ô tìm mà chưa có trong hàng chip thì vẫn hiện chip để thấy đang chọn
  const chip = form.toa && !p.dsToa.some((t) => t.id === form.toa!.id) ? [...p.dsToa, form.toa] : p.dsToa;
  const maView = maLoaiView(form.view);
  const trung = p.moTim ? timToaTrungTen(p.ketQuaTim, p.chuTim) : undefined;
  return (
    <div className="khoi">
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <Nhan>Tòa nhà</Nhan>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {chip.map((t) => {
            const on = form.toa?.id === t.id;
            return (
              <button
                key={t.id}
                type="button"
                className={"hh-chip hh-chip--sale" + (on ? " hh-chip--on" : "")}
                aria-pressed={on}
                onClick={() => p.onChonToa(on ? null : t)}
              >
                {t.ten}
              </button>
            );
          })}
          <button
            type="button"
            className={"hh-chip hh-chip--sale" + (p.moTim ? " hh-chip--on" : "")}
            aria-pressed={p.moTim}
            onClick={() => p.onMoTim(!p.moTim)}
          >
            {CHU_TOA_KHAC}
          </button>
        </div>
        {p.loiToa && <span className="chu-loi">⚠️ {p.loiToa}</span>}
      </div>

      {p.moTim && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }} data-man="CN5-A1b">
          <label className="hh-field">
            <span className="hh-field__label">Tên tòa nhà</span>
            <input
              className="hh-input"
              type="text"
              name="ten_toa_nha"
              placeholder="VD: Green Bay"
              value={p.chuTim}
              maxLength={50}
              onChange={(e) => p.onChuTim(e.target.value)}
            />
          </label>
          <span className="chu-phu">{CHU_GHI_CHU_TIM_TOA}</span>
          {trung && (
            <span className="chu-phu" data-goi-y-trung role="status">
              {chuTrungToa(trung.ten)}
            </span>
          )}
          {p.ketQuaTim === null ? (
            <span className="chu-phu">Đang tìm…</span>
          ) : (
            p.ketQuaTim.map((t) => (
              <button
                key={t.id}
                type="button"
                className="hh-btn hh-btn--secondary hh-btn--block"
                style={{ justifyContent: "space-between", minHeight: 44 }}
                onClick={() => p.onChonToa(t)}
              >
                <span>{t.ten}</span>
                {t.khu_vuc && <span className="chu-phu">{t.khu_vuc}</span>}
              </button>
            ))
          )}
          {p.chuTim.trim() !== "" && (
            <button type="button" className="hh-btn hh-btn--text hh-btn--inline" style={{ justifyContent: "flex-start", minHeight: 44 }} onClick={p.onThemToaMoi}>
              {chuThemToaMoi(p.chuTim)}
            </button>
          )}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <Nhan>Loại view</Nhan>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {CHIP_LOAI_VIEW.map((v) => {
            const on = maView === v.ma;
            return (
              <button
                key={v.ma}
                type="button"
                className={"hh-chip hh-chip--sale" + (on ? " hh-chip--on" : "")}
                aria-pressed={on}
                onClick={() => p.onView(on ? null : v.ma)}
              >
                {v.chu}
              </button>
            );
          })}
        </div>
      </div>

      <label className="hh-field">
        <span className="hh-field__label">Số giường</span>
        <input
          className="hh-input"
          type="text"
          inputMode="numeric"
          name="so_giuong"
          placeholder="VD: 3"
          value={form.soGiuong}
          onChange={(e) => p.onSoGiuong(e.target.value.replace(/\D/g, "").slice(0, 3))}
        />
        {p.loiSoGiuong && <span className="chu-loi">⚠️ {p.loiSoGiuong}</span>}
      </label>

      {!p.anMoTa && (
        <label className="hh-field">
          <span className="hh-field__label">Mô tả gửi khách</span>
          <textarea
            className="hh-input"
            name="mo_ta_gui_khach"
            rows={4}
            maxLength={2000}
            value={form.moTa}
            onChange={(e) => p.onMoTa(e.target.value)}
          />
          <span className="chu-phu">{CHU_GHI_CHU_MO_TA}</span>
        </label>
      )}

      {p.coThuGon && (
        <button type="button" className="hh-btn hh-btn--text hh-btn--inline" style={{ justifyContent: "flex-start", minHeight: 44 }} onClick={p.onThuGon}>
          Thu gọn
        </button>
      )}
    </div>
  );
};

// Nút mở phần mở rộng (thu gọn mặc định, mục "Tòa nhà, loại view, số giường, mô tả" (US11) trạng thái rỗng)
export const NutMoRong = ({ onMo }: { onMo: () => void }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 2, padding: "0 4px" }}>
    <button type="button" className="hh-btn hh-btn--text hh-btn--inline" style={{ justifyContent: "flex-start" }} onClick={onMo}>
      <Icon ten="cong" co={16} />
      {CHU_MO_RONG}
    </button>
    <span className="chu-phu">{CHU_GHI_CHU_MO_RONG}</span>
  </div>
);
