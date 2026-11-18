---
id: CL2
tieu_de: Backlog, trạng thái, liên kết, điều kiện bắt đầu và xong
trang_thai: de-xuat
nguoi_chu: tung
rev: 9
---
# CL2 · Backlog

## CL2.1 · Loại item
| Cấp | Loại | Mã | Dùng khi |
|---|---|---|---|
| 1 | Epic | EP | Mục tiêu lớn nhiều tuần, ứng với một mốc |
| 2 | User Story | US | Giá trị người dùng thấy được, làm xong trong khoảng 5 ngày. Cách viết: CL14 `[r7 · sửa]` |
| 2 | Enabler | EN | Việc làm nền, người dùng không thấy: hạ tầng, CI, script, môi trường, tài khoản, nợ kỹ thuật, chuẩn bị người dùng thử |
| 2 | Spike | SK | Tìm sự thật bằng thử hoặc tra, có giới hạn thời gian |
| 2 | Doc Task | DC | Một thay đổi kéo theo phải xem lại hay sửa tài liệu khác |
| 2 | Thiết kế | TK | Việc phiên Design làm trên canvas: vẽ, sửa, bỏ màn. Có mục "Vì sao sửa" và bảng "Màn phải làm" trỏ YC, HV, QD. Cách làm ở CL13 `[r3 · thêm]` |
| 2 | Bug | BG | Sản phẩm làm khác yêu cầu |
| 3 | Task | US12-TA1 | Bước con, nằm trong file item cha |
| Ngoài cây | Impediment | IM | Thứ chặn việc mà nhóm phải gỡ |
Quyết định (QD) không phải backlog item. QD nằm trong docs/decisions/.

## CL2.2 · Trạng thái item
`[r7 · sửa]` moi → san-sang → dang-lam → cho-test → cho-nghiem-thu → xong. Từ bất kỳ đâu sang huy (ghi lý do). Không còn `trong-sprint` (QD26).
| Trạng thái | Nghĩa |
|---|---|
| dang-lam | Đang làm, còn task Code chưa gộp hoặc chưa tick. Item không có code thì là đang làm nói chung |
| cho-test | Mọi task Code đã gộp và tick, chờ Đức test tay. Chỉ item cần test tay theo CL2.9 `[r9 · sửa]` |
| cho-nghiem-thu | Đức đã test đạt, chờ Tùng nghiệm thu. Chỉ US có `nghiem_thu: co` (CL2.9). TK dùng theo CL13 `[r9 · sửa]` |
Item đi qua những bước nào thì theo bảng CL2.9 `[r9 · sửa]`.
On Hold (mã on-hold): hoãn có chủ ý, không hiện ở backlog. Vào từ moi, san-sang hoặc dang-lam. Ra về san-sang hoặc huy. Tùng quyết (CL4.3.2). `[r2 · thêm]`
Task: can-lam, dang-lam, xong. Impediment: mo, da-go.
Ba cờ máy tính, không ghi tay: Bị chặn (item trong truoc chưa xong, hoặc IM mở), Chờ duyệt (can_duyet chưa có lời duyệt), Đặc tả đổi (yêu cầu trong thuc_hien lên bản mới sau based_on).

## CL2.3 · Liên kết (chỉ ghi ở một đầu, chiều ngược do máy tính)
| Trường | Nghĩa |
|---|---|
| cha | Item cha. Mỗi item một cha |
| truoc | Phải xong trước item này. Không được vòng tròn |
| lien_quan | Liên quan |
| trung_voi | Trùng. Item trùng chuyển huy |
| thay_cho | Mục mới thay mục cũ (khi tách, gộp) |
| thuc_hien | Yêu cầu và phiên bản item làm cho đạt, ví dụ [YC5.1@1]. Bắt buộc với US, BG |
| nguon | Sinh ra từ BB, QD, PH, SC hay item khác |

## CL2.4 · Điều kiện bắt đầu (san-sang)
- thuc_hien trỏ tới yêu cầu đã chốt, có phiên bản (US, BG).
- Yêu cầu có đủ tiêu chí NT, có ví dụ số nếu rủi ro từ trung bình.
- Không còn QD mở chặn việc. Đã biết quyền cần xin.
- Có rui_ro, uoc_luong. Tới 5 ngày làm, lớn hơn thì tách. `[r7 · sửa]`

## CL2.5 · Điều kiện xong
- `[r7 · sửa]` Đã gộp qua PR, CI xanh. Test tự động mang mã tiêu chí xanh, ở đúng lớp (CL14.5). Ô quyền chạm tới có test cố tình vi phạm.
- Đủ bước kiểm theo rủi ro (CL6.3), nên yêu cầu lên Đã test OK.
- Tài liệu liên quan đã sửa, hoặc đã có DC cho phần chưa sửa.
- Nhật ký và bằng chứng đã ghi.
Với item chỉ có tài liệu (DC, phần lớn EN, SK): PR đã gộp, kết luận đã ghi vào đúng tài liệu nguồn.
Với TK: bản kê work/thiet-ke/<mã>.md đã kiểm, mọi dòng Khớp, dòng "Ngoài yêu cầu" Tùng đã quyết (CL12.9 bước 3) `[r3 · thêm]`.

## CL2.6 · Thứ tự và tinh chỉnh
Thứ tự trong work/backlog/THU-TU.md, chỉ Tùng sắp. Item Mới quá 4 tuần không ai đụng thì đưa ra buổi tinh chỉnh để giữ hay hủy.

