-- EN2 · Quyền đọc: RLS, view cho sale, quyền của vai anon và authenticated (thiet-ke-db.md mục 1, 3, 4; PQ).
-- Supabase mặc định cấp mọi quyền trên bảng mới cho anon và authenticated. File này thu lại hết,
-- rồi chỉ cấp select cho authenticated; dòng nào đọc được do policy quyết định. Ghi đi qua hàm fn_*.

-- PQ Luật chung 1, 4; KT-DB.3.1: mặc định từ chối.
revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
revoke execute on all functions in schema public from public, anon, authenticated;
alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke all on sequences from anon, authenticated;
alter default privileges in schema public revoke execute on functions from public, anon, authenticated;

-- Bật RLS cho mọi bảng public.
do $$
declare r record;
begin
  for r in select tablename from pg_tables where schemaname = 'public' loop
    execute format('alter table public.%I enable row level security', r.tablename);
  end loop;
end $$;

-- Hàm policy dùng: người đã đăng nhập gọi được. Trigger và hàm nội bộ không cấp.
grant execute on function public.local_today() to authenticated;
grant execute on function public.can_dang_nhap() to authenticated;
grant execute on function public.my_own_can_ids() to authenticated;
grant execute on function public.my_shared_can_ids() to authenticated;
grant execute on function public.o_lich(uuid, date) to authenticated;
grant execute on function public.tach_tien_theo_dem(bigint, integer) to authenticated;

-- Bảng app đọc được (theo policy). admins, audit_log không có trong danh sách: app không đọc (KT-DB.3.12, QD2).
grant select on
  public.profiles, public.cai_dat_rieng, public.toa_nha, public.can, public.anh_can,
  public.ket_noi, public.ket_noi_can, public.link_moi, public.link_moi_can, public.link_xin_lich,
  public.sale_them_tay, public.gia_thang, public.gia_dip, public.ngay_le, public.muc_cong,
  public.yeu_cau_dat_phong, public.yeu_cau_rieng, public.booking, public.booking_dem, public.booking_rieng,
  public.thong_bao, public.lan_gui_khach, public.tim_gan_day
to authenticated;

-- ===== Policy đọc =====

-- PQ1, PQ2: hồ sơ đầy đủ chỉ chính mình đọc. Tên, số của người đã kết nối đọc qua v_nguoi_ket_noi.
create policy profiles_doc on public.profiles for select to authenticated
  using (id = (select auth.uid()));

-- PQ11, QD16 mục 1: chỉ chính mình.
create policy cai_dat_rieng_doc on public.cai_dat_rieng for select to authenticated
  using (nguoi_id = (select auth.uid()));

-- YC3.4, YC13: mọi người đăng nhập đọc tòa nhà, dải ngày lễ.
create policy toa_nha_doc on public.toa_nha for select to authenticated using (true);
create policy ngay_le_doc on public.ngay_le for select to authenticated using (true);

-- PQ3.CHU, PQ3.SALE, PQ14.SALE, KT-DB.3.3: người giữ căn, và sale được chia sẻ (qua my_shared_can_ids).
create policy can_doc on public.can for select to authenticated
  using (nguoi_giu = (select auth.uid()) or id in (select public.my_shared_can_ids()));

-- PQ3, QT5.7: ảnh đọc theo quyền đọc căn; ảnh tạm chỉ người tải.
create policy anh_can_doc on public.anh_can for select to authenticated
  using (
    (can_id is null and nguoi_tai = (select auth.uid()))
    or can_id in (select public.my_own_can_ids())
    or can_id in (select public.my_shared_can_ids())
  );

-- PQ17.CHU, PQ17.SALE: hai bên của kết nối.
create policy ket_noi_doc on public.ket_noi for select to authenticated
  using (chu_id = (select auth.uid()) or sale_id = (select auth.uid()));

create policy ket_noi_can_doc on public.ket_noi_can for select to authenticated
  using (exists (
    select 1 from public.ket_noi k
    where k.id = ket_noi_id and (k.chu_id = (select auth.uid()) or k.sale_id = (select auth.uid()))
  ));

-- PQ18.CHU: link mời chỉ chủ tạo đọc. Người mở link xem trước qua fn_xem_link_moi (US sau).
create policy link_moi_doc on public.link_moi for select to authenticated
  using (chu_id = (select auth.uid()));

create policy link_moi_can_doc on public.link_moi_can for select to authenticated
  using (exists (select 1 from public.link_moi l where l.id = link_id and l.chu_id = (select auth.uid())));

-- PQ18.SALE: link xin lịch chỉ sale đó đọc.
create policy link_xin_lich_doc on public.link_xin_lich for select to authenticated
  using (sale_id = (select auth.uid()));

-- YC6.2: sale thêm tay chỉ chủ nhà đó đọc.
create policy sale_them_tay_doc on public.sale_them_tay for select to authenticated
  using (chu_id = (select auth.uid()));

