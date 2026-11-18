<!-- Luật chung, sống. Ma trận quyền: nguồn duy nhất cho câu hỏi "ai được thấy, được sửa gì". Story ghi mã ô (PQ5.SALE) ở mục Quyền. Đổi một ô là đổi phân quyền: cần Tùng duyệt và một QD. -->

# PQ · Ma trận quyền

Ai được xem, tạo, sửa, xóa dữ liệu nào. Mỗi hàng là một loại dữ liệu (PQ1, PQ2...), mỗi ô là một vai (PQ5.SALE). Database kiểm quyền theo bảng này bằng RLS, view và hàm `fn_*`. Mỗi ô có ít nhất một test cố tình vi phạm (bản PWA: test database trong `tests/db/`). US ghi mã ô ở mục Quyền.

Ô gắn thẻ MỞ thì không code theo phần đó; câu hỏi ở `docs/Cau_hoi_mo.md` (mã PQ-H, YC-H).

## Vai
| Mã | Là ai |
|---|---|
| CHU | Người giữ căn đó: chủ nhà, hoặc sale với căn của chính mình (QD-005, QD-007). Chủ nhà khác không phải CHU của căn này |
| SALE | Sale đã kết nối với chủ nhà đó và chưa bị ngừng, chỉ với các căn được chia sẻ cho mình. Dòng "Bị ngừng" trong ô nói phần khác đi khi chủ nhà đã ngừng cho sale xem (QD-007) |
| LINK | Người mở link mời của chủ nhà mà chưa bấm Thêm lịch, hoặc sale chưa kết nối với chủ nhà đó (QD-008) |
| CTV | Cộng tác viên. Không áp dụng ở bản đầu (nhóm Đội nhóm, cộng tác viên) |
| KHACH | Khách của sale. Không dùng app, không gọi API. Chỉ nhận chữ và ảnh sale gửi qua Zalo hay ứng dụng chat khác (mục "Gửi thông tin cho khách qua Zalo" (US14)) |
| ADMIN | Quản trị viên Home247, dùng web quản trị (nhóm Quản trị Home247 trên web). Xem được mọi dữ liệu người dùng không mã hóa (QD-007). Đăng nhập bằng mã gửi tới email; quản trị viên đầu tiên là <email quản trị viên đầu tiên>, chỉ người này thêm và gỡ người đồng quản trị trên web (mục "Thêm người đồng quản trị" (US34), mục "Thêm người đồng quản trị" (US34)) |

## Luật chung
1. Server mặc định từ chối. Mọi API đi qua một chỗ kiểm quyền.
2. Dữ liệu không được phép thì server không gửi đi. Không gửi rồi ẩn trên giao diện (CLAUDE.md).
3. Không có quan hệ thì không có quyền: chủ nhà khác, sale khác, sale chưa kết nối không đọc, không ghi được dữ liệu của căn hay của người khác.
4. Mọi việc đọc, ghi của app cần đăng nhập, trừ việc xem trước link mời hợp lệ ở A1-link, A10 (PQ3.LINK, PQ18.LINK). Ở bản PWA: vai `anon` chỉ gọi được `fn_xem_link_moi`.
5. Vai tính theo quan hệ người với căn, không theo tài khoản (QD-005). Một người có thể là CHU ở căn này, SALE ở căn kia. Chủ nhà không bán căn của chủ nhà khác (QD-007).
6. Chặn trùng đặt phòng ở database, không chỉ ở giao diện (QT1, CLAUDE.md).
7. Dữ liệu của người đã xóa tài khoản theo PQ23 (QD-013).

## PQ1 · Hồ sơ người dùng
Họ tên, tên hiển thị, ảnh đại diện, cài đặt thông báo.
- PQ1.CHU: xem, sửa hồ sơ của mình. Thấy tên hiển thị của sale đã kết nối và của sale đang xin xem lịch ở A8 (nhóm Đăng nhập, vai trò, kết nối chủ nhà và sale Ai thấy gì, mục "Hồ sơ (Thông tin cá nhân)" (US21)).
- PQ1.SALE: xem, sửa hồ sơ của mình. Thấy tên hiển thị của chủ nhà đã kết nối ở Nguồn phòng (mục "Hồ sơ (Thông tin cá nhân)" (US21)). Bị ngừng: vẫn thấy tên chủ nhà trên đặt phòng cũ của mình (QD-007).
- PQ1.LINK: thấy tên chủ nhà ở A1-link và A10 (QD-008). Chưa có hồ sơ cho tới khi vào app (nhóm Quản trị và dữ liệu Ai thấy gì).
- PQ1.CTV: không áp dụng ở bản đầu (nhóm Đội nhóm, cộng tác viên).
- PQ1.KHACH: không.
- PQ1.ADMIN: xem (QD-007). Sửa: [MỞ: CH-043].

