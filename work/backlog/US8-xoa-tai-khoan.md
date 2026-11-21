---
id: US8
tieu_de: "Xóa tài khoản"
loai: US
trang_thai: cho-test
thuc_hien: [YC1.8@3]
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
pr: 87
ngay_tao: 2026-11-18
---
## Mục tiêu
Là người dùng (chủ nhà hoặc sale), tôi làm được việc "Xóa tài khoản" đúng như YC1.8 mô tả.

## Vì sao sửa
Canvas bản PWA đã có P2 (nút xóa), P14, P14-01 (PR #10).

## Màn phải làm
| Màn | Loại | Đổi gì | Theo |
|---|---|---|---|
| P2, P14, P14-01 | đã vẽ | Không | YC1.8 |

## Làm tiêu chí nào
YC1.8-NT1 đến NT9

## Quy tắc, hành vi dùng
HV2, HV4, HV5, QT6.5

## Màn hình
P2, P14, P14-01

## Quyền
PQ1, PQ2, PQ6, PQ9, PQ11, PQ20, PQ23 và các test vi phạm ở mục "Ai được làm gì" của YC1-tai-khoan.md thuộc mục này. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
supabase/migrations/20261121010000_us8_xoa_tai_khoan.sql, tests/db/91_us8_xoa_tai_khoan.sql, src/man/P14XoaTaiKhoan.tsx, P2HoSo (mở P14), dichVuHoSo (xoaTaiKhoan), nối ở ManChu, ManSale; tests/e2e/supabase/xoa-tai-khoan.spec.ts.

## Ngoài phạm vi
- YC1-H8: Claude tự chốt 21/11 (QD25), chờ Tùng duyệt lại. YC1-H7 (chính sách quyền riêng tư) làm ở EN7.
- Phần đầu YC1-tai-khoan.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC1.8 HV2 HV4 HV5 QT6.5 PQ1 PQ2 PQ6 PQ9 PQ11 PQ20 PQ23
YC1-tai-khoan.md#Quy tắc của nhóm
YC1-tai-khoan.md#Ai được làm gì
YC1-tai-khoan.md#Dữ liệu
YC1-tai-khoan.md#Trạng thái màn (mọi mục)
thiet-ke-db.md#3. Bất biến (sai là hỏng sản phẩm)

## Test case
Kịch bản test tay: tests/kb/US8-xoa-tai-khoan.md (KB1 đến KB4).

## Task
- [x] US8-TA1 Thiết kế · Design: canvas bản PWA, PR #10
- [x] US8-TA2 Code · Claude Code (opus, CL14.6a): viết trước test database cho YC1.8-NT1, YC1.8-NT3, YC1.8-NT4, YC1.8-NT5, YC1.8-NT6, YC1.8-NT7, YC1.8-NT8, YC1.8-NT9, kể cả test vi phạm quyền ở mục "Ai được làm gì". Task sau không sửa file test này (CL14.5)
- [x] US8-TA3 Code · Claude Code (opus, CL14.6a): migration, hàm fn_*, policy cho tới khi test database xanh; thêm phép thử làm hỏng vào scripts/thu-lam-hong.sh nếu đổi quyền, tiền, chặn trùng
- [x] US8-TA4 Code · Claude Code (sonnet, CL14.6a): màn P2, P14, P14-01 theo canvas, test unit, e2e cho YC1.8-NT1, YC1.8-NT2, YC1.8-NT6, YC1.8-NT8
- [ ] US8-TA5 Test tay · Đức: chạy tests/kb/US8-xoa-tai-khoan.md, chế độ nhanh rồi đủ. Rủi ro cao: chạy trên cả iPhone và Android, thử vi phạm quyền bằng tay (CL6.3).

## Kế hoạch
fn_xoa_tai_khoan một giao dịch: bỏ số, ghi lúc xóa, báo sale đang kết nối ở phía chủ nhà. Trigger chặn đổi kết nối với sale đã xóa (NT9). P14 trong P2, bấm hai lần; xóa xong dùng luồng đăng xuất về A1.

## Nhật ký
- 2026-11-21 · Claude (tự chạy, QD25) · gộp PR #87 khi CI xanh, chuyển chờ test
- 2026-11-21 · Claude (tự chạy, QD25) · tự chốt YC1-H8; test database trước, fn_xoa_tai_khoan, trigger chặn đổi kết nối với sale đã xóa, màn P14, P14-01 · khoảng 35 phút
- 2026-11-18 · Claude · tạo item từ YC1.8@1 (QD21)
- 2026-11-19 · Claude · thuc_hien lên bản mới theo QD22
- 2026-11-19 · Claude · thuc_hien lên bản 3 theo canvas PWA (PR #10)

## Bằng chứng
- `CHI_FILE_CO_MA=1 scripts/test-db.sh YC1.8`: lần đầu 26 hỏng (chưa có hàm), sau migration 43 qua, 0 hỏng. Lọc YC6. 367 qua, KT-DB.3.9 30 qua (trigger mới không phá kết nối). `scripts/thu-lam-hong.sh YC1.8`: 3 đạt. vitest P14XoaTaiKhoan, P2HoSo: 14 qua. typecheck qua. e2e xoa-tai-khoan.spec.ts để CI chạy.
