#!/usr/bin/env bash
# EN6 · Diễn tập khôi phục (YC15.2-NT3, YC15 "Diễn tập khôi phục"). Khôi phục một bản sao lưu vào database trống đã chạy
# migration (giống project Supabase mới), rồi so số dòng từng bảng với database gốc.
#
# Cách dùng: scripts/khoi-phuc-thu.sh <file .dump> <chuỗi kết nối database đích> [chuỗi kết nối database gốc để so]
# Database đích phải là database MỚI (bước khôi phục xóa sạch dữ liệu ở public, auth, storage trước khi nạp).
# Không bao giờ trỏ database đích vào production đang chạy.
set -euo pipefail
FILE="${1:?Thiếu file .dump}"; DICH="${2:?Thiếu database đích}"; GOC_DB="${3:-}"

# 1. Xóa dữ liệu có sẵn ở đích (migration có thể đã ghi kho ảnh, ngày lễ...), để nạp lại đúng như bản sao lưu.
PGOPTIONS="-c client_min_messages=warning" psql -X -q -v ON_ERROR_STOP=1 "$DICH" <<'SQL'
do $$ declare r record; begin
  for r in select schemaname, tablename from pg_tables where schemaname in ('public', 'auth', 'storage') loop
    execute format('truncate table %I.%I cascade', r.schemaname, r.tablename);
  end loop;
end $$;
SQL

# 2. Chỉ nạp dữ liệu (bảng, hàm, policy đã có từ migration). Tắt trigger trong lúc nạp để thứ tự bảng không làm vỡ ràng buộc.
#    pg_restore ra SQL rồi psql nạp trong một giao dịch: bỏ dòng SET tham số mà server đích cũ hơn không biết
#    (pg_dump 17 ghi transaction_timeout, Postgres 16 báo lỗi).
pg_restore --data-only --no-owner --no-privileges -f - "$FILE" \
  | sed -E '/^SET (transaction_timeout|idle_in_transaction_session_timeout) /d' \
  | PGOPTIONS='-c session_replication_role=replica -c client_min_messages=warning' psql -X -q -1 -v ON_ERROR_STOP=1 "$DICH" >/dev/null

# 3. So số dòng từng bảng với gốc (nếu có).
dem() {
  psql -X -At "$1" -c "select string_agg(t, E'\n' order by t) from (select format('%s.%s %s', schemaname, tablename,
      (xpath('/row/c/text()', query_to_xml(format('select count(*) as c from %I.%I', schemaname, tablename), false, true, '')))[1]::text) t
    from pg_tables where schemaname in ('public', 'auth', 'storage')) x"; }
if [ -n "$GOC_DB" ]; then
  if diff <(dem "$GOC_DB") <(dem "$DICH") >/dev/null; then
    echo "Khôi phục thử đạt: số dòng mọi bảng ở public, auth, storage khớp database gốc."
  else
    echo "LỖI khôi phục thử: số dòng khác gốc:" >&2; diff <(dem "$GOC_DB") <(dem "$DICH") >&2 || true; exit 1
  fi
else
  echo "Đã khôi phục. Số dòng từng bảng:"; dem "$DICH"
fi
