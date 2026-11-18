# Ghi chú code · app PWA

<!-- Tài liệu sống. Chỉ ghi điều code không tự nói được: cấu trúc, vì sao, việc còn dở. Chi tiết từng hàm nằm trong code. -->

## 1. App đang ở đâu

Giao diện được chuyển từ bản Zalo Mini App (khoảng 35 nghìn dòng React, 46 màn). Hiện tại:

- App **chạy được ở chế độ thử**: mọi dữ liệu là dữ liệu mẫu trong bộ nhớ (`src/services/api.ts` là một máy chủ giả đầy đủ luật). Mở lại trang là mất.
- App **chưa nối Supabase**. Database, hàm và test đã có đủ ở `supabase/` nhưng chưa màn nào gọi tới.
- **Chưa có đăng nhập** (chờ CH-001, story US37).

Vì vậy mỗi story tính năng còn hai việc: nối các hàm của story đó sang Supabase, và kiểm lại màn theo tiêu chí.

## 2. Cấu trúc `src/`

| Thư mục | Là gì |
|---|---|
| `main.tsx` | Khai báo đường dẫn của mọi màn |
| `pages/` | Màn. File `*-man.tsx` chỉ vẽ (nhận dữ liệu qua tham số, test được); file cùng tên không có `-man` lo tải và lưu |
| `components/` | Thành phần dùng chung, và các file `*-hien-thi.ts` chứa chữ và luật hiển thị (test được, không đụng mạng) |
| `services/api.ts` | Mọi hàm đọc ghi dữ liệu mà màn gọi (`getLichThang`, `postBooking`…). Hiện là máy chủ giả |
| `services/kieu.ts` | Kiểu dữ liệu app dùng |
| `services/supabase.ts` | Kết nối Supabase, `goiHam()` gọi hàm `fn_*`, `cauLoi()` đổi lỗi ra câu cho người dùng |
| `services/zalo.ts`, `chon-anh.ts` | "Cổng thiết bị": chia sẻ, sao chép, gọi điện, chọn ảnh. Màn gọi qua cổng, test thay bằng bản giả |
| `stores/` | Dữ liệu giữ trong bộ nhớ giữa các màn |
| `nen-tang/giao-dien.tsx` | Khung trang và điều hướng (react-router). Giữ tên thành phần của zmp-ui để các màn không phải sửa |
| `nen-tang/thiet-bi.ts` | Việc của thiết bị làm bằng API trình duyệt. Giữ tên hàm của zmp-sdk. Làm bản Zalo sau này thì thay hai file `nen-tang/` |
| `styles/` | `nen.css` token và lớp `hh-*` chép từ canvas; `khung.css` khung màn; `pwa.css` nền trình duyệt |

## 3. Nối một story sang Supabase

Màn chỉ gọi hàm trong `services/api.ts`, nên nối Supabase không phải sửa màn.

1. Tạo `src/services/sb/<nhóm>.ts`. Mỗi hàm cùng tên, cùng tham số, cùng kiểu trả với hàm trong `api.ts`; bên trong gọi `goiHam('fn_…')` hoặc đọc bảng, view qua `supabase()`, rồi đổi dữ liệu sang kiểu ở `kieu.ts`.
2. Trong `api.ts`, ở đầu hàm tương ứng thêm một dòng: `if (coSupabase()) return sb.<tên hàm>(…);`. Phần giả bên dưới giữ nguyên để chế độ thử và unit test vẫn chạy.
3. Tên hàm database, tham số, cột: `docs/tu-sinh/Bang_va_cot.md`. Tên trong app và trong database khác nhau ở vài chỗ, đổi ở lớp `sb/`:

