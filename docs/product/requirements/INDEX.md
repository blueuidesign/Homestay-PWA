# Yêu cầu (YC)

YC là đặc tả: app phải làm gì. Mỗi nhóm chức năng một file, sống suốt dự án. Việc phải làm (code, test, sửa) nằm ở item trong `work/backlog/`, item chỉ trỏ tới YC bằng mã và bản, không chép lại đặc tả (QD21).

## Danh sách

| YC | Tên | Bản | Nhóm chức năng |
|---|---|---|---|
| [YC1](YC1-tai-khoan.md) | Tài khoản | 2 | Màn đầu, đăng ký và đăng nhập bằng mã email, chọn vai, Cá nhân, hồ sơ, giờ nhận trả, xuất CSV, hướng dẫn, xóa tài khoản |
| [YC2](YC2-lich-chu-nha.md) | Lịch chủ nhà | 1 | Lịch tháng, chi tiết ngày, doanh thu tháng, đặt phòng sắp tới, lịch tuần |
| [YC3](YC3-can.md) | Căn | 1 | Danh sách căn, thêm, ảnh, tòa nhà, sửa, xóa |
| [YC4](YC4-gia.md) | Giá | 1 | Giá theo tháng, ngày lễ, nhiều căn, sao chép, đêm cuối tuần |
| [YC5](YC5-dat-phong.md) | Đặt phòng | 1 | Chủ nhà ghi, xem, sửa, xóa, thu tiền, xin hủy; phía sale |
| [YC6](YC6-ket-noi-sale.md) | Kết nối chủ nhà và sale | 2 | Danh sách sale, link mời, xin lịch, gửi lịch theo căn |
| [YC7](YC7-lich-va-tim-phong-cua-sale.md) | Lịch, tìm phòng, chi tiết căn của sale | 1 | Lịch 7 ngày, tìm phòng, kết quả, chi tiết căn, mức cộng |
| [YC8](YC8-gui-khach.md) | Gửi khách | 2 | Gửi chữ và ảnh cho khách, mẫu tin, báo căn đã gửi có người đặt |
| [YC9](YC9-yeu-cau-dat-phong.md) | Yêu cầu đặt phòng | 2 | Sale gửi, chủ nhà trả lời, trùng đêm, hết hạn |
| [YC10](YC10-can-tu-nhap-va-nguon-phong.md) | Nguồn phòng và căn tự nhập | 2 | Tab Căn của sale, chi tiết chủ nhà, căn tự nhập, đặt phòng tự ghi |
| [YC11](YC11-thong-ke.md) | Thống kê | 1 | Thống kê chủ nhà, thống kê sale, đặt phòng và yêu cầu của sale |
| [YC12](YC12-thong-bao.md) | Thông báo | 1 | Các loại thông báo, popup, màn Thông báo, nhắc chưa cọc, cài đặt |
| [YC13](YC13-quan-tri.md) | Quản trị Home247 | 1 | Đăng nhập quản trị, dải ngày lễ, tòa nhà |
| [YC14](YC14-doi-nhom.md) | Đội nhóm sale | sau | Nhóm, mời, nguồn chung |
| [YC15](YC15-van-hanh.md) | Vận hành | 1 | Môi trường, phát hành, sao lưu, theo dõi lỗi, pháp lý |

Luật dùng ở hai nhóm trở lên nằm một lần ở chỗ riêng, YC chỉ trỏ tới bằng mã: QT ở `docs/product/rules/` (QT5 luật nền, QT6 quy tắc dùng chung), HV ở `docs/product/system-behaviors.md`, PQ ở `docs/security/PQ-ma-tran-quyen.md`, từ ngữ ở `docs/product/glossary.md`, dữ liệu mẫu DLM ở `docs/product/du-lieu-mau.md`, cách làm trên PWA ở `docs/external/pwa.md`.

## Cách đọc một YC

