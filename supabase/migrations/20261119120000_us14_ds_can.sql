-- US14 · Danh sách căn của chủ nhà (YC3.1 bước 9 đến 12). Chỉ thêm một view đọc, không thêm lệnh ghi.

-- YC3.1-NT2, YC3.1 bước 9 đến 12, PQ3.CHU, PQ13.CHU, QT5.1, GD14.
-- View chạy bằng quyền người gọi (security_invoker): RLS sẵn có của can, anh_can, booking, toa_nha vẫn áp,
-- và tự lọc thêm căn người gọi giữ, có lịch, chưa ẩn (sale được chia sẻ không thấy căn của chủ ở đây).
create view public.v_can_cua_toi with (security_invoker = true) as
  select c.id, c.ma_can, c.so_phong_ngu, c.so_giuong, c.loai_view, tn.ten as ten_toa, c.tao_luc,
         (c.tao_luc > now() - interval '24 hours') as moi_them,
         (select count(*)::int from public.anh_can a where a.can_id = c.id) as so_anh,
         (select a.duong_dan from public.anh_can a where a.can_id = c.id
           order by a.thu_tu nulls last, a.tao_luc limit 1) as anh_dai_dien,
         (select max(b.ngay_tra) from public.booking b
           where b.can_id = c.id and b.trang_thai <> 'da_huy'
             and b.dem @> public.local_today()) as khach_den
  from public.can c
  left join public.toa_nha tn on tn.id = c.toa_nha_id
  where c.nguoi_giu = (select auth.uid())
    and c.loai = 'co_lich'
    and c.an_luc is null;

revoke all on public.v_can_cua_toi from public, anon, authenticated;
grant select on public.v_can_cua_toi to authenticated;
