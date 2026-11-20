-- US50 · Sale gửi và hủy yêu cầu (YC9.1). Viết trước migration (US50-TA1, CL14.5): task sau không sửa file này.
-- Hợp đồng database (YC9 "Dữ liệu", "Ai được làm gì", "Quy tắc của nhóm", QT1.4, QT5.6, thiet-ke-db.md mục 3 bất biến 2, 3, 5, 6):
--   fn_gui_yeu_cau(p_can_id uuid, p_ngay_nhan date, p_ngay_tra date, p_loi_nhan text, p_client_id uuid) returns jsonb.
--     Không có tham số giá: giá chủ và giá bán từng đêm do database tính (gia_chu_dem, gia_ban_dem) lúc gửi.
--     Tạo yêu cầu 'cho' (gui_luc = now(), han_luc = now() + 14 ngày), phần riêng yeu_cau_rieng (giá bán từng đêm),
--     một thông báo 'yeu_cau_moi' cho chủ căn (theo công tắc thong_bao_bat; không có giá bán). Trả như fn_yeu_cau_cua_toi.
--     Cùng (người gọi, p_client_id) đã có yêu cầu: trả yêu cầu đó, không ghi lần hai (QT5.6).
--     Từ chối: căn không trong my_shared_can_ids() (không có, ngoài phạm vi, đã ẩn, của chính mình, tự nhập, chưa kết nối):
--       42501 "Không tìm thấy căn" (cùng câu như căn không có). Kết nối chu_ngung: 42501 "Không gửi được yêu cầu. Chủ nhà
--       đã ngừng chia sẻ lịch." Chủ đã xóa tài khoản: 42501 "Không gửi được yêu cầu. Chủ nhà đã xóa tài khoản trên Home247."
--       Ngày nhận trước hôm nay (giờ Việt Nam): P0001 "Ngày nhận đã qua". Ngày trả không sau ngày nhận hay quá 366 đêm:
--       P0001 "Ngày trả phải sau ngày nhận". Lời nhắn quá 500 ký tự: 22023 "Lời nhắn tối đa 500 ký tự" (toàn khoảng
--       trắng ghi null). Có đêm đã thuộc đặt phòng chưa hủy: P0001 "Căn này đã được đặt rồi" (DETAIL: các đêm kín, ISO,
--       cách bởi dấu phẩy). Đêm chưa có giá chủ: P0001 "Căn chưa có giá cho đêm DD/MM. Nhắn chủ nhà để hỏi giá." (đêm đầu tiên).
--   fn_yeu_cau_cua_toi(p_yeu_cau_id uuid) returns jsonb: yêu cầu của người gọi (kể cả khi đã bị ngừng, YC9-H3):
--     {id, can_id, ma_can, ten_toa, so_phong_ngu, "chu": {ten, so_dien_thoai, da_xoa}, ngay_nhan, ngay_tra, so_dem,
--      "dem": [{ngay, gia_chu, gia_ban}], tong_gia_chu, tong_gia_ban, loi_nhan, trang_thai, ly_do_tu_choi, gui_luc, han_luc}.
--     trang_thai: 'cho' | 'da_chot' | 'bi_tu_choi' | 'da_huy' | 'het_han' (yêu cầu chờ đã quá hạn đọc ra 'het_han').
--     Không phải của người gọi hay không có: 42501 "Không tìm thấy yêu cầu" (cùng câu).
--   fn_huy_yeu_cau(p_yeu_cau_id uuid) returns jsonb: người gửi hủy yêu cầu 'cho' của mình → 'da_huy', không thông báo mới.
--     Không phải của người gọi (kể cả chủ căn): 42501 "Không tìm thấy yêu cầu". Không còn chờ: P0001 "Yêu cầu đã đổi trạng thái".
--   fn_chu_xem_yeu_cau(p_yeu_cau_id uuid) returns jsonb (CN9, phần YC9.1-NT13): chủ căn đọc một yêu cầu gửi tới căn mình.
--     Đã hủy: chỉ {id, trang_thai: 'da_huy'}. Còn lại có ngay_nhan, ngay_tra, gia_chu_dem, tong_gia_chu, loi_nhan, ten_sale;
--     không có giá bán. Không phải căn của người gọi: 42501 "Không tìm thấy yêu cầu".
--   Chủ căn không đọc được dòng yeu_cau_dat_phong đã hủy (khối yêu cầu của chủ nhà, YC9.1-NT7).
-- Ngày: file chạy trong một giao dịch, now() cố định. "10/10 → 12/10" của YC thay bằng đêm thứ Bảy S và Chủ nhật S+1 của
-- một tuần sau hôm nay ít nhất 14 ngày, để test không hỏng theo thời gian. Giá 1509 (DLM): 900.000đ thường, 1.300.000đ cuối
-- tuần: S → S+2 là 2.200.000đ; Hùng +200k mỗi đêm: 2.600.000đ.
select t.fixture();

-- Đêm thứ Bảy đầu tiên từ hôm nay + 14 ngày, cộng i ngày.
create or replace function pg_temp.d(i int default 0) returns date language sql stable as $$
  select (s + ((6 - extract(isodow from s)::int + 7) % 7) + i)::date from (select public.local_today() + 14 as s) x
$$;

