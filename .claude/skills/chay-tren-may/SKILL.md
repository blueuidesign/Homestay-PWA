---
name: chay-tren-may
description: "Dựng Home247 chạy trên máy cá nhân của Tùng (Mac) hoặc Đức (Windows) để bấm thử: kiểm Node và database (Postgres hoặc Supabase chạy trên máy), chạy migration, nạp dữ liệu mẫu DLM nếu cần, bật app ở chế độ dev, rồi chỉ cách mở trên trình duyệt hoặc trên điện thoại cùng wifi. Dùng khi người dùng nói kiểu: \"chạy app trên máy tôi\", \"dựng môi trường để thử US12\", \"app không lên, kiểm giúp\", \"chạy lại database\", \"nạp lại dữ liệu mẫu\". Chỉ chạy được ở phiên trên máy cá nhân, phiên cloud không có máy để chạy. Không dùng để đưa bản lên Vercel (dùng deploy-ban-thu)."
argument-hint: "[nhánh] [--dlm]"
---

Yêu cầu: $ARGUMENTS. Mọi lệnh lấy từ docs/dev/chay-va-test.md, không đoán. Mục đó chưa có lệnh (EN dựng nền chưa xong) thì nói rõ và dừng.

1. **Máy nào:** hỏi người dùng nếu chưa rõ là Mac của Tùng hay Windows của Đức. Phiên cloud thì nói rõ không chạy được, gợi ý deploy-ban-thu.
2. **Kiểm công cụ:** Node đúng bản trong package.json (`engines`), npm, Postgres hoặc Supabase CLI theo docs/dev/chay-va-test.md. Thiếu thì chỉ cách cài, không tự cài phần mềm hệ thống khi chưa hỏi.
3. **Lấy code:** kéo nhánh người dùng nói (mặc định main), `npm ci`.
4. **Database:** bật database trên máy, chạy migration từ đầu. `--dlm` hoặc kịch bản cần thì nạp dữ liệu mẫu DLM. Không bao giờ trỏ vào database staging hay production.
5. **Bật app** ở chế độ dev, chạy nền. Chờ dòng báo địa chỉ.
6. **Báo cách mở:** địa chỉ trên trình duyệt máy; địa chỉ theo IP máy trong mạng wifi để mở trên điện thoại. Tài khoản thử theo vai lấy ở du-lieu-mau.md.
7. **Lỗi:** đọc lỗi, sửa phần môi trường. Lỗi do code thì ghi bằng bao-loi, không sửa code ở đây.
