---
name: lam-tu-dong
description: "Làm liền một chuỗi item (US, EN, BG) khi không ai ngồi xem: xếp hàng việc, giao từng item cho agent phụ có gói việc, tự kiểm CI, gộp PR rồi sang item kế, bỏ qua item bị chặn, dừng nhận việc code khi việc chờ người test đã chạm trần. Chỉ chạy khi Tùng ra lệnh trong phiên \"Tôi là Tùng\" và nêu phạm vi. Dùng khi Tùng nói kiểu: \"làm tự động\", \"làm tiếp các US khác\", \"làm hết EP5 rồi gộp\", \"chạy một loạt US7, US8, EN15\". Không dùng khi chỉ làm một item (dùng lam-mot-item), khi Đức yêu cầu, hoặc khi chưa có phạm vi rõ."
argument-hint: "<phạm vi: mọi US | YC4 | US7, US8, EN15>"
---

Phạm vi: $ARGUMENTS. Không có phạm vi thì hỏi. Phiên này là phiên điều phối: giao việc, kiểm, gộp, không tự viết code.

Quyền gộp: Tùng ra lệnh làm tự động có phạm vi rõ trong phiên "Tôi là Tùng" thì phiên này tự gộp PR của các item trong phạm vi, không hỏi lại (CL4.6 cách 3). Việc này là Tùng bảo gộp theo QD17.

1. **Hàng đợi.** Mọi item trong phạm vi chưa xong, không on-hold, không huy. Thứ tự: BG trước, rồi theo THU-TU.md, item không có trong THU-TU.md xếp theo số mã. Không sửa THU-TU.md (CL4.3.2).
2. **Chọn item kế.** Lấy item đầu hàng đợi làm được ngay:
   - Mọi item trong `truoc` đã gộp phần code.
   - `thuc_hien` trỏ YC đã chốt. Câu có `[MỞ: ...]` thì bỏ phần đó.
   - Không cần việc chỉ người làm được: tiền, tài khoản, dữ liệu thật, phát hành production, quyết định thuộc CL4.3.
   - **Trần chờ người (CL1.2):** item có code ở cho-test cộng cho-nghiem-thu đã tới 6 thì không nhận item có code mới. Chỉ làm BG và item không có code. Hết việc đó thì dừng vòng và báo.
   Item không làm được thì ghi lý do, sang item khác. Mỗi lần một PR vừa gộp thì xét lại các item đã bỏ qua.
3. **Một item một agent (CL10.6).** Mỗi item giao cho một agent phụ, agent đó làm hết task Code của item trên một nhánh, một PR. Gói việc soạn theo item bằng skill soan-viec-cho-subagent. Chỉ tách thêm agent khi có lý do ở CL10.6, và ghi lý do vào gói việc. Task rủi ro cao luôn tách: agent thứ nhất viết test từ NT ở đúng lớp (CL14.5), agent thứ hai viết code, không được sửa file test.
4. **Chọn model** theo CL14.6a, lấy mức cao nhất mà các task của item cần. Gói việc thiếu ô không điền được thì giao opus. Agent báo việc khó hơn dự kiến thì giao lại với model cao hơn.
5. **Giao agent phụ** kiểu `code` (.claude/agents/code.md). Lệnh giao chỉ cần mã item, đường dẫn gói việc, tên nhánh, model. Cách làm (chỉ đọc gói và code, ghi Kế hoạch rồi làm luôn, ghi Bằng chứng, không tự gộp, báo tối đa 10 dòng) đã nằm trong agent, không chép lại. Mỗi lúc một agent làm code để các PR không ghi đè nhau. Trong lúc CI của item này chạy, soạn sẵn gói việc cho item kế.
6. **Kiểm trước khi gộp.** Không tin lời báo:
   - CI của PR xanh. Hook trước khi gộp tự chặn nếu chưa (CL4.9).
   - Nhánh không xung đột với main. Xung đột thì gộp main vào nhánh, chờ CI chạy lại.
   - Item có màn: chạy skill kiem-luong-chinh, các kịch bản luồng chính phải đạt.
   - Không có file test bị sửa sau bước viết test trước (task rủi ro cao). PR không chứa file ở mục 8.
   Không đạt thì giao lại agent sửa, tối đa hai lần. Vẫn không đạt thì để PR mở, ghi vào báo cáo, sang item khác.
   Agent review (.claude/agents/review.md) chỉ chạy khi Tùng bảo.
7. **Gộp và ghi** bằng skill gop-code, kèm lệnh gốc của Tùng làm lời duyệt. Skill đó gộp, xóa nhánh, đánh dấu task, đổi trạng thái item theo CL2.9 và ghi nhật ký. Không báo item là xong khi còn Test tay hay Nghiệm thu.
8. **Không gộp tự động, để Tùng:** chốt hay đổi nghĩa YC, QT, PQ, HV, QD; migration production hay dữ liệu thật; phát hành production; dịch vụ trả phí, tài khoản. Gặp thì để PR mở, ghi vào báo cáo, làm item khác.
9. **Dừng cả vòng** khi: hết item làm được; chạm trần chờ người và hết BG; hai item liền nhau hỏng sau hai lần sửa; phát hiện hai nguồn mâu thuẫn chặn nhiều item; Tùng bảo dừng.
10. **Báo cáo.** Sau mỗi item một dòng: mã, PR, đã gộp chưa, model. Cuối vòng một bảng: item, PR, trạng thái, lý do bỏ qua, việc chờ người (test tay, nghiệm thu, PR ở mục 8), số item đang ở cho-test và cho-nghiem-thu.
