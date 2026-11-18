---
id: CL11
tieu_de: Bản đồ repo
trang_thai: de-xuat
nguoi_chu: tung
rev: 17
---
# CL11 · Bản đồ repo

Thư mục chỉ được tạo khi có file thật đầu tiên. Thư mục rỗng làm AI tưởng cần tự điền vào.

## Đang có
`[r14 · sửa]`
```
CLAUDE.md                 Tờ dặn đầu ca cho Claude Code
README.md                 Cách đọc repo cho người
docs/                     SỰ THẬT: sản phẩm phải làm gì
  _lich-su/               Dòng lịch sử sửa đổi cũ của từng file, giữ 5 dòng mới nhất trong file (CL12.3). AI không đọc trừ khi cần
  INDEX.md                Mục lục mọi tài liệu
  product/goal.md         Product Goal, người dùng, không làm gì
  product/glossary.md     Mỗi từ một nghĩa
  product/requirements/   Cây yêu cầu YC. Mỗi file một YC cấp 1
  product/rules/          Quy tắc nghiệp vụ QT. Mỗi file một QT cấp 1
  design/screens/INDEX.md Bảng đăng ký màn hình
  design/screens/<mã>.md  Mô tả từng màn (CL12.9) `[r6 · thêm]`
  design/canvas/          Mã nguồn canvas, một file HTML, Design ghi đè mỗi TK (CL13) `[r10 · thêm]`
  ha-tang/                Hạ tầng kỹ thuật, mỗi dịch vụ một file `[r7 · thêm]`
  dev/chay-va-test.md     Lệnh cài, chạy, test, build, deploy Mini App `[r13 · thêm]`
  external/               Quy định và hành vi của Zalo. Có hạn tra lại
  decisions/              Quyết định QD, mỗi QD một file
  process/                Cách làm việc CL1 đến CL14, mẫu file trong templates/. CL13: phiên Design tự tìm việc. CL14: viết User Story `[r8 · sửa]` `[r12 · sửa]`
  chuc-nang/              Tài liệu cũ, đang chuyển sang YC1 (DC2). Không code theo
work/                     VIỆC VÀ HỒ SƠ
  backlog/                Mỗi item một file. THU-TU.md là thứ tự ưu tiên
  sprints/                SP0. Sprint đang tắt (QD26), không thêm file
  cau-hoi.md              Câu hỏi mở về sản phẩm, mã YC<n>-H<m>. Hàng đợi chờ Tùng trả lời
  goi/                    Gói việc cho agent code, mỗi task một file, xóa khi item xong
  risks.md                Rủi ro RR, giả định GD
  reviews/                Kết quả review RV, mỗi lần một file (CL12)
  thiet-ke/               Bản kê thay đổi thiết kế, mỗi việc TK một file (CL12.9, CL13) `[r9 · sửa]`
  sk/                     Bản thử đã chạy trên máy thật, mỗi spike một thư mục: code thử, cách làm, phản hồi. Không phải code sản phẩm (EN41) `[r11 · thêm]`
  plan/                   Master plan, lịch (lich.csv, giai-doan.csv), kế hoạch và plan.json do script sinh
src/                      Code (QD1). miniapp/, web/, server/, shared/, db/. Mỗi thư mục có README
  miniapp/                App React (QD7), khung trống từ EN4. Gốc package: package.json, main.tsx, pages/ `[r13 · thêm]`
  miniapp/hello-world/    App thử của các SK, package riêng. Không phải code sản phẩm `[r13 · thêm]`
  server/thu-oracle/      API thử của SK5 trên máy Oracle. Không phải code sản phẩm `[r13 · thêm]`
tests/                    Test xuyên nhiều phần: e2e/, permissions/, fixtures/. kb/ là kịch bản test tay, mỗi US một file (CL14.5a)
infra/                    Triển khai, sao lưu, giám sát
scripts/                  Công cụ repo: plan.py (kế hoạch, bang.json), kiem.py (kiểm repo), trich.py (trích đoạn theo mã), trich-man.py (trích màn từ canvas), goi.py (soạn gói việc), log-tong.py (đọc log phiên, CL10.7), hook/ (hook của Claude Code, có ghi-log-phien.py) `[r17 · sửa]`
tools/                    Công cụ nội bộ, không phải sản phẩm
  tien-do/                App Tiến độ trên Vercel (EN25). _tham-khao/ là file tham khảo, không build
handbook/PMGuide/         Giáo trình. Claude Code không đọc
.claude/                  settings.json (quyền cấm, hook), rules/ (quy ước theo thư mục), skills/ (lệnh /, quy trình của lệnh), agents/ (agent review, agent code) `[r17 · sửa]`
.github/                  Mẫu PR, workflows/ (CI)
```

## Sẽ tạo khi cần
| Thư mục, file | Tạo khi | Item |
|---|---|---|
| docs/product/system-behaviors.md | Có hành vi hệ thống đầu tiên được chốt | DC |
| docs/architecture/ | Chốt backend (QD về backend) | SK5 |
| docs/security/permissions.md | Bắt đầu EP2 | DC |
| docs/testing/ | Có test đầu tiên | EN |
| docs/design/principles.md, flows.md | Chuyển từ bản mô tả MVP | DC1 |
| work/meetings/, work/inbox/ | Cuộc họp đầu tiên | |
| work/TRACE.md, script sinh bảng | Có script | EN2 |
| work/releases/, test-runs/ | Bản Testing đầu tiên | |
| work/incidents/, feedback/, improvements.md | Có người dùng thật | |
| docs/process/CL8 phát hành, CL9 sự cố | Trước bản phát hành đầu | |
| .claude/skills/ cho lệnh còn lại, agents/, hooks/ | Sau khi chạy tay một quy trình hai ba lần | EN |

## Lịch sử sửa đổi
Dòng cũ hơn: [docs/_lich-su/process/CL11-ban-do-repo.md](../_lich-su/process/CL11-ban-do-repo.md).

| Rev | Ngày | Người | Commit hoặc PR | Thay đổi | Mục bị đổi |
|---|---|---|---|---|---|
| r13 | 2026-11-03 | Đức | #60 | Thêm khung src/miniapp, docs/dev, bản thử hello-world và thu-oracle | Cây "Đang có" sửa, bảng "Sẽ tạo" bỏ dòng chay-va-test |
| r14 | 2026-11-04 | Tùng | EN56-quy-trinh-moi | Thêm cau-hoi.md, goi/, docs/_lich-su, tests/kb, công cụ scripts, agents, CI; bỏ BOARD.md (QD26) | Cây "Đang có" sửa |
| r15 | 2026-11-04 | Tùng | EN57-chuyen-tai-lieu-cu | Chỉ sửa chữ: chỗ trỏ câu hỏi mở đổi sang mã YC<n>-H<m>, link item đã xong sang done/ (QD26) | Các chỗ trỏ câu hỏi |
| r16 | 2026-11-07 | Tùng | EN64-soan-viec-user-story | Thêm scripts/goi.py | Cây thư mục sửa |
| r17 | 2026-11-09 | Tùng | EN66-gon-doc-log | Thêm log-tong.py, hook ghi-log-phien.py, agent code, rule ha-tang | Cây thư mục sửa |
