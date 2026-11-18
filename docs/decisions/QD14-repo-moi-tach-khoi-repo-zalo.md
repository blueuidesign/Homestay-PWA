---
id: QD14
tieu_de: Repo mới, tách khỏi repo Zalo Mini App
trang_thai: da-chot
loai: san-pham
nguoi_chot: tung
ngay_chot: 2026-11-18
thay_cho: []
nguon: Quyet_dinh.md của bản PWA (QD14)
anh_huong: []
rev: 1
---
# QD14 · Repo mới, tách khỏi repo Zalo Mini App

## Câu hỏi
bản PWA đổi cả quy trình (bỏ khung Home247 cũ, dùng bộ khởi tạo của Kho BaBa) lẫn công nghệ (Supabase thay server Node). Repo cũ có hơn 300 file quy trình và tài liệu viết cho Zalo.

## Phương án
(A) thư mục mới trong repo cũ; (B) repo mới trên tài khoản GitHub cá nhân.

## Quyết định
B. Người chốt: Tùng ("tôi sẽ mang sang phiên chat khác và dựng repo mới trên github và supabase", 18/11/2026). Lý do: khởi đầu sạch; Vercel gói Hobby không deploy được repo riêng tư của tổ chức.

## Hệ quả
repo mới là `blueuidesign/Homestay-PWA`. Mô tả sản phẩm ở trạng thái cuối nằm trong `docs/stories/` và `docs/luat-chung/`; code React của bản Zalo đã chuyển vào `src/`. Repo cũ giữ nguyên, không cần đọc.

Thay cho: không. Trạng thái gốc: Đang hiệu lực.

## Lịch sử sửa đổi
| Rev | Ngày | Người | Commit hoặc PR | Thay đổi | Mục bị đổi |
|---|---|---|---|---|---|
| r1 | 2026-11-18 | Claude | QD21-lam-lai-tai-lieu | Tách từ `docs/decisions/`, đổi mã QD14 thành QD14 | Cả file |
