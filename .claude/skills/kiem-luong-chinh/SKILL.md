---
name: kiem-luong-chinh
description: "Để AI tự chạy thử các kịch bản luồng chính [Chính] của một US hay BG trên trình duyệt, với server thử và dữ liệu mẫu, trước khi gộp code và trước khi giao Đức test tay. Giống developer tự bấm thử luồng cơ bản trước khi đưa tester. Chụp ảnh từng màn, ghi kết quả vào mục Bằng chứng của item. Do lam-mot-item và lam-tu-dong tự gọi với item có màn. Người dùng cũng gọi được, ví dụ \"tự chạy thử luồng chính US12\", \"AI test nhanh US3 trước khi đưa Đức\", \"kiểm luồng cơ bản trước khi gộp\". Không thay test tay của Đức: không thử được phần riêng của Zalo (xin quyền, lấy số điện thoại, bảng chia sẻ, mở từ link), không chạy trên điện thoại thật. Không dùng cho item không có màn."
argument-hint: "<mã US hoặc BG> [nhánh]"
---

Item: $ARGUMENTS. Chạy trên nhánh của item. Không ghi vào dòng Kết quả của tests/kb, vì đó là kết quả test tay của Đức.

1. **Chọn kịch bản:** các kịch bản `[Chính]` trong tests/kb/<item>.md (BG thì bước tái hiện trong BG). Bỏ phần cần Zalo thật: xin quyền, số điện thoại, bảng chia sẻ, mở từ link, ghi rõ là bỏ.
2. **Dựng môi trường** theo docs/dev/chay-va-test.md mục "Thử Mini App với server thật trên máy dev":
   - Server thử: `cd src/server && node thu-ghep.js --cong=3001 --cors=http://localhost:3000,http://localhost:2999 --dlm` (cần PostgreSQL và `DATABASE_URL`). Chạy nền, chờ dòng `{"cong":3001}`.
   - Mini App: `cd src/miniapp && VITE_API_URL=http://127.0.0.1:3001 VITE_ZALO_TOKEN_THU=thu:<vai> npm start`, chạy nền. Vai theo kịch bản.
   - Không có PostgreSQL trong phiên thì chạy Mini App với server giả (bỏ `VITE_API_URL`) và ghi rõ "chạy trên server giả, chỉ kiểm giao diện".
3. **Chạy từng kịch bản** bằng Playwright (Chromium có sẵn), khung màn 390×844 như điện thoại: làm đúng các bước Làm, so với Mong đợi, chụp ảnh sau mỗi bước chính vào `work/goi/kiem-<item>/`. Ghi đạt hoặc không đạt và thấy gì.
4. **Không đạt:** lỗi do code của item này thì sửa ngay trong cùng nhánh rồi chạy lại. Lỗi ngoài phạm vi thì ghi bằng bao-loi. Không sửa kịch bản cho khớp code.
5. **Ghi vào mục Bằng chứng** của item: môi trường (server thử hay server giả), danh sách kịch bản đạt, không đạt, bỏ (vì cần Zalo thật), đường dẫn ảnh. Ảnh không commit, xóa thư mục ảnh sau khi xong.
6. **Dọn:** tắt server thử (Ctrl+C xóa schema tạm) và Mini App.
7. **Báo** một dòng: số kịch bản Chính đạt trên tổng, số bỏ vì cần Zalo, có sửa gì không. Còn kịch bản không đạt thì không gộp.
