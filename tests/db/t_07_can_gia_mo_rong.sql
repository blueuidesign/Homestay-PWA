-- Căn và giá phần mở rộng: sửa căn, xóa căn, ảnh, giá dịp, sao chép giá, mức cộng và giá bán của sale (nhóm Căn và giá, mục "Chi tiết căn và giá bán" (US13), mục "Mức cộng giá mặc định" (US13))
begin;
do $$
declare f jsonb := t.fixture();
  hoa uuid := (f->>'hoa')::uuid; tuan uuid := (f->>'tuan')::uuid; hung uuid := (f->>'hung')::uuid; lan uuid := (f->>'lan')::uuid;
  c1509 uuid := (f->>'c1509')::uuid; c3402 uuid := (f->>'c3402')::uuid; c1103 uuid := (f->>'c1103')::uuid; villa uuid := (f->>'villa')::uuid;
  v_id uuid; v_c uuid; a1 uuid; a2 uuid; r jsonb; i int; v_ids uuid[] := '{}';
begin
  -- Mã căn (US1-NT11, mục "Sửa thông tin căn" (US11))
  perform t.login(hoa);
  perform t.throws($q$select fn_tao_can('{"ma_can":"1509","so_phong_ngu":2}')$q$, 'US1-NT11 mã căn trùng trong cùng chủ bị từ chối', 'Đã có căn 1509');
  perform t.throws($q$select fn_tao_can('{"ma_can":"9999"}')$q$, 'mục "Thêm căn" (US1) thiếu số phòng ngủ thì không thêm', 'số phòng ngủ');
  perform t.throws(format($q$select fn_sua_can(%L, '{"ma_can":"1509"}')$q$, c3402), 'mục "Sửa thông tin căn" (US11) đổi mã trùng căn khác của mình bị từ chối', 'Đã có căn 1509');
  perform fn_sua_can(c3402, '{"so_giuong":2,"loai_view":"nui"}');
  perform t.eq((select so_giuong::int from can where id = c3402), 2, 'mục "Sửa thông tin căn" (US11) sửa số giường');
  perform fn_sua_can(c3402, '{"so_giuong":null}');
  perform t.ok((select so_giuong is null from can where id = c3402), 'mục "Sửa thông tin căn" (US11) xóa trống số giường');
  perform t.login(tuan);
  perform t.throws(format($q$select fn_sua_can(%L, '{"so_giuong":9}')$q$, c1509), 'PQ3.CHU chủ khác không sửa được căn', 'Không tìm thấy căn');
  perform fn_tao_can('{"ma_can":"1509","so_phong_ngu":1}');   -- hai chủ khác nhau cùng mã được

  -- Ảnh (mục "Thêm căn" (US1)): tối đa 12, ảnh của người khác không gắn được, phần tử đầu là ảnh đại diện
  perform t.login(hoa);
  a1 := fn_dang_ky_anh(hoa::text || '/a1.jpg'); a2 := fn_dang_ky_anh(hoa::text || '/a2.jpg');
  perform t.throws(format('select fn_dang_ky_anh(%L)', tuan::text || '/x.jpg'), 'PQ3 không ghi ảnh vào thư mục người khác', 'không thuộc về bạn');
  perform fn_gan_anh_can(c1509, array[a2, a1]);
  perform t.eq((select id from anh_can where can_id = c1509 and thu_tu = 1), a2, 'US11-NT9 ảnh đầu danh sách là ảnh đại diện');
  perform fn_gan_anh_can(c1509, array[a1]);
  perform t.eq((select count(*)::int from anh_can where can_id = c1509), 1, 'ảnh không còn trong danh sách thì bỏ khỏi căn');
  for i in 1..13 loop v_ids := v_ids || fn_dang_ky_anh(hoa::text || '/n' || i || '.jpg'); end loop;
  perform t.throws(format('select fn_gan_anh_can(%L, %L::uuid[])', c1509, v_ids), 'US25-NT4 quá 12 ảnh bị từ chối', 'tối đa 12');
  perform t.login(tuan);
  perform t.throws(format('select fn_gan_anh_can(%L, array[%L]::uuid[])', c1103, a1), 'PQ3.CHU không gắn ảnh của chủ khác vào căn mình', 'không phải của bạn');
  perform t.login(hung);
  perform t.eq(t.dem_dong(format('select 1 from anh_can where can_id = %L', c1509)), 1, 'sale được chia sẻ thấy ảnh căn');
  perform t.login((f->>'nga')::uuid);
  perform t.eq(t.dem_dong('select 1 from anh_can'), 0, 'sale chưa kết nối không thấy ảnh nào');

  -- Giá dịp thay giá tháng (mục "Giá ngày lễ và dịp đặc biệt" (US8))
  perform t.login(hoa);
  v_id := fn_luu_gia_dip(c1509, '{"ten":"Giáng sinh","la_ngay_le":true,"ngay_dau":"2026-12-24","ngay_cuoi":"2026-12-25","gia_moi_dem":2000000}');
  perform t.eq(gia_dem(c1509, '2026-12-24'), 2000000, 'mục "Giá ngày lễ và dịp đặc biệt" (US8) đêm trong dải dùng giá dải');
  perform t.eq(gia_dem(c1509, '2026-12-26'), 1300000, 'mục "Giá ngày lễ và dịp đặc biệt" (US8) đêm ngoài dải dùng giá tháng (26/12/2026 là T7)');
  perform t.throws(format($q$select fn_luu_gia_dip(%L, '{"ngay_dau":"2026-12-25","ngay_cuoi":"2026-12-27","gia_moi_dem":1500000}')$q$, c1509), 'mục "Giá ngày lễ và dịp đặc biệt" (US8) hai dải chồng ngày bị từ chối', 'trùng ngày');
  v_id := fn_luu_gia_dip(c1509, '{"ngay_dau":"2026-12-26","ngay_cuoi":"2026-12-27","gia_moi_dem":1500000}');
  perform t.eq((select ten from gia_dip where id = v_id), 'Dịp đặc biệt 26/12 – 27/12', 'mục "Giá ngày lễ và dịp đặc biệt" (US8) bỏ trống tên thì app đặt tên; hai dải liền nhau thì được');
  perform t.throws(format($q$select fn_luu_gia_dip(%L, '{"ngay_dau":"2026-11-01","ngay_cuoi":"2026-11-11","gia_moi_dem":1500000}')$q$, c1509), 'mục "Giá ngày lễ và dịp đặc biệt" (US8) dải dài hơn 10 ngày bị từ chối', 'tối đa 10 ngày');
  perform t.login(tuan);
  perform t.throws(format($q$select fn_luu_gia_dip(%L, '{"ngay_dau":"2026-11-01","ngay_cuoi":"2026-11-02","gia_moi_dem":1}')$q$, c1509), 'PQ5.CHU chủ khác không đặt giá dịp', 'không đặt giá được');
  perform t.login(lan);
  perform t.eq(t.dem_dong(format('select 1 from gia_dip where can_id = %L', c1509)), 2, 'PQ5.SALE sale được chia sẻ thấy giá dịp');
  perform t.eq(t.dem_dong(format('select 1 from gia_dip where can_id = %L', c3402)), 0, 'PQ5.SALE sale không thấy giá dịp căn ngoài phạm vi');
  set local role anon;
  select count(*) into i from gia_dip; reset role;
  perform t.eq(i, 0, 'PQ5.KHACH người chưa đăng nhập không đọc được giá dịp');

  -- Sao chép giá (mục "Sao chép giá sang căn khác" (US7)): thay giá tháng nguồn có; dải trùng đúng ngày thì thay; dải chồng lệch thì giữ dải đích
  perform t.login(hoa);
  perform fn_luu_gia_dip(c3402, '{"ten":"Riêng 3402","ngay_dau":"2026-12-27","ngay_cuoi":"2026-12-28","gia_moi_dem":999000}');
  perform fn_sao_chep_gia(c1509, array[c3402], array['thang', 'ngay_le', 'dip']);
  perform t.eq((select gia_cuoi_tuan from gia_thang where can_id = c3402 and thang = '2026-10-01'), 1300000, 'mục "Sao chép giá sang căn khác" (US7) giá tháng của đích bị thay bằng giá nguồn');
  perform t.eq(gia_dem(c3402, '2026-12-24'), 2000000, 'mục "Sao chép giá sang căn khác" (US7) dải ngày lễ được chép sang');
  perform t.eq(gia_dem(c3402, '2026-12-27'), 999000, 'mục "Sao chép giá sang căn khác" (US7) dải nguồn chồng lệch dải đích thì giữ dải đích');
  perform t.throws(format('select fn_sao_chep_gia(%L, array[%L]::uuid[], array[%L])', c1509, c1103, 'thang'), 'PQ5.CHU không sao chép giá sang căn của chủ khác', 'căn của bạn');

  -- Đặt giá nhiều căn (mục "Đặt giá nhiều căn" (US7))
  perform fn_dat_gia_nhieu_can(array[c1509, c3402], array['2027-01-01']::date[], 1000000, 1200000);
  perform t.eq(gia_dem(c3402, '2027-01-04'), 1000000, 'mục "Đặt giá nhiều căn" (US7) đặt giá một lần cho nhiều căn');

  -- Mức cộng và giá bán (mục "Chi tiết căn và giá bán" (US13), mục "Mức cộng giá mặc định" (US13)). 31/10/2026 là T7: 1.300.000; 01/11 là CN: 900.000 (QT4.1-VD1)
  perform t.login(hung);
  perform fn_dat_muc_cong(c1509, 200000);
  r := fn_sale_gia(c1509, '2026-10-31', '2026-11-02');
  perform t.eq((r->>'tong_gia_chu')::int, 2200000, 'mục "Chi tiết căn và giá bán" (US13) tổng giá chủ nhà 2 đêm');
  perform t.eq((r->>'tong_gia_ban')::int, 2600000, 'US13-NT1 mức cộng 200k mỗi đêm, 2 đêm: giá bán = giá chủ + 400.000đ');
  perform fn_luu_cai_dat('{"muc_cong_mac_dinh":120000,"lam_tron_50k":true}');
  r := fn_sale_gia(c3402, '2026-11-02', '2026-11-03');   -- 3402 đã chép giá 900.000; không có mức riêng nên dùng mức mặc định
  perform t.eq((r->>'tong_gia_ban')::int, 1050000, 'US13-NT9 làm tròn lên bội số 50.000đ: 900.000 + 120.000 = 1.020.000 thành 1.050.000');
  perform t.eq((fn_sale_gia(c1509, '2027-03-01', '2027-03-02')->>'tong_gia_ban'), null, 'đêm chưa đặt giá thì không có giá bán');
  perform t.throws(format('select fn_sale_gia(%L, %L, %L)', c1103, '2026-11-02', '2026-11-03'), 'PQ5.SALE sale không lấy được giá căn không được chia sẻ', 'không được xem');
  perform t.login(lan);
  perform t.throws(format('select fn_dat_muc_cong(%L, 100000)', c3402), 'PQ11 không đặt mức cộng cho căn ngoài phạm vi', 'không được xem');
  -- Chủ nhà không bao giờ thấy mức cộng, mức mặc định, mẫu tin của sale (PQ11.CHU)
  perform t.login(hoa);
  perform t.eq(t.dem_dong('select 1 from muc_cong'), 0, 'PQ11.CHU chủ nhà không đọc được mức cộng của sale');
  perform t.eq(t.dem_dong('select 1 from cai_dat_rieng'), 0, 'PQ11.CHU chủ nhà không đọc được cài đặt riêng của sale');
  perform t.login((f->>'admin')::uuid);
  perform t.eq(t.dem_dong('select 1 from muc_cong'), 0, 'quản trị cũng không đọc mức cộng của sale');

  -- Xóa căn (mục "Xóa căn" (US27)): còn booking chưa tới ngày trả thì không xóa; trả hôm nay thì xóa được
  perform t.login(hoa);
  perform fn_chu_ghi_booking(jsonb_build_object('can_id', c3402, 'ngay_nhan', local_today() + 5, 'ngay_tra', local_today() + 6, 'tien_phong', 800000));
  perform t.throws(format('select fn_an_can(%L)', c3402), 'mục "Xóa căn" (US27) còn đặt phòng sắp tới thì không xóa căn', 'Căn còn đặt phòng sắp tới');
  v_c := fn_tao_can('{"ma_can":"2105","so_phong_ngu":1}');
  perform fn_chu_ghi_booking(jsonb_build_object('can_id', v_c, 'ngay_nhan', local_today() - 2, 'ngay_tra', local_today(), 'tien_phong', 500000));
  perform fn_an_can(v_c);
  perform t.eq(t.dem_dong(format('select 1 from booking where can_id = %L', v_c)), 1, 'mục "Xóa căn" (US27) xóa căn là ẩn: đặt phòng cũ còn');
  perform fn_tao_can('{"ma_can":"2105","so_phong_ngu":1}');   -- mã của căn đã xóa dùng lại được
  perform t.login(hung);
  perform t.eq(t.dem_dong(format('select 1 from can where id = %L', v_c)), 0, 'mục "Xóa căn" (US27) căn đã xóa biến khỏi phía sale');

  -- Căn tự nhập: giá chủ lấy từ căn; xóa số chủ căn thì không còn giữ (mục "Thêm căn tự nhập" (US16))
  perform t.eq(gia_dem(villa, '2026-11-03'), 1400000, 'mục "Ghi booking đã chốt cho căn tự nhập" (US16) giá chủ của căn tự nhập lấy từ giá sale đã nhập');
  perform fn_sua_can(villa, '{"sdt_chu_can":""}');
  perform t.ok((select sdt_chu_can is null from can where id = villa), 'mục "Thêm căn tự nhập" (US16) xóa số chủ căn thì máy chủ không còn giữ số');
  perform t.login(hoa);
  perform t.eq(t.dem_dong(format('select 1 from can where id = %L', villa)), 0, 'PQ14 chủ nhà không thấy căn tự nhập của sale');
end $$;
rollback;
