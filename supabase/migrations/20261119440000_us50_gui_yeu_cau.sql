-- US50 · Sale gửi và hủy yêu cầu (YC9.1). Lệnh gửi fn_gui_yeu_cau, đọc fn_yeu_cau_cua_toi (S3-03, S3-08), hủy fn_huy_yeu_cau,
-- chủ nhà đọc một yêu cầu fn_chu_xem_yeu_cau (CN9, phần YC9.1-NT13). Chủ căn thôi đọc dòng yêu cầu đã hủy (YC9.1-NT7).
-- Chỉ thêm, không sửa migration cũ. Yêu cầu chờ không chiếm đêm (QD6): không đụng booking.

-- YC9.1-NT7, NT13, PQ10.CHU, PQ10.SALE: sale đọc yêu cầu của mình; chủ căn đọc yêu cầu tới căn mình trừ yêu cầu đã hủy.
drop policy yeu_cau_doc on public.yeu_cau_dat_phong;
create policy yeu_cau_doc on public.yeu_cau_dat_phong for select to authenticated
  using (sale_id = (select auth.uid())
         or (trang_thai <> 'da_huy' and can_id in (select public.my_own_can_ids())));

-- YC9 "Dữ liệu", YC9.4, YC9-H3, YC9-H8, QD11, PQ10.SALE, PQ11.SALE: một yêu cầu của người gọi cho S3-03, S3-08.
-- Hàm nội bộ, app không gọi; người gọi đã kiểm ở lệnh fn_*.
create or replace function public.yeu_cau_cho_sale(p_id uuid) returns jsonb
language sql stable security definer set search_path = ''
as $$
  select jsonb_build_object(
    'id', y.id, 'can_id', y.can_id, 'ma_can', c.ma_can, 'ten_toa', t.ten, 'so_phong_ngu', c.so_phong_ngu,
    'chu', jsonb_build_object(
      'ten', coalesce(chu.ten_hien_thi, chu.ten),
      'so_dien_thoai', case when chu.da_xoa_luc is null then nullif(btrim(coalesce(chu.so_dien_thoai, '')), '') end,
      'da_xoa', chu.da_xoa_luc is not null),
    'ngay_nhan', y.ngay_nhan, 'ngay_tra', y.ngay_tra, 'so_dem', y.ngay_tra - y.ngay_nhan,
    'dem', (select jsonb_agg(jsonb_build_object('ngay', y.ngay_nhan + (i - 1), 'gia_chu', y.gia_chu_dem[i],
                                                'gia_ban', r.gia_ban_dem[i]) order by i)
            from generate_series(1, y.ngay_tra - y.ngay_nhan) i),
    'tong_gia_chu', (select sum(x)::bigint from unnest(y.gia_chu_dem) x),
    'tong_gia_ban', (select sum(x)::bigint from unnest(r.gia_ban_dem) x),
    'loi_nhan', y.loi_nhan,
    'trang_thai', case when y.trang_thai = 'cho' and (y.han_luc <= now() or y.ngay_nhan < public.local_today())
                       then 'het_han' else y.trang_thai end,
    'ly_do_tu_choi', y.ly_do_tu_choi, 'gui_luc', y.gui_luc, 'han_luc', y.han_luc)
  from public.yeu_cau_dat_phong y
  join public.can c on c.id = y.can_id
  join public.profiles chu on chu.id = c.nguoi_giu
  left join public.toa_nha t on t.id = c.toa_nha_id
  left join public.yeu_cau_rieng r on r.yeu_cau_id = y.id and r.sale_id = y.sale_id
  where y.id = p_id
$$;

revoke execute on function public.yeu_cau_cho_sale(uuid) from public, anon, authenticated;

-- YC9.1 bước 2, 3a, 3b, Luật kiểm, YC9.1-NT1, NT2, NT4, NT5, NT8, NT10, NT11, NT12, YC9 "Quy tắc của nhóm", "Dữ liệu",
-- QT1.1, QT1.4, QT2.1, QT5.6, QD6, QD11, QD13, PQ10.SALE, PQ11.SALE, PQ19, YC12, KT-DB.3.3.
create or replace function public.fn_gui_yeu_cau(p_can_id uuid, p_ngay_nhan date, p_ngay_tra date, p_loi_nhan text,
                                                 p_client_id uuid) returns jsonb
language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_nguoi uuid := public.can_dang_nhap();
  v_id uuid;
  v_ly_do text;
  v_loi_nhan text := nullif(btrim(coalesce(p_loi_nhan, '')), '');
  v_kin text;
  v_thieu date;
  v_chu bigint[];
  v_ban bigint[];
  v_can public.can%rowtype;
