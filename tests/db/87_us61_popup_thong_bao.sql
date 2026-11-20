-- US61 · Popup thông báo mới (YC12.1). Lệnh fn_mo_app trả thông báo mới của chính người gọi và ghi mốc lần mở mới trong một lần.
-- YC12.1-NT1 đến NT7, YC12 "Quy tắc của nhóm" (Thông báo mới, Không báo cho chính mình, Chép lúc ghi theo quyền người nhận), PQ19.
-- Viết trước migration (US61-TA1, CL14.5). Dòng thông báo ở NT1 đến NT5 chèn thẳng với tao_luc đặt tay (nội dung do từng YC sinh ra đã
-- có test riêng); NT6, NT7 chạy luồng thật. Test chạy trong một giao dịch nên now() không đổi: dòng "tạo sau lúc mở" dùng clock_timestamp().
select t.fixture();

create or replace function pg_temp.dat_moc(p_nguoi uuid, p_moc timestamptz) returns void language sql security definer as $$
  update public.profiles set mo_app_luc = p_moc where id = p_nguoi
$$;
create or replace function pg_temp.moc(p_nguoi uuid) returns timestamptz language sql security definer as $$
  select mo_app_luc from public.profiles where id = p_nguoi
$$;
create or replace function pg_temp.them_tb(p_nguoi uuid, p_loai text, p_tao timestamptz, p_ten text default 'ghi') returns uuid
language sql security definer as $$
  insert into public.thong_bao (nguoi_nhan, loai, noi_dung, doi_tuong_loai, tao_luc)
  values (p_nguoi, p_loai, jsonb_build_object('ten', p_ten), 'booking', p_tao) returning id
$$;
-- Số dòng fn_mo_app trả cho người đang đăng nhập, và mã các dòng.
create or replace function pg_temp.mo(p_nguoi uuid) returns text[] language plpgsql as $$
declare r text[];
begin
  perform t.dang_nhap(p_nguoi);
  select coalesce(array_agg(x.noi_dung ->> 'ten' order by x.tao_luc desc), '{}') into r from public.fn_mo_app() x;
  perform t.thoat();
  return r;
end $$;

select t.ok(exists (select 1 from pg_proc where proname = 'fn_mo_app' and pronamespace = 'public'::regnamespace and prosecdef),
            'YC12.1 danh mục: có lệnh fn_mo_app chạy security definer');
select t.ok(not exists (select 1 from pg_proc p where p.proname = 'fn_mo_app' and p.pronamespace = 'public'::regnamespace
                        and has_function_privilege('anon', p.oid, 'execute')),
            'YC12.1 danh mục PQ19: người chưa đăng nhập không gọi được fn_mo_app');
select t.ok(not exists (select 1 from information_schema.parameters p
                        where p.specific_schema = 'public' and p.specific_name like 'fn_mo_app%' and p.parameter_mode = 'IN'),
            'YC12.1 danh mục PQ19: lệnh không nhận mã người, chỉ đọc của chính người gọi');
select t.khach();
select t.loi($$select * from public.fn_mo_app()$$, '42501', 'YC12.1 PQ19.KHACH người chưa đăng nhập gọi fn_mo_app bị từ chối');
select t.thoat();

-- ===== YC12.1-NT1: Hùng mở lúc 10:30, Chị Hoa sửa B1 lúc 10:15 =====
select pg_temp.dat_moc(t.id('hung'), now() - interval '1 hour 30 minutes');          -- lần mở trước 09:00
select pg_temp.them_tb(t.id('hung'), 'chu_sua_dat_phong', now() - interval '15 minutes', 'Sửa B1');
select t.bang(pg_temp.mo(t.id('hung')), array['Sửa B1'], 'YC12.1-NT1 popup có dòng Chị Hoa sửa B1, một dòng');
select t.ok(pg_temp.moc(t.id('hung')) >= now(), 'YC12.1 NT1 bước 1 lệnh mở app ghi mốc lần mở mới');

