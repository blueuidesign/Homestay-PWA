#!/usr/bin/env python3
"""Sinh work/plan/plan.json, work/plan/KE-HOACH.md và work/plan/bang.json từ item backlog, QD và lịch.

bang.json: mỗi item backlog một dòng, gồm cả done/, cho các lệnh báo cáo và hook đầu phiên.

Nguồn (sửa ở đây, không sửa file sinh ra):
  work/backlog/**/*.md        loại, tên, cha, người, trạng thái, truoc (phụ thuộc)
  docs/decisions/QD*.md       quyết định
  work/plan/giai-doan.csv     giai đoạn, mốc, epic thuộc giai đoạn (không bắt buộc)
  work/plan/lich.csv          mỗi item làm từ sprint nào tới sprint nào (không bắt buộc)
Không có hai file csv thì chỉ sinh bang.json (bản PWA không chạy sprint, CL1).

Chạy: python3 scripts/plan.py        (thêm --check để chỉ kiểm, không ghi file)
"""
import csv, glob, json, os, re, sys, datetime as dt

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SP0 = dt.date(2026, 10, 26)          # thứ Hai đầu SP0. Sprint 2 tuần (CL1.2)

def sprint_dates(name):
    n = int(name[2:])
    start = SP0 + dt.timedelta(days=14 * n)
    return start, start + dt.timedelta(days=11)   # tới thứ Sáu tuần thứ hai

def front_matter(path):
    s = open(path, encoding='utf-8').read()
    m = re.match(r'---\n(.*?)\n---\n', s, re.S)
    if not m:
        return None, s
    fm = {}
    for line in m.group(1).split('\n'):
        k, sep, v = line.partition(':')
        if sep and not line.startswith(' '):
            fm[k.strip()] = re.sub(r'\s+#.*$', '', v).strip()
    return fm, s[m.end():]

def as_list(v):
    v = (v or '').strip()
    if not v.startswith('['):
        return []
    return [x.strip() for x in v.strip('[]').split(',') if x.strip()]

BANG = {}   # thêm cho bang.json, giữ riêng để plan.json không đổi: id -> {pr, task_loai}

def load():
    items = {}
    for p in glob.glob(os.path.join(ROOT, 'work/backlog/**/*.md'), recursive=True):
        if p.endswith('THU-TU.md'):
            continue
        fm, body = front_matter(p)
        if not fm or 'id' not in fm:
            continue
        tasks = re.findall(r'^- \[( |x)\] ', body, re.M)
        loai_task = {}
        for xong, loai in re.findall(r'^- \[( |x)\] (?:\S+-TA\d+\S*\s+)?(Code|Test tay|Nghiệm thu)?', body, re.M):
            k = loai or 'khác'
            d = loai_task.setdefault(k, [0, 0])
            d[1] += 1
            d[0] += xong == 'x'
        items[fm['id']] = {
            'id': fm['id'], 'loai': fm.get('loai', ''), 'ten': fm.get('tieu_de', ''),
            'cha': fm.get('cha', ''), 'nguoi': {'tung': 'Tùng', 'duc': 'Đức'}.get(fm.get('nguoi', ''), ''),
            'trang_thai': fm.get('trang_thai', ''), 'rui_ro': fm.get('rui_ro', ''),
            'uoc_luong': fm.get('uoc_luong', ''), 'truoc': as_list(fm.get('truoc')),
            'thuc_hien': as_list(fm.get('thuc_hien')), 'muc_tieu': fm.get('muc_tieu', ''),
            'task': len(tasks), 'task_xong': tasks.count('x'),
            'file': os.path.relpath(p, ROOT),
        }
        BANG[fm['id']] = {'pr': fm.get('pr', ''), 'task_loai': loai_task, 'nguoi_ma': fm.get('nguoi', ''),
                          'nghiem_thu': fm.get('nghiem_thu', '') or 'khong'}
    for p in glob.glob(os.path.join(ROOT, 'docs/decisions/QD*.md')):
        fm, _ = front_matter(p)
        if fm and 'id' in fm:
            items[fm['id']] = {
                'id': fm['id'], 'loai': 'QD', 'ten': fm.get('tieu_de', ''), 'cha': 'EP1',
                'nguoi': 'Tùng', 'trang_thai': fm.get('trang_thai', ''), 'rui_ro': '', 'uoc_luong': '',
                'truoc': [], 'thuc_hien': [], 'muc_tieu': '', 'task': 0, 'task_xong': 0,
                'file': os.path.relpath(p, ROOT),
            }
    return items

