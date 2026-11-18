-- Lịch phòng và tìm phòng của sale (mục "Lịch phòng 7 ngày" (US16), mục "Tìm phòng trống theo ngày" (US12), mục "Kết quả tìm phòng" (US12)): chỉ căn được xem, kín hay trống, giá; căn tự nhập không bao giờ "trống"
begin;
do $$
declare f jsonb := t.fixture();
  hoa uuid := (f->>'hoa')::uuid; hung uuid := (f->>'hung')::uuid; lan uuid := (f->>'lan')::uuid; nga uuid := (f->>'nga')::uuid;
  c1509 uuid := (f->>'c1509')::uuid; c3402 uuid := (f->>'c3402')::uuid; villa uuid := (f->>'villa')::uuid;
  r jsonb; x jsonb; d jsonb;
begin
  perform t.login(hoa);
  perform fn_chu_ghi_booking(jsonb_build_object('can_id', c1509, 'ngay_nhan', '2026-12-10', 'ngay_tra', '2026-12-12', 'tien_phong', 2200000,
          'trang_thai_tien', 'da_coc_con_thu', 'tien_coc', 1000000, 'khach', jsonb_build_object('ten', 'Khách của Hoa', 'sdt', '0900000005')));
  perform t.login(hung);
  perform fn_sale_ghi_tu_nhap(jsonb_build_object('can_id', villa, 'ngay_nhan', '2026-12-10', 'ngay_tra', '2026-12-11', 'tien_phong', 1400000, 'tien_thu_khach', 1600000));
  perform fn_dat_muc_cong(c1509, 200000);

  r := fn_sale_lich('2026-12-10', 3);
  perform t.eq(jsonb_array_length(r), 3, 'mục "Lịch phòng 7 ngày" (US16) Sale Hùng thấy 2 căn nguồn và 1 căn tự nhập');
  perform t.ok(r::text not like '%Khách của Hoa%' and r::text not like '%0900000005%' and r::text not like '%tien_coc%' and r::text not like '%1000000%',
               'PQ4.SALE, PQ9 lịch của sale không có khách, không có tiền cọc');
  select e into x from jsonb_array_elements(r) e where e->>'can_id' = c1509::text;
  perform t.eq(x->>'nhom', 'nguon', 'căn của chủ nhà nằm ở nhóm nguồn phòng');
  perform t.eq((x->'ngay'->0->>'kin')::boolean, true, 'mục "Lịch phòng 7 ngày" (US16) đêm 10/12 đã đặt hiện Kín');
  perform t.eq((x->'ngay'->2->>'kin')::boolean, false, 'mục "Lịch phòng 7 ngày" (US16) đêm 12/12 là ngày trả nên còn trống (QT2.1)');
  perform t.eq((x->'ngay'->2->>'gia_chu')::int, 1300000, 'mục "Lịch phòng 7 ngày" (US16) ô trống có giá chủ nhà (12/12/2026 là T7)');
  perform t.eq((x->'ngay'->2->>'gia_ban')::int, 1500000, 'mục "Lịch phòng 7 ngày" (US16) ô trống có giá bán đã cộng mức cộng');
  select e into x from jsonb_array_elements(r) e where e->>'can_id' = villa::text;
  perform t.eq(x->>'nhom', 'tu_nhap', 'căn tự nhập ở nhóm riêng');
  perform t.ok(not (x->'ngay'->1 ? 'kin'), 'căn tự nhập không bao giờ có ô trống hay kín: ô không có khóa kin');
  perform t.eq((x->'ngay'->0->>'cua_ban')::boolean, true, 'mục "Ghi booking đã chốt cho căn tự nhập" (US16) ngày sale đã ghi đặt phòng hiện "Bạn"');
  perform t.eq((x->'ngay'->1->>'cua_ban')::boolean, false, 'mục "Ghi booking đã chốt cho căn tự nhập" (US16) ngày khác của căn tự nhập là "?"');

  perform t.login(lan);
  perform t.eq(jsonb_array_length(fn_sale_lich('2026-12-10', 3)), 1, 'PQ4.SALE Sale Lan chỉ thấy căn 1509');
  perform t.login(nga);
  perform t.eq(jsonb_array_length(fn_sale_lich('2026-12-10', 3)), 0, 'PQ4.SALE sale chưa kết nối không thấy căn nào');

  -- Tìm phòng (mục "Tìm phòng trống theo ngày" (US12), mục "Kết quả tìm phòng" (US12))
  perform t.login(hung);
  perform t.throws($q$select fn_sale_tim('{}')$q$, 'US12-NT1 chưa chọn ngày nhận thì không tìm', 'Chọn ngày nhận');
  r := fn_sale_tim('{"ngay_nhan":"2026-12-10","ngay_tra":"2026-12-12"}');
  perform t.ok(not exists (select 1 from jsonb_array_elements(r) e where e->>'can_id' = c1509::text), 'mục "Tìm phòng trống theo ngày" (US12) căn có đêm kín không nằm trong kết quả');
  perform t.ok(exists (select 1 from jsonb_array_elements(r) e where e->>'can_id' = c3402::text and (e->>'tong_gia_chu')::int = 1900000), 'mục "Kết quả tìm phòng" (US12) căn trống có tổng giá chủ nhà (10/12 là T5: 800.000; 11/12 là T6: 1.100.000)');
  perform t.ok(exists (select 1 from jsonb_array_elements(r) e where e->>'can_id' = villa::text and (e->>'khong_co_lich')::boolean), 'mục "Kết quả tìm phòng" (US12) căn tự nhập ghi rõ không có lịch');
  r := fn_sale_tim('{"ngay_nhan":"2026-12-12","ngay_tra":"2026-12-13","loai_view":"bien"}');
  perform t.ok(jsonb_array_length(r) = 1 and r->0->>'can_id' = c1509::text, 'mục "Tìm phòng trống theo ngày" (US12) lọc loại view; ngày trả của đặt phòng khác không chặn');
  perform t.eq(t.dem_dong('select 1 from tim_gan_day'), 2, 'mục "Tìm phòng trống theo ngày" (US12) ghi Tìm gần đây');
  perform fn_sale_tim('{"ngay_nhan":"2026-12-12","ngay_tra":"2026-12-13","loai_view":"bien"}');
  perform t.eq(t.dem_dong('select 1 from tim_gan_day'), 2, 'tìm lại cùng điều kiện không tạo dòng mới');
  perform t.login(lan);
  perform t.eq(t.dem_dong('select 1 from tim_gan_day'), 0, 'Tìm gần đây chỉ của chính sale');

  -- Chủ ngừng cho xem: lịch và tìm phòng không còn căn của chủ đó
  perform t.login(hoa);
  perform fn_chu_ngung_sale(hung);
  perform t.login(hung);
  perform t.eq(jsonb_array_length(fn_sale_lich('2026-12-10', 3)), 1, 'mục "Chủ nhà quản lý danh sách sale" (US5) bị ngừng: lịch chỉ còn căn tự nhập của mình');
  perform t.ok(not has_function_privilege('anon', 'public.fn_sale_lich(date, int)', 'execute') and not has_function_privilege('anon', 'public.fn_sale_tim(jsonb)', 'execute'),
               'người chưa đăng nhập không gọi được lịch và tìm phòng');
end $$;
rollback;
