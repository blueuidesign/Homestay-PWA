-- US15 · Thêm căn (YC3.2). Lệnh tạo căn fn_tao_can (luật kiểm, chống gửi trùng) và trigger thông báo
-- "chủ nhà thêm căn" cho sale được chia sẻ "tất cả căn" (YC3-H1, YC12). Chỉ thêm, không sửa migration cũ.

-- YC3.2 bước 18, Luật kiểm, QT5.5, QT5.6, YC3-H6, PQ3.CHU, PQ13.CHU: căn luôn của người gọi.
-- Lỗi kiểm dữ liệu trả P0001 kèm câu của bảng Luật kiểm. Cùng mã lần gửi thì trả căn đã tạo.
create or replace function public.fn_tao_can(
  p_ma_can text,
  p_so_phong_ngu int,
  p_client_id uuid,
  p_so_giuong int default null,
  p_loai_view text default null,
  p_toa_nha_id uuid default null,
  p_mo_ta text default null
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
  return v_id;
end $$;

-- YC3.2 bước 18, YC3-H1, YC12 "Chủ nhà thêm căn", PQ19, PQ3.SALE: báo sale đã kết nối, chia sẻ tất cả căn.
-- Nội dung chỉ có tên hiển thị chủ nhà và mã căn (không giá). Chủ đã xóa tài khoản thì sale không còn thấy căn: không báo.
create or replace function public.tg_bao_chu_them_can() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.thong_bao (nguoi_nhan, loai, noi_dung, doi_tuong_loai, doi_tuong_id)
  select k.sale_id, 'chu_them_can',
         jsonb_build_object('ten_chu', p.ten_hien_thi, 'ma_can', new.ma_can),
         'can', new.id
  from public.ket_noi k
  join public.profiles p on p.id = k.chu_id
  where k.chu_id = new.nguoi_giu
    and k.trang_thai = 'da_ket_noi'
    and k.pham_vi = 'tat_ca'
    and k.sale_id <> new.nguoi_giu
    and p.da_xoa_luc is null;
  return null;
end $$;

create trigger can_bao_chu_them_can
  after insert on public.can
  for each row when (new.loai = 'co_lich' and new.an_luc is null)
  execute function public.tg_bao_chu_them_can();

revoke execute on function public.fn_tao_can(text, int, uuid, int, text, uuid, text),
  public.tg_bao_chu_them_can() from public, anon, authenticated;
grant execute on function public.fn_tao_can(text, int, uuid, int, text, uuid, text) to authenticated;
