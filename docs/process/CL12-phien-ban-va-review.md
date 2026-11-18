---
id: CL12
tieu_de: Phiên bản tài liệu và review
trang_thai: de-xuat
nguoi_chu: tung
rev: 8
---
# CL12 · Phiên bản tài liệu và review

## Vì sao cần
Tài liệu yêu cầu sửa thường xuyên. Một kết quả review viết cho bản cũ sẽ âm thầm sai khi tài liệu đổi. Người đọc review không biết mục nào đã đổi sau lúc review, nên tin vào nhận xét không còn đúng, hoặc bỏ sót phần mới chưa ai đọc.

Cách giải: mỗi lần sửa tài liệu đều có số. Mỗi mục bị sửa mang số của lần sửa gần nhất. Mỗi review ghi rõ đã đọc số nào. So hai số là biết mục nào review còn đúng, mục nào phải đọc lại.

So sánh đời thường: giống bản vẽ xây nhà có ô "sửa lần 3, ngày..." ở góc, và chỗ sửa khoanh đám mây kèm số 3. Thợ cầm bản lần 2 nhìn đám mây số 3 là biết chỗ đó mình chưa thấy. Giới hạn của phép so sánh: bản vẽ chỉ khoanh lần sửa mới nhất, nên ở đây cũng vậy. Muốn xem các lần sửa trước thì đọc bảng lịch sử và git.

## CL12.1 · Áp dụng cho file nào
Mọi file .md trong docs/, trừ:
- Các file INDEX.md (mục lục, sẽ do script sinh).
- docs/process/templates/ (khuôn, không phải tài liệu).
- docs/chuc-nang/ (tài liệu cũ sắp xóa).
work/ không áp dụng. Item, sprint, biên bản đã có Nhật ký riêng.

## CL12.2 · Số rev của file
- Đầu file có `rev: N`. N bắt đầu từ 1, tăng 1 mỗi lần một PR sửa file được gộp vào main.
- Một PR sửa file nhiều lần vẫn chỉ tăng 1.
- rev khác "bản" của một yêu cầu (CL6). rev đếm mọi lần sửa file, kể cả sửa chữ. "bản" chỉ tăng khi nghĩa của một yêu cầu đổi. Bản tăng thì rev chắc chắn tăng. Rev tăng thì bản chưa chắc tăng.
- Ví dụ: YC3 đang rev 4. PR sửa lỗi chính tả ở YC3.2 và đổi giá tối đa ở YC3.5-NT2. File lên rev 5. YC3.2 vẫn bản 1. YC3.5 lên bản 2.

## CL12.3 · Lịch sử sửa đổi
Cuối file có mục `## Lịch sử sửa đổi`. Mỗi rev một dòng, dòng mới ở dưới cùng. `[r7 · sửa]`

| Rev | Ngày | Người | Commit hoặc PR | Thay đổi | Mục bị đổi |
|---|---|---|---|---|---|
| r1 | 2026-10-23 | Tùng | #12 | Bản đầu từ canvas | Cả file |
| r2 | 2026-11-02 | Tùng | #31 | Chốt cách tính giá bán theo QD12 | YC5.4 sửa, YC5.4-NT4 thêm, YC5.6 sửa |

- Cột "Mục bị đổi" ghi mã và một trong ba chữ: thêm, sửa, bỏ. Không có mã thì ghi tên mục.
- r1 của các file có trước ngày 26/10/2026 là mốc ban đầu: nội dung tại commit ghi trong dòng r1. Thay đổi trước đó xem git log.
- Lần đầu thêm `rev: 1` và mục Lịch sử sửa đổi vào một file không tính là một lần sửa.
- PR chưa có số khi soạn thì ghi tên nhánh, sửa thành số PR trước khi gộp.
- `[r7 · thêm]` Trong file chỉ giữ 5 dòng mới nhất. Dòng cũ hơn chuyển sang `docs/_lich-su/<cùng đường dẫn>.md`, giữ nguyên dạng bảng. AI không đọc thư mục docs/_lich-su trừ khi được nhờ hoặc khi review cần (CL12.6). Lý do: agent cần biết tài liệu nói gì bây giờ, còn thẻ `[rN]` ở từng mục và git log đã đủ để biết review còn đúng tới đâu.
- `[r7 · thêm]` Cột Thay đổi ghi ngắn. Câu nguyên văn của Tùng chỉ ghi ở QD hoặc câu hỏi mở (work/cau-hoi.md), ở đây ghi mã QD hay mã câu hỏi.

