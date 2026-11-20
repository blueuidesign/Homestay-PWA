-- US22 · Giá ngày lễ và dịp đặc biệt (YC4.3). Lệnh lưu một dải giá dịp fn_luu_gia_dip.
-- YC4.3-NT2, NT3, NT5, NT6, NT7, NT8, NT9, YC4.3 "Luật kiểm", YC4 "Ai được làm gì", YC4 "Dữ liệu", QT5.3, QT5.5, PQ5, PQ21.
-- Viết trước migration (US22-TA1, CL14.5): task sau không sửa file này.
select t.fixture();

-- "Hôm nay" cố định là T4 07/10/2026 như dữ liệu mẫu.
create or replace function public.local_today() returns date
language sql stable security definer set search_path = ''
as $$ select date '2026-10-07' $$;

-- Chạy câu lệnh bằng vai hiện tại; trả 'qua' hoặc 'mã|câu lỗi'.
create or replace function pg_temp.loi(p_cau text) returns text language plpgsql as $$
declare ma text; cau text;
begin
  execute p_cau;
  return 'qua';
exception when others then
  get stacked diagnostics ma = returned_sqlstate, cau = message_text;
  return ma || '|' || cau;
end $$;

-- Các dải dịp của một căn dạng "tu..den ten gia le", nối bằng "; ", đọc bằng vai chủ database.
create or replace function pg_temp.dai(p_can uuid) returns text language sql stable as $$
  select coalesce(string_agg(tu_ngay::text || '..' || den_ngay::text || ' ' || coalesce(ten, '-') || ' ' || gia::text || ' '
                             || la_ngay_le::text, '; ' order by tu_ngay), '')
  from public.gia_dip where can_id = p_can
$$;

-- Một đêm của lịch giá, dạng "giá|loại", gọi bằng vai hiện tại.
create or replace function pg_temp.dem_gia(p_can uuid, p_dem date) returns text language sql as $$
  select coalesce(l.gia::text, '-') || '|' || l.loai from public.fn_lich_gia_thang(p_can, date_trunc('month', p_dem)::date) l where l.dem = p_dem
$$;

-- ===== Danh mục =====
select t.ok(exists (select 1 from pg_proc where proname = 'fn_luu_gia_dip' and pronamespace = 'public'::regnamespace and prosecdef),
            'YC4.3 bước 7 danh mục: có lệnh fn_luu_gia_dip chạy security definer');
select t.ok(exists (select 1 from pg_proc p where p.proname = 'fn_luu_gia_dip' and p.pronamespace = 'public'::regnamespace)
            and not exists (select 1 from pg_proc p where p.proname = 'fn_luu_gia_dip' and p.pronamespace = 'public'::regnamespace
                            and has_function_privilege('anon', p.oid, 'execute')),
            'YC4 Ai được làm gì danh mục: người chưa đăng nhập không gọi được fn_luu_gia_dip');
select t.ok(not has_table_privilege('authenticated', 'public.gia_dip', 'insert')
            and not has_table_privilege('authenticated', 'public.gia_dip', 'update')
            and not has_table_privilege('authenticated', 'public.gia_dip', 'delete'),
            'YC4 Ai được làm gì danh mục: app không ghi thẳng bảng gia_dip (ghi qua fn_luu_gia_dip)');
select t.ok(not has_table_privilege('authenticated', 'public.ngay_le', 'insert')
            and not has_table_privilege('authenticated', 'public.ngay_le', 'update')
            and not has_table_privilege('authenticated', 'public.ngay_le', 'delete'),
            'YC4.3-NT9 PQ21.CHU danh mục: chủ nhà không ghi thẳng bảng dải ngày lễ chung ngay_le');
select t.ok(not exists (select 1 from pg_proc p where p.proname = 'fn_luu_gia_dip' and p.pronamespace = 'public'::regnamespace
                        and exists (select 1 from unnest(coalesce(p.proargnames, '{}')) a where a ilike '%nguoi%')),
            'YC4 Ai được làm gì lệnh lưu giá dịp không nhận người lưu từ app');

-- ===== YC4.3-NT2: dải quá 10 ngày bị từ chối =====
select t.dang_nhap(t.id('hoa'));
select t.bang(pg_temp.loi($$select public.fn_luu_gia_dip(t.can('1509'), '2026-11-01', '2026-11-11', 'Dài', 1000000, false)$$),
              'P0001|Tối đa 10 ngày', 'YC4.3-NT2 lệnh lưu dải 11 ngày (01/11 – 11/11) gửi thẳng tới database bị từ chối "Tối đa 10 ngày"');
