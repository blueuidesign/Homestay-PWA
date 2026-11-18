---
id: EN1
tieu_de: "Dựng nền app: khung PWA, cấu trúc thư mục, công cụ test, CI và bản Preview"
loai: EN
trang_thai: moi
thuc_hien: []
truoc: []
lien_quan: []
nguon: QD21
nguoi: tung
rui_ro: tb
uoc_luong:
thuc_te:
can_duyet: []
based_on:
pr:
ngay_tao: 2026-11-18
---
## Mục tiêu
Có khung app PWA chạy được, cấu trúc thư mục, công cụ test ba lớp và CI, để các US sau chỉ việc thêm màn và hàm.

## Làm tiêu chí nào
Không có NT riêng. Xong khi các task xong và CI xanh.

## Đọc
pwa.md
QT5.1 QT5.2 QT5.5
docs/dev/chay-va-test.md
CL14.5

## Phạm vi
EN1: package.json, src/, tests/e2e/, .github/workflows/, vercel.json, docs/dev/chay-va-test.md. EN2: supabase/, scripts/test-db.sh, scripts/thu-lam-hong.sh, scripts/bang-cot.sh, docs/dev/chay-va-test.md. Item khác: điền khi lập kế hoạch.

## Không được
Code phần đặc tả chưa quyết (câu hỏi đang mở). Ghi bí mật, email, số điện thoại thật vào repo.

## Dừng và hỏi nếu
Tài liệu không nói rõ. Cần sửa file ngoài phạm vi. Cần quyền trong CL4.

## Task
- [ ] EN1-TA1 Code · Claude Code (opus, CL14.6a): khung Vite, React, TypeScript, manifest và service worker của PWA; cấu trúc src/ (ghi vào docs/dev/chay-va-test.md); hàm dùng chung cho ngày giờ Việt Nam và tiền số nguyên đồng (QT5.1, QT5.2) kèm test unit
- [ ] EN1-TA2 Code · Claude Code (sonnet, CL14.6a): công cụ test unit và e2e (Playwright, khung 390×844), job app trong .github/workflows/kiem.yml (typecheck, test, build), điền docs/dev/chay-va-test.md mục Cài, Test, Build
- [ ] EN1-TA3 Môi trường · Đức: nối repo vào Vercel, bản Preview theo nhánh (VIEC_TAY_CUA_TUNG.md bước 5); mở bản Preview trên iPhone và Android, cài lên màn hình chính, ghi một dòng biên bản

## Kế hoạch

## Nhật ký
- 2026-11-18 · Claude · tạo item (QD21)

## Bằng chứng
