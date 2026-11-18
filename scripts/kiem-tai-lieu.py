#!/usr/bin/env python3
"""Kiểm tài liệu của repo tự nhất quán. CI chạy ở mỗi PR. Thoát 1 nếu có lỗi.

Mỗi phép kiểm mang mã checkpoint (C1 đến C11), danh sách ở docs/QUY_TRINH.md mục 3b.
Phần nằm trong khối mã (``` … ```) và trong dấu `…` là ví dụ, không kiểm mã và thẻ MỞ.
"""
import glob, os, re, sys

os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
loi, canh_bao = [], []
def doc(p): return open(p, encoding='utf-8').read()
def bo_vi_du(s):
    s = re.sub(r'(?ms)^```.*?^```', '', s)
    return re.sub(r'`[^`\n]*`', '', s)

MD = sorted(p for p in glob.glob('**/*.md', recursive=True) if not p.startswith(('node_modules/', 'dist/')))
DONG_BANG = ('docs/tu-sinh/Doi_ma_gop.md', 'docs/zalo/', 'docs/phap-ly/', 'docs/bao-mat.md', 'docs/tu-sinh/Doi_ma_YC.md', 'docs/tham-khao/')
CHI_THEM = ('docs/Quyet_dinh.md',)          # mục cũ giữ nguyên chữ (QD-018)
SONG = [p for p in MD if not p.startswith(DONG_BANG)]
CODE = sorted(p for p in glob.glob('src/**/*.ts*', recursive=True)) + sorted(glob.glob('tests/**/*.sql', recursive=True)) + sorted(glob.glob('supabase/**/*.sql', recursive=True)) + sorted(glob.glob('tests/e2e/*.ts'))
stories = sorted(glob.glob('docs/stories/US*.md'), key=lambda p: int(re.search(r'US(\d+)', p).group(1)))
US = {os.path.basename(p).split('-')[0] for p in stories}

# ---- Các tập mã có thật ----
CO_TEST = set()
for _p in CODE:
    CO_TEST |= set(re.findall(r'\b(?:US\d+|HV\d+)-NT\d+\b', open(_p, encoding='utf-8').read()))
nt = {}
for p in stories:
    for m in re.finditer(r'(?m)^- \*\*((?:US\d+|HV\d+)-NT\d+)\*\*', doc(p)):
        nt.setdefault(m.group(1), []).append(os.path.basename(p))
ch = doc('docs/Cau_hoi_mo.md')
MA_HOI = r'(?:CH-\d{3}|US\d+-H\d+|LC-H\d+|PQ-H\d+|HV-H\d+)'
co_hoi = set(re.findall(r'(?m)^\| (' + MA_HOI + r') \|', ch))
qd = set(re.findall(r'(?m)^## (QD-\d+)', doc('docs/Quyet_dinh.md')))
qt = set(re.findall(r'(?m)^#+ (QT\d+(?:\.\d+)?)\b', doc('docs/luat-chung/QT.md'))) | set(re.findall(r'\b(QT\d+\.\d+-VD\d+)\b', doc('docs/luat-chung/QT.md')))
pq = set(re.findall(r'(?m)^## (PQ\d+)\b', doc('docs/luat-chung/PQ.md')))
hv = set(re.findall(r'(?m)^#+ (HV\d+)\b', doc('docs/luat-chung/HV.md')))
gd = set(re.findall(r'(?m)^\| (GD\d+) \|', ch))
dlm = set(re.findall(r'(?m)^## (DLM\.\d+)\b', doc('docs/luat-chung/Du_lieu_mau.md')))
man = set(re.findall(r'(?m)^\| ([A-Z]+\d[\w-]*) \|', doc('docs/thiet-ke/README.md')))

# C1. Không còn mã YC
for p in SONG + CODE:
    if p in CHI_THEM: continue
    for c in sorted(set(re.findall(r'\bYC\d+(?:\.\d+)*(?:-NT\d+|-H\d+)?\b', doc(p)))):
        loi.append(f'C1 {p}: còn mã của bản Zalo {c} (QD-018; tra docs/tu-sinh/Doi_ma_YC.md)')

