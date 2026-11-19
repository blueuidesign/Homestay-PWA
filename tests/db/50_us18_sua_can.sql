-- US18 · Sửa căn (YC3.5). Lệnh sửa căn fn_sua_can(p_can_id, p_sua jsonb): chỉ người giữ căn, căn chưa ẩn; chỉ ghi
-- khóa có trong p_sua (khóa có mà giá trị null là bỏ giá trị đó); "anh" là danh sách ảnh mới đầy đủ theo thứ tự.
-- YC3.5-NT2, NT3, NT4, NT5, YC3.5 bước 39, 40, PQ3.CHU, PQ3.SALE, PQ13.CHU, QT5.5, QT5.7, YC3 "Ai được làm gì".
-- Viết trước migration (US18-TA1, CL14.5): task sau không sửa file này.
select t.fixture();

-- Chạy câu lệnh, mong bị từ chối với đúng mã lỗi và đúng câu (QT5.5).
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

-- Ảnh đã gắn sẵn vào một căn (dựng bằng vai chủ database, như căn đã lưu ảnh ở US16). Trả id ảnh.
create or replace function t.anh_gan(nguoi text, p_can uuid, ten text, thu_tu int) returns uuid
language plpgsql as $$
declare v uuid; dd text := t.id(nguoi)::text || '/' || ten;
begin
  insert into storage.objects (bucket_id, name, owner, metadata)
  values ('anh-can', dd, t.id(nguoi), '{"size": 350000, "mimetype": "image/jpeg"}') on conflict do nothing;
  insert into public.anh_can (can_id, nguoi_tai, duong_dan, thu_tu) values (p_can, t.id(nguoi), dd, thu_tu) returning id into v;
  return v;
end $$;

-- Ảnh tạm (chưa gắn căn) của một người. Trả id ảnh.
create or replace function t.anh_tam_us18(nguoi text, ten text) returns uuid
language plpgsql as $$
declare v uuid; dd text := t.id(nguoi)::text || '/' || ten;
begin
  insert into storage.objects (bucket_id, name, owner, metadata)
  values ('anh-can', dd, t.id(nguoi), '{"size": 350000, "mimetype": "image/jpeg"}') on conflict do nothing;
  insert into public.anh_can (can_id, nguoi_tai, duong_dan) values (null, t.id(nguoi), dd) returning id into v;
  return v;
end $$;

-- Ảnh của một căn theo thứ tự, dạng 'tên1,tên2,...' (tên file không có thư mục). Chạy bằng vai chủ database.
create or replace function t.thu_tu_anh(p_can uuid) returns text
language sql stable as $$
  select coalesce(string_agg(split_part(duong_dan, '/', 2), ',' order by thu_tu), '')
  from public.anh_can where can_id = p_can
$$;

-- Toàn bộ thông tin một căn dạng chữ, để so "không đổi". Chạy bằng vai chủ database.
create or replace function t.can_chu(p_can uuid) returns text
language sql stable as $$
  select ma_can || '|' || coalesce(so_phong_ngu::text, '-') || '|' || coalesce(so_giuong::text, '-')
         || '|' || coalesce(loai_view, '-') || '|' || coalesce(toa_nha_id::text, '-') || '|' || coalesce(mo_ta, '-')
         || '|' || (an_luc is null)::text || '|' || t.thu_tu_anh(id)
  from public.can where id = p_can
$$;

grant execute on all functions in schema t to anon, authenticated;

-- Dữ liệu riêng của file: 1509 có view biển, mô tả, 3 ảnh; 3402 có 1 ảnh; Anh Tuấn có một ảnh tạm.
update public.can set loai_view = 'bien', mo_ta = 'Căn góc tầng 15' where id = t.can('1509');
select set_config('t.a1', t.anh_gan('hoa', t.can('1509'), 'a1.jpg', 1)::text, true);
select set_config('t.a2', t.anh_gan('hoa', t.can('1509'), 'a2.jpg', 2)::text, true);
select set_config('t.a3', t.anh_gan('hoa', t.can('1509'), 'a3.jpg', 3)::text, true);
select set_config('t.b1', t.anh_gan('hoa', t.can('3402'), 'b1.jpg', 1)::text, true);
select set_config('t.tuan_tam', t.anh_tam_us18('tuan', 'tuan-tam.jpg')::text, true);
select set_config('t.can1509_dau', t.can_chu(t.can('1509')), true);
select set_config('t.can3402_dau', t.can_chu(t.can('3402')), true);

