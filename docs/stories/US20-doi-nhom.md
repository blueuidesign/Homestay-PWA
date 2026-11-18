# US20 · Đội nhóm sale

- Loại: tính năng
- Trạng thái: chưa làm
- Bản: sau
- Rủi ro: cao
- Làm sau khi xong: không phụ thuộc story nào
- Kiểm tay: `tests/kich-ban/US20.md` (17 kịch bản)

## Mục tiêu
Là trưởng nhóm sale, tôi muốn cả nhóm thấy ai đang chờ chủ căn nào, để không gửi trùng khách. Làm sau ra mắt (YC8).

## Hành vi
Bảng bước ghi: người dùng làm gì, app hiện gì (chữ trong ngoặc kép là chữ trên màn), máy chủ phải làm gì, dữ liệu nào đổi. Cột "Máy chủ" mô tả việc phải xảy ra; bản PWA làm bằng RLS, view và hàm `fn_*` của Supabase.

### YC8.1 · Vào mục Đội nhóm khi chưa có nhóm
Rủi ro: thap
Mục đích: sale biết nhóm là gì, tạo nhóm hoặc biết cách vào nhóm của người khác.
Màn hình: S8-00
Khi nào xảy ra: sale vào Cá nhân > "Đội nhóm" khi chưa thuộc nhóm nào.

Hành vi:
| Bước | Người dùng | App | Máy chủ | Ngoài app | Dữ liệu đổi |
|---|---|---|---|---|---|
| 1 | Mở "Đội nhóm" | "Bán theo nhóm": "Cả nhóm dùng chung nguồn phòng và thấy ai đang đặt căn nào, không gửi trùng khách." | ? | ? | ? |
| 2 | Bấm "Tạo nhóm" | Sang YC8.2 | ? | ? | ? |
| 3 | Đọc "Được mời vào nhóm?" | "Mở link trưởng nhóm gửi trong Zalo, nhóm sẽ hiện ở đây." | ? | ? | ? |

Theo quy tắc: Một sale một nhóm (đề xuất, xem YC8-H6).

Trạng thái màn:
- rỗng: chính màn này
- đang tải: chưa thiết kế
- lỗi mạng: chưa thiết kế
- không có quyền: chưa thiết kế
- từ chối quyền: không áp dụng
- quay lại từ nền: chưa thiết kế
- mở từ link: xem YC8.4

### YC8.2 · Tạo nhóm
Rủi ro: tb
Mục đích: sale đặt tên nhóm và chọn nguồn phòng nào chia sẻ cho cả nhóm.
Màn hình: S8-01
Khi nào xảy ra: sale bấm "Tạo nhóm".

Hành vi:
| Bước | Người dùng | App | Máy chủ | Ngoài app | Dữ liệu đổi |
|---|---|---|---|---|---|
| 1 | Mở màn | Ô "Tên nhóm *" kèm ghi chú "Thành viên thấy tên này khi nhận link mời." | ? | ? | ? |
| 2 | Chọn nguồn phòng chia sẻ | Danh sách chủ nhà: "Chị Hoa · 2 căn", "Anh Tuấn · 4 căn", "Chú Bình · tự nhập". Ghi chú "Thành viên tìm được các căn này. Chủ nhà được báo và có thể tắt chia sẻ." | ? | ? | ? |
| 3 | Bấm "Tạo nhóm" | Tạo nhóm, người tạo thành trưởng nhóm, sang màn nhóm (YC8.5) | ? | ? | Nhóm mới, danh sách nguồn chia sẻ |
| 4 | Chủ nhà được báo | Ghi chú nói "Chủ nhà được báo"; hình thức báo: chưa thiết kế | ? | ? | ? |

Theo quy tắc: Chia sẻ nguồn phòng cho nhóm (xem YC8-H1 và 2).

Trạng thái màn:
- rỗng: S8-01 lúc mới mở, chưa nhập tên
- đang tải: chưa thiết kế
- lỗi mạng: chưa thiết kế
- không có quyền: chưa thiết kế
- từ chối quyền: không áp dụng
- quay lại từ nền: chưa thiết kế
- mở từ link: không áp dụng

### YC8.3 · Mời thành viên
Rủi ro: cao
Mục đích: trưởng nhóm gửi link mời cho sale khác qua Zalo.
Màn hình: S8-02
Khi nào xảy ra: trưởng nhóm bấm "+ Mời" hoặc "Mời thành viên".

