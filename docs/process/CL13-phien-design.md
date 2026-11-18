---
id: CL13
tieu_de: Phiên Design tự tìm việc và làm
trang_thai: de-xuat
nguoi_chu: tung
rev: 6
---
# CL13 · Phiên Design tự tìm việc và làm

File này dành cho phiên Design (Claude trên claude.ai, giữ canvas "Home247 · Lịch phòng Hạ Long"). Tùng chỉ dán một câu: "Đọc docs/process/CL13-phien-design.md trên main của repo blueuidesign/zalo-miniapp và làm theo." Phiên Design tự đọc repo, tự biết việc nào của mình, làm, rồi ghi kết quả lên repo. Vòng làm việc chung giữa Tùng, Claude Code và Design nằm ở CL12.9. File này là phần của Design trong vòng đó.

## CL13.1 · Việc nào là của Design
`[r2 · sửa]`
Việc của Design là item loại TK (Thiết kế, CL2.1): file work/backlog/TK<số>-*.md. Một item TK là việc cần làm khi:
1. `trang_thai` là `san-sang` hoặc `dang-lam`.
2. Chưa có bản kê work/thiet-ke/<mã>.md, hoặc bản kê đã có nhưng mục "Kết quả kiểm" có dòng Tùng ghi "Bỏ" hay "Sửa lại" chưa được làm.

Việc có `truoc:` mà item trong đó chưa `xong` thì vẫn làm được, trừ khi item đó cũng là việc của Design chưa làm: khi đó làm item kia trước.

Bỏ qua: item trạng thái `moi`, `on-hold`, `huy`, `xong`, `cho-nghiem-thu`. Không làm gì thuộc YC8 (Đội nhóm đang on-hold, QD10). Item DC, EN, SK không phải việc của Design, kể cả khi nhắc tới canvas.

## CL13.2 · Làm theo thứ tự nào
1. Theo `truoc` như trên.
2. Rồi theo thứ tự trong work/backlog/THU-TU.md nếu item có mặt ở đó (CL2.6). `[r2 · sửa]`
3. Còn lại: mã nhỏ trước.

## CL13.3 · Làm một việc
1. Kéo main mới nhất. Đổi `trang_thai` của TK sang `dang-lam`, ghi một dòng Nhật ký, commit "<mã TK> · bắt đầu". `[r4 · sửa]`
2. Đọc file item: "Vì sao sửa" để hiểu vấn đề và quyết định đứng sau, rồi "Đọc" và bảng "Màn phải làm". Mở mọi link YC, HV, QD trong file, đọc đúng mục được trỏ. `[r2 · sửa]`
3. Sửa canvas đúng bảng "Màn phải làm".
4. Ghi lên repo, đúng khuôn:
   - docs/design/screens/<mã màn>.md theo docs/process/templates/man.md. Đã có thì sửa và tăng rev. Màn bỏ thì `trang_thai: bo`.
   - docs/design/screens/INDEX.md: thêm hoặc sửa dòng của màn.
   - work/thiet-ke/<mã TK>.md theo docs/process/templates/ban-ke-thiet-ke.md. Mọi màn bị chạm đều có một dòng, cột "Theo" ghi mã YC, HV hay QD.
   - docs/design/canvas/home247-canvas.html: mã nguồn cả canvas sau khi sửa, ghi đè một file, không cắt từng màn (TK7). `[r3 · thêm]`
5. Trong file TK: đổi `trang_thai` sang `cho-nghiem-thu`; thêm một dòng ở mục Task: `- [ ] <mã TK>-TA<số kế tiếp> Claude Code: kiểm <mã TK> theo CL12.9 bước 3`; ghi một dòng Nhật ký (ngày · Tùng (phiên Design) · đã làm gì · bất ngờ · mất bao lâu). `[r4 · sửa]`
6. Một commit cho phần kết quả, tiếng Việt, mở đầu "<mã item> · ". Đẩy thẳng main (CL4.7). Không đẩy ép. Bị từ chối vì main có commit mới thì kéo về, gộp, đẩy lại.

