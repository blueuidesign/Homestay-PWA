---
id: US0                    # số US lớn nhất + 1 (CL3)
tieu_de:                   # <vai> <làm gì>, ngắn
loai: US
trang_thai: moi            # san-sang chỉ khi mọi mục thuc_hien đã da-chot (CL2.4)
thuc_hien: []              # [YC5.1@1, YC5.3@1]: mục YC kèm bản hiện tại của mục (dòng "Bản n")
truoc: []                  # EN, US phải xong trước
lien_quan: []
thay_cho: []               # khi tách, gộp US cũ
nguon:                     # QD, câu hỏi đã trả lời, hay EN viết US
nguoi:                     # tung | duc
rui_ro:                    # thap | tb | cao. Lấy mức cao nhất của thuc_hien (CL14.6)
nghiem_thu: khong          # co | khong. Tùng chọn US cần tự nghiệm thu (CL2.9). khong thì không có task Nghiệm thu
uoc_luong:                 # Đức ghi trước khi làm, không sửa
thuc_te:
can_duyet: []
based_on:
pr:
ngay_tao:
---
## Mục tiêu
Là <chủ nhà | sale>, tôi muốn <làm gì>, để <được gì>.

## Làm tiêu chí nào
<!-- Chỉ mã NT, ví dụ YC5.3-NT1 đến NT8. NT của thuc_hien mà US khác làm thì ghi ở Ngoài phạm vi -->

## Quy tắc, hành vi dùng
<!-- Mã QT, HV, ví dụ QT1.1 đến QT1.3, QT6.1, HV3, HV8 -->

## Màn hình
<!-- Mã màn trong YC -->

## Quyền
<!-- Ô PQ chạm tới. Mỗi ô có test vi phạm (CL2.5) -->

## Phạm vi
<!-- Thư mục, file task Code được sửa. Agent không sửa file ngoài danh sách này -->

## Ngoài phạm vi
<!-- Việc dễ tưởng thuộc US này, kèm US làm việc đó -->

## Đọc
<!-- Chỉ mã trich.py tìm được, không chú thích (CL14.4): YC5.3 QT1.1 PQ7 DLM.4 CN4 EN1 trên một dòng; mỗi mục trong file một dòng: thiet-ke-db.md#3. Bất biến (sai là hỏng sản phẩm). Cả file chỉ khi làm mọi mục của nó -->

## Test case
Kịch bản test tay: tests/kb/US0-<ten-ngan>.md (CL14.5a, khuôn docs/process/templates/kb.md).

## Task
<!-- Theo CL2.8 và CL14.5: các task Code, rồi Test tay. Task Nghiệm thu chỉ khi nghiem_thu: co, là task cuối -->
- [ ] US0-TA1 Code · Claude Code (opus|sonnet|haiku, CL14.6a): <task rủi ro cao: test trước theo CL14.5, ghi rõ lớp test>
- [ ] US0-TA2 Code · Claude Code (opus|sonnet|haiku, CL14.6a): test tự động <mã NT>
- [ ] US0-TA3 Test tay · Đức:
- [ ] US0-TA4 Nghiệm thu · Tùng (bỏ dòng này khi nghiem_thu: khong):

## Kế hoạch

## Nhật ký
<!-- Mỗi lần một dòng dưới 200 ký tự: ngày · người · đã làm gì · PR · bất ngờ · mất bao lâu -->

## Bằng chứng