select t.bang(pg_temp.loi($$select public.fn_luu_gia_dip(t.can('1509'), '2026-11-01', '2026-11-13', 'Dài', 1000000, false)$$),
              'P0001|Tối đa 10 ngày', 'YC4.3-NT2 lệnh lưu dải 13 ngày bị từ chối');
select t.khong_loi($$select public.fn_luu_gia_dip(t.can('1509'), '2026-11-01', '2026-11-10', 'Đủ 10 ngày', 1000000, false)$$,
                   'YC4.3-NT2 dải đúng 10 ngày (01/11 – 10/11) thì lưu được');
select t.thoat();
select t.bang((select count(*) from public.gia_dip where can_id = t.can('1509') and den_ngay > tu_ngay + 9), 0::bigint,
              'YC4.3-NT2 không có dải nào của 1509 dài quá 10 ngày');

-- ===== YC4.3 Luật kiểm =====
select t.dang_nhap(t.id('hoa'));
select t.bang(pg_temp.loi($$select public.fn_luu_gia_dip(t.can('1509'), '2026-12-10', '2026-12-11', null, null, false)$$),
              'P0001|Cần nhập giá mỗi đêm', 'YC4.3 Luật kiểm giá mỗi đêm trống bị từ chối "Cần nhập giá mỗi đêm"');
select t.bang(pg_temp.loi($$select public.fn_luu_gia_dip(t.can('1509'), '2026-12-10', '2026-12-11', null, 0, false)$$),
              'P0001|Giá phải lớn hơn 0', 'YC4.3 Luật kiểm giá 0 bị từ chối "Giá phải lớn hơn 0"');
select t.bang(pg_temp.loi($$select public.fn_luu_gia_dip(t.can('1509'), '2026-12-10', '2026-12-11', null, 100000001, false)$$),
              'P0001|Giá mỗi đêm tối đa 100.000.000đ', 'YC4.3 Luật kiểm giá quá 100.000.000đ bị từ chối');
select t.bang(pg_temp.loi($$select public.fn_luu_gia_dip(t.can('1509'), '2026-12-10', '2026-12-11', repeat('a', 61), 1000000, false)$$),
              'P0001|Tên dịp dài tối đa 60 ký tự', 'YC4.3 Luật kiểm tên dịp 61 ký tự bị từ chối');
select t.bang(pg_temp.loi($$select public.fn_luu_gia_dip(t.can('1509'), '2026-12-11', '2026-12-10', null, 1000000, false)$$),
              'P0001|Đến ngày không được trước từ ngày', 'YC4.3 Luật kiểm đến ngày trước từ ngày bị từ chối');
select t.bang(pg_temp.loi($$select public.fn_luu_gia_dip(t.can('1509'), null, '2026-12-10', null, 1000000, false)$$),
              'P0001|Cần chọn từ ngày và đến ngày', 'YC4.3 Luật kiểm thiếu từ ngày bị từ chối');
select t.thoat();
select t.bang((select count(*) from public.gia_dip where can_id = t.can('1509') and tu_ngay >= '2026-12-01'), 0::bigint,
              'YC4.3 Luật kiểm các lệnh sai luật không lưu dải nào');

-- ===== YC4.3-NT3, NT5: lưu 24/10 – 25/10 giá 1.300.000đ, tắt "Là ngày lễ", bỏ trống tên (căn 1509 chưa có dịp này) =====
update public.can set lich_doi_luc = now() - interval '2 days' where id = t.can('1509');
select t.dang_nhap(t.id('hoa'));
select t.khong_loi($$select public.fn_luu_gia_dip(t.can('1509'), '2026-10-24', '2026-10-25', '   ', 1300000, false)$$,
                   'YC4.3-NT3 Chị Hoa lưu dải 24/10 – 25/10 giá 1.300.000đ cho 1509, tắt "Là ngày lễ" thì lệnh qua');
select t.bang(pg_temp.dem_gia(t.can('1509'), '2026-10-24'), '1300000|dip', 'YC4.3-NT3 lịch giá 1509 đêm 24/10 là 1.300.000đ ("1,3tr"), loại dịp');
select t.bang(pg_temp.dem_gia(t.can('1509'), '2026-10-25'), '1300000|dip', 'YC4.3-NT3 lịch giá 1509 đêm 25/10 là 1.300.000đ, loại dịp');
select t.bang(pg_temp.dem_gia(t.can('1509'), '2026-10-26'), '900000|thuong', 'YC4.3-NT3 QT5.3 đêm 26/10 ngoài dải về giá tháng');
select t.thoat();
select t.bang(pg_temp.dai(t.can('1509')), '2026-10-24..2026-10-25 Dịp đặc biệt 24/10 – 25/10 1300000 false; 2026-11-01..2026-11-10 Đủ 10 ngày 1000000 false',
              'YC4.3-NT5 bỏ trống tên, tắt "Là ngày lễ" thì dải có tên "Dịp đặc biệt 24/10 – 25/10", không phải ngày lễ (mục Dịp đặc biệt)');
