-- Phân quyền: ai thấy căn, kết nối, hồ sơ nào; không ai ghi thẳng vào bảng; mọi bảng bật RLS; khách (anon) không thấy gì.
begin;
do $$
declare f jsonb := t.fixture();
  hoa uuid := (f->>'hoa')::uuid; hung uuid := (f->>'hung')::uuid; lan uuid := (f->>'lan')::uuid;
  c1509 uuid := (f->>'c1509')::uuid; c3402 uuid := (f->>'c3402')::uuid; c1103 uuid := (f->>'c1103')::uuid; villa uuid := (f->>'villa')::uuid;
begin
  -- Chủ nhà chỉ thấy căn của mình
  perform t.login(hoa);
  perform t.eq(t.dem_dong('select 1 from can'), 2, 'Chị Hoa thấy đúng 2 căn của mình');
  perform t.eq(t.dem_dong(format('select 1 from can where id = %L', c1103)), 0, 'chủ nhà không thấy căn của chủ khác');
  perform t.eq(t.dem_dong(format('select 1 from can where id = %L', villa)), 0, 'chủ nhà không thấy căn tự nhập của sale');

  -- Sale Hùng: căn của Chị Hoa (tất cả căn) cộng căn tự nhập của mình
  perform t.login(hung);
  perform t.eq(t.dem_dong('select 1 from can'), 3, 'Sale Hùng thấy 2 căn của Chị Hoa và căn tự nhập của mình');
  perform t.eq(t.dem_dong(format('select 1 from can where id = %L', c1103)), 0, 'sale không thấy căn của chủ chưa kết nối');
  perform t.eq(t.dem_dong(format('select 1 from can where id = %L and ten_chu_can = %L', villa, 'Chú Bình')), 1, 'sale thấy tên chủ căn tự nhập của mình');

  -- Sale Lan: chỉ căn được chọn
  perform t.login(lan);
  perform t.eq(t.dem_dong('select 1 from can'), 1, 'Sale Lan chỉ thấy căn 1509 được chia sẻ');
  perform t.eq(t.dem_dong(format('select 1 from can where id = %L', villa)), 0, 'sale không thấy căn tự nhập của sale khác');
  perform t.eq(t.dem_dong('select 1 from profiles'), 2, 'Sale Lan thấy hồ sơ của mình và của Chị Hoa');
  perform t.eq(t.dem_dong(format('select 1 from profiles where id = %L', hung)), 0, 'sale không thấy hồ sơ sale khác');

  -- Sale Nga chưa kết nối
  perform t.login((f->>'nga')::uuid);
  perform t.eq(t.dem_dong('select 1 from can'), 0, 'sale chưa kết nối không thấy căn nào');
  perform t.eq(t.dem_dong('select 1 from ket_noi'), 0, 'sale chưa kết nối không thấy kết nối nào');

  -- Không ghi thẳng vào bảng: mọi ghi đi qua fn_*
  perform t.login(hoa);
  set local role authenticated;
  perform t.throws(format('insert into can (nguoi_giu, ma_can, so_phong_ngu) values (%L, %L, 1)', hoa, 'x'), 'không thêm căn bằng ghi thẳng', 'row-level security');
  perform t.throws(format('insert into booking (can_id, dem, nguon, chu_nha_id, tien_phong) values (%L, %L, %L, %L, 1)', c1509, '[2026-10-01,2026-10-02)', 'chu_tu_ghi', hoa), 'không thêm booking bằng ghi thẳng', 'row-level security');
  perform t.throws(format('insert into ket_noi (chu_nha_id, sale_id, nguon) values (%L, %L, %L)', hoa, (f->>'nga')::uuid, 'chu_them_tay'), 'không tạo kết nối bằng ghi thẳng', 'row-level security');
  reset role;

  -- Chủ nhà khác không dùng được căn của Chị Hoa
  perform t.login((f->>'tuan')::uuid);
  perform t.throws(format($q$select fn_chu_ghi_booking('{"can_id":"%s","ngay_nhan":"2026-10-10","ngay_tra":"2026-10-11"}')$q$, c1509), 'chủ khác không ghi booking vào căn của Chị Hoa', 'không ghi được');
  perform t.throws(format('select fn_dat_gia_thang(%L, array[%L]::date[], 1, 1)', c1509, '2026-10-01'), 'chủ khác không đặt giá căn của Chị Hoa', 'không đặt giá');

  -- Khách, người chưa đăng nhập: không thấy gì
  perform t.logout();
  set local role anon;
  perform t.eq((select count(*)::int from can), 0, 'chưa đăng nhập: không thấy căn');
  perform t.eq((select count(*)::int from gia_thang), 0, 'chưa đăng nhập: không thấy giá chủ nhà');
  perform t.eq((select count(*)::int from booking), 0, 'chưa đăng nhập: không thấy booking');
  perform t.eq((select count(*)::int from profiles), 0, 'chưa đăng nhập: không thấy hồ sơ');
  perform t.throws('select * from v_lich_sale', 'chưa đăng nhập: không đọc view của sale', 'permission denied');
  perform t.throws($q$select fn_tao_can('{"ma_can":"x","so_phong_ngu":1}')$q$, 'chưa đăng nhập: không gọi hàm ghi', 'permission denied');
  reset role;

  -- Quản trị thấy mọi căn
  perform t.login((f->>'admin')::uuid);
  perform t.eq(t.dem_dong('select 1 from can'), 4, 'quản trị thấy mọi căn');

  -- Mọi bảng trong public đều bật RLS
  perform t.eq((select string_agg(c.relname, ', ') from pg_class c join pg_namespace n on n.oid = c.relnamespace
                 where n.nspname = 'public' and c.relkind = 'r' and not c.relrowsecurity), null::text, 'bảng chưa bật RLS');
end $$;
rollback;
