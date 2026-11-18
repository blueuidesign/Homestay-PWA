---
name: chot-quyet-dinh
description: "Ghi lại một quyết định Tùng vừa chốt vào đúng chỗ trong repo, ngay trong phiên: vào một QD (mới hoặc QD đang chờ chốt), hoặc đánh dấu câu hỏi mở đã trả lời rồi sửa YC, kèm ngày và câu nguyên văn, rồi liệt kê mọi chỗ phải sửa theo. Chỉ áp cho lời của Tùng trong phiên bắt đầu bằng \"Tôi là Tùng\". Dùng khi Tùng nói kiểu: \"chốt phương án A\", \"QD12 chọn ...\", \"trả lời YC4-H6: ...\", \"quyết là ...\", \"từ giờ làm thế này ...\", \"đồng ý đề xuất của QD18\", \"câu hỏi đó thì ...\". Không dùng khi Đức nói (lời của Đức là đề xuất, ghi bằng ghi-viec-moi), khi Tùng chỉ hỏi ý kiến chưa chốt, hoặc khi việc là đổi nội dung một yêu cầu đã chốt từ trước (dùng doi-yeu-cau)."
argument-hint: "<câu Tùng chốt>"
---

Câu chốt: $ARGUMENTS. Câu đầu phiên phải là "Tôi là Tùng". Không phải thì dừng, ghi thành đề xuất bằng ghi-viec-moi, nói rõ cần Tùng xác nhận. Chữ "đồng ý" chung chung không tính, hỏi lại Tùng đồng ý điều cụ thể nào.

1. **Chọn chỗ ghi:**
   - Trả lời một câu hỏi mở trong work/cau-hoi.md (có mã YC<n>-H<m>, một phương án, chạm một YC): đánh dấu câu hỏi đã trả lời kèm ngày và câu nguyên văn, rồi sửa YC bằng sua-tai-lieu và gỡ thẻ `[MỞ: YC<n>-H<m>]`.
   - Chốt một QD đang `cho-chot`: ghi mục Quyết định (ngày, câu nguyên văn của Tùng, phương án được chọn), đổi `trang_thai: da-chot`.
   - Quyết định mới có nhiều phương án hoặc chạm nhiều YC: tạo QD mới theo khuôn qd.md, bảng phương án có "không làm gì", mục Quyết định như trên.
   - Đổi một QD đã chốt: không sửa QD cũ. Tạo QD mới có `thay_cho`, QD cũ sang `da-thay` (rules/decisions.md).
2. **Câu nguyên văn** chép đúng chữ Tùng gõ, trong ngoặc kép. Không tóm tắt, không sửa chính tả.
3. **Chỗ phải sửa theo:** grep mã QD hoặc mã câu hỏi trong docs/, work/, src/, tests/. Ghi vào trường `anh_huong` của QD. Sửa được trong cùng PR thì sửa, không thì tạo item US, EN hay BG trỏ tới (CL6). Quyết định làm đổi nghĩa một YC đã chốt thì dùng doi-yeu-cau cho phần đó.
4. **Không ghi quyết định vào nhật ký item.** Nhật ký chỉ ghi mã QD hoặc mã câu hỏi.
5. **Đẩy:** đổi trạng thái YC, QT, QD phải qua PR (hook chặn đẩy thẳng). Mở PR, Tùng gộp hoặc ra lệnh gộp theo CL4.6. Câu hỏi mở và item đẩy thẳng main được.
6. **Báo** ba dòng: ghi ở đâu (mã, link), chỗ nào đã sửa theo, chỗ nào còn item chờ làm.
