---
id: US60-KB
us: US60
rev: 1
---
# Kịch bản test tay US60 · Đặt phòng và yêu cầu của sale

Dữ liệu dùng chung theo docs/product/du-lieu-mau.md (DLM.6): Sale Hùng có B1 đã chốt, Y1 chờ, Y2 quá 2 tuần, Y3 tự hủy, Y4 bị từ chối, V2 tự ghi cho Villa Tuần Châu. Sale Lan có B2.
Cách ghi kết quả: đánh dấu ☑ OK hoặc ☑ NG, ngày, tên. NG thì ghi thấy gì và mở BG trỏ tới mã kịch bản (skill bao-loi). Cuối lượt test trả lời câu hỏi cải tiến và ghi CT ở work/cai-tien.md (skill test-tay). Chạy lại sau khi sửa thì thêm một dòng Kết quả mới, không xóa dòng cũ. Luật viết kịch bản: CL14.5a.

### US60-KB1 · Xem danh sách `[Chính]`
- **Mục đích:** sale biết từng yêu cầu đang ở bước nào mà không phải hỏi chủ nhà.
- **Làm:** đăng nhập Hùng, mở Thống kê, bấm "Xem tất cả đặt phòng và yêu cầu".
- **Mong đợi:** "ĐẶT PHÒNG CỦA TÔI", mới nhất trước. Y1 "Chờ chủ" có giờ gửi, không có tiền chênh. B1 "Đã chốt" ghi "chênh 400.000đ". Y4 "Bị từ chối" kèm lý do. Y2 "Hết hạn". Y3 "Đã hủy". Không có V2. Cuối có chú thích các nhãn.
- **Nguồn:** YC11.3-NT1, YC11.3-NT2, YC11.3-NT3, YC11.3-NT4, YC11.3-NT5, YC11.3-NT8
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US60-KB2 · Chạm một dòng, đặt phòng ghi giúp `[Chính]`
- **Làm:** chạm Y4, quay lại. Chạm B1, quay lại. Ở S7 chạm Y1. Đăng nhập Chị Hoa ghi 1509 10/10 → 12/10 cho Hùng, rồi Hùng mở lại danh sách.
- **Mong đợi:** Y4 mở màn bị từ chối, B1 mở chi tiết đặt phòng, Y1 mở màn đang chờ. Có dòng 1509 · 10/10 → 12/10 "Đã chốt", chênh 400.000đ, "Chị Hoa đã ghi giúp bạn".
- **Nguồn:** YC11.3-NT6, YC11.3-NT9
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US60-KB3 · Quyền và danh sách trống `[Biên]`
- **Làm:** đăng nhập Lan mở danh sách. Dùng sale mới chưa gửi yêu cầu nào, mở danh sách. Tắt mạng rồi mở.
- **Mong đợi:** Lan không thấy dòng nào của Hùng. Sale mới thấy "Chưa có yêu cầu nào" và nút "Tìm phòng". Mất mạng có báo và nút thử lại.
- **Nguồn:** YC11.3-NT7, HV1-NT1, HV2-NT1
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**
