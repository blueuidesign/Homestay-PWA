---
id: US62
tieu_de: "Màn Thông báo"
loai: US
trang_thai: cho-test
thuc_hien: [YC12.2@1]
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
pr: 84
ngay_tao: 2026-11-18
---
## Mục tiêu
Là người dùng (chủ nhà hoặc sale), tôi làm được việc "Màn Thông báo" đúng như YC12.2 mô tả.

## Làm tiêu chí nào
YC12.2-NT1 đến NT6

## Quy tắc, hành vi dùng
HV5

## Màn hình
P13, P13-00, P13-01, P13-02

## Quyền
PQ19 và các test vi phạm ở mục "Ai được làm gì" của YC12-thong-bao.md thuộc mục này. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
supabase/migrations/20261120220000_us62_man_thong_bao.sql, supabase/bang-va-cot.md, tests/db/88_us62_man_thong_bao.sql, scripts/thu-lam-hong.txt, src/lib/thongBao.ts, src/lib/dichVuThongBao.ts, src/lib/dieuHuong.ts, src/man/P13ThongBao.tsx và .css (mới), src/man/ManChu.tsx, src/man/ManSale.tsx, src/App.tsx (nối popup S1-06 của US61 với màn mở), unit test kèm, tests/e2e/supabase/man-thong-bao.spec.ts, tests/kb/US62-man-thong-bao.md, work/backlog/US61-popup-thong-bao-moi.md (đổi trạng thái sau khi gộp).

## Ngoài phạm vi
- Phần đầu YC12-thong-bao.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC12.2 HV5 PQ19 P13 P13-00 P13-01 P13-02
YC12-thong-bao.md#Quy tắc của nhóm
YC12-thong-bao.md#Ai được làm gì
YC12-thong-bao.md#Dữ liệu
YC12-thong-bao.md#Trạng thái màn (mọi mục)

## Test case
Kịch bản test tay: tests/kb/US62-man-thong-bao.md (6 kịch bản, 3 [Chính]).

## Task
- [x] US62-TA1 Code · Claude Code (opus, CL14.6a): migration, hàm fn_*, policy và test database cho YC12.2-NT1, YC12.2-NT2, YC12.2-NT3, YC12.2-NT5
- [x] US62-TA2 Code · Claude Code (sonnet, CL14.6a): màn P13, P13-00, P13-01, P13-02 theo canvas, test unit, e2e cho YC12.2-NT1, YC12.2-NT2, YC12.2-NT4, YC12.2-NT6
- [ ] US62-TA3 Test tay · Đức: chạy tests/kb/US62-man-thong-bao.md, chế độ nhanh rồi đủ.

## Kế hoạch

## Nhật ký
- 2026-11-18 · Claude · tạo item từ YC12.2@1 (QD21)
- 2026-11-20 · Claude (tự chạy, QD25) · fn_ds_thong_bao, fn_danh_dau_da_doc, màn P13, nối chạm-mở cho chủ nhà và sale, nối popup US61; tự chốt: lô có mã lạ thì từ chối cả lô (42501) · khoảng 50 phút

## Bằng chứng
- `CHI_FILE_CO_MA=1 scripts/test-db.sh YC12.2`: 32 qua, 0 hỏng (viết test và migration cùng lượt nên không có lần chạy đỏ trước). `scripts/thu-lam-hong.sh YC12.2`: 3 đạt. `npx vitest run` các file P13, thongBao, App, ManChu, ManSale, dieuHuong, caNhan: 105 qua. `npm run typecheck`: qua. `python3 scripts/kiem.py --diff origin/main`: không lỗi. e2e: CI chạy.
- 2026-11-20 · Claude (tự chạy, QD25) · gộp PR #84 (CI xanh ngay lần đầu); chuyển cho-test, chờ Đức TA3
