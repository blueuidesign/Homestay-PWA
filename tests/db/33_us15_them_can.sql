-- US15 · Thêm căn (YC3.2). Lệnh tạo căn fn_tao_can và trigger thông báo "chủ nhà thêm căn".
-- YC3.2-NT2, NT4, NT5, NT7, NT8, NT9, YC3.2 bước 18, PQ3.CHU, PQ3.SALE, PQ13.CHU, QT5.5, QT5.6, YC3 "Ai được làm gì".
-- Viết trước migration (US15-TA1, CL14.5): task sau không sửa file này.
select t.fixture();

-- Chạy câu lệnh, mong bị từ chối với đúng mã lỗi và đúng câu (QT5.5: câu tiếng Việt, không phải lỗi chung).
create or replace function t.loi_cau(cau text, ma_mong text, cau_mong text, ten text) returns void
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
grant execute on function t.loi_cau(text, text, text, text) to anon, authenticated;

-- Đếm căn chưa ẩn của một người giữ theo mã (bỏ khoảng trắng, không phân biệt hoa thường). Chạy bằng vai chủ database.
create or replace function t.so_can(p_giu uuid, p_ma text) returns bigint
language sql stable as $$
  select count(*) from public.can
  where nguoi_giu = p_giu and an_luc is null and lower(btrim(ma_can)) = lower(btrim(p_ma))
$$;

-- ===== Danh mục: lệnh tạo căn chạy security definer, chỉ người đã đăng nhập gọi được =====
select t.ok(exists (select 1 from pg_proc where proname = 'fn_tao_can' and pronamespace = 'public'::regnamespace and prosecdef),
            'YC3.2 bước 18 danh mục: có lệnh fn_tao_can chạy security definer');
select t.ok(exists (select 1 from pg_proc p where p.proname = 'fn_tao_can' and p.pronamespace = 'public'::regnamespace)
            and not exists (select 1 from pg_proc p where p.proname = 'fn_tao_can' and p.pronamespace = 'public'::regnamespace
                            and has_function_privilege('anon', p.oid, 'execute')),
            'YC3.2-NT7 danh mục: người chưa đăng nhập không có quyền gọi fn_tao_can');
select t.ok(exists (select 1 from pg_proc p where p.proname = 'fn_tao_can' and p.pronamespace = 'public'::regnamespace
                    and has_function_privilege('authenticated', p.oid, 'execute')),
            'YC3.2-NT2 danh mục: người đã đăng nhập gọi được fn_tao_can');
select t.ok(not has_table_privilege('authenticated', 'public.can', 'insert')
            and not has_table_privilege('anon', 'public.can', 'insert'),
            'YC3.2-NT7 danh mục: app không ghi thẳng bảng can (ghi qua fn_tao_can)');
select t.ok(not exists (select 1 from pg_proc p where p.proname = 'fn_tao_can' and p.pronamespace = 'public'::regnamespace
                        and exists (select 1 from unnest(coalesce(p.proargnames, '{}')) a where a ilike '%nguoi%' or a ilike 'p_chu%' or a ilike '%owner%')),
            'YC3.2-NT7 PQ3.CHU lệnh tạo căn không nhận mã người giữ: căn luôn của người gọi');

-- ===== YC3.2-NT2: chỉ mã căn "2105" và "1PN", không phần thêm, không ảnh, thì thêm được =====
select t.dang_nhap(t.id('hoa'));
select set_config('t.ma_can2105',
  coalesce(t.gt($$public.fn_tao_can(p_ma_can => '2105', p_so_phong_ngu => 1,
                                    p_client_id => '00000000-0000-0000-00aa-000000000001')$$), ''), true);
select t.ok(nullif(current_setting('t.ma_can2105', true), '') is not null,
            'YC3.2-NT2 Chị Hoa thêm căn 2105, 1PN (không phần thêm, không ảnh) thì lệnh trả mã căn');
select t.thoat();
select t.bang((select nguoi_giu::text || '|' || loai || '|' || ma_can || '|' || so_phong_ngu
                      || '|' || coalesce(so_giuong::text, '-') || '|' || coalesce(loai_view, '-')
                      || '|' || coalesce(toa_nha_id::text, '-') || '|' || coalesce(mo_ta, '-') || '|' || (an_luc is null)::text
               from public.can where id = nullif(current_setting('t.ma_can2105', true), '')::uuid),
              t.id('hoa')::text || '|co_lich|2105|1|-|-|-|-|true',
              'YC3.2-NT2 căn 2105 ghi với người giữ là Chị Hoa, có lịch, 1 phòng ngủ, các ô không bắt buộc để trống');
