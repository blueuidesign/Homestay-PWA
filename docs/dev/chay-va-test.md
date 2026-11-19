---
id: DEV
tieu_de: Chạy, test, build và deploy
trang_thai: de-xuat
nguoi_chu: tung
rev: 7
---
# Chạy, test, build và deploy

Bản nháp. Chưa có code (QD21), nên chưa có lệnh. EN dựng nền điền file này cùng PR dựng code; các skill chay-tren-may, kiem-luong-chinh, deploy-ban-thu đọc lệnh ở đây và dừng nếu mục còn trống.

## Cài trên máy
App: Node 22 trở lên (ghi ở `package.json`, mục `engines`) và npm đi kèm Node. Mac: `brew install node@22`. Windows: tải bản cài Node 22 LTS ở nodejs.org. Rồi ở thư mục repo:
```sh
npm ci                                   # cài đúng bản thư viện ghi trong package-lock.json
npx playwright install chromium          # trình duyệt cho test e2e, chỉ cần một lần
```

### Database (EN2)
Cần Postgres 16 chạy trên máy và lệnh `psql`. Không cần Supabase CLI: phần của Supabase mà migration dùng (vai `anon`, `authenticated`, schema `auth`) được giả lập ở `supabase/gia-lap/` (QD16 mục 10).
- Mac: `brew install postgresql@16`, rồi `brew services start postgresql@16`. Thêm `/opt/homebrew/opt/postgresql@16/bin` vào PATH.
- Windows: cài bản 16 từ trang tải của postgresql.org (EDB installer), nhớ mật khẩu đặt cho user `postgres`. Chạy các script bằng Git Bash.
- Ubuntu: `sudo apt install postgresql-16`.

Các script đọc cách kết nối từ biến của psql. Đặt một lần trong cửa sổ dòng lệnh (mật khẩu là mật khẩu Postgres trên máy mình, không phải mật khẩu Supabase):
```
export PGHOST=localhost PGUSER=postgres PGPASSWORD=<mật khẩu postgres trên máy>
```

## Cấu trúc thư mục app
`[r4 · thêm]` src/chung/ (EN4). `[r6 · thêm]` src/man/, src/lib/xacThuc.ts, supabase.ts, dieuHuong.ts, tests/e2e/supabase/ (US2).
```
index.html              trang gốc, gắn manifest và icon
public/                 file chép nguyên vào bản build
  manifest.webmanifest  tên, màu, icon để cài lên màn hình chính
  sw.js                 service worker: chỉ giữ vỏ app (trang gốc, /assets/), không giữ dữ liệu
  icons/                icon 192, 512, maskable 512, apple-touch-icon 180
src/
  main.tsx              điểm vào, đăng ký service worker ở bản build
  App.tsx               vỏ app, chọn màn theo phiên và hồ sơ (src/lib/dieuHuong.ts, không dùng thư viện router)
  vite-env.d.ts         biến build VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY (mẫu ở .env.example)
  man/                  các màn (US2: A1 tối thiểu, A2, A11, nhập mã, màn nhập số; A3, Lịch bản tạm), test *.test.tsx cạnh file
  styles.css            biến màu, chữ theo canvas
  lib/                  hàm thuần dùng chung, mỗi file một test cạnh nó (*.test.ts)
    ngay.ts             ngày giờ Việt Nam, các đêm của một lần ở (QT5.1, QT2.1)
    tien.ts             tiền số nguyên đồng, viết "1.300.000đ" (QT5.2)
    supabase.ts         nối Supabase bằng URL và khóa anon (công khai); thiếu biến build thì app chạy như chưa đăng nhập
    xacThuc.ts          gửi mã, xác nhận mã, đọc hồ sơ, lệnh đăng ký (YC1.2); màn chỉ dùng giao diện này nên test unit thay bằng bản giả
  chung/                thành phần dùng chung cho HV1 đến HV8 (toast, đang tải, mất mạng, nháp, quyền, phiên), mỗi nhóm một file và test cạnh nó
  pwa/                  đăng ký service worker
  test/setup.ts         nạp matcher cho test unit
tests/e2e/              test Playwright, khung 390×844
  supabase/             test cần Supabase chạy trên máy và hộp thư giả Mailpit (US2), chỉ chạy khi E2E_SUPABASE=1
supabase/templates/     mẫu thư mã 6 số cho Supabase chạy trên máy và CI
vite.config.ts          build và cấu hình Vitest
playwright.config.ts    cấu hình e2e
vercel.json             build trên Vercel, trả index.html cho mọi đường dẫn của app
```
Thêm màn ở US: mỗi màn một thư mục trong `src/` theo nhóm YC, test unit `*.test.tsx` đặt cạnh file màn.

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