def dang_cho(it, items):
    """Việc đang chờ ai (dòng đầu tiên khớp). PR chờ Tùng duyệt không biết được khi không có mạng nên bỏ qua."""
    tt = it['trang_thai']
    if tt == 'cho-test':
        return 'Đức test tay'
    if tt == 'cho-nghiem-thu':
        return 'Tùng nghiệm thu'
    if tt not in ('xong', 'huy'):
        chan = [d for d in it['truoc'] if items.get(d, {}).get('trang_thai') not in ('xong', 'huy', 'da-chot')]
        if chan:
            return 'Bị chặn bởi ' + ', '.join(chan)
    if tt == 'dang-lam':
        return 'Đang code'
    return '–'

def ghi_bang(items):
    """work/plan/bang.json: mỗi item backlog một dòng, gồm cả done/."""
    rows = []
    for it in items.values():
        if not it['file'].startswith('work/backlog/'):
            continue
        b = BANG.get(it['id'], {})
        tl = b.get('task_loai', {})
        rows.append({
            'id': it['id'], 'loai': it['loai'], 'tieu_de': it['ten'], 'trang_thai': it['trang_thai'],
            'nguoi': it['nguoi'], 'cha': it['cha'], 'truoc': it['truoc'], 'file': it['file'], 'pr': b.get('pr', ''),
            'task': {k: {'xong': tl.get(k, [0, 0])[0], 'tong': tl.get(k, [0, 0])[1]}
                     for k in ('Code', 'Test tay', 'Nghiệm thu', 'khác')},
            'co_code': tl.get('Code', [0, 0])[1] > 0,
            'nghiem_thu': b.get('nghiem_thu', 'khong') if it['loai'] == 'US' else '',
            'dang_cho': ('Code đã xong, chưa đổi trạng thái (CL2.9)'
                         if it['trang_thai'] == 'dang-lam' and tl.get('Code', [0, 0])[1] > 0
                         and tl['Code'][0] == tl['Code'][1] else dang_cho(it, items)),
        })
    rows.sort(key=lambda r: (re.sub(r'\d+', '', r['id']), int(re.sub(r'\D', '', r['id']) or 0)))
    out = {'tu_sinh': 'scripts/plan.py',
           'ghi_chu': '[tự sinh] File này do scripts/plan.py sinh từ item backlog. Không sửa tay.',
           'ngay_sinh': dt.date.today().isoformat(), 'item': rows}
    with open(os.path.join(ROOT, 'work/plan/bang.json'), 'w', encoding='utf-8') as f:
        json.dump(out, f, ensure_ascii=False, indent=1)
    return len(rows)

