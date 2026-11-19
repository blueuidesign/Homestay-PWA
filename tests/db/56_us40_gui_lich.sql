-- US40 · Chủ nhà gửi lịch theo căn đã chọn (YC6.6). Viết trước migration (US40-TA1, CL14.5): task sau không sửa file này.
-- Hợp đồng database cho màn CN10, CN10-00, CN10-01, CN10-02 và A10 khi mở link gửi lịch:
--   fn_gui_lich(can_ids uuid[])    ghi, chủ nhà: luôn tạo một link mới loại gui_lich với các căn đã chọn, hạn 21 ngày,
--                                  số lần gửi 1. Trả (ma, so_lan_gui, het_han_luc). Căn không phải của người gọi, căn đã
--                                  xóa, người gọi không phải chủ nhà: 42501, không có link mới. Danh sách rỗng: P0001.
--   fn_xem_link_moi(ma)            như US37, nhận cả link gửi lịch (cùng đường /l/<mã>): jsonb có thêm loai
--                                  ('moi_sale' | 'gui_lich'); với gui_lich, so_can và can chỉ gồm căn trong link còn chưa
--                                  xóa; da_them = đã kết nối và mọi căn đó đã trong phạm vi. Không có giá.
--   fn_them_lich_link_moi(ma)      như US37, nhận cả link gửi lịch (YC6-H7): không bao giờ thu hẹp quyền.
--                                  Tất cả căn: giữ, trả 'da_co'. Danh sách căn: cộng căn của link vào ket_noi_can
--                                  ('da_them', hay 'da_co' khi không thêm được căn nào). Chưa kết nối, sale bỏ, chưa có dòng:
--                                  đã kết nối, nguồn gui_lich, phạm vi chon_can đúng các căn của link, cọc bật.
--                                  Chủ đã ngừng: 42501.
--   Kho ảnh: với header x-link-moi là mã link gửi lịch, chỉ ảnh các căn trong link.
select t.fixture();

-- Chị Hoa có ảnh 1509, 3402. Anh Tuấn có ảnh 1103.
insert into public.anh_can (can_id, nguoi_tai, duong_dan, thu_tu)
values (t.can('1509'), t.id('hoa'), t.id('hoa') || '/anh-1509.jpg', 0),
       (t.can('3402'), t.id('hoa'), t.id('hoa') || '/anh-3402.jpg', 0),
       (t.can('1103'), t.id('tuan'), t.id('tuan') || '/anh-1103.jpg', 0);
insert into storage.objects (bucket_id, name)
values ('anh-can', t.id('hoa') || '/anh-1509.jpg'), ('anh-can', t.id('hoa') || '/anh-3402.jpg'),
       ('anh-can', t.id('tuan') || '/anh-1103.jpg');
-- Một căn đã xóa của Chị Hoa.
insert into public.can (id, nguoi_giu, loai, ma_can, an_luc)
values ('00000000-0000-0000-0001-00000000de10', t.id('hoa'), 'co_lich', '0808', now());

create or replace function pg_temp.dia_chi(ip text) returns void language sql as $$
  select set_config('request.headers', json_build_object('x-forwarded-for', ip)::text, true)
$$;
create or replace function pg_temp.header_link(ma text) returns void language sql as $$
  select set_config('request.headers', json_build_object('x-forwarded-for', '10.6.9.9', 'x-link-moi', ma)::text, true)
$$;
create or replace function pg_temp.luu(ten text, gt text) returns void language sql as $$
  select set_config('t.link_' || ten, gt, true)
$$;
create or replace function pg_temp.ma(ten text) returns text language sql as $$
  select current_setting('t.link_' || ten, true)
$$;
-- Mã căn sale đang thấy của Chị Hoa (gọi bằng vai sale).
create or replace function pg_temp.can_thay() returns text language sql as $$
  select string_agg(c.ma_can, ',' order by c.ma_can) from public.can c
  where c.id in (select public.my_shared_can_ids()) and c.nguoi_giu = '00000000-0000-0000-0000-000000000001'
$$;
grant execute on function pg_temp.can_thay() to authenticated;

select pg_temp.dia_chi('10.6.0.1');

