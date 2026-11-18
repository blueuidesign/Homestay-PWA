---
paths:
  - "docs/product/**"
---
# Quy ước khi sửa docs/product/

- Khuôn: docs/process/templates/yc.md cho YC, qt.md cho QT. Không bỏ mục nào của khuôn. Cách đọc và quy ước YC: docs/product/requirements/INDEX.md.
- Yêu cầu (YC) trả lời "làm gì, cho ai". Quy tắc (QT) trả lời "tính thế nào". Luật dùng ở từ hai YC trở lên nằm ở QT (QT6 quy tắc dùng chung); luật chỉ một YC dùng nằm trong mục "Quy tắc của nhóm" của YC đó (QD21). YC trỏ QT bằng mã.
- Mỗi YC có tiêu chí nghiệm thu NT viết dạng "Khi ..., thì ...". Mỗi QT có ít nhất một ví dụ số VD, do Tùng viết hoặc duyệt. AI không tự bịa số.
- Không viết yêu cầu từ trí nhớ hay từ chat. Nguồn là QD đã chốt, câu hỏi đã trả lời trong work/cau-hoi.md, hay lời Tùng trong phiên "Tôi là Tùng". Không có nguồn thì ghi câu hỏi vào work/cau-hoi.md và gắn [MỞ: YC<n>-H<m>].
- YC không có mục Câu hỏi còn mở. Câu trả lời của Tùng đưa vào thân YC (đổi nghĩa thì tăng bản theo CL6), rồi đánh dấu câu hỏi đã trả lời.
- Chỗ hai nguồn nói khác nhau: ghi câu hỏi (hay QD cho-chot nếu chạm nhiều YC), không chọn bên nào.
- Thêm hoặc đổi YC thì cập nhật docs/product/requirements/INDEX.md trong cùng PR. Thêm hoặc đổi QT thì cập nhật rules/INDEX.md.
- Sửa nghĩa một YC hay QT đã de-xuat hoặc da-chot: tăng "bản" và làm theo CL6. Chỉ sửa chữ thì khai "chỉ sửa chữ" trong PR.
- Không tự đổi trang_thai sang da-chot. Chỉ Tùng đổi, bằng PR của chính Tùng.
- Căn tự nhập của sale không có lịch trống: không viết YC nào làm ô ngày hiện "trống" cho căn đó.
