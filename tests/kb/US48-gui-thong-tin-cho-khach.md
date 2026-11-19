---
id: US48-KB
us: US48
rev: 1
---
# Kịch bản test tay US48 · Gửi thông tin cho khách

Dữ liệu dùng chung theo docs/product/du-lieu-mau.md: Sale Hùng (mức cộng mặc định +400.000đ), Sale Lan, Chị Hoa (ICON40 1509), Anh Tuấn (Sapphire 1103, À La Carte 2208). Khoảng ngày 10/10 → 12/10.
Cách ghi kết quả: đánh dấu ☑ OK hoặc ☑ NG, ngày, tên. NG thì ghi thấy gì và mở BG trỏ tới mã kịch bản (skill bao-loi). Cuối lượt test trả lời câu hỏi cải tiến và ghi CT ở work/cai-tien.md (skill test-tay). Chạy lại sau khi sửa thì thêm một dòng Kết quả mới, không xóa dòng cũ. Luật viết kịch bản: CL14.5a.

### US48-KB1 · Gửi 3 căn qua Zalo `[Chính]`
- **Mục đích:** sale gửi chữ và ảnh của vài căn cho khách, khách chỉ thấy giá bán.
- **Làm:** Hùng tìm 10/10 → 12/10, tích 1509, Sapphire 1103, À La Carte 2208, bấm "Gửi cho khách". Ở khối 1509 bấm "Chia sẻ chữ", chọn Zalo, gửi cho một tài khoản thử. Bấm "Gửi 6 ảnh".
- **Mong đợi:** màn ghi "3 căn · 10/10 → 12/10" và 3 khối, mỗi khối một nút chữ và một nút ảnh. Chữ 1509 có "2PN · 3 giường", có giá bán của Hùng, không có giá chủ nhà, không có "x khách", không có tiện ích. Ảnh gửi được qua bảng chia sẻ; máy không cho gửi ảnh thì ảnh tải về máy và có toast "Đã lưu 6 ảnh vào máy. Mở Zalo để gửi ảnh." Quay lại từ Zalo, màn giữ nguyên.
- **Nguồn:** YC8.1-NT1, YC8.1-NT2, YC8.1-NT4, YC8.1-NT5
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US48-KB2 · Sao chép chữ `[Chính]`
- **Làm:** ở màn Gửi cho khách bấm "Sao chép chữ" ở khối 1509, dán vào ghi chú. Bấm "Sao chép chữ cả 3 căn", dán.
- **Mong đợi:** toast "Đã sao chép". Lần dán sau có chữ cả 3 căn theo đúng thứ tự trên màn.
- **Nguồn:** YC8.1-NT3, YC8.1-NT13
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US48-KB3 · Báo căn đã gửi có người đặt `[Chính]`
- **Làm:** sau KB1, Anh Tuấn ghi một đặt phòng cho Sapphire 1103 đêm 11/10. Rồi Anh Tuấn ghi thêm một đặt phòng khác cũng chạm đêm 10/10. Hùng mở thông báo.
- **Mong đợi:** Hùng có đúng một thông báo "Sapphire 1103 · 10/10 → 12/10 vừa có người đặt", không có tên người đặt, không có giá. Anh Tuấn không có thông báo này.
- **Nguồn:** YC8.1-NT8, YC8.1-NT11
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US48-KB4 · Không báo khi chính mình đặt, khi đã qua ngày nhận `[Biên]`
- **Làm:** Hùng gửi À La Carte 2208 cho 10/10 → 12/10, rồi chính Hùng có đặt phòng 2208 đêm 10/10. Với một lần gửi khác đã qua ngày nhận phòng, chủ nhà ghi đặt phòng chạm đêm đó.
- **Mong đợi:** Hùng không có thông báo nào trong hai trường hợp.
- **Nguồn:** YC8.1-NT9, YC8.1-NT10
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US48-KB5 · Chủ nhà đổi ngày đặt phòng `[Biên]`
- **Làm:** Hùng đã gửi Sapphire 1103 cho 10/10 → 12/10. Anh Tuấn đổi một đặt phòng của 1103 từ 14/10 → 15/10 sang 11/10 → 12/10. Lần thử khác: đổi sang 13/10 → 14/10.
- **Mong đợi:** lần đầu Hùng có một thông báo "vừa có người đặt"; lần sau không có.
- **Nguồn:** YC8.1-NT16
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US48-KB6 · Căn thiếu giá, căn nhiều ảnh, quá 10 căn `[Biên]`
- **Làm:** gửi một căn chưa có giá đêm 11/10. Gửi một căn có 12 ảnh. Tích 11 căn rồi bấm "Gửi cho khách".
- **Mong đợi:** căn thiếu giá ghi "Giá: hỏi lại", không có số tiền. Căn 12 ảnh ghi "12 ảnh, gửi 10 ảnh đầu", nút "Gửi 10 ảnh", gửi đi đúng 10 ảnh đầu. 11 căn thì màn ghi "Mỗi lần gửi tối đa 10 căn. Quay lại bỏ bớt căn."
- **Nguồn:** YC8.1-NT12, YC8.1-NT14, YC8.1-NT15
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US48-KB7 · Máy không có bảng chia sẻ, quyền `[Biên]`
- **Làm:** mở app trên trình duyệt máy tính không có bảng chia sẻ, bấm "Chia sẻ chữ". Sale Lan thử mở màn gửi khách với một căn của Anh Tuấn (Lan không kết nối Anh Tuấn), bằng link sửa tay. Chị Hoa thử xem lần gửi của Hùng.
- **Mong đợi:** máy không có bảng chia sẻ thì chữ được sao chép, toast "Đã sao chép, dán vào Zalo để gửi". Lan không soạn được tin cho căn đó (báo lỗi, không có chữ nào). Chị Hoa không thấy lần gửi nào.
- **Nguồn:** HV6-NT2, YC8.1-NT6, YC8.1-NT7
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**