-- ===== Danh mục =====
select t.ok(exists (select 1 from pg_proc where proname = 'fn_gui_lich' and pronamespace = 'public'::regnamespace and prosecdef),
            'YC6.6 danh mục: fn_gui_lich có và chạy security definer (KT-DB.3.3)');
select t.ok(not exists (select 1 from pg_proc p where p.proname = 'fn_gui_lich' and p.pronamespace = 'public'::regnamespace
                        and has_function_privilege('anon', p.oid, 'execute')),
            'YC6.6 PQ18.LINK người chưa đăng nhập không gọi được fn_gui_lich');
select t.ok(not has_table_privilege('authenticated', 'public.link_moi_can', 'INSERT')
            and not has_table_privilege('authenticated', 'public.ket_noi_can', 'INSERT')
            and not has_table_privilege('authenticated', 'public.link_moi', 'INSERT'),
            'YC6.6 PQ18 app không ghi thẳng link_moi, link_moi_can, ket_noi_can; chỉ qua hàm');

-- ===== YC6.6-NT1: Chị Hoa chọn 1509 rồi gửi =====
select t.dang_nhap(t.id('hoa'));
select pg_temp.luu('l1509', t.gt($$(select ma || '|' || so_lan_gui from public.fn_gui_lich(array[t.can('1509')]))$$));
select t.thoat();
select t.ok(pg_temp.ma('l1509') is not null and split_part(pg_temp.ma('l1509'), '|', 2) = '1',
            'YC6.6-NT1 bước 4 Chị Hoa gửi lịch 1509: có link mới, số lần gửi 1');
select pg_temp.luu('l1509', split_part(pg_temp.ma('l1509'), '|', 1));
select t.ok((select loai = 'gui_lich' and thu_hoi_luc is null and gui_cuoi_luc is not null
                    and het_han_luc between now() + interval '20 days 23 hours' and now() + interval '21 days 1 hour'
             from public.link_moi where ma = pg_temp.ma('l1509')),
            'YC6.6 YC6-H9 link gửi lịch loại gui_lich, hạn 21 ngày');
select t.bang((select string_agg(c.ma_can, ',') from public.link_moi_can lc join public.link_moi l on l.id = lc.link_id
               join public.can c on c.id = lc.can_id where l.ma = pg_temp.ma('l1509')),
              '1509', 'YC6.6-NT1 link chỉ gồm căn đã chọn 1509');
select t.ok(char_length(pg_temp.ma('l1509')) >= 20 and pg_temp.ma('l1509') ~ '^[A-Za-z0-9_-]+$'
            and position('0900000001' in pg_temp.ma('l1509')) = 0,
            'YC6.6 quy tắc "Link mời" mã link gửi lịch ngẫu nhiên, không chứa số điện thoại');
-- Mỗi lần "Chia sẻ lịch" tạo link mới (YC6-H9).
select t.dang_nhap(t.id('hoa'));
select pg_temp.luu('l1509b', t.gt($$(select ma from public.fn_gui_lich(array[t.can('1509')]))$$));
select t.thoat();
select t.ok(pg_temp.ma('l1509b') is not null and pg_temp.ma('l1509b') <> pg_temp.ma('l1509')
            and (select thu_hoi_luc is null from public.link_moi where ma = pg_temp.ma('l1509')),
            'YC6.6 YC6-H9 mỗi lần chia sẻ lịch tạo một link mới, link cũ vẫn dùng được');
-- Link gửi lịch không phải link mời của chủ nhà, đổi link mời không thu hồi nó.
select t.dang_nhap(t.id('hoa'));
select t.ok(t.gt($$(select ma from public.fn_lay_link_moi())$$) not in (pg_temp.ma('l1509'), pg_temp.ma('l1509b')),
            'YC6.6 link mời của Chị Hoa khác link gửi lịch');
select t.khong_loi($$select public.fn_doi_link_moi()$$, 'YC6.6 Chị Hoa đổi link mời');
select t.thoat();
select t.ok((select thu_hoi_luc is null from public.link_moi where ma = pg_temp.ma('l1509')),
            'YC6.6 YC6-H9 đổi link mời không thu hồi link gửi lịch');

