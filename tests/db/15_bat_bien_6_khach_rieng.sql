-- KT-DB.3.6 · Mỗi người chỉ thấy khách và tiền thu khách do mình nhập (QD11, PQ9, PQ11, PQ12, PQ19).
-- Chủ không thấy giá bán, mức cộng, tiền chênh của sale. Sale không thấy khách của chủ.
select t.fixture();

select t.tao_booking('B1', t.can('1509'), '2026-10-10', '2026-10-12', 2200000, t.id('hung'), 'tu_yeu_cau');
select t.tao_booking('B5', t.can('1509'), '2026-10-13', '2026-10-15', 1800000);
insert into public.booking_rieng (booking_id, nguoi_id, ten_khach, sdt_khach, tien_thu_khach)
values (t.b('B1'), t.id('hung'), 'Khách của Hùng', '0900000011', 2600000),
       (t.b('B1'), t.id('hoa'),  'Khách Hoa ghi',  '0900000012', null),
       (t.b('B5'), t.id('hoa'),  'Khách lẻ',       '0900000013', null);

-- Bảng booking không chứa khách hay giá bán (khách nằm ở booking_rieng, mỗi người một dòng).
select t.bang((select string_agg(column_name, ', ' order by column_name) from information_schema.columns
               where table_schema = 'public' and table_name = 'booking'
                 and (column_name ilike '%khach%' or column_name ilike '%gia_ban%' or column_name ilike '%muc_cong%'
                      or column_name ilike '%chenh%')),
              null::text, 'KT-DB.3.6 QD11 bảng booking không có cột khách, giá bán, mức cộng, tiền chênh');

select t.dang_nhap(t.id('hung'));
select t.bang(t.so('select * from public.booking_rieng'), 1::bigint, 'KT-DB.3.6 PQ9.SALE Hùng chỉ đọc khách mình nhập');
select t.ok(coalesce(t.so($$select * from public.booking_rieng where nguoi_id = t.id('hoa')$$), 0) = 0,
            'KT-DB.3.6 PQ9.SALE Hùng không đọc khách Chị Hoa ghi trên B1');
select t.thoat();
select t.dang_nhap(t.id('hoa'));
select t.bang(t.so('select * from public.booking_rieng'), 2::bigint, 'KT-DB.3.6 PQ9.CHU Chị Hoa chỉ đọc khách mình nhập');
select t.ok(coalesce(t.so($$select * from public.booking_rieng where nguoi_id = t.id('hung')$$), 0) = 0,
            'KT-DB.3.6 PQ9.CHU Chị Hoa không đọc khách và tiền thu khách của Hùng');
select t.thoat();
select t.dang_nhap(t.id('lan'));
select t.ok(coalesce(t.so('select * from public.booking_rieng'), 0) = 0, 'KT-DB.3.6 PQ9.SALE Lan không đọc khách của người khác');
select t.thoat();

-- Yêu cầu đặt phòng: chủ căn và sale gửi đọc; giá bán nằm ở yeu_cau_rieng, chỉ sale đó đọc.
select t.tao_yeu_cau('Y1', t.can('3402'), t.id('hung'), '2026-10-17', '2026-10-19', array[1100000, 800000]::bigint[]);
insert into public.yeu_cau_rieng (yeu_cau_id, sale_id, gia_ban_dem, ten_khach, sdt_khach)
values (t.b('Y1'), t.id('hung'), array[1300000, 1000000]::bigint[], 'Khách của Hùng', '0900000011');
select t.bang((select string_agg(column_name, ', ' order by column_name) from information_schema.columns
               where table_schema = 'public' and table_name = 'yeu_cau_dat_phong'
                 and (column_name ilike '%gia_ban%' or column_name ilike '%muc_cong%' or column_name ilike '%khach%'
                      or column_name ilike '%chenh%')),
              null::text, 'KT-DB.3.6 PQ11.CHU yeu_cau_dat_phong không có cột giá bán, mức cộng, khách');
select t.dang_nhap(t.id('hoa'));
select t.bang(t.so('select * from public.yeu_cau_dat_phong'), 1::bigint, 'KT-DB.3.6 PQ10.CHU Chị Hoa đọc yêu cầu gửi tới căn mình');
select t.ok(coalesce(t.so('select * from public.yeu_cau_rieng'), 0) = 0, 'KT-DB.3.6 PQ11.CHU Chị Hoa không đọc giá bán, khách trong yêu cầu của Hùng');
select t.ok(coalesce(t.so('select * from public.muc_cong'), 0) = 0, 'KT-DB.3.6 PQ11.CHU Chị Hoa không đọc mức cộng của Hùng');
select t.ok(coalesce(t.so($$select * from public.cai_dat_rieng where nguoi_id = t.id('hung')$$), 0) = 0,
            'KT-DB.3.6 PQ11.CHU Chị Hoa không đọc cài đặt riêng (mức cộng mặc định, mẫu tin) của Hùng');
