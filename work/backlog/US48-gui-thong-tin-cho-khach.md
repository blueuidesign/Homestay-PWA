---
id: US48
tieu_de: "Gửi thông tin cho khách"
loai: US
trang_thai: dang-lam
thuc_hien: [YC8.1@2]
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
Là sale, tôi làm được việc "Gửi thông tin cho khách" đúng như YC8.1 mô tả.

## Làm tiêu chí nào
YC8.1-NT1 đến NT16; HV6-NT2 (hành vi chung gắn màn này, QD27)

## Quy tắc, hành vi dùng
Không có.

## Màn hình
S5

## Quyền
PQ3, PQ5, PQ11, PQ12, PQ14, PQ19 và các test vi phạm ở mục "Ai được làm gì" của YC8-gui-khach.md thuộc mục này. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
Điền khi lập kế hoạch, theo cấu trúc thư mục EN1 ghi ở docs/dev/chay-va-test.md. Database chỉ thêm migration mới ở supabase/migrations/.

## Ngoài phạm vi
- YC8-H1, H2, H3, H4, H6, H7 đã Claude tự chốt (QD25, YC8 r4).
- Mẫu tin (P11, sửa mẫu): US49. US48 dùng mẫu mặc định (YC8 quy tắc Mẫu tin gửi khách, r5) cho "Sao chép chữ cả N căn".
- Danh sách thông báo, công tắc tắt loại thông báo: YC12. US48 chỉ ghi dòng thông báo ở database.
- Phần đầu YC8-gui-khach.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC8.1 PQ3 PQ5 PQ11 PQ12 PQ14 PQ19 S5
YC8-gui-khach.md#Quy tắc của nhóm
YC8-gui-khach.md#Ai được làm gì
YC8-gui-khach.md#Dữ liệu
YC8-gui-khach.md#Trạng thái màn (mọi mục)
thiet-ke-db.md#3. Bất biến (sai là hỏng sản phẩm)

## Test case
Kịch bản test tay: tests/kb/US48-gui-thong-tin-cho-khach.md.

## Task
- [ ] US48-TA1 Code · Claude Code (opus, CL14.6a): viết trước test database cho YC8.1-NT2, YC8.1-NT4, YC8.1-NT6, YC8.1-NT7, YC8.1-NT8, YC8.1-NT9, YC8.1-NT10, YC8.1-NT11, YC8.1-NT12, YC8.1-NT13, YC8.1-NT14, YC8.1-NT16, kể cả test vi phạm quyền ở mục "Ai được làm gì". Task sau không sửa file test này (CL14.5)
- [ ] US48-TA2 Code · Claude Code (opus, CL14.6a): migration, hàm fn_*, policy cho tới khi test database xanh; thêm phép thử làm hỏng vào scripts/thu-lam-hong.sh nếu đổi quyền, tiền, chặn trùng
- [ ] US48-TA3 Code · Claude Code (sonnet, CL14.6a): màn S5 theo canvas, test unit, e2e cho YC8.1-NT1 đến NT5, NT12 đến NT15, HV6-NT2
- [ ] US48-TA4 Test tay · Đức: chạy tests/kb/US48-gui-thong-tin-cho-khach.md, chế độ nhanh rồi đủ. Rủi ro cao: chạy trên cả iPhone và Android, thử vi phạm quyền bằng tay (CL6.3).

## Kế hoạch

## Nhật ký
- 2026-11-18 · Claude · tạo item từ YC8.1@1 (QD21)
- 2026-11-19 · Claude · thuc_hien lên bản mới theo QD22
- 2026-11-19 · Claude · nhận HV6-NT2 từ EN4 (QD27)
- 2026-11-19 · Claude · YC8-H5 đã trả lời (nút Chia sẻ)
- 2026-11-19 · Claude (QD25) · tự chốt YC8-H1, H2, H3, H4, H6, H7 (YC8 r4, thêm NT12 đến NT16); viết kịch bản test tay

## Bằng chứng
