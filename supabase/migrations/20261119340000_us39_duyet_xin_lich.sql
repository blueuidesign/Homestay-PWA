-- US39 · Chủ nhà duyệt lời xin xem lịch (YC6.5). Xem trước link xin lịch (chỉ người đã đăng nhập) và đồng ý.
-- "Từ chối" không ghi gì (YC6-H12). Chỉ thêm, không sửa migration cũ.
-- Vi phạm quyền: 42501. Link không dùng được: P0001 kèm câu A8-01 (QT5.5).

-- YC6.5 bước 4, YC6.5-NT4, NT7, YC6-H17, H18, HV5, PQ18.CHU, PQ23: link xin lịch người gọi còn dùng được không.
-- Không dùng được: không có mã, sale đã xóa tài khoản, link của chính người gọi, người gọi đã ngừng sale này.
create or replace function public.link_xin_lich_dung_duoc(p_link public.link_xin_lich, p_nguoi uuid) returns boolean
language sql stable security definer set search_path = ''
as $$
  select p_link.id is not null
     and p_link.sale_id <> p_nguoi
     and exists (select 1 from public.profiles p where p.id = p_link.sale_id and p.da_xoa_luc is null)
     and not exists (select 1 from public.ket_noi k
                     where k.chu_id = p_nguoi and k.sale_id = p_link.sale_id and k.trang_thai = 'chu_ngung')
$$;

-- YC6.5 bước 1, 4, YC6.5-NT1, NT4, NT5, NT7, PQ1.CHU, PQ2.CHU, PQ18.CHU, HV5: xem trước link xin lịch ở A8.
-- Cần đăng nhập. Trả tên sale, số (chỉ khi sale đã cho), đã kết nối chưa. Link không dùng được chỉ trả trang_thai.
create or replace function public.fn_xem_link_xin_lich(p_ma text) returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_nguoi uuid := public.can_dang_nhap();
  v_link public.link_xin_lich;
begin
  select l.* into v_link from public.link_xin_lich l where l.ma = coalesce(p_ma, '');
  if not public.link_xin_lich_dung_duoc(v_link, v_nguoi) then
    return jsonb_build_object('trang_thai', 'khong_dung_duoc');
  end if;
  return (
    select jsonb_build_object(
             'trang_thai', 'hop_le',
             'ten_sale', coalesce(p.ten_hien_thi, p.ten),
             'so_dien_thoai', p.so_dien_thoai,
             'da_ket_noi', exists (select 1 from public.ket_noi k
                                   where k.chu_id = v_nguoi and k.sale_id = v_link.sale_id and k.trang_thai = 'da_ket_noi'))
    from public.profiles p where p.id = v_link.sale_id);
end $$;

-- YC6.5 bước 2, YC6.5-NT2, NT3, NT4, NT6, NT7, YC6-H17, H18, QD7, PQ17.CHU, PQ19: chủ nhà bấm "Đồng ý cho xem lịch".
-- Người gọi là chủ nhà của kết nối. Chưa có: tạo đã kết nối, nguồn sale xin, tất cả căn, cọc theo công tắc, báo sale.
-- Đã kết nối: giữ nguyên, không báo. Sale bỏ hay chưa kết nối: thành đã kết nối như đồng ý mới. Chủ đã ngừng: từ chối.
-- Người gọi chưa ở vai chủ nhà thì chuyển sang vai chủ nhà (YC6.5 r8).
create or replace function public.fn_dong_y_xin_lich(p_ma text, p_xem_coc boolean default true) returns jsonb
language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_nguoi uuid := public.can_dang_nhap();
  v_link public.link_xin_lich;
  v_k public.ket_noi%rowtype;
  v_ket_qua text;
  v_id uuid;
  v_so_can integer;
begin
  if not exists (select 1 from public.profiles p
                 where p.id = v_nguoi and p.ten is not null and p.so_dien_thoai is not null and p.da_xoa_luc is null) then
    raise exception 'Nhập tên và số điện thoại trước.' using errcode = '42501';
  end if;
  if p_xem_coc is null then
    raise exception 'Chưa chọn bật hay tắt Tình trạng cọc' using errcode = 'P0001';
  end if;
  select l.* into v_link from public.link_xin_lich l where l.ma = coalesce(p_ma, '');
  if not public.link_xin_lich_dung_duoc(v_link, v_nguoi) then
    raise exception 'Bạn không còn xem được mục này' using errcode = 'P0001';
  end if;

  -- Khóa theo cặp để hai lần bấm cùng lúc không ghi hai thông báo.
  perform pg_advisory_xact_lock(hashtext('ket_noi:' || v_nguoi::text || ':' || v_link.sale_id::text));
  select * into v_k from public.ket_noi where chu_id = v_nguoi and sale_id = v_link.sale_id for update;
  if found and v_k.trang_thai = 'da_ket_noi' then
    v_ket_qua := 'da_co';
  elsif found then
    -- chu_ngung đã bị chặn ở link_xin_lich_dung_duoc; còn chua_ket_noi, sale_bo.
    delete from public.ket_noi_can where ket_noi_id = v_k.id;
    update public.ket_noi set trang_thai = 'da_ket_noi', nguon = 'sale_xin', pham_vi = 'tat_ca', xem_coc = p_xem_coc,
                              ngung_luc = null, sua_luc = now()
    where id = v_k.id;
    v_id := v_k.id;
    v_ket_qua := 'da_ket_noi';
  else
    insert into public.ket_noi (chu_id, sale_id, trang_thai, nguon, pham_vi, xem_coc)
    values (v_nguoi, v_link.sale_id, 'da_ket_noi', 'sale_xin', 'tat_ca', p_xem_coc)
    returning id into v_id;
    v_ket_qua := 'da_ket_noi';
  end if;

  select count(*)::integer into v_so_can from public.can c
  where c.nguoi_giu = v_nguoi and c.loai = 'co_lich' and c.an_luc is null;

  if v_ket_qua = 'da_ket_noi' then
    -- YC12, YC6 Dữ liệu: thông báo "chủ đồng ý kết nối" chỉ có tên chủ nhà và số căn, không giá, không số điện thoại.
    insert into public.thong_bao (nguoi_nhan, loai, noi_dung, doi_tuong_loai, doi_tuong_id)
    select v_link.sale_id, 'chu_dong_y_ket_noi',
           jsonb_build_object('ten_chu', coalesce(p.ten_hien_thi, p.ten), 'so_can', v_so_can), 'ket_noi', v_id
    from public.profiles p where p.id = v_nguoi;
  end if;

  update public.profiles
  set vai_chon = 'chu_nha', dong_y_dieu_khoan_luc = coalesce(dong_y_dieu_khoan_luc, now()), sua_luc = now()
  where id = v_nguoi and vai_chon is distinct from 'chu_nha';

  return (select jsonb_build_object('ket_qua', v_ket_qua, 'ten_sale', coalesce(p.ten_hien_thi, p.ten), 'co_can', v_so_can > 0)
          from public.profiles p where p.id = v_link.sale_id);
end $$;

revoke execute on function public.link_xin_lich_dung_duoc(public.link_xin_lich, uuid), public.fn_xem_link_xin_lich(text),
  public.fn_dong_y_xin_lich(text, boolean) from public, anon, authenticated;
-- YC6.5-NT5: link xin lịch cần đăng nhập, anon không gọi được.
grant execute on function public.fn_xem_link_xin_lich(text), public.fn_dong_y_xin_lich(text, boolean) to authenticated;
