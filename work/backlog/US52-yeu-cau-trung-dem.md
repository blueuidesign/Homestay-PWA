---
id: US52
tieu_de: "Yêu cầu trùng đêm"
loai: US
trang_thai: dang-lam
thuc_hien: [YC9.3@1]
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
Là chủ nhà, tôi làm được việc "Yêu cầu trùng đêm" đúng như YC9.3 mô tả.

## Làm tiêu chí nào
YC9.3-NT1 đến NT5

## Quy tắc, hành vi dùng
QT1.1, QT1.4, QT2.1, QT5.6, QT6.2

## Màn hình
CN1-03, CN9, CN9-02, S3-05

## Quyền
PQ2, PQ5, PQ7, PQ10, PQ11, PQ19 và các test vi phạm ở mục "Ai được làm gì" của YC9-yeu-cau-dat-phong.md thuộc mục này. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
Điền khi lập kế hoạch, theo cấu trúc thư mục EN1 ghi ở docs/dev/chay-va-test.md. Database chỉ thêm migration mới ở supabase/migrations/.

## Ngoài phạm vi
- Phần đầu YC9-yeu-cau-dat-phong.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC9.3 QT1.1 QT1.4 QT2.1 QT5.6 QT6.2 PQ2 PQ5 PQ7 PQ10 PQ11 PQ19 CN1-03 CN9 CN9-02 S3-05
YC9-yeu-cau-dat-phong.md#Quy tắc của nhóm
YC9-yeu-cau-dat-phong.md#Ai được làm gì
YC9-yeu-cau-dat-phong.md#Dữ liệu
YC9-yeu-cau-dat-phong.md#Trạng thái màn (mọi mục)
thiet-ke-db.md#3. Bất biến (sai là hỏng sản phẩm)

## Test case
Kịch bản test tay: tests/kb/US52-yeu-cau-trung-dem.md.

## Task
- [x] US52-TA1 Code · Claude Code (opus, CL14.6a): viết trước test database cho YC9.3-NT1 đến NT5, kể cả test vi phạm quyền ở mục "Ai được làm gì". Task sau không sửa file test này (CL14.5)
- [x] US52-TA2 Code · Claude Code (opus, CL14.6a): migration, hàm fn_*, policy cho tới khi test database xanh; thêm phép thử làm hỏng vào scripts/thu-lam-hong.sh nếu đổi quyền, tiền, chặn trùng
- [x] US52-TA3 Code · Claude Code (sonnet, CL14.6a): màn CN1-03, CN9, CN9-02, S3-05 theo canvas, test unit, e2e cho YC9.3-NT1
- [ ] US52-TA4 Test tay · Đức: chạy tests/kb/US52-yeu-cau-trung-dem.md, chế độ nhanh rồi đủ. Rủi ro cao: chạy trên cả iPhone và Android, thử vi phạm quyền bằng tay (CL6.3).

## Kế hoạch
- TA1: tests/db/68 cho NT1–NT5 và quyền; NT4 bằng hai phiên dblink (như tests/db/43), không có dblink thì chứng minh bằng ràng buộc chặn trùng.
- TA2: migration 20261119460000: cột tu_choi_vi_booking, trigger booking_bi_tu_choi_yeu_cau_trung (ghi và sửa đặt phòng) đặt lý do "Đã nhận đặt phòng khác", trường trung (đêm chồng) ở CN1-03, CN9, da_tu_choi_theo ở CN9-02.
- TA3: unit trước, rồi cảnh báo CN9, dòng thêm CN9-02, dấu data-trung ở CN1-03 (chữ nhãn US51 đã có), e2e yeu-cau-trung-dem.spec.ts.

## Nhật ký
- 2026-11-18 · Claude · tạo item từ YC9.3@1 (QD21)
- 2026-11-20 · Claude · TA1–TA3: test db, migration, CN9 cảnh báo trùng, CN9-02 dòng bị từ chối, e2e; chưa mở PR · NT4 đã xanh trước migration nhờ khóa căn của US51

## Bằng chứng
- TA1 `CHI_FILE_CO_MA=1 scripts/test-db.sh YC9.3`: lần đầu 17 đỏ (1 do test đọc kết quả dblink hai lần, sửa trong TA1), còn 16 đỏ trước migration. NT4 (hai phiên dblink thật: phiên B chờ khóa, sau commit A nhận Bị từ chối) xanh ngay vì khóa căn của US51.
- TA2 `scripts/test-db.sh`: 1 vòng, 2179 qua, 0 hỏng. `scripts/thu-lam-hong.sh YC9.3`: 4/4 đạt (bỏ trigger lý do; thêm tên sale vào thông báo; bỏ ràng buộc và trigger từ chối; thêm giá bán vào cờ trùng). `scripts/bang-cot.sh` đã chạy, `supabase db reset` qua.
- TA3 unit: lần đầu 7 đỏ, 2 vòng (1 sửa cách bấm trong test mới), cuối 65/65 ba file; `npx vitest run` 848 qua. e2e yeu-cau-trung-dem + tra-loi-yeu-cau: 3 qua lần đầu. Cả bộ tests/e2e/supabase: 53 qua, 17 hết giờ ở các file cuối (chạy cùng lúc thu-lam-hong.sh); chạy lại riêng 9 file đó: 17/17 qua. `scripts/thu-lam-hong.sh` cả bộ: 267/267 đạt. `kiem.py --diff origin/main`: không lỗi. `npm run typecheck`, `npm run build` qua.
