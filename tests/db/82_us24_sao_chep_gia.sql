-- US24 · Sao chép giá sang căn khác (YC4.5). Lệnh fn_sao_chep_gia.
-- YC4.5-NT2 đến NT6, YC4 Quy tắc "Sao chép thay giá có sẵn", YC4 "Ai được làm gì", YC4 "Dữ liệu", QT5.5, PQ5.
-- Năm sao chép là năm đang xem (YC4-H1, Claude tự chốt). Viết trước migration (US24-TA1, CL14.5): task sau không sửa file này.
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

create or replace function pg_temp.dai(p_can uuid) returns text language sql stable as $$
  select coalesce(string_agg(tu_ngay::text || '..' || den_ngay::text || ' ' || coalesce(ten, '-') || ' ' || gia::text || ' '
                             || la_ngay_le::text, '; ' order by tu_ngay), '')
  from public.gia_dip where can_id = p_can
$$;

-- Chạy lệnh sao chép bằng vai hiện tại, cất kết quả (jsonb) vào t.kq.
create or replace function pg_temp.chep(p_cau text) returns void language plpgsql as $$
declare v jsonb;
begin
  execute p_cau into v;
  perform set_config('t.kq', coalesce(v::text, 'null'), true);
exception when others then
  perform set_config('t.kq', 'loi: ' || sqlerrm, true);
end $$;

-- ===== Danh mục =====
select t.ok(exists (select 1 from pg_proc where proname = 'fn_sao_chep_gia' and pronamespace = 'public'::regnamespace and prosecdef),
            'YC4.5 bước 5 danh mục: có lệnh fn_sao_chep_gia chạy security definer');
select t.ok(exists (select 1 from pg_proc p where p.proname = 'fn_sao_chep_gia' and p.pronamespace = 'public'::regnamespace)
            and not exists (select 1 from pg_proc p where p.proname = 'fn_sao_chep_gia' and p.pronamespace = 'public'::regnamespace
                            and has_function_privilege('anon', p.oid, 'execute')),
            'YC4.5-NT6 danh mục: người chưa đăng nhập không gọi được fn_sao_chep_gia');

-- Dựng: 3402 có giá tháng 6 đến 12/2026 (800.000đ / 1.100.000đ), dịp 24/10 – 25/10. 1509 có giá tháng 1/2026, tháng 10 đến 12.
insert into public.gia_thang (can_id, thang, gia_thuong, gia_cuoi_tuan)
select t.can('3402'), m::date, 800000, 1100000 from generate_series('2026-06-01'::date, '2026-09-01', interval '1 month') m;
insert into public.gia_thang (can_id, thang, gia_thuong, gia_cuoi_tuan) values (t.can('1509'), '2026-01-01', 600000, 700000);

-- ===== YC4.5-NT2, NT3: chỉ chọn "Giá theo tháng", sao chép 3402 sang 1509 =====
insert into public.gia_dip (can_id, tu_ngay, den_ngay, ten, gia, la_ngay_le) values (t.can('1509'), '2026-12-01', '2026-12-02', 'Noel sớm', 1500000, false);
update public.can set lich_doi_luc = now() - interval '2 days' where id = t.can('1509');
select t.dang_nhap(t.id('hoa'));
select pg_temp.chep($$select public.fn_sao_chep_gia(t.can('3402'), array[t.can('1509')], true, false, false, 2026)$$);
select t.thoat();
select t.ok(current_setting('t.kq') not like 'loi:%', 'YC4.5-NT2 Chị Hoa sao chép giá tháng 3402 sang 1509 thì lệnh qua (' || current_setting('t.kq') || ')');
select t.bang(pg_temp.gia(t.can('1509'), '2026-06-01') || ' ' || pg_temp.gia(t.can('1509'), '2026-10-01') || ' ' || pg_temp.gia(t.can('1509'), '2026-12-01'),
              '800000/1100000 800000/1100000 800000/1100000',
              'YC4.5-NT2 giá tháng của 1509 bằng 3402 ở các tháng 3402 có giá (6, 10, 12)');
select t.bang(pg_temp.dai(t.can('1509')), '2026-12-01..2026-12-02 Noel sớm 1500000 false',
              'YC4.5-NT2 chỉ chọn "Giá theo tháng" thì dịp và ngày lễ của 1509 không đổi');
