-- KT-DB.3.5 · Sale không đọc bảng booking. Sale xem lịch qua v_lich_sale (chỉ căn và đêm kín), booking của mình
-- qua v_booking_cua_sale (không có tiền cọc, không có khách của chủ) (PQ4.SALE, PQ7.SALE, PQ8.SALE).
select t.fixture();

-- B1 (Hùng), B2 (Lan, chủ ghi chọn sale Lan), B5 (khách lẻ) theo DLM.4; một booking của Anh Tuấn.
select t.tao_booking('B1', t.can('1509'), '2026-10-10', '2026-10-12', 2200000, t.id('hung'), 'tu_yeu_cau');
update public.booking set trang_thai_tien = 'da_coc', tien_coc = 1000000 where id = t.b('B1');
select t.tao_booking('B2', t.can('3402'), '2026-10-17', '2026-10-19', 1900000, t.id('lan'));
select t.tao_booking('B5', t.can('1509'), '2026-10-13', '2026-10-15', 1800000);
select t.tao_booking('T1', t.can('1103'), '2026-10-18', '2026-10-20', 1400000);
select t.tao_booking('V2', t.can('villa'), '2026-10-08', '2026-10-09', 1400000);

-- Bảng booking: chỉ người giữ căn đọc.
select t.dang_nhap(t.id('hoa'));
select t.bang(t.so('select * from public.booking'), 3::bigint, 'KT-DB.3.5 PQ7.CHU Chị Hoa đọc 3 booking căn của mình');
select t.bang(t.so('select * from public.booking_dem'), 6::bigint, 'KT-DB.3.5 PQ7.CHU Chị Hoa đọc 6 đêm booking căn của mình');
select t.ok(coalesce(t.so($$select * from public.booking where can_id = t.can('1103')$$), 0) = 0,
            'KT-DB.3.5 PQ Luật chung 3 Chị Hoa không đọc booking căn của Anh Tuấn');
select t.thoat();

select t.dang_nhap(t.id('hung'));
select t.ok(coalesce(t.so($$select * from public.booking where can_id <> t.can('villa')$$), 0) = 0,
            'KT-DB.3.5 Hùng không đọc bảng booking căn của Chị Hoa, kể cả booking mình đứng tên');
select t.ok(coalesce(t.so($$select * from public.booking_dem d where d.booking_id <> t.b('V2')$$), 0) = 0,
            'KT-DB.3.5 Hùng không đọc booking_dem căn của Chị Hoa');
select t.bang(t.so($$select * from public.booking where can_id = t.can('villa')$$), 1::bigint,
              'KT-DB.3.5 PQ14.SALE Hùng đọc booking căn tự nhập của mình (là người giữ căn)');
select t.thoat();

select t.dang_nhap(t.id('lan'));
select t.ok(coalesce(t.so('select * from public.booking'), 0) = 0, 'KT-DB.3.5 Lan không đọc bảng booking, kể cả B2 mình đứng tên');
select t.thoat();
select t.dang_nhap(t.id('nga'));
select t.ok(coalesce(t.so('select * from public.booking'), 0) = 0, 'KT-DB.3.5 Nga không đọc bảng booking');
select t.thoat();

-- v_lich_sale: chỉ căn và đêm kín của căn được chia sẻ.
select t.bang((select string_agg(column_name, ', ' order by column_name) from information_schema.columns
               where table_schema = 'public' and table_name = 'v_lich_sale'),
              'can_id, dem', 'KT-DB.3.5 PQ4.SALE v_lich_sale chỉ có can_id, dem (không người đặt, không tiền)');
select t.dang_nhap(t.id('hung'));
select t.bang(t.so('select * from public.v_lich_sale'), 6::bigint, 'KT-DB.3.5 PQ4.SALE Hùng thấy 6 đêm kín của 1509, 3402, gồm booking sale khác và khách lẻ');
select t.bang(t.so($$select * from public.v_lich_sale where can_id = t.can('3402') and dem in ('2026-10-17', '2026-10-18')$$), 2::bigint,
              'KT-DB.3.5 PQ4.SALE Hùng thấy đêm 17/10, 18/10 của 3402 kín (booking của Lan)');
select t.ok(coalesce(t.so($$select * from public.v_lich_sale where can_id in (t.can('1103'), t.can('villa'))$$), 0) = 0,
            'KT-DB.3.5 PQ4.SALE v_lich_sale không có căn ngoài my_shared_can_ids');
