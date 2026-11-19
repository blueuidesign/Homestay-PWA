-- US31 · Sửa đặt phòng (YC5.6 bản 2). Lệnh sửa fn_sua_booking, phần kiểm dữ liệu dùng chung cho ghi và sửa
-- (kiem_du_lieu_booking, fn_tao_booking thay bằng create or replace để dùng chung), trigger sau khi sửa: giờ lịch đổi của
-- căn cũ và mới, yêu cầu đang chờ trùng đêm mới thành bị từ chối, thông báo "chủ sửa đặt phòng" cho sale.
-- Chỉ thêm, không sửa migration cũ.

-- YC5 Dữ liệu "Kiểm dữ liệu một chỗ dùng chung cho ghi và sửa", YC5.3 Luật kiểm, YC5-H2, YC5-H3, YC5-H19, QT4.1, QT6.1.
-- Trả giá trị đã chuẩn hóa; sai thì P0001 kèm câu Luật kiểm. Không kiểm căn, người đặt (mỗi lệnh tự kiểm quyền).
-- Hàm nội bộ, app không gọi.
create or replace function public.kiem_du_lieu_booking(
  p_ngay_nhan date, p_ngay_tra date, p_tien_phong bigint, p_trang_thai_tien text, p_tien_coc bigint,
  p_ten_khach text, p_sdt_khach text, p_so_khach int, p_ghi_chu text,
  out o_trang_thai_tien text, out o_tien_coc bigint, out o_ten_khach text, out o_sdt_khach text, out o_ghi_chu text
)
language plpgsql immutable set search_path = ''
as $$
begin
  if p_ngay_nhan is null or p_ngay_tra is null or p_ngay_tra <= p_ngay_nhan then
    raise exception 'Ngày trả phải sau ngày nhận' using errcode = 'P0001';
  end if;
  if p_ngay_tra - p_ngay_nhan > 365 then
    raise exception 'Một đặt phòng dài tối đa 365 đêm' using errcode = 'P0001';
  end if;

  o_ten_khach := nullif(btrim(coalesce(p_ten_khach, '')), '');
  o_sdt_khach := nullif(regexp_replace(coalesce(p_sdt_khach, ''), '[[:space:].-]', '', 'g'), '');
  o_ghi_chu := nullif(btrim(coalesce(p_ghi_chu, '')), '');
  if char_length(o_ten_khach) > 100 then
    raise exception 'Tên khách dài tối đa 100 ký tự' using errcode = 'P0001';
  end if;
  if o_sdt_khach is not null and o_sdt_khach !~ '^[0-9]{9,11}$' then
    raise exception 'Số điện thoại khách không hợp lệ' using errcode = 'P0001';
  end if;
  if p_so_khach is not null and (p_so_khach < 1 or p_so_khach > 99) then
    raise exception 'Số khách từ 1 đến 99' using errcode = 'P0001';
  end if;
  if char_length(o_ghi_chu) > 500 then
    raise exception 'Ghi chú dài tối đa 500 ký tự' using errcode = 'P0001';
  end if;

  if p_tien_phong is null then
    raise exception 'Cần nhập tiền phòng' using errcode = 'P0001';
  end if;
  if p_tien_phong <= 0 then
    raise exception 'Tiền phòng phải lớn hơn 0' using errcode = 'P0001';
  end if;

  o_trang_thai_tien := case p_trang_thai_tien
                         when 'chua_coc' then 'chua_coc'
                         when 'da_coc_con_thu' then 'da_coc'
                         when 'da_thanh_toan' then 'da_thanh_toan'
                       end;
  if o_trang_thai_tien is null then
    raise exception 'Trạng thái tiền không hợp lệ' using errcode = 'P0001';
  end if;
  if o_trang_thai_tien = 'da_coc' and p_tien_coc is not null then
    if p_tien_coc <= 0 then
      raise exception 'Tiền cọc phải lớn hơn 0' using errcode = 'P0001';
    end if;
    if p_tien_coc > p_tien_phong then
      raise exception 'Tiền cọc không được lớn hơn tiền phòng' using errcode = 'P0001';
    end if;
    o_tien_coc := p_tien_coc;
  end if;
end $$;

revoke execute on function public.kiem_du_lieu_booking(date, date, bigint, text, bigint, text, text, int, text)
  from public, anon, authenticated;

