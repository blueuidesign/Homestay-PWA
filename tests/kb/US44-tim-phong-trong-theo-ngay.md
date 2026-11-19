---
id: US44-KB
us: US44
rev: 1
---
# Kịch bản test tay US44 · Tìm phòng trống theo ngày

Dữ liệu dùng chung theo docs/product/du-lieu-mau.md: Sale Hùng (có căn của mình, nguồn phòng của Chị Hoa và Anh Tuấn), Sale Lan (chỉ được chia sẻ một số căn).
Cách ghi kết quả: đánh dấu ☑ OK hoặc ☑ NG, ngày, tên. NG thì ghi thấy gì và mở BG trỏ tới mã kịch bản (skill bao-loi). Cuối lượt test trả lời câu hỏi cải tiến và ghi CT ở work/cai-tien.md (skill test-tay). Chạy lại sau khi sửa thì thêm một dòng Kết quả mới, không xóa dòng cũ. Luật viết kịch bản: CL14.5a.

### US44-KB1 · Chọn ngày và số đêm `[Chính]`
- **Mục đích:** sale đặt điều kiện tìm nhanh bằng một tay.
- **Chuẩn bị:** đăng nhập Sale Hùng, ở tab Lịch.
- **Làm:** chạm ô "Tìm phòng trống theo ngày". Xem nút đáy. Chọn ngày nhận, rồi chip "2".
- **Mong đợi:** chưa chọn ngày thì nút mờ, ghi "Chọn ngày nhận để tìm phòng". Ngày trước hôm nay không chọn được. Chọn ngày nhận và 2 đêm thì ngày trả là 2 ngày sau, nút sáng. Lọc "Loại view" có đúng "Biển", "Thành phố", "Núi".
- **Nguồn:** YC7.2-NT1, YC7.2-NT2, YC7.2-NT7
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US44-KB2 · Không có căn trống `[Chính]`
- **Làm:** chọn khoảng ngày mà mọi căn đều đã kín (nhờ Chị Hoa ghi đặt phòng trước nếu cần), bấm "Tìm phòng trống".
- **Mong đợi:** màn "Không có căn trống" ghi điều kiện đã lọc, có ít nhất một gợi ý kèm số căn trống, nút "Sửa tìm kiếm", ghi chú về căn tự nhập. Chạm một gợi ý thì tìm lại theo gợi ý đó.
- **Nguồn:** YC7.2-NT3
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US44-KB3 · Tìm gần đây `[Chính]`
- **Làm:** tìm 6 lần với điều kiện khác nhau, có hai lần trùng hệt nhau. Mở lại màn tìm, chạm dòng đầu.
- **Mong đợi:** "Tìm gần đây" có 5 dòng, không có dòng trùng, lần mới nhất ở đầu. Chạm một dòng thì điều kiện được điền sẵn.
- **Nguồn:** YC7.2-NT4, YC7.2-NT5, YC7.2-NT8
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US44-KB4 · Sale khác không thấy căn ngoài quyền `[Biên]`
- **Làm:** đăng nhập Sale Lan, tìm cùng khoảng ngày Hùng vừa tìm.
- **Mong đợi:** không có căn của chính Hùng, không có căn Lan không được chia sẻ; "Tìm gần đây" của Lan không có lần tìm của Hùng.
- **Nguồn:** YC7.2-NT5, YC7.2-NT6
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**
