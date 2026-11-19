-- US25 · Những đêm tính giá cuối tuần (YC4.6). Lệnh đổi đêm cuối tuần fn_dat_dem_cuoi_tuan ghi hồ sơ của chính người gọi.
-- YC4.6-NT2, NT3, NT4, YC4 "Quy tắc của nhóm" (Luôn có giá cuối tuần), YC4 "Ai được làm gì", QT4.1, QT5.3, QT5.5, PQ5, PQ6.CHU.
-- Viết trước migration (US25-TA1, CL14.5): task sau không sửa file này.
select t.fixture();

-- "Hôm nay" cố định là T4 07/10/2026 như dữ liệu mẫu. Cả file chạy trong một giao dịch rồi rollback.
create or replace function public.local_today() returns date
language sql stable security definer set search_path = ''
as $$ select date '2026-10-07' $$;

-- Chạy câu lệnh, mong bị từ chối với đúng mã lỗi và đúng câu (QT5.5).
create or replace function t.loi_cau(cau text, ma_mong text, cau_mong text, ten text) returns void
language plpgsql as $$
declare ma text; cau_loi text;
begin
  begin
    execute cau;
  exception when others then
    get stacked diagnostics ma = returned_sqlstate, cau_loi = message_text;
    if ma = ma_mong and cau_loi = cau_mong then
      raise notice 'ok - %', ten;
    else
      raise notice 'not ok - % (ra: % "%", mong: % "%")', ten, ma, cau_loi, ma_mong, cau_mong;
    end if;
    return;
  end;
  raise notice 'not ok - % (không bị từ chối)', ten;
end $$;

-- Đêm cuối tuần của một người, dạng "5,6", đọc bằng vai chủ database.
create or replace function t.dem_ct(p_nguoi uuid) returns text
language sql stable as $$
  select array_to_string(dem_cuoi_tuan, ',') from public.profiles where id = p_nguoi
$$;

-- Một đêm của lịch giá, dạng "giá|loại", gọi bằng vai hiện tại.
create or replace function t.dem_gia25(p_can uuid, p_thang date, p_dem date) returns text
language sql stable as $$
  select coalesce(l.gia::text, '-') || '|' || l.loai from public.fn_lich_gia_thang(p_can, p_thang) l where l.dem = p_dem
$$;

-- Tổng giá của các đêm từ ngày nhận tới trước ngày trả theo lịch giá (tiền phòng điền sẵn, QT4.1), vai hiện tại.
create or replace function t.dien_san(p_can uuid, p_nhan date, p_tra date) returns bigint
language sql stable as $$
  select coalesce(sum(l.gia), 0)::bigint
  from public.fn_lich_gia_thang(p_can, date_trunc('month', p_nhan)::date) l
  where l.dem >= p_nhan and l.dem < p_tra
$$;

grant execute on all functions in schema t to anon, authenticated;

-- ===== Danh mục: lệnh chạy security definer, chỉ người đã đăng nhập gọi; app không ghi thẳng hồ sơ =====
select t.ok(exists (select 1 from pg_proc where proname = 'fn_dat_dem_cuoi_tuan' and pronamespace = 'public'::regnamespace and prosecdef),
            'YC4.6 bước 4 danh mục: có lệnh fn_dat_dem_cuoi_tuan chạy security definer');
select t.ok(exists (select 1 from pg_proc p where p.proname = 'fn_dat_dem_cuoi_tuan' and p.pronamespace = 'public'::regnamespace)
            and not exists (select 1 from pg_proc p where p.proname = 'fn_dat_dem_cuoi_tuan'
                            and p.pronamespace = 'public'::regnamespace and has_function_privilege('anon', p.oid, 'execute')),
            'YC4 Ai được làm gì danh mục: người chưa đăng nhập không có quyền gọi fn_dat_dem_cuoi_tuan');
select t.ok(exists (select 1 from pg_proc p where p.proname = 'fn_dat_dem_cuoi_tuan' and p.pronamespace = 'public'::regnamespace
                    and has_function_privilege('authenticated', p.oid, 'execute')),
            'YC4.6 danh mục: người đã đăng nhập gọi được fn_dat_dem_cuoi_tuan');
select t.ok(not exists (select 1 from pg_proc p where p.proname = 'fn_dat_dem_cuoi_tuan' and p.pronamespace = 'public'::regnamespace
                        and exists (select 1 from unnest(coalesce(p.proargnames, '{}')) a where a ilike '%nguoi%' or a ilike '%id%')),
            'YC4.6-NT4 lệnh đổi đêm cuối tuần không nhận người bị đổi từ app (chỉ đổi của người gọi)');
