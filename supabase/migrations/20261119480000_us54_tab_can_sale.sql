-- US54 · Tab Căn của sale (YC10.1). Đọc ba nhóm căn, chi tiết căn của tôi (S6-07), bỏ dòng chủ nhà đã xóa tài khoản.
-- Chỉ thêm, không sửa migration cũ. Sale không đọc bảng booking (KT-DB.3.5): tình trạng và lịch tính trong hàm.
-- Vi phạm quyền: 42501 (không phải của mình cũng như không có). Dữ liệu sai: P0001.

-- YC10.1 bước 1, 2, 3, 9, YC10.1-NT1, NT2, NT3, NT7, NT11, YC10-H2, YC10-H5, YC10 "Dữ liệu", QD5, QD7, QD11, QD13, PQ1.SALE,
-- PQ2.SALE, PQ3.SALE, PQ13, PQ14.SALE, PQ17.SALE, PQ23.SALE, KT-DB.3.3, KT-DB.3.5.
-- nhom 'cua_toi' (căn có lịch của người gọi), 'nguon' (mỗi căn được chia sẻ một dòng, kèm chủ nhà), 'tu_nhap'.
-- Chủ đã xóa tài khoản: một dòng chỉ tên và cờ. Chỉ kết nối 'da_ket_noi' (sale_bo không nối lại). Không giá, không số điện thoại.
create or replace function public.fn_tab_can_sale()
returns table (
  nhom text, can_id uuid, ma_can text, ten_toa text, so_phong_ngu smallint, so_giuong smallint, loai_view text,
  khach_den date, ket_noi_id uuid, chu_id uuid, ten_chu text, chu_da_xoa_tai_khoan boolean, cap_nhat_luc timestamptz,
  chu_can_ten text
)
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_nguoi uuid := public.can_dang_nhap();
  v_nay date := public.local_today();
begin
  return query
  with chia_se as (
    select s.id from public.my_shared_can_ids() s(id)
  ),
  nguon as (
    select c.id, c.nguoi_giu, c.ma_can, c.toa_nha_id, c.so_phong_ngu, c.so_giuong, c.loai_view,
           max(c.lich_doi_luc) over (partition by c.nguoi_giu) as cap_nhat
    from public.can c
    where c.id in (select id from chia_se)
  )
  -- Căn của tôi, căn tự nhập.
  select case when c.loai = 'co_lich' then 'cua_toi' else 'tu_nhap' end, c.id, c.ma_can, tn.ten,
         c.so_phong_ngu, c.so_giuong, c.loai_view,
         case when c.loai = 'co_lich' then
           (select max(b.ngay_tra) from public.booking b
             where b.can_id = c.id and b.trang_thai <> 'da_huy' and b.dem @> v_nay) end,
         null::uuid, null::uuid, null::text, null::boolean, null::timestamptz,
         case when c.loai = 'tu_nhap' then c.chu_can_ten end
  from public.can c
  left join public.toa_nha tn on tn.id = c.toa_nha_id
  where c.nguoi_giu = v_nguoi and c.an_luc is null
  union all
  -- Nguồn phòng: chủ còn tài khoản, mỗi căn được chia sẻ một dòng.
  select 'nguon', n.id, n.ma_can, tn.ten, n.so_phong_ngu, n.so_giuong, n.loai_view, null::date,
         k.id, k.chu_id, chu.ten_hien_thi, false, n.cap_nhat, null::text
  from nguon n
  join public.ket_noi k on k.chu_id = n.nguoi_giu and k.sale_id = v_nguoi and k.trang_thai = 'da_ket_noi'
  join public.profiles chu on chu.id = k.chu_id
  left join public.toa_nha tn on tn.id = n.toa_nha_id
  union all
  -- Chủ đã xóa tài khoản: tên và cờ, không gì khác (QD13).
  select 'nguon', null::uuid, null::text, null::text, null::smallint, null::smallint, null::text, null::date,
         k.id, k.chu_id, chu.ten_hien_thi, true, null::timestamptz, null::text
  from public.ket_noi k
  join public.profiles chu on chu.id = k.chu_id
  where k.sale_id = v_nguoi and k.trang_thai = 'da_ket_noi' and chu.da_xoa_luc is not null;
