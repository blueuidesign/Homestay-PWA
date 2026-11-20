-- US57 · Ghi đặt phòng cho căn tự nhập (YC10.4). Viết trước migration (US57-TA1, CL14.5): task sau không sửa file này.
-- Hợp đồng database cho màn S6-05 (ghi), S6-06 (đã ghi), sửa và xóa đặt phòng tự ghi:
--   fn_gia_dien_san_tu_ghi(p_can_id uuid, p_ngay_nhan date, p_ngay_tra date) returns jsonb
--     {tra_chu, thu_khach, dem: [{dem, tra_chu, thu_khach}]}: trả chủ theo giá chủ sale đã lưu (đêm cuối tuần theo cài đặt
--     của sale, YC4.6), thu khách theo giá bán của sale (giá chủ + mức cộng, YC7.5). Một đêm chưa có giá chủ thì tra_chu và
--     thu_khach null. Không phải căn tự nhập của người gọi: 42501. Quá 365 đêm hay ngày trả không sau ngày nhận: P0001.
--   fn_ghi_dat_phong_tu_ghi(p_can_id uuid, p_ngay_nhan date, p_ngay_tra date, p_tra_chu bigint, p_thu_khach bigint,
--     p_client_id uuid) returns uuid. Chỉ căn tự nhập của người gọi (khác: 42501). Lưu nguồn 'sale_tu_ghi', người tạo là người
--     gọi, không trạng thái tiền, không cọc; trả chủ là tiền phòng (tổng tiền các đêm bằng tiền phòng), thu khách ở phần riêng
--     của người gọi. Trùng đêm với đặt phòng tự ghi khác của căn: P0001 "Bạn đã ghi đặt phòng cho căn này đêm dd/mm" (đêm
--     trùng đầu tiên). Luật kiểm: "Một đặt phòng dài tối đa 365 đêm", "Cần nhập tiền trả chủ", "Cần nhập tiền thu khách"
--     (P0001). Cùng p_client_id thì trả đặt phòng đã lưu, không ghi thêm (HV1-NT1).
--   fn_sua_dat_phong_tu_ghi(p_booking_id uuid, p_ngay_nhan date, p_ngay_tra date, p_tra_chu bigint, p_thu_khach bigint)
--     returns void. Cùng luật kiểm và chặn trùng (bỏ chính nó). Không phải đặt phòng tự ghi của người gọi: 42501.
--   fn_xoa_dat_phong_tu_ghi(p_booking_id uuid) returns void. Xóa thật. Không phải đặt phòng tự ghi của người gọi: 42501.
-- Đặt phòng mới hiện ở fn_can_tu_nhap (US56, S6-03) và ô "Bạn" ở fn_sale_lich (US43, lịch 7 ngày).
-- YC10.4-NT2 đến NT9, HV1-NT1, YC10 "Ai được làm gì", "Dữ liệu", "Quy tắc của nhóm", QT1.3, QT3.1, QT6.4, PQ7, PQ14, QD11, QD12.
-- Số theo DLM: Villa Tuần Châu của Sale Hùng, giá chủ 1.400.000đ, giá bán của Hùng 1.600.000đ (mức cộng riêng +200.000đ);
-- V1 20/09 → 22/09, V2 08/10 → 09/10 (T5).
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
-- Câu ghi đặt phòng tự ghi.
create or replace function pg_temp.cau_ghi(p_can uuid, p_nhan date, p_tra date, p_tra_chu bigint, p_thu bigint,
                                           p_client uuid default null) returns text language sql as $$
  select format('select public.fn_ghi_dat_phong_tu_ghi(p_can_id => %L, p_ngay_nhan => %L, p_ngay_tra => %L, '
                'p_tra_chu => %L, p_thu_khach => %L, p_client_id => %L)',
                p_can, p_nhan, p_tra, p_tra_chu, p_thu, coalesce(p_client, gen_random_uuid()))
$$;
create or replace function pg_temp.cau_sua(p_id uuid, p_nhan date, p_tra date, p_tra_chu bigint, p_thu bigint)
returns text language sql as $$
  select format('select public.fn_sua_dat_phong_tu_ghi(p_booking_id => %L, p_ngay_nhan => %L, p_ngay_tra => %L, '
                'p_tra_chu => %L, p_thu_khach => %L)', p_id, p_nhan, p_tra, p_tra_chu, p_thu)