Hành vi:
| Bước | Người dùng | App | Máy chủ | Ngoài app | Dữ liệu đổi |
|---|---|---|---|---|---|
| 1 | Mở màn | "Mời vào nhóm": "Gửi link này cho sale qua Zalo. Sale mở link và đồng ý là vào nhóm." kèm link của nhóm | ? | ? | ? |
| 2 | Bấm "Gửi qua Zalo" | Mở cửa sổ gửi của Zalo với link | ? | Cửa sổ chia sẻ của Zalo | ? |
| 3 | Bấm "Sao chép link" | Sao chép link | ? | ? | ? |
| 4 | Đọc "THÀNH VIÊN SẼ" | "Tìm được căn trong nguồn phòng chung", "Thấy ai đang giữ căn nào", "Thấy tiền chênh của người khác" | ? | ? | ? |
| 5 | Xem "ĐÃ MỜI · CHƯA VÀO" | Số điện thoại che giữa, "Mời hôm qua", nút "Nhắc lại" | ? | Cửa sổ chia sẻ của Zalo (?) | ? |

Theo quy tắc: app không tự gửi tin (YC1); Link mời của nhóm.

Trạng thái màn:
- rỗng: chưa có ai đã mời mà chưa vào (chưa thiết kế mục này khi trống)
- đang tải: chưa thiết kế
- lỗi mạng: chưa thiết kế
- không có quyền: chưa thiết kế (thành viên thường có thấy nút mời không)
- từ chối quyền: không áp dụng
- quay lại từ nền: chưa thiết kế
- mở từ link: không áp dụng

### YC8.4 · Sale mở link mời vào nhóm
Rủi ro: cao
Mục đích: sale biết mình sắp vào nhóm nào, sẽ chia sẻ gì và thấy gì, rồi đồng ý hoặc từ chối.
Màn hình: S8-03
Khi nào xảy ra: sale mở link mời của nhóm trong Zalo.

Hành vi:
| Bước | Người dùng | App | Máy chủ | Ngoài app | Dữ liệu đổi |
|---|---|---|---|---|---|
| 1 | Mở link | "Lời mời vào nhóm": tên nhóm, "Sale Hùng mời bạn vào nhóm", "4 thành viên · 3 chủ nhà · 7 căn" | ? | Mở app từ link | ? |
| 2 | Đọc "KHI VÀO NHÓM" | "Bạn tìm được 7 căn chung của nhóm", "Trưởng nhóm thấy đặt phòng và tiền chênh của bạn", "Nguồn phòng riêng của bạn vẫn là của bạn" | ? | ? | ? |
| 3 | Bấm "Vào nhóm" | Vào nhóm, sang màn nhóm thành viên (YC8.7) | ? | ? | Thành viên mới của nhóm |
| 4 | Bấm "Từ chối" | Không vào nhóm (màn sau đó: chưa thiết kế) | ? | ? | ? |

Theo quy tắc: Chia sẻ nguồn phòng cho nhóm; Trưởng nhóm thấy booking và tiền chênh.

Trạng thái màn:
- rỗng: không áp dụng
- đang tải: chưa thiết kế
- lỗi mạng: chưa thiết kế
- không có quyền: chưa thiết kế (link hết hạn, nhóm đã đầy)
- từ chối quyền: chưa thiết kế
- quay lại từ nền: chưa thiết kế
- mở từ link: chính màn này. Người chưa đăng nhập và chưa kết nối: chưa thiết kế (xem YC1.3)

### YC8.5 · Màn nhóm của trưởng nhóm
Rủi ro: cao
Mục đích: trưởng nhóm thấy cả nhóm bán được bao nhiêu, ai đang chờ chủ, và quản lý thành viên.
Màn hình: S8
Khi nào xảy ra: trưởng nhóm vào "Đội nhóm".

