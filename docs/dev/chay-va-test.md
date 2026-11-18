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
App: Node 22 trở lên (ghi ở `package.json`, mục `engines`) và npm đi kèm Node. Mac: `brew install node@22`. Windows: tải bản cài Node 22 LTS ở nodejs.org. Rồi ở thư mục repo:
```sh
npm ci                                   # cài đúng bản thư viện ghi trong package-lock.json
npx playwright install chromium          # trình duyệt cho test e2e, chỉ cần một lần
```
<!-- Database (Postgres 16 hoặc Supabase CLI): EN2 điền. -->

## Cấu trúc thư mục app
```
index.html              trang gốc, gắn manifest và icon
public/                 file chép nguyên vào bản build
  manifest.webmanifest  tên, màu, icon để cài lên màn hình chính
  sw.js                 service worker: chỉ giữ vỏ app (trang gốc, /assets/), không giữ dữ liệu
  icons/                icon 192, 512, maskable 512, apple-touch-icon 180
src/
  main.tsx              điểm vào, đăng ký service worker ở bản build
  App.tsx               vỏ app; màn thật thêm ở các US
  styles.css            biến màu, chữ theo canvas
  lib/                  hàm thuần dùng chung, mỗi file một test cạnh nó (*.test.ts)
    ngay.ts             ngày giờ Việt Nam, các đêm của một lần ở (QT5.1, QT2.1)
    tien.ts             tiền số nguyên đồng, viết "1.300.000đ" (QT5.2)
  pwa/                  đăng ký service worker
  test/setup.ts         nạp matcher cho test unit
tests/e2e/              test Playwright, khung 390×844
vite.config.ts          build và cấu hình Vitest
playwright.config.ts    cấu hình e2e
vercel.json             build trên Vercel, trả index.html cho mọi đường dẫn của app
```
Thêm màn ở US: mỗi màn một thư mục trong `src/` theo nhóm YC, test unit `*.test.tsx` đặt cạnh file màn.

## Chạy app với database thử trên máy
<!-- Bật database, chạy migration từ đầu, nạp dữ liệu mẫu DLM, bật app ở chế độ dev, tài khoản thử theo vai, mở trên điện thoại cùng wifi. -->

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
<!-- Database (quyền, tiền, chặn trùng trên Postgres thật): EN2 điền. -->

CI (`.github/workflows/kiem.yml`, job `app`) chạy typecheck, unit, build, e2e cho mọi PR.

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

## Production
<!-- Chỉ khi Tùng duyệt (CL4.3). Chờ QD23. -->

## Lịch sử sửa đổi
| Rev | Ngày | Người | Commit hoặc PR | Thay đổi | Mục bị đổi |
|---|---|---|---|---|---|
| r1 | 2026-11-18 | Claude | QD21-lam-lai-tai-lieu | Tạo bản nháp, chờ EN dựng nền điền | Cả file |
| r2 | 2026-11-18 | Claude | EN1-dung-nen-app | Điền phần app: cài, cấu trúc thư mục, test unit và e2e, build, bản Preview | Cài trên máy, Cấu trúc thư mục app, Test, Build, Staging và bản Preview |
