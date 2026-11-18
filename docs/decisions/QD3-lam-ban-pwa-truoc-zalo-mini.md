---
id: QD3
tieu_de: Làm bản PWA trước, Zalo Mini App sau
trang_thai: da-chot
loai: san-pham
nguoi_chot: tung
ngay_chot: 2026-11-18
thay_cho: []
nguon: Quyet_dinh.md của bản PWA (QD3)
anh_huong: []
rev: 1
---
# QD3 · Làm bản PWA trước, Zalo Mini App sau

## Câu hỏi
bản Zalo phải chờ Zalo duyệt, và các luồng xin quyền, số điện thoại, chia sẻ chỉ thử được bằng tay trên điện thoại.

## Phương án
(A) làm tiếp bản Zalo; (B) PWA trên Vercel và Supabase trước, có nhiều người dùng rồi mới làm Zalo.

## Quyết định
B. Người chốt: Tùng ("tôi muốn phát triển bản PWA này trước và deploy trước để tăng tốc quá trình phát hành. Sau này muốn nâng cấp khi đã có nhiều người dùng thì tôi dùng zalo sau", 18/11/2026).

## Hệ quả
CLAUDE.md, `docs/QUY_TRINH.md`. Gửi căn cho khách đổi từ cửa sổ chia sẻ của Zalo sang chia sẻ của điện thoại (YC8-H5). Đăng nhập không còn Zalo (QD22). Nơi lưu dữ liệu phải tính cho lúc lên Zalo (QD23).

Thay cho: hướng làm Zalo Mini App trước. Trạng thái gốc: Đang hiệu lực.

## Lịch sử sửa đổi
| Rev | Ngày | Người | Commit hoặc PR | Thay đổi | Mục bị đổi |
|---|---|---|---|---|---|
| r1 | 2026-11-18 | Claude | QD21-lam-lai-tai-lieu | Tách từ `docs/decisions/`, đổi mã QD3 thành QD3 | Cả file |
