---
id: PQ
tieu_de: Ma trận quyền
trang_thai: de-xuat
nguoi_chu: tung
rev: 3
---
> Luật chung, sống. Ma trận quyền: nguồn duy nhất cho câu hỏi "ai được thấy, được sửa gì". YC ghi mã ô (PQ5.SALE) ở mục Quyền. Đổi một ô là đổi phân quyền: cần Tùng duyệt và một QD.

# PQ · Ma trận quyền

Ai được xem, tạo, sửa, xóa dữ liệu nào. Mỗi hàng là một loại dữ liệu (PQ1, PQ2...), mỗi ô là một vai (PQ5.SALE). Database kiểm quyền theo bảng này bằng RLS, view và hàm `fn_*`. Mỗi ô có ít nhất một test cố tình vi phạm (bản PWA: test database trong `tests/db/`). US ghi mã ô ở mục Quyền.

Ô gắn thẻ MỞ thì không code theo phần đó; câu hỏi ở `work/cau-hoi.md` (mã PQ-H, YC-H).

## Vai
| Mã | Là ai |
|---|---|
| CHU | Người giữ căn đó: chủ nhà, hoặc sale với căn của chính mình (QD5, QD7). Chủ nhà khác không phải CHU của căn này |
| SALE | Sale đã kết nối với chủ nhà đó và chưa bị ngừng, chỉ với các căn được chia sẻ cho mình. Dòng "Bị ngừng" trong ô nói phần khác đi khi chủ nhà đã ngừng cho sale xem (QD7) |
| LINK | Người mở link mời của chủ nhà mà chưa bấm Thêm lịch, hoặc sale chưa kết nối với chủ nhà đó (QD8) |
| CTV | Cộng tác viên. Không áp dụng ở bản đầu (YC14) |
| KHACH | Khách của sale. Không dùng app, không gọi API. Chỉ nhận chữ và ảnh sale gửi qua Zalo hay ứng dụng chat khác (YC8.1) |
| ADMIN | Quản trị viên Home247, dùng web quản trị (YC13). Xem được mọi dữ liệu người dùng không mã hóa (QD7). Đăng nhập bằng mã gửi tới email; quản trị viên đầu tiên là <email quản trị viên đầu tiên>, chỉ người này thêm và gỡ người đồng quản trị trên web (YC13.1, YC13.1) |

## Luật chung
1. Server mặc định từ chối. Mọi API đi qua một chỗ kiểm quyền.
2. Dữ liệu không được phép thì server không gửi đi. Không gửi rồi ẩn trên giao diện (CLAUDE.md).
3. Không có quan hệ thì không có quyền: chủ nhà khác, sale khác, sale chưa kết nối không đọc, không ghi được dữ liệu của căn hay của người khác.
4. Mọi việc đọc, ghi của app cần đăng nhập, trừ việc xem trước link mời hợp lệ ở A1-link, A10 (PQ3.LINK, PQ18.LINK). Ở bản PWA: vai `anon` chỉ gọi được `fn_xem_link_moi`.
5. Vai tính theo quan hệ người với căn, không theo tài khoản (QD5). Một người có thể là CHU ở căn này, SALE ở căn kia. Chủ nhà không bán căn của chủ nhà khác (QD7).
6. Chặn trùng đặt phòng ở database, không chỉ ở giao diện (QT1, CLAUDE.md).
7. Dữ liệu của người đã xóa tài khoản theo PQ23 (QD13).

