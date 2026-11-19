-- US39 · Chủ nhà duyệt lời xin xem lịch (YC6.5). Viết trước migration (US39-TA1, CL14.5): task sau không sửa file này.
-- Hợp đồng database cho màn A8, A8-01:
--   fn_xem_link_xin_lich(ma)          đọc, chỉ authenticated (anon không có quyền thực thi, YC6.5-NT5):
--                                     jsonb {trang_thai: 'hop_le', ten_sale, so_dien_thoai (null khi sale chưa cho),
--                                     da_ket_noi}. Link không dùng được (sai mã, sale đã xóa tài khoản, người gọi đã ngừng
--                                     sale này, link của chính người gọi) chỉ trả {trang_thai: 'khong_dung_duoc'}.
--                                     Không ghi gì.
--   fn_dong_y_xin_lich(ma, xem_coc)   ghi, người đã đăng ký: người gọi thành chủ nhà của kết nối với sale của link.
--                                     Chưa có kết nối: tạo 'da_ket_noi', nguồn 'sale_xin', 'tat_ca', xem_coc theo công tắc,
--                                     ghi thông báo 'chu_dong_y_ket_noi' cho sale. Trả jsonb {ket_qua: 'da_ket_noi', ten_sale, co_can}.
--                                     Đã kết nối: không đổi gì, không báo, ket_qua 'da_co'.
--                                     Sale bỏ hay chưa kết nối: thành 'da_ket_noi', nguồn 'sale_xin', 'tat_ca', cọc theo
--                                     công tắc, có báo. Người gọi chưa ở vai chủ nhà thì chuyển sang vai chủ nhà.
--                                     Link không dùng được (như trên): P0001, không ghi gì.
--   "Từ chối" không gọi hàm nào, không ghi gì (YC6-H12).
select t.fixture();

-- Mã link xin lịch cố định (chỉ chữ cái như ma_link_chu_cai). Hoa→Lan của bộ mẫu bỏ đi để Lan chưa kết nối Chị Hoa.
insert into public.link_xin_lich (ma, sale_id) values
  ('xinLanAbcdefghjkmnpqrstuvwxyzABCD', t.id('lan')),
  ('xinHungAbcdefghjkmnpqrstuvwxyzABC', t.id('hung')),
  ('xinNgaAbcdefghjkmnpqrstuvwxyzABCD', t.id('nga'));
delete from public.ket_noi where id = t.kn('hoa', 'lan');
-- Đặt phòng của Sale Lan ở 1509 của Chị Hoa (đã cọc) và một đêm kín ở 3402 (chủ tự ghi).
select t.tao_booking('L1', t.can('1509'), '2026-12-10', '2026-12-12', 1800000, t.id('lan'), 'tu_yeu_cau');
update public.booking set trang_thai_tien = 'da_coc' where id = t.b('L1');
select t.tao_booking('C1', t.can('3402'), '2026-12-05', '2026-12-06', 800000);

create or replace function pg_temp.luu(ten text, gt text) returns void language sql as $$
  select set_config('t.dyx_' || ten, gt, true)
$$;
create or replace function pg_temp.lay(ten text) returns text language sql as $$
  select nullif(current_setting('t.dyx_' || ten, true), '')
$$;

-- ===== Danh mục =====
select t.ok((select count(distinct proname) from pg_proc
             where proname in ('fn_xem_link_xin_lich', 'fn_dong_y_xin_lich')
               and pronamespace = 'public'::regnamespace and prosecdef) = 2,
            'YC6.5 danh mục: hai hàm xem trước, đồng ý link xin lịch có và chạy security definer');
select t.ok(not exists (select 1 from pg_proc p
                        where p.proname in ('fn_xem_link_xin_lich', 'fn_dong_y_xin_lich')
                          and p.pronamespace = 'public'::regnamespace and has_function_privilege('anon', p.oid, 'execute')),
            'YC6.5-NT5 PQ18 người chưa đăng nhập không có quyền gọi xem trước, đồng ý link xin lịch');
select t.ok((select count(*) from pg_proc p
             where p.proname in ('fn_xem_link_xin_lich', 'fn_dong_y_xin_lich')
               and p.pronamespace = 'public'::regnamespace and has_function_privilege('authenticated', p.oid, 'execute')) = 2,
            'YC6.5 PQ18.CHU người đã đăng nhập gọi được xem trước và đồng ý');

