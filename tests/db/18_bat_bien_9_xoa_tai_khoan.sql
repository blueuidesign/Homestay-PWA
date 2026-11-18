-- KT-DB.3.9 · Xóa tài khoản chỉ xóa số điện thoại và đặt profiles.da_xoa_luc. Căn, lịch, giá, booking giữ nguyên;
-- sale thôi thấy căn của chủ đã xóa tài khoản, vẫn thấy booking cũ của mình (QD13, PQ23).
select t.fixture();

select t.tao_booking('B1', t.can('1509'), '2026-10-10', '2026-10-12', 2200000, t.id('hung'), 'tu_yeu_cau');
select t.tao_booking('B5', t.can('1509'), '2026-10-13', '2026-10-15', 1800000);

-- Ràng buộc profiles.
select t.loi($$update public.profiles set da_xoa_luc = now() where id = t.id('hoa')$$, '23514',
             'KT-DB.3.9 QD13 đã xóa tài khoản mà còn số điện thoại bị từ chối');
select t.ok(t.ma_loi($$update public.profiles set dem_cuoi_tuan = '{}' where id = t.id('hoa')$$) like '23%',
            'KT-DB.3.9 dem_cuoi_tuan phải có ít nhất một đêm');
select t.bang(t.gt($$select dem_cuoi_tuan from public.profiles where id = t.id('hoa')$$), '{5,6}',
              'KT-DB.3.9 dem_cuoi_tuan mặc định là thứ 6, thứ 7 (isodow 5, 6)');

-- Hồ sơ: mỗi người chỉ đọc dòng của mình.
select t.dang_nhap(t.id('hung'));
select t.bang(t.so('select * from public.profiles'), 1::bigint, 'KT-DB.3.9 PQ1.SALE Hùng chỉ đọc hồ sơ của mình');
select t.bang(t.so($$select * from public.v_nguoi_ket_noi where id = t.id('hoa') and so_dien_thoai = '0900000001'
                     and da_xoa_tai_khoan = false$$), 1::bigint,
              'KT-DB.3.9 PQ2.SALE trước khi xóa: Hùng thấy số Chị Hoa qua v_nguoi_ket_noi');
select t.bang(t.so('select * from public.v_nguoi_ket_noi'), 1::bigint, 'KT-DB.3.9 PQ17.SALE Hùng chỉ thấy người đã kết nối (Chị Hoa)');
select t.thoat();
select t.dang_nhap(t.id('hoa'));
select t.bang(t.so('select * from public.v_nguoi_ket_noi'), 2::bigint, 'KT-DB.3.9 PQ1.CHU Chị Hoa thấy 2 sale đã kết nối (hai chiều)');
select t.thoat();
select t.dang_nhap(t.id('nga'));
select t.ok(coalesce(t.so('select * from public.v_nguoi_ket_noi'), 0) = 0, 'KT-DB.3.9 PQ2.SALE Nga chưa kết nối không thấy ai');
select t.thoat();
select t.bang((select count(*) from information_schema.columns where table_schema = 'public' and table_name = 'v_nguoi_ket_noi'
               and column_name in ('id', 'ten_hien_thi', 'so_dien_thoai', 'da_xoa_tai_khoan')),
              4::bigint, 'KT-DB.3.9 v_nguoi_ket_noi có đủ cột của hợp đồng');

-- Chị Hoa xóa tài khoản: xóa số, đặt da_xoa_luc.
select t.khong_loi($$update public.profiles set so_dien_thoai = null, da_xoa_luc = now() where id = t.id('hoa')$$,
             'KT-DB.3.9 QD13 xóa tài khoản: bỏ số điện thoại và đặt da_xoa_luc');

-- Dữ liệu giữ nguyên.
select t.bang((select count(*) from public.can where nguoi_giu = t.id('hoa')), 2::bigint, 'KT-DB.3.9 QD13 căn của Chị Hoa còn nguyên');
select t.bang((select count(*) from public.gia_thang where can_id in (t.can('1509'), t.can('3402'))), 6::bigint, 'KT-DB.3.9 QD13 giá của Chị Hoa còn nguyên');
select t.bang((select count(*) from public.booking where can_id = t.can('1509')), 2::bigint, 'KT-DB.3.9 QD13 booking của Chị Hoa còn nguyên');
select t.bang((select ten_hien_thi from public.profiles where id = t.id('hoa')), 'Chị Hoa', 'KT-DB.3.9 QD13 tên hiển thị giữ nguyên');
select t.bang((select count(*) from public.ket_noi where chu_id = t.id('hoa')), 2::bigint, 'KT-DB.3.9 QD13 dòng kết nối giữ nguyên');