## PQ1 · Hồ sơ người dùng
Họ tên, tên hiển thị, ảnh đại diện, cài đặt thông báo.
- PQ1.CHU: xem, sửa hồ sơ của mình. Thấy tên hiển thị của sale đã kết nối và của sale đang xin xem lịch ở A8 (YC6, YC1.4).
- PQ1.SALE: xem, sửa hồ sơ của mình. Thấy tên hiển thị của chủ nhà đã kết nối ở Nguồn phòng (YC1.4). Bị ngừng: vẫn thấy tên chủ nhà trên đặt phòng cũ của mình (QD7).
- PQ1.LINK: thấy tên chủ nhà ở A1-link và A10 (QD8). Chưa có hồ sơ cho tới khi vào app (YC1).
- PQ1.CTV: không áp dụng ở bản đầu (YC14).
- PQ1.KHACH: không.
- PQ1.ADMIN: xem (QD7). Sửa: [MỞ: PQ1-H1].

## PQ2 · Số điện thoại người dùng
Ai cũng chỉ ghi được số của chính mình. Bản Zalo: số lấy từ Zalo, không sửa trong app (YC1.4); app chỉ gửi token số điện thoại lên máy chủ, máy chủ đổi token một lần trong 2 phút, app không chứa App Secret (`docs/_lich-su/zalo/rang-buoc.md`). Bản PWA: số lấy theo cách đăng nhập ở QD22.
- PQ2.CHU: xem số của mình. Thấy số sale đã kết nối và sale đang xin ở A8, CN7-04, nếu sale đã cho số (YC6).
- PQ2.SALE: xem số của mình. Thấy số của chủ nhà đã kết nối (QD7). Bị ngừng: [MỞ: PQ2-H1].
- PQ2.LINK: không thấy số chủ nhà (QD8, YC6).
- PQ2.CTV: không áp dụng ở bản đầu (YC14).
- PQ2.KHACH: không bao giờ (YC6).
- PQ2.ADMIN: xem (QD7).

## PQ3 · Thông tin và ảnh căn
Mã căn, số phòng ngủ, số giường, tòa nhà, loại view, ảnh, mô tả gửi khách.
- PQ3.CHU: tạo, xem, sửa căn của mình; tải và xóa ảnh căn của mình (YC3, YC4). Xóa căn là ẩn căn (YC3.6). Không đọc, không ghi căn của chủ nhà khác.
- PQ3.SALE: xem các căn được chia sẻ, dùng khi gửi khách (YC3, YC4, YC7, YC8). Được chia sẻ "tất cả căn" thì căn mới tự vào (YC6.7, QD8); chỉ được vài căn thì chỉ các căn đó (YC6.6). Không sửa. Bị ngừng: không xem căn nữa; đặt phòng cũ vẫn ghi tên căn (QD7).
- PQ3.LINK: có link mời hợp lệ thì A10 thấy tên chủ nhà, số căn, mỗi căn có ảnh, mã căn, số phòng ngủ, số giường, loại view; không có giá (QD8, QD7). Không có link, link sai, hết hạn hay đã thu hồi thì không thấy gì (QD8). Ảnh căn không mở được bằng đường dẫn trực tiếp khi không có quyền.
- PQ3.CTV: không áp dụng ở bản đầu (YC14).
- PQ3.KHACH: chỉ phần sale gửi qua Zalo (YC8.1). Không gọi API.
- PQ3.ADMIN: xem (QD7).

## PQ4 · Lịch trống, đã đặt
- PQ4.CHU: xem lịch mọi căn của mình (YC2). Lịch đổi qua đặt phòng (PQ7).
- PQ4.SALE: xem trống hay đã đặt của căn được chia sẻ, gồm cả đêm có đặt phòng của sale khác hay chủ nhà tự ghi. Đêm đó hiện "đã đặt", không có tên người đặt. Đây không phải quyền bật tắt (QD7). Bị ngừng: không xem (QD7, YC6.2).
- PQ4.LINK: không (QD8).
- PQ4.CTV: không áp dụng ở bản đầu (YC14).
- PQ4.KHACH: không.
- PQ4.ADMIN: xem (QD7).

