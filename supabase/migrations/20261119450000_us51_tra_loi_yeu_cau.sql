-- US51 · Chủ nhà trả lời yêu cầu (YC9.2). Khối yêu cầu chờ ở CN1-03 fn_yeu_cau_dang_cho, CN9 đọc qua fn_chu_xem_yeu_cau
-- (US50, thêm trường), chấp nhận fn_chap_nhan_yeu_cau (một giao dịch), từ chối fn_tu_choi_yeu_cau. Thông báo bị từ chối kèm
-- lý do; thông báo hết hạn một lần cho mỗi yêu cầu. Chỉ thêm, không sửa migration cũ. Chặn trùng cuối là booking_khong_trung (QD6).

-- YC9 "Trạng thái yêu cầu", YC9-H5: yêu cầu chờ quá 14 ngày hay có ngày nhận trước hôm nay coi như Hết hạn. Hàm nội bộ.
create or replace function public.yeu_cau_qua_han(p_y public.yeu_cau_dat_phong) returns boolean
language sql stable security definer set search_path = ''
as $$
  select p_y.trang_thai = 'cho' and (p_y.han_luc <= now() or p_y.ngay_nhan < public.local_today())
$$;

-- YC9 "Dữ liệu" cờ trùng: tên sale của các yêu cầu chờ khác (chưa quá hạn) cùng căn có đêm chồng. Hàm nội bộ.
create or replace function public.yeu_cau_trung_voi(p_id uuid) returns jsonb
language sql stable security definer set search_path = ''
as $$
  select coalesce(jsonb_agg(coalesce(s.ten_hien_thi, s.ten) order by k.gui_luc), '[]'::jsonb)
  from public.yeu_cau_dat_phong y
  join public.yeu_cau_dat_phong k on k.can_id = y.can_id and k.id <> y.id and k.dem && y.dem
  join public.profiles s on s.id = k.sale_id
  where y.id = p_id and k.trang_thai = 'cho' and not public.yeu_cau_qua_han(k)
$$;

-- YC9.2 bước 2, YC9.1-NT13, PQ2.CHU, PQ10.CHU, PQ11.CHU, KT-DB.3.6: một yêu cầu tới căn của chủ nhà, dạng CN9 đọc. Không có
-- giá bán, mức cộng. Số sale chỉ khi còn kết nối. Hàm nội bộ; người gọi đã kiểm ở lệnh fn_*.
create or replace function public.yeu_cau_cho_chu(p_id uuid) returns jsonb
language sql stable security definer set search_path = ''
as $$
  select jsonb_build_object(
    'id', y.id, 'can_id', y.can_id, 'ma_can', c.ma_can, 'ten_toa', t.ten,
    'sale_id', y.sale_id, 'ten_sale', coalesce(s.ten_hien_thi, s.ten),
    'sdt_sale', case when s.da_xoa_luc is null
                      and exists (select 1 from public.ket_noi k
                                  where k.chu_id = c.nguoi_giu and k.sale_id = y.sale_id and k.trang_thai = 'da_ket_noi')
                     then nullif(btrim(coalesce(s.so_dien_thoai, '')), '') end,
    'so_dat_phong', (select count(*) from public.booking b
                     join public.can cb on cb.id = b.can_id
                     where cb.nguoi_giu = c.nguoi_giu and b.sale_id = y.sale_id and b.trang_thai <> 'da_huy'),
    'con_ket_noi', public.can_chia_se_cho_sale(y.sale_id, y.can_id),
    'ngay_nhan', y.ngay_nhan, 'ngay_tra', y.ngay_tra, 'so_dem', y.ngay_tra - y.ngay_nhan,
    'gia_chu_dem', to_jsonb(y.gia_chu_dem), 'tong_gia_chu', (select sum(x)::bigint from unnest(y.gia_chu_dem) x),
    'loi_nhan', y.loi_nhan,
    'trang_thai', case when public.yeu_cau_qua_han(y) then 'het_han' else y.trang_thai end,
    'ly_do_tu_choi', y.ly_do_tu_choi, 'gui_luc', y.gui_luc, 'han_luc', y.han_luc, 'booking_id', y.booking_id,
    'trung_voi', case when y.trang_thai = 'cho' and not public.yeu_cau_qua_han(y)
                      then public.yeu_cau_trung_voi(y.id) else '[]'::jsonb end)
  from public.yeu_cau_dat_phong y
  join public.can c on c.id = y.can_id
  left join public.toa_nha t on t.id = c.toa_nha_id
  join public.profiles s on s.id = y.sale_id
  where y.id = p_id
