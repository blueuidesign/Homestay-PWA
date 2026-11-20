-- US63 · Nhắc đặt phòng chưa cọc (YC12.3). Việc định kỳ ghi thông báo "Đặt phòng chưa cọc" cho chủ căn; app không gọi được.

-- YC12.3 bước 1, GD28, GD34: mỗi đặt phòng một lần, bảo đảm ở database (không chỉ ở lệnh chạy).
create unique index if not exists thong_bao_nhac_coc_mot_lan on public.thong_bao (doi_tuong_id) where loai = 'dat_phong_chua_coc';

-- YC12.3-NT1, NT2, NT3, YC12-H3 (GD34), PQ19.CHU, YC12 "Quy tắc của nhóm" (Chép lúc ghi theo quyền người nhận, Công tắc chặn ghi).
-- Đặt phòng còn hiệu lực, "Chưa cọc", ở căn có lịch của chủ nhà, còn từ 0 đến 3 ngày tới ngày nhận (giờ Việt Nam, QT5.1) thì chủ căn có
-- một thông báo. Chủ tắt loại này thì trigger thong_bao_cong_tac chặn ghi (US64). Nội dung chỉ có tên sale (nếu có), căn, ngày, số ngày còn lại:
-- không tên khách, số điện thoại, giá bán. Chạy lại không ghi trùng. Trả số thông báo vừa ghi.
create or replace function public.fn_nhac_chua_coc() returns integer
language plpgsql volatile security definer set search_path = ''
as $$
declare v_so integer;
begin
  with ghi as (
    insert into public.thong_bao (nguoi_nhan, loai, noi_dung, doi_tuong_loai, doi_tuong_id)
    select c.nguoi_giu, 'dat_phong_chua_coc',
           jsonb_strip_nulls(jsonb_build_object(
             'ten_sale', (select coalesce(p.ten_hien_thi, p.ten) from public.profiles p where p.id = b.sale_id),
             'ten_toa', t.ten, 'ma_can', c.ma_can,
             'ngay_nhan', b.ngay_nhan, 'ngay_tra', b.ngay_tra, 'con_ngay', b.ngay_nhan - public.local_today())),
           'booking', b.id
    from public.booking b
    join public.can c on c.id = b.can_id and c.loai = 'co_lich'
    left join public.toa_nha t on t.id = c.toa_nha_id
    where b.trang_thai = 'hieu_luc' and b.trang_thai_tien = 'chua_coc'
      and b.ngay_nhan - public.local_today() between 0 and 3
    on conflict do nothing
    returning 1
  )
  select count(*) into v_so from ghi;
  return v_so;
end $$;

revoke execute on function public.fn_nhac_chua_coc() from public, anon, authenticated;

-- Lịch mỗi ngày 08:00 giờ Việt Nam (01:00 UTC) nếu máy có pg_cron (môi trường chưa bật thì bỏ qua).
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.schedule('us63-nhac-chua-coc', '0 1 * * *', 'select public.fn_nhac_chua_coc()');
  end if;
end $$;
