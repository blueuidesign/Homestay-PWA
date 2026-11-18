---
name: review-code
description: "Nhờ một agent độc lập soát một PR hoặc một nhánh code: tiêu chí nghiệm thu có test đúng lớp không, có vi phạm quy tắc giá, quyền, chặn trùng không, có sửa file ngoài phạm vi hay nới test không. Agent review không đọc lời giải thích của người viết code. Chỉ chạy khi Tùng bảo. Dùng khi Tùng nói kiểu: \"review PR #102\", \"soát code US12\", \"kiểm tra lại nhánh này\", \"nhờ agent review\". Không dùng tự động sau mỗi PR (QD26), không dùng để review tài liệu (dùng review-tai-lieu)."
argument-hint: "<số PR hoặc tên nhánh> [mã item]"
---

Đối tượng: $ARGUMENTS. Chỉ chạy khi Tùng bảo (QD26).

1. Lưu diff ra file: `git diff origin/main...<nhánh> > work/goi/review-<mã item>.diff`. Không có mã item thì lấy từ tên nhánh.
2. Gọi agent `review` (.claude/agents/review.md), đưa: đường dẫn file diff, mã item, danh sách mã NT ở mục "Làm tiêu chí nào" của item. Không đưa nhật ký hay lời giải thích của agent đã viết code.
3. Nếu danh sách skill của phiên này có `code-review` thì chạy thêm để bắt lỗi code chung. Không có thì bỏ bước này, không đi tìm.
4. Đăng kết quả lên PR làm một bình luận. Dòng cuối giữ nguyên `REVIEW: dat` hoặc `REVIEW: khong-dat · commit <sha>`.
5. Báo Tùng: số lỗi theo mức, ba lỗi nặng nhất, có nên giao agent sửa không. Không tự sửa.
6. Xóa file diff tạm sau khi đăng.
