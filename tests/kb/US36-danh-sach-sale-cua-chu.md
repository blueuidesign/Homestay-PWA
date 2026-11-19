---
id: US36-KB
us: US36
rev: 1
---
# Kịch bản test tay US36 · Danh sách sale của chủ nhà

Dữ liệu dùng chung theo docs/product/du-lieu-mau.md: Chị Hoa đã kết nối Sale Hùng, Lan, Nga, Minh; Sale Hùng có B1, B3 với Chị Hoa. Thử trên máy thật thì cần các tài khoản sale đã nhận link mời của chủ nhà.
Cách ghi kết quả: đánh dấu ☑ OK hoặc ☑ NG, ngày, tên. NG thì ghi thấy gì và mở BG trỏ tới mã kịch bản (skill bao-loi). Cuối lượt test trả lời câu hỏi cải tiến và ghi CT ở work/cai-tien.md (skill test-tay). Chạy lại sau khi sửa thì thêm một dòng Kết quả mới, không xóa dòng cũ. Luật viết kịch bản: CL14.5a. Rủi ro cao: chạy trên cả iPhone và Android, thử vi phạm quyền bằng tay (CL6.3).

### US36-KB1 · Xem danh sách sale `[Chính]`
- **Mục đích:** chủ nhà biết ai đang xem lịch của mình và mỗi sale mang về bao nhiêu.
- **Chuẩn bị:** đăng nhập Chị Hoa.
- **Làm:** mở tab Sale.
- **Mong đợi:** nút "Chia sẻ link mời", "Sao chép link"; nhóm "Đã kết nối · 4" có Hùng, Lan, Nga, Minh, mỗi dòng có tổng tiền phòng.
- **Nguồn:** YC6.2-NT1
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US36-KB2 · Thêm sale tay `[Chính]`
- **Làm:** bấm "Thêm sale", nhập "Sale Phương", số "090 123", bấm "Lưu sale"; sửa số thành 0901234567, lưu lại.
- **Mong đợi:** lần đầu báo "Số điện thoại chưa đúng (10 chữ số, bắt đầu bằng 0)"; lần sau dòng "Sale Phương" ở nhóm "Chưa kết nối".
- **Nguồn:** YC6.2-NT3
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US36-KB3 · Xem một sale và ngừng cho xem `[Chính]`
- **Làm:** chạm Sale Hùng; xem chi tiết; bấm "Ngừng cho xem lịch", đồng ý.
- **Mong đợi:** chi tiết có tên, số, ngày kết nối, nút "Gọi", đặt phòng B1, B3, công tắc "Tình trạng cọc". Hỏi "Xác nhận ngừng cho Sale Hùng xem? …"; đồng ý thì Hùng sang nhóm "Đã ngừng". Trên máy Sale Hùng: không còn thấy lịch Chị Hoa, vẫn thấy B1, B3, có thông báo bị ngừng.
- **Nguồn:** YC6.2-NT4, YC6.2-NT9
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US36-KB4 · Tắt "Tình trạng cọc" `[Biên]`
- **Làm:** chạm Sale Lan, tắt "Tình trạng cọc".
- **Mong đợi:** trên máy Sale Lan: đặt phòng của mình không còn ghi đã cọc hay chưa; lịch và giá từng đêm vẫn thấy.
- **Nguồn:** YC6.2-NT5
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US36-KB5 · Xóa sale thêm tay `[Biên]`
- **Làm:** chạm "Sale Phương", bấm "Xóa sale này", đồng ý.
- **Mong đợi:** dòng biến mất khỏi nhóm "Chưa kết nối".
- **Nguồn:** YC6.2-NT8
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US36-KB6 · Chưa có sale nào `[Biên]`
- **Chuẩn bị:** tài khoản chủ nhà mới, chưa mời sale nào.
- **Làm:** mở tab Sale.
- **Mong đợi:** "Chưa có sale nào xem lịch", hai nút gửi link, khung "Sale sẽ thấy: …".
- **Nguồn:** YC6.2-NT2
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US36-KB7 · Sale đã xóa tài khoản `[Biên]`
- **Chuẩn bị:** một sale đã kết nối xóa tài khoản (khi có chức năng xóa tài khoản).
- **Làm:** mở tab Sale.
- **Mong đợi:** dòng giữ tên cũ kèm chữ đỏ "Đã xoá tài khoản", không số, không mở được; đặt phòng của sale đó vẫn ở lịch.
- **Nguồn:** YC6.2-NT7
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**
