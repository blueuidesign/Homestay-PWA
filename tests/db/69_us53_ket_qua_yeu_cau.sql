-- US53 · Sale nhận kết quả (YC9.4). Viết trước migration (US53-TA1, CL14.5): task sau không sửa file này.
-- Hợp đồng database (YC9 "Dữ liệu", "Trạng thái yêu cầu", "Người xóa tài khoản", "Ai được làm gì", QT2.1, QD7, QD11, QD13,
-- PQ5.SALE, PQ10.SALE, PQ11, PQ19):
--   fn_ket_qua_yeu_cau(p_yeu_cau_id uuid) returns jsonb (S3-04, S3-04-01, S3-05, S3-09): yêu cầu của người gọi, kể cả khi
--     đã bị ngừng: id, can_id, ma_can, ten_toa, so_phong_ngu, chu {ten, da_xoa} (không số điện thoại), ngay_nhan, ngay_tra,
--     so_dem, dem [{ngay, gia_chu, gia_ban}] (giá đã chốt lúc gửi), tong_gia_chu, tong_gia_ban, trang_thai (chờ mà quá hạn
--     đọc ra 'het_han'), ly_do_tu_choi, gui_luc, han_luc, het_han_vi ('qua_14_ngay' | 'qua_ngay_nhan', chỉ khi het_han:
--     mốc nào tới trước, hạn 14 ngày hay đầu ngày sau ngày nhận), con_xem_can (người gọi còn xem được căn).
--     Không phải yêu cầu của người gọi (kể cả chủ căn): 42501 "Không tìm thấy yêu cầu", như không có.
--   fn_can_tuong_tu(p_yeu_cau_id uuid) returns jsonb: mảng căn nguồn người gọi còn được xem, trống mọi đêm của yêu cầu
--     còn chưa qua (từ max(ngày nhận, hôm nay) tới trước ngày trả), bỏ căn của yêu cầu: [{can_id, ma_can, ten_toa,
--     so_phong_ngu, ten_chu, tong_gia_ban, tu, den}]. Không có giá chủ nhà. Không phải yêu cầu của người gọi: 42501.
--   fn_het_han_yeu_cau() returns integer: việc định kỳ (pg_cron mỗi 10 phút khi máy có); yêu cầu chờ quá 14 ngày hay có
--     ngày nhận trước hôm nay sang 'het_han', trả số dòng đổi. Thông báo 'yeu_cau_het_han' do trigger US51 ghi một lần.
--     App không gọi được.
-- Ngày: file chạy trong một giao dịch, now() cố định. "10/10 → 12/10" thay bằng đêm thứ Bảy S và Chủ nhật S+1 của một tuần
-- sau hôm nay ít nhất 14 ngày (như tests/db/67). 1509 S → S+2: giá chủ 2.200.000đ, Hùng bán 2.600.000đ (+200k mỗi đêm);
-- 3402 giá chủ 1.900.000đ, Hùng bán 2.700.000đ (+400k mặc định); 1103 giá chủ 1.400.000đ, Hùng bán 2.200.000đ.
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

-- Anh Tuấn cho Hùng xem 1103 để có căn tương tự của chủ nhà khác.
insert into public.ket_noi (id, chu_id, sale_id, trang_thai, nguon, pham_vi, xem_coc)
values ('00000000-0000-0000-0003-0000000000a1', t.id('tuan'), t.id('hung'), 'da_ket_noi', 'link_moi', 'tat_ca', true);

create or replace function pg_temp.gui(p_can uuid, p_nhan date, p_tra date) returns uuid
language plpgsql as $$
declare v jsonb;
begin
  select public.fn_gui_yeu_cau(p_can, p_nhan, p_tra, null, gen_random_uuid()) into v;
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

create or replace function pg_temp.kq(p_id text) returns jsonb language plpgsql as $$
declare v jsonb;
begin
  select public.fn_ket_qua_yeu_cau(p_id::uuid) into v;
  return v;
exception when others then
  raise notice 'lỗi: % (fn_ket_qua_yeu_cau)', sqlerrm;
  return null;
end $$;

create or replace function pg_temp.tuong_tu(p_id text) returns jsonb language plpgsql as $$
declare v jsonb;
begin
  select public.fn_can_tuong_tu(p_id::uuid) into v;
  return v;
exception when others then
  raise notice 'lỗi: % (fn_can_tuong_tu)', sqlerrm;
  return null;
