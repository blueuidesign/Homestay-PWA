# Scripts

| File | Làm gì | Chạy ở đâu |
| --- | --- | --- |
| `test-db.sh` | Dựng database từ migration và seed, chạy `tests/db/t_*.sql` | Máy dev, CI |
| `thu-lam-hong.sh` | Cố ý làm hỏng từng luật quyền, tiền, chặn trùng; test phải báo đỏ. Mỗi luật mới thêm một dòng | Máy dev, CI |
| `bang-cot.sh` | Sinh `docs/tu-sinh/Bang_va_cot.md` từ database vừa dựng. Chạy sau mỗi lần thêm migration, commit file sinh ra | Máy dev; CI kiểm file trong repo khớp |
| `kiem-tai-lieu.py` | Kiểm tài liệu tự nhất quán: mỗi tiêu chí thuộc một story, mã được nhắc tới đều tồn tại, đường dẫn tồn tại, không còn chữ trỏ tới cấu trúc cũ | Máy dev, CI |

Ba script đầu cần Postgres 16 và `psql`: `PGHOST=localhost PGUSER=postgres PGPASSWORD=… scripts/test-db.sh`.
