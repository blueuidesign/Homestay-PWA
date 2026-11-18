# Từ điển Home247

Dùng đúng các từ dưới đây trong màn, tài liệu và tên trong code. Trên màn luôn viết "đặt phòng"; tài liệu và code viết "booking".

| Từ | Nghĩa | Trong code |
| --- | --- | --- |
| Căn | Một đơn vị cho thuê có lịch riêng. Có hai loại: căn có lịch, căn tự nhập | `can`, `loai` = `co_lich` / `tu_nhap` |
| Đêm | Đơn vị tính giá. Đặt phòng 10/10 → 12/10 là 2 đêm: 10 và 11 | `dem` (daterange nửa mở) |
| Chủ nhà | Người có căn và ghi lịch. Ai giữ căn có lịch thì là chủ nhà của căn đó | `can.nguoi_giu` |
| Sale | Người bán phòng của nhiều chủ nhà | `ket_noi.sale_id` |
| Khách | Người thuê phòng. Không dùng app | `booking_rieng.ten_khach` |
| Khách lẻ | Đặt phòng chủ nhà tự nhận, không qua sale | `booking.sale_id` null, `nguon` = `chu_tu_ghi` |
| Giá chủ nhà | Giá đêm chủ nhà đưa cho sale. Khách không bao giờ thấy | `gia_thang`, `gia_dem()` |
| Tiền phòng | Tổng tiền chủ nhà nhận của một đặt phòng, giữ riêng trong đặt phòng | `booking.tien_phong` |
| Mức cộng | Tiền sale cộng thêm **mỗi đêm** vào giá chủ nhà | |
| Giá bán | Giá sale báo khách = giá chủ nhà + mức cộng × số đêm, có thể làm tròn lên 50.000đ | `booking_rieng.tien_thu_khach` |
| Tiền chênh | Tiền thu khách − tiền phòng. Chỉ sale đó thấy | `v_booking_cua_sale.tien_chenh` |
| Kết nối | Chủ nhà đồng ý chia sẻ lịch cho một sale | `ket_noi` |
| Phạm vi chia sẻ | Tất cả căn (căn mới tự thêm) hoặc chọn từng căn | `pham_vi` = `tat_ca_can` / `chon_can` |
| Nguồn phòng | Các chủ nhà và căn mà một sale được xem | `my_shared_can_ids()` |
| Căn của tôi | Căn có lịch do chính sale giữ; với căn đó sale là chủ nhà | `my_own_can_ids()` |
| Căn tự nhập | Căn sale tự thêm cho chủ chưa dùng app. Không có lịch trống: ô ngày ghi "?", không bao giờ "trống" | `loai` = `tu_nhap` |
| Link mời | Link chủ nhà gửi để sale thêm lịch. Hết hạn sau 21 ngày, thu hồi được | `link_moi` |
| Link xin lịch | Link riêng của mỗi sale gửi cho chủ nhà xin xem lịch | |
| Yêu cầu đặt phòng | Sale xin chủ nhà nhận một đặt phòng. Chưa chiếm đêm | `yeu_cau_dat_phong` |
| Trạng thái tiền | Chưa cọc, Đã cọc · còn thu, Đã thanh toán | `trang_thai_tien` |
| Tình trạng cọc | Sale chỉ biết đã cọc hay chưa, không thấy số tiền; chủ bật tắt cho từng sale | `quyen_tinh_trang_coc` |
| Xóa căn | Ẩn căn. Đặt phòng và thống kê vẫn còn | `can.an_luc` |
| Xóa tài khoản | Xóa số điện thoại; tên hiện kèm "Đã xoá tài khoản"; dữ liệu giữ | `profiles.da_xoa_luc` |
| Dịp | Dải ngày có giá riêng: ngày lễ hoặc dịp đặc biệt | |
| Công suất | Đêm có khách ÷ (số căn × số đêm của tháng) | |

## Danh sách lựa chọn dùng chung

**Loại view:** Biển, Thành phố, Núi. Không có "Vịnh". Code: `bien`, `thanh_pho`, `nui`.

**Mức cộng của sale:** Không cộng, +100k, +200k, +300k, +400k, +500k, Tùy chọn. Một bộ cho mức mặc định (P10) và mức riêng từng căn (S3).

**Phòng ngủ và số giường:** số phòng ngủ bắt buộc (0 đến 4), số giường không bắt buộc. Thẻ căn ghi "2PN · 3 giường", chưa có số giường thì "2PN". Không bao giờ ghi "x khách", "x người lớn", "y trẻ em".

**Lý do từ chối yêu cầu:** Đã có khách đặt, Đang sửa phòng, Lý do khác.

**Viết số tiền:** đầy đủ "1.300.000đ". Rút gọn trên lưới và biểu đồ: dưới một triệu "900k", từ một triệu "1,1tr", "13.4tr" trên biểu đồ (theo thiết kế).
