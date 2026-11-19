-- US28 · Lưu và chặn trùng (YC5.3). Viết trước migration (US28-TA1); task sau không sửa file này (CL14.5).
-- Lệnh ghi fn_tao_booking: chặn trùng bằng ràng buộc booking_khong_trung (QD6), mã lần gửi (QT5.6), yêu cầu đang chờ
-- trùng đêm thành bị từ chối (QT1.4, giả định GD11), giờ lịch đổi của căn, thông báo cho sale (YC12).
-- YC5 "Ai được làm gì": PQ7.CHU, PQ7.SALE, PQ8.SALE, PQ9, PQ4.SALE, PQ11.CHU, PQ17.CHU có test vi phạm trong file.
-- Số theo DLM.3 và bộ rút gọn (tests/db/01_helpers.sql). Ngày của phần thông báo căn đã gửi khách tính từ hôm nay,
-- vì quy tắc "Ngừng báo sau ngày nhận phòng của lần gửi" (YC8) so với ngày hôm nay theo giờ Việt Nam.
select t.fixture();

-- Số booking chưa hủy của một căn (vai chủ database).
create or replace function pg_temp.so_booking(p_can uuid) returns bigint language sql as $$
  select count(*) from public.booking where can_id = p_can and trang_thai <> 'da_huy'
$$;
-- Chạy câu lệnh bằng vai hiện tại, trả "mã lỗi|câu lỗi", hoặc 'qua' nếu không lỗi.
create or replace function pg_temp.loi(p_cau text) returns text language plpgsql as $$
declare ma text; cau text;
begin
  execute p_cau;
  return 'qua';
exception when others then
  get stacked diagnostics ma = returned_sqlstate, cau = message_text;
  return ma || '|' || cau;
end $$;
-- Ghi một booking bằng vai hiện tại, cất id vào t.ma_<ma>. Lỗi thì id rỗng (t.gt in lỗi ra NOTICE).
create or replace function pg_temp.ghi(p_ma text, p_cau text) returns void language plpgsql as $$
begin
  perform set_config('t.ma_' || lower(p_ma), coalesce(t.gt(p_cau), ''), true);
end $$;
-- Số thông báo của một người theo loại (vai chủ database).
create or replace function pg_temp.so_tb(p_nguoi uuid, p_loai text) returns bigint language sql as $$
  select count(*) from public.thong_bao where nguoi_nhan = p_nguoi and loai = p_loai
$$;

-- ===== Danh mục =====
select t.ok((select prosecdef from pg_proc where oid =
               'public.fn_tao_booking(uuid, date, date, bigint, uuid, uuid, text, text, text, bigint, int, time, time, text)'::regprocedure),
            'YC5.3 danh mục: fn_tao_booking giữ chữ ký của US27 và chạy security definer');
select t.ok(exists (select 1 from pg_constraint where conrelid = 'public.booking'::regclass
                      and conname = 'booking_khong_trung' and contype = 'x'),
            'YC5.3 QD6 danh mục: ràng buộc booking_khong_trung có trên booking');
select t.ok(not has_function_privilege('anon',
              'public.fn_tao_booking(uuid, date, date, bigint, uuid, uuid, text, text, text, bigint, int, time, time, text)', 'execute'),
            'YC5.3-NT6 PQ7.LINK người chưa đăng nhập không có quyền gọi fn_tao_booking');

-- ===== YC5.3-NT2: QT1.1-VD2, VD3 lưu được; VD1 bị từ chối với câu của bước 11 =====
select t.tao_booking('B1', t.can('1509'), '2026-10-10', '2026-10-12', 2200000);
select t.dang_nhap(t.id('hoa'));
select t.bang(pg_temp.loi($$select public.fn_tao_booking(p_can_id => t.can('1509'), p_ngay_nhan => '2026-10-12',
                                 p_ngay_tra => '2026-10-13', p_tien_phong => 900000, p_client_id => gen_random_uuid())$$),
              'qua', 'YC5.3-NT2 QT1.1-VD2 có B1 1509 10/10 → 12/10, ghi 1509 12/10 → 13/10 thì lưu được');
select t.bang(pg_temp.loi($$select public.fn_tao_booking(p_can_id => t.can('3402'), p_ngay_nhan => '2026-10-10',
                                 p_ngay_tra => '2026-10-12', p_tien_phong => 1600000, p_client_id => gen_random_uuid())$$),
              'qua', 'YC5.3-NT2 QT1.1-VD3 có B1 1509 10/10 → 12/10, ghi 3402 10/10 → 12/10 thì lưu được');
