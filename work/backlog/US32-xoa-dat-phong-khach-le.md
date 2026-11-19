---
id: US32
tieu_de: "Xóa đặt phòng khách lẻ"
loai: US
trang_thai: dang-lam
thuc_hien: [YC5.7@1]
truoc: [EN1, EN2, EN4, US2]
lien_quan: []
thay_cho: []
nguon: QD21
nguoi: tung
rui_ro: cao
nghiem_thu: khong
uoc_luong:
thuc_te:
can_duyet: []
based_on:
pr:
ngay_tao: 2026-11-18
---
## Mục tiêu
Là chủ nhà, tôi làm được việc "Xóa đặt phòng khách lẻ" đúng như YC5.7 mô tả.

## Làm tiêu chí nào
YC5.7-NT1 đến NT5

## Quy tắc, hành vi dùng
QT1, QT2, QT3.1, QT4, QT5.6, QT6.1, QT6.2

## Màn hình
CN3-02

## Quyền
PQ4, PQ7, PQ8, PQ9, PQ11, PQ17 và các test vi phạm ở mục "Ai được làm gì" của YC5-dat-phong.md thuộc mục này. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
Điền khi lập kế hoạch, theo cấu trúc thư mục EN1 ghi ở docs/dev/chay-va-test.md. Database chỉ thêm migration mới ở supabase/migrations/.

## Ngoài phạm vi
- Phần đầu YC5-dat-phong.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC5.7 QT1 QT2 QT3.1 QT4 QT5.6 QT6.1 QT6.2 PQ4 PQ7 PQ8 PQ9 PQ11 PQ17 CN3-02
YC5-dat-phong.md#Quy tắc của nhóm
YC5-dat-phong.md#Ai được làm gì
YC5-dat-phong.md#Dữ liệu
YC5-dat-phong.md#Trạng thái màn (mọi mục)
thiet-ke-db.md#3. Bất biến (sai là hỏng sản phẩm)

## Test case
Kịch bản test tay: tests/kb/US32-xoa-dat-phong-khach-le.md.

## Task
- [ ] US32-TA1 Code · Claude Code (opus, CL14.6a): viết trước test database cho YC5.7-NT2, YC5.7-NT4, YC5.7-NT5, kể cả test vi phạm quyền ở mục "Ai được làm gì". Task sau không sửa file test này (CL14.5)
- [ ] US32-TA2 Code · Claude Code (opus, CL14.6a): migration, hàm fn_*, policy cho tới khi test database xanh; thêm phép thử làm hỏng vào scripts/thu-lam-hong.sh nếu đổi quyền, tiền, chặn trùng
- [ ] US32-TA3 Code · Claude Code (sonnet, CL14.6a): màn CN3-02 theo canvas, test unit, e2e cho YC5.7-NT1, YC5.7-NT3, YC5.7-NT5
- [ ] US32-TA4 Test tay · Đức: chạy tests/kb/US32-xoa-dat-phong-khach-le.md, chế độ nhanh rồi đủ. Rủi ro cao: chạy trên cả iPhone và Android, thử vi phạm quyền bằng tay (CL6.3).

## Kế hoạch
- TA1: tests/db/47_us32_xoa_dat_phong.sql (NT2, NT4, NT5, vi phạm PQ7.SALE, PQ7.CHU, PQ7.LINK, nhật ký, giờ lịch đổi, không báo ai).
- TA2: migration 20261119260000: fn_xoa_booking (chỉ người giữ căn, chỉ sale_id null và nguồn chu_ghi), trigger sau khi xóa cập nhật can.lich_doi_luc; nhật ký qua trigger booking_nhat_ky có sẵn; 6 phép thử làm hỏng.
- TA3: CN3-02 nút "Xóa đặt phòng" (khách lẻ) với hộp hỏi lại, "Xin hủy" (có sale, toast "Sẽ có ở bản sau" tới YC5.8); ManChu về đúng màn đã mở như US31; dichVuDatPhong.xoaDatPhong; unit, e2e.

## Nhật ký
- 2026-11-18 · Claude · tạo item từ YC5.7@1 (QD21)
- 2026-11-19 · Claude · TA1, TA2, TA3 trên nhánh US32-xoa-dat-phong; e2e chưa chạy vì Supabase trên máy thiếu kong · 1 giờ

## Bằng chứng
- `scripts/test-db.sh YC5.7`: lần đầu đỏ 19/30 (chưa có hàm); sửa 1 vòng (một test TA1 tính cả dòng xóa 43_us28 để lại, thu hẹp về đặt phòng của file); cuối: cả bộ 1023 qua, 0 hỏng.
- `scripts/thu-lam-hong.sh YC5.7`: lần đầu 5/6 (sửa nhãn một dòng), cuối 6/6 đạt.
- `npx vitest run`: 415 qua (unit YC5.7 viết cùng code, xanh lần đầu). `npm run typecheck`, `npm run build` qua. `kiem.py --diff origin/main`: không lỗi.
- e2e tests/e2e/supabase/xoa-dat-phong.spec.ts: chưa chạy được, Supabase trên máy thiếu kong (mount từ worktree hs-us20 đã xóa).
