---
id: QD29
tieu_de: Báo lỗi app bằng bảng riêng trong database, tóm tắt mỗi sáng vào thông báo của quản trị
trang_thai: da-chot
loai: ky-thuat
nguoi_chot: claude
ngay_chot: 2026-11-21
han_chot:
thay_cho: []
nguon: "QD25 (Claude tự quyết), YC15.3 dòng Cách báo lỗi: chọn khi làm, ghi vào docs/decisions, 21/11/2026"
anh_huong: [YC15.3, EN7, supabase/migrations/20261121020000_en7_loi_app.sql, src/chung/baoLoi.ts]
rev: 1
---
# QD29 · Báo lỗi app bằng bảng riêng trong database, tóm tắt mỗi sáng vào thông báo của quản trị

## Câu hỏi
YC15.3-NT1 cần Tùng biết lỗi không lường trước ở máy người dùng trong ngày, và bản ghi lỗi không có tên, số điện thoại khách. Dùng công cụ nào để gom lỗi?

## Phương án
| Phương án | Được gì | Mất gì |
|---|---|---|
| Sentry gói miễn phí | Gom lỗi, nhóm lỗi, gửi email sẵn | Thêm thư viện (~70 KB, app phải nhẹ), thêm tài khoản và khóa cho Tùng tạo, dữ liệu ra ngoài nhà cung cấp thứ ba, chính sách quyền riêng tư phải kể thêm |
| Bảng `loi_app` trong Supabase, app gửi qua `fn_ghi_loi` | Không thêm thư viện, không tốn tiền, không khóa mới; làm sạch số điện thoại, email ở database trước khi lưu | Không nhóm lỗi thông minh; ai đọc phải là quản trị |
| Chỉ xem log của Vercel | Không làm gì | Lỗi xảy ra ở máy người dùng, Vercel không thấy |

## Quyết định
Chọn bảng `loi_app` (Claude tự quyết, QD25, 21/11/2026). App bắt lỗi không ai bắt (`error`, `unhandledrejection`), làm sạch ở máy rồi gửi `fn_ghi_loi`; database làm sạch lần nữa, bỏ phần sau dấu `?` của đường dẫn, giới hạn 30 lỗi mỗi giờ mỗi người, xóa bản ghi quá 30 ngày. Mỗi sáng 8 giờ (giờ Việt Nam) `fn_bao_loi_hang_ngay` ghi một thông báo trong app cho tài khoản quản trị nếu hôm trước có lỗi (bản 1 chỉ có thông báo trong app). Người chưa đăng nhập không gửi được lỗi. Khi cần nhóm lỗi tốt hơn thì Tùng xét Sentry sau.

## Lịch sử sửa đổi
| Rev | Ngày | Người | Commit hoặc PR | Thay đổi | Mục bị đổi |
|---|---|---|---|---|---|
| r1 | 2026-11-21 | Claude | EN7 | Tạo, Claude tự quyết theo QD25 | Cả file |
