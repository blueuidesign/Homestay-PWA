---
id: US31-KB
us: US31
rev: 1
---
# Kịch bản test tay US31 · Sửa đặt phòng

Dữ liệu dùng chung theo docs/product/du-lieu-mau.md: Chị Hoa có B1 (1509, Sale Hùng, 10/10 → 12/10, 2.200.000đ, cọc 1.000.000đ, giá bán của Hùng 2.600.000đ) và B5 (1509, 13/10 → 15/10). Sale Hùng chỉ được xem 1509. Hai máy (hay hai trình duyệt) đăng nhập Chị Hoa cho KB4.
Cách ghi kết quả: đánh dấu ☑ OK hoặc ☑ NG, ngày, tên. NG thì ghi thấy gì và mở BG trỏ tới mã kịch bản (skill bao-loi). Cuối lượt test trả lời câu hỏi cải tiến và ghi CT ở work/cai-tien.md (skill test-tay). Chạy lại sau khi sửa thì thêm một dòng Kết quả mới, không xóa dòng cũ. Luật viết kịch bản: CL14.5a.

### US31-KB1 · Sửa ngày, quay về đúng chỗ `[Chính]`
- **Mục đích:** chủ nhà dời ngày khách mà không phải xóa ghi lại, sale được báo.
- **Chuẩn bị:** đăng nhập Chị Hoa, tab Lịch, Tháng 10/2026.
- **Làm:**
  1. Chạm ô 10/10, chạm dòng 1509, bấm "Sửa".
  2. Đổi ngày nhận thành 11/10, giữ 2 đêm, bấm "Lưu thay đổi".
  3. Đăng nhập Sale Hùng, mở Thông báo.
- **Mong đợi:**
  - Bước 1: "Sửa đặt phòng · Sale Hùng", mọi ô điền sẵn (1509, 10/10 → 12/10, 2.200.000đ, đã cọc 1.000.000đ); ô người đặt khóa.
  - Bước 2: toast "Đã lưu đặt phòng", app về chi tiết ngày đã mở trước đó, không về đầu tab Lịch.
  - Bước 3: Hùng có thông báo chủ sửa đặt phòng, ghi ngày cũ và ngày mới.
- **Nguồn:** YC5.6-NT1, YC5.6-NT5, YC5.6-NT7, YC5.6-NT11
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US31-KB2 · Sửa trùng đêm bị chặn `[Chính]`
- **Mục đích:** sửa cũng không bao giờ làm hai khách trùng một đêm.
- **Chuẩn bị:** như KB1, mở sửa B5.
- **Làm:** đổi ngày nhận B5 thành 11/10, ngày trả 15/10.
- **Mong đợi:** dòng kiểm đỏ báo trùng với B1, nút "Lưu thay đổi" không bấm được.
- **Nguồn:** YC5.6-NT2, QT1.2-VD2
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US31-KB3 · Đổi tiền phòng, giá bán của sale giữ nguyên `[Biên]`
- **Mục đích:** chủ nhà giảm giá mà không làm đổi số sale đã báo khách.
- **Làm:** sửa B1, tiền phòng 1.800.000đ, lưu. Đăng nhập Hùng, mở B1 và Thông báo.
- **Mong đợi:** giá bán của Hùng vẫn 2.600.000đ; thông báo ghi tiền phòng mới 1.800.000đ.
- **Nguồn:** YC5.6-NT6
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US31-KB4 · Sửa cùng lúc trên hai máy `[Biên]`
- **Mục đích:** không ghi đè bản người khác vừa lưu.
- **Làm:** hai máy cùng mở sửa B1. Máy 1 đổi ghi chú, lưu. Máy 2 đổi tiền, lưu.
- **Mong đợi:** máy 2 ở lại form, toast "Đặt phòng vừa được sửa ở máy khác. Mở lại để xem bản mới."
- **Nguồn:** YC5.6 bước 29
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US31-KB5 · Đổi sang căn sale không được xem `[Biên]`
- **Mục đích:** sale luôn thấy đặt phòng mình đứng tên.
- **Làm:** sửa B1, đổi căn sang 3402, lưu.
- **Mong đợi:** toast đỏ "Sale này không được xem căn này", B1 không đổi.
- **Nguồn:** YC5.6-NT9
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US31-KB6 · Sửa ghi chú không báo sale `[Biên]`
- **Làm:** sửa B1, chỉ đổi ghi chú, lưu. Đăng nhập Hùng, mở Thông báo.
- **Mong đợi:** lưu được, không báo trùng với chính B1; Hùng không có thông báo mới.
- **Nguồn:** YC5.6-NT3, YC5.6-NT10
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US31-KB7 · Sale không sửa được `[Biên]`
- **Mục đích:** thử vi phạm quyền bằng tay (CL6.3).
- **Làm:** đăng nhập Sale Hùng, mở B1.
- **Mong đợi:** không có nút "Sửa" của chủ nhà; gọi lệnh sửa bằng tay (Đức dùng công cụ dev) bị từ chối, B1 không đổi.
- **Nguồn:** YC5.6-NT8
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**
