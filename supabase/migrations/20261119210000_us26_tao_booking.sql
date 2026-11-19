-- US26 · Mở form, chọn căn và ngày, kiểm trùng sớm (YC5.1). Lệnh ghi đặt phòng fn_tao_booking với đủ tham số của
-- YC5.3 bước 9; US26 làm phần kiểm căn và ngày, tạm ghi khách lẻ. US27, US28 thay bằng create or replace (người đặt,
-- tiền từng đêm theo bảng giá, phần riêng, thông báo). Chỉ thêm, không sửa migration cũ.

-- YC5.2 bước 8c: ghi chú của đặt phòng (CN3 hiện).
alter table public.booking add column ghi_chu text;

-- YC5.1 bước 9 (YC5.3), QT1.1, QD6, QT5.5, QT5.6, PQ7.CHU, KT-DB.3.2, KT-DB.3.10.
-- Lỗi quyền 42501 chung cho căn không phải của người gọi (không lộ căn có tồn tại); lỗi dữ liệu P0001 kèm câu Luật kiểm.
create or replace function public.fn_tao_booking(
  p_can_id uuid,
  p_ngay_nhan date,
  p_ngay_tra date,
  p_tien_phong bigint,
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
  v_tt text;
begin
  -- QT5.6: gửi lại cùng mã lần gửi thì trả đặt phòng đã có, không ghi lần hai.
  if p_client_id is not null then
    select id into v_id from public.booking where tao_boi = v_nguoi and client_id = p_client_id;
    if v_id is not null then return v_id; end if;
    v_id := gen_random_uuid();
  end if;

  -- PQ7.CHU, YC5.3 Luật kiểm "Căn": căn có lịch, của chính người gọi, chưa ẩn.
  if not exists (select 1 from public.can c
                 where c.id = p_can_id and c.nguoi_giu = v_nguoi and c.loai = 'co_lich' and c.an_luc is null) then
    raise exception 'Không tìm thấy căn' using errcode = '42501';
  end if;

  -- YC5.1-NT6: ngày trả sau ngày nhận, tối đa 365 đêm. Ngày nhận trong quá khứ được phép.
  if p_ngay_nhan is null or p_ngay_tra is null or p_ngay_tra <= p_ngay_nhan then
    raise exception 'Ngày trả phải sau ngày nhận' using errcode = 'P0001';
  end if;
  v_dem := p_ngay_tra - p_ngay_nhan;
  if v_dem > 365 then
    raise exception 'Một đặt phòng dài tối đa 365 đêm' using errcode = 'P0001';
  end if;

  -- YC5.3 Luật kiểm "Tiền phòng": bắt buộc, database không tự điền.
  if p_tien_phong is null then
    raise exception 'Cần nhập tiền phòng' using errcode = 'P0001';
  end if;
  if p_tien_phong <= 0 then
    raise exception 'Tiền phòng phải lớn hơn 0' using errcode = 'P0001';
  end if;

  -- QT6.1: trạng thái tiền của form ("da_coc_con_thu") lưu là 'da_coc'. Kiểm đủ ở US28.
  v_tt := case coalesce(p_trang_thai_tien, 'chua_coc') when 'da_coc_con_thu' then 'da_coc' else coalesce(p_trang_thai_tien, 'chua_coc') end;

  begin
    -- US26 tạm ghi khách lẻ (người đặt, khách: US27, US28). QD6: ràng buộc booking_khong_trung chặn trùng đêm.
    -- QT4.2, KT-DB.3.10: tiền từng đêm ghi cùng câu lệnh với đặt phòng (khớp cả khi ràng buộc chạy ngay). Tạm chia đều
    -- tiền phòng cho các đêm, phần lẻ dồn đêm cuối (giá theo bảng giá: US28).
    with b as (
      insert into public.booking (id, can_id, ngay_nhan, ngay_tra, nguon, sale_id, tao_boi, tien_phong,
                                  trang_thai_tien, tien_coc, client_id, ghi_chu)
      values (v_id, p_can_id, p_ngay_nhan, p_ngay_tra, 'chu_ghi', null, v_nguoi, p_tien_phong,
              v_tt, case when v_tt = 'da_coc' then p_tien_coc end, p_client_id, nullif(btrim(coalesce(p_ghi_chu, '')), ''))
      returning id
    )
    insert into public.booking_dem (booking_id, dem, tien)
    select b.id, p_ngay_nhan + i,
           case when i = v_dem - 1 then p_tien_phong - (p_tien_phong / v_dem) * (v_dem - 1) else p_tien_phong / v_dem end
    from b, generate_series(0, v_dem - 1) i;
  exception
    when exclusion_violation then
      raise exception 'Căn đã có đặt phòng trong những đêm này' using errcode = 'P0001';
    when unique_violation then
      -- Hai lệnh cùng mã lần gửi chạy cùng lúc: trả đặt phòng của lệnh trước.
      select id into v_id from public.booking where tao_boi = v_nguoi and client_id = p_client_id;
      if v_id is not null then return v_id; end if;
      raise;
  end;

  return v_id;
end $$;

revoke execute on function public.fn_tao_booking(uuid, date, date, bigint, uuid, uuid, text, text, text, bigint, int, time, time, text)
  from public, anon, authenticated;
grant execute on function public.fn_tao_booking(uuid, date, date, bigint, uuid, uuid, text, text, text, bigint, int, time, time, text)
  to authenticated;