-- ===== YC6.5-NT5: người chưa đăng nhập xem trước link xin lịch =====
select t.khach();
select t.ok(t.ma_loi($$select public.fn_xem_link_xin_lich('xinLanAbcdefghjkmnpqrstuvwxyzABCD')$$) is not null,
            'YC6.5-NT5 người chưa đăng nhập xem trước link xin lịch bị từ chối');
select t.ok(coalesce(t.gt($$public.fn_xem_link_xin_lich('xinLanAbcdefghjkmnpqrstuvwxyzABCD')$$), '') !~ '(Sale Lan|0900000004)',
            'YC6.5-NT5 người chưa đăng nhập không nhận được tên, số của sale');
select t.ok(t.ma_loi($$select public.fn_dong_y_xin_lich('xinLanAbcdefghjkmnpqrstuvwxyzABCD', true)$$) is not null,
            'YC6.5-NT5 người chưa đăng nhập không đồng ý được');
select t.ok(coalesce(t.so($$select * from public.profiles where id = t.id('lan')$$), 0) = 0,
            'YC6.5-NT5 người chưa đăng nhập không đọc thẳng hồ sơ sale');
select t.thoat();
select t.bang((select count(*) from public.ket_noi where sale_id = t.id('lan')), 0::bigint,
              'YC6.5-NT5 không có kết nối nào được tạo');

-- ===== YC6.5-NT1: Chị Hoa mở link xin lịch của Sale Lan =====
select t.dang_nhap(t.id('hoa'));
select pg_temp.luu('xem', t.gt($$public.fn_xem_link_xin_lich('xinLanAbcdefghjkmnpqrstuvwxyzABCD')$$));
select t.thoat();
select t.bang(pg_temp.lay('xem')::jsonb ->> 'trang_thai', 'hop_le', 'YC6.5-NT1 link xin lịch của Lan hợp lệ');
select t.bang(pg_temp.lay('xem')::jsonb ->> 'ten_sale', 'Sale Lan', 'YC6.5-NT1 A8 có tên của Lan');
select t.bang(pg_temp.lay('xem')::jsonb ->> 'so_dien_thoai', '0900000004', 'YC6.5-NT1 A8 có số của Lan');
select t.bang(pg_temp.lay('xem')::jsonb ->> 'da_ket_noi', 'false', 'YC6.5-NT1 Chị Hoa chưa kết nối Lan');
select t.ok((select array_agg(k order by k) from jsonb_object_keys(pg_temp.lay('xem')::jsonb) k)
              <@ array['da_ket_noi', 'so_dien_thoai', 'ten_sale', 'trang_thai'],
            'YC6.5-NT1 PQ18.LINK xem trước chỉ có tên, số, trạng thái; không có số lần gửi hay dữ liệu khác của sale');
select t.bang((select count(*) from public.ket_noi where sale_id = t.id('lan')), 0::bigint,
              'YC6.5 bước 1 mở A8 chưa ghi gì');
-- PQ2.CHU: số sale chỉ trả khi sale đã cho.
update public.profiles set so_dien_thoai = null where id = t.id('nga');
select t.dang_nhap(t.id('hoa'));
select pg_temp.luu('nga', t.gt($$public.fn_xem_link_xin_lich('xinNgaAbcdefghjkmnpqrstuvwxyzABCD')$$));
select t.thoat();
select t.ok(pg_temp.lay('nga')::jsonb ->> 'trang_thai' = 'hop_le'
            and pg_temp.lay('nga')::jsonb ->> 'ten_sale' = 'Sale Nga'
            and pg_temp.lay('nga')::jsonb ->> 'so_dien_thoai' is null,
            'YC6.5-NT1 PQ2.CHU sale chưa cho số thì A8 chỉ có tên, không có số');
update public.profiles set so_dien_thoai = '0900000005' where id = t.id('nga');
-- Mã sai.
select t.dang_nhap(t.id('hoa'));
select t.bang(t.gt($$public.fn_xem_link_xin_lich('khongCoMaNayAbcdefghjkmnpqrstuvw')$$), '{"trang_thai": "khong_dung_duoc"}',
              'YC6.5 bước 4 link sai: A8-01, không có tên, số nào');