Hành vi:
| Bước | Người dùng | App | Máy chủ | Ngoài app | Dữ liệu đổi |
|---|---|---|---|---|---|
| 1 | Mở màn | Tên nhóm ở tiêu đề. Thẻ "ĐẶT PHÒNG NHÓM THÁNG 10: 21", "TIỀN CHÊNH NHÓM: 12.6tr" | ? | ? | ? |
| 2 | Xem chờ chủ | "CHỜ CHỦ CHẤP NHẬN · 2": mỗi dòng gồm căn, ngày, tên sale gửi, nhãn "Chờ chủ" | ? | ? | ? |
| 3 | Xem thành viên | "THÀNH VIÊN · 4": tên, "Trưởng nhóm" hoặc số booking, tiền chênh ("6 đặt phòng · chênh 3.1tr") | ? | ? | ? |
| 4 | Bấm "+ Mời" hoặc "Mời thành viên" | Sang YC8.3 | ? | ? | ? |
| 5 | Chạm một thành viên | Sang YC8.6 | ? | ? | ? |
| 6 | Xem nguồn chung | "NGUỒN PHÒNG CHUNG: 3 chủ nhà · 7 căn" kèm tên các chủ nhà | ? | ? | ? |

Theo quy tắc: Trưởng nhóm thấy booking và tiền chênh; Tiền chênh của sale (YC6); Doanh thu tính theo tháng (YC7).

Trạng thái màn:
- rỗng: nhóm chỉ có trưởng nhóm (chưa thiết kế)
- đang tải: chưa thiết kế
- lỗi mạng: chưa thiết kế
- không có quyền: không áp dụng
- từ chối quyền: không áp dụng
- quay lại từ nền: chưa thiết kế
- mở từ link: không áp dụng

### YC8.6 · Chi tiết thành viên và xóa khỏi nhóm
Rủi ro: cao
Mục đích: trưởng nhóm xem một thành viên đang làm gì và mời họ ra khỏi nhóm nếu cần.
Màn hình: S8-04
Khi nào xảy ra: trưởng nhóm chạm một thành viên.

Hành vi:
| Bước | Người dùng | App | Máy chủ | Ngoài app | Dữ liệu đổi |
|---|---|---|---|---|---|
| 1 | Mở chi tiết | Tên, số điện thoại che giữa, "vào nhóm 12/09/2026", nút "Gọi" | ? | Gọi mở ứng dụng gọi (?) | ? |
| 2 | Xem số liệu | "ĐẶT PHÒNG THÁNG 10: 6", "TIỀN CHÊNH: 3.1tr" | ? | ? | ? |
| 3 | Xem việc đang làm | "ĐANG LÀM": mỗi dòng gồm căn, ngày, câu trạng thái, nhãn "Chờ chủ" hoặc "Đã chốt" | ? | ? | ? |
| 4 | Bấm "Xóa khỏi nhóm" | Xóa thành viên (có bấm xác nhận lần hai không: chưa thiết kế) | ? | ? | Thành viên rời nhóm |

Theo quy tắc: Xóa phải bấm hai lần (YC4); Trưởng nhóm thấy booking và tiền chênh.

Trạng thái màn:
- rỗng: thành viên chưa có booking (chưa thiết kế)
- đang tải: chưa thiết kế
- lỗi mạng: chưa thiết kế
- không có quyền: không áp dụng
- từ chối quyền: không áp dụng
- quay lại từ nền: chưa thiết kế
- mở từ link: không áp dụng

### YC8.7 · Màn nhóm của thành viên thường và rời nhóm
Rủi ro: tb
Mục đích: thành viên thấy mình đóng góp bao nhiêu, ai đang chờ chủ để tránh gửi trùng, và rời nhóm khi muốn.
Màn hình: S8-05
Khi nào xảy ra: thành viên vào "Đội nhóm".

Hành vi:
| Bước | Người dùng | App | Máy chủ | Ngoài app | Dữ liệu đổi |
|---|---|---|---|---|---|
| 1 | Mở màn | Tên nhóm, "Trưởng nhóm: Sale Hùng", số điện thoại, nút "Gọi" | ? | Gọi mở ứng dụng gọi (?) | ? |
| 2 | Xem số liệu của mình | "ĐẶT PHÒNG CỦA BẠN: 6", "TIỀN CHÊNH CỦA BẠN: 3.1tr" | ? | ? | ? |
| 3 | Xem chờ chủ | "CHỜ CHỦ CHẤP NHẬN · 2", gồm yêu cầu của mình ("Bạn · chờ chủ chấp nhận") và của người khác ("Sale Hùng · chờ chủ trả lời") | ? | ? | ? |
| 4 | Xem thành viên | "THÀNH VIÊN · 4": tên, "Trưởng nhóm"; không hiện số booking hay tiền chênh của người khác | ? | ? | ? |
| 5 | Bấm "Rời nhóm" | Rời nhóm (có xác nhận lần hai không: chưa thiết kế) | ? | ? | Thành viên rời nhóm |