select t.bang((select count(*) from public.anh_can where can_id = nullif(current_setting('t.ma_can2105', true), '')::uuid),
              0::bigint, 'YC3.2-NT2 căn 2105 không có ảnh');
select t.dang_nhap(t.id('hoa'));
select t.bang(t.gt($$(select ma_can || '|' || moi_them from public.v_can_cua_toi
                      where id = nullif(current_setting('t.ma_can2105', true), '')::uuid)$$),
              '2105|true', 'YC3.2-NT2 YC3.2 bước 19 căn 2105 có trong danh sách của Chị Hoa, là "Mới thêm"');
select t.bang(t.so('select * from public.v_can_cua_toi'), 3::bigint, 'YC3.2-NT2 Chị Hoa giờ có 3 căn');
select t.thoat();

-- Mã bỏ khoảng trắng đầu cuối trước khi lưu; Studio là 0 phòng ngủ, 4PN+ là 4.
select t.dang_nhap(t.id('hoa'));
select t.khong_loi($$select public.fn_tao_can(p_ma_can => '  Greenbay  ', p_so_phong_ngu => 0,
                                             p_client_id => '00000000-0000-0000-00aa-000000000002')$$,
                   'YC3.2-NT2 mã căn tự do "Greenbay" và Studio (0 phòng ngủ) thì thêm được');
select t.khong_loi($$select public.fn_tao_can(p_ma_can => 'Villa 4PN', p_so_phong_ngu => 4,
                                             p_client_id => '00000000-0000-0000-00aa-000000000003')$$,
                   'YC3.2-NT2 4PN+ (4 phòng ngủ) thì thêm được');
select t.thoat();
select t.bang((select ma_can || '|' || so_phong_ngu from public.can where nguoi_giu = t.id('hoa') and lower(ma_can) = 'greenbay'),
              'Greenbay|0', 'YC3.2 Luật kiểm mã căn lưu đã bỏ khoảng trắng đầu cuối');

-- Phần thêm hợp lệ thì lưu đủ (cùng lệnh dùng ở YC3.4).
select t.dang_nhap(t.id('hoa'));
select t.khong_loi($$select public.fn_tao_can(p_ma_can => '1203', p_so_phong_ngu => 2,
                                             p_client_id => '00000000-0000-0000-00aa-000000000004',
                                             p_so_giuong => 3, p_loai_view => 'bien', p_toa_nha_id => t.toa('icon40'),
                                             p_mo_ta => 'Căn góc, ban công nhìn ra vịnh')$$,
                   'YC3.2-NT2 thêm căn kèm số giường, view, tòa nhà, mô tả hợp lệ thì qua');
select t.thoat();
select t.bang((select so_giuong || '|' || loai_view || '|' || toa_nha_id::text || '|' || mo_ta
               from public.can where nguoi_giu = t.id('hoa') and ma_can = '1203'),
              '3|bien|' || t.toa('icon40')::text || '|Căn góc, ban công nhìn ra vịnh',
              'YC3.2 căn 1203 lưu đủ số giường, loại view, tòa nhà, mô tả');

-- ===== YC3.2-NT4: mã trùng căn chưa xóa của chính người gọi thì từ chối, không có căn mới =====
select t.dang_nhap(t.id('hoa'));
select t.loi_cau($$select public.fn_tao_can(p_ma_can => '1509', p_so_phong_ngu => 2,
                                           p_client_id => '00000000-0000-0000-00aa-000000000010')$$,
                 'P0001', 'Đã có căn 1509. Kiểm tra lại mã căn.',
                 'YC3.2-NT4 Chị Hoa thêm "1509" khi đã có 1509 thì bị từ chối với câu "Đã có căn 1509. Kiểm tra lại mã căn."');
select t.loi_cau($$select public.fn_tao_can(p_ma_can => ' 1509 ', p_so_phong_ngu => 2,
                                           p_client_id => '00000000-0000-0000-00aa-000000000011')$$,
                 'P0001', 'Đã có căn 1509. Kiểm tra lại mã căn.',
                 'YC3.2-NT4 mã " 1509 " (có khoảng trắng đầu cuối) cũng bị từ chối, câu nêu mã đã bỏ khoảng trắng');