select t.ok(t.ma_loi($$select public.fn_dong_y_xin_lich('khongCoMaNayAbcdefghjkmnpqrstuvw', true)$$) = 'P0001',
            'YC6.5 bước 4 đồng ý link sai bị từ chối');
select t.thoat();

-- ===== YC6.5-NT2: Chị Hoa tắt "Tình trạng cọc" rồi đồng ý =====
select t.dang_nhap(t.id('hoa'));
select pg_temp.luu('dy', t.gt($$public.fn_dong_y_xin_lich('xinLanAbcdefghjkmnpqrstuvwxyzABCD', false)$$));
select t.thoat();
select t.bang(pg_temp.lay('dy')::jsonb ->> 'ket_qua', 'da_ket_noi', 'YC6.5-NT2 đồng ý tạo kết nối');
select t.bang(pg_temp.lay('dy')::jsonb ->> 'ten_sale', 'Sale Lan', 'YC6.5 bước 2 trả tên sale cho toast');
select t.bang(pg_temp.lay('dy')::jsonb ->> 'co_can', 'true', 'YC6.5 bước 2 Chị Hoa có căn nên về tab Sale');
select t.ok((select xem_coc = false from public.ket_noi where chu_id = t.id('hoa') and sale_id = t.id('lan')),
            'YC6.5-NT2 kết nối ghi quyền cọc tắt theo công tắc');
select t.dang_nhap(t.id('lan'));
select t.ok(t.gt($$public.fn_sale_da_coc(t.b('L1'))$$) is null,
            'YC6.5-NT2 Lan không biết đặt phòng của mình đã cọc hay chưa');
select t.ok(t.gt($$(select string_agg(dem::text, ',' order by dem) from public.v_lich_sale where can_id = t.can('3402'))$$)
              = '2026-12-05',
            'YC6.5-NT2 Lan vẫn thấy lịch (đêm đã có người đặt) của căn Chị Hoa');
select t.bang(t.so($$select * from public.gia_thang where can_id in (t.can('1509'), t.can('3402')) and thang = '2026-12-01'$$),
              2::bigint, 'YC6.5-NT2 QD7 Lan vẫn thấy giá từng đêm của cả hai căn');
select t.thoat();

-- ===== YC6.5-NT3: Lan ở nhóm "Đã kết nối" của Chị Hoa và có thông báo =====
select t.ok((select trang_thai = 'da_ket_noi' and nguon = 'sale_xin' and pham_vi = 'tat_ca'
             from public.ket_noi where chu_id = t.id('hoa') and sale_id = t.id('lan')),
            'YC6.5-NT3 kết nối đã kết nối, nguồn sale xin, phạm vi tất cả căn');
select t.dang_nhap(t.id('hoa'));
select t.bang(t.gt($$(select nhom from public.fn_ds_sale_cua_toi() where sale_id = t.id('lan'))$$), 'da_ket_noi',
              'YC6.5-NT3 Lan ở nhóm "Đã kết nối" của Chị Hoa');
select t.thoat();
select t.dang_nhap(t.id('lan'));
select t.bang(t.so($$select * from public.thong_bao where loai = 'chu_dong_y_ket_noi'$$), 1::bigint,
              'YC6.5-NT3 Lan có một thông báo chủ nhà đồng ý');
select t.bang(t.gt($$(select noi_dung ->> 'ten_chu' from public.thong_bao where loai = 'chu_dong_y_ket_noi')$$), 'Chị Hoa',
              'YC6.5-NT3 thông báo có tên Chị Hoa');
select t.ok(t.gt($$(select noi_dung::text from public.thong_bao where loai = 'chu_dong_y_ket_noi')$$) !~ '(gia|tien|0900000001)',
            'YC6.5-NT3 thông báo không có giá, tiền, số điện thoại');
select t.bang(t.gt($$(select so_chu_dong_y::text from public.xin_lich_cua_toi())$$), '1',
              'YC6.5-NT3 A7 của Lan: 1 chủ nhà đã đồng ý');
