# US25 · Chủ nhà thêm ảnh khi tạo căn

- Loại: tính năng
- Trạng thái: chưa làm
- Đặc tả: thô (lắp bằng máy từ bản Zalo, chưa viết lại theo khuôn; không code theo bản này, xem US41)
- Bản: 1
- Rủi ro: tb
- Làm sau khi xong: US1
- Kiểm tay: `tests/kich-ban/US25.md` (14 kịch bản)

## Mục tiêu
Là chủ nhà, tôi muốn thêm ảnh khi tạo căn, để sale mở link thấy căn trông thế nào.

## Hành vi
Bảng bước ghi: người dùng làm gì, app hiện gì (chữ trong ngoặc kép là chữ trên màn), máy chủ phải làm gì, dữ liệu nào đổi. Cột "Máy chủ" mô tả việc phải xảy ra; bản PWA làm bằng RLS, view và hàm `fn_*` của Supabase.

### Ảnh khi thêm căn
Rủi ro: tb
Màn hình: CN5-A1, CN5-A2, CN5-A3

Hành vi:
| Bước | Người dùng | App | Máy chủ | Ngoài app | Dữ liệu đổi |
|---|---|---|---|---|---|
| 1 | Bấm "Thêm ảnh" | Chọn nhiều ảnh cùng lúc ("Thêm ảnh · chọn nhiều ảnh cùng lúc") | Không gọi server | Mở chọn ảnh của Zalo (`chooseImage`); quyền ảnh do Zalo hỏi, từ chối thì theo HV4 | Không |
| 2 | Đang tải | CN5-A2: tiêu đề "ẢNH (5)", dòng "Đang tải 1 ảnh…", ảnh đang tải ghi "Đang tải 60%", dòng "Đang tải 1 ảnh. Chờ tải xong mới thêm được căn." | mỗi lần một ảnh, trả `anh_id` tạm, chưa gắn căn; nhận JPEG, PNG, HEIC tới 15 MB, đổi sang JPEG cạnh dài 1600 px, bỏ vị trí. Ảnh tạm không gắn căn sau 24 giờ thì server xóa | Không | Ảnh lưu vào thư mục ảnh trên máy production, đặt ở Việt Nam. Định dạng, kích thước, nén: CH-066 |
| 3 | Ảnh đầu tiên | Có nhãn "Ảnh đại diện". Dòng ghi "Ảnh đầu tiên là ảnh đại diện · Tối đa 12 ảnh" | Không gọi server | Không | Không |
| 4 | Ảnh tải lỗi | CN5-A3: ảnh ghi "Tải lỗi" kèm nút "Thử lại"; có thể bấm ✕ để xóa ảnh đó | báo lỗi theo, không lưu ảnh. với hơn 12 `anh_ids` thì `DU_LIEU_SAI` | Không | Không |

Theo quy tắc: Ảnh căn.

Trạng thái màn:
- rỗng: "Bạn có thể thêm sau"
- đang tải: CN5-A2
- lỗi mạng: theo HV2; ảnh tải lỗi xem CN5-A3
- không có quyền: theo HV5
- từ chối quyền: theo HV4
- quay lại từ nền: theo HV3
- mở từ link: không áp dụng

## Phần của story khác mà story này làm một lát
Bảng bước của các mục dưới đây nằm ở story chủ của mục đó. Story này chỉ làm các tiêu chí được liệt kê ở mục Tiêu chí nghiệm thu.

- mục "Danh sách căn" (US1) · Danh sách căn: bảng bước ở US1. Story này làm NT2.

## Tiêu chí nghiệm thu
Mỗi tiêu chí một test tự động mang đúng mã này trong tên test. Mã không đổi nghĩa; đổi hành vi thì cấp mã mới (docs/QUY_TRINH.md mục 5).

- **US25-NT1** Khi căn có ít hơn 6 ảnh, thì thẻ hiện gợi ý thêm ảnh.
- **US25-NT2** Khi còn ảnh đang tải, thì nút "Thêm căn" không dùng được và có dòng báo chờ tải xong.
- **US25-NT3** Khi một ảnh tải lỗi, thì ảnh đó có nút "Thử lại" và nút xóa, và căn không được thêm cho tới khi ảnh được thử lại hoặc xóa.
- **US25-NT4** Khi đã có 12 ảnh, thì không thêm được ảnh nữa. Theo quy tắc: Ảnh căn. `[đã có test database: t_07_can_gia_mo_rong.sql]`

## Luật kiểm dữ liệu và lỗi
Mỗi mục là một việc app nhờ database làm. "Đầu vào" là luật kiểm từng ô, "Lỗi riêng" là khi nào phải từ chối. Cột "Mã" là tên gọi trong tài liệu; hàm database báo lỗi bằng một câu tiếng Việt cho người dùng đọc (docs/luat-chung/Nghiep_vu.md mục Lỗi).

