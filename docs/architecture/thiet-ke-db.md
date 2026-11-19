---
id: KT-DB
tieu_de: Mô hình dữ liệu và bất biến
trang_thai: de-xuat
nguoi_chu: tung
rev: 1
---
# Thiết kế database · Home247 bản PWA

<!-- Tài liệu sống. Chỉ ghi MÔ HÌNH DỮ LIỆU và BẤT BIẾN: vì sao có bảng này, điều gì không bao giờ được sai, ai đọc ghi và vì sao.
     YC nói database phải bảo đảm gì (mục "Dữ liệu" của mỗi YC); file này nói các bảng chia thế nào để bảo đảm được.
     Danh sách cột, kiểu, ràng buộc, policy, hàm: sinh từ migration khi có code (bảng cột sinh từ migration), không viết tay ở đây.
     Code đã xóa theo QD21; tên bảng, tên hàm dưới đây là thiết kế để code lại, chưa có trong repo.
     Đổi một bất biến ở file này là đổi phân quyền hoặc đổi luật tiền: cần Tùng duyệt và một QD. -->

## 1. Cách làm chung

- App gọi thẳng Supabase, không có server riêng (QD4). Mọi bảo vệ nằm ở database.
- **Đọc** đi qua RLS: mỗi bảng có policy nói ai thấy dòng nào. Bảng không có policy thì app không đọc được.
- **Ghi** đi qua hàm `fn_*`. Hàm chạy bằng quyền chủ database (`security definer`), nên tự nó phải kiểm người gọi là ai (`can_dang_nhap()`) và có quyền không. Không bảng nào cho app `insert`, `update`, `delete` thẳng.
- Lý do tách đọc và ghi: luật ghi (chặn trùng, chia tiền, sinh thông báo, từ chối yêu cầu trùng) cần nhiều bước trong một giao dịch, policy không diễn đạt được.
- Tiền là số nguyên đồng. Ngày nghiệp vụ theo giờ Việt Nam (`local_today()`). Một lần ở là một `daterange` nửa mở: từ ngày nhận tới trước ngày trả.
- Bản ghi tạo từ máy người dùng có `client_id` (app tự sinh). Gửi lại khi rớt mạng trả về bản ghi cũ, không tạo trùng.

## 2. Các nhóm bảng và ý định

| Nhóm | Bảng | Để làm gì |
|---|---|---|
| Người dùng | `profiles`, `cai_dat_rieng`, `admins`, `bootstrap_admins` | `profiles`: tên, số điện thoại, giờ nhận trả, đêm tính cuối tuần, mốc lần mở app (YC12.1); người đã kết nối đọc được của nhau. `cai_dat_rieng`: thứ chỉ mình mình thấy (mức cộng, mẫu tin). Tách hai bảng vì quyền đọc khác nhau (QD16) |
| Căn | `toa_nha`, `can`, `anh_can` | Một bảng `can` cho ba loại: căn của chủ nhà, căn của sale, căn sale tự nhập (`loai = 'tu_nhap'`). Vai tính theo quan hệ người với căn (`can.nguoi_giu`), không theo tài khoản (QD5) |
| Kết nối | `ket_noi`, `ket_noi_can`, `link_moi`, `link_moi_can`, `link_xin_lich`, `sale_them_tay` | Chủ nhà chia sẻ cho sale nào, căn nào (`pham_vi` tất cả hay chọn căn), có cho thấy tình trạng cọc không |
| Giá | `gia_thang`, `gia_dip`, `ngay_le`, `muc_cong` | Giá chủ nhà theo tháng (ngày thường, cuối tuần), giá dịp theo dải ngày. `muc_cong` là phần sale cộng thêm cho từng căn, chỉ sale đó đọc |
| Đặt phòng | `booking`, `booking_dem`, `booking_rieng`, `yeu_cau_dat_phong`, `yeu_cau_rieng` | `booking`: phần hai bên cùng thấy. `booking_dem`: tiền từng đêm, để thống kê theo tháng đúng. `booking_rieng`, `yeu_cau_rieng`: tên khách, số khách, tiền thu khách; mỗi người một dòng, chỉ người nhập đọc (QD11) |
| Thông báo, gửi khách | `thong_bao`, `lan_gui_khach`, `tim_gan_day` | Thông báo sinh bằng trigger, chép lúc ghi theo quyền người nhận (YC12). Lần gửi khách để báo sale khi căn đã gửi có người đặt (YC8) |
| Nhật ký | `audit_log` | Ai sửa booking, lúc nào, trước và sau (QD2) |

