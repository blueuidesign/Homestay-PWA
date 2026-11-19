---
id: US1-KB
us: US1
rev: 1
---
# Kịch bản test tay US1 · Màn đầu và chọn vai

Dữ liệu dùng chung theo docs/product/du-lieu-mau.md. Cần một email thật của người test chưa có tài khoản. Không ghi email, số thật vào file này.
Cách ghi kết quả: đánh dấu ☑ OK hoặc ☑ NG, ngày, tên. NG thì ghi thấy gì và mở BG trỏ tới mã kịch bản (skill bao-loi). Cuối lượt test trả lời câu hỏi cải tiến và ghi CT ở work/cai-tien.md (skill test-tay). Chạy lại sau khi sửa thì thêm một dòng Kết quả mới, không xóa dòng cũ. Luật viết kịch bản: CL14.5a.

### US1-KB1 · Mở app lần đầu `[Chính]`
- **Mục đích:** màn đầu không hỏi gì, không xin quyền gì.
- **Chuẩn bị:** trình duyệt chưa mở app này bao giờ (hoặc xóa dữ liệu trang).
- **Làm:**
  1. Mở app.
- **Mong đợi:**
  - Thấy "Lịch phòng Hạ Long", ba dòng giới thiệu, nút "Tạo tài khoản", nút "Tôi đã có tài khoản · Đăng nhập", link Điều khoản và Chính sách quyền riêng tư.
  - Không có ô nhập, không có hộp thoại xin quyền (vị trí, thông báo, máy ảnh).
- **Nguồn:** YC1.1-NT1, HV4-NT5
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US1-KB2 · Chọn vai chủ nhà `[Chính]`
- **Mục đích:** người mới chọn vai rồi vào tab Lịch.
- **Chuẩn bị:** email chưa có tài khoản.
- **Làm:**
  1. Tạo tài khoản theo US2-KB1, tới màn "Bạn dùng app để làm gì?".
  2. Chưa chạm thẻ nào, nhìn nút "Tiếp tục".
  3. Chạm "Tôi là sale", rồi chạm "Tôi là chủ nhà".
  4. Bấm "Tiếp tục".
- **Mong đợi:**
  - Bước 2: "Tiếp tục" mờ, có dòng "Chọn một mục để tiếp tục".
  - Bước 3: chỉ thẻ chủ nhà có dấu ✓.
  - Bước 4: vào tab Lịch của chủ nhà.
- **Nguồn:** YC1.1-NT2, NT3, NT4, NT5
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US1-KB3 · Mở lại app sau khi đã chọn vai `[Chính]`
- **Mục đích:** người cũ vào thẳng tab Lịch.
- **Chuẩn bị:** tài khoản ở KB2.
- **Làm:**
  1. Đóng hẳn app, mở lại.
- **Mong đợi:**
  - Vào thẳng tab Lịch, không thấy màn đầu hay màn chọn vai.
- **Nguồn:** YC1.1-NT6
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

## Lịch sử sửa đổi
| Rev | Ngày | Người | Commit hoặc PR | Thay đổi | Mục bị đổi |
|---|---|---|---|---|---|
| r1 | 2026-11-19 | Claude | US1-man-dau-chon-vai | Bản đầu (QD25) | Cả file |