## PQ5 · Giá chủ nhà theo đêm
Giá tháng, giá ngày lễ, giá dịp đặc biệt.
- PQ5.CHU: xem, đặt, sửa giá căn của mình (YC3, YC4). Không đặt giá cho căn của chủ nhà khác.
- PQ5.SALE: luôn xem giá của căn được chia sẻ, khi chủ nhà đã đặt giá cho đêm đó (YC6, YC3, YC4). Không có công tắc tắt giá (QD7). Bị ngừng: không.
- PQ5.LINK: không. A10 không có giá (QD8).
- PQ5.CTV: không áp dụng ở bản đầu (YC14).
- PQ5.KHACH: không bao giờ (CLAUDE.md, YC3, YC4).
- PQ5.ADMIN: xem (QD7).

## PQ6 · Cài đặt chung của chủ nhà
Ngày tính giá cuối tuần, giờ nhận và trả phòng.
- PQ6.CHU: xem, sửa của mình (YC4.6, YC1.5).
- PQ6.SALE: thấy giờ nhận, trả khi gửi khách (YC1). Ngày tính giá cuối tuần: [MỞ: PQ6-H1].
- PQ6.LINK: không.
- PQ6.CTV: không áp dụng ở bản đầu (YC14).
- PQ6.KHACH: giờ nhận, trả trong tin sale gửi (YC1).
- PQ6.ADMIN: xem (QD7).

## PQ7 · Đặt phòng
Căn, ngày nhận, ngày trả, người đặt.
- PQ7.CHU: xem mọi đặt phòng của căn mình; tạo (chặn trùng theo QT1), sửa (YC5.6). Xóa đặt phòng mình tự ghi. Không xóa đặt phòng thành từ yêu cầu của sale đã chấp nhận, server chặn (YC5.7, YC12.4). Xin hủy và chấp thuận hay từ chối hủy đặt phòng đã chấp nhận (QD12). Từ chối thì đặt phòng giữ nguyên, trạng thái "Bị từ chối hủy". Hủy xong thì các đêm tương lai trống lại (QD12). Đặt phòng chủ nhà tự ghi chọn người đặt là một sale thì tính là đặt phòng của sale đó (YC5.4).
- PQ7.SALE: xem chi tiết đặt phòng của mình, gồm đặt phòng chủ nhà ghi chọn sale này. Đặt phòng của người khác chỉ thấy là "đã đặt" (PQ4.SALE). Không tạo thẳng vào lịch chủ nhà, chỉ gửi yêu cầu (PQ10). Không sửa, không xóa. Xin hủy và chấp thuận hay từ chối hủy đặt phòng của mình (QD12). Bị ngừng: vẫn xem lại đặt phòng cũ của mình với chủ nhà đó (QD7); xin hủy được không: [MỞ: PQ7-H1] QD12.
- PQ7.LINK: không.
- PQ7.CTV: không áp dụng ở bản đầu (YC14).
- PQ7.KHACH: không.
- PQ7.ADMIN: xem (QD7).

## PQ8 · Tiền của đặt phòng
Tiền phòng, tiền cọc, trạng thái thu.
- PQ8.CHU: xem, sửa của đặt phòng căn mình (YC2, YC5, YC9).
- PQ8.SALE: tiền phòng của đặt phòng của mình: thấy (QD7). Tình trạng cọc của đặt phòng của mình: chỉ thấy đã cọc hay chưa, khi quyền "Tình trạng cọc" bật; không bao giờ thấy số tiền cọc (QD7). Nhãn "Đã thanh toán", "còn thu": [MỞ: PQ8-H1] QD7 chỉ nói đã cọc hay chưa. Đặt phòng của người khác: không.
- PQ8.LINK: không.
- PQ8.CTV: không áp dụng ở bản đầu (YC14).
- PQ8.KHACH: không.
- PQ8.ADMIN: xem (QD7).

