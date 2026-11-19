-- US48 · Gửi thông tin cho khách (YC8.1). Lệnh soạn tin fn_soan_tin_gui_khach (không ghi gì), lệnh ghi lần gửi
-- fn_ghi_lan_gui, trigger báo lần gửi khi đặt phòng đổi căn hay ngày. Chỉ thêm, không sửa migration cũ.
-- Đọc lần gửi: policy lan_gui_khach_doc của EN2 (PQ12.SALE). Báo khi tạo đặt phòng: tg_booking_sau_khi_ghi của US28.

-- YC8.1-NT6, PQ3.SALE, PQ14.SALE, KT-DB.3.3: căn người gọi được gửi khách: căn được chia sẻ, căn của chính mình chưa ẩn
-- (kể cả căn tự nhập). Hàm nội bộ, app không gọi.
create or replace function public.can_gui_khach_duoc(p_nguoi uuid) returns setof uuid
language sql stable security definer set search_path = ''
as $$
  select c.id from public.can c where c.nguoi_giu = p_nguoi and c.an_luc is null
  union
  select public.my_shared_can_ids()
$$;

-- YC8-H1, YC8.1-NT6, NT12: kiểm danh sách căn và khoảng ngày của hai lệnh; từ chối cả lệnh. Hàm nội bộ.
create or replace function public.kiem_lenh_gui_khach(p_nguoi uuid, p_can_ids uuid[], p_tu date, p_den date) returns void
language plpgsql stable security definer set search_path = ''
as $$
begin
  if p_tu is null or p_den is null then
    raise exception 'Chưa chọn ngày' using errcode = 'P0001';
  end if;
  if p_den <= p_tu or p_den - p_tu > 31 then
    raise exception 'Khoảng ngày không hợp lệ' using errcode = 'P0001';
  end if;
  if p_can_ids is null or coalesce(cardinality(p_can_ids), 0) = 0 or cardinality(p_can_ids) > 10 then
    raise exception 'Mỗi lần gửi tối đa 10 căn. Quay lại bỏ bớt căn.' using errcode = '22023';
  end if;
  if exists (select 1 from unnest(p_can_ids) x(id)
             where x.id is null or x.id not in (select public.can_gui_khach_duoc(p_nguoi))) then
    raise exception 'Bạn không còn xem được mục này' using errcode = '42501';
  end if;
end $$;

-- YC8 "Chỉ giá bán trong tin", QT5.4, PQ11.KHACH: giá một đêm trong tin gửi khách. Căn có lịch của chính người gọi: giá
-- của mình; căn được chia sẻ, căn tự nhập: giá bán (giá chủ + mức cộng). Null khi đêm chưa có giá. Hàm nội bộ.
create or replace function public.gia_gui_khach_dem(p_nguoi uuid, p_can_id uuid, p_dem date) returns bigint
language sql stable security definer set search_path = ''
as $$
  select case when c.nguoi_giu = p_nguoi and c.loai = 'co_lich' then public.gia_chu_dem(p_can_id, p_dem)
              else public.gia_ban_dem(p_nguoi, p_can_id, p_dem) end
  from public.can c where c.id = p_can_id
$$;

-- YC8.1 bước 2, 3, YC8.1-NT1, NT4, NT5, NT6, NT12, NT14, YC8-H1, H4, H6, YC8 "Dữ liệu", "Mẫu tin gửi khách", glossary
-- "Phòng ngủ và số giường", PQ3.SALE, PQ5.KHACH, PQ11.SALE, PQ14.SALE, KT-DB.3.3, KT-DB.3.5.
-- Soạn tin cho danh sách căn (thứ tự giữ nguyên) và khoảng p_tu tới trước p_den: chữ từng căn, giá bán, ảnh (10 ảnh đầu).
-- Không trả giá chủ nhà, mức cộng, số khách, tiện ích. Không ghi gì.
create or replace function public.fn_soan_tin_gui_khach(p_can_ids uuid[], p_tu date, p_den date) returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_nguoi uuid := public.can_dang_nhap();
  v_so_dem integer;
  v_khoang text;
  v_ds jsonb;
