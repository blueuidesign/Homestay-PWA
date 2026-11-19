-- US36 · Danh sách sale của chủ nhà (YC6.2). Viết trước migration (US36-TA1, CL14.5): task sau không sửa file này.
-- Hợp đồng database cho màn CN7, CN7-00, CN7-04, CN7-05:
--   fn_ds_sale_cua_toi()               đọc: mỗi dòng một sale của người gọi (kết nối hay thêm tay), nhóm, tổng tiền phòng.
--   fn_dat_phong_cua_sale(sale_id)     đọc: đặt phòng của sale đó ở căn của người gọi (CN7-04).
--   fn_them_sale_tay(ten, so)          ghi: thêm sale tay, trả id (CN7-05, Luật kiểm).
--   fn_xoa_sale_tay(id)                ghi: xóa sale thêm tay của mình (YC6.2-NT8).
--   fn_ngung_cho_xem(ket_noi_id)       ghi: chủ ngừng, thông báo cho sale một lần (YC6.2 bước 6).
--   fn_dat_xem_coc(ket_noi_id, bat)    ghi: bật tắt "Tình trạng cọc" (QD7).
--   fn_bo_dong_sale(ket_noi_id)        ghi: bỏ dòng sale đã xóa tài khoản (YC6.2 bước 7, YC6-H1).
--   fn_sale_da_coc(booking_id)         đọc của sale: đã cọc hay chưa (true/false), null khi chủ tắt quyền (PQ8.SALE).
-- Vi phạm quyền: 42501. Dữ liệu sai: P0001 kèm câu ở bảng Luật kiểm. YC6 "Ai được làm gì" có test vi phạm ở từng phần.
select t.fixture();

-- Chạy câu lệnh, mong bị từ chối với đúng mã lỗi và đúng câu (QT5.5).
create or replace function pg_temp.loi_cau(cau text, ma_mong text, cau_mong text, ten text) returns void
language plpgsql as $$
declare ma text; cau_loi text;
begin
  begin
    execute cau;
  exception when others then
    get stacked diagnostics ma = returned_sqlstate, cau_loi = message_text;
    if ma = ma_mong and cau_loi = cau_mong then
      raise notice 'ok - %', ten;
    else
      raise notice 'not ok - % (ra: % "%", mong: % "%")', ten, ma, cau_loi, ma_mong, cau_mong;
    end if;
    return;
  end;
  raise notice 'not ok - % (không bị từ chối)', ten;
end $$;

-- Bộ đầy đủ DLM.2: Chị Hoa kết nối 4 sale Hùng, Lan, Nga, Minh. Thêm Sale Minh và kết nối Nga, Minh.
insert into auth.users (id) values ('00000000-0000-0000-0000-000000000006') on conflict (id) do nothing;
insert into public.profiles (id, ten, ten_hien_thi, so_dien_thoai, vai_chon)
values ('00000000-0000-0000-0000-000000000006', 'Sale Minh', 'Sale Minh', '0900000006', 'sale')
on conflict (id) do update set ten = excluded.ten, ten_hien_thi = excluded.ten_hien_thi, so_dien_thoai = excluded.so_dien_thoai;
insert into public.ket_noi (chu_id, sale_id, trang_thai, nguon, pham_vi, xem_coc)
values (t.id('hoa'), t.id('nga'), 'da_ket_noi', 'link_moi', 'tat_ca', true),
       (t.id('hoa'), '00000000-0000-0000-0000-000000000006', 'da_ket_noi', 'link_moi', 'tat_ca', true);

-- Đặt phòng theo DLM.4: B1, B3 của Hùng; B2 của Lan (3402 nằm ngoài phạm vi của Lan ở bộ rút gọn, vẫn là đặt phòng của Lan);
-- B7 của Minh. HUY: một đặt phòng của Hùng đã hủy (hai bên đồng ý, QD12), không tính vào tổng tiền.
select t.tao_booking('B1', t.can('1509'), '2026-10-10', '2026-10-12', 2200000, t.id('hung'), 'tu_yeu_cau');
select t.tao_booking('B3', t.can('1509'), '2026-10-04', '2026-10-06', 1800000, t.id('hung'), 'tu_yeu_cau');
select t.tao_booking('B2', t.can('3402'), '2026-10-17', '2026-10-19', 1900000, t.id('lan'), 'tu_yeu_cau');
select t.tao_booking('B7', t.can('1509'), '2026-10-19', '2026-10-20', 900000, '00000000-0000-0000-0000-000000000006', 'tu_yeu_cau');
select t.tao_booking('HUY', t.can('3402'), '2026-10-25', '2026-10-26', 1300000, t.id('hung'), 'tu_yeu_cau');
update public.booking set trang_thai_tien = 'da_coc', tien_coc = 1000000 where id = t.b('B1');
update public.booking set trang_thai_tien = 'da_thanh_toan' where id = t.b('B3');
update public.booking set trang_thai_tien = 'chua_coc' where id = t.b('B2');
update public.booking set trang_thai_tien = 'da_thanh_toan' where id = t.b('B7');
update public.booking set huy_xin_boi = t.id('hoa'), huy_xin_luc = now() where id = t.b('HUY');
update public.booking set huy_tra_loi = 'dong_y', huy_tra_loi_boi = t.id('hung'), huy_tra_loi_luc = now(), trang_thai = 'da_huy'
  where id = t.b('HUY');

