-- US38 · Sale xin chủ nhà cho xem lịch (YC6.4). Lấy hay tạo link xin lịch, ghi lần gửi, đọc số đếm của chính sale.
-- Bảng link_xin_lich và policy đọc đã có ở EN2. Chỉ thêm, không sửa migration cũ. Vi phạm quyền: 42501.
-- Link xin lịch không hết hạn, không thu hồi (PQ18-H1, YC6-H2). Chủ nhà mở link và đồng ý là YC6.5 (US39).

-- YC6 Dữ liệu, YC6.4-NT5, PQ18: mã ngẫu nhiên 32 chữ cái, không chữ số nào (nên không chứa số điện thoại, mã người dùng).
create or replace function public.ma_link_chu_cai() returns text
language sql volatile set search_path = ''
as $$
  select string_agg(substr('abcdefghjkmnpqrstuvwxyzABCDEFGHJ', (get_byte(b, i) & 31) + 1, 1), '' order by i)
  from (select uuid_send(gen_random_uuid()) || uuid_send(gen_random_uuid()) as b) x, generate_series(0, 31) i
$$;

-- YC6.4, PQ18.SALE: người gọi phải là sale chưa xóa tài khoản. Trả id người gọi.
create or replace function public.can_la_sale() returns uuid
language plpgsql stable security definer set search_path = ''
as $$
declare v_nguoi uuid := public.can_dang_nhap();
begin
  if not exists (select 1 from public.profiles p where p.id = v_nguoi and p.vai_chon = 'sale' and p.da_xoa_luc is null) then
    raise exception 'Chỉ sale có link xin lịch' using errcode = '42501';
  end if;
  return v_nguoi;
end $$;

-- YC6.4 bước 1, YC6 quy tắc "Một link xin lịch nhiều chủ nhà", PQ18.SALE: link xin lịch của người gọi, chưa có thì tạo.
-- Mở A6 chưa tính là đã gửi.
create or replace function public.fn_lay_link_xin_lich() returns text
language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_nguoi uuid := public.can_la_sale();
  v_ma text;
begin
  insert into public.link_xin_lich (ma, sale_id) values (public.ma_link_chu_cai(), v_nguoi)
  on conflict (sale_id) do nothing;
  select l.ma into v_ma from public.link_xin_lich l where l.sale_id = v_nguoi;
  return v_ma;
end $$;

-- YC6.4 bước 2, 3, YC6.4-NT2, YC6 quy tắc "Không biết gửi cho ai", PQ18.SALE: một lần mở bảng chia sẻ hay sao chép.
create or replace function public.fn_gui_link_xin_lich()
returns table (ma text, so_lan_gui integer, gui_cuoi_luc timestamptz)
language plpgsql volatile security definer set search_path = ''
as $$
declare v_nguoi uuid := public.can_la_sale();
begin
  perform public.fn_lay_link_xin_lich();
  return query
  update public.link_xin_lich l set so_lan_gui = l.so_lan_gui + 1, gui_cuoi_luc = now()
  where l.sale_id = v_nguoi
  returning l.ma, l.so_lan_gui, l.gui_cuoi_luc;
end $$;

-- YC6.4 bước 4, YC6.4-NT3, NT4, NT5, PQ18.SALE, PQ17.SALE: số đếm của chính người gọi, đọc qua RLS (security invoker).
-- so_chu_dong_y: kết nối nguồn 'sale_xin' đang 'da_ket_noi'. co_nguon: có kết nối đã kết nối hay căn tự nhập chưa xóa.
create or replace function public.xin_lich_cua_toi()
returns table (ma text, so_lan_gui integer, gui_cuoi_luc timestamptz, so_chu_dong_y integer, co_nguon boolean)
language sql stable security invoker set search_path = ''
as $$
  select l.ma,
         coalesce(l.so_lan_gui, 0),
         l.gui_cuoi_luc,
         (select count(*)::integer from public.ket_noi k
          where k.sale_id = auth.uid() and k.nguon = 'sale_xin' and k.trang_thai = 'da_ket_noi'),
         exists (select 1 from public.ket_noi k where k.sale_id = auth.uid() and k.trang_thai = 'da_ket_noi')
           or exists (select 1 from public.can c where c.nguoi_giu = auth.uid() and c.loai = 'tu_nhap' and c.an_luc is null)
  from (select 1) x
  left join public.link_xin_lich l on l.sale_id = auth.uid()
  where auth.uid() is not null
$$;

revoke execute on function public.ma_link_chu_cai(), public.can_la_sale(), public.fn_lay_link_xin_lich(),
  public.fn_gui_link_xin_lich(), public.xin_lich_cua_toi() from public, anon;
grant execute on function public.fn_lay_link_xin_lich(), public.fn_gui_link_xin_lich(), public.xin_lich_cua_toi()
  to authenticated;
revoke execute on function public.ma_link_chu_cai(), public.can_la_sale() from authenticated;