### Tải một ảnh ngay khi người dùng chọn, trả `anh_id` tạm chưa gắn căn
**Đầu vào**
| Trường | Kiểu | Bắt buộc | Luật kiểm |
|---|---|---|---|
| `tep` | tệp ảnh | có | JPEG, PNG hoặc HEIC, xét theo nội dung tệp chứ không theo tên; tới 15 MB. Đúng một tệp |

**Lỗi riêng**
| Mã | Khi nào |
|---|---|
| DU_LIEU_SAI | Không có tệp, quá 15 MB, hoặc không phải JPEG, PNG, HEIC. `o`: `tep` |
| QUA_NHIEU | Người gọi đang giữ quá 50 ảnh tạm chưa gắn (giới hạn kỹ thuật, chống đầy đĩa) |

## Ai được làm và việc kéo theo
Nguyên liệu chép từ đặc tả máy chủ của bản Zalo, đã đổi tên bảng và mã. Đối chiếu với hàm database ở mục Database khi viết lại story: chỗ nào lệch thì ghi vào "Database đang lệch story". Tên lỗi viết hoa (`KHONG_TIM_THAY`, `DU_LIEU_SAI`) là tên loại lỗi của bản cũ; bản PWA báo bằng câu tiếng Việt.

### Tải một ảnh ngay khi người dùng chọn, trả `anh_id` tạm chưa gắn căn
**Ai gọi:** người có tài khoản (không phải phiên tạm của mục. Ảnh tạm thuộc người tải; chỉ người đó gắn được vào căn của mình (PQ3.CHU, PQ14.SALE). Chưa đăng nhập: `CHUA_DANG_NHAP` (Luật chung 4). Phiên tạm: `CHUA_DANG_NHAP`.

**Việc kéo theo:** Không. Việc định kỳ xóa ảnh tạm quá 24 giờ chưa gắn:

**Chống bấm hai lần:** có. App giữ nguyên `Idempotency-Key` khi bấm "Thử lại" cho cùng một ảnh (mục "Ảnh khi thêm căn" (US25) bước 4).

## Luật chung dùng
Nguyên văn ở `docs/luat-chung/` (QT.md, HV.md, Nghiep_vu.md, Tu_dien.md), tìm theo mã hoặc tên.

Quy tắc trong nhóm Căn và giá: Ảnh căn. HV1, HV2, HV8.

## Màn hình
Hình: `python3 docs/thiet-ke/trich-man.py <mã màn>` (docs/thiet-ke/README.md). Chữ và số trên hình lệch story thì story đúng.

CN5-A1, CN5-A2, CN5-A3 (phần ảnh), thẻ căn ở CN5.

## Quyền
Ô quyền theo `docs/luat-chung/PQ.md`. Mỗi ô phải có test chứng minh người không có quyền thì không đọc, không ghi được; test ở lớp database (`tests/db/`).

Ô PQ chạm tới (ma trận `docs/luat-chung/PQ.md`): PQ3.CHU, PQ3.LINK. Test vi phạm phải có: chủ nhà A tải ảnh vào hay xóa ảnh của căn chủ nhà B; người chưa kết nối đọc ảnh qua đường dẫn trực tiếp.

## Database
Đã có trong `supabase/migrations/` và đã chạy test. Tham số và cột: `docs/tu-sinh/Bang_va_cot.md`.

Ảnh nằm ở Storage, bucket `anh-can` (riêng tư), đường dẫn `<user_id>/<tên file>`; bảng `anh_can` giữ thứ tự.

- `fn_dang_ky_anh`: test ở t_07_can_gia_mo_rong.sql
- `fn_gan_anh_can`: test ở t_07_can_gia_mo_rong.sql

## Ngoài phạm vi
- Đổi thứ tự ảnh, ảnh đại diện khi sửa căn (mục "Sửa thông tin căn" (US11)): US11.
- Gửi ảnh cho khách (mục "Gửi thông tin cho khách qua Zalo" (US14)): US14.

## Việc cần làm
- [ ] Đọc story này và các luật chung nó trỏ tới. Chỗ nào gắn thẻ MỞ thì không code, hỏi Tùng (docs/Cau_hoi_mo.md).
- [ ] Viết test cho từng tiêu chí chưa có test, test đỏ trước (lớp test: docs/QUY_TRINH.md mục 6).
- [ ] Database: soát các hàm ở mục Database với tiêu chí; thiếu thì thêm migration mới và một dòng trong `scripts/thu-lam-hong.sh`.
- [ ] Giao diện: các màn ở mục Màn hình, nối với Supabase (docs/Ghi_chu_code.md).
- [ ] E2E cho luồng chính của story.
- [ ] Kiểm tay theo `tests/kich-ban/US25.md` trên điện thoại thật.
- [ ] Đổi Trạng thái ở đầu file và ở `docs/stories/README.md` trong cùng PR.