# C2. Mã được nhắc tới đều có thật
for p in SONG:
    if p in CHI_THEM: continue
    s = bo_vi_du(doc(p))
    for c in set(re.findall(r'\bQD-\d+\b', s)) - qd: loi.append(f'C2 {p}: {c} không có trong Quyet_dinh.md')
    for c in set(re.findall(r'\bCH-\d{3}\b', s)) - co_hoi: loi.append(f'C2 {p}: {c} không có dòng trong Cau_hoi_mo.md')
    for c in set(re.findall(r'\bQT\d+\.\d+(?:-VD\d+)?\b', s)) - qt: loi.append(f'C2 {p}: {c} không có trong luat-chung/QT.md')
    for c in set(re.findall(r'\bPQ\d+\b', s)) - pq: loi.append(f'C2 {p}: {c} không có trong luat-chung/PQ.md')
    for c in set(re.findall(r'\bHV\d+\b', s)) - hv: loi.append(f'C2 {p}: {c} không có trong luat-chung/HV.md')
    for c in set(re.findall(r'\bGD\d+\b', s)) - gd: loi.append(f'C2 {p}: giả định {c} không có dòng trong Cau_hoi_mo.md')
    for c in set(re.findall(r'\bDLM\.\d+\b', s)) - dlm: loi.append(f'C2 {p}: {c} không có trong luat-chung/Du_lieu_mau.md')
    for c in set(re.findall(r'\bUS\d+\b', s)) - US - {'US31'}: loi.append(f'C2 {p}: {c} không có story')
    for c in set(re.findall(r'\b(?:US\d+|HV\d+)-NT\d+\b', s)) - set(nt):
        (loi if p.startswith(('docs/stories/', 'tests/kich-ban/')) else canh_bao).append(f'C2 {p}: tiêu chí {c} không được định nghĩa ở story nào')
    if p.startswith('docs/stories/'):
        for c in sorted(set(re.findall(r'(?<![\w-])((?:A|CN|S|P)\d{1,2}(?:-[A-Z]?\d+[a-z]?)*)\b', s)) - man):
            canh_bao.append(f'C2 {p}: mã màn {c} không có trong docs/thiet-ke/README.md')
for p in CODE:
    for c in set(re.findall(r'\b(?:US\d+|HV\d+)-NT\d+\b', doc(p))) - set(nt):
        loi.append(f'C2 {p}: test hay code nhắc tiêu chí {c} không còn ở story nào (sửa story thì sửa test cùng PR, QUY_TRINH 5.3)')

# C3. Đường dẫn tồn tại
for p in SONG:
    s = doc(p)
    for m in re.finditer(r'`((?:docs|tests|scripts|supabase|src|data-fixes|\.github)/[\w./\-]+?|CLAUDE\.md|VIEC_TAY_CUA_TUNG\.md)`', s):
        d = m.group(1).rstrip('.')
        if '<' in d or '*' in d or '…' in d: continue
        if not os.path.exists(d): loi.append(f'C3 {p}: đường dẫn không tồn tại: {d}')
    for m in re.finditer(r'\]\((?!https?:|#|mailto:)([^)\s]+)\)', s):
        d = os.path.normpath(os.path.join(os.path.dirname(p), m.group(1).split('#')[0]))
        if not os.path.exists(d): loi.append(f'C3 {p}: link tới file không có: {m.group(1)}')

# C4. Chữ trỏ tới cấu trúc cũ
CU = [r'docs/nguon', r'Dac_ta\.md', r'Hanh_vi_chung\.md', r'User_Stories\.md', r'docs/product', r'docs/architecture', r'docs/phan-tich',
      r'docs/design/', r'docs/security', r'docs/external', r'work/backlog', r'work/cau-hoi', r'\btasks/', r'server\.md', r'\bapi/[a-z-]+\.md',
      r'tests/kb/', r'TK-THU-\d', r'rút quyền', r'quyen_gia_tung_dem', r'"Giá từng đêm" (?:tắt|bật)', r'tắt "Giá từng đêm"',
      r'\bcâu hỏi (?:mở )?\d+\b']
