---
id: EN8
tieu_de: "kiem.py: tiêu chí NT của item đã làm phải có test mang đúng mã, đúng lớp"
loai: EN
trang_thai: xong
thuc_hien: []
truoc: [EN1, EN2]
lien_quan: []
nguon: QD25
nguoi: tung
rui_ro: tb
uoc_luong:
thuc_te:
can_duyet: []
based_on:
pr: [12]
ngay_tao: 2026-11-19
---
## Mục tiêu
CI đỏ khi một item đã mở PR (dang-lam có pr, cho-test, cho-nghiem-thu, xong) có tiêu chí NT chưa có test mang đúng mã, hoặc thiếu lớp test mà NT ghi sau dấu ·. Để không NT nào bị sót (Tùng 19/11/2026, QD25).

## Làm tiêu chí nào
Không có NT riêng. Xong khi luật `nt-test` chạy trong kiem.py, có test trong scripts/tests/test_kiem.py và CI xanh.

## Phạm vi
scripts/kiem.py, scripts/tests/test_kiem.py, .claude/rules/code.md (một dòng trỏ luật).

## Nhật ký
- 2026-11-19 · Claude · tạo item theo QD25
- 2026-11-19 · Claude · gộp PR #12 theo QD25, CI xanh, 71 test scripts OK

## Bằng chứng