begin
  -- QT5.6: cùng mã lần gửi của người gọi đã có yêu cầu thì trả yêu cầu đó.
  if p_client_id is not null then
    select y.id into v_id from public.yeu_cau_dat_phong y where y.sale_id = v_nguoi and y.client_id = p_client_id;
    if v_id is not null then
      return public.yeu_cau_cho_sale(v_id);
    end if;
  end if;

  -- PQ10.SALE, KT-DB.3.3, QD13: chỉ căn trong my_shared_can_ids(); bị ngừng, chủ xóa tài khoản thì kèm lý do.
  if p_can_id is null or p_can_id not in (select public.my_shared_can_ids()) then
    v_ly_do := public.ly_do_mat_quyen_can(v_nguoi, p_can_id);
    if v_ly_do = 'Chủ nhà đã xóa tài khoản' then
      raise exception 'Không gửi được yêu cầu. Chủ nhà đã xóa tài khoản trên Home247.' using errcode = '42501';
    elsif v_ly_do is not null then
      raise exception 'Không gửi được yêu cầu. Chủ nhà đã ngừng chia sẻ lịch.' using errcode = '42501';
    end if;
    raise exception 'Không tìm thấy căn' using errcode = '42501';
  end if;

  -- YC9.1 Luật kiểm, YC9-H1.
  if p_ngay_nhan is null or p_ngay_tra is null then
    raise exception 'Chưa chọn ngày' using errcode = 'P0001';
  end if;
  if p_ngay_nhan < public.local_today() then
    raise exception 'Ngày nhận đã qua' using errcode = 'P0001';
  end if;
  if p_ngay_tra <= p_ngay_nhan or p_ngay_tra - p_ngay_nhan > 366 then
    raise exception 'Ngày trả phải sau ngày nhận' using errcode = 'P0001';
  end if;
  if char_length(v_loi_nhan) > 500 then
    raise exception 'Lời nhắn tối đa 500 ký tự' using errcode = '22023';
  end if;

  -- QT1.4, QD6: khóa căn (cùng khóa của lệnh ghi đặt phòng) rồi mới kiểm đêm kín.
  select * into v_can from public.can where id = p_can_id and an_luc is null for no key update;
  if not found then
    raise exception 'Không tìm thấy căn' using errcode = '42501';
  end if;
  select string_agg(g::date::text, ',' order by g) into v_kin
  from generate_series(p_ngay_nhan, p_ngay_tra - 1, interval '1 day') g
  where exists (select 1 from public.booking b
                where b.can_id = p_can_id and b.trang_thai <> 'da_huy' and b.dem @> g::date);
  if v_kin is not null then
    raise exception 'Căn này đã được đặt rồi' using errcode = 'P0001', detail = v_kin;
  end if;

  -- YC9 "Giá chốt lúc gửi", YC9-H2, QT2.1: database tính giá từng đêm; đêm chưa có giá thì từ chối.
  select array_agg(public.gia_chu_dem(p_can_id, g::date) order by g),
         array_agg(public.gia_ban_dem(v_nguoi, p_can_id, g::date) order by g),
         min(g::date) filter (where public.gia_chu_dem(p_can_id, g::date) is null)
    into v_chu, v_ban, v_thieu
  from generate_series(p_ngay_nhan, p_ngay_tra - 1, interval '1 day') g;
  if v_thieu is not null then
    raise exception 'Căn chưa có giá cho đêm %. Nhắn chủ nhà để hỏi giá.', to_char(v_thieu, 'DD/MM') using errcode = 'P0001';
  end if;

  insert into public.yeu_cau_dat_phong (can_id, sale_id, ngay_nhan, ngay_tra, loi_nhan, gia_chu_dem, trang_thai,
                                        gui_luc, han_luc, client_id)
  values (p_can_id, v_nguoi, p_ngay_nhan, p_ngay_tra, v_loi_nhan, v_chu, 'cho', now(), now() + interval '14 days', p_client_id)
  on conflict (sale_id, client_id) do nothing
  returning id into v_id;
  if v_id is null then
    -- QT5.6: lần gửi cùng mã chạy song song đã ghi trước.
    select y.id into v_id from public.yeu_cau_dat_phong y where y.sale_id = v_nguoi and y.client_id = p_client_id;
    return public.yeu_cau_cho_sale(v_id);
  end if;

  -- QD11: giá bán là phần riêng của sale.
  insert into public.yeu_cau_rieng (yeu_cau_id, sale_id, gia_ban_dem) values (v_id, v_nguoi, v_ban);

  -- YC12 "Sale gửi yêu cầu đặt phòng", PQ19: báo chủ căn; chỉ giá chủ, không giá bán.
  if public.thong_bao_bat(v_can.nguoi_giu, 'yeu_cau_moi') then
    insert into public.thong_bao (nguoi_nhan, loai, noi_dung, doi_tuong_loai, doi_tuong_id)
    select v_can.nguoi_giu, 'yeu_cau_moi',
           jsonb_build_object('ten_sale', coalesce(s.ten_hien_thi, s.ten), 'ten_toa', t.ten, 'ma_can', v_can.ma_can,
                              'ngay_nhan', p_ngay_nhan, 'ngay_tra', p_ngay_tra, 'so_dem', p_ngay_tra - p_ngay_nhan,
                              'tong_gia_chu', (select sum(x)::bigint from unnest(v_chu) x)),
           'yeu_cau', v_id
    from public.profiles s
    left join public.toa_nha t on t.id = v_can.toa_nha_id
    where s.id = v_nguoi;
  end if;

  return public.yeu_cau_cho_sale(v_id);
