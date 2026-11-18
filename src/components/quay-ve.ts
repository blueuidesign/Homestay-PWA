// Quay về đúng màn đã mở chức năng sửa hay xóa đặt phòng (US10, Tùng quyết 04/11/2026): mở từ màn nào thì về màn đó.
// Ngăn xếp: màn mở -> CN3-02 -> CN4-02. Xóa ở CN3-02 lùi một bước; lưu sửa ở CN4-02 lùi hai bước.
export const BUOC_SAU_XOA = -1;
export const BUOC_SAU_LUU_SUA = -2;

export const quayVeNoiMo = (dieuHuong: (soBuoc: number) => void, soBuoc: number) => dieuHuong(soBuoc);
