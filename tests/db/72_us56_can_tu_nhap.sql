-- US56 · Căn tự nhập (YC10.3). Viết trước migration (US56-TA1, CL14.5): task sau không sửa file này.
-- Hợp đồng database cho màn S6-02, S6-03, S6-03-00:
--   fn_tao_can_tu_nhap(p_chu_can_ten text, p_chu_can_sdt text, p_ma_can text, p_so_phong_ngu int, p_client_id uuid,
--     p_toa_nha_id uuid default null, p_loai_view text default null, p_so_giuong int default null,
--     p_gia_chu_thuong bigint default null, p_gia_chu_cuoi_tuan bigint default null, p_anh uuid[] default null) returns uuid
--     Chỉ sale (vai_chon 'sale', chưa xóa tài khoản): khác thì 42501. Thiếu ô bắt buộc: P0001 "Còn thiếu: ..." (đúng ô thiếu).
--     Trùng mã: cùng người, cùng tòa (không tòa tính là một nhóm), mã bỏ khoảng trắng hai đầu, không phân biệt hoa thường: P0001.
--     Ảnh tối đa 12 (gan_anh_can). Cùng p_client_id thì trả căn đã tạo.
--   fn_sua_can_tu_nhap(p_can_id uuid, p_sua jsonb) returns void: khóa như fn_sua_can, thêm chu_can_ten, chu_can_sdt (null là xóa
--     số), gia_chu_thuong, gia_chu_cuoi_tuan. Không phải căn tự nhập của người gọi: 42501.
--   fn_xoa_can_tu_nhap(p_can_id uuid) returns void: xóa thật căn, ảnh, đặt phòng tự ghi của căn. Không phải của người gọi: 42501.
--   fn_can_tu_nhap(p_can_id uuid) returns jsonb: {can_id, ma_can, toa_nha_id, ten_toa, so_phong_ngu, so_giuong, loai_view,
--     chu_can_ten, chu_can_sdt, gia_chu_thuong, gia_chu_cuoi_tuan, anh: [{id, duong_dan}], dat_phong: [{id, ngay_nhan, ngay_tra,
--     tra_chu, thu_khach}]}. Không phải căn tự nhập của người gọi: 42501.
-- YC10.3-NT1, NT2, NT3, NT4, NT7, NT8, NT9, NT10, YC10 "Ai được làm gì", "Dữ liệu", QT6.4, PQ3, PQ7, PQ14, QD11.
-- Số theo DLM: Villa Tuần Châu của Sale Hùng (chủ căn Chú Bình), V1 20/09 → 22/09 trả chủ 2.800.000đ thu khách 3.400.000đ,
-- V2 08/10 → 09/10 trả chủ 1.400.000đ thu khách 1.600.000đ.
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
-- Ảnh tạm của một người (vai chủ database), trả id.
create or replace function pg_temp.anh_tam(p_nguoi uuid, p_ten text) returns uuid language sql as $$
  insert into public.anh_can (nguoi_tai, duong_dan) values (p_nguoi, p_nguoi::text || '/' || p_ten || '.jpg') returning id
$$;
-- Ảnh chụp một căn và mọi thứ của nó (vai chủ database), để kiểm "dữ liệu không đổi".
create or replace function pg_temp.chup(p_can uuid) returns text language sql security definer as $$
  select md5(coalesce((select to_jsonb(c)::text from public.can c where c.id = p_can), 'không có')
             || coalesce((select string_agg(a.id::text || a.duong_dan, ',' order by a.id) from public.anh_can a where a.can_id = p_can), '')
             || coalesce((select string_agg(to_jsonb(b)::text, ',' order by b.id) from public.booking b where b.can_id = p_can), '')
             || coalesce((select string_agg(to_jsonb(r)::text, ',' order by r.booking_id) from public.booking_rieng r
                          join public.booking b on b.id = r.booking_id where b.can_id = p_can), ''))
$$;
-- Câu tạo căn tự nhập đủ ô (sửa từng ô bằng tham số).
create or replace function pg_temp.cau_tao(p_ten text, p_sdt text, p_ma text, p_pn int, p_toa uuid default null,
                                           p_anh uuid[] default null) returns text language sql as $$
  select format('select public.fn_tao_can_tu_nhap(p_chu_can_ten => %L, p_chu_can_sdt => %L, p_ma_can => %L, '
                'p_so_phong_ngu => %L, p_client_id => %L, p_toa_nha_id => %L, p_anh => %L::uuid[])',
                p_ten, p_sdt, p_ma, p_pn, gen_random_uuid(), p_toa, p_anh)
