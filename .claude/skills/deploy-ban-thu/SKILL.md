---
name: deploy-ban-thu
description: "Đưa một bản Home247 lên để thử trên điện thoại qua Zalo: cập nhật server trên Oracle (server giả hoặc server thật có đăng nhập Zalo) theo đúng nhánh, chạy migration, rồi deploy Mini App lên kênh Development (mặc định) hoặc Testing của Zalo và đưa mã QR. Luôn hỏi rõ deploy nhánh nào, server nào, kênh nào trước khi chạy. Dùng khi người dùng nói kiểu: \"deploy bản thử\", \"đưa US12 lên điện thoại\", \"deploy Development\", \"cập nhật server thật\", \"deploy Testing cho Đức\", \"cho tôi QR mới\". Không dùng cho bản Live hay Production (chưa có, luôn cần Tùng duyệt theo CL4.3.5), không dùng để chạy trên máy cá nhân (dùng chay-tren-may). Phiên cloud không có khóa vào Oracle nên chỉ chạy ở phiên trên máy có ssh tới Oracle."
argument-hint: "<nhánh> [server-gia | server-that] [development | testing]"
---

Yêu cầu: $ARGUMENTS. Làm đúng docs/ha-tang/oracle.md và docs/dev/chay-va-test.md. Không đọc, không in `.env` hay App Secret.

1. **Hỏi đủ ba điều trước khi chạy**, trừ khi người dùng đã nói: nhánh nào; Mini App gọi server nào (server giả `api-dev`: Zalo giả, không lưu dữ liệu thật; server thật `api-that`: đăng nhập Zalo thật, dữ liệu được lưu, chỉ tài khoản người trong nhóm, QD24 r2); kênh nào (Development mặc định, 300 lượt một tháng; Testing chỉ khi cần, 60 lượt). Tên ba môi trường: docs/ha-tang/moi-truong.md mục "Gọi tên".
2. **Kiểm trước:** nhánh có CI xanh. Phiên có `ssh oracle` hoặc `ssh vps`. Không có thì dừng và nói cần chạy ở máy có khóa.
3. **Server thật** (khi chọn `server-that` và code server đổi): từ gốc repo đúng nhánh, chạy ba lệnh ở mục "Cập nhật code (deploy lại)" của oracle.md: rsync `src/server`, migration với `PSQL` của `home247_that`, `docker compose up -d --build`. Kiểm `curl -s https://api-that.168-107-80-8.sslip.io/api/v1/toi` trả `CHUA_DANG_NHAP`. Server không lên vì thiếu App Secret thì báo Tùng điền, không tự điền.
4. **Mini App:** `ssh vps`, `cd /opt/zalo-miniapp`, chuyển đúng nhánh, `git pull`. Thư viện đổi thì `/opt/home247-dev/zmp.sh install`. Rồi:
   - server giả: `/opt/home247-dev/zmp.sh deploy -p -m "<mã item> · <mô tả>"`, thêm `-t` cho Testing;
   - server thật: `/opt/home247-that/deploy-miniapp.sh -p -m "<mã item> · <mô tả>"`.
   Máy Đức deploy trực tiếp thì `npx.cmd zmp login` khi cần, rồi `npm.cmd run deploy` (chỉ server giả).
5. **Sau deploy:** đưa QR cho người dùng, nhắc bản Development chỉ mở được bằng QR của lần deploy này. Trả bản clone trên Oracle về nhánh `main` nếu đã đổi nhánh, để lần sau không deploy nhầm.
6. **Ghi:** một dòng nhật ký vào item: ngày, người, nhánh, server, kênh, commit. Báo một dòng giống vậy.
