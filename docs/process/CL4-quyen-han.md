---
id: CL4
tieu_de: Quyền hạn
trang_thai: de-xuat
nguoi_chu: tung
rev: 9
---
# CL4 · Quyền hạn

| Mã | Mức | Gồm |
|---|---|---|
| CL4.1 | AI tự làm, báo sau | Tạo item Mới. Soạn nháp tài liệu, ghi item và nhật ký (thẳng main theo CL4.7). Code, test trên nhánh, mở PR (CL4.7). `[r7 · sửa]` Chạy test. Ghi nhật ký. Mở PR. Báo cáo. Đề xuất |
| CL4.2 | Đức duyệt | Gộp PR code rủi ro thấp, trung bình. Thêm thư viện. Đổi cấu trúc module trong khuôn QD đã chốt. Migration ở môi trường thử |
| CL4.3.1 | Tùng duyệt trước | Chốt hoặc đổi YC, QT, PQ, HV |
| CL4.3.2 | Tùng duyệt trước | Đổi Product Goal, thứ tự backlog, trần chờ người (CL1.2) `[r7 · sửa]` |
| CL4.3.3 | Tùng duyệt trước | Gộp PR rủi ro cao |
| CL4.3.4 | Tùng duyệt trước | Xóa, sửa, xuất dữ liệu thật. Migration production |
| CL4.3.5 | Tùng duyệt trước | Phát hành, gửi duyệt Zalo, xin quyền Zalo |
| CL4.3.6 | Tùng duyệt trước | Đổi docs/process/, CLAUDE.md, .claude/, .github/ |
| CL4.3.7 | Tùng duyệt trước | Dịch vụ trả phí, tài khoản, khóa bí mật |
| CL4.3.8 | Tùng duyệt trước | Liên hệ người dùng thật, đăng gì ra ngoài |
| CL4.4 | Cấm | Đẩy ép. Đẩy thẳng vào main việc thuộc CL4.3 hoặc code (CL4.7). Lách hook (CL4.9) `[r7 · sửa]`. Đọc .env, khóa bí mật. Tắt, xóa, sửa test để cho qua. Sửa dòng [tự sinh]. Gộp PR khi không có lệnh gộp của Tùng (CL4.6). Dùng tài khoản GitHub của Tùng | `[r3 · sửa]`

## CL4.5 · Cách xin và cách duyệt
1. Item ghi quyền cần: can_duyet: [CL4.3.4].
2. AI dừng, mở PR nháp ghi: xin gì, vì sao, làm gì nếu được duyệt, quay lại thế nào nếu hỏng.
3. Tùng duyệt bằng nút Approve, tự gộp PR trên GitHub, hoặc ra lệnh gộp trong phiên Claude Code theo CL4.6. `[r2 · sửa]`
4. Chữ "đồng ý" chung chung trong chat không tính. Chỉ lệnh gộp rõ ràng theo CL4.6 mới tính. `[r2 · sửa]`

## CL4.6 · Tạm thời khi còn dùng chung tài khoản
`[r2 · sửa]`
Hai người dùng chung tài khoản Claude và GitHub, nên máy không phân biệt được ai duyệt. Khi đó lời duyệt PR thuộc CL4.3 là một trong hai:
1. Tùng tự bấm gộp trên web GitHub.
2. Tùng ra lệnh gộp trong phiên Claude Code: phiên bắt đầu bằng "Tôi là Tùng" và lệnh nêu rõ PR nào (số PR, hoặc "gộp hết" kèm danh sách AI vừa liệt kê). AI gộp đúng các PR đó, không gộp PR khác, và ghi bình luận vào từng PR: "Gộp theo lệnh của Tùng trong phiên Claude Code, ngày ...". PR gộp bằng lệnh vẫn mở để Tùng bình luận sau.

3. Tùng ra lệnh làm tự động trong phiên Claude Code (CL5.16): phiên bắt đầu bằng "Tôi là Tùng", lệnh nêu rõ phạm vi item. Trong phiên đó AI tự ra lệnh gộp, không hỏi lại: gộp PR của các item trong phạm vi khi đã kiểm theo skill /lam-tu-dong mục 6, kể cả PR sửa docs/process, CLAUDE.md, .claude/, .github/; trừ PR ở mục 8 của skill đó. Bình luận trên PR ghi lệnh gốc và ngày. `[r7 · sửa]`

AI không bao giờ tự ý gộp PR thuộc CL4.3 khi chưa có lệnh như trên.
Rủi ro chấp nhận: ai mở phiên Claude Code và gõ "Tôi là Tùng" cũng ra lệnh gộp được. Bình luận trên PR là dấu vết để Tùng kiểm lại. Hết rủi ro này khi tách tài khoản (QD6, EN6), lúc đó bỏ cách 2.

