---
name: kiem-luong-chinh
description: "Để AI tự chạy thử các kịch bản luồng chính [Chính] của một US hay BG trên trình duyệt, với database thử trên máy và dữ liệu mẫu, trước khi gộp code và trước khi giao Đức test tay. Giống developer tự bấm thử luồng cơ bản trước khi đưa tester. Chụp ảnh từng màn, ghi kết quả vào mục Bằng chứng của item. Do lam-mot-item và lam-tu-dong tự gọi với item có màn. Người dùng cũng gọi được, ví dụ \"tự chạy thử luồng chính US12\", \"AI test nhanh US3 trước khi đưa Đức\", \"kiểm luồng cơ bản trước khi gộp\". Không thay test tay của Đức: không thử được phần cần điện thoại thật (cài lên màn hình chính, thông báo đẩy, chia sẻ của hệ điều hành, đăng nhập thật bằng mã gửi về máy). Không dùng cho item không có màn."
argument-hint: "<mã US hoặc BG> [nhánh]"
---

Item: $ARGUMENTS. Chạy trên nhánh của item. Không ghi vào dòng Kết quả của tests/kb, vì đó là kết quả test tay của Đức.

1. **Chọn kịch bản:** các kịch bản `[Chính]` trong tests/kb/<item>.md (BG thì bước tái hiện trong BG). Bỏ phần cần điện thoại thật: cài app, thông báo đẩy, bảng chia sẻ của hệ điều hành, nhận mã đăng nhập thật. Ghi rõ là bỏ.
2. **Dựng môi trường** theo docs/dev/chay-va-test.md mục "Chạy app với database thử trên máy": database Postgres hoặc Supabase trên máy, chạy migration, nạp dữ liệu mẫu DLM, bật app ở chế độ dev, chạy nền. Đăng nhập bằng tài khoản thử theo vai của kịch bản.
   - Mục đó chưa có (EN dựng nền chưa xong) hoặc phiên không có Postgres: dừng, báo "chưa kiểm luồng chính được vì chưa có môi trường", không đoán lệnh.
3. **Chạy từng kịch bản** bằng Playwright (Chromium có sẵn), khung màn 390×844 như điện thoại: làm đúng các bước Làm, so với Mong đợi, chụp ảnh sau mỗi bước chính vào `work/goi/kiem-<item>/`. Ghi đạt hoặc không đạt và thấy gì.
4. **Không đạt:** lỗi do code của item này thì sửa ngay trong cùng nhánh rồi chạy lại. Lỗi ngoài phạm vi thì ghi bằng bao-loi. Không sửa kịch bản cho khớp code.
5. **Ghi vào mục Bằng chứng** của item: môi trường (database trên máy, commit), danh sách kịch bản đạt, không đạt, bỏ (vì cần điện thoại thật), đường dẫn ảnh. Ảnh không commit, xóa thư mục ảnh sau khi xong.
6. **Dọn:** tắt app dev và database thử.
7. **Báo** một dòng: số kịch bản Chính đạt trên tổng, số bỏ vì cần điện thoại thật, có sửa gì không. Còn kịch bản không đạt thì không gộp.
