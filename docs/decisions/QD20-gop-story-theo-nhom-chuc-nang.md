---
id: QD20
tieu_de: Gộp story theo nhóm chức năng, đánh số lại mã
trang_thai: da-chot
loai: san-pham
nguoi_chot: tung
ngay_chot: 2026-11-18
thay_cho: []
nguon: Quyet_dinh.md của bản PWA (QD20)
anh_huong: []
rev: 1
---
# QD20 · Gộp story theo nhóm chức năng, đánh số lại mã

## Câu hỏi
sau QD19 (story sống, mỗi nhóm chức năng một story), bộ story vẫn là các lát cắt của bản Zalo. Một màn nằm rải ở 3 đến 4 story (US5 dùng chung 7 đến 11 màn với mỗi story US15, US16, US17, US26), nên đổi một yêu cầu dễ sửa chỗ này sót chỗ kia.

## Phương án
gộp thành khoảng 15 story theo nhóm chức năng, với hai cách xử lý mã tiêu chí: (a) giữ mã cũ trong story mới; (b) đánh số lại, ghi bảng đổi mã.

## Quyết định
gộp, đánh số lại (b). Người chốt: Tùng ("gộp như bạn đề xuất. đánh số lại mã, sửa mã ở những nơi liên quan, đảm bảo đúng." và "đồng thời viết lại US cho chuẩn nhé", 18/11/2026). Claude đã nghiêng về (a) vì mã đã cấp không nên đổi; Tùng chọn (b) để mỗi story có mã gọn, đọc liền một dãy.
  - Story gộp giữ mã của story chính: US1 Căn (gộp US25, US11, US27), US2 Lịch chủ nhà (US9), US3 Đặt phòng (US10, US28, US35), US4 Giá (US7, US8), US5 Kết nối sale (US17, US26), US6 Lịch và tìm phòng của sale (US12, US13), US18 Thống kê (US19), US21 Cá nhân, thông báo và tài khoản (US30, US22), US23 Quản trị (US29, US34).
  - Mã story bị gộp không bao giờ dùng lại.
  - Tiêu chí và câu hỏi của story gộp được đánh số lại theo thứ tự đọc trong story mới. Đổi bằng máy ở mọi chỗ (story, test, kịch bản kiểm tay, chú thích code, câu hỏi mở) trong cùng commit. Bảng đổi: `docs/tu-sinh/Doi_ma_gop.md`.
  - Story to hơn vài ngày làm: code theo từng phần, mỗi PR một phần, PR ghi phần nào. Tiêu chí nào đã có test thì máy đếm.
  - Viết lại đặc tả thô (US41) làm cùng lúc với gộp.

## Hệ quả
`docs/stories/` (gộp file, `README.md`), `tests/kich-ban/`, `tests/`, `src/` (chú thích), `work/cau-hoi.md`, `docs/luat-chung/`, `docs/QUY_TRINH.md` mục 4.2, 4.2b, `docs/stories/US41-viet-lai-dac-ta-tho.md` bước 7, `scripts/kiem-tai-lieu.py` (bảng đổi mã), `CLAUDE.md`.

Thay cho: điểm "viết lại không đổi mã tiêu chí" ở `docs/QUY_TRINH.md` mục 4.2b và luật "một story làm được trong vài ngày" ở mục 4.2. Trạng thái gốc: Đang hiệu lực.

## Lịch sử sửa đổi
| Rev | Ngày | Người | Commit hoặc PR | Thay đổi | Mục bị đổi |
|---|---|---|---|---|---|
| r1 | 2026-11-18 | Claude | QD21-lam-lai-tai-lieu | Tách từ `docs/decisions/`, đổi mã QD20 thành QD20 | Cả file |
