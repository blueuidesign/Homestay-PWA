---
name: xem-tinh-hinh
description: "Cho biết một mảng việc đã tới đâu: một yêu cầu YC hoặc bảng các User Story, kèm item nào đang làm, đang chờ ai, câu hỏi nào còn mở, US nào đang code theo đặc tả cũ. Dùng khi người dùng hỏi kiểu: \"YC5 tới đâu rồi\", \"tình hình YC1\", \"US nào đang chờ test\", \"US nào chờ nghiệm thu\", \"liệt kê các US\", \"US12 đang ở đâu\". Không dùng khi hỏi chung \"tôi cần làm gì\" (dùng can-lam-gi), hoặc khi được bảo làm, code, sửa một item (dùng lam-mot-item)."
argument-hint: "<YC1 | US12 | us [YC4 | cho-test | cho-nghiem-thu]>"
model: sonnet
---

Phạm vi: $ARGUMENTS. Chỉ đọc. Dữ liệu item lấy từ work/plan/bang.json (chạy `python3 scripts/plan.py` nếu cũ), không đọc thân từng file item.

**YC:** các YC con, trạng thái quyết định, câu hỏi mở của YC đó trong work/cau-hoi.md, item nào làm yêu cầu đó (trường thuc_hien). YC không có item nào trỏ tới thì nói rõ chưa có ai làm.

**Một item (US12, EN54...):** trạng thái, task nào xong, task nào còn, đang chờ ai, PR.

**us:** một bảng, một dòng một US chưa huy, xếp theo YC đầu tiên trong `thuc_hien` rồi số US. Lọc theo YC hoặc cột nếu có. Cột:
| US (link) | Mô tả | YC | Trạng thái | Model (đếm task Code theo model, ví dụ "opus 3 · sonnet 2") | PR | Nghiệm thu | Đang chờ |
Cột Nghiệm thu lấy từ trường `nghiem_thu` (co, khong). Cột Đang chờ lấy từ `dang_cho` của bang.json. Mục trong `thuc_hien` có bản mới hơn `@bản` đã ghi thì ghi "Đặc tả đổi". Dưới bảng một dòng đếm: chờ Đức test, chờ Tùng nghiệm thu, đang code, bị chặn.

Item có mọi task Code đã đánh dấu mà vẫn ở `dang-lam` thì ghi "sai trạng thái, chạy gop-code hoặc sửa tay". Không tả lại nội dung US. Chưa code, Chưa test, Test lỗi không được gọi là xong.