-- Giá tháng cho 30 tháng tới (fixture chỉ có 10, 11, 12/2026).
insert into public.gia_thang (can_id, thang, gia_thuong, gia_cuoi_tuan)
select c.can_id, (date_trunc('month', public.local_today()) + make_interval(months => m))::date, c.thuong, c.cuoi
from (values (t.can('1509'), 900000::bigint, 1300000::bigint), (t.can('3402'), 800000, 1100000), (t.can('1103'), 700000, 700000))
       c(can_id, thuong, cuoi),
     generate_series(-1, 30) m
on conflict (can_id, thang) do nothing;

-- Căn 1510 của Chị Hoa: chỉ có giá đêm S (dịp một đêm), chưa có giá đêm S+1.
insert into public.can (id, nguoi_giu, loai, ma_can, so_phong_ngu, so_giuong, toa_nha_id)
values ('00000000-0000-0000-0001-000000001510', t.id('hoa'), 'co_lich', '1510', 1, 1, t.toa('icon40'));
insert into public.gia_dip (can_id, tu_ngay, den_ngay, ten, gia, la_ngay_le)
values ('00000000-0000-0000-0001-000000001510', pg_temp.d(0), pg_temp.d(0), 'Dịp một đêm', 1000000, false);

-- Gửi yêu cầu bằng vai hiện tại; lỗi thì null (in lỗi ra NOTICE).
create or replace function pg_temp.gui(p_can uuid, p_nhan date, p_tra date, p_loi text default null,
                                       p_client uuid default gen_random_uuid())
returns jsonb language plpgsql as $$
declare v jsonb;
begin
  select public.fn_gui_yeu_cau(p_can, p_nhan, p_tra, p_loi, p_client) into v;
  return v;
exception when others then
  raise notice 'lỗi: % (fn_gui_yeu_cau)', sqlerrm;
  return null;
end $$;

-- Mã lỗi và câu lỗi khi gửi (null khi gửi được).
create or replace function pg_temp.loi_gui(p_can uuid, p_nhan date, p_tra date, p_loi text default null)
returns text language plpgsql as $$
declare ma text; cau text;
begin
  perform public.fn_gui_yeu_cau(p_can, p_nhan, p_tra, p_loi, gen_random_uuid());
  return null;
exception when others then
  get stacked diagnostics ma = returned_sqlstate, cau = message_text;
  return ma || ': ' || cau;
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

-- Đọc bằng chủ database.
create or replace function pg_temp.so_yc(p_can uuid) returns bigint language sql security definer as $$
  select count(*) from public.yeu_cau_dat_phong where can_id = p_can
$$;
create or replace function pg_temp.tt(p_id uuid) returns text language sql security definer as $$
  select trang_thai from public.yeu_cau_dat_phong where id = p_id
$$;
create or replace function pg_temp.so_tb(p_nguoi uuid) returns bigint language sql security definer as $$
  select count(*) from public.thong_bao where nguoi_nhan = p_nguoi
$$;

-- Một uuid không phải căn hay yêu cầu nào.
create or replace function pg_temp.khong_co() returns uuid language sql immutable as $$
  select '00000000-0000-0000-00ff-000000000000'::uuid
$$;

-- ===== Danh mục =====
select t.ok((select bool_and(p.prosecdef) and count(*) = 4 from pg_proc p
             where p.pronamespace = 'public'::regnamespace
               and p.proname in ('fn_gui_yeu_cau', 'fn_yeu_cau_cua_toi', 'fn_huy_yeu_cau', 'fn_chu_xem_yeu_cau')),
            'YC9.1 KT-DB.3.3 có fn_gui_yeu_cau, fn_yeu_cau_cua_toi, fn_huy_yeu_cau, fn_chu_xem_yeu_cau chạy security definer');
select t.ok((select count(*) = 4 and bool_and(exists (select 1 from unnest(p.proconfig) c where c like 'search_path=%'))
             from pg_proc p where p.pronamespace = 'public'::regnamespace
               and p.proname in ('fn_gui_yeu_cau', 'fn_yeu_cau_cua_toi', 'fn_huy_yeu_cau', 'fn_chu_xem_yeu_cau')),
            'YC9.1 KT-DB.3.3 bốn lệnh đặt search_path');
select t.ok((select count(*) = 4 from pg_proc p where p.pronamespace = 'public'::regnamespace
               and p.proname in ('fn_gui_yeu_cau', 'fn_yeu_cau_cua_toi', 'fn_huy_yeu_cau', 'fn_chu_xem_yeu_cau'))
            and not exists (select 1 from pg_proc p where p.pronamespace = 'public'::regnamespace
                              and p.proname in ('fn_gui_yeu_cau', 'fn_yeu_cau_cua_toi', 'fn_huy_yeu_cau', 'fn_chu_xem_yeu_cau')
                              and has_function_privilege('anon', p.oid, 'execute')),
            'YC9.1 KT-DB.3.1 người chưa đăng nhập không gọi được bốn lệnh');

-- ===== YC9.1-NT1: gửi yêu cầu, ghi giờ đã gửi =====
select t.dang_nhap(t.id('hung'));
select set_config('t.y1', (pg_temp.gui(t.can('1509'), pg_temp.d(0), pg_temp.d(2), '  Khách tới muộn  ') ->> 'id'), true);
select t.ok(current_setting('t.y1', true) <> '', 'YC9.1-NT1 Hùng gửi yêu cầu 1509 S → S+2: database tạo yêu cầu');
select t.bang((public.fn_yeu_cau_cua_toi(current_setting('t.y1')::uuid) ->> 'gui_luc')::timestamptz, now(),
              'YC9.1-NT1 yêu cầu ghi giờ đã gửi (gui_luc = lúc gửi)');
