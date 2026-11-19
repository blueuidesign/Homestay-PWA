---
id: US1
tieu_de: "Màn đầu và chọn vai"
loai: US
trang_thai: cho-test
thuc_hien: [YC1.1@3]
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
pr: [20]
ngay_tao: 2026-11-18
---
## Mục tiêu
Là người dùng (chủ nhà hoặc sale), tôi làm được việc "Màn đầu và chọn vai" đúng như YC1.1 mô tả.

## Làm tiêu chí nào
YC1.1-NT1 đến NT7; HV4-NT5 (hành vi chung gắn màn này, QD27)

## Quy tắc, hành vi dùng
HV4, HV5, QT6.5

## Màn hình
A1, A3, A3-00

## Quyền
PQ1, PQ2, PQ6, PQ9, PQ11, PQ20, PQ23 và các test vi phạm ở mục "Ai được làm gì" của YC1-tai-khoan.md thuộc mục này. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
Điền khi lập kế hoạch, theo cấu trúc thư mục EN1 ghi ở docs/dev/chay-va-test.md. Database chỉ thêm migration mới ở supabase/migrations/.

## Ngoài phạm vi
- Phần đầu YC1-tai-khoan.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC1.1 HV4 HV5 QT6.5 PQ1 PQ2 PQ6 PQ9 PQ11 PQ20 PQ23 A1 A3 A3-00
YC1-tai-khoan.md#Quy tắc của nhóm
YC1-tai-khoan.md#Ai được làm gì
YC1-tai-khoan.md#Dữ liệu
YC1-tai-khoan.md#Trạng thái màn (mọi mục)

## Test case
Kịch bản test tay: tests/kb/US1-man-dau-va-chon-vai.md (KB1 đến KB3).

## Task
- [x] US1-TA1 Code · PR #20
- [x] US1-TA2 Code · PR #20
- [ ] US1-TA3 Test tay · Đức: chạy tests/kb/US1-man-dau-va-chon-vai.md, chế độ nhanh rồi đủ.

## Kế hoạch
Phạm vi (theo gói việc work/goi/US1.md, ô Được sửa):
- supabase/migrations/20261119110000_us1_chon_vai.sql: `fn_chon_vai(p_vai text)` security definer cho authenticated; vai khác 'chu_nha', 'sale' thì 'Vai không hợp lệ' (22023); hồ sơ chưa có tên hoặc số thì từ chối; ghi vai_chon và dong_y_dieu_khoan_luc = coalesce(cũ, now()) của chính người gọi.
- tests/db/31_us1_chon_vai.sql (YC1.1-NT5, NT7, PQ1, vi phạm quyền); scripts/thu-lam-hong.txt thêm dòng cho fn_chon_vai và fn_dang_ky (bỏ kiểm số trùng).
- src/man/A1Chao.tsx làm đủ theo canvas A1; src/man/A3ChonVai.tsx (A3, A3-00) thay bản tạm trong ManTam.tsx; tab Lịch tạm có tiêu đề "Lịch" và vai đang dùng; src/lib/xacThuc.ts thêm `chonVai`; App.tsx nối A3.
- Test unit: src/man/A1Chao.test.tsx (NT1), src/man/A3ChonVai.test.tsx (NT3, NT4), src/AppChonVai.test.tsx (NT6). e2e: tests/e2e/supabase/chon-vai.spec.ts (NT2, NT5, HV4-NT5).
Thứ tự: test database, migration; test unit, màn; e2e; chạy kiểm.

## Nhật ký
- 2026-11-18 · Claude · tạo item từ YC1.1@1 (QD21)
- 2026-11-19 · Claude · thuc_hien lên bản mới theo QD22
- 2026-11-19 · Claude · nhận HV4-NT5 từ EN4 (QD27)
- 2026-11-19 · Claude · thuc_hien lên bản 3 theo canvas PWA (PR #10)
- 2026-11-19 · Claude · viết kịch bản test tay, sang dang-lam
- 2026-11-19 · Claude · code TA1, TA2 (fn_chon_vai, A1, A3, A3-00), mở PR · Supabase máy cũ treo do trỏ worktree đã xóa, dựng lại
- 2026-11-19 · Claude · gộp PR #20 theo QD25 (CI xanh 4 job), sang cho-test chờ Đức TA3

## Bằng chứng
- `scripts/test-db.sh`: lần đầu 15 đỏ (chưa có fn_chon_vai), 1 vòng sửa; cuối 344 qua, 0 hỏng.
- `scripts/thu-lam-hong.sh`: thêm 3 dòng (fn_chon_vai nhận vai lạ, bỏ kiểm chưa đăng ký, fn_dang_ky bỏ kiểm số trùng); lần đầu 1 dòng không chạy vì khóa có dấu ngoặc kép, sửa 1 vòng; cuối 57 đạt, 0 không đạt.
- `npm test`: lần đầu 2 đỏ (AppChonVai NT6, bước 5) và 1 file lỗi (chưa có A3ChonVai); 1 vòng; cuối 84 qua.
- `E2E_SUPABASE=1 CI=1 npx playwright test tests/e2e/supabase` (Supabase máy): 11 qua (NT2, NT5, HV4-NT5 và 8 test US2). `CI=1 npx playwright test`: 3 qua.
- `npm run typecheck`, `npm run build`: qua. `python3 scripts/kiem.py --diff origin/main`: không có lỗi. `scripts/bang-cot.sh` sinh lại supabase/bang-va-cot.md.