## CL12.4 · Thẻ đánh dấu trong nội dung
- Mục bị thêm hoặc sửa mang thẻ ngay dưới tiêu đề của mục: `` `[r5 · sửa]` `` hoặc `` `[r5 · thêm]` ``.
- Dòng tiêu chí, dòng quy tắc, dòng câu hỏi bị đổi thì gắn thẻ ở cuối dòng.
- Mục bị bỏ giữ nguyên tiêu đề và mã (mã không dùng lại), thay nội dung bằng một dòng: `` `[r5 · bỏ]` `` và lý do.
- Thẻ chỉ ghi lần sửa gần nhất. Sửa lại lần nữa thì thay số, không xếp chồng.
- Nội dung r1 không có thẻ.
- Thẻ đặt ở mục nhỏ nhất có mã. Sửa YC3.5-NT2 thì gắn ở dòng NT2, không gắn cả YC3.5.

## CL12.5 · Review
- Mỗi lần review là một file work/reviews/RV<n>-<ten-ngan>.md theo khuôn docs/process/templates/review.md.
- Đầu file ghi từng tài liệu đã đọc, kèm rev và commit của main lúc đọc. Commit giữ được đúng chữ đã đọc, kể cả khi ai đó quên tăng rev.
- Mỗi phát hiện có mã RVn-Fm, mức (cao, tb, thap), mục bị ảnh hưởng (mã), nội dung, đề xuất, và cột Xử lý để Tùng điền.
- File review không sửa sau khi gộp, trừ cột Xử lý. Review lại là file mới.

## CL12.6 · Review còn đúng tới đâu
Một nhận xét về mục X còn đúng khi thẻ trên mục X có số rev nhỏ hơn hoặc bằng rev đã review. Mục mang thẻ lớn hơn là đã đổi sau review, phải đọc lại.

Ví dụ: RV1 đọc YC3 ở r1. Sau đó YC3 lên r3, YC3.5 mang `[r3 · sửa]`. Nhận xét RV1-F7 về YC3.5 hết hiệu lực. Nhận xét về YC3.2 (không có thẻ) vẫn đúng.

Review lần sau chỉ cần đọc các mục có thẻ lớn hơn rev lần trước, cộng các nhận xét cũ chưa xử lý. Đó là review theo phần đổi, rẻ hơn đọc lại cả file.

## CL12.7 · Lệnh
- /sua-tai-lieu: sửa một tài liệu đúng quy ước này.
- /review-tai-lieu: review một hoặc nhiều tài liệu và ghi file RV.

## CL12.8 · Giới hạn
Quy ước này dựa vào người sửa tự gắn thẻ. Quên gắn thì review cũ trông như vẫn đúng. Cách phòng hiện tại: /review-tai-lieu so commit đã đọc với commit hiện tại bằng git diff, nên vẫn thấy chỗ đổi không có thẻ. Khi có script (EN2) thì kiểm tự động: file đổi mà rev không tăng, hoặc mục đổi mà không có thẻ, thì PR báo đỏ.


## CL12.9 · Vòng sửa thiết kế
`[r6 · sửa]`
Chức năng chốt ở repo (QD, YC). Canvas làm theo. Phiên Design không tự đổi chức năng, nhưng được ghi lại chỗ thấy cần đổi để Tùng quyết. Giống designer sửa theo biên bản họp với stakeholder.
1. Tùng quyết (qua review hoặc QD). Claude Code sửa QD, YC và tài liệu liên quan, rồi tạo item TK giao Design (CL13.6): vì sao sửa, màn nào, đổi gì, theo mã nào `[r4 · sửa]`.
2. Tùng bảo phiên Design: "Đọc docs/process/CL13-phien-design.md trên main của repo blueuidesign/zalo-miniapp và làm theo." Design tự tìm item của mình (CL13.1), sửa canvas `[r3 · sửa]` rồi tự ghi lên repo (đẩy thẳng main, CL4.7), commit mở đầu bằng mã item:
   - mô tả mỗi màn bị đổi: docs/design/screens/<mã màn>.md, theo khuôn templates/man.md, tăng rev;
   - dòng mới hoặc sửa trong bảng đăng ký màn docs/design/screens/INDEX.md;
   - bản kê thay đổi: work/thiet-ke/<mã item>.md, theo khuôn templates/ban-ke-thiet-ke.md.
   - file TK: trạng thái `dang-lam` khi bắt đầu, `cho-nghiem-thu` khi xong, kèm một task "Claude Code: kiểm <mã TK>" (CL13.3). `[r5 · sửa]`
   Design không sửa QD, YC, quy tắc và docs/process.
