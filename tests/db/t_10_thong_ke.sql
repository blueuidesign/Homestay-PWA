-- Thống kê (YC7, QT2.2, QT3, QT4.2): doanh thu và đêm có khách chia theo đêm, tiền chênh của sale, đã hủy không tính
begin;
do $$
declare f jsonb := t.fixture();
  hoa uuid := (f->>'hoa')::uuid; hung uuid := (f->>'hung')::uuid; lan uuid := (f->>'lan')::uuid;
  c1509 uuid := (f->>'c1509')::uuid; c3402 uuid := (f->>'c3402')::uuid; villa uuid := (f->>'villa')::uuid;
  r jsonb; b1 uuid; b9 uuid; y uuid; n int;
begin
  perform t.login(hung);
  perform fn_dat_muc_cong(c1509, 200000);
  perform t.login(hoa);
  -- B1: chủ ghi cho Sale Hùng, 1509, 10/10 → 12/10 (đêm T7 10/10: 1.300.000; đêm CN 11/10: 900.000) = 2.200.000
  b1 := (fn_chu_ghi_booking(jsonb_build_object('can_id', c1509, 'ngay_nhan', '2026-10-10', 'ngay_tra', '2026-10-12', 'sale_id', hung))->>'id')::uuid;
  -- khách lẻ 3402, 14/10 → 15/10, chủ gõ 1.000.000, chưa cọc
  perform fn_chu_ghi_booking(jsonb_build_object('can_id', c3402, 'ngay_nhan', '2026-10-14', 'ngay_tra', '2026-10-15', 'tien_phong', 1000000));
  -- B9: 30/11 → 02/12, chủ gõ 2.000.000: chia đều 1.000.000 mỗi đêm, mỗi tháng một đêm (QT2.2-VD1, QT4.2-VD1)
  b9 := (fn_chu_ghi_booking(jsonb_build_object('can_id', c1509, 'ngay_nhan', '2026-11-30', 'ngay_tra', '2026-12-02', 'tien_phong', 2000000))->>'id')::uuid;

  r := fn_thong_ke_chu('2026-10-01');
  perform t.eq((r->>'doanh_thu')::int, 3200000, 'YC7.1 doanh thu tháng 10 = 2.200.000 + 1.000.000');
  perform t.eq((r->>'dem_co_khach')::int, 3, 'QT2.2 tháng 10 có 3 đêm có khách');
  perform t.eq((r->>'cong_suat')::numeric, 4.8, 'YC7.1 công suất = 3 ÷ (2 căn × 31 đêm) = 4.8%');
  perform t.eq((select sum((e->>'doanh_thu')::int) from jsonb_array_elements(r->'theo_nguoi_ban') e)::int, 3200000, 'YC7.3-NT tổng các dòng người bán bằng doanh thu tháng');
  perform t.ok(exists (select 1 from jsonb_array_elements(r->'theo_nguoi_ban') e where e->>'ten' = 'Khách lẻ' and (e->>'doanh_thu')::int = 1000000), 'YC7.3 khách lẻ có dòng riêng');
  perform t.ok(r::text not like '%2600000%' and r::text not like '%tien_thu_khach%' and r::text not like '%tien_chenh%', 'PQ11.CHU, PQ15 thống kê của chủ không có giá bán hay tiền chênh của sale');
  perform t.eq((fn_thong_ke_chu('2026-11-01')->>'doanh_thu')::int, 1000000, 'QT2.2-VD1 đêm 30/11 thuộc tháng 11');
  perform t.eq((fn_thong_ke_chu('2026-12-01')->>'doanh_thu')::int, 1000000, 'QT2.2-VD1 đêm 01/12 thuộc tháng 12');
  perform t.eq((fn_thong_ke_chu('2026-11-01')->>'so_voi_thang_truoc')::numeric, -68.8, 'YC7.1 so với tháng trước: (1.000.000 − 3.200.000) ÷ 3.200.000 = −68.8%');
  perform t.eq((fn_thong_ke_chu('2027-05-01')->>'so_voi_thang_truoc'), null, 'YC7.1 tháng trước bằng 0 thì không có dòng so sánh');
  perform t.eq(jsonb_array_length(fn_thong_ke_chu('2026-12-01')->'sau_thang'), 6, 'YC7.2 biểu đồ 6 tháng tính tới tháng đang xem');

  -- Thu đủ và hoàn tác (YC4.2)
  perform fn_chu_sua_booking(b1, '{"trang_thai_tien":"da_coc_con_thu","tien_coc":1000000}');
  perform fn_chu_thu_du(b1);
  perform t.eq((select trang_thai_tien from booking where id = b1), 'da_thanh_toan', 'YC4.2-NT2 đã thu đủ thì nhãn Đã thanh toán');
  perform fn_chu_hoan_tac_thu_du(b1);
  perform t.eq((select trang_thai_tien from booking where id = b1), 'da_coc_con_thu', 'YC4.2-NT3 hoàn tác thì về trạng thái trước');
  perform t.throws(format($q$select fn_chu_sua_booking(%L, '{"tien_coc":9000000}')$q$, b1), 'tiền cọc lớn hơn tiền phòng bị từ chối', null);

  -- Sale: tiền chênh (QT3.1-VD3: chủ ghi cho Hùng, mức cộng 200k mỗi đêm: giá bán 2.600.000, chênh 400.000)
  perform t.login(hung);
  perform t.eq((select tien_thu_khach from v_booking_cua_sale where id = b1), 2600000, 'QT3.1-VD3 giá bán điền sẵn = tiền phòng + mức cộng × số đêm');
  perform fn_sale_ghi_tu_nhap(jsonb_build_object('can_id', villa, 'ngay_nhan', '2026-10-08', 'ngay_tra', '2026-10-09', 'tien_phong', 1400000, 'tien_thu_khach', 1600000));
  y := (fn_sale_gui_yeu_cau(jsonb_build_object('can_id', c3402, 'ngay_nhan', '2026-10-20', 'ngay_tra', '2026-10-21', 'tien_thu_khach', 5000000))->>'id')::uuid;
  r := fn_thong_ke_sale('2026-10-01');
  perform t.eq((r->>'so_dat_phong')::int, 2, 'YC7.5 tính đặt phòng chủ ghi cho sale và đặt phòng căn tự nhập; yêu cầu đang chờ không tính');
  perform t.eq((r->>'tien_chenh')::int, 600000, 'QT3.1 tiền chênh = 400.000 (B1) + 200.000 (căn tự nhập, QT3.1-VD2)');
  perform t.eq((r->>'doanh_so')::int, 4200000, 'YC7.5 doanh số = 2.600.000 + 1.600.000');
  perform t.ok(r::text not like '%tien_coc%', 'PQ8.SALE thống kê của sale không có tiền cọc');
  perform t.login(lan);
  perform t.eq((fn_thong_ke_sale('2026-10-01')->>'so_dat_phong')::int, 0, 'PQ15 sale khác không thấy số của Sale Hùng');

  -- Đã hủy không tính (YC4.9-NT2)
  perform t.login(hung);
  perform fn_xin_huy(b1);
  perform t.login(hoa);
  perform fn_tra_loi_huy(b1, true);
  perform t.eq((fn_thong_ke_chu('2026-10-01')->>'doanh_thu')::int, 1000000, 'YC4.9-NT2 đặt phòng đã hủy không tính vào doanh thu');
  perform t.login(hung);
  perform t.eq((fn_thong_ke_sale('2026-10-01')->>'tien_chenh')::int, 200000, 'YC4.9-NT2 đặt phòng đã hủy không tính vào tiền chênh');

  -- Xuất file (YC9.6): chỉ booking căn của mình, có khách chủ nhà nhập, không có khách hay giá bán của sale
  perform t.login(hoa);
  select count(*) into n from fn_xuat_booking('2026-10-01', '2026-10-31');
  perform t.eq(n, 2, 'YC9.6 số dòng xuất tháng 10: 2 đặt phòng của căn Chị Hoa');
  perform t.login((f->>'tuan')::uuid);
  select count(*) into n from fn_xuat_booking('2026-10-01', '2026-12-31');
  perform t.eq(n, 0, 'PQ20 chủ khác không xuất được đặt phòng của Chị Hoa');
end $$;
rollback;