select t.bang(pg_temp.loi($$select public.fn_tao_booking(p_can_id => t.can('1509'), p_ngay_nhan => '2026-10-11',
                                 p_ngay_tra => '2026-10-13', p_tien_phong => 1800000, p_client_id => gen_random_uuid())$$),
              'P0001|Căn đã có đặt phòng trong những đêm này',
              'YC5.3-NT2 QT1.1-VD1 bước 11 ghi 1509 11/10 → 13/10 trùng đêm 11/10 thì P0001 "Căn đã có đặt phòng trong những đêm này"');
select t.khong_loi('set constraints all immediate', 'YC5.3-NT2 KT-DB.3.10 tiền từng đêm khớp tiền phòng sau các lệnh ghi');
select t.thoat();
select t.bang(pg_temp.so_booking(t.can('1509')), 2::bigint,
              'YC5.3-NT2 1509 có đúng B1 và đặt phòng 12/10 → 13/10, lệnh trùng không để lại dòng nào');
select t.bang(pg_temp.so_booking(t.can('3402')), 1::bigint, 'YC5.3-NT2 3402 có đúng một đặt phòng 10/10 → 12/10');

-- ===== YC5.3-NT3: hai lệnh ghi cùng đêm của cùng căn chạy cùng lúc thì đúng một lệnh lưu được =====
-- Hai phiên thật qua dblink (dữ liệu riêng đã commit, dọn ở cuối). Không có dblink thì hai lệnh nối tiếp.
do $nt3$
declare
  v_co_dblink boolean := exists (select 1 from pg_available_extensions where name = 'dblink');
  v_chu uuid := gen_random_uuid();
  v_can uuid := gen_random_uuid();
  v_cs text := 'dbname=' || quote_ident(current_database());
  v_vai text;
  v_pid_b int;
  v_cho boolean := false;
  v_a uuid;
  v_loi_b text;
  v_so bigint;
  i int;
