---
name: test-tay
description: "Giúp Đức test tay một US hoặc BG trên điện thoại: đưa từng kịch bản trong tests/kb, ghi kết quả đạt hoặc không đạt, mở lỗi khi không đạt, cuối cùng hỏi Đức có chỗ nào người mới sẽ thấy khó dùng không và ghi lại thành điểm cải tiến CT, rồi đổi trạng thái item. Có hai chế độ: nhanh (chỉ các kịch bản luồng chính, khoảng 5 phút) và đủ (mọi kịch bản, cả ca biên). Dùng khi Đức nói kiểu: \"test US12\", \"test nhanh US3\", \"test đủ US16\", \"thử lại BG3\", \"tôi test xong US12 rồi\", \"KB2 NG\", \"ghi kết quả test\", hoặc hỏi cách test một US. Không dùng để viết kịch bản mới (sửa tests/kb theo CL14.5a), không dùng cho test tự động (chạy trong lam-mot-item và CI)."
argument-hint: "<US12 | BG3> [nhanh | du]"
---

Item và chế độ: $ARGUMENTS. Không nói chế độ thì: lần đầu test item này chạy `nhanh`, đã đạt `nhanh` rồi thì chạy `du`. BG thì chạy lại bước tái hiện ghi trong BG, cộng kịch bản `nguon` nếu có.

1. **Chuẩn bị.** Đọc phần đầu tests/kb/<item>.md: dữ liệu mẫu cần nạp, tài khoản Zalo thử, ngày giả lập. Hỏi Đức server đang chạy ở đâu (máy cá nhân hay server thử) và bản Mini App nào. Server chưa chạy thì gợi ý skill chay-tren-may.
2. **Chọn kịch bản.** `nhanh`: chỉ kịch bản gắn `[Chính]`. `du`: mọi kịch bản, `[Chính]` trước rồi `[Biên]`. Rủi ro cao thì `du` chạy trên cả iPhone và Android (CL6.3).
3. **Đi từng kịch bản.** Đưa Đức mục Làm và Mong đợi của một kịch bản, chờ Đức trả lời đạt hay không đạt. Không đạt thì hỏi thấy gì, máy nào, có ảnh không.
4. **Ghi kết quả** ngay sau mỗi kịch bản vào dòng Kết quả của kịch bản đó trong tests/kb/<item>.md: ☑ OK hoặc ☑ NG, ngày, Đức, máy. Chạy lại thì thêm dòng Kết quả mới, không xóa dòng cũ. Không đạt thì chạy bao-loi với mã kịch bản. Không tăng rev file kịch bản vì chỉ ghi kết quả.
5. **Câu hỏi cải tiến, luôn hỏi khi xong lượt, kể cả khi mọi kịch bản đạt:** "Có chỗ nào anh thấy hơi khó dùng, khó hiểu, hay phải nghĩ một chút mới làm được, nếu là người mới dùng lần đầu không?" Phải có câu trả lời, không bỏ qua. Đức nói có thì mỗi điểm ghi một mục CT vào work/cai-tien.md theo cách ghi ở đầu file đó: màn, chỗ thấy khó, Đức đoán người mới vướng ở đâu, ảnh nếu có, item nguồn. Không tạo BG cho CT.
6. **Đổi trạng thái theo CL2.9.**
   - `nhanh` có kịch bản không đạt: giữ `cho-test`, BG vừa mở đứng đầu hàng việc.
   - `nhanh` đạt hết: giữ `cho-test`, báo Đức chạy `du` khi có thời gian.
   - `du` đạt hết: đánh dấu task Test tay. US có `nghiem_thu: co` thì sang `cho-nghiem-thu`. Còn lại sang `xong`, chuyển file vào work/backlog/done/<yyyy-mm>/, xóa gói việc của item trong work/goi/.
7. **Ghi và đẩy.** Một dòng nhật ký dưới 200 ký tự trong file item. Đẩy tests/kb, work/cai-tien.md và file item lên main, commit mở đầu bằng mã item. Chạy `python3 scripts/plan.py`.
8. **Báo** ba dòng: số kịch bản đạt trên tổng, BG và CT vừa ghi, trạng thái mới và việc kế.
