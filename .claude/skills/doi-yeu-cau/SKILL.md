---
name: doi-yeu-cau
description: "Thay đổi ý nghĩa của một yêu cầu, quy tắc hay quyết định đã có mã (YC, QT, PQ, HV, QD), không chỉ sửa câu chữ, rồi tìm mọi tài liệu, item, code, test đang dựa vào nó để sửa theo. Ví dụ YC5.2 đổi từ \"tìm phòng trả tối đa 5 căn\" sang 10 căn. Luôn dừng ở bước Tùng chốt. Dùng khi người dùng nói kiểu: \"đổi YC5.2 thành ...\", \"sửa quy tắc QT1 cho ...\", \"bỏ tính năng ... trong YC4\", \"thay đổi yêu cầu\", \"giờ muốn ... thay vì ...\". Không dùng khi chỉ sửa chính tả, câu chữ, thêm ví dụ không đổi nghĩa (dùng sua-tai-lieu), hoặc khi Tùng chốt một câu hỏi mở hay một QD đang chờ (dùng chot-quyet-dinh)."
argument-hint: "<mã>: <nội dung đổi>"
---

Yêu cầu: $ARGUMENTS. Làm theo docs/process/CL6-thay-doi.md và docs/process/CL12-phien-ban-va-review.md.

1. Đề xuất tăng bản hay "chỉ sửa chữ", nói lý do. Đổi số trong bảng ví dụ luôn là đổi nghĩa. Chỉ sửa chữ thì dừng skill này, chuyển sang sua-tai-lieu.
2. Sửa tài liệu theo sua-tai-lieu.
3. Dùng grep tìm mọi chỗ nhắc tới mã trong docs/, work/, src/, tests/. Liệt kê từng chỗ: sửa trong cùng PR, hoặc tạo DC, US, BG trỏ tới (CL6).
4. Mở PR cho Tùng chốt (CL4.3.1). Không đổi trang_thai sang da-chot, trừ khi Tùng nói rõ trong phiên "Tôi là Tùng" (CLAUDE.md).