begin
  if v_co_dblink then
    begin
      create extension if not exists dblink;
      perform dblink_connect('us28_dung', v_cs);
    exception when others then
      v_co_dblink := false;
      raise notice 'YC5.3-NT3: không mở được phiên dblink (%), chạy hai lệnh nối tiếp', sqlerrm;
    end;
  end if;

  if not v_co_dblink then
    perform t.dang_nhap(t.id('hoa'));
    v_loi_b := pg_temp.loi($q$select public.fn_tao_booking(p_can_id => t.can('3402'), p_ngay_nhan => '2026-12-20',
                                p_ngay_tra => '2026-12-22', p_tien_phong => 1600000, p_client_id => gen_random_uuid())$q$);
    v_loi_b := pg_temp.loi($q$select public.fn_tao_booking(p_can_id => t.can('3402'), p_ngay_nhan => '2026-12-21',
                                p_ngay_tra => '2026-12-23', p_tien_phong => 1600000, p_client_id => gen_random_uuid())$q$);
    perform t.thoat();
    perform t.bang(v_loi_b, 'P0001|Căn đã có đặt phòng trong những đêm này',
                   'YC5.3-NT3 lệnh thứ hai nhận lỗi trùng đêm của bước 11');
    perform t.bang((select count(*) from public.booking where can_id = t.can('3402') and dem && daterange('2026-12-20', '2026-12-23')),
                   1::bigint, 'YC5.3-NT3 hai lệnh cùng đêm của cùng căn: đúng một lệnh lưu được');
    return;
  end if;

  -- Dữ liệu riêng của phép thử, commit để hai phiên cùng thấy.
  perform dblink_exec('us28_dung', format(
    $q$insert into auth.users (id) values (%L) on conflict (id) do nothing;
       insert into public.profiles (id, ten, ten_hien_thi, so_dien_thoai, vai_chon) values (%L, 'Chủ thử NT3', 'Chủ thử NT3', null, 'chu_nha')
         on conflict (id) do update set vai_chon = 'chu_nha';
       insert into public.can (id, nguoi_giu, loai, ma_can) values (%L, %L, 'co_lich', 'NT3')$q$,
    v_chu, v_chu, v_can, v_chu));

  v_vai := format($q$begin; select set_config('request.jwt.claims', %L, true); set local role authenticated$q$,
                  json_build_object('sub', v_chu, 'role', 'authenticated')::text);
  perform dblink_connect('us28_a', v_cs);
  perform dblink_connect('us28_b', v_cs);
  select p into v_pid_b from dblink('us28_b', 'select pg_backend_pid()') as x(p int);
  perform dblink_exec('us28_a', v_vai);
  perform dblink_exec('us28_b', v_vai);

  -- Phiên A ghi 20/12 → 22/12, chưa commit. Phiên B ghi 21/12 → 23/12 cùng lúc.
  select id into v_a from dblink('us28_a', format(
    $q$select public.fn_tao_booking(p_can_id => %L, p_ngay_nhan => '2026-12-20', p_ngay_tra => '2026-12-22',
                                    p_tien_phong => 1600000, p_client_id => gen_random_uuid())$q$, v_can)) as x(id uuid);
  perform dblink_send_query('us28_b', format(
    $q$select public.fn_tao_booking(p_can_id => %L, p_ngay_nhan => '2026-12-21', p_ngay_tra => '2026-12-23',
                                    p_tien_phong => 1600000, p_client_id => gen_random_uuid())$q$, v_can));
  for i in 1..50 loop
    select exists (select 1 from pg_stat_activity where pid = v_pid_b and wait_event_type = 'Lock') into v_cho;
    exit when v_cho;
    perform pg_sleep(0.1);
  end loop;
  perform t.ok(v_a is not null and v_cho,
               'YC5.3-NT3 phiên A ghi xong chưa commit thì lệnh cùng đêm của phiên B phải chờ, không lưu song song');

  perform dblink_exec('us28_a', 'commit');
  -- Lấy kết quả của B, không để lỗi của B dừng file; đọc tới hết kết quả rồi mới rollback phiên B.
  select count(*) into v_so from dblink_get_result('us28_b', false) as x(id uuid);
  v_loi_b := case when v_so > 0 then 'qua' else dblink_error_message('us28_b') end;
  perform * from dblink_get_result('us28_b', false) as x(id uuid);
  perform dblink_exec('us28_b', 'rollback');
  perform t.ok(v_loi_b ilike '%Căn đã có đặt phòng trong những đêm này%',
               'YC5.3-NT3 bước 11 phiên B nhận lỗi trùng đêm "Căn đã có đặt phòng trong những đêm này" (ra: ' || v_loi_b || ')');

  select n into v_so from dblink('us28_dung', format(
    'select count(*) from public.booking where can_id = %L and trang_thai <> %L', v_can, 'da_huy')) as x(n bigint);
  perform t.bang(v_so, 1::bigint, 'YC5.3-NT3 hai lệnh cùng đêm của cùng căn chạy cùng lúc: đúng một lệnh lưu được');

  -- Dọn dữ liệu đã commit.
  perform dblink_exec('us28_dung', format(
    $q$delete from public.audit_log where ban_ghi_id in (select id from public.booking where can_id = %L);
       delete from public.booking where can_id = %L;
       delete from public.audit_log where ban_ghi_id in (select id from public.booking where can_id = %L);
       delete from public.can where id = %L;
       delete from public.profiles where id = %L;
       delete from auth.users where id = %L$q$, v_can, v_can, v_can, v_can, v_chu, v_chu));
  perform dblink_disconnect('us28_a');
  perform dblink_disconnect('us28_b');
  perform dblink_disconnect('us28_dung');
end $nt3$;

-- ===== YC5.3-NT4: gửi lại cùng mã lần gửi thì trả đặt phòng đã lưu, không ghi thứ hai (QT5.6, bước 13) =====
select set_config('t.ma_cid', gen_random_uuid()::text, true);
select t.dang_nhap(t.id('hoa'));
select pg_temp.ghi('nt4a', $$select public.fn_tao_booking(p_can_id => t.can('1509'), p_ngay_nhan => '2026-10-14', p_ngay_tra => '2026-10-15',
                                                          p_tien_phong => 900000, p_client_id => current_setting('t.ma_cid')::uuid,
                                                          p_ten_khach => 'Khách thử NT4')$$);
select pg_temp.ghi('nt4b', $$select public.fn_tao_booking(p_can_id => t.can('1509'), p_ngay_nhan => '2026-10-14', p_ngay_tra => '2026-10-15',
                                                          p_tien_phong => 900000, p_client_id => current_setting('t.ma_cid')::uuid,
                                                          p_ten_khach => 'Khách thử NT4')$$);
select t.thoat();
select t.ok(t.b('nt4a') is not null and t.b('nt4b') = t.b('nt4a'),
            'YC5.3-NT4 QT5.6 gửi lại cùng mã lần gửi (đêm trùng chính nó) thì nhận về đúng đặt phòng đã lưu, không lỗi trùng');
select t.bang((select count(*) from public.booking where client_id = current_setting('t.ma_cid')::uuid), 1::bigint,
              'YC5.3-NT4 QT5.6 không có đặt phòng thứ hai cho cùng mã lần gửi');
select t.bang((select count(*) from public.booking_rieng where booking_id = t.b('nt4a')), 1::bigint,
              'YC5.3-NT4 gửi lại không ghi thêm phần riêng của chủ nhà');
