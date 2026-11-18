# Quy trình làm việc · Home247 bản PWA

<!-- Tài liệu sống. Đổi cách làm thì sửa file này trong cùng PR và ghi một QD. Lý do của từng luật: docs/Nguyen_ly_lam_viec.md và QD-015. -->

## 1. Tóm tắt một trang

- Mỗi việc là một story trong `docs/stories/`. Không có việc nào làm mà không có story.
- Story chứa đủ để làm. Luật dùng chung nằm một chỗ ở `docs/luat-chung/`, story trỏ tới bằng mã.
- Mỗi tiêu chí nghiệm thu (mã `…-NT<số>`) có một test tự động mang đúng mã đó. Test viết trước code.
- Code luôn trên nhánh và pull request. Claude merge khi Tùng bảo và PR đủ điều kiện (mục 10).
- Mỗi thông tin chỉ nằm ở một chỗ. Thấy hai chỗ nói khác nhau thì dừng và hỏi, không tự chọn.
- Chỗ gắn thẻ `[MỞ: <mã>]` thì chưa được code. Hỏi Tùng.
- Lý do của quyết định ghi ở `docs/Quyet_dinh.md`.

## 2. Người và quyền

| Ai | Làm gì | Quyết gì |
|---|---|---|
| Tùng | Chủ sản phẩm. Viết và chốt story, thiết kế, thứ tự làm | Mọi thứ về sản phẩm, quyền, tiền, phát hành. Lời Tùng trong phiên là quyết định, có hiệu lực ngay |
| Đức | Kiểm tay trên điện thoại thật, môi trường, việc cần máy thật | Lời Đức là đề xuất, trừ kết quả kiểm tay |
| Claude | Code, test, cập nhật tài liệu sống, mở PR, chạy migration trên staging | Cách cài đặt bên trong một story |

Hai người có thể dùng chung một tài khoản Claude. Câu đầu phiên phải nói ai đang làm ("Tôi là Tùng", "Tôi là Đức"). Không có thì Claude hỏi.

Claude phải hỏi Tùng trước khi: chạy migration trên production, xóa dữ liệu, đổi phân quyền (policy RLS, cột của view cho sale, ô trong `PQ.md`), làm việc không đảo ngược được. Chữ "đồng ý" chung chung không tính: lời duyệt phải nói rõ duyệt cái gì.

Claude không đọc dữ liệu production (có tên, số điện thoại khách). Cần kiểm thì dựng lại trên staging.

Khi Tùng chốt một điều trong phiên, Claude ghi ngay: quyết định đổi hướng vào `Quyet_dinh.md`; câu trả lời cho một câu hỏi mở vào mục "Đã trả lời" của `Cau_hoi_mo.md` rồi sửa chỗ gắn thẻ. Luôn kèm ngày và câu nguyên văn.

## 3. Tài liệu: cái gì ở đâu

Mỗi loại thông tin có một chỗ ở duy nhất. Chỗ khác cần nhắc tới thì ghi mã, không chép nội dung.

| Thông tin | Chỗ ở duy nhất | Sống hay đóng băng |
|---|---|---|
| Một nhóm chức năng phải làm gì: bảng bước, chữ trên màn, tiêu chí nghiệm thu, luật kiểm, quyền | Story của nhóm chức năng đó, `docs/stories/US<n>-….md` | Sống suốt dự án (mục 5) |
| Thứ tự làm, trạng thái từng story, story nào thay story nào | `docs/stories/README.md` | Sống |
| Luật dùng ở nhiều story: tính giá, chặn trùng (QT), quyền (PQ), hành vi mọi màn (HV), luật chung của database, từ ngữ, dữ liệu mẫu, khác biệt PWA và Zalo | `docs/luat-chung/` | Sống |
| Lý do: vì sao chọn cách này, đã cân phương án nào | `docs/Quyet_dinh.md` | Sống, chỉ thêm |
| Câu hỏi chưa có lời đáp, giả định đang dùng | `docs/Cau_hoi_mo.md` | Sống |
| Cấu trúc database | `supabase/migrations/` | Sống, chỉ thêm |
| Danh sách bảng, cột, hàm, policy | `docs/tu-sinh/Bang_va_cot.md`, máy sinh | Không sửa tay |
| Ý định và bất biến của database | `docs/Thiet_ke_DB.md` | Sống |
| Màn trông thế nào | `docs/thiet-ke/canvas/` | Sống |
| Hệ thống đang làm gì | Code và test | Sống |
| Kịch bản kiểm tay | `tests/kich-ban/US<n>.md` | Sống |
| Tài liệu tham khảo cho bản Zalo, pháp lý, bảo mật | `docs/zalo/`, `docs/phap-ly/`, `docs/bao-mat.md` | Đóng băng, đọc khi cần |

