-- US60 · Đặt phòng và yêu cầu của sale (YC11.3). Viết trước code (US60-TA1, CL14.5): task sau không sửa kỳ vọng của file này.
-- Hợp đồng database cho S7-03, S7-03-00 (YC11 "Dữ liệu", thiet-ke-db.md mục 3 bất biến 5, 6, 11):
--   fn_danh_sach_sale(p_bo_qua int default 0) → jsonb, của người gọi (không nhận mã sale): {dong, con_nua}.
--   dong: tối đa 50 dòng, mới nhất trước theo moc (yêu cầu: giờ gửi; đặt phòng thành từ yêu cầu: giờ gửi yêu cầu đó;
--   đặt phòng chủ ghi: lúc tạo). Mỗi dòng {loai 'dat_phong'|'yeu_cau', id, can_id, ma_can, ten_toa, ngay_nhan, ngay_tra,
--   trang_thai, moc, gui_luc, tien_chenh, ghi_giup, tu_choi, het_han_vi}.
--   Đặt phòng: sale_id là người gọi ở căn không phải của mình (YC11-H1), không có sale_tu_ghi (YC11-H3, NT8); trang_thai
--   'da_chot' hay 'da_huy' (QD12 đặt phòng đã hủy vẫn hiện, Claude tự chốt US60); tien_chenh = giá bán của người gọi trừ tiền
--   phòng; ghi_giup = tên chủ nhà khi chủ ghi cho sale (YC5.4), còn lại null.
--   Yêu cầu: mọi yêu cầu của người gọi trừ đã chốt (đã chốt hiện ở dòng đặt phòng); 'cho' đã quá hạn đọc ra 'het_han'
--   (NT4); het_han_vi 'qua_14_ngay'|'qua_ngay_nhan'; bị từ chối kèm tu_choi 'khong_nhan'|'dat_phong_khac'; tien_chenh null.
--   Không có tên, số khách, tiền cọc (QD11, PQ9.SALE).
-- QT3.1, QD5, QD11, QD12, PQ7.SALE, PQ9.SALE, PQ10.SALE, PQ14.SALE, PQ15, PQ16.SALE.
select t.fixture();