begin
  perform public.kiem_lenh_gui_khach(v_nguoi, p_can_ids, p_tu, p_den);
  v_so_dem := p_den - p_tu;
  v_khoang := to_char(p_tu, 'DD/MM') || ' → ' || to_char(p_den, 'DD/MM') || ' (' || v_so_dem || ' đêm)';

  with ds as (
    select x.id, x.thu_tu, c.ma_can, tn.ten as ten_toa, tn.khu_vuc, c.so_phong_ngu, c.so_giuong, c.loai_view,
           (select case when count(g.gia) = v_so_dem then sum(g.gia)::bigint end
            from (select public.gia_gui_khach_dem(v_nguoi, x.id, d::date) as gia
                  from generate_series(p_tu, p_den - 1, interval '1 day') d) g) as tong
    from unnest(p_can_ids) with ordinality x(id, thu_tu)
    join public.can c on c.id = x.id
    left join public.toa_nha tn on tn.id = c.toa_nha_id
  ), chu as (
    select ds.*,
           concat_ws(' · ',
             concat_ws(' ', nullif(btrim(ds.ten_toa), ''), ds.ma_can),
             case when ds.so_phong_ngu = 0 then 'Studio' when ds.so_phong_ngu is not null then ds.so_phong_ngu || 'PN' end,
             case when ds.so_giuong > 0 then ds.so_giuong || ' giường' end)
           || coalesce(', ' || nullif(concat_ws(' ',
                case when nullif(btrim(ds.loai_view), '') is not null then 'view ' ||
                  case btrim(ds.loai_view) when 'bien' then 'biển' when 'thanh_pho' then 'thành phố' when 'nui' then 'núi'
                    else lower(btrim(ds.loai_view)) end end,
                nullif(btrim(ds.khu_vuc), '')), ''), '')
           || chr(10) || v_khoang
           || case when ds.tong is null then '. Giá: hỏi lại'
                   else ': ' || replace(to_char(ds.tong, 'FM999,999,999,999'), ',', '.') || 'đ' end as chu
    from ds
  )
  select jsonb_agg(jsonb_build_object(
           'can_id', chu.id, 'ma_can', chu.ma_can, 'ten_toa', chu.ten_toa,
           'so_phong_ngu', chu.so_phong_ngu, 'so_giuong', chu.so_giuong,
           'chu', chu.chu,
           'so_anh', (select count(*) from public.anh_can a where a.can_id = chu.id),
           'anh', coalesce((select jsonb_agg(a.duong_dan order by a.thu_tu nulls last, a.tao_luc, a.id)
                            from (select * from public.anh_can a where a.can_id = chu.id
                                  order by a.thu_tu nulls last, a.tao_luc, a.id limit 10) a), '[]'::jsonb),
           'tong_gia_ban', chu.tong) order by chu.thu_tu)
    into v_ds
  from chu;

  return jsonb_build_object(
    'tu', p_tu, 'den', p_den, 'so_dem', v_so_dem,
    'mau_tin', coalesce(
      (select nullif(btrim(cd.mau_tin), '') from public.cai_dat_rieng cd where cd.nguoi_id = v_nguoi),
      'Em gửi anh chị [Số căn] căn còn trống [Ngày] ([Số đêm]):' || chr(10) || '[Danh sách căn]' || chr(10)
      || 'Anh chị ưng căn nào báo em giữ phòng nhé.'),
    'ten_sale', (select coalesce(p.ten_hien_thi, p.ten) from public.profiles p where p.id = v_nguoi),
    'can', coalesce(v_ds, '[]'::jsonb));
end $$;

-- YC8.1 bước 4 đến 7, YC8.1-NT2, NT6, NT12, NT13, YC8-H3, YC8 "Báo căn đã gửi có người đặt", PQ12.SALE, KT-DB.3.3.
-- Ghi lần gửi của người gọi cho mỗi căn: đêm p_tu tới trước p_den. Cùng căn cùng đêm đã có thì chỉ đổi lúc gửi, để mỗi
-- lần gửi chỉ báo một lần. Trả số căn đã ghi.
create or replace function public.fn_ghi_lan_gui(p_can_ids uuid[], p_tu date, p_den date) returns integer
language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_nguoi uuid := public.can_dang_nhap();
  v_id uuid;
  v_so integer := 0;
