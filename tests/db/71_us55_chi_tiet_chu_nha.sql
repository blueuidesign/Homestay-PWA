-- US55 · Chi tiết chủ nhà và bỏ nguồn (YC10.2). Viết trước migration (US55-TA1, CL14.5): task sau không sửa file này.
-- Hợp đồng database cho màn S6-04 và dòng chủ nhà ở tab Căn (S6):
--   fn_chi_tiet_chu_nha(p_ket_noi_id uuid, p_ngay date default null) returns jsonb. Chỉ kết nối của người gọi với vai sale.
--     Đang kết nối, chủ còn tài khoản: {trang_thai: 'da_ket_noi', ket_noi_id, chu_id, ten_chu, so_dien_thoai (null khi chủ
--       chưa cho), ket_noi_tu (ngày, giờ Việt Nam), cap_nhat_luc (lần đổi lịch, giá gần nhất của các căn chia sẻ cho người gọi),
--       xem_coc, can: [{can_id, ma_can, ten_toa, so_phong_ngu, so_giuong, loai_view, gia_dem}] (gia_dem: giá chủ đêm p_ngay,
--       mặc định hôm nay; null khi chưa đặt giá), so_dat_phong, tien_chenh (QT3.1: đặt phòng chưa hủy của người gọi ở căn chủ đó)}.
--     Chủ đã ngừng cho xem, hay đã xóa tài khoản: {trang_thai: 'khong_con_quyen', ly_do: 'chu_ngung' | 'chu_xoa_tai_khoan',
--       ket_noi_id, chu_id, ten_chu}: không căn, giá, số điện thoại (YC10-H6).
--     Không phải kết nối của người gọi, 'sale_bo', 'chua_ket_noi': 42501.
--   fn_sale_bo_nguon(p_ket_noi_id uuid) returns void: kết nối 'da_ket_noi' của người gọi sang 'sale_bo'; yêu cầu đang chờ
--     của người gọi tới căn của chủ đó sang 'da_huy'; không ghi thông báo cho chủ (YC10-H8). Không phải của người gọi: 42501.
--     Kết nối không ở 'da_ket_noi': P0001.
--   fn_tab_can_sale() thêm cột chu_ngung boolean: kết nối 'chu_ngung' trả đúng một dòng nhom 'nguon', chỉ tên và cờ (YC10-H1).
--   fn_sale_bo_dong_chu(p_ket_noi_id) bỏ được cả dòng chủ đã ngừng cho xem (không hỏi lại).
select t.fixture();

-- Hùng kết nối Chị Hoa từ 02/08/2026 (S6-04). B1 của Hùng ở 1509 đã chốt: thu khách 2.600.000đ, trả chủ 2.200.000đ (QT3.1-VD1).
update public.ket_noi set tao_luc = '2026-08-02 10:00:00+07' where id = t.kn('hoa', 'hung');
update public.can set loai_view = 'bien' where id in (t.can('1509'), t.can('3402'));
select t.tao_booking('B1', t.can('1509'), '2026-10-10', '2026-10-12', 2200000, t.id('hung'), 'tu_yeu_cau');
insert into public.booking_rieng (booking_id, nguoi_id, tien_thu_khach) values (t.b('B1'), t.id('hung'), 2600000);
-- Đặt phòng chủ ghi cho khách lẻ không phải của Hùng, không tính.
select t.tao_booking('H1', t.can('3402'), '2026-10-14', '2026-10-15', 800000);
-- Lần đổi lịch, giá đặt sau khi ghi đặt phòng (ghi đặt phòng cũng đổi lần cập nhật).
update public.can set lich_doi_luc = now() - interval '2 hours' where id = t.can('1509');
update public.can set lich_doi_luc = now() - interval '5 hours' where id = t.can('3402');
-- Yêu cầu chờ: Y1 của Hùng tới 1509, Y2 của Lan tới 1509.
select t.tao_yeu_cau('Y1', t.can('1509'), t.id('hung'), public.local_today() + 10, public.local_today() + 12,
                     array[900000, 900000]::bigint[]);