select t.thoat();
select t.dang_nhap(t.id('hung'));
select t.bang(t.so('select * from public.yeu_cau_dat_phong'), 1::bigint, 'KT-DB.3.6 PQ10.SALE Hùng đọc yêu cầu mình gửi');
select t.bang(t.so('select * from public.yeu_cau_rieng'), 1::bigint, 'KT-DB.3.6 PQ11.SALE Hùng đọc giá bán của mình');
select t.bang(t.so('select * from public.muc_cong'), 1::bigint, 'KT-DB.3.6 PQ11.SALE Hùng đọc mức cộng của mình');
select t.bang(t.so('select * from public.cai_dat_rieng'), 1::bigint, 'KT-DB.3.6 PQ11.SALE Hùng đọc cài đặt riêng của mình');
select t.thoat();
select t.dang_nhap(t.id('lan'));
select t.ok(coalesce(t.so('select * from public.yeu_cau_dat_phong'), 0) = 0, 'KT-DB.3.6 PQ10.SALE Lan không đọc yêu cầu của Hùng');
select t.ok(coalesce(t.so('select * from public.yeu_cau_rieng'), 0) = 0, 'KT-DB.3.6 PQ11.SALE Lan không đọc giá bán của Hùng');
select t.ok(coalesce(t.so('select * from public.muc_cong'), 0) = 0, 'KT-DB.3.6 PQ11.SALE Lan không đọc mức cộng của Hùng');
select t.thoat();
select t.dang_nhap(t.id('tuan'));
select t.ok(coalesce(t.so('select * from public.yeu_cau_dat_phong'), 0) = 0, 'KT-DB.3.6 PQ10.CHU Anh Tuấn không đọc yêu cầu gửi căn Chị Hoa');
select t.thoat();

-- Lần gửi khách, tìm gần đây: chỉ sale đó đọc (PQ12).
insert into public.lan_gui_khach (sale_id, can_id, dem) values (t.id('hung'), t.can('1509'), daterange('2026-10-10', '2026-10-12', '[)'));
insert into public.tim_gan_day (sale_id, tu_ngay, den_ngay, bo_loc) values (t.id('hung'), '2026-10-10', '2026-10-12', '{}');
select t.dang_nhap(t.id('hung'));
select t.bang(t.so('select * from public.lan_gui_khach'), 1::bigint, 'KT-DB.3.6 PQ12.SALE Hùng đọc lần gửi khách của mình');
select t.bang(t.so('select * from public.tim_gan_day'), 1::bigint, 'KT-DB.3.6 PQ12.SALE Hùng đọc lần tìm của mình');
select t.thoat();
select t.dang_nhap(t.id('hoa'));
select t.ok(coalesce(t.so('select * from public.lan_gui_khach'), 0) = 0, 'KT-DB.3.6 PQ12.CHU Chị Hoa không đọc lần gửi khách của Hùng');
select t.ok(coalesce(t.so('select * from public.tim_gan_day'), 0) = 0, 'KT-DB.3.6 PQ12.CHU Chị Hoa không đọc lần tìm của Hùng');
select t.thoat();

-- Thông báo: chỉ người nhận (PQ19). Sale thêm tay: chỉ chủ đó (PQ17.CHU).
insert into public.thong_bao (nguoi_nhan, loai, noi_dung) values (t.id('hung'), 'thu', '{}');
insert into public.sale_them_tay (chu_id, ten, so_dien_thoai) values (t.id('hoa'), 'Sale ngoài app', '0900000021');
select t.dang_nhap(t.id('hung'));
select t.bang(t.so('select * from public.thong_bao'), 1::bigint, 'KT-DB.3.6 PQ19.SALE Hùng đọc thông báo của mình');
select t.ok(coalesce(t.so('select * from public.sale_them_tay'), 0) = 0, 'KT-DB.3.6 PQ17.SALE Hùng không đọc sale Chị Hoa thêm tay');
select t.thoat();
select t.dang_nhap(t.id('hoa'));
select t.ok(coalesce(t.so('select * from public.thong_bao'), 0) = 0, 'KT-DB.3.6 PQ19.CHU Chị Hoa không đọc thông báo của Hùng');
select t.bang(t.so('select * from public.sale_them_tay'), 1::bigint, 'KT-DB.3.6 PQ17.CHU Chị Hoa đọc sale mình thêm tay');
select t.thoat();

-- App không ghi thẳng bảng nào (ghi qua hàm fn_*): người dùng không tự sửa khách, giá bán của người khác.
select t.bang((select string_agg(c.relname, ', ' order by c.relname)
               from pg_class c join pg_namespace n on n.oid = c.relnamespace
               where n.nspname = 'public' and c.relkind in ('r', 'p', 'v', 'm', 'f')
                 and (has_table_privilege('authenticated', c.oid, 'insert') or has_table_privilege('authenticated', c.oid, 'update')
                      or has_table_privilege('authenticated', c.oid, 'delete') or has_table_privilege('authenticated', c.oid, 'truncate'))),
              null::text, 'KT-DB.3.6 authenticated không có insert, update, delete trên bảng, view nào');
select t.dang_nhap(t.id('hoa'));
select t.loi($$update public.booking_rieng set ten_khach = 'Sửa' where nguoi_id = t.id('hung')$$, '42501',
             'KT-DB.3.6 PQ9.CHU Chị Hoa sửa thẳng khách của Hùng bị từ chối');
select t.loi($$insert into public.muc_cong (sale_id, can_id, muc) values (t.id('hoa'), t.can('1509'), 1)$$, '42501',
             'KT-DB.3.6 app ghi thẳng muc_cong bị từ chối');
select t.thoat();
