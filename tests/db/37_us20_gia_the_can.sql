-- US20 · Giá trên thẻ căn (YC4.1). Lệnh đọc giá thấp nhất, cao nhất của 7 đêm trong tuần: fn_gia_tuan_cua_toi.
-- YC4.1-NT1, YC4.1-NT2, QT5.3, PQ5.CHU, PQ5.SALE, PQ3.CHU.
-- Viết trước migration (US20-TA1, CL14.5).
select t.fixture();

-- Giá cao, thấp của một căn trong tuần, dạng "thấp|cao" ('-' khi null); căn không có dòng thì 'không có dòng'. Gọi bằng vai hiện tại.
create or replace function t.gia_tuan(p_can uuid, p_tu date) returns text
language plpgsql as $$
declare v text; ma text; cau_loi text;
begin
  select coalesce(g.gia_thap::text, '-') || '|' || coalesce(g.gia_cao::text, '-') into v
  from public.fn_gia_tuan_cua_toi(p_tu) g where g.can_id = p_can;
  return coalesce(v, 'không có dòng');
exception when others then
  get stacked diagnostics ma = returned_sqlstate, cau_loi = message_text;
  raise notice 'lỗi: % % (fn_gia_tuan_cua_toi %)', ma, cau_loi, p_tu;
  return null;
end $$;
grant execute on function t.gia_tuan(uuid, date) to anon, authenticated;

-- ===== Danh mục: lệnh chạy security definer, chỉ người đã đăng nhập gọi =====
select t.ok(exists (select 1 from pg_proc where proname = 'fn_gia_tuan_cua_toi' and pronamespace = 'public'::regnamespace and prosecdef),
            'YC4.1 danh mục: có lệnh fn_gia_tuan_cua_toi chạy security definer');
select t.ok(exists (select 1 from pg_proc p where p.proname = 'fn_gia_tuan_cua_toi' and p.pronamespace = 'public'::regnamespace)
            and not exists (select 1 from pg_proc p where p.proname = 'fn_gia_tuan_cua_toi' and p.pronamespace = 'public'::regnamespace
                            and has_function_privilege('anon', p.oid, 'execute')),
            'YC4.1 PQ5.KHACH danh mục: người chưa đăng nhập không có quyền gọi fn_gia_tuan_cua_toi');
select t.ok(exists (select 1 from pg_proc p where p.proname = 'fn_gia_tuan_cua_toi' and p.pronamespace = 'public'::regnamespace
                    and has_function_privilege('authenticated', p.oid, 'execute')),
            'YC4.1 danh mục: người đã đăng nhập gọi được fn_gia_tuan_cua_toi');

-- ===== YC4.1-NT2: tuần 05/10 – 11/10/2026, thẻ 1509 là 900.000đ – 1.300.000đ, thẻ 3402 là 800.000đ – 1.100.000đ =====
select t.dang_nhap(t.id('hoa'));
select t.bang(t.so('select * from public.fn_gia_tuan_cua_toi(date ''2026-10-05'')'), 2::bigint,
              'YC4.1-NT2 Chị Hoa có 2 căn thì lệnh trả đúng 2 dòng');
select t.bang(t.gia_tuan(t.can('1509'), '2026-10-05'), '900000|1300000', 'YC4.1-NT2 tuần 05/10 thẻ 1509 là 900.000đ – 1.300.000đ');
select t.bang(t.gia_tuan(t.can('3402'), '2026-10-05'), '800000|1100000', 'YC4.1-NT2 tuần 05/10 thẻ 3402 là 800.000đ – 1.100.000đ');
select t.bang(t.gia_tuan(t.can('1509'), '2026-10-07'), '900000|1300000',
              'YC4.1-NT2 ngày giữa tuần (07/10, T4) vẫn tính cả tuần từ thứ Hai 05/10');
-- QT5.3: giá dịp thay giá tháng. Dịp 24/10 – 25/10 của 3402 giá 1.300.000đ (T7, CN), tuần 19/10 – 25/10.
select t.bang(t.gia_tuan(t.can('3402'), '2026-10-19'), '800000|1300000', 'YC4.1-NT2 QT5.3 tuần có dịp 24/10 – 25/10 thì giá cao nhất là giá dịp 1.300.000đ');
select t.thoat();

