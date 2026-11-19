---
id: YC15
tieu_de: Vận hành
trang_thai: de-xuat
nguoi_chu: tung
rev: 2
ban: 1
---
# YC15 · Vận hành

## Mục tiêu

Là chủ dự án, tôi muốn đưa app cho người dùng thật mà dữ liệu của họ an toàn, mất thì khôi phục được, lỗi thì biết trong ngày, và người dùng đọc được Điều khoản, Chính sách quyền riêng tư thật.

Vì sao quan trọng: một lần mất lịch là chủ nhà nhận trùng khách và không quay lại. Dự án chỉ có hai người, không ai trực đêm, nên sao lưu, báo lỗi và cách khôi phục phải tự chạy và làm theo được khi người chính vắng.

## Phạm vi
`[r2 · sửa]`

YC này gồm: hai môi trường (thử và thật), phát hành, sao lưu và khôi phục, theo dõi lỗi, bí mật, trang Điều khoản và Chính sách, quản trị viên đầu tiên.

Không thuộc YC này: người dùng tự tải file sao lưu (bản sau); bản Zalo Mini App (QD3). Cách làm từng bước nằm ở `docs/ha-tang/` (sổ tay); YC này nói phải đạt gì.

Chặn bởi: nơi đặt dữ liệu người dùng [MỞ: QD23] (chưa trả lời thì không tạo môi trường thật); nội dung Điều khoản và Chính sách [MỞ: YC15-H1].

## Quy tắc của nhóm

| Tên | Quy tắc |
|---|---|
| Hai môi trường | Môi trường thử (staging) có dữ liệu mẫu DLM và đăng nhập thử (YC1.2). Môi trường thật (production) không có dữ liệu mẫu, không có đăng nhập thử. Bản xem trước của PR chỉ nối môi trường thử |
| Migration chỉ thêm | Database đổi bằng migration mới, không sửa tay trên môi trường thật. Chạy migration lên môi trường thật cần Tùng duyệt từng lần |
| Sao lưu đêm | Mỗi đêm 02:00 giờ Việt Nam, tự chạy không cần máy ai bật: xuất database, kiểm kích thước và số bảng, mã hóa, đẩy lên nơi cất, giữ 60 ngày. Bản sao lưu có số điện thoại khách nên luôn mã hóa |
| Diễn tập khôi phục | Khôi phục thử vào database trống ít nhất một lần trước khi mở cho người dùng, và sau mỗi lần đổi cách sao lưu; ghi kết quả vào sổ tay |
| Bí mật | Chỉ ở GitHub Secrets, biến môi trường của nơi chạy giao diện, kho bí mật Supabase, trình quản lý mật khẩu của Tùng. Không ở repo, chat, log. Lộ thì thu hồi, tạo mới, ghi lại |
| Báo lỗi | Lỗi không lường trước ở máy người dùng tới Tùng trong ngày; không gửi tên, số điện thoại khách vào công cụ theo dõi lỗi |
| Quản trị viên đầu tiên | Email của quản trị viên đầu tiên nằm ở cấu hình môi trường, không ở repo (YC13) |

Quy tắc dùng chung: pwa.md P12; `docs/ha-tang/Sao_luu_khoi_phuc.md`, `Xu_ly_su_co.md`, `Bi_mat_va_cau_hinh.md`.

## Ai được làm gì

Chỉ Tùng chạy migration và đổi bí mật ở môi trường thật. Claude không đọc dữ liệu môi trường thật, không đọc `.env`, không giữ bí mật.

## Dữ liệu

Không thêm bảng. Lịch tự động (hết hạn yêu cầu YC9, nhắc chưa cọc YC12) phải được ghi lại để tạo lại khi khôi phục.

## YC15.1 · Môi trường và phát hành

Bản 1 · rủi ro: cao

| Bước | Người làm | Kết quả |
|---|---|---|
| 1 | Tùng tạo project thật ở nơi đã chọn (QD23) | Project trống |
| 2 | Chạy toàn bộ migration | Không lỗi; cảnh báo bảo mật của Supabase không còn mục mức cao |
| 3 | Nối tên miền chính, biến môi trường của môi trường thật | App mở được, cài được trên điện thoại |
| 4 | Quản trị viên đầu tiên đăng nhập lần đầu | Có quyền quản trị |

Tiêu chí:
- **YC15.1-NT1** Khi chạy toàn bộ migration lên project trống, thì không lỗi và không còn cảnh báo bảo mật mức cao. · thủ công
- **YC15.1-NT2** Khi mở tên miền chính trên điện thoại, thì app mở và cài được, và không có màn đăng nhập thử. · e2e
- **YC15.1-NT3** Khi quản trị viên đầu tiên đăng nhập lần đầu ở môi trường thật, thì có quyền quản trị; email đó không có trong repo. · thủ công
- **YC15.1-NT4** Khi bản xem trước của một PR mở, thì nó nối môi trường thử, không nối môi trường thật. · thủ công

## YC15.2 · Sao lưu và khôi phục

Bản 1 · rủi ro: cao

Tiêu chí:
- **YC15.2-NT1** Khi việc sao lưu chạy ban đêm, thì nơi cất có một bản mới đã mã hóa, và bản cũ hơn 60 ngày bị xóa. · thủ công
- **YC15.2-NT2** Khi bản xuất nhỏ bất thường hay thiếu bảng, thì việc sao lưu báo lỗi, không ghi đè bản tốt. · thủ công
- **YC15.2-NT3** Khi khôi phục thử bản mới nhất vào database trống theo sổ tay, thì app đọc được dữ liệu như trước; kết quả ghi ở `docs/ha-tang/Sao_luu_khoi_phuc.md`. · thủ công

## YC15.3 · Theo dõi lỗi và pháp lý

Bản 1 · rủi ro: tb

Cách báo lỗi (công cụ nào): chọn khi làm, ghi vào `docs/decisions/`.

Tiêu chí:
- **YC15.3-NT1** Khi app gặp lỗi không lường trước ở máy người dùng, thì Tùng biết trong ngày, và bản ghi lỗi không có tên, số điện thoại khách. · thủ công
- **YC15.3-NT2** Khi người dùng mở "Điều khoản" hay "Chính sách quyền riêng tư" ở A1, thì thấy nội dung Tùng đã duyệt, không phải chữ giữ chỗ. · unit

## Lịch sử sửa đổi
| Rev | Ngày | Người | Commit hoặc PR | Thay đổi | Mục bị đổi |
|---|---|---|---|---|---|
| r1 | 2026-11-18 | Claude | QD21-lam-lai-tai-lieu | Tạo từ story US39 và `docs/ha-tang/` (QD21) | Cả file |
| r2 | 2026-11-19 | Claude | QD22-chot-dang-nhap | QD22 đã chốt, bỏ khỏi danh sách chặn (chỉ sửa chữ) | Phạm vi |
