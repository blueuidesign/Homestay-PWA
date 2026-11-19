-- US46 · Chi tiết căn của chủ nhà và giá bán (YC7.4, HV5). Lệnh chi tiết fn_sale_chi_tiet_can, lệnh ghi mức cộng riêng
-- fn_dat_muc_cong, fn_bo_muc_cong. Chỉ thêm, không sửa migration cũ. Sale không đọc bảng booking (KT-DB.3.5): lịch lấy từ o_lich.
-- Ảnh: lệnh trả đường dẫn trong kho; app xin đường dẫn có hạn 1 giờ (createSignedUrl), kho chỉ cấp khi đọc được dòng anh_can.

-- HV5 bước 1, YC7.4-NT6: lý do sale không còn xem được căn của chủ nhà. Chỉ cho người đã có kết nối với chủ căn; còn lại null.
-- Hàm nội bộ, app không gọi.
create or replace function public.ly_do_mat_quyen_can(p_sale uuid, p_can_id uuid) returns text
language sql stable security definer set search_path = ''
as $$
  select case
           when chu.da_xoa_luc is not null then 'Chủ nhà đã xóa tài khoản'
           when k.trang_thai = 'chu_ngung' then 'Chủ nhà đã ngừng chia sẻ lịch'
         end
  from public.can c
  join public.profiles chu on chu.id = c.nguoi_giu
  join public.ket_noi k on k.chu_id = c.nguoi_giu and k.sale_id = p_sale
  where c.id = p_can_id and c.loai = 'co_lich' and c.nguoi_giu <> p_sale
$$;

revoke execute on function public.ly_do_mat_quyen_can(uuid, uuid) from public, anon, authenticated;

-- YC7.4 bước 1 đến 6, YC7.4-NT1, NT2, NT4, NT6, NT7, HV5-NT1, NT2, YC7 "Dữ liệu", QT2.1, QT5.4, GD13, PQ2.SALE, PQ3.SALE,
-- PQ4.SALE, PQ5.SALE, PQ11.SALE, PQ13, PQ14.SALE, PQ23.SALE, QD7, KT-DB.3.3, KT-DB.3.4, KT-DB.3.5, KT-DB.3.6.
-- Chi tiết một căn trong my_shared_can_ids() cho khoảng p_tu tới trước p_den: căn, ảnh, chủ nhà, giá chủ và giá bán từng đêm,
-- mức cộng, lịch 14 ngày từ thứ Hai của tuần có p_tu, giờ nhận trả. Không được xem thì chỉ trả lý do (HV5).
create or replace function public.fn_sale_chi_tiet_can(p_can_id uuid, p_tu date, p_den date) returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_nguoi uuid := public.can_dang_nhap();
  v_can public.can%rowtype;
  v_chu public.profiles%rowtype;
  v_toa public.toa_nha%rowtype;
  v_rieng bigint;
  v_mac_dinh bigint;
  v_tron boolean;
  v_dem jsonb;
  v_tong_chu bigint;
  v_tong_ban bigint;
  v_lich jsonb;
  v_dau date;
