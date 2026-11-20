---
id: EN14
tieu_de: "Trong phiên chỉ chạy test của item, cả bộ để CI"
loai: EN
trang_thai: dang-lam
thuc_hien: []
truoc: []
lien_quan: [EN12]
nguon: Tùng 20/11/2026
nguoi: tung
rui_ro: thap
uoc_luong: 1 giờ
thuc_te:
can_duyet: [CL4.3.6]
based_on:
pr:
ngay_tao: 2026-11-20
---
## Mục tiêu
Giảm token mỗi item. Trong phiên (phiên chính và agent phụ) chỉ chạy test của item và phép thử làm hỏng phần của item; cả bộ test database, unit, build, e2e và phép thử làm hỏng toàn bộ để CI chạy, phiên chỉ đọc CI đạt hay không. Đầu ra test chỉ in test hỏng. Tùng duyệt ngày 20/11/2026 (làm mục 1 đến 4, bỏ mục 5).

## Làm tiêu chí nào
Không có NT. Kiểm: gói việc mới (scripts/goi.py) ghi lệnh kiểm mới; `npx vitest run` và `npx playwright test` trên máy chỉ in chấm và test hỏng; `scripts/thu-lam-hong.sh` chỉ in phép thử không đạt và dòng tổng.

## Phạm vi
- .claude/skills/lam-mot-item/SKILL.md mục 7, .claude/skills/lam-tu-dong/SKILL.md, .claude/agents/code.md mục 6, CLAUDE.md (một dòng).
- scripts/goi.py (ô Lệnh kiểm), scripts/thu-lam-hong.sh (in gọn), vite.config.ts và playwright.config.ts (reporter gọn khi chạy trên máy).
- docs/dev/chay-va-test.md: mục "Test trong phiên và trên CI".

## Task
- [ ] EN14-TA1 Code

## Nhật ký
- 2026-11-20 · Claude · tạo item theo lời Tùng ("phan 5 khong can nhe, lam 1-4"), gộp sau 19:00 vì đang tạm dừng deploy

## Bằng chứng
