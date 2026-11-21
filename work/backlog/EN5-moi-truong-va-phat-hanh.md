---
id: EN5
tieu_de: "Môi trường và phát hành"
loai: EN
trang_thai: dang-lam
thuc_hien: [YC15.1@1]
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
Làm xong YC15.1 · Môi trường và phát hành.

## Làm tiêu chí nào
YC15.1-NT1 đến NT4

## Quy tắc, hành vi dùng
Không có.

## Màn hình
Không có màn.

## Quyền
Không chạm quyền.

## Phạm vi
tests/e2e/phat-hanh.spec.ts, docs/ha-tang/Phat_hanh.md, docs/INDEX.md, work/cho-tung.md. Không có migration, không chạm production.

## Ngoài phạm vi
- Phần đầu YC15-van-hanh.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC15.1
YC15-van-hanh.md#Quy tắc của nhóm
YC15-van-hanh.md#Ai được làm gì
YC15-van-hanh.md#Dữ liệu

## Test case
Không có kịch bản test tay riêng; NT thủ công ghi kết quả vào Bằng chứng.

## Task
- [x] EN5-TA1 Code · Claude Code (opus, CL14.6a): màn liên quan theo canvas, test unit, e2e cho YC15.1-NT2
- [ ] EN5-TA2 Kiểm thủ công · Đức: YC15.1-NT1, YC15.1-NT3, YC15.1-NT4, ghi kết quả vào Bằng chứng

## Kế hoạch
Sổ tay phát hành docs/ha-tang/Phat_hanh.md cho Tùng làm khi QD23 chốt. NT2 e2e chạy trên bản build ở máy, đặt E2E_BASE_URL để chạy trên tên miền chính. NT3 cần trang quản trị của YC13, chưa có item.

## Nhật ký
- 2026-11-18 · Claude · tạo item từ YC15.1@1 (QD21)
- 2026-11-21 · Claude (tự chạy, QD25) · e2e YC15.1-NT2, sổ tay phát hành; production chờ QD23, PR không tự gộp · ~20 phút

## Bằng chứng
- `npx playwright test tests/e2e/phat-hanh.spec.ts` trên bản build ở máy: 2 đạt. Trên tên miền chính: chưa chạy (chưa có production).
