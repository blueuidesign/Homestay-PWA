-- US52 · Yêu cầu trùng đêm (YC9.3). Bổ sung trên US28, US51: lý do "Đã nhận đặt phòng khác" và đặt phòng đã lấy đêm trên
-- yêu cầu bị từ chối vì trùng, cờ trùng có đêm chồng (CN1-03, CN9), danh sách yêu cầu bị từ chối theo (CN9-02).
-- Chỉ thêm, không sửa migration cũ. Chặn trùng cuối là booking_khong_trung (QD6); hai lệnh chấp nhận cùng căn xếp hàng
-- nhau ở khóa căn của khoa_yeu_cau_cua_chu (US51).

-- YC9 "Quy tắc của nhóm" Một đêm một bên thắng, YC9.3 bước 3: đặt phòng đã lấy đêm của yêu cầu bị từ chối vì trùng.
alter table public.yeu_cau_dat_phong add column tu_choi_vi_booking uuid;

-- YC9.3 bước 3, 4, YC9.3-NT2, NT5, QT1.4 (giả định GD11 cho chủ tự ghi), QD6, PQ19: ghi hay sửa đặt phòng chưa hủy thì yêu
-- cầu chờ của căn có đêm chồng sang Bị từ chối, lý do "Đã nhận đặt phòng khác", trừ yêu cầu thành ra chính đặt phòng này.
-- Tên trigger xếp trước booking_sau_khi_ghi, booking_sau_khi_sua (US28, US31) nên chạy trước; hai trigger đó không còn yêu
-- cầu chờ nào để đổi. Thông báo cho sale ghi ở tg_bao_yeu_cau_bi_tu_choi (mang ly_do).
create or replace function public.tg_booking_tu_choi_yeu_cau_trung() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  update public.yeu_cau_dat_phong y
     set trang_thai = 'bi_tu_choi', ly_do_tu_choi = 'Đã nhận đặt phòng khác', tra_loi_luc = now(),
         tu_choi_vi_booking = new.id
   where y.can_id = new.can_id
     and y.trang_thai = 'cho'
     and y.dem && new.dem
     and y.id is distinct from new.yeu_cau_id;
  return null;
end $$;

create trigger booking_bi_tu_choi_yeu_cau_trung
  after insert on public.booking
  for each row when (new.trang_thai <> 'da_huy')
  execute function public.tg_booking_tu_choi_yeu_cau_trung();

create trigger booking_bi_tu_choi_yeu_cau_trung_khi_sua
  after update of can_id, ngay_nhan, ngay_tra on public.booking
  for each row
  when (new.trang_thai <> 'da_huy'
        and (old.can_id, old.ngay_nhan, old.ngay_tra) is distinct from (new.can_id, new.ngay_nhan, new.ngay_tra))
  execute function public.tg_booking_tu_choi_yeu_cau_trung();

-- YC9 "Dữ liệu" cờ trùng, YC9.3 bước 1, 2, YC9.3-NT1, PQ10.CHU, PQ11.CHU: các yêu cầu chờ khác (chưa quá hạn) cùng căn có
-- đêm chồng, kèm đêm chồng. Không giá bán, không khách. Hàm nội bộ.
create or replace function public.yeu_cau_trung_chi_tiet(p_id uuid) returns jsonb
language sql stable security definer set search_path = ''
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
           'yeu_cau_id', k.id, 'ten_sale', coalesce(s.ten_hien_thi, s.ten), 'ngay_nhan', k.ngay_nhan, 'ngay_tra', k.ngay_tra,
           'dem_trung', (select jsonb_agg(d::date order by d)
                         from generate_series(greatest(y.ngay_nhan, k.ngay_nhan), least(y.ngay_tra, k.ngay_tra) - 1,
                                              interval '1 day') d))
         order by k.gui_luc, k.ngay_nhan), '[]'::jsonb)
  from public.yeu_cau_dat_phong y
  join public.yeu_cau_dat_phong k on k.can_id = y.can_id and k.id <> y.id and k.dem && y.dem
  join public.profiles s on s.id = k.sale_id
  where y.id = p_id and y.trang_thai = 'cho' and not public.yeu_cau_qua_han(y)
    and k.trang_thai = 'cho' and not public.yeu_cau_qua_han(k)
$$;

-- YC9.3 bước 3, YC9.3-NT2, PQ10.CHU: yêu cầu bị từ chối vì đặt phòng của yêu cầu này (CN9-02). Hàm nội bộ.
create or replace function public.yeu_cau_tu_choi_theo(p_id uuid) returns jsonb
language sql stable security definer set search_path = ''
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
           'yeu_cau_id', k.id, 'ten_sale', coalesce(s.ten_hien_thi, s.ten), 'ngay_nhan', k.ngay_nhan, 'ngay_tra', k.ngay_tra)
         order by k.ngay_nhan, k.gui_luc), '[]'::jsonb)
  from public.yeu_cau_dat_phong y
  join public.yeu_cau_dat_phong k on k.tu_choi_vi_booking = y.booking_id and k.trang_thai = 'bi_tu_choi'
  join public.profiles s on s.id = k.sale_id
  where y.id = p_id and y.booking_id is not null
