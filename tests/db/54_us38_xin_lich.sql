-- US38 · Sale xin chủ nhà cho xem lịch (YC6.4). Viết trước migration (US38-TA1, CL14.5): task sau không sửa file này.
-- Hợp đồng database cho màn A5, A6, A7, A7-00, A7-01:
--   fn_lay_link_xin_lich()   ghi, sale: trả mã link xin lịch của người gọi, chưa có thì tạo (mỗi sale một link).
--                            Không tăng số lần gửi. Mã chỉ có chữ cái (không chữ số), 32 ký tự. Trả text.
--   fn_gui_link_xin_lich()   ghi, sale: một lần mở bảng chia sẻ hay sao chép: tăng số lần gửi, ghi lần gửi cuối.
--                            Chưa có link thì tạo. Trả (ma, so_lan_gui, gui_cuoi_luc).
--   xin_lich_cua_toi()    đọc qua RLS (security invoker), chỉ của người gọi, luôn một dòng:
--                            (ma | null, so_lan_gui, gui_cuoi_luc, so_chu_dong_y, co_nguon).
--                            so_chu_dong_y: số kết nối của người gọi có nguồn 'sale_xin' đang 'da_ket_noi'.
--                            co_nguon: có kết nối đã kết nối hay căn tự nhập chưa xóa (A5, A7 chỉ hiện khi chưa có).
--   Vai chủ nhà, người chưa đăng nhập: không gọi được hai hàm ghi (42501, hay không có quyền thực thi).
select t.fixture();

create or replace function pg_temp.luu(ten text, gt text) returns void language sql as $$
  select set_config('t.xin_' || ten, gt, true)
$$;
create or replace function pg_temp.lay(ten text) returns text language sql as $$
  select current_setting('t.xin_' || ten, true)
$$;

-- ===== Danh mục =====
select t.ok((select count(distinct proname) from pg_proc
             where proname in ('fn_lay_link_xin_lich', 'fn_gui_link_xin_lich')
               and pronamespace = 'public'::regnamespace and prosecdef) = 2,
            'YC6.4 danh mục: hai hàm ghi link xin lịch có và chạy security definer');
select t.ok(exists (select 1 from pg_proc where proname = 'xin_lich_cua_toi'
                    and pronamespace = 'public'::regnamespace and not prosecdef),
            'YC6.4 danh mục: xin_lich_cua_toi đọc qua RLS (security invoker)');
select t.ok(not exists (select 1 from pg_proc p
                        where p.proname in ('fn_lay_link_xin_lich', 'fn_gui_link_xin_lich', 'xin_lich_cua_toi')
                          and p.pronamespace = 'public'::regnamespace and has_function_privilege('anon', p.oid, 'execute')),
            'YC6.4 YC6.5-NT5 PQ18.LINK người chưa đăng nhập không gọi được hàm link xin lịch');
select t.ok(not has_table_privilege('authenticated', 'public.link_xin_lich', 'INSERT')
            and not has_table_privilege('authenticated', 'public.link_xin_lich', 'UPDATE'),
            'YC6.4 PQ18.SALE app không ghi thẳng link_xin_lich, chỉ qua hàm');

-- ===== YC6.4 bước 1, 4: Sale Nga mới, chưa gửi lần nào =====
select t.dang_nhap(t.id('nga'));
select t.bang(t.gt($$(select coalesce(ma, '-') || '|' || so_lan_gui || '|' || so_chu_dong_y || '|' || co_nguon
                     from public.xin_lich_cua_toi())$$), '-|0|0|false',
              'YC6.4 bước 4 Sale Nga chưa có link: chưa có mã, 0 lần, 0 chủ nhà, chưa có nguồn (A5)');
select pg_temp.luu('nga1', t.gt($$public.fn_lay_link_xin_lich()$$));
select pg_temp.luu('nga2', t.gt($$public.fn_lay_link_xin_lich()$$));
select t.bang(t.gt($$(select ma || '|' || so_lan_gui from public.xin_lich_cua_toi())$$), pg_temp.lay('nga1') || '|0',
              'YC6.4 bước 1 mở A6 tạo link, chưa tính là đã gửi (A7-00: 0 lần)');