select t.ok(not has_table_privilege('authenticated', 'public.profiles', 'update')
            or not has_column_privilege('authenticated', 'public.profiles', 'dem_cuoi_tuan', 'update'),
            'YC4 Ai được làm gì danh mục: app không ghi thẳng cột dem_cuoi_tuan (ghi qua fn_dat_dem_cuoi_tuan)');

-- ===== Trạng thái đầu: mặc định T6, T7 =====
select t.bang(t.dem_ct(t.id('hoa')), '5,6', 'YC4.6 mặc định đêm cuối tuần của Chị Hoa là T6, T7');

-- ===== YC4.6-NT3: đêm cuối tuần T6, T7, nhận 1509 ngày 09/10 (T6), trả 11/10 (CN): hai đêm đều 1.300.000đ =====
select t.dang_nhap(t.id('hoa'));
select t.bang(t.dem_gia25(t.can('1509'), '2026-10-01', '2026-10-09'), '1300000|cuoi_tuan',
              'YC4.6-NT3 đêm 09/10 (T6) của 1509 giá 1.300.000đ khi cuối tuần là T6, T7');
select t.bang(t.dem_gia25(t.can('1509'), '2026-10-01', '2026-10-10'), '1300000|cuoi_tuan',
              'YC4.6-NT3 đêm 10/10 (T7) của 1509 giá 1.300.000đ khi cuối tuần là T6, T7');
select t.bang(t.dem_gia25(t.can('1509'), '2026-10-01', '2026-10-11'), '900000|thuong',
              'YC4.6-NT3 đêm 11/10 (CN) của 1509 là đêm ngày thường 900.000đ khi cuối tuần là T6, T7');
select t.bang(t.dien_san(t.can('1509'), '2026-10-09', '2026-10-11'), 2600000::bigint,
              'YC4.6-NT3 tiền phòng điền sẵn cho nhận 09/10 trả 11/10 là 2.600.000đ (hai đêm cuối tuần 1.300.000đ)');
select t.thoat();

-- ===== YC4.6-NT2: Chị Hoa chọn T7 và CN rồi lưu =====
-- Booking có sẵn trước khi đổi: tiền booking giữ nguyên (QT4.1, YC4 "Đặt phòng giữ giá riêng").
select t.tao_booking('B1', t.can('1509'), '2026-10-09', '2026-10-11', 1800000, t.id('hung'), 'tu_yeu_cau');
select set_config('t.tien_truoc', (select tien_phong::text from public.booking where id = t.b('B1')), true);
select set_config('t.dem_truoc', (select string_agg(dem::text || ':' || tien::text, ',' order by dem) from public.booking_dem where booking_id = t.b('B1')), true);
update public.can set lich_doi_luc = now() - interval '2 days' where id in (t.can('1509'), t.can('3402'), t.can('1103'));

select t.dang_nhap(t.id('hoa'));
select t.khong_loi($$select public.fn_dat_dem_cuoi_tuan(array[6, 7]::smallint[])$$,
                   'YC4.6-NT2 Chị Hoa chọn T7 và CN rồi lưu thì lệnh qua');
select t.bang(t.dem_gia25(t.can('1509'), '2026-10-01', '2026-10-11'), '1300000|cuoi_tuan',
              'YC4.6-NT2 đêm 11/10 (CN) của 1509 có giá 1.300.000đ khi cuối tuần là T7, CN');
select t.bang(t.dem_gia25(t.can('1509'), '2026-10-01', '2026-10-10'), '1300000|cuoi_tuan',
              'YC4.6-NT2 đêm 10/10 (T7) của 1509 vẫn 1.300.000đ');
select t.bang(t.dem_gia25(t.can('1509'), '2026-10-01', '2026-10-09'), '900000|thuong',
              'YC4.6-NT2 đêm 09/10 (T6) của 1509 thành đêm ngày thường 900.000đ');
select t.bang(t.dem_gia25(t.can('1509'), '2026-10-01', '2026-10-12'), '900000|thuong',
              'YC4.6-NT2 đêm 12/10 (T2) của 1509 là đêm ngày thường 900.000đ');
select t.thoat();
select t.bang(t.dem_ct(t.id('hoa')), '6,7', 'YC4.6-NT2 hồ sơ Chị Hoa lưu đêm cuối tuần T7, CN');
select t.bang((select count(*) from public.gia_thang where can_id = t.can('1509') and thang = '2026-10-01'
                 and gia_thuong = 900000 and gia_cuoi_tuan = 1300000), 1::bigint,
              'YC4.6-NT2 đổi đêm cuối tuần không đổi hai giá của tháng');
