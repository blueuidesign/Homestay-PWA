-- US58 · Thống kê của chủ nhà (YC11.1). Viết trước code (US58-TA1, CL14.5): task sau không sửa kỳ vọng của file này.
-- Hợp đồng database cho CN8, CN8-00 (YC11 "Dữ liệu", thiet-ke-db.md mục 3 bất biến 11):
--   fn_thong_ke_chu(p_thang date, p_so_thang int default 6) → jsonb, của người gọi (không nhận mã chủ nhà):
--   {thang, hom_nay, doanh_thu, doanh_thu_thang_truoc, so_dem, mau_so, cong_suat (làm tròn 1 số lẻ),
--    can: [{can_id, ma_can, doanh_thu, so_dem, da_an}],
--    cac_thang: [{thang, doanh_thu}] (p_so_thang tháng, cũ trước, tháng đang xem cuối),
--    nguoi_ban: [{sale_id, ten, khach_le, doanh_thu}] (tiền giảm dần; khách lẻ: sale_id null, khach_le true),
--    chua_thu: [{booking_id, can_id, ma_can, sale_id, ten, khach_le, ngay_nhan, ngay_tra, trang_thai_tien, so_tien,
--                con_ngay}] (đặt phòng có ngày nhận trong tháng, ngày nhận tăng dần), tong_chua_thu}.
-- Số theo DLM.4, DLM.5 (tháng 10 của Chị Hoa), tháng 9 như 48_us11_doanh_thu_thang.sql. QT2.1, QT2.2, QT4.2, QT6.1, QD10,
-- QD12, YC11-H7, YC11-H9 (r3), PQ11.CHU, PQ15.CHU, PQ16.
select t.fixture();

