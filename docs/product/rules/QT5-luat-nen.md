---
id: QT5
tieu_de: Luật nền
trang_thai: de-xuat
nguoi_chu: tung
rev: 1
---
# QT5 · Luật nền

Luật nền dùng ở hầu hết YC: ngày và đêm, tiền, giá một đêm, lỗi, chống gửi trùng, ảnh, thông báo, link. Mỗi mục ghi YC nào dùng; sửa một mục thì soát các YC đó.


## QT5.1 · Ngày và đêm
- Ngày nghiệp vụ theo giờ Việt Nam, kể cả "hôm nay" ở database.
- Một lần ở chiếm các đêm từ ngày nhận tới trước ngày trả. Nhận 10/10, trả 12/10 là hai đêm: 10/10 và 11/10. Khách trả ngày 12/10 và khách nhận ngày 12/10 không trùng nhau (QT2.1).
- Đêm cuối tuần mặc định là đêm thứ Sáu và thứ Bảy; mỗi chủ nhà đổi được, phải chọn ít nhất một đêm (YC4.6).

Dùng ở: mọi YC.

## QT5.2 · Tiền
- Tiền là số nguyên đồng, không có phần lẻ. Giá tính theo đêm.
- Cách viết số tiền trên màn: `glossary.md`, mục Viết số tiền.

Dùng ở: mọi YC.

## QT5.3 · Giá chủ nhà của một đêm
Theo thứ tự ưu tiên:
1. Có giá dịp (ngày lễ hay dịp đặc biệt) phủ đêm đó: lấy giá dịp.
2. Căn tự nhập: giá cuối tuần hay giá ngày thường sale đã ghi cho căn.
3. Giá tháng của tháng chứa đêm đó: giá cuối tuần nếu là đêm cuối tuần, không thì giá ngày thường.
4. Không có gì: không có giá. Màn hiện "Chưa có giá" hay "Chưa đặt", không hiện 0.

Ví dụ số: QT4.1. Dùng ở: YC2, YC4, YC5, YC7, YC9, YC10.

## QT5.4 · Giá bán của sale
Giá bán một đêm = giá chủ nhà của đêm đó + mức cộng của sale cho căn đó; căn chưa có mức cộng riêng thì dùng mức cộng mặc định của sale (YC7.5). Sale bật "làm tròn 50 nghìn" thì làm tròn lên từng đêm rồi mới cộng các đêm (giả định GD13). Chủ nhà và khách không thấy mức cộng.

Đặt phòng đã có giữ giá bán của riêng nó: chủ nhà đổi tiền phòng thì giá bán không tính lại (YC5.6).

Dùng ở: YC5, YC7, YC8, YC9, YC10, YC11.

## QT5.5 · Lỗi
- Database từ chối bằng một câu tiếng Việt viết cho người dùng, ví dụ "Căn này đã được đặt rồi". App hiện nguyên câu đó, có thể kèm việc làm tiếp.
- Lỗi khác (mất mạng, lỗi không lường trước): app hiện câu chung theo HV2, không hiện chữ kỹ thuật.
- Câu báo lỗi luôn nói: chuyện gì, vì sao, làm gì tiếp.
- Người không có quyền với một bản ghi nhận câu "Không tìm thấy…", giống như bản ghi không tồn tại, để không lộ là nó có.

Dùng ở: mọi YC.

## QT5.6 · Chống gửi trùng
Mỗi lần người dùng bấm một việc ghi (thêm căn, đặt phòng, yêu cầu, mở app), app sinh một mã lần gửi và gửi kèm. Mạng rớt, app gửi lại cùng mã: database trả kết quả đã có, không ghi lần thứ hai.

Dùng ở: YC3, YC5, YC9, YC10, YC12.

## QT5.7 · Ảnh
- Ảnh nằm ở kho file riêng tư; chỉ mở được bằng đường dẫn có hạn do database cấp (1 giờ).
- App tải ảnh lên ngay khi chọn, rồi gắn vào căn theo thứ tự khi lưu. Mỗi căn tối đa 12 ảnh, ảnh đầu là ảnh đại diện.
- Chỉ người giữ căn và sale được chia sẻ căn đó mở được ảnh căn. Ảnh căn tự nhập chỉ sale tạo căn mở được.

Dùng ở: YC1, YC3, YC7, YC8, YC10.

## QT5.8 · Thông báo
- Database ghi thông báo khi dữ liệu đổi; app không tự ghi. Loại, người nhận, chữ: YC12.
- Thông báo chỉ chép những gì người nhận được thấy (PQ19).

Dùng ở: YC5, YC6, YC8, YC9, YC11, YC12.

## QT5.9 · Link
- Link mời của chủ nhà hết hạn sau 21 ngày, thu hồi được. Ai có link cũng mở xem trước được khi chưa đăng nhập, và không thấy giá (QD8).
- Mỗi sale có một link xin lịch, gửi cho nhiều chủ nhà. Mở link xin lịch phải đăng nhập, vì màn đó có tên và số điện thoại của sale.
- Link trên PWA là đường dẫn https của app (pwa.md P4).

Dùng ở: YC1, YC6.

## QT5.10 · Giới hạn độ dài
Giới hạn từng ô ghi ở mục Luật kiểm của YC có ô đó. Database chặn bằng ràng buộc; màn nhập chặn ở cùng con số.

## Lịch sử sửa đổi
| Rev | Ngày | Người | Commit hoặc PR | Thay đổi | Mục bị đổi |
|---|---|---|---|---|---|
| r1 | 2026-11-18 | Claude | QD21-lam-lai-tai-lieu | Chuyển từ docs/luat-chung/Nghiep_vu.md phần 1 (QD21) | Cả file |