begin
  perform public.kiem_lenh_gui_khach(v_nguoi, p_can_ids, p_tu, p_den);
  for v_id in select distinct x.id from unnest(p_can_ids) x(id) loop
    update public.lan_gui_khach set gui_luc = now()
     where sale_id = v_nguoi and can_id = v_id and dem = daterange(p_tu, p_den);
    if not found then
      insert into public.lan_gui_khach (sale_id, can_id, dem) values (v_nguoi, v_id, daterange(p_tu, p_den));
    end if;
    v_so := v_so + 1;
  end loop;
  return v_so;
end $$;

-- YC8.1-NT16, YC8-H2, YC8 "Báo căn đã gửi có người đặt", QD11, PQ19.SALE: đặt phòng đổi căn hay ngày sang ít nhất một đêm
-- của lần gửi còn hiệu lực mà trước đó không chạm: báo sale như tg_booking_sau_khi_ghi (một lần cho mỗi lần gửi, chỉ căn
-- và ngày; không báo người sửa, người ghi, sale đứng tên; theo công tắc; chỉ sale còn được chia sẻ căn).
create or replace function public.tg_booking_bao_lan_gui_khi_sua() returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  v_ma text;
  v_ten_toa text;
begin
  select c.ma_can, t.ten into v_ma, v_ten_toa
    from public.can c left join public.toa_nha t on t.id = c.toa_nha_id where c.id = new.can_id;

  insert into public.thong_bao (nguoi_nhan, loai, noi_dung, doi_tuong_loai, doi_tuong_id)
  select lg.sale_id, 'can_da_gui_co_nguoi_dat',
         jsonb_build_object('lan_gui_id', lg.id, 'ten_toa', v_ten_toa, 'ma_can', v_ma,
                            'ngay_nhan', lower(lg.dem), 'ngay_tra', upper(lg.dem)),
         'can', new.can_id
  from public.lan_gui_khach lg
  where lg.can_id = new.can_id
    and lg.dem && new.dem
    and not (old.can_id = new.can_id and lg.dem && old.dem)
    and lg.sale_id <> new.tao_boi
    and lg.sale_id is distinct from new.sale_id
    and lg.sale_id is distinct from auth.uid()
    and public.local_today() <= lower(lg.dem)
    and public.thong_bao_bat(lg.sale_id, 'can_da_gui_co_nguoi_dat')
    and public.can_chia_se_cho_sale(lg.sale_id, new.can_id)
    and not exists (select 1 from public.thong_bao tb
                    where tb.nguoi_nhan = lg.sale_id and tb.loai = 'can_da_gui_co_nguoi_dat'
                      and tb.noi_dung ->> 'lan_gui_id' = lg.id::text);
  return null;
end $$;

create trigger booking_bao_lan_gui_khi_sua
  after update of can_id, ngay_nhan, ngay_tra on public.booking
  for each row
  when (new.trang_thai <> 'da_huy'
        and (old.can_id, old.ngay_nhan, old.ngay_tra) is distinct from (new.can_id, new.ngay_nhan, new.ngay_tra))
  execute function public.tg_booking_bao_lan_gui_khi_sua();

revoke execute on function public.can_gui_khach_duoc(uuid), public.kiem_lenh_gui_khach(uuid, uuid[], date, date),
  public.gia_gui_khach_dem(uuid, uuid, date), public.tg_booking_bao_lan_gui_khi_sua() from public, anon, authenticated;
revoke execute on function public.fn_soan_tin_gui_khach(uuid[], date, date), public.fn_ghi_lan_gui(uuid[], date, date)
  from public, anon, authenticated;
grant execute on function public.fn_soan_tin_gui_khach(uuid[], date, date), public.fn_ghi_lan_gui(uuid[], date, date)
  to authenticated;