Không có loại ở giữa. Một tài liệu hoặc sống (luôn đúng với hiện tại, phần chưa làm được đánh dấu rõ), hoặc đã đóng băng và thua test.

**Thứ tự tin khi hai nguồn lệch nhau:** `Quyet_dinh.md` (mục mới nhất) → `docs/luat-chung/` → story → thiết kế → code. Thấy lệch thì dừng phần đó, hỏi Tùng, không tự chọn bên nào. Story và test lệch nhau ở phần không ghi "chờ code": đó là lỗi, CI phải đã báo (mục 5.2); dừng, hỏi Tùng bên nào đúng.

**Lý do ghi ở đâu:**
- Lý do đổi hướng sản phẩm hay kỹ thuật: một mục trong `Quyet_dinh.md` (bối cảnh, phương án, chọn gì, vì sao, hệ quả). Tiêu chí để biết có đáng ghi không: sau này một người hợp lý có thể muốn sửa ngược lại.
- Lý do nhỏ của một luật: một dòng chú thích ngay tại test hoặc migration.
- Lý do của cách cài đặt: phần mô tả PR.

**Không tạo lại các loại file sau** (đã bỏ theo QD-015): file yêu cầu YC riêng, file mô tả màn bằng chữ, file nhật ký thay đổi, thư mục task riêng. Mọi thứ đó nằm trong story.

## 3b. Checkpoint tài liệu

`python3 scripts/kiem-tai-lieu.py` kiểm các điểm dưới đây ở mọi PR. Có lỗi thì CI đỏ, không merge. Phần trong khối mã và trong dấu `…` là ví dụ, không bị kiểm.

| Mã | Kiểm gì |
|---|---|
| C1 | Không còn mã `YC…` của bản Zalo (trừ các mục cũ của `Quyet_dinh.md` và bảng đổi mã) |
| C2 | Mã được nhắc tới đều có thật: QD, CH, US, tiêu chí, QT, PQ, HV, GD, DLM, mã màn |
| C3 | Đường dẫn file và link markdown đều tồn tại |
| C4 | Không còn chữ trỏ tới cấu trúc tài liệu của bản Zalo hay tính năng đã bỏ: tên file, thư mục cũ, công tắc giá, "câu hỏi N" không có mã (danh sách `CU` trong script) |
| C5 | Không trỏ ra ngoài repo (thư mục máy, file tạm, repo cũ) |
| C6 | Mỗi tiêu chí định nghĩa đúng một lần; không tiêu chí nào trong bảng đổi mã bị mất |
| C7 | Mỗi thẻ MỞ có mã và có dòng trong `Cau_hoi_mo.md`; dòng câu hỏi không còn chỗ dùng thì báo |
| C8 | Trạng thái story trong file khớp `docs/stories/README.md`; khớp mục "Thay đổi chưa xong" và đuôi tiêu chí; story chờ test hay xong thì mọi tiêu chí có test (mục 5.2) |
| C9 | Story có dòng "Đặc tả"; đặc tả thô chỉ ở trạng thái chờ code; story đã viết lại không còn mục nguyên liệu thô |
| C11 | Không có email, số điện thoại thật |

Kiểm code (C12): CI chạy kiểm kiểu, unit test, build, E2E chế độ thử, test database, thử làm hỏng, và so `docs/tu-sinh/Bang_va_cot.md` với migration.

Thêm loại tài liệu hay loại mã mới thì thêm phép kiểm vào script trong cùng PR.

## 4. Story

### 4.1 Một loại, một khuôn

Mọi việc đều là story, phân biệt bằng dòng "Loại":

| Loại | Là gì | Ví dụ |
|---|---|---|
| tính năng | Người dùng làm được việc mới | Sale tìm phòng trống |
| thiết kế | Vẽ hay vẽ lại màn, khi hình vẽ trải trên nhiều story. Vẽ màn của một tính năng là một việc bên trong story tính năng đó | Vẽ lại thanh menu |
| lỗi | App chạy sai so với một tiêu chí đã có | Đêm thứ Bảy tính giá ngày thường |
| kỹ thuật | Không đổi hành vi người dùng thấy | Đăng nhập, dựng nền, phát hành |

