-- US21 · Giá theo tháng của một căn (YC4.2). Lệnh đặt giá tháng fn_dat_gia_thang, lệnh lịch giá một tháng fn_lich_gia_thang.
-- YC4.2-NT1, NT4, NT6, NT7, NT8, YC4.2 "Luật kiểm", YC4 "Ai được làm gì", YC4 "Dữ liệu", QT5.3, QT5.5, PQ5.
-- Viết trước migration (US21-TA1, CL14.5): task sau không sửa file này.
select t.fixture();

-- "Hôm nay" cố định là T4 07/10/2026 như dữ liệu mẫu (du-lieu-mau.md), để luật "năm nay hoặc năm sau" không đổi theo ngày chạy.
-- Cả file chạy trong một giao dịch rồi rollback, nên hàm gốc trở lại sau file này.
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
grant execute on function t.loi_cau(text, text, text, text) to anon, authenticated;

-- Giá tháng của một căn dạng "thường/cuối tuần", đọc bằng vai chủ database. Chưa có thì null.
create or replace function t.gia_thang(p_can uuid, p_thang date) returns text
language sql stable as $$
  select gia_thuong::text || '/' || gia_cuoi_tuan::text from public.gia_thang where can_id = p_can and thang = p_thang
$$;

-- Một đêm của lịch giá, dạng "giá|loại|có khách", gọi bằng vai hiện tại. Lỗi thì null (in lỗi ra NOTICE).
create or replace function t.dem_gia(p_can uuid, p_thang date, p_dem date) returns text
language plpgsql as $$
declare v text; ma text; cau_loi text;
begin
  select coalesce(l.gia::text, '-') || '|' || coalesce(l.loai, '-') || '|' || coalesce(l.co_khach::text, '-')
    into v
  from public.fn_lich_gia_thang(p_can, p_thang) l where l.dem = p_dem;
  return v;
exception when others then
  get stacked diagnostics ma = returned_sqlstate, cau_loi = message_text;
  raise notice 'lỗi: % % (fn_lich_gia_thang %, %)', ma, cau_loi, p_can, p_thang;
  return null;
end $$;

-- Tổng tiền các đêm tháng 10/2026 của một căn (doanh thu theo đêm, QT4.2), booking chưa hủy. Vai chủ database.
create or replace function t.doanh_thu_t10(p_can uuid) returns bigint
language sql stable as $$
  select coalesce(sum(d.tien), 0)::bigint from public.booking_dem d join public.booking b on b.id = d.booking_id
  where b.can_id = p_can and b.trang_thai <> 'da_huy' and d.dem between '2026-10-01' and '2026-10-31'
$$;

grant execute on all functions in schema t to anon, authenticated;

-- ===== Danh mục: hai lệnh chạy security definer, chỉ người đã đăng nhập gọi; app không ghi thẳng bảng giá =====
select t.ok(exists (select 1 from pg_proc where proname = 'fn_dat_gia_thang' and pronamespace = 'public'::regnamespace and prosecdef),
            'YC4.2 bước 4 danh mục: có lệnh fn_dat_gia_thang chạy security definer');
select t.ok(exists (select 1 from pg_proc where proname = 'fn_lich_gia_thang' and pronamespace = 'public'::regnamespace and prosecdef),
            'YC4.2 bước 6 danh mục: có lệnh fn_lich_gia_thang chạy security definer');
select t.ok(exists (select 1 from pg_proc p where p.proname in ('fn_dat_gia_thang', 'fn_lich_gia_thang') and p.pronamespace = 'public'::regnamespace)
            and not exists (select 1 from pg_proc p where p.proname in ('fn_dat_gia_thang', 'fn_lich_gia_thang')
                            and p.pronamespace = 'public'::regnamespace and has_function_privilege('anon', p.oid, 'execute')),
            'YC4 Ai được làm gì danh mục: người chưa đăng nhập không có quyền gọi fn_dat_gia_thang, fn_lich_gia_thang');
select t.ok((select count(*) from pg_proc p where p.proname in ('fn_dat_gia_thang', 'fn_lich_gia_thang')
             and p.pronamespace = 'public'::regnamespace and has_function_privilege('authenticated', p.oid, 'execute')) = 2,
            'YC4.2 danh mục: người đã đăng nhập gọi được fn_dat_gia_thang, fn_lich_gia_thang');