$$;
-- Đọc dữ liệu thật của một đặt phòng (vai chủ database), để kiểm cái đã lưu.
create or replace function pg_temp.bk(p_id uuid) returns public.booking language sql security definer as $$
  select * from public.booking where id = p_id
$$;
create or replace function pg_temp.thu(p_id uuid, p_nguoi uuid) returns bigint language sql security definer as $$
  select tien_thu_khach from public.booking_rieng where booking_id = p_id and nguoi_id = p_nguoi
$$;
create or replace function pg_temp.dem_tien(p_id uuid) returns text language sql security definer as $$
  select coalesce(string_agg(dem::text || '=' || tien, ',' order by dem), '') from public.booking_dem where booking_id = p_id
$$;
create or replace function pg_temp.so_dp(p_can uuid) returns bigint language sql security definer as $$
  select count(*) from public.booking where can_id = p_can
$$;
create or replace function pg_temp.co(p_id uuid) returns boolean language sql security definer as $$
  select exists (select 1 from public.booking where id = p_id)
$$;
-- Một khóa của kết quả điền sẵn, bằng vai hiện tại (lỗi thì null, file không dừng khi hàm chưa có).
create or replace function pg_temp.ds(p_can uuid, p_nhan date, p_tra date, p_khoa text) returns text language sql as $$
  select t.gt(format('public.fn_gia_dien_san_tu_ghi(%L::uuid, %L::date, %L::date) -> %L', p_can, p_nhan, p_tra, p_khoa))
$$;
-- Ô lịch 7 ngày của người gọi cho một căn một đêm (fn_sale_lich), bằng vai hiện tại.
create or replace function pg_temp.o(p_can uuid, p_dem date) returns text language sql as $$
  select l.o from public.fn_sale_lich('2026-10-05', '2026-10-12') l where l.can_id = p_can and l.dem = p_dem
$$;
-- Lưu id theo mã (dùng t.b).
create or replace function pg_temp.dat(p_ma text, p_id text) returns void language plpgsql as $$
begin
  perform set_config('t.ma_' || lower(p_ma), coalesce(p_id, ''), false);
end $$;

-- YC10.4-NT2: giá bán của Hùng cho Villa Tuần Châu 1.600.000đ (mức cộng riêng +200.000đ thay mức mặc định +400.000đ).
insert into public.muc_cong (sale_id, can_id, muc) values (t.id('hung'), t.can('villa'), 200000);
-- Một đặt phòng chủ nhà ghi ở 1509 (để thử sale sửa, xóa đặt phòng của căn chủ nhà).
select t.tao_booking('B5', t.can('1509'), '2026-10-13', '2026-10-15', 1800000);

-- ===== Danh mục =====
select t.ok((select count(*) from pg_proc p where p.pronamespace = 'public'::regnamespace and p.prosecdef
             and p.proname in ('fn_gia_dien_san_tu_ghi', 'fn_ghi_dat_phong_tu_ghi', 'fn_sua_dat_phong_tu_ghi',
                               'fn_xoa_dat_phong_tu_ghi')) = 4,
            'YC10.4 danh mục: có fn_gia_dien_san_tu_ghi, fn_ghi_dat_phong_tu_ghi, fn_sua_dat_phong_tu_ghi, fn_xoa_dat_phong_tu_ghi chạy security definer');
select t.ok(not exists (select 1 from pg_proc p where p.pronamespace = 'public'::regnamespace
                        and p.proname in ('fn_gia_dien_san_tu_ghi', 'fn_ghi_dat_phong_tu_ghi', 'fn_sua_dat_phong_tu_ghi',
                                          'fn_xoa_dat_phong_tu_ghi')
                        and (has_function_privilege('anon', p.oid, 'execute') or has_function_privilege('public', p.oid, 'execute')
                             or not has_function_privilege('authenticated', p.oid, 'execute'))),
            'YC10.4 PQ14 danh mục: người chưa đăng nhập không gọi được bốn lệnh đặt phòng tự ghi, người đã đăng nhập gọi được');
select t.ok(not exists (select 1 from pg_proc p where p.pronamespace = 'public'::regnamespace
                        and p.proname in ('fn_gia_dien_san_tu_ghi', 'fn_ghi_dat_phong_tu_ghi', 'fn_sua_dat_phong_tu_ghi',
                                          'fn_xoa_dat_phong_tu_ghi')
                        and exists (select 1 from unnest(coalesce(p.proargnames, '{}')) a
                                    where a ilike '%nguoi%' or a ilike '%sale_id%' or a ilike '%tao_boi%' or a ilike '%nguon%')),
            'YC10.4 PQ14.SALE lệnh đặt phòng tự ghi không nhận người hay nguồn: luôn của người gọi, nguồn sale tự ghi');