-- Người khác gửi cùng mã lần gửi không nhận được đặt phòng của Chị Hoa (PQ7.CHU).
select t.dang_nhap(t.id('tuan'));
select t.bang(split_part(pg_temp.loi($$select public.fn_tao_booking(p_can_id => t.can('1509'), p_ngay_nhan => '2026-10-14',
                                          p_ngay_tra => '2026-10-15', p_tien_phong => 900000,
                                          p_client_id => current_setting('t.ma_cid')::uuid)$$), '|', 1),
              '42501', 'YC5.3-NT4 PQ7.CHU Anh Tuấn gửi cùng mã lần gửi của Chị Hoa thì bị từ chối quyền, không nhận đặt phòng của Chị Hoa');
select t.thoat();

-- ===== YC5.3-NT5: yêu cầu đang chờ có đêm trùng thành bị từ chối khi chủ tự ghi (QT1.4, giả định GD11) =====
select t.tao_yeu_cau('Y_LAN', t.can('1509'), t.id('lan'), '2026-10-17', '2026-10-19');
select t.tao_yeu_cau('Y_HUNG_SAU', t.can('1509'), t.id('hung'), '2026-10-19', '2026-10-20');   -- ngày nhận = ngày trả mới: không trùng
select t.tao_yeu_cau('Y_HUNG_3402', t.can('3402'), t.id('hung'), '2026-10-17', '2026-10-19');  -- khác căn
insert into public.yeu_cau_rieng (yeu_cau_id, sale_id, gia_ban_dem, ten_khach, sdt_khach)
values (t.b('Y_LAN'), t.id('lan'), '{1100000,1500000}', 'Khách của Lan', '0900000066');

-- Lệnh ghi bị từ chối vì trùng thì yêu cầu đang chờ giữ nguyên.
select t.tao_booking('B_CHAN', t.can('1509'), '2026-10-16', '2026-10-17', 900000);
select t.dang_nhap(t.id('hoa'));
select t.bang(pg_temp.loi($$select public.fn_tao_booking(p_can_id => t.can('1509'), p_ngay_nhan => '2026-10-16',
                                 p_ngay_tra => '2026-10-19', p_tien_phong => 2700000, p_client_id => gen_random_uuid())$$),
              'P0001|Căn đã có đặt phòng trong những đêm này', 'YC5.3-NT5 lệnh ghi trùng đêm bị từ chối');
select t.thoat();
select t.bang((select trang_thai from public.yeu_cau_dat_phong where id = t.b('Y_LAN')), 'cho',
              'YC5.3-NT5 lệnh ghi bị từ chối vì trùng thì yêu cầu của Sale Lan vẫn đang chờ');

select t.dang_nhap(t.id('hoa'));
select pg_temp.ghi('nt5', $$select public.fn_tao_booking(p_can_id => t.can('1509'), p_ngay_nhan => '2026-10-18', p_ngay_tra => '2026-10-19',
                                                         p_tien_phong => 900000, p_client_id => gen_random_uuid())$$);
select t.thoat();
select t.ok(t.b('nt5') is not null, 'YC5.3-NT5 Chị Hoa tự ghi 1509 18/10 → 19/10 thì lưu được (yêu cầu đang chờ không chiếm đêm)');
select t.bang((select trang_thai from public.yeu_cau_dat_phong where id = t.b('Y_LAN')), 'bi_tu_choi',
              'YC5.3-NT5 QT1.4 GD11 yêu cầu của Sale Lan 1509 17/10 → 19/10 thành bị từ chối');
select t.ok((select tra_loi_luc is not null from public.yeu_cau_dat_phong where id = t.b('Y_LAN')),
            'YC5.3-NT5 yêu cầu bị từ chối có lúc trả lời');
select t.bang((select trang_thai from public.yeu_cau_dat_phong where id = t.b('Y_HUNG_SAU')), 'cho',
              'YC5.3-NT5 QT2.1 yêu cầu 1509 19/10 → 20/10 (19/10 là ngày trả của đặt phòng mới) vẫn đang chờ');
select t.bang((select trang_thai from public.yeu_cau_dat_phong where id = t.b('Y_HUNG_3402')), 'cho',
              'YC5.3-NT5 yêu cầu của căn khác (3402) cùng ngày vẫn đang chờ');
-- YC12 "Yêu cầu bị từ chối" (sinh ở YC5.3): Sale Lan có đúng một thông báo, chép theo quyền người nhận.
select t.bang((select count(*) from public.thong_bao where nguoi_nhan = t.id('lan') and doi_tuong_id = t.b('Y_LAN')), 1::bigint,
              'YC5.3-NT5 YC12 Sale Lan có đúng một thông báo yêu cầu bị từ chối');
