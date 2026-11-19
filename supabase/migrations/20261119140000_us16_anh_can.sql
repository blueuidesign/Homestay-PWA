-- US16 · Ảnh căn (YC3.3). Kho ảnh riêng tư anh-can và quyền trên kho, ghi ảnh tạm fn_them_anh_tam,
-- gắn ảnh khi tạo căn (fn_tao_can thêm p_anh), dọn ảnh tạm quá 24 giờ fn_don_anh_tam. Chỉ thêm, không sửa migration cũ.

-- ===== Kho ảnh =====
-- YC3 Dữ liệu, QT5.7, QD16 điểm 4, YC3.3-NT6: kho riêng tư, chỉ JPEG, PNG, HEIC tới 15 MB (dịch vụ kho chặn theo cấu hình).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('anh-can', 'anh-can', false, 15728640, array['image/jpeg', 'image/png', 'image/heic'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- YC3.3 bước 23, YC3.3-NT5, PQ3.CHU: mỗi người chỉ tải vào thư mục của chính mình: <uid>/<tên>.jpg|jpeg|png|heic.
create policy anh_can_tai_len on storage.objects for insert to authenticated
  with check (
    bucket_id = 'anh-can'
    and array_length(storage.foldername(name), 1) = 1
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and name ~* '^[^/]+/[^/]+\.(jpe?g|png|heic)$'
  );

-- QT5.7, PQ3.CHU, PQ3.SALE, PQ3.LINK, YC3.3-NT5: mở file khi đọc được dòng ảnh (RLS của anh_can: ảnh tạm của mình,
-- căn mình giữ, căn được chia sẻ qua my_shared_can_ids), hoặc file trong thư mục của mình chưa gắn căn nào.
create policy anh_can_doc_file on storage.objects for select to authenticated
  using (
    bucket_id = 'anh-can'
    and (
      exists (select 1 from public.anh_can a where a.duong_dan = objects.name)
      or (
        (storage.foldername(objects.name))[1] = (select auth.uid())::text
        and not exists (select 1 from public.anh_can a where a.duong_dan = objects.name and a.can_id is not null)
      )
    )
  );

-- ===== Ảnh tạm =====
-- YC3.3 bước 23, YC3 Dữ liệu (tối đa 50 ảnh tạm), YC3.3-NT5, PQ3.CHU: ghi ảnh tạm cho file vừa tải, chưa gắn căn.
-- File phải nằm trong thư mục của người gọi và có trong kho. Gửi lại cùng đường dẫn thì trả ảnh đã ghi.
create or replace function public.fn_them_anh_tam(p_duong_dan text) returns uuid
language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_nguoi uuid := public.can_dang_nhap();
  v_dd text := coalesce(p_duong_dan, '');
  v_id uuid;
  v_giu uuid;
begin
  -- QT5.5: file của người khác hay không có thì trả lỗi quyền, không nói file có hay không.
  if (storage.foldername(v_dd))[1] is distinct from v_nguoi::text
     or array_length(storage.foldername(v_dd), 1) <> 1
     or not exists (select 1 from storage.objects o where o.bucket_id = 'anh-can' and o.name = v_dd) then
    raise exception 'Không tìm thấy ảnh' using errcode = '42501';
  end if;

  select id, nguoi_tai into v_id, v_giu from public.anh_can where duong_dan = v_dd;
  if v_id is not null then
    if v_giu <> v_nguoi then raise exception 'Không tìm thấy ảnh' using errcode = '42501'; end if;
    return v_id;
  end if;

  -- Khóa theo người gọi để hai lệnh cùng lúc không vượt 50.
  perform pg_advisory_xact_lock(hashtextextended('anh_tam:' || v_nguoi::text, 0));
  if (select count(*) from public.anh_can where nguoi_tai = v_nguoi and can_id is null) >= 50 then
    raise exception 'Bạn đang có quá nhiều ảnh chưa gắn vào căn. Thêm căn hoặc bỏ bớt ảnh rồi thử lại.'
      using errcode = 'P0001';
  end if;

  insert into public.anh_can (nguoi_tai, duong_dan) values (v_nguoi, v_dd)
  on conflict (duong_dan) do nothing
  returning id into v_id;
  if v_id is null then
    select id into v_id from public.anh_can where duong_dan = v_dd and nguoi_tai = v_nguoi;
    if v_id is null then raise exception 'Không tìm thấy ảnh' using errcode = '42501'; end if;
  end if;
  return v_id;
end $$;

-- ===== Gắn ảnh vào căn =====
-- YC3.3 Luật kiểm "Ảnh", bước 24, 28, QT5.7, YC3.3-NT3, YC3.3-NT5, PQ3.CHU: kiểm danh sách ảnh của một căn
-- (tối đa 12, không trùng, mỗi ảnh là ảnh tạm của người gọi hay ảnh đang gắn căn này) rồi gắn theo thứ tự.
-- Ảnh đang gắn căn mà không còn trong danh sách thì bỏ khỏi căn. Hàm nội bộ, chỉ gọi từ hàm fn_* đã kiểm người giữ căn.
create or replace function public.gan_anh_can(p_can_id uuid, p_nguoi uuid, p_anh uuid[], p_chi_kiem boolean default false)
returns void
language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_anh uuid[] := coalesce(p_anh, '{}');
begin
  if cardinality(v_anh) > 12 then
    raise exception 'Mỗi căn tối đa 12 ảnh' using errcode = 'P0001';
  end if;
  if array_position(v_anh, null) is not null
     or cardinality(v_anh) <> (select count(distinct x) from unnest(v_anh) x) then
    raise exception 'Danh sách ảnh bị trùng' using errcode = 'P0001';
  end if;
  -- Khóa các ảnh để hai lệnh cùng lúc không gắn một ảnh tạm vào hai căn.
  if (select count(*) from (
        select 1 from public.anh_can a
        where a.id = any (v_anh)
          and ((a.can_id is null and a.nguoi_tai = p_nguoi) or (p_can_id is not null and a.can_id = p_can_id))
        for update) x) <> cardinality(v_anh) then
    raise exception 'Không tìm thấy ảnh' using errcode = '42501';
  end if;
  if p_chi_kiem then return; end if;

  delete from public.anh_can where can_id = p_can_id and not (id = any (v_anh));
  update public.anh_can a set can_id = p_can_id, thu_tu = d.thu_tu
  from unnest(v_anh) with ordinality as d (id, thu_tu)
  where a.id = d.id;
end $$;

-- YC3.2 bước 18, YC3.3 bước 23, 24, Luật kiểm, QT5.5, QT5.6, PQ3.CHU, PQ13.CHU: tạo căn và gắn ảnh trong một giao dịch.
-- Như fn_tao_can của US15, thêm p_anh (thứ tự chọn, ảnh đầu là ảnh đại diện). App gọi bằng tên tham số.
drop function public.fn_tao_can(text, int, uuid, int, text, uuid, text);
create function public.fn_tao_can(
  p_ma_can text,
  p_so_phong_ngu int,
  p_client_id uuid,
  p_so_giuong int default null,
  p_loai_view text default null,
  p_toa_nha_id uuid default null,
  p_mo_ta text default null,
  p_anh uuid[] default null
) returns uuid
language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_nguoi uuid := public.can_dang_nhap();
  v_ma text := btrim(coalesce(p_ma_can, ''));
  v_view text := nullif(btrim(coalesce(p_loai_view, '')), '');
  v_mo_ta text := nullif(btrim(coalesce(p_mo_ta, '')), '');
  v_id uuid;
begin
  -- QT5.6: gửi lại cùng mã lần gửi thì trả căn đã có, không kiểm lại, không ghi lần hai.
  if p_client_id is not null then
    select id into v_id from public.can where nguoi_giu = v_nguoi and client_id = p_client_id;
    if v_id is not null then return v_id; end if;
  end if;

  if v_ma = '' then
    raise exception 'Mã căn không được trống' using errcode = 'P0001';
  end if;
  if char_length(v_ma) > 50 then
    raise exception 'Mã căn dài quá 50 ký tự' using errcode = 'P0001';
  end if;
  if p_so_phong_ngu is null then
    raise exception 'Cần chọn số phòng ngủ' using errcode = 'P0001';
  end if;
  if p_so_phong_ngu not between 0 and 4 then
    raise exception 'Số phòng ngủ không hợp lệ' using errcode = 'P0001';
  end if;
  if p_so_giuong is not null and p_so_giuong not between 1 and 50 then
    raise exception 'Số giường từ 1 đến 50' using errcode = 'P0001';
  end if;
  if v_view is not null and v_view not in ('bien', 'thanh_pho', 'nui') then
    raise exception 'Loại view không hợp lệ' using errcode = 'P0001';
  end if;
  if p_toa_nha_id is not null and not exists (select 1 from public.toa_nha where id = p_toa_nha_id) then
    raise exception 'Không tìm thấy tòa nhà' using errcode = 'P0001';
  end if;
  if v_mo_ta is not null and char_length(v_mo_ta) > 2000 then
    raise exception 'Mô tả dài tối đa 2.000 ký tự' using errcode = 'P0001';
  end if;
  if exists (select 1 from public.can
             where nguoi_giu = v_nguoi and an_luc is null and lower(btrim(ma_can)) = lower(v_ma)) then
    raise exception 'Đã có căn %. Kiểm tra lại mã căn.', v_ma using errcode = 'P0001';
  end if;
  -- YC3.3 Luật kiểm: kiểm ảnh trước khi ghi căn (căn mới chưa có ảnh nào: chỉ nhận ảnh tạm của người gọi).
  perform public.gan_anh_can(null, v_nguoi, p_anh, true);

  begin
    insert into public.can (nguoi_giu, loai, ma_can, so_phong_ngu, so_giuong, loai_view, toa_nha_id, mo_ta, client_id)
    values (v_nguoi, 'co_lich', v_ma, p_so_phong_ngu, p_so_giuong, v_view, p_toa_nha_id, v_mo_ta, p_client_id)
    returning id into v_id;
  exception when unique_violation then
    -- Hai lệnh cùng lúc: cùng mã lần gửi thì trả căn của lệnh trước; trùng mã căn thì câu của Luật kiểm.
    if p_client_id is not null then
      select id into v_id from public.can where nguoi_giu = v_nguoi and client_id = p_client_id;
      if v_id is not null then return v_id; end if;
    end if;
    raise exception 'Đã có căn %. Kiểm tra lại mã căn.', v_ma using errcode = 'P0001';
  end;

  perform public.gan_anh_can(v_id, v_nguoi, p_anh);
  return v_id;
end $$;

-- ===== Dọn ảnh tạm =====
-- YC3.3 (ảnh tạm quá 24 giờ bị xóa), YC3 Dữ liệu: xóa dòng ảnh tạm quá 24 giờ, trả đường dẫn file để xóa khỏi kho.
-- File trong kho xóa qua dịch vụ kho của Supabase (không xóa thẳng bảng storage.objects); app không gọi hàm này.
create or replace function public.fn_don_anh_tam() returns setof text
language sql volatile security definer set search_path = ''
as $$
  delete from public.anh_can
  where can_id is null and tao_luc < now() - interval '24 hours'
  returning duong_dan
$$;

revoke execute on function public.fn_them_anh_tam(text),
  public.gan_anh_can(uuid, uuid, uuid[], boolean),
  public.fn_tao_can(text, int, uuid, int, text, uuid, text, uuid[]),
  public.fn_don_anh_tam() from public, anon, authenticated;
grant execute on function public.fn_them_anh_tam(text) to authenticated;
grant execute on function public.fn_tao_can(text, int, uuid, int, text, uuid, text, uuid[]) to authenticated;

-- Lịch dọn mỗi giờ nếu máy có pg_cron (môi trường chưa bật thì bỏ qua; xóa file trong kho làm sau, xem PR US16).
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.schedule('us16-don-anh-tam', '17 * * * *', 'select count(*) from public.fn_don_anh_tam()');
  end if;
end $$;