-- ===== Danh mục: lệnh sửa căn chạy security definer, chỉ người đã đăng nhập gọi được =====
select t.ok(exists (select 1 from pg_proc where proname = 'fn_sua_can' and pronamespace = 'public'::regnamespace and prosecdef),
            'YC3.5 bước 39 danh mục: có lệnh fn_sua_can chạy security definer');
select t.ok(exists (select 1 from pg_proc p where p.proname = 'fn_sua_can' and p.pronamespace = 'public'::regnamespace
                    and has_function_privilege('authenticated', p.oid, 'execute'))
            and not exists (select 1 from pg_proc p where p.proname = 'fn_sua_can' and p.pronamespace = 'public'::regnamespace
                            and (has_function_privilege('anon', p.oid, 'execute')
                                 or has_function_privilege('public', p.oid, 'execute'))),
            'YC3.5-NT5 danh mục: người chưa đăng nhập không có quyền gọi fn_sua_can, người đã đăng nhập gọi được');
select t.ok(not has_table_privilege('authenticated', 'public.can', 'update')
            and not has_table_privilege('anon', 'public.can', 'update'),
            'YC3.5-NT5 danh mục: app không sửa thẳng bảng can (sửa qua fn_sua_can)');
select t.ok(not exists (select 1 from pg_proc p where p.proname = 'fn_sua_can' and p.pronamespace = 'public'::regnamespace
                        and exists (select 1 from unnest(coalesce(p.proargnames, '{}')) a where a ilike '%nguoi%' or a ilike '%owner%')),
            'YC3.5-NT5 PQ3.CHU lệnh sửa căn không nhận mã người giữ: chỉ sửa được căn của người gọi');

-- ===== YC3.5-NT5: Sale Hùng (được chia sẻ 1509), Sale Lan, Anh Tuấn gửi lệnh sửa 1509 thì bị từ chối =====
select t.dang_nhap(t.id('hung'));
select t.bang(t.so($$select * from public.can where id = t.can('1509')$$), 1::bigint,
              'YC3.5-NT5 PQ3.SALE Sale Hùng đọc được 1509 (được chia sẻ), để chắc lệnh sửa bị chặn vì quyền ghi, không vì không thấy');
select t.loi($$select public.fn_sua_can(p_can_id => t.can('1509'), p_sua => '{"so_giuong": 1, "mo_ta": "Hùng sửa"}'::jsonb)$$,
             '42501', 'YC3.5-NT5 PQ3.SALE Sale Hùng (được chia sẻ 1509) gửi lệnh sửa căn 1509 thì bị từ chối');
select t.loi($$select public.fn_sua_can(p_can_id => t.can('1509'), p_sua => '{"ma_can": "Của Hùng"}'::jsonb)$$,
             '42501', 'YC3.5-NT5 PQ3.SALE Sale Hùng đổi mã căn 1509 thì bị từ chối');
select t.loi(format($$select public.fn_sua_can(p_can_id => t.can('1509'), p_sua => jsonb_build_object('anh', jsonb_build_array(%L, %L, %L)))$$,
                    current_setting('t.a3'), current_setting('t.a2'), current_setting('t.a1')),
             '42501', 'YC3.5-NT5 PQ3.SALE Sale Hùng đổi thứ tự ảnh căn 1509 thì bị từ chối');
select t.loi($$update public.can set so_giuong = 1 where id = t.can('1509')$$, '42501',
             'YC3.5-NT5 PQ3.SALE Sale Hùng không sửa thẳng bảng căn được');
select t.thoat();

select t.dang_nhap(t.id('lan'));
select t.loi($$select public.fn_sua_can(p_can_id => t.can('1509'), p_sua => '{"so_giuong": 1}'::jsonb)$$,
             '42501', 'YC3.5-NT5 PQ3.SALE Sale Lan (chỉ được chia sẻ 1509) gửi lệnh sửa 1509 thì bị từ chối');
select t.thoat();

select t.dang_nhap(t.id('tuan'));
select t.loi($$select public.fn_sua_can(p_can_id => t.can('1509'), p_sua => '{"so_giuong": 1, "mo_ta": "Tuấn sửa"}'::jsonb)$$,
             '42501', 'YC3.5-NT5 PQ3.CHU Anh Tuấn (chủ nhà khác) gửi lệnh sửa căn 1509 thì bị từ chối');