-- ===== YC12.1-NT3: không có thông báo nào tạo sau lần mở trước =====
select t.bang(pg_temp.mo(t.id('hung')), '{}'::text[], 'YC12.1-NT3 mở lại mà không có gì mới thì không có popup');

-- ===== YC12.1-NT2: mở lúc 21:00 hôm trước, sửa 23:00, mở lại 08:00 =====
delete from public.thong_bao where nguoi_nhan = t.id('hung');
select pg_temp.dat_moc(t.id('hung'), now() - interval '11 hours');                    -- 21:00 hôm trước so với 08:00
select pg_temp.them_tb(t.id('hung'), 'chu_sua_dat_phong', now() - interval '9 hours', 'Sửa 23:00');
select pg_temp.them_tb(t.id('hung'), 'chu_sua_dat_phong', now() - interval '12 hours', 'Trước lúc mở');
select t.bang(pg_temp.mo(t.id('hung')), array['Sửa 23:00'], 'YC12.1-NT2 dòng tạo hôm trước sau lần mở vẫn có, dòng tạo trước lần mở thì không');

-- ===== YC12.1-NT4: đã xem popup, rời app, Chị Hoa sửa B1, Hùng quay lại từ nền =====
select pg_temp.them_tb(t.id('hung'), 'chu_sua_dat_phong', clock_timestamp(), 'Sửa lại B1');
select t.bang(pg_temp.mo(t.id('hung')), array['Sửa lại B1'], 'YC12.1-NT4 quay lại từ nền thì popup hiện dòng mới');
select t.bang(pg_temp.mo(t.id('hung')), '{}'::text[], 'YC12.1-NT4 lần quay lại kế tiếp không còn gì mới');

-- ===== YC12.1-NT5: đóng popup thì thông báo vẫn còn (chưa đọc) =====
select t.bang(t.so(format($$select * from public.thong_bao where nguoi_nhan = %L and doc_luc is null$$, t.id('hung'))), 3::bigint,
              'YC12.1-NT5 đóng popup không đánh dấu đã đọc: cả 3 dòng vẫn chưa đọc, đủ cho P13');
select t.bang(pg_temp.mo(t.id('hung')), '{}'::text[], 'YC12.1-NT5 mở lại app mà không có gì mới thì không có popup');

-- Dòng đã đọc (chạm ở nơi khác) không lên popup.
select pg_temp.them_tb(t.id('hung'), 'chu_sua_dat_phong', clock_timestamp(), 'Đã đọc');
update public.thong_bao set doc_luc = now() where nguoi_nhan = t.id('hung') and noi_dung ->> 'ten' = 'Đã đọc';
select t.bang(pg_temp.mo(t.id('hung')), '{}'::text[], 'YC12.1 dòng đã đọc rồi thì không lên popup');

-- PQ19: người khác không thấy dòng của Hùng và mốc của họ độc lập.
delete from public.thong_bao where nguoi_nhan = t.id('hung');
select pg_temp.dat_moc(t.id('hung'), now() - interval '1 hour');
select pg_temp.dat_moc(t.id('lan'), now() - interval '1 hour');
select pg_temp.them_tb(t.id('hung'), 'chu_sua_dat_phong', clock_timestamp(), 'Của Hùng');
select t.bang(pg_temp.mo(t.id('lan')), '{}'::text[], 'YC12.1 PQ19.SALE Sale Lan mở app không thấy dòng của Hùng');
select t.bang(pg_temp.mo(t.id('hung')), array['Của Hùng'], 'YC12.1 PQ19 mốc của Lan không làm mất dòng của Hùng');

-- Mốc trống (lần mở đầu tiên): không có popup (chưa có "lần trước" để so), rồi ghi mốc; dòng chưa đọc vẫn ở P13.
select pg_temp.dat_moc(t.id('nga'), null);
select pg_temp.them_tb(t.id('nga'), 'chu_dong_y_ket_noi', now() - interval '3 days', 'Cũ chưa đọc');
select t.bang(pg_temp.mo(t.id('nga')), '{}'::text[], 'YC12.1 (giả định GD33) lần mở đầu chưa có mốc: không có popup, chỉ ghi mốc');
select t.ok(pg_temp.moc(t.id('nga')) is not null, 'YC12.1 lần mở đầu ghi mốc');

