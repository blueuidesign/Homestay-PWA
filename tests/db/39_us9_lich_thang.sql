-- US9 · Lịch tháng của chủ nhà (YC2.1). App đọc thẳng bảng booking qua RLS booking_doc, đúng câu lọc của
-- src/lib/dichVuLich.ts: booking chưa hủy của các căn có đêm trong tháng. PQ4.CHU, PQ7.CHU, PQ8, PQ9, QT2.1, QT2.2,
-- YC2 "Ai được làm gì": chủ nhà khác và sale không đọc được đặt phòng của Chị Hoa.
select t.fixture();

-- DLM.4: booking của Chị Hoa (B1 đến B9), một booking của Anh Tuấn.
select t.tao_booking('B1', t.can('1509'), '2026-10-10', '2026-10-12', 2200000, t.id('hung'), 'tu_yeu_cau');
select t.tao_booking('B2', t.can('3402'), '2026-10-17', '2026-10-19', 1900000, t.id('lan'));
select t.tao_booking('B3', t.can('1509'), '2026-10-04', '2026-10-06', 1800000, t.id('hung'));
select t.tao_booking('B4', t.can('3402'), '2026-10-05', '2026-10-07', 1600000, t.id('lan'));
select t.tao_booking('B5', t.can('1509'), '2026-10-13', '2026-10-15', 1800000);
select t.tao_booking('B6', t.can('3402'), '2026-10-14', '2026-10-15', 800000);
select t.tao_booking('B7', t.can('1509'), '2026-10-19', '2026-10-20', 900000);
select t.tao_booking('B8', t.can('3402'), '2026-10-21', '2026-10-22', 800000);
select t.tao_booking('B9', t.can('3402'), '2026-11-30', '2026-12-02', 1600000);
select t.tao_booking('T1', t.can('1103'), '2026-10-18', '2026-10-20', 1400000);

-- Câu đọc của app cho một tháng (dichVuLich.layThang).
create or replace function pg_temp.thang(p_tu date, p_den date) returns text language sql as $$
  select format($q$select b.id from public.booking b where b.can_id in (%L, %L) and b.trang_thai <> 'da_huy'
                   and b.ngay_nhan < %L and b.ngay_tra > %L$q$, t.can('1509'), t.can('3402'), p_den, p_tu)
$$;

-- ===== YC2.1 bước 1: Chị Hoa đọc booking chưa hủy của căn mình có đêm trong tháng =====
select t.dang_nhap(t.id('hoa'));
select t.bang(t.so(pg_temp.thang('2026-10-01', '2026-11-01')), 8::bigint,
              'YC2.1 bước 1 PQ7.CHU Chị Hoa đọc 8 đặt phòng tháng 10 của 1509, 3402 (B1 đến B8)');
select t.bang(t.so(pg_temp.thang('2026-11-01', '2026-12-01')), 1::bigint,
              'YC2.1 bước 4 QT2.2-VD1 tháng 11 có B9 (đêm 30/11)');
select t.bang(t.so(pg_temp.thang('2026-12-01', '2027-01-01')), 1::bigint,
              'QT2.2-VD1 tháng 12 cũng có B9 (đêm 01/12)');
-- QT2.2-VD2: 13 đêm có khách trong tháng 10 (đêm thuộc tháng của chính nó).
select t.bang(t.so($$select d from public.booking b, generate_series(b.ngay_nhan, b.ngay_tra - 1, interval '1 day') d
                     where b.can_id in (t.can('1509'), t.can('3402')) and b.trang_thai <> 'da_huy'
                       and d >= '2026-10-01' and d < '2026-11-01'$$), 13::bigint,
              'YC2.1 QT2.2-VD2 Chị Hoa có 13 đêm có khách trong tháng 10');
select t.bang(t.so($$select * from public.booking where can_id = t.can('1103')$$), 0::bigint,
              'YC2 Ai được làm gì PQ7.CHU Chị Hoa không đọc booking căn của Anh Tuấn');
select t.thoat();

