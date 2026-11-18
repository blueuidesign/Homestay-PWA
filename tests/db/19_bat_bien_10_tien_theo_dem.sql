-- KT-DB.3.10 · Tiền phòng của một booking bằng tổng tiền các đêm trong booking_dem; tập đêm đúng bằng các đêm
-- của booking. Chia đều thì phần lẻ dồn vào đêm cuối (QD10, QT4.2). Tiền là số nguyên đồng, ngày theo giờ Việt Nam.
select t.fixture();

-- tach_tien_theo_dem.
select t.bang(t.gt('public.tach_tien_theo_dem(1000000, 3)'), '{333333,333333,333334}',
              'KT-DB.3.10 QT4.2-VD2 1.000.000đ chia 3 đêm: 333.333, 333.333, 333.334 (đêm cuối nhận phần lẻ)');
select t.bang(t.gt('public.tach_tien_theo_dem(2000000, 2)'), '{1000000,1000000}',
              'KT-DB.3.10 QT4.2-VD1 2.000.000đ chia 2 đêm: 1.000.000đ mỗi đêm');
select t.bang(t.gt($$(select bool_and((select sum(x) from unnest(public.tach_tien_theo_dem(tong, n)) x) = tong
                                      and cardinality(public.tach_tien_theo_dem(tong, n)) = n)
                     from (values (2200000::bigint, 2), (1000000, 3), (1900000, 7), (1, 3), (0, 2)) v(tong, n))$$), 'true',
              'KT-DB.3.10 QT4.2 tach_tien_theo_dem: đủ số đêm và tổng bằng tiền phòng');

-- Tiền là bigint (đồng), ngày là date.
select t.bang((select string_agg(table_name || '.' || column_name || ':' || data_type, ', ' order by table_name, column_name)
               from information_schema.columns
               where table_schema = 'public'
                 and (table_name, column_name) in (('booking', 'tien_phong'), ('booking', 'tien_coc'), ('booking_dem', 'tien'),
                                                   ('gia_thang', 'gia_thuong'), ('gia_thang', 'gia_cuoi_tuan'), ('gia_dip', 'gia'),
                                                   ('muc_cong', 'muc'), ('booking_rieng', 'tien_thu_khach'),
                                                   ('can', 'gia_chu_thuong'), ('can', 'gia_chu_cuoi_tuan'),
                                                   ('cai_dat_rieng', 'muc_cong_mac_dinh'))
                 and data_type <> 'bigint'),
              null::text, 'KT-DB.3.10 cột tiền là bigint (số nguyên đồng)');
select t.bang((select count(*) from information_schema.columns where table_schema = 'public'
               and (table_name, column_name) in (('booking', 'tien_phong'), ('booking_dem', 'tien'), ('gia_thang', 'gia_thuong')) and data_type = 'bigint'),
              3::bigint, 'KT-DB.3.10 có các cột tiền chính');
select t.loi($$insert into public.gia_thang (can_id, thang, gia_thuong, gia_cuoi_tuan) values (t.can('1509'), '2027-01-01', '900000.5', 1300000)$$, '22P02',
             'KT-DB.3.10 tiền lẻ dưới một đồng bị từ chối');
select t.bang(t.gt('public.local_today()'), ((now() at time zone 'Asia/Ho_Chi_Minh')::date)::text,
              'KT-DB.3.10 local_today là ngày theo giờ Việt Nam');

-- Ràng buộc kiểm lúc commit là constraint trigger hoãn được, trên cả booking và booking_dem.
select t.bang((select string_agg(distinct c.relname, ', ' order by c.relname) from pg_trigger g join pg_class c on c.oid = g.tgrelid
               where c.relname in ('booking', 'booking_dem') and c.relnamespace = 'public'::regnamespace
                 and g.tgconstraint <> 0 and g.tgdeferrable and g.tginitdeferred and not g.tgisinternal),
              'booking, booking_dem', 'KT-DB.3.10 danh mục: có constraint trigger hoãn tới commit trên booking và booking_dem');

-- Từ đây ép kiểm ngay sau mỗi câu (file chạy trong giao dịch rồi rollback, nên commit không bao giờ tới).
set constraints all immediate;

select t.khong_loi($$select t.tao_booking('A', t.can('1509'), '2026-10-31', '2026-11-02', 2000000)$$,
             'KT-DB.3.10 QT4.2-VD1 1509 31/10 → 02/11, 2.000.000đ, mỗi đêm 1.000.000đ: lưu được');
select t.bang(t.gt($$select sum(tien) from public.booking_dem where booking_id = t.b('A') and dem = '2026-10-31'$$), '1000000',
              'KT-DB.3.10 QT4.2-VD1 doanh thu tháng 10 của booking A là 1.000.000đ');
