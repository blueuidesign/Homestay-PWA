---
paths:
  - "src/**"
  - "supabase/**"
  - "tests/**"
---
# Quy ước khi viết code

- Chỉ code theo mục YC có trong `thuc_hien` của item. Câu có [MỞ: ...] thì không code phần đó. Câu có "(giả định GDn)" thì code được và ghi rõ trong PR.
- Code luôn trên nhánh <mã>-<tên-ngắn> và PR (CL4.7). Hook trước khi đẩy chặn commit code lên main.
- Đọc gói việc (work/goi/<mã item>.md, soạn bằng scripts/goi.py) nếu có, không thì đọc item. Tài liệu đọc bằng scripts/trich.py, không mở cả file. Canvas đọc bằng scripts/trich-man.py.
- Chỉ sửa file trong mục Phạm vi của item hoặc ô "Được sửa" của gói việc. File ngoài phạm vi thì dừng và tạo item mới.
- Mỗi tiêu chí một test mang mã đó trong tên, ví dụ `YC5.3-NT2`. Viết test trước code. Tiêu chí chưa có test thì item chưa xong. Không tắt, xóa, sửa test để cho qua. kiem.py luật `nt-test` báo đỏ khi NT của item đã mở PR thiếu test hay thiếu lớp (EN8).
- Test ở đúng lớp ghi sau dấu · của tiêu chí (CL14.5): quyền, tiền, chặn trùng ở lớp database trên Postgres thật; màn ở unit; luồng chính ở e2e.
- Task được giao sau một task viết test trước thì không sửa file test của task đó.
- Chú thích code trỏ về mã tài liệu: mỗi hàm database, policy, màn, hàm tính tiền có một dòng chú thích ghi mã YC, QT, PQ, HV nó làm (ví dụ `-- YC5.3, QT1.1, PQ7.CHU`). Không chép nội dung đặc tả vào chú thích.
- App gọi thẳng Supabase (QD4). Đọc qua RLS; ghi qua hàm `fn_*` chạy security definer và tự kiểm người gọi. Không bảng nào cho app ghi thẳng. Dữ liệu người không được thấy thì database không trả, không gửi rồi ẩn trên màn.
- Migration chỉ thêm, không sửa migration đã gộp. Đổi hàm, policy, view: thêm test database và một phép thử làm hỏng (bất biến ở docs/architecture/thiet-ke-db.md mục 3).
- Tiền là số nguyên đồng. Ngày theo giờ Việt Nam. Đặt phòng chiếm các đêm từ ngày nhận tới trước ngày trả. Chặn trùng bằng ràng buộc ở database (QD6).
- Tên, số điện thoại khách: mỗi người chỉ thấy cái mình nhập (QD11). Không ghi log chứa số điện thoại, tên khách.
- Không đọc .env. Khóa bí mật, khóa production không bao giờ có trong code, test, log hay phiên cloud. Test chạy trên dữ liệu mẫu DLM, không dữ liệu thật.
- Giao diện: vùng bấm 44 px; chữ màn đọc 14 px, màn dày thông tin 12–13 px, không dưới 12 px; cỡ cụ thể theo canvas. Mọi màn có trạng thái theo HV1 đến HV8. Lưu trên máy chỉ thứ mất cũng được, bọc try/catch (pwa.md P10).
- Đổi cấu trúc module hay thêm thư viện cần Đức duyệt (CL4.2).
- Trước khi báo xong: chạy test của phần bị đổi, `npm run typecheck`, `npm run build`, `python3 scripts/kiem.py --diff origin/main` (lệnh đầy đủ ở docs/dev/chay-va-test.md), dán lệnh và kết quả.
