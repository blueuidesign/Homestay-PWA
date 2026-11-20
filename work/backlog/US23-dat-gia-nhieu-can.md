---
id: US23
tieu_de: "Đặt giá nhiều căn"
loai: US
trang_thai: cho-test
thuc_hien: [YC4.4@1]
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
pr: 75
ngay_tao: 2026-11-18
---
## Mục tiêu
Là chủ nhà, tôi làm được việc "Đặt giá nhiều căn" đúng như YC4.4 mô tả.

## Làm tiêu chí nào
YC4.4-NT1 đến NT7

## Quy tắc, hành vi dùng
QT4.1, QT5.3

## Màn hình
CN6-05, CN6-05-00, CN6-06

## Quyền
PQ5, PQ6, PQ21 và các test vi phạm ở mục "Ai được làm gì" của YC4-gia.md thuộc mục này. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
supabase/migrations/20261120150000_us23_gia_nhieu_can.sql, supabase/bang-va-cot.md, tests/db/81_us23_gia_nhieu_can.sql, scripts/thu-lam-hong.txt, src/lib/dichVuGia.ts, src/lib/dieuHuong.ts, src/man/CN6DatGiaNhieu.tsx (mới), src/man/ManChu.tsx, src/man/CN6GiaCan.tsx (xuất ChonNam), src/man/CN6GiaCan.css, unit test kèm, tests/kb/US23-dat-gia-nhieu-can.md.

## Ngoài phạm vi
- Chỗ chưa quyết trong mục, chưa code tới khi Tùng trả lời: YC4-H3.
- Phần đầu YC4-gia.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC4.4 QT4.1 QT5.3 PQ5 PQ6 PQ21 CN6-05 CN6-05-00 CN6-06
YC4-gia.md#Quy tắc của nhóm
YC4-gia.md#Ai được làm gì
YC4-gia.md#Dữ liệu
YC4-gia.md#Trạng thái màn (mọi mục)
thiet-ke-db.md#3. Bất biến (sai là hỏng sản phẩm)

## Test case
Kịch bản test tay: tests/kb/US23-dat-gia-nhieu-can.md (2 kịch bản, 1 [Chính]).

## Task
- [x] US23-TA1 Code · PR #75
- [x] US23-TA2 Code · PR #75
- [x] US23-TA3 Code · PR #75
- [ ] US23-TA4 Test tay · Đức: chạy tests/kb/US23-dat-gia-nhieu-can.md, chế độ nhanh rồi đủ. Rủi ro cao: chạy trên cả iPhone và Android, thử vi phạm quyền bằng tay (CL6.3).

## Nhật ký
- 2026-11-18 · Claude · tạo item từ YC4.4@1 (QD21)
- 2026-11-20 · Claude (tự chạy, QD25) · viết tests/kb, code TA1 đến TA3 trên nhánh US23-dat-gia-nhieu-can (dựa trên nhánh US22), mở PR · khoảng 20 phút
- 2026-11-20 · Claude (tự chạy, QD25) · gộp PR #75 khi CI xanh, chạy migration lên staging, sang chờ test

## Bằng chứng
- `CHI_FILE_CO_MA=1 scripts/test-db.sh YC4.4`: 16 qua, 0 hỏng (một vòng). `scripts/thu-lam-hong.sh YC4.4`: 3 đạt.
- `npx vitest run src/man/CN6DatGiaNhieu.test.tsx src/man/ManChuGiaTuan.test.tsx src/lib/dieuHuong*.test.ts`: 23 qua. Test cũ "Đặt giá nhiều căn thì toast Sẽ có ở bản sau" đổi thành mở CN6-05, vì nút nay mở màn thật.
- `npm run typecheck`: qua. `python3 scripts/kiem.py --diff origin/main`: không có lỗi. Bộ đầy đủ, build, e2e: CI chạy (EN14).
- Màn CN6-06 không có nút "Đặt giá ngày lễ, dịp đặc biệt" của canvas vì YC4-H3 còn mở.