-- Anh Tuấn có một sale thêm tay riêng (để thử chủ khác).
insert into public.sale_them_tay (chu_id, ten, so_dien_thoai) values (t.id('tuan'), 'Sale Của Tuấn', '0900000088');

-- ===== Danh mục =====
select t.ok((select count(distinct proname) from pg_proc
             where proname in ('fn_ds_sale_cua_toi', 'fn_dat_phong_cua_sale', 'fn_them_sale_tay', 'fn_xoa_sale_tay',
                               'fn_ngung_cho_xem', 'fn_dat_xem_coc', 'fn_bo_dong_sale', 'fn_sale_da_coc')
               and pronamespace = 'public'::regnamespace and prosecdef) = 8,
            'YC6.2 danh mục: tám hàm của danh sách sale có và chạy security definer');
select t.ok(not exists (select 1 from pg_proc p
                        where p.proname in ('fn_ds_sale_cua_toi', 'fn_dat_phong_cua_sale', 'fn_them_sale_tay', 'fn_xoa_sale_tay',
                                            'fn_ngung_cho_xem', 'fn_dat_xem_coc', 'fn_bo_dong_sale', 'fn_sale_da_coc')
                          and p.pronamespace = 'public'::regnamespace and has_function_privilege('anon', p.oid, 'execute')),
            'YC6.2 danh mục PQ17.LINK: người chưa đăng nhập không có quyền gọi các hàm danh sách sale');
select t.ok(not has_table_privilege('authenticated', 'public.ket_noi', 'UPDATE')
            and not has_table_privilege('authenticated', 'public.ket_noi', 'DELETE')
            and not has_table_privilege('authenticated', 'public.sale_them_tay', 'INSERT')
            and not has_table_privilege('authenticated', 'public.sale_them_tay', 'DELETE')
            and not has_table_privilege('authenticated', 'public.thong_bao', 'INSERT'),
            'YC6.2 PQ17 app không ghi thẳng ket_noi, sale_them_tay, thong_bao; chỉ qua hàm');
select t.ok(not exists (select 1 from information_schema.routines r
                        join information_schema.parameters p on p.specific_name = r.specific_name
                        where r.routine_schema = 'public' and r.routine_name in ('fn_ds_sale_cua_toi', 'fn_dat_phong_cua_sale')
                          and p.parameter_mode = 'OUT'
                          and (p.parameter_name ilike '%gia_ban%' or p.parameter_name ilike '%muc_cong%'
                               or p.parameter_name ilike '%chenh%' or p.parameter_name ilike '%thu_khach%')),
            'YC6.2 PQ11.CHU KT-DB.3.6 danh sách sale, đặt phòng của sale không có giá bán, mức cộng, tiền chênh, tiền thu khách');
select t.ok(not exists (select 1 from information_schema.routines r
                        join information_schema.parameters p on p.specific_name = r.specific_name
                        where r.routine_schema = 'public' and r.routine_name = 'fn_sale_da_coc'
                          and (p.parameter_mode = 'OUT' or p.parameter_mode is null)
                          and p.parameter_name ilike '%tien%')
            and (select prorettype = 'boolean'::regtype from pg_proc
                 where proname = 'fn_sale_da_coc' and pronamespace = 'public'::regnamespace limit 1),
            'YC6.2 PQ8.SALE QD7 fn_sale_da_coc chỉ trả đã cọc hay chưa (boolean), không có số tiền cọc');

-- ===== YC6.2-NT1: Chị Hoa mở tab Sale =====
select t.dang_nhap(t.id('hoa'));
select t.bang(t.gt($$select string_agg(ten, ',' order by ten) from public.fn_ds_sale_cua_toi() where nhom = 'da_ket_noi'$$),
              'Sale Hùng,Sale Lan,Sale Minh,Sale Nga',
              'YC6.2-NT1 Chị Hoa thấy Sale Hùng, Lan, Nga, Minh ở nhóm "Đã kết nối · 4"');
select t.bang(t.so($$select * from public.fn_ds_sale_cua_toi() where nhom = 'da_ket_noi'$$), 4::bigint,
              'YC6.2-NT1 nhóm "Đã kết nối" có đúng 4 dòng');
select t.bang(t.so($$select * from public.fn_ds_sale_cua_toi() where nhom <> 'da_ket_noi'$$), 0::bigint,
              'YC6.2-NT1 chưa có sale chưa kết nối, đã ngừng');
select t.bang(t.gt($$select loai || '|' || sale_id || '|' || coalesce(so_dien_thoai, '-') || '|' || da_xoa_tai_khoan || '|'
                     || so_dat_phong || '|' || tong_tien_phong || '|' || xem_coc
                     from public.fn_ds_sale_cua_toi() where ten = 'Sale Hùng'$$),
              'ket_noi|' || t.id('hung') || '|0900000003|false|2|4000000|true',
              'YC6.2-NT1 bước 1 dòng Sale Hùng: kết nối, số đã cho, 2 đặt phòng, tổng tiền phòng 4.000.000đ (không tính đặt phòng đã hủy)');
