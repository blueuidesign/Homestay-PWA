# Kiểm thử tự động

GitHub Actions chạy ở mỗi pull request (`.github/workflows/test.yml`). Không chạm database thật.

## Database (`tests/db`)

`scripts/test-db.sh` dựng database trống từ **toàn bộ** `supabase/migrations/`, chạy `supabase/seed/`, rồi chạy từng file `t_*.sql`.
Vì dựng lại từ đầu, bộ này kiểm luôn việc repo có đủ để tạo lại database hay không.

| File | Vai trò |
| --- | --- |
| `00_shim.sql` | Giả lập phần Supabase mà Postgres trần không có: vai trò `anon`/`authenticated`, `auth.uid()`, `cron`, `net`, `vault`, `storage` |
| `01_helpers.sql` | Hàm trợ giúp trong schema `t`: `t.login`, `t.eq`, `t.ok`, `t.throws`, `t.dem_dong` (đếm dòng qua RLS), `t.fixture` (bộ dữ liệu mẫu Chị Hoa, Anh Tuấn, Sale Hùng, Sale Lan, Sale Nga) |
| `t_01_phan_quyen.sql` | Ai thấy căn, hồ sơ nào; không ghi thẳng vào bảng; khách không thấy gì; mọi bảng bật RLS |
| `t_02_gia.sql` | Sale được chia sẻ thấy giá; đêm cuối tuần; chủ ngừng cho xem; chủ xóa tài khoản |
| `t_03_chan_trung.sql` | Ví dụ QT1.1 đến QT1.3: chặn trùng, sửa booking, căn tự nhập, gửi lại không trùng |
| `t_04_tien_phong.sql` | Ví dụ QT4.1, QT4.2: tiền điền sẵn, chia theo đêm, phần lẻ dồn đêm cuối |
| `t_05_yeu_cau_huy_khach.sql` | QT1.4, hủy hai bên, ai thấy khách và tiền thu khách, tình trạng cọc |
| `t_06_link_moi.sql` | Link mời: xem không cần đăng nhập, không có giá, hết hạn, thu hồi |
| `t_07_can_gia_mo_rong.sql` | Mã căn, sửa căn, ảnh (tối đa 12), giá dịp, sao chép giá, giá nhiều căn, mức cộng và giá bán, xóa căn, căn tự nhập |
| `t_08_thong_bao.sql` | Ai nhận thông báo nào, không lộ khách và giá bán, popup mở app, tắt từng loại, lần gửi khách |
| `t_09_sale_doc.sql` | Lịch 7 ngày và tìm phòng của sale: nhóm căn, ô ngày, tổng giá, căn tự nhập không bao giờ trống |
| `t_10_thong_ke.sql` | Doanh thu và đêm có khách theo tháng, tiền chênh của sale, đã hủy không tính, xuất file |
| `t_11_ket_noi_quan_tri.sql` | Sale xin lịch, gửi lịch chọn căn, đổi phạm vi, bỏ nguồn, yêu cầu hủy và hết hạn, quản trị |
| `after_<tên migration>` | (Hiếm) dữ liệu phải có trước khi một migration cũ chạy |

### Định dạng một file kiểm thử
```sql
-- <Kiểm gì, một dòng>
begin;
do $$
declare f jsonb := t.fixture(); c1509 uuid := (f->>'c1509')::uuid;
begin
  perform t.login((f->>'hung')::uuid);                 -- đóng vai Sale Hùng
  perform t.eq(t.dem_dong('select 1 from can'), 3, 'mô tả');   -- đếm dòng đi qua RLS
  perform t.throws('<câu SQL>', 'mô tả', 'chữ trong lỗi');
  ...
end $$;
rollback;                                              -- không để lại dữ liệu
```

### Chạy trên máy
```bash
PGHOST=localhost PGPORT=5432 PGUSER=postgres PGPASSWORD=... scripts/test-db.sh
```

## Quy ước
- Đổi hàm `fn_*` thì thêm hoặc sửa kiểm thử trong cùng PR.
- Mỗi lỗi tìm được thì thêm một kiểm thử bắt đúng lỗi đó.
- Chứng minh kiểm thử bắt được lỗi: cố ý làm hỏng hàm, thấy báo đỏ.
- Phân quyền kiểm đủ: chủ nhà, chủ khác, sale được chia sẻ hết, sale chỉ được một căn, sale chưa kết nối, chưa đăng nhập, quản trị.
- Mỗi luật mới có một dòng trong `scripts/thu-lam-hong.sh`.
- Ví dụ số trong quy tắc QT (`docs/luat-chung/QT.md`) dùng đúng số và ghi mã ví dụ trong mô tả, ví dụ `QT1.1-VD2`.
- Tiêu chí nghiệm thu của story: ghi mã tiêu chí trong mô tả của lệnh kiểm, ví dụ `YC5.3-NT2 …`, để tra ngược từ story ra test.
- Số liệu lấy từ bộ mẫu `t.fixture()`, khớp `docs/luat-chung/Du_lieu_mau.md`.

## E2E (`tests/e2e`)
Xem [`e2e/README.md`](e2e/README.md).
