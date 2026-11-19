---
id: US47-KB
us: US47
rev: 1
---
# Kịch bản test tay US47 · Mức cộng giá mặc định

Dữ liệu dùng chung theo docs/product/du-lieu-mau.md: Sale Hùng (mức cộng mặc định +400.000đ), Sale Lan.
Cách ghi kết quả: đánh dấu ☑ OK hoặc ☑ NG, ngày, tên. NG thì ghi thấy gì và mở BG trỏ tới mã kịch bản (skill bao-loi). Cuối lượt test trả lời câu hỏi cải tiến và ghi CT ở work/cai-tien.md (skill test-tay). Chạy lại sau khi sửa thì thêm một dòng Kết quả mới, không xóa dòng cũ. Luật viết kịch bản: CL14.5a.

### US47-KB1 · Đổi mức cộng mặc định `[Chính]`
- **Mục đích:** sale đặt một lần mức cộng dùng cho mọi căn.
- **Làm:** Hùng vào Cá nhân, "Mức cộng giá mặc định". Chọn "+400k", xem ví dụ. Chọn "Không cộng". Chọn lại "+300k", bấm "Lưu thay đổi".
- **Mong đợi:** ví dụ 2 đêm giá chủ 2.200.000đ: với +400k ghi "Giá gửi khách 3.000.000đ", "Bạn được 800.000đ"; với Không cộng giá gửi khách bằng giá chủ. Lưu thì toast "Đã lưu mức cộng". Mở chi tiết một căn chưa có mức riêng thì giá bán theo +300k. Bộ chip giống bộ chip ở chi tiết căn.
- **Nguồn:** YC7.5-NT1, YC7.5-NT2, YC7.5-NT5
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US47-KB2 · Làm tròn lên 50.000đ `[Biên]`
- **Làm:** chọn "Tùy chọn", gõ 130 (130.000đ), bật "Làm tròn lên 50.000đ", lưu. Xem một căn giá chủ 1.100.000đ một đêm.
- **Mong đợi:** giá bán một đêm 1.250.000đ (1.230.000đ làm tròn lên), 2 đêm 2.500.000đ.
- **Nguồn:** YC7.5-NT3
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US47-KB3 · Giới hạn và quyền `[Biên]`
- **Làm:** chọn "Tùy chọn", gõ 6000. Sau đó Lan xem giá bán một căn cũng có trong nguồn của Hùng.
- **Mong đợi:** gõ quá 5.000.000đ thì nút Lưu mờ và có dòng báo giới hạn. Giá bán của Lan không đổi khi Hùng đổi mức.
- **Nguồn:** YC7.5-NT4, YC7.5-NT6
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**
