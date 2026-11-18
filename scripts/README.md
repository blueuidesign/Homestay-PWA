# scripts · Công cụ quản lý repo

| File | Làm gì |
|---|---|
| plan.py | Sinh work/plan/plan.json, KE-HOACH.md và bang.json từ item và lịch. `--check` để chỉ kiểm |
| kiem.py | Kiểm repo theo CL2, CL3, CL12 |
| trich.py | In đúng các mục được hỏi theo mã |
| trich-man.py | In HTML, chữ hoặc ảnh chụp một màn của canvas |
| goi.py | Soạn gói việc work/goi/<mã item>.md cho agent phụ: chép nguyên văn đúng phần item cần (skill soan-viec-cho-subagent) |
| log-tong.py | Đọc log phiên do hook ghi-log-phien.py ghi, tóm theo item và người |
| hook/ | Hook Claude Code khai trong .claude/settings.json |
| tests/ | Test của kiem.py và trich.py: `python3 -m unittest discover -s scripts/tests -v` |

Cần Python 3 và PyYAML (`pip install pyyaml`).

## plan.py · bang.json
Ngoài plan.json và KE-HOACH.md, sinh thêm `work/plan/bang.json` [tự sinh]: mỗi item backlog một dòng, gồm cả done/. Có id, loai, tieu_de, trang_thai, nguoi, cha, truoc, file, pr, số task đã tick trên tổng theo loại (Code, Test tay, Nghiệm thu, khác), co_code, và dang_cho: "Đức test tay" (cho-test), "Tùng nghiệm thu" (cho-nghiem-thu), "Bị chặn bởi X" (item trong truoc chưa xong), "Đang code" (dang-lam), còn lại "–". PR chờ Tùng duyệt không biết được khi không có mạng nên chưa tính.
```sh
python3 scripts/plan.py
```

## kiem.py
Luật: front-matter, trang-thai, trung-ma, lien-ket (cha, truoc, thuc_hien), mo (`[MỞ: X]` chỉ trỏ tới QD cho-chot, câu hỏi YCn-Hm đang mở trong work/cau-hoi.md, hoặc item chưa xong/huy), xong-ngoai-done, và chỉ khi có `--diff`: rev (file docs/ đổi mà rev không tăng), tu-sinh (dòng [tự sinh] bị sửa tay).
Mặc định chỉ cảnh báo, luôn thoát 0. `--chan` có lỗi thì thoát 1. `--diff BASE` chỉ kiểm file đổi so với BASE và luật `[MỞ]` chỉ áp cho dòng mới thêm. CLAUDE.md, .claude/, docs/process/ không bị kiểm luật `[MỞ]` vì đó là chỗ tả luật.
```sh
python3 scripts/kiem.py                          # cả repo, cảnh báo
python3 scripts/kiem.py --chan --diff origin/main # như CI và hook trước push
python3 scripts/kiem.py work/backlog/US10-*.md    # chỉ vài file
python3 scripts/kiem.py --tom-tat                 # chỉ số lỗi theo luật
```

## trich.py
In mục theo mã thay vì đọc cả file: YC4.2, YC4.1.2, YC4.1-NT3, QT1.1, QT1.1-VD1, QD21 (chỉ đầu file và mục Quyết định), HV4, DLM.3, CL2.8, YC4-H6 (work/cau-hoi.md), và `file#mục` (tiêu đề so theo đầu chuỗi). Mặc định kèm một bậc các QT, QD, HV và đích `[MỞ: ...]` nhắc trong đoạn trích (`--khong-theo` để tắt). Cuối luôn có mục lục của mỗi file nguồn. Mã không có thì thoát 2.
```sh
python3 scripts/trich.py YC4.2 QT1.1 "thiet-ke-db.md#3. Bất biến"
```

## trich-man.py
Cắt phần HTML của một màn từ docs/design/canvas/home247-canvas.html (khối có `id` bằng mã màn), kèm chỉ dẫn tìm YC mô tả màn đó. `--chu` chỉ in chữ hiện trên màn. `--anh OUT.png` chụp riêng màn đó bằng Playwright (Chromium), mất vài giây vì canvas lớn; canvas là ảnh dựng sẵn nên chỉ chụp được trạng thái đã vẽ thành màn riêng.
```sh
python3 scripts/trich-man.py CN3-02 --chu
python3 scripts/trich-man.py CN3-02 --anh /tmp/CN3-02.png
```

## hook/
Khai trong .claude/settings.json, Claude Code tự chạy, kể cả trong agent phụ.
- `truoc-push.sh` (trước `git push`): đẩy lên main mà commit chạm src/, tests/, supabase/, docs/process/, CLAUDE.md, .claude/, .github/, hoặc đổi `trang_thai:` của YC, QT, QD thì chặn và bảo dùng nhánh và PR (CL4.7). Luôn chạy kiem.py chế độ cảnh báo trên file đổi.
- `truoc-gop.sh` (trước `gh pr merge`, `gh api .../pulls/<số>/merge`): đọc check run của commit đầu PR, chưa có lượt CI thành công thì chặn. Không gọi được GitHub cũng chặn. Bỏ kiểm chỉ khi Tùng cho phép: mở Claude Code với `HOME247_BO_KIEM_CI=1 claude`.
- `dau-phien.sh` (đầu phiên): số item theo trạng thái, trần chờ người (item có code ở cho-test cộng cho-nghiem-thu, tối đa 6), số lỗi kiem.py.

Thử tay một hook:
```sh
echo '{"tool_input":{"command":"git push origin HEAD:main"},"cwd":"'"$PWD"'"}' | bash scripts/hook/truoc-push.sh; echo $?
```
CI ở .github/workflows/kiem.yml hiện chạy kiem.py và test của scripts. EN dựng nền thêm job app và database.