-- DLM.1: "hôm nay" là 07/10/2026 (thay local_today() trong giao dịch của file này, như 61_us45_ket_qua_tim.sql).
create or replace function pg_temp.hom_nay(p_ngay date) returns void language plpgsql as $hn$
begin
  execute format('create or replace function public.local_today() returns date '
                 'language sql stable security definer set search_path = '''' as $b$ select date %L $b$', p_ngay);
end $hn$;
select pg_temp.hom_nay('2026-10-07');

-- Sale Minh (DLM.2) chưa có trong bộ rút gọn: thêm ở file này, kết nối với Chị Hoa (tất cả căn).
insert into auth.users (id) values ('00000000-0000-0000-0000-000000000006') on conflict (id) do nothing;
insert into public.profiles (id, ten, ten_hien_thi, so_dien_thoai, vai_chon)
values ('00000000-0000-0000-0000-000000000006', 'Sale Minh', 'Sale Minh', '0900000006', 'sale')
on conflict (id) do update set ten = excluded.ten, ten_hien_thi = excluded.ten_hien_thi;
insert into public.ket_noi (chu_id, sale_id, trang_thai, nguon, pham_vi)
values (t.id('hoa'), '00000000-0000-0000-0000-000000000006', 'da_ket_noi', 'link_moi', 'tat_ca');
create or replace function pg_temp.minh() returns uuid language sql immutable as
  $$ select '00000000-0000-0000-0000-000000000006'::uuid $$;

-- Căn có từ trước tháng 9 (YC11-H7: mẫu số tính từ ngày tạo căn).
update public.can set tao_luc = '2026-08-01 08:00+07';

-- DLM.4: booking của Chị Hoa, người bán và trạng thái tiền như bảng.
select t.tao_booking('B1', t.can('1509'), '2026-10-10', '2026-10-12', 2200000, t.id('hung'), 'tu_yeu_cau');
select t.tao_booking('B2', t.can('3402'), '2026-10-17', '2026-10-19', 1900000, t.id('lan'), 'chu_ghi');
select t.tao_booking('B3', t.can('1509'), '2026-10-04', '2026-10-06', 1800000, t.id('hung'), 'tu_yeu_cau');
select t.tao_booking('B4', t.can('3402'), '2026-10-05', '2026-10-07', 1600000, t.id('lan'), 'chu_ghi');
select t.tao_booking('B5', t.can('1509'), '2026-10-13', '2026-10-15', 1800000);
select t.tao_booking('B6', t.can('3402'), '2026-10-14', '2026-10-15', 800000);
select t.tao_booking('B7', t.can('1509'), '2026-10-19', '2026-10-20', 900000, pg_temp.minh(), 'chu_ghi');
select t.tao_booking('B8', t.can('3402'), '2026-10-21', '2026-10-22', 800000, pg_temp.minh(), 'chu_ghi');
select t.tao_booking('B9', t.can('3402'), '2026-11-30', '2026-12-02', 1600000, pg_temp.minh(), 'chu_ghi');
update public.booking set trang_thai_tien = 'da_coc', tien_coc = 1000000 where id = t.b('B1');
update public.booking set trang_thai_tien = 'chua_coc' where id in (t.b('B2'), t.b('B5'));
update public.booking set trang_thai_tien = 'da_thanh_toan'
 where id in (t.b('B3'), t.b('B4'), t.b('B6'), t.b('B7'), t.b('B8'), t.b('B9'));
-- Tháng 9 riêng (như 48_us11): 6.000.000đ (1509) + 3.600.000đ (3402) = 9.600.000đ, đã thanh toán.
select t.tao_booking('S1', t.can('1509'), '2026-09-05', '2026-09-11', 6000000);
select t.tao_booking('S2', t.can('3402'), '2026-09-19', '2026-09-23', 3600000);
update public.booking set trang_thai_tien = 'da_thanh_toan' where id in (t.b('S1'), t.b('S2'));
-- QD12: đặt phòng đã hủy trong tháng 10 (3402, 25/10 → 27/10, 2.000.000đ, chưa cọc) không tính ở đâu cả.
select t.tao_booking('H1', t.can('3402'), '2026-10-25', '2026-10-27', 2000000);
update public.booking set trang_thai_tien = 'chua_coc', trang_thai = 'da_huy' where id = t.b('H1');
-- QT3.1: yêu cầu đang chờ của Sale Lan (1509, 24/10 → 26/10) không tính.
select t.tao_yeu_cau('Y1', t.can('1509'), t.id('lan'), '2026-10-24', '2026-10-26', array[1300000, 900000]::bigint[]);
-- Chủ khác: Anh Tuấn có 1103, tháng 10 một đêm 700.000đ, chưa cọc.
select t.tao_booking('T1', t.can('1103'), '2026-10-10', '2026-10-11', 700000);
update public.booking set trang_thai_tien = 'chua_coc' where id = t.b('T1');
-- Sale Hùng tự ghi ở căn tự nhập Villa Tuần Châu: không phải của chủ nhà nào (PQ14.CHU).
select t.tao_booking('V1', t.can('villa'), '2026-10-10', '2026-10-12', 2800000, t.id('hung'));
-- Phần riêng của Sale Hùng ở B1 (QD11, PQ9, PQ11): khách, số khách, giá bán. Chủ nhà không bao giờ thấy.
insert into public.booking_rieng (booking_id, nguoi_id, ten_khach, sdt_khach, so_khach, tien_thu_khach)
values (t.b('B1'), t.id('hung'), 'Khách Riêng Của Hùng', '0900000077', 4, 2650000);

-- Gọi lệnh bằng vai hiện tại; lỗi thì null (test đỏ, file chạy tiếp).
create or replace function pg_temp.tk(p_thang date) returns jsonb language plpgsql as $$
begin
  return t.gt(format('select public.fn_thong_ke_chu(%L)', p_thang))::jsonb;
end $$;
-- Mã booking của file từ id.
create or replace function pg_temp.ma(p uuid) returns text language sql stable as $$
  select m from unnest(array['B1','B2','B3','B4','B5','B6','B7','B8','B9','S1','S2','H1','T1','V1','N4','B20']) m
  where t.b(m) = p
$$;
-- "ma_can|doanh_thu|so_dem" theo thứ tự trả về.
create or replace function pg_temp.cac_can(j jsonb) returns text language sql stable as $$
  select string_agg((e ->> 'ma_can') || '|' || (e ->> 'doanh_thu') || '|' || (e ->> 'so_dem'), ';' order by i)
  from jsonb_array_elements(j -> 'can') with ordinality x(e, i)
$$;
-- "tên|doanh_thu" theo thứ tự trả về, khách lẻ ghi "Khách lẻ".
create or replace function pg_temp.nguoi_ban(j jsonb) returns text language sql stable as $$
  select string_agg(case when (e ->> 'khach_le')::boolean then 'Khách lẻ' else e ->> 'ten' end
                    || '|' || (e ->> 'doanh_thu'), ';' order by i)
  from jsonb_array_elements(j -> 'nguoi_ban') with ordinality x(e, i)
$$;
-- "mã|người bán|trạng thái tiền|số tiền|còn ngày" theo thứ tự trả về.
create or replace function pg_temp.chua_thu(j jsonb) returns text language sql stable as $$
  select string_agg(coalesce(pg_temp.ma((e ->> 'booking_id')::uuid), '?') || '|'
                    || case when (e ->> 'khach_le')::boolean then 'Khách lẻ' else e ->> 'ten' end || '|'
                    || (e ->> 'trang_thai_tien') || '|' || (e ->> 'so_tien') || '|' || (e ->> 'con_ngay'), ';' order by i)
  from jsonb_array_elements(j -> 'chua_thu') with ordinality x(e, i)
$$;
-- "T<tháng>|doanh_thu" của biểu đồ.
create or replace function pg_temp.cac_thang(j jsonb) returns text language sql stable as $$
  select string_agg('T' || extract(month from (e ->> 'thang')::date) || '|' || (e ->> 'doanh_thu'), ';' order by i)
  from jsonb_array_elements(j -> 'cac_thang') with ordinality x(e, i)
$$;
-- Mọi tên khóa trong dữ liệu trả về.
create or replace function pg_temp.cac_khoa(j jsonb) returns text[] language sql stable as $$
  select coalesce(array_agg(distinct k[1]), '{}') from regexp_matches(coalesce(j::text, ''), '"([a-z_]+)":', 'g') k
$$;

-- ===== Danh mục và quyền gọi =====
select t.ok(exists (select 1 from pg_proc where proname = 'fn_thong_ke_chu'
                      and pronamespace = 'public'::regnamespace and prosecdef),
            'YC11.1-NT8 danh mục: fn_thong_ke_chu có và chạy security definer');
select t.ok(exists (select 1 from pg_proc where proname = 'fn_thong_ke_chu' and pronamespace = 'public'::regnamespace)
            and not exists (select 1 from pg_proc where proname = 'fn_thong_ke_chu' and pronamespace = 'public'::regnamespace
                              and 'uuid'::regtype = any (proargtypes::regtype[])),
            'YC11.1-NT8 PQ16.CHU lệnh thống kê không nhận mã chủ nhà hay mã người khác');
select t.ok(exists (select 1 from pg_proc where proname = 'fn_thong_ke_chu' and pronamespace = 'public'::regnamespace)
            and not exists (select 1 from pg_proc p where p.proname = 'fn_thong_ke_chu'
                              and p.pronamespace = 'public'::regnamespace and has_function_privilege('anon', p.oid, 'execute')),
            'YC11.1-NT8 PQ16.LINK người chưa đăng nhập không có quyền gọi fn_thong_ke_chu');

-- ===== YC11.1-NT1, NT2, NT7: Chị Hoa xem tháng 10 =====
select t.dang_nhap(t.id('hoa'));
select set_config('t.j10', coalesce(pg_temp.tk('2026-10-01')::text, ''), true);
select t.thoat();
create or replace function pg_temp.j10() returns jsonb language sql stable as
  $$ select nullif(current_setting('t.j10', true), '')::jsonb $$;

select t.bang(pg_temp.j10() ->> 'doanh_thu', '11800000',
              'YC11.1-NT1 Chị Hoa xem tháng 10: doanh thu 11.800.000đ (DLM.5)');
select t.bang(pg_temp.cac_can(pg_temp.j10()), '1509|6700000|7;3402|5100000|6',
              'YC11.1-NT1 tháng 10: 1509 6.700.000đ (7 đêm), 3402 5.100.000đ (6 đêm)');
select t.bang(pg_temp.j10() ->> 'doanh_thu_thang_truoc', '9600000',
              'YC11.1-NT1 tháng 10: tháng trước (tháng 9) 9.600.000đ để so sánh');
select t.bang((pg_temp.j10() ->> 'so_dem') || '/' || (pg_temp.j10() ->> 'mau_so'), '13/62',
              'YC11.1-NT2 tháng 10: 13 đêm có khách trên 2 căn × 31 đêm, ghi 13/62');
select t.bang(pg_temp.j10() ->> 'cong_suat', '21.0',
              'YC11.1-NT2 tháng 10: công suất 13/62 làm tròn một số lẻ là 21.0');
select t.bang(pg_temp.nguoi_ban(pg_temp.j10()),
              'Sale Hùng|4000000;Sale Lan|3500000;Khách lẻ|2600000;Sale Minh|1700000',
              'YC11.1-NT7 tháng 10: Sale Hùng 4.000.000đ, Sale Lan 3.500.000đ, Khách lẻ 2.600.000đ, Sale Minh 1.700.000đ, giảm dần');
select t.bang((select sum((e ->> 'doanh_thu')::bigint) from jsonb_array_elements(pg_temp.j10() -> 'nguoi_ban') e), 11800000::numeric,
              'YC11.1-NT7 tháng 10: các dòng người bán cộng bằng 11.800.000đ');
select t.bang(pg_temp.cac_thang(pg_temp.j10()), 'T5|0;T6|0;T7|0;T8|0;T9|9600000;T10|11800000',
              'YC11.1-NT1 YC11.1 bước 5 tháng 10: biểu đồ 6 tháng T5 đến T10, T9 9.600.000đ, T10 11.800.000đ');

-- ===== YC11.1-NT9, YC11-H9: chưa thu tiền tháng 10, hôm nay 07/10 =====
select t.bang((select string_agg(x, ';') from unnest(string_to_array(pg_temp.chua_thu(pg_temp.j10()), ';')) x
               where x like '%|chua_coc|%'),
              'B5|Khách lẻ|chua_coc|1800000|6;B2|Sale Lan|chua_coc|1900000|10',
              'YC11.1-NT9 tháng 10: dòng chưa cọc B5 Khách lẻ 1.800.000đ sau 6 ngày, B2 Sale Lan 1.900.000đ "nhận phòng sau 10 ngày" (hôm nay 07/10)');
select t.bang((select sum((e ->> 'so_tien')::bigint) from jsonb_array_elements(pg_temp.j10() -> 'chua_thu') e
               where e ->> 'trang_thai_tien' = 'chua_coc'), 3700000::numeric,
              'YC11.1-NT9 tháng 10: B2 và B5 chưa cọc cộng 3.700.000đ');
-- YC11.1-NT13, YC11-H9 (YC11 r3): B1 đã cọc 1.000.000đ còn thu 1.200.000đ (DLM.4) không có dòng; đã thanh toán, đã hủy cũng không.
select t.bang(pg_temp.chua_thu(pg_temp.j10()),
              'B5|Khách lẻ|chua_coc|1800000|6;B2|Sale Lan|chua_coc|1900000|10',
              'YC11.1-NT13 tháng 10: không có dòng B1 đã cọc; chỉ B5, B2 chưa cọc, ngày nhận tăng dần; không có H1 đã hủy');
select t.bang(pg_temp.j10() ->> 'tong_chua_thu', '3700000',
              'YC11.1-NT13 YC11.1-NT9 tháng 10: "CHƯA THU TIỀN" vẫn ghi 3.700.000đ');
select t.bang(pg_temp.j10() ->> 'hom_nay', '2026-10-07',
              'YC11.1-NT9 số ngày tính theo hôm nay giờ Việt Nam (local_today)');

-- ===== YC11.1-NT8: dữ liệu trả về không có giá bán, tiền chênh, mức cộng, khách của sale, đặt phòng chủ khác =====
select t.ok(pg_temp.j10() is not null and not exists (
              select 1 from unnest(pg_temp.cac_khoa(pg_temp.j10())) k
              where k ilike any (array['%gia_ban%', '%chenh%', '%muc_cong%', '%thu_khach%', '%ten_khach%', '%so_khach%',
                                       '%sdt%', '%dien_thoai%', '%tien_coc%', '%loi_nhan%'])),
            'YC11.1-NT8 KT-DB.3.11 PQ11.CHU PQ15.CHU dữ liệu trả về không có khóa giá bán, tiền chênh, mức cộng, khách, số khách');
select t.ok(pg_temp.j10() is not null
            and position('2650000' in pg_temp.j10()::text) = 0
            and position('Khách Riêng Của Hùng' in pg_temp.j10()::text) = 0
            and position('0900000077' in pg_temp.j10()::text) = 0
            and pg_temp.j10()::text !~ '(^|[^0-9])(200000|400000)([^0-9]|$)',
            'YC11.1-NT8 PQ9.CHU PQ11.CHU không có giá bán 2.650.000đ, tên và số khách Hùng nhập, mức cộng 200.000đ của Hùng');
select t.ok(pg_temp.j10() is not null
            and position(t.can('1103')::text in pg_temp.j10()::text) = 0
            and position(t.b('T1')::text in pg_temp.j10()::text) = 0
            and position(t.can('villa')::text in pg_temp.j10()::text) = 0
            and position(t.b('V1')::text in pg_temp.j10()::text) = 0,
            'YC11.1-NT8 PQ16.CHU PQ14.CHU không có căn, đặt phòng của Anh Tuấn hay căn tự nhập của Sale Hùng');
select t.ok(pg_temp.j10() is not null and position(t.b('H1')::text in pg_temp.j10()::text) = 0
            and position(t.b('Y1')::text in pg_temp.j10()::text) = 0,
            'YC11.1-NT8 QD12 QT3.1 không có đặt phòng đã hủy H1, không có yêu cầu đang chờ Y1');

-- ===== YC11.1-NT5 (database): đổi tháng, cửa sổ 6 tháng dời theo =====
select t.dang_nhap(t.id('hoa'));
select t.bang(pg_temp.tk('2026-10-20') ->> 'doanh_thu', '11800000',
              'YC11.1-NT1 ngày bất kỳ trong tháng 10 cho cùng số tháng 10');
select t.bang(pg_temp.cac_thang(pg_temp.tk('2026-12-01')), 'T7|0;T8|0;T9|9600000;T10|11800000;T11|800000;T12|800000',
              'YC11.1-NT4 QT2.2-VD1 tháng 12: biểu đồ T7 đến T12; B9 chia 800.000đ tháng 11, 800.000đ tháng 12');
select t.bang((pg_temp.tk('2026-11-01') ->> 'so_dem') || '/' || (pg_temp.tk('2026-11-01') ->> 'mau_so')
              || '|' || (pg_temp.tk('2026-11-01') ->> 'cong_suat'), '1/60|1.7',
              'YC11.1-NT2 tháng 11: 1 đêm (B9 30/11) trên 2 × 30 đêm, công suất 1.7');
select t.thoat();

-- ===== YC11.1 bước 9 (CN8-00): tháng chưa có đặt phòng =====
select t.dang_nhap(t.id('hoa'));
select set_config('t.j01', coalesce(pg_temp.tk('2027-01-01')::text, ''), true);
select t.thoat();
select t.bang((select j ->> 'doanh_thu' || '|' || (j ->> 'so_dem') || '|' || (j ->> 'mau_so') || '|' || (j ->> 'cong_suat')
                      || '|' || pg_temp.cac_can(j) || '|' || jsonb_array_length(j -> 'nguoi_ban') || '|'
                      || jsonb_array_length(j -> 'chua_thu') || '|' || (j ->> 'tong_chua_thu')
               from (select nullif(current_setting('t.j01', true), '')::jsonb j) x),
              '0|0|62|0.0|1509|0|0;3402|0|0|0|0|0',
              'YC11.1-NT11 CN8-00 tháng 1/2027: 0đ, hai phòng 0đ, 0 đêm, công suất 0, không người bán, không khoản chưa thu');

-- ===== YC11.1-NT4: đặt phòng vắt tháng 31/10 → 02/11 (QT4.2-VD3), rồi hủy =====
-- N4: 1509, khách lẻ, đêm 31/10 1.300.000đ, đêm 01/11 900.000đ, đã thanh toán.
with b as (
  insert into public.booking (id, can_id, ngay_nhan, ngay_tra, nguon, tao_boi, tien_phong, trang_thai_tien)
  values ('00000000-0000-0000-0058-000000000004', t.can('1509'), '2026-10-31', '2026-11-02', 'chu_ghi', t.id('hoa'),
          2200000, 'da_thanh_toan')
  returning id
)
insert into public.booking_dem (booking_id, dem, tien)
select b.id, v.d, v.tien from b, (values ('2026-10-31'::date, 1300000::bigint), ('2026-11-01'::date, 900000::bigint)) v(d, tien);
select set_config('t.ma_n4', '00000000-0000-0000-0058-000000000004', true);

select t.dang_nhap(t.id('hoa'));
select t.bang((pg_temp.tk('2026-10-01') ->> 'doanh_thu') || '|' || pg_temp.cac_can(pg_temp.tk('2026-10-01')),
              '13100000|1509|8000000|8;3402|5100000|6',
              'YC11.1-NT4 QT4.2-VD3 tháng 10 cộng 1.300.000đ của đêm 31/10: 13.100.000đ, 1509 8.000.000đ 8 đêm');
select t.bang((pg_temp.tk('2026-11-01') ->> 'doanh_thu') || '|' || pg_temp.cac_can(pg_temp.tk('2026-11-01')),
              '1700000|1509|900000|1;3402|800000|1',
              'YC11.1-NT4 QT4.2-VD3 tháng 11 cộng 900.000đ của đêm 01/11 (cùng 800.000đ của B9): 1.700.000đ');
select t.bang(pg_temp.nguoi_ban(pg_temp.tk('2026-10-01')),
              'Sale Hùng|4000000;Khách lẻ|3900000;Sale Lan|3500000;Sale Minh|1700000',
              'YC11.1-NT4 YC11.1-NT7 người bán theo đêm: Khách lẻ tháng 10 thêm 1.300.000đ của N4');
select t.bang(pg_temp.tk('2026-11-01') ->> 'doanh_thu_thang_truoc', '13100000',
              'YC11.1-NT4 tháng 11: tháng trước là 13.100.000đ');
select t.thoat();

update public.booking set trang_thai = 'da_huy' where id = t.b('N4');
select t.dang_nhap(t.id('hoa'));
select t.bang((pg_temp.tk('2026-10-01') ->> 'doanh_thu') || '|' || (pg_temp.tk('2026-10-01') ->> 'so_dem')
              || '|' || (pg_temp.tk('2026-11-01') ->> 'doanh_thu') || '|' || (pg_temp.tk('2026-11-01') ->> 'so_dem'),
              '11800000|13|800000|1',
              'YC11.1-NT4 QD12 hủy N4 thì không cộng vào tháng nào: tháng 10 11.800.000đ 13 đêm, tháng 11 800.000đ 1 đêm');
select t.bang(pg_temp.nguoi_ban(pg_temp.tk('2026-10-01')),
              'Sale Hùng|4000000;Sale Lan|3500000;Khách lẻ|2600000;Sale Minh|1700000',
              'YC11.1-NT4 YC11.1-NT7 đặt phòng đã hủy không vào dòng người bán');
select t.thoat();

-- ===== YC11.1-NT10: đánh dấu đã thu đủ B2 (YC5.5) =====
select t.dang_nhap(t.id('hoa'));
select t.khong_loi($$select public.fn_da_thu_du(t.b('B2'))$$, 'YC11.1-NT10 Chị Hoa đánh dấu đã thu đủ B2');
select t.bang(pg_temp.chua_thu(pg_temp.tk('2026-10-01')),
              'B5|Khách lẻ|chua_coc|1800000|6',
              'YC11.1-NT10 thu đủ B2 thì B2 không còn ở chưa thu tiền');
select t.bang(pg_temp.tk('2026-10-01') ->> 'doanh_thu', '11800000',
              'YC11.1-NT10 thu đủ B2 không đổi doanh thu tháng 10');
select t.thoat();

-- ===== YC11.1-NT13: đặt phòng đã cọc ở tháng khác cũng không có dòng (B20, 2.000.000đ, cọc 500.000đ) =====
select t.tao_booking('B20', t.can('1509'), '2026-11-15', '2026-11-17', 2000000);
update public.booking set trang_thai_tien = 'da_coc', tien_coc = 500000 where id = t.b('B20');
select t.dang_nhap(t.id('hoa'));
select t.bang(coalesce(jsonb_array_length(pg_temp.tk('2026-11-01') -> 'chua_thu'), -1) || '|'
              || (pg_temp.tk('2026-11-01') ->> 'tong_chua_thu'), '0|0',
              'YC11.1-NT13 tháng 11: B20 đã cọc còn thu 1.500.000đ không có dòng, chưa thu 0đ');
select t.thoat();

-- ===== YC11.1-NT12, YC11-H7: mẫu số công suất khi thêm, ẩn căn giữa tháng =====
-- Anh Tuấn có 1103 từ trước, thêm 2208 lúc 00:30 ngày 16/10 giờ Việt Nam (15/10 17:30 UTC).
insert into public.can (id, nguoi_giu, loai, ma_can, tao_luc)
values ('00000000-0000-0000-0001-000000002208', t.id('tuan'), 'co_lich', '2208', '2026-10-16 00:30+07');
select t.dang_nhap(t.id('tuan'));
select t.bang((pg_temp.tk('2026-10-01') ->> 'so_dem') || '/' || (pg_temp.tk('2026-10-01') ->> 'mau_so'), '1/47',
              'YC11.1-NT12 YC11-H7 có 1103 từ trước, thêm 2208 ngày 16/10 (giờ Việt Nam): mẫu số tháng 10 là 31 + 16 = 47');
select t.bang(pg_temp.tk('2026-09-01') ->> 'mau_so', '30',
              'YC11.1-NT12 tháng 9: 2208 chưa có, mẫu số chỉ 30 đêm của 1103');
select t.bang(pg_temp.cac_can(pg_temp.tk('2026-09-01')), '1103|0|0',
              'YC11.1-NT12 tháng 9: căn tạo sau tháng không có dòng');
select t.bang(pg_temp.tk('2026-10-01') ->> 'doanh_thu', '700000',
              'YC11.1-NT8 PQ16.CHU Anh Tuấn chỉ có doanh thu 1103, không có số của Chị Hoa');
select t.thoat();

-- Căn đã ẩn (xóa) 16/10 10:00 giờ Việt Nam: đêm từ 16/10 không vào mẫu số; doanh thu, đêm có khách vẫn tính.
update public.can set an_luc = '2026-10-16 10:00+07' where id = t.can('3402');
select t.dang_nhap(t.id('hoa'));
select t.bang((pg_temp.tk('2026-10-01') ->> 'doanh_thu') || '|' || (pg_temp.tk('2026-10-01') ->> 'so_dem') || '/'
              || (pg_temp.tk('2026-10-01') ->> 'mau_so') || '|' || (pg_temp.tk('2026-10-01') ->> 'cong_suat'),
              '11800000|13/46|28.3',
              'YC11.1-NT12 YC11-H7 ẩn 3402 ngày 16/10: tháng 10 vẫn 11.800.000đ, 13 đêm; mẫu số 31 + 15 = 46, công suất 28.3');
select t.bang(pg_temp.cac_can(pg_temp.tk('2026-10-01')), '1509|6700000|7;3402|5100000|6',
              'YC11.1-NT1 căn đã ẩn có doanh thu trong tháng vẫn có dòng');
select t.bang(pg_temp.tk('2026-12-01') ->> 'mau_so', '31',
              'YC11.1-NT12 tháng 12: căn đã ẩn không vào mẫu số');
select t.bang(pg_temp.cac_can(pg_temp.tk('2027-01-01')), '1509|0|0',
              'YC11.1-NT12 tháng 1/2027: căn đã ẩn không có doanh thu thì không có dòng');
select t.thoat();
update public.can set an_luc = null where id = t.can('3402');

-- ===== Vi phạm quyền (YC11 "Ai được làm gì", PQ15, PQ16) =====
-- PQ16.SALE: sale không bao giờ có số của chủ nhà, kể cả sale được chia sẻ mọi căn.
select t.dang_nhap(t.id('hung'));
select set_config('t.jh', coalesce(pg_temp.tk('2026-10-01')::text, ''), true);
select t.thoat();
select t.ok((select j ->> 'doanh_thu' = '0' and jsonb_array_length(j -> 'can') = 0 and jsonb_array_length(j -> 'nguoi_ban') = 0
                    and jsonb_array_length(j -> 'chua_thu') = 0
                    and position(t.can('1509')::text in j::text) = 0 and position(t.b('B2')::text in j::text) = 0
                    and position(t.b('B5')::text in j::text) = 0
             from (select nullif(current_setting('t.jh', true), '')::jsonb j) x),
            'YC11.1-NT8 PQ16.SALE Sale Hùng gọi thống kê chủ nhà: không có doanh thu Chị Hoa, B2 của Lan, B5 khách lẻ, căn tự nhập');
select t.dang_nhap(t.id('lan'));
select t.ok((select j ->> 'doanh_thu' = '0' and jsonb_array_length(j -> 'can') = 0 and jsonb_array_length(j -> 'chua_thu') = 0
             from (select pg_temp.tk('2026-10-01') j) x),
            'YC11.1-NT8 PQ16.SALE Sale Lan gọi thống kê chủ nhà tháng 10 thì không có số của Chị Hoa');
select t.thoat();
select t.dang_nhap(t.id('nga'));
select t.ok((select j ->> 'doanh_thu' = '0' and jsonb_array_length(j -> 'can') = 0
             from (select pg_temp.tk('2026-10-01') j) x),
            'YC11.1-NT8 PQ16.SALE Sale Nga (chưa kết nối) gọi thống kê chủ nhà thì không có số');
select t.thoat();
-- PQ16.LINK: người chưa đăng nhập bị từ chối.
select t.khach();
select t.loi($$select public.fn_thong_ke_chu('2026-10-01')$$, '42501',
             'YC11.1-NT8 PQ16.LINK người chưa đăng nhập gọi thống kê chủ nhà thì bị từ chối');
select t.thoat();
-- Không đọc thẳng booking_rieng của sale (PQ9.CHU, PQ11.CHU).
select t.dang_nhap(t.id('hoa'));
select t.bang(coalesce(t.so($$select 1 from public.booking_rieng where nguoi_id = t.id('hung')$$), 0), 0::bigint,
              'YC11.1-NT8 PQ11.CHU Chị Hoa không đọc được phần riêng (giá bán, khách) của Sale Hùng');
select t.thoat();
-- Số tháng ngoài 1..12 bị từ chối (YC11 "Dữ liệu": tới 12 tháng).
select t.dang_nhap(t.id('hoa'));
select t.ok(t.ma_loi($$select public.fn_thong_ke_chu('2026-10-01', 13)$$) is not null
            and t.ma_loi($$select public.fn_thong_ke_chu('2026-10-01', 12)$$) is null,
            'YC11.1-NT5 lệnh nhận tới 12 tháng, 13 tháng bị từ chối');
select t.thoat();