select t.bang(t.gt($$select so_dat_phong || '|' || tong_tien_phong from public.fn_ds_sale_cua_toi() where ten = 'Sale Lan'$$),
              '1|1900000', 'YC6.2-NT1 bước 1 dòng Sale Lan: 1 đặt phòng, 1.900.000đ');
select t.bang(t.gt($$select so_dat_phong || '|' || tong_tien_phong from public.fn_ds_sale_cua_toi() where ten = 'Sale Minh'$$),
              '1|900000', 'YC6.2-NT1 bước 1 dòng Sale Minh: 1 đặt phòng, 900.000đ');
select t.bang(t.gt($$select so_dat_phong || '|' || tong_tien_phong from public.fn_ds_sale_cua_toi() where ten = 'Sale Nga'$$),
              '0|0', 'YC6.2-NT1 bước 1 dòng Sale Nga: chưa có đặt phòng, 0đ');
select t.ok(t.gt($$select bool_and(ket_noi_luc is not null) from public.fn_ds_sale_cua_toi() where nhom = 'da_ket_noi'$$) = 'true',
            'YC6.2 bước 5 mỗi sale đã kết nối có ngày kết nối');
select t.thoat();

-- PQ17.SALE, PQ17.CHU: sale và chủ khác không thấy danh sách sale của Chị Hoa.
select t.dang_nhap(t.id('hung'));
select t.bang(t.so($$select * from public.fn_ds_sale_cua_toi()$$), 0::bigint,
              'YC6.2 PQ17.SALE Sale Hùng gọi danh sách sale thì không thấy các sale khác của Chị Hoa');
select t.ok(coalesce(t.so($$select * from public.fn_dat_phong_cua_sale(t.id('lan'))$$), 0) = 0,
            'YC6.2 PQ17.SALE Sale Hùng không đọc được đặt phòng của Sale Lan');
select t.thoat();
select t.dang_nhap(t.id('tuan'));
select t.bang(t.gt($$select string_agg(ten, ',') from public.fn_ds_sale_cua_toi()$$), 'Sale Của Tuấn',
              'YC6.2 PQ17.CHU Anh Tuấn chỉ thấy sale của mình, không thấy sale của Chị Hoa');
select t.ok(coalesce(t.so($$select * from public.fn_dat_phong_cua_sale(t.id('hung'))$$), 0) = 0,
            'YC6.2 PQ17.CHU Anh Tuấn không đọc được đặt phòng của Sale Hùng với Chị Hoa');
select t.ok(coalesce(t.so($$select * from public.sale_them_tay where chu_id = t.id('hoa')$$), 0) = 0,
            'YC6 Dữ liệu sale thêm tay chỉ chủ nhà đó đọc');
select t.thoat();
select t.khach();
select t.loi($$select * from public.fn_ds_sale_cua_toi()$$, '42501', 'YC6.2 PQ17.LINK người chưa đăng nhập đọc danh sách sale bị từ chối');
select t.thoat();

-- ===== YC6.2 bước 5: Chị Hoa chạm Sale Hùng (CN7-04) =====
select t.dang_nhap(t.id('hoa'));
select t.bang(t.gt($$select string_agg(ma_can || ':' || ngay_nhan || '→' || ngay_tra || ':' || tien_phong || ':' || trang_thai,
                                       ',' order by ngay_nhan)
                     from public.fn_dat_phong_cua_sale(t.id('hung'))$$),
              '1509:2026-10-04→2026-10-06:1800000:hieu_luc,1509:2026-10-10→2026-10-12:2200000:hieu_luc,3402:2026-10-25→2026-10-26:1300000:da_huy',
              'YC6.2 bước 5 CN7-04 đặt phòng của Sale Hùng với Chị Hoa: B3, B1 (trạng thái, tiền phòng), đặt phòng đã hủy ghi đã hủy');
select t.bang(t.gt($$select trang_thai_tien from public.fn_dat_phong_cua_sale(t.id('hung')) where ngay_nhan = '2026-10-10'$$),
              'da_coc', 'YC6.2 bước 5 PQ8.CHU Chị Hoa thấy trạng thái tiền B1 "đã cọc"');
select t.thoat();

-- ===== YC6.2-NT3: Chị Hoa thêm "Sale Phương" 0901234567 ở CN7-05 =====
select t.dang_nhap(t.id('hoa'));
select t.ok(t.gt($$select public.fn_them_sale_tay('Sale Phương', '0901234567')$$) is not null,
            'YC6.2-NT3 Chị Hoa thêm sale "Sale Phương" số 0901234567 thì hàm trả id');
select t.bang(t.gt($$select loai || '|' || nhom || '|' || so_dien_thoai || '|' || coalesce(sale_id::text, '-')
                     from public.fn_ds_sale_cua_toi() where ten = 'Sale Phương'$$),
              'them_tay|chua_ket_noi|0901234567|-', 'YC6.2-NT3 dòng "Sale Phương" ở nhóm "Chưa kết nối", có số chủ nhà đã nhập');