select t.bang(pg_temp.gia(t.can('1509'), '2026-01-01'), '600000/700000',
              'YC4.5-NT3 tháng 1 của 3402 chưa có giá mà 1509 có thì 1509 giữ giá cũ');
select t.bang((current_setting('t.kq')::jsonb -> 0 -> 'thang_giu')::text, '[1]',
              'YC4.5-NT3 kết quả liệt kê tháng 1 đã giữ của 1509 (popup "1509 · Tháng 1")');
select t.bang((current_setting('t.kq')::jsonb -> 0 ->> 'ma_can'), '1509', 'YC4.5-NT3 kết quả ghi mã căn đích 1509');
select t.bang(pg_temp.gia(t.can('1509'), '2027-01-01'), null::text, 'YC4.5 YC4-H1 chỉ chép năm đang xem (2026), không ghi năm khác');
select t.ok((select lich_doi_luc from public.can where id = t.can('1509')) >= now() - interval '1 minute',
            'YC4.5 bước 5 YC4 Dữ liệu sao chép xong thì cập nhật lúc lịch đổi của căn đích');
select t.bang(pg_temp.dai(t.can('3402')), '2026-10-24..2026-10-25 Dịp đặc biệt 1300000 false', 'YC4.5 căn nguồn 3402 không đổi');

-- ===== YC4.5-NT4: 1509 có dịp 01/12 – 02/12, 3402 không có dịp trùng; chép "Dịp đặc biệt" thì dịp của 1509 giữ nguyên =====
select t.dang_nhap(t.id('hoa'));
select pg_temp.chep($$select public.fn_sao_chep_gia(t.can('3402'), array[t.can('1509')], false, false, true, 2026)$$);
select t.thoat();
select t.bang(pg_temp.dai(t.can('1509')), '2026-10-24..2026-10-25 Dịp đặc biệt 1300000 false; 2026-12-01..2026-12-02 Noel sớm 1500000 false',
              'YC4.5-NT4 dịp 01/12 – 02/12 của 1509 giữ nguyên, dịp 24/10 – 25/10 của 3402 được chép sang');
select t.bang(jsonb_array_length(current_setting('t.kq')::jsonb -> 0 -> 'dip_giu'), 1,
              'YC4.5-NT4 kết quả liệt kê dịp 01/12 – 02/12 đã giữ của 1509');

-- ===== YC4.5-NT5: 1509 có dịp 25/10 – 26/10, chép dịp 24/10 – 25/10 của 3402 thì 1509 giữ dịp của mình, popup liệt kê dịp bị bỏ =====
delete from public.gia_dip where can_id = t.can('1509');
insert into public.gia_dip (can_id, tu_ngay, den_ngay, ten, gia, la_ngay_le) values (t.can('1509'), '2026-10-25', '2026-10-26', 'Hội chợ', 1400000, false);
select t.dang_nhap(t.id('hoa'));
select pg_temp.chep($$select public.fn_sao_chep_gia(t.can('3402'), array[t.can('1509')], false, false, true, 2026)$$);
select t.thoat();
select t.bang(pg_temp.dai(t.can('1509')), '2026-10-25..2026-10-26 Hội chợ 1400000 false',
              'YC4.5-NT5 1509 giữ dịp 25/10 – 26/10, không có dịp 24/10 – 25/10');
select t.bang((current_setting('t.kq')::jsonb -> 0 -> 'dip_bo' -> 0 ->> 'tu_ngay') || ' ' || (current_setting('t.kq')::jsonb -> 0 -> 'dip_bo' -> 0 ->> 'den_ngay'),
              '2026-10-24 2026-10-25', 'YC4.5-NT5 kết quả liệt kê dịp 24/10 – 25/10 của 3402 bị bỏ ở 1509');

-- Ngày lễ và dịp tách riêng: chỉ chọn "Giá ngày lễ" thì không chép dịp đặc biệt.
delete from public.gia_dip where can_id = t.can('1509');
insert into public.gia_dip (can_id, tu_ngay, den_ngay, ten, gia, la_ngay_le) values (t.can('3402'), '2026-09-01', '2026-09-02', 'Quốc khánh 2/9', 2500000, true);
select t.dang_nhap(t.id('hoa'));
select pg_temp.chep($$select public.fn_sao_chep_gia(t.can('3402'), array[t.can('1509')], false, true, false, 2026)$$);
select t.thoat();
select t.bang(pg_temp.dai(t.can('1509')), '2026-09-01..2026-09-02 Quốc khánh 2/9 2500000 true',
              'YC4.5 bước 2 chỉ chọn "Giá ngày lễ" thì chỉ chép ngày lễ, không chép dịp đặc biệt');

