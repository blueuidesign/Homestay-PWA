---
id: US53-KB
us: US53
rev: 1
---
# Kịch bản test tay US53 · Sale nhận kết quả

Dữ liệu dùng chung theo docs/product/du-lieu-mau.md: Sale Hùng, Sale Lan, Chị Hoa (ICON40 1509). Khoảng ngày 10/10 → 12/10.
Cách ghi kết quả: đánh dấu ☑ OK hoặc ☑ NG, ngày, tên. NG thì ghi thấy gì và mở BG trỏ tới mã kịch bản (skill bao-loi). Cuối lượt test trả lời câu hỏi cải tiến và ghi CT ở work/cai-tien.md (skill test-tay). Chạy lại sau khi sửa thì thêm một dòng Kết quả mới, không xóa dòng cũ. Luật viết kịch bản: CL14.5a.

### US53-KB1 · Được chấp nhận `[Chính]`
- **Mục đích:** sale biết ngay để báo khách.
- **Làm:** Chị Hoa chấp nhận yêu cầu của Hùng. Hùng mở thông báo, rồi quay lại.
- **Mong đợi:** màn ghi "Chị Hoa đã chấp nhận đặt phòng", "Ngày 10/10 → 12/10 hiện Kín với các sale khác." Mở từ thông báo thì quay lại về danh sách thông báo. Lan xem 1509 thấy 10/10, 11/10 Kín. Mở app lại từ nền thì màn đọc lại trạng thái mới.
- **Nguồn:** YC9.4-NT1, HV3-NT3
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US53-KB2 · Bị từ chối, căn tương tự `[Chính]`
- **Làm:** Chị Hoa từ chối yêu cầu của Hùng với lý do "Đã có khách đặt". Lần khác, Chị Hoa nhận yêu cầu của sale khác trùng đêm. Hùng mở kết quả, chạm một căn ở mục căn tương tự.
- **Mong đợi:** lần đầu ghi "Lý do: Chị Hoa không nhận đặt phòng · Đã có khách đặt."; lần sau ghi "Chị Hoa đã nhận đặt phòng khác cho 10/10 → 12/10." Mục "CĂN TƯƠNG TỰ TRỐNG CÙNG NGÀY" chỉ có căn trống cả hai đêm, không có 1509, mỗi căn ghi giá bán của Hùng, không có giá chủ nhà. Chạm căn mở chi tiết căn đó.
- **Nguồn:** YC9.4-NT2, YC9.4-NT3, YC9.4-NT5
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US53-KB3 · Hết hạn `[Biên]`
- **Làm:** dùng yêu cầu mẫu gửi 22/09 chủ nhà chưa trả lời quá 14 ngày. Dùng một yêu cầu khác có ngày nhận đã qua.
- **Mong đợi:** lần đầu ghi "Yêu cầu đã hết hạn vì Chị Hoa chưa trả lời trong 2 tuần..."; lần sau ghi "Yêu cầu đã hết hạn vì đã qua ngày nhận phòng 10/10." Mỗi yêu cầu chỉ có một thông báo.
- **Nguồn:** YC9.4-NT4, YC9.4-NT8
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US53-KB4 · Chủ nhà xóa tài khoản, sale bị ngừng `[Biên]`
- **Làm:** khi yêu cầu đang chờ, chủ nhà xóa tài khoản. Lần khác, Chị Hoa ngừng cho Lan xem lịch; Lan mở lại yêu cầu cũ tới 1509.
- **Mong đợi:** yêu cầu vẫn "Đang chờ" và hết hạn sau 14 ngày như thường. Lan vẫn thấy yêu cầu cũ (ngày, trạng thái, giá đã chốt) nhưng không mở được chi tiết căn, không thấy lịch mới.
- **Nguồn:** YC9.4-NT6, YC9.4-NT7
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**