-- Sale Nga (vai Sale Phương ở NT, chưa kết nối) xem trước rồi bấm "Thêm lịch".
select t.dang_nhap(t.id('nga'));
select t.bang(t.gt($$public.fn_xem_link_moi(pg_temp.ma('l1509'))->>'trang_thai'$$) || '|'
              || t.gt($$public.fn_xem_link_moi(pg_temp.ma('l1509'))->>'loai'$$) || '|'
              || t.gt($$public.fn_xem_link_moi(pg_temp.ma('l1509'))->>'so_can'$$) || '|'
              || t.gt($$public.fn_xem_link_moi(pg_temp.ma('l1509'))->>'da_them'$$),
              'hop_le|gui_lich|1|false', 'YC6.6-NT1 Sale Phương xem trước link gửi lịch: 1 căn, chưa thêm');
select t.bang(t.gt($$public.fn_them_lich_link_moi(pg_temp.ma('l1509'))$$), 'da_them',
              'YC6.6-NT1 Sale Phương bấm "Thêm lịch" từ link gửi lịch được');
select t.bang(pg_temp.can_thay(), '1509', 'YC6.6-NT1 Sale Phương chỉ thấy 1509, không thấy 3402');
select t.bang(t.so($$select * from public.can where id = t.can('3402')$$), 0::bigint,
              'YC6.6-NT1 PQ4.SALE Sale Phương không đọc được căn 3402');
select t.bang(t.so($$select * from public.gia_thang where can_id = t.can('3402')$$), 0::bigint,
              'YC6.6-NT1 PQ5.SALE Sale Phương không đọc được giá 3402');
select t.ok(coalesce(t.so($$select * from public.gia_thang where can_id = t.can('1509')$$), 0) > 0,
            'YC6.6-NT1 QD7 Sale Phương thấy giá chủ nhà của 1509');
select t.thoat();
select t.bang((select trang_thai || '|' || nguon || '|' || pham_vi || '|' || xem_coc from public.ket_noi
               where chu_id = t.id('hoa') and sale_id = t.id('nga')),
              'da_ket_noi|gui_lich|chon_can|true', 'YC6.6-NT1 kết nối đã kết nối, nguồn gửi lịch, danh sách căn, cọc bật');
select t.bang((select count(*) from public.thong_bao where nguoi_nhan in (t.id('hoa'), t.id('nga'))), 0::bigint,
              'YC6.6 YC6-H6 sale tự bấm "Thêm lịch" không ghi thông báo');
-- Mở lại link đó: đã thêm (A10-01), không thêm lần nữa.
select t.dang_nhap(t.id('nga'));
select t.bang(t.gt($$public.fn_xem_link_moi(pg_temp.ma('l1509'))->>'da_them'$$), 'true',
              'YC6.6 PQ17.LINK Sale Phương mở lại link gửi lịch: đã thêm (A10-01)');
select t.bang(t.gt($$public.fn_them_lich_link_moi(pg_temp.ma('l1509'))$$), 'da_co',
              'YC6.6 PQ17.LINK bấm lại "Thêm lịch" trả "đã có"');
select t.thoat();
select t.bang((select count(*) from public.ket_noi where chu_id = t.id('hoa') and sale_id = t.id('nga')), 1::bigint,
              'YC6.6 YC6 Dữ liệu chỉ một kết nối giữa Chị Hoa và Sale Phương');

-- ===== YC6.6-NT2: Chị Hoa thêm căn mới 2105 =====
insert into public.can (id, nguoi_giu, loai, ma_can) values ('00000000-0000-0000-0001-000000002105', t.id('hoa'), 'co_lich', '2105');
select t.dang_nhap(t.id('nga'));
select t.bang(pg_temp.can_thay(), '1509', 'YC6.6-NT2 QD8 Chị Hoa thêm căn 2105, Sale Phương vẫn chỉ thấy 1509');
select t.thoat();
select t.dang_nhap(t.id('hung'));
select t.ok('00000000-0000-0000-0001-000000002105'::uuid in (select public.my_shared_can_ids()),
            'YC6.6-NT2 quy tắc "Phạm vi căn" Sale Hùng (tất cả căn) thấy căn mới 2105');