## CL2.7 · Giới hạn việc dở
`[r7 · sửa]` Theo CL1.2: tối đa 2 item có code ở dang-lam, và item có code ở cho-test cộng cho-nghiem-thu tối đa 6.

## CL2.8 · Loại task trong US `[r4 · thêm]`
Tùng quyết ngày 2026-11-03: "vậy trong US vẫn nên có phân loại các loại tast cho dễ nhé. Test tay chỉ đưa hết cho Đức. code thì dành cho Claude code. Tôi nghiệm thu."

Mỗi task trong US (và BG) ghi loại ngay sau mã, rồi tới người làm:
`- [ ] US3-TA1 Code · Claude Code (opus): API ghi booking, trả lỗi khi trùng đêm`
Task Code ghi model trong ngoặc, chọn theo CL14.6a `[r6 · thêm]`.

| Loại | Người làm | Gồm |
|---|---|---|
| Code | Claude Code | Màn Mini App, API, database, migration, và test tự động mang mã tiêu chí (CL2.5) |
| Test tay | Đức | Thử trên Zalo, kịch bản KB trên iPhone và Android, test vi phạm quyền bằng tay, ghi biên bản (CL6.3) |
| Nghiệm thu | Tùng | Chỉ với US Tùng chọn (`nghiem_thu: co`, CL2.9). Dùng thử trên điện thoại, đối chiếu NT, nói đạt hay không. Đạt thì item sang xong `[r9 · sửa]` |

Thứ tự trong một US: các task Code, rồi Test tay, rồi Nghiệm thu nếu có. Task Nghiệm thu, khi có, luôn là task cuối `[r9 · sửa]`.
Việc khác không thuộc ba loại trên (môi trường, tài khoản, deploy, bí mật) vẫn ghi như cũ, theo người làm, thường là Đức.

## CL2.9 · Loại item đi qua bước nào `[r9 · thêm]`
Tùng nói ngày 2026-11-07: "tôi cần một cơ chế linh hoạt để làm việc, không nhất thiết mọi item phải đi qua tất cả các bước. ví dụ nghiệm thu, tôi không cần phải nghiệm thu mọi item. Nếu Đức test đủ, tôi chỉ chọn lọc nghiệm thu theo kinh nghiệm của tôi thôi."

| Loại item | Code, PR, CI | AI chạy luồng chính (kiem-luong-chinh) | Test tay của Đức (test-tay) | Nghiệm thu của Tùng (nghiem-thu) | Sau khi gộp code thì sang |
|---|---|---|---|---|---|
| US | Có | Có, nếu có màn | Có, chế độ nhanh rồi đủ | Chỉ khi `nghiem_thu: co` | cho-test |
| BG | Có | Có, nếu lỗi ở màn | Đức thử lại bước tái hiện và kịch bản nguồn | Không | cho-test |
| EN có màn hoặc chạm Zalo | Có | Có | Đức xem trên Zalo, một dòng biên bản | Không | cho-test |
| EN không có màn (server, script, CI, database) | Có | Không | Không. Test tự động và CI là đủ | Không | xong |
| DC, SK, EN chỉ có tài liệu | PR nếu thuộc CL4.3, còn lại đẩy main | Không | Không | Không | xong khi đã gộp hoặc đẩy |
| TK | Theo CL13 | | | Theo CL13 | |

Nghiệm thu chọn lọc:
- Trường `nghiem_thu` trong US nhận `co` hoặc `khong`. Không có trường thì hiểu là `khong`.
- Đức test đủ mà đạt hết thì US có `nghiem_thu: khong` sang xong ngay, US có `nghiem_thu: co` sang cho-nghiem-thu.
- Tùng chọn US cần nghiệm thu bất cứ lúc nào bằng skill nghiem-thu, kể cả US đã xong. Skill can-lam-gi liệt kê US Đức vừa test đạt trong tuần, rủi ro cao lên đầu, để Tùng chọn.
- Việc đổi trạng thái theo bảng này do skill gop-code (sau khi gộp), test-tay (sau khi test) và nghiem-thu làm, không đổi tay.

## Lịch sử sửa đổi
Dòng cũ hơn: [docs/_lich-su/process/CL2-backlog.md](../_lich-su/process/CL2-backlog.md).

| Rev | Ngày | Người | Commit hoặc PR | Thay đổi | Mục bị đổi |
|---|---|---|---|---|---|
| r5 | 2026-11-03 | Tùng | CL14-viet-user-story | Trỏ cách viết US sang CL14 | CL2.1 dòng US sửa |
| r6 | 2026-11-03 | Tùng | CL14-chon-model | Task Code ghi model, trỏ CL14.6a | CL2.8 sửa |
| r7 | 2026-11-04 | Tùng | EN56-quy-trinh-moi | Trạng thái theo luồng: bỏ trong-sprint, thêm cho-test, trần chờ người (QD26) | CL2.1, CL2.2, CL2.4, CL2.5, CL2.7 sửa |
| r8 | 2026-11-04 | Tùng | EN57-chuyen-tai-lieu-cu | Chỉ sửa chữ: chỗ trỏ câu hỏi mở đổi sang mã YC<n>-H<m>, link item đã xong sang done/ (QD26) | Các chỗ trỏ câu hỏi |
| r9 | 2026-11-07 | Tùng | EN63-skill-tu-goi | Loại item đi qua bước nào, nghiệm thu chọn lọc. Tùng: "tôi chỉ chọn lọc nghiệm thu theo kinh nghiệm của tôi thôi" | CL2.2, CL2.8 sửa, CL2.9 thêm |
