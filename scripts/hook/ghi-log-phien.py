#!/usr/bin/env python3
"""Ghi log một phiên Claude Code để sau này đánh giá quy trình (CL10.7).

Chạy bởi hook Stop (cuối mỗi lượt) và SessionEnd (khi phiên đóng), đọc JSON từ stdin:
{"session_id", "transcript_path", "hook_event_name", ...}. Chạy tay: `python3 scripts/hook/ghi-log-phien.py --day`
đẩy log của phiên mới nhất ngay.

Log gồm:
- tom_tat: ai làm, nhánh, item, thời gian, số lượt, token và chi phí theo model, đếm theo loại việc.
- buoc: từng việc agent đã làm theo thứ tự: skill gọi, file đọc (cả file hay một phần), mã trích bằng trich.py,
  file ghi, lệnh test, git, gh, agent phụ được giao, việc bị lỗi hay bị hook chặn. Đánh dấu bước của agent phụ.
Không ghi nội dung chat, nội dung file, kết quả lệnh. Lệnh shell cắt ngắn và che dãy số giống số điện thoại.

File nằm ở nhánh riêng `nhat-ky-phien` (không vào main, không làm bẩn nhánh đang làm, không chạy CI):
nhat-ky-phien:phien/<yyyy-mm-dd>-<8 ký tự đầu session_id>.json. Bản nháp trong .git/home247-log/.
Đẩy lên khi phiên đóng, khi chạy --day, hoặc ở hook Stop nếu lần đẩy trước đã quá 30 phút.
Mọi lỗi đều nuốt và thoát 0: hook log không bao giờ được chặn việc chính.
"""
import datetime, glob, json, os, re, shlex, subprocess, sys, tempfile, time

NHANH = 'nhat-ky-phien'
ROOT = os.environ.get('CLAUDE_PROJECT_DIR') or os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DAY_SAU = 30 * 60
VN = datetime.timezone(datetime.timedelta(hours=7))
RE_SDT = re.compile(r'(?<!\d)(?:\+?84|0)\d{8,10}(?!\d)')
RE_MA = re.compile(r'\b(?:YC|QT|QD|HV|PQ|CL|EP|US|EN|SK|DC|TK|BG|DLM)\d+(?:[.\-][\w.\-]+)?')


def git(*a, env=None, inp=None):
    return subprocess.run(['git', '-C', ROOT, *a], capture_output=True, text=True, env=env, input=inp, timeout=40)


def gon(s, n=120):
    s = RE_SDT.sub('***', ' '.join(str(s).split()))
    return s if len(s) <= n else s[:n - 1] + '…'


def rel(p):
    p = str(p or '')
    for goc in (ROOT + '/',):
        if p.startswith(goc):
            return p[len(goc):]
    return re.sub(r'^/tmp/claude-[^/]+/[^/]+/[^/]+/scratchpad/', 'scratchpad/', p)


def kich_co(p):
    try:
        return os.path.getsize(os.path.join(ROOT, p) if not os.path.isabs(p) else p)
    except OSError:
        return None


