---
id: US54-KB
us: US54
rev: 1
---
# Kịch bản test tay US54 · Tab Căn của sale

Dữ liệu dùng chung theo docs/product/du-lieu-mau.md: Sale Hùng (2 căn của mình: Green Bay 0812, Mường Thanh 1605; nguồn: Chị Hoa, Anh Tuấn; căn tự nhập Villa Tuần Châu của chú Bình), Sale Lan.
Cách ghi kết quả: đánh dấu ☑ OK hoặc ☑ NG, ngày, tên. NG thì ghi thấy gì và mở BG trỏ tới mã kịch bản (skill bao-loi). Cuối lượt test trả lời câu hỏi cải tiến và ghi CT ở work/cai-tien.md (skill test-tay). Chạy lại sau khi sửa thì thêm một dòng Kết quả mới, không xóa dòng cũ. Luật viết kịch bản: CL14.5a.

### US54-KB1 · Xem tab Căn `[Chính]`
- **Mục đích:** sale thấy hết căn mình bán được ở một chỗ.
- **Làm:** Hùng mở tab Căn. Chạm ICON40 1509 dưới Chị Hoa, quay lại. Chạm Green Bay 0812, quay lại. Chạm Villa Tuần Châu.
- **Mong đợi:** ba nhóm đếm 2, 2 và 1. Dòng chủ nhà có "✓ Cập nhật … trước". Dòng căn ghi "2PN · 3 giường", không có số khách. Căn tự nhập ghi "chưa dùng app", không có "Trống hôm nay". 1509 mở chi tiết căn của chủ nhà; Green Bay 0812 mở màn có ba việc Đặt phòng, Sửa căn và giá, Gửi cho khách.
- **Nguồn:** YC10.1-NT1, YC10.1-NT2, YC10.1-NT3, YC10.1-NT4, YC10.1-NT5
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US54-KB2 · Mời chủ nhà, tab trống `[Chính]`
- **Làm:** bấm "Chia sẻ lời mời". Đăng nhập một sale mới chưa có căn, mở tab Căn.
- **Mong đợi:** bảng chia sẻ của điện thoại mở, app không tự gửi. Sale mới thấy "Chưa có căn nào" và ba nút.
- **Nguồn:** YC10.1-NT9, YC10.1-NT10
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US54-KB3 · Chủ nhà đã xóa tài khoản `[Biên]`
- **Làm:** Chị Hoa xóa tài khoản. Hùng mở tab Căn, bấm "Bỏ khỏi danh sách" ở dòng Chị Hoa. Sau đó Chị Hoa đăng ký lại với cùng số.
- **Mong đợi:** nhóm chủ nhà đếm 1; dòng Chị Hoa có nhãn "đã xóa tài khoản", không căn, không giá, không số. Bấm bỏ thì dòng biến ngay, không hỏi lại; đặt phòng cũ với Chị Hoa vẫn ở danh sách đặt phòng của Hùng. Chị Hoa đăng ký lại thì không trở lại nguồn phòng của Hùng.
- **Nguồn:** YC10.1-NT7, YC10.1-NT8, YC10.1-NT11
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US54-KB4 · Quyền `[Biên]`
- **Làm:** Lan thử mở Green Bay 0812 của Hùng bằng link sửa tay. Hùng thử sửa lịch 1509 của Chị Hoa bằng link sửa tay.
- **Mong đợi:** cả hai không được, không lộ dữ liệu.
- **Nguồn:** YC10.1-NT4, YC10.1-NT6
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**