select t.tao_yeu_cau('Y2', t.can('1509'), t.id('lan'), public.local_today() + 20, public.local_today() + 21,
                     array[900000]::bigint[]);

-- ===== Danh mục =====
select t.ok((select count(distinct proname) from pg_proc
             where proname in ('fn_chi_tiet_chu_nha', 'fn_sale_bo_nguon')
               and pronamespace = 'public'::regnamespace and prosecdef) = 2,
            'YC10.2 danh mục: fn_chi_tiet_chu_nha, fn_sale_bo_nguon có và chạy security definer');
select t.ok(not exists (select 1 from pg_proc p
                        where p.proname in ('fn_chi_tiet_chu_nha', 'fn_sale_bo_nguon', 'fn_tab_can_sale', 'fn_sale_bo_dong_chu')
                          and p.pronamespace = 'public'::regnamespace and has_function_privilege('anon', p.oid, 'execute')),
            'YC10.2 PQ17.LINK người chưa đăng nhập không gọi được hàm chi tiết chủ nhà, bỏ nguồn');

-- ===== YC10.2-NT1: S6-04 của Hùng, giá đêm của cả hai căn =====
select t.dang_nhap(t.id('hung'));
select t.bang(t.gt($$select public.fn_chi_tiet_chu_nha(t.kn('hoa', 'hung'), '2026-10-07') ->> 'trang_thai'$$), 'da_ket_noi',
              'YC10.2 bước 1 S6-04 Chị Hoa đang kết nối');
select t.bang(t.gt($$select x ->> 'ten_chu' || '|' || (x ->> 'so_dien_thoai') || '|' || (x ->> 'ket_noi_tu')
                     from public.fn_chi_tiet_chu_nha(t.kn('hoa', 'hung'), '2026-10-07') x$$),
              'Chị Hoa|0900000001|2026-08-02',
              'YC10.2 bước 1 PQ1.SALE PQ2.SALE tên, số điện thoại chủ nhà, "kết nối từ 02/08/2026"');
select t.ok(t.gt($$select ((public.fn_chi_tiet_chu_nha(t.kn('hoa', 'hung'), '2026-10-07') ->> 'cap_nhat_luc')::timestamptz
                           = now() - interval '2 hours')::text$$) = 'true',
            'YC10.2 bước 1 "Lịch tự cập nhật · lần cuối 2 giờ trước"');
select t.bang(t.gt($$select public.fn_chi_tiet_chu_nha(t.kn('hoa', 'hung'), '2026-10-07') ->> 'xem_coc'$$), 'true',
              'YC10.2 bước 2 QD7 Chị Hoa bật "Tình trạng cọc" cho Hùng');
select t.bang(t.gt($$select string_agg(coalesce(c ->> 'ten_toa' || ' ', '') || (c ->> 'ma_can') || ':' || (c ->> 'loai_view') || ':'
                                       || coalesce(c ->> 'gia_dem', '-'), ',' order by c ->> 'ma_can')
                     from jsonb_array_elements(public.fn_chi_tiet_chu_nha(t.kn('hoa', 'hung'), '2026-10-07') -> 'can') c$$),
              'ICON40 1509:bien:900000,3402:bien:800000',
              'YC10.2-NT1 bước 3 PQ3.SALE QD7 "CĂN · 2" kèm giá chủ đêm 07/10 của 1509 và 3402');
select t.ok(t.gt($$select public.fn_chi_tiet_chu_nha(t.kn('hoa', 'hung')) is not null$$) = 'true',
            'YC10.2 bước 3 không truyền ngày thì lấy giá đêm hôm nay');
select t.bang(t.gt($$select (x ->> 'so_dat_phong') || '|' || (x ->> 'tien_chenh')
                     from public.fn_chi_tiet_chu_nha(t.kn('hoa', 'hung'), '2026-10-07') x$$),
              '1|400000', 'YC10.2 bước 4 QT3.1-VD1 "BẠN ĐÃ BÁN: 1 đặt phòng", tiền chênh 400.000đ; yêu cầu chờ không tính');
