-- US33 · Hủy đặt phòng có sale (YC5.8, QD12). Viết trước code (US33-TA2, CL14.5): task sau không sửa kỳ vọng của file này.
-- Hợp đồng database:
--   fn_xin_huy(p_booking_id uuid) → void: chủ nhà giữ căn hoặc sale đứng tên xin hủy đặt phòng có sale ở căn có lịch, đang
--   hiệu lực, chưa có lời xin đang chờ, chưa từng bị từ chối hủy. Ghi ai xin, lúc nào; thông báo 'xin_huy' cho bên kia.
--   Đặt phòng khách lẻ, đặt phòng sale tự ghi ở căn tự nhập: "Đặt phòng này không cần xin hủy". Người khác: lỗi quyền 42501.
--   fn_tra_loi_huy(p_booking_id uuid, p_dong_y boolean) → void: bên kia trả lời lời xin đang chờ. Đồng ý: đã hủy, các đêm trống
--   lại. Không đồng ý: về như cũ, ghi lúc từ chối, không xin lại được. Thông báo 'tra_loi_huy' cho bên xin. Người xin tự trả
--   lời bị từ chối. Người khác: 42501.
--   fn_tinh_trang_huy(p_booking_id uuid) → jsonb {tinh_trang ('hieu_luc', 'cho_dong_y', 'bi_tu_choi', 'da_huy'), xin_huy_duoc,
--   toi_xin, tra_loi_duoc, ten_nguoi_xin}: cho chủ nhà giữ căn và sale đứng tên. Người khác: 42501.
-- Xin hủy không hết hạn (YC5-H18 đang tạm làm). Đã qua ngày trả, sale bị ngừng vẫn xin được (YC5-H14, YC5-H15 database
-- đang cho). QT2.1, QT6.1, QD6, QD7, QD11, QD12, PQ7, PQ17, KT-DB.3.8.
select t.fixture();

-- B1: Chị Hoa ghi 1509 10/10 → 12/10 cho Hùng (DLM.4), giá bán 2.600.000đ. B3: Hùng, 1509 24/10 → 26/10, giá bán 2.300.000đ.
-- B5 khách lẻ của Chị Hoa. V2 Hùng tự ghi cho Villa (căn tự nhập).
select t.tao_booking('B1', t.can('1509'), '2026-10-10', '2026-10-12', 2200000, t.id('hung'), 'chu_ghi');
insert into public.booking_rieng (booking_id, nguoi_id, tien_thu_khach) values (t.b('B1'), t.id('hung'), 2600000);
select t.tao_booking('B3', t.can('1509'), '2026-10-24', '2026-10-26', 1800000, t.id('hung'), 'chu_ghi');
insert into public.booking_rieng (booking_id, nguoi_id, tien_thu_khach) values (t.b('B3'), t.id('hung'), 2300000);
select t.tao_booking('B5', t.can('1509'), '2026-10-13', '2026-10-15', 1800000);
select t.tao_booking('V2', t.can('villa'), '2026-10-08', '2026-10-09', 1400000);

create or replace function pg_temp.tt(p_ma text) returns jsonb language plpgsql as $$
begin
  return t.gt(format('select public.fn_tinh_trang_huy(%L)', t.b(p_ma)))::jsonb;
end $$;
create or replace function pg_temp.tom(j jsonb) returns text language sql immutable as $$
  select (j ->> 'tinh_trang') || '|' || (j ->> 'xin_huy_duoc') || '|' || (j ->> 'toi_xin') || '|' || (j ->> 'tra_loi_duoc')
         || '|' || coalesce(j ->> 'ten_nguoi_xin', '')
$$;
create or replace function pg_temp.trang_thai(p_ma text) returns text language sql stable as $$
  select b.trang_thai || '|' || coalesce(b.huy_xin_boi::text, '') || '|' || coalesce(b.huy_tra_loi, '')
  from public.booking b where b.id = t.b(p_ma)
