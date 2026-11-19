-- KT-DB.3.4 · Căn đã chia sẻ thì sale luôn thấy giá chủ nhà. Không có công tắc tắt giá, chỉ có "Tình trạng cọc" (QD7, PQ5).
select t.fixture();

select t.bang((select string_agg(column_name, ', ' order by column_name) from information_schema.columns
               where table_schema = 'public' and table_name = 'ket_noi'
                 and (column_name ilike '%gia%' or column_name ilike '%price%')),
              null::text, 'KT-DB.3.4 QD7 ket_noi không có cột nào về giá');
select t.bang((select count(*) from information_schema.columns
               where table_schema = 'public' and table_name = 'ket_noi' and column_name = 'xem_coc'),
              1::bigint, 'KT-DB.3.4 QD7 ket_noi chỉ có công tắc xem_coc');

select t.dang_nhap(t.id('hung'));
select t.bang(t.so('select * from public.gia_thang'), 6::bigint, 'KT-DB.3.4 PQ5.SALE Hùng đọc giá tháng 10–12 của 1509 và 3402');
select t.bang(t.gt($$select gia_thuong from public.gia_thang where can_id = t.can('1509') and thang = '2026-10-01'$$), '900000',
              'KT-DB.3.4 PQ5.SALE Hùng thấy giá ngày thường 1509 tháng 10 là 900.000đ');
select t.bang(t.gt($$select gia_cuoi_tuan from public.gia_thang where can_id = t.can('1509') and thang = '2026-10-01'$$), '1300000',
              'KT-DB.3.4 PQ5.SALE Hùng thấy giá cuối tuần 1509 tháng 10 là 1.300.000đ');
select t.bang(t.so('select * from public.gia_dip'), 1::bigint, 'KT-DB.3.4 PQ5.SALE Hùng đọc giá dịp 24/10 – 25/10 của 3402');
select t.ok(coalesce(t.so($$select * from public.gia_thang where can_id = t.can('1103')$$), 0) = 0,
            'KT-DB.3.4 PQ5.SALE Hùng không đọc giá 1103 (chưa kết nối Anh Tuấn)');
select t.thoat();

select t.dang_nhap(t.id('lan'));
select t.bang(t.so('select * from public.gia_thang'), 3::bigint, 'KT-DB.3.4 PQ5.SALE Lan đọc giá 3 tháng của 1509');
select t.ok(coalesce(t.so('select * from public.gia_dip'), 0) = 0, 'KT-DB.3.4 PQ5.SALE Lan không đọc giá dịp 3402 (ngoài phạm vi)');
select t.thoat();

select t.dang_nhap(t.id('nga'));
select t.ok(coalesce(t.so('select * from public.gia_thang'), 0) = 0, 'KT-DB.3.4 PQ5.SALE Nga chưa kết nối không đọc giá nào');
select t.ok(coalesce(t.so('select * from public.gia_dip'), 0) = 0, 'KT-DB.3.4 PQ5.SALE Nga chưa kết nối không đọc giá dịp nào');
select t.thoat();

select t.dang_nhap(t.id('tuan'));
select t.bang(t.so('select * from public.gia_thang'), 3::bigint, 'KT-DB.3.4 PQ5.CHU Anh Tuấn chỉ đọc giá của 1103');
select t.thoat();

-- Tắt "Tình trạng cọc" không làm mất giá.
update public.ket_noi set xem_coc = false where id = t.kn('hoa', 'hung');
select t.dang_nhap(t.id('hung'));
select t.bang(t.so('select * from public.gia_thang'), 6::bigint, 'KT-DB.3.4 QD7 tắt xem_coc thì Hùng vẫn thấy giá chủ nhà');
select t.bang(t.so('select * from public.my_shared_can_ids()'), 2::bigint, 'KT-DB.3.4 QD7 tắt xem_coc không đổi căn được chia sẻ');
select t.thoat();

-- Bỏ 1509 khỏi phạm vi của Lan thì Lan thôi thấy giá.
delete from public.ket_noi_can where ket_noi_id = t.kn('hoa', 'lan');
select t.dang_nhap(t.id('lan'));
select t.ok(coalesce(t.so('select * from public.gia_thang'), 0) = 0, 'KT-DB.3.4 PQ5.SALE căn bỏ khỏi phạm vi thì Lan không thấy giá');
select t.thoat();

-- Ràng buộc giá.
select t.ok(t.ma_loi($$insert into public.gia_thang (can_id, thang, gia_thuong, gia_cuoi_tuan) values (t.can('1509'), '2027-01-01', 0, 1300000)$$) = '23514',
            'KT-DB.3.4 giá tháng phải lớn hơn 0');
select t.ok(t.ma_loi($$insert into public.gia_thang (can_id, thang, gia_thuong, gia_cuoi_tuan) values (t.can('1509'), '2026-10-01', 1, 1)$$) = '23505',
            'KT-DB.3.4 mỗi căn một giá cho một tháng');
select t.ok(t.ma_loi($$insert into public.gia_dip (can_id, tu_ngay, den_ngay, ten, gia, la_ngay_le) values (t.can('3402'), '2026-11-01', '2026-11-02', 'Thử', 0, false)$$) = '23514',
            'KT-DB.3.4 giá dịp phải lớn hơn 0');
select t.ok(t.ma_loi($$insert into public.gia_dip (can_id, tu_ngay, den_ngay, ten, gia, la_ngay_le) values (t.can('3402'), '2026-11-01', '2026-11-20', 'Thử', 1000000, false)$$) like '23%',
            'KT-DB.3.4 dải giá dịp quá 10 ngày bị từ chối');
select t.bang(t.gt($$select contype::text from pg_constraint where conrelid = 'public.gia_dip'::regclass and conname = 'gia_dip_khong_chong'$$), 'x',
              'KT-DB.3.4 danh mục: gia_dip_khong_chong là ràng buộc exclude');
select t.ok(t.ma_loi($$insert into public.gia_dip (can_id, tu_ngay, den_ngay, ten, gia, la_ngay_le) values (t.can('3402'), '2026-10-23', '2026-10-26', 'Chồng', 1200000, false)$$) = '23P01',
            'KT-DB.3.4 hai dải giá dịp của một căn chồng ngày 24/10 bị từ chối');
select t.ok(t.ma_loi($$insert into public.gia_dip (can_id, tu_ngay, den_ngay, ten, gia, la_ngay_le) values (t.can('1509'), '2026-10-24', '2026-10-25', 'Khác căn', 1200000, false)$$) is null,
            'KT-DB.3.4 dải giá dịp cùng ngày ở căn khác lưu được');
