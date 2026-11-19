-- US31 · Sửa đặt phòng (YC5.6 bản 2). Viết trước migration (US31-TA1); task sau không sửa file này (CL14.5).
-- Lệnh sửa fn_sua_booking: chỉ chủ nhà giữ căn (PQ7.CHU); kiểm dữ liệu như khi ghi; chặn trùng bỏ chính dòng đang sửa
-- (QT1.2, QD6); sửa ở máy khác (bước 29); chia lại tiền từng đêm (QT4.2, YC5-H8); giữ phần riêng của sale (QD11, PQ11);
-- đổi căn chỉ sang căn sale được xem (YC5-H4); trạng thái nhớ để hoàn tác (YC5-H6); thông báo "chủ sửa đặt phòng" chỉ khi
-- đổi căn, ngày, tiền phòng (YC5-H9); yêu cầu chờ trùng đêm mới thành bị từ chối (QT1.4); giờ lịch đổi của căn cũ và mới.
-- YC5 "Ai được làm gì": PQ7.CHU, PQ7.SALE, PQ7.LINK có test vi phạm trong file.
-- Số theo DLM.3: B1 1509, 10/10 → 12/10, Sale Hùng, 2.200.000đ, cọc 1.000.000đ, giá bán của Hùng 2.600.000đ;
-- B5 1509, 13/10 → 15/10. Đêm cuối tuần T6, T7: 10/10 (T7) 1.300.000đ, 11/10 (CN) 900.000đ.
select t.fixture();

-- YC5.6-NT9: Sale Hùng chỉ được xem 1509.
update public.ket_noi set pham_vi = 'chon_can' where id = t.kn('hoa', 'hung');
insert into public.ket_noi_can (ket_noi_id, can_id) values (t.kn('hoa', 'hung'), t.can('1509'));

-- B1: đặt phòng của Sale Hùng (từ yêu cầu). t.tao_booking chia đều 1.100.000đ mỗi đêm, khác bảng giá: sửa mà không
-- đổi căn, ngày, tiền thì tiền từng đêm phải giữ 1.100.000đ (YC5-H8).
select t.tao_booking('B1', t.can('1509'), '2026-10-10', '2026-10-12', 2200000, t.id('hung'), 'tu_yeu_cau');
update public.booking set trang_thai_tien = 'da_coc', tien_coc = 1000000, gio_nhan = '14:00', gio_tra = '12:00',
                          ghi_chu = 'Khách xin nhận sớm.'
  where id = t.b('B1');
insert into public.booking_rieng (booking_id, nguoi_id, ten_khach, sdt_khach, so_khach)
values (t.b('B1'), t.id('hoa'), null, null, 4),
       (t.b('B1'), t.id('hung'), 'Khách Của Hùng', '0900000077', 3);
update public.booking_rieng set tien_thu_khach = 2600000 where booking_id = t.b('B1') and nguoi_id = t.id('hung');

-- B5: khách lẻ, 1509, 13/10 → 15/10 (T3, T4: 900.000đ mỗi đêm).
select t.tao_booking('B5', t.can('1509'), '2026-10-13', '2026-10-15', 1800000);
update public.booking set trang_thai_tien = 'chua_coc' where id = t.b('B5');
-- LE: khách lẻ 3402, 03/11 → 04/11.
select t.tao_booking('LE', t.can('3402'), '2026-11-03', '2026-11-04', 800000);
update public.booking set trang_thai_tien = 'chua_coc' where id = t.b('LE');

