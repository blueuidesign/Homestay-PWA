---
id: QD15
tieu_de: "Tổ chức tài liệu và quy trình: mọi thứ là story, mỗi điều một chỗ"
trang_thai: da-chot
loai: san-pham
nguoi_chot: tung
ngay_chot: 2026-11-18
thay_cho: [QD1]
nguon: Quyet_dinh.md của bản PWA (QD15)
anh_huong: []
rev: 1
---
# QD15 · Tổ chức tài liệu và quy trình: mọi thứ là story, mỗi điều một chỗ

## Câu hỏi
bản Zalo có hơn 300 file tài liệu; một luật được viết ở năm, bảy chỗ nên đổi ý là sót (bỏ công tắc giá chốt 04/11, hai tuần sau còn hơn 20 chỗ ghi cách cũ). Kho BaBa thì ngược lại, chỉ có code, không hợp với app có quyền và tiền. Bộ khởi tạo đầu tiên của bản PWA (QD1) bị Tùng chê sơ sài: tóm lược đặc tả làm mất thông tin.

## Phương án
(A) giữ đủ YC, mô tả màn, story như bản Zalo; (B) kiểu Kho BaBa, code là sự thật; (C) giữ đầy đủ thông tin nhưng mỗi điều một chỗ, đối chiếu bằng test.

## Quyết định
C. Người chốt: Tùng, 18/11/2026. Các câu nguyên văn: "quan trọng nhất vẫn là: giữ cho tài liệu đầy đủ, nhưng chắt lọc nhất và không có quá nhiều mảnh khác nhau, giữ thông tin ở nhiều chỗ làm cho bị mâu thuẫn khi không update hết"; "theo tôi mọi thứ nên có item. giống hệt quy trình scrum. Tôi nghĩ cũng không cần bản mô tả design cũ nữa, chỉ cần html và mô tả đầy đủ trong User story là được. Cũng không cần YC nữa, làm tất cả trong user story"; "hãy build cả repo mới trên repo mang tên Homestay-PWA".
  - Không có file YC. Mọi thứ của một tính năng nằm trong story của nó.
  - Không có file mô tả màn bằng chữ. Thiết kế là canvas HTML; điều hình không nói được thì ghi trong story.
  - Mọi việc có story, một khuôn, bốn loại (tính năng, thiết kế, lỗi, kỹ thuật), ba trạng thái. Không sprint.
  - Story đóng băng sau khi merge. Đổi tính năng đã xong thì viết story mới có mục "Hiện tại", "Đổi thành", "Test bị đổi".
  - Luật dùng chung nằm một lần ở `docs/luat-chung/`. Lý do nằm ở file này. Danh sách bảng và cột do máy sinh.
  - Tài liệu hoặc sống (sửa cùng PR với code) hoặc đóng băng; không có loại ở giữa.
  - Lý do đầy đủ: `docs/Nguyen_ly_lam_viec.md`. Luật chi tiết: `docs/QUY_TRINH.md`.

## Hệ quả
toàn bộ `docs/`. Các story chuyển từ bản Zalo giữ mã mục và mã tiêu chí cũ (YC5.2, YC5.2-NT3) làm tên, để test và kịch bản kiểm tay không phải đổi.

Thay cho: QD1. Trạng thái gốc: Đang hiệu lực.

## Lịch sử sửa đổi
| Rev | Ngày | Người | Commit hoặc PR | Thay đổi | Mục bị đổi |
|---|---|---|---|---|---|
| r1 | 2026-11-18 | Claude | QD21-lam-lai-tai-lieu | Tách từ `docs/decisions/`, đổi mã QD15 thành QD15 | Cả file |
