---
id: EN1
tieu_de: "Dựng nền app: khung PWA, cấu trúc thư mục, công cụ test, CI và bản Preview"
loai: EN
trang_thai: dang-lam
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
- [x] EN1-TA1 Code · khung PWA, cấu trúc src/, hàm ngày và tiền (QT5.1, QT5.2). Viết rút gọn chờ QT5-H1 · PR EN1-dung-nen-app
- [x] EN1-TA2 Code · Vitest, Playwright 390×844, job app trong kiem.yml, phần app của chay-va-test.md · PR EN1-dung-nen-app
- [ ] EN1-TA3 Môi trường · Đức: nối repo vào Vercel, bản Preview theo nhánh (VIEC_TAY_CUA_TUNG.md bước 5); mở bản Preview trên iPhone và Android, cài lên màn hình chính, ghi một dòng biên bản

## Kế hoạch

## Nhật ký
- 2026-11-18 · Claude · tạo item (QD21)
- 2026-11-18 · Claude (Tùng giao) · TA1, TA2 · PR EN1-dung-nen-app · nhánh đặt trên QD21 vì PR #5 chưa gộp; hỏi QT5-H1 · ~1 giờ

## Bằng chứng
- `npx vitest run` lần đầu đỏ 2 file (chưa có ngay.ts, tien.ts), viết code 1 vòng, xanh 20/20.
- `npm run typecheck`, `npm run build` (JS 69 KB gzip) xanh. `npx playwright test` 3/3 xanh (390×844, manifest, mở lại khi mất mạng).
