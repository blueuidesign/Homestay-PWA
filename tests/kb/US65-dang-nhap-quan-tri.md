---
id: US65-KB
us: US65
rev: 1
---
# Kịch bản test tay US65 · Đăng nhập trang quản trị và quản trị viên

Dùng staging. Quản trị viên đầu tiên là email Tùng ghi bằng SQL (docs/ha-tang/Phat_hanh.md mục 5). Cách ghi kết quả: ☑ OK hoặc ☑ NG, ngày, tên (CL14.5a).

### US65-KB1 · Luồng chính `[Chính]`
- **Mục đích:** quản trị viên làm được việc chính của YC13.1.
- **Làm:** mở /quan-tri, đăng nhập bằng mã email, làm theo bảng bước của YC13.1.
- **Mong đợi:** đúng như các bước và tiêu chí của YC13.1.
- **Nguồn:** YC13.1-NT1
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US65-KB2 · Người không phải quản trị `[Biên]`
- **Mục đích:** người ngoài danh sách không làm được gì.
- **Làm:** đăng nhập /quan-tri bằng email chủ nhà thử.
- **Mong đợi:** không nhận mã, hoặc có phiên thì thấy "Email này không có quyền quản trị".
- **Nguồn:** YC13.1-NT3
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**
