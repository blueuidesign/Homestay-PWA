---
id: US58
tieu_de: "Thống kê của chủ nhà"
loai: US
trang_thai: moi
thuc_hien: [YC11.1@2]
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
Là chủ nhà, tôi làm được việc "Thống kê của chủ nhà" đúng như YC11.1 mô tả.

## Làm tiêu chí nào
YC11.1-NT1 đến NT13

## Quy tắc, hành vi dùng
QT2.1, QT2.2, QT3.1, QT3.2, QT4.2, QT6.1

## Màn hình
CN8, CN8-00

## Quyền
PQ7, PQ9, PQ10, PQ11, PQ14, PQ15, PQ16 và các test vi phạm ở mục "Ai được làm gì" của YC11-thong-ke.md thuộc mục này. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
Điền khi lập kế hoạch, theo cấu trúc thư mục EN1 ghi ở docs/dev/chay-va-test.md. Database chỉ thêm migration mới ở supabase/migrations/.

## Ngoài phạm vi
- Chỗ chưa quyết trong mục, chưa code tới khi Tùng trả lời: YC11-H1.
- Phần đầu YC11-thong-ke.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC11.1 QT2.1 QT2.2 QT3.1 QT3.2 QT4.2 QT6.1 PQ7 PQ9 PQ10 PQ11 PQ14 PQ15 PQ16 CN8 CN8-00
YC11-thong-ke.md#Quy tắc của nhóm
YC11-thong-ke.md#Ai được làm gì
YC11-thong-ke.md#Dữ liệu
YC11-thong-ke.md#Trạng thái màn (mọi mục)
thiet-ke-db.md#3. Bất biến (sai là hỏng sản phẩm)

## Test case
Kịch bản test tay: tests/kb/US58-thong-ke-cua-chu-nha.md, chưa viết. Viết trước khi item sang san-sang (CL14.5a).

## Task
- [ ] US58-TA1 Code · Claude Code (opus, CL14.6a): viết trước test database cho YC11.1-NT1, YC11.1-NT2, YC11.1-NT4, YC11.1-NT7, YC11.1-NT8, YC11.1-NT9, YC11.1-NT10, YC11.1-NT12, YC11.1-NT13, kể cả test vi phạm quyền ở mục "Ai được làm gì". Task sau không sửa file test này (CL14.5)
- [ ] US58-TA2 Code · Claude Code (opus, CL14.6a): migration, hàm fn_*, policy cho tới khi test database xanh; thêm phép thử làm hỏng vào scripts/thu-lam-hong.sh nếu đổi quyền, tiền, chặn trùng
- [ ] US58-TA3 Code · Claude Code (sonnet, CL14.6a): màn CN8, CN8-00 theo canvas, test unit, e2e cho YC11.1-NT1, YC11.1-NT2, YC11.1-NT3, YC11.1-NT5, YC11.1-NT6, YC11.1-NT7, YC11.1-NT9, YC11.1-NT11
- [ ] US58-TA4 Test tay · Đức: chạy tests/kb/US58-thong-ke-cua-chu-nha.md, chế độ nhanh rồi đủ. Rủi ro cao: chạy trên cả iPhone và Android, thử vi phạm quyền bằng tay (CL6.3).

## Kế hoạch

## Nhật ký
- 2026-11-18 · Claude · tạo item từ YC11.1@1 (QD21)
- 2026-11-20 · Claude (QD25) · YC11 r2: Claude tự chốt YC11-H1 đến H9 (trừ H4), cập nhật NT và task.

## Bằng chứng