end $$;

-- YC10.1 bước 7, YC10.1-NT5, NT6, QD5, PQ3.CHU, PQ4, PQ5, PQ13: chi tiết căn có lịch, chưa ẩn của người gọi cho S6-07.
-- 7 đêm từ p_tu: ô kín hay trống và giá đêm của người gọi (giá chủ, vì sale là chủ căn này). Không phải căn của mình: 42501.
create or replace function public.fn_chi_tiet_can_cua_toi(p_can_id uuid, p_tu date) returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_nguoi uuid := public.can_dang_nhap();
  v_can public.can%rowtype;
  v_toa text;
begin
  select * into v_can from public.can
  where id = p_can_id and nguoi_giu = v_nguoi and loai = 'co_lich' and an_luc is null;
  if not found then
    raise exception 'Không tìm thấy căn' using errcode = '42501';
  end if;
  if p_tu is null then
    raise exception 'Chưa chọn ngày' using errcode = 'P0001';
  end if;
  select tn.ten into v_toa from public.toa_nha tn where tn.id = v_can.toa_nha_id;
  return jsonb_build_object(
    'can_id', v_can.id, 'ma_can', v_can.ma_can, 'ten_toa', v_toa, 'so_phong_ngu', v_can.so_phong_ngu,
    'so_giuong', v_can.so_giuong, 'loai_view', v_can.loai_view,
    'anh', coalesce((select jsonb_agg(a.duong_dan order by a.thu_tu nulls last, a.tao_luc)
                     from public.anh_can a where a.can_id = v_can.id), '[]'::jsonb),
    'dem', (select jsonb_agg(jsonb_build_object('ngay', d.dem, 'o', public.o_lich(v_can.id, d.dem),
                                                'gia', public.gia_chu_dem(v_can.id, d.dem)) order by d.dem)
            from (select g::date as dem from generate_series(p_tu, p_tu + 6, interval '1 day') g) d)
  );
end $$;

-- YC10.1 bước 10, YC10.1-NT8, NT11, YC10 "Bấm hai lần", YC10-H5, PQ17.SALE, PQ23.SALE, QD13: sale bỏ dòng chủ nhà đã xóa
-- tài khoản. Kết nối sang 'sale_bo' (đặt phòng giữ nguyên); chủ đăng ký lại cũng không nối lại.
create or replace function public.fn_sale_bo_dong_chu(p_ket_noi_id uuid) returns void
language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_nguoi uuid := public.can_dang_nhap();
  v_k public.ket_noi%rowtype;
begin
  select * into v_k from public.ket_noi where id = p_ket_noi_id and sale_id = v_nguoi for update;
  if not found then
    raise exception 'Không tìm thấy chủ nhà' using errcode = '42501';
  end if;
  if not exists (select 1 from public.profiles p where p.id = v_k.chu_id and p.da_xoa_luc is not null) then
    raise exception 'Chỉ bỏ được dòng của chủ nhà đã xóa tài khoản' using errcode = 'P0001';
  end if;
  update public.ket_noi set trang_thai = 'sale_bo', ngung_luc = now(), sua_luc = now() where id = v_k.id;
end $$;

revoke execute on function public.fn_tab_can_sale(), public.fn_chi_tiet_can_cua_toi(uuid, date),
  public.fn_sale_bo_dong_chu(uuid) from public, anon, authenticated;
grant execute on function public.fn_tab_can_sale(), public.fn_chi_tiet_can_cua_toi(uuid, date),
  public.fn_sale_bo_dong_chu(uuid) to authenticated;