select t.ok(not has_table_privilege('authenticated', 'public.gia_thang', 'insert')
            and not has_table_privilege('authenticated', 'public.gia_thang', 'update')
            and not has_table_privilege('authenticated', 'public.gia_thang', 'delete')
            and not has_table_privilege('anon', 'public.gia_thang', 'insert'),
            'YC4 Ai được làm gì danh mục: app không ghi thẳng bảng gia_thang (ghi qua fn_dat_gia_thang)');
select t.ok(not exists (select 1 from pg_proc p where p.proname = 'fn_dat_gia_thang' and p.pronamespace = 'public'::regnamespace
                        and exists (select 1 from unnest(coalesce(p.proargnames, '{}')) a where a ilike '%nguoi%')),
            'YC4 Ai được làm gì lệnh đặt giá không nhận người đặt từ app');

-- ===== YC4.2-NT1: Chị Hoa chọn Tháng 11, 12 của 3402, nhập 800.000đ và 1.100.000đ, áp dụng =====
-- Đổi giá có sẵn của bộ mẫu trước, để thấy lệnh ghi đè thật.
update public.gia_thang set gia_thuong = 500000, gia_cuoi_tuan = 600000
where can_id = t.can('3402') and thang in ('2026-11-01', '2026-12-01');
update public.can set lich_doi_luc = now() - interval '2 days' where id = t.can('3402');

select t.dang_nhap(t.id('hoa'));
select t.khong_loi($$select public.fn_dat_gia_thang(t.can('3402'), array['2026-11-01', '2026-12-01']::date[], 800000, 1100000)$$,
                   'YC4.2-NT1 Chị Hoa áp dụng 800.000đ / 1.100.000đ cho Tháng 11 – 12 của 3402 thì lệnh qua');
select t.bang(t.dem_gia(t.can('3402'), '2026-11-01', '2026-11-06'), '1100000|cuoi_tuan|false',
              'YC4.2-NT1 đêm 06/11 (T6) của 3402 có giá 1.100.000đ, là đêm cuối tuần');
select t.bang(t.dem_gia(t.can('3402'), '2026-11-01', '2026-11-09'), '800000|thuong|false',
              'YC4.2-NT1 đêm 09/11 (T2) của 3402 có giá 800.000đ, là đêm ngày thường');
select t.bang(t.dem_gia(t.can('3402'), '2026-12-01', '2026-12-05'), '1100000|cuoi_tuan|false',
              'YC4.2-NT1 đêm 05/12 (T7) của 3402 có giá 1.100.000đ');
select t.bang(t.so($$select * from public.gia_thang where can_id = t.can('3402') and thang in ('2026-11-01', '2026-12-01')
                     and gia_thuong = 800000 and gia_cuoi_tuan = 1100000$$), 2::bigint,
              'YC4.2-NT1 Chị Hoa đọc lại thấy hai tháng 11, 12 của 3402 là 800.000đ / 1.100.000đ (khoảng "800k–1,1tr")');
select t.thoat();
select t.bang(t.gia_thang(t.can('3402'), '2026-11-01'), '800000/1100000', 'YC4.2-NT1 giá tháng 11 của 3402 đã ghi đè');
select t.bang(t.gia_thang(t.can('3402'), '2026-12-01'), '800000/1100000', 'YC4.2-NT1 giá tháng 12 của 3402 đã ghi đè');
select t.bang(t.gia_thang(t.can('3402'), '2026-10-01'), '800000/1100000', 'YC4.2-NT1 tháng 10 không chọn thì giữ nguyên');
select t.bang(t.gia_thang(t.can('1509'), '2026-11-01'), '900000/1300000', 'YC4.2-NT1 lệnh đặt giá 3402 không đổi giá căn khác');
select t.ok((select lich_doi_luc from public.can where id = t.can('3402')) >= now() - interval '1 minute',
            'YC4.2 bước 4 YC4 Dữ liệu đặt giá xong thì cập nhật lúc lịch đổi của 3402');

