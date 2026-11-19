---
id: US36
tieu_de: "Danh sách sale của chủ nhà"
loai: US
trang_thai: dang-lam
thuc_hien: [YC6.2@1]
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
Là chủ nhà, tôi làm được việc "Danh sách sale của chủ nhà" đúng như YC6.2 mô tả.

## Làm tiêu chí nào
YC6.2-NT1 đến NT9

## Quy tắc, hành vi dùng
Không có.

## Màn hình
CN7, CN7-00, CN7-04, CN7-05

## Quyền
PQ1, PQ2, PQ4, PQ17, PQ18, PQ23 và các test vi phạm ở mục "Ai được làm gì" của YC6-ket-noi-sale.md thuộc mục này. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
Điền khi lập kế hoạch, theo cấu trúc thư mục EN1 ghi ở docs/dev/chay-va-test.md. Database chỉ thêm migration mới ở supabase/migrations/.

## Ngoài phạm vi
- YC6-H13, H11, H16, H1, H4 đã Claude tự chốt (QD25), ghi ở YC6.2 r5.
- Phần đầu YC6-ket-noi-sale.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC6.2 PQ1 PQ2 PQ4 PQ17 PQ18 PQ23 CN7 CN7-00 CN7-04 CN7-05
YC6-ket-noi-sale.md#Quy tắc của nhóm
YC6-ket-noi-sale.md#Ai được làm gì
YC6-ket-noi-sale.md#Dữ liệu
YC6-ket-noi-sale.md#Trạng thái màn (mọi mục)
thiet-ke-db.md#3. Bất biến (sai là hỏng sản phẩm)

## Test case
Kịch bản test tay: tests/kb/US36-danh-sach-sale-cua-chu.md.

## Task
- [ ] US36-TA1 Code · Claude Code (opus, CL14.6a): viết trước test database cho YC6.2-NT1, YC6.2-NT3, YC6.2-NT4, YC6.2-NT5, YC6.2-NT6, YC6.2-NT7, YC6.2-NT8, YC6.2-NT9, kể cả test vi phạm quyền ở mục "Ai được làm gì". Task sau không sửa file test này (CL14.5)
- [ ] US36-TA2 Code · Claude Code (opus, CL14.6a): migration, hàm fn_*, policy cho tới khi test database xanh; thêm phép thử làm hỏng vào scripts/thu-lam-hong.sh nếu đổi quyền, tiền, chặn trùng
- [ ] US36-TA3 Code · Claude Code (sonnet, CL14.6a): màn CN7, CN7-00, CN7-04, CN7-05 theo canvas, test unit, e2e cho YC6.2-NT1, YC6.2-NT2, YC6.2-NT3, YC6.2-NT7, YC6.2-NT8, YC6.2-NT9
- [ ] US36-TA4 Test tay · Đức: chạy tests/kb/US36-danh-sach-sale-cua-chu.md, chế độ nhanh rồi đủ. Rủi ro cao: chạy trên cả iPhone và Android, thử vi phạm quyền bằng tay (CL6.3).

## Kế hoạch

## Nhật ký
- 2026-11-18 · Claude · tạo item từ YC6.2@1 (QD21)
- 2026-11-19 · Claude · tự chốt YC6-H13, H11, H16, H1, H4 (QD25, YC6 r5, thêm NT8, NT9); viết kịch bản test tay; giao agent code

## Bằng chứng
