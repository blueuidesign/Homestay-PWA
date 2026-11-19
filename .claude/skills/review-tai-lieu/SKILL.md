---
name: review-tai-lieu
description: "Soát một hoặc nhiều tài liệu trong docs/ (YC, QT, QD, thiết kế...) xem có mâu thuẫn, thiếu sót, trái quyết định đã chốt hay trái ràng buộc PWA không, rồi ghi kết quả thành file work/reviews/RVn có ghi rõ rev và commit đã đọc. Lần sau chỉ đọc phần mới đổi. Dùng khi người dùng nói kiểu: \"review YC4\", \"soát lại tài liệu\", \"kiểm tra YC3 có ổn không\", \"đối chiếu YC với thiết kế\". Không dùng để review code hay PR (dùng review-code), không dùng để kiểm kết quả một TK (dùng kiem-thiet-ke), và không tự sửa tài liệu đang review."
argument-hint: "<file hoặc mã, ví dụ YC3 YC4>"
---
Làm đúng docs/process/CL12-phien-ban-va-review.md mục CL12.5 và CL12.6. Tài liệu: $ARGUMENTS

1. Ghi lại commit hiện tại của main (`git rev-parse --short origin/main`) và rev của từng file sẽ đọc.
2. Tìm review cũ: grep work/reviews/ theo tên file. Có review cũ thì chỉ đọc lại các mục mang thẻ rev lớn hơn rev lần trước, cộng các nhận xét cũ chưa có Xử lý. Chạy `git diff <commit cũ> origin/main -- <file>` để bắt cả chỗ đổi mà quên gắn thẻ.
3. Đối chiếu từng tài liệu với: khuôn docs/process/templates/yc.md (hoặc qt.md, qd.md), CLAUDE.md mục "Home247 khác app đặt phòng thông thường" và "Ràng buộc PWA", docs/external/, QD đã chốt, các YC khác (cùng dữ liệu, cùng màn, cùng quy tắc mà nói khác nhau).
4. Mỗi phát hiện: mã RVn-Fm, mức, mục (mã), loại, phát hiện, đề xuất. Xếp theo mức nguy hiểm, không theo thứ tự file. Mỗi phát hiện kèm cách sửa, không nêu lỗi trống. Câu hỏi đã có trong work/cau-hoi.md thì không chép lại, chỉ nói nếu nó nặng hơn mức đã ghi. Câu hỏi mới thì ghi vào work/cau-hoi.md (skill ghi-viec-moi), file review chỉ ghi mã.
5. Ghi file theo khuôn docs/process/templates/review.md. Cấp mã RV theo CL3.1. Thêm dòng vào work/reviews/INDEX.md.
6. Không sửa tài liệu đang review trong cùng PR. Việc sửa là của người chủ tài liệu, qua /sua-tai-lieu.
7. Báo lại: số phát hiện theo mức, ba phát hiện nặng nhất, việc Tùng cần quyết.
