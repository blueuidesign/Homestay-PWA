-- Khung test database (EN2). Nạp một lần sau migration, trước mọi file test.
-- Mỗi file tests/db/[1-9]*.sql chạy trong một giao dịch rồi rollback (scripts/test-db.sh), nên dữ liệu
-- của file này không lọt sang file khác.
-- Kết quả in bằng NOTICE dạng "ok - <tên>" hoặc "not ok - <tên>". Tên test mở đầu bằng mã nó kiểm
-- (ví dụ "KT-DB.3.2 QT1.1-VD1 ..."), để chạy lọc theo mã: scripts/test-db.sh <mã>.

create schema if not exists t;
grant usage on schema t to anon, authenticated;

-- Ghi một kết quả.
create or replace function t.ok(dk boolean, ten text) returns void
language plpgsql as $$
begin
  if dk is true then
    raise notice 'ok - %', ten;
  else
    raise notice 'not ok - %', ten;
  end if;
end $$;

-- So hai giá trị, in cả hai khi lệch.
create or replace function t.bang(thuc anyelement, mong anyelement, ten text) returns void
language plpgsql as $$
begin
  if thuc is not distinct from mong then
    raise notice 'ok - %', ten;
  else
    raise notice 'not ok - % (ra: %, mong: %)', ten, thuc, mong;
  end if;
end $$;

-- Chạy câu lệnh, mong bị từ chối. mau: chuỗi mã lỗi 5 ký tự (ví dụ '23P01', '42501') hoặc mẫu ILIKE của câu lỗi.
create or replace function t.loi(cau text, mau text, ten text) returns void
language plpgsql as $$
declare ma text; cau_loi text;
begin
  begin
    execute cau;
  exception when others then
    get stacked diagnostics ma = returned_sqlstate, cau_loi = message_text;
    if ma = mau or cau_loi ilike mau then
      raise notice 'ok - %', ten;
    else
      raise notice 'not ok - % (lỗi khác: % %)', ten, ma, cau_loi;
    end if;
    return;
  end;
  raise notice 'not ok - % (không bị từ chối)', ten;
end $$;

-- Chạy câu lệnh, mong qua.
create or replace function t.khong_loi(cau text, ten text) returns void
language plpgsql as $$
declare ma text; cau_loi text;
begin
  execute cau;
  raise notice 'ok - %', ten;
exception when others then
  get stacked diagnostics ma = returned_sqlstate, cau_loi = message_text;
  raise notice 'not ok - % (bị từ chối: % %)', ten, ma, cau_loi;
end $$;

-- Đếm số dòng một câu select trả về, chạy bằng vai hiện tại.
create or replace function t.dem(cau text) returns bigint
language plpgsql as $$
declare n bigint;
begin
  execute 'select count(*) from (' || cau || ') x' into n;
  return n;
end $$;

-- Đóng vai người đã đăng nhập (vai authenticated của Supabase, auth.uid() = nguoi).
create or replace function t.dang_nhap(nguoi uuid) returns void
language plpgsql as $$
begin
  perform set_config('request.jwt.claims', json_build_object('sub', nguoi, 'role', 'authenticated')::text, true);
  perform set_config('role', 'authenticated', true);
end $$;

-- Đóng vai khách chưa đăng nhập (vai anon).
create or replace function t.khach() returns void
language plpgsql as $$
begin
  perform set_config('request.jwt.claims', '{"role":"anon"}', true);
  perform set_config('role', 'anon', true);
end $$;

-- Về vai chủ database (để dựng dữ liệu, hay sau khi thử một vai).
create or replace function t.thoat() returns void
language plpgsql as $$
begin
  perform set_config('request.jwt.claims', '', true);
  reset role;
end $$;

grant execute on all functions in schema t to anon, authenticated;