select t.loi(format($$select public.fn_sua_can(p_can_id => t.can('1509'), p_sua => jsonb_build_object('anh', jsonb_build_array(%L)))$$,
                    current_setting('t.tuan_tam')),
             '42501', 'YC3.5-NT5 PQ3.CHU Anh Tuấn gắn ảnh của mình vào căn 1509 của Chị Hoa thì bị từ chối');
select t.loi($$update public.can set so_giuong = 1 where id = t.can('1509')$$, '42501',
             'YC3.5-NT5 PQ3.CHU Anh Tuấn không sửa thẳng bảng căn được');
select t.thoat();

select t.khach();
select t.ok(t.ma_loi($$select public.fn_sua_can(p_can_id => t.can('1509'), p_sua => '{"so_giuong": 1}'::jsonb)$$) is not null,
            'YC3.5-NT5 người chưa đăng nhập gửi lệnh sửa căn 1509 thì bị từ chối');
select t.thoat();

select t.bang(t.can_chu(t.can('1509')), current_setting('t.can1509_dau'),
              'YC3.5-NT5 sau các lệnh bị từ chối căn 1509 không đổi (mã, phòng ngủ, giường, view, tòa, mô tả, ảnh)');
select t.bang((select nguoi_tai::text || '|' || coalesce(can_id::text, 'tam') from public.anh_can where id = current_setting('t.tuan_tam')::uuid),
              t.id('tuan')::text || '|tam', 'YC3.5-NT5 ảnh tạm của Anh Tuấn vẫn là ảnh tạm, không gắn vào 1509');

-- Sale Hùng sửa căn tự nhập của mình (Villa Tuần Châu, PQ13.CHU) không đổi gì ở căn của Chị Hoa; ở đây chỉ kiểm
-- lệnh không nhận căn người khác. Chị Hoa sửa căn tự nhập của Sale Hùng: bị từ chối.
select t.dang_nhap(t.id('hoa'));
select t.loi($$select public.fn_sua_can(p_can_id => t.can('villa'), p_sua => '{"mo_ta": "Hoa sửa"}'::jsonb)$$,
             '42501', 'YC3.5-NT5 PQ13.SALE Chị Hoa gửi lệnh sửa căn tự nhập của Sale Hùng thì bị từ chối');
select t.loi($$select public.fn_sua_can(p_can_id => t.can('1103'), p_sua => '{"mo_ta": "Hoa sửa"}'::jsonb)$$,
             '42501', 'YC3.5-NT5 PQ3.CHU Chị Hoa gửi lệnh sửa căn 1103 của Anh Tuấn thì bị từ chối');
select t.loi($$select public.fn_sua_can(p_can_id => gen_random_uuid(), p_sua => '{"mo_ta": "x"}'::jsonb)$$,
             '42501', 'YC3.5 QT5.5 sửa căn không có thì bị từ chối như căn không thấy');
select t.thoat();
select t.bang((select coalesce(mo_ta, '-') from public.can where id = t.can('1103')), '-',
              'YC3.5-NT5 căn 1103 của Anh Tuấn không đổi');
select t.bang((select coalesce(mo_ta, '-') from public.can where id = t.can('villa')), '-',
              'YC3.5-NT5 căn tự nhập của Sale Hùng không đổi');

-- ===== YC3.5-NT2: đưa ảnh thứ 2 lên đầu và lưu thì ảnh đó thành ảnh đại diện =====
select t.dang_nhap(t.id('hoa'));
select t.khong_loi(format($$select public.fn_sua_can(p_can_id => t.can('1509'),
                                                      p_sua => jsonb_build_object('anh', jsonb_build_array(%L, %L, %L)))$$,
                          current_setting('t.a2'), current_setting('t.a1'), current_setting('t.a3')),
                   'YC3.5-NT2 Chị Hoa đưa ảnh thứ 2 của 1509 lên đầu rồi lưu thì qua');
select t.bang(t.gt($$(select anh_dai_dien from public.v_can_cua_toi where id = t.can('1509'))$$),
              t.id('hoa')::text || '/a2.jpg', 'YC3.5-NT2 ảnh vừa đưa lên đầu thành ảnh đại diện của 1509 trên danh sách căn');