$$;
-- Số căn tự nhập của một người (vai chủ database).
create or replace function pg_temp.so_tu_nhap(p_nguoi uuid) returns bigint language sql security definer as $$
  select count(*) from public.can where nguoi_giu = p_nguoi and loai = 'tu_nhap'
$$;

-- V1, V2 của Villa Tuần Châu (đặt phòng tự ghi do US57 tạo; ở đây chèn sẵn), thu khách ở phần riêng của Hùng.
select t.tao_booking('V1', t.can('villa'), '2026-09-20', '2026-09-22', 2800000);
select t.tao_booking('V2', t.can('villa'), '2026-10-08', '2026-10-09', 1400000);
insert into public.booking_rieng (booking_id, nguoi_id, tien_thu_khach)
values (t.b('V1'), t.id('hung'), 3400000), (t.b('V2'), t.id('hung'), 1600000);
insert into public.anh_can (can_id, nguoi_tai, duong_dan, thu_tu)
values (t.can('villa'), t.id('hung'), t.id('hung')::text || '/villa-1.jpg', 1);

-- ===== Danh mục: bốn lệnh chạy security definer, chỉ người đã đăng nhập gọi được =====
select t.ok((select count(*) from pg_proc p where p.pronamespace = 'public'::regnamespace and p.prosecdef
             and p.proname in ('fn_tao_can_tu_nhap', 'fn_sua_can_tu_nhap', 'fn_xoa_can_tu_nhap', 'fn_can_tu_nhap')) = 4,
            'YC10.3 danh mục: có fn_tao_can_tu_nhap, fn_sua_can_tu_nhap, fn_xoa_can_tu_nhap, fn_can_tu_nhap chạy security definer');
select t.ok(not exists (select 1 from pg_proc p where p.pronamespace = 'public'::regnamespace
                        and p.proname in ('fn_tao_can_tu_nhap', 'fn_sua_can_tu_nhap', 'fn_xoa_can_tu_nhap', 'fn_can_tu_nhap')
                        and (has_function_privilege('anon', p.oid, 'execute') or has_function_privilege('public', p.oid, 'execute')
                             or not has_function_privilege('authenticated', p.oid, 'execute'))),
            'YC10.3-NT7 PQ14 danh mục: người chưa đăng nhập không gọi được bốn lệnh căn tự nhập, người đã đăng nhập gọi được');
select t.ok(not exists (select 1 from pg_proc p where p.pronamespace = 'public'::regnamespace
                        and p.proname in ('fn_tao_can_tu_nhap', 'fn_sua_can_tu_nhap', 'fn_xoa_can_tu_nhap', 'fn_can_tu_nhap')
                        and exists (select 1 from unnest(coalesce(p.proargnames, '{}')) a
                                    where a ilike '%nguoi%' or a ilike '%sale_id%' or a ilike '%owner%')),
            'YC10.3-NT7 PQ14.SALE lệnh căn tự nhập không nhận mã người: chỉ làm trên căn của người gọi');

-- ===== YC10.3-NT1: thiếu một trong bốn ô bắt buộc thì database từ chối, đúng ô thiếu =====
select t.dang_nhap(t.id('hung'));
select t.ok(pg_temp.loi(pg_temp.cau_tao('', '0900000098', '1509', 2)) ilike 'P0001|Còn thiếu: tên chủ nhà',
            'YC10.3-NT1 thiếu tên chủ nhà: từ chối "Còn thiếu: tên chủ nhà"');
select t.ok(pg_temp.loi(pg_temp.cau_tao('Chú Bình', '   ', '1509', 2)) ilike 'P0001|Còn thiếu: số điện thoại',
            'YC10.3-NT1 thiếu số điện thoại (chỉ khoảng trắng): từ chối "Còn thiếu: số điện thoại"');
select t.ok(pg_temp.loi(pg_temp.cau_tao('Chú Bình', '0900000098', ' ', 2)) ilike 'P0001|Còn thiếu: mã căn',
            'YC10.3-NT1 thiếu mã căn: từ chối "Còn thiếu: mã căn"');
select t.ok(pg_temp.loi(pg_temp.cau_tao('Chú Bình', '0900000098', '1509', null)) ilike 'P0001|Còn thiếu: số phòng ngủ',
            'YC10.3-NT1 thiếu số phòng ngủ: từ chối "Còn thiếu: số phòng ngủ"');
select t.ok(pg_temp.loi(pg_temp.cau_tao(null, null, null, null))
              ilike 'P0001|Còn thiếu: tên chủ nhà, số điện thoại, mã căn, số phòng ngủ',
            'YC10.3-NT1 thiếu cả bốn ô: "Còn thiếu: tên chủ nhà, số điện thoại, mã căn, số phòng ngủ"');
