-- US27 · Người đặt, tiền phòng, trạng thái tiền (YC5.2). fn_tao_booking thay bằng create or replace: người đặt (khách lẻ
-- hay sale đang kết nối và được xem căn), tiền từng đêm theo bảng giá (QT4.2), phần riêng của chủ nhà, trạng thái tiền và
-- cọc, giờ nhận trả mặc định. Thêm hàm giá chủ nhà từng đêm và hàm tên khách đã dùng. Chỉ thêm, không sửa migration cũ.
-- Giá bán của sale, thông báo, yêu cầu trùng thành bị từ chối: US28, US29.

-- YC5.2-NT11, YC5 Quy tắc "Giờ nhận trả mặc định": giờ của đặt phòng chép lúc lưu.
alter table public.booking add column gio_nhan time, add column gio_tra time;

-- YC5.2 bước 7, YC5 Dữ liệu, QT5.3, QT2.1, PQ5.CHU: giá chủ nhà từng đêm của căn trong [ngày nhận, ngày trả); gia null khi
-- đêm chưa có giá. Giá một đêm lấy từ fn_lich_gia_thang (một chỗ tính QT5.3). Chỉ người giữ căn gọi được; căn không phải
-- của người gọi hay không có thật cùng lỗi quyền 42501.
create or replace function public.fn_gia_chu_cac_dem(p_can_id uuid, p_ngay_nhan date, p_ngay_tra date)
returns table (dem date, gia bigint)
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_nguoi uuid := public.can_dang_nhap();
begin
  if not exists (select 1 from public.can c where c.id = p_can_id and c.nguoi_giu = v_nguoi and c.an_luc is null) then
    raise exception 'Không tìm thấy căn' using errcode = '42501';
  end if;
  if p_ngay_nhan is null or p_ngay_tra is null or p_ngay_tra <= p_ngay_nhan then
    raise exception 'Ngày trả phải sau ngày nhận' using errcode = 'P0001';
  end if;
  if p_ngay_tra - p_ngay_nhan > 365 then
    raise exception 'Một đặt phòng dài tối đa 365 đêm' using errcode = 'P0001';
  end if;
  return query
  select l.dem, l.gia
  from generate_series(date_trunc('month', p_ngay_nhan), date_trunc('month', p_ngay_tra - 1), interval '1 month') m
  cross join lateral public.fn_lich_gia_thang(p_can_id, m::date) l
  where l.dem >= p_ngay_nhan and l.dem < p_ngay_tra
  order by l.dem;
end $$;

revoke execute on function public.fn_gia_chu_cac_dem(uuid, date, date) from public, anon, authenticated;
grant execute on function public.fn_gia_chu_cac_dem(uuid, date, date) to authenticated;

-- QT4.2, QD10, KT-DB.3.10: tiền từng đêm khi ghi. Mọi đêm có giá và tổng bảng giá bằng tiền phòng thì mỗi đêm giữ giá
-- của nó; không thì chia đều, phần lẻ dồn đêm cuối (tach_tien_theo_dem). Hàm nội bộ, gọi từ fn_tao_booking (người gọi
-- đã được kiểm giữ căn); app không gọi.
create or replace function public.tien_cac_dem(p_can_id uuid, p_ngay_nhan date, p_ngay_tra date, p_tong bigint)
returns bigint[]
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_gia bigint[];
  v_so int := p_ngay_tra - p_ngay_nhan;
begin
  select array_agg(g.gia order by g.dem) into v_gia from public.fn_gia_chu_cac_dem(p_can_id, p_ngay_nhan, p_ngay_tra) g;
  if cardinality(v_gia) = v_so and array_position(v_gia, null) is null
     and (select sum(x) from unnest(v_gia) x) = p_tong then
    return v_gia;
  end if;
  return public.tach_tien_theo_dem(p_tong, v_so);
end $$;

revoke execute on function public.tien_cac_dem(uuid, date, date, bigint) from public, anon, authenticated;