3. Tùng bảo phiên Claude Code "kiểm <mã TK>", hoặc Claude Code thấy task kiểm chưa xong khi trả lời "cần làm gì". Claude Code làm trọn một lượt: `[r5 · sửa]`
   - đọc bản kê trên main, kiểm với bảng "Màn phải làm": mỗi dòng Khớp hoặc Lệch, ghi vào mục Kết quả kiểm;
   - sửa YC cho khớp hình: mã màn mới, dòng "Màn hình:", chỗ ghi "chưa vẽ (TKn)", mã đề xuất đã được Design xác nhận hay đổi. Sửa theo CL12, qua PR (CL4.3.1);
   - dòng "Ngoài yêu cầu": Tùng quyết Giữ (Claude Code sửa YC hay QD) hoặc Bỏ (Claude Code ghi vào Kết quả kiểm để Design sửa lại);
   - mọi dòng Khớp và Tùng đã quyết hết dòng "Ngoài yêu cầu": TK sang `xong`, bản kê `trang_thai: da-kiem`. Còn Lệch hay còn dòng Bỏ: TK về `dang-lam`, Nhật ký ghi lý do, Design làm lại theo CL13.1;
   - đánh dấu xong task kiểm, ghi Nhật ký.
4. Trước khi viết User Story cho một YC: review tổng thể (/review-tai-lieu) đối chiếu YC với mô tả các màn của YC đó, hai chiều. Mỗi bước và tiêu chí của YC có màn làm được và nói cùng một điều. Mỗi màn có YC đòi. Còn lệch thì chưa viết US.

Một thông tin một chỗ: YC giữ "phải làm gì", mô tả màn giữ "trông thế nào". YC hiện còn chép chữ và nút từ canvas. Tách dần mỗi khi sửa một YC.

## Lịch sử sửa đổi
Dòng cũ hơn: [docs/_lich-su/process/CL12-phien-ban-va-review.md](../_lich-su/process/CL12-phien-ban-va-review.md).

| Rev | Ngày | Người | Commit hoặc PR | Thay đổi | Mục bị đổi |
|---|---|---|---|---|---|
| r4 | 2026-10-28 | Tùng | claude/compassionate-hawking-fuw51i | Việc giao Design dùng loại TK | CL12.9 bước 1 sửa |
| r5 | 2026-10-28 | Tùng | claude/compassionate-hawking-fuw51i | Design đổi trạng thái TK và tạo task kiểm; Claude Code kiểm trọn một lượt: bản kê, sửa YC, đổi trạng thái TK | CL12.9 bước 2, 3 sửa |
| r6 | 2026-10-28 | Tùng | claude/compassionate-hawking-fuw51i | Chỉ sửa chữ: CL12.9 bị chèn nhầm vào giữa câu của CL12.3 nên không hiện thành mục riêng. Chuyển về sau CL12.8, nội dung giữ nguyên | CL12.3 sửa, CL12.9 sửa |
| r7 | 2026-11-04 | Tùng | EN56-quy-trinh-moi | Giữ 5 dòng lịch sử trong file, dòng cũ sang docs/_lich-su, không chép câu nguyên văn (QD26) | CL12.3 sửa |
| r8 | 2026-11-04 | Tùng | EN57-chuyen-tai-lieu-cu | Chỉ sửa chữ: chỗ trỏ câu hỏi mở đổi sang mã YC<n>-H<m>, link item đã xong sang done/ (QD26) | Các chỗ trỏ câu hỏi |
