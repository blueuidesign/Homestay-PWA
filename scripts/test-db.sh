#!/usr/bin/env bash
# Dựng database trống từ toàn bộ migration trên Postgres 16 trần, rồi chạy mọi test database (EN2, thiet-ke-db.md mục 6).
#
# Cách dùng (cần Postgres 16 đang chạy; kết nối theo biến PGHOST, PGPORT, PGUSER, PGPASSWORD của psql):
#   scripts/test-db.sh                 dựng lại database thử, chạy mọi test, nạp thử dữ liệu mẫu
#   scripts/test-db.sh KT-DB.3.2       như trên, chỉ báo các test có tên chứa chuỗi này (lọc theo mã)
#   scripts/test-db.sh --chi-dung      chỉ dựng database và nạp dữ liệu mẫu, không chạy test (để chạy app trên máy)
# Biến: TEST_DB (tên database, mặc định home247_test). SAU_MIGRATION=<file.sql> chạy thêm file đó ngay sau
# migration (scripts/thu-lam-hong.sh dùng để cố tình làm hỏng).
# Thoát 0 khi mọi test qua; 1 khi có test hỏng hay file lỗi.
set -euo pipefail

GOC="$(cd "$(dirname "$0")/.." && pwd)"
DB="${TEST_DB:-home247_test}"
LOC=""
CHI_DUNG=0
for a in "$@"; do
  case "$a" in
    --chi-dung) CHI_DUNG=1 ;;
    -h|--help) sed -n '2,12p' "$0"; exit 0 ;;
    *) LOC="$a" ;;
  esac
done

PSQL=(psql -X -q -v ON_ERROR_STOP=1 --no-psqlrc -d "$DB")

chay() { # chạy một file SQL, dừng nếu lỗi
  "${PSQL[@]}" -f "$1" >/dev/null 2>"$TMP/loi.txt" || { echo "LỖI khi chạy $1:"; cat "$TMP/loi.txt"; exit 1; }
}

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

PGOPTIONS="-c client_min_messages=warning" psql -X -q -d postgres -c "drop database if exists \"$DB\" with (force)" >/dev/null
psql -X -q -d postgres -c "create database \"$DB\"" >/dev/null

for f in "$GOC"/supabase/gia-lap/*.sql; do chay "$f"; done
for f in "$GOC"/supabase/migrations/*.sql; do chay "$f"; done
if [ -n "${SAU_MIGRATION:-}" ]; then chay "$SAU_MIGRATION"; fi

if [ "$CHI_DUNG" = 1 ]; then
  # Dữ liệu mẫu nạp trong một giao dịch, để ràng buộc kiểm lúc commit (tiền từng đêm) thấy đủ dữ liệu.
  for f in "$GOC"/supabase/seed/*.sql; do
    [ -e "$f" ] || continue
    "${PSQL[@]}" -1 -f "$f" >/dev/null 2>"$TMP/loi.txt" || { echo "LỖI khi nạp $f:"; cat "$TMP/loi.txt"; exit 1; }
  done
  echo "Đã dựng database $DB từ migration và nạp dữ liệu mẫu."
  exit 0
fi

chay "$GOC/tests/db/00_khung.sql"
[ -e "$GOC/tests/db/01_helpers.sql" ] && chay "$GOC/tests/db/01_helpers.sql"

QUA=0; HONG=0; LOI_FILE=0
for f in "$GOC"/tests/db/[1-9]*.sql; do
  [ "$(basename "$f")" = "01_helpers.sql" ] && continue
  ra="$TMP/ra.txt"
  if ! { echo "begin;"; echo "set client_min_messages = notice;"; cat "$f"; echo; echo "rollback;"; } \
       | "${PSQL[@]}" >"$ra" 2>&1; then
    LOI_FILE=$((LOI_FILE+1))
    echo "LỖI FILE $(basename "$f"):"; grep -v '^NOTICE:  \(not \)\?ok - ' "$ra" | head -20
  fi
  while IFS= read -r dong; do
    kq="${dong#NOTICE:  }"
    if [ -n "$LOC" ] && [[ "$kq" != *"$LOC"* ]]; then continue; fi
    case "$kq" in
      "not ok - "*) HONG=$((HONG+1)); echo "HỎNG $(basename "$f"): ${kq#not ok - }" ;;
      "ok - "*) QUA=$((QUA+1)); [ -n "${CHI_TIET:-}" ] && echo "qua  ${kq#ok - }" ;;
    esac
  done < <(grep '^NOTICE:  \(not \)\?ok - ' "$ra" || true)
done

# Dữ liệu mẫu phải nạp được vào database vừa dựng (EN2-TA3).
for f in "$GOC"/supabase/seed/*.sql; do
  [ -e "$f" ] || continue
  if ! { echo "begin;"; cat "$f"; echo; echo "rollback;"; } | "${PSQL[@]}" >"$TMP/seed.txt" 2>&1; then
    LOI_FILE=$((LOI_FILE+1)); echo "LỖI dữ liệu mẫu $(basename "$f"):"; head -20 "$TMP/seed.txt"
  fi
done

echo "Test database: $QUA qua, $HONG hỏng, $LOI_FILE file lỗi.${LOC:+ (lọc: $LOC)}"
[ "$HONG" = 0 ] && [ "$LOI_FILE" = 0 ] && [ $((QUA+HONG)) -gt 0 ]
