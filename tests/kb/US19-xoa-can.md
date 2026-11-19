---
id: US19-KB
us: US19
rev: 1
---
# Kịch bản test tay US19 · Xóa căn

Dữ liệu dùng chung theo docs/product/du-lieu-mau.md: Chị Hoa giữ 1509, 3402 (3402 còn B2 17/10 → 19/10) và có thể thêm căn 2105 không có đặt phòng; Sale Lan được chia sẻ các căn này. Thử trên máy thật thì dùng ngày thật và đặt phòng tạo quanh ngày đó.
Cách ghi kết quả: đánh dấu ☑ OK hoặc ☑ NG, ngày, tên. NG thì ghi thấy gì và mở BG trỏ tới mã kịch bản (skill bao-loi). Cuối lượt test trả lời câu hỏi cải tiến và ghi CT ở work/cai-tien.md (skill test-tay). Chạy lại sau khi sửa thì thêm một dòng Kết quả mới, không xóa dòng cũ. Luật viết kịch bản: CL14.5a. Rủi ro cao: chạy trên cả iPhone và Android.

### US19-KB1 · Xóa căn không còn đặt phòng `[Chính]`
- **Mục đích:** chủ nhà bỏ căn không cho thuê nữa mà không mất số liệu cũ.
- **Chuẩn bị:** đăng nhập Chị Hoa, thêm căn 2105, không ghi đặt phòng nào.
- **Làm:** tab Căn, chạm thẻ 2105, kéo xuống cuối tab "Thông tin", bấm "Xóa phòng", rồi "Xóa".
- **Mong đợi:** hộp hỏi "Xóa phòng 2105?"; xóa xong về tab Căn, toast "Đã xóa phòng 2105", thẻ 2105 không còn; lịch tháng không còn 2105; form đặt phòng không còn chip 2105.
- **Nguồn:** YC3.6-NT5, YC3.6-NT12
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US19-KB2 · Căn còn đặt phòng sắp tới `[Chính]`
- **Làm:** mở sửa 3402 (còn B2 sắp tới), bấm "Xóa phòng", rồi "Xóa".
- **Mong đợi:** toast đỏ "Căn còn đặt phòng sắp tới", 3402 vẫn ở tab Căn.
- **Nguồn:** YC3.6-NT1
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US19-KB3 · Bấm "Không" ở hộp hỏi lại `[Biên]`
- **Làm:** mở sửa 1509, bấm "Xóa phòng", rồi "Không".
- **Mong đợi:** hộp đóng, vẫn ở màn sửa 1509, 1509 còn nguyên.
- **Nguồn:** YC3.6-NT12
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US19-KB4 · Thêm lại căn cùng mã `[Biên]`
- **Làm:** sau KB1, thêm căn mới mã "2105".
- **Mong đợi:** thêm được, không báo trùng.
- **Nguồn:** YC3.6-NT8
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US19-KB5 · Doanh thu giữ nguyên sau khi xóa `[Biên]`
- **Làm:** ghi lại doanh thu một tháng có đặt phòng của một căn, rồi xóa căn đó khi đặt phòng đã qua; xem lại doanh thu tháng đó.
- **Mong đợi:** số doanh thu không đổi.
- **Nguồn:** YC3.6-NT6
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US19-KB6 · Sale không còn thấy căn đã xóa `[Biên]`
- **Chuẩn bị:** máy thứ hai đăng nhập Sale Lan.
- **Làm:** sau KB1, Sale Lan mở danh sách căn được chia sẻ.
- **Mong đợi:** không còn 2105; đặt phòng cũ của Sale Lan với căn đã xóa (nếu có) vẫn ở danh sách của Sale Lan.
- **Nguồn:** YC3.6-NT7
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**
