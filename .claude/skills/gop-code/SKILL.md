---
name: gop-code
description: "Gộp một PR code đã có lời duyệt và CI xanh, rồi làm hết các việc đi kèm để trạng thái luôn đúng: xóa nhánh, đánh dấu task Code, đổi trạng thái item (sang chờ test, hoặc xong nếu item không cần test tay), ghi nhật ký, đẩy thay đổi item lên main. Dùng khi người có quyền gộp nói kiểu: \"gộp PR #154\", \"merge US12\", \"gộp các PR BG3, BG4\", \"PR này ổn, gộp đi\", và khi lam-tu-dong gộp một item trong phạm vi Tùng giao. Không dùng khi chưa có lời duyệt theo CL4.6 cho PR thuộc CL4.3, khi CI chưa xanh, hoặc để gộp nhánh tài liệu không có PR."
argument-hint: "<số PR hoặc mã item> [lời duyệt]"
---

PR cần gộp: $ARGUMENTS. Mỗi PR làm lần lượt các bước dưới. Hiện PR gộp vào main. Khi có QD về nhánh giai đoạn thì đích gộp theo QD đó.

1. **Lời duyệt.** Xác định PR thuộc CL4.2 (Đức duyệt được) hay CL4.3 (cần Tùng). PR thuộc CL4.3 chỉ gộp khi có lời duyệt theo một trong ba cách ở CL4.6. Chữ "đồng ý" chung chung không tính. Không có thì dừng, ghi `can_duyet` vào item, báo cần ai duyệt.
2. **Kiểm.** CI của commit đầu PR xanh: `gh api repos/{owner}/{repo}/commits/<sha>/check-runs`. Nhánh không xung đột với đích gộp. Không có file test bị sửa sau bước viết test trước (item rủi ro cao). Không đạt thì dừng và báo lý do, không lách hook.
   **PR xếp chồng** (nhánh đích không phải main): chỉ gộp sau khi PR bên dưới đã gộp, và kiểm nhánh đích bằng `gh api repos/{owner}/{repo}/pulls/<số> --jq .base.ref`. Đích vẫn là nhánh trung gian thì đổi sang main trước: `gh api -X PATCH repos/{owner}/{repo}/pulls/<số> -f base=main`. Gộp vào nhánh trung gian thì code không tới main (đã xảy ra với #160, #161 ngày 09/11/2026).
3. **Gộp.** `gh api -X PUT repos/{owner}/{repo}/pulls/<số>/merge -f merge_method=merge`. Hook trước khi gộp tự kiểm CI lần nữa (CL4.9). Gộp xong thì xóa nhánh: `gh api -X DELETE repos/{owner}/{repo}/git/refs/heads/<nhánh>`. Không xóa nhánh `main` hay nhánh giai đoạn.
4. **Bình luận** lên PR: ai duyệt, theo cách nào ở CL4.6, ngày. Gộp theo lệnh trong phiên thì ghi "Gộp theo lệnh của Tùng trong phiên Claude Code, ngày ...".
5. **Đánh dấu task.** Trong file item, đánh dấu các task Code mà PR này làm, ghi số PR cạnh task. Thêm số PR vào trường `pr`.
6. **Đổi trạng thái theo CL2.9.** Còn task Code chưa đánh dấu thì giữ `dang-lam`. Mọi task Code đã đánh dấu thì:
   - Item cần test tay (US, BG, EN có màn): sang `cho-test`.
   - Item không cần test tay (EN không có màn): sang `xong`, chuyển file vào work/backlog/done/<yyyy-mm>/, xóa gói việc của item trong work/goi/.
7. **Rút gọn file item.** Task vừa đánh dấu chỉ giữ một dòng mã và PR. Xóa phần Kế hoạch của các task đó. Bằng chứng dài thì thay bằng lệnh, kết quả ngắn và link PR. Mục đích là file item dưới 7.500 ký tự (rules/work.md).
8. **Nhật ký** một dòng dưới 200 ký tự: ngày · người · gộp PR #n · trạng thái mới · ghi chú.
9. **Đẩy** thay đổi file item lên main bằng một commit mở đầu bằng mã item. Chạy `python3 scripts/plan.py` nếu item đổi trạng thái, để bảng tình hình và trần chờ người đếm đúng.
10. **Báo** một dòng mỗi PR: mã, PR, trạng thái mới, việc kế của ai (ví dụ "Đức test tay US12, chạy test-tay US12 nhanh").
