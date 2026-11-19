-- US37 · Link mời của chủ nhà và sale thêm lịch (YC6.3). Viết trước migration (US37-TA1, CL14.5): task sau không sửa file này.
-- Hợp đồng database cho màn CN7, A1-link, A1-link-01, A10, A10-01:
--   fn_lay_link_moi()              ghi, chủ nhà: trả link mời đang dùng nếu còn hạn, không thì tạo mới; tăng số lần gửi.
--                                  Trả (ma, so_lan_gui, het_han_luc).
--   fn_doi_link_moi()              ghi, chủ nhà: thu hồi link mời đang dùng (YC6-H10). Lần lấy sau tạo link mới.
--   fn_xem_link_moi(ma)            đọc, anon và authenticated: jsonb {trang_thai: hop_le | khong_dung_duoc | het_han,
--                                  ten_chu, so_can, can: [{ma_can, so_phong_ngu, so_giuong, loai_view, ten_toa, anh}],
--                                  da_them, cua_minh, sai_vai}. Không có giá. Link hỏng chỉ có trang_thai.
--                                  Mỗi địa chỉ (x-forwarded-for) tối đa 30 lần một phút, lần sau P0001.
--   fn_them_lich_link_moi(ma)      ghi, sale: tạo kết nối đã kết nối, nguồn link mời, tất cả căn, cọc bật. Trả 'da_them',
--                                  hay 'da_co' khi đã có kết nối (không tạo thêm). Link hỏng: P0001 kèm câu A1-link-01.
--                                  Link của chính mình, vai chủ nhà, chủ đã ngừng: 42501.
--   Kho ảnh: ảnh căn của link hợp lệ đọc được khi gửi header x-link-moi = mã link (anon và authenticated).
select t.fixture();

-- Anh Tuấn có 2 căn: Sapphire 1103 (3PN · 2 giường · view thành phố), À La Carte 2208 (1PN · 1 giường · view biển),
-- và một căn đã xóa (không vào xem trước). Mỗi căn một ảnh.
insert into public.toa_nha (id, ten, home247_dat_san) values ('00000000-0000-0000-0002-000000002208', 'À La Carte', true);
update public.can set loai_view = 'view thành phố' where id = t.can('1103');
insert into public.can (id, nguoi_giu, loai, ma_can, so_phong_ngu, so_giuong, loai_view, toa_nha_id)
values ('00000000-0000-0000-0001-000000002208', t.id('tuan'), 'co_lich', '2208', 1, 1, 'view biển',
        '00000000-0000-0000-0002-000000002208');
insert into public.can (id, nguoi_giu, loai, ma_can, an_luc)
values ('00000000-0000-0000-0001-00000000dead', t.id('tuan'), 'co_lich', '9999', now());
insert into public.gia_thang (can_id, thang, gia_thuong, gia_cuoi_tuan)
values ('00000000-0000-0000-0001-000000002208', '2026-11-01', 654321, 765432);
insert into public.anh_can (can_id, nguoi_tai, duong_dan, thu_tu)
values (t.can('1103'), t.id('tuan'), t.id('tuan') || '/anh-1103.jpg', 0),
       ('00000000-0000-0000-0001-000000002208', t.id('tuan'), t.id('tuan') || '/anh-2208.jpg', 0),
       (t.can('1509'), t.id('hoa'), t.id('hoa') || '/anh-1509.jpg', 0);
insert into storage.objects (bucket_id, name)
values ('anh-can', t.id('tuan') || '/anh-1103.jpg'), ('anh-can', t.id('tuan') || '/anh-2208.jpg'),
       ('anh-can', t.id('hoa') || '/anh-1509.jpg');

-- Đặt địa chỉ người gọi như PostgREST (request.headers).
create or replace function pg_temp.dia_chi(ip text) returns void language sql as $$
  select set_config('request.headers', json_build_object('x-forwarded-for', ip)::text, true)
$$;
-- Header của dịch vụ kho khi app xin ảnh xem trước.
create or replace function pg_temp.header_link(ma text) returns void language sql as $$
  select set_config('request.headers', json_build_object('x-forwarded-for', '10.9.9.9', 'x-link-moi', ma)::text, true)
