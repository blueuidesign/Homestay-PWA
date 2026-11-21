---
id: US66-KB
us: US66
rev: 1
---
# Kịch bản test tay US66 · Dải ngày lễ

Dùng staging. Quản trị viên đầu tiên là email Tùng ghi bằng SQL (docs/ha-tang/Phat_hanh.md mục 5). Cách ghi kết quả: ☑ OK hoặc ☑ NG, ngày, tên (CL14.5a).

### US66-KB1 · Luồng chính `[Chính]`
- **Mục đích:** quản trị viên làm được việc chính của YC13.2.
- **Làm:** mở /quan-tri, đăng nhập bằng mã email, làm theo bảng bước của YC13.2.
- **Mong đợi:** đúng như các bước và tiêu chí của YC13.2.
- **Nguồn:** YC13.2-NT1
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US66-KB2 · Người không phải quản trị `[Biên]`
- **Mục đích:** người ngoài danh sách không làm được gì.
- **Làm:** đăng nhập /quan-tri bằng email chủ nhà thử.
- **Mong đợi:** không nhận mã, hoặc có phiên thì thấy "Email này không có quyền quản trị".
- **Nguồn:** YC13.1-NT3
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**
