#!/usr/bin/env bash
# Sinh docs/tu-sinh/Bang_va_cot.md từ database vừa dựng bằng scripts/test-db.sh: bảng, cột, view, hàm fn_*, policy.
# Danh sách cột không viết tay ở đâu khác (docs/Nguyen_ly_lam_viec.md, nguyên lý 6). CI chạy script này và báo đỏ nếu
# file trong repo khác bản vừa sinh, tức là có migration mới mà chưa sinh lại.
# Dùng: PGHOST=localhost PGUSER=postgres PGPASSWORD=... scripts/test-db.sh && scripts/bang-cot.sh
set -euo pipefail
cd "$(dirname "$0")/.."
DB="${TEST_DB:-home247_test}"
OUT=docs/tu-sinh/Bang_va_cot.md
Q=(psql -X -q -A -t -d "$DB" -v ON_ERROR_STOP=1)
# Không kết nối được database thì dừng, không ghi đè file bằng bản rỗng
"${Q[@]}" -c "select 1" >/dev/null || { echo "Không kết nối được database $DB. Chạy scripts/test-db.sh trước." >&2; exit 1; }
TMP=$(mktemp)
{
  echo "# Bảng, cột, view, hàm và policy"
  echo
  echo "[tự sinh] bằng \`scripts/bang-cot.sh\` từ \`supabase/migrations/\`. Không sửa tay. Ý định và bất biến của từng bảng: \`docs/Thiet_ke_DB.md\`."
  echo
  echo "## Bảng"
  for t in $("${Q[@]}" -c "select tablename from pg_tables where schemaname = 'public' order by 1"); do
    echo; echo "### $t"; echo
    echo "| Cột | Kiểu | Bắt buộc | Mặc định |"; echo "| --- | --- | --- | --- |"
    "${Q[@]}" -c "select '| ' || column_name || ' | ' || case when data_type = 'ARRAY' then ltrim(udt_name, '_') || '[]' when data_type = 'USER-DEFINED' then udt_name else data_type end || ' | ' || case is_nullable when 'NO' then 'có' else '' end || ' | ' || coalesce('\`' || replace(column_default, '|', '/') || '\`', '') || ' |' from information_schema.columns where table_schema = 'public' and table_name = '$t' order by ordinal_position"
    c=$("${Q[@]}" -c "select '- \`' || conname || '\`: ' || replace(pg_get_constraintdef(oid), E'\n', ' ') from pg_constraint where conrelid = 'public.$t'::regclass and contype in ('c', 'x', 'u') order by conname")
    if [ -n "$c" ]; then echo; echo "Ràng buộc:"; echo "$c"; fi
    p=$("${Q[@]}" -c "select '- \`' || policyname || '\` (' || cmd || ', ' || array_to_string(roles, ', ') || '): ' || coalesce(replace(qual, E'\n', ' '), '') from pg_policies where schemaname = 'public' and tablename = '$t' order by policyname")
    echo; if [ -n "$p" ]; then echo "Policy:"; echo "$p"; else echo "Policy: không có. Bật RLS mà không có policy nghĩa là app không đọc, không ghi thẳng được."; fi
  done
  echo; echo "## View"
  for v in $("${Q[@]}" -c "select viewname from pg_views where schemaname = 'public' order by 1"); do
    echo; echo "### $v"; echo
    "${Q[@]}" -c "select '- ' || column_name || ' (' || data_type || ')' from information_schema.columns where table_schema = 'public' and table_name = '$v' order by ordinal_position"
  done
  echo; echo "## Hàm app gọi được (vai authenticated)"; echo
  "${Q[@]}" -c "select '- \`' || p.proname || '(' || pg_get_function_arguments(p.oid) || ')\` trả ' || pg_get_function_result(p.oid) || case when has_function_privilege('anon', p.oid, 'execute') then ' · **khách chưa đăng nhập gọi được**' else '' end from pg_proc p where p.pronamespace = 'public'::regnamespace and p.proname like 'fn\_%' and has_function_privilege('authenticated', p.oid, 'execute') order by 1"
  echo; echo "## Hàm nội bộ (app không gọi được)"; echo
  "${Q[@]}" -c "select '- \`' || p.proname || '(' || pg_get_function_arguments(p.oid) || ')\`' from pg_proc p where p.pronamespace = 'public'::regnamespace and p.prokind = 'f' and not (p.proname like 'fn\_%' and has_function_privilege('authenticated', p.oid, 'execute')) and not exists (select 1 from pg_depend d where d.objid = p.oid and d.deptype = 'e') order by 1"
} > "$TMP"
mv "$TMP" "$OUT"
echo "Đã ghi $OUT ($(wc -l < "$OUT") dòng)"