select t.thoat();
select t.bang(t.thu_tu_anh(t.can('1509')), 'a2.jpg,a1.jpg,a3.jpg', 'YC3.5-NT2 ảnh 1509 lưu đúng thứ tự mới');
select t.bang((select string_agg(thu_tu::text, ',' order by thu_tu) from public.anh_can where can_id = t.can('1509')), '1,2,3',
              'YC3.5-NT2 thứ tự ảnh đánh số liền 1, 2, 3');
select t.bang((select so_giuong || '|' || loai_view || '|' || mo_ta from public.can where id = t.can('1509')),
              '3|bien|Căn góc tầng 15', 'YC3.5 bước 39 chỉ gửi ảnh thì các ô khác của 1509 không đổi');

-- Danh sách ảnh gửi lên là danh sách mới đầy đủ: thêm một ảnh tạm, bỏ a3.
select set_config('t.a4', t.anh_tam_us18('hoa', 'a4.jpg')::text, true);
select t.dang_nhap(t.id('hoa'));
select t.khong_loi(format($$select public.fn_sua_can(p_can_id => t.can('1509'),
                                                      p_sua => jsonb_build_object('anh', jsonb_build_array(%L, %L, %L)))$$,
                          current_setting('t.a2'), current_setting('t.a4'), current_setting('t.a1')),
                   'YC3.5 bước 37, 39 Chị Hoa thêm một ảnh mới, bỏ một ảnh cũ rồi lưu thì qua');
select t.thoat();
select t.bang(t.thu_tu_anh(t.can('1509')), 'a2.jpg,a4.jpg,a1.jpg',
              'YC3.5 bước 39 ảnh 1509 đúng danh sách mới gửi lên: ảnh mới gắn vào, theo thứ tự');
select t.bang((select count(*) from public.anh_can where id = current_setting('t.a3')::uuid), 0::bigint,
              'YC3.5 bước 37, YC3 Dữ liệu ảnh bị bỏ khỏi căn thì không còn trong bảng ảnh');

-- Gửi danh sách rỗng là bỏ hết ảnh; không gửi khóa "anh" thì ảnh giữ nguyên (thử ở 3402).
select t.dang_nhap(t.id('hoa'));
select t.khong_loi($$select public.fn_sua_can(p_can_id => t.can('3402'), p_sua => '{"mo_ta": "Căn 3402"}'::jsonb)$$,
                   'YC3.5 bước 39 Chị Hoa chỉ sửa mô tả 3402 thì qua');
select t.thoat();
select t.bang(t.thu_tu_anh(t.can('3402')), 'b1.jpg', 'YC3.5 bước 39 không gửi danh sách ảnh thì ảnh 3402 giữ nguyên');

-- Chị Hoa không chuyển được ảnh của 3402 sang 1509, không gắn được ảnh tạm của Anh Tuấn.
select t.dang_nhap(t.id('hoa'));
select t.loi(format($$select public.fn_sua_can(p_can_id => t.can('1509'), p_sua => jsonb_build_object('anh', jsonb_build_array(%L, %L)))$$,
                    current_setting('t.a2'), current_setting('t.b1')),
             '42501', 'YC3.5 QT5.7 PQ3.CHU Chị Hoa gắn ảnh của căn 3402 vào 1509 thì bị từ chối');
select t.loi(format($$select public.fn_sua_can(p_can_id => t.can('1509'), p_sua => jsonb_build_object('anh', jsonb_build_array(%L)))$$,
                    current_setting('t.tuan_tam')),
             '42501', 'YC3.5 QT5.7 PQ3.CHU Chị Hoa gắn ảnh tạm của Anh Tuấn vào 1509 thì bị từ chối');
select t.loi_cau(format($$select public.fn_sua_can(p_can_id => t.can('1509'), p_sua => jsonb_build_object('anh', jsonb_build_array(%L, %L)))$$,
                        current_setting('t.a2'), current_setting('t.a2')),
                 'P0001', 'Danh sách ảnh bị trùng', 'YC3.5 YC3.3 Luật kiểm danh sách ảnh trùng thì bị từ chối');
