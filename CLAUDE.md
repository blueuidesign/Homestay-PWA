# CLAUDE.md · Home247 · Lịch phòng Hạ Long (bản PWA)

App web cài được trên điện thoại (PWA) cho chủ nhà homestay và sale ở Hạ Long. Chủ nhà ghi lịch và giá, chia sẻ cho sale. Sale tra căn trống và giá mà không phải gọi điện, rồi gửi phòng cho khách. Người dùng nhiều người lớn tuổi, dùng một tay. Bản PWA làm trước; bản Zalo Mini App làm sau trên cùng database (QD-003).

Hai người làm: **Tùng** quyết mọi thứ về sản phẩm; **Đức** kiểm tay và lo môi trường. Code do Claude làm.

Repo này tự đủ. Không cần và không được dựa vào repo cũ của bản Zalo hay tài liệu ngoài repo.

## Bắt đầu mỗi phiên

1. Câu đầu phiên phải cho biết ai đang làm (Tùng hoặc Đức). Không có thì hỏi. Lời Tùng là quyết định; lời Đức là đề xuất.
2. Chưa biết làm gì: mở `docs/stories/README.md`, lấy story chưa xong đầu tiên theo thứ tự.
3. Có mã story: đọc file story đó, rồi chỉ đọc thêm những gì nó trỏ tới bằng mã.
4. Lần đầu vào repo: đọc `docs/QUY_TRINH.md` (luật làm việc) và `docs/Thiet_ke_DB.md` mục 3 (bất biến).

## Bản đồ repo

| Chỗ | Là gì |
|---|---|
| `docs/stories/` | **Việc và đặc tả.** Mỗi story một file, chứa đủ để làm. `README.md` là thứ tự và trạng thái |
| `docs/luat-chung/` | Luật dùng ở nhiều story: `QT.md` tính toán, `PQ.md` quyền, `HV.md` hành vi mọi màn, `Nghiep_vu.md`, `PWA.md`, `Tu_dien.md`, `Du_lieu_mau.md` |
| `docs/Quyet_dinh.md` | Quyết định và **lý do**. Mâu thuẫn với chỗ khác thì mục mới nhất ở đây đúng |
| `docs/Cau_hoi_mo.md` | Câu hỏi chờ Tùng, giả định đang dùng |
| `docs/QUY_TRINH.md` | Luật làm việc. `docs/Nguyen_ly_lam_viec.md` là lý do của các luật |
| `docs/Thiet_ke_DB.md` | Ý định và bất biến của database. Cột, hàm, policy: `docs/tu-sinh/Bang_va_cot.md` (máy sinh) |
| `docs/Ghi_chu_code.md` | Cấu trúc app, cách nối Supabase, việc còn dở |
| `docs/thiet-ke/` | Canvas thiết kế. Xem một màn: `python3 docs/thiet-ke/trich-man.py <mã>`. Không mở cả file canvas |
| `supabase/` | `migrations/` (database), `seed/`, `staging/` (dữ liệu mẫu) |
| `src/` | App React. `tests/db` test database, `tests/e2e` Playwright, `tests/kich-ban` kiểm tay |
| `scripts/` | `test-db.sh`, `thu-lam-hong.sh`, `bang-cot.sh`, `kiem-tai-lieu.py` |
| `VIEC_TAY_CUA_TUNG.md` | Việc cần tài khoản của Tùng (GitHub, Vercel, Supabase) |

Mục lục tài liệu và cách tìm theo mã: `docs/README.md`.

## Luật không được phá

