---
id: US44
tieu_de: "Tìm phòng trống theo ngày"
loai: US
trang_thai: dang-lam
thuc_hien: [YC7.2@1]
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
Là sale, tôi làm được việc "Tìm phòng trống theo ngày" đúng như YC7.2 mô tả.

## Làm tiêu chí nào
YC7.2-NT1 đến NT8

## Quy tắc, hành vi dùng
QT1.3, QT2.1, QT3.1, QT5.4, QT6.4

## Màn hình
S1-02, S1-03, S2-00

## Quyền
PQ2, PQ3, PQ4, PQ5, PQ6, PQ11, PQ13, PQ14, PQ23 và các test vi phạm ở mục "Ai được làm gì" của YC7-lich-va-tim-phong-cua-sale.md thuộc mục này. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
Điền khi lập kế hoạch, theo cấu trúc thư mục EN1 ghi ở docs/dev/chay-va-test.md. Database chỉ thêm migration mới ở supabase/migrations/.

## Ngoài phạm vi
- YC7-H1, H2, H3, H5 đã Claude tự chốt (QD25, YC7 r3).
- Màn kết quả S2, S4 là YC7.3 (US45). Ở US44, lệnh tìm đã trả kết quả đủ cho S2; có căn trống thì app tạm hiện một màn đơn giản ghi số căn trống và nút "Sửa tìm kiếm", US45 thay bằng S2.
- Phần đầu YC7-lich-va-tim-phong-cua-sale.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC7.2 QT1.3 QT2.1 QT3.1 QT5.4 QT6.4 PQ2 PQ3 PQ4 PQ5 PQ6 PQ11 PQ13 PQ14 PQ23 S1-02 S1-03 S2-00
YC7-lich-va-tim-phong-cua-sale.md#Quy tắc của nhóm
YC7-lich-va-tim-phong-cua-sale.md#Ai được làm gì
YC7-lich-va-tim-phong-cua-sale.md#Dữ liệu
YC7-lich-va-tim-phong-cua-sale.md#Trạng thái màn (mọi mục)
thiet-ke-db.md#3. Bất biến (sai là hỏng sản phẩm)

## Test case
Kịch bản test tay: tests/kb/US44-tim-phong-trong-theo-ngay.md.

## Task
- [x] US44-TA1 Code · Claude Code (opus, CL14.6a): viết trước test database cho YC7.2-NT3, YC7.2-NT5, YC7.2-NT6, YC7.2-NT8, kể cả test vi phạm quyền ở mục "Ai được làm gì". Task sau không sửa file test này (CL14.5)
- [x] US44-TA2 Code · Claude Code (opus, CL14.6a): migration, hàm fn_*, policy cho tới khi test database xanh; thêm phép thử làm hỏng vào scripts/thu-lam-hong.sh nếu đổi quyền, tiền, chặn trùng
- [x] US44-TA3 Code · Claude Code (sonnet, CL14.6a): màn S1-02, S1-03, S2-00 theo canvas, test unit, e2e cho YC7.2-NT1, YC7.2-NT2, YC7.2-NT3, YC7.2-NT4, YC7.2-NT7
- [ ] US44-TA4 Test tay · Đức: chạy tests/kb/US44-tim-phong-trong-theo-ngay.md, chế độ nhanh rồi đủ. Rủi ro cao: chạy trên cả iPhone và Android, thử vi phạm quyền bằng tay (CL6.3).

## Kế hoạch
- TA1: tests/db/60_us44_tim_phong.sql, hợp đồng `fn_sale_tim(p_tu, p_den, p_so_phong_ngu smallint[], p_toa_nha uuid[], p_view text[])` trả jsonb {so_can_trong, can[], goi_y[]}; "hôm nay" 06/10 bằng cách thay local_today().
- TA2: migration 20261119380000: hàm nội bộ `can_tim` (căn trống mọi đêm, căn tự nhập riêng), `fn_sale_tim` (kiểm ngày, ghi tim_gan_day giữ 5, trùng thì đưa lên đầu, gợi ý khi 0 căn). Phép thử làm hỏng ở thu-lam-hong.txt.
- TA3: lib timPhong.ts (ngày trả, nút, dòng tìm gần đây, gợi ý), dichVuTimPhong.ts, màn S102TimPhong, S200KhongCoCan; nối từ S1 qua context trong ManSale (ManTam.tsx, App.tsx ngoài phạm vi), dịch vụ gắn vào lichSale ở dichVuCan.ts; e2e tim-phong.spec.ts.

## Nhật ký
- 2026-11-18 · Claude · tạo item từ YC7.2@1 (QD21)
- 2026-11-19 · Claude (QD25) · tự chốt YC7-H1, H2, H3, H5 (YC7 r3, thêm NT8); viết kịch bản test tay; soạn gói việc; giao agent code
- 2026-11-19 · Claude (agent code) · TA1, TA2, TA3 trên nhánh US44-tim-phong, chưa mở PR; tự chọn hợp đồng jsonb của fn_sale_tim, nối S1 qua context · ~2 giờ

## Bằng chứng
- TA1 `CHI_FILE_CO_MA=1 scripts/test-db.sh YC7.2`: trước migration 43 hỏng; sau migration 61 qua, 0 vòng sửa. Cả bộ `scripts/test-db.sh`: 1684 qua, 0 hỏng.
- TA2 `scripts/thu-lam-hong.sh YC7.2`: 7/7 phép thử đỏ khi phá (phạm vi xem, chặn đêm kín, đếm tự nhập, giữ 5, trùng lên đầu, ngày quá khứ, RLS tim_gan_day).
- TA3 `npx vitest run`: 665 qua (lib viết trước test unit lib; test màn viết cùng màn), 1 vòng sửa kiểu ở test. `npm run typecheck`, `npm run build` qua. e2e `tests/e2e/supabase`: 61 qua (tim-phong.spec.ts 1 vòng sửa locator). `python3 scripts/kiem.py --diff origin/main`: không có lỗi.
