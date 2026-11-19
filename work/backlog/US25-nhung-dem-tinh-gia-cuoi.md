---
id: US25
tieu_de: "Những đêm tính giá cuối tuần"
loai: US
trang_thai: cho-test
thuc_hien: [YC4.6@3]
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
pr: [28]
ngay_tao: 2026-11-18
---
## Mục tiêu
Là chủ nhà, tôi làm được việc "Những đêm tính giá cuối tuần" đúng như YC4.6 mô tả.

## Làm tiêu chí nào
YC4.6-NT1 đến NT4

## Quy tắc, hành vi dùng
QT4.1, QT5.3

## Màn hình
P6

## Quyền
PQ5, PQ6, PQ21 và các test vi phạm ở mục "Ai được làm gì" của YC4-gia.md thuộc mục này. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
Điền khi lập kế hoạch, theo cấu trúc thư mục EN1 ghi ở docs/dev/chay-va-test.md. Database chỉ thêm migration mới ở supabase/migrations/.

## Ngoài phạm vi
- YC4-H4 đã trả lời (YC4 r3).
- Phần đầu YC4-gia.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC4.6 QT4.1 QT5.3 PQ5 PQ6 PQ21 P6
YC4-gia.md#Quy tắc của nhóm
YC4-gia.md#Ai được làm gì
YC4-gia.md#Dữ liệu
YC4-gia.md#Trạng thái màn (mọi mục)
thiet-ke-db.md#3. Bất biến (sai là hỏng sản phẩm)

## Test case
Kịch bản test tay: tests/kb/US25-nhung-dem-tinh-gia-cuoi.md (KB1, KB2).

## Task
- [x] US25-TA1 Code · Claude Code (opus, CL14.6a): viết trước test database cho YC4.6-NT2 đến NT4, kể cả test vi phạm quyền ở mục "Ai được làm gì". Task sau không sửa file test này (CL14.5)
- [x] US25-TA2 Code · Claude Code (opus, CL14.6a): migration, hàm fn_*, policy cho tới khi test database xanh; thêm phép thử làm hỏng vào scripts/thu-lam-hong.sh nếu đổi quyền, tiền, chặn trùng
- [x] US25-TA3 Code · Claude Code (sonnet, CL14.6a): màn P6 theo canvas, test unit, e2e cho YC4.6-NT1, YC4.6-NT2, YC4.6-NT4
- [ ] US25-TA4 Test tay · Đức: chạy tests/kb/US25-nhung-dem-tinh-gia-cuoi.md, chế độ nhanh rồi đủ. Rủi ro cao: chạy trên cả iPhone và Android, thử vi phạm quyền bằng tay (CL6.3).

## Kế hoạch
1. Test database `tests/db/38_us25_dem_cuoi_tuan.sql` viết trước (NT2, NT3, NT4 và quyền), chạy thấy đỏ.
2. Migration `20261119180000_us25_dem_cuoi_tuan.sql`: `fn_dat_dem_cuoi_tuan(smallint[])`, chỉ ghi hồ sơ người gọi, cập nhật `lich_doi_luc`; thêm 5 phép thử làm hỏng; chạy `bang-cot.sh`.
3. `src/lib/gia.ts` (đổi chip, mẫu một tuần), `dichVuGia.ts` (đọc, ghi đêm cuối tuần, mẫu tuần), `dieuHuong.ts` (`/ca-nhan/dem-cuoi-tuan`).
4. Màn `P6DemCuoiTuan.tsx` + CSS theo canvas P6; nối vào `ManChu.tsx` (dòng ở tab Cá nhân, đường mới).
5. Unit cho NT1, NT2, NT4; e2e `dem-cuoi-tuan.spec.ts` (CI chạy, không chạy trên máy này).

## Nhật ký
- 2026-11-18 · Claude · tạo item từ YC4.6@1 (QD21)
- 2026-11-19 · Claude · trả lời YC4-H4 (QD25), viết tests/kb, sang dang-lam
- 2026-11-19 · Claude · code TA1 đến TA3 trên nhánh US25-dem-cuoi-tuan, mở PR nháp
- 2026-11-19 · Claude · gộp main (US20) vào nhánh, sửa e2e bấm chip aria-disabled, gộp PR #28 theo QD25 (CI xanh), sang cho-test · 15 phút

## Bằng chứng
- `scripts/test-db.sh` (Postgres 16 máy): lần đầu, trước migration, đỏ 23 test của file 38; migration xong xanh ngay vòng đầu (sửa 0 vòng): 658 qua, 0 hỏng, 0 file lỗi.
- `scripts/thu-lam-hong.sh` cho 5 dòng mới (YC4.6 và YC4 Ai được làm gì): 5 đạt, 0 không đạt.
- `scripts/bang-cot.sh` chạy, `supabase/bang-va-cot.md` thêm 1 dòng.
- `npx vitest run`: 31 file, 256 test qua. `npm run typecheck` qua (sửa 1 lỗi kiểu ở vòng đầu). `npm run build` qua.
- `python3 scripts/kiem.py --diff origin/main`: không có lỗi.
- e2e `tests/e2e/supabase/dem-cuoi-tuan.spec.ts`: chỉ kiểm liệt kê được (`playwright --list`); không chạy trên Supabase máy (US20 đang dùng), CI chạy.