select t.ok((select lich_doi_luc from public.can where id = t.can('1509')) >= now() - interval '1 minute',
            'YC4.3 bước 7 YC4 Dữ liệu lưu giá dịp thì cập nhật lúc lịch đổi của căn');

-- Tên tự đặt khi bật "Là ngày lễ" mà bỏ trống tên (YC4-H6, Claude tự chốt): "Ngày lễ <ngày đầu> – <ngày cuối>".
select t.dang_nhap(t.id('hoa'));
select t.khong_loi($$select public.fn_luu_gia_dip(t.can('1509'), '2027-01-01', '2027-01-01', null, 2000000, true)$$,
                   'YC4.3 bước 5 lưu dải một ngày 01/01/2027 bật "Là ngày lễ" thì lệnh qua');
select t.thoat();
select t.bang((select ten || ' ' || la_ngay_le::text from public.gia_dip where can_id = t.can('1509') and tu_ngay = '2027-01-01'),
              'Ngày lễ 01/01 true', 'YC4.3 bước 5 bật "Là ngày lễ", bỏ trống tên thì tên "Ngày lễ 01/01" và nằm ở mục Giá ngày lễ');

-- ===== YC4.3-NT6: 3402 có dịp 24/10 – 25/10, lưu thêm 25/10 – 26/10 thì báo trùng, dịp cũ giữ nguyên =====
select t.dang_nhap(t.id('hoa'));
select t.bang(pg_temp.loi($$select public.fn_luu_gia_dip(t.can('3402'), '2026-10-25', '2026-10-26', 'Mới', 1500000, false)$$),
              'P0001|Trùng ngày với Dịp đặc biệt (24/10 – 25/10). Đổi ngày rồi lưu lại.',
              'YC4.3-NT6 lưu 25/10 – 26/10 cho 3402 thì bị từ chối "Trùng ngày với Dịp đặc biệt (24/10 – 25/10). Đổi ngày rồi lưu lại."');
select t.bang(pg_temp.loi($$select public.fn_luu_gia_dip(t.can('3402'), '2026-10-20', '2026-10-29', null, 1500000, false)$$),
              'P0001|Trùng ngày với Dịp đặc biệt (24/10 – 25/10). Đổi ngày rồi lưu lại.',
              'YC4.3-NT6 dải 20/10 – 29/10 bao trọn dịp cũ cũng bị từ chối');
select t.thoat();
select t.bang(pg_temp.dai(t.can('3402')), '2026-10-24..2026-10-25 Dịp đặc biệt 1300000 false',
              'YC4.3-NT6 dải mới không được lưu, dịp cũ 24/10 – 25/10 của 3402 giữ nguyên');

-- ===== YC4.3-NT8: 3402 có dịp 24/10 – 25/10, lưu 26/10 – 27/10 thì được (hai dải liền nhau) =====
select t.dang_nhap(t.id('hoa'));
select t.khong_loi($$select public.fn_luu_gia_dip(t.can('3402'), '2026-10-26', '2026-10-27', 'Liền sau', 1500000, false)$$,
                   'YC4.3-NT8 lưu 26/10 – 27/10 cho 3402 (liền sau dịp 24/10 – 25/10) thì lưu được');
select t.bang(pg_temp.dem_gia(t.can('3402'), '2026-10-26'), '1500000|dip', 'YC4.3-NT8 đêm 26/10 của 3402 có giá dịp mới 1.500.000đ');
select t.thoat();
select t.bang((select count(*) from public.gia_dip where can_id = t.can('3402')), 2::bigint, 'YC4.3-NT8 3402 có hai dải liền nhau');
-- Cùng ngày nhưng căn khác thì không trùng.
select t.dang_nhap(t.id('hoa'));
select t.khong_loi($$select public.fn_luu_gia_dip(t.can('1509'), '2026-10-26', '2026-10-27', 'Căn khác', 1500000, false)$$,
                   'YC4.3-NT8 cùng ngày 26/10 – 27/10 ở căn 1509 không tính trùng với 3402');