-- ===== YC4.1-NT1: căn chưa có giá đêm nào trong tuần thì giá thấp, cao đều null (không bao giờ 0) =====
insert into public.can (id, nguoi_giu, loai, ma_can, so_phong_ngu)
values ('00000000-0000-0000-0001-000000009001', t.id('hoa'), 'co_lich', 'Greenbay', 3);
-- Căn chỉ có giá tháng 10: tuần 26/10 – 01/11 có 6 đêm không giá (tháng 11) và đêm tháng 10 có giá.
insert into public.can (id, nguoi_giu, loai, ma_can, so_phong_ngu)
values ('00000000-0000-0000-0001-000000009002', t.id('hoa'), 'co_lich', '2208', 2);
insert into public.gia_thang (can_id, thang, gia_thuong, gia_cuoi_tuan)
values ('00000000-0000-0000-0001-000000009002', '2026-10-01', 1000000, 1300000);

select t.dang_nhap(t.id('hoa'));
select t.bang(t.gia_tuan('00000000-0000-0000-0001-000000009001', '2026-10-05'), '-|-',
              'YC4.1-NT1 căn chưa có giá đêm nào trong tuần thì giá thấp, cao đều trống (thẻ ghi "Chưa đặt giá")');
select t.bang(t.gia_tuan('00000000-0000-0000-0001-000000009002', '2026-10-26'), '1000000|1300000',
              'YC4.1-NT1 tuần nằm giữa hai tháng: tháng có giá tính, tháng chưa có giá bỏ qua');
select t.bang(t.gia_tuan('00000000-0000-0000-0001-000000009002', '2026-11-02'), '-|-',
              'YC4.1-NT1 tuần chỉ có tháng chưa đặt giá thì trống');
select t.bang(t.so('select * from public.fn_gia_tuan_cua_toi(date ''2026-10-05'') where gia_thap = 0 or gia_cao = 0'), 0::bigint,
              'YC4.1-NT1 QT5.3 không bao giờ trả giá 0');
select t.thoat();

-- ===== PQ3.CHU, PQ5: chỉ căn của người gọi =====
select t.dang_nhap(t.id('tuan'));
select t.bang(t.so('select * from public.fn_gia_tuan_cua_toi(date ''2026-10-05'')'), 1::bigint,
              'YC4.1 PQ3.CHU Anh Tuấn chỉ nhận dòng của căn mình');
select t.bang(t.gia_tuan(t.can('1103'), '2026-10-05'), '700000|700000', 'YC4.1 giá thẻ 1103 của Anh Tuấn là 700.000đ');
select t.bang(t.gia_tuan(t.can('1509'), '2026-10-05'), 'không có dòng', 'YC4.1 PQ5.CHU Anh Tuấn không thấy giá căn 1509 của Chị Hoa');
select t.bang(t.gia_tuan(t.can('3402'), '2026-10-05'), 'không có dòng', 'YC4.1 PQ5.CHU Anh Tuấn không thấy giá căn 3402 của Chị Hoa');
select t.thoat();

-- Sale được chia sẻ căn của Chị Hoa không nhận dòng nào qua lệnh "Căn của tôi" này (căn tự nhập không có lịch, PQ13).
select t.dang_nhap(t.id('hung'));
select t.bang(t.so('select * from public.fn_gia_tuan_cua_toi(date ''2026-10-05'')'), 0::bigint,
              'YC4.1 PQ3.SALE sale Hùng được chia sẻ 1509, 3402 và có căn tự nhập vẫn không nhận dòng nào');
select t.thoat();

-- Căn đã ẩn không có dòng.
update public.can set an_luc = now() where id = t.can('3402');
select t.dang_nhap(t.id('hoa'));
select t.bang(t.gia_tuan(t.can('3402'), '2026-10-05'), 'không có dòng', 'YC4.1 căn đã xóa không có dòng giá tuần');
select t.thoat();
