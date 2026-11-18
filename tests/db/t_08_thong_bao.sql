-- Thông báo trong app (mục "Thông báo kết quả kết nối cho sale" (US17), mục "Popup thông báo mới" (US30), mục "Cài đặt thông báo" (US21), mục "Gửi thông tin cho khách qua Zalo" (US14)): ai nhận, nội dung không lộ dữ liệu, tắt loại, popup mỗi thông báo một lần
begin;
do $$
declare f jsonb := t.fixture();
  hoa uuid := (f->>'hoa')::uuid; tuan uuid := (f->>'tuan')::uuid; hung uuid := (f->>'hung')::uuid; lan uuid := (f->>'lan')::uuid; nga uuid := (f->>'nga')::uuid;
  c1509 uuid := (f->>'c1509')::uuid; c3402 uuid := (f->>'c3402')::uuid;
  r jsonb; y_hung uuid; y_lan uuid; b uuid; v jsonb; k uuid := gen_random_uuid(); n int;
begin
  -- Yêu cầu mới: chủ nhà được báo, không có giá bán, không có khách (PQ19.CHU, PQ11.CHU)
  perform t.login(hung);
  y_hung := (fn_sale_gui_yeu_cau(jsonb_build_object('can_id', c1509, 'ngay_nhan', '2026-12-17', 'ngay_tra', '2026-12-19',
            'tien_thu_khach', 3000000, 'loi_nhan', 'Khách đến tối', 'khach', jsonb_build_object('ten', 'Khách của Hùng', 'sdt', '0900000009')))->>'id')::uuid;
  perform t.login(lan);
  y_lan := (fn_sale_gui_yeu_cau(jsonb_build_object('can_id', c1509, 'ngay_nhan', '2026-12-18', 'ngay_tra', '2026-12-19', 'tien_thu_khach', 1500000))->>'id')::uuid;
  perform t.login(hoa);
  perform t.eq(t.dem_dong($q$select 1 from thong_bao where loai = 'sale_gui_yeu_cau'$q$), 2, 'mục "Cài đặt thông báo" (US21) chủ nhà có thông báo cho mỗi yêu cầu mới');
  select du_lieu into v from thong_bao where nguoi_nhan = hoa and yeu_cau_id = y_hung;
  perform t.ok(v::text not like '%3000000%' and v::text not like '%Khách của Hùng%' and v::text not like '%0900000009%',
               'PQ19.CHU thông báo cho chủ nhà không có giá bán, tên hay số khách của sale');
  perform t.eq(v->>'ten_sale', 'Sale Hùng', 'thông báo ghi tên sale gửi yêu cầu');

  -- Chấp nhận yêu cầu của Hùng: Hùng được báo chấp nhận, Lan được báo từ chối vì chủ nhận đặt phòng khác (mục "Yêu cầu trùng ngày" (US15))
  r := fn_chu_tra_loi_yeu_cau(y_hung, true);
  b := (r->>'booking_id')::uuid;
  perform t.login(hung);
  perform t.eq(t.dem_dong($q$select 1 from thong_bao where loai = 'chu_chap_nhan_yeu_cau'$q$), 1, 'US15-NT10 sale được báo khi chủ chấp nhận');
  perform t.login(lan);
  select du_lieu into v from thong_bao where nguoi_nhan = lan and loai = 'chu_tu_choi_yeu_cau';
  perform t.eq(v->>'ly_do', 'chu_nhan_dat_khac', 'US15-NT18 yêu cầu trùng đêm bị từ chối với lý do chủ nhận đặt phòng khác');
  perform t.ok(v::text not like '%Hùng%', 'PQ19.SALE thông báo cho Sale Lan không có tên Sale Hùng');
  perform t.eq(t.dem_dong('select 1 from thong_bao where nguoi_nhan <> auth.uid()'), 0, 'PQ19 mỗi người chỉ đọc thông báo của mình');

  -- Popup: chỉ thông báo mới kể từ lần mở trước, mỗi thông báo vào popup một lần (mục "Popup thông báo mới" (US30))
  perform t.eq(jsonb_array_length(fn_mo_app(k)), 1, 'mục "Popup thông báo mới" (US30) lần mở đầu trả thông báo chưa đọc');
  perform t.eq(jsonb_array_length(fn_mo_app(k)), 1, 'mục "Popup thông báo mới" (US30) gọi lại cùng khóa sau lỗi mạng trả đúng danh sách cũ');
  perform t.eq(jsonb_array_length(fn_mo_app(gen_random_uuid())), 0, 'mục "Popup thông báo mới" (US30) lần mở sau không trả lại thông báo cũ');
  perform t.eq(t.dem_dong('select 1 from thong_bao where doc_luc is null'), 1, 'mục "Popup thông báo mới" (US30) đóng popup không đổi trạng thái đã đọc');
  perform fn_danh_dau_da_doc();
  perform t.eq(t.dem_dong('select 1 from thong_bao where doc_luc is null'), 0, 'đánh dấu đã đọc');

  -- Chủ sửa đặt phòng của sale: sale được báo ngày cũ, ngày mới, tiền phòng mới (US10-NT8)
  perform t.login(hoa);
  perform fn_chu_sua_booking(b, '{"ngay_nhan":"2026-12-18","ngay_tra":"2026-12-20","tien_phong":1800000}');
  perform t.login(hung);
  select du_lieu into v from thong_bao where nguoi_nhan = hung and loai = 'chu_sua_booking';
  perform t.ok(v->>'ngay_nhan_cu' = '2026-12-17' and v->>'ngay_nhan' = '2026-12-18' and (v->>'tien_phong')::int = 1800000, 'US10-NT8 thông báo có ngày cũ, ngày mới, giá chủ mới');
  perform t.eq((select tien_thu_khach from v_booking_cua_sale where id = b), 3000000, 'US10-NT9 giá bán sale đã báo khách giữ nguyên khi chủ sửa');

  -- Xin hủy và trả lời hủy (mục "Hủy booking đã nhận" (US35))
  perform fn_xin_huy(b);
  perform t.login(hoa);
  perform t.eq(t.dem_dong($q$select 1 from thong_bao where loai = 'xin_huy_booking'$q$), 1, 'US35-NT1 bên kia được báo xin hủy');
  perform fn_tra_loi_huy(b, true);
  perform t.login(hung);
  perform t.eq((select (du_lieu->>'dong_y')::boolean from thong_bao where nguoi_nhan = hung and loai = 'tra_loi_huy_booking'), true, 'mục "Hủy booking đã nhận" (US35) người xin được báo kết quả');

  -- Chủ ghi đặt phòng cho sale; sale tắt loại này thì không có thông báo (mục "Booking chủ nhà ghi cho sale" (US28), mục "Cài đặt thông báo" (US21))
  perform t.login(hoa);
  perform fn_chu_ghi_booking(jsonb_build_object('can_id', c3402, 'ngay_nhan', '2026-12-01', 'ngay_tra', '2026-12-02', 'sale_id', hung));
  perform t.login(hung);
  perform t.eq(t.dem_dong($q$select 1 from thong_bao where loai = 'chu_ghi_booking_cho_sale'$q$), 1, 'US28-NT2 sale được báo khi chủ ghi đặt phòng cho mình');
  perform fn_luu_cai_dat('{"thong_bao_tat":["chu_ghi_booking_cho_sale"]}');
  perform t.login(hoa);
  perform fn_chu_ghi_booking(jsonb_build_object('can_id', c3402, 'ngay_nhan', '2026-12-03', 'ngay_tra', '2026-12-04', 'sale_id', hung));
  perform fn_chu_ghi_booking(jsonb_build_object('can_id', c3402, 'ngay_nhan', '2026-12-05', 'ngay_tra', '2026-12-06'));   -- khách lẻ: không báo ai
  perform t.login(hung);
  perform t.eq(t.dem_dong($q$select 1 from thong_bao where loai = 'chu_ghi_booking_cho_sale'$q$), 1, 'mục "Cài đặt thông báo" (US21)-NT tắt một loại thì không tạo thông báo loại đó; khách lẻ không báo sale nào');

  -- Căn đã gửi khách vừa có người khác đặt (mục "Gửi thông tin cho khách qua Zalo" (US14)): báo một lần, không tên người đặt, không báo khi chính mình đặt
  perform t.login(lan);
  perform fn_ghi_lan_gui(c1509, '2026-12-10', '2026-12-12');
  perform t.login(hung);
  perform fn_ghi_lan_gui(c1509, '2026-12-10', '2026-12-12');
  perform t.login(hoa);
  perform fn_chu_ghi_booking(jsonb_build_object('can_id', c1509, 'ngay_nhan', '2026-12-11', 'ngay_tra', '2026-12-12', 'sale_id', hung));
  perform t.login(lan);
  select du_lieu into v from thong_bao where nguoi_nhan = lan and loai = 'can_da_gui_co_nguoi_dat';
  perform t.ok(v is not null and v::text not like '%Hùng%' and v::text not like '%tien%', 'mục "Gửi thông tin cho khách qua Zalo" (US14) sale đã gửi căn được báo, không tên người đặt, không giá');
  perform t.login(hung);
  perform t.eq(t.dem_dong($q$select 1 from thong_bao where loai = 'can_da_gui_co_nguoi_dat'$q$), 0, 'mục "Gửi thông tin cho khách qua Zalo" (US14) không báo khi chính sale đó là người đặt');
  perform t.login(hoa);
  perform fn_chu_ghi_booking(jsonb_build_object('can_id', c1509, 'ngay_nhan', '2026-12-10', 'ngay_tra', '2026-12-11'));
  perform t.login(lan);
  perform t.eq(t.dem_dong($q$select 1 from thong_bao where loai = 'can_da_gui_co_nguoi_dat'$q$), 1, 'mục "Gửi thông tin cho khách qua Zalo" (US14) mỗi căn mỗi lần gửi chỉ báo một lần');

  -- Căn mới: sale "tất cả căn" được báo, sale "chọn căn" không (mục "Căn mới của chủ nhà tự hiện cho sale" (US6))
  perform t.login(hoa);
  perform fn_tao_can('{"ma_can":"2105","so_phong_ngu":1}');
  perform t.login(hung);
  perform t.eq(t.dem_dong($q$select 1 from thong_bao where loai = 'chu_them_can'$q$), 1, 'mục "Căn mới của chủ nhà tự hiện cho sale" (US6) sale được chia sẻ tất cả căn được báo căn mới');
  perform t.login(lan);
  perform t.eq(t.dem_dong($q$select 1 from thong_bao where loai = 'chu_them_can'$q$), 0, 'mục "Căn mới của chủ nhà tự hiện cho sale" (US6) sale chỉ được vài căn không được báo căn mới');

  -- Ngừng cho xem, rồi chủ xóa tài khoản: báo đúng người (mục "Chủ nhà quản lý danh sách sale" (US5)-NT, US22-NT26)
  perform t.login(hoa);
  perform fn_chu_ngung_sale(lan);
  perform fn_xoa_tai_khoan();
  perform t.login(lan);
  perform t.eq(t.dem_dong($q$select 1 from thong_bao where loai = 'chu_ngung_ket_noi'$q$), 1, 'mục "Chủ nhà quản lý danh sách sale" (US5) sale bị ngừng nhận thông báo');
  perform t.eq(t.dem_dong($q$select 1 from thong_bao where loai = 'chu_xoa_tai_khoan'$q$), 0, 'sale đã bị ngừng không nhận thông báo chủ xóa tài khoản');
  perform t.login(hung);
  perform t.eq(t.dem_dong($q$select 1 from thong_bao where loai = 'chu_xoa_tai_khoan'$q$), 1, 'US22-NT26 mỗi sale đang kết nối có một thông báo chủ nhà đã xóa tài khoản');

  -- Người chưa đăng nhập không đọc được thông báo nào
  set local role anon; select count(*) into n from thong_bao; reset role;
  perform t.eq(n, 0, 'PQ19 người chưa đăng nhập không đọc được thông báo');
end $$;
rollback;
