-- US34 · Phía sale: đặt phòng chủ nhà ghi giúp (YC5.9). Viết trước code (US34-TA2, CL14.5): task sau không sửa kỳ vọng của
-- file này. Hợp đồng database:
--   fn_sale_xem_dat_phong(p_booking_id uuid) → jsonb: đặt phòng sale đứng tên của người gọi ở căn chủ nhà (không phải căn của
--   mình, không phải căn tự nhập). {id, can_id, ma_can, ten_toa, so_phong_ngu, ten_chu, sdt_chu, ngay_nhan, ngay_tra,
--   trang_thai, tien_phong, gia_ban, tien_chenh, da_coc, ghi_giup, sua_gan_nhat}. Không có tiền cọc, khách chủ nhà nhập (QD7,
--   QD11). da_coc (true/false) chỉ khi chủ còn kết nối và bật xem cọc, còn lại null (QD7). sdt_chu chỉ khi còn kết nối và
--   chủ chưa xóa tài khoản (QD7, QD13). sua_gan_nhat: nội dung thông báo chủ sửa đặt phòng mới nhất (S3-10) kèm lúc sửa.
--   Không phải đặt phòng của người gọi: lỗi quyền 42501.
--   fn_sale_sua_gia_ban(p_booking_id uuid, p_gia_ban bigint) → void: chỉ sale đứng tên ghi giá bán của mình; giá bán > 0;
--   tiền chênh âm được, sale đã bị ngừng vẫn sửa được (YC5-H10, Claude tự chốt US34); đặt phòng đã hủy không sửa.
-- QT3.1, QT6.1, QD7, QD11, QD13, PQ7.SALE, PQ8.SALE, PQ9, PQ11, KT-DB.3.5, KT-DB.3.6.
select t.fixture();

-- B1: Chị Hoa ghi 1509 20/10 → 22/10 cho Hùng, tiền phòng 1.800.000đ, giá bán điền sẵn 2.200.000đ (YC5.4-NT1); chủ nhập khách
-- vào phần của mình (không có lệnh nào làm vậy, dựng để chắc không lộ), cọc 500.000đ.
select t.tao_booking('B1', t.can('1509'), '2026-10-20', '2026-10-22', 1800000, t.id('hung'), 'chu_ghi');
insert into public.booking_rieng (booking_id, nguoi_id, tien_thu_khach) values (t.b('B1'), t.id('hung'), 2200000);
insert into public.booking_rieng (booking_id, nguoi_id, ten_khach, sdt_khach) values (t.b('B1'), t.id('hoa'), 'Khách Của Chủ', '0900000088');
update public.booking set trang_thai_tien = 'da_coc', tien_coc = 500000 where id = t.b('B1');
-- B2 của Sale Lan; B5 khách lẻ; V2 Hùng tự ghi cho Villa (căn tự nhập).
select t.tao_booking('B2', t.can('3402'), '2026-10-17', '2026-10-19', 1900000, t.id('lan'), 'chu_ghi');
insert into public.booking_rieng (booking_id, nguoi_id, tien_thu_khach) values (t.b('B2'), t.id('lan'), 2300000);
select t.tao_booking('B5', t.can('1509'), '2026-10-13', '2026-10-15', 1800000);
select t.tao_booking('V2', t.can('villa'), '2026-10-08', '2026-10-09', 1400000);

create or replace function pg_temp.xem(p_ma text) returns jsonb language plpgsql as $$
begin
  return t.gt(format('select public.fn_sale_xem_dat_phong(%L)', t.b(p_ma)))::jsonb;
end $$;
create or replace function pg_temp.cac_khoa(j jsonb) returns text[] language sql stable as $$
  select coalesce(array_agg(distinct k[1]), '{}') from regexp_matches(coalesce(j::text, ''), '"([a-z_]+)":', 'g') k
$$;
create or replace function pg_temp.gia_ban(p_ma text, p_nguoi uuid) returns bigint language sql stable as $$
  select r.tien_thu_khach from public.booking_rieng r where r.booking_id = t.b(p_ma) and r.nguoi_id = p_nguoi
$$;

-- ===== Danh mục, quyền gọi =====
select t.ok(exists (select 1 from pg_proc where proname = 'fn_sale_xem_dat_phong' and prosecdef)
            and exists (select 1 from pg_proc where proname = 'fn_sale_sua_gia_ban' and prosecdef),
            'YC5.9-NT1 danh mục: fn_sale_xem_dat_phong, fn_sale_sua_gia_ban có và chạy security definer');
select t.ok(exists (select 1 from pg_proc where proname = 'fn_sale_sua_gia_ban')
            and not exists (select 1 from pg_proc p where p.proname in ('fn_sale_xem_dat_phong', 'fn_sale_sua_gia_ban')
                              and has_function_privilege('anon', p.oid, 'execute')),
            'YC5.9-NT2 PQ15.LINK người chưa đăng nhập không gọi được hai lệnh');

