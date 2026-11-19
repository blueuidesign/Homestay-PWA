-- US47 · Mức cộng giá mặc định (YC7.5, P10). Viết trước migration (US47-TA1, CL14.5): task sau không sửa file này.
-- Hợp đồng database (YC7 "Dữ liệu", "Ai được làm gì", PQ11.SALE, thiet-ke-db.md mục 3 bất biến 6):
--   fn_muc_cong_mac_dinh() returns jsonb: {"muc_cong_mac_dinh": bigint, "lam_tron_50k": boolean} của chính người gọi;
--     chưa có dòng cai_dat_rieng thì {0, false}. Chỉ sale (can_la_sale), còn lại từ chối 42501.
--   fn_dat_muc_cong_mac_dinh(p_muc bigint, p_lam_tron boolean) returns void: ghi dòng cai_dat_rieng của chính người gọi
--     (thêm hoặc sửa, giữ các cột khác). Chỉ sale, còn lại 42501. p_muc ngoài 0..5.000.000 hay null, p_lam_tron null: 22023.
--   Không có tham số người: sale không ghi được cài đặt của sale khác.
--   Bảng cai_dat_rieng có ràng buộc check muc_cong_mac_dinh từ 0 đến 5.000.000 (YC7-H10), chặn cả khi ghi không qua hàm.
-- Giá (DLM): 3402 800.000đ thường, 1.100.000đ cuối tuần (09/10/2026 là đêm thứ Sáu); 1509 900.000đ thường.
-- Sale Hùng: mặc định +400k, không làm tròn, 1509 riêng +200k. Sale Lan chưa có dòng cài đặt, chỉ xem 1509.
select t.fixture();

-- Ô giá bán của một căn một đêm trong fn_sale_lich, bằng vai hiện tại ('-' khi null, 'không có dòng' khi không có).
create or replace function pg_temp.gia(p_can uuid, p_dem date) returns text language plpgsql as $$
declare v text;
begin
  select coalesce(l.gia_ban::text, '-') into v from public.fn_sale_lich('2026-10-07', '2026-10-14') l
  where l.can_id = p_can and l.dem = p_dem;
  return coalesce(v, 'không có dòng');
exception when others then
  raise notice 'lỗi: % (fn_sale_lich)', sqlerrm;
  return null;
end $$;

-- Cài đặt của một người, đọc bằng chủ database: 'muc|lam_tron' hay '-' khi không có dòng.
create or replace function pg_temp.cd(p_nguoi uuid) returns text language sql as $$
  select coalesce((select muc_cong_mac_dinh::text || '|' || lam_tron_50k::text from public.cai_dat_rieng where nguoi_id = p_nguoi), '-')
$$;

-- ===== Danh mục =====
select t.ok((select bool_and(p.prosecdef) and count(*) = 2 from pg_proc p
             where p.pronamespace = 'public'::regnamespace
               and p.proname in ('fn_muc_cong_mac_dinh', 'fn_dat_muc_cong_mac_dinh')),
            'YC7.5 KT-DB.3.6 có fn_muc_cong_mac_dinh, fn_dat_muc_cong_mac_dinh chạy security definer');
select t.ok((select bool_and(exists (select 1 from unnest(p.proconfig) c where c like 'search_path=%')) from pg_proc p
             where p.pronamespace = 'public'::regnamespace
               and p.proname in ('fn_muc_cong_mac_dinh', 'fn_dat_muc_cong_mac_dinh')),
            'YC7.5 hai lệnh đặt search_path');
select t.ok(exists (select 1 from pg_proc p where p.proname = 'fn_dat_muc_cong_mac_dinh' and p.pronamespace = 'public'::regnamespace)
            and not exists (select 1 from pg_proc p where p.pronamespace = 'public'::regnamespace
                              and p.proname in ('fn_muc_cong_mac_dinh', 'fn_dat_muc_cong_mac_dinh')
                              and has_function_privilege('anon', p.oid, 'execute')),
            'YC7.5-NT4 PQ11.LINK người chưa đăng nhập không có quyền gọi hai lệnh mức cộng mặc định');
select t.bang((select string_agg(p.parameter_name, ',' order by p.ordinal_position)
               from information_schema.routines r
               join information_schema.parameters p on p.specific_name = r.specific_name
               where r.routine_schema = 'public' and r.routine_name = 'fn_dat_muc_cong_mac_dinh' and p.parameter_mode = 'IN'),
              'p_muc,p_lam_tron',
              'YC7.5-NT4 PQ11.SALE lệnh ghi không có tham số người: chỉ ghi được cài đặt của chính mình');