select t.bang((select concat_ws('|', j ->> 'trang_thai', j ->> 'ma_can', j ->> 'ten_toa', j ->> 'so_dem', j -> 'chu' ->> 'ten',
                                j ->> 'loi_nhan')
               from public.fn_yeu_cau_cua_toi(current_setting('t.y1')::uuid) j),
              'cho|1509|ICON40|2|Chị Hoa|Khách tới muộn', 'YC9.1-NT1 S3-03 đọc được: chờ chủ, 1509 ICON40, 2 đêm, Chị Hoa, lời nhắn');
select t.bang((public.fn_yeu_cau_cua_toi(current_setting('t.y1')::uuid) ->> 'han_luc')::timestamptz, now() + interval '14 days',
              'YC9.1 Dữ liệu hạn = lúc gửi + 14 ngày');
select t.thoat();
select t.bang(pg_temp.tt(current_setting('t.y1')::uuid), 'cho', 'YC9.1-NT1 yêu cầu ở trạng thái Chờ chủ');
select t.bang((select count(*) from public.thong_bao where nguoi_nhan = t.id('hoa') and loai = 'yeu_cau_moi'
                 and doi_tuong_loai = 'yeu_cau' and doi_tuong_id = current_setting('t.y1')::uuid), 1::bigint,
              'YC9.1-NT1 YC12 bước 2 ghi một thông báo "yeu_cau_moi" cho Chị Hoa');
select t.ok((select bool_and(not (tb.noi_dung::text like '%2600000%') and not (tb.noi_dung::text like '%1500000%')
                             and not (tb.noi_dung ? 'gia_ban') and not (tb.noi_dung ? 'tong_gia_ban'))
             from public.thong_bao tb where tb.nguoi_nhan = t.id('hoa') and tb.loai = 'yeu_cau_moi'),
            'YC9.1 PQ19 YC12.1-NT6 thông báo cho Chị Hoa không có giá bán của sale');
select t.bang((select (tb.noi_dung ->> 'tong_gia_chu')::bigint from public.thong_bao tb
               where tb.nguoi_nhan = t.id('hoa') and tb.loai = 'yeu_cau_moi'), 2200000::bigint,
              'YC9.1 YC12 thông báo cho chủ nhà ghi "giá của bạn 2.200.000đ"');
select t.bang((select count(*) from public.thong_bao where nguoi_nhan = t.id('tuan')), 0::bigint,
              'YC9.1 YC12.2-NT5 Anh Tuấn không có thông báo về yêu cầu Hùng gửi Chị Hoa');
-- Lời nhắn toàn khoảng trắng coi như trống.
select t.dang_nhap(t.id('hung'));
select t.bang((pg_temp.gui(t.can('3402'), pg_temp.d(7), pg_temp.d(8), '    ') -> 'loi_nhan'), 'null'::jsonb,
              'YC9.1 Luật kiểm lời nhắn toàn khoảng trắng ghi trống');
select t.loi(format($$select public.fn_gui_yeu_cau(%L, %L, %L, repeat('a', 501), gen_random_uuid())$$,
                    t.can('3402'), pg_temp.d(14), pg_temp.d(15)),
             'Lời nhắn tối đa 500 ký tự', 'YC9.1 Luật kiểm lời nhắn 501 ký tự: "Lời nhắn tối đa 500 ký tự"');
select t.ok(pg_temp.gui(t.can('3402'), pg_temp.d(21), pg_temp.d(22), repeat('a', 500)) is not null,
            'YC9.1 Luật kiểm lời nhắn đúng 500 ký tự: gửi được');
select t.loi(format($$select public.fn_gui_yeu_cau(%L, %L, %L, null, gen_random_uuid())$$, t.can('3402'), pg_temp.d(28), pg_temp.d(28)),
             'Ngày trả phải sau ngày nhận', 'YC9.1 Luật kiểm ngày trả bằng ngày nhận: "Ngày trả phải sau ngày nhận"');
select t.loi(format($$select public.fn_gui_yeu_cau(%L, %L, %L, null, gen_random_uuid())$$, t.can('3402'), pg_temp.d(28), pg_temp.d(395)),
             'Ngày trả phải sau ngày nhận', 'YC9.1 Luật kiểm quá 366 đêm: bị từ chối');
select t.thoat();

-- ===== YC9.1-NT2: yêu cầu chờ không chiếm đêm, sale khác vẫn thấy trống =====
select t.bang((select count(*) from public.booking where can_id = t.can('1509') and dem && daterange(pg_temp.d(0), pg_temp.d(2))),
              0::bigint, 'YC9.1-NT2 QT1.1 yêu cầu Y1 đang chờ: 1509 chưa có đặt phòng đêm S, S+1');
select t.dang_nhap(t.id('lan'));
select t.bang(public.o_lich(t.can('1509'), pg_temp.d(0)) || ',' || public.o_lich(t.can('1509'), pg_temp.d(1)), 'trong,trong',
              'YC9.1-NT2 Sale Lan vẫn thấy 1509 trống đêm S, S+1');
select t.ok(pg_temp.gui(t.can('1509'), pg_temp.d(1), pg_temp.d(2)) is not null,
            'YC9.1-NT2 QD6 Sale Lan vẫn gửi được yêu cầu trùng đêm với Y1 đang chờ');
