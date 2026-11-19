-- KT-DB.3.8 · Booking có sale đứng tên không bên nào tự xóa. Một bên xin hủy, bên kia đồng ý; người xin không tự
-- đồng ý; bị từ chối thì không xin lại (QD12, PQ7). Trigger chặn cả khi chủ database ghi thẳng (mã lỗi P0001).
select t.fixture();

-- B1: 1509, Hùng đứng tên. B3: 1509, Hùng đứng tên. B2: 3402, Lan đứng tên. B5: khách lẻ.
select t.tao_booking('B1', t.can('1509'), '2026-10-10', '2026-10-12', 2200000, t.id('hung'), 'tu_yeu_cau');
select t.tao_booking('B3', t.can('1509'), '2026-10-04', '2026-10-06', 1800000, t.id('hung'), 'tu_yeu_cau');
select t.tao_booking('B2', t.can('3402'), '2026-10-17', '2026-10-19', 1900000, t.id('lan'));
select t.tao_booking('B5', t.can('1509'), '2026-10-13', '2026-10-15', 1800000);

-- App không xóa, không sửa thẳng.
select t.dang_nhap(t.id('hoa'));
select t.loi($$delete from public.booking where id = t.b('B1')$$, '42501', 'KT-DB.3.8 PQ7.CHU app xóa thẳng booking bị từ chối');
select t.loi($$update public.booking set trang_thai = 'da_huy' where id = t.b('B1')$$, '42501', 'KT-DB.3.8 PQ7.CHU app sửa thẳng booking bị từ chối');
select t.thoat();

-- Xóa: không ai xóa được, kể cả chủ database.
select t.loi($$delete from public.booking where id = t.b('B1')$$, 'P0001', 'KT-DB.3.8 QD12 xóa booking có sale đứng tên bị trigger chặn');
select t.loi($$delete from public.booking where sale_id is not null$$, 'P0001', 'KT-DB.3.8 QD12 xóa hàng loạt booking có sale bị chặn');

-- Hủy khi chưa ai xin.
select t.loi($$update public.booking set trang_thai = 'da_huy' where id = t.b('B1')$$, 'P0001',
             'KT-DB.3.8 QD12 sang da_huy khi chưa có người xin hủy bị chặn');

-- Người ngoài không xin, không trả lời.
select t.loi($$update public.booking set huy_xin_boi = t.id('nga'), huy_xin_luc = now() where id = t.b('B1')$$, 'P0001',
             'KT-DB.3.8 QD12 người ngoài (Nga) xin hủy bị chặn');
select t.loi($$update public.booking set huy_xin_boi = t.id('lan'), huy_xin_luc = now() where id = t.b('B1')$$, 'P0001',
             'KT-DB.3.8 QD12 sale khác (Lan) xin hủy booking của Hùng bị chặn');

-- Chị Hoa xin hủy B1.
select t.khong_loi($$update public.booking set huy_xin_boi = t.id('hoa'), huy_xin_luc = now() where id = t.b('B1')$$,
             'KT-DB.3.8 QD12 chủ căn xin hủy B1 được');
select t.loi($$update public.booking set trang_thai = 'da_huy' where id = t.b('B1')$$, 'P0001',
             'KT-DB.3.8 QD12 sang da_huy khi bên kia chưa trả lời bị chặn');
select t.loi($$update public.booking set huy_tra_loi = 'dong_y', huy_tra_loi_boi = t.id('hoa'), huy_tra_loi_luc = now(),
               trang_thai = 'da_huy' where id = t.b('B1')$$, 'P0001',
             'KT-DB.3.8 QD12 người xin (Chị Hoa) tự đồng ý rồi hủy bị chặn');
select t.loi($$update public.booking set huy_tra_loi = 'dong_y', huy_tra_loi_boi = t.id('nga'), huy_tra_loi_luc = now(),
               trang_thai = 'da_huy' where id = t.b('B1')$$, 'P0001',
             'KT-DB.3.8 QD12 người ngoài (Nga) đồng ý hủy bị chặn');
select t.loi($$update public.booking set huy_tra_loi = 'tu_choi', huy_tra_loi_boi = t.id('hung'), huy_tra_loi_luc = now(),
               trang_thai = 'da_huy' where id = t.b('B1')$$, 'P0001',
             'KT-DB.3.8 QD12 bên kia từ chối mà vẫn sang da_huy bị chặn');
select t.khong_loi($$update public.booking set huy_tra_loi = 'dong_y', huy_tra_loi_boi = t.id('hung'), huy_tra_loi_luc = now(),
               trang_thai = 'da_huy' where id = t.b('B1')$$,
             'KT-DB.3.8 QD12 Chị Hoa xin, Hùng đồng ý: B1 sang da_huy');
