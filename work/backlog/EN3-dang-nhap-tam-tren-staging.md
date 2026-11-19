---
id: EN3
tieu_de: "Đăng nhập tạm trên staging và tài khoản thử"
loai: EN
trang_thai: dang-lam
thuc_hien: []
truoc: [EN1, EN2]
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
Có đăng nhập email và mật khẩu chỉ trên staging để thử và chạy e2e, trong khi chờ QD22 chọn cách đăng nhập thật.

## Làm tiêu chí nào
Không có NT riêng. Xong khi các task xong và CI xanh.

## Đọc
QD22
pwa.md
YC1.2
HV7
PQ1 PQ2

## Phạm vi
supabase/migrations/ (fn_tao_ho_so), tests/db/, scripts/thu-lam-hong.txt, supabase/bang-va-cot.md, src/tai-khoan/, src/App.tsx, src/styles.css, vite.config.ts, playwright.config.ts, tests/e2e/, .github/workflows/kiem.yml, package.json, docs/dev/chay-va-test.md, docs/ha-tang/Bi_mat_va_cau_hinh.md.

## Không được
Code phần đặc tả chưa quyết (câu hỏi đang mở). Ghi bí mật, email, số điện thoại thật vào repo. Đăng nhập thật cho người dùng: YC1.2 sau khi Tùng chốt QD22.

## Dừng và hỏi nếu
Tài liệu không nói rõ. Cần sửa file ngoài phạm vi. Cần quyền trong CL4.

## Task
- [x] EN3-TA1 Code · đăng nhập thử bật bằng VITE_DANG_NHAP_THU, fn_tao_ho_so, test database (anon đọc ghi đã có ở KT-DB.3.1 của EN2) · PR EN3-dang-nhap-tam
- [ ] EN3-TA2 Code · Claude Code (sonnet, CL14.6a): e2e đăng nhập bằng tài khoản thử lấy từ GitHub Secrets (tên ở docs/ha-tang/Bi_mat_va_cau_hinh.md), không ghi mật khẩu vào repo. Đã viết ở PR EN3-dang-nhap-tam; chưa chạy được trên staging vì chưa có secret
- [ ] EN3-TA3 Môi trường · Tùng: tạo Supabase staging, tài khoản thử, GitHub Secrets (VIEC_TAY_CUA_TUNG.md bước 2, 3, 7)

## Kế hoạch
App gọi fn_tao_ho_so ngay sau khi có phiên (YC1.2 bước 2). Sau khi đăng nhập chỉ hiện vỏ app: A3 và tab Lịch làm ở US1, US14. Lỗi khác sai mật khẩu hiện câu HV2 bước 5. Tách A3, link mời (YC1.2-NT1, NT5) cho US2.

## Nhật ký
- 2026-11-18 · Claude · tạo item (QD21)
- 2026-11-19 · Claude (Tùng giao "làm tiếp") · TA1, TA2 · PR EN3-dang-nhap-tam · staging chưa có migration EN2 và secret e2e · ~1 giờ

## Bằng chứng
- `scripts/test-db.sh EN3` lần đầu đỏ (chưa có hàm), sau migration 13/13; cả bộ 298/298. `scripts/thu-lam-hong.sh` 57/57.
- `npx vitest run` lần đầu đỏ 2 file mới, 1 vòng sửa (dọn màn sau mỗi test), xanh 30/30. Typecheck, build xanh; build có `VERCEL_ENV=production VITE_DANG_NHAP_THU=1` bị chặn đúng.
- E2E dự án dien-thoai 3/3. Dự án dang-nhap-thu chưa chạy (chưa có secret staging); thử tay bằng Supabase giả lập qua Playwright: sai mật khẩu báo đúng câu, đúng thì vào app, gọi fn_tao_ho_so một lần, tải lại vẫn ở trong app.