Ba trạng thái (QD-019):

| Trạng thái | Nghĩa |
|---|---|
| **chờ code** | Story có phần chưa code, hoặc code chưa có đủ test tự động. Story chưa từng được code thì cả story ở trạng thái này |
| **chờ test** | Mọi phần đã code, có test tự động xanh, đã merge; chưa kiểm tay trên điện thoại thật |
| **xong** | Mọi phần đã code, có test tự động xanh, đã kiểm tay luồng chính trên điện thoại thật |

Chưa code, chưa test, test đỏ đều là chưa xong. Story sửa thêm sau khi đã "xong" thì về lại "chờ code" (mục 5).

Không chạy sprint. Làm theo thứ tự ở `docs/stories/README.md`.

### 4.2 Khuôn story (mục nào không có thì bỏ)

Mẫu đã duyệt: `docs/stories/US3-dat-phong.md` (Tùng duyệt 18/11/2026). Viết story mới thì chép cấu trúc của mẫu.

```markdown
# US<n> · <Tên: ai làm được gì>

- Loại: tính năng | thiết kế | lỗi | kỹ thuật
- Trạng thái: chờ code | chờ test | xong
- Đặc tả: đã viết lại | thô (…)
- Bản: 1 | sau
- Rủi ro: cao | tb | thap      (cao: chạm tiền, quyền, chặn trùng, dữ liệu người dùng)
- Làm sau khi xong: US…
- Kiểm tay: tests/kich-ban/US<n>.md

## Thay đổi chưa xong  (chỉ có khi story đã từng được code) Mỗi lần sửa một dòng: ngày · đổi gì · tiêu chí mới, đổi, bỏ · chờ code | chờ test. Xem mục 5.
## Mục tiêu            Là <ai>, tôi muốn <gì>, để <được gì>. Thêm một đoạn: vì sao việc này quan trọng.
## Luồng chính         Văn xuôi, kể một lần dùng từ đầu tới cuối với số của bộ mẫu (hôm nay 07/10/2026). Cả nhánh lỗi quan trọng nhất.
## Phạm vi             "Story này làm" và "Không làm (dễ tưởng thuộc story này)", mỗi dòng ghi story nào làm.
## Hành vi             Chia theo từng phần của màn. Bảng: Bước | Người dùng | App | Database. Chữ trong ngoặc kép là chữ trên màn.
                       Đủ các nhánh: lỗi dữ liệu, trùng, mất mạng, bấm hai lần, không có quyền. Kết thúc bằng "Trạng thái màn".
## Tiêu chí nghiệm thu  - **US<n>-NT<k>** Khi <tình huống có số>, thì <kết quả kiểm được>. · <lớp test: database | unit | E2E>
                       Nhóm theo chủ đề. Có tiêu chí vi phạm quyền.
## Luật kiểm dữ liệu và lỗi   Bảng: Ô | Bắt buộc | Luật | Câu lỗi khi sai (đúng chữ người dùng thấy).
## Quyền               Mã ô PQ, mỗi dòng trỏ tới tiêu chí kiểm vi phạm.
## Database            Bảng và hàm dùng tới, test đã có. Mục "Database đang lệch story, phải sửa trong PR của story này".
                       Thứ đọc thẳng qua RLS, không cần hàm.
## Màn hình            Mã màn; chỗ hình lệch story (story đúng).
## Luật chung dùng     Mã QT, HV, mục của Nghiep_vu. Không chép nội dung.
## Câu hỏi mở và giả định   [MỞ: …] và GD… dùng trong story.
## Việc cần làm        - [ ] … (hỏi Tùng; test database; migration; unit; giao diện; E2E; sửa kịch bản kiểm tay; kiểm tay; đổi trạng thái)
```

