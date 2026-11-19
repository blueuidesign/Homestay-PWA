-- EN3 · Tạo hồ sơ ở lần đầu đăng nhập (YC1 mục Dữ liệu, YC1.2 bước 2; PQ1, PQ2; PQ Luật chung 4).
-- fn_tao_ho_so(): người đã đăng nhập gọi sau khi có phiên; chưa có hồ sơ thì tạo, có rồi thì giữ nguyên.
select t.fixture();

-- Người mới: có trong auth.users (Supabase Auth đã tạo), chưa có hồ sơ.
insert into auth.users (id) values ('00000000-0000-0000-0000-0000000000e3');

select t.dang_nhap('00000000-0000-0000-0000-0000000000e3');
select t.ok(t.ma_loi('select public.fn_tao_ho_so()') is null, 'EN3 YC1.2 bước 2: lần đầu đăng nhập gọi fn_tao_ho_so được');
select t.bang(t.so('select * from public.profiles'), 1::bigint, 'EN3 YC1.2 bước 2: sau lần đầu, người mới đọc được đúng một hồ sơ của mình');
select t.ok(t.ma_loi('select public.fn_tao_ho_so()') is null, 'EN3 gọi fn_tao_ho_so lần hai không lỗi');
select t.thoat();
select t.bang((select count(*) from public.profiles where id = '00000000-0000-0000-0000-0000000000e3'), 1::bigint,
              'EN3 gọi lần hai không tạo hồ sơ thứ hai');
select t.bang((select so_dien_thoai from public.profiles where id = '00000000-0000-0000-0000-0000000000e3'), null::text,
              'EN3 PQ2, YC6.1: hồ sơ mới chưa có số điện thoại');
select t.bang((select vai_chon from public.profiles where id = '00000000-0000-0000-0000-0000000000e3'), null::text,
              'EN3 YC1.2 bước 2: hồ sơ mới chưa chọn vai (để app mở A3)');

-- Người đã có hồ sơ: gọi lại không đổi gì.
select t.dang_nhap(t.id('hoa'));
select t.ok(t.ma_loi('select public.fn_tao_ho_so()') is null, 'EN3 người đã có hồ sơ gọi fn_tao_ho_so không lỗi');
select t.thoat();
select t.bang((select ten || '|' || so_dien_thoai || '|' || vai_chon from public.profiles where id = t.id('hoa')),
              'Chị Hoa|0900000001|chu_nha'::text, 'EN3 PQ1: gọi lại không ghi đè hồ sơ đã có');

-- Hàm trả về hồ sơ của chính người gọi, không của ai khác.
select t.dang_nhap(t.id('hung'));
select t.bang((select (public.fn_tao_ho_so()).id), t.id('hung'), 'EN3 PQ1.SALE: fn_tao_ho_so trả về hồ sơ của chính người gọi');
select t.thoat();

-- Chưa đăng nhập: không gọi được, không tạo được hồ sơ.
select t.khach();
select t.loi('select public.fn_tao_ho_so()', '42501', 'EN3 PQ Luật chung 4: anon không gọi được fn_tao_ho_so');
select t.loi($$insert into public.profiles (id) values ('00000000-0000-0000-0000-0000000000e4')$$, '42501',
             'EN3 PQ Luật chung 4: anon không ghi thẳng vào profiles');
select t.thoat();

-- Đã đăng nhập vẫn không ghi thẳng vào profiles (ghi chỉ qua hàm fn_*).
select t.dang_nhap(t.id('hung'));
select t.loi($$insert into public.profiles (id) values ('00000000-0000-0000-0000-0000000000e4')$$, '42501',
             'EN3 PQ1: người đã đăng nhập không ghi thẳng vào profiles');
select t.thoat();

-- Có phiên nhưng không có auth.uid() (JWT thiếu sub): bị từ chối bằng câu cho người dùng.
select set_config('request.jwt.claims', '{"role":"authenticated"}', true);
set local role authenticated;
select t.bang(t.ma_loi('select public.fn_tao_ho_so()'), '28000'::text, 'EN3 PQ Luật chung 4: không có người gọi thì từ chối');
select t.thoat();
