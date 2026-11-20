-- US59 · Thống kê của sale (YC11.2). Viết trước code (US59-TA1, CL14.5): task sau không sửa kỳ vọng của file này.
-- Hợp đồng database cho S7, S7-00 (YC11 "Dữ liệu", YC11-H8, thiet-ke-db.md mục 3 bất biến 5, 6, 11):
--   fn_thong_ke_sale(p_thang date, p_so_thang int default 2) → jsonb, của người gọi (không nhận mã sale):
--   {thang, so_dat_phong, doanh_so, tien_chenh, so_dat_phong_thang_truoc, doanh_so_thang_truoc, tien_chenh_thang_truoc,
--    cac_thang: [{thang, so_dat_phong, doanh_so, tien_chenh}] (p_so_thang tháng, cũ trước, tháng đang xem cuối),
--    theo_chu: [{chu_id, tu_nhap, ten, doanh_so, tien_chenh}] (doanh số giảm dần; chủ căn tự nhập: chu_id null, tu_nhap true),
--    cho_chu: [{yeu_cau_id, can_id, ma_can, ten_toa, ngay_nhan, ngay_tra, gui_luc, ten_chu}] (mọi yêu cầu đang chờ, không
--    theo tháng), so_cho_chu}.
-- Đặt phòng của sale: sale_id là người gọi, hoặc nguồn sale_tu_ghi ở căn tự nhập của người gọi; bỏ căn của tôi (YC11-H1),
-- bỏ đặt phòng đã hủy (QD12). Doanh số, tiền chênh theo đêm, giá bán chia theo đêm (YC11-H2); số đặt phòng theo tháng của
-- ngày nhận (YC11-H6). Số theo DLM.6. Tháng 9 DLM.6 chỉ có tổng (4 đặt phòng, 9.800.000đ, chênh 1.200.000đ) và V1: ba đặt
-- phòng còn lại S1, S2, S3 là dàn dựng của file này, cộng đúng tổng đó.
-- QT2.1, QT2.2, QT3.1, QT3.2, QT4.2, QD10, QD12, QD13, PQ7.SALE, PQ9.SALE, PQ10.SALE, PQ11, PQ14.SALE, PQ15, PQ16.SALE.
select t.fixture();

