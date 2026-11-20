-- US4 · Hồ sơ (YC1.4). Lệnh sửa hồ sơ fn_sua_ho_so và kho ảnh đại diện anh-dai-dien. Chỉ thêm, không sửa migration cũ.

-- ===== Kho ảnh đại diện =====
-- YC1.4 bước 2, QT5.7, pwa.md P6: kho riêng tư, chỉ JPEG, PNG, HEIC tới 15 MB; mỗi người chỉ tải vào, đọc thư mục của mình.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('anh-dai-dien', 'anh-dai-dien', false, 15728640, array['image/jpeg', 'image/png', 'image/heic'])
on conflict (id) do update set public = excluded.public, file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy anh_dai_dien_tai_len on storage.objects for insert to authenticated
  with check (
    bucket_id = 'anh-dai-dien'
    and array_length(storage.foldername(name), 1) = 1
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and name ~* '^[^/]+/[^/]+\.(jpe?g|png|heic)$'
  );

create policy anh_dai_dien_doc on storage.objects for select to authenticated
  using (bucket_id = 'anh-dai-dien' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- ===== Lệnh sửa hồ sơ =====
-- YC1.4 bước 3, YC1.4-NT1, NT2, NT4, NT5, PQ1, PQ2, PQ20, QT6.5: ghi họ tên, tên hiển thị, số, ảnh của CHÍNH người gọi.
-- Không nhận mã người hay vai (vai chỉ đổi qua fn_chon_vai). Số kiểm như fn_dang_ky; không trùng tài khoản khác chưa xóa.
-- p_anh: null giữ ảnh cũ, '' bỏ ảnh, đường dẫn thì phải là file trong thư mục của người gọi ở kho anh-dai-dien.
create or replace function public.fn_sua_ho_so(p_ten text, p_ten_hien_thi text, p_so text, p_anh text default null) returns void
language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_nguoi uuid := public.can_dang_nhap();
  v_ten text := btrim(coalesce(p_ten, ''));
  v_hien text := btrim(coalesce(p_ten_hien_thi, ''));
  v_so text := public.chuan_hoa_so(p_so);
begin
  if v_ten = '' or char_length(v_ten) > 100 then
    raise exception 'Nhập họ và tên để sale và chủ nhà biết bạn là ai.' using errcode = '22023';
  end if;
  if v_hien = '' or char_length(v_hien) > 100 then
    raise exception 'Tên hiển thị từ 1 đến 100 ký tự' using errcode = '22023';
  end if;
  if v_so is null then
    raise exception 'Số điện thoại cần từ 9 đến 15 chữ số.' using errcode = '22023';
  end if;
  if p_anh is not null and p_anh <> '' and (
       (storage.foldername(p_anh))[1] is distinct from v_nguoi::text
       or array_length(storage.foldername(p_anh), 1) <> 1
       or not exists (select 1 from storage.objects o where o.bucket_id = 'anh-dai-dien' and o.name = p_anh)) then
    raise exception 'Không tìm thấy ảnh' using errcode = '42501';
  end if;
  if exists (select 1 from public.profiles p where p.so_dien_thoai = v_so and p.da_xoa_luc is null and p.id <> v_nguoi) then
    raise exception 'Số này đã có tài khoản.' using errcode = '23505';
  end if;

  begin
    update public.profiles
    set ten = v_ten, ten_hien_thi = v_hien, so_dien_thoai = v_so,
        anh_dai_dien = case when p_anh is null then anh_dai_dien when p_anh = '' then null else p_anh end,
        sua_luc = now()
    where id = v_nguoi and da_xoa_luc is null;
  exception when unique_violation then
    raise exception 'Số này đã có tài khoản.' using errcode = '23505';
  end;
  if not found then
    raise exception 'Không tìm thấy hồ sơ' using errcode = '42501';
  end if;
end $$;

revoke execute on function public.fn_sua_ho_so(text, text, text, text) from public, anon, authenticated;
grant execute on function public.fn_sua_ho_so(text, text, text, text) to authenticated;
