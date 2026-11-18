# Nhật ký quyết định · Home247 bản PWA

<!-- Tài liệu sống, chỉ thêm. Mỗi quyết định đổi hướng là một mục, mới nhất ở TRÊN CÙNG. Không sửa nội dung mục cũ: quyết định bị thay thì viết mục mới,
     và ở mục cũ chỉ sửa dòng Trạng thái thành "Bị thay bởi QD-zzz". Mã QD-xxx tăng dần, không dùng lại.
     Đây là chỗ duy nhất ghi LÝ DO. Mâu thuẫn với tài liệu khác thì mục mới nhất ở đây đúng; PR thực hiện quyết định phải sửa mọi chỗ ghi ở dòng "Hệ quả".
     Mã YC… trong các mục cũ là mã của bản Zalo; tra docs/tu-sinh/Doi_ma_YC.md (QD-018). -->

## Định dạng một mục

```markdown
## QD-xxx · DD/MM/YYYY · <Tên ngắn>
- Bối cảnh: <vấn đề gì, ai gặp, vì sao phải quyết>
- Các phương án: (A) … (B) …
- Chọn: <A/B>. Người chốt: <tên> ("<câu nguyên văn>", ngày). Lý do: <…>
- Hệ quả: <tài liệu, bảng, màn hình phải đổi>
- Thay cho: <QD-yyy | không>
- Trạng thái: Đang hiệu lực | Đề xuất, chờ Tùng chốt | Bị thay bởi QD-zzz
```

Trạng thái "Đề xuất, chờ Tùng chốt" nghĩa là Claude đã làm theo hướng đó để không chặn việc, nhưng Tùng chưa nói đồng ý. Tùng chốt thì sửa dòng Trạng thái và ghi câu nguyên văn.

---

## QD-020 · 18/11/2026 · Gộp story theo nhóm chức năng, đánh số lại mã
- Bối cảnh: sau QD-019 (story sống, mỗi nhóm chức năng một story), bộ story vẫn là các lát cắt của bản Zalo. Một màn nằm rải ở 3 đến 4 story (US5 dùng chung 7 đến 11 màn với mỗi story US15, US16, US17, US26), nên đổi một yêu cầu dễ sửa chỗ này sót chỗ kia.
- Các phương án: gộp thành khoảng 15 story theo nhóm chức năng, với hai cách xử lý mã tiêu chí: (a) giữ mã cũ trong story mới; (b) đánh số lại, ghi bảng đổi mã.
- Chọn: gộp, đánh số lại (b). Người chốt: Tùng ("gộp như bạn đề xuất. đánh số lại mã, sửa mã ở những nơi liên quan, đảm bảo đúng." và "đồng thời viết lại US cho chuẩn nhé", 18/11/2026). Claude đã nghiêng về (a) vì mã đã cấp không nên đổi; Tùng chọn (b) để mỗi story có mã gọn, đọc liền một dãy.
  - Story gộp giữ mã của story chính: US1 Căn (gộp US25, US11, US27), US2 Lịch chủ nhà (US9), US3 Đặt phòng (US10, US28, US35), US4 Giá (US7, US8), US5 Kết nối sale (US17, US26), US6 Lịch và tìm phòng của sale (US12, US13), US18 Thống kê (US19), US21 Cá nhân, thông báo và tài khoản (US30, US22), US23 Quản trị (US29, US34).
  - Mã story bị gộp không bao giờ dùng lại.
  - Tiêu chí và câu hỏi của story gộp được đánh số lại theo thứ tự đọc trong story mới. Đổi bằng máy ở mọi chỗ (story, test, kịch bản kiểm tay, chú thích code, câu hỏi mở) trong cùng commit. Bảng đổi: `docs/tu-sinh/Doi_ma_gop.md`.
  - Story to hơn vài ngày làm: code theo từng phần, mỗi PR một phần, PR ghi phần nào. Tiêu chí nào đã có test thì máy đếm.
  - Viết lại đặc tả thô (US41) làm cùng lúc với gộp.