Luật viết:
- Một story là một nhóm chức năng, giữ suốt dự án (QD-019, QD-020). Story to thì code theo từng phần: mỗi PR làm một phần (một mục ở "Hành vi"), PR ghi phần nào; tiêu chí nào đã có test thì máy đếm. Không tách story để cho nhỏ.
- Story tự đủ: phiên code chỉ đọc story này và luật chung nó trỏ tới bằng mã. Không mượn bảng bước của story khác. Một màn dùng chung cho nhiều story thì mỗi story mô tả đúng các bước nó làm.
- Mỗi tiêu chí nghiệm thu thuộc đúng một story. `scripts/kiem-tai-lieu.py` kiểm điều này.
- Tiêu chí phải có số cụ thể lấy từ `docs/luat-chung/Du_lieu_mau.md` để viết thành test được. Không viết được ví dụ thì luật chưa đủ rõ để code: hỏi Tùng.
- Mã tiêu chí: `US<n>-NT<số>`, theo story chứa nó. Mã câu hỏi: `CH-<số>` (hỏi chung) hoặc `US<n>-H<số>` (chỗ chưa rõ trong một story). Không dùng mã `YC…` của bản Zalo (QD-018).
- Chỗ chưa rõ: gắn thẻ `[MỞ: US<n>-H<số>]` ngay tại câu đó và thêm một dòng vào `Cau_hoi_mo.md`. Không lấp bằng cách làm phổ biến.
- Viết story phải đọc hàm database liên quan. Chỗ database làm khác story thì ghi vào "Database đang lệch story": story là ý định, database sửa theo, trừ khi Tùng quyết khác.

### 4.2b Đặc tả thô

35 story chuyển từ bản Zalo được lắp bằng máy ngày 18/11/2026: đủ nguyên liệu (bảng bước, chữ trên màn, tiêu chí, luật kiểm, ai được làm, việc kéo theo, màn, quyền) nhưng chưa viết theo khuôn, còn chữ của bản Zalo và chưa đối chiếu với database. Các story này ghi `- Đặc tả: thô`.

- **Không code theo story có đặc tả thô.** Viết lại trước (story US41), rồi mới làm.
- Story thô **chưa có** nhiều quyết định Tùng đã chốt ở bản Zalo (13 điểm ngày 04/11/2026 và khoảng 150 câu nói, câu trả lời khác). Chúng nằm ở `docs/tham-khao/Loi_Tung_ban_Zalo.md`; viết lại story nào thì áp phần của story đó.
- Viết lại không đổi nghĩa tiêu chí. Khi gộp story theo nhóm (QD-020), tiêu chí và câu hỏi được đánh số lại theo thứ tự đọc trong story mới; đổi bằng máy ở mọi chỗ trong cùng commit và ghi vào `docs/tu-sinh/Doi_ma_gop.md`. Sau lần gộp đó, mã không đổi nữa: tiêu chí thêm mới cấp số tiếp theo, tiêu chí đổi nghĩa cấp mã mới (mục 5).
- Thấy nguyên liệu mâu thuẫn nhau hay mâu thuẫn với `Quyet_dinh.md`: dừng phần đó, hỏi Tùng.

## 5. Story sống suốt dự án (QD-019)

Mỗi nhóm chức năng có một story, giữ suốt quá trình làm. Story luôn mô tả hành vi **mong muốn hiện tại** của nhóm chức năng đó. Đọc story là biết tính năng phải chạy thế nào, không phải ghép nhiều mảnh.

Lý do không đóng băng: yêu cầu của Home247 đổi thường xuyên sau khi kiểm tay và dùng thử. Đóng băng thì mỗi lần đổi sinh một story mới, mô tả một tính năng rải qua nhiều file. Lỗi mà đóng băng định chặn (story nói một đằng, code làm một nẻo) được chặn bằng hai cách dưới đây.

### 5.1 Sửa story

Story sửa được bất cứ lúc nào, kể cả trước khi code. Story **chưa từng được code** (trạng thái "chờ code", chưa có mục "Thay đổi chưa xong"): sửa thẳng, không cần ghi chú.

Story **đã từng được code** (đã qua "chờ test" hoặc "xong"): sửa thẳng nội dung, và cùng lúc:
1. Thêm một dòng vào mục **"Thay đổi chưa xong"** ở đầu story:
   `- 25/11/2026 · Đổi cách tính ngày trả khi chọn "Tùy chọn" · mới: US3-NT25 · đổi: US3-NT8 → US3-NT26 · bỏ: US3-NT9 · chờ code`
2. Tiêu chí bị đổi nghĩa thì **xóa dòng cũ, thêm dòng mới với mã mới**. Mã cũ không bao giờ quay lại với nghĩa khác. Tiêu chí mới hay vừa đổi thì thêm đuôi ` · chờ code` vào dòng đó.
3. Chuyển Trạng thái về **"chờ code"** ở story và ở `docs/stories/README.md`.
4. Lý do đổi lớn (một người hợp lý sau này có thể muốn đổi ngược lại): ghi thêm một mục ở `docs/Quyet_dinh.md`.

