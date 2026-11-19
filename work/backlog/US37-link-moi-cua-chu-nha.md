---
id: US37
tieu_de: "Link mời của chủ nhà và sale thêm lịch"
loai: US
trang_thai: dang-lam
thuc_hien: [YC6.3@2]
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
Là chủ nhà, tôi làm được việc "Link mời của chủ nhà và sale thêm lịch" đúng như YC6.3 mô tả.

## Làm tiêu chí nào
YC6.3-NT1 đến NT10

## Quy tắc, hành vi dùng
Không có.

## Màn hình
CN7, A1-link, A1-link-01, A10, A10-01, A10-02

## Quyền
PQ1, PQ2, PQ4, PQ17, PQ18, PQ23 và các test vi phạm ở mục "Ai được làm gì" của YC6-ket-noi-sale.md thuộc mục này. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
supabase/migrations/20261119320000_us37_link_moi.sql, tests/db/53_us37_link_moi.sql, scripts/thu-lam-hong.txt, supabase/bang-va-cot.md; src/man/A1Link.tsx, A10ThemLich.tsx (+ test, css), CN7DanhSachSale.tsx (+ test), src/App.tsx (+ test), src/lib/dieuHuong.ts (+ test), src/lib/dichVuLinkMoi.ts (+ test), dichVuSale.ts, dichVuCan.ts; tests/e2e/supabase/link-moi.spec.ts, hoTro.ts.

## Ngoài phạm vi
- YC6-H14, H15, H5, H10, H3, H6 đã Claude tự chốt (QD25), ghi ở YC6.3 r6.
- Phần đầu YC6-ket-noi-sale.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC6.3 PQ1 PQ2 PQ4 PQ17 PQ18 PQ23 CN7 A1-link A1-link-01 A10 A10-01 A10-02
YC6-ket-noi-sale.md#Quy tắc của nhóm
YC6-ket-noi-sale.md#Ai được làm gì
YC6-ket-noi-sale.md#Dữ liệu
YC6-ket-noi-sale.md#Trạng thái màn (mọi mục)
thiet-ke-db.md#3. Bất biến (sai là hỏng sản phẩm)

## Test case
Kịch bản test tay: tests/kb/US37-link-moi-cua-chu-nha.md.

## Task
- [x] US37-TA1 Code · test database tests/db/53_us37_link_moi.sql · nhánh US37-link-moi
- [x] US37-TA2 Code · migration 20261119320000_us37_link_moi.sql, 6 phép thử làm hỏng · nhánh US37-link-moi
- [x] US37-TA3 Code · A1-link, A1-link-01, A10, A10-01, A10-02, CN7 link mời; unit, e2e · nhánh US37-link-moi
- [ ] US37-TA4 Test tay · Đức: chạy tests/kb/US37-link-moi-cua-chu-nha.md, chế độ nhanh rồi đủ. Rủi ro cao: chạy trên cả iPhone và Android, thử vi phạm quyền bằng tay (CL6.3).

## Kế hoạch
- TA1: tests/db/53 theo hợp đồng fn_lay_link_moi() (chủ nhà; lấy link còn hạn hay tạo mới, tăng số lần gửi), fn_doi_link_moi() (thu hồi), fn_xem_link_moi(ma) (anon + authenticated, jsonb không giá, cờ da_them, cua_minh, sai_vai; 30 lần/phút theo x-forwarded-for), fn_them_lich_link_moi(ma); ảnh xem trước qua policy kho theo header x-link-moi.
- TA2: migration, bảng đếm xem_link_dem, hàm rieng.anh_cua_link_moi cho policy kho; thêm dòng thu-lam-hong.
- TA3: dichVuLinkMoi, A1-link, A1-link-01, A10, A10-01, toast A10-02; App tự chọn vai sale khi vào từ link (không qua A3); CN7 nối chia sẻ, sao chép, "Đổi link mời"; unit, e2e.

## Nhật ký
- 2026-11-18 · Claude · tạo item từ YC6.3@1 (QD21)
- 2026-11-19 · Claude · thuc_hien lên bản mới theo QD22
- 2026-11-19 · Claude · tự chốt YC6-H14, H15, H5, H10, H3, H6 (QD25, YC6 r6, thêm NT9, NT10); viết kịch bản test tay; giao agent code
- 2026-11-19 · Claude (agent code) · TA1–TA3 trên nhánh US37-link-moi, chưa mở PR · ảnh xem trước cần policy kho theo header x-link-moi · ~2 giờ

## Bằng chứng
- DB: `scripts/test-db.sh` trước migration 56 hỏng (đúng ý); sau migration 1 vòng: 1361 qua, 0 hỏng. `scripts/thu-lam-hong.sh YC6.3`: 6/6 đạt. `scripts/bang-cot.sh` đã chạy.
- Unit: CN7 link mời lần đầu 5 đỏ, App 3 đỏ; sau code 1 vòng sửa (A1-link khi chưa tải được, để test cũ YC1.2-NT1 xanh): `npx vitest run` 540 qua.
- e2e: `E2E_SUPABASE=1 CI=1 npx playwright test tests/e2e/supabase`: link-moi lần đầu 3/4 (NT10 đi trang trước khi đăng nhập xong, sửa test), cả thư mục 50 qua.
- `npm run typecheck`, `npm run build` qua; `python3 scripts/kiem.py --diff origin/main`: không có lỗi.
