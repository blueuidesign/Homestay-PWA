-- US19 · Xóa căn (YC3.6). Lệnh xóa căn fn_xoa_can(p_can_id): chỉ người giữ căn, căn chưa ẩn; xóa là ẩn căn (ghi an_luc),
-- đặt phòng, tiền từng đêm, thống kê giữ nguyên; từ chối khi còn đặt phòng chưa hủy có ngày trả sau hôm nay (giờ Việt Nam)
-- hay còn yêu cầu đang chờ chưa hết hạn. Không có lệnh bỏ ẩn.
-- YC3.6-NT2, NT3, NT4, NT6, NT7, NT8, NT9, NT10, NT11, YC3 quy tắc "Xóa căn là ẩn căn", "Mã căn không trùng",
-- YC3 "Ai được làm gì", YC3 "Dữ liệu", QT5.5, PQ3.CHU, PQ3.SALE, PQ17, thiet-ke-db.md mục 3 bất biến 3.
-- Viết trước migration (US19-TA2, CL14.5): task sau không sửa file này.
-- Số theo DLM.4, DLM.5: B1 đến B9 của Chị Hoa; doanh thu tháng 10 là 11.800.000đ, 3402 là 5.100.000đ.
-- Bộ rút gọn không có Sale Minh: B7, B8, B9 ghi là khách lẻ (không đổi số tiền). Sale Lan được chia sẻ thêm 3402 trong
-- file này để thử "sale không còn thấy căn đã xóa" (DLM.4: B2, B4 là của Sale Lan).
select t.fixture();

-- Chạy câu bằng vai hiện tại, trả 'qua' hay "mã lỗi|câu lỗi".
create or replace function pg_temp.loi(p_cau text) returns text language plpgsql as $$
declare ma text; cau text;
begin
  execute p_cau;
  return 'qua';
exception when others then
  get stacked diagnostics ma = returned_sqlstate, cau = message_text;
  return ma || '|' || cau;
end $$;
-- Câu xóa một căn.
create or replace function pg_temp.cau_xoa(p_can uuid) returns text language sql as $$
  select format('select public.fn_xoa_can(p_can_id => %L)', p_can)
$$;
-- Căn đã ẩn chưa (vai chủ database).
create or replace function pg_temp.da_an(p_can uuid) returns boolean language sql security definer as $$
  select an_luc is not null from public.can where id = p_can