select t.bang(t.so($$select * from public.fn_ds_sale_cua_toi() where nhom = 'da_ket_noi'$$), 4::bigint,
              'YC6.2-NT3 thêm sale tay không đổi nhóm "Đã kết nối"');
select pg_temp.loi_cau($$select public.fn_them_sale_tay('Sale Phương', '090 123')$$, 'P0001',
                       'Số điện thoại chưa đúng (10 chữ số, bắt đầu bằng 0)',
                       'YC6.2-NT3 số "090 123" bị từ chối "Số điện thoại chưa đúng (10 chữ số, bắt đầu bằng 0)"');
select pg_temp.loi_cau($$select public.fn_them_sale_tay('Sale Phương', '1901234567')$$, 'P0001',
                       'Số điện thoại chưa đúng (10 chữ số, bắt đầu bằng 0)', 'YC6.2 Luật kiểm số không bắt đầu bằng 0 bị từ chối');
select pg_temp.loi_cau($$select public.fn_them_sale_tay('Sale Phương', null)$$, 'P0001',
                       'Số điện thoại chưa đúng (10 chữ số, bắt đầu bằng 0)', 'YC6.2 Luật kiểm số trống bị từ chối');
select pg_temp.loi_cau($$select public.fn_them_sale_tay('   ', '0901234567')$$, 'P0001', 'Cần nhập tên sale',
                       'YC6.2 Luật kiểm tên chỉ có khoảng trắng bị từ chối "Cần nhập tên sale"');
select pg_temp.loi_cau($$select public.fn_them_sale_tay(repeat('a', 101), '0901234567')$$, 'P0001', 'Tên dài tối đa 100 ký tự',
                       'YC6.2 Luật kiểm tên 101 ký tự bị từ chối "Tên dài tối đa 100 ký tự"');
select t.ok(t.gt($$select public.fn_them_sale_tay('  ' || repeat('a', 100) || '  ', ' 090.123-45 67 ')$$) is not null,
            'YC6.2 Luật kiểm tên 100 ký tự sau khi bỏ khoảng trắng, số có khoảng trắng, chấm, gạch thì nhận');
select t.bang(t.gt($$select so_dien_thoai from public.fn_ds_sale_cua_toi() where ten = repeat('a', 100)$$), '0901234567',
              'YC6.2 Luật kiểm số lưu sau khi bỏ khoảng trắng, dấu chấm, gạch; tên bỏ khoảng trắng đầu cuối');
-- YC6-H11: không chặn số trùng, không tự ghép với tài khoản có cùng số.
select t.ok(t.gt($$select public.fn_them_sale_tay('Nga Thêm Tay', '0900000005')$$) is not null,
            'YC6.2 bước 4 YC6-H11 thêm sale trùng số với tài khoản Sale Nga thì vẫn nhận');
select t.bang(t.gt($$select loai || '|' || nhom || '|' || coalesce(sale_id::text, '-') from public.fn_ds_sale_cua_toi() where ten = 'Nga Thêm Tay'$$),
              'them_tay|chua_ket_noi|-', 'YC6.2 bước 4 YC6-H11 sale thêm tay trùng số không tự ghép với tài khoản');
select t.thoat();
select t.bang((select count(*) from public.ket_noi where chu_id = t.id('hoa')), 4::bigint,
              'YC6.2 bước 4 YC6-H11 thêm sale tay không tạo kết nối mới');
select t.bang((select count(*) from public.sale_them_tay where chu_id = t.id('hoa') and so_dien_thoai = '0900000005'), 1::bigint,
              'YC6.2 bước 4 sale thêm tay lưu tên, số do chủ nhà gõ');
-- Id của dòng "Sale Phương", lấy bằng vai chủ database (vai khác không đọc được dòng này qua RLS).
select set_config('t.ma_phuong', (select id from public.sale_them_tay where ten = 'Sale Phương')::text, true);
select t.dang_nhap(t.id('tuan'));
select t.bang(t.so($$select * from public.fn_ds_sale_cua_toi() where ten in ('Sale Phương', 'Nga Thêm Tay') or sale_id is not null$$), 0::bigint,
              'YC6.2 PQ17.CHU Anh Tuấn chỉ thấy sale của mình, không thấy sale thêm tay, kết nối của Chị Hoa');
select t.thoat();
select t.khach();
select t.loi($$select public.fn_them_sale_tay('Sale Phương', '0901234567')$$, '42501',
             'YC6.2 PQ17.LINK người chưa đăng nhập thêm sale bị từ chối');
select t.thoat();

-- ===== YC6.2-NT8: Chị Hoa mở dòng "Sale Phương" và xác nhận "Xóa sale này" =====
-- Anh Tuấn gửi lệnh xóa trước: database từ chối, dòng còn.
select t.dang_nhap(t.id('tuan'));
select t.loi($$select public.fn_xoa_sale_tay(t.b('phuong'))$$, '42501',
             'YC6.2-NT8 Anh Tuấn gửi lệnh xóa dòng "Sale Phương" của Chị Hoa thì database từ chối');
