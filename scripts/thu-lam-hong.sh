#!/usr/bin/env bash
# Phép thử làm hỏng (thiet-ke-db.md mục 3): với mỗi dòng của scripts/thu-lam-hong.txt, dựng database thử,
# cố tình phá một bất biến bằng câu SQL của dòng đó, rồi chạy test database. Test mang mã của dòng phải ĐỎ.
# Nếu test vẫn xanh khi bất biến đã bị phá, bộ test không bảo vệ được bất biến đó: phép thử báo HỎNG.
#
# Dòng trong scripts/thu-lam-hong.txt:  <chuỗi có trong tên test phải đỏ> | <câu SQL làm hỏng>
# Dòng trống và dòng bắt đầu bằng # bị bỏ qua.
# Cách dùng: scripts/thu-lam-hong.sh            chạy mọi dòng
#            scripts/thu-lam-hong.sh KT-DB.3.2  chỉ các dòng có chuỗi này
# Biến kết nối giống scripts/test-db.sh. Database thử: home247_thu_hong.
# CHI_TIET=1 in cả phép thử đạt (mặc định chỉ in phép thử không đạt và dòng tổng, EN14).
set -uo pipefail

GOC="$(cd "$(dirname "$0")/.." && pwd)"
DS="$GOC/scripts/thu-lam-hong.txt"
LOC="${1:-}"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

# EN12: dựng database mẫu một lần từ migration; mỗi phép thử chép từ mẫu rồi chỉ chạy file test có mã của dòng.
MAU=home247_thu_hong_mau
PGOPTIONS="-c client_min_messages=warning" psql -X -q -d postgres -c "drop database if exists \"$MAU\" with (force)" >/dev/null
psql -X -q -d postgres -c "create database \"$MAU\"" >/dev/null
for f in "$GOC"/supabase/gia-lap/*.sql "$GOC"/supabase/migrations/*.sql; do
  psql -X -q -v ON_ERROR_STOP=1 --no-psqlrc -d "$MAU" -f "$f" >/dev/null 2>"$TMP/loi.txt" || { echo "LỖI khi dựng database mẫu ở $f:"; cat "$TMP/loi.txt"; exit 1; }
done

DAT=0; KHONG_DAT=0; n=0
while IFS= read -r dong || [ -n "$dong" ]; do
  case "$dong" in ''|'#'*) continue ;; esac
  ma="$(echo "${dong%%|*}" | xargs)"
  cau="${dong#*|}"
  if [ -n "$LOC" ] && [[ "$dong" != *"$LOC"* ]]; then continue; fi
  n=$((n+1))
  echo "$cau" > "$TMP/hong.sql"
  ra="$(TEST_DB=home247_thu_hong TU_MAU="$MAU" CHI_FILE_CO_MA=1 SAU_MIGRATION="$TMP/hong.sql" "$GOC/scripts/test-db.sh" "$ma" 2>&1)"
  if echo "$ra" | grep -q '^HỎNG '; then
    DAT=$((DAT+1)); if [ -n "${CHI_TIET:-}" ]; then echo "đạt  [$ma] test đỏ khi phá:$cau"; fi
  else
    KHONG_DAT=$((KHONG_DAT+1)); echo "HỎNG [$ma] test vẫn xanh (hoặc không chạy) khi phá:$cau"
    echo "$ra" | grep -E '^(LỖI|Test database)' | head -5 | sed 's/^/      /'
  fi
done < "$DS"

echo "Thử làm hỏng: $DAT đạt, $KHONG_DAT không đạt, trên $n phép thử."
[ "$KHONG_DAT" = 0 ] && [ "$n" -gt 0 ]
