# US32 · Báo sale khi chủ nhà đổi giá căn sale đã gửi khách, ghi chú giá mới đổi trong 2 tuần

- Loại: tính năng
- Trạng thái: chưa làm
- Bản: sau
- Rủi ro: cao
- Làm sau khi xong: US13, US14
- Kiểm tay: chưa có kịch bản, viết khi làm story

## Mục tiêu
Là sale, tôi muốn biết khi chủ nhà đổi giá một căn tôi đã gửi cho khách, và thấy giá đã đổi thế nào, để báo lại khách đúng giá.

## Tiêu chí nghiệm thu
Chưa có. Story này chưa đủ để code: viết tiêu chí, Tùng chốt, rồi mới làm.

## Việc cần làm
- [ ] Đọc story này và các luật chung nó trỏ tới. Chỗ nào gắn thẻ MỞ thì không code, hỏi Tùng (docs/Cau_hoi_mo.md).
- [ ] Viết test cho từng tiêu chí chưa có test, test đỏ trước (lớp test: docs/QUY_TRINH.md mục 6).
- [ ] Database: thêm migration nếu story cần bảng hay hàm mới, kèm test và một dòng trong `scripts/thu-lam-hong.sh`.
- [ ] Giao diện: các màn ở mục Màn hình, nối với Supabase (docs/Ghi_chu_code.md).
- [ ] E2E cho luồng chính của story.
- [ ] Viết kịch bản kiểm tay (tests/kich-ban/US32.md), rồi kiểm trên điện thoại thật.
- [ ] Đổi Trạng thái ở đầu file và ở `docs/stories/README.md` trong cùng PR.
