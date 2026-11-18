---
id: EN2
tieu_de: "Database nền: bảng, bất biến, quyền đọc ghi, dữ liệu mẫu và test database"
loai: EN
trang_thai: moi
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
pr:
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
- [ ] EN2-TA1 Code · Claude Code (opus, CL14.6a): viết trước test database cho từng bất biến ở thiet-ke-db.md mục 3, kể cả phép thử làm hỏng (scripts/thu-lam-hong.sh). Task sau không sửa file test này (CL14.5)
- [ ] EN2-TA2 Code · Claude Code (opus, CL14.6a): migration bảng, ràng buộc chặn trùng (QD6), RLS, hàm my_shared_can_ids() và khung hàm fn_* tự kiểm người gọi; script dựng database và chạy test (scripts/test-db.sh), sinh bảng cột (scripts/bang-cot.sh)
- [ ] EN2-TA3 Code · Claude Code (sonnet, CL14.6a): seed dữ liệu mẫu DLM cho máy dev và staging (tên giả), job database trong CI, điền docs/dev/chay-va-test.md mục "Chạy app với database thử trên máy"
- [ ] EN2-TA4 Môi trường · Đức: chạy lại database và dữ liệu mẫu trên máy mình theo docs/dev/chay-va-test.md, báo chỗ hướng dẫn thiếu

## Kế hoạch

## Nhật ký
- 2026-11-18 · Claude · tạo item (QD21)

## Bằng chứng