select t.loi_cau($$select public.fn_tao_can(p_ma_can => 'GREENBAY', p_so_phong_ngu => 3,
                                           p_client_id => '00000000-0000-0000-00aa-000000000012')$$,
                 'P0001', 'Đã có căn GREENBAY. Kiểm tra lại mã căn.',
                 'YC3.2-NT4 mã viết khác hoa thường ("GREENBAY" khi đã có "Greenbay") cũng bị từ chối');
select t.thoat();
select t.bang(t.so_can(t.id('hoa'), '1509'), 1::bigint, 'YC3.2-NT4 sau khi bị từ chối Chị Hoa vẫn chỉ có một căn 1509');
select t.bang(t.so_can(t.id('hoa'), 'greenbay'), 1::bigint, 'YC3.2-NT4 sau khi bị từ chối Chị Hoa vẫn chỉ có một căn Greenbay');
select t.bang((select count(*) from public.can where client_id in ('00000000-0000-0000-00aa-000000000010',
                 '00000000-0000-0000-00aa-000000000011', '00000000-0000-0000-00aa-000000000012')),
              0::bigint, 'YC3.2-NT4 các lệnh bị từ chối không để lại căn nào');

-- Mã của căn đã xóa (ẩn) dùng lại được (YC3 Quy tắc "Mã căn không trùng").
update public.can set an_luc = now() where id = t.can('3402');
select t.dang_nhap(t.id('hoa'));
select t.khong_loi($$select public.fn_tao_can(p_ma_can => '3402', p_so_phong_ngu => 1,
                                             p_client_id => '00000000-0000-0000-00aa-000000000013')$$,
                   'YC3.2-NT4 mã của căn đã xóa (3402 đã ẩn) thì dùng lại được');
select t.thoat();
select t.bang(t.so_can(t.id('hoa'), '3402'), 1::bigint, 'YC3.2-NT4 có đúng một căn 3402 chưa ẩn sau khi dùng lại mã');

-- ===== YC3.2-NT5: Anh Tuấn thêm "1509" được dù Chị Hoa đã có 1509 =====
select t.dang_nhap(t.id('tuan'));
select set_config('t.ma_tuan1509',
  coalesce(t.gt($$public.fn_tao_can(p_ma_can => '1509', p_so_phong_ngu => 2,
                                    p_client_id => '00000000-0000-0000-00bb-000000000001')$$), ''), true);
select t.ok(nullif(current_setting('t.ma_tuan1509', true), '') is not null,
            'YC3.2-NT5 Anh Tuấn thêm căn 1509 được dù Chị Hoa đã có căn 1509');
select t.thoat();
select t.bang((select nguoi_giu from public.can where id = nullif(current_setting('t.ma_tuan1509', true), '')::uuid),
              t.id('tuan'), 'YC3.2-NT5 căn 1509 mới thuộc Anh Tuấn');
select t.bang(t.so_can(t.id('hoa'), '1509'), 1::bigint, 'YC3.2-NT5 căn 1509 của Chị Hoa không đổi');

-- ===== YC3.2-NT7: Anh Tuấn không thấy căn nào của Chị Hoa; người chưa đăng nhập tạo căn bị từ chối =====
select t.dang_nhap(t.id('tuan'));
select t.bang(t.so($$select * from public.can where nguoi_giu = t.id('hoa')$$), 0::bigint,
              'YC3.2-NT7 PQ3.CHU Anh Tuấn đọc bảng căn không thấy căn nào của Chị Hoa (kể cả căn vừa thêm)');
select t.bang(t.so('select * from public.can'), 2::bigint, 'YC3.2-NT7 Anh Tuấn chỉ thấy 2 căn của mình (1103, 1509 mới)');
select t.bang(t.so($$select * from public.v_can_cua_toi where ma_can = '2105'$$), 0::bigint,
              'YC3.2-NT7 PQ3.CHU căn 2105 của Chị Hoa không có trong danh sách của Anh Tuấn');
select t.loi($$insert into public.can (nguoi_giu, ma_can, so_phong_ngu) values (t.id('tuan'), 'Ghi thẳng', 1)$$, '42501',
             'YC3.2-NT7 Anh Tuấn không ghi thẳng căn vào bảng được');
