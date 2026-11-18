# Story

Mỗi việc là một story, một file. Story chứa đủ để làm: mục tiêu, bảng bước, chữ trên màn, tiêu chí nghiệm thu, luật kiểm, quyền, màn, việc cần làm. Luật dùng chung cho nhiều story nằm ở `docs/luat-chung/`, story trỏ tới bằng mã. Luật viết story và vòng đời: `docs/QUY_TRINH.md` mục 4 và 5.

File này là tài liệu sống: đổi trạng thái một story thì sửa bảng dưới trong cùng PR.

## Thứ tự làm

Làm từ trên xuống. Một story chỉ bắt đầu khi các story ở cột "Sau" đã xong. Số tiêu chí và tiêu chí nào đã có test: đếm bằng `python3 scripts/kiem-tai-lieu.py`, không ghi tay ở đây. Story ghi Bản "sau" không làm ở bản phát hành đầu.

| Story | Tên | Loại | Bản | Trạng thái | Sau |
|---|---|---|---|---|---|
| [US38](US38-dung-nen.md) | Dựng nền: repo, database, app chạy bằng dữ liệu mẫu, CI | kỹ thuật | 1 | đang làm |  |
| [US37](US37-dang-nhap.md) | Đăng nhập bản PWA | kỹ thuật | 1 | chưa làm | US38 |
| [US1](US1-vao-app-tao-can.md) | Chủ nhà vào app và tạo căn đầu tiên | tính năng | 1 | chưa làm |  |
| [US2](US2-lich-thang-chu-nha.md) | Chủ nhà xem lịch tháng và chi tiết ngày | tính năng | 1 | chưa làm | US1 |
| [US3](US3-ghi-booking.md) | Chủ nhà ghi đặt phòng khách lẻ, chặn trùng ở database | tính năng | 1 | chưa làm | US2, US4 |
| [US4](US4-gia-thang-gon.md) | Chủ nhà đặt giá theo tháng, ngày thường và cuối tuần | tính năng | 1 | chưa làm | US1 |
| [US5](US5-gui-link-duyet-sale.md) | Chủ nhà mời sale bằng link, quản lý sale và cho số điện thoại | tính năng | 1 | chưa làm | US1, US3 |
| [US25](US25-anh-khi-them-can.md) | Chủ nhà thêm ảnh khi tạo căn | tính năng | 1 | chưa làm | US1 |
| [US6](US6-sale-xem-lich.md) | Sale mở link, thêm lịch, xem 7 ngày và giá | tính năng | 1 | chưa làm | US4, US5, US25 |
| [US7](US7-gia-day-du.md) | Chủ nhà đặt giá nhiều căn và sao chép giá | tính năng | 1 | chưa làm | US4 |
| [US8](US8-gia-ngay-le.md) | Chủ nhà đặt giá ngày lễ và dịp đặc biệt | tính năng | 1 | chưa làm | US7 |
| [US9](US9-lich-tuan-tom-tat.md) | Chủ nhà xem tóm tắt tháng, đặt phòng sắp tới và lịch tuần nhiều căn | tính năng | 1 | chưa làm | US2 |
| [US10](US10-sua-xoa-thu-tien.md) | Chủ nhà xem chi tiết, sửa, xóa đặt phòng và ghi đã thu đủ | tính năng | 1 | chưa làm | US3 |
| [US11](US11-anh-va-sua-can.md) | Chủ nhà sửa căn, tòa nhà dùng chung, ngày tính giá cuối tuần | tính năng | 1 | chưa làm | US1, US3, US4 |
| [US12](US12-tim-phong-trong.md) | Sale tìm phòng trống theo ngày | tính năng | 1 | chưa làm | US6, US11 |
| [US13](US13-gia-ban-muc-cong.md) | Chi tiết căn, giá bán và mức cộng của sale | tính năng | 1 | chưa làm | US12 |
| [US17](US17-ket-noi-day-du.md) | Kết nối đầy đủ, sale xin lịch, xin số điện thoại đúng lúc, thông báo kết nối | tính năng | 1 | chưa làm | US5, US6 |
| [US14](US14-gui-khach-zalo.md) | Gửi thông tin và ảnh cho khách, mẫu tin | tính năng | 1 | chưa làm | US13, US17 |
| [US15](US15-yeu-cau-dat-phong.md) | Sale gửi yêu cầu đặt phòng, chủ nhà trả lời, tự hủy khi trùng | tính năng | 1 | chưa làm | US13, US10, US17 |
| [US16](US16-can-tu-nhap.md) | Căn tự nhập và booking sale tự ghi | tính năng | 1 | chưa làm | US5, US6, US12 |
| [US18](US18-thong-ke-chu-nha.md) | Thống kê tháng của chủ nhà | tính năng | 1 | chưa làm | US3, US10 |
| [US28](US28-ghi-dat-phong-cho-sale.md) | Chủ nhà ghi đặt phòng cho sale | tính năng | 1 | chưa làm | US3, US5, US10 |
| [US19](US19-thong-ke-sale.md) | Thống kê của sale và trạng thái booking | tính năng | 1 | chưa làm | US15, US16, US28 |
| [US21](US21-ca-nhan-cai-dat.md) | Cá nhân, hồ sơ, cài đặt, giờ nhận trả, đăng xuất | tính năng | 1 | chưa làm | US1, US17 |
| [US30](US30-popup-thong-bao-moi.md) | Popup thông báo mới khi mở app | tính năng | 1 | chưa làm | US2, US6, US17 |
| [US22](US22-xuat-csv-xoa-tk-huong-dan.md) | Xuất file đặt phòng, xóa tài khoản, hướng dẫn sử dụng | tính năng | 1 | chưa làm | US21, US6, US10, US15, US16, US17, US19, US30 |
| [US26](US26-gui-lich-chon-can.md) | Chủ nhà gửi lịch cho sale theo căn đã chọn | tính năng | 1 | chưa làm | US5, US6 |
| [US27](US27-xoa-can.md) | Chủ nhà xóa căn | tính năng | 1 | chưa làm | US1, US3, US18, US19 |
| [US35](US35-huy-dat-phong-hai-ben.md) | Hủy đặt phòng của sale: một bên xin, bên kia đồng ý | tính năng | 1 | chưa làm | US10, US15, US28 |
| [US36](US36-hanh-vi-chung.md) | Hành vi chung mọi màn: đang tải, lỗi mạng, quay lại từ nền, xin quyền, mất quyền | tính năng | 1 | chưa làm | US38 |
| [US39](US39-phat-hanh.md) | Phát hành: production, tên miền, sao lưu, theo dõi lỗi | kỹ thuật | 1 | chưa làm | US37 |
| [US20](US20-doi-nhom.md) | Đội nhóm sale | tính năng | sau | chưa làm |  |
| [US34](US34-dang-nhap-quan-tri-dong-quan-tri.md) | Quản trị: đăng nhập và thêm, gỡ người đồng quản trị | tính năng | sau | chưa làm |  |
| [US23](US23-trang-quan-tri.md) | Quản trị: dải ngày lễ | tính năng | sau | chưa làm | US22, US34 |
| [US24](US24-ban-web-chu-nha.md) | Bản web cho chủ nhà nhiều căn | tính năng | sau | chưa làm |  |
| [US29](US29-quan-tri-toa-nha.md) | Quản trị danh sách tòa nhà | tính năng | sau | chưa làm | US23, US34, US11 |
| [US32](US32-bao-sale-khi-chu-doi-gia.md) | Báo sale khi chủ nhà đổi giá căn sale đã gửi khách, ghi chú giá mới đổi trong 2 tuần | tính năng | sau | chưa làm | US13, US14 |
| [US33](US33-chon-tinh-loc-toa-nha.md) | Chọn tỉnh lúc onboarding, danh sách tòa nhà lọc theo tỉnh và xếp theo chữ cái | tính năng | sau | chưa làm |  |
| [US40](US40-sao-luu-nguoi-dung-tai.md) | Người dùng tự tải file sao lưu và khôi phục | tính năng | sau | chưa làm | US22 |

