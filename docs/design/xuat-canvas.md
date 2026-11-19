---
id: TKE-XUAT
tieu_de: Xuất canvas từ artifact vào repo
trang_thai: de-xuat
nguoi_chu: tung
rev: 1
---
# Xuất canvas từ artifact vào repo

Canvas gốc là Design artifact trên claude.ai (link trong `docs/design/README.md`). Mỗi lần sửa xong trên artifact, đưa vào repo trong một PR ba thứ: nguồn, HTML dựng sẵn, ảnh từng màn. Không cần tài khoản hay đăng nhập: mọi bước chạy trên máy với Chromium.

1. Đọc các file `project/…` của artifact (công cụ Artifact, action `read`) vào một thư mục, chép đè vào `docs/design/canvas/nguon/`.
2. Lấy runtime của loại artifact Design: đọc `artifact-type/dc-runtime.js` của artifact, lưu thành `support.js` ở thư mục tạm (không đưa vào repo).
3. Ảnh căn trong bảng là `/_blob/<id>`. Tạo `blobmap.json` ánh xạ id sang file ảnh (ảnh gốc ở `docs/design/canvas/anh/`, cùng dung lượng file).
4. Chạy máy chủ tĩnh: `node scripts/canvas/srv.js docs/design/canvas/nguon <đường dẫn support.js> blobmap.json` (cổng 8765).
5. Xuất HTML: `node scripts/canvas/export.js docs/design/canvas/home247-canvas.html Main.dc.html Auth.dc.html …` (đủ các bảng theo `canvas.json`), rồi đổi `/_blob/<id>` thành `anh/<tên>.jpg`.
6. Chụp ảnh: `node scripts/canvas/shotall.js <thư mục> <các bảng>` rồi đổi sang `docs/design/canvas/man/<mã>.webp`.
7. Kiểm: `python3 scripts/trich-man.py <mã> --chu` ra đúng chữ của màn vừa sửa.

## Lịch sử sửa đổi
| Rev | Ngày | Người | Commit hoặc PR | Thay đổi | Mục bị đổi |
|---|---|---|---|---|---|
| r1 | 2026-11-19 | Claude (thread design) | claude/project-thread-0kxyex | Tạo mới | Cả file |
