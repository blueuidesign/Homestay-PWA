-- US52 · Yêu cầu trùng đêm (YC9.3). Viết trước migration (US52-TA1, CL14.5): task sau không sửa file này.
-- Hợp đồng database (YC9 "Dữ liệu" cờ trùng, "Quy tắc của nhóm" Một đêm một bên thắng, "Ai được làm gì", QT1.1, QT1.4,
-- QT2.1, QD6, QD11, PQ10, PQ11, PQ19, thiet-ke-db.md mục 3 bất biến 2, 6):
--   fn_yeu_cau_dang_cho() (CN1-03) và fn_chu_xem_yeu_cau() (CN9) thêm trường trung: mảng các yêu cầu chờ khác (chưa quá
--     hạn) cùng căn có đêm chồng: [{yeu_cau_id, ten_sale, ngay_nhan, ngay_tra, dem_trung: [các đêm chồng]}]. trung_voi
--     (US51) giữ nguyên. Không có giá bán của sale nào.
--   Yêu cầu chờ bị từ chối vì đêm đã bị đặt phòng khác lấy (chấp nhận yêu cầu khác, hay chủ tự ghi, giả định GD11):
--     trang_thai 'bi_tu_choi', ly_do_tu_choi = 'Đã nhận đặt phòng khác'. Thông báo 'yeu_cau_bi_tu_choi' cho sale có
--     ly_do đó; không tên sale được nhận, không giá, không tên khách.
--   fn_chap_nhan_yeu_cau() trả thêm da_tu_choi_theo (CN9-02): các yêu cầu bị từ chối vì đặt phòng vừa tạo:
--     [{yeu_cau_id, ten_sale, ngay_nhan, ngay_tra}]. fn_chu_xem_yeu_cau của yêu cầu đã chốt cũng có trường này.
--   Hai lệnh chấp nhận hai yêu cầu chồng đêm cùng lúc: lệnh sau chờ lệnh trước, rồi nhận Bị từ chối (doi_trang_thai =
--     true); chỉ một đặt phòng.
-- Ngày: file chạy trong một giao dịch, now() cố định. "17/10 → 19/10" của YC thay bằng đêm thứ Bảy S và Chủ nhật S+1 của
-- một tuần sau hôm nay ít nhất 14 ngày (như tests/db/67).
select t.fixture();

create or replace function pg_temp.d(i int default 0) returns date language sql stable as $$
  select (s + ((6 - extract(isodow from s)::int + 7) % 7) + i)::date from (select public.local_today() + 14 as s) x
$$;

insert into public.gia_thang (can_id, thang, gia_thuong, gia_cuoi_tuan)
select c.can_id, (date_trunc('month', public.local_today()) + make_interval(months => m))::date, c.thuong, c.cuoi
from (values (t.can('1509'), 900000::bigint, 1300000::bigint), (t.can('3402'), 800000, 1100000), (t.can('1103'), 700000, 700000))
       c(can_id, thuong, cuoi),
     generate_series(-1, 30) m
on conflict (can_id, thang) do nothing;

create or replace function pg_temp.gui(p_can uuid, p_nhan date, p_tra date, p_loi text default null) returns uuid
language plpgsql as $$
declare v jsonb;
begin
  select public.fn_gui_yeu_cau(p_can, p_nhan, p_tra, p_loi, gen_random_uuid()) into v;
  return (v ->> 'id')::uuid;
exception when others then
  raise notice 'lỗi: % (fn_gui_yeu_cau)', sqlerrm;
  return null;
end $$;

create or replace function pg_temp.loi(p_cau text) returns text language plpgsql as $$
declare ma text; cau text;
begin
  execute p_cau;
  return null;
exception when others then
  get stacked diagnostics ma = returned_sqlstate, cau = message_text;
  return ma || ': ' || cau;
end $$;

create or replace function pg_temp.chap(p_id uuid) returns jsonb language plpgsql as $$
declare v jsonb;
begin
  select public.fn_chap_nhan_yeu_cau(p_id) into v;
  return v;
exception when others then
  raise notice 'lỗi: % (fn_chap_nhan_yeu_cau)', sqlerrm;
  return null;
end $$;
create or replace function pg_temp.dang_cho() returns jsonb language plpgsql as $$
declare v jsonb;
begin
  select public.fn_yeu_cau_dang_cho() into v;
  return v;