## PQ2 · Số điện thoại người dùng
Ai cũng chỉ ghi được số của chính mình. Bản Zalo: số lấy từ Zalo, không sửa trong app (mục "Số điện thoại hiện trong hồ sơ" (US5)); app chỉ gửi token số điện thoại lên máy chủ, máy chủ đổi token một lần trong 2 phút, app không chứa App Secret (`docs/zalo/rang-buoc.md`). Bản PWA: số lấy theo cách đăng nhập ở CH-001.
- PQ2.CHU: xem số của mình. Thấy số sale đã kết nối và sale đang xin ở A8, CN7-04, nếu sale đã cho số (nhóm Đăng nhập, vai trò, kết nối chủ nhà và sale Ai thấy gì).
- PQ2.SALE: xem số của mình. Thấy số của chủ nhà đã kết nối (QD-007). Bị ngừng: [MỞ: CH-042].
- PQ2.LINK: không thấy số chủ nhà (QD-008, nhóm Đăng nhập, vai trò, kết nối chủ nhà và sale Ai thấy gì).
- PQ2.CTV: không áp dụng ở bản đầu (nhóm Đội nhóm, cộng tác viên).
- PQ2.KHACH: không bao giờ (nhóm Đăng nhập, vai trò, kết nối chủ nhà và sale Ai thấy gì).
- PQ2.ADMIN: xem (QD-007).

## PQ3 · Thông tin và ảnh căn
Mã căn, số phòng ngủ, số giường, tòa nhà, loại view, ảnh, mô tả gửi khách.
- PQ3.CHU: tạo, xem, sửa căn của mình; tải và xóa ảnh căn của mình (nhóm Căn và giá). Xóa căn là ẩn căn (mục "Xóa căn" (US27)). Không đọc, không ghi căn của chủ nhà khác.
- PQ3.SALE: xem các căn được chia sẻ, dùng khi gửi khách (nhóm Căn và giá, nhóm Tìm phòng và gửi khách). Được chia sẻ "tất cả căn" thì căn mới tự vào (mục "Căn mới của chủ nhà tự hiện cho sale" (US6), QD-008); chỉ được vài căn thì chỉ các căn đó (mục "Chủ nhà chủ động gửi lịch cho sale" (US26)). Không sửa. Bị ngừng: không xem căn nữa; đặt phòng cũ vẫn ghi tên căn (QD-007).
- PQ3.LINK: có link mời hợp lệ thì A10 thấy tên chủ nhà, số căn, mỗi căn có ảnh, mã căn, số phòng ngủ, số giường, loại view; không có giá (QD-008, QD-007). Không có link, link sai, hết hạn hay đã thu hồi thì không thấy gì (QD-008). Ảnh căn không mở được bằng đường dẫn trực tiếp khi không có quyền.
- PQ3.CTV: không áp dụng ở bản đầu (nhóm Đội nhóm, cộng tác viên).
- PQ3.KHACH: chỉ phần sale gửi qua Zalo (mục "Gửi thông tin cho khách qua Zalo" (US14)). Không gọi API.
- PQ3.ADMIN: xem (QD-007).

## PQ4 · Lịch trống, đã đặt
- PQ4.CHU: xem lịch mọi căn của mình (nhóm Lịch chủ nhà). Lịch đổi qua đặt phòng (PQ7).
- PQ4.SALE: xem trống hay đã đặt của căn được chia sẻ, gồm cả đêm có đặt phòng của sale khác hay chủ nhà tự ghi. Đêm đó hiện "đã đặt", không có tên người đặt. Đây không phải quyền bật tắt (QD-007). Bị ngừng: không xem (QD-007, mục "Chủ nhà quản lý danh sách sale" (US5)).
- PQ4.LINK: không (QD-008).
- PQ4.CTV: không áp dụng ở bản đầu (nhóm Đội nhóm, cộng tác viên).
- PQ4.KHACH: không.
- PQ4.ADMIN: xem (QD-007).