-- ===== YC10.4-NT2: điền sẵn giá chủ đã lưu và giá bán của sale =====
select t.dang_nhap(t.id('hung'));
select t.bang(pg_temp.ds(t.can('villa'), '2026-10-08', '2026-10-09', 'tra_chu'), '1400000',
              'YC10.4-NT2 Villa Tuần Châu 08/10 → 09/10: "Trả chủ" điền sẵn 1.400.000đ (giá chủ đã lưu)');
select t.bang(pg_temp.ds(t.can('villa'), '2026-10-08', '2026-10-09', 'thu_khach'), '1600000',
              'YC10.4-NT2 Villa Tuần Châu 08/10 → 09/10: "Thu khách" điền sẵn 1.600.000đ (giá bán của Hùng)');
select t.bang(t.gt($$jsonb_array_length(public.fn_gia_dien_san_tu_ghi(t.can('villa'), '2026-10-08', '2026-10-10') -> 'dem')$$), '2',
              'YC10.4-NT2 điền sẵn trả từng đêm: 08/10 → 10/10 có 2 đêm');

-- YC10 "Giá điền sẵn": đêm cuối tuần theo cài đặt của sale (YC4.6). Hùng mặc định T6, T7: 09/10 (T6) dùng giá cuối tuần.
select t.thoat();
update public.can set gia_chu_cuoi_tuan = 1800000 where id = t.can('villa');
select t.dang_nhap(t.id('hung'));
select t.bang(pg_temp.ds(t.can('villa'), '2026-10-08', '2026-10-10', 'tra_chu'), '3200000',
              'YC10.4-NT2 YC10 "Giá điền sẵn" 08/10 (T5) 1.400.000đ + 09/10 (T6, cuối tuần của Hùng) 1.800.000đ = 3.200.000đ');
select t.bang(pg_temp.ds(t.can('villa'), '2026-10-08', '2026-10-10', 'thu_khach'), '3600000',
              'YC10.4-NT2 YC10 "Giá điền sẵn" thu khách cộng mức cộng từng đêm: 3.200.000đ + 2 × 200.000đ = 3.600.000đ');
select t.thoat();
update public.profiles set dem_cuoi_tuan = '{4}' where id = t.id('hung');
select t.dang_nhap(t.id('hung'));
select t.bang(pg_temp.ds(t.can('villa'), '2026-10-08', '2026-10-09', 'tra_chu'), '1800000',
              'YC10.4-NT2 YC4.6 Hùng đổi đêm cuối tuần sang T5 thì 08/10 điền giá cuối tuần 1.800.000đ');
select t.thoat();
update public.profiles set dem_cuoi_tuan = '{5,6}' where id = t.id('hung');
update public.can set gia_chu_cuoi_tuan = 1400000 where id = t.can('villa');

-- YC10.4 bước 4: chưa lưu giá chủ thì hai ô trống.
update public.can set gia_chu_thuong = null, gia_chu_cuoi_tuan = null where id = t.can('villa');
select t.dang_nhap(t.id('hung'));
select t.ok(pg_temp.ds(t.can('villa'), '2026-10-08', '2026-10-09', 'tra_chu') = 'null'
            and pg_temp.ds(t.can('villa'), '2026-10-08', '2026-10-09', 'thu_khach') = 'null',
            'YC10.4-NT2 YC10.4 bước 4 chưa lưu giá chủ thì "Trả chủ", "Thu khách" không điền sẵn');
select t.thoat();
update public.can set gia_chu_thuong = 1400000, gia_chu_cuoi_tuan = 1400000 where id = t.can('villa');

select t.dang_nhap(t.id('hung'));
select t.ok(pg_temp.loi($$select public.fn_gia_dien_san_tu_ghi(t.can('villa'), '2026-10-08', '2027-10-09')$$)
              ilike 'P0001|Một đặt phòng dài tối đa 365 đêm',
            'YC10.4 Luật kiểm điền sẵn quá 365 đêm: "Một đặt phòng dài tối đa 365 đêm"');

-- ===== YC10.4-NT4: bấm "Đặt phòng" thì lưu đặt phòng tự ghi, hiện ở S6-03, không trạng thái tiền =====
select pg_temp.dat('V2', t.gt(pg_temp.cau_ghi(t.can('villa'), '2026-10-08', '2026-10-09', 1400000, 1600000,
                                              '00000000-0000-0000-0005-000000000002')));
