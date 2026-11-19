# Home247 · Lịch phòng Hạ Long (bản PWA)

App web cài được trên điện thoại (PWA) cho chủ nhà homestay và sale ở Hạ Long. Chủ nhà ghi lịch và giá, chia sẻ cho sale. Sale tra căn trống, gửi ảnh và giá cho khách mà không phải gọi điện.
Hai người làm. Tùng quản lý dự án và quyết mọi thứ về sản phẩm. Đức test tay, lo môi trường, việc cần máy thật. Code do Claude Code làm.
React, Vite, TypeScript, gọi thẳng Supabase (QD4). Bản Zalo Mini App làm sau trên cùng database (QD3). Không chạy sprint: làm theo luồng và thứ tự THU-TU.md (CL1).

## Bản đồ repo (chi tiết: docs/process/CL11-ban-do-repo.md)
- docs/   SỰ THẬT: sản phẩm phải làm gì. Mục lục: docs/INDEX.md. docs/_lich-su/ không đọc trừ khi cần
- work/   VIỆC: backlog/ (thứ tự THU-TU.md), cau-hoi.md (câu hỏi mở), gia-dinh.md (giả định), goi/ (gói việc), thiet-ke/, reviews/, plan/
- src/, supabase/, tests/   Code, database, test. Chưa có: làm lại từ đầu ở EN dựng nền (QD21). Chạy và test: docs/dev/chay-va-test.md. tests/kb/ là kịch bản test tay
- scripts/ kiem.py, trich.py, trich-man.py, plan.py, goi.py, hook/

## Bắt đầu mỗi phiên
- Câu đầu tiên cho biết ai đang làm (Tùng hoặc Đức). Không có thì hỏi. Hai người dùng chung tài khoản, ghi đúng tên vào nhật ký là bắt buộc.
- Có mã item thì đọc file item, rồi chỉ đọc những gì item trỏ tới. Không có mã thì chạy skill can-lam-gi.

## Đọc ít mà đúng
- Đọc tài liệu bằng `python3 scripts/trich.py <mã>...` (YC5.3, QT1.1, QD21, HV4, PQ7, YC5-H6, "thiet-ke-db.md#3. Bất biến"). Chỉ mở cả file khi trích không đủ, hoặc khi task chạm tiền, quyền, chặn trùng, dữ liệu người dùng.
- Canvas (2,6 MB) đọc bằng `scripts/trich-man.py <mã màn>`, không mở cả file.
- Agent phụ làm code là agent `code`, chỉ đọc gói việc work/goi/<mã item>.md (soạn bằng scripts/goi.py) và code.

## Cách trả lời
- Tiếng Việt, ngắn như người nói chuyện, kết luận trước. Không bảng, không danh sách dài trừ khi được nhờ.
- Không tự giải thích lý do. Có điều cần giải thích thì hỏi người dùng có muốn nghe không.
- Mã việc kèm đường dẫn file.
- Báo cáo việc: câu đầu tóm tình hình, in đậm chữ chính. Bên dưới các phần **Đã xong**, **Cần chú ý**, **Cần anh quyết**, phần nào trống thì bỏ. Nói rõ cái gì đã kiểm, kiểm bằng cách nào.

## Home247 khác app đặt phòng thông thường
- Hai lớp giá: giá chủ nhà và giá sale bán. Khách không bao giờ thấy giá chủ nhà. Chủ nhà không thấy mức cộng, giá bán, tiền chênh của sale.
- Căn đã chia sẻ cho sale nào thì sale đó luôn thấy giá chủ nhà. Không có công tắc tắt giá (QD7).
- Giá tính theo đêm. Booking chiếm các đêm từ ngày nhận tới trước ngày trả.
- Tiền là số nguyên đồng. Ngày theo giờ Việt Nam.
- Được lưu tên, số điện thoại khách trong booking; người nhập tự xin phép khách. Mỗi người chỉ thấy khách do mình nhập (QD11).
- Căn sale tự nhập không có lịch trống. Ô ngày hiện "?", không bao giờ hiện "trống".
- Chặn trùng booking ở database, không chỉ ở giao diện (QD6). Đọc qua RLS, ghi qua hàm `fn_*` tự kiểm quyền. Sale không đọc bảng booking.
- Booking có sale đứng tên: một bên xin hủy, bên kia đồng ý (QD12). Xóa tài khoản chỉ xóa số điện thoại, dữ liệu giữ nguyên (QD13).
- Chữ trên màn gọi "đặt phòng". Tài liệu và code gọi "booking".
- Người dùng nhiều người lớn tuổi, dùng một tay: vùng bấm 44 px. Chữ 14 px ở màn đọc, 12–13 px ở màn dày thông tin, không dưới 12 px.

