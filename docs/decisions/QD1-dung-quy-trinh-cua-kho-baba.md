---
id: QD1
tieu_de: Dùng quy trình của Kho BaBa, thêm phần riêng của Home247
trang_thai: da-thay
loai: san-pham
nguoi_chot: tung
ngay_chot: 2026-11-18
thay_cho: []
nguon: Quyet_dinh.md của bản PWA (QD1)
anh_huong: []
rev: 1
---
# QD1 · Dùng quy trình của Kho BaBa, thêm phần riêng của Home247

## Câu hỏi
khung quy trình của bản Zalo quá nặng so với sức hai người. Tùng muốn làm nhanh, test liên tục, ít tài liệu và review lúc đầu.

## Phương án
(không ghi)

## Quyết định
bộ khởi tạo và `QUY_TRINH.md` của Kho BaBa, cộng mục 15: E2E bằng Playwright là bắt buộc từ ngày đầu; staging từ ngày đầu; người merge, Claude không tự merge; Claude không đọc dữ liệu production; mỗi luật quyền có một phép thử làm hỏng trong `scripts/thu-lam-hong.sh`. Người chốt: Tùng chọn dùng quy trình này (18/11/2026); các điểm của mục 15 là Claude đề xuất, chờ Tùng chốt.

## Hệ quả
toàn bộ repo.

Thay cho: quy trình cũ của bản Zalo. Trạng thái gốc: Bị thay bởi QD15. Các điểm còn giữ: E2E Playwright và staging từ ngày đầu, Claude không đọc dữ liệu production, mỗi luật quyền có một phép thử làm hỏng (nay ở `docs/QUY_TRINH.md`).

## Lịch sử sửa đổi
| Rev | Ngày | Người | Commit hoặc PR | Thay đổi | Mục bị đổi |
|---|---|---|---|---|---|
| r1 | 2026-11-18 | Claude | QD21-lam-lai-tai-lieu | Tách từ `docs/decisions/`, đổi mã QD1 thành QD1 | Cả file |
