---
id: CL3
tieu_de: Mã định danh
trang_thai: de-xuat
nguoi_chu: tung
rev: 6
---
# CL3 · Mã định danh

## CL3.1 · Luật
1. Mã = tiền tố loại + số, không gạch nối: US12, QD22.
2. YC, QT, CL phân tầng bằng dấu chấm, tối đa ba tầng: YC1, YC1.2, YC1.2.1.
3. Mục con khác loại nối bằng gạch nối: YC1.2-NT3, QT1.3-VD2, US12-TA1, US3-KB1 (kịch bản test của US, nằm ở tests/kb/, CL14.5a), YC4-H6 (câu hỏi mở thứ 6 của YC4, nằm ở work/cau-hoi.md) `[r5 · sửa]`. Ô quyền: PQ2.SALE.
4. Item backlog dùng số phẳng theo từng loại. Cha con nằm ở trường cha.
5. Mã không đổi, không dùng lại. Mục bỏ vẫn giữ mã. Mục chuyển nhánh: giữ mã và ghi "nay thuộc ...", hoặc mã mới với thay_cho.
6. Cấp mã: lấy số lớn nhất hiện có của loại đó trong repo (gồm cả done/) cộng 1. Khi có script (EN2) thì script cấp.
7. Phiên bản trong trường liên kết: YC1.2@3. Trong văn bản: "YC1.2 bản 3".
8. Lần sửa của cả file ghi là r<n>, ví dụ YC3 r4. Phát hiện trong review ghi RV1-F3. Chi tiết ở CL12. `[r2 · thêm]`

## CL3.2 · Bảng tiền tố
| Nhóm | Tiền tố |
|---|---|
| Sự thật sản phẩm (docs/) | YC yêu cầu · NT tiêu chí nghiệm thu · QT quy tắc nghiệp vụ · VD ví dụ số · H câu hỏi mở (YC4-H6) `[r5 · thêm]` · HV hành vi hệ thống · PQ ma trận quyền · A, CN, S, P mã màn trên canvas · QD quyết định · CL cách làm việc · KB kịch bản test tay |
| Việc (work/backlog/) | EP Epic · US User Story · EN Enabler · SK Spike · DC Doc Task · TK Thiết kế `[r3 · thêm]` · BG Bug · TA Task · IM Impediment |
| Hồ sơ (work/) | SP sprint (đang tắt, QD26) · BB biên bản · RR rủi ro · GD giả định · SC sự cố · CT cải tiến · PH phản hồi · RV review `[r2 · sửa]` `[r6 · sửa]` |
CT là điểm cải tiến trải nghiệm trong đội tìm ra: app chạy đúng yêu cầu nhưng người mới có thể thấy khó dùng, khó hiểu. Không phải lỗi, nên không dùng BG. Ghi ở work/cai-tien.md, mã CT1, CT2... PH để dành cho phản hồi của người dùng thật `[r6 · thêm]`.
Mã vai trong PQ: CHU, SALE, LINK, CTV, KHACH, ADMIN.
Không dùng: TC (dễ nhầm test case).

## CL3.3 · Tên file
<MÃ>-<ten-khong-dau>.md, ví dụ US12-tim-can-trong.md, YC1-dang-nhap-ket-noi.md.

## Lịch sử sửa đổi
Dòng cũ hơn: [docs/_lich-su/process/CL3-ma-dinh-danh.md](../_lich-su/process/CL3-ma-dinh-danh.md).

| Rev | Ngày | Người | Commit hoặc PR | Thay đổi | Mục bị đổi |
|---|---|---|---|---|---|
| r2 | 2026-10-26 | Tùng | DC18-phien-ban-va-review | Thêm tiền tố RV và cách ghi rev | CL3.1 mục 8 thêm, CL3.2 sửa |
| r3 | 2026-10-28 | Tùng | claude/compassionate-hawking-fuw51i | Thêm loại TK (Thiết kế). Tùng: "quyết là đặt TK riêng cho thiết kế" | CL3 bảng Việc sửa |
| r4 | 2026-11-03 | Tùng | EN48-test-case-us | Thêm mã kịch bản trong US (US3-KB1). Dùng KB vì CL3.2 không dùng TC | CL3.1 mục 3 sửa |
| r5 | 2026-11-04 | Tùng | EN56-quy-trinh-moi | Thêm mã câu hỏi mở YC<n>-H<m>, KB ở tests/kb (QD26) | CL3.1 mục 3, CL3.2 sửa |
| r6 | 2026-11-07 | Tùng | EN63-skill-tu-goi | Định nghĩa CT cho điểm cải tiến, tách khỏi BG và PH. Tùng: "không tạo BG những hãy tạo một mã riêng cho improvement thì tốt hơn" | CL3.2 sửa |
