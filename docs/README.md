# Tài liệu

Mỗi thông tin chỉ nằm một chỗ. Bảng "cái gì ở đâu" và luật sống hay đóng băng: `QUY_TRINH.md` mục 3.

| File | Là gì | Đọc khi nào |
|---|---|---|
| `Mo_ta_du_an.md` | Sản phẩm là gì, cho ai, làm gì và không làm gì | Một lần, lúc mới vào |
| `Nguyen_ly_lam_viec.md` | Sáu nguyên lý và lý do | Một lần; đọc lại khi muốn đổi cách làm |
| `QUY_TRINH.md` | Luật làm việc: story, test, thiết kế, database, git | Trước khi làm việc đầu tiên |
| `Quyet_dinh.md` | Quyết định và lý do, mới nhất ở trên | Khi thấy một luật lạ, hoặc hai nguồn lệch nhau |
| `Cau_hoi_mo.md` | Câu hỏi chờ Tùng, giả định đang dùng | Khi gặp thẻ `[MỞ: …]` hoặc `(giả định GD…)` |
| `stories/README.md` | Thứ tự làm, trạng thái, mục nào ở story nào | Mỗi phiên, để biết làm gì |
| `stories/US<n>-….md` | Mọi thứ của một tính năng | Khi làm story đó |
| `luat-chung/` | Luật dùng ở nhiều story: `QT.md` tính toán, `PQ.md` quyền, `HV.md` hành vi mọi màn, `Nghiep_vu.md` luật chung của database và quy tắc theo nhóm, `PWA.md` khác biệt với Zalo, `Tu_dien.md` từ ngữ, `Du_lieu_mau.md` số mẫu | Khi story trỏ tới bằng mã |
| `Thiet_ke_DB.md` | Ý định và bất biến của database | Khi đụng tới database |
| `tu-sinh/Bang_va_cot.md` | Bảng, cột, hàm, policy. Máy sinh | Khi cần tên cột, tham số hàm |
| `tu-sinh/Doi_ma_YC.md` | Bảng đổi mã YC của bản Zalo sang mã mới. Máy sinh, đóng băng | Khi gặp mã `YC…` trong lịch sử git hay quyết định cũ |
| `Ghi_chu_code.md` | Cấu trúc app, cách nối Supabase, việc còn dở | Khi đụng tới `src/` |
| `thiet-ke/` | Canvas thiết kế và công cụ xem từng màn | Khi làm giao diện |
| `van-hanh/` | Bí mật để ở đâu, sao lưu, xử lý sự cố | Khi phát hành, khi có sự cố |
| `bao-mat.md`, `phap-ly/`, `zalo/` | Tài liệu đóng băng chép từ bản Zalo | Khi cần; không sửa theo code |

Tìm theo mã:

```bash
grep -rn "US12-NT3" docs/stories/ tests/        # một tiêu chí: nguyên văn và test của nó
grep -n "QT1.4" docs/luat-chung/QT.md            # một quy tắc
grep -n "PQ5" docs/luat-chung/PQ.md              # một hàng quyền
grep -n "QD-011" docs/Quyet_dinh.md              # một quyết định
grep -n "CH-025\|US12-H1" docs/Cau_hoi_mo.md     # một câu hỏi mở
```
