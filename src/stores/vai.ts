// Vai của người đang dùng máy này, để thanh tab đúng bộ (chủ nhà 5 tab, sale 4 tab không có "Sale", "Tìm phòng").
// Giữ trong bộ nhớ, ghi lúc mở app (POST /phien) và lúc tạo tài khoản. Vai chỉ chọn giao diện, không quyết quyền (mục "Chọn vai trò" (US1)).
import type { VaiChon } from "../services/kieu";

let vai: VaiChon | null = null;

export const datVai = (v: VaiChon | null) => {
  vai = v;
};
export const layVai = () => vai;
