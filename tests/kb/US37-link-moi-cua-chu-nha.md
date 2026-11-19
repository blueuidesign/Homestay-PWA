---
id: US37-KB
us: US37
rev: 1
---
# Kịch bản test tay US37 · Link mời của chủ nhà và sale thêm lịch

Dữ liệu dùng chung theo docs/product/du-lieu-mau.md: Anh Tuấn có 2 căn (Sapphire 1103, À La Carte 2208); Sale Hùng chưa kết nối Anh Tuấn. Cần hai máy: một đăng nhập Anh Tuấn, một cho sale.
Cách ghi kết quả: đánh dấu ☑ OK hoặc ☑ NG, ngày, tên. NG thì ghi thấy gì và mở BG trỏ tới mã kịch bản (skill bao-loi). Cuối lượt test trả lời câu hỏi cải tiến và ghi CT ở work/cai-tien.md (skill test-tay). Chạy lại sau khi sửa thì thêm một dòng Kết quả mới, không xóa dòng cũ. Luật viết kịch bản: CL14.5a. Rủi ro cao: chạy trên cả iPhone và Android, thử vi phạm quyền bằng tay (CL6.3).

### US37-KB1 · Chủ nhà gửi link mời `[Chính]`
- **Mục đích:** chủ nhà mời sale xem lịch chỉ bằng một link.
- **Làm:** máy Anh Tuấn, tab Sale, bấm "Chia sẻ link mời".
- **Mong đợi:** bảng chia sẻ của điện thoại mở với tin mời kèm link https của Home247 (máy không có bảng chia sẻ thì link được sao chép). Bấm lần hai vẫn cùng link.
- **Nguồn:** YC6.3 bước 1, YC6.3-NT7
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US37-KB2 · Người chưa đăng nhập mở link `[Chính]`
- **Làm:** máy sale chưa đăng nhập mở link; xem; bấm "Bắt đầu ngay", đăng nhập bằng mã email.
- **Mong đợi:** thẻ "Anh Tuấn mời bạn xem lịch 2 căn", không có giá, không có chữ "Đăng nhập". Đăng nhập xong sang thẳng "Thêm lịch" (A10), không qua màn chọn vai.
- **Nguồn:** YC6.3-NT1, YC6.3-NT2
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US37-KB3 · Sale thêm lịch `[Chính]`
- **Làm:** ở A10 bấm "Thêm lịch của Anh Tuấn".
- **Mong đợi:** sang lịch của sale, toast "Đã thêm lịch 2 căn của Anh Tuấn"; máy Anh Tuấn thấy sale ở nhóm "Đã kết nối". Mở lại link thì thấy "Bạn đã có lịch của Anh Tuấn" và nút "Xem lịch".
- **Nguồn:** YC6.3-NT4, YC6.3-NT5
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US37-KB4 · Rời A10 không bấm `[Biên]`
- **Làm:** một sale khác mở link, tới A10 thì bấm quay lại.
- **Mong đợi:** về màn trước; Anh Tuấn không thấy sale này trong danh sách.
- **Nguồn:** YC6.3-NT3
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US37-KB5 · Đổi link mời `[Biên]`
- **Làm:** máy Anh Tuấn bấm "Đổi link mời", đồng ý; máy sale mở link cũ.
- **Mong đợi:** "Link mời không còn dùng được." kèm "Nhờ chủ nhà gửi link mới."; sale đã thêm ở KB3 vẫn ở "Đã kết nối"; "Chia sẻ link mời" lần sau ra link khác.
- **Nguồn:** YC6.3-NT6, YC6.3-NT9
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US37-KB6 · Tự mở link của mình, tài khoản chủ nhà mở link `[Biên]`
- **Làm:** máy Anh Tuấn mở link mời của chính mình; một máy đăng nhập Chị Hoa (chủ nhà) mở link đó.
- **Mong đợi:** không có nút "Thêm lịch"; Anh Tuấn thấy "Đây là link mời của bạn…"; Chị Hoa thấy "Link này dành cho sale…" và nút "Về lịch của tôi".
- **Nguồn:** YC6.3-NT10
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**