Mã US31 không dùng (story đã bỏ ở bản Zalo; mã không cấp lại).

## Story nào thay story nào

Chưa có. Khi một tính năng đã xong cần đổi, viết story mới (mục "Hiện tại", "Đổi thành", "Test bị đổi") và ghi vào đây: `US<mới> thay một phần US<cũ>: <đổi gì>`. Story cũ không sửa.

## Mục hành vi nằm ở story nào

Các story giữ mã mục của đặc tả bản Zalo (YC5.2, HV3) để mã tiêu chí không đổi. Cần tìm một mục thì tra bảng này. Một mục có thể có tiêu chí ở story khác: tìm bằng `grep -rn "YC5.1-NT6" docs/stories/`.

| Mục | Story giữ bảng bước |
|---|---|
| YC1.1 | US1 |
| YC1.2 | US1 |
| YC1.3 | US6 |
| YC1.4 | US1 |
| YC1.5 | US5 |
| YC1.5.2 | US5 |
| YC1.5.3 | US5 |
| YC1.6 | US17 |
| YC1.7 | US17 |
| YC1.8 | US26 |
| YC1.9 | US5 |
| YC1.10 | US17 |
| YC1.11 | US21 |
| YC1.12 | US6 |
| YC1.13 | US30 |
| YC2.1 | US2 |
| YC2.2 | US9 |
| YC2.3 | US9 |
| YC2.4 | US3 |
| YC2.5 | US9 |
| YC3.1 | US1 |
| YC3.2 | US1 |
| YC3.2.1 | US25 |
| YC3.2.2 | US11 |
| YC3.3 | US11 |
| YC3.4 | US4 |
| YC3.5 | US8 |
| YC3.6 | US7 |
| YC3.7 | US7 |
| YC3.8 | US11 |
| YC3.9 | US27 |
| YC4.1 | US3 |
| YC4.1.1 | US3 |
| YC4.1.2 | US3 |
| YC4.1.3 | US28 |
| YC4.2 | US10 |
| YC4.3 | US10 |
| YC4.4 | US10 |
| YC4.5 | US15 |
| YC4.6 | US15 |
| YC4.7 | US15 |
| YC4.8 | US15 |
| YC4.9 | US35 |
| YC5.1 | US16 |
| YC5.2 | US12 |
| YC5.3 | US12 |
| YC5.4 | US13 |
| YC5.5 | US14 |
| YC5.6 | US13 |
| YC5.7 | US14 |
| YC6.1 | US16 |
| YC6.2 | US16 |
| YC6.3 | US16 |
| YC6.4 | US16 |
| YC6.5 | US16 |
| YC7.1 | US18 |
| YC7.2 | US18 |
| YC7.3 | US18 |
| YC7.4 | US18 |
| YC7.5 | US19 |
| YC7.6 | US19 |
| YC8.1 | US20 |
| YC8.2 | US20 |
| YC8.3 | US20 |
| YC8.4 | US20 |
| YC8.5 | US20 |
| YC8.6 | US20 |
| YC8.7 | US20 |
| YC9.1 | US21 |
| YC9.2 | US21 |
| YC9.3 | US21 |
| YC9.4 | US21 |
| YC9.5 | US40 |
| YC9.6 | US22 |
| YC9.7 | US22 |
| YC9.8 | US22 |
| YC10.1 | US23 |
| YC10.2 | US29 |
| YC10.3 | US34 |
| HV1 | US36 |
| HV2 | US36 |
| HV3 | US36 |
| HV4 | US36 |
| HV5 | US36 |
| HV6 | US36 |
| HV7 | US36 |
| HV8 | US36 |
