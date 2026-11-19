---
id: US41
tieu_de: "Phạm vi 'tất cả căn' và căn mới"
loai: US
trang_thai: cho-test
thuc_hien: [YC6.7@1]
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
pr: [49]
ngay_tao: 2026-11-18
---
## Mục tiêu
Là người dùng (chủ nhà hoặc sale), tôi làm được việc "Phạm vi "tất cả căn" và căn mới" đúng như YC6.7 mô tả.

## Làm tiêu chí nào
YC6.7-NT1

## Quy tắc, hành vi dùng
Không có.

## Màn hình
lịch của sale (YC7)

## Quyền
PQ1, PQ2, PQ4, PQ17, PQ18, PQ23 và các test vi phạm ở mục "Ai được làm gì" của YC6-ket-noi-sale.md thuộc mục này. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
Điền khi lập kế hoạch, theo cấu trúc thư mục EN1 ghi ở docs/dev/chay-va-test.md. Database chỉ thêm migration mới ở supabase/migrations/.

## Ngoài phạm vi
- YC3-H1 đã Claude tự chốt (có báo sale khi có căn mới, YC6.7 r4); thông báo đã làm ở US15.
- Màn lịch của sale (YC7.1) làm ở US43. YC6.7-NT1 ghi lớp database, nên US41 chỉ có test database; phạm vi "tất cả căn" đã có ở hàm dùng chung `my_shared_can_ids()` (EN2).
- Phần đầu YC6-ket-noi-sale.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC6.7 PQ1 PQ2 PQ4 PQ17 PQ18 PQ23
YC6-ket-noi-sale.md#Quy tắc của nhóm
YC6-ket-noi-sale.md#Ai được làm gì
YC6-ket-noi-sale.md#Dữ liệu
YC6-ket-noi-sale.md#Trạng thái màn (mọi mục)
thiet-ke-db.md#3. Bất biến (sai là hỏng sản phẩm)

## Test case
Kịch bản test tay: tests/kb/US41-pham-vi-tat-ca-can.md.

## Task
- [x] US41-TA1 Code · Claude Code (opus, CL14.6a): viết trước test database cho YC6.7-NT1, kể cả test vi phạm quyền ở mục "Ai được làm gì". Task sau không sửa file test này (CL14.5) · tests/db/57_us41_pham_vi_tat_ca.sql · nhánh US41-pham-vi-tat-ca · PR #49
- [x] US41-TA2 Code · Claude Code (opus, CL14.6a): migration, hàm fn_*, policy cho tới khi test database xanh; thêm phép thử làm hỏng vào scripts/thu-lam-hong.sh nếu đổi quyền, tiền, chặn trùng · không cần migration: my_shared_can_ids() (EN2) đã đúng; thêm 2 phép thử làm hỏng · nhánh US41-pham-vi-tat-ca · PR #49
- [x] US41-TA3 Code · bỏ: màn lịch của sale làm ở US43 (YC7.1); NT1 chỉ ở lớp database
- [ ] US41-TA4 Test tay · Đức: chạy tests/kb/US41-pham-vi-tat-ca-can.md, chế độ nhanh rồi đủ. Rủi ro cao: chạy trên cả iPhone và Android, thử vi phạm quyền bằng tay (CL6.3).

## Kế hoạch
- TA1: test database YC6.7-NT1: Hùng (tất cả căn) thấy căn mới qua my_shared_can_ids, RLS căn và o_lich; kết nối không đổi; Lan (chỉ 1509) không thấy; bị ngừng thì không thấy.
- TA2: không cần migration. Phép thử làm hỏng: phạm vi chụp theo lúc kết nối (căn tạo sau không vào), và căn mới lọt vào sale theo danh sách.

## Nhật ký
- 2026-11-18 · Claude · tạo item từ YC6.7@1 (QD21)
- 2026-11-19 · Claude (QD25) · YC3-H1 đã trả lời; TA3 chuyển sang US43 vì NT1 chỉ ở lớp database; viết kịch bản test tay
- 2026-11-19 · Claude (QD25) · TA1, TA2 trên nhánh US41-pham-vi-tat-ca; phép thử đầu tiên không đạt vì cả file chung một now(), sửa test lùi lúc tạo kết nối · ~20 phút
- 2026-11-19 · Claude (QD25) · Gộp PR #49, CI xanh 4/4 (e2e chạy lại một lần vì máy CI trùng cổng). Chuyển cho-test, chờ Đức test tay TA4.

## Bằng chứng
- DB: `CHI_FILE_CO_MA=1 scripts/test-db.sh YC6.7`: 8 qua. `scripts/thu-lam-hong.sh YC6.7`: lần đầu 0/2 (test xanh cả khi phá vì kết nối và căn mới cùng lúc tạo), sửa test 1 vòng: 2/2 đạt.
