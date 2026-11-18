# US23 · Quản trị: dải ngày lễ

- Loại: tính năng
- Trạng thái: chờ code
- Đặc tả: thô (lắp bằng máy từ bản Zalo, chưa viết lại theo khuôn; không code theo bản này, xem US41)
- Bản: sau
- Rủi ro: tb
- Làm sau khi xong: US22, US34
- Kiểm tay: `tests/kich-ban/US23.md` (4 kịch bản)

## Mục tiêu
Là quản trị viên Home247, tôi muốn xem, thêm, sửa, xóa dải ngày lễ từng năm trên web, để chủ nhà chọn nhanh đúng ngày nghỉ (mục "Giá ngày lễ và dịp đặc biệt" (US8)) mà không phải nhờ dev chạy script ([]).

Theo lệnh Tùng ngày 02/11: xếp cuối backlog, sau khi các chức năng app xong giai đoạn code (US22 là US app cuối trước phát hành), và chỉ bắt đầu khi Tùng đã review nhóm Quản trị Home247 trên web và có thiết kế.

Phạm vi thu hẹp ngày 02/11: chỉ dải ngày lễ (mục "Quản trị dải ngày lễ hằng năm"). Tra cứu tài khoản khi người dùng nhờ hỗ trợ chưa có yêu cầu; khi nhóm Quản trị Home247 trên web có mục đó thì tạo US mới.

## Hành vi
Bảng bước ghi: người dùng làm gì, app hiện gì (chữ trong ngoặc kép là chữ trên màn), máy chủ phải làm gì, dữ liệu nào đổi. Cột "Máy chủ" mô tả việc phải xảy ra; bản PWA làm bằng RLS, view và hàm `fn_*` của Supabase.

### Quản trị dải ngày lễ hằng năm
Rủi ro: tb
Mục đích: Home247 đặt sẵn dải nghỉ của từng dịp lễ mỗi năm (gồm nghỉ bù, nối cuối tuần), để chủ nhà không phải tự nhập ngày (mục "Giá ngày lễ và dịp đặc biệt" (US8)). Tết Âm lịch đổi ngày mỗi năm, nên cần người nhập và sửa hằng năm.
Màn hình: chưa thiết kế
Dùng quy tắc: Dải ngày lễ do Home247 đặt (nhóm Căn và giá, mục Quy tắc nghiệp vụ phát hiện; chưa có mã QT)
Khi nào xảy ra: người quản trị mở web quản trị để nhập dải ngày lễ cho năm mới, hoặc sửa khi lịch nghỉ chính thức thay đổi.
Nguồn dữ liệu: bản đầu chưa có web quản trị, dải ngày lễ nạp bằng script. Khi có web quản trị, người quản trị nhập và sửa theo mục này. Dữ liệu này là nguồn của hàng "Chọn nhanh ngày lễ" ở mục "Giá ngày lễ và dịp đặc biệt" (US8).

| Bước | Người dùng | App | Máy chủ | Ngoài app | Dữ liệu đổi |
|---|---|---|---|---|---|
| 1 | Người quản trị vào web quản trị, nhập email, nhận mã qua email, nhập mã (mục "Thêm người đồng quản trị" (US34)) | Không áp dụng | Email có vai ADMIN thì gửi mã tới email đó; kiểm mã đúng và còn hạn thì mở phiên quản trị | Không áp dụng | Phiên quản trị |
| 2 | Chọn năm | Danh sách dải ngày lễ của năm: tên dịp, ngày đầu, ngày cuối, số ngày | Trả các dải của năm đó | Không áp dụng | Không |
| 3 | Thêm một dải | Ô tên dịp, ngày đầu, ngày cuối | Lưu dải | Không áp dụng | Thêm một dải ngày lễ của năm |
| 4 | Sửa một dải | Mở dải với các ô đã điền | Lưu dải | Không áp dụng | Dải đổi ngày hoặc tên |
| 5 | Xóa một dải | ? | Xóa dải | Không áp dụng | Bỏ một dải |
| 6 | (Chủ nhà mở mục "Giá ngày lễ và dịp đặc biệt" (US8) trên app) | Không thuộc web quản trị | Trả các dải của năm chủ nhà đang chọn, theo dữ liệu mới nhất | Không áp dụng | Không |

Trạng thái màn:
- rỗng: năm chưa có dải nào: chưa thiết kế
- đang tải: chưa thiết kế. HV1 viết cho app
- lỗi mạng: chưa thiết kế. HV2 viết cho app
- không có quyền: email không có vai ADMIN: không gửi mã, không vào được web quản trị, màn chưa thiết kế
- từ chối quyền: không áp dụng
- quay lại từ nền: không áp dụng
- mở từ link: ?

## Tiêu chí nghiệm thu
Mỗi tiêu chí một test tự động mang đúng mã này trong tên test. Mã không đổi nghĩa; đổi hành vi thì cấp mã mới (docs/QUY_TRINH.md mục 5).