select t.loi($$insert into public.can (nguoi_giu, ma_can, so_phong_ngu) values (t.id('hoa'), 'Mạo danh', 1)$$, '42501',
             'YC3.2-NT7 PQ3.CHU Anh Tuấn không tạo được căn đứng tên Chị Hoa');
select t.loi($$update public.can set ma_can = 'Đổi' where id = nullif(current_setting('t.ma_can2105', true), '')::uuid$$, '42501',
             'YC3.2-NT7 PQ3.CHU Anh Tuấn không sửa được căn của Chị Hoa');
select t.loi($$delete from public.can where id = nullif(current_setting('t.ma_can2105', true), '')::uuid$$, '42501',
             'YC3.2-NT7 PQ3.CHU Anh Tuấn không xóa được căn của Chị Hoa');
select t.thoat();
select t.bang((select ma_can from public.can where id = nullif(current_setting('t.ma_can2105', true), '')::uuid), '2105',
              'YC3.2-NT7 căn 2105 của Chị Hoa không đổi sau các lệnh của Anh Tuấn');

-- Sale được chia sẻ cũng không tạo căn đứng tên chủ nhà, không sửa căn của chủ (PQ3.SALE).
select t.dang_nhap(t.id('hung'));
select t.loi($$update public.can set ma_can = 'Đổi' where id = t.can('1509')$$, '42501',
             'YC3.2-NT7 PQ3.SALE Sale Hùng được chia sẻ không sửa được căn của Chị Hoa');
select t.thoat();

select t.khach();
select t.loi($$select public.fn_tao_can(p_ma_can => '9999', p_so_phong_ngu => 1,
                                       p_client_id => '00000000-0000-0000-00cc-000000000001')$$, '%',
             'YC3.2-NT7 người chưa đăng nhập gửi lệnh tạo căn thì bị từ chối');
select t.loi($$insert into public.can (nguoi_giu, ma_can, so_phong_ngu) values (t.id('hoa'), '9999', 1)$$, '42501',
             'YC3.2-NT7 người chưa đăng nhập không ghi thẳng căn được');
select t.ok(coalesce(t.so('select * from public.can'), 0) = 0, 'YC3.2-NT7 người chưa đăng nhập không đọc được bảng căn');
select t.thoat();
select t.bang((select count(*) from public.can where ma_can = '9999'), 0::bigint,
              'YC3.2-NT7 không có căn nào do người chưa đăng nhập tạo');

-- Người đã đăng nhập mà không có mã người (jwt thiếu sub) cũng bị từ chối.
select set_config('request.jwt.claims', '{"role":"authenticated"}', true);
select set_config('role', 'authenticated', true);
select t.loi($$select public.fn_tao_can(p_ma_can => '9998', p_so_phong_ngu => 1,
                                       p_client_id => '00000000-0000-0000-00cc-000000000002')$$, '%',
             'YC3.2-NT7 phiên không có người gọi thì lệnh tạo căn bị từ chối');
select t.thoat();

-- ===== YC3.2-NT8: dữ liệu sai thì database từ chối với câu nêu đúng ô sai (mục Luật kiểm) =====
select t.dang_nhap(t.id('hoa'));
select t.loi_cau($$select public.fn_tao_can(p_ma_can => '7001', p_so_phong_ngu => 5,
                                           p_client_id => '00000000-0000-0000-00dd-000000000001')$$,
                 'P0001', 'Số phòng ngủ không hợp lệ', 'YC3.2-NT8 số phòng ngủ 5 thì từ chối "Số phòng ngủ không hợp lệ"');
select t.loi_cau($$select public.fn_tao_can(p_ma_can => '7001', p_so_phong_ngu => -1,
                                           p_client_id => '00000000-0000-0000-00dd-000000000002')$$,
                 'P0001', 'Số phòng ngủ không hợp lệ', 'YC3.2-NT8 số phòng ngủ -1 thì từ chối "Số phòng ngủ không hợp lệ"');
select t.loi_cau($$select public.fn_tao_can(p_ma_can => '7001', p_so_phong_ngu => null,
                                           p_client_id => '00000000-0000-0000-00dd-000000000003')$$,
                 'P0001', 'Cần chọn số phòng ngủ', 'YC3.2-NT8 chưa chọn số phòng ngủ thì từ chối "Cần chọn số phòng ngủ"');