Theo quy tắc: Trưởng nhóm thấy booking và tiền chênh (thành viên không thấy của người khác); Xóa phải bấm hai lần (YC4).

Trạng thái màn:
- rỗng: không áp dụng
- đang tải: chưa thiết kế
- lỗi mạng: chưa thiết kế
- không có quyền: không áp dụng
- từ chối quyền: không áp dụng
- quay lại từ nền: chưa thiết kế
- mở từ link: không áp dụng

## Tiêu chí nghiệm thu
Mỗi tiêu chí một test tự động mang đúng mã này trong tên test. Mã không đổi nghĩa; đổi hành vi thì cấp mã mới (docs/QUY_TRINH.md mục 5).

- **YC8.1-NT1** Khi sale chưa thuộc nhóm nào, thì "Đội nhóm" mở S8-00 với nút "Tạo nhóm".
- **YC8.1-NT2** Khi sale đã thuộc một nhóm, thì "Đội nhóm" mở màn nhóm (YC8.5 hoặc YC8.7), không phải S8-00.
- **YC8.2-NT1** Khi sale chưa nhập tên nhóm, thì nút "Tạo nhóm" chưa dùng được.
- **YC8.2-NT2** Khi sale tạo nhóm xong, thì sale là "Trưởng nhóm" và nhóm có đúng các nguồn đã chọn.
- **YC8.2-NT3** Khi sale không có nguồn phòng nào, thì vẫn tạo được nhóm (chưa thiết kế, xem YC8-H10).
- **YC8.3-NT1** Khi trưởng nhóm bấm "Gửi qua Zalo", thì cửa sổ Zalo mở với link của đúng nhóm; app không tự gửi tin.
- **YC8.3-NT2** Khi trưởng nhóm bấm "Sao chép link", thì bộ nhớ tạm có link mời.
- **YC8.3-NT3** Khi có người đã được mời mà chưa vào, thì họ nằm trong "ĐÃ MỜI · CHƯA VÀO" kèm "Nhắc lại".
- **YC8.4-NT1** Khi sale mở link, thì thấy tên nhóm, tên người mời và số thành viên, chủ nhà, căn trước khi đồng ý.
- **YC8.4-NT2** Khi sale bấm "Vào nhóm", thì sale thấy 7 căn chung của nhóm và nguồn phòng riêng của sale vẫn nguyên.
- **YC8.4-NT3** Khi sale bấm "Từ chối", thì sale không thấy gì của nhóm.
- **YC8.5-NT1** Khi nhóm có 4 thành viên với 8, 6, 5, 2 booking, thì "ĐẶT PHÒNG NHÓM" ghi 21.
- **YC8.5-NT2** Khi có 2 yêu cầu chờ chủ trong nhóm, thì mục "CHỜ CHỦ CHẤP NHẬN · 2" liệt kê đúng 2 dòng và tên sale gửi.
- **YC8.5-NT3** Khi trưởng nhóm chạm một thành viên, thì mở chi tiết thành viên đó.
- **YC8.6-NT1** Khi trưởng nhóm bấm "Xóa khỏi nhóm" một lần, thì chưa xóa, chỉ hiện nút xác nhận.
- **YC8.6-NT2** Khi trưởng nhóm xác nhận, thì thành viên không còn trong nhóm và không còn thấy nguồn chung.
- **YC8.6-NT3** Khi thành viên bị xóa, thì booking họ đã làm vẫn còn trong lịch sử của chính họ.
- **YC8.7-NT1** Khi thành viên thường mở màn nhóm, thì chỉ thấy số booking và tiền chênh của chính mình.
- **YC8.7-NT2** Khi thành viên bấm "Rời nhóm", thì mất quyền thấy nguồn chung của nhóm và vẫn giữ nguồn phòng riêng.
- **YC8.7-NT3** Khi người khác trong nhóm có yêu cầu chờ chủ cho cùng căn và ngày, thì thành viên thấy dòng đó để không gửi trùng khách.

## Luật chung dùng
Nguyên văn ở `docs/luat-chung/` (QT.md, HV.md, Nghiep_vu.md, Tu_dien.md), tìm theo mã hoặc tên.

