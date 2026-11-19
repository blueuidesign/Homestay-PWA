---
id: US48
tieu_de: "Gửi thông tin cho khách"
loai: US
trang_thai: cho-test
thuc_hien: [YC8.1@2]
truoc: [EN1, EN2, EN4, US2]
lien_quan: []
thay_cho: []
nguon: QD21
nguoi: tung
rui_ro: cao
nghiem_thu: khong
uoc_luong:
thuc_te:
can_duyet: []
based_on:
pr: [56]
ngay_tao: 2026-11-18
---
## Mục tiêu
Là sale, tôi làm được việc "Gửi thông tin cho khách" đúng như YC8.1 mô tả.

## Làm tiêu chí nào
YC8.1-NT1 đến NT16; HV6-NT2 (hành vi chung gắn màn này, QD27)

## Quy tắc, hành vi dùng
Không có.

## Màn hình
S5

## Quyền
PQ3, PQ5, PQ11, PQ12, PQ14, PQ19 và các test vi phạm ở mục "Ai được làm gì" của YC8-gui-khach.md thuộc mục này. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
Điền khi lập kế hoạch, theo cấu trúc thư mục EN1 ghi ở docs/dev/chay-va-test.md. Database chỉ thêm migration mới ở supabase/migrations/.

## Ngoài phạm vi
- YC8-H1, H2, H3, H4, H6, H7 đã Claude tự chốt (QD25, YC8 r4).
- Mẫu tin (P11, sửa mẫu): US49. US48 dùng mẫu mặc định (YC8 quy tắc Mẫu tin gửi khách, r5) cho "Sao chép chữ cả N căn".
- Danh sách thông báo, công tắc tắt loại thông báo: YC12. US48 chỉ ghi dòng thông báo ở database.
- Phần đầu YC8-gui-khach.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC8.1 PQ3 PQ5 PQ11 PQ12 PQ14 PQ19 S5
YC8-gui-khach.md#Quy tắc của nhóm
YC8-gui-khach.md#Ai được làm gì
YC8-gui-khach.md#Dữ liệu
YC8-gui-khach.md#Trạng thái màn (mọi mục)
thiet-ke-db.md#3. Bất biến (sai là hỏng sản phẩm)

## Test case
Kịch bản test tay: tests/kb/US48-gui-thong-tin-cho-khach.md.

## Task
- [x] US48-TA1 Code · Claude Code (opus, CL14.6a): viết trước test database cho YC8.1-NT2, YC8.1-NT4, YC8.1-NT6, YC8.1-NT7, YC8.1-NT8, YC8.1-NT9, YC8.1-NT10, YC8.1-NT11, YC8.1-NT12, YC8.1-NT13, YC8.1-NT14, YC8.1-NT16, kể cả test vi phạm quyền ở mục "Ai được làm gì". Task sau không sửa file test này (CL14.5) · PR #56
- [x] US48-TA2 Code · Claude Code (opus, CL14.6a): migration, hàm fn_*, policy cho tới khi test database xanh; thêm phép thử làm hỏng vào scripts/thu-lam-hong.sh nếu đổi quyền, tiền, chặn trùng · PR #56
- [x] US48-TA3 Code · Claude Code (sonnet, CL14.6a): màn S5 theo canvas, test unit, e2e cho YC8.1-NT1 đến NT5, NT12 đến NT15, HV6-NT2 · PR #56
- [ ] US48-TA4 Test tay · Đức: chạy tests/kb/US48-gui-thong-tin-cho-khach.md, chế độ nhanh rồi đủ. Rủi ro cao: chạy trên cả iPhone và Android, thử vi phạm quyền bằng tay (CL6.3).

## Kế hoạch
- TA1: tests/db/64 viết trước theo hợp đồng ghi ở đầu file (fn_soan_tin_gui_khach, fn_ghi_lan_gui, trigger sau khi đổi ngày).
- TA2: migration 20261119420000: hai lệnh (tối đa 10 căn, cả lệnh bị từ chối khi có căn không được gửi), chữ từng căn ở database, trigger after update báo lần gửi khi đêm mới chạm; phép thử làm hỏng.
- TA3: src/lib/guiKhach.ts (ghép mẫu tin, chữ nút ảnh), dichVuGuiKhach.ts (gọi lệnh, ký ảnh 1 giờ), màn S5, nối nút ở S2, S3; unit rồi e2e.

## Nhật ký
- 2026-11-18 · Claude · tạo item từ YC8.1@1 (QD21)
- 2026-11-19 · Claude · thuc_hien lên bản mới theo QD22
- 2026-11-19 · Claude · nhận HV6-NT2 từ EN4 (QD27)
- 2026-11-19 · Claude · YC8-H5 đã trả lời (nút Chia sẻ)
- 2026-11-19 · Claude (QD25) · tự chốt YC8-H1, H2, H3, H4, H6, H7 (YC8 r4, thêm NT12 đến NT16); viết kịch bản test tay
- 2026-11-19 · Claude (agent code) · TA1–TA3 trên nhánh US48-gui-khach, chưa mở PR; chữ từng căn soạn ở database, S5 phủ lên S2/S3
- 2026-11-19 · Claude (QD25) · Gộp PR #56, CI xanh 4/4. Chuyển cho-test, chờ Đức test tay TA4.

## Bằng chứng
- TA1 `CHI_FILE_CO_MA=1 scripts/test-db.sh YC8.1`: lần đầu 43 hỏng, 17 qua (2 vòng sửa lỗi dựng dữ liệu trong chính file test trước khi có migration).
- TA2 `scripts/test-db.sh`: 1863 qua, 0 hỏng sau vòng đầu. `scripts/thu-lam-hong.sh`: 229 đạt, 0 không đạt (11 phép thử mới YC8.1; 1 vòng sửa khóa có dấu nháy).
- TA3 unit: lần đầu 3 file đỏ (chưa có module); `npx vitest run` 77 file, 745 qua. `npm run typecheck`, `npm run build` qua. e2e gui-khach.spec.ts: 1 vòng sửa locator, qua. Cả bộ e2e: 63 qua, 1 hỏng: ket-qua-tim.spec.ts dòng 84 (US45) còn chờ toast tạm "Gửi cho khách sẽ có ở bản sau"; file ngoài phạm vi, chưa sửa.
- `python3 scripts/kiem.py --diff origin/main`: không có lỗi.
