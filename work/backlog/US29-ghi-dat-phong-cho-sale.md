---
id: US29
tieu_de: "Ghi đặt phòng cho sale"
loai: US
trang_thai: dang-lam
thuc_hien: [YC5.4@1]
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
Là chủ nhà, tôi làm được việc "Ghi đặt phòng cho sale" đúng như YC5.4 mô tả.

## Làm tiêu chí nào
YC5.4-NT1 đến NT5

## Quy tắc, hành vi dùng
QT1, QT2, QT3.1, QT4, QT5.4, QT5.6, QT6.1, QT6.2

## Màn hình
CN4

## Quyền
PQ4, PQ7, PQ8, PQ9, PQ11, PQ17 và các test vi phạm ở mục "Ai được làm gì" của YC5-dat-phong.md thuộc mục này. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
supabase/migrations/20261120110000_us29_ghi_cho_sale.sql, tests/db/77_us29_ghi_cho_sale.sql, scripts/thu-lam-hong.txt, supabase/bang-va-cot.md, tests/kb/US29-ghi-dat-phong-cho-sale.md, docs/product/requirements/YC5-dat-phong.md (r5), work/cau-hoi.md (YC5-H13).

## Ngoài phạm vi
- YC5-H13 đã có lời đáp (Claude tự chốt, QD25), xem YC5 r5.
- Phần đầu YC5-dat-phong.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC5.4 QT1 QT2 QT3.1 QT4 QT5.4 QT5.6 QT6.1 QT6.2 PQ4 PQ7 PQ8 PQ9 PQ11 PQ17 DLM.3 CN4
YC5-dat-phong.md#Quy tắc của nhóm
YC5-dat-phong.md#Ai được làm gì
YC5-dat-phong.md#Dữ liệu
YC5-dat-phong.md#Trạng thái màn (mọi mục)
thiet-ke-db.md#3. Bất biến (sai là hỏng sản phẩm)

## Test case
Kịch bản test tay: tests/kb/US29-ghi-dat-phong-cho-sale.md.

## Task
- [x] US29-TA1 Code · Claude Code (opus, CL14.6a): viết trước test database cho YC5.4-NT1 đến NT5, kể cả test vi phạm quyền ở mục "Ai được làm gì". Task sau không sửa file test này (CL14.5)
- [x] US29-TA2 Code · Claude Code (opus, CL14.6a): migration, hàm fn_*, policy cho tới khi test database xanh; thêm phép thử làm hỏng vào scripts/thu-lam-hong.sh nếu đổi quyền, tiền, chặn trùng
- [x] US29-TA3 Code · Claude Code (sonnet, CL14.6a): màn CN4 theo canvas (chip sale, toast, lỗi đã có từ US27, US28; không đổi)
- [ ] US29-TA4 Test tay · Đức: chạy tests/kb/US29-ghi-dat-phong-cho-sale.md, chế độ nhanh rồi đủ. Rủi ro cao: chạy trên cả iPhone và Android, thử vi phạm quyền bằng tay (CL6.3).

## Kế hoạch
- TA1: tests/db/77_us29_ghi_cho_sale.sql, chủ gọi fn_tao_booking với p_sale_id như YC5.3.
- TA2: migration thay fn_tao_booking (bản US31) thêm phần riêng của sale có giá bán điền sẵn qua gia_ban_tu_tien_dem (QT5.4, làm tròn theo GD13, YC5-H13 tự chốt). Không dùng trigger vì test và dữ liệu mẫu tự chèn phần riêng.
- TA3: CN4 đã có chip sale, toast và lỗi (US27, US28): chỉ kiểm.

## Nhật ký
- 2026-11-18 · Claude · tạo item từ YC5.4@1 (QD21)

- 2026-11-20 · Claude (Tùng giao, QD25) · TA1–TA3; tự chốt YC5-H13; bất ngờ: kiểm kết nối, thông báo đã có từ US27, US28 · ~30 phút

## Bằng chứng
- `CHI_FILE_CO_MA=1 scripts/test-db.sh YC5.4`: lần đầu 9 hỏng (2 do test thiếu tiền phòng, sửa trong file test trước khi có code), sau đó 5 hỏng đúng phần chưa code; cuối 22 qua, 0 hỏng.
- Chạy riêng mọi file tests/db gọi fn_tao_booking: không có test hỏng.
- `scripts/thu-lam-hong.sh YC5.4`: 6/6 đạt.