-- YC5.2, YC5.3 bước 9 và Luật kiểm, QT1.1, QT4.2, QT5.5, QT5.6, QT6.1, QD6, QD11, PQ7.CHU, PQ9.CHU, PQ17.CHU, KT-DB.3.10.
-- Như US27; phần kiểm dữ liệu chuyển sang kiem_du_lieu_booking (dùng chung với fn_sua_booking).
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

  return v_id;
end $$;

revoke execute on function public.fn_tao_booking(uuid, date, date, bigint, uuid, uuid, text, text, text, bigint, int, time, time, text)
  from public, anon, authenticated;
grant execute on function public.fn_tao_booking(uuid, date, date, bigint, uuid, uuid, text, text, text, bigint, int, time, time, text)
  to authenticated;

-- YC5.6 bước 26 đến 29, YC5-H3, H4, H6, H8, QT1.2, QT4.2, QT5.6, QT6.1, QD2, QD6, QD11, PQ7.CHU, PQ7.SALE, PQ9.CHU,
-- PQ11.CHU, KT-DB.3.10. Chỉ người giữ căn; đặt phòng, căn không phải của người gọi cùng lỗi quyền 42501. Gửi kèm thời
-- điểm sửa cuối app đã đọc; khác thì từ chối (bước 29), trừ khi lệnh không đổi gì (gửi lại sau khi mạng rớt, QT5.6).
-- Không đổi người đặt (YC5-H5), không đụng phần riêng của sale. Trả thời điểm sửa cuối mới.
-- Giờ lịch đổi, yêu cầu trùng đêm, thông báo cho sale: trigger booking_sau_khi_sua. Nhật ký: trigger booking_nhat_ky.
create or replace function public.fn_sua_booking(
  p_booking_id uuid,
  p_sua_luc timestamptz,
  p_can_id uuid,
  p_ngay_nhan date,
  p_ngay_tra date,
  p_tien_phong bigint default null,
  p_trang_thai_tien text default null,
  p_tien_coc bigint default null,
  p_ten_khach text default null,
  p_sdt_khach text default null,
  p_so_khach int default null,
  p_gio_nhan time default null,
  p_gio_tra time default null,
  p_ghi_chu text default null
) returns timestamptz
language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_nguoi uuid := public.can_dang_nhap();
  v_b public.booking%rowtype;
  v_r public.booking_rieng%rowtype;
  v_k record;
  v_ten text;
  v_sdt text;
  v_gio_nhan time;
  v_gio_tra time;
  v_doi_tien_dem boolean;
  v_tien_dem bigint[];
  v_moi timestamptz := clock_timestamp();