- **US23-NT1** Khi người quản trị chọn một năm, thì thấy mọi dải ngày lễ của năm đó, mỗi dải có tên dịp, ngày đầu và ngày cuối.
- **US23-NT2** Khi người quản trị thêm hoặc sửa một dải của một năm và lưu, thì chủ nhà mở mục "Giá ngày lễ và dịp đặc biệt" (US8) cho năm đó và chạm dịp ấy thấy dải mới (US8-NT1).
- **US23-NT3** Khi người quản trị xóa một dải, thì dịp đó không còn trong hàng "Chọn nhanh ngày lễ" của mục "Giá ngày lễ và dịp đặc biệt" (US8) cho năm đó.
- **US23-NT4** Khi người không có vai ADMIN gọi server để thêm, sửa hay xóa dải ngày lễ, thì server từ chối và dữ liệu không đổi.

## Luật kiểm dữ liệu và lỗi
Mỗi mục là một việc app nhờ database làm. "Đầu vào" là luật kiểm từng ô, "Lỗi riêng" là khi nào phải từ chối. Cột "Mã" là tên gọi trong tài liệu; hàm database báo lỗi bằng một câu tiếng Việt cho người dùng đọc (docs/luat-chung/Nghiep_vu.md mục Lỗi).

### Người quản trị xem mọi dải ngày lễ của một năm
**Đầu vào**
| Trường | Kiểu | Bắt buộc | Luật kiểm |
|---|---|---|---|
| nam | số nguyên | Có | 2000 đến 2100 |

**Lỗi riêng**
| Mã | Khi nào |
|---|---|
| DU_LIEU_SAI | Thiếu `nam` hay sai dạng |

### Người quản trị thêm một dải ngày lễ cho một năm
**Đầu vào**
| Trường | Kiểu | Bắt buộc | Luật kiểm |
|---|---|---|---|
| nam | số nguyên | Có | 2000 đến 2100. `tu_ngay` hoặc `den_ngay` nằm trong năm này |
| ten | chuỗi | Có | 1 đến 80 ký tự |
| tu_ngay, den_ngay | ngay | Có | `den_ngay` không trước `tu_ngay`. Giới hạn 10 ngày có áp không: [MỞ: CH-036] |
Hai dải ngày lễ của cùng năm chồng ngày có được không: [MỞ: US23-H1] nguồn không nói; Thiet_ke_DB `ngay_le` không có ràng buộc.

**Lỗi riêng**
| Mã | Khi nào |
|---|---|
| DU_LIEU_SAI | Thiếu trường, tên trống hay quá dài, ngày đảo, ngày ngoài `nam` |

### Người quản trị sửa tên hay ngày của một dải
**Đầu vào**
| Trường | Kiểu | Bắt buộc | Luật kiểm |
|---|---|---|---|
| id | id | Có | Dòng `ngay_le` có thật |
| ten | chuỗi | Không | Như `POST` |
| tu_ngay, den_ngay | ngay | Không | Kiểm trên dải sau khi sửa, như `POST` |
Dải `gia_dip` chủ nhà đã lưu từ dải này (`ngay_le_id`) giữ ngày cũ hay đổi theo, có báo chủ nhà không: [MỞ: CH-035]. Tới khi có câu trả lời, API không đổi `gia_dip`.

**Lỗi riêng**
| Mã | Khi nào |
|---|---|
| KHONG_TIM_THAY | Dải không có |
| DU_LIEU_SAI | Thân rỗng; dải sau khi sửa đảo ngày hay ra ngoài `nam` |

### Người quản trị xóa một dải
**Đầu vào**
| Trường | Kiểu | Bắt buộc | Luật kiểm |
|---|---|---|---|
| id | id | Có | Dòng `ngay_le` có thật |

**Lỗi riêng**
| Mã | Khi nào |
|---|---|
| KHONG_TIM_THAY | Dải không có |

## Ai được làm và việc kéo theo
Nguyên liệu chép từ đặc tả máy chủ của bản Zalo, đã đổi tên bảng và mã. Đối chiếu với hàm database ở mục Database khi viết lại story: chỗ nào lệch thì ghi vào "Database đang lệch story". Tên lỗi viết hoa (`KHONG_TIM_THAY`, `DU_LIEU_SAI`) là tên loại lỗi của bản cũ; bản PWA báo bằng câu tiếng Việt.

### Người quản trị xem mọi dải ngày lễ của một năm
**Ai gọi:** ADMIN (PQ21.ADMIN). Vai khác: từ chối [MỞ: US23-H2] mã lỗi.

**Việc kéo theo:** Không.

**Chống bấm hai lần:** không cần (đọc).

### Người quản trị thêm một dải ngày lễ cho một năm
**Ai gọi:** ADMIN (PQ21.ADMIN). Vai khác: từ chối [MỞ: US23-H3] mã lỗi.

**Việc kéo theo:** Không có thông báo. Chủ nhà mở mục "Giá ngày lễ và dịp đặc biệt" (US8) thấy dải mới (US23-NT2).

**Chống bấm hai lần:** có.

