---
name: lam-mot-item
description: "Làm trọn một item cụ thể từ đầu tới lúc mở PR: đọc item và đúng phần tài liệu nó trỏ tới, kiểm điều kiện, lập kế hoạch, code và test trên nhánh riêng, ghi nhật ký, mở PR. Dùng khi người dùng bảo làm, code, sửa, viết tiếp, sửa lỗi một item có mã, ví dụ: \"làm US12\", \"code EN54\", \"sửa BG3\", \"làm tiếp US16\". Không dùng khi chỉ hỏi item đó tới đâu (dùng xem-tinh-hinh), khi được bảo làm liền nhiều item hoặc làm tự động (dùng lam-tu-dong), hoặc khi việc chưa có item (ghi trước bằng ghi-viec-moi)."
argument-hint: "<mã item, ví dụ US12>"
---

Làm item $ARGUMENTS. Câu đầu tiên của người dùng phải cho biết ai đang làm, chưa có thì hỏi trước. Một phiên một item.

1. **Đọc bằng `scripts/trich.py`, không mở cả file.** Đọc file item, rồi `python3 scripts/trich.py <các mã trong thuc_hien, Làm tiêu chí nào, Quy tắc, Đọc>`. Đọc item cha và item trong `truoc` ở phần đầu file.
2. **Kiểm điều kiện:** item `san-sang` (CL2.4), item trong `truoc` đã xong, mục trong `thuc_hien` chưa lên bản mới hơn bản đã ghi, không còn `[MỞ: ...]` chặn phần định làm, chưa chạm trần chờ người (CL1.2). Thiếu thì dừng và báo.
3. **Liệt kê:** tài liệu phải sửa, test phải viết ở lớp nào (bảng ở CL14.5), quyền phải xin (CL4). Cần quyền CL4.3 thì mở PR nháp xin duyệt, dừng, báo lại.
4. **Kế hoạch** ở plan mode, ghi vào mục Kế hoạch của item. Rủi ro cao thì chờ Đức duyệt kế hoạch.
5. **Ai code.** Mặc định phiên này tự làm mọi task Code của item trên một nhánh. Chỉ giao agent phụ khi có một trong bốn lý do ở CL10.6: cần độc lập (viết test trước cho task rủi ro cao, review), đổi model tiết kiệm rõ, ngữ cảnh sắp tràn, chạy song song thật. Giao thì soạn gói việc bằng skill soan-viec-cho-subagent, rồi giao cho agent `code` (.claude/agents/code.md, không nạp CLAUDE.md nên rẻ hơn) với mã item, đường dẫn gói, tên nhánh. Model theo CL14.6a.
6. **Làm trên nhánh <mã>-<tên-ngắn>** nếu có code hoặc thuộc CL4.3 (CL4.7). Việc ngoài phạm vi thì ghi bằng ghi-viec-moi, không làm lẫn. Gặp chỗ đặc tả không nói rõ thì ghi câu hỏi vào work/cau-hoi.md, dừng phần đó, không lấp bằng cách làm phổ biến.
7. **Kiểm trước khi báo xong:** trong phiên chỉ chạy test của item: test database lọc theo mã (`CHI_FILE_CO_MA=1 scripts/test-db.sh <mã YC>`), test unit và e2e của file item đổi, `scripts/thu-lam-hong.sh <mã YC>`, `npm run typecheck` và `python3 scripts/kiem.py --diff origin/main`. Không chạy cả bộ test database, unit, build, e2e trong phiên; CI chạy (EN14). Sau khi đẩy chỉ đọc CI đạt hay không, mở log khi đỏ. Item có màn thì chạy thêm skill kiem-luong-chinh. Dán vào mục Bằng chứng: lệnh đã chạy, lần chạy đầu đỏ mấy test, sửa mấy vòng, kết quả cuối.
8. **Ghi và báo:** đánh dấu task, một dòng nhật ký dưới 200 ký tự (ngày · người · đã làm gì · PR · bất ngờ · mất bao lâu), mở PR. Không tự gộp. Khi người có quyền bảo gộp thì dùng skill gop-code, skill đó lo đổi trạng thái. Báo ba dòng: đã làm, còn lại, ai làm gì tiếp.
