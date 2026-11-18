#!/usr/bin/env bash
# EN55 · Hook PreToolUse trước "git push" (.claude/settings.json).
# - Đẩy lên main mà commit chạm src/, tests/ (trừ tests/kb/), docs/process/, CLAUDE.md, .claude/, .github/,
#   hoặc đổi dòng trang_thai: của YC, QT, QD thì chặn (exit 2): dùng nhánh <mã>-<tên-ngắn> và PR (CL4.7).
# - Luôn chạy scripts/kiem.py (chỉ cảnh báo) trên các file đổi và đưa kết quả cho Claude.
# Đầu vào: JSON của Claude Code trên stdin (tool_input.command, cwd). Không đọc .env.
INPUT="$(cat)"
export INPUT
exec python3 - <<'PY'
import json, os, re, shlex, subprocess, sys

CHAN = ('src/', 'tests/', 'docs/process/', 'CLAUDE.md', '.claude/', '.github/')
# Kết quả test tay (skill test-tay) đẩy thẳng main được (CL4.7 mục 2).
KHONG_CHAN = ('tests/kb/',)
TT_DIR = ('docs/product/requirements/', 'docs/product/rules/', 'docs/decisions/')


def git(cwd, *a):
    r = subprocess.run(['git', '-C', cwd, *a], capture_output=True, text=True, timeout=10)
    return r.stdout.strip() if r.returncode == 0 else None


def cac_lenh(cmd):
    """Tách lệnh ghép thành từng lệnh, giữ thư mục khi gặp cd."""
    for seg in re.split(r'&&|\|\||;|\n|\|', cmd):
        try:
            tok = shlex.split(seg)
        except ValueError:
            continue
        while tok and re.match(r'^[A-Za-z_][A-Za-z0-9_]*=', tok[0]):
            tok = tok[1:]
        if tok:
            yield tok


def phan_tich_push(tok, cwd):
    """tok bắt đầu sau 'push'. Trả [(nguồn, đích)] và tên remote."""
    co_gia_tri = {'-o', '--push-option', '--repo', '--receive-pack', '--exec'}
    pos, tat_ca = [], False
    i = 0
    while i < len(tok):
        t = tok[i]
        if t in co_gia_tri:
            i += 2
            continue
        if t in ('--all', '--mirror', '--branches'):
            tat_ca = True
        elif not t.startswith('-'):
            pos.append(t)
        i += 1
    cur = git(cwd, 'rev-parse', '--abbrev-ref', 'HEAD') or 'HEAD'
    up = git(cwd, 'rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{upstream}')  # origin/main
    remote = pos[0] if pos else (up.split('/', 1)[0] if up else 'origin')
    cap = []
    if tat_ca:
        cap.append(('main', 'main'))
    if len(pos) <= 1 and not tat_ca:
        dich = up.split('/', 1)[1] if up and up.startswith(remote + '/') else cur
        cap.append((cur, dich))
    for r in pos[1:]:
        r = r.lstrip('+')
        src, sep, dst = r.partition(':')
        if not sep:
            dst = cur if src == 'HEAD' else src
        src = src or 'HEAD'
        cap.append((src.replace('refs/heads/', ''), dst.replace('refs/heads/', '')))
    return remote, cap


def main():
    d = json.loads(os.environ.get('INPUT') or '{}')
    cmd = (d.get('tool_input') or {}).get('command', '')
    cwd = d.get('cwd') or os.environ.get('CLAUDE_PROJECT_DIR') or os.getcwd()
    chan, bao = [], []
    for tok in cac_lenh(cmd):
        if tok[0] == 'cd' and len(tok) > 1:
            cwd = os.path.join(cwd, os.path.expanduser(tok[1]))
            continue
        if tok[0] != 'git':
            continue
        j, dir_git = 1, cwd
        while j < len(tok) and tok[j].startswith('-'):
            if tok[j] == '-C' and j + 1 < len(tok):
                dir_git = os.path.join(cwd, tok[j + 1])
                j += 2
            else:
                j += 1
        if j >= len(tok) or tok[j] != 'push':
            continue
        goc = git(dir_git, 'rev-parse', '--show-toplevel')
        if not goc or not os.path.exists(os.path.join(goc, 'scripts/kiem.py')):
            continue
        remote, cap = phan_tich_push(tok[j + 1:], dir_git)
        for src, dst in cap:
            if src.startswith(':') or not git(goc, 'rev-parse', '--verify', '-q', src + '^{commit}'):
                if dst == 'main':
                    chan.append(f'lệnh đẩy "{src}" lên main không xác định được commit')
                continue
            base = git(goc, 'merge-base', src, f'{remote}/main') or git(goc, 'rev-parse', src + '~1')
            if not base:
                continue
            files = [f for f in (git(goc, 'diff', '--name-only', base, src) or '').split('\n') if f]
            if dst == 'main':
                cham = sorted({f for f in files if f.startswith(CHAN) and not f.startswith(KHONG_CHAN)})
                tt = git(goc, 'diff', '-U0', base, src, '--', *TT_DIR) or ''
                tt_files = sorted({m for m in re.findall(r'^\+\+\+ b/(.*)$', tt, re.M)
                                   if re.search(r'^[+-]trang_thai:', git(goc, 'diff', '-U0', base, src, '--', m) or '', re.M)})
                if cham:
                    chan.append('commit chạm ' + ', '.join(cham[:8]) + (' ...' if len(cham) > 8 else ''))
                if tt_files:
                    chan.append('commit đổi trang_thai của ' + ', '.join(tt_files))
            md = [f for f in files if f.endswith('.md') and os.path.exists(os.path.join(goc, f))]
            if md:
                r = subprocess.run([sys.executable, os.path.join(goc, 'scripts/kiem.py'), '--diff', base, '--dau', src, *md],
                                   capture_output=True, text=True, cwd=goc, timeout=20)
                out = r.stdout.strip()
                if out and 'không có lỗi' not in out:
                    bao.append(out)
    if chan:
        print('Chặn đẩy lên main: ' + '; '.join(chan) + '.\n'
              'Dùng nhánh <mã>-<tên-ngắn> và PR (CL4.7): git switch -c <mã>-<tên-ngắn>, đẩy nhánh, mở PR.',
              file=sys.stderr)
        if bao:
            print('\nkiem.py (cảnh báo):\n' + '\n'.join(bao), file=sys.stderr)
        sys.exit(2)
    if bao:
        print(json.dumps({'hookSpecificOutput': {'hookEventName': 'PreToolUse',
                                                 'additionalContext': 'kiem.py (chỉ cảnh báo, không chặn):\n' + '\n'.join(bao)}},
                         ensure_ascii=False))
    sys.exit(0)


main()
PY