select t.ok(not has_table_privilege('authenticated', 'public.cai_dat_rieng', 'insert')
            and not has_table_privilege('authenticated', 'public.cai_dat_rieng', 'update')
            and not has_table_privilege('authenticated', 'public.cai_dat_rieng', 'delete'),
            'YC7.5-NT4 KT-DB.3.6 app không ghi thẳng bảng cai_dat_rieng');

-- ===== Bước 1: đọc mức cộng mặc định và cờ làm tròn của chính mình =====
select t.dang_nhap(t.id('hung'));
select t.bang(t.gt($$public.fn_muc_cong_mac_dinh()$$)::jsonb, '{"muc_cong_mac_dinh": 400000, "lam_tron_50k": false}'::jsonb,
              'YC7.5 bước 1 Sale Hùng đọc mức cộng mặc định +400k, chưa làm tròn');
select t.thoat();
select t.dang_nhap(t.id('lan'));
select t.bang(t.gt($$public.fn_muc_cong_mac_dinh()$$)::jsonb, '{"muc_cong_mac_dinh": 0, "lam_tron_50k": false}'::jsonb,
              'YC7.5 bước 1 Sale Lan chưa có cài đặt: Không cộng, chưa làm tròn');
select t.thoat();

-- ===== YC7.5-NT3: bật làm tròn, 1.230.000đ → 1.250.000đ; làm tròn từng đêm rồi mới cộng (GD13) =====
update public.cai_dat_rieng set mau_tin = 'Mẫu tin của Hùng' where nguoi_id = t.id('hung');
select t.dang_nhap(t.id('hung'));
select t.khong_loi($$select public.fn_dat_muc_cong_mac_dinh(430000, true)$$,
                   'YC7.5-NT3 Sale Hùng lưu mức cộng mặc định +430k, bật làm tròn 50.000đ');
select t.bang(t.gt($$public.fn_muc_cong_mac_dinh()$$)::jsonb, '{"muc_cong_mac_dinh": 430000, "lam_tron_50k": true}'::jsonb,
              'YC7.5-NT3 đọc lại thấy +430k, làm tròn bật');
select t.bang(pg_temp.gia(t.can('3402'), '2026-10-08'), '1250000',
              'YC7.5-NT3 QT5.4 3402 đêm 08/10: 800.000đ + 430.000đ = 1.230.000đ, giá bán 1.250.000đ');
select t.bang(pg_temp.gia(t.can('1509'), '2026-10-08'), '1100000',
              'YC7.5-NT3 QT5.4 1509 có mức cộng riêng +200k vẫn dùng mức riêng: 1.100.000đ');
select t.thoat();
select t.bang(pg_temp.cd(t.id('hung')), '430000|true', 'YC7.5-NT3 dòng cài đặt của Hùng đã ghi');
select t.bang((select mau_tin from public.cai_dat_rieng where nguoi_id = t.id('hung')), 'Mẫu tin của Hùng',
              'YC7.5-NT3 lưu mức cộng không xóa các cài đặt khác của Hùng (mẫu tin)');
-- +410k: 3402 đêm 08/10 1.210.000đ → 1.250.000đ, đêm 09/10 (cuối tuần) 1.510.000đ → 1.550.000đ. Tổng 2.800.000đ,
-- không phải làm tròn tổng 2.720.000đ thành 2.750.000đ.
select t.dang_nhap(t.id('hung'));
select t.khong_loi($$select public.fn_dat_muc_cong_mac_dinh(410000, true)$$, 'YC7.5-NT3 Sale Hùng lưu +410k, làm tròn bật');
select t.bang(t.gt($$(public.fn_sale_chi_tiet_can('00000000-0000-0000-0001-000000003402', '2026-10-08', '2026-10-10') ->> 'tong_gia_ban')$$),
              '2800000', 'YC7.5-NT3 GD13 3402 08/10 → 10/10 làm tròn từng đêm rồi cộng: 1.250.000đ + 1.550.000đ = 2.800.000đ');
