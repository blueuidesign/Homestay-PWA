---
id: YC0
tieu_de:
trang_thai: de-xuat
nguoi_chu: tung
rev: 1                     # tăng 1 mỗi PR sửa file (CL12)
ban: 1                     # 1 | sau: thuộc bản phát hành đầu hay làm sau
---
# YC0 · <tên nhóm chức năng>

## Mục tiêu

Là <vai>, tôi muốn <làm gì>, để <được gì>.

Vì sao quan trọng: <sai thì hỏng gì, ai mất gì>.

## Luồng chính

<Một câu chuyện có số thật theo docs/product/du-lieu-mau.md, hôm nay là 07/10/2026.>

## Phạm vi

YC này gồm: <...>.

Không thuộc YC này (dễ tưởng là có):
- <việc>: <YC làm việc đó>.

## Quy tắc của nhóm

<Chỉ luật mà riêng nhóm này dùng. Luật dùng ở từ hai YC trở lên viết ở QT6 và trỏ mã ở dòng dưới.>

| Tên | Quy tắc | Ví dụ |
|---|---|---|

Quy tắc dùng chung: <mã QT, HV, PQ, mục của glossary, pwa.md>.

## Ai được làm gì

Theo `docs/security/PQ-ma-tran-quyen.md`: <mã ô PQ>. Test vi phạm phải có, ở lớp database:
- <người không có quyền làm gì thì bị từ chối> (<mã NT>).

## Dữ liệu

Mô hình chung: `docs/architecture/thiet-ke-db.md`. YC này cần database bảo đảm:
- <điều database phải bảo đảm, không ghi tên hàm, tên bảng>.

## Trạng thái màn (mọi mục)

- Đang tải: HV1. Mất mạng: HV2. Quay lại từ nền: HV3. Không có quyền: HV5. <Chỉ ghi chỗ khác HV.>

## YC0.1 · <tên mục>

Bản 1 · rủi ro: thap | tb | cao · Màn: <mã màn>

| Bước | Người dùng | App | Database |
|---|---|---|---|
| 1 | | <chữ trên màn trong ngoặc kép> | |

<Ghi chú ngay dưới bảng. Chỗ chưa rõ gắn [MỞ: YC0-H1] (câu hỏi ở work/cau-hoi.md). Chỗ code theo giả định ghi (giả định GDn), giả định ở work/gia-dinh.md.>

Luật kiểm:

| Ô | Luật | Sai thì |
|---|---|---|

Tiêu chí:
- **YC0.1-NT1** Khi ..., thì .... · database | unit | e2e | thủ công

## Màn hình

Xem hình: `python3 scripts/trich-man.py <mã>`. Chữ và số trên hình lệch YC thì YC đúng.

- **<mã màn> · <tên>.** <Đúng bố cục, hay chỗ hình lệch YC.>

## Lịch sử sửa đổi
| Rev | Ngày | Người | Commit hoặc PR | Thay đổi | Mục bị đổi |
|---|---|---|---|---|---|
| r1 | | | | Bản đầu | Cả file |
