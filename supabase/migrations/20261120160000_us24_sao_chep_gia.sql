-- US24 · Sao chép giá sang căn khác (YC4.5). Lệnh fn_sao_chep_gia. Chỉ thêm, không sửa migration cũ.

-- YC4.5 bước 5, YC4 Quy tắc "Sao chép thay giá có sẵn", YC4 "Dữ liệu", YC4 "Ai được làm gì", QT5.5, PQ5.CHU.
-- Căn nguồn và mọi căn đích phải là căn chưa xóa của người gọi, đích khác nguồn; sai một căn thì từ chối cả lệnh (một giao dịch),
-- không trả giá nào. Chép năm p_nam (năm đang xem ở tab Giá, YC4-H1 Claude tự chốt QD25), năm nay hoặc năm sau.
-- Trả mỗi căn đích một phần tử: can_id, ma_can, thang_giu (tháng nguồn chưa có giá mà đích có, giữ giá đích),
-- dip_giu (dải của đích thuộc phần đã chọn mà nguồn không có, giữ nguyên), dip_bo (dải nguồn chồng ngày lên dải của đích, bị bỏ ở căn đó).
create or replace function public.fn_sao_chep_gia(p_tu_can uuid, p_den_can uuid[], p_thang boolean, p_ngay_le boolean, p_dip boolean, p_nam integer)
returns jsonb
language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_nguoi uuid := public.can_dang_nhap();
  v_nam_nay integer := extract(year from public.local_today())::integer;
  v_ds uuid[];
  v_hop_le integer;
  v_dich uuid;
  v_dau date;
  v_cuoi date;
  v_kq jsonb := '[]'::jsonb;
  v_thang_giu jsonb;
  v_dip_giu jsonb;
  v_dip_bo jsonb;
  v_ma text;
  r record;
begin
  if not (coalesce(p_thang, false) or coalesce(p_ngay_le, false) or coalesce(p_dip, false)) then
    raise exception 'Chưa chọn sao chép gì' using errcode = 'P0001';
  end if;
  select array_agg(x order by ord) into v_ds
  from (select x, min(o) as ord from unnest(coalesce(p_den_can, '{}')) with ordinality as u(x, o) where x is not null group by x) d;
  if v_ds is null or cardinality(v_ds) = 0 then
    raise exception 'Chưa chọn căn nào' using errcode = 'P0001';
  end if;
  if p_nam is null or p_nam not in (v_nam_nay, v_nam_nay + 1) then
    raise exception 'Chỉ sao chép được giá năm nay hoặc năm sau' using errcode = 'P0001';
  end if;

  -- Khóa nguồn và đích theo thứ tự id; đếm đủ mới chạy tiếp.
  select count(*) into v_hop_le from (
    select c.id from public.can c
    where c.id = any (v_ds || p_tu_can) and c.nguoi_giu = v_nguoi and c.an_luc is null
    order by c.id
    for update
  ) k;
  if p_tu_can is null or p_tu_can = any (v_ds) or v_hop_le <> cardinality(v_ds) + 1 then
    raise exception 'Không tìm thấy căn' using errcode = 'P0001';
  end if;

  v_dau := make_date(p_nam, 1, 1);
  v_cuoi := make_date(p_nam, 12, 31);

  foreach v_dich in array v_ds loop
    v_thang_giu := '[]'::jsonb;
    v_dip_giu := '[]'::jsonb;
    v_dip_bo := '[]'::jsonb;

    if coalesce(p_thang, false) then
      -- Tháng nguồn có giá: thay giá đích. Tháng nguồn chưa có giá mà đích có: giữ, liệt kê.
      insert into public.gia_thang (can_id, thang, gia_thuong, gia_cuoi_tuan, sua_luc)
      select v_dich, g.thang, g.gia_thuong, g.gia_cuoi_tuan, now()
      from public.gia_thang g where g.can_id = p_tu_can and g.thang between v_dau and v_cuoi
      on conflict (can_id, thang) do update
        set gia_thuong = excluded.gia_thuong, gia_cuoi_tuan = excluded.gia_cuoi_tuan, sua_luc = excluded.sua_luc;
      select coalesce(jsonb_agg(extract(month from d.thang)::integer order by d.thang), '[]'::jsonb) into v_thang_giu
      from public.gia_thang d
      where d.can_id = v_dich and d.thang between v_dau and v_cuoi
        and not exists (select 1 from public.gia_thang s where s.can_id = p_tu_can and s.thang = d.thang);
    end if;

    if coalesce(p_ngay_le, false) or coalesce(p_dip, false) then
      -- Dải của đích thuộc phần đã chọn mà nguồn không có dải trùng ngày: giữ nguyên, liệt kê.
      select coalesce(jsonb_agg(jsonb_build_object('ten', d.ten, 'tu_ngay', d.tu_ngay, 'den_ngay', d.den_ngay, 'la_ngay_le', d.la_ngay_le)
                                order by d.tu_ngay), '[]'::jsonb) into v_dip_giu
      from public.gia_dip d
      where d.can_id = v_dich and d.tu_ngay <= v_cuoi and d.den_ngay >= v_dau
        and ((d.la_ngay_le and coalesce(p_ngay_le, false)) or (not d.la_ngay_le and coalesce(p_dip, false)))
        and not exists (select 1 from public.gia_dip s where s.can_id = p_tu_can and s.tu_ngay <= v_cuoi and s.den_ngay >= v_dau
                          and ((s.la_ngay_le and coalesce(p_ngay_le, false)) or (not s.la_ngay_le and coalesce(p_dip, false)))
                          and daterange(s.tu_ngay, s.den_ngay, '[]') && daterange(d.tu_ngay, d.den_ngay, '[]'));

      for r in
        select s.* from public.gia_dip s
        where s.can_id = p_tu_can and s.tu_ngay <= v_cuoi and s.den_ngay >= v_dau
          and ((s.la_ngay_le and coalesce(p_ngay_le, false)) or (not s.la_ngay_le and coalesce(p_dip, false)))
        order by s.tu_ngay
      loop
        if exists (select 1 from public.gia_dip d where d.can_id = v_dich
                   and daterange(d.tu_ngay, d.den_ngay, '[]') && daterange(r.tu_ngay, r.den_ngay, '[]')) then
          -- Chồng ngày lên dải khác của đích: giữ dải đích, bỏ dải nguồn ở căn này.
          v_dip_bo := v_dip_bo || jsonb_build_object('ten', r.ten, 'tu_ngay', r.tu_ngay, 'den_ngay', r.den_ngay, 'la_ngay_le', r.la_ngay_le);
        else
          insert into public.gia_dip (can_id, tu_ngay, den_ngay, ten, gia, la_ngay_le, sua_luc)
          values (v_dich, r.tu_ngay, r.den_ngay, r.ten, r.gia, r.la_ngay_le, now());
        end if;
      end loop;
    end if;

    -- YC4 "Dữ liệu": mọi lệnh đổi giá cập nhật lúc lịch đổi của căn.
    update public.can set lich_doi_luc = now() where id = v_dich returning ma_can into v_ma;
    v_kq := v_kq || jsonb_build_object('can_id', v_dich, 'ma_can', v_ma, 'thang_giu', v_thang_giu, 'dip_giu', v_dip_giu, 'dip_bo', v_dip_bo);
  end loop;
  return v_kq;
end $$;

revoke execute on function public.fn_sao_chep_gia(uuid, uuid[], boolean, boolean, boolean, integer) from public, anon, authenticated;
grant execute on function public.fn_sao_chep_gia(uuid, uuid[], boolean, boolean, boolean, integer) to authenticated;
