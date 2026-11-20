-- US56 · Căn tự nhập (YC10.3). Lệnh tạo fn_tao_can_tu_nhap, sửa fn_sua_can_tu_nhap, xóa thật fn_xoa_can_tu_nhap, đọc chi tiết
-- fn_can_tu_nhap (S6-03). Đổi chỉ mục mã căn: căn có lịch giữ luật cũ (YC3.2), căn tự nhập trùng theo người và tòa (YC10-H3).
-- Đọc căn tự nhập qua RLS can_doc đã có (chỉ người giữ). Chỉ thêm, không sửa migration cũ.

-- ===== Mã căn không trùng =====
-- YC3.2 "Mã căn không trùng": giữ tên chỉ mục, chỉ còn căn có lịch. YC10.3 bước 7, YC10-H3, QT1.3: căn tự nhập của một sale
-- không trùng tòa (không tòa là một nhóm) và mã (bỏ khoảng trắng hai đầu, không phân biệt hoa thường).
drop index public.can_ma_khong_trung;
create unique index can_ma_khong_trung on public.can (nguoi_giu, lower(btrim(ma_can)))
  where an_luc is null and loai = 'co_lich';
create unique index can_tu_nhap_ma_khong_trung on public.can
  (nguoi_giu, coalesce(toa_nha_id, '00000000-0000-0000-0000-000000000000'::uuid), lower(btrim(ma_can)))
  where loai = 'tu_nhap';

-- ===== Kiểm dữ liệu dùng chung cho tạo và sửa =====
-- YC10.3 bước 2 đến 6, NT1, NT2, NT10, YC3.2 Luật kiểm (mã căn, số phòng ngủ, số giường, loại view, tòa). Hàm nội bộ.
-- Thiếu ô bắt buộc: P0001 "Còn thiếu: ..." đúng các ô thiếu, theo thứ tự trên màn. Trùng mã: P0001.
create or replace function public.kiem_can_tu_nhap(
  p_nguoi uuid, p_can_id uuid, p_ten text, p_sdt text, p_ma text, p_so_pn int, p_toa uuid, p_view text,
  p_so_giuong int, p_gia_thuong bigint, p_gia_cuoi_tuan bigint, p_bat_buoc text[]
) returns void
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_thieu text[] := '{}';
begin
  -- p_bat_buoc: các ô bắt buộc cần kiểm. Tạo căn: cả bốn. Sửa: chỉ ô có gửi; số điện thoại xóa được (QD11, YC10.3 bước 12).
  if 'chu_can_ten' = any (p_bat_buoc) and coalesce(btrim(p_ten), '') = '' then
    v_thieu := array_append(v_thieu, 'tên chủ nhà');
  end if;
  if 'chu_can_sdt' = any (p_bat_buoc) and coalesce(btrim(p_sdt), '') = '' then
    v_thieu := array_append(v_thieu, 'số điện thoại');
  end if;
  if 'ma_can' = any (p_bat_buoc) and coalesce(btrim(p_ma), '') = '' then
    v_thieu := array_append(v_thieu, 'mã căn');
  end if;
  if 'so_phong_ngu' = any (p_bat_buoc) and p_so_pn is null then
    v_thieu := array_append(v_thieu, 'số phòng ngủ');
  end if;
  if cardinality(v_thieu) > 0 then
    raise exception 'Còn thiếu: %', array_to_string(v_thieu, ', ') using errcode = 'P0001';
  end if;

  if p_ten is not null and char_length(btrim(p_ten)) > 100 then
    raise exception 'Tên chủ nhà dài tối đa 100 ký tự' using errcode = 'P0001';
  end if;
  if p_sdt is not null and char_length(btrim(p_sdt)) > 20 then
    raise exception 'Số điện thoại dài tối đa 20 ký tự' using errcode = 'P0001';
  end if;
  if p_ma is not null and char_length(btrim(p_ma)) > 50 then
    raise exception 'Mã căn dài quá 50 ký tự' using errcode = 'P0001';
  end if;
  if p_so_pn not between 0 and 4 then
    raise exception 'Số phòng ngủ không hợp lệ' using errcode = 'P0001';
  end if;
  if p_so_giuong is not null and p_so_giuong not between 1 and 50 then
    raise exception 'Số giường từ 1 đến 50' using errcode = 'P0001';
  end if;
  if p_view is not null and p_view not in ('bien', 'thanh_pho', 'nui') then
    raise exception 'Loại view không hợp lệ' using errcode = 'P0001';
  end if;
  if p_toa is not null and not exists (select 1 from public.toa_nha where id = p_toa) then
    raise exception 'Không tìm thấy tòa nhà' using errcode = 'P0001';
  end if;
  -- QT1.1 tiền là số nguyên đồng; giá chủ không bắt buộc, có thì lớn hơn 0.
  if (p_gia_thuong is not null and p_gia_thuong not between 1 and 1000000000)
     or (p_gia_cuoi_tuan is not null and p_gia_cuoi_tuan not between 1 and 1000000000) then
    raise exception 'Giá chủ phải lớn hơn 0đ' using errcode = 'P0001';
  end if;
  if exists (select 1 from public.can c
             where c.nguoi_giu = p_nguoi and c.loai = 'tu_nhap' and c.id is distinct from p_can_id
               and c.toa_nha_id is not distinct from p_toa and lower(btrim(c.ma_can)) = lower(btrim(p_ma))) then
    raise exception 'Đã có căn tự nhập % ở tòa này. Kiểm tra lại mã căn.', btrim(p_ma) using errcode = 'P0001';
  end if;