-- Câu gọi fn_sua_booking với giá trị hiện tại của đặt phòng, đổi những ô được truyền. Chạy bằng quyền chủ database
-- (security definer) để dựng câu gọi khi đang đóng vai sale hay chủ khác; câu gọi chạy bằng vai hiện tại.
create or replace function pg_temp.cau_sua(
  p_id uuid, p_can uuid default null, p_nhan date default null, p_tra date default null, p_tien bigint default null,
  p_tt text default null, p_coc bigint default null, p_ghi_chu text default null, p_so_khach int default null,
  p_ten_khach text default null, p_sua_luc timestamptz default null, p_bo_tien boolean default false
) returns text language plpgsql security definer as $$
declare b public.booking%rowtype; r public.booking_rieng%rowtype; v_tt text; v_coc bigint;
begin
  select * into b from public.booking where id = p_id;
  select r2.* into r from public.booking_rieng r2 join public.can c on c.id = b.can_id
   where r2.booking_id = p_id and r2.nguoi_id = c.nguoi_giu;
  v_tt := coalesce(p_tt, case b.trang_thai_tien when 'da_coc' then 'da_coc_con_thu' else b.trang_thai_tien end);
  v_coc := case when v_tt = 'da_coc_con_thu' then coalesce(p_coc, b.tien_coc) end;
  return format('select public.fn_sua_booking(p_booking_id => %L, p_sua_luc => %L, p_can_id => %L, p_ngay_nhan => %L, '
                || 'p_ngay_tra => %L, p_tien_phong => %s, p_trang_thai_tien => %L, p_tien_coc => %s, p_ten_khach => %L, '
                || 'p_sdt_khach => %L, p_so_khach => %s, p_gio_nhan => %L, p_gio_tra => %L, p_ghi_chu => %L)',
                p_id, coalesce(p_sua_luc, b.sua_luc), coalesce(p_can, b.can_id), coalesce(p_nhan, b.ngay_nhan),
                coalesce(p_tra, b.ngay_tra),
                case when p_bo_tien then 'null' else coalesce(p_tien, b.tien_phong)::text end,
                v_tt, coalesce(v_coc::text, 'null'), coalesce(p_ten_khach, r.ten_khach), r.sdt_khach,
                coalesce(coalesce(p_so_khach, r.so_khach)::text, 'null'), b.gio_nhan, b.gio_tra,
                coalesce(p_ghi_chu, b.ghi_chu));
end $$;
-- Chạy câu bằng vai hiện tại, trả "mã lỗi|câu lỗi" hay 'qua'.
create or replace function pg_temp.loi(p_cau text) returns text language plpgsql as $$
declare ma text; cau text;
begin
  execute p_cau;
  return 'qua';
exception when others then
  get stacked diagnostics ma = returned_sqlstate, cau = message_text;
  return ma || '|' || cau;
end $$;
-- Phần mọi bên cùng thấy của một đặt phòng (vai chủ database).
create or replace function pg_temp.ban(p_id uuid) returns text language sql security definer as $$
  select b.can_id || '|' || b.ngay_nhan || '|' || b.ngay_tra || '|' || b.tien_phong || '|' || coalesce(b.trang_thai_tien, '-')
         || '|' || coalesce(b.tien_coc::text, '-') || '|' || coalesce(b.ghi_chu, '-')
  from public.booking b where b.id = p_id
$$;
-- Tiền từng đêm "đêm:tiền,..." (vai chủ database).
create or replace function pg_temp.dem(p_id uuid) returns text language sql security definer as $$
  select string_agg(to_char(d.dem, 'DD/MM') || ':' || d.tien, ',' order by d.dem) from public.booking_dem d where d.booking_id = p_id
$$;
-- Số thông báo "chủ sửa đặt phòng" của một người (vai chủ database).
create or replace function pg_temp.so_tb(p_nguoi uuid) returns bigint language sql security definer as $$
  select count(*) from public.thong_bao where nguoi_nhan = p_nguoi and loai = 'chu_sua_dat_phong'
$$;
-- Phần riêng của Sale Hùng trong B1 (vai chủ database).
create or replace function pg_temp.rieng_hung() returns text language sql security definer as $$
  select ten_khach || '|' || sdt_khach || '|' || so_khach || '|' || tien_thu_khach
  from public.booking_rieng where booking_id = t.b('B1') and nguoi_id = t.id('hung')
$$;

-- ===== Danh mục =====
select t.ok(exists (select 1 from pg_proc where proname = 'fn_sua_booking' and pronamespace = 'public'::regnamespace and prosecdef),
            'YC5.6 danh mục: fn_sua_booking có và chạy security definer');