-- Tháng chưa có giá thì thêm mới (năm sau).
select t.dang_nhap(t.id('hoa'));
select t.khong_loi($$select public.fn_dat_gia_thang(t.can('3402'), array['2027-01-01', '2027-02-01']::date[], 900000, 1200000)$$,
                   'YC4.2 bước 4 Chị Hoa đặt giá Tháng 1 – 2 năm 2027 (năm sau) thì lệnh qua');
select t.thoat();
select t.bang(t.gia_thang(t.can('3402'), '2027-01-01') || ' ' || t.gia_thang(t.can('3402'), '2027-02-01'), '900000/1200000 900000/1200000',
              'YC4.2 bước 5 tháng 1, 2 năm 2027 chưa có giá thì được thêm mới');

-- Áp dụng nhiều tháng là một giao dịch: có một tháng sai thì không tháng nào đổi.
select t.dang_nhap(t.id('hoa'));
select t.loi($$select public.fn_dat_gia_thang(t.can('3402'), array['2026-11-01', '2028-01-01']::date[], 700000, 700000)$$, 'P0001',
             'YC4 Dữ liệu áp dụng tháng 11/2026 cùng tháng 1/2028 (ngoài năm sau) thì bị từ chối');
select t.thoat();
select t.bang(t.gia_thang(t.can('3402'), '2026-11-01'), '800000/1100000',
              'YC4 Dữ liệu áp dụng nhiều tháng là một giao dịch: có tháng sai thì tháng 11 không đổi');
select t.bang(t.gia_thang(t.can('3402'), '2028-01-01'), null::text, 'YC4 Dữ liệu tháng 1/2028 không được ghi');

-- ===== YC4.2-NT4: lịch giá tháng 10 của 3402 =====
select t.dang_nhap(t.id('hoa'));
select t.bang(t.so($$select * from public.fn_lich_gia_thang(t.can('3402'), '2026-10-01')$$), 31::bigint,
              'YC4.2-NT4 lịch giá tháng 10 của 3402 có đủ 31 đêm');
select t.bang(t.dem_gia(t.can('3402'), '2026-10-01', '2026-10-09'), '1100000|cuoi_tuan|false',
              'YC4.2-NT4 đêm 09/10 (T6) ghi 1.100.000đ ("1,1tr"), đêm cuối tuần');
select t.bang(t.dem_gia(t.can('3402'), '2026-10-01', '2026-10-08'), '800000|thuong|false',
              'YC4.2-NT4 đêm 08/10 (T5) ghi 800.000đ ("800k"), đêm ngày thường');
select t.bang(t.dem_gia(t.can('3402'), '2026-10-01', '2026-10-24'), '1300000|dip|false',
              'YC4.2-NT4 QT5.3 đêm 24/10 ghi 1.300.000đ ("1,3tr"), giá dịp thay giá tháng');
select t.bang(t.dem_gia(t.can('3402'), '2026-10-01', '2026-10-25'), '1300000|dip|false',
              'YC4.2-NT4 QT5.3 đêm 25/10 (CN, trong dải dịp) ghi 1.300.000đ');
select t.bang(t.dem_gia(t.can('3402'), '2026-10-01', '2026-10-26'), '800000|thuong|false',
              'YC4.2-NT4 QT5.3 đêm 26/10 (sau dải dịp) về giá tháng 800.000đ');
select t.bang(t.gt($$select min(dem)::text || ' ' || max(dem)::text from public.fn_lich_gia_thang(t.can('3402'), '2026-10-01')$$),
              '2026-10-01 2026-10-31', 'YC4.2-NT4 lịch giá tháng 10 từ đêm 01/10 tới đêm 31/10');
-- Gọi bằng ngày giữa tháng vẫn trả cả tháng đó.
select t.bang(t.so($$select * from public.fn_lich_gia_thang(t.can('3402'), '2026-10-15')$$), 31::bigint,
              'YC4.2 bước 6 gọi lịch giá bằng ngày 15/10 vẫn trả cả tháng 10');
-- Tháng chưa có giá thì giá trống (không bao giờ là 0, QT5.3 bước 4).
select t.bang(t.dem_gia(t.can('3402'), '2027-03-01', '2027-03-05'), '-|cuoi_tuan|false',
              'YC4.2 QT5.3 đêm chưa có giá thì giá trống, không phải 0');
