---
id: US22-KB
us: US22
rev: 1
---
# Kịch bản test tay US22 · Giá ngày lễ và dịp đặc biệt

Dữ liệu dùng chung theo docs/product/du-lieu-mau.md: Chị Hoa (căn 3402 có dịp 24/10 – 25/10 giá 1.300.000đ, căn 1509), Anh Tuấn, Sale Hùng. Dải ngày lễ chung của Home247 do quản trị nhập (YC13.2); chưa có thì chọn nhanh chỉ điền tên.
Cách ghi kết quả: đánh dấu ☑ OK hoặc ☑ NG, ngày, tên. NG thì ghi thấy gì và mở BG trỏ tới mã kịch bản (skill bao-loi). Cuối lượt test trả lời câu hỏi cải tiến và ghi CT ở work/cai-tien.md (skill test-tay). Chạy lại sau khi sửa thì thêm một dòng Kết quả mới, không xóa dòng cũ. Luật viết kịch bản: CL14.5a.

### US22-KB1 · Đặt giá dịp đặc biệt bỏ trống tên `[Chính]`
- **Mục đích:** chủ nhà đặt giá riêng cho vài ngày có sự kiện.
- **Chuẩn bị:** đăng nhập Chị Hoa, mở tab Giá của 1509.
- **Làm:**
  1. Bấm "Đặt giá ngày lễ, dịp đặc biệt".
  2. Chọn từ ngày 24/10, đến ngày 25/10, bỏ trống tên, giá 1.300.000, để tắt "Là ngày lễ".
  3. Bấm "Lưu giá".
- **Mong đợi:**
  - Bước 1: tiêu đề "Giá ngày lễ, dịp đặc biệt", "Phòng 1509" hay mã căn, bốn nút chọn nhanh.
  - Bước 2: dòng "2 ngày · T7 24/10 → CN 25/10", ô tên gợi ý "Dịp đặc biệt 24/10 – 25/10".
  - Bước 3: về tab Giá, toast "Đã lưu giá Dịp đặc biệt 24/10 – 25/10", dải ở mục "Dịp đặc biệt", lịch giá tháng 10 ghi "1,3tr" ở ngày 24 và 25.
- **Nguồn:** YC4.3-NT3, NT5
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US22-KB2 · Chọn nhanh ngày lễ `[Chính]`
- **Mục đích:** chủ nhà đặt giá lễ nhanh theo lịch nghỉ Home247 đặt sẵn.
- **Chuẩn bị:** quản trị đã nhập dải "Lễ 30/4 – 1/5" cho năm đang chọn ở tab Giá. Đăng nhập Chị Hoa, tab Giá của 3402.
- **Làm:** bấm "Đặt giá ngày lễ, dịp đặc biệt", chạm "Lễ 30/4 – 1/5", gõ giá 2.500.000, bấm "Lưu giá".
- **Mong đợi:** ô ngày điền đúng dải Home247 đặt, ô tên "Lễ 30/4 – 1/5", "Là ngày lễ" bật; lưu xong dải ở mục "Giá ngày lễ".
- **Nguồn:** YC4.3-NT1, NT4
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US22-KB3 · Quá 10 ngày `[Biên]`
- **Mục đích:** chủ nhà không lưu được dải quá dài.
- **Chuẩn bị:** như KB1.
- **Làm:** chọn từ ngày 24/12, đến ngày 05/01 năm sau.
- **Mong đợi:** dòng "13 ngày · T5 24/12 → T3 5/1", cảnh báo "Tối đa 10 ngày. Đang chọn 13 ngày, hãy rút ngắn ngày kết thúc.", nút "Lưu giá" không bấm được.
- **Nguồn:** YC4.3-NT2
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US22-KB4 · Trùng ngày với dịp đã có `[Biên]`
- **Mục đích:** hai dải của một căn không chồng ngày.
- **Chuẩn bị:** đăng nhập Chị Hoa, tab Giá của 3402 (đã có dịp 24/10 – 25/10).
- **Làm:** mở màn giá dịp, chọn 25/10 – 26/10, giá 1.500.000, bấm "Lưu giá". Sau đó đổi thành 26/10 – 27/10 rồi lưu lại.
- **Mong đợi:** lần đầu ở lại màn, dòng đỏ "Trùng ngày với Dịp đặc biệt (24/10 – 25/10). Đổi ngày rồi lưu lại.", dịp cũ giữ nguyên. Lần hai lưu được.
- **Nguồn:** YC4.3-NT6, NT8
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US22-KB5 · Chạm ngày trên lịch giá `[Biên]`
- **Mục đích:** mở nhanh màn giá dịp từ lịch.
- **Chuẩn bị:** tab Giá của 3402.
- **Làm:** chạm ngày 20 trên "Lịch giá tháng 10".
- **Mong đợi:** mở "Giá ngày lễ, dịp đặc biệt", từ ngày và đến ngày là 20/10.
- **Nguồn:** YC4.3 bước 1
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**
