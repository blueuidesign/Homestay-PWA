-- US66 · Dải ngày lễ ở trang quản trị (YC13.2, PQ21). YC13.2-NT1 đến NT4 và YC13.1-NT2 (người đồng quản trị sửa được dải).
-- Viết trước migration (US66-TA1, CL14.5): task sau không sửa file này.
select t.fixture();
update auth.users set email = 'quantri@example.invalid' where id = t.id('quantri');
update auth.users set email = 'hung@example.invalid' where id = t.id('hung');
delete from public.ngay_le;
-- Giá dịp chủ nhà đã lưu từ dải Tết 2027 (để kiểm NT3: xóa dải không đụng giá dịp).
insert into public.gia_dip (can_id, tu_ngay, den_ngay, ten, gia, la_ngay_le)
values (t.can('1509'), '2027-02-05', '2027-02-09', 'Tết Nguyên đán', 3000000, true);

select t.dang_nhap(t.id('quantri'));
select public.fn_quan_tri_luu_ngay_le(null, 2027, 'Tết Nguyên đán', '2027-02-05', '2027-02-10');
select public.fn_quan_tri_luu_ngay_le(null, 2027, 'Giỗ Tổ Hùng Vương', '2027-04-16', '2027-04-18');
select public.fn_quan_tri_luu_ngay_le(null, 2026, 'Quốc khánh', '2026-08-29', '2026-09-02');
select t.bang(t.so($$select * from public.ngay_le where nam = 2027$$), 2::bigint, 'YC13.2-NT1 quản trị viên chọn năm 2027 thấy đúng 2 dải');
select t.bang((select string_agg(ten || ' ' || tu_ngay || ' ' || den_ngay, '; ' order by tu_ngay) from public.ngay_le where nam = 2027),
              'Tết Nguyên đán 2027-02-05 2027-02-10; Giỗ Tổ Hùng Vương 2027-04-16 2027-04-18', 'YC13.2-NT1 dải có tên, ngày đầu, ngày cuối');

-- Luật kiểm (YC13.2): tên, năm, ngày cuối, tối đa 10 ngày, không chồng ngày cùng năm.
select t.loi($$select public.fn_quan_tri_luu_ngay_le(null, 2027, '  ', '2027-05-01', '2027-05-02')$$, 'Nhập tên dịp', 'YC13.2 tên trống bị từ chối');
select t.loi($$select public.fn_quan_tri_luu_ngay_le(null, 2027, 'Lễ', '2026-05-01', '2026-05-02')$$, 'Ngày phải thuộc năm đã chọn', 'YC13.2 ngày ngoài năm bị từ chối');
select t.loi($$select public.fn_quan_tri_luu_ngay_le(null, 2027, 'Lễ', '2027-05-03', '2027-05-01')$$, 'Ngày cuối phải từ ngày đầu trở đi', 'YC13.2 ngày cuối trước ngày đầu bị từ chối');
select t.loi($$select public.fn_quan_tri_luu_ngay_le(null, 2027, 'Lễ', '2027-05-01', '2027-05-11')$$, 'Một dải tối đa 10 ngày', 'YC13.2 dải 11 ngày bị từ chối (YC13-H4)');
select t.loi($$select public.fn_quan_tri_luu_ngay_le(null, 2027, 'Lễ khác', '2027-02-09', '2027-02-12')$$, 'Dải này trùng ngày với Tết Nguyên đán', 'YC13.2 dải chồng ngày cùng năm bị từ chối (YC13-H2)');
select t.thoat();

-- NT2: quản trị viên sửa một dải năm 2027 thì chủ nhà mở "Giá ngày lễ" năm 2027 thấy dải mới.
select t.dang_nhap(t.id('quantri'));
select public.fn_quan_tri_luu_ngay_le((select id from public.ngay_le where ten = 'Tết Nguyên đán'), 2027, 'Tết Nguyên đán', '2027-02-05', '2027-02-11');
select t.thoat();
select t.dang_nhap(t.id('hoa'));
select t.bang((select den_ngay from public.ngay_le where nam = 2027 and ten = 'Tết Nguyên đán'), '2027-02-11'::date, 'YC13.2-NT2 chủ nhà thấy dải vừa sửa');
select t.bang(t.so($$select * from public.ngay_le where nam = 2027$$), 2::bigint, 'YC13.2-NT2 chủ nhà thấy mọi dải năm 2027');
-- NT4: chủ nhà ghi dải bị từ chối, cả ghi thẳng lẫn qua hàm.
select t.loi($$select public.fn_quan_tri_luu_ngay_le(null, 2027, 'Lễ', '2027-06-01', '2027-06-02')$$, '42501', 'YC13.2-NT4 chủ nhà thêm dải bị từ chối');
select t.loi($$select public.fn_quan_tri_xoa_ngay_le((select id from public.ngay_le limit 1))$$, '42501', 'YC13.2-NT4 chủ nhà xóa dải bị từ chối');
select t.loi($$insert into public.ngay_le (nam, ten, tu_ngay, den_ngay) values (2027, 'x', '2027-07-01', '2027-07-01')$$, '42501', 'YC13.2-NT4 chủ nhà ghi thẳng bảng bị từ chối');
select t.thoat();
select t.dang_nhap(t.id('lan'));
select t.loi($$select public.fn_quan_tri_luu_ngay_le(null, 2027, 'Lễ', '2027-06-01', '2027-06-02')$$, '42501', 'YC13.2-NT4 sale thêm dải bị từ chối');
select t.loi($$update public.ngay_le set ten = 'x'$$, '42501', 'YC13.2-NT4 sale sửa thẳng bảng bị từ chối');
select t.thoat();
select t.bang(t.so($$select * from public.ngay_le where nam = 2027$$), 2::bigint, 'YC13.2-NT4 dải không đổi sau lệnh bị từ chối');

-- YC13.1-NT2: người đồng quản trị vừa được thêm sửa được dải ngày lễ.
select t.dang_nhap(t.id('quantri'));
select public.fn_quan_tri_them('hung@example.invalid');
select t.thoat();
select t.dang_nhap(t.id('hung'));
select t.ok(public.fn_quan_tri_luu_ngay_le(null, 2027, 'Quốc tế Lao động', '2027-04-30', '2027-05-02') is not null,
            'YC13.1-NT2 người đồng quản trị vừa thêm sửa được dải ngày lễ');
select t.thoat();

-- NT3: xóa dải thì dịp đó không còn ở "Chọn nhanh ngày lễ"; giá dịp chủ nhà đã lưu không đổi.
select t.dang_nhap(t.id('quantri'));
select public.fn_quan_tri_xoa_ngay_le((select id from public.ngay_le where ten = 'Tết Nguyên đán'));
select t.thoat();
select t.dang_nhap(t.id('hoa'));
select t.bang(t.so($$select * from public.ngay_le where nam = 2027 and ten = 'Tết Nguyên đán'$$), 0::bigint, 'YC13.2-NT3 dải đã xóa không còn trong năm');
select t.bang((select tu_ngay || ' ' || den_ngay || ' ' || gia from public.gia_dip where can_id = t.can('1509') and ten = 'Tết Nguyên đán'),
              '2027-02-05 2027-02-09 3000000', 'YC13.2-NT3 giá dịp chủ nhà đã lưu không đổi');
select t.thoat();
