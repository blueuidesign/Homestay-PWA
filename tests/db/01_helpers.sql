-- Hàm dùng chung cho test database (EN2). Nạp sau 00_khung.sql, trước các file tests/db/[1-9]*.sql.
-- t.fixture() dựng "Bộ rút gọn cho test database" (docs/product/du-lieu-mau.md). Tên người là tên giả,
-- số điện thoại là số giả dạng 09000000xx. Mỗi file test gọi `select t.fixture();` ở đầu và tự tạo booking nó cần.
-- Id cố định để test gọn: t.id('hoa'), t.can('1509'), t.toa('icon40'), t.kn('hoa','hung'), t.b('B1').

-- Người: hoa, tuan, hung, lan, nga, quantri.
create or replace function t.id(ten text) returns uuid
language sql immutable as $$
  select case lower(ten)
    when 'hoa'     then '00000000-0000-0000-0000-000000000001'
    when 'tuan'    then '00000000-0000-0000-0000-000000000002'
    when 'hung'    then '00000000-0000-0000-0000-000000000003'
    when 'lan'     then '00000000-0000-0000-0000-000000000004'
    when 'nga'     then '00000000-0000-0000-0000-000000000005'
    when 'quantri' then '00000000-0000-0000-0000-000000000009'
  end::uuid
$$;

-- Căn: 1509, 3402 (Chị Hoa), 1103 (Anh Tuấn), villa (Villa Tuần Châu, căn tự nhập của Sale Hùng).
create or replace function t.can(ma text) returns uuid
language sql immutable as $$
  select case lower(ma)
    when '1509'  then '00000000-0000-0000-0001-000000001509'
    when '3402'  then '00000000-0000-0000-0001-000000003402'
    when '1103'  then '00000000-0000-0000-0001-000000001103'
    when 'villa' then '00000000-0000-0000-0001-00000000f111'
  end::uuid
$$;

-- Tòa nhà: icon40, sapphire.
create or replace function t.toa(ten text) returns uuid
language sql immutable as $$
  select case lower(ten)
    when 'icon40'   then '00000000-0000-0000-0002-000000000040'
    when 'sapphire' then '00000000-0000-0000-0002-000000000011'
  end::uuid
$$;

-- Kết nối có sẵn: hoa→hung (tat_ca), hoa→lan (chon_can, chỉ 1509).
create or replace function t.kn(chu text, sale text) returns uuid
language sql immutable as $$
  select case lower(chu) || '>' || lower(sale)
    when 'hoa>hung' then '00000000-0000-0000-0003-000000000001'
    when 'hoa>lan'  then '00000000-0000-0000-0003-000000000002'
  end::uuid
$$;

-- Id của booking hay yêu cầu tạo trong file test, theo mã đặt lúc tạo (t.tao_booking, t.tao_yeu_cau).
create or replace function t.b(ma text) returns uuid
language sql stable as $$
  select nullif(current_setting('t.ma_' || lower(ma), true), '')::uuid
$$;

-- Đếm dòng câu select trả về bằng vai hiện tại. Bị từ chối (không có quyền) thì trả null, in lỗi ra NOTICE.
-- Test "không đọc được" dùng coalesce(t.so(...), 0) = 0; test "đọc được n dòng" dùng t.bang(t.so(...), n).
create or replace function t.so(cau text) returns bigint
language plpgsql as $$
declare n bigint; ma text; cau_loi text;
begin
  execute 'select count(*) from (' || cau || ') x' into n;
  return n;
exception when others then
  get stacked diagnostics ma = returned_sqlstate, cau_loi = message_text;
  raise notice 'đọc bị từ chối: % % (%)', ma, cau_loi, cau;
  return null;
end $$;

-- Chạy câu select trả một giá trị, đổi ra text, bằng vai hiện tại. Bị lỗi thì trả null, in lỗi ra NOTICE.
-- Dùng để gọi hàm mà không làm cả file dừng khi hàm chưa có hay báo lỗi.
create or replace function t.gt(cau text) returns text
language plpgsql as $$
declare v text; ma text; cau_loi text;
begin
  execute 'select (' || cau || ')::text' into v;
  return v;