select t.ok(not exists (select 1 from pg_proc p where p.proname = 'fn_sua_booking' and p.pronamespace = 'public'::regnamespace
                          and has_function_privilege('anon', p.oid, 'execute')),
            'YC5.6-NT8 PQ7.LINK người chưa đăng nhập không có quyền gọi fn_sua_booking');
select t.ok(not has_table_privilege('authenticated', 'public.booking', 'UPDATE')
            and not has_column_privilege('authenticated', 'public.booking', 'ngay_nhan', 'UPDATE'),
            'YC5.6 PQ7.CHU authenticated không sửa thẳng bảng booking, chỉ qua hàm');

select set_config('t.ban_b1', pg_temp.ban(t.b('B1')), true);
select set_config('t.sua_luc_b1', (select sua_luc::text from public.booking where id = t.b('B1')), true);

-- ===== YC5.6-NT8 và YC5 "Ai được làm gì": vi phạm quyền =====
select set_config('t.cau', pg_temp.cau_sua(t.b('B1'), p_ghi_chu => 'Sửa trái phép'), true);
select t.dang_nhap(t.id('hung'));
select t.loi(current_setting('t.cau'), '42501', 'YC5.6-NT8 PQ7.SALE Sale Hùng (sale của B1) gửi lệnh sửa B1 thì database từ chối');
select t.thoat();
select t.dang_nhap(t.id('lan'));
select t.loi(current_setting('t.cau'), '42501', 'YC5.6-NT8 PQ7.SALE Sale Lan (sale khác, được xem 1509) gửi lệnh sửa B1 thì database từ chối');
select t.thoat();
select t.dang_nhap(t.id('tuan'));
select t.loi(current_setting('t.cau'), '42501', 'YC5.6-NT8 PQ7.CHU Anh Tuấn (chủ khác) gửi lệnh sửa B1 thì database từ chối');
select t.loi(pg_temp.cau_sua(t.b('B1'), p_can => t.can('1103'), p_ghi_chu => 'Sửa trái phép'), '42501',
             'YC5.6-NT8 PQ7.CHU Anh Tuấn chuyển B1 sang căn của mình thì database từ chối');
select t.thoat();
select t.khach();
select t.loi(current_setting('t.cau'), '42501', 'YC5.6-NT8 PQ7.LINK người chưa đăng nhập gửi lệnh sửa B1 thì bị từ chối');
select t.thoat();
select t.dang_nhap(t.id('hoa'));
select t.loi(replace(current_setting('t.cau'), t.b('B1')::text, gen_random_uuid()::text), '42501',
             'YC5.6 PQ7.CHU đặt phòng không có thật trả cùng lỗi quyền');
select t.loi(pg_temp.cau_sua(t.b('B1'), p_can => t.can('1103')), '42501',
             'YC5.6 PQ7.CHU Chị Hoa chuyển B1 sang căn của Anh Tuấn thì lỗi quyền');
select t.thoat();
select t.bang(pg_temp.ban(t.b('B1')), current_setting('t.ban_b1'), 'YC5.6-NT8 B1 không đổi sau mọi lệnh sửa bị từ chối');
select t.bang(pg_temp.so_tb(t.id('hung')), 0::bigint, 'YC5.6-NT8 lệnh bị từ chối không sinh thông báo');

-- ===== YC5.6-NT2, QT1.2-VD2: sửa trùng đêm của đặt phòng khác bị từ chối =====
select set_config('t.ban_b5', pg_temp.ban(t.b('B5')), true);
select t.dang_nhap(t.id('hoa'));
select t.bang(pg_temp.loi(pg_temp.cau_sua(t.b('B5'), p_nhan => '2026-10-11', p_tra => '2026-10-15')),
              'P0001|Căn đã có đặt phòng trong những đêm này',
              'YC5.6-NT2 Chị Hoa đổi B5 (1509, 13/10 → 15/10) thành 11/10 → 15/10 thì database từ chối vì trùng B1');