select t.thoat();
select t.bang((select count(*) from public.sale_them_tay where ten = 'Sale Phương'), 1::bigint,
              'YC6.2-NT8 sau lệnh của Anh Tuấn dòng "Sale Phương" vẫn còn');
select t.dang_nhap(t.id('hung'));
select t.loi($$select public.fn_xoa_sale_tay(t.b('phuong'))$$, '42501',
             'YC6.2-NT8 PQ17.SALE Sale Hùng gửi lệnh xóa sale thêm tay của Chị Hoa thì database từ chối');
select t.thoat();
select t.dang_nhap(t.id('hoa'));
select t.khong_loi($$select public.fn_xoa_sale_tay(t.b('phuong'))$$,
                   'YC6.2-NT8 Chị Hoa xác nhận "Xóa sale này" thì lệnh qua');
select t.bang(t.so($$select * from public.fn_ds_sale_cua_toi() where ten = 'Sale Phương'$$), 0::bigint,
              'YC6.2-NT8 dòng "Sale Phương" biến mất khỏi danh sách');
select t.loi($$select public.fn_xoa_sale_tay(gen_random_uuid())$$, '42501',
             'YC6.2 HV5 xóa sale thêm tay không còn thì cùng lỗi quyền');
select t.loi(format('select public.fn_xoa_sale_tay(%L)', t.kn('hoa', 'hung')), '42501',
             'YC6.2 YC6-H16 lệnh xóa sale thêm tay không xóa được kết nối');
select t.thoat();
select t.bang((select count(*) from public.sale_them_tay where ten = 'Sale Phương'), 0::bigint, 'YC6.2-NT8 database: dòng đã xóa');
select t.bang((select count(*) from public.ket_noi where id = t.kn('hoa', 'hung')), 1::bigint, 'YC6.2 kết nối Hoa–Hùng vẫn còn');

-- ===== YC6.2-NT5: Chị Hoa tắt "Tình trạng cọc" của Sale Hùng =====
select t.dang_nhap(t.id('hung'));
select t.bang(t.gt($$select public.fn_sale_da_coc(t.b('B1'))$$), 'true', 'YC6.2-NT5 trước khi tắt: Hùng đọc B1 đã cọc');
select t.bang(t.gt($$select public.fn_sale_da_coc(t.b('B3'))$$), 'true', 'YC6.2-NT5 PQ8.SALE B3 đã thanh toán thì Hùng đọc là đã cọc');
select t.ok(t.gt($$select public.fn_sale_da_coc(t.b('B2'))$$) is null, 'YC6.2 PQ8.SALE Hùng không đọc tình trạng cọc đặt phòng của Sale Lan');
select t.thoat();
select t.dang_nhap(t.id('lan'));
select t.bang(t.gt($$select public.fn_sale_da_coc(t.b('B2'))$$), 'false', 'YC6.2 PQ8.SALE Lan đọc B2 chưa cọc');
select t.thoat();
select t.dang_nhap(t.id('hoa'));
select t.bang(t.gt(format('select public.fn_dat_xem_coc(%L, false)', t.kn('hoa', 'hung'))), 'false',
              'YC6.2-NT5 Chị Hoa tắt "Tình trạng cọc" của Sale Hùng thì hàm trả false');
select t.bang(t.gt($$select xem_coc from public.fn_ds_sale_cua_toi() where ten = 'Sale Hùng'$$), 'false',
              'YC6.2-NT5 dòng Sale Hùng ghi đã tắt "Tình trạng cọc"');
select t.thoat();
select t.bang((select xem_coc from public.ket_noi where id = t.kn('hoa', 'hung')), false, 'YC6.2-NT5 database: xem_coc của Hoa–Hùng là false');
select t.dang_nhap(t.id('hung'));
select t.ok(t.gt($$select public.fn_sale_da_coc(t.b('B1'))$$) is null,
            'YC6.2-NT5 sau khi tắt: Hùng đọc B1 không còn biết đã cọc hay chưa');
select t.bang(t.so($$select * from public.v_lich_sale where can_id = t.can('1509') and dem = '2026-10-10'$$), 1::bigint,
              'YC6.2-NT5 QD7 sau khi tắt: Hùng vẫn thấy đêm 10/10 của 1509 đã đặt');
select t.bang(t.gt($$select gia_cuoi_tuan from public.gia_thang where can_id = t.can('1509') and thang = '2026-10-01'$$), '1300000',
              'YC6.2-NT5 QD7 sau khi tắt: Hùng vẫn thấy giá từng đêm của Chị Hoa');
select t.bang(t.gt($$select tien_phong from public.v_booking_cua_sale where id = t.b('B1')$$), '2200000',
              'YC6.2-NT5 PQ8.SALE sau khi tắt: Hùng vẫn thấy tiền phòng B1 của mình');
select t.thoat();
-- Sale tự đổi quyền của mình: từ chối (PQ17.SALE).
select t.dang_nhap(t.id('hung'));
select t.loi(format('select public.fn_dat_xem_coc(%L, true)', t.kn('hoa', 'hung')), '42501',
             'YC6.2 PQ17.SALE Sale Hùng tự bật lại "Tình trạng cọc" của mình thì database từ chối');
