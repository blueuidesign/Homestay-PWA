// Mã link mời app được mở bằng (mục "Mở app từ link mời của chủ nhà" (US6)). Giữ trong bộ nhớ.
// daXuLy: link đã đưa vào luồng thì không đọc lại từ địa chỉ trang khi quay về A1 (tránh lặp vòng).
let ma: string | null = null;
let daXuLy = false;

export const boNhoLink = {
  ma: () => ma,
  dat: (m: string) => {
    ma = m;
  },
  daXuLy: () => daXuLy,
  ghiDaXuLy: () => {
    daXuLy = true;
  },
  xoa: () => {
    ma = null;
    daXuLy = false;
  },
};
