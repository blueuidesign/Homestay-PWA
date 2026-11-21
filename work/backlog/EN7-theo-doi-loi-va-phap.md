---
id: EN7
tieu_de: "Theo dõi lỗi và pháp lý"
loai: EN
trang_thai: cho-test
thuc_hien: [YC15.3@1]
truoc: [EN1, EN2]
lien_quan: []
nguon: QD21
nguoi: tung
rui_ro: tb
uoc_luong:
thuc_te:
can_duyet: []
based_on:
pr: 89
ngay_tao: 2026-11-18
---
## Mục tiêu
Làm xong YC15.3 · Theo dõi lỗi và pháp lý.

## Làm tiêu chí nào
YC15.3-NT1, YC15.3-NT2

## Quy tắc, hành vi dùng
Không có.

## Màn hình
Không có màn.

## Quyền
Không chạm quyền.

## Phạm vi
supabase/migrations/20261121020000_en7_loi_app.sql, tests/db/92_en7_loi_app.sql, scripts/thu-lam-hong.txt, src/chung/baoLoi.ts(+test), src/man/TrangPhapLy.tsx/.css(+test), src/App.tsx, src/lib/dichVuCan.ts, src/lib/thongBao.ts, link ở A1Chao, A1Link, khung, docs/decisions/QD29, work/cau-hoi.md (YC1-H7).

## Ngoài phạm vi
- Phần đầu YC15-van-hanh.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC15.3
YC15-van-hanh.md#Quy tắc của nhóm
YC15-van-hanh.md#Ai được làm gì
YC15-van-hanh.md#Dữ liệu

## Test case
Không có kịch bản test tay riêng; NT thủ công ghi kết quả vào Bằng chứng.

## Task
- [x] EN7-TA1 Code · Claude Code (sonnet, CL14.6a): màn liên quan theo canvas, test unit, e2e cho YC15.3-NT2
- [ ] EN7-TA2 Kiểm thủ công · Đức: YC15.3-NT1, ghi kết quả vào Bằng chứng

## Kế hoạch
Công cụ báo lỗi theo QD29 (Claude tự quyết): bảng loi_app, fn_ghi_loi làm sạch số, email; fn_bao_loi_hang_ngay ghi thông báo cho quản trị lúc 8 giờ sáng. Hai trang /dieu-khoan, /chinh-sach-rieng-tu xem được khi chưa đăng nhập; nội dung Claude soạn, chờ Tùng duyệt (work/cho-tung.md), nên YC15.3-NT2 chỉ xong hẳn khi Tùng duyệt chữ.

## Nhật ký
- 2026-11-18 · Claude · tạo item từ YC15.3@1 (QD21)
- 2026-11-21 · Claude (tự chạy, QD25) · gộp PR #89 khi CI xanh, chờ Đức kiểm NT1 trên staging
- 2026-11-21 · Claude (thread tự chạy, QD25) · code báo lỗi và hai trang pháp lý, test db 14 đạt, unit 8 đạt, thử làm hỏng 2 đạt

## Bằng chứng
- YC15.3-NT1 lớp database: tests/db/92_en7_loi_app.sql (làm sạch số, email; giới hạn 30/giờ; tóm tắt hằng ngày cho quản trị); unit src/chung/baoLoi.test.ts. Phần "Tùng biết trong ngày" Đức kiểm thủ công trên staging (EN7-TA2).
- YC15.3-NT2 unit src/man/TrangPhapLy.test.tsx. Chữ chờ Tùng duyệt.
