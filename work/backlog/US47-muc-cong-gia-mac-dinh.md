---
id: US47
tieu_de: "Mức cộng giá mặc định"
loai: US
trang_thai: dang-lam
thuc_hien: [YC7.5@1]
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
Là sale, tôi làm được việc "Mức cộng giá mặc định" đúng như YC7.5 mô tả.

## Làm tiêu chí nào
YC7.5-NT1 đến NT6

## Quy tắc, hành vi dùng
QT1.3, QT2.1, QT3.1, QT5.4, QT6.4

## Màn hình
P10

## Quyền
PQ2, PQ3, PQ4, PQ5, PQ6, PQ11, PQ13, PQ14, PQ23 và các test vi phạm ở mục "Ai được làm gì" của YC7-lich-va-tim-phong-cua-sale.md thuộc mục này. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
Điền khi lập kế hoạch, theo cấu trúc thư mục EN1 ghi ở docs/dev/chay-va-test.md. Database chỉ thêm migration mới ở supabase/migrations/.

## Ngoài phạm vi
- YC7-H10, H11 đã Claude tự chốt (QD25, YC7 r6).
- Tab Cá nhân của sale chưa đầy đủ (YC1): US47 chỉ thêm dòng "Mức cộng giá mặc định" vào tab Cá nhân hiện có.
- Phần đầu YC7-lich-va-tim-phong-cua-sale.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC7.5 QT1.3 QT2.1 QT3.1 QT5.4 QT6.4 PQ2 PQ3 PQ4 PQ5 PQ6 PQ11 PQ13 PQ14 PQ23 P10
YC7-lich-va-tim-phong-cua-sale.md#Quy tắc của nhóm
YC7-lich-va-tim-phong-cua-sale.md#Ai được làm gì
YC7-lich-va-tim-phong-cua-sale.md#Dữ liệu
YC7-lich-va-tim-phong-cua-sale.md#Trạng thái màn (mọi mục)
thiet-ke-db.md#3. Bất biến (sai là hỏng sản phẩm)

## Test case
Kịch bản test tay: tests/kb/US47-muc-cong-gia-mac-dinh.md.

## Task
- [x] US47-TA1 Code: tests/db/63_us47_muc_cong_mac_dinh.sql (nhánh US47-muc-cong-mac-dinh)
- [x] US47-TA2 Code: migration 20261119410000, 6 phép thử làm hỏng (nhánh US47-muc-cong-mac-dinh)
- [x] US47-TA3 Code · Claude Code (sonnet, CL14.6a): màn P10 theo canvas, test unit, e2e cho YC7.5-NT1, YC7.5-NT2, YC7.5-NT5
- [ ] US47-TA4 Test tay · Đức: chạy tests/kb/US47-muc-cong-gia-mac-dinh.md, chế độ nhanh rồi đủ. Rủi ro cao: chạy trên cả iPhone và Android, thử vi phạm quyền bằng tay (CL6.3).

## Kế hoạch
- TA1: test database fn_muc_cong_mac_dinh() (jsonb của chính người gọi), fn_dat_muc_cong_mac_dinh(p_muc, p_lam_tron), check bảng 0–5.000.000đ.
- TA2: migration thêm check, hai hàm security definer dùng can_la_sale(); phép thử làm hỏng cho trần, số âm, check bảng, chủ nhà, ghi lẫn sale, cờ làm tròn.
- TA3: src/lib/mucCong.ts (bộ chip, giá bán đêm, ô nghìn đồng, ví dụ 1.100.000đ × 2), S3 dùng lại qua chiTietCanSale.ts; P10, dòng ở tab Cá nhân, e2e.

## Nhật ký
- 2026-11-18 · Claude · tạo item từ YC7.5@1 (QD21)
- 2026-11-19 · Claude (QD25) · tự chốt YC7-H10, H11 (YC7 r6, thêm NT6); viết kịch bản test tay
- 2026-11-19 · Claude · TA1, TA2 xong; TA3 code xong, chờ nối src/lib/dichVuCan.ts (ngoài Được sửa) · chưa PR
- 2026-11-19 · Claude (QD25) · nối dịch vụ mức cộng vào src/lib/dichVuCan.ts, gộp main (US46); test lại đủ

## Bằng chứng
- TA1 `CHI_FILE_CO_MA=1 scripts/test-db.sh YC7.5`: lần đầu 38 đỏ, 10 xanh (danh mục quyền đã có). TA2 xanh vòng đầu: 48/48; cả bộ `scripts/test-db.sh` 1854 qua, 0 hỏng.
- `scripts/thu-lam-hong.sh YC7.5`: 6 đạt, 0 không đạt. `scripts/bang-cot.sh` đã chạy.
- TA3 unit viết trước: 2 test ManSale đỏ, 2 file chưa có module; sửa 1 vòng (nhãn ô Tùy chọn). `npx vitest run`: 743 qua.
- e2e muc-cong-mac-dinh.spec.ts: 3 vòng sửa chính test (500.000đ, toast có dấu ✓, 'true'); xanh khi nối tạm dichVuCan.ts, cả bộ 64 qua. Không nối thì spec này đỏ.
- `npm run typecheck`, `npm run build` qua; `python3 scripts/kiem.py --diff origin/main` không lỗi.
