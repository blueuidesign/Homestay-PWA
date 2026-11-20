-- US51 · Chủ nhà trả lời yêu cầu (YC9.2). Viết trước migration (US51-TA1, CL14.5): task sau không sửa file này.
-- Hợp đồng database (YC9 "Dữ liệu", "Ai được làm gì", "Quy tắc của nhóm", QT1.1, QT1.4, QD6, QD11, PQ10, PQ11, PQ19,
-- thiet-ke-db.md mục 3 bất biến 2, 6):
--   fn_yeu_cau_dang_cho() returns jsonb (khối CN1-03): mảng các yêu cầu đang chờ (đã quá hạn thì không có) tới căn của
--     người gọi, ngày nhận sớm trước: [{id, can_id, ma_can, ten_toa, ten_sale, ngay_nhan, ngay_tra, so_dem, tong_gia_chu,
--     gui_luc, trung_voi: [tên sale có yêu cầu chờ khác chồng đêm cùng căn]}]. Không có giá bán, mức cộng, tiền chênh.
--   fn_chu_xem_yeu_cau(p_yeu_cau_id uuid) (US50) thêm: sale_id, sdt_sale, so_dat_phong (đặt phòng chưa hủy của sale đó ở
--     căn của người gọi), con_ket_noi (sale còn được xem căn), trung_voi, booking_id.
--   fn_chap_nhan_yeu_cau(p_yeu_cau_id uuid) returns jsonb: một giao dịch. Yêu cầu không tới căn của người gọi (kể cả sale
--     gửi, chủ khác): 42501 "Không tìm thấy yêu cầu". Còn chờ mà sale không còn được xem căn: P0001 "Sale này không còn kết
--     nối với bạn, không nhận được đặt phòng." Còn chờ: tạo booking nguon 'tu_yeu_cau', sale_id là sale, yeu_cau_id, tiền
--     từng đêm là giá chủ đã chốt trong yêu cầu; phần riêng của sale ở booking_rieng; yêu cầu sang 'da_chot' kèm booking_id;
--     một thông báo 'yeu_cau_da_chot' cho sale (không giá bán). Trả như fn_chu_xem_yeu_cau, kèm doi_trang_thai = false.
--     Không còn chờ (đã hủy, bị từ chối, hết hạn): không có đặt phòng, trả trạng thái mới kèm doi_trang_thai = true.
--     Còn chờ mà quá hạn (quá 14 ngày, hay ngày nhận trước hôm nay): ghi 'het_han', một thông báo 'yeu_cau_het_han' cho
--     sale (gọi lại không ghi thêm), trả 'het_han' kèm doi_trang_thai = true. Đã chốt: gọi lại trả kết quả cũ, doi = false.
--   fn_tu_choi_yeu_cau(p_yeu_cau_id uuid, p_ly_do text) returns jsonb: lý do là một trong "Đã có khách đặt", "Đang sửa
--     phòng", "Lý do khác", hay trống (null, toàn khoảng trắng); khác thì 22023 "Lý do không hợp lệ". Còn chờ: 'bi_tu_choi',
--     ly_do_tu_choi = lý do (trống thì null), thông báo 'yeu_cau_bi_tu_choi' cho sale có ly_do và ten_chu. Không cần còn
--     kết nối. Quyền, không còn chờ, quá hạn: như lệnh chấp nhận.
-- Ngày: file chạy trong một giao dịch, now() cố định. "10/10 → 12/10" của YC thay bằng đêm thứ Bảy S và Chủ nhật S+1 của
-- một tuần sau hôm nay ít nhất 14 ngày. Giá 1509 (DLM) S → S+2 là 2.200.000đ (như tests/db/66).
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

-- Gửi yêu cầu bằng vai hiện tại, trả id (lỗi thì null).
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

-- Mã lỗi và câu lỗi của một câu lệnh (null khi qua).
create or replace function pg_temp.loi(p_cau text) returns text language plpgsql as $$
declare ma text; cau text;
begin
  execute p_cau;
  return null;
exception when others then
  get stacked diagnostics ma = returned_sqlstate, cau = message_text;
  return ma || ': ' || cau;
end $$;

-- Gọi lệnh bằng vai hiện tại, trả jsonb (lỗi thì null, in ra NOTICE).
create or replace function pg_temp.chap(p_id uuid) returns jsonb language plpgsql as $$
declare v jsonb;
begin
  select public.fn_chap_nhan_yeu_cau(p_id) into v;
  return v;
exception when others then
  raise notice 'lỗi: % (fn_chap_nhan_yeu_cau)', sqlerrm;
  return null;
end $$;
create or replace function pg_temp.tu_choi(p_id uuid, p_ly_do text) returns jsonb language plpgsql as $$
declare v jsonb;
begin
  select public.fn_tu_choi_yeu_cau(p_id, p_ly_do) into v;
  return v;
