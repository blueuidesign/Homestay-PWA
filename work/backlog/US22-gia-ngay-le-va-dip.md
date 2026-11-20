---
id: US22
tieu_de: "Giá ngày lễ và dịp đặc biệt"
loai: US
trang_thai: cho-test
thuc_hien: [YC4.3@1]
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
pr: 74
ngay_tao: 2026-11-18
---
## Mục tiêu
Là chủ nhà, tôi làm được việc "Giá ngày lễ và dịp đặc biệt" đúng như YC4.3 mô tả.

## Làm tiêu chí nào
YC4.3-NT1 đến NT9

## Quy tắc, hành vi dùng
QT4.1, QT5.3

## Màn hình
CN6-02, CN6-03, CN6-03-01

## Quyền
PQ5, PQ6, PQ21 và các test vi phạm ở mục "Ai được làm gì" của YC4-gia.md thuộc mục này. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
supabase/migrations/20261120140000_us22_gia_dip.sql, supabase/bang-va-cot.md, tests/db/80_us22_gia_dip.sql, scripts/thu-lam-hong.txt, src/lib/gia.ts, src/lib/dichVuGia.ts, src/man/CN6GiaDip.tsx (mới), src/man/CN6GiaCan.tsx, src/man/CN6GiaCan.css, unit test kèm, tests/kb/US22-gia-ngay-le-va-dip.md.

## Ngoài phạm vi
- Chỗ chưa quyết trong mục, chưa code tới khi Tùng trả lời: YC4-H2 (sửa, xóa dải đã lưu). YC4-H6 đã tự chốt 20/11 (QD25).
- Phần đầu YC4-gia.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC4.3 QT4.1 QT5.3 PQ5 PQ6 PQ21 CN6-02 CN6-03 CN6-03-01
YC4-gia.md#Quy tắc của nhóm
YC4-gia.md#Ai được làm gì
YC4-gia.md#Dữ liệu
YC4-gia.md#Trạng thái màn (mọi mục)
thiet-ke-db.md#3. Bất biến (sai là hỏng sản phẩm)

## Test case
Kịch bản test tay: tests/kb/US22-gia-ngay-le-va-dip.md (5 kịch bản, 2 [Chính]).

## Task
- [x] US22-TA1 Code · PR #74
- [x] US22-TA2 Code · PR #74
- [x] US22-TA3 Code · PR #74
- [ ] US22-TA4 Test tay · Đức: chạy tests/kb/US22-gia-ngay-le-va-dip.md, chế độ nhanh rồi đủ. Rủi ro cao: chạy trên cả iPhone và Android, thử vi phạm quyền bằng tay (CL6.3).

## Nhật ký
- 2026-11-18 · Claude · tạo item từ YC4.3@1 (QD21)
- 2026-11-20 · Claude (tự chạy, QD25) · tự chốt YC4-H6, viết tests/kb, code TA1 đến TA3 trên nhánh US22-gia-ngay-le, mở PR · khoảng 40 phút
- 2026-11-20 · Claude (tự chạy, QD25) · gộp PR #74 khi CI xanh, chạy migration lên staging, sang chờ test

## Bằng chứng
- `CHI_FILE_CO_MA=1 scripts/test-db.sh YC4.3`: 39 qua, 0 hỏng (lần đầu chạy khi đã có migration; một vòng). `scripts/test-db.sh KT-DB`: 339 qua.
- `scripts/thu-lam-hong.sh YC4.3`: 5 đạt, 0 không đạt.
- `npx vitest run src/man/CN6GiaDip.test.tsx src/man/CN6GiaCan.test.tsx`: 21 qua. Test cũ "YC4.3, YC4.5 chưa làm" của CN6 thu lại chỉ còn YC4.5, vì nút YC4.3 nay mở màn thật.
- `npm run typecheck`: qua. `python3 scripts/kiem.py --diff origin/main`: không có lỗi. Bộ đầy đủ, build, e2e: CI chạy (EN14).
