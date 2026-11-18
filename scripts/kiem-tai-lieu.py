#!/usr/bin/env python3
"""Kiểm tài liệu của repo tự nhất quán (docs/QUY_TRINH.md mục 3, 4). CI chạy ở mỗi PR. Thoát 1 nếu có lỗi.

Kiểm:
 1. Mỗi tiêu chí nghiệm thu (dòng "- **<mã>-NT<số>** …") được định nghĩa ở đúng một story.
 2. Mỗi story có trong docs/stories/README.md, và trạng thái ở hai chỗ giống nhau.
 3. Mỗi thẻ [MỞ: <mã>] trỏ tới mã có trong docs/Cau_hoi_mo.md.
 4. Mỗi mã QD-xxx, CH-xxx, QTx.y, PQn, HVn, USn được nhắc tới đều tồn tại.
 5. Mỗi đường dẫn file trong dấu `…` tồn tại.
 6. Mỗi mã màn trong docs/thiet-ke/README.md có hình trên canvas.
 7. Không còn chữ trỏ tới cấu trúc tài liệu cũ; không có email lạ.
"""
import glob, os, re, sys

os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
loi, canh_bao = [], []
doc = lambda p: open(p, encoding='utf-8').read()

MD = [p for p in glob.glob('**/*.md', recursive=True) if not p.startswith(('node_modules/', 'dist/'))]
SONG = [p for p in MD if not p.startswith(('docs/zalo/', 'docs/phap-ly/')) and p != 'docs/bao-mat.md']   # tài liệu đóng băng không kiểm mã
stories = sorted(glob.glob('docs/stories/US*.md'), key=lambda p: int(re.search(r'US(\d+)', p).group(1)))

# 1. tiêu chí
nt = {}
for p in stories:
    for m in re.finditer(r'(?m)^- \*\*((?:YC[\d.]+|HV\d+|US\d+)-NT\d+)\*\*', doc(p)):
        nt.setdefault(m.group(1), []).append(os.path.basename(p))
for ma, ds in nt.items():
    if len(ds) > 1: loi.append(f'Tiêu chí {ma} được định nghĩa ở nhiều story: {", ".join(ds)}')

# 2. mục lục story
ml = doc('docs/stories/README.md')
for p in stories:
    ten = os.path.basename(p); ma = ten.split('-')[0]
    m = re.search(r'(?m)^\| \[' + ma + r'\]\(' + re.escape(ten) + r'\) \|(.*)$', ml)
    if not m: loi.append(f'{ten} không có dòng trong docs/stories/README.md'); continue
    tt = re.search(r'(?m)^- Trạng thái: (.+)$', doc(p))
    if not tt: loi.append(f'{ten} thiếu dòng "- Trạng thái:"'); continue
    if tt.group(1).strip() not in ('chưa làm', 'đang làm', 'xong'): loi.append(f'{ten}: trạng thái "{tt.group(1)}" không thuộc ba trạng thái')
    if f'| {tt.group(1).strip()} |' not in m.group(1): loi.append(f'{ten}: trạng thái trong file ({tt.group(1).strip()}) khác trong README')
for m in re.finditer(r'\]\((US\d+-[\w-]+\.md)\)', ml):
    if not os.path.exists('docs/stories/' + m.group(1)): loi.append(f'docs/stories/README.md trỏ tới file không có: {m.group(1)}')

# 3. câu hỏi mở
ch = doc('docs/Cau_hoi_mo.md')
MA_HOI = r'(?:YC\d+|PQ|HV|LC|US\d+)-H\d+|CH-\d+'
co_ma = set(re.findall(r'(?m)^\| (' + MA_HOI + r') \|', ch))
for p in SONG:
    for m in re.finditer(r'(?<!`)\[MỞ:?\s*([^\]]*)\]', doc(p)):   # thẻ nằm trong dấu ` là ví dụ, không kiểm
        t = m.group(1)
        mas = re.findall(MA_HOI, t)
        if not mas: loi.append(f'{p}: thẻ MỞ không có mã: [MỞ: {t[:60]}]')
        for c in mas:
            if c not in co_ma: loi.append(f'{p}: [MỞ: {c}] không có trong docs/Cau_hoi_mo.md')