exception when others then
  raise notice 'lỗi: % (fn_tu_choi_yeu_cau)', sqlerrm;
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

-- Đọc bằng chủ database.
create or replace function pg_temp.tt(p_id uuid) returns text language sql security definer as $$
  select trang_thai from public.yeu_cau_dat_phong where id = p_id
$$;
create or replace function pg_temp.so_bk(p_yeu_cau uuid) returns bigint language sql security definer as $$
  select count(*) from public.booking where yeu_cau_id = p_yeu_cau
$$;
create or replace function pg_temp.so_tb(p_nguoi uuid, p_loai text, p_yeu_cau uuid) returns bigint language sql security definer as $$
  select count(*) from public.thong_bao where nguoi_nhan = p_nguoi and loai = p_loai and doi_tuong_id = p_yeu_cau
$$;
create or replace function pg_temp.tb(p_nguoi uuid, p_loai text, p_yeu_cau uuid) returns jsonb language sql security definer as $$
  select noi_dung from public.thong_bao where nguoi_nhan = p_nguoi and loai = p_loai and doi_tuong_id = p_yeu_cau
  order by tao_luc desc limit 1
$$;
create or replace function pg_temp.khong_co() returns uuid language sql immutable as $$
  select '00000000-0000-0000-00ff-000000000000'::uuid
$$;

-- ===== Danh mục =====
select t.ok((select count(*) = 3 and bool_and(p.prosecdef)
                    and bool_and(exists (select 1 from unnest(p.proconfig) c where c like 'search_path=%'))
             from pg_proc p where p.pronamespace = 'public'::regnamespace
               and p.proname in ('fn_chap_nhan_yeu_cau', 'fn_tu_choi_yeu_cau', 'fn_yeu_cau_dang_cho')),
            'YC9.2 KT-DB.3.3 có fn_chap_nhan_yeu_cau, fn_tu_choi_yeu_cau, fn_yeu_cau_dang_cho chạy security definer, đặt search_path');
select t.ok(not exists (select 1 from pg_proc p where p.pronamespace = 'public'::regnamespace
                          and p.proname in ('fn_chap_nhan_yeu_cau', 'fn_tu_choi_yeu_cau', 'fn_yeu_cau_dang_cho')
                          and has_function_privilege('anon', p.oid, 'execute'))
            and exists (select 1 from pg_proc p where p.pronamespace = 'public'::regnamespace and p.proname = 'fn_chap_nhan_yeu_cau'),
            'YC9.2 KT-DB.3.1 người chưa đăng nhập không gọi được ba lệnh');

-- ===== Dữ liệu: Hùng gửi Y1 1509 S → S+2, Lan gửi Y2 1509 S+1 → S+2 (chồng đêm S+1) =====
select t.dang_nhap(t.id('hung'));
select set_config('t.y1', pg_temp.gui(t.can('1509'), pg_temp.d(0), pg_temp.d(2), 'Khách gia đình 4 người')::text, true);
select t.thoat();
select t.dang_nhap(t.id('lan'));
select set_config('t.y2', pg_temp.gui(t.can('1509'), pg_temp.d(1), pg_temp.d(2))::text, true);
select t.thoat();
select t.ok(current_setting('t.y1', true) <> '' and current_setting('t.y2', true) <> '', 'YC9.2 dữ liệu: có Y1 của Hùng, Y2 của Lan');

-- ===== YC9.2-NT2: khối CN1-03 và CN9 chỉ có giá của chủ nhà =====
select t.dang_nhap(t.id('hoa'));
select t.bang(jsonb_array_length(pg_temp.dang_cho()), 2, 'YC9.2 bước 1 khối CN1-03 của Chị Hoa có 2 yêu cầu chờ');
select t.bang((select concat_ws('|', e ->> 'ten_sale', e ->> 'ma_can', e ->> 'so_dem', e ->> 'tong_gia_chu', e ->> 'ngay_nhan')
               from jsonb_array_elements(pg_temp.dang_cho()) e where e ->> 'id' = current_setting('t.y1')),
              concat_ws('|', 'Sale Hùng', '1509', '2', '2200000', pg_temp.d(0)::text),
              'YC9.2-NT2 bước 1 dòng Y1: tên sale, căn, 2 đêm, giá chủ nhà 2.200.000đ');
select t.bang((select (e ->> 'gui_luc')::timestamptz from jsonb_array_elements(pg_temp.dang_cho()) e
               where e ->> 'id' = current_setting('t.y1')), now(), 'YC9.2 bước 1 dòng có lúc gửi');
select t.bang((select e -> 'trung_voi' from jsonb_array_elements(pg_temp.dang_cho()) e where e ->> 'id' = current_setting('t.y2')),
              '["Sale Hùng"]'::jsonb, 'YC9 Dữ liệu cờ trùng: Y2 của Lan trùng ngày với Sale Hùng');
