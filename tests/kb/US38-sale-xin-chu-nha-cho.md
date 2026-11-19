---
id: US38-KB
us: US38
rev: 1
---
# Kịch bản test tay US38 · Sale xin chủ nhà cho xem lịch

Dữ liệu dùng chung theo docs/product/du-lieu-mau.md: một tài khoản sale mới (vai sale, chưa kết nối chủ nhà nào). Cần điện thoại có Zalo hoặc ứng dụng nhắn tin để thử bảng chia sẻ.
Cách ghi kết quả: đánh dấu ☑ OK hoặc ☑ NG, ngày, tên. NG thì ghi thấy gì và mở BG trỏ tới mã kịch bản (skill bao-loi). Cuối lượt test trả lời câu hỏi cải tiến và ghi CT ở work/cai-tien.md (skill test-tay). Chạy lại sau khi sửa thì thêm một dòng Kết quả mới, không xóa dòng cũ. Luật viết kịch bản: CL14.5a.

### US38-KB1 · Soạn tin xin lịch `[Chính]`
- **Mục đích:** sale mới xin chủ nhà cho xem lịch mà không phải tự soạn tin.
- **Chuẩn bị:** đăng nhập sale mới.
- **Làm:** ở màn đầu (chưa có nguồn phòng) bấm "Gửi tin nhắn xin lịch đến chủ nhà".
- **Mong đợi:** màn "Xin chủ nhà cho xem lịch" có tin soạn sẵn ghi tên mình và một link https của Home247; ba bước "Sau khi gửi".
- **Nguồn:** YC6.4-NT1
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US38-KB2 · Chia sẻ và sao chép `[Chính]`
- **Làm:** bấm "Chia sẻ", chọn một cuộc trò chuyện, gửi; quay về app; bấm "Sao chép tin nhắn".
- **Mong đợi:** bảng chia sẻ của điện thoại mở với tin và link; sao chép thì toast "Đã sao chép". Màn chờ ghi "Đang chờ chủ nhà đồng ý", số lần đã chia sẻ tăng theo mỗi lần, "0 chủ nhà đã đồng ý", không có danh sách tên chủ nhà.
- **Nguồn:** YC6.4-NT2, YC6.4-NT3
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US38-KB3 · Link không lộ số điện thoại `[Biên]`
- **Làm:** xem link trong tin soạn sẵn.
- **Mong đợi:** link không chứa chuỗi số nào trong số điện thoại của sale.
- **Nguồn:** YC6.4-NT5
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US38-KB4 · Gửi cho chủ nhà khác `[Biên]`
- **Làm:** ở màn chờ bấm "Gửi link cho chủ nhà khác".
- **Mong đợi:** mở lại màn soạn tin với cùng link.
- **Nguồn:** YC6.4 bước 5
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**
