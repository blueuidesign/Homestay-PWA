-- US21 · Giá theo tháng của một căn (YC4.2). Lệnh đặt giá tháng fn_dat_gia_thang và lệnh lịch giá một tháng fn_lich_gia_thang.
-- Chỉ thêm, không sửa migration cũ. Đọc giá tháng, giá dịp của năm vẫn qua policy gia_thang_doc, gia_dip_doc (PQ5).

-- YC4.2 bước 4, YC4.2 Luật kiểm, YC4 "Dữ liệu", YC4 "Ai được làm gì", QT5.5, PQ5.CHU.
-- Chỉ người giữ căn chưa xóa đặt được; ghi đè mọi tháng đã chọn trong một giao dịch; cập nhật lúc lịch đổi. Không đụng booking.
create or replace function public.fn_dat_gia_thang(p_can_id uuid, p_thang date[], p_gia_thuong bigint, p_gia_cuoi_tuan bigint)
returns void
language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_nguoi uuid := public.can_dang_nhap();
  v_nam integer := extract(year from public.local_today())::integer;
  v_thang date;
begin
  -- QT5.5: căn không có, của người khác hay đã xóa đều là "Không tìm thấy căn". Khóa dòng căn để hai lệnh cùng lúc chạy lần lượt.
  perform 1 from public.can c
  where c.id = p_can_id and c.nguoi_giu = v_nguoi and c.an_luc is null
  for update;
  if not found then
    raise exception 'Không tìm thấy căn' using errcode = 'P0001';
  end if;

  if p_gia_thuong is null or p_gia_cuoi_tuan is null then
    raise exception 'Cần nhập giá ngày thường và giá cuối tuần' using errcode = 'P0001';
  end if;
  if p_gia_thuong <= 0 or p_gia_cuoi_tuan <= 0 then
    raise exception 'Giá phải lớn hơn 0' using errcode = 'P0001';
  end if;
  if p_gia_thuong > 100000000 or p_gia_cuoi_tuan > 100000000 then
    raise exception 'Giá mỗi đêm tối đa 100.000.000đ' using errcode = 'P0001';
  end if;

  if p_thang is null or cardinality(p_thang) = 0 then
    raise exception 'Chưa chọn tháng nào' using errcode = 'P0001';
  end if;
  foreach v_thang in array p_thang loop
    if v_thang is null or extract(day from v_thang) <> 1 then
      raise exception 'Tháng không hợp lệ' using errcode = 'P0001';
    end if;
    -- Năm nay hoặc năm sau, theo giờ Việt Nam (QT5.1).
    if extract(year from v_thang)::integer not in (v_nam, v_nam + 1) then
      raise exception 'Chỉ đặt giá được cho năm nay hoặc năm sau' using errcode = 'P0001';
    end if;
  end loop;

  insert into public.gia_thang (can_id, thang, gia_thuong, gia_cuoi_tuan, sua_luc)
  select p_can_id, t, p_gia_thuong, p_gia_cuoi_tuan, now()
  from (select distinct unnest(p_thang) as t) x
  on conflict (can_id, thang) do update
    set gia_thuong = excluded.gia_thuong, gia_cuoi_tuan = excluded.gia_cuoi_tuan, sua_luc = excluded.sua_luc;

  -- YC4 "Dữ liệu": mọi lệnh đổi giá cập nhật lúc lịch đổi của căn (độ tươi ở YC7).
  update public.can set lich_doi_luc = now() where id = p_can_id;
end $$;

revoke execute on function public.fn_dat_gia_thang(uuid, date[], bigint, bigint) from public, anon, authenticated;
grant execute on function public.fn_dat_gia_thang(uuid, date[], bigint, bigint) to authenticated;

-- YC4.2 bước 6, YC4.2-NT4, YC4 "Dữ liệu", QT5.3, QT5.1, PQ5.CHU: lịch giá một tháng của căn, mỗi đêm một dòng.
-- gia null khi đêm chưa có giá (không bao giờ 0). loai: 'dip', 'ngay_le' khi có dải phủ đêm; còn lại 'cuoi_tuan' hay 'thuong'
-- theo đêm cuối tuần của người giữ căn (isodow, mặc định {5,6}). co_khach: có booking chưa hủy chiếm đêm đó.
-- Chỉ người giữ căn chưa xóa gọi được; người khác nhận "Không tìm thấy căn" (QT5.5).
create or replace function public.fn_lich_gia_thang(p_can_id uuid, p_thang date)
returns table (dem date, gia bigint, loai text, co_khach boolean)
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_nguoi uuid := public.can_dang_nhap();
  v_can public.can%rowtype;
  v_cuoi_tuan smallint[];
  v_dau date := date_trunc('month', p_thang)::date;
begin
  select * into v_can from public.can c where c.id = p_can_id and c.nguoi_giu = v_nguoi and c.an_luc is null;
  if not found or p_thang is null then
    raise exception 'Không tìm thấy căn' using errcode = 'P0001';
  end if;
  select coalesce(p.dem_cuoi_tuan, '{5,6}') into v_cuoi_tuan from public.profiles p where p.id = v_can.nguoi_giu;
  v_cuoi_tuan := coalesce(v_cuoi_tuan, '{5,6}');

  return query
  with ngay as (
    select d::date as d, extract(isodow from d)::smallint = any (v_cuoi_tuan) as la_cuoi_tuan
    from generate_series(v_dau, (v_dau + interval '1 month' - interval '1 day')::date, interval '1 day') d
  )
  select n.d,
         case
           when dp.gia is not null then dp.gia
           when v_can.loai = 'tu_nhap' then case when n.la_cuoi_tuan then v_can.gia_chu_cuoi_tuan else v_can.gia_chu_thuong end
           else case when n.la_cuoi_tuan then gt.gia_cuoi_tuan else gt.gia_thuong end
         end,
         case
           when dp.gia is not null then case when dp.la_ngay_le then 'ngay_le' else 'dip' end
           when n.la_cuoi_tuan then 'cuoi_tuan'
           else 'thuong'
         end,
         exists (select 1 from public.booking b
                 where b.can_id = p_can_id and b.trang_thai <> 'da_huy' and b.dem @> n.d)
  from ngay n
  left join lateral (
    select g.gia, g.la_ngay_le from public.gia_dip g
    where g.can_id = p_can_id and n.d between g.tu_ngay and g.den_ngay
    limit 1
  ) dp on true
  left join public.gia_thang gt on gt.can_id = p_can_id and gt.thang = v_dau
  order by n.d;
end $$;

revoke execute on function public.fn_lich_gia_thang(uuid, date) from public, anon, authenticated;
grant execute on function public.fn_lich_gia_thang(uuid, date) to authenticated;