select t.ok(not exists (select 1 from jsonb_array_elements(pg_temp.dang_cho()) e, jsonb_object_keys(e) k
                        where k in ('gia_ban_dem', 'gia_ban', 'tong_gia_ban', 'muc_cong', 'tien_chenh'))
            and pg_temp.dang_cho()::text not like '%2600000%',
            'YC9.2-NT2 PQ11.CHU khối CN1-03 không có giá bán, mức cộng, tiền chênh');
select t.bang((select concat_ws('|', j ->> 'ten_sale', j ->> 'ma_can', j ->> 'tong_gia_chu', j ->> 'loi_nhan', j ->> 'sale_id',
                                j ->> 'con_ket_noi')
               from public.fn_chu_xem_yeu_cau(current_setting('t.y1')::uuid) j),
              concat_ws('|', 'Sale Hùng', '1509', '2200000', 'Khách gia đình 4 người', t.id('hung')::text, 'true'),
              'YC9.2-NT2 bước 2 CN9: tên sale, phòng, "Giá của bạn 2.200.000đ", sale nhắn');
select t.bang((public.fn_chu_xem_yeu_cau(current_setting('t.y1')::uuid) ->> 'sdt_sale'), '0900000003',
              'YC9.2 bước 2 PQ2.CHU CN9 có số sale đã kết nối để "Gọi"');
select t.ok((select count(*) = 0 from jsonb_object_keys(public.fn_chu_xem_yeu_cau(current_setting('t.y1')::uuid)) k
             where k in ('gia_ban_dem', 'gia_ban', 'tong_gia_ban', 'muc_cong', 'tien_chenh'))
            and public.fn_chu_xem_yeu_cau(current_setting('t.y1')::uuid)::text not like '%2600000%',
            'YC9.2-NT2 KT-DB.3.6 CN9 không có giá bán, mức cộng, tiền chênh');
select t.thoat();
select t.dang_nhap(t.id('tuan'));
select t.bang(jsonb_array_length(pg_temp.dang_cho()), 0, 'YC9.2-NT8 PQ10.CHU khối yêu cầu của Anh Tuấn không có yêu cầu tới căn Chị Hoa');
select t.thoat();
select t.dang_nhap(t.id('hung'));
select t.bang(jsonb_array_length(pg_temp.dang_cho()), 0, 'YC9.1-NT9 PQ10.SALE khối yêu cầu của chủ nhà không trả gì cho sale');
select t.thoat();

-- ===== YC9.2-NT8: Anh Tuấn không đọc, chấp nhận, từ chối; sale không tự trả lời; chủ không hủy thay sale =====
select t.dang_nhap(t.id('tuan'));
select set_config('t.loi_khong_co', pg_temp.loi(format('select public.fn_chap_nhan_yeu_cau(%L)', pg_temp.khong_co())), true);
select t.ok(current_setting('t.loi_khong_co') like '42501: Không tìm thấy yêu cầu%', 'YC9.2-NT8 yêu cầu không có: 42501 "Không tìm thấy yêu cầu"');
select t.bang(pg_temp.loi(format('select public.fn_chu_xem_yeu_cau(%L)', current_setting('t.y1'))), current_setting('t.loi_khong_co'),
              'YC9.2-NT8 PQ10.CHU Anh Tuấn đọc yêu cầu tới 1509: cùng lỗi như yêu cầu không có');
select t.bang(pg_temp.loi(format('select public.fn_chap_nhan_yeu_cau(%L)', current_setting('t.y1'))), current_setting('t.loi_khong_co'),
              'YC9.2-NT8 PQ10.CHU Anh Tuấn chấp nhận yêu cầu tới 1509: cùng lỗi như yêu cầu không có');
select t.bang(pg_temp.loi(format('select public.fn_tu_choi_yeu_cau(%L, null)', current_setting('t.y1'))), current_setting('t.loi_khong_co'),
              'YC9.2-NT8 PQ10.CHU Anh Tuấn từ chối yêu cầu tới 1509: cùng lỗi như yêu cầu không có');
select t.thoat();
select t.dang_nhap(t.id('hung'));
select t.bang(pg_temp.loi(format('select public.fn_chap_nhan_yeu_cau(%L)', current_setting('t.y1'))), current_setting('t.loi_khong_co'),
              'YC9.1-NT9 Hùng tự chấp nhận yêu cầu của mình: cùng lỗi như yêu cầu không có');
select t.bang(pg_temp.loi(format('select public.fn_tu_choi_yeu_cau(%L, null)', current_setting('t.y1'))), current_setting('t.loi_khong_co'),
              'YC9.1-NT9 Hùng tự từ chối yêu cầu của mình: cùng lỗi như yêu cầu không có');