select t.bang(t.gt($$select trang_thai from public.booking where id = t.b('B1')$$), 'da_huy', 'KT-DB.3.8 QD12 B1 đã hủy, dòng vẫn còn');
select t.loi($$delete from public.booking where id = t.b('B1')$$, 'P0001', 'KT-DB.3.8 QD12 booking có sale đã hủy cũng không xóa được');

-- Chiều ngược lại: Hùng xin, Chị Hoa đồng ý.
select t.khong_loi($$update public.booking set huy_xin_boi = t.id('hung'), huy_xin_luc = now() where id = t.b('B3');
                     update public.booking set huy_tra_loi = 'dong_y', huy_tra_loi_boi = t.id('hoa'), huy_tra_loi_luc = now(),
                       trang_thai = 'da_huy' where id = t.b('B3')$$,
             'KT-DB.3.8 QD12 Hùng xin, Chị Hoa đồng ý: B3 sang da_huy');

-- Bị từ chối thì không xin lại.
select t.khong_loi($$update public.booking set huy_xin_boi = t.id('lan'), huy_xin_luc = now() where id = t.b('B2');
                     update public.booking set huy_tra_loi = 'tu_choi', huy_tra_loi_boi = t.id('hoa'), huy_tra_loi_luc = now()
                       where id = t.b('B2')$$,
             'KT-DB.3.8 QD12 Lan xin hủy B2, Chị Hoa từ chối: lưu được');
select t.bang(t.gt($$select trang_thai from public.booking where id = t.b('B2')$$), 'hieu_luc', 'KT-DB.3.8 QD12 bị từ chối hủy: B2 giữ hiệu lực');
select t.loi($$update public.booking set trang_thai = 'da_huy' where id = t.b('B2')$$, 'P0001',
             'KT-DB.3.8 QD12 booking bị từ chối hủy không sang da_huy được');
select t.loi($$update public.booking set huy_xin_boi = t.id('lan'), huy_xin_luc = now(), huy_tra_loi = null,
               huy_tra_loi_boi = null, huy_tra_loi_luc = null where id = t.b('B2')$$, 'P0001',
             'KT-DB.3.8 QD12 Lan xin lại sau khi bị từ chối bị chặn');
select t.loi($$update public.booking set huy_xin_boi = t.id('hoa'), huy_xin_luc = now() where id = t.b('B2')$$, 'P0001',
             'KT-DB.3.8 QD12 bên kia (Chị Hoa) xin hủy booking đã bị từ chối hủy bị chặn');

-- Booking khách lẻ (không có sale đứng tên) chủ hủy, xóa được (PQ7.CHU xóa booking mình tự ghi).
select t.khong_loi($$update public.booking set trang_thai = 'da_huy' where id = t.b('B5')$$,
             'KT-DB.3.8 PQ7.CHU booking khách lẻ hủy được không cần xin');
select t.khong_loi($$delete from public.booking_dem where booking_id = t.b('B5'); delete from public.booking where id = t.b('B5')$$,
             'KT-DB.3.8 PQ7.CHU booking khách lẻ xóa được');

-- Nhật ký: sửa, xóa booking ghi audit_log.
select t.khong_loi($q$do $b$ declare n0 bigint; n1 bigint; begin
    select count(*) into n0 from public.audit_log where bang = 'booking' and ban_ghi_id::text = t.b('B2')::text;
    update public.booking set tien_coc = 500000 where id = t.b('B2');
    select count(*) into n1 from public.audit_log where bang = 'booking' and ban_ghi_id::text = t.b('B2')::text;
    if n1 <> n0 + 1 then raise exception 'audit_log có % dòng mới, mong 1', n1 - n0; end if;
  end $b$$q$, 'KT-DB.3.8 sửa booking ghi một dòng audit_log');
select t.tao_booking('B6', t.can('3402'), '2026-10-14', '2026-10-15', 800000);
select t.khong_loi($q$do $b$ declare n0 bigint; n1 bigint; begin
    select count(*) into n0 from public.audit_log where bang = 'booking' and ban_ghi_id::text = t.b('B6')::text;
    delete from public.booking_dem where booking_id = t.b('B6');
    delete from public.booking where id = t.b('B6');
    select count(*) into n1 from public.audit_log where bang = 'booking' and ban_ghi_id::text = t.b('B6')::text;
    if n1 <> n0 + 1 then raise exception 'audit_log có % dòng mới, mong 1', n1 - n0; end if;
  end $b$$q$, 'KT-DB.3.8 xóa booking ghi một dòng audit_log');