select t.ok(pg_temp.loi(pg_temp.cau_tao('', '0900000098', '', 2)) ilike 'P0001|Còn thiếu: tên chủ nhà, mã căn',
            'YC10.3-NT1 thiếu tên và mã căn: chỉ liệt kê hai ô đó');
select t.thoat();
select t.bang(pg_temp.so_tu_nhap(t.id('hung')), 1::bigint, 'YC10.3-NT1 sau các lần bị từ chối Hùng vẫn chỉ có Villa Tuần Châu');

-- ===== YC10.3-NT2: không nhập giá chủ, số giường vẫn thêm được =====
select t.dang_nhap(t.id('hung'));
select t.bang(pg_temp.loi(pg_temp.cau_tao('Chú Bình', '0900000098', 'Villa Bãi Cháy', 2)), 'qua',
              'YC10.3-NT2 không giá chủ, không số giường: thêm được');
select t.thoat();
select t.ok((select gia_chu_thuong is null and gia_chu_cuoi_tuan is null and so_giuong is null and loai = 'tu_nhap'
                    and chu_can_ten = 'Chú Bình' and chu_can_sdt = '0900000098' and so_phong_ngu = 2
             from public.can where nguoi_giu = t.id('hung') and ma_can = 'Villa Bãi Cháy'),
            'YC10.3-NT2 căn lưu là căn tự nhập, giá chủ và số giường để trống, đủ tên, số chủ căn');
-- Có giá chủ, số giường: lưu đúng; giá phải là số nguyên dương.
select t.dang_nhap(t.id('hung'));
select t.bang(pg_temp.loi($$select public.fn_tao_can_tu_nhap(p_chu_can_ten => 'Cô Mai', p_chu_can_sdt => '0900000097',
                p_ma_can => 'Homestay Hòn Gai', p_so_phong_ngu => 3, p_client_id => gen_random_uuid(), p_loai_view => 'bien',
                p_so_giuong => 4, p_gia_chu_thuong => 1200000, p_gia_chu_cuoi_tuan => 1500000)$$), 'qua',
              'YC10.3-NT2 có giá chủ ngày thường, cuối tuần, số giường, loại view: thêm được');
select t.ok(pg_temp.loi($$select public.fn_tao_can_tu_nhap(p_chu_can_ten => 'Cô Mai', p_chu_can_sdt => '0900000097',
                p_ma_can => 'Homestay 2', p_so_phong_ngu => 1, p_client_id => gen_random_uuid(), p_gia_chu_thuong => 0)$$) like 'P0001|%',
            'YC10.3-NT2 giá chủ 0đ bị từ chối');
select t.ok(pg_temp.loi($$select public.fn_tao_can_tu_nhap(p_chu_can_ten => 'Cô Mai', p_chu_can_sdt => '0900000097',
                p_ma_can => 'Homestay 2', p_so_phong_ngu => 1, p_client_id => gen_random_uuid(), p_loai_view => 'song')$$) like 'P0001|%',
            'YC10.3 loại view ngoài danh sách bị từ chối');
select t.thoat();
select t.ok((select gia_chu_thuong = 1200000 and gia_chu_cuoi_tuan = 1500000 and so_giuong = 4 and loai_view = 'bien'
             from public.can where nguoi_giu = t.id('hung') and ma_can = 'Homestay Hòn Gai'),
            'YC10.3-NT2 giá chủ và số giường lưu đúng');

-- Cùng mã lần gửi: không tạo hai căn.
select t.dang_nhap(t.id('hung'));
select t.ok((select public.fn_tao_can_tu_nhap(p_chu_can_ten => 'Chú Long', p_chu_can_sdt => '0900000096', p_ma_can => 'Nhà Long',
                p_so_phong_ngu => 1, p_client_id => '00000000-0000-0000-0056-000000000001'))
            = (select public.fn_tao_can_tu_nhap(p_chu_can_ten => 'Chú Long', p_chu_can_sdt => '0900000096', p_ma_can => 'Nhà Long',
                p_so_phong_ngu => 1, p_client_id => '00000000-0000-0000-0056-000000000001')),
            'YC10.3 QT5.6 gửi lại cùng mã lần gửi: trả căn đã tạo, không tạo căn thứ hai');
select t.thoat();

