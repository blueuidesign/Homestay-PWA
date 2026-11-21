---
id: BG2
tieu_de: "Mở thẳng địa chỉ màn sửa đặt phòng thì kẹt Đang tải"
loai: BG
trang_thai: cho-test
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
pr: [94]
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
- [x] BG2-TA1 Code · PR #94

## Nhật ký
- 2026-11-21 · Claude · tạo từ EN15 Luồng 11 (chủ sửa tiền đặt phòng của sale mở từ địa chỉ)
- 2026-11-21 · Claude · useDanhSachCan khởi tạo dangTai false; test unit 5 ca, e2e mở thẳng rồi sửa · 30 phút
- 2026-11-21 · Claude · gộp PR #94 theo QD25 (CI xanh), sang cho-test

## Bằng chứng
- `npx vitest run src/man/ManChu.test.tsx`: lần đầu 5 test BG2 đỏ (layCanCuaToi không được gọi), sau sửa 11 qua.
- `E2E_SUPABASE=1 npx playwright test tests/e2e/supabase/sua-dat-phong.spec.ts -g BG2`: lần đầu đỏ (không thấy chip 1509), sau sửa qua. Chạy thêm gia-nhieu-can, gia-thang, ds-can, chi-tiet-dat-phong: 7 qua.
- `npm run typecheck` qua; `python3 scripts/kiem.py --diff origin/main` không lỗi.
