# Thiết kế database · Home247 bản PWA

<!-- Tài liệu sống. Chỉ ghi Ý ĐỊNH và BẤT BIẾN: vì sao có bảng này, điều gì không bao giờ được sai, ai đọc ghi và vì sao.
     Danh sách bảng, cột, kiểu, ràng buộc, policy, hàm: docs/tu-sinh/Bang_va_cot.md (máy sinh từ migration, không viết tay ở đây).
     Đổi một bất biến ở file này là đổi phân quyền hoặc đổi luật tiền: cần Tùng duyệt và một QD. -->

## 1. Cách làm chung

- App gọi thẳng Supabase, không có server riêng (QD-004). Mọi bảo vệ nằm ở database.
- **Đọc** đi qua RLS: mỗi bảng có policy nói ai thấy dòng nào. Bảng không có policy thì app không đọc được.
- **Ghi** đi qua hàm `fn_*`. Hàm chạy bằng quyền chủ database (`security definer`), nên tự nó phải kiểm người gọi là ai (`can_dang_nhap()`) và có quyền không. Không bảng nào cho app `insert`, `update`, `delete` thẳng.
- Lý do tách đọc và ghi: luật ghi (chặn trùng, chia tiền, sinh thông báo, từ chối yêu cầu trùng) cần nhiều bước trong một giao dịch, policy không diễn đạt được.
- Tiền là số nguyên đồng. Ngày nghiệp vụ theo giờ Việt Nam (`local_today()`). Một lần ở là một `daterange` nửa mở: từ ngày nhận tới trước ngày trả.
- Bản ghi tạo từ máy người dùng có `client_id` (app tự sinh). Gửi lại khi rớt mạng trả về bản ghi cũ, không tạo trùng.

## 2. Các nhóm bảng và ý định

| Nhóm | Bảng | Để làm gì |
|---|---|---|
| Người dùng | `profiles`, `cai_dat_rieng`, `admins`, `bootstrap_admins` | `profiles`: tên, số điện thoại, giờ nhận trả, đêm tính cuối tuần; người đã kết nối đọc được của nhau. `cai_dat_rieng`: thứ chỉ mình mình thấy (mức cộng, mẫu tin). Tách hai bảng vì quyền đọc khác nhau (QD-016) |
| Căn | `toa_nha`, `can`, `anh_can` | Một bảng `can` cho ba loại: căn của chủ nhà, căn của sale, căn sale tự nhập (`loai = 'tu_nhap'`). Vai tính theo quan hệ người với căn (`can.nguoi_giu`), không theo tài khoản (QD-005) |
| Kết nối | `ket_noi`, `ket_noi_can`, `link_moi`, `link_moi_can`, `link_xin_lich`, `sale_them_tay` | Chủ nhà chia sẻ cho sale nào, căn nào (`pham_vi` tất cả hay chọn căn), có cho thấy tình trạng cọc không |
| Giá | `gia_thang`, `gia_dip`, `ngay_le`, `muc_cong` | Giá chủ nhà theo tháng (ngày thường, cuối tuần), giá dịp theo dải ngày. `muc_cong` là phần sale cộng thêm cho từng căn, chỉ sale đó đọc |
| Đặt phòng | `booking`, `booking_dem`, `booking_rieng`, `yeu_cau_dat_phong`, `yeu_cau_rieng` | `booking`: phần hai bên cùng thấy. `booking_dem`: tiền từng đêm, để thống kê theo tháng đúng. `booking_rieng`, `yeu_cau_rieng`: tên khách, số khách, tiền thu khách; mỗi người một dòng, chỉ người nhập đọc (QD-011) |
| Thông báo, gửi khách | `thong_bao`, `lan_gui_khach`, `tim_gan_day` | Thông báo sinh bằng trigger. Lần gửi khách để báo sale khi căn đã gửi có người đặt |
| Nhật ký | `audit_log` | Ai sửa booking, lúc nào, trước và sau (QD-002) |

## 3. Bất biến (sai là hỏng sản phẩm)

Mỗi bất biến có test trong `tests/db/` và ít nhất một phép thử làm hỏng trong `scripts/thu-lam-hong.sh`.