for p in SONG:
    if p in CHI_THEM: continue
    s = bo_vi_du(doc(p))
    for c in CU:
        if re.search(c, s): loi.append(f'C4 {p}: còn chữ trỏ tới cấu trúc cũ: {c}')
    if re.search(r'Mini App', s) and p not in ('CLAUDE.md', 'docs/luat-chung/PWA.md', 'docs/Mo_ta_du_an.md', 'docs/Quyet_dinh.md', 'docs/Ghi_chu_code.md', 'VIEC_TAY_CUA_TUNG.md', 'docs/thiet-ke/README.md', 'README.md', 'docs/README.md', 'docs/Nguyen_ly_lam_viec.md'):
        canh_bao.append(f'C4 {p}: nhắc "Mini App" (bản Zalo); kiểm xem có đúng chỗ không')

# C5. Không trỏ ra ngoài repo
for p in MD:
    for c in re.findall(r'(/home/claude|/tmp/claude|scratchpad|zalo-miniapp|/mnt/user-data)', doc(p)):
        loi.append(f'C5 {p}: trỏ ra ngoài repo: {c}')

# C6. Mỗi tiêu chí định nghĩa đúng một lần; không tiêu chí nào trong bảng đổi mã bị mất
for ma, ds in nt.items():
    if len(ds) > 1: loi.append(f'C6 tiêu chí {ma} được định nghĩa ở nhiều story: {", ".join(ds)}')
if os.path.exists('docs/tu-sinh/Doi_ma_YC.md'):
    for c in re.findall(r'(?m)^\| YC[\d.]+-NT\d+ \| (US\d+-NT\d+) \|', doc('docs/tu-sinh/Doi_ma_YC.md')):
        if c not in nt: loi.append(f'C6 tiêu chí {c} (bảng đổi mã) không còn ở story nào')

# C7. Thẻ MỞ có dòng; dòng câu hỏi còn chỗ dùng
dung = set()
for p in SONG + CODE:
    s = bo_vi_du(doc(p)) if p.endswith('.md') else doc(p)
    for m in re.finditer(r'\[MỞ:?\s*([^\]]*)\]', s):
        mas = re.findall(MA_HOI, m.group(1))
        if not mas and p.endswith('.md'): loi.append(f'C7 {p}: thẻ MỞ không có mã: [MỞ: {m.group(1)[:60]}]')
        for c in mas:
            if c not in co_hoi: loi.append(f'C7 {p}: [MỞ: {c}] không có dòng trong docs/Cau_hoi_mo.md')
    if p != 'docs/Cau_hoi_mo.md': dung |= set(re.findall(MA_HOI, s))
    else:
        for dong in s.split('\n'):
            dung |= set(re.findall(MA_HOI, re.sub(r'^\| ' + MA_HOI + r' \|', '', dong)))
cho = re.split(r'(?m)^## Đã trả lời', ch)[0]
for c in sorted(set(re.findall(r'(?m)^\| (' + MA_HOI + r') \|', cho))):
    if c not in dung and not c.startswith('CH-00'): canh_bao.append(f'C7 docs/Cau_hoi_mo.md: câu hỏi {c} không còn chỗ nào dùng; xóa dòng hoặc chuyển xuống "Đã trả lời"')

