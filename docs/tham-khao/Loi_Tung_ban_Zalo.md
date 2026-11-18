# Lời Tùng ở bản Zalo, cần áp khi viết lại story

<!-- Tài liệu đóng băng, tạm thời. Chép máy ngày 18/11/2026 từ nhật ký các việc của repo bản Zalo: mọi câu Tùng quyết, nói, trả lời có trích nguyên văn. Nhiều quyết định trong này chưa từng được đưa vào đặc tả, nên story đặc tả thô có thể còn ghi cách cũ.
     Dùng khi viết lại story (US41): đọc mục của story đó, áp quyết định còn hiệu lực vào story, quyết định lớn ghi thêm vào docs/Quyet_dinh.md. Mâu thuẫn với Quyet_dinh.md thì Quyet_dinh.md đúng; mâu thuẫn giữa hai câu ở đây thì câu có ngày sau đúng; không rõ thì hỏi Tùng.
     Khi US41 xong, xóa file này. Mã QD có đuôi "(cũ)" là mã quyết định của bản Zalo; bảng đổi ở docs/Ghi_chu_code.md mục 5. -->

## Quyết định ngày 04/11/2026 chưa vào đặc tả

Tùng chốt 13 điểm ngày 04/11/2026 ở bản Zalo; việc đưa vào đặc tả chưa bao giờ làm. Áp vào story tương ứng:

| Điểm | Quyết định | Story |
|---|---|---|
| 1 | Chủ nhà sửa giá chủ nhà của đặt phòng đã xác nhận cho sale: giá bán của sale giữ nguyên. Màn S3-10 ghi "Giá bán tính lại theo mức cộng" là sai | US10 |
| 2 | Lưu sửa hoặc xóa đặt phòng xong thì quay về màn đã mở chức năng đó | US10 |
| 3 | Chọn tỉnh lúc vào app, danh sách tòa lọc theo tỉnh, gợi ý theo chữ cái | US33 |
| 4 | Gõ tên tòa trùng: gợi ý tòa đã có, người dùng vẫn thêm mới được; quản trị gộp tòa trùng sau | US11, US29 |
| 5 | Luôn có giá cuối tuần: màn chọn đêm cuối tuần (P6) phải chọn ít nhất một đêm | US11 |
| 6 | Sao chép giá, tháng nguồn chưa có giá mà đích đã có: giữ giá đích, báo bằng popup có nút "Tôi đã hiểu" (màn CN6-07) | US7 |
| 7 | Kết quả tìm phòng tách nhóm căn tự nhập riêng khỏi "CỦA TÔI" ("Phương án tách") | US12 |
| 8 | Bỏ công tắc tắt giá (đã áp: QD-007) | (xong) |
| 9 | Nút ở màn chi tiết căn của sale (S3) là "Gửi yêu cầu đặt phòng" | US13 |
| 10 | Dữ liệu mẫu: 1509 có 6 ảnh (kịch bản ghi "1/6"); tháng 9 của Chị Hoa cần đặt phòng để ra 9.600.000đ (chưa chốt cách thêm) | luat-chung/Du_lieu_mau.md, US9, US13 |
| 11 | Sale chạm căn của mình hay căn tự nhập ở kết quả tìm phòng (S2) thì mở chi tiết căn của sale (S6-02) | US12, US16 |
| 12 | Sao chép giá ngày lễ, dịp: đích có mà nguồn không thì giữ dịp của đích, báo trong cùng popup (Tùng: "PA B nhé") | US7 |
| 13 | Sao chép giá: dịp nguồn chồng ngày lên dịp khác của đích thì giữ dịp đích, bỏ dịp nguồn ở căn đó, báo trong popup (Tùng: "Phương án B") | US7 |

## US5

- (việc cũ) 6. **Booking chủ tự ghi mà chọn sale coi như booking của sale.** Tùng: "Hùng có thấy booking vì chủ đã chia sẻ lịch cho HÙng rồi. Cọi như booking của HÙng." Trả lời nhóm Booking câu hỏi 12. Sửa US5-NT13, mục "Xóa booking" (US10) (chủ nhà không xóa được booking này, chỉ sửa), mục "Thống kê của sale" (US19), mục "Trạng thái booking của sale" (US19) (booking vào thống kê và danh sách của sale). Tùng chọn theo đề xuất ("Theo đề xuất"):
- (việc cũ) 2026-11-03 · Tùng (phiên làm tự động) · để sau, không chặn US nào; đã bỏ khỏi truoc của US5. Tùng nói ngày 2026-11-03: "En 19 để sau, không tác động các US. không ảnh hưởng các US. Ghi lại điều này. Gộp và tiếp tục làm các US"
- (việc cũ) Tùng quyết ngày 03/11/2026 (mục "Xin tên và số điện thoại khi bắt đầu kết nối" (US5) mục Sửa r4), nguyên văn: "Lấy tên từ hộp thoại zalo, cùng với số điện thoại nhé." Tài liệu Zalo không nói hai quyền này hiện ra sao khi xin liền nhau.
- (việc cũ) Ngày 03/11/2026 Tùng quyết mục "Xin tên và số điện thoại khi bắt đầu kết nối" (US5) mục "Sửa r3, lần hai": mọi việc bắt đầu chia sẻ, chấp thuận hoặc kết nối đều có bước xin tên và số, chỉ khi hồ sơ chưa có số. Nút "Bắt đầu với Zalo" ở A1 đổi thành "Bắt đầu ngay". Tùng nói nguyên văn: "mục "Xin tên và số điện thoại khi bắt đầu kết nối" (US5): đúng, thay tên của nút thành "Bắt đầu ngay". tất cả các màn hình mà bắt đầu chia sẻ gì đó, hoặc chấp thuận gì đó hoặc kết nối gì đó đều có chức năng xin tên và số điện thoại nhé. Bạn tự kiểm tra và update lại cho tôi, nếu design thiếu thì hãy tạo TK"
- (việc cũ) Cùng ngày Tùng quyết cách xin tên (mục "Xin tên và số điện thoại khi bắt đầu kết nối" (US5) mục Sửa r4), nguyên văn: "Lấy tên từ hộp thoại zalo, cùng với số điện thoại nhé."
- (việc cũ) | A6-P2, A8-P2, CN10-P2 | sửa | Hộp thoại minh họa xin cả tên và số trong một lần: hai dòng "Tên và ảnh đại diện" và "Số điện thoại" (Tùng quyết, mục "Xin tên và số điện thoại khi bắt đầu kết nối" (US5)). Ghi chú trên màn: Zalo hiện một hộp thoại hay hai, thứ tự nào, chờ | mục "Hộp thoại cấp quyền của Zalo" (US5) bước 1, NT1; mục "Xin tên và số điện thoại khi bắt đầu kết nối" (US5)
- (việc cũ) Tùng quyết ngày 03/11/2026 trong phiên Claude Code, nguyên văn: "Những điểm sau cần tôi quyết thì tôi quyết hết nhé, làm theo đề xuất của bạn.... Bốn chỗ Design sai ở trên: em đề xuất sửa theo YC và tạo TK cho Design. => đồng ý." YC đã sửa trên nhánh mục "Xin tên và số điện thoại khi bắt đầu kết nối" (US5)-xin-so-o-a6-p2; canvas làm theo YC.
- (US5) 2026-11-03 · Tùng (phiên làm tự động) · Bỏ khỏi truoc. Tùng nói ngày 2026-11-03: "En 19 để sau, không tác động các US. không ảnh hưởng các US. Ghi lại điều này. Gộp và tiếp tục làm các US"

## US6

- (US6) Kế hoạch nút "Xoay ngang" S1-05 (thay cho dừng chờ duyệt kế hoạch; nhóm Tìm phòng và gửi khách r5 Tùng chốt xoay giả có nút, không còn [MỞ: ]):
- (US6) 2026-11-03 · Tùng (phiên làm tự động, agent sonnet) · Làm ,  và phần frontend  trên server giả: màn A1-link, A1-link-01, A10, A10-01, A5, S1, A3 sang lịch sale; server giả có link, thêm lịch, lịch 7 ngày; 37 test mới · Bất ngờ: canvas A1-link còn chữ "Đăng nhập" và nút "Bắt đầu với Zalo", làm theo mục "Mở app từ link mời của chủ nhà" (US6) r15; mục "Lịch phòng 7 ngày" (US16) r19 đã bỏ [MỞ: ] (Tùng chọn xoay giả 02/11) nhưng lệnh vòng này bảo bỏ nút Xoay ngang, nên chưa làm · khoảng 2 giờ

## US7