select t.ok(not exists (select 1 from public.thong_bao tb, jsonb_each_text(tb.noi_dung) j
                        where tb.nguoi_nhan = t.id('lan') and tb.doi_tuong_id = t.b('Y_LAN')
                          and (j.key ~* '(ten_khach|sdt|tien|gia)' or j.value ilike '%Khách của Lan%' or j.value ilike '%0900000066%')),
            'YC5.3-NT5 YC12 PQ19 thông báo của Sale Lan không có tên khách, số khách, tiền, giá');
select t.bang((select count(*) from public.thong_bao where nguoi_nhan in (t.id('hoa'), t.id('hung'))
                 and doi_tuong_id = t.b('Y_LAN')), 0::bigint,
              'YC5.3-NT5 YC12 không báo cho chính Chị Hoa, không báo Sale Hùng về yêu cầu của Lan');
-- PQ11.CHU: chủ nhà không đọc giá bán, khách của sale trong yêu cầu, kể cả yêu cầu vừa bị từ chối.
select t.dang_nhap(t.id('hoa'));
select t.bang(t.dem($$select * from public.yeu_cau_rieng where yeu_cau_id = t.b('Y_LAN')$$), 0::bigint,
              'YC5.3-NT5 PQ11.CHU Chị Hoa không đọc giá bán, khách của Sale Lan trong yêu cầu bị từ chối');
select t.thoat();
select t.bang(pg_temp.so_tb(t.id('hung'), 'yeu_cau_bi_tu_choi') + pg_temp.so_tb(t.id('lan'), 'yeu_cau_bi_tu_choi'), 1::bigint,
              'YC5.3-NT5 YC12 loại thông báo yeu_cau_bi_tu_choi chỉ có một dòng (của Sale Lan)');

-- ===== YC5.3-NT6: Anh Tuấn, Sale Hùng (dù được chia sẻ 1509) gửi lệnh ghi vào 1509 thì bị từ chối, lịch không đổi =====
update public.can set lich_doi_luc = '2026-01-01 00:00+07' where id = t.can('1509');
select set_config('t.ma_so_1509', pg_temp.so_booking(t.can('1509'))::text, true);
select t.dang_nhap(t.id('tuan'));
select t.bang(split_part(pg_temp.loi($$select public.fn_tao_booking(p_can_id => t.can('1509'), p_ngay_nhan => '2026-10-25',
                                          p_ngay_tra => '2026-10-26', p_tien_phong => 900000, p_client_id => gen_random_uuid())$$), '|', 1),
              '42501', 'YC5.3-NT6 PQ7.CHU Anh Tuấn ghi đặt phòng vào 1509 của Chị Hoa thì bị từ chối quyền');
select t.dang_nhap(t.id('hung'));
select t.bang(split_part(pg_temp.loi($$select public.fn_tao_booking(p_can_id => t.can('1509'), p_ngay_nhan => '2026-10-25',
                                          p_ngay_tra => '2026-10-26', p_tien_phong => 900000, p_client_id => gen_random_uuid())$$), '|', 1),
              '42501', 'YC5.3-NT6 PQ7.SALE Sale Hùng (được chia sẻ 1509) ghi đặt phòng vào 1509 thì bị từ chối quyền');
select t.bang(split_part(pg_temp.loi($$select public.fn_tao_booking(p_can_id => t.can('1509'), p_ngay_nhan => '2026-10-25',
                                          p_ngay_tra => '2026-10-26', p_tien_phong => 900000, p_sale_id => t.id('hung'))$$), '|', 1),
              '42501', 'YC5.3-NT6 PQ7.SALE Sale Hùng tự ghi mình là người đặt vào 1509 thì bị từ chối quyền');
select t.dang_nhap(t.id('lan'));
select t.bang(split_part(pg_temp.loi($$select public.fn_tao_booking(p_can_id => t.can('1509'), p_ngay_nhan => '2026-10-25',
                                          p_ngay_tra => '2026-10-26', p_tien_phong => 900000)$$), '|', 1),
              '42501', 'YC5.3-NT6 PQ7.SALE Sale Lan (được chia sẻ 1509) ghi đặt phòng vào 1509 thì bị từ chối quyền');
select t.khach();
select t.ok(pg_temp.loi($$select public.fn_tao_booking(p_can_id => t.can('1509'), p_ngay_nhan => '2026-10-25',
                             p_ngay_tra => '2026-10-26', p_tien_phong => 900000)$$) <> 'qua',
            'YC5.3-NT6 PQ7.LINK người chưa đăng nhập gọi lệnh ghi thì bị từ chối');