$$;
-- Lưu mã link để các phần sau dùng (đặt bằng vai chủ database, đọc bằng mọi vai).
create or replace function pg_temp.luu(ten text, gt text) returns void language sql as $$
  select set_config('t.link_' || ten, gt, true)
$$;
create or replace function pg_temp.ma(ten text) returns text language sql as $$
  select current_setting('t.link_' || ten, true)
$$;

select pg_temp.dia_chi('10.0.0.1');

-- ===== Danh mục =====
select t.ok((select count(distinct proname) from pg_proc
             where proname in ('fn_lay_link_moi', 'fn_doi_link_moi', 'fn_xem_link_moi', 'fn_them_lich_link_moi')
               and pronamespace = 'public'::regnamespace and prosecdef) = 4,
            'YC6.3 danh mục: bốn hàm của link mời có và chạy security definer');
select t.ok(exists (select 1 from pg_proc p where p.proname = 'fn_xem_link_moi' and p.pronamespace = 'public'::regnamespace
                   and has_function_privilege('anon', p.oid, 'execute')),
            'YC6.3 PQ18.LINK người chưa đăng nhập gọi được fn_xem_link_moi');
select t.ok(not exists (select 1 from pg_proc p
                        where p.proname in ('fn_lay_link_moi', 'fn_doi_link_moi', 'fn_them_lich_link_moi')
                          and p.pronamespace = 'public'::regnamespace and has_function_privilege('anon', p.oid, 'execute')),
            'YC6.3 PQ18.LINK người chưa đăng nhập không gọi được lấy link, đổi link, thêm lịch');
select t.ok(not has_table_privilege('authenticated', 'public.link_moi', 'INSERT')
            and not has_table_privilege('authenticated', 'public.link_moi', 'UPDATE')
            and not has_table_privilege('authenticated', 'public.ket_noi', 'INSERT'),
            'YC6.3 PQ18 app không ghi thẳng link_moi, ket_noi; chỉ qua hàm');

-- ===== YC6.3-NT7: Anh Tuấn bấm "Chia sẻ link mời" hai lần =====
select t.dang_nhap(t.id('tuan'));
select pg_temp.luu('tuan1', t.gt($$(select ma from public.fn_lay_link_moi())$$));
select pg_temp.luu('tuan1b', t.gt($$(select ma || '|' || so_lan_gui from public.fn_lay_link_moi())$$));
select t.thoat();
select t.ok(pg_temp.ma('tuan1') is not null, 'YC6.3-NT7 lần bấm đầu trả một link mời');
select t.bang(pg_temp.ma('tuan1b'), pg_temp.ma('tuan1') || '|2',
              'YC6.3-NT7 hai lần bấm trong hạn dùng cùng một link, số lần gửi là 2');
select t.bang((select count(*) from public.link_moi where chu_id = t.id('tuan') and loai = 'moi_sale'), 1::bigint,
              'YC6.3-NT7 chỉ có một link mời của Anh Tuấn');
select t.ok((select so_lan_gui = 2 and gui_cuoi_luc is not null
                    and het_han_luc between now() + interval '20 days 23 hours' and now() + interval '21 days 1 hour'
             from public.link_moi where ma = pg_temp.ma('tuan1')),
            'YC6.3-NT7 link ghi số lần gửi, lần gửi cuối, hạn 21 ngày');
select t.ok(char_length(pg_temp.ma('tuan1')) >= 20 and pg_temp.ma('tuan1') ~ '^[A-Za-z0-9_-]+$'
            and position('0900000002' in pg_temp.ma('tuan1')) = 0
            and position(replace(t.id('tuan')::text, '-', '') in replace(pg_temp.ma('tuan1'), '-', '')) = 0,
            'YC6.3 quy tắc "Link mời": mã ngẫu nhiên đủ dài, dùng được trong địa chỉ, không chứa số điện thoại hay mã người dùng');
select t.dang_nhap(t.id('hung'));
select t.loi($$select * from public.fn_lay_link_moi()$$, '42501', 'YC6.3 PQ18.SALE sale không tạo được link mời của chủ nhà');
select t.bang(t.so($$select * from public.link_moi$$), 0::bigint,
              'YC6.3 PQ18.CHU Sale Hùng không đọc được link mời của Anh Tuấn');
select t.thoat();
select t.khach();
select t.loi($$select * from public.fn_lay_link_moi()$$, '42501', 'YC6.3 PQ18.LINK người chưa đăng nhập không tạo được link mời');
select t.thoat();

