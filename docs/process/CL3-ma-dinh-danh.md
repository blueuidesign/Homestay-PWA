---
id: CL3
tieu_de: Mã định danh
trang_thai: de-xuat
nguoi_chu: tung
rev: 1
---
# CL3 · Mã định danh

## CL3.1 · Luật
1. Mã = tiền tố loại + số, không gạch nối: US12, QD22.
2. YC, QT, CL phân tầng bằng dấu chấm, tối đa ba tầng: YC1, YC1.2, YC1.2.1.
3. Mục con khác loại nối bằng gạch nối: YC1.2-NT3, QT1.3-VD2, US12-TA1, US3-KB1 (kịch bản test của US, nằm ở tests/kb/, CL14.5a), YC4-H6 (câu hỏi mở thứ 6 của YC4, nằm ở work/cau-hoi.md). Câu hỏi của luật chung dùng mã mục cấp 1: QT2-H1, HV1-H1, PQ10-H1. Ô quyền: PQ2.SALE.
4. Item backlog dùng số phẳng theo từng loại. Cha con nằm ở trường cha.
5. Mã không đổi, không dùng lại. Mục bỏ vẫn giữ mã. Bản PWA trước ngày 18/11/2026 dùng mã QD-007, CH-012, US<n> theo story cũ: QD đổi thành QD7, câu hỏi CH đổi theo bảng cuối work/cau-hoi.md, mã US cũ không dùng lại (QD21). Mục chuyển nhánh: giữ mã và ghi "nay thuộc ...", hoặc mã mới với thay_cho.
6. Cấp mã: lấy số lớn nhất hiện có của loại đó trong repo (gồm cả done/) cộng 1. Khi có script (EN2) thì script cấp.
7. Phiên bản trong trường liên kết: YC1.2@3. Trong văn bản: "YC1.2 bản 3".
8. Lần sửa của cả file ghi là r<n>, ví dụ YC3 r4. Phát hiện trong review ghi RV1-F3. Chi tiết ở CL12. 
## CL3.2 · Bảng tiền tố
| Nhóm | Tiền tố |
|---|---|
| Sự thật sản phẩm (docs/) | YC yêu cầu · NT tiêu chí nghiệm thu · QT quy tắc nghiệp vụ · VD ví dụ số · H câu hỏi mở (YC4-H6) · HV hành vi hệ thống · PQ ma trận quyền · DLM dữ liệu mẫu · P mục của docs/external/pwa.md · A, CN, S, P mã màn trên canvas · QD quyết định · CL cách làm việc · KB kịch bản test tay |
| Việc (work/backlog/) | US User Story · EN Enabler · BG Bug · TA Task (QD21). Bản Zalo còn EP, SK, DC, TK, IM; bản PWA không cấp các mã đó |
| Hồ sơ (work/) | BB biên bản · RR rủi ro · GD giả định (work/gia-dinh.md) · SC sự cố · CT cải tiến · PH phản hồi · RV review |
CT là điểm cải tiến trải nghiệm trong đội tìm ra: app chạy đúng yêu cầu nhưng người mới có thể thấy khó dùng, khó hiểu. Không phải lỗi, nên không dùng BG. Ghi ở work/cai-tien.md, mã CT1, CT2... PH để dành cho phản hồi của người dùng thật.
Mã vai trong PQ: CHU, SALE, LINK, CTV, KHACH, ADMIN.
Không dùng: TC (dễ nhầm test case).

## CL3.3 · Tên file
<MÃ>-<ten-khong-dau>.md, ví dụ US12-tim-can-trong.md, YC1-dang-nhap-ket-noi.md.

## Lịch sử sửa đổi
| Rev | Ngày | Người | Commit hoặc PR | Thay đổi | Mục bị đổi |
|---|---|---|---|---|---|
| r1 | 2026-11-18 | Claude | QD21-lam-lai-tai-lieu | Chép từ bản Zalo r6, sửa cho bản PWA (QD21). Lịch sử cũ ở repo zalo-miniapp | Cả file |
