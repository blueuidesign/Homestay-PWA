#!/usr/bin/env bash
# EN6 · Sao lưu đêm (YC15.2, YC15 "Sao lưu đêm"). Xuất database, kiểm kích thước và đủ bảng, ghi lịch tự động, rồi đẩy lên
# nơi cất đã mã hóa (rclone crypt) và xóa bản cũ hơn 60 ngày. Kiểm hỏng thì thoát 1 trước khi đẩy, nên không đè bản tốt.
#
# Biến: DB_URL (chuỗi kết nối, bắt buộc), REMOTE (mục rclone đã mã hóa, ví dụ gdrive-mahoa:), FOLDER (thư mục trên nơi cất),
#   OUT (thư mục ghi file, mặc định thư mục tạm), MIN_KB (kích thước tối thiểu, mặc định 50), GIU_NGAY (mặc định 60),
#   KHONG_DAY=1 chỉ xuất và kiểm, không đẩy (dùng khi thử trên máy).
# Không in dữ liệu ra log: chỉ in tên file, kích thước, số bảng.
set -euo pipefail
GOC="$(cd "$(dirname "$0")/.." && pwd)"
: "${DB_URL:?Thiếu DB_URL}"
OUT="${OUT:-$(mktemp -d)}"
MIN_KB="${MIN_KB:-50}"
GIU_NGAY="${GIU_NGAY:-60}"
NGAY="$(TZ=Asia/Ho_Chi_Minh date +%Y-%m-%d_%H%M)"
FILE="$OUT/backup_$NGAY.dump"
CRON="$OUT/backup_${NGAY}_cron.csv"

# 1. Xuất: dữ liệu người dùng ở public, tài khoản ở auth, danh mục file ở storage (ảnh nằm ở kho, xem sổ tay mục 2).
pg_dump --format=custom --no-owner --no-privileges --schema=public --schema=auth --schema=storage \
  --file="$FILE" "$DB_URL"

# 2. Kiểm kích thước (YC15.2-NT2).
KB=$(( $(stat -c %s "$FILE") / 1024 ))
if [ "$KB" -lt "$MIN_KB" ]; then
  echo "LỖI sao lưu: file chỉ có ${KB} KB (tối thiểu ${MIN_KB} KB). Không đẩy, giữ nguyên các bản cũ." >&2
  exit 1
fi

# 3. Kiểm đủ bảng (YC15.2-NT2): mọi bảng public mà migration tạo phải có trong file.
CAN=$(grep -ohiE "create table (if not exists )?public\.[a-z_0-9]+" "$GOC"/supabase/migrations/*.sql | sed -E 's/.*public\.//I' | sort -u)
CO=$(pg_restore --list "$FILE" | awk '$4=="TABLE" && $5=="public" {print $6}' | sort -u)
THIEU=$(comm -23 <(echo "$CAN") <(echo "$CO") || true)
if [ -n "$THIEU" ]; then
  echo "LỖI sao lưu: thiếu bảng $(echo "$THIEU" | tr '\n' ' '). Không đẩy, giữ nguyên các bản cũ." >&2
  exit 1
fi
SO_BANG=$(echo "$CO" | grep -c . || true)

# 4. Lịch tự động (YC15 "Dữ liệu"): ghi lại để tạo lại khi khôi phục.
if [ "$(psql -X -At "$DB_URL" -c "select count(*) from pg_namespace where nspname = 'cron'")" = 1 ]; then
  psql -X -q "$DB_URL" -c "\copy (select jobname, schedule, command from cron.job order by jobname) to '$CRON' csv header"
else
  echo "jobname,schedule,command" > "$CRON"
fi

echo "Sao lưu đạt kiểm: $(basename "$FILE"), ${KB} KB, ${SO_BANG} bảng public."
[ "${KHONG_DAY:-}" = 1 ] && { echo "KHONG_DAY=1: không đẩy lên nơi cất."; exit 0; }

# 5. Đẩy lên nơi cất (rclone crypt mã hóa trên đường đi) rồi xóa bản cũ hơn GIU_NGAY ngày (YC15.2-NT1).
: "${REMOTE:?Thiếu REMOTE}"
DICH="${REMOTE}${FOLDER:-home247-backup}"
rclone copy "$FILE" "$DICH/" --quiet
rclone copy "$CRON" "$DICH/" --quiet
rclone delete "$DICH/" --min-age "${GIU_NGAY}d" --quiet
echo "Đã đẩy lên nơi cất và xóa bản cũ hơn ${GIU_NGAY} ngày."
