---
id: EN15
tieu_de: "Kiểm thử e2e các luồng có cả chủ nhà và sale"
loai: EN
trang_thai: dang-lam
thuc_hien: []
truoc: [US33, US53, US59, US8]
lien_quan: [BG2]
nguon: Tùng 21/11 "Tự test lại các chức năng kết hợp chủ nhà và sale nhé" (thread Kiểm thử luồng chủ nhà và sale)
nguoi: tung
rui_ro: thap
uoc_luong: 1 ngày
thuc_te:
can_duyet: []
based_on: fd1d021
pr:
ngay_tao: 2026-11-21
---
## Mục tiêu
Thay một vòng test tay của Đức: chạy từ đầu tới cuối các luồng có chủ nhà và sale cùng tham gia, mỗi người một trình duyệt, bước nào của bên kia cũng làm trên màn; ghi kết quả từng luồng; lỗi tìm được mở BG.

## Làm tiêu chí nào
Không thêm tiêu chí mới. Test mang mã các NT đã có mà luồng đi qua (ghi trong tên test).

## Đọc
YC6.3, YC6.4, YC6.5, YC6.6, YC7.4, YC9.1, YC9.2, YC9.3, YC9.4, YC5.8, YC11.1, YC11.2, YC12.3, YC1.8

## Phạm vi
tests/e2e/supabase/luong-chu-sale.spec.ts (mới); work/bao-cao/EN15-kiem-thu-luong-chu-sale.md (báo cáo).

## Không được
Sửa code app trong item này (lỗi tìm được đi BG riêng). Sửa spec theo US đã có.

## Dừng và hỏi nếu
Tài liệu không nói rõ. Cần sửa file ngoài phạm vi. Cần quyền trong CL4.

## Task
- [ ] EN15-TA1 Code · Claude Code (opus, CL14.6a): spec e2e 11 luồng chủ nhà + sale; dò rò dữ liệu qua API bằng 6 tài khoản DLM; báo cáo

## Nhật ký
- 2026-11-21 · Claude · tạo item; chạy 11 luồng trên Supabase máy, tìm BG2

## Bằng chứng
