-- KT-DB.3.7 · Căn tự nhập không có lịch trống: o_lich() chỉ trả 'ban' (của bạn) hoặc 'chua_biet', không bao giờ
-- 'trong' hay 'kin' (PQ14.SALE, QT1.3). Căn co_lich: 'kin' hay 'trong'. Không có quyền: null.
select t.fixture();

select t.dang_nhap(t.id('hung'));
select t.bang(t.gt($$public.o_lich(t.can('villa'), '2026-10-08')$$), 'chua_biet',
              'KT-DB.3.7 PQ14.SALE Villa Tuần Châu chưa có booking: ô 08/10 là chua_biet');
select t.thoat();

select t.tao_booking('V2', t.can('villa'), '2026-10-08', '2026-10-09', 1400000);
select t.tao_booking('B1', t.can('1509'), '2026-10-10', '2026-10-12', 2200000, t.id('hung'), 'tu_yeu_cau');

select t.dang_nhap(t.id('hung'));
select t.bang(t.gt($$public.o_lich(t.can('villa'), '2026-10-08')$$), 'ban',
              'KT-DB.3.7 PQ14.SALE QT1.3-VD1 Villa có V2 08/10 → 09/10: ô 08/10 là ban');
select t.bang(t.gt($$public.o_lich(t.can('villa'), '2026-10-09')$$), 'chua_biet',
              'KT-DB.3.7 PQ14.SALE ô 09/10 (ngày trả của V2) là chua_biet');
select t.bang(t.gt($$public.o_lich(t.can('villa'), '2026-10-07')$$), 'chua_biet',
              'KT-DB.3.7 PQ14.SALE ô 07/10 là chua_biet');
select t.bang(t.gt($$(select coalesce(string_agg(distinct coalesce(public.o_lich(t.can('villa'), d::date), 'null'), ','), 'không có')
                     from generate_series('2026-09-01'::date, '2026-12-31'::date, '1 day') d
                     where public.o_lich(t.can('villa'), d::date) is distinct from 'ban'
                       and public.o_lich(t.can('villa'), d::date) is distinct from 'chua_biet')$$), 'không có',
              'KT-DB.3.7 căn tự nhập: mọi ô từ 01/09 tới 31/12 chỉ là ban hoặc chua_biet, không bao giờ trong hay kin');
select t.bang(t.gt($$public.o_lich(t.can('1509'), '2026-10-10')$$), 'kin', 'KT-DB.3.7 PQ4.SALE 1509 có B1: ô 10/10 của Hùng là kin');
select t.bang(t.gt($$public.o_lich(t.can('1509'), '2026-10-12')$$), 'trong', 'KT-DB.3.7 PQ4.SALE 1509 ô 12/10 của Hùng là trong');
select t.bang(t.gt($$coalesce(public.o_lich(t.can('1103'), '2026-10-12'), 'null')$$), 'null', 'KT-DB.3.7 PQ Luật chung 3 1103 không có quyền: Hùng nhận null');
select t.thoat();

select t.dang_nhap(t.id('hoa'));
select t.bang(t.gt($$public.o_lich(t.can('1509'), '2026-10-11')$$), 'kin', 'KT-DB.3.7 PQ4.CHU Chị Hoa ô 11/10 của 1509 là kin');
select t.bang(t.gt($$public.o_lich(t.can('1509'), '2026-10-12')$$), 'trong', 'KT-DB.3.7 PQ4.CHU Chị Hoa ô 12/10 của 1509 là trong');
select t.bang(t.gt($$coalesce(public.o_lich(t.can('villa'), '2026-10-08'), 'null')$$), 'null', 'KT-DB.3.7 PQ14.CHU Chị Hoa không có quyền với căn tự nhập của Hùng: null');
select t.thoat();

select t.dang_nhap(t.id('lan'));
select t.bang(t.gt($$coalesce(public.o_lich(t.can('villa'), '2026-10-08'), 'null')$$), 'null', 'KT-DB.3.7 PQ14.SALE sale khác không có quyền với căn tự nhập của Hùng: null');
select t.bang(t.gt($$coalesce(public.o_lich(t.can('3402'), '2026-10-08'), 'null')$$), 'null', 'KT-DB.3.7 PQ4.SALE Lan không có quyền với 3402: null');
select t.bang(t.gt($$public.o_lich(t.can('1509'), '2026-10-10')$$), 'kin', 'KT-DB.3.7 PQ4.SALE Lan thấy 1509 ô 10/10 là kin');
select t.thoat();

select t.dang_nhap(t.id('nga'));
select t.bang(t.gt($$coalesce(public.o_lich(t.can('1509'), '2026-10-12'), 'null')$$), 'null', 'KT-DB.3.7 PQ4.SALE Nga chưa kết nối: null');
select t.thoat();

-- Booking đã hủy của căn tự nhập: ô trở về chua_biet, không thành trong.
update public.booking set trang_thai = 'da_huy' where id = t.b('V2');
select t.dang_nhap(t.id('hung'));
select t.bang(t.gt($$public.o_lich(t.can('villa'), '2026-10-08')$$), 'chua_biet', 'KT-DB.3.7 booking căn tự nhập đã hủy: ô 08/10 là chua_biet, không phải trong');
select t.thoat();

-- Căn tự nhập đã ẩn vẫn không bao giờ trong.
update public.can set an_luc = now() where id = t.can('villa');
select t.dang_nhap(t.id('hung'));
select t.ok(t.gt($$coalesce(public.o_lich(t.can('villa'), '2026-10-08'), 'null')$$) not in ('trong', 'kin'), 'KT-DB.3.7 căn tự nhập đã ẩn không trả trong');
select t.thoat();