select t.thoat();
select t.dang_nhap(t.id('lan'));
select t.bang(pg_temp.loi(format('select public.fn_chap_nhan_yeu_cau(%L)', current_setting('t.y1'))), current_setting('t.loi_khong_co'),
              'YC9.1-NT9 Sale Lan chấp nhận yêu cầu của Hùng: cùng lỗi như yêu cầu không có');
select t.thoat();
select t.dang_nhap(t.id('hoa'));
select t.ok(pg_temp.loi(format('select public.fn_huy_yeu_cau(%L)', current_setting('t.y1'))) like '42501:%',
            'YC9.2-NT8 PQ10.CHU Chị Hoa hủy yêu cầu thay sale: không được');
select t.loi(format($$update public.yeu_cau_dat_phong set trang_thai = 'da_chot' where id = %L$$, current_setting('t.y1')),
             '42501', 'YC9.2-NT8 KT-DB.3.3 Chị Hoa sửa thẳng bảng yêu cầu: bị từ chối');
select t.thoat();
select t.bang(pg_temp.tt(current_setting('t.y1')::uuid), 'cho', 'YC9.2-NT8 sau các lệnh trái quyền, Y1 vẫn chờ');
select t.bang(pg_temp.so_bk(current_setting('t.y1')::uuid), 0::bigint, 'YC9.2-NT8 sau các lệnh trái quyền, không có đặt phòng');
select t.loi(format($$select public.fn_chap_nhan_yeu_cau(%L)$$, current_setting('t.y1')), '28000',
             'YC9.2-NT8 chưa đăng nhập chấp nhận: bị từ chối');

-- ===== YC9.2-NT3: Chị Hoa chấp nhận Y1 =====
select t.dang_nhap(t.id('hoa'));
select set_config('t.kq1', pg_temp.chap(current_setting('t.y1')::uuid)::text, true);
select t.thoat();
select t.bang((current_setting('t.kq1')::jsonb ->> 'trang_thai'), 'da_chot', 'YC9.2-NT3 lệnh chấp nhận trả trạng thái Đã chốt');
select t.bang((current_setting('t.kq1')::jsonb ->> 'doi_trang_thai'), 'false', 'YC9.2-NT3 chấp nhận được: doi_trang_thai = false');
select t.bang(pg_temp.tt(current_setting('t.y1')::uuid), 'da_chot', 'YC9.2-NT3 Y1 sang Đã chốt');
select t.bang((select concat_ws('|', b.can_id::text, b.ngay_nhan::text, b.ngay_tra::text, b.nguon, b.sale_id::text, b.tao_boi::text,
                                b.tien_phong::text, b.trang_thai)
               from public.booking b where b.yeu_cau_id = current_setting('t.y1')::uuid),
              concat_ws('|', t.can('1509')::text, pg_temp.d(0)::text, pg_temp.d(2)::text, 'tu_yeu_cau', t.id('hung')::text,
                        t.id('hoa')::text, '2200000', 'hieu_luc'),
              'YC9.2-NT3 B1 vào lịch 1509, nguồn từ yêu cầu, Hùng là người đặt, giá chủ nhà 2.200.000đ');
select t.bang((select string_agg(bd.dem::text || '=' || bd.tien::text, ',' order by bd.dem)
               from public.booking_dem bd join public.booking b on b.id = bd.booking_id
               where b.yeu_cau_id = current_setting('t.y1')::uuid),
              (select string_agg((y.ngay_nhan + (i - 1))::text || '=' || y.gia_chu_dem[i]::text, ',' order by i)
               from public.yeu_cau_dat_phong y, generate_series(1, y.ngay_tra - y.ngay_nhan) i
               where y.id = current_setting('t.y1')::uuid),
              'YC9.2-NT3 QT2.1 đêm S, S+1 mang đúng giá chủ từng đêm đã chốt lúc gửi');
select t.bang((select y.booking_id from public.yeu_cau_dat_phong y where y.id = current_setting('t.y1')::uuid),
              (select b.id from public.booking b where b.yeu_cau_id = current_setting('t.y1')::uuid),
              'YC9 Dữ liệu yêu cầu đã chốt trỏ tới đặt phòng của nó');
select t.bang((select r.tien_thu_khach from public.booking_rieng r join public.booking b on b.id = r.booking_id
               where b.yeu_cau_id = current_setting('t.y1')::uuid and r.nguoi_id = t.id('hung')),
              (select sum(x)::bigint from public.yeu_cau_rieng r, unnest(r.gia_ban_dem) x where r.yeu_cau_id = current_setting('t.y1')::uuid),
              'YC9 Dữ liệu QD11 phần riêng của Hùng mang giá bán đã chốt lúc gửi');