select t.thoat();
select t.dang_nhap(t.id('hung'));
select t.bang(coalesce(t.so($$select * from public.thong_bao where loai = 'chu_dong_y_ket_noi'$$), 0), 0::bigint,
              'YC6.5-NT3 PQ19 Sale Hùng không thấy thông báo của Lan');
select t.thoat();

-- ===== YC6.5-NT6: đồng ý lại khi đã kết nối; đồng ý sau khi sale bỏ nguồn =====
update public.ket_noi set xem_coc = false where id = t.kn('hoa', 'hung');
select t.dang_nhap(t.id('hoa'));
select t.bang(t.gt($$public.fn_xem_link_xin_lich('xinHungAbcdefghjkmnpqrstuvwxyzABC') ->> 'da_ket_noi'$$), 'true',
              'YC6.5-NT6 xem trước link của Hùng: đã kết nối');
select pg_temp.luu('lai', t.gt($$public.fn_dong_y_xin_lich('xinHungAbcdefghjkmnpqrstuvwxyzABC', true)$$));
select t.thoat();
select t.bang(pg_temp.lay('lai')::jsonb ->> 'ket_qua', 'da_co', 'YC6.5-NT6 đã kết nối: báo đã có, không tạo mới');
select t.bang((select count(*) from public.ket_noi where chu_id = t.id('hoa') and sale_id = t.id('hung')), 1::bigint,
              'YC6.5-NT6 vẫn chỉ có một kết nối Chị Hoa và Hùng');
select t.ok((select id = t.kn('hoa', 'hung') and trang_thai = 'da_ket_noi' and nguon = 'link_moi' and pham_vi = 'tat_ca'
                    and xem_coc = false
             from public.ket_noi where chu_id = t.id('hoa') and sale_id = t.id('hung')),
            'YC6.5-NT6 phạm vi và quyền cọc giữ như cũ');
select t.bang((select count(*) from public.thong_bao where nguoi_nhan = t.id('hung') and loai = 'chu_dong_y_ket_noi'), 0::bigint,
              'YC6.5-NT6 đồng ý lại không ghi thông báo mới');
-- Lan bỏ nguồn Chị Hoa (YC10.2), Chị Hoa đồng ý lại với cọc bật.
update public.ket_noi set trang_thai = 'sale_bo', nguon = 'link_moi', pham_vi = 'chon_can'
where chu_id = t.id('hoa') and sale_id = t.id('lan');
insert into public.ket_noi_can (ket_noi_id, can_id)
select id, t.can('1509') from public.ket_noi where chu_id = t.id('hoa') and sale_id = t.id('lan');
select t.dang_nhap(t.id('hoa'));
select t.bang(t.gt($$public.fn_xem_link_xin_lich('xinLanAbcdefghjkmnpqrstuvwxyzABCD') ->> 'trang_thai'$$), 'hop_le',
              'YC6.5-NT6 sale đã bỏ nguồn: link xin lịch vẫn mở A8');
select pg_temp.luu('bo', t.gt($$public.fn_dong_y_xin_lich('xinLanAbcdefghjkmnpqrstuvwxyzABCD', true)$$));
select t.thoat();
select t.bang(pg_temp.lay('bo')::jsonb ->> 'ket_qua', 'da_ket_noi', 'YC6.5-NT6 Lan đã bỏ nguồn: đồng ý thành kết nối lại');
select t.ok((select count(*) = 1 and bool_and(trang_thai = 'da_ket_noi' and nguon = 'sale_xin' and pham_vi = 'tat_ca'
                                               and xem_coc = true)
             from public.ket_noi where chu_id = t.id('hoa') and sale_id = t.id('lan')),
            'YC6.5-NT6 kết nối trở lại đã kết nối, tất cả căn, cọc theo công tắc, vẫn một dòng');
select t.bang((select count(*) from public.ket_noi_can kc join public.ket_noi k on k.id = kc.ket_noi_id
               where k.chu_id = t.id('hoa') and k.sale_id = t.id('lan')), 0::bigint,
              'YC6.5-NT6 danh sách căn chọn cũ bỏ đi vì phạm vi là tất cả căn');
select t.bang((select count(*) from public.thong_bao where nguoi_nhan = t.id('lan') and loai = 'chu_dong_y_ket_noi'), 2::bigint,
              'YC6.5-NT6 đồng ý lại sau khi sale bỏ: sale có thông báo mới');
