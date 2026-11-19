-- US30 · Chi tiết đặt phòng và thu tiền (YC5.5). Hàm đọc chi tiết fn_chi_tiet_dat_phong, lệnh ghi đã thu đủ fn_da_thu_du
-- và hoàn tác fn_hoan_tac_thu_du. YC5 "Ai được làm gì": PQ7.CHU, PQ8.SALE, PQ9, PQ11 có test vi phạm ở cuối file.
-- Số theo DLM: B1 1509, 10/10 → 12/10, Sale Hùng đứng tên, tiền phòng 2.200.000đ, đã cọc 1.000.000đ.
select t.fixture();

select t.tao_booking('B1', t.can('1509'), '2026-10-10', '2026-10-12', 2200000, t.id('hung'), 'tu_yeu_cau');
update public.booking set trang_thai_tien = 'da_coc', tien_coc = 1000000, gio_nhan = '14:00', gio_tra = '12:00',
                          ghi_chu = 'Sale Hùng: khách xin nhận phòng sớm 12:00.'
  where id = t.b('B1');
-- Phần riêng: Chị Hoa nhập số khách; Sale Hùng giữ tên, số khách của mình và giá bán (QD11, PQ9, PQ11).
insert into public.booking_rieng (booking_id, nguoi_id, ten_khach, sdt_khach, so_khach)
values (t.b('B1'), t.id('hoa'), null, null, 4),
       (t.b('B1'), t.id('hung'), 'Khách Của Hùng', '0900000077', 3);
update public.booking_rieng set tien_thu_khach = 2600000 where booking_id = t.b('B1') and nguoi_id = t.id('hung');

-- Khách lẻ có tên, số Chị Hoa nhập (YC5.5 bước 17b) và khách lẻ không tên.
select t.tao_booking('LE', t.can('3402'), '2026-11-03', '2026-11-04', 800000);
insert into public.booking_rieng (booking_id, nguoi_id, ten_khach, sdt_khach, so_khach)
values (t.b('LE'), t.id('hoa'), 'Bà Lan', '0912345678', 2);
select t.tao_booking('LE2', t.can('3402'), '2026-11-05', '2026-11-06', 800000);
update public.booking set trang_thai_tien = 'chua_coc' where id = t.b('LE2');

-- Trạng thái tiền, cọc, trạng thái nhớ của một booking (đọc bằng vai chủ database).
-- plpgsql để file vẫn chạy (và báo hỏng từng test) khi cột chưa có.
create or replace function pg_temp.tien(p_id uuid) returns text language plpgsql as $$
begin
  return t.gt(format($q$select trang_thai_tien || '|' || coalesce(tien_coc::text, '-') || '|' || coalesce(trang_thai_tien_truoc, '-')
                        from public.booking where id = %L$q$, p_id));
end $$;

-- ===== Danh mục =====
select t.ok((select count(distinct proname) from pg_proc
             where proname in ('fn_chi_tiet_dat_phong', 'fn_da_thu_du', 'fn_hoan_tac_thu_du')
               and pronamespace = 'public'::regnamespace and prosecdef) = 3,
            'YC5.5 danh mục: fn_chi_tiet_dat_phong, fn_da_thu_du, fn_hoan_tac_thu_du có và chạy security definer');
select t.ok(not exists (select 1 from pg_proc p
                        where p.proname in ('fn_chi_tiet_dat_phong', 'fn_da_thu_du', 'fn_hoan_tac_thu_du')
                          and p.pronamespace = 'public'::regnamespace and has_function_privilege('anon', p.oid, 'execute')),
            'YC5.5 danh mục PQ7.LINK: người chưa đăng nhập không có quyền gọi ba hàm của YC5.5');
select t.ok(exists (select 1 from information_schema.columns
                    where table_schema = 'public' and table_name = 'booking' and column_name = 'trang_thai_tien_truoc'),
            'YC5.5 danh mục: booking có cột trang_thai_tien_truoc (trạng thái trước khi thu đủ)');