select t.bang(pg_temp.so_tb(t.id('hung'), 'yeu_cau_da_chot', current_setting('t.y1')::uuid), 1::bigint,
              'YC9.2-NT3 YC12 Hùng được báo: một thông báo "Chủ nhà chấp nhận yêu cầu"');
select t.bang((select concat_ws('|', j ->> 'ten_chu', j ->> 'ma_can', j ->> 'tong_gia_chu')
               from pg_temp.tb(t.id('hung'), 'yeu_cau_da_chot', current_setting('t.y1')::uuid) j),
              'Chị Hoa|1509|2200000', 'YC9.2-NT3 YC12 thông báo "Chị Hoa đã chấp nhận đặt phòng", 1509, giá chủ nhà');
select t.ok(not (pg_temp.tb(t.id('hung'), 'yeu_cau_da_chot', current_setting('t.y1')::uuid) ? 'tong_gia_ban'),
            'YC9.2-NT3 PQ19 thông báo chấp nhận không mang giá bán');
select t.bang(pg_temp.tt(current_setting('t.y2')::uuid), 'bi_tu_choi',
              'YC9 Quy tắc "Một đêm, một bên thắng" QT1.4-VD2 Y2 của Lan chồng đêm thành Bị từ chối');
select t.dang_nhap(t.id('hoa'));
select t.bang(coalesce(t.so(format($$select * from public.booking_rieng r join public.booking b on b.id = r.booking_id
                                   where b.yeu_cau_id = %L$$, current_setting('t.y1'))), 0), 0::bigint,
              'YC9.2-NT2 QD11 Chị Hoa không đọc được phần riêng của Hùng trong B1');
select t.bang(jsonb_array_length(pg_temp.dang_cho()), 0, 'YC9.2-NT7 hết yêu cầu chờ thì khối CN1-03 trống');
-- Gọi lại (mạng rớt, bấm lại): trả kết quả cũ, không thêm đặt phòng.
select t.bang((pg_temp.chap(current_setting('t.y1')::uuid) ->> 'doi_trang_thai'), 'false', 'YC9.2 QT5.6 chấp nhận lại Y1: trả kết quả đã có');
select t.thoat();
select t.bang(pg_temp.so_bk(current_setting('t.y1')::uuid), 1::bigint, 'YC9.2 QT5.6 chấp nhận lại không tạo đặt phòng thứ hai');
select t.bang(pg_temp.so_tb(t.id('hung'), 'yeu_cau_da_chot', current_setting('t.y1')::uuid), 1::bigint,
              'YC9.2 QT5.6 chấp nhận lại không ghi thông báo thứ hai');
select t.dang_nhap(t.id('lan'));
select t.ok(pg_temp.loi(format($$select public.fn_gui_yeu_cau(%L, %L, %L, null, gen_random_uuid())$$,
                               t.can('1509'), pg_temp.d(1), pg_temp.d(2))) = 'P0001: Căn này đã được đặt rồi',
            'YC9.2-NT3 QT1.4 đêm S+1 đã kín: Lan gửi yêu cầu mới bị chặn');
select t.thoat();

-- ===== YC9.2-NT4, NT11: từ chối kèm lý do, không lý do =====
select t.dang_nhap(t.id('hung'));
select set_config('t.y3', pg_temp.gui(t.can('3402'), pg_temp.d(0), pg_temp.d(2))::text, true);
select set_config('t.y4', pg_temp.gui(t.can('3402'), pg_temp.d(7), pg_temp.d(9))::text, true);
select set_config('t.y5', pg_temp.gui(t.can('3402'), pg_temp.d(14), pg_temp.d(15))::text, true);
select t.thoat();
select t.dang_nhap(t.id('hoa'));
select t.bang(pg_temp.loi(format('select public.fn_tu_choi_yeu_cau(%L, %L)', current_setting('t.y3'), 'Không thích')),
              '22023: Lý do không hợp lệ', 'YC9.2 bước 4 chỉ có ba chip: lý do khác ba chip bị từ chối');
select set_config('t.kq3', pg_temp.tu_choi(current_setting('t.y3')::uuid, 'Đã có khách đặt')::text, true);
select t.bang((current_setting('t.kq3')::jsonb ->> 'trang_thai'), 'bi_tu_choi', 'YC9.2-NT4 từ chối "Đã có khách đặt": trả Bị từ chối');
select t.bang((current_setting('t.kq3')::jsonb ->> 'ly_do_tu_choi'), 'Đã có khách đặt', 'YC9.2-NT4 kết quả mang lý do');
select set_config('t.kq4', pg_temp.tu_choi(current_setting('t.y4')::uuid, '   ')::text, true);
select set_config('t.kq5', pg_temp.tu_choi(current_setting('t.y5')::uuid, null)::text, true);
select t.thoat();
select t.bang(pg_temp.tt(current_setting('t.y3')::uuid), 'bi_tu_choi', 'YC9.2-NT4 Y3 có nhãn "Bị từ chối"');
select t.bang(pg_temp.so_bk(current_setting('t.y3')::uuid), 0::bigint, 'YC9.2-NT4 từ chối không tạo đặt phòng');
select t.bang((select count(*) from public.booking where can_id = t.can('3402')), 0::bigint,
              'YC9.2 bước 5 ngày của Y3 vẫn trống trong lịch');
