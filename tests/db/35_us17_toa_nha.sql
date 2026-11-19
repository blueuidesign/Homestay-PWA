-- US17 · Tòa nhà, loại view, số giường, mô tả (YC3.4). Lệnh thêm tòa fn_them_toa, cột khu_vuc của toa_nha.
-- YC3.4-NT3, NT4, QT6.3, YC3 "Ai được làm gì" (danh sách tòa), YC3 "Dữ liệu" (tên tòa không trùng, giả định GD21).
-- Viết trước migration (US17-TA1, CL14.5): task sau không sửa file này.
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
grant execute on function t.loi_cau(text, text, text, text) to anon, authenticated;

-- Đếm tòa theo tên (bỏ khoảng trắng đầu cuối, không phân biệt hoa thường). Chạy bằng vai chủ database.
create or replace function t.so_toa(p_ten text) returns bigint
language sql stable as $$
  select count(*) from public.toa_nha where lower(btrim(ten)) = lower(btrim(p_ten))
$$;

-- ===== Danh mục: lệnh thêm tòa chạy security definer, chỉ người đã đăng nhập gọi được =====
select t.ok(exists (select 1 from pg_proc where proname = 'fn_them_toa' and pronamespace = 'public'::regnamespace and prosecdef),
            'YC3.4 bước 33 danh mục: có lệnh fn_them_toa chạy security definer');
select t.ok(exists (select 1 from pg_proc p where p.proname = 'fn_them_toa' and p.pronamespace = 'public'::regnamespace)
            and not exists (select 1 from pg_proc p where p.proname = 'fn_them_toa' and p.pronamespace = 'public'::regnamespace
                            and has_function_privilege('anon', p.oid, 'execute')),
            'YC3.4 Ai được làm gì danh mục: người chưa đăng nhập không có quyền gọi fn_them_toa');
select t.ok(exists (select 1 from pg_proc p where p.proname = 'fn_them_toa' and p.pronamespace = 'public'::regnamespace
                    and has_function_privilege('authenticated', p.oid, 'execute')),
            'YC3.4-NT3 danh mục: người đã đăng nhập gọi được fn_them_toa');
select t.ok(not has_table_privilege('authenticated', 'public.toa_nha', 'insert')
            and not has_table_privilege('authenticated', 'public.toa_nha', 'update')
            and not has_table_privilege('authenticated', 'public.toa_nha', 'delete')
            and not has_table_privilege('anon', 'public.toa_nha', 'insert'),
            'YC3.4 Ai được làm gì danh mục: app không ghi thẳng bảng toa_nha (ghi qua fn_them_toa)');
select t.ok(exists (select 1 from information_schema.columns
                    where table_schema = 'public' and table_name = 'toa_nha' and column_name = 'khu_vuc'
                      and data_type = 'text' and is_nullable = 'YES'),
            'YC3.4 YC3-H5 danh mục: toa_nha có cột khu_vuc (text, để trống được)');

-- ===== YC3.4-NT3: Chị Hoa thêm tòa "Bim Hạ Long", Anh Tuấn thấy tòa đó trong danh sách =====
select t.dang_nhap(t.id('hoa'));
select set_config('t.ma_bim', coalesce(t.gt($$public.fn_them_toa('Bim Hạ Long')$$), ''), true);
select t.ok(nullif(current_setting('t.ma_bim', true), '') is not null,
            'YC3.4-NT3 Chị Hoa thêm tòa mới "Bim Hạ Long" thì lệnh trả mã tòa');
select t.thoat();
select t.bang((select ten || '|' || home247_dat_san::text || '|' || coalesce(tao_boi::text, '-') || '|' || coalesce(khu_vuc, '-')
               from public.toa_nha where id = nullif(current_setting('t.ma_bim', true), '')::uuid),
              'Bim Hạ Long|false|' || t.id('hoa')::text || '|-',
              'YC3.4-NT3 tòa "Bim Hạ Long" ghi người thêm là Chị Hoa, không phải tòa Home247 đặt sẵn, không có khu vực');
select t.dang_nhap(t.id('tuan'));
select t.bang(t.so($$select * from public.toa_nha where ten = 'Bim Hạ Long'$$), 1::bigint,
              'YC3.4-NT3 QT6.3 Anh Tuấn đọc danh sách tòa thấy "Bim Hạ Long" do Chị Hoa thêm, không cần duyệt');
select t.bang(t.so('select * from public.toa_nha'), 3::bigint,
              'YC3.4-NT3 Anh Tuấn thấy đủ 3 tòa: ICON40, Sapphire, Bim Hạ Long');
select t.thoat();
select t.dang_nhap(t.id('hung'));
select t.bang(t.so($$select * from public.toa_nha where ten = 'Bim Hạ Long'$$), 1::bigint,
              'YC3.4-NT3 QT6.3 sale cũng thấy tòa người dùng thêm (một danh sách cho mọi người)');
select t.thoat();