def phan_loai_bash(cmd):
    c = cmd.strip()
    if 'scripts/trich.py' in c:
        doan = re.split(r'\s(?:\||&&|;|>|2>)\s?', c.split('trich.py', 1)[1])[0]
        try:
            tu = shlex.split(doan)
        except ValueError:
            tu = doan.split()
        return {'loai': 'trich', 'ma': [x for x in tu if not x.startswith('-') and not re.match(r'^[\w-]+(,[\w-]+)+$', x)][:20],
                'co': [x for x in tu if x.startswith('--')]}
    if 'scripts/trich-man.py' in c:
        return {'loai': 'trich-man', 'ma': RE_MA.findall(c)[:5] or re.findall(r'\b[A-Z]{1,3}\d+(?:-\w+)*\b', c)[:5]}
    if 'scripts/goi.py' in c:
        return {'loai': 'goi', 'ma': RE_MA.findall(c)[:3]}
    if 'scripts/kiem.py' in c:
        return {'loai': 'kiem', 'lenh': gon(c, 80)}
    if 'scripts/plan.py' in c:
        return {'loai': 'plan'}
    if re.search(r'\b(pytest|vitest|npm (run )?test|npm\.cmd test|test:ghep|chay-test\.sh|node --test|playwright)\b', c):
        return {'loai': 'test', 'lenh': gon(c, 100)}
    if re.search(r'\b(vite build|npm run build|vercel deploy|supabase db push)\b', c):
        return {'loai': 'build-deploy', 'lenh': gon(c, 100)}
    m = re.search(r'\bgit\s+(?:-C\s+\S+\s+)?(-c\s+\S+\s+)*([a-z-]+)', c)
    if m and not c.startswith(('cat', 'sed', 'grep')):
        return {'loai': 'git', 'lenh': m.group(2), 'chi_tiet': gon(c, 100)}
    m = re.search(r'\bgh\s+(api|pr|run)\b\s*(?:-X\s+(\w+)\s+)?(\S*)', c)
    if m:
        return {'loai': 'gh', 'lenh': ' '.join(x for x in m.groups() if x), 'chi_tiet': gon(c, 100)}
    doc = re.findall(r'(?:^|[\s|;&(])(?:cat|sed\s+-n\s+\S+|head(?:\s+-\w+\s*\d*)?|tail(?:\s+-\w+\s*\d*)?|less|wc)\s+([^\s|;&>]+\.(?:md|py|js|ts|tsx|json|sql|sh|yml|html))', c)
    if doc:
        return {'loai': 'doc-shell', 'file': [rel(x) for x in doc][:6], 'lenh': gon(c, 80)}
    if re.search(r'\b(grep|rg|find|ls)\b', c):
        return {'loai': 'tim', 'lenh': gon(c, 80)}
    return {'loai': 'lenh', 'lenh': gon(c, 100)}


def buoc_tu_tool(b):
    ten, inp = b.get('name'), b.get('input') or {}
    if ten == 'Skill':
        return {'loai': 'skill', 'ten': inp.get('skill'), 'args': gon(inp.get('args', ''), 60)}
    if ten == 'Read':
        p = rel(inp.get('file_path'))
        mot_phan = bool(inp.get('offset') or inp.get('limit') or inp.get('pages'))
        return {'loai': 'doc', 'file': p, 'ca_file': not mot_phan, 'byte': kich_co(p) if not mot_phan else None}
    if ten in ('Write', 'Edit', 'NotebookEdit'):
        return {'loai': 'ghi' if ten == 'Write' else 'sua', 'file': rel(inp.get('file_path') or inp.get('notebook_path'))}
    if ten == 'Bash':
        return phan_loai_bash(inp.get('command', ''))
    if ten in ('Agent', 'Task'):
        return {'loai': 'agent', 'kieu': inp.get('subagent_type') or 'general', 'model': inp.get('model'),
                'mo_ta': gon(inp.get('description', ''), 60)}
    if ten in ('Grep', 'Glob'):
        return {'loai': 'tim', 'mau': gon(inp.get('pattern', ''), 60), 'o': rel(inp.get('path', ''))}
    if ten == 'WebFetch':
        return {'loai': 'web', 'url': gon(inp.get('url', ''), 100)}
    if ten == 'WebSearch':
        return {'loai': 'web', 'tim': gon(inp.get('query', ''), 80)}
    if ten in ('TaskCreate', 'TaskUpdate', 'TodoWrite'):
        return {'loai': 'task-list'}
    return {'loai': 'cong-cu', 'ten': ten}


def doc_transcript(paths):
    """Trả (các bản ghi theo thứ tự, có cờ agent phụ)."""
    recs = []
    for p, phu in paths:
        try:
            with open(p, encoding='utf-8') as f:
                for l in f:
                    try:
                        d = json.loads(l)
                    except ValueError:
                        continue
                    d['_phu'] = phu or bool(d.get('isSidechain'))
                    recs.append(d)
        except OSError:
            pass
    recs.sort(key=lambda d: d.get('timestamp') or '')
    return recs


def nguoi_lam(text):
    t = text.lower()
    if re.search(r'tôi là tùng|^tùng\b|\btùng đây', t):
        return 'Tùng'
    if re.search(r'tôi là đức|^đức\b|\bđức đây', t):
        return 'Đức'
    return None


