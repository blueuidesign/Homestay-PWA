---
id: CL14
tieu_de: Viết User Story
trang_thai: de-xuat
nguoi_chu: tung
rev: 7
---
# CL14 · Viết User Story

Phiên Claude Code viết US đọc file này trước, rồi làm theo CL14.7. Loại item và trạng thái theo CL2, mã theo CL3, bước kiểm theo CL6.3.

## CL14.1 · US dùng để làm gì
YC trả lời "sản phẩm phải làm gì". US trả lời "lần này giao cho người dùng phần nào". Mỗi US là một lần giao chức năng chạy được trên Zalo thật, làm xong trong khoảng 5 ngày, và Tùng nghiệm thu được trên điện thoại. `[r5 · sửa]`

Không có US thì hỏng hai chỗ:
- Không biết code phần nào trước và lúc nào là xong. Làm mỗi chỗ một ít thì không có gì chạy trọn vẹn để thử.
- YC đổi bản thì không biết code nào bị ảnh hưởng. US ghi `thuc_hien` kèm bản, nên YC lên bản là thấy ngay US nào phải xem lại (cờ "Đặc tả đổi", CL2.2).

US không chứa đặc tả. Tiêu chí NT, quy tắc QT, hành vi HV nằm ở YC, QT, HV. US chỉ trỏ tới bằng mã (CLAUDE.md: một thông tin một chỗ).

## CL14.2 · Nguồn và điều kiện
- Chỉ viết US từ YC trong docs/product/requirements/. Không viết từ chat, từ canvas hay từ trí nhớ.
- Được soạn US khi YC còn de-xuat. US chỉ sang san-sang khi mọi mục trong `thuc_hien` đã da-chot và đủ điều kiện CL2.4.
- Trước khi tạo US mới, đọc US1 đến US hiện có. Việc đã có US thì sửa US đó. Tách hay gộp thì dùng `thay_cho`, US cũ chuyển huy. Mã không đổi, không dùng lại (CL3).

## CL14.3 · Cắt US thế nào
Gốc của mọi quy tắc dưới đây: **mỗi US xong thì một người dùng làm trọn được một việc có ích, trên Zalo thật.**

| Quy tắc | Chấp nhận | Loại bỏ |
|---|---|---|
| Cắt dọc | Một US có đủ màn, API, database, test cho một việc | US "làm API booking", US "vẽ màn CN4", US "tạo bảng" |
| Vừa 5 ngày | Ước lượng tới 5 ngày làm | US lớn hơn: tách theo luồng (luồng chính trước, nhánh lỗi và biến thể sau) |
| Một vai | Mục tiêu viết cho một vai: chủ nhà hoặc sale | Một US gồm việc của cả chủ nhà và sale, trừ khi việc đó chỉ có nghĩa khi có cả hai (ví dụ gửi và chấp nhận yêu cầu) |
| Tự nghiệm thu được | Tùng mở app, làm theo NT, nói đạt hay không | US chỉ kiểm được bằng đọc code hay gọi API |
| Phần dùng chung tách ra EN | Data model (EN11), đăng nhập (EN12), lớp quyền (EN13) là EN, US ghi trong `truoc` | Mỗi US tự dựng lại phần dùng chung |
| Phủ đủ NT | Mỗi NT của YC thuộc đúng một US. NT dùng chung cho nhiều US thì ghi ở US đầu tiên làm nó | NT không thuộc US nào, hoặc hai US cùng làm một NT |

Ví dụ: YC4 Booking quá lớn cho một US. Cắt thành US3 (chủ nhà ghi booking, chặn trùng), US10 (sửa, xóa, thu tiền), US15 (sale gửi yêu cầu, chủ nhà chấp nhận).

## CL14.4 · Cấu trúc file
Một US một file work/backlog/US<số>-<ten-ngan>.md, theo docs/process/templates/us.md.