$$;
create or replace function pg_temp.so_tb(p_nguoi uuid, p_loai text, p_ma text) returns bigint language sql stable as $$
  select count(*) from public.thong_bao tb
  where tb.nguoi_nhan = p_nguoi and tb.loai = p_loai and tb.doi_tuong_loai = 'booking' and tb.doi_tuong_id = t.b(p_ma)
$$;
create or replace function pg_temp.ghi_thu(p_nhan date, p_tra date) returns text language sql as $$
  select format('select public.fn_tao_booking(%L, %L, %L, 1800000)', t.can('1509'), p_nhan, p_tra)
$$;

-- ===== Danh mục, quyền gọi =====
select t.ok((select count(*) from pg_proc where proname in ('fn_xin_huy', 'fn_tra_loi_huy', 'fn_tinh_trang_huy') and prosecdef) = 3,
            'YC5.8-NT1 danh mục: fn_xin_huy, fn_tra_loi_huy, fn_tinh_trang_huy có và chạy security definer');
select t.ok(exists (select 1 from pg_proc where proname = 'fn_xin_huy')
            and not exists (select 1 from pg_proc p where p.proname in ('fn_xin_huy', 'fn_tra_loi_huy', 'fn_tinh_trang_huy')
                              and has_function_privilege('anon', p.oid, 'execute')),
            'YC5.8-NT5 PQ15.LINK người chưa đăng nhập không gọi được ba lệnh');

-- ===== Trước khi xin: B1 hiệu lực, hai bên xin hủy được =====
select t.dang_nhap(t.id('hoa'));
select t.bang(pg_temp.tom(pg_temp.tt('B1')), 'hieu_luc|true|false|false|', 'YC5.8-NT1 trước khi xin: Chị Hoa thấy B1 hiệu lực, xin hủy được');
select t.dang_nhap(t.id('hung'));
select t.bang(pg_temp.tom(pg_temp.tt('B1')), 'hieu_luc|true|false|false|', 'YC5.8-NT1 trước khi xin: Hùng thấy B1 hiệu lực, xin hủy được');

-- ===== YC5.8-NT5: Lan, Anh Tuấn không xin, không trả lời, không xem được =====
select t.dang_nhap(t.id('lan'));
select t.loi(format('select public.fn_xin_huy(%L)', t.b('B1')), '42501', 'YC5.8-NT5 Sale Lan xin hủy B1 của Hùng: lỗi quyền');
select t.loi(format('select public.fn_tinh_trang_huy(%L)', t.b('B1')), '42501', 'YC5.8-NT5 Sale Lan không đọc được tình trạng hủy B1');
select t.dang_nhap(t.id('tuan'));
select t.loi(format('select public.fn_xin_huy(%L)', t.b('B1')), '42501', 'YC5.8-NT5 Anh Tuấn xin hủy B1 căn của Chị Hoa: lỗi quyền');
select t.loi(format('select public.fn_xin_huy(%L)', gen_random_uuid()), '42501', 'YC5.8-NT5 HV5 đặt phòng không có: lỗi quyền');
select t.thoat();
select t.bang(pg_temp.trang_thai('B1'), 'hieu_luc||', 'YC5.8-NT5 B1 không đổi sau lệnh xin hủy của Lan, Anh Tuấn');

-- ===== YC5.8-NT6: B5 khách lẻ, V2 căn tự nhập không cần xin hủy =====
select t.dang_nhap(t.id('hoa'));
select t.loi(format('select public.fn_xin_huy(%L)', t.b('B5')), 'Đặt phòng này không cần xin hủy',
             'YC5.8-NT6 Chị Hoa xin hủy B5 khách lẻ: "Đặt phòng này không cần xin hủy"');