## PQ5 · Giá chủ nhà theo đêm
Giá tháng, giá ngày lễ, giá dịp đặc biệt.
- PQ5.CHU: xem, đặt, sửa giá căn của mình (nhóm Căn và giá). Không đặt giá cho căn của chủ nhà khác.
- PQ5.SALE: luôn xem giá của căn được chia sẻ, khi chủ nhà đã đặt giá cho đêm đó (nhóm Đăng nhập, vai trò, kết nối chủ nhà và sale, nhóm Căn và giá). Không có công tắc tắt giá (QD-007). Bị ngừng: không.
- PQ5.LINK: không. A10 không có giá (QD-008).
- PQ5.CTV: không áp dụng ở bản đầu (nhóm Đội nhóm, cộng tác viên).
- PQ5.KHACH: không bao giờ (CLAUDE.md, nhóm Căn và giá Ai thấy gì).
- PQ5.ADMIN: xem (QD-007).

## PQ6 · Cài đặt chung của chủ nhà
Ngày tính giá cuối tuần, giờ nhận và trả phòng.
- PQ6.CHU: xem, sửa của mình (mục "Ngày tính giá cuối tuần" (US11), mục "Giờ nhận, trả phòng mặc định" (US21)).
- PQ6.SALE: thấy giờ nhận, trả khi gửi khách (nhóm Quản trị và dữ liệu Ai thấy gì). Ngày tính giá cuối tuần: [MỞ: CH-044].
- PQ6.LINK: không.
- PQ6.CTV: không áp dụng ở bản đầu (nhóm Đội nhóm, cộng tác viên).
- PQ6.KHACH: giờ nhận, trả trong tin sale gửi (nhóm Quản trị và dữ liệu Ai thấy gì).
- PQ6.ADMIN: xem (QD-007).

## PQ7 · Đặt phòng
Căn, ngày nhận, ngày trả, người đặt.
- PQ7.CHU: xem mọi đặt phòng của căn mình; tạo (chặn trùng theo QT1), sửa (mục "Sửa booking" (US10)). Xóa đặt phòng mình tự ghi. Không xóa đặt phòng thành từ yêu cầu của sale đã chấp nhận, server chặn (mục "Xóa booking" (US10), mục "Cài đặt thông báo" (US21)). Xin hủy và chấp thuận hay từ chối hủy đặt phòng đã chấp nhận (QD-012). Từ chối thì đặt phòng giữ nguyên, trạng thái "Bị từ chối hủy". Hủy xong thì các đêm tương lai trống lại (QD-012). Đặt phòng chủ nhà tự ghi chọn người đặt là một sale thì tính là đặt phòng của sale đó (mục "Booking chủ nhà ghi cho sale" (US28)).
- PQ7.SALE: xem chi tiết đặt phòng của mình, gồm đặt phòng chủ nhà ghi chọn sale này. Đặt phòng của người khác chỉ thấy là "đã đặt" (PQ4.SALE). Không tạo thẳng vào lịch chủ nhà, chỉ gửi yêu cầu (PQ10). Không sửa, không xóa. Xin hủy và chấp thuận hay từ chối hủy đặt phòng của mình (QD-012). Bị ngừng: vẫn xem lại đặt phòng cũ của mình với chủ nhà đó (QD-007); xin hủy được không: [MỞ: CH-048] QD-012.
- PQ7.LINK: không.
- PQ7.CTV: không áp dụng ở bản đầu (nhóm Đội nhóm, cộng tác viên).
- PQ7.KHACH: không.
- PQ7.ADMIN: xem (QD-007).

## PQ8 · Tiền của đặt phòng
Tiền phòng, tiền cọc, trạng thái thu.
- PQ8.CHU: xem, sửa của đặt phòng căn mình (nhóm Lịch chủ nhà, nhóm Booking).
- PQ8.SALE: tiền phòng của đặt phòng của mình: thấy (QD-007). Tình trạng cọc của đặt phòng của mình: chỉ thấy đã cọc hay chưa, khi quyền "Tình trạng cọc" bật; không bao giờ thấy số tiền cọc (QD-007). Nhãn "Đã thanh toán", "còn thu": [MỞ: CH-049] QD-007 chỉ nói đã cọc hay chưa. Đặt phòng của người khác: không.
- PQ8.LINK: không.
- PQ8.CTV: không áp dụng ở bản đầu (nhóm Đội nhóm, cộng tác viên).
- PQ8.KHACH: không.
- PQ8.ADMIN: xem (QD-007).