select t.ok(t.b('V2') is not null, 'YC10.4-NT4 Hùng ghi V2 Villa Tuần Châu 08/10 → 09/10 thì lưu được');
select t.thoat();
select t.bang((pg_temp.bk(t.b('V2'))).nguon, 'sale_tu_ghi', 'YC10.4-NT4 YC10 "Dữ liệu" V2 có nguồn "sale tự ghi"');
select t.bang((pg_temp.bk(t.b('V2'))).tao_boi, t.id('hung'), 'YC10.4-NT4 V2 do Hùng ghi');
select t.ok((pg_temp.bk(t.b('V2'))).trang_thai_tien is null and (pg_temp.bk(t.b('V2'))).tien_coc is null,
            'YC10.4-NT4 YC10 "Đặt phòng tự ghi không phải lịch" V2 không có trạng thái tiền, không có cọc');
select t.bang((pg_temp.bk(t.b('V2'))).tien_phong, 1400000::bigint, 'YC10.4-NT4 V2 trả chủ 1.400.000đ ở tiền phòng');
select t.bang(pg_temp.thu(t.b('V2'), t.id('hung')), 1600000::bigint,
              'YC10.4-NT4 QD11 V2 thu khách 1.600.000đ ở phần riêng của Hùng');
select t.bang(pg_temp.dem_tien(t.b('V2')), '2026-10-08=1400000', 'YC10.4-NT4 QD10 V2 có một đêm 08/10, tiền đêm bằng tiền phòng');
select t.dang_nhap(t.id('hung'));
select t.bang((select count(*) from jsonb_array_elements(public.fn_can_tu_nhap(t.can('villa')) -> 'dat_phong') d
               where d ->> 'id' = t.b('V2')::text and d ->> 'tra_chu' = '1400000' and d ->> 'thu_khach' = '1600000'), 1::bigint,
              'YC10.4-NT4 S6-03 (fn_can_tu_nhap) có đặt phòng mới 08/10 → 09/10, trả chủ 1.400.000đ, thu khách 1.600.000đ');

-- HV1-NT1: bấm "Đặt phòng" thêm lần nữa trong lúc đang lưu (cùng mã lần gửi) thì chỉ có một đặt phòng.
select t.bang(t.gt(pg_temp.cau_ghi(t.can('villa'), '2026-10-08', '2026-10-09', 1400000, 1600000,
                                   '00000000-0000-0000-0005-000000000002')), t.b('V2')::text,
              'HV1-NT1 bấm "Đặt phòng" lần hai cùng mã lần gửi thì trả V2, không báo trùng');
select t.bang(pg_temp.so_dp(t.can('villa')), 1::bigint, 'HV1-NT1 database chỉ có một đặt phòng cho Villa Tuần Châu');

-- ===== YC10.4-NT3: sửa "Thu khách" thành 1.700.000đ thì lưu đúng 1.400.000đ và 1.700.000đ =====
select pg_temp.dat('V3', t.gt(pg_temp.cau_ghi(t.can('villa'), '2026-11-01', '2026-11-03', 2800000, 1700000)));
select t.thoat();
select t.ok((pg_temp.bk(t.b('V3'))).tien_phong = 2800000 and pg_temp.thu(t.b('V3'), t.id('hung')) = 1700000,
            'YC10.4-NT3 Hùng sửa "Thu khách" khác giá điền sẵn thì đặt phòng lưu đúng trả chủ và thu khách đã nhập');
select t.dang_nhap(t.id('hung'));
select pg_temp.dat('V4', t.gt(pg_temp.cau_ghi(t.can('villa'), '2026-12-10', '2026-12-11', 1400000, 1700000)));
select t.thoat();
select t.ok((pg_temp.bk(t.b('V4'))).tien_phong = 1400000 and pg_temp.thu(t.b('V4'), t.id('hung')) = 1700000,
            'YC10.4-NT3 đặt phòng 1 đêm lưu đúng trả chủ 1.400.000đ, thu khách 1.700.000đ');
select t.bang(pg_temp.dem_tien(t.b('V3')), '2026-11-01=1400000,2026-11-02=1400000',
              'YC10.4-NT3 QD10 trả chủ bằng giá chủ các đêm thì mỗi đêm giữ giá của nó');