select t.thoat();
select t.dang_nhap(t.id('hung'));
select t.bang(public.o_lich(t.can('1509'), pg_temp.d(0)), 'trong', 'YC9.1-NT2 chính Hùng vẫn thấy đêm S trống');
select t.thoat();

-- ===== YC9.1-NT3 (database phần giá): S3-03 có cả giá chủ và giá bán =====
select t.dang_nhap(t.id('hung'));
select t.bang((select concat_ws('|', j ->> 'tong_gia_chu', j ->> 'tong_gia_ban') from public.fn_yeu_cau_cua_toi(current_setting('t.y1')::uuid) j),
              '2200000|2600000', 'YC9.1 bước 1 yêu cầu của Hùng: giá chủ 2.200.000đ, giá bán 2.600.000đ');
select t.bang((select jsonb_agg(jsonb_build_array((d ->> 'gia_chu')::bigint, (d ->> 'gia_ban')::bigint) order by d ->> 'ngay')
               from jsonb_array_elements(public.fn_yeu_cau_cua_toi(current_setting('t.y1')::uuid) -> 'dem') d),
              '[[1300000, 1500000], [900000, 1100000]]'::jsonb, 'YC9.1 Dữ liệu QT2.1 giá chủ và giá bán từng đêm S, S+1');
select t.thoat();

-- ===== YC9.1-NT4: app gửi kèm giá thì database bỏ qua =====
select t.ok(not exists (select 1 from pg_proc p, unnest(coalesce(p.proargnames, '{}')) a
                        where p.pronamespace = 'public'::regnamespace and p.proname = 'fn_gui_yeu_cau' and a ilike '%gia%'),
            'YC9.1-NT4 lệnh gửi yêu cầu không nhận giá từ app');
select t.dang_nhap(t.id('hung'));
select t.ok(pg_temp.loi(format($$select public.fn_gui_yeu_cau(p_can_id => %L, p_ngay_nhan => %L, p_ngay_tra => %L,
                                  p_loi_nhan => null, p_client_id => gen_random_uuid(), p_gia_chu => 1, p_gia_ban => 1)$$,
                               t.can('1509'), pg_temp.d(35), pg_temp.d(37))) like '42883%',
            'YC9.1-NT4 gửi kèm giá chủ 1đ, giá bán 1đ: database không có lệnh nhận giá');
select t.loi(format($$insert into public.yeu_cau_dat_phong (can_id, sale_id, ngay_nhan, ngay_tra, gia_chu_dem)
                      values (%L, %L, %L, %L, '{1,1}')$$, t.can('1509'), t.id('hung'), pg_temp.d(35), pg_temp.d(37)),
             '42501', 'YC9.1-NT4 Hùng ghi thẳng yêu cầu với giá chủ 1đ: bị từ chối');
select t.loi(format($$update public.yeu_cau_dat_phong set gia_chu_dem = '{1,1}' where id = %L$$, current_setting('t.y1')),
             '42501', 'YC9.1-NT4 Hùng sửa thẳng giá chủ của yêu cầu: bị từ chối');
select t.loi(format($$update public.yeu_cau_rieng set gia_ban_dem = '{1,1}' where yeu_cau_id = %L$$, current_setting('t.y1')),
             '42501', 'YC9.1-NT4 Hùng sửa thẳng giá bán của yêu cầu: bị từ chối');
select t.thoat();
select t.bang((select array_to_string(gia_chu_dem, ',') from public.yeu_cau_dat_phong where id = current_setting('t.y1')::uuid),
              '1300000,900000', 'YC9.1-NT4 yêu cầu vẫn ghi giá chủ 1.300.000đ + 900.000đ = 2.200.000đ');
select t.bang((select (select sum(x) from unnest(gia_ban_dem) x)::bigint from public.yeu_cau_rieng
               where yeu_cau_id = current_setting('t.y1')::uuid), 2600000::bigint,
              'YC9.1-NT4 QD11 phần riêng của Hùng ghi giá bán 2.600.000đ');
select t.bang((select sale_id from public.yeu_cau_rieng where yeu_cau_id = current_setting('t.y1')::uuid), t.id('hung'),
              'YC9.1-NT4 phần riêng thuộc Hùng');

-- ===== YC9.1-NT5: gửi khi đêm đã có đặt phòng =====
select t.tao_booking('B1', t.can('1509'), pg_temp.d(70), pg_temp.d(72), 2200000);
select set_config('t.so_truoc', pg_temp.so_yc(t.can('1509'))::text, true);
select t.dang_nhap(t.id('hung'));
select t.loi(format($$select public.fn_gui_yeu_cau(%L, %L, %L, null, gen_random_uuid())$$, t.can('1509'), pg_temp.d(70), pg_temp.d(72)),
             'Căn này đã được đặt rồi', 'YC9.1-NT5 QT1.4-VD1 Hùng gửi 1509 trùng đêm B1: "Căn này đã được đặt rồi"');
select t.loi(format($$select public.fn_gui_yeu_cau(%L, %L, %L, null, gen_random_uuid())$$, t.can('1509'), pg_temp.d(71), pg_temp.d(73)),
             'Căn này đã được đặt rồi', 'YC9.1-NT5 QT1.4-VD1 chồng một đêm của B1 cũng bị chặn');
