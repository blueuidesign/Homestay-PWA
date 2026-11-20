---
id: US58-KB
us: US58
rev: 2
---
# Kịch bản test tay US58 · Thống kê của chủ nhà

Dữ liệu dùng chung theo docs/product/du-lieu-mau.md (DLM.5): Chị Hoa có 1509 và 3402; tháng 10 có đặt phòng của Sale Hùng, Sale Lan, Sale Minh và khách lẻ; B2, B5 chưa cọc. Ngày thử coi như 07/10/2026.
Cách ghi kết quả: đánh dấu ☑ OK hoặc ☑ NG, ngày, tên. NG thì ghi thấy gì và mở BG trỏ tới mã kịch bản (skill bao-loi). Cuối lượt test trả lời câu hỏi cải tiến và ghi CT ở work/cai-tien.md (skill test-tay). Chạy lại sau khi sửa thì thêm một dòng Kết quả mới, không xóa dòng cũ. Luật viết kịch bản: CL14.5a.

### US58-KB1 · Xem thống kê tháng `[Chính]`
- **Mục đích:** chủ nhà biết tháng này thu bao nhiêu mà không phải cộng tay.
- **Làm:** đăng nhập Chị Hoa, mở tab Thống kê.
- **Mong đợi:** "DOANH THU THÁNG 10 11.800.000đ", "+22.9% so với tháng 9". 1509 6.700.000đ, 3402 5.100.000đ. "ĐÊM CÓ KHÁCH 13/62", "CÔNG SUẤT 21.0%". Biểu đồ 6 cột T5 đến T10, cột T10 đậm, số rút gọn kiểu "11.8tr". Theo người bán: Sale Hùng 4.000.000đ, Sale Lan 3.500.000đ, Khách lẻ 2.600.000đ, Sale Minh 1.700.000đ. Không có giá bán hay tiền chênh của sale ở đâu cả.
- **Nguồn:** YC11.1-NT1, YC11.1-NT2, YC11.1-NT3, YC11.1-NT6, YC11.1-NT7, YC11.1-NT8
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US58-KB2 · Chưa thu tiền và đổi tháng `[Chính]`
- **Làm:** xem mục "CHƯA THU TIỀN". Mở B2, đánh dấu đã thu đủ, quay lại. Chạm T11, rồi chạm › tới tháng 12.
- **Mong đợi:** "CHƯA THU TIỀN 3.700.000đ", B2 ghi "Chưa cọc · nhận phòng sau 10 ngày". Thu đủ B2 thì B2 biến khỏi mục. Đổi tháng thì tiêu đề và mọi số đổi theo; tháng 12 biểu đồ gồm T7 đến T12, cột T12 đậm.
- **Nguồn:** YC11.1-NT5, YC11.1-NT9, YC11.1-NT10
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US58-KB3 · Tháng trống, đặt phòng vắt tháng, căn mới `[Biên]`
- **Làm:** chạm tới tháng chưa có đặt phòng. Ghi một đặt phòng 31/10 → 02/11 rồi xem tháng 10 và 11. Xem "CHƯA THU TIỀN" khi có đặt phòng đã cọc (B1). Thêm một căn giữa tháng rồi xem công suất. Tắt mạng rồi mở tab.
- **Mong đợi:** tháng trống ghi 0đ, không có dòng so sánh, có "Chưa có đặt phòng trong tháng." và "Không có khoản nào chưa thu.". Tiền đêm 31/10 vào tháng 10, đêm 01/11 vào tháng 11. Đặt phòng đã cọc không có trong "CHƯA THU TIỀN". Căn mới chỉ tính số đêm từ ngày thêm vào mẫu số. Mất mạng có báo và nút thử lại.
- **Nguồn:** YC11.1-NT4, YC11.1-NT11, YC11.1-NT12, YC11.1-NT13, HV1-NT1, HV2-NT1
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**