select t.thoat();
select t.ok(pg_temp.lay('nga1') is not null and pg_temp.lay('nga1') = pg_temp.lay('nga2'),
            'YC6.4 bước 1 mở A6 hai lần dùng cùng một link');
select t.bang((select count(*) from public.link_xin_lich where sale_id = t.id('nga')), 1::bigint,
              'YC6.4 quy tắc "Một link xin lịch nhiều chủ nhà": Sale Nga chỉ có một link');

-- ===== YC6.4-NT2: Sale Hùng bấm "Chia sẻ" ở A6 =====
select t.dang_nhap(t.id('hung'));
select pg_temp.luu('hung', t.gt($$public.fn_lay_link_xin_lich()$$));
select pg_temp.luu('gui1', t.gt($$(select ma || '|' || so_lan_gui || '|' || (gui_cuoi_luc is not null)
                                   from public.fn_gui_link_xin_lich())$$));
select t.bang(pg_temp.lay('gui1'), pg_temp.lay('hung') || '|1|true',
              'YC6.4-NT2 bấm "Chia sẻ" lần đầu: cùng link, số lần đã gửi là 1, có lần gửi cuối');
select pg_temp.luu('gui2', t.gt($$(select so_lan_gui::text from public.fn_gui_link_xin_lich())$$));
select pg_temp.luu('gui3', t.gt($$(select so_lan_gui::text from public.fn_gui_link_xin_lich())$$));
select t.bang(pg_temp.lay('gui2') || ',' || pg_temp.lay('gui3'), '2,3',
              'YC6.4-NT2 mỗi lần bấm "Chia sẻ" hay "Sao chép tin nhắn" số lần đã gửi tăng 1');
select t.bang(t.gt($$(select ma || '|' || so_lan_gui || '|' || (gui_cuoi_luc is not null) from public.xin_lich_cua_toi())$$),
              pg_temp.lay('hung') || '|3|true',
              'YC6.4-NT2 A7 đọc lại: 3 lần đã chia sẻ, có lần gửi gần nhất');
select t.thoat();
select t.bang((select so_lan_gui from public.link_xin_lich where sale_id = t.id('hung')), 3,
              'YC6.4-NT2 database ghi 3 lần gửi cho link của Sale Hùng');

-- ===== YC6.4-NT4: chủ nhà đồng ý lời xin thì số "chủ nhà đã đồng ý" tăng 1 =====
-- Mô phỏng YC6.5 (US39): Anh Tuấn đồng ý lời xin của Sale Hùng.
select t.dang_nhap(t.id('hung'));
select pg_temp.luu('dy0', t.gt($$(select so_chu_dong_y::text from public.xin_lich_cua_toi())$$));
select t.thoat();
select t.bang(pg_temp.lay('dy0'), '0',
              'YC6.4-NT4 trước khi chủ nhà đồng ý: 0 chủ nhà (kết nối từ link mời của Chị Hoa không tính)');
insert into public.ket_noi (chu_id, sale_id, trang_thai, nguon) values (t.id('tuan'), t.id('hung'), 'da_ket_noi', 'sale_xin');
select t.dang_nhap(t.id('hung'));
select t.bang(t.gt($$(select so_chu_dong_y::text from public.xin_lich_cua_toi())$$), '1',
              'YC6.4-NT4 Anh Tuấn đồng ý lời xin: số "chủ nhà đã đồng ý" của Sale Hùng tăng 1');
select t.thoat();
-- Lời xin chưa đồng ý không tính.
insert into public.ket_noi (chu_id, sale_id, trang_thai, nguon) values (t.id('hoa'), t.id('nga'), 'chua_ket_noi', 'sale_xin');
select t.dang_nhap(t.id('nga'));
select t.bang(t.gt($$(select so_chu_dong_y || '|' || co_nguon from public.xin_lich_cua_toi())$$), '0|false',
              'YC6.4-NT4 kết nối chưa đồng ý không tính là chủ nhà đã đồng ý, chưa là nguồn');
select t.thoat();
update public.ket_noi set trang_thai = 'da_ket_noi' where chu_id = t.id('hoa') and sale_id = t.id('nga');
select t.dang_nhap(t.id('nga'));
select t.bang(t.gt($$(select so_chu_dong_y || '|' || co_nguon from public.xin_lich_cua_toi())$$), '1|true',
              'YC6.4-NT4 Chị Hoa đồng ý lời xin của Sale Nga: 1 chủ nhà, Sale Nga đã có nguồn');
