---
id: US34
tieu_de: "Phía sale: đặt phòng chủ nhà ghi giúp"
loai: US
trang_thai: cho-test
thuc_hien: [YC5.9@1]
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
pr: [72]
ngay_tao: 2026-11-18
---
## Mục tiêu
Là sale, tôi làm được việc "Phía sale: đặt phòng chủ nhà ghi giúp" đúng như YC5.9 mô tả.

## Vì sao sửa
Canvas chưa có hình cho phần "Phía sale: đặt phòng chủ nhà ghi giúp" (YC5.9, dòng "Màn:" ghi "chưa có hình"). Không vẽ trước thì task Code phải tự đặt bố cục và chữ, dễ lệch với các màn khác và với YC.

## Màn phải làm
| Màn | Loại | Đổi gì | Theo |
|---|---|---|---|
| <mã mới, Design đặt theo CL13> | thêm | Màn và trạng thái cho các bước của YC5.9, chữ đúng như bảng bước | YC5.9 |

## Làm tiêu chí nào
YC5.9-NT1, YC5.9-NT2

## Quy tắc, hành vi dùng
QT1, QT2, QT3.1, QT4, QT5.6, QT6.1, QT6.2

## Màn hình
S3-10 (sale xem đặt phòng chủ đã sửa, nhận từ US31, Claude tự quyết QD25). Phần còn lại chưa có hình.

## Quyền
PQ4, PQ7, PQ8, PQ9, PQ11, PQ17 và các test vi phạm ở mục "Ai được làm gì" của YC5-dat-phong.md thuộc mục này. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
supabase/migrations/20261120120000_us34_sale_xem_dat_phong.sql, tests/db/78_us34_sale_xem_dat_phong.sql, scripts/thu-lam-hong.txt, supabase/bang-va-cot.md, src/lib/datPhongSale.ts, src/lib/dichVuDatPhongSale.ts, src/lib/dichVuCan.ts, src/man/S310DatPhongSale.tsx (+test), src/man/ManSale.tsx, tests/e2e/supabase/sale-xem-dat-phong.spec.ts, tests/kb/US34-phia-sale-dat-phong-chu.md, YC5 r6, work/cau-hoi.md.

## Ngoài phạm vi
- YC5-H10, YC5-H11 Claude tự chốt 20/11 (QD25), ghi ở YC5 r6.
- Thông báo "ghi đặt phòng cho bạn" mở màn này: làm ở YC12. Nút xin hủy: US33.
- Phần đầu YC5-dat-phong.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC5.9 QT1 QT2 QT3.1 QT4 QT5.6 QT6.1 QT6.2 PQ4 PQ7 PQ8 PQ9 PQ11 PQ17
YC5-dat-phong.md#Quy tắc của nhóm
YC5-dat-phong.md#Ai được làm gì
YC5-dat-phong.md#Dữ liệu
YC5-dat-phong.md#Trạng thái màn (mọi mục)
thiet-ke-db.md#3. Bất biến (sai là hỏng sản phẩm)

## Test case
Kịch bản test tay: tests/kb/US34-phia-sale-dat-phong-chu.md (KB1, KB2).

## Task
- [x] US34-TA1 Thiết kế · Design: không vẽ thêm, dựng theo khung S3-10 (YC5-H11 Claude tự chốt, QD25)
- [x] US34-TA2 Code · Claude Code (opus, CL14.6a): viết trước test database cho YC5.9-NT1, YC5.9-NT2, kể cả test vi phạm quyền ở mục "Ai được làm gì". Task sau không sửa file test này (CL14.5)
- [x] US34-TA3 Code · Claude Code (opus, CL14.6a): migration, hàm fn_*, policy cho tới khi test database xanh; thêm phép thử làm hỏng vào scripts/thu-lam-hong.sh nếu đổi quyền, tiền, chặn trùng
- [x] US34-TA4 Code · Claude Code (sonnet, CL14.6a): màn chưa có hình theo canvas
- [ ] US34-TA5 Test tay · Đức: chạy tests/kb/US34-phia-sale-dat-phong-chu.md, chế độ nhanh rồi đủ. Rủi ro cao: chạy trên cả iPhone và Android, thử vi phạm quyền bằng tay (CL6.3).

## Kế hoạch
Database: fn_sale_xem_dat_phong (đọc phần đặt phòng dành cho sale, không tiền cọc, không khách chủ nhập; số chủ nhà và cọc chỉ khi còn kết nối và chủ bật) và fn_sale_sua_gia_ban (chỉ sale của đặt phòng, giá > 0, chặn khi đã hủy). Màn S310DatPhongSale theo khung S3-10, mở từ S7-03.

## Nhật ký
- 2026-11-18 · Claude · tạo item từ YC5.9@1 (QD21)
- 2026-11-20 · Claude (QD25) · database, màn S3-10 phía sale, nối S7-03; tự chốt YC5-H10, H11 · PR mở · ~1,5 giờ
- 2026-11-20 · Claude (QD25) · Gộp PR #72, CI xanh 4/4; chờ test; migration 20261120120000 đã lên staging.

## Bằng chứng
- `CHI_FILE_CO_MA=1 scripts/test-db.sh YC5.9`: lần đầu đỏ 1 test (fn_chi_tiet_dat_phong trả bảng, sửa cách gọi trong test), cuối 28 qua, 0 hỏng.
- `scripts/thu-lam-hong.sh YC5.9`: 9/9 phép thử đạt.
- `npx vitest run src/man/S310DatPhongSale.test.tsx src/man/S703DanhSach.test.tsx src/man/S7ThongKe.test.tsx`: 30 qua.
- `npm run typecheck`, `python3 scripts/kiem.py --diff origin/main`: sạch. e2e sale-xem-dat-phong.spec.ts chạy ở CI.
