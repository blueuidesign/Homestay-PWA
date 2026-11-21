-- US8 · Xóa tài khoản (YC1.8, QD13, QT6.5). Lệnh fn_xoa_tai_khoan: một giao dịch bỏ số, ghi lúc xóa, báo mỗi sale đang kết nối.
-- YC1.8-NT1, NT3, NT4, NT5, NT6, NT7, NT8, NT9, YC1 "Ai được làm gì" (PQ1, PQ2, PQ23). Viết trước migration (US8-TA2, CL14.5).
-- Câu tự chốt (QD25): YC1-H8 giữ ảnh đại diện, tên, số chủ căn tự nhập, khách do người xóa nhập (QD13 chỉ xóa số).
select t.fixture();

create or replace function pg_temp.so_tb(p_nguoi uuid) returns bigint language sql security definer as $$
  select count(*) from public.thong_bao where nguoi_nhan = p_nguoi and loai = 'chu_xoa_tai_khoan'
$$;

-- Dữ liệu: B1 (Sale Hùng, 1509), B5 (khách lẻ 1509, khách do Chị Hoa nhập). Nga cũng kết nối Chị Hoa.
select t.tao_booking('B1', t.can('1509'), '2026-10-10', '2026-10-12', 2200000, t.id('hung'), 'tu_yeu_cau');
select t.tao_booking('B5', t.can('1509'), '2026-10-13', '2026-10-15', 1800000);
insert into public.booking_rieng (booking_id, nguoi_id, ten_khach, sdt_khach) values (t.b('B5'), t.id('hoa'), 'Khách Mai', '0900000077');
insert into public.ket_noi (chu_id, sale_id, trang_thai, nguon, pham_vi, xem_coc)
values (t.id('hoa'), t.id('nga'), 'da_ket_noi', 'link_moi', 'tat_ca', true);
delete from public.thong_bao;

-- ===== Danh mục =====
select t.ok(exists (select 1 from pg_proc where proname = 'fn_xoa_tai_khoan' and pronamespace = 'public'::regnamespace and prosecdef),
            'YC1.8 danh mục: có lệnh fn_xoa_tai_khoan chạy security definer');
select t.ok(not exists (select 1 from pg_proc p where p.proname = 'fn_xoa_tai_khoan' and p.pronamespace = 'public'::regnamespace
                        and has_function_privilege('anon', p.oid, 'execute')),
            'YC1.8 danh mục PQ1: người chưa đăng nhập không gọi được fn_xoa_tai_khoan');
select t.ok(not exists (select 1 from information_schema.parameters p
                        where p.specific_schema = 'public' and p.specific_name like 'fn_xoa_tai_khoan%'),
            'YC1.8 danh mục: lệnh xóa không nhận tham số, chỉ xóa tài khoản của chính người gọi');
select t.khach();
select t.ok(t.ma_loi('select public.fn_xoa_tai_khoan()') is not null, 'YC1.8 PQ1 người chưa đăng nhập bị từ chối');
select t.thoat();

-- ===== YC1.8-NT3: lỗi giữa chừng thì không ghi gì =====
create function pg_temp.tg_hong() returns trigger language plpgsql as $$ begin raise exception 'hỏng thử'; end $$;
create trigger hong_thu before insert on public.thong_bao for each row execute function pg_temp.tg_hong();
select t.dang_nhap(t.id('hoa'));
select t.ok(t.ma_loi('select public.fn_xoa_tai_khoan()') is not null, 'YC1.8-NT3 lệnh xóa lỗi giữa chừng thì báo lỗi');
select t.thoat();
drop trigger hong_thu on public.thong_bao;
select t.bang((select so_dien_thoai from public.profiles where id = t.id('hoa')), '0900000001', 'YC1.8-NT3 lỗi giữa chừng: số của Chị Hoa còn nguyên');
select t.ok((select da_xoa_luc is null from public.profiles where id = t.id('hoa')), 'YC1.8-NT3 lỗi giữa chừng: chưa đánh dấu đã xóa');
select t.bang((select count(*) from public.thong_bao), 0::bigint, 'YC1.8-NT3 lỗi giữa chừng: không có thông báo nào');

-- ===== YC1.8-NT1, NT4: Chị Hoa xóa tài khoản =====
select t.dang_nhap(t.id('hoa'));
select t.bang(t.ma_loi('select public.fn_xoa_tai_khoan()'), null::text, 'YC1.8-NT1 Chị Hoa xóa tài khoản thì qua');
select t.thoat();
select t.ok((select so_dien_thoai is null and da_xoa_luc is not null from public.profiles where id = t.id('hoa')),
            'YC1.8-NT1 database không còn số của Chị Hoa, có lúc xóa');