# 4. mã được nhắc tới
qd = set(re.findall(r'(?m)^## (QD-\d+)', doc('docs/Quyet_dinh.md')))
qt = set(re.findall(r'(?m)^#+ (QT\d+(?:\.\d+)?)\b', doc('docs/luat-chung/QT.md')))
pq = set(re.findall(r'(?m)^## (PQ\d+)\b', doc('docs/luat-chung/PQ.md')))
hv = set(re.findall(r'(?m)^#+ (HV\d+)\b', doc('docs/luat-chung/HV.md')))
us = {os.path.basename(p).split('-')[0] for p in stories}
gd = set(re.findall(r'(?m)^\| (GD\d+) \|', ch))
for p in SONG:
    s = doc(p)
    for c in set(re.findall(r'\bQD-\d+', s)) - qd: loi.append(f'{p}: nhắc {c} không có trong Quyet_dinh.md')
    for c in set(re.findall(r'\bCH-\d{3}\b', s)) - co_ma: loi.append(f'{p}: nhắc {c} không có trong Cau_hoi_mo.md')
    for c in set(re.findall(r'\bQT\d+\.\d+\b', s)) - qt: loi.append(f'{p}: nhắc {c} không có trong luat-chung/QT.md')
    for c in set(re.findall(r'\bPQ\d+\b', s)) - pq: loi.append(f'{p}: nhắc {c} không có trong luat-chung/PQ.md')
    for c in set(re.findall(r'\bHV\d+\b', s)) - hv: loi.append(f'{p}: nhắc {c} không có trong luat-chung/HV.md')
    for c in set(re.findall(r'\bGD\d+\b', s)) - gd: canh_bao.append(f'{p}: giả định {c} chưa có dòng trong Cau_hoi_mo.md')
    if p.startswith('docs/stories/') or p in ('CLAUDE.md', 'docs/QUY_TRINH.md'):
        for c in set(re.findall(r'\bUS\d+\b', s)) - us - {'US31'}: loi.append(f'{p}: nhắc {c} không có story')
    for c in set(re.findall(r'\b(?:YC[\d.]+|HV\d+|US\d+)-NT\d+\b', s)) - set(nt):
        if p.startswith(('docs/stories/', 'tests/kich-ban/')): canh_bao.append(f'{p}: nhắc tiêu chí {c} không được định nghĩa ở story nào')

# 5. đường dẫn
for p in SONG:
    for m in re.finditer(r'`((?:docs|tests|scripts|supabase|src|data-fixes|\.github)/[\w./\-]+?|CLAUDE\.md|VIEC_TAY_CUA_TUNG\.md)`', doc(p)):
        d = m.group(1).rstrip('.')
        if '<' in d or '*' in d or '…' in d: continue
        if not os.path.exists(d): loi.append(f'{p}: đường dẫn không tồn tại: {d}')

# 6. màn trên canvas
cv = doc('docs/thiet-ke/canvas/home247-canvas.html')
for m in re.finditer(r'(?m)^\| ([A-Z]+\d[\w-]*) \|', doc('docs/thiet-ke/README.md')):
    if f'id="{m.group(1)}"' not in cv: canh_bao.append(f'docs/thiet-ke/README.md: màn {m.group(1)} không có hình trên canvas')

# 7. chữ cũ, email
CU = ['docs/nguon', 'Dac_ta.md', 'Hanh_vi_chung.md', 'User_Stories.md', 'docs/product', 'docs/architecture', 'docs/phan-tich', 'work/backlog', 'work/cau-hoi', 'tasks/']
EMAIL_DUOC = ('example.com', 'home247.test', 'test.local', 'anthropic.com', 'zaloplatforms.com')
for p in MD:
    s = doc(p)
    if p in SONG and p != 'docs/Quyet_dinh.md':
        for c in CU:
            if c in s: loi.append(f'{p}: còn chữ trỏ tới cấu trúc cũ: {c}')
    for e in re.findall(r'[\w.+-]+@([\w-]+(?:\.[\w-]+)+)', s):
        if not e.lower().endswith(EMAIL_DUOC): loi.append(f'{p}: có email ở miền lạ ({e}). Repo công khai, không ghi email thật')

for c in canh_bao: print('CẢNH BÁO', c)
for c in loi: print('LỖI', c)
print(f'Đã kiểm {len(MD)} file tài liệu, {len(stories)} story, {len(nt)} tiêu chí: {len(loi)} lỗi, {len(canh_bao)} cảnh báo.')
sys.exit(1 if loi else 0)
