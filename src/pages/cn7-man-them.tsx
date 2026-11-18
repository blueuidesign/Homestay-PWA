import React from "react";

// CN7-05 · Thêm sale thủ công (YC1.9 bước 4, YC1.9-NT1). Phần vẽ, tách khỏi cn7-them-sale.tsx để test.
export const CHU_LOI_THIEU_TEN = "Nhập tên sale trước khi lưu";
export const CHU_LOI_THIEU_SO = "Nhập số điện thoại 10 số, bắt đầu bằng 0";

// Số điện thoại hợp lệ: 10 chữ số bắt đầu bằng 0, sau khi bỏ khoảng trắng, chấm, gạch (api/ket-noi-link.md POST /ket-noi)
export const soHopLe = (so: string) => /^0\d{9}$/.test(so.replace(/[\s.\-]/g, ""));

export const NoiDungCN705 = ({
  ten,
  so,
  daBam,
  dangLuu,
  loi,
  onDoiTen,
  onDoiSo,
  onLuu,
}: {
  ten: string;
  so: string;
  daBam: boolean;
  dangLuu: boolean;
  loi: string | null;
  onDoiTen: (v: string) => void;
  onDoiSo: (v: string) => void;
  onLuu: () => void;
}) => {
  const thieuTen = daBam && ten.trim() === "";
  const thieuSo = daBam && !soHopLe(so);
  return (
    <>
      <div className="noi-dung">
        {loi && (
          <div className="hh-banner hh-banner--danger" role="alert">
            <span>⚠️ {loi}</span>
          </div>
        )}
        <div className="khoi">
          <label className="hh-field">
            <span className="hh-field__label">
              Tên sale <span style={{ color: "var(--danger)", fontWeight: 700 }}>*</span>
            </span>
            <input
              className="hh-input"
              type="text"
              name="ten_sale"
              maxLength={100}
              aria-invalid={thieuTen}
              value={ten}
              onChange={(e) => onDoiTen(e.target.value)}
            />
          </label>
          {thieuTen && <span className="chu-loi">⚠️ {CHU_LOI_THIEU_TEN}</span>}
          <label className="hh-field">
            <span className="hh-field__label">
              Số điện thoại <span style={{ color: "var(--danger)", fontWeight: 700 }}>*</span>
            </span>
            <input
              className="hh-input"
              type="tel"
              inputMode="tel"
              name="so_dien_thoai"
              aria-invalid={thieuSo}
              value={so}
              onChange={(e) => onDoiSo(e.target.value)}
            />
          </label>
          {thieuSo && <span className="chu-loi">⚠️ {CHU_LOI_THIEU_SO}</span>}
          <span className="chu-phu">
            Sale nằm ở nhóm Chưa kết nối cho tới khi mở link mời. Bạn vẫn gửi lịch cho sale qua số điện thoại này được.
          </span>
        </div>
      </div>
      <div className="thanh-duoi">
        <button type="button" className="hh-btn hh-btn--primary hh-btn--block" disabled={dangLuu} onClick={onLuu}>
          {dangLuu ? "Đang lưu…" : "Lưu sale"}
        </button>
      </div>
    </>
  );
};