- Hệ quả: `docs/stories/` (gộp file, `README.md`), `tests/kich-ban/`, `tests/`, `src/` (chú thích), `docs/Cau_hoi_mo.md`, `docs/luat-chung/`, `docs/QUY_TRINH.md` mục 4.2, 4.2b, `docs/stories/US41-viet-lai-dac-ta-tho.md` bước 7, `scripts/kiem-tai-lieu.py` (bảng đổi mã), `CLAUDE.md`.
- Thay cho: điểm "viết lại không đổi mã tiêu chí" ở `docs/QUY_TRINH.md` mục 4.2b và luật "một story làm được trong vài ngày" ở mục 4.2
- Trạng thái: Đang hiệu lực

## QD-019 · 18/11/2026 · Story sống suốt dự án, mỗi nhóm chức năng một story
- Bối cảnh: QD-015 cho story đóng băng sau khi merge, đổi tính năng thì viết story mới. Tùng thấy yêu cầu sẽ đổi khá thường xuyên sau khi kiểm tay và dùng thử; đóng băng thì một tính năng bị rải qua nhiều story, agent đọc story cũ không biết nó đã bị thay.
- Các phương án: (A) đóng băng hẳn, chuyển story xong vào thư mục lưu trữ, sự thật là test; (B) đánh dấu "bị thay" vào story cũ; (C) story sống, sửa thẳng, ghi rõ phần chưa code, chưa test.
- Chọn: C. Người chốt: Tùng ("cũng có thể sửa stories mà chưa code hoặc sinh test ngay. Như vậy trong US phải giữ được trạng thái là đã xong code và test hoàn toàn chưa, hay chờ code, hay chờ test. Trong US cũng cần có ghi note những phần nào mới được sửa lần này mà chưa được code hay viết test. vậy là đủ. Còn giữ US xuyên suốt quá trình làm việc cho nhóm chức năng đó", 18/11/2026). Lý do bỏ B: đánh dấu vào story cũ tạo loại tài liệu nửa sống nửa đóng băng.
  - Ba trạng thái: chờ code, chờ test, xong.
  - Story đã từng được code mà sửa thêm: dòng "Thay đổi chưa xong" ở đầu story, đuôi "chờ code" ở tiêu chí mới hay vừa đổi.
  - Tiêu chí đổi nghĩa thì đổi mã. Máy kiểm story và test khớp nhau.
- Hệ quả: `docs/QUY_TRINH.md` mục 3, 4.1, 4.2, 5 (viết lại), 7, 9, 10; `CLAUDE.md`; `docs/Nguyen_ly_lam_viec.md` nguyên lý 4; `docs/stories/README.md`; `scripts/kiem-tai-lieu.py`. Bộ story được rà lại để mỗi nhóm chức năng một story.
- Thay cho: điểm "story đóng băng sau khi merge; đổi tính năng đã xong thì viết story mới" của QD-015
- Trạng thái: Đang hiệu lực

## QD-018 · 18/11/2026 · Bỏ mã YC của bản Zalo khỏi repo
- Bối cảnh: lúc dựng repo, tiêu chí và câu hỏi giữ mã cũ của bản Zalo (`YC4.1-NT1`, `YC4-H13`) để test và kịch bản không phải đổi tên. Nhưng repo không còn file YC nào, nên mã đó trỏ tới thứ không tồn tại. Tùng hỏi: "tại sao trong US3 vẫn ghi các YC, trong repo mới làm gì còn YC nữa".
- Các phương án: (A) giữ mã YC làm tên, giải thích ở QUY_TRINH; (B) đổi hết sang mã của repo mới.
- Chọn: B. Người chốt: Tùng (câu hỏi trên, 18/11/2026). Tiêu chí thành `US<n>-NT<số>` theo story chứa nó; câu hỏi thành `CH-<số>`; chỗ nhắc một mục hành vi thành tên mục kèm mã story; chỗ nhắc cả nhóm thành tên nhóm. Đổi bằng máy trên `docs/`, `tests/`, `src/`, `supabase/`. Bảng đổi lưu ở `docs/tu-sinh/Doi_ma_YC.md` để tra lịch sử.
- Hệ quả: mọi story, kịch bản kiểm tay, test, chú thích code, `docs/luat-chung/`, `docs/Cau_hoi_mo.md`, `docs/QUY_TRINH.md` mục 4.2. Các mục quyết định cũ ở file này giữ nguyên chữ (chỉ thêm, không sửa); mã YC trong đó tra bảng đổi.
- Thay cho: điểm "các story chuyển từ bản Zalo giữ mã mục và mã tiêu chí cũ làm tên" ở dòng Hệ quả của QD-015
- Trạng thái: Đang hiệu lực

