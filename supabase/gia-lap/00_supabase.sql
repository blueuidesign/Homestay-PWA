-- Giả lập phần của Supabase mà migration cần, để chạy trên Postgres 16 trần (thiet-ke-db.md mục 6).
-- Chỉ chạy ở máy dev và CI (scripts/test-db.sh). KHÔNG chạy lên Supabase thật: ở đó các thứ này đã có.
-- Giữ giống Supabase ở điểm quan trọng nhất: bảng mới trong schema public mặc định được cấp mọi quyền
-- cho anon và authenticated, nên chỉ RLS và lệnh revoke trong migration mới bảo vệ được dữ liệu.

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon nologin noinherit; end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated nologin noinherit; end if;
  if not exists (select 1 from pg_roles where rolname = 'service_role') then create role service_role nologin noinherit bypassrls; end if;
end $$;

create schema if not exists extensions;
create schema if not exists auth;

create table if not exists auth.users (
  id uuid primary key default gen_random_uuid(),
  email text,
  phone text,
  created_at timestamptz not null default now()
);

-- Supabase đọc người gọi từ JWT; PostgREST đặt request.jwt.claims (bản mới) hoặc request.jwt.claim.sub (bản cũ).
create or replace function auth.uid() returns uuid
language sql stable as $$
  select coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub'
  )::uuid
$$;

create or replace function auth.role() returns text
language sql stable as $$
  select coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role'
  )
$$;

create or replace function auth.jwt() returns jsonb
language sql stable as $$
  select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb
$$;

grant usage on schema auth, extensions to anon, authenticated, service_role;
grant execute on all functions in schema auth to anon, authenticated, service_role;
grant usage on schema public to anon, authenticated, service_role;

-- Quyền mặc định giống Supabase cho đối tượng do postgres tạo trong public.
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public grant execute on functions to anon, authenticated, service_role;

-- ===== Kho file (Supabase Storage), tối thiểu cho US16 · Ảnh căn =====
-- Giống Supabase ở cột và hàm migration dùng: storage.buckets, storage.objects (RLS bật, anon và authenticated
-- có quyền bảng, policy quyết định dòng nào), storage.foldername(). Cỡ file và loại file thật do dịch vụ kho
-- của Supabase chặn theo file_size_limit, allowed_mime_types của bucket; giả lập này không chặn (test e2e kiểm).
create schema if not exists storage;

create table if not exists storage.buckets (
  id text primary key,
  name text not null unique,
  owner uuid,
  public boolean default false,
  file_size_limit bigint,
  allowed_mime_types text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists storage.objects (
  id uuid primary key default gen_random_uuid(),
  bucket_id text references storage.buckets (id),
  name text,
  owner uuid,
  owner_id text,
  metadata jsonb,
  path_tokens text[] generated always as (string_to_array(name, '/')) stored,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  last_accessed_at timestamptz default now(),
  constraint objects_bucketid_objname unique (bucket_id, name)
);

-- Như Supabase: các thư mục của đường dẫn, bỏ tên file. 'a/b/c.jpg' → {a,b}.
create or replace function storage.foldername(name text) returns text[]
language plpgsql immutable as $$
declare _parts text[];
begin
  select string_to_array(name, '/') into _parts;
  return _parts[1:array_length(_parts, 1) - 1];
end $$;

alter table storage.buckets enable row level security;
alter table storage.objects enable row level security;
grant usage on schema storage to anon, authenticated, service_role;
grant all on storage.buckets, storage.objects to anon, authenticated, service_role;
grant execute on all functions in schema storage to anon, authenticated, service_role;