## PQ9 · Tên, số điện thoại khách trong đặt phòng
- PQ9.CHU: xem, sửa khách do mình nhập, kể cả khách lẻ. Không thấy khách của sale (QD11).
- PQ9.SALE: xem, sửa khách do mình nhập. Không bao giờ thấy khách của chủ nhà (QD11, CLAUDE.md).
- PQ9.LINK: không.
- PQ9.CTV: không áp dụng ở bản đầu (YC14).
- PQ9.KHACH: không dùng app.
- PQ9.ADMIN: xem (QD7).

## PQ10 · Yêu cầu đặt phòng
Yêu cầu của sale, trạng thái, lý do từ chối.
- PQ10.CHU: xem yêu cầu gửi tới căn của mình; chấp nhận, từ chối kèm lý do (YC9.2). Không thấy giá bán của sale (PQ11).
- PQ10.SALE: gửi yêu cầu cho căn được chia sẻ, đêm còn trống (YC9.1); xem, hủy yêu cầu của mình; thấy lý do từ chối (YC9.4). Không thấy yêu cầu của sale khác (YC5, YC9). Bị ngừng: không gửi yêu cầu mới; yêu cầu đang chờ giữ nguyên, sale vẫn đọc và hủy được, chủ nhà không chấp nhận được nhưng vẫn từ chối được, không ai trả lời thì hết hạn (PQ10-H1, YC9-H3, YC9-H4, Claude tự chốt QD25). `[r3 · sửa]`
- PQ10.LINK: không.
- PQ10.CTV: không áp dụng ở bản đầu (YC14).
- PQ10.KHACH: không.
- PQ10.ADMIN: xem (QD7).

## PQ11 · Giá bán, mức cộng thêm, mẫu tin
- PQ11.CHU: không bao giờ thấy (YC5, YC9, YC7, YC8).
- PQ11.SALE: chỉ của mình; xem, sửa (YC7, YC8). Đêm chưa đặt giá thì không có giá bán.
- PQ11.LINK: không.
- PQ11.CTV: không áp dụng ở bản đầu (YC14).
- PQ11.KHACH: thấy giá bán trong tin sale gửi, không thấy phần cộng thêm (YC7, YC8).
- PQ11.ADMIN: xem (QD7).

## PQ12 · Lần gửi khách
Căn, các đêm, lúc gửi (YC8.1, YC12.4).
- PQ12.CHU: không.
- PQ12.SALE: chỉ của mình. App ghi khi sale bấm gửi.
- PQ12.LINK: không.
- PQ12.CTV: không áp dụng ở bản đầu (YC14).
- PQ12.KHACH: không.
- PQ12.ADMIN: xem (QD7).

## PQ13 · Căn của sale
Căn sale sở hữu hay thuê lại để kinh doanh (YC10.1, QD5).
- PQ13.CHU: sale có căn là CHU của căn đó: mọi quyền ở cột CHU của PQ3 đến PQ9 với căn này (QD7).
- PQ13.SALE: sale khác không thấy. Bản đầu không có cách chia căn của sale cho sale khác (QD5).
- PQ13.LINK: không.
- PQ13.CTV: không áp dụng ở bản đầu (YC14).
- PQ13.KHACH: phần sale gửi qua Zalo.
- PQ13.ADMIN: xem (QD7).

## PQ14 · Căn tự nhập
Căn tự nhập, tên và số điện thoại chủ căn tự nhập, đặt phòng sale tự ghi cho căn đó.
- PQ14.CHU: không. Chủ căn thật chưa dùng app; chủ nhà khác không thấy (YC10, QD11).
- PQ14.SALE: chỉ sale tạo căn: tạo, xem, sửa, xóa. Số chủ căn không xuất ra file (QD11). Ô ngày hiện "?", không bao giờ "trống" (CLAUDE.md, YC7, YC8). Sale khác không thấy, kể cả qua nhóm (YC14, QD11).
- PQ14.LINK: không.
- PQ14.CTV: không áp dụng ở bản đầu (YC14).
- PQ14.KHACH: phần sale gửi qua Zalo.
- PQ14.ADMIN: xem (QD7).