select t.khong_loi($$select public.fn_dat_muc_cong_mac_dinh(410000, false)$$, 'YC7.5-NT3 Sale Hùng tắt làm tròn');
select t.bang(t.gt($$(public.fn_sale_chi_tiet_can('00000000-0000-0000-0001-000000003402', '2026-10-08', '2026-10-10') ->> 'tong_gia_ban')$$),
              '2720000', 'YC7.5-NT3 tắt làm tròn: 3402 08/10 → 10/10 giá bán 1.210.000đ + 1.510.000đ = 2.720.000đ');
select t.thoat();

-- ===== YC7.5-NT4: Hùng đổi mức cộng, giá bán của Lan không đổi; chủ nhà gửi mức cộng thì bị từ chối =====
select t.dang_nhap(t.id('lan'));
select t.khong_loi($$select public.fn_dat_muc_cong_mac_dinh(300000, false)$$, 'YC7.5-NT4 Sale Lan lưu mức cộng mặc định +300k');
select t.bang(pg_temp.gia(t.can('1509'), '2026-10-08'), '1200000', 'YC7.5-NT4 Sale Lan: 1509 đêm 08/10 giá bán 1.200.000đ');
select t.thoat();
select t.dang_nhap(t.id('hung'));
select t.khong_loi($$select public.fn_dat_muc_cong_mac_dinh(100000, true)$$, 'YC7.5-NT4 Sale Hùng đổi mức cộng mặc định sang +100k');
select t.thoat();
select t.dang_nhap(t.id('lan'));
select t.bang(pg_temp.gia(t.can('1509'), '2026-10-08'), '1200000',
              'YC7.5-NT4 Sale Hùng đổi mức cộng mặc định: giá bán 1509 của Sale Lan vẫn 1.200.000đ');
select t.bang(t.gt($$public.fn_muc_cong_mac_dinh()$$)::jsonb, '{"muc_cong_mac_dinh": 300000, "lam_tron_50k": false}'::jsonb,
              'YC7.5-NT4 Sale Lan đọc lại mức cộng của mình: vẫn +300k, chưa làm tròn');
select t.bang(coalesce(t.so(format('select * from public.cai_dat_rieng where nguoi_id = %L', t.id('hung'))), 0), 0::bigint,
              'YC7.5-NT4 PQ11.SALE Sale Lan không đọc được cài đặt của Sale Hùng');
select t.loi(format('update public.cai_dat_rieng set muc_cong_mac_dinh = 0 where nguoi_id = %L', t.id('hung')), '42501',
             'YC7.5-NT4 PQ11.SALE Sale Lan sửa thẳng cài đặt của Sale Hùng: bị từ chối');
select t.thoat();
select t.bang(pg_temp.cd(t.id('hung')), '100000|true', 'YC7.5-NT4 cài đặt của Hùng là của Hùng: +100k, làm tròn bật');
select t.bang(pg_temp.cd(t.id('lan')), '300000|false', 'YC7.5-NT4 cài đặt của Lan không đổi: +300k, chưa làm tròn');

-- Chị Hoa (chỉ là chủ nhà) gửi mức cộng.
select t.dang_nhap(t.id('hoa'));
select t.loi($$select public.fn_dat_muc_cong_mac_dinh(200000, false)$$, '42501',
             'YC7.5-NT4 PQ11.CHU tài khoản chỉ là chủ nhà (Chị Hoa) gửi mức cộng: bị từ chối');
select t.loi($$select public.fn_muc_cong_mac_dinh()$$, '42501',
             'YC7.5-NT4 PQ11.CHU Chị Hoa gọi lệnh đọc mức cộng mặc định: bị từ chối');
select t.bang(coalesce(t.so(format('select * from public.cai_dat_rieng where nguoi_id in (%L, %L)', t.id('hung'), t.id('lan'))), 0), 0::bigint,
              'YC7.5-NT4 PQ11.CHU KT-DB.3.6 Chị Hoa không đọc được mức cộng của Sale Hùng, Sale Lan');
select t.thoat();
select t.bang(pg_temp.cd(t.id('hoa')), '-', 'YC7.5-NT4 PQ11.CHU Chị Hoa bị từ chối: không có dòng mức cộng nào cho Chị Hoa');

-- Người chưa đăng nhập.
select t.khach();
select t.loi($$select public.fn_dat_muc_cong_mac_dinh(200000, false)$$, '42501',
             'YC7.5-NT4 PQ11.LINK người chưa đăng nhập gửi mức cộng: bị từ chối');