- **Mỗi thông tin một chỗ.** Hai chỗ nói khác nhau thì dừng phần đó và hỏi Tùng. Không tự chọn bên nào. Thứ tự tin: `Quyet_dinh.md` → `luat-chung/` → story → thiết kế → code.
- **Chỗ gắn `[MỞ: <mã>]` thì chưa được code.** Hỏi Tùng. Chỗ ghi "(giả định GD…)" thì code được, ghi rõ trong PR.
- **Đặc tả không nói thì hỏi**, ghi câu hỏi vào `Cau_hoi_mo.md`. Không lấp bằng cách làm phổ biến.
- **Mỗi tiêu chí (`…-NT<số>`) một test mang mã đó, viết trước code.** Quyền và tiền kiểm ở lớp database.
- **Không tắt, không xóa, không nới test để cho qua.** Chỉ sửa test khi story nêu tên test đó ở mục "Test bị đổi".
- **Story đã merge không sửa.** Đổi tính năng đã xong thì viết story mới (`docs/QUY_TRINH.md` mục 5).
- **Code trên nhánh `US<n>-<tên>` và PR. Người merge, Claude không tự merge.** Không đẩy ép. Tài liệu sống không kèm code được đẩy thẳng `main`.
- **Hỏi Tùng trước:** migration lên production, xóa dữ liệu, đổi phân quyền, việc không đảo ngược. Chữ "đồng ý" chung chung không tính.
- **Không đọc dữ liệu production. Không đọc `.env`. Không có bí mật trong repo, chat, log.** Repo công khai: không ghi email, số điện thoại, tên người dùng thật.
- **Chưa code, chưa test, test đỏ là chưa xong.** Không báo là xong.
- Khi Tùng chốt một điều trong phiên: ghi ngay vào `Quyet_dinh.md` hoặc mục "Đã trả lời" của `Cau_hoi_mo.md`, kèm ngày và câu nguyên văn.

## Home247 khác app đặt phòng thông thường

- Hai lớp giá: giá chủ nhà và giá sale bán. **Khách không bao giờ thấy giá chủ nhà.** Chủ nhà không thấy mức cộng, giá bán, tiền chênh của sale.
- Căn đã chia sẻ cho sale nào thì sale đó luôn thấy giá chủ nhà. Không có công tắc tắt giá (QD-007).
- Mỗi người chỉ thấy tên, số điện thoại khách do mình nhập (QD-011).
- Giá tính theo đêm. Một lần ở chiếm các đêm từ ngày nhận tới trước ngày trả. Tiền là số nguyên đồng. Ngày theo giờ Việt Nam.
- Chặn trùng đặt phòng ở database, không chỉ ở giao diện (QD-006).
- Căn sale tự nhập không có lịch trống: ô ngày hiện "?", không bao giờ hiện "trống".
- Đặt phòng có sale đứng tên: một bên xin hủy, bên kia đồng ý (QD-012).
- Xóa tài khoản chỉ xóa số điện thoại, dữ liệu giữ nguyên (QD-013).
- Chữ trên màn gọi "đặt phòng". Tài liệu và code gọi "booking".

## Database

App gọi thẳng Supabase (QD-004). Đọc qua RLS; ghi qua hàm `fn_*` tự kiểm quyền. Sale không đọc bảng `booking`; quyền của sale chỉ đi qua `my_shared_can_ids()`. Migration chỉ thêm. Đổi hàm, policy, view: thêm test trong `tests/db/` và một dòng trong `scripts/thu-lam-hong.sh` cùng PR, rồi chạy `scripts/bang-cot.sh`.

## Giao diện

Điện thoại trước, một tay. Vùng bấm tối thiểu 44 px. Chữ 14 px ở màn đọc, 12 đến 13 px ở màn dày thông tin, không dưới 12 px. Lỗi luôn nói: chuyện gì, vì sao, làm gì tiếp. Màn trống luôn có việc để làm tiếp. Không bắt đăng nhập hay xin quyền khi vừa mở app.

## Trạng thái hiện tại (sửa dòng này khi đổi)

- App chạy ở **chế độ thử** bằng dữ liệu mẫu trong máy. Chưa nối Supabase, chưa có đăng nhập (`docs/Ghi_chu_code.md`).
- Database: migration và test đã có, **chưa chạy trên project Supabase nào**. Staging: `<chưa có>`. Production: `<chưa có, chờ CH-002>`.
- Story đang làm: US38. Đang chặn: CH-001 (đăng nhập), CH-002 (nơi đặt dữ liệu).

## Lệnh

`npm run dev` · `npm run typecheck` · `npm test` · `npm run build` · `npm run e2e` · `scripts/test-db.sh` · `scripts/thu-lam-hong.sh` · `scripts/bang-cot.sh` · `python3 scripts/kiem-tai-lieu.py`

Test database cần Postgres: `PGHOST=localhost PGUSER=postgres PGPASSWORD=… scripts/test-db.sh`.

## Cách trả lời

Tiếng Việt, ngắn như nói chuyện, kết luận trước. Mã story kèm đường dẫn file. Báo cáo việc: câu đầu tóm tình hình, in đậm chữ chính; bên dưới **Đã xong**, **Cần chú ý**, **Cần anh quyết**, phần nào trống thì bỏ. Nói rõ cái gì đã kiểm, kiểm bằng cách nào, cái gì chưa kiểm.
