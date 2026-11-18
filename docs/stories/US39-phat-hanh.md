# US39 · Phát hành: production, tên miền, sao lưu, theo dõi lỗi

- Loại: kỹ thuật
- Trạng thái: chưa làm
- Bản: 1
- Rủi ro: cao
- Làm sau khi xong: US37

Ngoài US37, cần xong các story bản 1 mà Tùng chọn cho lần phát hành đầu.

## Mục tiêu
Là chủ dự án, tôi muốn đưa app cho người dùng thật mà dữ liệu của họ an toàn, mất thì khôi phục được, lỗi thì biết sớm.

## Chặn bởi
- CH-002: dữ liệu người dùng đặt ở đâu. Chưa có lời đáp thì không tạo project production.
- CH-001: cách đăng nhập (US37).
- YC1-H19: nội dung Điều khoản và Chính sách quyền riêng tư. Bản nháp ở `docs/phap-ly/` viết cho bản Zalo, chưa qua luật sư.

## Tiêu chí nghiệm thu
- **US39-NT1** Khi chạy toàn bộ migration lên project production trống, thì không lỗi và các cảnh báo bảo mật của Supabase không còn mục mức cao.
- **US39-NT2** Khi mở tên miền chính trên điện thoại, thì app mở được, cài được, và không có cách nào vào bằng email và mật khẩu thử.
- **US39-NT3** Khi job sao lưu chạy ban đêm, thì có một bản sao lưu đã mã hóa ở nơi cất; và đã khôi phục thử một lần vào một database trống, ghi kết quả vào `docs/van-hanh/Sao_luu_khoi_phuc.md`.
- **US39-NT4** Khi app gặp lỗi không lường trước ở máy người dùng, thì Tùng biết trong ngày (cách báo: quyết khi làm; không gửi tên, số điện thoại khách vào công cụ theo dõi lỗi).
- **US39-NT5** Khi người dùng mở "Điều khoản" hoặc "Chính sách quyền riêng tư", thì thấy nội dung đã được Tùng duyệt, không phải chữ giữ chỗ.
- **US39-NT6** Khi quản trị viên đầu tiên đăng nhập lần đầu ở production, thì được gán quyền quản trị; email của người đó không nằm trong repo.

## Ngoài phạm vi
- Bản Zalo Mini App: làm sau (QD-003), tài liệu ở `docs/zalo/`.
- Người dùng tự tải file sao lưu: US40, không làm ở bản 1.

## Việc cần làm
- [ ] Tùng trả lời CH-002, ghi QD.
- [ ] `VIEC_TAY_CUA_TUNG.md` bước 8.
- [ ] Chạy migration production (Tùng duyệt từng lần), thêm email quản trị bằng SQL tại chỗ.
- [ ] Bật sao lưu, diễn tập khôi phục.
- [ ] Soát `docs/phap-ly/` cho bản PWA, Tùng duyệt, đưa vào app thay chữ giữ chỗ ở `src/main.tsx`.
- [ ] Soát `docs/bao-mat.md`: mối nguy nào còn áp dụng, đã có test chưa.
- [ ] Viết kịch bản kiểm tay (tests/kich-ban/US39.md): danh sách kiểm trước khi mở cho người dùng.
- [ ] Đổi Trạng thái ở đầu file và ở `docs/stories/README.md`.