select t.bang(pg_temp.loi(pg_temp.cau_sua(t.b('B1'), p_tra => '2026-10-14')),
              'P0001|Căn đã có đặt phòng trong những đêm này',
              'YC5.6-NT2 QT1.2-VD2 Chị Hoa đổi B1 thành 10/10 → 14/10 thì từ chối: trùng đêm 13/10 của B5');
select t.thoat();
select t.bang(pg_temp.ban(t.b('B5')), current_setting('t.ban_b5'), 'YC5.6-NT2 B5 không đổi sau lệnh bị từ chối');
select t.bang(pg_temp.ban(t.b('B1')), current_setting('t.ban_b1'), 'YC5.6-NT2 B1 không đổi sau lệnh bị từ chối');

-- ===== YC5.6-NT3, YC5.6-NT10: chỉ sửa ghi chú B1 =====
select t.dang_nhap(t.id('hoa'));
select t.bang(pg_temp.loi(pg_temp.cau_sua(t.b('B1'), p_ghi_chu => 'Khách đến muộn, gọi trước 1 giờ.')), 'qua',
              'YC5.6-NT3 QT1.2-VD1 Chị Hoa sửa ghi chú B1 không đổi ngày thì lưu được, không báo trùng với chính B1');
select t.thoat();
select t.bang((select ghi_chu from public.booking where id = t.b('B1')), 'Khách đến muộn, gọi trước 1 giờ.',
              'YC5.6-NT3 ghi chú mới của B1 đã lưu');
select t.bang(pg_temp.so_tb(t.id('hung')), 0::bigint, 'YC5.6-NT10 YC5-H9 chỉ sửa ghi chú thì Sale Hùng không có thông báo mới');
select t.bang(pg_temp.dem(t.b('B1')), '10/10:1100000,11/10:1100000',
              'YC5.6-NT10 YC5-H8 chỉ sửa ghi chú thì tiền từng đêm của B1 giữ nguyên 1.100.000đ mỗi đêm');
select t.ok((select sua_luc::text from public.booking where id = t.b('B1')) <> current_setting('t.sua_luc_b1'),
            'YC5.6 bước 26 lệnh sửa đổi thời điểm sửa cuối của B1');
select t.ok(exists (select 1 from public.audit_log where bang = 'booking' and ban_ghi_id = t.b('B1') and hanh_dong = 'update'
                      and nguoi = t.id('hoa') and truoc->>'ghi_chu' = 'Khách xin nhận sớm.'
                      and sau->>'ghi_chu' = 'Khách đến muộn, gọi trước 1 giờ.'),
            'YC5.6 bước 26 QD2 lệnh sửa ghi nhật ký: Chị Hoa, ghi chú cũ và mới');
select t.bang(pg_temp.rieng_hung(), 'Khách Của Hùng|0900000077|3|2600000',
              'YC5.6 QD11 PQ9.SALE PQ11.SALE phần riêng của Sale Hùng giữ nguyên khi Chị Hoa sửa');

-- ===== YC5.6 bước 29: đặt phòng vừa bị sửa ở máy khác sau khi mở form =====
select set_config('t.ban_b1', pg_temp.ban(t.b('B1')), true);
select t.dang_nhap(t.id('hoa'));
select t.bang(pg_temp.loi(pg_temp.cau_sua(t.b('B1'), p_tien => 2000000,
                                          p_sua_luc => current_setting('t.sua_luc_b1')::timestamptz)),
              'P0001|Đặt phòng vừa được sửa ở máy khác. Mở lại để xem bản mới.',
              'YC5.6 bước 29 lệnh sửa gửi kèm thời điểm sửa cũ thì database từ chối "Đặt phòng vừa được sửa ở máy khác"');
select t.thoat();
select t.bang(pg_temp.ban(t.b('B1')), current_setting('t.ban_b1'), 'YC5.6 bước 29 B1 không đổi sau lệnh bị từ chối');

