# Kịch bản kiểm tay

Mỗi story có một file `US<n>.md`. Đức (hoặc Tùng) chạy trên điện thoại thật sau khi PR của story đã merge. Máy không kiểm được các thứ này: dễ dùng không, chữ dễ hiểu không, bấm một tay được không, có chạy trên iPhone và Android thật không.

## Cách chạy

1. Mở bản xem thử của Vercel (trỏ vào staging) trên điện thoại. Nạp dữ liệu mẫu trước: `supabase/staging/README.md`.
2. Tài khoản thử: `hoa@home247.test` (Chị Hoa, chủ nhà), `tuan@home247.test` (Anh Tuấn, chủ nhà), `hung@home247.test` (Sale Hùng), `lan@home247.test` (Sale Lan), `nga@home247.test` (Sale Nga). Mật khẩu ở chỗ cất bí mật, không ở repo.
3. Chạy nhanh: chỉ các kịch bản gắn `[Chính]`, khoảng 5 phút. Chạy đủ: mọi kịch bản.
4. Kịch bản gắn `[Zalo]` chỉ chạy ở bản Zalo. Bước nào nói tới cửa sổ hay quyền của Zalo thì làm theo `docs/luat-chung/PWA.md`.

## Ghi kết quả

Kết quả không ghi vào file kịch bản (file kịch bản là hướng dẫn, dùng lại nhiều lần). Ghi một bình luận vào PR của story:

```
Kiểm tay US12 · 20/11/2026 · Đức · iPhone 13 Safari, Samsung A54 Chrome
Đạt: KB1 đến KB20, KB22
Không đạt: KB21 (chip "Tùy chọn" không mở lịch)
Khó dùng: nút "Sửa" quá nhỏ khi cầm một tay
```

Không đạt thì mở story loại "lỗi", ghi mã kịch bản và mã tiêu chí. Khó dùng thì ghi một story loại "tính năng" hoặc "thiết kế" ở trạng thái chưa làm để Tùng xếp thứ tự.

## Nhãn

`[Chính]` luồng chính · `[Biên]` ca biên · `[Quyền]` thử vi phạm quyền bằng tay · `[Mạng]` mất mạng, mạng chậm · `[Lỗi]` máy chủ báo lỗi · `[Zalo]` chỉ có ở bản Zalo.

## Viết kịch bản mới

Mỗi kịch bản: Mục đích, Chuẩn bị, Làm (từng bước bấm), Mong đợi (thấy gì), Nguồn (mã tiêu chí). Số liệu lấy từ `docs/luat-chung/Du_lieu_mau.md`. Tiêu chí chỉ kiểm được bằng lệnh gửi thẳng tới database thì không viết kịch bản tay; test database lo.

Các kịch bản hiện có được chuyển từ bản Zalo: số liệu theo ngày 07/10/2026 của bộ mẫu, trong khi dữ liệu mẫu staging đặt giá theo tháng hiện tại. Khi chạy lần đầu cho một story, đổi ngày trong kịch bản sang ngày còn trong tương lai và sửa file trong cùng PR.