### Supabase chạy trên máy (US2) `[r6 · thêm]`
App cần API của Supabase (đăng nhập, gọi hàm). Chạy cả Supabase trên máy bằng Supabase CLI, cần Docker:
```sh
npx -y supabase@2.122.1 start -x studio,imgproxy,edge-runtime,logflare,vector,realtime,postgres-meta,supavisor
npx -y supabase@2.122.1 status -o env    # API_URL, ANON_KEY (khóa mẫu công khai của CLI), DB_URL, MAILPIT_URL
npx -y supabase@2.122.1 db reset         # nạp lại migration sau khi thêm file mới
```
`[r7 · sửa]` Bật cả kho file (storage-api) cho ảnh căn (US16); imgproxy vẫn tắt. Sửa `supabase/config.toml` thì `supabase stop` rồi `start` lại. Cấu hình ở đó: mã 6 số, hạn 1 giờ, 60 giây giữa hai lần gửi (YC1.2), giới hạn gửi thư nới rộng để test, thư dùng mẫu `supabase/templates/ma-6-so.html` (chỉ có mã, không có link).

Bật app nối vào Supabase trên máy: chép `.env.example` thành `.env.local`, điền `VITE_SUPABASE_ANON_KEY` bằng ANON_KEY ở trên, rồi `npm run dev`. Đăng nhập không cần email thật: dùng email giả bất kỳ (ví dụ `chu1@vidu.test`), mở hộp thư giả Mailpit ở http://127.0.0.1:54324 để lấy mã.

## Test
Unit (Vitest, không cần database; file `src/**/*.test.ts(x)`):
```sh
npm test                                 # chạy hết một lần
npm run test:watch                       # chạy lại khi sửa file
npx vitest run -t "YC5.1-NT2"            # chỉ test có mã này trong tên
```
E2E (Playwright, khung 390×844, file `tests/e2e/*.spec.ts`). Mặc định tự build rồi chạy trên `vite preview` ở cổng 4173:
```sh
npm run e2e
npm run e2e -- -g "YC5.1-NT2"            # chỉ test có mã này trong tên
E2E_BASE_URL=https://<bản Preview> npm run e2e   # chạy trên bản Preview hay staging, không build ở máy
```
Máy đã có sẵn Chromium khác bản (ví dụ phiên cloud): đặt `PW_CHROMIUM_PATH=<đường dẫn chromium>`.

CI (`.github/workflows/kiem.yml`, job `app`) chạy typecheck, unit, build, e2e cho mọi PR.

