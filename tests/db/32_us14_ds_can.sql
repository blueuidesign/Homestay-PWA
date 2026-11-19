-- US14 · Danh sách căn của chủ nhà (YC3.1 bước 9 đến 12). View v_can_cua_toi đọc qua RLS sẵn có.
-- YC3.1-NT2, PQ3.CHU, PQ3.SALE, PQ13.SALE, YC3 "Ai được làm gì", GD14.
select t.fixture();

-- ===== Danh mục: view chạy bằng quyền người gọi, chỉ authenticated đọc =====
select t.ok(exists (select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace
                    where n.nspname = 'public' and c.relname = 'v_can_cua_toi' and c.relkind = 'v'
                      and 'security_invoker=true' = any (coalesce(c.reloptions, '{}'))),
            'YC3.1-NT2 danh mục: v_can_cua_toi chạy bằng quyền người gọi (qua RLS của can, anh_can, booking)');
select t.ok(not has_table_privilege('anon', 'public.v_can_cua_toi', 'select'),
            'YC3.1-NT2 danh mục: người chưa đăng nhập không đọc v_can_cua_toi');
select t.ok(not has_table_privilege('authenticated', 'public.v_can_cua_toi', 'insert')
            and not has_table_privilege('authenticated', 'public.v_can_cua_toi', 'update')
            and not has_table_privilege('authenticated', 'public.v_can_cua_toi', 'delete'),
            'YC3.1-NT2 danh mục: app không ghi qua v_can_cua_toi');

-- ===== YC3.1-NT2: Chị Hoa có 2 căn thì thấy đúng 2 căn; căn của Anh Tuấn không có =====
select t.dang_nhap(t.id('hoa'));
select t.bang(t.so('select * from public.v_can_cua_toi'), 2::bigint, 'YC3.1-NT2 Chị Hoa thấy đúng 2 căn');
select t.bang(t.so($$select * from public.v_can_cua_toi where id in (t.can('1509'), t.can('3402'))$$), 2::bigint,
              'YC3.1-NT2 hai căn của Chị Hoa là 1509 và 3402');
select t.bang(t.so($$select * from public.v_can_cua_toi where id = t.can('1103')$$), 0::bigint,
              'YC3.1-NT2 PQ3.CHU căn 1103 của Anh Tuấn không có trong danh sách của Chị Hoa');
select t.bang(t.gt($$(select ma_can || '|' || so_phong_ngu || '|' || so_giuong || '|' || ten_toa
                      from public.v_can_cua_toi where id = t.can('1509'))$$),
              '1509|2|3|ICON40', 'YC3.1 bước 10 thẻ 1509 có mã, số phòng ngủ, số giường, tên tòa');
select t.thoat();

select t.dang_nhap(t.id('tuan'));
select t.bang(t.so('select * from public.v_can_cua_toi'), 1::bigint, 'YC3.1-NT2 Anh Tuấn chỉ thấy 1 căn của mình');
select t.bang(t.so($$select * from public.v_can_cua_toi where id in (t.can('1509'), t.can('3402'))$$), 0::bigint,
              'YC3.1-NT2 PQ3.CHU Anh Tuấn không thấy căn của Chị Hoa');
select t.thoat();

-- PQ3.SALE: Sale Hùng được chia sẻ mọi căn của Chị Hoa nhưng danh sách "Căn của tôi" không có căn đó.
-- PQ13: căn tự nhập của Hùng không phải căn có lịch, không vào danh sách này.
select t.dang_nhap(t.id('hung'));
select t.bang(t.so('select * from public.v_can_cua_toi'), 0::bigint,
              'YC3.1-NT2 PQ3.SALE sale được chia sẻ căn của Chị Hoa không thấy căn đó trong "Căn của tôi"');
select t.thoat();

select t.dang_nhap(t.id('nga'));
select t.bang(t.so('select * from public.v_can_cua_toi'), 0::bigint, 'YC3.1-NT2 người chưa có căn: danh sách trống (A4)');
select t.thoat();

-- Người chưa đăng nhập không đọc được.
set local role anon;
select t.ok(coalesce(t.so('select * from public.v_can_cua_toi'), 0) = 0,
            'YC3.1-NT2 người chưa đăng nhập không đọc được danh sách căn');
reset role;

-- ===== YC3.1 bước 9: căn đã ẩn không có trong danh sách =====
update public.can set an_luc = now() where id = t.can('3402');
select t.dang_nhap(t.id('hoa'));
select t.bang(t.so('select * from public.v_can_cua_toi'), 1::bigint, 'YC3.1 bước 9 căn đã ẩn không có trong danh sách');
select t.thoat();
update public.can set an_luc = null where id = t.can('3402');

