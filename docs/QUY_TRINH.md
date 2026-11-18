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
| Một tính năng phải làm gì: bảng bước, chữ trên màn, tiêu chí nghiệm thu, luật kiểm, quyền | Story của tính năng đó, `docs/stories/US<n>-….md` | Sống tới khi merge, rồi đóng băng |
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

Không có loại ở giữa. Một tài liệu hoặc được sửa trong cùng PR với code, hoặc đã đóng băng và thua test.

**Thứ tự tin khi hai nguồn lệch nhau:** `Quyet_dinh.md` (mục mới nhất) → `docs/luat-chung/` → story → thiết kế → code. Thấy lệch thì dừng phần đó, hỏi Tùng, không tự chọn bên nào. Riêng với tính năng đã merge: test là sự thật, story đã đóng băng chỉ còn là lịch sử.

**Lý do ghi ở đâu:**
- Lý do đổi hướng sản phẩm hay kỹ thuật: một mục trong `Quyet_dinh.md` (bối cảnh, phương án, chọn gì, vì sao, hệ quả). Tiêu chí để biết có đáng ghi không: sau này một người hợp lý có thể muốn sửa ngược lại.
- Lý do nhỏ của một luật: một dòng chú thích ngay tại test hoặc migration.
- Lý do của cách cài đặt: phần mô tả PR.

**Không tạo lại các loại file sau** (đã bỏ theo QD-015): file yêu cầu YC riêng, file mô tả màn bằng chữ, file nhật ký thay đổi, thư mục task riêng. Mọi thứ đó nằm trong story.

## 4. Story

### 4.1 Một loại, một khuôn

Mọi việc đều là story, phân biệt bằng dòng "Loại":

| Loại | Là gì | Ví dụ |
|---|---|---|
| tính năng | Người dùng làm được việc mới | Sale tìm phòng trống |
| thiết kế | Vẽ hay vẽ lại màn, khi hình vẽ trải trên nhiều story. Vẽ màn của một tính năng là một việc bên trong story tính năng đó | Vẽ lại thanh menu |
| lỗi | App chạy sai so với một tiêu chí đã có | Đêm thứ Bảy tính giá ngày thường |
| kỹ thuật | Không đổi hành vi người dùng thấy | Đăng nhập, dựng nền, phát hành |

Ba trạng thái: **chưa làm**, **đang làm**, **xong**. "Xong" nghĩa là: mọi tiêu chí có test xanh, PR đã merge, đã kiểm tay luồng chính trên điện thoại thật. Chưa code, chưa test, test đỏ đều là chưa xong.

Không chạy sprint. Làm theo thứ tự ở `docs/stories/README.md`.

### 4.2 Khuôn story (mục nào không có thì bỏ)

```markdown
# US<n> · <Tên: ai làm được gì>

- Loại: tính năng | thiết kế | lỗi | kỹ thuật
- Trạng thái: chưa làm | đang làm | xong
- Bản: 1 | sau
- Rủi ro: cao | tb | thap      (cao: chạm tiền, quyền, chặn trùng, dữ liệu người dùng)
- Làm sau khi xong: US…
- Kiểm tay: tests/kich-ban/US<n>.md

## Mục tiêu            Là <ai>, tôi muốn <gì>, để <được gì>.
## Hành vi             Bảng bước: người dùng làm gì, app hiện gì (chữ trên màn trong ngoặc kép), database làm gì, dữ liệu nào đổi. Trạng thái màn: rỗng, đang tải, lỗi, không có quyền.
## Tiêu chí nghiệm thu  - **<mã>-NT<số>** Khi <tình huống có số cụ thể>, thì <kết quả kiểm được>.
## Luật kiểm dữ liệu và lỗi   Từng ô nhập: bắt buộc không, giới hạn, khi nào từ chối, báo câu gì.
## Luật chung dùng     Mã QT, HV, tên quy tắc. Không chép nội dung.
## Màn hình            Mã màn; màn nào vào từ đâu, bấm gì sang đâu.
## Quyền               Mã ô PQ; test vi phạm phải có.
## Database            Bảng, hàm dùng tới; đã có hay phải thêm.
## Ngoài phạm vi       Việc dễ tưởng thuộc story này nhưng không; thuộc story nào.
## Việc cần làm        - [ ] …
```

Luật viết:
- Một story làm được trong vài ngày. To hơn thì tách theo lát dọc (mỗi lát người dùng làm được một việc trọn vẹn).
- Mỗi tiêu chí nghiệm thu thuộc đúng một story. `scripts/kiem-tai-lieu.py` kiểm điều này.
- Tiêu chí phải có số cụ thể lấy từ `docs/luat-chung/Du_lieu_mau.md` để viết thành test được. Không viết được ví dụ thì luật chưa đủ rõ để code: hỏi Tùng.
- Mã tiêu chí của story mới: `US<n>-NT<số>`. Các story chuyển từ bản Zalo giữ mã cũ (`YC5.2-NT3`) để test và kịch bản không phải đổi tên.
- Chỗ chưa rõ: gắn thẻ `[MỞ: US<n>-H<số>]` ngay tại câu đó và thêm một dòng vào `Cau_hoi_mo.md`. Không lấp bằng cách làm phổ biến.

### 4.3 Story đóng băng sau khi merge

Story đã merge không sửa nữa, kể cả khi tính năng đổi về sau. Lý do: nó là bản ghi của việc đã làm; sửa nó thì không còn biết lúc đó đã làm theo cái gì. Sự thật của tính năng đã merge là test và code.

Ngoại lệ duy nhất: sửa dòng Trạng thái, và sửa lỗi chính tả không đổi nghĩa.

## 5. Đổi một tính năng đã xong

Viết story mới, không sửa story cũ. Story mới phải tự đủ: phiên code chỉ đọc story mới, không phải đọc lại story cũ.