-- DLM.1: "hôm nay" là 07/10/2026 (như 75_us59_thong_ke_sale.sql).
create or replace function pg_temp.hom_nay(p_ngay date) returns void language plpgsql as $hn$
begin
  execute format('create or replace function public.local_today() returns date '
                 'language sql stable security definer set search_path = '''' as $b$ select date %L $b$', p_ngay);
end $hn$;
select pg_temp.hom_nay('2026-10-07');

-- DLM.3: Sapphire 1103 của Anh Tuấn chia sẻ cho Hùng; căn của tôi Green Bay 0812 của Hùng (QD5).
insert into public.ket_noi (chu_id, sale_id, trang_thai, nguon, pham_vi)
values (t.id('tuan'), t.id('hung'), 'da_ket_noi', 'link_moi', 'tat_ca');
insert into public.can (id, nguoi_giu, loai, ma_can, so_phong_ngu)
values ('00000000-0000-0000-0001-000000000812', t.id('hung'), 'co_lich', 'Green Bay 0812', 2);
create or replace function pg_temp.c0812() returns uuid language sql immutable as
  $$ select '00000000-0000-0000-0001-000000000812'::uuid $$;

create or replace function pg_temp.ban(p_ma text, p_nguoi uuid, p_tien bigint) returns void language sql as $$
  insert into public.booking_rieng (booking_id, nguoi_id, tien_thu_khach) values (t.b(p_ma), p_nguoi, p_tien)
  on conflict (booking_id, nguoi_id) do update set tien_thu_khach = excluded.tien_thu_khach
$$;
create or replace function pg_temp.gui(p_ma text, p_luc timestamptz) returns void language sql as $$
  update public.yeu_cau_dat_phong set gui_luc = p_luc where id = t.b(p_ma)
$$;

-- B1: yêu cầu YB1 của Hùng (gửi 01/10 09:00) chủ chấp nhận 06/10, đã chốt thành đặt phòng 1509 10/10 → 12/10, trả chủ 2.200.000đ, bán 2.600.000đ.
select t.tao_yeu_cau('YB1', t.can('1509'), t.id('hung'), '2026-10-10', '2026-10-12', array[1300000, 900000]::bigint[]);
select pg_temp.gui('YB1', '2026-10-01 09:00+07');
select t.tao_booking('B1', t.can('1509'), '2026-10-10', '2026-10-12', 2200000, t.id('hung'), 'tu_yeu_cau');
update public.booking set yeu_cau_id = t.b('YB1'), tao_luc = '2026-10-06 10:00+07' where id = t.b('B1');
update public.yeu_cau_dat_phong set trang_thai = 'da_chot', booking_id = t.b('B1'), tra_loi_luc = '2026-10-06 10:00+07'
where id = t.b('YB1');
insert into public.booking_rieng (booking_id, nguoi_id, ten_khach, sdt_khach, so_khach, tien_thu_khach)
values (t.b('B1'), t.id('hung'), 'Khách Riêng Của Hùng', '0900000077', 4, 2600000);
update public.booking set trang_thai_tien = 'da_coc', tien_coc = 1000000 where id = t.b('B1');

-- X1: đặt phòng 1103 của Hùng đã hủy theo QD12 (tạo 02/10).
select t.tao_booking('X1', t.can('1103'), '2026-10-27', '2026-10-28', 700000, t.id('hung'), 'chu_ghi');
select pg_temp.ban('X1', t.id('hung'), 900000);
update public.booking b set huy_xin_boi = b.sale_id, huy_xin_luc = now(), huy_tra_loi = 'dong_y',
       huy_tra_loi_boi = t.id('tuan'), huy_tra_loi_luc = now(), trang_thai = 'da_huy', tao_luc = '2026-10-02 08:00+07'
where b.id = t.b('X1');

-- V2: Hùng tự ghi cho Villa Tuần Châu (căn tự nhập). G1, G2: ở căn của tôi Green Bay 0812.
select t.tao_booking('V2', t.can('villa'), '2026-10-08', '2026-10-09', 1400000);
select pg_temp.ban('V2', t.id('hung'), 1600000);
select t.tao_booking('G1', pg_temp.c0812(), '2026-10-08', '2026-10-10', 1500000);
select t.tao_booking('G2', pg_temp.c0812(), '2026-10-15', '2026-10-16', 750000, t.id('hung'), 'chu_ghi');

-- B2 của Sale Lan (Chị Hoa ghi cho Lan, 3402 17/10 → 19/10, bán 2.300.000đ). B5 khách lẻ của Chị Hoa.
select t.tao_booking('B2', t.can('3402'), '2026-10-17', '2026-10-19', 1900000, t.id('lan'), 'chu_ghi');
insert into public.booking_rieng (booking_id, nguoi_id, ten_khach, sdt_khach, so_khach, tien_thu_khach)
values (t.b('B2'), t.id('lan'), 'Khách Của Lan', '0900000066', 2, 2300000);
select t.tao_booking('B5', t.can('1509'), '2026-10-13', '2026-10-15', 1800000);

-- Yêu cầu của Hùng (DLM.6, S7-03). Y1 chờ, gửi 14:20 07/10. Y2 đã hết hạn. Y3 Hùng tự hủy. Y4 chủ không nhận.
-- Y5 còn 'cho' nhưng đã qua ngày nhận; Y7 còn 'cho' nhưng đã quá 14 ngày (việc hết hạn chưa chạy). Y8 bị từ chối vì chủ
-- nhận đặt phòng khác (US52).
select t.tao_yeu_cau('Y1', t.can('3402'), t.id('hung'), '2026-10-10', '2026-10-12', array[1100000, 800000]::bigint[]);
select pg_temp.gui('Y1', '2026-10-07 14:20+07');
insert into public.yeu_cau_rieng (yeu_cau_id, sale_id, gia_ban_dem, ten_khach, sdt_khach)
values (t.b('Y1'), t.id('hung'), array[1500000, 1200000], 'Khách Y1', '0900000055');
select t.tao_yeu_cau('Y2', t.can('1509'), t.id('hung'), '2026-09-27', '2026-09-28', array[900000]::bigint[]);
select pg_temp.gui('Y2', '2026-09-10 09:00+07');
update public.yeu_cau_dat_phong set trang_thai = 'het_han', han_luc = '2026-09-24 09:00+07' where id = t.b('Y2');
select t.tao_yeu_cau('Y3', t.can('3402'), t.id('hung'), '2026-10-20', '2026-10-21', array[800000]::bigint[]);
select pg_temp.gui('Y3', '2026-10-03 08:00+07');
update public.yeu_cau_dat_phong set trang_thai = 'da_huy' where id = t.b('Y3');
select t.tao_yeu_cau('Y4', t.can('1103'), t.id('hung'), '2026-10-05', '2026-10-06', array[700000]::bigint[]);
select pg_temp.gui('Y4', '2026-10-04 08:00+07');
update public.yeu_cau_dat_phong set trang_thai = 'bi_tu_choi', ly_do_tu_choi = 'Đã có khách' where id = t.b('Y4');
select t.tao_yeu_cau('Y5', t.can('1103'), t.id('hung'), '2026-10-01', '2026-10-02', array[700000]::bigint[]);
select pg_temp.gui('Y5', '2026-09-30 08:00+07');
select t.tao_yeu_cau('Y7', t.can('1103'), t.id('hung'), '2026-12-01', '2026-12-02', array[700000]::bigint[]);
update public.yeu_cau_dat_phong set gui_luc = '2026-09-15 08:00+07', han_luc = now() - interval '1 hour' where id = t.b('Y7');
select t.tao_yeu_cau('Y8', t.can('1509'), t.id('hung'), '2026-10-24', '2026-10-25', array[1300000]::bigint[]);
select pg_temp.gui('Y8', '2026-10-05 08:00+07');
update public.yeu_cau_dat_phong set trang_thai = 'bi_tu_choi', ly_do_tu_choi = 'Đã nhận đặt phòng khác' where id = t.b('Y8');
-- Y6: yêu cầu đang chờ của Sale Lan.
select t.tao_yeu_cau('Y6', t.can('1509'), t.id('lan'), '2026-10-24', '2026-10-26', array[1300000, 900000]::bigint[]);
select pg_temp.gui('Y6', '2026-10-06 08:00+07');

-- Gọi lệnh bằng vai hiện tại; lỗi thì null (test đỏ, file chạy tiếp).
create or replace function pg_temp.ds(p_bo_qua int default null) returns jsonb language plpgsql as $$
begin
  if p_bo_qua is null then return t.gt('select public.fn_danh_sach_sale()')::jsonb; end if;
  return t.gt(format('select public.fn_danh_sach_sale(%s)', p_bo_qua))::jsonb;
end $$;
-- Dòng của một đặt phòng hay yêu cầu (theo mã).
create or replace function pg_temp.dong(j jsonb, p_ma text) returns jsonb language sql stable as $$
  select e from jsonb_array_elements(j -> 'dong') e where e ->> 'id' = t.b(p_ma)::text
$$;
-- "loai|trang_thai|tien_chenh|ghi_giup|tu_choi|het_han_vi" của một dòng.
create or replace function pg_temp.tom(e jsonb) returns text language sql stable as $$
  select (e ->> 'loai') || '|' || (e ->> 'trang_thai') || '|' || coalesce(e ->> 'tien_chenh', '') || '|'
         || coalesce(e ->> 'ghi_giup', '') || '|' || coalesce(e ->> 'tu_choi', '') || '|' || coalesce(e ->> 'het_han_vi', '')
$$;
-- Mã các dòng theo thứ tự trả về.
create or replace function pg_temp.thu_tu(j jsonb, p_ma text[]) returns text language sql stable as $$
  select coalesce(string_agg(m, ',' order by i), '')
  from jsonb_array_elements(j -> 'dong') with ordinality x(e, i)
  join unnest(p_ma) m on t.b(m)::text = e ->> 'id'
$$;
create or replace function pg_temp.co(j jsonb, p_ma text) returns boolean language sql stable as $$
  select position(t.b(p_ma)::text in coalesce(j::text, '')) > 0
$$;
create or replace function pg_temp.cac_khoa(j jsonb) returns text[] language sql stable as $$
  select coalesce(array_agg(distinct k[1]), '{}') from regexp_matches(coalesce(j::text, ''), '"([a-z_]+)":', 'g') k
$$;
create or replace function pg_temp.luu(p_ten text, j jsonb) returns void language sql as $$
  select set_config('t.' || p_ten, coalesce(j::text, ''), true)
$$;
create or replace function pg_temp.doc(p_ten text) returns jsonb language sql stable as $$
  select nullif(current_setting('t.' || p_ten, true), '')::jsonb
$$;

-- ===== Danh mục và quyền gọi =====
select t.ok(exists (select 1 from pg_proc where proname = 'fn_danh_sach_sale'
                      and pronamespace = 'public'::regnamespace and prosecdef),
            'YC11.3-NT7 danh mục: fn_danh_sach_sale có và chạy security definer');
select t.ok(exists (select 1 from pg_proc where proname = 'fn_danh_sach_sale' and pronamespace = 'public'::regnamespace)
            and not exists (select 1 from pg_proc where proname = 'fn_danh_sach_sale' and pronamespace = 'public'::regnamespace
                              and ('uuid'::regtype = any (proargtypes::regtype[]) or 'text'::regtype = any (proargtypes::regtype[]))),
            'YC11.3-NT7 PQ15.SALE lệnh không nhận mã sale hay mã người khác');
select t.ok(exists (select 1 from pg_proc where proname = 'fn_danh_sach_sale' and pronamespace = 'public'::regnamespace)
            and not exists (select 1 from pg_proc p where p.proname = 'fn_danh_sach_sale'
                              and p.pronamespace = 'public'::regnamespace and has_function_privilege('anon', p.oid, 'execute')),
            'YC11.3-NT7 PQ15.LINK người chưa đăng nhập không có quyền gọi fn_danh_sach_sale');

-- ===== Sale Hùng đọc danh sách =====
select t.dang_nhap(t.id('hung'));
select pg_temp.luu('h', pg_temp.ds());
select t.thoat();

select t.bang(pg_temp.tom(pg_temp.dong(pg_temp.doc('h'), 'B1')), 'dat_phong|da_chot|400000|||',
              'YC11.3-NT2 B1 đã chấp nhận: dòng đặt phòng "Đã chốt", chênh 400.000đ (2.600.000đ − 2.200.000đ)');
select t.ok(not pg_temp.co(pg_temp.doc('h'), 'YB1'),
            'YC11.3-NT2 yêu cầu đã chốt không có dòng riêng; hiện ở dòng đặt phòng B1');
select t.bang((pg_temp.dong(pg_temp.doc('h'), 'B1') ->> 'ma_can') || '|' || (pg_temp.dong(pg_temp.doc('h'), 'B1') ->> 'ten_toa')
              || '|' || (pg_temp.dong(pg_temp.doc('h'), 'B1') ->> 'ngay_nhan') || '|' || (pg_temp.dong(pg_temp.doc('h'), 'B1') ->> 'ngay_tra'),
              '1509|ICON40|2026-10-10|2026-10-12', 'YC11.3-NT2 dòng có căn, tòa và ngày ở');
select t.bang(pg_temp.tom(pg_temp.dong(pg_temp.doc('h'), 'Y1')), 'yeu_cau|cho||||',
              'YC11.3-NT1 Y1 chờ: trạng thái chờ, không có tiền chênh');
select t.bang(to_char((pg_temp.dong(pg_temp.doc('h'), 'Y1') ->> 'gui_luc')::timestamptz at time zone 'Asia/Ho_Chi_Minh', 'HH24:MI'),
              '14:20', 'YC11.3-NT1 Y1 có giờ gửi 14:20');
select t.bang(pg_temp.tom(pg_temp.dong(pg_temp.doc('h'), 'Y2')), 'yeu_cau|het_han||||qua_14_ngay',
              'YC11.3-NT4 Y2 đã hết hạn: "Hết hạn", vì quá 2 tuần');
select t.bang(pg_temp.tom(pg_temp.dong(pg_temp.doc('h'), 'Y7')), 'yeu_cau|het_han||||qua_14_ngay',
              'YC11.3-NT4 Y7 quá 2 tuần mà việc hết hạn chưa chạy: đọc ra "Hết hạn"');
select t.bang(pg_temp.tom(pg_temp.dong(pg_temp.doc('h'), 'Y5')), 'yeu_cau|het_han||||qua_ngay_nhan',
              'YC11.3-NT4 Y5 còn chờ mà đã qua ngày nhận: đọc ra "Hết hạn", vì qua ngày nhận');
select t.bang(pg_temp.tom(pg_temp.dong(pg_temp.doc('h'), 'Y3')), 'yeu_cau|da_huy||||',
              'YC11.3-NT5 Y3 Hùng tự hủy: "Đã hủy"');
select t.bang(pg_temp.tom(pg_temp.dong(pg_temp.doc('h'), 'Y4')), 'yeu_cau|bi_tu_choi|||khong_nhan|',
              'YC11.3-NT3 Y4 bị từ chối: lý do chủ không nhận');
select t.bang(pg_temp.tom(pg_temp.dong(pg_temp.doc('h'), 'Y8')), 'yeu_cau|bi_tu_choi|||dat_phong_khac|',
              'YC11.3-NT3 Y8 bị từ chối vì chủ đã nhận đặt phòng khác cùng ngày');
select t.bang(pg_temp.tom(pg_temp.dong(pg_temp.doc('h'), 'X1')), 'dat_phong|da_huy|200000|Anh Tuấn||',
              'YC11.3-NT2 QD12 đặt phòng đã hủy vẫn hiện, trạng thái "Đã hủy" (Claude tự chốt US60)');
select t.ok(not pg_temp.co(pg_temp.doc('h'), 'V2'),
            'YC11.3-NT8 YC11-H3 V2 Hùng tự ghi cho Villa Tuần Châu không có trong danh sách');
select t.ok(not pg_temp.co(pg_temp.doc('h'), 'G1') and not pg_temp.co(pg_temp.doc('h'), 'G2'),
            'YC11.3-NT8 YC11-H1 QD5 đặt phòng ở căn của tôi Green Bay 0812 không có trong danh sách');
select t.ok(not pg_temp.co(pg_temp.doc('h'), 'B2') and not pg_temp.co(pg_temp.doc('h'), 'B5')
            and not pg_temp.co(pg_temp.doc('h'), 'Y6'),
            'YC11.3-NT7 PQ10.SALE PQ14.SALE Hùng không thấy B2 của Lan, B5 khách lẻ, Y6 của Lan');
select t.bang(pg_temp.thu_tu(pg_temp.doc('h'), array['Y1', 'Y8', 'Y4', 'Y3', 'X1', 'B1', 'Y5', 'Y7', 'Y2']),
              'Y1,Y8,Y4,Y3,X1,B1,Y5,Y7,Y2',
              'YC11.3-NT1 YC11 "Dữ liệu" mới nhất trước: yêu cầu theo giờ gửi, B1 theo giờ gửi yêu cầu, X1 theo lúc tạo');
select t.bang(jsonb_array_length(pg_temp.doc('h') -> 'dong') || '|' || (pg_temp.doc('h') ->> 'con_nua'), '9|false',
              'YC11.3-NT1 Hùng có 9 dòng, không còn trang sau');
select t.ok(not (pg_temp.cac_khoa(pg_temp.doc('h')) && array['ten_khach', 'sdt_khach', 'so_khach', 'tien_coc', 'tien_thu_khach',
                                                          'gia_ban_dem', 'trang_thai_tien']),
            'YC11.3-NT7 QD11 PQ9.SALE KT-DB.3.11 danh sách không có tên, số khách, tiền cọc');

-- ===== YC11.3-NT7: Sale Lan chỉ thấy của mình =====
select t.dang_nhap(t.id('lan'));
select pg_temp.luu('l', pg_temp.ds());
select t.thoat();
select t.ok(pg_temp.doc('l') is not null
            and not exists (select 1 from unnest(array['B1', 'X1', 'Y1', 'Y2', 'Y3', 'Y4', 'Y5', 'Y7', 'Y8', 'YB1']) m
                            where pg_temp.co(pg_temp.doc('l'), m)),
            'YC11.3-NT7 Sale Lan đọc danh sách: không có dòng nào của Hùng');
select t.bang(pg_temp.tom(pg_temp.dong(pg_temp.doc('l'), 'B2')) || ';' || pg_temp.tom(pg_temp.dong(pg_temp.doc('l'), 'Y6')),
              'dat_phong|da_chot|400000|Chị Hoa||;yeu_cau|cho||||',
              'YC11.3-NT7 Lan thấy B2 Chị Hoa ghi giúp (chênh 2.300.000đ − 1.900.000đ) và Y6 đang chờ');

-- ===== Người chưa đăng nhập, sale chưa có gì =====
select t.khach();
select t.ok(t.ma_loi('select public.fn_danh_sach_sale()') is not null,
            'YC11.3-NT7 PQ15.LINK người chưa đăng nhập gọi lệnh bị từ chối');
select t.thoat();
select t.dang_nhap(t.id('nga'));
select t.bang(pg_temp.ds()::text, '{"dong": [], "con_nua": false}', 'YC11.3-NT7 Sale Nga chưa có gì: danh sách trống (S7-03-00)');
select t.thoat();

-- ===== YC11 "Dữ liệu": mỗi lần 50 dòng =====
insert into public.yeu_cau_dat_phong (can_id, sale_id, ngay_nhan, ngay_tra, gia_chu_dem, gui_luc, han_luc, trang_thai)
select t.can('1509'), t.id('nga'), '2026-11-01'::date + i, '2026-11-02'::date + i, array[900000]::bigint[],
       '2026-10-01 08:00+07'::timestamptz + make_interval(mins => i), now() + interval '14 days', 'da_huy'
from generate_series(1, 51) i;
select t.dang_nhap(t.id('nga'));
select pg_temp.luu('n0', pg_temp.ds(0));
select pg_temp.luu('n1', pg_temp.ds(50));
select t.thoat();
select t.bang(jsonb_array_length(pg_temp.doc('n0') -> 'dong') || '|' || (pg_temp.doc('n0') ->> 'con_nua') || '|'
              || jsonb_array_length(pg_temp.doc('n1') -> 'dong') || '|' || (pg_temp.doc('n1') ->> 'con_nua'),
              '50|true|1|false', 'YC11.3-NT1 YC11 "Dữ liệu" 51 dòng: trang đầu 50 dòng còn trang sau, trang sau 1 dòng');
select t.bang((pg_temp.doc('n0') -> 'dong' -> 0 ->> 'ngay_nhan') || '|' || (pg_temp.doc('n1') -> 'dong' -> 0 ->> 'ngay_nhan'),
              '2026-12-22|2026-11-02', 'YC11.3-NT1 trang đầu mới nhất, dòng cũ nhất ở trang sau');
select t.dang_nhap(t.id('nga'));
select t.ok(t.ma_loi('select public.fn_danh_sach_sale(-1)') is not null,
            'YC11.3-NT1 số dòng bỏ qua âm bị từ chối');
select t.thoat();

-- ===== YC11.3-NT6: Chị Hoa ghi 1509 10/10 → 12/10 cho Hùng (YC5.4) =====
-- Hủy B1 (cùng đêm) đúng luật hai bên (QD12) để dựng đặt phòng chủ ghi giúp; trả chủ 2.200.000đ, giá bán của Hùng
-- 2.600.000đ (YC5.4-NT1, QT3.1-VD3).
update public.booking b set huy_xin_boi = b.sale_id, huy_xin_luc = now(), huy_tra_loi = 'dong_y',
       huy_tra_loi_boi = t.id('hoa'), huy_tra_loi_luc = now(), trang_thai = 'da_huy'
where b.id = t.b('B1');
select t.tao_booking('H1', t.can('1509'), '2026-10-10', '2026-10-12', 2200000, t.id('hung'), 'chu_ghi');
select pg_temp.ban('H1', t.id('hung'), 2600000);
select t.dang_nhap(t.id('hung'));
select pg_temp.luu('h6', pg_temp.ds());
select t.thoat();
select t.bang(pg_temp.tom(pg_temp.dong(pg_temp.doc('h6'), 'H1')) || '|' || (pg_temp.dong(pg_temp.doc('h6'), 'H1') ->> 'ma_can')
              || '|' || (pg_temp.dong(pg_temp.doc('h6'), 'H1') ->> 'ngay_nhan') || '|' || (pg_temp.dong(pg_temp.doc('h6'), 'H1') ->> 'ngay_tra'),
              'dat_phong|da_chot|400000|Chị Hoa|||1509|2026-10-10|2026-10-12',
              'YC11.3-NT6 Chị Hoa ghi giúp: dòng 1509 · 10/10 → 12/10 "Đã chốt", chênh 400.000đ, ghi giúp Chị Hoa');
select t.bang(pg_temp.thu_tu(pg_temp.doc('h6'), array['H1', 'Y1']), 'H1,Y1',
              'YC11.3-NT6 đặt phòng ghi giúp xếp theo lúc tạo (vừa tạo nên mới nhất)');
-- Chị Hoa ngừng chia sẻ và xóa tài khoản (QD13): dòng vẫn còn.
update public.ket_noi set trang_thai = 'chu_ngung', ngung_luc = now() where id = t.kn('hoa', 'hung');
update public.profiles set so_dien_thoai = null, da_xoa_luc = now() where id = t.id('hoa');
select t.dang_nhap(t.id('hung'));
select t.ok(pg_temp.co(pg_temp.ds(), 'H1'), 'YC11.3-NT6 QD13 chủ nhà ngừng chia sẻ, xóa tài khoản: dòng H1 vẫn còn');
select t.thoat();
