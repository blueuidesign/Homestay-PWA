---
id: US25-KB
us: US25
rev: 1
---
# Kịch bản test tay US25 · Những đêm tính giá cuối tuần

Dữ liệu dùng chung theo docs/product/du-lieu-mau.md: Chị Hoa (1509 tháng 10/2026: ngày thường 900.000đ, cuối tuần 1.300.000đ), Sale Hùng.
Cách ghi kết quả: đánh dấu ☑ OK hoặc ☑ NG, ngày, tên. NG thì ghi thấy gì và mở BG trỏ tới mã kịch bản (skill bao-loi). Cuối lượt test trả lời câu hỏi cải tiến và ghi CT ở work/cai-tien.md (skill test-tay). Chạy lại sau khi sửa thì thêm một dòng Kết quả mới, không xóa dòng cũ. Luật viết kịch bản: CL14.5a.

### US25-KB1 · Đổi đêm cuối tuần sang T7 và CN `[Chính]`
- **Mục đích:** chủ nhà tính giá cuối tuần theo thói quen của khu mình.
- **Chuẩn bị:** đăng nhập Chị Hoa (đang chọn T6, T7).
- **Làm:**
  1. Vào Cá nhân, chạm "Ngày tính giá cuối tuần".
  2. Tắt T6, bật CN, bấm "Lưu thay đổi".
  3. Mở tab Giá của 1509, xem hai ô giá và lịch giá tháng 10.
- **Mong đợi:**
  - Bước 2: về Cá nhân, toast "Đã lưu ngày tính giá cuối tuần".
  - Bước 3: ô giá ghi "Cuối tuần (T7, CN)" và "Ngày thường (T2–T6)"; đêm 11/10 (CN) ghi "1,3tr".
- **Nguồn:** YC4.6-NT1, NT2
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US25-KB2 · Không tắt được đêm cuối cùng `[Biên]`
- **Mục đích:** luôn còn ít nhất một đêm cuối tuần.
- **Chuẩn bị:** màn "Ngày tính giá cuối tuần", đang chọn hai đêm.
- **Làm:** tắt một đêm, rồi chạm đêm còn lại.
- **Mong đợi:** đêm còn lại vẫn sáng, không tắt được.
- **Nguồn:** YC4.6-NT4
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

## Lịch sử sửa đổi
| Rev | Ngày | Người | Commit hoặc PR | Thay đổi | Mục bị đổi |
|---|---|---|---|---|---|
| r1 | 2026-11-19 | Claude | main | Bản đầu (QD25) | Cả file |