- (US7) [x] US7- Code · Claude Code (opus): API (mục "Sao chép giá sang căn khác" (US7)): kiểm quyền và dữ liệu, một giao dịch cho mọi căn đích, chống bấm hai lần. Phần "thay giá có sẵn" làm theo từng phần đã chọn (tháng, ngày lễ, dịp đặc biệt); các ca còn mở (phạm vi năm, tháng nguồn chưa đặt, dải chồng ngày) chờ Tùng trả lời, không code phần đó
- (US7) 2026-11-03 · Tùng (phiên làm tự động) · Bỏ khỏi truoc. Tùng nói ngày 2026-11-03: "En 19 để sau, không tác động các US. không ảnh hưởng các US. Ghi lại điều này. Gộp và tiếp tục làm các US"
- (US7) 2026-11-04 · Tùng (phiên làm tự động frontend) · Tùng quyết trong phiên (điểm 6, KB14). "Cái đích đã có giá mà nguồn chưa có thì giữ nguyên giá của đích. Thông báo cho người dùng là được (popup và nút "Tôi đã hiểu"". Sửa frontend: vòng frontend làm; server:; tài liệu:
- (US7) 2026-11-04 · Tùng (phiên làm tự động frontend, agent sonnet) · quyết định 6: sao chép giá giữ giá đích ở tháng nguồn chưa có giá, không báo lỗi, popup liệt kê tháng giữ giá cũ và nút "Tôi đã hiểu"; server giả trả thêm `thang_giu_gia_cu` ( làm server khớp); 1 test thay, 1 test sửa, 2 test mới, PR #125; không đánh [x] · bất ngờ: các ca dải ngày (dịp, ngày lễ) vẫn báo "chưa có cách làm", chờ Tùng quyết
- (US7) 2026-11-04 · Tùng (phiên làm tự động frontend) · Tùng quyết điểm 12, sao chép giá ngày lễ, dịp khi căn đích có mà nguồn không: "PA B nhé" (giữ dịp của đích như quyết định 6, chép phần còn lại, báo trong popup "Tôi đã hiểu"). Frontend: vòng frontend làm; server:; tài liệu:
- (US7) 2026-11-04 · Tùng (phiên làm tự động frontend, agent sonnet) · quyết định 12 ("PA B nhé"): sao chép giá ngày lễ, dịp đặc biệt giữ dịp của đích khi nguồn không có, chép phần còn lại, không báo lỗi; server giả trả thêm `dip_giu_cu` ( làm server khớp), popup "Tôi đã hiểu" liệt kê cả tháng và dịp giữ lại; 3 test mới (2 ở services/us7.test.ts, 1 ở pages/us7-man.test.tsx), 3 test sửa nhẹ cho khớp trường mới; không đánh [x] · bất ngờ: không có test cũ nào khẳng định riêng ca dịp đích có mà nguồn không báo lỗi, nên không phải đổi nội dung test nào; ca dải chồng ngày giữa dịp nguồn và dịp đích vẫn báo lỗi, chờ Tùng quyết
- (US7) 2026-11-04 · Tùng (phiên làm tự động frontend) · Gộp PR #127 (quyết định 12) theo cách 3 sau khi kiểm: không xung đột, chỉ đổi src/miniapp và item, npm test 412/412, build qua. Tùng quyết điểm 13, dịp nguồn chồng ngày lên dịp khác của đích: "Phương án B" (giữ dịp của đích, bỏ dịp nguồn ở căn đó, liệt kê trong popup "Tôi đã hiểu"). Frontend: vòng frontend làm; server:; tài liệu:

## US8

- (việc cũ) 2026-11-03 · Tùng (phiên làm tự động) · để sau, không chặn US8; đã bỏ khỏi truoc của US8. Tùng nói ngày 2026-11-03: "Bỏ En16 ra khỏi yêu cầu hiện tại, để sau làm nhé.: không chặn US, để sau nhé, trước khi gửi cho zalo duyệt thì cần."
- (US8) 2026-11-03 · Tùng (phiên làm tự động) · Bỏ khỏi truoc. Tùng nói ngày 2026-11-03: "Bỏ En16 ra khỏi yêu cầu hiện tại, để sau làm nhé.: không chặn US, để sau nhé, trước khi gửi cho zalo duyệt thì cần."

## US9

- (US9) 2026-11-03 · Tùng (phiên làm tự động) · Bỏ khỏi truoc. Tùng nói ngày 2026-11-03: "En 19 để sau, không tác động các US. không ảnh hưởng các US. Ghi lại điều này. Gộp và tiếp tục làm các US"
- (US9) 2026-11-04 · Tùng (phiên làm tự động frontend) · Tùng quyết về hai điểm của PR #118. Tháng 9: "chưa cần thêm dữ liệu mẫu, cái đó xem sau", giữ server giả cộng riêng 9.600.000đ. Chip lọc: "bạn tự quyết nhé, đúng logic là ok", giữ chip "N phòng ngủ" sinh theo căn thật (khi có từ 2 giá trị) và chip tòa theo tên thật

## US10