select t.thoat();
-- Căn chưa đặt giá thì không có giá.
delete from public.gia_thang where can_id = t.can('3402') and thang = '2026-10-01';
select t.dang_nhap(t.id('hung'));
select t.bang(t.gt($$select string_agg((c ->> 'ma_can') || ':' || coalesce(c ->> 'gia_dem', '-'), ',' order by c ->> 'ma_can')
                     from jsonb_array_elements(public.fn_chi_tiet_chu_nha(t.kn('hoa', 'hung'), '2026-10-07') -> 'can') c$$),
              '1509:900000,3402:-', 'YC10.2-NT1 căn chưa đặt giá đêm đó thì không có giá');
select t.thoat();
-- Lan chỉ được chia sẻ 1509; Lan chưa bán gì với Chị Hoa.
select t.dang_nhap(t.id('lan'));
select t.bang(t.gt($$select string_agg(c ->> 'ma_can', ',')
                     from jsonb_array_elements(public.fn_chi_tiet_chu_nha(t.kn('hoa', 'lan'), '2026-10-07') -> 'can') c$$),
              '1509', 'YC10.2 bước 3 PQ3.SALE S6-04 của Lan chỉ có căn trong phạm vi chia sẻ');
select t.bang(t.gt($$select (x ->> 'so_dat_phong') || '|' || (x ->> 'tien_chenh')
                     from public.fn_chi_tiet_chu_nha(t.kn('hoa', 'lan'), '2026-10-07') x$$),
              '0|0', 'YC10.2 bước 4 PQ15.SALE kết quả bán chỉ tính đặt phòng của người gọi');
select t.thoat();

-- ===== YC10.2-NT5: Sale Lan bỏ nguồn trên kết nối của Sale Hùng; sale chưa kết nối đọc chi tiết =====
select t.dang_nhap(t.id('lan'));
select t.loi($$select public.fn_sale_bo_nguon(t.kn('hoa', 'hung'))$$, '42501',
             'YC10.2-NT5 PQ17.SALE Sale Lan bỏ nguồn trên kết nối của Sale Hùng bị từ chối');
select t.loi($$select public.fn_chi_tiet_chu_nha(t.kn('hoa', 'hung'))$$, '42501',
             'YC10.2-NT5 PQ17.SALE Sale Lan đọc chi tiết trên kết nối của Sale Hùng bị từ chối');
select t.loi($$select public.fn_sale_bo_dong_chu(t.kn('hoa', 'hung'))$$, '42501',
             'YC10.2-NT5 PQ17.SALE Sale Lan không xóa được dòng kết nối của Sale Hùng');
select t.loi($$update public.ket_noi set trang_thai = 'sale_bo' where id = t.kn('hoa', 'hung')$$, '42501',
             'YC10.2-NT5 PQ17.SALE Sale Lan sửa thẳng bảng ket_noi bị từ chối');
select t.thoat();
select t.dang_nhap(t.id('nga'));
select t.loi($$select public.fn_chi_tiet_chu_nha(t.kn('hoa', 'hung'))$$, '42501',
             'YC10.2-NT5 PQ2.SALE sale chưa kết nối đọc chi tiết Chị Hoa bị từ chối');
select t.ok(coalesce(t.so($$select * from public.v_nguoi_ket_noi where so_dien_thoai = '0900000001'$$), 0) = 0,
            'YC10.2-NT5 PQ2.SALE sale chưa kết nối không có số điện thoại Chị Hoa');
select t.ok(coalesce(t.so($$select * from public.profiles where id = t.id('hoa') and so_dien_thoai is not null$$), 0) = 0,
            'YC10.2-NT5 PQ2.SALE sale chưa kết nối không đọc số Chị Hoa qua bảng profiles');
select t.thoat();
select t.dang_nhap(t.id('hoa'));
select t.loi($$select public.fn_sale_bo_nguon(t.kn('hoa', 'hung'))$$, '42501',
             'YC10.2-NT5 PQ17.CHU chủ nhà không dùng được lệnh bỏ nguồn của sale');
select t.loi($$select public.fn_chi_tiet_chu_nha(t.kn('hoa', 'hung'))$$, '42501',
             'YC10.2 PQ17.CHU chủ nhà không đọc chi tiết chủ nhà của sale');
