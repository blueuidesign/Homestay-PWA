-- US40 · Chủ nhà gửi lịch theo căn đã chọn (YC6.6, YC6-H7, H8, H9). Link gửi lịch dùng chung bảng link_moi (loai gui_lich)
-- và link_moi_can, cùng đường /l/<mã>. Hàm mới fn_gui_lich; xem trước, thêm lịch, ảnh xem trước nhận thêm loại gui_lich.
-- Hành vi của link mời (moi_sale) giữ nguyên. Chỉ thêm, không sửa migration cũ.
-- Vi phạm quyền: 42501. Danh sách căn rỗng, link hỏng: P0001 kèm câu hiện cho người dùng (QT5.5).

-- Căn của một link (gui_lich: căn trong link; moi_sale: mọi căn), chỉ căn có lịch, chưa xóa, còn của chủ link.
-- YC6.6 (căn trong link còn chưa xóa), QD8, PQ3.LINK. Hàm nội bộ, app không gọi.
create or replace function public.can_cua_link(p_link public.link_moi) returns setof uuid
language sql stable security definer set search_path = ''
as $$
  select c.id from public.can c
  where c.nguoi_giu = p_link.chu_id and c.loai = 'co_lich' and c.an_luc is null
    and (p_link.loai = 'moi_sale'
         or exists (select 1 from public.link_moi_can lc where lc.link_id = p_link.id and lc.can_id = c.id))
$$;
revoke execute on function public.can_cua_link(public.link_moi) from public, anon, authenticated;

-- YC6.6 bước 4, YC6.6-NT4, YC6-H8, H9, PQ18.CHU, YC6 quy tắc "Không biết gửi cho ai": chủ nhà bấm "Chia sẻ lịch".
-- Luôn tạo link mới với các căn đã chọn (hạn 21 ngày), mỗi căn phải là căn có lịch, chưa xóa của người gọi; tính một lần gửi.
create or replace function public.fn_gui_lich(p_can_ids uuid[])
returns table (ma text, so_lan_gui integer, het_han_luc timestamptz)
language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_nguoi uuid := public.can_dang_nhap();
  v_id uuid;
  v_can uuid[];
begin
  if not exists (select 1 from public.profiles p where p.id = v_nguoi and p.vai_chon = 'chu_nha' and p.da_xoa_luc is null) then
    raise exception 'Chỉ chủ nhà gửi được lịch' using errcode = '42501';
  end if;
  select array_agg(distinct x) into v_can from unnest(coalesce(p_can_ids, '{}'::uuid[])) x where x is not null;
  if v_can is null then
    raise exception 'Chọn ít nhất một căn' using errcode = 'P0001';
  end if;
  if exists (
    select 1 from unnest(v_can) x
    where not exists (select 1 from public.can c
                      where c.id = x and c.nguoi_giu = v_nguoi and c.loai = 'co_lich' and c.an_luc is null)) then
    raise exception 'Căn không phải của bạn hoặc đã xóa' using errcode = '42501';
  end if;
  -- QD8, YC6 quy tắc "Link mời": mã ngẫu nhiên 32 ký tự, không chứa số điện thoại, mã người dùng hay giá.
  insert into public.link_moi (ma, loai, chu_id, so_lan_gui, gui_cuoi_luc)
  values (replace(gen_random_uuid()::text, '-', ''), 'gui_lich', v_nguoi, 1, now())
  returning id into v_id;
  insert into public.link_moi_can (link_id, can_id) select v_id, x from unnest(v_can) x;
  return query select l.ma, l.so_lan_gui, l.het_han_luc from public.link_moi l where l.id = v_id;
end $$;
revoke execute on function public.fn_gui_lich(uuid[]) from public, anon, authenticated;
grant execute on function public.fn_gui_lich(uuid[]) to authenticated;

-- YC6.3 bước 2, 4, 7, YC6.6-NT7, YC6.3-NT2, NT5, NT6, NT8, NT10, KT-DB.3.1, PQ1.LINK, PQ2.LINK, PQ4.LINK, PQ18.LINK, QD8:
-- xem trước link mời hay link gửi lịch, gọi được khi chưa đăng nhập. Không giá, không số điện thoại. Link gửi lịch chỉ
-- có các căn trong link còn chưa xóa; da_them khi đã kết nối và mọi căn đó đã trong phạm vi (A10-01).
create or replace function public.fn_xem_link_moi(p_ma text) returns jsonb
language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_nguoi uuid := auth.uid();
  v_dia_chi text;
  v_phut timestamptz := date_trunc('minute', now());
  v_so integer;
  v_link public.link_moi;
  v_tt text;
  v_vai text;
  v_can uuid[];
  v_kq jsonb;
