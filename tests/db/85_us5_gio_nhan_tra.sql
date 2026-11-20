-- US5 · Giờ nhận, trả phòng mặc định (YC1.5). Lệnh fn_dat_gio_nhan_tra ghi giờ của chính người gọi.
-- YC1.5-NT1, NT2, NT3, YC1 "Quy tắc của nhóm" (Giờ nhận trả mặc định), PQ1, PQ6, QT4.1. Viết trước migration (US5-TA1, CL14.5).
select t.fixture();

select t.ok(exists (select 1 from pg_proc where proname = 'fn_dat_gio_nhan_tra' and pronamespace = 'public'::regnamespace and prosecdef),
            'YC1.5 danh mục: có lệnh fn_dat_gio_nhan_tra chạy security definer');
select t.ok(not exists (select 1 from pg_proc p where p.proname = 'fn_dat_gio_nhan_tra' and p.pronamespace = 'public'::regnamespace
                        and has_function_privilege('anon', p.oid, 'execute')),
            'YC1.5 danh mục PQ1: người chưa đăng nhập không gọi được fn_dat_gio_nhan_tra');
select t.ok(not exists (select 1 from information_schema.parameters p
                        where p.specific_schema = 'public' and p.specific_name like 'fn_dat_gio_nhan_tra%'
                          and p.parameter_name in ('p_id', 'p_nguoi', 'p_chu', 'p_nguoi_id')),
            'YC1.5-NT3 danh mục: lệnh chỉ ghi giờ của người gọi, không nhận mã người');

-- Một đặt phòng đã ghi giờ 14:00 và 12:00 của Chị Hoa (QT4.1: giờ chép vào đặt phòng lúc tạo).
select t.thoat();
select t.tao_booking('gio5', t.can('1509'), date '2026-11-10', date '2026-11-12', 2000000);
update public.booking set gio_nhan = '14:00', gio_tra = '12:00' where id = t.b('gio5');
update public.profiles set gio_nhan = '14:00', gio_tra = '12:00' where id in (t.id('hoa'), t.id('tuan'));

-- ===== YC1.5-NT1: Chị Hoa lưu 15:00 và 11:00 =====
select t.dang_nhap(t.id('hoa'));
select t.bang(t.ma_loi($$select public.fn_dat_gio_nhan_tra('15:00', '11:00')$$), null::text, 'YC1.5-NT1 Chị Hoa lưu giờ nhận 15:00, trả 11:00 thì qua');
select t.bang(t.gt($$select to_char(gio_nhan, 'HH24:MI') || '|' || to_char(gio_tra, 'HH24:MI') from public.profiles where id = auth.uid()$$),
              '15:00|11:00', 'YC1.5-NT1 hồ sơ Chị Hoa ghi 15:00 và 11:00 (dòng menu "15:00 · 11:00")');
select t.dang_nhap(t.id('hung'));
select t.bang(t.gt($$select (public.fn_sale_chi_tiet_can(t.can('1509'), date '2026-11-10', date '2026-11-12') ->> 'gio_nhan')
                      || '|' || (public.fn_sale_chi_tiet_can(t.can('1509'), date '2026-11-10', date '2026-11-12') ->> 'gio_tra')$$),
              '15:00|11:00', 'YC1.5-NT1 S3 của Sale Hùng ghi "Nhận phòng 15:00 · Trả phòng 11:00" theo giờ mới của chủ nhà');

-- ===== YC1.5-NT2: đặt phòng đã có giữ giờ đã ghi =====
select t.thoat();
select t.bang(to_char((select gio_nhan from public.booking where id = t.b('gio5')), 'HH24:MI') || '|'
              || to_char((select gio_tra from public.booking where id = t.b('gio5')), 'HH24:MI'),
              '14:00|12:00', 'YC1.5-NT2 chủ nhà đổi giờ thì đặt phòng đã có giữ giờ 14:00 và 12:00');

-- ===== YC1.5-NT3: giờ của người khác không đổi =====
select t.bang((select to_char(gio_nhan, 'HH24:MI') || '|' || to_char(gio_tra, 'HH24:MI') from public.profiles where id = t.id('tuan')),
              '14:00|12:00', 'YC1.5-NT3 Chị Hoa đổi giờ thì giờ của Anh Tuấn không đổi');
select t.dang_nhap(t.id('hung'));
select t.bang(t.ma_loi($$select public.fn_dat_gio_nhan_tra('16:00', '10:00')$$), null::text, 'YC1.5-NT3 Sale Hùng ghi giờ của mình thì qua');
select t.thoat();
select t.bang((select to_char(gio_nhan, 'HH24:MI') || '|' || to_char(gio_tra, 'HH24:MI') from public.profiles where id = t.id('hoa')),
              '15:00|11:00', 'YC1.5-NT3 sale ghi giờ thì không đổi giờ của chủ nhà nào (Chị Hoa vẫn 15:00 và 11:00)');
select t.bang((select to_char(gio_nhan, 'HH24:MI') from public.profiles where id = t.id('hung')), '16:00', 'YC1.5-NT3 giờ của Sale Hùng ghi ở hồ sơ của chính họ');
select t.dang_nhap(t.id('lan'));
select t.bang(t.ma_loi($$update public.profiles set gio_nhan = '03:00' where id = '00000000-0000-0000-0000-000000000001'$$), '42501',
              'YC1.5-NT3 sửa thẳng giờ của Chị Hoa bị từ chối');
select t.bang(t.ma_loi($$select public.fn_dat_gio_nhan_tra('15:00', '11:00', p_nguoi => '00000000-0000-0000-0000-000000000001')$$), '42883',
              'YC1.5-NT3 gửi mã người khác trong lệnh bị từ chối');

-- Giờ trống bị từ chối.
select t.dang_nhap(t.id('hoa'));
select t.bang(t.ma_loi($$select public.fn_dat_gio_nhan_tra(null, '11:00')$$), '22023', 'YC1.5 giờ nhận trống bị từ chối');
select t.bang(t.ma_loi($$select public.fn_dat_gio_nhan_tra('15:00', null)$$), '22023', 'YC1.5 giờ trả trống bị từ chối');