exception when others then
  raise notice 'lỗi: % (fn_yeu_cau_dang_cho)', sqlerrm;
  return null;
end $$;
create or replace function pg_temp.xem(p_id uuid) returns jsonb language plpgsql as $$
declare v jsonb;
begin
  select public.fn_chu_xem_yeu_cau(p_id) into v;
  return v;
exception when others then
  raise notice 'lỗi: % (fn_chu_xem_yeu_cau)', sqlerrm;
  return null;
end $$;
-- Một dòng của khối CN1-03 theo id yêu cầu.
create or replace function pg_temp.dong(p_id text) returns jsonb language sql as $$
  select e from jsonb_array_elements(pg_temp.dang_cho()) e where e ->> 'id' = p_id
$$;
-- Tóm trường trung (hay da_tu_choi_theo) thành chuỗi xếp theo ngày nhận: "tên sale:nhận:trả:đêm chồng,..." cách bằng "|".
create or replace function pg_temp.tom(p jsonb) returns text language sql immutable as $$
  select coalesce(string_agg(concat_ws(':', e ->> 'ten_sale', e ->> 'ngay_nhan', e ->> 'ngay_tra',
                                       (select string_agg(x, ',' order by x) from jsonb_array_elements_text(e -> 'dem_trung') x)),
                             '|' order by e ->> 'ngay_nhan', e ->> 'ten_sale'), '')
  from jsonb_array_elements(coalesce(p, '[]'::jsonb)) e
$$;

-- Đọc bằng chủ database.
create or replace function pg_temp.tt(p_id uuid) returns text language sql security definer as $$
  select trang_thai || '|' || coalesce(ly_do_tu_choi, 'null') from public.yeu_cau_dat_phong where id = p_id
$$;
create or replace function pg_temp.so_tb(p_nguoi uuid, p_loai text, p_yeu_cau uuid) returns bigint language sql security definer as $$
  select count(*) from public.thong_bao where nguoi_nhan = p_nguoi and loai = p_loai and doi_tuong_id = p_yeu_cau
$$;
create or replace function pg_temp.tb(p_nguoi uuid, p_loai text, p_yeu_cau uuid) returns jsonb language sql security definer as $$
  select noi_dung from public.thong_bao where nguoi_nhan = p_nguoi and loai = p_loai and doi_tuong_id = p_yeu_cau
  order by tao_luc desc limit 1
$$;

-- ===== Dữ liệu =====
-- Y1 Hùng 1509 S → S+2 (Sale Hùng 17/10 → 19/10), Y2 Lan 1509 S+1 → S+2 (Sale Lan 18/10 → 19/10), chồng đêm S+1.
-- Y3 Lan 1509 S → S+1 chồng Y1 đêm S, không chồng Y2. Y4 Lan 1509 S+2 → S+3: ngày nhận là ngày trả của Y1, không chồng.
-- Y5 Hùng 3402 S → S+2: khác căn.
select t.dang_nhap(t.id('hung'));
select set_config('t.y1', pg_temp.gui(t.can('1509'), pg_temp.d(0), pg_temp.d(2), 'Khách gia đình 4 người')::text, true);
select set_config('t.y5', pg_temp.gui(t.can('3402'), pg_temp.d(0), pg_temp.d(2))::text, true);
select t.thoat();
select t.dang_nhap(t.id('lan'));
select set_config('t.y2', pg_temp.gui(t.can('1509'), pg_temp.d(1), pg_temp.d(2))::text, true);
select t.thoat();
select t.tao_yeu_cau('y3', t.can('1509'), t.id('lan'), pg_temp.d(0), pg_temp.d(1), array[1300000]::bigint[]);
select t.tao_yeu_cau('y4', t.can('1509'), t.id('lan'), pg_temp.d(2), pg_temp.d(3), array[900000]::bigint[]);
select set_config('t.y3', t.b('y3')::text, true);
select set_config('t.y4', t.b('y4')::text, true);
-- Khách của Hùng trong phần riêng (QD11): không được lọt sang Lan.
update public.yeu_cau_rieng set ten_khach = 'Khách riêng của Hùng', sdt_khach = '0900000077'
where yeu_cau_id = current_setting('t.y1')::uuid;
select t.ok(current_setting('t.y1', true) <> '' and current_setting('t.y2', true) <> '' and current_setting('t.y5', true) <> '',
            'YC9.3 dữ liệu: có Y1, Y5 của Hùng, Y2 của Lan');
