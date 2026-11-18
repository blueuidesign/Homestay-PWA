---
name: chay-tren-may
description: "Dựng Home247 chạy trên máy cá nhân của Tùng (Mac) hoặc Đức (Windows) để bấm thử: kiểm Node và PostgreSQL, chạy migration, nạp dữ liệu mẫu DLM nếu cần, bật server thử, bật Mini App, rồi chỉ cách mở trên trình duyệt hoặc trên điện thoại cùng wifi. Dùng khi người dùng nói kiểu: \"chạy app trên máy tôi\", \"bật server để test\", \"dựng môi trường để thử US12\", \"app không lên, kiểm giúp\", \"chạy lại database\", \"nạp lại dữ liệu mẫu\". Chỉ chạy được ở phiên trên máy cá nhân, phiên cloud không có máy để chạy. Không dùng để đưa bản lên Zalo hoặc lên Oracle (dùng deploy-ban-thu)."
argument-hint: "[trinh-duyet | dien-thoai] [vai: hoa | hung | ...] [dlm]"
---

Yêu cầu: $ARGUMENTS. Làm đúng docs/dev/chay-va-test.md, máy nào theo mục của máy đó. Không đọc, không in `.env`.

1. **Biết máy:** Mac của Tùng (zsh, Node 22 ở `~/.local/node22`, PostgreSQL 17 ở `~/.local/pgsql17`, LaunchAgent tự chạy) hay Windows của Đức (PowerShell 5.1: gõ từng lệnh, dùng `npm.cmd`, `npx.cmd`, migration chạy trong Git Bash). Phiên cloud thì dừng và nói cần mở phiên trên máy cá nhân.
2. **Kiểm nền:** `node -v` (22), `psql "postgres://home247@localhost:5432/home247_dev" -c "select 1"`. Postgres chưa chạy thì bật theo mục "Cài Node và PostgreSQL trên máy Mac" hoặc hướng dẫn của Windows. Thư viện chưa cài thì `npm ci` ở `src/server` và `src/miniapp`.
3. **Database:** `src/db/chay-migration.sh len`. Người dùng cần dữ liệu mẫu (`dlm`, hoặc kịch bản test tay ghi nạp DLM) thì `src/db/seed/nap-dlm.sh` rồi `nap-dlm.sh kiem`.
4. **Server thử:** `node thu-ghep.js --cong=3001 --cors=http://localhost:3000,http://localhost:2999` trong `src/server`, thêm `--dlm` khi cần. Chạy nền, chờ `{"cong":3001}`. Server thử dùng schema tạm và Zalo giả, tắt là mất dữ liệu.
5. **Mini App:** `VITE_API_URL=http://127.0.0.1:3001 VITE_ZALO_TOKEN_THU=thu:<vai> npm start` trong `src/miniapp`. Trình duyệt mở `http://localhost:3000`. Điện thoại cùng wifi (chỉ dữ liệu giả): `VITE_API_URL= npx zmp start -Z -ios`, quét QR bằng Zalo.
6. **Cần đăng nhập Zalo thật hoặc dữ liệu được lưu lại** thì không chạy được ở đây: dùng server thật trên Oracle qua deploy-ban-thu.
7. **Báo:** địa chỉ mở app, vai đang dùng, cách đổi vai, cách tắt. Lỗi thì báo nguyên văn dòng lỗi và bước đang làm.
