-- US8 · Xóa tài khoản (YC1.8, QD13, QT6.5). Lệnh fn_xoa_tai_khoan và chặn đổi kết nối với sale đã xóa tài khoản.
-- Chỉ thêm, không sửa migration cũ. YC1-H8 tự chốt (QD25, chờ Tùng duyệt lại): chỉ bỏ số điện thoại; ảnh đại diện, tên,
-- số chủ căn tự nhập, khách do người đó nhập giữ nguyên để đăng nhập lại là dùng tiếp như cũ.

-- YC1.8 bước 3, YC1.8-NT1, NT3, NT4, NT7, YC1 "Dữ liệu", PQ1, PQ2, PQ23, QT6.5: trong một giao dịch bỏ số, ghi lúc xóa,
-- ghi thông báo "chủ nhà đã xóa tài khoản" cho mỗi sale đang kết nối với người gọi (phía chủ nhà của người đó, QD5).
-- Không xóa căn, ảnh, lịch, giá, tiền, đặt phòng, yêu cầu. Gọi lại khi đã xóa thì không làm gì.
create or replace function public.fn_xoa_tai_khoan() returns void
language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_nguoi uuid := public.can_dang_nhap();
  v_ho_so public.profiles%rowtype;
begin
  select * into v_ho_so from public.profiles where id = v_nguoi for update;
  if not found then
    raise exception 'Không tìm thấy hồ sơ' using errcode = '42501';
  end if;
  if v_ho_so.da_xoa_luc is not null then
    return;
  end if;

  update public.profiles set so_dien_thoai = null, da_xoa_luc = now(), sua_luc = now() where id = v_nguoi;

  insert into public.thong_bao (nguoi_nhan, loai, noi_dung, doi_tuong_loai, doi_tuong_id)
  select k.sale_id, 'chu_xoa_tai_khoan', jsonb_build_object('ten_chu', coalesce(v_ho_so.ten_hien_thi, v_ho_so.ten)), 'ket_noi', k.id
  from public.ket_noi k
  join public.profiles s on s.id = k.sale_id and s.da_xoa_luc is null
  where k.chu_id = v_nguoi and k.trang_thai = 'da_ket_noi';
end $$;

revoke execute on function public.fn_xoa_tai_khoan() from public, anon, authenticated;
grant execute on function public.fn_xoa_tai_khoan() to authenticated;

-- YC1.8-NT9, QT6.5: chủ nhà không đổi phạm vi, quyền xem, trạng thái kết nối với sale đã xóa tài khoản.
-- Bỏ hẳn dòng (fn_bo_dong_sale) vẫn được. Sale nhập lại số thì hết chặn.
create or replace function public.tg_ket_noi_sale_da_xoa() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if (new.pham_vi, new.xem_coc, new.trang_thai) is distinct from (old.pham_vi, old.xem_coc, old.trang_thai)
     and exists (select 1 from public.profiles p where p.id = old.sale_id and p.da_xoa_luc is not null) then
    raise exception 'Sale này đã xóa tài khoản' using errcode = 'P0001';
  end if;
  return new;
end $$;

drop trigger if exists ket_noi_sale_da_xoa on public.ket_noi;
create trigger ket_noi_sale_da_xoa before update on public.ket_noi
  for each row execute function public.tg_ket_noi_sale_da_xoa();

create or replace function public.tg_ket_noi_can_sale_da_xoa() returns trigger
language plpgsql security definer set search_path = ''
as $$
declare v_ket_noi uuid := case when tg_op = 'DELETE' then old.ket_noi_id else new.ket_noi_id end;
begin
  -- Dòng kết nối đã bị bỏ (xóa dây chuyền) thì không chặn.
  if exists (select 1 from public.ket_noi k join public.profiles p on p.id = k.sale_id
             where k.id = v_ket_noi and p.da_xoa_luc is not null) then
    raise exception 'Sale này đã xóa tài khoản' using errcode = 'P0001';
  end if;
  return case when tg_op = 'DELETE' then old else new end;
end $$;

drop trigger if exists ket_noi_can_sale_da_xoa on public.ket_noi_can;
create trigger ket_noi_can_sale_da_xoa before insert or delete on public.ket_noi_can
  for each row execute function public.tg_ket_noi_can_sale_da_xoa();

revoke execute on function public.tg_ket_noi_sale_da_xoa(), public.tg_ket_noi_can_sale_da_xoa() from public, anon, authenticated;
