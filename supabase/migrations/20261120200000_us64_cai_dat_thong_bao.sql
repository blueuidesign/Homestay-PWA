-- US64 · Cài đặt thông báo (YC12.4). Lệnh fn_dat_cai_dat_thong_bao và công tắc chặn ghi trên thong_bao. Chỉ thêm, không sửa migration cũ.

-- YC12 "Các loại thông báo" cột Công tắc, YC12.4 bước 2, 3: các loại có công tắc, theo vai.
create or replace function public.loai_thong_bao_chu() returns text[]
language sql immutable set search_path = ''
as $$ select array['yeu_cau_moi', 'sale_xin_xem_lich', 'dat_phong_chua_coc'] $$;

create or replace function public.loai_thong_bao_sale() returns text[]
language sql immutable set search_path = ''
as $$ select array['chu_dong_y_ket_noi', 'can_da_gui_co_nguoi_dat', 'yeu_cau_da_chot', 'chu_ghi_dat_phong_cho_sale'] $$;

-- YC12.4 bước 4, YC12.4-NT3, PQ11, PQ19, QD5: ghi các loại thông báo ĐÃ TẮT của CHÍNH người gọi (thay cả danh sách; rỗng là bật hết).
-- Không nhận mã người. Loại ngoài danh sách thì 22023; loại của vai người gọi không có (không giữ căn, không phải sale) thì 42501.
-- Vai tính theo quan hệ (QD5): chủ nhà là người chọn vai chủ nhà hay giữ căn; sale là người chọn vai sale hay có kết nối với chủ nhà.
create or replace function public.fn_dat_cai_dat_thong_bao(p_tat text[]) returns void
language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_nguoi uuid := public.can_dang_nhap();
  v_tat text[];
  v_la_chu boolean;
  v_la_sale boolean;
  v_x text;
begin
  if p_tat is null then
    raise exception 'Cài đặt thông báo không hợp lệ' using errcode = '22023';
  end if;
  select coalesce(array_agg(distinct x order by x), '{}') into v_tat from unnest(p_tat) x where x is not null;
  select (p.vai_chon = 'chu_nha' or exists (select 1 from public.can c where c.nguoi_giu = v_nguoi)),
         (p.vai_chon = 'sale' or exists (select 1 from public.ket_noi k where k.sale_id = v_nguoi))
    into v_la_chu, v_la_sale
  from public.profiles p where p.id = v_nguoi;
  foreach v_x in array v_tat loop
    if not (v_x = any (public.loai_thong_bao_chu() || public.loai_thong_bao_sale())) then
      raise exception 'Loại thông báo không có' using errcode = '22023';
    end if;
    if (v_x = any (public.loai_thong_bao_chu()) and not coalesce(v_la_chu, false))
       or (v_x = any (public.loai_thong_bao_sale()) and not coalesce(v_la_sale, false)) then
      raise exception 'Loại thông báo này không dành cho bạn' using errcode = '42501';
    end if;
  end loop;
  insert into public.cai_dat_rieng (nguoi_id, thong_bao_tat, sua_luc) values (v_nguoi, v_tat, now())
  on conflict (nguoi_id) do update set thong_bao_tat = excluded.thong_bao_tat, sua_luc = excluded.sua_luc;
end $$;

revoke execute on function public.loai_thong_bao_chu(), public.loai_thong_bao_sale(), public.fn_dat_cai_dat_thong_bao(text[])
  from public, anon, authenticated;
grant execute on function public.fn_dat_cai_dat_thong_bao(text[]) to authenticated;

-- YC12 "Quy tắc của nhóm" (Công tắc chặn ghi), YC12.4-NT2, YC12-H4 (giả định GD29): loại đã tắt thì từ lúc tắt không ghi dòng mới.
-- Chặn ở một chỗ cho mọi nơi ghi thông báo. Loại không có công tắc thì luôn ghi. Dòng đã ghi trước giữ nguyên.
create or replace function public.tg_thong_bao_cong_tac() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if new.loai = any (public.loai_thong_bao_chu() || public.loai_thong_bao_sale())
     and not public.thong_bao_bat(new.nguoi_nhan, new.loai) then
    return null;
  end if;
  return new;
end $$;

drop trigger if exists thong_bao_cong_tac on public.thong_bao;
create trigger thong_bao_cong_tac before insert on public.thong_bao
  for each row execute function public.tg_thong_bao_cong_tac();

revoke execute on function public.tg_thong_bao_cong_tac() from public, anon, authenticated;
