-- US20 · Giá trên thẻ căn (YC4.1). Lệnh đọc giá thấp nhất, cao nhất của 7 đêm trong tuần cho mọi căn của người gọi.
-- Chỉ thêm, không sửa migration cũ.

-- YC4.1 bước 1, YC4.1-NT1, YC4.1-NT2, QT5.3, PQ5.CHU, PQ3.CHU.
-- Mỗi căn có lịch chưa ẩn của người gọi một dòng: giá đêm thấp nhất, cao nhất từ thứ Hai của tuần chứa p_tu tới Chủ nhật.
-- Dùng lại cách tính giá đêm của fn_lich_gia_thang (không viết lại công thức); đêm chưa có giá bị bỏ qua, không có đêm nào
-- có giá thì cả hai là null (không bao giờ 0). Người gọi chỉ nhận căn của mình; sale không có căn có lịch nên không nhận dòng nào.
create or replace function public.fn_gia_tuan_cua_toi(p_tu date)
returns table (can_id uuid, gia_thap bigint, gia_cao bigint)
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_nguoi uuid := public.can_dang_nhap();
  v_t2 date := date_trunc('week', p_tu)::date;
begin
  if p_tu is null then
    raise exception 'Chưa chọn tuần' using errcode = 'P0001';
  end if;
  return query
  select c.id, min(l.gia)::bigint, max(l.gia)::bigint
  from public.can c
  cross join (select distinct date_trunc('month', d)::date as thang
              from generate_series(v_t2, v_t2 + 6, interval '1 day') d) m
  cross join lateral public.fn_lich_gia_thang(c.id, m.thang) l
  where c.nguoi_giu = v_nguoi and c.loai = 'co_lich' and c.an_luc is null
    and l.dem between v_t2 and v_t2 + 6
  group by c.id;
end $$;

revoke execute on function public.fn_gia_tuan_cua_toi(date) from public, anon, authenticated;
grant execute on function public.fn_gia_tuan_cua_toi(date) to authenticated;
