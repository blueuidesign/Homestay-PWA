# US24 · Bản web cho chủ nhà nhiều căn

- Loại: tính năng
- Trạng thái: chờ code
- Đặc tả: thô (lắp bằng máy từ bản Zalo, chưa viết lại theo khuôn; không code theo bản này, xem US41)
- Bản: sau
- Rủi ro: tb
- Làm sau khi xong: không phụ thuộc story nào
- Kiểm tay: `tests/kich-ban/US24.md` (0 kịch bản)

## Mục tiêu
Là chủ nhà 10 căn, tôi muốn xem và sửa lịch trên máy tính, để làm việc nhanh hơn khi quản lý nhiều căn. Chưa có đặc tả. `thuc_hien` còn rỗng, không bịa tiêu chí.

## Tiêu chí nghiệm thu
Chưa có. Story này chưa đủ để code: viết tiêu chí, Tùng chốt, rồi mới làm.

## Luật chung dùng
Nguyên văn ở `docs/luat-chung/` (QT.md, HV.md, Nghiep_vu.md, Tu_dien.md), tìm theo mã hoặc tên.

[MỞ: US24-H1] chưa có đặc tả

## Màn hình
Hình: `python3 docs/thiet-ke/trich-man.py <mã màn>` (docs/thiet-ke/README.md). Chữ và số trên hình lệch story thì story đúng.

[MỞ: US24-H1] chưa có đặc tả

## Quyền
Ô quyền theo `docs/luat-chung/PQ.md`. Mỗi ô phải có test chứng minh người không có quyền thì không đọc, không ghi được; test ở lớp database (`tests/db/`).

[MỞ: US24-H1] chưa có đặc tả. src/web/README.md ghi bản web không có quyền riêng nào mà app không có, trừ ADMIN; ô PQ chốt khi có YC. Mỗi ô PQ sẽ có test vi phạm.

## Ngoài phạm vi
- Web quản trị của Home247, dải ngày lễ (mục "Quản trị dải ngày lễ hằng năm" (US23)): US23.
- Web quản trị, danh sách tòa nhà (mục "Quản trị danh sách tòa nhà" (US29)): US29.
- Tra cứu tài khoản khi hỗ trợ: chưa có yêu cầu.
- Mọi chức năng đã có trên app: giữ ở US của app, không làm lại ở đây.

## Việc cần làm
- [ ] Đọc story này và các luật chung nó trỏ tới. Chỗ nào gắn thẻ MỞ thì không code, hỏi Tùng (docs/Cau_hoi_mo.md).
- [ ] Viết test cho từng tiêu chí chưa có test, test đỏ trước (lớp test: docs/QUY_TRINH.md mục 6).
- [ ] Database: thêm migration nếu story cần bảng hay hàm mới, kèm test và một dòng trong `scripts/thu-lam-hong.sh`.
- [ ] Giao diện: các màn ở mục Màn hình, nối với Supabase (docs/Ghi_chu_code.md).
- [ ] E2E cho luồng chính của story.
- [ ] Kiểm tay theo `tests/kich-ban/US24.md` trên điện thoại thật.
- [ ] Đổi Trạng thái ở đầu file và ở `docs/stories/README.md` trong cùng PR.
