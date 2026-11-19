---
id: US2
tieu_de: "Đăng ký và đăng nhập bằng mã email"
loai: US
trang_thai: dang-lam
thuc_hien: [YC1.2@3]
truoc: [EN1, EN2, EN4]
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
pr: [19]
ngay_tao: 2026-11-18
---
## Mục tiêu
Là người dùng (chủ nhà hoặc sale), tôi làm được việc "Đăng ký và đăng nhập" đúng như YC1.2 mô tả: nhận mã qua email, người mới nhập tên và số điện thoại xong mới vào app (QD22).

## Vì sao sửa
Canvas bản PWA đã có A2, A2-01 đến A2-04, A11, A11-01, A11-02 (PR #10). Màn nhập lại số sau khi xóa tài khoản chưa vẽ: dùng khối số của A2.

## Màn phải làm
| Màn | Loại | Đổi gì | Theo |
|---|---|---|---|
| A2, A2-01 đến A2-04, A11, A11-01, A11-02 | đã vẽ | Không | YC1.2 |

## Làm tiêu chí nào
YC1.2-NT1 đến NT8, NT10 đến NT13. NT9 bỏ vì trùng YC6.3-NT1, kiểm ở US37 (YC1 r4, QD25).

## Quy tắc, hành vi dùng
HV4, HV5, QT6.5

## Màn hình
A2, A2-01, A2-02, A2-03, A2-04, A11, A11-01, A11-02

## Quyền
PQ1, PQ2, PQ6, PQ9, PQ11, PQ20, PQ23 và các test vi phạm ở mục "Ai được làm gì" của YC1-tai-khoan.md thuộc mục này. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
supabase/migrations/20261119100000_us2_dang_ky.sql, supabase/config.toml, supabase/templates/ma-6-so.html (mẫu thư, config.toml cần file), supabase/bang-va-cot.md (sinh lại), tests/db/30_us2_dang_ky.sql, src/** (src/man/, src/lib/), tests/e2e/supabase/, playwright.config.ts, .github/workflows/kiem.yml (job e2e-supabase), package.json, package-lock.json, .env.example, docs/dev/chay-va-test.md.

## Ngoài phạm vi
- Đăng nhập bằng mật khẩu: không làm ở môi trường nào (QD22).
- Phần đầu YC1-tai-khoan.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC1.2 HV4 HV5 QT6.5 PQ1 PQ2 PQ6 PQ9 PQ11 PQ20 PQ23
YC1-tai-khoan.md#Quy tắc của nhóm
YC1-tai-khoan.md#Ai được làm gì
YC1-tai-khoan.md#Dữ liệu
YC1-tai-khoan.md#Trạng thái màn (mọi mục)

## Test case
Kịch bản test tay: tests/kb/US2-dang-nhap.md (KB1 đến KB6).

## Task
- [x] US2-TA1 Thiết kế · Design: canvas bản PWA, PR #10
- [x] US2-TA2 Code · Claude Code (opus, CL14.6a): hàm tạo hồ sơ và lệnh đăng ký kèm test database (YC1.2-NT5, NT6, NT10), màn theo canvas, test unit, e2e cho YC1.2-NT1 đến NT8, NT10 đến NT13. NT9 bỏ vì trùng YC6.3-NT1, kiểm ở US37 (YC1 r4, QD25).
- [ ] US2-TA3 Test tay · Đức: chạy tests/kb/US2-dang-nhap.md, chế độ nhanh rồi đủ. Rủi ro cao: chạy trên cả iPhone và Android, thử vi phạm quyền bằng tay (CL6.3).

## Kế hoạch
1. Test database tests/db/30_us2_dang_ky.sql (NT5, NT6, NT10, vi phạm quyền), rồi migration: trigger tạo hồ sơ (chạy lúc commit), chuan_hoa_so, mục unique một phần trên số, fn_dang_ky.
2. Test unit (NT1 bộ chọn màn, NT13 luật kiểm và A2-01), rồi màn ở src/man/ và dịch vụ src/lib/xacThuc.ts.
3. config.toml: mẫu thư chỉ có mã 6 số, nới giới hạn gửi thư cho test. E2E ở tests/e2e/supabase/ lấy mã từ Mailpit (NT2, NT3, NT4, NT7, NT8, NT11, NT12).
4. Job CI e2e-supabase; cập nhật docs/dev/chay-va-test.md.
Tự quyết thêm: kiểm email đã có ở A2 bằng signInWithOtp(shouldCreateUser false) thay cho hàm fn_email_da_co cho anon, vì bất biến KT-DB.3.1 (test 10_, 12_) chỉ cho anon gọi fn_xem_link_moi.

## Nhật ký
- 2026-11-18 · Claude · tạo item từ YC1.2@1 (QD21)
- 2026-11-19 · Claude · thuc_hien lên YC1.2@2 theo QD22; nhận phần tạo hồ sơ từ EN3 (đã hủy)
- 2026-11-19 · Claude · thuc_hien lên bản 3 theo canvas PWA (PR #10)

- 2026-11-19 · Claude · viết tests/kb/US2-dang-nhap.md, bỏ YC1.2-NT9 (trùng YC6.3-NT1), sang dang-lam
- 2026-11-19 · Claude · code TA2: fn_dang_ky, màn A2, A11, nhập mã, e2e trên Supabase máy · bất ngờ: anon không được gọi hàm mới (KT-DB.3.1)

## Bằng chứng
- `scripts/test-db.sh` (Postgres 16): lần đầu file 30_ đỏ 28 test và lỗi file (chưa có hàm); thêm migration thì 2 test bất biến cũ đỏ (KT-DB.3.1, KT-DB.3.3: anon gọi fn_email_da_co), bỏ hàm đó; vòng 3: 320 qua, 0 hỏng. `scripts/thu-lam-hong.sh`: 54/54 đạt.
- `npx vitest run`: test mới đỏ vì chưa có module; sau code đỏ 8 (nhãn ô chứa cả câu lỗi), rồi 1 (email trong thẻ strong); vòng 3: 75 qua.
- `E2E_SUPABASE=1 CI=1 npx playwright test` trên Supabase chạy ở máy, Mailpit: 11 qua (8 US2, 3 EN1) ngay lần đầu (viết sau màn). Không đặt E2E_SUPABASE: 3 qua (EN1).
- `npm run typecheck`, `npm run build`: qua. `python3 scripts/kiem.py --diff origin/main`: không có lỗi.
