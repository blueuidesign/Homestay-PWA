-- Kết nối phần mở rộng (mục "Sale xin chủ nhà cho xem lịch" (US17) đến mục "Chủ nhà quản lý danh sách sale" (US5)), yêu cầu hủy và hết hạn (mục "Sale gửi yêu cầu đặt phòng" (US15)), quản trị (nhóm Quản trị Home247 trên web)
begin;
do $$
declare f jsonb := t.fixture();
  hoa uuid := (f->>'hoa')::uuid; tuan uuid := (f->>'tuan')::uuid; hung uuid := (f->>'hung')::uuid; lan uuid := (f->>'lan')::uuid;
  nga uuid := (f->>'nga')::uuid; adm uuid := (f->>'admin')::uuid;
  c1509 uuid := (f->>'c1509')::uuid; c3402 uuid := (f->>'c3402')::uuid; c1103 uuid := (f->>'c1103')::uuid;
  v_ma text; v jsonb; y uuid; v_id uuid; n int;
begin
  -- Sale xin lịch (mục "Sale xin chủ nhà cho xem lịch" (US17)): mỗi sale một link; chủ nhà mở thấy tên, đồng ý thì sale thấy căn (mục "Chủ nhà duyệt lời mời xem lịch" (US17))
  perform t.login(nga);
  perform fn_cap_nhat_ho_so('{"sdt":"0900 000 004"}');
  v_ma := fn_lay_link_xin_lich();
  perform t.eq(fn_lay_link_xin_lich(), v_ma, 'mục "Sale xin chủ nhà cho xem lịch" (US17) mỗi sale một link xin lịch dùng cho nhiều chủ nhà');
  perform fn_dem_gui_xin_lich();
  perform t.ok(v_ma !~ '0900' and v_ma !~ nga::text, 'mục "Sale xin chủ nhà cho xem lịch" (US17) link không chứa số điện thoại hay mã người dùng');
  perform t.ok(not has_function_privilege('anon', 'public.fn_xem_link_xin_lich(text)', 'execute'), 'PQ18 mở link xin lịch cần đăng nhập vì trả số điện thoại');
  perform t.throws(format('select fn_xem_link_xin_lich(%L)', v_ma), 'sale không tự mở link của mình', 'của chính bạn');
  perform t.login(tuan);
  v := fn_xem_link_xin_lich(v_ma);
  perform t.ok(v->>'ten' = 'Sale Nga' and v->>'sdt' = '0900000004', 'US17-NT6 chủ nhà thấy đúng tên và số của sale');
  perform fn_chu_dong_y_xin_lich(v_ma, '{"quyen_tinh_trang_coc":false}');
  perform t.login(nga);
  perform t.eq(t.dem_dong(format('select 1 from can where id = %L', c1103)), 1, 'mục "Chủ nhà duyệt lời mời xem lịch" (US17) chủ nhà đồng ý thì sale thấy căn');
  perform t.eq(t.dem_dong(format('select 1 from gia_thang where can_id = %L', c1103)), 3, 'US17-NT7 tắt tình trạng cọc không ảnh hưởng giá: sale vẫn thấy giá (QD-007)');
  perform t.eq(t.dem_dong($q$select 1 from thong_bao where loai = 'chu_dong_y_ket_noi'$q$), 1, 'mục "Thông báo kết quả kết nối cho sale" (US17) sale được báo khi chủ nhà đồng ý');
  perform t.eq(t.dem_dong('select 1 from link_xin_lich'), 1, 'sale chỉ thấy link xin lịch của mình');

  -- Sale đã xóa tài khoản: link không dùng được, không lộ tên và số (US22-NT2)
  perform fn_xoa_tai_khoan();
  perform t.login(hoa);
  perform t.throws(format('select fn_xem_link_xin_lich(%L)', v_ma), 'US22-NT2 sale đã xóa tài khoản: link không dùng được', 'không còn dùng được');

  -- Chủ gửi lịch các căn đã chọn (mục "Chủ nhà chủ động gửi lịch cho sale" (US26)): sale chỉ được các căn đó; căn mới không tự thêm (mục "Căn mới của chủ nhà tự hiện cho sale" (US6))
  perform t.login(tuan);
  perform fn_tao_can('{"ma_can":"1104","so_phong_ngu":1}');
  v_ma := fn_tao_link_gui_lich(array[c1103]);
  perform t.throws(format('select fn_tao_link_gui_lich(array[%L]::uuid[])', c1509), 'PQ18 không gửi lịch căn của chủ khác', 'căn của bạn');
  perform t.login(hung);
  v := fn_xem_link_moi(v_ma);
  perform t.ok(jsonb_array_length(v->'can') = 1 and v::text not like '%700000%', 'mục "Chủ nhà chủ động gửi lịch cho sale" (US26) link gửi lịch chỉ hiện căn đã chọn, không có giá');
  perform fn_them_lich_tu_link(v_ma);
  perform t.eq(t.dem_dong(format('select 1 from can where nguoi_giu = %L', tuan)), 1, 'mục "Chủ nhà chủ động gửi lịch cho sale" (US26) sale chỉ thấy căn được gửi, không thấy căn khác của chủ');
  perform t.throws(format('select fn_them_lich_tu_link(%L)', v_ma), 'mục "Mở app từ link mời của chủ nhà" (US6)-NT mở lại link đã thêm thì báo, không nhân đôi', 'đã thêm lịch');

  -- Đổi phạm vi, thêm tay, bỏ nguồn (mục "Chủ nhà quản lý danh sách sale" (US5), mục "Chi tiết chủ nhà và bỏ nguồn phòng" (US16))
  perform t.login(tuan);
  perform fn_chu_doi_quyen_sale(hung, '{"pham_vi":"tat_ca_can"}');
  perform t.login(hung);
  perform t.eq(t.dem_dong(format('select 1 from can where nguoi_giu = %L', tuan)), 2, 'mục "Chủ nhà quản lý danh sách sale" (US5) đổi sang tất cả căn thì sale thấy mọi căn');
  perform fn_sale_bo_nguon(tuan);
  perform t.eq(t.dem_dong(format('select 1 from can where nguoi_giu = %L', tuan)), 0, 'mục "Chi tiết chủ nhà và bỏ nguồn phòng" (US16)-NT bỏ nguồn phòng thì không còn thấy lịch của chủ đó');
  perform t.login(tuan);
  v_id := fn_chu_them_sale_tay('Sale Minh', '0900000007');
  perform t.login(hoa);
  perform t.eq(t.dem_dong('select 1 from sale_them_tay'), 0, 'sale thêm tay chỉ chủ nhà đó thấy');
  perform t.throws(format('select fn_chu_xoa_sale_tay(%L)', v_id), 'không xóa sale thêm tay của chủ khác', null);

  -- Yêu cầu: sale hủy, hết hạn sau 14 ngày (US15-NT5, NT6), chủ không trả lời yêu cầu đã hết hạn
  perform t.login(lan);
  y := (fn_sale_gui_yeu_cau(jsonb_build_object('can_id', c1509, 'ngay_nhan', '2026-12-20', 'ngay_tra', '2026-12-21'))->>'id')::uuid;
  perform t.login(hung);
  perform t.throws(format('select fn_sale_huy_yeu_cau(%L)', y), 'PQ10.SALE sale khác không hủy được yêu cầu', 'Không tìm thấy');
  perform t.login(lan);
  perform fn_sale_huy_yeu_cau(y);
  perform t.eq((select trang_thai from yeu_cau_dat_phong where id = y), 'da_huy', 'US15-NT5 sale hủy thì yêu cầu thành Đã hủy');
  y := (fn_sale_gui_yeu_cau(jsonb_build_object('can_id', c1509, 'ngay_nhan', '2026-12-22', 'ngay_tra', '2026-12-23'))->>'id')::uuid;
  perform t.logout();
  update yeu_cau_dat_phong set het_han_luc = now() - interval '1 minute' where id = y;
  perform het_han_yeu_cau();
  perform t.login(lan);
  perform t.eq((select trang_thai from yeu_cau_dat_phong where id = y), 'het_han', 'US15-NT6 quá 14 ngày thì Hết hạn');
  perform t.eq(t.dem_dong($q$select 1 from thong_bao where loai = 'yeu_cau_het_han'$q$), 1, 'US15-NT6 sale được báo hết hạn');
  perform t.login(hoa);
  perform t.throws(format('select fn_chu_tra_loi_yeu_cau(%L, true)', y), 'yêu cầu hết hạn không chấp nhận được', 'đã được trả lời');
  perform t.ok(not has_function_privilege('authenticated', 'public.het_han_yeu_cau()', 'execute'), 'việc định kỳ không gọi được qua API');
  perform t.eq((select count(*)::int from cron.job where jobname in ('het-han-yeu-cau', 'don-dep')), 2, 'có lịch chạy định kỳ');

  -- Quản trị (nhóm Quản trị Home247 trên web): người thường bị chặn; chỉ quản trị viên đầu tiên thêm, gỡ người đồng quản trị
  perform t.throws($q$select fn_qt_luu_ngay_le('{"nam":2027,"ten":"Tết Dương lịch","ngay_dau":"2027-01-01","ngay_cuoi":"2027-01-03"}')$q$, 'nhóm Quản trị Home247 trên web người thường gọi hàm quản trị bị từ chối', 'quản trị viên');
  perform t.login(adm);
  v_id := fn_qt_luu_ngay_le('{"nam":2027,"ten":"Tết Dương lịch","ngay_dau":"2027-01-01","ngay_cuoi":"2027-01-03"}');
  perform t.throws($q$select fn_qt_them_admin('dong-quan-tri@test.local')$q$, 'mục "Thêm người đồng quản trị" (US34) người đồng quản trị không thêm được ai', 'đầu tiên');
  perform t.logout();
  update admins set la_goc = true where user_id = adm;
  perform t.login(adm);
  perform fn_qt_them_admin('lan@test.local');
  perform t.ok(exists (select 1 from admins where user_id = lan), 'US34-NT2 thêm email đã có tài khoản thì thành quản trị');
  perform t.throws($q$select fn_qt_go_admin('admin-test@test.local')$q$, 'mục "Thêm người đồng quản trị" (US34) quản trị viên đầu tiên không bị gỡ', 'đầu tiên');
  perform fn_qt_go_admin('lan@test.local');
  perform t.ok(not exists (select 1 from admins where user_id = lan), 'US34-NT6 gỡ thì không còn là quản trị');
  perform t.login(hoa);
  perform t.eq(t.dem_dong('select 1 from ngay_le'), 1, 'mục "Quản trị dải ngày lễ hằng năm" (US23) chủ nhà thấy dải ngày lễ quản trị viên đặt');
  set local role anon; select count(*) into n from ngay_le; reset role;
  perform t.eq(n, 0, 'người chưa đăng nhập không đọc danh sách ngày lễ');
end $$;
rollback;
