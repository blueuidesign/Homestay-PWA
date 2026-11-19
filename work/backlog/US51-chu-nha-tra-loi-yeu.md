---
id: US51
tieu_de: "Chủ nhà trả lời yêu cầu"
loai: US
trang_thai: moi
thuc_hien: [YC9.2@2]
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
Là chủ nhà, tôi làm được việc "Chủ nhà trả lời yêu cầu" đúng như YC9.2 mô tả.

## Làm tiêu chí nào
YC9.2-NT1 đến NT5, NT7 đến NT11 (NT6 bỏ)

## Quy tắc, hành vi dùng
QT1.1, QT1.4, QT2.1, QT5.6, QT6.2

## Màn hình
CN1-03, CN9, CN9-02, CN9-03

## Quyền
PQ2, PQ5, PQ7, PQ10, PQ11, PQ19 và các test vi phạm ở mục "Ai được làm gì" của YC9-yeu-cau-dat-phong.md thuộc mục này. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
Điền khi lập kế hoạch, theo cấu trúc thư mục EN1 ghi ở docs/dev/chay-va-test.md. Database chỉ thêm migration mới ở supabase/migrations/.

## Ngoài phạm vi
- YC9-H4, H5, H9, H10 đã Claude tự chốt (QD25, YC9 r3).
- Phần đầu YC9-yeu-cau-dat-phong.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC9.2 QT1.1 QT1.4 QT2.1 QT5.6 QT6.2 PQ2 PQ5 PQ7 PQ10 PQ11 PQ19 CN1-03 CN9 CN9-02 CN9-03
YC9-yeu-cau-dat-phong.md#Quy tắc của nhóm
YC9-yeu-cau-dat-phong.md#Ai được làm gì
YC9-yeu-cau-dat-phong.md#Dữ liệu
YC9-yeu-cau-dat-phong.md#Trạng thái màn (mọi mục)
thiet-ke-db.md#3. Bất biến (sai là hỏng sản phẩm)

## Test case
Kịch bản test tay: tests/kb/US51-chu-nha-tra-loi-yeu.md.

## Task
- [ ] US51-TA1 Code · Claude Code (opus, CL14.6a): viết trước test database cho YC9.2-NT2, YC9.2-NT3, YC9.2-NT4, YC9.2-NT5, YC9.2-NT8, YC9.2-NT9, YC9.2-NT10, YC9.2-NT11, kể cả test vi phạm quyền ở mục "Ai được làm gì". Task sau không sửa file test này (CL14.5)
- [ ] US51-TA2 Code · Claude Code (opus, CL14.6a): migration, hàm fn_*, policy cho tới khi test database xanh; thêm phép thử làm hỏng vào scripts/thu-lam-hong.sh nếu đổi quyền, tiền, chặn trùng
- [ ] US51-TA3 Code · Claude Code (sonnet, CL14.6a): màn CN1-03, CN9, CN9-02, CN9-03 theo canvas, test unit, e2e cho YC9.2-NT1, YC9.2-NT2, YC9.2-NT4, YC9.2-NT7, YC9.2-NT11
- [ ] US51-TA4 Test tay · Đức: chạy tests/kb/US51-chu-nha-tra-loi-yeu.md, chế độ nhanh rồi đủ. Rủi ro cao: chạy trên cả iPhone và Android, thử vi phạm quyền bằng tay (CL6.3).

## Kế hoạch

## Nhật ký
- 2026-11-18 · Claude · tạo item từ YC9.2@1 (QD21)
- 2026-11-19 · Claude · thuc_hien lên bản mới theo QD22
- 2026-11-19 · Claude (QD25) · YC9 r3 tự chốt câu mở, thêm NT

## Bằng chứng
