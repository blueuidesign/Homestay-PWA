---
id: US46-KB
us: US46
rev: 1
---
# Kịch bản test tay US46 · Chi tiết căn của chủ nhà và giá bán

Dữ liệu dùng chung theo docs/product/du-lieu-mau.md: Sale Hùng (mức cộng mặc định +400.000đ) kết nối Chị Hoa "tất cả căn"; 1509 có giá chủ 1.100.000đ mỗi đêm ở 10/10 → 12/10. Sale Lan cũng xem được 1509.
Cách ghi kết quả: đánh dấu ☑ OK hoặc ☑ NG, ngày, tên. NG thì ghi thấy gì và mở BG trỏ tới mã kịch bản (skill bao-loi). Cuối lượt test trả lời câu hỏi cải tiến và ghi CT ở work/cai-tien.md (skill test-tay). Chạy lại sau khi sửa thì thêm một dòng Kết quả mới, không xóa dòng cũ. Luật viết kịch bản: CL14.5a.

### US46-KB1 · Xem chi tiết và đổi mức cộng `[Chính]`
- **Mục đích:** sale biết giá chủ, tự chọn giá bán cho khách.
- **Làm:** Hùng tìm 10/10 → 12/10, chạm 1509. Chọn chip "+200k", rồi chip "Mặc định".
- **Mong đợi:** ảnh "1/N", "ICON40 1509 · 2PN", dòng phòng ngủ, giường, view (không có số khách, không có tiện ích), "Chị Hoa · Chủ nhà", nút "Gọi" nếu chủ có số. "Giá chủ nhà 2.200.000đ". Chọn "+200k" thì giá bán thành 2.600.000đ; chọn "Mặc định" thì về 3.000.000đ. Lịch 2 tuần tô ngày khách hỏi. Giờ nhận, trả phòng.
- **Nguồn:** YC7.4-NT1, YC7.4-NT2, YC7.4-NT4, YC7.4-NT7
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US46-KB2 · Gửi yêu cầu đặt phòng `[Chính]`
- **Làm:** ở chi tiết 1509, bấm "Gửi yêu cầu đặt phòng".
- **Mong đợi:** mở màn gửi yêu cầu với đúng 1509 và 10/10 → 12/10 (bản này có thể là màn tạm).
- **Nguồn:** YC7.4-NT3
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US46-KB3 · Mức cộng là của riêng sale `[Biên]`
- **Làm:** Lan đặt "+100k" cho 1509. Hùng mở lại 1509. Chị Hoa xem căn 1509 của mình.
- **Mong đợi:** giá bán của Hùng không đổi. Chị Hoa không thấy mức cộng hay giá bán nào.
- **Nguồn:** YC7.4-NT5, YC7.4-NT2
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US46-KB4 · Mất quyền xem `[Biên]`
- **Làm:** đang mở chi tiết 1509 thì Chị Hoa ngừng Hùng. Hùng kéo lại hay mở lại.
- **Mong đợi:** "Bạn không còn xem được mục này" với lý do, không còn giá, lịch, ảnh.
- **Nguồn:** YC7.4-NT6, HV5-NT1
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**