end $$;

-- YC10.3 bước 7, YC10 "Dữ liệu", PQ14.SALE, PQ14.CHU, PQ23: chỉ sale chưa xóa tài khoản tạo căn tự nhập (căn luôn của người gọi).
-- p_anh như fn_tao_can (thứ tự chọn, tối đa 12, YC10.3-NT4). Cùng p_client_id thì trả căn đã tạo (QT5.6).
create or replace function public.fn_tao_can_tu_nhap(
  p_chu_can_ten text,
  p_chu_can_sdt text,
  p_ma_can text,
  p_so_phong_ngu int,
  p_client_id uuid,
  p_toa_nha_id uuid default null,
  p_loai_view text default null,
  p_so_giuong int default null,
  p_gia_chu_thuong bigint default null,
  p_gia_chu_cuoi_tuan bigint default null,
  p_anh uuid[] default null
) returns uuid
language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_nguoi uuid := public.can_dang_nhap();
  v_view text := nullif(btrim(coalesce(p_loai_view, '')), '');
  v_id uuid;
begin
  if not exists (select 1 from public.profiles p where p.id = v_nguoi and p.vai_chon = 'sale' and p.da_xoa_luc is null) then
    raise exception 'Chỉ sale thêm được căn tự nhập' using errcode = '42501';
  end if;
  if p_client_id is not null then
    select id into v_id from public.can where nguoi_giu = v_nguoi and client_id = p_client_id;
    if v_id is not null then return v_id; end if;
  end if;

  perform public.kiem_can_tu_nhap(v_nguoi, null, p_chu_can_ten, p_chu_can_sdt, p_ma_can, p_so_phong_ngu, p_toa_nha_id,
                                  v_view, p_so_giuong, p_gia_chu_thuong, p_gia_chu_cuoi_tuan,
                                  array['chu_can_ten', 'chu_can_sdt', 'ma_can', 'so_phong_ngu']);
  perform public.gan_anh_can(null, v_nguoi, p_anh, true);

  begin
    insert into public.can (nguoi_giu, loai, ma_can, so_phong_ngu, so_giuong, loai_view, toa_nha_id, chu_can_ten, chu_can_sdt,
                            gia_chu_thuong, gia_chu_cuoi_tuan, client_id)
    values (v_nguoi, 'tu_nhap', btrim(p_ma_can), p_so_phong_ngu, p_so_giuong, v_view, p_toa_nha_id, btrim(p_chu_can_ten),
            btrim(p_chu_can_sdt), p_gia_chu_thuong, p_gia_chu_cuoi_tuan, p_client_id)
    returning id into v_id;
  exception when unique_violation then
    if p_client_id is not null then
      select id into v_id from public.can where nguoi_giu = v_nguoi and client_id = p_client_id;
      if v_id is not null then return v_id; end if;
    end if;
    raise exception 'Đã có căn tự nhập % ở tòa này. Kiểm tra lại mã căn.', btrim(p_ma_can) using errcode = 'P0001';
  end;

  perform public.gan_anh_can(v_id, v_nguoi, p_anh);
  return v_id;
end $$;

-- YC10.3 bước 12, NT8, YC10-H7 (giả định GD23), PQ14.SALE, QD11: sửa căn tự nhập của người gọi. p_sua chỉ ghi khóa có gửi:
-- chu_can_ten, chu_can_sdt (null hay trống là xóa số), ma_can, toa_nha_id, so_phong_ngu, so_giuong, loai_view,
-- gia_chu_thuong, gia_chu_cuoi_tuan (null là bỏ), anh (danh sách đầy đủ theo thứ tự). Không phải của người gọi: 42501.
create or replace function public.fn_sua_can_tu_nhap(p_can_id uuid, p_sua jsonb) returns void
language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_nguoi uuid := public.can_dang_nhap();
  v_sua jsonb := coalesce(p_sua, '{}'::jsonb);
  v_can public.can%rowtype;
  v_anh uuid[];
  v_so text;