- (US10) [MỞ: S3-10 thẻ vàng ghi "Giá bán tính lại theo mức cộng", trái mục "Sửa booking" (US10) bước 5 và NT5 (giá bán giữ như đã báo khách)]. Làm theo YC, chờ Tùng chọn.
- (US10) 2026-11-03 · Tùng (phiên làm tự động) · Bỏ khỏi truoc. Tùng nói ngày 2026-11-03: "En 19 để sau, không tác động các US. không ảnh hưởng các US. Ghi lại điều này. Gộp và tiếp tục làm các US"
- (US10) 2026-11-04 · Tùng (phiên làm tự động frontend) · Gộp PR #120 (frontend  đến  trên server giả) theo cách 3 sau khi kiểm: không xung đột, chỉ đổi src/miniapp và item, npm test 305/305, build qua. Task để mở tới khi nối API thật. Cần Tùng quyết: canvas S3-10 ghi "Giá bán tính lại theo mức cộng" trái mục "Sửa booking" (US10) bước 5 (đã làm theo YC, giá bán giữ nguyên); màn sau khi lưu sửa, xóa còn [MỞ] (tạm về tab Lịch)
- (US10) 2026-11-04 · Tùng (phiên làm tự động frontend) · Tùng quyết trong phiên (điểm 1, 2). Điểm 1, giá bán khi chủ sửa giá chủ nhà: "Nếu chủ nhà đổi thì phải có thông báo từ hệ thống cho Sale nếu sale đã báo giá cho khách. Biết được viết sale có thông báo cho khách nhờ việc chia sẻ thông tin phòng (zalo có gửi kết quả về cho app là Đã chia sẻ). Đấy là trường hợp chưa bán phòng, còn đã bán rồi mà đã có xác nhận của chủ nhà rồi thì phải giữ nguyên giá bán. Nếu sale tự bán thì đấy là việc của sale, vì chưa có xác nhận của chủ nhà. Tuy nhiên ở trong màn hình hiện giá phải có note cho thấy giá mới đổi, bấm vào hiện ra popup chi tiết giá đổi như nào trong thời gian qua. Note này chỉ cần hiển thị giá mới đổi trong vòng 2 tuần qua. Còn nếu bán cho khách mới, thông báo cho khách mới thì dĩ nhiên phải cộng lên bằng mức chênh rồi." Nghĩa cho US10: S3-10 giữ giá bán theo mục "Sửa booking" (US10) bước 5 (đúng như PR #120), canvas S3-10 sai; phần thông báo và ghi chú giá mới đổi tách sang US32. Điểm 2: "Quay về màn lúc mở chức năng lưu sửa hoặc chức năng xoá đặt phòng. Tức là mở ra từ màn nào thì quay về màn đó." Sửa frontend: vòng frontend làm; tài liệu:

## US11

- (US11) 2026-11-03 · Tùng (phiên làm tự động) · Bỏ khỏi truoc. Tùng nói ngày 2026-11-03: "En 19 để sau, không tác động các US. không ảnh hưởng các US. Ghi lại điều này. Gộp và tiếp tục làm các US"
- (US11) 2026-11-04 · Tùng (phiên làm tự động frontend) · Tùng quyết trong phiên (điểm 3 đến 5). Điểm 3: "Cần có chức năng chọn tỉnh lúc onboarding. Từ đó lúc chọn toà nhà thì lọc theo các toà nhà của tỉnh đó (tức là dữ liệu toà nhà do admin setup sẵn). Còn nếu không có toà nhà đúng của chủ thì chủ có thể viết tên toà nhà vào. Danh sách gợi ý thì hiện theo alphabeta." (tách sang US33). Điểm 4: "Gõ một toà đã có thì gợi ý toà đã có sẵn để chọn, người dùng vẫn tự ý thêm mới được. Admin sẽ thỉnh thoảng cho chạy task duyệt lại cơ sở dữ liệu và thống nhất lại dữ liệu của người dùng nếu xác định cùng một toà nhà được viết theo 2 cách khác nhau." (bỏ cách server giả trả tòa đã có khi trùng tên; server:). Điểm 5: "Không bao giờ có chuyện không có giá cuối tuần. Người dùng nếu muốn setup giá chung thì cứ gõ lại giá giống ngày thường, nhưng nhất định có giá cuối tuần." (P6 giữ nút Lưu khóa khi không chọn đêm nào, như PR #121). Tài liệu:

## US12

- (US12) 2026-11-03 · Tùng (phiên làm tự động) · Bỏ khỏi truoc. Tùng nói ngày 2026-11-03: "En 19 để sau, không tác động các US. không ảnh hưởng các US. Ghi lại điều này. Gộp và tiếp tục làm các US"
- (US12) 2026-11-04 · Tùng (phiên làm tự động frontend) · Tùng quyết trong phiên. Điểm 7, căn tự nhập trong kết quả tìm: "Phương án tách" (nhóm riêng "TỰ NHẬP · chưa biết lịch", không chung "CỦA TÔI"). Điểm 8, chủ tắt giá: "Không có chuyện tắt giá, đã chia sẻ cho sale nào thì nhất định phải hiện giá cho sale đó." (ghi QD-007, sửa kéo theo). Frontend: vòng frontend làm

## US13

- (việc cũ) 2026-11-03 · Tùng (phiên Claude Code) · Tạo từ (F2, F3, F4, F5, F6, F11, F18). Tùng: "Những điểm sau cần tôi quyết thì tôi quyết hết nhé, làm theo đề xuất của bạn.... Bốn chỗ Design sai ở trên: em đề xuất sửa theo YC và tạo TK cho Design. => đồng ý." · Bất ngờ: F3 đề xuất để Tùng chọn S3 hay S6-04; chọn S3 vì mục "Chi tiết căn và giá bán" (US13) là chi tiết căn của sale, S6-04 là chi tiết chủ nhà
- (US13) 2026-11-04 · Tùng (phiên làm tự động frontend) · Tùng quyết trong phiên. Điểm 9, chữ nút S3: "Gửi yêu cầu đặt phòng" (đúng mục "Chi tiết căn và giá bán" (US13) r14, canvas sai, sửa ở). Điểm 10, 1509 có 12 ảnh mà KB1 ghi 1/6: "Thống nhất lại dữ liệu, lúc code đúng là OK.". Điểm 11, chạm căn của tôi, căn tự nhập ở S2: theo đề xuất, mở S6-02 của US16 khi US16 xong, giờ giữ toast. Điểm 8 (tắt giá) xem QD-007

## US15

- (việc cũ) | S3 | sửa | Nút "Đặt phòng" của sale thành "Gửi yêu cầu đặt phòng". Nút gửi ở S3-02 đã là "Gửi yêu cầu đặt phòng", giữ. Tiêu đề màn S3-02 "Đặt phòng": Design đề xuất chữ không trùng nút của chủ nhà, ghi vào bản kê để Tùng chọn | mục "Sale gửi yêu cầu đặt phòng" (US15) bước 1; mục "Chi tiết căn và giá bán" (US13) bước 7, NT3; Tu_dien |
- (US15) 2026-11-04 · Tùng (phiên làm tự động frontend, agent sonnet) · , , , phần frontend : màn sale S3-02 đến S3-09, màn chủ nhà CN1-03, CN9, CN9-02, CN9-03 trên server giả; 30 test mới; PR #132 · bất ngờ: `chu_nha` của yêu cầu không có ID Zalo nên nút nhắn Zalo chưa chắc mở được chat, `can` không có số phòng ngủ cho thẻ "2PN", S3 mở không có ngày thì chưa rõ gửi ngày nào (5 chỗ cần Tùng quyết ở PR #132)
- (US15) 2026-11-04 · Tùng (phiên làm tự động frontend) · Gộp PR #132 (frontend  đến  trên server giả) theo cách 3 sau khi gộp main vào nhánh (xung đột import ở services/api.ts với, giữ cả hai) và kiểm: chỉ đổi src/miniapp và item, npm test 461/461, build qua. Task để mở tới khi nối API thật. Cần Tùng quyết: thiếu zalo_id chủ nhà cho nút "Nhắn chủ nhà qua Zalo"; thẻ căn thiếu số phòng ngủ ở yêu cầu; S3 mở từ S1 không có ngày; từ chối bắt buộc chọn lý do; tiêu đề S3-02 (KB1 "Đặt phòng" khác quyết định 9 "Gửi yêu cầu đặt phòng")

## US16

- (việc cũ) Không phải lỗi. Dòng "Cập nhật … trước" cố ý chưa làm ở cả S6 và S6-04 vì cách tính mốc theo chủ nhà còn [MỞ: mục "Danh sách căn và nguồn phòng" (US16) bước 2] (ghi ở `src/miniapp/services/that/ket-noi.ts` và. Không code theo câu [MỞ]. Làm lại khi Tùng chốt mốc này.
- (việc cũ) 2026-11-03 · Tùng (phiên Claude Code) · Tùng quyết theo đề xuất kiểm. Tùng: "Những điểm sau cần tôi quyết thì tôi quyết hết nhé, làm theo đề xuất của bạn." Câu 1: nút Xoay ngang ở hàng dưới cùng "Theo tên", sửa mục "Lịch phòng 7 ngày" (US16) bước 7 theo hình (dòng 17 thành Khớp). Câu 2: thêm Y5 vào DLM.6. Dòng 19: Giữ. Dòng 3, 4, 6, 7, 15, 16 và dòng Thiếu: Sửa lại. Thêm dòng CN7 gốc vào Màn phải làm. về dang-lam để Design làm lại · Bất ngờ: không
- (US16) 2026-11-04 · Tùng (phiên Claude Code) · Tùng quyết không tách US16 dù ước 6 đến 7 ngày: "không cần tách, cứ thêm task làm tiếp, không vấn đề"

## US17

- (US17) 2026-11-03 · Tùng (phiên làm tự động) · Bỏ khỏi truoc. Tùng nói ngày 2026-11-03: "En 19 để sau, không tác động các US. không ảnh hưởng các US. Ghi lại điều này. Gộp và tiếp tục làm các US"

## US18

- (US18) 3. Số cột T5 đến T8 của biểu đồ (YC7-H16 mới, [MỞ: YC7-H16]). Chuyện gì: DLM.5 ghi "giữ số canvas (có 7.2tr, 13.4tr)" nhưng không nói tháng nào, canvas CN8-00 lại xếp 13.4tr ở T7. Ví dụ: KB10 mong T5 7.2tr và một cột 13.4tr, server giả và dlm.sql chỉ có tháng 9. App tạm: không bịa số, T5 đến T8 ra cột trống, test cột 13.4tr và 7.2tr dùng số tự dựng. Phương án: (a) Tùng chọn bốn số T5 đến T8, ghi vào DLM.5, server giả và dlm.sql theo (đề xuất); (b) bỏ câu T5 đến T8 khỏi KB10. Đã ghi vào work/cau-hoi.md.
- (US18) Khối "CHƯA THU TIỀN" (, mục "Chưa thu tiền" (US18)): chờ Tùng chốt [MỞ: CH-031]; app không vẽ khối, KB13, KB14, KB16, KB17 chưa kiểm được.

## US20

- (US20) Mâu thuẫn cần Tùng quyết trước khi code: PQ15.SALE ghi tiền chênh, doanh số "chỉ của mình" và PQ10.SALE ghi sale không thấy yêu cầu của sale khác, trong khi mục "Màn nhóm của trưởng nhóm" (US20) cho trưởng nhóm thấy booking, tiền chênh của thành viên và US20-NT20 cho thành viên thấy yêu cầu chờ chủ của nhau. [MỞ: US20-Q2]

## US21

- (việc cũ) 2026-11-03 · Tùng (phiên Claude Code) · Ghi câu trả lời vào QD-012, mục "Cài đặt thông báo" (US21). Nguyên văn: "có hết hạn. Không xin huỷ lại được. đã huỷ thì không tính thống kê. Thông báo hiện ở đặt phòng đó, cả trang thông báo. Link mời: tính sau nhé"
- (việc cũ) Thứ nhất, loại thông báo "Khách nhận phòng ngày mai". P3 (cài đặt thông báo của chủ nhà) có công tắc "Khách nhận phòng ngày mai" ("Nhắc lúc 18:00 hôm trước"), đang vẽ ở trạng thái tắt. P12 (của sale) có "Khách của bạn nhận phòng ngày mai". Tùng quyết không cần loại này (mục "Cài đặt thông báo" (US21) dòng 9). Để nguyên thì màn hứa một thông báo app không gửi. P3 chỉ còn 3 loại, Chị Hoa bật cả 3, nên P1 vẫn ghi "3 loại đang bật" (DLM.8).
- (việc cũ) Thứ hai, nút "Xóa booking" ở chi tiết booking của chủ nhà. CN3-02 vẽ booking B1 của Sale Hùng (thành từ yêu cầu Chị Hoa đã chấp nhận) có nút "Xóa booking". Tùng quyết chủ nhà không được xóa booking của sale sau khi đã chấp nhận, nên cũng không có thông báo "chủ nhà xóa booking của sale" (mục "Cài đặt thông báo" (US21) dòng 10). Chủ nhà vẫn sửa được booking đó (mục "Sửa booking" (US10), không đổi). Booking chủ nhà tự ghi (ví dụ B5, khách lẻ) vẫn xóa được (mục "Xóa booking" (US10) bản 2). Để nguyên thì chủ nhà thấy nút xóa mà server sẽ từ chối, và sale mất booking đã báo khách.
- (việc cũ) Tùng nói trong phiên Claude Code ngày 2026-11-03, nguyên văn: "mục "Cài đặt thông báo" (US21): Không cần Nhắc khách nhận phòng ngày mai, và chủ nhà cũng không được xoá booking của sale nếu đặt chấp thuận đặt phòng rồi nhé. => không cần thông báo này. Nếu tính năng nào mâu thuẫn thì sửa lại yêu cầu và tạo việc cho phiên design."
- (việc cũ) Ngày 03/11/2026 Tùng quyết trong phiên Claude Code, nguyên văn: "sửa hết booking thành Đặt phòng." (Tu_dien mục Sửa r3). Claude Code đã sửa YC, HV, mục "Cài đặt thông báo" (US21), dữ liệu mẫu và glossary theo đó. Canvas làm theo.
- (US21) 2026-11-03 · Tùng (phiên làm tự động) · Bỏ khỏi truoc. Tùng nói ngày 2026-11-03: "En 19 để sau, không tác động các US. không ảnh hưởng các US. Ghi lại điều này. Gộp và tiếp tục làm các US"

## US22

- (việc cũ) | P13-01 | thêm | Có dòng thông báo "Chị Hoa đã xóa tài khoản" cho sale đang kết nối (Tùng chốt). Tên Chị Hoa kèm ghi chú đỏ. Chạm vào mở danh sách chủ nhà (Nguồn phòng), không mở lịch hay căn. Cũng có trong popup hôm nay (S1-06-01) | mục "Khi người dùng xóa tài khoản" (US22) bước 7, NT6, US22-NT4, NT7, mục "Cài đặt thông báo" (US21), QD-013 |
- (US22) Theo QD-013 (Tùng chốt 02/11/2026, đổi ở r5, r6, r7) không có màn "Xóa tài khoản" trong app. Người dùng xóa tài khoản của Home247 trong Zalo; server nhận qua webhook và chỉ xóa số điện thoại. Căn, lịch, giá, tiền, booking còn ở server. Sale không còn thấy căn, lịch của chủ nhà đã xóa tài khoản và không đặt được. Tên cũ vẫn hiện kèm ghi chú nhỏ màu đỏ "Đã xoá tài khoản". Người đó mở lại app bằng cùng tài khoản Zalo thì thấy lại dữ liệu cũ; cho lại tên và số điện thoại thì dùng lại như trước, hết ghi chú (QD-013). Sale gửi yêu cầu đặt phòng vào căn của chủ nhà đã xóa tài khoản thì app báo ngay "Không gửi được yêu cầu. Chủ nhà đã xóa tài khoản trên Home247." Sale có thông báo khi chủ nhà xóa tài khoản. Yêu cầu đang chờ giữ nguyên. US này làm phía app của mục "Khi người dùng xóa tài khoản" (US22) bản 3: không có nút xóa ở P2, và các chỗ mục "Khi người dùng xóa tài khoản" (US22) bước 8 đến 10 trỏ tới. Màn theo.
- (US22) [ ] US22- Code · Claude Code (opus): tạo file và lưu hoặc gửi trong Zalo khi bấm "Xuất file Excel (CSV)". CHỜ Tùng chốt cách lưu (mục "Xuất file Excel (CSV)" (US22) bước 6 chưa thiết kế, header `Authorization` có đi cùng không) [MỞ: US22-Q2]
- (US22) 2026-11-03 · Tùng (phiên làm tự động) · Bỏ khỏi truoc. Tùng nói ngày 2026-11-03: "Bỏ En16 ra khỏi yêu cầu hiện tại, để sau làm nhé.: không chặn US, để sau nhé, trước khi gửi cho zalo duyệt thì cần."
- (US22) 2026-11-04 · Tùng (phiên Claude Code, agent sonnet) · Sửa theo QD-013, r6, r7 và mục "Khi người dùng xóa tài khoản" (US22) bản 3 (PR #117): thuc_hien mục "Khi người dùng xóa tài khoản" (US22)@3; bỏ đoạn chờ Tùng quyết; ghi chú đỏ "Đã xoá tài khoản", sale không thấy căn, lịch và không đặt được; KB15, KB16, KB17, KB23, KB33, KB34 chờ; bỏ KB26, thêm KB38 đến KB42 (NT13, NT14, đặt phòng bị từ chối, HV4); sửa Quyền, Ngoài phạm vi, Task, Đọc · bất ngờ: mục "Danh sách căn và nguồn phòng" (US16), mục "Lịch phòng 7 ngày" (US16), mục "Chi tiết booking và đánh dấu đã thu đủ" (US10), mục "Sale nhận kết quả yêu cầu" (US15), mục "Trạng thái booking của sale" (US19), mục "Mở app từ link mời của chủ nhà" (US6), mục "Chủ nhà duyệt lời mời xem lịch" (US17), mục "Chủ nhà quản lý danh sách sale" (US5) còn viết "đã xóa tài khoản" chữ thường mà PR #117 chưa sửa; docs/architecture còn theo QD-013 đến r4 (chép tên, đặt chu_nha_id trống)

## US23

- (việc cũ) Tùng quyết ngày 02/11/2026: "F19: đặt sẵn dải ngày lễ, thêm task về design và phát triển phần web app nhưng đưa xuống dưới backlog, sau khi các chức năng của app được hoàn thiện giai đoạn code. Thêm khối yêu cầu cho phần này nếu chưa có. Về task design và phát triển thì cần điều kiện là YC được review, sau này tôi sẽ review trước." Bản đầu nạp dải ngày lễ bằng script ([]). Về sau người quản trị nhập và sửa trên web quản trị theo mục "Quản trị dải ngày lễ hằng năm" (US23).

## US25

- (US25) 2026-11-03 · Tùng (phiên làm tự động) · Tùng trả lời 4 câu ở PR #88: "Đồng ý hết, ko cần Đức xem". Không thêm DELETE /anh/:id; ngưỡng 40 triệu điểm ảnh (sửa BM14 bao-mat.md r3); giữ quy tắc không gắn ảnh tạm quá 24 giờ; giữ HEIC, tạo thử chooseImage trên iPhone. Không cần Đức xem thư viện

## US26

- (US26) 2026-11-03 · Tùng (phiên làm tự động) · Bỏ khỏi truoc. Tùng nói ngày 2026-11-03: "En 19 để sau, không tác động các US. không ảnh hưởng các US. Ghi lại điều này. Gộp và tiếp tục làm các US"

## US30

- (US30) US22-NT5 (Chị Hoa xóa tài khoản): [MỞ: QD-013]. QD-013 đổi nghĩa thành chỉ xóa tên và số điện thoại, nhưng mục "Popup thông báo mới" (US30) và canvas S1-06-01 vẫn ghi "đã xóa tài khoản", "các căn không còn trong lịch". Chưa viết kịch bản và chưa code phần này, chờ Tùng quyết ( US30 câu 2).

## Chung

- (việc cũ) Sửa canvas "Home247 · Lịch phòng Hạ Long" theo trạng thái yêu cầu đặt phòng Tùng chốt ngày 28/10/2026:
- (việc cũ) Tùng chốt ngày 28/10/2026: bỏ xoay ngang tự động. Lịch phòng của sale (S1) có nút nổi "Xoay ngang".
- (việc cũ) 2. **Xóa căn là ẩn căn.** Tùng: "thêm chức năng xoá căn, thực chất là chỉ ẩn căn đó đi khỏi màn hình. Các data khác về thống kê vẫn còn." Viết yêu cầu mới trong nhóm Căn và giá và trả lời nhóm Căn và giá câu hỏi 7. Tùng chọn theo đề xuất ("Theo đề xuất"):
- (việc cũ) 9. **Tòa nhà do quản trị đặt sẵn, người dùng thêm được.** Tùng: "Danh sách toà nhà có thể seting bởi admin, ngoài ra thêm thoải mái." Trả lời nhóm Căn và giá câu hỏi 8. Thêm việc quản trị danh sách tòa nhà vào nhóm Quản trị Home247 trên web. Tòa một người thêm hiện cho mọi người chọn. Tùng chọn theo đề xuất ("Theo đề xuất").
- (việc cũ) 2026-11-03 · Tùng (phiên Claude Code) · Việc 2, 6, 9: Tùng chọn theo đề xuất, nguyên văn "Theo đề xuất". Hết câu hỏi chặn, làm được
- (việc cũ) 2026-11-03 · Tùng (phiên Claude Code) · Ghi câu Tùng trả lời: link 21 ngày, từ chối hủy, đêm bán lại. Nguyên văn: "Link mời hết hạn sau 21 ngày. bên kia từ chối huỷ thì không được huỷ, dữ liệu vẫn đó, thực tế thì làm việc ngoài app. ghi trạng thái là bị từ chối huỷ.. Đã huỷ xong mà đêm đó là tương lai thì lại bán đươc như căn khác."
- (việc cũ) 2026-11-03 · Tùng (phiên Claude Code) · Tùng quyết nơi chạy thử, nguyên văn: "hiện tại cứ test ở máy cá nhân đã, chưa cần đưa lên oracle nhé. vậy là xong ". code và test trên máy cá nhân, chưa deploy lên Develop Oracle. Chưa code; còn chờ Tùng: trên máy cá nhân dùng đăng nhập giả hay App Secret thật bước 2)
- (việc cũ) 2026-11-03 · Tùng (phiên Claude Code) · Tùng chọn App Secret thật trên máy cá nhân, nguyên văn: "dùng app secret nhé, hiện tại hello world đã chạy được rồi mà". Ghi, sửar6, bao-mat.md r2. hết chỗ MỞ, sẵn sàng code
- (việc cũ) Vì sao: Tùng chốt QD-013 ngày 02/11/2026: không làm màn "Xóa tài khoản" trong app, làm webhook. Nguyên văn: "vậy hãy làm web hook, thêm task và cập nhật tài liệu." Theo báo cáo của nhà phát triển, Zalo đòi khai Webhook URL này trước khi gửi duyệt (docs/external/zalo-rang-buoc.md mục 3.3). Chưa đọc được tài liệu chính thức vì mạng của phiên Claude Code chặn miniapp.zaloplatforms.com.
- (việc cũ) 2026-11-03 · Tùng (phiên Claude Code) · Tùng quyết tạm bỏ số người lớn, số trẻ em: "tạm thời bỏ bao nhiêu người lớn, bao nhiêu trẻ em đi, hiển thị bao nhiêu phòng, bao nhiêu giường là được". Sửa dòng Thẻ căn, thêm dòng CN5-A1..A3, CN5-02, S6-02 đổi sang ô "Số giường"
- (việc cũ) Cùng ngày Tùng chốt phần nhãn nút của Tu_dien: nút của sale ở S3 là "Gửi yêu cầu đặt phòng", nút của chủ nhà ở CN1 giữ "Đặt phòng". Tùng: ""Gửi yêu cầu đặt" -> "Gửi yêu cầu đặt phòng". "Thêm khách" => "Đặt phòng" (vẫn giữ tên Đặt phòng như ban đầu cho chủ nhà nhé) -> xem có cần chỉnh tài liệu gì không."
- (việc cũ) Cùng ngày Tùng quyết thêm ba điều, nguyên văn: "Sale bấm "Gửi yêu cầu đặt phòng" hoặc "Gửi cho khách" thì có xin tên và số không? Hiện đang để không xin.=> có", "Tất cả những chỗ mang tính book phòng đó thì chuyển sang thành đặt phòng nhé", "Câu "Đăng nhập để xem lịch..." ở A1-link có đổi theo nút "Bắt đầu ngay" không? => có".
- (việc cũ) Ngày 03/11/2026 Tùng quyết trong phiên Claude Code theo đề xuất ở bản kê mục Kết quả kiểm, nguyên văn: "Những điểm sau cần tôi quyết thì tôi quyết hết nhé, làm theo đề xuất của bạn." Tức là: sửa cả design system gốc cho cùng token 14 px (câu 2), tạo TK này đưa vùng bấm lên 44 px (câu 3), và mở file mô tả A3, P5.
- (việc cũ) nhóm Đăng nhập, vai trò, kết nối chủ nhà và sale đến nhóm Quản trị Home247 trên web đã chốt ngày 03/11/2026. Thứ tự tin cậy là QD, QT, YC rồi mới tới thiết kế, nên canvas phải theo YC. Khi viết 482 kịch bản test cho các US, PR 75), Claude Code viết theo YC và thấy 5 màn còn lệch. Ngày 03/11/2026 Tùng quyết trong phiên Claude Code, nguyên văn: "Tạo một item TK mới... để phiên Design sửa canvas theo YC".
- (việc cũ) Booking chủ ghi cho sale: "Hùng có thấy booking vì chủ đã chia sẻ lịch cho HÙng rồi. Cọi như booking của HÙng." Sale được báo, có giá bán tự tính theo mức cộng và sửa được (Tùng chọn theo đề xuất: "Theo đề xuất"). Canvas chưa có thông báo, công tắc ở P12, màn sale xem và sửa giá bán, dòng ở S7-03 cho loại booking này.
- (việc cũ) Ngày 04/11/2026 Tùng quyết trong phiên Claude Code, nguyên văn: "sửa lại size font cho phù hợp, hiện nay nhiều điểm không hợp lý. Không nhất thiết phải trên 14px. Tôi thấy S1-07 và S2-01 có nhiều điểm font size không hợp lý. Đặc biệt là ở các màn hình hiển thị nhiều thứ như S1-07. Ưu tiên hiện nhiều thông tin thì phải chấp nhận hiện chữ nhỏ. Còn chữ "Còn" cũng ok. Rà soát lại một lượt"

## Câu hỏi đã trả lời ở bản Zalo

56 câu hỏi được trả lời ngày 04/11/2026 hoặc trước đó. Việc kiểm câu trả lời đã nằm trong đặc tả chưa bị bỏ dở, nên có thể story thô chưa có. Khi viết lại story, kiểm từng câu của story đó.

### Câu hỏi của US3

- (trả lời một phần, CH-024) Đã trả lời một phần: tiền phòng bắt buộc, ô trống thì chưa lưu được (mục "Người đặt, tiền phòng và tiền cọc" (US3) bước 2, NT4, QT4.1). Tùng 03/11: "Tiền phòng: bắt buộc". Còn mở: tiền cọc lớn hơn tiền phòng chưa có kiểm tra. `[r20 · sửa]`

### Câu hỏi của US5

- (đã trả lời, câu cũ nhóm 1-H2) Đã trả lời bởi: về CN7 với toast (mục "Xin tên và số điện thoại khi bắt đầu kết nối" (US5) bước 3, mục "Hộp thoại cấp quyền của Zalo" (US5) bước 2). Canvas sửa ở. `[r15 · sửa]` Câu hỏi cũ: A8-P2 và A8-P1 "Để sau" nối tới A9, mà A9 là màn của sale (Lịch phòng). Chủ nhà sau khi đồng ý thấy màn nào? Mô tả nói "thấy sale mới trong CN7" nhưng chưa có mũi tên. Phương án: về CN7 với toast; về Lịch; hoặc vẽ màn riêng.

### Câu hỏi của US7

- (đã trả lời, câu cũ nhóm 3-H1) Đã trả lời: phương án a, booking cũ giữ nguyên số tiền đã ghi (quy tắc Booking giữ giá riêng, US7-NT1). Tùng 03/11: "đã có booking thì giá theo booking, vì giá booking là giá lưu riêng cho từng booking, không phải tham chiếu vào giá setup. Giá setup là giá tham khảo khi tạo booking thôi nhé." `[r13 · sửa]` Câu hỏi cũ: Đổi giá khi căn đã có booking: booking cũ giữ giá lúc đặt hay đổi theo giá mới? Phương án: a) giữ nguyên số tiền đã ghi; b) đổi theo giá mới; c) hỏi chủ nhà mỗi lần.

