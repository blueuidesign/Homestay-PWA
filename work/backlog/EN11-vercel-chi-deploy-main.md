---
id: EN11
tieu_de: "Vercel chỉ tự deploy nhánh main"
loai: EN
trang_thai: dang-lam
thuc_hien: []
truoc: []
lien_quan: [QD28, QD24]
nguon: QD28
nguoi: tung
rui_ro: thap
uoc_luong: 30 phút
thuc_te:
can_duyet: []
based_on:
pr:
ngay_tao: 2026-11-19
---
## Mục tiêu
Bản trên homestay-pwa.vercel.app luôn cập nhật khi gộp vào main, không bị giới hạn 100 lần deploy mỗi ngày của gói miễn phí làm tắc (QD28).

## Làm tiêu chí nào
Không có NT. Kiểm bằng tay: đẩy một nhánh PR thì Vercel không tạo deploy; gộp vào main thì có deploy production.

## Phạm vi
- vercel.json: thêm `git.deploymentEnabled` với `"**": false, "main": true`.

## Task
- [ ] EN11-TA1 Code · Claude Code: sửa vercel.json, mở PR

## Nhật ký
- 2026-11-19 · Claude · tạo item theo QD28 (Claude tự quyết, coordinator báo Vercel quá giới hạn)

## Bằng chứng