select t.ok(pg_temp.gui(t.can('1509'), pg_temp.d(72), pg_temp.d(73)) is not null,
            'YC9.1-NT5 QT1.1-VD2 ngày trả của B1 không phải đêm kín: gửi được');
select t.bang(public.o_lich(t.can('1509'), pg_temp.d(70)) || ',' || public.o_lich(t.can('1509'), pg_temp.d(71)), 'kin,kin',
              'YC9.1-NT5 lịch căn đọc lại: hai đêm Kín');
select t.thoat();
select t.bang(pg_temp.so_yc(t.can('1509')), current_setting('t.so_truoc')::bigint + 1,
              'YC9.1-NT5 không có yêu cầu mới cho đêm kín (chỉ yêu cầu ở ngày trả của B1)');
-- Chi tiết đêm kín có trong DETAIL, chỉ là ngày (sale đã thấy Kín ở lịch).
create or replace function pg_temp.chi_tiet_kin() returns text language plpgsql as $$
declare ct text;
begin
  perform public.fn_gui_yeu_cau(t.can('1509'), pg_temp.d(69), pg_temp.d(72), null, gen_random_uuid());
  return null;
exception when others then
  get stacked diagnostics ct = pg_exception_detail;
  return ct;
end $$;
select t.dang_nhap(t.id('hung'));
select t.bang(pg_temp.chi_tiet_kin(), pg_temp.d(70)::text || ',' || pg_temp.d(71)::text,
              'YC9.1-NT5 S3-07 lỗi ghi các đêm vừa có người đặt');
select t.thoat();

-- ===== YC9.1-NT8: không gửi được, không biết căn có tồn tại; bị ngừng, chủ xóa tài khoản thì kèm lý do =====
select t.dang_nhap(t.id('hung'));
select set_config('t.loi_khong_co', pg_temp.loi_gui(pg_temp.khong_co(), pg_temp.d(0), pg_temp.d(2)), true);
select t.ok(current_setting('t.loi_khong_co') like '42501: Không tìm thấy căn%', 'YC9.1-NT8 căn không có: 42501 "Không tìm thấy căn"');
select t.bang(pg_temp.loi_gui(t.can('1103'), pg_temp.d(0), pg_temp.d(2)), current_setting('t.loi_khong_co'),
              'YC9.1-NT8 PQ10.SALE Hùng gửi 1103 của Anh Tuấn (chưa kết nối): cùng lỗi như căn không có');
select t.bang(pg_temp.loi_gui(t.can('villa'), pg_temp.d(0), pg_temp.d(2)), current_setting('t.loi_khong_co'),
              'YC9.1-NT8 Hùng gửi căn tự nhập Villa Tuần Châu: cùng lỗi như căn không có');
select t.thoat();
select t.dang_nhap(t.id('nga'));
select t.bang(pg_temp.loi_gui(t.can('1509'), pg_temp.d(0), pg_temp.d(2)), current_setting('t.loi_khong_co'),
              'YC9.1-NT8 Sale Nga chưa kết nối gửi 1509: cùng lỗi như căn không có');
select t.thoat();
select t.dang_nhap(t.id('lan'));
select t.bang(pg_temp.loi_gui(t.can('3402'), pg_temp.d(0), pg_temp.d(2)), current_setting('t.loi_khong_co'),
              'YC9.1-NT8 PQ3.SALE Sale Lan gửi 3402 ngoài phạm vi: cùng lỗi như căn không có');
select t.thoat();
select t.dang_nhap(t.id('hoa'));
select t.bang(pg_temp.loi_gui(t.can('1509'), pg_temp.d(0), pg_temp.d(2)), current_setting('t.loi_khong_co'),
              'YC9.1-NT8 Chị Hoa gửi yêu cầu cho căn của chính mình: cùng lỗi như căn không có');
select t.thoat();
update public.can set an_luc = now() where id = t.can('3402');
select t.dang_nhap(t.id('hung'));
select t.bang(pg_temp.loi_gui(t.can('3402'), pg_temp.d(42), pg_temp.d(43)), current_setting('t.loi_khong_co'),
              'YC9.1-NT8 KT-DB.3.3 Hùng gửi 3402 đã ẩn: cùng lỗi như căn không có');
select t.thoat();
update public.can set an_luc = null where id = t.can('3402');
select set_config('t.so_3402', pg_temp.so_yc(t.can('3402'))::text, true);
update public.ket_noi set trang_thai = 'chu_ngung' where id = t.kn('hoa', 'lan');
select t.dang_nhap(t.id('lan'));
select t.bang(pg_temp.loi_gui(t.can('1509'), pg_temp.d(42), pg_temp.d(43)),
              '42501: Không gửi được yêu cầu. Chủ nhà đã ngừng chia sẻ lịch.',
              'YC9.1-NT8 PQ10.SALE Sale Lan bị ngừng: bị từ chối kèm lý do');
select t.thoat();
update public.ket_noi set trang_thai = 'da_ket_noi' where id = t.kn('hoa', 'lan');
update public.profiles set da_xoa_luc = now(), so_dien_thoai = null where id = t.id('hoa');
select t.dang_nhap(t.id('hung'));
select t.bang(pg_temp.loi_gui(t.can('3402'), pg_temp.d(42), pg_temp.d(43)),
              '42501: Không gửi được yêu cầu. Chủ nhà đã xóa tài khoản trên Home247.',
              'YC9.1-NT8 QD13 Chị Hoa đã xóa tài khoản: "Không gửi được yêu cầu. Chủ nhà đã xóa tài khoản trên Home247."');
