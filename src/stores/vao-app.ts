// Lúc người dùng bấm "Bắt đầu ngay" ở A1: là lúc đồng ý điều khoản, gửi kèm POST /tai-khoan (server.md 2.1).
// Chỉ giữ trong bộ nhớ, mất thì người dùng bấm lại ở A1.
let dongYLuc: string | null = null;

export const ghiDongYDieuKhoan = (luc: Date = new Date()) => {
  dongYLuc = luc.toISOString();
};

export const layDongYDieuKhoan = () => dongYLuc;
