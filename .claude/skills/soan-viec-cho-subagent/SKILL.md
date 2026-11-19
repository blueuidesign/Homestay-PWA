---
name: soan-viec-cho-subagent
description: "Soạn gói việc cho agent phụ trước khi giao code: chạy scripts/goi.py để chép nguyên văn đúng phần tiêu chí, ví dụ số, quyết định, API, màn, bất biến, quy ước code mà item cần vào work/goi/<mã item>.md, rồi điền hai ô cần phán đoán. Chủ yếu do lam-mot-item và lam-tu-dong tự gọi trước khi giao việc cho agent phụ. Người dùng cũng có thể gọi khi muốn xem trước agent sẽ nhận gì, ví dụ \"soạn gói việc US12\", \"agent sẽ đọc gì khi làm US3\", \"xem gói việc của EN54\". Không dùng khi phiên chính tự code item đó (không cần gói), hoặc cho item chưa có mục Đọc theo mã (sửa item bằng viet-user-story trước)."
argument-hint: "<mã item> [--task TA1,TA2]"
---

Item: $ARGUMENTS. Một gói cho cả item (CL10.6). Chỉ thêm `--task` khi phải tách agent vì một trong bốn lý do ở CL10.6, và ghi lý do vào ô Việc.

1. Chạy `python3 scripts/goi.py <mã item> --ghi`. Script chép bằng `trich.py --gon` mọi mã trong `thuc_hien`, "Làm tiêu chí nào" và mục Đọc, kèm một bậc QT, QD, HV mà chúng nhắc tới. Script báo mã không tìm thấy thì sửa mục Đọc của item (luật doc-ma), không tự đoán nội dung.
2. Điền hai ô script để trống:
   - **Làm theo mẫu:** 1 đến 2 file có sẵn làm việc giống nhất. Tìm bằng grep theo API, bảng, màn tương tự.
   - **Test ở lớp nào:** với từng NT rủi ro cao, lớp test theo bảng ở CL14.5. Có task viết test trước thì ghi file test agent sau không được sửa.
   Item chưa có mục Phạm vi thì ô Được sửa cũng trống: điền theo task, và báo người dùng để bổ sung Phạm vi vào item.
3. Đọc lướt gói một lần: ô nào nói "Không có" mà task rõ ràng cần (ví dụ task làm màn mà ô Màn trống) thì thêm mã vào mục Đọc của item rồi chạy lại bước 1.
4. Chọn model theo CL14.6a. Còn ô nào chưa điền được thì giao opus, không giao sonnet.
5. Báo một dòng: đường dẫn gói, khoảng bao nhiêu token, model, ô nào điền tay. Gói xóa khi item sang xong.
