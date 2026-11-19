---
name: bao-loi
description: "Ghi một lỗi khi app chạy sai so với yêu cầu: kiểm lỗi đã ghi chưa, tạo item BG, tìm yêu cầu bị làm sai, đánh giá mức độ, báo ngay nếu lộ dữ liệu hay sai tiền. Dùng khi người dùng nói kiểu: \"bị lỗi\", \"app không chạy\", \"bấm mà không thấy gì\", \"hiện sai\", \"sai giá\", \"khách báo ...\", \"Đức test thấy NG\", hoặc khi một kịch bản test tay không đạt. Không dùng khi app chạy đúng yêu cầu nhưng khó dùng, khó hiểu (đó là cải tiến, ghi CT bằng test-tay), khi yêu cầu chưa nói tới chuyện đó (ghi câu hỏi bằng ghi-viec-moi), hoặc khi được bảo sửa ngay một BG đã có (dùng lam-mot-item)."
argument-hint: "<mô tả lỗi>"
---

Lỗi: $ARGUMENTS

0. **Kiểm trùng trước.** Tìm trong BG đang mở (work/backlog/BG*.md) và sổ work/EN60-loi-khi-test.md theo màn, mã kịch bản, chữ chính trong mô tả. Đã có thì thêm một dòng nhật ký vào BG cũ (lần gặp lại, ai gặp, máy nào), không tạo BG mới. Người báo là Đức mà chưa nói kịch bản nào thì hỏi mã kịch bản (ví dụ US3-KB2) hoặc các bước tái hiện.
1. Tạo BG theo khuôn item.md, `thuc_hien` trỏ tới YC và bản bị làm sai. Lỗi tìm ra khi test tay thì ghi mã kịch bản ở `nguon`. Ghi bước tái hiện, máy (iPhone, Android), thấy gì, mong đợi gì.
2. Không tìm được yêu cầu liên quan thì ghi vậy. Đó cũng là một phát hiện: đặc tả thiếu. Ghi thêm một câu hỏi mở bằng ghi-viec-moi.
3. Đánh giá `muc_do`. BG đứng đầu hàng đợi làm việc (CL1.2), không cần Tùng thêm vào đâu.
4. Lỗi lộ dữ liệu hoặc sai tiền: báo ngay ở dòng đầu câu trả lời.
