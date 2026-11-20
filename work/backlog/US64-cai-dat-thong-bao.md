---
id: US64
tieu_de: "Cài đặt thông báo"
loai: US
trang_thai: cho-test
thuc_hien: [YC12.4@1]
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
pr: 82
ngay_tao: 2026-11-18
---
## Mục tiêu
Là người dùng (chủ nhà hoặc sale), tôi làm được việc "Cài đặt thông báo" đúng như YC12.4 mô tả.

## Làm tiêu chí nào
YC12.4-NT1 đến NT3

## Quy tắc, hành vi dùng
Không có.

## Màn hình
P3, P12

## Quyền
PQ19 và các test vi phạm ở mục "Ai được làm gì" của YC12-thong-bao.md thuộc mục này. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
supabase/migrations/20261120200000_us64_cai_dat_thong_bao.sql, supabase/bang-va-cot.md, tests/db/86_us64_cai_dat_thong_bao.sql, scripts/thu-lam-hong.txt, src/lib/caiDatThongBao.ts, src/lib/dichVuCaiDatThongBao.ts (mới), src/lib/dichVuCan.ts, src/lib/dieuHuong.ts, src/man/P3CaiDatThongBao.tsx và .css (mới), src/man/ManChu.tsx, src/man/ManSale.tsx, src/App.tsx, unit test kèm, tests/e2e/supabase/cai-dat-thong-bao.spec.ts, tests/kb/US64-cai-dat-thong-bao.md.

## Ngoài phạm vi
- YC12-H2 đã tự chốt 20/11 (QD25, GD32). YC12-H4: giữ giả định GD29 (thông báo đã ghi trước vẫn còn).
- Phần đầu YC12-thong-bao.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC12.4 PQ19 P3 P12
YC12-thong-bao.md#Quy tắc của nhóm
YC12-thong-bao.md#Ai được làm gì
YC12-thong-bao.md#Dữ liệu
YC12-thong-bao.md#Trạng thái màn (mọi mục)

## Test case
Kịch bản test tay: tests/kb/US64-cai-dat-thong-bao.md (2 kịch bản, 2 [Chính]).

## Task
- [x] US64-TA1 Code · Claude Code (opus, CL14.6a): migration, hàm fn_*, policy và test database cho YC12.4-NT2, YC12.4-NT3
- [x] US64-TA2 Code · Claude Code (sonnet, CL14.6a): màn P3, P12 theo canvas, test unit, e2e cho YC12.4-NT1
- [ ] US64-TA3 Test tay · Đức: chạy tests/kb/US64-cai-dat-thong-bao.md, chế độ nhanh rồi đủ.

## Kế hoạch

## Nhật ký
- 2026-11-18 · Claude · tạo item từ YC12.4@1 (QD21)

- 2026-11-20 · Claude (tự chạy, QD25) · tự chốt YC12-H2, viết test database và tests/kb, migration fn_dat_cai_dat_thong_bao và trigger công tắc, màn P3, P12, mở PR · khoảng 35 phút
- 2026-11-20 · Claude (tự chạy, QD25) · CI xanh, gộp PR #82, chuyển cho-test · gộp main nhiều lần vì nhánh chồng nhau


## Bằng chứng
- `scripts/test-db.sh` (cả bộ, vì thêm trigger trên thong_bao): 2890 qua, 0 hỏng. `scripts/thu-lam-hong.sh YC12.4`: 3 đạt (một vòng sửa tên test để phép thử bắt được trigger). `npx vitest run src/man/P3CaiDatThongBao.test.tsx`: qua. `npm run typecheck`: qua. e2e: CI chạy.