| App (`kieu.ts`, chuyển từ bản Zalo) | Database |
|---|---|
| `tai_khoan`, `so_dien_thoai`, `ten_hien_thi` | `profiles`, `sdt`, `ten` |
| `khoa` (khóa chống gửi trùng) | `client_id` |
| `mau_tin_gui_khach`, `muc_cong_mac_dinh`, `lam_tron_50k` | bảng `cai_dat_rieng` (`mau_tin`, …), ghi bằng `fn_luu_cai_dat` |
| `ten_khach`, `sdt_khach`, giá bán của sale | `booking_rieng`, `yeu_cau_rieng` |
| mã lỗi `LoiApi("DU_LIEU_SAI" …)` | lỗi `P0001` kèm câu tiếng Việt; hiện bằng `cauLoi()` |

4. Luật nào máy chủ giả làm khác database thì database đúng (nó có test theo tiêu chí). Ghi chỗ lệch vào PR.
5. Thêm E2E cho luồng chính, chạy trên staging.

## 4. Lệnh

```bash
npm run dev          # chế độ thử nếu không có .env.local
npm run typecheck
npm test             # unit test (vitest)
npm run build
npm run e2e          # Playwright; không có E2E_BASE_URL thì tự chạy bản đã build ở chế độ thử
scripts/test-db.sh   # cần Postgres: PGHOST=localhost PGUSER=postgres PGPASSWORD=…
scripts/thu-lam-hong.sh
scripts/bang-cot.sh  # sinh lại docs/tu-sinh/Bang_va_cot.md sau khi thêm migration
python3 scripts/kiem-tai-lieu.py
```

## 5. Chú thích cũ trong code

Code chuyển từ bản Zalo còn nhiều chú thích nhắc tài liệu của repo cũ: `server.md`, `api/….md`, `zalo-rang-buoc`, mã `EN…`, `DC…`, `SK…`, `TK…`, `CL…`, và mã quyết định cũ dạng `QD<số>` viết liền. Đó là lịch sử: **không đi tìm các file đó**. Sửa một file thì dọn chú thích của file đó theo tài liệu mới. Mã mục và tiêu chí (`YC5.2`, `YC5.2-NT3`, `QT1.1`, `PQ5.SALE`, `HV2`) vẫn đúng.

Bảng đổi mã quyết định cũ:

| Cũ | Nay |
|---|---|
| QD1 | QD-003 |
| QD2 | mục YC1.5 (story US5) |
| QD8, QD17 | mục YC9.3 (story US21): bản 1 chỉ báo trong app |
| QD9 | QD-008 |
| QD10 | đội nhóm làm sau (story US20) |
| QD11 | QD-011 |
| QD12 | `docs/luat-chung/Tu_dien.md` |
| QD13 | QD-005 |
| QD14 | QD-010 |
| QD18 | QD-013 |
| QD20 | QD-007 |
| QD21 | QD-012 |
| QD22 | máy chủ giả trong `api.ts` (mục 1 ở trên) |
| QD25 | mục YC10.3 (story US34) |
| QD khác | đã bỏ |

Chữ "Giá từng đêm" như một công tắc bật tắt trong chú thích hay test cũ: công tắc này đã bỏ (QD-007).

## 6. Việc còn dở, đã biết

- File test (`*.test.ts(x)`) chưa qua kiểm kiểu: `tsconfig.json` đang loại chúng ra vì có vài lỗi kiểu có từ bản Zalo. Test vẫn chạy và xanh. Sửa kiểu rồi bỏ dòng `exclude` là một việc của story US38.
- File JS chính khoảng 590 KB chưa tách. Tách theo màn khi đo thấy chậm.
- `nen-tang/thiet-bi.ts` chưa thử trên điện thoại thật: chia sẻ ảnh qua bảng chia sẻ, chọn ảnh, gọi điện. Thử ở story US14, US25, US5.
- E2E mới chạy bằng Chromium. WebKit (gần Safari trên iPhone) chạy trong CI trên bản xem thử.
- Service worker chỉ lưu vỏ app. Không lưu dữ liệu để xem khi mất mạng: lịch và giá cũ dễ gây bán trùng.
