-- US54 · Tab Căn của sale (YC10.1). Viết trước migration (US54-TA1, CL14.5): task sau không sửa file này.
-- Hợp đồng database cho màn S6, S6-00, S6-07, S6-08:
--   fn_tab_can_sale() returns table (nhom text, can_id uuid, ma_can text, ten_toa text, so_phong_ngu smallint,
--     so_giuong smallint, loai_view text, khach_den date, ket_noi_id uuid, chu_id uuid, ten_chu text,
--     chu_da_xoa_tai_khoan boolean, cap_nhat_luc timestamptz, chu_can_ten text)
--     nhom 'cua_toi': căn có lịch, chưa ẩn của người gọi; khach_den = ngày trả của đặt phòng có đêm hôm nay (null là trống).
--     nhom 'nguon': mỗi căn trong my_shared_can_ids() một dòng kèm chủ nhà; cap_nhat_luc = lần đổi lịch hay giá gần nhất
--       của các căn chủ đó chia sẻ cho người gọi (YC10-H2). Chủ đã xóa tài khoản: đúng một dòng, can_id và mọi cột căn null,
--       cap_nhat_luc null, chỉ tên và cờ (QD13). Chỉ kết nối 'da_ket_noi'; 'sale_bo' không trả.
--     nhom 'tu_nhap': căn tự nhập của người gọi, chu_can_ten; không có khach_den.
--     Không có cột giá, số điện thoại, số khách.
--   fn_chi_tiet_can_cua_toi(p_can_id uuid, p_tu date) returns jsonb: căn có lịch, chưa ẩn của người gọi:
--     {can_id, ma_can, ten_toa, so_phong_ngu, so_giuong, loai_view, anh: [đường dẫn], dem: [{ngay, o: 'kin'|'trong', gia}]}
--     7 đêm từ p_tu. Căn không phải căn có lịch của người gọi: 42501.
--   fn_sale_bo_dong_chu(p_ket_noi_id uuid) returns void: sale bỏ dòng chủ đã xóa tài khoản (YC10.1 bước 10): kết nối sang
--     'sale_bo'. Không phải kết nối của người gọi (với vai sale): 42501. Chủ chưa xóa tài khoản: P0001.
select t.fixture();

-- Bộ mẫu của S6 (du-lieu-mau.md): căn của Hùng Green Bay 0812, Mường Thanh 1605; Anh Tuấn kết nối Hùng với 1103, 2208.
insert into public.toa_nha (ten, home247_dat_san) values ('Green Bay', true), ('Mường Thanh', true), ('À La Carte', true)
  on conflict do nothing;
insert into public.can (id, nguoi_giu, loai, ma_can, so_phong_ngu, so_giuong, loai_view, toa_nha_id)
values ('00000000-0000-0000-0001-000000000812', t.id('hung'), 'co_lich', '0812', 2, null, 'bien',
        (select id from public.toa_nha where lower(ten) = 'green bay')),
       ('00000000-0000-0000-0001-000000001605', t.id('hung'), 'co_lich', '1605', 1, null, 'bien',
        (select id from public.toa_nha where lower(ten) = 'mường thanh')),
       ('00000000-0000-0000-0001-000000002208', t.id('tuan'), 'co_lich', '2208', 1, 1, 'bien',
        (select id from public.toa_nha where lower(ten) = 'à la carte'));
