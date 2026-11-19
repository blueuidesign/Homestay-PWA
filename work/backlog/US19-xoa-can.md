---
id: US19
tieu_de: "Xóa căn"
loai: US
trang_thai: cho-test
thuc_hien: [YC3.6@1]
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
pr: [42]
ngay_tao: 2026-11-18
---
## Mục tiêu
Là chủ nhà, tôi làm được việc "Xóa căn" đúng như YC3.6 mô tả.

## Vì sao sửa
Canvas chưa có hình cho phần "Xóa căn" (YC3.6, dòng "Màn:" ghi "chưa có hình"). Không vẽ trước thì task Code phải tự đặt bố cục và chữ, dễ lệch với các màn khác và với YC.

## Màn phải làm
| Màn | Loại | Đổi gì | Theo |
|---|---|---|---|
| <mã mới, Design đặt theo CL13> | thêm | Màn và trạng thái cho các bước của YC3.6, chữ đúng như bảng bước | YC3.6 |

## Làm tiêu chí nào
YC3.6-NT1 đến NT12

## Quy tắc, hành vi dùng
QT5.5, QT5.7, QT6.3

## Màn hình
CN5-02 (nút "Xóa phòng", hộp hỏi lại; chưa vẽ, theo YC3.6 r5)

## Quyền
PQ17 và các test vi phạm ở mục "Ai được làm gì" của YC3-can.md thuộc mục này. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
- supabase/migrations/20261119300000_us19_xoa_can.sql (mới), tests/db/51_us19_xoa_can.sql (mới), scripts/thu-lam-hong.txt, supabase/bang-va-cot.md (sinh lại)
- src/man/CN502SuaCan.tsx, .test.tsx, .css; src/man/ManChu.tsx; src/lib/dichVuCan.ts
- tests/e2e/supabase/xoa-can.spec.ts (mới)

## Ngoài phạm vi
- YC3-H3, YC3-H8 đã Claude tự chốt (QD25), ghi ở YC3.6 r5.
- YC11-H7 (mẫu số công suất) thuộc YC11, không làm ở đây.
- Phần đầu YC3-can.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC3.6 QT5.5 QT5.7 QT6.3 PQ17
YC3-can.md#Quy tắc của nhóm
YC3-can.md#Ai được làm gì
YC3-can.md#Dữ liệu
YC3-can.md#Trạng thái màn (mọi mục)
thiet-ke-db.md#3. Bất biến (sai là hỏng sản phẩm)

## Test case
Kịch bản test tay: tests/kb/US19-xoa-can.md.

## Task
- [ ] US19-TA1 Thiết kế · Design: làm theo CL13 bảng "Màn phải làm". Xong thì Design tự thêm task kiểm cho Claude Code (CL13.3). Theo QD25 code đi trước, dùng nút chữ và hộp hỏi lại có sẵn (như CN3-02 xóa đặt phòng); Design vẽ sau
- [x] US19-TA2 Code · Claude Code (opus, CL14.6a): viết trước test database cho YC3.6-NT2, YC3.6-NT3, YC3.6-NT4, YC3.6-NT6, YC3.6-NT7, YC3.6-NT8, YC3.6-NT9, YC3.6-NT10, YC3.6-NT11, kể cả test vi phạm quyền ở mục "Ai được làm gì". Task sau không sửa file test này (CL14.5) · PR #42
- [x] US19-TA3 Code · Claude Code (opus, CL14.6a): migration, hàm fn_*, policy cho tới khi test database xanh; thêm phép thử làm hỏng vào scripts/thu-lam-hong.sh nếu đổi quyền, tiền, chặn trùng · PR #42
- [x] US19-TA4 Code · Claude Code (sonnet, CL14.6a): nút "Xóa phòng" và hộp hỏi lại ở CN5-02 theo YC3.6 r5, test unit, e2e cho YC3.6-NT1, YC3.6-NT5, YC3.6-NT9, YC3.6-NT12 · PR #42
- [ ] US19-TA5 Test tay · Đức: chạy tests/kb/US19-xoa-can.md, chế độ nhanh rồi đủ. Rủi ro cao: chạy trên cả iPhone và Android, thử vi phạm quyền bằng tay (CL6.3).

## Kế hoạch
- TA2: test database 51 viết trước, hai phiên dblink cho NT11 (ẩn trước, ghi trước); "hôm nay" đổi bằng local_today giả trong giao dịch.
- TA3: fn_xoa_can khóa dòng căn (for update), kiểm booking chưa hủy trả sau hôm nay và yêu cầu chờ chưa hết hạn, ghi an_luc. fn_tao_booking, fn_sua_booking chỉ kiểm căn chưa ẩn bằng exists không khóa (lọt khi chạy cùng lúc), nên thêm trigger trước khi ghi booking (đặt phòng chưa hủy trả sau hôm nay) và yeu_cau_dat_phong (đang chờ): khóa căn "for no key update" rồi kiểm chưa ẩn.
- TA4: nút chữ đỏ "Xóa phòng" trong thanh dưới, dưới "Lưu thay đổi"; hộp hỏi lại như CN3-02; toast do CN5-02 hiện; 42501 báo "Có lỗi xảy ra. Bạn thử lại sau ít phút."; xóa xong xóa bộ nhớ lịch tháng.

## Nhật ký
- 2026-11-18 · Claude · tạo item từ YC3.6@1 (QD21)
- 2026-11-19 · Claude · tự chốt YC3-H3, H8 (QD25, YC3 r5, thêm NT12); viết kịch bản test tay; giao agent code
- 2026-11-19 · Claude (agent code) · TA2, TA3, TA4 trên nhánh US19-xoa-can, chưa PR · bất ngờ: ghi booking chưa khóa căn, thêm trigger khóa · ~1 giờ
- 2026-11-19 · Claude · gộp PR #42 theo QD25 (CI xanh), chuyển chờ test; TA1 Thiết kế còn mở

## Bằng chứng
- TA2 `PGHOST=localhost PGUSER=postgres PGPASSWORD=postgres scripts/test-db.sh YC3.6`: trước migration 31 hỏng, 19 qua (sửa file test 2 vòng vì lỗi cú pháp, không đổi nội dung kiểm).
- TA3 cùng lệnh, cả bộ: lần đầu sau migration xanh, 1186 qua, 0 hỏng, không sửa vòng nào. `scripts/thu-lam-hong.sh YC3.6`: 9 đạt, 0 không đạt (có phép bỏ trigger khóa căn thì NT11 đỏ). `scripts/bang-cot.sh` sinh lại, `supabase db reset` qua.
- TA4 `npx vitest run`: 6 test mới trong CN502SuaCan.test.tsx viết trước code, lần đầu 5 đỏ; sau code 1 vòng xanh, cả bộ 483 qua. Không sửa test cũ.
- `npm run typecheck` qua, `npm run build` qua, `python3 scripts/kiem.py --diff origin/main` không có lỗi.
- e2e `E2E_SUPABASE=1 CI=1 npx playwright test tests/e2e/supabase --trace off`: 44 qua (2 test mới ở xoa-can.spec.ts cho NT1, NT5, NT9, NT12, lần đầu xanh).