select t.ok(not has_column_privilege('authenticated', 'public.booking', 'trang_thai_tien', 'UPDATE'),
            'YC5.5 PQ8.CHU authenticated không sửa thẳng trạng thái tiền, chỉ qua hàm');

-- ===== YC5.5 bước 16, 17: Chị Hoa mở chi tiết B1 =====
select t.dang_nhap(t.id('hoa'));
select t.bang(t.gt($$select ma_can || '|' || ngay_nhan || '|' || ngay_tra || '|' || to_char(gio_nhan, 'HH24:MI') || '|'
                     || to_char(gio_tra, 'HH24:MI') || '|' || tien_phong || '|' || tien_coc || '|' || trang_thai_tien || '|'
                     || co_hoan_tac || '|' || trang_thai
                     from public.fn_chi_tiet_dat_phong(t.b('B1'))$$),
              '1509|2026-10-10|2026-10-12|14:00|12:00|2200000|1000000|da_coc|false|hieu_luc',
              'YC5.5 bước 16 Chị Hoa đọc chi tiết B1: 1509, 10/10 → 12/10, 14:00, 12:00, tiền phòng 2.200.000đ, đã cọc 1.000.000đ');
select t.bang(t.gt($$select ten_sale || '|' || sdt_sale || '|' || sale_da_xoa || '|' || so_khach
                     from public.fn_chi_tiet_dat_phong(t.b('B1'))$$),
              'Sale Hùng|0900000003|false|4',
              'YC5.5 bước 17 Chị Hoa thấy tên, số Sale Hùng (đang kết nối) và số khách chị nhập');
select t.bang(t.gt($$select coalesce(ten_khach, '-') || '|' || coalesce(sdt_khach, '-') from public.fn_chi_tiet_dat_phong(t.b('B1'))$$),
              '-|-', 'YC5.5 bước 17 QD11 PQ9.CHU chi tiết B1 không trả tên, số khách do Sale Hùng nhập');
select t.ok(not exists (select 1 from information_schema.routines r
                        join information_schema.parameters p on p.specific_name = r.specific_name
                        where r.routine_schema = 'public' and r.routine_name = 'fn_chi_tiet_dat_phong'
                          and p.parameter_mode = 'OUT' and p.parameter_name in ('tien_thu_khach', 'gia_ban', 'muc_cong', 'tien_chenh')),
            'YC5.5 PQ11.CHU fn_chi_tiet_dat_phong không có cột giá bán, mức cộng, tiền thu khách của sale');
select t.thoat();

-- YC5.5-NT6 (database cho màn): khách lẻ có tên, số Chị Hoa nhập.
select t.dang_nhap(t.id('hoa'));
select t.bang(t.gt($$select ten_khach || '|' || sdt_khach || '|' || (sale_id is null) from public.fn_chi_tiet_dat_phong(t.b('LE'))$$),
              'Bà Lan|0912345678|true', 'YC5.5-NT6 bước 17b Chị Hoa đọc khách lẻ "Bà Lan", số 0912345678 chị nhập');
select t.bang(t.gt($$select coalesce(ten_khach, '-') || '|' || coalesce(sdt_khach, '-') from public.fn_chi_tiet_dat_phong(t.b('LE2'))$$),
              '-|-', 'YC5.5-NT6 khách lẻ không tên, không số thì hàm trả rỗng');
select t.bang(t.so($$select * from public.fn_chi_tiet_dat_phong(gen_random_uuid())$$), 0::bigint,
              'YC5.5 HV5 đặt phòng không có thì hàm không trả dòng nào');
select t.thoat();

-- ===== YC5.5-NT2: Chị Hoa bấm "Đã thu đủ" ở B1 =====
select t.dang_nhap(t.id('hoa'));
select t.bang(t.gt($$select public.fn_da_thu_du(t.b('B1'))$$), 'da_thanh_toan',
              'YC5.5-NT2 Chị Hoa gửi lệnh đã thu đủ B1 thì hàm trả "da_thanh_toan"');