end $$;

create or replace function pg_temp.het_han() returns integer language plpgsql as $$
declare v integer;
begin
  select public.fn_het_han_yeu_cau() into v;
  return v;
exception when others then
  raise notice 'lỗi: % (fn_het_han_yeu_cau)', sqlerrm;
  return null;
end $$;

create or replace function pg_temp.tt(p_id uuid) returns text language sql security definer as $$
  select trang_thai from public.yeu_cau_dat_phong where id = p_id
$$;
create or replace function pg_temp.so_tb(p_nguoi uuid, p_loai text, p_yeu_cau uuid) returns bigint language sql security definer as $$
  select count(*) from public.thong_bao where nguoi_nhan = p_nguoi and loai = p_loai and doi_tuong_id = p_yeu_cau
$$;

-- ===== Danh mục và quyền gọi =====
select t.ok((select count(*) = 3 and bool_and(p.prosecdef)
                    and bool_and(exists (select 1 from unnest(p.proconfig) c where c like 'search_path=%'))
             from pg_proc p where p.pronamespace = 'public'::regnamespace
               and p.proname in ('fn_ket_qua_yeu_cau', 'fn_can_tuong_tu', 'fn_het_han_yeu_cau')),
            'YC9.4 KT-DB.3.3 có fn_ket_qua_yeu_cau, fn_can_tuong_tu, fn_het_han_yeu_cau chạy security definer, đặt search_path');
select t.ok(not exists (select 1 from pg_proc p where p.pronamespace = 'public'::regnamespace
                          and p.proname in ('fn_ket_qua_yeu_cau', 'fn_can_tuong_tu', 'fn_het_han_yeu_cau')
                          and has_function_privilege('anon', p.oid, 'execute'))
            and exists (select 1 from pg_proc p where p.pronamespace = 'public'::regnamespace and p.proname = 'fn_ket_qua_yeu_cau'),
            'YC9.4 KT-DB.3.1 người chưa đăng nhập không gọi được ba lệnh');
select t.ok(exists (select 1 from pg_proc p where p.pronamespace = 'public'::regnamespace and p.proname = 'fn_het_han_yeu_cau')
            and not exists (select 1 from pg_proc p where p.pronamespace = 'public'::regnamespace
                              and p.proname = 'fn_het_han_yeu_cau' and has_function_privilege('authenticated', p.oid, 'execute')),
            'YC9.4 YC9 Dữ liệu việc hết hạn: app không gọi được fn_het_han_yeu_cau');

-- ===== YC9.4-NT1: chủ nhà chấp nhận, sale thấy Đã chốt, các sale khác thấy Kín =====
select t.dang_nhap(t.id('hung'));
select set_config('t.y1', pg_temp.gui(t.can('1509'), pg_temp.d(0), pg_temp.d(2))::text, true);
select t.thoat();
select t.ok(current_setting('t.y1', true) <> '', 'YC9.4 dữ liệu: Hùng gửi Y1 1509 S → S+2');
select t.dang_nhap(t.id('lan'));
select t.bang((select string_agg(o, ',' order by dem) from public.fn_sale_lich(pg_temp.d(0), pg_temp.d(2)) where can_id = t.can('1509')),
              'trong,trong', 'YC9.4-NT1 trước khi chấp nhận: Lan thấy 1509 S, S+1 trống (yêu cầu chưa chiếm đêm)');
select t.thoat();
select t.dang_nhap(t.id('hoa'));
select public.fn_chap_nhan_yeu_cau(current_setting('t.y1')::uuid);
select t.thoat();
select t.dang_nhap(t.id('hung'));
select t.bang((select concat_ws('|', j ->> 'trang_thai', j -> 'chu' ->> 'ten', j ->> 'ma_can', j ->> 'ten_toa', j ->> 'ngay_nhan',
                                j ->> 'ngay_tra', j ->> 'so_dem', j ->> 'tong_gia_chu', j ->> 'tong_gia_ban')
               from (select pg_temp.kq(current_setting('t.y1')) j) x),
              concat_ws('|', 'da_chot', 'Chị Hoa', '1509', 'ICON40', pg_temp.d(0)::text, pg_temp.d(2)::text, '2', '2200000', '2600000'),
              'YC9.4-NT1 S3-04 Hùng thấy Đã chốt, Chị Hoa, 1509 ICON40, 2 đêm, giá chủ 2.200.000đ, giá bán 2.600.000đ');
