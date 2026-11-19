-- US44 · Tìm phòng trống theo ngày (YC7.2). Lệnh tìm phòng fn_sale_tim, lần tìm gần đây ở tim_gan_day.
-- Chỉ thêm, không sửa migration cũ. Sale không đọc bảng booking (KT-DB.3.5): lệnh chạy security definer, chỉ trả căn trống.

-- YC3.4, YC7.2-NT7: mã loại view. Căn cũ có thể lưu chữ ("biển"), đổi về mã để lọc. Hàm nội bộ, app không gọi.
create or replace function public.ma_view(p text) returns text
language sql immutable security definer set search_path = ''
as $$
  select case lower(btrim(p))
    when 'biển' then 'bien' when 'bien' then 'bien'
    when 'thành phố' then 'thanh_pho' when 'thanh_pho' then 'thanh_pho'
    when 'núi' then 'nui' when 'nui' then 'nui'
    else lower(btrim(p)) end
$$;

-- YC7.2 bước 5, YC7 "Dữ liệu", QT2.1, QT5.4, QT6.4, PQ3.SALE, PQ4.SALE, PQ5.SALE, PQ11, PQ13, PQ14.SALE, PQ23.SALE, KT-DB.3.3,
-- KT-DB.3.5, KT-DB.3.7. Căn người gọi được xem khớp bộ lọc: căn có lịch trống mọi đêm từ p_tu tới trước p_den (nhom
-- 'cua_toi', 'nguon'), và căn tự nhập của người gọi không có đặt phòng sale tự ghi trong khoảng (nhom 'tu_nhap', không giá).
-- Lọc null là không lọc; số phòng ngủ 4 là 4 trở lên. Hàm nội bộ, app không gọi.
create or replace function public.can_tim(p_nguoi uuid, p_tu date, p_den date, p_pn smallint[], p_toa uuid[], p_view text[])
returns table (
  can_id uuid, nhom text, ma_can text, toa_nha_id uuid, ten_toa text, ten_chu text, so_phong_ngu smallint, loai_view text,
  lich_doi_luc timestamptz, tong_gia_chu bigint, tong_gia_ban bigint
)
language sql stable security definer set search_path = ''
as $$
  with ds as (
    select c.*,
           case when c.nguoi_giu = p_nguoi and c.loai = 'co_lich' then 'cua_toi'
                when c.nguoi_giu = p_nguoi then 'tu_nhap'
                else 'nguon' end as nhom
    from public.can c
    where c.an_luc is null
      and (c.nguoi_giu = p_nguoi or c.id in (select public.my_shared_can_ids()))
      and (p_pn is null or c.so_phong_ngu = any (p_pn) or (4 = any (p_pn) and c.so_phong_ngu >= 4))
      and (p_toa is null or c.toa_nha_id = any (p_toa))
      and (p_view is null or public.ma_view(c.loai_view) = any (p_view))
      and not exists (select 1 from public.booking b
                      where b.can_id = c.id and b.trang_thai <> 'da_huy' and b.dem && daterange(p_tu, p_den))
  ),
  gia as (
    select ds.id,
           case when count(public.gia_chu_dem(ds.id, d)) = p_den - p_tu then sum(public.gia_chu_dem(ds.id, d)) end as chu,
           case when count(public.gia_ban_dem(p_nguoi, ds.id, d)) = p_den - p_tu
                then sum(public.gia_ban_dem(p_nguoi, ds.id, d)) end as ban
    from ds
    cross join lateral (select g::date as d from generate_series(p_tu, p_den - 1, interval '1 day') g) n
    where ds.nhom <> 'tu_nhap'
    group by ds.id
  )
  select ds.id, ds.nhom, ds.ma_can, ds.toa_nha_id, tn.ten,
         case ds.nhom when 'nguon' then chu.ten_hien_thi when 'tu_nhap' then ds.chu_can_ten end,
         ds.so_phong_ngu, ds.loai_view,
         case when ds.nhom = 'nguon' then ds.lich_doi_luc end,
         gia.chu::bigint,
         case ds.nhom when 'cua_toi' then gia.chu::bigint when 'nguon' then gia.ban::bigint end
  from ds
  join public.profiles chu on chu.id = ds.nguoi_giu
  left join public.toa_nha tn on tn.id = ds.toa_nha_id
  left join gia on gia.id = ds.id