def tao_log(sid, tpath):
    goc = tpath[:-6] if tpath.endswith('.jsonl') else tpath
    paths = [(tpath, False)] + [(p, True) for p in sorted(glob.glob(os.path.join(goc, 'subagents', '*.jsonl')))]
    recs = doc_transcript(paths)
    buoc, theo_id, msg_da = [], {}, set()
    token, cost_theo_start = {}, {}
    nguoi, nhanh, so_luot, pr = None, None, 0, set()
    t_dau = t_cuoi = None
    for d in recs:
        ts = d.get('timestamp')
        if ts:
            t_dau = t_dau or ts
            t_cuoi = ts
        if d.get('gitBranch'):
            nhanh = d['gitBranch']
        if d.get('type') == 'cost-state':
            cost_theo_start[d.get('startTime')] = max(cost_theo_start.get(d.get('startTime'), 0), d.get('totalCostUSD') or 0)
        if d.get('type') == 'pr-link' and d.get('prNumber'):
            pr.add(d['prNumber'])
        m = d.get('message') if isinstance(d.get('message'), dict) else {}
        if d.get('type') == 'user' and not d['_phu']:
            c = m.get('content')
            text = c if isinstance(c, str) else ' '.join(x.get('text', '') for x in (c or []) if isinstance(x, dict) and x.get('type') == 'text')
            if text and not d.get('isMeta') and not text.lstrip().startswith('<'):
                so_luot += 1
                nguoi = nguoi or nguoi_lam(text)
                buoc.append({'t': ts, 'loai': 'luot', 'so': so_luot, 'do_dai': len(text)})
            for x in (c if isinstance(c, list) else []):
                if isinstance(x, dict) and x.get('type') == 'tool_result' and x.get('tool_use_id') in theo_id and x.get('is_error'):
                    s = theo_id[x['tool_use_id']]
                    s['loi'] = True
                    nd = x.get('content')
                    nd = nd if isinstance(nd, str) else ' '.join(y.get('text', '') for y in (nd or []) if isinstance(y, dict))
                    s['loi_gi'] = gon(nd, 120)
                    if re.search(r'hook|chặn|PreToolUse|denied|từ chối', nd or '', re.I):
                        s['bi_chan'] = True
        if d.get('type') == 'assistant':
            mid = m.get('id')
            u = m.get('usage') or {}
            if mid and mid not in msg_da and (u.get('output_tokens') or u.get('input_tokens')):
                msg_da.add(mid)
                k = token.setdefault(m.get('model') or '?', {'vao': 0, 'doc_cache': 0, 'ghi_cache': 0, 'ra': 0, 'luot_goi': 0})
                k['vao'] += u.get('input_tokens') or 0
                k['doc_cache'] += u.get('cache_read_input_tokens') or 0
                k['ghi_cache'] += u.get('cache_creation_input_tokens') or 0
                k['ra'] += u.get('output_tokens') or 0
                k['luot_goi'] += 1
            for b in m.get('content') or []:
                if isinstance(b, dict) and b.get('type') == 'tool_use' and b.get('id') not in theo_id:
                    s = {'t': ts, **buoc_tu_tool(b)}
                    if d['_phu']:
                        s['phu'] = True
                    theo_id[b.get('id')] = s
                    buoc.append(s)
    if not nhanh or nhanh == 'HEAD':
        nhanh = git('rev-parse', '--abbrev-ref', 'HEAD').stdout.strip() or nhanh
    item = (re.match(r'^((?:US|EN|BG|DC|SK|TK|EP)\d+)-', nhanh or '') or [None, None])[1]
    dem = {}
    for s in buoc:
        dem[s['loai']] = dem.get(s['loai'], 0) + 1
    tom = {
        'session': sid, 'nguoi': nguoi, 'nhanh': nhanh, 'item': item,
        'bat_dau': t_dau, 'ket_thuc': t_cuoi, 'so_luot': so_luot, 'pr': sorted(pr),
        'token': token, 'chi_phi_usd': round(sum(cost_theo_start.values()), 4) if cost_theo_start else None,
        'dem': dem,
        'skill': [s['ten'] for s in buoc if s['loai'] == 'skill'],
        'agent_phu': sum(1 for s in buoc if s['loai'] == 'agent'),
        'doc_ca_file_docs': sorted({s['file'] for s in buoc if s['loai'] == 'doc' and s.get('ca_file')
                                    and str(s.get('file', '')).startswith('docs/')}),
        'loi': sum(1 for s in buoc if s.get('loi')), 'bi_chan': sum(1 for s in buoc if s.get('bi_chan')),
        'phien_ban_log': 1,
    }
    return {'tom_tat': tom, 'buoc': buoc[-1500:]}