select t.ok(pg_temp.kq(current_setting('t.y1')) -> 'chu' ->> 'so_dien_thoai' is null
            and pg_temp.kq(current_setting('t.y1')) ->> 'het_han_vi' is null,
            'YC9.4-NT1 kết quả không có số điện thoại chủ nhà, không có lý do hết hạn');
select t.thoat();
select t.dang_nhap(t.id('lan'));
select t.bang((select string_agg(o, ',' order by dem) from public.fn_sale_lich(pg_temp.d(0), pg_temp.d(2)) where can_id = t.can('1509')),
              'kin,kin', 'YC9.4-NT1 Lan (sale khác) thấy 1509 S, S+1 Kín');
select t.thoat();
select t.bang(pg_temp.so_tb(t.id('hung'), 'yeu_cau_da_chot', current_setting('t.y1')::uuid), 1::bigint,
              'YC9.4-NT1 bước 1 sale có một thông báo đã chấp nhận');

-- ===== Vi phạm quyền: sale khác, chủ căn, người chưa đăng nhập =====
select t.dang_nhap(t.id('lan'));
select t.bang(pg_temp.loi(format('select public.fn_ket_qua_yeu_cau(%L)', current_setting('t.y1'))),
              '42501: Không tìm thấy yêu cầu', 'YC9.4 YC9.1-NT9 PQ10.SALE Lan không đọc được kết quả yêu cầu của Hùng');
select t.bang(pg_temp.loi(format('select public.fn_ket_qua_yeu_cau(%L)', '00000000-0000-0000-00ff-000000000000')),
              '42501: Không tìm thấy yêu cầu', 'YC9.4 PQ10.SALE yêu cầu không có: cùng câu lỗi, Lan không biết yêu cầu của Hùng có tồn tại');
select t.bang(pg_temp.loi(format('select public.fn_can_tuong_tu(%L)', current_setting('t.y1'))),
              '42501: Không tìm thấy yêu cầu', 'YC9.4 PQ10.SALE Lan không đọc được căn tương tự của yêu cầu của Hùng');
select t.thoat();
select t.dang_nhap(t.id('hoa'));
select t.bang(pg_temp.loi(format('select public.fn_ket_qua_yeu_cau(%L)', current_setting('t.y1'))),
              '42501: Không tìm thấy yêu cầu', 'YC9.4 PQ11.CHU chủ căn không đọc được kết quả của sale (có giá bán)');
select t.bang(pg_temp.loi(format('select public.fn_can_tuong_tu(%L)', current_setting('t.y1'))),
              '42501: Không tìm thấy yêu cầu', 'YC9.4 PQ11.CHU chủ căn không đọc được căn tương tự của sale');
select t.thoat();
select t.khach();
select t.ok(pg_temp.loi(format('select public.fn_ket_qua_yeu_cau(%L)', current_setting('t.y1'))) is not null,
            'YC9.4 KT-DB.3.1 khách chưa đăng nhập không đọc được kết quả');
select t.thoat();

-- ===== YC9.4-NT2, NT5: bị từ chối, căn tương tự có giá bán, không giá chủ, không căn của yêu cầu =====
select t.dang_nhap(t.id('hung'));
select set_config('t.y2', pg_temp.gui(t.can('1509'), pg_temp.d(7), pg_temp.d(9))::text, true);
select t.thoat();
select t.dang_nhap(t.id('hoa'));
select public.fn_tu_choi_yeu_cau(current_setting('t.y2')::uuid, 'Đã có khách đặt');
select t.thoat();
select t.dang_nhap(t.id('hung'));
select t.bang((select concat_ws('|', j ->> 'trang_thai', j ->> 'ly_do_tu_choi', j -> 'chu' ->> 'ten')
               from (select pg_temp.kq(current_setting('t.y2')) j) x),
              'bi_tu_choi|Đã có khách đặt|Chị Hoa', 'YC9.4-NT2 S3-05 Hùng thấy Bị từ chối, lý do "Đã có khách đặt", Chị Hoa');
select t.bang((select string_agg(concat_ws(':', e ->> 'ma_can', e ->> 'tong_gia_ban', e ->> 'ten_chu'), ',' order by e ->> 'ma_can')
               from jsonb_array_elements(pg_temp.tuong_tu(current_setting('t.y2'))) e),
              '1103:2200000:Anh Tuấn,3402:2700000:Chị Hoa',
              'YC9.4-NT5 căn tương tự: 1103 bán 2.200.000đ (Anh Tuấn), 3402 bán 2.700.000đ (Chị Hoa)');
