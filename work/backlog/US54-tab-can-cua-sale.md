---
id: US54
tieu_de: "Tab Căn của sale"
loai: US
trang_thai: moi
thuc_hien: [YC10.1@2]
truoc: [EN1, EN2, EN4, US2]
lien_quan: []
thay_cho: []
nguon: QD21
nguoi: tung
rui_ro: tb
nghiem_thu: khong
uoc_luong:
thuc_te:
can_duyet: []
based_on:
pr:
ngay_tao: 2026-11-18
---
## Mục tiêu
Là sale, tôi làm được việc "Tab Căn của sale" đúng như YC10.1 mô tả.

## Làm tiêu chí nào
YC10.1-NT1 đến NT11

## Quy tắc, hành vi dùng
QT1.1, QT1.3, QT3, QT6.3, QT6.4

## Màn hình
S6, S6-00, S6-07, S6-08

## Quyền
PQ1, PQ2, PQ3, PQ7, PQ13, PQ14, PQ17, PQ23 và các test vi phạm ở mục "Ai được làm gì" của YC10-can-tu-nhap-va-nguon-phong.md thuộc mục này. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
Điền khi lập kế hoạch, theo cấu trúc thư mục EN1 ghi ở docs/dev/chay-va-test.md. Database chỉ thêm migration mới ở supabase/migrations/.

## Ngoài phạm vi
- YC10-H2, H4, H5 đã Claude tự chốt (QD25, YC10 r4).
- Phần đầu YC10-can-tu-nhap-va-nguon-phong.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC10.1 QT1.1 QT1.3 QT3 QT6.3 QT6.4 PQ1 PQ2 PQ3 PQ7 PQ13 PQ14 PQ17 PQ23 S6 S6-00 S6-07 S6-08
YC10-can-tu-nhap-va-nguon-phong.md#Quy tắc của nhóm
YC10-can-tu-nhap-va-nguon-phong.md#Ai được làm gì
YC10-can-tu-nhap-va-nguon-phong.md#Dữ liệu
YC10-can-tu-nhap-va-nguon-phong.md#Trạng thái màn (mọi mục)

## Test case
Kịch bản test tay: tests/kb/US54-tab-can-cua-sale.md.

## Task
- [ ] US54-TA1 Code · Claude Code (opus, CL14.6a): migration, hàm fn_*, policy và test database cho YC10.1-NT1, YC10.1-NT4, YC10.1-NT6, YC10.1-NT7, YC10.1-NT8, YC10.1-NT11
- [ ] US54-TA2 Code · Claude Code (sonnet, CL14.6a): màn S6, S6-00, S6-07, S6-08 theo canvas, test unit, e2e cho YC10.1-NT1, YC10.1-NT2, YC10.1-NT3, YC10.1-NT4, YC10.1-NT5, YC10.1-NT7, YC10.1-NT8, YC10.1-NT9, YC10.1-NT10
- [ ] US54-TA3 Test tay · Đức: chạy tests/kb/US54-tab-can-cua-sale.md, chế độ nhanh rồi đủ.

## Kế hoạch

## Nhật ký
- 2026-11-18 · Claude · tạo item từ YC10.1@1 (QD21)
- 2026-11-19 · Claude · thuc_hien lên bản mới theo QD22
- 2026-11-20 · Claude (QD25) · YC10 r4 tự chốt câu mở, thêm NT

## Bằng chứng
