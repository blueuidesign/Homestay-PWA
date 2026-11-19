-- US42 · Toast báo kết nối cho sale (YC6.8 r11). Viết trước migration (US42-TA1, CL14.5): task sau không sửa file này.
-- Hợp đồng database cho toast A9, A9-02:
--   Mỗi lần chủ nhà đồng ý kết nối (fn_dong_y_xin_lich) ghi thông báo 'chu_dong_y_ket_noi' cho sale.
--   Gom: sale có dòng 'chu_dong_y_ket_noi' chưa đọc (doc_luc null) tạo chưa quá 10 phút thì cập nhật dòng đó
--   (tao_luc giữ nguyên); không có thì chèn dòng mới. Chủ nhà đã có trong dòng đó thì chèn dòng mới (US39 YC6.5-NT6).
--   noi_dung: {ten_chu (chủ nhà đầu tiên), so_can (tổng), so_chu, cac_chu: [{ten, so_can, cac_can: [{toa, ma}]}],
--   ket_noi: [id kết nối]}. cac_chu theo thứ tự đồng ý; cac_can tối đa 3 căn theo thứ tự mã; toa null khi căn
--   không có tòa. Không giá, không số điện thoại.
--   Sale đọc thông báo của mình qua RLS (thong_bao_doc). Hàm ghi thông báo không cấp cho app.
select t.fixture();

-- Chủ nhà thứ ba: Chú Bình, bốn căn (tên, số giả).
insert into auth.users (id) values ('00000000-0000-0000-0000-0000000000b1');
insert into public.profiles (id, ten, ten_hien_thi, so_dien_thoai, vai_chon)
values ('00000000-0000-0000-0000-0000000000b1', 'Chú Bình', 'Chú Bình', '0900000006', 'chu_nha');
insert into public.can (nguoi_giu, loai, ma_can, so_phong_ngu, toa_nha_id) values
  ('00000000-0000-0000-0000-0000000000b1', 'co_lich', '1204', 1, t.toa('sapphire')),
  ('00000000-0000-0000-0000-0000000000b1', 'co_lich', '1202', 1, t.toa('sapphire')),
  ('00000000-0000-0000-0000-0000000000b1', 'co_lich', '1201', 1, t.toa('sapphire')),
  ('00000000-0000-0000-0000-0000000000b1', 'co_lich', '1203', 1, null);

insert into public.link_xin_lich (ma, sale_id) values
  ('xinLanAbcdefghjkmnpqrstuvwxyzABCD', t.id('lan')),
  ('xinHungAbcdefghjkmnpqrstuvwxyzABC', t.id('hung')),
  ('xinNgaAbcdefghjkmnpqrstuvwxyzABCD', t.id('nga'));
delete from public.ket_noi where id = t.kn('hoa', 'lan');

create or replace function pg_temp.dong_y(chu uuid, ma text) returns text language plpgsql as $$
declare v text;
begin
  perform t.dang_nhap(chu);
  v := t.gt(format('public.fn_dong_y_xin_lich(%L, true)', ma));
  perform t.thoat();
  return v;
end $$;

-- ===== Danh mục =====
select t.ok((select count(*) = 1 from pg_proc
             where proname = 'ghi_thong_bao_dong_y' and pronamespace = 'public'::regnamespace and prosecdef),
            'YC6.8 danh mục: hàm ghi thông báo đồng ý kết nối có và chạy security definer');
select t.ok(not exists (select 1 from pg_proc p
                        where p.proname = 'ghi_thong_bao_dong_y' and p.pronamespace = 'public'::regnamespace
                          and (has_function_privilege('authenticated', p.oid, 'execute')
                               or has_function_privilege('anon', p.oid, 'execute'))),
            'YC6.8 app không gọi thẳng được hàm ghi thông báo');

-- ===== YC6.8-NT2: Chị Hoa, Anh Tuấn, Chú Bình đồng ý cho Sale Lan trong 10 phút =====
select t.bang(pg_temp.dong_y(t.id('hoa'), 'xinLanAbcdefghjkmnpqrstuvwxyzABCD')::jsonb ->> 'ket_qua', 'da_ket_noi',
              'YC6.8-NT2 Chị Hoa đồng ý cho Lan');