## PQ9 · Tên, số điện thoại khách trong đặt phòng
- PQ9.CHU: xem, sửa khách do mình nhập, kể cả khách lẻ. Không thấy khách của sale (QD-011).
- PQ9.SALE: xem, sửa khách do mình nhập. Không bao giờ thấy khách của chủ nhà (QD-011, CLAUDE.md).
- PQ9.LINK: không.
- PQ9.CTV: không áp dụng ở bản đầu (nhóm Đội nhóm, cộng tác viên).
- PQ9.KHACH: không dùng app.
- PQ9.ADMIN: xem (QD-007).

## PQ10 · Yêu cầu đặt phòng
Yêu cầu của sale, trạng thái, lý do từ chối.
- PQ10.CHU: xem yêu cầu gửi tới căn của mình; chấp nhận, từ chối kèm lý do (mục "Chủ nhà nhận và trả lời yêu cầu" (US15)). Không thấy giá bán của sale (PQ11).
- PQ10.SALE: gửi yêu cầu cho căn được chia sẻ, đêm còn trống (mục "Sale gửi yêu cầu đặt phòng" (US15)); xem, hủy yêu cầu của mình; thấy lý do từ chối (mục "Sale nhận kết quả yêu cầu" (US15)). Không thấy yêu cầu của sale khác (nhóm Booking Ai thấy gì). Bị ngừng: không gửi yêu cầu mới; yêu cầu đang chờ: [MỞ: CH-050].
- PQ10.LINK: không.
- PQ10.CTV: không áp dụng ở bản đầu (nhóm Đội nhóm, cộng tác viên).
- PQ10.KHACH: không.
- PQ10.ADMIN: xem (QD-007).

## PQ11 · Giá bán, mức cộng thêm, mẫu tin
- PQ11.CHU: không bao giờ thấy (nhóm Booking, nhóm Tìm phòng và gửi khách Ai thấy gì).
- PQ11.SALE: chỉ của mình; xem, sửa (nhóm Tìm phòng và gửi khách). Đêm chưa đặt giá thì không có giá bán.
- PQ11.LINK: không.
- PQ11.CTV: không áp dụng ở bản đầu (nhóm Đội nhóm, cộng tác viên).
- PQ11.KHACH: thấy giá bán trong tin sale gửi, không thấy phần cộng thêm (nhóm Tìm phòng và gửi khách).
- PQ11.ADMIN: xem (QD-007).

## PQ12 · Lần gửi khách
Căn, các đêm, lúc gửi (mục "Gửi thông tin cho khách qua Zalo" (US14), mục "Cài đặt thông báo" (US21)).
- PQ12.CHU: không.
- PQ12.SALE: chỉ của mình. App ghi khi sale bấm gửi.
- PQ12.LINK: không.
- PQ12.CTV: không áp dụng ở bản đầu (nhóm Đội nhóm, cộng tác viên).
- PQ12.KHACH: không.
- PQ12.ADMIN: xem (QD-007).

## PQ13 · Căn của sale
Căn sale sở hữu hay thuê lại để kinh doanh (mục "Danh sách căn và nguồn phòng" (US16), QD-005).
- PQ13.CHU: sale có căn là CHU của căn đó: mọi quyền ở cột CHU của PQ3 đến PQ9 với căn này (QD-007).
- PQ13.SALE: sale khác không thấy. Bản đầu không có cách chia căn của sale cho sale khác (QD-005).
- PQ13.LINK: không.
- PQ13.CTV: không áp dụng ở bản đầu (nhóm Đội nhóm, cộng tác viên).
- PQ13.KHACH: phần sale gửi qua Zalo.
- PQ13.ADMIN: xem (QD-007).

## PQ14 · Căn tự nhập
Căn tự nhập, tên và số điện thoại chủ căn tự nhập, đặt phòng sale tự ghi cho căn đó.
- PQ14.CHU: không. Chủ căn thật chưa dùng app; chủ nhà khác không thấy (nhóm Nguồn phòng và căn tự nhập, QD-011).
- PQ14.SALE: chỉ sale tạo căn: tạo, xem, sửa, xóa. Số chủ căn không xuất ra file (QD-011). Ô ngày hiện "?", không bao giờ "trống" (CLAUDE.md, nhóm Tìm phòng và gửi khách). Sale khác không thấy, kể cả qua nhóm (nhóm Đội nhóm, cộng tác viên, QD-011).
- PQ14.LINK: không.
- PQ14.CTV: không áp dụng ở bản đầu (nhóm Đội nhóm, cộng tác viên).
- PQ14.KHACH: phần sale gửi qua Zalo.
- PQ14.ADMIN: xem (QD-007).

