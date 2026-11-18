#!/usr/bin/env bash
# Hook SessionStart (.claude/settings.json). In vài dòng cho Claude đọc đầu phiên:
# số item theo trạng thái; trần đang làm (2) và chờ người (6); item code đã xong mà chưa đổi trạng thái;
# lỗi kiem.py MỚI so với main (không in lại số lỗi cũ không đổi); nhánh và item đang làm.
# Sau khi context bị nén (source = compact) in thêm đường dẫn file item và gói việc để phiên đọc lại đúng chỗ.
cd "${CLAUDE_PROJECT_DIR:-$(dirname "$0")/../..}" || exit 0
INPUT="$(cat 2>/dev/null || true)" exec python3 - <<'PY'
import collections, glob, json, os, re, subprocess, sys
sys.path.insert(0, 'scripts')
TRAN_CHO, TRAN_LAM = 6, 2
try:
    nguon_phien = json.loads(os.environ.get('INPUT') or '{}').get('source', '')
except ValueError:
    nguon_phien = ''
rows = None
if os.path.exists('work/plan/bang.json'):
    try:
        rows = json.load(open('work/plan/bang.json', encoding='utf-8'))['item']
        nguon = 'bang.json'
    except Exception:
        rows = None
if rows is None:
    import plan
    items = plan.load()
    rows = [{'id': i['id'], 'trang_thai': i['trang_thai'],
             'co_code': plan.BANG.get(i['id'], {}).get('task_loai', {}).get('Code', [0, 0])[1] > 0}
            for i in items.values() if i['file'].startswith('work/backlog/')]
    nguon = 'quét backlog'
dem = collections.Counter(r['trang_thai'] for r in rows)
thu_tu = ['moi', 'san-sang', 'dang-lam', 'cho-test', 'cho-nghiem-thu', 'on-hold', 'xong', 'huy']
print('Home247 · item theo trạng thái (' + nguon + '): ' +
      ' · '.join(f'{k} {dem[k]}' for k in thu_tu + sorted(set(dem) - set(thu_tu)) if dem[k]))
cho = [r['id'] for r in rows if r.get('co_code') and r['trang_thai'] in ('cho-test', 'cho-nghiem-thu')]
lam = [r['id'] for r in rows if r.get('co_code') and r['trang_thai'] == 'dang-lam']
sai = [r['id'] for r in rows if 'chưa đổi trạng thái' in str(r.get('dang_cho', ''))]
print(f'Trần (CL1.2): chờ người {len(cho)}/{TRAN_CHO}, đang làm có code {len(lam)}/{TRAN_LAM}'
      + (' · VƯỢT TRẦN: không nhận thêm item có code mới' if len(cho) > TRAN_CHO or len(lam) > TRAN_LAM else ''))
if sai:
    print(f'Code đã xong mà item chưa đổi trạng thái ({len(sai)}): {", ".join(sai[:8])}. Sửa theo CL2.9 (skill gop-code).')
try:
    r = subprocess.run([sys.executable, 'scripts/kiem.py', '--diff', 'origin/main'], capture_output=True, text=True, timeout=10)
    moi = r.stdout.strip().split('\n')[-1]
    print('kiem.py, lỗi mới so với main: ' + moi.replace('kiem.py:', '').strip())
except Exception as e:
    print(f'kiem.py không chạy được: {e}')
try:
    nhanh = subprocess.run(['git', 'rev-parse', '--abbrev-ref', 'HEAD'], capture_output=True, text=True, timeout=5).stdout.strip()
except Exception:
    nhanh = ''
m = re.match(r'^((?:US|EN|BG|DC|SK|TK|EP)\d+)-', nhanh)
if m:
    item = m.group(1)
    f = (glob.glob(f'work/backlog/{item}-*.md') or [''])[0]
    print(f'Nhánh {nhanh} · item {item}' + (f' · {f}' if f else ''))
    if nguon_phien == 'compact':
        goi = f'work/goi/{item}.md'
        print('Context vừa được nén. Đọc lại mục Task và Kế hoạch của ' + (f or item)
              + (f', và gói việc {goi}' if os.path.exists(goi) else '')
              + ' trước khi làm tiếp, bằng trich.py cho tài liệu.')
elif nhanh:
    print(f'Nhánh {nhanh}')
PY