Phần đầu nói chung cho cả nhóm, đọc một lần:
- **Mục tiêu**: ai cần gì, để làm gì, và vì sao nhóm này quan trọng (sai thì hỏng gì).
- **Luồng chính**: một câu chuyện có số thật từ dữ liệu mẫu (DLM).
- **Phạm vi**: gồm gì, và những thứ dễ tưởng là có nhưng thuộc YC khác.
- **Quy tắc của nhóm**: luật chỉ nhóm này dùng, kèm ví dụ số. Dòng "Quy tắc dùng chung" kê mã QT, HV, PQ dùng chung.
- **Ai được làm gì**: mã PQ và các test vi phạm bắt buộc.
- **Dữ liệu**: database phải bảo đảm điều gì (không có tên bảng, tên hàm; mô hình chung ở `docs/architecture/thiet-ke-db.md`).
- **Trạng thái màn (mọi mục)**: đang tải, mất mạng, quay lại từ nền, theo HV.

Rồi từng mục `YCn.m`:
- Dòng đầu: bản, rủi ro, màn.
- Bảng **Bước | Người dùng | App | Database**: chữ trong ngoặc kép là chữ trên màn.
- Ghi chú ngay dưới bảng, có thẻ `[MỞ: mã]` ở đúng chỗ chưa rõ.
- **Luật kiểm** (nếu có): ô, luật, câu báo khi sai.
- **Tiêu chí**: `YCn.m-NTk` Khi…, thì… · lớp test.

Cuối file: **Màn hình** (mã màn và chỗ hình lệch YC) và **Lịch sử sửa đổi** (CL12).

## Quy ước

- **Hôm nay trong ví dụ** là 07/10/2026, trừ khi câu ghi ngày khác. Người, căn, số tiền theo `docs/product/du-lieu-mau.md` (DLM). Số trên hình lệch DLM thì DLM đúng.
- **Mã** không đổi, không dùng lại. Tiêu chí đổi nghĩa thì cấp mã mới và ghi ở Lịch sử bản. Mã mới = số lớn nhất của loại đó cộng 1.
- **`[MỞ: mã]`**: chỗ đó chưa được code. Chữ câu hỏi ở `work/cau-hoi.md`, mã `YCn-Hk` (CL3).
- **`(giả định GDn)`**: code được theo giả định đó, ghi rõ trong PR. Chữ giả định ở `work/gia-dinh.md`.
- **Lớp test** sau dấu ·: `unit` (giao diện và hàm thuần, chạy không cần database), `database` (chạy trên Postgres thật, gồm mọi test quyền và tiền), `e2e` (trình duyệt với môi trường thử), `thủ công` (người làm theo danh sách). Tiêu chí ghi hai lớp thì cần test ở cả hai.
- **Bản phát hành** ở đầu file (`ban: 1` hay `sau`): YC thuộc bản phát hành đầu hay làm sau.
- **Bản của mục**: dòng ngay dưới tiêu đề mục ghi "Bản <n>". Mục đổi nghĩa thì bản tăng 1 (CL6), tiêu chí đổi nghĩa thì đổi mã. Item trỏ tới `YCn.m@<bản>` (ví dụ `YC5.3@1`) để biết code theo bản nào; mục lên bản mới thì item có cờ "Đặc tả đổi" (CL2.2).
- **Lịch sử sửa đổi**: mỗi PR sửa file tăng `rev` ở đầu file và thêm một dòng, cột "Mục bị đổi" ghi mục nào đổi, lên bản mấy (CL12).
- **Chữ trên màn** gọi "đặt phòng"; tài liệu kỹ thuật có thể gọi "booking".

## Bản sau, chưa có đặc tả

Những việc này đã được nêu nhưng chưa đủ để viết YC. Khi Tùng chọn làm, viết YC mới hay thêm mục vào YC có sẵn, rồi mới tạo item.

| Việc | Ghi chú |
|---|---|
| Bản web cho chủ nhà nhiều căn | Chủ nhà 10 căn xem, sửa lịch trên máy tính. Chưa có hình |
| Báo sale khi chủ nhà đổi giá căn đã gửi khách | Kèm ghi chú giá mới đổi trong 2 tuần. Gần với YC8 |
| Chọn tỉnh lúc vào app, lọc tòa theo tỉnh, xếp theo chữ cái | Tùng, bản Zalo, 04/11/2026, điểm 3. Gần với YC1.1, YC3.4 |
| Người dùng tự tải file sao lưu và khôi phục | P7 trên hình. Rủi ro: khôi phục ghi đè dữ liệu thật và qua mặt chặn trùng. Bản 1 dùng sao lưu tự động (YC15.2) |
| Tin Zalo, thông báo đẩy | pwa.md P7 |