begin
  begin
    v_dia_chi := nullif(btrim(split_part(current_setting('request.headers', true)::jsonb ->> 'x-forwarded-for', ',', 1)), '');
  exception when others then
    v_dia_chi := null;
  end;
  v_dia_chi := coalesce(v_dia_chi, 'khong-ro');
  insert into public.xem_link_dem as d (dia_chi, phut, so) values (v_dia_chi, v_phut, 1)
  on conflict (dia_chi, phut) do update set so = d.so + 1
  returning d.so into v_so;
  if v_so > 30 then
    raise exception 'Mở link quá nhiều lần. Thử lại sau một phút.' using errcode = 'P0001';
  end if;
  delete from public.xem_link_dem where dia_chi = v_dia_chi and phut < v_phut - interval '10 minutes';

  select l.* into v_link from public.link_moi l where l.ma = coalesce(p_ma, '');
  v_tt := public.trang_thai_link_moi(v_link);
  if v_tt <> 'hop_le' then
    return jsonb_build_object('trang_thai', v_tt);
  end if;

  v_can := array(select public.can_cua_link(v_link));
  select p.vai_chon into v_vai from public.profiles p where p.id = v_nguoi;
  select jsonb_build_object(
           'trang_thai', 'hop_le',
           'loai', v_link.loai,
           'ten_chu', coalesce(chu.ten_hien_thi, chu.ten),
           'so_can', cardinality(v_can),
           'can', coalesce((
             select jsonb_agg(jsonb_build_object(
                      'ma_can', c.ma_can, 'so_phong_ngu', c.so_phong_ngu, 'so_giuong', c.so_giuong, 'loai_view', c.loai_view,
                      'ten_toa', tn.ten,
                      'anh', (select a.duong_dan from public.anh_can a where a.can_id = c.id order by a.thu_tu nulls last, a.tao_luc limit 1))
                    order by coalesce(tn.ten, ''), c.ma_can)
             from public.can c left join public.toa_nha tn on tn.id = c.toa_nha_id
             where c.id = any (v_can)), '[]'::jsonb),
           'da_them', v_nguoi is not null and exists (
             select 1 from public.ket_noi k
             where k.chu_id = v_link.chu_id and k.sale_id = v_nguoi and k.trang_thai = 'da_ket_noi'
               and (k.pham_vi = 'tat_ca'
                    or not exists (select 1 from unnest(v_can) x
                                   where not exists (select 1 from public.ket_noi_can kc
                                                     where kc.ket_noi_id = k.id and kc.can_id = x)))),
           'cua_minh', v_nguoi is not null and v_nguoi = v_link.chu_id,
           'sai_vai', v_nguoi is not null and v_nguoi <> v_link.chu_id and v_vai is not distinct from 'chu_nha')
  into v_kq
  from public.profiles chu where chu.id = v_link.chu_id;
  return v_kq;
end $$;

-- YC6.3 bước 5, YC6.6-NT1, NT5, YC6-H7, H14, H15, QD7, QD8, PQ17.LINK, PQ17.CHU: sale bấm "Thêm lịch" từ link mời hay
-- link gửi lịch. Link mời: như US37. Link gửi lịch không bao giờ thu hẹp quyền: tất cả căn giữ nguyên ('da_co');
-- danh sách căn thì cộng căn của link; chưa kết nối, sale bỏ, chưa có dòng thì đã kết nối, nguồn gui_lich, đúng căn của link.
-- Chủ đã ngừng: từ chối. Không ghi thông báo (YC6-H6).
create or replace function public.fn_them_lich_link_moi(p_ma text) returns text
language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_nguoi uuid := public.can_dang_nhap();
  v_link public.link_moi;
  v_tt text;
  v_k public.ket_noi%rowtype;
  v_moi boolean := false;
  v_so integer;