begin
  if jsonb_typeof(v_sua) <> 'object' then
    raise exception 'Dữ liệu sửa căn không hợp lệ' using errcode = 'P0001';
  end if;
  select * into v_can from public.can
  where id = p_can_id and nguoi_giu = v_nguoi and loai = 'tu_nhap'
  for update;
  if not found then
    raise exception 'Không tìm thấy căn' using errcode = '42501';
  end if;

  -- Số nguyên trong jsonb: sai dạng thì P0001.
  if exists (select 1 from jsonb_each(v_sua) e
             where e.key in ('so_phong_ngu', 'so_giuong', 'gia_chu_thuong', 'gia_chu_cuoi_tuan')
               and jsonb_typeof(e.value) <> 'null' and (e.value #>> '{}') !~ '^\d{1,10}$') then
    raise exception 'Số không hợp lệ' using errcode = 'P0001';
  end if;
  if v_sua ? 'toa_nha_id' and nullif(v_sua ->> 'toa_nha_id', '') is not null
     and (v_sua ->> 'toa_nha_id') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    raise exception 'Không tìm thấy tòa nhà' using errcode = 'P0001';
  end if;

  if v_sua ? 'chu_can_ten' then v_can.chu_can_ten := btrim(coalesce(v_sua ->> 'chu_can_ten', '')); end if;
  if v_sua ? 'chu_can_sdt' then v_can.chu_can_sdt := nullif(btrim(coalesce(v_sua ->> 'chu_can_sdt', '')), ''); end if;
  if v_sua ? 'ma_can' then v_can.ma_can := btrim(coalesce(v_sua ->> 'ma_can', '')); end if;
  if v_sua ? 'toa_nha_id' then v_can.toa_nha_id := nullif(v_sua ->> 'toa_nha_id', '')::uuid; end if;
  if v_sua ? 'so_phong_ngu' then v_can.so_phong_ngu := (v_sua ->> 'so_phong_ngu')::int; end if;
  if v_sua ? 'so_giuong' then v_can.so_giuong := (v_sua ->> 'so_giuong')::int; end if;
  if v_sua ? 'loai_view' then v_can.loai_view := nullif(btrim(coalesce(v_sua ->> 'loai_view', '')), ''); end if;
  if v_sua ? 'gia_chu_thuong' then v_can.gia_chu_thuong := (v_sua ->> 'gia_chu_thuong')::bigint; end if;
  if v_sua ? 'gia_chu_cuoi_tuan' then v_can.gia_chu_cuoi_tuan := (v_sua ->> 'gia_chu_cuoi_tuan')::bigint; end if;
  if v_sua ? 'anh' then
    if jsonb_typeof(v_sua -> 'anh') = 'null' then
      v_anh := '{}';
    elsif jsonb_typeof(v_sua -> 'anh') <> 'array'
          or exists (select 1 from jsonb_array_elements(v_sua -> 'anh') e
                     where jsonb_typeof(e) <> 'string'
                        or (e #>> '{}') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$') then
      raise exception 'Danh sách ảnh không hợp lệ' using errcode = 'P0001';
    else
      select coalesce(array_agg((e #>> '{}')::uuid order by i), '{}') into v_anh
      from jsonb_array_elements(v_sua -> 'anh') with ordinality as x (e, i);
    end if;
  end if;

  perform public.kiem_can_tu_nhap(v_nguoi, v_can.id, v_can.chu_can_ten, v_can.chu_can_sdt, v_can.ma_can, v_can.so_phong_ngu,
                                  v_can.toa_nha_id, v_can.loai_view, v_can.so_giuong, v_can.gia_chu_thuong,
                                  v_can.gia_chu_cuoi_tuan,
                                  array(select k from jsonb_object_keys(v_sua) k where k in ('chu_can_ten', 'ma_can', 'so_phong_ngu')));
  if v_anh is not null then
    perform public.gan_anh_can(v_can.id, v_nguoi, v_anh, true);
  end if;

  begin
    update public.can
    set chu_can_ten = v_can.chu_can_ten, chu_can_sdt = v_can.chu_can_sdt, ma_can = v_can.ma_can,
        toa_nha_id = v_can.toa_nha_id, so_phong_ngu = v_can.so_phong_ngu, so_giuong = v_can.so_giuong,
        loai_view = v_can.loai_view, gia_chu_thuong = v_can.gia_chu_thuong, gia_chu_cuoi_tuan = v_can.gia_chu_cuoi_tuan
    where id = v_can.id;
  exception when unique_violation then
    raise exception 'Đã có căn tự nhập % ở tòa này. Kiểm tra lại mã căn.', v_can.ma_can using errcode = 'P0001';
  end;

  if v_anh is not null then
    perform public.gan_anh_can(v_can.id, v_nguoi, v_anh);
  end if;
end $$;

-- YC10.3 bước 13, NT9, YC10 "Dữ liệu" (xóa thật căn, ảnh, mọi đặt phòng tự ghi), PQ14.SALE: chỉ căn tự nhập của người gọi.
-- Dữ liệu riêng của sale gắn căn này (giá bán, lần gửi khách) xóa theo. File ảnh trong kho không xóa ở đây (như US18).
create or replace function public.fn_xoa_can_tu_nhap(p_can_id uuid) returns void
language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_nguoi uuid := public.can_dang_nhap();
begin
  perform 1 from public.can where id = p_can_id and nguoi_giu = v_nguoi and loai = 'tu_nhap' for update;
  if not found then
    raise exception 'Không tìm thấy căn' using errcode = '42501';
  end if;
  -- booking_dem, booking_rieng xóa theo khóa ngoại; nhật ký xóa booking ghi qua trigger booking_nhat_ky (QD2).
  delete from public.booking where can_id = p_can_id;
  delete from public.muc_cong where can_id = p_can_id;
  delete from public.lan_gui_khach where can_id = p_can_id;
  delete from public.gia_dip where can_id = p_can_id;
  delete from public.gia_thang where can_id = p_can_id;
  delete from public.can where id = p_can_id;
end $$;

-- YC10.3 bước 8, 9, S6-03, S6-03-00, PQ14.SALE, QD11: chi tiết căn tự nhập của người gọi và đặt phòng tự ghi của căn
-- (trả chủ = tiền phòng, thu khách = phần riêng của người gọi). Không phải căn tự nhập của người gọi: 42501.
create or replace function public.fn_can_tu_nhap(p_can_id uuid) returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_nguoi uuid := public.can_dang_nhap();
  v_kq jsonb;
begin
  select jsonb_build_object(
           'can_id', c.id, 'ma_can', c.ma_can, 'toa_nha_id', c.toa_nha_id, 'ten_toa', tn.ten,
           'so_phong_ngu', c.so_phong_ngu, 'so_giuong', c.so_giuong, 'loai_view', c.loai_view,
           'chu_can_ten', c.chu_can_ten, 'chu_can_sdt', c.chu_can_sdt,
           'gia_chu_thuong', c.gia_chu_thuong, 'gia_chu_cuoi_tuan', c.gia_chu_cuoi_tuan,
           'anh', coalesce((select jsonb_agg(jsonb_build_object('id', a.id, 'duong_dan', a.duong_dan) order by a.thu_tu, a.id)
                            from public.anh_can a where a.can_id = c.id), '[]'::jsonb),
           'dat_phong', coalesce((select jsonb_agg(jsonb_build_object(
                                     'id', b.id, 'ngay_nhan', b.ngay_nhan, 'ngay_tra', b.ngay_tra,
                                     'tra_chu', b.tien_phong, 'thu_khach', r.tien_thu_khach) order by b.ngay_nhan, b.id)
                                  from public.booking b
                                  left join public.booking_rieng r on r.booking_id = b.id and r.nguoi_id = v_nguoi
                                  where b.can_id = c.id and b.trang_thai <> 'da_huy'), '[]'::jsonb))
    into v_kq
  from public.can c
  left join public.toa_nha tn on tn.id = c.toa_nha_id
  where c.id = p_can_id and c.nguoi_giu = v_nguoi and c.loai = 'tu_nhap';
  if v_kq is null then
    raise exception 'Không tìm thấy căn' using errcode = '42501';
  end if;
  return v_kq;
end $$;

revoke execute on function public.kiem_can_tu_nhap(uuid, uuid, text, text, text, int, uuid, text, int, bigint, bigint, text[]),
  public.fn_tao_can_tu_nhap(text, text, text, int, uuid, uuid, text, int, bigint, bigint, uuid[]),
  public.fn_sua_can_tu_nhap(uuid, jsonb), public.fn_xoa_can_tu_nhap(uuid), public.fn_can_tu_nhap(uuid)
  from public, anon, authenticated;
grant execute on function public.fn_tao_can_tu_nhap(text, text, text, int, uuid, uuid, text, int, bigint, bigint, uuid[]),
  public.fn_sua_can_tu_nhap(uuid, jsonb), public.fn_xoa_can_tu_nhap(uuid), public.fn_can_tu_nhap(uuid)
  to authenticated;
