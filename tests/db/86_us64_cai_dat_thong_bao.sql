-- US64 · Cài đặt thông báo (YC12.4). Lệnh fn_dat_cai_dat_thong_bao ghi các loại đã tắt của chính người gọi; công tắc chặn ghi.
-- YC12.4-NT2, NT3, YC12 "Quy tắc của nhóm" (Công tắc chặn ghi), PQ11, PQ19, QD5. Viết trước migration (US64-TA1, CL14.5).
select t.fixture();

create or replace function pg_temp.so_tb(p_nguoi uuid, p_loai text) returns bigint language sql as $$
  select count(*) from public.thong_bao where nguoi_nhan = p_nguoi and loai = p_loai
$$;
update public.cai_dat_rieng set thong_bao_tat = '{}' where nguoi_id in (t.id('hung'), t.id('lan'), t.id('hoa'));

select t.ok(exists (select 1 from pg_proc where proname = 'fn_dat_cai_dat_thong_bao' and pronamespace = 'public'::regnamespace and prosecdef),
            'YC12.4 danh mục: có lệnh fn_dat_cai_dat_thong_bao chạy security definer');
select t.ok(not exists (select 1 from pg_proc p where p.proname = 'fn_dat_cai_dat_thong_bao' and p.pronamespace = 'public'::regnamespace
                        and has_function_privilege('anon', p.oid, 'execute')),
            'YC12.4 danh mục PQ19: người chưa đăng nhập không gọi được fn_dat_cai_dat_thong_bao');
select t.ok(not has_table_privilege('authenticated', 'public.cai_dat_rieng', 'UPDATE')
            and not has_table_privilege('authenticated', 'public.cai_dat_rieng', 'INSERT'),
            'YC12.4-NT3 danh mục: app không ghi thẳng cai_dat_rieng, chỉ qua lệnh');
select t.ok(not exists (select 1 from information_schema.parameters p
                        where p.specific_schema = 'public' and p.specific_name like 'fn_dat_cai_dat_thong_bao%'
                          and p.parameter_name in ('p_id', 'p_nguoi', 'p_nguoi_id')),
            'YC12.4-NT3 danh mục: lệnh không nhận mã người');

-- ===== YC12.4-NT2: Hùng tắt "Căn bạn đã gửi khách vừa có người đặt" =====
select t.dang_nhap(t.id('hung'));
select t.bang(t.ma_loi($$select public.fn_dat_cai_dat_thong_bao(array['can_da_gui_co_nguoi_dat'])$$), null::text,
              'YC12.4-NT2 Sale Hùng tắt loại "căn đã gửi khách có người đặt" thì qua');
select t.bang(t.gt($$select array_to_string(thong_bao_tat, ',') from public.cai_dat_rieng where nguoi_id = auth.uid()$$),
              'can_da_gui_co_nguoi_dat', 'YC12.4 cài đặt của Hùng ghi đúng loại đã tắt (đọc qua RLS của chính mình)');
select t.thoat();
insert into public.lan_gui_khach (id, sale_id, can_id, dem)
values ('00000000-0000-0000-0064-000000000001', t.id('hung'), t.can('1509'), daterange(public.local_today() + 70, public.local_today() + 73)),
       ('00000000-0000-0000-0064-000000000002', t.id('lan'), t.can('1509'), daterange(public.local_today() + 70, public.local_today() + 73));
select t.dang_nhap(t.id('hoa'));
select public.fn_tao_booking(p_can_id => t.can('1509'), p_ngay_nhan => public.local_today() + 71,
                             p_ngay_tra => public.local_today() + 72, p_tien_phong => 900000, p_client_id => gen_random_uuid());
select t.thoat();
select t.bang(pg_temp.so_tb(t.id('hung'), 'can_da_gui_co_nguoi_dat'), 0::bigint,
              'YC12.4-NT2 Hùng đã tắt nên không có thông báo căn đã gửi khách có người đặt');
select t.bang(pg_temp.so_tb(t.id('lan'), 'can_da_gui_co_nguoi_dat'), 1::bigint,
              'YC12.4-NT2 Lan chưa tắt nên vẫn có thông báo đó');

-- Loại khác của Hùng vẫn ghi: chủ nhà đồng ý cho xem lịch (loại có công tắc khác, chưa tắt).
select t.bang(public.thong_bao_bat(t.id('hung'), 'chu_ghi_dat_phong_cho_sale'), true, 'YC12.4-NT2 loại khác của Hùng vẫn bật');
insert into public.thong_bao (nguoi_nhan, loai, noi_dung) values (t.id('hung'), 'chu_dong_y_ket_noi', '{}');
select t.bang(pg_temp.so_tb(t.id('hung'), 'chu_dong_y_ket_noi'), 1::bigint, 'YC12.4-NT2 loại "chủ nhà đồng ý cho xem lịch" của Hùng vẫn ghi khi chưa tắt');

