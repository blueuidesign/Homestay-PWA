---
id: QD21
tieu_de: Tách đặc tả (YC) và việc (US); xóa code, dựng lại từ tài liệu
trang_thai: da-chot
loai: san-pham
nguoi_chot: tung
ngay_chot: 2026-11-18
thay_cho: [QD19, QD20]
nguon: Quyet_dinh.md của bản PWA (QD21)
anh_huong: []
rev: 1
---
# QD21 · Tách đặc tả (YC) và việc (US); xóa code, dựng lại từ tài liệu

## Câu hỏi
sau QD20, story vừa là đặc tả vừa là việc. Tùng thấy thiếu chỗ liệt kê việc: sửa điểm nào, đổi yêu cầu nào, việc vừa sửa tài liệu vừa code, việc viết test. Rà lại repo cũ của bản Zalo: ở đó YC giữ đặc tả và tiêu chí, US chỉ là việc trỏ tới tiêu chí. Chỗ đau của bản cũ là một YC bị cắt cho nhiều US, US chép lại một phần đặc tả, và quy trình nặng. Code hiện có là bản chuyển từ Zalo chạy bằng dữ liệu giả, chưa nối database, và database còn nhiều chỗ lệch đặc tả (mục "Database đang lệch" của các story US1, US2, US3).

## Phương án
(A) giữ story vừa là đặc tả vừa là việc, thêm bảng việc trong story; (B) tách đặc tả và việc như bản cũ nhưng nhẹ hơn; giữ code hay xóa code làm lại.

## Quyết định
B, xóa code. Người chốt: Tùng, 18/11/2026: "tôi đồng ý với bạn, nhớ là US giữ ít thông tin nhất có thể và tham chiếu đến YC, tham chiếu đến version nào. Trong YC thì có lịch sử version nào sửa mục nào. … Những điểm bạn không khuyên sửa thì tôi đề xuất giữ lại bản cũ, bao gồm cả rule, CL, hook... Sau đó bạn hãy tạo ra toàn bộ dữ liệu nhưng chỉ không có code. … Nhớ là không có phần nào lặp lại mô tả nhé." và "chọn cách xóa hết đi làm lại nhé, repo tổ chức lại YC, mô tả cho đẹp, nhớ đầy đủ như cách viết US3 mới và những thứ khác của YC cũ để đảm bảo YC toàn vẹn, không lặp lại và đủ cho nhóm tính năng."
  - YC là đặc tả, mỗi nhóm tính năng một file, sống suốt dự án. Mục có mã `YC<n>.<m>`, tiêu chí `YC<n>.<m>-NT<k>`. YC có số bản và lịch sử: bản nào sửa mục nào.
  - US là việc: chỉ ghi làm mục YC nào ở bản nào, tiêu chí nào, việc phải xong trước, người, trạng thái, task, nhật ký. Không chép đặc tả. Ba loại việc: US (tính năng hay đổi yêu cầu), BG (lỗi), EN (nền).
  - Không thông tin nào viết hai nơi: câu hỏi mở chỉ ghi mã trong YC; luật dùng ở từ hai nhóm trở lên nằm ở `docs/luat-chung/`, luật chỉ một nhóm dùng nằm trong YC của nhóm đó.
  - Quy trình lấy lại của bản Zalo (CL, rule, hook, skill, script kiểm), sửa cho bản PWA, trừ những điểm đã đổi ở đây.
  - Xóa toàn bộ code (app, migration, test tự động, dữ liệu mẫu dạng SQL, cấu hình build). Code viết lại từ đầu theo tài liệu, mỗi chỗ code có chú thích trỏ về mã YC, QT, PQ. Code cũ còn trong lịch sử git (nhánh `QD20-gop-story`).

- Tùng chọn ngày 18/11/2026 (hỏi chọn trong phiên): "Xếp lại theo cách cũ". Tài liệu xếp như bản Zalo để script, skill, hook chép gần nguyên văn: mỗi QD một file ở `docs/decisions/`, YC ở `docs/product/requirements/`, QT ở `docs/product/rules/`, HV ở `docs/product/system-behaviors.md`, PQ ở `docs/security/`, câu hỏi ở `work/cau-hoi.md`. Mã QD bỏ gạch nối và số 0 đứng đầu (ví dụ mã cũ "QD" gạch "007" nay là QD7, CL3).

## Hệ quả
thay QD19 và QD20 ở phần "story vừa là đặc tả vừa là việc"; thay `docs/QUY_TRINH.md` bằng quy trình CL; `docs/stories/` thành `docs/product/requirements/` và `work/backlog/`.

Thay cho: QD19 (story sống), QD20 (story gộp theo nhóm) ở phần tổ chức tài liệu. Ý "đặc tả sống, mỗi nhóm một file" của hai mục đó giữ nguyên, nay nằm ở YC.. Trạng thái gốc: Đang hiệu lực.

## Lịch sử sửa đổi
| Rev | Ngày | Người | Commit hoặc PR | Thay đổi | Mục bị đổi |
|---|---|---|---|---|---|
| r1 | 2026-11-18 | Claude | QD21-lam-lai-tai-lieu | Tách từ `docs/decisions/`, đổi mã QD21 thành QD21 | Cả file |
