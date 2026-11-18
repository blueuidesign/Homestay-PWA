# US11 · Chủ nhà sửa căn, tòa nhà dùng chung, ngày tính giá cuối tuần

- Loại: tính năng
- Trạng thái: chưa làm
- Bản: 1
- Rủi ro: cao
- Làm sau khi xong: US1, US3, US4
- Kiểm tay: `tests/kich-ban/US11.md` (26 kịch bản)

## Mục tiêu
Là chủ nhà, tôi muốn thêm thông tin căn (tòa nhà, view, số giường, mô tả), sửa căn đã có và chọn những đêm tính giá cuối tuần, để sale gửi khách đủ thông tin và giá đúng đêm.

## Hành vi
Bảng bước ghi: người dùng làm gì, app hiện gì (chữ trong ngoặc kép là chữ trên màn), máy chủ phải làm gì, dữ liệu nào đổi. Cột "Máy chủ" mô tả việc phải xảy ra; bản PWA làm bằng RLS, view và hàm `fn_*` của Supabase.

### Tòa nhà, loại view, số giường, mô tả
Rủi ro: tb
Màn hình: CN5-A1, CN5-A1b

Hành vi:
| Bước | Người dùng | App | Máy chủ | Ngoài app | Dữ liệu đổi |
|---|---|---|---|---|---|
| 1 | Bấm "Thêm tòa nhà, mô tả gửi khách, view..." | Mở rộng thêm: hàng chip "Tòa nhà" (ICON40, À La Carte, Sapphire, "+ Tòa khác"), hàng chip "Loại view" (theo danh sách Loại view ở `Tu_dien.md`), một ô số "Số giường" (không bắt buộc, theo `Tu_dien.md`), ô "Mô tả gửi khách" ("Sale dùng đoạn này khi gửi thông tin căn cho khách."), nút "Thu gọn" | không `q`: tòa người gọi đã dùng, rồi tòa Home247 đặt sẵn, cho hàng chip | Không | Số giường của căn |
| 2 | Chọn "+ Tòa khác" | CN5-A1b: ô "Tên tòa nhà", danh sách tòa có sẵn (tên và khu vực), dòng "+ Thêm tòa mới <chữ đã gõ>", ghi chú "Chọn tòa có sẵn để sale lọc đúng tòa. Không thấy thì thêm tòa mới." Danh sách gồm tòa Home247 đặt sẵn (mục "Quản trị danh sách tòa nhà" (US29)) và tòa mọi người dùng đã thêm | Trả danh sách tòa dùng chung cho mọi người | Không | Không |
| 3 | Chọn một tòa trong danh sách hoặc thêm tòa mới | Tòa được chọn gắn vào căn | Thêm tòa mới vào danh sách chung, không cần duyệt | Không | Gắn tòa vào căn; thêm tòa mới thì tòa đó hiện cho mọi người chọn. Theo quy tắc: Tòa nhà dùng chung |

Trạng thái màn:
- rỗng: phần này thu gọn mặc định và không bắt buộc
- đang tải: theo HV1
- lỗi mạng: theo HV2
- không có quyền: theo HV5
- từ chối quyền: không áp dụng
- quay lại từ nền: theo HV3
- mở từ link: không áp dụng

### Sửa thông tin căn
Rủi ro: tb
Mục đích: chủ nhà đổi thông tin, ảnh, thứ tự ảnh của một căn đã có.
Màn hình: CN5-02
Khi nào xảy ra: chủ nhà chạm một căn trong danh sách (cách vào chưa nối trong canvas, ?).