select t.loi_cau($$select public.fn_tao_can(p_ma_can => '7001', p_so_phong_ngu => 2, p_so_giuong => 0,
                                           p_client_id => '00000000-0000-0000-00dd-000000000004')$$,
                 'P0001', 'Số giường từ 1 đến 50', 'YC3.2-NT8 số giường 0 thì từ chối "Số giường từ 1 đến 50"');
select t.loi_cau($$select public.fn_tao_can(p_ma_can => '7001', p_so_phong_ngu => 2, p_so_giuong => 51,
                                           p_client_id => '00000000-0000-0000-00dd-000000000005')$$,
                 'P0001', 'Số giường từ 1 đến 50', 'YC3.2-NT8 số giường 51 thì từ chối "Số giường từ 1 đến 50"');
select t.loi_cau($$select public.fn_tao_can(p_ma_can => '7001', p_so_phong_ngu => 2, p_loai_view => 'vinh',
                                           p_client_id => '00000000-0000-0000-00dd-000000000006')$$,
                 'P0001', 'Loại view không hợp lệ', 'YC3.2-NT8 loại view "vinh" thì từ chối "Loại view không hợp lệ"');
select t.loi_cau($$select public.fn_tao_can(p_ma_can => '7001', p_so_phong_ngu => 2, p_mo_ta => repeat('a', 2001),
                                           p_client_id => '00000000-0000-0000-00dd-000000000007')$$,
                 'P0001', 'Mô tả dài tối đa 2.000 ký tự', 'YC3.2-NT8 mô tả 2.001 ký tự thì từ chối "Mô tả dài tối đa 2.000 ký tự"');
select t.loi_cau($$select public.fn_tao_can(p_ma_can => '', p_so_phong_ngu => 2,
                                           p_client_id => '00000000-0000-0000-00dd-000000000008')$$,
                 'P0001', 'Mã căn không được trống', 'YC3.2-NT8 mã căn trống thì từ chối "Mã căn không được trống"');
select t.loi_cau($$select public.fn_tao_can(p_ma_can => '   ', p_so_phong_ngu => 2,
                                           p_client_id => '00000000-0000-0000-00dd-000000000009')$$,
                 'P0001', 'Mã căn không được trống', 'YC3.2-NT8 mã căn chỉ có khoảng trắng thì từ chối "Mã căn không được trống"');
select t.loi_cau($$select public.fn_tao_can(p_ma_can => null, p_so_phong_ngu => 2,
                                           p_client_id => '00000000-0000-0000-00dd-000000000010')$$,
                 'P0001', 'Mã căn không được trống', 'YC3.2-NT8 mã căn null thì từ chối "Mã căn không được trống"');
select t.loi_cau($$select public.fn_tao_can(p_ma_can => repeat('Ă', 51), p_so_phong_ngu => 2,
                                           p_client_id => '00000000-0000-0000-00dd-000000000011')$$,
                 'P0001', 'Mã căn dài quá 50 ký tự', 'YC3.2-NT8 mã căn 51 ký tự thì từ chối "Mã căn dài quá 50 ký tự"');
select t.loi_cau($$select public.fn_tao_can(p_ma_can => '7001', p_so_phong_ngu => 2,
                                           p_toa_nha_id => '00000000-0000-0000-0002-00000000dead',
                                           p_client_id => '00000000-0000-0000-00dd-000000000012')$$,
                 'P0001', 'Không tìm thấy tòa nhà', 'YC3.2-NT8 tòa nhà không có trong danh sách thì từ chối "Không tìm thấy tòa nhà"');
select t.thoat();
select t.bang((select count(*) from public.can where client_id::text like '00000000-0000-0000-00dd-%'), 0::bigint,
              'YC3.2-NT8 các lệnh sai luật kiểm không để lại căn nào');

-- Biên đúng luật thì qua: mã 50 ký tự (có dấu), số giường 1 và 50, mô tả 2.000 ký tự, view thành phố, núi.
select t.dang_nhap(t.id('hoa'));
select t.khong_loi($$select public.fn_tao_can(p_ma_can => repeat('Ă', 50), p_so_phong_ngu => 2,
                                             p_client_id => '00000000-0000-0000-00ee-000000000001')$$,
                   'YC3.2-NT8 mã căn đúng 50 ký tự có dấu thì qua');
