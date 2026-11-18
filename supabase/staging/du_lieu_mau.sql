-- Dữ liệu mẫu cho STAGING (docs/luat-chung/Du_lieu_mau.md). KHÔNG chạy trên production.
-- Chạy trong SQL Editor của Supabase bằng vai mặc định (postgres). Cần 5 tài khoản đã tạo sẵn, xem README.md cùng thư mục.
do $$
declare
  v_hoa uuid; v_tuan uuid; v_hung uuid; v_lan uuid; v_nga uuid;
  c1509 uuid; c3402 uuid; c1103 uuid; k_lan uuid;
  thangs date[]; v_ids uuid[]; v_icon public.toa_nha.id%type;
begin
  select id into v_hoa from auth.users where email = 'hoa@home247.test';
  select id into v_tuan from auth.users where email = 'tuan@home247.test';
  select id into v_hung from auth.users where email = 'hung@home247.test';
  select id into v_lan from auth.users where email = 'lan@home247.test';
  select id into v_nga from auth.users where email = 'nga@home247.test';
  if v_hoa is null or v_tuan is null or v_hung is null or v_lan is null or v_nga is null then
    raise exception 'Thiếu tài khoản mẫu. Tạo đủ 5 tài khoản theo supabase/staging/README.md rồi chạy lại.';
  end if;
  v_ids := array[v_hoa, v_tuan, v_hung, v_lan, v_nga];

  -- Xóa dữ liệu cũ của 5 tài khoản mẫu (bảng con xóa theo nhờ on delete cascade)
  create temp table _can_mau on commit drop as select id from public.can where nguoi_giu = any (v_ids);
  delete from public.thong_bao where nguoi_nhan = any (v_ids);
  delete from public.lan_gui_khach where sale_id = any (v_ids) or can_id in (select id from _can_mau);
  delete from public.tim_gan_day where sale_id = any (v_ids);
  delete from public.booking where sale_id = any (v_ids) or can_id in (select id from _can_mau);
  delete from public.yeu_cau_dat_phong where sale_id = any (v_ids) or can_id in (select id from _can_mau);
  delete from public.ket_noi_can where can_id in (select id from _can_mau);
  delete from public.ket_noi where chu_nha_id = any (v_ids) or sale_id = any (v_ids);
  delete from public.link_moi_can where can_id in (select id from _can_mau);
  delete from public.link_moi where chu_nha_id = any (v_ids);
  delete from public.muc_cong where sale_id = any (v_ids) or can_id in (select id from _can_mau);
  delete from public.anh_can where can_id in (select id from _can_mau);
  delete from public.gia_thang where can_id in (select id from _can_mau);
  delete from public.gia_dip where can_id in (select id from _can_mau);
  delete from public.can where id in (select id from _can_mau);

  update public.profiles set ten = 'Chị Hoa', sdt = '0900000011', vai_chon = 'chu_nha', da_xoa_luc = null where id = v_hoa;
  update public.profiles set ten = 'Anh Tuấn', sdt = '0900000012', vai_chon = 'chu_nha', da_xoa_luc = null where id = v_tuan;
  update public.profiles set ten = 'Sale Hùng', sdt = '0900000013', vai_chon = 'sale', da_xoa_luc = null where id = v_hung;
  update public.profiles set ten = 'Sale Lan', sdt = '0900000014', vai_chon = 'sale', da_xoa_luc = null where id = v_lan;
  update public.profiles set ten = 'Sale Nga', sdt = '0900000015', vai_chon = 'sale', da_xoa_luc = null where id = v_nga;

  select array_agg((date_trunc('month', public.local_today()) + (i || ' month')::interval)::date) into thangs from generate_series(0, 5) i;
  select id into v_icon from public.toa_nha where ten = 'ICON40';

  insert into public.can (nguoi_giu, loai, ma_can, so_phong_ngu, so_giuong, loai_view, toa_nha_id)
    values (v_hoa, 'co_lich', '1509', 2, 3, 'bien', v_icon) returning id into c1509;
  insert into public.can (nguoi_giu, loai, ma_can, so_phong_ngu, so_giuong, toa_nha_id)
    values (v_hoa, 'co_lich', '3402', 2, 2, v_icon) returning id into c3402;
  insert into public.can (nguoi_giu, loai, ma_can, so_phong_ngu, so_giuong, loai_view)
    values (v_tuan, 'co_lich', '1103', 3, 2, 'thanh_pho') returning id into c1103;
  insert into public.can (nguoi_giu, loai, ma_can, so_phong_ngu, ten_chu_can, sdt_chu_can, gia_chu_thuong)
    values (v_hung, 'tu_nhap', 'Villa Tuần Châu', 4, 'Chú Bình', '0900000001', 1400000);

  insert into public.gia_thang (can_id, thang, gia_ngay_thuong, gia_cuoi_tuan)
    select c1509, t, 900000, 1300000 from unnest(thangs) t
    union all select c3402, t, 800000, 1100000 from unnest(thangs) t
    union all select c1103, t, 700000, 700000 from unnest(thangs) t;

  insert into public.ket_noi (chu_nha_id, sale_id, nguon, pham_vi) values (v_hoa, v_hung, 'link_moi', 'tat_ca_can');
  insert into public.ket_noi (chu_nha_id, sale_id, nguon, pham_vi) values (v_hoa, v_lan, 'chu_gui_lich', 'chon_can') returning id into k_lan;
  insert into public.ket_noi_can (ket_noi_id, can_id) values (k_lan, c1509);
end $$;
