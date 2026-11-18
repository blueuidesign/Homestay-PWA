# US33 · Chọn tỉnh lúc onboarding, danh sách tòa nhà lọc theo tỉnh và xếp theo chữ cái

- Loại: tính năng
- Trạng thái: chưa làm
- Đặc tả: thô (lắp bằng máy từ bản Zalo, chưa viết lại theo khuôn; không code theo bản này, xem US41)
- Bản: sau
- Rủi ro: tb
- Làm sau khi xong: không phụ thuộc story nào
- Kiểm tay: chưa có kịch bản, viết khi làm story

## Mục tiêu
Là chủ nhà, tôi muốn chọn tỉnh khi bắt đầu dùng app, để danh sách tòa nhà chỉ gợi ý các tòa ở tỉnh tôi.

## Tiêu chí nghiệm thu
Chưa có. Story này chưa đủ để code: viết tiêu chí, Tùng chốt, rồi mới làm.

## Việc cần làm
- [ ] Đọc story này và các luật chung nó trỏ tới. Chỗ nào gắn thẻ MỞ thì không code, hỏi Tùng (docs/Cau_hoi_mo.md).
- [ ] Viết test cho từng tiêu chí chưa có test, test đỏ trước (lớp test: docs/QUY_TRINH.md mục 6).
- [ ] Database: thêm migration nếu story cần bảng hay hàm mới, kèm test và một dòng trong `scripts/thu-lam-hong.sh`.
- [ ] Giao diện: các màn ở mục Màn hình, nối với Supabase (docs/Ghi_chu_code.md).
- [ ] E2E cho luồng chính của story.
- [ ] Viết kịch bản kiểm tay (tests/kich-ban/US33.md), rồi kiểm trên điện thoại thật.
- [ ] Đổi Trạng thái ở đầu file và ở `docs/stories/README.md` trong cùng PR.