select t.bang(coalesce(t.so('select * from public.cai_dat_rieng'), 0), 0::bigint,
              'YC7.5-NT4 PQ11.LINK KT-DB.3.1 người chưa đăng nhập không đọc được cai_dat_rieng');
select t.thoat();

-- ===== YC7.5-NT6: 5.000.001đ hay số âm thì database từ chối, mức cũ giữ nguyên =====
select t.dang_nhap(t.id('hung'));
select t.loi($$select public.fn_dat_muc_cong_mac_dinh(5000001, true)$$, '22023',
             'YC7.5-NT6 Sale Hùng gửi mức cộng 5.000.001đ: bị từ chối');
select t.loi($$select public.fn_dat_muc_cong_mac_dinh(-1, true)$$, '22023', 'YC7.5-NT6 Sale Hùng gửi mức cộng -1đ: bị từ chối');
select t.loi($$select public.fn_dat_muc_cong_mac_dinh(-100000, false)$$, '22023', 'YC7.5-NT6 Sale Hùng gửi mức cộng -100.000đ: bị từ chối');
select t.loi($$select public.fn_dat_muc_cong_mac_dinh(null, false)$$, '22023', 'YC7.5-NT6 Sale Hùng gửi mức cộng trống: bị từ chối');
select t.loi($$select public.fn_dat_muc_cong_mac_dinh(200000, null)$$, '22023', 'YC7.5-NT6 Sale Hùng gửi cờ làm tròn trống: bị từ chối');
select t.thoat();
select t.bang(pg_temp.cd(t.id('hung')), '100000|true', 'YC7.5-NT6 bị từ chối: mức cũ của Hùng giữ nguyên +100k, làm tròn bật');
select t.dang_nhap(t.id('hung'));
select t.bang(pg_temp.gia(t.can('3402'), '2026-10-08'), '900000',
              'YC7.5-NT6 bị từ chối: giá bán 3402 đêm 08/10 của Hùng vẫn theo mức cũ (800.000đ + 100.000đ)');
select t.thoat();
-- Sale chưa có dòng cài đặt gửi số sai: không có dòng nào được tạo.
select t.dang_nhap(t.id('nga'));
select t.loi($$select public.fn_dat_muc_cong_mac_dinh(5000001, false)$$, '22023', 'YC7.5-NT6 Sale Nga gửi 5.000.001đ: bị từ chối');
select t.thoat();
select t.bang(pg_temp.cd(t.id('nga')), '-', 'YC7.5-NT6 Sale Nga bị từ chối: không có dòng cài đặt nào được tạo');
-- Biên: 0 và 5.000.000đ lưu được.
select t.dang_nhap(t.id('nga'));
select t.khong_loi($$select public.fn_dat_muc_cong_mac_dinh(5000000, false)$$, 'YC7.5-NT6 YC7-H10 Sale Nga lưu đúng 5.000.000đ: được');
select t.thoat();
select t.bang(pg_temp.cd(t.id('nga')), '5000000|false', 'YC7.5-NT6 YC7-H10 Sale Nga có dòng cài đặt +5.000.000đ');
select t.dang_nhap(t.id('nga'));
select t.khong_loi($$select public.fn_dat_muc_cong_mac_dinh(0, false)$$, 'YC7.5-NT6 YC7-H10 Sale Nga lưu Không cộng (0đ): được');
select t.thoat();
select t.bang(pg_temp.cd(t.id('nga')), '0|false', 'YC7.5-NT6 Sale Nga về Không cộng');
-- Ràng buộc ở bảng: ghi không qua hàm cũng bị chặn.
select t.loi(format('update public.cai_dat_rieng set muc_cong_mac_dinh = 5000001 where nguoi_id = %L', t.id('hung')), '23514',
             'YC7.5-NT6 YC7-H10 ràng buộc ở bảng cai_dat_rieng chặn mức cộng 5.000.001đ');
select t.loi(format('update public.cai_dat_rieng set muc_cong_mac_dinh = -1 where nguoi_id = %L', t.id('hung')), '23514',
             'YC7.5-NT6 ràng buộc ở bảng cai_dat_rieng chặn mức cộng âm');
select t.bang(pg_temp.cd(t.id('hung')), '100000|true', 'YC7.5-NT6 sau hai lần ghi sai, mức của Hùng vẫn +100k');