-- ===== YC6.3-NT2: xem trước link mời của chủ nhà có 2 căn =====
select t.khach();
select t.bang(t.gt($$public.fn_xem_link_moi(pg_temp.ma('tuan1'))->>'trang_thai'$$), 'hop_le',
              'YC6.3-NT2 chưa đăng nhập: link hợp lệ');
select t.bang(t.gt($$public.fn_xem_link_moi(pg_temp.ma('tuan1'))->>'ten_chu'$$), 'Anh Tuấn',
              'YC6.3-NT2 chưa đăng nhập: có tên chủ nhà');
select t.bang(t.gt($$public.fn_xem_link_moi(pg_temp.ma('tuan1'))->>'so_can'$$), '2',
              'YC6.3-NT2 chưa đăng nhập: "2 căn" (căn đã xóa không tính)');
select t.bang(t.gt($$(select string_agg(c->>'ten_toa' || ' ' || (c->>'ma_can') || ':' || (c->>'so_phong_ngu') || 'PN:'
                                       || (c->>'so_giuong') || ':' || (c->>'loai_view') || ':' || coalesce(c->>'anh', '-'),
                                       ',' order by c->>'ma_can')
                      from jsonb_array_elements(public.fn_xem_link_moi(pg_temp.ma('tuan1'))->'can') c)$$),
              'Sapphire 1103:3PN:2:view thành phố:' || t.id('tuan') || '/anh-1103.jpg,'
              || 'À La Carte 2208:1PN:1:view biển:' || t.id('tuan') || '/anh-2208.jpg',
              'YC6.3-NT2 chưa đăng nhập: thông tin sơ lược và ảnh từng căn');
select t.ok(t.gt($$public.fn_xem_link_moi(pg_temp.ma('tuan1'))$$) !~* '(gia|"tien|654321|765432|700000|muc_cong)',
            'YC6.3-NT2 KT-DB.3.1 chưa đăng nhập: không có giá nào trong dữ liệu trả về');
select t.ok(t.gt($$public.fn_xem_link_moi(pg_temp.ma('tuan1'))$$) !~ '(0900000002|so_dien_thoai)',
            'YC6.3 PQ2.LINK xem trước không có số điện thoại chủ nhà');
select t.bang(t.gt($$public.fn_xem_link_moi(pg_temp.ma('tuan1'))->>'da_them'$$), 'false',
              'YC6.3-NT2 chưa đăng nhập: chưa thêm');
select t.loi($$select public.fn_them_lich_link_moi(pg_temp.ma('tuan1'))$$, '42501',
             'YC6.3 PQ17.LINK người chưa đăng nhập không thêm lịch được');
select t.thoat();
select t.dang_nhap(t.id('hung'));
select t.bang(t.gt($$public.fn_xem_link_moi(pg_temp.ma('tuan1'))->>'ten_chu'$$) || '|'
              || t.gt($$public.fn_xem_link_moi(pg_temp.ma('tuan1'))->>'so_can'$$) || '|'
              || t.gt($$jsonb_array_length(public.fn_xem_link_moi(pg_temp.ma('tuan1'))->'can')$$),
              'Anh Tuấn|2|2', 'YC6.3-NT2 đã đăng nhập: có tên chủ nhà, "2 căn", hai căn');
select t.ok(t.gt($$public.fn_xem_link_moi(pg_temp.ma('tuan1'))$$) !~* '(gia|"tien|654321|765432|700000|muc_cong)',
            'YC6.3-NT2 đã đăng nhập: không có giá nào trong dữ liệu trả về');
select t.bang(t.gt($$public.fn_xem_link_moi(pg_temp.ma('tuan1'))->>'da_them'$$) || '|'
              || t.gt($$public.fn_xem_link_moi(pg_temp.ma('tuan1'))->>'cua_minh'$$) || '|'
              || t.gt($$public.fn_xem_link_moi(pg_temp.ma('tuan1'))->>'sai_vai'$$),
              'false|false|false', 'YC6.3 bước 4 Sale Hùng chưa thêm: không phải link của mình, đúng vai');