-- YC5.2, YC5.3 bước 9 và Luật kiểm, QT1.1, QT4.2, QT5.5, QT5.6, QT6.1, QD6, QD11, PQ7.CHU, PQ9.CHU, PQ17.CHU, KT-DB.3.10.
-- Lỗi quyền 42501 chung cho căn không phải của người gọi; lỗi dữ liệu P0001 kèm câu Luật kiểm.
create or replace function public.fn_tao_booking(
  p_can_id uuid,
  p_ngay_nhan date,
  p_ngay_tra date,
  -- YC5.2-NT4: lệnh bỏ hẳn tiền phòng cũng tới được phần kiểm và nhận câu "Cần nhập tiền phòng".
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
  v_tt text;
  v_coc bigint;
  v_ten text := nullif(btrim(coalesce(p_ten_khach, '')), '');
  v_sdt text := nullif(regexp_replace(coalesce(p_sdt_khach, ''), '[[:space:].-]', '', 'g'), '');
  v_ghi_chu text := nullif(btrim(coalesce(p_ghi_chu, '')), '');
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

  -- YC5.1-NT6, Luật kiểm "Ngày nhận, ngày trả".
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
    -- QD11, YC5-H12: khách của đặt phòng có sale do sale giữ; tên, số gửi kèm không ghi vào phần của chủ nhà.
    v_ten := null;
    v_sdt := null;
  end if;

  -- Luật kiểm "Tên khách", "Số điện thoại khách" (YC5-H2), "Số khách", "Ghi chú".
  if char_length(v_ten) > 100 then
    raise exception 'Tên khách dài tối đa 100 ký tự' using errcode = 'P0001';
  end if;
  if v_sdt is not null and v_sdt !~ '^[0-9]{9,11}$' then
    raise exception 'Số điện thoại khách không hợp lệ' using errcode = 'P0001';
  end if;
  if p_so_khach is not null and (p_so_khach < 1 or p_so_khach > 99) then
    raise exception 'Số khách từ 1 đến 99' using errcode = 'P0001';
  end if;
  if char_length(v_ghi_chu) > 500 then
    raise exception 'Ghi chú dài tối đa 500 ký tự' using errcode = 'P0001';
  end if;

  -- YC5.2-NT4, Luật kiểm "Tiền phòng": bắt buộc, database không tự điền.
  if p_tien_phong is null then
    raise exception 'Cần nhập tiền phòng' using errcode = 'P0001';
  end if;
  if p_tien_phong <= 0 then
    raise exception 'Tiền phòng phải lớn hơn 0' using errcode = 'P0001';
  end if;

  -- QT6.1, Luật kiểm "Trạng thái tiền": "da_coc_con_thu" của form lưu là 'da_coc'.
  v_tt := case p_trang_thai_tien
            when 'chua_coc' then 'chua_coc'
            when 'da_coc_con_thu' then 'da_coc'
            when 'da_thanh_toan' then 'da_thanh_toan'
          end;
  if v_tt is null then
    raise exception 'Trạng thái tiền không hợp lệ' using errcode = 'P0001';
  end if;

  -- YC5.2 bước 8b, YC5-H19, YC5.2-NT7 (giả định GD20): cọc chỉ khi đã cọc, để trống được, lớn hơn 0, không lớn hơn tiền phòng.
  if v_tt = 'da_coc' and p_tien_coc is not null then
    if p_tien_coc <= 0 then
      raise exception 'Tiền cọc phải lớn hơn 0' using errcode = 'P0001';
    end if;
    if p_tien_coc > p_tien_phong then
      raise exception 'Tiền cọc không được lớn hơn tiền phòng' using errcode = 'P0001';
    end if;
    v_coc := p_tien_coc;
  end if;

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
              v_tt, v_coc, p_client_id, v_ghi_chu, v_gio_nhan, v_gio_tra)
      returning id
    )
    insert into public.booking_dem (booking_id, dem, tien)
    select b.id, p_ngay_nhan + (i - 1), v_tien_dem[i]
    from b, generate_series(1, v_dem) i;
  exception
    when exclusion_violation then
      raise exception 'Căn đã có đặt phòng trong những đêm này' using errcode = 'P0001';
    when unique_violation then
      -- Hai lệnh cùng mã lần gửi chạy cùng lúc: trả đặt phòng của lệnh trước.
      select id into v_id from public.booking where tao_boi = v_nguoi and client_id = p_client_id;
      if v_id is not null then return v_id; end if;
      raise;
  end;

  -- QD11, PQ9.CHU: tên, số điện thoại, số khách chủ nhà nhập nằm ở phần riêng của chủ nhà.
  if v_ten is not null or v_sdt is not null or p_so_khach is not null then
    insert into public.booking_rieng (booking_id, nguoi_id, ten_khach, sdt_khach, so_khach)
    values (v_id, v_nguoi, v_ten, v_sdt, p_so_khach);
  end if;

  return v_id;
end $$;

revoke execute on function public.fn_tao_booking(uuid, date, date, bigint, uuid, uuid, text, text, text, bigint, int, time, time, text)
  from public, anon, authenticated;
grant execute on function public.fn_tao_booking(uuid, date, date, bigint, uuid, uuid, text, text, text, bigint, int, time, time, text)
  to authenticated;

-- YC5.2 bước 5, YC5.2-NT9, NT12, PQ9.CHU, QD11: tên khách người gọi đã nhập, mỗi tên một lần, mới nhất trước, tối đa 10.
-- Chỉ phần riêng của chính người gọi.
create or replace function public.fn_ten_khach_da_dung()
returns table (ten text)
language sql stable security definer set search_path = ''
as $$
  select r.ten_khach
  from public.booking_rieng r
  join public.booking b on b.id = r.booking_id
  where r.nguoi_id = public.can_dang_nhap() and r.ten_khach is not null
  group by r.ten_khach
  order by max(b.tao_luc) desc, r.ten_khach
  limit 10
$$;

revoke execute on function public.fn_ten_khach_da_dung() from public, anon, authenticated;
grant execute on function public.fn_ten_khach_da_dung() to authenticated;
