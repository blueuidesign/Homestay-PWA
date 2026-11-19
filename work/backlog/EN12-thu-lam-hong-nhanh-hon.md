---
id: EN12
tieu_de: "Thử làm hỏng chạy nhanh hơn trên CI"
loai: EN
trang_thai: moi
thuc_hien: []
truoc: []
lien_quan: [EN2]
nguon: CI PR #44
nguoi: tung
rui_ro: thap
uoc_luong: 2 giờ
thuc_te:
can_duyet: []
based_on:
pr:
ngay_tao: 2026-11-19
---
## Mục tiêu
Job database của CI xong dưới 15 phút dù số phép thử làm hỏng còn tăng. Ngày 19/11 job này hết 13,5 phút ở PR #43 và quá 15 phút ở PR #44. Trong PR #44 đã nâng giới hạn tạm lên 40 phút.

## Làm tiêu chí nào
Không có NT. Kiểm: cùng một commit, scripts/thu-lam-hong.sh cho cùng số "đạt" và "không đạt" như trước, và thời gian job database giảm.

## Phạm vi
- scripts/thu-lam-hong.sh: mỗi phép thử dựng database từ bản mẫu (createdb -T) thay cho chạy lại mọi migration, hoặc chạy nhiều phép thử song song trên nhiều database thử.
- .github/workflows/kiem.yml: hạ timeout-minutes của job database về mức hợp lý sau khi nhanh hơn.

## Task
- [ ] EN12-TA1 Code · Claude Code

## Nhật ký
- 2026-11-19 · Claude · tạo item vì job database của PR #44 bị hủy do quá 15 phút

## Bằng chứng