### Câu hỏi của US8

- (đã trả lời, CH-063) Đã trả lời: hai dải ngày lễ hoặc dịp đặc biệt của cùng căn không được chồng ngày, lưu thì báo lỗi (mục "Giá ngày lễ và dịp đặc biệt" (US8) bước 8, quy tắc Giá dịp không chồng ngày). Dịp và giá tháng: dịp thay giá tháng (quy tắc Giá dịp thay giá tháng). Tùng 03/11: "Giá chồng ngày không thể được, lúc setting giá đã chặn rồi." `[r13 · sửa]` Câu hỏi cũ: Thứ tự ưu tiên khi ngày lễ, dịp đặc biệt và giá tháng chồng nhau, hoặc hai dịp trùng ngày. Phương án: dịp ghi sau cùng thắng; ngày lễ thắng dịp đặc biệt; hoặc báo lỗi khi chồng nhau.

### Câu hỏi của US10

- (trả lời một phần, câu cũ nhóm 4-H5) Đã trả lời một phần: sale được báo (mục "Sửa booking" (US10) bước 4); đổi giá chủ nhà thì giá bán của sale giữ như đã báo khách (mục "Sửa booking" (US10) bước 5, câu 2). Sale có phải đồng ý không: chưa rõ. `[r16 · sửa]` Câu gốc: Sửa booking có báo sale không? CN4-02 đổi ngày, đổi căn hay đổi tiền của booking một sale thì sale có được báo và có phải đồng ý không.