## PQ15 · Tiền chênh, doanh số của sale
- PQ15.CHU: không (YC10, YC11).
- PQ15.SALE: chỉ của mình (YC11, QT3).
- PQ15.LINK: không.
- PQ15.CTV: không áp dụng ở bản đầu (YC14).
- PQ15.KHACH: không.
- PQ15.ADMIN: xem (QD7).

## PQ16 · Doanh thu, công suất, chưa thu của chủ nhà
- PQ16.CHU: của mình (YC2, YC11).
- PQ16.SALE: không bao giờ (YC6 quy tắc Quyền sale được xem).
- PQ16.LINK: không.
- PQ16.CTV: không áp dụng ở bản đầu (YC14).
- PQ16.KHACH: không.
- PQ16.ADMIN: xem (QD7).

## PQ17 · Kết nối và quyền xem
Danh sách sale của chủ nhà, phạm vi chia sẻ (tất cả căn hoặc chọn căn), quyền "Tình trạng cọc", ngừng cho xem.
- PQ17.CHU: xem danh sách sale của mình và đặt phòng của từng sale; thêm sale bằng tay; bật tắt hai quyền cho từng sale; ngừng cho xem (YC6.5, YC6.2). Sale vào qua link mời hay CN10 nhận mặc định: giá bật, cọc bật (QD7). Không xem, không đổi, không ngừng sale của chủ nhà khác.
- PQ17.SALE: xem danh sách chủ nhà đã kết nối ở Nguồn phòng, bỏ nguồn (YC10.2). Không thấy các sale khác của chủ nhà (YC6). Không tự đổi quyền của mình. Bị ngừng: nhận thông báo (YC12.4); chủ nhà còn hiện ở Nguồn phòng không: [MỞ: PQ17-H1].
- PQ17.LINK: bấm Thêm lịch ở A10 thì thành SALE (QD8). Đã thêm rồi mà mở lại link thì thấy A10-01, không thêm lần nữa (QD8).
- PQ17.CTV: không áp dụng ở bản đầu (YC14).
- PQ17.KHACH: không.
- PQ17.ADMIN: xem (QD7).

## PQ18 · Link mời và link xin lịch
Link mời của chủ nhà, link xin lịch của sale, số lần đã gửi.
- PQ18.CHU: tạo, gửi, thu hồi link mời của mình (QD8). Mở link xin lịch của sale thì thấy A8 (YC6.5).
- PQ18.SALE: tạo, gửi link xin lịch của mình; xem số lần đã gửi, số chủ nhà đã đồng ý (A7, YC6.4).
- PQ18.LINK: mở link mời hợp lệ thì thấy A1-link hoặc A10 (PQ3.LINK). Link mời hết hạn sau 21 ngày (QD8). Link hết hạn hay đã thu hồi: không thấy dữ liệu; màn A1-link-01, chữ cụ thể: YC6-H10. [r2 · sửa] Link xin lịch của sale không hết hạn ở bản 1 (PQ18-H1, Claude tự chốt): mỗi sale một link, người mở link chỉ chia sẻ được lịch của chính họ cho sale, không đọc được gì của sale.
- PQ18.CTV: không áp dụng ở bản đầu (YC14).
- PQ18.KHACH: không.
- PQ18.ADMIN: xem (QD7).

## PQ19 · Thông báo
- PQ19.CHU: chỉ thông báo của mình (YC12.4).
- PQ19.SALE: chỉ thông báo của mình (YC12.4). Thông báo không chứa dữ liệu sale không được xem: không tên người đặt, không tên khách, không giá bán của sale khác (YC12.4, QD7).
- PQ19.LINK: không.
- PQ19.CTV: không áp dụng ở bản đầu (YC14).
- PQ19.KHACH: không.
- PQ19.ADMIN: xem (QD7).

