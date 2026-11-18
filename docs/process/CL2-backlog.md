---
id: CL2
tieu_de: Backlog, trạng thái, liên kết, điều kiện bắt đầu và xong
trang_thai: de-xuat
nguoi_chu: tung
rev: 1
---
# CL2 · Backlog

## CL2.1 · Loại item
| Cấp | Loại | Mã | Dùng khi |
|---|---|---|---|
Ba loại item (QD21):
| Loại | Mã | Dùng khi |
|---|---|---|
| User Story | US | Làm một phần tính năng người dùng thấy được, hoặc làm theo một yêu cầu vừa đổi. Làm xong trong khoảng 5 ngày. US chỉ trỏ mục YC kèm bản, không chép đặc tả. Cách viết: CL14 |
| Enabler | EN | Việc nền người dùng không thấy: dựng repo, database dùng chung, đăng nhập, CI, hạ tầng, script, tài khoản; việc chỉ có tài liệu (soát, sửa tài liệu theo một thay đổi); thử nghiệm có giới hạn thời gian |
| Bug | BG | App làm khác yêu cầu |
| Task | US12-TA1 | Bước con, nằm trong file item cha. Loại task: CL2.8 |
Quyết định (QD) không phải item, nằm ở docs/decisions/. Câu hỏi mở nằm ở work/cau-hoi.md. Việc thiết kế trên canvas là task loại Thiết kế trong item (CL2.8, CL13). Bản Zalo còn EP, SK, DC, TK, IM; bản PWA không dùng, mã các loại đó không cấp.

## CL2.2 · Trạng thái item
moi → san-sang → dang-lam → cho-test → cho-nghiem-thu → xong. Từ bất kỳ đâu sang huy (ghi lý do).
| Trạng thái | Nghĩa |
|---|---|
| dang-lam | Đang làm, còn task Code chưa gộp hoặc chưa tick. Item không có code thì là đang làm nói chung |
| cho-test | Mọi task Code đã gộp và tick, chờ Đức test tay. Chỉ item cần test tay theo CL2.9 |
| cho-nghiem-thu | Đức đã test đạt, chờ Tùng nghiệm thu. Chỉ US có `nghiem_thu: co` (CL2.9) |
Item đi qua những bước nào thì theo bảng CL2.9.
On Hold (mã on-hold): hoãn có chủ ý, không hiện ở backlog. Vào từ moi, san-sang hoặc dang-lam. Ra về san-sang hoặc huy. Tùng quyết (CL4.3.2). Task: can-lam, dang-lam, xong.
Ba cờ máy tính, không ghi tay: Bị chặn (item trong truoc chưa xong, hoặc câu hỏi, QD trong [MỞ] chưa đóng), Chờ duyệt (can_duyet chưa có lời duyệt), Đặc tả đổi (yêu cầu trong thuc_hien lên bản mới sau based_on).

## CL2.3 · Liên kết (chỉ ghi ở một đầu, chiều ngược do máy tính)
| Trường | Nghĩa |
|---|---|
| truoc | Phải xong trước item này. Không được vòng tròn |
| lien_quan | Liên quan |
| trung_voi | Trùng. Item trùng chuyển huy |
| thay_cho | Mục mới thay mục cũ (khi tách, gộp) |
| thuc_hien | Mục yêu cầu và bản item làm cho đạt, ví dụ [YC5.1@1]. Bản là số ở dòng "Bản <n>" dưới tiêu đề mục YC (CL6). Bắt buộc với US, BG |
| nguon | Sinh ra từ QD, câu hỏi đã trả lời, biên bản, hay item khác |

## CL2.4 · Điều kiện bắt đầu (san-sang)
- thuc_hien trỏ tới yêu cầu đã chốt, có phiên bản (US, BG).
- Yêu cầu có đủ tiêu chí NT, có ví dụ số nếu rủi ro từ trung bình.
- Không còn QD mở chặn việc. Đã biết quyền cần xin.
- Có rui_ro, uoc_luong. Tới 5 ngày làm, lớn hơn thì tách. 
## CL2.5 · Điều kiện xong
- Đã gộp qua PR, CI xanh. Test tự động mang mã tiêu chí xanh, ở đúng lớp (CL14.5). Ô quyền chạm tới có test cố tình vi phạm.
- Đủ bước kiểm theo rủi ro (CL6.3), nên yêu cầu lên Đã test OK.
- Tài liệu liên quan đã sửa, hoặc đã có EN cho phần chưa sửa.
- Nhật ký và bằng chứng đã ghi.
Với EN chỉ có tài liệu: PR đã gộp hoặc đã đẩy main, kết luận đã ghi vào đúng tài liệu nguồn.
Task Thiết kế: bản kê work/thiet-ke/<mã item>.md đã kiểm, mọi dòng Khớp, dòng "Ngoài yêu cầu" Tùng đã quyết (CL12.9 bước 3).