-- QT5.6: gửi lại đúng lệnh vừa lưu (mạng rớt, sua_luc cũ) thì không báo lỗi, không ghi lần hai.
select set_config('t.so_nk', (select count(*)::text from public.audit_log where ban_ghi_id = t.b('B1')), true);
select t.dang_nhap(t.id('hoa'));
select t.bang(pg_temp.loi(pg_temp.cau_sua(t.b('B1'), p_sua_luc => current_setting('t.sua_luc_b1')::timestamptz)), 'qua',
              'YC5.6 bước 28 QT5.6 gửi lại lệnh đã lưu (thời điểm sửa cũ, cùng giá trị) thì không báo lỗi');
select t.thoat();
select t.bang((select count(*)::text from public.audit_log where ban_ghi_id = t.b('B1')), current_setting('t.so_nk'),
              'YC5.6 bước 28 QT5.6 gửi lại lệnh đã lưu không ghi lần hai');

-- ===== YC5.6-NT9: đổi căn B1 sang 3402 mà Sale Hùng không được xem =====
select t.dang_nhap(t.id('hoa'));
select t.bang(pg_temp.loi(pg_temp.cau_sua(t.b('B1'), p_can => t.can('3402'))),
              'P0001|Sale này không được xem căn này',
              'YC5.6-NT9 YC5-H4 Chị Hoa đổi căn B1 sang 3402 (Hùng chỉ được xem 1509) thì database từ chối');
select t.thoat();
select t.bang(pg_temp.ban(t.b('B1')), current_setting('t.ban_b1'), 'YC5.6-NT9 B1 không đổi');
select t.bang(pg_temp.so_tb(t.id('hung')), 0::bigint, 'YC5.6-NT9 lệnh bị từ chối không sinh thông báo');

-- ===== YC5.6-NT6: đổi tiền phòng B1 từ 2.200.000đ thành 1.800.000đ =====
select t.dang_nhap(t.id('hoa'));
select t.bang(pg_temp.loi(pg_temp.cau_sua(t.b('B1'), p_tien => 1800000)), 'qua',
              'YC5.6-NT6 Chị Hoa đổi tiền phòng B1 thành 1.800.000đ thì lưu được');
select t.thoat();
select t.bang((select tien_phong from public.booking where id = t.b('B1')), 1800000::bigint, 'YC5.6-NT6 tiền phòng B1 là 1.800.000đ');
select t.bang(pg_temp.rieng_hung(), 'Khách Của Hùng|0900000077|3|2600000',
              'YC5.6-NT6 giá bán của Sale Hùng cho B1 vẫn 2.600.000đ như đã báo khách');
select t.bang(pg_temp.dem(t.b('B1')), '10/10:900000,11/10:900000',
              'YC5.6-NT6 QT4.2 YC5-H8 tiền khác tổng bảng giá thì chia đều 900.000đ mỗi đêm');
select t.bang(pg_temp.so_tb(t.id('hung')), 1::bigint, 'YC5.6-NT6 Sale Hùng có một thông báo "chủ sửa đặt phòng"');
select t.bang((select (noi_dung->>'tien_phong_cu') || '|' || (noi_dung->>'tien_phong')
               from public.thong_bao where nguoi_nhan = t.id('hung') and loai = 'chu_sua_dat_phong'),
              '2200000|1800000', 'YC5.6-NT6 bước 27 thông báo cho Hùng ghi tiền phòng cũ 2.200.000đ và mới 1.800.000đ');
select t.bang((select doi_tuong_loai || '|' || doi_tuong_id from public.thong_bao
               where nguoi_nhan = t.id('hung') and loai = 'chu_sua_dat_phong'),
              'booking|' || t.b('B1'), 'YC5.6-NT6 YC12 thông báo trỏ tới B1');
select t.ok(not exists (select 1 from public.thong_bao tb where tb.loai = 'chu_sua_dat_phong'
                          and (tb.noi_dung ? 'ten_khach' or tb.noi_dung ? 'sdt_khach' or tb.noi_dung ? 'tien_coc'
                               or tb.noi_dung ? 'gia_ban' or tb.noi_dung ? 'so_khach')),
            'YC5.6 QD11 PQ8.SALE thông báo cho sale không có khách, tiền cọc của chủ nhà');