-- ===== Luật kiểm =====
select t.dang_nhap(t.id('hung'));
select t.ok(pg_temp.loi(pg_temp.cau_ghi(t.can('villa'), '2027-01-01', '2028-01-02', 1400000, 1600000))
              ilike 'P0001|Một đặt phòng dài tối đa 365 đêm',
            'YC10.4 Luật kiểm 366 đêm: "Một đặt phòng dài tối đa 365 đêm"');
select t.ok(pg_temp.loi(pg_temp.cau_ghi(t.can('villa'), '2027-01-01', '2027-01-01', 1400000, 1600000)) ilike 'P0001|%',
            'YC10.4 Luật kiểm ngày trả không sau ngày nhận thì từ chối');
select t.ok(pg_temp.loi(pg_temp.cau_ghi(t.can('villa'), '2027-01-01', '2027-01-02', null, 1600000))
              ilike 'P0001|Cần nhập tiền trả chủ',
            'YC10.4 Luật kiểm thiếu trả chủ: "Cần nhập tiền trả chủ"');
select t.ok(pg_temp.loi(pg_temp.cau_ghi(t.can('villa'), '2027-01-01', '2027-01-02', 0, 1600000))
              ilike 'P0001|Cần nhập tiền trả chủ',
            'YC10.4 Luật kiểm trả chủ 0đ: "Cần nhập tiền trả chủ"');
select t.ok(pg_temp.loi(pg_temp.cau_ghi(t.can('villa'), '2027-01-01', '2027-01-02', 1400000, null))
              ilike 'P0001|Cần nhập tiền thu khách',
            'YC10.4 Luật kiểm thiếu thu khách: "Cần nhập tiền thu khách"');
select t.ok(pg_temp.loi(pg_temp.cau_ghi(t.can('villa'), '2027-01-01', '2027-01-02', 1400000, -5))
              ilike 'P0001|Cần nhập tiền thu khách',
            'YC10.4 Luật kiểm thu khách âm: "Cần nhập tiền thu khách"');
select t.ok(pg_temp.loi(pg_temp.cau_ghi(t.can('villa'), '2026-01-01', '2026-01-02', 1400000, 1600000)) = 'qua',
            'YC10.4 Luật kiểm ngày nhận trong quá khứ được (ghi bù)');

-- ===== YC10.4-NT5: trùng đêm với đặt phòng tự ghi khác của căn thì từ chối (QT1.3-VD1) =====
select t.bang(pg_temp.loi(pg_temp.cau_ghi(t.can('villa'), '2026-10-08', '2026-10-10', 2800000, 3200000)),
              'P0001|Bạn đã ghi đặt phòng cho căn này đêm 08/10',
              'YC10.4-NT5 QT1.3-VD1 Hùng ghi 08/10 → 10/10 khi đã có V2: "Bạn đã ghi đặt phòng cho căn này đêm 08/10"');
select t.bang(pg_temp.so_dp(t.can('villa')), 4::bigint, 'YC10.4-NT5 bị từ chối thì không lưu');
select t.bang(pg_temp.loi(pg_temp.cau_ghi(t.can('villa'), '2026-10-31', '2026-11-04', 5600000, 6400000)),
              'P0001|Bạn đã ghi đặt phòng cho căn này đêm 01/11',
              'YC10.4-NT5 QT1.3 báo đêm trùng đầu tiên: 31/10 → 04/11 trùng V3 từ 01/11');
select t.ok(pg_temp.loi(pg_temp.cau_ghi(t.can('villa'), '2026-10-09', '2026-10-10', 1400000, 1600000)) = 'qua',
            'YC10.4-NT5 QT1.1-VD2 09/10 là ngày trả của V2, không phải đêm của V2: lưu được');

-- ===== YC10.4-NT6: căn tự nhập của Lan cùng đêm với V2 thì lưu được (QT1.3-VD2) =====
select t.dang_nhap(t.id('lan'));
select pg_temp.dat('VL', t.gt($$select public.fn_tao_can_tu_nhap(p_chu_can_ten => 'Chú Bình', p_chu_can_sdt => '0900000099',
  p_ma_can => 'Villa Tuần Châu', p_so_phong_ngu => 3, p_client_id => gen_random_uuid(), p_gia_chu_thuong => 1400000)$$));
select t.ok(pg_temp.loi(pg_temp.cau_ghi(t.b('VL'), '2026-10-08', '2026-10-09', 1400000, 1500000)) = 'qua',
            'YC10.4-NT6 QT1.3-VD2 Lan ghi căn tự nhập Villa Tuần Châu của Lan 08/10 → 09/10 cùng đêm với V2: lưu được');

