---
name: hop-cuoi-tuan
description: "Soạn sẵn nội dung cho buổi họp 30 phút chiều thứ Sáu giữa Tùng và Đức (CL1.3): item xong trong tuần, việc đang ứ ở cột nào so với trần, câu hỏi mở đang chặn việc, điểm cải tiến CT mới chờ Tùng chọn hướng, US Đức vừa test đạt để Tùng chọn có nghiệm thu không, đề xuất thứ tự việc tuần tới. Dùng khi người dùng nói kiểu: \"họp cuối tuần\", \"chuẩn bị họp thứ Sáu\", \"xem tuần\", \"tuần này làm được gì\", \"tổng kết tuần\". Không dùng cho câu hỏi hôm nay làm gì (dùng can-lam-gi), không tự sửa THU-TU.md hay trạng thái CT."
argument-hint: "[ngày thứ Sáu, mặc định tuần này]"
model: sonnet
---

Tuần: $ARGUMENTS (không có thì tính 7 ngày tới hôm nay). Chỉ đọc, không sửa file. Thay cho lệnh "xem tuần" cũ (CL5.11).

Đọc work/plan/bang.json (chạy `python3 scripts/plan.py` nếu cũ), work/cau-hoi.md, work/cai-tien.md, docs/decisions/INDEX.md, `git log --since` trên work/backlog để biết item nào đổi trạng thái trong tuần. Không đọc thân từng item trừ khi cần ước lượng và thực tế.

Chạy thêm `python3 scripts/log-tong.py --tu <ngày đầu tuần>` để lấy chi phí và dấu hiệu lệch quy trình (CL10.7).

Soạn bảy mục, mỗi mục ngắn, mã có link:
1. **Xong trong tuần:** item sang xong, kèm ước lượng và thực tế nếu có. Một câu nhận xét lệch nhiều nhất.
2. **Luồng việc:** số item ở dang-lam, cho-test, cho-nghiem-thu so với trần (CL1.2). Item có cờ "Code đã xong, chưa đổi trạng thái" thì liệt kê để sửa.
3. **Câu hỏi mở chặn việc:** xếp theo số item bị chặn, mỗi câu một dòng kèm item bị chặn.
4. **Điểm cải tiến mới:** các CT `mo` trong work/cai-tien.md. Mỗi CT một dòng và gợi ý một trong bốn hướng (sửa thiết kế, sửa đặc tả, để dành, bỏ) kèm lý do ngắn. Tùng quyết, phiên sau ghi.
5. **Chọn nghiệm thu:** US Đức test đạt trong tuần, rủi ro cao lên đầu, để Tùng chọn US nào tự kiểm (skill nghiem-thu).
6. **Chi phí và quy trình:** tổng USD của tuần, item tốn nhất, và các dòng trong "Dấu hiệu cần xem lại" của log-tong. Lặp lại từ hai lần trở lên thì gợi ý sửa skill hay rule nào. Chưa có log thì bỏ mục này.
7. **Đề xuất thứ tự tuần tới:** 3 đến 5 việc đầu THU-TU.md nên đổi chỗ không, vì sao. Chỉ đề xuất, Tùng sắp (CL4.3.2).

Cuối cùng nhắc mỗi người ghi một dòng "điều gì làm chậm tuần này".