select t.thoat();
select t.khach();
select t.loi($$select public.fn_chi_tiet_chu_nha(t.kn('hoa', 'hung'))$$, '42501',
             'YC10.2 PQ17.LINK người chưa đăng nhập đọc chi tiết chủ nhà bị từ chối');
select t.loi($$select public.fn_sale_bo_nguon(t.kn('hoa', 'hung'))$$, '42501',
             'YC10.2 PQ17.LINK người chưa đăng nhập bỏ nguồn bị từ chối');
select t.thoat();
select t.bang((select trang_thai from public.ket_noi where id = t.kn('hoa', 'hung')), 'da_ket_noi',
              'YC10.2-NT5 kết nối của Hùng còn nguyên sau các lệnh bị từ chối');

-- ===== YC10.2-NT7: Chị Hoa ngừng cho Hùng xem, Hùng mở S6-04 =====
select t.dang_nhap(t.id('hoa'));
select t.khong_loi($$select public.fn_ngung_cho_xem(t.kn('hoa', 'hung'))$$, 'YC10.2-NT7 Chị Hoa ngừng cho Hùng xem lịch');
select t.thoat();
select t.dang_nhap(t.id('hung'));
select t.bang(t.gt($$select (x ->> 'trang_thai') || '|' || (x ->> 'ly_do') || '|' || (x ->> 'ten_chu')
                     from public.fn_chi_tiet_chu_nha(t.kn('hoa', 'hung'), '2026-10-07') x$$),
              'khong_con_quyen|chu_ngung|Chị Hoa',
              'YC10.2-NT7 HV5 S6-04 "Bạn không còn xem được mục này" kèm lý do chủ nhà đã ngừng cho xem');
select t.ok(t.gt($$select not (x ? 'can' or x ? 'so_dien_thoai' or x ? 'cap_nhat_luc' or x ? 'xem_coc' or x::text like '%0900000001%'
                               or x::text like '%900000%' or x::text like '%1509%')
                   from public.fn_chi_tiet_chu_nha(t.kn('hoa', 'hung'), '2026-10-07') x$$) = 'true',
            'YC10.2-NT7 YC10-H6 PQ2.SALE PQ3.SALE dữ liệu trả về không có căn, giá, số điện thoại');
select t.loi($$select public.fn_sale_bo_nguon(t.kn('hoa', 'hung'))$$, 'P0001',
             'YC10.2 kết nối chủ đã ngừng không bỏ nguồn được (dùng "Bỏ khỏi danh sách")');

-- ===== YC10.2-NT6: dòng Chị Hoa ở nguồn phòng ghi "đã ngừng cho bạn xem lịch" =====
select t.bang(t.gt($$select count(*) from public.fn_tab_can_sale() where chu_id = t.id('hoa')$$), '1',
              'YC10.2-NT6 YC10-H1 Chị Hoa còn đúng một dòng ở nguồn phòng của Hùng');
select t.bang(t.gt($$select nhom || '|' || ten_chu || '|' || chu_ngung || '|' || chu_da_xoa_tai_khoan || '|' || ket_noi_id
                     from public.fn_tab_can_sale() where chu_id = t.id('hoa')$$),
              'nguon|Chị Hoa|true|false|' || t.kn('hoa', 'hung'),
              'YC10.2-NT6 dòng Chị Hoa mang cờ "đã ngừng cho bạn xem lịch"');
select t.ok(t.gt($$select bool_and(can_id is null and ma_can is null and ten_toa is null and so_phong_ngu is null and so_giuong is null
                                   and loai_view is null and khach_den is null and cap_nhat_luc is null)
                   from public.fn_tab_can_sale() where chu_id = t.id('hoa')$$) = 'true',
            'YC10.2-NT6 PQ3.SALE dòng Chị Hoa không căn, không giá, không lần cập nhật');
select t.bang(t.gt($$select string_agg(nhom || ':' || chu_ngung, ',') from public.fn_tab_can_sale() where nhom <> 'nguon'$$),
              'tu_nhap:false', 'YC10.2-NT6 các dòng khác của tab Căn có cờ chu_ngung false');