### Câu hỏi của US11

- (đã trả lời, câu cũ nhóm 3-H6) Đã trả lời: tạm thời không có số khách; form có ô "Số giường", thẻ căn ghi số phòng ngủ và số giường (mục "Tòa nhà, loại view, số giường, mô tả" (US11), mục "Sửa thông tin căn" (US11), glossary). Tùng 03/11: "tạm thời bỏ bao nhiêu người lớn, bao nhiêu trẻ em đi, hiển thị bao nhiêu phòng, bao nhiêu giường là được". Trước đó Tùng 02/11 chọn hai ô số người lớn, số trẻ em, nay tạm bỏ. `[r11 · sửa]` Câu hỏi cũ: Số khách tối đa. Thẻ CN5 ghi "4 khách" và "2 khách", nhưng form thêm và sửa căn không có ô nhập. Phương án: thêm ô số khách; hoặc suy ra từ số phòng ngủ; hoặc bỏ khỏi thẻ.
- (đã trả lời, câu cũ nhóm 3-H14) Đã trả lời bởi: giữ cách xếp nhóm hiện tại của Design. Câu gốc: P6 (Ngày tính giá cuối tuần) thuộc nhóm Căn và giá hay nhóm Quản trị và dữ liệu Quản trị? Mình xếp vào mục "Ngày tính giá cuối tuần" (US11). Cần Tùng xác nhận. `[r8 · sửa]`