select t.thoat();
select t.bang((select xem_coc from public.ket_noi where id = t.kn('hoa', 'hung')), false, 'YC6.2 PQ17.SALE lệnh của Hùng không đổi quyền');
select t.dang_nhap(t.id('hoa'));
select t.bang(t.gt(format('select public.fn_dat_xem_coc(%L, true)', t.kn('hoa', 'hung'))), 'true',
              'YC6.2-NT5 Chị Hoa bật lại "Tình trạng cọc" thì hàm trả true');
select t.thoat();
select t.dang_nhap(t.id('hung'));
select t.bang(t.gt($$select public.fn_sale_da_coc(t.b('B1'))$$), 'true', 'YC6.2-NT5 bật lại thì Hùng đọc B1 đã cọc');
select t.thoat();

-- ===== YC6.2-NT6: Anh Tuấn gửi lệnh ngừng hay đổi quyền kết nối Hoa–Hùng =====
select t.dang_nhap(t.id('tuan'));
select t.loi(format('select public.fn_ngung_cho_xem(%L)', t.kn('hoa', 'hung')), '42501',
             'YC6.2-NT6 Anh Tuấn gửi lệnh ngừng kết nối Hoa–Hùng thì database từ chối');
select t.loi(format('select public.fn_dat_xem_coc(%L, false)', t.kn('hoa', 'hung')), '42501',
             'YC6.2-NT6 Anh Tuấn gửi lệnh tắt "Tình trạng cọc" của kết nối Hoa–Hùng thì database từ chối');
select t.loi(format('select public.fn_bo_dong_sale(%L)', t.kn('hoa', 'hung')), '42501',
             'YC6.2-NT6 Anh Tuấn gửi lệnh bỏ dòng kết nối Hoa–Hùng thì database từ chối');
select t.loi(format('update public.ket_noi set trang_thai = %L where id = %L', 'chu_ngung', t.kn('hoa', 'hung')), '42501',
             'YC6.2-NT6 Anh Tuấn sửa thẳng bảng ket_noi thì bị từ chối');
select t.thoat();
select t.dang_nhap(t.id('hung'));
select t.loi(format('select public.fn_ngung_cho_xem(%L)', t.kn('hoa', 'hung')), '42501',
             'YC6.2-NT6 PQ17.SALE Sale Hùng gửi lệnh ngừng kết nối của mình (lệnh của chủ) thì database từ chối');
select t.thoat();
select t.khach();
select t.loi(format('select public.fn_ngung_cho_xem(%L)', t.kn('hoa', 'hung')), '42501',
             'YC6.2-NT6 PQ17.LINK người chưa đăng nhập gửi lệnh ngừng thì bị từ chối');
select t.thoat();
select t.bang((select trang_thai || '|' || xem_coc from public.ket_noi where id = t.kn('hoa', 'hung')), 'da_ket_noi|true',
              'YC6.2-NT6 kết nối Hoa–Hùng không đổi sau các lệnh bị từ chối');
select t.bang((select count(*) from public.thong_bao where nguoi_nhan = t.id('hung') and loai = 'chu_ngung_cho_xem'), 0::bigint,
              'YC6.2-NT6 lệnh bị từ chối không ghi thông báo cho Hùng');

-- YC6 "Ai được làm gì": sale chưa kết nối đọc lịch, căn, giá của Chị Hoa: không thấy. Nga tạm về chưa kết nối.
update public.ket_noi set trang_thai = 'chua_ket_noi' where chu_id = t.id('hoa') and sale_id = t.id('nga');
select t.dang_nhap(t.id('nga'));
select t.ok(coalesce(t.so($$select * from public.can where nguoi_giu = t.id('hoa')$$), 0) = 0
            and coalesce(t.so($$select * from public.gia_thang where can_id in (t.can('1509'), t.can('3402'))$$), 0) = 0
            and coalesce(t.so($$select * from public.v_lich_sale$$), 0) = 0,
            'YC6.2 PQ4.SALE PQ5.SALE sale chưa kết nối không đọc được lịch, căn, giá của Chị Hoa');
select t.thoat();
select t.dang_nhap(t.id('hoa'));
select t.bang(t.gt($$select nhom from public.fn_ds_sale_cua_toi() where ten = 'Sale Nga'$$), 'chua_ket_noi',
              'YC6.2 quy tắc "Nhóm kết nối" kết nối chưa kết nối nằm ở nhóm "Chưa kết nối"');
select t.thoat();
update public.ket_noi set trang_thai = 'da_ket_noi' where chu_id = t.id('hoa') and sale_id = t.id('nga');