select t.ok(coalesce(t.so($$select * from public.my_shared_can_ids() x where x in (t.can('1509'), t.can('3402'))$$), 0) = 0,
            'YC10.2-NT6 QD7 Hùng không còn thấy căn của Chị Hoa');
select t.thoat();
select t.dang_nhap(t.id('lan'));
select t.loi($$select public.fn_sale_bo_dong_chu(t.kn('hoa', 'hung'))$$, '42501',
             'YC10.2-NT6 PQ17.SALE Sale Lan không bỏ được dòng đã ngừng của Sale Hùng');
select t.bang(t.gt($$select string_agg(ma_can || ':' || chu_ngung, ',') from public.fn_tab_can_sale() where chu_id = t.id('hoa')$$),
              '1509:false', 'YC10.2-NT6 Lan vẫn kết nối Chị Hoa như cũ');
select t.thoat();
select t.dang_nhap(t.id('hung'));
select t.khong_loi($$select public.fn_sale_bo_dong_chu(t.kn('hoa', 'hung'))$$,
                   'YC10.2-NT6 Hùng bấm "Bỏ khỏi danh sách" ở dòng Chị Hoa đã ngừng, không hỏi lại');
select t.bang(t.gt($$select count(*) from public.fn_tab_can_sale() where chu_id = t.id('hoa')$$), '0',
              'YC10.2-NT6 dòng Chị Hoa biến khỏi nguồn phòng của Hùng ngay');
select t.loi($$select public.fn_chi_tiet_chu_nha(t.kn('hoa', 'hung'))$$, '42501',
             'YC10.2 kết nối đã bỏ thì không đọc chi tiết nữa');
select t.bang(t.gt($$select count(*) from public.v_booking_cua_sale where id = t.b('B1')$$), '1',
              'YC10.2-NT6 QD7 B1 vẫn ở danh sách đặt phòng của Hùng');
select t.thoat();
select t.bang((select trang_thai from public.ket_noi where id = t.kn('hoa', 'hung')), 'sale_bo',
              'YC10.2-NT6 YC10 Dữ liệu kết nối sang "sale bỏ"');

-- Chủ đã xóa tài khoản: S6-04 cũng không trả gì (lý do khác). Dựng lại kết nối đang hiệu lực cho phần sau.
update public.ket_noi set trang_thai = 'da_ket_noi', ngung_luc = null where id = t.kn('hoa', 'hung');
update public.profiles set so_dien_thoai = null, da_xoa_luc = now() where id = t.id('hoa');
select t.dang_nhap(t.id('hung'));
select t.bang(t.gt($$select (x ->> 'trang_thai') || '|' || (x ->> 'ly_do') || '|' || (x ? 'can')::text || '|' || (x ? 'so_dien_thoai')::text
                     from public.fn_chi_tiet_chu_nha(t.kn('hoa', 'hung')) x$$),
              'khong_con_quyen|chu_xoa_tai_khoan|false|false',
              'YC10.2 HV5 PQ23.SALE chủ đã xóa tài khoản: S6-04 không còn xem được, không căn, không số');
select t.thoat();
update public.profiles set da_xoa_luc = null, so_dien_thoai = '0900000001' where id = t.id('hoa');

-- ===== YC10.2-NT4, YC10.2-NT8: Hùng bấm xác nhận bỏ nguồn Chị Hoa =====
select t.bang((select count(*) from public.thong_bao where nguoi_nhan = t.id('hoa')), 0::bigint,
              'YC10.2-NT8 trước khi bỏ nguồn: Chị Hoa chưa có thông báo nào');
select t.dang_nhap(t.id('hung'));
select t.ok(t.gt($$select count(*) from public.fn_sale_lich('2026-10-07', '2026-10-13') where ten_chu = 'Chị Hoa'$$)::int > 0,
            'YC10.2-NT4 trước khi bỏ: lịch của Hùng có căn của Chị Hoa');