select t.bang(pg_temp.so_tb(t.id('hung'), 'yeu_cau_bi_tu_choi', current_setting('t.y3')::uuid), 1::bigint,
              'YC9.2-NT4 YC12 Hùng có một thông báo bị từ chối');
select t.bang((pg_temp.tb(t.id('hung'), 'yeu_cau_bi_tu_choi', current_setting('t.y3')::uuid) ->> 'ly_do'), 'Đã có khách đặt',
              'YC9.2-NT4 thông báo cho Hùng kèm lý do "Đã có khách đặt"');
select t.dang_nhap(t.id('hung'));
select t.bang((select concat_ws('|', j ->> 'trang_thai', j ->> 'ly_do_tu_choi') from public.fn_yeu_cau_cua_toi(current_setting('t.y3')::uuid) j),
              'bi_tu_choi|Đã có khách đặt', 'YC9.2-NT4 sale thấy Bị từ chối và lý do "Đã có khách đặt"');
select t.bang((select concat_ws('|', j ->> 'trang_thai', coalesce(j ->> 'ly_do_tu_choi', 'null'), j -> 'chu' ->> 'ten')
               from public.fn_yeu_cau_cua_toi(current_setting('t.y5')::uuid) j),
              'bi_tu_choi|null|Chị Hoa', 'YC9.2-NT11 không chọn lý do: sale thấy Bị từ chối, không lý do, tên Chị Hoa');
select t.bang((select concat_ws('|', j ->> 'trang_thai', coalesce(j ->> 'ly_do_tu_choi', 'null'))
               from public.fn_yeu_cau_cua_toi(current_setting('t.y4')::uuid) j),
              'bi_tu_choi|null', 'YC9.2-NT11 lý do toàn khoảng trắng coi như không chọn');
select t.thoat();
select t.bang((select concat_ws('|', coalesce(j ->> 'ly_do', 'null'), j ->> 'ten_chu')
               from pg_temp.tb(t.id('hung'), 'yeu_cau_bi_tu_choi', current_setting('t.y5')::uuid) j),
              'null|Chị Hoa', 'YC9.2-NT11 thông báo cho Hùng không lý do, có tên Chị Hoa để ghi "Chị Hoa không nhận đặt phòng."');
select t.ok(not exists (select 1 from public.thong_bao tb, jsonb_object_keys(tb.noi_dung) k
                        where tb.loai = 'yeu_cau_bi_tu_choi' and k in ('gia_ban', 'tong_gia_ban', 'ten_khach', 'ten_sale')),
            'YC9.2 PQ19 thông báo bị từ chối không có giá bán, tên khách, tên sale');
select t.dang_nhap(t.id('hoa'));
select t.bang((pg_temp.chap(current_setting('t.y3')::uuid) ->> 'doi_trang_thai'), 'true',
              'YC9 Trạng thái yêu cầu Bị từ chối là cuối: chấp nhận sau khi từ chối thì báo đã đổi trạng thái');
select t.thoat();
select t.bang(pg_temp.so_bk(current_setting('t.y3')::uuid), 0::bigint, 'YC9 Trạng thái yêu cầu chấp nhận yêu cầu đã từ chối: không có đặt phòng');

-- ===== YC9.2-NT5: chấp nhận yêu cầu sale vừa hủy ở máy khác =====
select t.dang_nhap(t.id('hung'));
select set_config('t.y6', pg_temp.gui(t.can('3402'), pg_temp.d(21), pg_temp.d(23))::text, true);
select t.thoat();
select t.dang_nhap(t.id('hoa'));
select set_config('t.kq6_xem', public.fn_chu_xem_yeu_cau(current_setting('t.y6')::uuid)::text, true); -- CN9 đang mở
select t.thoat();
select t.dang_nhap(t.id('hung'));
select public.fn_huy_yeu_cau(current_setting('t.y6')::uuid);
select t.thoat();
select t.dang_nhap(t.id('hoa'));
select set_config('t.kq6', pg_temp.chap(current_setting('t.y6')::uuid)::text, true);
select t.thoat();
select t.bang((select concat_ws('|', j ->> 'trang_thai', j ->> 'doi_trang_thai') from (select current_setting('t.kq6')::jsonb j) x),
              'da_huy|true', 'YC9.2-NT5 HV3 chấp nhận yêu cầu vừa hủy: app nhận trạng thái mới và "đã đổi trạng thái"');
