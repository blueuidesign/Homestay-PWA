---
id: US21
tieu_de: "Giá theo tháng của một căn"
loai: US
trang_thai: dang-lam
thuc_hien: [YC4.2@2]
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
Là chủ nhà, tôi làm được việc "Giá theo tháng của một căn" đúng như YC4.2 mô tả.

## Làm tiêu chí nào
YC4.2-NT1 đến NT8

## Quy tắc, hành vi dùng
QT4.1, QT5.3

## Màn hình
CN6, CN6-00, CN6-04, CN6-09

## Quyền
PQ5, PQ6, PQ21 và các test vi phạm ở mục "Ai được làm gì" của YC4-gia.md thuộc mục này. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
Điền khi lập kế hoạch, theo cấu trúc thư mục EN1 ghi ở docs/dev/chay-va-test.md. Database chỉ thêm migration mới ở supabase/migrations/.

## Ngoài phạm vi
- YC4-H5 đã trả lời (YC4 r2): ở lại tab Giá. QT5-H1 đã trả lời (glossary r2): cách làm tròn tiền rút gọn.
- Phần đầu YC4-gia.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC4.2 QT4.1 QT5.3 PQ5 PQ6 PQ21 CN6 CN6-00 CN6-04 CN6-09
YC4-gia.md#Quy tắc của nhóm
YC4-gia.md#Ai được làm gì
YC4-gia.md#Dữ liệu
YC4-gia.md#Trạng thái màn (mọi mục)
thiet-ke-db.md#3. Bất biến (sai là hỏng sản phẩm)

## Test case
Kịch bản test tay: tests/kb/US21-gia-theo-thang-cua-mot.md (KB1 đến KB4).

## Task
- [ ] US21-TA1 Code · Claude Code (opus, CL14.6a): viết trước test database cho YC4.2-NT1, YC4.2-NT4, YC4.2-NT6, YC4.2-NT7, YC4.2-NT8, kể cả test vi phạm quyền ở mục "Ai được làm gì". Task sau không sửa file test này (CL14.5)
- [ ] US21-TA2 Code · Claude Code (opus, CL14.6a): migration, hàm fn_*, policy cho tới khi test database xanh; thêm phép thử làm hỏng vào scripts/thu-lam-hong.sh nếu đổi quyền, tiền, chặn trùng
- [ ] US21-TA3 Code · Claude Code (sonnet, CL14.6a): màn CN6, CN6-00, CN6-04, CN6-09 theo canvas, test unit, e2e cho YC4.2-NT1 đến NT5
- [ ] US21-TA4 Test tay · Đức: chạy tests/kb/US21-gia-theo-thang-cua-mot.md, chế độ nhanh rồi đủ. Rủi ro cao: chạy trên cả iPhone và Android, thử vi phạm quyền bằng tay (CL6.3).

## Kế hoạch
1. TA1: viết tests/db/36_us21_gia_thang.sql (NT1, NT4, NT6, NT7, NT8, luật tháng, giá tối đa, quyền), "hôm nay" đóng băng 07/10/2026 theo DLM; chạy thấy đỏ.
2. TA2: migration 20261119160000_us21_gia_thang.sql: fn_dat_gia_thang, fn_lich_gia_thang (QT5.3); phép thử làm hỏng; sinh lại bang-va-cot.md.
3. TA3: src/lib/tien.ts vietTienGon, khoảng giá; src/lib/gia.ts (khoảng giá tháng, chữ tháng đã chọn, tên ô giá, kiểm giá); src/lib/dichVuGia.ts; dieuHuong /can/<id>/gia; màn CN6GiaCan (CN6, CN6-00, CN6-04, CN6-09) nối vào ManChu; unit NT1 đến NT5; e2e luồng chính.
4. Chạy test-db, thu-lam-hong, vitest, typecheck, build, kiem.py, e2e; commit, PR nháp.

## Nhật ký
- 2026-11-18 · Claude · tạo item từ YC4.2@1 (QD21)
- 2026-11-19 · Claude · trả lời YC4-H5, QT5-H1 (QD25), viết tests/kb, sang dang-lam

## Bằng chứng