select t.thoat();

-- ===== YC4.3-NT9: dải chung của Home247 không đổi; người khác không thêm dải cho 3402 =====
insert into public.ngay_le (nam, ten, tu_ngay, den_ngay) values (2027, 'Lễ 30/4 – 1/5', '2027-04-30', '2027-05-02');
select t.dang_nhap(t.id('hoa'));
select t.khong_loi($$select public.fn_luu_gia_dip(t.can('3402'), '2027-04-29', '2027-05-03', 'Lễ 30/4 – 1/5', 2500000, true)$$,
                   'YC4.3-NT9 Chị Hoa lưu "Lễ 30/4 – 1/5" cho 3402 với ngày 29/04 – 03/05 (khác dải chung) thì lệnh qua');
select t.bang(t.dem($$select 1 from public.ngay_le$$), 1::bigint, 'YC4.3-NT9 PQ21.CHU Chị Hoa đọc được dải ngày lễ chung');
select t.loi($$insert into public.ngay_le (nam, ten, tu_ngay, den_ngay) values (2027, 'Thử', '2027-01-01', '2027-01-02')$$, '42501',
             'YC4.3-NT9 PQ21.CHU Chị Hoa thêm thẳng dải ngày lễ chung bị từ chối');
select t.loi($$update public.ngay_le set tu_ngay = '2027-04-29'$$, '42501', 'YC4.3-NT9 PQ21.CHU Chị Hoa sửa thẳng dải ngày lễ chung bị từ chối');
select t.thoat();
select t.bang((select tu_ngay::text || '..' || den_ngay::text from public.ngay_le where nam = 2027 and ten = 'Lễ 30/4 – 1/5'),
              '2027-04-30..2027-05-02', 'YC4.3-NT9 dải chung "Lễ 30/4 – 1/5" năm 2027 của Home247 không đổi');

select t.dang_nhap(t.id('tuan'));
select t.bang(pg_temp.loi($$select public.fn_luu_gia_dip(t.can('3402'), '2026-12-20', '2026-12-21', 'Của Tuấn', 1000000, false)$$),
              'P0001|Không tìm thấy căn', 'YC4.3-NT9 PQ5.CHU Anh Tuấn gửi lệnh thêm dải cho 3402 của Chị Hoa thì database từ chối');
select t.thoat();
select t.dang_nhap(t.id('hung'));
select t.bang(pg_temp.loi($$select public.fn_luu_gia_dip(t.can('3402'), '2026-12-20', '2026-12-21', 'Của Hùng', 1000000, false)$$),
              'P0001|Không tìm thấy căn', 'YC4.3-NT9 PQ5.SALE Sale Hùng (được chia sẻ 3402) gửi lệnh thêm dải cho 3402 thì database từ chối');
select t.thoat();
select t.khach();
select t.loi($$select public.fn_luu_gia_dip(t.can('3402'), '2026-12-20', '2026-12-21', 'Khách', 1000000, false)$$, '42501',
             'YC4.3-NT9 PQ5.KHACH người chưa đăng nhập gửi lệnh thêm dải thì bị từ chối');
select t.thoat();
select t.bang((select count(*) from public.gia_dip where can_id = t.can('3402') and tu_ngay = '2026-12-20'), 0::bigint,
              'YC4.3-NT9 không có dải nào của người khác được thêm cho 3402');

-- Căn đã xóa thì không lưu được (HV5, QT5.5).
update public.can set an_luc = now() where id = t.can('1103');
select t.dang_nhap(t.id('tuan'));
select t.bang(pg_temp.loi($$select public.fn_luu_gia_dip(t.can('1103'), '2026-12-20', '2026-12-21', null, 1000000, false)$$),
              'P0001|Không tìm thấy căn', 'YC4 Trạng thái màn HV5 căn đã xóa thì lưu giá dịp bị từ chối');
select t.thoat();
update public.can set an_luc = null where id = t.can('1103');

-- ===== YC4.3-NT7: hai lệnh lưu hai dải chồng ngày của cùng căn chạy cùng lúc thì đúng một lệnh qua =====
-- Hai phiên thật qua dblink (dữ liệu riêng đã commit, dọn ở cuối). Không có dblink thì hai lệnh nối tiếp.
do $nt7$
declare
  v_co_dblink boolean := exists (select 1 from pg_available_extensions where name = 'dblink');
  v_chu uuid := gen_random_uuid();
  v_can uuid := gen_random_uuid();
  v_cs text := 'dbname=' || quote_ident(current_database());
  v_vai text;
  v_a text;
  v_loi_b text;
  v_so bigint;
