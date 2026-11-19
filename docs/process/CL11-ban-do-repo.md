---
id: CL11
tieu_de: Bản đồ repo
trang_thai: de-xuat
nguoi_chu: tung
rev: 1
---
# CL11 · Bản đồ repo

Thư mục chỉ được tạo khi có file thật đầu tiên. Thư mục rỗng làm AI tưởng cần tự điền vào.

## Đang có
```
CLAUDE.md                 Tờ dặn đầu ca cho Claude Code
README.md                 Cách đọc repo cho người
VIEC_TAY_CUA_TUNG.md      Việc cần tài khoản của Tùng (GitHub, Vercel, Supabase)
docs/                     SỰ THẬT: sản phẩm phải làm gì
  INDEX.md                Mục lục mọi tài liệu
  _lich-su/               Bảng lịch sử cũ (CL12.3) và tài liệu đóng băng của bản Zalo (zalo/). AI không đọc trừ khi cần
  product/goal.md         Mô tả dự án, người dùng, không làm gì
  product/glossary.md     Mỗi từ một nghĩa, danh sách lựa chọn dùng chung
  product/requirements/   Yêu cầu YC1 đến YC15, mỗi nhóm chức năng một file. INDEX.md: mục lục, cách đọc, quy ước, Bản sau
  product/rules/          Quy tắc QT1 đến QT6. QT5 luật nền, QT6 quy tắc dùng chung
  product/system-behaviors.md  Hành vi chung mọi màn HV1 đến HV8
  product/du-lieu-mau.md  Bộ dữ liệu mẫu DLM
  security/PQ-ma-tran-quyen.md  Ma trận quyền PQ
  architecture/thiet-ke-db.md   Mô hình dữ liệu và bất biến của database
  external/pwa.md         Bản PWA làm khác bản Zalo ở đâu (P1 đến P13)
  design/canvas/          Canvas thiết kế, một file HTML. Xem một màn: scripts/trich-man.py <mã>
  ha-tang/                Sao lưu, sự cố, bí mật và cấu hình
  dev/chay-va-test.md     Lệnh cài, chạy, test, build, deploy (viết cùng code)
  decisions/              Quyết định QD, mỗi QD một file
  process/                Cách làm việc CL1 đến CL14, mẫu file trong templates/
work/                     VIỆC VÀ HỒ SƠ
  backlog/                Mỗi item một file (US, EN, BG). THU-TU.md là thứ tự ưu tiên. done/ là item đã xong
  cau-hoi.md              Câu hỏi mở, mã YC<n>-H<m>. Hàng đợi chờ Tùng trả lời
  gia-dinh.md             Giả định đang dùng, mã GD
  goi/                    Gói việc cho agent code, mỗi item một file, xóa khi item xong
  reviews/                Kết quả review RV, mỗi lần một file (CL12)
  thiet-ke/               Bản kê thay đổi thiết kế, mỗi item có task Thiết kế một file (CL13)
  plan/                   Kế hoạch do scripts/plan.py sinh
src/                      Code app React (QD4, QD21): tạo lại khi làm EN dựng nền
supabase/                 migrations/, seed/, tests/ của database: tạo lại khi làm EN dựng nền
tests/                    e2e/ (Playwright), kb/ (kịch bản test tay, mỗi US một file, CL14.5a)
scripts/                  kiem.py (kiểm repo), trich.py (trích theo mã), trich-man.py (trích màn từ canvas), goi.py (gói việc), plan.py (kế hoạch), log-tong.py (đọc log phiên), hook/ (hook của Claude Code), tests/
.claude/                  settings.json (quyền cấm, hook), rules/, skills/, agents/ (code, review)
.github/                  Mẫu PR, workflows/ (CI)
```

## Sẽ tạo khi cần
| Thư mục, file | Tạo khi |
|---|---|
| src/, supabase/, tests/e2e/, package.json | EN dựng nền (code làm lại từ đầu, QD21) |
| docs/dev/chay-va-test.md | Cùng EN dựng nền |
| tests/kb/<US>.md | Khi viết US (CL14.5a) |
| work/risks.md, work/cai-tien.md | Rủi ro, điểm cải tiến đầu tiên |
| work/meetings/, work/inbox/ | Cuộc họp đầu tiên (CL7) |
| docs/process/CL8 phát hành, CL9 sự cố | Trước bản phát hành đầu (YC15) |

## Lịch sử sửa đổi
| Rev | Ngày | Người | Commit hoặc PR | Thay đổi | Mục bị đổi |
|---|---|---|---|---|---|
| r1 | 2026-11-18 | Claude | QD21-lam-lai-tai-lieu | Chép từ bản Zalo r17, sửa cho bản PWA (QD21). Lịch sử cũ ở repo zalo-miniapp | Cả file |
