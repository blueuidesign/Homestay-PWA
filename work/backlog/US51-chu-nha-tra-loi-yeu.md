---
id: US51
tieu_de: "Chủ nhà trả lời yêu cầu"
loai: US
trang_thai: cho-test
thuc_hien: [YC9.2@2]
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
pr: [59]
ngay_tao: 2026-11-18
---
## Mục tiêu
Là chủ nhà, tôi làm được việc "Chủ nhà trả lời yêu cầu" đúng như YC9.2 mô tả.

## Làm tiêu chí nào
YC9.2-NT1 đến NT5, NT7 đến NT11 (NT6 bỏ)

## Quy tắc, hành vi dùng
QT1.1, QT1.4, QT2.1, QT5.6, QT6.2

## Màn hình
CN1-03, CN9, CN9-02, CN9-03

## Quyền
PQ2, PQ5, PQ7, PQ10, PQ11, PQ19 và các test vi phạm ở mục "Ai được làm gì" của YC9-yeu-cau-dat-phong.md thuộc mục này. Mỗi ô chạm tới có test vi phạm ở lớp database (CL2.5).

## Phạm vi
Điền khi lập kế hoạch, theo cấu trúc thư mục EN1 ghi ở docs/dev/chay-va-test.md. Database chỉ thêm migration mới ở supabase/migrations/.

## Ngoài phạm vi
- YC9-H4, H5, H9, H10 đã Claude tự chốt (QD25, YC9 r3).
- Phần đầu YC9-yeu-cau-dat-phong.md và mục "Phạm vi" của nó nói phần nào thuộc YC khác.

## Đọc
YC9.2 QT1.1 QT1.4 QT2.1 QT5.6 QT6.2 PQ2 PQ5 PQ7 PQ10 PQ11 PQ19 CN1-03 CN9 CN9-02 CN9-03
YC9-yeu-cau-dat-phong.md#Quy tắc của nhóm
YC9-yeu-cau-dat-phong.md#Ai được làm gì
YC9-yeu-cau-dat-phong.md#Dữ liệu
YC9-yeu-cau-dat-phong.md#Trạng thái màn (mọi mục)
thiet-ke-db.md#3. Bất biến (sai là hỏng sản phẩm)

## Test case
Kịch bản test tay: tests/kb/US51-chu-nha-tra-loi-yeu.md.

## Task
- [x] US51-TA1 Code · Claude Code (opus, CL14.6a): viết trước test database cho YC9.2-NT2, YC9.2-NT3, YC9.2-NT4, YC9.2-NT5, YC9.2-NT8, YC9.2-NT9, YC9.2-NT10, YC9.2-NT11, kể cả test vi phạm quyền ở mục "Ai được làm gì". Task sau không sửa file test này (CL14.5) · PR #59
- [x] US51-TA2 Code · Claude Code (opus, CL14.6a): migration, hàm fn_*, policy cho tới khi test database xanh; thêm phép thử làm hỏng vào scripts/thu-lam-hong.sh nếu đổi quyền, tiền, chặn trùng · PR #59
- [x] US51-TA3 Code · Claude Code (sonnet, CL14.6a): màn CN1-03, CN9, CN9-02, CN9-03 theo canvas, test unit, e2e cho YC9.2-NT1, YC9.2-NT2, YC9.2-NT4, YC9.2-NT7, YC9.2-NT11 · PR #59
- [ ] US51-TA4 Test tay · Đức: chạy tests/kb/US51-chu-nha-tra-loi-yeu.md, chế độ nhanh rồi đủ. Rủi ro cao: chạy trên cả iPhone và Android, thử vi phạm quyền bằng tay (CL6.3).

## Kế hoạch
- TA1: tests/db/67 viết trước. Hợp đồng: fn_chap_nhan_yeu_cau(id), fn_tu_choi_yeu_cau(id, ly_do), fn_yeu_cau_dang_cho() cho khối CN1-03; fn_chu_xem_yeu_cau (US50) thêm trường sale_id, sdt_sale, so_dat_phong, con_ket_noi, trung_voi. Yêu cầu không còn chờ: trả trạng thái mới kèm doi_trang_thai, không lỗi; quá hạn thì ghi Hết hạn và đúng một thông báo.
- TA2: migration 20261119450000: khóa căn rồi khóa dòng yêu cầu (for update), kiểm còn chờ, còn kết nối, chưa hết hạn; tạo booking tu_yeu_cau mang giá đã chốt, phần riêng của sale, yêu cầu sang Đã chốt, thông báo yeu_cau_da_chot. Chặn trùng cuối là booking_khong_trung. Thông báo bị từ chối kèm lý do, trigger thông báo hết hạn một lần. Phép thử làm hỏng.
- TA3: src/lib/traLoiYeuCau.ts (đọc jsonb, chữ màn), dichVuTraLoiYeuCau.ts, CN9TraLoiYeuCau.tsx (CN9, chip từ chối, CN9-02, CN9-03), khối yêu cầu ở CN1LichThang, mở CN9 trong ManChu (state, không thêm đường dẫn vì dieuHuong.ts ngoài phạm vi); unit rồi e2e.

## Nhật ký
- 2026-11-18 · Claude · tạo item từ YC9.2@1 (QD21)
- 2026-11-19 · Claude · thuc_hien lên bản mới theo QD22
- 2026-11-19 · Claude (QD25) · YC9 r3 tự chốt câu mở, thêm NT
- 2026-11-20 · Claude · TA1–TA3: test db 67, migration 450000, CN9/CN9-02/CN9-03, khối CN1-03, e2e; chưa mở PR · test 67 sửa dựng dữ liệu một lần
- 2026-11-20 · Claude (QD25) · Gộp PR #59, CI xanh 4/4. Chuyển cho-test, chờ Đức test tay TA4.

## Bằng chứng
- TA1 `CHI_FILE_CO_MA=1 scripts/test-db.sh YC9.2` trước migration: 12 qua, 13 hỏng, 1 file lỗi (hàm chưa có).
- TA2 cùng lệnh: vòng 1 file lỗi (ALTER TABLE booking vướng trigger hoãn trong phần dựng dữ liệu của test 67, đổi sang dựng đặt phòng trước yêu cầu, không đổi điều kiện kiểm); vòng 2: 78 qua, 0 hỏng. `scripts/test-db.sh` đủ: 2128 qua, 0 hỏng. `scripts/thu-lam-hong.sh YC9.2`: 8/8 đạt; `YC9.1`: 14/14 đạt. `scripts/bang-cot.sh`, `supabase db reset` qua.
- TA3 unit viết trước màn: lần đầu 7 hỏng (màn chưa có) + 1 hỏng do regex test bắt nhầm 200000 trong 2200000 (sửa regex có \b); 2 vòng sửa test gọi findBy trong act. Cuối: `npx vitest run` 86 file, 839 qua. e2e `tra-loi-yeu-cau.spec.ts` 2 qua lần đầu; cả bộ `tests/e2e/supabase` 69 qua.
- `npm run typecheck`, `npm run build` qua; `python3 scripts/kiem.py --diff origin/main`: không có lỗi.
