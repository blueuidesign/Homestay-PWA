---
id: US36
tieu_de: "Danh sách sale của chủ nhà"
loai: US
trang_thai: cho-test
thuc_hien: [YC6.2@1]
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
pr: [43]
ngay_tao: 2026-11-18
---
## Mục tiêu
Là chủ nhà, tôi làm được việc "Danh sách sale của chủ nhà" đúng như YC6.2 mô tả.

## Làm tiêu chí nào
YC6.2-NT1 đến NT9

## Quy tắc, hành vi dùng
Không có.

## Màn hình
CN7, CN7-00, CN7-04, CN7-05

## Quyền
PQ1, PQ2, PQ4, PQ17, PQ18, PQ23 và các test vi phạm ở mục "Ai được làm gì" của YC6-ket-noi-sale.md thuộc mục này. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
- supabase/migrations/20261119310000_us36_ds_sale.sql, tests/db/52_us36_ds_sale.sql, scripts/thu-lam-hong.txt, supabase/bang-va-cot.md
- src/man/CN7DanhSachSale.tsx, CN704ChiTietSale.tsx, CN705ThemSale.tsx (+ .test.tsx), CN7DanhSachSale.css, src/man/ManChu.tsx
- src/lib/dichVuSale.ts, src/lib/kiemSale.ts (+ .test.ts)
- tests/e2e/supabase/ds-sale.spec.ts, tests/e2e/supabase/hoTro.ts (thêm idCua, taoDatPhongCuaSale)
- Còn thiếu, ngoài ô "Được sửa" của gói việc: nối dịch vụ sale vào src/lib/dichVuCan.ts (thêm `sale?: DichVuSale` và `sale: taoDichVuSaleSupabase(sb)`). Chưa nối thì tab Sale báo chưa tải được và e2e ds-sale đỏ.

## Ngoài phạm vi
- YC6-H13, H11, H16, H1, H4 đã Claude tự chốt (QD25), ghi ở YC6.2 r5.
- Phần đầu YC6-ket-noi-sale.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC6.2 PQ1 PQ2 PQ4 PQ17 PQ18 PQ23 CN7 CN7-00 CN7-04 CN7-05
YC6-ket-noi-sale.md#Quy tắc của nhóm
YC6-ket-noi-sale.md#Ai được làm gì
YC6-ket-noi-sale.md#Dữ liệu
YC6-ket-noi-sale.md#Trạng thái màn (mọi mục)
thiet-ke-db.md#3. Bất biến (sai là hỏng sản phẩm)

## Test case
Kịch bản test tay: tests/kb/US36-danh-sach-sale-cua-chu.md.

## Task
- [x] US36-TA1 Code · Claude Code (opus, CL14.6a): viết trước test database cho YC6.2-NT1, YC6.2-NT3, YC6.2-NT4, YC6.2-NT5, YC6.2-NT6, YC6.2-NT7, YC6.2-NT8, YC6.2-NT9, kể cả test vi phạm quyền ở mục "Ai được làm gì". Task sau không sửa file test này (CL14.5) · PR #43
- [x] US36-TA2 Code · Claude Code (opus, CL14.6a): migration, hàm fn_*, policy cho tới khi test database xanh; thêm phép thử làm hỏng vào scripts/thu-lam-hong.sh nếu đổi quyền, tiền, chặn trùng · PR #43
- [x] US36-TA3 Code · Claude Code (sonnet, CL14.6a): màn CN7, CN7-00, CN7-04, CN7-05 theo canvas, test unit, e2e cho YC6.2-NT1, YC6.2-NT2, YC6.2-NT3, YC6.2-NT7, YC6.2-NT8, YC6.2-NT9 · PR #43
- [ ] US36-TA4 Test tay · Đức: chạy tests/kb/US36-danh-sach-sale-cua-chu.md, chế độ nhanh rồi đủ. Rủi ro cao: chạy trên cả iPhone và Android, thử vi phạm quyền bằng tay (CL6.3).

## Kế hoạch
1. TA1: test database tests/db/52_us36_ds_sale.sql cho NT1, NT3 đến NT9 và vi phạm (chủ khác, sale, người chưa đăng nhập) trước migration.
2. TA2: migration thêm cột ket_noi.ngung_luc và tám hàm security definer: fn_ds_sale_cua_toi, fn_dat_phong_cua_sale, fn_them_sale_tay, fn_xoa_sale_tay, fn_ngung_cho_xem (ghi thông báo chu_ngung_cho_xem một lần), fn_dat_xem_coc, fn_bo_dong_sale, fn_sale_da_coc. Sáu phép thử làm hỏng.
3. TA3: test unit trước, rồi màn CN7/CN7-00, CN7-04, CN7-05 (mở trong tab Sale, không đổi địa chỉ), dịch vụ, luật kiểm; e2e ds-sale.
Claude tự quyết (QD25): tổng tiền phòng ở CN7 tính mọi đặt phòng chưa hủy, không lọc tháng như canvas; "đã thanh toán" tính là đã cọc khi sale đọc tình trạng cọc; "Bỏ dòng" xóa dòng kết nối, đặt phòng giữ; kết nối "sale bỏ" nằm ở nhóm "Đã ngừng", không trả số; thông báo ngừng luôn ghi (YC12.4 không có công tắc cho loại này); CN7-00 dùng chữ của YC6.2 bước 2 (canvas ghi "Giá từng đêm (bạn tắt được)" trái QD7); hai nút link mời báo tạm "Link mời sẽ có ở bản sau" (US37).

## Nhật ký
- 2026-11-18 · Claude · tạo item từ YC6.2@1 (QD21)
- 2026-11-19 · Claude · tự chốt YC6-H13, H11, H16, H1, H4 (QD25, YC6 r5, thêm NT8, NT9); viết kịch bản test tay; giao agent code
- 2026-11-19 · Claude (agent code) · TA1, TA2, TA3 trên nhánh US36-danh-sach-sale; còn nối dịch vụ sale vào src/lib/dichVuCan.ts (ngoài phạm vi gói việc)
- 2026-11-19 · Claude · nối dichVuSale vào dichVuCan, gộp main (US19), chạy lại db 1288, unit 514, e2e 46 đạt; gộp PR #43 theo QD25 (CI xanh), chuyển chờ test

## Bằng chứng
- `PGHOST=localhost PGUSER=postgres PGPASSWORD=postgres scripts/test-db.sh`: lần đầu (trước migration) 75 hỏng, đều của file 52; sau migration 1233 qua, 0 hỏng (một vòng). Phép thử làm hỏng lần đầu 4/6 đạt: hai test NT8, PQ17.CHU rỗng (lấy id bằng vai đã bị RLS chặn), sửa cho chặt; cuối 1234 qua, 0 hỏng.
- `scripts/thu-lam-hong.sh YC6.2`: 6 đạt, 0 không đạt. `npx supabase db reset`: qua. `scripts/bang-cot.sh`: đã ghi.
- `npx vitest run` 5 file mới: lần đầu 3 đỏ (nhãn ô bọc cả câu lỗi), sửa một vòng; toàn bộ 47 file, 508 test qua.
- `npm run typecheck`, `npm run build`, `npm run e2e` (3 qua), `python3 scripts/kiem.py --diff origin/main` (không có lỗi).
- e2e Supabase cả thư mục: 44 qua, nhưng chạy với bản nối tạm dịch vụ sale trong src/lib/dichVuCan.ts (không commit). Không có bản nối thì ds-sale.spec.ts đỏ.