select t.dang_nhap(t.id('hung'));
select t.ok(pg_temp.loi($$insert into public.booking (can_id, ngay_nhan, ngay_tra, nguon, tao_boi, tien_phong)
                          values (t.can('1509'), '2026-10-25', '2026-10-26', 'chu_ghi', t.id('hoa'), 900000)$$) <> 'qua',
            'YC5.3-NT6 PQ7.SALE Sale Hùng ghi thẳng vào bảng booking thì bị từ chối');
select t.thoat();
select t.bang(pg_temp.so_booking(t.can('1509'))::text, current_setting('t.ma_so_1509'),
              'YC5.3-NT6 sau các lệnh bị từ chối lịch 1509 không đổi (số đặt phòng giữ nguyên)');
select t.bang((select lich_doi_luc from public.can where id = t.can('1509')), '2026-01-01 00:00+07'::timestamptz,
              'YC5.3-NT6 sau các lệnh bị từ chối giờ lịch đổi của 1509 giữ nguyên');
-- PQ17.CHU: chủ nhà chỉ ghi cho sale đang kết nối và được xem căn đó.
select t.dang_nhap(t.id('hoa'));
select t.bang(pg_temp.loi($$select public.fn_tao_booking(p_can_id => t.can('3402'), p_ngay_nhan => '2026-10-25',
                                 p_ngay_tra => '2026-10-26', p_tien_phong => 1100000, p_sale_id => t.id('lan'))$$),
              'P0001|Sale này không được xem căn này', 'YC5.3-NT6 PQ17.CHU Chị Hoa ghi 3402 cho Sale Lan (chỉ xem 1509) thì bị từ chối');
select t.bang(pg_temp.loi($$select public.fn_tao_booking(p_can_id => t.can('3402'), p_ngay_nhan => '2026-10-25',
                                 p_ngay_tra => '2026-10-26', p_tien_phong => 1100000, p_sale_id => t.id('nga'))$$),
              'P0001|Sale này không đang kết nối với bạn', 'YC5.3-NT6 PQ17.CHU Chị Hoa ghi cho Sale Nga (chưa kết nối) thì bị từ chối');
select t.thoat();

-- ===== YC5.3-NT7: Sale Hùng chỉ thấy đêm kín của đặt phòng khách lẻ Chị Hoa vừa ghi =====
select t.dang_nhap(t.id('hoa'));
select pg_temp.ghi('nt7', $$select public.fn_tao_booking(p_can_id => t.can('1509'), p_ngay_nhan => '2026-10-27', p_ngay_tra => '2026-10-29',
                                                         p_tien_phong => 1800000, p_client_id => gen_random_uuid(),
                                                         p_ten_khach => 'Khách lẻ NT7', p_sdt_khach => '0900000055', p_so_khach => 4,
                                                         p_trang_thai_tien => 'da_coc_con_thu', p_tien_coc => 500000)$$);
select t.thoat();
select t.ok(t.b('nt7') is not null, 'YC5.3-NT7 Chị Hoa ghi 1509 27/10 → 29/10 khách lẻ có tên, số, số khách, cọc thì lưu được');
select t.dang_nhap(t.id('hung'));
select t.bang(t.dem($$select * from public.booking where id = t.b('nt7')$$), 0::bigint,
              'YC5.3-NT7 KT-DB.3.5 PQ8.SALE Sale Hùng không đọc bảng booking (không thấy tiền phòng, tiền cọc)');
select t.bang(t.dem($$select * from public.booking_dem where booking_id = t.b('nt7')$$), 0::bigint,
              'YC5.3-NT7 PQ8.SALE Sale Hùng không đọc tiền từng đêm của đặt phòng khách lẻ');
select t.bang(t.dem($$select * from public.booking_rieng where booking_id = t.b('nt7')$$), 0::bigint,
              'YC5.3-NT7 PQ9.SALE Sale Hùng không đọc tên, số, số khách của khách Chị Hoa nhập');
select t.bang(t.dem($$select * from public.v_booking_cua_sale where id = t.b('nt7')$$), 0::bigint,
              'YC5.3-NT7 PQ7.SALE đặt phòng khách lẻ không có trong đặt phòng của Sale Hùng');
select t.bang(t.gt($$select string_agg(dem::text, ',' order by dem) from public.v_lich_sale
                     where can_id = t.can('1509') and dem between '2026-10-27' and '2026-10-29'$$),
              '2026-10-27,2026-10-28', 'YC5.3-NT7 PQ4.SALE Sale Hùng thấy đêm 27/10, 28/10 của 1509 kín qua lịch của sale');