Quy tắc trong YC8: Chia sẻ nguồn phòng cho nhóm, Trưởng nhóm thấy booking và tiền chênh, Thấy ai đang chờ chủ, Nguồn phòng riêng vẫn của riêng, Link mời của nhóm. QT3.1 (tiền chênh), QT2.2 (đặt phòng tính theo tháng của đêm), YC8, QD-005. HV1 đến HV3 (YC8 ghi các trạng thái này "chưa thiết kế", chưa có màn).

## Màn hình
Hình: `python3 docs/thiet-ke/trich-man.py <mã màn>` (docs/thiet-ke/README.md). Chữ và số trên hình lệch story thì story đúng.

S8-00, S8-01, S8, S8-02, S8-03, S8-04, S8-05.

**S8-00 · Đội nhóm, chưa có nhóm**
Vào từ: Cá nhân của sale (P4) > "Đội nhóm". Không còn đường vào từ tab "Sale" (QD-005).
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Nhãn trên canvas | "Đội nhóm · On Hold" cạnh mã màn | YC8 |
| 2 | Nội dung | Giữ nguyên, xem YC8.1 | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| Xem YC8.1 | | |
Trạng thái riêng:
- rỗng: xem YC8.1
- đang tải: chưa thiết kế
- lỗi mạng: chưa thiết kế
- không có quyền: chưa thiết kế
- quay lại từ nền: chưa thiết kế
- mở từ link: xem YC8.1

**S8-01 · Tạo nhóm**
Vào từ: Cá nhân của sale (P4) > "Đội nhóm". Không còn đường vào từ tab "Sale" (QD-005).
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Nhãn trên canvas | "Đội nhóm · On Hold" cạnh mã màn | YC8 |
| 2 | Nội dung | Giữ nguyên, xem YC8.2 | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| Xem YC8.2 | | |
Trạng thái riêng:
- rỗng: xem YC8.2
- đang tải: chưa thiết kế
- lỗi mạng: chưa thiết kế
- không có quyền: chưa thiết kế
- quay lại từ nền: chưa thiết kế
- mở từ link: xem YC8.2

**S8-02 · Mời thành viên**
Vào từ: Cá nhân của sale (P4) > "Đội nhóm". Không còn đường vào từ tab "Sale" (QD-005).
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Nhãn trên canvas | "Đội nhóm · On Hold" cạnh mã màn | YC8 |
| 2 | Nội dung | Giữ nguyên, xem YC8.3 | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| Xem YC8.3 | | |
Trạng thái riêng:
- rỗng: xem YC8.3
- đang tải: chưa thiết kế
- lỗi mạng: chưa thiết kế
- không có quyền: chưa thiết kế
- quay lại từ nền: chưa thiết kế
- mở từ link: xem YC8.3

**S8-03 · Sale mở link mời vào nhóm**
Vào từ: Cá nhân của sale (P4) > "Đội nhóm". Không còn đường vào từ tab "Sale" (QD-005).
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Nhãn trên canvas | "Đội nhóm · On Hold" cạnh mã màn | YC8 |
| 2 | Nội dung | Giữ nguyên, xem YC8.4 | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| Xem YC8.4 | | |
Trạng thái riêng:
- rỗng: xem YC8.4
- đang tải: chưa thiết kế
- lỗi mạng: chưa thiết kế
- không có quyền: chưa thiết kế
- quay lại từ nền: chưa thiết kế
- mở từ link: xem YC8.4

**S8-04 · Chi tiết thành viên**
Vào từ: Cá nhân của sale (P4) > "Đội nhóm". Không còn đường vào từ tab "Sale" (QD-005).
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Nhãn trên canvas | "Đội nhóm · On Hold" cạnh mã màn | YC8 |
| 2 | Nội dung | Giữ nguyên, xem YC8.6 | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| Xem YC8.6 | | |
Trạng thái riêng:
- rỗng: xem YC8.6
- đang tải: chưa thiết kế
- lỗi mạng: chưa thiết kế
- không có quyền: chưa thiết kế
- quay lại từ nền: chưa thiết kế
- mở từ link: xem YC8.6

**S8-05 · Nhóm, thành viên thường**
Vào từ: Cá nhân của sale (P4) > "Đội nhóm". Không còn đường vào từ tab "Sale" (QD-005).
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Nhãn trên canvas | "Đội nhóm · On Hold" cạnh mã màn | YC8 |
| 2 | Nội dung | Giữ nguyên, xem YC8.7 | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| Xem YC8.7 | | |
Trạng thái riêng:
- rỗng: xem YC8.7
- đang tải: chưa thiết kế
- lỗi mạng: chưa thiết kế
- không có quyền: chưa thiết kế
- quay lại từ nền: chưa thiết kế
- mở từ link: xem YC8.7

