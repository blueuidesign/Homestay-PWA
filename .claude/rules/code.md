---
paths:
  - "src/**"
  - "tests/**"
  - "infra/**"
---
# Quy ước khi viết code

- Chỉ code theo mục đã da-chot. Câu có [MỞ: QD...] thì không code theo. Câu có [GIẢ ĐỊNH: GD...] thì code được và ghi rõ trong PR.
- Code luôn trên nhánh <mã>-<tên-ngắn> và PR (CL4.7). Hook trước khi đẩy chặn commit code lên main.
- Đọc gói việc (work/goi/<mã item>.md, soạn bằng scripts/goi.py) nếu có, không thì đọc item. Tài liệu đọc bằng scripts/trich.py, không mở cả file. Canvas đọc bằng scripts/trich-man.py.
- Chỉ sửa file trong mục Phạm vi của item hoặc ô "Được sửa" của gói việc. File ngoài phạm vi thì dừng và tạo item mới.
- Mỗi test mang mã tiêu chí nó kiểm, ví dụ test_YC5_1_NT2. Tiêu chí chưa có test thì item chưa xong. Không tắt, xóa, sửa test để cho qua.
- Test ở đúng lớp (CL14.5): chặn trùng, tiền ở db và server; quyền ở tests/permissions; màn hiện đúng thứ server gửi ở test:ghep. Test frontend trên server giả chỉ dùng cho trạng thái màn.
- Task được giao sau một task viết test trước thì không sửa file test của task đó.
- Giá và quyền tính ở server. Mini App chỉ hiển thị cái server gửi. Chủ nhà tắt "hiện giá cho sale" thì server không gửi giá đi.
- Tiền là số nguyên đồng. Ngày theo giờ Việt Nam. Booking chiếm các đêm từ ngày nhận tới trước ngày trả.
- Chặn trùng booking bằng ràng buộc ở database, không chỉ kiểm ở giao diện.
- Tên, số điện thoại khách chỉ lưu trong booking theo QD11. Không ghi log chứa số điện thoại, tên khách.
- Không đọc .env. App Secret và khóa production không bao giờ có trong code, test, log hay phiên cloud.
- Giao diện: vùng bấm 44 px; cỡ chữ theo CL13.4 (màn đọc 14 px, màn dày thông tin 12–13 px, không dưới 12 px), cỡ cụ thể lấy theo canvas. Mọi màn có đủ trạng thái trong khuôn yc.md: rỗng, đang tải, lỗi mạng, không có quyền, đã từ chối quyền Zalo, quay lại từ nền, mở từ link.
- Không dùng localStorage, cookie. Bản build dưới 10 MB, mỗi file dưới 3 MB. Chi tiết: docs/external/zalo-rang-buoc.md.
- Đổi cấu trúc module hay thêm thư viện cần Đức duyệt (CL4.2).
- Trước khi báo xong: chạy test của gói bị đổi, build Mini App bằng `npx vite build --outDir www`, chạy `python3 scripts/kiem.py --diff origin/main`, dán lệnh và kết quả.