select t.thoat();
select t.bang(t.thu_tu_anh(t.can('1509')), 'a2.jpg,a4.jpg,a1.jpg', 'YC3.5 sau các lệnh ảnh bị từ chối ảnh 1509 không đổi');
select t.bang(t.thu_tu_anh(t.can('3402')), 'b1.jpg', 'YC3.5 ảnh của 3402 vẫn ở 3402');

-- ===== YC3.5-NT3: Chị Hoa đổi mã 3402 thành "1509" thì bị từ chối, 3402 không đổi =====
select set_config('t.can3402_truoc', t.can_chu(t.can('3402')), true);
select t.dang_nhap(t.id('hoa'));
select t.loi_cau($$select public.fn_sua_can(p_can_id => t.can('3402'), p_sua => '{"ma_can": "1509"}'::jsonb)$$,
                 'P0001', 'Đã có căn 1509. Kiểm tra lại mã căn.',
                 'YC3.5-NT3 Chị Hoa đổi mã 3402 thành "1509" thì bị từ chối với câu "Đã có căn 1509. Kiểm tra lại mã căn."');
select t.loi_cau($$select public.fn_sua_can(p_can_id => t.can('3402'), p_sua => '{"ma_can": " 1509 ", "mo_ta": "Đổi cùng lúc"}'::jsonb)$$,
                 'P0001', 'Đã có căn 1509. Kiểm tra lại mã căn.',
                 'YC3.5-NT3 mã " 1509 " (có khoảng trắng đầu cuối) cũng bị từ chối, các ô gửi cùng không được ghi');
select t.thoat();
select t.bang(t.can_chu(t.can('3402')), current_setting('t.can3402_truoc'), 'YC3.5-NT3 sau khi bị từ chối căn 3402 không đổi');
select t.bang((select count(*) from public.can where nguoi_giu = t.id('hoa') and an_luc is null and btrim(ma_can) = '1509'), 1::bigint,
              'YC3.5-NT3 Chị Hoa vẫn chỉ có một căn 1509');

-- Gửi lại đúng mã của chính căn đó (khác hoa thường) thì không coi là trùng; mã của căn đã ẩn dùng lại được.
update public.can set ma_can = 'Greenbay' where id = t.can('3402');
select t.dang_nhap(t.id('hoa'));
select t.khong_loi($$select public.fn_sua_can(p_can_id => t.can('3402'), p_sua => '{"ma_can": "GREENBAY"}'::jsonb)$$,
                   'YC3.5 Quy tắc "Mã căn không trùng" đổi mã căn thành chính mã đó viết khác hoa thường thì qua');
select t.thoat();
select t.bang((select ma_can from public.can where id = t.can('3402')), 'GREENBAY', 'YC3.5 mã căn lưu đúng chữ mới');
insert into public.can (id, nguoi_giu, loai, ma_can, so_phong_ngu, an_luc)
values ('00000000-0000-0000-0001-0000000a1111', t.id('hoa'), 'co_lich', '2105', 1, now());
select t.dang_nhap(t.id('hoa'));
select t.khong_loi($$select public.fn_sua_can(p_can_id => t.can('3402'), p_sua => '{"ma_can": " 2105 "}'::jsonb)$$,
                   'YC3.5 Quy tắc "Mã căn không trùng" đổi mã thành mã của căn đã xóa (ẩn) thì qua');
select t.thoat();
select t.bang((select ma_can from public.can where id = t.can('3402')), '2105', 'YC3.5 mã căn lưu đã bỏ khoảng trắng đầu cuối');
-- Anh Tuấn có 1103; Chị Hoa đổi mã thành "1103" được (hai người giữ khác nhau trùng mã được).
select t.dang_nhap(t.id('hoa'));
select t.khong_loi($$select public.fn_sua_can(p_can_id => t.can('3402'), p_sua => '{"ma_can": "1103"}'::jsonb)$$,
                   'YC3.5 Quy tắc "Mã căn không trùng" Chị Hoa đổi mã thành 1103 được dù Anh Tuấn có 1103');
select t.thoat();

-- ===== YC3.5-NT4: sửa số giường 1509 từ 3 thành 2 thì thẻ "2PN · 2 giường"; xóa trống thì "2PN" =====
select t.dang_nhap(t.id('hoa'));
select t.khong_loi($$select public.fn_sua_can(p_can_id => t.can('1509'), p_sua => '{"so_giuong": 2}'::jsonb)$$,
                   'YC3.5-NT4 Chị Hoa sửa số giường 1509 từ 3 thành 2 rồi lưu thì qua');