-- ===== YC3.1 bước 9, 11: số ảnh, ảnh đại diện là ảnh thứ tự 1; ảnh tạm không tính =====
insert into public.anh_can (can_id, nguoi_tai, duong_dan, thu_tu)
select t.can('1509'), t.id('hoa'), t.id('hoa') || '/1509-' || i || '.jpg', i from generate_series(1, 5) i;
insert into public.anh_can (can_id, nguoi_tai, duong_dan, thu_tu) values (null, t.id('hoa'), t.id('hoa') || '/tam.jpg', null);
insert into public.anh_can (can_id, nguoi_tai, duong_dan, thu_tu) values (t.can('1103'), t.id('tuan'), t.id('tuan') || '/1103-1.jpg', 1);
select t.dang_nhap(t.id('hoa'));
select t.bang(t.gt($$(select so_anh from public.v_can_cua_toi where id = t.can('1509'))$$), '5',
              'YC3.1-NT5 căn 1509 có 5 ảnh: danh sách ghi 5 ảnh (ảnh tạm không tính)');
select t.bang(t.gt($$(select anh_dai_dien from public.v_can_cua_toi where id = t.can('1509'))$$),
              t.id('hoa') || '/1509-1.jpg', 'YC3.1 bước 9 ảnh đại diện là ảnh thứ tự 1');
select t.bang(t.gt($$(select so_anh || '|' || coalesce(anh_dai_dien, 'khong') from public.v_can_cua_toi where id = t.can('3402'))$$),
              '0|khong', 'YC3.1 bước 11 căn chưa có ảnh: 0 ảnh, không có ảnh đại diện');
select t.thoat();

-- ===== YC3.1 bước 10: tình trạng hôm nay theo giờ Việt Nam =====
-- 1509: có khách ở đêm hôm nay, trả phòng ngày mai + 1. 3402: khách trả sáng nay (đêm hôm nay trống).
select t.tao_booking('B1', t.can('1509'), public.local_today() - 1, public.local_today() + 2, 2700000);
select t.tao_booking('B2', t.can('3402'), public.local_today() - 2, public.local_today(), 1600000);
select t.tao_booking('B3', t.can('1103'), public.local_today(), public.local_today() + 1, 700000);
select t.dang_nhap(t.id('hoa'));
select t.bang(t.gt($$(select khach_den from public.v_can_cua_toi where id = t.can('1509'))$$),
              (public.local_today() + 2)::text, 'YC3.1 bước 10 căn có đêm hôm nay: ngày trả của đặt phòng đó');
select t.bang(t.gt($$(select coalesce(khach_den::text, 'trong') from public.v_can_cua_toi where id = t.can('3402'))$$),
              'trong', 'YC3.1 bước 10 khách trả phòng hôm nay thì đêm nay trống');
select t.thoat();
update public.booking set trang_thai = 'da_huy' where id = t.b('B1');
select t.dang_nhap(t.id('hoa'));
select t.bang(t.gt($$(select coalesce(khach_den::text, 'trong') from public.v_can_cua_toi where id = t.can('1509'))$$),
              'trong', 'YC3.1 bước 10 đặt phòng đã hủy không tính');
select t.thoat();

-- ===== YC3.1 bước 12, GD14: "Mới thêm" khi căn tạo trong 24 giờ qua =====
update public.can set tao_luc = now() - interval '2 days' where id = t.can('1509');
update public.can set tao_luc = now() - interval '1 hour' where id = t.can('3402');
select t.dang_nhap(t.id('hoa'));
select t.bang(t.gt($$(select string_agg(ma_can || ':' || moi_them, ',' order by tao_luc desc) from public.v_can_cua_toi)$$),
              '3402:true,1509:false', 'YC3.1 bước 12 GD14 căn tạo 1 giờ trước là mới thêm, 2 ngày trước thì không');
select t.thoat();

-- ===== PQ3.CHU: sale đọc view không lộ đặt phòng; chủ khác không thấy ảnh, tình trạng căn người khác =====
select t.dang_nhap(t.id('tuan'));
select t.bang(t.gt($$(select so_anh || '|' || khach_den from public.v_can_cua_toi where id = t.can('1103'))$$),
              '1|' || (public.local_today() + 1)::text, 'YC3.1-NT2 Anh Tuấn thấy ảnh và tình trạng căn của mình');
select t.thoat();