select t.khong_loi($$select public.fn_tao_can(p_ma_can => '7002', p_so_phong_ngu => 2, p_so_giuong => 1, p_loai_view => 'thanh_pho',
                                             p_client_id => '00000000-0000-0000-00ee-000000000002')$$,
                   'YC3.2-NT8 số giường 1, view thành phố thì qua');
select t.khong_loi($$select public.fn_tao_can(p_ma_can => '7003', p_so_phong_ngu => 2, p_so_giuong => 50, p_loai_view => 'nui',
                                             p_mo_ta => repeat('a', 2000),
                                             p_client_id => '00000000-0000-0000-00ee-000000000003')$$,
                   'YC3.2-NT8 số giường 50, view núi, mô tả đúng 2.000 ký tự thì qua');
select t.thoat();

-- ===== YC3.2-NT9: gửi hai lần cùng mã lần gửi thì trả cùng một căn, chỉ có một căn =====
select t.dang_nhap(t.id('hoa'));
select set_config('t.ma_lan2',
  coalesce(t.gt($$public.fn_tao_can(p_ma_can => '2105', p_so_phong_ngu => 1,
                                    p_client_id => '00000000-0000-0000-00aa-000000000001')$$), ''), true);
select t.bang(nullif(current_setting('t.ma_lan2', true), ''), nullif(current_setting('t.ma_can2105', true), ''),
              'YC3.2-NT9 gửi lại lệnh tạo căn 2105 với cùng mã lần gửi thì trả đúng căn đã tạo, không lỗi');
select set_config('t.ma_lan3',
  coalesce(t.gt($$public.fn_tao_can(p_ma_can => '2106', p_so_phong_ngu => 2,
                                    p_client_id => '00000000-0000-0000-00aa-000000000001')$$), ''), true);
select t.bang(nullif(current_setting('t.ma_lan3', true), ''), nullif(current_setting('t.ma_can2105', true), ''),
              'YC3.2-NT9 YC3-H6 cùng mã lần gửi mà khác mã căn vẫn trả căn đã tạo');
select t.thoat();
select t.bang(t.so_can(t.id('hoa'), '2105'), 1::bigint, 'YC3.2-NT9 chỉ có một căn 2105');
select t.bang(t.so_can(t.id('hoa'), '2106'), 0::bigint, 'YC3.2-NT9 YC3-H6 không có căn 2106 tạo từ lần gửi lại');
select t.bang((select ma_can || '|' || so_phong_ngu from public.can
               where id = nullif(current_setting('t.ma_can2105', true), '')::uuid),
              '2105|1', 'YC3.2-NT9 lần gửi lại không sửa căn đã tạo');

-- Mã lần gửi theo từng người: Anh Tuấn dùng trùng mã lần gửi của Chị Hoa vẫn tạo căn của mình, không nhận căn của Chị Hoa.
select t.dang_nhap(t.id('tuan'));
select set_config('t.ma_tuan2105',
  coalesce(t.gt($$public.fn_tao_can(p_ma_can => '2105', p_so_phong_ngu => 1,
                                    p_client_id => '00000000-0000-0000-00aa-000000000001')$$), ''), true);
select t.ok(nullif(current_setting('t.ma_tuan2105', true), '') is not null
            and current_setting('t.ma_tuan2105', true) <> current_setting('t.ma_can2105', true),
            'YC3.2-NT9 PQ3.CHU Anh Tuấn gửi cùng mã lần gửi với Chị Hoa thì có căn riêng, không nhận về căn của Chị Hoa');
select t.thoat();

-- ===== YC3.2 bước 18: trigger ghi thông báo "chủ nhà thêm căn" cho sale được chia sẻ "tất cả căn" =====
select t.bang((select count(*) from public.thong_bao
               where nguoi_nhan = t.id('hung') and loai = 'chu_them_can' and doi_tuong_loai = 'can'
                 and doi_tuong_id = nullif(current_setting('t.ma_can2105', true), '')::uuid),
              1::bigint,
              'YC3.2 bước 18 YC3-H1 Sale Hùng (chia sẻ tất cả căn) có một thông báo chu_them_can về căn 2105, gửi lại không thêm dòng');
select t.bang((select noi_dung->>'ten_chu' || '|' || (noi_dung->>'ma_can') from public.thong_bao
               where nguoi_nhan = t.id('hung') and loai = 'chu_them_can'
                 and doi_tuong_id = nullif(current_setting('t.ma_can2105', true), '')::uuid),
              'Chị Hoa|2105', 'YC3.2 bước 18 YC12 nội dung thông báo có tên hiển thị chủ nhà và mã căn');
