---
name: nghiem-thu
description: "Giúp Tùng nghiệm thu một US đã được Đức test đạt: đưa danh sách ngắn những gì cần tự thử trên điện thoại theo tiêu chí nghiệm thu, nhận đạt hoặc không đạt, rồi đóng item hoặc mở lỗi. Cũng dùng để Tùng chọn US nào cần nghiệm thu, vì mặc định US không cần (CL2.9). Dùng khi Tùng nói kiểu: \"nghiệm thu US12\", \"tôi muốn tự kiểm US3\", \"US12 đạt\", \"US16 không đạt vì ...\", \"US nào chờ tôi nghiệm thu\", \"đánh dấu US7 cần nghiệm thu\". Không dùng cho EN, BG (không có bước nghiệm thu), cho task Thiết kế (kiểm bằng kiem-thiet-ke), hoặc khi Đức chưa test xong."
argument-hint: "<US12 [dat | khong-dat <lý do>] | chon US3 US7 | danh-sach>"
---

Yêu cầu: $ARGUMENTS. Chỉ Tùng nghiệm thu. Câu đầu phiên không phải "Tôi là Tùng" thì không ghi kết quả, chỉ soạn danh sách.

**danh-sach:** liệt kê US đang `cho-nghiem-thu`, và US Đức vừa test đạt trong 7 ngày qua để Tùng chọn có nghiệm thu không. Xếp rủi ro cao lên đầu. Mỗi dòng: mã có link, tên, rủi ro, ngày Đức test đạt.

**chon <các US>:** ghi `nghiem_thu: co` vào từng US. US đã sang `xong` thì đưa về `cho-nghiem-thu`. Đẩy lên main.

**<US> (chưa có kết quả):** soạn cho Tùng danh sách kiểm, tối đa 8 dòng, mỗi dòng một việc làm trên điện thoại kèm điều phải thấy. Lấy từ task Nghiệm thu của US và các NT ở mục "Làm tiêu chí nào", ưu tiên NT chạm tiền, quyền, chặn trùng. Ghi rõ dữ liệu mẫu và tài khoản cần dùng. Kèm các CT đang mở của US đó trong work/cai-tien.md để Tùng xem luôn.

**<US> dat:** đánh dấu task Nghiệm thu, US sang `xong`, chuyển file vào work/backlog/done/<yyyy-mm>/, xóa gói việc của US trong work/goi/, một dòng nhật ký. Đẩy lên main, chạy `python3 scripts/plan.py`.

**<US> khong-dat <lý do>:** mỗi điểm sai yêu cầu chạy bao-loi. Điểm không sai yêu cầu nhưng Tùng muốn khác thì ghi CT, hoặc chạy doi-yeu-cau nếu Tùng muốn đổi luôn. US về `cho-test` khi có BG, để Đức thử lại sau khi sửa.
