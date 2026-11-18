# Edge Function

Mỗi function một thư mục: `functions/<ten>/index.ts`.

Dùng Edge Function khi việc **không làm được bằng SQL** hoặc **phải giữ bí mật**: gọi dịch vụ ngoài (thanh toán, AI, email, thông báo đẩy), xử lý file. Việc "cộng trừ dữ liệu phải nhất quán" thì để trong hàm SQL `fn_*`.

Đầu mỗi `index.ts` ghi: làm gì, ai gọi (app / trigger / lịch), bí mật cần (tên, không ghi giá trị), cách kiểm tra.