Code xong phần đó (test tự động xanh, merge): đổi đuôi thành ` · chờ test`, đổi chữ cuối dòng trong "Thay đổi chưa xong" thành "chờ test", Trạng thái thành "chờ test". Kiểm tay xong: xóa đuôi, xóa dòng trong "Thay đổi chưa xong" (lịch sử nằm trong git), Trạng thái thành "xong" nếu không còn dòng nào.

Phiên code đọc mục "Thay đổi chưa xong" để biết lần này làm gì; đọc phần còn lại của story để biết phần nào không được làm hỏng.

### 5.2 Máy giữ story và test khớp nhau

`scripts/kiem-tai-lieu.py` kiểm:
- Trạng thái khớp với mục "Thay đổi chưa xong" và đuôi của các tiêu chí.
- Story ở "chờ test" hay "xong": mọi tiêu chí không mang đuôi "chờ code" đều có test mang mã đó trong `tests/` hoặc `src/`.
- Test mang mã tiêu chí mà tiêu chí đó không còn ở story nào: lỗi. Sửa story mà quên sửa test (hoặc ngược lại) thì CI đỏ.

### 5.3 Test khi sửa story

| Tình huống | Làm gì với test |
|---|---|
| Hành vi không đổi | Test cũ giữ nguyên và phải xanh. Đây là lưới bắt lỗi lan |
| Hành vi mới thêm | Viết test mới, mã mới |
| Hành vi đổi | Đổi tên test sang mã mới và sửa kỳ vọng trong cùng PR, sửa test trước rồi mới sửa code |
| Luật bị bỏ | Xóa test cùng PR với việc xóa tiêu chí khỏi story |

- Không bao giờ tắt hay bỏ qua test (`skip`, chú thích lại, xóa lệnh kiểm) để cho qua.
- Người merge xem diff của story và diff dưới `tests/` cùng lúc: hai bên phải nói cùng một thay đổi.

## 6. Test

Hai thứ độc lập để đối chiếu: ý định viết thành test, và code. Test phải viết từ tiêu chí, trước khi có code; nhìn code mà viết test thì test chép lại cái sai của code.

| Lớp | Kiểm gì | Ở đâu | Chạy bằng |
|---|---|---|---|
| Database | Quyền (ai đọc, ai ghi được gì), tiền, giá, chặn trùng, trạng thái | `tests/db/t_*.sql` | `scripts/test-db.sh` |
| Thử làm hỏng | Test database có bắt được lỗi không: cố ý phá từng luật, test phải đỏ | `scripts/thu-lam-hong.sh` | cùng tên |
| Unit | Hàm tính toán và hiển thị ở app | cạnh file code, `*.test.ts(x)` | `npm test` |
| E2E | Luồng chính bấm trên trình duyệt thật | `tests/e2e/` | `npm run e2e` |
| Kiểm tay | Cảm giác dùng, một tay, chữ dễ hiểu, điện thoại thật | `tests/kich-ban/` | người |

Luật:
- Mỗi tiêu chí kiểm ở lớp rẻ nhất mà vẫn bắt được lỗi. Quyền và tiền luôn kiểm ở lớp database, vì giao diện đúng không chứng minh được dữ liệu không lộ.
- Tên test có mã tiêu chí (`US12-NT7 …`), để tra ngược được.
- Đổi hay thêm hàm `fn_*`, policy, view, ràng buộc: thêm test trong `tests/db/` và một dòng trong `scripts/thu-lam-hong.sh` cùng PR.
- Mỗi ô quyền trong `PQ.md` mà story chạm tới phải có một test vi phạm: đóng vai người không có quyền, chứng minh không đọc, không ghi được.
- CI chạy mọi lớp tự động ở mỗi PR (`.github/workflows/`). CI đỏ thì không merge.
- Test xanh chỉ chứng minh những gì đã viết ra. Luồng chính của mỗi story vẫn phải có người bấm thử trên điện thoại thật trước khi ghi "xong".

## 7. Thiết kế

Thiết kế là một file canvas HTML ở `docs/thiet-ke/canvas/`. Không có file mô tả màn bằng chữ: điều hình vẽ không nói được (vào từ đâu, bấm gì sang đâu, trạng thái rỗng và lỗi) ghi trong story.