select t.bang(t.so($$select * from public.fn_lich_gia_thang(t.can('3402'), '2027-03-01') where gia = 0$$), 0::bigint,
              'YC4.2 QT5.3 lịch giá không có đêm nào giá 0');
select t.thoat();

-- Có khách: booking chưa hủy chiếm đêm; ngày trả không chiếm; booking đã hủy không tính.
select t.tao_booking('K1', t.can('3402'), '2026-10-14', '2026-10-16', 1600000);
select t.tao_booking('K2', t.can('3402'), '2026-10-20', '2026-10-21', 800000);
update public.booking set trang_thai = 'da_huy' where id = t.b('K2');
select t.dang_nhap(t.id('hoa'));
select t.bang(t.dem_gia(t.can('3402'), '2026-10-01', '2026-10-14'), '800000|thuong|true', 'YC4.2 bước 6 đêm 14/10 có khách');
select t.bang(t.dem_gia(t.can('3402'), '2026-10-01', '2026-10-15'), '800000|thuong|true', 'YC4.2 bước 6 đêm 15/10 có khách');
select t.bang(t.dem_gia(t.can('3402'), '2026-10-01', '2026-10-16'), '1100000|cuoi_tuan|false',
              'YC4.2 bước 6 ngày trả 16/10 không có khách (đêm từ ngày nhận tới trước ngày trả)');
select t.bang(t.dem_gia(t.can('3402'), '2026-10-01', '2026-10-20'), '800000|thuong|false',
              'YC4.2 bước 6 booking đã hủy không làm đêm 20/10 có khách');
select t.thoat();

-- Dải ngày lễ của căn thì loại đêm là ngày lễ.
insert into public.gia_dip (can_id, tu_ngay, den_ngay, ten, gia, la_ngay_le)
values (t.can('3402'), '2027-04-30', '2027-05-01', 'Lễ 30/4 – 1/5', 2500000, true);
select t.dang_nhap(t.id('hoa'));
select t.bang(t.dem_gia(t.can('3402'), '2027-04-01', '2027-04-30'), '2500000|ngay_le|false',
              'YC4.2 bước 6 QT5.3 đêm 30/04/2027 trong dải ngày lễ có giá 2.500.000đ, loại ngày lễ (tháng 4 chưa có giá tháng)');
select t.bang(t.dem_gia(t.can('3402'), '2027-05-01', '2027-05-01'), '2500000|ngay_le|false',
              'YC4.2 bước 6 QT5.3 đêm 01/05/2027 trong dải ngày lễ có giá 2.500.000đ');
select t.thoat();

-- Đêm cuối tuần theo cài đặt của chủ nhà (YC4.6): chỉ đêm T7 là cuối tuần thì đêm T6 09/10 về giá ngày thường.
update public.profiles set dem_cuoi_tuan = '{6}' where id = t.id('hoa');
select t.dang_nhap(t.id('hoa'));
select t.bang(t.dem_gia(t.can('3402'), '2026-10-01', '2026-10-09'), '800000|thuong|false',
              'YC4.2 Quy tắc giá hai loại đêm: chỉ đêm T7 là cuối tuần thì đêm 09/10 (T6) là 800.000đ');
select t.bang(t.dem_gia(t.can('3402'), '2026-10-01', '2026-10-10'), '1100000|cuoi_tuan|false',
              'YC4.2 Quy tắc giá hai loại đêm: đêm 10/10 (T7) vẫn là 1.100.000đ');
select t.thoat();
update public.profiles set dem_cuoi_tuan = '{5,6}' where id = t.id('hoa');

-- ===== YC4.2-NT4 quyền: chỉ người giữ căn gọi lệnh lịch giá =====
select t.dang_nhap(t.id('tuan'));
select t.loi_cau($$select * from public.fn_lich_gia_thang(t.can('3402'), '2026-10-01')$$, 'P0001', 'Không tìm thấy căn',
                 'YC4 Dữ liệu QT5.5 Anh Tuấn gọi lịch giá 3402 thì nhận "Không tìm thấy căn"');