select t.bang(t.gt($$select trang_thai_tien || '|' || tien_coc || '|' || co_hoan_tac from public.fn_chi_tiet_dat_phong(t.b('B1'))$$),
              'da_thanh_toan|1000000|true',
              'YC5.5-NT2 sau khi thu đủ: B1 "Đã thanh toán", tiền cọc vẫn 1.000.000đ, có hoàn tác');
select t.thoat();
select t.bang(pg_temp.tien(t.b('B1')), 'da_thanh_toan|1000000|da_coc',
              'YC5.5-NT2 database: trạng thái tiền đã thanh toán, cọc giữ 1.000.000đ, nhớ trạng thái trước "da_coc"');
select t.ok(exists (select 1 from public.audit_log where bang = 'booking' and ban_ghi_id = t.b('B1') and hanh_dong = 'update'
                      and nguoi = t.id('hoa') and truoc->>'trang_thai_tien' = 'da_coc' and sau->>'trang_thai_tien' = 'da_thanh_toan'),
            'YC5.5-NT2 QD2 lệnh thu đủ ghi nhật ký: Chị Hoa, trước "da_coc", sau "da_thanh_toan"');

-- QT5.6: gửi lại lệnh thu đủ không làm mất trạng thái nhớ.
select t.dang_nhap(t.id('hoa'));
select t.bang(t.gt($$select public.fn_da_thu_du(t.b('B1'))$$), 'da_thanh_toan',
              'YC5.5-NT2 QT5.6 gửi lại lệnh thu đủ thì vẫn "da_thanh_toan"');
select t.thoat();
select t.bang(pg_temp.tien(t.b('B1')), 'da_thanh_toan|1000000|da_coc',
              'YC5.5-NT2 QT5.6 gửi lại lệnh thu đủ không ghi đè trạng thái nhớ "da_coc"');

-- ===== YC5.5-NT3: Chị Hoa bấm "Hoàn tác: chưa thu đủ" ngay sau đó =====
select t.dang_nhap(t.id('hoa'));
select t.bang(t.gt($$select public.fn_hoan_tac_thu_du(t.b('B1'))$$), 'da_coc',
              'YC5.5-NT3 Chị Hoa hoàn tác thu đủ B1 thì hàm trả "da_coc"');
select t.bang(t.gt($$select trang_thai_tien || '|' || tien_coc || '|' || co_hoan_tac from public.fn_chi_tiet_dat_phong(t.b('B1'))$$),
              'da_coc|1000000|false', 'YC5.5-NT3 sau hoàn tác B1 về "Đã cọc · còn thu", cọc 1.000.000đ, không còn hoàn tác');
select t.thoat();
select t.bang(pg_temp.tien(t.b('B1')), 'da_coc|1000000|-', 'YC5.5-NT3 database: B1 về "da_coc", bỏ trạng thái nhớ');
select t.dang_nhap(t.id('hoa'));
select t.bang(t.gt($$select public.fn_hoan_tac_thu_du(t.b('B1'))$$), 'da_coc',
              'YC5.5-NT3 QT5.6 gửi lại lệnh hoàn tác thì giữ "da_coc"');
select t.thoat();
select t.bang(pg_temp.tien(t.b('B1')), 'da_coc|1000000|-', 'YC5.5-NT3 QT5.6 gửi lại lệnh hoàn tác không đổi B1');

-- Khách lẻ "Chưa cọc": thu đủ rồi hoàn tác về "Chưa cọc".
select t.dang_nhap(t.id('hoa'));
select t.bang(t.gt($$select public.fn_da_thu_du(t.b('LE2'))$$), 'da_thanh_toan', 'YC5.5-NT2 khách lẻ chưa cọc thu đủ thì "da_thanh_toan"');
select t.bang(t.gt($$select public.fn_hoan_tac_thu_du(t.b('LE2'))$$), 'chua_coc', 'YC5.5-NT3 hoàn tác khách lẻ về "chua_coc"');
select t.thoat();

