-- US33 · Hủy đặt phòng có sale (YC5.8, QD12). Một bên xin hủy, bên kia đồng ý thì hủy, không đồng ý thì giữ nguyên và không xin
-- lại được. Trigger tg_booking_huy_hai_ben (EN2) vẫn chặn mọi lệnh ghi thẳng; các lệnh dưới đây là đường ghi của app.
-- Chỉ thêm, không sửa migration cũ.

-- YC5.8, QD12, PQ7, PQ17, KT-DB.3.8: khóa đặt phòng có thể xin hủy, chỉ cho chủ nhà giữ căn hoặc sale đứng tên (người khác và
-- đặt phòng không có thật: cùng lỗi quyền 42501, HV5). Sale không thấy đặt phòng sale tự ghi qua đây (căn tự nhập là của
-- chính sale, không có bên kia). Hàm nội bộ, app không gọi.
create or replace function public.khoa_booking_hai_ben(p_booking_id uuid, p_khoa boolean)
returns table (b public.booking, chu_id uuid, ma_can text, ten_toa text, loai_can text)
language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_nguoi uuid := public.can_dang_nhap();
begin
  if p_khoa then
    perform 1 from public.booking x where x.id = p_booking_id for update;
  end if;
  return query
    select x, c.nguoi_giu, c.ma_can, t.ten, c.loai
    from public.booking x
    join public.can c on c.id = x.can_id
    left join public.toa_nha t on t.id = c.toa_nha_id
    where x.id = p_booking_id and (c.nguoi_giu = v_nguoi or x.sale_id = v_nguoi);
  if not found then
    raise exception 'Không tìm thấy đặt phòng' using errcode = '42501';
  end if;
end $$;

revoke execute on function public.khoa_booking_hai_ben(uuid, boolean) from public, anon, authenticated;

-- YC5.8 bước 33 đến 36, QD12: tình trạng hủy cho chi tiết đặt phòng của chủ nhà (CN3-02) và của sale (S3-10). Không có giá,
-- khách (QD7, QD11). PQ7, PQ17.
create or replace function public.fn_tinh_trang_huy(p_booking_id uuid) returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_nguoi uuid := public.can_dang_nhap();
  v record;
  v_hai_ben boolean;
  v_tinh_trang text;
begin
  select * into v from public.khoa_booking_hai_ben(p_booking_id, false);
  v_hai_ben := (v.b).sale_id is not null and v.loai_can = 'co_lich' and v.chu_id <> (v.b).sale_id;
  v_tinh_trang := case
    when (v.b).trang_thai = 'da_huy' then 'da_huy'
    when (v.b).huy_tra_loi = 'tu_choi' then 'bi_tu_choi'
    when (v.b).huy_xin_boi is not null then 'cho_dong_y'
    else 'hieu_luc' end;
  return jsonb_build_object(
    'tinh_trang', v_tinh_trang,
    'xin_huy_duoc', v_hai_ben and v_tinh_trang = 'hieu_luc',
    'toi_xin', (v.b).huy_xin_boi is not distinct from v_nguoi,
    'tra_loi_duoc', v_hai_ben and v_tinh_trang = 'cho_dong_y' and (v.b).huy_xin_boi <> v_nguoi,
    'ten_nguoi_xin', (select coalesce(p.ten_hien_thi, p.ten) from public.profiles p where p.id = (v.b).huy_xin_boi));
end $$;

revoke execute on function public.fn_tinh_trang_huy(uuid) from public, anon, authenticated;
grant execute on function public.fn_tinh_trang_huy(uuid) to authenticated;

-- YC5.8 bước 33, QD12, PQ7, PQ17, YC12 "Xin hủy đặt phòng": ghi ai xin, lúc nào; báo bên kia (không có công tắc). Xin hủy không
-- hết hạn (YC5-H18 đang tạm làm); đã qua ngày trả, sale bị ngừng vẫn xin được (YC5-H14, YC5-H15 database đang cho).
create or replace function public.fn_xin_huy(p_booking_id uuid) returns void
language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_nguoi uuid := public.can_dang_nhap();
  v record;
