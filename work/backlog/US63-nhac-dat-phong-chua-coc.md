---
id: US63
tieu_de: "Nhắc đặt phòng chưa cọc"
loai: US
trang_thai: cho-test
thuc_hien: [YC12.3@1]
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
pr: 85
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
supabase/migrations/20261120230000_us63_nhac_chua_coc.sql, supabase/bang-va-cot.md, tests/db/89_us63_nhac_chua_coc.sql, scripts/thu-lam-hong.txt, src/lib/thongBao.test.ts (chạm mở, chữ dòng; màn P13 đã làm ở US62), tests/kb/US63-nhac-dat-phong-chua-coc.md, docs/product/requirements/YC12-thong-bao.md (r5), work/cau-hoi.md (YC12-H3), work/gia-dinh.md (GD34), work/backlog/US62-man-thong-bao.md (trạng thái).

## Ngoài phạm vi
- YC12-H3 đã tự chốt 20/11 (QD25, GD34): đặt phòng tạo muộn vẫn được nhắc một lần.
- Phần đầu YC12-thong-bao.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC12.3 PQ19 P13
YC12-thong-bao.md#Quy tắc của nhóm
YC12-thong-bao.md#Ai được làm gì
YC12-thong-bao.md#Dữ liệu
YC12-thong-bao.md#Trạng thái màn (mọi mục)

## Test case
Kịch bản test tay: tests/kb/US63-nhac-dat-phong-chua-coc.md (3 kịch bản, 2 [Chính]).

## Task
- [x] US63-TA1 Code · Claude Code (opus, CL14.6a): migration, hàm fn_*, policy và test database cho YC12.3-NT1 đến NT3
- [x] US63-TA2 Code · Claude Code (sonnet, CL14.6a): màn P13 theo canvas
- [ ] US63-TA3 Test tay · Đức: chạy tests/kb/US63-nhac-dat-phong-chua-coc.md, chế độ nhanh rồi đủ.

## Kế hoạch

## Nhật ký
- 2026-11-20 · Claude (tự chạy, QD25) · tự chốt YC12-H3 (GD34), test database trước, fn_nhac_chua_coc và lịch 08:00; màn P13 đã có từ US62 nên TA2 chỉ thêm test chữ dòng · khoảng 25 phút
- 2026-11-18 · Claude · tạo item từ YC12.3@1 (QD21)

## Bằng chứng
- `CHI_FILE_CO_MA=1 scripts/test-db.sh YC12.3`: lần đầu đỏ (chưa có hàm); sau đó 3 vòng sửa test (đêm trùng giữa các đặt phòng thử, thiếu dòng cài đặt của Chị Hoa, ép jsonb sang text) 22 qua, 0 hỏng. `scripts/thu-lam-hong.sh YC12.3`: 3 đạt. `npx vitest run src/lib/thongBao.test.ts`: qua. e2e: không (NT chỉ ở lớp database).
- 2026-11-20 Claude: PR #85 đã gộp (CI xanh). Cụm 4 xong. Cần chạy migration 20261120210000, 20261120220000, 20261120230000 lên staging.