select t.bang(t.gt($$select string_agg(c ->> 'ma_can', ',' order by c ->> 'ma_can')
                     from jsonb_array_elements(public.fn_sale_tim(public.local_today() + 40, public.local_today() + 41) -> 'can') c
                     where c ->> 'ma_can' in ('1509', '3402')$$), '1509,3402',
              'YC10.2-NT4 trước khi bỏ: tìm phòng của Hùng có 1509, 3402');
select t.khong_loi($$select public.fn_sale_bo_nguon(t.kn('hoa', 'hung'))$$, 'YC10.2-NT4 Hùng bỏ nguồn Chị Hoa');
select t.bang(t.gt($$select count(*) from public.fn_tab_can_sale() where chu_id = t.id('hoa')$$), '0',
              'YC10.2-NT4 Chị Hoa biến khỏi nguồn phòng của Hùng');
select t.ok(coalesce(t.so($$select * from public.my_shared_can_ids() x where x in (t.can('1509'), t.can('3402'))$$), 0) = 0,
            'YC10.2-NT4 KT-DB.3.3 Hùng không còn được chia sẻ căn nào của Chị Hoa');
select t.ok(coalesce(t.so($$select * from public.fn_sale_lich('2026-10-07', '2026-10-13') where ten_chu = 'Chị Hoa'
                             or can_id in (t.can('1509'), t.can('3402'))$$), 0) = 0,
            'YC10.2-NT4 lịch của Hùng không còn căn của Chị Hoa');
select t.bang(t.gt($$select coalesce(string_agg(c ->> 'ma_can', ','), '')
                     from jsonb_array_elements(public.fn_sale_tim(public.local_today() + 40, public.local_today() + 41) -> 'can') c
                     where c ->> 'ma_can' in ('1509', '3402')$$), '',
              'YC10.2-NT4 tìm phòng của Hùng không còn căn của Chị Hoa');
select t.bang(t.gt($$select public.fn_sale_chi_tiet_can(t.can('1509'), '2026-10-07', '2026-10-13') ->> 'khong_con_quyen'$$),
              'true', 'YC10.2-NT4 PQ3.SALE HV5 chi tiết 1509 của Hùng chỉ còn "không còn xem được"');
select t.loi($$select public.fn_chi_tiet_chu_nha(t.kn('hoa', 'hung'))$$, '42501',
             'YC10.2-NT4 S6-04 của Chị Hoa không mở lại được sau khi bỏ nguồn');
select t.bang(t.gt($$select count(*) from public.v_booking_cua_sale where id = t.b('B1')$$), '1',
              'YC10.2-NT8 YC10-H8 B1 vẫn ở danh sách đặt phòng của Hùng');
select t.loi($$select public.fn_sale_bo_nguon(t.kn('hoa', 'hung'))$$, 'P0001',
             'YC10.2 bỏ nguồn lần hai bị từ chối: kết nối đã bỏ');
select t.thoat();
select t.bang((select trang_thai from public.ket_noi where id = t.kn('hoa', 'hung')), 'sale_bo',
              'YC10.2-NT4 YC10 Dữ liệu kết nối của Hùng với Chị Hoa sang "sale bỏ"');
select t.bang((select trang_thai from public.yeu_cau_dat_phong where id = t.b('Y1')), 'da_huy',
              'YC10.2-NT8 YC10-H8 yêu cầu chờ của Hùng tới 1509 sang "Đã hủy"');
select t.bang((select count(*) from public.thong_bao where nguoi_nhan = t.id('hoa')), 0::bigint,
              'YC10.2-NT8 YC10-H8 Chị Hoa không có thông báo mới');
select t.bang((select trang_thai from public.booking where id = t.b('B1')), 'hieu_luc',
              'YC10.2-NT8 B1 vẫn hiệu lực');
select t.bang((select trang_thai from public.yeu_cau_dat_phong where id = t.b('Y2')), 'cho',
              'YC10.2-NT8 yêu cầu chờ của Lan không đổi');
select t.bang((select trang_thai from public.ket_noi where id = t.kn('hoa', 'lan')), 'da_ket_noi',
              'YC10.2-NT4 kết nối của Lan với Chị Hoa không đổi');
