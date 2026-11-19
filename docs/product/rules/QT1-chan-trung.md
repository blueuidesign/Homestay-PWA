---
id: QT1
tieu_de: Chặn trùng booking
trang_thai: de-xuat
nguoi_chu: tung
rev: 1
---
# QT1 · Chặn trùng booking

Một đêm của một căn chỉ được thuộc một booking. Luật này kiểm ở database, không chỉ ở giao diện, vì mọi đường ghi booking đều phải đi qua database. Đêm tính từ ngày nhận tới trước ngày trả.

## QT1.1 · Chặn trùng theo căn
Rủi ro: cao
Booking chiếm đêm gồm booking chủ nhà tự ghi và booking thành từ yêu cầu đặt phòng đã chốt. Ghi một booking mà có ít nhất một đêm đã thuộc booking khác của cùng căn thì bị từ chối, không lưu. Yêu cầu đang chờ chủ không chiếm đêm.

| Mã | Đã có | Ghi mới | Phải ra |
|---|---|---|---|
| QT1.1-VD1 | B1: 1509, 10/10 → 12/10 | 1509, 11/10 → 13/10 | Từ chối: trùng đêm 11/10 |
| QT1.1-VD2 | B1: 1509, 10/10 → 12/10 | 1509, 12/10 → 13/10 | Lưu được: 12/10 là ngày trả của B1, không phải đêm của B1 |
| QT1.1-VD3 | B1: 1509, 10/10 → 12/10 | 3402, 10/10 → 12/10 | Lưu được: khác căn |

## QT1.2 · Sửa booking
Rủi ro: cao
Khi sửa một booking, phép kiểm trùng bỏ chính booking đang sửa ra. Chỉ so với các booking khác của cùng căn.

| Mã | Đã có | Sửa | Phải ra |
|---|---|---|---|
| QT1.2-VD1 | B1: 1509, 10/10 → 12/10 | B1 giữ ngày, đổi tiền | Lưu được |
| QT1.2-VD2 | B1: 1509, 10/10 → 12/10; B5: 1509, 13/10 → 15/10 | B1 thành 10/10 → 14/10 | Từ chối: trùng đêm 13/10 của B5 |

## QT1.3 · Căn tự nhập
Rủi ro: tb
Booking sale tự ghi cho căn tự nhập chỉ chặn trùng trong chính căn tự nhập đó. Không so với căn tự nhập của sale khác, kể cả khi hai sale nhập cùng một căn ngoài đời, và không so với căn trong nguồn phòng.

| Mã | Đã có | Ghi mới | Phải ra |
|---|---|---|---|
| QT1.3-VD1 | V2: Villa Tuần Châu của Sale Hùng, 08/10 → 09/10 | Sale Hùng ghi Villa Tuần Châu, 08/10 → 10/10 | Từ chối: trùng đêm 08/10 |
| QT1.3-VD2 | V2: Villa Tuần Châu của Sale Hùng, 08/10 → 09/10 | Sale Lan ghi căn tự nhập Villa Tuần Châu của Lan, 08/10 → 09/10 | Lưu được: hai căn tự nhập khác nhau |

## QT1.4 · Yêu cầu đặt phòng gặp đêm đã kín
Rủi ro: cao
Sale gửi yêu cầu cho đêm đã thuộc một booking của căn đó thì server không tạo yêu cầu, báo "Căn này đã được đặt rồi" (YC9.1 bước 3a). Chủ nhà chấp nhận một yêu cầu, hoặc tự ghi booking, thì mọi yêu cầu đang chờ có đêm trùng thành Bị từ chối (YC9.3, (giả định GD11) cho trường hợp chủ tự ghi).

| Mã | Đang có | Việc xảy ra | Phải ra |
|---|---|---|---|
| QT1.4-VD1 | B1: 1509, 10/10 → 12/10 | Sale Lan gửi yêu cầu 1509, 11/10 → 12/10 | Không tạo yêu cầu, báo "Căn này đã được đặt rồi" |
| QT1.4-VD2 | Hai yêu cầu chờ: Sale Hùng và Sale Lan, 1509, 17/10 → 19/10 | Chủ chấp nhận yêu cầu của Sale Hùng | Yêu cầu của Sale Lan thành Bị từ chối |

Các ví dụ dùng số trong `docs/product/du-lieu-mau.md`.

## Lịch sử sửa đổi
| Rev | Ngày | Người | Commit hoặc PR | Thay đổi | Mục bị đổi |
|---|---|---|---|---|---|
| r1 | 2026-11-18 | Claude | QD21-lam-lai-tai-lieu | Tách từ docs/luat-chung/QT.md (QD21) | Cả file |