**S8 · Nhóm của tôi, trưởng nhóm**
Vào từ: Cá nhân của sale (P4) > "Đội nhóm". Không còn đường vào từ tab "Sale" (QD-005).
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Nhãn trên canvas | "Đội nhóm · On Hold" cạnh mã màn | YC8 |
| 2 | Nội dung | Giữ nguyên, xem YC8.5 | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| Xem YC8.5 | | |
Trạng thái riêng:
- rỗng: xem YC8.5
- đang tải: chưa thiết kế
- lỗi mạng: chưa thiết kế
- không có quyền: chưa thiết kế
- quay lại từ nền: chưa thiết kế
- mở từ link: xem YC8.5

## Quyền
Ô quyền theo `docs/luat-chung/PQ.md`. Mỗi ô phải có test chứng minh người không có quyền thì không đọc, không ghi được; test ở lớp database (`tests/db/`).

Ô PQ chạm tới: PQ22.CHU, PQ22.SALE, PQ22.LINK, PQ22.ADMIN hiện đều ghi "không áp dụng ở bản đầu (YC8)", nên chưa có quyền để viết test. Khi mở lại US này phải điền PQ22 trước (ma trận `docs/luat-chung/PQ.md`). Test vi phạm dự kiến, theo bảng "Ai thấy gì" của YC8:
- Thành viên thường gọi API số liệu nhóm, không thấy đặt phòng và tiền chênh của thành viên khác.
- Sale ngoài nhóm không thấy nhóm, thành viên, yêu cầu chờ chủ của nhóm.
- Chủ nhà gọi API nhóm: không thấy nhóm, không thấy phần chênh của sale.
- Người không có link hợp lệ không vào được nhóm; thành viên bị xóa không còn thấy nguồn chung.
- Không phiên: `CHUA_DANG_NHAP`.

Mâu thuẫn cần Tùng quyết trước khi code: PQ15.SALE ghi tiền chênh, doanh số "chỉ của mình" và PQ10.SALE ghi sale không thấy yêu cầu của sale khác, trong khi YC8.5 cho trưởng nhóm thấy booking, tiền chênh của thành viên và YC8.7-NT3 cho thành viên thấy yêu cầu chờ chủ của nhau. [MỞ: US20-H1] US20-Q2

## Ngoài phạm vi
- Giải tán nhóm, đổi trưởng nhóm, trưởng nhóm rời nhóm, đổi tên nhóm, thêm bớt nguồn chung sau khi tạo, link hết hạn hay nhóm đầy, số thành viên tối đa (YC8-H8): chưa có YC, chưa có US.
- Chủ nhà được báo khi nhóm chia sẻ nguồn của họ, và tắt chia sẻ (YC8.2 bước 4, quy tắc Chia sẻ nguồn phòng cho nhóm): hình thức báo chưa thiết kế, chưa có US.
- Cộng tác viên (YC8-H9, YC8, PQ CTV): không áp dụng ở bản đầu.
- Thống kê của sale (YC7.5): US19. Gửi yêu cầu đặt phòng và chờ chủ (YC4.5): US15. Nguồn phòng của sale (YC6.1): US16.
- Dữ liệu mẫu cho nhóm chưa có trong DLM (DLM.9); khi mở lại, đưa số của YC8 vào DLM.

## Việc cần làm
- [ ] Đọc story này và các luật chung nó trỏ tới. Chỗ nào gắn thẻ MỞ thì không code, hỏi Tùng (docs/Cau_hoi_mo.md).
- [ ] Viết test cho từng tiêu chí chưa có test, test đỏ trước (lớp test: docs/QUY_TRINH.md mục 6).
- [ ] Database: thêm migration nếu story cần bảng hay hàm mới, kèm test và một dòng trong `scripts/thu-lam-hong.sh`.
- [ ] Giao diện: các màn ở mục Màn hình, nối với Supabase (docs/Ghi_chu_code.md).
- [ ] E2E cho luồng chính của story.
- [ ] Kiểm tay theo `tests/kich-ban/US20.md` trên điện thoại thật.
- [ ] Đổi Trạng thái ở đầu file và ở `docs/stories/README.md` trong cùng PR.