-- Gắn tòa vừa thêm vào căn khi tạo căn (bước 33: tòa mới được chọn cho căn).
select t.dang_nhap(t.id('hoa'));
select set_config('t.can_bim',
  coalesce(t.gt($$public.fn_tao_can(p_ma_can => '0808', p_so_phong_ngu => 2,
                                    p_client_id => '00000000-0000-0000-0017-000000000001',
                                    p_toa_nha_id => nullif(current_setting('t.ma_bim', true), '')::uuid)$$), ''), true);
select t.thoat();
select t.bang((select toa_nha_id::text from public.can where id = nullif(current_setting('t.can_bim', true), '')::uuid),
              nullif(current_setting('t.ma_bim', true), ''),
              'YC3.4-NT3 YC3.4 bước 33 căn 0808 gắn với tòa "Bim Hạ Long" vừa thêm');

-- ===== YC3.4-NT4: thêm "icon40" khi đã có "ICON40" thì không có tòa thứ hai, căn gắn với "ICON40" (GD21) =====
select t.dang_nhap(t.id('tuan'));
select set_config('t.ma_icon', coalesce(t.gt($$public.fn_them_toa('icon40')$$), ''), true);
select t.bang(nullif(current_setting('t.ma_icon', true), ''), t.toa('icon40')::text,
              'YC3.4-NT4 Anh Tuấn thêm tòa "icon40" khi đã có "ICON40" thì lệnh trả mã tòa ICON40 đã có');
select set_config('t.ma_icon2', coalesce(t.gt($$public.fn_them_toa('  Icon40 ')$$), ''), true);
select t.bang(nullif(current_setting('t.ma_icon2', true), ''), t.toa('icon40')::text,
              'YC3.4-NT4 tên "  Icon40 " (khoảng trắng đầu cuối, khác hoa thường) cũng trả tòa ICON40 đã có');
select set_config('t.can_icon',
  coalesce(t.gt($$public.fn_tao_can(p_ma_can => '2201', p_so_phong_ngu => 1,
                                    p_client_id => '00000000-0000-0000-0017-000000000002',
                                    p_toa_nha_id => nullif(current_setting('t.ma_icon', true), '')::uuid)$$), ''), true);
select t.thoat();
select t.bang(t.so_toa('icon40'), 1::bigint, 'YC3.4-NT4 sau khi thêm "icon40" vẫn chỉ có một tòa ICON40, không có tòa thứ hai');
select t.bang((select ten from public.toa_nha where lower(btrim(ten)) = 'icon40'), 'ICON40',
              'YC3.4-NT4 tòa ICON40 giữ nguyên tên, không bị đổi thành "icon40"');
select t.bang((select tn.ten from public.can c join public.toa_nha tn on tn.id = c.toa_nha_id
               where c.id = nullif(current_setting('t.can_icon', true), '')::uuid),
              'ICON40', 'YC3.4-NT4 căn 2201 của Anh Tuấn gắn với tòa "ICON40"');

-- Thêm lại tòa người dùng vừa thêm (khác hoa thường) cũng trả tòa đó.
select t.dang_nhap(t.id('tuan'));
select t.bang(t.gt($$public.fn_them_toa('BIM HẠ LONG')$$), nullif(current_setting('t.ma_bim', true), ''),
              'YC3.4-NT4 GD21 Anh Tuấn thêm "BIM HẠ LONG" thì trả tòa "Bim Hạ Long" của Chị Hoa');
select t.thoat();
select t.bang(t.so_toa('bim hạ long'), 1::bigint, 'YC3.4-NT4 GD21 vẫn chỉ có một tòa Bim Hạ Long');

-- ===== Luật tên tòa: bỏ khoảng trắng đầu cuối, 1 đến 100 ký tự =====
select t.dang_nhap(t.id('hoa'));
select t.loi_cau($$select public.fn_them_toa('')$$, 'P0001', 'Tên tòa từ 1 đến 100 ký tự',
                 'YC3.4 bước 33 tên tòa trống thì từ chối "Tên tòa từ 1 đến 100 ký tự"');
select t.loi_cau($$select public.fn_them_toa('   ')$$, 'P0001', 'Tên tòa từ 1 đến 100 ký tự',
                 'YC3.4 bước 33 tên tòa chỉ có khoảng trắng thì từ chối "Tên tòa từ 1 đến 100 ký tự"');
select t.loi_cau($$select public.fn_them_toa(null)$$, 'P0001', 'Tên tòa từ 1 đến 100 ký tự',
                 'YC3.4 bước 33 tên tòa null thì từ chối "Tên tòa từ 1 đến 100 ký tự"');
select t.loi_cau($$select public.fn_them_toa(repeat('Ă', 101))$$, 'P0001', 'Tên tòa từ 1 đến 100 ký tự',
                 'YC3.4 bước 33 tên tòa 101 ký tự thì từ chối "Tên tòa từ 1 đến 100 ký tự"');