select t.thoat();

-- ===== YC6.6-NT7: người chưa đăng nhập xem trước link gửi lịch có 1509 =====
select t.khach();
select t.bang(t.gt($$public.fn_xem_link_moi(pg_temp.ma('l1509'))->>'trang_thai'$$) || '|'
              || t.gt($$public.fn_xem_link_moi(pg_temp.ma('l1509'))->>'ten_chu'$$) || '|'
              || t.gt($$public.fn_xem_link_moi(pg_temp.ma('l1509'))->>'so_can'$$),
              'hop_le|Chị Hoa|1', 'YC6.6-NT7 chưa đăng nhập: link hợp lệ, tên chủ nhà, 1 căn');
select t.bang(t.gt($$(select string_agg(c->>'ma_can', ',') from jsonb_array_elements(public.fn_xem_link_moi(pg_temp.ma('l1509'))->'can') c)$$),
              '1509', 'YC6.6-NT7 chưa đăng nhập: chỉ thấy 1509, không thấy 3402');
select t.ok(t.gt($$public.fn_xem_link_moi(pg_temp.ma('l1509'))$$) !~* '(gia|"tien|900000|1300000|800000|1100000|muc_cong)',
            'YC6.6-NT7 KT-DB.3.1 chưa đăng nhập: không có giá');
select t.ok(t.gt($$public.fn_xem_link_moi(pg_temp.ma('l1509'))$$) !~ '(0900000001|so_dien_thoai)',
            'YC6.6-NT7 PQ2.LINK không có số điện thoại chủ nhà');
select t.loi($$select public.fn_them_lich_link_moi(pg_temp.ma('l1509'))$$, '42501',
             'YC6.6-NT7 PQ17.LINK người chưa đăng nhập không thêm lịch được');
select t.bang(t.so($$select * from public.link_moi_can$$), null::bigint,
              'YC6.6-NT7 người chưa đăng nhập không đọc thẳng được căn của link');
select t.thoat();
select pg_temp.header_link(pg_temp.ma('l1509'));
select t.khach();
select t.bang(t.gt($$(select string_agg(name, ',') from storage.objects where bucket_id = 'anh-can')$$),
              t.id('hoa') || '/anh-1509.jpg', 'YC6.6-NT7 PQ3.LINK chưa đăng nhập: chỉ mở được ảnh 1509, không ảnh 3402');
select t.thoat();
select pg_temp.dia_chi('10.6.0.2');

-- ===== YC6.6-NT4: link gửi lịch có căn của người khác, căn đã xóa, sale gọi =====
select t.bang((select count(*) from public.link_moi where loai = 'gui_lich'), 2::bigint,
              'YC6.6-NT4 trước khi thử: hai link gửi lịch');
select t.dang_nhap(t.id('hoa'));
select t.loi($$select * from public.fn_gui_lich(array[t.can('1509'), t.can('1103')])$$, '42501',
             'YC6.6-NT4 database từ chối Chị Hoa gửi lịch có Sapphire 1103 của Anh Tuấn');
select t.loi($$select * from public.fn_gui_lich(array[t.can('1103')])$$, '42501',
             'YC6.6-NT4 database từ chối Chị Hoa gửi lịch chỉ có căn của Anh Tuấn');
select t.loi($$select * from public.fn_gui_lich(array['00000000-0000-0000-0001-00000000de10'::uuid])$$, '42501',
             'YC6.6-NT4 database từ chối Chị Hoa gửi lịch có căn đã xóa');
select t.loi($$select * from public.fn_gui_lich(array[t.can('villa')])$$, '42501',
             'YC6.6-NT4 database từ chối Chị Hoa gửi lịch có căn tự nhập của sale');
select t.loi($$select * from public.fn_gui_lich(array['00000000-0000-0000-0001-0000000ffff0'::uuid])$$, '42501',
             'YC6.6-NT4 database từ chối căn không có');
select t.loi($$select * from public.fn_gui_lich(array[]::uuid[])$$, 'P0001',
             'YC6.6 YC6-H8 database từ chối gửi lịch không có căn nào');
