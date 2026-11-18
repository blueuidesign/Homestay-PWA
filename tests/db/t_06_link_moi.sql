-- Link mời (QD-008): ai có link cũng xem được màn Thêm lịch, không có giá; hết hạn 21 ngày; thu hồi được; thêm hai lần thì báo.
begin;
do $$
declare f jsonb := t.fixture(); hoa uuid := (f->>'hoa')::uuid; nga uuid := (f->>'nga')::uuid; v_ma text; v_ma2 text; v jsonb;
begin
  perform t.login(hoa);
  v_ma := fn_tao_link_moi();
  perform t.eq((select (het_han_luc - created_at) from link_moi where ma = v_ma), interval '21 days', 'link mời hết hạn sau 21 ngày');

  -- Người chưa đăng nhập xem được, không có giá
  perform t.logout();
  set local role anon;
  v := fn_xem_link_moi(v_ma);
  reset role;
  perform t.eq(v->>'chu_nha', 'Chị Hoa', 'màn Thêm lịch hiện tên chủ nhà');
  perform t.eq(jsonb_array_length(v->'can'), 2, 'màn Thêm lịch hiện các căn');
  perform t.ok(v::text not ilike '%gia%', 'màn Thêm lịch không có giá');

  -- Sale Nga bấm Thêm lịch, thấy căn; bấm lần hai thì báo
  perform t.login(nga);
  perform fn_them_lich_tu_link(v_ma);
  perform t.eq(t.dem_dong('select 1 from can'), 2, 'thêm lịch xong thấy các căn của chủ nhà');
  perform t.throws(format('select fn_them_lich_tu_link(%L)', v_ma), 'thêm lần hai thì báo', 'đã thêm lịch');

  -- Thu hồi, hết hạn
  perform t.login(hoa);
  v_ma2 := fn_tao_link_moi();
  perform fn_thu_hoi_link_moi(v_ma2);
  perform t.throws(format('select fn_xem_link_moi(%L)', v_ma2), 'link đã thu hồi không dùng được', 'không còn dùng được');
  update link_moi set het_han_luc = now() - interval '1 minute' where ma = v_ma;
  perform t.throws(format('select fn_xem_link_moi(%L)', v_ma), 'link hết hạn không dùng được', 'hết hạn');
  perform t.throws(format('select fn_them_lich_tu_link(%L)', v_ma), 'chủ không tự thêm lịch của mình', null);
  perform t.eq(t.dem_dong(format('select 1 from ket_noi where sale_id = %L', nga)), 1, 'sale đã thêm trước khi link hết hạn vẫn giữ kết nối');
end $$;
rollback;
