---
id: US59
tieu_de: "Thống kê của sale"
loai: US
trang_thai: dang-lam
thuc_hien: [YC11.2@2]
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
pr:
ngay_tao: 2026-11-18
---
## Mục tiêu
Là sale, tôi làm được việc "Thống kê của sale" đúng như YC11.2 mô tả.

## Làm tiêu chí nào
YC11.2-NT1 đến NT11

## Quy tắc, hành vi dùng
QT2.1, QT2.2, QT3, QT3.1, QT3.2, QT4.2, QT6.1

## Màn hình
S7, S7-00

## Quyền
PQ7, PQ9, PQ10, PQ11, PQ14, PQ15, PQ16 và các test vi phạm ở mục "Ai được làm gì" của YC11-thong-ke.md thuộc mục này. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
Điền khi lập kế hoạch, theo cấu trúc thư mục EN1 ghi ở docs/dev/chay-va-test.md. Database chỉ thêm migration mới ở supabase/migrations/.

## Ngoài phạm vi
- Chỗ chưa quyết trong mục, chưa code tới khi Tùng trả lời: YC11-H6, YC11-H5, YC11-H8, YC11-H2, YC11-H1.
- Phần đầu YC11-thong-ke.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC11.2 QT2.1 QT2.2 QT3 QT3.1 QT3.2 QT4.2 QT6.1 PQ7 PQ9 PQ10 PQ11 PQ14 PQ15 PQ16 S7 S7-00
YC11-thong-ke.md#Quy tắc của nhóm
YC11-thong-ke.md#Ai được làm gì
YC11-thong-ke.md#Dữ liệu
YC11-thong-ke.md#Trạng thái màn (mọi mục)
thiet-ke-db.md#3. Bất biến (sai là hỏng sản phẩm)

## Test case
Kịch bản test tay: tests/kb/US59-thong-ke-cua-sale.md.

## Task
- [x] US59-TA1 Code · Claude Code (opus, CL14.6a): viết trước test database cho YC11.2-NT1, YC11.2-NT3, YC11.2-NT4, YC11.2-NT5, YC11.2-NT6, YC11.2-NT7, YC11.2-NT9, YC11.2-NT10, YC11.2-NT11, kể cả test vi phạm quyền ở mục "Ai được làm gì". Task sau không sửa file test này (CL14.5)
- [x] US59-TA2 Code · Claude Code (opus, CL14.6a): migration, hàm fn_*, policy cho tới khi test database xanh; thêm phép thử làm hỏng vào scripts/thu-lam-hong.sh nếu đổi quyền, tiền, chặn trùng
- [x] US59-TA3 Code · Claude Code (sonnet, CL14.6a): màn S7, S7-00 theo canvas, test unit, e2e cho YC11.2-NT1, YC11.2-NT2, YC11.2-NT3, YC11.2-NT8
- [ ] US59-TA4 Test tay · Đức: chạy tests/kb/US59-thong-ke-cua-sale.md, chế độ nhanh rồi đủ. Rủi ro cao: chạy trên cả iPhone và Android, thử vi phạm quyền bằng tay (CL6.3).

## Kế hoạch
- TA1: tests/db/75_us59_thong_ke_sale.sql, hợp đồng `fn_thong_ke_sale(p_thang date, p_so_thang int default 2)` → jsonb của người gọi (không nhận mã sale): số tháng, tháng trước, cac_thang, theo_chu, cho_chu. Số theo DLM.6; tháng 9 chỉ có tổng nên ba đặt phòng tháng 9 ngoài V1 là dàn dựng.
- TA2: migration 20261119530000_us59_thong_ke_sale.sql theo mẫu fn_thong_ke_chu; giá bán chia theo đêm (YC11-H2), đếm theo ngày nhận (H6), bỏ căn của tôi (H1); phép làm hỏng trong scripts/thu-lam-hong.txt.
- TA3: src/lib/thongKeSale.ts, dichVuThongKeSale.ts, src/man/S7ThongKe.tsx (S7, S7-00) thay bản tạm trong ManSale.tsx; unit NT1, NT2, NT3, NT8; e2e thong-ke-sale.spec.ts.

## Nhật ký
- 2026-11-18 · Claude · tạo item từ YC11.2@1 (QD21)
- 2026-11-20 · Claude (QD25) · YC11 r2: Claude tự chốt YC11-H1 đến H9 (trừ H4), cập nhật NT và task.
- 2026-11-20 · Claude (QD25) · TA1 đến TA3 trên nhánh US59-thong-ke-sale, chưa đẩy (dừng đẩy theo phiên chính) · ~1,5 giờ

## Bằng chứng
- TA1: `CHI_FILE_CO_MA=1 scripts/test-db.sh YC11.2` trước migration: 3 qua, 46 hỏng (đỏ đúng chờ).
- TA2: `CHI_FILE_CO_MA=1 scripts/test-db.sh YC11.2` 49 qua sau vòng 1; `scripts/test-db.sh` 2601 qua, 0 hỏng; `scripts/thu-lam-hong.sh YC11.2` lần đầu 16/21 (5 phép thử đặt nhãn test không bắt được), sửa nhãn 2 vòng, cuối 21/21 đạt.
- TA3: `npx vitest run` 109 file, 1033 test qua (3 file mới 18 test xanh lần đầu); `npm run -s typecheck` lần đầu đỏ 4 lỗi kiểu ở test, sửa 1 vòng, xanh; `npm run -s build` qua; e2e thong-ke-sale.spec.ts 2 qua, cùng lich-sale, thong-ke-chu 5 qua; `python3 scripts/kiem.py --diff origin/main` không có lỗi.
