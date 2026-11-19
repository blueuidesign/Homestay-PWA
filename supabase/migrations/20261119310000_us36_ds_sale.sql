-- US36 · Danh sách sale của chủ nhà (YC6.2). Đọc danh sách, đặt phòng của một sale; thêm, xóa sale tay; ngừng cho xem;
-- bật tắt "Tình trạng cọc"; bỏ dòng sale đã xóa tài khoản; sale đọc đã cọc hay chưa. Chỉ thêm, không sửa migration cũ.
-- Vi phạm quyền: 42501 (không phải của mình cũng như không có). Dữ liệu sai: P0001 kèm câu của Luật kiểm (QT5.5).

-- YC6.2 bước 6, YC6-H16: ngày chủ ngừng cho xem (hiện ở dòng "Đã ngừng").
alter table public.ket_noi add column ngung_luc timestamptz;

-- YC6.2 bước 1, 4, 5, 7, PQ1.CHU, PQ2.CHU, PQ17.CHU, PQ23.CHU, QD13: mỗi dòng một sale của người gọi.
-- nhom: da_ket_noi; chua_ket_noi (kết nối chưa thành hay sale thêm tay); da_ngung (chủ ngừng, sale bỏ).
-- Số điện thoại chỉ khi sale đã cho và chưa xóa tài khoản; sale bỏ thì không trả số. xem_coc chỉ có với dòng đang kết nối.
-- Tổng tiền phòng: các đặt phòng chưa hủy của sale đó ở căn của người gọi (không có giá bán, tiền chênh: PQ11.CHU).
create or replace function public.fn_ds_sale_cua_toi()
returns table (id uuid, loai text, sale_id uuid, ten text, so_dien_thoai text, nhom text, da_xoa_tai_khoan boolean,
               xem_coc boolean, so_dat_phong int, tong_tien_phong bigint, ket_noi_luc timestamptz, ngung_luc timestamptz)
language plpgsql stable security definer set search_path = ''
as $$
declare v_nguoi uuid := public.can_dang_nhap();
begin
  return query
  with tien as (
    select b.sale_id, count(*)::int as so, coalesce(sum(b.tien_phong), 0)::bigint as tong
    from public.booking b
    join public.can c on c.id = b.can_id
    where c.nguoi_giu = v_nguoi and b.sale_id is not null and b.trang_thai <> 'da_huy'
    group by b.sale_id
  )
  select k.id, 'ket_noi'::text, k.sale_id, coalesce(p.ten_hien_thi, p.ten),
         case when p.da_xoa_luc is null and k.trang_thai <> 'sale_bo' then p.so_dien_thoai end,
         case k.trang_thai when 'da_ket_noi' then 'da_ket_noi' when 'chua_ket_noi' then 'chua_ket_noi' else 'da_ngung' end,
         (p.da_xoa_luc is not null),
         case when k.trang_thai = 'da_ket_noi' then k.xem_coc end,
         coalesce(t.so, 0), coalesce(t.tong, 0::bigint), k.tao_luc, k.ngung_luc
  from public.ket_noi k
  join public.profiles p on p.id = k.sale_id
  left join tien t on t.sale_id = k.sale_id
  where k.chu_id = v_nguoi
  union all
  select s.id, 'them_tay'::text, null::uuid, s.ten, s.so_dien_thoai, 'chua_ket_noi'::text, false, null::boolean,
         0, 0::bigint, null::timestamptz, null::timestamptz
  from public.sale_them_tay s
  where s.chu_id = v_nguoi;
end $$;

-- YC6.2 bước 5, YC6-H16, PQ7.CHU, PQ8.CHU, PQ17.CHU: đặt phòng của một sale ở căn của người gọi (kể cả căn đã ẩn, đã hủy).
-- Không có tiền cọc, khách, giá bán: chỉ trạng thái và tiền phòng.
create or replace function public.fn_dat_phong_cua_sale(p_sale_id uuid)
returns table (id uuid, can_id uuid, ma_can text, ngay_nhan date, ngay_tra date, tien_phong bigint, trang_thai text,
               trang_thai_tien text)
