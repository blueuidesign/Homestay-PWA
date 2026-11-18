#!/usr/bin/env bash
# Chứng minh bộ test database bắt được lỗi (docs/QUY_TRINH.md mục 6): mỗi dòng ở cuối file cố ý làm hỏng một luật trong
# migration, dựng lại database, chạy tests/db. Kỳ vọng: test báo HỎNG. Test vẫn xanh thì in "LỌT": test không kiểm luật đó.
# Dùng: PGHOST=localhost PGPORT=5432 PGUSER=postgres PGPASSWORD=... scripts/thu-lam-hong.sh
# Thêm luật mới (hàm fn_*, policy, view, ràng buộc) thì thêm một dòng: tên · file migration · đoạn gốc ||| đoạn đã làm hỏng.
set -u
cd "$(dirname "$0")/.."
GOC=$(pwd)
lot=0; tong=0

lam_hong() {
  local ten="$1" file="$2" doi="$3" tmp out
  tong=$((tong + 1))
  tmp=$(mktemp -d)
  cp -r "$GOC/supabase" "$GOC/tests" "$GOC/scripts" "$tmp/"
  if ! python3 - "$tmp/supabase/migrations/$file" "$doi" <<'PY'
import sys
p, e = sys.argv[1], sys.argv[2]
a, b = e.split('|||')
s = open(p, encoding='utf-8').read()
if a not in s:
    sys.exit(1)
open(p, 'w', encoding='utf-8').write(s.replace(a, b, 1))
PY
  then
    echo "CŨ       $ten: không tìm thấy đoạn gốc trong $file, sửa dòng này cho khớp migration"; lot=1; rm -rf "$tmp"; return
  fi
  out=$(cd "$tmp" && TEST_DB=home247_lam_hong bash scripts/test-db.sh 2>&1)
  if echo "$out" | grep -q "HỎNG"; then
    echo "BẮT ĐƯỢC $ten: $(echo "$out" | grep -m1 'SAI:' | sed 's/.*SAI: //' | cut -c1-80)"
  elif echo "$out" | grep -q "LỖI"; then
    echo "CŨ       $ten: migration làm hỏng không chạy được, sửa dòng này"; lot=1
  else
    echo "LỌT      $ten"; lot=1
  fi
  rm -rf "$tmp"
}