-- ===== YC10.3-NT3: căn mới ở nhóm CĂN TỰ NHẬP, lịch 7 ngày mọi ô "?" =====
select t.dang_nhap(t.id('hung'));
select set_config('t.ma_moi', (select public.fn_tao_can_tu_nhap(p_chu_can_ten => 'Chú Bình', p_chu_can_sdt => '0900000098',
  p_ma_can => 'Villa Cái Dăm', p_so_phong_ngu => 4, p_client_id => gen_random_uuid(), p_gia_chu_thuong => 1400000))::text, true);
select t.bang((select nhom from public.fn_tab_can_sale() where can_id = t.b('moi')), 'tu_nhap',
              'YC10.3-NT3 căn vừa thêm ở nhóm tu_nhap (CĂN TỰ NHẬP) của tab Căn');
select t.bang((select chu_can_ten from public.fn_tab_can_sale() where can_id = t.b('moi')), 'Chú Bình',
              'YC10.3-NT3 dòng tab Căn có tên chủ căn');
select t.bang((select count(*) from public.fn_sale_lich(public.local_today(), public.local_today() + 7)
               where can_id = t.b('moi') and nhom = 'tu_nhap' and o = 'chua_biet' and gia_ban is null), 7::bigint,
              'YC10.3-NT3 QT6.4 lịch 7 ngày: cả 7 ô của căn mới là chua_biet ("?"), không giá');
select t.bang((select count(*) from public.fn_sale_lich(public.local_today(), public.local_today() + 7)
               where can_id = t.b('moi') and o is distinct from 'chua_biet'), 0::bigint,
              'YC10.3-NT3 QT6.4 không ô nào của căn mới là trống hay kín');
select t.thoat();

-- ===== YC10.3-NT4: tối đa 12 ảnh =====
select set_config('t.anh12', (select array_agg(pg_temp.anh_tam(t.id('hung'), 'a' || i))::text from generate_series(1, 12) i), true);
select set_config('t.anh13', (select array_agg(pg_temp.anh_tam(t.id('hung'), 'b' || i))::text from generate_series(1, 13) i), true);
select t.dang_nhap(t.id('hung'));
select t.ok(pg_temp.loi(pg_temp.cau_tao('Chú Bình', '0900000098', 'Căn 13 ảnh', 2, null, current_setting('t.anh13')::uuid[]))
              ilike 'P0001|%12 ảnh%',
            'YC10.3-NT4 database từ chối căn tự nhập có 13 ảnh');
select t.bang(pg_temp.loi(pg_temp.cau_tao('Chú Bình', '0900000098', 'Căn 12 ảnh', 2, null, current_setting('t.anh12')::uuid[])),
              'qua', 'YC10.3-NT4 12 ảnh thì thêm được');
select t.thoat();
select t.bang((select count(*) from public.anh_can a join public.can c on c.id = a.can_id
               where c.nguoi_giu = t.id('hung') and c.ma_can = 'Căn 12 ảnh'), 12::bigint, 'YC10.3-NT4 căn có đúng 12 ảnh, theo thứ tự chọn');
select t.ok(not exists (select 1 from public.can where ma_can = 'Căn 13 ảnh'), 'YC10.3-NT4 căn 13 ảnh không được lưu');
select t.dang_nhap(t.id('hung'));
select t.ok(pg_temp.loi(format('select public.fn_sua_can_tu_nhap(%L, %L::jsonb)', t.can('villa'),
                               jsonb_build_object('anh', to_jsonb(current_setting('t.anh13')::uuid[]))::text)) ilike 'P0001|%12 ảnh%',
            'YC10.3-NT4 sửa căn tự nhập lên 13 ảnh bị từ chối');
select t.thoat();
select t.bang((select count(*) from public.anh_can where can_id = t.can('villa')), 1::bigint, 'YC10.3-NT4 Villa vẫn 1 ảnh sau lần bị từ chối');

-- ===== YC10.3-NT10: trùng mã là cùng người, cùng tòa, bỏ khoảng trắng, không phân biệt hoa thường =====
select t.dang_nhap(t.id('hung'));
select t.bang(pg_temp.loi(pg_temp.cau_tao('Chú Bình', '0900000098', '1509', 2, t.toa('icon40'))), 'qua',
              'YC10.3-NT10 Hùng thêm căn tự nhập 1509 ở ICON40: được (khác người với 1509 của Chị Hoa)');
select t.ok(pg_temp.loi(pg_temp.cau_tao('Chú Bình', '0900000098', ' 1509 ', 2, t.toa('icon40'))) like 'P0001|%',
            'YC10.3-NT10 Hùng thêm " 1509 " ở ICON40: từ chối vì trùng');
select t.ok(pg_temp.loi(pg_temp.cau_tao('Chú Bình', '0900000098', 'villa tuần châu', 2)) like 'P0001|%',
            'YC10.3-NT10 YC10-H3 "villa tuần châu" không tòa trùng Villa Tuần Châu không tòa: từ chối');