-- Chủ vẫn đọc dữ liệu của mình (đăng nhập lại thấy lại dữ liệu cũ, PQ23.LINK).
select t.dang_nhap(t.id('hoa'));
select t.bang(t.so('select * from public.can'), 2::bigint, 'KT-DB.3.9 PQ23.LINK chủ đã xóa tài khoản vẫn đọc căn của mình');
select t.bang(t.so('select * from public.booking'), 2::bigint, 'KT-DB.3.9 PQ23.LINK chủ đã xóa tài khoản vẫn đọc booking của mình');
select t.thoat();

-- Sale thôi thấy căn, giá, lịch của chủ đã xóa tài khoản; vẫn thấy booking cũ của mình.
select t.dang_nhap(t.id('hung'));
select t.bang(t.so('select * from public.my_shared_can_ids()'), 0::bigint, 'KT-DB.3.9 PQ23.SALE chủ đã xóa tài khoản: không còn căn được chia sẻ');
select t.ok(coalesce(t.so($$select * from public.can where nguoi_giu = t.id('hoa')$$), 0) = 0, 'KT-DB.3.9 PQ23.SALE Hùng không đọc căn của chủ đã xóa tài khoản');
select t.ok(coalesce(t.so('select * from public.gia_thang'), 0) = 0, 'KT-DB.3.9 PQ23.SALE Hùng không đọc giá của chủ đã xóa tài khoản');
select t.ok(coalesce(t.so('select * from public.gia_dip'), 0) = 0, 'KT-DB.3.9 PQ23.SALE Hùng không đọc giá dịp của chủ đã xóa tài khoản');
select t.ok(coalesce(t.so('select * from public.anh_can'), 0) = 0, 'KT-DB.3.9 PQ23.SALE Hùng không đọc ảnh căn của chủ đã xóa tài khoản');
select t.ok(coalesce(t.so('select * from public.v_lich_sale'), 0) = 0, 'KT-DB.3.9 PQ23.SALE Hùng không thấy lịch của chủ đã xóa tài khoản');
select t.bang(t.gt($$coalesce(public.o_lich(t.can('1509'), '2026-10-10'), 'null')$$), 'null', 'KT-DB.3.9 PQ23.SALE o_lich căn của chủ đã xóa tài khoản trả null');
select t.bang(t.so('select * from public.v_booking_cua_sale'), 1::bigint, 'KT-DB.3.9 PQ23.SALE Hùng vẫn thấy booking cũ với chủ đã xóa tài khoản');
select t.bang(t.so($$select * from public.v_nguoi_ket_noi where id = t.id('hoa') and so_dien_thoai is null and da_xoa_tai_khoan$$), 1::bigint,
              'KT-DB.3.9 PQ23.SALE v_nguoi_ket_noi: chủ đã xóa tài khoản không có số điện thoại, cờ da_xoa_tai_khoan bật');
select t.thoat();
select t.dang_nhap(t.id('lan'));
select t.bang(t.so('select * from public.my_shared_can_ids()'), 0::bigint, 'KT-DB.3.9 PQ23.SALE Lan cũng thôi thấy 1509');
select t.thoat();

-- Đăng nhập lại cho lại số: sale lại thấy căn theo kết nối cũ (PQ23.LINK).
update public.profiles set so_dien_thoai = '0900000001', da_xoa_luc = null where id = t.id('hoa');
select t.dang_nhap(t.id('hung'));
select t.bang(t.so('select * from public.my_shared_can_ids()'), 2::bigint, 'KT-DB.3.9 PQ23.LINK chủ dùng lại: Hùng lại thấy căn theo kết nối cũ');
select t.thoat();

-- Sale xóa tài khoản: chủ thấy sale đó không còn số điện thoại.
update public.profiles set so_dien_thoai = null, da_xoa_luc = now() where id = t.id('hung');
select t.dang_nhap(t.id('hoa'));
select t.bang(t.so($$select * from public.v_nguoi_ket_noi where id = t.id('hung') and so_dien_thoai is null and da_xoa_tai_khoan$$), 1::bigint,
              'KT-DB.3.9 PQ23.CHU sale đã xóa tài khoản: v_nguoi_ket_noi không có số, cờ bật');
select t.bang(t.so('select * from public.booking'), 2::bigint, 'KT-DB.3.9 PQ23.CHU booking với sale đã xóa tài khoản còn nguyên');
select t.thoat();