-- ===== YC5.9 bước 38: Hùng xem B1 =====
select t.dang_nhap(t.id('hung'));
select t.bang((select (j ->> 'ma_can') || '|' || coalesce(j ->> 'ten_toa', '') || '|' || (j ->> 'ten_chu') || '|' || (j ->> 'ngay_nhan')
                      || '|' || (j ->> 'ngay_tra') || '|' || (j ->> 'tien_phong') || '|' || (j ->> 'gia_ban') || '|'
                      || (j ->> 'tien_chenh') || '|' || (j ->> 'trang_thai') || '|' || coalesce(j ->> 'ghi_giup', '')
               from (select pg_temp.xem('B1') j) x),
              '1509|ICON40|Chị Hoa|2026-10-20|2026-10-22|1800000|2200000|400000|hieu_luc|true',
              'YC5.9-NT1 Hùng xem B1: căn, chủ, ngày ở, giá chủ 1.800.000đ, giá bán 2.200.000đ, chênh 400.000đ, chủ ghi giúp');
select t.bang(pg_temp.xem('B1') ->> 'da_coc', 'true', 'YC5.9-NT1 QD7 chủ bật xem cọc: Hùng thấy đã cọc');
select t.bang(pg_temp.xem('B1') ->> 'sdt_chu', '0900000001', 'YC5.9-NT1 QD7 Hùng thấy số chủ đang kết nối');
select t.ok(not (pg_temp.cac_khoa(pg_temp.xem('B1')) && array['tien_coc', 'ten_khach', 'sdt_khach', 'so_khach'])
            and position('0900000088' in coalesce(pg_temp.xem('B1')::text, 'x')) = 0
            and position('500000' in coalesce(pg_temp.xem('B1')::text, '500000')) = 0,
            'YC5.9-NT1 QD7 QD11 PQ9.SALE không có tiền cọc, không có khách chủ nhà nhập');
select t.loi(format('select public.fn_sale_xem_dat_phong(%L)', t.b('B2')), '42501',
             'YC5.9-NT2 PQ8.SALE Hùng không xem được B2 của Lan');
select t.loi(format('select public.fn_sale_xem_dat_phong(%L)', t.b('B5')), '42501',
             'YC5.9-NT2 PQ8.SALE Hùng không xem được B5 khách lẻ');
select t.loi(format('select public.fn_sale_xem_dat_phong(%L)', t.b('V2')), '42501',
             'YC5.9-NT2 đặt phòng căn tự nhập không xem qua lệnh này (S6-03)');
select t.thoat();

-- ===== YC5.9-NT1: Hùng sửa giá bán B1 thành 2.400.000đ =====
select t.dang_nhap(t.id('hung'));
select t.khong_loi(format('select public.fn_sale_sua_gia_ban(%L, 2400000)', t.b('B1')), 'YC5.9-NT1 Hùng lưu giá bán 2.400.000đ');
select t.bang((pg_temp.xem('B1') ->> 'gia_ban') || '|' || (pg_temp.xem('B1') ->> 'tien_chenh'), '2400000|600000',
              'YC5.9-NT1 giá bán 2.400.000đ, tiền chênh 600.000đ');
select t.bang(public.fn_thong_ke_sale('2026-10-01') ->> 'tien_chenh', '600000',
              'YC5.9-NT1 QT3.1 thống kê tháng 10 của Hùng theo giá bán mới: chênh 600.000đ');
select t.thoat();
select t.dang_nhap(t.id('hoa'));
select t.bang((select x.tien_phong from public.fn_chi_tiet_dat_phong(t.b('B1')) x), 1800000::bigint,
              'YC5.9-NT1 Chị Hoa vẫn thấy tiền phòng 1.800.000đ');
select t.ok(position('2400000' in coalesce((select string_agg(x::text, '') from public.fn_chi_tiet_dat_phong(t.b('B1')) x), '2400000')) = 0
            and coalesce(t.so(format('select 1 from public.booking_rieng where booking_id = %L and nguoi_id = %L',
                                     t.b('B1'), t.id('hung'))), 0) = 0,
            'YC5.9-NT1 PQ11.CHU Chị Hoa không thấy giá bán của Hùng');
select t.thoat();

-- ===== YC5.9-NT2: Lan, Chị Hoa gửi lệnh ghi giá bán của B1 =====
select t.dang_nhap(t.id('lan'));
select t.loi(format('select public.fn_sale_sua_gia_ban(%L, 3000000)', t.b('B1')), '42501',
             'YC5.9-NT2 Sale Lan sửa giá bán đặt phòng của Hùng: bị từ chối');
select t.ma_loi(format('update public.booking_rieng set tien_thu_khach = 3000000 where booking_id = %L', t.b('B1'))); -- sửa thẳng bảng phần riêng: RLS không cho, kiểm kết quả ở dưới
select t.thoat();
select t.dang_nhap(t.id('hoa'));
select t.loi(format('select public.fn_sale_sua_gia_ban(%L, 3000000)', t.b('B1')), '42501',
             'YC5.9-NT2 Chị Hoa ghi giá bán: bị từ chối');
