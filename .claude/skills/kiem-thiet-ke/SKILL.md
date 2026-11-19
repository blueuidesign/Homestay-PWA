---
name: kiem-thiet-ke
description: "Kiểm kết quả task Thiết kế của một item mà phiên Design vừa làm xong: đối chiếu bản kê work/thiet-ke/<mã item>.md với bảng Màn phải làm trong item, ghi Khớp hoặc Lệch, đưa các dòng \"Ngoài yêu cầu\" cho Tùng quyết, sửa YC cho khớp hình, rồi tick task kiểm hoặc trả về cho Design làm lại (CL12.9 bước 3). Dùng khi người dùng nói kiểu: \"kiểm thiết kế US7\", \"Design làm xong phần vẽ của US12 rồi\", \"soát thiết kế EN25\", \"item nào chờ kiểm thiết kế\", hoặc khi một item có task \"Claude Code: kiểm thiết kế\" chưa xong. Không dùng để vẽ hay sửa canvas (việc của phiên Design theo CL13), để review cả một YC với thiết kế trước khi viết US (dùng review-tai-lieu)."
argument-hint: "<mã item>"
---

Item: $ARGUMENTS. Làm trọn một lượt theo CL12.9 bước 3.

1. Kéo main mới nhất. Đọc file item (mục Vì sao sửa thiết kế, bảng Màn phải làm) và bản kê work/thiet-ke/<mã item>.md. Không có bản kê thì báo Design chưa xong, dừng.
2. Mỗi dòng của bảng Màn phải làm: đọc mô tả màn trong YC bằng `scripts/trich.py <mã màn>`, đối chiếu nội dung và chữ với `scripts/trich-man.py <mã màn> --chu` khi cần. Ghi Khớp hoặc Lệch vào mục Kết quả kiểm của bản kê, Lệch thì ghi lệch chỗ nào.
3. Hai chiều: mọi dòng YC trong cột Theo có màn tương ứng; mọi màn trong bản kê có nguồn từ YC, HV, QD hoặc ghi "Ngoài yêu cầu".
4. Dòng "Ngoài yêu cầu": liệt kê cho Tùng quyết Giữ hay Bỏ. Không tự quyết. Tùng đã quyết thì Giữ: sửa YC hay QD (sua-tai-lieu, qua PR); Bỏ: ghi vào Kết quả kiểm để Design sửa lại.
5. Sửa YC cho khớp hình: mã màn mới, dòng "Màn:", chỗ ghi "chưa vẽ". Theo CL12, qua PR (CL4.3.1).
6. Kết luận: mọi dòng Khớp và Tùng đã quyết hết dòng Ngoài yêu cầu thì tick task kiểm, bản kê `trang_thai: da-kiem`. Còn Lệch hay dòng Bỏ thì bỏ tick task Thiết kế, Nhật ký ghi lý do, Design làm lại theo CL13.1.
7. Một dòng nhật ký. Báo ba dòng: số Khớp, số Lệch, việc Tùng cần quyết.