select set_config('t.ban_hung', (select sum(x)::text from public.yeu_cau_rieng r, unnest(r.gia_ban_dem) x
                                 where r.yeu_cau_id = current_setting('t.y1')::uuid), true);
select t.ok(current_setting('t.ban_hung', true) is not null, 'YC9.3 dữ liệu: Y1 có giá bán của Hùng');

-- ===== YC9.3-NT1: nhãn trùng ngày ở CN1-03 và cảnh báo ở CN9 =====
select t.dang_nhap(t.id('hoa'));
select t.bang(pg_temp.dong(current_setting('t.y2')) -> 'trung_voi', '["Sale Hùng"]'::jsonb,
              'YC9.3-NT1 bước 1 dòng Y2 của Lan ở CN1-03: "trùng ngày với Sale Hùng"');
select t.bang(pg_temp.tom(pg_temp.dong(current_setting('t.y2')) -> 'trung'),
              concat_ws(':', 'Sale Hùng', pg_temp.d(0), pg_temp.d(2), pg_temp.d(1)),
              'YC9.3-NT1 bước 1 dòng Y2 biết trùng yêu cầu nào của Sale Hùng và đêm chồng S+1');
select t.bang(pg_temp.tom(pg_temp.dong(current_setting('t.y1')) -> 'trung'),
              concat_ws(':', 'Sale Lan', pg_temp.d(0), pg_temp.d(1), pg_temp.d(0)) || '|'
              || concat_ws(':', 'Sale Lan', pg_temp.d(1), pg_temp.d(2), pg_temp.d(1)),
              'YC9.3-NT1 dòng Y1 của Hùng cũng có nhãn trùng: hai yêu cầu của Sale Lan, mỗi cái một đêm chồng');
select t.bang(pg_temp.tom(pg_temp.dong(current_setting('t.y3')) -> 'trung'),
              concat_ws(':', 'Sale Hùng', pg_temp.d(0), pg_temp.d(2), pg_temp.d(0)),
              'YC9.3-NT1 Y3 chỉ trùng Y1 đêm S, không trùng Y2');
select t.bang(jsonb_array_length(pg_temp.dong(current_setting('t.y4')) -> 'trung'), 0,
              'YC9.3-NT1 QT2.1 Y4 nhận phòng đúng ngày trả của Y1: không có nhãn trùng');
select t.bang(jsonb_array_length(pg_temp.dong(current_setting('t.y5')) -> 'trung'), 0,
              'YC9.3-NT1 Y5 khác căn: không có nhãn trùng');
select t.bang((select string_agg(x ->> 'yeu_cau_id', ',') from jsonb_array_elements(pg_temp.dong(current_setting('t.y2')) -> 'trung') x),
              current_setting('t.y1'), 'YC9.3-NT1 nhãn trùng trỏ tới đúng yêu cầu Y1 để mở xem');
select t.bang(pg_temp.tom(pg_temp.xem(current_setting('t.y1')::uuid) -> 'trung'),
              pg_temp.tom(pg_temp.dong(current_setting('t.y1')) -> 'trung'),
              'YC9.3-NT1 bước 2 CN9 của Y1 có cảnh báo trùng như dòng CN1-03');
select t.bang(pg_temp.tom(pg_temp.xem(current_setting('t.y2')::uuid) -> 'trung'),
              concat_ws(':', 'Sale Hùng', pg_temp.d(0), pg_temp.d(2), pg_temp.d(1)),
              'YC9.3-NT1 bước 2 CN9 của Y2: "Trùng S+1 với yêu cầu của Sale Hùng"');
select t.ok(not exists (select 1 from jsonb_array_elements(pg_temp.dang_cho()) e, jsonb_array_elements(e -> 'trung') x,
                        jsonb_object_keys(x) k
                        where k not in ('yeu_cau_id', 'ten_sale', 'ngay_nhan', 'ngay_tra', 'dem_trung'))
            and pg_temp.dang_cho()::text not like '%' || current_setting('t.ban_hung') || '%'
            and pg_temp.dang_cho()::text not like '%Khách riêng của Hùng%',
            'YC9.3-NT1 PQ11.CHU nhãn trùng không có giá bán, khách của sale');