exception when others then
  get stacked diagnostics ma = returned_sqlstate, cau_loi = message_text;
  raise notice 'lỗi: % % (%)', ma, cau_loi, cau;
  return null;
end $$;

-- Chạy câu lệnh, trả mã lỗi (sqlstate) nếu bị từ chối, null nếu qua. Dùng khi hợp đồng không cố định mã lỗi.
create or replace function t.ma_loi(cau text) returns text
language plpgsql as $$
declare ma text;
begin
  execute cau;
  return null;
exception when others then
  get stacked diagnostics ma = returned_sqlstate;
  return ma;
end $$;

-- Tạo một booking và các dòng booking_dem khớp tiền (chia đều, phần lẻ dồn đêm cuối) trong MỘT câu lệnh,
-- nên vẫn chạy được khi đã `set constraints all immediate`. Chạy bằng vai chủ database (gọi sau t.thoat()).
-- p_ma: mã để lấy lại id bằng t.b(p_ma). nguon mặc định: căn tu_nhap → 'sale_tu_ghi', còn lại 'chu_ghi'.
create or replace function t.tao_booking(p_ma text, p_can uuid, p_nhan date, p_tra date, p_tien bigint,
                                         p_sale uuid default null, p_nguon text default null)
returns uuid
language plpgsql as $$
declare v_id uuid := gen_random_uuid(); v_giu uuid; v_loai text; n int := p_tra - p_nhan;
begin
  select nguoi_giu, loai into v_giu, v_loai from public.can where id = p_can;
  with b as (
    insert into public.booking (id, can_id, ngay_nhan, ngay_tra, nguon, sale_id, tao_boi, tien_phong)
    values (v_id, p_can, p_nhan, p_tra,
            coalesce(p_nguon, case when v_loai = 'tu_nhap' then 'sale_tu_ghi' else 'chu_ghi' end),
            p_sale, v_giu, p_tien)
    returning id
  )
  insert into public.booking_dem (booking_id, dem, tien)
  select b.id, p_nhan + i,
         case when i = n - 1 then p_tien - (p_tien / n) * (n - 1) else p_tien / n end
  from b, generate_series(0, n - 1) i;
  if p_ma is not null then perform set_config('t.ma_' || lower(p_ma), v_id::text, true); end if;
  return v_id;
end $$;

-- Tạo một yêu cầu đặt phòng đang chờ (trang_thai 'cho'). gia_chu_dem: giá chủ mỗi đêm, mặc định 0 mỗi đêm.
create or replace function t.tao_yeu_cau(p_ma text, p_can uuid, p_sale uuid, p_nhan date, p_tra date,
                                         p_gia_chu_dem bigint[] default null)
returns uuid
language plpgsql as $$
declare v_id uuid := gen_random_uuid();
begin
  insert into public.yeu_cau_dat_phong (id, can_id, sale_id, ngay_nhan, ngay_tra, loi_nhan, gia_chu_dem,
                                        trang_thai, gui_luc, han_luc)
  values (v_id, p_can, p_sale, p_nhan, p_tra, null,
          coalesce(p_gia_chu_dem, array_fill(0::bigint, array[p_tra - p_nhan])),
          'cho', now(), now() + interval '14 days');
  if p_ma is not null then perform set_config('t.ma_' || lower(p_ma), v_id::text, true); end if;
  return v_id;
end $$;

-- Bộ rút gọn (du-lieu-mau.md "Bộ rút gọn cho test database", số theo DLM.3). Chạy bằng vai chủ database.
create or replace function t.fixture() returns void
language plpgsql as $$
declare
  hoa uuid := t.id('hoa'); tuan uuid := t.id('tuan'); hung uuid := t.id('hung');
  lan uuid := t.id('lan'); nga uuid := t.id('nga'); qt uuid := t.id('quantri');
  thang date;
