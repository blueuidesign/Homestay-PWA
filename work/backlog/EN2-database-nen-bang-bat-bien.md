---
id: EN2
tieu_de: "Database nền: bảng, bất biến, quyền đọc ghi, dữ liệu mẫu và test database"
loai: EN
trang_thai: cho-test
thuc_hien: []
truoc: []
lien_quan: []
nguon: QD21
nguoi: tung
rui_ro: cao
uoc_luong:
thuc_te:
can_duyet: []
based_on:
pr: [7]
ngay_tao: 2026-11-18
---
## Mục tiêu
Database có đủ bảng theo mô hình, các bất biến được chặn ở database, quyền đọc qua RLS và ghi qua hàm, kèm bộ test database và dữ liệu mẫu DLM.

## Làm tiêu chí nào
Không có NT riêng. Xong khi các task xong và CI xanh.

## Đọc
thiet-ke-db.md#1. Cách làm chung
thiet-ke-db.md#2. Các nhóm bảng và ý định
thiet-ke-db.md#3. Bất biến (sai là hỏng sản phẩm)
thiet-ke-db.md#4. Ai đọc, ai ghi
thiet-ke-db.md#5. Việc chạy định kỳ
thiet-ke-db.md#6. Kiểm thử
PQ-ma-tran-quyen.md#Luật chung
QT1.1 QT5.1 QT5.2 QD4 QD6 QD11 QD13
du-lieu-mau.md

## Phạm vi
EN1: package.json, src/, tests/e2e/, .github/workflows/, vercel.json, docs/dev/chay-va-test.md. EN2: supabase/, scripts/test-db.sh, scripts/thu-lam-hong.sh, scripts/bang-cot.sh, docs/dev/chay-va-test.md. Item khác: điền khi lập kế hoạch.

## Không được
Code phần đặc tả chưa quyết (câu hỏi đang mở). Ghi bí mật, email, số điện thoại thật vào repo.

## Dừng và hỏi nếu
Tài liệu không nói rõ. Cần sửa file ngoài phạm vi. Cần quyền trong CL4.

## Task
- [x] EN2-TA1 Code · Claude Code (opus, agent riêng, CL14.6a): test database bất biến 1–12 và phép thử làm hỏng. PR #7
- [x] EN2-TA2 Code · Claude Code (opus, CL14.6a): migration, RLS, hàm dùng chung, test-db.sh, bang-cot.sh. PR #7
- [x] EN2-TA3 Code · Claude Code (opus, CL14.6a): seed DLM cho máy dev, job database trong CI, điền docs/dev/chay-va-test.md. PR #7
- [ ] EN2-TA4 Môi trường · Đức: chạy lại database và dữ liệu mẫu trên máy mình theo docs/dev/chay-va-test.md, báo chỗ hướng dẫn thiếu

## Kế hoạch

## Nhật ký
- 2026-11-18 · Claude · tạo item (QD21)
- 2026-11-18 · Claude (Tùng giao) · TA1–TA3 trên nhánh EN2-database-nen, PR #7 · test lệch hợp đồng 3 chỗ, sửa migration 1 vòng · khoảng 1 giờ
- 2026-11-19 · Claude (Tùng bảo "Gộp 6 7") · gộp PR #7 · cho-test · chờ Đức làm TA4

## Bằng chứng
- `scripts/test-db.sh` lần đầu (sau khi có migration): 259 qua, 3 hỏng, 1 file lỗi. Sửa migration 1 vòng (gio_nhan cho null, cấp can_dang_nhap cho authenticated, không xin hủy lại sau từ chối, bỏ giới hạn độ dài mã link). Cuối: 285 qua, 0 hỏng.
- `scripts/thu-lam-hong.sh`: 54 đạt, 0 không đạt.
- `python3 scripts/kiem.py --diff 55d89dd`: không có lỗi.
