-- =====================================================================================
-- 20261118000300_thong_bao_gui_khach.sql · Thông báo trong app, lần gửi khách, tìm gần đây
-- Vì sao: bản đầu chỉ báo trong app; thông báo ghi trong cùng giao dịch với việc gây ra nó (luật chung Nghiep_vu.md)
-- Thay đổi: thong_bao, lan_gui_khach, tim_gan_day; ghi_thong_bao, the_can; các trigger tb_*;
--           fn_mo_app, fn_danh_dau_da_doc, fn_ghi_lan_gui, fn_ghi_tim
-- Tương thích ngược: chỉ thêm
-- Kiểm thử: tests/db/t_08_thong_bao.sql
-- =====================================================================================
-- Thông báo sinh bằng trigger trên bảng, không rải trong từng hàm fn_*: mọi đường ghi (kể cả đường thêm sau này)
-- đều sinh thông báo giống nhau, và hàm ghi không phải nhớ gọi.
--
-- Luật cho du_lieu (PQ19): chụp lúc ghi; không tên khách, không số điện thoại; thông báo gửi sale không có tên sale khác,
-- không tên người đặt, không tiền cọc, không giá bán của ai; thông báo gửi chủ nhà không có giá bán.

create table public.thong_bao (
  id uuid primary key default gen_random_uuid(),
  nguoi_nhan uuid not null references public.profiles(id),
  loai text not null check (loai in (
    'chu_dong_y_ket_noi', 'chu_chap_nhan_yeu_cau', 'chu_sua_booking', 'chu_tu_choi_yeu_cau', 'yeu_cau_het_han', 'chu_them_can',
    'sale_gui_yeu_cau', 'sale_xin_xem_lich', 'chu_xoa_tai_khoan', 'can_da_gui_co_nguoi_dat', 'chu_ngung_ket_noi',
    'xin_huy_booking', 'tra_loi_huy_booking', 'chu_ghi_booking_cho_sale')),
  du_lieu jsonb not null default '{}'::jsonb,
  booking_id uuid,
  yeu_cau_id uuid,
  khoa_gom text,                          -- gom nhiều thông báo kết nối gần nhau thành một mục (mục "Thông báo kết quả kết nối cho sale" (US17), giả định GD15: 10 phút)
  tao_luc timestamptz not null default now(),
  doc_luc timestamptz
);
create index thong_bao_nguoi_idx on public.thong_bao (nguoi_nhan, tao_luc desc);

-- Lần sale gửi một căn cho khách: để báo khi căn đó có người khác đặt (mục "Gửi thông tin cho khách qua Zalo" (US14))
create table public.lan_gui_khach (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references public.profiles(id),
  can_id uuid not null references public.can(id),
  dem daterange not null check (lower_inc(dem) and not upper_inc(dem) and not isempty(dem)),
  gui_luc timestamptz not null default now(),
  da_bao boolean not null default false   -- mỗi căn mỗi lần gửi chỉ báo một lần
);
create index lan_gui_khach_can_idx on public.lan_gui_khach using gist (can_id, dem) where not da_bao;

-- 5 lần tìm gần nhất của sale, lưu ở máy chủ để đổi máy vẫn còn (giả định GD17)
create table public.tim_gan_day (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references public.profiles(id),
  dieu_kien jsonb not null,               -- ngay_nhan, ngay_tra, so_phong_ngu, loai_view, toa_nha_id
  tim_luc timestamptz not null default now()
);
create index tim_gan_day_sale_idx on public.tim_gan_day (sale_id, tim_luc desc);

-- ---------- Hàm nội bộ ----------