Hành vi:
| Bước | Người dùng | App | Máy chủ | Ngoài app | Dữ liệu đổi |
|---|---|---|---|---|---|
| 1 | Mở sửa căn | Tiêu đề "Sửa phòng 1509", hai tab "Thông tin" và "Giá". Tab Thông tin điền sẵn: mã căn, số phòng ngủ, ảnh, tòa nhà, loại view, số giường, mô tả gửi khách. Loại view theo `Tu_dien.md`, số giường theo `Tu_dien.md` | mọi trường và ảnh theo thứ tự | Không | Không |
| 2 | Bấm "Đổi thứ tự" ở mục ảnh | Chuyển chế độ đổi thứ tự ảnh. Ảnh số 1 là ảnh đại diện | Không gọi server | Không | Không |
| 3 | Bấm ✕ trên một ảnh | Xóa ảnh đó (có hỏi lại hay không: chưa vẽ, ?) | Không gọi server ngay. Lưu ở bước 5: nhận `anh_ids` còn lại | Không | Lưu ở bước 5: ảnh đó không còn gắn căn |
| 4 | Bấm "Thêm ảnh" | Như mục "Ảnh khi thêm căn" (US25) | trả `anh_id` tạm, gắn vào căn khi ở bước 5; hơn 12 `anh_ids` thì `DU_LIEU_SAI` | Không | Thêm một ảnh tạm vào thư mục ảnh, chưa gắn căn (bảng `anh_tam` hoặc `anh_can.can_id` trống, |
| 5 | Bấm "Lưu thay đổi" | Lưu và về danh sách căn CN5 | sửa căn, nhận `anh_ids` theo thứ tự, ảnh số 1 là ảnh đại diện; mã trùng thì `MA_CAN_TRUNG` | Không | Cập nhật thông tin căn |
| 6 | Bấm tab "Giá" | Mở tab Giá của căn, xem mục "Đặt giá theo tháng" (US4) | Không gọi server | Không | Không |

Theo quy tắc: Căn tối thiểu; Mã căn không trùng; Ảnh căn.

Trạng thái màn:
- rỗng: không áp dụng
- đang tải: theo HV1
- lỗi mạng: theo HV2
- không có quyền: theo HV5
- từ chối quyền: theo HV4
- quay lại từ nền: theo HV3
- mở từ link: không áp dụng

### Ngày tính giá cuối tuần
Rủi ro: cao
Mục đích: chủ nhà chọn những đêm nào tính giá cuối tuần, áp dụng cho mọi căn.
Màn hình: P6
Khi nào xảy ra: chủ nhà vào Cá nhân > "Ngày tính giá cuối tuần".

Hành vi:
| Bước | Người dùng | App | Máy chủ | Ngoài app | Dữ liệu đổi |
|---|---|---|---|---|---|
| 1 | Mở màn | "Chọn những đêm tính giá cuối tuần. Các đêm còn lại tính giá ngày thường." và hàng chip "Đêm cuối tuần" theo thứ | đêm cuối tuần | Không | Không |
| 2 | Chọn các thứ | Ghi chú "Tính theo đêm ở. VD: nhận phòng T6, trả phòng CN là 2 đêm cuối tuần." | Không gọi server | Không | Không |
| 3 | Xem mẫu | Mục "Một tuần của phòng 1509" hiện giá từng ngày; ô xanh là giá cuối tuần. Ghi chú "Tên ô giá ở mục Giá của căn đổi theo lựa chọn này." | | Không | Không |
| 4 | Bấm "Lưu thay đổi" | Lưu. Kết quả chưa vẽ (?) | đổi đêm cuối tuần | Không | Tập các thứ tính giá cuối tuần của tài khoản |

Theo quy tắc: Giá hai loại đêm.

Trạng thái màn:
- rỗng: không áp dụng
- đang tải: theo HV1
- lỗi mạng: theo HV2
- không có quyền: theo HV5
- từ chối quyền: không áp dụng
- quay lại từ nền: theo HV3
- mở từ link: không áp dụng

## Phần của story khác mà story này làm một lát
Bảng bước của các mục dưới đây nằm ở story chủ của mục đó. Story này chỉ làm các tiêu chí được liệt kê ở mục Tiêu chí nghiệm thu.

- mục "Danh sách căn" (US1) · Danh sách căn: bảng bước ở US1. Story này làm NT5.

## Tiêu chí nghiệm thu
Mỗi tiêu chí một test tự động mang đúng mã này trong tên test. Mã không đổi nghĩa; đổi hành vi thì cấp mã mới (docs/QUY_TRINH.md mục 5).

- **US11-NT1** Khi chủ nhà đã nhập số giường của căn, thì thẻ căn ghi số phòng ngủ và số giường theo `Tu_dien.md`, mục Phòng ngủ và số giường của căn (ví dụ "2PN · 3 giường").
- **US11-NT2** Khi chủ nhà không mở phần này, thì vẫn thêm được căn.
- **US11-NT3** Khi chủ nhà gõ "Green" vào ô tên tòa, thì thấy các tòa có tên chứa "Green" và dòng thêm tòa mới.
- **US11-NT4** Khi chủ nhà mở hàng chip "Loại view", thì thấy đúng các lựa chọn của danh sách Loại view trong `Tu_dien.md` và không có "Vịnh".
- **US11-NT5** Khi chủ nhà nhập số giường rồi thêm căn, thì thẻ căn ở CN5 ghi số phòng ngủ và số giường như US11-NT1.
- **US11-NT6** Khi chủ nhà bỏ trống ô số giường, thì vẫn thêm được căn và dòng "Còn thiếu" không nhắc số giường. Theo quy tắc: Căn tối thiểu.
- **US11-NT7** Khi một người dùng thêm tòa mới ở CN5-A1b, thì người dùng khác mở CN5-A1b thấy tòa đó trong danh sách tòa có sẵn. Theo quy tắc: Tòa nhà dùng chung.
- **US11-NT8** Khi chủ nhà mở sửa một căn, thì các ô hiện đúng giá trị hiện có của căn.
- **US11-NT9** Khi chủ nhà đổi thứ tự ảnh và lưu, thì ảnh số 1 trở thành ảnh đại diện. `[đã có test database: t_07_can_gia_mo_rong.sql]`
- **US11-NT10** Khi chủ nhà đổi mã căn thành mã của căn khác đã có, thì hiện lỗi trùng mã và không lưu.
- **US11-NT11** Khi chủ nhà sửa số giường rồi lưu, thì thẻ căn ở CN5 ghi số giường mới; xóa trống ô thì thẻ chỉ ghi số phòng ngủ.
- **US11-NT12** Khi chủ nhà chọn T6 và T7 rồi lưu, thì ô giá ở tab Giá ghi "Cuối tuần (T6, T7)".
- **US11-NT13** Khi chủ nhà chọn T7 và CN rồi lưu, thì ô giá ở tab Giá ghi tên theo hai thứ đó và ô "Ngày thường" ghi các thứ còn lại.
- **US11-NT14** Khi khách nhận phòng T6 và trả phòng CN, thì hai đêm đều tính giá cuối tuần với lựa chọn T6, T7.

## Luật kiểm dữ liệu và lỗi
Mỗi mục là một việc app nhờ database làm. "Đầu vào" là luật kiểm từng ô, "Lỗi riêng" là khi nào phải từ chối. Cột "Mã" là tên gọi trong tài liệu; hàm database báo lỗi bằng một câu tiếng Việt cho người dùng đọc (docs/luat-chung/Nghiep_vu.md mục Lỗi).

### Chi tiết một căn của mình, mọi trường và ảnh theo thứ tự
**Đầu vào**
| Trường | Kiểu | Bắt buộc | Luật kiểm |
|---|---|---|---|
| `id` | id | có | |

**Lỗi riêng**
| Mã | Khi nào |
|---|---|
| KHONG_TIM_THAY | Căn không có, đã ẩn, đã xóa, hoặc người gọi không phải CHU hay sale tạo căn tự nhập |

### Sửa thông tin căn và thay danh sách ảnh
**Đầu vào** (thân dữ liệu trả về, chỉ gửi trường muốn đổi)
| Trường | Kiểu | Bắt buộc | Luật kiểm |
|---|---|---|---|
| `id` | id | có | |
| `ma_can` | chuỗi | không | Như. Không trùng căn chưa ẩn khác của cùng người giữ |
| `so_phong_ngu` | số 0 đến 4 | không | Không nhận null (Căn tối thiểu) |
| `so_giuong` | số 1 đến 50 hoặc null | không | null là xóa trống (US11-NT11) |
| `loai_view` | như | không | |
| `toa_nha_id` | id hoặc null | không | |
| `mo_ta_gui_khach` | chuỗi hoặc null | không | Tối đa 2.000 ký tự |
| `anh_ids` | mảng id | không | Có trường này thì là danh sách ảnh mới đầy đủ theo thứ tự, kể cả mảng rỗng. Tối đa 12, không trùng. Mỗi id là ảnh đang gắn căn này hoặc ảnh tạm của người gọi chưa gắn. Không có trường thì ảnh giữ nguyên |
| `ten_chu_can` | chuỗi 1 đến 100 ký tự | không; cấm với `co_lich` | Không nhận null |
| `sdt_chu_can` | chuỗi như, hoặc null | không; cấm với `co_lich` | null là xóa số (QD-011, US16-NT27) |
| `gia_chu_thuong`, `gia_chu_cuoi_tuan` | tien hoặc null | không; cấm với `co_lich` | |

**Lỗi riêng**
| Mã | Khi nào |
|---|---|
| KHONG_TIM_THAY | Như |
| DU_LIEU_SAI | Sai kiểu, quá giới hạn, null ở `ma_can`, `so_phong_ngu`, `ten_chu_can`; trường căn tự nhập trên căn có lịch; gửi `loai`; quá 12 `anh_ids`; `anh_id` không phải ảnh của căn này hay ảnh tạm của người gọi. Kèm `o` |
| MA_CAN_TRUNG | `ma_can` mới trùng căn chưa ẩn khác của cùng người giữ (US11-NT10) |

### Tìm tòa theo chữ gõ, hoặc lấy danh sách tòa cho hàng chip
**Đầu vào**
| Trường | Kiểu | Bắt buộc | Luật kiểm |
|---|---|---|---|
| `q` | chuỗi 1 đến 50 ký tự | không | Bỏ khoảng trắng đầu cuối. So khớp "tên chứa chữ gõ", không phân biệt hoa thường và dấu tiếng Việt |
| `gioi_han` | số 1 đến 50 | không, mặc định 20 | |

**Lỗi riêng**
| Mã | Khi nào |
|---|---|
| DU_LIEU_SAI | `q` dài quá 50 ký tự, `gioi_han` ngoài 1 đến 50. Kèm `o` |

### Thêm một tòa mới vào danh sách chung, không cần duyệt
**Đầu vào** (thân dữ liệu trả về)
| Trường | Kiểu | Bắt buộc | Luật kiểm |
|---|---|---|---|
| `ten` | chuỗi 1 đến 100 ký tự | có | Bỏ khoảng trắng đầu cuối, gộp khoảng trắng liền nhau |
| `khu_vuc` | chuỗi 1 đến 100 ký tự hoặc null | không | Người dùng nhập khu vực thế nào: [MỞ: US11-H1]. Server nhận nếu app gửi |

**Lỗi riêng**
| Mã | Khi nào |
|---|---|
| DU_LIEU_SAI | Thiếu `ten`, quá dài. Kèm `o` |

## Luật chung dùng
Nguyên văn ở `docs/luat-chung/` (QT.md, HV.md, Nghiep_vu.md, Tu_dien.md), tìm theo mã hoặc tên.

Quy tắc trong nhóm Căn và giá: Căn tối thiểu, Mã căn không trùng, Ảnh căn, Tòa nhà dùng chung, Giá hai loại đêm. Glossary: Phòng ngủ và số giường của căn, Danh sách lựa chọn dùng chung (Loại view). QT4.1 (tiền phòng điền sẵn theo đêm cuối tuần). HV1 đến HV5.

## Màn hình
Hình: `python3 docs/thiet-ke/trich-man.py <mã màn>` (docs/thiet-ke/README.md). Chữ và số trên hình lệch story thì story đúng.

CN5 (thẻ căn: số phòng ngủ, số giường), CN5-A1 (phần mở rộng), CN5-A1b, CN5-02, P6. Tab Giá của CN6 (tên hai ô giá) và CN4 (dòng tách tiền theo đêm) chỉ để xem kết quả của P6.

**CN5-02 · Sửa thông tin căn**
Vào từ: CN5, chạm căn, tab Thông tin
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Tab | "Thông tin" đang chọn, "Giá" | |
| 2 | Mã căn, số phòng ngủ, ảnh | Như CN5-A1, điền sẵn | Căn |
| 3 | Loại view | Chip theo `Tu_dien.md`, mục Danh sách lựa chọn dùng chung | Căn |
| 4 | Số giường | Ô số "Số giường", không bắt buộc | Căn |
| 5 | Nút | "Lưu thay đổi" | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| "Lưu thay đổi" | Lưu | CN5 |

**P6 · Ngày tính giá cuối tuần**
Vào từ: P1, "Ngày tính giá cuối tuần"
| # | Thành phần | Nội dung | Dữ liệu lấy từ |
|---|---|---|---|
| 1 | Đêm cuối tuần | Chip T2 đến CN, T6 và T7 đang chọn | Cài đặt |
| 2 | Gợi ý | "Tính theo đêm ở. VD: nhận phòng T6, trả phòng CN là 2 đêm cuối tuần." | Cố định |
| 3 | Một tuần của phòng 1509 | T2–T5 "900k", T6 "1.300k", T7 "1.300k", CN "900k" | DLM.3 |
| 4 | Nút | "Lưu thay đổi" | |
| Bấm gì | Kết quả | Sang màn |
|---|---|---|
| Một chip | Bật, tắt đêm cuối tuần; tuần mẫu đổi theo | P6 |
| "Lưu thay đổi" | Lưu | P1 |
Trạng thái riêng:
- rỗng: chưa thiết kế
- đang tải: chưa thiết kế (HV1)
- lỗi mạng: chưa thiết kế (HV2)
- quay lại từ nền: chưa thiết kế (HV3)

## Quyền
Ô quyền theo `docs/luat-chung/PQ.md`. Mỗi ô phải có test chứng minh người không có quyền thì không đọc, không ghi được; test ở lớp database (`tests/db/`).

Ô PQ chạm tới (ma trận `docs/luat-chung/PQ.md`): PQ3.CHU, PQ3.SALE, PQ6.CHU. Test vi phạm phải có:
- PQ3.CHU: chủ nhà A sửa căn của chủ nhà B bằng (`KHONG_TIM_THAY`, căn B không đổi); chủ nhà A đọc căn của B; chủ nhà A gắn ảnh tạm của B vào căn của mình bằng `anh_ids`.
- PQ3.SALE: Sale Hùng sửa 1509: `KHONG_TIM_THAY`, căn không đổi.
- PQ6.CHU: sale hay chủ nhà khác đổi đêm cuối tuần chỉ đổi của chính mình, đêm cuối tuần của Chị Hoa không đổi.
- Không có phiên: `CHUA_DANG_NHAP`.
- Tòa nhà: gọi thẳng không sửa được tòa có sẵn hay đặt tòa của Home247 thành của người dùng.

## Database
Đã có trong `supabase/migrations/` và đã chạy test. Tham số và cột: `docs/tu-sinh/Bang_va_cot.md`.

- `fn_sua_can`: test ở t_07_can_gia_mo_rong.sql
- `fn_them_toa_nha`: CHƯA có test, viết test trước khi dùng
- `fn_cap_nhat_ho_so`: test ở t_02_gia.sql, t_11_ket_noi_quan_tri.sql
- `fn_gan_anh_can`: test ở t_07_can_gia_mo_rong.sql

## Ngoài phạm vi
- Ảnh khi thêm căn (mục "Ảnh khi thêm căn" (US25)) và US25-NT1: US25.
- Các NT còn lại của mục "Danh sách căn" (US1): NT1, NT6, NT7 ở US1; NT3, NT4 ở US4.
- Thêm căn, mã căn trùng (mục "Thêm căn" (US1)): US1.
- Chủ nhà mới thấy ba tòa quản trị đặt sẵn (US29-NT1) và trang quản trị danh sách tòa (mục "Quản trị danh sách tòa nhà" (US29)): US29.
- Giá theo tháng trên tab Giá (mục "Đặt giá theo tháng" (US4)): US4.
- Xóa căn (mục "Xóa căn" (US27)): US27.
- Khu vực của tòa người dùng thêm: [MỞ: US11-H2] (CH-065 đã trả lời). Loại view chọn nhiều loại: [MỞ: CH-018], kịch bản chỉ chọn một loại.
- Bỏ chọn hết các thứ ở P6: [MỞ: US11-H3] phien-ho-so.md, không có kịch bản.

## Việc cần làm
- [ ] Đọc story này và các luật chung nó trỏ tới. Chỗ nào gắn thẻ MỞ thì không code, hỏi Tùng (docs/Cau_hoi_mo.md).
- [ ] Viết test cho từng tiêu chí chưa có test, test đỏ trước (lớp test: docs/QUY_TRINH.md mục 6).
- [ ] Database: soát các hàm ở mục Database với tiêu chí; thiếu thì thêm migration mới và một dòng trong `scripts/thu-lam-hong.sh`.
- [ ] Giao diện: các màn ở mục Màn hình, nối với Supabase (docs/Ghi_chu_code.md).
- [ ] E2E cho luồng chính của story.
- [ ] Kiểm tay theo `tests/kich-ban/US11.md` trên điện thoại thật.
- [ ] Đổi Trạng thái ở đầu file và ở `docs/stories/README.md` trong cùng PR.
