-- US22 · Giá ngày lễ và dịp đặc biệt (YC4.3). Lệnh lưu một dải giá dịp fn_luu_gia_dip.
-- Chỉ thêm, không sửa migration cũ. Đọc dải giá dịp vẫn qua policy gia_dip_doc (PQ5), dải ngày lễ chung qua ngay_le_doc (PQ21).
-- Ràng buộc gia_dip_khong_chong (KT-DB.3.4) vẫn là chốt cuối chặn hai dải chồng ngày.

-- YC4.3 bước 7, 8, YC4.3 Luật kiểm, YC4 Quy tắc "Tên dịp tự đặt", YC4 "Dữ liệu", YC4 "Ai được làm gì", QT5.5, PQ5.CHU, PQ21.CHU.
-- Chỉ người giữ căn chưa xóa lưu được. Khóa dòng căn để hai lệnh cùng lúc của một căn chạy lần lượt (YC4.3-NT7).
-- Không đụng dải ngày lễ chung ngay_le, không đụng booking. Cập nhật lúc lịch đổi của căn.
create or replace function public.fn_luu_gia_dip(p_can_id uuid, p_tu_ngay date, p_den_ngay date, p_ten text, p_gia bigint, p_la_ngay_le boolean)
returns uuid
language plpgsql volatile security definer set search_path = ''
as $$
declare
  v_nguoi uuid := public.can_dang_nhap();
  v_ten text := nullif(btrim(coalesce(p_ten, '')), '');
  v_trung record;
  v_id uuid;
begin
  perform 1 from public.can c
  where c.id = p_can_id and c.nguoi_giu = v_nguoi and c.an_luc is null
  for update;
  if not found then
    raise exception 'Không tìm thấy căn' using errcode = 'P0001';
  end if;

  if p_tu_ngay is null or p_den_ngay is null then
    raise exception 'Cần chọn từ ngày và đến ngày' using errcode = 'P0001';
  end if;
  if p_den_ngay < p_tu_ngay then
    raise exception 'Đến ngày không được trước từ ngày' using errcode = 'P0001';
  end if;
  if p_den_ngay - p_tu_ngay > 9 then
    raise exception 'Tối đa 10 ngày' using errcode = 'P0001';
  end if;
  if v_ten is not null and char_length(v_ten) > 60 then
    raise exception 'Tên dịp dài tối đa 60 ký tự' using errcode = 'P0001';
  end if;
  if p_gia is null then
    raise exception 'Cần nhập giá mỗi đêm' using errcode = 'P0001';
  end if;
  if p_gia <= 0 then
    raise exception 'Giá phải lớn hơn 0' using errcode = 'P0001';
  end if;
  if p_gia > 100000000 then
    raise exception 'Giá mỗi đêm tối đa 100.000.000đ' using errcode = 'P0001';
  end if;

  -- YC4.3 bước 8: chồng ngày với dải đã có của cùng căn thì báo tên và ngày của dải đó.
  select g.ten, g.tu_ngay, g.den_ngay into v_trung
  from public.gia_dip g
  where g.can_id = p_can_id and daterange(g.tu_ngay, g.den_ngay, '[]') && daterange(p_tu_ngay, p_den_ngay, '[]')
  order by g.tu_ngay limit 1;
  if found then
    raise exception 'Trùng ngày với % (%). Đổi ngày rồi lưu lại.',
      coalesce(nullif(btrim(v_trung.ten), ''), 'Dịp đặc biệt ' || public.chu_dai_ngay(v_trung.tu_ngay, v_trung.den_ngay)),
      public.chu_dai_ngay(v_trung.tu_ngay, v_trung.den_ngay)
      using errcode = 'P0001';
  end if;

  -- YC4 Quy tắc "Tên dịp tự đặt"; bật "Là ngày lễ" mà bỏ trống tên thì "Ngày lễ <đầu> – <cuối>" (YC4-H6, Claude tự chốt QD25).
  if v_ten is null then
    v_ten := case when coalesce(p_la_ngay_le, false) then 'Ngày lễ ' else 'Dịp đặc biệt ' end
             || public.chu_dai_ngay(p_tu_ngay, p_den_ngay);
  end if;

  insert into public.gia_dip (can_id, tu_ngay, den_ngay, ten, gia, la_ngay_le, sua_luc)
  values (p_can_id, p_tu_ngay, p_den_ngay, v_ten, p_gia, coalesce(p_la_ngay_le, false), now())
  returning id into v_id;

  -- YC4 "Dữ liệu": mọi lệnh đổi giá cập nhật lúc lịch đổi của căn (độ tươi ở YC7).
  update public.can set lich_doi_luc = now() where id = p_can_id;
  return v_id;
exception
  when exclusion_violation then
    -- KT-DB.3.4: lệnh khác vừa lưu dải chồng ngày (không qua khóa ở trên) thì vẫn trả câu trùng ngày.
    raise exception 'Trùng ngày với một dải đã có. Đổi ngày rồi lưu lại.' using errcode = 'P0001';
end $$;

-- YC4.3 bước 8: "24/10 – 25/10"; một ngày thì "24/10". Giống chuDai ở src/lib/gia.ts.
create or replace function public.chu_dai_ngay(p_tu date, p_den date)
returns text
language sql immutable set search_path = ''
as $$
  select case when p_tu = p_den then to_char(p_tu, 'DD/MM') else to_char(p_tu, 'DD/MM') || ' – ' || to_char(p_den, 'DD/MM') end
$$;

revoke execute on function public.chu_dai_ngay(date, date) from public, anon;
grant execute on function public.chu_dai_ngay(date, date) to authenticated;
revoke execute on function public.fn_luu_gia_dip(uuid, date, date, text, bigint, boolean) from public, anon, authenticated;
grant execute on function public.fn_luu_gia_dip(uuid, date, date, text, bigint, boolean) to authenticated;