select t.bang(pg_temp.loi(pg_temp.cau_tao('Chú Bình', '0900000098', '1509', 2, t.toa('sapphire'))), 'qua',
              'YC10.3-NT10 Hùng thêm 1509 ở Sapphire: được');
select t.bang(pg_temp.loi(pg_temp.cau_tao('Chú Bình', '0900000098', '1509', 2)), 'qua',
              'YC10.3-NT10 Hùng thêm 1509 không tòa: được (khác tòa)');
select t.thoat();
select t.dang_nhap(t.id('lan'));
select t.bang(pg_temp.loi(pg_temp.cau_tao('Chú Bình', '0900000098', '1509', 2, t.toa('icon40'))), 'qua',
              'YC10.3-NT10 QT1.3 Lan thêm 1509 ở ICON40: được (căn tự nhập của hai sale là hai căn)');
select t.thoat();
select t.bang((select count(*) from public.can where nguoi_giu = t.id('hung') and loai = 'tu_nhap' and btrim(ma_can) = '1509'),
              3::bigint, 'YC10.3-NT10 Hùng có đúng ba căn tự nhập 1509 (ICON40, Sapphire, không tòa)');
-- Sửa mã thành mã trùng cùng tòa cũng bị từ chối.
select t.dang_nhap(t.id('hung'));
select t.ok(pg_temp.loi(format('select public.fn_sua_can_tu_nhap(%L, %L::jsonb)', t.can('villa'),
                               jsonb_build_object('ma_can', '1509', 'toa_nha_id', t.toa('icon40'))::text)) like 'P0001|%',
            'YC10.3-NT10 sửa Villa thành 1509 ở ICON40 (đã có): từ chối');
select t.thoat();

-- ===== YC10.3-NT7: Sale Lan, Chị Hoa không đọc, sửa, xóa, ghi vào Villa Tuần Châu của Hùng =====
select set_config('t.chup_villa', pg_temp.chup(t.can('villa')), true);
select t.dang_nhap(t.id('lan'));
select t.ok(coalesce(t.so(format('select 1 from public.can where id = %L', t.can('villa'))), 0) = 0,
            'YC10.3-NT7 PQ14.SALE Lan không đọc được Villa Tuần Châu của Hùng ở bảng căn');
select t.ok(coalesce(t.so(format('select 1 from public.anh_can where can_id = %L', t.can('villa'))), 0) = 0,
            'YC10.3-NT7 PQ14.SALE Lan không đọc được ảnh của Villa');
select t.ok(pg_temp.loi(format('select public.fn_can_tu_nhap(%L)', t.can('villa'))) like '42501|%',
            'YC10.3-NT7 PQ14.SALE Lan mở chi tiết Villa (S6-03): 42501');
select t.ok(coalesce(t.so(format('select 1 from public.fn_tab_can_sale() where can_id = %L', t.can('villa'))), 0) = 0,
            'YC10.3-NT7 PQ14.SALE tab Căn của Lan không có Villa');
select t.ok(coalesce(t.so(format('select 1 from public.fn_sale_lich(%L, %L) where can_id = %L',
                                 '2026-09-20', '2026-09-27', t.can('villa'))), 0) = 0,
            'YC10.3-NT7 PQ14.SALE lịch của Lan không có Villa');
select t.ok(pg_temp.loi(format('select public.fn_sua_can_tu_nhap(%L, %L::jsonb)', t.can('villa'), '{"chu_can_ten": "Lan sửa"}'))
              like '42501|%', 'YC10.3-NT7 PQ14.SALE Lan sửa Villa: 42501');
select t.ok(pg_temp.loi(format('select public.fn_sua_can(%L, %L::jsonb)', t.can('villa'), '{"ma_can": "Lan sửa"}'))
              like '42501|%', 'YC10.3-NT7 PQ14.SALE Lan sửa Villa bằng lệnh sửa căn: 42501');
select t.ok(pg_temp.loi(format('select public.fn_xoa_can_tu_nhap(%L)', t.can('villa'))) like '42501|%',
            'YC10.3-NT7 PQ14.SALE Lan xóa Villa: 42501');
select t.ok(pg_temp.loi(format('select public.fn_xoa_can(%L)', t.can('villa'))) like '42501|%',
            'YC10.3-NT7 PQ14.SALE Lan xóa Villa bằng lệnh xóa căn: 42501');
