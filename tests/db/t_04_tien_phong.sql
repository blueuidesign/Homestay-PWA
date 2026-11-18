-- Tiền phòng điền sẵn và chia theo đêm (QD-010). Ví dụ của QT4.1, QT4.2, QT2.2.
begin;
do $$
declare f jsonb := t.fixture(); hoa uuid := (f->>'hoa')::uuid; c1509 uuid := (f->>'c1509')::uuid; c3402 uuid := (f->>'c3402')::uuid; r jsonb;
begin
  perform t.login(hoa);
  -- QT4.1-VD1 và QT4.2-VD3: không sửa thì tiền phòng là tổng bảng giá, mỗi đêm giữ giá của đêm đó
  r := fn_chu_ghi_booking(jsonb_build_object('can_id', c1509, 'ngay_nhan', '2026-10-31', 'ngay_tra', '2026-11-02'));
  perform t.eq((r->>'tien_phong')::int, 2200000, 'QT4.1-VD1 điền sẵn 2.200.000đ');
  perform t.eq((select tien from booking_dem where booking_id = (r->>'id')::uuid and dem = '2026-10-31'), 1300000, 'QT4.2-VD3 đêm 31/10 giữ 1.300.000đ');
  perform t.eq((select tien from booking_dem where booking_id = (r->>'id')::uuid and dem = '2026-11-01'), 900000, 'QT4.2-VD3 đêm 01/11 giữ 900.000đ');

  -- QT4.1-VD2 và QT4.2-VD1: chủ gõ 2.000.000đ thì chia đều, mỗi tháng 1.000.000đ (QT2.2)
  r := fn_chu_ghi_booking(jsonb_build_object('can_id', c3402, 'ngay_nhan', '2026-10-31', 'ngay_tra', '2026-11-02', 'tien_phong', 2000000));
  perform t.eq((select sum(tien)::int from booking_dem where booking_id = (r->>'id')::uuid and dem < '2026-11-01'), 1000000, 'QT4.2-VD1 doanh thu tháng 10');
  perform t.eq((select sum(tien)::int from booking_dem where booking_id = (r->>'id')::uuid and dem >= '2026-11-01'), 1000000, 'QT4.2-VD1 doanh thu tháng 11');

  -- QT4.2-VD2: 1.000.000đ cho 3 đêm, phần lẻ dồn đêm cuối
  r := fn_chu_ghi_booking(jsonb_build_object('can_id', c1509, 'ngay_nhan', '2026-11-10', 'ngay_tra', '2026-11-13', 'tien_phong', 1000000));
  perform t.eq((select array_agg(tien order by dem) from booking_dem where booking_id = (r->>'id')::uuid), array[333333, 333333, 333334], 'QT4.2-VD2 chia đều, lẻ dồn đêm cuối');
  perform t.eq((select sum(tien)::int from booking_dem where booking_id = (r->>'id')::uuid), 1000000, 'tổng các đêm bằng tiền phòng');

  -- Sửa tiền thì chia lại
  perform fn_chu_sua_booking((r->>'id')::uuid, '{"tien_phong":900000}');
  perform t.eq((select array_agg(tien order by dem) from booking_dem where booking_id = (r->>'id')::uuid), array[300000, 300000, 300000], 'sửa tiền thì chia lại các đêm');

  -- QT4.1-VD3: tháng chưa đặt giá mà không nhập tiền thì chưa lưu được
  perform t.throws(format($q$select fn_chu_ghi_booking('{"can_id":"%s","ngay_nhan":"2027-01-04","ngay_tra":"2027-01-05"}')$q$, c1509), 'QT4.1-VD3 thiếu tiền phòng thì chưa lưu', 'tiền phòng');
end $$;
rollback;