MN=20261118000000_nen_tang.sql
M0=20261118000100_can_ket_noi_gia.sql
M1=20261118000200_booking.sql
M2=20261118000300_thong_bao_gui_khach.sql
M3=20261118000400_doc_thong_ke_quan_tri.sql
lam_hong "bỏ ràng buộc chặn trùng"          $M1 "  constraint booking_khong_trung exclude using gist (can_id with =, dem with &&) where (trang_thai <> 'da_huy'),|||"
lam_hong "sale vẫn thấy căn khi bị ngừng"    $M0 "     and k.trang_thai = 'da_ket_noi'|||     and k.trang_thai in ('da_ket_noi', 'chu_ngung')"
lam_hong "chủ đã xóa tài khoản vẫn chia sẻ"  $M0 "p.id = k.chu_nha_id and p.da_xoa_luc is null|||p.id = k.chu_nha_id"
lam_hong "bỏ phạm vi chọn căn"               $M0 "(k.pham_vi = 'tat_ca_can' or exists|||(true or exists"
lam_hong "khách đọc được giá"                $M0 "create policy gia_read on public.gia_thang for select to authenticated using|||create policy gia_anon on public.gia_thang for select to anon using (true); create policy gia_read on public.gia_thang for select to authenticated using"
lam_hong "link mời lộ giá"                   $M0 "'loai_view', loai_view) order by ma_can)|||'loai_view', loai_view, 'gia', 1) order by ma_can)"
lam_hong "cuối tuần tính lệch một ngày"      $M0 "when extract(dow from p_dem)::smallint = any (p.dem_cuoi_tuan) then g.gia_cuoi_tuan|||when extract(dow from p_dem + 1)::smallint = any (p.dem_cuoi_tuan) then g.gia_cuoi_tuan"
lam_hong "view sale lộ tiền cọc"             $M1 "b.tien_phong, r.tien_thu_khach,|||b.tien_phong, b.tien_coc, r.tien_thu_khach,"
lam_hong "ai cũng đọc phần riêng"            $M1 "using (nguoi = (select auth.uid()) or (select public.is_admin()));|||using (true);"
lam_hong "chủ đọc khách trên yêu cầu"        $M1 "using (yeu_cau_id in (select id from public.yeu_cau_dat_phong where sale_id = (select auth.uid())) or (select public.is_admin()));|||using (true);"
lam_hong "sale gửi yêu cầu vào đêm kín"      $M1 "    raise exception 'Căn này đã được đặt rồi' using errcode = 'P0001';|||    null;"
lam_hong "không từ chối yêu cầu trùng"       $M1 "  perform tu_choi_yeu_cau_trung(y.can_id, y.dem);|||"
lam_hong "chia tiền không dồn lẻ"            $M1 "then b.tien_phong - (b.tien_phong / v_n) * (v_n - 1) else|||then b.tien_phong / v_n else"
lam_hong "người xin hủy tự đồng ý"           $M1 "  if v_me = b.xin_huy_boi then raise exception|||  if false then raise exception"
lam_hong "xin hủy lại sau khi bị từ chối"    $M1 "  if b.tu_choi_huy_luc is not null then raise exception 'Đã bị từ chối hủy, không xin hủy lại được' using errcode = 'P0001'; end if;|||"
lam_hong "chủ xóa booking của sale"          $M1 "  if b.sale_id is not null then raise exception 'Đặt phòng của sale không xóa được, hãy xin hủy' using errcode = 'P0001'; end if;|||"
lam_hong "quên tắt quyền cọc"                $M1 "case when coalesce(k.quyen_tinh_trang_coc, true) then|||case when true then"
lam_hong "chủ đọc mức cộng của sale"         $M0 "create policy muc_cong_read on public.muc_cong for select to authenticated using (sale_id = (select auth.uid()));|||create policy muc_cong_read on public.muc_cong for select to authenticated using (true);"
lam_hong "ai cũng đọc cài đặt riêng"         $MN "create policy cai_dat_rieng_read on public.cai_dat_rieng for select to authenticated using (user_id = (select auth.uid()));|||create policy cai_dat_rieng_read on public.cai_dat_rieng for select to authenticated using (true);"
lam_hong "đọc thông báo của người khác"      $M2 "create policy thong_bao_read on public.thong_bao for select to authenticated using (nguoi_nhan = (select auth.uid()));|||create policy thong_bao_read on public.thong_bao for select to authenticated using (true);"
lam_hong "tắt loại thông báo vẫn nhận"       $M2 "  if exists (select 1 from cai_dat_rieng where user_id = p_nguoi and p_loai = any (thong_bao_tat)) then return; end if;|||"
lam_hong "giá dịp chồng ngày"                $M0 "  constraint gia_dip_khong_chong exclude using gist (can_id with =, dai with &&)|||  constraint gia_dip_co_can check (can_id is not null)"
lam_hong "quá 12 ảnh một căn"                $M0 "  if coalesce(array_length(p_anh_ids, 1), 0) > 12 then raise exception 'Mỗi căn tối đa 12 ảnh' using errcode = 'P0001'; end if;|||"
lam_hong "xóa căn còn đặt phòng"             $M0 "  if can_con_dat_phong(p_can) then raise exception 'Căn còn đặt phòng sắp tới' using errcode = 'P0001'; end if;|||"
lam_hong "không làm tròn 50 nghìn"           $M0 "then (ceil(x.gia / 50000.0) * 50000)::int else x.gia end|||then x.gia else x.gia end"
lam_hong "thống kê tính cả đặt phòng đã hủy" $M3 "   where c.nguoi_giu = v_me and c.loai = 'co_lich' and b.trang_thai <> 'da_huy' and bd.dem >= v_dau and bd.dem < v_cuoi;|||   where c.nguoi_giu = v_me and c.loai = 'co_lich' and bd.dem >= v_dau and bd.dem < v_cuoi;"
lam_hong "đồng quản trị thêm được quản trị"  $M3 "  if not exists (select 1 from admins where user_id = v_me and la_goc) then|||  if not exists (select 1 from admins where user_id = v_me) then"
lam_hong "căn tự nhập hiện trống hay kín"    $M3 "                     'cua_ban', exists (select 1 from booking b where b.can_id = c.id and b.trang_thai <> 'da_huy' and b.dem @> d::date))|||                     'kin', false, 'cua_ban', exists (select 1 from booking b where b.can_id = c.id and b.trang_thai <> 'da_huy' and b.dem @> d::date))"

echo "Đã thử $tong cách làm hỏng."
exit $lot