select t.ok(not exists (select 1 from jsonb_array_elements(pg_temp.tuong_tu(current_setting('t.y2'))) e
                        where e ->> 'can_id' = t.can('1509')::text)
            and jsonb_array_length(pg_temp.tuong_tu(current_setting('t.y2'))) > 0,
            'YC9.4-NT5 căn tương tự không có căn của yêu cầu (1509)');
select t.ok(not exists (select 1 from jsonb_array_elements(pg_temp.tuong_tu(current_setting('t.y2'))) e, jsonb_object_keys(e) k
                        where k like '%gia_chu%')
            and pg_temp.tuong_tu(current_setting('t.y2'))::text not like '%1900000%'
            and pg_temp.tuong_tu(current_setting('t.y2'))::text not like '%1400000%'
            and jsonb_array_length(pg_temp.tuong_tu(current_setting('t.y2'))) > 0,
            'YC9.4-NT5 PQ11 dữ liệu căn tương tự không có giá chủ nhà (1.900.000đ, 1.400.000đ)');
select t.ok(not exists (select 1 from jsonb_array_elements(pg_temp.tuong_tu(current_setting('t.y2'))) e
                        where e ->> 'can_id' = t.can('villa')::text),
            'YC9.4 căn tương tự không có căn tự nhập (không có lịch trống)');
select t.thoat();
-- Căn đã có đặt phòng chồng một đêm thì không là căn tương tự.
select t.tao_booking('b_3402', t.can('3402'), pg_temp.d(8), pg_temp.d(9), 800000);
select t.dang_nhap(t.id('hung'));
select t.bang((select string_agg(e ->> 'ma_can', ',' order by e ->> 'ma_can') from jsonb_array_elements(pg_temp.tuong_tu(current_setting('t.y2'))) e),
              '1103', 'YC9.4-NT5 căn có đêm S+1 đã kín (3402) không là căn tương tự');
select t.thoat();
-- Lan chỉ được xem 1509: không có căn tương tự nào của chủ nhà khác.
select t.dang_nhap(t.id('lan'));
select set_config('t.y3', pg_temp.gui(t.can('1509'), pg_temp.d(14), pg_temp.d(16))::text, true);
select t.bang(jsonb_array_length(pg_temp.tuong_tu(current_setting('t.y3'))), 0,
              'YC9.4-NT5 PQ3.SALE căn tương tự chỉ trong căn sale được xem (Lan không thấy 3402, 1103)');
select t.thoat();

-- ===== YC9.3-NT3 qua kết quả: bị từ chối vì chủ nhà nhận đặt phòng khác =====
select t.dang_nhap(t.id('hung'));
select set_config('t.y4', pg_temp.gui(t.can('3402'), pg_temp.d(21), pg_temp.d(23))::text, true);
select t.thoat();
select t.tao_booking('b_khac', t.can('3402'), pg_temp.d(22), pg_temp.d(24), 1600000);
select t.dang_nhap(t.id('hung'));
select t.bang((select concat_ws('|', j ->> 'trang_thai', j ->> 'ly_do_tu_choi') from (select pg_temp.kq(current_setting('t.y4')) j) x),
              'bi_tu_choi|Đã nhận đặt phòng khác', 'YC9.4 bước 3 kết quả: Bị từ chối, lý do "Đã nhận đặt phòng khác"');
select t.ok(pg_temp.kq(current_setting('t.y4'))::text not like '%1600000%',
            'YC9.4 bước 3 QD11 kết quả không có tiền của đặt phòng khác');
select t.thoat();

-- ===== YC9.4-NT4: gửi 14 ngày trước mà chủ chưa trả lời: Hết hạn, đúng một thông báo =====
select t.dang_nhap(t.id('hung'));
select set_config('t.y5', pg_temp.gui(t.can('3402'), pg_temp.d(28), pg_temp.d(30))::text, true);
select t.thoat();
update public.yeu_cau_dat_phong set gui_luc = now() - interval '14 days', han_luc = now() where id = current_setting('t.y5')::uuid;
select t.dang_nhap(t.id('hung'));
select t.bang((select concat_ws('|', j ->> 'trang_thai', j ->> 'het_han_vi') from (select pg_temp.kq(current_setting('t.y5')) j) x),
              'het_han|qua_14_ngay', 'YC9.4-NT4 trước khi việc định kỳ chạy, đọc đã ra Hết hạn vì quá 2 tuần');