-- Kết nối "chưa kết nối" (chủ thêm tay ở CN7-05) cũng thành đã kết nối.
insert into public.ket_noi (chu_id, sale_id, trang_thai, nguon, xem_coc)
values (t.id('tuan'), t.id('nga'), 'chua_ket_noi', 'them_tay', true);
select t.dang_nhap(t.id('tuan'));
select pg_temp.luu('chua', t.gt($$public.fn_dong_y_xin_lich('xinNgaAbcdefghjkmnpqrstuvwxyzABCD', false)$$));
select t.thoat();
select t.ok(pg_temp.lay('chua')::jsonb ->> 'ket_qua' = 'da_ket_noi'
            and (select count(*) = 1 and bool_and(trang_thai = 'da_ket_noi' and nguon = 'sale_xin' and xem_coc = false)
                 from public.ket_noi where chu_id = t.id('tuan') and sale_id = t.id('nga')),
            'YC6.5-NT6 kết nối chưa kết nối thành đã kết nối, cọc theo công tắc');

-- ===== YC6.5-NT4: Chị Hoa đã ngừng Sale Hùng rồi mở lại link xin lịch của Hùng =====
update public.ket_noi set trang_thai = 'chu_ngung', ngung_luc = now() where id = t.kn('hoa', 'hung');
select t.dang_nhap(t.id('hoa'));
select t.bang(t.gt($$public.fn_xem_link_xin_lich('xinHungAbcdefghjkmnpqrstuvwxyzABC')$$), '{"trang_thai": "khong_dung_duoc"}',
              'YC6.5-NT4 đã ngừng Hùng: A8-01, không có tên, số nào');
select t.bang(t.ma_loi($$select public.fn_dong_y_xin_lich('xinHungAbcdefghjkmnpqrstuvwxyzABC', true)$$), 'P0001',
              'YC6.5-NT4 đã ngừng Hùng: đồng ý bị từ chối');
select t.thoat();
select t.ok((select count(*) = 1 and bool_and(trang_thai = 'chu_ngung')
             from public.ket_noi where chu_id = t.id('hoa') and sale_id = t.id('hung')),
            'YC6.5-NT4 không có kết nối mới, kết nối vẫn đã ngừng');

-- ===== YC6.5-NT7: Sale Lan mở link xin lịch của chính mình =====
select t.dang_nhap(t.id('lan'));
select t.bang(t.gt($$public.fn_xem_link_xin_lich('xinLanAbcdefghjkmnpqrstuvwxyzABCD')$$), '{"trang_thai": "khong_dung_duoc"}',
              'YC6.5-NT7 Lan mở link của mình: A8-01');
select t.bang(t.ma_loi($$select public.fn_dong_y_xin_lich('xinLanAbcdefghjkmnpqrstuvwxyzABCD', true)$$), 'P0001',
              'YC6.5-NT7 Lan đồng ý link của mình bị từ chối');
select t.thoat();
select t.bang((select count(*) from public.ket_noi where chu_id = t.id('lan')), 0::bigint,
              'YC6.5-NT7 không có kết nối nào được tạo');
select t.bang((select vai_chon from public.profiles where id = t.id('lan')), 'sale',
              'YC6.5-NT7 vai của Lan không đổi');

-- ===== YC6.5 bước 4: sale đã xóa tài khoản =====
update public.profiles set so_dien_thoai = null, da_xoa_luc = now() where id = t.id('nga');
select t.dang_nhap(t.id('hoa'));
select t.bang(t.gt($$public.fn_xem_link_xin_lich('xinNgaAbcdefghjkmnpqrstuvwxyzABCD')$$), '{"trang_thai": "khong_dung_duoc"}',
              'YC6.5 bước 4 PQ23 sale đã xóa tài khoản: A8-01, không có tên nào');
select t.bang(t.ma_loi($$select public.fn_dong_y_xin_lich('xinNgaAbcdefghjkmnpqrstuvwxyzABCD', true)$$), 'P0001',
              'YC6.5 bước 4 PQ23 sale đã xóa tài khoản: đồng ý bị từ chối');