$$;

-- YC7.2 bước 6, YC7.2-NT3, NT6: số căn trống (không đếm căn tự nhập) và tên tòa của chúng, nếu tìm theo điều kiện này.
-- Hàm nội bộ, app không gọi.
create or replace function public.dem_can_trong(p_nguoi uuid, p_tu date, p_den date, p_pn smallint[], p_toa uuid[], p_view text[],
                                                out so integer, out ten_toa jsonb)
language sql stable security definer set search_path = ''
as $$
  select count(*)::integer,
         coalesce(jsonb_agg(distinct k.ten_toa) filter (where k.ten_toa is not null), '[]'::jsonb)
  from public.can_tim(p_nguoi, p_tu, p_den, p_pn, p_toa, p_view) k
  where k.nhom <> 'tu_nhap'
$$;

revoke execute on function public.ma_view(text),
  public.can_tim(uuid, date, date, smallint[], uuid[], text[]),
  public.dem_can_trong(uuid, date, date, smallint[], uuid[], text[])
from public, anon, authenticated;

-- YC7.2 bước 5, 6, YC7.2-NT3, NT5, NT6, NT8, YC7-H1, YC7-H5, GD17, YC7 "Dữ liệu", "Quy tắc của nhóm" (Nhóm tự nhập riêng),
-- QT2.1, QT5.4, QT6.4, PQ3.SALE, PQ4.SALE, PQ11, PQ13, PQ14.SALE, PQ23.SALE, KT-DB.3.3, KT-DB.3.5, KT-DB.3.7.
-- Tìm căn trống, ghi lần tìm của người gọi (5 lần mới nhất, trùng điều kiện thì đưa lên đầu), không có căn trống thì trả gợi ý
-- kèm số căn trống. Trả {"so_can_trong", "can", "goi_y"}. Không trả tên người đặt, khách, tiền phòng.
create or replace function public.fn_sale_tim(
  p_tu date, p_den date, p_so_phong_ngu smallint[] default null, p_toa_nha uuid[] default null, p_view text[] default null
) returns jsonb
language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_nguoi uuid := public.can_dang_nhap();
  v_nay date := public.local_today();
  v_pn smallint[];
  v_toa uuid[];
  v_view text[];
  v_bo_loc jsonb;
  v_can jsonb;
  v_so integer;
  v_goi_y jsonb := '[]'::jsonb;
  v_k smallint;
  r record;
  d record;
