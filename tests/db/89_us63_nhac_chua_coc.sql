-- US63 · Nhắc đặt phòng chưa cọc (YC12.3). Việc định kỳ fn_nhac_chua_coc (08:00 giờ Việt Nam, GD28): đặt phòng còn hiệu lực, "Chưa cọc",
-- còn từ 0 đến 3 ngày tới ngày nhận thì chủ căn có một thông báo "Đặt phòng chưa cọc"; mỗi đặt phòng một lần; công tắc chặn ghi.
-- YC12.3-NT1, NT2, NT3, YC12-H3 (giả định GD34), PQ19. Viết trước migration (US63-TA1, CL14.5).
-- Số theo YC: B2 của Sale Lan ở 1509, còn "Chưa cọc" khi còn 3 ngày tới ngày nhận (ví dụ 14/10 cho 17/10 → 19/10).
select t.fixture();

create or replace function pg_temp.hom_nay() returns date language sql as $$ select public.local_today() $$;
create or replace function pg_temp.chay() returns integer language plpgsql security definer as $$
declare n integer;
begin select public.fn_nhac_chua_coc() into n; return n; end $$;
create or replace function pg_temp.so(p_nguoi uuid, p_dt uuid default null) returns bigint language sql security definer as $$
  select count(*) from public.thong_bao where nguoi_nhan = p_nguoi and loai = 'dat_phong_chua_coc' and (p_dt is null or doi_tuong_id = p_dt)
$$;
create or replace function pg_temp.nd(p_dt uuid) returns jsonb language sql security definer as $$
  select noi_dung from public.thong_bao where loai = 'dat_phong_chua_coc' and doi_tuong_id = p_dt
$$;

delete from public.thong_bao;
update public.cai_dat_rieng set thong_bao_tat = '{}' where nguoi_id in (t.id('hoa'), t.id('tuan'));

select t.ok(exists (select 1 from pg_proc where proname = 'fn_nhac_chua_coc' and pronamespace = 'public'::regnamespace and prosecdef),
            'YC12.3 danh mục: có việc định kỳ fn_nhac_chua_coc chạy security definer');
select t.ok(not exists (select 1 from pg_proc p where p.proname = 'fn_nhac_chua_coc' and p.pronamespace = 'public'::regnamespace
                        and (has_function_privilege('anon', p.oid, 'execute') or has_function_privilege('authenticated', p.oid, 'execute'))),
            'YC12.3 danh mục: app không gọi được việc nhắc, chỉ lịch chạy của database');

-- B2: Sale Lan, 1509, còn 3 ngày tới ngày nhận, chưa cọc. Các ca khác để thử loại trừ.
select t.tao_booking('B2', t.can('1509'), pg_temp.hom_nay() + 3, pg_temp.hom_nay() + 5, 1800000, t.id('lan'), 'tu_yeu_cau');
update public.booking set trang_thai_tien = 'chua_coc' where id = t.b('B2');
-- B3: còn 3 ngày nhưng đã cọc (YC12.3-NT2).
select t.tao_booking('B3', t.can('3402'), pg_temp.hom_nay() + 3, pg_temp.hom_nay() + 4, 800000);
update public.booking set trang_thai_tien = 'da_coc', tien_coc = 300000 where id = t.b('B3');
-- B4: còn 10 ngày, chưa cọc: chưa tới hạn nhắc.
select t.tao_booking('B4', t.can('1509'), pg_temp.hom_nay() + 10, pg_temp.hom_nay() + 11, 900000);
update public.booking set trang_thai_tien = 'chua_coc' where id = t.b('B4');
-- B5: còn 2 ngày, tạo muộn, chưa cọc (YC12-H3, GD34): vẫn nhắc.
select t.tao_booking('B5', t.can('1509'), pg_temp.hom_nay() + 2, pg_temp.hom_nay() + 3, 900000);
update public.booking set trang_thai_tien = 'chua_coc' where id = t.b('B5');
-- B6: đã hủy.
select t.tao_booking('B6', t.can('3402'), pg_temp.hom_nay() + 2, pg_temp.hom_nay() + 3, 800000);
update public.booking set trang_thai_tien = 'chua_coc', trang_thai = 'da_huy' where id = t.b('B6');
-- B7: ngày nhận đã qua (khách đang ở), chưa cọc: không nhắc.
select t.tao_booking('B7', t.can('3402'), pg_temp.hom_nay() - 1, pg_temp.hom_nay() + 1, 1600000);
update public.booking set trang_thai_tien = 'chua_coc' where id = t.b('B7');
-- B8: căn của Anh Tuấn, còn 3 ngày, chưa cọc.
select t.tao_booking('B8', t.can('1103'), pg_temp.hom_nay() + 3, pg_temp.hom_nay() + 4, 700000);
update public.booking set trang_thai_tien = 'chua_coc' where id = t.b('B8');
-- B9: căn tự nhập của Sale Hùng (không có chủ nhà trong app), còn 3 ngày, chưa cọc: không nhắc.
select t.tao_booking('B9', t.can('villa'), pg_temp.hom_nay() + 3, pg_temp.hom_nay() + 4, 1400000);
update public.booking set trang_thai_tien = 'chua_coc' where id = t.b('B9');