-- ===== YC10.4-NT7: lịch 7 ngày ghi "Bạn" ở 08/10, các ô khác "?" =====
select t.dang_nhap(t.id('hung'));
select t.bang(pg_temp.o(t.can('villa'), '2026-10-08'), 'ban', 'YC10.4-NT7 QT6.4 lịch 7 ngày của Hùng: Villa Tuần Châu 08/10 là "Bạn"');
select t.bang(pg_temp.o(t.can('villa'), '2026-10-07'), 'chua_biet', 'YC10.4-NT7 QT6.4 07/10 không có đặt phòng: "?"');
select t.ok(not exists (select 1 from public.fn_sale_lich('2026-10-05', '2026-10-12') l
                        where l.can_id = t.can('villa') and l.o not in ('ban', 'chua_biet')),
            'YC10.4-NT7 QT6.4 KT-DB.3.7 căn tự nhập không bao giờ có ô "trống" hay "kín"');

-- ===== YC10.4-NT8: sửa V2 =====
select pg_temp.dat('V1', t.gt(pg_temp.cau_ghi(t.can('villa'), '2026-09-20', '2026-09-22', 2800000, 3400000)));
select t.ok(pg_temp.loi(pg_temp.cau_sua(t.b('V2'), '2026-10-08', '2026-10-09', 1400000, 1800000)) = 'qua',
            'YC10.4-NT8 Hùng đổi "Thu khách" của V2 thành 1.800.000đ, "Lưu thay đổi": lưu được');
select t.thoat();
select t.bang(pg_temp.thu(t.b('V2'), t.id('hung')), 1800000::bigint, 'YC10.4-NT8 V2 lưu thu khách 1.800.000đ');
select t.ok((pg_temp.bk(t.b('V2'))).ngay_nhan = '2026-10-08' and (pg_temp.bk(t.b('V2'))).ngay_tra = '2026-10-09'
            and (pg_temp.bk(t.b('V2'))).tien_phong = 1400000 and pg_temp.dem_tien(t.b('V2')) = '2026-10-08=1400000',
            'YC10.4-NT8 V2 giữ các đêm 08/10 → 09/10 và trả chủ 1.400.000đ');
select t.dang_nhap(t.id('hung'));
select t.bang(pg_temp.loi(pg_temp.cau_sua(t.b('V2'), '2026-09-21', '2026-09-22', 1400000, 1800000)),
              'P0001|Bạn đã ghi đặt phòng cho căn này đêm 21/09',
              'YC10.4-NT8 QT1.3 đổi V2 sang đêm trùng V1 (21/09): từ chối');
select t.thoat();
select t.ok((pg_temp.bk(t.b('V2'))).ngay_nhan = '2026-10-08', 'YC10.4-NT8 bị từ chối thì V2 giữ ngày cũ');
select t.dang_nhap(t.id('hung'));
select t.ok(pg_temp.loi(pg_temp.cau_sua(t.b('V2'), '2026-10-08', '2026-10-09', 1400000, 1600000)) = 'qua',
            'YC10.4-NT8 QT1.2 sửa giữ nguyên đêm thì không trùng với chính nó');
select t.ok(pg_temp.loi(pg_temp.cau_sua(t.b('V2'), '2026-10-08', '2026-10-09', 1400000, null))
              ilike 'P0001|Cần nhập tiền thu khách',
            'YC10.4-NT8 Luật kiểm khi sửa: thiếu thu khách thì "Cần nhập tiền thu khách"');
select t.ok(pg_temp.loi(pg_temp.cau_sua(t.b('V2'), '2026-10-08', '2026-10-09', 0, 1600000))
              ilike 'P0001|Cần nhập tiền trả chủ',
            'YC10.4-NT8 Luật kiểm khi sửa: trả chủ 0đ thì "Cần nhập tiền trả chủ"');
select t.ok(pg_temp.loi(pg_temp.cau_sua(t.b('V2'), '2026-10-15', '2026-10-17', 3000000, 3600000)) = 'qua',
            'YC10.4-NT8 đổi V2 sang 15/10 → 17/10, trả chủ 3.000.000đ: lưu được');
select t.thoat();
select t.bang(pg_temp.dem_tien(t.b('V2')), '2026-10-15=1500000,2026-10-16=1500000',
              'YC10.4-NT8 QD10 đổi đêm và tiền thì tiền từng đêm khớp đêm mới, tổng bằng trả chủ');
