-- US13 · Lịch tuần nhiều căn (YC2.5). Lệnh giá chủ nhà từng đêm fn_gia_tung_dem_cua_toi(p_tu date, p_den date):
-- mỗi căn có lịch chưa ẩn của người gọi, mỗi đêm từ p_tu tới trước p_den một dòng (can_id, dem, gia); đêm chưa đặt giá thì
-- gia null. YC2 "Dữ liệu" (lệnh trả giá chủ nhà từng đêm, chỉ người giữ căn gọi được), QT5.3, PQ5.CHU, PQ4.CHU.
-- Vi phạm (YC2 "Ai được làm gì"): chủ khác, sale, người chưa đăng nhập không nhận giá chủ nhà của Chị Hoa.
-- Viết trước migration (US13-TA1, CL14.5).
select t.fixture();

-- Giá một đêm của một căn bằng vai hiện tại: số, '-' khi null, 'không có dòng' khi không có dòng.
create or replace function pg_temp.gia(p_can uuid, p_dem date, p_tu date default '2026-10-05', p_den date default '2026-10-12')
returns text language plpgsql as $$
declare v text;
begin
  select coalesce(g.gia::text, '-') into v from public.fn_gia_tung_dem_cua_toi(p_tu, p_den) g
  where g.can_id = p_can and g.dem = p_dem;
  return coalesce(v, 'không có dòng');
exception when others then
  raise notice 'lỗi: % (fn_gia_tung_dem_cua_toi)', sqlerrm;
  return null;
end $$;

-- ===== Danh mục: security definer, chỉ người đã đăng nhập gọi, không có cột giá bán =====
select t.ok(exists (select 1 from pg_proc where proname = 'fn_gia_tung_dem_cua_toi'
                      and pronamespace = 'public'::regnamespace and prosecdef),
            'YC2.5-NT2 danh mục: có lệnh fn_gia_tung_dem_cua_toi chạy security definer');
select t.ok(exists (select 1 from pg_proc p where p.proname = 'fn_gia_tung_dem_cua_toi' and p.pronamespace = 'public'::regnamespace)
            and not exists (select 1 from pg_proc p where p.proname = 'fn_gia_tung_dem_cua_toi'
                              and p.pronamespace = 'public'::regnamespace and has_function_privilege('anon', p.oid, 'execute')),
            'YC2.5-NT2 PQ5.LINK người chưa đăng nhập không có quyền gọi fn_gia_tung_dem_cua_toi');
select t.ok(not exists (select 1 from information_schema.routines r
                        join information_schema.parameters p on p.specific_name = r.specific_name
                        where r.routine_schema = 'public' and r.routine_name = 'fn_gia_tung_dem_cua_toi' and p.parameter_mode = 'OUT'
                          and (p.parameter_name ilike '%gia_ban%' or p.parameter_name ilike '%chenh%' or p.parameter_name ilike '%muc_cong%')),
            'YC2.5-NT2 PQ11.CHU fn_gia_tung_dem_cua_toi không có cột giá bán, mức cộng, tiền chênh');

-- ===== YC2.5-NT2: tuần 05 – 11/10/2026 của Chị Hoa =====
select t.dang_nhap(t.id('hoa'));
select t.bang(t.dem($$select * from public.fn_gia_tung_dem_cua_toi('2026-10-05', '2026-10-12')$$), 14::bigint,
              'YC2.5-NT2 tuần 05 – 11/10: 2 căn × 7 đêm = 14 dòng');
select t.bang(pg_temp.gia(t.can('1509'), '2026-10-08'), '900000', 'YC2.5-NT2 1509 đêm 08/10 (T5) giá chủ nhà 900.000đ ("900k")');
select t.bang(pg_temp.gia(t.can('3402'), '2026-10-09'), '1100000', 'YC2.5-NT2 3402 đêm 09/10 (T6) giá chủ nhà 1.100.000đ ("1,1tr")');
select t.bang(pg_temp.gia(t.can('1509'), '2026-10-10'), '1300000',
              'YC2.5-NT2 đêm có khách vẫn có giá (1509 đêm 10/10 có B1 khi tạo, giá 1.300.000đ)');
select t.bang(pg_temp.gia(t.can('1509'), '2026-10-12'), 'không có dòng', 'YC2.5-NT2 đêm p_den (12/10) không thuộc khoảng');
-- QT5.3: giá dịp thay giá tháng (3402 24/10 – 25/10 1.300.000đ).
select t.bang(pg_temp.gia(t.can('3402'), '2026-10-24', '2026-10-19', '2026-10-26'), '1300000',
              'YC2.5-NT2 QT5.3 3402 đêm 24/10 có giá dịp 1.300.000đ');
-- Khoảng vắt qua hai tháng (26/10 – 01/11).
select t.bang(pg_temp.gia(t.can('1509'), '2026-11-01', '2026-10-26', '2026-11-02'), '900000',
              'YC2.5-NT2 tuần vắt qua hai tháng: đêm 01/11 (CN) của 1509 900.000đ');
