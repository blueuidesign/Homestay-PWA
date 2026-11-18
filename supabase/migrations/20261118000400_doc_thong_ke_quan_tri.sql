-- =====================================================================================
-- 20261118000400_doc_thong_ke_quan_tri.sql · Lịch và tìm phòng của sale, thống kê, xuất file, quản trị, việc định kỳ
-- Vì sao: sale không đọc bảng booking (QD-007) nên lịch và tìm phòng đi qua hàm chỉ trả căn, đêm, giá;
--         thống kê chia theo đêm (QD-010, QT2.2, QT3.2)
-- Thay đổi: fn_sale_lich, fn_sale_tim, fn_thong_ke_chu, fn_thong_ke_sale, fn_xuat_booking,
--           fn_qt_luu_ngay_le, fn_qt_xoa_ngay_le, fn_qt_luu_toa_nha, fn_qt_them_admin, fn_qt_go_admin; don_dep; lịch pg_cron
-- Tương thích ngược: chỉ thêm
-- Kiểm thử: tests/db/t_09_sale_doc.sql, t_10_thong_ke.sql, t_11_quan_tri.sql
-- =====================================================================================

-- Chia một tổng tiền đều cho n đêm, phần lẻ dồn đêm cuối (QT4.2, QT3.2). p_i chạy từ 1.
create or replace function public.phan_cua_dem(p_tong bigint, p_n int, p_i int) returns bigint
language sql immutable as $$ select case when p_i = p_n then p_tong - (p_tong / p_n) * (p_n - 1) else p_tong / p_n end $$;

-- ---------- Sale: lịch phòng và tìm phòng ----------

-- Lịch phòng nhiều ngày của sale (S1). Ba nhóm: 'cua_toi' (căn có lịch mình giữ), 'nguon' (căn được chia sẻ),
-- 'tu_nhap' (căn tự nhập). Ô của căn có lịch: kin, gia_chu, gia_ban. Ô của căn tự nhập: chỉ có cua_ban = true
-- khi chính sale đã ghi booking đêm đó; app hiện "Bạn", còn lại hiện "?". KHÔNG BAO GIỜ có ô "trống" cho căn tự nhập.
-- Không trả ai đặt, không tiền của booking.
create or replace function public.fn_sale_lich(p_tu date default null, p_so_ngay int default 7) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare v_me uuid := can_dang_nhap(); v_tu date := coalesce(p_tu, local_today()); r jsonb;
begin
  if p_so_ngay < 1 or p_so_ngay > 31 then raise exception 'Số ngày từ 1 đến 31' using errcode = 'P0001'; end if;
  select coalesce(jsonb_agg(x order by x->>'thu_tu', x->>'ma_can'), '[]'::jsonb) into r from (
    select jsonb_build_object(
      'thu_tu', case when c.loai = 'tu_nhap' then 3 when c.nguoi_giu = v_me then 1 else 2 end,
      'nhom', case when c.loai = 'tu_nhap' then 'tu_nhap' when c.nguoi_giu = v_me then 'cua_toi' else 'nguon' end,
      'can_id', c.id, 'ma_can', c.ma_can, 'so_phong_ngu', c.so_phong_ngu, 'so_giuong', c.so_giuong, 'loai_view', c.loai_view,
      'ten_toa_nha', t.ten, 'chu_nha_id', c.nguoi_giu,
      'ten_chu', case when c.loai = 'tu_nhap' then c.ten_chu_can else pr.ten end,
      'lich_cap_nhat_luc', case when c.loai = 'co_lich' then c.lich_cap_nhat_luc end,
      'ngay', (select jsonb_agg(
                 case when c.loai = 'tu_nhap' then
                   jsonb_build_object('dem', d::date,
                     'cua_ban', exists (select 1 from booking b where b.can_id = c.id and b.trang_thai <> 'da_huy' and b.dem @> d::date))
                 else
                   jsonb_build_object('dem', d::date,
                     'kin', exists (select 1 from booking b where b.can_id = c.id and b.trang_thai <> 'da_huy' and b.dem @> d::date),
                     'gia_chu', gia_dem(c.id, d::date), 'gia_ban', gia_ban_dem(c.id, d::date))
                 end order by d)
               from generate_series(v_tu, v_tu + p_so_ngay - 1, interval '1 day') d)) as x
      from can c
      join profiles pr on pr.id = c.nguoi_giu
      left join toa_nha t on t.id = c.toa_nha_id
     where c.an_luc is null
       and (c.nguoi_giu = v_me or c.id in (select my_shared_can_ids()))) q;
  return r;