$$;

revoke execute on function public.yeu_cau_qua_han(public.yeu_cau_dat_phong), public.yeu_cau_trung_voi(uuid),
  public.yeu_cau_cho_chu(uuid) from public, anon, authenticated;

-- YC9.1-NT13, YC9-H6, YC9.2 bước 2, PQ10.CHU, PQ11, KT-DB.3.6: chủ căn đọc một yêu cầu gửi tới căn mình (CN9).
-- Đã hủy: chỉ trạng thái. Thay bản US50 để thêm số sale, số đặt phòng, còn kết nối, cờ trùng, đặt phòng đã tạo.
create or replace function public.fn_chu_xem_yeu_cau(p_yeu_cau_id uuid) returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_nguoi uuid := public.can_dang_nhap();
  v_y public.yeu_cau_dat_phong%rowtype;
begin
  select * into v_y from public.yeu_cau_dat_phong y
  where y.id = p_yeu_cau_id and y.can_id in (select public.my_own_can_ids());
  if not found then
    raise exception 'Không tìm thấy yêu cầu' using errcode = '42501';
  end if;
  if v_y.trang_thai = 'da_huy' then
    return jsonb_build_object('id', v_y.id, 'trang_thai', 'da_huy');
  end if;
  return public.yeu_cau_cho_chu(v_y.id);
end $$;

-- YC9.2 bước 1, YC9.2-NT2, NT7, YC9 "Dữ liệu" cờ trùng, PQ10.CHU, PQ11.CHU: khối "YÊU CẦU ĐẶT PHÒNG" ở CN1-03. Các yêu cầu
-- chờ (chưa quá hạn) tới căn của người gọi, ngày nhận sớm trước. Không có giá bán.
create or replace function public.fn_yeu_cau_dang_cho() returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_nguoi uuid := public.can_dang_nhap();
begin
  return (
    select coalesce(jsonb_agg(jsonb_build_object(
             'id', y.id, 'can_id', y.can_id, 'ma_can', c.ma_can, 'ten_toa', t.ten,
             'ten_sale', coalesce(s.ten_hien_thi, s.ten),
             'ngay_nhan', y.ngay_nhan, 'ngay_tra', y.ngay_tra, 'so_dem', y.ngay_tra - y.ngay_nhan,
             'tong_gia_chu', (select sum(x)::bigint from unnest(y.gia_chu_dem) x),
             'gui_luc', y.gui_luc, 'trung_voi', public.yeu_cau_trung_voi(y.id))
           order by y.ngay_nhan, y.gui_luc), '[]'::jsonb)
    from public.yeu_cau_dat_phong y
    join public.can c on c.id = y.can_id
    left join public.toa_nha t on t.id = c.toa_nha_id
    join public.profiles s on s.id = y.sale_id
    where y.can_id in (select public.my_own_can_ids())
      and y.trang_thai = 'cho' and not public.yeu_cau_qua_han(y));
end $$;

-- YC9.2 bước 3, 5, YC9 "Trạng thái yêu cầu", "Dữ liệu", YC9-H4, YC9-H5, HV3, PQ10.CHU, QT5.6: phần chung của chấp nhận và
-- từ chối. Khóa căn trước (cùng khóa của lệnh ghi đặt phòng và gửi yêu cầu, để hai lệnh chấp nhận cùng căn xếp hàng nhau,
-- không khóa chéo với trigger từ chối yêu cầu trùng), rồi khóa dòng yêu cầu. Không tới căn của người gọi: 42501.
-- Trả dòng đã khóa; quá hạn thì ghi Hết hạn (trigger báo sale) trước khi trả. Hàm nội bộ.
create or replace function public.khoa_yeu_cau_cua_chu(p_yeu_cau_id uuid) returns public.yeu_cau_dat_phong
language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_can uuid;
  v_y public.yeu_cau_dat_phong%rowtype;
