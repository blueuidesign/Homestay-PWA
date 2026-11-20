-- US23 · Đặt giá nhiều căn (YC4.4). Lệnh fn_dat_gia_thang_nhieu: ghi giá tháng cho mọi căn đã chọn trong một giao dịch.
-- YC4.4-NT4, NT5, NT6, NT7, YC4 "Ai được làm gì", YC4 "Dữ liệu", QT5.5, PQ5.
-- Viết trước migration (US23-TA1, CL14.5): task sau không sửa file này.
select t.fixture();

create or replace function public.local_today() returns date
language sql stable security definer set search_path = ''
as $$ select date '2026-10-07' $$;

create or replace function pg_temp.loi(p_cau text) returns text language plpgsql as $$
declare ma text; cau text;
begin
  execute p_cau;
  return 'qua';
exception when others then
  get stacked diagnostics ma = returned_sqlstate, cau = message_text;
  return ma || '|' || cau;
end $$;

create or replace function pg_temp.gia(p_can uuid, p_thang date) returns text language sql stable as $$
  select gia_thuong::text || '/' || gia_cuoi_tuan::text from public.gia_thang where can_id = p_can and thang = p_thang
$$;

-- ===== Danh mục =====
select t.ok(exists (select 1 from pg_proc where proname = 'fn_dat_gia_thang_nhieu' and pronamespace = 'public'::regnamespace and prosecdef),
            'YC4.4 bước 4 danh mục: có lệnh fn_dat_gia_thang_nhieu chạy security definer');
select t.ok(exists (select 1 from pg_proc p where p.proname = 'fn_dat_gia_thang_nhieu' and p.pronamespace = 'public'::regnamespace)
            and not exists (select 1 from pg_proc p where p.proname = 'fn_dat_gia_thang_nhieu' and p.pronamespace = 'public'::regnamespace
                            and has_function_privilege('anon', p.oid, 'execute')),
            'YC4.4-NT7 danh mục: người chưa đăng nhập không gọi được fn_dat_gia_thang_nhieu');

-- ===== YC4.4-NT4: áp dụng 800.000đ / 1.100.000đ cho tháng 12 của 1509 và 3402 =====
update public.can set lich_doi_luc = now() - interval '2 days' where id in (t.can('1509'), t.can('3402'));
select t.dang_nhap(t.id('hoa'));
select t.khong_loi($$select public.fn_dat_gia_thang_nhieu(array[t.can('1509'), t.can('3402')], array['2026-12-01']::date[], 800000, 1100000)$$,
                   'YC4.4-NT4 Chị Hoa áp dụng 800.000đ / 1.100.000đ cho tháng 12 của 1509 và 3402 thì lệnh qua');
select t.thoat();
select t.bang(pg_temp.gia(t.can('1509'), '2026-12-01') || ' ' || pg_temp.gia(t.can('3402'), '2026-12-01'), '800000/1100000 800000/1100000',
              'YC4.4-NT4 cả 1509 và 3402 có giá 800.000đ / 1.100.000đ ở tháng 12');
select t.bang(pg_temp.gia(t.can('1509'), '2026-11-01'), '900000/1300000', 'YC4.4-NT4 tháng 11 của 1509 không chọn thì giữ nguyên');
select t.bang(pg_temp.gia(t.can('1103'), '2026-12-01'), '700000/700000', 'YC4.4-NT4 căn của người khác không đổi');
select t.ok((select bool_and(lich_doi_luc >= now() - interval '1 minute') from public.can where id in (t.can('1509'), t.can('3402'))),
            'YC4.4 bước 4 YC4 Dữ liệu đặt giá nhiều căn thì cập nhật lúc lịch đổi của từng căn');

-- Luật kiểm như YC4.2: giá sai thì không căn nào đổi.
select t.dang_nhap(t.id('hoa'));
select t.bang(pg_temp.loi($$select public.fn_dat_gia_thang_nhieu(array[t.can('1509'), t.can('3402')], array['2026-12-01']::date[], 0, 1100000)$$),
              'P0001|Giá phải lớn hơn 0', 'YC4.4 bước 3 YC4.2 Luật kiểm giá 0 bị từ chối');
select t.bang(pg_temp.loi($$select public.fn_dat_gia_thang_nhieu(array[]::uuid[], array['2026-12-01']::date[], 800000, 1100000)$$),
              'P0001|Chưa chọn căn nào', 'YC4.4 bước 1 lệnh không có căn nào bị từ chối');
select t.thoat();

-- ===== YC4.4-NT5: danh sách có một căn Chị Hoa đã xóa thì từ chối, không căn nào đổi =====
update public.can set an_luc = now() where id = t.can('3402');
select t.dang_nhap(t.id('hoa'));
select t.bang(pg_temp.loi($$select public.fn_dat_gia_thang_nhieu(array[t.can('1509'), t.can('3402')], array['2026-12-01']::date[], 500000, 600000)$$),
              'P0001|Không tìm thấy căn', 'YC4.4-NT5 danh sách có 3402 Chị Hoa đã xóa thì database từ chối');
select t.thoat();
update public.can set an_luc = null where id = t.can('3402');
select t.bang(pg_temp.gia(t.can('1509'), '2026-12-01') || ' ' || pg_temp.gia(t.can('3402'), '2026-12-01'), '800000/1100000 800000/1100000',
              'YC4.4-NT5 không căn nào đổi giá (1509 vẫn 800.000đ / 1.100.000đ)');

-- ===== YC4.4-NT6: danh sách gồm 1509 và Sapphire 1103 của Anh Tuấn thì từ chối, cả hai không đổi =====
select t.dang_nhap(t.id('hoa'));
select t.bang(pg_temp.loi($$select public.fn_dat_gia_thang_nhieu(array[t.can('1509'), t.can('1103')], array['2026-12-01']::date[], 500000, 600000)$$),
              'P0001|Không tìm thấy căn', 'YC4.4-NT6 Chị Hoa gửi lệnh gồm 1509 và 1103 của Anh Tuấn thì database từ chối');
select t.thoat();
select t.bang(pg_temp.gia(t.can('1509'), '2026-12-01') || ' ' || pg_temp.gia(t.can('1103'), '2026-12-01'), '800000/1100000 700000/700000',
              'YC4.4-NT6 cả 1509 và 1103 không đổi giá');

-- ===== YC4.4-NT7: Sale Hùng gửi lệnh gồm 1509 thì từ chối =====
select t.dang_nhap(t.id('hung'));
select t.bang(pg_temp.loi($$select public.fn_dat_gia_thang_nhieu(array[t.can('1509')], array['2026-12-01']::date[], 500000, 600000)$$),
              'P0001|Không tìm thấy căn', 'YC4.4-NT7 Sale Hùng (được chia sẻ 1509) gửi lệnh đặt giá nhiều căn gồm 1509 thì database từ chối');
select t.thoat();
select t.khach();
select t.loi($$select public.fn_dat_gia_thang_nhieu(array[t.can('1509')], array['2026-12-01']::date[], 500000, 600000)$$, '42501',
             'YC4.4-NT7 PQ5.KHACH người chưa đăng nhập gửi lệnh thì bị từ chối');
select t.thoat();
select t.bang(pg_temp.gia(t.can('1509'), '2026-12-01'), '800000/1100000', 'YC4.4-NT7 giá 1509 không đổi');
