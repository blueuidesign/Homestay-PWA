# Data fix · Sửa dữ liệu riêng của production

Sửa dữ liệu một lần trên production: sửa bản ghi nhập nhầm, gộp tòa nhà trùng tên, nhập dữ liệu cũ. **Không** nằm trong `supabase/migrations/`, vì migration phải chạy được trên database trống bất kỳ.

## Đặt tên
`YYYYMMDD_<noi-dung-khong-dau>.sql`, ví dụ `20270315_gop_toa_nha_trung.sql`.

## Đầu mỗi file
```sql
-- Data fix · <ngày> · <nội dung>
-- Lý do: <ai yêu cầu, vì sao>  · Quyết định: <QD-xxx nếu có>
-- Chỉ chạy trên: production (project <ref>)
-- Đảo lại bằng: <cách đảo, hoặc "ghi bản đảo bằng fn_…">
-- Kiểm tra sau khi chạy: <câu SQL và kết quả mong đợi>
-- Đã chạy: <ngày giờ, người chạy>
```

## Luật
- Vẫn tuân sổ cái chỉ thêm: dùng hàm `fn_*` hoặc ghi bản đảo, không update/delete trực tiếp.
- Chạy thử trong giao dịch hoàn lại trước, rồi mới chạy thật.
