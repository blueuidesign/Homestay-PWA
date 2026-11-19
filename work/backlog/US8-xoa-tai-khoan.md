---
id: US8
tieu_de: "Xóa tài khoản"
loai: US
trang_thai: moi
thuc_hien: [YC1.8@2]
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
Là người dùng (chủ nhà hoặc sale), tôi làm được việc "Xóa tài khoản" đúng như YC1.8 mô tả.

## Vì sao sửa
Canvas chưa có hình cho phần "Xóa tài khoản" (YC1.8, dòng "Màn:" ghi "chưa có ([MỞ: YC1-H6])"). Không vẽ trước thì task Code phải tự đặt bố cục và chữ, dễ lệch với các màn khác và với YC.

## Màn phải làm
| Màn | Loại | Đổi gì | Theo |
|---|---|---|---|
| <mã mới, Design đặt theo CL13> | thêm | Màn và trạng thái cho các bước của YC1.8, chữ đúng như bảng bước | YC1.8 |

## Làm tiêu chí nào
YC1.8-NT1 đến NT9

## Quy tắc, hành vi dùng
HV2, HV4, HV5, QT6.5

## Màn hình
chưa có ([MỞ: YC1-H6])

## Quyền
PQ1, PQ2, PQ6, PQ9, PQ11, PQ20, PQ23 và các test vi phạm ở mục "Ai được làm gì" của YC1-tai-khoan.md thuộc mục này. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
Điền khi lập kế hoạch, theo cấu trúc thư mục EN1 ghi ở docs/dev/chay-va-test.md. Database chỉ thêm migration mới ở supabase/migrations/.

## Ngoài phạm vi
- Chỗ chưa quyết trong mục, chưa code tới khi Tùng trả lời: YC1-H6, YC1-H8, YC1-H7.
- Phần đầu YC1-tai-khoan.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC1.8 HV2 HV4 HV5 QT6.5 PQ1 PQ2 PQ6 PQ9 PQ11 PQ20 PQ23
YC1-tai-khoan.md#Quy tắc của nhóm
YC1-tai-khoan.md#Ai được làm gì
YC1-tai-khoan.md#Dữ liệu
YC1-tai-khoan.md#Trạng thái màn (mọi mục)
thiet-ke-db.md#3. Bất biến (sai là hỏng sản phẩm)

## Test case
Kịch bản test tay: tests/kb/US8-xoa-tai-khoan.md, chưa viết. Viết trước khi item sang san-sang (CL14.5a).

## Task
- [ ] US8-TA1 Thiết kế · Design: làm theo CL13 bảng "Màn phải làm". Xong thì Design tự thêm task kiểm cho Claude Code (CL13.3)
- [ ] US8-TA2 Code · Claude Code (opus, CL14.6a): viết trước test database cho YC1.8-NT1, YC1.8-NT3, YC1.8-NT4, YC1.8-NT5, YC1.8-NT6, YC1.8-NT7, YC1.8-NT8, YC1.8-NT9, kể cả test vi phạm quyền ở mục "Ai được làm gì". Task sau không sửa file test này (CL14.5)
- [ ] US8-TA3 Code · Claude Code (opus, CL14.6a): migration, hàm fn_*, policy cho tới khi test database xanh; thêm phép thử làm hỏng vào scripts/thu-lam-hong.sh nếu đổi quyền, tiền, chặn trùng
- [ ] US8-TA4 Code · Claude Code (sonnet, CL14.6a): màn chưa có ([MỞ: YC1-H6]) theo canvas, test unit, e2e cho YC1.8-NT1, YC1.8-NT2, YC1.8-NT6, YC1.8-NT8
- [ ] US8-TA5 Test tay · Đức: chạy tests/kb/US8-xoa-tai-khoan.md, chế độ nhanh rồi đủ. Rủi ro cao: chạy trên cả iPhone và Android, thử vi phạm quyền bằng tay (CL6.3).

## Kế hoạch

## Nhật ký
- 2026-11-18 · Claude · tạo item từ YC1.8@1 (QD21)
- 2026-11-19 · Claude · thuc_hien lên bản mới theo QD22

## Bằng chứng