select t.bang((select count(*) from public.can where nguoi_giu = t.id('hoa') and an_luc is null), 2::bigint, 'YC1.8-NT1 còn 1509, 3402');
select t.bang((select count(*) from public.gia_thang where can_id in (t.can('1509'), t.can('3402'))), 6::bigint, 'YC1.8-NT1 giá còn nguyên');
select t.bang((select count(*) from public.booking where can_id = t.can('1509') and trang_thai = 'hieu_luc'), 2::bigint, 'YC1.8-NT1 đặt phòng còn nguyên');
select t.bang((select ten_hien_thi from public.profiles where id = t.id('hoa')), 'Chị Hoa', 'YC1-H8 tên giữ nguyên');
select t.bang((select ten_khach from public.booking_rieng where booking_id = t.b('B5')), 'Khách Mai', 'YC1-H8 khách do Chị Hoa nhập giữ nguyên');
select t.dang_nhap(t.id('hung'));
select t.bang(t.gt(format('select coalesce(so_dien_thoai, ''null'') || ''|'' || da_xoa_tai_khoan from public.v_nguoi_ket_noi where id = %L', t.id('hoa'))),
              'null|true', 'YC1.8-NT1 PQ2 Sale Hùng không đọc được số của Chị Hoa, thấy đã xóa tài khoản');
select t.thoat();
select t.bang(pg_temp.so_tb(t.id('hung')), 1::bigint, 'YC1.8-NT4 Sale Hùng có đúng một thông báo chủ nhà đã xóa tài khoản');
select t.bang(pg_temp.so_tb(t.id('lan')), 1::bigint, 'YC1.8-NT4 Sale Lan có đúng một thông báo');
select t.bang(pg_temp.so_tb(t.id('nga')), 1::bigint, 'YC1.8-NT4 Sale Nga có đúng một thông báo');
select t.bang(pg_temp.so_tb(t.id('tuan')), 0::bigint, 'YC1.8-NT4 Anh Tuấn không kết nối thì không có thông báo');
select t.bang((select noi_dung ->> 'ten_chu' from public.thong_bao where nguoi_nhan = t.id('hung') and loai = 'chu_xoa_tai_khoan'),
              'Chị Hoa', 'YC1.8-NT4 thông báo ghi "Chị Hoa đã xóa tài khoản"');
select t.dang_nhap(t.id('hoa'));
select t.bang(t.ma_loi('select public.fn_xoa_tai_khoan()'), null::text, 'YC1.8 bấm xóa lần nữa (tài khoản đã xóa) vẫn qua');
select t.thoat();
select t.bang(pg_temp.so_tb(t.id('hung')), 1::bigint, 'YC1.8-NT4 xóa lại không ghi thêm thông báo');

-- ===== YC1.8-NT6: Hùng mở 1509 từ thông báo cũ =====
select t.dang_nhap(t.id('hung'));
select t.bang(t.gt(format($$select public.fn_sale_chi_tiet_can(%L, '2026-10-10', '2026-10-12') ->> 'ly_do'$$, t.can('1509'))),
              'Chủ nhà đã xóa tài khoản', 'YC1.8-NT6 Hùng mở 1509 thì thấy lý do "Chủ nhà đã xóa tài khoản"');
select t.ok(t.gt(format($$select public.fn_sale_chi_tiet_can(%L, '2026-10-10', '2026-10-12') -> 'anh'$$, t.can('1509'))) is null,
            'YC1.8-NT6 không có ảnh, lịch, giá');
select t.thoat();

-- ===== YC1.8-NT8: Chị Hoa đăng nhập lại và nhập lại số =====
select t.dang_nhap(t.id('hoa'));
select t.bang(t.so('select * from public.can'), 2::bigint, 'YC1.8-NT8 đăng nhập lại thấy lại 1509, 3402');
select t.bang(t.so('select * from public.booking'), 2::bigint, 'YC1.8-NT8 đăng nhập lại thấy lại đặt phòng');
select t.bang(t.ma_loi($$select public.fn_dang_ky('Chị Hoa', '0900000001')$$), null::text, 'YC1.8-NT8 nhập lại số thì qua');
select t.dang_nhap(t.id('hung'));
select t.bang(t.so(format('select * from public.can where nguoi_giu = %L', t.id('hoa'))), 2::bigint,
              'YC1.8-NT8 Hùng thấy lại 1509, 3402 theo kết nối cũ, không phải mời lại');
select t.thoat();

