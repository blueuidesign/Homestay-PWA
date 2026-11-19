---
id: EN9
tieu_de: "Email báo cáo mỗi lần gộp chức năng mới"
loai: EN
trang_thai: dang-lam
thuc_hien: []
truoc: []
lien_quan: [QD25]
nguon: QD25
nguoi: tung
rui_ro: thap
uoc_luong:
thuc_te:
can_duyet: []
based_on:
pr:
ngay_tao: 2026-11-19
---
## Mục tiêu
Tùng nhận email mỗi khi một PR của item (US, EN, BG) gộp vào main và Vercel deploy: tên PR, item, mô tả PR, các chỗ Claude tự quyết, kết quả kiểm tự động, link app. Tùng yêu cầu 19/11/2026 qua project chat.

## Làm tiêu chí nào
Không có NT. Kiểm bằng tay: gộp một PR có mã item, xem thư tới.

## Phạm vi
- .github/workflows/bao-cao-email.yml: chạy khi PR gộp vào main, gọi API Resend.
- .github/pull_request_template.md: thêm mục "Claude tự quyết" để thư có chỗ đọc.
- docs/ha-tang/Bi_mat_va_cau_hinh.md: thêm RESEND_API_KEY, BAO_CAO_EMAIL.
- work/cho-tung.md: việc Tùng thêm hai secret.

## Ngoài phạm vi
- Chạy tay (workflow_dispatch) để gửi thư thử.
- PR không mở đầu bằng mã US, EN, BG (tài liệu, quyết định, thiết kế) không gửi thư (Claude tự quyết, QD25: đó không phải chức năng mới).
- Địa chỉ nhận không ghi vào repo vì repo công khai; để ở secret BAO_CAO_EMAIL.

## Task
- [ ] EN9-TA1 Code · Claude Code: workflow, mẫu PR, tài liệu bí mật
- [ ] EN9-TA2 Việc tay · Tùng: thêm secret RESEND_API_KEY và BAO_CAO_EMAIL ở GitHub (work/cho-tung.md)

## Nhật ký
- 2026-11-19 · Claude · tạo item, viết workflow theo yêu cầu của Tùng

## Bằng chứng
