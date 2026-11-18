---
id: QD18
tieu_de: Bỏ mã YC của bản Zalo khỏi repo
trang_thai: da-chot
loai: san-pham
nguoi_chot: tung
ngay_chot: 2026-11-18
thay_cho: [QD15]
nguon: Quyet_dinh.md của bản PWA (QD18)
anh_huong: []
rev: 1
---
# QD18 · Bỏ mã YC của bản Zalo khỏi repo

## Câu hỏi
lúc dựng repo, tiêu chí và câu hỏi giữ mã cũ của bản Zalo (`YC4.1-NT1`, `YC4-H13`) để test và kịch bản không phải đổi tên. Nhưng repo không còn file YC nào, nên mã đó trỏ tới thứ không tồn tại. Tùng hỏi: "tại sao trong US3 vẫn ghi các YC, trong repo mới làm gì còn YC nữa".

## Phương án
(A) giữ mã YC làm tên, giải thích ở QUY_TRINH; (B) đổi hết sang mã của repo mới.

## Quyết định
B. Người chốt: Tùng (câu hỏi trên, 18/11/2026). Tiêu chí thành `US<n>-NT<số>` theo story chứa nó; câu hỏi thành `CH-<số>`; chỗ nhắc một mục hành vi thành tên mục kèm mã story; chỗ nhắc cả nhóm thành tên nhóm. Đổi bằng máy trên `docs/`, `tests/`, `src/`, `supabase/`. Bảng đổi lưu ở `docs/tu-sinh/Doi_ma_YC.md` để tra lịch sử.

## Hệ quả
mọi story, kịch bản kiểm tay, test, chú thích code, `docs/luat-chung/`, `work/cau-hoi.md`, `docs/QUY_TRINH.md` mục 4.2. Các mục quyết định cũ ở file này giữ nguyên chữ (chỉ thêm, không sửa); mã YC trong đó tra bảng đổi.

Thay cho: điểm "các story chuyển từ bản Zalo giữ mã mục và mã tiêu chí cũ làm tên" ở dòng Hệ quả của QD15. Trạng thái gốc: Đang hiệu lực.

## Lịch sử sửa đổi
| Rev | Ngày | Người | Commit hoặc PR | Thay đổi | Mục bị đổi |
|---|---|---|---|---|---|
| r1 | 2026-11-18 | Claude | QD21-lam-lai-tai-lieu | Tách từ `docs/decisions/`, đổi mã QD18 thành QD18 | Cả file |
