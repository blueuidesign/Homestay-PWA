---
id: EN6
tieu_de: "Sao lưu và khôi phục"
loai: EN
trang_thai: cho-test
thuc_hien: [YC15.2@1]
truoc: [EN1, EN2]
lien_quan: []
nguon: QD21
nguoi: tung
rui_ro: cao
uoc_luong:
thuc_te:
can_duyet: []
based_on:
pr: 88
ngay_tao: 2026-11-18
---
## Mục tiêu
Làm xong YC15.2 · Sao lưu và khôi phục.

## Làm tiêu chí nào
YC15.2-NT1 đến NT3

## Quy tắc, hành vi dùng
Không có.

## Màn hình
Không có màn.

## Quyền
Không chạm quyền.

## Phạm vi
scripts/sao-luu.sh, scripts/khoi-phuc-thu.sh, scripts/thu-sao-luu.sh (chạy trong job database của CI), .github/workflows/backup.yml, docs/ha-tang/Sao_luu_khoi_phuc.md. Không migration.

## Ngoài phạm vi
- Phần đầu YC15-van-hanh.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC15.2
YC15-van-hanh.md#Quy tắc của nhóm
YC15-van-hanh.md#Ai được làm gì
YC15-van-hanh.md#Dữ liệu

## Test case
Không có kịch bản test tay riêng; NT thủ công ghi kết quả vào Bằng chứng.

## Task
- [x] EN6-TA0 Code · Claude Code (opus): script sao lưu, khôi phục, thử trên máy và CI, workflow đêm, sổ tay
- [ ] EN6-TA1 Kiểm thủ công · Đức: YC15.2-NT1 đến NT3 trên production khi có (QD23), ghi kết quả vào Bằng chứng

## Kế hoạch
Theo cách sổ tay đã chọn (rclone crypt lên Google Drive, miễn phí). Kiểm kích thước và đủ bảng trước khi đẩy. Khôi phục = chạy migration lên project mới rồi nạp dữ liệu. PR chạm production (đọc database thật khi Tùng thêm secret) nên không tự gộp, chờ Tùng.

## Nhật ký
- 2026-11-21 · Claude (tự chạy, QD25) · gộp PR #88 (Tùng cho tự gộp cả phần production tới 26/11), chờ Tùng thêm secret
- 2026-11-21 · Claude (tự chạy, QD25) · script sao lưu, khôi phục, thử trên máy và CI, workflow backup.yml, sổ tay mục 1 đến 4; diễn tập trên Postgres của máy đạt · khoảng 30 phút
- 2026-11-18 · Claude · tạo item từ YC15.2@1 (QD21)

## Bằng chứng
- `scripts/thu-sao-luu.sh` trên Postgres 16 của máy: 5 đạt, 0 hỏng (NT1 sao lưu đạt kiểm và có file lịch; NT2 nhỏ bất thường và thiếu bảng thì báo lỗi, không đẩy; NT3 khôi phục vào database mới ra cùng số dòng). Chưa thử trên production và Google Drive thật: chờ QD23 và secret của Tùng.
