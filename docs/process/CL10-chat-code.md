---
id: CL10
tieu_de: Phiên làm việc Claude và Claude Code
trang_thai: de-xuat
nguoi_chu: tung
rev: 1
---
# CL10 · Phiên làm việc

## CL10.1 · Đặt tên phiên
<Người> · <mã item hoặc loại> · <tên ngắn>. Ví dụ: T · YC1 · đặc tả đăng nhập · Đ · US12 · tìm căn trống.
Câu đầu tiên trong phiên: "Người đang làm: Tùng" hoặc "Đức". Claude Code: tên phiên trùng tên nhánh, đổi bằng /rename.

## CL10.2 · Claude (chat trong Project Homestay)
Đặc tả YC, so phương án QD, thiết kế (Claude Design), hỏi nhanh (hôm nay, tình hình). Chat chỉ đọc nhánh main đã đồng bộ. Kết quả đưa vào repo qua Claude Code.

## CL10.3 · Claude Code trên cloud
Code app và database, test tự động. Việc tài liệu. Dựng khung, script. Sinh backlog, soạn xem tuần (CL5.11), review. Báo cáo theo lịch.
Không đưa khóa bí mật, khóa production, dữ liệu thật vào cloud. Chỉ dùng staging với dữ liệu mẫu DLM.

## CL10.4 · Claude Code trên máy của Đức
Chạy app trên điện thoại cùng wifi, test tay KB, lỗi chỉ có trên một loại máy hay một trình duyệt, việc cần tài khoản của Tùng (GitHub, Vercel, Supabase: VIEC_TAY_CUA_TUNG.md), thao tác dữ liệu thật (luôn cần CL4.3.4). Kéo phiên cloud về máy bằng claude --teleport.

## CL10.5 · Vòng đời
Một phiên một item. Mỗi người tối đa 2 phiên đang làm. Kết thúc: ghi nhật ký, mở PR, báo ba dòng. Item xong thì lưu trữ phiên.

## CL10.6 · Chọn model cho việc giao chạy nền Tùng nói ngày 2026-11-03: "Chạy trong background tự chọn model cho phù hợp, đừng dùng opus nếu việc đơn giản, có chỉ thị rõ ràng", "ưu tiên chất lượng hơn việc tiết kiệm token" và "cập nhật cả việc dùng model phù hợp cho background task vào trong tài liệu hướng dẫn nhé."

Khi một phiên Claude Code giao việc cho agent chạy nền (background task, subagent), phiên đó chọn model theo việc, và nói model đã chọn cho người dùng biết.

| Model | Chọn khi | Ví dụ |
|---|---|---|
| opus | Việc phải suy luận hoặc rà nhiều file, đặc tả chưa rõ, chạm tiền, chặn trùng, quyền, dữ liệu người dùng. Rà soát, review, đối chiếu design với YC. Sửa YC theo quyết định có nhiều chỗ ảnh hưởng | Rà vênh design và YC, kiểm task Thiết kế |
| sonnet | Chỉ thị rõ, biết trước file nào, việc cụ thể | Đổi chữ trong vài file theo danh sách, thêm một mục vào tài liệu theo nội dung đã cho |
| haiku | Việc cơ học hoàn toàn. Ít dùng | Đổi một chữ hàng loạt theo bảng |

