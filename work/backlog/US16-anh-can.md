---
id: US16
tieu_de: "Ảnh căn"
loai: US
trang_thai: cho-test
thuc_hien: [YC3.3@1]
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
pr: [24]
ngay_tao: 2026-11-18
---
## Mục tiêu
Là chủ nhà, tôi làm được việc "Ảnh căn" đúng như YC3.3 mô tả.

## Làm tiêu chí nào
YC3.3-NT1 đến NT6; HV4-NT6 (hành vi chung gắn màn này, QD27)

## Quy tắc, hành vi dùng
QT5.5, QT5.7, QT6.3

## Màn hình
CN5-A1, CN5-A2, CN5-A3, CN5-02

## Quyền
PQ1, PQ3, PQ13 và các test vi phạm ở mục "Ai được làm gì" của YC3-can.md thuộc mục này. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
Điền khi lập kế hoạch, theo cấu trúc thư mục EN1 ghi ở docs/dev/chay-va-test.md. Database chỉ thêm migration mới ở supabase/migrations/.

## Ngoài phạm vi
- Phần đầu YC3-can.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC3.3 QT5.5 QT5.7 QT6.3 PQ1 PQ3 PQ13 CN5-A1 CN5-A2 CN5-A3 CN5-02
YC3-can.md#Quy tắc của nhóm
YC3-can.md#Ai được làm gì
YC3-can.md#Dữ liệu
YC3-can.md#Trạng thái màn (mọi mục)
thiet-ke-db.md#3. Bất biến (sai là hỏng sản phẩm)

## Test case
Kịch bản test tay: tests/kb/US16-anh-can.md (KB1 đến KB4).

## Task
- [x] US16-TA1 Code · Claude Code (opus, CL14.6a): viết trước test database cho YC3.3-NT3, YC3.3-NT5, YC3.3-NT6, kể cả test vi phạm quyền ở mục "Ai được làm gì". Task sau không sửa file test này (CL14.5)
- [x] US16-TA2 Code · Claude Code (opus, CL14.6a): migration, hàm fn_*, policy cho tới khi test database xanh; thêm phép thử làm hỏng vào scripts/thu-lam-hong.sh nếu đổi quyền, tiền, chặn trùng
- [x] US16-TA3 Code · Claude Code (sonnet, CL14.6a): màn CN5-A1, CN5-A2, CN5-A3, CN5-02 theo canvas, test unit, e2e cho YC3.3-NT1, YC3.3-NT2, YC3.3-NT3, YC3.3-NT4, YC3.3-NT6
- [ ] US16-TA4 Test tay · Đức: chạy tests/kb/US16-anh-can.md, chế độ nhanh rồi đủ. Rủi ro cao: chạy trên cả iPhone và Android, thử vi phạm quyền bằng tay (CL6.3).

## Kế hoạch
- TA1: tests/db/34_us16_anh_can.sql (NT3, NT5, NT6 phần database, quyền đọc ảnh của chủ khác, sale, khách) trên giả lập storage thêm vào supabase/gia-lap/00_supabase.sql.
- TA2: migration 20261119140000: bucket anh-can (riêng tư, 15 MB, JPEG/PNG/HEIC), policy tải và đọc trên storage.objects, fn_them_anh_tam, fn_tao_can thêm p_anh, gan_anh_can, fn_don_anh_tam; phép thử làm hỏng YC3.3.
- TA3: src/lib/anh.ts (kiểm, thu ảnh), MucAnhCan.tsx (CN5-A1/A2/A3), nối CN5A1ThemCan, dichVuCan.taiAnh (XHR có tiến độ), e2e anh-can.spec.ts; CN5-02 để US sửa căn.

## Nhật ký
- 2026-11-18 · Claude · tạo item từ YC3.3@1 (QD21)
- 2026-11-19 · Claude · nhận HV4-NT6 từ EN4 (QD27)
- 2026-11-19 · Claude · viết tests/kb/US16-anh-can.md, soạn gói việc, sang dang-lam
- 2026-11-19 · Claude · code TA1 đến TA3, mở PR nháp #24 · bất ngờ: xóa file kho phải qua API kho, fn_don_anh_tam chỉ trả đường dẫn
- 2026-11-19 · Claude · gộp PR #24 theo QD25 (CI xanh sau sửa kiểu body e2e), sang cho-test; xóa file ảnh tạm tách sang EN10

## Bằng chứng
- `scripts/test-db.sh`: lần đầu (chưa migration) 8 hỏng + 1 file lỗi; sau migration xanh ngay; thêm 1 test sau phép thử làm hỏng; cuối: 493 qua, 0 hỏng.
- `scripts/thu-lam-hong.sh`: 2 dòng YC3.3 lần đầu không đạt (lọc sai tên, phép phá chưa đúng), sửa 2 vòng; cuối 72/72 đạt.
- `npx vitest run`: lần đầu 2 đỏ (test viết sai), sửa 2 vòng; cuối 147/147.
- `E2E_SUPABASE=1 CI=1 npx playwright test tests/e2e/supabase` (có storage-api): lần đầu 1 đỏ (getByText không exact), cuối 20/20. `npx playwright test`: 3/3.
- `npm run typecheck`, `npm run build`: qua. `python3 scripts/kiem.py --diff origin/main`: không có lỗi.
