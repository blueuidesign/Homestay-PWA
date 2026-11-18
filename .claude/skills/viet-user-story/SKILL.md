---
name: viet-user-story
description: "Viết hoặc sửa User Story từ yêu cầu YC đúng luật CL14: chia YC thành các US lát dọc làm trong tối đa 5 ngày, mỗi tiêu chí NT thuộc đúng một US, mục Đọc chỉ ghi mã để soạn gói việc bằng máy, có Phạm vi, task chia Code, Test tay, Nghiệm thu nếu Tùng chọn, kèm kịch bản test tay gắn [Chính] hoặc [Biên]. Dùng khi người dùng nói kiểu: \"viết US cho YC4\", \"tách YC5 thành story\", \"thêm US cho tính năng ...\", \"chia EP3 thành US\", \"US12 thiếu NT, sửa lại\", \"YC4 vừa đổi, cập nhật US\", \"sửa mục Đọc của US3\". Không dùng để code một US (dùng lam-mot-item), để viết yêu cầu mới (YC do Tùng viết, sửa qua sua-tai-lieu hoặc doi-yeu-cau), hoặc để ghi một việc nhỏ chưa cần đủ khuôn (dùng ghi-viec-moi)."
argument-hint: "<YC4 | EP3 | US12> [ghi chú]"
---

Phạm vi: $ARGUMENTS. Làm theo các bước ở CL14.7, khuôn docs/process/templates/us.md, cách cắt ở CL14.3. Câu đầu phiên cho biết ai đang làm.

1. **Đọc bằng trich.py:** các YC trong phạm vi, QT và HV chúng trỏ tới, US hiện có cùng `cha` (từ work/plan/bang.json, không mở từng file).
2. **Bảng phủ:** mỗi NT của các YC thuộc đúng một US. NT chưa có US thì đề xuất US mới hoặc thêm vào US có sẵn. NT có `[MỞ: ...]` thì ghi vào Ngoài phạm vi kèm mã câu hỏi.
3. **Đề xuất trước khi viết file:** danh sách US (tên, vai, NT, `truoc`, rủi ro, ước lượng đề xuất, model từng task theo CL14.6a). Chờ người dùng đồng ý.
4. **Viết file US** theo CL14.4:
   - `thuc_hien` ghi bản hiện tại của YC. `nghiem_thu: khong` trừ khi Tùng đã nói US này cần tự nghiệm thu (CL2.9).
   - **Phạm vi** bắt buộc: thư mục, file task Code được sửa.
   - **Đọc** chỉ ghi mã mà trich.py tìm được, không chú thích. API ghi từng mục `api/<file>.md#GET /đường-dẫn`, mỗi mục một dòng. Chỉ ghi cả file khi US làm mọi mục của file đó, vì một file API có thể tới 30 nghìn token.
   - **Task:** các task Code (mỗi task một lát dọc nhỏ hoặc một lớp, có model), rồi Test tay. Task Nghiệm thu chỉ khi `nghiem_thu: co`. Task rủi ro cao tách task viết test trước (CL14.5).
5. **Kịch bản test tay** ở tests/kb/<US>-<tên-ngắn>.md theo khuôn kb.md và CL14.5a. Mỗi kịch bản gắn `[Chính]` (luồng cơ bản người dùng làm hằng ngày) hoặc `[Biên]` (ca biên, lỗi, quyền). Chế độ test nhanh của skill test-tay chỉ chạy `[Chính]`, nên mọi NT của luồng chính phải có ít nhất một kịch bản `[Chính]`.
6. **Kiểm bằng máy:** `python3 scripts/kiem.py <các file US>` không còn lỗi doc-ma, và `python3 scripts/goi.py <US>` chạy không báo mã thiếu. Ghi bảng phủ vào nhật ký của item DC đang làm.
7. **Không sửa THU-TU.md** (CL4.3.2). Đề xuất thứ tự trong PR. Mở PR một nhóm US. Báo ba dòng: đã làm, còn lại, ai làm gì tiếp.

YC đổi bản thì làm theo CL14.8: US chưa bắt đầu sửa `@bản` và NT; US đang làm hoặc đã xong thì tạo DC hoặc US mới cho phần đổi, không sửa lặng lẽ.