-- ===== YC6.3-NT3: Hùng rời A10 không bấm =====
select t.thoat();
select t.bang((select count(*) from public.ket_noi where chu_id = t.id('tuan') and sale_id = t.id('hung')), 0::bigint,
              'YC6.3-NT3 xem trước xong, Sale Hùng chưa có kết nối với Anh Tuấn');
select t.dang_nhap(t.id('hung'));
select t.bang(t.so($$select * from public.my_shared_can_ids() x where x in (select id from public.can where nguoi_giu = t.id('tuan'))$$),
              0::bigint, 'YC6.3-NT3 Sale Hùng chưa thấy căn nào của Anh Tuấn');

-- ===== YC6.3-NT4: Hùng bấm "Thêm lịch của Anh Tuấn" =====
select t.bang(t.gt($$public.fn_them_lich_link_moi(pg_temp.ma('tuan1'))$$), 'da_them',
              'YC6.3-NT4 Sale Hùng bấm "Thêm lịch" được');
select t.bang(t.gt($$(select string_agg(c.ma_can, ',' order by c.ma_can) from public.can c
                      where c.id in (select public.my_shared_can_ids()) and c.nguoi_giu = t.id('tuan'))$$),
              '1103,2208', 'YC6.3-NT4 Sapphire 1103 và À La Carte 2208 có trong lịch của Sale Hùng');
select t.thoat();
select t.bang((select trang_thai || '|' || nguon || '|' || pham_vi || '|' || xem_coc from public.ket_noi
               where chu_id = t.id('tuan') and sale_id = t.id('hung')),
              'da_ket_noi|link_moi|tat_ca|true', 'YC6.3-NT4 bước 5 kết nối đã kết nối, nguồn link mời, tất cả căn, cọc bật mặc định');
select t.bang((select count(*) from public.thong_bao where nguoi_nhan in (t.id('tuan'), t.id('hung'))), 0::bigint,
              'YC6.3 YC6-H6 sale tự bấm "Thêm lịch" không ghi thông báo');
select t.dang_nhap(t.id('tuan'));
select t.bang(t.gt($$(select nhom from public.fn_ds_sale_cua_toi() where ten = 'Sale Hùng')$$), 'da_ket_noi',
              'YC6.3-NT4 Sale Hùng ở nhóm "Đã kết nối" của Anh Tuấn');
select t.thoat();
-- Quy tắc "Phạm vi căn": căn mới của chủ nhà tự vào phạm vi "tất cả căn".
insert into public.can (id, nguoi_giu, loai, ma_can) values ('00000000-0000-0000-0001-000000003333', t.id('tuan'), 'co_lich', '3333');
select t.dang_nhap(t.id('hung'));
select t.ok('00000000-0000-0000-0001-000000003333'::uuid in (select public.my_shared_can_ids()),
            'YC6.3 quy tắc "Phạm vi căn" căn mới của Anh Tuấn tự vào lịch của Sale Hùng');
select t.thoat();
delete from public.can where id = '00000000-0000-0000-0001-000000003333';

-- ===== YC6.3-NT5: Hùng đã thêm mở lại link =====
select pg_temp.dia_chi('10.0.0.2');
select t.dang_nhap(t.id('hung'));
select t.bang(t.gt($$public.fn_xem_link_moi(pg_temp.ma('tuan1'))->>'da_them'$$), 'true',
              'YC6.3-NT5 xem trước trả "đã thêm" (A10-01)');
select t.bang(t.gt($$public.fn_them_lich_link_moi(pg_temp.ma('tuan1'))$$), 'da_co',
              'YC6.3-NT5 bấm thêm lần nữa trả "đã có", không lỗi');
select t.thoat();
select t.bang((select count(*) from public.ket_noi where chu_id = t.id('tuan') and sale_id = t.id('hung')), 1::bigint,
              'YC6.3-NT5 vẫn chỉ có một kết nối giữa Sale Hùng và Anh Tuấn');

-- ===== YC6.3-NT10: Anh Tuấn mở link của mình, Chị Hoa (vai chủ nhà) mở link đó =====
select t.dang_nhap(t.id('tuan'));
select t.bang(t.gt($$public.fn_xem_link_moi(pg_temp.ma('tuan1'))->>'cua_minh'$$), 'true',
              'YC6.3-NT10 Anh Tuấn mở link của mình: xem trước báo là link của mình');
