---
id: QD27
tieu_de: Tiêu chí của hành vi chung (HV) gắn màn cụ thể thì kiểm ở US làm màn đó
trang_thai: da-chot
loai: quy-trinh
nguoi_chot: tung
ngay_chot: 2026-11-19
han_chot:
thay_cho: []
nguon: Claude tự quyết theo QD25, khi lập kế hoạch EN4
anh_huong: [EN4, US1, US9, US15, US16, US26, US28, US43, US46, US48, US53, US57]
rev: 1
---
# QD27 · Tiêu chí của hành vi chung gắn màn cụ thể thì kiểm ở US làm màn đó

## Câu hỏi
EN4 làm thành phần dùng chung cho HV1 đến HV8, nhưng phần lớn NT của HV nói về một màn cụ thể (S6-05, CN4, CN5-A1, S1-05...). Màn đó chưa có khi làm EN4. Kiểm các NT này ở đâu?

## Phương án
| Phương án | Được gì | Mất gì |
|---|---|---|
| Không làm gì (để hết ở EN4) | Một chỗ | EN4 không xong được tới khi mọi màn có; kiem.py luật nt-test báo đỏ |
| Kiểm ở US làm màn đó | Test chạy trên màn thật, đúng lúc màn có | NT của HV rải ra nhiều item |

## Đề xuất
Kiểm ở US làm màn đó.

## Quyết định
Kiểm ở US làm màn đó (Claude tự quyết, 19/11/2026, theo QD25). EN4 chỉ nhận HV8-NT1, HV8-NT2 (toast, không gắn màn) và test unit của chính các thành phần. Bảng chia:

| NT | Item |
|---|---|
| HV1-NT1, HV2-NT1, HV2-NT2 | US57 (S6-05) |
| HV1-NT2, HV2-NT3 | US9 (tab Lịch) |
| HV3-NT1, HV3-NT4 | US26 (CN4) |
| HV3-NT2 | US15 (CN5-A1) |
| HV3-NT3 | US53 |
| HV4-NT5 | US1 |
| HV4-NT6 | US16 |
| HV5-NT1, HV5-NT2 | US46 |
| HV6-NT2 | US48 |
| HV7-NT1, HV7-NT2 | US28 |
| HV8-NT3 | US43 (S1-05) |

## Lịch sử sửa đổi
| Rev | Ngày | Người | Commit hoặc PR | Thay đổi | Mục bị đổi |
|---|---|---|---|---|---|
| r1 | 2026-11-19 | Claude | EN4-hanh-vi-chung | Bản đầu | Cả file |
