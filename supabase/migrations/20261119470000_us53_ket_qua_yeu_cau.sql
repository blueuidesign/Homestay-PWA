-- US53 · Sale nhận kết quả (YC9.4). Sale đọc kết quả một yêu cầu fn_ket_qua_yeu_cau (S3-04, S3-04-01, S3-05, S3-09),
-- căn tương tự trống cùng ngày fn_can_tuong_tu, việc hết hạn định kỳ fn_het_han_yeu_cau (pg_cron mỗi 10 phút khi máy có).
-- Chỉ thêm, không sửa migration cũ. Thông báo hết hạn ghi ở trigger yeu_cau_bao_het_han (US51), một lần cho mỗi yêu cầu.

-- YC9.4 bước 4, 4a, YC9-H5: yêu cầu Hết hạn vì mốc nào tới trước, hạn 14 ngày hay đầu ngày sau ngày nhận (giờ Việt Nam).
-- Không đổi theo lúc đọc. Hàm nội bộ.
create or replace function public.het_han_vi(p_y public.yeu_cau_dat_phong) returns text
language sql stable security definer set search_path = ''
as $$
  select case
    when not (p_y.trang_thai = 'het_han' or public.yeu_cau_qua_han(p_y)) then null
    when p_y.han_luc <= ((p_y.ngay_nhan + 1)::timestamp at time zone 'Asia/Ho_Chi_Minh') then 'qua_14_ngay'
    else 'qua_ngay_nhan' end
$$;

revoke execute on function public.het_han_vi(public.yeu_cau_dat_phong) from public, anon, authenticated;

-- YC9.4 bước 1 đến 4a, YC9.4-NT1 đến NT4, NT6, NT7, NT8, YC9-H3, QD11, QD13, PQ10.SALE, PQ11.SALE: kết quả một yêu cầu
-- của người gọi, đọc được cả khi đã bị ngừng. Giá là giá đã chốt lúc gửi. Không số điện thoại chủ nhà (PQ2-H1 còn mở).
-- Không phải yêu cầu của người gọi: như không có.
create or replace function public.fn_ket_qua_yeu_cau(p_yeu_cau_id uuid) returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_nguoi uuid := public.can_dang_nhap();
  v_y public.yeu_cau_dat_phong%rowtype;
begin
  select * into v_y from public.yeu_cau_dat_phong y where y.id = p_yeu_cau_id and y.sale_id = v_nguoi;
  if not found then
    raise exception 'Không tìm thấy yêu cầu' using errcode = '42501';
  end if;
  return (
    select (public.yeu_cau_cho_sale(v_y.id) - 'chu')
           || jsonb_build_object(
                'chu', jsonb_build_object('ten', coalesce(chu.ten_hien_thi, chu.ten), 'da_xoa', chu.da_xoa_luc is not null),
                'het_han_vi', public.het_han_vi(v_y),
                'con_xem_can', v_y.can_id in (select public.my_shared_can_ids()))
    from public.can c
    join public.profiles chu on chu.id = c.nguoi_giu
    where c.id = v_y.can_id);
end $$;

-- YC9.4 bước 2, 4, YC9.4-NT2, NT5, YC7.4, QT2.1, QT5.4, PQ3.SALE, PQ4.SALE, PQ5, PQ11.SALE, KT-DB.3.3, KT-DB.3.5: căn tương
-- tự của một yêu cầu của người gọi. Căn nguồn còn được xem, trống mọi đêm chưa qua của yêu cầu, bỏ căn của yêu cầu; chỉ giá
-- bán của người gọi, không giá chủ nhà.
create or replace function public.fn_can_tuong_tu(p_yeu_cau_id uuid) returns jsonb
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_nguoi uuid := public.can_dang_nhap();
  v_y public.yeu_cau_dat_phong%rowtype;
  v_tu date;
begin
  select * into v_y from public.yeu_cau_dat_phong y where y.id = p_yeu_cau_id and y.sale_id = v_nguoi;
  if not found then
    raise exception 'Không tìm thấy yêu cầu' using errcode = '42501';
  end if;
  v_tu := greatest(v_y.ngay_nhan, public.local_today());
  if v_tu >= v_y.ngay_tra then
    return '[]'::jsonb;
  end if;
  return (
    select coalesce(jsonb_agg(jsonb_build_object(
             'can_id', k.can_id, 'ma_can', k.ma_can, 'ten_toa', k.ten_toa, 'so_phong_ngu', k.so_phong_ngu,
             'ten_chu', k.ten_chu, 'tong_gia_ban', k.tong_gia_ban, 'tu', v_tu, 'den', v_y.ngay_tra)
           order by k.ma_can, k.can_id), '[]'::jsonb)
    from public.can_tim(v_nguoi, v_tu, v_y.ngay_tra, null, null, null) k
    where k.nhom = 'nguon' and k.can_id <> v_y.can_id);
end $$;

-- YC9 "Dữ liệu" (hết hạn định kỳ, chạy hai lần không ghi hai thông báo), YC9.4 bước 4, 4a, YC9.4-NT4, NT6, YC9-H5, QD13,
-- PQ19: yêu cầu chờ đã quá hạn sang Hết hạn; trigger yeu_cau_bao_het_han báo sale. Trả số yêu cầu đổi. App không gọi.
create or replace function public.fn_het_han_yeu_cau() returns integer
language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_so integer;
begin
  update public.yeu_cau_dat_phong y set trang_thai = 'het_han', tra_loi_luc = now()
  where y.trang_thai = 'cho' and public.yeu_cau_qua_han(y);
  get diagnostics v_so = row_count;
  return v_so;
end $$;

revoke execute on function public.fn_ket_qua_yeu_cau(uuid), public.fn_can_tuong_tu(uuid), public.fn_het_han_yeu_cau()
  from public, anon, authenticated;
grant execute on function public.fn_ket_qua_yeu_cau(uuid), public.fn_can_tuong_tu(uuid) to authenticated;

-- Lịch mỗi 10 phút nếu máy có pg_cron (môi trường chưa bật thì bỏ qua; khi đọc, yêu cầu quá hạn vẫn ra Hết hạn).
do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.schedule('us53-het-han-yeu-cau', '*/10 * * * *', 'select public.fn_het_han_yeu_cau()');
  end if;
end $$;