select t.bang(pg_temp.so_bk(current_setting('t.y6')::uuid), 0::bigint, 'YC9.2-NT5 không có đặt phòng');
select t.bang(pg_temp.tt(current_setting('t.y6')::uuid), 'da_huy', 'YC9.2-NT5 yêu cầu vẫn Đã hủy');
select t.dang_nhap(t.id('hoa'));
select t.bang((pg_temp.tu_choi(current_setting('t.y6')::uuid, null) ->> 'doi_trang_thai'), 'true',
              'YC9.2-NT5 từ chối yêu cầu vừa hủy: báo đã đổi trạng thái');
select t.thoat();
select t.bang(pg_temp.tt(current_setting('t.y6')::uuid), 'da_huy', 'YC9.2-NT5 từ chối sau khi hủy không đổi trạng thái');

-- ===== YC9.2-NT9: chủ đã ngừng cho Lan xem lịch rồi chấp nhận yêu cầu Lan gửi trước đó =====
select t.dang_nhap(t.id('lan'));
select set_config('t.y7', pg_temp.gui(t.can('1509'), pg_temp.d(28), pg_temp.d(30))::text, true);
select set_config('t.y8', pg_temp.gui(t.can('1509'), pg_temp.d(35), pg_temp.d(36))::text, true);
select t.thoat();
update public.ket_noi set trang_thai = 'chu_ngung' where id = t.kn('hoa', 'lan');
select t.dang_nhap(t.id('hoa'));
select t.bang((public.fn_chu_xem_yeu_cau(current_setting('t.y7')::uuid) ->> 'con_ket_noi'), 'false',
              'YC9.2-NT9 CN9 biết sale không còn kết nối');
select t.bang(pg_temp.loi(format('select public.fn_chap_nhan_yeu_cau(%L)', current_setting('t.y7'))),
              'P0001: Sale này không còn kết nối với bạn, không nhận được đặt phòng.',
              'YC9.2-NT9 YC9-H4 database từ chối chấp nhận, báo "Sale này không còn kết nối với bạn, không nhận được đặt phòng."');
select t.thoat();
select t.bang(pg_temp.so_bk(current_setting('t.y7')::uuid), 0::bigint, 'YC9.2-NT9 không có đặt phòng');
select t.bang(pg_temp.tt(current_setting('t.y7')::uuid), 'cho', 'YC9.2-NT9 yêu cầu vẫn Chờ chủ');
select t.dang_nhap(t.id('hoa'));
select t.bang((pg_temp.tu_choi(current_setting('t.y7')::uuid, 'Lý do khác') ->> 'trang_thai'), 'bi_tu_choi',
              'YC9.2-NT9 PQ10.SALE Chị Hoa vẫn từ chối được yêu cầu của Lan đã bị ngừng');
select t.thoat();
select t.bang(pg_temp.tt(current_setting('t.y7')::uuid), 'bi_tu_choi', 'YC9.2-NT9 yêu cầu của Lan sang Bị từ chối');
-- Lan bỏ nguồn (sale_bo): cũng không chấp nhận được.
update public.ket_noi set trang_thai = 'sale_bo' where id = t.kn('hoa', 'lan');
select t.dang_nhap(t.id('hoa'));
select t.bang(pg_temp.loi(format('select public.fn_chap_nhan_yeu_cau(%L)', current_setting('t.y8'))),
              'P0001: Sale này không còn kết nối với bạn, không nhận được đặt phòng.',
              'YC9.2-NT9 YC9-H4 sale đã bỏ nguồn: database từ chối chấp nhận');
select t.thoat();
update public.ket_noi set trang_thai = 'da_ket_noi' where id = t.kn('hoa', 'lan');

-- ===== YC9.2-NT10: ngày nhận đã qua là Hết hạn; ngày nhận hôm nay vẫn chấp nhận được =====
select t.tao_yeu_cau('y9', t.can('3402'), t.id('hung'), public.local_today() - 1, public.local_today() + 1,
                     array[800000, 800000]::bigint[]);
select t.dang_nhap(t.id('hoa'));
select t.bang((public.fn_chu_xem_yeu_cau(t.b('y9')) ->> 'trang_thai'), 'het_han', 'YC9.2-NT10 YC9-H5 yêu cầu chờ có ngày nhận hôm qua đọc ra Hết hạn');
select t.ok(not exists (select 1 from jsonb_array_elements(pg_temp.dang_cho()) e where e ->> 'id' = t.b('y9')::text),
            'YC9.2-NT10 yêu cầu Hết hạn không có trong khối CN1-03');