```markdown
# US<n> · <Đổi gì>

## Hiện tại          Tính năng đang chạy thế nào. Lấy từ code và test, không lấy từ story cũ. Ghi tên test đang kiểm nó.
## Đổi thành         Hành vi mới, viết đủ như một story thường (bảng bước, chữ trên màn).
## Tiêu chí nghiệm thu   Tiêu chí mới, mã mới.
## Test bị đổi        Từng test cũ sẽ sửa hoặc xóa, kèm mã tiêu chí cũ và lý do.
```

Luật với test khi đổi tính năng:

| Tình huống | Làm gì với test |
|---|---|
| Hành vi không đổi | Test cũ giữ nguyên và phải xanh. Đây là lưới bắt lỗi lan |
| Hành vi mới thêm | Viết test mới |
| Hành vi đổi | Sửa kỳ vọng của test cũ trong cùng PR, sửa test trước rồi mới sửa code. Chỉ được sửa test mà story nêu tên ở mục "Test bị đổi" |
| Luật bị bỏ | Xóa test, ghi mã QD trong PR |

- Không bao giờ tắt hay bỏ qua test (`skip`, chú thích lại, xóa lệnh kiểm) để cho qua.
- Tiêu chí đổi nghĩa thì cấp mã mới. Mã cũ không bao giờ đổi nghĩa và không dùng lại.
- Người merge xem phần thay đổi dưới `tests/` trước tiên. Test bị sửa mà story không nêu tên thì không merge.
- Ghi vào `docs/stories/README.md` mục "Story nào thay story nào".

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
- Tên test có mã tiêu chí (`YC5.3-NT2 …`), để tra ngược được.
- Đổi hay thêm hàm `fn_*`, policy, view, ràng buộc: thêm test trong `tests/db/` và một dòng trong `scripts/thu-lam-hong.sh` cùng PR.
- Mỗi ô quyền trong `PQ.md` mà story chạm tới phải có một test vi phạm: đóng vai người không có quyền, chứng minh không đọc, không ghi được.
- CI chạy mọi lớp tự động ở mỗi PR (`.github/workflows/`). CI đỏ thì không merge.
- Test xanh chỉ chứng minh những gì đã viết ra. Luồng chính của mỗi story vẫn phải có người bấm thử trên điện thoại thật trước khi ghi "xong".

## 7. Thiết kế

Thiết kế là một file canvas HTML ở `docs/thiet-ke/canvas/`. Không có file mô tả màn bằng chữ: điều hình vẽ không nói được (vào từ đâu, bấm gì sang đâu, trạng thái rỗng và lỗi) ghi trong story.

- Mỗi mã màn có đúng một hình trên canvas. Xem một màn: `python3 docs/thiet-ke/trich-man.py <mã>`. Không mở cả file canvas.
- Màn chưa code: sửa thẳng hình đó.
- Màn đã code, chỉnh nhỏ (khoảng cách, màu, cỡ chữ): sửa code, không cần sửa canvas.
- Màn đã code, vẽ lại lớn: thay hình cũ bằng hình mới, giữ mã màn, kèm một story mới.
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
3. Tạo nhánh `US<n>-<tên-ngắn>`. Đổi Trạng thái thành "đang làm".
4. Viết test cho từng tiêu chí, chạy thấy đỏ.
5. Code cho tới khi test xanh. Database trước, giao diện sau.
6. Chạy đủ: `scripts/test-db.sh`, `scripts/thu-lam-hong.sh`, `npm run typecheck`, `npm test`, `npm run build`.
7. Mở PR theo mẫu ở phụ lục A. Vercel tạo bản xem thử cho PR, trỏ vào staging.
8. Tùng mở bản xem thử trên điện thoại, kiểm luồng chính. Tùng bảo merge thì Claude soát điều kiện ở mục 10 rồi merge; hoặc Tùng tự bấm merge.
9. Đức kiểm tay theo `tests/kich-ban/US<n>.md`. Lỗi thì mở story loại "lỗi".
10. Đổi Trạng thái thành "xong" ở story và ở `docs/stories/README.md`.

Gặp việc ngoài phạm vi story: không làm luôn. Ghi thành story mới (chưa làm) hoặc một dòng trong `Cau_hoi_mo.md`.

## 10. Git và pull request

- Code luôn trên nhánh và PR, kể cả sửa nhỏ. Một PR một story.
- Tài liệu sống không kèm code (story mới, câu hỏi, quyết định, kết quả kiểm tay) được đẩy thẳng `main`.
- Commit tiếng Việt, mở đầu bằng mã story: `US12: tìm phòng trả căn trống theo ngày`.
- Không đẩy ép. Không tắt hay sửa test để cho qua.

**Ai merge (QD-017).** Tùng tự bấm, hoặc bảo Claude merge ngay trong phiên ("merge PR #12", "merge đi" ngay sau báo cáo của một PR). Lời của Đức không đủ. Claude không tự merge khi không ai bảo, kể cả khi CI xanh.

Trước khi merge, Claude soát và chỉ merge khi đủ cả:
1. CI xanh trên commit mới nhất của PR, không xung đột với `main`.
2. Thay đổi dưới `tests/`: không test nào bị tắt hay nới; test bị sửa hoặc xóa đều có tên ở mục "Test bị đổi" của story.
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
- [ ] Đã xem thay đổi dưới `tests/`: không có test bị tắt; test bị sửa đều có tên trong story.
- [ ] Có migration: đã chạy trên staging, `docs/tu-sinh/Bang_va_cot.md` đã sinh lại.
- [ ] Đổi phân quyền: Tùng đã duyệt bằng lời nói rõ.
- [ ] Story và `docs/stories/README.md` đã đổi trạng thái.