select t.bang((public.fn_yeu_cau_cua_toi(current_setting('t.y1')::uuid) -> 'chu' ->> 'da_xoa'), 'true',
              'YC9-H8 yêu cầu cũ biết chủ nhà đã xóa tài khoản (ẩn nút gọi, nhắn Zalo)');
select t.bang((public.fn_yeu_cau_cua_toi(current_setting('t.y1')::uuid) ->> 'trang_thai'), 'cho',
              'YC9 Người xóa tài khoản: yêu cầu chờ không đổi');
select t.thoat();
update public.profiles set da_xoa_luc = null, so_dien_thoai = '0900000001' where id = t.id('hoa');
select t.bang(pg_temp.so_yc(t.can('3402')), current_setting('t.so_3402')::bigint, 'YC9.1-NT8 các lần bị từ chối không tạo yêu cầu');
select t.dang_nhap(t.id('hung'));
select t.bang((public.fn_yeu_cau_cua_toi(current_setting('t.y1')::uuid) -> 'chu' ->> 'so_dien_thoai'), '0900000001',
              'YC9.1 bước 3 S3-03 có số chủ nhà để gọi, nhắn Zalo (pwa.md P5)');
select t.thoat();
select t.loi(format($$select public.fn_gui_yeu_cau(%L, %L, %L, null, gen_random_uuid())$$, t.can('1509'), pg_temp.d(0), pg_temp.d(2)),
             '28000', 'YC9.1-NT8 PQ Luật chung 4 chưa đăng nhập: bị từ chối');

-- ===== YC9.1-NT9: sale khác không đọc, không hủy; sale không tự chấp nhận; chủ khác không đọc =====
select t.dang_nhap(t.id('lan'));
select set_config('t.loi_yc_khong_co', pg_temp.loi(format('select public.fn_yeu_cau_cua_toi(%L)', pg_temp.khong_co())), true);
select t.ok(current_setting('t.loi_yc_khong_co') like '42501: Không tìm thấy yêu cầu%',
            'YC9.1-NT9 yêu cầu không có: 42501 "Không tìm thấy yêu cầu"');
select t.bang(pg_temp.loi(format('select public.fn_yeu_cau_cua_toi(%L)', current_setting('t.y1'))), current_setting('t.loi_yc_khong_co'),
              'YC9.1-NT9 PQ10.SALE Sale Lan đọc yêu cầu của Hùng: cùng lỗi như yêu cầu không có');
select t.bang(pg_temp.loi(format('select public.fn_huy_yeu_cau(%L)', current_setting('t.y1'))), current_setting('t.loi_yc_khong_co'),
              'YC9.1-NT9 PQ10.SALE Sale Lan hủy yêu cầu của Hùng: cùng lỗi như yêu cầu không có');
select t.bang(coalesce(t.so(format('select * from public.yeu_cau_dat_phong where id = %L', current_setting('t.y1'))), 0), 0::bigint,
              'YC9.1-NT9 Sale Lan không đọc được dòng yêu cầu của Hùng');
select t.bang(coalesce(t.so(format('select * from public.yeu_cau_rieng where yeu_cau_id = %L', current_setting('t.y1'))), 0), 0::bigint,
              'YC9.1-NT9 QD11 Sale Lan không đọc được phần riêng của Hùng');
select t.bang(pg_temp.loi(format('select public.fn_chu_xem_yeu_cau(%L)', current_setting('t.y1'))), current_setting('t.loi_yc_khong_co'),
              'YC9.1-NT9 Sale Lan gọi lệnh đọc của chủ nhà cho yêu cầu của Hùng: cùng lỗi như yêu cầu không có');
select t.thoat();
select t.dang_nhap(t.id('hung'));
select t.loi(format($$update public.yeu_cau_dat_phong set trang_thai = 'da_chot' where id = %L$$, current_setting('t.y1')),
             '42501', 'YC9.1-NT9 Hùng tự chấp nhận yêu cầu của mình (sửa thẳng): bị từ chối');
select t.ok(pg_temp.loi(format('select public.fn_chap_nhan_yeu_cau(%L)', current_setting('t.y1'))) is not null,
            'YC9.1-NT9 Hùng gọi lệnh chấp nhận cho yêu cầu của mình: không qua');
select t.bang(pg_temp.loi(format('select public.fn_chu_xem_yeu_cau(%L)', current_setting('t.y1'))), current_setting('t.loi_yc_khong_co'),
              'YC9.1-NT9 Hùng không đọc yêu cầu bằng lệnh của chủ nhà');
select t.thoat();
select t.dang_nhap(t.id('tuan'));
select t.bang(pg_temp.loi(format('select public.fn_chu_xem_yeu_cau(%L)', current_setting('t.y1'))), current_setting('t.loi_yc_khong_co'),
              'YC9.2-NT8 PQ10.CHU Anh Tuấn đọc yêu cầu tới căn của Chị Hoa: cùng lỗi như yêu cầu không có');
select t.bang(coalesce(t.so('select * from public.yeu_cau_dat_phong'), 0), 0::bigint,
              'YC9.2-NT8 PQ10.CHU Anh Tuấn không đọc được yêu cầu nào');
