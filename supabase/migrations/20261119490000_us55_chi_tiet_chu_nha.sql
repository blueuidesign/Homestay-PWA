-- US55 · Chi tiết chủ nhà và bỏ nguồn (YC10.2). S6-04 đọc một kết nối của sale; bỏ nguồn; dòng chủ đã ngừng cho xem ở tab Căn.
-- Chỉ thêm, không sửa migration cũ. Sale không đọc bảng booking (KT-DB.3.5): số đặt phòng, tiền chênh tính trong hàm.
-- Vi phạm quyền: 42501 (không phải của mình cũng như không có). Dữ liệu sai: P0001.

-- YC10.2 bước 1 đến 4, YC10.2-NT1, NT5, NT7, YC10-H6, QD7, QD13, QT3.1, PQ1.SALE, PQ2.SALE, PQ3.SALE, PQ8.SALE, PQ15.SALE,
-- PQ17.SALE, PQ23.SALE, HV5, KT-DB.3.3: chi tiết một kết nối của người gọi (vai sale). Căn lấy từ my_shared_can_ids,
-- giá là giá chủ đêm p_ngay (mặc định hôm nay). Chủ ngừng hay xóa tài khoản: chỉ trạng thái, lý do, tên.
create or replace function public.fn_chi_tiet_chu_nha(p_ket_noi_id uuid, p_ngay date default null) returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_nguoi uuid := public.can_dang_nhap();
  v_ngay date := coalesce(p_ngay, public.local_today());
  v_k public.ket_noi%rowtype;
  v_chu public.profiles%rowtype;
begin
  select * into v_k from public.ket_noi
  where id = p_ket_noi_id and sale_id = v_nguoi and trang_thai in ('da_ket_noi', 'chu_ngung');
  if not found then
    raise exception 'Không tìm thấy chủ nhà' using errcode = '42501';
  end if;
  select * into v_chu from public.profiles where id = v_k.chu_id;
  if v_k.trang_thai = 'chu_ngung' or v_chu.da_xoa_luc is not null then
    return jsonb_build_object(
      'trang_thai', 'khong_con_quyen',
      'ly_do', case when v_k.trang_thai = 'chu_ngung' then 'chu_ngung' else 'chu_xoa_tai_khoan' end,
      'ket_noi_id', v_k.id, 'chu_id', v_k.chu_id, 'ten_chu', coalesce(v_chu.ten_hien_thi, v_chu.ten));
  end if;
  return (
    with can_xem as (
      select c.* from public.can c
      where c.nguoi_giu = v_k.chu_id and c.id in (select s from public.my_shared_can_ids() s)
    ),
    ban as (
      select count(*)::int as so,
             coalesce(sum(coalesce(r.tien_thu_khach, b.tien_phong) - b.tien_phong), 0)::bigint as chenh
      from public.booking b
      join public.can c on c.id = b.can_id
      left join public.booking_rieng r on r.booking_id = b.id and r.nguoi_id = v_nguoi
      where c.nguoi_giu = v_k.chu_id and b.sale_id = v_nguoi and b.trang_thai <> 'da_huy'
    )
    select jsonb_build_object(
      'trang_thai', 'da_ket_noi', 'ket_noi_id', v_k.id, 'chu_id', v_k.chu_id,
      'ten_chu', coalesce(v_chu.ten_hien_thi, v_chu.ten), 'so_dien_thoai', v_chu.so_dien_thoai,
      'ket_noi_tu', (v_k.tao_luc at time zone 'Asia/Ho_Chi_Minh')::date,
      'cap_nhat_luc', (select max(cx.lich_doi_luc) from can_xem cx),
      'xem_coc', v_k.xem_coc,
      'can', coalesce((select jsonb_agg(jsonb_build_object(
                         'can_id', cx.id, 'ma_can', cx.ma_can, 'ten_toa', tn.ten, 'so_phong_ngu', cx.so_phong_ngu,
                         'so_giuong', cx.so_giuong, 'loai_view', cx.loai_view,
                         'gia_dem', public.gia_chu_dem(cx.id, v_ngay)) order by cx.ma_can)
                       from can_xem cx left join public.toa_nha tn on tn.id = cx.toa_nha_id), '[]'::jsonb),
      'so_dat_phong', ban.so, 'tien_chenh', ban.chenh)
    from ban
  );
end $$;

-- YC10.2 bước 6, YC10.2-NT4, NT5, NT8, YC10-H8, YC10 "Dữ liệu", PQ7.SALE, PQ10.SALE, PQ17.SALE, KT-DB.3.3: sale bỏ nguồn.
-- Kết nối sang 'sale_bo' (my_shared_can_ids thôi trả căn của chủ đó); yêu cầu chờ của người gọi tới căn chủ đó sang 'da_huy'.
-- Đặt phòng đã chốt giữ nguyên. Không ghi thông báo cho chủ.
create or replace function public.fn_sale_bo_nguon(p_ket_noi_id uuid) returns void
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
  if v_k.trang_thai <> 'da_ket_noi' then
    raise exception 'Chủ nhà này không còn ở nguồn phòng' using errcode = 'P0001';
  end if;
  update public.ket_noi set trang_thai = 'sale_bo', ngung_luc = now(), sua_luc = now() where id = v_k.id;
  update public.yeu_cau_dat_phong y set trang_thai = 'da_huy', tra_loi_luc = now()
  where y.sale_id = v_nguoi and y.trang_thai = 'cho'
    and y.can_id in (select c.id from public.can c where c.nguoi_giu = v_k.chu_id);