-- Đặt phòng đã thanh toán từ lúc ghi (không có trạng thái nhớ) thì không hoàn tác được.
update public.booking set trang_thai_tien = 'da_thanh_toan' where id = t.b('LE');
select t.dang_nhap(t.id('hoa'));
select t.loi($$select public.fn_hoan_tac_thu_du(t.b('LE'))$$, 'P0001',
             'YC5.5 bước 21 đặt phòng không thu đủ bằng lệnh thì không hoàn tác được');
select t.bang(t.gt($$select co_hoan_tac::text from public.fn_chi_tiet_dat_phong(t.b('LE'))$$), 'false',
              'YC5.5 bước 20 đặt phòng đã thanh toán từ lúc ghi thì không có hoàn tác');
select t.thoat();
select t.bang(pg_temp.tien(t.b('LE')), 'da_thanh_toan|-|-', 'YC5.5 bước 21 lệnh hoàn tác bị từ chối không đổi đặt phòng');

-- ===== YC5.5-NT4: Sale Hùng đã xóa tài khoản, Chị Hoa mở B1 =====
update public.profiles set so_dien_thoai = null, da_xoa_luc = now() where id = t.id('hung');
select t.dang_nhap(t.id('hoa'));
select t.bang(t.gt($$select ten_sale || '|' || coalesce(sdt_sale, '-') || '|' || sale_da_xoa from public.fn_chi_tiet_dat_phong(t.b('B1'))$$),
              'Sale Hùng|-|true', 'YC5.5-NT4 sale đã xóa tài khoản: tên "Sale Hùng", cờ đã xóa, không còn số điện thoại');
select t.bang(t.gt($$select string_agg(dem::text || ':' || co_khach, ',' order by dem)
                     from public.fn_lich_gia_thang(t.can('1509'), '2026-10-01') where dem in ('2026-10-10', '2026-10-11', '2026-10-12')$$),
              '2026-10-10:true,2026-10-11:true,2026-10-12:false',
              'YC5.5-NT4 QD13 sale đã xóa tài khoản: đêm 10/10, 11/10 của 1509 vẫn kín');
select t.thoat();
select t.bang((select trang_thai from public.booking where id = t.b('B1')), 'hieu_luc', 'YC5.5-NT4 QD13 B1 vẫn còn hiệu lực');
update public.profiles set so_dien_thoai = '0900000003', da_xoa_luc = null where id = t.id('hung');

-- Chủ ngừng cho xem: số sale không còn trả về (chỉ số của sale đang kết nối), tên vẫn có.
update public.ket_noi set trang_thai = 'chu_ngung' where id = t.kn('hoa', 'hung');
select t.dang_nhap(t.id('hoa'));
select t.bang(t.gt($$select ten_sale || '|' || coalesce(sdt_sale, '-') || '|' || sale_da_xoa from public.fn_chi_tiet_dat_phong(t.b('B1'))$$),
              'Sale Hùng|-|false', 'YC5.5 bước 17 PQ2 sale không còn kết nối thì không trả số điện thoại sale');
select t.thoat();
update public.ket_noi set trang_thai = 'da_ket_noi' where id = t.kn('hoa', 'hung');

-- ===== YC5.5-NT5 và YC5 "Ai được làm gì": vi phạm quyền =====
-- PQ8.SALE: Sale Hùng (sale của B1) gửi lệnh thu đủ, hoàn tác.
select t.dang_nhap(t.id('hung'));
select t.loi($$select public.fn_da_thu_du(t.b('B1'))$$, '42501',
             'YC5.5-NT5 PQ8.SALE Sale Hùng gửi lệnh ghi đã thu đủ cho B1 thì database từ chối');
select t.loi($$select public.fn_hoan_tac_thu_du(t.b('B1'))$$, '42501',
             'YC5.5-NT5 PQ8.SALE Sale Hùng gửi lệnh hoàn tác thu đủ cho B1 thì database từ chối');