select t.thoat();
select t.dang_nhap(t.id('hoa'));
select t.bang(pg_temp.loi(format('select public.fn_huy_yeu_cau(%L)', current_setting('t.y1'))), current_setting('t.loi_yc_khong_co'),
              'YC9.2-NT8 PQ10.CHU chủ nhà không hủy thay sale');
select t.bang(coalesce(t.so('select * from public.yeu_cau_rieng'), 0), 0::bigint,
              'YC9.2-NT2 PQ11 Chị Hoa không đọc được giá bán của yêu cầu nào');
select t.ok((select count(*) = 0 from jsonb_object_keys(public.fn_chu_xem_yeu_cau(current_setting('t.y1')::uuid)) k
             where k in ('gia_ban_dem', 'tong_gia_ban', 'muc_cong', 'tien_chenh')),
            'YC9.2-NT2 KT-DB.3.6 lệnh đọc của chủ nhà không có giá bán, tiền chênh, mức cộng');
select t.thoat();
select t.bang(pg_temp.tt(current_setting('t.y1')::uuid), 'cho', 'YC9.1-NT9 sau các lệnh trái quyền, Y1 vẫn chờ');
-- Sale bị ngừng vẫn đọc được yêu cầu cũ của mình (YC9-H3).
update public.ket_noi set trang_thai = 'chu_ngung' where id = t.kn('hoa', 'hung');
select t.dang_nhap(t.id('hung'));
select t.bang((public.fn_yeu_cau_cua_toi(current_setting('t.y1')::uuid) ->> 'tong_gia_chu'), '2200000',
              'YC9-H3 PQ10.SALE Hùng bị ngừng vẫn đọc được yêu cầu cũ của mình');
select t.thoat();
update public.ket_noi set trang_thai = 'da_ket_noi' where id = t.kn('hoa', 'hung');

-- ===== YC9.1-NT10: bấm gửi hai lần cùng khóa chống gửi trùng =====
select set_config('t.so_truoc', pg_temp.so_yc(t.can('3402'))::text, true);
select t.dang_nhap(t.id('hung'));
select set_config('t.k1', (pg_temp.gui(t.can('3402'), pg_temp.d(49), pg_temp.d(51), null, '00000000-0000-0000-00aa-000000000001') ->> 'id'), true);
select set_config('t.k2', (pg_temp.gui(t.can('3402'), pg_temp.d(49), pg_temp.d(51), null, '00000000-0000-0000-00aa-000000000001') ->> 'id'), true);
select t.ok(current_setting('t.k1') <> '' and current_setting('t.k1') = current_setting('t.k2'),
            'YC9.1-NT10 QT5.6 gửi lại cùng mã lần gửi: trả lại đúng yêu cầu đã tạo');
select t.thoat();
select t.bang(pg_temp.so_yc(t.can('3402')), current_setting('t.so_truoc')::bigint + 1, 'YC9.1-NT10 QT5.6 chỉ có một yêu cầu');
select t.bang((select count(*) from public.thong_bao where nguoi_nhan = t.id('hoa') and doi_tuong_id = current_setting('t.k1')::uuid),
              1::bigint, 'YC9.1-NT10 QT5.6 chỉ một thông báo cho chủ nhà');
select t.bang((select count(*) from public.yeu_cau_rieng where yeu_cau_id = current_setting('t.k1')::uuid), 1::bigint,
              'YC9.1-NT10 chỉ một phần riêng');
-- Lan dùng cùng mã lần gửi với Hùng: là lần gửi riêng của Lan.
select t.dang_nhap(t.id('lan'));
select t.ok((pg_temp.gui(t.can('1509'), pg_temp.d(49), pg_temp.d(51), null, '00000000-0000-0000-00aa-000000000001') ->> 'id')
              is distinct from current_setting('t.k1'),
            'YC9.1-NT10 QT5.6 mã lần gửi tính theo từng sale: Lan không nhận yêu cầu của Hùng');
select t.thoat();

-- ===== YC9.1-NT11: ngày nhận hôm qua bị từ chối, hôm nay gửi được =====
select set_config('t.so_truoc', pg_temp.so_yc(t.can('3402'))::text, true);
select t.dang_nhap(t.id('hung'));
select t.loi(format($$select public.fn_gui_yeu_cau(%L, %L, %L, null, gen_random_uuid())$$,
                    t.can('3402'), public.local_today() - 1, public.local_today() + 1),
             'Ngày nhận đã qua', 'YC9.1-NT11 YC9-H1 ngày nhận hôm qua: "Ngày nhận đã qua"');
select t.thoat();
select t.bang(pg_temp.so_yc(t.can('3402')), current_setting('t.so_truoc')::bigint, 'YC9.1-NT11 không có yêu cầu mới');
select t.dang_nhap(t.id('hung'));
select t.ok(pg_temp.gui(t.can('3402'), public.local_today(), public.local_today() + 1) is not null,
            'YC9.1-NT11 YC9-H1 ngày nhận hôm nay (giờ Việt Nam): gửi được');
select t.thoat();

-- ===== YC9.1-NT12: căn chưa có giá một đêm =====
select set_config('t.so_truoc', pg_temp.so_yc('00000000-0000-0000-0001-000000001510')::text, true);
select t.dang_nhap(t.id('hung'));
select t.bang(pg_temp.loi_gui('00000000-0000-0000-0001-000000001510', pg_temp.d(0), pg_temp.d(2)),
              'P0001: Căn chưa có giá cho đêm ' || to_char(pg_temp.d(1), 'DD/MM') || '. Nhắn chủ nhà để hỏi giá.',
              'YC9.1-NT12 YC9-H2 1510 chưa có giá đêm S+1: database từ chối với đêm thiếu giá');