begin
  select y.can_id into v_can from public.yeu_cau_dat_phong y
  where y.id = p_yeu_cau_id and y.can_id in (select public.my_own_can_ids());
  if v_can is null then
    raise exception 'Không tìm thấy yêu cầu' using errcode = '42501';
  end if;
  perform 1 from public.can where id = v_can for no key update;
  select * into v_y from public.yeu_cau_dat_phong y where y.id = p_yeu_cau_id for update;
  if public.yeu_cau_qua_han(v_y) then
    update public.yeu_cau_dat_phong set trang_thai = 'het_han', tra_loi_luc = now() where id = p_yeu_cau_id
    returning * into v_y;
  end if;
  return v_y;
end $$;

-- Kết quả lệnh trả lời: như fn_chu_xem_yeu_cau, kèm doi_trang_thai (HV3: yêu cầu vừa đổi ở máy khác). Hàm nội bộ.
create or replace function public.ket_qua_tra_loi(p_id uuid, p_doi boolean) returns jsonb
language sql stable security definer set search_path = ''
as $$
  select case when y.trang_thai = 'da_huy' then jsonb_build_object('id', y.id, 'trang_thai', 'da_huy')
              else public.yeu_cau_cho_chu(y.id) end || jsonb_build_object('doi_trang_thai', p_doi)
  from public.yeu_cau_dat_phong y where y.id = p_id
$$;

revoke execute on function public.khoa_yeu_cau_cua_chu(uuid), public.ket_qua_tra_loi(uuid, boolean)
  from public, anon, authenticated;

-- YC9.2 bước 3, YC9.2-NT3, NT5, NT9, NT10, YC9 "Dữ liệu" (chấp nhận là một giao dịch), "Giá chốt lúc gửi", "Một đêm, một bên
-- thắng", YC9-H4, YC9-H5, QT1.1, QT1.4, QT2.1, QT5.6, QD6, QD11, PQ7.CHU, PQ10.CHU, PQ19, YC12 "Chủ nhà chấp nhận yêu cầu".
create or replace function public.fn_chap_nhan_yeu_cau(p_yeu_cau_id uuid) returns jsonb
language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_nguoi uuid := public.can_dang_nhap();
  v_y public.yeu_cau_dat_phong%rowtype;
  v_id uuid := gen_random_uuid();
  v_tong bigint;
  v_ban bigint;
  v_gio_nhan time;
  v_gio_tra time;
