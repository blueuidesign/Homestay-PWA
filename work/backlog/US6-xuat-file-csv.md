---
id: US6
tieu_de: "Xuất file CSV"
loai: US
trang_thai: cho-test
thuc_hien: [YC1.6@1]
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
pr: 86
ngay_tao: 2026-11-18
---
## Mục tiêu
Là người dùng (chủ nhà hoặc sale), tôi làm được việc "Xuất file CSV" đúng như YC1.6 mô tả.

## Làm tiêu chí nào
YC1.6-NT1 đến NT6

## Quy tắc, hành vi dùng
HV4, HV5, QT6.5

## Màn hình
P8, P8-00

## Quyền
PQ1, PQ2, PQ6, PQ9, PQ11, PQ20, PQ23 và các test vi phạm ở mục "Ai được làm gì" của YC1-tai-khoan.md thuộc mục này. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
supabase/migrations/20261121000000_us6_xuat_csv.sql, tests/db/90_us6_xuat_csv.sql, src/lib/xuatCsv.ts, src/lib/dichVuXuatCsv.ts, src/chung/chiaSe.ts (guiFile), src/man/P8XuatCsv.tsx, nối ở ManChu, dieuHuong, dichVuCan; tests/e2e/supabase/xuat-csv.spec.ts.

## Ngoài phạm vi
- YC1-H2, YC1-H3, YC1-H4, YC1-H5, YC1-H9: Claude tự chốt 21/11 (QD25), chờ Tùng duyệt lại.
- Phần đầu YC1-tai-khoan.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC1.6 HV4 HV5 QT6.5 PQ1 PQ2 PQ6 PQ9 PQ11 PQ20 PQ23 DLM.8 P8 P8-00
YC1-tai-khoan.md#Quy tắc của nhóm
YC1-tai-khoan.md#Ai được làm gì
YC1-tai-khoan.md#Dữ liệu
YC1-tai-khoan.md#Trạng thái màn (mọi mục)
thiet-ke-db.md#3. Bất biến (sai là hỏng sản phẩm)

## Test case
Kịch bản test tay: tests/kb/US6-xuat-file-csv.md (KB1 đến KB5).

## Task
- [x] US6-TA1 Code · Claude Code (opus, CL14.6a): viết trước test database cho YC1.6-NT1, YC1.6-NT4, YC1.6-NT5, kể cả test vi phạm quyền ở mục "Ai được làm gì". Task sau không sửa file test này (CL14.5)
- [x] US6-TA2 Code · Claude Code (opus, CL14.6a): migration, hàm fn_*, policy cho tới khi test database xanh; thêm phép thử làm hỏng vào scripts/thu-lam-hong.sh nếu đổi quyền, tiền, chặn trùng
- [x] US6-TA3 Code · Claude Code (sonnet, CL14.6a): màn P8, P8-00 theo canvas, test unit, e2e cho YC1.6-NT1, YC1.6-NT2, YC1.6-NT3, YC1.6-NT6
- [ ] US6-TA4 Test tay · Đức: chạy tests/kb/US6-xuat-file-csv.md, chế độ nhanh rồi đủ. Rủi ro cao: chạy trên cả iPhone và Android, thử vi phạm quyền bằng tay (CL6.3).

## Kế hoạch
Tự chốt 5 câu mở (GD35). Database: fn_xuat_csv lọc theo ngày nhận, bỏ đã hủy, chỉ căn có lịch của chủ nhà đang gọi; fn_dem_xuat_csv đếm trên chính fn_xuat_csv. App dựng file (BOM, CRLF), chia sẻ file hay tải về.

## Nhật ký
- 2026-11-21 · Claude (tự chạy, QD25) · gộp PR #86 khi CI xanh, chuyển chờ test
- 2026-11-21 · Claude (tự chạy, QD25) · tự chốt YC1-H2, H3, H4, H5, H9 (GD35); test database trước, fn_xuat_csv và fn_dem_xuat_csv, màn P8, P8-00 · khoảng 40 phút
- 2026-11-18 · Claude · tạo item từ YC1.6@1 (QD21)

## Bằng chứng
- `CHI_FILE_CO_MA=1 scripts/test-db.sh YC1.6`: lần đầu 23 hỏng (chưa có hàm), sau migration 28 qua, 0 hỏng; lọc YC1-H 7 qua, PQ20 7 qua, QT6. 30 qua. `scripts/thu-lam-hong.sh YC1.6`: 3 đạt. `npx vitest run` xuatCsv, P8XuatCsv, dieuHuong: 29 qua. `npm run typecheck`: qua. e2e xuat-csv.spec.ts để CI chạy.
