---
id: CL13
tieu_de: Phiên Design tự tìm việc và làm
trang_thai: de-xuat
nguoi_chu: tung
rev: 1
---
# CL13 · Phiên Design tự tìm việc và làm

File này dành cho phiên Design (Claude trên claude.ai, giữ canvas "Home247 · Lịch phòng Hạ Long"). Tùng chỉ dán một câu: "Đọc docs/process/CL13-phien-design.md trên main của repo blueuidesign/Homestay-PWA và làm theo." Phiên Design tự đọc repo, tự biết việc nào của mình, làm, rồi ghi kết quả lên repo. Vòng làm việc chung giữa Tùng, Claude Code và Design nằm ở CL12.9. File này là phần của Design trong vòng đó.

## CL13.1 · Việc nào là của Design
Việc của Design là task loại Thiết kế (CL2.8) trong item ở work/backlog/ (US, EN, BG): dòng `- [ ] <mã>-TA<n> Thiết kế · Design: ...`. Một task Thiết kế là việc cần làm khi:
1. Task chưa tick và item có `trang_thai` là `san-sang` hoặc `dang-lam`.
2. Chưa có bản kê work/thiet-ke/<mã item>.md, hoặc bản kê đã có nhưng mục "Kết quả kiểm" có dòng Tùng ghi "Bỏ" hay "Sửa lại" chưa được làm.

Việc có `truoc:` mà item trong đó chưa `xong` thì vẫn làm được, trừ khi item đó cũng là việc của Design chưa làm: khi đó làm item kia trước.

Bỏ qua: item trạng thái `moi`, `on-hold`, `huy`, `xong`, `cho-nghiem-thu`. Không làm gì thuộc YC14 (Đội nhóm, bản sau). Task khác loại Thiết kế không phải việc của Design, kể cả khi nhắc tới canvas.

## CL13.2 · Làm theo thứ tự nào
1. Theo `truoc` như trên.
2. Rồi theo thứ tự trong work/backlog/THU-TU.md nếu item có mặt ở đó (CL2.6). 3. Còn lại: mã nhỏ trước.

## CL13.3 · Làm một việc
1. Kéo main mới nhất. Item đang `san-sang` thì đổi sang `dang-lam`. Ghi một dòng Nhật ký, commit "<mã item> · bắt đầu thiết kế". 2. Đọc file item: "Vì sao sửa" để hiểu vấn đề và quyết định đứng sau, rồi "Đọc" và bảng "Màn phải làm". Đọc đúng mục YC, HV, QD được trỏ (scripts/trich.py <mã> in đúng mục). 3. Sửa canvas đúng bảng "Màn phải làm".
4. Ghi lên repo, đúng khuôn:
   - work/thiet-ke/<mã item>.md theo docs/process/templates/ban-ke-thiet-ke.md. Mọi màn bị chạm đều có một dòng, cột "Theo" ghi mã YC, HV hay QD.
   - docs/design/canvas/home247-canvas.html: mã nguồn cả canvas sau khi sửa, ghi đè một file, không cắt từng màn. 5. Trong file item: tick task Thiết kế; thêm một dòng ở mục Task: `- [ ] <mã item>-TA<số kế tiếp> Code · Claude Code (opus): kiểm thiết kế <mã item> theo CL12.9 bước 3`; ghi một dòng Nhật ký (ngày · Tùng (phiên Design) · đã làm gì · bất ngờ · mất bao lâu). 6. Một commit cho phần kết quả, tiếng Việt, mở đầu "<mã item> · ". Đẩy thẳng main (CL4.7). Không đẩy ép. Bị từ chối vì main có commit mới thì kéo về, gộp, đẩy lại.

## CL13.4 · Luật
- Chỉ làm đúng bảng "Màn phải làm". Thấy cần đổi thêm thì vẫn được vẽ, nhưng ghi dòng đó là "Ngoài yêu cầu" trong bản kê. Không sửa lặng lẽ.
- Chỉ ghi vào docs/design/canvas/, work/thiet-ke/, và trong file item của việc đang làm chỉ bốn chỗ: dòng `trang_thai`, dấu tick của task Thiết kế, thêm dòng task kiểm, mục Nhật ký. Không sửa QD, YC, HV, QT, docs/process, phần khác của work/backlog. - Không sửa YC dù thấy YC lệch với hình. Ghi vào "Câu hỏi cho Tùng". Khi kiểm, Claude Code sửa YC cho khớp.
- Item nói khác canvas, hoặc hai item nói khác nhau: không tự chọn. Ghi vào "Câu hỏi cho Tùng" của bản kê, bỏ phần đó, làm tiếp phần khác.
- Vùng bấm tối thiểu 44 px ở mọi màn. Người dùng nhiều người lớn tuổi, cầm máy một tay.
- Cỡ chữ theo mật độ màn. Màn càng nhiều thông tin thì chữ càng được nhỏ, vì hiện đủ thông tin quan trọng hơn chữ to:
  - Màn đọc (form, chi tiết, thông báo, popup, cá nhân, đăng nhập): chữ tối thiểu 14 px.
  - Màn dày thông tin (lưới ngày, bảng tuần, lịch giá, danh sách kết quả): chữ nhỏ nhất 12 px. Số trong ô, tiêu đề cột, nhãn trong bảng, chú thích dưới bảng 12 px; tên căn trong lưới 13 px đậm; dòng phụ 12–13 px.
  - Không dùng chữ dưới 12 px. Chữ nhỏ không làm vùng bấm nhỏ đi.
- Không dùng tên thật, số điện thoại thật.

## CL13.5 · Báo lại
Làm xong mọi việc tìm được thì báo Tùng, mỗi việc một dòng: mã item, mã commit, số màn đã sửa, số dòng "Ngoài yêu cầu", câu hỏi còn treo. Không có việc nào thì báo "Không có việc Design nào đang chờ".
Sau đó Tùng bảo phiên Claude Code "kiểm thiết kế <mã item>" (CL12.9 bước 3). Phiên Claude Code làm theo skill kiem-thiet-ke.

## CL13.6 · Phần của Claude Code
Khi Tùng quyết một việc cần sửa canvas, Claude Code thêm task Thiết kế vào item làm việc đó (tạo US hay EN nếu chưa có), và thêm vào file item các mục theo docs/process/templates/tk.md. Item không chứa prompt cho Design, vì cách làm đã nằm ở file này. Phải có:
- "Vì sao sửa": vấn đề trên canvas cũ, quyết định của Tùng (mã QD hoặc review, kèm ngày), và nếu không sửa thì hỏng gì. Viết đủ để Design hiểu ý, không chỉ biết việc.
- "Đọc": mã từng mục YC, HV, QD liên quan.
- "Màn phải làm": bảng Màn, Loại, Đổi gì, Theo. Cột Theo là mã mục YC, HV hoặc QD, kèm bước hay tiêu chí cụ thể.

## Lịch sử sửa đổi
| Rev | Ngày | Người | Commit hoặc PR | Thay đổi | Mục bị đổi |
|---|---|---|---|---|---|
| r1 | 2026-11-18 | Claude | QD21-lam-lai-tai-lieu | Chép từ bản Zalo r6, sửa cho bản PWA (QD21). Lịch sử cũ ở repo zalo-miniapp | Cả file |
