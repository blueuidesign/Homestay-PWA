---
id: US33
tieu_de: "Hủy đặt phòng có sale"
loai: US
trang_thai: cho-test
thuc_hien: [YC5.8@1]
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
pr: [73]
ngay_tao: 2026-11-18
---
## Mục tiêu
Là chủ nhà, tôi làm được việc "Hủy đặt phòng có sale" đúng như YC5.8 mô tả.

## Vì sao sửa
Canvas chưa có hình cho phần "Hủy đặt phòng có sale" (YC5.8, dòng "Màn:" ghi "chưa có hình"). Không vẽ trước thì task Code phải tự đặt bố cục và chữ, dễ lệch với các màn khác và với YC.

## Màn phải làm
| Màn | Loại | Đổi gì | Theo |
|---|---|---|---|
| <mã mới, Design đặt theo CL13> | thêm | Màn và trạng thái cho các bước của YC5.8, chữ đúng như bảng bước | YC5.8 |

## Làm tiêu chí nào
YC5.8-NT1 đến NT6

## Quy tắc, hành vi dùng
QT1, QT2, QT3.1, QT4, QT5.6, QT6.1, QT6.2

## Màn hình
CN3-02 (chủ nhà), S3-10 (sale): khối hủy ở cuối chi tiết đặt phòng (YC5-H17 Claude tự chốt).

## Quyền
PQ4, PQ7, PQ8, PQ9, PQ11, PQ17 và các test vi phạm ở mục "Ai được làm gì" của YC5-dat-phong.md thuộc mục này. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
supabase/migrations/20261120130000_us33_huy_dat_phong_co_sale.sql, tests/db/79_us33_huy_dat_phong_co_sale.sql, scripts/thu-lam-hong.txt, src/lib/huyDatPhong.ts, src/lib/dichVuHuyDatPhong.ts, src/lib/dichVuDatPhong.ts, src/lib/dichVuDatPhongSale.ts, src/man/KhoiHuyDatPhong.tsx (+css, test), src/man/CN302ChiTietDatPhong.tsx, src/man/S310DatPhongSale.tsx, tests/e2e/supabase/huy-dat-phong-co-sale.spec.ts, tests/kb/US33-huy-dat-phong-co-sale.md, YC5 r7, work/cau-hoi.md.

## Ngoài phạm vi
- YC5-H17 Claude tự chốt 20/11 (QD25), ghi ở YC5 r7.
- Còn mở, làm theo câu "database đang cho" của YC5.8, không thêm luật: YC5-H18 (không hết hạn), YC5-H14, YC5-H15, YC5-H16, YC5-H7.
- Mở thông báo xin hủy, trả lời xin hủy ra chi tiết đặt phòng: YC12.
- Phần đầu YC5-dat-phong.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC5.8 QT1 QT2 QT3.1 QT4 QT5.6 QT6.1 QT6.2 PQ4 PQ7 PQ8 PQ9 PQ11 PQ17
YC5-dat-phong.md#Quy tắc của nhóm
YC5-dat-phong.md#Ai được làm gì
YC5-dat-phong.md#Dữ liệu
YC5-dat-phong.md#Trạng thái màn (mọi mục)
thiet-ke-db.md#3. Bất biến (sai là hỏng sản phẩm)

## Test case
Kịch bản test tay: tests/kb/US33-huy-dat-phong-co-sale.md (KB1 đến KB3).

## Task
- [x] US33-TA1 Thiết kế · Design: không vẽ thêm, khối hủy theo khung hộp xóa của CN3-02 (YC5-H17 Claude tự chốt, QD25)
- [x] US33-TA2 Code · Claude Code (opus, CL14.6a): viết trước test database cho YC5.8-NT1 đến NT6, kể cả test vi phạm quyền ở mục "Ai được làm gì". Task sau không sửa file test này (CL14.5)
- [x] US33-TA3 Code · Claude Code (opus, CL14.6a): migration, hàm fn_*, policy cho tới khi test database xanh; thêm phép thử làm hỏng vào scripts/thu-lam-hong.sh nếu đổi quyền, tiền, chặn trùng
- [x] US33-TA4 Code · Claude Code (sonnet, CL14.6a): màn chưa có hình theo canvas, test unit, e2e cho YC5.8-NT1, YC5.8-NT6
- [ ] US33-TA5 Test tay · Đức: chạy tests/kb/US33-huy-dat-phong-co-sale.md, chế độ nhanh rồi đủ. Rủi ro cao: chạy trên cả iPhone và Android, thử vi phạm quyền bằng tay (CL6.3).

## Kế hoạch
Database: fn_xin_huy, fn_tra_loi_huy, fn_tinh_trang_huy (chủ nhà giữ căn hoặc sale đứng tên; trigger tg_booking_huy_hai_ben của EN2 vẫn chặn ghi thẳng), thông báo xin_huy, tra_loi_huy. Màn: KhoiHuyDatPhong dùng chung ở CN3-02 và S3-10.

## Nhật ký
- 2026-11-18 · Claude · tạo item từ YC5.8@1 (QD21)
- 2026-11-20 · Claude (QD25) · database xin hủy, trả lời xin hủy; khối hủy ở CN3-02, S3-10; tự chốt YC5-H17 · PR mở · ~1,5 giờ
- 2026-11-20 · Claude (QD25) · Gộp PR #73, CI xanh 4/4 (vòng 1 đỏ: quên sinh lại bảng cột, e2e mở thẳng đường dẫn trước khi đăng nhập xong; sửa 2 vòng); chờ test; migration 20261120130000 gửi thread staging.

## Bằng chứng
- `CHI_FILE_CO_MA=1 scripts/test-db.sh YC5.8`: lần đầu 4 hỏng do test gọi sai vai (đọc bảng khi đang đăng nhập), sửa 1 vòng, cuối 53 qua, 0 hỏng.
- `scripts/thu-lam-hong.sh YC5.8`: lần đầu 6/7 (phép thử NT4 bị trigger EN2 chặn tiếp, thêm tắt trigger), cuối 7/7 đạt.
- `npx vitest run src/man/KhoiHuyDatPhong.test.tsx src/man/CN302ChiTietDatPhong.test.tsx src/man/S310DatPhongSale.test.tsx`: 45 qua. typecheck, kiem.py sạch. e2e huy-dat-phong-co-sale.spec.ts chạy ở CI.