select t.ok((select lich_doi_luc from public.can where id = t.can('1509')) >= now() - interval '1 minute'
            and (select lich_doi_luc from public.can where id = t.can('3402')) >= now() - interval '1 minute',
            'YC4.6 bước 4 YC4 Dữ liệu đổi đêm cuối tuần thì cập nhật lúc lịch đổi của mọi căn của Chị Hoa');
select t.ok((select lich_doi_luc from public.can where id = t.can('1103')) < now() - interval '1 day',
            'YC4.6 bước 4 căn của chủ nhà khác không bị đổi lúc lịch đổi');
select t.bang((select tien_phong::text from public.booking where id = t.b('B1')), current_setting('t.tien_truoc', true),
              'YC4.6-NT2 booking B1 có sẵn vẫn giữ tiền phòng 1.800.000đ sau khi đổi đêm cuối tuần');
select t.bang((select string_agg(dem::text || ':' || tien::text, ',' order by dem) from public.booking_dem where booking_id = t.b('B1')),
              current_setting('t.dem_truoc', true), 'YC4.6-NT2 tiền từng đêm của B1 không đổi');
-- Đổi của Chị Hoa không đổi cài đặt của Anh Tuấn.
select t.bang(t.dem_ct(t.id('tuan')), '5,6', 'YC4.6-NT4 đổi của Chị Hoa không đổi đêm cuối tuần của Anh Tuấn');

-- Bỏ trùng, sắp xếp; chỉ một đêm vẫn qua.
select t.dang_nhap(t.id('hoa'));
select t.khong_loi($$select public.fn_dat_dem_cuoi_tuan(array[7, 5, 7, 5]::smallint[])$$, 'YC4.6 chọn T6, CN (lặp và lộn xộn) thì lệnh qua');
select t.thoat();
select t.bang(t.dem_ct(t.id('hoa')), '5,7', 'YC4.6 đêm cuối tuần được bỏ trùng và sắp xếp');
select t.dang_nhap(t.id('hoa'));
select t.khong_loi($$select public.fn_dat_dem_cuoi_tuan(array[6]::smallint[])$$, 'YC4.6-NT4 chỉ còn một đêm cuối tuần thì lệnh lưu qua');
select t.thoat();
select t.bang(t.dem_ct(t.id('hoa')), '6', 'YC4.6-NT4 Chị Hoa lưu đúng một đêm T7');

-- ===== YC4.6-NT4: không còn đêm nào thì bị từ chối, cài đặt không đổi =====
select t.dang_nhap(t.id('hoa'));
select t.loi_cau($$select public.fn_dat_dem_cuoi_tuan(array[]::smallint[])$$, 'P0001', 'Chọn ít nhất một đêm cuối tuần',
                 'YC4.6-NT4 lệnh lưu không có đêm nào bị từ chối "Chọn ít nhất một đêm cuối tuần"');
select t.loi_cau($$select public.fn_dat_dem_cuoi_tuan(null)$$, 'P0001', 'Chọn ít nhất một đêm cuối tuần',
                 'YC4.6-NT4 lệnh lưu với danh sách trống (null) bị từ chối');
select t.loi_cau($$select public.fn_dat_dem_cuoi_tuan(array[0]::smallint[])$$, 'P0001', 'Đêm cuối tuần không hợp lệ',
                 'YC4.6 Luật kiểm đêm số 0 bị từ chối "Đêm cuối tuần không hợp lệ"');
select t.loi_cau($$select public.fn_dat_dem_cuoi_tuan(array[8]::smallint[])$$, 'P0001', 'Đêm cuối tuần không hợp lệ',
                 'YC4.6 Luật kiểm đêm số 8 bị từ chối');
select t.loi_cau($$select public.fn_dat_dem_cuoi_tuan(array[5, 9]::smallint[])$$, 'P0001', 'Đêm cuối tuần không hợp lệ',
                 'YC4.6 Luật kiểm có một đêm ngoài 1..7 thì cả lệnh bị từ chối');
select t.loi_cau($$select public.fn_dat_dem_cuoi_tuan(array[6, null]::smallint[])$$, 'P0001', 'Đêm cuối tuần không hợp lệ',
                 'YC4.6 Luật kiểm đêm trống trong danh sách bị từ chối');