select t.thoat();
select t.bang((select count(*) from public.ket_noi where chu_id = t.id('hoa') and sale_id = t.id('nga')), 0::bigint,
              'YC6.5 bước 4 PQ23 không tạo kết nối với sale đã xóa tài khoản');
update public.profiles set so_dien_thoai = '0900000005', da_xoa_luc = null where id = t.id('nga');

-- ===== YC6.5 vai: người đang ở vai sale đồng ý thì chuyển sang vai chủ nhà =====
select t.dang_nhap(t.id('hung'));
select pg_temp.luu('vai', t.gt($$public.fn_dong_y_xin_lich('xinNgaAbcdefghjkmnpqrstuvwxyzABCD', true)$$));
select t.thoat();
select t.ok(pg_temp.lay('vai')::jsonb ->> 'ket_qua' = 'da_ket_noi'
            and pg_temp.lay('vai')::jsonb ->> 'co_can' = 'false',
            'YC6.5 bước 2 Hùng (chưa có căn có lịch) đồng ý: tạo kết nối, chưa có căn nên về A4-01');
select t.bang((select vai_chon from public.profiles where id = t.id('hung')), 'chu_nha',
              'YC6.5 Hùng đang ở vai sale đồng ý xong thì chuyển sang vai chủ nhà');
select t.ok(exists (select 1 from public.ket_noi where chu_id = t.id('hung') and sale_id = t.id('nga') and trang_thai = 'da_ket_noi'),
            'YC6.5 kết nối Hùng (chủ nhà) với Nga');
update public.profiles set vai_chon = 'sale' where id = t.id('hung');

-- ===== YC6 "Ai được làm gì": vi phạm quyền =====
-- Người gọi luôn là chủ nhà của kết nối: Anh Tuấn đồng ý link của Lan không đụng kết nối Chị Hoa với Lan.
update public.ket_noi set xem_coc = true where chu_id = t.id('hoa') and sale_id = t.id('lan');
select t.dang_nhap(t.id('tuan'));
select pg_temp.luu('tuan', t.gt($$public.fn_dong_y_xin_lich('xinLanAbcdefghjkmnpqrstuvwxyzABCD', false)$$));
select t.thoat();
select t.ok((select xem_coc from public.ket_noi where chu_id = t.id('hoa') and sale_id = t.id('lan'))
            and exists (select 1 from public.ket_noi where chu_id = t.id('tuan') and sale_id = t.id('lan') and xem_coc = false),
            'YC6.5 PQ17.CHU Anh Tuấn đồng ý chỉ tạo kết nối của mình, không đổi quyền cọc Chị Hoa đặt cho Lan');
-- Sale không đọc được xem trước người khác thấy gì về mình hơn thế: sale khác không đọc link, hồ sơ.
select t.dang_nhap(t.id('hung'));
select t.ok(coalesce(t.so($$select * from public.link_xin_lich where sale_id = t.id('lan')$$), 0) = 0,
            'YC6.5 PQ18.SALE Sale Hùng không đọc được link, số đếm của Lan');
select t.ok(t.ma_loi($$insert into public.ket_noi (chu_id, sale_id, trang_thai, nguon) values (t.id('hung'), t.id('lan'), 'da_ket_noi', 'sale_xin')$$)
              is not null,
            'YC6.5 PQ17 app không ghi thẳng bảng kết nối');
select t.thoat();
-- Người chưa đăng ký xong (chưa có tên, số) không đồng ý được.
insert into auth.users (id) values ('00000000-0000-0000-0000-0000000000aa');
insert into public.profiles (id) values ('00000000-0000-0000-0000-0000000000aa') on conflict (id) do nothing;
select t.dang_nhap('00000000-0000-0000-0000-0000000000aa');
select t.ok(t.ma_loi($$select public.fn_dong_y_xin_lich('xinHungAbcdefghjkmnpqrstuvwxyzABC', true)$$) is not null,
            'YC6.5 YC1 người chưa đăng ký xong không đồng ý được');
select t.thoat();
select t.bang((select count(*) from public.ket_noi where chu_id = '00000000-0000-0000-0000-0000000000aa'), 0::bigint,
              'YC6.5 YC1 không tạo kết nối cho người chưa đăng ký xong');