## 3. Bất biến (sai là hỏng sản phẩm)

Mỗi bất biến phải có test ở lớp database và ít nhất một phép thử làm hỏng (cố tình phá bất biến, test phải đỏ). Hai thứ này dựng lại cùng code (QD21).

1. **Khách chưa đăng nhập không đọc được bảng nào có giá.** Vai `anon` chỉ gọi được `fn_xem_link_moi`, và hàm đó không trả giá (QD8).
2. **Chặn trùng ở database.** Ràng buộc `booking_khong_trung` trên `booking`: hai booking chưa hủy của cùng một căn không được có chung đêm (QD6). Yêu cầu đang chờ không chiếm đêm.
3. **Sale chỉ thấy căn được chia sẻ, và chỉ qua một hàm.** `my_shared_can_ids()` là chỗ duy nhất trả lời "sale này thấy căn nào": kết nối đang hiệu lực, đúng phạm vi, chủ nhà chưa xóa tài khoản, căn chưa ẩn. Mọi policy của sale dùng hàm này.
4. **Căn đã chia sẻ thì sale luôn thấy giá chủ nhà.** Không có công tắc tắt giá (QD7). Chỉ có công tắc "Tình trạng cọc".
5. **Sale không đọc bảng `booking`.** Sale xem lịch qua `fn_sale_lich`, `fn_sale_tim`, `v_lich_sale` (chỉ căn và đêm kín), xem booking của mình qua `v_booking_cua_sale` (không có tiền cọc, không có khách của chủ).
6. **Mỗi người chỉ thấy khách và tiền thu khách do mình nhập** (QD11). Chủ không thấy giá bán, mức cộng, tiền chênh của sale. Sale không thấy khách của chủ.
7. **Căn tự nhập không có lịch trống.** Hàm trả lịch cho căn tự nhập chỉ có ô "của bạn" hoặc "chưa biết", không bao giờ có "trống" hay "kín".
8. **Booking có sale đứng tên không bên nào tự xóa.** Một bên xin hủy, bên kia đồng ý; người xin không tự đồng ý; bị từ chối thì không xin lại (QD12).
9. **Xóa tài khoản chỉ xóa số điện thoại** và đặt `profiles.da_xoa_luc`. Căn, lịch, giá, booking giữ nguyên; sale thôi thấy căn của chủ đã xóa tài khoản (QD13).
10. **Tiền phòng của một booking bằng tổng tiền các đêm** trong `booking_dem`. Chia đều thì phần lẻ dồn vào đêm cuối (QD10).
11. **Thống kê của chủ nhà không chứa giá bán hay tiền chênh của sale; thống kê của sale không chứa tiền cọc.** Booking đã hủy không tính.
12. **Chỉ quản trị viên đầu tiên thêm, gỡ được người đồng quản trị.** Hàm quản trị từ chối người không phải quản trị.

## 4. Ai đọc, ai ghi

Ma trận đầy đủ theo loại dữ liệu và vai: `docs/security/PQ-ma-tran-quyen.md`. Policy thực tế của từng bảng: sinh từ migration khi có code.

Mẫu policy dùng lặp lại: `can_id in (select my_own_can_ids())` cho chủ, `can_id in (select my_shared_can_ids())` cho sale, `<cột người> = (select auth.uid())` cho dữ liệu riêng. Gói `auth.uid()` trong `(select …)` để database tính một lần cho cả câu truy vấn.

## 5. Việc chạy định kỳ

`pg_cron`: `het-han-yeu-cau` (10 phút một lần, yêu cầu quá 14 ngày thành hết hạn, báo sale một lần, YC9.4), `nhac-chua-coc` (mỗi ngày, YC12.3), `don-dep` (dọn ảnh tạm chưa gắn căn). App không gọi được các hàm này. Chạy lại không ghi trùng.

## 6. Kiểm thử

Một lệnh dựng database trống từ toàn bộ migration và seed trên Postgres trần, giả lập phần của Supabase (auth, storage, cron), rồi chạy mọi test database. Lệnh và thư mục test dựng lại cùng code (QD21).

Giới hạn cần biết: bộ test chạy trên Postgres trần, không phải Supabase thật. Policy của Storage (`storage.objects`) và `pg_cron` chỉ được giả lập. Lần đầu chạy migration lên staging phải thử tay: tải ảnh, đọc ảnh bằng tài khoản khác, và xem việc định kỳ có chạy.