select t.bang(t.gt($$(select so_phong_ngu || '|' || coalesce(so_giuong::text, '-') from public.v_can_cua_toi where id = t.can('1509'))$$),
              '2|2', 'YC3.5-NT4 danh sách căn đọc 1509 là 2 phòng ngủ, 2 giường (thẻ "2PN · 2 giường")');
select t.khong_loi($$select public.fn_sua_can(p_can_id => t.can('1509'), p_sua => '{"mo_ta": "Mô tả mới"}'::jsonb)$$,
                   'YC3.5 bước 39 Chị Hoa chỉ gửi mô tả thì qua');
select t.bang(t.gt($$(select coalesce(so_giuong::text, '-') from public.v_can_cua_toi where id = t.can('1509'))$$),
              '2', 'YC3.5 bước 39 không gửi số giường thì số giường giữ nguyên');
select t.khong_loi($$select public.fn_sua_can(p_can_id => t.can('1509'), p_sua => '{"so_giuong": null}'::jsonb)$$,
                   'YC3.5-NT4 Chị Hoa xóa trống ô số giường 1509 rồi lưu thì qua');
select t.bang(t.gt($$(select so_phong_ngu || '|' || coalesce(so_giuong::text, '-') from public.v_can_cua_toi where id = t.can('1509'))$$),
              '2|-', 'YC3.5-NT4 danh sách căn đọc 1509 là 2 phòng ngủ, không số giường (thẻ "2PN")');
select t.thoat();
select t.bang((select ma_can || '|' || loai_view || '|' || toa_nha_id::text || '|' || mo_ta from public.can where id = t.can('1509')),
              '1509|bien|' || t.toa('icon40')::text || '|Mô tả mới',
              'YC3.5-NT4 bỏ số giường thì mã, view, tòa, mô tả 1509 không đổi');

-- Bỏ các ô không bắt buộc, đổi các ô khác; luật kiểm như form thêm (YC3.2, YC3.4).
select t.dang_nhap(t.id('hoa'));
select t.khong_loi(format($$select public.fn_sua_can(p_can_id => t.can('1509'),
                     p_sua => jsonb_build_object('so_phong_ngu', 3, 'loai_view', 'nui', 'toa_nha_id', %L, 'mo_ta', '  '))$$,
                          t.toa('sapphire')),
                   'YC3.5 bước 38 Chị Hoa đổi số phòng ngủ, view, tòa và xóa trống mô tả thì qua');
select t.thoat();
select t.bang((select so_phong_ngu || '|' || loai_view || '|' || toa_nha_id::text || '|' || coalesce(mo_ta, '-')
               from public.can where id = t.can('1509')),
              '3|nui|' || t.toa('sapphire')::text || '|-', 'YC3.5 bước 38 1509 lưu đúng các ô mới; mô tả trống là bỏ mô tả');
select t.dang_nhap(t.id('hoa'));
select t.khong_loi($$select public.fn_sua_can(p_can_id => t.can('1509'), p_sua => '{"loai_view": null, "toa_nha_id": null}'::jsonb)$$,
                   'YC3.5 bước 38 Chị Hoa bỏ view và tòa của 1509 thì qua');
select t.thoat();
select t.bang((select coalesce(loai_view, '-') || '|' || coalesce(toa_nha_id::text, '-') from public.can where id = t.can('1509')),
              '-|-', 'YC3.5 bước 38 1509 không còn view, tòa');

select set_config('t.can1509_giua', t.can_chu(t.can('1509')), true);
select t.dang_nhap(t.id('hoa'));
select t.loi_cau($$select public.fn_sua_can(p_can_id => t.can('1509'), p_sua => '{"ma_can": "  "}'::jsonb)$$,
                 'P0001', 'Mã căn không được trống', 'YC3.5 bước 40 xóa trống mã căn thì bị từ chối với câu dưới ô mã');
select t.loi_cau($$select public.fn_sua_can(p_can_id => t.can('1509'), p_sua => '{"ma_can": null}'::jsonb)$$,
                 'P0001', 'Mã căn không được trống', 'YC3.5 bước 40 gửi mã căn null thì bị từ chối');