select t.thoat();
select t.dang_nhap(t.id('hung'));
select t.loi_cau($$select * from public.fn_lich_gia_thang(t.can('3402'), '2026-10-01')$$, 'P0001', 'Không tìm thấy căn',
                 'YC4 Dữ liệu Sale Hùng (được chia sẻ 3402) gọi lịch giá của chủ nhà thì nhận "Không tìm thấy căn"');
select t.thoat();
select t.khach();
select t.loi($$select * from public.fn_lich_gia_thang(t.can('3402'), '2026-10-01')$$, '%',
             'YC4 Ai được làm gì người chưa đăng nhập gọi lịch giá thì bị từ chối');
select t.thoat();
select t.dang_nhap(t.id('hoa'));
select t.loi_cau($$select * from public.fn_lich_gia_thang('00000000-0000-0000-0001-0000000000ff', '2026-10-01')$$, 'P0001', 'Không tìm thấy căn',
                 'YC4 Dữ liệu QT5.5 lịch giá của căn không có thì "Không tìm thấy căn"');
select t.thoat();

-- ===== YC4.2-NT6: Anh Tuấn hay Sale Hùng gửi lệnh đặt giá tháng cho 3402 thì bị từ chối, giá không đổi =====
select t.dang_nhap(t.id('tuan'));
select t.loi_cau($$select public.fn_dat_gia_thang(t.can('3402'), array['2026-11-01']::date[], 100000, 100000)$$, 'P0001', 'Không tìm thấy căn',
                 'YC4.2-NT6 Anh Tuấn (chủ nhà khác) đặt giá tháng cho 3402 thì database từ chối "Không tìm thấy căn"');
select t.loi($$insert into public.gia_thang (can_id, thang, gia_thuong, gia_cuoi_tuan) values (t.can('3402'), '2027-06-01', 100000, 100000)$$, '42501',
             'YC4.2-NT6 Anh Tuấn không ghi thẳng giá tháng của 3402 được');
select t.thoat();
select t.dang_nhap(t.id('hung'));
select t.loi_cau($$select public.fn_dat_gia_thang(t.can('3402'), array['2026-11-01']::date[], 100000, 100000)$$, 'P0001', 'Không tìm thấy căn',
                 'YC4.2-NT6 Sale Hùng (được chia sẻ 3402) đặt giá tháng cho 3402 thì database từ chối "Không tìm thấy căn"');
select t.loi($$update public.gia_thang set gia_thuong = 100000 where can_id = t.can('3402')$$, '42501',
             'YC4.2-NT6 Sale Hùng không sửa thẳng giá tháng của 3402 được');
select t.thoat();
select t.khach();
select t.loi($$select public.fn_dat_gia_thang(t.can('3402'), array['2026-11-01']::date[], 100000, 100000)$$, '%',
             'YC4 Ai được làm gì người chưa đăng nhập gửi lệnh đặt giá thì bị từ chối');
select t.thoat();
-- Phiên đăng nhập mà không có người gọi cũng bị từ chối.
select set_config('request.jwt.claims', '{"role":"authenticated"}', true);
select set_config('role', 'authenticated', true);
select t.loi($$select public.fn_dat_gia_thang(t.can('3402'), array['2026-11-01']::date[], 100000, 100000)$$, '%',
             'YC4 Ai được làm gì phiên không có người gọi thì lệnh đặt giá bị từ chối');
select t.thoat();
select t.dang_nhap(t.id('hoa'));
select t.loi($$update public.gia_thang set gia_thuong = 100000 where can_id = t.can('3402')$$, '42501',
             'YC4 Ai được làm gì chính Chị Hoa cũng không sửa thẳng bảng giá (ghi qua fn_dat_gia_thang)');
select t.loi($$delete from public.gia_thang where can_id = t.can('3402')$$, '42501',
             'YC4 Ai được làm gì Chị Hoa không xóa thẳng giá tháng');
select t.thoat();
select t.bang(t.gia_thang(t.can('3402'), '2026-11-01'), '800000/1100000', 'YC4.2-NT6 giá tháng 11 của 3402 không đổi sau các lệnh bị từ chối');
select t.bang(t.gia_thang(t.can('3402'), '2027-06-01'), null::text, 'YC4.2-NT6 không có giá tháng 6/2027 ghi thẳng');
select t.bang((select count(*) from public.gia_thang where gia_thuong = 100000), 0::bigint,
              'YC4.2-NT6 không lệnh bị từ chối nào để lại giá 100.000đ');

