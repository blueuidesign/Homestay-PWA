---
name: can-lam-gi
description: "Kể cho Tùng hoặc Đức biết hôm nay và vài ngày tới mình cần làm gì, việc nào trước, việc nào đang chờ ai. Dùng khi người dùng hỏi hoặc nói kiểu: \"tôi cần làm gì\", \"hôm nay làm gì\", \"việc của tôi\", \"Đức cần làm gì\", \"tóm lại\", \"tóm tắt 5 dòng\", \"có gì chờ tôi duyệt\", \"PR nào chờ gộp\", \"báo cáo đủ\", \"dự án đang thế nào\" (hỏi chung, không nêu mã). Không dùng khi hỏi về một YC, EP hay US cụ thể (dùng xem-tinh-hinh), hoặc khi được bảo làm một việc (dùng lam-mot-item)."
argument-hint: "[Tùng|Đức] [ngan | duyet | day-du]"
model: sonnet
---

Người hỏi và kiểu trả lời: $ARGUMENTS. Không có tên thì lấy theo câu đầu phiên, vẫn không có thì hỏi. Chọn kiểu theo lời người hỏi: "tóm lại", "5 dòng" là `ngan`; "chờ duyệt", "chờ tôi chốt", "PR nào chờ gộp" là `duyet`; "báo cáo đủ", "toàn bộ" là `day-du`. Chỉ đọc, không sửa file.

## Đọc gì
1. Chạy `python3 scripts/plan.py` nếu work/plan/bang.json cũ hơn commit mới nhất chạm work/. Đọc bang.json, không đọc thân từng file item.
2. Đọc thêm work/cau-hoi.md (câu hỏi mở đang chặn việc), docs/decisions/INDEX.md (QD cho-chot), work/cai-tien.md (CT chưa xử lý).
3. PR đang mở: lấy từ trường `pr` của item trong bang.json. Không gọi API GitHub, vì phiên cloud thường không gọi được.
4. Chỉ mở file item khi cần mục Đọc của item đó.

## Thứ tự việc
1. Việc đang chặn người khác nhiều nhất (đếm qua `truoc`), rồi việc phải chờ bên ngoài (Zalo, cơ quan), rồi theo THU-TU.md.
2. Cột đã chạm trần chờ người (CL1.2) thì việc của người ở cột đó lên đầu: Đức test tay các item `cho-test`, Tùng nghiệm thu các US `cho-nghiem-thu`.
3. Việc của Tùng: QD cho-chot, câu hỏi mở chặn việc, PR chờ gộp thuộc CL4.3, US Tùng đã chọn nghiệm thu, US Đức vừa test đạt để Tùng chọn có nghiệm thu không (CL2.9), CT mới, sắp THU-TU. Việc của Đức: test tay, việc cần máy thật, PR thuộc CL4.2.
4. TK ở `cho-nghiem-thu` có task kiểm chưa xong: kể là việc của Tùng, "bảo Claude Code kiểm TKn".

## Kiểu trả lời
- **Mặc định:** gạch đầu dòng, hai nhóm "Hôm nay" và "Vài ngày tới". Mỗi việc một câu nói chuyện, nói rõ làm gì và vì sao nó đứng ở đó. Mã việc là link tới file trên GitHub. Dưới mỗi việc một gạch con "Đọc:" liệt kê mã có link lấy từ mục Đọc, thuc_hien, nguon. Khoảng 100 đến 150 chữ, không tính dòng Đọc.
- **ngan:** đúng 5 dòng, không tiêu đề, không câu mở đầu. Mỗi dòng một việc, mở đầu bằng động từ. Ít hơn 5 việc thì dòng còn lại ghi AI làm gì tiếp hoặc việc đang chờ ai.
- **duyet:** mọi thứ chờ Tùng duyệt hoặc chốt, mỗi dòng: cái gì, link PR, đang chặn item nào, CL4.3.x nào. Xếp theo số item bị chặn. Lời duyệt chỉ tính theo CL4.6.
- **day-du:** năm mục: chờ Tùng duyệt, nên làm trước, bị chặn, yêu cầu chưa xong (Chưa code, Chưa test, Test lỗi), cảnh báo (item sai trạng thái, QD quá hạn chốt, file docs/external quá review_by, lỗi kiem.py).

Người hỏi là Đức thì kể việc của Đức, cộng một câu Đức đang chờ Tùng việc gì. Không kể lại việc AI đã làm. Trạng thái Chưa code, Chưa test, Test lỗi không được gọi là xong.
