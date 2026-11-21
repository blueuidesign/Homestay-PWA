---
id: US66
tieu_de: "Dải ngày lễ"
loai: US
trang_thai: dang-lam
thuc_hien: [YC13.2@1]
truoc: [US65]
lien_quan: []
thay_cho: []
nguon: YC13 r2 (QD25, tự chạy)
nguoi: tung
rui_ro: tb
nghiem_thu: khong
uoc_luong:
thuc_te:
can_duyet: []
based_on:
pr:
ngay_tao: 2026-11-21
---
## Mục tiêu
Là quản trị viên Home247, tôi làm được việc "Dải ngày lễ" đúng như YC13.2 mô tả.

## Vì sao sửa
Sau khi mọi chức năng app đã code (21/11/2026), YC13 là phần duy nhất của bản 1 chưa có item. Không có trang quản trị thì "Chọn nhanh ngày lễ" (YC4.3) trống và tóm tắt lỗi hằng sáng (YC15.3) không có người nhận.

## Màn phải làm
| Màn | Loại | Đổi gì | Theo |
|---|---|---|---|
| Q3, Q3-01 | mới, Claude dựng (tự chốt, chờ Tùng duyệt lại) | Chưa có trên canvas | YC13.2 |

## Làm tiêu chí nào
YC13.2-NT*

## Quy tắc, hành vi dùng
HV1, HV2, HV4

## Màn hình
Q3, Q3-01

## Quyền
PQ21. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
supabase/migrations/20261121040000_us66_dai_ngay_le.sql, tests/db/95_us66_dai_ngay_le.sql, src/man/Q3NgayLe.tsx, src/man/Q3NgayLe.test.tsx, src/man/QuanTri.tsx (thêm mục), src/man/QuanTri.css, src/man/QuanTri.test.tsx (thêm hàm giả, mở đúng tab), src/lib/dichVuQuanTri.ts, tests/e2e/supabase/ngay-le-quan-tri.spec.ts, scripts/thu-lam-hong.txt

## Ngoài phạm vi
- Thiết kế trên artifact canvas: chưa vẽ, chỉ có ảnh chụp màn đã code (ghi ở work/cho-tung.md).

## Đọc
YC13.2 HV1 HV2 HV4 PQ21
YC13-quan-tri.md#Quy tắc của nhóm
YC13-quan-tri.md#Ai được làm gì
YC13-quan-tri.md#Dữ liệu
YC13-quan-tri.md#Trạng thái màn (mọi mục)
thiet-ke-db.md#3. Bất biến (sai là hỏng sản phẩm)

## Test case
Kịch bản test tay: tests/kb/US66-dai-ngay-le.md.

## Task
- [x] US66-TA1 Code · Claude Code (opus): viết trước test database cho các NT lớp database của YC13.2, kể cả test vi phạm quyền. Task sau không sửa file test này (CL14.5)
- [x] US66-TA2 Code · Claude Code (opus): migration, hàm fn_* cho tới khi test database xanh
- [x] US66-TA3 Code · Claude Code: màn Q3, Q3-01, test unit, e2e
- [ ] US66-TA4 Test tay · Đức: chạy tests/kb/US66-dai-ngay-le.md

## Kế hoạch
fn_quan_tri_luu_ngay_le (thêm hoặc sửa), fn_quan_tri_xoa_ngay_le; ràng buộc tối đa 10 ngày và không chồng ngày cùng năm ở database. Giá dịp của chủ nhà không đụng tới.

## Nhật ký
- 2026-11-21 · Claude (tự chạy, QD25) · test database trước, ràng buộc 10 ngày và không chồng ngày, fn_quan_tri_luu_ngay_le, fn_quan_tri_xoa_ngay_le, màn Q3, Q3-01 · khoảng 25 phút
- 2026-11-21 · Claude (tự chạy, QD25) · tạo item từ YC13.2@1

## Bằng chứng
- `CHI_FILE_CO_MA=1 scripts/test-db.sh YC13.2`: lần đầu file lỗi (chưa có hàm), sau migration 17 qua, 0 hỏng. YC4.3: 39 qua. thu-lam-hong YC13.2: 1 đạt. vitest QuanTri, Q3NgayLe: 9 qua. typecheck qua. e2e để CI.