select t.ok(not exists (select 1 from information_schema.columns where table_schema = 'public' and table_name = 'v_lich_sale'
                          and column_name not in ('can_id', 'dem')),
            'YC5.3-NT7 PQ4.SALE lịch của sale chỉ có căn và đêm, không có người đặt, tiền, khách');
select t.thoat();
select t.dang_nhap(t.id('nga'));
select t.bang(t.dem($$select * from public.v_lich_sale where can_id = t.can('1509')$$), 0::bigint,
              'YC5.3-NT7 PQ4.SALE Sale Nga (chưa kết nối) không thấy đêm kín của 1509');
select t.thoat();
select t.dang_nhap(t.id('tuan'));
select t.bang(t.dem($$select * from public.booking_rieng where booking_id = t.b('nt7')$$)
              + t.dem($$select * from public.booking where id = t.b('nt7')$$), 0::bigint,
              'YC5.3-NT7 PQ9.CHU Anh Tuấn không đọc đặt phòng, khách của Chị Hoa');
select t.thoat();

-- ===== YC5.3 bước 9: cập nhật giờ lịch đổi của căn =====
update public.can set lich_doi_luc = '2026-01-01 00:00+07' where id = t.can('3402');
select t.dang_nhap(t.id('hoa'));
select pg_temp.ghi('lich', $$select public.fn_tao_booking(p_can_id => t.can('3402'), p_ngay_nhan => '2026-11-10', p_ngay_tra => '2026-11-11',
                                                          p_tien_phong => 800000, p_client_id => gen_random_uuid())$$);
select t.thoat();
select t.ok((select lich_doi_luc > '2026-01-01 00:00+07' from public.can where id = t.can('3402')),
            'YC5.3 bước 9 ghi đặt phòng thì cập nhật giờ lịch đổi của căn 3402');
select t.bang((select lich_doi_luc from public.can where id = t.can('1509')), '2026-01-01 00:00+07'::timestamptz,
              'YC5.3 bước 9 ghi đặt phòng 3402 không đổi giờ lịch đổi của căn khác (1509)');

-- ===== YC5.3 bước 9, YC12, YC8 quy tắc "Báo căn đã gửi có người đặt" =====
-- Sale Hùng đã gửi 1509 cho khách các đêm [hôm nay + 40, hôm nay + 43). Sale Lan gửi 1509 cùng đêm.
-- Một lần gửi cũ đã qua ngày nhận phòng.
insert into public.lan_gui_khach (id, sale_id, can_id, dem)
values ('00000000-0000-0000-0028-000000000001', t.id('hung'), t.can('1509'),
        daterange(public.local_today() + 40, public.local_today() + 43)),
       ('00000000-0000-0000-0028-000000000002', t.id('lan'), t.can('1509'),
        daterange(public.local_today() + 40, public.local_today() + 43)),
       ('00000000-0000-0000-0028-000000000003', t.id('hung'), t.can('1509'),
        daterange(public.local_today() - 3, public.local_today() + 45));
update public.cai_dat_rieng set thong_bao_tat = '{}' where nguoi_id = t.id('hung');
select set_config('t.ma_nhan', (public.local_today() + 41)::text, true);
select t.dang_nhap(t.id('hoa'));
select pg_temp.ghi('gui1', $$select public.fn_tao_booking(p_can_id => t.can('1509'), p_ngay_nhan => current_setting('t.ma_nhan')::date,
                                                          p_ngay_tra => current_setting('t.ma_nhan')::date + 1, p_tien_phong => 900000,
                                                          p_client_id => gen_random_uuid(), p_ten_khach => 'Khách lẻ gửi')$$);
select t.thoat();
select t.bang(pg_temp.so_tb(t.id('hung'), 'can_da_gui_co_nguoi_dat'), 1::bigint,
              'YC5.3 bước 9 YC8.1-NT8 Sale Hùng có đúng một thông báo căn đã gửi khách vừa có người đặt (lần gửi đã qua ngày nhận không báo)');
select t.bang(pg_temp.so_tb(t.id('lan'), 'can_da_gui_co_nguoi_dat'), 1::bigint,
              'YC5.3 bước 9 YC8.1-NT8 Sale Lan có đúng một thông báo căn đã gửi khách vừa có người đặt');
select t.bang(pg_temp.so_tb(t.id('hoa'), 'can_da_gui_co_nguoi_dat'), 0::bigint,
              'YC5.3 bước 9 YC12 Chị Hoa (người ghi) không có thông báo căn đã gửi khách');
