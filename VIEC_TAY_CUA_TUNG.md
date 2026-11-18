# Việc Tùng làm tay · Home247 bản PWA

Những việc dưới đây cần tài khoản và mật khẩu của Tùng, nên Claude không làm thay. Làm theo thứ tự. Xong bước nào thì báo Claude trong phiên để làm tiếp story US38.

**Luật chung:** không dán mật khẩu, khóa bí mật, chuỗi kết nối database vào chat. Claude cần thì nói tên biến, Tùng tự điền vào GitHub Secrets hay Vercel. Mật khẩu tự sinh, chỉ gồm chữ và số (ký tự `@ # / : ?` làm hỏng chuỗi kết nối).

## Làm trước

### Bước 1 · Repo GitHub (đã có)
Repo là `blueuidesign/Homestay-PWA`, đang **công khai**. Hai điều cần Tùng quyết (xem thêm mục "Cần chú ý" trong báo cáo dựng repo):
1. Giữ công khai hay chuyển riêng tư. Công khai thì ai cũng đọc được code, luật quyền và tài liệu sản phẩm; không có bí mật nào trong repo nhưng đối thủ đọc được cách làm. Riêng tư thì cần kiểm gói Vercel: gói Hobby không deploy repo riêng tư của tổ chức.
2. Nếu Vercel không nhận repo của tổ chức `blueuidesign`: chuyển repo sang tài khoản GitHub cá nhân, hoặc nâng gói Vercel.

### Bước 2 · Supabase staging
1. supabase.com → New project. Tên `home247-staging`. Vùng **Southeast Asia (Singapore)**. Đây chỉ là staging, chỉ có dữ liệu giả; vùng của production chờ CH-002.
2. Database password: bấm Generate, cất vào trình quản lý mật khẩu.
3. Authentication → Sign In / Providers → Email: bật, **tắt** "Confirm email" (để tạo tài khoản thử nhanh). Chỉ làm vậy ở staging.
4. Database → Extensions: bật `pg_cron` và `btree_gist` nếu chưa bật.
5. Project Settings → API: ghi lại Project URL và khóa `anon` (publishable). Hai giá trị này công khai được. **Không** chép khóa `service_role`.

Chưa tạo project production. Chờ Tùng trả lời CH-002 (dữ liệu đặt ở đâu) trong `docs/Cau_hoi_mo.md`.

### Bước 3 · Cho Claude dùng được GitHub và Supabase
1. Trong claude.ai → Settings → Connectors: kết nối **Supabase**, cho phép truy cập project `home247-staging` (Claude dùng để chạy migration lên staging và đọc cảnh báo).
2. Kết nối **GitHub** cho repo `blueuidesign/Homestay-PWA`, quyền đọc ghi (Claude đẩy nhánh, mở PR).

### Bước 4 · Project mới trên claude.ai
1. claude.ai → Projects → Create project, ví dụ tên `Home247 PWA`.
2. Phần Project knowledge: chỉ thêm nguồn GitHub là repo `Homestay-PWA`. **Không** chép tài liệu của Project "Homestay" cũ và **không** gắn repo `zalo-miniapp`: các tài liệu đó ghi cả quyết định đã bị thay, Claude dễ đọc nhầm.
3. Custom instructions của Project: một dòng "Đọc CLAUDE.md của repo Homestay-PWA trước khi làm. Trả lời tiếng Việt, kết luận trước."
4. Mở phiên Claude Code mới trong Project này, gắn với repo `Homestay-PWA`. Câu đầu tiên: "Tôi là Tùng. Làm tiếp US38."

## Khi Claude nhắc

### Bước 5 · Vercel
1. vercel.com → Add New → Project → Import repo `Homestay-PWA`. Framework: Vite (repo đã có `vercel.json`). Bản deploy đầu chạy chế độ thử nếu chưa điền biến môi trường.
2. Settings → Environment Variables:
   - `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` của **staging**, chọn môi trường **Preview** và **Development**.
   - Môi trường **Production**: để trống tới khi có project production.
3. Settings → Deployment Protection: bản preview mặc định có thể bị khóa bằng Vercel Authentication, làm E2E không vào được. Chọn một trong hai:
   - Tạo "Protection Bypass for Automation", chép mã vào GitHub Secret `VERCEL_AUTOMATION_BYPASS_SECRET` (bước 7).
   - Hoặc tắt khóa cho Preview. Khi đó ai có link preview cũng mở được, nhưng preview chỉ trỏ vào staging có dữ liệu giả.

### Bước 6 · Bảo vệ nhánh main
GitHub → Settings → Branches (hoặc Rules → Rulesets) → thêm luật cho `main`: bắt buộc qua pull request, bắt buộc hai check "App" và "Database" xanh, không cho force push.
Repo riêng tư trên gói miễn phí có thể không bật được luật này. Không bật được thì chỉ còn lớp chặn mềm: `.claude/settings.json` cấm Claude đẩy ép (Claude được merge khi Tùng bảo, QD-017), còn luật "không đẩy thẳng main" nằm trong `CLAUDE.md` và chỉ là lời dặn. Khi đó Tùng nên xem tab Commits của `main` mỗi tuần. Báo Claude biết đã bật được hay không.

### Bước 7 · Tài khoản thử và GitHub Secrets
Tạo 5 tài khoản thử và nạp dữ liệu mẫu theo `supabase/staging/README.md`. Rồi:

GitHub → Settings → Secrets and variables → Actions → New repository secret:
- `E2E_SUPABASE_URL`, `E2E_SUPABASE_ANON_KEY`: của staging.
- `E2E_CHU_EMAIL` = `hoa@home247.test`, `E2E_SALE_EMAIL` = `hung@home247.test`, và `E2E_CHU_MAT_KHAU`, `E2E_SALE_MAT_KHAU`: mật khẩu Tùng tự đặt lúc tạo tài khoản. Claude không biết mật khẩu.
- `VERCEL_AUTOMATION_BYPASS_SECRET`: nếu chọn cách 1 ở bước 5.

## Sau này, khi có production

### Bước 8 · Production và sao lưu
1. Trả lời CH-002, ghi QD. Tạo project production theo vùng đã chọn. Không bật đăng nhập email và mật khẩu ở production.
1b. Thêm email quản trị viên đầu tiên bằng SQL Editor của production, không ghi email vào repo: `insert into public.bootstrap_admins (email, la_goc) values ('<email quản trị viên đầu tiên>', true);` rồi xóa dòng `admin@example.com`. Làm tương tự ở staging nếu muốn thử màn quản trị.
1c. Nhập dải ngày lễ của năm ở màn Quản trị (story US23) hoặc bằng `fn_qt_luu_ngay_le`.
2. Vercel: điền `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` của production cho môi trường Production.
3. Sao lưu theo `docs/van-hanh/Sao_luu_khoi_phuc.md` (có mã hóa), rồi đặt biến `BACKUP_BAT = co` trong GitHub → Settings → Variables để job sao lưu chạy mỗi đêm.
4. Diễn tập khôi phục một lần, ghi vào cùng file.