### Người quản trị sửa tên hay ngày của một dải
**Ai gọi:** ADMIN (PQ21.ADMIN). Vai khác: từ chối [MỞ: US23-H4] mã lỗi.

**Việc kéo theo:** Không có thông báo [MỞ: CH-035].

**Chống bấm hai lần:** có.

### Người quản trị xóa một dải
**Ai gọi:** ADMIN (PQ21.ADMIN). Vai khác: từ chối [MỞ: US23-H5] mã lỗi.

**Việc kéo theo:** Không có thông báo [MỞ: CH-035].

**Chống bấm hai lần:** có.

## Luật chung dùng
Nguyên văn ở `docs/luat-chung/` (QT.md, HV.md, Nghiep_vu.md, Tu_dien.md), tìm theo mã hoặc tên.

Quy tắc "Dải ngày lễ do Home247 đặt" trong nhóm Căn và giá (mục Quy tắc nghiệp vụ phát hiện), chưa có mã QT. Không dùng HV: HV1, HV2 viết cho app, trạng thái đang tải, lỗi mạng, không có quyền của web quản trị chờ [MỞ: US23-H6]; [MỞ: US23-H7] đã trả lời ở mục "Thêm người đồng quản trị" (US34).

## Màn hình
Hình: `python3 docs/thiet-ke/trich-man.py <mã màn>` (docs/thiet-ke/README.md). Chữ và số trên hình lệch story thì story đúng.

Chưa thiết kế. Màn bên app để kiểm kết quả: mục "Giá ngày lễ và dịp đặc biệt" (US8) (hàng "Chọn nhanh ngày lễ"), thuộc US8.

## Quyền
Ô quyền theo `docs/luat-chung/PQ.md`. Mỗi ô phải có test chứng minh người không có quyền thì không đọc, không ghi được; test ở lớp database (`tests/db/`).

Ô PQ chạm tới (ma trận `docs/luat-chung/PQ.md`): PQ21.ADMIN (xem, thêm, sửa, xóa dải). Ô khác của PQ21 cần test vi phạm vì cùng đường API: PQ21.CHU (chỉ xem trong "Chọn nhanh ngày lễ", không sửa dải chung), PQ21.SALE ([MỞ: US23-H8] PQ21.SALE ghi "?", nhóm Quản trị Home247 trên web Ai thấy gì), PQ21.LINK, không có phiên.
Test vi phạm phải có (US23-NT4): Chị Hoa (CHU) gọi,,: từ chối, `ngay_le` không đổi; sale Hùng gọi cùng bốn API: từ chối; gọi không có phiên: từ chối. Mã lỗi [MỞ: US23-H9].

## Database
Đã có trong `supabase/migrations/` và đã chạy test. Tham số và cột: `docs/tu-sinh/Bang_va_cot.md`.

- `fn_qt_luu_ngay_le`: test ở t_11_ket_noi_quan_tri.sql
- `fn_qt_xoa_ngay_le`: CHƯA có test, viết test trước khi dùng

## Ngoài phạm vi
- Đăng nhập web quản trị bằng mã email, ai là ADMIN, thêm và gỡ người đồng quản trị (mục "Thêm người đồng quản trị" (US34), mục "Thêm người đồng quản trị" (US34)): US34. US này dùng lại phiên quản trị của US34.
- Chủ nhà chạm dịp và thấy dải trên app (US8-NT1, mục "Quản trị dải ngày lễ hằng năm" bước 6): US8. US này chỉ kiểm kết quả đó khi quản trị đổi dải.
- Danh sách tòa nhà trên web quản trị (mục "Quản trị danh sách tòa nhà" (US29)): US29.
- Nạp dải ngày lễ bằng script: [].
- Tra cứu tài khoản khi hỗ trợ: chưa có yêu cầu.
- Bản web cho chủ nhà: US24.
- Duyệt hai bước, ghi ai sửa dải nào, dịp cố định hay thêm được dịp mới, giới hạn 10 ngày cho dải quản trị nhập, sửa hay xóa dải sau khi chủ nhà đã đặt giá theo dải, năm chưa có dải: [MỞ: US23-H10].

## Việc cần làm
- [ ] Đọc story này và các luật chung nó trỏ tới. Chỗ nào gắn thẻ MỞ thì không code, hỏi Tùng (docs/Cau_hoi_mo.md).
- [ ] Viết test cho từng tiêu chí chưa có test, test đỏ trước (lớp test: docs/QUY_TRINH.md mục 6).
- [ ] Database: soát các hàm ở mục Database với tiêu chí; thiếu thì thêm migration mới và một dòng trong `scripts/thu-lam-hong.sh`.
- [ ] Giao diện: các màn ở mục Màn hình, nối với Supabase (docs/Ghi_chu_code.md).
- [ ] E2E cho luồng chính của story.
- [ ] Kiểm tay theo `tests/kich-ban/US23.md` trên điện thoại thật.
- [ ] Đổi Trạng thái ở đầu file và ở `docs/stories/README.md` trong cùng PR.