-- ===== YC12.1-NT6: Lan bị từ chối vì Chị Hoa nhận yêu cầu của Hùng trùng đêm =====
insert into public.gia_thang (can_id, thang, gia_thuong, gia_cuoi_tuan)
select t.can('1509'), (date_trunc('month', public.local_today()) + make_interval(months => m))::date, 900000, 1300000
from generate_series(0, 4) m on conflict (can_id, thang) do nothing;
select set_config('t.nhan', (public.local_today() + 60)::text, true);
select set_config('t.tra', (public.local_today() + 62)::text, true);
create or replace function pg_temp.gui(p_nguoi uuid) returns uuid language plpgsql as $$
declare v jsonb;
begin
  perform t.dang_nhap(p_nguoi);
  select public.fn_gui_yeu_cau(t.can('1509'), current_setting('t.nhan')::date, current_setting('t.tra')::date, null, gen_random_uuid()) into v;
  perform t.thoat();
  return (v ->> 'id')::uuid;
exception when others then
  perform t.thoat();
  raise notice 'lỗi: % (fn_gui_yeu_cau)', sqlerrm;
  return null;
end $$;
select set_config('t.y_hung', coalesce(pg_temp.gui(t.id('hung'))::text, ''), true);
select set_config('t.y_lan', coalesce(pg_temp.gui(t.id('lan'))::text, ''), true);
select t.ok(current_setting('t.y_hung') <> '' and current_setting('t.y_lan') <> '', 'YC12.1-NT6 chuẩn bị: Hùng và Lan cùng gửi yêu cầu trùng đêm');
select t.dang_nhap(t.id('hoa'));
select public.fn_chap_nhan_yeu_cau(current_setting('t.y_hung')::uuid);
select t.thoat();
create or replace function pg_temp.noi_dung(p_nguoi uuid, p_loai text) returns text language sql security definer as $$
  select string_agg(noi_dung::text, ' ') from public.thong_bao where nguoi_nhan = p_nguoi and loai = p_loai
$$;
select t.ok(pg_temp.noi_dung(t.id('lan'), 'yeu_cau_bi_tu_choi') is not null, 'YC12.1-NT6 Lan có thông báo bị từ chối');
select t.ok(pg_temp.noi_dung(t.id('lan'), 'yeu_cau_bi_tu_choi') !~* '(Hùng|gia_ban|khach|0900000003)',
            'YC12.1-NT6 PQ19.SALE thông báo của Lan không có tên Hùng, giá bán, tên khách');
select t.ok(pg_temp.noi_dung(t.id('hoa'), 'yeu_cau_moi') is not null
            and pg_temp.noi_dung(t.id('hoa'), 'yeu_cau_moi') !~* '(gia_ban|tien_cong|muc_cong|chenh)',
            'YC12.1-NT6 PQ19.CHU thông báo "Sale đặt phòng mới" của Chị Hoa có giá chủ, không có giá bán');

-- ===== YC12.1-NT7: Chị Hoa tự sửa đặt phòng khách lẻ của mình thì không ai có thông báo =====
select t.tao_booking('B7', t.can('1509'), public.local_today() + 90, public.local_today() + 92, 1800000);
create temp table tb_truoc as select count(*) n from public.thong_bao;
grant select on tb_truoc to public;
select t.dang_nhap(t.id('hoa'));
select public.fn_sua_booking(p_booking_id => t.b('B7'), p_sua_luc => (select sua_luc from public.booking where id = t.b('B7')),
                             p_can_id => t.can('1509'), p_ngay_nhan => public.local_today() + 91, p_ngay_tra => public.local_today() + 93,
                             p_tien_phong => 1700000, p_trang_thai_tien => 'chua_coc');
select t.thoat();
select t.bang(t.so('select * from public.thong_bao'), (select n from tb_truoc), 'YC12.1-NT7 Chị Hoa tự sửa đặt phòng khách lẻ: không ai có thêm thông báo');