-- ===== YC2 Ai được làm gì: chủ nhà khác, sale, người chưa đăng nhập không đọc đặt phòng của Chị Hoa =====
select t.dang_nhap(t.id('tuan'));
select t.ok(coalesce(t.so(pg_temp.thang('2026-10-01', '2026-11-01')), 0) = 0,
            'YC2 Ai được làm gì PQ7.CHU Anh Tuấn (chủ nhà khác) không đọc đặt phòng của Chị Hoa');
select t.ok(coalesce(t.so($$select * from public.booking_dem d join public.booking b on b.id = d.booking_id
                            where b.can_id in (t.can('1509'), t.can('3402'))$$), 0) = 0,
            'YC2 Ai được làm gì PQ8.CHU Anh Tuấn không đọc tiền từng đêm của Chị Hoa');
select t.ok(coalesce(t.so($$select * from public.booking_rieng where booking_id = t.b('B5')$$), 0) = 0,
            'YC2 Ai được làm gì PQ9.CHU Anh Tuấn không đọc khách của Chị Hoa');
select t.bang(t.so('select * from public.booking'), 1::bigint, 'PQ7.CHU Anh Tuấn chỉ đọc booking căn của mình');
select t.thoat();

select t.dang_nhap(t.id('hung'));
select t.ok(coalesce(t.so(pg_temp.thang('2026-10-01', '2026-11-01')), 0) = 0,
            'YC2 Ai được làm gì PQ4.SALE PQ7.SALE Sale Hùng (được chia sẻ mọi căn) không đọc bảng booking của Chị Hoa');
select t.ok(coalesce(t.so($$select * from public.booking_dem d where d.booking_id = t.b('B1')$$), 0) = 0,
            'YC2 Ai được làm gì PQ8.SALE Sale Hùng không đọc tiền từng đêm qua bảng booking_dem');
select t.thoat();

select t.dang_nhap(t.id('lan'));
select t.ok(coalesce(t.so(pg_temp.thang('2026-10-01', '2026-11-01')), 0) = 0,
            'YC2 Ai được làm gì PQ7.SALE Sale Lan không đọc bảng booking của Chị Hoa, kể cả B2 mình đứng tên');
select t.thoat();

set local role anon;
select t.ok(coalesce(t.so('select * from public.booking'), 0) = 0,
            'YC2 Ai được làm gì người chưa đăng nhập không đọc bảng booking');
reset role;

-- ===== QT2.1, QT2-H1: booking đã hủy không chiếm đêm, không hiện trên lịch =====
update public.booking set trang_thai = 'da_huy' where id = t.b('B5');
select t.dang_nhap(t.id('hoa'));
select t.bang(t.so(pg_temp.thang('2026-10-01', '2026-11-01')), 7::bigint,
              'YC2.1 QT2.1 booking đã hủy (B5) không còn trên lịch tháng 10');
select t.thoat();
select t.khong_loi($$select t.tao_booking('B10', t.can('1509'), '2026-10-13', '2026-10-15', 1800000)$$,
                   'QT2.1 QT2-H1 đêm của booking đã hủy ghi lại được');

-- ===== CN1-00: chủ nhà có căn nhưng chưa có booking chưa hủy nào =====
select t.dang_nhap(t.id('tuan'));
select t.bang(t.so($$select id from public.booking where can_id = t.can('1103') and trang_thai <> 'da_huy' limit 1$$), 1::bigint,
              'YC2.1 CN1-00 Anh Tuấn đã có đặt phòng thì không phải CN1-00');
select t.thoat();
update public.booking set trang_thai = 'da_huy' where id = t.b('T1');
select t.dang_nhap(t.id('tuan'));
select t.bang(t.so($$select id from public.booking where can_id = t.can('1103') and trang_thai <> 'da_huy' limit 1$$), 0::bigint,
              'YC2.1 CN1-00 Anh Tuấn chỉ có đặt phòng đã hủy thì là chưa có đặt phòng nào');
select t.thoat();
