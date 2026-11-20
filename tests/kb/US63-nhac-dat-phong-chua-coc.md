---
id: US63-KB
us: US63
rev: 1
---
# Kịch bản test tay US63 · Nhắc đặt phòng chưa cọc

Dữ liệu dùng chung theo docs/product/du-lieu-mau.md: Chị Hoa (chủ nhà), Sale Lan (kết nối với Chị Hoa, căn 1509).
Việc nhắc chạy mỗi ngày lúc 08:00 giờ Việt Nam (pg_cron). Trên staging chưa chắc có pg_cron: nếu không có, nhờ Đức/Claude chạy tay `select public.fn_nhac_chua_coc()` rồi mới kiểm.
Cách ghi kết quả: đánh dấu ☑ OK hoặc ☑ NG, ngày, tên. NG thì ghi thấy gì và mở BG trỏ tới mã kịch bản (skill bao-loi). Cuối lượt test trả lời câu hỏi cải tiến và ghi CT ở work/cai-tien.md (skill test-tay). Luật viết kịch bản: CL14.5a.

### US63-KB1 · Đặt phòng chưa cọc còn 3 ngày thì chủ nhà được nhắc `[Chính]`
- **Mục đích:** chủ nhà không quên đòi cọc.
- **Chuẩn bị:** Chị Hoa ghi một đặt phòng cho Sale Lan ở 1509, nhận phòng sau 3 ngày, để "Chưa cọc".
- **Làm:** chạy việc nhắc (hoặc chờ 08:00). Chị Hoa vào Cá nhân > "Thông báo". Chạy việc nhắc thêm lần nữa.
- **Mong đợi:** có đúng một dòng "Đặt phòng chưa cọc" với "Sale Lan · <ngày nhận> → <ngày trả> · nhận phòng sau 3 ngày"; chạm dòng mở chi tiết đặt phòng. Chạy lần hai không có thêm dòng.
- **Nguồn:** YC12.3-NT1
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US63-KB2 · Đã cọc hay đã tắt thì không nhắc `[Chính]`
- **Mục đích:** không nhắc thừa.
- **Chuẩn bị:** hai đặt phòng chưa cọc còn 3 ngày. Đặt phòng thứ nhất Chị Hoa đánh dấu đã cọc. Chị Hoa vào Cá nhân > "Cài đặt thông báo", tắt "Đặt phòng chưa cọc" rồi lưu; sau đó có đặt phòng thứ ba chưa cọc còn 3 ngày.
- **Làm:** chạy việc nhắc, Chị Hoa xem Thông báo.
- **Mong đợi:** không có dòng nhắc nào cho ba đặt phòng đó.
- **Nguồn:** YC12.3-NT2
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US63-KB3 · Sale không thấy nhắc chưa cọc `[Biên]`
- **Mục đích:** chỉ chủ nhà nhận nhắc.
- **Chuẩn bị:** như KB1.
- **Làm:** Sale Lan vào Cá nhân > "Thông báo".
- **Mong đợi:** không có dòng "Đặt phòng chưa cọc".
- **Nguồn:** YC12.3-NT3
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**
