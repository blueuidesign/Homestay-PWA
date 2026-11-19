-- US44 · Tìm phòng trống theo ngày (YC7.2). Viết trước migration (US44-TA1, CL14.5): task sau không sửa file này.
-- Hợp đồng database (YC7 "Dữ liệu", thiet-ke-db.md mục 3 bất biến 3, 5, 7):
--   fn_sale_tim(p_tu date, p_den date, p_so_phong_ngu smallint[] default null, p_toa_nha uuid[] default null,
--               p_view text[] default null) returns jsonb, chạy security definer, ghi một lần tìm vào tim_gan_day.
--   Lọc: số phòng ngủ (4 nghĩa là 4 trở lên), tòa nhà (id), loại view (mã 'bien', 'thanh_pho', 'nui'). Mảng rỗng hay null
--   là không lọc. Ngày nhận trước hôm nay (giờ Việt Nam, local_today()) bị từ chối P0001 (YC7-H1); khoảng 1 đến 31 đêm.
--   Kết quả: {"so_can_trong": n, "can": [...], "goi_y": [...]}.
--   can: mỗi căn trống mọi đêm trong khoảng (QT2.1) mà sale được xem (căn của tôi, my_shared_can_ids()), cùng căn tự nhập
--   của người gọi khớp bộ lọc (nhóm 'tu_nhap', khong_co_lich true, không giá, không tính vào so_can_trong; QT6.4).
--   Khóa của một căn: can_id, nhom, ma_can, ten_toa, ten_chu, so_phong_ngu, loai_view, lich_doi_luc, tong_gia_chu,
--   tong_gia_ban, khong_co_lich. Không tên người đặt, khách, tiền phòng.
--   goi_y: chỉ khi so_can_trong = 0. Mỗi gợi ý {loai, tu, den, so_phong_ngu, toa_nha, view, so_can, ten_toa}: loai
--   'doi_ngay' (±1 ngày, không lùi trước hôm nay), 'bo_loc_toa', 'bo_loc_view', 'bo_loc_phong_ngu', 'them_phong_ngu'
--   (thêm số phòng ngủ liền kề). so_can là số căn trống nếu tìm theo gợi ý đó, chỉ đếm căn sale được xem, không đếm căn
--   tự nhập; chỉ trả gợi ý có so_can > 0. ten_toa: tên tòa của các căn trống đó.
--   tim_gan_day: mỗi người gọi giữ 5 dòng mới nhất; bo_loc là {"so_phong_ngu": [...], "toa_nha": [...], "view": [...]}
--   đã sắp, bỏ khóa rỗng. Cùng điều kiện thì không thêm dòng, đưa dòng cũ lên đầu (YC7-H5). Đọc qua RLS, app không ghi thẳng.
select t.fixture();

