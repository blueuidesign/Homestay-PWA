-- US57 · YC10.4-NT10 (YC10 r5, YC10-H9): căn tự nhập chưa lưu giá cuối tuần thì đêm cuối tuần dùng giá ngày thường.
-- Thêm sau TA1 (file riêng, không sửa 73_us57_dat_phong_tu_ghi.sql). Villa Tuần Châu của Hùng; 08/10/2026 là T5, 09/10 là T6.
select t.fixture();

create or replace function pg_temp.ds(p_can uuid, p_nhan date, p_tra date, p_khoa text) returns text language sql as $$
  select t.gt(format('public.fn_gia_dien_san_tu_ghi(%L::uuid, %L::date, %L::date) -> %L', p_can, p_nhan, p_tra, p_khoa))
$$;

update public.can set gia_chu_thuong = 1400000, gia_chu_cuoi_tuan = null where id = t.can('villa');
select t.dang_nhap(t.id('hung'));
select t.bang(pg_temp.ds(t.can('villa'), '2026-10-08', '2026-10-10', 'tra_chu'), '2800000',
              'YC10.4-NT10 chỉ có giá ngày thường 1.400.000đ: 08/10 (T5) + 09/10 (T6, cuối tuần) điền sẵn 2.800.000đ');
select t.ok(pg_temp.ds(t.can('villa'), '2026-10-09', '2026-10-10', 'thu_khach') <> 'null',
            'YC10.4-NT10 đêm cuối tuần thiếu giá cuối tuần vẫn điền sẵn "Thu khách"');
select t.thoat();
