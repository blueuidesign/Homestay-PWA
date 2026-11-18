---
id: MT
tieu_de: Mô tả dự án
trang_thai: de-xuat
nguoi_chu: tung
rev: 1
---
# Mô tả dự án · Home247 · Lịch phòng Hạ Long

18/11/2026. Bản mô tả ở trạng thái cuối, đọc trước khi đọc đặc tả. Chi tiết hành vi: story. Quyết định: `docs/decisions/`.

## Một câu

Chủ nhà homestay ở Hạ Long ghi lịch và giá ở một chỗ. Sale tra căn trống và giá mà không phải gọi điện, rồi gửi phòng cho khách trong vài phút.

## Thị trường đang chạy thế nào

- Chủ nhà ở Hạ Long hầu như không đăng Airbnb hay Agoda. Phòng bán qua sale.
- Sale tìm khách qua Facebook, Zalo hay kênh riêng. Có khách thì sale gọi hoặc nhắn từng chủ nhà hỏi lịch trống và giá, chọn căn hợp nhất, chốt với chủ, dẫn khách tới, trả tiền cho chủ. Sale tự cộng thêm vào giá chủ để lấy phần chênh.
- Nhóm Zalo là nơi rao "ai có phòng", "tôi có phòng". Quen rồi thì sale và chủ nhắn riêng. Đại lý lớn có nhóm hàng nghìn cộng tác viên, đăng lịch trống mỗi ngày.
- Chủ nhà vẫn có động lực ghi lịch, vì không ghi thì quên và báo sai cho sale khác.
- Khách vài năm mới tới Hạ Long một lần, không có số chủ nhà, nên ít khi bỏ qua sale.

## Vấn đề

1. **Sale mất thời gian hỏi lịch.** Mỗi khách hỏi là vài cuộc gọi hay tin nhắn cho nhiều chủ nhà, chờ trả lời, trong lúc khách có thể đi chỗ khác.
2. **Chủ nhà bị hỏi đi hỏi lại** cùng một câu "ngày này còn phòng không", và dễ nhận trùng khi hai sale cùng chốt một đêm.
3. **Giá chủ nhà dễ lộ cho khách** khi sale chuyển tiếp tin nhắn, làm hỏng phần chênh của sale.
4. **Không ai có số liệu.** Chủ không biết tháng này thu bao nhiêu, ai bán nhiều; sale không biết mình lời bao nhiêu.

## Người dùng

| Nhóm | Mô tả | Cần nhất |
| --- | --- | --- |
| Chủ nhà nhỏ | 1 đến 2 căn | Ghi lịch, tốn ít công nhất |
| Chủ nhà thuê lại | 3 đến 20 căn | Lịch nhiều căn, giá theo quy tắc, doanh thu |
| Sale | Bán phòng của nhiều chủ nhà | Thấy lịch trống và giá nhanh, gửi phòng cho khách |
| Đại lý | Vừa có căn vừa bán căn người khác | Cả hai phía trong một tài khoản |
| Khách | Không dùng app | Nhận chữ và ảnh sale gửi, chỉ thấy giá bán |

Nhiều người dùng trung niên, lớn tuổi, dùng một tay, hay vừa nghe điện thoại vừa thao tác. Nhiều người không có email.

## Cách Home247 giải quyết

- **Lịch và giá một chỗ.** Chủ nhà ghi đặt phòng và đặt giá theo tháng, cuối tuần, ngày lễ (nhóm Lịch chủ nhà, nhóm Căn và giá, nhóm Booking).
- **Chia sẻ lịch cho sale bằng link** gửi qua Zalo. Sale bấm thêm là thấy lịch và giá chủ nhà của các căn được chia sẻ, luôn mới nhất (nhóm Đăng nhập, vai trò, kết nối chủ nhà và sale).
- **Sale tìm căn trống theo ngày**, xem giá chủ nhà, cộng phần của mình, gửi chữ và ảnh cho khách với giá bán (nhóm Tìm phòng và gửi khách).
- **Sale gửi yêu cầu đặt phòng, chủ nhà chấp nhận** trong app. Một đêm chỉ thuộc một đặt phòng, chặn ở database (nhóm Booking, QT1).
- **Căn tự nhập**: sale lưu căn của chủ chưa dùng app để gửi khách và ghi đặt phòng tính thống kê. Căn này không có lịch trống (nhóm Nguồn phòng và căn tự nhập).
- **Thống kê tháng**: chủ nhà xem doanh thu, công suất, theo người bán; sale xem doanh số và tiền chênh (nhóm Thống kê).

## Nguyên tắc không đổi

- Khách không bao giờ thấy giá chủ nhà.
- Sale được chia sẻ căn nào thì luôn thấy giá chủ nhà của căn đó.
- Mỗi người chỉ thấy khách và tiền thu khách do mình nhập. Được lưu tên và số khách; người nhập tự xin phép khách.
- Không bắt đăng ký bằng email.
- Không bắt đăng nhập, không xin gì khi vừa mở app; chỉ hỏi khi người dùng làm việc cần tới.
- Dữ liệu người dùng được đặt ở đâu: QD23.

## Nền tảng

- **Bây giờ: PWA** (app web cài được lên màn hình điện thoại), chạy trên Vercel và Supabase. Lý do: phát hành nhanh, test tự động được bằng trình duyệt (QD3).
- **Sau này, khi có nhiều người dùng: Zalo Mini App** dùng chung database. Người dùng chia sẻ qua Zalo hằng ngày nên Mini App sẽ tự nhiên hơn. Thiết kế màn (`thiet-ke/`) vẽ cho Zalo Mini App, dùng lại cho PWA với vài chỗ khác ghi ở `thiet-ke/README.md`.

## Bản đầu làm gì, để sau gì

Phạm vi chính xác và thứ tự làm nằm ở `docs/stories/README.md`; bảng "Ngoài phạm vi bản 1" ở cuối file đó là danh sách để sau. Tóm lại:
- **Bản 1:** đăng nhập và hồ sơ, thêm căn và giá theo tháng, lịch và đặt phòng của chủ nhà, kết nối chủ nhà với sale, sale tìm phòng và gửi khách, yêu cầu đặt phòng, căn tự nhập, hủy đặt phòng.
- **Để sau:** giá ngày lễ và sao chép giá, thống kê, thông báo, xuất file, đội nhóm và cộng tác viên, trang quản trị, quản gia và dọn phòng, thanh toán, bản Zalo Mini App.

story mô tả cả phần để sau, để khi làm không phải viết lại từ đầu.

## Ý tưởng kinh doanh (chưa làm)

Thu phí sale khoảng 100.000đ mỗi tháng, không thu chủ nhà. Có thể mở ra toàn quốc. Hiện mục tiêu chính là làm ra sản phẩm có người dùng thật; chưa đặt nặng doanh thu.

## Người làm

Tùng là Product Owner: phạm vi, nghiệp vụ, thiết kế, ưu tiên. Đức test tay trên điện thoại thật và lo môi trường. Claude viết code và test.
