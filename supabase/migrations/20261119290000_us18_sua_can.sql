-- US18 · Sửa căn (YC3.5). Lệnh sửa căn fn_sua_can. Chỉ thêm, không sửa migration cũ.

-- YC3.5 bước 39, 40, YC3.2 Luật kiểm, YC3.4, QT5.5, QT5.7, PQ3.CHU, PQ3.SALE, PQ13.CHU.
-- p_sua: chỉ ghi khóa có gửi (ma_can, so_phong_ngu, so_giuong, loai_view, toa_nha_id, mo_ta, anh); khóa có mà null là
-- bỏ giá trị đó. "anh" là danh sách ảnh mới đầy đủ theo thứ tự (ảnh đầu là ảnh đại diện), gắn qua gan_anh_can.
-- Không phải người giữ, căn không có hay đã ẩn: 42501 (QT5.5: như không thấy). Dữ liệu sai: P0001 kèm câu như fn_tao_can.
create or replace function public.fn_sua_can(p_can_id uuid, p_sua jsonb) returns void
language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_nguoi uuid := public.can_dang_nhap();
  v_sua jsonb := coalesce(p_sua, '{}'::jsonb);
  v_can public.can%rowtype;
  v_ma text;
  v_so_pn int;
  v_so_giuong int;
  v_view text;
  v_toa uuid;
  v_mo_ta text;
  v_anh uuid[];
begin
  if jsonb_typeof(v_sua) <> 'object' then
    raise exception 'Dữ liệu sửa căn không hợp lệ' using errcode = 'P0001';
  end if;

  -- Khóa căn trước khi kiểm (YC3 Dữ liệu): lệnh ẩn căn chạy cùng lúc phải chờ.
  select * into v_can from public.can
  where id = p_can_id and nguoi_giu = v_nguoi and an_luc is null
  for update;
  if not found then
    raise exception 'Không tìm thấy căn' using errcode = '42501';
  end if;

  v_ma := v_can.ma_can;
  v_so_pn := v_can.so_phong_ngu;
  v_so_giuong := v_can.so_giuong;
  v_view := v_can.loai_view;
  v_toa := v_can.toa_nha_id;
  v_mo_ta := v_can.mo_ta;

  if v_sua ? 'ma_can' then
    v_ma := btrim(coalesce(v_sua ->> 'ma_can', ''));
    if v_ma = '' then
      raise exception 'Mã căn không được trống' using errcode = 'P0001';
    end if;
    if char_length(v_ma) > 50 then
      raise exception 'Mã căn dài quá 50 ký tự' using errcode = 'P0001';
    end if;
  end if;

  if v_sua ? 'so_phong_ngu' then
    if jsonb_typeof(v_sua -> 'so_phong_ngu') = 'null' then
      raise exception 'Cần chọn số phòng ngủ' using errcode = 'P0001';
    end if;
    if coalesce(v_sua ->> 'so_phong_ngu', '') !~ '^\d{1,2}$' then
      raise exception 'Số phòng ngủ không hợp lệ' using errcode = 'P0001';
    end if;
    v_so_pn := (v_sua ->> 'so_phong_ngu')::int;
    if v_so_pn not between 0 and 4 then
      raise exception 'Số phòng ngủ không hợp lệ' using errcode = 'P0001';
    end if;
  end if;

  -- YC3.5 bước 38: xóa trống ô số giường là bỏ số giường.
  if v_sua ? 'so_giuong' then
    if jsonb_typeof(v_sua -> 'so_giuong') = 'null' then
      v_so_giuong := null;
    elsif coalesce(v_sua ->> 'so_giuong', '') !~ '^\d{1,2}$' then
      raise exception 'Số giường từ 1 đến 50' using errcode = 'P0001';
    else
      v_so_giuong := (v_sua ->> 'so_giuong')::int;
      if v_so_giuong not between 1 and 50 then
        raise exception 'Số giường từ 1 đến 50' using errcode = 'P0001';
      end if;
    end if;
  end if;

  if v_sua ? 'loai_view' then
    v_view := nullif(btrim(coalesce(v_sua ->> 'loai_view', '')), '');
    if v_view is not null and v_view not in ('bien', 'thanh_pho', 'nui') then
      raise exception 'Loại view không hợp lệ' using errcode = 'P0001';
    end if;
  end if;

  if v_sua ? 'toa_nha_id' then
    if nullif(v_sua ->> 'toa_nha_id', '') is null then
      v_toa := null;
    else
      if (v_sua ->> 'toa_nha_id') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
        raise exception 'Không tìm thấy tòa nhà' using errcode = 'P0001';
      end if;
      v_toa := (v_sua ->> 'toa_nha_id')::uuid;
      if not exists (select 1 from public.toa_nha where id = v_toa) then
        raise exception 'Không tìm thấy tòa nhà' using errcode = 'P0001';
      end if;
    end if;
  end if;

  if v_sua ? 'mo_ta' then
    v_mo_ta := nullif(btrim(coalesce(v_sua ->> 'mo_ta', '')), '');
    if v_mo_ta is not null and char_length(v_mo_ta) > 2000 then
      raise exception 'Mô tả dài tối đa 2.000 ký tự' using errcode = 'P0001';
    end if;
  end if;

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

  -- YC3 Quy tắc "Mã căn không trùng": trùng căn chưa ẩn khác của mình thì từ chối.
  if v_sua ? 'ma_can' and exists (
       select 1 from public.can
       where nguoi_giu = v_nguoi and an_luc is null and id <> v_can.id and lower(btrim(ma_can)) = lower(v_ma)) then
    raise exception 'Đã có căn %. Kiểm tra lại mã căn.', v_ma using errcode = 'P0001';
  end if;
  -- YC3.3 Luật kiểm: kiểm ảnh trước khi ghi căn.
  if v_anh is not null then
    perform public.gan_anh_can(v_can.id, v_nguoi, v_anh, true);
  end if;

  begin
    update public.can
    set ma_can = v_ma, so_phong_ngu = v_so_pn, so_giuong = v_so_giuong, loai_view = v_view,
        toa_nha_id = v_toa, mo_ta = v_mo_ta
    where id = v_can.id;
  exception when unique_violation then
    raise exception 'Đã có căn %. Kiểm tra lại mã căn.', v_ma using errcode = 'P0001';
  end;

  if v_anh is not null then
    perform public.gan_anh_can(v_can.id, v_nguoi, v_anh);
  end if;
end $$;

revoke execute on function public.fn_sua_can(uuid, jsonb) from public, anon, authenticated;
grant execute on function public.fn_sua_can(uuid, jsonb) to authenticated;
