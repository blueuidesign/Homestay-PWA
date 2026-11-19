---
id: QD17
tieu_de: Claude được merge PR khi Tùng bảo
trang_thai: da-chot
loai: san-pham
nguoi_chot: tung
ngay_chot: 2026-11-18
thay_cho: [QD1]
nguon: Quyet_dinh.md của bản PWA (QD17)
anh_huong: []
rev: 1
---
# QD17 · Claude được merge PR khi Tùng bảo

## Câu hỏi
luật cũ (QD1, giữ lại ở QD15) cấm Claude merge, kèm lớp chặn `gh pr merge` trong `.claude/settings.json`. Tùng thấy mỗi lần phải tự vào GitHub bấm là chậm, và lời bảo trong phiên đã đủ rõ.

## Phương án
(A) giữ cấm, Tùng luôn tự bấm; (B) Claude merge khi Tùng bảo, có danh sách điều kiện Claude phải soát; (C) Claude tự merge mọi PR khi CI xanh.

## Quyết định
B. Người chốt: Tùng ("sửa lại luật cho phép bạn merge nhé", 18/11/2026, ngay sau khi bảo "merge đi" với PR #1). Lý do chọn B chứ không C: Claude đã chọn cách đọc hẹp hơn, vì CI xanh chỉ chứng minh những gì đã có test; bước Tùng xem bản xem thử trên điện thoại và bảo merge vẫn là chỗ người đối chiếu. Tùng muốn C thì nói, sửa mục này.

## Hệ quả
`CLAUDE.md`, `docs/QUY_TRINH.md` mục 1, 9, 10, phụ lục B; bỏ dòng chặn `gh pr merge` trong `.claude/settings.json`; `VIEC_TAY_CUA_TUNG.md` bước 6. Lời của Đức không đủ để Claude merge.

Thay cho: điểm "người merge chứ Claude không tự merge" của QD1. Trạng thái gốc: Đang hiệu lực.

## Lịch sử sửa đổi
| Rev | Ngày | Người | Commit hoặc PR | Thay đổi | Mục bị đổi |
|---|---|---|---|---|---|
| r1 | 2026-11-18 | Claude | QD21-lam-lai-tai-lieu | Tách từ `docs/decisions/`, đổi mã QD17 thành QD17 | Cả file |