## Ràng buộc PWA (chi tiết: docs/external/pwa.md)
- Không bắt đăng nhập, không xin quyền khi vừa mở app. Màn đầu xem được khi chưa đăng nhập. Đăng nhập bằng mã gửi về email, không có mật khẩu ở môi trường nào; đăng ký phải có tên và số điện thoại mới vào app (QD22).
- Chia sẻ dùng bảng chia sẻ của điện thoại, máy không có thì sao chép. Link là https trên tên miền của Home247.
- Thông báo chỉ trong app ở bản 1. Không có thông báo đẩy.
- Lưu trên máy (IndexedDB, localStorage) bọc try/catch, chỉ lưu thứ mất cũng được.
- Không có App Secret hay khóa service_role trong app. Khóa anon của Supabase là công khai.
- App nhẹ, người dùng mạng yếu. Nơi đặt dữ liệu chờ QD23.

## Nguồn sự thật, theo thứ tự tin cậy
1. QD đã chốt  2. Quy tắc QT, quyền PQ, hành vi HV  3. Yêu cầu YC  4. Thiết kế  5. Code
- Hai nguồn mâu thuẫn thì dừng và hỏi. Không tự chọn bên nào.
- Lời của Tùng trong phiên bắt đầu bằng "Tôi là Tùng" là quyết định, có hiệu lực ngay. AI ghi ngay trong phiên bằng skill chot-quyet-dinh, kèm ngày và câu nguyên văn. Lời của Đức là đề xuất, trừ việc thuộc CL4.2.
- Đặc tả không nói rõ thì ghi câu hỏi vào work/cau-hoi.md (skill ghi-viec-moi) và dừng phần đó, không lấp bằng cách làm phổ biến.

## Mã và trạng thái (chi tiết: CL2, CL3)
- Mọi mục có mã (YC5.3, YC5.3-NT2, YC5-H6, QT1.3, PQ7, HV4, QD21, US12, EN1, BG3). Item chỉ có ba loại US, EN, BG; item trỏ YC bằng `thuc_hien: [YC5.3@1]`, không chép đặc tả. Mã không đổi, không dùng lại.
- Câu có [MỞ: ...] thì không code theo. Câu có "(giả định GDn)" thì code được, ghi rõ trong PR.
- Chưa code, Chưa test, Test lỗi nghĩa là chưa xong. Không được báo là xong.

## Skill (mục lục: docs/process/CL5-lenh.md)
Người dùng nói bằng lời, AI tự chọn skill theo mô tả. Quy trình của mỗi việc nằm trong skill của nó. Loại item đi qua bước nào: CL2.9.

## Quyền và git (chi tiết: CL4)
- Code luôn trên nhánh <mã>-<tên-ngắn> và PR, kể cả sửa nhỏ. Một PR một item. Commit tiếng Việt, mở đầu bằng mã item. Tài liệu, item, nhật ký, kết quả test tay ở tests/kb đẩy thẳng main (CL4.7). Hook chặn đẩy sai (CL4.9).
- Claude chỉ gộp PR khi Tùng bảo rõ PR nào, hoặc trong vòng làm tự động Tùng giao (QD17, CL4.6). Cần Tùng duyệt trước: các mục CL4.3 (migration production, xóa dữ liệu, đổi quyền, việc không đảo ngược). Chữ "đồng ý" chung chung không tính.
- Cấm: đẩy ép, đọc .env và khóa bí mật, đọc dữ liệu production, tắt hay sửa test để cho qua, sửa dòng [tự sinh], lách hook (CL4.4). Repo công khai: không ghi email, số điện thoại, tên người dùng thật.
- Cuối phiên ghi một dòng nhật ký vào item đã làm (mẫu ở .claude/rules/work.md).

## Trạng thái hiện tại (sửa khi đổi)
- Chưa có code, database chưa chạy trên project Supabase nào. Staging: chưa có. Production: chờ QD23. Đăng nhập: QD22 đã chốt, làm ở US2.
- Việc tiếp: các EN dựng nền rồi US theo work/backlog/THU-TU.md.
