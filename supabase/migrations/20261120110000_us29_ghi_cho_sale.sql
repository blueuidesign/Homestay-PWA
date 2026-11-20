-- US29 · Ghi đặt phòng cho sale (YC5.4). Chủ nhà ghi đặt phòng có sale đứng tên qua fn_tao_booking; migration này thêm
-- giá bán điền sẵn ở phần riêng của sale. Kiểm kết nối, chia sẻ căn (US27) và thông báo (US28) đã có. Chỉ thêm, không sửa
-- migration cũ: fn_tao_booking thay bản US31, giữ nguyên mọi phần khác.

-- QT5.4, GD13, YC5-H13 (Claude tự chốt US29), PQ11.SALE: giá bán của sale cho các đêm có tiền chủ nhà cho trước (tiền từng đêm
-- của đặt phòng, QT4.2). Mỗi đêm cộng mức cộng riêng căn, không có thì mức mặc định; bật làm tròn thì làm tròn lên 50.000đ
-- từng đêm rồi mới cộng. Hàm nội bộ, app không gọi.
create or replace function public.gia_ban_tu_tien_dem(p_sale_id uuid, p_can_id uuid, p_tien_dem bigint[]) returns bigint
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_muc bigint;
  v_tron boolean;
begin
  select coalesce(m.muc, cd.muc_cong_mac_dinh, 0), coalesce(cd.lam_tron_50k, false)
    into v_muc, v_tron
  from (select 1) x
  left join public.muc_cong m on m.sale_id = p_sale_id and m.can_id = p_can_id
  left join public.cai_dat_rieng cd on cd.nguoi_id = p_sale_id;
  return (select sum(case when v_tron then ((t.tien + v_muc + 49999) / 50000) * 50000 else t.tien + v_muc end)::bigint
          from unnest(p_tien_dem) t(tien));
end $$;

revoke execute on function public.gia_ban_tu_tien_dem(uuid, uuid, bigint[]) from public, anon, authenticated;

-- YC5.2, YC5.3 bước 9 và Luật kiểm, YC5.4 bước 14, QT1.1, QT4.2, QT5.4, QT5.5, QT5.6, QT6.1, QD6, QD11, PQ7.CHU, PQ9.CHU,
-- PQ11, PQ17.CHU, KT-DB.3.10. Như US31; thêm phần riêng của sale có giá bán điền sẵn khi có sale đứng tên.
create or replace function public.fn_tao_booking(
  p_can_id uuid,
  p_ngay_nhan date,
  p_ngay_tra date,
  p_tien_phong bigint default null,
  p_client_id uuid default null,
  p_sale_id uuid default null,
  p_ten_khach text default null,
  p_sdt_khach text default null,
  p_trang_thai_tien text default 'chua_coc',
  p_tien_coc bigint default null,
  p_so_khach int default null,
  p_gio_nhan time default null,
  p_gio_tra time default null,
  p_ghi_chu text default null
) returns uuid
language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_nguoi uuid := public.can_dang_nhap();
  v_id uuid := gen_random_uuid();
  v_dem int;
  v_k record;
  v_ten text;
  v_sdt text;
  v_gio_nhan time;
  v_gio_tra time;
  v_tien_dem bigint[];
  v_kn public.ket_noi%rowtype;
