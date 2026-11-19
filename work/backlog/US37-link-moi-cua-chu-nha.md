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
Điền khi lập kế hoạch, theo cấu trúc thư mục EN1 ghi ở docs/dev/chay-va-test.md. Database chỉ thêm migration mới ở supabase/migrations/.

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
- [ ] US37-TA1 Code · Claude Code (opus, CL14.6a): viết trước test database cho YC6.3-NT2 đến NT10, kể cả test vi phạm quyền ở mục "Ai được làm gì". Task sau không sửa file test này (CL14.5)
- [ ] US37-TA2 Code · Claude Code (opus, CL14.6a): migration, hàm fn_*, policy cho tới khi test database xanh; thêm phép thử làm hỏng vào scripts/thu-lam-hong.sh nếu đổi quyền, tiền, chặn trùng
- [ ] US37-TA3 Code · Claude Code (sonnet, CL14.6a): màn CN7, A1-link, A1-link-01, A10, A10-01, A10-02 theo canvas, test unit, e2e cho YC6.3-NT1, YC6.3-NT2, YC6.3-NT4, YC6.3-NT5, YC6.3-NT9, YC6.3-NT10
- [ ] US37-TA4 Test tay · Đức: chạy tests/kb/US37-link-moi-cua-chu-nha.md, chế độ nhanh rồi đủ. Rủi ro cao: chạy trên cả iPhone và Android, thử vi phạm quyền bằng tay (CL6.3).

## Kế hoạch

## Nhật ký
- 2026-11-18 · Claude · tạo item từ YC6.3@1 (QD21)
- 2026-11-19 · Claude · thuc_hien lên bản mới theo QD22
- 2026-11-19 · Claude · tự chốt YC6-H14, H15, H5, H10, H3, H6 (QD25, YC6 r6, thêm NT9, NT10); viết kịch bản test tay; giao agent code

## Bằng chứng