select t.bang((pg_temp.kq(current_setting('t.y5')) ->> 'gui_luc')::timestamptz, now() - interval '14 days',
              'YC9.4-NT4 S3-09 có lúc gửi');
select t.thoat();
select t.ok(pg_temp.het_han() >= 1, 'YC9.4-NT4 việc định kỳ đổi yêu cầu quá hạn');
select t.bang(pg_temp.tt(current_setting('t.y5')::uuid), 'het_han', 'YC9.4-NT4 yêu cầu ghi Hết hạn');
select t.bang(pg_temp.het_han(), 0, 'YC9.4-NT4 chạy lần hai không đổi dòng nào');
select t.bang(pg_temp.so_tb(t.id('hung'), 'yeu_cau_het_han', current_setting('t.y5')::uuid), 1::bigint,
              'YC9.4-NT4 chạy hai lần: sale có đúng một thông báo hết hạn');
select t.dang_nhap(t.id('hung'));
select t.bang((select concat_ws('|', j ->> 'trang_thai', j ->> 'het_han_vi') from (select pg_temp.kq(current_setting('t.y5')) j) x),
              'het_han|qua_14_ngay', 'YC9.4-NT4 S3-09 sau việc định kỳ: Hết hạn vì quá 2 tuần');
select t.thoat();
select t.ok(pg_temp.tt(current_setting('t.y1')::uuid) = 'da_chot' and pg_temp.tt(current_setting('t.y3')::uuid) = 'cho',
            'YC9.4-NT4 việc định kỳ không đổi yêu cầu đã chốt và yêu cầu chờ còn hạn');

-- ===== YC9-H5 (NT8 ở unit): qua ngày nhận phòng khi chủ chưa trả lời =====
select t.dang_nhap(t.id('hung'));
select set_config('t.y6', pg_temp.gui(t.can('3402'), pg_temp.d(35), pg_temp.d(37))::text, true);
select t.thoat();
update public.yeu_cau_dat_phong
   set ngay_nhan = public.local_today() - 1, ngay_tra = public.local_today() + 1,
       gui_luc = now() - interval '4 days', han_luc = now() + interval '10 days'
 where id = current_setting('t.y6')::uuid;
select t.dang_nhap(t.id('hung'));
select t.bang((select concat_ws('|', j ->> 'trang_thai', j ->> 'het_han_vi') from (select pg_temp.kq(current_setting('t.y6')) j) x),
              'het_han|qua_ngay_nhan', 'YC9.4 bước 4a YC9-H5 yêu cầu qua ngày nhận: Hết hạn vì đã qua ngày nhận phòng');
select t.ok((select bool_and((e ->> 'tu')::date = public.local_today() and (e ->> 'den')::date = public.local_today() + 1)
             from jsonb_array_elements(pg_temp.tuong_tu(current_setting('t.y6'))) e),
            'YC9.4 bước 4a căn tương tự chỉ tính các đêm chưa qua');
select t.thoat();
select pg_temp.het_han();
select t.bang(pg_temp.tt(current_setting('t.y6')::uuid), 'het_han', 'YC9.4 bước 4a việc định kỳ ghi Hết hạn khi qua ngày nhận');
select t.bang(pg_temp.so_tb(t.id('hung'), 'yeu_cau_het_han', current_setting('t.y6')::uuid), 1::bigint,
              'YC9.4 bước 4a sale có một thông báo hết hạn');
select t.dang_nhap(t.id('hung'));
select t.bang(pg_temp.kq(current_setting('t.y6')) ->> 'het_han_vi', 'qua_ngay_nhan', 'YC9.4 bước 4a sau việc định kỳ vẫn ghi vì qua ngày nhận');
select t.thoat();