Quy tắc:
- Không dùng opus cho việc đơn giản có chỉ thị rõ.
- Phân vân giữa hai mức thì chọn mức cao hơn, vì ưu tiên chất lượng hơn tiết kiệm token.
- Agent thấy việc khó hơn dự kiến thì dừng và báo. Phiên chính giao lại với model cao hơn.
- Task Code trong US, EN, BG chọn model theo CL14.6a.
- Agent review (.claude/agents/review.md) luôn là opus, chỉ chạy khi Tùng bảo. Skill chỉ đọc và báo cáo (can-lam-gi, xem-tinh-hinh) chạy sonnet, ghi ở trường `model` của skill.
- Agent phụ làm task Code nhận gói việc (docs/process/templates/goi-viec.md) và chỉ đọc gói việc cùng code. Báo lại tối đa 10 dòng. Agent phụ này là agent `code` ở .claude/agents/code.md. Agent đó không nạp CLAUDE.md, vì bất biến đã chép vào gói việc, và cách làm đã ghi trong agent nên lệnh giao chỉ cần mã item, gói việc, nhánh, model.
- **Một item một agent**. Tùng nói ngày 2026-11-06: "những việc thuộc cùng ngữ cảnh nên làm bởi cùng 1 agent. Dĩ nhiên những việc cần tách ra như review thì vẫn nên làm để tránh tự sai sót do vừa làm vừa check." Mặc định một agent làm hết task Code của một item trên một nhánh, một PR, model ở mức cao nhất mà các task cần (CL14.6a). Mỗi agent phụ phải đọc lại tài liệu và code từ đầu, và chỉ biết việc agent trước làm qua vài dòng báo cáo, nên tách theo task làm tốn token và dễ lệch. Chỉ tách thêm agent khi có một trong bốn lý do, ghi lý do vào gói việc:
  1. Cần độc lập: review, viết test trước cho task rủi ro cao (CL14.5), soạn test case từ đặc tả.
  2. Đổi model tiết kiệm rõ: phần lớn item là việc sonnet, phần cần opus tách được gọn.
  3. Ngữ cảnh sắp tràn: item có hơn khoảng 6 task Code hoặc chạm hơn 15 file.
  4. Chạy song song thật trên các file khác nhau.

## CL10.7 · Log phiên Tùng nói ngày 2026-11-09: "tôi cần thêm phần ghi log... để sau này tôi cho bạn đánh giá lại quy trình" và "log không chỉ ghi con số, mà nên ghi về thông tin làm việc của nó thì mới đánh giá được, ví dụ đã mở file gì, quy trình làm ra sao."

Mỗi phiên Claude Code tự ghi một file log, để sau này xem phiên đó tốn bao nhiêu và đã làm theo quy trình chưa.
- **Ai ghi.** Hook Stop và SessionEnd chạy scripts/hook/ghi-log-phien.py. Script đọc transcript của phiên (cả agent phụ) và ghi ra từng bước: lượt người dùng nói (chỉ số thứ tự và độ dài), skill được gọi, file mở (cả file hay một đoạn), mã trích bằng trich.py, gói việc, lệnh kiem, test, git, gh, agent phụ với model, lỗi và lần bị hook chặn. Phần đầu file tóm tắt: người làm, nhánh, item, PR, token theo model, chi phí USD theo số Claude Code ghi.
- **Không chứa gì.** Không chép lời chat, không chép nội dung file hay kết quả lệnh. Lệnh shell cắt còn 100 ký tự và che số điện thoại.
- **Lưu ở đâu.** Nhánh riêng `nhat-ky-phien`, mỗi phiên một file phien/<ngày>-<8 ký tự đầu session>.json. Không lưu trên main để log không làm rối lịch sử code và không chạm hook CL4.9. Bản nháp nằm ở .git/home247-log/ của máy đang chạy.
- **Khi nào đẩy.** Lúc kết thúc phiên, và ở hook Stop nếu lần đẩy trước đã quá 30 phút. Phiên cloud có thể bị thu hồi mà không chạy SessionEnd, nên cần mốc 30 phút. Đẩy tay: `python3 scripts/hook/ghi-log-phien.py --day`. Lỗi khi ghi log không bao giờ chặn việc chính.
- **Nén context.** Khi context bị nén, phiên cloud ghi lại transcript chỉ còn phần sau lần nén. Script giữ phần trước từ log cũ rồi nối vào, đánh dấu bước `nen-context`.
- **Đọc log.** `python3 scripts/log-tong.py` in tổng token và chi phí theo người, theo item, skill nào được gọi, và các dấu hiệu lệch quy trình: mở cả file tài liệu lớn thay vì trích, mở PR khi chưa chạy test, nhiều agent phụ cho một item, bị hook chặn, không rõ ai làm. Thêm `--tu <ngày>`, `--item <mã>`, `--chi-tiet <8 ký tự session>` để xem từng bước. Skill hop-cuoi-tuan dùng lệnh này cho phần chi phí tuần.

## Lịch sử sửa đổi
| Rev | Ngày | Người | Commit hoặc PR | Thay đổi | Mục bị đổi |
|---|---|---|---|---|---|
| r1 | 2026-11-18 | Claude | QD21-lam-lai-tai-lieu | Chép từ bản Zalo r5, sửa cho bản PWA (QD21). Lịch sử cũ ở repo zalo-miniapp | Cả file |
