// Lời nhắn chủ nhà đang gõ ở S3-02, giữ trong bộ nhớ: rời app gọi điện, nhắn Zalo rồi quay lại vẫn còn (HV3 bước 1, 2).
// Khóa là căn và ngày. Xóa khi gửi xong (HV3 bước 5). Chưa lưu xuống Native Storage nên app bị đóng hẳn thì mất (HV3 bước 3: như CN4, chưa làm).
const loiNhan = new Map<string, string>();
const khoa = (canId: string, nhan: string | null, tra: string | null) => `${canId}|${nhan ?? ""}|${tra ?? ""}`;

export const boNhoLoiNhan = {
  lay: (canId: string, nhan: string | null, tra: string | null) => loiNhan.get(khoa(canId, nhan, tra)) ?? "",
  ghi: (canId: string, nhan: string | null, tra: string | null, chu: string) => void loiNhan.set(khoa(canId, nhan, tra), chu),
  xoa: (canId: string, nhan: string | null, tra: string | null) => void loiNhan.delete(khoa(canId, nhan, tra)),
  xoaHet: () => loiNhan.clear(),
};