def main(check_only=False):
    items = load()
    if not os.path.exists(os.path.join(ROOT, 'work/plan/giai-doan.csv')):
        # Bản PWA không chạy sprint (CL1): chưa có giai-doan.csv, lich.csv thì chỉ sinh bang.json.
        if check_only:
            print(f'plan.py: {len(items)} item, không có work/plan/giai-doan.csv nên bỏ kiểm lịch')
            return 0
        os.makedirs(os.path.join(ROOT, 'work/plan'), exist_ok=True)
        print(f'Đã sinh bang.json: {ghi_bang(items)} item (không có giai-doan.csv, bỏ plan.json và KE-HOACH.md)')
        return 0
    phases = list(csv.DictReader(open(os.path.join(ROOT, 'work/plan/giai-doan.csv'), encoding='utf-8')))
    sched = {r['id']: r for r in csv.DictReader(open(os.path.join(ROOT, 'work/plan/lich.csv'), encoding='utf-8'))}
    problems = []
    epic_phase = {}
    for ph in phases:
        for e in ph['epics'].split(';'):
            epic_phase[e] = ph['gd']

    rows = []
    for iid, r in sched.items():
        it = items.get(iid)
        if not it:
            problems.append(f'{iid} có trong lich.csv nhưng không có file item hay QD')
            continue
        a, b = int(r['tu'][2:]), int(r['den'][2:])
        if b < a:
            problems.append(f'{iid}: den trước tu')
        s, _ = sprint_dates(r['tu']); _, e = sprint_dates(r['den'])
        rows.append(dict(it, tu=r['tu'], den=r['den'], tu_i=a, den_i=b,
                         bat_dau=s.isoformat(), ket_thuc=e.isoformat(), ghi_chu=r['ghi_chu'],
                         gd=epic_phase.get(it['cha'], '')))
    by_id = {r['id']: r for r in rows}
    for it in items.values():
        if it['loai'] not in ('EP',) and it['id'] not in by_id and it['trang_thai'] not in ('xong', 'huy') and it['loai'] != 'QD':
            problems.append(f'{it["id"]} chưa xếp lịch trong lich.csv')

    # phụ thuộc: chỉ giữ cái có trong lịch
    links = []
    succ = {r['id']: [] for r in rows}
    for r in rows:
        for d in r['truoc']:
            if d in by_id:
                links.append({'tu': d, 'toi': r['id']})
                succ[d].append(r['id'])
                if by_id[d]['den_i'] > r['tu_i']:
                    problems.append(f'{r["id"]} bắt đầu {r["tu"]} nhưng chờ {d} xong ở {by_id[d]["den"]}')
            else:
                problems.append(f'{r["id"]} chờ {d} nhưng {d} không có trong lịch')

    # độ trễ cho phép (sprint): bao nhiêu sprint trễ được trước khi đẩy lùi việc sau
    last = max(r['den_i'] for r in rows)
    for r in rows:
        nxt = [by_id[s]['tu_i'] for s in succ[r['id']]]
        r['du_tru'] = (min(nxt) - r['den_i']) if nxt else (last - r['den_i'])
        r['gang'] = bool(nxt) and r['du_tru'] <= 0 and r['trang_thai'] not in ('xong', 'huy')

    epics = []
    for e in sorted((i for i in items.values() if i['loai'] == 'EP'), key=lambda x: int(x['id'][2:])):
        kids = [r for r in rows if r['cha'] == e['id']]
        if not kids:
            problems.append(f'{e["id"]} chưa có item nào trong lịch')
            continue
        a = min(k['tu_i'] for k in kids); b = max(k['den_i'] for k in kids)
        epics.append(dict(e, gd=epic_phase.get(e['id'], ''), tu_i=a, den_i=b,
                          bat_dau=sprint_dates(f'SP{a}')[0].isoformat(),
                          ket_thuc=sprint_dates(f'SP{b}')[1].isoformat(),
                          so_item=len(kids), so_xong=sum(k['trang_thai'] == 'xong' for k in kids)))
    sprints = []
    for n in range(0, last + 1):
        s, e = sprint_dates(f'SP{n}')
        sprints.append({'id': f'SP{n}', 'bat_dau': s.isoformat(), 'ket_thuc': e.isoformat()})

    if problems:
        print('Cần xem:'); [print(' -', p) for p in problems]
    if check_only:
        return 1 if any('nhưng chờ' in p or 'không có' in p for p in problems) else 0

    out = {'tu_sinh': 'scripts/plan.py', 'ngay_sinh': dt.date.today().isoformat(),
           'giai_doan': phases, 'epic': epics, 'item': sorted(rows, key=lambda r: (r['tu_i'], r['den_i'], r['id'])),
           'phu_thuoc': links, 'sprint': sprints, 'can_xem': problems}
    json.dump(out, open(os.path.join(ROOT, 'work/plan/plan.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

    # KE-HOACH.md
    L = ['# Kế hoạch chi tiết', '',
         '[tự sinh] File này do scripts/plan.py sinh từ item backlog và work/plan/lich.csv. Không sửa tay.', '',
         'Cột Găng: việc mà trễ một sprint thì đẩy lùi việc sau nó. Cột Dư: số sprint trễ được.', '']
    for ph in phases:
        L += [f'## {ph["gd"]} · {ph["ten"]} → {ph["moc"]} ({ph["ngay_moc"]})', '', ph['ket_qua_moc'], '']
        for e in [x for x in epics if x['gd'] == ph['gd']]:
            L += [f'### {e["id"]} · {e["ten"]} · {e["bat_dau"]} → {e["ket_thuc"]}', '',
                  '| Mã | Loại | Việc | Người | Sprint | Từ | Đến | Chờ | Găng | Dư | Ghi chú |',
                  '|---|---|---|---|---|---|---|---|---|---|---|']
            for r in sorted([r for r in rows if r['cha'] == e['id']], key=lambda r: (r['tu_i'], r['id'])):
                sp = r['tu'] if r['tu'] == r['den'] else f'{r["tu"]}–{r["den"]}'
                L.append(f'| {r["id"]} | {r["loai"]} | {r["ten"]} | {r["nguoi"]} | {sp} | {r["bat_dau"]} | {r["ket_thuc"]} | '
                         f'{", ".join(r["truoc"])} | {"có" if r["gang"] else ""} | {r["du_tru"]} | {r["ghi_chu"]} |')
            L.append('')
    if problems:
        L += ['## Cần xem', ''] + [f'- {p}' for p in problems] + ['']
    open(os.path.join(ROOT, 'work/plan/KE-HOACH.md'), 'w', encoding='utf-8').write('\n'.join(L))
    print(f'Đã sinh plan.json: {len(rows)} việc, {len(epics)} epic, {len(links)} phụ thuộc')
    print(f'Đã sinh bang.json: {ghi_bang(items)} item')
    return 0

if __name__ == '__main__':
    sys.exit(main('--check' in sys.argv))