begin
  if v_co_dblink then
    begin
      create extension if not exists dblink;
      perform dblink_connect('us22_dung', v_cs);
    exception when others then
      v_co_dblink := false;
      raise notice 'YC4.3-NT7: không mở được phiên dblink (%), chạy hai lệnh nối tiếp', sqlerrm;
    end;
  end if;

  if not v_co_dblink then
    perform t.dang_nhap(t.id('hoa'));
    v_a := pg_temp.loi($q$select public.fn_luu_gia_dip(t.can('1509'), '2026-12-20', '2026-12-22', 'A', 1000000, false)$q$);
    v_loi_b := pg_temp.loi($q$select public.fn_luu_gia_dip(t.can('1509'), '2026-12-21', '2026-12-23', 'B', 1000000, false)$q$);
    perform t.thoat();
    perform t.bang(v_a || ' / ' || v_loi_b, 'qua / P0001|Trùng ngày với A (20/12 – 22/12). Đổi ngày rồi lưu lại.',
                   'YC4.3-NT7 lệnh thứ hai nhận lỗi trùng ngày');
    perform t.bang((select count(*) from public.gia_dip where can_id = t.can('1509') and tu_ngay >= '2026-12-20'), 1::bigint,
                   'YC4.3-NT7 hai lệnh chồng ngày của cùng căn: đúng một lệnh qua');
    return;
  end if;

  perform dblink_exec('us22_dung', format(
    $q$insert into auth.users (id) values (%L) on conflict (id) do nothing;
       insert into public.profiles (id, ten, ten_hien_thi, so_dien_thoai, vai_chon) values (%L, 'Chủ thử NT7', 'Chủ thử NT7', null, 'chu_nha')
         on conflict (id) do update set vai_chon = 'chu_nha';
       insert into public.can (id, nguoi_giu, loai, ma_can) values (%L, %L, 'co_lich', 'NT7')$q$,
    v_chu, v_chu, v_can, v_chu));

  v_vai := format($q$begin; select set_config('request.jwt.claims', %L, true); set local role authenticated$q$,
                  json_build_object('sub', v_chu, 'role', 'authenticated')::text);
  perform dblink_connect('us22_a', v_cs);
  perform dblink_connect('us22_b', v_cs);
  perform dblink_exec('us22_a', v_vai);
  perform dblink_exec('us22_b', v_vai);

  -- Phiên A lưu 20/12 – 22/12, chưa commit. Phiên B lưu 21/12 – 23/12 cùng lúc.
  select r into v_a from dblink('us22_a', format(
    $q$select public.fn_luu_gia_dip(%L, '2026-12-20', '2026-12-22', 'A', 1000000, false)::text$q$, v_can)) as x(r text);
  perform dblink_send_query('us22_b', format(
    $q$select public.fn_luu_gia_dip(%L, '2026-12-21', '2026-12-23', 'B', 1000000, false)::text$q$, v_can));
  perform pg_sleep(0.3);
  perform dblink_exec('us22_a', 'commit');
  select count(*) into v_so from dblink_get_result('us22_b', false) as x(r text);
  v_loi_b := case when v_so > 0 then 'qua' else dblink_error_message('us22_b') end;
  perform * from dblink_get_result('us22_b', false) as x(r text);
  perform dblink_exec('us22_b', case when v_loi_b = 'qua' then 'commit' else 'rollback' end);
  perform t.ok(v_a is not null and v_loi_b ilike '%Trùng ngày với A (20/12 – 22/12)%',
               'YC4.3-NT7 phiên B nhận lỗi trùng ngày "Trùng ngày với A (20/12 – 22/12)" (ra: ' || coalesce(v_loi_b, '-') || ')');

  select n into v_so from dblink('us22_dung', format('select count(*) from public.gia_dip where can_id = %L', v_can)) as x(n bigint);
  perform t.bang(v_so, 1::bigint, 'YC4.3-NT7 hai lệnh lưu hai dải chồng ngày của cùng căn chạy cùng lúc: đúng một lệnh qua');

  perform dblink_exec('us22_dung', format(
    $q$delete from public.gia_dip where can_id = %L;
       delete from public.can where id = %L;
       delete from public.profiles where id = %L;
       delete from auth.users where id = %L$q$, v_can, v_can, v_chu, v_chu));
  perform dblink_disconnect('us22_a');
  perform dblink_disconnect('us22_b');
  perform dblink_disconnect('us22_dung');
end $nt7$;
