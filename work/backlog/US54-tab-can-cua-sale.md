---
id: US54
tieu_de: "Tab Căn của sale"
loai: US
trang_thai: cho-test
thuc_hien: [YC10.1@2]
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
pr: [62]
ngay_tao: 2026-11-18
---
## Mục tiêu
Là sale, tôi làm được việc "Tab Căn của sale" đúng như YC10.1 mô tả.

## Làm tiêu chí nào
YC10.1-NT1 đến NT11

## Quy tắc, hành vi dùng
QT1.1, QT1.3, QT3, QT6.3, QT6.4

## Màn hình
S6, S6-00, S6-07, S6-08

## Quyền
PQ1, PQ2, PQ3, PQ7, PQ13, PQ14, PQ17, PQ23 và các test vi phạm ở mục "Ai được làm gì" của YC10-can-tu-nhap-va-nguon-phong.md thuộc mục này. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
Điền khi lập kế hoạch, theo cấu trúc thư mục EN1 ghi ở docs/dev/chay-va-test.md. Database chỉ thêm migration mới ở supabase/migrations/.

## Ngoài phạm vi
- YC10-H2, H4, H5 đã Claude tự chốt (QD25, YC10 r4).
- Phần đầu YC10-can-tu-nhap-va-nguon-phong.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC10.1 QT1.1 QT1.3 QT3 QT6.3 QT6.4 PQ1 PQ2 PQ3 PQ7 PQ13 PQ14 PQ17 PQ23 S6 S6-00 S6-07 S6-08
YC10-can-tu-nhap-va-nguon-phong.md#Quy tắc của nhóm
YC10-can-tu-nhap-va-nguon-phong.md#Ai được làm gì
YC10-can-tu-nhap-va-nguon-phong.md#Dữ liệu
YC10-can-tu-nhap-va-nguon-phong.md#Trạng thái màn (mọi mục)

## Test case
Kịch bản test tay: tests/kb/US54-tab-can-cua-sale.md.

## Task
- [x] US54-TA1 Code · migration fn_tab_can_sale, fn_chi_tiet_can_cua_toi, fn_sale_bo_dong_chu, test database (nhánh US54-tab-can-sale) · PR #62
- [x] US54-TA2 Code · màn S6, S6-00, S6-07, S6-08, test unit, e2e (nhánh US54-tab-can-sale) · PR #62
- [ ] US54-TA3 Test tay · Đức: chạy tests/kb/US54-tab-can-cua-sale.md, chế độ nhanh rồi đủ.

## Kế hoạch
- TA1: test `tests/db/70_us54_tab_can_sale.sql` trước (đỏ), rồi migration `20261119480000_us54_tab_can_sale.sql`: `fn_tab_can_sale()` (ba nhóm, dòng chủ đã xóa tài khoản chỉ tên và cờ), `fn_chi_tiet_can_cua_toi(can, tu)` (S6-07, 7 ngày), `fn_sale_bo_dong_chu(ket_noi)` (đổi sang `sale_bo`, không nối lại). Phép làm hỏng, bang-cot.
- TA2: `src/lib/tabCanSale.ts`, `dichVuTabCanSale.ts`, màn `S6TabCan.tsx` (S6, S6-00, S6-08), `S607CanCuaToi.tsx`; nối ở ManSale, S6Tam, dichVuCan; unit và e2e.

## Nhật ký
- 2026-11-18 · Claude · tạo item từ YC10.1@1 (QD21)
- 2026-11-19 · Claude · thuc_hien lên bản mới theo QD22
- 2026-11-20 · Claude (QD25) · YC10 r4 tự chốt câu mở, thêm NT
- 2026-11-20 · Claude · TA1, TA2 trên nhánh US54-tab-can-sale; S6-07 từ S2 vẫn tạm (S2KetQua không có id căn) · ~2 giờ
- 2026-11-20 · Claude (QD25) · Gộp PR #62, CI xanh 4/4. Chuyển cho-test, chờ Đức test tay TA3. Còn thiếu: S6-07 "Đặt phòng", "Sửa căn và giá" và tab Căn "+ Thêm căn" mới báo tạm; chạm căn của tôi từ S2 vẫn mở S6-07 tạm.

## Bằng chứng
- TA1: `CHI_FILE_CO_MA=1 scripts/test-db.sh YC10.1` lần đầu 32 hỏng (chưa có hàm), sau migration 51/51 qua, 1 vòng; cả bộ `scripts/test-db.sh` 2277 qua. `scripts/thu-lam-hong.sh YC10.1` 5/5 đạt (1 vòng sửa nhãn có dấu nháy). `kiem.py --diff origin/main` không lỗi.
- TA2: `npx vitest run` 901 qua (test mới US54 lần đầu đỏ 2 vì tên nút chủ nhà trong test, sửa 1 vòng). e2e `tab-can-sale.spec.ts` 1 qua lần đầu; chạy lại lich-sale, ket-qua-tim, gui-khach, chi-tiet-can-sale: 5 qua. `typecheck`, `build` qua, `kiem.py` không lỗi.