language plpgsql stable security definer set search_path = ''
as $$
declare v_nguoi uuid := public.can_dang_nhap();
begin
  return query
  select b.id, b.can_id, c.ma_can, b.ngay_nhan, b.ngay_tra, b.tien_phong, b.trang_thai, b.trang_thai_tien
  from public.booking b
  join public.can c on c.id = b.can_id
  where c.nguoi_giu = v_nguoi and b.sale_id = p_sale_id
  order by b.ngay_nhan, b.tao_luc;
end $$;

-- YC6.2 bước 4, Luật kiểm, YC6-H11, PQ17.CHU, YC6 Dữ liệu: sale thêm tay của người gọi. Không ghép với tài khoản cùng số,
-- không chặn số trùng. Tên bỏ khoảng trắng đầu cuối; số bỏ khoảng trắng, dấu chấm, gạch rồi mới kiểm và lưu.
create or replace function public.fn_them_sale_tay(p_ten text, p_so text) returns uuid
language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_nguoi uuid := public.can_dang_nhap();
  v_ten text := btrim(coalesce(p_ten, ''), E' \t\r\n');
  v_so text := regexp_replace(coalesce(p_so, ''), '[[:space:].-]', '', 'g');
  v_id uuid;
begin
  if v_ten = '' then
    raise exception 'Cần nhập tên sale' using errcode = 'P0001';
  end if;
  if char_length(v_ten) > 100 then
    raise exception 'Tên dài tối đa 100 ký tự' using errcode = 'P0001';
  end if;
  if v_so !~ '^0[0-9]{9}$' then
    raise exception 'Số điện thoại chưa đúng (10 chữ số, bắt đầu bằng 0)' using errcode = 'P0001';
  end if;
  insert into public.sale_them_tay (chu_id, ten, so_dien_thoai) values (v_nguoi, v_ten, v_so) returning id into v_id;
  return v_id;
end $$;

-- YC6.2-NT8, YC6-H4, PQ17.CHU: xóa sale thêm tay của chính người gọi. Kết nối không xóa bằng lệnh này.
create or replace function public.fn_xoa_sale_tay(p_id uuid) returns void
language plpgsql volatile security definer set search_path = ''
as $$
declare v_nguoi uuid := public.can_dang_nhap();
begin
  delete from public.sale_them_tay where id = p_id and chu_id = v_nguoi;
  if not found then
    raise exception 'Không tìm thấy sale' using errcode = '42501';
  end if;
end $$;

-- YC6.2 bước 6, YC6.2-NT4, NT6, QD7, PQ17.CHU, PQ19, YC6 quy tắc "Ngừng cho xem": chủ ngừng một kết nối đang hiệu lực.
-- Sale mất quyền xem qua my_shared_can_ids (chỉ tính 'da_ket_noi'); đặt phòng cũ giữ. Ghi một thông báo cho sale;
-- gửi lại khi đã ngừng thì trả 'chu_ngung', không ghi lần hai.
create or replace function public.fn_ngung_cho_xem(p_ket_noi_id uuid) returns text
language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_nguoi uuid := public.can_dang_nhap();
  v_k public.ket_noi%rowtype;
begin
  select * into v_k from public.ket_noi where id = p_ket_noi_id and chu_id = v_nguoi for update;
  if not found then
    raise exception 'Không tìm thấy sale' using errcode = '42501';
  end if;
  if v_k.trang_thai = 'chu_ngung' then
    return 'chu_ngung';
  end if;
  if v_k.trang_thai <> 'da_ket_noi' then
    raise exception 'Sale này không ở nhóm Đã kết nối' using errcode = 'P0001';
  end if;
  update public.ket_noi set trang_thai = 'chu_ngung', ngung_luc = now(), sua_luc = now() where id = v_k.id;
  insert into public.thong_bao (nguoi_nhan, loai, noi_dung, doi_tuong_loai, doi_tuong_id)
  select v_k.sale_id, 'chu_ngung_cho_xem', jsonb_build_object('ten_chu', p.ten_hien_thi), 'ket_noi', v_k.id
  from public.profiles p where p.id = v_nguoi;
  return 'chu_ngung';