select t.loi($$select * from public.fn_gui_lich(null)$$, 'P0001',
             'YC6.6 YC6-H8 database từ chối gửi lịch danh sách rỗng');
select t.thoat();
select t.dang_nhap(t.id('hung'));
select t.loi($$select * from public.fn_gui_lich(array[t.can('1509')])$$, '42501',
             'YC6.6-NT4 PQ18.SALE database từ chối Sale Hùng tạo link gửi lịch');
select t.loi($$select * from public.fn_gui_lich(array[t.can('villa')])$$, '42501',
             'YC6.6-NT4 PQ18.SALE database từ chối Sale Hùng tạo link gửi lịch với căn tự nhập của mình');
select t.bang(t.so($$select * from public.link_moi where loai = 'gui_lich'$$), 0::bigint,
              'YC6.6 PQ18.CHU Sale Hùng không đọc được link gửi lịch của Chị Hoa');
select t.bang(t.so($$select * from public.link_moi_can$$), 0::bigint,
              'YC6.6 PQ18.CHU Sale Hùng không đọc được căn của link gửi lịch');
select t.thoat();
select t.dang_nhap(t.id('tuan'));
select t.bang(t.so($$select * from public.link_moi where loai = 'gui_lich'$$), 0::bigint,
              'YC6.6 PQ18.CHU Anh Tuấn không đọc được link gửi lịch của Chị Hoa');
select t.thoat();
select t.khach();
select t.loi($$select * from public.fn_gui_lich(array[t.can('1509')])$$, '42501',
             'YC6.6-NT4 PQ18.LINK người chưa đăng nhập không tạo được link gửi lịch');
select t.thoat();
select t.bang((select count(*) from public.link_moi where loai = 'gui_lich'), 2::bigint,
              'YC6.6-NT4 không có link gửi lịch mới sau các lệnh bị từ chối');
-- Chủ nhà đã xóa tài khoản không gửi lịch được.
update public.profiles set so_dien_thoai = null, da_xoa_luc = now() where id = t.id('tuan');
select t.dang_nhap(t.id('tuan'));
select t.loi($$select * from public.fn_gui_lich(array[t.can('1103')])$$, '42501',
             'YC6.6-NT4 PQ23 chủ nhà đã xóa tài khoản không tạo được link gửi lịch');
select t.thoat();
update public.profiles set so_dien_thoai = '0900000002', da_xoa_luc = null where id = t.id('tuan');

-- ===== YC6.6-NT5: Sale Phương (chỉ 1509) thêm lịch từ link có 3402; Sale Hùng (tất cả căn) mở link đó =====
select t.dang_nhap(t.id('hoa'));
select pg_temp.luu('l3402', t.gt($$(select ma from public.fn_gui_lich(array[t.can('3402')]))$$));
select t.thoat();
select t.dang_nhap(t.id('nga'));
select t.bang(t.gt($$public.fn_xem_link_moi(pg_temp.ma('l3402'))->>'da_them'$$), 'false',
              'YC6.6-NT5 Sale Phương (chỉ 1509) xem trước link có 3402: chưa thêm');
select t.bang(t.gt($$public.fn_them_lich_link_moi(pg_temp.ma('l3402'))$$), 'da_them',
              'YC6.6-NT5 Sale Phương thêm lịch từ link có 3402');
select t.bang(pg_temp.can_thay(), '1509,3402', 'YC6.6-NT5 YC6-H7 Sale Phương thấy 1509 và 3402');
select t.thoat();
select t.bang((select pham_vi || '|' || nguon from public.ket_noi where chu_id = t.id('hoa') and sale_id = t.id('nga')),
              'chon_can|gui_lich', 'YC6.6-NT5 kết nối của Sale Phương vẫn là danh sách căn');
select t.dang_nhap(t.id('hung'));
select t.bang(t.gt($$public.fn_xem_link_moi(pg_temp.ma('l3402'))->>'da_them'$$), 'true',
              'YC6.6-NT5 Sale Hùng (tất cả căn) mở link gửi lịch: đã thêm (A10-01)');
select t.bang(t.gt($$public.fn_them_lich_link_moi(pg_temp.ma('l3402'))$$), 'da_co',
              'YC6.6-NT5 Sale Hùng bấm "Thêm lịch" trả "đã có"');