select t.thoat();

-- ===== YC2.5-NT7: đêm chưa đặt giá thì giá trống (null), không bao giờ 0 =====
insert into public.can (id, nguoi_giu, loai, ma_can, so_phong_ngu)
values ('00000000-0000-0000-0001-000000013001', t.id('hoa'), 'co_lich', 'A0807', 1);
select t.dang_nhap(t.id('hoa'));
select t.bang(pg_temp.gia('00000000-0000-0000-0001-000000013001', '2026-10-08'), '-',
              'YC2.5-NT7 căn chưa đặt giá: đêm 08/10 có dòng, giá trống (màn hiện "–")');
select t.bang(t.dem($$select * from public.fn_gia_tung_dem_cua_toi('2026-10-05', '2026-10-12') where gia = 0$$), 0::bigint,
              'YC2.5-NT7 QT5.3 không bao giờ trả giá 0');
-- 1509 có giá tới tháng 12/2026: tháng 1/2027 chưa đặt giá.
select t.bang(pg_temp.gia(t.can('1509'), '2027-01-01', '2026-12-28', '2027-01-04'), '-',
              'YC2.5-NT7 tuần vắt sang tháng chưa đặt giá: đêm 01/01/2027 giá trống');
select t.thoat();

-- Căn đã ẩn không có dòng.
update public.can set an_luc = now() where id = t.can('3402');
select t.dang_nhap(t.id('hoa'));
select t.bang(pg_temp.gia(t.can('3402'), '2026-10-09'), 'không có dòng', 'YC2.5-NT2 căn đã xóa (ẩn) không có trong lịch tuần');
select t.thoat();
update public.can set an_luc = null where id = t.can('3402');

-- Khoảng không hợp lệ bị từ chối (trống, ngược, quá 62 đêm).
select t.dang_nhap(t.id('hoa'));
select t.loi($$select * from public.fn_gia_tung_dem_cua_toi('2026-10-12', '2026-10-05')$$, 'P0001',
             'YC2.5-NT2 khoảng ngược (đến trước từ) bị từ chối');
select t.loi($$select * from public.fn_gia_tung_dem_cua_toi(null, '2026-10-12')$$, 'P0001',
             'YC2.5-NT2 thiếu ngày bị từ chối');
select t.loi($$select * from public.fn_gia_tung_dem_cua_toi('2026-01-01', '2026-12-31')$$, 'P0001',
             'YC2.5-NT2 khoảng quá 62 đêm bị từ chối');
select t.thoat();

-- ===== Vi phạm quyền (YC2 "Ai được làm gì", PQ5) =====
-- PQ5.CHU: Anh Tuấn (chủ khác) chỉ nhận căn của mình.
select t.dang_nhap(t.id('tuan'));
select t.bang(t.dem($$select distinct can_id from public.fn_gia_tung_dem_cua_toi('2026-10-05', '2026-10-12')$$), 1::bigint,
              'YC2.5-NT2 PQ5.CHU Anh Tuấn (chủ khác) chỉ nhận dòng của 1103');
select t.bang(pg_temp.gia(t.can('1103'), '2026-10-08'), '700000', 'YC2.5-NT2 Anh Tuấn nhận giá 1103 đêm 08/10 700.000đ');
select t.bang(pg_temp.gia(t.can('1509'), '2026-10-08'), 'không có dòng',
              'YC2.5-NT2 PQ5.CHU Anh Tuấn (chủ khác) không nhận giá chủ nhà 1509 của Chị Hoa');
select t.thoat();

-- PQ5.SALE: sale được chia sẻ căn của Chị Hoa không nhận giá qua lệnh lịch của chủ nhà (sale có màn riêng).
select t.dang_nhap(t.id('hung'));
select t.bang(t.dem($$select * from public.fn_gia_tung_dem_cua_toi('2026-10-05', '2026-10-12')$$), 0::bigint,
              'YC2.5-NT2 PQ5.SALE Sale Hùng (được xem mọi căn của Chị Hoa, có căn tự nhập) không nhận dòng nào');
select t.thoat();
select t.dang_nhap(t.id('nga'));
select t.bang(t.dem($$select * from public.fn_gia_tung_dem_cua_toi('2026-10-05', '2026-10-12')$$), 0::bigint,
              'YC2.5-NT2 PQ5.SALE Sale Nga (chưa kết nối) không nhận dòng nào');
select t.thoat();

-- PQ5.LINK: người chưa đăng nhập bị từ chối.
select t.khach();
select t.loi($$select * from public.fn_gia_tung_dem_cua_toi('2026-10-05', '2026-10-12')$$, '42501',
             'YC2.5-NT2 PQ5.LINK người chưa đăng nhập gọi lệnh giá từng đêm thì bị từ chối');
select t.thoat();