1. **Khách chưa đăng nhập không đọc được bảng nào có giá.** Vai `anon` chỉ gọi được `fn_xem_link_moi`, và hàm đó không trả giá (QD-008).
2. **Chặn trùng ở database.** Ràng buộc `booking_khong_trung` trên `booking`: hai booking chưa hủy của cùng một căn không được có chung đêm (QD-006). Yêu cầu đang chờ không chiếm đêm.
3. **Sale chỉ thấy căn được chia sẻ, và chỉ qua một hàm.** `my_shared_can_ids()` là chỗ duy nhất trả lời "sale này thấy căn nào": kết nối đang hiệu lực, đúng phạm vi, chủ nhà chưa xóa tài khoản, căn chưa ẩn. Mọi policy của sale dùng hàm này.
4. **Căn đã chia sẻ thì sale luôn thấy giá chủ nhà.** Không có công tắc tắt giá (QD-007). Chỉ có công tắc "Tình trạng cọc".
5. **Sale không đọc bảng `booking`.** Sale xem lịch qua `fn_sale_lich`, `fn_sale_tim`, `v_lich_sale` (chỉ căn và đêm kín), xem booking của mình qua `v_booking_cua_sale` (không có tiền cọc, không có khách của chủ).
6. **Mỗi người chỉ thấy khách và tiền thu khách do mình nhập** (QD-011). Chủ không thấy giá bán, mức cộng, tiền chênh của sale. Sale không thấy khách của chủ.
7. **Căn tự nhập không có lịch trống.** Hàm trả lịch cho căn tự nhập chỉ có ô "của bạn" hoặc "chưa biết", không bao giờ có "trống" hay "kín".
8. **Booking có sale đứng tên không bên nào tự xóa.** Một bên xin hủy, bên kia đồng ý; người xin không tự đồng ý; bị từ chối thì không xin lại (QD-012).
9. **Xóa tài khoản chỉ xóa số điện thoại** và đặt `profiles.da_xoa_luc`. Căn, lịch, giá, booking giữ nguyên; sale thôi thấy căn của chủ đã xóa tài khoản (QD-013).
10. **Tiền phòng của một booking bằng tổng tiền các đêm** trong `booking_dem`. Chia đều thì phần lẻ dồn vào đêm cuối (QD-010).
11. **Thống kê của chủ nhà không chứa giá bán hay tiền chênh của sale; thống kê của sale không chứa tiền cọc.** Booking đã hủy không tính.
12. **Chỉ quản trị viên đầu tiên thêm, gỡ được người đồng quản trị.** Hàm quản trị từ chối người không phải quản trị.

## 4. Ai đọc, ai ghi

Ma trận đầy đủ theo loại dữ liệu và vai: `docs/luat-chung/PQ.md`. Policy thực tế của từng bảng: `docs/tu-sinh/Bang_va_cot.md`.

Mẫu policy dùng lặp lại: `can_id in (select my_own_can_ids())` cho chủ, `can_id in (select my_shared_can_ids())` cho sale, `<cột người> = (select auth.uid())` cho dữ liệu riêng. Gói `auth.uid()` trong `(select …)` để database tính một lần cho cả câu truy vấn.

## 5. Việc chạy định kỳ

`pg_cron`: `het-han-yeu-cau` (10 phút một lần, yêu cầu quá 14 ngày thành hết hạn, báo sale), `don-dep` (dọn dữ liệu tạm). App không gọi được các hàm này.

## 6. Kiểm thử

`scripts/test-db.sh` dựng database trống từ toàn bộ migration và seed trên Postgres trần, giả lập phần của Supabase bằng `tests/db/00_shim.sql`, rồi chạy `tests/db/t_*.sql`. Cách viết test: `tests/README.md`.

Giới hạn cần biết: bộ test chạy trên Postgres trần, không phải Supabase thật. Policy của Storage (`storage.objects`) và `pg_cron` chỉ được giả lập. Lần đầu chạy migration lên staging phải thử tay: tải ảnh, đọc ảnh bằng tài khoản khác, và xem việc định kỳ có chạy.
