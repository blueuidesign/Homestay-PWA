---
paths:
  - "docs/**"
---
# Quy ước khi sửa docs/

- Mỗi file có đầu file: id (nếu là mục có mã), trang_thai (de-xuat | da-chot | da-thay | bo), nguoi_chu.
- Một thông tin một chỗ. Chỗ khác chỉ trỏ tới bằng mã, không chép lại.
- Chỉ Tùng chốt. AI chỉ đổi trang_thai sang da-chot khi Tùng chốt trong phiên "Tôi là Tùng" (CLAUDE.md).
- Đổi nghĩa một mục có mã thì tăng phiên bản và làm theo docs/process/CL6-thay-doi.md.
- Mọi lần sửa file (trừ INDEX.md, templates): tăng rev, thêm dòng Lịch sử sửa đổi, gắn thẻ [rN · thêm|sửa|bỏ] ở mục bị đổi. Làm theo CL12, dùng skill sua-tai-lieu. Đổi nghĩa một mục có mã thì dùng skill doi-yeu-cau (CL6).
- Bảng Lịch sử sửa đổi trong file chỉ giữ 5 dòng mới nhất. Dòng cũ chuyển sang docs/_lich-su/<cùng đường dẫn>.md (CL12.3). Không chép câu nguyên văn của Tùng vào lịch sử, chỉ ghi mã QD hay mã câu hỏi.
- Không đọc docs/_lich-su/ trừ khi được nhờ hoặc khi review cần.
- Review ghi thành file work/reviews/RVn, ghi rõ rev và commit đã đọc. Dùng /review-tai-lieu.
- Mục chưa quyết ghi [MỞ: YC<n>-H<m>] (câu hỏi ở work/cau-hoi.md) hoặc [MỞ: QDx] (câu có nhiều phương án, chạm nhiều YC). Thẻ chỉ trỏ tới mã đang mở, không ghi chữ tự do. Mục dựa trên giả định ghi "(giả định GDx)", giả định ở work/gia-dinh.md.
- File mới phải thêm một dòng vào docs/INDEX.md (cho tới khi có script sinh INDEX).
- Không đưa tên thật, số điện thoại người dùng vào repo.
