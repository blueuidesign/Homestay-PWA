-- KT-DB.3.11 · Thống kê của chủ nhà không chứa giá bán hay tiền chênh của sale; thống kê của sale không chứa tiền cọc.
-- Booking đã hủy không tính (PQ11, PQ15, PQ16, PQ8.SALE). Hàm thống kê thuộc US sau; ở EN2 kiểm ở mức đọc:
-- nguồn dữ liệu chủ đọc được không có giá bán, mức cộng; nguồn sale đọc được không có tiền cọc.
select t.fixture();

select t.tao_booking('B1', t.can('1509'), '2026-10-10', '2026-10-12', 2200000, t.id('hung'), 'tu_yeu_cau');
update public.booking set trang_thai_tien = 'da_coc', tien_coc = 1000000 where id = t.b('B1');
insert into public.booking_rieng (booking_id, nguoi_id, ten_khach, sdt_khach, tien_thu_khach)
values (t.b('B1'), t.id('hung'), 'Khách của Hùng', '0900000011', 2600000);
select t.tao_yeu_cau('Y1', t.can('3402'), t.id('hung'), '2026-10-17', '2026-10-19', array[1100000, 800000]::bigint[]);
insert into public.yeu_cau_rieng (yeu_cau_id, sale_id, gia_ban_dem) values (t.b('Y1'), t.id('hung'), array[1300000, 1000000]::bigint[]);

-- Chủ: không đọc được nguồn nào có giá bán, mức cộng, tiền thu khách của sale.
select t.dang_nhap(t.id('hoa'));
select t.ok(coalesce(t.so('select * from public.booking_rieng where tien_thu_khach is not null'), 0) = 0,
            'KT-DB.3.11 PQ15.CHU chủ không đọc tiền thu khách (giá bán) của sale trên booking');
select t.ok(coalesce(t.so('select * from public.yeu_cau_rieng'), 0) = 0, 'KT-DB.3.11 PQ11.CHU chủ không đọc giá bán trong yêu cầu');
select t.ok(coalesce(t.so('select * from public.muc_cong'), 0) = 0, 'KT-DB.3.11 PQ11.CHU chủ không đọc mức cộng');
select t.ok(coalesce(t.so('select * from public.cai_dat_rieng where muc_cong_mac_dinh is not null'), 0) = 0,
            'KT-DB.3.11 PQ11.CHU chủ không đọc mức cộng mặc định của sale');
select t.bang(t.gt($$select tien_phong from public.booking where id = t.b('B1')$$), '2200000',
              'KT-DB.3.11 PQ16.CHU chủ đọc tiền phòng (giá chủ nhà) của B1');
select t.thoat();

select t.bang((select string_agg(column_name, ', ' order by column_name) from information_schema.columns
               where table_schema = 'public' and table_name = 'yeu_cau_dat_phong'
                 and (column_name ilike '%gia_ban%' or column_name ilike '%muc_cong%' or column_name ilike '%chenh%')),
              null::text, 'KT-DB.3.11 PQ11.CHU yeu_cau_dat_phong không có cột giá bán');

-- Sale: nguồn đọc được không có tiền cọc.
select t.bang((select string_agg(column_name, ', ' order by column_name) from information_schema.columns
               where table_schema = 'public' and table_name = 'v_booking_cua_sale' and column_name ilike '%coc%'),
              null::text, 'KT-DB.3.11 PQ8.SALE v_booking_cua_sale không có tiền cọc, trạng thái cọc');
select t.dang_nhap(t.id('hung'));
select t.ok(coalesce(t.so('select * from public.booking where tien_coc is not null'), 0) = 0,
            'KT-DB.3.11 PQ8.SALE Hùng không đọc được tiền cọc của B1');
select t.bang(t.so('select * from public.yeu_cau_rieng'), 1::bigint, 'KT-DB.3.11 PQ15.SALE Hùng đọc giá bán của mình');
select t.bang(t.so('select * from public.booking_rieng where tien_thu_khach = 2600000'), 1::bigint, 'KT-DB.3.11 PQ15.SALE Hùng đọc tiền thu khách của mình');
select t.thoat();

-- Booking đã hủy không tính: v_booking_cua_sale vẫn ghi trạng thái để thống kê lọc ra.
update public.booking set huy_xin_boi = t.id('hoa'), huy_xin_luc = now() where id = t.b('B1');
update public.booking set huy_tra_loi = 'dong_y', huy_tra_loi_boi = t.id('hung'), huy_tra_loi_luc = now(), trang_thai = 'da_huy' where id = t.b('B1');
select t.dang_nhap(t.id('hung'));
select t.bang(t.so($$select * from public.v_booking_cua_sale where id = t.b('B1') and trang_thai = 'da_huy'$$), 1::bigint,
              'KT-DB.3.11 PQ15.SALE booking đã hủy có trạng thái da_huy để thống kê không tính');
select t.thoat();
