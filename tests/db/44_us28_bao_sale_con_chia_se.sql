-- US28 · Thông báo "căn đã gửi khách có người đặt" chỉ tới sale còn được chia sẻ căn (YC5.3 bước 9, YC8, PQ4.SALE, PQ17.CHU).
-- Sale không còn được xem căn (bỏ căn khỏi phạm vi, hay chủ ngừng kết nối) không được biết thêm gì về lịch căn đó.
-- Bộ mẫu (tests/db/01_helpers.sql): Sale Hùng xem tất cả căn của Chị Hoa; Sale Lan chỉ xem 1509.
select t.fixture();

create or replace function pg_temp.so_tb(p_nguoi uuid, p_loai text, p_ma_can text) returns bigint language sql as $$
  select count(*) from public.thong_bao where nguoi_nhan = p_nguoi and loai = p_loai and noi_dung ->> 'ma_can' = p_ma_can
$$;
update public.cai_dat_rieng set thong_bao_tat = '{}' where nguoi_id in (t.id('hung'), t.id('lan'));

-- Ca 1: Sale Lan từng gửi 3402 cho khách, nay 3402 không còn trong phạm vi chia sẻ cho Lan.
insert into public.lan_gui_khach (id, sale_id, can_id, dem)
values ('00000000-0000-0000-0044-000000000001', t.id('hung'), t.can('3402'),
        daterange(public.local_today() + 50, public.local_today() + 53)),
       ('00000000-0000-0000-0044-000000000002', t.id('lan'), t.can('3402'),
        daterange(public.local_today() + 50, public.local_today() + 53));
select t.dang_nhap(t.id('hoa'));
select public.fn_tao_booking(p_can_id => t.can('3402'), p_ngay_nhan => public.local_today() + 51,
                             p_ngay_tra => public.local_today() + 52, p_tien_phong => 800000,
                             p_client_id => gen_random_uuid());
select t.thoat();
select t.bang(pg_temp.so_tb(t.id('hung'), 'can_da_gui_co_nguoi_dat', '3402'), 1::bigint,
              'YC5.3 bước 9 YC8 Sale Hùng (được xem 3402) có thông báo căn đã gửi khách có người đặt');
select t.bang(pg_temp.so_tb(t.id('lan'), 'can_da_gui_co_nguoi_dat', '3402'), 0::bigint,
              'YC5.3 bước 9 PQ4.SALE Sale Lan (không còn được xem 3402) không nhận thông báo về lịch 3402');

-- Ca 2: Sale Lan đã gửi 1509, sau đó Chị Hoa ngừng kết nối với Lan.
insert into public.lan_gui_khach (id, sale_id, can_id, dem)
values ('00000000-0000-0000-0044-000000000003', t.id('hung'), t.can('1509'),
        daterange(public.local_today() + 60, public.local_today() + 63)),
       ('00000000-0000-0000-0044-000000000004', t.id('lan'), t.can('1509'),
        daterange(public.local_today() + 60, public.local_today() + 63));
update public.ket_noi set trang_thai = 'chu_ngung' where id = t.kn('hoa', 'lan');
select t.dang_nhap(t.id('hoa'));
select public.fn_tao_booking(p_can_id => t.can('1509'), p_ngay_nhan => public.local_today() + 61,
                             p_ngay_tra => public.local_today() + 62, p_tien_phong => 900000,
                             p_client_id => gen_random_uuid());
select t.thoat();
select t.bang(pg_temp.so_tb(t.id('hung'), 'can_da_gui_co_nguoi_dat', '1509'), 1::bigint,
              'YC5.3 bước 9 YC8 Sale Hùng (được xem 1509) có thông báo căn đã gửi khách có người đặt');
select t.bang(pg_temp.so_tb(t.id('lan'), 'can_da_gui_co_nguoi_dat', '1509'), 0::bigint,
              'YC5.3 bước 9 PQ17.CHU Sale Lan (chủ đã ngừng kết nối) không nhận thông báo về lịch 1509');
