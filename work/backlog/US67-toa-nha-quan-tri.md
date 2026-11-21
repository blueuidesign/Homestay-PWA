---
id: US67
tieu_de: "Tòa nhà ở trang quản trị"
loai: US
trang_thai: dang-lam
thuc_hien: [YC13.3@1]
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
Là quản trị viên Home247, tôi làm được việc "Tòa nhà ở trang quản trị" đúng như YC13.3 mô tả.

## Vì sao sửa
Sau khi mọi chức năng app đã code (21/11/2026), YC13 là phần duy nhất của bản 1 chưa có item. Không có trang quản trị thì "Chọn nhanh ngày lễ" (YC4.3) trống và tóm tắt lỗi hằng sáng (YC15.3) không có người nhận.

## Màn phải làm
| Màn | Loại | Đổi gì | Theo |
|---|---|---|---|
| Q4, Q4-01, Q4-02 | mới, Claude dựng (tự chốt, chờ Tùng duyệt lại) | Chưa có trên canvas | YC13.3 |

## Làm tiêu chí nào
YC13.3-NT*

## Quy tắc, hành vi dùng
HV1, HV2, HV4

## Màn hình
Q4, Q4-01, Q4-02

## Quyền
PQ21, QT6.3. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
supabase/migrations/20261121050000_us67_toa_nha_quan_tri.sql, tests/db/96_us67_toa_nha_quan_tri.sql, src/man/Q4ToaNha.tsx, src/man/Q4ToaNha.test.tsx, src/man/QuanTri.tsx (thêm mục), src/man/QuanTri.css, src/man/QuanTri.test.tsx (thêm hàm giả), src/lib/dichVuQuanTri.ts, scripts/thu-lam-hong.txt. NT của YC13.3 chỉ ở lớp database, unit: không có e2e riêng

## Ngoài phạm vi
- Thiết kế trên artifact canvas: chưa vẽ, chỉ có ảnh chụp màn đã code (ghi ở work/cho-tung.md).

## Đọc
YC13.3 HV1 HV2 HV4 PQ21 QT6.3
YC13-quan-tri.md#Quy tắc của nhóm
YC13-quan-tri.md#Ai được làm gì
YC13-quan-tri.md#Dữ liệu
YC13-quan-tri.md#Trạng thái màn (mọi mục)
thiet-ke-db.md#3. Bất biến (sai là hỏng sản phẩm)

## Test case
Kịch bản test tay: tests/kb/US67-toa-nha-quan-tri.md.

## Task
- [x] US67-TA1 Code · Claude Code (opus): viết trước test database cho các NT lớp database của YC13.3, kể cả test vi phạm quyền. Task sau không sửa file test này (CL14.5)
- [x] US67-TA2 Code · Claude Code (opus): migration, hàm fn_* cho tới khi test database xanh
- [x] US67-TA3 Code · Claude Code: màn Q4, Q4-01, Q4-02, test unit, e2e
- [ ] US67-TA4 Test tay · Đức: chạy tests/kb/US67-toa-nha-quan-tri.md

## Kế hoạch
fn_quan_tri_luu_toa (thêm thì cờ home247_dat_san = true; sửa giữ cờ), fn_quan_tri_gop_toa một giao dịch chuyển căn rồi xóa tòa.

## Nhật ký
- 2026-11-21 · Claude (tự chạy, QD25) · test database trước, fn_quan_tri_luu_toa, fn_quan_tri_gop_toa, màn Q4, Q4-01, Q4-02 · khoảng 25 phút
- 2026-11-21 · Claude (tự chạy, QD25) · tạo item từ YC13.3@1

## Bằng chứng
- `CHI_FILE_CO_MA=1 scripts/test-db.sh YC13.3`: lần đầu file lỗi (chưa có hàm), sau migration 19 qua (sửa một test so thứ tự chữ có dấu trước khi commit). YC3.4: 39 qua. thu-lam-hong YC13.3: 1 đạt. vitest Q4ToaNha, QuanTri, Q3NgayLe: 11 qua. typecheck qua.