select t.thoat();
-- Hết chồng khi yêu cầu kia không còn chờ: Lan hủy Y3 thì Y1 chỉ còn trùng Y2.
select t.dang_nhap(t.id('lan'));
select public.fn_huy_yeu_cau(current_setting('t.y3')::uuid);
select t.thoat();
select t.dang_nhap(t.id('hoa'));
select t.bang(pg_temp.tom(pg_temp.dong(current_setting('t.y1')) -> 'trung'),
              concat_ws(':', 'Sale Lan', pg_temp.d(1), pg_temp.d(2), pg_temp.d(1)),
              'YC9.3-NT1 yêu cầu đã hủy không còn tính trùng');
select t.thoat();

-- ===== Ai được làm gì: người khác không thấy cờ trùng =====
select t.dang_nhap(t.id('tuan'));
select t.bang(jsonb_array_length(pg_temp.dang_cho()), 0, 'YC9.3 PQ10.CHU Anh Tuấn không thấy yêu cầu và cờ trùng ở căn Chị Hoa');
select t.ok(pg_temp.loi(format('select public.fn_chu_xem_yeu_cau(%L)', current_setting('t.y2'))) like '42501:%',
            'YC9.3 PQ10.CHU Anh Tuấn đọc CN9 của yêu cầu tới 1509: không được');
select t.thoat();
select t.dang_nhap(t.id('lan'));
select t.bang(jsonb_array_length(pg_temp.dang_cho()), 0, 'YC9.1-NT9 YC9.3 Sale Lan không đọc được khối yêu cầu của chủ nhà');
select t.ok(pg_temp.loi(format('select public.fn_chu_xem_yeu_cau(%L)', current_setting('t.y2'))) like '42501:%',
            'YC9.1-NT9 YC9.3 Sale Lan không đọc được CN9 kể cả của yêu cầu của mình');
select t.ok(pg_temp.loi(format('select public.fn_yeu_cau_cua_toi(%L)', current_setting('t.y1'))) like '42501:%',
            'YC9.1-NT9 YC9.3 Sale Lan không đọc được yêu cầu của Sale Hùng');
select t.ok(not (public.fn_yeu_cau_cua_toi(current_setting('t.y2')::uuid) ?| array['trung', 'trung_voi'])
            and public.fn_yeu_cau_cua_toi(current_setting('t.y2')::uuid)::text not like '%Sale Hùng%',
            'YC9.1-NT9 YC9.3 Sale Lan đọc yêu cầu của mình không biết yêu cầu của Sale Hùng tồn tại');
select t.bang(coalesce(t.so(format('select * from public.yeu_cau_dat_phong where id = %L', current_setting('t.y1'))), 0), 0::bigint,
              'YC9.1-NT9 YC9.3 Sale Lan đọc thẳng bảng: không thấy dòng của Sale Hùng');
select t.thoat();

-- ===== YC9.3-NT2: chấp nhận Y1 thì mọi yêu cầu chờ chồng đêm Bị từ chối, sale được báo =====
select t.dang_nhap(t.id('hoa'));
select set_config('t.kq1', pg_temp.chap(current_setting('t.y1')::uuid)::text, true);
select t.thoat();
select t.bang((current_setting('t.kq1')::jsonb ->> 'trang_thai'), 'da_chot', 'YC9.3-NT2 bước 3 Y1 sang Đã chốt');
select t.bang(pg_temp.tt(current_setting('t.y2')::uuid), 'bi_tu_choi|Đã nhận đặt phòng khác',
              'YC9.3-NT2 bước 3 Y2 của Lan chồng đêm: Bị từ chối, lý do "đã nhận đặt phòng khác"');
select t.bang(pg_temp.tt(current_setting('t.y3')::uuid), 'da_huy|null', 'YC9.3-NT2 Y3 đã hủy trước đó giữ Đã hủy');
select t.bang(pg_temp.tt(current_setting('t.y4')::uuid), 'cho|null', 'YC9.3-NT2 QT2.1 Y4 không chồng đêm: vẫn Chờ chủ');
select t.bang(pg_temp.tt(current_setting('t.y5')::uuid), 'cho|null', 'YC9.3-NT2 QT1.1-VD3 Y5 khác căn: vẫn Chờ chủ');
select t.bang(pg_temp.so_tb(t.id('lan'), 'yeu_cau_bi_tu_choi', current_setting('t.y2')::uuid), 1::bigint,
              'YC9.3-NT2 bước 3 Sale Lan có một thông báo bị từ chối cho Y2');