select t.bang(pg_temp.dong_y(t.id('tuan'), 'xinLanAbcdefghjkmnpqrstuvwxyzABCD')::jsonb ->> 'ket_qua', 'da_ket_noi',
              'YC6.8-NT2 Anh Tuấn đồng ý cho Lan');
select t.bang(pg_temp.dong_y('00000000-0000-0000-0000-0000000000b1', 'xinLanAbcdefghjkmnpqrstuvwxyzABCD')::jsonb ->> 'ket_qua',
              'da_ket_noi', 'YC6.8-NT2 Chú Bình đồng ý cho Lan');

select t.dang_nhap(t.id('lan'));
select t.bang(t.so($$select * from public.thong_bao where loai = 'chu_dong_y_ket_noi'$$), 1::bigint,
              'YC6.8-NT2 Lan có một thông báo gom cho ba chủ nhà');
select t.bang(t.gt($$(select noi_dung ->> 'so_chu' from public.thong_bao where loai = 'chu_dong_y_ket_noi')$$), '3',
              'YC6.8-NT2 thông báo gom có ba chủ nhà');
select t.bang(t.gt($$(select string_agg(c ->> 'ten', ', ' order by n)
                     from public.thong_bao tb, jsonb_array_elements(tb.noi_dung -> 'cac_chu') with ordinality as x(c, n)
                     where tb.loai = 'chu_dong_y_ket_noi')$$),
              'Chị Hoa, Anh Tuấn, Chú Bình', 'YC6.8-NT2 tên chủ nhà theo thứ tự đồng ý');
select t.bang(t.gt($$(select noi_dung ->> 'so_can' from public.thong_bao where loai = 'chu_dong_y_ket_noi')$$), '7',
              'YC6.8-NT2 tổng 7 căn mới (2 + 1 + 4)');
select t.bang(t.gt($$(select noi_dung ->> 'ten_chu' from public.thong_bao where loai = 'chu_dong_y_ket_noi')$$), 'Chị Hoa',
              'YC6.8-NT2 ten_chu vẫn là chủ nhà đầu tiên');
select t.bang(t.gt($$(select noi_dung -> 'cac_chu' -> 0 -> 'cac_can' from public.thong_bao where loai = 'chu_dong_y_ket_noi')$$),
              '[{"ma": "1509", "toa": "ICON40"}, {"ma": "3402", "toa": null}]',
              'YC6.8 dòng của Chị Hoa: tòa và mã căn theo thứ tự mã, căn không có tòa thì tòa null');
select t.bang(t.gt($$(select noi_dung -> 'cac_chu' -> 2 from public.thong_bao where loai = 'chu_dong_y_ket_noi')$$),
              '{"ten": "Chú Bình", "so_can": 4, "cac_can": [{"ma": "1201", "toa": "Sapphire"}, {"ma": "1202", "toa": "Sapphire"}, {"ma": "1203", "toa": null}]}',
              'YC6.8 dòng của Chú Bình: tối đa 3 căn theo thứ tự mã, kèm số căn');
