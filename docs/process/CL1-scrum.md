---
id: CL1
tieu_de: Nhịp làm việc theo luồng
trang_thai: de-xuat
nguoi_chu: tung
rev: 1
---
# CL1 · Nhịp làm việc theo luồng
Theo QD21 (lấy lại cách làm theo luồng của bản Zalo). Không chạy sprint. Việc đi theo thứ tự trong work/backlog/THU-TU.md, qua các cột trạng thái của CL2.2, mỗi cột chờ người có trần.

## CL1.1 · Vai
| Vai | Người | Trách nhiệm |
|---|---|---|
| Product Owner, quản lý dự án | Tùng (kiêm Scrum Master) | Thứ tự backlog, chốt yêu cầu, trả lời câu hỏi mở, nghiệm thu |
| Developers | Đức, và Tùng | Test tay, môi trường, việc cần máy thật. Duyệt code theo CL4.2 |
AI là công cụ, không giữ vai nào. Mọi task Code do Claude Code làm (CL2.8).

## CL1.2 · Luồng và trần
Việc chảy qua các cột: `san-sang` → `dang-lam` → `cho-test` → `cho-nghiem-thu` → `xong` (CL2.2).
- **Trần chờ người:** item có task Code ở `cho-test` cộng `cho-nghiem-thu` tối đa 6. Chạm trần thì không ai nhận item có code mới. Chỉ làm BG, EN chỉ có tài liệu, sửa lỗi Đức tìm ra, và việc giảm tải cho người kiểm.
- **Trần đang làm:** tối đa 2 item có code ở `dang-lam` cùng lúc.
- **Lỗi trước, việc mới sau:** BG từ test tay đứng đầu hàng đợi.
- Thứ tự còn lại theo THU-TU.md. Chỉ Tùng sắp (CL4.3.2).

Vì sao có trần: AI làm code nhanh hơn người kiểm. Không có trần thì code mới xây lên code chưa ai thử trên điện thoại, và lỗi của item đầu lan sang mọi item sau. Trần 6 là số đề xuất ban đầu. Tùng chỉnh lại sau hai tuần theo số item thật sự qua cột mỗi ngày.

## CL1.3 · Nhịp tuần
Mỗi tuần một buổi 30 phút, chiều thứ Sáu:
1. Tùng xem các item sang `xong` trong tuần.
2. Tùng sắp lại THU-TU.md và trả lời câu hỏi mở đang chặn việc (work/cau-hoi.md).
3. Mỗi người ghi một dòng: điều gì làm chậm tuần này. Nếu có cải tiến thì ghi thành item.
Lệnh "xem tuần" (CL5) soạn sẵn ba mục trên.

## CL1.4 · Phát hành
Phát hành khi Tùng quyết (CL4.3.5). Phạm vi bản phát hành là các mục YC ghi "Bản 1". Mọi yêu cầu trong phạm vi phải Đã test OK (CL6.4 K7).

## CL1.5 · Khi bật lại sprint
Nếu sau này cần sprint, viết QD mới.

## Lịch sử sửa đổi
| Rev | Ngày | Người | Commit hoặc PR | Thay đổi | Mục bị đổi |
|---|---|---|---|---|---|
| r1 | 2026-11-18 | Claude | QD21-lam-lai-tai-lieu | Chép từ bản Zalo r2, sửa cho bản PWA (QD21). Lịch sử cũ ở repo zalo-miniapp | Cả file |