begin
  v_y := public.khoa_yeu_cau_cua_chu(p_yeu_cau_id);
  -- QT5.6: bấm lại sau khi đã chốt thì trả kết quả đã có.
  if v_y.trang_thai = 'da_chot' then
    return public.ket_qua_tra_loi(v_y.id, false);
  end if;
  if v_y.trang_thai <> 'cho' then
    return public.ket_qua_tra_loi(v_y.id, true);
  end if;

  -- YC9-H4, PQ10.SALE: sale bị ngừng, bỏ nguồn, hay không còn được xem căn thì không nhận được.
  if not public.can_chia_se_cho_sale(v_y.sale_id, v_y.can_id) then
    raise exception 'Sale này không còn kết nối với bạn, không nhận được đặt phòng.' using errcode = 'P0001';
  end if;

  select sum(x)::bigint into v_tong from unnest(v_y.gia_chu_dem) x;
  select coalesce(p.gio_nhan, '14:00'), coalesce(p.gio_tra, '12:00') into v_gio_nhan, v_gio_tra
  from public.profiles p where p.id = v_nguoi;

  begin
    -- QD6: ràng buộc booking_khong_trung là chỗ chặn cuối. KT-DB.3.10: tiền từng đêm là giá chủ đã chốt lúc gửi.
    with b as (
      insert into public.booking (id, can_id, ngay_nhan, ngay_tra, nguon, sale_id, tao_boi, tien_phong, trang_thai_tien,
                                  yeu_cau_id, gio_nhan, gio_tra)
      values (v_id, v_y.can_id, v_y.ngay_nhan, v_y.ngay_tra, 'tu_yeu_cau', v_y.sale_id, v_nguoi, v_tong, 'chua_coc',
              v_y.id, coalesce(v_gio_nhan, '14:00'), coalesce(v_gio_tra, '12:00'))
      returning id
    )
    insert into public.booking_dem (booking_id, dem, tien)
    select b.id, v_y.ngay_nhan + (i - 1), v_y.gia_chu_dem[i]
    from b, generate_series(1, v_y.ngay_tra - v_y.ngay_nhan) i;
  exception
    when exclusion_violation then
      raise exception 'Căn đã có đặt phòng trong những đêm này' using errcode = 'P0001';
  end;

  -- QD11: phần riêng của sale (khách, giá bán đã chốt lúc gửi); chủ nhà không đọc được.
  select sum(x)::bigint into v_ban from public.yeu_cau_rieng r, unnest(r.gia_ban_dem) x where r.yeu_cau_id = v_y.id;
  insert into public.booking_rieng (booking_id, nguoi_id, ten_khach, sdt_khach, tien_thu_khach)
  select v_id, v_y.sale_id, r.ten_khach, r.sdt_khach, v_ban
  from (select 1) x left join public.yeu_cau_rieng r on r.yeu_cau_id = v_y.id;

  update public.yeu_cau_dat_phong set trang_thai = 'da_chot', tra_loi_luc = now(), booking_id = v_id where id = v_y.id;

  -- YC12 "Chủ nhà chấp nhận yêu cầu", PQ19: chỉ căn, ngày, giá chủ nhà; theo công tắc của sale.
  if public.thong_bao_bat(v_y.sale_id, 'yeu_cau_da_chot') then
    insert into public.thong_bao (nguoi_nhan, loai, noi_dung, doi_tuong_loai, doi_tuong_id)
    select v_y.sale_id, 'yeu_cau_da_chot',
           jsonb_build_object('ten_chu', coalesce(chu.ten_hien_thi, chu.ten), 'ten_toa', t.ten, 'ma_can', c.ma_can,
                              'ngay_nhan', v_y.ngay_nhan, 'ngay_tra', v_y.ngay_tra, 'so_dem', v_y.ngay_tra - v_y.ngay_nhan,
                              'tong_gia_chu', v_tong, 'booking_id', v_id),
           'yeu_cau', v_y.id
    from public.can c
    join public.profiles chu on chu.id = c.nguoi_giu
    left join public.toa_nha t on t.id = c.toa_nha_id
    where c.id = v_y.can_id;
  end if;

  return public.ket_qua_tra_loi(v_y.id, false);
end $$;

-- YC9.2 bước 4, 5, YC9.2-NT4, NT9, NT11, YC9-H4, YC9-H10, PQ10.CHU, PQ19: từ chối kèm một trong ba lý do, hay không lý do.
-- Không cần sale còn kết nối. Thông báo cho sale ghi ở tg_bao_yeu_cau_bi_tu_choi.
create or replace function public.fn_tu_choi_yeu_cau(p_yeu_cau_id uuid, p_ly_do text) returns jsonb
language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_nguoi uuid := public.can_dang_nhap();
  v_ly_do text := nullif(btrim(coalesce(p_ly_do, '')), '');
  v_y public.yeu_cau_dat_phong%rowtype;
