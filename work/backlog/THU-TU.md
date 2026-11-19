# Thứ tự Product Backlog

Chỉ Tùng sắp (CL4.3.2). Trên cùng làm trước. Cột Người là người chịu trách nhiệm; code do Claude Code làm.

Bản dưới là **đề xuất của Claude** lúc tạo item (QD21, 18/11/2026), Tùng chưa duyệt. Cách xếp: nền trước (EN1 đến EN4); rồi theo đường đi của dữ liệu: căn, giá, lịch và đặt phòng của chủ nhà, kết nối sale, phía sale (lịch, tìm phòng, gửi khách), yêu cầu đặt phòng, nguồn phòng; cuối cùng cài đặt cá nhân, thống kê, thông báo và phát hành. Item chờ câu hỏi đang mở xếp sau.

| # | Mã | Việc | Người | Ghi chú |
|---|---|---|---|---|
| 1 | [EN1](EN1-dung-nen-app-khung-pwa.md) | Dựng nền app: khung PWA, cấu trúc thư mục, công cụ test, CI và bản Preview | Tùng | Làm song song với EN2 |
| 2 | [EN2](EN2-database-nen-bang-bat-bien.md) | Database nền: bảng, bất biến, quyền đọc ghi, dữ liệu mẫu và test database | Tùng |  |
| 3 | [EN3](EN3-dang-nhap-tam-tren-staging.md) | Đăng nhập tạm trên staging và tài khoản thử | Tùng | Hủy (QD22 bỏ mật khẩu) |
| 4 | [EN4](EN4-hanh-vi-chung-moi-man.md) | Hành vi chung mọi màn: đang tải, mất mạng, quay lại app, quyền, phiên hết hạn, toast | Tùng |  |
| 5 | [US2](US2-dang-nhap.md) | YC1.2 · Đăng ký và đăng nhập bằng mã email | Tùng | Đưa lên sau EN4 (19/11, chạy tự động); màn tự dựng nếu chưa có thiết kế |
| 6 | [US1](US1-man-dau-va-chon-vai.md) | YC1.1 · Màn đầu và chọn vai | Tùng |  |
| 7 | [US14](US14-man-dau-tien-va-danh.md) | YC3.1 · Màn đầu tiên và danh sách căn | Tùng |  |
| 8 | [US15](US15-them-can.md) | YC3.2 · Thêm căn | Tùng |  |
| 8b | [BG1](BG1-toast-loi-co-dau-tich.md) | HV8 · Toast báo lỗi không có dấu ✓ | Tùng | Claude thêm theo QD25, sau US15 |
| 9 | [US16](US16-anh-can.md) | YC3.3 · Ảnh căn | Tùng |  |
| 10 | [US17](US17-toa-nha-loai-view-so.md) | YC3.4 · Tòa nhà, loại view, số giường, mô tả | Tùng |  |
| 11 | [US21](US21-gia-theo-thang-cua-mot.md) | YC4.2 · Giá theo tháng của một căn | Tùng | |
| 12 | [US20](US20-gia-tren-the-can.md) | YC4.1 · Giá trên thẻ căn | Tùng |  |
| 13 | [US25](US25-nhung-dem-tinh-gia-cuoi.md) | YC4.6 · Những đêm tính giá cuối tuần | Tùng |  |
| 14 | [US9](US9-lich-thang-va-loc-theo.md) | YC2.1 · Lịch tháng và lọc theo căn | Tùng |  |
| 15 | [US10](US10-chi-tiet-mot-ngay.md) | YC2.2 · Chi tiết một ngày | Tùng |  |
| 16 | [US26](US26-mo-form-chon-can-va.md) | YC5.1 · Mở form, chọn căn và ngày, kiểm trùng sớm | Tùng |  |
| 17 | [US27](US27-nguoi-dat-tien-phong-trang.md) | YC5.2 · Người đặt, tiền phòng, trạng thái tiền | Tùng |  |
| 18 | [US28](US28-luu-va-chan-trung.md) | YC5.3 · Lưu và chặn trùng | Tùng |  |
| 19 | [US30](US30-chi-tiet-dat-phong-va.md) | YC5.5 · Chi tiết đặt phòng và thu tiền | Tùng |  |
| 20 | [US31](US31-sua-dat-phong.md) | YC5.6 · Sửa đặt phòng | Tùng |  |
| 21 | [US32](US32-xoa-dat-phong-khach-le.md) | YC5.7 · Xóa đặt phòng khách lẻ | Tùng |  |
| 22 | [US11](US11-doanh-thu-thang.md) | YC2.3 · Doanh thu tháng | Tùng |  |
| 23 | [US12](US12-dat-phong-sap-toi.md) | YC2.4 · Đặt phòng sắp tới | Tùng |  |
| 24 | [US13](US13-lich-tuan-nhieu-can.md) | YC2.5 · Lịch tuần nhiều căn | Tùng |  |
| 25 | [US18](US18-sua-can.md) | YC3.5 · Sửa căn | Tùng |  |
| 26 | [US19](US19-xoa-can.md) | YC3.6 · Xóa căn | Tùng |  |
| 27 | [US35](US35-xin-ten-va-so-dien.md) | YC6.1 · Xin tên và số điện thoại khi bắt đầu kết nối | Tùng | Hủy (YC6.1 bỏ theo QD22) |
| 28 | [US36](US36-danh-sach-sale-cua-chu.md) | YC6.2 · Danh sách sale của chủ nhà | Tùng |  |
| 29 | [US37](US37-link-moi-cua-chu-nha.md) | YC6.3 · Link mời của chủ nhà và sale thêm lịch | Tùng |  |
| 30 | [US38](US38-sale-xin-chu-nha-cho.md) | YC6.4 · Sale xin chủ nhà cho xem lịch | Tùng |  |
| 31 | [US39](US39-chu-nha-duyet-loi-xin.md) | YC6.5 · Chủ nhà duyệt lời xin xem lịch | Tùng |  |
| 32 | [US40](US40-chu-nha-gui-lich-theo.md) | YC6.6 · Chủ nhà gửi lịch theo căn đã chọn | Tùng |  |
| 33 | [US41](US41-pham-vi-tat-ca-can.md) | YC6.7 · Phạm vi "tất cả căn" và căn mới | Tùng |  |
| 34 | [US42](US42-toast-bao-ket-noi-cho.md) | YC6.8 · Toast báo kết nối cho sale | Tùng |  |
| 35 | [US43](US43-man-dau-tien-va-lich.md) | YC7.1 · Màn đầu tiên và lịch 7 ngày của sale | Tùng |  |
| 36 | [US44](US44-tim-phong-trong-theo-ngay.md) | YC7.2 · Tìm phòng trống theo ngày | Tùng |  |
| 37 | [US45](US45-ket-qua-tim-phong.md) | YC7.3 · Kết quả tìm phòng | Tùng |  |
| 38 | [US46](US46-chi-tiet-can-cua-chu.md) | YC7.4 · Chi tiết căn của chủ nhà và giá bán | Tùng |  |
| 39 | [US47](US47-muc-cong-gia-mac-dinh.md) | YC7.5 · Mức cộng giá mặc định | Tùng |  |
| 40 | [US48](US48-gui-thong-tin-cho-khach.md) | YC8.1 · Gửi thông tin cho khách | Tùng |  |
| 41 | [US49](US49-mau-tin-gui-khach.md) | YC8.2 · Mẫu tin gửi khách | Tùng |  |
| 42 | [US29](US29-ghi-dat-phong-cho-sale.md) | YC5.4 · Ghi đặt phòng cho sale | Tùng | Sau khi có kết nối sale (YC6) |
| 43 | [US34](US34-phia-sale-dat-phong-chu.md) | YC5.9 · Phía sale: đặt phòng chủ nhà ghi giúp | Tùng |  |
| 44 | [US33](US33-huy-dat-phong-co-sale.md) | YC5.8 · Hủy đặt phòng có sale | Tùng |  |
| 45 | [US50](US50-sale-gui-va-huy-yeu.md) | YC9.1 · Sale gửi và hủy yêu cầu | Tùng |  |
| 46 | [US51](US51-chu-nha-tra-loi-yeu.md) | YC9.2 · Chủ nhà trả lời yêu cầu | Tùng |  |
| 47 | [US52](US52-yeu-cau-trung-dem.md) | YC9.3 · Yêu cầu trùng đêm | Tùng |  |
| 48 | [US53](US53-sale-nhan-ket-qua.md) | YC9.4 · Sale nhận kết quả | Tùng |  |
| 49 | [US54](US54-tab-can-cua-sale.md) | YC10.1 · Tab Căn của sale | Tùng |  |
| 50 | [US55](US55-chi-tiet-chu-nha-va.md) | YC10.2 · Chi tiết chủ nhà và bỏ nguồn | Tùng |  |
| 51 | [US56](US56-can-tu-nhap.md) | YC10.3 · Căn tự nhập | Tùng |  |
| 52 | [US57](US57-ghi-dat-phong-cho-can.md) | YC10.4 · Ghi đặt phòng cho căn tự nhập | Tùng |  |
| 53 | [US3](US3-tab-ca-nhan-va-dang.md) | YC1.3 · Tab Cá nhân và đăng xuất | Tùng |  |
| 54 | [US4](US4-ho-so.md) | YC1.4 · Hồ sơ | Tùng |  |
| 55 | [US5](US5-gio-nhan-tra-phong-mac.md) | YC1.5 · Giờ nhận, trả phòng mặc định | Tùng |  |
| 56 | [US22](US22-gia-ngay-le-va-dip.md) | YC4.3 · Giá ngày lễ và dịp đặc biệt | Tùng |  |
| 57 | [US23](US23-dat-gia-nhieu-can.md) | YC4.4 · Đặt giá nhiều căn | Tùng |  |
| 58 | [US24](US24-sao-chep-gia-sang-can.md) | YC4.5 · Sao chép giá sang căn khác | Tùng |  |
| 59 | [US58](US58-thong-ke-cua-chu-nha.md) | YC11.1 · Thống kê của chủ nhà | Tùng |  |
| 60 | [US59](US59-thong-ke-cua-sale.md) | YC11.2 · Thống kê của sale | Tùng |  |
| 61 | [US60](US60-dat-phong-va-yeu-cau.md) | YC11.3 · Đặt phòng và yêu cầu của sale | Tùng |  |
| 62 | [US61](US61-popup-thong-bao-moi.md) | YC12.1 · Popup thông báo mới | Tùng |  |
| 63 | [US62](US62-man-thong-bao.md) | YC12.2 · Màn Thông báo | Tùng |  |
| 64 | [US63](US63-nhac-dat-phong-chua-coc.md) | YC12.3 · Nhắc đặt phòng chưa cọc | Tùng |  |
| 65 | [US64](US64-cai-dat-thong-bao.md) | YC12.4 · Cài đặt thông báo | Tùng |  |
| 66 | [US6](US6-xuat-file-csv.md) | YC1.6 · Xuất file CSV | Tùng |  |
| 67 | [US7](US7-huong-dan-va-nhan-home247.md) | YC1.7 · Hướng dẫn và nhắn Home247 | Tùng |  |
| 68 | [US8](US8-xoa-tai-khoan.md) | YC1.8 · Xóa tài khoản | Tùng | Chờ YC1-H6 (màn chưa có) |
| 69 | [EN5](EN5-moi-truong-va-phat-hanh.md) | YC15.1 · Môi trường và phát hành | Tùng | Chờ QD23 |
| 70 | [EN6](EN6-sao-luu-va-khoi-phuc.md) | YC15.2 · Sao lưu và khôi phục | Tùng |  |
| 71 | [EN7](EN7-theo-doi-loi-va-phap.md) | YC15.3 · Theo dõi lỗi và pháp lý | Tùng |  |