-- PQ5.CHU, PQ5.SALE, KT-DB.3.4, QD7: căn đã chia sẻ thì sale luôn đọc giá chủ nhà.
create policy gia_thang_doc on public.gia_thang for select to authenticated
  using (can_id in (select public.my_own_can_ids()) or can_id in (select public.my_shared_can_ids()));

create policy gia_dip_doc on public.gia_dip for select to authenticated
  using (can_id in (select public.my_own_can_ids()) or can_id in (select public.my_shared_can_ids()));

-- PQ11.SALE, KT-DB.3.6: mức cộng chỉ sale đó.
create policy muc_cong_doc on public.muc_cong for select to authenticated
  using (sale_id = (select auth.uid()));

-- PQ10.CHU, PQ10.SALE: yêu cầu: sale gửi và chủ căn.
create policy yeu_cau_doc on public.yeu_cau_dat_phong for select to authenticated
  using (sale_id = (select auth.uid()) or can_id in (select public.my_own_can_ids()));

-- PQ11.SALE, QD11, KT-DB.3.6: phần riêng của yêu cầu chỉ sale đó.
create policy yeu_cau_rieng_doc on public.yeu_cau_rieng for select to authenticated
  using (sale_id = (select auth.uid()));

-- PQ7.CHU, PQ8.CHU, KT-DB.3.5: chỉ người giữ căn đọc bảng booking. Sale xem qua v_lich_sale, v_booking_cua_sale.
create policy booking_doc on public.booking for select to authenticated
  using (can_id in (select public.my_own_can_ids()));

create policy booking_dem_doc on public.booking_dem for select to authenticated
  using (exists (
    select 1 from public.booking b
    where b.id = booking_id and b.can_id in (select public.my_own_can_ids())
  ));

-- PQ9, QD11, KT-DB.3.6: khách và tiền thu khách chỉ người nhập đọc.
create policy booking_rieng_doc on public.booking_rieng for select to authenticated
  using (nguoi_id = (select auth.uid()));

-- PQ19: thông báo của mình.
create policy thong_bao_doc on public.thong_bao for select to authenticated
  using (nguoi_nhan = (select auth.uid()));

-- PQ12.SALE, YC7.2: của chính sale.
create policy lan_gui_khach_doc on public.lan_gui_khach for select to authenticated
  using (sale_id = (select auth.uid()));
create policy tim_gan_day_doc on public.tim_gan_day for select to authenticated
  using (sale_id = (select auth.uid()));

-- admins, audit_log: bật RLS, không policy, không cấp quyền: app không đọc, không ghi.

-- ===== View =====
-- View chạy bằng quyền chủ view (không qua RLS của bảng gốc), nên tự lọc theo người gọi bên trong.

-- PQ4.SALE, KT-DB.3.5, QD7: đêm kín của căn sale được chia sẻ. Không có người đặt, không có tiền.
create view public.v_lich_sale with (security_barrier) as
  select b.can_id, g::date as dem
  from public.booking b
  cross join lateral generate_series(lower(b.dem), upper(b.dem) - 1, interval '1 day') g
  where b.trang_thai <> 'da_huy'
    and b.can_id in (select public.my_shared_can_ids());

-- PQ7.SALE, PQ8.SALE, PQ23.SALE, KT-DB.3.5, QD7, QD13: booking sale đứng tên, kể cả khi bị ngừng hay chủ
-- đã xóa tài khoản. Không có tiền cọc, trạng thái tiền ([MỞ: PQ8-H1]), khách của chủ.
create view public.v_booking_cua_sale with (security_barrier) as
  select b.id, b.can_id, c.ma_can, c.nguoi_giu as chu_id, chu.ten_hien_thi as ten_chu,
         (chu.da_xoa_luc is not null) as chu_da_xoa_tai_khoan,
         b.ngay_nhan, b.ngay_tra, b.nguon, b.tien_phong, b.trang_thai,
         b.huy_xin_boi, b.huy_xin_luc, b.huy_tra_loi, b.huy_tra_loi_luc, b.tao_luc
  from public.booking b
  join public.can c on c.id = b.can_id
  join public.profiles chu on chu.id = c.nguoi_giu
  where b.sale_id = (select auth.uid());

-- PQ1.CHU, PQ1.SALE, PQ2.CHU, PQ2.SALE, PQ23: tên, số của người kia trong kết nối đang hiệu lực.
-- Người đã xóa tài khoản: còn tên và cờ, không còn số (QD13).
create view public.v_nguoi_ket_noi with (security_barrier) as
  select p.id, p.ten_hien_thi, p.so_dien_thoai, (p.da_xoa_luc is not null) as da_xoa_tai_khoan
  from public.ket_noi k
  join public.profiles p on p.id = case when k.chu_id = (select auth.uid()) then k.sale_id else k.chu_id end
  where k.trang_thai = 'da_ket_noi'
    and (k.chu_id = (select auth.uid()) or k.sale_id = (select auth.uid()));

revoke all on public.v_lich_sale, public.v_booking_cua_sale, public.v_nguoi_ket_noi from anon, authenticated;
grant select on public.v_lich_sale, public.v_booking_cua_sale, public.v_nguoi_ket_noi to authenticated;