select t.ok(pg_temp.loi(format('select public.fn_tao_booking(p_can_id => %L, p_ngay_nhan => %L, p_ngay_tra => %L, p_tien_phong => 1400000)',
                               t.can('villa'), '2026-12-01', '2026-12-02')) like '42501|%',
            'YC10.3-NT7 PQ14.SALE PQ7.SALE Lan ghi đặt phòng vào Villa: 42501');
select t.ok(pg_temp.loi(format($$insert into public.booking (can_id, ngay_nhan, ngay_tra, nguon, tao_boi, tien_phong)
                                 values (%L, '2026-12-01', '2026-12-02', 'sale_tu_ghi', %L, 1400000)$$, t.can('villa'), t.id('lan')))
              like '42501|%', 'YC10.3-NT7 Lan ghi thẳng bảng đặt phòng vào Villa: bị từ chối');
select t.ok(pg_temp.loi(format($$update public.can set chu_can_sdt = null where id = %L$$, t.can('villa'))) like '42501|%',
            'YC10.3-NT7 Lan sửa thẳng bảng căn: bị từ chối');
select t.ok(pg_temp.loi(format($$delete from public.can where id = %L$$, t.can('villa'))) like '42501|%',
            'YC10.3-NT7 Lan xóa thẳng bảng căn: bị từ chối');
select t.ok(coalesce(t.so(format('select 1 from public.booking where id in (%L, %L)', t.b('V1'), t.b('V2'))), 0) = 0,
            'YC10.3-NT7 PQ7.SALE Lan không đọc được V1, V2');
select t.ok(coalesce(t.so(format('select 1 from public.booking_rieng where booking_id in (%L, %L)', t.b('V1'), t.b('V2'))), 0) = 0,
            'YC10.3-NT7 QD11 Lan không đọc được thu khách của V1, V2');
select t.ok(coalesce(t.so(format('select 1 from public.booking_dem where booking_id in (%L, %L)', t.b('V1'), t.b('V2'))), 0) = 0,
            'YC10.3-NT7 Lan không đọc được tiền từng đêm của V1, V2');
select t.ok(coalesce(t.so(format('select 1 from public.v_booking_cua_sale where id in (%L, %L)', t.b('V1'), t.b('V2'))), 0) = 0,
            'YC10.3-NT7 Lan không thấy V1, V2 qua v_booking_cua_sale');
select t.thoat();

select t.dang_nhap(t.id('hoa'));
select t.ok(coalesce(t.so(format('select 1 from public.can where id = %L', t.can('villa'))), 0) = 0
            and coalesce(t.so('select 1 from public.can where loai = ''tu_nhap'''), 0) = 0,
            'YC10.3-NT7 PQ14.CHU Chị Hoa không đọc được căn tự nhập nào');
select t.ok(pg_temp.loi(format('select public.fn_can_tu_nhap(%L)', t.can('villa'))) like '42501|%',
            'YC10.3-NT7 PQ14.CHU Chị Hoa mở chi tiết Villa: 42501');
select t.ok(pg_temp.loi(format('select public.fn_sua_can_tu_nhap(%L, %L::jsonb)', t.can('villa'), '{"chu_can_ten": "Hoa sửa"}'))
              like '42501|%', 'YC10.3-NT7 PQ14.CHU Chị Hoa sửa Villa: 42501');
select t.ok(pg_temp.loi(format('select public.fn_xoa_can_tu_nhap(%L)', t.can('villa'))) like '42501|%',
            'YC10.3-NT7 PQ14.CHU Chị Hoa xóa Villa: 42501');
select t.ok(coalesce(t.so(format('select 1 from public.booking where id in (%L, %L)', t.b('V1'), t.b('V2'))), 0) = 0,
            'YC10.3-NT7 PQ14.CHU Chị Hoa không đọc được V1, V2');
select t.ok(pg_temp.loi(pg_temp.cau_tao('Chú Bình', '0900000098', 'Căn của Hoa', 2)) like '42501|%',
            'YC10.3-NT7 PQ14.CHU Chị Hoa tạo căn tự nhập: 42501');
select t.ok(pg_temp.loi(format('select public.fn_xoa_can_tu_nhap(%L)', t.can('1509'))) like '42501|%',
            'YC10.3-NT7 PQ3.CHU lệnh xóa căn tự nhập không xóa được căn có lịch 1509');
select t.ok(pg_temp.loi(format('select public.fn_sua_can_tu_nhap(%L, %L::jsonb)', t.can('1509'), '{"chu_can_ten": "x"}'))
              like '42501|%', 'YC10.3-NT7 PQ3.CHU lệnh sửa căn tự nhập không sửa được căn có lịch 1509');
select t.thoat();

