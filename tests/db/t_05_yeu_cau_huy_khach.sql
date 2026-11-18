-- Yêu cầu đặt phòng (QT1.4), hủy hai bên (QD-012), ai thấy khách và tiền của ai (QD-011, QD-007).
begin;
do $$
declare f jsonb := t.fixture();
  hoa uuid := (f->>'hoa')::uuid; hung uuid := (f->>'hung')::uuid; lan uuid := (f->>'lan')::uuid; c1509 uuid := (f->>'c1509')::uuid;
  y_hung jsonb; y_lan jsonb; r jsonb; b_le jsonb; v_booking uuid;
begin
  -- Chủ ghi một booking khách lẻ, có tên khách và tiền cọc
  perform t.login(hoa);
  b_le := fn_chu_ghi_booking(jsonb_build_object('can_id', c1509, 'ngay_nhan', '2026-10-10', 'ngay_tra', '2026-10-12',
            'trang_thai_tien', 'da_coc_con_thu', 'tien_coc', 500000, 'khach', jsonb_build_object('ten', 'Khách A', 'sdt', '0900000002')));

  -- QT1.4-VD1: sale gửi yêu cầu vào đêm đã kín thì không tạo yêu cầu
  perform t.login(lan);
  perform t.throws(format($q$select fn_sale_gui_yeu_cau('{"can_id":"%s","ngay_nhan":"2026-10-11","ngay_tra":"2026-10-12"}')$q$, c1509), 'QT1.4-VD1 đêm đã kín', 'đã được đặt rồi');

  -- Sale thấy đêm đã kín nhưng không thấy ai đặt, không thấy khách, không thấy tiền
  perform t.eq(t.dem_dong('select 1 from v_lich_sale'), 1, 'sale thấy đêm đã kín của căn được chia sẻ');
  perform t.eq((select string_agg(column_name::text, ',' order by ordinal_position) from information_schema.columns where table_name = 'v_lich_sale'), 'can_id,dem', 'view lịch của sale chỉ có căn và đêm');
  perform t.eq(t.dem_dong('select 1 from booking'), 0, 'sale không đọc thẳng bảng booking của chủ');
  perform t.eq(t.dem_dong('select 1 from booking_rieng'), 0, 'sale không thấy khách của chủ nhà');

  -- QT1.4-VD2: hai yêu cầu chờ cùng đêm, chủ chấp nhận một thì cái kia thành bị từ chối
  y_lan := fn_sale_gui_yeu_cau(jsonb_build_object('can_id', c1509, 'ngay_nhan', '2026-10-17', 'ngay_tra', '2026-10-19',
             'tien_thu_khach', 2900000, 'khach', jsonb_build_object('ten', 'Khách của Lan', 'sdt', '0900000003')));
  perform t.login(hung);
  y_hung := fn_sale_gui_yeu_cau(jsonb_build_object('can_id', c1509, 'ngay_nhan', '2026-10-17', 'ngay_tra', '2026-10-19',
             'tien_thu_khach', 3000000, 'khach', jsonb_build_object('ten', 'Khách của Hùng')));
  perform t.eq(t.dem_dong('select 1 from yeu_cau_dat_phong'), 1, 'sale chỉ thấy yêu cầu của mình');

  -- Chủ thấy hai yêu cầu nhưng không thấy khách, không thấy giá sale bán cho khách
  perform t.login(hoa);
  perform t.eq(t.dem_dong('select 1 from yeu_cau_dat_phong'), 2, 'chủ thấy các yêu cầu vào căn mình');
  perform t.eq(t.dem_dong('select 1 from yeu_cau_rieng'), 0, 'chủ không thấy khách và tiền thu khách trên yêu cầu của sale');
  r := fn_chu_tra_loi_yeu_cau((y_hung->>'id')::uuid, true);
  v_booking := (r->>'booking_id')::uuid;
  perform t.eq((select trang_thai from yeu_cau_dat_phong where id = (y_lan->>'id')::uuid), 'tu_choi', 'QT1.4-VD2 yêu cầu của Sale Lan thành bị từ chối');
  perform t.eq((select tien_phong from booking where id = v_booking), 2200000, 'booking từ yêu cầu điền sẵn tiền theo bảng giá');
  perform t.eq(t.dem_dong(format('select 1 from booking_rieng where booking_id = %L', v_booking)), 0, 'chủ không thấy khách của sale sau khi chấp nhận');
  perform t.throws(format('select fn_chu_xoa_booking(%L)', v_booking), 'chủ không xóa được booking của sale', 'xin hủy');

  -- Sale thấy booking của mình: tiền phòng, tiền chênh, đã cọc hay chưa; không có số tiền cọc
  perform t.login(hung);
  perform t.eq((select tien_chenh from v_booking_cua_sale where id = v_booking), 800000, 'tiền chênh = thu khách 3.000.000 trừ trả chủ 2.200.000');
  perform t.eq((select ten_khach from booking_rieng where booking_id = v_booking), 'Khách của Hùng', 'sale thấy khách của mình');
  perform t.eq((select count(*)::int from information_schema.columns where table_name = 'v_booking_cua_sale' and column_name in ('tien_coc', 'ten_khach', 'sdt_khach')), 0, 'view booking của sale không có tiền cọc và khách');
  perform t.eq((select da_coc from v_booking_cua_sale where id = v_booking), false, 'sale thấy booking chưa cọc');

  -- Chủ tắt quyền tình trạng cọc thì sale không thấy nữa
  update ket_noi set quyen_tinh_trang_coc = false where chu_nha_id = hoa and sale_id = hung;
  perform t.eq((select da_coc from v_booking_cua_sale where id = v_booking), null::boolean, 'tắt quyền cọc thì sale không thấy tình trạng cọc');

  -- Hủy hai bên (QD-012): sale xin, chính sale không tự đồng ý, chủ từ chối thì không xin lại được
  perform fn_xin_huy(v_booking);
  perform t.throws(format('select fn_tra_loi_huy(%L, true)', v_booking), 'người xin hủy không tự đồng ý', 'người kia');
  perform t.login(hoa);
  perform fn_tra_loi_huy(v_booking, false);
  perform t.eq((select trang_thai from booking where id = v_booking), 'hieu_luc', 'từ chối hủy thì booking giữ nguyên');
  perform t.login(hung);
  perform t.throws(format('select fn_xin_huy(%L)', v_booking), 'bị từ chối hủy thì không xin lại', 'không xin hủy lại');
  perform t.eq((select bi_tu_choi_huy from v_booking_cua_sale where id = v_booking), true, 'sale thấy nhãn Bị từ chối hủy');

  -- Booking khác: chủ xin hủy, sale đồng ý, đêm trống lại và bán được (QD-012)
  perform t.login(hoa);
  r := fn_chu_ghi_booking(jsonb_build_object('can_id', c1509, 'ngay_nhan', '2026-10-24', 'ngay_tra', '2026-10-25', 'sale_id', hung));
  perform fn_xin_huy((r->>'id')::uuid);
  perform t.login(hung);
  perform fn_tra_loi_huy((r->>'id')::uuid, true);
  perform t.eq((select trang_thai from v_booking_cua_sale where id = (r->>'id')::uuid), 'da_huy', 'đồng ý hủy thì Đã hủy, sale vẫn thấy');
  perform fn_sale_gui_yeu_cau(jsonb_build_object('can_id', c1509, 'ngay_nhan', '2026-10-24', 'ngay_tra', '2026-10-25'));

  -- Booking khách lẻ không cần xin hủy, chủ xóa được
  perform t.login(hoa);
  perform t.throws(format('select fn_xin_huy(%L)', b_le->>'id'), 'booking khách lẻ không xin hủy', 'không cần xin hủy');
  perform fn_chu_xoa_booking((b_le->>'id')::uuid);
  perform t.eq(t.dem_dong(format('select 1 from booking where id = %L', b_le->>'id')), 0, 'chủ xóa được booking khách lẻ');

  -- Sale khác không đụng được booking của Sale Hùng
  perform t.login(lan);
  perform t.throws(format('select fn_xin_huy(%L)', v_booking), 'sale khác không xin hủy được', 'không tìm thấy');
  perform t.eq(t.dem_dong(format('select 1 from v_booking_cua_sale where id = %L', v_booking)), 0, 'sale khác không thấy booking của Sale Hùng');
end $$;
rollback;