-- ===== YC9.4-NT6: chủ nhà xóa tài khoản lúc yêu cầu đang chờ =====
select t.dang_nhap(t.id('lan'));
select set_config('t.y7', pg_temp.gui(t.can('1509'), pg_temp.d(42), pg_temp.d(44))::text, true);
select t.thoat();
update public.profiles set da_xoa_luc = now(), so_dien_thoai = null where id = t.id('hoa');
select pg_temp.het_han();
select t.bang(pg_temp.tt(current_setting('t.y7')::uuid), 'cho', 'YC9.4-NT6 QD13 chủ xóa tài khoản: yêu cầu vẫn Chờ chủ');
select t.dang_nhap(t.id('lan'));
select t.bang((select concat_ws('|', j ->> 'trang_thai', j -> 'chu' ->> 'da_xoa') from (select pg_temp.kq(current_setting('t.y7')) j) x),
              'cho|true', 'YC9.4-NT6 Lan đọc yêu cầu: Chờ chủ, biết chủ đã xóa tài khoản');
select t.bang((pg_temp.kq(current_setting('t.y7')) ->> 'han_luc')::timestamptz, now() + interval '14 days',
              'YC9.4-NT6 hạn vẫn là 14 ngày sau lúc gửi');
select t.thoat();
update public.yeu_cau_dat_phong set gui_luc = now() - interval '14 days', han_luc = now() - interval '1 minute'
 where id = current_setting('t.y7')::uuid;
select pg_temp.het_han();
select t.bang(pg_temp.tt(current_setting('t.y7')::uuid), 'het_han', 'YC9.4-NT6 sau 14 ngày yêu cầu Hết hạn như thường');
select t.bang(pg_temp.so_tb(t.id('lan'), 'yeu_cau_het_han', current_setting('t.y7')::uuid), 1::bigint,
              'YC9.4-NT6 Lan có một thông báo hết hạn');
update public.profiles set da_xoa_luc = null, so_dien_thoai = '0900000001' where id = t.id('hoa');

-- ===== YC9.4-NT7: Chị Hoa ngừng cho Lan xem lịch; Lan vẫn đọc yêu cầu cũ, không đọc lịch, giá mới =====
select t.dang_nhap(t.id('lan'));
select set_config('t.y8', pg_temp.gui(t.can('1509'), pg_temp.d(49), pg_temp.d(51))::text, true);
select t.thoat();
update public.ket_noi set trang_thai = 'chu_ngung' where id = t.kn('hoa', 'lan');
update public.gia_thang set gia_thuong = 1500000, gia_cuoi_tuan = 1900000 where can_id = t.can('1509');
select t.dang_nhap(t.id('lan'));
select t.bang((select concat_ws('|', j ->> 'trang_thai', j ->> 'ma_can', j ->> 'ngay_nhan', j ->> 'ngay_tra', j ->> 'tong_gia_chu',
                                j ->> 'con_xem_can')
               from (select pg_temp.kq(current_setting('t.y8')) j) x),
              concat_ws('|', 'cho', '1509', pg_temp.d(49)::text, pg_temp.d(51)::text, '2200000', 'false'),
              'YC9.4-NT7 YC9-H3 Lan bị ngừng vẫn đọc yêu cầu cũ: ngày, trạng thái, giá đã chốt 2.200.000đ, không còn xem căn');
select t.ok(pg_temp.kq(current_setting('t.y8'))::text not like '%3400000%'
            and pg_temp.kq(current_setting('t.y8'))::text not like '%1500000%'
            and pg_temp.kq(current_setting('t.y8')) is not null,
            'YC9.4-NT7 kết quả không có giá mới của 1509');
select t.bang((public.fn_sale_chi_tiet_can(t.can('1509'), pg_temp.d(49), pg_temp.d(51)) ->> 'khong_con_quyen'), 'true',
              'YC9.4-NT7 HV5 Lan không mở được chi tiết 1509');
select t.ok(public.fn_sale_chi_tiet_can(t.can('1509'), pg_temp.d(49), pg_temp.d(51))::text not like '%1500000%'
            and public.fn_sale_chi_tiet_can(t.can('1509'), pg_temp.d(49), pg_temp.d(51))::text not like '%1900000%',
            'YC9.4-NT7 PQ5.SALE Lan không đọc được giá mới của 1509');
select t.bang(coalesce(t.so(format('select 1 from public.fn_sale_lich(%L, %L) where can_id = %L',
                                   pg_temp.d(49), pg_temp.d(51), t.can('1509'))), 0), 0::bigint,
              'YC9.4-NT7 Lan không đọc được lịch của 1509');
select t.thoat();
update public.ket_noi set trang_thai = 'da_ket_noi' where id = t.kn('hoa', 'lan');