## PQ20 · Xuất file
Xuất file Excel (CSV) ở P8. Sao lưu và khôi phục On Hold (bản sau, docs/product/requirements/README.md).
- PQ20.CHU: chỉ dữ liệu của mình. Có cột tên, số khách do chủ nhà nhập (QD11). Không có khách của sale.
- PQ20.SALE: không (YC1).
- PQ20.LINK: không.
- PQ20.CTV: không áp dụng ở bản đầu (YC14).
- PQ20.KHACH: không.
- PQ20.ADMIN: [MỞ: PQ20-H1].

## PQ21 · Dải ngày lễ
- PQ21.CHU: xem trong "Chọn nhanh ngày lễ"; sửa dải áp cho giá của mình (YC4.3). Không sửa dải chung của Home247.
- PQ21.SALE: [MỞ: PQ21-H1].
- PQ21.LINK: không.
- PQ21.CTV: không áp dụng ở bản đầu (YC14).
- PQ21.KHACH: không.
- PQ21.ADMIN: thêm, sửa, xóa (YC13.2).

## PQ22 · Nhóm sale
- PQ22.CHU: không áp dụng ở bản đầu (YC14).
- PQ22.SALE: không áp dụng ở bản đầu (YC14).
- PQ22.LINK: không áp dụng ở bản đầu (YC14).
- PQ22.CTV: không áp dụng ở bản đầu (YC14).
- PQ22.KHACH: không.
- PQ22.ADMIN: không áp dụng ở bản đầu (YC14).

## PQ23 · Dữ liệu còn lại khi một bên xóa tài khoản

Người dùng xóa tài khoản, server xóa số điện thoại và đánh dấu đã xóa tài khoản. Tên và mọi dữ liệu khác giữ (YC1.8, QD13).
- PQ23.CHU: chủ nhà còn lại thấy đặt phòng đã thành với sale đã xóa tài khoản, tên cũ kèm ghi chú nhỏ đỏ "Đã xoá tài khoản", không có số điện thoại; dòng sale đó ở CN7 không mở được, bỏ được (QD13).
- PQ23.SALE: sale còn lại thấy đặt phòng đã thành với chủ nhà đã xóa tài khoản, tên cũ kèm ghi chú đỏ. Server không gửi căn, lịch, giá của chủ nhà đó, và từ chối đặt phòng, yêu cầu đặt phòng vào căn của chủ nhà đó bằng `KHONG_CON_QUYEN`, app báo ngay "Không gửi được yêu cầu. Chủ nhà đã xóa tài khoản trên Home247." (QD13). Yêu cầu đặt phòng đang chờ giữ nguyên trạng thái chờ. Sale có thông báo khi chủ nhà xóa tài khoản (YC12.4). Bỏ được dòng chủ nhà khỏi danh sách (QD13).
- PQ23.LINK: người đã xóa tài khoản đăng nhập lại cùng tài khoản thì thấy lại dữ liệu cũ của mình (QD13). Khi họ cho lại tên, số điện thoại (luồng xin quyền HV4) thì dùng lại như trước: server bỏ dấu đã xóa tài khoản và ghi chú "Đã xoá tài khoản", sale lại thấy căn, lịch theo kết nối cũ nếu dòng kết nối chưa bị người kia xóa (QD13).
- PQ23.CTV: không áp dụng ở bản đầu (YC14).
- PQ23.KHACH: không.
- PQ23.ADMIN: số điện thoại đã xóa không còn để xem, trừ bản sao lưu tự động: [MỞ: PQ23-H1]. Căn, lịch, giá còn ở máy chủ; quản trị viên xem được hay không: [MỞ: PQ23-H1].

## Lịch sử sửa đổi

| Rev | Ngày | Người | Sửa gì |
|---|---|---|---|
| 2 | 2026-11-19 | Claude (QD25) | PQ18.LINK: trả lời PQ18-H1, link xin lịch không hết hạn ở bản 1. |
| 3 | 2026-11-19 | Claude (QD25) | PQ10.SALE: trả lời PQ10-H1 theo YC9-H3, YC9-H4. |