select t.khach();
select t.ok(pg_temp.loi(pg_temp.cau_tao('Chú Bình', '0900000098', 'Căn khách', 2)) like '42501|%',
            'YC10.3-NT7 người chưa đăng nhập tạo căn tự nhập: bị từ chối');
select t.ok(pg_temp.loi(format('select public.fn_can_tu_nhap(%L)', t.can('villa'))) like '42501|%',
            'YC10.3-NT7 người chưa đăng nhập đọc Villa: bị từ chối');
select t.thoat();

select t.bang(pg_temp.chup(t.can('villa')), current_setting('t.chup_villa'),
              'YC10.3-NT7 sau mọi lần thử của Lan, Chị Hoa, khách: Villa, ảnh, V1, V2 không đổi');
select t.bang(pg_temp.so_tu_nhap(t.id('hoa')), 0::bigint, 'YC10.3-NT7 Chị Hoa không có căn tự nhập nào');

-- Sale bị xóa tài khoản không tạo được căn tự nhập (vai sale chưa xóa tài khoản mới tạo được).
update public.profiles set da_xoa_luc = now(), so_dien_thoai = null where id = t.id('nga');
select t.dang_nhap(t.id('nga'));
select t.ok(pg_temp.loi(pg_temp.cau_tao('Chú Bình', '0900000098', 'Căn của Nga', 2)) like '42501|%',
            'YC10.3 PQ23 sale đã xóa tài khoản tạo căn tự nhập: 42501');
select t.thoat();
update public.profiles set da_xoa_luc = null, so_dien_thoai = '0900000005' where id = t.id('nga');

-- ===== S6-03: Hùng đọc chi tiết Villa (đúng của mình) =====
select t.dang_nhap(t.id('hung'));
select set_config('t.ct', public.fn_can_tu_nhap(t.can('villa'))::text, true);
select t.thoat();
select t.bang(current_setting('t.ct')::jsonb ->> 'chu_can_ten', 'Chú Bình', 'YC10.3 bước 8 S6-03 có tên chủ căn');
select t.bang(current_setting('t.ct')::jsonb ->> 'chu_can_sdt', '0900000099', 'YC10.3 bước 8 S6-03 có số chủ căn (để gọi hỏi lịch)');
select t.bang((select jsonb_agg(jsonb_build_array(d ->> 'ngay_nhan', d ->> 'ngay_tra', (d ->> 'tra_chu')::bigint, (d ->> 'thu_khach')::bigint))
               from jsonb_array_elements(current_setting('t.ct')::jsonb -> 'dat_phong') d),
              '[["2026-09-20", "2026-09-22", 2800000, 3400000], ["2026-10-08", "2026-10-09", 1400000, 1600000]]'::jsonb,
              'YC10.3 bước 9 S6-03 đặt phòng đã ghi: V1 rồi V2, trả chủ, thu khách đúng');
select t.bang(jsonb_array_length(current_setting('t.ct')::jsonb -> 'anh'), 1, 'YC10.3 S6-03 có ảnh của Villa');

-- Đặt phòng chủ nhà ghi cho căn khác của sale khác không lẫn vào (thu khách chỉ của người gọi, QD11).
insert into public.booking_rieng (booking_id, nguoi_id, tien_thu_khach) values (t.b('V1'), t.id('lan'), 9999999)
  on conflict do nothing;
select t.dang_nhap(t.id('hung'));
select t.bang((select (d ->> 'thu_khach')::bigint from jsonb_array_elements(public.fn_can_tu_nhap(t.can('villa')) -> 'dat_phong') d
               where d ->> 'ngay_nhan' = '2026-09-20'), 3400000::bigint,
              'YC10.3 QD11 thu khách lấy phần riêng của chính người gọi');
select t.thoat();
delete from public.booking_rieng where booking_id = t.b('V1') and nguoi_id = t.id('lan');

-- ===== YC10.3-NT8: xóa số chủ căn rồi lưu =====
select t.dang_nhap(t.id('hung'));
select t.bang(pg_temp.loi(format('select public.fn_sua_can_tu_nhap(%L, %L::jsonb)', t.can('villa'),
                                 '{"chu_can_sdt": null, "gia_chu_thuong": 1500000, "so_phong_ngu": 3}')), 'qua',
              'YC10.3-NT8 Hùng xóa số chủ căn, sửa giá chủ, số phòng ngủ: lưu được');
select t.ok(public.fn_can_tu_nhap(t.can('villa')) -> 'chu_can_sdt' = 'null'::jsonb
            or not (public.fn_can_tu_nhap(t.can('villa')) ? 'chu_can_sdt'),
            'YC10.3-NT8 S6-03 không còn số chủ căn');
