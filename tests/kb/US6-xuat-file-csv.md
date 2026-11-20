---
id: US6-KB
us: US6
rev: 1
---
# Kịch bản test tay US6 · Xuất file CSV

Dữ liệu dùng chung theo docs/product/du-lieu-mau.md: Chị Hoa (chủ nhà, căn 1509 và 3402, B1 đến B8 tháng 10), Sale Hùng, Anh Tuấn.
Cách ghi kết quả: đánh dấu ☑ OK hoặc ☑ NG, ngày, tên. NG thì ghi thấy gì và mở BG trỏ tới mã kịch bản (skill bao-loi). Cuối lượt test trả lời câu hỏi cải tiến và ghi CT ở work/cai-tien.md (skill test-tay). Luật viết kịch bản: CL14.5a.

### US6-KB1 · Đếm và xuất file tháng này `[Chính]`
- **Mục đích:** chủ nhà lấy được danh sách đặt phòng để tính trên Excel.
- **Chuẩn bị:** Chị Hoa có các đặt phòng trong tháng đang test (như B1 đến B8 của DLM.4).
- **Làm:** Cá nhân > "Xuất file Excel (CSV)". Xem số đặt phòng. Chọn "1509" rồi xem số. Bấm "📊 Xuất file Excel (CSV)".
- **Mong đợi:** chip "Tháng này" và "Tất cả" chọn sẵn; số đổi theo chip (tháng 10 của DLM: 8 rồi 4). Điện thoại mở bảng chia sẻ với file, hay tải file về và báo "Đã tải file về máy". Tên file "home247-dat-phong-<từ ngày>-<đến ngày>.csv".
- **Nguồn:** YC1.6-NT1
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US6-KB2 · Mở file bằng Excel và Google Sheets `[Chính]`
- **Mục đích:** file đọc được, không lỗi tiếng Việt, tiền tính được.
- **Chuẩn bị:** file của KB1.
- **Làm:** mở bằng Excel trên máy tính và bằng Google Sheets.
- **Mong đợi:** 11 cột theo thứ tự Căn · Ngày nhận · Ngày trả · Số đêm · Khách · SĐT · Sale · Tổng tiền · Đã cọc · Còn lại · Ghi chú; chữ tiếng Việt đúng dấu; tiền là số (2200000), cộng được; SĐT giữ số 0 đầu.
- **Nguồn:** YC1.6-NT2, YC1.6-NT3
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US6-KB3 · Không lộ khách và giá của sale `[Biên]`
- **Mục đích:** giữ hai lớp giá và khách riêng (QD11).
- **Chuẩn bị:** Sale Hùng ghi tên khách và tiền thu khách 2.600.000đ cho B1.
- **Làm:** Chị Hoa xuất file tháng 10.
- **Mong đợi:** dòng B1 có ô Khách, SĐT trống; không ô nào có 2600000. Khách Chị Hoa tự nhập thì có tên và số.
- **Nguồn:** YC1.6-NT4
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US6-KB4 · Khoảng không có đặt phòng, khoảng quá 1 năm `[Biên]`
- **Mục đích:** báo rõ khi không có gì để xuất.
- **Làm:** chọn "Tùy chọn" một tháng không có đặt phòng. Rồi chọn từ 01/01/2025 tới 31/10/2026.
- **Mong đợi:** lần đầu "0 đặt phòng" và "Khoảng thời gian này chưa có đặt phòng. Chọn khoảng khác.", nút xuất mờ. Lần hai "Chọn tối đa 1 năm", nút xuất mờ.
- **Nguồn:** YC1.6-NT6
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US6-KB5 · Sale không xuất được `[Biên]`
- **Mục đích:** PQ20.SALE.
- **Làm:** đăng nhập Sale Hùng, mở tab Cá nhân.
- **Mong đợi:** không có dòng "Xuất file Excel (CSV)". (Thử gọi thẳng database thì bị từ chối: test database YC1.6-NT5 đã kiểm.)
- **Nguồn:** YC1.6-NT5
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**