select t.bang((pg_temp.tb(t.id('lan'), 'yeu_cau_bi_tu_choi', current_setting('t.y2')::uuid) ->> 'ly_do'), 'Đã nhận đặt phòng khác',
              'YC9.3-NT2 thông báo cho Lan mang lý do "đã nhận đặt phòng khác"');
select t.bang((select concat_ws('|', j ->> 'ma_can', j ->> 'ngay_nhan', j ->> 'ngay_tra', j ->> 'ten_chu')
               from pg_temp.tb(t.id('lan'), 'yeu_cau_bi_tu_choi', current_setting('t.y2')::uuid) j),
              concat_ws('|', '1509', pg_temp.d(1), pg_temp.d(2), 'Chị Hoa'),
              'YC9.3-NT2 thông báo cho Lan có căn, ngày của yêu cầu của Lan, tên chủ nhà');
select t.bang(pg_temp.so_tb(t.id('lan'), 'yeu_cau_bi_tu_choi', current_setting('t.y4')::uuid), 0::bigint,
              'YC9.3-NT2 Y4 không chồng đêm: không thông báo');
select t.bang(pg_temp.so_tb(t.id('hung'), 'yeu_cau_bi_tu_choi', current_setting('t.y5')::uuid), 0::bigint,
              'YC9.3-NT2 Y5 khác căn: không thông báo');
select t.bang(pg_temp.tom(current_setting('t.kq1')::jsonb -> 'da_tu_choi_theo'),
              concat_ws(':', 'Sale Lan', pg_temp.d(1), pg_temp.d(2)),
              'YC9.3-NT2 bước 3 CN9-02: "Yêu cầu của Sale Lan (S+1 → S+2) đã bị từ chối"');
select t.dang_nhap(t.id('hoa'));
select t.bang(pg_temp.tom(pg_temp.xem(current_setting('t.y1')::uuid) -> 'da_tu_choi_theo'),
              concat_ws(':', 'Sale Lan', pg_temp.d(1), pg_temp.d(2)),
              'YC9.3-NT2 đọc lại CN9-02 của Y1: vẫn biết yêu cầu nào bị từ chối theo');
select t.bang(jsonb_array_length(coalesce(pg_temp.xem(current_setting('t.y1')::uuid) -> 'trung', '[]')), 0,
              'YC9.3-NT2 Y1 đã chốt không còn cảnh báo trùng');
select t.bang((select string_agg(e ->> 'id', ',' order by e ->> 'ngay_nhan') from jsonb_array_elements(pg_temp.dang_cho()) e
               where e ->> 'can_id' = t.can('1509')::text),
              current_setting('t.y4'), 'YC9.3-NT2 khối CN1-03 của 1509 chỉ còn Y4');
select t.thoat();
select t.dang_nhap(t.id('lan'));
select t.bang((select concat_ws('|', j ->> 'trang_thai', j ->> 'ly_do_tu_choi') from public.fn_yeu_cau_cua_toi(current_setting('t.y2')::uuid) j),
              'bi_tu_choi|Đã nhận đặt phòng khác', 'YC9.3-NT2 S3-05 Lan thấy Bị từ chối, lý do "đã nhận đặt phòng khác"');
select t.thoat();

-- ===== YC9.3-NT3: thông báo cho Lan không có tên Sale Hùng, giá bán của Hùng, tên khách =====
select t.ok(not exists (select 1 from jsonb_object_keys(pg_temp.tb(t.id('lan'), 'yeu_cau_bi_tu_choi', current_setting('t.y2')::uuid)) k
                        where k in ('ten_sale', 'sale_id', 'gia_ban', 'tong_gia_ban', 'gia_ban_dem', 'ten_khach', 'sdt_khach',
                                    'booking_id', 'yeu_cau_thang')),
            'YC9.3-NT3 PQ19 thông báo cho Lan không có trường tên sale, giá bán, khách, đặt phòng của người khác');
select t.ok(pg_temp.tb(t.id('lan'), 'yeu_cau_bi_tu_choi', current_setting('t.y2')::uuid)::text not like '%Sale Hùng%'
            and pg_temp.tb(t.id('lan'), 'yeu_cau_bi_tu_choi', current_setting('t.y2')::uuid)::text not like '%' || t.id('hung')::text || '%',
            'YC9.3-NT3 thông báo cho Lan không có tên Sale Hùng');
select t.ok(pg_temp.tb(t.id('lan'), 'yeu_cau_bi_tu_choi', current_setting('t.y2')::uuid)::text not like '%' || current_setting('t.ban_hung') || '%',
            'YC9.3-NT3 thông báo cho Lan không có giá bán của Hùng');
