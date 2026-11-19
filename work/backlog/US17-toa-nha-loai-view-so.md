---
id: US17
tieu_de: "Tòa nhà, loại view, số giường, mô tả"
loai: US
trang_thai: cho-test
thuc_hien: [YC3.4@3]
truoc: [EN1, EN2, EN4, US2]
lien_quan: []
thay_cho: []
nguon: QD21
nguoi: tung
rui_ro: thap
nghiem_thu: khong
uoc_luong:
thuc_te:
can_duyet: []
based_on:
pr: [25]
ngay_tao: 2026-11-18
---
## Mục tiêu
Là chủ nhà, tôi làm được việc "Tòa nhà, loại view, số giường, mô tả" đúng như YC3.4 mô tả.

## Làm tiêu chí nào
YC3.4-NT1 đến NT4

## Quy tắc, hành vi dùng
QT5.5, QT5.7, QT6.3

## Màn hình
CN5-A1 (phần mở rộng), CN5-A1b

## Quyền
PQ1, PQ3, PQ13 và các test vi phạm ở mục "Ai được làm gì" của YC3-can.md thuộc mục này. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
Điền khi lập kế hoạch, theo cấu trúc thư mục EN1 ghi ở docs/dev/chay-va-test.md. Database chỉ thêm migration mới ở supabase/migrations/.

## Ngoài phạm vi
- YC3-H5, YC3-H7 đã trả lời (YC3 r3, Claude tự quyết QD25).
- Phần đầu YC3-can.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC3.4 QT5.5 QT5.7 QT6.3 PQ1 PQ3 PQ13 CN5-A1b
YC3-can.md#Quy tắc của nhóm
YC3-can.md#Ai được làm gì
YC3-can.md#Dữ liệu
YC3-can.md#Trạng thái màn (mọi mục)

## Test case
Kịch bản test tay: tests/kb/US17-toa-nha-loai-view-so.md (KB1 đến KB3).

## Task
- [x] US17-TA1 Code: migration fn_them_toa, khu_vuc, test database YC3.4-NT3, NT4 (PR nhánh US17-toa-nha)
- [x] US17-TA2 Code · Claude Code (sonnet, CL14.6a): màn CN5-A1 (phần mở rộng), CN5-A1b theo canvas, test unit, e2e cho YC3.4-NT1, YC3.4-NT2
- [ ] US17-TA3 Test tay · Đức: chạy tests/kb/US17-toa-nha-loai-view-so.md, chế độ nhanh rồi đủ.

## Kế hoạch
- TA1: tests/db/35 trước (NT3, NT4, luật tên, anon, ghi thẳng), thấy đỏ; migration 20261119150000 thêm khu_vuc và fn_them_toa; 5 phép thử làm hỏng; seed khu vực Green Bay; sinh lại bang-va-cot.md.
- TA2: src/lib/toaNha.ts (lọc không dấu, xếp chip), MucThemCan (CN5-A1 phần mở rộng), CN5A1bChonToa; dichVuCan.layToa, themToa; nháp giữ phần thêm; unit NT1, NT2; e2e toa-nha.spec.ts.
- Chặn: src/man/ManChu.tsx ngoài "Được sửa" mà cần 2 dòng truyền layToa, themToa vào CN5A1ThemCan. Chưa nối thì app thật báo "Chưa tải được" ở hàng chip tòa, e2e toa-nha đỏ.

## Nhật ký
- 2026-11-18 · Claude · tạo item từ YC3.4@1 (QD21)
- 2026-11-19 · Claude · trả lời YC3-H5, YC3-H7 (QD25), viết tests/kb, soạn gói việc, sang dang-lam
- 2026-11-19 · Claude (agent code) · TA1 xong, TA2 code xong; chờ nối ManChu.tsx (ngoài phạm vi) · PR nháp US17-toa-nha · khoảng 1,5 giờ
- 2026-11-19 · Claude · nối ManChu (gói việc thiếu file này), gộp PR #25 theo QD25 (CI xanh), sang cho-test

## Bằng chứng
- `scripts/test-db.sh` (PG16): lần đầu 5 hỏng, file 35 dừng vì chưa có cột khu_vuc; sau migration 532 qua, 0 hỏng (1 vòng).
- `scripts/thu-lam-hong.sh YC3.4`: 5/5 đạt (2 dòng sửa khóa vì xargs bỏ dấu ngoặc kép).
- `npx vitest run`: 181 qua (28 file), xanh ngay lần đầu. `npm run typecheck`, `npm run build`: qua. `kiem.py --diff origin/main`: không có lỗi.
- `E2E_SUPABASE=1 CI=1 npx playwright test tests/e2e/supabase --trace off`: không nối ManChu thì toa-nha 2 đỏ; vá tạm 2 dòng ManChu (không commit) thì 22/22 qua.
