---
id: QD28
tieu_de: Vercel chỉ tự deploy nhánh main, bỏ bản Preview của nhánh PR
trang_thai: da-chot
loai: ky-thuat
nguoi_chot: claude
ngay_chot: 2026-11-19
han_chot:
thay_cho: []
nguon: QD25 (Claude tự quyết), giới hạn 100 lần deploy mỗi ngày của Vercel gói miễn phí, 19/11/2026
anh_huong: [vercel.json, EN11, work/cho-tung.md, skill deploy-ban-thu]
rev: 1
---
# QD28 · Vercel chỉ tự deploy nhánh main, bỏ bản Preview của nhánh PR

## Câu hỏi
Ngày 19/11/2026 Vercel gói miễn phí từ chối deploy vì quá 100 lần trong ngày. Mỗi lần đẩy một nhánh PR là một lần deploy, nên bản trên homestay-pwa.vercel.app cũng ngừng cập nhật. Làm sao để bản trên main luôn được cập nhật?

## Phương án
| Phương án | Được gì | Mất gì |
|---|---|---|
| Nâng gói Vercel | Giữ bản Preview mỗi nhánh | Tốn tiền, chỉ Tùng làm được (QD24 còn chờ) |
| `ignoreCommand` bỏ build nhánh khác main | Không build nhánh PR | Vercel vẫn tạo một lần deploy rồi hủy, chưa chắc lần đó không bị tính vào giới hạn |
| `git.deploymentEnabled` chỉ bật main | Vercel không tạo deploy cho nhánh PR, nên không tính vào giới hạn | Không còn bản Preview để bấm thử từng nhánh trước khi gộp |

## Đề xuất
Dùng `git.deploymentEnabled` trong vercel.json: `"**": false, "main": true`. Khi một nhánh khớp nhiều luật, chỉ cần một luật `true` là deploy, nên main vẫn deploy. Test e2e đã chạy trọn luồng trên CI với Supabase chạy trên máy, nên bỏ bản Preview không làm mất phần kiểm trước khi gộp.

## Quyết định
Chọn `git.deploymentEnabled` chỉ bật main (Claude tự quyết, QD25, 19/11/2026). Coordinator đề xuất `ignoreCommand`; Claude chọn cách này vì nó chặn từ bước tạo deploy. Cần bản thử của một nhánh thì deploy tay bằng skill deploy-ban-thu. Tùng nâng gói (QD24) thì có thể bật lại Preview.

## Lịch sử sửa đổi
| Rev | Ngày | Người | Commit hoặc PR | Thay đổi | Mục bị đổi |
|---|---|---|---|---|---|
| r1 | 2026-11-19 | Claude | EN11 | Tạo, Claude tự quyết theo QD25 | Cả file |
