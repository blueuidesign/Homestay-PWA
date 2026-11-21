---
id: US65
tieu_de: "Đăng nhập trang quản trị và quản trị viên"
loai: US
trang_thai: dang-lam
thuc_hien: [YC13.1@2]
truoc: [EN2, US2]
lien_quan: []
thay_cho: []
nguon: YC13 r2 (QD25, tự chạy)
nguoi: tung
rui_ro: cao
nghiem_thu: khong
uoc_luong:
thuc_te:
can_duyet: []
based_on:
pr:
ngay_tao: 2026-11-21
---
## Mục tiêu
Là quản trị viên Home247, tôi làm được việc "Đăng nhập trang quản trị và quản trị viên" đúng như YC13.1 mô tả.

## Vì sao sửa
Sau khi mọi chức năng app đã code (21/11/2026), YC13 là phần duy nhất của bản 1 chưa có item. Không có trang quản trị thì "Chọn nhanh ngày lễ" (YC4.3) trống và tóm tắt lỗi hằng sáng (YC15.3) không có người nhận.

## Màn phải làm
| Màn | Loại | Đổi gì | Theo |
|---|---|---|---|
| Q1, Q1-01, Q1-02, Q2 | mới, Claude dựng (tự chốt, chờ Tùng duyệt lại) | Chưa có trên canvas | YC13.1 |

## Làm tiêu chí nào
YC13.1-NT*

## Quy tắc, hành vi dùng
HV1, HV2, HV4

## Màn hình
Q1, Q1-01, Q1-02, Q2

## Quyền
PQ21 và quyền vai ADMIN (KT-DB.3.12). Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
supabase/migrations/20261121030000_us65_quan_tri.sql, tests/db/94_us65_quan_tri.sql, src/man/Q2QuanTriVien.tsx, src/man/QuanTri.tsx (khung trang và tab), src/man/QuanTri.css, src/man/QuanTri.test.tsx, src/man/TrangQuanTriApp.tsx, src/lib/supabase.ts (dichVuQuanTriMacDinh), tests/e2e/supabase/hoTro.ts (vaoQuanTri, datQuanTriGoc), scripts/thu-lam-hong.txt, src/lib/dichVuQuanTri.ts, nối route /quan-tri ở src/App.tsx, tests/e2e/supabase/quan-tri.spec.ts, dòng mã Q ở docs/design/README.md

## Ngoài phạm vi
- Thiết kế trên artifact canvas: chưa vẽ, chỉ có ảnh chụp màn đã code (ghi ở work/cho-tung.md).

## Đọc
YC13.1 HV1 HV2 HV4 PQ21
YC13-quan-tri.md#Quy tắc của nhóm
YC13-quan-tri.md#Ai được làm gì
YC13-quan-tri.md#Dữ liệu
YC13-quan-tri.md#Trạng thái màn (mọi mục)
thiet-ke-db.md#3. Bất biến (sai là hỏng sản phẩm)

## Test case
Kịch bản test tay: tests/kb/US65-dang-nhap-quan-tri.md.

## Task
- [x] US65-TA1 Code · Claude Code (opus): viết trước test database cho các NT lớp database của YC13.1, kể cả test vi phạm quyền. Task sau không sửa file test này (CL14.5)
- [x] US65-TA2 Code · Claude Code (opus): migration, hàm fn_* cho tới khi test database xanh
- [x] US65-TA3 Code · Claude Code: màn Q1, Q1-01, Q1-02, Q2, test unit, e2e
- [ ] US65-TA4 Test tay · Đức: chạy tests/kb/US65-dang-nhap-quan-tri.md

## Kế hoạch
Bảng admins có từ EN2. Hàm fn_la_quan_tri() so email trong auth.users của người gọi với danh sách. Mã gửi như đăng nhập app; người ngoài danh sách vào Q1-02 (YC13.1 bản 2, theo PQ Luật chung 4). fn_quan_tri_vao ghi nguoi_id, fn_quan_tri_them, fn_quan_tri_go chỉ la_goc gọi được; không gỡ chính mình.

## Nhật ký
- 2026-11-21 · Claude (tự chạy, QD25) · test database trước (đỏ vì chưa có hàm), migration fn_quan_tri_*, trang /quan-tri Q1, Q1-01, Q1-02, Q2 · khoảng 40 phút
- 2026-11-21 · Claude (tự chạy, QD25) · tạo item từ YC13.1@2

## Bằng chứng
- `CHI_FILE_CO_MA=1 scripts/test-db.sh YC13.1`: lần đầu file lỗi (chưa có hàm), sau migration 26 qua, 0 hỏng. `KT-DB.3.12`: 11 qua. `scripts/thu-lam-hong.sh YC13.1`: 2 đạt. vitest QuanTri.test.tsx: 5 qua. typecheck qua. e2e quan-tri.spec.ts để CI chạy.