-- Luật lệnh: không chọn phần nào, không chọn căn đích, đích là chính nguồn.
select t.dang_nhap(t.id('hoa'));
select t.bang(pg_temp.loi($$select public.fn_sao_chep_gia(t.can('3402'), array[t.can('1509')], false, false, false, 2026)$$),
              'P0001|Chưa chọn sao chép gì', 'YC4.5 bước 2 không chọn phần nào thì bị từ chối');
select t.bang(pg_temp.loi($$select public.fn_sao_chep_gia(t.can('3402'), array[]::uuid[], true, false, false, 2026)$$),
              'P0001|Chưa chọn căn nào', 'YC4.5-NT1 không có căn đích thì bị từ chối');
select t.bang(pg_temp.loi($$select public.fn_sao_chep_gia(t.can('3402'), array[t.can('3402')], true, false, false, 2026)$$),
              'P0001|Không tìm thấy căn', 'YC4.5 bước 3 căn đích là chính căn nguồn thì bị từ chối');
select t.thoat();

-- ===== YC4.5-NT6: quyền =====
select t.dang_nhap(t.id('hoa'));
select t.bang(pg_temp.loi($$select public.fn_sao_chep_gia(t.can('3402'), array[t.can('1103')], true, true, true, 2026)$$),
              'P0001|Không tìm thấy căn', 'YC4.5-NT6 Chị Hoa sao chép từ 3402 sang Sapphire 1103 của Anh Tuấn thì database từ chối');
select t.bang(pg_temp.loi($$select public.fn_sao_chep_gia(t.can('3402'), array[t.can('1509'), t.can('1103')], true, true, true, 2026)$$),
              'P0001|Không tìm thấy căn', 'YC4.5-NT6 danh sách đích có 1509 và 1103 thì database từ chối cả lệnh');
select t.bang(pg_temp.loi($$select public.fn_sao_chep_gia(t.can('1103'), array[t.can('3402')], true, true, true, 2026)$$),
              'P0001|Không tìm thấy căn', 'YC4.5-NT6 Chị Hoa sao chép từ 1103 sang 3402 thì database từ chối, không đọc được giá 1103');
select t.bang(t.dem($$select 1 from public.gia_thang where can_id = t.can('1103')$$), 0::bigint,
              'YC4.5-NT6 PQ5 Chị Hoa không đọc được giá tháng của 1103');
select t.thoat();
select t.dang_nhap(t.id('hung'));
select t.bang(pg_temp.loi($$select public.fn_sao_chep_gia(t.can('1509'), array[t.can('3402')], true, true, true, 2026)$$),
              'P0001|Không tìm thấy căn', 'YC4.5-NT6 Sale Hùng (được chia sẻ 1509, 3402) gửi lệnh sao chép từ 1509 thì database từ chối');
select t.thoat();
select t.bang(pg_temp.gia(t.can('1103'), '2026-10-01') || ' ' || pg_temp.gia(t.can('3402'), '2026-10-01') || ' ' || pg_temp.gia(t.can('1509'), '2026-06-01'),
              '700000/700000 800000/1100000 800000/1100000', 'YC4.5-NT6 không căn nào đổi giá sau các lệnh bị từ chối');
select t.bang(pg_temp.dai(t.can('1103')), '', 'YC4.5-NT6 1103 không có dịp nào được chép sang');

-- Căn đích đã xóa thì từ chối cả lệnh (YC4 Trạng thái màn HV5).
update public.can set an_luc = now() where id = t.can('1509');
select t.dang_nhap(t.id('hoa'));
select t.bang(pg_temp.loi($$select public.fn_sao_chep_gia(t.can('3402'), array[t.can('1509')], true, false, false, 2026)$$),
              'P0001|Không tìm thấy căn', 'YC4.5 YC4 Trạng thái màn HV5 căn đích đã xóa thì bị từ chối');
select t.thoat();
update public.can set an_luc = null where id = t.can('1509');
