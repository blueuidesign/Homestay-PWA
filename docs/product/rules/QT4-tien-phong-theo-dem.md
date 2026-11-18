---
id: QT4
tieu_de: Tiền phòng của booking và cách chia theo đêm
trang_thai: de-xuat
nguoi_chu: tung
rev: 1
---
# QT4 · Tiền phòng của booking và cách chia theo đêm

Một luật cho ô "Tiền phòng" khi chủ nhà ghi booking (YC5.2) và cho số tiền của từng đêm mà doanh thu theo tháng (QD10, QT2.2, YC11) và tiền chênh theo tháng (QT3.2) dùng. Bảng giá chỉ để điền sẵn, booking giữ số của riêng nó (YC3, YC4 quy tắc Booking giữ giá riêng).

## QT4.1 · Tiền phòng điền sẵn và số chủ nhà gõ
Rủi ro: cao
Tiền phòng điền sẵn bằng tổng giá chủ nhà của các đêm theo bảng giá lúc ghi (giá dịp thay giá tháng, đêm cuối tuần theo YC4.6). Chủ nhà sửa được; số chủ nhà gõ là tiền phòng của booking. Tiền phòng bắt buộc: còn trống thì chưa lưu được.

| Mã | Booking | Bảng giá các đêm | Chủ nhà gõ | Phải ra |
|---|---|---|---|---|
| QT4.1-VD1 | 1509, nhận 31/10 trả 02/11 (2 đêm) | 31/10 (T7, cuối tuần) 1.300.000đ; 01/11 (CN, ngày thường) 900.000đ (DLM.3) | Không sửa | Ô điền sẵn 2.200.000đ; tiền phòng 2.200.000đ |
| QT4.1-VD2 | Như VD1 | Như VD1 | 2.000.000đ | Tiền phòng 2.000.000đ |
| QT4.1-VD3 | Như VD1 | Như VD1 | Xóa trống ô | Chưa lưu được |

## QT4.2 · Chia tiền phòng cho các đêm
Rủi ro: cao
Chủ nhà không sửa ô tiền phòng thì mỗi đêm giữ giá của đêm đó theo bảng giá lúc ghi. Chủ nhà gõ tổng khác tổng bảng giá thì chia đều tổng đó cho các đêm, tính bằng đồng, phần lẻ không chia hết dồn vào đêm cuối. Mỗi đêm thuộc tháng của chính đêm đó (QT2.2).

| Mã | Booking | Tiền phòng | Phải ra |
|---|---|---|---|
| QT4.2-VD1 | 1509, nhận 31/10 trả 02/11 (2 đêm), chủ nhà gõ khác bảng giá (QT4.1-VD2) | 2.000.000đ | Đêm 31/10: 1.000.000đ, đêm 01/11: 1.000.000đ. Doanh thu tháng 10: 1.000.000đ, tháng 11: 1.000.000đ |
| QT4.2-VD2 | 3 đêm, chủ nhà gõ khác bảng giá | 1.000.000đ | 333.333đ, 333.333đ, 333.334đ (đêm cuối nhận phần lẻ) |
| QT4.2-VD3 | 1509, nhận 31/10 trả 02/11, chủ nhà không sửa (QT4.1-VD1) | 2.200.000đ | Đêm 31/10: 1.300.000đ, đêm 01/11: 900.000đ. Doanh thu tháng 10: 1.300.000đ, tháng 11: 900.000đ |

VD1, VD2, VD3 dùng bộ số DLM.3.

## Lịch sử sửa đổi
| Rev | Ngày | Người | Commit hoặc PR | Thay đổi | Mục bị đổi |
|---|---|---|---|---|---|
| r1 | 2026-11-18 | Claude | QD21-lam-lai-tai-lieu | Tách từ docs/luat-chung/QT.md (QD21) | Cả file |