select t.khong_loi($q$with b as (insert into public.booking (id, can_id, ngay_nhan, ngay_tra, nguon, tao_boi, tien_phong)
                       values ('00000000-0000-0000-0004-000000000003', t.can('3402'), '2026-10-31', '2026-11-02', 'chu_ghi', t.id('hoa'), 1900000)
                       returning id)
                     insert into public.booking_dem (booking_id, dem, tien)
                     select id, d, tien from b, (values ('2026-10-31'::date, 1100000::bigint), ('2026-11-01', 800000)) v(d, tien)$q$,
             'KT-DB.3.10 QT4.2 3402 31/10 → 02/11 mỗi đêm theo bảng giá 1.100.000đ + 800.000đ = 1.900.000đ: lưu được');

select t.loi($q$with b as (insert into public.booking (can_id, ngay_nhan, ngay_tra, nguon, tao_boi, tien_phong)
                 values (t.can('1103'), '2026-10-10', '2026-10-12', 'chu_ghi', t.id('tuan'), 2200000) returning id)
               insert into public.booking_dem (booking_id, dem, tien)
               select id, d, 1000000 from b, (values ('2026-10-10'::date), ('2026-10-11')) v(d)$q$, 'P0001',
             'KT-DB.3.10 tổng tiền các đêm (2.000.000đ) khác tiền phòng (2.200.000đ) bị từ chối');
select t.loi($q$with b as (insert into public.booking (can_id, ngay_nhan, ngay_tra, nguon, tao_boi, tien_phong)
                 values (t.can('1103'), '2026-10-10', '2026-10-12', 'chu_ghi', t.id('tuan'), 1400000) returning id)
               insert into public.booking_dem (booking_id, dem, tien) select id, '2026-10-10', 1400000 from b$q$, 'P0001',
             'KT-DB.3.10 thiếu đêm 11/10 trong booking_dem bị từ chối');
select t.loi($q$with b as (insert into public.booking (can_id, ngay_nhan, ngay_tra, nguon, tao_boi, tien_phong)
                 values (t.can('1103'), '2026-10-10', '2026-10-12', 'chu_ghi', t.id('tuan'), 2100000) returning id)
               insert into public.booking_dem (booking_id, dem, tien)
               select id, d, 700000 from b, (values ('2026-10-10'::date), ('2026-10-11'), ('2026-10-12')) v(d)$q$, 'P0001',
             'KT-DB.3.10 đêm ngày trả 12/10 (ngoài booking) trong booking_dem bị từ chối');
select t.loi($$insert into public.booking (can_id, ngay_nhan, ngay_tra, nguon, tao_boi, tien_phong)
               values (t.can('1103'), '2026-10-10', '2026-10-12', 'chu_ghi', t.id('tuan'), 1400000)$$, 'P0001',
             'KT-DB.3.10 booking không có dòng booking_dem nào bị từ chối');

select t.loi($$update public.booking_dem set tien = 1200000 where booking_id = t.b('A') and dem = '2026-10-31'$$, 'P0001',
             'KT-DB.3.10 sửa tiền một đêm làm lệch tổng bị từ chối');
select t.loi($$update public.booking set tien_phong = 2100000 where id = t.b('A')$$, 'P0001',
             'KT-DB.3.10 sửa tiền phòng không sửa đêm bị từ chối');
select t.loi($$delete from public.booking_dem where booking_id = t.b('A') and dem = '2026-11-01'$$, 'P0001',
             'KT-DB.3.10 xóa một đêm khỏi booking_dem bị từ chối');
select t.loi($$update public.booking set ngay_tra = '2026-11-03' where id = t.b('A')$$, 'P0001',
             'KT-DB.3.10 đổi ngày trả mà không thêm đêm bị từ chối');
select t.khong_loi($$update public.booking_dem set tien = case dem when '2026-10-31' then 1300000 else 700000 end where booking_id = t.b('A')$$,
             'KT-DB.3.10 đổi tiền hai đêm trong một câu, tổng giữ 2.000.000đ: lưu được');
select t.khong_loi($$set constraints all deferred;
                     update public.booking set tien_phong = 2200000 where id = t.b('A');
                     update public.booking_dem set tien = 1100000 where booking_id = t.b('A');
                     set constraints all immediate$$,
             'KT-DB.3.10 QT4.2 sửa tiền phòng và chia lại các đêm trong cùng giao dịch: lưu được');
select t.loi($$update public.booking_dem set tien = -1 where booking_id = t.b('A') and dem = '2026-10-31'$$, '23514',
             'KT-DB.3.10 tiền một đêm âm bị từ chối');
