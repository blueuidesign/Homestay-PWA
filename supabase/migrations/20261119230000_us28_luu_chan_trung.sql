-- US28 · Lưu và chặn trùng (YC5.3). fn_tao_booking của US27 đã có: chặn trùng bằng ràng buộc booking_khong_trung (QD6)
-- trả P0001 "Căn đã có đặt phòng trong những đêm này", mã lần gửi trả đặt phòng đã lưu (QT5.6), kiểm quyền người giữ căn
-- (PQ7.CHU). US28 thêm phần database làm sau khi đặt phòng được ghi, đặt ở trigger trên booking để mọi đường ghi đặt phòng
-- (chủ tự ghi, chấp nhận yêu cầu ở YC9) cùng đi qua: giờ lịch đổi của căn, yêu cầu đang chờ trùng đêm thành bị từ chối,
-- thông báo cho sale. Chỉ thêm, không sửa migration cũ.

-- YC12 "Công tắc chặn ghi": người nhận đã tắt loại thông báo này thì không ghi. Hàm nội bộ, app không gọi.
create or replace function public.thong_bao_bat(p_nguoi uuid, p_loai text) returns boolean
language sql stable security definer set search_path = ''
as $$
  select not exists (select 1 from public.cai_dat_rieng cd where cd.nguoi_id = p_nguoi and p_loai = any (cd.thong_bao_tat))
$$;

-- YC5.3 bước 9, QT1.4 (giả định GD11), QD6, YC12, YC8 "Báo căn đã gửi có người đặt", QD11, PQ19.
-- Sau khi ghi một đặt phòng chưa hủy:
--   1. cập nhật giờ lịch đổi của căn (YC7 dùng);
--   2. yêu cầu đang chờ của căn có đêm trùng thành bị từ chối, trừ yêu cầu thành ra chính đặt phòng này;
--   3. sale đã gửi khách căn này có đêm trùng: một thông báo cho mỗi lần gửi, chỉ căn và ngày; không báo người ghi, không báo
--      sale đứng tên đặt phòng, không báo khi lần gửi đã qua ngày nhận phòng; theo công tắc của sale;
--   4. chủ nhà ghi đặt phòng có sale đứng tên: báo sale đó, theo công tắc của sale.
-- Thông báo "Yêu cầu bị từ chối" ghi ở tg_bao_yeu_cau_bi_tu_choi.
create or replace function public.tg_booking_sau_khi_ghi() returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  v_can public.can%rowtype;
  v_ten_toa text;
  v_ten_chu text;
begin
  select * into v_can from public.can where id = new.can_id;
  select t.ten into v_ten_toa from public.toa_nha t where t.id = v_can.toa_nha_id;
  select p.ten_hien_thi into v_ten_chu from public.profiles p where p.id = v_can.nguoi_giu;

  update public.can set lich_doi_luc = now() where id = new.can_id;

  update public.yeu_cau_dat_phong y
     set trang_thai = 'bi_tu_choi', tra_loi_luc = now()
   where y.can_id = new.can_id
     and y.trang_thai = 'cho'
     and y.dem && new.dem
     and y.id is distinct from new.yeu_cau_id;

  insert into public.thong_bao (nguoi_nhan, loai, noi_dung, doi_tuong_loai, doi_tuong_id)
  select lg.sale_id, 'can_da_gui_co_nguoi_dat',
         jsonb_build_object('lan_gui_id', lg.id, 'ten_toa', v_ten_toa, 'ma_can', v_can.ma_can,
                            'ngay_nhan', lower(lg.dem), 'ngay_tra', upper(lg.dem)),
         'can', new.can_id
  from public.lan_gui_khach lg
  where lg.can_id = new.can_id
    and lg.dem && new.dem
    and lg.sale_id <> new.tao_boi
    and lg.sale_id is distinct from new.sale_id
    and public.local_today() <= lower(lg.dem)
    and public.thong_bao_bat(lg.sale_id, 'can_da_gui_co_nguoi_dat')
    and not exists (select 1 from public.thong_bao tb
                    where tb.nguoi_nhan = lg.sale_id and tb.loai = 'can_da_gui_co_nguoi_dat'
                      and tb.noi_dung ->> 'lan_gui_id' = lg.id::text);

  if new.sale_id is not null and new.nguon = 'chu_ghi' and new.sale_id <> new.tao_boi
     and public.thong_bao_bat(new.sale_id, 'chu_ghi_dat_phong_cho_sale') then
    insert into public.thong_bao (nguoi_nhan, loai, noi_dung, doi_tuong_loai, doi_tuong_id)
    values (new.sale_id, 'chu_ghi_dat_phong_cho_sale',
            jsonb_build_object('ten_chu', v_ten_chu, 'ten_toa', v_ten_toa, 'ma_can', v_can.ma_can,
                               'ngay_nhan', new.ngay_nhan, 'ngay_tra', new.ngay_tra),
            'booking', new.id);
  end if;
  return null;
end $$;

create trigger booking_sau_khi_ghi
  after insert on public.booking
  for each row when (new.trang_thai <> 'da_huy')
  execute function public.tg_booking_sau_khi_ghi();

-- YC12 "Yêu cầu bị từ chối" (sinh ở YC5.3, YC9.2, YC9.3), QD11, PQ19: báo sale gửi yêu cầu. Chỉ căn và ngày; không tên
-- người được nhận, không giá, không khách. Không có công tắc.
create or replace function public.tg_bao_yeu_cau_bi_tu_choi() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.thong_bao (nguoi_nhan, loai, noi_dung, doi_tuong_loai, doi_tuong_id)
  select new.sale_id, 'yeu_cau_bi_tu_choi',
         jsonb_build_object('ten_toa', t.ten, 'ma_can', c.ma_can, 'ngay_nhan', new.ngay_nhan, 'ngay_tra', new.ngay_tra),
         'yeu_cau', new.id
  from public.can c
  left join public.toa_nha t on t.id = c.toa_nha_id
  where c.id = new.can_id;
  return null;
end $$;

create trigger yeu_cau_bao_bi_tu_choi
  after update of trang_thai on public.yeu_cau_dat_phong
  for each row when (old.trang_thai = 'cho' and new.trang_thai = 'bi_tu_choi')
  execute function public.tg_bao_yeu_cau_bi_tu_choi();

revoke execute on function public.thong_bao_bat(uuid, text), public.tg_booking_sau_khi_ghi(),
  public.tg_bao_yeu_cau_bi_tu_choi() from public, anon, authenticated;
