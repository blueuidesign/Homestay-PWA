-- US37 · Link mời của chủ nhà và sale thêm lịch (YC6.3, QD8). Lấy hay tạo link mời, đổi link, xem trước link (anon được gọi),
-- thêm lịch từ link, ảnh xem trước qua kho theo mã link. Chỉ thêm, không sửa migration cũ.
-- Vi phạm quyền: 42501. Link hỏng, xem quá nhiều: P0001 kèm câu hiện cho người dùng (QT5.5).

-- YC6 Dữ liệu, YC6.3-NT8: đếm lần xem trước theo địa chỉ và phút. Chỉ hàm fn_xem_link_moi ghi; không ai đọc thẳng.
create table public.xem_link_dem (
  dia_chi text not null,
  phut timestamptz not null,
  so integer not null default 0,
  primary key (dia_chi, phut)
);
alter table public.xem_link_dem enable row level security;
revoke all on public.xem_link_dem from public, anon, authenticated;

create index link_moi_chu on public.link_moi (chu_id, loai) where thu_hoi_luc is null;

-- YC6.3 bước 1, YC6.3-NT7, PQ18.CHU, YC6 quy tắc "Không biết gửi cho ai": chủ nhà lấy link mời đang dùng (chưa thu hồi,
-- còn hạn), không có thì tạo mới hạn 21 ngày; mỗi lần gọi là một lần mở bảng chia sẻ hay sao chép, tăng số lần gửi.
create or replace function public.fn_lay_link_moi()
returns table (ma text, so_lan_gui integer, het_han_luc timestamptz)
language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_nguoi uuid := public.can_dang_nhap();
  v_id uuid;
begin
  if not exists (select 1 from public.profiles p where p.id = v_nguoi and p.vai_chon = 'chu_nha' and p.da_xoa_luc is null) then
    raise exception 'Chỉ chủ nhà tạo được link mời' using errcode = '42501';
  end if;
  -- Khóa theo người gọi để hai lần bấm cùng lúc không tạo hai link.
  perform pg_advisory_xact_lock(hashtext('link_moi:' || v_nguoi::text));
  select l.id into v_id from public.link_moi l
  where l.chu_id = v_nguoi and l.loai = 'moi_sale' and l.thu_hoi_luc is null and l.het_han_luc > now()
  order by l.tao_luc desc limit 1;
  if v_id is null then
    -- QD8, YC6 quy tắc "Link mời": mã ngẫu nhiên 32 ký tự, không chứa số điện thoại, mã người dùng hay giá.
    insert into public.link_moi (ma, loai, chu_id)
    values (replace(gen_random_uuid()::text, '-', ''), 'moi_sale', v_nguoi)
    returning id into v_id;
  end if;
  return query
  update public.link_moi l set so_lan_gui = l.so_lan_gui + 1, gui_cuoi_luc = now()
  where l.id = v_id
  returning l.ma, l.so_lan_gui, l.het_han_luc;
end $$;

-- YC6.3 (YC6-H10), YC6.3-NT9, PQ18.CHU, QD8: thu hồi link mời đang dùng của người gọi. Kết nối đã có giữ nguyên (YC6-H3).
create or replace function public.fn_doi_link_moi() returns void
language plpgsql volatile security definer set search_path = ''
as $$
declare v_nguoi uuid := public.can_dang_nhap();
begin
  update public.link_moi set thu_hoi_luc = now()
  where chu_id = v_nguoi and loai = 'moi_sale' and thu_hoi_luc is null;
end $$;

-- YC6.3 bước 2, 4, 7, YC6-H5, H10, H14, H15, PQ18.LINK: trạng thái một mã link mời. Chủ đã xóa tài khoản như đã thu hồi.
create or replace function public.trang_thai_link_moi(p_link public.link_moi) returns text
language sql stable security definer set search_path = ''
as $$
  select case
    when p_link.id is null then 'khong_dung_duoc'
    when p_link.thu_hoi_luc is not null
         or exists (select 1 from public.profiles p where p.id = p_link.chu_id and p.da_xoa_luc is not null) then 'khong_dung_duoc'
    when p_link.het_han_luc <= now() then 'het_han'
    else 'hop_le'
  end
$$;

-- YC6.3 bước 2, 4, 7, YC6.3-NT2, NT5, NT6, NT8, NT10, KT-DB.3.1, PQ1.LINK, PQ2.LINK, PQ4.LINK, PQ18.LINK, QD8:
-- xem trước link mời, gọi được khi chưa đăng nhập. Trả tên chủ nhà, số căn, sơ lược căn và ảnh đại diện, không giá,
-- không số điện thoại. Link hỏng chỉ trả trang_thai. Mỗi địa chỉ tối đa 30 lần một phút (x-forwarded-for, địa chỉ đầu).
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
  -- Dọn đếm cũ của địa chỉ này.
  delete from public.xem_link_dem where dia_chi = v_dia_chi and phut < v_phut - interval '10 minutes';

  select l.* into v_link from public.link_moi l where l.ma = coalesce(p_ma, '') and l.loai = 'moi_sale';
  v_tt := public.trang_thai_link_moi(v_link);
  if v_tt <> 'hop_le' then
    return jsonb_build_object('trang_thai', v_tt);
  end if;

  select p.vai_chon into v_vai from public.profiles p where p.id = v_nguoi;
  select jsonb_build_object(
           'trang_thai', 'hop_le',
           'ten_chu', coalesce(chu.ten_hien_thi, chu.ten),
           'so_can', (select count(*) from public.can c where c.nguoi_giu = v_link.chu_id and c.loai = 'co_lich' and c.an_luc is null),
           'can', coalesce((
             select jsonb_agg(jsonb_build_object(
                      'ma_can', c.ma_can, 'so_phong_ngu', c.so_phong_ngu, 'so_giuong', c.so_giuong, 'loai_view', c.loai_view,
                      'ten_toa', tn.ten,
                      'anh', (select a.duong_dan from public.anh_can a where a.can_id = c.id order by a.thu_tu nulls last, a.tao_luc limit 1))
                    order by coalesce(tn.ten, ''), c.ma_can)
             from public.can c left join public.toa_nha tn on tn.id = c.toa_nha_id
             where c.nguoi_giu = v_link.chu_id and c.loai = 'co_lich' and c.an_luc is null), '[]'::jsonb),
           'da_them', v_nguoi is not null and exists (
             select 1 from public.ket_noi k where k.chu_id = v_link.chu_id and k.sale_id = v_nguoi and k.trang_thai = 'da_ket_noi'),
           'cua_minh', v_nguoi is not null and v_nguoi = v_link.chu_id,
           'sai_vai', v_nguoi is not null and v_nguoi <> v_link.chu_id and v_vai is not distinct from 'chu_nha')
  into v_kq
  from public.profiles chu where chu.id = v_link.chu_id;
  return v_kq;