`[r6 · thêm]` E2E trên Supabase (US2, file `tests/e2e/supabase/*.spec.ts`): cần Supabase đang chạy trên máy (mục trên) và `psql`. Build app với URL, khóa anon local rồi chạy:
```sh
export VITE_SUPABASE_URL=http://127.0.0.1:54321 VITE_SUPABASE_ANON_KEY=<ANON_KEY của supabase status>
E2E_SUPABASE=1 CI=1 npx playwright test tests/e2e/supabase
```
`CI=1` để Playwright tự build lại, không dùng bản preview cũ đang chạy. Test lấy mã từ Mailpit (`E2E_MAILPIT_URL`, mặc định http://127.0.0.1:54324), đọc và tạo sẵn tài khoản bằng `psql` (`E2E_DB_URL`, mặc định database của Supabase trên máy). CI chạy ở job `e2e-supabase`.

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
```sh
npm run typecheck                        # kiểm kiểu TypeScript, không sinh file
npm run build                            # ra thư mục dist/
npm run preview                          # mở bản build ở http://localhost:4173 để thử service worker
npm run dev                              # chạy khi đang sửa, http://localhost:5173; điện thoại cùng wifi mở bằng IP của máy
```
Chưa đặt giới hạn kích thước. Mỗi lần build in cỡ file JS sau nén (gzip); vỏ app lúc dựng nền khoảng 70 KB.

## Staging và bản Preview
Bản Preview: Vercel đọc `vercel.json` (cài bằng `npm ci`, build `npm run build`, thư mục `dist`). Nối repo vào Vercel một lần (VIEC_TAY_CUA_TUNG.md bước 5), rồi mỗi nhánh có PR tự có một bản Preview, link hiện trong PR. Cài thử: mở link bằng Safari (iPhone) hay Chrome (Android), chọn "Thêm vào Màn hình chính".
<!-- Migration lên Supabase staging, tài khoản thử trên staging: EN2, EN3 điền. -->

### Đăng nhập bằng mã email trên staging
`[r5 · thêm]`

Project Supabase staging `home247-staging` (ref `wbsocqhpjtgpkvviusrt`, Singapore). Đăng nhập bằng mã gửi qua email (QD22). Cấu hình đặt ngày 2026-11-19 qua Management API (`PATCH /v1/projects/{ref}/config/auth`), xem lại bằng `GET` cùng địa chỉ:

- Thư gửi qua SMTP của Resend (`smtp.resend.com`, cổng 465), người gửi "Hạ Long Homestay" từ tên miền `homestaymail.vxlab.vn`. Khóa SMTP chỉ nằm trong cấu hình Supabase, không ghi vào repo.
- Mã 6 số (`mailer_otp_length`), hạn 1 giờ (`mailer_otp_exp` = 3600), cùng một email phải chờ 60 giây mới gửi lại được (`smtp_max_frequency`).
- Mẫu thư Magic Link và Confirm signup viết tiếng Việt, chỉ hiện mã `{{ .Token }}` cỡ chữ to, không có link. Tiêu đề thư mở đầu bằng mã để đọc được ngay ở thông báo của điện thoại.
- Site URL là `https://homestay-pwa.vercel.app`. Redirect URLs: `https://homestay-pwa.vercel.app/**` và `https://homestay-pwa-*.vercel.app/**` (các bản Preview của Vercel). Không mở cho mọi `*.vercel.app`, vì như vậy trang của người khác trên Vercel cũng nhận được link đăng nhập.

App gửi mã bằng `supabase.auth.signInWithOtp({ email })`, rồi kiểm mã bằng `supabase.auth.verifyOtp({ email, token, type: 'email' })`. Thử gửi mã không cần app:
```sh
curl -X POST https://wbsocqhpjtgpkvviusrt.supabase.co/auth/v1/otp \
  -H "apikey: <khóa anon>" -H "Content-Type: application/json" \
  -d '{"email":"<email thử>","create_user":true}'
```
Trả `{}` là Supabase đã nhận và gửi thư. Trả 429 `over_email_send_rate_limit` là gửi lại quá sớm.

## Production
<!-- Chỉ khi Tùng duyệt (CL4.3). Chờ QD23. -->

## Lịch sử sửa đổi
| Rev | Ngày | Người | Commit hoặc PR | Thay đổi | Mục bị đổi |
|---|---|---|---|---|---|
| r2 | 2026-11-18 | Claude | EN2-database-nen | Điền phần database: cài Postgres, dựng database thử và dữ liệu mẫu, lệnh test database | Cài trên máy, Chạy app với database thử trên máy, Test |
| r3 | 2026-11-19 | Claude | EN1-dung-nen-app (#6) | Điền phần app: cài, cấu trúc thư mục, test unit và e2e, build, bản Preview | Cài trên máy, Cấu trúc thư mục app, Test, Build, Staging và bản Preview |
| r4 | 2026-11-19 | Claude | EN4-hanh-vi-chung (#14) | Thêm thư mục src/chung/ | Cấu trúc thư mục app |
| r5 | 2026-11-19 | Claude | #15 | Ghi cấu hình đăng nhập bằng mã email trên staging (QD22) | Đăng nhập bằng mã email trên staging (thêm) |
| r6 | 2026-11-19 | Claude | US2-dang-ky-dang-nhap | Thêm Supabase chạy trên máy, biến build, e2e trên Supabase, thư mục src/man/ | Cấu trúc thư mục app, Chạy app với database thử trên máy, Test |
| r7 | 2026-11-19 | Claude | US16-anh-can | Bật storage-api trong lệnh chạy Supabase trên máy (kho ảnh căn) | Supabase chạy trên máy |