begin
  if p_tu is null or p_den is null then
    raise exception 'Chưa chọn ngày' using errcode = 'P0001';
  end if;
  if p_den <= p_tu or p_den - p_tu > 31 then
    raise exception 'Khoảng ngày không hợp lệ' using errcode = 'P0001';
  end if;
  if p_can_id is null or p_can_id not in (select public.my_shared_can_ids()) then
    return jsonb_build_object('khong_con_quyen', true, 'ly_do', public.ly_do_mat_quyen_can(v_nguoi, p_can_id));
  end if;

  select * into v_can from public.can where id = p_can_id;
  select * into v_chu from public.profiles where id = v_can.nguoi_giu;
  select * into v_toa from public.toa_nha where id = v_can.toa_nha_id;
  select m.muc into v_rieng from public.muc_cong m where m.sale_id = v_nguoi and m.can_id = p_can_id;
  select coalesce(cd.muc_cong_mac_dinh, 0), coalesce(cd.lam_tron_50k, false) into v_mac_dinh, v_tron
  from (select 1) x left join public.cai_dat_rieng cd on cd.nguoi_id = v_nguoi;

  -- QT2.1, QT5.4: mỗi đêm từ p_tu tới trước p_den; tổng chỉ có khi mọi đêm có giá.
  select jsonb_agg(jsonb_build_object('ngay', d.dem, 'gia_chu', d.chu, 'gia_ban', d.ban) order by d.dem),
         case when count(d.chu) = p_den - p_tu then sum(d.chu)::bigint end,
         case when count(d.ban) = p_den - p_tu then sum(d.ban)::bigint end
    into v_dem, v_tong_chu, v_tong_ban
  from (select g::date as dem, public.gia_chu_dem(p_can_id, g::date) as chu, public.gia_ban_dem(v_nguoi, p_can_id, g::date) as ban
        from generate_series(p_tu, p_den - 1, interval '1 day') g) d;

  -- YC7.4 bước 5: 14 ngày từ thứ Hai của tuần có p_tu; ô chỉ 'kin' hay 'trong' (o_lich, không người đặt).
  v_dau := p_tu - (extract(isodow from p_tu)::integer - 1);
  select jsonb_agg(jsonb_build_object('ngay', g::date, 'o', public.o_lich(p_can_id, g::date)) order by g)
    into v_lich
  from generate_series(v_dau, v_dau + 13, interval '1 day') g;

  return jsonb_build_object(
    'khong_con_quyen', false,
    'can_id', v_can.id, 'ma_can', v_can.ma_can, 'ten_toa', v_toa.ten, 'khu_vuc', v_toa.khu_vuc,
    'so_phong_ngu', v_can.so_phong_ngu, 'so_giuong', v_can.so_giuong, 'loai_view', v_can.loai_view,
    'lich_doi_luc', v_can.lich_doi_luc,
    'anh', coalesce((select jsonb_agg(a.duong_dan order by a.thu_tu nulls last, a.tao_luc, a.id)
                     from public.anh_can a where a.can_id = p_can_id), '[]'::jsonb),
    'chu', jsonb_build_object(
      'ten', coalesce(v_chu.ten_hien_thi, v_chu.ten),
      'so_dien_thoai', nullif(btrim(coalesce(v_chu.so_dien_thoai, '')), ''),
      'so_can', (select count(*) from public.can c
                 where c.nguoi_giu = v_can.nguoi_giu and c.id in (select public.my_shared_can_ids()))),
    'gio_nhan', to_char(coalesce(v_chu.gio_nhan, '14:00'::time), 'HH24:MI'),
    'gio_tra', to_char(coalesce(v_chu.gio_tra, '12:00'::time), 'HH24:MI'),
    'tu', p_tu, 'den', p_den,
    'dem', coalesce(v_dem, '[]'::jsonb), 'tong_gia_chu', v_tong_chu, 'tong_gia_ban', v_tong_ban,
    'muc_cong', coalesce(v_rieng, v_mac_dinh), 'muc_cong_rieng', v_rieng, 'muc_cong_mac_dinh', v_mac_dinh,
    'lam_tron_50k', v_tron,
    'lich', coalesce(v_lich, '[]'::jsonb));
end $$;

-- YC7.4 bước 4, YC7.4-NT1, NT5, PQ11.SALE, KT-DB.3.3, KT-DB.3.6: ghi mức cộng riêng của người gọi cho một căn được xem
-- (0 là "Không cộng"). Mức cộng là số nguyên đồng không âm (QT5.2); trần 5.000.000đ mỗi đêm, cùng bộ chip với P10 (YC7-H10).
create or replace function public.fn_dat_muc_cong(p_can_id uuid, p_muc bigint) returns void
language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_nguoi uuid := public.can_dang_nhap();
begin
  if p_can_id is null or p_can_id not in (select public.my_shared_can_ids()) then
    raise exception 'Bạn không còn xem được mục này' using errcode = '42501';
  end if;
  if p_muc is null or p_muc < 0 or p_muc > 5000000 then
    raise exception 'Mức cộng từ 0 đến 5.000.000đ' using errcode = '22023';
  end if;
  insert into public.muc_cong (sale_id, can_id, muc, sua_luc) values (v_nguoi, p_can_id, p_muc, now())
  on conflict (sale_id, can_id) do update set muc = excluded.muc, sua_luc = excluded.sua_luc;
end $$;

-- YC7.4 bước 4, YC7-H7, YC7.4-NT7, NT5, PQ11.SALE, KT-DB.3.3: chip "Mặc định" xóa mức cộng riêng của người gọi cho căn.
create or replace function public.fn_bo_muc_cong(p_can_id uuid) returns void
language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_nguoi uuid := public.can_dang_nhap();
begin
  if p_can_id is null or p_can_id not in (select public.my_shared_can_ids()) then
    raise exception 'Bạn không còn xem được mục này' using errcode = '42501';
  end if;
  delete from public.muc_cong where sale_id = v_nguoi and can_id = p_can_id;
end $$;

revoke execute on function public.fn_sale_chi_tiet_can(uuid, date, date), public.fn_dat_muc_cong(uuid, bigint),
  public.fn_bo_muc_cong(uuid) from public, anon, authenticated;
grant execute on function public.fn_sale_chi_tiet_can(uuid, date, date), public.fn_dat_muc_cong(uuid, bigint),
  public.fn_bo_muc_cong(uuid) to authenticated;
