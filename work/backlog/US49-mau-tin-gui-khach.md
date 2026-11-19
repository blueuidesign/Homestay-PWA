---
id: US49
tieu_de: "Mẫu tin gửi khách"
loai: US
trang_thai: moi
thuc_hien: [YC8.2@1]
truoc: [EN1, EN2, EN4, US2]
lien_quan: []
thay_cho: []
nguon: QD21
nguoi: tung
rui_ro: tb
nghiem_thu: khong
uoc_luong:
thuc_te:
can_duyet: []
based_on:
pr:
ngay_tao: 2026-11-18
---
## Mục tiêu
Là sale, tôi làm được việc "Mẫu tin gửi khách" đúng như YC8.2 mô tả.

## Làm tiêu chí nào
YC8.2-NT1 đến NT5

## Quy tắc, hành vi dùng
Không có.

## Màn hình
P11

## Quyền
PQ3, PQ5, PQ11, PQ12, PQ14, PQ19 và các test vi phạm ở mục "Ai được làm gì" của YC8-gui-khach.md thuộc mục này. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
Điền khi lập kế hoạch, theo cấu trúc thư mục EN1 ghi ở docs/dev/chay-va-test.md. Database chỉ thêm migration mới ở supabase/migrations/.

## Ngoài phạm vi
- YC8-H8, H9 đã Claude tự chốt (QD25, YC8 r5).
- Màn S5 và chữ từng căn: US48. US49 chỉ thêm P11, lệnh đọc, lưu mẫu, và cho S5 dùng mẫu đã lưu khi "Sao chép chữ cả N căn".
- Tab Cá nhân của sale chưa đầy đủ (YC1): US49 chỉ thêm dòng "Mẫu tin gửi khách".
- Phần đầu YC8-gui-khach.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC8.2 PQ3 PQ5 PQ11 PQ12 PQ14 PQ19 P11
YC8-gui-khach.md#Quy tắc của nhóm
YC8-gui-khach.md#Ai được làm gì
YC8-gui-khach.md#Dữ liệu
YC8-gui-khach.md#Trạng thái màn (mọi mục)

## Test case
Kịch bản test tay: tests/kb/US49-mau-tin-gui-khach.md.

## Task
- [ ] US49-TA1 Code · Claude Code (opus, CL14.6a): migration, hàm fn_*, policy và test database cho YC8.2-NT3, YC8.2-NT4, YC8.2-NT5
- [ ] US49-TA2 Code · Claude Code (sonnet, CL14.6a): màn P11 theo canvas, test unit, e2e cho YC8.2-NT1 đến NT3, NT5
- [ ] US49-TA3 Test tay · Đức: chạy tests/kb/US49-mau-tin-gui-khach.md, chế độ nhanh rồi đủ.

## Kế hoạch

## Nhật ký
- 2026-11-18 · Claude · tạo item từ YC8.2@1 (QD21)
- 2026-11-19 · Claude (QD25) · tự chốt YC8-H8, H9 (YC8 r5, thêm NT5); viết kịch bản test tay

## Bằng chứng