begin
  perform t.thoat();

  insert into auth.users (id) values (hoa), (tuan), (hung), (lan), (nga), (qt) on conflict (id) do nothing;

  -- on conflict: nếu migration có trigger tự tạo profiles khi thêm auth.users thì ghi đè cho đúng bộ mẫu.
  insert into public.profiles (id, ten, ten_hien_thi, so_dien_thoai, vai_chon, gio_nhan, gio_tra)
  values (hoa,  'Chị Hoa',    'Chị Hoa',    '0900000001', 'chu_nha', '14:00', '12:00'),
         (tuan, 'Anh Tuấn',   'Anh Tuấn',   '0900000002', 'chu_nha', '14:00', '12:00'),
         (hung, 'Sale Hùng',  'Sale Hùng',  '0900000003', 'sale',    null,    null),
         (lan,  'Sale Lan',   'Sale Lan',   '0900000004', 'sale',    null,    null),
         (nga,  'Sale Nga',   'Sale Nga',   '0900000005', 'sale',    null,    null),
         (qt,   'Quản trị',   'Quản trị',   '0900000009', 'chu_nha', null,    null)
  on conflict (id) do update set ten = excluded.ten, ten_hien_thi = excluded.ten_hien_thi,
    so_dien_thoai = excluded.so_dien_thoai, vai_chon = excluded.vai_chon,
    gio_nhan = excluded.gio_nhan, gio_tra = excluded.gio_tra;

  insert into public.toa_nha (id, ten, home247_dat_san, tao_boi)
  values (t.toa('icon40'), 'ICON40', true, null),
         (t.toa('sapphire'), 'Sapphire', true, null);

  insert into public.can (id, nguoi_giu, loai, ma_can, so_phong_ngu, so_giuong, toa_nha_id,
                          chu_can_ten, chu_can_sdt, gia_chu_thuong, gia_chu_cuoi_tuan)
  values (t.can('1509'),  hoa,  'co_lich', '1509', 2, 3, t.toa('icon40'),   null, null, null, null),
         (t.can('3402'),  hoa,  'co_lich', '3402', null, null, null,          null, null, null, null),
         (t.can('1103'),  tuan, 'co_lich', '1103', 3, 2, t.toa('sapphire'), null, null, null, null),
         (t.can('villa'), hung, 'tu_nhap', 'Villa Tuần Châu', null, null, null,
          'Chú Bình', '0900000099', 1400000, 1400000);

  -- Giá tháng 10, 11, 12/2026 (DLM.3).
  foreach thang in array array['2026-10-01', '2026-11-01', '2026-12-01']::date[] loop
    insert into public.gia_thang (can_id, thang, gia_thuong, gia_cuoi_tuan)
    values (t.can('1509'), thang, 900000, 1300000),
           (t.can('3402'), thang, 800000, 1100000),
           (t.can('1103'), thang, 700000, 700000);
  end loop;
  -- 3402: Dịp đặc biệt 24/10 – 25/10, 1.300.000đ (DLM.3).
  insert into public.gia_dip (can_id, tu_ngay, den_ngay, ten, gia, la_ngay_le)
  values (t.can('3402'), '2026-10-24', '2026-10-25', 'Dịp đặc biệt', 1300000, false);

  -- Kết nối: Hoa→Hùng tất cả căn; Hoa→Lan chỉ 1509. Nga chưa kết nối ai. Hùng chưa kết nối Anh Tuấn.
  insert into public.ket_noi (id, chu_id, sale_id, trang_thai, nguon, pham_vi, xem_coc)
  values (t.kn('hoa', 'hung'), hoa, hung, 'da_ket_noi', 'link_moi', 'tat_ca', true),
         (t.kn('hoa', 'lan'),  hoa, lan,  'da_ket_noi', 'link_moi', 'chon_can', true);
  insert into public.ket_noi_can (ket_noi_id, can_id) values (t.kn('hoa', 'lan'), t.can('1509'));

  -- Dữ liệu riêng của Sale Hùng (DLM.3): mức cộng mặc định +400k, 1509 +200k.
  insert into public.cai_dat_rieng (nguoi_id, muc_cong_mac_dinh, lam_tron_50k) values (hung, 400000, false);
  insert into public.muc_cong (sale_id, can_id, muc) values (hung, t.can('1509'), 200000);

  -- Một quản trị viên (quản trị viên đầu tiên). Email giả.
  insert into public.admins (email, nguoi_id, la_goc) values ('quantri@example.invalid', qt, true);
end $$;

grant execute on all functions in schema t to anon, authenticated;
