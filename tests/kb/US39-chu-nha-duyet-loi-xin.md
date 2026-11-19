---
id: US39-KB
us: US39
rev: 1
---
# Kịch bản test tay US39 · Chủ nhà duyệt lời xin xem lịch

Dữ liệu dùng chung theo docs/product/du-lieu-mau.md: một tài khoản sale (Sale Lan, đã có link xin lịch ở US38) và một tài khoản chủ nhà có ít nhất một căn (Chị Hoa). Cần hai điện thoại hoặc hai trình duyệt.
Cách ghi kết quả: đánh dấu ☑ OK hoặc ☑ NG, ngày, tên. NG thì ghi thấy gì và mở BG trỏ tới mã kịch bản (skill bao-loi). Cuối lượt test trả lời câu hỏi cải tiến và ghi CT ở work/cai-tien.md (skill test-tay). Chạy lại sau khi sửa thì thêm một dòng Kết quả mới, không xóa dòng cũ. Luật viết kịch bản: CL14.5a.

### US39-KB1 · Chủ nhà mở link xin lịch `[Chính]`
- **Mục đích:** chủ nhà biết ai xin xem lịch và sale đó sẽ thấy gì.
- **Chuẩn bị:** Sale Lan chia sẻ tin xin lịch sang máy Chị Hoa.
- **Làm:** Chị Hoa bấm link trong tin. Chưa đăng nhập thì đăng nhập bằng mã email.
- **Mong đợi:** màn "Lời mời xem lịch" có tên và số của Lan, công tắc "Tình trạng cọc" đang bật, dòng giá từng đêm không có công tắc, dòng "Không bao giờ thấy tên, số điện thoại khách và doanh thu", hai nút "Đồng ý cho xem lịch" và "Từ chối".
- **Nguồn:** YC6.5-NT1, YC6.5-NT5
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US39-KB2 · Đồng ý cho xem lịch `[Chính]`
- **Làm:** ở màn trên tắt "Tình trạng cọc", bấm "Đồng ý cho xem lịch".
- **Mong đợi:** về tab Sale, toast "Đã cho Sale Lan xem lịch"; Lan nằm ở nhóm "Đã kết nối". Trên máy Lan có thông báo chủ nhà đồng ý, màn chờ ghi "1 chủ nhà đã đồng ý" (nếu Lan còn ở màn đó). Lan thấy lịch và giá từng đêm nhưng không thấy đã cọc hay chưa.
- **Nguồn:** YC6.5-NT2, YC6.5-NT3
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US39-KB3 · Từ chối `[Biên]`
- **Làm:** một chủ nhà khác mở link của Lan, bấm "Từ chối".
- **Mong đợi:** về tab Sale, không có kết nối mới, Lan không nhận thông báo nào. Mở lại link vẫn thấy màn lời mời.
- **Nguồn:** YC6.5 bước 3
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US39-KB4 · Đã ngừng sale rồi mở lại link `[Biên]`
- **Làm:** Chị Hoa ngừng cho Lan xem lịch ở mục Sale, rồi mở lại link xin lịch của Lan.
- **Mong đợi:** "Bạn không còn xem được mục này", nút "Về Lịch"; không có tên, số của Lan; Lan không được kết nối lại.
- **Nguồn:** YC6.5-NT4
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US39-KB5 · Mở link của chính mình, đồng ý lần hai `[Biên]`
- **Làm:** Lan mở link xin lịch của chính mình. Sau đó một chủ nhà đã kết nối với Lan mở lại link và bấm Đồng ý.
- **Mong đợi:** Lan thấy "Bạn không còn xem được mục này". Chủ nhà đồng ý lần hai thì vẫn chỉ có một dòng Lan trong danh sách sale, quyền cọc giữ như cũ.
- **Nguồn:** YC6.5-NT6, YC6.5-NT7
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**

### US39-KB6 · Người chưa dùng app `[Biên]`
- **Làm:** mở link xin lịch trên máy chưa đăng nhập, đăng ký mới.
- **Mong đợi:** đăng ký xong vào thẳng màn lời mời với vai chủ nhà; đồng ý xong thì, vì chưa có căn, về màn chưa có căn.
- **Nguồn:** YC6.5 bước 1, 2
- **Kết quả:** ☐ OK ☐ NG · Ngày: · Người:
- **Nếu NG, thấy gì:**
