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
set -uo pipefail

GOC="$(cd "$(dirname "$0")/.." && pwd)"
DS="$GOC/scripts/thu-lam-hong.txt"
LOC="${1:-}"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

DAT=0; KHONG_DAT=0; n=0
while IFS= read -r dong || [ -n "$dong" ]; do
  case "$dong" in ''|'#'*) continue ;; esac
  ma="$(echo "${dong%%|*}" | xargs)"
  cau="${dong#*|}"
  if [ -n "$LOC" ] && [[ "$dong" != *"$LOC"* ]]; then continue; fi
  n=$((n+1))
  echo "$cau" > "$TMP/hong.sql"
  ra="$(TEST_DB=home247_thu_hong SAU_MIGRATION="$TMP/hong.sql" "$GOC/scripts/test-db.sh" "$ma" 2>&1)"
  if echo "$ra" | grep -q '^HỎNG '; then
    DAT=$((DAT+1)); echo "đạt  [$ma] test đỏ khi phá:$cau"
  else
    KHONG_DAT=$((KHONG_DAT+1)); echo "HỎNG [$ma] test vẫn xanh (hoặc không chạy) khi phá:$cau"
    echo "$ra" | grep -E '^(LỖI|Test database)' | head -5 | sed 's/^/      /'
  fi
done < "$DS"

echo "Thử làm hỏng: $DAT đạt, $KHONG_DAT không đạt, trên $n phép thử."
[ "$KHONG_DAT" = 0 ] && [ "$n" -gt 0 ]