select t.thoat();
select t.dang_nhap(t.id('lan'));
select t.bang(t.so('select * from public.v_lich_sale'), 4::bigint, 'KT-DB.3.5 PQ4.SALE Lan chỉ thấy 4 đêm kín của 1509');
select t.thoat();
select t.dang_nhap(t.id('nga'));
select t.ok(coalesce(t.so('select * from public.v_lich_sale'), 0) = 0, 'KT-DB.3.5 PQ4.SALE Nga chưa kết nối không thấy lịch nào');
select t.thoat();

-- Booking đã hủy không còn kín; yêu cầu đang chờ không kín.
update public.booking set trang_thai = 'da_huy' where id = t.b('B5');
select t.tao_yeu_cau('Y1', t.can('1509'), t.id('hung'), '2026-10-20', '2026-10-21');
select t.dang_nhap(t.id('lan'));
select t.bang(t.so('select * from public.v_lich_sale'), 2::bigint, 'KT-DB.3.5 PQ4.SALE booking đã hủy và yêu cầu đang chờ không làm đêm kín');
select t.thoat();

-- v_booking_cua_sale: booking có sale_id là người gọi; không tiền cọc, không khách của chủ.
select t.bang((select string_agg(column_name, ', ' order by column_name) from information_schema.columns
               where table_schema = 'public' and table_name = 'v_booking_cua_sale'
                 and column_name in ('tien_coc', 'trang_thai_tien', 'ten_khach', 'sdt_khach', 'tien_thu_khach')),
              null::text, 'KT-DB.3.5 PQ8.SALE v_booking_cua_sale không có tiền cọc, trạng thái tiền, khách');
select t.bang((select count(*) from information_schema.columns
               where table_schema = 'public' and table_name = 'v_booking_cua_sale'
                 and column_name in ('id', 'can_id', 'ma_can', 'chu_id', 'ten_chu', 'ngay_nhan', 'ngay_tra', 'nguon',
                                     'tien_phong', 'trang_thai', 'huy_xin_boi', 'huy_tra_loi')),
              12::bigint, 'KT-DB.3.5 PQ7.SALE v_booking_cua_sale có đủ cột của hợp đồng');
select t.dang_nhap(t.id('hung'));
select t.bang(t.so('select * from public.v_booking_cua_sale'), 1::bigint, 'KT-DB.3.5 PQ7.SALE Hùng thấy 1 booking mình đứng tên');
select t.bang(t.gt($$select tien_phong from public.v_booking_cua_sale where id = t.b('B1')$$), '2200000',
              'KT-DB.3.5 PQ8.SALE Hùng thấy tiền phòng B1 2.200.000đ');
select t.bang(t.gt($$select chu_id from public.v_booking_cua_sale where id = t.b('B1')$$), t.id('hoa')::text,
              'KT-DB.3.5 PQ1.SALE v_booking_cua_sale ghi chủ của B1 là Chị Hoa');
select t.bang(t.gt($$select ma_can from public.v_booking_cua_sale where id = t.b('B1')$$), '1509',
              'KT-DB.3.5 PQ3.SALE v_booking_cua_sale ghi mã căn 1509');
select t.thoat();
select t.dang_nhap(t.id('lan'));
select t.bang(t.so('select * from public.v_booking_cua_sale'), 1::bigint, 'KT-DB.3.5 PQ7.SALE Lan thấy B2 (chủ ghi chọn sale Lan)');
select t.thoat();
select t.dang_nhap(t.id('nga'));
select t.ok(coalesce(t.so('select * from public.v_booking_cua_sale'), 0) = 0, 'KT-DB.3.5 PQ7.SALE Nga không thấy booking của sale khác');
select t.thoat();
select t.dang_nhap(t.id('hoa'));
select t.ok(coalesce(t.so('select * from public.v_booking_cua_sale'), 0) = 0, 'KT-DB.3.5 v_booking_cua_sale của Chị Hoa (không đứng tên booking nào) trống');
select t.thoat();

-- Chủ ngừng cho xem: Hùng vẫn thấy booking cũ của mình (QD7), không còn lịch.
update public.ket_noi set trang_thai = 'chu_ngung' where id = t.kn('hoa', 'hung');
select t.dang_nhap(t.id('hung'));
select t.bang(t.so('select * from public.v_booking_cua_sale'), 1::bigint, 'KT-DB.3.5 PQ7.SALE bị ngừng vẫn thấy booking cũ của mình');
select t.ok(coalesce(t.so('select * from public.v_lich_sale'), 0) = 0, 'KT-DB.3.5 PQ4.SALE bị ngừng không thấy lịch');
select t.thoat();
