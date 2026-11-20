---
id: US55
tieu_de: "Chi tiết chủ nhà và bỏ nguồn"
loai: US
trang_thai: dang-lam
thuc_hien: [YC10.2@1]
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
Là sale, tôi làm được việc "Chi tiết chủ nhà và bỏ nguồn" đúng như YC10.2 mô tả.

## Làm tiêu chí nào
YC10.2-NT1 đến NT8

## Quy tắc, hành vi dùng
QT1.1, QT1.3, QT3, QT6.3, QT6.4

## Màn hình
S6-04

## Quyền
PQ1, PQ2, PQ3, PQ7, PQ13, PQ14, PQ17, PQ23 và các test vi phạm ở mục "Ai được làm gì" của YC10-can-tu-nhap-va-nguon-phong.md thuộc mục này. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
Điền khi lập kế hoạch, theo cấu trúc thư mục EN1 ghi ở docs/dev/chay-va-test.md. Database chỉ thêm migration mới ở supabase/migrations/.

## Ngoài phạm vi
- YC10-H1, H6, H8 đã Claude tự chốt (QD25, YC10 r4).
- Phần đầu YC10-can-tu-nhap-va-nguon-phong.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC10.2 QT1.1 QT1.3 QT3 QT6.3 QT6.4 PQ1 PQ2 PQ3 PQ7 PQ13 PQ14 PQ17 PQ23 S6-04
YC10-can-tu-nhap-va-nguon-phong.md#Quy tắc của nhóm
YC10-can-tu-nhap-va-nguon-phong.md#Ai được làm gì
YC10-can-tu-nhap-va-nguon-phong.md#Dữ liệu
YC10-can-tu-nhap-va-nguon-phong.md#Trạng thái màn (mọi mục)
thiet-ke-db.md#3. Bất biến (sai là hỏng sản phẩm)

## Test case
Kịch bản test tay: tests/kb/US55-chi-tiet-chu-nha-va.md.

## Task
- [x] US55-TA1 Code · Claude Code (opus, CL14.6a): viết trước test database cho YC10.2-NT1, YC10.2-NT4, YC10.2-NT5, YC10.2-NT6, YC10.2-NT7, YC10.2-NT8, kể cả test vi phạm quyền ở mục "Ai được làm gì". Task sau không sửa file test này (CL14.5)
- [x] US55-TA2 Code · Claude Code (opus, CL14.6a): migration, hàm fn_*, policy cho tới khi test database xanh; thêm phép thử làm hỏng vào scripts/thu-lam-hong.sh nếu đổi quyền, tiền, chặn trùng
- [x] US55-TA3 Code · Claude Code (sonnet, CL14.6a): màn S6-04 theo canvas, test unit, e2e cho YC10.2-NT1 đến NT4, NT6, NT7
- [ ] US55-TA4 Test tay · Đức: chạy tests/kb/US55-chi-tiet-chu-nha-va.md, chế độ nhanh rồi đủ. Rủi ro cao: chạy trên cả iPhone và Android, thử vi phạm quyền bằng tay (CL6.3).

## Kế hoạch
- TA1: tests/db/71_us55_chi_tiet_chu_nha.sql viết trước, hợp đồng: fn_chi_tiet_chu_nha(p_ket_noi_id, p_ngay) trả jsonb (đang kết nối: tên, số, ngày kết nối, lần cập nhật, xem_coc, căn kèm giá chủ đêm p_ngay, số đặt phòng, tiền chênh; chủ ngừng hay xóa tài khoản: chỉ trạng thái 'khong_con_quyen', lý do, tên); fn_sale_bo_nguon(p_ket_noi_id) sang 'sale_bo', hủy yêu cầu chờ của sale tới căn chủ đó, không thông báo; fn_tab_can_sale thêm cột chu_ngung (dòng chủ ngừng: tên và cờ); fn_sale_bo_dong_chu bỏ được cả dòng chủ ngừng.
- TA2: migration 20261119490000_us55_chi_tiet_chu_nha.sql (drop rồi tạo lại fn_tab_can_sale vì thêm cột), phép làm hỏng ở scripts/thu-lam-hong.txt.
- TA3: src/lib/chiTietChuNha.ts (định dạng), dichVuChiTietChuNha.ts (gọi hàm), S604ChiTietChuNha.tsx thay màn tạm ở S6TabCan, dòng "đã ngừng cho bạn xem lịch" ở tab Căn; unit và e2e tests/e2e/supabase/chi-tiet-chu-nha.spec.ts.

## Nhật ký
- 2026-11-18 · Claude · tạo item từ YC10.2@1 (QD21)
- 2026-11-20 · Claude (QD25) · YC10 r4 tự chốt câu mở, thêm NT
- 2026-11-20 · Claude Code (agent code, Tùng giao qua làm tự động) · TA1, TA2, TA3 trên nhánh US55-chi-tiet-chu-nha, chưa mở PR

## Bằng chứng
- Test database `PGHOST=localhost PGUSER=postgres PGPASSWORD=postgres scripts/test-db.sh`: lần đầu (TA1, chưa có migration) 29 hỏng trên file 71; sau migration 3 hỏng do dàn dựng test (lần cập nhật đặt trước khi ghi đặt phòng, tìm phòng ngày đã qua, chi tiết căn trả khong_con_quyen chứ không báo lỗi), sửa 1 vòng; cuối: 2336 qua, 0 hỏng.
- Thử làm hỏng `scripts/thu-lam-hong.sh YC10`: 14 đạt, 0 không đạt (9 phép mới của US55, sửa chuỗi tìm của phép YC10.1-NT7 S6-08 theo hàm mới).
- `npx vitest run`: lần đầu 1 hỏng (regex test bắt nhầm chữ "đã"), sửa 1 vòng; cuối 95 file, 926 test qua.
- e2e `tests/e2e/supabase/chi-tiet-chu-nha.spec.ts`: qua lần đầu; cả thư mục tests/e2e/supabase 74 qua.
- `npm run -s typecheck`, `npm run -s build` qua; `python3 scripts/kiem.py --diff origin/main`: không có lỗi.