select t.bang(pg_temp.tom(pg_temp.tt('B5')), 'hieu_luc|false|false|false|', 'YC5.8-NT6 B5 khách lẻ: không xin hủy được');
select t.dang_nhap(t.id('hung'));
select t.loi(format('select public.fn_xin_huy(%L)', t.b('V2')), 'Đặt phòng này không cần xin hủy',
             'YC5.8-NT6 Hùng xin hủy V2 tự ghi ở căn tự nhập: "Đặt phòng này không cần xin hủy"');
select t.thoat();
select t.bang(pg_temp.trang_thai('B5'), 'hieu_luc||', 'YC5.8-NT6 B5 không đổi');

-- ===== YC5.8-NT1: Hùng xin hủy B1 =====
select t.dang_nhap(t.id('hung'));
select t.loi(format('select public.fn_tra_loi_huy(%L, true)', t.b('B1')), 'Không có lời xin hủy%',
             'YC5.8-NT4 chưa ai xin hủy thì không trả lời được');
select t.khong_loi(format('select public.fn_xin_huy(%L)', t.b('B1')), 'YC5.8-NT1 Hùng xin hủy B1');
select t.thoat();
select t.bang(pg_temp.trang_thai('B1'), 'hieu_luc|' || t.id('hung') || '|', 'YC5.8-NT1 B1 vẫn hiệu lực, ghi Hùng xin');
select t.ok((select huy_xin_luc is not null from public.booking where id = t.b('B1')), 'YC5.8-NT1 ghi lúc xin hủy');
select t.dang_nhap(t.id('hung'));
select t.bang(pg_temp.tom(pg_temp.tt('B1')), 'cho_dong_y|false|true|false|Sale Hùng',
              'YC5.8-NT1 Hùng thấy "Chờ đồng ý hủy", không tự trả lời được');
select t.loi(format('select public.fn_xin_huy(%L)', t.b('B1')), 'Đã có lời xin hủy%', 'YC5.8-NT1 đang chờ thì không xin hủy lần nữa');
select t.dang_nhap(t.id('hoa'));
select t.bang(pg_temp.tom(pg_temp.tt('B1')), 'cho_dong_y|false|false|true|Sale Hùng',
              'YC5.8-NT1 Chị Hoa thấy "Sale Hùng xin hủy đặt phòng này", trả lời được');
select t.loi(pg_temp.ghi_thu('2026-10-10', '2026-10-12'), 'Căn đã có đặt phòng trong những đêm này',
             'YC5.8-NT1 QD6 đêm 10/10, 11/10 của 1509 vẫn kín khi đang chờ hủy');
select t.thoat();
select t.bang(pg_temp.so_tb(t.id('hoa'), 'xin_huy', 'B1'), 1::bigint, 'YC5.8-NT1 Chị Hoa có một thông báo xin hủy B1');
select t.bang(pg_temp.so_tb(t.id('hung'), 'xin_huy', 'B1'), 0::bigint, 'YC5.8-NT1 người xin không nhận thông báo xin hủy của mình');
select t.bang((select (tb.noi_dung ->> 'ten_nguoi_xin') || '|' || (tb.noi_dung ->> 'ma_can') || '|' || (tb.noi_dung ->> 'ngay_nhan')
                      || '|' || (tb.noi_dung ->> 'ngay_tra')
               from public.thong_bao tb where tb.nguoi_nhan = t.id('hoa') and tb.loai = 'xin_huy' and tb.doi_tuong_id = t.b('B1')),
              'Sale Hùng|1509|2026-10-10|2026-10-12', 'YC5.8-NT1 YC12 thông báo xin hủy: người xin, căn, ngày ở');
select t.ok((select position('2600000' in tb.noi_dung::text) = 0 from public.thong_bao tb
             where tb.nguoi_nhan = t.id('hoa') and tb.loai = 'xin_huy' and tb.doi_tuong_id = t.b('B1')),
            'YC5.8-NT1 PQ11 thông báo cho chủ nhà không có giá bán của sale');