select t.ok(not exists (select 1 from public.thong_bao, jsonb_object_keys(noi_dung) k
                        where loai = 'chu_them_can' and (k ilike '%gia%' or k ilike '%tien%' or k ilike '%sdt%' or k ilike '%so_dien%')),
            'YC3.2 bước 18 YC12 "Chép theo quyền người nhận": thông báo thêm căn không có giá, tiền, số điện thoại');
select t.bang((select count(*) from public.thong_bao where nguoi_nhan = t.id('lan') and loai = 'chu_them_can'), 0::bigint,
              'YC3.2 bước 18 Sale Lan (chỉ được chia sẻ vài căn) không có thông báo thêm căn');
select t.bang((select count(*) from public.thong_bao where nguoi_nhan = t.id('hoa') and loai = 'chu_them_can'), 0::bigint,
              'YC3.2 bước 18 YC12 "Không báo cho chính mình": Chị Hoa không nhận thông báo về căn mình thêm');
select t.bang((select count(*) from public.thong_bao
               where loai = 'chu_them_can'
                 and doi_tuong_id in (nullif(current_setting('t.ma_tuan1509', true), '')::uuid,
                                      nullif(current_setting('t.ma_tuan2105', true), '')::uuid)),
              0::bigint, 'YC3.2 bước 18 Anh Tuấn chưa kết nối sale nào: thêm căn không sinh thông báo');
select t.bang((select count(*) from public.thong_bao where loai = 'chu_them_can' and nguoi_nhan = t.id('hung')),
              (select count(*) from public.can where nguoi_giu = t.id('hoa') and loai = 'co_lich'
                 and id not in (t.can('1509'), t.can('3402'))),
              'YC3.2 bước 18 mỗi căn Chị Hoa thêm sinh đúng một thông báo cho Sale Hùng');

-- Sale đọc thông báo của mình qua RLS; sale khác không đọc được (PQ19).
select t.dang_nhap(t.id('hung'));
select t.ok(t.so($$select * from public.thong_bao where loai = 'chu_them_can'$$) >= 1,
            'YC3.2 bước 18 PQ19.SALE Sale Hùng đọc được thông báo thêm căn của mình');
select t.thoat();
select t.dang_nhap(t.id('lan'));
select t.bang(t.so($$select * from public.thong_bao where loai = 'chu_them_can'$$), 0::bigint,
              'YC3.2 bước 18 PQ19.SALE Sale Lan không đọc được thông báo của Sale Hùng');
select t.thoat();

-- PQ3.SALE: chia sẻ "tất cả căn" thì căn mới tự vào Nguồn phòng của Sale Hùng; Sale Lan (vài căn) không thấy.
select t.dang_nhap(t.id('hung'));
select t.bang(t.so($$select * from public.can where id = nullif(current_setting('t.ma_can2105', true), '')::uuid$$), 1::bigint,
              'YC3.2 bước 18 PQ3.SALE Sale Hùng (tất cả căn) thấy căn 2105 vừa thêm');
select t.thoat();
select t.dang_nhap(t.id('lan'));
select t.bang(t.so($$select * from public.can where id = nullif(current_setting('t.ma_can2105', true), '')::uuid$$), 0::bigint,
              'YC3.2 bước 18 PQ3.SALE Sale Lan (chỉ 1509) không thấy căn 2105');
select t.thoat();

-- Kết nối đã ngừng thì không báo.
update public.ket_noi set trang_thai = 'chu_ngung' where id = t.kn('hoa', 'hung');
select t.dang_nhap(t.id('hoa'));
select set_config('t.ma_sau_ngung',
  coalesce(t.gt($$public.fn_tao_can(p_ma_can => '8001', p_so_phong_ngu => 1,
                                    p_client_id => '00000000-0000-0000-00ff-000000000001')$$), ''), true);
select t.thoat();
select t.ok(nullif(current_setting('t.ma_sau_ngung', true), '') is not null
            and not exists (select 1 from public.thong_bao
                            where doi_tuong_id = nullif(current_setting('t.ma_sau_ngung', true), '')::uuid),
            'YC3.2 bước 18 chủ nhà đã ngừng cho Sale Hùng xem lịch thì thêm căn không báo Sale Hùng');