select t.bang(pg_temp.can_thay(), '1509,2105,3402', 'YC6.6-NT5 Sale Hùng vẫn thấy mọi căn của Chị Hoa');
select t.thoat();
select t.bang((select pham_vi || '|' || nguon || '|' || xem_coc from public.ket_noi where id = t.kn('hoa', 'hung')),
              'tat_ca|link_moi|true', 'YC6.6-NT5 YC6-H7 kết nối của Sale Hùng vẫn là "tất cả căn", không đổi nguồn, quyền cọc');
select t.bang((select count(*) from public.ket_noi_can where ket_noi_id = t.kn('hoa', 'hung')), 0::bigint,
              'YC6.6-NT5 kết nối "tất cả căn" không có dòng danh sách căn');
-- Sale Lan (chỉ 1509, cọc tắt) thêm từ link có 1509 và 3402: thêm 3402, không đổi quyền cọc.
update public.ket_noi set xem_coc = false where id = t.kn('hoa', 'lan');
select t.dang_nhap(t.id('hoa'));
select pg_temp.luu('lca', t.gt($$(select ma from public.fn_gui_lich(array[t.can('1509'), t.can('3402')]))$$));
select t.thoat();
select t.dang_nhap(t.id('lan'));
select t.bang(t.gt($$public.fn_them_lich_link_moi(pg_temp.ma('lca'))$$), 'da_them',
              'YC6.6-NT5 Sale Lan (chỉ 1509) thêm từ link có 1509 và 3402');
select t.bang(pg_temp.can_thay(), '1509,3402', 'YC6.6-NT5 Sale Lan thấy 1509 và 3402, không mất 1509');
select t.thoat();
select t.bang((select pham_vi || '|' || nguon || '|' || xem_coc from public.ket_noi where id = t.kn('hoa', 'lan')),
              'chon_can|link_moi|false', 'YC6.6-NT5 YC6-H7 kết nối của Sale Lan giữ nguồn, quyền cọc đã đặt');

-- ===== Căn trong link bị xóa sau khi gửi =====
select t.dang_nhap(t.id('hoa'));
select pg_temp.luu('lxoa', t.gt($$(select ma from public.fn_gui_lich(array[t.can('3402'), '00000000-0000-0000-0001-000000002105'::uuid]))$$));
select t.thoat();
update public.can set an_luc = now() where id = '00000000-0000-0000-0001-000000002105';
select t.khach();
select t.bang(t.gt($$public.fn_xem_link_moi(pg_temp.ma('lxoa'))->>'so_can'$$) || '|'
              || t.gt($$(select string_agg(c->>'ma_can', ',') from jsonb_array_elements(public.fn_xem_link_moi(pg_temp.ma('lxoa'))->'can') c)$$),
              '1|3402', 'YC6.6 xem trước link gửi lịch chỉ có căn trong link còn chưa xóa');
select t.thoat();

-- ===== Sale đã bỏ nguồn, chủ đã ngừng =====
insert into auth.users (id) values ('00000000-0000-0000-0000-000000000016');
insert into public.profiles (id, ten, ten_hien_thi, so_dien_thoai, vai_chon)
values ('00000000-0000-0000-0000-000000000016', 'Sale Bỏ', 'Sale Bỏ', '0900000016', 'sale')
on conflict (id) do update set vai_chon = 'sale';
insert into public.ket_noi (chu_id, sale_id, trang_thai, nguon, pham_vi)
values (t.id('hoa'), '00000000-0000-0000-0000-000000000016', 'sale_bo', 'link_moi', 'tat_ca');
select t.dang_nhap('00000000-0000-0000-0000-000000000016');
select t.bang(t.gt($$public.fn_them_lich_link_moi(pg_temp.ma('l1509'))$$), 'da_them',
              'YC6.6 YC6-H7 sale đã bỏ nguồn thêm lịch từ link gửi lịch được');
