-- US10 · Chi tiết một ngày (YC2.2). App đọc thẳng qua RLS, đúng câu đọc của src/lib/dichVuLich.ts: booking (kèm tiền,
-- sale đứng tên), booking_rieng (khách chính chủ nhà nhập), v_nguoi_ket_noi (tên, số sale đang kết nối).
-- PQ4, PQ7, PQ8, PQ9, PQ16; YC2 "Ai được làm gì": chủ nhà khác và sale không đọc đặt phòng, tiền, khách của Chị Hoa.
select t.fixture();

-- DLM.4: B1 của Sale Hùng (cọc 1.000.000đ), B5 chủ tự ghi cho khách lẻ có tên, T1 của Anh Tuấn.
select t.tao_booking('B1', t.can('1509'), '2026-10-10', '2026-10-12', 2200000, t.id('hung'), 'tu_yeu_cau');
select t.tao_booking('B5', t.can('1509'), '2026-10-13', '2026-10-15', 1800000);
select t.tao_booking('T1', t.can('1103'), '2026-10-18', '2026-10-20', 1400000);
update public.booking set trang_thai_tien = 'da_coc', tien_coc = 1000000 where id = t.b('B1');
update public.booking set trang_thai_tien = 'chua_coc' where id = t.b('B5');
insert into public.booking_rieng (booking_id, nguoi_id, ten_khach, sdt_khach, so_khach)
values (t.b('B1'), t.id('hung'), 'Khách của Hùng', '0900000011', 2),
       (t.b('B5'), t.id('hoa'),  'Chị Mai',        '0900000013', 3),
       (t.b('T1'), t.id('tuan'), 'Khách Anh Tuấn', '0900000014', 1);

-- Câu đọc của app cho chi tiết ngày 10/10 (dichVuLich.layThang, phần tiền và người đặt).
create or replace function pg_temp.dat_phong_hoa() returns text language sql as $$
  select format($q$select b.id, b.sale_id, b.tien_phong, b.tien_coc, b.trang_thai_tien from public.booking b
                   where b.can_id in (%L, %L) and b.trang_thai <> 'da_huy'
                     and b.ngay_nhan < '2026-11-01' and b.ngay_tra > '2026-10-01'$q$, t.can('1509'), t.can('3402'))
$$;

-- ===== YC2.2 bước 8: Chị Hoa đọc tiền, người đặt, khách mình nhập, tên và số sale đang kết nối =====
select t.dang_nhap(t.id('hoa'));
select t.bang(t.so(pg_temp.dat_phong_hoa()), 2::bigint, 'YC2.2 bước 8 PQ7.CHU Chị Hoa đọc đặt phòng tháng 10 của căn mình kèm tiền');
select t.bang(t.gt($$select tien_phong || '|' || tien_coc || '|' || trang_thai_tien || '|' || sale_id
                     from public.booking where id = t.b('B1')$$),
              '2200000|1000000|da_coc|' || t.id('hung'),
              'YC2.2 bước 8 PQ8.CHU QT6.1 Chị Hoa đọc tiền phòng, cọc, trạng thái tiền và sale của B1');
select t.bang(t.gt($$select ten_khach from public.booking_rieng where booking_id = t.b('B5')$$), 'Chị Mai',
              'YC2.2 bước 8 PQ9.CHU Chị Hoa đọc tên khách mình nhập cho B5');
select t.ok(coalesce(t.so($$select * from public.booking_rieng where booking_id = t.b('B1')$$), 0) = 0,
            'YC2.2 bước 8 PQ9.CHU QD11 Chị Hoa không đọc khách Sale Hùng nhập cho B1');
select t.bang(t.gt($$select ten_hien_thi || '|' || so_dien_thoai from public.v_nguoi_ket_noi where id = t.id('hung')$$),
              'Sale Hùng|0900000003', 'YC2.2 bước 8 PQ2 Chị Hoa đọc tên, số của Sale Hùng đang kết nối');
select t.thoat();

-- ===== YC2.2-NT3: Anh Tuấn (chủ nhà khác) đọc thẳng đặt phòng, tiền từng đêm, khách: không thấy dòng nào của Chị Hoa =====
select t.dang_nhap(t.id('tuan'));
select t.ok(coalesce(t.so(pg_temp.dat_phong_hoa()), 0) = 0,
            'YC2.2-NT3 PQ7.CHU Anh Tuấn không đọc đặt phòng của Chị Hoa');
select t.ok(coalesce(t.so($$select * from public.booking where id in (t.b('B1'), t.b('B5'))$$), 0) = 0,
            'YC2.2-NT3 PQ7.CHU PQ8.CHU Anh Tuấn không đọc B1, B5 (kể cả tiền phòng, cọc) theo id');
select t.ok(coalesce(t.so($$select * from public.booking_dem where booking_id in (t.b('B1'), t.b('B5'))$$), 0) = 0,
            'YC2.2-NT3 PQ8.CHU Anh Tuấn không đọc tiền từng đêm của Chị Hoa');
select t.ok(coalesce(t.so($$select * from public.booking_rieng where booking_id in (t.b('B1'), t.b('B5'))$$), 0) = 0,
            'YC2.2-NT3 PQ9.CHU Anh Tuấn không đọc khách của đặt phòng của Chị Hoa');
select t.bang(t.so('select * from public.booking_rieng'), 1::bigint, 'YC2.2-NT3 PQ9.CHU Anh Tuấn chỉ đọc khách mình nhập');
select t.thoat();

-- ===== YC2.2-NT3: Sale Hùng (được chia sẻ mọi căn của Chị Hoa) đọc thẳng: không thấy dòng nào =====
select t.dang_nhap(t.id('hung'));
select t.ok(coalesce(t.so(pg_temp.dat_phong_hoa()), 0) = 0,
            'YC2.2-NT3 PQ7.SALE Sale Hùng không đọc bảng booking của Chị Hoa, kể cả B1 mình đứng tên');
select t.ok(coalesce(t.so($$select * from public.booking_dem where booking_id in (t.b('B1'), t.b('B5'))$$), 0) = 0,
            'YC2.2-NT3 PQ8.SALE Sale Hùng không đọc tiền từng đêm của Chị Hoa');
select t.ok(coalesce(t.so($$select * from public.booking_rieng where nguoi_id = t.id('hoa')$$), 0) = 0,
            'YC2.2-NT3 PQ9.SALE Sale Hùng không đọc khách Chị Hoa nhập');
select t.ok(coalesce(t.so($$select * from public.booking_rieng where booking_id = t.b('B5')$$), 0) = 0,
            'YC2.2-NT3 PQ9.SALE Sale Hùng không đọc khách của B5 (đặt phòng chủ tự ghi)');
-- Sale chỉ thấy đêm kín qua lịch của sale (YC7, PQ4.SALE): có đêm, không người đặt, không tiền.
select t.bang(t.so($$select * from public.v_lich_sale where can_id = t.can('1509') and dem = '2026-10-10'$$), 1::bigint,
              'YC2.2-NT3 PQ4.SALE Sale Hùng chỉ thấy đêm 10/10 của 1509 kín qua v_lich_sale');
select t.thoat();
