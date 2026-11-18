---
name: sua-tai-lieu
description: "Sửa một file trong docs/ (YC, QT, QD, CL, HV, PQ, tài liệu kiến trúc, hạ tầng...) đúng quy ước phiên bản CL12: tăng rev, đánh dấu đoạn vừa sửa bằng thẻ [rN · thêm/sửa/bỏ], thêm dòng lịch sử, báo bài review nào cần đọc lại. Dùng mỗi khi sửa bất kỳ tài liệu nào trong docs/, kể cả sửa nhỏ, ví dụ \"sửa câu này trong YC3\", \"thêm ví dụ vào QT1\", \"cập nhật CL2\", \"ghi thông tin server vào ha-tang\". Không dùng khi việc sửa làm đổi ý nghĩa một yêu cầu đã có mã (dùng doi-yeu-cau, skill đó gọi lại skill này), và không dùng cho file trong work/, src/, tests/."
argument-hint: "<file> <nội dung cần sửa>"
---
Làm đúng docs/process/CL12-phien-ban-va-review.md. Yêu cầu: $ARGUMENTS

1. Kiểm file có thuộc CL12.1 không. INDEX.md, templates, chuc-nang thì sửa bình thường, không làm các bước dưới.
2. Đọc `rev` ở đầu file. Lần sửa này là rev + 1, trừ khi nhánh hiện tại đã tăng rev cho file này rồi (xem git diff với main). Một PR chỉ tăng một lần.
3. Sửa nội dung. Với mỗi mục bị đổi, gắn thẻ `[r<mới> · thêm|sửa|bỏ]` theo CL12.4. Thẻ cũ trên mục đó thì thay số, không xếp chồng.
4. Đổi nghĩa một yêu cầu hay quy tắc có mã thì tăng cả "bản" của mục đó và làm theo CL6. Chỉ sửa chữ thì không tăng bản.
5. Thêm một dòng vào `## Lịch sử sửa đổi`: rev, ngày hôm nay, người đang làm, tên nhánh (đổi thành số PR khi mở PR), tóm tắt ngắn, danh sách mục bị đổi kèm thêm/sửa/bỏ. Không chép câu nguyên văn, chỉ ghi mã QD hay mã câu hỏi. Bảng quá 5 dòng thì chuyển dòng cũ nhất sang docs/_lich-su/<cùng đường dẫn>.md (CL12.3).
6. Liệt kê các file work/reviews/RV*.md có đọc file này. Với mỗi file, nói nhận xét nào hết hiệu lực vì mục của nó vừa mang thẻ mới (CL12.6).
7. Không đổi trang_thai sang da-chot. Đó là việc của Tùng.
