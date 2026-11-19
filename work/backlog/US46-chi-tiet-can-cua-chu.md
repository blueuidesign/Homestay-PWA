---
id: US46
tieu_de: "Chi tiết căn của chủ nhà và giá bán"
loai: US
trang_thai: dang-lam
thuc_hien: [YC7.4@1]
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
Là sale, tôi làm được việc "Chi tiết căn của chủ nhà và giá bán" đúng như YC7.4 mô tả.

## Làm tiêu chí nào
YC7.4-NT1 đến NT7; HV5-NT1, HV5-NT2 (hành vi chung gắn màn này, QD27)

## Quy tắc, hành vi dùng
QT1.3, QT2.1, QT3.1, QT5.4, QT6.4

## Màn hình
S3

## Quyền
PQ2 và các test vi phạm ở mục "Ai được làm gì" của YC7-lich-va-tim-phong-cua-sale.md thuộc mục này. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
Điền khi lập kế hoạch, theo cấu trúc thư mục EN1 ghi ở docs/dev/chay-va-test.md. Database chỉ thêm migration mới ở supabase/migrations/.

## Ngoài phạm vi
- YC7-H6, H7 đã Claude tự chốt (QD25, YC7 r5).
- "Gửi yêu cầu đặt phòng" mở S3-02 (YC9.1, US50): chưa có thì mở màn tạm S3-02 mang đúng căn và ngày để NT3 kiểm được. "Gửi cho khách" (YC8, US48): toast "Gửi cho khách sẽ có ở bản sau".
- Phần đầu YC7-lich-va-tim-phong-cua-sale.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC7.4 QT1.3 QT2.1 QT3.1 QT5.4 QT6.4 PQ2 S3
YC7-lich-va-tim-phong-cua-sale.md#Quy tắc của nhóm
YC7-lich-va-tim-phong-cua-sale.md#Ai được làm gì
YC7-lich-va-tim-phong-cua-sale.md#Dữ liệu
YC7-lich-va-tim-phong-cua-sale.md#Trạng thái màn (mọi mục)
thiet-ke-db.md#3. Bất biến (sai là hỏng sản phẩm)

## Test case
Kịch bản test tay: tests/kb/US46-chi-tiet-can-cua-chu.md.

## Task
- [x] US46-TA1 Code: tests/db/62_us46_chi_tiet_can_sale.sql (nhánh US46-chi-tiet-can-sale)
- [x] US46-TA2 Code: migration 20261119400000_us46_chi_tiet_can_sale.sql, 8 phép thử làm hỏng
- [x] US46-TA3 Code: S3, S3-02 tạm, nối chạm căn ở S1, S2, S4; unit và e2e
- [ ] US46-TA4 Test tay · Đức: chạy tests/kb/US46-chi-tiet-can-cua-chu.md, chế độ nhanh rồi đủ. Rủi ro cao: chạy trên cả iPhone và Android, thử vi phạm quyền bằng tay (CL6.3).

## Kế hoạch
- DB: fn_sale_chi_tiet_can(căn, từ, đến) trả jsonb (căn, ảnh, chủ, giá chủ và giá bán từng đêm, mức cộng, lịch 14 ngày, giờ) hoặc chỉ {khong_con_quyen, ly_do} (HV5); fn_dat_muc_cong, fn_bo_muc_cong (chip "Mặc định"). Chỉ căn trong my_shared_can_ids().
- App: S3ChiTietCan, ảnh qua createSignedUrls 3600 giây; chạm căn chủ nhà ở S2/S4 (ngày đang tìm, tô ngày hỏi) và S1 (ngày đầu đang xem, 1 đêm) mở S3; S3-02 tạm trong S6Tam.
- Claude tự chọn (ghi ở PR): lịch 14 ngày bắt đầu thứ Hai của tuần có ngày nhận (theo lưới canvas); ngày đã qua không ghi "Trống"; mức cộng tối đa 50.000.000đ mỗi đêm; căn đã xóa, ngoài phạm vi không có lý do; chạm căn của tôi, tự nhập ở S1 mở S6-07, S6-03 tạm như S2. Không làm [MỞ: PQ2-H1].

## Nhật ký
- 2026-11-18 · Claude · tạo item từ YC7.4@1 (QD21)
- 2026-11-19 · Claude · nhận HV5-NT1, HV5-NT2 từ EN4 (QD27)
- 2026-11-19 · Claude (QD25) · tự chốt YC7-H6, H7 (YC7 r5, thêm NT7); viết kịch bản test tay; soạn gói việc; giao agent code
- 2026-11-19 · Claude (agent code) · TA1 đến TA3 trên nhánh US46-chi-tiet-can-sale, chưa mở PR · test xanh một vòng · ~1 giờ

## Bằng chứng
- TA1: `CHI_FILE_CO_MA=1 scripts/test-db.sh YC7.4` trước migration: 55 hỏng, 22 qua (đỏ đúng chỗ). TA2: sau migration 77 qua, 0 hỏng, một vòng; HV5: 11 qua. Cả bộ `scripts/test-db.sh`: 1806 qua, 0 hỏng.
- `scripts/thu-lam-hong.sh YC7.4`: 8 đạt, 0 không đạt.
- `npx vitest run`: 74 file, 720 test qua (S3 viết màn trước test unit; test qua ngay lần đầu). `npm run typecheck`, `npm run build`: qua.
- e2e `tests/e2e/supabase/chi-tiet-can-sale.spec.ts` qua lần đầu; cả bộ e2e supabase 63 qua. `python3 scripts/kiem.py --diff origin/main`: không có lỗi.