## CL4.7 · Khi nào cần nhánh, khi nào đẩy thẳng main
`[r7 · sửa]` Theo QD26.
1. **Luôn qua nhánh <mã>-<tên-ngắn> và PR:** mọi thay đổi trong src/, tests/ (trừ dòng kết quả trong tests/kb), tools/, .github/, kể cả sửa lỗi nhỏ; mọi việc thuộc CL4.3, vì lời duyệt chính là việc gộp PR (CL4.5, CL4.6). Lý do: code đẩy thẳng main thì CI và review không bao giờ thấy nó.
2. **Đẩy thẳng main:** tài liệu không thuộc CL4.3.1, item, nhật ký, trạng thái, review, kế hoạch, câu hỏi mở, điểm cải tiến CT, kết quả test tay ghi trong tests/kb `[r9 · sửa]`.
3. Cách đẩy thẳng: kéo main mới nhất trước, commit nhỏ, tiếng Việt, mở đầu bằng mã item. Vẫn tăng rev, thêm dòng Lịch sử sửa đổi và thẻ rev theo CL12. Không đẩy ép. Đẩy bị từ chối vì main đã đổi thì kéo về và gộp, không ép.
4. Nghi việc có thuộc CL4.3 không thì coi là có, dùng nhánh và PR.
5. Hook trước khi đẩy chặn commit lên main chạm src/, tests/ (trừ tests/kb/), docs/process/, CLAUDE.md, .claude/, .github/ hay đổi trạng_thai của YC, QT, QD (CL4.9).
Không có bảo vệ nhánh trên GitHub vì không dùng gói trả phí (QD26). Hook thay cho nó.

## CL4.8 · Giao việc qua Telegram
`[r4 · thêm]`
Tùng và Đức mỗi người dùng một tài khoản Telegram riêng. Bot chỉ nhận tin từ hai Telegram user ID ghi trong cấu hình. Tin từ ID khác thì bỏ qua.
1. Tin từ ID của Tùng có hiệu lực như lời Tùng trong phiên Claude Code bắt đầu bằng "Tôi là Tùng". Tin đó là quyết định. Lệnh gộp nêu rõ PR nào thì tính là lời duyệt theo CL4.6.
2. Tin từ ID của Đức có hiệu lực như lời Đức trong phiên Claude Code: là đề xuất, trừ việc thuộc CL4.2.
3. AI gửi báo cáo cho cả hai người. Bình luận khi gộp PR ghi "Gộp theo lệnh của Tùng qua Telegram, ngày ...".
4. Tùng bật khóa máy và mật khẩu hai lớp cho Telegram.
Rủi ro chấp nhận: ai cầm được máy đang đăng nhập Telegram của Tùng thì có quyền như Tùng.

## CL4.9 · Hook chặn bằng máy
`[r7 · thêm]` Cấu hình trong .claude/settings.json, chạy cả trong agent phụ. Lời dặn có thể bị quên, hook thì luôn chạy.
| Hook | Chặn gì |
|---|---|
| Trước khi đẩy (scripts/hook/truoc-push.sh) | Commit lên main thuộc CL4.7 mục 5. Luôn chạy scripts/kiem.py và in cảnh báo |
| Trước khi gộp PR (scripts/hook/truoc-gop.sh) | PR chưa có CI xanh. Bỏ qua chỉ khi Tùng cho phép, bằng biến HOME247_BO_KIEM_CI=1, và ghi vào bình luận PR |
| Đầu phiên (scripts/hook/dau-phien.sh) | Không chặn. In số item mỗi cột, trần chờ người, lỗi kiem.py |
Hook chặn sai thì báo lại nguyên văn lỗi của hook cho người dùng, không tìm cách lách.

## Lịch sử sửa đổi
Dòng cũ hơn: [docs/_lich-su/process/CL4-quyen-han.md](../_lich-su/process/CL4-quyen-han.md).

| Rev | Ngày | Người | Commit hoặc PR | Thay đổi | Mục bị đổi |
|---|---|---|---|---|---|
| r5 | 2026-10-29 | Đức | EN38-giao-viec-qua-telegram | Chỉ sửa chữ: dòng r4 ghi nhầm mã EN31, đúng là EN38 | Lịch sử sửa đổi |
| r6 | 2026-11-03 | Tùng | EN50-lam-tu-dong | Thêm cách duyệt thứ ba: lệnh làm tự động có phạm vi rõ. Tùng nói ngày 2026-11-03: "hãy làm tiếp các US khác một cách tự động sau khi US hiện tại xong. Gộp PR mỗi khi một US xong rồi làm US tiếp. Nếu có US nào bị phụ thuộc vào cái khác thì chọn cái khác để làm cho đến hết các US. Mở Agent phụ với quyền by pass permission. Lưu cái này lại thành một skill chung cho các task muốn làm tự động (không chỉ US)" và "ngoài ra hãy chọn model phù hợp cho độ phức tạp của US. hướng dẫn này cũng đưa vào skill" | CL4.6 thêm mục 3 |
| r7 | 2026-11-04 | Tùng | EN56-quy-trinh-moi | Code luôn qua PR, hook thay bảo vệ nhánh, bỏ chữ sprint (QD26) | CL4.1, CL4.3.2, CL4.4, CL4.6 mục 3, CL4.7 sửa, CL4.9 thêm |
| r8 | 2026-11-04 | Tùng | EN57-chuyen-tai-lieu-cu | Chỉ sửa chữ: chỗ trỏ câu hỏi mở đổi sang mã YC<n>-H<m>, link item đã xong sang done/ (QD26) | Các chỗ trỏ câu hỏi |
| r9 | 2026-11-07 | Tùng | EN63-skill-tu-goi | Kết quả test tay ở tests/kb và CT đẩy thẳng main, hook không chặn tests/kb/ | CL4.7 sửa |
