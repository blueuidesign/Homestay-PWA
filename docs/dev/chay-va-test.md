---
id: DEV
tieu_de: Chạy, test, build và deploy
trang_thai: de-xuat
nguoi_chu: tung
rev: 2
---
# Chạy, test, build và deploy

Bản nháp. Chưa có code (QD21), nên chưa có lệnh. EN dựng nền điền file này cùng PR dựng code; các skill chay-tren-may, kiem-luong-chinh, deploy-ban-thu đọc lệnh ở đây và dừng nếu mục còn trống.

## Cài trên máy
<!-- Node (bản ghi ở package.json engines), npm ci, Postgres 16 hoặc Supabase CLI. Lệnh cho Mac và Windows. -->

### Database (EN2)
Cần Postgres 16 chạy trên máy và lệnh `psql`. Không cần Supabase CLI: phần của Supabase mà migration dùng (vai `anon`, `authenticated`, schema `auth`) được giả lập ở `supabase/gia-lap/` (QD16 mục 10).
- Mac: `brew install postgresql@16`, rồi `brew services start postgresql@16`. Thêm `/opt/homebrew/opt/postgresql@16/bin` vào PATH.
- Windows: cài bản 16 từ trang tải của postgresql.org (EDB installer), nhớ mật khẩu đặt cho user `postgres`. Chạy các script bằng Git Bash.
- Ubuntu: `sudo apt install postgresql-16`.

Các script đọc cách kết nối từ biến của psql. Đặt một lần trong cửa sổ dòng lệnh (mật khẩu là mật khẩu Postgres trên máy mình, không phải mật khẩu Supabase):
```
export PGHOST=localhost PGUSER=postgres PGPASSWORD=<mật khẩu postgres trên máy>
```

## Chạy app với database thử trên máy
<!-- Bật database, chạy migration từ đầu, nạp dữ liệu mẫu DLM, bật app ở chế độ dev, tài khoản thử theo vai, mở trên điện thoại cùng wifi. -->

### Database thử và dữ liệu mẫu (EN2)
```
scripts/test-db.sh --chi-dung
```
Lệnh xóa rồi dựng lại database `home247_test` từ toàn bộ `supabase/migrations/`, rồi nạp dữ liệu mẫu DLM (`supabase/seed/dlm.sql`, tên và số giả). Đổi tên database bằng biến `TEST_DB`. Kiểm nhanh đã nạp đúng: tổng tiền các đêm tháng 10 của Chị Hoa phải là 11.800.000đ, 13 đêm (DLM.5):
```
psql -d home247_test -c "select sum(tien), count(*) from booking_dem d join booking b on b.id = d.booking_id join can c on c.id = b.can_id where c.nguoi_giu = '00000000-0000-4000-8000-000000000001' and d.dem between '2026-10-01' and '2026-10-31'"
```
Id cố định của người trong dữ liệu mẫu: Chị Hoa `…0001`, Anh Tuấn `…0002`, Sale Hùng `…0011`, Sale Lan `…0012`, Sale Nga `…0013`, Sale Minh `…0014` (đầy đủ ở đầu `supabase/seed/dlm.sql`). Đóng vai một người trong psql:
```
begin;
select set_config('request.jwt.claims', '{"sub":"00000000-0000-4000-8000-000000000011","role":"authenticated"}', true);
set local role authenticated;
select ma_can from can;          -- Sale Hùng thấy căn nào
rollback;
```
Database này là Postgres trần, app chưa nối vào được (app cần API của Supabase). Nối app với database thì dùng Supabase staging (mục Staging, chờ EN3) hoặc Supabase CLI, chưa dựng ở EN2.

## Test
<!-- Lệnh cho từng lớp test của CL14.5: unit, database (gồm quyền và tiền), e2e, và cách chạy một test theo mã NT. -->

### Database (EN2)
| Lệnh | Làm gì |
|---|---|
| `scripts/test-db.sh` | Dựng database trống từ migration, chạy mọi file `tests/db/`, nạp thử dữ liệu mẫu. Thoát 0 khi mọi test qua |
| `scripts/test-db.sh YC5.3-NT2` | Như trên, chỉ báo các test có tên chứa mã đó. `CHI_TIET=1` in cả test qua |
| `scripts/thu-lam-hong.sh` | Với mỗi dòng của `scripts/thu-lam-hong.txt`: cố tình phá một bất biến rồi chạy test; test của bất biến đó phải đỏ. `scripts/thu-lam-hong.sh KT-DB.3.2` chạy một dòng |
| `scripts/bang-cot.sh` | Sinh lại `supabase/bang-va-cot.md` (bảng, cột, ràng buộc, policy, view, hàm) từ migration. Chạy sau mỗi lần đổi migration và commit cùng PR; CI báo lỗi nếu quên |

Cách viết test database: mỗi file `tests/db/<số>_<tên>.sql` chạy trong một giao dịch rồi rollback, đầu file gọi `select t.fixture();` (bộ rút gọn DLM ở `tests/db/01_helpers.sql`). Hàm kiểm ở `tests/db/00_khung.sql`: `t.ok`, `t.bang`, `t.loi`, `t.khong_loi`, `t.dem`; đóng vai bằng `t.dang_nhap(id)`, `t.khach()`, `t.thoat()`. Tên test mở đầu bằng mã nó kiểm (NT, hoặc `KT-DB.3.<n>` cho bất biến ở thiet-ke-db.md mục 3). Đổi hàm, policy, view thì thêm một dòng vào `scripts/thu-lam-hong.txt`.

CI chạy cả ba lệnh ở job `database` của `.github/workflows/kiem.yml`, trên Postgres 16.

Giới hạn: test chạy trên Postgres trần với phần Supabase giả lập, không phải Supabase thật. Lần đầu chạy migration lên staging phải chạy lại test trên staging (thiet-ke-db.md mục 6, QD16 mục 10).

## Build
<!-- npm run typecheck, npm run build, giới hạn kích thước nếu có. -->

## Staging và bản Preview
<!-- Chạy migration lên Supabase staging, bản Preview của Vercel theo nhánh, tài khoản thử trên staging (chỉ tên, không mật khẩu). -->

## Production
<!-- Chỉ khi Tùng duyệt (CL4.3). Chờ QD23. -->

## Lịch sử sửa đổi
| Rev | Ngày | Người | Commit hoặc PR | Thay đổi | Mục bị đổi |
|---|---|---|---|---|---|
| r1 | 2026-11-18 | Claude | QD21-lam-lai-tai-lieu | Tạo bản nháp, chờ EN dựng nền điền | Cả file |
| r2 | 2026-11-18 | Claude | EN2-database-nen | Điền phần database: cài Postgres, dựng database thử và dữ liệu mẫu, lệnh test database | Cài trên máy, Chạy app với database thử trên máy, Test |
