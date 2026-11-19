-- US1 · Màn đầu và chọn vai (YC1.1). Lệnh chọn vai fn_chon_vai ghi vai và lúc đồng ý điều khoản của chính người gọi.
-- YC1.1-NT5, YC1.1-NT7, PQ1, QD5, quy tắc "Chưa đăng ký xong thì chưa vào app".
select t.fixture();

-- Người mới (email giả): Mới đã đăng ký xong, Chưa Xong chưa có số.
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-000000000030', 'vai1@vidu.test'),
  ('00000000-0000-0000-0000-000000000031', 'vai2@vidu.test'),
  ('00000000-0000-0000-0000-000000000032', 'vai3@vidu.test');
set constraints all immediate;
set constraints all deferred;

select t.dang_nhap('00000000-0000-0000-0000-000000000030');
select t.khong_loi($$select public.fn_dang_ky('Chị Vai', '0912300030')$$, 'YC1.1 chuẩn bị: người mới đăng ký xong');
select t.thoat();
select t.dang_nhap('00000000-0000-0000-0000-000000000032');
select t.khong_loi($$select public.fn_dang_ky('Anh Sale Mới', '0912300032')$$, 'YC1.1 chuẩn bị: người mới thứ hai đăng ký xong');
select t.thoat();
-- Lúc đồng ý điều khoản để trống, như hồ sơ chưa qua bước chọn vai lần nào.
update public.profiles set dong_y_dieu_khoan_luc = null
 where id in ('00000000-0000-0000-0000-000000000030', '00000000-0000-0000-0000-000000000032');

-- ===== YC1.1-NT7: vai khác "chủ nhà", "sale" thì database từ chối với câu "Vai không hợp lệ" =====
select t.dang_nhap('00000000-0000-0000-0000-000000000030');
select t.loi($$select public.fn_chon_vai('admin')$$, 'Vai không hợp lệ', 'YC1.1-NT7 vai "admin" bị từ chối với câu "Vai không hợp lệ"');
select t.loi($$select public.fn_chon_vai('Chủ nhà')$$, 'Vai không hợp lệ', 'YC1.1-NT7 vai viết chữ thường của màn bị từ chối');
select t.loi($$select public.fn_chon_vai('CHU_NHA')$$, 'Vai không hợp lệ', 'YC1.1-NT7 vai viết hoa bị từ chối');
select t.loi($$select public.fn_chon_vai('')$$, 'Vai không hợp lệ', 'YC1.1-NT7 vai rỗng bị từ chối');
select t.loi($$select public.fn_chon_vai(null)$$, 'Vai không hợp lệ', 'YC1.1-NT7 vai null bị từ chối');
select t.loi($$select public.fn_chon_vai(' sale ')$$, '22023', 'YC1.1-NT7 vai có khoảng trắng bị từ chối, mã 22023');
select t.thoat();
select t.bang((select count(*) from public.profiles where id = '00000000-0000-0000-0000-000000000030'
                 and vai_chon is null and dong_y_dieu_khoan_luc is null), 1::bigint,
              'YC1.1-NT7 sau các lệnh bị từ chối hồ sơ không có vai, chưa ghi lúc đồng ý điều khoản');

-- ===== YC1.1-NT5: chọn "Tôi là chủ nhà" thì hồ sơ có vai chủ nhà và lúc đồng ý điều khoản =====
select t.dang_nhap('00000000-0000-0000-0000-000000000030');
select t.khong_loi($$select public.fn_chon_vai('chu_nha')$$, 'YC1.1-NT5 lệnh chọn vai chủ nhà qua');
select t.bang(t.gt($$select vai_chon || '|' || (dong_y_dieu_khoan_luc is not null)::text from public.profiles
                     where id = '00000000-0000-0000-0000-000000000030'$$),
              'chu_nha|true', 'YC1.1-NT5 hồ sơ có vai chủ nhà và lúc đồng ý điều khoản');
select t.thoat();

-- Lúc đồng ý điều khoản giữ lần đầu, không ghi đè khi gọi lại.
update public.profiles set dong_y_dieu_khoan_luc = '2026-11-01 08:00+07'
 where id = '00000000-0000-0000-0000-000000000030';