select t.loi($$select public.fn_them_lich_link_moi(pg_temp.ma('tuan1'))$$, '42501',
             'YC6.3-NT10 YC6-H15 database từ chối Anh Tuấn kết nối với chính mình');
select t.thoat();
select t.dang_nhap(t.id('hoa'));
select t.bang(t.gt($$public.fn_xem_link_moi(pg_temp.ma('tuan1'))->>'sai_vai'$$) || '|'
              || t.gt($$public.fn_xem_link_moi(pg_temp.ma('tuan1'))->>'cua_minh'$$),
              'true|false', 'YC6.3-NT10 Chị Hoa (vai chủ nhà) mở link: xem trước báo sai vai');
select t.loi($$select public.fn_them_lich_link_moi(pg_temp.ma('tuan1'))$$, '42501',
             'YC6.3-NT10 YC6-H14 database từ chối Chị Hoa (vai chủ nhà) kết nối');
select t.thoat();
select t.bang((select count(*) from public.ket_noi where chu_id = t.id('tuan') and sale_id in (t.id('tuan'), t.id('hoa'))),
              0::bigint, 'YC6.3-NT10 không có kết nối mới của Anh Tuấn với chính mình hay Chị Hoa');

-- ===== Kho ảnh: xem trước có ảnh, chỉ khi có mã link hợp lệ =====
select pg_temp.header_link(pg_temp.ma('tuan1'));
select t.khach();
select t.bang(t.so($$select * from storage.objects where bucket_id = 'anh-can'$$), 2::bigint,
              'YC6.3-NT2 PQ3.LINK có mã link hợp lệ: người chưa đăng nhập mở được ảnh hai căn của Anh Tuấn, không ảnh của chủ khác');
select t.thoat();
select set_config('request.headers', '{"x-forwarded-for":"10.9.9.9"}', true);
select t.khach();
select t.bang(t.so($$select * from storage.objects where bucket_id = 'anh-can'$$), 0::bigint,
              'YC6.3 PQ3.LINK không có mã link: người chưa đăng nhập không mở được ảnh nào');
select t.thoat();
select pg_temp.header_link('khong-co-link-nay-1234567890');
select t.khach();
select t.bang(t.so($$select * from storage.objects where bucket_id = 'anh-can'$$), 0::bigint,
              'YC6.3 PQ3.LINK mã link sai: không mở được ảnh nào');
select t.thoat();
select pg_temp.dia_chi('10.0.0.3');

-- ===== YC6.3-NT6: link quá 21 ngày, đã thu hồi, người tạo đã xóa tài khoản =====
insert into public.link_moi (ma, loai, chu_id, het_han_luc, tao_luc)
values ('LinkHetHanCuaChiHoa_0000001', 'moi_sale', t.id('hoa'), now() - interval '1 day', now() - interval '22 days'),
       ('LinkThuHoiCuaChiHoa_0000002', 'moi_sale', t.id('hoa'), now() + interval '5 days', now() - interval '16 days');
update public.link_moi set thu_hoi_luc = now() - interval '1 hour' where ma = 'LinkThuHoiCuaChiHoa_0000002';
select t.khach();
select t.bang(t.gt($$public.fn_xem_link_moi('LinkHetHanCuaChiHoa_0000001')->>'trang_thai'$$), 'het_han',
              'YC6.3-NT6 link quá 21 ngày: xem trước báo đã hết hạn');
select t.bang(t.gt($$public.fn_xem_link_moi('LinkHetHanCuaChiHoa_0000001') - 'trang_thai'$$), '{}',
              'YC6.3-NT6 link quá 21 ngày: không có dữ liệu chủ nhà, căn');
select t.bang(t.gt($$public.fn_xem_link_moi('LinkThuHoiCuaChiHoa_0000002')->>'trang_thai'$$), 'khong_dung_duoc',
              'YC6.3-NT6 link đã thu hồi: xem trước báo không còn dùng được');
select t.bang(t.gt($$public.fn_xem_link_moi('LinkThuHoiCuaChiHoa_0000002') - 'trang_thai'$$), '{}',
              'YC6.3-NT6 link đã thu hồi: không có dữ liệu chủ nhà, căn');
select t.bang(t.gt($$public.fn_xem_link_moi('khong-co-link-nay-1234567890')->>'trang_thai'$$), 'khong_dung_duoc',
              'YC6.3 link sai mã: báo không còn dùng được');