-- Công tắc chặn ghi cho mọi loại có công tắc: tắt rồi thì không ghi (từ lúc tắt).
select t.dang_nhap(t.id('hung'));
select public.fn_dat_cai_dat_thong_bao(array['chu_dong_y_ket_noi', 'can_da_gui_co_nguoi_dat']);
select t.thoat();
insert into public.thong_bao (nguoi_nhan, loai, noi_dung) values (t.id('hung'), 'chu_dong_y_ket_noi', '{}');
select t.bang(pg_temp.so_tb(t.id('hung'), 'chu_dong_y_ket_noi'), 1::bigint, 'YC12.4-NT2 công tắc chặn ghi: Hùng tắt thì dòng mới không được ghi, dòng cũ giữ (YC12-H4, GD29)');
insert into public.thong_bao (nguoi_nhan, loai, noi_dung) values (t.id('hung'), 'chu_ngung_cho_xem', '{}');
select t.bang(pg_temp.so_tb(t.id('hung'), 'chu_ngung_cho_xem'), 1::bigint, 'YC12 loại không có công tắc thì luôn ghi');

-- Bật lại: gửi danh sách rỗng.
select t.dang_nhap(t.id('hung'));
select public.fn_dat_cai_dat_thong_bao(array[]::text[]);
select t.bang(t.gt($$select cardinality(thong_bao_tat) from public.cai_dat_rieng where nguoi_id = auth.uid()$$), '0', 'YC12.4 bật lại hết thì không còn loại nào tắt');

-- ===== YC12.4-NT3: người khác, loại sai vai =====
select t.dang_nhap(t.id('lan'));
select t.bang(t.ma_loi($$update public.cai_dat_rieng set thong_bao_tat = '{chu_ghi_dat_phong_cho_sale}' where nguoi_id = '00000000-0000-0000-0000-000000000003'$$), '42501',
              'YC12.4-NT3 Sale Lan sửa thẳng cài đặt của Hùng bị từ chối');
select t.bang(t.ma_loi($$select public.fn_dat_cai_dat_thong_bao(array['chu_ghi_dat_phong_cho_sale'], p_nguoi => '00000000-0000-0000-0000-000000000003')$$), '42883',
              'YC12.4-NT3 gửi mã người khác trong lệnh bị từ chối');
select t.bang(t.ma_loi($$select public.fn_dat_cai_dat_thong_bao(array['yeu_cau_moi'])$$), '42501',
              'YC12.4-NT3 sale ghi công tắc của loại chỉ chủ nhà có thì bị từ chối');
select t.dang_nhap(t.id('hoa'));
select t.bang(t.ma_loi($$select public.fn_dat_cai_dat_thong_bao(array['can_da_gui_co_nguoi_dat'])$$), '42501',
              'YC12.4-NT3 chủ nhà ghi công tắc của loại chỉ sale có thì bị từ chối');
select t.bang(t.ma_loi($$select public.fn_dat_cai_dat_thong_bao(array['khong_co_loai_nay'])$$), '22023',
              'YC12.4 loại không có trong danh sách thì bị từ chối');
select t.bang(t.ma_loi($$select public.fn_dat_cai_dat_thong_bao(array['yeu_cau_moi', 'sale_xin_xem_lich'])$$), null::text,
              'YC12.4 chủ nhà tắt hai loại của chủ nhà thì qua');
select t.thoat();
select t.bang((select array_to_string(thong_bao_tat, ',') from public.cai_dat_rieng where nguoi_id = t.id('hoa')), 'sale_xin_xem_lich,yeu_cau_moi',
              'YC12.4 cài đặt Chị Hoa ghi hai loại đã tắt');
select t.bang((select cardinality(thong_bao_tat) from public.cai_dat_rieng where nguoi_id = t.id('hung')), 0,
              'YC12.4-NT3 cài đặt của Hùng không đổi sau các lệnh của người khác');
-- Người chưa có dòng cài đặt: lệnh tự tạo (Anh Tuấn).
delete from public.cai_dat_rieng where nguoi_id = t.id('tuan');
select t.dang_nhap(t.id('tuan'));
select t.bang(t.ma_loi($$select public.fn_dat_cai_dat_thong_bao(array['dat_phong_chua_coc'])$$), null::text, 'YC12.4 chưa có dòng cài đặt thì lệnh tự tạo');