select t.thoat();
-- YC6.4 bước 4: Sale Hùng có căn tự nhập và kết nối từ link mời, nên đã có nguồn.
select t.dang_nhap(t.id('hung'));
select t.bang(t.gt($$(select co_nguon::text from public.xin_lich_cua_toi())$$), 'true',
              'YC6.4 bước 4 sale đã có nguồn phòng thì không hiện A5, A7');
select t.thoat();

-- ===== YC6.4-NT5: Sale Lan đọc link hay số đếm của Sale Hùng =====
select t.dang_nhap(t.id('lan'));
select t.ok(coalesce(t.so($$select * from public.link_xin_lich where sale_id = t.id('hung')$$), 0) = 0,
            'YC6.4-NT5 PQ18.SALE Sale Lan không đọc được link, số đếm của Sale Hùng trong bảng');
select t.bang(t.gt($$(select coalesce(ma, '-') || '|' || so_lan_gui || '|' || so_chu_dong_y from public.xin_lich_cua_toi())$$),
              '-|0|0', 'YC6.4-NT5 xin_lich_cua_toi của Sale Lan không trả link, số đếm của Sale Hùng');
select pg_temp.luu('lan', t.gt($$public.fn_lay_link_xin_lich()$$));
select t.ok(pg_temp.lay('lan') is not null and pg_temp.lay('lan') <> pg_temp.lay('hung'),
            'YC6.4-NT5 Sale Lan lấy link thì được link của mình, không phải link của Sale Hùng');
select t.bang(t.gt($$(select so_lan_gui::text from public.fn_gui_link_xin_lich())$$), '1',
              'YC6.4-NT5 Sale Lan bấm "Chia sẻ" chỉ tăng số của mình');
select t.thoat();
select t.bang((select so_lan_gui from public.link_xin_lich where sale_id = t.id('hung')), 3,
              'YC6.4-NT5 số lần gửi của Sale Hùng không đổi khi Sale Lan gửi');
-- Chủ nhà A (Chị Hoa) không đọc link, số đếm của sale (YC6 "Ai được làm gì").
select t.dang_nhap(t.id('hoa'));
select t.ok(coalesce(t.so($$select * from public.link_xin_lich$$), 0) = 0,
            'YC6.4-NT5 PQ18.CHU Chị Hoa không đọc link, số đếm của sale nào');
select t.loi($$select public.fn_lay_link_xin_lich()$$, '42501', 'YC6.4 PQ18.SALE chủ nhà không tạo được link xin lịch');
select t.loi($$select public.fn_gui_link_xin_lich()$$, '42501', 'YC6.4 PQ18.SALE chủ nhà không ghi được lần gửi link xin lịch');
select t.thoat();
-- Mã link không chứa chữ số nào của số điện thoại sale.
select t.ok(pg_temp.lay('hung') !~ '[0-9]' and length(pg_temp.lay('hung')) >= 24,
            'YC6.4-NT5 link xin lịch của Sale Hùng không chứa chữ số nào (nên không chứa số điện thoại), đủ dài');
select t.ok(not exists (select 1 from public.link_xin_lich l join public.profiles p on p.id = l.sale_id
                        where l.ma ~ '[0-9]' or position(p.so_dien_thoai in l.ma) > 0
                           or position(right(p.so_dien_thoai, 4) in l.ma) > 0),
            'YC6.4-NT5 không link xin lịch nào chứa chữ số hay đoạn số điện thoại của sale');
select t.ok((select count(distinct ma) from public.link_xin_lich where sale_id in (t.id('hung'), t.id('lan'), t.id('nga'))) = 3,
            'YC6.4-NT5 mỗi sale một mã link khác nhau');

-- ===== Người chưa đăng nhập =====
select t.khach();
select t.ok(t.ma_loi($$select public.fn_lay_link_xin_lich()$$) is not null,
            'YC6.4 YC6.5-NT5 người chưa đăng nhập không lấy được link xin lịch');
select t.ok(coalesce(t.so($$select * from public.link_xin_lich$$), 0) = 0,
            'YC6.4 YC6.5-NT5 người chưa đăng nhập không đọc được link xin lịch');
select t.thoat();