begin
  -- PQ7.CHU, PQ7.SALE: khóa dòng, chỉ người giữ căn hiện tại.
  select b.* into v_b from public.booking b join public.can c on c.id = b.can_id
  where b.id = p_booking_id and c.nguoi_giu = v_nguoi
  for update of b;
  if not found then
    raise exception 'Không tìm thấy đặt phòng' using errcode = '42501';
  end if;
  if v_b.trang_thai = 'da_huy' then
    raise exception 'Đặt phòng đã hủy, không sửa được' using errcode = 'P0001';
  end if;

  -- PQ7.CHU, Luật kiểm "Căn": căn mới có lịch, của chính người gọi, chưa ẩn.
  if not exists (select 1 from public.can c
                 where c.id = p_can_id and c.nguoi_giu = v_nguoi and c.loai = 'co_lich' and c.an_luc is null) then
    raise exception 'Không tìm thấy căn' using errcode = '42501';
  end if;

  -- YC5 Dữ liệu: kiểm như khi ghi.
  select * into v_k from public.kiem_du_lieu_booking(p_ngay_nhan, p_ngay_tra, p_tien_phong, p_trang_thai_tien, p_tien_coc,
                                                     case when v_b.sale_id is null then p_ten_khach end,
                                                     case when v_b.sale_id is null then p_sdt_khach end, p_so_khach, p_ghi_chu);

  -- YC5-H4, PQ17.CHU, PQ4.SALE: đặt phòng có sale chỉ đổi sang căn sale đó đang được xem.
  if v_b.sale_id is not null and p_can_id <> v_b.can_id and not public.can_chia_se_cho_sale(v_b.sale_id, p_can_id) then
    raise exception 'Sale này không được xem căn này' using errcode = 'P0001';
  end if;

  -- QD11, YC5-H12: đặt phòng có sale thì tên, số khách do sale giữ; chủ nhà chỉ ghi số khách vào phần của mình.
  v_ten := v_k.o_ten_khach;
  v_sdt := v_k.o_sdt_khach;
  v_gio_nhan := coalesce(p_gio_nhan, v_b.gio_nhan, '14:00');
  v_gio_tra := coalesce(p_gio_tra, v_b.gio_tra, '12:00');
  select * into v_r from public.booking_rieng r where r.booking_id = v_b.id and r.nguoi_id = v_nguoi;

  -- QT5.6, YC5.6 bước 28: lệnh không đổi gì (gửi lại sau khi đã lưu) thì trả kết quả, không ghi lần hai.
  if (v_b.can_id, v_b.ngay_nhan, v_b.ngay_tra, v_b.tien_phong, v_b.trang_thai_tien, v_b.tien_coc, v_b.ghi_chu,
      v_b.gio_nhan, v_b.gio_tra, v_r.ten_khach, v_r.sdt_khach, v_r.so_khach)
     is not distinct from
     (p_can_id, p_ngay_nhan, p_ngay_tra, p_tien_phong, v_k.o_trang_thai_tien, v_k.o_tien_coc, v_k.o_ghi_chu,
      v_gio_nhan, v_gio_tra, v_ten, v_sdt, p_so_khach) then
    return v_b.sua_luc;
  end if;

  -- YC5.6 bước 29: đặt phòng đã bị sửa ở máy khác kể từ lúc app đọc.
  if p_sua_luc is distinct from v_b.sua_luc then
    raise exception 'Đặt phòng vừa được sửa ở máy khác. Mở lại để xem bản mới.' using errcode = 'P0001';
  end if;

  -- QT4.2, YC5-H8: không đổi căn, ngày, tiền phòng thì giữ tiền từng đêm cũ; có đổi thì tính lại theo bảng giá các đêm mới.
  v_doi_tien_dem := (p_can_id, p_ngay_nhan, p_ngay_tra, p_tien_phong)
                    is distinct from (v_b.can_id, v_b.ngay_nhan, v_b.ngay_tra, v_b.tien_phong);
  if v_doi_tien_dem then
    v_tien_dem := public.tien_cac_dem(p_can_id, p_ngay_nhan, p_ngay_tra, p_tien_phong);
  end if;

  begin
    -- QD6, QT1.2: ràng buộc booking_khong_trung so dòng mới với các đặt phòng khác, không với chính nó.
    -- YC5-H6: đổi trạng thái tiền thì bỏ trạng thái nhớ để hoàn tác.
    update public.booking
       set can_id = p_can_id, ngay_nhan = p_ngay_nhan, ngay_tra = p_ngay_tra, tien_phong = p_tien_phong,
           trang_thai_tien = v_k.o_trang_thai_tien, tien_coc = v_k.o_tien_coc,
           trang_thai_tien_truoc = case when v_k.o_trang_thai_tien = v_b.trang_thai_tien then v_b.trang_thai_tien_truoc end,
           ghi_chu = v_k.o_ghi_chu, gio_nhan = v_gio_nhan, gio_tra = v_gio_tra, sua_luc = v_moi
     where id = v_b.id;
  exception
    when exclusion_violation then
      raise exception 'Căn đã có đặt phòng trong những đêm này' using errcode = 'P0001';
  end;

  -- KT-DB.3.10: tiền từng đêm khớp các đêm mới (kiểm lúc commit).
  if v_doi_tien_dem then
    delete from public.booking_dem where booking_id = v_b.id;
    insert into public.booking_dem (booking_id, dem, tien)
    select v_b.id, p_ngay_nhan + (i - 1), v_tien_dem[i]
    from generate_series(1, p_ngay_tra - p_ngay_nhan) i;
  end if;

  -- QD11, PQ9.CHU: phần riêng của chủ nhà; phần riêng của sale (khách, giá bán) giữ nguyên (YC5.6 bước 27).
  if v_r.booking_id is not null then
    update public.booking_rieng set ten_khach = v_ten, sdt_khach = v_sdt, so_khach = p_so_khach
     where booking_id = v_b.id and nguoi_id = v_nguoi;
  elsif v_ten is not null or v_sdt is not null or p_so_khach is not null then
    insert into public.booking_rieng (booking_id, nguoi_id, ten_khach, sdt_khach, so_khach)
    values (v_b.id, v_nguoi, v_ten, v_sdt, p_so_khach);
  end if;

  return v_moi;
