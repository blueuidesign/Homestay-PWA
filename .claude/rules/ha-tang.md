---
paths:
  - "docs/ha-tang/**"
  - "infra/**"
---
# Quy ước khi ghi thông tin hạ tầng

- Thông tin hạ tầng mới (server, tên miền, dịch vụ ngoài) ghi vào docs/ha-tang/, mỗi dịch vụ một file.
- Không ghi khóa, mật khẩu, token, App Secret. Chỉ ghi chỗ cất (ví dụ "biến JWT_SECRET trong .env trên api-that").