select t.ok(pg_temp.tb(t.id('lan'), 'yeu_cau_bi_tu_choi', current_setting('t.y2')::uuid)::text not like '%Khách riêng của Hùng%'
            and pg_temp.tb(t.id('lan'), 'yeu_cau_bi_tu_choi', current_setting('t.y2')::uuid)::text not like '%0900000077%',
            'YC9.3-NT3 QD11 thông báo cho Lan không có tên, số khách của Hùng');
select t.dang_nhap(t.id('lan'));
select t.ok(public.fn_yeu_cau_cua_toi(current_setting('t.y2')::uuid)::text not like '%Sale Hùng%'
            and public.fn_yeu_cau_cua_toi(current_setting('t.y2')::uuid)::text not like '%Khách riêng của Hùng%'
            and public.fn_yeu_cau_cua_toi(current_setting('t.y2')::uuid)::text not like '%' || current_setting('t.ban_hung') || '%',
            'YC9.3-NT3 S3-05 Lan đọc yêu cầu bị từ chối: không tên Hùng, khách, giá bán của Hùng');
select t.bang(coalesce(t.so(format($$select * from public.thong_bao where doi_tuong_id = %L$$, current_setting('t.y1'))), 0), 0::bigint,
              'YC9.3-NT3 PQ19.SALE Lan không đọc được thông báo của Hùng');
select t.thoat();

-- ===== YC9.3-NT5: chủ tự ghi đặt phòng chồng đêm với yêu cầu chờ thì yêu cầu Bị từ chối (giả định GD11) =====
select t.dang_nhap(t.id('hoa'));
select t.ok(pg_temp.loi(format($$select public.fn_tao_booking(p_can_id => %L, p_ngay_nhan => %L, p_ngay_tra => %L,
                                   p_tien_phong => 1900000, p_client_id => gen_random_uuid(), p_ten_khach => 'Khách riêng của Hoa')$$,
                               t.can('3402'), pg_temp.d(1), pg_temp.d(3))) is null,
            'YC9.3-NT5 bước 4 Chị Hoa ghi đặt phòng 3402 S+1 → S+3');
select t.thoat();
select t.bang(pg_temp.tt(current_setting('t.y5')::uuid), 'bi_tu_choi|Đã nhận đặt phòng khác',
              'YC9.3-NT5 Y5 của Hùng chồng đêm S+1: Bị từ chối, lý do "đã nhận đặt phòng khác"');
select t.bang(pg_temp.so_tb(t.id('hung'), 'yeu_cau_bi_tu_choi', current_setting('t.y5')::uuid), 1::bigint,
              'YC9.3-NT5 Hùng có một thông báo bị từ chối');
select t.bang((pg_temp.tb(t.id('hung'), 'yeu_cau_bi_tu_choi', current_setting('t.y5')::uuid) ->> 'ly_do'), 'Đã nhận đặt phòng khác',
              'YC9.3-NT5 thông báo cho Hùng mang lý do "đã nhận đặt phòng khác"');
select t.ok(pg_temp.tb(t.id('hung'), 'yeu_cau_bi_tu_choi', current_setting('t.y5')::uuid)::text not like '%Khách riêng của Hoa%'
            and pg_temp.tb(t.id('hung'), 'yeu_cau_bi_tu_choi', current_setting('t.y5')::uuid)::text not like '%1900000%',
            'YC9.3-NT5 QD11 PQ19 thông báo cho Hùng không có khách, tiền của đặt phòng chủ tự ghi');
select t.bang(pg_temp.tt(current_setting('t.y4')::uuid), 'cho|null', 'YC9.3-NT5 Y4 ở căn khác vẫn Chờ chủ');

-- ===== YC9.3-NT4: hai lệnh chấp nhận hai yêu cầu chồng đêm cùng lúc thì chỉ một lệnh qua =====
-- Hai phiên thật qua dblink (dữ liệu riêng đã commit, dọn ở cuối). Không có dblink thì chứng minh bằng ràng buộc chặn trùng:
-- tắt trigger từ chối yêu cầu trùng (giả như lệnh thứ hai chưa thấy lệnh thứ nhất) thì lệnh thứ hai vẫn bị chặn.
do $nt4$
declare
  v_co_dblink boolean := exists (select 1 from pg_available_extensions where name = 'dblink');
  v_chu uuid := gen_random_uuid();
  v_s1 uuid := gen_random_uuid();
  v_s2 uuid := gen_random_uuid();
  v_can uuid := gen_random_uuid();
  v_ya uuid := gen_random_uuid();
  v_yb uuid := gen_random_uuid();
  v_cs text := 'dbname=' || quote_ident(current_database());
  v_vai text;
  v_pid_b int;
  v_cho boolean := false;
  v_a jsonb;
  v_b jsonb;
  v_loi_b text;
  v_so bigint;
  v_tt text;
  i int;