-- ===== YC6.2-NT4: Chị Hoa xác nhận ngừng cho Sale Hùng xem =====
select t.dang_nhap(t.id('hung'));
select t.ok(t.so($$select * from public.can where nguoi_giu = t.id('hoa')$$) = 2, 'YC6.2-NT4 trước khi ngừng: Hùng thấy 2 căn của Chị Hoa');
select t.thoat();
select t.dang_nhap(t.id('hoa'));
select t.bang(t.gt(format('select public.fn_ngung_cho_xem(%L)', t.kn('hoa', 'hung'))), 'chu_ngung',
              'YC6.2-NT4 Chị Hoa xác nhận ngừng cho Sale Hùng xem thì hàm trả "chu_ngung"');
select t.bang(t.gt(format('select public.fn_ngung_cho_xem(%L)', t.kn('hoa', 'hung'))), 'chu_ngung',
              'YC6.2 bước 6 bấm lần hai vẫn "chu_ngung", không lỗi');
select t.thoat();
select t.bang((select trang_thai from public.ket_noi where id = t.kn('hoa', 'hung')), 'chu_ngung',
              'YC6.2-NT4 database: kết nối Hoa–Hùng là chủ ngừng');
select t.dang_nhap(t.id('hung'));
select t.ok(coalesce(t.so($$select * from public.can where nguoi_giu = t.id('hoa')$$), 0) = 0,
            'YC6.2-NT4 PQ3.SALE sau khi ngừng: Hùng không còn đọc được căn của Chị Hoa');
select t.ok(coalesce(t.so($$select * from public.gia_thang where can_id in (t.can('1509'), t.can('3402'))$$), 0) = 0
            and coalesce(t.so($$select * from public.gia_dip where can_id = t.can('3402')$$), 0) = 0,
            'YC6.2-NT4 PQ5.SALE sau khi ngừng: Hùng không còn đọc được giá của Chị Hoa');
select t.ok(coalesce(t.so($$select * from public.v_lich_sale where can_id in (t.can('1509'), t.can('3402'))$$), 0) = 0
            and t.gt($$select public.o_lich(t.can('1509'), '2026-10-10')$$) is null,
            'YC6.2-NT4 PQ4.SALE sau khi ngừng: Hùng không còn đọc được lịch của Chị Hoa');
select t.bang(t.gt($$select string_agg(id::text, ',' order by ngay_nhan) from public.v_booking_cua_sale
                     where id in (t.b('B1'), t.b('B3'))$$),
              t.b('B3') || ',' || t.b('B1'), 'YC6.2-NT4 QD7 sau khi ngừng: Hùng vẫn đọc được B1 và B3 của mình');
select t.bang(t.so($$select * from public.thong_bao where loai = 'chu_ngung_cho_xem'$$), 1::bigint,
              'YC6.2-NT4 Hùng có một thông báo bị ngừng (bấm hai lần không ghi lần hai)');
select t.bang(t.gt($$select noi_dung->>'ten_chu' from public.thong_bao where loai = 'chu_ngung_cho_xem'$$), 'Chị Hoa',
              'YC6.2-NT4 thông báo ghi tên chủ nhà đã ngừng');
select t.thoat();
select t.bang((select count(*) from public.thong_bao where loai = 'chu_ngung_cho_xem'), 1::bigint,
              'YC6.2 bước 6 database chỉ ghi một thông báo ngừng, cho đúng Hùng');
select t.dang_nhap(t.id('lan'));
select t.ok(t.so($$select * from public.can where id = t.can('1509')$$) = 1,
            'YC6.2-NT4 ngừng Hùng không đổi quyền xem của Sale Lan');
select t.thoat();

-- ===== YC6.2-NT9: Chị Hoa đã ngừng Sale Hùng =====
select t.dang_nhap(t.id('hoa'));
select t.bang(t.gt($$select nhom || '|' || coalesce(so_dien_thoai, '-') || '|' || (ngung_luc is not null) || '|' || coalesce(xem_coc::text, '-')
                     from public.fn_ds_sale_cua_toi() where ten = 'Sale Hùng'$$),
              'da_ngung|0900000003|true|-',
              'YC6.2-NT9 Hùng ở nhóm "Đã ngừng": số sale đã cho, ngày ngừng, không có công tắc "Tình trạng cọc"');
select t.bang(t.so($$select * from public.fn_ds_sale_cua_toi() where nhom = 'da_ket_noi'$$), 3::bigint,
              'YC6.2 bước 6 dòng Hùng rời nhóm "Đã kết nối" (còn 3)');
select t.bang(t.gt($$select string_agg(ngay_nhan::text, ',' order by ngay_nhan) from public.fn_dat_phong_cua_sale(t.id('hung'))
                     where trang_thai = 'hieu_luc'$$),
              '2026-10-04,2026-10-10', 'YC6.2-NT9 mở dòng Hùng đã ngừng thấy B3, B1');
select t.loi(format('select public.fn_dat_xem_coc(%L, false)', t.kn('hoa', 'hung')), 'P0001',
             'YC6.2-NT9 kết nối đã ngừng không bật tắt "Tình trạng cọc" được');
select t.loi(format('select public.fn_bo_dong_sale(%L)', t.kn('hoa', 'hung')), 'P0001',
             'YC6.2-NT9 dòng đã ngừng không xóa được (bỏ dòng chỉ cho sale đã xóa tài khoản)');
