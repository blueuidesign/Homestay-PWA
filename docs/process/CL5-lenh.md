---
id: CL5
tieu_de: Lệnh ngắn
trang_thai: de-xuat
nguoi_chu: tung
rev: 16
---
# CL5 · Lệnh ngắn
`[r12 · sửa]` Theo QD26: quy trình của lệnh có skill nằm trong thân skill ở .claude/skills/<tên>/SKILL.md. Thân skill chỉ nạp khi gọi đúng lệnh đó, nên AI không phải đọc quy trình của mọi lệnh. Sửa quy trình của lệnh nào thì sửa trong skill đó. File này chỉ giữ mục lục, và quy trình của các lệnh chưa có skill.

Người dùng gõ lệnh ngắn. AI làm đúng quy trình, không hỏi lại những gì đã có trong repo.

## CL5.17 · Lệnh có skill `[r16 · sửa]`
Tùng nói ngày 2026-11-07: "tôi cần tên skill dễ recall hơn, tốt hơn là dùng cụm từ có từ 2 đến 5 word cho mỗi skill" và "update mô tả của skill cho kỹ để tôi không gọi trực tiếp skill mà skill có thể gọi tự động được." Vì vậy mọi skill đều để AI tự gọi được. Mô tả của mỗi skill ghi rõ dùng khi người dùng nói gì và không dùng khi nào. Người dùng cứ nói bằng lời, không cần nhớ tên lệnh. Gõ `/tên` vẫn chạy được.

| Skill | Làm gì | Tên cũ |
|---|---|---|
| can-lam-gi [tên] [ngan · duyet · day-du] | Việc người hỏi cần làm, bản 5 dòng, việc chờ Tùng duyệt, báo cáo đủ | /viec, /tom-lai, /duyet, /hom-nay |
| xem-tinh-hinh <YC · EP · mã item · us> | Một mảng việc tới đâu, đang chờ ai | /tinh-hinh, /us-nao |
| lam-mot-item <mã> | Làm một item tới lúc mở PR | /lam |
| lam-tu-dong <phạm vi> | Phiên điều phối làm chuỗi item, tự gộp khi Tùng cho phép | |
| gop-code <PR> | Gộp PR, xóa nhánh, đổi trạng thái item theo CL2.9 | |
| test-tay <item> [nhanh · du] | Đức test tay từng kịch bản, ghi kết quả, hỏi điểm cải tiến | |
| nghiem-thu <US · chon · danh-sach> | Tùng nghiệm thu chọn lọc | |
| soan-viec-cho-subagent <mã item> | Soạn gói việc bằng scripts/goi.py, chủ yếu do AI tự gọi | |
| viet-user-story <YC · EP · US> | Viết, sửa US theo CL14, mục Đọc chỉ ghi mã | |
| chot-quyet-dinh <câu Tùng chốt> | Ghi quyết định của Tùng vào QD hoặc câu hỏi mở, kèm câu nguyên văn | |
| hop-cuoi-tuan | Soạn buổi họp thứ Sáu (CL1.3) | xem tuần (CL5.11) |
| kiem-thiet-ke <TK> | Kiểm kết quả TK của phiên Design (CL12.9 bước 3) | kiểm TKn |
| kiem-luong-chinh <item> | AI tự chạy kịch bản [Chính] trên trình duyệt trước khi gộp | |
| chay-tren-may | Dựng app và server thử trên máy cá nhân | |
| deploy-ban-thu <nhánh> | Cập nhật server trên Oracle, deploy Mini App bản Development hoặc Testing | |
| ghi-viec-moi <ý> | Ghi item mới hoặc câu hỏi mở | /ghi |
| bao-loi <mô tả> | Ghi BG | /loi |
| doi-yeu-cau <mã>: <nội dung> | Đổi nghĩa một mục có mã, tìm chỗ ảnh hưởng | /doi |
| sua-tai-lieu, review-tai-lieu | Sửa và review tài liệu theo CL12 | |
| review-code <PR> | Agent review độc lập, chỉ khi Tùng bảo | |
Người dùng gõ tên cũ hay chữ của lệnh cũ ("tóm lại", "US nào", "hôm nay") thì chạy skill ở cột đầu.

Mã cũ không dùng lại (CL3). Chỗ khác trỏ tới mã cũ thì đọc ở đây: CL5.1, CL5.8, CL5.13, CL5.14 nay ở can-lam-gi. CL5.9, CL5.15 nay ở xem-tinh-hinh. CL5.2 ở ghi-viec-moi, CL5.3 ở lam-mot-item, CL5.4 ở doi-yeu-cau, CL5.5 ở bao-loi, CL5.16 ở lam-tu-dong. CL5.6 lập sprint đã bỏ (QD26).

## CL5.7 · tinh chỉnh
Liệt kê item Mới, đề xuất tách, gộp trùng, gắn yêu cầu, ước lượng sơ bộ, item Mới quá 4 tuần. Không sửa THU-TU.md, chỉ đề xuất.

## CL5.11 · xem tuần
Nay ở skill hop-cuoi-tuan `[r16 · sửa]`.

## CL5.10 · họp <file>
Theo CL7.

## CL5.12 · phát hành
Kiểm mọi yêu cầu trong phạm vi đã Đã test OK, chuẩn bị file phát hành. Gửi Zalo cần Tùng duyệt (CL4.3.5).

## Lịch sử sửa đổi
Dòng cũ hơn: [docs/_lich-su/process/CL5-lenh.md](../_lich-su/process/CL5-lenh.md).

| Rev | Ngày | Người | Commit hoặc PR | Thay đổi | Mục bị đổi |
|---|---|---|---|---|---|
| r12 | 2026-11-04 | Tùng | EN56-quy-trinh-moi | Quy trình từng lệnh chuyển vào skill, gộp lệnh báo cáo thành /viec và /tinh-hinh, thêm xem tuần, /review-code, bỏ lập sprint (QD26) | Cả file |
| r13 | 2026-11-04 | Tùng | EN57-chuyen-tai-lieu-cu | Chỉ sửa chữ: chỗ trỏ câu hỏi mở đổi sang mã YC<n>-H<m>, link item đã xong sang done/ (QD26) | Các chỗ trỏ câu hỏi |
| r14 | 2026-11-07 | Tùng | EN63-skill-tu-goi | Đổi tên skill dễ nhớ, mọi skill để AI tự gọi, thêm gop-code, test-tay, nghiem-thu. Tùng: "tôi cần tên skill dễ recall hơn" | CL5.17 sửa |
| r15 | 2026-11-07 | Tùng | EN64-soan-viec-user-story | Thêm soan-viec-cho-subagent, viet-user-story | CL5.17 sửa |
| r16 | 2026-11-07 | Tùng | EN65-skill-thiet-ke-moi-truong | Thêm chot-quyet-dinh, hop-cuoi-tuan, kiem-thiet-ke, kiem-luong-chinh, chay-tren-may, deploy-ban-thu | CL5.17, CL5.11 sửa |