end $$;

-- YC6.2 bước 5, YC6.2-NT5, NT6, NT9, QD7, PQ8.SALE, PQ17.CHU: quyền duy nhất chủ bật tắt cho từng sale là "Tình trạng cọc".
-- Chỉ với kết nối đang hiệu lực (dòng đã ngừng không có công tắc).
create or replace function public.fn_dat_xem_coc(p_ket_noi_id uuid, p_bat boolean) returns boolean
language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_nguoi uuid := public.can_dang_nhap();
  v_k public.ket_noi%rowtype;
begin
  select * into v_k from public.ket_noi where id = p_ket_noi_id and chu_id = v_nguoi for update;
  if not found then
    raise exception 'Không tìm thấy sale' using errcode = '42501';
  end if;
  if v_k.trang_thai <> 'da_ket_noi' then
    raise exception 'Chỉ đổi được quyền của sale đang kết nối' using errcode = 'P0001';
  end if;
  if p_bat is null then
    raise exception 'Chưa chọn bật hay tắt' using errcode = 'P0001';
  end if;
  update public.ket_noi set xem_coc = p_bat, sua_luc = now() where id = v_k.id;
  return p_bat;
end $$;

-- YC6.2 bước 7, YC6-H1, PQ23.CHU, QD13: chủ bỏ dòng sale đã xóa tài khoản. Xóa dòng kết nối; đặt phòng giữ nguyên.
-- Sale chưa xóa tài khoản (kể cả đã ngừng) thì không bỏ được (YC6-H16).
create or replace function public.fn_bo_dong_sale(p_ket_noi_id uuid) returns void
language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_nguoi uuid := public.can_dang_nhap();
  v_k public.ket_noi%rowtype;
begin
  select * into v_k from public.ket_noi where id = p_ket_noi_id and chu_id = v_nguoi for update;
  if not found then
    raise exception 'Không tìm thấy sale' using errcode = '42501';
  end if;
  if not exists (select 1 from public.profiles p where p.id = v_k.sale_id and p.da_xoa_luc is not null) then
    raise exception 'Chỉ bỏ được dòng của sale đã xóa tài khoản' using errcode = 'P0001';
  end if;
  delete from public.ket_noi where id = v_k.id;
end $$;

-- YC6.2-NT5, QD7, PQ8.SALE: sale đọc đặt phòng của mình đã cọc hay chưa (đã thanh toán tính là đã cọc).
-- null khi chủ tắt "Tình trạng cọc", không còn dòng kết nối, hay không phải đặt phòng của người gọi. Không bao giờ trả số tiền cọc.
create or replace function public.fn_sale_da_coc(p_booking_id uuid) returns boolean
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_nguoi uuid := public.can_dang_nhap();
  v_kq boolean;
begin
  select case when k.xem_coc then coalesce(b.trang_thai_tien in ('da_coc', 'da_thanh_toan'), false) end
  into v_kq
  from public.booking b
  join public.can c on c.id = b.can_id
  join public.ket_noi k on k.chu_id = c.nguoi_giu and k.sale_id = b.sale_id
  where b.id = p_booking_id and b.sale_id = v_nguoi;
  return v_kq;
end $$;

revoke execute on function public.fn_ds_sale_cua_toi(), public.fn_dat_phong_cua_sale(uuid), public.fn_them_sale_tay(text, text),
  public.fn_xoa_sale_tay(uuid), public.fn_ngung_cho_xem(uuid), public.fn_dat_xem_coc(uuid, boolean),
  public.fn_bo_dong_sale(uuid), public.fn_sale_da_coc(uuid) from public, anon, authenticated;
grant execute on function public.fn_ds_sale_cua_toi(), public.fn_dat_phong_cua_sale(uuid), public.fn_them_sale_tay(text, text),
  public.fn_xoa_sale_tay(uuid), public.fn_ngung_cho_xem(uuid), public.fn_dat_xem_coc(uuid, boolean),
  public.fn_bo_dong_sale(uuid), public.fn_sale_da_coc(uuid) to authenticated;
