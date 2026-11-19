---
id: US42-KB
us: US42
rev: 1
---
# Kịch bản test tay US42 · Toast báo kết nối cho sale

Dữ liệu dùng chung theo docs/product/du-lieu-mau.md: Sale Lan có link xin lịch (US38); ba chủ nhà Chị Hoa (căn 1509, 3402 ở ICON40), Anh Tuấn, Chú Bình chưa kết nối với Lan. Cần hai điện thoại hoặc hai trình duyệt.
Cách ghi kết quả: đánh dấu ☑ OK hoặc ☑ NG, ngày, tên. NG thì ghi thấy gì và mở BG trỏ tới mã kịch bản (skill bao-loi). Cuối lượt test trả lời câu hỏi cải tiến và ghi CT ở work/cai-tien.md (skill test-tay). Chạy lại sau khi sửa thì thêm một dòng Kết quả mới, không xóa dòng cũ. Luật viết kịch bản: CL14.5a.

### US42-KB1 · Một chủ nhà đồng ý `[Chính]`
- **Mục đích:** sale biết ngay khi chủ nhà cho xem lịch, không phải tải lại.
- **Chuẩn bị:** Lan mở app và để yên ở màn chính.
- **Làm:** Chị Hoa mở link xin lịch của Lan và bấm "Đồng ý cho xem lịch". Chờ, không chạm vào máy Lan.
- **Mong đợi:** trong 60 giây máy Lan hiện toast "Chị Hoa đã đồng ý cho bạn xem lịch" và dòng "ICON40 1509, 3402 đã vào Nguồn phòng", có nút "Xem". Toast tự tắt sau vài giây.
- **Nguồn:** YC6.8-NT1
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US42-KB2 · Ba chủ nhà đồng ý gần nhau `[Chính]`
- **Làm:** trong vòng vài phút, Anh Tuấn và Chú Bình cũng đồng ý (dùng tài khoản khác, Lan chưa mở thông báo).
- **Mong đợi:** Lan thấy một toast "3 chủ nhà đã đồng ý cho bạn xem lịch" kèm tên ba người và tổng số căn mới, không phải ba toast rời.
- **Nguồn:** YC6.8-NT2
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US42-KB3 · Toast không hiện lại `[Biên]`
- **Làm:** sau khi đã thấy toast, đóng app rồi mở lại.
- **Mong đợi:** toast cũ không hiện lại.
- **Nguồn:** YC6.8-NT4
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US42-KB4 · Bấm Xem `[Biên]`
- **Làm:** khi toast đang hiện, bấm "Xem".
- **Mong đợi:** toast tắt, về lịch của sale (Nguồn phòng làm sau).
- **Nguồn:** YC6.8 r11
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**
