---
id: US24
tieu_de: "Sao chép giá sang căn khác"
loai: US
trang_thai: cho-test
thuc_hien: [YC4.5@1]
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
pr: 77
ngay_tao: 2026-11-18
---
## Mục tiêu
Là chủ nhà, tôi làm được việc "Sao chép giá sang căn khác" đúng như YC4.5 mô tả.

## Làm tiêu chí nào
YC4.5-NT1 đến NT7

## Quy tắc, hành vi dùng
QT4.1, QT5.3

## Màn hình
CN6-07, CN6-08

## Quyền
PQ5, PQ6, PQ21 và các test vi phạm ở mục "Ai được làm gì" của YC4-gia.md thuộc mục này. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
supabase/migrations/20261120160000_us24_sao_chep_gia.sql, supabase/bang-va-cot.md, tests/db/82_us24_sao_chep_gia.sql, scripts/thu-lam-hong.txt, src/lib/gia.ts, src/lib/dichVuGia.ts, src/man/CN6SaoChepGia.tsx (mới), src/man/CN6GiaCan.tsx, src/man/ManChu.tsx, src/man/CN6GiaCan.css, unit test kèm, tests/kb/US24-sao-chep-gia-sang-can.md.

## Ngoài phạm vi
- YC4-H1 đã tự chốt 20/11 (QD25): chép năm đang xem.
- Phần đầu YC4-gia.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC4.5 QT4.1 QT5.3 PQ5 PQ6 PQ21 CN6-07 CN6-08
YC4-gia.md#Quy tắc của nhóm
YC4-gia.md#Ai được làm gì
YC4-gia.md#Dữ liệu
YC4-gia.md#Trạng thái màn (mọi mục)
thiet-ke-db.md#3. Bất biến (sai là hỏng sản phẩm)

## Test case
Kịch bản test tay: tests/kb/US24-sao-chep-gia-sang-can.md (3 kịch bản, 1 [Chính]).

## Task
- [x] US24-TA1 Code · PR #77
- [x] US24-TA2 Code · PR #77
- [x] US24-TA3 Code · PR #77
- [ ] US24-TA4 Test tay · Đức: chạy tests/kb/US24-sao-chep-gia-sang-can.md, chế độ nhanh rồi đủ. Rủi ro cao: chạy trên cả iPhone và Android, thử vi phạm quyền bằng tay (CL6.3).

## Nhật ký
- 2026-11-18 · Claude · tạo item từ YC4.5@1 (QD21)
- 2026-11-20 · Claude (tự chạy, QD25) · tự chốt YC4-H1, viết tests/kb, code TA1 đến TA3 trên nhánh US24-sao-chep-gia, mở PR · khoảng 30 phút
- 2026-11-20 · Claude (tự chạy, QD25) · gộp PR #77 khi CI xanh, chạy migration lên staging, sang chờ test

## Bằng chứng
- `CHI_FILE_CO_MA=1 scripts/test-db.sh YC4.5`: 27 qua, 0 hỏng (một vòng). `scripts/thu-lam-hong.sh YC4.5`: 3 đạt.
- `npx vitest run src/man/CN6SaoChepGia.test.tsx src/man/CN6GiaCan.test.tsx src/man/CN6GiaDip.test.tsx`: 27 qua. Test cũ "YC4.5 chưa làm" của CN6 đổi thành chạm dải đã lưu (YC4-H2 còn mở).
- `npm run typecheck`: qua. `python3 scripts/kiem.py --diff origin/main`: không có lỗi. Bộ đầy đủ, build, e2e: CI chạy (EN14).