select set_config('t.kq9', pg_temp.chap(t.b('y9'))::text, true);
select t.thoat();
select t.bang((select concat_ws('|', j ->> 'trang_thai', j ->> 'doi_trang_thai') from (select current_setting('t.kq9')::jsonb j) x),
              'het_han|true', 'YC9.2-NT10 chủ nhà chấp nhận yêu cầu Hết hạn: bị từ chối, báo trạng thái Hết hạn');
select t.bang(pg_temp.so_bk(t.b('y9')), 0::bigint, 'YC9.2-NT10 không có đặt phòng');
select t.bang(pg_temp.tt(t.b('y9')), 'het_han', 'YC9.2-NT10 yêu cầu ghi Hết hạn');
select t.bang(pg_temp.so_tb(t.id('hung'), 'yeu_cau_het_han', t.b('y9')), 1::bigint, 'YC9.2-NT10 sale có một thông báo hết hạn');
select t.dang_nhap(t.id('hoa'));
select pg_temp.chap(t.b('y9'));
select pg_temp.tu_choi(t.b('y9'), null);
select t.thoat();
select t.bang(pg_temp.so_tb(t.id('hung'), 'yeu_cau_het_han', t.b('y9')), 1::bigint,
              'YC9.2-NT10 bấm lại chấp nhận, từ chối: sale vẫn đúng một thông báo hết hạn');
select t.bang(pg_temp.tt(t.b('y9')), 'het_han', 'YC9.2-NT10 Hết hạn là cuối: từ chối sau đó không đổi');
-- Quá 14 ngày từ lúc gửi cũng Hết hạn.
select t.tao_yeu_cau('y10', t.can('3402'), t.id('hung'), pg_temp.d(42), pg_temp.d(43), array[1100000]::bigint[]);
update public.yeu_cau_dat_phong set gui_luc = now() - interval '15 days', han_luc = now() - interval '1 day' where id = t.b('y10');
select t.dang_nhap(t.id('hoa'));
select t.bang((pg_temp.tu_choi(t.b('y10'), 'Đang sửa phòng') ->> 'trang_thai'), 'het_han', 'YC9 Dữ liệu quá 14 ngày: từ chối thì nhận Hết hạn');
select t.thoat();
select t.bang(pg_temp.so_tb(t.id('hung'), 'yeu_cau_het_han', t.b('y10')), 1::bigint, 'YC9 Dữ liệu quá 14 ngày: một thông báo hết hạn');
select t.ok((select tb.noi_dung::text not like '%gia_ban%' from public.thong_bao tb
             where tb.loai = 'yeu_cau_het_han' and tb.doi_tuong_id = t.b('y10')),
            'YC9.2 PQ19 thông báo hết hạn không có giá bán');
-- Ngày nhận là hôm nay vẫn chấp nhận được.
select t.tao_yeu_cau('y11', t.can('3402'), t.id('hung'), public.local_today(), public.local_today() + 1, array[800000]::bigint[]);
select t.dang_nhap(t.id('hoa'));
select t.bang((pg_temp.chap(t.b('y11')) ->> 'trang_thai'), 'da_chot', 'YC9.2-NT10 YC9-H5 ngày nhận là hôm nay vẫn chấp nhận được');
select t.thoat();
select t.bang((select tien_phong from public.booking where yeu_cau_id = t.b('y11')), 800000::bigint,
              'YC9.2-NT10 đặt phòng hôm nay mang giá đã chốt 800.000đ');

-- ===== QD6: chặn trùng cuối cùng là ràng buộc của đặt phòng =====
-- Yêu cầu chờ mà đêm đã có đặt phòng (ghi thẳng, không qua trigger từ chối): chấp nhận bị chặn, không lưu.
select t.tao_yeu_cau('y12', t.can('3402'), t.id('hung'), pg_temp.d(49), pg_temp.d(51), array[1100000, 800000]::bigint[]);
alter table public.booking disable trigger booking_sau_khi_ghi;
select t.tao_booking('b_chan', t.can('3402'), pg_temp.d(50), pg_temp.d(52), 1900000);
alter table public.booking enable trigger booking_sau_khi_ghi;
select t.dang_nhap(t.id('hoa'));
select t.ok(pg_temp.loi(format('select public.fn_chap_nhan_yeu_cau(%L)', t.b('y12'))) like 'P0001:%',
            'YC9.2 QD6 QT1.1 chấp nhận yêu cầu có đêm đã kín: ràng buộc đặt phòng chặn');
select t.thoat();
select t.bang(pg_temp.so_bk(t.b('y12')), 0::bigint, 'YC9.2 QD6 không có đặt phòng thứ hai trùng đêm');
select t.bang(pg_temp.tt(t.b('y12')), 'cho', 'YC9.2 QD6 yêu cầu bị chặn vẫn Chờ chủ');