select t.loi(format('select public.fn_xoa_sale_tay(%L)', t.kn('hoa', 'hung')), '42501',
             'YC6.2-NT9 dòng đã ngừng không xóa được bằng lệnh xóa sale thêm tay');
select t.thoat();
select t.bang((select count(*) from public.ket_noi where id = t.kn('hoa', 'hung')), 1::bigint,
              'YC6.2-NT9 database: kết nối đã ngừng vẫn còn');
-- Kết nối chưa kết nối (không phải đang kết nối) thì không ngừng được.
update public.ket_noi set trang_thai = 'chua_ket_noi' where chu_id = t.id('hoa') and sale_id = t.id('nga');
select t.dang_nhap(t.id('hoa'));
select t.loi(format('select public.fn_ngung_cho_xem(%L)', (select id from public.ket_noi where chu_id = t.id('hoa') and sale_id = t.id('nga'))),
             'P0001', 'YC6.2 bước 6 sale chưa kết nối thì lệnh ngừng bị từ chối');
select t.thoat();
update public.ket_noi set trang_thai = 'da_ket_noi' where chu_id = t.id('hoa') and sale_id = t.id('nga');

-- ===== YC6.2-NT7: Sale Hùng (đã ngừng) và Sale Minh (đang kết nối) xóa tài khoản =====
update public.profiles set so_dien_thoai = null, da_xoa_luc = now() where id in (t.id('hung'), '00000000-0000-0000-0000-000000000006');
select t.dang_nhap(t.id('hoa'));
select t.bang(t.gt($$select ten || '|' || da_xoa_tai_khoan || '|' || coalesce(so_dien_thoai, '-') || '|' || nhom
                     from public.fn_ds_sale_cua_toi() where sale_id = '00000000-0000-0000-0000-000000000006'$$),
              'Sale Minh|true|-|da_ket_noi',
              'YC6.2-NT7 sale đã kết nối xóa tài khoản: dòng giữ tên cũ, ghi đã xoá tài khoản, không có số');
select t.bang(t.gt($$select ten || '|' || da_xoa_tai_khoan || '|' || coalesce(so_dien_thoai, '-')
                     from public.fn_ds_sale_cua_toi() where sale_id = t.id('hung')$$),
              'Sale Hùng|true|-', 'YC6.2-NT7 dòng Sale Hùng ghi "Đã xoá tài khoản", không có số');
select t.ok(t.gt($$select bool_and(so_dien_thoai is null) from public.fn_ds_sale_cua_toi() where da_xoa_tai_khoan$$) = 'true',
            'YC6.2-NT7 PQ23.CHU QD13 database không trả số của người đã xóa tài khoản');
select t.bang(t.gt($$select public.o_lich(t.can('1509'), '2026-10-10')$$), 'kin',
              'YC6.2-NT7 QD13 B1 vẫn ở lịch của Chị Hoa (đêm 10/10 của 1509 kín)');
select t.bang(t.so($$select * from public.booking where id = t.b('B1') and trang_thai = 'hieu_luc'$$), 1::bigint,
              'YC6.2-NT7 QD13 Chị Hoa vẫn đọc B1 còn hiệu lực');
select t.bang(t.gt($$select string_agg(ngay_nhan::text, ',' order by ngay_nhan) from public.fn_dat_phong_cua_sale(t.id('hung'))
                     where trang_thai = 'hieu_luc'$$),
              '2026-10-04,2026-10-10', 'YC6.2-NT7 PQ23.CHU đặt phòng đã thành với sale đã xóa tài khoản vẫn còn');
select t.thoat();
select t.ok(t.ma_loi($$select t.tao_booking(null, t.can('1509'), '2026-10-11', '2026-10-13', 1000000)$$) = '23P01',
            'YC6.2-NT7 QD6 QD13 B1 của sale đã xóa tài khoản vẫn chặn trùng');
-- Chủ nhà bỏ dòng sale đã xóa tài khoản (YC6.2 bước 7, YC6-H1); đặt phòng giữ nguyên.
select t.dang_nhap(t.id('tuan'));
select t.loi(format('select public.fn_bo_dong_sale(%L)', t.kn('hoa', 'hung')), '42501',
             'YC6.2 bước 7 PQ17.CHU Anh Tuấn bỏ dòng sale đã xóa tài khoản của Chị Hoa thì database từ chối');
select t.thoat();
select t.dang_nhap(t.id('hoa'));
select t.khong_loi(format('select public.fn_bo_dong_sale(%L)', t.kn('hoa', 'hung')),
                   'YC6.2 bước 7 Chị Hoa bỏ dòng Sale Hùng đã xóa tài khoản thì lệnh qua');
select t.bang(t.so($$select * from public.fn_ds_sale_cua_toi() where sale_id = t.id('hung')$$), 0::bigint,
              'YC6.2 bước 7 dòng Sale Hùng không còn ở danh sách');
select t.bang(t.so($$select * from public.booking where id in (t.b('B1'), t.b('B3')) and trang_thai = 'hieu_luc'$$), 2::bigint,
              'YC6.2 bước 7 QD13 bỏ dòng không đổi B1, B3');
select t.thoat();