## CL13.4 · Luật
- Chỉ làm đúng bảng "Màn phải làm". Thấy cần đổi thêm thì vẫn được vẽ, nhưng ghi dòng đó là "Ngoài yêu cầu" trong bản kê. Không sửa lặng lẽ.
- Chỉ ghi vào docs/design/ (gồm docs/design/canvas/), work/thiet-ke/, và trong file TK của việc đang làm chỉ ba chỗ: dòng `trang_thai`, thêm dòng Task kiểm, mục Nhật ký. Không sửa QD, YC, HV, QT, docs/process, phần khác của work/backlog. `[r4 · sửa]`
- Không sửa YC dù thấy YC lệch với hình. Ghi vào "Câu hỏi cho Tùng". Khi kiểm, Claude Code sửa YC cho khớp.
- Item nói khác canvas, hoặc hai item nói khác nhau: không tự chọn. Ghi vào "Câu hỏi cho Tùng" của bản kê, bỏ phần đó, làm tiếp phần khác.
- Vùng bấm tối thiểu 44 px ở mọi màn. Người dùng nhiều người lớn tuổi, cầm máy một tay.
- Cỡ chữ theo mật độ màn `[r5 · sửa]`. Màn càng nhiều thông tin thì chữ càng được nhỏ, vì hiện đủ thông tin quan trọng hơn chữ to:
  - Màn đọc (form, chi tiết, thông báo, popup, cá nhân, đăng nhập): chữ tối thiểu 14 px.
  - Màn dày thông tin (lưới ngày, bảng tuần, lịch giá, danh sách kết quả): chữ nhỏ nhất 12 px. Số trong ô, tiêu đề cột, nhãn trong bảng, chú thích dưới bảng 12 px; tên căn trong lưới 13 px đậm; dòng phụ 12–13 px.
  - Không dùng chữ dưới 12 px. Chữ nhỏ không làm vùng bấm nhỏ đi.
- Không dùng tên thật, số điện thoại thật.

## CL13.5 · Báo lại
Làm xong mọi việc tìm được thì báo Tùng, mỗi việc một dòng: mã item, mã commit, số màn đã sửa, số dòng "Ngoài yêu cầu", câu hỏi còn treo. Không có việc nào thì báo "Không có việc Design nào đang chờ".
Sau đó Tùng bảo phiên Claude Code "kiểm <mã item>" (CL12.9 bước 3). Phiên Claude Code làm theo skill kiem-thiet-ke `[r6 · sửa]`.

## CL13.6 · Phần của Claude Code
`[r2 · sửa]`
Khi Tùng quyết một việc cần sửa canvas, Claude Code tạo item TK theo docs/process/templates/tk.md. Item không chứa prompt cho Design, vì cách làm đã nằm ở file này. Item phải có:
- "Vì sao sửa": vấn đề trên canvas cũ, quyết định của Tùng (mã QD hoặc review, kèm ngày), và nếu không sửa thì hỏng gì. Viết đủ để Design hiểu ý, không chỉ biết việc.
- "Đọc": link tới từng YC, HV, QD liên quan.
- "Màn phải làm": bảng Màn, Loại, Đổi gì, Theo. Cột Theo là link tới YC, HV hoặc QD, kèm bước hay tiêu chí cụ thể.

## Lịch sử sửa đổi
Dòng cũ hơn: [docs/_lich-su/process/CL13-phien-design.md](../_lich-su/process/CL13-phien-design.md).

| Rev | Ngày | Người | Commit hoặc PR | Thay đổi | Mục bị đổi |
|---|---|---|---|---|---|
| r2 | 2026-10-28 | Tùng | claude/compassionate-hawking-fuw51i | Việc của Design là loại TK, bỏ `phien: design` và prompt trong item. Tùng: "đặt TK riêng cho thiết kế... trong các file tk không cần prompt cho design nữa, nhưng hãy viết chi tiết lý do cần sửa. Và có liên kết đến các YC" | CL13.1, CL13.2, CL13.3, CL13.6 sửa |
| r3 | 2026-10-28 | Tùng | claude/compassionate-hawking-fuw51i | Mỗi TK ghi đè canvas HTML vào repo. Tùng chọn lưu một file (TK7) | CL13.3 bước 4 thêm |
| r4 | 2026-10-28 | Tùng | claude/compassionate-hawking-fuw51i | Design tự đổi trạng thái TK (dang-lam, cho-nghiem-thu) và tạo task kiểm cho Claude Code. Tùng: "kiểm TK cũng là một thứ bạn cần làm, nên cũng cần design tạo task đó. Còn lại thì tôi đồng ý với đề xuất của bạn" | CL13.3 bước 1, 5, 6 sửa; CL13.4 sửa |
| r5 | 2026-11-04 | Tùng | TK27-luat-co-chu | Cỡ chữ theo mật độ màn thay cho "chữ tối thiểu 14 px". Tùng: "Không nhất thiết phải trên 14px... Ưu tiên hiện nhiều thông tin thì phải chấp nhận hiện chữ nhỏ" và "sửa lại Claude.md và luật cỡ chữ nhé" | CL13.4 sửa |
| r6 | 2026-11-07 | Tùng | EN65-skill-thiet-ke-moi-truong | Phiên Claude Code kiểm TK theo skill kiem-thiet-ke | CL13.5 sửa |