begin
  -- QT5.6: gửi lại cùng mã lần gửi thì trả đặt phòng đã có, không ghi lần hai.
  if p_client_id is not null then
    select id into v_id from public.booking where tao_boi = v_nguoi and client_id = p_client_id;
    if v_id is not null then return v_id; end if;
    v_id := gen_random_uuid();
  end if;

  -- PQ7.CHU, Luật kiểm "Căn": căn có lịch, của chính người gọi, chưa ẩn.
  if not exists (select 1 from public.can c
                 where c.id = p_can_id and c.nguoi_giu = v_nguoi and c.loai = 'co_lich' and c.an_luc is null) then
    raise exception 'Không tìm thấy căn' using errcode = '42501';
  end if;

  -- YC5.1-NT6, Luật kiểm "Ngày nhận, ngày trả" (kiểm trước người đặt như US27).
  if p_ngay_nhan is null or p_ngay_tra is null or p_ngay_tra <= p_ngay_nhan then
    raise exception 'Ngày trả phải sau ngày nhận' using errcode = 'P0001';
  end if;
  v_dem := p_ngay_tra - p_ngay_nhan;
  if v_dem > 365 then
    raise exception 'Một đặt phòng dài tối đa 365 đêm' using errcode = 'P0001';
  end if;

  -- YC5.2 bước 6c, Luật kiểm "Người đặt", PQ17.CHU: sale đang kết nối với người gọi và được xem căn này.
  if p_sale_id is not null then
    select * into v_kn from public.ket_noi k
    where k.chu_id = v_nguoi and k.sale_id = p_sale_id and k.trang_thai = 'da_ket_noi';
    if not found then
      raise exception 'Sale này không đang kết nối với bạn' using errcode = 'P0001';
    end if;
    if v_kn.pham_vi <> 'tat_ca'
       and not exists (select 1 from public.ket_noi_can kc where kc.ket_noi_id = v_kn.id and kc.can_id = p_can_id) then
      raise exception 'Sale này không được xem căn này' using errcode = 'P0001';
    end if;
  end if;

  -- YC5 Dữ liệu: kiểm dữ liệu dùng chung cho ghi và sửa.
  -- QD11, YC5-H12: khách của đặt phòng có sale do sale giữ; tên, số gửi kèm không ghi, không kiểm.
  select * into v_k from public.kiem_du_lieu_booking(p_ngay_nhan, p_ngay_tra, p_tien_phong, p_trang_thai_tien, p_tien_coc,
                                                     case when p_sale_id is null then p_ten_khach end,
                                                     case when p_sale_id is null then p_sdt_khach end, p_so_khach, p_ghi_chu);
  v_ten := v_k.o_ten_khach;
  v_sdt := v_k.o_sdt_khach;

  -- YC5.2-NT11: không gửi giờ thì lấy cài đặt của chủ nhà lúc lưu (mặc định 14:00, 12:00).
  select coalesce(p_gio_nhan, p.gio_nhan, '14:00'), coalesce(p_gio_tra, p.gio_tra, '12:00')
    into v_gio_nhan, v_gio_tra
  from public.profiles p where p.id = v_nguoi;
  v_gio_nhan := coalesce(v_gio_nhan, p_gio_nhan, '14:00');
  v_gio_tra := coalesce(v_gio_tra, p_gio_tra, '12:00');

  -- QT4.2: tiền từng đêm theo bảng giá lúc ghi.
  v_tien_dem := public.tien_cac_dem(p_can_id, p_ngay_nhan, p_ngay_tra, p_tien_phong);

  begin
    -- QD6: ràng buộc booking_khong_trung chặn trùng đêm. KT-DB.3.10: tiền từng đêm ghi cùng câu lệnh với đặt phòng.
    with b as (
      insert into public.booking (id, can_id, ngay_nhan, ngay_tra, nguon, sale_id, tao_boi, tien_phong,
                                  trang_thai_tien, tien_coc, client_id, ghi_chu, gio_nhan, gio_tra)
      values (v_id, p_can_id, p_ngay_nhan, p_ngay_tra, 'chu_ghi', p_sale_id, v_nguoi, p_tien_phong,
              v_k.o_trang_thai_tien, v_k.o_tien_coc, p_client_id, v_k.o_ghi_chu, v_gio_nhan, v_gio_tra)
      returning id
    )
    insert into public.booking_dem (booking_id, dem, tien)
    select b.id, p_ngay_nhan + (i - 1), v_tien_dem[i]
    from b, generate_series(1, v_dem) i;
  exception
    when exclusion_violation then
      raise exception 'Căn đã có đặt phòng trong những đêm này' using errcode = 'P0001';
    when unique_violation then
      select id into v_id from public.booking where tao_boi = v_nguoi and client_id = p_client_id;
      if v_id is not null then return v_id; end if;
      raise;
  end;

  -- QD11, PQ9.CHU: tên, số điện thoại, số khách chủ nhà nhập nằm ở phần riêng của chủ nhà.
  if v_ten is not null or v_sdt is not null or p_so_khach is not null then
    insert into public.booking_rieng (booking_id, nguoi_id, ten_khach, sdt_khach, so_khach)
    values (v_id, v_nguoi, v_ten, v_sdt, p_so_khach);
  end if;

  -- YC5.4 bước 14, YC5.4-NT1, QT5.4, GD13, YC5-H13 (Claude tự chốt US29), QD11, PQ11: đặt phòng có sale đứng tên thì phần
  -- riêng của sale có giá bán điền sẵn, cộng từng đêm: tiền đêm + mức cộng của sale cho căn (không có thì mức mặc định),
  -- sale bật làm tròn thì làm tròn lên 50.000đ từng đêm.
  if p_sale_id is not null then
    insert into public.booking_rieng (booking_id, nguoi_id, tien_thu_khach)
    select v_id, p_sale_id, public.gia_ban_tu_tien_dem(p_sale_id, p_can_id, v_tien_dem);
  end if;

  return v_id;
end $$;

revoke execute on function public.fn_tao_booking(uuid, date, date, bigint, uuid, uuid, text, text, text, bigint, int, time, time, text)
  from public, anon, authenticated;
grant execute on function public.fn_tao_booking(uuid, date, date, bigint, uuid, uuid, text, text, text, bigint, int, time, time, text)
  to authenticated;