-- Căn đã xóa (ẩn) thì lưu bị từ chối (YC4 Trạng thái màn, HV5).
update public.can set an_luc = now() where id = t.can('1509');
select t.dang_nhap(t.id('hoa'));
select t.loi_cau($$select public.fn_dat_gia_thang(t.can('1509'), array['2026-11-01']::date[], 100000, 100000)$$, 'P0001', 'Không tìm thấy căn',
                 'YC4 Trạng thái màn Chị Hoa đặt giá cho căn đã xóa 1509 thì "Không tìm thấy căn"');
select t.thoat();
update public.can set an_luc = null where id = t.can('1509');
select t.bang(t.gia_thang(t.can('1509'), '2026-11-01'), '900000/1300000', 'YC4 Trạng thái màn giá 1509 không đổi khi căn đã xóa');

-- ===== YC4.2-NT7: 1509 có B1 (2.200.000đ), Chị Hoa đổi giá tháng 10 của 1509 =====
select t.tao_booking('B1', t.can('1509'), '2026-10-10', '2026-10-12', 2200000, t.id('hung'), 'tu_yeu_cau');
select set_config('t.dt_truoc', t.doanh_thu_t10(t.can('1509'))::text, true);
select set_config('t.dem_truoc', (select string_agg(dem::text || ':' || tien::text, ',' order by dem) from public.booking_dem where booking_id = t.b('B1')), true);
select t.dang_nhap(t.id('hoa'));
select t.khong_loi($$select public.fn_dat_gia_thang(t.can('1509'), array['2026-10-01']::date[], 2000000, 3000000)$$,
                   'YC4.2-NT7 Chị Hoa đổi giá tháng 10 của 1509 thành 2.000.000đ / 3.000.000đ');
select t.thoat();
select t.bang(t.gia_thang(t.can('1509'), '2026-10-01'), '2000000/3000000', 'YC4.2-NT7 giá tháng 10 của 1509 đã đổi');
select t.bang((select tien_phong from public.booking where id = t.b('B1')), 2200000::bigint,
              'YC4.2-NT7 B1 vẫn 2.200.000đ sau khi đổi giá tháng 10');
select t.bang((select string_agg(dem::text || ':' || tien::text, ',' order by dem) from public.booking_dem where booking_id = t.b('B1')),
              current_setting('t.dem_truoc', true), 'YC4.2-NT7 tiền từng đêm của B1 không đổi');
select t.bang(t.doanh_thu_t10(t.can('1509'))::text, current_setting('t.dt_truoc', true),
              'YC4.2-NT7 doanh thu tháng 10 của 1509 không đổi vì B1');
select t.bang(t.doanh_thu_t10(t.can('1509')), 2200000::bigint, 'YC4.2-NT7 doanh thu tháng 10 của 1509 vẫn là 2.200.000đ của B1');

-- ===== YC4.2-NT8 và Luật kiểm: giá trống, bằng 0, quá 100.000.000đ; tháng =====
select t.dang_nhap(t.id('hoa'));
select t.loi_cau($$select public.fn_dat_gia_thang(t.can('3402'), array['2026-11-01']::date[], 800000, null)$$, 'P0001',
                 'Cần nhập giá ngày thường và giá cuối tuần', 'YC4.2-NT8 giá cuối tuần trống thì "Cần nhập giá ngày thường và giá cuối tuần"');
select t.loi_cau($$select public.fn_dat_gia_thang(t.can('3402'), array['2026-11-01']::date[], null, 1100000)$$, 'P0001',
                 'Cần nhập giá ngày thường và giá cuối tuần', 'YC4.2-NT8 giá ngày thường trống thì "Cần nhập giá ngày thường và giá cuối tuần"');
select t.loi_cau($$select public.fn_dat_gia_thang(t.can('3402'), array['2026-11-01']::date[], 800000, 0)$$, 'P0001',
                 'Giá phải lớn hơn 0', 'YC4.2-NT8 giá cuối tuần bằng 0 thì "Giá phải lớn hơn 0"');
