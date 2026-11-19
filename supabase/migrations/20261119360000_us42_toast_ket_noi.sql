-- US42 · Toast báo kết nối cho sale (YC6.8 r11). Chỉ thêm, không sửa migration cũ.
-- Thông báo "chủ đồng ý kết nối" có tên chủ nhà, tòa và mã căn; nhiều chủ nhà đồng ý trong 10 phút thì gom một dòng
-- (giả định GD15, YC6-H19, H20 Claude tự chốt). Sale đọc qua RLS thong_bao_doc; đánh dấu đã đọc là việc của YC12.

-- YC6.8 bước 1, 2, YC6.8-NT2, NT3, YC6 Dữ liệu, PQ17.SALE, PQ19: ghi thông báo đồng ý kết nối cho sale.
-- Gom vào dòng chưa đọc của sale tạo chưa quá 10 phút (giữ tao_luc), trừ khi chủ nhà này đã có trong dòng đó
-- (đồng ý lại sau khi sale bỏ là lần mới, YC6.5-NT6). Dòng cũ không có cac_chu (trước US42) không gom.
-- Căn theo phạm vi kết nối: tối đa 3 căn theo thứ tự mã kèm tòa, và số căn.
create or replace function public.ghi_thong_bao_dong_y(p_chu uuid, p_sale uuid, p_ket_noi uuid) returns void
language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_k public.ket_noi%rowtype;
  v_so_can integer;
  v_cac_can jsonb;
  v_chu jsonb;
  v_dong public.thong_bao%rowtype;
begin
  select * into v_k from public.ket_noi where id = p_ket_noi and chu_id = p_chu and sale_id = p_sale;
  if not found then return; end if;
  -- Hai chủ nhà đồng ý cùng lúc cho một sale: lần sau chờ lần trước ghi xong để gom đúng một dòng.
  perform pg_advisory_xact_lock(hashtext('thong_bao_ket_noi:' || p_sale::text));

  with cac as (
    select c.ma_can, t.ten as toa
    from public.can c left join public.toa_nha t on t.id = c.toa_nha_id
    where c.nguoi_giu = p_chu and c.loai = 'co_lich' and c.an_luc is null
      and (v_k.pham_vi = 'tat_ca'
           or exists (select 1 from public.ket_noi_can kc where kc.ket_noi_id = v_k.id and kc.can_id = c.id))
  )
  select count(*)::integer,
         coalesce((select jsonb_agg(jsonb_build_object('toa', x.toa, 'ma', x.ma_can) order by x.ma_can)
                   from (select * from cac order by ma_can limit 3) x), '[]'::jsonb)
  into v_so_can, v_cac_can
  from cac;

  select jsonb_build_object('ten', coalesce(p.ten_hien_thi, p.ten), 'so_can', v_so_can, 'cac_can', v_cac_can)
  into v_chu from public.profiles p where p.id = p_chu;

  select tb.* into v_dong from public.thong_bao tb
  where tb.nguoi_nhan = p_sale and tb.loai = 'chu_dong_y_ket_noi' and tb.doc_luc is null
    and tb.tao_luc >= now() - interval '10 minutes'
    and tb.noi_dung ? 'cac_chu'
  order by tb.tao_luc desc
  limit 1
  for update;

  if found and not (coalesce(v_dong.noi_dung -> 'ket_noi', '[]'::jsonb) ? p_ket_noi::text) then
    update public.thong_bao
    set noi_dung = v_dong.noi_dung
                   || jsonb_build_object(
                        'so_can', coalesce((v_dong.noi_dung ->> 'so_can')::integer, 0) + v_so_can,
                        'so_chu', jsonb_array_length(v_dong.noi_dung -> 'cac_chu') + 1,
                        'cac_chu', (v_dong.noi_dung -> 'cac_chu') || jsonb_build_array(v_chu),
                        'ket_noi', coalesce(v_dong.noi_dung -> 'ket_noi', '[]'::jsonb) || jsonb_build_array(p_ket_noi))
    where id = v_dong.id;
  else
    insert into public.thong_bao (nguoi_nhan, loai, noi_dung, doi_tuong_loai, doi_tuong_id)
    values (p_sale, 'chu_dong_y_ket_noi',
            jsonb_build_object('ten_chu', v_chu ->> 'ten', 'so_can', v_so_can, 'so_chu', 1,
                               'cac_chu', jsonb_build_array(v_chu), 'ket_noi', jsonb_build_array(p_ket_noi)),
            'ket_noi', p_ket_noi);
  end if;
end $$;

-- YC6.5 bước 2, YC6.5-NT2, NT3, NT4, NT6, NT7, YC6-H17, H18, QD7, PQ17.CHU, PQ19: chủ nhà bấm "Đồng ý cho xem lịch".
-- Người gọi là chủ nhà của kết nối. Chưa có: tạo đã kết nối, nguồn sale xin, tất cả căn, cọc theo công tắc, báo sale.
-- Đã kết nối: giữ nguyên, không báo. Sale bỏ hay chưa kết nối: thành đã kết nối như đồng ý mới. Chủ đã ngừng: từ chối.
-- Người gọi chưa ở vai chủ nhà thì chuyển sang vai chủ nhà (YC6.5 r8). US42: thông báo qua ghi_thong_bao_dong_y (YC6.8).
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
    -- YC6.8: ghi hay gom thông báo "chủ đồng ý kết nối" (tên chủ, tòa, mã căn; không giá, không số điện thoại).
    perform public.ghi_thong_bao_dong_y(v_nguoi, v_link.sale_id, v_id);
  end if;

  update public.profiles
  set vai_chon = 'chu_nha', dong_y_dieu_khoan_luc = coalesce(dong_y_dieu_khoan_luc, now()), sua_luc = now()
  where id = v_nguoi and vai_chon is distinct from 'chu_nha';

  return (select jsonb_build_object('ket_qua', v_ket_qua, 'ten_sale', coalesce(p.ten_hien_thi, p.ten), 'co_can', v_so_can > 0)
          from public.profiles p where p.id = v_link.sale_id);
end $$;

revoke execute on function public.ghi_thong_bao_dong_y(uuid, uuid, uuid) from public, anon, authenticated;
revoke execute on function public.fn_dong_y_xin_lich(text, boolean) from public, anon;
grant execute on function public.fn_dong_y_xin_lich(text, boolean) to authenticated;