-- ===== YC5.6-NT5: đổi ngày B1 từ 10/10 → 12/10 sang 11/10 → 13/10 =====
-- Yêu cầu đang chờ của Sale Lan: 12/10 → 13/10 trùng đêm mới; 20/10 → 21/10 không trùng.
select t.tao_yeu_cau('Y1', t.can('1509'), t.id('lan'), '2026-10-12', '2026-10-13');
select t.tao_yeu_cau('Y2', t.can('1509'), t.id('lan'), '2026-10-20', '2026-10-21');
update public.can set lich_doi_luc = '2000-01-01' where id in (t.can('1509'), t.can('3402'));
select t.dang_nhap(t.id('hoa'));
select t.bang(pg_temp.loi(pg_temp.cau_sua(t.b('B1'), p_nhan => '2026-10-11', p_tra => '2026-10-13')), 'qua',
              'YC5.6-NT5 Chị Hoa đổi ngày B1 sang 11/10 → 13/10 thì lưu được');
select t.thoat();
select t.bang(pg_temp.so_tb(t.id('hung')), 2::bigint, 'YC5.6-NT5 Sale Hùng có thêm một thông báo "chủ sửa đặt phòng"');
select t.bang((select (noi_dung->>'ngay_nhan_cu') || '|' || (noi_dung->>'ngay_tra_cu') || '|' || (noi_dung->>'ngay_nhan')
                      || '|' || (noi_dung->>'ngay_tra') || '|' || (noi_dung->>'ma_can')
               from public.thong_bao where nguoi_nhan = t.id('hung') and loai = 'chu_sua_dat_phong'
               order by tao_luc desc, (noi_dung->>'ngay_nhan') desc limit 1),
              '2026-10-10|2026-10-12|2026-10-11|2026-10-13|1509',
              'YC5.6-NT5 thông báo cho Hùng ghi ngày cũ 10/10 → 12/10 và ngày mới 11/10 → 13/10');
select t.bang(pg_temp.dem(t.b('B1')), '11/10:900000,12/10:900000',
              'YC5.6-NT5 QT4.2 đổi ngày: tiền từng đêm theo các đêm mới (tổng bằng bảng giá thì mỗi đêm theo bảng giá)');
select t.bang((select trang_thai from public.yeu_cau_dat_phong where id = t.b('Y1')), 'bi_tu_choi',
              'YC5.6 bước 26 QT1.4 yêu cầu đang chờ trùng đêm mới 12/10 thành bị từ chối');
select t.bang((select trang_thai from public.yeu_cau_dat_phong where id = t.b('Y2')), 'cho',
              'YC5.6 bước 26 QT1.4 yêu cầu đang chờ không trùng đêm mới vẫn chờ');
select t.ok((select lich_doi_luc from public.can where id = t.can('1509')) > '2000-01-01',
            'YC5.6 YC5 Dữ liệu sửa đặt phòng cập nhật giờ lịch đổi của căn');
select t.bang(pg_temp.rieng_hung(), 'Khách Của Hùng|0900000077|3|2600000',
              'YC5.6-NT5 QD11 đổi ngày không đổi phần riêng của Sale Hùng');

-- ===== YC5.6-NT4: đặt phòng 1509 từ 31/10 tới 02/11, tiền 2.200.000đ thành 2.000.000đ =====
select t.dang_nhap(t.id('hoa'));
select set_config('t.ma_b31', coalesce(t.gt($$select public.fn_tao_booking(p_can_id => t.can('1509'), p_ngay_nhan => '2026-10-31',
                                 p_ngay_tra => '2026-11-02', p_tien_phong => 2200000, p_client_id => gen_random_uuid())$$), ''), true);
select t.thoat();
select t.bang(pg_temp.dem(t.b('B31')), '31/10:1300000,01/11:900000', 'YC5.6-NT4 chuẩn bị: ghi theo bảng giá 1.300.000đ và 900.000đ');
select t.dang_nhap(t.id('hoa'));
select t.bang(pg_temp.loi(pg_temp.cau_sua(t.b('B31'), p_tien => 2000000)), 'qua',
              'YC5.6-NT4 Chị Hoa sửa tiền phòng 31/10 → 02/11 thành 2.000.000đ thì lưu được');