# C8. Mục lục story khớp
ml = doc('docs/stories/README.md')
for p in stories:
    ten = os.path.basename(p); ma = ten.split('-')[0]
    m = re.search(r'(?m)^\| \[' + ma + r'\]\(' + re.escape(ten) + r'\) \|(.*)$', ml)
    if not m: loi.append(f'C8 {ten} không có dòng trong docs/stories/README.md'); continue
    tt = re.search(r'(?m)^- Trạng thái: (.+)$', doc(p))
    if not tt: loi.append(f'C8 {ten} thiếu dòng "- Trạng thái:"'); continue
    tth = tt.group(1).strip()
    if tth not in ('chờ code', 'chờ test', 'xong'): loi.append(f'C8 {ten}: trạng thái "{tth}" không thuộc ba trạng thái chờ code, chờ test, xong')
    s_ = doc(p)
    dong_td = re.findall(r'(?m)^- .*· (chờ code|chờ test)\s*$', (re.search(r'(?ms)^## Thay đổi chưa xong\n(.*?)(?=^## |\Z)', s_) or [None, ''])[1] if re.search(r'(?m)^## Thay đổi chưa xong', s_) else '')
    duoi = re.findall(r'(?m)^- \*\*(?:US\d+|HV\d+)-NT\d+\*\*.*· (chờ code|chờ test)\s*$', s_)
    can = 'chờ code' if 'chờ code' in dong_td + duoi else ('chờ test' if 'chờ test' in dong_td + duoi else None)
    if can and tth != can: loi.append(f'C8 {ten}: có phần "{can}" (mục Thay đổi chưa xong hay đuôi tiêu chí) mà trạng thái là "{tth}"')
    if duoi and not dong_td: loi.append(f'C8 {ten}: có tiêu chí mang đuôi chờ mà không có dòng nào ở "Thay đổi chưa xong"')
    if tth in ('chờ test', 'xong'):
        for m2 in re.finditer(r'(?m)^- \*\*((?:US\d+|HV\d+)-NT\d+)\*\*(.*)$', s_):
            if 'chờ code' in m2.group(2): continue
            if m2.group(1) not in CO_TEST: loi.append(f'C8 {ten}: trạng thái "{tth}" mà tiêu chí {m2.group(1)} chưa có test mang mã đó')
    if f'| {tt.group(1).strip()} |' not in m.group(1): loi.append(f'C8 {ten}: trạng thái trong file ({tt.group(1).strip()}) khác trong README')

# C9. Đặc tả thô được đánh dấu và không được làm
tho = []
for p in stories:
    s = doc(p); dt = re.search(r'(?m)^- Đặc tả: (.+)$', s)
    if not dt: loi.append(f'C9 {p}: thiếu dòng "- Đặc tả:"'); continue
    if dt.group(1).startswith('thô'):
        tho.append(os.path.basename(p).split('-')[0])
        if re.search(r'(?m)^- Trạng thái: (chờ test|xong)', s): loi.append(f'C9 {p}: đặc tả thô mà trạng thái đã chờ test hay xong (QUY_TRINH 4.2b)')
    else:
        for c in (r'(?m)^## Ai được làm và việc kéo theo', r'(?m)^## Phần của story khác'):
            if re.search(c, s): loi.append(f'C9 {p}: đã viết lại mà còn mục nguyên liệu thô')

# C11. Không email, số điện thoại thật
EMAIL_DUOC = ('example.com', 'home247.test', 'test.local', 'anthropic.com', 'zaloplatforms.com')
for p in MD + CODE:
    s = doc(p)
    for e in re.findall(r'[\w.+-]+@([\w-]+(?:\.[\w-]+)+)', s):
        if not e.lower().endswith(EMAIL_DUOC): loi.append(f'C11 {p}: email ở miền lạ ({e}). Repo công khai')
    if p.endswith('.md'):
        for so in re.findall(r'(?<![\d.])0[35789]\d{8}(?!\d)', s):
            if not so.startswith(('0900', '0999', '0912345', '0987654', '0911222', '0903555', '0904')): canh_bao.append(f'C11 {p}: số điện thoại {so}: kiểm có phải số giả không')

# Màn trên canvas
cv = doc('docs/thiet-ke/canvas/home247-canvas.html')
for c in man:
    if f'id="{c}"' not in cv: canh_bao.append(f'docs/thiet-ke/README.md: màn {c} không có hình trên canvas')

for c in canh_bao: print('CẢNH BÁO', c)
for c in loi: print('LỖI', c)
print(f'Đã kiểm {len(MD)} file tài liệu, {len(CODE)} file code và test, {len(stories)} story ({len(tho)} còn đặc tả thô), {len(nt)} tiêu chí: {len(loi)} lỗi, {len(canh_bao)} cảnh báo.')
sys.exit(1 if loi else 0)