update public.can set loai_view = 'bien' where id in (t.can('1509'), t.can('3402'));
update public.can set so_phong_ngu = 1 where id = t.can('3402');
update public.can set loai_view = 'thanh_pho' where id = t.can('1103');
insert into public.ket_noi (id, chu_id, sale_id, trang_thai, nguon, pham_vi, xem_coc)
values ('00000000-0000-0000-0003-000000000003', t.id('tuan'), t.id('hung'), 'da_ket_noi', 'link_moi', 'tat_ca', true);
-- Giá đêm của Hùng cho 0812 tháng 10: 750.000đ thường, 900.000đ cuối tuần (đêm T6, T7).
insert into public.gia_thang (can_id, thang, gia_thuong, gia_cuoi_tuan)
values ('00000000-0000-0000-0001-000000000812', '2026-10-01', 750000, 900000);
-- 0812 kín 08/10 → 10/10; 1605 có khách tới hôm nay + 5; B1 của Hùng ở 1509 (đặt phòng đã chốt với Chị Hoa).
select t.tao_booking('G1', '00000000-0000-0000-0001-000000000812', '2026-10-08', '2026-10-10', 1500000);
select t.tao_booking('M1', '00000000-0000-0000-0001-000000001605', public.local_today() - 1, public.local_today() + 5, 3000000);
select t.tao_booking('B1', t.can('1509'), '2026-10-10', '2026-10-12', 2200000, t.id('hung'), 'tu_yeu_cau');
-- Lần đổi lịch, giá: Chị Hoa 2 giờ trước (1509), 3402 cũ hơn; Anh Tuấn hôm qua.
update public.can set lich_doi_luc = now() - interval '2 hours' where id = t.can('1509');
update public.can set lich_doi_luc = now() - interval '5 hours' where id = t.can('3402');
update public.can set lich_doi_luc = now() - interval '1 day' where id = t.can('1103');
update public.can set lich_doi_luc = now() - interval '30 hours' where id = '00000000-0000-0000-0001-000000002208';

-- ===== Danh mục =====
select t.ok((select count(distinct proname) from pg_proc
             where proname in ('fn_tab_can_sale', 'fn_chi_tiet_can_cua_toi', 'fn_sale_bo_dong_chu')
               and pronamespace = 'public'::regnamespace and prosecdef) = 3,
            'YC10.1 danh mục: ba hàm của tab Căn có và chạy security definer');
select t.ok(not exists (select 1 from pg_proc p
                        where p.proname in ('fn_tab_can_sale', 'fn_chi_tiet_can_cua_toi', 'fn_sale_bo_dong_chu')
                          and p.pronamespace = 'public'::regnamespace and has_function_privilege('anon', p.oid, 'execute')),
            'YC10.1 PQ17.LINK người chưa đăng nhập không gọi được các hàm tab Căn');
select t.ok(not exists (select 1 from information_schema.routines r
                        join information_schema.parameters p on p.specific_name = r.specific_name
                        where r.routine_schema = 'public' and r.routine_name = 'fn_tab_can_sale' and p.parameter_mode = 'OUT'
                          and (p.parameter_name ilike '%gia%' or p.parameter_name ilike '%so_dien_thoai%'
                               or p.parameter_name ilike '%sdt%' or p.parameter_name ilike '%khach%' and p.parameter_name <> 'khach_den'
                               or p.parameter_name ilike '%muc_cong%')),
            'YC10.1-NT2 YC10.1-NT7 PQ2.SALE danh sách tab Căn không có cột giá, số điện thoại, số khách');

-- ===== YC10.1-NT1: Sale Hùng mở tab Căn =====
select t.dang_nhap(t.id('hung'));
select t.bang(t.gt($$select count(distinct can_id) from public.fn_tab_can_sale() where nhom = 'cua_toi'$$), '2',
              'YC10.1-NT1 nhóm "CĂN CỦA TÔI" đếm 2');
select t.bang(t.gt($$select count(distinct chu_id) from public.fn_tab_can_sale() where nhom = 'nguon' and not chu_da_xoa_tai_khoan$$), '2',
              'YC10.1-NT1 nhóm "CHỦ NHÀ ĐÃ KẾT NỐI" đếm 2 (Chị Hoa, Anh Tuấn)');
select t.bang(t.gt($$select count(*) from public.fn_tab_can_sale() where nhom = 'tu_nhap'$$), '1',
              'YC10.1-NT1 nhóm "CĂN TỰ NHẬP" đếm 1');