select t.thoat();
select t.bang(pg_temp.dem(t.b('B31')), '31/10:1000000,01/11:1000000',
              'YC5.6-NT4 QT4.2-VD1 đêm 31/10 và 01/11 mỗi đêm 1.000.000đ');
select t.bang((select string_agg(to_char(date_trunc('month', d.dem), 'MM') || ':' || s, ',' order by 1)
               from (select date_trunc('month', dem) m, min(dem) dem, sum(tien) s from public.booking_dem
                     where booking_id = t.b('B31') group by 1) d),
              '10:1000000,11:1000000', 'YC5.6-NT4 QT2.2 doanh thu tháng 10 và tháng 11 mỗi tháng nhận 1.000.000đ');
-- YC5-H8: sửa lại đúng tổng bảng giá thì mỗi đêm theo bảng giá.
select t.dang_nhap(t.id('hoa'));
select t.bang(pg_temp.loi(pg_temp.cau_sua(t.b('B31'), p_tien => 2200000)), 'qua', 'YC5.6 YC5-H8 sửa lại tiền 2.200.000đ thì lưu được');
select t.thoat();
select t.bang(pg_temp.dem(t.b('B31')), '31/10:1300000,01/11:900000',
              'YC5.6 YC5-H8 QT4.2-VD3 tiền bằng tổng bảng giá các đêm thì mỗi đêm theo bảng giá');

-- ===== Đổi căn khách lẻ: giờ lịch đổi của căn cũ và căn mới; khách lẻ không ai được báo =====
update public.can set lich_doi_luc = '2000-01-01' where id in (t.can('1509'), t.can('3402'));
select set_config('t.so_tb_tong', (select count(*)::text from public.thong_bao), true);
select t.dang_nhap(t.id('hoa'));
select t.bang(pg_temp.loi(pg_temp.cau_sua(t.b('LE'), p_can => t.can('1509'), p_ten_khach => 'Bà Lan', p_so_khach => 2)), 'qua',
              'YC5.6 Chị Hoa đổi căn khách lẻ từ 3402 sang 1509, thêm tên khách thì lưu được');
select t.thoat();
select t.ok((select bool_and(lich_doi_luc > '2000-01-01') from public.can where id in (t.can('1509'), t.can('3402'))),
            'YC5.6 YC5 Dữ liệu đổi căn thì cập nhật giờ lịch đổi của cả căn cũ và căn mới');
select t.bang((select count(*)::text from public.thong_bao), current_setting('t.so_tb_tong'),
              'YC5.6 YC12.1-NT7 sửa đặt phòng khách lẻ thì không ai có thông báo');
select t.bang((select ten_khach || '|' || so_khach from public.booking_rieng where booking_id = t.b('LE') and nguoi_id = t.id('hoa')),
              'Bà Lan|2', 'YC5.6 PQ9.CHU tên, số khách Chị Hoa nhập lưu vào phần riêng của chị');
select t.bang(pg_temp.dem(t.b('LE')), '03/11:800000', 'YC5.6 QT4.2 đổi căn, tiền khác bảng giá căn mới thì chia đều (1 đêm 800.000đ)');

-- Đặt phòng có sale: tên, số khách chủ nhà gửi kèm không ghi (khách do sale giữ, QD11); số khách ghi phần riêng chủ nhà.
select t.dang_nhap(t.id('hoa'));
select t.bang(pg_temp.loi(pg_temp.cau_sua(t.b('B1'), p_ten_khach => 'Tên Chủ Gõ', p_so_khach => 5)), 'qua',
              'YC5.6 Chị Hoa sửa số khách B1 thì lưu được');
select t.thoat();
select t.bang((select coalesce(ten_khach, '-') || '|' || so_khach from public.booking_rieng
               where booking_id = t.b('B1') and nguoi_id = t.id('hoa')),
              '-|5', 'YC5.6 QD11 đặt phòng có sale: số khách vào phần riêng của chủ nhà, tên khách không ghi');
