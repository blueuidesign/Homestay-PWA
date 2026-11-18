# US38 · Dựng nền: repo, database, app chạy bằng dữ liệu mẫu, CI

- Loại: kỹ thuật
- Trạng thái: chờ code
- Đặc tả: đã viết lại
- Bản: 1
- Rủi ro: cao
- Làm sau khi xong: không phụ thuộc story nào

## Mục tiêu
Là người làm dự án, tôi muốn một repo mà mở ra là làm tiếp được: tài liệu đủ, database có test, app chạy được, CI kiểm mỗi PR, để các story sau chỉ còn là làm tính năng.

## Đã có trong repo (dựng ngày 18/11/2026)
- Tài liệu theo QD-015: quy trình, quyết định, câu hỏi mở, luật chung, 39 story (35 story ở dạng đặc tả thô, viết lại ở US41), kịch bản kiểm tay, canvas thiết kế.
- Database: 5 file migration, 11 file test (`tests/db/`), 28 phép thử làm hỏng (`scripts/thu-lam-hong.sh`). Tất cả chạy xanh trên Postgres 16 trần có giả lập phần của Supabase.
- App: giao diện chuyển từ bản Zalo, chạy ở chế độ thử; kiểm kiểu sạch (trừ file test), 602 unit test xanh, build được, 5 E2E chế độ thử xanh trên Chromium.
- CI: `.github/workflows/test.yml` (app, database), `.github/workflows/e2e.yml` (trên bản xem thử Vercel), `.github/workflows/backup.yml` (chỉ chạy khi đã bật cho production).

## Tiêu chí nghiệm thu
- **US38-NT1** Khi một người mở PR bất kỳ, thì CI chạy đủ: kiểm kiểu, unit test, build, E2E chế độ thử, test database, kiểm danh sách bảng và cột, kiểm tài liệu, thử làm hỏng; và tất cả xanh trên `main`.
- **US38-NT2** Khi chạy toàn bộ migration lên project Supabase staging trống, thì không lỗi, và bộ test database chạy trên một bản sao của staging cho kết quả như ở máy dev.
- **US38-NT3** Khi mở bản xem thử của Vercel trên iPhone và trên Android, thì app mở được, cài được ra màn hình chính, và đi hết luồng chế độ thử: chọn vai, xem lịch, thêm căn, ghi một đặt phòng.
- **US38-NT4** Khi nạp `supabase/staging/du_lieu_mau.sql` vào staging, thì có đủ 5 tài khoản mẫu với căn, giá, kết nối như `docs/luat-chung/Du_lieu_mau.md`.
- **US38-NT5** Khi Sale Hùng tải một ảnh lên Storage ở staging, thì Sale Lan (không được chia sẻ căn đó) không đọc được ảnh, và người chưa đăng nhập không đọc được ảnh.

## Vì sao còn "chờ code"
US38-NT2 đến NT5 cần tài khoản GitHub, Vercel, Supabase của Tùng (`VIEC_TAY_CUA_TUNG.md`). US38-NT1 cần CI chạy lần đầu trên GitHub. Phần giả lập Supabase trong test không chứng minh được policy của Storage và `pg_cron` chạy thật: US38-NT2 và US38-NT5 là để kiểm điều đó.

## Ngoài phạm vi
- Đăng nhập: US37.
- Nối từng màn sang Supabase: việc của từng story tính năng (`docs/Ghi_chu_code.md` mục 3).
- Production, tên miền, sao lưu: US39.

## Việc cần làm
- [x] Tài liệu, database, test, app chế độ thử, CI (trong commit đầu).
- [ ] Tùng làm `VIEC_TAY_CUA_TUNG.md` bước 1 đến 4.
- [ ] Xem CI chạy lần đầu trên GitHub, sửa nếu đỏ (US38-NT1). Chú ý: CI chưa từng chạy trên máy của GitHub.
- [ ] Chạy migration lên staging qua kết nối Supabase, chạy lại test, xem cảnh báo bảo mật và hiệu năng của Supabase (US38-NT2).
- [ ] Nạp dữ liệu mẫu (US38-NT4), thử Storage bằng tay (US38-NT5).
- [ ] Mở bản xem thử trên hai điện thoại (US38-NT3).
- [ ] Sửa lỗi kiểu trong các file test rồi bỏ dòng `exclude` ở `tsconfig.json` (`docs/Ghi_chu_code.md` mục 6).
- [ ] Bật bảo vệ nhánh `main` (bước 6 của việc tay).
- [ ] Đổi Trạng thái ở đầu file và ở `docs/stories/README.md`.
