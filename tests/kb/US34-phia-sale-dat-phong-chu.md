---
id: US34-KB
us: US34
rev: 1
---
# Kịch bản test tay US34 · Phía sale: đặt phòng chủ nhà ghi giúp

Dữ liệu dùng chung theo docs/product/du-lieu-mau.md (DLM.6): Chị Hoa ghi 1509 cho Sale Hùng như YC5.4-NT1 (tiền phòng 1.800.000đ, giá bán điền sẵn 2.200.000đ). Sale Lan cũng kết nối với Chị Hoa.
Cách ghi kết quả: đánh dấu ☑ OK hoặc ☑ NG, ngày, tên. NG thì ghi thấy gì và mở BG trỏ tới mã kịch bản (skill bao-loi). Cuối lượt test trả lời câu hỏi cải tiến và ghi CT ở work/cai-tien.md (skill test-tay). Chạy lại sau khi sửa thì thêm một dòng Kết quả mới, không xóa dòng cũ. Luật viết kịch bản: CL14.5a.

### US34-KB1 · Xem và sửa giá bán `[Chính]`
- **Mục đích:** sale biết đặt phòng chủ ghi giúp mình bán giá bao nhiêu, lời bao nhiêu, và tự chỉnh giá bán.
- **Làm:** đăng nhập Hùng, Thống kê, "Xem tất cả đặt phòng và yêu cầu", chạm dòng 1509 "Chị Hoa đã ghi giúp bạn". Bấm "Sửa giá bán", gõ 2400000, bấm "Lưu giá bán".
- **Mong đợi:** thấy căn, Chị Hoa và ngày ở, giá bán 2.200.000đ, giá chủ 1.800.000đ, chênh 400.000đ, tình trạng cọc nếu Chị Hoa bật cho xem; không có số tiền cọc, không có tên khách Chị Hoa nhập. Sau khi lưu: "Đã lưu giá bán", giá bán 2.400.000đ, chênh 600.000đ. Đăng nhập Chị Hoa mở đặt phòng đó vẫn chỉ thấy 1.800.000đ.
- **Nguồn:** YC5.9-NT1
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US34-KB2 · Chặn sửa sai người, giá sai `[Biên]`
- **Làm:** xóa trống giá bán rồi lưu. Gõ giá thấp hơn giá chủ rồi lưu. Đăng nhập Lan, thử mở đường dẫn chi tiết đặt phòng của Hùng (nếu lấy được). Tắt mạng rồi mở chi tiết.
- **Mong đợi:** giá trống bị chặn. Giá thấp hơn giá chủ lưu được, chênh hiện số âm (Claude tự chốt YC5-H10). Lan thấy "Không tìm thấy đặt phòng". Mất mạng có báo và nút thử lại.
- **Nguồn:** YC5.9-NT2, HV2-NT1, HV5
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**