select t.ma_loi(format('update public.booking_rieng set tien_thu_khach = 3000000 where booking_id = %L', t.b('B1'))); -- sửa thẳng bảng phần riêng: RLS không cho, kiểm kết quả ở dưới
select t.thoat();
select t.bang(pg_temp.gia_ban('B1', t.id('hung')), 2400000::bigint, 'YC5.9-NT2 giá bán của Hùng không đổi: 2.400.000đ');
select t.ok(not exists (select 1 from public.booking_rieng r where r.booking_id = t.b('B1') and r.tien_thu_khach = 3000000),
            'YC5.9-NT2 không phần riêng nào của B1 có giá 3.000.000đ');

-- ===== Luật kiểm (YC5-H10, Claude tự chốt US34) =====
select t.dang_nhap(t.id('hung'));
select t.loi(format('select public.fn_sale_sua_gia_ban(%L, 0)', t.b('B1')), 'Giá bán phải lớn hơn 0',
             'YC5.9-NT1 giá bán 0đ bị từ chối');
select t.loi(format('select public.fn_sale_sua_gia_ban(%L, null)', t.b('B1')), 'Giá bán phải lớn hơn 0',
             'YC5.9-NT1 thiếu giá bán bị từ chối');
select t.khong_loi(format('select public.fn_sale_sua_gia_ban(%L, 1700000)', t.b('B1')),
                   'YC5.9-NT1 YC5-H10 giá bán dưới giá chủ (chênh âm) vẫn lưu được');
select t.bang(pg_temp.xem('B1') ->> 'tien_chenh', '-100000', 'YC5.9-NT1 YC5-H10 tiền chênh âm −100.000đ');
select t.thoat();

-- QD7: chủ tắt xem cọc thì không có tình trạng cọc.
update public.ket_noi set xem_coc = false where id = t.kn('hoa', 'hung');
select t.dang_nhap(t.id('hung'));
select t.ok((pg_temp.xem('B1') ? 'da_coc') and pg_temp.xem('B1') ->> 'da_coc' is null,
            'YC5.9-NT1 QD7 chủ tắt xem cọc: không có tình trạng cọc');
select t.thoat();
-- Chủ ngừng chia sẻ: vẫn xem, vẫn sửa giá bán (YC5-H10), không có số chủ, không có cọc.
update public.ket_noi set trang_thai = 'chu_ngung', ngung_luc = now(), xem_coc = true where id = t.kn('hoa', 'hung');
select t.dang_nhap(t.id('hung'));
select t.bang((pg_temp.xem('B1') ->> 'ma_can') || '|' || coalesce(pg_temp.xem('B1') ->> 'sdt_chu', '-') || '|'
              || coalesce(pg_temp.xem('B1') ->> 'da_coc', '-'), '1509|-|-',
              'YC5.9-NT1 QD7 chủ ngừng chia sẻ: Hùng vẫn xem đặt phòng, không còn số chủ, không còn cọc');
select t.khong_loi(format('select public.fn_sale_sua_gia_ban(%L, 2500000)', t.b('B1')),
                   'YC5.9-NT1 YC5-H10 sale đã bị ngừng vẫn sửa được giá bán của mình');
select t.thoat();
-- S3-10: chủ sửa đặt phòng thì có nội dung lần sửa mới nhất.
insert into public.thong_bao (nguoi_nhan, loai, noi_dung, doi_tuong_loai, doi_tuong_id, tao_luc)
values (t.id('hung'), 'chu_sua_dat_phong', '{"ngay_nhan_cu": "2026-10-19", "tien_phong_cu": 2000000}', 'booking', t.b('B1'), now() - interval '1 day'),
       (t.id('hung'), 'chu_sua_dat_phong', '{"ngay_nhan_cu": "2026-10-18", "tien_phong_cu": 2200000}', 'booking', t.b('B1'), now());
select t.dang_nhap(t.id('hung'));
select t.bang((pg_temp.xem('B1') -> 'sua_gan_nhat' -> 'noi_dung' ->> 'tien_phong_cu'), '2200000',
              'YC5.9-NT1 YC5.6 S3-10 có lần chủ sửa mới nhất');
select t.thoat();
-- Đặt phòng đã hủy: xem được, không sửa giá bán.
update public.booking b set huy_xin_boi = b.sale_id, huy_xin_luc = now(), huy_tra_loi = 'dong_y', huy_tra_loi_boi = t.id('hoa'),
       huy_tra_loi_luc = now(), trang_thai = 'da_huy' where b.id = t.b('B1');
select t.dang_nhap(t.id('hung'));
select t.bang(pg_temp.xem('B1') ->> 'trang_thai', 'da_huy', 'YC5.9-NT1 QD12 đặt phòng đã hủy vẫn xem được');
select t.loi(format('select public.fn_sale_sua_gia_ban(%L, 2600000)', t.b('B1')), 'Đặt phòng đã hủy%',
             'YC5.9-NT1 đặt phòng đã hủy không sửa giá bán');
select t.thoat();
