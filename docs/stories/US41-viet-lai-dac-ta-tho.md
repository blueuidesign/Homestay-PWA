# US41 · Viết lại đặc tả thô của các story theo khuôn

- Loại: kỹ thuật
- Trạng thái: đang làm
- Đặc tả: đã viết lại
- Bản: 1
- Rủi ro: cao (story sai thì code sai theo)
- Làm sau khi xong: không phụ thuộc story nào

## Mục tiêu

Là người làm dự án, tôi muốn mọi story đều viết theo khuôn đã duyệt và khớp với database, để phiên code chỉ cần đọc một story là làm đúng.

Vì sao: 35 story chuyển từ bản Zalo được lắp bằng máy ngày 18/11/2026 (`docs/QUY_TRINH.md` mục 4.2b). Nguyên liệu đủ, nhưng còn chữ của bản Zalo, còn mượn bảng bước của nhau, chưa ghi lớp test, chưa đối chiếu database. Viết lại tay US3 đã lộ năm chỗ database lệch đặc tả; các story khác chắc cũng có.

## Phạm vi

Làm: viết lại từng story ghi `Đặc tả: thô`, theo thứ tự ở `docs/stories/README.md` (story bản 1 trước). Danh sách còn lại luôn tính bằng máy:

```bash
grep -l "Đặc tả: thô" docs/stories/*.md
```

Không làm: code, sửa database. Chỗ database lệch chỉ ghi vào story; sửa khi làm story đó.

Ba story chưa có đặc tả nào (US24, US32, US33): không viết lại được, cần Tùng nói ý định trước. Hỏi Tùng khi tới lượt.

## Cách viết lại một story

1. Đọc story thô. Nó là nguyên liệu: bảng bước, chữ trên màn, tiêu chí, luật kiểm, "Ai được làm và việc kéo theo", màn, quyền, ngoài phạm vi.
2. Đọc mẫu `docs/stories/US3-ghi-booking.md` và khuôn ở `docs/QUY_TRINH.md` mục 4.2.
3. Đọc hàm database story dùng (`supabase/migrations/`, tên hàm ở mục Database của story) và test của nó (`tests/db/`). Ghi mọi chỗ database làm khác nguyên liệu vào "Database đang lệch story".
4. Xem màn: `python3 docs/thiet-ke/trich-man.py <mã> --chu`. Chữ trên hình lệch nguyên liệu thì nguyên liệu (story) đúng; ghi chỗ lệch ở mục Màn hình.
5. Viết lại cả file theo khuôn: luồng chính có số của bộ mẫu; phạm vi; bảng bước bản PWA (không cột Zalo, cách làm theo `docs/luat-chung/PWA.md`); đủ nhánh lỗi; tiêu chí kèm lớp test; bảng luật kiểm với câu lỗi; quyền; database; màn; câu hỏi và giả định; việc cần làm. Bỏ mục "Ai được làm và việc kéo theo" sau khi đã đưa nội dung vào bảng bước và mục Database.
6. Tiêu chí: giữ nguyên mã và nghĩa. Chỉ đổi chữ của bản Zalo sang bản PWA. Thiếu thì thêm mã mới (số tiếp theo của story đó). Tiêu chí thuộc màn hay phần của story khác thì chuyển sang story đó, giữ mã, ghi trong commit. Không còn mục "Phần của story khác…".
7. Chỗ ghi tắt kiểu "US12-NT1, NT4" trong story thô có thể theo số cũ của bản Zalo. Không tin số tắt; tra lại nội dung tiêu chí.
8. Câu hỏi: dùng mã đã có ở `docs/Cau_hoi_mo.md`. Câu mới dùng `US<n>-H<số tiếp theo>` và thêm dòng. Dòng câu hỏi nào không còn chỗ dùng thì xóa. Giả định mới dùng `GD<số tiếp theo>`.
9. Đổi dòng đầu file thành `- Đặc tả: đã viết lại`.
10. Sửa `tests/kich-ban/US<n>.md` cho khớp: mã tiêu chí, ngày còn trong tương lai, bỏ bước của Zalo.
11. Chạy `python3 scripts/kiem-tai-lieu.py` (0 lỗi), commit `US<n>: viết lại đặc tả`, đẩy thẳng `main` (tài liệu sống, không kèm code).

Mỗi phiên làm vài story. Ba story đầu gửi Tùng duyệt trước khi làm tiếp.

## Tiêu chí nghiệm thu

- **US41-NT1** Khi chạy `grep -l "Đặc tả: thô" docs/stories/*.md`, thì không còn file nào, trừ US24, US32, US33 khi Tùng chưa nói ý định.
- **US41-NT2** Khi chạy `python3 scripts/kiem-tai-lieu.py`, thì 0 lỗi, và không còn cảnh báo về mã tiêu chí ghi tắt hay mục "Phần của story khác".
- **US41-NT3** Khi so số tiêu chí trong bảng `docs/tu-sinh/Doi_ma_YC.md` với các story, thì không tiêu chí nào bị mất (máy kiểm, nằm trong `kiem-tai-lieu.py`).
- **US41-NT4** Khi Tùng đọc ba story viết lại đầu tiên, thì Tùng nói được khuôn ổn hay cần sửa trước khi làm tiếp.

## Việc cần làm

- [x] US3 (mẫu, Tùng duyệt 18/11/2026).
- [ ] Các story còn lại theo thứ tự ở `docs/stories/README.md`. Tiến độ: đếm bằng lệnh ở mục Phạm vi.
- [ ] Hỏi Tùng ý định cho US24, US32, US33.
- [ ] Đổi Trạng thái thành "xong" ở file này và ở `docs/stories/README.md`.
