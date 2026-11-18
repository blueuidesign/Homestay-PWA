#!/usr/bin/env bash
# Sinh supabase/bang-va-cot.md từ migration: bảng, cột, ràng buộc, policy, view, hàm (thiet-ke-db.md: danh sách
# cột không viết tay). Dựng database thử bằng scripts/test-db.sh --chi-dung rồi đọc danh mục hệ thống.
# Chạy lại sau mỗi lần đổi migration, commit file sinh ra cùng PR. Không sửa tay file đó.
set -euo pipefail
GOC="$(cd "$(dirname "$0")/.." && pwd)"
DB="${TEST_DB:-home247_bang_cot}"
TEST_DB="$DB" "$GOC/scripts/test-db.sh" --chi-dung >/dev/null
RA="$GOC/supabase/bang-va-cot.md"
Q() { psql -X -q -At --no-psqlrc -d "$DB" -F $'\t' -c "$1"; }

{
  echo "# Bảng và cột · máy sinh bằng scripts/bang-cot.sh từ supabase/migrations. Không sửa tay."
  echo
  for t in $(Q "select tablename from pg_tables where schemaname='public' order by 1"); do
    rls=$(Q "select case when relrowsecurity then 'bật' else 'TẮT' end from pg_class where oid='public.$t'::regclass")
    echo "## $t"
    echo
    echo "RLS: $rls"
    echo
    echo "| Cột | Kiểu | Null | Mặc định |"
    echo "|---|---|---|---|"
    Q "select a.attname, format_type(a.atttypid,a.atttypmod), case when a.attnotnull then 'không' else 'có' end,
              coalesce(pg_get_expr(d.adbin,d.adrelid), case when a.attgenerated='s' then 'tự sinh' else '' end)
       from pg_attribute a left join pg_attrdef d on d.adrelid=a.attrelid and d.adnum=a.attnum
       where a.attrelid='public.$t'::regclass and a.attnum>0 and not a.attisdropped order by a.attnum" \
      | sed 's/|/\\|/g' | awk -F'\t' '{printf "| %s | %s | %s | %s |\n",$1,$2,$3,$4}'
    echo
    echo "Ràng buộc:"
    Q "select conname || ': ' || pg_get_constraintdef(oid) from pg_constraint where conrelid='public.$t'::regclass order by conname" | sed 's/^/- /'
    Q "select indexname || ': ' || indexdef from pg_indexes where schemaname='public' and tablename='$t'
       and indexname not in (select conname from pg_constraint where conrelid='public.$t'::regclass) order by 1" | sed 's/^/- /'
    echo
    echo "Policy:"
    Q "select policyname || ' (' || cmd || ', ' || array_to_string(roles, ',') || '): ' || coalesce(qual,'') from pg_policies where schemaname='public' and tablename='$t' order by 1" | sed 's/^/- /'
    echo
  done
  echo "## View"
  echo
  Q "select viewname from pg_views where schemaname='public' order by 1" | while read -r v; do
    echo "- $v: $(Q "select string_agg(attname, ', ' order by attnum) from pg_attribute where attrelid='public.$v'::regclass and attnum>0")"
  done
  echo
  echo "## Hàm"
  echo
  Q "select p.proname || '(' || pg_get_function_identity_arguments(p.oid) || ') → ' || pg_get_function_result(p.oid)
            || case when p.prosecdef then ' · security definer' else '' end
            || coalesce(' · gọi được: ' || nullif(array_to_string(array(
                 select r from unnest(array['anon','authenticated']) r where has_function_privilege(r, p.oid, 'execute')), ', '), ''), '')
     from pg_proc p where p.pronamespace='public'::regnamespace order by 1" | sed 's/^/- /'
} > "$RA"
PGOPTIONS="-c client_min_messages=warning" psql -X -q -d postgres -c "drop database if exists \"$DB\" with (force)" >/dev/null
echo "Đã ghi $RA"