-- ===== YC5.8-NT4: Hùng tự đồng ý bị từ chối =====
select t.dang_nhap(t.id('hung'));
select t.loi(format('select public.fn_tra_loi_huy(%L, true)', t.b('B1')), 'Người xin hủy không tự đồng ý được%',
             'YC5.8-NT4 Hùng đã xin hủy B1 thì tự đồng ý bị từ chối');
select t.dang_nhap(t.id('lan'));
select t.loi(format('select public.fn_tra_loi_huy(%L, true)', t.b('B1')), '42501', 'YC5.8-NT5 Sale Lan đồng ý hủy B1: lỗi quyền');
select t.thoat();
select t.bang(pg_temp.trang_thai('B1'), 'hieu_luc|' || t.id('hung') || '|', 'YC5.8-NT4 B1 vẫn chờ đồng ý hủy');

-- ===== YC5.8-NT3: Chị Hoa không đồng ý =====
select t.dang_nhap(t.id('hoa'));
select t.khong_loi(format('select public.fn_tra_loi_huy(%L, false)', t.b('B1')), 'YC5.8-NT3 Chị Hoa không đồng ý hủy B1');
select t.bang(pg_temp.trang_thai('B1'), 'hieu_luc|' || t.id('hung') || '|tu_choi', 'YC5.8-NT3 B1 như trước, ghi từ chối hủy');
select t.ok((select huy_tra_loi_luc is not null and huy_tra_loi_boi = t.id('hoa') from public.booking where id = t.b('B1')),
            'YC5.8-NT3 ghi ai từ chối, lúc nào');
select t.bang(pg_temp.tom(pg_temp.tt('B1')), 'bi_tu_choi|false|false|false|Sale Hùng', 'YC5.8-NT3 Chị Hoa thấy "Bị từ chối hủy"');
select t.loi(format('select public.fn_xin_huy(%L)', t.b('B1')), 'Lời xin hủy đã bị từ chối%',
             'YC5.8-NT3 Chị Hoa xin hủy B1 lần nữa bị từ chối');
select t.dang_nhap(t.id('hung'));
select t.bang(pg_temp.tom(pg_temp.tt('B1')), 'bi_tu_choi|false|true|false|Sale Hùng', 'YC5.8-NT3 Hùng thấy "Bị từ chối hủy"');
select t.loi(format('select public.fn_xin_huy(%L)', t.b('B1')), 'Lời xin hủy đã bị từ chối%',
             'YC5.8-NT3 Hùng xin hủy B1 lần nữa bị từ chối');
select t.thoat();
select t.bang(pg_temp.trang_thai('B1'), 'hieu_luc|' || t.id('hung') || '|tu_choi', 'YC5.8-NT3 B1 không đổi sau lệnh xin lại');
select t.bang((select (tb.noi_dung ->> 'ten_nguoi_tra_loi') || '|' || (tb.noi_dung ->> 'dong_y')
               from public.thong_bao tb where tb.nguoi_nhan = t.id('hung') and tb.loai = 'tra_loi_huy' and tb.doi_tuong_id = t.b('B1')),
              'Chị Hoa|false', 'YC5.8-NT3 YC12 Hùng có thông báo "Chị Hoa không đồng ý hủy"');

