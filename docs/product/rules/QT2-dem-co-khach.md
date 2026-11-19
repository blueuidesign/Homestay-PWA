---
id: QT2
tieu_de: Đêm có khách
trang_thai: de-xuat
nguoi_chu: tung
rev: 2
---
# QT2 · Đêm có khách

Một luật chung cho lịch của chủ nhà (CN1), thống kê (CN8) và lịch phòng của sale (S1, ô "Kín"), để ba màn luôn ra cùng một con số.

## QT2.1 · Booking chiếm những đêm nào
Rủi ro: cao
Booking chiếm các đêm từ ngày nhận tới trước ngày trả. Ngày trả không phải đêm có khách. `[r2 · sửa]` Booking đã hủy (xóa) không chiếm đêm: chỉ booking chưa hủy chiếm đêm (Claude tự chốt, QD25, trả lời QT2-H1).

| Mã | Nhận → trả | Phải ra |
|---|---|---|
| QT2.1-VD1 | B1: 10/10 → 12/10 | 2 đêm: 10/10, 11/10 |
| QT2.1-VD2 | B6: 14/10 → 15/10 | 1 đêm: 14/10 |

## QT2.2 · Đêm thuộc tháng nào
Rủi ro: tb
Mỗi đêm thuộc tháng của chính đêm đó. Booking qua hai tháng thì chia đêm cho hai tháng.

| Mã | Nhận → trả | Phải ra |
|---|---|---|
| QT2.2-VD1 | B9: 30/11 → 02/12 | Tháng 11: 1 đêm (30/11). Tháng 12: 1 đêm (01/12) |
| QT2.2-VD2 | Mọi booking tháng 10 của Chị Hoa (DLM.4) | 13 đêm có khách (DLM.5) |

Các ví dụ dùng số trong `docs/product/du-lieu-mau.md`.

## Lịch sử sửa đổi
| Rev | Ngày | Người | Commit hoặc PR | Thay đổi | Mục bị đổi |
|---|---|---|---|---|---|
| r1 | 2026-11-18 | Claude | QD21-lam-lai-tai-lieu | Tách từ docs/luat-chung/QT.md (QD21) | Cả file |
| r2 | 2026-11-19 | Claude | US9-lich-thang | Booking đã hủy không chiếm đêm, trả lời QT2-H1 (Claude tự chốt, QD25) | QT2.1 |