end $$;

-- Tìm căn trống mọi đêm trong khoảng ngày (S1-02, S2). p: ngay_nhan, ngay_tra (bắt buộc), so_phong_ngu, loai_view,
-- toa_nha_id (lọc, không bắt buộc), ghi_lich_su (mặc định true: ghi vào Tìm gần đây).
-- Căn tự nhập không có lịch nên luôn nằm trong kết quả với khong_co_lich = true (app ghi rõ và gợi ý gọi chủ).
create or replace function public.fn_sale_tim(p jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_me uuid := can_dang_nhap();
  v_nhan date := (p->>'ngay_nhan')::date; v_tra date := (p->>'ngay_tra')::date; r jsonb;
begin
  if v_nhan is null then raise exception 'Chọn ngày nhận để tìm phòng' using errcode = 'P0001'; end if;
  if v_tra is null or v_tra <= v_nhan then raise exception 'Ngày trả phải sau ngày nhận' using errcode = 'P0001'; end if;
  select coalesce(jsonb_agg(x order by x->>'thu_tu', x->>'ma_can'), '[]'::jsonb) into r from (
    select jsonb_build_object(
      'thu_tu', case when c.loai = 'tu_nhap' then 3 when c.nguoi_giu = v_me then 1 else 2 end,
      'nhom', case when c.loai = 'tu_nhap' then 'tu_nhap' when c.nguoi_giu = v_me then 'cua_toi' else 'nguon' end,
      'khong_co_lich', c.loai = 'tu_nhap',
      'can_id', c.id, 'ma_can', c.ma_can, 'so_phong_ngu', c.so_phong_ngu, 'so_giuong', c.so_giuong, 'loai_view', c.loai_view,
      'ten_toa_nha', t.ten, 'chu_nha_id', c.nguoi_giu,
      'ten_chu', case when c.loai = 'tu_nhap' then c.ten_chu_can else pr.ten end,
      'lich_cap_nhat_luc', case when c.loai = 'co_lich' then c.lich_cap_nhat_luc end,
      'tong_gia_chu', (select case when bool_and(gia_dem(c.id, d::date) is not null) then sum(gia_dem(c.id, d::date)) end
                         from generate_series(v_nhan, v_tra - 1, interval '1 day') d),
      'tong_gia_ban', (select case when bool_and(gia_dem(c.id, d::date) is not null) then sum(gia_ban_dem(c.id, d::date)) end
                         from generate_series(v_nhan, v_tra - 1, interval '1 day') d)) as x
      from can c
      join profiles pr on pr.id = c.nguoi_giu
      left join toa_nha t on t.id = c.toa_nha_id
     where c.an_luc is null
       and (c.nguoi_giu = v_me or c.id in (select my_shared_can_ids()))
       and (c.loai = 'tu_nhap' or not exists (select 1 from booking b where b.can_id = c.id and b.trang_thai <> 'da_huy' and b.dem && daterange(v_nhan, v_tra)))
       and ((p->>'so_phong_ngu') is null or c.so_phong_ngu = (p->>'so_phong_ngu')::smallint)
       and ((p->>'loai_view') is null or c.loai_view = p->>'loai_view')
       and ((p->>'toa_nha_id') is null or c.toa_nha_id = (p->>'toa_nha_id')::uuid)) q;
  if coalesce((p->>'ghi_lich_su')::boolean, true) then
    perform fn_ghi_tim(p - 'ghi_lich_su');
  end if;
  return r;
end $$;

-- ---------- Thống kê ----------

-- Thống kê một tháng của chủ nhà (CN8, CN1). p_thang: ngày bất kỳ trong tháng. Chỉ căn có lịch mình giữ, kể cả căn đã xóa
-- (doanh thu cũ không đổi, YC3.9). Booking đã hủy không tính. Doanh thu và đêm có khách chia theo đêm (QT2.2, QT4.2).
-- Không có giá bán hay tiền chênh của sale (PQ11, PQ15).
create or replace function public.fn_thong_ke_chu(p_thang date default null) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  v_me uuid := can_dang_nhap();
  v_dau date := date_trunc('month', coalesce(p_thang, local_today()))::date;
  v_cuoi date := (v_dau + interval '1 month')::date;
  v_dt bigint; v_dt_truoc bigint; v_dem int; v_so_can int; v_so_ngay int := v_cuoi - v_dau;
begin
  select coalesce(sum(bd.tien), 0), count(*) into v_dt, v_dem
    from booking b join booking_dem bd on bd.booking_id = b.id join can c on c.id = b.can_id
   where c.nguoi_giu = v_me and c.loai = 'co_lich' and b.trang_thai <> 'da_huy' and bd.dem >= v_dau and bd.dem < v_cuoi;
  select coalesce(sum(bd.tien), 0) into v_dt_truoc
    from booking b join booking_dem bd on bd.booking_id = b.id join can c on c.id = b.can_id
   where c.nguoi_giu = v_me and c.loai = 'co_lich' and b.trang_thai <> 'da_huy'
     and bd.dem >= (v_dau - interval '1 month')::date and bd.dem < v_dau;
  select count(*) into v_so_can from can where nguoi_giu = v_me and loai = 'co_lich' and an_luc is null;
  return jsonb_build_object(
    'thang', v_dau, 'doanh_thu', v_dt, 'doanh_thu_thang_truoc', v_dt_truoc,
    'so_voi_thang_truoc', case when v_dt_truoc > 0 then round((v_dt - v_dt_truoc) * 100.0 / v_dt_truoc, 1) end,
    'dem_co_khach', v_dem, 'so_can', v_so_can, 'so_dem_cua_thang', v_so_ngay,
    'cong_suat', case when v_so_can > 0 then round(v_dem * 100.0 / (v_so_can * v_so_ngay), 1) end,
    'theo_can', coalesce((
      select jsonb_agg(jsonb_build_object('can_id', c.id, 'ma_can', c.ma_can, 'doanh_thu', x.dt, 'dem_co_khach', x.n) order by x.dt desc)
        from (select b.can_id, sum(bd.tien) dt, count(*) n from booking b join booking_dem bd on bd.booking_id = b.id
               where b.chu_nha_id = v_me and b.nguon <> 'sale_tu_ghi' and b.trang_thai <> 'da_huy' and bd.dem >= v_dau and bd.dem < v_cuoi
               group by b.can_id) x join can c on c.id = x.can_id), '[]'::jsonb),
    'theo_nguoi_ban', coalesce((
      select jsonb_agg(jsonb_build_object('sale_id', x.sale_id, 'ten', coalesce(pr.ten, 'Khách lẻ'), 'da_xoa_tai_khoan', pr.da_xoa_luc is not null,
                                          'doanh_thu', x.dt) order by (x.sale_id is null), x.dt desc)
        from (select b.sale_id, sum(bd.tien) dt from booking b join booking_dem bd on bd.booking_id = b.id
               where b.chu_nha_id = v_me and b.nguon <> 'sale_tu_ghi' and b.trang_thai <> 'da_huy' and bd.dem >= v_dau and bd.dem < v_cuoi
               group by b.sale_id) x left join profiles pr on pr.id = x.sale_id), '[]'::jsonb),
    'chua_thu', coalesce((
      select jsonb_agg(jsonb_build_object('booking_id', b.id, 'can_id', b.can_id, 'ma_can', c.ma_can, 'ngay_nhan', lower(b.dem), 'ngay_tra', upper(b.dem),
                                          'tien_phong', b.tien_phong, 'con_ngay', lower(b.dem) - local_today()) order by lower(b.dem))
        from booking b join can c on c.id = b.can_id
       where b.chu_nha_id = v_me and b.nguon <> 'sale_tu_ghi' and b.trang_thai <> 'da_huy' and b.trang_thai_tien = 'chua_coc'
         and upper(b.dem) > local_today()), '[]'::jsonb),
    'sau_thang', (
      select jsonb_agg(jsonb_build_object('thang', m::date, 'doanh_thu', coalesce((
               select sum(bd.tien) from booking b join booking_dem bd on bd.booking_id = b.id
                where b.chu_nha_id = v_me and b.nguon <> 'sale_tu_ghi' and b.trang_thai <> 'da_huy'
                  and bd.dem >= m::date and bd.dem < (m + interval '1 month')::date), 0)) order by m)
        from generate_series(v_dau - interval '5 months', v_dau, interval '1 month') m));
end $$;

-- Thống kê một tháng của sale (S7): booking của mình từ yêu cầu đã chốt, chủ ghi cho mình, và mình ghi cho căn tự nhập (QT3.1).
-- Doanh số (tiền thu khách) và tiền chênh chia đều theo đêm, lẻ dồn đêm cuối, đêm thuộc tháng của nó (QT3.2).
-- Booking chưa có tiền thu khách thì không vào doanh số và tiền chênh. Không có doanh thu của chủ nhà.
create or replace function public.fn_thong_ke_sale(p_thang date default null) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  v_me uuid := can_dang_nhap();
  v_dau date := date_trunc('month', coalesce(p_thang, local_today()))::date;
  v_cuoi date := (v_dau + interval '1 month')::date;
  r jsonb;
begin
  with dem as (
    select b.id, b.chu_nha_id, b.nguon, c.ten_chu_can, (upper(b.dem) - lower(b.dem)) as n,
           row_number() over (partition by b.id order by d) as i, d::date as dem, br.tien_thu_khach, b.tien_phong
      from booking b
      join can c on c.id = b.can_id
      left join booking_rieng br on br.booking_id = b.id and br.nguoi = v_me
      cross join lateral generate_series(lower(b.dem), upper(b.dem) - 1, interval '1 day') d
     where b.sale_id = v_me and b.trang_thai <> 'da_huy'),
  trong as (
    select *, phan_cua_dem(tien_thu_khach, n::int, i::int) as thu, phan_cua_dem(tien_thu_khach - tien_phong, n::int, i::int) as chenh
      from dem where dem >= v_dau and dem < v_cuoi)
  select jsonb_build_object(
    'thang', v_dau,
    'so_dat_phong', (select count(distinct id) from trong),
    'so_dem', (select count(*) from trong),
    'doanh_so', coalesce((select sum(thu) from trong), 0),
    'tien_chenh', coalesce((select sum(chenh) from trong), 0),
    'theo_chu', coalesce((
      select jsonb_agg(jsonb_build_object('chu_nha_id', case when x.nguon = 'sale_tu_ghi' then null else x.chu_nha_id end,
               'ten', case when x.nguon = 'sale_tu_ghi' then x.ten_chu_can else pr.ten end,
               'da_xoa_tai_khoan', x.nguon <> 'sale_tu_ghi' and pr.da_xoa_luc is not null,
               'so_dat_phong', x.sdp, 'doanh_so', x.thu, 'tien_chenh', x.chenh) order by x.thu desc nulls last)
        from (select chu_nha_id, nguon = 'sale_tu_ghi' as tn, min(nguon) nguon, min(ten_chu_can) ten_chu_can,
                     count(distinct id) sdp, sum(thu) thu, sum(chenh) chenh
                from trong group by chu_nha_id, nguon = 'sale_tu_ghi', case when nguon = 'sale_tu_ghi' then ten_chu_can end) x
        left join profiles pr on pr.id = x.chu_nha_id), '[]'::jsonb))
    into r;
  return r;
end $$;

-- Dữ liệu cho file CSV của chủ nhà (P8): mỗi booking một dòng, có tên và số khách CHỦ NHÀ đã nhập (QD-011).
-- Tiền là số nguyên đồng. Không có giá bán, tiền chênh, khách của sale.
create or replace function public.fn_xuat_booking(p_tu date, p_den date, p_can uuid default null)
returns table (ma_can text, ngay_nhan date, ngay_tra date, so_dem int, nguoi_dat text, ten_khach text, sdt_khach text, so_khach smallint,
               tien_phong int, trang_thai_tien text, tien_coc int, trang_thai text, ghi_chu text)
language plpgsql stable security definer set search_path = public as $$
declare v_me uuid := can_dang_nhap();
begin
  return query
  select c.ma_can, lower(b.dem), upper(b.dem), (upper(b.dem) - lower(b.dem))::int, coalesce(pr.ten, 'Khách lẻ'),
         br.ten_khach, br.sdt_khach, br.so_khach, b.tien_phong, b.trang_thai_tien, b.tien_coc, b.trang_thai, b.ghi_chu
    from booking b
    join can c on c.id = b.can_id
    left join profiles pr on pr.id = b.sale_id
    left join booking_rieng br on br.booking_id = b.id and br.nguoi = v_me
   where b.chu_nha_id = v_me and b.nguon <> 'sale_tu_ghi' and b.dem && daterange(p_tu, p_den + 1)
     and (p_can is null or b.can_id = p_can)
   order by lower(b.dem), c.ma_can;
end $$;

-- ---------- Quản trị (YC10) ----------

create or replace function public.can_la_admin() returns uuid
language plpgsql stable security definer set search_path = public as $$
declare v uuid := can_dang_nhap();
begin
  if not exists (select 1 from admins where user_id = v) then raise exception 'Chỉ quản trị viên làm được việc này' using errcode = '42501'; end if;
  return v;
end $$;

-- Thêm hay sửa một dải ngày lễ của một năm (YC10.1). p: id (khi sửa), nam, ten, ngay_dau, ngay_cuoi.
create or replace function public.fn_qt_luu_ngay_le(p jsonb) returns uuid
language plpgsql security definer set search_path = public as $$
declare v_me uuid := can_la_admin(); v_id uuid := nullif(p->>'id', '')::uuid;
begin
  if (p->>'ngay_cuoi')::date < (p->>'ngay_dau')::date then raise exception 'Ngày cuối phải từ ngày đầu trở đi' using errcode = 'P0001'; end if;
  if v_id is null then
    insert into ngay_le (nam, ten, ngay_dau, ngay_cuoi) values ((p->>'nam')::smallint, btrim(p->>'ten'), (p->>'ngay_dau')::date, (p->>'ngay_cuoi')::date)
    returning id into v_id;
  else
    update ngay_le set nam = (p->>'nam')::smallint, ten = btrim(p->>'ten'), ngay_dau = (p->>'ngay_dau')::date, ngay_cuoi = (p->>'ngay_cuoi')::date where id = v_id;
    if not found then raise exception 'Không tìm thấy dải ngày lễ' using errcode = 'P0001'; end if;
  end if;
  insert into audit_log (actor_id, table_name, row_id, action, new_row) values (v_me, 'ngay_le', v_id, 'luu', p);
  return v_id;
exception when unique_violation then
  raise exception 'Năm này đã có dịp cùng tên' using errcode = 'P0001';
end $$;

create or replace function public.fn_qt_xoa_ngay_le(p_id uuid) returns void
language plpgsql security definer set search_path = public as $$
declare v_me uuid := can_la_admin();
begin
  delete from ngay_le where id = p_id;
  if not found then raise exception 'Không tìm thấy dải ngày lễ' using errcode = 'P0001'; end if;
  insert into audit_log (actor_id, table_name, row_id, action) values (v_me, 'ngay_le', p_id, 'xoa');
end $$;

-- Thêm hay sửa một tòa nhà trong danh sách chung (YC10.2). p: id (khi sửa), ten, khu_vuc.
create or replace function public.fn_qt_luu_toa_nha(p jsonb) returns uuid
language plpgsql security definer set search_path = public as $$
declare v_me uuid := can_la_admin(); v_id uuid := nullif(p->>'id', '')::uuid;
begin
  if v_id is null then
    insert into toa_nha (ten, khu_vuc) values (btrim(p->>'ten'), nullif(p->>'khu_vuc', '')) returning id into v_id;
  else
    update toa_nha set ten = btrim(p->>'ten'), khu_vuc = nullif(p->>'khu_vuc', '') where id = v_id;
    if not found then raise exception 'Không tìm thấy tòa nhà' using errcode = 'P0001'; end if;
  end if;
  insert into audit_log (actor_id, table_name, row_id, action, new_row) values (v_me, 'toa_nha', v_id, 'luu', p);
  return v_id;
exception when unique_violation then
  raise exception 'Đã có tòa nhà tên này' using errcode = 'P0001';
end $$;

-- Thêm người đồng quản trị bằng email (YC10.3): chỉ quản trị viên đầu tiên. Người đó đã có tài khoản thì thành quản trị ngay,
-- chưa có thì thành quản trị ở lần đăng nhập đầu.
create or replace function public.fn_qt_them_admin(p_email text) returns void
language plpgsql security definer set search_path = public as $$
declare v_me uuid := can_la_admin();
begin
  if not exists (select 1 from admins where user_id = v_me and la_goc) then
    raise exception 'Chỉ quản trị viên đầu tiên thêm được người đồng quản trị' using errcode = '42501';
  end if;
  if coalesce(btrim(p_email), '') !~ '^[^@\s]+@[^@\s]+$' then raise exception 'Email không đúng' using errcode = 'P0001'; end if;
  insert into bootstrap_admins (email) values (lower(btrim(p_email))) on conflict do nothing;
  insert into admins (user_id) select id from auth.users where lower(email) = lower(btrim(p_email)) on conflict do nothing;
  insert into audit_log (actor_id, table_name, action, new_row) values (v_me, 'admins', 'them', jsonb_build_object('email', lower(btrim(p_email))));
end $$;

-- Gỡ một người đồng quản trị: chỉ quản trị viên đầu tiên; quản trị viên đầu tiên không bị gỡ.
create or replace function public.fn_qt_go_admin(p_email text) returns void
language plpgsql security definer set search_path = public as $$
declare v_me uuid := can_la_admin();
begin
  if not exists (select 1 from admins where user_id = v_me and la_goc) then
    raise exception 'Chỉ quản trị viên đầu tiên gỡ được người đồng quản trị' using errcode = '42501';
  end if;
  if exists (select 1 from bootstrap_admins where email = lower(btrim(p_email)) and la_goc)
     or exists (select 1 from admins a join auth.users u on u.id = a.user_id where lower(u.email) = lower(btrim(p_email)) and a.la_goc) then
    raise exception 'Không gỡ được quản trị viên đầu tiên' using errcode = 'P0001';
  end if;
  delete from bootstrap_admins where email = lower(btrim(p_email));
  delete from admins where user_id in (select id from auth.users where lower(email) = lower(btrim(p_email)));
  insert into audit_log (actor_id, table_name, action, new_row) values (v_me, 'admins', 'go', jsonb_build_object('email', lower(btrim(p_email))));
end $$;

-- ---------- Việc định kỳ ----------

-- Dọn: ảnh tạm chưa gắn căn quá 24 giờ, khóa chống gọi lặp của fn_mo_app quá 24 giờ.
-- File trong Storage của ảnh đã bỏ: xóa bằng API Storage ở một Edge Function sau (ghi ở story ảnh); ở đây chỉ dọn dòng.
create or replace function public.don_dep() returns void
language plpgsql security definer set search_path = public as $$
begin
  delete from anh_can where can_id is null and created_at < now() - interval '24 hours';
  delete from audit_log where table_name = 'mo_app' and at < now() - interval '24 hours';
end $$;

revoke execute on function public.phan_cua_dem(bigint, int, int), public.can_la_admin(), public.don_dep() from public, anon, authenticated;
revoke execute on function public.fn_sale_lich(date, int), public.fn_sale_tim(jsonb), public.fn_thong_ke_chu(date), public.fn_thong_ke_sale(date),
  public.fn_xuat_booking(date, date, uuid), public.fn_qt_luu_ngay_le(jsonb), public.fn_qt_xoa_ngay_le(uuid), public.fn_qt_luu_toa_nha(jsonb),
  public.fn_qt_them_admin(text), public.fn_qt_go_admin(text)
  from public, anon;

-- pg_cron: bật extension pg_cron trong Supabase (Database → Extensions) trước khi chạy migration này trên project thật.
create extension if not exists pg_cron;
select cron.schedule('het-han-yeu-cau', '*/10 * * * *', $$select public.het_han_yeu_cau()$$);
select cron.schedule('don-dep', '17 * * * *', $$select public.don_dep()$$);