| Phần | Ghi gì |
|---|---|
| Đầu file | Các trường của templates/item.md. Bắt buộc: `cha` (EP), `thuc_hien` (mục YC kèm bản, ví dụ `[YC4.1@2, YC4.1.1@1]`), `truoc` (EN, US phải xong trước), `nguoi`, `rui_ro`, `uoc_luong` |
| Mục tiêu | Một câu: "Là <vai>, tôi muốn <làm gì>, để <được gì>". Phần "để" nói giá trị cho người dùng, không nói kỹ thuật |
| Làm tiêu chí nào | Chỉ mã NT, ví dụ "YC4.1-NT1 đến NT5, YC4.1.1-NT2". Không chép nội dung. Không phải NT nào của YC trong `thuc_hien` cũng thuộc US này: ghi rõ NT nào để US khác làm |
| Quy tắc, hành vi dùng | Mã QT, HV mà US chạm tới, ví dụ "QT1.1 đến QT1.3, HV4, HV8" |
| Màn hình | Mã màn trong YC, ví dụ "CN4, CN4-03" |
| Quyền | Ô PQ chạm tới (khi DC14 có ma trận quyền). Ô nào cũng phải có test vi phạm (CL2.5) |
| Phạm vi | Bắt buộc. Thư mục, file task Code được sửa. Agent không sửa file ngoài danh sách này (rules/code.md). Gói việc chép mục này vào ô Được sửa `[r7 · sửa]` |
| Ngoài phạm vi | Những gì người đọc dễ tưởng thuộc US này nhưng không phải, kèm US làm việc đó |
| Đọc | Mục cần đọc, chỉ ghi mã mà scripts/trich.py tìm được, không kèm chú thích: mã YC, QT, QD, HV, PQ, DLM, mã màn (S2, CN3-02), mã item (EN11), mục trong file (server.md#1.4, api/sale.md#GET /sale/tim, mỗi mục một dòng). Chỉ ghi cả file (api/gia.md) khi item làm mọi mục của file đó. Luật doc-ma của kiem.py kiểm. Gói việc soạn từ mục này bằng scripts/goi.py `[r7 · sửa]` |
| Test case | Một dòng trỏ tới tests/kb/<US>.md (CL14.5a) `[r5 · sửa]` |
| Task | Theo CL14.5 |
| Kế hoạch, Nhật ký, Bằng chứng | Điền khi làm (skill lam-mot-item). Kế hoạch xóa khi US sang xong. Nhật ký mỗi lần một dòng dưới 200 ký tự `[r5 · sửa]` |

## CL14.5 · Task trong US
Loại task theo CL2.8. Thứ tự:
1. **Code · Claude Code (model)**: mỗi task một phần dọc nhỏ hoặc một lớp của một luồng, ví dụ database và migration, API, màn, test tự động. Mỗi test tự động mang mã NT nó kiểm (CL2.5).
2. **Test tay · Đức**: theo rủi ro của US (CL6.3).
   - thap: xem trên Zalo, ghi một dòng biên bản.
   - tb: thêm chạy theo ví dụ số của QT.
   - cao: thêm kịch bản KB trên iPhone và Android, thử vi phạm quyền bằng tay.
   - Mọi mức: chạy từng kịch bản trong tests/kb/<US>.md (CL14.5a), ghi OK hoặc NG từng kịch bản. `[r5 · sửa]`
3. **Nghiệm thu · Tùng**: chỉ có khi US ghi `nghiem_thu: co` (CL2.9), là task cuối. Dùng thử trên điện thoại theo NT, nói đạt hay không. Đạt thì US sang xong. Không có thì US sang xong khi Đức test đủ đạt `[r6 · sửa]`.

Việc ngoài ba loại (môi trường, deploy, tài khoản, bí mật) ghi theo người làm, thường là Đức.

**Test tự động viết ở lớp nào** `[r5 · thêm]` (QD26). Frontend đang chạy trên server giả (QD22). Test frontend trên server giả chỉ kiểm hành vi của server giả, không kiểm quy tắc. Nên:
| Loại quy tắc | Test ở đâu |
|---|---|
| Chặn trùng đêm, ràng buộc tiền | src/db/test và node:test của src/server |
| Quyền xem giá, sale không thấy khách của chủ nhà, tắt hiện giá | tests/permissions |
| Màn hiện đúng thứ server gửi | `test:ghep` của src/miniapp với server thật |
| Trạng thái màn (rỗng, đang tải, lỗi mạng, quay lại từ nền) | Test frontend trên server giả |

**Task rủi ro cao viết test trước** `[r5 · thêm]`: task chạm tiền, chặn trùng, quyền xem giá, dữ liệu người dùng thì tách thành hai task. Task đầu viết test từ NT và ví dụ số, chưa có code, test phải đỏ. Task sau viết code cho test xanh, do agent khác làm, không được sửa file test. Lý do: cùng một agent viết cả hai thì test dễ bị viết theo code, lỗi của code được chép luôn vào test.

Ví dụ US3:
```
- [ ] US3-TA1 Code · Claude Code (opus): bảng booking, ràng buộc chặn trùng đêm (QT1.1)
- [ ] US3-TA2 Code · Claude Code (opus): API ghi booking, trả lỗi khi trùng
- [ ] US3-TA3 Code · Claude Code (sonnet): form CN4, thông báo trùng, toast CN4-03 (HV8)
- [ ] US3-TA4 Code · Claude Code (sonnet): test tự động YC4.1-NT1 đến NT5
- [ ] US3-TA5 Test tay · Đức: KB ghi trùng đêm trên iPhone và Android, biên bản
- [ ] US3-TA6 Nghiệm thu · Tùng: ghi booking và thử ghi trùng trên điện thoại
```

## CL14.5a · Kịch bản test tay của US `[r5 · sửa]`
Kịch bản test tay của mỗi US nằm ở file riêng tests/kb/<US>-<ten-ngan>.md, cùng tên với file US (QD26). File US chỉ có mục "## Test case" một dòng trỏ tới file đó. Lý do: chỉ Đức và phiên viết kịch bản cần đọc phần này. Agent code chỉ cần mã NT, nên không phải nạp kịch bản. Mục đích của kịch bản giữ nguyên: Đức đọc là làm theo được trên điện thoại, không phải hỏi lại, và ghi kết quả từng kịch bản ngay trong file kịch bản.

Đầu file kịch bản có front matter `id: <US>-KB`, `us: <US>`, `rev`. Khuôn: docs/process/templates/kb.md.

Đầu mục một đoạn ngắn: dữ liệu dùng chung (theo docs/product/du-lieu-mau.md) và cách ghi kết quả. Sau đó mỗi kịch bản một khối:

```
### US3-KB1 · Ghi đặt phòng vào đêm còn trống `[Chính]`
- **Mục đích:** chủ nhà ghi được đặt phòng, lịch hiện ngay.
- **Chuẩn bị:** vào app bằng tài khoản Chị Hoa.
- **Làm:**
  1. Tab Lịch, bấm "Đặt phòng".
  2. Chọn phòng 1509, ngày nhận 15/10, chọn "2 đêm".
  3. Bấm "Thêm đặt phòng".
- **Mong đợi:**
  - Có thông báo "Đã thêm đặt phòng Anh Nam · 1509" ở đầu màn.
  - Ngày 15/10, 16/10 được tô; 17/10 không tô.
- **Nguồn:** YC4.1-NT1, YC2.1-NT4
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**
```

Luật:
1. Mã `<US>-KB<n>`, đánh số từ 1 trong từng US, không dùng lại (CL3). Kịch bản bỏ thì gạch tiêu đề và ghi lý do, không xóa.
2. Nhãn: `[Chính]` luồng đúng, `[Lỗi]` nhập sai hay bị chặn, `[Biên]` ngày đầu cuối, số tối đa, số không, `[Mạng]` mất mạng, đang tải, quay lại từ nền, `[Quyền]` người không được phép làm hay thấy, `[Zalo]` hộp thoại, quyền, cửa sổ của Zalo.
3. Phủ: mỗi NT trong "Làm tiêu chí nào" có ít nhất một kịch bản. Thêm kịch bản cho trạng thái màn của YC (HV1 đến HV8), nhánh rẽ trong bảng Hành vi, ví dụ số của QT, và ô PQ làm được bằng tay trên app.
4. Chỉ ghi việc làm được bằng tay trên điện thoại. Việc phải gọi thẳng API (ví dụ chủ nhà A sửa căn của chủ nhà B qua API) thuộc test tự động trong task Code, không vào mục này.
5. Viết ngắn, câu đơn, số và tên cụ thể theo DLM. Mỗi bước một thao tác. Mong đợi là thứ nhìn thấy được trên màn.
6. Đức ghi kết quả: đánh dấu ☑ OK hoặc ☑ NG, ngày, tên. NG thì ghi thấy gì và mở BG trỏ tới mã kịch bản. Chạy lại sau khi sửa thì thêm một dòng Kết quả mới, không xóa dòng cũ.
7. Câu có [MỞ] trong YC thì không viết kịch bản cho phần đó.


- `rui_ro` lấy mức cao nhất trong các mục YC của `thuc_hien`. Chạm tiền, chặn trùng, quyền xem giá, dữ liệu người dùng: luôn cao.
- `uoc_luong` do Đức ghi trước khi làm, không sửa sau (templates/item.md). Phiên viết US được đề xuất, ghi "đề xuất" sau số.

## CL14.6a · Chọn model cho task của Claude Code `[r2 · thêm]`
Tùng quyết ngày 2026-11-03: "nhớ là US cũng hãy chọn model phù hợp nhé, lúc tạo US phải ghi luôn chạy task với model nào, hãy ước lượng dựa trên đặc điểm của task đó phù hợp với model nào, ưu tiên chất lượng hơn việc tiết kiệm token => ghi điều này vào hướng dẫn."

Khi viết US, mỗi task Code ghi luôn model sẽ chạy, trong ngoặc sau "Claude Code". Phiên làm task dùng đúng model đó. Ghi theo đặc điểm của task, không theo cả US. **Ưu tiên chất lượng hơn tiết kiệm token**: phân vân giữa hai mức thì chọn mức cao hơn.

| Model | Chọn khi task | Ví dụ |
|---|---|---|
| opus | Sai thì mất tiền, lộ dữ liệu hay hỏng lịch: tiền, chặn trùng, quyền xem giá, dữ liệu người dùng, đăng nhập và token. Hoặc thiết kế mới: data model, migration, API chưa có mẫu, sửa nhiều file cùng lúc. Hoặc đặc tả còn chỗ phải suy luận | US3-TA1 ràng buộc chặn trùng, US3-TA2 API ghi booking |
| sonnet | Có mẫu sẵn và đặc tả rõ: màn theo canvas đã có, test tự động theo NT có ví dụ số, sửa nhỏ theo chỉ thị cụ thể | US3-TA3 form CN4 theo canvas, US3-TA4 test theo NT |
| haiku | Việc cơ học, không cần hiểu nghiệp vụ: đổi chữ hàng loạt theo danh sách, định dạng lại. Ít dùng, vì ưu tiên chất lượng | Đổi nhãn nút theo bảng đã cho |

Quy tắc kèm theo:
- Task Code chạm rủi ro cao của CLAUDE.md (hai lớp giá, chặn trùng ở database, căn tự nhập hiện "?", dữ liệu ở Việt Nam) luôn là opus.
- Test vi phạm quyền luôn là opus, vì phải nghĩ ra cách phá.
- Đang làm mà thấy task khó hơn dự kiến thì dừng, báo, đổi lên model cao hơn. Không tự hạ model.
- Áp cho mọi task của Claude Code ở EN, BG, DC, không chỉ US.
- Task Test tay và Nghiệm thu không ghi model.
- Việc giao cho agent chạy nền thì chọn model theo CL10.6. `[r3 · thêm]`

## CL14.7 · Các bước của phiên viết US
1. Người dùng cho biết ai đang làm và nhóm YC hoặc EP cần viết US.
2. Đọc docs/product/requirements/INDEX.md, các YC đó, QT và HV chúng trỏ tới, US hiện có cùng `cha`.
3. Lập bảng phủ: mỗi NT của các YC đó thuộc US nào. NT chưa có US thì đề xuất US mới hoặc thêm vào US có sẵn.
4. Đề xuất danh sách US (tên, vai, NT, `truoc`, rủi ro, ước lượng đề xuất, model từng task theo CL14.6a `[r2 · sửa]`) cho người dùng xem trước khi viết file.
5. Viết hoặc sửa file US theo CL14.4 và CL14.5. Sửa `thuc_hien` về bản YC hiện tại. Viết kịch bản test tay vào tests/kb/<US>-<ten-ngan>.md (CL14.5a), mỗi kịch bản gắn `[Chính]` hoặc `[Biên]`. Chạy `python3 scripts/kiem.py <file US>` (luật doc-ma) và `python3 scripts/goi.py <US>` để chắc mục Đọc trích được. `[r7 · sửa]`
6. Ghi bảng phủ vào Nhật ký của item DC đang làm (ví dụ DC15), hoặc vào file work/plan/phu-nt-<EP>.md nếu bảng dài.
7. Không sửa THU-TU.md: thứ tự backlog do Tùng sắp (CL4.3.2). Đề xuất thứ tự trong PR.
8. Mở PR một nhóm US. Báo ba dòng: đã làm, còn lại, ai làm gì tiếp.

## CL14.8 · Khi YC đổi bản
- Mục trong `thuc_hien` lên bản thì US có cờ "Đặc tả đổi". US chưa bắt đầu: sửa `@bản` và danh sách NT. US đang làm hoặc đã xong: tạo DC hoặc US mới cho phần thay đổi (CL6), không sửa lặng lẽ US đã xong.

## Lịch sử sửa đổi
Dòng cũ hơn: [docs/_lich-su/process/CL14-user-story.md](../_lich-su/process/CL14-user-story.md).

| Rev | Ngày | Người | Commit hoặc PR | Thay đổi | Mục bị đổi |
|---|---|---|---|---|---|
| r3 | 2026-11-03 | Tùng | CL14-chon-model | Thêm câu cuối CL14.6a trỏ sang CL10.6 cho việc giao chạy nền. Tùng: "cập nhật cả việc dùng model phù hợp cho background task vào trong tài liệu hướng dẫn nhé." | CL14.6a thêm một dòng |
| r4 | 2026-11-03 | Tùng | EN48-test-case-us | Thêm mục Test case trong US (CL14.5a), dòng Test case ở CL14.4, chạy kịch bản ở CL14.5. Tùng duyệt mẫu ngày 2026-11-03: "Bổ sung các test case (vào một mục test case cho mỗi US, cố gắng cover tất cả các case có thể có, ... tester đọc và dễ làm theo, bao gồm: mô tả ngắn gọn mục đích test, thao tác, expected output ... Khi test thì đức sẽ test theo từng case và cập nhật từng case OK hay NG" rồi "Duyệt, làm theo" | CL14.4, CL14.5 sửa, CL14.5a thêm |
| r5 | 2026-11-04 | Tùng | EN56-quy-trinh-moi | Kịch bản test ra tests/kb, thêm Phạm vi, Đọc ghi bằng mã, test ở đúng lớp, test viết trước cho rủi ro cao (QD26) | CL14.1, CL14.3, CL14.4, CL14.5, CL14.5a, CL14.7 sửa |
| r6 | 2026-11-07 | Tùng | EN63-skill-tu-goi | Task Nghiệm thu chỉ có khi US ghi nghiem_thu: co. Đổi tên skill lam sang lam-mot-item | CL14.4, CL14.5 sửa |
| r7 | 2026-11-07 | Tùng | EN64-soan-viec-user-story | Mục Đọc chỉ ghi mã trich.py tìm được, Phạm vi bắt buộc, kiểm bằng kiem.py và goi.py | CL14.4, CL14.7 sửa |
