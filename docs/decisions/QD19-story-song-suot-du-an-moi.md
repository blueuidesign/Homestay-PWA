---
id: QD19
tieu_de: Story sống suốt dự án, mỗi nhóm chức năng một story
trang_thai: da-chot
loai: san-pham
nguoi_chot: tung
ngay_chot: 2026-11-18
thay_cho: [QD15]
nguon: Quyet_dinh.md của bản PWA (QD19)
anh_huong: []
rev: 1
---
# QD19 · Story sống suốt dự án, mỗi nhóm chức năng một story

## Câu hỏi
QD15 cho story đóng băng sau khi merge, đổi tính năng thì viết story mới. Tùng thấy yêu cầu sẽ đổi khá thường xuyên sau khi kiểm tay và dùng thử; đóng băng thì một tính năng bị rải qua nhiều story, agent đọc story cũ không biết nó đã bị thay.

## Phương án
(A) đóng băng hẳn, chuyển story xong vào thư mục lưu trữ, sự thật là test; (B) đánh dấu "bị thay" vào story cũ; (C) story sống, sửa thẳng, ghi rõ phần chưa code, chưa test.

## Quyết định
C. Người chốt: Tùng ("cũng có thể sửa stories mà chưa code hoặc sinh test ngay. Như vậy trong US phải giữ được trạng thái là đã xong code và test hoàn toàn chưa, hay chờ code, hay chờ test. Trong US cũng cần có ghi note những phần nào mới được sửa lần này mà chưa được code hay viết test. vậy là đủ. Còn giữ US xuyên suốt quá trình làm việc cho nhóm chức năng đó", 18/11/2026). Lý do bỏ B: đánh dấu vào story cũ tạo loại tài liệu nửa sống nửa đóng băng.
  - Ba trạng thái: chờ code, chờ test, xong.
  - Story đã từng được code mà sửa thêm: dòng "Thay đổi chưa xong" ở đầu story, đuôi "chờ code" ở tiêu chí mới hay vừa đổi.
  - Tiêu chí đổi nghĩa thì đổi mã. Máy kiểm story và test khớp nhau.

## Hệ quả
`docs/QUY_TRINH.md` mục 3, 4.1, 4.2, 5 (viết lại), 7, 9, 10; `CLAUDE.md`; `docs/Nguyen_ly_lam_viec.md` nguyên lý 4; `docs/stories/README.md`; `scripts/kiem-tai-lieu.py`. Bộ story được rà lại để mỗi nhóm chức năng một story.

Thay cho: điểm "story đóng băng sau khi merge; đổi tính năng đã xong thì viết story mới" của QD15. Trạng thái gốc: Đang hiệu lực.

## Lịch sử sửa đổi
| Rev | Ngày | Người | Commit hoặc PR | Thay đổi | Mục bị đổi |
|---|---|---|---|---|---|
| r1 | 2026-11-18 | Claude | QD21-lam-lai-tai-lieu | Tách từ `docs/decisions/`, đổi mã QD19 thành QD19 | Cả file |
