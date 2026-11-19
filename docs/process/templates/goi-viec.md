---
item: US0
task: [US0-TA1, US0-TA2]    # các task Code của item làm trong gói này
model: sonnet               # opus | sonnet, theo CL14.6a, mức cao nhất mà các task cần
soan_luc:                   # commit lúc soạn
soan_bang: scripts/goi.py
---
# Gói việc US0

Một gói cho cả item, một agent làm hết task Code của item (CL10.6). Soạn bằng `python3 scripts/goi.py <mã item> --ghi` (skill soan-viec-cho-subagent): máy chép mọi ô dưới đây trừ Làm theo mẫu và Test ở lớp nào. Agent phụ chỉ đọc gói này và code. Thiếu ô nào không điền được thì không giao sonnet. Lưu ở work/goi/<mã item>.md, xóa khi item sang xong.

## Việc
<!-- Một câu: task nào, ra cái gì -->

## Bất biến của Home247
<!-- Máy chép hai mục của CLAUDE.md: Home247 khác app đặt phòng thông thường, Ràng buộc Zalo -->

## NT phải đạt
<!-- Chép nguyên văn bằng scripts/trich.py, kèm mã. Không tóm tắt -->

## Ví dụ số
<!-- VD của các QT liên quan, chép nguyên văn -->

## Quyết định liên quan
<!-- Mục Quyết định của các QD, chép nguyên văn. Không chép bảng phương án -->

## Hành vi chung
<!-- HV liên quan: rỗng, đang tải, lỗi mạng, quay lại từ nền, mở từ link -->

## Hợp đồng API
<!-- Đầu vào, đầu ra, lỗi của đúng các API task chạm (trich.py api/<file>.md#<API>) -->

## Màn
<!-- docs/design/screens/<mã>.md, và scripts/trich-man.py <mã> cho chữ và nhãn chính xác -->

## Tài liệu khác
<!-- PQ, DLM, server.md#..., mã item khác trong mục Đọc -->

## Quy ước code
<!-- Chép nguyên văn .claude/rules/code.md. Frontend: thêm src/miniapp/services/README.md. Server: thêm server.md mục 0 và 1 phần liên quan -->

## Làm theo mẫu
<!-- 1 đến 2 file có sẵn làm việc giống nhất, ví dụ src/server/api/booking.js, src/server/api/us10.test.js -->

## Câu còn mở
<!-- Các [MỞ: ...] trong phần đã trích, kèm câu "không làm phần này". Gặp chỗ gói không nói thì dừng, ghi câu hỏi vào work/cau-hoi.md, không tự đoán -->

## Được sửa
<!-- Thư mục, file. Lấy từ mục Phạm vi của item -->

## Test ở lớp nào
<!-- Với từng NT rủi ro cao: db, server, permissions hay ghép (CL14.5). Task test trước thì ghi file test agent sau không được sửa -->

## Lệnh kiểm
<!-- Lệnh test, build theo docs/dev/chay-va-test.md. Phải chạy và dán kết quả vào báo cáo -->

## Xong khi
- Test mang mã NT xanh ở đúng lớp.
- Build qua: `npx vite build --outDir www` (Mini App).
- `python3 scripts/kiem.py --diff origin/main` không có lỗi mới.
- Không sửa file ngoài "Được sửa".
- Báo lại tối đa 10 dòng: PR, lệnh đã chạy, kết quả, việc còn lại.