select t.ok(pg_temp.loi(format('select public.fn_sua_can_tu_nhap(%L, %L::jsonb)', t.can('villa'), '{"chu_can_ten": " "}'))
              ilike 'P0001|Còn thiếu: tên chủ nhà', 'YC10.3 bước 12 sửa tên chủ căn thành trống: từ chối');
select t.thoat();
select t.ok((select chu_can_sdt is null and gia_chu_thuong = 1500000 and so_phong_ngu = 3 and chu_can_ten = 'Chú Bình'
             from public.can where id = t.can('villa')),
            'YC10.3-NT8 QD11 database không còn giữ số chủ căn; giá, số phòng ngủ đã đổi; tên giữ nguyên');
select t.ok(not exists (select 1 from public.can where chu_can_sdt = '0900000099'),
            'YC10.3-NT8 không dòng căn nào còn số 0900000099');
select t.dang_nhap(t.id('hung'));
select t.bang(pg_temp.loi(format('select public.fn_sua_can_tu_nhap(%L, %L::jsonb)', t.can('villa'),
                                 '{"chu_can_sdt": "0900000099", "chu_can_ten": "Chú Bình Hạ Long"}')), 'qua',
              'YC10.3 bước 12 nhập lại số, sửa tên chủ căn: lưu được');
select t.thoat();
select t.ok((select chu_can_sdt = '0900000099' and chu_can_ten = 'Chú Bình Hạ Long' from public.can where id = t.can('villa')),
            'YC10.3 bước 12 tên và số chủ căn đã đổi');

-- ===== YC10.3-NT9: xóa căn tự nhập xóa thật căn, ảnh, V1, V2 =====
select set_config('t.chup_1509', pg_temp.chup(t.can('1509')), true);
insert into public.muc_cong (sale_id, can_id, muc) values (t.id('hung'), t.can('villa'), 200000);
insert into public.lan_gui_khach (sale_id, can_id, dem) values (t.id('hung'), t.can('villa'), daterange('2026-12-01', '2026-12-02'));
select t.dang_nhap(t.id('hung'));
select t.bang(pg_temp.loi(format('select public.fn_xoa_can_tu_nhap(%L)', t.can('villa'))), 'qua',
              'YC10.3-NT9 Hùng xác nhận xóa Villa Tuần Châu: được');
select t.ok(pg_temp.loi(format('select public.fn_can_tu_nhap(%L)', t.can('villa'))) like '42501|%',
            'YC10.3-NT9 mở lại Villa sau khi xóa: không còn');
select t.ok(coalesce(t.so(format('select 1 from public.fn_tab_can_sale() where can_id = %L', t.can('villa'))), 0) = 0,
            'YC10.3-NT9 tab Căn không còn Villa');
select t.thoat();
select t.ok(not exists (select 1 from public.can where id = t.can('villa')), 'YC10.3-NT9 dòng căn Villa không còn (xóa thật, không ẩn)');
select t.ok(not exists (select 1 from public.anh_can where can_id = t.can('villa') or duong_dan = t.id('hung')::text || '/villa-1.jpg'),
            'YC10.3-NT9 ảnh của Villa không còn');
select t.ok(not exists (select 1 from public.booking where id in (t.b('V1'), t.b('V2'))), 'YC10.3-NT9 V1, V2 không còn');
select t.ok(not exists (select 1 from public.booking_dem where booking_id in (t.b('V1'), t.b('V2')))
            and not exists (select 1 from public.booking_rieng where booking_id in (t.b('V1'), t.b('V2'))),
            'YC10.3-NT9 tiền từng đêm, thu khách của V1, V2 không còn');
select t.ok(not exists (select 1 from public.muc_cong where can_id = t.can('villa'))
            and not exists (select 1 from public.lan_gui_khach where can_id = t.can('villa')),
            'YC10.3-NT9 giá bán, lần gửi khách của Villa không còn');
select t.bang(pg_temp.chup(t.can('1509')), current_setting('t.chup_1509'), 'YC10.3-NT9 xóa Villa không đụng căn 1509 của Chị Hoa');
select t.ok(exists (select 1 from public.can where nguoi_giu = t.id('hung') and ma_can = 'Villa Bãi Cháy'),
            'YC10.3-NT9 các căn tự nhập khác của Hùng còn nguyên');
select t.dang_nhap(t.id('hung'));
select t.ok(pg_temp.loi(format('select public.fn_xoa_can_tu_nhap(%L)', t.can('villa'))) like '42501|%',
            'YC10.3-NT9 xóa lần nữa căn đã xóa: 42501');
select t.thoat();
