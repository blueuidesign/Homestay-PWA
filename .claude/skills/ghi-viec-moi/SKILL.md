---
name: ghi-viec-moi
description: "Ghi lại một việc mới hoặc một câu hỏi chưa có lời đáp, để làm sau: việc thành item mới có mã trong work/backlog, câu hỏi về sản phẩm thành câu hỏi mở trong work/cau-hoi.md. Dùng khi người dùng nói kiểu: \"ghi lại\", \"note lại\", \"thêm việc\", \"cần làm thêm ...\", \"sau này phải ...\", \"để dành làm sau\", \"chưa biết ... thế nào, ghi câu hỏi\", hoặc khi đang làm việc khác mà gặp việc ngoài phạm vi hay chỗ đặc tả không nói rõ. Không dùng cho lỗi app chạy sai (dùng bao-loi), điểm khó dùng sau khi test (ghi CT bằng test-tay), quyết định Tùng vừa chốt (dùng chot-quyet-dinh), hoặc khi được bảo làm ngay (dùng lam-mot-item)."
argument-hint: "<ý cần ghi>"
---

Ý cần ghi: $ARGUMENTS

- Ý là việc cần làm: tạo item theo docs/process/templates/item.md (US theo us.md), `trang_thai: moi`. Đoán loại và cha, ghi `nguon`. Cấp mã theo CL3.1 mục 6 (số lớn nhất của loại đó, gồm cả done/ và tên các nhánh trên GitHub, cộng 1). Không đoán được loại thì hỏi một câu.
- Ý là câu hỏi chưa có câu trả lời về sản phẩm: thêm vào work/cau-hoi.md theo cách ghi ở đầu file đó. Mã `YC<n>-H<m>`, m là số lớn nhất của YC đó cộng 1. Gắn `[MỞ: YC<n>-H<m>]` vào đúng câu bị ảnh hưởng trong YC nếu câu hỏi chặn việc. Thẻ MỞ chỉ ghi mã, không ghi chữ tự do. Câu hỏi có nhiều phương án thật và chạm nhiều YC thì soạn QD cho-chot thay vì câu hỏi.
- Không thêm vào THU-TU.md, vì thứ tự chỉ Tùng sắp.

Báo lại mã, loại, cha đã đoán.