$$;
-- Đổi "hôm nay" (giờ Việt Nam). Cả file chạy trong một giao dịch rồi rollback, nên hàm gốc trở lại sau file này.
create or replace function pg_temp.hom_nay(p_ngay date) returns void language plpgsql as $hn$
begin
  execute format('create or replace function public.local_today() returns date '
                 'language sql stable security definer set search_path = '''' as $b$ select date %L $b$', p_ngay);
end $hn$;

-- ===== Danh mục: lệnh xóa căn chạy security definer, chỉ người đã đăng nhập gọi được =====
select t.ok(exists (select 1 from pg_proc where proname = 'fn_xoa_can' and pronamespace = 'public'::regnamespace and prosecdef),
            'YC3.6 bước 42 danh mục: có lệnh fn_xoa_can chạy security definer');
select t.ok(exists (select 1 from pg_proc p where p.proname = 'fn_xoa_can' and p.pronamespace = 'public'::regnamespace
                    and has_function_privilege('authenticated', p.oid, 'execute'))
            and not exists (select 1 from pg_proc p where p.proname = 'fn_xoa_can' and p.pronamespace = 'public'::regnamespace
                            and (has_function_privilege('anon', p.oid, 'execute')
                                 or has_function_privilege('public', p.oid, 'execute'))),
            'YC3.6-NT10 danh mục: người chưa đăng nhập không có quyền gọi fn_xoa_can, người đã đăng nhập gọi được');
select t.ok(not exists (select 1 from pg_proc p where p.proname = 'fn_xoa_can' and p.pronamespace = 'public'::regnamespace
                        and exists (select 1 from unnest(coalesce(p.proargnames, '{}')) a where a ilike '%nguoi%' or a ilike '%owner%')),
            'YC3.6-NT10 PQ3.CHU lệnh xóa căn không nhận mã người giữ: chỉ xóa được căn của người gọi');

-- ===== YC3.6-NT11: lệnh ẩn căn và lệnh ghi đặt phòng vào căn đó chạy cùng lúc =====
-- Hai phiên thật qua dblink (dữ liệu riêng đã commit, dọn ở cuối), chạy trước khi đổi "hôm nay" của file.
-- Thứ tự 1: phiên A ẩn căn, chưa commit; phiên B ghi đặt phòng sắp tới vào căn đó phải chờ, A commit thì B bị từ chối.
-- Thứ tự 2: phiên B ghi đặt phòng, chưa commit; phiên A ẩn căn phải chờ, B commit thì A bị từ chối.
do $nt11$
declare
  v_chu uuid := gen_random_uuid();
  v_can1 uuid := gen_random_uuid();
  v_can2 uuid := gen_random_uuid();
  v_cs text := 'dbname=' || quote_ident(current_database());
  v_vai text;
  v_pid int;
  v_cho boolean;
  v_ok boolean;
  v_so bigint;
  v_kq text;
  v_cau_ghi text;
  i int;
begin
  begin
    create extension if not exists dblink;
    perform dblink_connect('us19_dung', v_cs);
  exception when others then
    raise notice 'not ok - YC3.6-NT11 không mở được phiên dblink để thử hai lệnh cùng lúc (%)', sqlerrm;
    return;
  end;

  perform dblink_exec('us19_dung', format(
    $q$insert into auth.users (id) values (%L) on conflict (id) do nothing;
       insert into public.profiles (id, ten, ten_hien_thi, so_dien_thoai, vai_chon) values (%L, 'Chủ thử NT11', 'Chủ thử NT11', null, 'chu_nha')
         on conflict (id) do update set vai_chon = 'chu_nha';
       insert into public.can (id, nguoi_giu, loai, ma_can) values (%L, %L, 'co_lich', 'NT11-1'), (%L, %L, 'co_lich', 'NT11-2')$q$,
    v_chu, v_chu, v_can1, v_chu, v_can2, v_chu));

  v_vai := format($q$begin; select set_config('request.jwt.claims', %L, true); set local role authenticated$q$,
                  json_build_object('sub', v_chu, 'role', 'authenticated')::text);
  v_cau_ghi := $q$select public.fn_tao_booking(p_can_id => %L, p_ngay_nhan => public.local_today() + 30,
                  p_ngay_tra => public.local_today() + 32, p_tien_phong => 1600000, p_client_id => gen_random_uuid())::text$q$;
  perform dblink_connect('us19_a', v_cs);
  perform dblink_connect('us19_b', v_cs);

  begin
  -- Thứ tự 1: ẩn trước.
  perform dblink_exec('us19_a', v_vai);
  perform dblink_exec('us19_b', v_vai);
  select p into v_pid from dblink('us19_b', 'select pg_backend_pid()') as x(p int);
  select count(*) into v_so from dblink('us19_a', format('select public.fn_xoa_can(p_can_id => %L)::text', v_can1)) as x(r text);
  perform dblink_send_query('us19_b', format(v_cau_ghi, v_can1));
  v_cho := false;
  for i in 1..50 loop
    select exists (select 1 from pg_stat_activity where pid = v_pid and wait_event_type = 'Lock') into v_cho;
    exit when v_cho;
    perform pg_sleep(0.1);
  end loop;
  perform t.ok(v_so = 1 and v_cho,
               'YC3.6-NT11 phiên A ẩn căn chưa commit thì lệnh ghi đặt phòng vào căn đó của phiên B phải chờ');
  perform dblink_exec('us19_a', 'commit');
  select count(*) into v_so from dblink_get_result('us19_b', false) as x(r text);
  v_kq := case when v_so > 0 then 'qua' else dblink_error_message('us19_b') end;
  perform * from dblink_get_result('us19_b', false) as x(r text);
  perform dblink_exec('us19_b', case when v_kq = 'qua' then 'commit' else 'rollback' end);
  perform t.ok(v_kq <> 'qua',
               'YC3.6-NT11 căn vừa ẩn xong thì lệnh ghi đặt phòng đang chờ bị từ chối (ra: ' || v_kq || ')');

  -- Thứ tự 2: ghi trước.
  perform dblink_exec('us19_a', v_vai);
  perform dblink_exec('us19_b', v_vai);
  select p into v_pid from dblink('us19_a', 'select pg_backend_pid()') as x(p int);
  select count(*) into v_so from dblink('us19_b', format(v_cau_ghi, v_can2)) as x(r text);
  perform dblink_send_query('us19_a', format('select public.fn_xoa_can(p_can_id => %L)::text', v_can2));
  v_cho := false;
  for i in 1..50 loop
    select exists (select 1 from pg_stat_activity where pid = v_pid and wait_event_type = 'Lock') into v_cho;
    exit when v_cho;
    perform pg_sleep(0.1);
  end loop;
  perform t.ok(v_so = 1 and v_cho,
               'YC3.6-NT11 phiên B ghi đặt phòng chưa commit thì lệnh ẩn căn đó của phiên A phải chờ');
  perform dblink_exec('us19_b', 'commit');
  select count(*) into v_so from dblink_get_result('us19_a', false) as x(r text);
  v_kq := case when v_so > 0 then 'qua' else dblink_error_message('us19_a') end;
  perform * from dblink_get_result('us19_a', false) as x(r text);
  perform dblink_exec('us19_a', case when v_kq = 'qua' then 'commit' else 'rollback' end);
  perform t.ok(v_kq ilike '%Căn còn đặt phòng sắp tới%',
               'YC3.6-NT11 đặt phòng vừa ghi xong thì lệnh ẩn căn đang chờ bị từ chối "Căn còn đặt phòng sắp tới" (ra: ' || v_kq || ')');

  select ok into v_ok from dblink('us19_dung', format(
    $q$select not exists (select 1 from public.can c join public.booking b on b.can_id = c.id
                          where c.id in (%L, %L) and c.an_luc is not null and b.trang_thai <> 'da_huy'
                            and b.ngay_tra > public.local_today())$q$, v_can1, v_can2)) as x(ok boolean);
  perform t.ok(v_ok, 'YC3.6-NT11 sau hai lần chạy cùng lúc không có căn đã ẩn mà còn đặt phòng có ngày trả sau hôm nay');
  exception when others then
    -- Lệnh lỗi giữa chừng (ví dụ chưa có fn_xoa_can): ghi hỏng, vẫn dọn dữ liệu đã commit.
    raise notice 'not ok - YC3.6-NT11 phép thử hai lệnh cùng lúc dừng giữa chừng (%)', sqlerrm;
  end;

  perform dblink_exec('us19_dung', format(
    $q$delete from public.audit_log where ban_ghi_id in (select id from public.booking where can_id in (%L, %L));
       delete from public.booking where can_id in (%L, %L);
       delete from public.audit_log where ban_ghi_id in (select id from public.booking where can_id in (%L, %L));
       delete from public.thong_bao where nguoi_nhan = %L;
       delete from public.can where id in (%L, %L);
       delete from public.profiles where id = %L;
       delete from auth.users where id = %L$q$,
    v_can1, v_can2, v_can1, v_can2, v_can1, v_can2, v_chu, v_can1, v_can2, v_chu, v_chu));
  perform dblink_disconnect('us19_a');
  perform dblink_disconnect('us19_b');
  perform dblink_disconnect('us19_dung');
end $nt11$;

-- ===== Dữ liệu của file: B1 đến B9 (DLM.4), căn 2105 của Chị Hoa không có đặt phòng, Sale Lan thấy thêm 3402 =====
select t.tao_booking('B1', t.can('1509'), '2026-10-10', '2026-10-12', 2200000, t.id('hung'), 'tu_yeu_cau');
select t.tao_booking('B2', t.can('3402'), '2026-10-17', '2026-10-19', 1900000, t.id('lan'), 'tu_yeu_cau');
select t.tao_booking('B3', t.can('1509'), '2026-10-04', '2026-10-06', 1800000, t.id('hung'), 'tu_yeu_cau');
select t.tao_booking('B4', t.can('3402'), '2026-10-05', '2026-10-07', 1600000, t.id('lan'), 'tu_yeu_cau');
select t.tao_booking('B5', t.can('1509'), '2026-10-13', '2026-10-15', 1800000);
select t.tao_booking('B6', t.can('3402'), '2026-10-14', '2026-10-15', 800000);
select t.tao_booking('B7', t.can('1509'), '2026-10-19', '2026-10-20', 900000);
select t.tao_booking('B8', t.can('3402'), '2026-10-21', '2026-10-22', 800000);
select t.tao_booking('B9', t.can('3402'), '2026-11-30', '2026-12-02', 1600000);
insert into public.can (id, nguoi_giu, loai, ma_can, so_phong_ngu)
values ('00000000-0000-0000-0001-0000000a2105', t.id('hoa'), 'co_lich', '2105', 1);
select set_config('t.c2105', '00000000-0000-0000-0001-0000000a2105', true);
insert into public.ket_noi_can (ket_noi_id, can_id) values (t.kn('hoa', 'lan'), t.can('3402'));

-- "Hôm nay" là 07/10/2026 như dữ liệu mẫu (DLM.1).
select pg_temp.hom_nay('2026-10-07');

-- ===== YC3.6-NT10: Anh Tuấn, Sale Hùng, Sale Lan, người chưa đăng nhập gửi lệnh xóa 3402 thì bị từ chối =====
select t.dang_nhap(t.id('tuan'));
select t.bang(pg_temp.loi(pg_temp.cau_xoa(t.can('3402'))), '42501|Không tìm thấy căn',
              'YC3.6-NT10 PQ3.CHU Anh Tuấn (chủ nhà khác) gửi lệnh xóa 3402 thì bị từ chối như căn không thấy');
select t.thoat();
select t.dang_nhap(t.id('hung'));
select t.bang(t.so($$select * from public.can where id = t.can('3402')$$), 1::bigint,
              'YC3.6-NT10 PQ3.SALE Sale Hùng đọc được 3402 (được chia sẻ), để chắc lệnh xóa bị chặn vì quyền ghi');
select t.bang(pg_temp.loi(pg_temp.cau_xoa(t.can('3402'))), '42501|Không tìm thấy căn',
              'YC3.6-NT10 PQ3.SALE Sale Hùng (được chia sẻ 3402) gửi lệnh xóa 3402 thì bị từ chối');
select t.loi($$update public.can set an_luc = now() where id = t.can('3402')$$, '42501',
             'YC3.6-NT10 PQ3.SALE Sale Hùng không ẩn thẳng 3402 trên bảng căn được');
select t.thoat();
select t.dang_nhap(t.id('lan'));
select t.bang(pg_temp.loi(pg_temp.cau_xoa(t.can('3402'))), '42501|Không tìm thấy căn',
              'YC3.6-NT10 PQ3.SALE Sale Lan (được chia sẻ 3402) gửi lệnh xóa 3402 thì bị từ chối');
select t.thoat();
select t.khach();
select t.ok(t.ma_loi(pg_temp.cau_xoa(t.can('3402'))) is not null,
            'YC3.6-NT10 người chưa đăng nhập gửi lệnh xóa 3402 thì bị từ chối');
select t.thoat();
select t.dang_nhap(t.id('hoa'));
select t.bang(pg_temp.loi(pg_temp.cau_xoa(t.can('1103'))), '42501|Không tìm thấy căn',
              'YC3.6-NT10 PQ3.CHU Chị Hoa gửi lệnh xóa 1103 của Anh Tuấn thì bị từ chối');
select t.bang(pg_temp.loi(pg_temp.cau_xoa(t.can('villa'))), '42501|Không tìm thấy căn',
              'YC3.6-NT10 PQ13 Chị Hoa gửi lệnh xóa căn tự nhập của Sale Hùng thì bị từ chối');
select t.bang(pg_temp.loi(pg_temp.cau_xoa(gen_random_uuid())), '42501|Không tìm thấy căn',
              'YC3.6 QT5.5 xóa căn không có thì bị từ chối như căn không thấy');
select t.thoat();
select t.ok(not pg_temp.da_an(t.can('3402')) and not pg_temp.da_an(t.can('1103')) and not pg_temp.da_an(t.can('villa')),
            'YC3.6-NT10 sau các lệnh bị từ chối 3402, 1103, căn tự nhập của Sale Hùng không bị ẩn');

-- ===== YC3.6-NT3: lệnh ẩn 3402 gửi thẳng tới database lúc 3402 còn B2 thì bị từ chối =====
select t.dang_nhap(t.id('hoa'));
select t.bang(pg_temp.loi(pg_temp.cau_xoa(t.can('3402'))), 'P0001|Căn còn đặt phòng sắp tới',
              'YC3.6-NT3 Chị Hoa gửi thẳng lệnh xóa 3402 lúc còn B2 (17/10 → 19/10) thì database từ chối "Căn còn đặt phòng sắp tới"');
select t.loi($$update public.can set an_luc = now() where id = t.can('3402')$$, '42501',
             'YC3.6-NT3 Chị Hoa không ẩn thẳng 3402 trên bảng căn được (bỏ qua lệnh xóa căn)');
select t.thoat();
select t.ok(not pg_temp.da_an(t.can('3402')), 'YC3.6-NT3 3402 không bị ẩn');

-- ===== YC3.6-NT2: 2105 không có đặt phòng nhưng có yêu cầu đang chờ của Sale Lan =====
select t.tao_yeu_cau('Y1', current_setting('t.c2105')::uuid, t.id('lan'), '2026-10-20', '2026-10-22');
select t.dang_nhap(t.id('hoa'));
select t.bang(pg_temp.loi(pg_temp.cau_xoa(current_setting('t.c2105')::uuid)), 'P0001|Căn còn đặt phòng sắp tới',
              'YC3.6-NT2 Chị Hoa xóa 2105 lúc còn yêu cầu đang chờ của Sale Lan thì database từ chối "Căn còn đặt phòng sắp tới"');
select t.thoat();
select t.ok(not pg_temp.da_an(current_setting('t.c2105')::uuid), 'YC3.6-NT2 2105 không bị ẩn');

-- Quy tắc "Xóa căn là ẩn căn": yêu cầu đã hết hạn (quá hạn trả lời hay đã ghi hết hạn) không chặn xóa.
savepoint yc_het_han;
update public.yeu_cau_dat_phong set han_luc = now() - interval '1 minute' where id = t.b('Y1');
select t.dang_nhap(t.id('hoa'));
select t.bang(pg_temp.loi(pg_temp.cau_xoa(current_setting('t.c2105')::uuid)), 'qua',
              'YC3.6 quy tắc "Xóa căn là ẩn căn" yêu cầu đang chờ đã quá hạn trả lời thì không chặn xóa 2105');
select t.thoat();
rollback to savepoint yc_het_han;
savepoint yc_het_han2;
update public.yeu_cau_dat_phong set trang_thai = 'bi_tu_choi', tra_loi_luc = now() where id = t.b('Y1');
select t.dang_nhap(t.id('hoa'));
select t.bang(pg_temp.loi(pg_temp.cau_xoa(current_setting('t.c2105')::uuid)), 'qua',
              'YC3.6 quy tắc "Xóa căn là ẩn căn" yêu cầu đã bị từ chối thì không chặn xóa 2105');
select t.thoat();
rollback to savepoint yc_het_han2;

-- ===== YC3.6-NT8: đã xóa 2105 rồi thêm căn mới mã "2105" thì thêm được =====
savepoint nt8;
update public.yeu_cau_dat_phong set trang_thai = 'het_han' where id = t.b('Y1');
select t.dang_nhap(t.id('hoa'));
select t.khong_loi(pg_temp.cau_xoa(current_setting('t.c2105')::uuid), 'YC3.6-NT8 Chị Hoa xóa được 2105');
select t.bang(pg_temp.loi($$select public.fn_tao_can(p_ma_can => '2105', p_so_phong_ngu => 1,
                                                       p_client_id => '00000000-0000-0000-00bb-000000019008')$$), 'qua',
              'YC3.6-NT8 Chị Hoa thêm căn mới mã "2105" sau khi xóa 2105 thì thêm được, không báo trùng');
select t.bang(t.so($$select * from public.v_can_cua_toi where ma_can = '2105'$$), 1::bigint,
              'YC3.6-NT8 tab Căn của Chị Hoa có đúng một căn 2105 (căn mới)');
select t.thoat();
select t.bang((select count(*) from public.can where nguoi_giu = t.id('hoa') and ma_can = '2105'), 2::bigint,
              'YC3.6-NT8 căn 2105 đã xóa vẫn còn (ẩn) bên cạnh căn 2105 mới');
rollback to savepoint nt8;

-- ===== Quy tắc "Xóa căn là ẩn căn": đặt phòng đã hủy có ngày trả sau hôm nay không chặn xóa =====
savepoint huy;
select pg_temp.hom_nay('2026-11-01');
-- B9 của sale đã hủy theo QD12 (một bên xin, bên kia đồng ý); B9 là đặt phòng duy nhất của 3402 trả sau 01/11.
update public.booking set sale_id = t.id('lan'), nguon = 'tu_yeu_cau' where id = t.b('B9');
update public.booking set huy_xin_boi = t.id('lan'), huy_xin_luc = now(),
       huy_tra_loi = 'dong_y', huy_tra_loi_boi = t.id('hoa'), huy_tra_loi_luc = now(), trang_thai = 'da_huy'
where id = t.b('B9');
select t.dang_nhap(t.id('hoa'));
select t.bang(pg_temp.loi(pg_temp.cau_xoa(t.can('3402'))), 'qua',
              'YC3.6 quy tắc "Xóa căn là ẩn căn" đặt phòng đã hủy (B9 30/11 → 02/12) không chặn xóa 3402');
select t.thoat();
rollback to savepoint huy;

-- ===== Ngày theo giờ Việt Nam: hôm nay 01/12/2026 thì B9 (trả 02/12) còn chặn =====
savepoint ngay_truoc;
select pg_temp.hom_nay('2026-12-01');
select t.dang_nhap(t.id('hoa'));
select t.bang(pg_temp.loi(pg_temp.cau_xoa(t.can('3402'))), 'P0001|Căn còn đặt phòng sắp tới',
              'YC3.6 bước 43 hôm nay 01/12/2026, B9 trả phòng 02/12 thì xóa 3402 bị từ chối "Căn còn đặt phòng sắp tới"');
select t.thoat();
rollback to savepoint ngay_truoc;

-- ===== YC3.6-NT4: hôm nay 02/12/2026, đặt phòng cuối cùng của 3402 là B9 trả 02/12, không còn yêu cầu chờ =====
savepoint nt4;
select pg_temp.hom_nay('2026-12-02');
select t.dang_nhap(t.id('hoa'));
select t.bang(pg_temp.loi(pg_temp.cau_xoa(t.can('3402'))), 'qua',
              'YC3.6-NT4 hôm nay 02/12/2026, B9 trả phòng 02/12 thì Chị Hoa xóa được 3402');
select t.thoat();
select t.ok(pg_temp.da_an(t.can('3402')), 'YC3.6-NT4 xóa căn ghi lúc ẩn của 3402');
rollback to savepoint nt4;

-- ===== YC3.6-NT6, NT7: hôm nay 25/12/2026, Chị Hoa xóa 3402 =====
select pg_temp.hom_nay('2026-12-25');
-- Trước khi xóa: Sale Lan thấy 3402 ở lịch (đêm kín của B2), để chắc phép thử sau xóa có nghĩa.
select t.dang_nhap(t.id('lan'));
select t.bang(t.so($$select * from public.v_lich_sale where can_id = t.can('3402')$$) > 0, true,
              'YC3.6-NT7 trước khi xóa Sale Lan thấy đêm kín của 3402 ở lịch');
select t.thoat();
select set_config('t.dem_3402', (select count(*)::text || '|' || sum(tien)::text from public.booking_dem bd
                                  join public.booking b on b.id = bd.booking_id where b.can_id = t.can('3402')), true);

select t.dang_nhap(t.id('hoa'));
select t.bang(pg_temp.loi(pg_temp.cau_xoa(t.can('3402'))), 'qua', 'YC3.6-NT6 hôm nay 25/12/2026 Chị Hoa xóa được 3402');
select t.bang(t.gt($$(select doanh_thu from public.fn_doanh_thu_thang('2026-10-01'))$$), '11800000',
              'YC3.6-NT6 sau khi xóa 3402 doanh thu tháng 10 của Chị Hoa vẫn 11.800.000đ');
select t.bang(t.gt($$(select sum(bd.tien) from public.booking_dem bd join public.booking b on b.id = bd.booking_id
                      where b.can_id = t.can('3402') and bd.dem >= '2026-10-01' and bd.dem < '2026-11-01')$$), '5100000',
              'YC3.6-NT6 sau khi xóa 3402 tiền tháng 10 của 3402 vẫn 5.100.000đ');
select t.bang(t.so($$select * from public.booking where can_id = t.can('3402')$$), 5::bigint,
              'YC3.6-NT6 Chị Hoa vẫn đọc được 5 đặt phòng của 3402 (B2, B4, B6, B8, B9)');
select t.bang(t.so($$select * from public.v_can_cua_toi where id = t.can('3402')$$), 0::bigint,
              'YC3.6 bước 44 3402 không còn ở tab Căn của Chị Hoa');
select t.bang(t.so($$select * from public.fn_gia_tung_dem_cua_toi('2026-12-25', '2026-12-31') where can_id = t.can('3402')$$), 0::bigint,
              'YC3.6 bước 44 3402 không còn ở lịch tuần của Chị Hoa');
select t.thoat();
select t.ok(pg_temp.da_an(t.can('3402')), 'YC3.6-NT6 xóa căn ghi lúc ẩn của 3402');
select t.bang((select count(*)::text || '|' || sum(tien)::text from public.booking_dem bd
               join public.booking b on b.id = bd.booking_id where b.can_id = t.can('3402')),
              current_setting('t.dem_3402'), 'YC3.6-NT6 tiền từng đêm của 3402 giữ nguyên sau khi xóa');

select t.dang_nhap(t.id('lan'));
select t.bang(t.so($$select * from public.v_lich_sale where can_id = t.can('3402')$$), 0::bigint,
              'YC3.6-NT7 3402 không còn ở lịch của Sale Lan');
select t.bang(t.so($$select * from public.can where id = t.can('3402')$$), 0::bigint,
              'YC3.6-NT7 Sale Lan không còn đọc được 3402 (chi tiết căn, tìm phòng)');
select t.ok(t.can('3402') not in (select public.my_shared_can_ids()),
            'YC3.6-NT7 KT-DB.3.3 3402 không còn trong danh sách căn Sale Lan được xem');
select t.bang(t.so($$select * from public.gia_thang where can_id = t.can('3402')$$), 0::bigint,
              'YC3.6-NT7 Sale Lan không còn đọc giá của 3402');
select t.bang(t.so($$select * from public.v_booking_cua_sale where id in (t.b('B2'), t.b('B4'))$$), 2::bigint,
              'YC3.6-NT7 B2 và B4 vẫn ở danh sách đặt phòng của Sale Lan');
select t.thoat();
select t.dang_nhap(t.id('hung'));
select t.bang(t.so($$select * from public.can where id = t.can('3402')$$), 0::bigint,
              'YC3.6-NT7 PQ17 Sale Hùng (chia sẻ tất cả căn) không còn thấy 3402');
select t.thoat();

-- Căn đã xóa: xóa lại, sửa thì bị từ chối như căn không thấy (QT5.5).
select t.dang_nhap(t.id('hoa'));
select t.bang(pg_temp.loi(pg_temp.cau_xoa(t.can('3402'))), '42501|Không tìm thấy căn',
              'YC3.6 QT5.5 xóa lại căn đã xóa thì bị từ chối như căn không thấy');
select t.thoat();

-- ===== YC3.6-NT9: không có lệnh nào bỏ ẩn căn =====
select t.ok(not exists (select 1 from pg_proc p where p.pronamespace = 'public'::regnamespace
                        and p.prosrc ~* 'an_luc\s*=\s*null'),
            'YC3.6-NT9 không hàm nào trong database đặt lại lúc ẩn của căn về trống');
select t.ok(not exists (select 1 from pg_proc p where p.pronamespace = 'public'::regnamespace
                        and p.proname ~* '(bo_an|hien_lai|khoi_phuc|phuc_hoi|bo_xoa)'),
            'YC3.6-NT9 không có lệnh bỏ ẩn, hiện lại, khôi phục căn');
select t.ok(not has_column_privilege('authenticated', 'public.can', 'an_luc', 'UPDATE')
            and not has_column_privilege('anon', 'public.can', 'an_luc', 'UPDATE'),
            'YC3.6-NT9 app không sửa thẳng lúc ẩn của căn được');
select t.dang_nhap(t.id('hoa'));
select t.loi($$update public.can set an_luc = null where id = t.can('3402')$$, '42501',
             'YC3.6-NT9 Chị Hoa không bỏ ẩn thẳng 3402 trên bảng căn được');
select t.thoat();
select t.ok(pg_temp.da_an(t.can('3402')), 'YC3.6-NT9 3402 vẫn ẩn');
