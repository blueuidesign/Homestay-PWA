---
id: US18
tieu_de: "Sửa căn"
loai: US
trang_thai: cho-test
thuc_hien: [YC3.5@1]
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
pr: [41]
ngay_tao: 2026-11-18
---
## Mục tiêu
Là chủ nhà, tôi làm được việc "Sửa căn" đúng như YC3.5 mô tả.

## Làm tiêu chí nào
YC3.5-NT1 đến NT5

## Quy tắc, hành vi dùng
QT5.5, QT5.7, QT6.3

## Màn hình
CN5-02

## Quyền
PQ1, PQ3, PQ13 và các test vi phạm ở mục "Ai được làm gì" của YC3-can.md thuộc mục này. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
- supabase/migrations/20261119290000_us18_sua_can.sql, tests/db/50_us18_sua_can.sql, scripts/thu-lam-hong.txt, supabase/bang-va-cot.md
- src/man/CN502SuaCan.tsx (+ .test.tsx), src/man/CN5A1ThemCan.tsx, src/man/MucAnhCan.tsx, src/man/ManChu.tsx, src/man/CN5DanhSachCan.tsx
- src/lib/dichVuCan.ts, src/lib/can.ts, src/lib/kiemCan.ts, src/lib/anh.ts (+ test)
- tests/e2e/supabase/sua-can.spec.ts

## Ngoài phạm vi
- YC3-H4 đã Claude tự chốt (QD25), ghi ở YC3.5 r4.
- Phần đầu YC3-can.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC3.5 QT5.5 QT5.7 QT6.3 PQ1 PQ3 PQ13 CN5-02
YC3-can.md#Quy tắc của nhóm
YC3-can.md#Ai được làm gì
YC3-can.md#Dữ liệu
YC3-can.md#Trạng thái màn (mọi mục)
thiet-ke-db.md#3. Bất biến (sai là hỏng sản phẩm)

## Test case
Kịch bản test tay: tests/kb/US18-sua-can.md.

## Task
- [x] US18-TA1 Code · Claude Code (opus, CL14.6a): viết trước test database cho YC3.5-NT2 đến NT5, kể cả test vi phạm quyền ở mục "Ai được làm gì". Task sau không sửa file test này (CL14.5) · PR #41
- [x] US18-TA2 Code · Claude Code (opus, CL14.6a): migration, hàm fn_*, policy cho tới khi test database xanh; thêm phép thử làm hỏng vào scripts/thu-lam-hong.sh nếu đổi quyền, tiền, chặn trùng · PR #41
- [x] US18-TA3 Code · Claude Code (sonnet, CL14.6a): màn CN5-02 theo canvas, test unit, e2e cho YC3.5-NT1, YC3.5-NT2, YC3.5-NT4 · PR #41
- [ ] US18-TA4 Test tay · Đức: chạy tests/kb/US18-sua-can.md, chế độ nhanh rồi đủ. Rủi ro cao: chạy trên cả iPhone và Android, thử vi phạm quyền bằng tay (CL6.3).

## Kế hoạch
1. TA1: tests/db/50_us18_sua_can.sql cho NT2 đến NT5 và test vi phạm (sale được chia sẻ, chủ khác, người chưa đăng nhập, căn đã ẩn), viết trước, chạy thấy đỏ.
2. TA2: migration thêm fn_sua_can(p_can_id, p_sua jsonb): khóa căn, chỉ người giữ và căn chưa ẩn (42501 "Không tìm thấy căn"), chỉ ghi khóa có trong p_sua (có khóa mà null là bỏ giá trị), luật kiểm như fn_tao_can, mã trùng căn chưa ẩn khác của mình thì P0001, "anh" là danh sách mới đầy đủ qua gan_anh_can. Thêm phép thử làm hỏng vào thu-lam-hong.txt, sinh lại bang-va-cot.md.
3. TA3: dichVuCan thêm layCan (đọc can, anh_can qua RLS) và suaCan; MucAnhCan nhận ảnh có sẵn và chế độ "Đổi thứ tự"; màn CN502SuaCan dùng lại các mục của form thêm, hỏi "Bỏ thay đổi chưa lưu?"; ManChu thay khung tạm. Test unit NT1, NT2, NT4; e2e NT1, NT2, NT4.

## Nhật ký
- 2026-11-18 · Claude · tạo item từ YC3.5@1 (QD21)
- 2026-11-19 · Claude · tự chốt YC3-H4 (QD25, YC3 r4); viết kịch bản test tay; giao agent code
- 2026-11-19 · Claude (agent code) · làm TA1 đến TA3 trên nhánh US18-sua-can, chưa mở PR · tự quyết: fn_sua_can nhận p_sua jsonb để phân biệt "không gửi" với "bỏ giá trị"; lỗi quyền, căn đã ẩn trả 42501 và màn hiện câu HV5; tiêu đề lúc đang đọc căn giữ "Phòng 1509" như trước (test cũ AppChu YC3.1-NT2); chuyển tab Giá khi đã sửa cũng hỏi "Bỏ thay đổi chưa lưu?"; file ảnh bị bỏ khỏi căn chưa xóa khỏi kho (EN10)
- 2026-11-19 · Claude · gộp main (US13) vào nhánh, chạy lại db 1132, unit 477, e2e 42 đạt; gộp PR #41 theo QD25 (CI xanh), chuyển chờ test

## Bằng chứng
- TA1 `PGHOST=localhost PGUSER=postgres PGPASSWORD=postgres scripts/test-db.sh YC3.5`: trước migration 52 hỏng, 18 qua (tests/db/50_us18_sua_can.sql, 70 test).
- TA2 cùng lệnh, cả bộ: lần đầu sau migration xanh, 1109 qua, 0 hỏng, 0 sửa vòng nào. `scripts/thu-lam-hong.sh YC3.5`: 6 đạt, 0 không đạt. `scripts/bang-cot.sh` sinh lại bang-va-cot.md. `supabase db reset` qua.
- TA3 `npx vitest run`: test unit CN502SuaCan.test.tsx (14 test) viết trước code, lần chạy đầu 14 qua; cả bộ lần đầu đỏ 1 test cũ (AppChu YC3.1-NT2 chờ tiêu đề "Phòng 1509"), sửa màn 1 vòng (tiêu đề tạm khi đang đọc căn), cuối 444 qua. Không sửa test cũ.
- `npm run typecheck` qua, `npm run build` qua, `python3 scripts/kiem.py --diff origin/main` không có lỗi.
- e2e `E2E_SUPABASE=1 CI=1 npx playwright test tests/e2e/supabase --trace off`: 41 qua (có 3 test mới ở sua-can.spec.ts cho NT1, NT2, NT4, bước 40, 41); `CI=1 npx playwright test`: 3 qua.
