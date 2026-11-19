---
id: US50
tieu_de: "Sale gửi và hủy yêu cầu"
loai: US
trang_thai: moi
thuc_hien: [YC9.1@2]
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
Là sale, tôi làm được việc "Sale gửi và hủy yêu cầu" đúng như YC9.1 mô tả.

## Làm tiêu chí nào
YC9.1-NT1 đến NT5, NT7 đến NT13 (NT6 bỏ)

## Quy tắc, hành vi dùng
QT1.1, QT1.4, QT2.1, QT5.6, QT6.2

## Màn hình
S3-02, S3-03, S3-07, S3-08

## Quyền
PQ10 và các test vi phạm ở mục "Ai được làm gì" của YC9-yeu-cau-dat-phong.md thuộc mục này. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
Điền khi lập kế hoạch, theo cấu trúc thư mục EN1 ghi ở docs/dev/chay-va-test.md. Database chỉ thêm migration mới ở supabase/migrations/.

## Ngoài phạm vi
- YC9-H1, H2, H6, H7, H8 đã Claude tự chốt (QD25, YC9 r3).
- Phần đầu YC9-yeu-cau-dat-phong.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC9.1 QT1.1 QT1.4 QT2.1 QT5.6 QT6.2 PQ10 S3-02 S3-03 S3-07 S3-08
YC9-yeu-cau-dat-phong.md#Quy tắc của nhóm
YC9-yeu-cau-dat-phong.md#Ai được làm gì
YC9-yeu-cau-dat-phong.md#Dữ liệu
YC9-yeu-cau-dat-phong.md#Trạng thái màn (mọi mục)
thiet-ke-db.md#3. Bất biến (sai là hỏng sản phẩm)

## Test case
Kịch bản test tay: tests/kb/US50-sale-gui-va-huy-yeu.md.

## Task
- [ ] US50-TA1 Code · Claude Code (opus, CL14.6a): viết trước test database cho YC9.1-NT1, YC9.1-NT2, YC9.1-NT4, YC9.1-NT5, YC9.1-NT7, YC9.1-NT8, YC9.1-NT9, YC9.1-NT10, YC9.1-NT11, YC9.1-NT12, YC9.1-NT13, kể cả test vi phạm quyền ở mục "Ai được làm gì". Task sau không sửa file test này (CL14.5)
- [ ] US50-TA2 Code · Claude Code (opus, CL14.6a): migration, hàm fn_*, policy cho tới khi test database xanh; thêm phép thử làm hỏng vào scripts/thu-lam-hong.sh nếu đổi quyền, tiền, chặn trùng
- [ ] US50-TA3 Code · Claude Code (sonnet, CL14.6a): màn S3-02, S3-03, S3-07, S3-08 theo canvas, test unit, e2e cho YC9.1-NT1, YC9.1-NT3, YC9.1-NT5, YC9.1-NT7, YC9.1-NT12, YC9.1-NT13
- [ ] US50-TA4 Test tay · Đức: chạy tests/kb/US50-sale-gui-va-huy-yeu.md, chế độ nhanh rồi đủ. Rủi ro cao: chạy trên cả iPhone và Android, thử vi phạm quyền bằng tay (CL6.3).

## Kế hoạch

## Nhật ký
- 2026-11-18 · Claude · tạo item từ YC9.1@1 (QD21)
- 2026-11-19 · Claude · thuc_hien lên bản mới theo QD22
- 2026-11-19 · Claude (QD25) · YC9 r3 tự chốt câu mở, thêm NT

## Bằng chứng
