---
id: US35
tieu_de: "Xin tên và số điện thoại khi bắt đầu kết nối"
loai: US
trang_thai: moi
thuc_hien: [YC6.1@1]
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
Là người dùng (chủ nhà hoặc sale), tôi làm được việc "Xin tên và số điện thoại khi bắt đầu kết nối" đúng như YC6.1 mô tả.

## Vì sao sửa
Canvas chưa có hình cho phần "Xin tên và số điện thoại khi bắt đầu kết nối" (YC6.1, dòng "Màn:" ghi "A6-P1, A8-P1, CN10-P1 (các màn khác dùng cùng popup, chưa vẽ)"). Không vẽ trước thì task Code phải tự đặt bố cục và chữ, dễ lệch với các màn khác và với YC.

## Màn phải làm
| Màn | Loại | Đổi gì | Theo |
|---|---|---|---|
| <mã mới, Design đặt theo CL13> | thêm | Màn và trạng thái cho các bước của YC6.1, chữ đúng như bảng bước | YC6.1 |

## Làm tiêu chí nào
YC6.1-NT1 đến NT5

## Quy tắc, hành vi dùng
Không có.

## Màn hình
A6-P1, A8-P1, CN10-P1 (các màn khác dùng cùng popup, chưa vẽ)

## Quyền
PQ1, PQ2, PQ4, PQ17, PQ18, PQ23 và các test vi phạm ở mục "Ai được làm gì" của YC6-ket-noi-sale.md thuộc mục này. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
Điền khi lập kế hoạch, theo cấu trúc thư mục EN1 ghi ở docs/dev/chay-va-test.md. Database chỉ thêm migration mới ở supabase/migrations/.

## Ngoài phạm vi
- Chỗ chưa quyết trong mục, chưa code tới khi Tùng trả lời: QD22.
- Phần đầu YC6-ket-noi-sale.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC6.1 PQ1 PQ2 PQ4 PQ17 PQ18 PQ23 A6-P1 A8-P1
YC6-ket-noi-sale.md#Quy tắc của nhóm
YC6-ket-noi-sale.md#Ai được làm gì
YC6-ket-noi-sale.md#Dữ liệu
YC6-ket-noi-sale.md#Trạng thái màn (mọi mục)

## Test case
Kịch bản test tay: tests/kb/US35-xin-ten-va-so-dien.md, chưa viết. Viết trước khi item sang san-sang (CL14.5a).

## Task
- [ ] US35-TA1 Thiết kế · Design: làm theo CL13 bảng "Màn phải làm". Xong thì Design tự thêm task kiểm cho Claude Code (CL13.3)
- [ ] US35-TA2 Code · Claude Code (opus, CL14.6a): màn A6-P1, A8-P1, CN10-P1 (các màn khác dùng cùng popup, chưa vẽ) theo canvas, test unit, e2e cho YC6.1-NT1 đến NT5
- [ ] US35-TA3 Test tay · Đức: chạy tests/kb/US35-xin-ten-va-so-dien.md, chế độ nhanh rồi đủ. Rủi ro cao: chạy trên cả iPhone và Android, thử vi phạm quyền bằng tay (CL6.3).

## Kế hoạch

## Nhật ký
- 2026-11-18 · Claude · tạo item từ YC6.1@1 (QD21)

## Bằng chứng
