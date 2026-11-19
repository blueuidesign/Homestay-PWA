---
id: TKE
tieu_de: Thiết kế, canvas và cách xem màn
trang_thai: de-xuat
nguoi_chu: tung
rev: 2
---
# Thiết kế

<!-- Tài liệu sống. Luật sửa thiết kế: CL13, CL12. -->

Thiết kế là một file canvas HTML. [r2 · sửa] Từ 19/11/2026 canvas trong repo là **bản PWA**; canvas bản Zalo Mini App chỉ còn trên artifact cũ và trong lịch sử git. Không có file mô tả màn bằng chữ: điều hình vẽ không nói được (vào từ đâu, bấm gì sang đâu, trạng thái rỗng và lỗi) nằm trong YC có mục "Màn hình" nhắc mã màn đó.

- `canvas/home247-canvas.html`: canvas đầy đủ bản PWA, khoảng 2,2 MB, ảnh căn ở `canvas/anh/`. Là hình dựng sẵn, không chạy tương tác. **Không mở cả file**, dùng `trich-man.py`. [r2 · sửa]
- `canvas/man/<mã>.webp`: ảnh chụp sẵn từng màn (157 màn), mở xem nhanh không cần chạy gì. [r2 · thêm]
- `canvas/nguon/`: mã nguồn các bảng của artifact (`*.dc.html`, `canvas.json`, design system `ds/halonghomestay/`), để dựng lại artifact nếu mất. [r2 · thêm]
- Bản gốc là Design artifact "Home247 · Lịch phòng Hạ Long · bản PWA" trên claude.ai của Tùng (https://claude.ai/artifact/WSMs9QQjh3rPUmMekeGj8T). Sửa thiết kế ở đó, rồi trong một PR: dựng từng bảng bằng runtime của artifact, xuất HTML đè `home247-canvas.html`, chụp lại ảnh `man/`, chép nguồn vào `nguon/`. Cách làm: `docs/design/xuat-canvas.md`. [r2 · sửa]
- Design system: HalongHomestay (https://claude.ai/artifact/3r9RXytcCoVRREAWSBWXMF), canvas dùng bản chép 1791787623-1a34. README của design system còn ghi luật app cũ (hai phòng, sale không thấy giá, chữ không dưới 14 px); khi lệch thì theo CLAUDE.md và QD7. [r2 · thêm]

```bash
python3 scripts/trich-man.py CN4                  # HTML của một màn
python3 scripts/trich-man.py CN4 --chu            # chỉ chữ trên màn, mỗi đoạn một dòng
python3 scripts/trich-man.py CN4 --anh /tmp/CN4.png   # chụp màn bằng Playwright
grep -rln "CN4" docs/product/requirements/         # YC nào nói về màn này
```

## Mã màn

A = vào app và kết nối · CN = chủ nhà · S = sale · P = tab Cá nhân. Hậu tố `-00` là trạng thái trống; `-01`, `-02`… là biến thể hay bước tiếp. Mỗi mã có đúng một hình trên canvas. Màn mới phải có mã mới và một dòng trong bảng dưới.

## Bản PWA khác canvas Zalo cũ ở đâu [r2 · sửa]

Bản PWA giữ bố cục, chữ, màu và mã màn của canvas Zalo. Những chỗ đã đổi (bảng đầy đủ Zalo và PWA: `docs/external/pwa.md`; bản kê từng màn: `work/thiet-ke/canvas-pwa.md`):
- Bỏ thanh "··· ✕" của Zalo trên mọi màn.
- Đăng ký bằng email có họ tên và số điện thoại; đăng nhập bằng mã 6 số gửi về email, không mật khẩu (Tùng 19/11/2026, QD22). Màn mới A2, A2-01 đến A2-04, A11, A11-01, A11-02. A1 có hai nút "Tạo tài khoản" và "Đăng nhập".
- Bỏ 18 popup xin tên và số (-P1, -P2 của A6, A8, A10, CN7, CN9, CN10, S3-02, S5, S6) vì tên và số có từ lúc đăng ký. Bỏ HV4-02 (từ chối quyền số điện thoại) cùng lý do.
- Bỏ 4 màn công tắc giá S1-07, S2-01, S3-12, S6-04-01 (QD7).
- Nút "Gửi qua Zalo" đổi thành "Chia sẻ": mở bảng chia sẻ của điện thoại; máy không có thì HV6-01 cho sao chép. Sau này có thể gửi thẳng trong app (Tùng 19/11/2026). Tin nhắn Zalo vẫn là nơi người dùng gửi link cho nhau, nên những câu kiểu "mở link trong tin nhắn Zalo" giữ nguyên. CN7-03, CN9-00 là hình minh họa tin nhắn chứa link trong Zalo.
- P2 sửa được họ tên, tên hiển thị, số điện thoại; email đăng nhập chỉ xem. Cuối P2 có "Xóa tài khoản" mở P14, P14-01 (YC1.8, YC1-H6).
- Màn sao lưu P7, P7-00: không làm ở bản 1 (YC1, bảng Bản sau ở requirements/INDEX.md), vẫn để trên canvas.

Chữ hay số trên hình lệch YC thì YC đúng. Ghi chỗ lệch vào PR.

## Danh sách màn

| Mã | Tên màn | YC nhắc tới (máy dò theo mã, mục "Màn hình" của YC là nguồn) |
|---|---|---|
| A1 | Chào mừng: "Tạo tài khoản", "Đăng nhập" [r2 · sửa] | YC1, YC15 |
| A2 | Tạo tài khoản: họ tên, số điện thoại, email [r2 · thêm] | YC1 |
| A2-01 | Tạo tài khoản · nhập chưa đúng (thiếu tên, số sai, email đã có) [r2 · thêm] | YC1 |
| A2-02 | Nhập mã 6 số gửi về email [r2 · thêm] | YC1 |
| A2-03 | Nhập mã · mã chưa đúng [r2 · thêm] | YC1 |
| A2-04 | Nhập mã · mã hết hạn hoặc đã dùng [r2 · thêm] | YC1 |
| A11 | Đăng nhập: nhập email [r2 · thêm] | YC1 |
| A11-01 | Đăng nhập · email chưa có tài khoản [r2 · thêm] | YC1 |
| A11-02 | Đăng nhập · nhập mã [r2 · thêm] | YC1 |
| P14 | Xóa tài khoản: điều gì mất, điều gì còn [r2 · thêm] | YC1 |
| P14-01 | Xóa tài khoản · bấm lần hai "Xác nhận xóa?" [r2 · thêm] | YC1 |
| HV6-01 | Trình duyệt chưa chia sẻ được · sao chép [r2 · thêm] | HV6 |
| A1-link | Mở từ link mời (chưa có mã artboard riêng) | YC6 |
| A1-link-01 | Link sai hoặc chủ nhà đã xóa tài khoản | YC6 |
| A3 | Chọn vai trò | YC1 |
| A3-00 | Chọn vai trò · chưa chọn | YC1 |
| A4 | Chủ nhà mới, chưa có căn | YC1, YC2, YC3 |
| A4-01 | Chủ nhà mới · mở từ link xin lịch | YC3, YC6 |
| A5 | Sale mới, chưa có nguồn phòng | YC1, YC6, YC7 |
| A5-01 | Sale mới · mở từ link không dùng được | chưa YC nào nhắc |
| A6 | Soạn tin xin link | YC6, YC10 |
| A7 | Đã gửi, chờ chủ nhà | YC6, YC7 |
| A7-00 | Chờ chủ nhà · chưa gửi lần nào | YC6 |
| A7-01 | Chờ chủ nhà · sau khi chia sẻ [r2 · sửa] | YC6 |
| A8 | Chủ nhà mở link của sale (tiêu đề "Lời mời xem lịch") | YC3, YC6 |
| A8-01 | Lời mời xem lịch · link hết hạn hoặc sale bị ngừng | YC6 |
| A9 | Chủ nhà đã đồng ý · toast | YC6, YC12 |
| A10 | Thêm lịch của chủ nhà (QD8) | YC6 |
| A10-01 | Đã có lịch của chủ nhà này · cảnh báo | YC6 |
| A10-02 | Đã thêm lịch · toast trên lịch sale | YC6 |
| A9-02 | Nhiều chủ nhà cùng đồng ý · gom một toast | YC6 |
| CN7 | Sale của tôi | YC6 |
| CN7-00 | Sale · chưa có sale nào | YC6 |
| CN7-03 | Sale xin xem lịch · tin nhắn Zalo | YC6 |
| CN7-01 | Sale · có sale đã xóa tài khoản (QD13) | chưa YC nào nhắc |
| CN7-04 | Chi tiết một sale | YC6 |
| CN7-05 | Thêm sale thủ công | YC6 |
| CN10 | Gửi lịch cho sale | YC2, YC6 |
| CN10-02 | Gửi xong: thông báo trên lịch | YC6 |
| CN10-00 | Gửi lịch · chưa có sale đã lưu | YC6 |
| CN10-01 | Gửi lịch · đóng bảng chia sẻ mà chưa gửi [r2 · sửa] | YC6 |
| P2 | Thông tin cá nhân (sửa tên, số; email đăng nhập; nút Xóa tài khoản) [r2 · sửa] | YC1, YC9 |
| P13 | Thông báo (phần thông báo kết nối) | YC6, YC12 |
| P13-00 | Thông báo · chưa có | YC12 |
| P13-01 | Thông báo · chủ nhà đã xóa tài khoản | YC12 |
| S1-06 | Popup thông báo mới | YC12 |
| S1-06-01 | Popup hôm nay · chủ nhà đã xóa tài khoản (QD13) | YC12 |
| CN1 | Lịch tháng, 2 căn | YC2, YC3, YC5, YC9 |
| CN1-02 | Lịch tháng, 3 căn | YC2 |
| CN1-00 | Lịch · chưa có booking | YC2 |
| CN1-01 | Lịch · chưa có booking sắp tới | YC2 |
| CN2 | Lịch tuần, nhiều căn | YC2, YC3 |
| CN2-00 | Lịch tuần · chưa có booking | YC2 |
| CN3 | Chi tiết một ngày | YC2, YC5 |
| CN5 | Danh sách căn | YC2, YC3, YC4 |
| CN5-02 | Sửa thông tin căn | YC3, YC4 |
| CN5-A1 | Thêm căn · trống | YC3 |
| CN5-A1b | Thêm căn · chọn tòa khác | YC3, YC13 |
| CN5-A2 | Thêm căn · đang nhập | YC3 |
| CN5-A3 | Thêm căn · lỗi khi lưu | YC3 |
| CN5-A4 | Đã thêm căn đầu tiên | YC3 |
| CN5-A4b | Đã thêm căn · có nhiều căn | YC3 |
| CN6 | Tab Giá | YC4 |
| CN6-00 | Chưa đặt giá | YC4 |
| CN6-02 | Giá ngày lễ, dịp đặc biệt | YC4 |
| CN6-03 | Chọn quá 10 ngày | YC4 |
| CN6-03-01 | Giá dịp · bỏ trống tên | YC4 |
| CN6-04 | Áp dụng giá xong | YC4 |
| CN6-05 | Đặt giá nhiều căn: chọn căn | YC3, YC4 |
| CN6-05-00 | Đặt giá nhiều căn · chưa chọn căn | YC4 |
| CN6-06 | Đặt giá nhiều căn | YC4 |
| CN6-07 | Sao chép giá sang căn khác | YC3, YC4 |
| CN6-08 | Sao chép giá xong | YC4 |
| CN6-09 | Chọn năm | YC4 |
| P6 | Ngày tính giá cuối tuần | YC1, YC3, YC4 |
| CN3-02 | Chi tiết booking | YC2, YC5 |
| CN3-02-01 | Chi tiết booking · sale đã xóa tài khoản | YC5 |
| CN4 | Thêm đặt phòng | YC3, YC5 |
| CN4-01 | Thêm đặt phòng · tiền phòng bỏ trống | YC5 |
| CN4-02 | Sửa đặt phòng | YC5 |
| CN4-03 | Đã lưu booking | YC5 |
| CN1-03 | Lịch · có yêu cầu từ sale | YC9 |
| CN9-00 | Tin nhắn Zalo gửi chủ nhà (bản sau, mục "Cài đặt thông báo") | YC9 |
| CN9 | Yêu cầu đặt phòng · chờ trả lời | YC9, YC12 |
| CN9-02 | Đã chấp nhận đặt phòng | YC9 |
| CN9-03 | Đã từ chối yêu cầu | YC9 |
| S3-02 | Đặt phòng (sale gửi yêu cầu) | YC7, YC9 |
| S3-03 | Chờ chủ nhà trả lời | YC9, YC11 |
| S3-04 | Chủ nhà đã chấp nhận | YC9 |
| S3-04-01 | Kết quả yêu cầu · mở từ thông báo | YC9, YC12 |
| S3-05 | Chủ nhà từ chối | YC9, YC12 |
| S3-07 | Lỗi khi gửi: căn đã được đặt | YC9 |
| S3-08 | Sale đã hủy yêu cầu | YC9 |
| S3-09 | Yêu cầu hết hạn | YC9, YC11, YC12 |
| S3-10 | Booking chủ nhà đã sửa | YC5 |
| S3-11 | Booking với chủ nhà đã xóa tài khoản | YC9, YC11 |
| S1 | Lịch phòng | YC7 |
| S1-02 | Tìm phòng, ban đầu | YC7 |
| S1-03 | Tìm phòng, đã chọn | YC7 |
| S1-04 | Sắp xếp | YC7 |
| S1-05 | Lịch phòng, xoay ngang | YC7 |
| S2 | Kết quả, danh sách | YC7, YC8 |
| S2-00 | Không có căn trống | YC7 |
| S3 | Chi tiết căn | YC1, YC7, YC8, YC9, YC10, YC12 |
| S4 | Kết quả, lịch tuần | YC7 |
| S5 | Gửi cho khách | YC8, YC10 |
| P10 | Mức cộng giá mặc định | YC7 |
| P11 | Mẫu tin gửi khách | YC8, YC13 |
| S6 | Nguồn phòng / Căn | YC10 |
| S6-00 | Căn · chưa có căn nào | YC10 |
| S6-02 | Thêm căn tự nhập | YC10 |
| S6-03 | Chi tiết căn tự nhập | YC7, YC8, YC10 |
| S6-03-00 | Căn tự nhập · chưa ghi booking | YC10 |
| S6-04 | Chi tiết chủ nhà | YC10 |
| S6-05 | Ghi booking nhanh | YC10 |
| S6-06 | Đã ghi, tính vào thống kê | YC10 |
| S6-07 | Chi tiết căn của tôi | YC7, YC8, YC10 |
| S6-08 | Nguồn phòng · chủ nhà đã xóa tài khoản | YC10, YC12 |
| CN8 | Thống kê tháng (chủ nhà) | YC11 |
| CN8-00 | Thống kê, tháng chưa có booking | YC11 |
| S7 | Thống kê của sale | YC11 |
| S7-00 | Thống kê, chưa có booking | YC11 |
| S7-03 | Các trạng thái booking của sale | YC9, YC11, YC12 |
| S7-03-00 | Trạng thái booking · chưa có yêu cầu | YC11 |
| S7-03-01 | Trạng thái booking · chủ nhà đã xóa tài khoản | YC11 |
| S8-00 | Đội nhóm, chưa có nhóm | YC14 |
| S8-01 | Tạo nhóm | YC14 |
| S8 | Nhóm của tôi, trưởng nhóm | YC14 |
| S8-02 | Mời thành viên | YC14 |
| S8-03 | Sale mở link mời vào nhóm | YC14 |
| S8-04 | Chi tiết thành viên | YC14 |
| S8-05 | Nhóm, thành viên thường | YC14 |
| P1 | Cá nhân, chủ nhà | YC1 |
| P4 | Cá nhân, sale | YC1, YC6, YC14 |
| P2 | Thông tin cá nhân | YC1, YC9 |
| P3 | Cài đặt thông báo, chủ nhà | YC1, YC6, YC8, YC10, YC12 |
| P12 | Cài đặt thông báo, sale | YC12, YC15 |
| P5 | Giờ nhận, trả phòng | YC1, YC6, YC9, YC10 |
| P7 | Sao lưu dữ liệu | YC1, YC6, YC12 |
| P7-00 | Sao lưu · chưa từng sao lưu | YC1 |
| P8 | Xuất file Excel | YC1 |
| P8-00 | Xuất Excel · khoảng chọn không có booking | YC1 |
| P9 | Hướng dẫn sử dụng | YC1 |
| CN3-02-02 | Chi tiết booking chủ nhà tự ghi · xóa | chưa YC nào nhắc |
| CN3-02-03 | Chi tiết đặt phòng · đã thu đủ | chưa YC nào nhắc |
| CN7-06 | Sale của tôi · vừa cho sale xem lịch | chưa YC nào nhắc |
| P13-02 | Thông báo · chủ nhà ngừng cho xem lịch | YC12 |

## Lịch sử sửa đổi
| Rev | Ngày | Người | Commit hoặc PR | Thay đổi | Mục bị đổi |
|---|---|---|---|---|---|
| r2 | 2026-11-19 | Claude (thread design, Tùng giao) | claude/project-thread-0kxyex | Canvas chuyển sang bản PWA; đăng ký, đăng nhập email; bỏ popup xin số, màn công tắc giá; thêm xóa tài khoản; ảnh từng màn | Đầu file (sửa), Bản PWA khác canvas Zalo cũ ở đâu (sửa), Danh sách màn (thêm, sửa, bỏ) |