begin
  select * into v from public.khoa_booking_hai_ben(p_booking_id, true);
  -- YC5.8-NT6: khách lẻ chủ nhà xóa thẳng (YC5.7); căn tự nhập không có bên kia.
  if (v.b).sale_id is null or v.loai_can <> 'co_lich' or v.chu_id = (v.b).sale_id then
    raise exception 'Đặt phòng này không cần xin hủy' using errcode = 'P0001';
  end if;
  if (v.b).trang_thai = 'da_huy' then
    raise exception 'Đặt phòng đã hủy' using errcode = 'P0001';
  end if;
  if (v.b).huy_tra_loi = 'tu_choi' then
    raise exception 'Lời xin hủy đã bị từ chối, không xin hủy lại được.' using errcode = 'P0001';
  end if;
  if (v.b).huy_xin_boi is not null then
    raise exception 'Đã có lời xin hủy đang chờ bên kia trả lời' using errcode = 'P0001';
  end if;

  update public.booking set huy_xin_boi = v_nguoi, huy_xin_luc = now() where id = p_booking_id;

  insert into public.thong_bao (nguoi_nhan, loai, noi_dung, doi_tuong_loai, doi_tuong_id)
  select case when v_nguoi = v.chu_id then (v.b).sale_id else v.chu_id end, 'xin_huy',
         jsonb_build_object('ten_nguoi_xin', coalesce(p.ten_hien_thi, p.ten), 'ten_toa', v.ten_toa, 'ma_can', v.ma_can,
                            'ngay_nhan', (v.b).ngay_nhan, 'ngay_tra', (v.b).ngay_tra),
         'booking', p_booking_id
  from public.profiles p where p.id = v_nguoi;
end $$;

revoke execute on function public.fn_xin_huy(uuid) from public, anon, authenticated;
grant execute on function public.fn_xin_huy(uuid) to authenticated;

-- YC5.8 bước 35, 36, QD6, QD12, PQ7, PQ17, YC12 "Trả lời xin hủy": bên kia đồng ý thì đã hủy (các đêm thôi chiếm lịch nhờ ràng
-- buộc booking_khong_trung chỉ xét đặt phòng chưa hủy), không đồng ý thì ghi lúc từ chối. Báo bên xin.
create or replace function public.fn_tra_loi_huy(p_booking_id uuid, p_dong_y boolean) returns void
language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_nguoi uuid := public.can_dang_nhap();
  v record;
begin
  select * into v from public.khoa_booking_hai_ben(p_booking_id, true);
  if p_dong_y is null then
    raise exception 'Chọn đồng ý hay không đồng ý' using errcode = 'P0001';
  end if;
  if (v.b).trang_thai = 'da_huy' or (v.b).huy_xin_boi is null or (v.b).huy_tra_loi is not null then
    raise exception 'Không có lời xin hủy đang chờ trả lời' using errcode = 'P0001';
  end if;
  -- YC5.8-NT4
  if (v.b).huy_xin_boi = v_nguoi then
    raise exception 'Người xin hủy không tự đồng ý được. Bên kia phải trả lời.' using errcode = 'P0001';
  end if;

  update public.booking
     set huy_tra_loi = case when p_dong_y then 'dong_y' else 'tu_choi' end,
         huy_tra_loi_boi = v_nguoi, huy_tra_loi_luc = now(),
         trang_thai = case when p_dong_y then 'da_huy' else trang_thai end
   where id = p_booking_id;
  if p_dong_y then
    update public.can set lich_doi_luc = now() where id = (v.b).can_id;
  end if;

  insert into public.thong_bao (nguoi_nhan, loai, noi_dung, doi_tuong_loai, doi_tuong_id)
  select (v.b).huy_xin_boi, 'tra_loi_huy',
         jsonb_build_object('ten_nguoi_tra_loi', coalesce(p.ten_hien_thi, p.ten), 'dong_y', p_dong_y, 'ten_toa', v.ten_toa,
                            'ma_can', v.ma_can, 'ngay_nhan', (v.b).ngay_nhan, 'ngay_tra', (v.b).ngay_tra),
         'booking', p_booking_id
  from public.profiles p where p.id = v_nguoi;
end $$;

revoke execute on function public.fn_tra_loi_huy(uuid, boolean) from public, anon, authenticated;
grant execute on function public.fn_tra_loi_huy(uuid, boolean) to authenticated;