### Câu hỏi của US12

- (đã trả lời, CH-073) Đã trả lời: tạm thời không lọc, không ghi số khách; S4 bỏ "· 4 khách" (mục "Kết quả tìm phòng" (US12) bước 5). Tùng 03/11: "Tạm thời chưa lọc theo số khách". `[r11 · thêm]` `[r13 · sửa]`

### Câu hỏi của US15

- (đã trả lời, CH-067) Đã trả lời bởi (Tùng duyệt ngày 02/11, giữ chip): CN9 có chip lý do Đã có khách đặt, Đang sửa phòng, Lý do khác (mục "Chủ nhà nhận và trả lời yêu cầu" (US15) bước 5). Chọn "Lý do khác" có ô nhập chữ không, và có bắt buộc chọn lý do không: chưa rõ. `[r8 · sửa]`
- (đã trả lời, câu cũ nhóm 7-H11) Đã trả lời bởi: giữ cách xếp nhóm hiện tại của Design. Câu gốc: Ranh giới nhóm. S7-03 (trạng thái booking của sale) xếp ở nhóm Thống kê theo thiết kế, nhưng nội dung gần với mục "Sale nhận kết quả yêu cầu" (US15). Cần Tùng xác nhận. `[r9 · sửa]`

### Câu hỏi của US16

- (đã trả lời, câu cũ nhóm 6-H6) Đã trả lời bởi: chạm căn của tôi (Green Bay 0812, Mường Thanh 1605) mở S6-07 (mục "Danh sách căn và nguồn phòng" (US16) bước 9). S6-07 ghi sale tự ghi lịch và giá cho căn này, như chủ nhà. `[r6 · sửa]`
- (đã trả lời, câu cũ nhóm 6-H8) Đã trả lời: tạm thời không có số khách; S6-02 có ô "Số giường" (mục "Thêm căn tự nhập" (US16) bước 3, glossary). Tùng 03/11: "tạm thời bỏ bao nhiêu người lớn, bao nhiêu trẻ em đi, hiển thị bao nhiêu phòng, bao nhiêu giường là được". Trước đó Tùng 02/11 chọn hai ô số người lớn, số trẻ em, nay tạm bỏ. `[r15 · sửa]` Câu hỏi cũ: S6-02 không có ô số khách tối đa, trong khi chi tiết căn S3 ghi "4 khách". Căn tự nhập không có số khách thì gửi khách thiếu dòng này.

### Câu hỏi của US21

- (đã trả lời, câu cũ nhóm 4-H1) Đã trả lời bởi mục "Cài đặt thông báo" (US21), (giả định GD2): bản đầu chỉ báo trong app, kèm nút nhắn tay qua cửa sổ Zalo. Thêm tin Giao dịch qua OA sau khi có OA. Server ghi sự kiện "cần báo" vào một chỗ, kênh gửi đọc từ đó, để đổi kênh không sửa luồng.
- (trả lời một phần, CH-072) Đã trả lời một phần bởi mục "Cài đặt thông báo" (US21): app ghi lần gửi khi sale gửi chữ hoặc ảnh của một căn (mục "Gửi thông tin cho khách qua Zalo" (US14) bước 7), dùng để báo căn đã gửi có người đặt. Còn mở: nhãn "Đã gửi" trên màn và đếm cho thống kê (nhóm Thống kê). `[r12 · sửa]` Câu hỏi cũ: Sau khi sale gửi khách xong thì app có ghi nhận không (ví dụ nhãn "Đã gửi") và có đếm cho thống kê (nhóm Thống kê) không. app không biết sale đã gửi thật hay chưa.
- (đã trả lời, câu cũ nhóm 9-H6) Đã trả lời bởi du-lieu-mau.md (DLM.8): giữ "3 loại đang bật"; P3 có 3 loại, cả 3 bật, vì loại "Khách nhận phòng ngày mai" đã bỏ (mục "Cài đặt thông báo" (US21)). `[r15 · sửa]` Câu hỏi cũ: Dòng "3 loại đang bật" ở P1 nhưng P3 có 4 loại.
- (đã trả lời, câu cũ nhóm 9-H13) Đã trả lời bởi: giữ cách xếp nhóm hiện tại của Design. Câu gốc: Ranh giới nhóm. P1 và P4 là menu chung. Tôi để các dòng theo nhóm của chúng (bảng ở mục "Menu tài khoản (tab Cá nhân)" (US21)). Cần Tùng xác nhận. `[r10 · sửa]`

### Câu hỏi của US22

- (đã trả lời, câu cũ nhóm 7-H13) Đã trả lời bởi QD-013 và r6: booking còn giữ sau khi một bên xóa tài khoản (mục "Khi người dùng xóa tài khoản" (US22)) vẫn tính vào mục "Doanh thu theo người bán" (US18) và mục "Thống kê của sale" (US19), dòng đó ghi tên cũ kèm ghi chú nhỏ đỏ "Đã xoá tài khoản" (US22-NT12, US22-NT13). `[r18 · sửa]` Câu hỏi cũ: có còn tính vào mục "Doanh thu theo người bán" (US18) và mục "Thống kê của sale" (US19) không, và dòng đó ghi tên thế nào.
- (đã trả lời, câu cũ nhóm 9-H5) Đã trả lời bởi QD-013: không có màn xóa trong app; người dùng xóa tài khoản, server xóa qua webhook (mục "Khi người dùng xóa tài khoản" (US22)). Điểm còn chờ Tùng duyệt ở QD-013, quan hệ với sale hoặc chủ nhà, thời gian giữ lại, và theo Nghị định 13 người dùng phải xóa được dữ liệu cá nhân. Cần màn xác nhận và quy tắc hậu quả.
- (đã trả lời, câu cũ nhóm 9-H14) Đã trả lời bởi QD-013: không còn màn "Đã xóa" trong app nên không cần `closeApp`. `[r11 · sửa]` Câu hỏi cũ: Sau khi xóa, nút "Đóng" gọi `closeApp` (mục "Khi người dùng xóa tài khoản" (US22) bước 7). docs/external/zalo-hanh-vi.md chỉ ghi API có, chưa thử trên máy thật.

### Câu hỏi của US25

