---
id: EN10
tieu_de: "Xóa file ảnh tạm quá 24 giờ và ảnh bị bỏ khỏi căn trong kho ảnh"
loai: EN
trang_thai: dang-lam
thuc_hien: []
truoc: [US16]
lien_quan: [US16]
nguon: US16 (PR #24)
nguoi: tung
rui_ro: tb
uoc_luong: 3 giờ
thuc_te:
can_duyet: []
based_on:
pr:
ngay_tao: 2026-11-19
---
## Mục tiêu
File ảnh tạm không gắn căn sau 24 giờ và file ảnh bị bỏ khỏi căn bị xóa khỏi kho `anh-can`, không chỉ xóa dòng trong bảng (YC3-can.md mục Dữ liệu).

## Làm tiêu chí nào
Mục Dữ liệu của YC3: "Ảnh tạm không gắn căn nào sau 24 giờ, và ảnh bị bỏ khỏi căn, bị xóa cả file."

## Đọc
YC3-can.md#Dữ liệu
QT5.7

## Phạm vi
supabase/functions/ hoặc việc định kỳ gọi Storage API bằng khóa chạy ở server (không bao giờ trong app); migration mới nếu cần hàng đợi file cần xóa. Hiện `fn_don_anh_tam()` (US16) chỉ xóa dòng và trả đường dẫn file.

## Không được
Đưa khóa service_role vào app hay repo. Xóa thẳng bảng storage.objects.

## Dừng và hỏi nếu
Cần tiền (dịch vụ trả phí) hay khóa bí mật mới: ghi vào work/cho-tung.md.

## Task
- [x] EN10-TA1 Code · Claude Code (sonnet, CL14.6a): chọn cách chạy định kỳ (Edge Function có lịch, hoặc GitHub Actions gọi Storage API), test trên Supabase máy

## Kế hoạch
Chọn GitHub Actions có lịch (không cần dịch vụ trả phí, khóa service_role chỉ ở secret GitHub). Migration: hàng đợi file_cho_xoa, trigger khi xóa dòng anh_can, fn_file_cho_xoa (hàng đợi cộng file mồ côi quá 24 giờ), fn_da_xoa_file, chỉ service_role. scripts/don-anh-tam.mjs và workflow don-anh-tam.yml mỗi giờ.

## Nhật ký
- 2026-11-19 · Claude · tạo từ báo cáo US16: fn_don_anh_tam chỉ xóa dòng, file còn trong kho
- 2026-11-20 · Claude (tự chạy, QD25) · code TA1 trên nhánh EN10-xoa-file-anh-tam, mở PR; cần secret ở work/cho-tung.md · khoảng 25 phút

## Bằng chứng
- `CHI_FILE_CO_MA=1 scripts/test-db.sh EN10`: 8 qua. `scripts/thu-lam-hong.sh EN10`: lần đầu 1 phép thử không đạt (file b.jpg cũ nên vẫn bị bắt theo luật mồ côi), sửa dữ liệu test thành file mới tải, 2 đạt. `scripts/test-db.sh KT-DB`: 339 qua.
- `npx vitest run src/test/donAnhTam.test.ts`: 3 qua. `node scripts/don-anh-tam.mjs` khi thiếu biến: in nhắc, thoát 0.
- Chưa chạy với dịch vụ kho thật: chờ secret (work/cho-tung.md), chạy tay workflow don-anh-tam sau khi thêm.