select t.ok(coalesce(t.so($$select * from public.fn_chi_tiet_dat_phong(t.b('B1'))$$), 0) = 0,
            'YC5.5 PQ8.SALE PQ9.SALE Sale Hùng gọi hàm chi tiết của chủ nhà thì không có dòng nào (không thấy cọc, khách của chủ)');
select t.thoat();
select t.bang(pg_temp.tien(t.b('B1')), 'da_coc|1000000|-', 'YC5.5-NT5 trạng thái tiền B1 không đổi sau lệnh của Sale Hùng');

-- PQ7.SALE: Sale Lan (sale khác, được xem 1509).
select t.dang_nhap(t.id('lan'));
select t.loi($$select public.fn_da_thu_du(t.b('B1'))$$, '42501',
             'YC5.5-NT5 PQ7.SALE Sale Lan (sale khác) gửi lệnh thu đủ cho B1 thì database từ chối');
select t.loi($$select public.fn_hoan_tac_thu_du(t.b('B1'))$$, '42501',
             'YC5.5-NT5 PQ7.SALE Sale Lan gửi lệnh hoàn tác cho B1 thì database từ chối');
select t.ok(coalesce(t.so($$select * from public.fn_chi_tiet_dat_phong(t.b('B1'))$$), 0) = 0,
            'YC5.5 PQ7.SALE Sale Lan không đọc được chi tiết B1');
select t.thoat();

-- PQ7.CHU: Anh Tuấn (chủ khác); đặt phòng không có thật cùng một lỗi quyền.
select t.dang_nhap(t.id('tuan'));
select t.loi($$select public.fn_da_thu_du(t.b('B1'))$$, '42501',
             'YC5.5-NT5 PQ7.CHU Anh Tuấn (chủ khác) gửi lệnh thu đủ cho B1 thì database từ chối');
select t.loi($$select public.fn_hoan_tac_thu_du(t.b('B1'))$$, '42501',
             'YC5.5-NT5 PQ7.CHU Anh Tuấn gửi lệnh hoàn tác cho B1 thì database từ chối');
select t.loi($$select public.fn_da_thu_du(gen_random_uuid())$$, '42501',
             'YC5.5 PQ7.CHU đặt phòng không có thật trả cùng lỗi quyền');
select t.ok(coalesce(t.so($$select * from public.fn_chi_tiet_dat_phong(t.b('B1'))$$), 0) = 0,
            'YC5.5 PQ7.CHU PQ9.CHU Anh Tuấn không đọc được chi tiết B1');
select t.ok(coalesce(t.so($$select * from public.fn_chi_tiet_dat_phong(t.b('LE'))$$), 0) = 0,
            'YC5.5 PQ9.CHU Anh Tuấn không đọc được khách lẻ Chị Hoa nhập');
select t.thoat();

-- Người chưa đăng nhập.
select t.khach();
select t.loi($$select public.fn_da_thu_du(t.b('B1'))$$, '42501',
             'YC5.5-NT5 PQ8.LINK người chưa đăng nhập gửi lệnh thu đủ thì bị từ chối');
select t.loi($$select * from public.fn_chi_tiet_dat_phong(t.b('B1'))$$, '42501',
             'YC5.5 PQ7.LINK người chưa đăng nhập gọi hàm chi tiết thì bị từ chối');
select t.thoat();
select t.bang(pg_temp.tien(t.b('B1')), 'da_coc|1000000|-', 'YC5.5-NT5 trạng thái tiền B1 không đổi sau mọi lệnh bị từ chối');

-- Đặt phòng đã hủy: không thu đủ được.
update public.booking set trang_thai = 'da_huy' where id = t.b('LE2');
select t.dang_nhap(t.id('hoa'));
select t.loi($$select public.fn_da_thu_du(t.b('LE2'))$$, 'Đặt phòng này không còn',
             'YC5.5 HV5 đặt phòng đã hủy thì lệnh thu đủ bị từ chối "Đặt phòng này không còn"');
select t.thoat();
