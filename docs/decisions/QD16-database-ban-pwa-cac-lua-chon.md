---
id: QD16
tieu_de: "Database bản PWA: các lựa chọn khi chuyển từ server Node sang Supabase"
trang_thai: cho-chot
loai: san-pham
nguoi_chot: tung
ngay_chot:
thay_cho: []
nguon: Quyet_dinh.md của bản PWA (QD16)
anh_huong: []
rev: 1
---
# QD16 · Database bản PWA: các lựa chọn khi chuyển từ server Node sang Supabase

## Câu hỏi
server Node của bản Zalo có khoảng 100 việc đọc ghi. Chuyển sang Supabase (QD4) phải chọn cách làm cho từng nhóm việc. Các lựa chọn dưới đây Claude làm lúc dựng repo, có test, nhưng Tùng chưa duyệt từng điểm.

## Phương án
(không ghi)

## Quyết định
1. Cài đặt riêng của sale (mức cộng mặc định, làm tròn 50 nghìn, mẫu tin, loại thông báo đã tắt) nằm ở bảng `cai_dat_rieng`, chỉ chính người đó đọc. Lý do: người đã kết nối đọc được hồ sơ của nhau, để chung trong `profiles` thì chủ nhà thấy mức cộng của sale (trái QD11).
  2. Thông báo sinh bằng trigger ở database, app không tự ghi. Lý do: mọi đường ghi booking đều sinh thông báo, không sót khi thêm đường ghi mới.
  3. Sale đọc lịch và tìm phòng qua hàm `fn_sale_lich`, `fn_sale_tim`; các hàm chỉ trả căn, đêm kín hay trống, giá. Lý do: sale không được đọc bảng `booking`.
  4. Ảnh căn nằm ở Storage, bucket riêng tư `anh-can`, thư mục theo mã người tải.
  5. Yêu cầu đặt phòng tự hết hạn sau 14 ngày bằng việc định kỳ `pg_cron` 10 phút một lần.
  6. Quản trị viên đầu tiên (`admins.la_goc`) là người duy nhất thêm, gỡ người đồng quản trị.
  7. Căn tự nhập bắt buộc có tên và số điện thoại chủ căn.
  8. Năm file migration `20261118…` được sửa tại chỗ trong lúc dựng repo vì chưa chạy ở đâu. Từ lần chạy đầu trên staging, migration chỉ thêm.
  9. Dải ngày lễ không đặt sẵn; quản trị viên nhập. Lý do: lịch nghỉ mỗi năm do Chính phủ công bố, đặt sẵn là đoán.
  10. CI và máy dev dùng Postgres 16. Supabase có thể chạy bản khác; lần đầu chạy migration lên staging phải chạy lại toàn bộ test trên staging.

## Hệ quả
`supabase/migrations/`, `tests/db/`, `scripts/thu-lam-hong.sh`, `docs/architecture/thiet-ke-db.md`.

Thay cho: không. Trạng thái gốc: Đề xuất, chờ Tùng chốt.

## Lịch sử sửa đổi
| Rev | Ngày | Người | Commit hoặc PR | Thay đổi | Mục bị đổi |
|---|---|---|---|---|---|
| r1 | 2026-11-18 | Claude | QD21-lam-lai-tai-lieu | Tách từ `docs/decisions/`, đổi mã QD16 thành QD16 | Cả file |