def gop_doan(truoc, moi):
    """Gộp log của đoạn trước lần nén context với log của transcript hiện tại.
    Ở phiên cloud, nén context làm file transcript chỉ còn phần sau lần nén, nên phải giữ phần trước từ log cũ."""
    a, b = truoc['tom_tat'], moi['tom_tat']
    token = {k: dict(v) for k, v in a.get('token', {}).items()}
    for m, v in b.get('token', {}).items():
        k = token.setdefault(m, {'vao': 0, 'doc_cache': 0, 'ghi_cache': 0, 'ra': 0, 'luot_goi': 0})
        for f, n in v.items():
            k[f] = k.get(f, 0) + n
    dem = dict(a.get('dem', {}))
    for k, n in b.get('dem', {}).items():
        dem[k] = dem.get(k, 0) + n
    tien = [x for x in (a.get('chi_phi_usd'), b.get('chi_phi_usd')) if x is not None]
    tom = {**b,
           'nguoi': a.get('nguoi') or b.get('nguoi'), 'bat_dau': a.get('bat_dau') or b.get('bat_dau'),
           'nhanh': b.get('nhanh') or a.get('nhanh'), 'item': b.get('item') or a.get('item'),
           'so_luot': a.get('so_luot', 0) + b.get('so_luot', 0), 'pr': sorted(set(a.get('pr', [])) | set(b.get('pr', []))),
           'token': token, 'chi_phi_usd': max(tien) if tien else None,  # Claude Code ghi chi phí cộng dồn cả phiên
           'dem': dem, 'skill': a.get('skill', []) + b.get('skill', []),
           'agent_phu': a.get('agent_phu', 0) + b.get('agent_phu', 0),
           'doc_ca_file_docs': sorted(set(a.get('doc_ca_file_docs', [])) | set(b.get('doc_ca_file_docs', []))),
           'loi': a.get('loi', 0) + b.get('loi', 0), 'bi_chan': a.get('bi_chan', 0) + b.get('bi_chan', 0),
           'so_lan_nen': a.get('so_lan_nen', 0) + 1}
    return {'tom_tat': tom, 'buoc': (truoc['buoc'] + [{'t': b.get('bat_dau'), 'loai': 'nen-context'}] + moi['buoc'])[-1500:]}


def noi_voi_log_cu(cu, moi):
    """cu: log đã lưu của cùng phiên (hoặc None). Trả log đầy đủ để lưu.
    tom_tat._doan giữ (mốc đầu transcript, log của các đoạn trước) để lần chạy sau tách lại đúng."""
    tx = moi['tom_tat'].get('bat_dau') or ''
    truoc = None
    if cu:
        d = cu['tom_tat'].get('_doan') or {}
        if d.get('tx') == tx:
            truoc = d.get('truoc')          # cùng transcript với lần trước: dùng lại phần trước đã tách
        elif (d.get('tx') or cu['tom_tat'].get('bat_dau') or '') < tx:
            cu = {'tom_tat': {k: v for k, v in cu['tom_tat'].items() if k != '_doan'}, 'buoc': cu['buoc']}
            truoc = cu                      # transcript mới bắt đầu muộn hơn: đã có một lần nén
    out = gop_doan(truoc, moi) if truoc else moi
    out['tom_tat']['_doan'] = {'tx': tx, 'truoc': truoc}
    return out