begin
  if v_co_dblink then
    begin
      create extension if not exists dblink;
      perform dblink_connect('us52_dung', v_cs);
    exception when others then
      v_co_dblink := false;
      raise notice 'YC9.3-NT4: không mở được phiên dblink (%), chứng minh bằng ràng buộc', sqlerrm;
    end;
  end if;

  if not v_co_dblink then
    -- Y_A Hùng, Y_B Lan, cùng 1509 S+7 → S+9.
    perform t.tao_yeu_cau('nt4a', t.can('1509'), t.id('hung'), pg_temp.d(7), pg_temp.d(9), array[1300000, 900000]::bigint[]);
    perform t.tao_yeu_cau('nt4b', t.can('1509'), t.id('lan'), pg_temp.d(8), pg_temp.d(9), array[900000]::bigint[]);
    alter table public.booking disable trigger booking_sau_khi_ghi;
    perform t.dang_nhap(t.id('hoa'));
    v_a := pg_temp.chap(t.b('nt4a'));
    v_loi_b := pg_temp.loi(format('select public.fn_chap_nhan_yeu_cau(%L)', t.b('nt4b')));
    perform t.thoat();
    alter table public.booking enable trigger booking_sau_khi_ghi;
    perform t.ok(v_a ->> 'trang_thai' = 'da_chot' and v_loi_b like 'P0001:%',
                 'YC9.3-NT4 QD6 lệnh chấp nhận thứ hai chưa thấy lệnh thứ nhất: ràng buộc chặn trùng chặn (ra: ' || coalesce(v_loi_b, 'qua') || ')');
    perform t.bang((select count(*) from public.booking where can_id = t.can('1509') and dem && daterange(pg_temp.d(7), pg_temp.d(9))
                      and trang_thai <> 'da_huy'), 1::bigint,
                   'YC9.3-NT4 hai lệnh chấp nhận cùng lúc: chỉ một lệnh qua, không có hai đặt phòng chồng đêm');
    return;
  end if;

  -- Dữ liệu riêng của phép thử, commit để hai phiên cùng thấy.
  perform dblink_exec('us52_dung', format(
    $q$insert into auth.users (id) values (%1$L), (%2$L), (%3$L) on conflict (id) do nothing;
       insert into public.profiles (id, ten, ten_hien_thi, so_dien_thoai, vai_chon)
       values (%1$L, 'Chủ thử NT4', 'Chủ thử NT4', null, 'chu_nha'), (%2$L, 'Sale thử A', 'Sale thử A', null, 'sale'),
              (%3$L, 'Sale thử B', 'Sale thử B', null, 'sale')
         on conflict (id) do update set vai_chon = excluded.vai_chon, ten = excluded.ten, ten_hien_thi = excluded.ten_hien_thi;
       insert into public.can (id, nguoi_giu, loai, ma_can) values (%4$L, %1$L, 'co_lich', 'NT4');
       insert into public.ket_noi (chu_id, sale_id, trang_thai, nguon, pham_vi)
       values (%1$L, %2$L, 'da_ket_noi', 'link_moi', 'tat_ca'), (%1$L, %3$L, 'da_ket_noi', 'link_moi', 'tat_ca');
       insert into public.yeu_cau_dat_phong (id, can_id, sale_id, ngay_nhan, ngay_tra, gia_chu_dem, trang_thai)
       values (%5$L, %4$L, %2$L, %7$L, %8$L, '{1300000,900000}', 'cho'),
              (%6$L, %4$L, %3$L, %9$L, %8$L, '{900000}', 'cho')$q$,
    v_chu, v_s1, v_s2, v_can, v_ya, v_yb, pg_temp.d(7), pg_temp.d(9), pg_temp.d(8)));

  v_vai := format($q$begin; select set_config('request.jwt.claims', %L, true); set local role authenticated$q$,
                  json_build_object('sub', v_chu, 'role', 'authenticated')::text);
  perform dblink_connect('us52_a', v_cs);
  perform dblink_connect('us52_b', v_cs);
  select p into v_pid_b from dblink('us52_b', 'select pg_backend_pid()') as x(p int);
  perform dblink_exec('us52_a', v_vai);
  perform dblink_exec('us52_b', v_vai);

  -- Phiên A chấp nhận Y_A, chưa commit. Phiên B chấp nhận Y_B cùng lúc.
  select j into v_a from dblink('us52_a', format('select public.fn_chap_nhan_yeu_cau(%L)', v_ya)) as x(j jsonb);
  perform dblink_send_query('us52_b', format('select public.fn_chap_nhan_yeu_cau(%L)', v_yb));
  for i in 1..50 loop
    select exists (select 1 from pg_stat_activity where pid = v_pid_b and wait_event_type = 'Lock') into v_cho;
    exit when v_cho;
    perform pg_sleep(0.1);
  end loop;
  perform t.ok(v_a ->> 'trang_thai' = 'da_chot' and v_cho,
               'YC9.3-NT4 phiên A chấp nhận xong chưa commit thì lệnh chấp nhận của phiên B phải chờ, không chạy song song');

  perform dblink_exec('us52_a', 'commit');
  select j into v_b from dblink_get_result('us52_b', false) as x(j jsonb);
  v_loi_b := case when v_b is not null then 'qua' else dblink_error_message('us52_b') end;
  perform * from dblink_get_result('us52_b', false) as x(j jsonb);
  perform dblink_exec('us52_b', case when v_loi_b = 'qua' then 'commit' else 'rollback' end);

  select n into v_so from dblink('us52_dung', format(
    'select count(*) from public.booking where can_id = %L and trang_thai <> %L', v_can, 'da_huy')) as x(n bigint);
  perform t.bang(v_so, 1::bigint, 'YC9.3-NT4 hai lệnh chấp nhận cùng lúc: chỉ một lệnh qua, không có hai đặt phòng chồng đêm');
  select s into v_tt from dblink('us52_dung', format(
    'select trang_thai || %L || coalesce(ly_do_tu_choi, %L) from public.yeu_cau_dat_phong where id = %L', '|', 'null', v_yb))
    as x(s text);
  perform t.bang(v_tt, 'bi_tu_choi|Đã nhận đặt phòng khác',
                 'YC9.3-NT4 yêu cầu của lệnh thứ hai: Bị từ chối, lý do "đã nhận đặt phòng khác"');
  perform t.ok(v_loi_b like '%Căn đã có đặt phòng%' or (v_b ->> 'doi_trang_thai' = 'true' and v_b ->> 'trang_thai' = 'bi_tu_choi'),
               'YC9.3-NT4 HV3 lệnh thứ hai nhận "đã đổi trạng thái" Bị từ chối hay lỗi trùng đêm (ra: '
               || coalesce(v_b::text, v_loi_b) || ')');

  -- Dọn dữ liệu đã commit (bỏ qua trigger, chỉ dữ liệu của phép thử).
  perform dblink_exec('us52_dung', format(
    $q$set session_replication_role = replica;
       delete from public.thong_bao where nguoi_nhan in (%1$L, %2$L, %3$L);
       delete from public.booking_dem where booking_id in (select id from public.booking where can_id = %4$L);
       delete from public.booking_rieng where booking_id in (select id from public.booking where can_id = %4$L);
       delete from public.audit_log where ban_ghi_id in (select id from public.booking where can_id = %4$L);
       update public.yeu_cau_dat_phong set booking_id = null where can_id = %4$L;
       delete from public.booking where can_id = %4$L;
       delete from public.yeu_cau_rieng where yeu_cau_id in (select id from public.yeu_cau_dat_phong where can_id = %4$L);
       delete from public.yeu_cau_dat_phong where can_id = %4$L;
       delete from public.ket_noi where chu_id = %1$L;
       delete from public.can where id = %4$L;
       delete from public.profiles where id in (%1$L, %2$L, %3$L);
       delete from auth.users where id in (%1$L, %2$L, %3$L);
       set session_replication_role = origin$q$, v_chu, v_s1, v_s2, v_can));
  perform dblink_disconnect('us52_a');
  perform dblink_disconnect('us52_b');
  perform dblink_disconnect('us52_dung');
end $nt4$;
