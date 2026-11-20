-- US23 · Đặt giá nhiều căn (YC4.4). Lệnh fn_dat_gia_thang_nhieu. Chỉ thêm, không sửa migration cũ.

-- YC4.4 bước 4, YC4 "Dữ liệu", YC4 "Ai được làm gì", QT5.5, PQ5.CHU.
-- Mọi căn phải là căn chưa xóa của người gọi; có một căn không hợp lệ thì không ghi căn nào (một giao dịch).
-- Khóa dòng các căn theo thứ tự id để hai lệnh cùng lúc không khóa chéo. Ghi từng căn bằng fn_dat_gia_thang (cùng luật kiểm YC4.2).
create or replace function public.fn_dat_gia_thang_nhieu(p_can_ids uuid[], p_thang date[], p_gia_thuong bigint, p_gia_cuoi_tuan bigint)
returns void
language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_nguoi uuid := public.can_dang_nhap();
  v_ds uuid[];
  v_hop_le integer;
  v_can uuid;
begin
  select array_agg(distinct x) into v_ds from unnest(coalesce(p_can_ids, '{}')) x where x is not null;
  if v_ds is null or cardinality(v_ds) = 0 then
    raise exception 'Chưa chọn căn nào' using errcode = 'P0001';
  end if;

  select count(*) into v_hop_le from (
    select c.id from public.can c
    where c.id = any (v_ds) and c.nguoi_giu = v_nguoi and c.an_luc is null
    order by c.id
    for update
  ) k;
  if v_hop_le <> cardinality(v_ds) then
    raise exception 'Không tìm thấy căn' using errcode = 'P0001';
  end if;

  foreach v_can in array v_ds loop
    perform public.fn_dat_gia_thang(v_can, p_thang, p_gia_thuong, p_gia_cuoi_tuan);
  end loop;
end $$;

revoke execute on function public.fn_dat_gia_thang_nhieu(uuid[], date[], bigint, bigint) from public, anon, authenticated;
grant execute on function public.fn_dat_gia_thang_nhieu(uuid[], date[], bigint, bigint) to authenticated;