select t.bang(pg_temp.so_tb(t.id('hung')), 2::bigint, 'YC5.6 YC5-H9 sửa số khách thì Sale Hùng không có thông báo mới');

-- ===== YC5-H6: trạng thái nhớ để hoàn tác =====
update public.booking set trang_thai_tien = 'da_thanh_toan', trang_thai_tien_truoc = 'da_coc' where id = t.b('B1');
select t.dang_nhap(t.id('hoa'));
select t.bang(pg_temp.loi(pg_temp.cau_sua(t.b('B1'), p_ghi_chu => 'Giữ trạng thái tiền.')), 'qua',
              'YC5.6 YC5-H6 sửa ghi chú, giữ "Đã thanh toán" thì lưu được');
select t.thoat();
select t.bang((select trang_thai_tien || '|' || coalesce(trang_thai_tien_truoc, '-') from public.booking where id = t.b('B1')),
              'da_thanh_toan|da_coc', 'YC5.6 YC5-H6 giữ nguyên trạng thái tiền thì trạng thái nhớ còn');
select t.dang_nhap(t.id('hoa'));
select t.bang(pg_temp.loi(pg_temp.cau_sua(t.b('B1'), p_tt => 'da_coc_con_thu', p_coc => 1000000)), 'qua',
              'YC5.6 YC5-H6 đổi trạng thái tiền về "Đã cọc · còn thu" ở form sửa thì lưu được');
select t.thoat();
select t.bang((select trang_thai_tien || '|' || tien_coc || '|' || coalesce(trang_thai_tien_truoc, '-') from public.booking where id = t.b('B1')),
              'da_coc|1000000|-', 'YC5.6 YC5-H6 đổi trạng thái tiền ở form sửa thì bỏ trạng thái nhớ để hoàn tác');
select t.bang(pg_temp.so_tb(t.id('hung')), 2::bigint, 'YC5.6 YC5-H9 đổi trạng thái tiền thì Sale Hùng không có thông báo mới');

-- ===== Luật kiểm khi sửa =====
select set_config('t.ban_b1', pg_temp.ban(t.b('B1')), true);
select t.dang_nhap(t.id('hoa'));
select t.bang(pg_temp.loi(pg_temp.cau_sua(t.b('B1'), p_tien => 0)), 'P0001|Tiền phòng phải lớn hơn 0',
              'YC5.6 YC5-H3 sửa tiền phòng thành 0 thì từ chối "Tiền phòng phải lớn hơn 0"');
select t.bang(pg_temp.loi(pg_temp.cau_sua(t.b('B1'), p_bo_tien => true)), 'P0001|Cần nhập tiền phòng',
              'YC5.6 QT4.1-VD3 sửa bỏ trống tiền phòng thì từ chối "Cần nhập tiền phòng"');
select t.bang(pg_temp.loi(pg_temp.cau_sua(t.b('B1'), p_coc => 5000000)), 'P0001|Tiền cọc không được lớn hơn tiền phòng',
              'YC5.6 kiểm như khi ghi: tiền cọc lớn hơn tiền phòng thì từ chối');
select t.bang(pg_temp.loi(pg_temp.cau_sua(t.b('B1'), p_nhan => '2026-10-13', p_tra => '2026-10-11')), 'P0001|Ngày trả phải sau ngày nhận',
              'YC5.6 kiểm như khi ghi: ngày trả trước ngày nhận thì từ chối');
select t.thoat();
select t.bang(pg_temp.ban(t.b('B1')), current_setting('t.ban_b1'), 'YC5.6 B1 không đổi sau các lệnh sai dữ liệu');

update public.booking set trang_thai = 'da_huy' where id = t.b('B5');
select t.dang_nhap(t.id('hoa'));
select t.bang(pg_temp.loi(pg_temp.cau_sua(t.b('B5'), p_ghi_chu => 'Sửa đặt phòng đã hủy')),
              'P0001|Đặt phòng đã hủy, không sửa được', 'YC5.6 Luật kiểm "Sửa" đặt phòng đã hủy thì từ chối');
select t.thoat();