select t.bang(t.gt($$select string_agg(ten_toa || ' ' || ma_can || ':' || coalesce(khach_den::text, 'trong'), ',' order by ma_can)
                     from public.fn_tab_can_sale() where nhom = 'cua_toi'$$),
              'Green Bay 0812:trong,Mường Thanh 1605:' || (public.local_today() + 5),
              'YC10.1-NT1 bước 1 căn của tôi: Green Bay 0812 trống hôm nay, Mường Thanh 1605 có khách tới ngày trả');
select t.bang(t.gt($$select string_agg(ten_chu || ':' || coalesce(ten_toa || ' ', '') || ma_can || ':' || so_phong_ngu || ':'
                                       || coalesce(so_giuong::text, '-'), ',' order by ten_chu, ma_can)
                     from public.fn_tab_can_sale() where nhom = 'nguon'$$),
              'Anh Tuấn:Sapphire 1103:3:2,Anh Tuấn:À La Carte 2208:1:1,Chị Hoa:ICON40 1509:2:3,Chị Hoa:3402:1:-',
              'YC10.1-NT1 YC10.1-NT2 bước 2 các căn theo chủ nhà, có số phòng ngủ và số giường');
select t.ok(t.gt($$select bool_and(cap_nhat_luc between now() - interval '2 hours 1 minute' and now() - interval '119 minutes')
                   from public.fn_tab_can_sale() where nhom = 'nguon' and ten_chu = 'Chị Hoa'$$) = 'true',
            'YC10.1 bước 2 YC10-H2 Chị Hoa "Cập nhật 2 giờ trước": lần đổi gần nhất các căn chia sẻ cho Hùng');
select t.ok(t.gt($$select bool_and(cap_nhat_luc = now() - interval '1 day')
                   from public.fn_tab_can_sale() where nhom = 'nguon' and ten_chu = 'Anh Tuấn'$$) = 'true',
            'YC10.1 bước 2 YC10-H2 Anh Tuấn "Cập nhật hôm qua"');
select t.bang(t.gt($$select ma_can || ':' || chu_can_ten || ':' || coalesce(khach_den::text, 'null')
                     from public.fn_tab_can_sale() where nhom = 'tu_nhap'$$),
              'Villa Tuần Châu:Chú Bình:null', 'YC10.1-NT3 bước 3 căn tự nhập Villa Tuần Châu của Chú Bình, không có tình trạng hôm nay');
select t.thoat();

-- YC10-H2: Lan chỉ được chia sẻ 1509, nên "Cập nhật" chỉ tính 1509 (3402 đổi sau cũng không tính).
update public.can set lich_doi_luc = now() - interval '10 minutes' where id = t.can('3402');
select t.dang_nhap(t.id('lan'));
select t.ok(t.gt($$select bool_and(cap_nhat_luc = now() - interval '2 hours') from public.fn_tab_can_sale()
                   where nhom = 'nguon'$$) = 'true',
            'YC10.1 bước 2 YC10-H2 lần cập nhật chỉ tính căn chủ nhà chia sẻ cho sale này');
select t.bang(t.gt($$select string_agg(ma_can, ',') from public.fn_tab_can_sale() where nhom = 'nguon'$$), '1509',
              'YC10.1 PQ3.SALE Lan chỉ thấy 1509 trong phạm vi kết nối');
select t.thoat();

-- ===== YC10.1-NT6: Sale Lan đọc Green Bay 0812 của Hùng =====
select t.dang_nhap(t.id('lan'));
select t.loi($$select public.fn_chi_tiet_can_cua_toi('00000000-0000-0000-0001-000000000812', '2026-10-07')$$, '42501',
             'YC10.1-NT6 PQ13.SALE Lan đọc chi tiết Green Bay 0812 của Hùng bị từ chối');