-- "Hôm nay" là 06/10/2026 (thay local_today() trong giao dịch của file này, như 51_us19_xoa_can.sql).
create or replace function pg_temp.hom_nay(p_ngay date) returns void language plpgsql as $hn$
begin
  execute format('create or replace function public.local_today() returns date '
                 'language sql stable security definer set search_path = '''' as $b$ select date %L $b$', p_ngay);
end $hn$;
select pg_temp.hom_nay('2026-10-06');

-- Căn của Sale Hùng (DLM.3): Green Bay 0812 (2PN), Mường Thanh 1605 (1PN). Căn I3 của Chị Hoa: 3PN ở ICON40.
-- Căn H2 của Chị Hoa (2PN, ICON40) chia cho Lan rồi xóa. Anh Tuấn kết nối Hùng (tất cả căn) và Lan (đã ngừng).
insert into public.toa_nha (id, ten, home247_dat_san, tao_boi) values
  ('00000000-0000-0000-0002-000000044001', 'Green Bay', true, null),
  ('00000000-0000-0000-0002-000000044002', 'Mường Thanh', true, null);
insert into public.can (id, nguoi_giu, loai, ma_can, so_phong_ngu, loai_view, toa_nha_id) values
  ('00000000-0000-0000-0001-000000440812', t.id('hung'), 'co_lich', '0812', 2, 'bien', '00000000-0000-0000-0002-000000044001'),
  ('00000000-0000-0000-0001-000000441605', t.id('hung'), 'co_lich', '1605', 1, 'bien', '00000000-0000-0000-0002-000000044002'),
  ('00000000-0000-0000-0001-000000440013', t.id('hoa'), 'co_lich', 'I3', 3, 'thanh_pho', t.toa('icon40')),
  ('00000000-0000-0000-0001-000000440012', t.id('hoa'), 'co_lich', 'H2', 2, 'bien', t.toa('icon40'));
update public.can set loai_view = 'bien' where id = t.can('1509');
update public.can set loai_view = 'nui' where id = t.can('1103');
insert into public.gia_thang (can_id, thang, gia_thuong, gia_cuoi_tuan) values
  ('00000000-0000-0000-0001-000000440812', '2026-10-01', 750000, 900000);
insert into public.ket_noi_can (ket_noi_id, can_id) values (t.kn('hoa', 'lan'), '00000000-0000-0000-0001-000000440012');
update public.can set an_luc = now() where id = '00000000-0000-0000-0001-000000440012';
insert into public.ket_noi (chu_id, sale_id, trang_thai, nguon, pham_vi, xem_coc) values
  (t.id('tuan'), t.id('hung'), 'da_ket_noi', 'link_moi', 'tat_ca', true),
  (t.id('tuan'), t.id('lan'), 'da_ket_noi', 'link_moi', 'tat_ca', true);
select t.dang_nhap(t.id('tuan'));
select t.bang(t.gt(format('public.fn_ngung_cho_xem(%L)',
                          (select id from public.ket_noi where chu_id = t.id('tuan') and sale_id = t.id('lan')))),
              'chu_ngung', 'YC7.2-NT6 Anh Tuấn ngừng cho Sale Lan xem');
select t.thoat();

-- Đặt phòng: I3 kín đêm 10/10; 3402 kín 10/10, 11/10; Green Bay 0812, Mường Thanh 1605 kín 10/10.
select t.tao_booking('I3', '00000000-0000-0000-0001-000000440013', '2026-10-10', '2026-10-11', 1000000);
select t.tao_booking('H3402', t.can('3402'), '2026-10-10', '2026-10-12', 1600000);
select t.tao_booking('GB', '00000000-0000-0000-0001-000000440812', '2026-10-10', '2026-10-11', 750000);
select t.tao_booking('MT', '00000000-0000-0000-0001-000000441605', '2026-10-10', '2026-10-11', 700000);

-- Gọi lệnh tìm bằng vai hiện tại; lỗi thì in NOTICE và trả null.
create or replace function pg_temp.tim(p_tu date, p_den date, p_pn smallint[] default null, p_toa uuid[] default null,
                                       p_view text[] default null) returns jsonb
language plpgsql as $$
declare v jsonb;
begin
  v := public.fn_sale_tim(p_tu, p_den, p_pn, p_toa, p_view);
  return v;
exception when others then
  raise notice 'lỗi: % % (fn_sale_tim)', sqlstate, sqlerrm;
  return null;
end $$;

-- Mã căn trong kết quả, theo nhóm ('*' là mọi nhóm), sắp theo mã.
create or replace function pg_temp.ma(p_kq jsonb, p_nhom text default '*') returns text language sql as $$
  select coalesce(string_agg(c ->> 'ma_can', ',' order by c ->> 'ma_can'), '')
  from jsonb_array_elements(coalesce(p_kq -> 'can', '[]')) c
  where p_nhom = '*' or c ->> 'nhom' = p_nhom
$$;

-- Gợi ý dạng 'loai:tu>den:so_can', theo thứ tự trả về.
create or replace function pg_temp.goi_y(p_kq jsonb) returns text language sql as $$
  select coalesce(string_agg((g ->> 'loai') || ':' || (g ->> 'tu') || '>' || (g ->> 'den') || ':' || (g ->> 'so_can'), ';'
                             order by n), '')
  from jsonb_array_elements(coalesce(p_kq -> 'goi_y', '[]')) with ordinality x(g, n)
$$;

-- ===== Danh mục (KT-DB.3.3) =====
select t.ok(exists (select 1 from pg_proc where proname = 'fn_sale_tim' and pronamespace = 'public'::regnamespace and prosecdef
                      and proconfig::text like '%search_path=%'),
            'YC7.2 KT-DB.3.3 có lệnh fn_sale_tim chạy security definer, đặt search_path');
select t.ok(exists (select 1 from pg_proc p where p.proname = 'fn_sale_tim' and p.pronamespace = 'public'::regnamespace)
            and not exists (select 1 from pg_proc p where p.proname = 'fn_sale_tim' and p.pronamespace = 'public'::regnamespace
                              and has_function_privilege('anon', p.oid, 'execute')),
            'YC7.2 PQ4.LINK người chưa đăng nhập không có quyền gọi fn_sale_tim');
select t.khach();
select t.loi($$select public.fn_sale_tim('2026-10-10', '2026-10-12')$$, '42501',
             'YC7.2 PQ4.LINK người chưa đăng nhập gọi fn_sale_tim thì bị từ chối');
select t.thoat();

-- ===== YC7.2 bước 5: kết quả có căn trống =====
select t.dang_nhap(t.id('hung'));
create temp table kq_hung as select pg_temp.tim('2026-10-10', '2026-10-12') as kq;
select t.bang(pg_temp.ma((select kq from kq_hung), 'cua_toi'), '',
              'YC7.2 bước 5 QT2.1 Green Bay 0812, Mường Thanh 1605 kín đêm 10/10: không có trong căn trống');
select t.bang(pg_temp.ma((select kq from kq_hung), 'nguon'), '1103,1509',
              'YC7.2 bước 5 QT2.1 nguồn phòng trống 10/10 → 12/10: 1103, 1509 (I3, 3402 kín; H2 đã xóa)');
select t.bang(pg_temp.ma((select kq from kq_hung), 'tu_nhap'), 'Villa Tuần Châu',
              'YC7.2 bước 5 QT6.4 căn tự nhập Villa Tuần Châu ở nhóm tu_nhap');
select t.bang(((select kq from kq_hung) ->> 'so_can_trong')::int, 2,
              'YC7.2 bước 5 QT6.4 số căn trống 2, không tính căn tự nhập');
select t.bang((select (c ->> 'khong_co_lich') || '|' || coalesce(c ->> 'tong_gia_ban', '-')
               from jsonb_array_elements((select kq from kq_hung) -> 'can') c where c ->> 'nhom' = 'tu_nhap'),
              'true|-', 'YC7.2 bước 5 QT6.4 căn tự nhập có cờ không có lịch, không giá');
select t.bang((select (c ->> 'tong_gia_chu') || '|' || (c ->> 'tong_gia_ban')
               from jsonb_array_elements((select kq from kq_hung) -> 'can') c where c ->> 'ma_can' = '1509'),
              '2200000|2600000',
              'YC7.2 bước 5 QT5.4 1509 10/10 → 12/10: tổng giá chủ 2.200.000đ, tổng giá bán 2.600.000đ (+200k mỗi đêm)');
select t.bang((select string_agg(k, ',' order by k)
               from jsonb_array_elements((select kq from kq_hung) -> 'can') c, jsonb_object_keys(c) k
               where c ->> 'ma_can' = '1509'),
              'can_id,khong_co_lich,lich_doi_luc,loai_view,ma_can,nhom,so_phong_ngu,ten_chu,ten_toa,tong_gia_ban,tong_gia_chu',
              'YC7.2 KT-DB.3.5 mỗi căn chỉ có các khóa đã định (không người đặt, khách, tiền phòng)');
select t.bang(jsonb_array_length(coalesce((select kq from kq_hung) -> 'goi_y', '[]')), 0,
              'YC7.2 bước 6 có căn trống thì không trả gợi ý');
select t.bang(pg_temp.ma(pg_temp.tim('2026-10-10', '2026-10-12', '{3}')), '1103',
              'YC7.2 bước 3 lọc 3PN: còn 1103 (căn tự nhập chưa ghi số phòng ngủ không khớp)');
select t.bang(pg_temp.ma(pg_temp.tim('2026-10-10', '2026-10-12', null, array[t.toa('icon40')])), '1509',
              'YC7.2 bước 3 lọc tòa ICON40: còn 1509');
select t.bang(pg_temp.ma(pg_temp.tim('2026-10-10', '2026-10-12', null, null, '{nui}')), '1103',
              'YC7.2 bước 3 lọc view núi: còn 1103');
select t.bang(pg_temp.ma(pg_temp.tim('2026-10-12', '2026-10-13', '{4}')), '',
              'YC7.2 bước 3 lọc 4PN+: không căn nào có 4 phòng ngủ trở lên');
select t.thoat();

-- ===== YC7.2-NT3: không có căn trống thì có gợi ý kèm số căn trống =====
-- Hùng tìm 10/10 → 12/10 · 3PN · ICON40: I3 kín đêm 10/10.
select t.dang_nhap(t.id('hung'));
create temp table kq_khong as select pg_temp.tim('2026-10-10', '2026-10-12', '{3}', array[t.toa('icon40')]) as kq;
select t.bang(((select kq from kq_khong) ->> 'so_can_trong')::int, 0, 'YC7.2-NT3 Hùng tìm 10/10 → 12/10 · 3PN · ICON40: 0 căn trống');
select t.ok(jsonb_array_length(coalesce((select kq from kq_khong) -> 'goi_y', '[]')) >= 1
            and not exists (select 1 from jsonb_array_elements((select kq from kq_khong) -> 'goi_y') g where (g ->> 'so_can')::int < 1),
            'YC7.2-NT3 có ít nhất một gợi ý, gợi ý nào cũng có số căn trống');
select t.bang(pg_temp.goi_y((select kq from kq_khong)),
              'doi_ngay:2026-10-11>2026-10-13:1;bo_loc_toa:2026-10-10>2026-10-12:1;bo_loc_phong_ngu:2026-10-10>2026-10-12:1;them_phong_ngu:2026-10-10>2026-10-12:1',
              'YC7.2-NT3 gợi ý: đổi sang 11/10 → 13/10 (I3), bỏ lọc tòa (1103), bỏ lọc phòng ngủ (1509), thêm 2PN (1509)');
select t.bang((select g -> 'ten_toa' from jsonb_array_elements((select kq from kq_khong) -> 'goi_y') g where g ->> 'loai' = 'bo_loc_toa'),
              '["Sapphire"]'::jsonb, 'YC7.2-NT3 gợi ý bỏ lọc tòa ghi tòa có căn trống: Sapphire');
select t.bang((select g -> 'so_phong_ngu' from jsonb_array_elements((select kq from kq_khong) -> 'goi_y') g where g ->> 'loai' = 'them_phong_ngu'),
              '[2, 3]'::jsonb, 'YC7.2-NT3 gợi ý thêm 2PN mang điều kiện 2PN, 3PN');
select t.bang((select (g -> 'toa_nha') || (g -> 'so_phong_ngu') from jsonb_array_elements((select kq from kq_khong) -> 'goi_y') g
               where g ->> 'loai' = 'doi_ngay'),
              jsonb_build_array(t.toa('icon40'), 3), 'YC7.2-NT3 gợi ý đổi ngày giữ nguyên bộ lọc');
-- Làm theo gợi ý thì đúng số căn trống đã báo.
select t.bang((pg_temp.tim('2026-10-11', '2026-10-13', '{3}', array[t.toa('icon40')]) ->> 'so_can_trong')::int, 1,
              'YC7.2-NT3 tìm theo gợi ý đổi ngày: đúng 1 căn trống như đã báo');
-- Lùi một ngày (09/10 → 11/10) vẫn kín nên không gợi ý; tìm từ hôm nay thì không gợi ý lùi trước hôm nay.
select t.ok(not exists (select 1 from jsonb_array_elements(pg_temp.tim('2026-10-06', '2026-10-07', '{4}') -> 'goi_y') g
                        where (g ->> 'tu')::date < '2026-10-06'),
            'YC7.2-NT3 YC7-H1 gợi ý đổi ngày không lùi trước hôm nay');
-- Căn tự nhập không tính vào số căn trống của gợi ý: mọi căn có lịch kín đêm 10/10 → còn Villa, vẫn "0 căn trống".
select t.thoat();
select t.tao_booking('B1509', t.can('1509'), '2026-10-10', '2026-10-11', 1300000);
select t.tao_booking('B1103', t.can('1103'), '2026-10-10', '2026-10-11', 700000);
select t.dang_nhap(t.id('hung'));
select t.bang((pg_temp.tim('2026-10-10', '2026-10-12') ->> 'so_can_trong')::int, 0,
              'YC7.2-NT3 QT6.4 mọi căn có lịch kín: 0 căn trống dù còn căn tự nhập');
select t.bang(pg_temp.ma(pg_temp.tim('2026-10-10', '2026-10-12'), 'tu_nhap'), 'Villa Tuần Châu',
              'YC7.2-NT3 QT6.4 căn tự nhập vẫn ở nhóm riêng khi không có căn trống');
select t.thoat();
update public.booking set trang_thai = 'da_huy' where id in (t.b('B1509'), t.b('B1103'));
-- Đặt phòng đã hủy không chiếm đêm (QT2.1).
select t.dang_nhap(t.id('hung'));
select t.bang(pg_temp.ma(pg_temp.tim('2026-10-10', '2026-10-12'), 'nguon'), '1103,1509',
              'YC7.2 QT2.1 đặt phòng đã hủy không chiếm đêm: 1103, 1509 lại trống');
select t.thoat();

-- ===== YC7.2-NT6: Sale Lan không thấy căn ngoài quyền, kể cả trong số đếm gợi ý =====
select t.dang_nhap(t.id('lan'));
create temp table kq_lan as select pg_temp.tim('2026-10-10', '2026-10-12') as kq;
select t.bang(pg_temp.ma((select kq from kq_lan)), '1509',
              'YC7.2-NT6 Sale Lan tìm 10/10 → 12/10: chỉ có 1509');
select t.ok(not exists (select 1 from jsonb_array_elements((select kq from kq_lan) -> 'can') c
                        where c ->> 'ma_can' in ('0812', '1605', 'Villa Tuần Châu')),
            'YC7.2-NT6 PQ13.SALE PQ14.SALE kết quả của Lan không có Green Bay 0812, Mường Thanh 1605, Villa Tuần Châu của Sale Hùng');
select t.ok(not exists (select 1 from jsonb_array_elements((select kq from kq_lan) -> 'can') c where c ->> 'ma_can' = 'H2'),
            'YC7.2-NT6 PQ3.SALE kết quả của Lan không có căn H2 đã xóa');
select t.ok(not exists (select 1 from jsonb_array_elements((select kq from kq_lan) -> 'can') c where c ->> 'ma_can' = '1103'),
            'YC7.2-NT6 PQ4.SALE kết quả của Lan không có 1103 của Anh Tuấn đã ngừng Lan');
select t.ok(not exists (select 1 from jsonb_array_elements((select kq from kq_lan) -> 'can') c where c ->> 'ma_can' = '3402'),
            'YC7.2-NT6 PQ3.SALE kết quả của Lan không có 3402 ngoài phạm vi');
select t.thoat();
-- 1509 kín đêm 10/10: Lan không còn căn trống. Gợi ý chỉ đếm 1509, không đếm H2, 1103, căn của Hùng (đều trống 11/10 → 13/10).
select t.tao_booking('L1509', t.can('1509'), '2026-10-10', '2026-10-11', 1300000);
select t.dang_nhap(t.id('lan'));
create temp table kq_lan0 as select pg_temp.tim('2026-10-10', '2026-10-12') as kq;
select t.bang(((select kq from kq_lan0) ->> 'so_can_trong')::int, 0, 'YC7.2-NT6 1509 kín đêm 10/10: Lan có 0 căn trống');
select t.bang(pg_temp.goi_y((select kq from kq_lan0)), 'doi_ngay:2026-10-11>2026-10-13:1',
              'YC7.2-NT6 số đếm gợi ý đổi sang 11/10 → 13/10 là 1 (chỉ 1509), không tính căn đã xóa, căn của chủ đã ngừng, căn của Hùng');
select t.bang(pg_temp.goi_y(pg_temp.tim('2026-10-10', '2026-10-12', '{2}')), 'doi_ngay:2026-10-11>2026-10-13:1',
              'YC7.2-NT6 lọc 2PN: gợi ý đổi ngày đếm 1 (không tính H2 2PN đã xóa, Green Bay 0812 2PN của Hùng)');
select t.bang(pg_temp.goi_y(pg_temp.tim('2026-10-10', '2026-10-12', '{3}')), '',
              'YC7.2-NT6 lọc 3PN: không có gợi ý nào (1103 của Anh Tuấn đã ngừng Lan, I3 ngoài phạm vi không được đếm)');
select t.thoat();
-- Chị Hoa xóa tài khoản: Lan không còn căn nào, gợi ý cũng không đếm căn của Chị Hoa.
update public.profiles set da_xoa_luc = now(), so_dien_thoai = null where id = t.id('hoa');
update public.booking set trang_thai = 'da_huy' where id = t.b('L1509');
select t.dang_nhap(t.id('lan'));
select t.bang(pg_temp.ma(pg_temp.tim('2026-10-10', '2026-10-12')) || '|' || pg_temp.goi_y(pg_temp.tim('2026-10-10', '2026-10-12')), '|',
              'YC7.2-NT6 PQ23.SALE Chị Hoa xóa tài khoản: kết quả, gợi ý của Lan rỗng');
select t.thoat();
update public.profiles set da_xoa_luc = null, so_dien_thoai = '0900000001' where id = t.id('hoa');
-- Sale chưa kết nối, chưa có căn: rỗng.
select t.dang_nhap(t.id('nga'));
select t.bang(pg_temp.ma(pg_temp.tim('2026-10-10', '2026-10-12')) || '|' || pg_temp.goi_y(pg_temp.tim('2026-10-10', '2026-10-12')), '|',
              'YC7.2-NT6 PQ4.SALE Sale Nga chưa kết nối: kết quả, gợi ý rỗng');
select t.thoat();
-- Chủ nhà gọi lệnh tìm: chỉ căn của mình, giá của chính chủ, không giá bán của sale nào.
select t.dang_nhap(t.id('hoa'));
select t.bang(pg_temp.ma(pg_temp.tim('2026-10-12', '2026-10-13'), 'nguon') || '|' || pg_temp.ma(pg_temp.tim('2026-10-12', '2026-10-13'), 'tu_nhap'),
              '|', 'YC7.2 PQ11.CHU PQ14.CHU Chị Hoa không nhận căn nguồn, căn tự nhập của sale nào');
select t.bang((select (c ->> 'tong_gia_chu') || '|' || (c ->> 'tong_gia_ban')
               from jsonb_array_elements(pg_temp.tim('2026-10-12', '2026-10-13') -> 'can') c where c ->> 'ma_can' = '1509'),
              '900000|900000', 'YC7.2 PQ11.CHU Chị Hoa thấy 1509 bằng giá của chính chủ, không có mức cộng của Sale Hùng');
select t.thoat();

-- ===== YC7.2-NT8: ngày nhận trước hôm nay bị từ chối; khoảng ngày sai bị từ chối =====
select t.dang_nhap(t.id('hung'));
select t.loi($$select public.fn_sale_tim('2026-10-05', '2026-10-07')$$, 'P0001',
             'YC7.2-NT8 YC7-H1 gửi lệnh tìm với ngày nhận 05/10 trước hôm nay 06/10 thì database từ chối');
select t.khong_loi($$select public.fn_sale_tim('2026-10-06', '2026-10-07')$$, 'YC7.2-NT8 YC7-H1 ngày nhận là hôm nay thì tìm được');
select t.loi($$select public.fn_sale_tim('2026-10-12', '2026-10-10')$$, 'P0001', 'YC7.2 khoảng ngược bị từ chối');
select t.loi($$select public.fn_sale_tim('2026-10-12', '2026-10-12')$$, 'P0001', 'YC7.2 ngày trả bằng ngày nhận bị từ chối');
select t.loi($$select public.fn_sale_tim(null, '2026-10-12')$$, 'P0001', 'YC7.2-NT1 chưa chọn ngày nhận bị từ chối');
select t.loi($$select public.fn_sale_tim('2026-10-10', '2026-12-10')$$, 'P0001', 'YC7.2 khoảng quá 31 đêm bị từ chối');
select t.loi($$select public.fn_sale_tim('2026-10-10', '2026-10-12', null, null, '{vinh}')$$, 'P0001',
             'YC7.2-NT7 loại view "Vịnh" không có: database từ chối');
select t.loi($$select public.fn_sale_tim('2026-10-10', '2026-10-12', '{0}')$$, 'P0001', 'YC7.2 số phòng ngủ ngoài 1 đến 4 bị từ chối');
select t.thoat();
-- Lần tìm bị từ chối không ghi vào tìm gần đây.
select t.bang((select count(*) from public.tim_gan_day where sale_id = t.id('hung')
                and (tu_ngay = '2026-10-05' or den_ngay <= tu_ngay or den_ngay = '2026-12-10'
                     or bo_loc -> 'view' ? 'vinh' or bo_loc -> 'so_phong_ngu' @> '[0]')), 0::bigint,
              'YC7.2-NT8 lần tìm bị từ chối không ghi vào tìm gần đây');

-- ===== YC7.2-NT5, NT8: tìm gần đây =====
delete from public.tim_gan_day;
select t.dang_nhap(t.id('hung'));
select pg_temp.tim('2026-10-10', '2026-10-12', '{2}');
select pg_temp.tim('2026-10-17', '2026-10-18', '{1}', null, '{bien}');
select pg_temp.tim('2026-10-10', '2026-10-12', '{2}');
select t.thoat();
select t.bang((select count(*) from public.tim_gan_day where sale_id = t.id('hung')), 2::bigint,
              'YC7.2-NT8 YC7-H5 Hùng tìm hai lần 10/10 → 12/10 · 2PN: chỉ một dòng cho điều kiện đó (tổng 2 dòng)');
select t.dang_nhap(t.id('hung'));
select t.bang(t.gt($$(select tu_ngay::text || '>' || den_ngay::text || '|' || bo_loc::text from public.tim_gan_day
                      order by tim_luc desc limit 1)$$),
              '2026-10-10>2026-10-12|{"so_phong_ngu": [2]}',
              'YC7.2-NT8 YC7-H5 lần tìm trùng đưa lên đầu "Tìm gần đây"');
select t.bang(t.gt($$(select bo_loc::text from public.tim_gan_day where tu_ngay = '2026-10-17')$$),
              '{"view": ["bien"], "so_phong_ngu": [1]}', 'YC7.2 bước 5 lần tìm ghi điều kiện lọc, bỏ khóa rỗng');
-- Cùng tòa, view, phòng ngủ nhưng gửi khác thứ tự vẫn là một điều kiện.
select pg_temp.tim('2026-10-20', '2026-10-21', '{3,2}', array[t.toa('sapphire'), t.toa('icon40')], '{nui,bien}');
select pg_temp.tim('2026-10-20', '2026-10-21', '{2,3}', array[t.toa('icon40'), t.toa('sapphire')], '{bien,nui}');
select t.bang(t.so($$select 1 from public.tim_gan_day where tu_ngay = '2026-10-20'$$), 1::bigint,
              'YC7.2-NT8 YC7-H5 cùng điều kiện khác thứ tự lọc vẫn chỉ một dòng');
-- Thêm cho đủ 6 lần khác nhau.
select pg_temp.tim('2026-10-22', '2026-10-23');
select pg_temp.tim('2026-10-24', '2026-10-25');
select pg_temp.tim('2026-10-26', '2026-10-27');
select t.bang(t.so($$select 1 from public.tim_gan_day$$), 5::bigint, 'YC7.2-NT5 Hùng tìm 6 lần khác nhau: có đúng 5 lần gần nhất');
select t.bang(t.gt($$(select string_agg(tu_ngay::text, ',' order by tim_luc desc) from public.tim_gan_day)$$),
              '2026-10-26,2026-10-24,2026-10-22,2026-10-20,2026-10-10',
              'YC7.2-NT5 năm lần mới nhất, mới trước; lần cũ nhất (17/10) bị bỏ');
select t.thoat();
-- Sale Lan không đọc, không ghi được lần tìm của Hùng.
select t.dang_nhap(t.id('lan'));
select pg_temp.tim('2026-10-11', '2026-10-12');
select t.bang(coalesce(t.so(format('select 1 from public.tim_gan_day where sale_id = %L', t.id('hung'))), 0), 0::bigint,
              'YC7.2-NT5 Sale Lan không đọc được lần tìm nào của Hùng');
select t.bang(t.so($$select 1 from public.tim_gan_day$$), 1::bigint, 'YC7.2-NT5 Sale Lan chỉ đọc lần tìm của chính Lan');
select t.ok(t.ma_loi(format($q$insert into public.tim_gan_day (sale_id, tu_ngay, den_ngay) values (%L, '2026-10-10', '2026-10-12')$q$,
                            t.id('hung'))) is not null,
            'YC7.2-NT5 Sale Lan không ghi thẳng được lần tìm cho Hùng');
select t.ok(t.ma_loi($$insert into public.tim_gan_day (sale_id, tu_ngay, den_ngay) values (auth.uid(), '2026-10-10', '2026-10-12')$$) is not null,
            'YC7.2 app không ghi thẳng bảng tim_gan_day, chỉ qua fn_sale_tim');
select t.ok(t.ma_loi(format($q$delete from public.tim_gan_day where sale_id = %L$q$, t.id('hung'))) is not null
            or (select count(*) from public.tim_gan_day) = 1,
            'YC7.2-NT5 Sale Lan không xóa được lần tìm của Hùng');
select t.thoat();
select t.bang((select count(*) from public.tim_gan_day where sale_id = t.id('hung')), 5::bigint,
              'YC7.2-NT5 lần tìm của Lan không đụng 5 lần tìm của Hùng');