- Mỗi mã màn có đúng một hình trên canvas. Xem một màn: `python3 docs/thiet-ke/trich-man.py <mã>`. Không mở cả file canvas.
- Màn chưa code: sửa thẳng hình đó.
- Màn đã code, chỉnh nhỏ (khoảng cách, màu, cỡ chữ): sửa code, không cần sửa canvas.
- Màn đã code, vẽ lại lớn: thay hình cũ bằng hình mới, giữ mã màn, ghi một dòng "Thay đổi chưa xong" ở story của màn đó.
- Trạng thái hay biến thể mới: mã màn mới (`S2-00`, `S2-01`).
- Hai phương án để chọn: vẽ tạm cả hai, Tùng chọn xong thì xóa phương án thua. Lịch sử nằm trong git.
- Vẽ màn của một tính năng là một việc trong story tính năng đó. Chỉ mở story loại "thiết kế" khi hình vẽ trải trên nhiều story.
- Chữ hay số trên hình lệch story thì story đúng; ghi chỗ lệch vào PR.

## 8. Database

- Migration chỉ thêm. Không sửa file migration đã chạy trên staging hay production; muốn đổi thì thêm file mới. (Các file `20261118…` chưa chạy ở đâu tại thời điểm dựng repo; từ lần chạy đầu trên staging trở đi áp dụng luật này.)
- Mọi thao tác ghi đi qua hàm `fn_*` (`security definer`, `set search_path = public`), hàm tự kiểm quyền. App không ghi thẳng vào bảng.
- Mọi bảng bật RLS. Quyền của sale chỉ đi qua `my_shared_can_ids()`.
- Sale không đọc bảng `booking`. Thêm cột vào view hay hàm trả dữ liệu cho sale là đổi phân quyền: hỏi Tùng.
- Sau khi thêm migration: chạy `scripts/test-db.sh` rồi `scripts/bang-cot.sh`, commit file vừa sinh.
- Sửa dữ liệu riêng của production: ghi thành file trong `data-fixes/`, Tùng duyệt, không sửa tay.
- Ý định, bất biến, ai đọc ghi gì: `docs/Thiet_ke_DB.md`.

## 9. Vòng làm một story

1. Đọc `CLAUDE.md`, rồi story. Chỉ đọc thêm những gì story trỏ tới bằng mã.
2. Kiểm điều kiện: các story ở "Làm sau khi xong" đã xong; không còn thẻ `[MỞ]` chặn phần định làm. Còn thì hỏi Tùng trước.
3. Tạo nhánh `US<n>-<tên-ngắn>`. Story chưa từng được code thì làm cả story; đã từng được code thì làm đúng các dòng ở "Thay đổi chưa xong".
4. Viết test cho từng tiêu chí, chạy thấy đỏ.
5. Code cho tới khi test xanh. Database trước, giao diện sau.
6. Chạy đủ: `scripts/test-db.sh`, `scripts/thu-lam-hong.sh`, `npm run typecheck`, `npm test`, `npm run build`.
7. Mở PR theo mẫu ở phụ lục A. Vercel tạo bản xem thử cho PR, trỏ vào staging.
8. Tùng mở bản xem thử trên điện thoại, kiểm luồng chính. Tùng bảo merge thì Claude soát điều kiện ở mục 10 rồi merge; hoặc Tùng tự bấm merge.
9. Đức kiểm tay theo `tests/kich-ban/US<n>.md`. Lỗi thì mở story loại "lỗi".
10. Đổi Trạng thái (mục 4.1, 5.1) ở story và ở `docs/stories/README.md`.

Gặp việc ngoài phạm vi story: không làm luôn. Sửa story của nhóm chức năng đó (mục 5.1), hoặc ghi một dòng trong `Cau_hoi_mo.md`.

## 10. Git và pull request

- Code luôn trên nhánh và PR, kể cả sửa nhỏ. Một PR một story.
- Tài liệu sống không kèm code (sửa story trước khi code, câu hỏi, quyết định, kết quả kiểm tay) được đẩy thẳng `main`.
- Commit tiếng Việt, mở đầu bằng mã story: `US12: tìm phòng trả căn trống theo ngày`.
- Không đẩy ép. Không tắt hay sửa test để cho qua.

