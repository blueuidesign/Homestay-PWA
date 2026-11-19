---
id: US51-KB
us: US51
rev: 1
---
# Kịch bản test tay US51 · Chủ nhà trả lời yêu cầu

Dữ liệu dùng chung theo docs/product/du-lieu-mau.md: Chị Hoa (ICON40 1509), Anh Tuấn, Sale Hùng, Sale Lan. Hùng đã gửi yêu cầu 1509 cho 10/10 → 12/10 (US50).
Cách ghi kết quả: đánh dấu ☑ OK hoặc ☑ NG, ngày, tên. NG thì ghi thấy gì và mở BG trỏ tới mã kịch bản (skill bao-loi). Cuối lượt test trả lời câu hỏi cải tiến và ghi CT ở work/cai-tien.md (skill test-tay). Chạy lại sau khi sửa thì thêm một dòng Kết quả mới, không xóa dòng cũ. Luật viết kịch bản: CL14.5a.

### US51-KB1 · Chấp nhận yêu cầu `[Chính]`
- **Mục đích:** chủ nhà đưa đặt phòng vào lịch bằng một chạm.
- **Làm:** Chị Hoa mở tab Lịch, thấy khối "YÊU CẦU ĐẶT PHÒNG", bấm "Xem và trả lời". Bấm "Chấp nhận đặt phòng".
- **Mong đợi:** màn trả lời ghi "Giá của bạn 2.200.000đ", không có giá bán của Hùng. Chấp nhận xong ghi "Đã nhận đặt phòng 1509"; lịch có đặt phòng 10/10, 11/10, Hùng là người đặt. Hùng có thông báo.
- **Nguồn:** YC9.2-NT1, YC9.2-NT2, YC9.2-NT3
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US51-KB2 · Từ chối có và không có lý do `[Chính]`
- **Làm:** với một yêu cầu, bấm "Từ chối", chọn "Đã có khách đặt", bấm "Gửi từ chối cho sale". Với yêu cầu khác, bấm "Từ chối" rồi gửi luôn không chọn lý do.
- **Mong đợi:** lần đầu ghi "Đã từ chối yêu cầu của Sale Hùng", sale thấy lý do "Đã có khách đặt". Lần sau vẫn từ chối được, sale thấy "Lý do: Chị Hoa không nhận đặt phòng." Hết yêu cầu chờ thì tab Lịch không còn khối yêu cầu.
- **Nguồn:** YC9.2-NT4, YC9.2-NT7, YC9.2-NT11
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US51-KB3 · Yêu cầu vừa đổi, sale đã bị ngừng, ngày đã qua `[Biên]`
- **Làm:** Hùng hủy yêu cầu trên máy Hùng trong lúc Chị Hoa đang mở nó, rồi Chị Hoa bấm chấp nhận. Chị Hoa ngừng cho Lan xem lịch rồi chấp nhận yêu cầu Lan gửi trước đó. Một yêu cầu có ngày nhận là hôm qua.
- **Mong đợi:** lần đầu báo yêu cầu đã đổi trạng thái, không có đặt phòng. Lần hai báo "Sale này không còn kết nối với bạn, không nhận được đặt phòng.", vẫn từ chối được. Yêu cầu có ngày nhận đã qua hiện "Hết hạn", không chấp nhận được.
- **Nguồn:** YC9.2-NT5, YC9.2-NT9, YC9.2-NT10
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US51-KB4 · Quyền của chủ nhà khác `[Biên]`
- **Làm:** Anh Tuấn thử mở, chấp nhận, từ chối yêu cầu tới 1509 bằng link sửa tay. Chị Hoa thử hủy yêu cầu thay sale.
- **Mong đợi:** không được, không lộ yêu cầu.
- **Nguồn:** YC9.2-NT8
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**