end $$;

-- YC9.1 bước 3, 4, YC9.4, YC9-H3, PQ10.SALE, QD11: yêu cầu của người gọi. Không phải của người gọi: như không có.
create or replace function public.fn_yeu_cau_cua_toi(p_yeu_cau_id uuid) returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_nguoi uuid := public.can_dang_nhap();
begin
  if not exists (select 1 from public.yeu_cau_dat_phong y where y.id = p_yeu_cau_id and y.sale_id = v_nguoi) then
    raise exception 'Không tìm thấy yêu cầu' using errcode = '42501';
  end if;
  return public.yeu_cau_cho_sale(p_yeu_cau_id);
end $$;

-- YC9.1 bước 4, YC9.1-NT7, NT13, YC9-H6, YC9 "Trạng thái yêu cầu", PQ10.SALE, PQ10.CHU: người gửi hủy yêu cầu đang chờ.
-- Không báo chủ nhà.
create or replace function public.fn_huy_yeu_cau(p_yeu_cau_id uuid) returns jsonb
language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_nguoi uuid := public.can_dang_nhap();
  v_y public.yeu_cau_dat_phong%rowtype;
begin
  select * into v_y from public.yeu_cau_dat_phong y where y.id = p_yeu_cau_id and y.sale_id = v_nguoi for update;
  if not found then
    raise exception 'Không tìm thấy yêu cầu' using errcode = '42501';
  end if;
  if v_y.trang_thai <> 'cho' or v_y.han_luc <= now() or v_y.ngay_nhan < public.local_today() then
    raise exception 'Yêu cầu đã đổi trạng thái' using errcode = 'P0001';
  end if;
  update public.yeu_cau_dat_phong set trang_thai = 'da_huy', tra_loi_luc = now() where id = p_yeu_cau_id;
  return public.yeu_cau_cho_sale(p_yeu_cau_id);
end $$;

-- YC9.1-NT13, YC9-H6, PQ10.CHU, PQ11, KT-DB.3.6: chủ căn đọc một yêu cầu gửi tới căn mình (mở từ thông báo, CN9).
-- Đã hủy: chỉ trạng thái. Không có giá bán, mức cộng.
create or replace function public.fn_chu_xem_yeu_cau(p_yeu_cau_id uuid) returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_nguoi uuid := public.can_dang_nhap();
  v_y public.yeu_cau_dat_phong%rowtype;
begin
  select * into v_y from public.yeu_cau_dat_phong y
  where y.id = p_yeu_cau_id and y.can_id in (select public.my_own_can_ids());
  if not found then
    raise exception 'Không tìm thấy yêu cầu' using errcode = '42501';
  end if;
  if v_y.trang_thai = 'da_huy' then
    return jsonb_build_object('id', v_y.id, 'trang_thai', 'da_huy');
  end if;
  return (
    select jsonb_build_object(
      'id', v_y.id, 'can_id', v_y.can_id, 'ma_can', c.ma_can, 'ten_toa', t.ten,
      'ten_sale', coalesce(s.ten_hien_thi, s.ten),
      'ngay_nhan', v_y.ngay_nhan, 'ngay_tra', v_y.ngay_tra, 'so_dem', v_y.ngay_tra - v_y.ngay_nhan,
      'gia_chu_dem', to_jsonb(v_y.gia_chu_dem), 'tong_gia_chu', (select sum(x)::bigint from unnest(v_y.gia_chu_dem) x),
      'loi_nhan', v_y.loi_nhan,
      'trang_thai', case when v_y.trang_thai = 'cho' and (v_y.han_luc <= now() or v_y.ngay_nhan < public.local_today())
                         then 'het_han' else v_y.trang_thai end,
      'ly_do_tu_choi', v_y.ly_do_tu_choi, 'gui_luc', v_y.gui_luc, 'han_luc', v_y.han_luc)
    from public.can c
    left join public.toa_nha t on t.id = c.toa_nha_id
    join public.profiles s on s.id = v_y.sale_id
    where c.id = v_y.can_id);
end $$;

revoke execute on function public.fn_gui_yeu_cau(uuid, date, date, text, uuid), public.fn_yeu_cau_cua_toi(uuid),
  public.fn_huy_yeu_cau(uuid), public.fn_chu_xem_yeu_cau(uuid) from public, anon, authenticated;
grant execute on function public.fn_gui_yeu_cau(uuid, date, date, text, uuid), public.fn_yeu_cau_cua_toi(uuid),
  public.fn_huy_yeu_cau(uuid), public.fn_chu_xem_yeu_cau(uuid) to authenticated;