## PQ15 · Tiền chênh, doanh số của sale
- PQ15.CHU: không (nhóm Nguồn phòng và căn tự nhập, nhóm Thống kê Ai thấy gì).
- PQ15.SALE: chỉ của mình (nhóm Thống kê, QT3).
- PQ15.LINK: không.
- PQ15.CTV: không áp dụng ở bản đầu (nhóm Đội nhóm, cộng tác viên).
- PQ15.KHACH: không.
- PQ15.ADMIN: xem (QD-007).

## PQ16 · Doanh thu, công suất, chưa thu của chủ nhà
- PQ16.CHU: của mình (nhóm Lịch chủ nhà, nhóm Thống kê).
- PQ16.SALE: không bao giờ (nhóm Đăng nhập, vai trò, kết nối chủ nhà và sale quy tắc Quyền sale được xem).
- PQ16.LINK: không.
- PQ16.CTV: không áp dụng ở bản đầu (nhóm Đội nhóm, cộng tác viên).
- PQ16.KHACH: không.
- PQ16.ADMIN: xem (QD-007).

## PQ17 · Kết nối và quyền xem
Danh sách sale của chủ nhà, phạm vi chia sẻ (tất cả căn hoặc chọn căn), quyền "Tình trạng cọc", ngừng cho xem.
- PQ17.CHU: xem danh sách sale của mình và đặt phòng của từng sale; thêm sale bằng tay; bật tắt hai quyền cho từng sale; ngừng cho xem (mục "Chủ nhà duyệt lời mời xem lịch" (US17), mục "Chủ nhà quản lý danh sách sale" (US5)). Sale vào qua link mời hay CN10 nhận mặc định: giá bật, cọc bật (QD-007). Không xem, không đổi, không ngừng sale của chủ nhà khác.
- PQ17.SALE: xem danh sách chủ nhà đã kết nối ở Nguồn phòng, bỏ nguồn (mục "Chi tiết chủ nhà và bỏ nguồn phòng" (US16)). Không thấy các sale khác của chủ nhà (nhóm Đăng nhập, vai trò, kết nối chủ nhà và sale). Không tự đổi quyền của mình. Bị ngừng: nhận thông báo (mục "Cài đặt thông báo" (US21)); chủ nhà còn hiện ở Nguồn phòng không: [MỞ: CH-047].
- PQ17.LINK: bấm Thêm lịch ở A10 thì thành SALE (QD-008). Đã thêm rồi mà mở lại link thì thấy A10-01, không thêm lần nữa (QD-008).
- PQ17.CTV: không áp dụng ở bản đầu (nhóm Đội nhóm, cộng tác viên).
- PQ17.KHACH: không.
- PQ17.ADMIN: xem (QD-007).

## PQ18 · Link mời và link xin lịch
Link mời của chủ nhà, link xin lịch của sale, số lần đã gửi.
- PQ18.CHU: tạo, gửi, thu hồi link mời của mình (QD-008). Mở link xin lịch của sale thì thấy A8 (mục "Chủ nhà duyệt lời mời xem lịch" (US17)).
- PQ18.SALE: tạo, gửi link xin lịch của mình; xem số lần đã gửi, số chủ nhà đã đồng ý (A7, mục "Sale xin chủ nhà cho xem lịch" (US17)).
- PQ18.LINK: mở link mời hợp lệ thì thấy A1-link hoặc A10 (PQ3.LINK). Link mời hết hạn sau 21 ngày (QD-008). Link hết hạn hay đã thu hồi: không thấy dữ liệu; màn A1-link-01, chữ cụ thể: CH-005. Link xin lịch của sale có hạn không: [MỞ: CH-014].
- PQ18.CTV: không áp dụng ở bản đầu (nhóm Đội nhóm, cộng tác viên).
- PQ18.KHACH: không.
- PQ18.ADMIN: xem (QD-007).

## PQ19 · Thông báo
- PQ19.CHU: chỉ thông báo của mình (mục "Cài đặt thông báo" (US21)).
- PQ19.SALE: chỉ thông báo của mình (mục "Cài đặt thông báo" (US21)). Thông báo không chứa dữ liệu sale không được xem: không tên người đặt, không tên khách, không giá bán của sale khác (mục "Cài đặt thông báo" (US21), QD-007).
- PQ19.LINK: không.
- PQ19.CTV: không áp dụng ở bản đầu (nhóm Đội nhóm, cộng tác viên).
- PQ19.KHACH: không.
- PQ19.ADMIN: xem (QD-007).