-- ===== YC12.3-NT1: lần chạy đầu =====
select t.bang(pg_temp.chay(), 3, 'YC12.3-NT1 lần chạy đầu ghi 3 thông báo (B2, B5, B8)');
select t.bang(pg_temp.so(t.id('hoa'), t.b('B2')), 1::bigint, 'YC12.3-NT1 Chị Hoa có đúng một thông báo "Đặt phòng chưa cọc" cho B2');
select t.bang(pg_temp.nd(t.b('B2')) ->> 'ten_sale', 'Sale Lan', 'YC12.3-NT1 thông báo ghi tên Sale Lan');
select t.bang((pg_temp.nd(t.b('B2')) ->> 'con_ngay')::int, 3, 'YC12.3-NT1 thông báo ghi nhận phòng sau 3 ngày');
select t.bang((select doi_tuong_loai || '|' || doi_tuong_id from public.thong_bao where loai = 'dat_phong_chua_coc' and doi_tuong_id = t.b('B2')),
              'booking|' || t.b('B2'), 'YC12.3 thông báo trỏ tới đặt phòng B2 (mở chi tiết đặt phòng)');
select t.bang(pg_temp.chay(), 0, 'YC12.3-NT1 việc chạy lại không ghi thêm');
select t.bang(pg_temp.so(t.id('hoa'), t.b('B2')), 1::bigint, 'YC12.3-NT1 chạy lại vẫn một thông báo cho B2');

-- ===== YC12.3-NT2: đã cọc, chưa tới hạn, đã hủy, đã qua ngày nhận, căn sale tự nhập =====
select t.bang(pg_temp.so(t.id('hoa'), t.b('B3')), 0::bigint, 'YC12.3-NT2 B2 kiểu đã cọc trước hạn: không có thông báo (B3)');
select t.bang(pg_temp.so(t.id('hoa'), t.b('B4')), 0::bigint, 'YC12.3 còn 10 ngày thì chưa nhắc (B4)');
select t.bang(pg_temp.so(t.id('hoa'), t.b('B5')), 1::bigint, 'YC12-H3 GD34 đặt phòng tạo khi còn dưới 3 ngày vẫn được nhắc một lần (B5)');
select t.bang(pg_temp.so(t.id('hoa'), t.b('B6')), 0::bigint, 'YC12.3 đặt phòng đã hủy không nhắc (B6)');
select t.bang(pg_temp.so(t.id('hoa'), t.b('B7')), 0::bigint, 'YC12.3 đã qua ngày nhận không nhắc (B7)');
select t.bang(pg_temp.so(t.id('hung'), t.b('B9')), 0::bigint, 'YC12.3 căn sale tự nhập không có nhắc chưa cọc (B9)');
select t.bang(pg_temp.so(t.id('tuan'), t.b('B8')), 1::bigint, 'YC12.3 PQ19.CHU Anh Tuấn chỉ nhận nhắc của căn mình (B8)');
select t.bang(pg_temp.so(t.id('hoa'), t.b('B8')), 0::bigint, 'YC12.3 PQ19.CHU Chị Hoa không nhận nhắc của căn Anh Tuấn');

-- Đã cọc sau khi nhắc: thông báo cũ giữ nguyên, không ghi thêm.
update public.booking set trang_thai_tien = 'da_coc', tien_coc = 500000 where id = t.b('B2');
select t.bang(pg_temp.chay(), 0, 'YC12.3 cọc rồi thì chạy lại không ghi gì');
select t.bang(pg_temp.so(t.id('hoa'), t.b('B2')), 1::bigint, 'YC12.3 thông báo đã ghi giữ nguyên');

-- Chị Hoa tắt loại này thì không có thông báo (YC12.3-NT2, YC12 Công tắc chặn ghi).
select t.tao_booking('B10', t.can('1509'), pg_temp.hom_nay() + 1, pg_temp.hom_nay() + 2, 900000);
update public.booking set trang_thai_tien = 'chua_coc' where id = t.b('B10');
insert into public.cai_dat_rieng (nguoi_id, thong_bao_tat) values (t.id('hoa'), array['dat_phong_chua_coc'])
on conflict (nguoi_id) do update set thong_bao_tat = excluded.thong_bao_tat;
select pg_temp.chay();
select t.bang(pg_temp.so(t.id('hoa'), t.b('B10')), 0::bigint, 'YC12.3-NT2 Chị Hoa đã tắt loại "Đặt phòng chưa cọc" thì không có thông báo (B10)');

-- ===== YC12.3-NT3: Sale Lan không có thông báo nhắc chưa cọc của B2 =====
select t.dang_nhap(t.id('lan'));
select t.bang(t.so($$select * from public.thong_bao where loai = 'dat_phong_chua_coc'$$), 0::bigint,
              'YC12.3-NT3 PQ19.SALE Sale Lan đọc thông báo không thấy nhắc chưa cọc của B2');
select t.thoat();
select t.bang(pg_temp.so(t.id('lan')), 0::bigint, 'YC12.3-NT3 Lan không nhận nhắc nào (chỉ chủ căn nhận)');
select t.ok(pg_temp.nd(t.b('B2'))::text !~* '(khach|sdt|gia_ban|chenh|0900000004)', 'YC12.3-NT3 PQ19.CHU thông báo không có tên khách, số điện thoại, giá bán');
