---
id: US50
tieu_de: "Sale gửi và hủy yêu cầu"
loai: US
trang_thai: dang-lam
thuc_hien: [YC9.1@2]
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
Là sale, tôi làm được việc "Sale gửi và hủy yêu cầu" đúng như YC9.1 mô tả.

## Làm tiêu chí nào
YC9.1-NT1 đến NT5, NT7 đến NT13 (NT6 bỏ)

## Quy tắc, hành vi dùng
QT1.1, QT1.4, QT2.1, QT5.6, QT6.2

## Màn hình
S3-02, S3-03, S3-07, S3-08

## Quyền
PQ10 và các test vi phạm ở mục "Ai được làm gì" của YC9-yeu-cau-dat-phong.md thuộc mục này. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
Điền khi lập kế hoạch, theo cấu trúc thư mục EN1 ghi ở docs/dev/chay-va-test.md. Database chỉ thêm migration mới ở supabase/migrations/.

## Ngoài phạm vi
- YC9-H1, H2, H6, H7, H8 đã Claude tự chốt (QD25, YC9 r3).
- Phần đầu YC9-yeu-cau-dat-phong.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC9.1 QT1.1 QT1.4 QT2.1 QT5.6 QT6.2 PQ10 S3-02 S3-03 S3-07 S3-08
YC9-yeu-cau-dat-phong.md#Quy tắc của nhóm
YC9-yeu-cau-dat-phong.md#Ai được làm gì
YC9-yeu-cau-dat-phong.md#Dữ liệu
YC9-yeu-cau-dat-phong.md#Trạng thái màn (mọi mục)
thiet-ke-db.md#3. Bất biến (sai là hỏng sản phẩm)

## Test case
Kịch bản test tay: tests/kb/US50-sale-gui-va-huy-yeu.md.

## Task
- [x] US50-TA1 Code: test database tests/db/66_us50_gui_yeu_cau.sql · nhánh US50-gui-yeu-cau
- [x] US50-TA2 Code: migration 20261119440000_us50_gui_yeu_cau.sql, 15 phép thử làm hỏng · nhánh US50-gui-yeu-cau
- [x] US50-TA3 Code: S3-02, S3-03, S3-07, S3-08 (src/man/S3GuiYeuCau.tsx), unit, e2e gui-yeu-cau.spec.ts · nhánh US50-gui-yeu-cau
- [ ] US50-TA4 Test tay · Đức: chạy tests/kb/US50-sale-gui-va-huy-yeu.md, chế độ nhanh rồi đủ. Rủi ro cao: chạy trên cả iPhone và Android, thử vi phạm quyền bằng tay (CL6.3).

## Kế hoạch
- TA1: tests/db/66_us50_gui_yeu_cau.sql (hợp đồng ở đầu file), ngày tính từ hôm nay để không hỏng theo thời gian.
- TA2: migration 20261119440000: fn_gui_yeu_cau, fn_yeu_cau_cua_toi, fn_huy_yeu_cau, fn_chu_xem_yeu_cau; policy chủ căn bỏ dòng đã hủy; thông báo 'yeu_cau_moi'; phép thử làm hỏng.
- TA3: src/lib/yeuCau.ts, dichVuYeuCau.ts; src/man/S3GuiYeuCau.tsx (S3-02, S3-03, S3-07, S3-08) thay S302Tam; nối ở S3ChiTietCan, ManSale, dichVuCan; e2e gui-yeu-cau.spec.ts.

## Nhật ký
- 2026-11-18 · Claude · tạo item từ YC9.1@1 (QD21)
- 2026-11-19 · Claude · thuc_hien lên bản mới theo QD22
- 2026-11-19 · Claude (QD25) · YC9 r3 tự chốt câu mở, thêm NT
- 2026-11-20 · Claude · TA1–TA3 trên nhánh US50-gui-yeu-cau, chưa PR · bất ngờ: chủ căn đọc được dòng yêu cầu đã hủy, đổi policy · ~2 giờ

## Bằng chứng
- DB: `scripts/test-db.sh` (lọc YC9.1). Lần đầu đỏ: 4 hỏng + file dừng ở NT1 (chưa có hàm). Sau migration: 1 hỏng do test gọi hủy khi chưa đăng nhập, sửa test (thêm vai Hùng, không nới), 1 vòng. Cuối: cả bộ 2003 qua, 0 hỏng.
- Thử làm hỏng: `scripts/thu-lam-hong.sh YC9`: lần đầu 14/15 đạt (NT10 phá chưa đủ), sửa phép thử, cuối 15/15 đạt.
- Unit: 3 file mới đỏ trước khi có code; 2 hỏng vòng đầu (chữ lẫn icon, trùng chữ đầu màn), sửa 1 vòng. `npx vitest run`: 82 file, 791 test qua. Test cũ YC7.4-NT3 (S3ChiTietCan.test.tsx, chi-tiet-can-sale.spec.ts) không đổi: S3-02 thật giữ data-man, data-can, data-tu, data-den, s302-can, s302-khoang.
- e2e: gui-yeu-cau.spec.ts qua lần đầu; cả bộ tests/e2e/supabase 66 qua.
- `npm run typecheck` qua, `npm run build` qua, `python3 scripts/kiem.py --diff origin/main`: không có lỗi.