def ten_file(log):
    t = log['tom_tat'].get('bat_dau') or datetime.datetime.now(datetime.timezone.utc).isoformat()
    try:
        ngay = datetime.datetime.fromisoformat(t.replace('Z', '+00:00')).astimezone(VN).strftime('%Y-%m-%d')
    except ValueError:
        ngay = t[:10]
    return f"phien/{ngay}-{log['tom_tat']['session'][:8]}.json"


def day(path_trong_nhanh, local):
    git('fetch', '-q', '--depth=1', 'origin', f'+refs/heads/{NHANH}:refs/remotes/origin/{NHANH}')
    for _ in range(2):
        base = git('rev-parse', '-q', '--verify', f'refs/remotes/origin/{NHANH}').stdout.strip()
        with tempfile.TemporaryDirectory() as td:
            env = {**os.environ, 'GIT_INDEX_FILE': os.path.join(td, 'index')}
            if base:
                git('read-tree', base, env=env)
            blob = git('hash-object', '-w', local).stdout.strip()
            git('update-index', '--add', '--cacheinfo', f'100644,{blob},{path_trong_nhanh}', env=env)
            tree = git('write-tree', env=env).stdout.strip()
        if base and git('rev-parse', f'{base}^{{tree}}').stdout.strip() == tree:
            return True
        msg = f'LOG · {os.path.basename(path_trong_nhanh)}'
        cenv = {**os.environ, 'GIT_AUTHOR_NAME': 'Home247 log', 'GIT_AUTHOR_EMAIL': 'log@home247.local',
                'GIT_COMMITTER_NAME': 'Home247 log', 'GIT_COMMITTER_EMAIL': 'log@home247.local'}
        commit = git('commit-tree', tree, *(['-p', base] if base else []), '-m', msg, env=cenv).stdout.strip()
        if git('push', '-q', 'origin', f'{commit}:refs/heads/{NHANH}').returncode == 0:
            git('update-ref', f'refs/remotes/origin/{NHANH}', commit)
            return True
        git('fetch', '-q', '--depth=1', 'origin', f'+refs/heads/{NHANH}:refs/remotes/origin/{NHANH}')
    return False


def main():
    tay = '--day' in sys.argv
    try:
        data = {} if tay else json.load(sys.stdin)
    except ValueError:
        data = {}
    sid, tpath, su_kien = data.get('session_id'), data.get('transcript_path'), data.get('hook_event_name', '')
    if tay or not tpath:
        ds = sorted(glob.glob(os.path.expanduser('~/.claude/projects/*/*.jsonl')), key=os.path.getmtime)
        if not ds:
            return
        tpath = ds[-1]
        sid = os.path.basename(tpath)[:-6]
    thu_muc = os.path.join(git('rev-parse', '--git-dir').stdout.strip() or os.path.join(ROOT, '.git'), 'home247-log')
    if not os.path.isabs(thu_muc):
        thu_muc = os.path.join(ROOT, thu_muc)
    os.makedirs(thu_muc, exist_ok=True)
    cu, cu_file = None, sorted(glob.glob(os.path.join(thu_muc, f'*-{sid[:8]}.json')))
    if cu_file:
        try:
            cu = json.load(open(cu_file[0], encoding='utf-8'))
        except ValueError:
            cu = None
    log = noi_voi_log_cu(cu, tao_log(sid, tpath))
    ten = ten_file(log)
    local = os.path.join(thu_muc, os.path.basename(ten))
    with open(local, 'w', encoding='utf-8') as f:
        json.dump(log, f, ensure_ascii=False, indent=1)
    dau = os.path.join(thu_muc, '.lan-day-truoc')
    try:
        truoc = float(open(dau).read())
    except (OSError, ValueError):
        truoc = 0
    if tay or su_kien == 'SessionEnd' or time.time() - truoc > DAY_SAU:
        if day(ten, local):
            open(dau, 'w').write(str(time.time()))
            if tay:
                print(f'Đã đẩy log lên nhánh {NHANH}: {ten}')


if __name__ == '__main__':
    try:
        main()
    except Exception as e:  # log không bao giờ được chặn việc chính
        if '--day' in sys.argv:
            print(f'ghi-log-phien: lỗi {e}', file=sys.stderr)
    sys.exit(0)