select t.loi_cau($$select public.fn_dat_gia_thang(t.can('3402'), array['2026-11-01']::date[], 0, 1100000)$$, 'P0001',
                 'Giá phải lớn hơn 0', 'YC4.2-NT8 giá ngày thường bằng 0 thì "Giá phải lớn hơn 0"');
select t.loi_cau($$select public.fn_dat_gia_thang(t.can('3402'), array['2026-11-01']::date[], -800000, 1100000)$$, 'P0001',
                 'Giá phải lớn hơn 0', 'YC4.2-NT8 giá âm thì "Giá phải lớn hơn 0"');
select t.loi_cau($$select public.fn_dat_gia_thang(t.can('3402'), array['2026-11-01']::date[], 800000, 100000001)$$, 'P0001',
                 'Giá mỗi đêm tối đa 100.000.000đ', 'YC4.2 Luật kiểm giá cuối tuần 100.000.001đ thì "Giá mỗi đêm tối đa 100.000.000đ"');
select t.loi_cau($$select public.fn_dat_gia_thang(t.can('3402'), array['2026-11-01']::date[], 100000001, 1100000)$$, 'P0001',
                 'Giá mỗi đêm tối đa 100.000.000đ', 'YC4.2 Luật kiểm giá ngày thường 100.000.001đ thì "Giá mỗi đêm tối đa 100.000.000đ"');
select t.loi_cau($$select public.fn_dat_gia_thang(t.can('3402'), array[]::date[], 800000, 1100000)$$, 'P0001',
                 'Chưa chọn tháng nào', 'YC4.2 Luật kiểm không có tháng nào thì "Chưa chọn tháng nào"');
select t.loi_cau($$select public.fn_dat_gia_thang(t.can('3402'), null, 800000, 1100000)$$, 'P0001',
                 'Chưa chọn tháng nào', 'YC4.2 Luật kiểm danh sách tháng trống thì "Chưa chọn tháng nào"');
select t.loi_cau($$select public.fn_dat_gia_thang(t.can('3402'), array['2028-01-01']::date[], 800000, 1100000)$$, 'P0001',
                 'Chỉ đặt giá được cho năm nay hoặc năm sau', 'YC4.2 Luật kiểm tháng 1/2028 (quá năm sau) thì bị từ chối');
select t.loi_cau($$select public.fn_dat_gia_thang(t.can('3402'), array['2025-12-01']::date[], 800000, 1100000)$$, 'P0001',
                 'Chỉ đặt giá được cho năm nay hoặc năm sau', 'YC4.2 Luật kiểm tháng 12/2025 (năm trước) thì bị từ chối');
select t.loi_cau($$select public.fn_dat_gia_thang(t.can('3402'), array['2026-11-15']::date[], 800000, 1100000)$$, 'P0001',
                 'Tháng không hợp lệ', 'YC4.2 Luật kiểm tháng phải là ngày 1 của tháng');
select t.loi_cau($$select public.fn_dat_gia_thang(t.can('3402'), array['2026-11-01', null]::date[], 800000, 1100000)$$, 'P0001',
                 'Tháng không hợp lệ', 'YC4.2 Luật kiểm tháng trống trong danh sách thì bị từ chối');
-- Biên: đúng 100.000.000đ, tháng 1 năm nay và tháng 12 năm sau thì qua; chọn trùng một tháng hai lần vẫn qua.
select t.khong_loi($$select public.fn_dat_gia_thang(t.can('3402'), array['2026-01-01', '2027-12-01', '2027-12-01']::date[], 100000000, 100000000)$$,
                   'YC4.2 Luật kiểm giá đúng 100.000.000đ cho tháng 1/2026 và 12/2027 thì qua');
select t.thoat();
select t.bang(t.gia_thang(t.can('3402'), '2026-11-01'), '800000/1100000', 'YC4.2-NT8 giá 3402 không đổi sau các lệnh sai luật');
select t.bang(t.gia_thang(t.can('3402'), '2027-12-01'), '100000000/100000000', 'YC4.2 Luật kiểm tháng 12/2027 lưu 100.000.000đ');
select t.bang((select count(*) from public.gia_thang where thang < '2026-01-01' or thang >= '2028-01-01'), 0::bigint,
              'YC4.2 Luật kiểm không có giá tháng nào ngoài năm nay và năm sau');
