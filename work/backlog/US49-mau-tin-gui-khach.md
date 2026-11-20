---
id: US49
tieu_de: "Mẫu tin gửi khách"
loai: US
trang_thai: cho-test
thuc_hien: [YC8.2@1]
truoc: [EN1, EN2, EN4, US2]
lien_quan: []
thay_cho: []
nguon: QD21
nguoi: tung
rui_ro: tb
nghiem_thu: khong
uoc_luong:
thuc_te:
can_duyet: []
based_on:
pr: [57]
ngay_tao: 2026-11-18
---
## Mục tiêu
Là sale, tôi làm được việc "Mẫu tin gửi khách" đúng như YC8.2 mô tả.

## Làm tiêu chí nào
YC8.2-NT1 đến NT5

## Quy tắc, hành vi dùng
Không có.

## Màn hình
P11

## Quyền
PQ3, PQ5, PQ11, PQ12, PQ14, PQ19 và các test vi phạm ở mục "Ai được làm gì" của YC8-gui-khach.md thuộc mục này. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
Điền khi lập kế hoạch, theo cấu trúc thư mục EN1 ghi ở docs/dev/chay-va-test.md. Database chỉ thêm migration mới ở supabase/migrations/.

## Ngoài phạm vi
- YC8-H8, H9 đã Claude tự chốt (QD25, YC8 r5).
- Màn S5 và chữ từng căn: US48. US49 chỉ thêm P11, lệnh đọc, lưu mẫu, và cho S5 dùng mẫu đã lưu khi "Sao chép chữ cả N căn".
- Tab Cá nhân của sale chưa đầy đủ (YC1): US49 chỉ thêm dòng "Mẫu tin gửi khách".
- Phần đầu YC8-gui-khach.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC8.2 PQ3 PQ5 PQ11 PQ12 PQ14 PQ19 P11
YC8-gui-khach.md#Quy tắc của nhóm
YC8-gui-khach.md#Ai được làm gì
YC8-gui-khach.md#Dữ liệu
YC8-gui-khach.md#Trạng thái màn (mọi mục)

## Test case
Kịch bản test tay: tests/kb/US49-mau-tin-gui-khach.md.

## Task
- [x] US49-TA1 Code · Claude Code (opus, CL14.6a): migration, hàm fn_*, policy và test database cho YC8.2-NT3, YC8.2-NT4, YC8.2-NT5 · PR #57
- [x] US49-TA2 Code · Claude Code (sonnet, CL14.6a): màn P11 theo canvas, test unit, e2e cho YC8.2-NT1 đến NT3, NT5 · PR #57
- [ ] US49-TA3 Test tay · Đức: chạy tests/kb/US49-mau-tin-gui-khach.md, chế độ nhanh rồi đủ.

## Kế hoạch
- TA1: test tests/db/65_us49_mau_tin.sql trước (NT3, NT4, NT5, vi phạm: chủ nhà, chưa đăng nhập, sale khác), rồi migration 20261119430000_us49_mau_tin.sql: fn_mau_tin (mẫu của mình, chưa có thì mặc định), fn_dat_mau_tin (chỉ sale, từ chối rỗng, thiếu [Danh sách căn], quá 2.000 ký tự). Kiểm ở lệnh lưu, không thêm check ở bảng vì test US47 ghi mẫu không có [Danh sách căn]. S5 đã đọc mẫu đã lưu qua fn_soan_tin_gui_khach (US48), không đổi.
- TA2: test unit trước, rồi src/lib/dichVuMauTin.ts, src/man/P11MauTin.tsx (+css), dòng ở tab Cá nhân (ManSale), nối ở dichVuCan.ts; bản xem trước dùng tinCaNCan của guiKhach.ts với 3 căn ví dụ dạng khối S5. e2e tests/e2e/supabase/mau-tin.spec.ts.

## Nhật ký
- 2026-11-18 · Claude · tạo item từ YC8.2@1 (QD21)
- 2026-11-19 · Claude (QD25) · tự chốt YC8-H8, H9 (YC8 r5, thêm NT5); viết kịch bản test tay
- 2026-11-19 · Claude (agent code) · TA1, TA2: fn_mau_tin, fn_dat_mau_tin, P11, dòng ở Cá nhân, e2e; nhánh US49-mau-tin, chưa PR · S5 đã theo mẫu lưu từ US48 · ~1 giờ
- 2026-11-20 · Claude (QD25) · Gộp PR #57, CI xanh 4/4. Chuyển cho-test, chờ Đức test tay TA3.

## Bằng chứng
- DB: `CHI_FILE_CO_MA=1 scripts/test-db.sh YC8.2` lần đầu 32 hỏng/8 qua (chưa có hàm; một vòng đổi t.dem sang t.so vì file dừng ở vai anon), sau migration 40 qua. `scripts/test-db.sh` cả bộ: 1951 qua, 0 hỏng.
- Làm hỏng: `scripts/thu-lam-hong.sh YC8.2` 6 đạt/6. `scripts/bang-cot.sh` đã chạy, `supabase db reset` qua.
- Unit: lần đầu 2 file không nạp được (chưa có dichVuMauTin, P11) và 2 test ManSale hỏng; một vòng sửa, xanh. `npx vitest run` 81 file, 788 test qua.
- e2e: `mau-tin.spec.ts` qua lần đầu; cả `tests/e2e/supabase` 66 qua.
- `npm run typecheck` qua, `npm run build` qua, `python3 scripts/kiem.py --diff origin/main` không có lỗi.
