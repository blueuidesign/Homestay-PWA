-- US41 · Phạm vi "tất cả căn" và căn mới (YC6.7). Căn mới của chủ nhà tự vào phạm vi của sale kết nối "tất cả căn",
-- không ghi thêm gì vào kết nối; sale theo danh sách căn không thấy căn mới (QD8, YC6.6-NT2).
-- YC6.7-NT1, PQ3.SALE, PQ4.SALE, PQ17, thiet-ke-db.md mục 3 bất biến 3. Viết trước code (US41-TA1, CL14.5).
-- Fixture: Sale Hùng kết nối Chị Hoa "tất cả căn"; Sale Lan kết nối Chị Hoa chỉ 1509.
select t.fixture();
-- Kết nối có từ trước khi thêm căn (cả file chạy trong một giao dịch nên now() không đổi; lùi lúc tạo kết nối và căn cũ một ngày).
update public.ket_noi set tao_luc = now() - interval '1 day', sua_luc = now() - interval '1 day' where chu_id = t.id('hoa');
update public.can set tao_luc = now() - interval '2 days' where nguoi_giu = t.id('hoa');

-- Trước khi thêm căn.
select t.dang_nhap(t.id('hung'));
select t.bang(t.so('select * from public.my_shared_can_ids()'), 2::bigint,
              'YC6.7-NT1 trước khi Chị Hoa thêm căn, Sale Hùng thấy 2 căn của Chị Hoa');
select t.thoat();
select set_config('t.so_kn_truoc', (select count(*) from public.ket_noi)::text, true);
select set_config('t.so_kn_can_truoc', (select count(*) from public.ket_noi_can)::text, true);

-- Chị Hoa thêm căn 2105.
select t.dang_nhap(t.id('hoa'));
select set_config('t.can2105',
  coalesce(t.gt($$public.fn_tao_can(p_ma_can => '2105', p_so_phong_ngu => 1,
                                    p_client_id => '00000000-0000-0000-00bb-000000000041')$$), ''), true);
select t.thoat();
select t.ok(nullif(current_setting('t.can2105', true), '') is not null, 'YC6.7-NT1 chuẩn bị: Chị Hoa thêm được căn 2105');

-- YC6.7-NT1: Hùng thấy 2105 mà không mở lại link, không có dòng kết nối mới.
select t.dang_nhap(t.id('hung'));
select t.bang(t.so($$select * from public.my_shared_can_ids() x where x = nullif(current_setting('t.can2105', true), '')::uuid$$),
              1::bigint, 'YC6.7-NT1 Sale Hùng (tất cả căn) thấy căn 2105 vừa thêm trong căn được chia sẻ');
select t.bang(t.so($$select 1 from public.can where id = nullif(current_setting('t.can2105', true), '')::uuid$$),
              1::bigint, 'YC6.7-NT1 PQ3.SALE Sale Hùng đọc được dòng căn 2105 qua RLS');
select t.bang(public.o_lich(nullif(current_setting('t.can2105', true), '')::uuid, public.local_today() + 3) is not null, true,
              'YC6.7-NT1 PQ4.SALE Sale Hùng xem được ô lịch của 2105');
select t.thoat();
select t.bang((select count(*) from public.ket_noi)::text || '|' || (select count(*) from public.ket_noi_can)::text,
              current_setting('t.so_kn_truoc', true) || '|' || current_setting('t.so_kn_can_truoc', true),
              'YC6.7-NT1 bước 1: thêm căn không ghi thêm gì vào kết nối và danh sách căn của kết nối');

-- Sale Lan (chỉ 1509) không thấy 2105.
select t.dang_nhap(t.id('lan'));
select t.bang(t.so($$select 1 from public.can where id = nullif(current_setting('t.can2105', true), '')::uuid$$),
              0::bigint, 'YC6.7-NT1 PQ3.SALE Sale Lan (chỉ 1509) không đọc được căn 2105');
select t.thoat();

-- Hùng bị ngừng thì không còn thấy căn mới.
update public.ket_noi set trang_thai = 'chu_ngung' where id = t.kn('hoa', 'hung');
select t.dang_nhap(t.id('hung'));
select t.bang(t.so($$select 1 from public.can where id = nullif(current_setting('t.can2105', true), '')::uuid$$),
              0::bigint, 'YC6.7-NT1 PQ17 khi Chị Hoa ngừng Sale Hùng thì Hùng không còn đọc được căn 2105');
select t.thoat();
