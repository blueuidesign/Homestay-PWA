---
id: US57
tieu_de: "Ghi đặt phòng cho căn tự nhập"
loai: US
trang_thai: dang-lam
thuc_hien: [YC10.4@1]
truoc: [EN1, EN2, EN4, US2]
lien_quan: []
thay_cho: []
nguon: QD21
nguoi: tung
rui_ro: cao
nghiem_thu: khong
uoc_luong:
thuc_te:
can_duyet: []
based_on:
pr:
ngay_tao: 2026-11-18
---
## Mục tiêu
Là sale, tôi làm được việc "Ghi đặt phòng cho căn tự nhập" đúng như YC10.4 mô tả.

## Làm tiêu chí nào
YC10.4-NT1 đến NT10; HV1-NT1, HV2-NT1, HV2-NT2 (hành vi chung gắn màn này, QD27)

## Quy tắc, hành vi dùng
QT1.1, QT1.3, QT3, QT6.3, QT6.4

## Màn hình
S6-05, S6-06

## Quyền
PQ1, PQ2, PQ3, PQ7, PQ13, PQ14, PQ17, PQ23 và các test vi phạm ở mục "Ai được làm gì" của YC10-can-tu-nhap-va-nguon-phong.md thuộc mục này. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
Điền khi lập kế hoạch, theo cấu trúc thư mục EN1 ghi ở docs/dev/chay-va-test.md. Database chỉ thêm migration mới ở supabase/migrations/.

## Ngoài phạm vi
- Phần đầu YC10-can-tu-nhap-va-nguon-phong.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC10.4 QT1.1 QT1.3 QT3 QT6.3 QT6.4 PQ1 PQ2 PQ3 PQ7 PQ13 PQ14 PQ17 PQ23 S6-05 S6-06
YC10-can-tu-nhap-va-nguon-phong.md#Quy tắc của nhóm
YC10-can-tu-nhap-va-nguon-phong.md#Ai được làm gì
YC10-can-tu-nhap-va-nguon-phong.md#Dữ liệu
YC10-can-tu-nhap-va-nguon-phong.md#Trạng thái màn (mọi mục)
thiet-ke-db.md#3. Bất biến (sai là hỏng sản phẩm)

## Test case
Kịch bản test tay: tests/kb/US57-ghi-dat-phong-cho-can.md.

## Task
- [ ] US57-TA1 Code · Claude Code (opus, CL14.6a): viết trước test database cho YC10.4-NT2 đến NT10 (NT10 thêm sau ở file test riêng), kể cả test vi phạm quyền ở mục "Ai được làm gì". Task sau không sửa file test này (CL14.5)
- [ ] US57-TA2 Code · Claude Code (opus, CL14.6a): migration, hàm fn_*, policy cho tới khi test database xanh; thêm phép thử làm hỏng vào scripts/thu-lam-hong.sh nếu đổi quyền, tiền, chặn trùng
- [ ] US57-TA3 Code · Claude Code (sonnet, CL14.6a): màn S6-05, S6-06 theo canvas, test unit, e2e cho YC10.4-NT1, YC10.4-NT2, YC10.4-NT3, YC10.4-NT4, YC10.4-NT7, YC10.4-NT8, YC10.4-NT9
- [ ] US57-TA4 Test tay · Đức: chạy tests/kb/US57-ghi-dat-phong-cho-can.md, chế độ nhanh rồi đủ. Rủi ro cao: chạy trên cả iPhone và Android, thử vi phạm quyền bằng tay (CL6.3).

## Kế hoạch

## Nhật ký
- 2026-11-18 · Claude · tạo item từ YC10.4@1 (QD21)
- 2026-11-19 · Claude · nhận HV1-NT1, HV2-NT1, HV2-NT2 từ EN4 (QD27)
- 2026-11-20 · Claude (QD25) · YC10 r4 tự chốt câu mở, thêm NT
- 2026-11-20 · Claude (QD25) · YC10 r5: Claude tự chốt YC10-H9 (thiếu giá cuối tuần thì dùng giá ngày thường), thêm YC10.4-NT10, làm trong PR của US57.

## Bằng chứng
