---
paths:
  - "docs/process/**"
  - "CLAUDE.md"
  - ".claude/**"
  - ".github/**"
---
# Quy ước khi sửa cách làm việc

Mọi thay đổi ở đây thuộc CL4.3.6, nên chỉ mở PR cho Tùng duyệt. AI chỉ gộp khi Tùng ra lệnh gộp rõ PR nào, hoặc trong vòng làm tự động Tùng cho phép (CL4.6).

- Một việc một chỗ. CLAUDE.md chỉ chứa điều phải đọc đầu mỗi phiên và trỏ tới CL. Chi tiết nằm ở docs/process/CLx. Đừng chép chi tiết CL vào CLAUDE.md, rules hay skills.
- Quy trình của một lệnh có skill nằm trong thân skill ở .claude/skills/<tên>/SKILL.md, viết một lần ở đó. CL5 chỉ giữ mục lục và quy trình của lệnh chưa có skill. Lý do: thân skill chỉ nạp khi gọi đúng lệnh.
- Skill chỉ đọc và báo cáo ghi `model: sonnet`. Agent review ở .claude/agents/review.md chỉ chạy khi Tùng bảo.
- Thêm hoặc đổi một CL: tăng "rev" ở đầu file và thêm dòng Lịch sử sửa đổi (CL12), thêm dòng vào docs/INDEX.md, cập nhật CL11 nếu đổi cây thư mục.
- Giữ CLAUDE.md dưới 80 dòng. Với mỗi dòng, hỏi: bỏ dòng này thì Claude có làm sai không. Không thì bỏ. Dòng nào Claude không cần ở mọi phiên thì chuyển sang rules (theo thư mục) hoặc skills (theo lệnh).
- Chỉ thêm quy tắc khi đã thấy lỗi xảy ra hoặc sắp xảy ra, và ghi lỗi nào vào PR. Thêm quy tắc "cho chắc" làm quy trình nặng hơn sức hai người.
- Rules nói AI nên làm gì, nhưng không chặn được. Điều phải chặn cứng thì làm thành hook (CL4.9) hoặc permissions.deny trong .claude/settings.json. Deny chỉ khớp đúng chuỗi lệnh, nên lệnh có nhiều cách gõ thì dùng hook.
- Không đưa khóa, token, số điện thoại, tên người dùng thật vào bất kỳ file nào ở đây.
