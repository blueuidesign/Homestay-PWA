---
id: QD4
tieu_de: Supabase đầy đủ, không giữ server Node
trang_thai: cho-chot
loai: san-pham
nguoi_chot: tung
ngay_chot:
thay_cho: []
nguon: Quyet_dinh.md của bản PWA (QD4)
anh_huong: []
rev: 1
---
# QD4 · Supabase đầy đủ, không giữ server Node

## Câu hỏi
bản Zalo có server Node khoảng 26.700 dòng. Bản PWA muốn ít hạ tầng, test tự động dễ.

## Phương án
(A) giữ server Node, Supabase chỉ làm database và đăng nhập; (B) app gọi thẳng Supabase, quyền bằng RLS, ghi qua hàm `fn_*`, đọc dữ liệu nhạy cảm qua view.

## Quyết định
B. Người chốt: chưa. Claude chọn để dựng khung khi Tùng không trả lời câu hỏi này (18/11/2026). Rủi ro chính của B: lỡ cho app đọc thẳng bảng có cột nhạy cảm. Cách phòng: bất biến trong CLAUDE.md, test RLS cho từng vai, `scripts/thu-lam-hong.sh`.

## Hệ quả
`supabase/migrations/`, `tests/db/`. Việc cần giữ bí mật (gửi SMS, đổi token Zalo sau này) đặt ở Edge Function.

Thay cho: không. Trạng thái gốc: Đề xuất, chờ Tùng chốt.

## Lịch sử sửa đổi
| Rev | Ngày | Người | Commit hoặc PR | Thay đổi | Mục bị đổi |
|---|---|---|---|---|---|
| r1 | 2026-11-18 | Claude | QD21-lam-lai-tai-lieu | Tách từ `docs/decisions/`, đổi mã QD4 thành QD4 | Cả file |