end $$;

revoke execute on function public.fn_sua_booking(uuid, timestamptz, uuid, date, date, bigint, text, bigint, text, text, int, time, time, text)
  from public, anon, authenticated;
grant execute on function public.fn_sua_booking(uuid, timestamptz, uuid, date, date, bigint, text, bigint, text, text, int, time, time, text)
  to authenticated;

-- YC5.6 bước 26, 27, YC5-H9, YC5 Dữ liệu, QT1.4 (giả định GD11), YC12 "Chủ nhà sửa đặt phòng của sale", QD11, PQ8.SALE.
-- Sau khi đổi căn, ngày hay tiền phòng của đặt phòng chưa hủy:
--   1. đổi căn hay ngày: cập nhật giờ lịch đổi của căn cũ và căn mới (YC7 dùng); yêu cầu đang chờ của căn mới có đêm trùng
--      thành bị từ chối, trừ yêu cầu thành ra chính đặt phòng này;
--   2. đặt phòng có sale đứng tên, người sửa không phải sale đó: báo sale ngày, căn, tiền phòng cũ và mới (không khách,
--      không cọc, không giá bán), theo thong_bao_bat.
create or replace function public.tg_booking_sau_khi_sua() returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  v_ma_cu text;
  v_ma text;
  v_toa_cu text;
  v_toa text;
  v_ten_chu text;
begin
  if (old.can_id, old.ngay_nhan, old.ngay_tra) is distinct from (new.can_id, new.ngay_nhan, new.ngay_tra) then
    update public.can set lich_doi_luc = now() where id in (old.can_id, new.can_id);

    update public.yeu_cau_dat_phong y
       set trang_thai = 'bi_tu_choi', tra_loi_luc = now()
     where y.can_id = new.can_id
       and y.trang_thai = 'cho'
       and y.dem && new.dem
       and y.id is distinct from new.yeu_cau_id;
  end if;

  if new.sale_id is not null and new.sale_id is distinct from auth.uid()
     and public.thong_bao_bat(new.sale_id, 'chu_sua_dat_phong') then
    select c.ma_can, t.ten into v_ma_cu, v_toa_cu
      from public.can c left join public.toa_nha t on t.id = c.toa_nha_id where c.id = old.can_id;
    select c.ma_can, t.ten, p.ten_hien_thi into v_ma, v_toa, v_ten_chu
      from public.can c left join public.toa_nha t on t.id = c.toa_nha_id
      join public.profiles p on p.id = c.nguoi_giu
     where c.id = new.can_id;
    insert into public.thong_bao (nguoi_nhan, loai, noi_dung, doi_tuong_loai, doi_tuong_id)
    values (new.sale_id, 'chu_sua_dat_phong',
            jsonb_build_object('ten_chu', v_ten_chu,
                               'ten_toa_cu', v_toa_cu, 'ma_can_cu', v_ma_cu, 'ten_toa', v_toa, 'ma_can', v_ma,
                               'ngay_nhan_cu', old.ngay_nhan, 'ngay_tra_cu', old.ngay_tra,
                               'ngay_nhan', new.ngay_nhan, 'ngay_tra', new.ngay_tra,
                               'tien_phong_cu', old.tien_phong, 'tien_phong', new.tien_phong),
            'booking', new.id);
  end if;
  return null;
end $$;

create trigger booking_sau_khi_sua
  after update of can_id, ngay_nhan, ngay_tra, tien_phong on public.booking
  for each row
  when (new.trang_thai <> 'da_huy'
        and (old.can_id, old.ngay_nhan, old.ngay_tra, old.tien_phong)
            is distinct from (new.can_id, new.ngay_nhan, new.ngay_tra, new.tien_phong))
  execute function public.tg_booking_sau_khi_sua();

revoke execute on function public.tg_booking_sau_khi_sua() from public, anon, authenticated;