$$;

-- YC9.2 bước 2, YC9.3 bước 2, 3, YC9.3-NT1, NT2, PQ2.CHU, PQ10.CHU, PQ11.CHU, KT-DB.3.6: thay bản US51 để thêm trung và
-- da_tu_choi_theo. Hàm nội bộ; người gọi đã kiểm ở lệnh fn_*.
create or replace function public.yeu_cau_cho_chu(p_id uuid) returns jsonb
language sql stable security definer set search_path = ''
as $$
  select jsonb_build_object(
    'id', y.id, 'can_id', y.can_id, 'ma_can', c.ma_can, 'ten_toa', t.ten,
    'sale_id', y.sale_id, 'ten_sale', coalesce(s.ten_hien_thi, s.ten),
    'sdt_sale', case when s.da_xoa_luc is null
                      and exists (select 1 from public.ket_noi k
                                  where k.chu_id = c.nguoi_giu and k.sale_id = y.sale_id and k.trang_thai = 'da_ket_noi')
                     then nullif(btrim(coalesce(s.so_dien_thoai, '')), '') end,
    'so_dat_phong', (select count(*) from public.booking b
                     join public.can cb on cb.id = b.can_id
                     where cb.nguoi_giu = c.nguoi_giu and b.sale_id = y.sale_id and b.trang_thai <> 'da_huy'),
    'con_ket_noi', public.can_chia_se_cho_sale(y.sale_id, y.can_id),
    'ngay_nhan', y.ngay_nhan, 'ngay_tra', y.ngay_tra, 'so_dem', y.ngay_tra - y.ngay_nhan,
    'gia_chu_dem', to_jsonb(y.gia_chu_dem), 'tong_gia_chu', (select sum(x)::bigint from unnest(y.gia_chu_dem) x),
    'loi_nhan', y.loi_nhan,
    'trang_thai', case when public.yeu_cau_qua_han(y) then 'het_han' else y.trang_thai end,
    'ly_do_tu_choi', y.ly_do_tu_choi, 'gui_luc', y.gui_luc, 'han_luc', y.han_luc, 'booking_id', y.booking_id,
    'trung_voi', case when y.trang_thai = 'cho' and not public.yeu_cau_qua_han(y)
                      then public.yeu_cau_trung_voi(y.id) else '[]'::jsonb end,
    'trung', public.yeu_cau_trung_chi_tiet(y.id),
    'da_tu_choi_theo', public.yeu_cau_tu_choi_theo(y.id))
  from public.yeu_cau_dat_phong y
  join public.can c on c.id = y.can_id
  left join public.toa_nha t on t.id = c.toa_nha_id
  join public.profiles s on s.id = y.sale_id
  where y.id = p_id
$$;

-- YC9.2 bước 1, YC9.3 bước 1, YC9.3-NT1, YC9 "Dữ liệu" cờ trùng, PQ10.CHU, PQ11.CHU: khối CN1-03, thay bản US51 để thêm trung.
create or replace function public.fn_yeu_cau_dang_cho() returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_nguoi uuid := public.can_dang_nhap();
begin
  return (
    select coalesce(jsonb_agg(jsonb_build_object(
             'id', y.id, 'can_id', y.can_id, 'ma_can', c.ma_can, 'ten_toa', t.ten,
             'ten_sale', coalesce(s.ten_hien_thi, s.ten),
             'ngay_nhan', y.ngay_nhan, 'ngay_tra', y.ngay_tra, 'so_dem', y.ngay_tra - y.ngay_nhan,
             'tong_gia_chu', (select sum(x)::bigint from unnest(y.gia_chu_dem) x),
             'gui_luc', y.gui_luc, 'trung_voi', public.yeu_cau_trung_voi(y.id),
             'trung', public.yeu_cau_trung_chi_tiet(y.id))
           order by y.ngay_nhan, y.gui_luc), '[]'::jsonb)
    from public.yeu_cau_dat_phong y
    join public.can c on c.id = y.can_id
    left join public.toa_nha t on t.id = c.toa_nha_id
    join public.profiles s on s.id = y.sale_id
    where y.can_id in (select public.my_own_can_ids())
      and y.trang_thai = 'cho' and not public.yeu_cau_qua_han(y));
end $$;

revoke execute on function public.tg_booking_tu_choi_yeu_cau_trung(), public.yeu_cau_trung_chi_tiet(uuid),
  public.yeu_cau_tu_choi_theo(uuid), public.yeu_cau_cho_chu(uuid) from public, anon, authenticated;
revoke execute on function public.fn_yeu_cau_dang_cho() from public, anon, authenticated;
grant execute on function public.fn_yeu_cau_dang_cho() to authenticated;
