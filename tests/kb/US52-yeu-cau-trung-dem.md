---
id: US52-KB
us: US52
rev: 1
---
# Kịch bản test tay US52 · Yêu cầu trùng đêm

Dữ liệu dùng chung theo docs/product/du-lieu-mau.md: Chị Hoa (ICON40 1509), Sale Hùng gửi yêu cầu 17/10 → 19/10, Sale Lan gửi yêu cầu 18/10 → 19/10.
Cách ghi kết quả: đánh dấu ☑ OK hoặc ☑ NG, ngày, tên. NG thì ghi thấy gì và mở BG trỏ tới mã kịch bản (skill bao-loi). Cuối lượt test trả lời câu hỏi cải tiến và ghi CT ở work/cai-tien.md (skill test-tay). Chạy lại sau khi sửa thì thêm một dòng Kết quả mới, không xóa dòng cũ. Luật viết kịch bản: CL14.5a.

### US52-KB1 · Chấp nhận một trong hai yêu cầu trùng `[Chính]`
- **Mục đích:** một đêm chỉ một bên thắng, bên kia được báo ngay.
- **Làm:** Chị Hoa mở tab Lịch, xem hai dòng yêu cầu. Mở yêu cầu của Hùng, bấm "Chấp nhận đặt phòng". Lan mở thông báo.
- **Mong đợi:** mỗi dòng có nhãn trùng ngày; màn trả lời ghi "Trùng 18/10 với yêu cầu của Sale Lan...". Chấp nhận xong ghi thêm "Yêu cầu của Sale Lan (18/10 → 19/10) đã bị từ chối. Sale Lan được báo." Yêu cầu của Lan có nhãn "Bị từ chối"; thông báo của Lan không có tên Hùng, giá của Hùng, tên khách.
- **Nguồn:** YC9.3-NT1, YC9.3-NT2, YC9.3-NT3
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US52-KB2 · Chủ nhà tự ghi đặt phòng trùng `[Biên]`
- **Làm:** Lan gửi lại yêu cầu 1509 cho một đêm còn trống. Chị Hoa tự ghi đặt phòng chồng đêm đó.
- **Mong đợi:** yêu cầu của Lan sang "Bị từ chối", Lan được báo.
- **Nguồn:** YC9.3-NT5
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US52-KB3 · Hai máy chấp nhận cùng lúc `[Biên]`
- **Làm:** mở hai yêu cầu trùng đêm trên hai máy đăng nhập cùng tài khoản Chị Hoa, bấm chấp nhận gần như cùng lúc.
- **Mong đợi:** chỉ một máy báo đã nhận; lịch chỉ có một đặt phòng; máy kia báo yêu cầu đã đổi trạng thái.
- **Nguồn:** YC9.3-NT4
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**