## PQ20 · Xuất file
Xuất file Excel (CSV) ở P8. Sao lưu và khôi phục On Hold (mục "Sao lưu và khôi phục dữ liệu" (US40)).
- PQ20.CHU: chỉ dữ liệu của mình. Có cột tên, số khách do chủ nhà nhập (QD-011). Không có khách của sale.
- PQ20.SALE: không (nhóm Quản trị và dữ liệu Ai thấy gì).
- PQ20.LINK: không.
- PQ20.CTV: không áp dụng ở bản đầu (nhóm Đội nhóm, cộng tác viên).
- PQ20.KHACH: không.
- PQ20.ADMIN: [MỞ: CH-045].

## PQ21 · Dải ngày lễ
- PQ21.CHU: xem trong "Chọn nhanh ngày lễ"; sửa dải áp cho giá của mình (mục "Giá ngày lễ và dịp đặc biệt" (US8)). Không sửa dải chung của Home247.
- PQ21.SALE: [MỞ: CH-046].
- PQ21.LINK: không.
- PQ21.CTV: không áp dụng ở bản đầu (nhóm Đội nhóm, cộng tác viên).
- PQ21.KHACH: không.
- PQ21.ADMIN: thêm, sửa, xóa (mục "Quản trị dải ngày lễ hằng năm" (US23)).

## PQ22 · Nhóm sale
- PQ22.CHU: không áp dụng ở bản đầu (nhóm Đội nhóm, cộng tác viên).
- PQ22.SALE: không áp dụng ở bản đầu (nhóm Đội nhóm, cộng tác viên).
- PQ22.LINK: không áp dụng ở bản đầu (nhóm Đội nhóm, cộng tác viên).
- PQ22.CTV: không áp dụng ở bản đầu (nhóm Đội nhóm, cộng tác viên).
- PQ22.KHACH: không.
- PQ22.ADMIN: không áp dụng ở bản đầu (nhóm Đội nhóm, cộng tác viên).

## PQ23 · Dữ liệu còn lại khi một bên xóa tài khoản

Người dùng xóa tài khoản, server xóa số điện thoại và đánh dấu đã xóa tài khoản. Tên và mọi dữ liệu khác giữ (mục "Khi người dùng xóa tài khoản" (US22), QD-013).
- PQ23.CHU: chủ nhà còn lại thấy đặt phòng đã thành với sale đã xóa tài khoản, tên cũ kèm ghi chú nhỏ đỏ "Đã xoá tài khoản", không có số điện thoại; dòng sale đó ở CN7 không mở được, bỏ được (QD-013).
- PQ23.SALE: sale còn lại thấy đặt phòng đã thành với chủ nhà đã xóa tài khoản, tên cũ kèm ghi chú đỏ. Server không gửi căn, lịch, giá của chủ nhà đó, và từ chối đặt phòng, yêu cầu đặt phòng vào căn của chủ nhà đó bằng `KHONG_CON_QUYEN`, app báo ngay "Không gửi được yêu cầu. Chủ nhà đã xóa tài khoản trên Home247." (QD-013). Yêu cầu đặt phòng đang chờ giữ nguyên trạng thái chờ. Sale có thông báo khi chủ nhà xóa tài khoản (mục "Cài đặt thông báo" (US21)). Bỏ được dòng chủ nhà khỏi danh sách (QD-013).
- PQ23.LINK: người đã xóa tài khoản đăng nhập lại cùng tài khoản thì thấy lại dữ liệu cũ của mình (QD-013). Khi họ cho lại tên, số điện thoại (luồng xin quyền HV4) thì dùng lại như trước: server bỏ dấu đã xóa tài khoản và ghi chú "Đã xoá tài khoản", sale lại thấy căn, lịch theo kết nối cũ nếu dòng kết nối chưa bị người kia xóa (QD-013).
- PQ23.CTV: không áp dụng ở bản đầu (nhóm Đội nhóm, cộng tác viên).
- PQ23.KHACH: không.
- PQ23.ADMIN: số điện thoại đã xóa không còn để xem, trừ bản sao lưu tự động: [MỞ: CH-034]. Căn, lịch, giá còn ở máy chủ; quản trị viên xem được hay không: [MỞ: CH-034].
