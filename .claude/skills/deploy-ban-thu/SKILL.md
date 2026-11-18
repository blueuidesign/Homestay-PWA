---
name: deploy-ban-thu
description: "Đưa một bản Home247 lên để thử trên điện thoại: chạy migration lên database staging của Supabase theo đúng nhánh, rồi lấy địa chỉ bản Preview trên Vercel của nhánh đó (hoặc bản staging) và đưa cho người thử, kèm mã QR. Luôn hỏi rõ nhánh nào, có chạy migration staging không trước khi chạy. Dùng khi người dùng nói kiểu: \"deploy bản thử\", \"đưa US12 lên điện thoại\", \"cập nhật staging\", \"cho Đức link thử\", \"cho tôi QR mới\". Không dùng cho production (luôn cần Tùng duyệt theo CL4.3), không dùng để chạy trên máy cá nhân (dùng chay-tren-may)."
argument-hint: "<nhánh> [--migration]"
---

Yêu cầu: $ARGUMENTS. Hạ tầng và tên bí mật ở docs/ha-tang/. Không đọc, không in giá trị bí mật.

1. **Hỏi rõ trước khi chạy:** nhánh nào, có chạy migration lên staging không. Staging chưa có (CLAUDE.md mục Trạng thái) thì nói rõ và dừng.
2. **Kiểm nhánh:** CI của nhánh xanh. Migration của nhánh chỉ thêm (rules/code.md). Nhánh có migration mà chưa gộp main: hỏi lại Tùng, vì staging dùng chung cho mọi nhánh.
3. **Migration staging** (khi được bảo): chạy theo docs/dev/chay-va-test.md mục staging. Phiên không có quyền vào staging thì đưa lệnh cho Tùng tự chạy, không xin mật khẩu qua chat.
4. **Bản Preview:** Vercel tự dựng mỗi lần đẩy nhánh. Lấy địa chỉ Preview của commit mới nhất (PR trên GitHub có bình luận của Vercel, hoặc `gh pr view`). Chưa dựng xong thì chờ, lỗi dựng thì đọc log dựng và báo.
5. **Đưa cho người thử:** địa chỉ, mã QR (tạo ảnh PNG bằng thư viện qrcode, gửi bằng SendUserFile), tài khoản thử trên staging (tên trong docs/ha-tang/, không ghi mật khẩu).
6. **Ghi** một dòng nhật ký vào item: ngày, nhánh, commit, có migration staging không.
7. **Production:** không làm ở đây. Mọi việc lên production cần Tùng duyệt theo CL4.3.