select t.ok(coalesce(t.so($$select * from public.fn_tab_can_sale() where ma_can in ('0812', '1605') or nhom <> 'nguon'$$), 0) = 0,
            'YC10.1-NT6 PQ13.SALE tab Căn của Lan không có căn của Hùng');
select t.ok(coalesce(t.so($$select * from public.can where id = '00000000-0000-0000-0001-000000000812'$$), 0) = 0,
            'YC10.1-NT6 PQ13.SALE Lan không đọc dòng căn 0812 qua bảng');
select t.ok(coalesce(t.so($$select * from public.gia_thang where can_id = '00000000-0000-0000-0001-000000000812'$$), 0) = 0,
            'YC10.1-NT6 PQ13.SALE Lan không đọc giá 0812');
select t.ok(coalesce(t.so($$select * from public.fn_sale_lich('2026-10-07', '2026-10-14') where ma_can = '0812'$$), 0) = 0,
            'YC10.1-NT6 PQ13.SALE lịch của Lan không có 0812');
select t.thoat();

-- ===== YC10.1-NT5, bước 7: Hùng chạm Green Bay 0812 (S6-07) =====
select t.dang_nhap(t.id('hung'));
select t.bang(t.gt($$select public.fn_chi_tiet_can_cua_toi('00000000-0000-0000-0001-000000000812', '2026-10-07') ->> 'ma_can'
                     || '|' || (public.fn_chi_tiet_can_cua_toi('00000000-0000-0000-0001-000000000812', '2026-10-07') ->> 'ten_toa')$$),
              '0812|Green Bay', 'YC10.1 bước 7 S6-07 chi tiết căn của tôi Green Bay 0812');
select t.bang(t.gt($$select string_agg(case when x ->> 'o' = 'kin' then 'Kín' else (x ->> 'gia') end, ',' order by x ->> 'ngay')
                     from jsonb_array_elements(public.fn_chi_tiet_can_cua_toi('00000000-0000-0000-0001-000000000812',
                                                                               '2026-10-07') -> 'dem') x$$),
              '750000,Kín,Kín,900000,750000,750000,750000',
              'YC10.1 bước 7 S6-07 "7 ngày tới · giá đêm của bạn": 750k, Kín, Kín, 900k, 750k, 750k, 750k');
select t.loi($$select public.fn_chi_tiet_can_cua_toi(t.can('1509'), '2026-10-07')$$, '42501',
             'YC10.1-NT4 bước 6 căn của chủ nhà không mở chi tiết căn của tôi (S6-07)');
select t.loi($$select public.fn_chi_tiet_can_cua_toi(t.can('villa'), '2026-10-07')$$, '42501',
             'YC10.1 bước 8 căn tự nhập không mở chi tiết căn của tôi (S6-07)');
select t.thoat();

-- ===== YC10.1-NT4: Hùng ghi đặt phòng, sửa, xóa 1509 thẳng ở database =====
select t.dang_nhap(t.id('hung'));
select t.ok(t.ma_loi($$select public.fn_tao_booking(t.can('1509'), '2026-11-02', '2026-11-03', 900000, gen_random_uuid())$$) is not null,
            'YC10.1-NT4 PQ7.SALE Hùng ghi đặt phòng thẳng vào 1509 của Chị Hoa bị từ chối');
select t.loi($$insert into public.booking (can_id, ngay_nhan, ngay_tra, nguon, tao_boi, tien_phong)
               values (t.can('1509'), '2026-11-02', '2026-11-03', 'chu_ghi', t.id('hung'), 900000)$$, '42501',
             'YC10.1-NT4 PQ7.SALE Hùng ghi thẳng bảng booking bị từ chối');
select t.ok(t.ma_loi($$select public.fn_sua_can(t.can('1509'), '{"ma_can": "1509X"}'::jsonb)$$) is not null,
            'YC10.1-NT4 PQ3.SALE Hùng sửa 1509 bị từ chối');