-- Ghi một thông báo, trừ khi người nhận đã tắt loại đó (mục "Cài đặt thông báo" (US21))
create or replace function public.ghi_thong_bao(p_nguoi uuid, p_loai text, p_du_lieu jsonb, p_booking uuid default null, p_yeu_cau uuid default null, p_khoa_gom text default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_nguoi is null then return; end if;
  if exists (select 1 from cai_dat_rieng where user_id = p_nguoi and p_loai = any (thong_bao_tat)) then return; end if;
  insert into thong_bao (nguoi_nhan, loai, du_lieu, booking_id, yeu_cau_id, khoa_gom) values (p_nguoi, p_loai, p_du_lieu, p_booking, p_yeu_cau, p_khoa_gom);
end $$;

-- Thẻ căn cho du_lieu: id, mã căn, tên tòa. Không có giá.
create or replace function public.the_can(p_can uuid) returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object('can_id', c.id, 'ma_can', c.ma_can, 'ten_toa_nha', t.ten)
    from can c left join toa_nha t on t.id = c.toa_nha_id where c.id = p_can
$$;

revoke execute on function public.ghi_thong_bao(uuid, text, jsonb, uuid, uuid, text), public.the_can(uuid) from public, anon, authenticated;

-- ---------- Trigger sinh thông báo ----------

-- Kết nối: sale được chủ nhà đồng ý lời xin xem lịch; sale bị ngừng.
-- Loại 'sale_xin_xem_lich' (báo chủ nhà) chưa sinh: máy chủ không biết sale gửi link cho ai [MỞ: CH-092].
create or replace function public.tb_ket_noi() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_ten_chu text; v_so_can int; v_khoa text;
begin
  select ten into v_ten_chu from profiles where id = new.chu_nha_id;
  if new.trang_thai = 'da_ket_noi' and (tg_op = 'INSERT' or old.trang_thai <> 'da_ket_noi') then
    if new.nguon = 'sale_xin' then
      select count(*) into v_so_can from can where nguoi_giu = new.chu_nha_id and loai = 'co_lich' and an_luc is null;
      -- gom: dùng lại khóa của thông báo kết nối chưa đọc tạo trong 10 phút trước
      select khoa_gom into v_khoa from thong_bao
       where nguoi_nhan = new.sale_id and loai = 'chu_dong_y_ket_noi' and doc_luc is null and tao_luc > now() - interval '10 minutes'
       order by tao_luc limit 1;
      perform ghi_thong_bao(new.sale_id, 'chu_dong_y_ket_noi',
        jsonb_build_object('ket_noi_id', new.id, 'chu_nha_id', new.chu_nha_id, 'ten_chu_nha', v_ten_chu, 'so_can', v_so_can),
        null, null, coalesce(v_khoa, encode(extensions.gen_random_bytes(6), 'hex')));
    end if;
  elsif tg_op = 'UPDATE' and new.trang_thai = 'chu_ngung' and old.trang_thai = 'da_ket_noi' then
    perform ghi_thong_bao(new.sale_id, 'chu_ngung_ket_noi', jsonb_build_object('ket_noi_id', new.id, 'ten_chu_nha', v_ten_chu));
  end if;
  return new;
end $$;
create trigger tb_ket_noi after insert or update of trang_thai on public.ket_noi for each row execute function public.tb_ket_noi();

-- Yêu cầu đặt phòng: báo chủ nhà khi có yêu cầu mới; báo sale khi được nhận, bị từ chối, hết hạn
create or replace function public.tb_yeu_cau() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_chu uuid; v_ten_chu text; v_goc jsonb;
begin
  select c.nguoi_giu, pr.ten into v_chu, v_ten_chu from can c join profiles pr on pr.id = c.nguoi_giu where c.id = new.can_id;
  v_goc := jsonb_build_object('can', the_can(new.can_id), 'ngay_nhan', lower(new.dem), 'ngay_tra', upper(new.dem));
  if tg_op = 'INSERT' then
    perform ghi_thong_bao(v_chu, 'sale_gui_yeu_cau',
      v_goc || jsonb_build_object('ten_sale', (select ten from profiles where id = new.sale_id),
                                  'gia_chu', tien_phong_goi_y(new.can_id, lower(new.dem), upper(new.dem))), null, new.id);
  elsif new.trang_thai <> old.trang_thai then
    v_goc := v_goc || jsonb_build_object('ten_chu_nha', v_ten_chu);
    if new.trang_thai = 'chap_nhan' then
      perform ghi_thong_bao(new.sale_id, 'chu_chap_nhan_yeu_cau',
        v_goc || jsonb_build_object('tien_phong', (select tien_phong from booking where yeu_cau_id = new.id)),
        (select id from booking where yeu_cau_id = new.id), new.id);
    elsif new.trang_thai = 'tu_choi' then
      perform ghi_thong_bao(new.sale_id, 'chu_tu_choi_yeu_cau', v_goc || jsonb_build_object('ly_do', new.ly_do_ma, 'ly_do_chu', new.ly_do_tu_choi), null, new.id);
    elsif new.trang_thai = 'het_han' then
      perform ghi_thong_bao(new.sale_id, 'yeu_cau_het_han', v_goc, null, new.id);
    end if;
  end if;
  return new;
end $$;
create trigger tb_yeu_cau after insert or update of trang_thai on public.yeu_cau_dat_phong for each row execute function public.tb_yeu_cau();

-- Booking: chủ ghi cho sale; chủ sửa ngày hay tiền của booking có sale; xin hủy và trả lời hủy;
-- và báo sale đã gửi căn cho khách khi có người KHÁC đặt trùng đêm của lần gửi (mục "Gửi thông tin cho khách qua Zalo" (US14)).
create or replace function public.tb_booking() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_ten_chu text; v_goc jsonb; v_ben_kia uuid; g record;
begin
  select ten into v_ten_chu from profiles where id = new.chu_nha_id;
  v_goc := jsonb_build_object('can', the_can(new.can_id), 'ngay_nhan', lower(new.dem), 'ngay_tra', upper(new.dem));

  if tg_op = 'INSERT' then
    if new.nguon = 'chu_tu_ghi' and new.sale_id is not null then
      perform ghi_thong_bao(new.sale_id, 'chu_ghi_booking_cho_sale', v_goc || jsonb_build_object('ten_chu_nha', v_ten_chu, 'tien_phong', new.tien_phong), new.id);
    end if;
  else
    if new.sale_id is not null and new.nguon <> 'sale_tu_ghi' and (new.dem <> old.dem or new.tien_phong <> old.tien_phong) then
      perform ghi_thong_bao(new.sale_id, 'chu_sua_booking',
        v_goc || jsonb_build_object('ten_chu_nha', v_ten_chu, 'ngay_nhan_cu', lower(old.dem), 'ngay_tra_cu', upper(old.dem),
                                    'tien_phong_cu', old.tien_phong, 'tien_phong', new.tien_phong), new.id);
    end if;
    if new.trang_thai = 'cho_huy' and old.trang_thai = 'hieu_luc' then
      v_ben_kia := case when new.xin_huy_boi = new.chu_nha_id then new.sale_id else new.chu_nha_id end;
      perform ghi_thong_bao(v_ben_kia, 'xin_huy_booking', v_goc || jsonb_build_object('ten_nguoi_xin', (select ten from profiles where id = new.xin_huy_boi)), new.id);
    elsif old.trang_thai = 'cho_huy' and new.trang_thai in ('da_huy', 'hieu_luc') then
      v_ben_kia := case when new.xin_huy_boi = new.chu_nha_id then new.sale_id else new.chu_nha_id end;
      perform ghi_thong_bao(new.xin_huy_boi, 'tra_loi_huy_booking',
        v_goc || jsonb_build_object('ten_nguoi_tra_loi', (select ten from profiles where id = v_ben_kia), 'dong_y', new.trang_thai = 'da_huy'), new.id);
    end if;
  end if;

  -- Căn đã gửi khách vừa có người khác đặt: chỉ khi booking mới chiếm đêm (thêm mới, hoặc đổi ngày), không tính căn tự nhập
  if new.nguon <> 'sale_tu_ghi' and new.trang_thai <> 'da_huy' and (tg_op = 'INSERT' or new.dem <> old.dem) then
    for g in
      select l.* from lan_gui_khach l
       where l.can_id = new.can_id and not l.da_bao and l.dem && new.dem
         and l.sale_id is distinct from new.sale_id and lower(l.dem) >= local_today()
       for update
    loop
      perform ghi_thong_bao(g.sale_id, 'can_da_gui_co_nguoi_dat',
        jsonb_build_object('lan_gui_khach_id', g.id, 'can', the_can(g.can_id), 'ngay_nhan', lower(g.dem), 'ngay_tra', upper(g.dem)));
      update lan_gui_khach set da_bao = true where id = g.id;
    end loop;
  end if;
  return new;
end $$;
create trigger tb_booking after insert or update on public.booking for each row execute function public.tb_booking();

-- Chủ nhà xóa tài khoản: báo mọi sale đang kết nối (QD-013)
create or replace function public.tb_xoa_tai_khoan() returns trigger
language plpgsql security definer set search_path = public as $$
declare k record;
begin
  if new.da_xoa_luc is not null and old.da_xoa_luc is null then
    for k in select id, sale_id from ket_noi where chu_nha_id = new.id and trang_thai = 'da_ket_noi' loop
      perform ghi_thong_bao(k.sale_id, 'chu_xoa_tai_khoan', jsonb_build_object('ket_noi_id', k.id, 'ten_chu_nha', new.ten));
    end loop;
  end if;
  return new;
end $$;
create trigger tb_xoa_tai_khoan after update of da_xoa_luc on public.profiles for each row execute function public.tb_xoa_tai_khoan();

-- Chủ nhà thêm căn có lịch: báo các sale được chia sẻ "tất cả căn" (mục "Căn mới của chủ nhà tự hiện cho sale" (US6), mục "Cài đặt thông báo" (US21))
create or replace function public.tb_can_moi() returns trigger
language plpgsql security definer set search_path = public as $$
declare k record;
begin
  if new.loai = 'co_lich' then
    for k in select id, sale_id from ket_noi where chu_nha_id = new.nguoi_giu and trang_thai = 'da_ket_noi' and pham_vi = 'tat_ca_can' loop
      perform ghi_thong_bao(k.sale_id, 'chu_them_can',
        jsonb_build_object('ket_noi_id', k.id, 'ten_chu_nha', (select ten from profiles where id = new.nguoi_giu), 'can', the_can(new.id)));
    end loop;
  end if;
  return new;
end $$;
create trigger tb_can_moi after insert on public.can for each row execute function public.tb_can_moi();

revoke execute on function public.tb_ket_noi(), public.tb_yeu_cau(), public.tb_booking(), public.tb_xoa_tai_khoan(), public.tb_can_moi() from public, anon, authenticated;

-- ---------- Hàm app gọi ----------

-- App gọi đúng một lần mỗi khi mở app hay quay lại từ nền: trả các thông báo mới kể từ lần mở trước cho popup (mục "Popup thông báo mới" (US30)),
-- rồi dời mốc. Mốc trống (lần đầu) thì trả mọi thông báo chưa đọc (giả định GD18). Không đổi trạng thái đã đọc.
-- p_client_id: gọi lại cùng khóa sau lỗi mạng thì trả đúng danh sách cũ, không dời mốc lần hai.
create or replace function public.fn_mo_app(p_client_id uuid default null) returns jsonb
language plpgsql security definer set search_path = public as $$
declare v_me uuid := can_dang_nhap(); v_moc timestamptz; v_luc timestamptz := now(); r jsonb; v_cu jsonb;
begin
  insert into cai_dat_rieng (user_id) values (v_me) on conflict do nothing;
  if p_client_id is not null then
    select new_row into v_cu from audit_log where actor_id = v_me and table_name = 'mo_app' and row_id = p_client_id;
    if found then return v_cu; end if;
  end if;
  select mo_app_luc into v_moc from cai_dat_rieng where user_id = v_me for no key update;
  select coalesce(jsonb_agg(to_jsonb(t) - 'nguoi_nhan' order by t.tao_luc desc), '[]'::jsonb) into r
    from thong_bao t
   where t.nguoi_nhan = v_me and t.doc_luc is null and t.tao_luc <= v_luc and (v_moc is null or t.tao_luc > v_moc);
  update cai_dat_rieng set mo_app_luc = greatest(coalesce(mo_app_luc, v_luc), v_luc) where user_id = v_me;
  if p_client_id is not null then
    insert into audit_log (actor_id, table_name, row_id, action, new_row) values (v_me, 'mo_app', p_client_id, 'mo_app', r);
  end if;
  return r;
end $$;

-- Đánh dấu đã đọc: một số thông báo, hoặc tất cả khi p_ids trống
create or replace function public.fn_danh_dau_da_doc(p_ids uuid[] default null) returns void
language plpgsql security definer set search_path = public as $$
declare v_me uuid := can_dang_nhap();
begin
  update thong_bao set doc_luc = now() where nguoi_nhan = v_me and doc_luc is null and (p_ids is null or id = any (p_ids));
end $$;

-- Ghi một lần sale gửi chữ hay ảnh của một căn cho khách (mục "Gửi thông tin cho khách qua Zalo" (US14))
create or replace function public.fn_ghi_lan_gui(p_can uuid, p_nhan date, p_tra date) returns uuid
language plpgsql security definer set search_path = public as $$
declare v_me uuid := can_dang_nhap(); v_id uuid;
begin
  if p_can not in (select my_shared_can_ids() union select my_own_can_ids()) then
    raise exception 'Bạn không được xem căn này' using errcode = '42501';
  end if;
  if p_tra <= p_nhan then raise exception 'Ngày trả phải sau ngày nhận' using errcode = 'P0001'; end if;
  insert into lan_gui_khach (sale_id, can_id, dem) values (v_me, p_can, daterange(p_nhan, p_tra)) returning id into v_id;
  return v_id;
end $$;

-- Ghi một lần tìm, giữ 5 lần gần nhất
create or replace function public.fn_ghi_tim(p_dieu_kien jsonb) returns void
language plpgsql security definer set search_path = public as $$
declare v_me uuid := can_dang_nhap();
begin
  delete from tim_gan_day where sale_id = v_me and dieu_kien = p_dieu_kien;
  insert into tim_gan_day (sale_id, dieu_kien) values (v_me, p_dieu_kien);
  delete from tim_gan_day where sale_id = v_me
     and id not in (select id from tim_gan_day where sale_id = v_me order by tim_luc desc limit 5);
end $$;

-- ---------- Phân quyền (RLS) ----------
alter table public.thong_bao enable row level security;
alter table public.lan_gui_khach enable row level security;
alter table public.tim_gan_day enable row level security;

-- Thông báo: chỉ người nhận. Quản trị cũng không đọc (không cần cho việc gì).
create policy thong_bao_read on public.thong_bao for select to authenticated using (nguoi_nhan = (select auth.uid()));
create policy lan_gui_khach_read on public.lan_gui_khach for select to authenticated using (sale_id = (select auth.uid()));
create policy tim_gan_day_read on public.tim_gan_day for select to authenticated using (sale_id = (select auth.uid()));

revoke execute on function public.fn_mo_app(uuid), public.fn_danh_dau_da_doc(uuid[]), public.fn_ghi_lan_gui(uuid, date, date), public.fn_ghi_tim(jsonb)
  from public, anon;