- (trả lời một phần, CH-066) Đã trả lời một phần: ảnh lưu ở một thư mục trên máy production, production chạy ở máy Việt Nam (mục "Ảnh khi thêm căn" (US25) bước 2). Tùng 03/11: "tạo ra một thư mục lưu ảnh trên production. Sau này production sẽ chạy ở server Việt nam." Còn mở: định dạng, kích thước tối đa, nén, nguồn chọn (thư viện máy hay ảnh Zalo), quyền truy cập ảnh có hiện hộp thoại Zalo không. `[r13 · sửa]`

### Câu hỏi của US26

- (đã trả lời, câu cũ nhóm 2-H8) Đã trả lời bởi: giữ cách xếp nhóm hiện tại của Design. Câu gốc: nhóm Lịch chủ nhà và nhóm Booking chia ranh giới thế nào? Các màn CN3-02 (chi tiết booking), CN4 (thêm), CN4-02 (sửa), CN4-03 (đã lưu) mình xếp vào nhóm Booking. Nút "Gửi lịch cho sale" và CN10 xếp vào mục "Chủ nhà chủ động gửi lịch cho sale" (US26). Cần Tùng xác nhận. `[r8 · sửa]`

### Câu hỏi của US27

- (đã trả lời, CH-064) Đã trả lời: xóa căn là ẩn căn (mục "Xóa căn" (US27)). Tùng 03/11: "thêm chức năng xoá căn, thực chất là chỉ ẩn căn đó đi khỏi màn hình. Các data khác về thống kê vẫn còn." Còn đặt phòng sắp tới hoặc yêu cầu chờ thì không xóa được, sale không còn thấy căn, mã dùng lại được, bản đầu không hiện lại: Tùng chọn theo đề xuất ("Theo đề xuất"). Màn:. `[r13 · sửa]` Câu hỏi cũ: Xóa hoặc ẩn một căn chưa có màn. Căn đang có booking thì xử lý ra sao.
- (đã trả lời, câu cũ nhóm 3-H9) Đã trả lời: không trùng trong các căn của cùng một chủ, khác chủ thì trùng được (quy tắc Mã căn không trùng, US27-NT2). Tùng 03/11: "mã căn trong một chủ thì không trùng, ngoài ra thì trùng." `[r13 · sửa]` Câu hỏi cũ: Mã căn trùng trong phạm vi nào: trong tài khoản chủ nhà hay toàn hệ thống.

### Câu hỏi của US28

- (đã trả lời, câu cũ nhóm 4-H12) Đã trả lời: coi như booking của sale (mục "Booking chủ nhà ghi cho sale" (US28)). Tùng 03/11: "Hùng có thấy booking vì chủ đã chia sẻ lịch cho HÙng rồi. Cọi như booking của HÙng." Chủ nhà không xóa được, chỉ sửa (mục "Xóa booking" (US10)); sale được báo và có giá bán tự tính theo mức cộng, sửa được: Tùng chọn theo đề xuất ("Theo đề xuất"). `[r20 · sửa]` Câu hỏi cũ: Booking chủ nhà tự ghi mà chọn người đặt là một sale đã kết nối có tính là "booking của sale" không: chủ nhà xóa được không, sale có được báo không.

### Câu hỏi của US29

- (đã trả lời, CH-065) Đã trả lời: một danh sách chung, người quản trị đặt sẵn (mục "Quản trị danh sách tòa nhà" (US29)), người dùng thêm tòa mới không cần duyệt và tòa đó hiện cho mọi người (quy tắc Tòa nhà dùng chung). Tùng 03/11: "Danh sách toà nhà có thể seting bởi admin, ngoài ra thêm thoải mái." và chọn theo đề xuất cho phần tòa người dùng thêm. Còn mở: khu vực của tòa người dùng thêm nhập thế nào. `[r13 · sửa]` Câu hỏi cũ: Danh sách tòa nhà chung cho mọi chủ nhà hay riêng từng chủ nhà, ai duyệt tòa mới, khu vực nhập thế nào.

### Câu hỏi của US34

- (đã trả lời, CH-093) Đã trả lời bởi mục "Thêm người đồng quản trị" (US34): đăng nhập bằng mã gửi tới email. `[r6 · sửa]`
- (đã trả lời, CH-094) Đã trả lời bởi mục "Thêm người đồng quản trị" (US34): quản trị viên đầu tiên là <email quản trị viên đầu tiên>, thêm người đồng quản trị trên web (mục "Thêm người đồng quản trị" (US34)). Phần cấp và gỡ còn lại ở câu 12, 13. `[r5 · sửa]`
- (đã trả lời, câu cũ nhóm 10-H12) Đã trả lời bởi mục "Thêm người đồng quản trị" (US34): chỉ quản trị viên đầu tiên thêm được. `[r6 · sửa]`

### Câu hỏi của Chung

