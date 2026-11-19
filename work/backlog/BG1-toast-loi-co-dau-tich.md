---
id: BG1
tieu_de: "Toast báo lỗi vẫn có dấu ✓"
loai: BG
trang_thai: cho-test
thuc_hien: [HV8@5]
truoc: [EN4, US15]
lien_quan: [US15]
nguon: US15 (PR #22)
nguoi: tung
rui_ro: thap
uoc_luong: 1 giờ
thuc_te:
can_duyet: []
based_on:
pr: [23]
ngay_tao: 2026-11-19
---
## Mục tiêu
Toast báo việc chưa làm được (mất mạng, lỗi) không có dấu ✓, để người dùng không tưởng việc đã xong.

## Làm tiêu chí nào
HV8-NT4

## Đọc
HV8

## Phạm vi
src/chung/Toast.tsx và test, nơi gọi toast lỗi (src/man/CN5A1ThemCan.tsx).

## Không được
Đổi vị trí, kiểu, thời gian của toast thường.

## Dừng và hỏi nếu
Tài liệu không nói rõ. Cần sửa file ngoài phạm vi. Cần quyền trong CL4.

## Task
- [x] BG1-TA1 Code · Claude Code (sonnet, CL14.6a): useToast nhận kiểu "loi" thì không có dấu ✓; test unit HV8-NT4; đổi toast mất mạng ở CN5-A1 sang kiểu lỗi

## Kế hoạch

## Nhật ký
- 2026-11-19 · Claude · tạo từ báo cáo US15: toast mất mạng hiện dấu ✓; HV8 r5 thêm HV8-NT4 (QD25)
- 2026-11-19 · Claude · toast nhận kiểu 'loi' không có ✓, CN5-A1 dùng cho mất mạng và lỗi chung · 15 phút
- 2026-11-19 · Claude · gộp PR #23 theo QD25 (CI xanh), sang cho-test

## Bằng chứng
- `npx vitest run src/chung/Toast.test.tsx`: lần đầu HV8-NT4 đỏ (toast lỗi có ✓), sau sửa 3 qua. `npx vitest run` 131 qua. typecheck, build qua.
