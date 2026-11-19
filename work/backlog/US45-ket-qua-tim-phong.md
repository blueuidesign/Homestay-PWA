---
id: US45
tieu_de: "Kết quả tìm phòng"
loai: US
trang_thai: cho-test
thuc_hien: [YC7.3@1]
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
pr: [53]
ngay_tao: 2026-11-18
---
## Mục tiêu
Là sale, tôi làm được việc "Kết quả tìm phòng" đúng như YC7.3 mô tả.

## Làm tiêu chí nào
YC7.3-NT1 đến NT6

## Quy tắc, hành vi dùng
QT1.3, QT2.1, QT3.1, QT5.4, QT6.4

## Màn hình
S2, S4

## Quyền
PQ2, PQ3, PQ4, PQ5, PQ6, PQ11, PQ13, PQ14, PQ23 và các test vi phạm ở mục "Ai được làm gì" của YC7-lich-va-tim-phong-cua-sale.md thuộc mục này. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
Điền khi lập kế hoạch, theo cấu trúc thư mục EN1 ghi ở docs/dev/chay-va-test.md. Database chỉ thêm migration mới ở supabase/migrations/.

## Ngoài phạm vi
- YC7-H4 đã Claude tự chốt (QD25, YC7 r4).
- S6-07 (US54) và S6-03 (US56) chưa có: chạm căn của tôi, căn tự nhập mở màn tạm mang đúng tên màn và tên căn, để NT6 kiểm được; US54, US56 thay bằng màn thật. Chạm căn của chủ nhà mở S3 (US46): chưa có thì chưa làm gì. "Gửi cho khách" mở YC8 (US48): chưa có thì nút bấm được nhưng hiện toast "Gửi cho khách sẽ có ở bản sau".
- Phần đầu YC7-lich-va-tim-phong-cua-sale.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC7.3 QT1.3 QT2.1 QT3.1 QT5.4 QT6.4 PQ2 PQ3 PQ4 PQ5 PQ6 PQ11 PQ13 PQ14 PQ23 S2 S4
YC7-lich-va-tim-phong-cua-sale.md#Quy tắc của nhóm
YC7-lich-va-tim-phong-cua-sale.md#Ai được làm gì
YC7-lich-va-tim-phong-cua-sale.md#Dữ liệu
YC7-lich-va-tim-phong-cua-sale.md#Trạng thái màn (mọi mục)
thiet-ke-db.md#3. Bất biến (sai là hỏng sản phẩm)

## Test case
Kịch bản test tay: tests/kb/US45-ket-qua-tim-phong.md.

## Task
- [x] US45-TA1 Code · Claude Code (opus, CL14.6a): viết trước test database cho YC7.3-NT1, YC7.3-NT2, kể cả test vi phạm quyền ở mục "Ai được làm gì". Task sau không sửa file test này (CL14.5) · PR #53
- [x] US45-TA2 Code · Claude Code (opus, CL14.6a): migration, hàm fn_*, policy cho tới khi test database xanh; thêm phép thử làm hỏng vào scripts/thu-lam-hong.sh nếu đổi quyền, tiền, chặn trùng · PR #53
- [x] US45-TA3 Code · Claude Code (sonnet, CL14.6a): màn S2, S4 theo canvas, test unit, e2e cho YC7.3-NT1 đến NT6 · PR #53
- [ ] US45-TA4 Test tay · Đức: chạy tests/kb/US45-ket-qua-tim-phong.md, chế độ nhanh rồi đủ. Rủi ro cao: chạy trên cả iPhone và Android, thử vi phạm quyền bằng tay (CL6.3).

## Kế hoạch
- TA1: tests/db/61_us45_ket_qua_tim.sql: NT1 (5 căn trống, nhóm), NT2 (1509 không có mức cộng riêng: 2.200.000đ, bán 3.000.000đ), vi phạm quyền ở mục "Ai được làm gì", tập căn S4 lấy từ fn_sale_lich khớp kết quả.
- TA2: fn_sale_tim (US44) đã đủ trường thì không thêm migration; thiếu mới thêm 20261119390000_us45_ket_qua_tim.sql.
- TA3: src/lib/ketQuaTim.ts (thẻ, nhóm, độ tươi, sắp xếp, ô S4), S2KetQua, S4LichTuanKetQua, S6Tam; ManTimPhong nối S2/S4 thay màn tạm, đọc fn_sale_lich 7 ngày từ ngày nhận; unit NT1–NT6, e2e ket-qua-tim.spec.ts.

## Nhật ký
- 2026-11-18 · Claude · tạo item từ YC7.3@1 (QD21)
- 2026-11-19 · Claude (QD25) · tự chốt YC7-H4 (YC7 r4); viết kịch bản test tay; soạn gói việc; giao agent code
- 2026-11-19 · Claude (agent code) · TA1–TA3: test db 61, S2, S4, S6 tạm, unit, e2e; không cần migration · nhánh US45-ket-qua-tim
- 2026-11-19 · Claude (QD25) · Gộp PR #53, CI xanh 4/4. Chuyển cho-test, chờ Đức test tay TA4.

## Bằng chứng
- TA1: `CHI_FILE_CO_MA=1 scripts/test-db.sh YC7.3`: lần đầu 1 đỏ (số mong sai trong chính test, sửa 1 vòng), rồi 43 qua. Không cần migration (fn_sale_tim, fn_sale_lich đã đủ trường), nên không thêm phép thử làm hỏng.
- `scripts/test-db.sh`: 1727 qua, 0 hỏng. `npx vitest run`: 681 qua (16 mới, lần đầu xanh). `npm run typecheck`, `npm run build`: qua.
- e2e `tests/e2e/supabase`: 62 qua (ket-qua-tim.spec.ts mới, tim-phong.spec.ts của US44 vẫn qua). `kiem.py --diff origin/main`: không có lỗi.
