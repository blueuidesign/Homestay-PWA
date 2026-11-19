---
paths:
  - "work/**"
---
# Quy ước khi sửa work/

- Mỗi item một file work/backlog/<MÃ>-<ten-ngan>.md, theo mẫu trong docs/process/templates/.
- Loại item: US, EN, BG (QD21, CL2.1). Task nằm trong file item cha (US12-TA1). Việc thiết kế là task loại Thiết kế (CL13).
- Trạng thái item: moi, san-sang, dang-lam, cho-test, cho-nghiem-thu, xong, huy, on-hold (CL2.2). Không còn trong-sprint.
- Liên kết chỉ ghi ở một đầu: truoc, lien_quan, trung_voi, thay_cho, thuc_hien, nguon. US, BG luôn có thuc_hien kèm bản của mục YC.
- Nhật ký: mỗi lần một dòng dưới 200 ký tự: ngày · người · đã làm gì · PR · bất ngờ · mất bao lâu. Chỉ người làm item ghi.
- Quyết định của Tùng không ghi vào nhật ký. Ghi vào QD, hoặc đánh dấu câu hỏi đã trả lời trong work/cau-hoi.md, rồi nhật ký chỉ ghi mã.
- Kịch bản test tay ở tests/kb/, không ở file US (CL14.5a).
- Điều kiện xong là CL2.5. Loại item nào đi qua bước nào theo CL2.9, trạng thái do skill gop-code, test-tay, nghiem-thu đổi. Chưa đủ thì không ghi xong.
- Item xong chuyển vào work/backlog/done/<yyyy-mm>/. Mục Kế hoạch xóa khi sang xong.
- Giữ file item gọn, vì mỗi phiên làm item đọc lại nó nhiều lần. Task xong rút còn một dòng gồm mã và PR. Kế hoạch của task đã xong thì xóa. Bằng chứng chỉ ghi lệnh và kết quả ngắn, log dài để ở PR. kiem.py nhắc khi file quá 7.500 ký tự.
- Trần: tối đa 2 item có code ở dang-lam, item có code ở cho-test cộng cho-nghiem-thu tối đa 6 (CL1.2).
- Đổi THU-TU.md hay trần: chỉ Tùng (CL4.3.2). AI chỉ đề xuất.
- Việc phát sinh ngoài phạm vi: tạo item moi, không làm lẫn vào item đang làm.
- Câu hỏi mở về sản phẩm ghi ở work/cau-hoi.md, mã YC<n>-H<m> (skill ghi-viec-moi). Giả định ở work/gia-dinh.md, mã GD. Điểm khó dùng mà không phải lỗi ghi ở work/cai-tien.md, mã CT.
- Gói việc ở work/goi/<mã item>.md, soạn bằng scripts/goi.py (skill soan-viec-cho-subagent), xóa khi item xong.
- Item có can_duyet thì mở PR nháp xin duyệt trước, rồi dừng (CL4.5).
- Dòng [tự sinh] trong work/plan/ do scripts/plan.py ghi. Không sửa tay.
- Không đưa tên thật, số điện thoại người dùng vào repo.