-- ===== YC1.8-NT5, NT9: Sale Hùng xóa tài khoản =====
delete from public.thong_bao;
select t.dang_nhap(t.id('hung'));
select t.bang(t.ma_loi('select public.fn_xoa_tai_khoan()'), null::text, 'YC1.8-NT5 Sale Hùng xóa tài khoản thì qua');
select t.thoat();
select t.bang((select count(*) from public.thong_bao), 0::bigint, 'YC1.8 sale xóa tài khoản (không có căn chia sẻ) không báo ai');
select t.ok(t.ma_loi(format($$insert into public.booking (can_id, ngay_nhan, ngay_tra, nguon, tao_boi, tien_phong)
                              values (%L, '2026-10-11', '2026-10-12', 'chu_ghi', %L, 900000)$$, t.can('1509'), t.id('hoa'))) is not null,
            'YC1.8-NT5 B1 của Hùng vẫn chiếm 11/10 ở 1509 và vẫn chặn trùng');
select t.dang_nhap(t.id('hoa'));
select t.bang(t.ma_loi(format('select public.fn_dat_xem_coc(%L, false)', t.kn('hoa', 'hung'))), 'P0001',
              'YC1.8-NT9 Chị Hoa không đổi được quyền xem cọc cho Hùng đã xóa tài khoản');
select t.bang(t.ma_loi(format('select public.fn_ngung_cho_xem(%L)', t.kn('hoa', 'hung'))), 'P0001',
              'YC1.8-NT9 Chị Hoa không ngừng cho xem được với Hùng đã xóa tài khoản');
select t.thoat();
select t.ok(t.ma_loi(format($$update public.ket_noi set pham_vi = 'chon_can' where id = %L$$, t.kn('hoa', 'hung'))) is not null,
            'YC1.8-NT9 database chặn đổi phạm vi của kết nối với sale đã xóa tài khoản');
select t.ok(t.ma_loi(format($$insert into public.ket_noi_can (ket_noi_id, can_id) values (%L, %L)$$, t.kn('hoa', 'hung'), t.can('3402'))) is not null,
            'YC1.8-NT9 database chặn thêm căn vào phạm vi của sale đã xóa tài khoản');
select t.bang((select pham_vi || '|' || xem_coc || '|' || trang_thai from public.ket_noi where id = t.kn('hoa', 'hung')),
              'tat_ca|true|da_ket_noi', 'YC1.8-NT9 kết nối với Hùng không đổi');
select t.dang_nhap(t.id('hung'));
select t.bang(t.ma_loi($$select public.fn_dang_ky('Sale Hùng', '0900000003')$$), null::text, 'YC1.8-NT9 Hùng nhập lại số thì qua');
select t.bang(t.so(format('select * from public.can where nguoi_giu = %L', t.id('hoa'))), 2::bigint, 'YC1.8-NT9 kết nối dùng lại ngay');
select t.dang_nhap(t.id('hoa'));
select t.bang(t.ma_loi(format('select public.fn_dat_xem_coc(%L, false)', t.kn('hoa', 'hung'))), null::text,
              'YC1.8-NT9 Hùng đã nhập lại số thì chủ nhà đổi quyền được như trước');
select t.thoat();

-- ===== YC1.8-NT7: người vừa có căn vừa bán căn người khác (QD5) =====
delete from public.thong_bao;
insert into public.can (id, nguoi_giu, loai, ma_can) values ('00000000-0000-0000-0001-0000000a0001', t.id('hung'), 'co_lich', 'H01');
insert into public.ket_noi (chu_id, sale_id, trang_thai, nguon, pham_vi, xem_coc)
values (t.id('hung'), t.id('nga'), 'da_ket_noi', 'link_moi', 'tat_ca', true);
select t.dang_nhap(t.id('hung'));
select t.bang(t.ma_loi('select public.fn_xoa_tai_khoan()'), null::text, 'YC1.8-NT7 Hùng (có căn H01, bán căn Chị Hoa) xóa tài khoản thì qua');
select t.thoat();
select t.bang(pg_temp.so_tb(t.id('nga')), 1::bigint, 'YC1.8-NT7 phía chủ nhà: Nga (sale của Hùng) có thông báo Hùng đã xóa tài khoản');
select t.bang(pg_temp.so_tb(t.id('hoa')), 0::bigint, 'YC1.8-NT7 Chị Hoa (chủ nhà của Hùng) không nhận thông báo "chủ nhà đã xóa"');
select t.dang_nhap(t.id('nga'));
select t.ok(coalesce(t.so($$select * from public.can where ma_can = 'H01'$$), 0) = 0, 'YC1.8-NT7 phía chủ nhà: Nga không còn thấy căn H01');
select t.dang_nhap(t.id('hoa'));
select t.bang(t.gt(format('select da_xoa_tai_khoan from public.v_nguoi_ket_noi where id = %L', t.id('hung'))), 'true',
              'YC1.8-NT7 phía sale: Chị Hoa thấy Hùng đã xóa tài khoản');
select t.thoat();