**Ai merge (QD-017).** Tùng tự bấm, hoặc bảo Claude merge ngay trong phiên ("merge PR #12", "merge đi" ngay sau báo cáo của một PR). Lời của Đức không đủ. Claude không tự merge khi không ai bảo, kể cả khi CI xanh.

Trước khi merge, Claude soát và chỉ merge khi đủ cả:
1. CI xanh trên commit mới nhất của PR, không xung đột với `main`.
2. Thay đổi dưới `tests/`: không test nào bị tắt hay nới; mỗi test sửa hoặc xóa ứng với một tiêu chí đổi hoặc bỏ trong story của PR.
3. PR đổi phân quyền (policy, view hay hàm trả dữ liệu cho sale, ô trong `PQ.md`): Tùng đã duyệt bằng lời nói rõ cái được đổi.
4. PR có migration: đã chạy được trên staging.

Thiếu điều nào thì không merge, báo Tùng thiếu gì. Merge xong: xóa nhánh, đổi trạng thái story nếu cần, báo một dòng.
- Không có bí mật trong repo, chat hay log. Repo này công khai: không ghi email, số điện thoại, tên người dùng thật.

## 11. Môi trường và phát hành

| Môi trường | Database | Giao diện | Ai dùng |
|---|---|---|---|
| Máy dev, CI | Postgres trống dựng từ migration | `npm run dev` | Claude, CI |
| Staging | Project Supabase staging, có dữ liệu mẫu | Bản xem thử của Vercel cho mỗi PR | Tùng, Đức, E2E |
| Production | Project Supabase production | Tên miền chính | Người dùng thật |

- Không có biến môi trường Supabase thì app chạy bằng dữ liệu mẫu trong máy (chế độ thử), để xem giao diện mà không cần database.
- Migration lên staging: Claude chạy. Lên production: Tùng duyệt từng lần.
- Chưa tạo project production cho tới khi CH-002 (dữ liệu đặt ở đâu) có lời đáp.
- Việc cần người làm bằng tay: `VIEC_TAY_CUA_TUNG.md`. Vận hành: `docs/van-hanh/`.

## 12. Bảo mật và dữ liệu người dùng

- Khóa `service_role` của Supabase không bao giờ nằm ở app, ở `.env.example` hay trong chat.
- App chỉ dùng khóa công khai (`anon`); mọi bảo vệ nằm ở RLS và hàm.
- Tên và số điện thoại khách chỉ người nhập thấy (QD-011). Không ghi vào log, không đưa vào thông báo.
- Chi tiết: `docs/bao-mat.md`, `docs/van-hanh/Bi_mat_va_cau_hinh.md`.

## 13. Cách Claude báo cáo

Tiếng Việt, ngắn như nói chuyện, kết luận trước. Câu đầu tóm tình hình, in đậm chữ chính. Bên dưới các phần **Đã xong**, **Cần chú ý**, **Cần anh quyết**; phần nào trống thì bỏ. Nói rõ cái gì đã kiểm và kiểm bằng cách nào, cái gì chưa kiểm. Rủi ro xếp theo mức nguy hiểm, kèm cách phòng.

## Phụ lục A · Mẫu mô tả pull request

```markdown
## Làm gì          <story nào, một hai câu>
## Vì sao làm cách này   <lý do của cách cài đặt; quyết định lớn thì trỏ QD>
## Tiêu chí và test   <mã NT → tên test>
## Test bị sửa hoặc xóa   <tên test, mã tiêu chí cũ, lý do; không có thì ghi "không">
## Đã kiểm         <lệnh đã chạy, kết quả>
## Chưa kiểm       <ví dụ: chưa thử trên iPhone>
## Giả định và câu hỏi   <mã GD, mã câu hỏi>
```

## Phụ lục B · Trước khi merge (người bấm merge, dù là Tùng hay Claude)

- [ ] CI xanh.
- [ ] Đã mở bản xem thử trên điện thoại, đi hết luồng chính.
- [ ] Đã xem diff của story và diff dưới `tests/` cùng lúc: không có test bị tắt; mỗi test đổi hay xóa ứng với một tiêu chí đổi hay xóa trong story.
- [ ] Có migration: đã chạy trên staging, `docs/tu-sinh/Bang_va_cot.md` đã sinh lại.
- [ ] Đổi phân quyền: Tùng đã duyệt bằng lời nói rõ.
- [ ] Story và `docs/stories/README.md` đã đổi trạng thái.
