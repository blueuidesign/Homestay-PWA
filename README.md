# Home247 · Lịch phòng Hạ Long (bản PWA)

App web cài được trên điện thoại cho chủ nhà homestay và sale ở Hạ Long. Chủ nhà ghi lịch và giá, chia sẻ cho sale. Sale tra căn trống, cộng giá của mình, gửi ảnh và giá cho khách.

- Giao diện: React, Vite, TypeScript, PWA. Deploy trên Vercel.
- Máy chủ: Supabase (Postgres, RLS, hàm database, Storage).

## Chạy thử trên máy

```bash
npm install
npm run dev        # mở địa chỉ Vite in ra; app chạy bằng dữ liệu mẫu, không cần Supabase
```

## Kiểm thử

```bash
npm run typecheck && npm test && npm run build
npm run e2e                                             # cần đã build
PGHOST=localhost PGUSER=postgres PGPASSWORD=… scripts/test-db.sh    # cần Postgres 16 và psql
PGHOST=localhost PGUSER=postgres PGPASSWORD=… scripts/thu-lam-hong.sh
python3 scripts/kiem-tai-lieu.py
```

## Đọc gì trước

1. `CLAUDE.md`: bản đồ repo và luật không được phá (viết cho Claude, người đọc cũng dùng được).
2. `docs/README.md`: mục lục tài liệu.
3. `docs/stories/README.md`: việc cần làm, theo thứ tự.
4. `VIEC_TAY_CUA_TUNG.md`: việc cần tài khoản GitHub, Vercel, Supabase.

Repo công khai. Không đưa bí mật, email, số điện thoại thật vào đây.
