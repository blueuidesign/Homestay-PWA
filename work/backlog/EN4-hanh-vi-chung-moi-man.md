---
id: EN4
tieu_de: "Hành vi chung mọi màn: đang tải, mất mạng, quay lại app, quyền, phiên hết hạn, toast"
loai: EN
trang_thai: cho-test
thuc_hien: []
truoc: [EN1]
lien_quan: []
nguon: QD21
nguoi: tung
rui_ro: tb
uoc_luong:
thuc_te:
can_duyet: []
based_on:
pr: [14]
ngay_tao: 2026-11-18
---
## Mục tiêu
Có sẵn thành phần dùng chung cho HV1 đến HV8, để mỗi màn của US chỉ việc gắn vào.

## Làm tiêu chí nào
HV8-NT1, HV8-NT2. Các NT khác của HV1 đến HV8 gắn với một màn cụ thể nên kiểm ở US làm màn đó (QD27); EN4 làm thành phần dùng chung và test unit của chính thành phần.

## Đọc
HV1 HV2 HV3 HV4 HV5 HV6 HV7 HV8
QT5.5
pwa.md

## Phạm vi
Điền khi lập kế hoạch.

## Không được
Code phần đặc tả chưa quyết (câu hỏi đang mở). Ghi bí mật, email, số điện thoại thật vào repo.

## Dừng và hỏi nếu
Tài liệu không nói rõ. Cần sửa file ngoài phạm vi. Cần quyền trong CL4.

## Task
- [x] EN4-TA1 Code · PR #14
- [ ] EN4-TA2 Test tay · Đức: tắt mạng, chuyển app sang nền rồi quay lại, trên iPhone và Android; ghi một dòng biên bản

## Kế hoạch
Thành phần dùng chung trong src/chung/, mỗi nhóm một file kèm test: Toast.tsx (HV8), dangTai.tsx (HV1), matKetNoi.tsx (HV2, QT5.5), nhap.ts (HV3), quyen.tsx (HV4, HV5), chiaSe.ts (HV6), phien.ts (HV7). HV1-H1 và HV3-H1 làm thành tham số có giá trị mặc định (giả định): THOI_GIAN_CHO_LOI_MS = 15 giây, THOI_GIAN_GIU_NHAP_MS = 24 giờ. Chưa nối vào màn nào (US làm màn sẽ gắn).

## Nhật ký
- 2026-11-18 · Claude · tạo item (QD21)
- 2026-11-19 · Claude · chia NT gắn màn sang các US (QD27); bắt đầu làm
- 2026-11-19 · Claude · gộp PR #14 theo QD25 (CI xanh), sang cho-test chờ Đức TA2

## Bằng chứng
- `npm test`: lần đầu đỏ 2 test (quên cleanup giữa các test, không phải lỗi code), sửa 1 vòng, cuối xanh 46/46 (10 file). Test mang mã HV1-NT1/NT2, HV2-NT1..3, HV3-NT1/3/4, HV5-NT1/2, HV6-NT2, HV7-NT1/2, HV8-NT1/2 ở lớp unit.
- `npm run typecheck`: qua. `npm run build`: qua. `python3 scripts/kiem.py --diff origin/main`: không có lỗi.
- Giả định chờ Tùng chốt: HV1-H1 (15 giây), HV3-H1 (24 giờ). Các NT gắn màn (HV2-NT1, HV3-NT2, HV4-NT5/6...) mới kiểm phần thành phần; phần gắn màn kiểm ở US.