select t.thoat();
select t.dang_nhap(t.id('nga'));
select t.loi($$select public.fn_them_lich_link_moi('LinkHetHanCuaChiHoa_0000001')$$, 'Link mời đã hết hạn.',
             'YC6.3-NT6 "Thêm lịch" với link quá 21 ngày bị từ chối');
select t.loi($$select public.fn_them_lich_link_moi('LinkThuHoiCuaChiHoa_0000002')$$, 'Link mời không còn dùng được.',
             'YC6.3-NT6 "Thêm lịch" với link đã thu hồi bị từ chối');
select t.thoat();
select t.bang((select count(*) from public.ket_noi where sale_id = t.id('nga')), 0::bigint,
              'YC6.3-NT6 không có kết nối mới của Sale Nga');
-- YC6-H5: người tạo link đã xóa tài khoản thì như link đã thu hồi.
select t.dang_nhap(t.id('hoa'));
select pg_temp.luu('hoa1', t.gt($$(select ma from public.fn_lay_link_moi())$$));
select t.thoat();
select t.ok(pg_temp.ma('hoa1') is not null
            and pg_temp.ma('hoa1') not in ('LinkHetHanCuaChiHoa_0000001', 'LinkThuHoiCuaChiHoa_0000002'),
            'YC6.3 bước 1 link cũ hết hạn hay thu hồi thì lần gửi tạo link mới');
update public.profiles set so_dien_thoai = null, da_xoa_luc = now() where id = t.id('hoa');
select t.khach();
select t.bang(t.gt($$public.fn_xem_link_moi(pg_temp.ma('hoa1'))$$), '{"trang_thai": "khong_dung_duoc"}',
              'YC6.3-NT6 YC6-H5 người tạo đã xóa tài khoản: xem trước như link đã thu hồi');
select t.thoat();
select t.dang_nhap(t.id('nga'));
select t.loi($$select public.fn_them_lich_link_moi(pg_temp.ma('hoa1'))$$, 'Link mời không còn dùng được.',
             'YC6.3-NT6 YC6-H5 người tạo đã xóa tài khoản: "Thêm lịch" bị từ chối');
select t.thoat();
update public.profiles set so_dien_thoai = '0900000001', da_xoa_luc = null where id = t.id('hoa');
select t.bang((select count(*) from public.ket_noi where sale_id = t.id('nga')), 0::bigint,
              'YC6.3-NT6 YC6-H5 không có kết nối mới khi người tạo đã xóa tài khoản');

-- ===== YC6.3-NT9: Anh Tuấn bấm "Đổi link mời" và đồng ý =====
select t.dang_nhap(t.id('tuan'));
select t.khong_loi($$select public.fn_doi_link_moi()$$, 'YC6.3-NT9 Anh Tuấn đổi link mời được');
select t.thoat();
select t.khach();
select t.bang(t.gt($$public.fn_xem_link_moi(pg_temp.ma('tuan1'))$$), '{"trang_thai": "khong_dung_duoc"}',
              'YC6.3-NT9 link cũ bị từ chối khi xem trước');
select t.thoat();
select t.dang_nhap(t.id('lan'));
select t.loi($$select public.fn_them_lich_link_moi(pg_temp.ma('tuan1'))$$, 'Link mời không còn dùng được.',
             'YC6.3-NT9 link cũ bị từ chối khi thêm lịch');
select t.thoat();
select t.bang((select count(*) from public.ket_noi where chu_id = t.id('tuan') and sale_id = t.id('lan')), 0::bigint,
              'YC6.3-NT9 không có kết nối mới từ link cũ');
select t.dang_nhap(t.id('tuan'));
select t.bang(t.gt($$(select nhom from public.fn_ds_sale_cua_toi() where ten = 'Sale Hùng')$$), 'da_ket_noi',
              'YC6.3-NT9 QD8 YC6-H3 Sale Hùng (đã thêm trước đó) vẫn ở nhóm "Đã kết nối"');
select pg_temp.luu('tuan2', t.gt($$(select ma || '|' || so_lan_gui from public.fn_lay_link_moi())$$));
select t.thoat();
select t.ok(split_part(pg_temp.ma('tuan2'), '|', 1) <> pg_temp.ma('tuan1') and split_part(pg_temp.ma('tuan2'), '|', 2) = '1',
            'YC6.3-NT9 lần "Chia sẻ link mời" sau trả link khác, số lần gửi đếm lại từ 1');