select t.ok(not exists (select 1 from public.thong_bao tb, jsonb_each_text(tb.noi_dung) j
                        where tb.loai = 'can_da_gui_co_nguoi_dat'
                          and (j.key ~* '(ten_khach|sdt|tien|gia|nguoi_dat|ten_chu)' or j.value ilike '%Khách lẻ gửi%')),
            'YC5.3 bước 9 YC8 QD11 thông báo căn đã gửi khách chỉ có căn và ngày, không có người đặt, khách, tiền');
-- Đặt phòng thứ hai cùng chiếm đêm của lần gửi đó: không báo thêm.
select t.dang_nhap(t.id('hoa'));
select pg_temp.ghi('gui2', $$select public.fn_tao_booking(p_can_id => t.can('1509'), p_ngay_nhan => current_setting('t.ma_nhan')::date - 1,
                                                          p_ngay_tra => current_setting('t.ma_nhan')::date, p_tien_phong => 900000,
                                                          p_client_id => gen_random_uuid())$$);
select t.thoat();
select t.ok(t.b('gui2') is not null and pg_temp.so_tb(t.id('hung'), 'can_da_gui_co_nguoi_dat') = 1,
            'YC5.3 bước 9 YC8.1-NT11 đặt phòng thứ hai cùng chiếm đêm của lần gửi thì không có thông báo thứ hai');

-- ===== YC5.3 bước 9, YC12 "Chủ nhà ghi đặt phòng cho sale" =====
select set_config('t.ma_nhan2', (public.local_today() + 60)::text, true);
insert into public.lan_gui_khach (id, sale_id, can_id, dem)
values ('00000000-0000-0000-0028-000000000004', t.id('hung'), t.can('3402'),
        daterange(public.local_today() + 60, public.local_today() + 62));
select t.dang_nhap(t.id('hoa'));
select pg_temp.ghi('cho_hung', $$select public.fn_tao_booking(p_can_id => t.can('3402'), p_ngay_nhan => current_setting('t.ma_nhan2')::date,
                                                              p_ngay_tra => current_setting('t.ma_nhan2')::date + 2, p_tien_phong => 1600000,
                                                              p_client_id => gen_random_uuid(), p_sale_id => t.id('hung'))$$);
select t.thoat();
select t.bang((select count(*) from public.thong_bao where nguoi_nhan = t.id('hung') and loai = 'chu_ghi_dat_phong_cho_sale'
                 and doi_tuong_id = t.b('cho_hung')), 1::bigint,
              'YC5.3 bước 9 YC12 Sale Hùng có một thông báo "Chị Hoa ghi đặt phòng cho bạn"');
select t.bang((select count(*) from public.thong_bao where nguoi_nhan = t.id('hung') and loai = 'can_da_gui_co_nguoi_dat'
                 and noi_dung ->> 'ma_can' = '3402'), 0::bigint,
              'YC5.3 bước 9 YC8.1-NT9 đặt phòng có Sale Hùng đứng tên thì Hùng không có thông báo căn đã gửi khách');
select t.ok(not exists (select 1 from public.thong_bao tb, jsonb_each_text(tb.noi_dung) j
                        where tb.loai = 'chu_ghi_dat_phong_cho_sale' and j.key ~* '(ten_khach|sdt|tien_coc|gia_ban)'),
            'YC5.3 bước 9 YC12 QD11 thông báo ghi đặt phòng cho sale không có khách, tiền cọc, giá bán');
select t.bang((select count(*) from public.thong_bao where nguoi_nhan <> t.id('hung') and loai = 'chu_ghi_dat_phong_cho_sale'), 0::bigint,
              'YC5.3 bước 9 YC12 thông báo ghi đặt phòng cho sale chỉ tới sale đứng tên');
-- Công tắc chặn ghi (YC12): Hùng tắt loại này thì không có thông báo.
update public.cai_dat_rieng set thong_bao_tat = '{chu_ghi_dat_phong_cho_sale}' where nguoi_id = t.id('hung');
select t.dang_nhap(t.id('hoa'));
select pg_temp.ghi('cho_hung2', $$select public.fn_tao_booking(p_can_id => t.can('3402'), p_ngay_nhan => current_setting('t.ma_nhan2')::date + 5,
                                                               p_ngay_tra => current_setting('t.ma_nhan2')::date + 6, p_tien_phong => 800000,
                                                               p_client_id => gen_random_uuid(), p_sale_id => t.id('hung'))$$);
select t.thoat();
select t.ok(t.b('cho_hung2') is not null
            and not exists (select 1 from public.thong_bao where doi_tuong_id = t.b('cho_hung2')),
            'YC5.3 bước 9 YC12 Sale Hùng đã tắt "Chủ nhà ghi đặt phòng cho bạn" thì không có thông báo');
