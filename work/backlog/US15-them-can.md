---
id: US15
tieu_de: "Thêm căn"
loai: US
trang_thai: dang-lam
thuc_hien: [YC3.2@2]
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
pr: 22
ngay_tao: 2026-11-18
---
## Mục tiêu
Là chủ nhà, tôi làm được việc "Thêm căn" đúng như YC3.2 mô tả.

## Làm tiêu chí nào
YC3.2-NT1 đến NT9; HV3-NT2 (hành vi chung gắn màn này, QD27)

## Quy tắc, hành vi dùng
QT5.5, QT5.7, QT6.3

## Màn hình
CN5-A1, CN5-A3, CN5-A4, CN5-A4b

## Quyền
PQ1, PQ3, PQ13 và các test vi phạm ở mục "Ai được làm gì" của YC3-can.md thuộc mục này. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
Điền khi lập kế hoạch, theo cấu trúc thư mục EN1 ghi ở docs/dev/chay-va-test.md. Database chỉ thêm migration mới ở supabase/migrations/.

## Ngoài phạm vi
- Ảnh căn (tải, gắn, sắp xếp): US16. Mục ẢNH trên form chỉ hiện chỗ, chưa tải được.
- Tòa nhà, loại view, số giường, mô tả trên màn: US17. Hàm tạo căn vẫn kiểm các ô này (YC3.2-NT8).
- Phần đầu YC3-can.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC3.2 QT5.5 QT5.7 QT6.3 PQ1 PQ3 PQ13 CN5-A1 CN5-A3 CN5-A4 CN5-A4b
YC3-can.md#Quy tắc của nhóm
YC3-can.md#Ai được làm gì
YC3-can.md#Dữ liệu
YC3-can.md#Trạng thái màn (mọi mục)
thiet-ke-db.md#3. Bất biến (sai là hỏng sản phẩm)

## Test case
Kịch bản test tay: tests/kb/US15-them-can.md (KB1 đến KB5).

## Task
- [x] US15-TA1 Code · Claude Code (opus, CL14.6a): viết trước test database cho YC3.2-NT2, YC3.2-NT4, YC3.2-NT5, YC3.2-NT7, YC3.2-NT8, YC3.2-NT9, kể cả test vi phạm quyền ở mục "Ai được làm gì". Task sau không sửa file test này (CL14.5)
- [x] US15-TA2 Code · Claude Code (opus, CL14.6a): migration, hàm fn_*, policy cho tới khi test database xanh; thêm phép thử làm hỏng vào scripts/thu-lam-hong.sh nếu đổi quyền, tiền, chặn trùng
- [x] US15-TA3 Code · Claude Code (sonnet, CL14.6a): màn CN5-A1, CN5-A3, CN5-A4, CN5-A4b theo canvas, test unit, e2e cho YC3.2-NT1 đến NT4
- [ ] US15-TA4 Test tay · Đức: chạy tests/kb/US15-them-can.md, chế độ nhanh rồi đủ. Rủi ro cao: chạy trên cả iPhone và Android, thử vi phạm quyền bằng tay (CL6.3).

## Kế hoạch
- TA1: tests/db/33_us15_them_can.sql (NT2, NT4, NT5, NT7, NT8, NT9, trigger bước 18, vi phạm quyền), chạy thấy đỏ.
- TA2: migration 20261119130000_us15_them_can.sql: fn_tao_can (luật kiểm P0001, client_id QT5.6), trigger thông báo chu_them_can; 4 phép thử làm hỏng.
- TA3: CN5A1ThemCan.tsx (CN5-A1, CN5-A3), kiemCan.ts, taoCan trong DichVuCan, nháp 7 ngày (HV3-H1), toast và "Thêm căn khác" ở CN5 (CN5-A4, CN5-A4b); unit, e2e NT6, NT4, HV3-NT2.

## Nhật ký
- 2026-11-18 · Claude · tạo item từ YC3.2@1 (QD21)
- 2026-11-19 · Claude · nhận HV3-NT2 từ EN4 (QD27)
- 2026-11-19 · Claude · code TA1 đến TA3 trên nhánh US15-them-can, mở PR nháp · tiêu đề YC "Thêm căn" khác canvas "Thêm căn hộ": theo YC

## Bằng chứng
- 2026-11-19 · Claude · trả lời YC3-H6 theo QT5.6 (QD25), YC3 r2 thêm YC3.2-NT9, viết tests/kb/US15-them-can.md, sang dang-lam
- 2026-11-19 · Claude · DB: test-db.sh lần đầu 45 đỏ (chưa có migration), 1 vòng migration còn 1 đỏ do kiểm tên tham số sai trong chính test (khớp p_so_giuong), sửa kiểm đó, cuối 439 qua 0 hỏng. thu-lam-hong.sh YC3.2: 4/4 đạt (2 vòng sửa khóa lọc)
- 2026-11-19 · Claude · unit: npx vitest run 130 qua (21 mới); typecheck 1 vòng sửa kiểu vi.fn trong test; build qua; e2e-supabase 16 qua (3 mới: NT6, NT4, HV3-NT2); kiem.py --diff origin/main không lỗi