select t.loi_cau($$select public.fn_sua_can(p_can_id => t.can('1509'), p_sua => '{"so_phong_ngu": null}'::jsonb)$$,
                 'P0001', 'Cần chọn số phòng ngủ', 'YC3.5 bước 40 bỏ số phòng ngủ thì bị từ chối');
select t.loi_cau($$select public.fn_sua_can(p_can_id => t.can('1509'), p_sua => '{"so_phong_ngu": 5}'::jsonb)$$,
                 'P0001', 'Số phòng ngủ không hợp lệ', 'YC3.5 bước 40 số phòng ngủ ngoài Studio đến 4PN+ thì bị từ chối');
select t.loi_cau($$select public.fn_sua_can(p_can_id => t.can('1509'), p_sua => '{"so_giuong": 0}'::jsonb)$$,
                 'P0001', 'Số giường từ 1 đến 50', 'YC3.5 bước 40 số giường 0 thì bị từ chối');
select t.loi_cau($$select public.fn_sua_can(p_can_id => t.can('1509'), p_sua => '{"so_giuong": "hai"}'::jsonb)$$,
                 'P0001', 'Số giường từ 1 đến 50', 'YC3.5 bước 40 số giường không phải số thì bị từ chối bằng câu, không lỗi chung');
select t.loi_cau($$select public.fn_sua_can(p_can_id => t.can('1509'), p_sua => '{"loai_view": "vinh"}'::jsonb)$$,
                 'P0001', 'Loại view không hợp lệ', 'YC3.5 bước 40 loại view "vinh" thì bị từ chối');
select t.loi_cau(format($$select public.fn_sua_can(p_can_id => t.can('1509'), p_sua => jsonb_build_object('toa_nha_id', %L))$$,
                        gen_random_uuid()),
                 'P0001', 'Không tìm thấy tòa nhà', 'YC3.5 bước 40 tòa nhà không có thì bị từ chối');
select t.loi_cau(format($$select public.fn_sua_can(p_can_id => t.can('1509'), p_sua => jsonb_build_object('mo_ta', %L))$$,
                        repeat('a', 2001)),
                 'P0001', 'Mô tả dài tối đa 2.000 ký tự', 'YC3.5 bước 40 mô tả quá 2.000 ký tự thì bị từ chối');
select t.loi_cau($$select public.fn_sua_can(p_can_id => t.can('1509'), p_sua => '{"ma_can": "x", "anh": "không phải danh sách"}'::jsonb)$$,
                 'P0001', 'Danh sách ảnh không hợp lệ', 'YC3.5 bước 40 danh sách ảnh sai dạng thì bị từ chối bằng câu');
select t.thoat();
select t.bang(t.can_chu(t.can('1509')), current_setting('t.can1509_giua'), 'YC3.5 bước 40 sau các lệnh bị từ chối căn 1509 không đổi');

-- 13 ảnh thì bị từ chối (YC3 Quy tắc "Ảnh căn").
select set_config('t.ds13', (select string_agg(t.anh_tam_us18('hoa', 'm' || i || '.jpg')::text, ',') from generate_series(1, 13) i), true);
select t.dang_nhap(t.id('hoa'));
select t.loi_cau(format($$select public.fn_sua_can(p_can_id => t.can('1509'), p_sua => jsonb_build_object('anh', to_jsonb(string_to_array(%L, ','))))$$,
                        current_setting('t.ds13')),
                 'P0001', 'Mỗi căn tối đa 12 ảnh', 'YC3.5 bước 37 YC3 Quy tắc "Ảnh căn" 13 ảnh thì bị từ chối');
select t.thoat();

-- ===== Căn đã ẩn (xóa) thì không sửa được =====
update public.can set an_luc = now() where id = t.can('3402');
select set_config('t.can3402_an', t.can_chu(t.can('3402')), true);
select t.dang_nhap(t.id('hoa'));
select t.loi($$select public.fn_sua_can(p_can_id => t.can('3402'), p_sua => '{"mo_ta": "Sửa căn đã xóa"}'::jsonb)$$,
             '42501', 'YC3.5 bước 39 HV5 Chị Hoa sửa căn đã xóa (ẩn) thì bị từ chối');
select t.thoat();
select t.bang(t.can_chu(t.can('3402')), current_setting('t.can3402_an'), 'YC3.5 bước 39 căn đã ẩn không đổi');
