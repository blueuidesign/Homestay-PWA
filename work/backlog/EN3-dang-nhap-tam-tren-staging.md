---
id: EN3
tieu_de: "Đăng nhập tạm trên staging và tài khoản thử"
loai: EN
trang_thai: huy
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
Điền khi lập kế hoạch.

## Không được
Code phần đặc tả chưa quyết (câu hỏi đang mở). Ghi bí mật, email, số điện thoại thật vào repo. Đăng nhập thật cho người dùng: YC1.2 sau khi Tùng chốt QD22.

## Dừng và hỏi nếu
Tài liệu không nói rõ. Cần sửa file ngoài phạm vi. Cần quyền trong CL4.

## Task
- [ ] EN3-TA1 Code · Claude Code (opus, CL14.6a): đăng nhập email và mật khẩu bằng Supabase Auth, chỉ bật khi biến môi trường cho phép; hồ sơ profiles; test database: người chưa đăng nhập không đọc ghi được gì
- [ ] EN3-TA2 Code · Claude Code (sonnet, CL14.6a): e2e đăng nhập bằng tài khoản thử lấy từ GitHub Secrets (tên ở docs/ha-tang/Bi_mat_va_cau_hinh.md), không ghi mật khẩu vào repo
- [ ] EN3-TA3 Môi trường · Tùng: tạo Supabase staging, tài khoản thử, GitHub Secrets (VIEC_TAY_CUA_TUNG.md bước 2, 3, 7)

## Kế hoạch

## Nhật ký
- 2026-11-18 · Claude · tạo item (QD21)
- 2026-11-19 · Claude · huy: QD22 bỏ hẳn đăng nhập bằng mật khẩu, kể cả staging. PR #8 đóng không gộp. Hàm tạo hồ sơ chuyển sang US2

## Bằng chứng
