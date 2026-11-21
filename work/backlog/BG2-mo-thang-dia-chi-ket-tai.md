---
id: BG2
tieu_de: "Mở thẳng địa chỉ màn sửa đặt phòng thì kẹt Đang tải"
loai: BG
trang_thai: dang-lam
thuc_hien: [YC5.6@7, HV1@5]
truoc: [US31]
lien_quan: [EN15, US23, US21]
nguon: EN15 (kiểm thử luồng chủ nhà và sale, Luồng 11)
nguoi: tung
rui_ro: thap
muc_do: trung-binh
uoc_luong: 1 giờ
thuc_te:
can_duyet: []
based_on: fd1d021
pr:
ngay_tao: 2026-11-21
---
## Mục tiêu
Chủ nhà mở thẳng địa chỉ một màn cần danh sách căn (mở lại app ở màn đó, tải lại trang, link) thì màn tải xong như khi mở từ lịch.

## Làm tiêu chí nào
YC5.6-NT1 (trường hợp mở thẳng /dat-phong/<id>/sua)

## Đọc
YC5.6, HV1

## Phạm vi
src/man/ManChu.tsx và src/man/ManChu.test.tsx; tests/e2e/supabase/sua-dat-phong.spec.ts.

## Không được
Đổi cách tải lại danh sách căn khi mở tab Lịch, tab Căn.

## Dừng và hỏi nếu
Tài liệu không nói rõ. Cần sửa file ngoài phạm vi. Cần quyền trong CL4.

## Tái hiện
Máy: Chromium 390×844 (e2e), Supabase trên máy. Chưa thử trên điện thoại thật.
1. Chủ nhà có đặt phòng có sale đứng tên. Đăng nhập xong mở thẳng `/dat-phong/<id>` (hay tải lại trang ở đó).
2. Bấm "Sửa đặt phòng".
- Thấy: hàng chip "Phòng" và dòng kiểm trùng là khung xám "Đang tải" mãi, nút "Lưu thay đổi" mờ, không sửa được.
- Mong đợi: mọi ô điền sẵn giá trị của đặt phòng (YC5.6-NT1), lưu được; HV1 lần đầu khung xám rồi có dữ liệu.
Cùng gốc: `/can/gia-nhieu` kẹt khung xám; `/can/<id>/gia` tiêu đề "Căn" thay vì "Phòng 1509"; `/dat-phong/<id>` thiếu màu căn.
Gốc: `useDanhSachCan` trong ManChu.tsx khởi tạo `dangTai = true`, nên effect "mở thẳng địa chỉ thì đọc danh sách" không chạy.

## Task
- [ ] BG2-TA1 Code · Claude Code (opus, CL14.6a): khởi tạo dangTai false để màn mở thẳng địa chỉ tự đọc danh sách căn; test unit YC5.6-NT1 mở thẳng /dat-phong/<id>/sua, e2e mở thẳng địa chỉ rồi sửa

## Nhật ký
- 2026-11-21 · Claude · tạo từ EN15 Luồng 11 (chủ sửa tiền đặt phòng của sale mở từ địa chỉ)

## Bằng chứng