select t.thoat();
select t.bang(t.dem_ct(t.id('hoa')), '6', 'YC4.6-NT4 sau các lệnh bị từ chối cài đặt của Chị Hoa vẫn là T7');

-- Biên: đủ bảy đêm thì qua (mọi đêm là cuối tuần).
select t.dang_nhap(t.id('hoa'));
select t.khong_loi($$select public.fn_dat_dem_cuoi_tuan(array[1, 2, 3, 4, 5, 6, 7]::smallint[])$$, 'YC4.6 Luật kiểm chọn cả bảy đêm thì qua');
select t.thoat();
select t.bang(t.dem_ct(t.id('hoa')), '1,2,3,4,5,6,7', 'YC4.6 cả bảy đêm lưu được');
update public.profiles set dem_cuoi_tuan = '{5,6}' where id = t.id('hoa');

-- ===== YC4.6-NT4 quyền: chỉ chính chủ nhà đổi được; không đổi hộ người khác, không ghi thẳng hồ sơ =====
-- Sale Hùng gửi lệnh (đổi của chính Hùng, không phải của Chị Hoa); không có cách nào chỉ tới Chị Hoa.
select t.dang_nhap(t.id('hung'));
select t.khong_loi($$select public.fn_dat_dem_cuoi_tuan(array[1]::smallint[])$$,
                   'YC4.6-NT4 Sale Hùng gọi lệnh thì chỉ ghi đêm cuối tuần của chính Hùng');
select t.loi($$update public.profiles set dem_cuoi_tuan = '{1}' where id = t.id('hoa')$$, '%',
             'YC4.6-NT4 Sale Hùng không sửa thẳng đêm cuối tuần của Chị Hoa');
select t.thoat();
select t.bang(t.dem_ct(t.id('hoa')), '5,6', 'YC4.6-NT4 đêm cuối tuần của Chị Hoa không đổi sau lệnh của Sale Hùng');
select t.bang(t.dem_ct(t.id('hung')), '1', 'YC4.6-NT4 lệnh của Sale Hùng chỉ đổi hồ sơ của Hùng');

select t.dang_nhap(t.id('tuan'));
select t.loi($$update public.profiles set dem_cuoi_tuan = '{1}' where id = t.id('hoa')$$, '%',
             'YC4.6-NT4 Anh Tuấn (chủ nhà khác) không sửa thẳng đêm cuối tuần của Chị Hoa');
select t.thoat();
select t.bang(t.dem_ct(t.id('hoa')), '5,6', 'YC4.6-NT4 đêm cuối tuần của Chị Hoa không đổi sau lệnh của Anh Tuấn');

select t.dang_nhap(t.id('hoa'));
select t.loi($$update public.profiles set dem_cuoi_tuan = '{1}' where id = t.id('hoa')$$, '42501',
             'YC4 Ai được làm gì chính Chị Hoa cũng không sửa thẳng hồ sơ (ghi qua fn_dat_dem_cuoi_tuan)');
select t.thoat();
select t.bang(t.dem_ct(t.id('hoa')), '5,6', 'YC4.6-NT4 đêm cuối tuần của Chị Hoa không đổi sau lệnh ghi thẳng');

select t.khach();
select t.loi($$select public.fn_dat_dem_cuoi_tuan(array[5, 6]::smallint[])$$, '%',
             'YC4 Ai được làm gì người chưa đăng nhập gửi lệnh đổi đêm cuối tuần thì bị từ chối');
select t.thoat();
select set_config('request.jwt.claims', '{"role":"authenticated"}', true);
select set_config('role', 'authenticated', true);
select t.loi($$select public.fn_dat_dem_cuoi_tuan(array[5, 6]::smallint[])$$, '%',
             'YC4 Ai được làm gì phiên không có người gọi thì lệnh đổi đêm cuối tuần bị từ chối');
select t.thoat();
select t.bang(t.dem_ct(t.id('hoa')), '5,6', 'YC4.6-NT4 đêm cuối tuần của Chị Hoa vẫn T6, T7 sau mọi lệnh bị từ chối');

-- Đọc: chủ nhà khác không đọc hồ sơ (cài đặt) của Chị Hoa (PQ6.CHU: xem, sửa của mình).
select t.dang_nhap(t.id('tuan'));
select t.bang(t.so($$select * from public.profiles where id = t.id('hoa')$$), 0::bigint,
              'PQ6.CHU Anh Tuấn không đọc được đêm cuối tuần của Chị Hoa');
select t.thoat();
