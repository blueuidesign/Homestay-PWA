---
id: US25
tieu_de: "Những đêm tính giá cuối tuần"
loai: US
trang_thai: moi
thuc_hien: [YC4.6@1]
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
Là chủ nhà, tôi làm được việc "Những đêm tính giá cuối tuần" đúng như YC4.6 mô tả.

## Làm tiêu chí nào
YC4.6-NT1 đến NT4

## Quy tắc, hành vi dùng
QT4.1, QT5.3

## Màn hình
P6

## Quyền
PQ5, PQ6, PQ21 và các test vi phạm ở mục "Ai được làm gì" của YC4-gia.md thuộc mục này. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
Điền khi lập kế hoạch, theo cấu trúc thư mục EN1 ghi ở docs/dev/chay-va-test.md. Database chỉ thêm migration mới ở supabase/migrations/.

## Ngoài phạm vi
- Chỗ chưa quyết trong mục, chưa code tới khi Tùng trả lời: YC4-H4.
- Phần đầu YC4-gia.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC4.6 QT4.1 QT5.3 PQ5 PQ6 PQ21 P6
YC4-gia.md#Quy tắc của nhóm
YC4-gia.md#Ai được làm gì
YC4-gia.md#Dữ liệu
YC4-gia.md#Trạng thái màn (mọi mục)
thiet-ke-db.md#3. Bất biến (sai là hỏng sản phẩm)

## Test case
Kịch bản test tay: tests/kb/US25-nhung-dem-tinh-gia-cuoi.md, chưa viết. Viết trước khi item sang san-sang (CL14.5a).

## Task
- [ ] US25-TA1 Code · Claude Code (opus, CL14.6a): viết trước test database cho YC4.6-NT2 đến NT4, kể cả test vi phạm quyền ở mục "Ai được làm gì". Task sau không sửa file test này (CL14.5)
- [ ] US25-TA2 Code · Claude Code (opus, CL14.6a): migration, hàm fn_*, policy cho tới khi test database xanh; thêm phép thử làm hỏng vào scripts/thu-lam-hong.sh nếu đổi quyền, tiền, chặn trùng
- [ ] US25-TA3 Code · Claude Code (sonnet, CL14.6a): màn P6 theo canvas, test unit, e2e cho YC4.6-NT1, YC4.6-NT2, YC4.6-NT4
- [ ] US25-TA4 Test tay · Đức: chạy tests/kb/US25-nhung-dem-tinh-gia-cuoi.md, chế độ nhanh rồi đủ. Rủi ro cao: chạy trên cả iPhone và Android, thử vi phạm quyền bằng tay (CL6.3).

## Kế hoạch

## Nhật ký
- 2026-11-18 · Claude · tạo item từ YC4.6@1 (QD21)

## Bằng chứng
