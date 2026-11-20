#!/usr/bin/env bash
# EN6 · Thử sao lưu và khôi phục trên Postgres của máy hay CI (YC15.2-NT2, YC15.2-NT3). Không đụng nơi cất, không đụng production.
# Dựng database có dữ liệu mẫu DLM, sao lưu (KHONG_DAY=1) phải đạt; bỏ một bảng hay đặt ngưỡng kích thước quá cao thì phải báo lỗi;
# khôi phục vào database mới dựng từ migration phải ra cùng số dòng. Cần PGHOST, PGUSER, PGPASSWORD như scripts/test-db.sh.
set -euo pipefail
GOC="$(cd "$(dirname "$0")/.." && pwd)"
U="postgresql://${PGUSER:-postgres}:${PGPASSWORD:-}@${PGHOST:-localhost}:${PGPORT:-5432}"
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
DAT=0; HONG=0
ok() { echo "ok - $1"; DAT=$((DAT+1)); }
hong() { echo "HỎNG - $1"; HONG=$((HONG+1)); }

TEST_DB=hs_sl_goc "$GOC/scripts/test-db.sh" --chi-dung >/dev/null
TEST_DB=hs_sl_dich "$GOC/scripts/test-db.sh" --chi-dung >/dev/null

if DB_URL="$U/hs_sl_goc" OUT="$TMP/a" KHONG_DAY=1 bash -c 'mkdir -p "$OUT" && "$0"' "$GOC/scripts/sao-luu.sh" >/dev/null 2>&1; then
  ok "YC15.2-NT1 sao lưu database đủ bảng, đủ cỡ thì đạt kiểm, có file lịch tự động"
else hong "YC15.2-NT1 sao lưu database đủ bảng, đủ cỡ thì đạt kiểm"; fi
[ -s "$(ls "$TMP"/a/*_cron.csv 2>/dev/null | head -1)" ] && ok "YC15 Dữ liệu: có file lịch tự động đi kèm" || hong "YC15 Dữ liệu: thiếu file lịch tự động"

if DB_URL="$U/hs_sl_goc" OUT="$TMP/b" KHONG_DAY=1 MIN_KB=999999 bash -c 'mkdir -p "$OUT" && "$0"' "$GOC/scripts/sao-luu.sh" >/dev/null 2>&1; then
  hong "YC15.2-NT2 bản xuất nhỏ bất thường mà không báo lỗi"
else ok "YC15.2-NT2 bản xuất nhỏ bất thường thì báo lỗi, không đẩy"; fi

PGOPTIONS="-c client_min_messages=warning" psql -X -q -d postgres -c "drop database if exists hs_sl_thieu with (force)" -c "create database hs_sl_thieu template hs_sl_goc" >/dev/null
psql -X -q -d hs_sl_thieu -c "drop table public.thong_bao cascade" >/dev/null 2>&1
if DB_URL="$U/hs_sl_thieu" OUT="$TMP/c" KHONG_DAY=1 MIN_KB=1 bash -c 'mkdir -p "$OUT" && "$0"' "$GOC/scripts/sao-luu.sh" >/dev/null 2>&1; then
  hong "YC15.2-NT2 bản xuất thiếu bảng mà không báo lỗi"
else ok "YC15.2-NT2 bản xuất thiếu bảng thì báo lỗi, không đẩy"; fi

if "$GOC/scripts/khoi-phuc-thu.sh" "$(ls "$TMP"/a/*.dump | head -1)" "$U/hs_sl_dich" "$U/hs_sl_goc" >/dev/null 2>&1; then
  ok "YC15.2-NT3 khôi phục vào database mới dựng từ migration ra cùng số dòng mọi bảng"
else hong "YC15.2-NT3 khôi phục thử không khớp số dòng"; fi

for d in hs_sl_goc hs_sl_dich hs_sl_thieu; do psql -X -q -d postgres -c "drop database if exists $d with (force)" >/dev/null; done
echo "Thử sao lưu: $DAT đạt, $HONG hỏng."
[ "$HONG" = 0 ]
