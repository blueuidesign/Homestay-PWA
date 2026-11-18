# E2E bằng Playwright

Chạy trên trình duyệt thật cỡ điện thoại (iPhone 13 trên WebKit, Pixel 7 trên Chromium), với tài khoản thử trên staging. CI chạy trên bản preview Vercel của mỗi PR (`.github/workflows/e2e.yml`).

| File | Kiểm |
| --- | --- |
| `00_mo_app.spec.ts` | App mở được, không lỗi console, có manifest PWA |
| `01_che_do_thu.spec.ts` | Chế độ thử (dữ liệu mẫu trong máy): chọn vai chủ nhà, chọn vai sale, mở thẳng một địa chỉ bên trong |
| `10_chu_ghi_dat_phong.spec.ts` | US3 trên staging. Đang tắt (`fixme`) tới khi US37 và phần nối Supabase của US3 xong |
| `dang-nhap.ts` | Đăng nhập tài khoản thử bằng supabase-js, đặt phiên vào localStorage |

Quy ước:
- Mỗi story có ít nhất một spec cho luồng chính, đặt tên `NN_<story>.spec.ts`, đầu file ghi mã story.
- Test E2E kiểm cái người dùng thấy. Quyền và tiền kiểm ở `tests/db/`, không lặp ở đây.
- Dữ liệu thử tạo bằng ngày xa trong tương lai hoặc tên có tiền tố `E2E`, để chạy lại không đụng nhau. Không dùng tên, số điện thoại thật.

Chạy trên máy, chế độ thử (không cần Supabase):
```bash
npm run build && npm run e2e -- --project=android
```

Chạy trên máy vào staging:
```bash
npm run dev
E2E_BASE_URL=http://localhost:5173 E2E_SUPABASE_URL=… E2E_SUPABASE_ANON_KEY=… E2E_CHU_EMAIL=… E2E_CHU_MAT_KHAU=… npx playwright test -c tests/e2e
```
