-- US67 · Tòa nhà ở trang quản trị (YC13.3, PQ21, QT6.3). YC13.3-NT1 đến NT5.
-- Viết trước migration (US67-TA1, CL14.5): task sau không sửa file này.
select t.fixture();
update auth.users set email = 'quantri@example.invalid' where id = t.id('quantri');

-- NT1: quản trị viên đặt sẵn thêm À La Carte (fixture có ICON40, Sapphire) thì chủ nhà mới thấy đủ ba tòa.
select t.dang_nhap(t.id('quantri'));
select t.ok(public.fn_quan_tri_luu_toa(null, 'À La Carte', 'Bãi Cháy') is not null, 'YC13.3-NT2 quản trị viên thêm tòa À La Carte');
select t.loi($$select public.fn_quan_tri_luu_toa(null, ' icon40 ', null)$$, 'Đã có tòa tên này, hãy gộp', 'YC13.3 thêm tòa trùng tên bị từ chối (YC13-H7)');
select t.loi($$select public.fn_quan_tri_luu_toa(null, '   ', null)$$, 'Nhập tên tòa', 'YC13.3 tên trống bị từ chối');
select t.thoat();
select t.bang((select home247_dat_san from public.toa_nha where ten = 'À La Carte'), true, 'YC13.3-NT2 tòa quản trị viên thêm có cờ Home247 đặt sẵn');
select t.dang_nhap(t.id('tuan'));
select t.bang((select array_agg(ten order by id) from public.toa_nha where home247_dat_san and ten in ('À La Carte', 'ICON40', 'Sapphire')) is not null
              and (select count(*) from public.toa_nha where home247_dat_san and ten in ('À La Carte', 'ICON40', 'Sapphire')) = 3, true,
              'YC13.3-NT1 chủ nhà thấy ba tòa đặt sẵn ở CN5-A1b');
select t.bang((select khu_vuc from public.toa_nha where ten = 'À La Carte'), 'Bãi Cháy', 'YC13.3-NT2 chủ nhà thấy tòa vừa thêm với khu vực');
-- NT3: chủ nhà thêm tòa mới (YC3.4) thì quản trị viên thấy "người dùng thêm".
select public.fn_them_toa('Icon 40');
select t.thoat();
select t.dang_nhap(t.id('quantri'));
select t.bang((select home247_dat_san from public.toa_nha where ten = 'Icon 40'), false, 'YC13.3-NT3 quản trị viên thấy tòa chủ nhà thêm là người dùng thêm');
-- YC13-H7: quản trị viên sửa tên, khu vực tòa người dùng thêm, cờ giữ nguyên.
select public.fn_quan_tri_luu_toa((select id from public.toa_nha where ten = 'Icon 40'), 'Icon 40 (cũ)', 'Hùng Thắng');
select t.bang((select khu_vuc || ' ' || home247_dat_san from public.toa_nha where ten = 'Icon 40 (cũ)'), 'Hùng Thắng false',
              'YC13.3 sửa tòa người dùng thêm giữ cờ (YC13-H7)');
select t.loi($$select public.fn_quan_tri_luu_toa((select id from public.toa_nha where ten = 'Icon 40 (cũ)'), 'sapphire', null)$$,
             'Đã có tòa tên này, hãy gộp', 'YC13.3 sửa sang tên tòa khác bị từ chối');
select t.thoat();

-- NT4: người không phải quản trị viên ghi tòa ở lệnh của trang quản trị bị từ chối.
select t.dang_nhap(t.id('hoa'));
select t.loi($$select public.fn_quan_tri_luu_toa(null, 'Tòa lạ', null)$$, '42501', 'YC13.3-NT4 chủ nhà thêm tòa ở lệnh quản trị bị từ chối');
select t.loi($$select public.fn_quan_tri_luu_toa(t.toa('icon40'), 'ICON 40X', null)$$, '42501', 'YC13.3-NT4 chủ nhà sửa tòa ở lệnh quản trị bị từ chối');
select t.loi($$select public.fn_quan_tri_gop_toa(t.toa('sapphire'), t.toa('icon40'))$$, '42501', 'YC13.3-NT4 chủ nhà gộp tòa bị từ chối');
select t.loi($$update public.toa_nha set ten = 'x'$$, '42501', 'YC13.3-NT4 chủ nhà sửa thẳng bảng tòa bị từ chối');
select t.thoat();
select t.dang_nhap(t.id('lan'));
select t.loi($$select public.fn_quan_tri_gop_toa(t.toa('sapphire'), t.toa('icon40'))$$, '42501', 'YC13.3-NT4 sale gộp tòa bị từ chối');
select t.thoat();
select t.bang((select count(*) from public.toa_nha where ten in ('ICON40', 'Sapphire'))::int, 2, 'YC13.3-NT4 tòa không đổi sau lệnh bị từ chối');

-- NT5: gộp "Icon 40 (cũ)" (có 1 căn) vào ICON40.
update public.can set toa_nha_id = (select id from public.toa_nha where ten = 'Icon 40 (cũ)') where id = t.can('1103');
select t.dang_nhap(t.id('quantri'));
select t.loi($$select public.fn_quan_tri_gop_toa(t.toa('icon40'), t.toa('icon40'))$$, 'Chọn tòa khác để gộp', 'YC13.3 gộp tòa vào chính nó bị từ chối');
select public.fn_quan_tri_gop_toa(t.toa('icon40'), (select id from public.toa_nha where ten = 'Icon 40 (cũ)'));
select t.thoat();
select t.bang((select toa_nha_id from public.can where id = t.can('1103')), t.toa('icon40'), 'YC13.3-NT5 căn của tòa gộp vào thuộc ICON40');
select t.bang((select count(*) from public.toa_nha where ten = 'Icon 40 (cũ)')::int, 0, 'YC13.3-NT5 tòa gộp vào không còn trong danh sách');
select t.bang((select ten || ' ' || home247_dat_san from public.toa_nha where id = t.toa('icon40')), 'ICON40 true', 'YC13.3-NT5 tòa giữ lại giữ tên và cờ');
