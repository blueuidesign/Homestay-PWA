---
id: QT6
tieu_de: Quy tắc dùng chung
trang_thai: de-xuat
nguoi_chu: tung
rev: 1
---
# QT6 · Quy tắc dùng chung

Quy tắc nghiệp vụ dùng ở từ hai YC trở lên. Quy tắc chỉ một YC dùng nằm trong YC đó, mục "Quy tắc của nhóm" (QD21).

## QT6.1 · Trạng thái tiền đặt phòng
bản 1 · dùng ở: YC2, YC5, YC11, YC12
Mỗi đặt phòng có một trong ba trạng thái: "Chưa cọc", "Đã cọc · còn thu" (nhãn kèm số tiền cọc, ví dụ "Cọc 1.000.000đ"), "Đã thanh toán". Tiền còn lại = tiền phòng − tiền cọc, tính lúc hiện, không lưu. Đặt phòng sale tự ghi cho căn tự nhập không có trạng thái tiền

## QT6.2 · Chủ nhà chỉ làm việc với sale
bản 1 · dùng ở: YC5, YC9
Với đặt phòng có sale đứng tên, chủ nhà làm việc với sale, không với khách. Tên, số khách do ai nhập chỉ người đó thấy (QD11)

## QT6.3 · Tòa nhà dùng chung
bản 1 · dùng ở: YC3, YC10, YC13
Một danh sách tòa cho mọi người. Home247 đặt sẵn (YC13; bản 1 nạp bằng seed). Người dùng thêm tòa mới không cần duyệt, tòa đó hiện cho mọi người. Gõ tên trùng thì app gợi ý tòa đã có, người dùng vẫn thêm mới được, trừ tên giống hệt (không phân biệt hoa thường) thì dùng tòa đã có (giả định GD21); quản trị viên gộp tòa trùng sau (Tùng, bản Zalo, 04/11/2026, điểm 4)

## QT6.4 · Căn tự nhập không có lịch
bản 1 · dùng ở: YC7, YC10
App không biết lịch của căn tự nhập. Ô ngày ghi "?", không bao giờ ghi "trống" hay giá; ô có đặt phòng sale tự ghi ghi "Bạn". Kết quả tìm phòng để căn tự nhập ở nhóm riêng "TỰ NHẬP · chưa biết lịch". Muốn biết còn trống thì gọi chủ căn

## QT6.5 · Người đã xóa tài khoản
bản 1 · dùng ở: YC1, YC5, YC6, YC7, YC9, YC10, YC11, YC12
Xóa tài khoản chỉ bỏ số điện thoại và đánh dấu đã xóa; căn, ảnh, lịch, giá, tiền, đặt phòng, yêu cầu giữ nguyên (QD13). Ở mọi chỗ người khác còn thấy tên người đó: tên cũ kèm ghi chú nhỏ màu đỏ "Đã xoá tài khoản", không số điện thoại, không nút gọi, nhắn. Sale không còn thấy căn, lịch, giá của chủ nhà đã xóa tài khoản và không đặt, không gửi yêu cầu vào căn đó; mở từ màn cũ thì HV5 lý do "Chủ nhà đã xóa tài khoản". Đặt phòng đã có vẫn chiếm đêm, vẫn tính thống kê cả hai bên. Yêu cầu đang chờ giữ nguyên, vẫn hết hạn sau 14 ngày. Chủ nhà không đổi phạm vi, quyền xem cho sale đã xóa tài khoản. Người đó nhập lại số thì dùng lại như trước, kết nối cũ nối lại, không phải mời lại

## Lịch sử sửa đổi
| Rev | Ngày | Người | Commit hoặc PR | Thay đổi | Mục bị đổi |
|---|---|---|---|---|---|
| r1 | 2026-11-18 | Claude | QD21-lam-lai-tai-lieu | Chuyển từ docs/luat-chung/QT5, QT6 phần 2 (QD21) | Cả file |