-- DLM.1: "hôm nay" là 07/10/2026 (thay local_today() trong giao dịch của file này, như 74_us58_thong_ke_chu.sql).
create or replace function pg_temp.hom_nay(p_ngay date) returns void language plpgsql as $hn$
begin
  execute format('create or replace function public.local_today() returns date '
                 'language sql stable security definer set search_path = '''' as $b$ select date %L $b$', p_ngay);
end $hn$;
select pg_temp.hom_nay('2026-10-07');

-- DLM.3, DLM.6: À La Carte 2208 của Anh Tuấn; Anh Tuấn chia sẻ hai căn cho Hùng (bộ rút gọn chưa có).
insert into public.toa_nha (id, ten, home247_dat_san, tao_boi)
values ('00000000-0000-0000-0002-000000002208', 'À La Carte', true, null);
insert into public.can (id, nguoi_giu, loai, ma_can, so_phong_ngu, so_giuong, toa_nha_id)
values ('00000000-0000-0000-0001-000000002208', t.id('tuan'), 'co_lich', '2208', 1, 1,
        '00000000-0000-0000-0002-000000002208');
insert into public.ket_noi (chu_id, sale_id, trang_thai, nguon, pham_vi)
values (t.id('tuan'), t.id('hung'), 'da_ket_noi', 'link_moi', 'tat_ca');
create or replace function pg_temp.c2208() returns uuid language sql immutable as
  $$ select '00000000-0000-0000-0001-000000002208'::uuid $$;
-- DLM.2: căn của tôi Green Bay 0812 của Sale Hùng (căn có lịch, Hùng là người giữ; QD5).
insert into public.can (id, nguoi_giu, loai, ma_can, so_phong_ngu)
values ('00000000-0000-0000-0001-000000000812', t.id('hung'), 'co_lich', 'Green Bay 0812', 2);
create or replace function pg_temp.c0812() returns uuid language sql immutable as
  $$ select '00000000-0000-0000-0001-000000000812'::uuid $$;
update public.can set tao_luc = '2026-08-01 08:00+07';

-- Giá bán (phần riêng của sale, QD11) của một đặt phòng.
create or replace function pg_temp.ban(p_ma text, p_nguoi uuid, p_tien bigint) returns void language sql as $$
  insert into public.booking_rieng (booking_id, nguoi_id, tien_thu_khach) values (t.b(p_ma), p_nguoi, p_tien)
  on conflict (booking_id, nguoi_id) do update set tien_thu_khach = excluded.tien_thu_khach
$$;

-- QD12: hủy một đặt phòng có sale đứng tên đúng luật hai bên (sale xin, chủ nhà đồng ý) trong một câu lệnh.
create or replace function pg_temp.huy(p_ma text) returns void language sql as $$
  update public.booking b set huy_xin_boi = b.sale_id, huy_xin_luc = now(), huy_tra_loi = 'dong_y',
         huy_tra_loi_boi = (select c.nguoi_giu from public.can c where c.id = b.can_id), huy_tra_loi_luc = now(),
         trang_thai = 'da_huy'
  where b.id = t.b(p_ma)
$$;

-- DLM.6: sáu đặt phòng đã chốt tháng 10 của Sale Hùng.
select t.tao_booking('B1', t.can('1509'), '2026-10-10', '2026-10-12', 2200000, t.id('hung'), 'tu_yeu_cau');
select t.tao_booking('B3', t.can('1509'), '2026-10-04', '2026-10-06', 1800000, t.id('hung'), 'tu_yeu_cau');
select t.tao_booking('H3', t.can('1103'), '2026-10-18', '2026-10-20', 1400000, t.id('hung'), 'tu_yeu_cau');
select t.tao_booking('H4', t.can('1103'), '2026-10-21', '2026-10-22', 700000, t.id('hung'), 'tu_yeu_cau');
select t.tao_booking('H5', pg_temp.c2208(), '2026-10-13', '2026-10-14', 1500000, t.id('hung'), 'tu_yeu_cau');
select t.tao_booking('V2', t.can('villa'), '2026-10-08', '2026-10-09', 1400000);
select pg_temp.ban('B3', t.id('hung'), 2200000);
select pg_temp.ban('H3', t.id('hung'), 1600000);
select pg_temp.ban('H4', t.id('hung'), 800000);
select pg_temp.ban('H5', t.id('hung'), 1800000);
select pg_temp.ban('V2', t.id('hung'), 1600000);
-- B1: phần riêng của Hùng có giá bán 2.600.000đ và khách Hùng nhập (QD11); cọc 1.000.000đ (DLM.4).
insert into public.booking_rieng (booking_id, nguoi_id, ten_khach, sdt_khach, so_khach, tien_thu_khach)
values (t.b('B1'), t.id('hung'), 'Khách Riêng Của Hùng', '0900000077', 4, 2600000);
update public.booking set trang_thai_tien = 'da_coc', tien_coc = 1000000 where id = t.b('B1');

-- DLM.6 tháng 9: V1 (Villa, trả chủ 2.800.000đ, thu khách 3.400.000đ) và ba đặt phòng dàn dựng S1, S2, S3.
select t.tao_booking('V1', t.can('villa'), '2026-09-20', '2026-09-22', 2800000);
select t.tao_booking('S1', t.can('1509'), '2026-09-05', '2026-09-07', 1800000, t.id('hung'), 'tu_yeu_cau');
select t.tao_booking('S2', t.can('1103'), '2026-09-12', '2026-09-14', 1400000, t.id('hung'), 'tu_yeu_cau');
select t.tao_booking('S3', t.can('3402'), '2026-09-19', '2026-09-22', 2600000, t.id('hung'), 'chu_ghi');
select pg_temp.ban('V1', t.id('hung'), 3400000);
select pg_temp.ban('S1', t.id('hung'), 2000000);
select pg_temp.ban('S2', t.id('hung'), 1600000);
select pg_temp.ban('S3', t.id('hung'), 2800000);

-- DLM.4: đặt phòng không phải của Hùng. B2 của Sale Lan (giá bán của Lan 2.300.000đ, khách Lan nhập), B5, B6 khách lẻ.
select t.tao_booking('B2', t.can('3402'), '2026-10-17', '2026-10-19', 1900000, t.id('lan'), 'chu_ghi');
insert into public.booking_rieng (booking_id, nguoi_id, ten_khach, sdt_khach, so_khach, tien_thu_khach)
values (t.b('B2'), t.id('lan'), 'Khách Của Lan', '0900000066', 2, 2300000);
select t.tao_booking('B5', t.can('1509'), '2026-10-13', '2026-10-15', 1800000);
insert into public.booking_rieng (booking_id, nguoi_id, ten_khach, sdt_khach, so_khach)
values (t.b('B5'), t.id('hoa'), 'Khách Của Chị Hoa', '0900000088', 3);
select t.tao_booking('B6', t.can('3402'), '2026-10-14', '2026-10-15', 800000);
update public.booking set trang_thai_tien = 'chua_coc' where id in (t.b('B2'), t.b('B5'));
update public.booking set trang_thai_tien = 'da_thanh_toan' where id = t.b('B6');

-- QD12: đặt phòng đã hủy của Hùng (1103, 27/10 → 28/10) không tính.
select t.tao_booking('X1', t.can('1103'), '2026-10-27', '2026-10-28', 700000, t.id('hung'), 'tu_yeu_cau');
select pg_temp.ban('X1', t.id('hung'), 900000);
select pg_temp.huy('X1');

-- YC11-H1, QD5: đặt phòng ở căn của tôi Green Bay 0812. G1 Hùng tự ghi như chủ nhà (khách lẻ); G2 có sale_id là chính
-- Hùng (không lệnh nào tạo ra, dựng để chắc lệnh bỏ theo căn chứ không chỉ theo người đặt).
select t.tao_booking('G1', pg_temp.c0812(), '2026-10-08', '2026-10-10', 1500000);
select pg_temp.ban('G1', t.id('hung'), 1700000);
select t.tao_booking('G2', pg_temp.c0812(), '2026-10-15', '2026-10-16', 750000, t.id('hung'), 'chu_ghi');
select pg_temp.ban('G2', t.id('hung'), 900000);

-- DLM.6 yêu cầu. Y1 đang chờ: À La Carte 2208 · 10/10 → 12/10, giá chủ 3.000.000đ, giá bán 3.600.000đ, gửi 14:20 07/10.
-- Hạn 14 ngày tính từ giờ chạy test (yeu_cau_qua_han so với now()), để Y1 còn chờ.
select t.tao_yeu_cau('Y1', pg_temp.c2208(), t.id('hung'), '2026-10-10', '2026-10-12', array[1500000, 1500000]::bigint[]);
update public.yeu_cau_dat_phong set gui_luc = '2026-10-07 14:20+07' where id = t.b('Y1');
insert into public.yeu_cau_rieng (yeu_cau_id, sale_id, gia_ban_dem) values (t.b('Y1'), t.id('hung'), array[1800000, 1800000]);
-- Y2 hết hạn, Y3 đã hủy, Y4 bị từ chối (S7-03, không tính). Y5 còn 'cho' nhưng ngày nhận đã qua (đọc ra Hết hạn).
select t.tao_yeu_cau('Y2', t.can('1509'), t.id('hung'), '2026-09-27', '2026-09-28', array[900000]::bigint[]);
update public.yeu_cau_dat_phong set trang_thai = 'het_han' where id = t.b('Y2');
select t.tao_yeu_cau('Y3', pg_temp.c2208(), t.id('hung'), '2026-10-20', '2026-10-21', array[1500000]::bigint[]);
update public.yeu_cau_dat_phong set trang_thai = 'da_huy' where id = t.b('Y3');
select t.tao_yeu_cau('Y4', t.can('1103'), t.id('hung'), '2026-10-05', '2026-10-06', array[700000]::bigint[]);
update public.yeu_cau_dat_phong set trang_thai = 'bi_tu_choi', ly_do_tu_choi = 'Đã có khách' where id = t.b('Y4');
select t.tao_yeu_cau('Y5', t.can('1103'), t.id('hung'), '2026-10-01', '2026-10-02', array[700000]::bigint[]);
-- Y6: yêu cầu đang chờ của Sale Lan (1509, 24/10 → 26/10).
select t.tao_yeu_cau('Y6', t.can('1509'), t.id('lan'), '2026-10-24', '2026-10-26', array[1300000, 900000]::bigint[]);

-- Gọi lệnh bằng vai hiện tại; lỗi thì null (test đỏ, file chạy tiếp).
create or replace function pg_temp.tk(p_thang date, p_so int default null) returns jsonb language plpgsql as $$
begin
  if p_so is null then
    return t.gt(format('select public.fn_thong_ke_sale(%L)', p_thang))::jsonb;
  end if;
  return t.gt(format('select public.fn_thong_ke_sale(%L, %s)', p_thang, p_so))::jsonb;
end $$;
-- "so_dat_phong|doanh_so|tien_chenh".
create or replace function pg_temp.so(j jsonb) returns text language sql stable as $$
  select (j ->> 'so_dat_phong') || '|' || (j ->> 'doanh_so') || '|' || (j ->> 'tien_chenh')
$$;
-- "so_dat_phong|doanh_so|tien_chenh" của tháng trước.
create or replace function pg_temp.so_truoc(j jsonb) returns text language sql stable as $$
  select (j ->> 'so_dat_phong_thang_truoc') || '|' || (j ->> 'doanh_so_thang_truoc') || '|' || (j ->> 'tien_chenh_thang_truoc')
$$;
-- "tên|doanh_so|tien_chenh" theo thứ tự trả về.
create or replace function pg_temp.theo_chu(j jsonb) returns text language sql stable as $$
  select coalesce(string_agg((e ->> 'ten') || '|' || (e ->> 'doanh_so') || '|' || (e ->> 'tien_chenh'), ';' order by i), '')
  from jsonb_array_elements(j -> 'theo_chu') with ordinality x(e, i)
$$;
-- "T<tháng>|so_dat_phong|doanh_so|tien_chenh".
create or replace function pg_temp.cac_thang(j jsonb) returns text language sql stable as $$
  select string_agg('T' || extract(month from (e ->> 'thang')::date) || '|' || (e ->> 'so_dat_phong') || '|'
                    || (e ->> 'doanh_so') || '|' || (e ->> 'tien_chenh'), ';' order by i)
  from jsonb_array_elements(j -> 'cac_thang') with ordinality x(e, i)
$$;
-- "mã căn|tòa|nhận|trả|chủ|giờ gửi (giờ Việt Nam)" của các yêu cầu chờ.
create or replace function pg_temp.cho_chu(j jsonb) returns text language sql stable as $$
  select coalesce(string_agg((e ->> 'ma_can') || '|' || coalesce(e ->> 'ten_toa', '') || '|' || (e ->> 'ngay_nhan') || '|'
                    || (e ->> 'ngay_tra') || '|' || (e ->> 'ten_chu') || '|'
                    || to_char((e ->> 'gui_luc')::timestamptz at time zone 'Asia/Ho_Chi_Minh', 'HH24:MI'), ';' order by i), '')
  from jsonb_array_elements(j -> 'cho_chu') with ordinality x(e, i)
$$;
-- Mọi tên khóa trong dữ liệu trả về.
create or replace function pg_temp.cac_khoa(j jsonb) returns text[] language sql stable as $$
  select coalesce(array_agg(distinct k[1]), '{}') from regexp_matches(coalesce(j::text, ''), '"([a-z_]+)":', 'g') k
$$;
-- Có id của đặt phòng hay yêu cầu (theo mã) trong dữ liệu trả về.
create or replace function pg_temp.co(j jsonb, p_ma text) returns boolean language sql stable as $$
  select position(t.b(p_ma)::text in coalesce(j::text, '')) > 0
$$;
-- Lưu kết quả của một vai vào biến giao dịch để đọc sau khi thoát vai.
create or replace function pg_temp.luu(p_ten text, j jsonb) returns void language sql as $$
  select set_config('t.' || p_ten, coalesce(j::text, ''), true)
$$;
create or replace function pg_temp.doc(p_ten text) returns jsonb language sql stable as $$
  select nullif(current_setting('t.' || p_ten, true), '')::jsonb
$$;

-- ===== Danh mục và quyền gọi =====
select t.ok(exists (select 1 from pg_proc where proname = 'fn_thong_ke_sale'
                      and pronamespace = 'public'::regnamespace and prosecdef),
            'YC11.2-NT6 danh mục: fn_thong_ke_sale có và chạy security definer');
select t.ok(exists (select 1 from pg_proc where proname = 'fn_thong_ke_sale' and pronamespace = 'public'::regnamespace)
            and not exists (select 1 from pg_proc where proname = 'fn_thong_ke_sale' and pronamespace = 'public'::regnamespace
                              and ('uuid'::regtype = any (proargtypes::regtype[]) or 'text'::regtype = any (proargtypes::regtype[]))),
            'YC11.2-NT6 PQ15.SALE lệnh thống kê của sale không nhận mã sale hay mã người khác');
select t.ok(exists (select 1 from pg_proc where proname = 'fn_thong_ke_sale' and pronamespace = 'public'::regnamespace)
            and not exists (select 1 from pg_proc p where p.proname = 'fn_thong_ke_sale'
                              and p.pronamespace = 'public'::regnamespace and has_function_privilege('anon', p.oid, 'execute')),
            'YC11.2-NT6 PQ15.LINK người chưa đăng nhập không có quyền gọi fn_thong_ke_sale');

-- ===== YC11.2-NT1, NT3, NT4: Sale Hùng xem tháng 10 =====
select t.dang_nhap(t.id('hung'));
select pg_temp.luu('h10', pg_temp.tk('2026-10-01'));
select t.thoat();

select t.bang(pg_temp.so(pg_temp.doc('h10')), '6|10600000|1600000',
              'YC11.2-NT1 Hùng tháng 10: 6 đặt phòng (B1, B3, H3, H4, H5, V2), doanh số 10.600.000đ, tiền chênh 1.600.000đ (DLM.6)');
select t.bang(pg_temp.so_truoc(pg_temp.doc('h10')), '4|9800000|1200000',
              'YC11.2-NT1 YC11.2 bước 2, 3 tháng 9: 4 đặt phòng, doanh số 9.800.000đ, tiền chênh 1.200.000đ để so sánh');
select t.bang(pg_temp.cac_thang(pg_temp.doc('h10')), 'T9|4|9800000|1200000;T10|6|10600000|1600000',
              'YC11.2-NT1 YC11-H8 mặc định hai tháng: tháng 9 rồi tháng 10');
select t.bang(pg_temp.doc('h10') ->> 'thang', '2026-10-01',
              'YC11.2-NT1 dữ liệu ghi tháng đang xem 10/2026');
select t.bang(pg_temp.theo_chu(pg_temp.doc('h10')),
              'Chị Hoa|4800000|800000;Anh Tuấn|4200000|600000;Chú Bình|1600000|200000',
              'YC11.2-NT3 theo chủ nhà: Chị Hoa 4.800.000đ chênh 800.000đ, Anh Tuấn 4.200.000đ chênh 600.000đ, Chú Bình 1.600.000đ chênh 200.000đ');
select t.ok((select bool_and(case when e ->> 'ten' = 'Chú Bình' then (e ->> 'tu_nhap')::boolean and e ->> 'chu_id' is null
                                  else not (e ->> 'tu_nhap')::boolean and e ->> 'chu_id' is not null end)
             from jsonb_array_elements(pg_temp.doc('h10') -> 'theo_chu') e),
            'YC11.2-NT3 YC11.2 bước 4 có cả chủ căn tự nhập: Chú Bình là dòng căn tự nhập, hai chủ nhà có mã chủ');
select t.bang((select sum((e ->> 'doanh_so')::bigint) || '|' || sum((e ->> 'tien_chenh')::bigint)
               from jsonb_array_elements(pg_temp.doc('h10') -> 'theo_chu') e), '10600000|1600000',
              'YC11.2-NT3 các dòng theo chủ nhà cộng bằng doanh số 10.600.000đ, tiền chênh 1.600.000đ');

-- YC11.2-NT4: Y1 đang chờ không cộng vào số, chỉ có ở chờ chủ nhà.
select t.bang((pg_temp.doc('h10') ->> 'so_cho_chu') || '#' || pg_temp.cho_chu(pg_temp.doc('h10')),
              '1#2208|À La Carte|2026-10-10|2026-10-12|Anh Tuấn|14:20',
              'YC11.2-NT4 "CHỜ CHỦ NHÀ CHẤP NHẬN: 1": À La Carte 2208 · 10/10 → 12/10, gửi 14:20, Anh Tuấn chưa trả lời');
select t.ok(pg_temp.doc('h10') is not null and pg_temp.co(pg_temp.doc('h10'), 'Y1')
            and pg_temp.so(pg_temp.doc('h10')) = '6|10600000|1600000'
            and position('3600000' in pg_temp.doc('h10')::text) = 0,
            'YC11.2-NT4 QT3.1 Y1 (giá bán 3.600.000đ) không cộng vào đặt phòng, doanh số, tiền chênh');
select t.ok(pg_temp.doc('h10') is not null
            and not pg_temp.co(pg_temp.doc('h10'), 'Y2') and not pg_temp.co(pg_temp.doc('h10'), 'Y3')
            and not pg_temp.co(pg_temp.doc('h10'), 'Y4') and not pg_temp.co(pg_temp.doc('h10'), 'Y5'),
            'YC11.2-NT4 yêu cầu hết hạn, đã hủy, bị từ chối, quá ngày nhận không ở chờ chủ nhà');
select t.ok(pg_temp.doc('h10') is not null and not pg_temp.co(pg_temp.doc('h10'), 'X1')
            and position('900000' in pg_temp.doc('h10')::text) = 0,
            'YC11.2-NT1 QD12 đặt phòng đã hủy X1 của Hùng không tính');

-- YC11.2-NT4: yêu cầu chờ không theo tháng (giả định GD26): xem tháng 9 hay tháng 12 vẫn có Y1.
select t.dang_nhap(t.id('hung'));
select t.bang((pg_temp.tk('2026-12-01') ->> 'so_cho_chu') || '|' || pg_temp.so(pg_temp.tk('2026-12-01')), '1|0|0|0',
              'YC11.2-NT4 GD26 tháng 12 chưa có đặt phòng: vẫn 1 yêu cầu chờ chủ nhà');
select t.bang(pg_temp.theo_chu(pg_temp.tk('2026-09-01')),
              'Chị Hoa|4800000|400000;Chú Bình|3400000|600000;Anh Tuấn|1600000|200000',
              'YC11.2-NT3 tháng 9 theo chủ nhà: Chị Hoa 4.800.000đ, Chú Bình (V1) 3.400.000đ, Anh Tuấn 1.600.000đ');
select t.bang(pg_temp.so(pg_temp.tk('2026-10-20')), '6|10600000|1600000',
              'YC11.2-NT1 YC11-H8 ngày bất kỳ trong tháng 10 cho cùng số tháng 10');
select t.thoat();

-- ===== YC11.2-NT11, YC11-H1: căn của tôi không tính =====
select t.ok(pg_temp.doc('h10') is not null
            and not pg_temp.co(pg_temp.doc('h10'), 'G1') and not pg_temp.co(pg_temp.doc('h10'), 'G2')
            and position(pg_temp.c0812()::text in pg_temp.doc('h10')::text) = 0
            and position('Green Bay' in pg_temp.doc('h10')::text) = 0,
            'YC11.2-NT11 đặt phòng ở Green Bay 0812 (căn của tôi) không có trong thống kê của Hùng');
select t.ok(pg_temp.so(pg_temp.doc('h10')) = '6|10600000|1600000'
            and position('Sale Hùng' in pg_temp.theo_chu(pg_temp.doc('h10'))) = 0,
            'YC11.2-NT11 kể cả đặt phòng căn của tôi mang sale là Hùng: vẫn 6 đặt phòng, không có dòng chủ là chính Hùng');

-- ===== YC11.2-NT6: vi phạm quyền (YC11 "Ai được làm gì", PQ9, PQ11, PQ15, PQ16) =====
-- Sale Hùng không có doanh thu của Chị Hoa, B2 của Lan, B5 khách lẻ, tên và số khách, tiền cọc.
select t.ok(pg_temp.doc('h10') is not null and not exists (
              select 1 from unnest(pg_temp.cac_khoa(pg_temp.doc('h10'))) k
              where k ilike any (array['%ten_khach%', '%so_khach%', '%sdt%', '%dien_thoai%', '%tien_coc%', '%doanh_thu%',
                                       '%trang_thai_tien%', '%loi_nhan%'])),
            'YC11.2-NT6 KT-DB.3.11 PQ9.SALE PQ16.SALE dữ liệu trả về không có khóa tên khách, số khách, tiền cọc, doanh thu chủ nhà');
select t.ok(pg_temp.doc('h10') is not null
            and not pg_temp.co(pg_temp.doc('h10'), 'B2') and not pg_temp.co(pg_temp.doc('h10'), 'B5')
            and not pg_temp.co(pg_temp.doc('h10'), 'B6') and not pg_temp.co(pg_temp.doc('h10'), 'Y6')
            and position('2300000' in pg_temp.doc('h10')::text) = 0
            and position('Sale Lan' in pg_temp.doc('h10')::text) = 0,
            'YC11.2-NT6 PQ7.SALE PQ11.SALE Hùng không có B2 và giá bán 2.300.000đ của Lan, B5, B6 khách lẻ, yêu cầu của Lan');
select t.ok(pg_temp.doc('h10') is not null
            and position('Khách Của Chị Hoa' in pg_temp.doc('h10')::text) = 0
            and position('0900000088' in pg_temp.doc('h10')::text) = 0
            and position('Khách Của Lan' in pg_temp.doc('h10')::text) = 0
            and position('Khách Riêng Của Hùng' in pg_temp.doc('h10')::text) = 0
            and position('0900000077' in pg_temp.doc('h10')::text) = 0,
            'YC11.2-NT6 PQ9.SALE QD11 Hùng không đọc được tên và số khách qua thống kê');
select t.ok(pg_temp.doc('h10') is not null and position('11800000' in pg_temp.doc('h10')::text) = 0
            and position('1000000' in pg_temp.doc('h10')::text) = 0,
            'YC11.2-NT6 PQ16.SALE Hùng không có doanh thu 11.800.000đ của Chị Hoa, không có tiền cọc 1.000.000đ của B1');

-- Sale Lan đọc thống kê: chỉ B2 của mình, không có số nào của Hùng.
select t.dang_nhap(t.id('lan'));
select pg_temp.luu('l10', pg_temp.tk('2026-10-01'));
select t.ok(t.ma_loi(format($$select public.fn_thong_ke_sale('2026-10-01', 2, %L::uuid)$$, t.id('hung'))) is not null
            and t.ma_loi(format($$select public.fn_thong_ke_sale('2026-10-01', %L::uuid)$$, t.id('hung'))) is not null,
            'YC11.2-NT6 Sale Lan gửi kèm mã của Hùng thì lệnh không nhận');
select t.thoat();
select t.bang(pg_temp.so(pg_temp.doc('l10')) || '#' || pg_temp.theo_chu(pg_temp.doc('l10')),
              '1|2300000|400000#Chị Hoa|2300000|400000',
              'YC11.2-NT6 PQ15.SALE Sale Lan tháng 10: chỉ B2 của mình, 2.300.000đ, chênh 400.000đ');
select t.ok(pg_temp.doc('l10') is not null
            and not pg_temp.co(pg_temp.doc('l10'), 'B1') and not pg_temp.co(pg_temp.doc('l10'), 'B3')
            and not pg_temp.co(pg_temp.doc('l10'), 'V2') and not pg_temp.co(pg_temp.doc('l10'), 'Y1')
            and position(t.can('villa')::text in pg_temp.doc('l10')::text) = 0
            and position('Chú Bình' in pg_temp.doc('l10')::text) = 0
            and position('Anh Tuấn' in pg_temp.doc('l10')::text) = 0
            and position('10600000' in pg_temp.doc('l10')::text) = 0
            and position('2600000' in pg_temp.doc('l10')::text) = 0
            and position('Khách Riêng Của Hùng' in pg_temp.doc('l10')::text) = 0,
            'YC11.2-NT6 PQ10.SALE PQ14.SALE Lan không có đặt phòng, yêu cầu, căn tự nhập, giá bán, khách của Hùng');
select t.bang((pg_temp.doc('l10') ->> 'so_cho_chu') || '#' || pg_temp.cho_chu(pg_temp.doc('l10')) like '1#1509|ICON40|2026-10-24|2026-10-26|Chị Hoa|%',
              true, 'YC11.2-NT6 PQ10.SALE chờ chủ nhà của Lan chỉ có yêu cầu của Lan');

-- Sale Nga (chưa kết nối ai) và chủ nhà Chị Hoa gọi lệnh của sale: không có số nào.
select t.dang_nhap(t.id('nga'));
select t.bang(pg_temp.so(pg_temp.tk('2026-10-01')) || '|' || (pg_temp.tk('2026-10-01') ->> 'so_cho_chu')
              || '|' || jsonb_array_length(pg_temp.tk('2026-10-01') -> 'theo_chu'), '0|0|0|0|0',
              'YC11.2-NT6 PQ15.SALE Sale Nga gọi thống kê sale thì không có số của ai');
select t.thoat();
select t.dang_nhap(t.id('hoa'));
select pg_temp.luu('c10', pg_temp.tk('2026-10-01'));
select t.thoat();
select t.ok(pg_temp.doc('c10') is not null and pg_temp.so(pg_temp.doc('c10')) = '0|0|0'
            and jsonb_array_length(pg_temp.doc('c10') -> 'theo_chu') = 0
            and position('2600000' in pg_temp.doc('c10')::text) = 0
            and not pg_temp.co(pg_temp.doc('c10'), 'B1'),
            'YC11.1-NT8 PQ11.CHU PQ15.CHU Chị Hoa gọi thống kê sale: không có giá bán, tiền chênh của Hùng');
-- Người chưa đăng nhập bị từ chối.
select t.khach();
select t.loi($$select public.fn_thong_ke_sale('2026-10-01')$$, '42501',
             'YC11.2-NT6 PQ15.LINK người chưa đăng nhập gọi thống kê sale thì bị từ chối');
select t.thoat();
-- Sale không đọc thẳng booking (KT-DB.3.5), không đọc phần riêng của Lan, Chị Hoa.
select t.dang_nhap(t.id('hung'));
select t.bang(coalesce(t.so($$select 1 from public.booking where sale_id = t.id('hung')
                                and can_id <> '00000000-0000-0000-0001-000000000812'$$), 0), 0::bigint,
              'YC11.2-NT6 KT-DB.3.5 Hùng không đọc thẳng bảng booking ở căn của chủ nhà');
select t.bang(coalesce(t.so($$select 1 from public.booking_rieng where nguoi_id <> t.id('hung')$$), 0), 0::bigint,
              'YC11.2-NT6 PQ9.SALE Hùng không đọc phần riêng (khách, giá bán) của Lan hay Chị Hoa');
select t.thoat();

-- ===== YC11.2-NT9, NT10, YC11-H2, H6: đặt phòng vắt tháng H20 31/10 → 02/11 =====
-- H20: 1509, giá chủ 1.000.000đ mỗi đêm, giá bán 2.500.000đ.
select t.tao_booking('H20', t.can('1509'), '2026-10-31', '2026-11-02', 2000000, t.id('hung'), 'tu_yeu_cau');
select pg_temp.ban('H20', t.id('hung'), 2500000);
select t.dang_nhap(t.id('hung'));
select t.bang(pg_temp.so(pg_temp.tk('2026-10-01')), '7|11850000|1850000',
              'YC11.2-NT9 YC11.2-NT10 tháng 10 cộng H20: thêm 1 đặt phòng, doanh số 1.250.000đ, chênh 250.000đ');
select t.bang(pg_temp.so(pg_temp.tk('2026-11-01')), '0|1250000|250000',
              'YC11.2-NT9 YC11.2-NT10 tháng 11: H20 không đếm vào số đặt phòng, doanh số 1.250.000đ, chênh 250.000đ');
select t.bang(pg_temp.cac_thang(pg_temp.tk('2026-11-01')), 'T10|7|11850000|1850000;T11|0|1250000|250000',
              'YC11.2-NT9 hai tháng cộng phần H20 bằng 2.500.000đ giá bán');
select t.bang(pg_temp.theo_chu(pg_temp.tk('2026-11-01')), 'Chị Hoa|1250000|250000',
              'YC11.2-NT9 tháng 11 theo chủ nhà: Chị Hoa 1.250.000đ chênh 250.000đ');
select t.bang(pg_temp.so_truoc(pg_temp.tk('2026-11-01')), '7|11850000|1850000',
              'YC11.2-NT10 tháng 11: tháng trước 7 đặt phòng');
select t.thoat();

-- YC11-H2: giá chủ hai đêm khác nhau. H21: 1103, đêm 31/10 1.300.000đ, đêm 01/11 900.000đ, giá bán 2.600.000đ.
-- Đêm 31/10: 2.600.000 × 1.300.000 / 2.200.000 = 1.536.363,6 → 1.536.363đ; đêm cuối 01/11: 2.600.000 − 1.536.363 = 1.063.637đ.
with b as (
  insert into public.booking (id, can_id, ngay_nhan, ngay_tra, nguon, sale_id, tao_boi, tien_phong)
  values ('00000000-0000-0000-0059-000000000021', t.can('1103'), '2026-10-31', '2026-11-02', 'tu_yeu_cau', t.id('hung'),
          t.id('tuan'), 2200000)
  returning id
)
insert into public.booking_dem (booking_id, dem, tien)
select b.id, v.d, v.tien from b, (values ('2026-10-31'::date, 1300000::bigint), ('2026-11-01'::date, 900000::bigint)) v(d, tien);
select set_config('t.ma_h21', '00000000-0000-0000-0059-000000000021', true);
select pg_temp.ban('H21', t.id('hung'), 2600000);
select t.dang_nhap(t.id('hung'));
select t.bang(pg_temp.so(pg_temp.tk('2026-10-01')), '8|13386363|2086363',
              'YC11.2-NT9 YC11-H2 H21 đêm 31/10 lấy 1.536.363đ giá bán (làm tròn xuống), chênh 236.363đ');
select t.bang(pg_temp.so(pg_temp.tk('2026-11-01')), '0|2313637|413637',
              'YC11.2-NT9 YC11-H2 H21 đêm cuối 01/11 nhận phần dư 1.063.637đ, chênh 163.637đ');
select t.thoat();

-- QD12: hủy H20, H21 thì không tháng nào còn tính.
select pg_temp.huy('H20');
select pg_temp.huy('H21');
select t.dang_nhap(t.id('hung'));
select t.bang(pg_temp.so(pg_temp.tk('2026-10-01')) || '#' || pg_temp.so(pg_temp.tk('2026-11-01')),
              '6|10600000|1600000#0|0|0',
              'YC11.2-NT9 QD12 hủy H20, H21: tháng 10 về 6 đặt phòng 10.600.000đ, tháng 11 về 0');
select t.thoat();

-- YC11-H2 tiền phòng bằng 0 thì chia đều. H22: 3402, 31/10 → 03/11 (3 đêm), tiền phòng 0đ, giá bán 1.000.000đ:
-- 333.333đ, 333.333đ, 333.334đ; tháng 10 có 333.333đ, tháng 11 có 666.667đ.
select t.tao_booking('H22', t.can('3402'), '2026-10-31', '2026-11-03', 0, t.id('hung'), 'chu_ghi');
select pg_temp.ban('H22', t.id('hung'), 1000000);
select t.dang_nhap(t.id('hung'));
select t.bang(pg_temp.so(pg_temp.tk('2026-10-01')) || '#' || pg_temp.so(pg_temp.tk('2026-11-01')),
              '7|10933333|1933333#0|666667|666667',
              'YC11.2-NT9 YC11-H2 tiền phòng 0đ thì giá bán chia đều, phần dư ở đêm cuối');
select t.thoat();
select pg_temp.huy('H22');

-- ===== YC11.2-NT5: Chị Hoa ghi 1509 cho Sale Hùng (YC5.2), giá chủ 2.200.000đ, giá bán 2.600.000đ =====
-- 1509 24/10 (T7, 1.300.000đ) → 26/10 (CN, 900.000đ). Giá bán ở phần riêng của Hùng: dòng do YC5.4 bước 14 ghi (US29 chưa
-- làm), file này ghi thẳng.
select t.dang_nhap(t.id('hoa'));
select set_config('t.ma_n5', coalesce(t.gt($$select public.fn_tao_booking(t.can('1509'), '2026-10-24', '2026-10-26',
                                                p_tien_phong => 2200000, p_sale_id => t.id('hung'))$$), ''), true);
select t.thoat();
select t.ok(t.b('N5') is not null, 'YC11.2-NT5 Chị Hoa ghi được 1509 24/10 → 26/10 cho Sale Hùng');
insert into public.booking_rieng (booking_id, nguoi_id, tien_thu_khach)
select t.b('N5'), t.id('hung'), 2600000 where t.b('N5') is not null
on conflict (booking_id, nguoi_id) do update set tien_thu_khach = excluded.tien_thu_khach;
select t.dang_nhap(t.id('hung'));
select pg_temp.luu('h10n5', pg_temp.tk('2026-10-01'));
select t.thoat();
select t.bang(pg_temp.so(pg_temp.doc('h10n5')), '7|13200000|2000000',
              'YC11.2-NT5 Hùng cộng 1 đặt phòng, 2.600.000đ doanh số, 400.000đ tiền chênh: 7, 13.200.000đ, 2.000.000đ');
select t.bang(pg_temp.theo_chu(pg_temp.doc('h10n5')),
              'Chị Hoa|7400000|1200000;Anh Tuấn|4200000|600000;Chú Bình|1600000|200000',
              'YC11.2-NT5 cộng ở dòng Chị Hoa: 7.400.000đ, chênh 1.200.000đ');
select pg_temp.huy('N5');

-- ===== YC11.2-NT7, YC11 "Dữ liệu": chủ nhà đã xóa căn, ngừng chia sẻ, xóa tài khoản vẫn tính =====
-- Chị Hoa xóa (ẩn) căn 1509 (YC3, US19).
update public.can set an_luc = '2026-10-07 09:00+07' where id = t.can('1509');
select t.dang_nhap(t.id('hung'));
select t.bang(pg_temp.so(pg_temp.tk('2026-10-01')) || '#' || pg_temp.theo_chu(pg_temp.tk('2026-10-01')),
              '6|10600000|1600000#Chị Hoa|4800000|800000;Anh Tuấn|4200000|600000;Chú Bình|1600000|200000',
              'YC11.2-NT7 Chị Hoa đã xóa căn 1509: B1, B3 vẫn tính, dòng Chị Hoa 4.800.000đ chênh 800.000đ');
select t.thoat();
-- Chị Hoa ngừng chia sẻ cho Hùng.
update public.ket_noi set trang_thai = 'chu_ngung', ngung_luc = now() where id = t.kn('hoa', 'hung');
select t.dang_nhap(t.id('hung'));
select t.bang(pg_temp.so(pg_temp.tk('2026-10-01')) || '#' || pg_temp.theo_chu(pg_temp.tk('2026-10-01')),
              '6|10600000|1600000#Chị Hoa|4800000|800000;Anh Tuấn|4200000|600000;Chú Bình|1600000|200000',
              'YC11.2-NT7 Chị Hoa đã ngừng chia sẻ và xóa căn: B1, B3 vẫn tính');
select t.thoat();
-- Chị Hoa xóa tài khoản (QD13: chỉ xóa số điện thoại, đặt da_xoa_luc).
update public.can set an_luc = null where id = t.can('1509');
update public.ket_noi set trang_thai = 'da_ket_noi', ngung_luc = null where id = t.kn('hoa', 'hung');
update public.profiles set so_dien_thoai = null, da_xoa_luc = now() where id = t.id('hoa');
select t.dang_nhap(t.id('hung'));
select t.bang(pg_temp.so(pg_temp.tk('2026-10-01')) || '#' || pg_temp.theo_chu(pg_temp.tk('2026-10-01')),
              '6|10600000|1600000#Chị Hoa|4800000|800000;Anh Tuấn|4200000|600000;Chú Bình|1600000|200000',
              'YC11.2-NT7 QD13 Chị Hoa đã xóa tài khoản: B1, B3 vẫn tính ở dòng Chị Hoa');
select t.bang(pg_temp.so(pg_temp.tk('2026-09-01')), '4|9800000|1200000',
              'YC11.2-NT7 QD13 tháng 9 cũng giữ nguyên khi chủ nhà đã xóa tài khoản');
select t.thoat();

-- ===== YC11-H8, YC11 "Dữ liệu": lệnh nhận tháng và tới 12 tháng =====
select t.dang_nhap(t.id('hung'));
select t.bang(pg_temp.cac_thang(pg_temp.tk('2026-10-01', 3)), 'T8|0|0|0;T9|4|9800000|1200000;T10|6|10600000|1600000',
              'YC11.2-NT1 YC11-H8 ba tháng: tháng 8, 9, 10, cũ trước');
select t.ok(t.ma_loi($$select public.fn_thong_ke_sale('2026-10-01', 13)$$) is not null
            and t.ma_loi($$select public.fn_thong_ke_sale('2026-10-01', 0)$$) is not null
            and t.ma_loi($$select public.fn_thong_ke_sale(null)$$) is not null
            and t.ma_loi($$select public.fn_thong_ke_sale('2026-10-01', 12)$$) is null,
            'YC11.2-NT1 YC11 "Dữ liệu" lệnh nhận 1 đến 12 tháng; 0, 13 tháng hay thiếu tháng bị từ chối');
select t.thoat();