select t.ok(t.ma_loi($$select public.fn_dat_gia_thang(t.can('1509'), array['2026-11-01'::date], 100000, 100000)$$) is not null,
            'YC10.1-NT4 PQ5 Hùng sửa giá 1509 bị từ chối');
select t.ok(t.ma_loi($$select public.fn_xoa_can(t.can('1509'))$$) is not null,
            'YC10.1-NT4 PQ3.SALE Hùng xóa 1509 bị từ chối');
select t.loi($$update public.can set ma_can = '1509X' where id = t.can('1509')$$, '42501',
             'YC10.1-NT4 PQ3.SALE Hùng sửa thẳng bảng can bị từ chối');
select t.thoat();
select t.bang((select ma_can || '|' || (an_luc is null)::text from public.can where id = t.can('1509')), '1509|true',
              'YC10.1-NT4 1509 còn nguyên sau các lệnh bị từ chối');
select t.bang((select count(*) from public.booking where can_id = t.can('1509') and ngay_nhan = '2026-11-02'), 0::bigint,
              'YC10.1-NT4 không có đặt phòng nào được ghi vào 1509');
select t.bang((select gia_thuong from public.gia_thang where can_id = t.can('1509') and thang = '2026-11-01'), 900000::bigint,
              'YC10.1-NT4 giá 1509 tháng 11 còn nguyên');

-- ===== Bỏ dòng khi chủ chưa xóa tài khoản: không được (bỏ nguồn là YC10.2) =====
select t.dang_nhap(t.id('hung'));
select t.loi($$select public.fn_sale_bo_dong_chu(t.kn('hoa', 'hung'))$$, 'P0001',
             'YC10.1-NT8 bước 10 dòng chủ nhà chưa xóa tài khoản không bỏ được bằng "Bỏ khỏi danh sách"');
select t.thoat();

-- ===== YC10.1-NT7: Chị Hoa đã xóa tài khoản =====
update public.profiles set so_dien_thoai = null, da_xoa_luc = now() where id = t.id('hoa');
select t.dang_nhap(t.id('hung'));
select t.bang(t.gt($$select count(distinct chu_id) from public.fn_tab_can_sale() where nhom = 'nguon' and not chu_da_xoa_tai_khoan$$), '1',
              'YC10.1-NT7 nhóm "CHỦ NHÀ ĐÃ KẾT NỐI" đếm 1');
select t.bang(t.gt($$select count(*) from public.fn_tab_can_sale() where chu_id = t.id('hoa')$$), '1',
              'YC10.1-NT7 S6-08 Chị Hoa còn đúng một dòng');
select t.bang(t.gt($$select ten_chu || '|' || chu_da_xoa_tai_khoan || '|' || ket_noi_id from public.fn_tab_can_sale() where chu_id = t.id('hoa')$$),
              'Chị Hoa|true|' || t.kn('hoa', 'hung'), 'YC10.1-NT7 S6-08 dòng Chị Hoa: tên cũ và cờ đã xóa tài khoản');
select t.ok(t.gt($$select bool_and(can_id is null and ma_can is null and ten_toa is null and so_phong_ngu is null and so_giuong is null
                                   and loai_view is null and khach_den is null and cap_nhat_luc is null)
                   from public.fn_tab_can_sale() where chu_id = t.id('hoa')$$) = 'true',
            'YC10.1-NT7 PQ23.SALE dữ liệu trả về dòng Chị Hoa không có căn, lịch, giá, lần cập nhật');
select t.ok(coalesce(t.so($$select * from public.v_nguoi_ket_noi where id = t.id('hoa') and so_dien_thoai is not null$$), 0) = 0,
            'YC10.1-NT7 PQ2.SALE không có số điện thoại Chị Hoa');
select t.loi($$select public.fn_chi_tiet_can_cua_toi(t.can('1509'), '2026-10-07')$$, '42501',
             'YC10.1-NT7 PQ23.SALE không đọc được chi tiết căn của Chị Hoa');