select pg_temp.header_link(pg_temp.ma('tuan1'));
select t.khach();
select t.bang(t.so($$select * from storage.objects where bucket_id = 'anh-can'$$), 0::bigint,
              'YC6.3-NT9 link cũ đã đổi: không mở được ảnh xem trước');
select t.thoat();
select pg_temp.dia_chi('10.0.0.4');
-- Đổi link chỉ chạm link của người gọi.
select t.dang_nhap(t.id('hoa'));
select t.khong_loi($$select public.fn_doi_link_moi()$$, 'YC6.3 PQ18.CHU Chị Hoa đổi link mời của mình');
select t.thoat();
select t.ok((select thu_hoi_luc is null from public.link_moi where ma = split_part(pg_temp.ma('tuan2'), '|', 1)),
            'YC6.3 PQ18.CHU Chị Hoa đổi link không thu hồi link của Anh Tuấn');
select t.dang_nhap(t.id('hung'));
select t.khong_loi($$select public.fn_doi_link_moi()$$, 'YC6.3 PQ18 sale gọi đổi link không lỗi, không có gì để đổi');
select t.thoat();
select t.ok((select thu_hoi_luc is null from public.link_moi where ma = split_part(pg_temp.ma('tuan2'), '|', 1)),
            'YC6.3 PQ18 Sale Hùng gọi đổi link không thu hồi link của Anh Tuấn');
select t.khach();
select t.loi($$select public.fn_doi_link_moi()$$, '42501', 'YC6.3 PQ18.LINK người chưa đăng nhập không đổi được link');
select t.thoat();

-- ===== Kết nối cũ đã bị chủ ngừng: link mời không tự mở lại =====
insert into public.ket_noi (chu_id, sale_id, trang_thai, nguon, pham_vi) values (t.id('tuan'), t.id('nga'), 'chu_ngung', 'link_moi', 'tat_ca');
select t.dang_nhap(t.id('nga'));
select t.loi($$select public.fn_them_lich_link_moi(split_part(pg_temp.ma('tuan2'), '|', 1))$$, '42501',
             'YC6.3 PQ17.CHU sale đã bị Anh Tuấn ngừng không tự kết nối lại bằng link mời');
select t.thoat();
select t.bang((select trang_thai from public.ket_noi where chu_id = t.id('tuan') and sale_id = t.id('nga')), 'chu_ngung',
              'YC6.3 PQ17.CHU kết nối đã ngừng giữ nguyên');

-- ===== YC6.3-NT8: một địa chỉ xem trước quá 30 lần trong một phút =====
select pg_temp.dia_chi('10.0.0.30');
select t.khach();
select t.bang((select count(*) from generate_series(1, 30) i
               where t.gt($$public.fn_xem_link_moi('khong-co-link-nay-1234567890')->>'trang_thai'$$) = 'khong_dung_duoc'),
              30::bigint, 'YC6.3-NT8 30 lần đầu trong một phút vẫn trả lời');
select t.loi($$select public.fn_xem_link_moi(split_part(pg_temp.ma('tuan2'), '|', 1))$$, 'P0001',
             'YC6.3-NT8 lần thứ 31 trong một phút bị từ chối');
select t.loi($$select public.fn_xem_link_moi(split_part(pg_temp.ma('tuan2'), '|', 1))$$, 'P0001',
             'YC6.3-NT8 lần thứ 32 trong một phút vẫn bị từ chối');
select t.thoat();
select pg_temp.dia_chi('10.0.0.31, 172.16.0.1');
select t.khach();
select t.bang(t.gt($$public.fn_xem_link_moi(split_part(pg_temp.ma('tuan2'), '|', 1))->>'trang_thai'$$), 'hop_le',
              'YC6.3-NT8 địa chỉ khác vẫn xem trước được');
select t.thoat();
select t.ok(not has_table_privilege('anon', 'public.xem_link_dem', 'SELECT')
            and not has_table_privilege('anon', 'public.xem_link_dem', 'DELETE')
            and not has_table_privilege('authenticated', 'public.xem_link_dem', 'DELETE'),
            'YC6.3-NT8 người dùng không đọc, không xóa được bảng đếm lần xem trước');