begin
  select l.* into v_link from public.link_moi l where l.ma = coalesce(p_ma, '');
  v_tt := public.trang_thai_link_moi(v_link);
  if v_tt = 'het_han' then
    raise exception 'Link mời đã hết hạn.' using errcode = 'P0001';
  elsif v_tt <> 'hop_le' then
    raise exception 'Link mời không còn dùng được.' using errcode = 'P0001';
  end if;
  if v_link.chu_id = v_nguoi then
    raise exception 'Đây là link mời của bạn' using errcode = '42501';
  end if;
  if not exists (select 1 from public.profiles p where p.id = v_nguoi and p.vai_chon = 'sale' and p.da_xoa_luc is null) then
    raise exception 'Link này dành cho sale' using errcode = '42501';
  end if;

  select * into v_k from public.ket_noi where chu_id = v_link.chu_id and sale_id = v_nguoi for update;
  if not found then
    insert into public.ket_noi (chu_id, sale_id, trang_thai, nguon, pham_vi, xem_coc)
    values (v_link.chu_id, v_nguoi, 'chua_ket_noi', case when v_link.loai = 'gui_lich' then 'gui_lich' else 'link_moi' end, 'tat_ca', true)
    on conflict (chu_id, sale_id) do nothing;
    select * into v_k from public.ket_noi where chu_id = v_link.chu_id and sale_id = v_nguoi for update;
    v_moi := true;
  end if;

  if v_k.trang_thai = 'da_ket_noi' and not v_moi then
    if v_link.loai = 'moi_sale' or v_k.pham_vi = 'tat_ca' then
      return 'da_co';
    end if;
    -- YC6-H7: danh sách căn thì cộng thêm, không bớt căn cũ, giữ nguồn và quyền cọc.
    insert into public.ket_noi_can (ket_noi_id, can_id)
    select v_k.id, x from public.can_cua_link(v_link) x
    on conflict do nothing;
    get diagnostics v_so = row_count;
    if v_so = 0 then
      return 'da_co';
    end if;
    update public.ket_noi set sua_luc = now() where id = v_k.id;
    return 'da_them';
  end if;
  if v_k.trang_thai = 'chu_ngung' then
    raise exception 'Chủ nhà đã ngừng cho bạn xem lịch' using errcode = '42501';
  end if;

  -- Chưa kết nối, sale đã bỏ, hay dòng vừa tạo: thành đã kết nối theo link, cọc bật (QD7).
  delete from public.ket_noi_can where ket_noi_id = v_k.id;
  if v_link.loai = 'gui_lich' then
    insert into public.ket_noi_can (ket_noi_id, can_id) select v_k.id, x from public.can_cua_link(v_link) x;
    update public.ket_noi set trang_thai = 'da_ket_noi', nguon = 'gui_lich', pham_vi = 'chon_can', xem_coc = true,
                              ngung_luc = null, sua_luc = now()
    where id = v_k.id;
  else
    update public.ket_noi set trang_thai = 'da_ket_noi', nguon = 'link_moi', pham_vi = 'tat_ca', xem_coc = true,
                              ngung_luc = null, sua_luc = now()
    where id = v_k.id;
  end if;
  return 'da_them';
end $$;

revoke execute on function public.fn_xem_link_moi(text), public.fn_them_lich_link_moi(text) from public, anon, authenticated;
grant execute on function public.fn_them_lich_link_moi(text) to authenticated;
-- KT-DB.3.1: hàm duy nhất anon gọi được.
grant execute on function public.fn_xem_link_moi(text) to anon, authenticated;

-- YC6.6-NT7, YC6.3-NT2, PQ3.LINK, QD8: ảnh xem trước theo header x-link-moi. Link gửi lịch chỉ ảnh các căn trong link.
create or replace function rieng.anh_cua_link_moi(p_ten text) returns boolean
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_ma text;
  v_link public.link_moi;
begin
  begin
    v_ma := current_setting('request.headers', true)::jsonb ->> 'x-link-moi';
  exception when others then
    return false;
  end;
  if v_ma is null or v_ma = '' then
    return false;
  end if;
  select l.* into v_link from public.link_moi l where l.ma = v_ma;
  if public.trang_thai_link_moi(v_link) <> 'hop_le' then
    return false;
  end if;
  return exists (
    select 1 from public.anh_can a
    where a.duong_dan = p_ten and a.can_id in (select public.can_cua_link(v_link)));
end $$;
revoke execute on function rieng.anh_cua_link_moi(text) from public;
grant execute on function rieng.anh_cua_link_moi(text) to anon, authenticated;