- (đã trả lời, câu cũ nhóm 1-H4) Đã trả lời bởi QD-007: sale thấy đã cọc hay chưa, không thấy số tiền cọc. Canvas A8, CN10 sửa ở. `[r17 · sửa]`
- (đã trả lời, câu cũ nhóm 1-H6) Đã trả lời bởi QD-005: S9 bỏ. Sale không có danh sách sale.
- (đã trả lời, câu cũ nhóm 1-H9) Đã trả lời bởi QD-008: sau A1-link là A10, không phải A9.
- (đã trả lời, câu cũ nhóm 1-H12) Đã trả lời bởi QD-005: một tài khoản một vai, sale có căn của mình trong vai sale, bản đầu không đổi vai. Chủ nhà không bán căn của chủ nhà khác (QD-007). `[r17 · sửa]`
- (đã trả lời, câu cũ nhóm 1-H18) Đã trả lời bởi docs/product/system-behaviors.md: đang tải HV1, lỗi mạng HV2, quay lại từ nền HV3, đã từ chối quyền HV4, không còn quyền xem HV5 `[r5 · sửa]`
- (đã trả lời, câu cũ nhóm 1-H20) Đã trả lời bởi: giữ cách xếp nhóm hiện tại của Design. Câu gốc: P13 Thông báo nằm nhóm nào? Màn dùng chung cho chủ nhà và sale, chứa cả thông báo booking (nhóm Booking). nhóm Đăng nhập, vai trò, kết nối chủ nhà và sale chỉ lấy dòng thông báo kết nối. P2 có "Xóa tài khoản" (xóa căn, booking và kết nối sale), có thể thuộc nhóm Quản trị và dữ liệu. Cần chốt màn nào thuộc nhóm nào. `[r11 · sửa]`
- (đã trả lời, câu cũ nhóm 1-H21) Đã trả lời bởi: giữ cách xếp nhóm hiện tại của Design. Câu gốc: A4 (mở CN5-A1) và A5 (mở S6-02) dẫn sang nhóm Căn và giá và nhóm Nguồn phòng và căn tự nhập. Giữ A4 và A5 ở nhóm Đăng nhập, vai trò, kết nối chủ nhà và sale như cổng vào, hay chuyển hẳn sang nhóm đích? `[r11 · sửa]`
- (đã trả lời, câu cũ nhóm 2-H1) Đã trả lời bởi du-lieu-mau.md (DLM.5) và QD-010: doanh thu chia theo đêm, gồm mọi booking trong tháng; "Booking sắp tới" chỉ là một phần nên tổng không bằng doanh thu. `[r4 · sửa]` Câu hỏi cũ: Số liệu doanh thu tháng tính thế nào? CN1 ghi 11.800.000đ cho 13 đêm có khách, nhưng bốn booking trong danh sách cộng lại chỉ 8.600.000đ. Chưa rõ tính theo ngày trả, theo ngày nhận hay chia theo đêm, và booking nằm giữa hai tháng thuộc tháng nào. Phương án: - a) Chia theo đêm: mỗi đêm thuộc tháng của đêm đó. - b) Tính cả booking vào tháng của ngày nhận. - c) Tính theo ngày trả.
- (đã trả lời, câu cũ nhóm 2-H3) Đã trả lời bởi du-lieu-mau.md (DLM.4, B1): một booking, Sale Hùng, 1509, 10/10 → 12/10 (2 đêm), 2.200.000đ, cọc 1.000.000đ. `[r4 · sửa]` Câu hỏi cũ: Một booking cho ra hai bộ số khác nhau. CN3 ghi Sale Hùng, phòng 1509, 09/10 → 12/10 (3 đêm), 2.700.000đ, cọc 1.000.000đ. CN3-02 ghi cùng sale và phòng nhưng 10/10 → 12/10 (2 đêm), 2.400.000đ. Phương án: đây là một booking, sửa dữ liệu minh họa; hoặc là hai booking khác nhau.
- (đã trả lời, CH-062) Đã trả lời bởi du-lieu-mau.md (DLM.3): sau khi áp dụng, Tháng 11 và Tháng 12 ghi "800k–1,1tr"; "Giá 7 tháng" là T6 đến T12. Sửa canvas CN6-04, CN6-08. `[r4 · sửa]` Câu hỏi cũ: Toast "Đã áp dụng giá cho Tháng 11 – 12" (CN6-04, CN6-08) nhưng cùng màn Tháng 11 và Tháng 12 còn ghi "Chưa đặt", và CN6-07 ghi "Giá 7 tháng". Phương án: sửa dữ liệu minh họa của CN6-04 và CN6-08; hoặc toast ghi sai.
- (trả lời một phần, CH-018) Đã trả lời một phần: danh sách Loại view là Biển, Thành phố, Núi, bỏ Vịnh (glossary, Tùng 02/11). Còn mở: chọn được nhiều loại cho một căn không. `[r9 · sửa]` Câu hỏi cũ: Loại view chỉ vẽ "Biển" và "Núi/Thành phố". Chọn được nhiều loại không, danh sách đầy đủ gồm gì.
- (đã trả lời, câu cũ nhóm 4-H2) Đã trả lời (Tùng, 28/10): yêu cầu hết hạn sau 2 tuần nếu chủ nhà chưa chấp nhận, sale được báo rõ.
- (đã trả lời, câu cũ nhóm 4-H4) Đã trả lời bởi QD-011 (phương án C): chủ nhà lưu được tên, số khách lẻ, người nhập chịu trách nhiệm. `[r13 · sửa]` Câu gốc: Form CN4 có chip tên khách lẻ đã lưu, nhưng CN3-02 ghi "Tên và số điện thoại khách chỉ sale giữ" và CLAUDE.md ghi "Không lưu thông tin khách". Phương án: chỉ có chip "Khách lẻ" không tên; lưu tên nhưng không số điện thoại; hoặc chủ nhà gõ tên trong ghi chú.
- (đã trả lời, câu cũ nhóm 4-H10) Đã trả lời bởi: giữ cách xếp nhóm hiện tại của Design. Câu gốc: Ranh giới nhóm. Mình xếp S6-05 và S6-06 (ghi nhanh booking của sale cho căn tự nhập) vào nhóm Nguồn phòng và căn tự nhập, và S7-03 (trạng thái booking của sale) vào nhóm Thống kê. Cần Tùng xác nhận. `[r12 · sửa]`
- (đã trả lời, câu cũ nhóm 4-H11) Đã trả lời bởi QD-012: một bên xin hủy, bên kia chấp thuận mới hủy; chưa chấp thuận thì chờ chấp thuận hủy; đã hủy vẫn hiện với nhãn "Đã hủy". Yêu cầu và NT viết ở. `[r21 · sửa]`
- (đã trả lời, câu cũ nhóm 5-H1) Đã trả lời bởi du-lieu-mau.md (DLM.7): giá chủ nhà 1509 ngày 10/10 → 12/10 là 2.200.000đ, mức cộng riêng +200k, giá bán 2.600.000đ; P11 dùng giá bán như S5. `[r4 · sửa]` Câu hỏi cũ: Số liệu giá lệch giữa các màn cho cùng căn và cùng ngày, nên chưa kiểm được quy tắc giá bán: - S2 ghi ICON40 1509 giá "2.200.000đ · bạn bán 2.600.000đ" (cộng 400.000đ cho 2 đêm), còn S3 và S3-02 ghi giá chủ nhà 1.800.000đ. Hai giá chủ nhà khác nhau cho cùng căn và ngày. - S3 cho giá bán 2.200.000đ khi chọn +200k, S3-02 cho 2.600.000đ (cộng 800.000đ). - P11 ghi căn 2 và căn 3 là 1.400.000đ và 3.000.000đ (trùng giá chủ nhà ở S2) dù ghi "đã cộng giá", còn S5 ghi 1.600.000đ và 3.600.000đ. Phương án: sửa dữ liệu minh họa cho khớp một bộ số; hoặc chỉ ra bộ số nào là đúng.
- (trả lời một phần, CH-068) Đã trả lời một phần bởi QD-007: tắt giá thì server không gửi giá chủ nhà, sale không có giá bán cho các đêm đó, chỉ còn thấy tiền của đặt phòng đã thành. Còn mở: S1, S2, S3 vẽ thế nào khi không có giá. `[r17 · sửa]`
- (đã trả lời, câu cũ nhóm 5-H4) Đã trả lời: P10 và S3 dùng chung một bộ, danh sách Mức cộng của sale (glossary). Tùng 02/11: "Mức cộng giá của sale => làm theo đề xuất của bạn." `[r8 · sửa]` Câu hỏi cũ: Hai bộ chip mức cộng khác nhau: P10 có Không cộng, +200k, +300k, +400k, +500k, Tùy chọn; S3 có +0, +200k, +400k, +600k. Phương án: dùng chung một bộ; hoặc S3 hiển thị mức mặc định và nút "Tùy chọn".
- (đã trả lời, câu cũ nhóm 5-H12) Đã trả lời bởi: giữ cách xếp nhóm hiện tại của Design. Câu gốc: Ranh giới nhóm. P10 và P11 nằm ở Cá nhân nhưng mình xếp vào nhóm Tìm phòng và gửi khách. Cần Tùng xác nhận. `[r7 · sửa]`
- (trả lời một phần, CH-074) Đã trả lời một phần bởi QD-007: tắt giá thì không có giá chủ nhà, không có giá bán. Còn mở: S6-04 vẽ thế nào. `[r18 · sửa]`
- (đã trả lời, câu cũ nhóm 6-H7) Đã trả lời: mọi màn dùng chung danh sách Loại view ở glossary, bỏ Vịnh. Tùng 02/11: "Loại view cũng thế, bỏ phần \"Vịnh\" đi." `[r12 · sửa]` Câu hỏi cũ: Chip "Loại view" ở S6-02 là Biển và Núi/Thành phố, còn nhóm Tìm phòng và gửi khách và nhóm Căn và giá dùng Biển, Vịnh, Thành phố. Cần dùng chung một bộ.
- (đã trả lời, câu cũ nhóm 6-H11) Đã trả lời bởi: giữ cách xếp nhóm hiện tại của Design. Câu gốc: Ranh giới nhóm. S6-04 vừa là quản lý nguồn, vừa có số liệu bán (liên quan nhóm Thống kê). S6-05/06 là ghi booking nhưng xếp ở đây thay vì nhóm Booking. Cần Tùng xác nhận. `[r11 · sửa]`
- (đã trả lời, câu cũ nhóm 6-H12) Đã trả lời bởi QD-005: S9 bỏ.
- (đã trả lời, câu cũ nhóm 7-H1) Đã trả lời bởi QD-010 và QT4: doanh thu, đêm có khách, tiền chênh chia theo đêm; tổng chủ nhà gõ khác bảng giá thì chia đều cho các đêm, phần lẻ dồn đêm cuối (QT4.2). Còn mở theo QD-010: số booking đếm theo cách nào. `[r15 · sửa]` Câu hỏi cũ: Booking nằm giữa hai tháng tính vào tháng nào. Phương án: chia doanh thu theo đêm; tính cả booking vào tháng nhận phòng; hoặc tính theo tháng chốt.
- (đã trả lời, câu cũ nhóm 7-H2) Đã trả lời bởi du-lieu-mau.md (DLM.6): Booking 6, chờ chủ 1 là À La Carte 2208 · 10/10 → 12/10; S7-03 vẽ theo danh sách đó. `[r5 · sửa]` Câu hỏi cũ: Số liệu S7 và S7-03 không khớp: S7 ghi "Booking 6" nhưng S7-03 chỉ có 2 đã chốt; S7 ghi "Chờ chủ nhà chấp nhận: 1" (ICON40 1509 · 10/10 → 12/10) còn S7-03 có 2 yêu cầu chờ và dòng 10/10 → 12/10 là À La Carte 2208. Phương án: sửa dữ liệu minh họa cho khớp một bộ số.
- (đã trả lời, CH-080) Đã trả lời (Tùng, 28/10): booking đã xóa không tính vào doanh thu, đêm có khách và chưa thu.
- (trả lời một phần, câu cũ nhóm 8-H11) Đã trả lời một phần bởi QD-005: thanh dưới của sale bỏ tab "Sale", S9 bỏ. Khi làm lại nhóm Đội nhóm, cộng tác viên thì chốt chỗ vào màn Nhóm (S8).
- (đã trả lời, câu cũ nhóm 9-H7) Đã trả lời bởi QD-005: bản đầu không có đổi vai; sale có căn của mình trong vai sale nên vẫn thấy menu của sale. Chủ nhà bán căn của chủ nhà khác: chưa quyết.

