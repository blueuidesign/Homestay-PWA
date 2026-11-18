#!/usr/bin/env bash
# EN55 · Hook PreToolUse trước lệnh gộp PR (gh pr merge, gh api .../merge) (.claude/settings.json).
# Đọc check run của commit đầu PR qua gh api. Không có lượt CI thành công thì chặn (exit 2).
# Không gọi được GitHub thì cũng chặn và nói lý do (thà chặn nhầm còn hơn gộp khi chưa biết CI).
# Bỏ kiểm: mở Claude Code với biến môi trường HOME247_BO_KIEM_CI=1, chỉ khi Tùng cho phép.
# Biến này đọc từ môi trường của Claude Code, không nhận khi ghi kèm trong lệnh.
INPUT="$(cat)"
export INPUT
exec python3 - <<'PY'
import json, os, re, shlex, subprocess, sys

def chan(ly_do):
    print(f'Chặn gộp PR: {ly_do}\n'
          'Gộp khi CI (workflow kiem) đã xanh trên commit mới nhất của PR. '
          'Bỏ kiểm chỉ khi Tùng cho phép: mở Claude Code với HOME247_BO_KIEM_CI=1.', file=sys.stderr)
    sys.exit(2)

def gh(cwd, *a):
    try:
        r = subprocess.run(['gh', *a], capture_output=True, text=True, timeout=15, cwd=cwd)
    except (OSError, subprocess.TimeoutExpired) as e:
        chan(f'không gọi được gh ({e.__class__.__name__}: {e})')
    if r.returncode != 0:
        chan(f'gh {" ".join(a[:2])} lỗi: {(r.stderr or r.stdout).strip()[:300]}')
    return r.stdout

d = json.loads(os.environ.get('INPUT') or '{}')
cmd = (d.get('tool_input') or {}).get('command', '')
cwd = d.get('cwd') or os.environ.get('CLAUDE_PROJECT_DIR') or os.getcwd()
if os.environ.get('HOME247_BO_KIEM_CI') == '1':
    print(json.dumps({'hookSpecificOutput': {'hookEventName': 'PreToolUse',
          'additionalContext': 'HOME247_BO_KIEM_CI=1: bỏ kiểm CI khi gộp. Chỉ dùng khi Tùng cho phép; ghi vào Nhật ký item.'}},
          ensure_ascii=False))
    sys.exit(0)

prs = []   # (repo "owner/repo" hoặc "{owner}/{repo}", số PR | nhánh | '')
for seg in re.split(r'&&|\|\||;|\n|\|', cmd):
    try:
        tok = shlex.split(seg)
    except ValueError:
        continue
    while tok and re.match(r'^[A-Za-z_][A-Za-z0-9_]*=', tok[0]):
        tok = tok[1:]
    if len(tok) >= 3 and tok[:3] == ['gh', 'pr', 'merge']:
        pos, i, rest, repo = [], 0, tok[3:], '{owner}/{repo}'
        while i < len(rest):
            t = rest[i]
            if t in ('-R', '--repo') and i + 1 < len(rest):
                repo = re.sub(r'^(https://)?github\.com/', '', rest[i + 1])
                i += 2
                continue
            if t in ('-b', '--body', '-F', '--body-file', '-t', '--subject', '-A', '--author-email', '--match-head-commit'):
                i += 2
                continue
            if not t.startswith('-'):
                pos.append(t)
            i += 1
        x = pos[0] if pos else ''
        m = re.search(r'github\.com/([^/]+/[^/]+)/pull/(\d+)', x)
        prs.append((m.group(1), m.group(2)) if m else (repo, x.lstrip('#')))
    elif len(tok) >= 2 and tok[:2] == ['gh', 'api'] and any(re.search(r'/merge\b', t) for t in tok):
        m = next((re.search(r'repos/([^/]+/[^/]+)/pulls/(\d+)/merge', t) for t in tok
                  if re.search(r'repos/([^/]+/[^/]+)/pulls/(\d+)/merge', t)), None)
        if not m:
            chan('lệnh gh api gộp không rõ số PR (cần dạng repos/<chủ>/<repo>/pulls/<số>/merge)')
        prs.append((m.group(1), m.group(2)))

if not prs:
    sys.exit(0)

# Chỉ dùng REST: phiên Claude Code trên cloud không gọi được GraphQL (gh pr view).
for repo, pr in prs:
    if not pr.isdigit():
        nhanh = pr or subprocess.run(['git', '-C', cwd, 'rev-parse', '--abbrev-ref', 'HEAD'],
                                     capture_output=True, text=True).stdout.strip()
        chu = repo.split('/')[0] if not repo.startswith('{') else json.loads(gh(cwd, 'api', 'repos/{owner}/{repo}'))['owner']['login']
        ds = json.loads(gh(cwd, 'api', f'repos/{repo}/pulls?state=open&head={chu}:{nhanh}'))
        if not ds:
            chan(f'không tìm thấy PR đang mở của nhánh {nhanh}')
        pr = str(ds[0]['number'])
    v = json.loads(gh(cwd, 'api', f'repos/{repo}/pulls/{pr}'))
    so, sha = v['number'], v['head']['sha']
    runs = json.loads(gh(cwd, 'api', f'repos/{repo}/commits/{sha}/check-runs?per_page=100')).get('check_runs', [])
    if not runs:
        chan(f'PR #{so} (commit {sha[:7]}) chưa có lượt CI nào')
    dang = [r['name'] for r in runs if r.get('status') != 'completed']
    hong = [f"{r['name']} ({r.get('conclusion')})" for r in runs
            if r.get('status') == 'completed' and r.get('conclusion') not in ('success', 'skipped', 'neutral')]
    if hong:
        chan(f'PR #{so} (commit {sha[:7]}) có CI hỏng: ' + ', '.join(hong))
    if dang:
        chan(f'PR #{so} (commit {sha[:7]}) CI chưa chạy xong: ' + ', '.join(dang))
    if not any(r.get('conclusion') == 'success' for r in runs):
        chan(f'PR #{so} (commit {sha[:7]}) không có lượt CI thành công')
sys.exit(0)
PY