select t.dang_nhap(t.id('hung'));
select t.ok(pg_temp.loi(pg_temp.cau_sua(t.b('V2'), '2026-10-08', '2026-10-09', 1400000, 1600000)) = 'qua',
            'YC10.4-NT8 đổi V2 về 08/10 → 09/10: lưu được');

-- ===== Vi phạm quyền (YC10 "Ai được làm gì", PQ7, PQ14) =====
select t.dang_nhap(t.id('lan'));
select t.ok(pg_temp.loi(pg_temp.cau_ghi(t.can('villa'), '2027-02-01', '2027-02-02', 1400000, 1600000)) ilike '42501|%',
            'YC10.4 YC10.3-NT7 PQ14.SALE Lan không ghi đặt phòng vào căn tự nhập của Hùng');
select t.ok(pg_temp.loi($$select public.fn_gia_dien_san_tu_ghi(t.can('villa'), '2026-10-08', '2026-10-09')$$) ilike '42501|%',
            'YC10.4 PQ14.SALE PQ5 Lan không đọc giá chủ đã lưu của căn tự nhập của Hùng');
select t.ok(coalesce(t.so($$select 1 from public.booking where can_id = t.can('villa')$$), 0) = 0
            and coalesce(t.so($$select 1 from public.booking_rieng where booking_id = t.b('V2')$$), 0) = 0
            and coalesce(t.so($$select 1 from public.booking_dem where booking_id = t.b('V2')$$), 0) = 0,
            'YC10.4 YC10.3-NT7 PQ14.SALE QD11 Lan không thấy đặt phòng tự ghi của Hùng, thu khách, tiền từng đêm');
select t.ok(pg_temp.loi(pg_temp.cau_sua(t.b('V2'), '2026-10-08', '2026-10-09', 1400000, 9000000)) ilike '42501|%',
            'YC10.4-NT8 PQ14.SALE Lan không sửa được V2 của Hùng');
select t.thoat();
select t.bang(pg_temp.thu(t.b('V2'), t.id('hung')), 1600000::bigint, 'YC10.4-NT8 Lan bị từ chối thì V2 giữ thu khách');
select t.bang((select count(*) from public.booking_rieng where booking_id = t.b('V2')), 1::bigint,
              'YC10.4 QD11 V2 chỉ có phần riêng của Hùng');

select t.dang_nhap(t.id('hoa'));
select t.ok(pg_temp.loi(pg_temp.cau_ghi(t.can('villa'), '2027-02-01', '2027-02-02', 1400000, 1600000)) ilike '42501|%',
            'YC10.4 YC10.3-NT7 PQ14.CHU chủ nhà không ghi đặt phòng vào căn tự nhập');
select t.ok(pg_temp.loi(pg_temp.cau_sua(t.b('V2'), '2026-10-08', '2026-10-09', 1400000, 1600000)) ilike '42501|%'
            and pg_temp.loi(format('select public.fn_xoa_dat_phong_tu_ghi(%L)', t.b('V2'))) ilike '42501|%',
            'YC10.4 PQ14.CHU chủ nhà không sửa, không xóa đặt phòng tự ghi');
select t.ok(coalesce(t.so($$select 1 from public.booking where can_id = t.can('villa')$$), 0) = 0,
            'YC10.4 PQ14.CHU chủ nhà không thấy đặt phòng tự ghi');
select t.ok(pg_temp.loi(pg_temp.cau_ghi(t.can('1509'), '2027-02-01', '2027-02-02', 900000, 900000)) ilike '42501|%',
            'YC10.4 PQ7.CHU lệnh đặt phòng tự ghi chỉ cho căn tự nhập: chủ nhà không dùng cho căn có lịch của mình');

select t.dang_nhap(t.id('hung'));
select t.ok(pg_temp.loi(pg_temp.cau_ghi(t.can('1509'), '2027-02-01', '2027-02-02', 900000, 1100000)) ilike '42501|%',
            'YC10.4 YC10.1-NT4 PQ7.SALE Hùng không ghi đặt phòng thẳng vào căn của chủ nhà');
select t.ok(pg_temp.loi($$select public.fn_gia_dien_san_tu_ghi(t.can('1509'), '2026-10-08', '2026-10-09')$$) ilike '42501|%',
            'YC10.4 PQ7.SALE lệnh điền sẵn chỉ cho căn tự nhập của người gọi');