-- ket_noi là các id kết nối (ngẫu nhiên) nên bỏ ra khi dò số.
select t.ok(t.gt($$(select (noi_dung #- '{ket_noi}')::text from public.thong_bao where loai = 'chu_dong_y_ket_noi')$$)
              !~ '(gia|tien|090000000[0-9]|800000|900000|700000)',
            'YC6.8 thông báo không có giá, tiền, số điện thoại');
select t.bang(t.gt($$(select string_agg(k, ',' order by k)
                     from public.thong_bao tb, jsonb_object_keys(tb.noi_dung) k where tb.loai = 'chu_dong_y_ket_noi')$$),
              'cac_chu,ket_noi,so_can,so_chu,ten_chu', 'YC6.8 thông báo chỉ có các khóa đã định');
select t.thoat();
select t.dang_nhap(t.id('hung'));
select t.bang(coalesce(t.so($$select * from public.thong_bao where loai = 'chu_dong_y_ket_noi'$$), 0), 0::bigint,
              'YC6.8-NT2 PQ19 Sale Hùng không thấy thông báo của Lan');
select t.thoat();

-- ===== YC6.8-NT3: Chị Hoa đồng ý lúc 9:00, Anh Tuấn lúc 9:15 thì hai dòng riêng (Sale Nga) =====
select pg_temp.dong_y(t.id('hoa'), 'xinNgaAbcdefghjkmnpqrstuvwxyzABCD');
update public.thong_bao set tao_luc = now() - interval '15 minutes'
where nguoi_nhan = t.id('nga') and loai = 'chu_dong_y_ket_noi';
select pg_temp.dong_y(t.id('tuan'), 'xinNgaAbcdefghjkmnpqrstuvwxyzABCD');
select t.dang_nhap(t.id('nga'));
select t.bang(t.so($$select * from public.thong_bao where loai = 'chu_dong_y_ket_noi'$$), 2::bigint,
              'YC6.8-NT3 đồng ý cách 15 phút: Nga có hai dòng thông báo riêng');
select t.bang(t.gt($$(select string_agg(noi_dung ->> 'ten_chu' || ':' || (noi_dung ->> 'so_chu'), ',' order by tao_luc)
                     from public.thong_bao where loai = 'chu_dong_y_ket_noi')$$),
              'Chị Hoa:1,Anh Tuấn:1', 'YC6.8-NT3 mỗi dòng một chủ nhà');
select t.thoat();
-- Dòng tạo 9 phút trước, chưa đọc: vẫn gom (cửa sổ tính từ lúc tạo dòng).
update public.thong_bao set tao_luc = now() - interval '9 minutes'
where nguoi_nhan = t.id('nga') and loai = 'chu_dong_y_ket_noi' and noi_dung ->> 'ten_chu' = 'Anh Tuấn';
select pg_temp.dong_y('00000000-0000-0000-0000-0000000000b1', 'xinNgaAbcdefghjkmnpqrstuvwxyzABCD');
select t.bang((select count(*) from public.thong_bao where nguoi_nhan = t.id('nga') and loai = 'chu_dong_y_ket_noi'), 2::bigint,
              'YC6.8-NT3 dòng tạo 9 phút trước chưa đọc: lần đồng ý mới gom vào, không thêm dòng');
select t.ok((select noi_dung ->> 'so_chu' = '2' and tao_luc = now() - interval '9 minutes'
             from public.thong_bao where nguoi_nhan = t.id('nga') and noi_dung ->> 'ten_chu' = 'Anh Tuấn'),
            'YC6.8-NT3 gom giữ lúc tạo dòng, thêm chủ nhà vào dòng');

-- ===== YC6.8-NT3: Sale Hùng đã đọc thông báo của Anh Tuấn trước khi Chú Bình đồng ý =====
select pg_temp.dong_y(t.id('tuan'), 'xinHungAbcdefghjkmnpqrstuvwxyzABC');
update public.thong_bao set doc_luc = now() where nguoi_nhan = t.id('hung') and loai = 'chu_dong_y_ket_noi';
select pg_temp.dong_y('00000000-0000-0000-0000-0000000000b1', 'xinHungAbcdefghjkmnpqrstuvwxyzABC');
select t.dang_nhap(t.id('hung'));
select t.bang(t.so($$select * from public.thong_bao where loai = 'chu_dong_y_ket_noi'$$), 2::bigint,
              'YC6.8-NT3 đã đọc rồi mới có người đồng ý: Hùng có hai dòng thông báo riêng');
select t.bang(t.so($$select * from public.thong_bao where loai = 'chu_dong_y_ket_noi' and doc_luc is null
                    and noi_dung ->> 'ten_chu' = 'Chú Bình' and noi_dung ->> 'so_chu' = '1'$$), 1::bigint,
              'YC6.8-NT3 dòng mới chỉ có Chú Bình, chưa đọc');
select t.thoat();
