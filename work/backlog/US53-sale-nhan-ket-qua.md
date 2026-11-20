---
id: US53
tieu_de: "Sale nhận kết quả"
loai: US
trang_thai: dang-lam
thuc_hien: [YC9.4@1]
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
pr:
ngay_tao: 2026-11-18
---
## Mục tiêu
Là sale, tôi làm được việc "Sale nhận kết quả" đúng như YC9.4 mô tả.

## Làm tiêu chí nào
YC9.4-NT1 đến NT8; HV3-NT3 (hành vi chung gắn màn này, QD27)

## Quy tắc, hành vi dùng
QT1.1, QT1.4, QT2.1, QT5.6, QT6.2

## Màn hình
S3-04, S3-04-01, S3-05, S3-09

## Quyền
PQ2, PQ5, PQ7, PQ10, PQ11, PQ19 và các test vi phạm ở mục "Ai được làm gì" của YC9-yeu-cau-dat-phong.md thuộc mục này. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
Điền khi lập kế hoạch, theo cấu trúc thư mục EN1 ghi ở docs/dev/chay-va-test.md. Database chỉ thêm migration mới ở supabase/migrations/.

## Ngoài phạm vi
- YC9-H3, H5 đã Claude tự chốt (QD25, YC9 r3). YC9-H6 làm ở US50.
- Phần đầu YC9-yeu-cau-dat-phong.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC9.4 QT1.1 QT1.4 QT2.1 QT5.6 QT6.2 PQ2 PQ5 PQ7 PQ10 PQ11 PQ19 S3-04 S3-04-01 S3-05 S3-09
YC9-yeu-cau-dat-phong.md#Quy tắc của nhóm
YC9-yeu-cau-dat-phong.md#Ai được làm gì
YC9-yeu-cau-dat-phong.md#Dữ liệu
YC9-yeu-cau-dat-phong.md#Trạng thái màn (mọi mục)

## Test case
Kịch bản test tay: tests/kb/US53-sale-nhan-ket-qua.md.

## Task
- [x] US53-TA1 Code · Claude Code (opus, CL14.6a): migration, hàm fn_*, policy và test database cho YC9.4-NT1, YC9.4-NT4, YC9.4-NT5, YC9.4-NT6, YC9.4-NT7
- [x] US53-TA2 Code · Claude Code (sonnet, CL14.6a): màn S3-04, S3-04-01, S3-05, S3-09 theo canvas, test unit, e2e cho YC9.4-NT1 đến NT5, NT8
- [ ] US53-TA3 Test tay · Đức: chạy tests/kb/US53-sale-nhan-ket-qua.md, chế độ nhanh rồi đủ.

## Kế hoạch
- TA1: test tests/db/69 trước (đỏ), rồi migration 20261119470000: fn_ket_qua_yeu_cau (S3-04/05/09, thêm het_han_vi, con_xem_can, không số chủ nhà), fn_can_tuong_tu (dựa can_tim, chỉ căn nguồn, không giá chủ), fn_het_han_yeu_cau + pg_cron 10 phút. Phép làm hỏng.
- TA2: src/lib/ketQuaYeuCau.ts (chữ, lý do), dichVuYeuCau.ts thêm hai lệnh đọc, S3KetQuaYeuCau.tsx thay nhãn ở S3GuiYeuCau, nối ManSale và manTuThongBao; unit, e2e.

## Nhật ký
- 2026-11-18 · Claude · tạo item từ YC9.4@1 (QD21)
- 2026-11-19 · Claude · nhận HV3-NT3 từ EN4 (QD27)
- 2026-11-19 · Claude (QD25) · YC9 r3 tự chốt câu mở, thêm NT
- 2026-11-20 · Claude · US53 TA1, TA2 trên nhánh US53-ket-qua-yeu-cau, chưa mở PR · e2e mở S3 từ tìm phòng cần nối thêm · ~2 giờ

## Bằng chứng
- TA1: `CHI_FILE_CO_MA=1 scripts/test-db.sh YC9.4` lần đầu 35 hỏng / 12 qua (chưa có migration), sau migration 47 qua, 1 vòng. `scripts/test-db.sh` cả bộ 2226 qua. `scripts/thu-lam-hong.sh YC9.4` 9/9 đạt. `kiem.py --diff origin/main` không lỗi.
- TA2: test unit viết cùng lúc với màn (không đỏ trước): `npx vitest run` 88 file, 870 qua. e2e `ket-qua-yeu-cau.spec.ts` lần đầu 1 đỏ (thẻ căn tương tự không bấm được khi S3 mở từ tìm phòng), sửa 1 vòng ở ManSale, 2 qua; chạy lại gui-yeu-cau, yeu-cau-trung-dem, chi-tiet-can-sale, tim-phong: 4 qua. `typecheck`, `build` qua, `kiem.py` không lỗi.