select t.bang(pg_temp.can_thay(), '1509', 'YC6.6 YC6-H7 sale đã bỏ nguồn: phạm vi đúng các căn trong link');
select t.thoat();
select t.bang((select trang_thai || '|' || nguon || '|' || pham_vi from public.ket_noi
               where chu_id = t.id('hoa') and sale_id = '00000000-0000-0000-0000-000000000016'),
              'da_ket_noi|gui_lich|chon_can', 'YC6.6 YC6-H7 sale đã bỏ nguồn thành đã kết nối, nguồn gửi lịch');
update public.ket_noi set trang_thai = 'chu_ngung', ngung_luc = now() where chu_id = t.id('hoa') and sale_id = t.id('nga');
select t.dang_nhap(t.id('nga'));
select t.loi($$select public.fn_them_lich_link_moi(pg_temp.ma('lca'))$$, '42501',
             'YC6.6 PQ17.CHU sale đã bị Chị Hoa ngừng không tự kết nối lại bằng link gửi lịch');
select t.bang(coalesce(pg_temp.can_thay(), ''), '', 'YC6.6 PQ4.SALE sale đã bị ngừng không thấy căn nào của Chị Hoa');
select t.thoat();
select t.bang((select trang_thai from public.ket_noi where chu_id = t.id('hoa') and sale_id = t.id('nga')), 'chu_ngung',
              'YC6.6 PQ17.CHU kết nối đã ngừng giữ nguyên');
-- Vai sai và link của chính mình (như link mời).
select t.dang_nhap(t.id('hoa'));
select t.bang(t.gt($$public.fn_xem_link_moi(pg_temp.ma('l1509'))->>'cua_minh'$$), 'true',
              'YC6.6 YC6-H15 Chị Hoa mở link gửi lịch của mình: báo link của mình');
select t.loi($$select public.fn_them_lich_link_moi(pg_temp.ma('l1509'))$$, '42501',
             'YC6.6 YC6-H15 Chị Hoa không kết nối với chính mình');
select t.thoat();
select t.dang_nhap(t.id('tuan'));
select t.bang(t.gt($$public.fn_xem_link_moi(pg_temp.ma('l1509'))->>'sai_vai'$$), 'true',
              'YC6.6 YC6-H14 Anh Tuấn (vai chủ nhà) mở link gửi lịch: sai vai');
select t.loi($$select public.fn_them_lich_link_moi(pg_temp.ma('l1509'))$$, '42501',
             'YC6.6 YC6-H14 Anh Tuấn (vai chủ nhà) không thêm lịch được');
select t.thoat();

-- ===== Link gửi lịch hết hạn, chủ đã xóa tài khoản =====
update public.link_moi set het_han_luc = now() - interval '1 minute' where ma = pg_temp.ma('l1509b');
select t.khach();
select t.bang(t.gt($$public.fn_xem_link_moi(pg_temp.ma('l1509b'))$$), '{"trang_thai": "het_han"}',
              'YC6.6 YC6-H9 link gửi lịch quá 21 ngày: xem trước báo hết hạn, không dữ liệu');
select t.thoat();
select t.dang_nhap(t.id('lan'));
select t.loi($$select public.fn_them_lich_link_moi(pg_temp.ma('l1509b'))$$, 'Link mời đã hết hạn.',
             'YC6.6 YC6-H9 "Thêm lịch" với link gửi lịch quá 21 ngày bị từ chối');
select t.thoat();
select pg_temp.header_link(pg_temp.ma('l1509b'));
select t.khach();
select t.bang(t.so($$select * from storage.objects where bucket_id = 'anh-can'$$), 0::bigint,
              'YC6.6 PQ3.LINK link gửi lịch hết hạn: không mở được ảnh');
select t.thoat();
select pg_temp.dia_chi('10.6.0.3');
update public.profiles set so_dien_thoai = null, da_xoa_luc = now() where id = t.id('hoa');
select t.khach();
select t.bang(t.gt($$public.fn_xem_link_moi(pg_temp.ma('lca'))$$), '{"trang_thai": "khong_dung_duoc"}',
              'YC6.6 YC6-H5 chủ đã xóa tài khoản: link gửi lịch như đã thu hồi');
select t.thoat();
update public.profiles set so_dien_thoai = '0900000001', da_xoa_luc = null where id = t.id('hoa');
