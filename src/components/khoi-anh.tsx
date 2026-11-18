import React from "react";
import { MAX_ANH_CAN } from "../services/api";
import { chuDangTai, demTheo, type AnhForm } from "../stores/anh-form";
import { Icon } from "./icon";

// Mục Ảnh của CN5-A1 (mục "Ảnh khi thêm căn" (US1), canvas CN5-A2 đang tải, CN5-A3 lỗi). Chữ ≥ 14 px, nút ≥ 44 px.
export const CHU_THE_QUYEN = "Cần quyền chọn ảnh để thêm ảnh căn"; // HV4, bảng câu theo quyền
export const CHU_CAN_VAN_LUU = "Căn vẫn lưu được khi chưa có ảnh.";
export const CHU_ANH_DAU = "Ảnh đầu tiên là ảnh đại diện · Tối đa 12 ảnh";

// US1 · CN5-02: "Đổi thứ tự" chuyển lưới sang chế độ đổi thứ tự. Mỗi ảnh có số thứ tự và hai nút đưa lên trước, ra sau.
// Chữ tạm: canvas chưa vẽ cách đổi (kéo thả hay nút). Bản này dùng nút vì dùng một tay.
export const CHU_DOI_THU_TU = "Đổi thứ tự";
export const CHU_XONG_DOI = "Xong";
export const CHU_HUONG_DAN_DOI = "Bấm ‹ để đưa ảnh lên trước, › để đưa ra sau. Ảnh số 1 là ảnh đại diện.";

const O = ({
  a,
  dau,
  so,
  cuoi,
  cheDoDoi,
  onThuLai,
  onXoa,
  onDoiViTri,
}: {
  a: AnhForm;
  dau: boolean;
  so: number;
  cuoi: boolean;
  cheDoDoi?: boolean;
  onThuLai: (k: string) => void;
  onXoa: (k: string) => void;
  onDoiViTri?: (k: string, huong: -1 | 1) => void;
}) => (
  <div className={"o-anh o-anh--" + a.trang_thai} data-trang-thai={a.trang_thai}>
    <img className="o-anh__hinh" src={a.tep.duong_dan} alt="" />
    {dau && <span className="o-anh__nhan">Ảnh đại diện</span>}
    <button type="button" className="o-anh__xoa" aria-label="Xóa ảnh" onClick={() => onXoa(a.khoa)}>
      <span className="o-anh__xoa-nen">✕</span>
    </button>
    {cheDoDoi && (
      <div className="o-anh__phu" style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <button
          type="button"
          className="hh-iconbtn"
          aria-label="Đưa ảnh lên trước"
          disabled={dau}
          onClick={() => onDoiViTri?.(a.khoa, -1)}
          style={{ opacity: dau ? 0.4 : 1 }}
        >
          ‹
        </button>
        <span className="o-anh__nhan" style={{ position: "static" }}>
          Ảnh số {so}
        </span>
        <button
          type="button"
          className="hh-iconbtn"
          aria-label="Đưa ảnh ra sau"
          disabled={cuoi}
          onClick={() => onDoiViTri?.(a.khoa, 1)}
          style={{ opacity: cuoi ? 0.4 : 1 }}
        >
          ›
        </button>
      </div>
    )}
    {a.trang_thai === "dang_tai" && (
      <div className="o-anh__phu">
        <span className="o-anh__chu">Đang tải {a.tien_do}%</span>
        <div className="o-anh__thanh">
          <div className="o-anh__thanh-day" style={{ width: `${a.tien_do}%` }} />
        </div>
      </div>
    )}
    {a.trang_thai === "loi" && (
      <div className="o-anh__phu o-anh__phu--loi">
        <span className="o-anh__chu o-anh__chu--loi">⚠️ Tải lỗi</span>
        <button type="button" className="hh-btn hh-btn--secondary hh-btn--inline" onClick={() => onThuLai(a.khoa)}>
          Thử lại
        </button>
      </div>
    )}
  </div>
);

export const KhoiAnh = ({
  anh,
  loiAnh,
  coTheQuyen,
  onThemAnh,
  onThuLai,
  onXoa,
  onMoCaiDat,
  cheDoDoi,
  onBatDoi,
  onDoiViTri,
}: {
  anh: AnhForm[];
  loiAnh?: string;
  coTheQuyen: boolean;
  onThemAnh: () => void;
  onThuLai: (khoa: string) => void;
  onXoa: (khoa: string) => void;
  onMoCaiDat: () => void;
  // US1 · CN5-02: có onBatDoi thì mục ảnh có nút "Đổi thứ tự" (cần từ 2 ảnh)
  cheDoDoi?: boolean;
  onBatDoi?: () => void;
  onDoiViTri?: (khoa: string, huong: -1 | 1) => void;
}) => {
  const dangTai = demTheo(anh, "dang_tai");
  const loi = demTheo(anh, "loi");
  const day = anh.length >= MAX_ANH_CAN;
  return (
    <div className="khoi">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, minHeight: 32 }}>
        <span className="nhan-muc">Ảnh{anh.length ? ` (${anh.length})` : ""}</span>
        {dangTai > 0 ? (
          <span className="chu-phu">Đang tải {dangTai} ảnh…</span>
        ) : loi > 0 ? (
          <span className="chu-loi">{loi} ảnh tải lỗi</span>
        ) : onBatDoi && anh.length >= 2 ? (
          <button type="button" className="hh-btn hh-btn--text hh-btn--inline" onClick={onBatDoi}>
            {cheDoDoi ? CHU_XONG_DOI : CHU_DOI_THU_TU}
          </button>
        ) : (
          !anh.length && <span className="chu-phu">Bạn có thể thêm sau</span>
        )}
      </div>
      {cheDoDoi && anh.length >= 2 && <span className="chu-phu">{CHU_HUONG_DAN_DOI}</span>}
      {anh.length > 0 && (
        <div className="luoi-anh">
          {anh.map((a, i) => (
            <O
              key={a.khoa}
              a={a}
              dau={i === 0}
              so={i + 1}
              cuoi={i === anh.length - 1}
              cheDoDoi={cheDoDoi}
              onThuLai={onThuLai}
              onXoa={onXoa}
              onDoiViTri={onDoiViTri}
            />
          ))}
        </div>
      )}
      {coTheQuyen && (
        <div className="khoi" role="status" style={{ background: "var(--warning-tint)", borderColor: "var(--warning-border)" }}>
          <span style={{ font: "var(--text-body-strong)", color: "var(--warning-ink)" }}>{CHU_THE_QUYEN}</span>
          <span className="chu-phu">{CHU_CAN_VAN_LUU}</span>
          <button type="button" className="hh-btn hh-btn--secondary hh-btn--inline" onClick={onMoCaiDat}>
            Mở cài đặt quyền
          </button>
        </div>
      )}
      <button type="button" className="o-them-anh" disabled={day} onClick={onThemAnh}>
        <Icon ten="cong" co={16} />
        <span style={{ font: "var(--text-body-strong)", color: "var(--ink)" }}>Thêm ảnh</span>
        {!anh.length && <span className="chu-phu">· chọn nhiều ảnh cùng lúc</span>}
      </button>
      {anh.length > 0 && <span className="chu-phu">{CHU_ANH_DAU}</span>}
      {loiAnh && <span className="chu-loi">⚠️ {loiAnh}</span>}
    </div>
  );
};

// Hai dòng báo trên nút "Thêm căn" khi còn ảnh đang tải (US1-NT20)
export const dongBaoAnh = (anh: AnhForm[]) => {
  const n = demTheo(anh, "dang_tai");
  return n > 0 ? chuDangTai(n) : null;
};