-- ===== YC5.8-NT2: Chị Hoa xin hủy B3, Hùng đồng ý =====
select t.dang_nhap(t.id('hoa'));
select (public.fn_thong_ke_chu('2026-10-01') ->> 'doanh_thu')::bigint as dt into temp dt_truoc;
select t.dang_nhap(t.id('hung'));
select (public.fn_thong_ke_sale('2026-10-01') ->> 'tien_chenh')::bigint as tc into temp tc_truoc;
select t.dang_nhap(t.id('hoa'));
select t.khong_loi(format('select public.fn_xin_huy(%L)', t.b('B3')), 'YC5.8-NT2 Chị Hoa xin hủy B3');
select t.thoat();
select t.bang(pg_temp.so_tb(t.id('hung'), 'xin_huy', 'B3'), 1::bigint, 'YC5.8-NT2 Hùng có thông báo xin hủy B3');
select t.ok((select c.lich_doi_luc from public.can c where c.id = t.can('1509')) is not null, 'YC5.8-NT2 chuẩn bị: 1509 có lich_doi_luc');
update public.can set lich_doi_luc = '2026-01-01' where id = t.can('1509');
select t.dang_nhap(t.id('hung'));
select t.khong_loi(format('select public.fn_tra_loi_huy(%L, true)', t.b('B3')), 'YC5.8-NT2 Hùng đồng ý hủy B3');
select t.bang(pg_temp.tom(pg_temp.tt('B3')), 'da_huy|false|false|false|Chị Hoa', 'YC5.8-NT2 Hùng thấy B3 "Đã hủy"');
select t.bang((public.fn_thong_ke_sale('2026-10-01') ->> 'tien_chenh')::bigint, (select tc from tc_truoc) - 500000,
              'YC5.8-NT2 B3 không còn tính vào tiền chênh của Hùng');
select t.loi(format('select public.fn_tra_loi_huy(%L, false)', t.b('B3')), 'Không có lời xin hủy%',
             'YC5.8-NT2 đã hủy thì không trả lời lần nữa');
select t.dang_nhap(t.id('hoa'));
select t.bang(pg_temp.tom(pg_temp.tt('B3')), 'da_huy|false|true|false|Chị Hoa', 'YC5.8-NT2 Chị Hoa thấy B3 "Đã hủy"');
select t.bang((public.fn_thong_ke_chu('2026-10-01') ->> 'doanh_thu')::bigint, (select dt from dt_truoc) - 1800000,
              'YC5.8-NT2 B3 không còn tính vào doanh thu, đêm có khách của Chị Hoa');
select t.loi(format('select public.fn_xin_huy(%L)', t.b('B3')), 'Đặt phòng đã hủy%', 'YC5.8-NT2 đặt phòng đã hủy không xin hủy được');
select t.khong_loi(pg_temp.ghi_thu('2026-10-24', '2026-10-26'), 'YC5.8-NT2 QD6 đêm 24/10, 25/10 trống lại, ghi được đặt phòng mới');
select t.thoat();
select t.bang(pg_temp.trang_thai('B3'), 'da_huy|' || t.id('hoa') || '|dong_y', 'YC5.8-NT2 B3 đã hủy, vẫn còn trong bảng');
select t.ok((select c.lich_doi_luc > '2026-01-02' from public.can c where c.id = t.can('1509')),
            'YC5.8-NT2 hủy xong thì lịch của 1509 đổi (lich_doi_luc)');
select t.bang((select (tb.noi_dung ->> 'ten_nguoi_tra_loi') || '|' || (tb.noi_dung ->> 'dong_y')
               from public.thong_bao tb where tb.nguoi_nhan = t.id('hoa') and tb.loai = 'tra_loi_huy' and tb.doi_tuong_id = t.b('B3')),
              'Sale Hùng|true', 'YC5.8-NT2 YC12 Chị Hoa có thông báo "Sale Hùng đã đồng ý hủy"');
select t.bang(pg_temp.so_tb(t.id('hung'), 'tra_loi_huy', 'B3'), 0::bigint, 'YC5.8-NT2 người trả lời không nhận thông báo trả lời');

-- ===== QD7, YC5-H15: Hoa ngừng cho Hùng xem, Hùng vẫn xem và xin hủy đặt phòng cũ =====
select t.tao_booking('B7', t.can('3402'), '2026-11-02', '2026-11-04', 1900000, t.id('hung'), 'chu_ghi');
update public.ket_noi set trang_thai = 'chu_ngung' where chu_id = t.id('hoa') and sale_id = t.id('hung');
select t.dang_nhap(t.id('hung'));
select t.khong_loi(format('select public.fn_xin_huy(%L)', t.b('B7')), 'YC5.8-NT1 QD7 YC5-H15 sale bị ngừng vẫn xin hủy đặt phòng cũ');
select t.thoat();
