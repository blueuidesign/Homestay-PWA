---
id: US55-KB
us: US55
rev: 1
---
# Kịch bản test tay US55 · Chi tiết chủ nhà và bỏ nguồn

Dữ liệu dùng chung theo docs/product/du-lieu-mau.md: Sale Hùng (2 căn của mình: Green Bay 0812, Mường Thanh 1605; nguồn: Chị Hoa, Anh Tuấn; căn tự nhập Villa Tuần Châu của chú Bình), Sale Lan.
Cách ghi kết quả: đánh dấu ☑ OK hoặc ☑ NG, ngày, tên. NG thì ghi thấy gì và mở BG trỏ tới mã kịch bản (skill bao-loi). Cuối lượt test trả lời câu hỏi cải tiến và ghi CT ở work/cai-tien.md (skill test-tay). Chạy lại sau khi sửa thì thêm một dòng Kết quả mới, không xóa dòng cũ. Luật viết kịch bản: CL14.5a.

### US55-KB1 · Xem chi tiết chủ nhà `[Chính]`
- **Mục đích:** sale biết mình được xem gì và đã bán được bao nhiêu với chủ nhà đó.
- **Làm:** Hùng mở tab Căn, chạm tên Chị Hoa. Chị Hoa tắt "Tình trạng cọc", Hùng mở lại.
- **Mong đợi:** màn có tên, số, "kết nối từ …", nút "Gọi", danh sách quyền, các căn với giá đêm hôm nay (căn chưa đặt giá thì không có giá), số đặt phòng đã bán và tiền chênh. Tắt cọc thì không còn dòng "Tình trạng cọc".
- **Nguồn:** YC10.2-NT1, YC10.2-NT2
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US55-KB2 · Bỏ nguồn `[Chính]`
- **Làm:** Hùng có một yêu cầu chờ tới 1509. Bấm "Bỏ nguồn phòng này", rồi bấm xác nhận. Xem lịch và tìm phòng. Chị Hoa mở thông báo.
- **Mong đợi:** bấm lần đầu chỉ hiện nút xác nhận. Xác nhận thì về tab Căn, Chị Hoa không còn; lịch và tìm phòng không còn căn của Chị Hoa. Yêu cầu chờ sang "Đã hủy", Chị Hoa không có thông báo mới. Đặt phòng đã chốt với Chị Hoa vẫn ở danh sách của Hùng.
- **Nguồn:** YC10.2-NT3, YC10.2-NT4, YC10.2-NT8
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US55-KB3 · Chủ nhà đã ngừng cho xem `[Biên]`
- **Làm:** Chị Hoa ngừng cho Hùng xem lịch. Hùng mở tab Căn, rồi mở chi tiết Chị Hoa từ lịch sử trình duyệt. Bấm "Bỏ khỏi danh sách".
- **Mong đợi:** dòng Chị Hoa ghi "đã ngừng cho bạn xem lịch", không căn, không giá. Màn chi tiết ghi "Bạn không còn xem được mục này" kèm lý do. Bấm bỏ thì dòng biến ngay.
- **Nguồn:** YC10.2-NT6, YC10.2-NT7
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US55-KB4 · Quyền `[Biên]`
- **Làm:** Lan thử bỏ nguồn trên kết nối của Hùng bằng link sửa tay. Một sale chưa kết nối Chị Hoa mở chi tiết Chị Hoa.
- **Mong đợi:** Lan không làm được; sale chưa kết nối không thấy số điện thoại.
- **Nguồn:** YC10.2-NT5
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**