select t.thoat();
select t.bang(pg_temp.so_yc('00000000-0000-0000-0001-000000001510'), current_setting('t.so_truoc')::bigint,
              'YC9.1-NT12 không có yêu cầu mới');
select t.dang_nhap(t.id('hung'));
select t.ok(pg_temp.gui('00000000-0000-0000-0001-000000001510', pg_temp.d(0), pg_temp.d(1)) is not null,
            'YC9.1-NT12 chỉ đêm S (đã có giá): gửi được');
select t.thoat();

-- ===== YC9.1-NT7, NT13: sale hủy yêu cầu đang chờ =====
select set_config('t.tb_hoa', pg_temp.so_tb(t.id('hoa'))::text, true);
select t.dang_nhap(t.id('hoa'));
select t.bang((public.fn_chu_xem_yeu_cau(current_setting('t.y1')::uuid) ->> 'ngay_nhan'), pg_temp.d(0)::text,
              'YC9.1-NT13 trước khi hủy, Chị Hoa đọc được ngày của yêu cầu');
select t.bang(coalesce(t.so(format('select * from public.yeu_cau_dat_phong where id = %L', current_setting('t.y1'))), 0), 1::bigint,
              'YC9.1-NT7 trước khi hủy, Y1 có trong khối yêu cầu của Chị Hoa');
select t.thoat();
select t.dang_nhap(t.id('hung'));
select t.bang((public.fn_huy_yeu_cau(current_setting('t.y1')::uuid) ->> 'trang_thai'), 'da_huy',
              'YC9.1-NT7 Hùng hủy Y1: yêu cầu có nhãn "Đã hủy"');
select t.bang((public.fn_yeu_cau_cua_toi(current_setting('t.y1')::uuid) ->> 'trang_thai'), 'da_huy',
              'YC9.1-NT7 S3-08 đọc lại: Đã hủy');
select t.bang(pg_temp.loi(format('select public.fn_huy_yeu_cau(%L)', current_setting('t.y1'))),
              'P0001: Yêu cầu đã đổi trạng thái', 'YC9 Trạng thái màn hủy lần nữa: "Yêu cầu đã đổi trạng thái"');
select t.thoat();
select t.bang(pg_temp.tt(current_setting('t.y1')::uuid), 'da_huy', 'YC9.1-NT7 database ghi Đã hủy');
select t.dang_nhap(t.id('hoa'));
select t.bang(coalesce(t.so(format('select * from public.yeu_cau_dat_phong where id = %L', current_setting('t.y1'))), 0), 0::bigint,
              'YC9.1-NT7 Y1 không còn ở khối yêu cầu của Chị Hoa');
select t.bang(coalesce(t.so('select * from public.yeu_cau_dat_phong where trang_thai = ''da_huy'''), 0), 0::bigint,
              'YC9.1-NT7 Chị Hoa không đọc được yêu cầu đã hủy nào');
select t.bang(public.fn_chu_xem_yeu_cau(current_setting('t.y1')::uuid),
              jsonb_build_object('id', current_setting('t.y1'), 'trang_thai', 'da_huy'),
              'YC9.1-NT13 CN9 mở Y1 từ thông báo cũ: chỉ trạng thái Đã hủy, không ngày, giá, lời nhắn');
select t.thoat();
select t.bang(pg_temp.so_tb(t.id('hoa')), current_setting('t.tb_hoa')::bigint, 'YC9.1-NT13 YC9-H6 Chị Hoa không có thông báo mới khi Hùng hủy');
select t.bang((select count(*) from public.thong_bao where nguoi_nhan = t.id('hoa') and doi_tuong_id = current_setting('t.y1')::uuid),
              1::bigint, 'YC9.1-NT13 thông báo "yêu cầu mới" cũ của Chị Hoa vẫn giữ');
select t.dang_nhap(t.id('hung'));
select t.bang(pg_temp.loi(format('select public.fn_huy_yeu_cau(%L)', pg_temp.khong_co())), current_setting('t.loi_yc_khong_co'),
              'YC9.1-NT9 hủy yêu cầu không có: cùng lỗi');
select t.thoat();

-- Yêu cầu chờ đã quá hạn đọc ra Hết hạn và không hủy được.
select t.dang_nhap(t.id('hung'));
select set_config('t.y9', (pg_temp.gui(t.can('3402'), pg_temp.d(56), pg_temp.d(57)) ->> 'id'), true);
select t.thoat();
update public.yeu_cau_dat_phong set gui_luc = now() - interval '15 days', han_luc = now() - interval '1 day'
 where id = current_setting('t.y9')::uuid;
select t.dang_nhap(t.id('hung'));
select t.bang((public.fn_yeu_cau_cua_toi(current_setting('t.y9')::uuid) ->> 'trang_thai'), 'het_han',
              'YC9 Dữ liệu yêu cầu chờ quá 14 ngày đọc ra Hết hạn');
select t.bang(pg_temp.loi(format('select public.fn_huy_yeu_cau(%L)', current_setting('t.y9'))),
              'P0001: Yêu cầu đã đổi trạng thái', 'YC9 Trạng thái yêu cầu Hết hạn là cuối: không hủy được');
select t.thoat();
