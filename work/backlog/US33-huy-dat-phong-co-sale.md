---
id: US33
tieu_de: "Hủy đặt phòng có sale"
loai: US
trang_thai: moi
thuc_hien: [YC5.8@1]
truoc: [EN1, EN2, EN3, EN4]
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
chưa có hình

## Quyền
PQ4, PQ7, PQ8, PQ9, PQ11, PQ17 và các test vi phạm ở mục "Ai được làm gì" của YC5-dat-phong.md thuộc mục này. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
Điền khi lập kế hoạch, theo cấu trúc thư mục EN1 ghi ở docs/dev/chay-va-test.md. Database chỉ thêm migration mới ở supabase/migrations/.

## Ngoài phạm vi
- Chỗ chưa quyết trong mục, chưa code tới khi Tùng trả lời: YC5-H17, YC5-H18, YC5-H14, YC5-H15, YC5-H16, YC5-H7.
- Phần đầu YC5-dat-phong.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC5.8 QT1 QT2 QT3.1 QT4 QT5.6 QT6.1 QT6.2 PQ4 PQ7 PQ8 PQ9 PQ11 PQ17
YC5-dat-phong.md#Quy tắc của nhóm
YC5-dat-phong.md#Ai được làm gì
YC5-dat-phong.md#Dữ liệu
YC5-dat-phong.md#Trạng thái màn (mọi mục)
thiet-ke-db.md#3. Bất biến (sai là hỏng sản phẩm)

## Test case
Kịch bản test tay: tests/kb/US33-huy-dat-phong-co-sale.md, chưa viết. Viết trước khi item sang san-sang (CL14.5a).

## Task
- [ ] US33-TA1 Thiết kế · Design: làm theo CL13 bảng "Màn phải làm". Xong thì Design tự thêm task kiểm cho Claude Code (CL13.3)
- [ ] US33-TA2 Code · Claude Code (opus, CL14.6a): viết trước test database cho YC5.8-NT1 đến NT6, kể cả test vi phạm quyền ở mục "Ai được làm gì". Task sau không sửa file test này (CL14.5)
- [ ] US33-TA3 Code · Claude Code (opus, CL14.6a): migration, hàm fn_*, policy cho tới khi test database xanh; thêm phép thử làm hỏng vào scripts/thu-lam-hong.sh nếu đổi quyền, tiền, chặn trùng
- [ ] US33-TA4 Code · Claude Code (sonnet, CL14.6a): màn chưa có hình theo canvas, test unit, e2e cho YC5.8-NT1, YC5.8-NT6
- [ ] US33-TA5 Test tay · Đức: chạy tests/kb/US33-huy-dat-phong-co-sale.md, chế độ nhanh rồi đủ. Rủi ro cao: chạy trên cả iPhone và Android, thử vi phạm quyền bằng tay (CL6.3).

## Kế hoạch

## Nhật ký
- 2026-11-18 · Claude · tạo item từ YC5.8@1 (QD21)

## Bằng chứng
