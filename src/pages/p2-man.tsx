import React from "react";
import { chuSoDienThoai } from "../components/sale-hien-thi";
import type { HoSo } from "../services/kieu";

// P2 · Thông tin cá nhân (YC1.5.3). Phần vẽ, tách khỏi p2-thong-tin-ca-nhan.tsx để test.
export const CHU_CHUA_CO_SO = "Chưa có · Zalo sẽ hỏi khi bạn kết nối lần đầu";

export const NoiDungP2 = ({ ho_so }: { ho_so: HoSo }) => (
  <>
    <div className="khoi">
      <label className="hh-field">
        <span className="hh-field__label">Họ và tên</span>
        <input className="hh-input" type="text" name="ho_ten" readOnly value={ho_so.ho_ten ?? ""} placeholder="Chưa có" />
      </label>
    </div>
    <div className="khoi">
      <label className="hh-field">
        <span className="hh-field__label">
          Số điện thoại{" "}
          {ho_so.so_dien_thoai && (
            <span className="hh-badge" data-nhan="tu-zalo">
              Từ Zalo ✓
            </span>
          )}
        </span>
        {/* Chỉ xem: readOnly và inputMode none để chạm vào không hiện bàn phím (YC1.5.3-NT1) */}
        <input
          className="hh-input"
          type="text"
          name="so_dien_thoai"
          readOnly
          inputMode="none"
          value={ho_so.so_dien_thoai ? chuSoDienThoai(ho_so.so_dien_thoai) : CHU_CHUA_CO_SO}
        />
      </label>
      <span className="chu-phu">Số lấy từ Zalo, không sửa trong app. Đổi số trong Zalo thì app tự cập nhật lần sau.</span>
    </div>
  </>
);