select t.thoat();

-- ===== YC10.1-NT8: Hùng bấm "Bỏ khỏi danh sách" ở dòng Chị Hoa =====
select t.dang_nhap(t.id('lan'));
select t.loi($$select public.fn_sale_bo_dong_chu(t.kn('hoa', 'hung'))$$, '42501',
             'YC10.1-NT8 PQ17.SALE Sale Lan không bỏ được dòng kết nối của Sale Hùng');
select t.thoat();
select t.dang_nhap(t.id('hoa'));
select t.loi($$select public.fn_sale_bo_dong_chu(t.kn('hoa', 'hung'))$$, '42501',
             'YC10.1-NT8 PQ17.CHU chủ nhà không dùng được lệnh bỏ dòng của sale');
select t.thoat();
select t.dang_nhap(t.id('hung'));
select t.khong_loi($$select public.fn_sale_bo_dong_chu(t.kn('hoa', 'hung'))$$,
                   'YC10.1-NT8 Hùng bỏ dòng Chị Hoa (đã xóa tài khoản) được, không cần xác nhận lần hai');
select t.bang(t.gt($$select count(*) from public.fn_tab_can_sale() where chu_id = t.id('hoa')$$), '0',
              'YC10.1-NT8 dòng Chị Hoa biến khỏi tab Căn của Hùng');
select t.bang(t.gt($$select count(*) from public.v_booking_cua_sale where id = t.b('B1')$$), '1',
              'YC10.1-NT8 B1 vẫn ở danh sách đặt phòng của Hùng');
select t.thoat();
select t.bang((select trang_thai from public.ket_noi where id = t.kn('hoa', 'hung')), 'sale_bo',
              'YC10.1-NT8 YC10 Dữ liệu kết nối của Hùng với Chị Hoa sang "sale bỏ"');
select t.bang((select trang_thai from public.ket_noi where id = t.kn('hoa', 'lan')), 'da_ket_noi',
              'YC10.1-NT8 kết nối của Lan với Chị Hoa không đổi');

-- ===== YC10.1-NT11: Chị Hoa đăng ký lại cùng số =====
select t.dang_nhap(t.id('hoa'));
select t.khong_loi($$select public.fn_dang_ky('Chị Hoa', '0900000001')$$, 'YC10.1-NT11 Chị Hoa đăng ký lại với cùng số');
select t.thoat();
select t.dang_nhap(t.id('hung'));
select t.bang(t.gt($$select count(*) from public.fn_tab_can_sale() where chu_id = t.id('hoa')$$), '0',
              'YC10.1-NT11 YC10-H5 Chị Hoa không trở lại nguồn phòng của Hùng');
select t.ok(coalesce(t.so($$select * from public.my_shared_can_ids() x where x in (t.can('1509'), t.can('3402'))$$), 0) = 0,
            'YC10.1-NT11 Hùng không thấy lại căn của Chị Hoa');
select t.ok(coalesce(t.so($$select * from public.fn_sale_lich('2026-10-07', '2026-10-14') where nhom = 'nguon' and ten_chu = 'Chị Hoa'$$), 0) = 0,
            'YC10.1-NT11 lịch của Hùng không có căn của Chị Hoa');
select t.thoat();
select t.dang_nhap(t.id('lan'));
select t.bang(t.gt($$select string_agg(ma_can || ':' || chu_da_xoa_tai_khoan, ',') from public.fn_tab_can_sale() where chu_id = t.id('hoa')$$),
              '1509:false', 'YC10.1-NT11 QD13 Lan chưa bỏ dòng: Chị Hoa trở lại như trước');
select t.thoat();

-- ===== Người chưa đăng nhập =====
select t.khach();
select t.loi($$select * from public.fn_tab_can_sale()$$, '42501', 'YC10.1 PQ17.LINK người chưa đăng nhập đọc tab Căn bị từ chối');
select t.thoat();
