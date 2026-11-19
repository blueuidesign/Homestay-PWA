-- US17 · Tòa nhà, loại view, số giường, mô tả (YC3.4). Cột khu_vuc của toa_nha (YC3-H5) và lệnh thêm tòa fn_them_toa.
-- Chỉ thêm, không sửa migration cũ. Đọc danh sách tòa vẫn qua policy toa_nha_doc (mọi người đã đăng nhập).

-- YC3.4, YC3-H5: tòa Home247 đặt sẵn có khu vực; tòa người dùng thêm để trống.
alter table public.toa_nha add column khu_vuc text;

-- YC3.4 bước 33, QT6.3, QT5.5, YC3 "Dữ liệu", YC3 "Ai được làm gì": người đã đăng nhập thêm tòa, không cần duyệt.
-- Tên trùng (bỏ khoảng trắng đầu cuối, không phân biệt hoa thường) thì trả tòa đã có (giả định GD21).
create or replace function public.fn_them_toa(p_ten text) returns uuid
language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_nguoi uuid := public.can_dang_nhap();
  v_ten text := btrim(coalesce(p_ten, ''));
  v_id uuid;
begin
  if char_length(v_ten) not between 1 and 100 then
    raise exception 'Tên tòa từ 1 đến 100 ký tự' using errcode = 'P0001';
  end if;

  select id into v_id from public.toa_nha where lower(btrim(ten)) = lower(v_ten);
  if v_id is not null then return v_id; end if;

  begin
    insert into public.toa_nha (ten, home247_dat_san, tao_boi)
    values (v_ten, false, v_nguoi)
    returning id into v_id;
  exception when unique_violation then
    -- Hai người thêm cùng tên cùng lúc: trả tòa của lệnh trước (index toa_nha_ten_khong_trung).
    select id into v_id from public.toa_nha where lower(btrim(ten)) = lower(v_ten);
  end;
  return v_id;
end $$;

revoke execute on function public.fn_them_toa(text) from public, anon, authenticated;
grant execute on function public.fn_them_toa(text) to authenticated;
