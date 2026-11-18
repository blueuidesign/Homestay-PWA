-- Hàm trợ giúp cho các file kiểm thử t_*.sql. Chỉ dùng trong database kiểm thử.
create schema if not exists t;
grant usage on schema t to anon, authenticated, service_role;

-- Đóng vai một người dùng đã đăng nhập (giống JWT mà Supabase gắn vào mỗi lời gọi API)
create or replace function t.login(p_uid uuid) returns void language sql as
$$ select set_config('request.jwt.claims', json_build_object('sub', p_uid, 'role', 'authenticated')::text, true) $$;
create or replace function t.logout() returns void language sql as
$$ select set_config('request.jwt.claims', '', true) $$;

create or replace function t.mk_user(p_email text, p_ten text) returns uuid language plpgsql as $$
declare v uuid;
begin
  insert into auth.users (email) values (p_email) returning id into v;
  update public.profiles set ten = p_ten where id = v;
  return v;
end $$;

create or replace function t.eq(p_actual anyelement, p_expected anyelement, p_label text) returns void language plpgsql as $$
begin
  if p_actual is distinct from p_expected then
    raise exception 'SAI: % | mong đợi: % | thực tế: %', p_label, p_expected, p_actual;
  end if;
end $$;
create or replace function t.ok(p_cond boolean, p_label text) returns void language plpgsql as $$
begin
  if p_cond is not true then raise exception 'SAI: %', p_label; end if;
end $$;

-- Câu lệnh phải báo lỗi. Không lỗi thì kiểm thử hỏng. p_like: chữ phải có trong lỗi.
create or replace function t.throws(p_sql text, p_label text, p_like text default null) returns void language plpgsql as $$
declare v_msg text;
begin
  begin
    execute p_sql;
  exception when others then
    v_msg := sqlerrm;
  end;
  if v_msg is null then raise exception 'SAI: % | lẽ ra phải bị chặn nhưng lại chạy được', p_label; end if;
  if p_like is not null and v_msg not ilike '%' || p_like || '%' then
    raise exception 'SAI: % | lỗi không như mong đợi: %', p_label, v_msg;
  end if;
end $$;

-- Đếm số dòng một câu SELECT trả về khi đóng vai người đang đăng nhập (đi qua RLS)
create or replace function t.dem_dong(p_sql text) returns int language plpgsql as $$
declare n int;
begin
  set local role authenticated;
  execute format('select count(*)::int from (%s) x', p_sql) into n;
  reset role;
  return n;
exception when others then
  reset role;
  raise;
end $$;

-- Bộ dữ liệu chuẩn theo docs/nguon/Du_lieu_mau.md (DLM.1, DLM.3), bản rút gọn ghi ở cuối file đó:
--   Chị Hoa (chủ): ICON40 1509, 3402. Anh Tuấn (chủ): Sapphire 1103.
--   Sale Hùng: kết nối Chị Hoa, tất cả căn; có căn tự nhập Villa Tuần Châu.
--   Sale Lan: kết nối Chị Hoa, chỉ căn 1509.   Sale Nga: chưa kết nối ai.   Quản trị: admin.
--   Giá tháng 10, 11/2026: 1509 900.000 / 1.300.000; 3402 800.000 / 1.100.000; 1103 700.000 / 700.000. Đêm cuối tuần: T6, T7.
create or replace function t.fixture() returns jsonb language plpgsql as $$
declare
  v_hoa uuid; v_tuan uuid; v_hung uuid; v_lan uuid; v_nga uuid; v_admin uuid;
  c1509 uuid; c3402 uuid; c1103 uuid; cvilla uuid; k_lan uuid;
  thangs date[] := array['2026-10-01', '2026-11-01', '2026-12-01']::date[];
begin
  v_hoa := t.mk_user('hoa@test.local', 'Chị Hoa');
  v_tuan := t.mk_user('tuan@test.local', 'Anh Tuấn');
  v_hung := t.mk_user('hung@test.local', 'Sale Hùng');
  v_lan := t.mk_user('lan@test.local', 'Sale Lan');
  v_nga := t.mk_user('nga@test.local', 'Sale Nga');
  v_admin := t.mk_user('admin-test@test.local', 'Quản trị');
  insert into public.admins (user_id) values (v_admin);

  perform t.login(v_hoa);
  c1509 := public.fn_tao_can('{"ma_can":"1509","so_phong_ngu":2,"so_giuong":3,"loai_view":"bien"}');
  c3402 := public.fn_tao_can('{"ma_can":"3402","so_phong_ngu":2}');
  perform public.fn_dat_gia_thang(c1509, thangs, 900000, 1300000);
  perform public.fn_dat_gia_thang(c3402, thangs, 800000, 1100000);

  perform t.login(v_tuan);
  c1103 := public.fn_tao_can('{"ma_can":"1103","so_phong_ngu":3,"so_giuong":2,"loai_view":"thanh_pho"}');
  perform public.fn_dat_gia_thang(c1103, thangs, 700000, 700000);

  perform t.login(v_hung);
  cvilla := public.fn_tao_can('{"ma_can":"Villa Tuần Châu","loai":"tu_nhap","so_phong_ngu":4,"ten_chu_can":"Chú Bình","sdt_chu_can":"0900000001","gia_chu_thuong":1400000}');
  perform t.logout();

  insert into public.ket_noi (chu_nha_id, sale_id, nguon, pham_vi) values (v_hoa, v_hung, 'link_moi', 'tat_ca_can');
  insert into public.ket_noi (chu_nha_id, sale_id, nguon, pham_vi) values (v_hoa, v_lan, 'chu_gui_lich', 'chon_can') returning id into k_lan;
  insert into public.ket_noi_can (ket_noi_id, can_id) values (k_lan, c1509);

  return jsonb_build_object('hoa', v_hoa, 'tuan', v_tuan, 'hung', v_hung, 'lan', v_lan, 'nga', v_nga, 'admin', v_admin,
                            'c1509', c1509, 'c3402', c3402, 'c1103', c1103, 'villa', cvilla);
end $$;