end $$;

-- YC6.3 bước 5, YC6.3-NT4, NT5, NT6, NT9, NT10, YC6-H6, H14, H15, QD7, QD8, PQ17.LINK, PQ17.CHU: sale bấm "Thêm lịch".
-- Kiểm lại link; tạo kết nối đã kết nối, nguồn link mời, tất cả căn, cọc bật. Đã kết nối thì 'da_co', không tạo thêm.
-- Dòng chưa kết nối hay sale đã bỏ thì thành đã kết nối; chủ đã ngừng thì từ chối (link không mở lại việc chủ đã ngừng).
-- Không ghi thông báo (YC6-H6).
create or replace function public.fn_them_lich_link_moi(p_ma text) returns text
language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_nguoi uuid := public.can_dang_nhap();
  v_link public.link_moi;
  v_tt text;
  v_k public.ket_noi%rowtype;
begin
  select l.* into v_link from public.link_moi l where l.ma = coalesce(p_ma, '') and l.loai = 'moi_sale';
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
  if found then
    if v_k.trang_thai = 'da_ket_noi' then
      return 'da_co';
    end if;
    if v_k.trang_thai = 'chu_ngung' then
      raise exception 'Chủ nhà đã ngừng cho bạn xem lịch' using errcode = '42501';
    end if;
    delete from public.ket_noi_can where ket_noi_id = v_k.id;
    update public.ket_noi set trang_thai = 'da_ket_noi', nguon = 'link_moi', pham_vi = 'tat_ca', xem_coc = true,
                              ngung_luc = null, sua_luc = now()
    where id = v_k.id;
    return 'da_them';
  end if;
  insert into public.ket_noi (chu_id, sale_id, trang_thai, nguon, pham_vi, xem_coc)
  values (v_link.chu_id, v_nguoi, 'da_ket_noi', 'link_moi', 'tat_ca', true)
  on conflict (chu_id, sale_id) do nothing;
  if not found then
    return 'da_co';
  end if;
  return 'da_them';
end $$;

revoke execute on function public.fn_lay_link_moi(), public.fn_doi_link_moi(), public.trang_thai_link_moi(public.link_moi),
  public.fn_xem_link_moi(text), public.fn_them_lich_link_moi(text) from public, anon, authenticated;
grant execute on function public.fn_lay_link_moi(), public.fn_doi_link_moi(), public.fn_them_lich_link_moi(text) to authenticated;
-- KT-DB.3.1: hàm duy nhất anon gọi được.
grant execute on function public.fn_xem_link_moi(text) to anon, authenticated;

-- ===== Ảnh xem trước =====
-- YC6.3 bước 2, 4, YC6.3-NT2, PQ3.LINK, QD8: app xin ảnh xem trước kèm header x-link-moi = mã link. Dịch vụ kho đặt
-- request.headers trước khi kiểm policy. Chỉ ảnh căn có lịch, chưa ẩn của chủ link hợp lệ. Hàm ở schema riêng (API không mở
-- schema này), nên anon không gọi được nó qua API; nó chỉ trả đúng sai cho một đường dẫn ảnh.
create schema if not exists rieng;
revoke all on schema rieng from public;
grant usage on schema rieng to anon, authenticated;

create or replace function rieng.anh_cua_link_moi(p_ten text) returns boolean
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_ma text;
  v_link public.link_moi;
  v_tt text;
begin
  begin
    v_ma := current_setting('request.headers', true)::jsonb ->> 'x-link-moi';
  exception when others then
    return false;
  end;
  if v_ma is null or v_ma = '' then
    return false;
  end if;
  select l.* into v_link from public.link_moi l where l.ma = v_ma and l.loai = 'moi_sale';
  v_tt := public.trang_thai_link_moi(v_link);
  if v_tt <> 'hop_le' then
    return false;
  end if;
  return exists (
    select 1 from public.anh_can a join public.can c on c.id = a.can_id
    where a.duong_dan = p_ten and c.nguoi_giu = v_link.chu_id and c.loai = 'co_lich' and c.an_luc is null);
end $$;
revoke execute on function rieng.anh_cua_link_moi(text) from public;
grant execute on function rieng.anh_cua_link_moi(text) to anon, authenticated;

create policy anh_can_xem_truoc_link on storage.objects for select to anon, authenticated
  using (bucket_id = 'anh-can' and rieng.anh_cua_link_moi(name));