## QD-017 · 18/11/2026 · Claude được merge PR khi Tùng bảo
- Bối cảnh: luật cũ (QD-001, giữ lại ở QD-015) cấm Claude merge, kèm lớp chặn `gh pr merge` trong `.claude/settings.json`. Tùng thấy mỗi lần phải tự vào GitHub bấm là chậm, và lời bảo trong phiên đã đủ rõ.
- Các phương án: (A) giữ cấm, Tùng luôn tự bấm; (B) Claude merge khi Tùng bảo, có danh sách điều kiện Claude phải soát; (C) Claude tự merge mọi PR khi CI xanh.
- Chọn: B. Người chốt: Tùng ("sửa lại luật cho phép bạn merge nhé", 18/11/2026, ngay sau khi bảo "merge đi" với PR #1). Lý do chọn B chứ không C: Claude đã chọn cách đọc hẹp hơn, vì CI xanh chỉ chứng minh những gì đã có test; bước Tùng xem bản xem thử trên điện thoại và bảo merge vẫn là chỗ người đối chiếu. Tùng muốn C thì nói, sửa mục này.
- Hệ quả: `CLAUDE.md`, `docs/QUY_TRINH.md` mục 1, 9, 10, phụ lục B; bỏ dòng chặn `gh pr merge` trong `.claude/settings.json`; `VIEC_TAY_CUA_TUNG.md` bước 6. Lời của Đức không đủ để Claude merge.
- Thay cho: điểm "người merge chứ Claude không tự merge" của QD-001
- Trạng thái: Đang hiệu lực

## QD-016 · 18/11/2026 · Database bản PWA: các lựa chọn khi chuyển từ server Node sang Supabase
- Bối cảnh: server Node của bản Zalo có khoảng 100 việc đọc ghi. Chuyển sang Supabase (QD-004) phải chọn cách làm cho từng nhóm việc. Các lựa chọn dưới đây Claude làm lúc dựng repo, có test, nhưng Tùng chưa duyệt từng điểm.
- Chọn:
  1. Cài đặt riêng của sale (mức cộng mặc định, làm tròn 50 nghìn, mẫu tin, loại thông báo đã tắt) nằm ở bảng `cai_dat_rieng`, chỉ chính người đó đọc. Lý do: người đã kết nối đọc được hồ sơ của nhau, để chung trong `profiles` thì chủ nhà thấy mức cộng của sale (trái QD-011).
  2. Thông báo sinh bằng trigger ở database, app không tự ghi. Lý do: mọi đường ghi booking đều sinh thông báo, không sót khi thêm đường ghi mới.
  3. Sale đọc lịch và tìm phòng qua hàm `fn_sale_lich`, `fn_sale_tim`; các hàm chỉ trả căn, đêm kín hay trống, giá. Lý do: sale không được đọc bảng `booking`.
  4. Ảnh căn nằm ở Storage, bucket riêng tư `anh-can`, thư mục theo mã người tải.
  5. Yêu cầu đặt phòng tự hết hạn sau 14 ngày bằng việc định kỳ `pg_cron` 10 phút một lần.
  6. Quản trị viên đầu tiên (`admins.la_goc`) là người duy nhất thêm, gỡ người đồng quản trị.
  7. Căn tự nhập bắt buộc có tên và số điện thoại chủ căn.
  8. Năm file migration `20261118…` được sửa tại chỗ trong lúc dựng repo vì chưa chạy ở đâu. Từ lần chạy đầu trên staging, migration chỉ thêm.
  9. Dải ngày lễ không đặt sẵn; quản trị viên nhập. Lý do: lịch nghỉ mỗi năm do Chính phủ công bố, đặt sẵn là đoán.
  10. CI và máy dev dùng Postgres 16. Supabase có thể chạy bản khác; lần đầu chạy migration lên staging phải chạy lại toàn bộ test trên staging.
- Hệ quả: `supabase/migrations/`, `tests/db/`, `scripts/thu-lam-hong.sh`, `docs/Thiet_ke_DB.md`.
- Thay cho: không
- Trạng thái: Đề xuất, chờ Tùng chốt

## QD-015 · 18/11/2026 · Tổ chức tài liệu và quy trình: mọi thứ là story, mỗi điều một chỗ
- Bối cảnh: bản Zalo có hơn 300 file tài liệu; một luật được viết ở năm, bảy chỗ nên đổi ý là sót (bỏ công tắc giá chốt 04/11, hai tuần sau còn hơn 20 chỗ ghi cách cũ). Kho BaBa thì ngược lại, chỉ có code, không hợp với app có quyền và tiền. Bộ khởi tạo đầu tiên của bản PWA (QD-001) bị Tùng chê sơ sài: tóm lược đặc tả làm mất thông tin.
- Các phương án: (A) giữ đủ YC, mô tả màn, story như bản Zalo; (B) kiểu Kho BaBa, code là sự thật; (C) giữ đầy đủ thông tin nhưng mỗi điều một chỗ, đối chiếu bằng test.
- Chọn: C. Người chốt: Tùng, 18/11/2026. Các câu nguyên văn: "quan trọng nhất vẫn là: giữ cho tài liệu đầy đủ, nhưng chắt lọc nhất và không có quá nhiều mảnh khác nhau, giữ thông tin ở nhiều chỗ làm cho bị mâu thuẫn khi không update hết"; "theo tôi mọi thứ nên có item. giống hệt quy trình scrum. Tôi nghĩ cũng không cần bản mô tả design cũ nữa, chỉ cần html và mô tả đầy đủ trong User story là được. Cũng không cần YC nữa, làm tất cả trong user story"; "hãy build cả repo mới trên repo mang tên Homestay-PWA".
  - Không có file YC. Mọi thứ của một tính năng nằm trong story của nó.
  - Không có file mô tả màn bằng chữ. Thiết kế là canvas HTML; điều hình không nói được thì ghi trong story.
  - Mọi việc có story, một khuôn, bốn loại (tính năng, thiết kế, lỗi, kỹ thuật), ba trạng thái. Không sprint.
  - Story đóng băng sau khi merge. Đổi tính năng đã xong thì viết story mới có mục "Hiện tại", "Đổi thành", "Test bị đổi".
  - Luật dùng chung nằm một lần ở `docs/luat-chung/`. Lý do nằm ở file này. Danh sách bảng và cột do máy sinh.
  - Tài liệu hoặc sống (sửa cùng PR với code) hoặc đóng băng; không có loại ở giữa.
  - Lý do đầy đủ: `docs/Nguyen_ly_lam_viec.md`. Luật chi tiết: `docs/QUY_TRINH.md`.
- Hệ quả: toàn bộ `docs/`. Các story chuyển từ bản Zalo giữ mã mục và mã tiêu chí cũ (YC5.2, YC5.2-NT3) làm tên, để test và kịch bản kiểm tay không phải đổi.
- Thay cho: QD-001
- Trạng thái: Đang hiệu lực

## QD-014 · 18/11/2026 · Repo mới, tách khỏi repo Zalo Mini App
- Bối cảnh: bản PWA đổi cả quy trình (bỏ khung Home247 cũ, dùng bộ khởi tạo của Kho BaBa) lẫn công nghệ (Supabase thay server Node). Repo cũ có hơn 300 file quy trình và tài liệu viết cho Zalo.
- Các phương án: (A) thư mục mới trong repo cũ; (B) repo mới trên tài khoản GitHub cá nhân.
- Chọn: B. Người chốt: Tùng ("tôi sẽ mang sang phiên chat khác và dựng repo mới trên github và supabase", 18/11/2026). Lý do: khởi đầu sạch; Vercel gói Hobby không deploy được repo riêng tư của tổ chức.
- Hệ quả: repo mới là `blueuidesign/Homestay-PWA`. Mô tả sản phẩm ở trạng thái cuối nằm trong `docs/stories/` và `docs/luat-chung/`; code React của bản Zalo đã chuyển vào `src/`. Repo cũ giữ nguyên, không cần đọc.
- Thay cho: không
- Trạng thái: Đang hiệu lực

## QD-013 · 18/11/2026 · Xóa tài khoản giữ dữ liệu, chỉ xóa số điện thoại
- Bối cảnh: người dùng thôi dùng app thì số điện thoại của họ không được hiện cho ai nữa, nhưng người đã giao dịch với họ vẫn cần xem lại đặt phòng cũ.
- Các phương án: (A) xóa sạch mọi dữ liệu; (B) xóa số điện thoại, giữ tên để hiện kèm "Đã xoá tài khoản", giữ căn, lịch, giá, booking.
- Chọn: B. Người chốt: Tùng (04/11/2026). Chi tiết: story US22, mục YC9.8. Cách người dùng bấm xóa trên PWA: CH-007.
- Hệ quả: `profiles.da_xoa_luc`, `fn_xoa_tai_khoan`; `my_shared_can_ids()` bỏ căn của chủ đã xóa; sale không gửi được yêu cầu; booking cũ vẫn xem được; đặt lại số điện thoại thì dùng lại như trước. Test: `t_02_gia.sql`.
- Thay cho: không
- Trạng thái: Đang hiệu lực (chờ CH-007 cho phần giao diện)

## QD-012 · 18/11/2026 · Hủy đặt phòng đã chấp nhận cần bên kia đồng ý
- Bối cảnh: khách của sale đổi ý thì đặt phòng đã nhận cần có đường ra khỏi lịch, mà một bên không tự bỏ được phần của bên kia.
- Chọn: chủ nhà hoặc sale của booking xin hủy. Bên kia đồng ý thì "Đã hủy", vẫn hiện cho cả hai, các đêm trống lại và bán được. Bên kia từ chối thì giữ nguyên, ghi "Bị từ chối hủy", không xin lại được. Booking khách lẻ chủ tự ghi thì chủ xóa thẳng. Booking có sale thì chủ không xóa được. Người chốt: Tùng (03/11/2026). Chi tiết: story YC4.4, YC4.9.
- Hệ quả: `booking.trang_thai`, `fn_xin_huy`, `fn_tra_loi_huy`, `fn_chu_xoa_booking`. Test: `t_05_yeu_cau_huy_khach.sql`. Thời hạn xin hủy: CH-004.
- Thay cho: không
- Trạng thái: Đang hiệu lực

## QD-011 · 18/11/2026 · Mỗi người chỉ thấy khách và tiền thu khách do mình nhập
- Bối cảnh: chủ nhà và sale đều cần ghi khách của mình, nhưng khách và phần chênh của sale là việc làm ăn riêng của sale.
- Chọn: chủ nhà và sale được lưu tên, số điện thoại khách của mình; người nhập tự xin phép khách. Sale không bao giờ thấy khách của chủ; chủ không thấy khách của sale, không thấy sale thu khách bao nhiêu. Người chốt: Tùng (02/11/2026).
- Hệ quả: tách bảng `booking_rieng`, `yeu_cau_rieng`, mỗi dòng thuộc một người, RLS chỉ người đó đọc. Không để khách hay tiền thu khách trên bảng `booking`. Chính sách quyền riêng tư ghi rõ điều này. Test: `t_05_yeu_cau_huy_khach.sql`.
- Thay cho: không
- Trạng thái: Đang hiệu lực

## QD-010 · 18/11/2026 · Tiền phòng điền sẵn theo bảng giá, chia theo đêm, đêm thuộc tháng của chính nó
- Bối cảnh: thống kê theo tháng cần biết tiền của từng đêm, trong khi chủ nhà hay gõ một tổng tiền khác bảng giá.
- Chọn: tiền phòng điền sẵn bằng tổng giá chủ nhà các đêm; chủ sửa được; bắt buộc có. Giữ đúng tổng bảng giá thì mỗi đêm giữ giá của nó; khác thì chia đều, lẻ dồn đêm cuối. Doanh thu, đêm có khách, tiền chênh chia theo tháng của từng đêm. Đêm cuối tuần mặc định là đêm T6, T7, chủ đổi được. Người chốt: Tùng (02/11 và 03/11/2026). Chi tiết: story QT2, QT4.
- Hệ quả: `booking_dem`, `ghi_booking_dem`, `tien_phong_goi_y`, `gia_dem`, `profiles.dem_cuoi_tuan`. Giá ngày lễ, dịp đặc biệt (YC3.5) chưa làm. Số booking đếm theo tháng nào: CH-006. Test: `t_02_gia.sql`, `t_04_tien_phong.sql`.
- Thay cho: không
- Trạng thái: Đang hiệu lực

## QD-009 · 18/11/2026 · Căn tự nhập của sale
- Bối cảnh: nhiều chủ nhà chưa dùng app; sale vẫn cần lưu căn của họ để gửi khách và tính doanh số.
- Chọn: sale thêm căn của chủ chưa dùng app. Căn không có lịch trống: ô ngày hiện "?". Tên, số chủ căn chỉ sale đó thấy, không chia cho ai, không xuất file, sale xóa được. Sale ghi booking đã chốt cho căn đó; chỉ chặn trùng trong chính căn đó. Người chốt: Tùng (02/11/2026). Chi tiết: story YC6, QT1.3.
- Hệ quả: `can.loai = 'tu_nhap'`, `fn_sale_ghi_tu_nhap`. Căn tự nhập không bao giờ vào `my_shared_can_ids()`. Test: `t_01_phan_quyen.sql`, `t_03_chan_trung.sql`.
- Thay cho: không
- Trạng thái: Đang hiệu lực

## QD-008 · 18/11/2026 · Link mời của chủ nhà
- Bối cảnh: chủ nhà muốn gửi một link qua Zalo cho nhiều sale, không phải duyệt từng người, mà không lộ giá cho người lạ.
- Chọn: ai có link cũng mở được, kể cả chưa đăng nhập. Màn Thêm lịch hiện tên chủ, các căn (mã, phòng ngủ, giường, view), không có giá. Sale phải tự bấm "Thêm lịch". Đã thêm rồi thì báo. Link hết hạn sau 21 ngày, chủ thu hồi được; sale đã thêm trước đó vẫn giữ kết nối. Chủ thêm căn mới thì sale được chia sẻ "tất cả căn" tự thấy. Người chốt: Tùng (28/10 và 03/11/2026). Chi tiết: story YC1.3.
- Hệ quả: `link_moi`, `fn_tao_link_moi`, `fn_xem_link_moi` (vai anon gọi được), `fn_them_lich_tu_link`, `fn_thu_hoi_link_moi`. Thu hồi ở màn nào, người mở link hỏng thấy gì: CH-005. Test: `t_06_link_moi.sql`.
- Thay cho: không
- Trạng thái: Đang hiệu lực

## QD-007 · 18/11/2026 · Sale được thấy gì của chủ nhà
- Bối cảnh: chủ nhà chia sẻ lịch để sale bán được, nên sale cần thấy đủ để báo khách, nhưng không thấy việc riêng của chủ và của sale khác.
- Chọn: căn đã chia sẻ cho sale nào thì sale đó luôn thấy giá chủ nhà. Sale thấy mọi đêm đã kín của căn được chia sẻ là "đã đặt", không thấy ai đặt. Tình trạng cọc chỉ cho booking của chính sale, chỉ là đã cọc hay chưa, chỉ khi chủ bật quyền; không bao giờ thấy số tiền cọc. Sale thấy số điện thoại chủ đã kết nối. Chủ ngừng cho xem thì sale mất lịch và giá, vẫn xem booking cũ của mình. **Không có công tắc tắt giá**; quyền duy nhất chủ bật tắt cho từng sale là tình trạng cọc. Người chốt: Tùng (03/11 và 04/11/2026). Chi tiết: story YC1.14.
- Hệ quả: `my_shared_can_ids()`, `v_lich_sale`, `v_booking_cua_sale`, `ket_noi.quyen_tinh_trang_coc`, `fn_chu_ngung_sale`. Test: `t_02_gia.sql`, `t_05_yeu_cau_huy_khach.sql`.
- Thay cho: không
- Trạng thái: Đang hiệu lực

## QD-006 · 18/11/2026 · Chặn trùng booking bằng ràng buộc database
- Bối cảnh: hai người ghi cùng lúc mà chỉ kiểm ở giao diện hay ở hàm thì cả hai đều lọt. Người chốt hướng: Tùng (02/11/2026).
- Chọn: ràng buộc `exclude using gist (can_id with =, dem with &&) where (trang_thai <> 'da_huy')` trên `booking`. Yêu cầu đang chờ không chiếm đêm. Sale gửi yêu cầu vào đêm đã kín thì không tạo. Chủ chấp nhận một yêu cầu hay tự ghi booking thì yêu cầu đang chờ trùng đêm thành bị từ chối.
- Hệ quả: extension `btree_gist`. Test: `t_03_chan_trung.sql` có đủ ví dụ QT1.1 đến QT1.4.
- Thay cho: không
- Trạng thái: Đang hiệu lực

## QD-005 · 18/11/2026 · Vai tính theo quan hệ người với căn, không theo tài khoản
- Bối cảnh: một người có thể vừa có căn vừa bán căn người khác (đại lý). Bộ khởi tạo gốc dùng "tổ chức → đơn vị → nhân viên", không hợp với mạng lưới nhiều chủ nhà và nhiều sale. Người chốt: Tùng (03/11/2026).
- Chọn: không có bảng vai. Một người là chủ của căn mình giữ, là sale của căn người khác chia sẻ cho mình. Sale có căn riêng thì có mọi quyền của chủ với căn đó. Chủ nhà không bán căn của chủ khác. `profiles.vai_chon` chỉ để chọn màn mở đầu.
- Hệ quả: bỏ `orgs`, `units`, `memberships` của bộ gốc; thay bằng `can.nguoi_giu`, `ket_noi`, `ket_noi_can` và các hàm `my_own_can_ids`, `my_shared_can_ids`, `my_visible_can_ids`. Đội nhóm sale (YC8) chưa làm.
- Thay cho: không
- Trạng thái: Đang hiệu lực

## QD-004 · 18/11/2026 · Supabase đầy đủ, không giữ server Node
- Bối cảnh: bản Zalo có server Node khoảng 26.700 dòng. Bản PWA muốn ít hạ tầng, test tự động dễ.
- Các phương án: (A) giữ server Node, Supabase chỉ làm database và đăng nhập; (B) app gọi thẳng Supabase, quyền bằng RLS, ghi qua hàm `fn_*`, đọc dữ liệu nhạy cảm qua view.
- Chọn: B. Người chốt: chưa. Claude chọn để dựng khung khi Tùng không trả lời câu hỏi này (18/11/2026). Rủi ro chính của B: lỡ cho app đọc thẳng bảng có cột nhạy cảm. Cách phòng: bất biến trong CLAUDE.md, test RLS cho từng vai, `scripts/thu-lam-hong.sh`.
- Hệ quả: `supabase/migrations/`, `tests/db/`. Việc cần giữ bí mật (gửi SMS, đổi token Zalo sau này) đặt ở Edge Function.
- Thay cho: không
- Trạng thái: Đề xuất, chờ Tùng chốt

## QD-003 · 18/11/2026 · Làm bản PWA trước, Zalo Mini App sau
- Bối cảnh: bản Zalo phải chờ Zalo duyệt, và các luồng xin quyền, số điện thoại, chia sẻ chỉ thử được bằng tay trên điện thoại.
- Các phương án: (A) làm tiếp bản Zalo; (B) PWA trên Vercel và Supabase trước, có nhiều người dùng rồi mới làm Zalo.
- Chọn: B. Người chốt: Tùng ("tôi muốn phát triển bản PWA này trước và deploy trước để tăng tốc quá trình phát hành. Sau này muốn nâng cấp khi đã có nhiều người dùng thì tôi dùng zalo sau", 18/11/2026).
- Hệ quả: CLAUDE.md, `docs/QUY_TRINH.md`. Gửi căn cho khách đổi từ cửa sổ chia sẻ của Zalo sang chia sẻ của điện thoại (CH-003). Đăng nhập không còn Zalo (CH-001). Nơi lưu dữ liệu phải tính cho lúc lên Zalo (CH-002).
- Thay cho: hướng làm Zalo Mini App trước
- Trạng thái: Đang hiệu lực

## QD-002 · 18/11/2026 · Booking sửa được qua hàm và ghi nhật ký, không theo sổ cái chỉ thêm
- Bối cảnh: bộ khởi tạo gốc bắt mọi bảng có tiền phải "chỉ thêm, sai thì ghi bản đảo". Booking của Home247 lại có trạng thái và sửa được (YC4.3, YC4.9, QT1.2).
- Các phương án: (A) mỗi lần sửa booking ghi một bản đảo và một bản mới; (B) sửa thẳng dòng booking qua hàm `fn_*`, mỗi lần sửa ghi `audit_log` bản cũ và bản mới.
- Chọn: B. Người chốt: chưa. Lý do: ràng buộc chặn trùng chạy trên dòng hiện tại; với A, bản đảo và bản mới phải loại nhau khỏi phép chặn trùng, dễ sai.
- Hệ quả: `fn_chu_sua_booking` ghi `audit_log`. Tiền theo đêm ở `booking_dem` tính lại mỗi lần sửa. Thống kê đọc `booking_dem` của booking chưa hủy.
- Thay cho: luật "sổ cái chỉ thêm" của bộ khởi tạo, chỉ riêng cho booking
- Trạng thái: Đề xuất, chờ Tùng chốt

## QD-001 · 18/11/2026 · Dùng quy trình của Kho BaBa, thêm phần riêng của Home247
- Bối cảnh: khung quy trình của bản Zalo quá nặng so với sức hai người. Tùng muốn làm nhanh, test liên tục, ít tài liệu và review lúc đầu.
- Chọn: bộ khởi tạo và `QUY_TRINH.md` của Kho BaBa, cộng mục 15: E2E bằng Playwright là bắt buộc từ ngày đầu; staging từ ngày đầu; người merge, Claude không tự merge; Claude không đọc dữ liệu production; mỗi luật quyền có một phép thử làm hỏng trong `scripts/thu-lam-hong.sh`. Người chốt: Tùng chọn dùng quy trình này (18/11/2026); các điểm của mục 15 là Claude đề xuất, chờ Tùng chốt.
- Hệ quả: toàn bộ repo.
- Thay cho: quy trình cũ của bản Zalo
- Trạng thái: Bị thay bởi QD-015. Các điểm còn giữ: E2E Playwright và staging từ ngày đầu, Claude không đọc dữ liệu production, mỗi luật quyền có một phép thử làm hỏng (nay ở `docs/QUY_TRINH.md`)