select set_config('t.ma_dai', coalesce(t.gt($$public.fn_them_toa(repeat('Ă', 100))$$), ''), true);
select set_config('t.ma_cach', coalesce(t.gt($$public.fn_them_toa('  Mường Thanh  ')$$), ''), true);
select t.thoat();
select t.ok(nullif(current_setting('t.ma_dai', true), '') is not null,
            'YC3.4 bước 33 tên tòa đúng 100 ký tự có dấu thì thêm được');
select t.bang((select ten from public.toa_nha where id = nullif(current_setting('t.ma_cach', true), '')::uuid), 'Mường Thanh',
              'YC3.4 bước 33 tên tòa lưu đã bỏ khoảng trắng đầu cuối');
select t.bang((select count(*) from public.toa_nha where btrim(ten) = '' or char_length(ten) > 100), 0::bigint,
              'YC3.4 bước 33 các lệnh sai luật tên không để lại tòa nào');

-- ===== Ai được làm gì: chưa đăng nhập không thêm được; không ai ghi thẳng bảng; chỉ quản trị sửa, xóa (YC13) =====
select t.khach();
select t.loi($$select public.fn_them_toa('Tòa Khách')$$, '%',
             'YC3.4 Ai được làm gì người chưa đăng nhập gửi lệnh thêm tòa thì bị từ chối');
select t.loi($$insert into public.toa_nha (ten) values ('Tòa Khách')$$, '42501',
             'YC3.4 Ai được làm gì người chưa đăng nhập không ghi thẳng tòa được');
select t.ok(coalesce(t.so('select * from public.toa_nha'), 0) = 0,
            'YC3.4 Ai được làm gì người chưa đăng nhập không đọc được danh sách tòa');
select t.thoat();
select t.bang(t.so_toa('Tòa Khách'), 0::bigint, 'YC3.4 Ai được làm gì không có tòa nào do người chưa đăng nhập tạo');

-- Phiên đã đăng nhập mà không có người gọi (jwt thiếu sub) cũng bị từ chối.
select set_config('request.jwt.claims', '{"role":"authenticated"}', true);
select set_config('role', 'authenticated', true);
select t.loi($$select public.fn_them_toa('Tòa Vô Danh')$$, '%',
             'YC3.4 Ai được làm gì phiên không có người gọi thì lệnh thêm tòa bị từ chối');
select t.thoat();
select t.bang(t.so_toa('Tòa Vô Danh'), 0::bigint, 'YC3.4 Ai được làm gì không có tòa nào tạo từ phiên không có người gọi');

select t.dang_nhap(t.id('tuan'));
select t.loi($$insert into public.toa_nha (ten) values ('Ghi Thẳng')$$, '42501',
             'YC3.4 Ai được làm gì Anh Tuấn không ghi thẳng tòa vào bảng được');
select t.loi($$update public.toa_nha set ten = 'Đổi Tên' where id = t.toa('icon40')$$, '42501',
             'YC3.4 Ai được làm gì Anh Tuấn không sửa được tòa (chỉ quản trị sửa)');
select t.loi($$update public.toa_nha set ten = 'Đổi Tên' where id = nullif(current_setting('t.ma_bim', true), '')::uuid$$, '42501',
             'YC3.4 Ai được làm gì Chị Hoa thêm tòa nhưng Anh Tuấn không sửa được tòa đó');
select t.loi($$delete from public.toa_nha where id = t.toa('sapphire')$$, '42501',
             'YC3.4 Ai được làm gì Anh Tuấn không xóa được tòa (chỉ quản trị xóa)');
select t.thoat();
select t.dang_nhap(t.id('hoa'));
select t.loi($$update public.toa_nha set khu_vuc = 'Bãi Cháy' where id = nullif(current_setting('t.ma_bim', true), '')::uuid$$, '42501',
             'YC3.4 Ai được làm gì người thêm tòa cũng không sửa thẳng tòa của mình');
select t.thoat();
select t.bang((select ten || '|' || coalesce(khu_vuc, '-') from public.toa_nha where id = t.toa('icon40')), 'ICON40|-',
              'YC3.4 Ai được làm gì tòa ICON40 không đổi sau các lệnh ghi thẳng');
select t.bang(t.so_toa('Ghi Thẳng'), 0::bigint, 'YC3.4 Ai được làm gì không có tòa ghi thẳng');

-- Lệnh thêm tòa không nhận người thêm từ app: tao_boi luôn là người gọi.
select t.ok(not exists (select 1 from pg_proc p where p.proname = 'fn_them_toa' and p.pronamespace = 'public'::regnamespace
                        and exists (select 1 from unnest(coalesce(p.proargnames, '{}')) a
                                    where a ilike '%nguoi%' or a ilike '%tao_boi%' or a ilike '%dat_san%')),
            'YC3.4 Ai được làm gì lệnh thêm tòa không nhận người thêm hay cờ Home247 đặt sẵn từ app');