begin
  if v_ly_do is not null and v_ly_do not in ('Đã có khách đặt', 'Đang sửa phòng', 'Lý do khác') then
    raise exception 'Lý do không hợp lệ' using errcode = '22023';
  end if;
  v_y := public.khoa_yeu_cau_cua_chu(p_yeu_cau_id);
  if v_y.trang_thai <> 'cho' then
    return public.ket_qua_tra_loi(v_y.id, true);
  end if;
  update public.yeu_cau_dat_phong set trang_thai = 'bi_tu_choi', ly_do_tu_choi = v_ly_do, tra_loi_luc = now()
  where id = v_y.id;
  return public.ket_qua_tra_loi(v_y.id, false);
end $$;

-- YC12 "Yêu cầu bị từ chối" (sinh ở YC5.3, YC9.2, YC9.3), YC9.2 bước 5, QD11, PQ19: thay bản US28 để thêm tên chủ nhà và lý
-- do chủ nhà chọn (trống khi không chọn hay khi bị từ chối vì trùng đêm). Không tên người được nhận, không giá, không khách.
create or replace function public.tg_bao_yeu_cau_bi_tu_choi() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.thong_bao (nguoi_nhan, loai, noi_dung, doi_tuong_loai, doi_tuong_id)
  select new.sale_id, 'yeu_cau_bi_tu_choi',
         jsonb_build_object('ten_toa', t.ten, 'ma_can', c.ma_can, 'ngay_nhan', new.ngay_nhan, 'ngay_tra', new.ngay_tra,
                            'ten_chu', coalesce(chu.ten_hien_thi, chu.ten), 'ly_do', new.ly_do_tu_choi),
         'yeu_cau', new.id
  from public.can c
  join public.profiles chu on chu.id = c.nguoi_giu
  left join public.toa_nha t on t.id = c.toa_nha_id
  where c.id = new.can_id;
  return null;
end $$;

-- YC12 "Yêu cầu hết hạn", YC9 "Dữ liệu" (hết hạn ghi một thông báo, chạy hai lần không ghi hai), YC9.2-NT10, YC9-H5, PQ19:
-- yêu cầu chờ sang Hết hạn thì báo sale một lần. Việc chạy định kỳ (US53) cũng đi qua trigger này.
create or replace function public.tg_bao_yeu_cau_het_han() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.thong_bao (nguoi_nhan, loai, noi_dung, doi_tuong_loai, doi_tuong_id)
  select new.sale_id, 'yeu_cau_het_han',
         jsonb_build_object('ten_toa', t.ten, 'ma_can', c.ma_can, 'ngay_nhan', new.ngay_nhan, 'ngay_tra', new.ngay_tra,
                            'ten_chu', coalesce(chu.ten_hien_thi, chu.ten), 'gui_luc', new.gui_luc,
                            'vi', case when new.ngay_nhan < public.local_today() then 'qua_ngay_nhan' else 'qua_14_ngay' end),
         'yeu_cau', new.id
  from public.can c
  join public.profiles chu on chu.id = c.nguoi_giu
  left join public.toa_nha t on t.id = c.toa_nha_id
  where c.id = new.can_id
    and not exists (select 1 from public.thong_bao tb
                    where tb.nguoi_nhan = new.sale_id and tb.loai = 'yeu_cau_het_han' and tb.doi_tuong_id = new.id);
  return null;
end $$;

create trigger yeu_cau_bao_het_han
  after update of trang_thai on public.yeu_cau_dat_phong
  for each row when (old.trang_thai = 'cho' and new.trang_thai = 'het_han')
  execute function public.tg_bao_yeu_cau_het_han();

revoke execute on function public.tg_bao_yeu_cau_bi_tu_choi(), public.tg_bao_yeu_cau_het_han() from public, anon, authenticated;

revoke execute on function public.fn_chu_xem_yeu_cau(uuid), public.fn_yeu_cau_dang_cho(), public.fn_chap_nhan_yeu_cau(uuid),
  public.fn_tu_choi_yeu_cau(uuid, text) from public, anon, authenticated;
grant execute on function public.fn_chu_xem_yeu_cau(uuid), public.fn_yeu_cau_dang_cho(), public.fn_chap_nhan_yeu_cau(uuid),
  public.fn_tu_choi_yeu_cau(uuid, text) to authenticated;
