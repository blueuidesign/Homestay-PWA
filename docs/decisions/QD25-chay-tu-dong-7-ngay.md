---
id: QD25
tieu_de: Chạy tự động 7 ngày, Claude tự quyết phần suy được bằng logic
trang_thai: da-chot
loai: quy-trinh
nguoi_chot: tung
ngay_chot: 2026-11-19
han_chot:
thay_cho: []
nguon: lời Tùng trong project chat, 19/11/2026
anh_huong: [CL4.6, QD17, work/backlog/THU-TU.md, work/cau-hoi.md, work/cho-tung.md]
rev: 2
---
# QD25 · Chạy tự động 7 ngày, Claude tự quyết phần suy được bằng logic

## Câu hỏi
Trong 7 ngày Tùng không kiểm gì, Claude có được tự quyết chỗ đặc tả chưa rõ, tự gộp PR và làm liền hết THU-TU.md không?

## Phương án
| Phương án | Được gì | Mất gì |
|---|---|---|
| Không làm gì (giữ CL4.6) | Mọi quyết định qua Tùng | Việc dừng 7 ngày |
| Chạy tự động, Claude tự quyết và ghi tài liệu | App lên nhanh, Tùng test và chỉnh sau | Có thể phải sửa lại vài quyết định |

## Đề xuất
Chạy tự động.

## Quyết định
Chạy tự động từ 19/11/2026 tới 26/11/2026. Người chốt: Tùng, 19/11/2026: "Theo tôi những phần có thể suy luận bằng logic này thì bạn cứ tự làm nhé, tự nghiên cứu, tự quyết. Tôi muốn app lên nhanh nhất có thể, tôi sẽ test và điều chỉnh lại sau. Miễn là bạn update tài liệu đầy đủ là được. Tôi muốn mọi màn hình, mọi chức năng cần xong, TÔi cho bạn toàn quyền quyết định dựa theo khung hiện tại. Tôi cần bạn chạy tự động và không bao giờ có task nào dừng."

Cách làm trong thời gian này:
- Câu hỏi mở về sản phẩm: Claude tự chốt cách hợp lý nhất, ghi vào work/cau-hoi.md với chữ "Claude tự chốt" và ngày, rồi sửa YC. Tùng xem lại sau.
- PR có CI xanh thì Claude tự gộp (phạm vi Tùng giao theo CL4.6: toàn bộ THU-TU.md), rồi làm item kế.
- Được làm lại database staging (xóa schema cũ, chạy migration mới).
- Không đụng production, không tiêu tiền. Việc chỉ Tùng làm được (SMTP, tài khoản trả phí) ghi vào work/cho-tung.md rồi làm việc khác.
- Test tự động không cần tài khoản thật: Supabase chạy trên máy với hộp thư giả.
- `[r2 · thêm]` Bỏ trần chờ người (CL1.2) trong thời gian này. Tùng, 19/11/2026: "Bỏ giới hạn 6 việc chờ test."
- `[r2 · thêm]` Test e2e chạy trọn luồng trên trình duyệt thật (Playwright, không giao diện) với Supabase chạy trên máy và hộp thư giả để lấy mã đăng nhập.
- `[r2 · thêm]` Test sinh ra từ YC. Trước khi làm một US, kiểm YC của nó đủ chưa; thiếu thì bổ sung YC trước. Chỗ phân vân thì tự quyết, ghi vào QD với chữ "(Claude tự quyết)". Tùng, 19/11/2026: "Nhớ là các loại test sính ra từ file YC, YC phải luôn đầy đủ, test cũng đầy đủ, nghĩ về quy trình để mọi thứ luôn đảm bảo nhé, mọi phân vân gì thì tự quyết rồi tự ghi vào file QD và đánh dấu là bạn quyết định. hãy tự làm hết"

## Lịch sử sửa đổi
| Rev | Ngày | Người | Commit hoặc PR | Thay đổi | Mục bị đổi |
|---|---|---|---|---|---|
| r1 | 2026-11-19 | Claude | QD22-chot-dang-nhap | Bản đầu | Cả file |
| r2 | 2026-11-19 | Claude | QD25-bo-tran-cho-test | Thêm: bỏ trần chờ người, e2e trọn luồng, test sinh từ YC | Quyết định |
