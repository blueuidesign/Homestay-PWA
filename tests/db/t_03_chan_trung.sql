-- Chặn trùng booking ở database (QD-006). Mỗi khối mang mã ví dụ của QT1 (docs/nguon/Dac_ta.md, mục QT1).
begin;
do $$
declare f jsonb := t.fixture();
  hoa uuid := (f->>'hoa')::uuid; hung uuid := (f->>'hung')::uuid;
  c1509 uuid := (f->>'c1509')::uuid; c3402 uuid := (f->>'c3402')::uuid; villa uuid := (f->>'villa')::uuid;
  b1 jsonb; b5 jsonb; r jsonb; cid uuid := gen_random_uuid(); v_villa2 uuid;
begin
  perform t.login(hoa);
  b1 := fn_chu_ghi_booking(jsonb_build_object('can_id', c1509, 'ngay_nhan', '2026-10-10', 'ngay_tra', '2026-10-12'));

  -- QT1.1-VD1: trùng đêm 11/10 thì từ chối
  perform t.throws(format($q$select fn_chu_ghi_booking('{"can_id":"%s","ngay_nhan":"2026-10-11","ngay_tra":"2026-10-13"}')$q$, c1509), 'QT1.1-VD1 trùng đêm bị từ chối', 'đã có đặt phòng');
  -- QT1.1-VD2: 12/10 là ngày trả của B1, không phải đêm của B1
  perform fn_chu_ghi_booking(jsonb_build_object('can_id', c1509, 'ngay_nhan', '2026-10-12', 'ngay_tra', '2026-10-13'));
  -- QT1.1-VD3: khác căn thì lưu được
  perform fn_chu_ghi_booking(jsonb_build_object('can_id', c3402, 'ngay_nhan', '2026-10-10', 'ngay_tra', '2026-10-12'));
  perform t.eq(t.dem_dong('select 1 from booking'), 3, 'QT1.1 có đúng 3 booking');

  -- Chặn ngay ở bảng, kể cả khi ai đó lách hàm (đóng vai quyền cao nhất, ghi thẳng)
  perform t.throws(format('insert into booking (can_id, dem, nguon, chu_nha_id, tien_phong) values (%L, %L, %L, %L, 1)', c1509, '[2026-10-11,2026-10-12)', 'chu_tu_ghi', hoa), 'ràng buộc database chặn trùng cả khi ghi thẳng', 'booking_khong_trung');

  -- QT1.2-VD1: sửa chính booking, giữ ngày, đổi tiền
  perform fn_chu_sua_booking((b1->>'id')::uuid, '{"tien_phong":2000000}');
  perform t.eq((select tien_phong from booking where id = (b1->>'id')::uuid), 2000000, 'QT1.2-VD1 sửa tiền giữ ngày lưu được');
  -- QT1.2-VD2: kéo B1 tới 14/10 đè lên B5 13/10 → 15/10
  b5 := fn_chu_ghi_booking(jsonb_build_object('can_id', c1509, 'ngay_nhan', '2026-10-13', 'ngay_tra', '2026-10-15'));
  perform t.throws(format($q$select fn_chu_sua_booking(%L, '{"ngay_tra":"2026-10-14"}')$q$, b1->>'id'), 'QT1.2-VD2 sửa đè booking khác bị từ chối', 'đã có đặt phòng');
  perform t.eq(upper((select dem from booking where id = (b1->>'id')::uuid)), '2026-10-12'::date, 'sửa bị từ chối thì booking giữ nguyên');
  perform t.eq((select count(*)::int from audit_log where table_name = 'booking' and row_id = (b1->>'id')::uuid), 1, 'mỗi lần sửa thành công ghi một dòng nhật ký');

  -- Đã hủy thì không chiếm đêm (QD-012)
  update booking set trang_thai = 'da_huy', xin_huy_boi = hoa, xin_huy_luc = now() where id = (b5->>'id')::uuid;
  perform fn_chu_ghi_booking(jsonb_build_object('can_id', c1509, 'ngay_nhan', '2026-10-13', 'ngay_tra', '2026-10-14'));

  -- QT1.3: căn tự nhập chỉ chặn trùng trong chính căn đó
  perform t.login(hung);
  perform fn_sale_ghi_tu_nhap(jsonb_build_object('can_id', villa, 'ngay_nhan', '2026-10-08', 'ngay_tra', '2026-10-09', 'tien_phong', 1400000, 'tien_thu_khach', 1600000));
  perform t.throws(format($q$select fn_sale_ghi_tu_nhap('{"can_id":"%s","ngay_nhan":"2026-10-08","ngay_tra":"2026-10-10","tien_phong":2800000}')$q$, villa), 'QT1.3-VD1 trùng trong căn tự nhập bị từ chối', 'đã có đặt phòng');
  perform t.login((f->>'lan')::uuid);
  v_villa2 := fn_tao_can('{"ma_can":"Villa Tuần Châu","loai":"tu_nhap","so_phong_ngu":4,"ten_chu_can":"Chú Bình","sdt_chu_can":"0900000001"}');
  perform fn_sale_ghi_tu_nhap(jsonb_build_object('can_id', v_villa2, 'ngay_nhan', '2026-10-08', 'ngay_tra', '2026-10-09', 'tien_phong', 1400000));

  -- Gửi lại cùng client_id (rớt mạng) không tạo booking thứ hai
  perform t.login(hoa);
  r := fn_chu_ghi_booking(jsonb_build_object('can_id', c3402, 'ngay_nhan', '2026-10-20', 'ngay_tra', '2026-10-21', 'client_id', cid));
  perform t.eq((fn_chu_ghi_booking(jsonb_build_object('can_id', c3402, 'ngay_nhan', '2026-10-20', 'ngay_tra', '2026-10-21', 'client_id', cid))->>'id'), r->>'id', 'gửi lại trả về booking cũ');

  -- Ngày trả phải sau ngày nhận
  perform t.throws(format($q$select fn_chu_ghi_booking('{"can_id":"%s","ngay_nhan":"2026-10-25","ngay_tra":"2026-10-25"}')$q$, c3402), 'không ghi booking 0 đêm', 'sau ngày nhận');
end $$;
rollback;