select t.ok(pg_temp.loi(pg_temp.cau_sua(t.b('B5'), '2026-10-13', '2026-10-15', 1, 1)) ilike '42501|%'
            and pg_temp.loi(format('select public.fn_xoa_dat_phong_tu_ghi(%L)', t.b('B5'))) ilike '42501|%',
            'YC10.4 YC10.1-NT4 PQ7.SALE Hùng không sửa, không xóa đặt phòng của căn chủ nhà');
select t.thoat();
select t.ok(pg_temp.co(t.b('B5')) and (pg_temp.bk(t.b('B5'))).tien_phong = 1800000,
            'YC10.4 PQ7.SALE bị từ chối thì đặt phòng của chủ nhà giữ nguyên');

select t.khach();
select t.ok(pg_temp.loi(pg_temp.cau_ghi(t.can('villa'), '2027-02-01', '2027-02-02', 1400000, 1600000)) ilike '42501|%',
            'YC10.4 KT-DB.3.1 khách chưa đăng nhập không ghi được đặt phòng tự ghi');
select t.thoat();

-- ===== YC10.4-NT9: xóa V2 =====
select t.dang_nhap(t.id('lan'));
select t.ok(pg_temp.loi(format('select public.fn_xoa_dat_phong_tu_ghi(%L)', t.b('V2'))) ilike '42501|%',
            'YC10.4-NT9 PQ14.SALE Lan xóa V2 của Hùng thì không được');
select t.thoat();
select t.ok(pg_temp.co(t.b('V2')), 'YC10.4-NT9 Lan bị từ chối thì V2 còn');
select t.dang_nhap(t.id('hung'));
select t.ok(pg_temp.loi(format('select public.fn_xoa_dat_phong_tu_ghi(%L)', t.b('V2'))) = 'qua',
            'YC10.4-NT9 QD12 Hùng xác nhận "Xóa đặt phòng" V2: xóa được (không bị chặn bởi luật hủy hai bên)');
select t.thoat();
select t.ok(not pg_temp.co(t.b('V2'))
            and not exists (select 1 from public.booking_dem where booking_id = t.b('V2'))
            and not exists (select 1 from public.booking_rieng where booking_id = t.b('V2')),
            'YC10.4-NT9 V2 không còn, cả tiền từng đêm và thu khách');
select t.dang_nhap(t.id('hung'));
select t.bang(pg_temp.o(t.can('villa'), '2026-10-08'), 'chua_biet', 'YC10.4-NT9 QT6.4 ô 08/10 trên lịch 7 ngày về "?"');
select t.ok(not exists (select 1 from jsonb_array_elements(public.fn_can_tu_nhap(t.can('villa')) -> 'dat_phong') d
                        where d ->> 'id' = t.b('V2')::text),
            'YC10.4-NT9 S6-03 không còn V2');
select t.ok(pg_temp.loi(format('select public.fn_xoa_dat_phong_tu_ghi(%L)', t.b('V2'))) ilike '42501|%',
            'YC10.4-NT9 xóa lần nữa đặt phòng đã xóa: không tìm thấy');
select t.ok(pg_temp.loi(pg_temp.cau_ghi(t.can('villa'), '2026-10-08', '2026-10-09', 1400000, 1600000)) = 'qua',
            'YC10.4-NT9 QT2.1 xóa V2 thì ghi lại được đêm 08/10');

-- ===== YC10 "Dữ liệu": xóa căn tự nhập (US56) xóa thật mọi đặt phòng tự ghi ghi qua lệnh này =====
select t.ok(pg_temp.loi(format('select public.fn_xoa_can_tu_nhap(%L)', t.can('villa'))) = 'qua',
            'YC10.4 YC10.3-NT9 QD12 xóa căn tự nhập có đặt phòng tự ghi: xóa được');
select t.thoat();
select t.bang(pg_temp.so_dp(t.can('villa')), 0::bigint, 'YC10.4 YC10 "Dữ liệu" xóa căn tự nhập xóa mọi đặt phòng tự ghi của nó');
select t.ok(not exists (select 1 from public.booking_rieng r where r.booking_id in (t.b('V1'), t.b('V3'), t.b('V4'))),
            'YC10.4 QD11 xóa căn tự nhập xóa cả thu khách của các đặt phòng tự ghi');
select t.bang(pg_temp.so_dp(t.b('VL')), 1::bigint, 'YC10.4 QT1.3 xóa căn của Hùng không đụng căn tự nhập của Lan');