end $$;

-- YC10.1 bước 10, YC10.2-NT6, YC10-H1, YC10 "Bấm hai lần", PQ17.SALE, PQ23.SALE, QD13: sale bỏ dòng chủ đã xóa tài khoản
-- hay chủ đã ngừng cho xem. Kết nối sang 'sale_bo' (đặt phòng giữ nguyên). Thay hàm của US54.
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
  if v_k.trang_thai not in ('da_ket_noi', 'chu_ngung') then
    raise exception 'Chủ nhà này không còn ở nguồn phòng' using errcode = 'P0001';
  end if;
  if v_k.trang_thai = 'da_ket_noi'
     and not exists (select 1 from public.profiles p where p.id = v_k.chu_id and p.da_xoa_luc is not null) then
    raise exception 'Chỉ bỏ được dòng của chủ nhà đã xóa tài khoản' using errcode = 'P0001';
  end if;
  update public.ket_noi set trang_thai = 'sale_bo', ngung_luc = coalesce(ngung_luc, now()), sua_luc = now()
  where id = v_k.id;
end $$;

-- YC10.1 bước 1, 2, 3, 9, YC10.2-NT6, YC10-H1, QD7, QD13, PQ3.SALE, PQ17.SALE, PQ23.SALE, KT-DB.3.3, KT-DB.3.5: tab Căn của
-- sale như US54, thêm cột chu_ngung: kết nối chủ đã ngừng cho xem trả một dòng, chỉ tên và cờ. Đổi kiểu trả về nên xóa rồi tạo.
drop function public.fn_tab_can_sale();
create function public.fn_tab_can_sale()
returns table (
  nhom text, can_id uuid, ma_can text, ten_toa text, so_phong_ngu smallint, so_giuong smallint, loai_view text,
  khach_den date, ket_noi_id uuid, chu_id uuid, ten_chu text, chu_da_xoa_tai_khoan boolean, cap_nhat_luc timestamptz,
  chu_can_ten text, chu_ngung boolean
)
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_nguoi uuid := public.can_dang_nhap();
  v_nay date := public.local_today();
begin
  return query
  with nguon as (
    select c.id, c.nguoi_giu, c.ma_can, c.toa_nha_id, c.so_phong_ngu, c.so_giuong, c.loai_view,
           max(c.lich_doi_luc) over (partition by c.nguoi_giu) as cap_nhat
    from public.can c
    where c.id in (select s from public.my_shared_can_ids() s)
  )
  select case when c.loai = 'co_lich' then 'cua_toi' else 'tu_nhap' end, c.id, c.ma_can, tn.ten,
         c.so_phong_ngu, c.so_giuong, c.loai_view,
         case when c.loai = 'co_lich' then
           (select max(b.ngay_tra) from public.booking b
             where b.can_id = c.id and b.trang_thai <> 'da_huy' and b.dem @> v_nay) end,
         null::uuid, null::uuid, null::text, null::boolean, null::timestamptz,
         case when c.loai = 'tu_nhap' then c.chu_can_ten end, false
  from public.can c
  left join public.toa_nha tn on tn.id = c.toa_nha_id
  where c.nguoi_giu = v_nguoi and c.an_luc is null
  union all
  select 'nguon', n.id, n.ma_can, tn.ten, n.so_phong_ngu, n.so_giuong, n.loai_view, null::date,
         k.id, k.chu_id, chu.ten_hien_thi, false, n.cap_nhat, null::text, false
  from nguon n
  join public.ket_noi k on k.chu_id = n.nguoi_giu and k.sale_id = v_nguoi and k.trang_thai = 'da_ket_noi'
  join public.profiles chu on chu.id = k.chu_id
  left join public.toa_nha tn on tn.id = n.toa_nha_id
  union all
  -- Chủ đã xóa tài khoản (QD13) hay đã ngừng cho xem (YC10-H1): tên và cờ, không gì khác.
  select 'nguon', null::uuid, null::text, null::text, null::smallint, null::smallint, null::text, null::date,
         k.id, k.chu_id, chu.ten_hien_thi, (chu.da_xoa_luc is not null), null::timestamptz, null::text,
         (k.trang_thai = 'chu_ngung')
  from public.ket_noi k
  join public.profiles chu on chu.id = k.chu_id
  where k.sale_id = v_nguoi
    and (k.trang_thai = 'chu_ngung' or (k.trang_thai = 'da_ket_noi' and chu.da_xoa_luc is not null));
end $$;

revoke execute on function public.fn_chi_tiet_chu_nha(uuid, date), public.fn_sale_bo_nguon(uuid),
  public.fn_sale_bo_dong_chu(uuid), public.fn_tab_can_sale() from public, anon, authenticated;
grant execute on function public.fn_chi_tiet_chu_nha(uuid, date), public.fn_sale_bo_nguon(uuid),
  public.fn_sale_bo_dong_chu(uuid), public.fn_tab_can_sale() to authenticated;
