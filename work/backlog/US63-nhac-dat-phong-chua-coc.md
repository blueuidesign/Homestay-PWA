---
id: US63
tieu_de: "Nhắc đặt phòng chưa cọc"
loai: US
trang_thai: moi
thuc_hien: [YC12.3@1]
truoc: [EN1, EN2, EN3, EN4]
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
Là người dùng (chủ nhà hoặc sale), tôi làm được việc "Nhắc đặt phòng chưa cọc" đúng như YC12.3 mô tả.

## Làm tiêu chí nào
YC12.3-NT1 đến NT3

## Quy tắc, hành vi dùng
Không có.

## Màn hình
P13

## Quyền
PQ19 và các test vi phạm ở mục "Ai được làm gì" của YC12-thong-bao.md thuộc mục này. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
Điền khi lập kế hoạch, theo cấu trúc thư mục EN1 ghi ở docs/dev/chay-va-test.md. Database chỉ thêm migration mới ở supabase/migrations/.

## Ngoài phạm vi
- Chỗ chưa quyết trong mục, chưa code tới khi Tùng trả lời: YC12-H3.
- Phần đầu YC12-thong-bao.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC12.3 PQ19 P13
YC12-thong-bao.md#Quy tắc của nhóm
YC12-thong-bao.md#Ai được làm gì
YC12-thong-bao.md#Dữ liệu
YC12-thong-bao.md#Trạng thái màn (mọi mục)

## Test case
Kịch bản test tay: tests/kb/US63-nhac-dat-phong-chua-coc.md, chưa viết. Viết trước khi item sang san-sang (CL14.5a).

## Task
- [ ] US63-TA1 Code · Claude Code (opus, CL14.6a): migration, hàm fn_*, policy và test database cho YC12.3-NT1 đến NT3
- [ ] US63-TA2 Code · Claude Code (sonnet, CL14.6a): màn P13 theo canvas
- [ ] US63-TA3 Test tay · Đức: chạy tests/kb/US63-nhac-dat-phong-chua-coc.md, chế độ nhanh rồi đủ.

## Kế hoạch

## Nhật ký
- 2026-11-18 · Claude · tạo item từ YC12.3@1 (QD21)

## Bằng chứng
