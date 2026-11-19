---
id: US26
tieu_de: "Mở form, chọn căn và ngày, kiểm trùng sớm"
loai: US
trang_thai: dang-lam
thuc_hien: [YC5.1@1]
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
Là chủ nhà, tôi làm được việc "Mở form, chọn căn và ngày, kiểm trùng sớm" đúng như YC5.1 mô tả.

## Làm tiêu chí nào
YC5.1-NT1 đến NT6; HV3-NT1, HV3-NT4 (hành vi chung gắn màn này, QD27)

## Quy tắc, hành vi dùng
QT1, QT1.1, QT2, QT3.1, QT4, QT5.6, QT6.1, QT6.2

## Màn hình
CN4, CN3

## Quyền
PQ4, PQ7, PQ8, PQ9, PQ11, PQ17 và các test vi phạm ở mục "Ai được làm gì" của YC5-dat-phong.md thuộc mục này. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
Theo ô "Được sửa" của work/goi/US26.md: src/man/CN4ThemDatPhong.{tsx,test.tsx,css}, src/lib/datPhong.{ts,test.ts}, src/lib/dichVuDatPhong.ts; sửa ManChu.tsx, dieuHuong.ts (+ test), CN1LichThang.tsx, CN3ChiTietNgay.tsx (+ ca test mới), dichVuCan.ts; supabase/migrations/20261119210000_us26_tao_booking.sql, supabase/bang-va-cot.md, scripts/thu-lam-hong.txt; tests/db/41_us26_tao_booking.sql, tests/e2e/supabase/them-dat-phong.spec.ts.

## Ngoài phạm vi
- Phần đầu YC5-dat-phong.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC5.1 QT1 QT1.1 QT2 QT3.1 QT4 QT5.6 QT6.1 QT6.2 PQ4 PQ7 PQ8 PQ9 PQ11 PQ17 CN4 CN3
YC5-dat-phong.md#Quy tắc của nhóm
YC5-dat-phong.md#Ai được làm gì
YC5-dat-phong.md#Dữ liệu
YC5-dat-phong.md#Trạng thái màn (mọi mục)
thiet-ke-db.md#3. Bất biến (sai là hỏng sản phẩm)

## Test case
Kịch bản test tay: tests/kb/US26-mo-form-chon-can-va.md.

## Task
- [ ] US26-TA1 Code · Claude Code (opus, CL14.6a): viết trước test database cho YC5.1-NT2, YC5.1-NT6, kể cả test vi phạm quyền ở mục "Ai được làm gì". Task sau không sửa file test này (CL14.5)
- [ ] US26-TA2 Code · Claude Code (opus, CL14.6a): migration, hàm fn_*, policy cho tới khi test database xanh; thêm phép thử làm hỏng vào scripts/thu-lam-hong.sh nếu đổi quyền, tiền, chặn trùng
- [ ] US26-TA3 Code · Claude Code (sonnet, CL14.6a): màn CN4, CN3 theo canvas, test unit, e2e cho YC5.1-NT1 đến NT4
- [ ] US26-TA4 Test tay · Đức: chạy tests/kb/US26-mo-form-chon-can-va.md, chế độ nhanh rồi đủ. Rủi ro cao: chạy trên cả iPhone và Android, thử vi phạm quyền bằng tay (CL6.3).

## Kế hoạch
1. TA1: tests/db/41 (YC5.1-NT2, NT6, vi phạm PQ7 của Anh Tuấn, Sale Hùng, người chưa đăng nhập, căn ẩn, căn tự nhập), chạy đỏ.
2. TA2: migration fn_tao_booking (kiểm căn, ngày, tiền > 0, mã lần gửi; đặt phòng và tiền từng đêm ghi một câu lệnh; khách lẻ tạm), cột ghi_chu; 5 phép thử làm hỏng.
3. TA3: datPhong.ts (số đêm, đêm trống đầu, dòng kiểm, nháp HV3), CN4, nối CN1, CN3, ManChu; unit, e2e YC5.1-NT5.

## Nhật ký
- 2026-11-19 · Claude · viết tests/kb, soạn gói việc, sang dang-lam
- 2026-11-18 · Claude · tạo item từ YC5.1@1 (QD21)
- 2026-11-19 · Claude · nhận HV3-NT1, HV3-NT4 từ EN4 (QD27)
- 2026-11-19 · Claude · TA1, TA2, TA3 code xong trên nhánh US26-form-dat-phong · e2e lich-thang YC2.1-NT6 cũ đỏ vì CN1 nay mở CN4 (file ngoài phạm vi)

## Bằng chứng
- `scripts/test-db.sh` (Postgres 16): lần đầu 18 hỏng + 1 file lỗi (chưa có hàm); vòng 2 còn 3 hỏng (tiền từng đêm khi ràng buộc chạy ngay, sửa ghi một câu lệnh); vòng 3: 740 qua, 0 hỏng.
- `scripts/thu-lam-hong.sh`: 101 đạt, 0 không đạt (5 phép mới của YC5.1; 2 phép đầu "vẫn xanh" vì file lỗi, sửa test dùng t.gt).
- `npx vitest run`: CN4 test chạy đầu đỏ (chưa có màn), sau 1 vòng: 37 file, 339 test qua. `npm run typecheck`, `npm run build` qua.
- `E2E_SUPABASE=1 CI=1 npx playwright test`: 31 qua, 1 đỏ: lich-thang.spec.ts YC2.1-NT6 còn chờ toast "Sẽ có ở bản sau" khi bấm "Đặt phòng" (nay mở CN4); file ngoài "Được sửa", chưa sửa. them-dat-phong.spec.ts (YC5.1-NT5) qua.
- `python3 scripts/kiem.py --diff origin/main`: không có lỗi.
