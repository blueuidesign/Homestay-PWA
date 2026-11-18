# US37 · Đăng nhập bản PWA

- Loại: kỹ thuật
- Trạng thái: chưa làm
- Bản: 1
- Rủi ro: cao
- Làm sau khi xong: US38

## Mục tiêu
Là người dùng, tôi muốn vào app mà không phải đăng ký rườm rà, và lần sau mở lại vẫn là tôi, để dữ liệu của tôi không lẫn với người khác.

## Chặn bởi
CH-001 (`docs/Cau_hoi_mo.md`): người dùng đăng nhập bằng gì (mã OTP qua SMS, mã qua email, hay Zalo trên web). Chưa có lời đáp thì chỉ làm được phần "Tạm cho staging" dưới đây. Câu trả lời quyết định luôn cách lấy số điện thoại (`docs/luat-chung/PWA.md` mục P1, P2) và ảnh hưởng story US5, US17, US21.

## Hành vi

### Tạm cho staging (làm được ngay)
| Bước | Người dùng | App | Database |
|---|---|---|---|
| 1 | Mở app khi app có cấu hình Supabase và chưa đăng nhập | Màn "Đăng nhập thử" với ô Email, ô Mật khẩu, nút "Đăng nhập". Dòng nhỏ: "Chỉ dùng cho bản thử." | Không |
| 2 | Nhập đúng, bấm "Đăng nhập" | Vào app. Chưa chọn vai thì sang màn chọn vai (A3), đã chọn thì vào tab Lịch | Supabase Auth cấp phiên; trigger `handle_new_user` tạo dòng `profiles` ở lần đầu |
| 3 | Nhập sai | "Email hoặc mật khẩu chưa đúng." Ở lại màn | Không |
| 4 | Mở lại app sau khi đóng | Vào thẳng app, không hỏi lại | Phiên lưu trên máy, tự làm mới |
| 5 | Bấm "Đăng xuất" ở tab Cá nhân | Về màn đăng nhập. Dữ liệu trong bộ nhớ app bị xóa | Phiên bị hủy |

Màn này chỉ hiện khi project Supabase bật đăng nhập bằng email và mật khẩu. Production không bật.

### Đăng nhập thật
Viết sau khi CH-001 có lời đáp: bảng bước, chữ trên màn, tiêu chí. Giữ các điều sau dù chọn cách nào (mục mục "Đăng nhập" (US1) ở story US1, `docs/luat-chung/HV.md` mục HV4): không bắt đăng ký tài khoản bằng form dài; không xin quyền gì khi vừa mở app; chỉ xin số điện thoại khi người dùng bấm việc cần số, có thẻ giải thích trước.

## Tiêu chí nghiệm thu
- **US37-NT1** Khi app có cấu hình Supabase và người dùng chưa đăng nhập, thì mở địa chỉ nào của app cũng về màn đăng nhập, trừ địa chỉ mở link mời (xem trước không cần đăng nhập, QD-008).
- **US37-NT2** Khi `hoa@home247.test` đăng nhập đúng mật khẩu ở staging, thì vào app và thấy căn 1509, 3402 của mình.
- **US37-NT3** Khi nhập sai mật khẩu, thì thấy "Email hoặc mật khẩu chưa đúng." và không vào app.
- **US37-NT4** Khi đã đăng nhập, đóng trình duyệt rồi mở lại, thì vẫn ở trong app.
- **US37-NT5** Khi bấm "Đăng xuất", thì về màn đăng nhập, và bấm nút quay lại của trình duyệt không thấy lại dữ liệu cũ.
- **US37-NT6** Khi app không có cấu hình Supabase, thì không có màn đăng nhập và app chạy chế độ thử như cũ.
- **US37-NT7** Khi một người mở link mời lúc chưa đăng nhập rồi đăng nhập, thì quay lại đúng màn "Thêm lịch" của link đó (mục mục "Mở app từ link mời của chủ nhà" (US6) ở story US6).

## Quyền
PQ1, PQ2 (`docs/luat-chung/PQ.md`): mỗi người chỉ sửa hồ sơ của mình. Đã có test ở `tests/db/t_01_phan_quyen.sql`.

## Database
Đã có: bảng `profiles`, trigger tạo hồ sơ khi có người dùng mới, `fn_cap_nhat_ho_so`. Không cần migration mới cho phần staging.

## Ngoài phạm vi
- Chọn vai, tạo căn đầu tiên: US1.
- Tên, số điện thoại, ảnh đại diện: US5, US21.
- Xóa tài khoản: US22 (cách bấm xóa trên PWA: CH-007).
- Đăng nhập cho trang quản trị: US34.

## Việc cần làm
- [ ] Hỏi Tùng CH-001. Có lời đáp thì ghi QD, viết phần "Đăng nhập thật" vào story này trước khi code.
- [ ] Viết test cho US37-NT1 đến NT7 (unit cho điều hướng, E2E trên staging cho NT2 đến NT5).
- [ ] Màn đăng nhập thử, giữ phiên, đăng xuất (`src/services/supabase.ts` đã có kết nối).
- [ ] Bỏ `.fixme` ở `tests/e2e/10_chu_ghi_dat_phong.spec.ts` khi US3 đã nối Supabase.
- [ ] Viết kịch bản kiểm tay (tests/kich-ban/US37.md), kiểm trên điện thoại thật.
- [ ] Đổi Trạng thái ở đầu file và ở `docs/stories/README.md`.
