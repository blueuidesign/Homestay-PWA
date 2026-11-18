-- Giá chủ nhà: sale được chia sẻ luôn thấy giá (QD-007); khách và sale chưa kết nối không bao giờ thấy;
-- giá cuối tuần theo đêm T6, T7; chủ ngừng cho xem thì sale mất lịch và giá nhưng còn booking cũ.
begin;
do $$
declare f jsonb := t.fixture();
  hoa uuid := (f->>'hoa')::uuid; hung uuid := (f->>'hung')::uuid; lan uuid := (f->>'lan')::uuid;
  c1509 uuid := (f->>'c1509')::uuid; c3402 uuid := (f->>'c3402')::uuid; r jsonb;
begin
  -- Đêm cuối tuần: 31/10/2026 là T7 (giá cuối tuần), 01/11/2026 là CN (giá ngày thường). QT4.1-VD1, DLM.3
  perform t.eq(gia_dem(c1509, '2026-10-31'), 1300000, 'đêm T7 tính giá cuối tuần');
  perform t.eq(gia_dem(c1509, '2026-11-01'), 900000, 'đêm CN tính giá ngày thường');
  perform t.eq(gia_dem(c1509, '2026-10-30'), 1300000, 'đêm T6 tính giá cuối tuần');
  perform t.eq(gia_dem(c1509, '2027-01-04'), null::int, 'tháng chưa đặt giá thì không có giá');

  -- Sale được chia sẻ thấy giá chủ nhà
  perform t.login(hung);
  perform t.eq(t.dem_dong(format('select 1 from gia_thang where can_id = %L', c1509)), 3, 'Sale Hùng thấy giá 3 tháng của 1509');
  perform t.login(lan);
  perform t.eq(t.dem_dong(format('select 1 from gia_thang where can_id = %L', c3402)), 0, 'Sale Lan không thấy giá căn không được chia sẻ');
  perform t.login((f->>'nga')::uuid);
  perform t.eq(t.dem_dong('select 1 from gia_thang'), 0, 'sale chưa kết nối không thấy giá');

  -- Đổi cách tính cuối tuần thì giá đêm đổi theo (mục "Ngày tính giá cuối tuần" (US11))
  perform t.login(hoa);
  perform fn_cap_nhat_ho_so('{"dem_cuoi_tuan":[6,0]}');
  perform t.eq(gia_dem(c1509, '2026-10-30'), 900000, 'bỏ đêm T6 khỏi cuối tuần thì đêm T6 về giá ngày thường');
  perform t.eq(gia_dem(c1509, '2026-11-01'), 1300000, 'thêm đêm CN vào cuối tuần thì đêm CN tính giá cuối tuần');

  -- Booking của Sale Hùng trước khi bị ngừng
  r := fn_chu_ghi_booking(jsonb_build_object('can_id', c1509, 'ngay_nhan', '2026-10-10', 'ngay_tra', '2026-10-12', 'sale_id', hung));

  -- Chủ ngừng cho Sale Hùng xem (QD-007)
  perform fn_chu_ngung_sale(hung);
  perform t.login(hung);
  perform t.eq(t.dem_dong(format('select 1 from can where id = %L', c1509)), 0, 'bị ngừng: không thấy căn');
  perform t.eq(t.dem_dong(format('select 1 from gia_thang where can_id = %L', c1509)), 0, 'bị ngừng: không thấy giá');
  perform t.eq(t.dem_dong('select 1 from v_lich_sale'), 0, 'bị ngừng: không thấy lịch');
  perform t.eq(t.dem_dong(format('select 1 from v_booking_cua_sale where id = %L', r->>'id')), 1, 'bị ngừng: vẫn xem lại booking cũ của mình');
  perform t.throws(format($q$select fn_sale_gui_yeu_cau('{"can_id":"%s","ngay_nhan":"2026-10-20","ngay_tra":"2026-10-21"}')$q$, c1509), 'bị ngừng: không gửi được yêu cầu', 'không được xem');

  -- Chủ xóa tài khoản (QD-013): sale không còn thấy căn, không gửi được yêu cầu
  perform t.login(hoa);
  perform fn_xoa_tai_khoan();
  perform t.login(lan);
  perform t.eq(t.dem_dong('select 1 from can'), 0, 'chủ đã xóa tài khoản: sale không thấy căn');
  perform t.eq(t.dem_dong(format('select 1 from profiles where id = %L and ten = %L and sdt is null', hoa, 'Chị Hoa')), 1, 'chủ đã xóa tài khoản: còn tên, mất số');
  perform t.throws(format($q$select fn_sale_gui_yeu_cau('{"can_id":"%s","ngay_nhan":"2026-10-20","ngay_tra":"2026-10-21"}')$q$, c1509), 'chủ đã xóa tài khoản: không gửi được yêu cầu', 'đã xóa tài khoản');
end $$;
rollback;
