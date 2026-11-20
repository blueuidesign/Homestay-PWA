---
id: US56
tieu_de: "Căn tự nhập"
loai: US
trang_thai: moi
thuc_hien: [YC10.3@1]
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
Là sale, tôi làm được việc "Căn tự nhập" đúng như YC10.3 mô tả.

## Làm tiêu chí nào
YC10.3-NT1 đến NT10

## Quy tắc, hành vi dùng
QT1.1, QT1.3, QT3, QT6.3, QT6.4

## Màn hình
S6-02, S6-03, S6-03-00

## Quyền
PQ1, PQ2, PQ3, PQ7, PQ13, PQ14, PQ17, PQ23 và các test vi phạm ở mục "Ai được làm gì" của YC10-can-tu-nhap-va-nguon-phong.md thuộc mục này. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
Điền khi lập kế hoạch, theo cấu trúc thư mục EN1 ghi ở docs/dev/chay-va-test.md. Database chỉ thêm migration mới ở supabase/migrations/.

## Ngoài phạm vi
- YC10-H3, H7 đã Claude tự chốt (QD25, YC10 r4). Sửa, xóa đặt phòng đã ghi thuộc US57.
- Phần đầu YC10-can-tu-nhap-va-nguon-phong.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC10.3 QT1.1 QT1.3 QT3 QT6.3 QT6.4 PQ1 PQ2 PQ3 PQ7 PQ13 PQ14 PQ17 PQ23 S6-02 S6-03 S6-03-00
YC10-can-tu-nhap-va-nguon-phong.md#Quy tắc của nhóm
YC10-can-tu-nhap-va-nguon-phong.md#Ai được làm gì
YC10-can-tu-nhap-va-nguon-phong.md#Dữ liệu
YC10-can-tu-nhap-va-nguon-phong.md#Trạng thái màn (mọi mục)

## Test case
Kịch bản test tay: tests/kb/US56-can-tu-nhap.md, chưa viết. Viết trước khi item sang san-sang (CL14.5a).

## Task
- [ ] US56-TA1 Code · Claude Code (opus, CL14.6a): migration, hàm fn_*, policy và test database cho YC10.3-NT1, YC10.3-NT2, YC10.3-NT3, YC10.3-NT4, YC10.3-NT7, YC10.3-NT8, YC10.3-NT9, YC10.3-NT10
- [ ] US56-TA2 Code · Claude Code (sonnet, CL14.6a): màn S6-02, S6-03, S6-03-00 theo canvas, test unit, e2e cho YC10.3-NT1, YC10.3-NT2, YC10.3-NT3, YC10.3-NT4, YC10.3-NT5, YC10.3-NT6, YC10.3-NT8, YC10.3-NT9
- [ ] US56-TA3 Test tay · Đức: chạy tests/kb/US56-can-tu-nhap.md, chế độ nhanh rồi đủ.

## Kế hoạch

## Nhật ký
- 2026-11-18 · Claude · tạo item từ YC10.3@1 (QD21)
- 2026-11-20 · Claude (QD25) · YC10 r4 tự chốt câu mở, thêm NT

## Bằng chứng