## CL2.6 · Thứ tự và tinh chỉnh
Thứ tự trong work/backlog/THU-TU.md, chỉ Tùng sắp. Item Mới quá 4 tuần không ai đụng thì đưa ra buổi tinh chỉnh để giữ hay hủy.

## CL2.7 · Giới hạn việc dở
Theo CL1.2: tối đa 2 item có code ở dang-lam, và item có code ở cho-test cộng cho-nghiem-thu tối đa 6.

## CL2.8 · Loại task trong US Tùng quyết ngày 2026-11-03: "vậy trong US vẫn nên có phân loại các loại tast cho dễ nhé. Test tay chỉ đưa hết cho Đức. code thì dành cho Claude code. Tôi nghiệm thu."

Mỗi task trong US (và BG) ghi loại ngay sau mã, rồi tới người làm:
`- [ ] US3-TA1 Code · Claude Code (opus): API ghi booking, trả lỗi khi trùng đêm`
Task Code ghi model trong ngoặc, chọn theo CL14.6a.

| Loại | Người làm | Gồm |
|---|---|---|
| Code | Claude Code | Màn của app, database (migration, hàm, policy), và test tự động mang mã tiêu chí (CL2.5) |
| Test tay | Đức | Thử trên điện thoại (trình duyệt và bản cài PWA), kịch bản KB trên iPhone và Android, test vi phạm quyền bằng tay, ghi biên bản (CL6.3) |
| Thiết kế | Phiên Design | Vẽ, sửa, bỏ màn trên canvas theo bảng "Màn phải làm" của item (CL13). Claude Code kiểm sau (skill kiem-thiet-ke) |
| Nghiệm thu | Tùng | Chỉ với US Tùng chọn (`nghiem_thu: co`, CL2.9). Dùng thử trên điện thoại, đối chiếu NT, nói đạt hay không. Đạt thì item sang xong |

Thứ tự trong một US: Thiết kế nếu có, các task Code, rồi Test tay, rồi Nghiệm thu nếu có. Task Nghiệm thu, khi có, luôn là task cuối.
Việc khác không thuộc ba loại trên (môi trường, tài khoản, deploy, bí mật) vẫn ghi như cũ, theo người làm, thường là Đức.

## CL2.9 · Loại item đi qua bước nào Tùng nói ngày 2026-11-07: "tôi cần một cơ chế linh hoạt để làm việc, không nhất thiết mọi item phải đi qua tất cả các bước. ví dụ nghiệm thu, tôi không cần phải nghiệm thu mọi item. Nếu Đức test đủ, tôi chỉ chọn lọc nghiệm thu theo kinh nghiệm của tôi thôi."

| Loại item | Code, PR, CI | AI chạy luồng chính (kiem-luong-chinh) | Test tay của Đức (test-tay) | Nghiệm thu của Tùng (nghiem-thu) | Sau khi gộp code thì sang |
|---|---|---|---|---|---|
| US | Có | Có, nếu có màn | Có, chế độ nhanh rồi đủ | Chỉ khi `nghiem_thu: co` | cho-test |
| BG | Có | Có, nếu lỗi ở màn | Đức thử lại bước tái hiện và kịch bản nguồn | Không | cho-test |
| EN có màn | Có | Có | Đức xem trên điện thoại, một dòng biên bản | Không | cho-test |
| EN không có màn (database, script, CI, hạ tầng) | Có | Không | Không. Test tự động và CI là đủ | Không | xong |
| EN chỉ có tài liệu | PR nếu thuộc CL4.3, còn lại đẩy main | Không | Không | Không | xong khi đã gộp hoặc đẩy |
Task Thiết kế trong item nào cũng theo CL13, kiểm bằng skill kiem-thiet-ke trước task Code dùng màn đó.

Nghiệm thu chọn lọc:
- Trường `nghiem_thu` trong US nhận `co` hoặc `khong`. Không có trường thì hiểu là `khong`.
- Đức test đủ mà đạt hết thì US có `nghiem_thu: khong` sang xong ngay, US có `nghiem_thu: co` sang cho-nghiem-thu.
- Tùng chọn US cần nghiệm thu bất cứ lúc nào bằng skill nghiem-thu, kể cả US đã xong. Skill can-lam-gi liệt kê US Đức vừa test đạt trong tuần, rủi ro cao lên đầu, để Tùng chọn.
- Việc đổi trạng thái theo bảng này do skill gop-code (sau khi gộp), test-tay (sau khi test) và nghiem-thu làm, không đổi tay.

## Lịch sử sửa đổi
| Rev | Ngày | Người | Commit hoặc PR | Thay đổi | Mục bị đổi |
|---|---|---|---|---|---|
| r1 | 2026-11-18 | Claude | QD21-lam-lai-tai-lieu | Chép từ bản Zalo r9, sửa cho bản PWA (QD21). Lịch sử cũ ở repo zalo-miniapp | Cả file |
