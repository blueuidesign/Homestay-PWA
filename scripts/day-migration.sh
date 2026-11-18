#!/usr/bin/env bash
# Chạy các migration chưa chạy lên một database Supabase thật (staging), rồi chạy seed.
# Ai gọi: workflow .github/workflows/migration-staging.yml. Chạy tay: DB_URL=... scripts/day-migration.sh
# Cách biết file nào đã chạy: bảng supabase_migrations.schema_migrations (bảng Supabase CLI và MCP cùng dùng).
#   Một file coi là đã chạy khi có dòng trùng version (phần số đầu tên file) hoặc trùng name (tên file bỏ .sql).
# Mỗi file chạy trong một giao dịch riêng, ghi dòng vào schema_migrations trong cùng giao dịch: lỗi thì không ghi dở.
# Không chạy data-fixes/ (sửa dữ liệu production, Tùng duyệt từng lần).
set -euo pipefail
cd "$(dirname "$0")/.."
: "${DB_URL:?Cần biến DB_URL (chuỗi kết nối Session pooler của staging)}"
PSQL=(psql "$DB_URL" -X -q -v ON_ERROR_STOP=1)

"${PSQL[@]}" -c "create schema if not exists supabase_migrations;
  create table if not exists supabase_migrations.schema_migrations (version text primary key, statements text[], name text);"

n=0
for f in supabase/migrations/*.sql; do
  ten=$(basename "$f" .sql)
  ver=${ten%%_*}
  da_chay=$("${PSQL[@]}" -tAc "select count(*) from supabase_migrations.schema_migrations where version = '$ver' or name = '$ten'")
  if [ "$da_chay" != "0" ]; then echo "Đã chạy: $ten"; continue; fi
  echo "Chạy: $ten"
  { cat "$f"; echo; echo "insert into supabase_migrations.schema_migrations (version, name) values ('$ver', '$ten');"; } \
    | "${PSQL[@]}" --single-transaction -f - >/dev/null
  n=$((n + 1))
done
echo "Đã chạy $n migration mới."

for f in supabase/seed/*.sql; do
  [ -e "$f" ] || continue
  "${PSQL[@]}" --single-transaction -f "$f" >/dev/null
done
echo "Đã chạy seed."
