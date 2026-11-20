---
id: EN13
tieu_de: "Vercel bỏ qua commit chỉ đổi tài liệu"
loai: EN
trang_thai: cho-test
thuc_hien: []
truoc: [EN11]
lien_quan: [QD28, EN11]
nguon: QD28
nguoi: tung
rui_ro: thap
uoc_luong: 30 phút
thuc_te:
can_duyet: []
based_on:
pr: [66]
ngay_tao: 2026-11-20
---
## Mục tiêu
Main vẫn bị chặn deploy ("Deployment rate limited — retry in 24 hours") dù EN11 đã tắt deploy nhánh PR, vì tài liệu, item, nhật ký đẩy thẳng main (CL4.7) và mỗi lần đẩy là một lần deploy. Commit chỉ đổi docs/, work/, tests/ hay scripts/ thì Vercel bỏ qua, chỉ deploy khi phần chạy app đổi (QD28).

## Làm tiêu chí nào
Không có NT. Kiểm bằng tay: đẩy một commit chỉ đổi work/ thì Vercel ghi "Canceled · Ignored Build Step"; gộp một PR có đổi src/ thì có deploy production.

## Phạm vi
- docs/process/CL4-quyen-han.md r3: CL4.7 mục 3 thêm quy ước gom lần đẩy main (Tùng hỏi vì sao không giảm số lần đẩy).
- vercel.json: thêm `ignoreCommand` chạy `git diff --quiet HEAD^ HEAD --` trên các đường dẫn làm nên app (src, public, index.html, package.json, package-lock.json, vite.config.ts, tsconfig*.json, vercel.json). Không đổi thì thoát 0 (Vercel bỏ qua), có đổi thì thoát 1 (deploy).

## Task
- [x] EN13-TA1 Code · PR #66

## Nhật ký
- 2026-11-20 · Claude (QD25) · tạo item: Tùng hỏi có chạm giới hạn deploy Vercel không; main bị chặn 24 giờ do khoảng 240 commit tài liệu trong 24 giờ
- 2026-11-20 · Claude (QD25) · thêm CL4 r3: gom lần đẩy main, theo câu hỏi của Tùng
- 2026-11-20 · Claude (QD25) · Gộp PR #66, CI xanh 4/4 (e2e lần đầu lỗi khởi động Supabase trên CI, lần sau qua). Kiểm deploy thật khi Vercel hết chặn.

## Bằng chứng