begin
  if p_tu is null or p_den is null then
    raise exception 'Chưa chọn ngày nhận' using errcode = 'P0001';
  end if;
  if p_tu < v_nay then
    raise exception 'Ngày nhận trước hôm nay' using errcode = 'P0001';
  end if;
  if p_den <= p_tu or p_den - p_tu > 31 then
    raise exception 'Khoảng ngày không hợp lệ' using errcode = 'P0001';
  end if;
  select array_agg(distinct x order by x) into v_pn from unnest(p_so_phong_ngu) x where x is not null;
  select array_agg(distinct x order by x) into v_toa from unnest(p_toa_nha) x where x is not null;
  select array_agg(distinct x order by x) into v_view from unnest(p_view) x where x is not null;
  if exists (select 1 from unnest(v_pn) x where x not between 1 and 4) then
    raise exception 'Số phòng ngủ không hợp lệ' using errcode = 'P0001';
  end if;
  if exists (select 1 from unnest(v_view) x where x not in ('bien', 'thanh_pho', 'nui')) then
    raise exception 'Loại view không hợp lệ' using errcode = 'P0001';
  end if;

  -- YC7.2 bước 5, YC7-H5, GD17: ghi lần tìm. Khóa theo người gọi để hai lần tìm cùng lúc không thêm hai dòng trùng.
  v_bo_loc := jsonb_strip_nulls(jsonb_build_object('so_phong_ngu', to_jsonb(v_pn), 'toa_nha', to_jsonb(v_toa), 'view', to_jsonb(v_view)));
  perform pg_advisory_xact_lock(hashtext('tim_gan_day:' || v_nguoi::text));
  update public.tim_gan_day set tim_luc = clock_timestamp()
  where sale_id = v_nguoi and tu_ngay = p_tu and den_ngay = p_den and bo_loc = v_bo_loc;
  if not found then
    insert into public.tim_gan_day (sale_id, tu_ngay, den_ngay, bo_loc, tim_luc)
    values (v_nguoi, p_tu, p_den, v_bo_loc, clock_timestamp());
  end if;
  delete from public.tim_gan_day
  where sale_id = v_nguoi
    and id not in (select g.id from public.tim_gan_day g where g.sale_id = v_nguoi order by g.tim_luc desc limit 5);

  select coalesce(jsonb_agg(jsonb_build_object(
           'can_id', k.can_id, 'nhom', k.nhom, 'ma_can', k.ma_can, 'ten_toa', k.ten_toa, 'ten_chu', k.ten_chu,
           'so_phong_ngu', k.so_phong_ngu, 'loai_view', k.loai_view, 'lich_doi_luc', k.lich_doi_luc,
           'tong_gia_chu', k.tong_gia_chu, 'tong_gia_ban', k.tong_gia_ban, 'khong_co_lich', k.nhom = 'tu_nhap')
           order by case k.nhom when 'cua_toi' then 0 when 'nguon' then 1 else 2 end, k.ma_can, k.can_id), '[]'::jsonb),
         count(*) filter (where k.nhom <> 'tu_nhap')
    into v_can, v_so
  from public.can_tim(v_nguoi, p_tu, p_den, v_pn, v_toa, v_view) k;

  -- YC7.2 bước 6: không có căn trống thì gợi ý đổi ngày ±1, bỏ một bộ lọc, thêm số phòng ngủ liền kề; chỉ gợi ý có căn trống.
  if v_so = 0 then
    for r in
      select * from (values
        (1, 0, 'doi_ngay', p_tu - 1, p_den - 1, v_pn, v_toa, v_view),
        (2, 0, 'doi_ngay', p_tu + 1, p_den + 1, v_pn, v_toa, v_view),
        (3, 0, 'bo_loc_toa', p_tu, p_den, v_pn, null::uuid[], v_view),
        (4, 0, 'bo_loc_view', p_tu, p_den, v_pn, v_toa, null::text[]),
        (5, 0, 'bo_loc_phong_ngu', p_tu, p_den, null::smallint[], v_toa, v_view)
      ) x(thu_tu, phu, loai, tu, den, pn, toa, vw)
      where (x.loai <> 'doi_ngay' or x.tu >= v_nay)
        and (x.loai <> 'bo_loc_toa' or v_toa is not null)
        and (x.loai <> 'bo_loc_view' or v_view is not null)
        and (x.loai <> 'bo_loc_phong_ngu' or v_pn is not null)
      union all
      select 6, k, 'them_phong_ngu', p_tu, p_den,
             (select array_agg(y order by y) from unnest(v_pn || k::smallint) y), v_toa, v_view
      from generate_series(1, 4) k
      where v_pn is not null and not (k = any (v_pn))
        and exists (select 1 from unnest(v_pn) y where abs(y - k) = 1)
      order by 1, 2
    loop
      select * into d from public.dem_can_trong(v_nguoi, r.tu, r.den, r.pn, r.toa, r.vw);
      if d.so > 0 then
        v_goi_y := v_goi_y || jsonb_build_object(
          'loai', r.loai, 'tu', r.tu, 'den', r.den, 'so_phong_ngu', to_jsonb(r.pn), 'toa_nha', to_jsonb(r.toa),
          'view', to_jsonb(r.vw), 'so_can', d.so, 'ten_toa', d.ten_toa);
      end if;
    end loop;
  end if;

  return jsonb_build_object('so_can_trong', v_so, 'can', v_can, 'goi_y', v_goi_y);
end $$;

revoke execute on function public.fn_sale_tim(date, date, smallint[], uuid[], text[]) from public, anon, authenticated;
grant execute on function public.fn_sale_tim(date, date, smallint[], uuid[], text[]) to authenticated;
