---
id: US11
tieu_de: "Doanh thu tháng"
loai: US
trang_thai: cho-test
thuc_hien: [YC2.3@1]
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
pr: [38]
ngay_tao: 2026-11-18
---
## Mục tiêu
Là chủ nhà, tôi làm được việc "Doanh thu tháng" đúng như YC2.3 mô tả.

## Làm tiêu chí nào
YC2.3-NT1, YC2.3-NT2

## Quy tắc, hành vi dùng
QT2, QT6.1

## Màn hình
CN1, CN1-02

## Quyền
PQ4, PQ7, PQ8, PQ9, PQ16 và các test vi phạm ở mục "Ai được làm gì" của YC2-lich-chu-nha.md thuộc mục này. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
Điền khi lập kế hoạch, theo cấu trúc thư mục EN1 ghi ở docs/dev/chay-va-test.md. Database chỉ thêm migration mới ở supabase/migrations/.

## Ngoài phạm vi
- Phần đầu YC2-lich-chu-nha.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC2.3 QT2 QT6.1 PQ4 PQ7 PQ8 PQ9 PQ16 CN1 CN1-02
YC2-lich-chu-nha.md#Quy tắc của nhóm
YC2-lich-chu-nha.md#Ai được làm gì
YC2-lich-chu-nha.md#Dữ liệu
YC2-lich-chu-nha.md#Trạng thái màn (mọi mục)
thiet-ke-db.md#3. Bất biến (sai là hỏng sản phẩm)

## Test case
Kịch bản test tay: tests/kb/US11-doanh-thu-thang.md.

## Task
- [x] US11-TA1 Code · Claude Code (opus, CL14.6a): viết trước test database cho YC2.3-NT1, kể cả test vi phạm quyền ở mục "Ai được làm gì". Task sau không sửa file test này (CL14.5) · PR #38
- [x] US11-TA2 Code · Claude Code (opus, CL14.6a): migration, hàm fn_*, policy cho tới khi test database xanh; thêm phép thử làm hỏng vào scripts/thu-lam-hong.sh nếu đổi quyền, tiền, chặn trùng · PR #38
- [x] US11-TA3 Code · Claude Code (sonnet, CL14.6a): màn CN1, CN1-02 theo canvas, test unit, e2e cho YC2.3-NT1, YC2.3-NT2 · PR #38
- [ ] US11-TA4 Test tay · Đức: chạy tests/kb/US11-doanh-thu-thang.md, chế độ nhanh rồi đủ. Rủi ro cao: chạy trên cả iPhone và Android, thử vi phạm quyền bằng tay (CL6.3).

## Kế hoạch
- TA1: tests/db/48_us11_doanh_thu_thang.sql (DLM.4 + tháng 9 riêng 9.600.000đ, booking đã hủy, căn ẩn, B9 vắt tháng, chủ khác, sale, chưa đăng nhập). Chạy thấy đỏ.
- TA2: supabase/migrations/20261119270000_us11_doanh_thu_thang.sql: `fn_doanh_thu_thang(p_thang date)` security definer trả một dòng (doanh_thu, so_dem, doanh_thu_thang_truoc) từ booking_dem của căn có lịch người gọi giữ (kể cả đã ẩn), bỏ da_huy. Số đêm có khách = số đêm-căn (dòng booking_dem), khớp DLM.5 (7 + 6 = 13). Phép thử làm hỏng vào scripts/thu-lam-hong.txt; cập nhật supabase/bang-va-cot.md.
- TA3: dichVuLich.layThang đọc thêm doanh thu tháng (một lần gọi khi đổi tháng); lich.ts hàm viết dòng nhỏ; CN1 khối "Doanh thu tháng N" dưới lưới (hh-stat theo canvas), ẩn khi tháng không có đêm có khách; không đổi theo chip (YC2-H1). Unit + e2e.

## Nhật ký
- 2026-11-18 · Claude · tạo item từ YC2.3@1 (QD21)
- 2026-11-19 · Claude · TA1, TA2, TA3 code trên nhánh US11-doanh-thu-thang; test DB, e2e chưa chạy được (máy không có Postgres, Docker)
- 2026-11-19 · Claude · bật lại DB trên máy, sửa dựng dữ liệu hủy B1 theo QD12, gộp PR #38 theo QD25 · 1039 test DB, 422 unit, 37 e2e xanh

## Bằng chứng
- Unit `npx vitest run`: lần đầu xanh 45/45 ở hai file đổi (test viết cùng code TA3), cả bộ 422 qua. `npm run typecheck` (1 vòng sửa kiểu trong test), `npm run build` qua. `python3 scripts/kiem.py --diff origin/main`: không có lỗi.
- Chưa chạy: `scripts/test-db.sh`, `scripts/thu-lam-hong.sh YC2.3`, `scripts/bang-cot.sh`, e2e tests/e2e/supabase. Postgres ở localhost:5432 và Docker (Supabase) đều tắt trong phiên, không được phép bật. supabase/bang-va-cot.md chưa sinh lại.