select t.dang_nhap('00000000-0000-0000-0000-000000000030');
select t.khong_loi($$select public.fn_chon_vai('chu_nha')$$, 'YC1.1-NT5 gọi lại lệnh chọn vai vẫn qua');
select t.thoat();
select t.bang((select dong_y_dieu_khoan_luc from public.profiles where id = '00000000-0000-0000-0000-000000000030'),
              '2026-11-01 08:00+07'::timestamptz, 'YC1.1-NT5 lúc đồng ý điều khoản giữ lần đầu, không ghi đè');

-- Vai sale cũng qua (YC1.1 bước 5).
select t.dang_nhap('00000000-0000-0000-0000-000000000032');
select t.khong_loi($$select public.fn_chon_vai('sale')$$, 'YC1.1-NT5 lệnh chọn vai sale qua');
select t.bang(t.gt($$select vai_chon || '|' || (dong_y_dieu_khoan_luc is not null)::text from public.profiles
                     where id = '00000000-0000-0000-0000-000000000032'$$),
              'sale|true', 'YC1.1-NT5 hồ sơ có vai sale và lúc đồng ý điều khoản');
select t.thoat();

-- ===== YC1 Quy tắc "Chưa đăng ký xong thì chưa vào app": hồ sơ chưa có tên hoặc số thì không chọn vai =====
select t.dang_nhap('00000000-0000-0000-0000-000000000031');
select t.loi($$select public.fn_chon_vai('chu_nha')$$, 'P0001', 'YC1.1 hồ sơ chưa có tên, số thì lệnh chọn vai bị từ chối');
select t.thoat();
select t.bang((select count(*) from public.profiles where id = '00000000-0000-0000-0000-000000000031'
                 and vai_chon is null and dong_y_dieu_khoan_luc is null), 1::bigint,
              'YC1.1 hồ sơ chưa đăng ký xong không đổi');

-- QT6.5: người đã xóa tài khoản (không còn số) chưa nhập lại số thì chưa chọn vai được.
update public.profiles set so_dien_thoai = null, da_xoa_luc = now(), vai_chon = null where id = t.id('tuan');
select t.dang_nhap(t.id('tuan'));
select t.loi($$select public.fn_chon_vai('sale')$$, 'P0001', 'YC1.1 QT6.5 người đã xóa tài khoản chưa nhập lại số thì không chọn vai được');
select t.thoat();

-- ===== PQ1, YC1-tai-khoan "Ai được làm gì": không ai sửa được vai của người khác =====
select t.bang((select pronargs::int from pg_proc where proname = 'fn_chon_vai' and pronamespace = 'public'::regnamespace), 1,
              'YC1.1 PQ1.CHU lệnh chọn vai chỉ nhận vai, không nhận mã người: chỉ ghi hồ sơ của người gọi');
select t.dang_nhap('00000000-0000-0000-0000-000000000032');
select t.loi($$update public.profiles set vai_chon = 'sale' where id = t.id('hoa')$$, '42501',
             'YC1.1 PQ1.SALE không ghi thẳng vai vào hồ sơ của người khác');
select t.loi($$update public.profiles set vai_chon = 'chu_nha' where id = '00000000-0000-0000-0000-000000000032'$$, '42501',
             'YC1.1 PQ1.SALE không ghi thẳng vai vào bảng hồ sơ, kể cả của mình');
select t.thoat();
select t.bang((select vai_chon from public.profiles where id = t.id('hoa')), 'chu_nha',
              'YC1.1 PQ1.CHU vai của Chị Hoa không đổi');
select t.bang((select vai_chon from public.profiles where id = '00000000-0000-0000-0000-000000000032'), 'sale',
              'YC1.1 PQ1.SALE vai của người gọi không đổi khi ghi thẳng bị từ chối');

-- ===== Người chưa đăng nhập không gọi được lệnh chọn vai (KT-DB.3.1) =====
select t.khach();
select t.loi($$select public.fn_chon_vai('chu_nha')$$, '%', 'YC1.1 KT-DB.3.1 người chưa đăng nhập không gọi được lệnh chọn vai');
select t.thoat();
